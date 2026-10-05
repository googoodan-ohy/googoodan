/* 묶음 2-2-2 — 서로 다른 소수 자릿수의 뺄셈, 4개 개념 × 4개 유형.
   피연산자와 정답은 기존 drill-engine.js 의 decimalPlaces 생성기에서 가져온다.
   개념 조건, 고유성, 정답을 확인하고 부족하면 다른 seed 로 더 뽑는다. */
(function (root) {
  'use strict';

  const Sheet = root.Sheet, SheetGen = root.SheetGen, Catalog = root.SheetCatalog;
  if (!Sheet || !SheetGen || !Catalog) return;

  /* ================= 1. 개념과 유형 ================= */

  const CONCEPTS = [
    { id: '2-2-2-0', name: '자연수 − 소수', operandPlaces: [0, 1], places: 1 },
    { id: '2-2-2-1', name: '소수 첫째 자리 − 소수 둘째 자리', operandPlaces: [1, 2], places: 2 },
    { id: '2-2-2-2', name: '소수 둘째 자리 − 소수 셋째 자리', operandPlaces: [2, 3], places: 3 },
    { id: '2-2-2-3', name: '0이 있는 소수의 연속 받아내림', operandPlaces: [2, 2], places: 2, zeroBorrow: true }
  ];

  const SOURCE = { '0,1': 'ko222-sub-0-1', '1,2': 'ko222-sub-1-2',
    '2,3': 'ko222-sub-2-3', '2,2': 'ko222-sub-2-2' };

  /* layout-rules §2 최소치: 가로 3×15, 세로 5×8, 고쳐 쓰기 3×4.
     autoFit 을 꺼서 seed 와 관계없이 한 유형의 문항 수를 일정하게 유지한다. */
  const FORMS = [
    { key: 't1', label: '가로셈으로 계산하기', format: 'horizontal', size: { 1: [3, 13, 17], 2: [3, 13, 16], 3: [2, 15, 17] },
      instruction: '식을 계산하고 답을 쓰세요.' },
    { key: 't2', label: '세로셈으로 계산하기', format: 'ko222-vertical', workLines: 4, size: { 1: [5, 8, 15], 2: [5, 8, 15], 3: [5, 6, 14] },
      instruction: '소수점을 맞추어 세로로 계산하고 답을 쓰세요.' },
    { key: 't3', label: '세로 풀이의 빈칸 채우기', format: 'ko222-vertical-blank', workLines: 4, size: { 1: [5, 8, 15], 2: [5, 8, 15], 3: [5, 6, 14] },
      instruction: '계산 과정을 살펴보고 □ 안에 알맞은 수를 쓰세요.' },
    // 한 칸에 틀린 풀이 + 고쳐 쓸 세로셈 자리.
    { key: 't4', label: '잘못된 계산 과정 고치기', format: 'ko222-correction', workLines: 11, size: { 1: [2, 6, 16], 2: [2, 6, 16], 3: [2, 6, 15] },
      instruction: '잘못된 곳을 찾아 바르게 고쳐 쓰세요.' }
  ];

  const NOTE = {
    'borrow-flat': '받아내림이 필요한 자리에서 큰 수에서 작은 수를 그냥 뺐습니다.',
    'borrow-no-reduce': '받아내림한 뒤 윗자리 수를 줄이지 않았습니다.',
    'borrow-zero-cross': '0을 거쳐 빌려올 때 0을 10으로 잘못 바꿨습니다.',
    'spurious-borrow': '받아내림이 필요 없는데 빌려왔습니다.',
    'missing-point': '소수점을 찍지 않았습니다.',
    'digit-slip': '결과의 한 자리 숫자를 잘못 썼습니다.'
  };

  /* ================= 2. 소수 계산 도구 ================= */

  const scaleOf = places => 10 ** places;
  const placesOf = text => (String(text).split('.')[1] || '').length;
  const toInt = (text, places) => Math.round(Number(text) * scaleOf(places));
  const digitsOf = value => String(value).split('').reverse().map(Number);
  const digitAt = (value, col) => Math.floor(value / 10 ** col) % 10;

  // 자리 하나를 다른 숫자로 바꾼 값 (col 0 = 가장 낮은 자리)
  function replaceDigit(value, col, digit) {
    const unit = 10 ** col;
    return value - digitAt(value, col) * unit + digit * unit;
  }

  // 받아내림 횟수 (= spec regroupCount). 소수는 자릿값 기준으로 소수 자리까지 센다.
  function borrowCount(A, B) {
    let count = 0, incoming = 0;
    while (A || B) {
      const x = A % 10 - incoming, y = B % 10;
      incoming = x < y ? 1 : 0;
      count += incoming;
      A = Math.floor(A / 10); B = Math.floor(B / 10);
    }
    return count;
  }

  /* 자리별 뺄셈. mode 로 틀린 풀이를 만든다.
       plain      바른 계산
       flat       받아내림 없이 각 자리에서 큰 수 − 작은 수
       no-reduce  받아내림은 하지만 윗자리 수를 줄이지 않음
       zero-ten   0을 거쳐 빌려올 때 0을 9가 아니라 10으로 둠
       spurious   필요 없는데 i 자리에서 빌려옴 (opts.at)
     결과: digits(자리 숫자, 낮은 자리부터) · borrows(빌려온 자리) · top(윗자리에 쓴 수)
           · crossed(10으로 잘못 바꾼 0의 자리) · written(쓴 수) */
  function columnSub(A, B, mode, opts) {
    const options = opts || {};
    const da = digitsOf(A), db = digitsOf(B), cur = da.slice();
    const digits = [], borrows = [], top = {}, crossed = [];
    let carry = 0;
    for (let i = 0; i < da.length + 1; i++) {
      const y = (db[i] || 0) + carry;
      carry = 0;
      let x = cur[i] || 0;
      if (mode === 'flat') { digits.push(Math.abs((da[i] || 0) - (db[i] || 0))); continue; }
      const spurious = mode === 'spurious' && options.at === i;
      if (x < y || spurious) {
        let j = i + 1;
        while (j < da.length && cur[j] === 0) j++;
        if (j >= da.length) return null;
        if (mode !== 'no-reduce') { cur[j] -= 1; top[j] = String(cur[j]); }
        for (let k = j - 1; k > i; k--) {
          if (cur[k] === 0) {
            if (mode === 'zero-ten') { cur[k] = 10; crossed.push(k); } else cur[k] = 9;
          } else if (cur[k] !== 9 && cur[k] !== 10) cur[k] = 9;
        }
        borrows.push(i);
        x += 10;
      }
      const value = x - y;
      if (value < 0 || value > 19) return null;
      digits.push(value % 10);
      carry = Math.floor(value / 10);        // 10을 넘게 빌려오면 윗자리로 1을 올림(잘못된 처리)
    }
    if (mode === 'zero-ten' && !crossed.length) return null;
    const written = digits.reduce((sum, d, i) => sum + d * 10 ** i, 0);
    return { digits, borrows, top, crossed, written };
  }

  /* ================= 3. 후보 뽑기 (기존 생성기) ================= */

  // drill-engine 은 type.html 이 이미 불러 두었고 DrillCatalog 는 빈 Map 으로 준비돼 있다.
  function installProfile() {
    const drill = root.DrillCatalog;
    if (!drill || !(drill.profiles instanceof Map)) throw Error('기존 DrillCatalog를 찾지 못했습니다.');
    Object.entries(SOURCE).forEach(([places, id]) => {
      if (drill.profiles.has(id)) return;
      drill.profiles.set(id, { id, source: 'decimal-sub-2', title: '소수 뺄셈',
        group: '기본 연산', mode: 'basic', layout: 'horizontal', code: 'sub',
        decimalPlaces: places.split(',').map(Number) });
    });
  }

  const bridge = SheetGen.generate;              // gen-bridge(+ formats-errorfix) 의 원래 구현

  // 한 번에 16문항씩 기존 생성기에서 받아 온다 (gen-bridge 와 같은 방식).
  function draw(source, seed) {
    return root.Worksheets.generate(source, seed >>> 0, 16);
  }

  /* 개념 조건 검사 — spec 의 operandPlaces·operandRange·fractionalLastDigitNonzero·
     resultNonnegative·regroupCount 를 그대로 본다. */
  function accepted(q, concept) {
    const places = concept.places, scale = scaleOf(places);
    if (placesOf(q.a) !== concept.operandPlaces[0] || placesOf(q.b) !== concept.operandPlaces[1]) return false;
    const A = toInt(q.a, places), B = toInt(q.b, places);
    if (!Number.isFinite(A) || !Number.isFinite(B)) return false;
    if (A < B || B <= 0) return false;
    if (!concept.zeroBorrow && concept.operandPlaces[0] && Number(q.a.split('.')[1].slice(-1)) === 0) return false;
    if (!concept.zeroBorrow && Number(q.b.split('.')[1].slice(-1)) === 0) return false;
    if (concept.id.endsWith('-0') && (Number(q.a) < 1 || Number(q.a) > 99 || Number(q.b) < .1 || Number(q.b) > 99.9)) return false;
    const count = borrowCount(A, B);
    if (concept.zeroBorrow) {
      if (!String(A).slice(0, -1).includes('0')) return false;
      let incoming = 0, run = 0, longest = 0, aa = A, bb = B;
      while (aa || bb) {
        incoming = Number(aa % 10 - incoming < bb % 10);
        run = incoming ? run + 1 : 0;
        longest = Math.max(longest, run);
        aa = Math.floor(aa / 10); bb = Math.floor(bb / 10);
      }
      if (longest < 2 || longest > 3 || count < 2 || count > 3) return false;
    }
    if (A - B !== Math.round(Number(q.answer) * scale)) return false;  // 생성기 정답 검산
    return { A, B, count };
  }

  // 문항은 쉬운 것 → 어려운 것. 받아내림 횟수 → 수의 크기 순.
  const ordered = items => items.slice().sort((x, y) =>
    x.count - y.count || (x.A + x.B) - (y.A + y.B) || x.A - y.A || x.B - y.B);

  function random(seed) {
    let s = (seed >>> 0) || 1;
    return (lo, hi) => {
      s += 0x6d2b79f5;
      let t = s;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return lo + Math.floor((((t ^ t >>> 14) >>> 0) / 4294967296) * (hi - lo + 1));
    };
  }
  const hash = text => {
    let h = 2166136261;
    for (const ch of String(text)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
    return h >>> 0;
  };

  /* 조건에 맞는 문항 count 개를 모은다. 모자라면 seed 를 바꿔 더 뽑는다(같은 seed → 같은 결과). */
  function collect(config, count, seed) {
    const concept = config.concept, scale = scaleOf(concept.places);
    const items = [], seen = new Set();
    const easyLimit = Math.floor(count * 0.1);                       // 0.x·1.x 끼리 쉬운 문항은 10% 이하
    let easyCount = 0;
    for (let round = 0; round < 1500 && items.length < count; round++) {
      const batch = draw(SOURCE[concept.operandPlaces.join(',')], (seed + Math.imul(round + 1, 7919)) >>> 0);
      for (const q of batch) {
        const ok = accepted(q, concept);
        if (!ok) continue;
        const key = q.a + ':' + q.b;
        if (seen.has(key)) continue;
        const easy = ok.A < 2 * scale && ok.B < 2 * scale;
        if (easy && easyCount >= easyLimit) continue;
        seen.add(key);
        items.push({ a: String(q.a), b: String(q.b), op: '−', answer: String(q.answer),
          A: ok.A, B: ok.B, C: ok.A - ok.B, count: ok.count, places: concept.places, easy });
        if (easy) easyCount++;
        if (items.length === count) break;
      }
    }
    if (items.length !== count) {
      throw Error(config.typeId + ': 조건에 맞는 문항 ' + count + '개 중 ' + items.length + '개만 모았습니다.');
    }
    return ordered(items);
  }

  /* ================= 4. 유형별 문항 만들기 ================= */

  // 한 장 안의 세로셈 칸 폭을 같게 유지한다 (layout-rules §5).
  function gridWidth(items, places) {
    return {
      whole: Math.max(1, ...items.map(item => String(Math.floor(item.A / scaleOf(places))).length)),
      frac: places
    };
  }

  // 값 하나가 차지하는 (자리, 숫자) 목록 — 화면에 보이는 자리만.
  function spotsOf(row, text, value, places) {
    const [whole, frac = ''] = String(text).split('.');
    const out = [];
    for (let i = 0; i < whole.length; i++) out.push({ row, col: places + whole.length - 1 - i, digit: Number(whole[i]) });
    for (let i = 0; i < frac.length; i++) out.push({ row, col: places - 1 - i, digit: Number(frac[i]) });
    return out.filter(spot => digitAt(value, spot.col) === spot.digit);
  }

  // □ 자리의 답이 하나뿐일 때만 그 자리를 쓴다.
  function uniqueDigit(item, spot) {
    let solutions = 0, digit = -1;
    for (let d = 0; d <= 9; d++) {
      const a = spot.row === 'a' ? replaceDigit(item.A, spot.col, d) : item.A;
      const b = spot.row === 'b' ? replaceDigit(item.B, spot.col, d) : item.B;
      const c = spot.row === 'result' ? replaceDigit(item.C, spot.col, d) : item.C;
      if (a - b === c) { solutions++; digit = d; }
    }
    return solutions === 1 ? digit : null;
  }

  /* t3 — 계산 과정 한 자리에 □ (blankCount 1) */
  function attachBlank(item, rnd) {
    const places = item.places;
    const spots = [
      ...spotsOf('result', item.answer, item.C, places),
      ...spotsOf('a', item.a, item.A, places),
      ...spotsOf('b', item.b, item.B, places)
    ];
    for (let i = spots.length - 1; i > 0; i--) {                     // seed 로 자리 고르기
      const j = rnd(0, i);
      [spots[i], spots[j]] = [spots[j], spots[i]];
    }
    for (const spot of spots) {
      const digit = uniqueDigit(item, spot);
      if (digit === null) continue;
      item.mask = { row: spot.row, col: spot.col, digit };
      return item;
    }
    return null;
  }

  /* t4 — 틀린 풀이 만들기. 값이 바른 값과 달라야 한다. */
  function buildWrong(item, kind, rnd) {
    const places = item.places, scale = scaleOf(places);
    const right = columnSub(item.A, item.B, 'plain');
    if (!right) return null;
    let wrong = null, marks = [];
    if (kind === 'borrow-flat') wrong = columnSub(item.A, item.B, 'flat');
    else if (kind === 'borrow-no-reduce') wrong = columnSub(item.A, item.B, 'no-reduce');
    else if (kind === 'borrow-zero-cross') wrong = columnSub(item.A, item.B, 'zero-ten');
    else if (kind === 'digit-slip') {
      const shown = spotsOf('result', item.answer, item.C, places);   // 답에 보이는 자리만 바꾼다
      if (!shown.length) return null;
      const col = shown[rnd(0, shown.length - 1)].col;
      if (digitAt(item.C, col) === 9) return null;
      const value = replaceDigit(item.C, col, digitAt(item.C, col) + 1);
      wrong = { digits: digitsOf(value), borrows: right.borrows.slice(), top: right.top, crossed: [], written: value };
    } else if (kind === 'missing-point') {
      if (!String(item.answer).includes('.')) return null;           // 소수점이 없는 답에는 쓸 수 없다
      // 자리 숫자는 그대로 두고 소수점만 찍지 않은 풀이. 값은 '소수점을 무시하고 읽은 수'로 본다.
      wrong = { digits: digitsOf(item.C), borrows: right.borrows.slice(), top: right.top, crossed: [],
        written: item.C * scale, text: item.answer, noPoint: true };
    } else if (kind === 'spurious-borrow') {
      // 필요 없는데 빌려온 뒤 그 1을 윗자리로 올려 빼는 풀이 — 윗자리가 견딜 때만 쓴다.
      const candidates = [];
      for (let i = 0; i + 1 < String(item.A).length; i++) {
        if (digitAt(item.A, i) >= digitAt(item.B, i) &&
            digitAt(item.A, i + 1) >= digitAt(item.B, i + 1) + 2) candidates.push(i);
      }
      if (!candidates.length) return null;
      const at = candidates[rnd(0, candidates.length - 1)];
      wrong = columnSub(item.A, item.B, 'spurious', { at });
      if (wrong) marks.push({ row: 'carry', col: at + 1 });
    }
    if (!wrong || wrong.written === item.C) return null;
    // 바른 결과와 다른 자리를 표시한다 (정답지에서만 보인다)
    const width = Math.max(String(item.C).length, String(wrong.written).length);
    if (!wrong.noPoint) {
      for (let col = 0; col < width; col++) {
        if (digitAt(item.C, col) !== digitAt(wrong.written, col)) marks.push({ row: 'result', col });
      }
    } else marks.push({ row: 'point' });
    return Object.assign({}, item, {
      kind, note: NOTE[kind], marks, scale,
      wrong: { value: wrong.written, text: String(wrong.written / scale), digits: wrong.digits,
        top: wrong.top, crossed: wrong.crossed, noPoint: !!wrong.noPoint },
      right: { value: right.written, text: item.answer, digits: right.digits, top: right.top, crossed: [] }
    });
  }

  /* 오류 유형은 문항 차례대로 돌아가며 맡고(4문항씩), 그 문항에 성립하지 않으면 다음 유형으로 간다.
     유형마다 나오는 문항 수가 한쪽으로 쏠리지 않게 한다. */
  function attachFix(item, kinds, rnd, slot) {
    for (let i = 0; i < kinds.length; i++) {
      const built = buildWrong(item, kinds[(slot + i) % kinds.length], rnd);
      if (built) return built;
    }
    return null;
  }

  /* ================= 5. 등록된 유형의 문항 만들기 ================= */

  function generateFor(config) {
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.ko222 = 'yes';
      installCss();
    }
    const count = config.count || config.cols * config.rows;
    const seed = (Number(config.seed) || 1) >>> 0;
    const rnd = random((seed ^ hash(config.typeId)) >>> 0);
    const concept = config.concept, form = config.form;
    let items;
    if (form === 't4') {
      const kinds = concept.zeroBorrow ? ['borrow-zero-cross', 'borrow-no-reduce', 'borrow-flat']
        : ['missing-point', 'borrow-flat', 'digit-slip'];
      const pool = collect(config, count * 3, seed);                 // 오류가 성립하는 문항을 찾으려고 넉넉히 뽑는다
      const used = new Set();
      const easyLimit = Math.floor(count * 0.1);                     // 쉬운 문항(0.x·1.x)은 10% 이하
      let easyCount = 0;
      items = [];
      const take = (index, built) => {
        used.add(index);
        items.push(built);
        if (built.easy) easyCount++;
      };
      for (let slot = 0; slot < count; slot++) {
        const kind = kinds[slot % kinds.length];
        const usable = i => !used.has(i) && !(pool[i].easy && easyCount >= easyLimit);
        let built = null, at = -1;
        for (let i = 0; i < pool.length && !built; i++) {             // 맡은 오류가 성립하는 문항을 먼저 찾는다
          if (!usable(i)) continue;
          built = buildWrong(pool[i], kind, rnd);
          if (built) at = i;
        }
        if (!built) {                                                // 없으면 남은 문항에서 되는 오류로 채운다
          for (let i = 0; i < pool.length && !built; i++) {
            if (!usable(i)) continue;
            built = attachFix(pool[i], kinds, rnd, slot);
            if (built) at = i;
          }
        }
        if (!built) throw Error(config.typeId + ': 틀린 풀이를 ' + count + '개 만들지 못했습니다.');
        take(at, built);
      }
      items = ordered(items);
    } else {
      items = collect(config, count, seed);
      if (form === 't3') {
        items.forEach(item => {
          if (!attachBlank(item, rnd)) throw Error(config.typeId + ': □ 자리를 정하지 못했습니다.');
        });
      }
    }
    const width = gridWidth(items, concept.places);
    items.forEach((item, index) => { item.no = index + 1; item.whole = width.whole; });
    return items;
  }

  SheetGen.generate = function (config) {
    if (!config || !String(config.typeId || '').startsWith('2-2-2-')) return bridge.apply(this, arguments);
    return generateFor(config);
  };

  /* ================= 6. 서식 ================= */

  const node = (tag, className, value) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (value !== undefined) el.textContent = value;
    return el;
  };

  const CSS = [
    '.ko222-stack{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;font-variant-numeric:tabular-nums;}',
    '.ko222-line{display:grid;grid-template-columns:var(--ko222-cols);align-items:center;height:1.3em;width:max-content;}',
    '.ko222-line.ko222-carry{height:.95em;}',
    '.ko222-line.ko222-rule{border-top:1px solid #111;}',
    '.ko222-cell{text-align:center;min-width:0;}',
    '.ko222-carry .ko222-cell{font-size:.62em;line-height:1;}',
    '.ko222-box{justify-self:center;border:1px solid #ccc;width:.78em;height:.8em;border-radius:1px;}',
    '.ko222-blank{border:1px dashed #555;background:#f7f7f7;}',
    '.ko222-mark{background:#dedede;box-shadow:inset 0 -2px 0 #111;}',
    '.answer-page .ko222-fill{color:#d71f10 !important;font-weight:700 !important;}',
    '.answer-page .ko222-all-red,.answer-page .ko222-all-red *{color:#d71f10 !important;font-weight:700 !important;}',
    '.ko222-fix-body{display:flex;flex-direction:column;height:100%;}',
    '.ko222-fix{display:flex;align-items:center;gap:2mm;flex:1 1 auto;min-height:0;}',
    '.ko222-fix-left{flex:0 0 auto;}',
    '.ko222-fix-right{flex:1 1 auto;align-self:stretch;margin:1mm 0;border:1px solid #ddd;background-image:repeating-linear-gradient(90deg,transparent 0 calc(var(--ko222-slot) - 1px),#f1f1f1 calc(var(--ko222-slot) - 1px) var(--ko222-slot));}',
    '.ko222-note{margin:1mm 0 0;font-size:.62em;color:#222;line-height:1.2;}',
    'html[data-ko222="yes"] .sheet-head{gap:1.5mm;font-size:7pt;}',
    'html[data-ko222="yes"] .sheet-brand{font-size:7pt;}',
    'html[data-ko222="yes"] .sheet-field{min-width:0;}',
    'html[data-ko222="yes"] .sheet-title{font-size:7pt;min-width:0;}'
  ].join('');

  function installCss() {
    if (document.getElementById('ko222-styles')) return;
    const style = node('style');
    style.id = 'ko222-styles';
    style.textContent = CSS;
    document.head.append(style);
  }

  // 값 → 칸 배열 (자연수 자리 whole 개 + 소수점 + 소수 자리 frac 개)
  function cellsOf(text, whole, frac, options) {
    const settings = options || {};
    const [left, right = ''] = String(text).split('.');
    if (settings.noPoint) {
      // 소수점을 빠뜨린 오답은 모든 숫자를 자연수로 읽되, 인쇄 칸에는
      // 소수점 칸만 비우고 자연수·소수 자리 전체를 오른쪽부터 채운다.
      const digits = left.padStart(whole + frac, ' ');
      return [...digits.slice(0, whole), '', ...digits.slice(whole)]
        .map(ch => ({ ch: ch === ' ' ? '' : ch }));
    }
    const out = [];
    for (let i = 0; i < whole; i++) {
      const at = left.length - whole + i;
      out.push({ ch: at >= 0 ? left[at] : '' });
    }
    out.push({ ch: right.length && !settings.noPoint ? '.' : '' });
    for (let i = 0; i < frac; i++) out.push({ ch: right[i] === undefined ? '' : right[i] });
    return out;
  }

  const cellNode = cell => cell.box
    ? node('span', 'ko222-cell ko222-box')
    : node('span', 'ko222-cell' + (cell.marked ? ' ko222-mark' : '') + (cell.blank ? ' ko222-blank' : '') + (cell.fill ? ' ko222-fill' : ''),
      cell.blank ? ' ' : (cell.ch || ' '));

  // 칸 배열은 [자연수 자리 whole 개][소수점][소수 자리 frac 개] 이다. col 0 = 소수 끝자리.
  const indexOf = (col, whole, frac) => (col < frac ? whole + frac - col : whole + frac - col - 1);

  function stackNode(lines, whole, frac) {
    const el = node('div', 'ko222-stack');
    el.style.setProperty('--ko222-cols', `0.8em repeat(${whole},1.06em) 0.5em repeat(${frac},1.06em)`);
    el.style.setProperty('--ko222-slot', '1.06em');
    lines.forEach(line => {
      if (line.carry && line.cells.every(cell => cell.box || !cell.ch)) return;
      const row = node('div', 'ko222-line' + (line.carry ? ' ko222-carry' : '') + (line.rule ? ' ko222-rule' : '') +
        (line.answer ? ' ko222-result' : ''));
      row.append(node('span', 'ko222-cell', line.sign || ''));
      line.cells.forEach(cell => row.append(cellNode(line.carry && cell.box ? { ch: '' } : cell)));
      el.append(row);
    });
    return el;
  }

  // 받아내림 줄: 기본은 빈 칸, 채울 자리(top)와 10으로 잘못 바꾼 자리(crossed)를 적는다.
  function carryCells(whole, frac, top, crossed, fillTop) {
    const cells = [];
    for (let i = 0; i < whole + 1 + frac; i++) cells.push({ box: true });
    const put = (col, value, marked) => {
      const index = indexOf(col, whole, frac);
      if (index < 0 || index >= cells.length) return;
      cells[index] = { ch: value, marked: !!marked, fill: !!fillTop && !marked };
    };
    Object.keys(top || {}).forEach(col => put(Number(col), top[col], false));
    (crossed || []).forEach(col => put(Number(col), '10', true));
    return cells;
  }

  const solutionLines = (item, result, whole, frac) => [
    { carry: true, cells: carryCells(whole, frac, result.top, result.crossed, true) },
    { sign: '', cells: cellsOf(item.a, whole, frac) },
    { sign: item.op, cells: cellsOf(item.b, whole, frac) },
    { rule: true, answer: true, cells: cellsOf(item.answer, whole, frac) }
  ];

  /* t2 — 세로셈. 문제지에는 받아내림 칸만 두고, 정답지에 자리별 수와 답을 채운다. */
  function renderVertical(cell, item, answer) {
    installCss();
    const whole = item.whole, frac = item.places;
    cell.dataset.q = [item.a, item.op, item.b, item.answer].join('|');
    if (!answer) {
      cell.append(stackNode([
        { carry: true, cells: carryCells(whole, frac, null, null) },
        { sign: '', cells: cellsOf(item.a, whole, frac) },
        { sign: item.op, cells: cellsOf(item.b, whole, frac) },
        { rule: true, answer: true, cells: cellsOf('', whole, frac) }
      ], whole, frac));
      return;
    }
    const right = columnSub(item.A, item.B, 'plain');
    cell.append(stackNode(solutionLines(item, right, whole, frac), whole, frac));
  }

  /* t3 — 세로 풀이의 빈칸 채우기. □ 자리는 답이 하나뿐인 자리만 고른다. */
  function renderBlank(cell, item, answer) {
    installCss();
    const whole = item.whole, frac = item.places, mask = item.mask;
    const right = columnSub(item.A, item.B, 'plain');
    cell.dataset.q = [item.a, item.op, item.b, item.answer].join('|');
    cell.dataset.mask = mask.row + ':' + mask.col + ':' + mask.digit;
    // □ 가 결과 자리에 있으면 풀이(받아내림)를 보여 주고, 수 자리에 있으면 보여 주지 않는다
    // (받아내림 줄이 □ 자리를 알려 줄 수 있기 때문). 결과 줄은 □ 가 어디에 있든 답을 보여 준다.
    const showProcess = mask.row === 'result';
    const cells = {
      a: cellsOf(item.a, whole, frac),
      b: cellsOf(item.b, whole, frac),
      result: cellsOf(item.answer, whole, frac)
    };
    const index = indexOf(mask.col, whole, frac);
    const target = cells[mask.row];
    if (target && index >= 0 && index < target.length) {
      target[index] = answer ? { ch: String(mask.digit), marked: true, fill: true } : { blank: true };
    }
    cell.append(stackNode([
      { carry: true, cells: showProcess ? carryCells(whole, frac, right.top, null) : carryCells(whole, frac, null, null) },
      { sign: '', cells: cells.a },
      { sign: item.op, cells: cells.b },
      { rule: true, answer: false, cells: cells.result }   // 결과 줄의 인쇄된 숫자는 정답지에서도 검정, 채운 칸만 빨강
    ], whole, frac));
  }

  /* t4 — 잘못된 계산 과정 고치기. 왼쪽에 틀린 풀이, 오른쪽에 바르게 고쳐 쓸 자리. */
  function renderCorrection(cell, item, answer) {
    installCss();
    const whole = item.whole, frac = item.places;
    cell.dataset.q = [item.a, item.op, item.b, item.answer].join('|');
    cell.dataset.kind = item.kind;
    cell.dataset.wrong = String(item.wrong.value);
    const carry = carryCells(whole, frac, item.wrong.top, item.wrong.crossed);
    const resultCells = cellsOf(item.wrong.text, whole, frac, { noPoint: item.wrong.noPoint });
    if (answer) {
      item.marks.forEach(mark => {
        const cells = mark.row === 'carry' ? carry : resultCells;
        // 'point' 표시는 소수점을 찍지 않은 소수점 칸(칸 index = whole)을 가리킨다.
        const index = mark.row === 'point' ? whole : indexOf(mark.col, whole, frac);
        if (index >= 0 && index < cells.length) cells[index].marked = true;
      });
    }
    const body = node('div', 'ko222-fix-body');
    const wrap = node('div', 'ko222-fix');
    const left = node('div', 'ko222-fix-left');
    left.append(stackNode([
      { carry: true, cells: carry },
      { sign: '', cells: cellsOf(item.a, whole, frac) },
      { sign: item.op, cells: cellsOf(item.b, whole, frac) },
      { rule: true, answer: true, cells: resultCells }
    ], whole, frac));
    wrap.append(left);
    if (answer) {
      const right = node('div', 'ko222-fix-left ko222-all-red');
      right.append(stackNode(solutionLines(item, item.right, whole, frac), whole, frac));
      wrap.append(right);
    } else {
      wrap.append(node('div', 'ko222-fix-right'));
    }
    body.append(wrap);
    cell.append(body);
  }

  /* ================= 7. 카탈로그 등록 ================= */

  function register() {
    const formats = {
      'ko222-vertical': renderVertical,
      'ko222-vertical-blank': renderBlank,
      'ko222-correction': renderCorrection
    };
    Object.keys(formats).forEach(key => {
      if (Sheet.renderers.has(key)) return;
      Sheet.register(key, (cell, item, answer) => formats[key](cell, item, answer));
    });
    installProfile();
    const have = new Set(Catalog.map(entry => entry.typeId));
    CONCEPTS.forEach(concept => {
      FORMS.forEach(form => {
        const typeId = concept.id + '-' + form.key;
        if (have.has(typeId)) return;
        const entry = {
          typeId, title: concept.name.replace(' — ', ' · ') + ' · ' + form.label,
          instruction: form.instruction, format: form.format,
          cols: form.size[concept.places][0], rows: form.size[concept.places][1],
          count: form.size[concept.places][0] * form.size[concept.places][1],
          maxProblems: form.size[concept.places][0] * form.size[concept.places][1],
          seed: 20261001, gen: { legacyId: SOURCE[concept.operandPlaces.join(',')] },
          concept, form: form.key, autoFit: false,
          places: concept.places,
          fontPt: form.size[concept.places][2]
        };
        if (form.workLines) entry.workLines = form.workLines;
        Catalog.push(entry);
      });
    });
  }

  register();
  root.Ko222 = { concepts: CONCEPTS, forms: FORMS, columnSub, borrowCount, collect, buildWrong };
})(globalThis);
