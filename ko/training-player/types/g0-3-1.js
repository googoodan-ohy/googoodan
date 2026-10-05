/* 묶음 0-3-1 — 곱셈구구 단별 훈련 (2단·5단 ~ 곱셈구구에서 빠진 수 찾기), 21유형
 *
 * 이 파일 하나에 이 묶음의 유형 정의·문제 생성·전용 서식을 모두 담는다. 공용 파일
 * (sheet.js, formats-*.js, gen-bridge.js, catalog.js)은 고치지 않고 이미 열려 있는
 * 등록 지점만 쓴다.
 *   Sheet.register(key, render)            격자 서식(가로셈·빈칸 식·오류 고치기)
 *   MatchingSheet.formats[key] = {...}     한 쪽 단위 서식(곱셈구구 표·계산 결과 연결하기)
 *   SheetGen.generate 감싸기               이 묶음 typeId의 문제 생성(gen-bridge와 같은 방식)
 *
 * Generation rules: reuse multiply-one, then filter by the concept's facts.
 * Large fact pools stay unique. For a small pool, fill the page with balanced,
 * seeded, shuffled cycles (layout-rules section 6). No identical facts touch
 * horizontally or vertically. Other worksheet formats keep their own rules.
 */
(function (root) {
  'use strict';

  /* ---------------------------------------------------------------- 공통 도구 */
  const node = (tag, cls, value) => {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (value != null) el.textContent = value;
    return el;
  };
  const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function random(seed) {
    let state = (Number(seed) >>> 0) || 1;
    return () => {
      state += 0x6D2B79F5;
      let t = state;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function shuffle(list, rnd) {
    const out = list.slice();
    for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); const t = out[i]; out[i] = out[j]; out[j] = t; }
    return out;
  }
  const factKey = f => f.a + '×' + f.b;
  const easyFact = f => f.a < 2 || f.b < 2;                 // 0·1이 들어가는 쉬운 문제
  const factOf = (a, b) => ({ a, b, op: '×', answer: a * b });
  /** 유형마다 다른 문제가 나오게 config.seed 에 typeId 를 섞는다(같은 유형·같은 seed면 같은 문제).
   *  이렇게 해야 같은 개념의 t1·t2·t3 와 개념이 다른 0-3-1-5-t2·0-3-1-6-t1 이 같은 문제를 내지 않는다. */
  function typeSeed(config) {
    const text = String((config && config.typeId) || '');
    let hash = 0x811C9DC5;
    for (let i = 0; i < text.length; i++) { hash ^= text.charCodeAt(i); hash = Math.imul(hash, 0x01000193); }
    return (((Number(config && config.seed) >>> 0) || 1) ^ hash) >>> 0;
  }
  /** 수 뒤에 붙는 주격 조사 '은/는' (56은 8의 7배, 24는 6의 4배). */
  const subjectParticle = value => (value % 10 === 0 || ![2, 4, 5, 9].includes(value % 10)) ? '은' : '는';

  /* ---------------------------------------------------------- 개념이 정하는 조건 */
  // 표의 단(tables) 또는 곱하는 수(factors). 0-3-1-4만 '곱하는 수가 1이나 0'인 개념이라
  // 0 × 5 와 5 × 0 을 모두 그 개념의 문제로 본다.
  const CONCEPTS = {
    // '2단·5단'은 교육과정 곱셈구구 항목 이름 그대로다(10단은 이 항목에 없다).
    '0-3-1-0': { name: '2단·5단', short: '2·5단', tables: [2, 5] },
    '0-3-1-1': { name: '3단·4단', short: '3·4단', tables: [3, 4] },
    '0-3-1-2': { name: '6단·7단', short: '6·7단', tables: [6, 7] },
    '0-3-1-3': { name: '8단·9단', short: '8·9단', tables: [8, 9] },
    '0-3-1-4': { name: '1과 0의 곱셈', short: '1과 0', factors: [0, 1] },
    // mixed: 여러 단을 섞는 개념이라 곱하는 수 1인 문제(너무 쉬운 문제)는 넣지 않는다(§2: 0·1 문제는 10% 이하).
    '0-3-1-5': { name: '곱셈구구 섞어 연습하기', tables: [2, 3, 4, 5, 6, 7, 8, 9], mixed: true },
    '0-3-1-6': { name: '곱셈구구에서 빠진 수 찾기', tables: [2, 3, 4, 5, 6, 7, 8, 9], mixed: true }
  };
  function conceptFacts(conceptId) {
    const concept = CONCEPTS[conceptId];
    if (!concept) throw Error('알 수 없는 개념: ' + conceptId);
    const out = [], seen = new Set();
    const push = (a, b) => { const key = a + '×' + b; if (seen.has(key)) return; seen.add(key); out.push(factOf(a, b)); };
    if (concept.factors) {
      for (let n = 0; n <= 9; n++) { push(0, n); push(n, 0); push(1, n); push(n, 1); }
    } else {
      const from = concept.mixed ? 2 : 1;
      for (const dan of concept.tables) for (let b = from; b <= 9; b++) push(dan, b);
    }
    return out;
  }
  const difficulty = f => f.answer * 100 + f.a * 10 + f.b;
  /* 단 문제는 곱하는 수를 먼저, 단을 나중에 → 한 열이 한 단이 된다(2×1 5×1 / 2×2 5×2 / …).
   * gen.order === 'difficulty' 면 곱이 작은 것부터(쉬운 것 → 어려운 것) — 2~9단 64사실을 거의 다
   * 싣는 0-3-1-6-t1 이 같은 사실 풀을 쓰는 0-3-1-5-t1·t2 와 같은 자리에 같은 식을 놓지 않게 한다. */
  function orderFacts(facts, conceptId, mode) {
    const concept = CONCEPTS[conceptId];
    const out = facts.slice();
    if (mode === 'difficulty') return out.sort((x, y) => difficulty(x) - difficulty(y));
    return out.sort((x, y) => concept.factors
      ? difficulty(x) - difficulty(y)
      : (x.b - y.b) || (x.a - y.a));
  }

  /* -------------------------------------- 기존 생성기를 먼저 쓰고 모자라면 더 뽑는다 */
  const ALLOWED = new Map();
  function allowedOf(conceptId) {
    if (!ALLOWED.has(conceptId)) ALLOWED.set(conceptId, new Set(conceptFacts(conceptId).map(factKey)));
    return ALLOWED.get(conceptId);
  }
  function drawLegacy(conceptId, seed, want) {
    const allowed = allowedOf(conceptId), out = [], seen = new Set();
    if (!root.Worksheets || typeof root.Worksheets.generate !== 'function') return out;
    for (let batch = 0; batch < 400 && out.length < want; batch++) {
      let rows;
      try { rows = root.Worksheets.generate('multiply-one', (Number(seed) + batch * 104729) >>> 0, 16); }
      catch (error) { break; }
      for (const row of rows || []) {
        const a = Number(row.a), b = Number(row.b);
        if (!Number.isInteger(a) || !Number.isInteger(b)) continue;
        const key = a + '×' + b;
        if (!allowed.has(key) || seen.has(key)) continue;      // 개념 조건에 맞는 문제만 남긴다
        seen.add(key); out.push(factOf(a, b));
        if (out.length === want) break;
      }
    }
    return out;
  }
  // 사실 수가 적은 단별 가로셈은 전체 사실을 고르게 반복한다. 각 바퀴를 섞되
  // 바로 옆(같은 줄)과 바로 아래(같은 열)에 같은 식이 놓이지 않게 한다.
  function repeatFacts(pool, count, cols, seed, concept) {
    const rnd = random(seed ^ 0x67452301);
    const out = [];
    while (out.length < count) {
      let cycle, valid = false;
      for (let attempt = 0; attempt < 1000; attempt++) {
        cycle = [];
        // Keep each cycle broadly easy to hard, while changing the order of
        // facts at the same level on every pass through the small pool.
        const level = f => concept.factors ? f.answer : f.b;
        for (let from = 0; from < pool.length;) {
          let to = from + 1;
          while (to < pool.length && level(pool[to]) === level(pool[from])) to++;
          cycle.push(...shuffle(pool.slice(from, to), rnd));
          from = to;
        }
        const take = Math.min(pool.length, count - out.length);
        valid = true;
        for (let i = 0; i < take; i++) {
          const pos = out.length + i;
          const key = factKey(cycle[i]);
          const neighbor = at => at < out.length ? out[at] : cycle[at - out.length];
          if ((pos % cols && key === factKey(neighbor(pos - 1))) ||
              (pos >= cols && key === factKey(neighbor(pos - cols)))) { valid = false; break; }
        }
        if (valid) break;
      }
      if (!valid) throw Error('곱셈구구 반복 배열을 만들지 못했습니다.');
      out.push(...cycle.slice(0, Math.min(pool.length, count - out.length)));
    }
    return out;
  }
  /** 이 묶음의 문제 목록: 기존 생성기 → 조건 여과 → 보충 → 필요한 경우 고른 반복. */
  function buildFacts(config) {
    const conceptId = config.gen && config.gen.conceptId;
    const count = config.count || config.cols * config.rows;
    const pool = conceptFacts(conceptId);
    const seed = typeSeed(config);
    const picked = [], seen = new Set();
    for (const f of drawLegacy(conceptId, seed, count)) { seen.add(factKey(f)); picked.push(f); }
    const rest = shuffle(pool.filter(f => !seen.has(factKey(f))), random(seed ^ 0x9E3779B9));
    const easyLimit = Math.floor(count * 0.1);                  // §2: 0·1이 들어가는 문제는 10% 이하
    let easyCount = picked.filter(easyFact).length;
    for (const easyPass of [false, true]) {                     // 어려운 문제를 먼저 채우고 쉬운 문제는 뒤에
      for (const f of rest) {
        if (picked.length >= count) break;
        if (seen.has(factKey(f))) continue;
        const easy = easyFact(f);
        if (easy !== easyPass) continue;
        if (easy && easyCount >= easyLimit && pool.length > count) continue;
        seen.add(factKey(f)); picked.push(f); if (easy) easyCount++;
      }
    }
    if (picked.length < count && config.format === 'g031-horizontal' && !CONCEPTS[conceptId].mixed && pool.length < count) {
      return repeatFacts(orderFacts(picked, conceptId), count, config.cols, seed, CONCEPTS[conceptId]);
    }
    if (picked.length !== count) throw Error(config.typeId + ': 조건에 맞는 문제 ' + count + '개 중 ' + picked.length + '개만 만들었습니다.');
    return orderFacts(picked, conceptId, (config.gen && config.gen.order) || '');
  }

  /* ------------------------------------------------------------ 이 묶음용 CSS */
  function installCss() {
    if (document.getElementById('g031-style')) return;
    const style = node('style');
    style.id = 'g031-style';
    style.textContent = [
      '.g031-caption{height:5mm;font-size:9pt;font-weight:bold;line-height:1;}',
      '.g031-table{flex:1;min-height:0;display:grid;border-top:1px solid #999;border-left:1px solid #999;font-variant-numeric:tabular-nums;}',
      'body[data-format="g031-table"] .mt-body{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));grid-auto-rows:minmax(0,1fr);gap:3mm;}',
      'body[data-format="g031-table"] .mt-block{min-width:0;min-height:0;}',
      '.g031-tcell{display:flex;align-items:center;justify-content:center;min-width:0;min-height:0;overflow:hidden;border-right:1px solid #999;border-bottom:1px solid #999;padding:0 1mm;white-space:nowrap;}',
      '.g031-tcell.g031-head{background:#f2f2f2;font-size:10pt;}',
      // 곱셈구구 표의 식·곱 숫자는 칸이 넉넉하므로 두 배로 키운다(정답 칸 안의 빨간 글씨도 같은 크기).
      '.g031-tcell:not(.g031-head){font-size:2em;}',
      '.answer-page .g031-tcell [class],.answer-page .g031-tcell.ans-fill{font-size:1em !important;}',
      '.g031-tcell.g031-product{justify-content:flex-start;padding-left:3mm;}',
      '.g031-ink{color:#d71f10;}',
      // 칸 아래 여백 4mm(§5): 아래쪽에 그만큼 자리를 잡아 두면 자동 맞춤(fits)이 그 여백을 남기고 줄 수를 멈춘다.
      '.g031-two{position:absolute;left:0;right:0;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1.2mm;line-height:1.35;padding-bottom:0;}',
      '.g031-two .horizontal{gap:.5mm;justify-content:center;align-items:center;}',
      '.g031-check{font-size:1em;}',   // 두 줄의 글자 크기·색을 같게 한다
      '.g031-blankbox{display:inline-block;box-sizing:border-box;min-width:10mm;height:1.5em;line-height:calc(1.5em - 2px);border:1px solid #555;vertical-align:middle;text-align:center;}',
      '.g031-wrong{font-size:1.05em;font-variant-numeric:tabular-nums;}',
      '.g031-fix{display:flex;align-items:baseline;gap:1.5mm;margin-top:1.5mm;}',
      '.g031-write{display:inline-block;min-width:18mm;height:1.15em;border-bottom:1px solid #555;}',
      '.g031-vertical{width:2.6em;margin:1mm auto 0;text-align:right;font-variant-numeric:tabular-nums;}',
      '.g031-vertical div{height:1.15em;line-height:1.15;}',
      '.g031-vertical .g031-rule{border-bottom:1px solid #333;}',
      '.g031-vertical .g031-product{border-bottom:1px solid #555;height:1.35em;}',
      '.g031-error-pair{position:absolute;inset:2mm 3mm;display:grid;grid-template-columns:1fr 1fr;gap:2mm;align-items:center;}',
      '.g031-error-pair .g031-vertical{margin:0 auto;width:2.6em;}',
      '.g031-error-label{font-size:.6em;color:#555;text-align:center;margin-bottom:3mm;}',
      '.g031-error-pair .g031-product{height:1.5em;min-height:7mm;border:1px solid #57736a!important;border-radius:1mm;margin-top:1mm;display:flex;align-items:center;justify-content:center;box-sizing:border-box;background:white;}',
      '.g031-note{font-size:8pt;color:#777;margin-top:1mm;}',
      // 유형 이름이 길어 머리말에서 잘리지 않도록, 이 묶음 서식일 때만 머리말을 조금 작게 쓴다.
      'body[data-format^="g031-"] .sheet-head,body[data-format^="g031-"] .sheet-title{font-size:9pt;}',
      // 2학년 구구단 문제지는 한 칸이 크다. 식을 칸 가운데에 놓아 아래쪽 빈 공간이 생기지 않게 한다.
      '.g031-line{position:absolute;left:6mm;right:1mm;top:50%;transform:translateY(-50%);display:flex;align-items:center;gap:1.5mm;white-space:nowrap;}',
      // 답을 손으로 쓸 수 있도록 가로식에 답칸을 확보한다.
      '.g031-line .answer-space{min-width:14mm;height:1.55em;font-size:1.1em;border-bottom:1px solid #555;}',
      // 연결 문제지: 왼쪽 42% · 오른쪽 58% 자리에 ○를 두고 가운데는 선을 긋는 자리로 비워 둔다.
      '.g031-pairs{position:absolute;inset:0;display:grid;grid-template-columns:42% 16% 42%;}',
      // 공용 서식의 .mt-pair{overflow:hidden}(formats-matching.js)은 열 경계에 놓인 ○를 반원으로
      // 잘라 낸다(정답선도 잘린 단면에서 시작해 ○와 떨어져 보인다). ○ 중심(42%·58%)과 정답선
      // 끝점(420·580)은 그대로 두고, 이 묶음에서만 잘리지 않게 되돌린다.
      '.g031-pairs .mt-pair{overflow:visible;}',
      // 두 줄 문항: 아래 여백 3.5mm 를 위·아래 1.75mm 로 나눠 상자 높이(자동 맞춤 조건)와 줄 수는
      // 그대로 두고 내용만 칸 가운데로 온다(칸 위 테두리에 붙던 첫 줄이 내려온다).
      '.g031-two.g031-two-mid{padding-top:0;padding-bottom:0;}'
    ].join('');
    document.head.append(style);
  }

  /* --------------------------------------- 서식 1: 곱셈구구 표 채우기(한 단이 한 표) */
  function buildDanTables(config) {
    const concept = CONCEPTS[config.gen && config.gen.conceptId];
    const dans = concept.factors || concept.tables;
    const first = concept.factors ? 0 : 1;
    const rnd = random(typeSeed(config));
    const pool = [];
    for (const dan of dans) for (let b = first; b <= 9; b++) pool.push({ dan, b });
    // 지정 범위의 구구단을 고르게 반복 연습: 3열 × 13문항 = 39문항.
    const questions = [];
    while (questions.length < 39) questions.push(...shuffle(pool.slice(), rnd).slice(0, 39 - questions.length));
    const items = [];
    for (let col = 0; col < 3; col++) {
      const cells = [{ v: '곱셈식', head: true, row: 0 }, { v: '곱', head: true, row: 0 }];
      questions.slice(col * 13, (col + 1) * 13).forEach(({ dan, b }, index) => {
        cells.push({ v: dan + ' × ' + b + ' =', row: index + 1 });
        cells.push({ v: String(dan * b), row: index + 1, product: true, blank: true });
      });
      items.push({ kind: 'table', caption: concept.name, columns: 'minmax(0,2fr) minmax(0,1fr)', rows: 14, cells, rowsWeight: 14 });
    }
    return { items, layout: { cols: 1, rows: 3, count: 3 }, blanks: 39 };
  }
  function renderDanTable(item, isAnswer) {
    installCss();
    const grid = node('div', 'g031-table');
    grid.style.gridTemplateColumns = item.columns;
    grid.style.gridTemplateRows = 'repeat(' + item.rows + ', minmax(0, 1fr))';
    for (const cell of item.cells) {
      const cls = ['g031-tcell'];
      if (cell.head) cls.push('g031-head');
      if (cell.product) cls.push('g031-product');
      const box = node('div', cls.join(' '));
      if (cell.blank) box.innerHTML = isAnswer ? '<span class="g031-ink">' + esc(cell.v) + '</span>' : '';
      else box.textContent = String(cell.v);
      grid.append(box);
    }
    return grid;
  }

  /* -------------------------------- 서식 2: 곱이 같은 식 연결하기(한 묶음 = 한 세트) */
  /** 묶음마다 곱이 겹치지 않게 (식, 곱) 짝을 고른다. 한 식은 한 장에서 한 번만 쓴다.
   *  곱이 같은 식(1×2와 2×1, 0×3과 3×0 …)은 서로 다른 묶음으로 돌려 보낸다. */
  function pairBundles(config) {
    const conceptId = config.gen && config.gen.conceptId;
    const facts = shuffle(conceptFacts(conceptId), random(typeSeed(config)));
    const groups = new Map();                                    // 곱 → 그 곱이 나오는 식들
    for (const f of facts) {
      if (!groups.has(f.answer)) groups.set(f.answer, []);
      groups.get(f.answer).push(f);
    }
    // 2단 × 3줄 = 6묶음(묶음당 4문제)을 먼저 시도하고, 식이 모자라면 묶음당 3문제로 묶음 수를 줄인다.
    for (const [count, per] of [[6, 4], [8, 3], [7, 3], [6, 3], [5, 3], [4, 3], [3, 4]]) {
      if (per * count > facts.length) continue;
      const bundles = Array.from({ length: count }, () => []);
      let cursor = 0;
      for (const group of groups.values()) {
        for (const f of group) {
          for (let step = 0; step < count; step++) {
            const b = (cursor + step) % count;
            if (bundles[b].length < per && !bundles[b].some(other => other.answer === f.answer)) {
              bundles[b].push(f); cursor = (b + 1) % count;
              break;
            }
          }
        }
      }
      if (bundles.every(b => b.length === per)) return bundles;
    }
    throw Error(config.typeId + ': 연결 묶음을 만들지 못했습니다.');
  }
  const CIRCLED = '①②③④⑤⑥⑦⑧⑨⑩';
  /** 연결 문제지 한 장 — 묶음마다 오른쪽 값의 차례를 섞는다(같은 seed 면 같은 차례). */
  function buildMatch(config) {
    const bundles = pairBundles(config);
    const rnd = random(typeSeed(config) ^ 0x5BF03635);
    const items = bundles.map(facts => {
      const order = shuffle(facts.map((_, index) => index), rnd);
      // 제자리에 남은 짝(고정점)은 그 줄만 가로로 나란한 선이 되어 답을 드러낸다 → 서로 맞바꿔 없앤다.
      for (let i = 0; i < order.length; i++) {
        if (order[i] !== i) continue;
        const j = (i + 1) % order.length;
        const swap = order[i]; order[i] = order[j]; order[j] = swap;
      }
      return { kind: 'bundle', caption: '', pairs: facts, order, rowsWeight: facts.length };
    });
    const count = bundles.reduce((sum, facts) => sum + facts.length, 0);
    return { items, layout: { cols: bundles.length, rows: bundles[0].length, count }, pairs: count };
  }
  /** 연결 한 묶음 — 왼쪽 식은 42% 자리, 오른쪽의 같은 곱인 식은 58% 자리에 두어 ○가 겹치지 않는다.
   *  정답지 연결선(420 → 580)이 두 ○의 한가운데를 그대로 잇는다.
   *  오른쪽 번호는 그 줄의 차례(①②③…)라서 계산하지 않고 번호만 보고 이을 수 없다. */
  function renderMatch(config, item, isAnswer) {
    installCss();
    const count = item.pairs.length, cw = 20;
    const wrap = node('div', 'mt-pairs-wrap mt-compact');       // 동그라미를 글자 바로 옆에 붙인 2단 배치(formats-matching.js 의 compact)
    wrap.style.setProperty('--w', cw + 'mm');
    const grid = node('div', 'mt-pairs');
    grid.style.gridTemplateRows = 'repeat(' + count + ', minmax(0, 1fr))';
    const rowOf = [];
    item.order.forEach((pairIndex, row) => { rowOf[pairIndex] = row; });
    item.pairs.forEach((fact, index) => {
      const left = node('div', 'mt-pair mt-left');
      left.append(node('span', 'mt-idx', (index + 1) + '.'), node('span', 'mt-text', fact.a + ' × ' + fact.b), node('span', 'mt-mark'));
      const right = node('div', 'mt-pair mt-right');
      const mate = item.pairs[item.order[index]];
      right.append(node('span', 'mt-mark'), node('span', 'mt-text', mate.b + ' × ' + mate.a));
      grid.append(left, right);
    });
    wrap.append(grid);
    if (isAnswer) {
      const x1 = ((cw + 7.5) / (2 * cw + 30) * 1000).toFixed(1), x2 = ((cw + 22.5) / (2 * cw + 30) * 1000).toFixed(1);
      const lines = item.pairs.map((_, index) => '<line x1="' + x1 + '" y1="' + ((index + .5) / count * 1000).toFixed(1) +
        '" x2="' + x2 + '" y2="' + ((rowOf[index] + .5) / count * 1000).toFixed(1) + '"/>').join('');
      const svg = node('div', 'mt-lines');
      svg.innerHTML = '<svg viewBox="0 0 1000 1000" preserveAspectRatio="none">' + lines + '</svg>';
      wrap.append(svg);
    }
    return wrap;
  }
  /* ------------------------------------------ 서식 3: 가로셈(한 칸 = 한 문제, 가운데 정렬) */
  function renderHorizontal(cell, question, answer) {
    installCss();
    const line = node('div', 'g031-line');
    line.append(node('span', '', question.a + ' ' + question.op + ' ' + question.b + ' ='));
    line.append(node('span', 'answer-space', answer ? String(question.answer) : ' '));
    cell.append(line);
  }

  /* ------------------------------------ 서식 4: 한 칸에 두 줄(빈칸 + 확인 줄) */
  function renderTwoLine(cell, question, answer) {
    installCss();
    // g031-two-mid: 아래 여백(3.5mm)을 위·아래로 나눠 내용을 칸 가운데로 둔다(설치 CSS 참고).
    const box = node('div', 'g031-two g031-two-mid');
    question.lines.forEach((line, index) => {
      const row = node('div', 'horizontal' + (index ? ' g031-check' : ''));
      if (line.before) row.append(node('span', '', line.before));
      row.append(node('span', 'g031-blankbox', answer ? String(line.answer) : ''));
      if (line.after) row.append(node('span', '', line.after));
      box.append(row);
    });
    cell.append(box);
  }

  /* ---------------------------------------- 서식 5: 잘못된 계산 고치기(곱 오류) */
  function renderErrorFix(cell, question, answer) {
    installCss();
    const pair = node('div', 'g031-error-pair');
    const wrong = node('div');
    wrong.append(node('div', 'g031-error-label', '잘못된 풀이'));
    const wrongCalc = node('div', 'g031-vertical');
    wrongCalc.append(node('div', '', String(question.a)), node('div', 'g031-rule', '× ' + question.b), node('div', 'g031-wrong', String(question.wrong)));
    wrong.append(wrongCalc);
    const corrected = node('div');
    corrected.append(node('div', 'g031-error-label', '바른 풀이'));
    const correctCalc = node('div', 'g031-vertical');
    correctCalc.append(node('div', '', String(question.a)), node('div', 'g031-rule', '× ' + question.b));
    correctCalc.append(node('div', 'g031-product' + (answer ? ' g031-ink' : ''), answer ? String(question.answer) : ' '));
    corrected.append(correctCalc);
    pair.append(wrong, corrected);
    cell.append(pair);
  }

  /* -------------------------------------------------------- 서식별 문제 만들기 */
  function wrongProduct(f, rnd) {
    const options = [];
    for (const [a, b] of [[f.a - 1, f.b], [f.a + 1, f.b], [f.a, f.b - 1], [f.a, f.b + 1]]) {
      if (a < 1 || b < 1 || a > 9 || b > 9) continue;
      const value = a * b;
      // 틀린 값이 요인과 같으면(2 × 2 = 2) 계산을 틀린 것으로 보기 어려우므로 뺀다.
      if (value === f.answer || value === f.a || value === f.b || options.includes(value)) continue;
      options.push(value);
    }
    if (!options.length) return f.answer + 1;
    return options[Math.floor(rnd() * options.length)];
  }
  const MASKS = { factor: [0, 1], all: [0, 1, 2] };
  function generateFor(config) {
    const gen = config.gen || {};
    const count = config.count || config.cols * config.rows;
    const facts = buildFacts(config);
    const seed = typeSeed(config);
    if (gen.kind === 'blank') {                                 // 빈칸 식: 빈 곳을 돌려 가며
      const masks = MASKS[gen.mask] || MASKS.all;
      const offset = seed % masks.length;                        // 유형마다 빈 자리도 달라지게
      const out = [];
      for (let round = 0; round < masks.length && out.length < count; round++) {
        for (let i = 0; i < facts.length && out.length < count; i++) {
          out.push(Object.assign({}, facts[i], { mask: masks[(i + round + offset) % masks.length] }));
        }
      }
      if (out.length !== count) throw Error(config.typeId + ': 빈칸 문제 ' + count + '개를 만들지 못했습니다.');
      return out;
    }
    if (gen.kind === 'two-line') {
      const inverse = gen.pairKind === 'inverse';
      // 곱하는 수와 곱해지는 수를 바꾼 짝은 작은 수를 앞에 둔 것만 쓴다(6 × 6 도 뺀다).
      // 쓸 수 있는 짝(2~9단 28개)이 사실 수보다 적어 buildFacts 로 고른 사실 안에서는 모자라므로
      // 이 서식만 개념의 짝에서 바로 가져온다(그래서 이 유형은 seed 를 바꿔도 같은 장이 나온다).
      // 같은 수를 곱한 식은 순서를 바꿔도 두 줄이 같으므로 제외한다.
      // 방향만 바꾼 두 식(2 × 3 / 3 × 2)은 같은 문제이므로 작은 수가 앞에 오는 짝만 한 번씩 쓰고,
      // 어느 식을 윗줄에 둘지는 seed 로 정한다(같은 문제가 두 번 나오지 않는다).
      const flip = random(seed ^ 0x51ED270B);
      const pool = inverse ? facts : conceptFacts(gen.conceptId).filter(f => f.a < f.b).map(f => flip() < 0.5 ? f : factOf(f.b, f.a));
      const out = [], seen = new Set();
      for (const f of pool) {
        if (out.length >= count) break;
        const a = f.a, b = f.b, c = f.answer;                   // 단을 앞에 둔 그 단의 식 그대로
        // 두 줄 빈칸형은 곱하는 수와 곱해지는 수를 바꾼 짝이다(2 × 3 = □ / 3 × 2 = □).
        // 한 줄이 다른 줄의 답을 인쇄하지 않고, 두 줄의 답도 하나로 정해진다.
        if (seen.has(a + '×' + b)) continue;
        seen.add(a + '×' + b);
        const lines = inverse
          ? [{ before: '', answer: a, after: ' × ' + b + ' = ' + c },                                  // 거꾸로 생각해 빈칸을 구하고
             { before: '확인: ' + c + subjectParticle(c) + ' ' + b + '의 ', answer: a, after: '배' }]  // 몇 배인지로 확인한다
          : [{ before: a + ' × ' + b + ' = ', answer: c, after: '' },                                  // 곱하는 수와 곱해지는 수를 바꾼 두 식
             { before: b + ' × ' + a + ' = ', answer: c, after: '' }];
        out.push({ key: factKey(f), lines, answer: inverse ? a : c, fact: f });
      }
      // 쉬운 것부터(곱이 작은 것부터) — 두 줄짜리도 순서를 지킨다.
      out.sort((x, y) => x.fact.answer - y.fact.answer || Math.min(x.fact.a, x.fact.b) - Math.min(y.fact.a, y.fact.b));
      if (out.length !== count) throw Error(config.typeId + ': 문항 ' + count + '개를 만들지 못했습니다.');
      return out;
    }
    if (gen.kind === 'error') {                                 // 곱을 잘못 외운 계산
      const rnd = random(seed ^ 0x27D4EB2F);
      const out = [];
      for (const f of facts) {
        if (out.length >= count) break;
        out.push(Object.assign({}, f, { wrong: wrongProduct(f, rnd), key: factKey(f) }));
      }
      if (out.length !== count) throw Error(config.typeId + ': 오류 문항 ' + count + '개를 만들지 못했습니다.');
      return out;
    }
    if (facts.length < count) throw Error(config.typeId + ': 조건에 맞는 문제가 ' + facts.length + '개뿐입니다(필요 ' + count + '개).');
    return facts.slice(0, count);                               // 가로셈
  }

  /* --------------------------------------------------------------- 유형 목록 */
  const SPECS = [
    // 단별 개념 — 사실 수가 적으므로 전체를 순서를 섞어 고르게 반복한다(§6).
    { typeId: '0-3-1-0-t1', format: 'g031-horizontal', cols: 4, rows: 10, gen: { conceptId: '0-3-1-0' } },
    { typeId: '0-3-1-0-t2', format: 'g031-table', cols: 1, rows: 2, gen: { conceptId: '0-3-1-0' } },
    { typeId: '0-3-1-0-t3', format: 'g031-match', cols: 3, rows: 6, gen: { conceptId: '0-3-1-0' } },
    { typeId: '0-3-1-1-t1', format: 'g031-horizontal', cols: 4, rows: 10, gen: { conceptId: '0-3-1-1' } },
    { typeId: '0-3-1-1-t2', format: 'g031-table', cols: 1, rows: 2, gen: { conceptId: '0-3-1-1' } },
    { typeId: '0-3-1-1-t3', format: 'g031-match', cols: 3, rows: 6, gen: { conceptId: '0-3-1-1' } },
    { typeId: '0-3-1-2-t1', format: 'g031-horizontal', cols: 4, rows: 10, gen: { conceptId: '0-3-1-2' } },
    { typeId: '0-3-1-2-t2', format: 'g031-table', cols: 1, rows: 2, gen: { conceptId: '0-3-1-2' } },
    { typeId: '0-3-1-2-t3', format: 'g031-match', cols: 3, rows: 6, gen: { conceptId: '0-3-1-2' } },
    { typeId: '0-3-1-3-t1', format: 'g031-horizontal', cols: 4, rows: 10, gen: { conceptId: '0-3-1-3' } },
    { typeId: '0-3-1-3-t2', format: 'g031-table', cols: 1, rows: 2, gen: { conceptId: '0-3-1-3' } },
    { typeId: '0-3-1-3-t3', format: 'g031-match', cols: 3, rows: 6, gen: { conceptId: '0-3-1-3' } },
    { typeId: '0-3-1-4-t1', format: 'g031-horizontal', cols: 4, rows: 10, gen: { conceptId: '0-3-1-4' } },
    { typeId: '0-3-1-4-t2', format: 'g031-table', cols: 1, rows: 2, gen: { conceptId: '0-3-1-4' } },
    { typeId: '0-3-1-4-t3', format: 'g031-match', cols: 3, rows: 6, gen: { conceptId: '0-3-1-4' } },
    // 2~9단을 모두 쓰는 유형 — 사실이 64개라 layout-rules §2의 문항 수를 그대로 넘긴다.
    { typeId: '0-3-1-5-t1', format: 'g031-horizontal', cols: 4, rows: 10, gen: { conceptId: '0-3-1-5' } },
    { typeId: '0-3-1-5-t2', format: 'blank-equation', cols: 3, rows: 13, gen: { conceptId: '0-3-1-5', kind: 'blank', mask: 'all' } },
    // 오류 고치기는 틀린 세로 곱셈 아래에 바른 곱을 쓸 칸을 둔다.
    { typeId: '0-3-1-5-t3', format: 'g031-errorfix', cols: 3, rows: 4, gen: { conceptId: '0-3-1-5', kind: 'error' } },
    // 빠진 수 찾기 — 빈칸 자리와 확인 줄을 달리한다. 2~9단 64사실을 거의 다 싣기 때문에
    // 0-3-1-5-t1·t2 와 사실이 겹친다. 정렬만 '곱이 작은 것부터'로 달리해 같은 자리에 같은 식이
    // 오지 않게 한다(실제 인쇄 크기 63문항에서 자리 겹침 2~5/63).
    { typeId: '0-3-1-6-t1', format: 'blank-equation', cols: 3, rows: 13, gen: { conceptId: '0-3-1-6', kind: 'blank', mask: 'factor', order: 'difficulty' } },
    // 두 줄 빈칸형은 같은 수끼리의 식을 빼고 42개의 순서가 다른 식을 쓴다.
    { typeId: '0-3-1-6-t2', format: 'g031-two-line', cols: 3, rows: 10, count: 28, gen: { conceptId: '0-3-1-6', kind: 'two-line' } },
    { typeId: '0-3-1-6-t3', format: 'g031-two-line', cols: 3, rows: 13, gen: { conceptId: '0-3-1-6', kind: 'two-line', pairKind: 'inverse' } }
  ];
  const DAN_TITLES = { t1: '곱셈구구 가로식 계산', t2: '곱셈구구 표 채우기', t3: '곱이 같은 식 연결하기' };
  const MIXED_TITLES = {
    '0-3-1-5': { t1: '연산을 섞은 가로 계산', t2: '빈칸 식으로 섞어 연습하기', t3: '계산 오류 찾아 고치기' },
    '0-3-1-6': { t1: '빈칸이 한 곳인 식 완성하기', t2: '서로 연결된 두 식의 빈칸 채우기', t3: '역연산으로 빈칸을 구하고 확인하기' }
  };
  // 명세(spec-natural.json)의 instruction 과 같은 문구를 쓴다. 0-3-1-6-t2 만 명세가 선 잇기용
  // 문구로 남아 있어 서식과 맞지 않으므로 문제지 문구를 그대로 두었다(명세 쪽 수정 필요).
  const INSTRUCTIONS = {
    'g031-horizontal': '계산하여 답을 쓰세요.',
    'g031-table': '빈칸에 알맞은 수를 써넣으세요.',
    'g031-match': '서로 알맞은 것끼리 선으로 연결하세요.',
    'blank-equation': '빈칸에 알맞은 수를 써넣으세요.',
    'g031-two-line': '빈칸에 알맞은 수를 써넣으세요.',
    'g031-errorfix': '잘못된 곳을 찾아 바르게 고쳐 쓰세요.'
  };
  // 서식 문구와 다른 유형(명세가 서식에 맞게 다르게 적어 둔 것)
  const TYPE_INSTRUCTIONS = {
    '0-3-1-6-t2': '두 식의 빈칸에 알맞은 수를 써넣으세요.'
  };

  /* ------------------------------------------------- 서식 등록(공용 틀을 그대로 씀) */
  if (root.MatchingSheet && root.MatchingSheet.formats) {
    // 곱셈구구 표: 한 쪽에 표 2~3개를 세로로 채운다(칸 수 40개 이상).
    root.MatchingSheet.formats['g031-table'] = {
      page: 'blocks', title: '곱셈구구 표',
      build: buildDanTables,
      render: (config, item, isAnswer) => renderDanTable(item, isAnswer)
    };
    // 계산 결과와 연결하기: 짝 만들기와 그리기를 이 묶음 규칙으로 한다(공용 선 잇기 서식은
    // 오른쪽 ○를 42% 자리에 두고 그 줄의 짝 번호를 찍어 번호만 보고 이을 수 있었다).
    root.MatchingSheet.formats['g031-match'] = {
      page: 'blocks', title: '곱이 같은 식 연결하기',
      build: buildMatch,
      render: (config, item, isAnswer) => renderMatch(config, item, isAnswer)
    };
  }
  if (root.Sheet && typeof root.Sheet.register === 'function') {
    root.Sheet.register('g031-horizontal', renderHorizontal);       // 구구단 가로셈(단별 문제지)
    root.Sheet.register('g031-two-line', renderTwoLine);            // 서로 연결된 두 식 / 역연산과 확인
    root.Sheet.register('g031-errorfix', renderErrorFix);           // 구구단 곱 오류 고치기
  }

  /* --------------------------- 문제 생성 연결(gen-bridge.js 와 같은 방식으로 감싼다) */
  const MINE = new Set(SPECS.map(spec => spec.typeId));
  if (root.SheetGen && typeof root.SheetGen.generate === 'function' && !root.SheetGen.__g031) {
    const original = root.SheetGen.generate;
    root.SheetGen.generate = function (config) {
      if (config && MINE.has(config.typeId)) return generateFor(config);
      return original.apply(this, arguments);
    };
    Object.defineProperty(root.SheetGen, '__g031', { value: true });
  }

  /* ----------------------------------------------------------------- 카탈로그 */
  const FONT_PT = { 'g031-horizontal': 18, 'g031-match': 14, 'g031-errorfix': 18, 'g031-two-line': 14, 'blank-equation': 12 };
  const SHEET_FORMATS = ['g031-horizontal', 'g031-two-line', 'g031-errorfix', 'blank-equation'];
  function entryOf(spec) {
    const conceptId = spec.gen.conceptId, slot = spec.typeId.split('-').pop();
    const concept = CONCEPTS[conceptId];
    return {
      typeId: spec.typeId,
      // 단별 개념은 어느 단을 연습하는지 제목에 밝히고, 섞어 연습·빈칸 찾기는 명세의 제목을 그대로 쓴다.
      // 머리말은 한 줄이라 괄호 안은 짧은 이름(short)을 쓰고 괄호 앞 공백을 빼 정답지에서도 잘리지 않게 한다.
      title: MIXED_TITLES[conceptId] ? MIXED_TITLES[conceptId][slot] : DAN_TITLES[slot] + '(' + (concept.short || concept.name) + ')',
      format: spec.format, cols: spec.cols, rows: spec.rows, count: spec.count || spec.cols * spec.rows,
      // 선행 학습(한 자리 수 곱셈)이라 §2의 15~16pt 중 큰 쪽을 쓴다.
      fontPt: FONT_PT[spec.format] || 12, seed: 20261001,
      autoFit: SHEET_FORMATS.indexOf(spec.format) >= 0 ? false : undefined,
      maxProblems: SHEET_FORMATS.indexOf(spec.format) >= 0 ? (spec.count || spec.cols * spec.rows) : undefined,
      instruction: TYPE_INSTRUCTIONS[spec.typeId] || INSTRUCTIONS[spec.format], gen: spec.gen
    };
  }
  if (Array.isArray(root.SheetCatalog)) root.SheetCatalog.push(...SPECS.map(entryOf));
})(globalThis);
