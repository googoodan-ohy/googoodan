(function (root) {
  'use strict';

  /* ===================== 묶음 0-2-1 · 기초 뺄셈 (제작자 A) =====================
     개념 4개 × 유형 4개 = 16개 typeId. 한 장 = 한 유형, 가로셈(t1)과 세로셈(t2·t3·t4)은 섞지 않는다.
     모든 난수는 seed 에서만 나오므로 같은 seed 면 같은 문제지가 나온다.

     문제는 사이트 기존 생성기(Worksheets.generate)에서 뽑아 개념 조건에 맞는 것만 남긴다.
     조건에 맞는 고유 계산식은 개념마다 9~45개뿐이다.
       · 9 이내의 뺄셈            45개 (1≤b≤a≤9)
       · 10에서 한 자리 수 빼기    9개 (10-1 ~ 10-9)
       · 십몇 - 한 자리(받아내림 없음) 45개
       · 10을 이용한 받아내림 뺄셈    36개 (받아내림이 일어나는 십몇 - 한 자리)
     최소 문항 수가 고유 계산식 수보다 많은 유형은 조건을 벗어나지 않도록
     기존 생성기에서 얻은 계산식을 순환 사용한다.

     서식 4종(g021-horizontal/vertical/missing/correction)은 이 파일 안에만 둔다.
     공용 sheet.js 의 가로셈 서식 대신 묶음 서식을 쓰는 이유는 네 서식이 같은 답 칸(상자)과
     가운데 정렬을 쓰게 해 한 유형 안에서 문제 모양을 같게 유지하기 위해서다(공용 파일은 그대로 둔다).
  ============================================================================= */

  const NBSP = '\u00a0';

  /* ---------- 1. 개념 정의: worksheet-types.json 이름과 spec-*.json params 그대로 ---------- */

  const CONCEPTS = {
    '0-2-1-0': {
      name: '9 이내의 뺄셈',
      legacyId: 'natural-sub-1-1',                 // 기존 생성기: 1~9 에서 1~9 빼기(작은 수에서 큰 수는 제외)
      accept: q => q.op === '−' && q.a >= 1 && q.a <= 9 && q.b >= 1 && q.b <= 9 && q.a >= q.b,
      sortKey: f => f.a,                           // 쉬운 것 → 어려운 것: 윗수(피감수) 크기 순
      note: '한 자리 수끼리의 뺄셈, 답은 0 이상'
    },
    '0-2-1-1': {
      name: '10에서 한 자리 수 빼기',
      legacyId: 'subtract-small',                  // 기존 생성기: 1~10 에서 0~a 빼기
      accept: q => q.op === '−' && q.a === 10 && q.b >= 1 && q.b <= 9,
      sortKey: f => f.b,                           // 10-1 → 10-9 순(빼는 수가 커질수록 어렵다)
      note: '피감수는 항상 10, 빼는 수는 1~9, 답은 1~9'
    },
    '0-2-1-2': {
      name: '십몇에서 한 자리 수 빼기 — 받아내림 없음',
      legacyId: 'natural-sub-2-1',                 // 기존 생성기: 두 자리 - 한 자리
      accept: q => q.op === '−' && q.a >= 11 && q.a <= 19 && q.b >= 1 && q.b <= 9 && q.b <= q.a - 10,
      sortKey: f => f.a,
      note: '일의 자리에서 바로 뺄 수 있는 경우만(받아내림 0회), 답은 10 이상'
    },
    '0-2-1-3': {
      name: '10을 이용한 받아내림 뺄셈',
      legacyId: 'natural-sub-2-1',
      accept: q => q.op === '−' && q.a >= 11 && q.a <= 18 && q.b >= 2 && q.b <= 9 && q.b > q.a - 10,
      sortKey: f => f.a,
      note: '십의 자리에서 10을 받아내리는 경우(받아내림 1회), 답은 2 이상 한 자리'
    }
  };

  /* ---------- 2. 난수와 정렬 ---------- */

  function random(seed) {
    let s = seed >>> 0;
    return (a, b) => {
      s += 0x6d2b79f5;
      let t = s;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return a + Math.floor(((t ^ t >>> 14) >>> 0) / 4294967296 * (b - a + 1));
    };
  }

  function shuffled(items, seed) {
    const rnd = random(seed), out = items.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = rnd(0, i);
      const swap = out[i]; out[i] = out[j]; out[j] = swap;
    }
    return out;
  }

  /* ---------- 3. 기존 생성기에서 조건에 맞는 문제만 뽑기 ---------- */

  function collectFacts(concept, seed, want) {
    if (!root.Worksheets || typeof root.Worksheets.generate !== 'function') throw Error('기존 Worksheets 생성기를 찾지 못했습니다.');
    const found = new Map();
    // 한 번에 32개씩(기존 생성기의 유한한 풀을 넘기지 않게) 여러 번 뽑아 조건에 맞는 것만 모은다.
    for (let batch = 0; batch < 600 && found.size < want; batch++) {
      let rows;
      try { rows = root.Worksheets.generate(concept.legacyId, (seed + Math.imul(batch, 2654435761)) >>> 0, 32); }
      catch (error) { throw Error(concept.name + ': 기존 생성기 실패 - ' + error.message); }
      for (const raw of rows) {
        if (!concept.accept(raw)) continue;
        const a = Number(raw.a), b = Number(raw.b);
        const key = a + ':' + b;
        if (!found.has(key)) found.set(key, { a, b, op: '−', answer: a - b });
      }
    }
    const facts = shuffled([...found.values()], seed);
    facts.sort((x, y) => concept.sortKey(x) - concept.sortKey(y));   // 안정 정렬: 같은 난이도 안은 seed 가 순서를 정한다
    return facts;
  }

  // 풀이 부족한 계산 유형은 각 식을 고르게 되풀이하되, 가로·세로 이웃에는 같은 식을 두지 않는다.
  function repeatedFacts(facts, seed, need, cols) {
    const key = f => f.a + ':' + f.b;
    const rounds = Math.ceil(need / facts.length);
    for (let attempt = 0; attempt < 1000; attempt++) {
      const ordered = [];
      for (let round = 0; round < rounds; round++) {
        ordered.push(...shuffled(facts, (seed + Math.imul(attempt + 1, 137) + Math.imul(round + 1, 2654435761)) >>> 0));
      }
      const result = ordered.slice(0, need);
      if (result.every((fact, i) =>
        (i % cols === 0 || key(fact) !== key(result[i - 1])) &&
        (i < cols || key(fact) !== key(result[i - cols])))) return result.map(f => ({ ...f }));
    }
    throw Error('반복 문항을 이웃하지 않게 배치하지 못했습니다.');
  }

  // 고치기는 풀 전체에 고르게 퍼지게 뽑고, 계산 유형만 부족한 풀을 섞어 반복한다.
  function drawFacts(concept, seed, need, spread, cols) {
    const facts = collectFacts(concept, seed, spread ? 400 : need);
    if (!facts.length) throw Error(concept.name + ': 조건에 맞는 문항을 찾지 못했습니다.');
    if (facts.length < need) {
      if (!spread && cols) return repeatedFacts(facts, seed, need, cols);
      return Array.from({ length: need }, (_, i) => ({ ...facts[i % facts.length] }));
    }
    // 10 − (1~9) 는 9가지뿐이라 한 장이 풀 전체를 쓴다 → 문제는 같고 seed 마다 나오는 순서만 섞는다.
    if (concept.legacyId === 'subtract-small' && facts.length === need) return shuffled(facts, (seed ^ 0x2c1b3c6d) >>> 0);
    if (!spread || facts.length === need) return facts.slice(0, need);
    const picked = [];
    for (let i = 0; i < need; i++) picked.push(facts[Math.floor(i * facts.length / need)]);
    return picked;
  }

  /* ---------- 4. 잘못된 계산 과정(고치기 유형) ---------- */
  // spec 의 errorKinds 를 이 단계에서 실제로 나오는 틀린 답으로 옮긴 것.
  // 답과 같아지거나 앞 문항과 같은 틀린 답이면 건너뛴다.

  const ERRORS = {
    '0-2-1-0': [
      { id: 'miss-one', label: '그림이나 손가락을 한 개 빼먹고 셈', wrong: f => f.answer + 1 },
      { id: 'count-first', label: '두 번째 수를 셀 때 첫 수를 다시 셈', wrong: f => f.answer - 1 },
      { id: 'sum-diff', label: '합과 차를 혼동함', wrong: f => f.a + f.b }
    ],
    '0-2-1-1': [
      { id: 'not-bundle', label: '10을 한 묶음으로 보지 않음', wrong: f => f.b },
      { id: 'complement', label: '보수인 두 수를 혼동함', wrong: f => f.answer + 1 },
      { id: 'swap-place', label: '10과 낱개의 자리를 바꾸어 씀', wrong: f => f.answer - 1 }
    ],
    '0-2-1-2': [
      { id: 'tens-off', label: '십의 자리를 잘못 셈', wrong: f => f.answer + 10 },
      { id: 'drop-zero', label: '0이 되는 자리를 빠뜨림', wrong: f => (f.answer % 10 === 0 ? f.answer / 10 : null) },
      { id: 'same-place', label: '같은 자리끼리 빼지 않음', wrong: f => f.answer - 1 }
    ],
    '0-2-1-3': [
      { id: 'keep-tens', label: '받아내린 뒤 윗자리 수를 줄이지 않음', wrong: f => f.answer + 10 },
      { id: 'reverse', label: '큰 숫자에서 작은 숫자를 무조건 뺌', wrong: f => 10 + (f.b - (f.a - 10)) },
      { id: 'drop-one', label: '하나를 덜 뺌', wrong: f => f.answer + 1 }
    ]
  };

  function correctionItems(facts, conceptId, seed) {
    const kinds = ERRORS[conceptId], rnd = random(seed ^ 0x5bf03635);
    const items = [], used = new Set();
    const offset = rnd(0, kinds.length - 1);
    facts.forEach((fact, index) => {
      // 오류 종류를 문항마다 돌려 가며 쓴다(한 장이 같은 실수만 반복하지 않게).
      for (let step = 0; step < kinds.length; step++) {
        const kind = kinds[(offset + index + step) % kinds.length];
        const wrong = kind.wrong(fact);
        if (wrong == null || !Number.isInteger(wrong) || wrong < 0 || wrong === fact.answer) continue;
        const key = fact.a + ':' + fact.b + ':' + wrong;
        if (used.has(key)) continue;
        used.add(key);
        items.push({ ...fact, kind: kind.id, wrong, wrongLabel: kind.label });
        break;
      }
    });
    return items;
  }

  /* ---------- 5. 유형 정의(단·줄·문항 수) ---------- */

  const TYPE_TITLE = {
    t1: '가로셈으로 계산하기',
    t2: '세로셈으로 계산하기',
    t3: '세로 풀이의 빈칸 채우기',
    t4: '잘못된 계산 과정 고치기'
  };
  // 머리말은 한 줄이라 긴 제목은 '...' 로 잘린다 → 짧은 이름으로 쓴다(개념 정식 이름은 concept.name 에 보존).
  const SHORT_NAME = { '0-2-1-2': '십몇 − 한 자리(받아내림 없음)' };
  const TASK_SHORT = { t1: '가로셈', t2: '세로셈', t3: '빈칸 채우기', t4: '고치기' };
  const INSTRUCTION = {
    t1: '계산하여 답을 쓰세요.',
    t2: '계산하여 답을 쓰세요.',
    t3: '빈칸에 알맞은 수를 써넣으세요.',
    t4: '잘못된 곳을 찾아 바르게 고쳐 쓰세요.'
  };

  // cols × rows = layout-rules §2의 최소 문항 수 이상.
  //   가로셈: 한 줄짜리 식 → 15줄. 세로셈: 한 벌 높이 + 여백을 고려한 8~9줄.
  //   t3 는 같은 개념 세로셈(t2)과 같은 단·줄(layout-rules §2).
  const LAYOUT = {
    '0-2-1-0': { pt: { t1: 22, t2: 20, t3: 20, t4: 21 }, fontPt: 15, borrow: false, missing: 'minuend', t1: [3, 15], t2: [5, 9], t3: [5, 9], t4: [3, 4] },
    '0-2-1-1': { pt: { t1: 37.5, t2: 36, t3: 36, t4: 19 }, fontPt: 16, borrow: true, missing: 'result+borrow', t1: [1, 9], t2: [3, 3], t3: [3, 3], t4: [3, 3] },   // t1 은 1단 9줄(2026-10-02 사용자 지시). 문제 풀이 10-1 ~ 10-9 아홉 개뿐이라 같은 식을 되풀이하지 않고 9문제만 낸다,
    '0-2-1-2': { pt: { t1: 22, t2: 20, t3: 20, t4: 20 }, fontPt: 15, borrow: false, missing: 'ones', t1: [3, 15], t2: [6, 8], t3: [6, 8], t4: [3, 4] },
    '0-2-1-3': { pt: { t1: 28, t2: 19, t3: 19, t4: 20 }, fontPt: 13, borrow: true, missing: 'result+borrow', t1: [3, 12], t2: [6, 6], t3: [6, 6], t4: [3, 4] }   // 풀이 36개 → 되풀이 없이 36문제까지만
  };

  const TYPES = [];
  Object.keys(CONCEPTS).forEach((conceptId, conceptIndex) => {
    const concept = CONCEPTS[conceptId], layout = LAYOUT[conceptId];
    for (const key of ['t1', 't2', 't3', 't4']) {
      const [cols, rows] = layout[key];
      TYPES.push({
        typeId: conceptId + '-' + key,
        title: (SHORT_NAME[conceptId] || concept.name) + ' · ' + TASK_SHORT[key],
        instruction: INSTRUCTION[key],
        format: 'g021-' + { t1: 'horizontal', t2: 'vertical', t3: 'missing', t4: 'correction' }[key],
        cols, rows, count: cols * rows,
        fontPt: layout.pt[key],
        seed: 20261001 + conceptIndex * 137 + Number(key.slice(1)) * 7,
        autoFit: false,
        gen: { bundle: '0-2-1', concept: conceptId, task: key, legacyId: concept.legacyId, borrow: layout.borrow, missing: layout.missing }
      });
    }
  });

  /* ---------- 6. 유형별 문항 만들기 ---------- */

  function questionsFor(config) {
    const gen = config.gen || {};
    const concept = CONCEPTS[gen.concept];
    if (!concept) throw Error('묶음 0-2-1에 없는 개념입니다: ' + gen.concept);
    const count = config.count || config.cols * config.rows;
    const facts = drawFacts(concept, Number(config.seed) || 1, count, gen.task === 't4', config.cols);
    if (facts.length !== count) throw Error(config.typeId + ': 문항 ' + count + '개를 채우지 못했습니다.');
    if (gen.task === 't4') {
      const items = correctionItems(facts, gen.concept, Number(config.seed) || 1);
      if (items.length !== count) throw Error(config.typeId + ': 고치기 문항 ' + count + '개를 채우지 못했습니다.');
      return items;
    }
    return facts.map(fact => ({ ...fact, kind: gen.task }));
  }

  /* ---------- 7. 화면 만들기 ---------- */

  const node = (tag, className, value) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (value !== undefined) el.textContent = value;
    return el;
  };

  function stackWidth(fact, extra) {
    return Math.max(String(fact.a).length, String(fact.b).length, String(fact.answer).length, extra == null ? 0 : String(extra).length);
  }

  // digits: { text, mask:Set(빈칸), box:bool(빈칸 상자), mark:Set(정답지에서 표시할 자리) }
  function row(width, options) {
    const o = options || {};
    const line = node('div', 'vertical-row' + (o.className ? ' ' + o.className : ''));
    line.append(node('span', 'vertical-sign', o.sign || NBSP));
    const chars = String(o.text == null ? '' : o.text).padStart(width, NBSP).slice(-width).split('');
    for (let i = 0; i < width; i++) {
      const isBlank = o.mask && o.mask.has(i) && !o.reveal;   // 정답지에서는 빈칸 자리에 답을 인쇄한다
      const digit = node('span', 'vertical-digit');
      if (isBlank) { digit.textContent = NBSP; if (o.box) digit.classList.add('g21-blank'); }
      else {
        digit.textContent = chars[i] === ' ' ? NBSP : chars[i];
        if (o.mark && o.mark.has(i)) digit.classList.add('g21-mark');
      }
      line.append(digit);
    }
    return line;
  }

  // 받아내림을 적는 작은 칸. value 를 주면 그 값을 적고(정답지), blank 면 채울 칸으로 표시한다.
  function borrowRow(width, value, blank) {
    const line = node('div', 'vertical-row g21-borrow');
    line.append(node('span', 'vertical-sign'));
    for (let i = 0; i < width; i++) {
      const digit = node('span', 'vertical-digit');
      if (value != null && i === width - 1) { digit.textContent = String(value); digit.classList.add('g21-borrow-value'); }
      else { digit.textContent = NBSP; if (blank && i === width - 1) digit.classList.add('g21-blank'); }
      line.append(digit);
    }
    return line;
  }

  // 세로셈 한 벌. 주어진 자리(mask)는 빈칸 상자, 나머지는 인쇄한다.
  // resultText 를 주면 그 값을 답 줄에 인쇄한다(정답지·고치기 유형).
  function stack(fact, layout, options) {
    const o = options || {};
    const width = stackWidth(fact, o.resultText);
    const box = node('div', 'g21-stack');
    if (layout.borrow) box.append(borrowRow(width, o.borrowValue, o.borrowBlank));
    box.append(row(width, { text: fact.a, mask: o.mask && o.mask.a, box: o.box, reveal: o.reveal }));
    box.append(row(width, { text: fact.b, sign: '−', mask: o.mask && o.mask.b, box: o.box, reveal: o.reveal }));
    const result = row(width, {
      text: o.resultText == null ? '' : o.resultText,
      mask: o.mask && o.mask.result, box: o.boxResult, mark: o.markResult, reveal: o.reveal,
      className: 'vertical-rule g21-res'
    });
    box.append(result);
    return box;
  }

  function fill(text, isAnswer) { return isAnswer ? String(text) : NBSP; }

  function centered(child, className) {
    const wrap = node('div', className || 'g21-cell');
    wrap.append(child);
    return wrap;
  }

  /* 가로셈 */
  function renderHorizontal(cell, q, answer) {
    css();
    const line = node('div', 'g21-eq');
    line.append(node('span', 'g21-exp', q.a + ' ' + q.op + ' ' + q.b + ' ='));
    line.append(node('span', 'g21-answer', fill(q.answer, answer)));
    cell.append(centered(line));
  }

  /* 세로셈으로 계산하기 */
  function renderVertical(cell, q, answer, config) {
    css();
    const layout = LAYOUT[config.gen.concept];
    cell.append(centered(stack(q, layout, { resultText: fill(q.answer, answer) })));
  }

  /* 세로 풀이의 빈칸 채우기: 자리별 중간 계산을 인쇄하고 1~2곳만 빈칸으로 둔다 */
  function renderMissing(cell, q, answer, config) {
    css();
    const layout = LAYOUT[config.gen.concept];
    const width = stackWidth(q);
    const options = { boxResult: true, box: true, reveal: answer };
    if (layout.missing === 'minuend') {
      // 9 이내: 답을 인쇄하고 윗수를 빈칸으로 (□ - b = 답)
      options.mask = { a: new Set([width - 1]) };
      options.resultText = String(q.answer);
    } else if (layout.missing === 'ones') {
      // 십몇(받아내림 없음): 십의 자리는 인쇄하고 일의 자리만 빈칸
      options.mask = { result: new Set([width - 1]) };
      options.resultText = String(q.answer);
    } else {
      // 받아내림: 받아내림 칸(1)과 답을 빈칸으로
      options.mask = { result: new Set([width - 1]) };
      options.borrowBlank = true;
      options.borrowValue = answer ? 1 : null;
      if (answer) options.resultText = String(q.answer);
    }
    cell.append(centered(stack(q, layout, options)));
  }

  /* 잘못된 계산 과정 고치기: 틀린 풀이 옆에 바르게 고쳐 쓰는 빈 세로셈 */
  function renderCorrection(cell, q, answer, config) {
    css();
    const layout = LAYOUT[config.gen.concept];
    const width = stackWidth(q, q.wrong);
    const wrongText = String(q.wrong).padStart(width, ' ');
    // 정답지에서는 정답과 다른 자리만 표시한다(자리마다 다른 오류를 정확히 짚기 위해).
    const marks = new Set();
    const correctText = String(q.answer).padStart(width, ' ');
    for (let i = 0; i < width; i++) if (wrongText[i] !== correctText[i]) marks.add(i);
    const wrong = node('div', 'g21-wrong');
    wrong.append(stack(q, layout, { resultText: wrongText, markResult: answer ? marks : null }));
    const redo = node('div', 'g21-redo');
    redo.append(stack(q, layout, { resultText: answer ? String(q.answer).padStart(width, ' ') : '' }));
    const pair = node('div', 'g21-correct');
    pair.append(wrong, redo);
    cell.append(centered(pair, 'g21-cell g21-cell-wide'));
  }

  /* ---------- 8. 이 묶음 전용 CSS (공용 파일은 건드리지 않는다) ---------- */

  function css() {
    if (document.getElementById('g021-styles')) return;
    const style = node('style');
    style.id = 'g021-styles';
    style.textContent = [
      '.g21-cell{height:100%;display:flex;align-items:center;justify-content:center}',
      '.g21-cell-wide{align-items:stretch;padding-top:1mm}',
      '.g21-stack{--g21-slot:1.35em;display:inline-flex;flex-direction:column;font-variant-numeric:tabular-nums}',
      '.g21-stack .vertical-row{height:1.3em}',
      '.g21-stack .vertical-digit,.g21-stack .vertical-sign{width:var(--g21-slot)}',
      '.g21-stack .vertical-sign{width:.9em}',
      '.g21-borrow{height:.95em}',
      '.g21-borrow .vertical-digit{width:calc(var(--g21-slot) / .62);box-sizing:border-box;font-size:.62em !important;border:1px solid #ccc;height:1.1em;color:#444}',
      '.g21-borrow-value{color:#111}',
      '.g21-blank{border:1px solid #666;border-radius:2px;background:#fbfbfb}',
      '.g21-mark{background:#dedede}',
      '.g21-res{min-height:1.3em}',
      '.g21-eq{display:flex;align-items:center;gap:1.6mm;white-space:nowrap;line-height:1.2}',
      '.g21-exp{letter-spacing:.02em}',
      '.g21-answer{display:inline-flex;align-items:center;justify-content:center;min-width:11mm;height:1.6em;border:1px solid #666;border-radius:2px;background:#fbfbfb;padding:0 1mm}',
      '.g21-correct{display:flex;align-items:flex-start;gap:3mm}',
      '.g21-redo{height:100%;min-height:18mm;border:1px dashed #c4c4c4;border-radius:2px;padding:1mm 2mm 2mm}',
      '.g21-wrong{opacity:.92}'
    ].join('');
    document.head.append(style);
  }

  /* ---------- 9. 등록: 카탈로그 · 서식 · 생성기 ---------- */

  if (root.Sheet && typeof root.Sheet.register === 'function') {
    for (const [key, render] of Object.entries({
      'g021-horizontal': renderHorizontal,
      'g021-vertical': renderVertical,
      'g021-missing': renderMissing,
      'g021-correction': renderCorrection
    })) {
      try { root.Sheet.register(key, render); }
      catch (error) { /* 다른 묶음이 먼저 등록한 서식은 건드리지 않는다 */ }
    }
  }

  if (root.SheetGen && typeof root.SheetGen.generate === 'function' && !root.SheetGen.__g021) {
    const original = root.SheetGen.generate;
    const wrapped = config => (config.gen && config.gen.bundle === '0-2-1' ? questionsFor(config) : original(config));
    wrapped.__g021 = true;
    root.SheetGen.generate = wrapped;
  }

  if (Array.isArray(root.SheetCatalog)) root.SheetCatalog.push(...TYPES);

  root.GoogoodanG021 = { concepts: CONCEPTS, types: TYPES, layout: LAYOUT, errors: ERRORS, questionsFor, drawFacts, correctionItems };
})(globalThis);
