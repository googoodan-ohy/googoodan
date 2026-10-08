/* 묶음 2-2-1 — 소수 같은 자릿수 뺄셈 (개념 5개 × 유형 4개 = 20유형)

   개념(worksheet-types.json)과 명세(spec\spec-decimal.json)의 조건:
     2-2-1-0  소수 첫째 자리 뺄셈 — 받아내림 없음   operandPlaces [1,1], regroupCount 0
     2-2-1-1  소수 첫째 자리 뺄셈 — 받아내림 있음   operandPlaces [1,1], regroupCount 1~2
     2-2-1-2  소수 둘째 자리 뺄셈 — 받아내림 없음   operandPlaces [2,2], regroupCount 0
     2-2-1-3  소수 둘째 자리 뺄셈 — 받아내림 있음   operandPlaces [2,2], regroupCount 1~3
     2-2-1-4  소수 셋째 자리 뺄셈                   operandPlaces [3,3], regroupCount 제한 없음
   공통: 두 수 모두 소수 자리가 같고 0.1~99.999, 소수 끝자리 0 아님(0.20 같은 수 없음),
         결과 0보다 큼(음수 없음). 유형은 개념마다
         t1 가로셈 / t2 세로셈 / t3 세로 풀이의 빈칸 채우기 / t4 잘못된 계산 고치기.

   문제와 정답은 사이트의 기존 생성기에서만 가져온다 — src/bank/legacy/types.js 의
   decimal-sub-1 · decimal-sub-2 와, 같은 폴더 drill-engine.js 의 decimalPlaces 프로필
   (소수 셋째 자리는 legacy ID 가 없어 drill-engine 쪽을 쓴다). 이 파일은 새 문제 엔진을
   만들지 않고, 뽑힌 후보를 개념 조건으로 걸러 내고 모자라면 seed 를 바꿔 더 뽑는다.
   뽑힌 정답이 생성기의 정답과 다르면 그 후보도 버린다.

   한 장 한 유형. 가로셈(t1)과 세로셈(t2·t3·t4)을 섞지 않고, 짝 유형도 쓰지 않는다.
   같은 seed → 같은 문제지(모든 무작위 선택은 config.seed 에서만 나온다).

   t4 의 오류는 명세 errorKinds 를 이 개념에서 성립하는 형태로 옮긴 것이다.
     받아내림 있는 개념 — '작은 자리에서 큰 자리 숫자를 바로 뺌'(borrow-flat),
                          '받아내림 뒤 윗자리를 줄이지 않음'(borrow-no-reduce),
                          '0을 거쳐 빌려오는 과정을 빠뜨림'(borrow-zero-cross)
     받아내림 없는 개념 — 명세의 세 오류는 받아내림이 있어야 성립하므로 같은 계열의
                          '괜히 받아내림을 함'(spurious-borrow), '소수점을 찍지 않음'(missing-point),
                          '한 자리 숫자를 잘못 씀'(digit-slip) 을 쓴다.
   어느 쪽이든 보여 준 틀린 풀이의 값은 문항마다 바른 값과 다른지 검사한다.
*/
(function (root) {
  'use strict';

  const Sheet = root.Sheet, SheetGen = root.SheetGen, Catalog = root.SheetCatalog;
  if (!Sheet || !SheetGen || !Catalog) return;

  // 긴 조건과 유형명이 인쇄 머리말의 고정 폭 안에 모두 보이도록 이 16유형만 줄인다.
  if (root.location && /^2-2-1-[0-3]-t[1-4]$/.test(new URLSearchParams(root.location.search).get('type') || '')) {
    const titleStyle = document.createElement('style');
    titleStyle.textContent = '.sheet-title { font-size: 8pt; }';
    document.head.append(titleStyle);
  }

  /* ================= 1. 개념과 유형 ================= */

  const CONCEPTS = [
    { id: '2-2-1-0', name: '소수 첫째 자리 뺄셈 — 받아내림 없음', places: 1, borrow: [0, 0] },
    { id: '2-2-1-1', name: '소수 첫째 자리 뺄셈 — 받아내림 있음', places: 1, borrow: [1, 2] },
    { id: '2-2-1-2', name: '소수 둘째 자리 뺄셈 — 받아내림 없음', places: 2, borrow: [0, 0] },
    { id: '2-2-1-3', name: '소수 둘째 자리 뺄셈 — 받아내림 있음', places: 2, borrow: [1, 3] },
    { id: '2-2-1-4', name: '소수 셋째 자리 뺄셈', places: 3, borrow: [0, 9] }
  ];

  // 소수 자릿수별 후보 출처 (legacy ID). 3자리는 drill-engine 프로필 ID.
  const SOURCE = { 1: 'decimal-sub-1', 2: 'decimal-sub-2', 3: 'decimal-sub-3dp' };

  /* 한 장(A4 세로 1쪽)을 채우는 단·줄. §2 의 최소 기준 이상이면서 §5 의
     '문제 줄 + 답 줄 + 여백 4mm'에 맞춰 줄 높이를 정했다 (A4 210×297mm, 여백 10mm,
     머리말 9mm + 지시문 8mm → 문제 칸 높이 260mm).
       가로셈    3단 × 25줄 = 75문항 (줄 10.4mm = 한 줄 5.9mm + 여백 4.5mm)
       세로셈    5단 × 10줄 = 50문항 (줄 26mm = 풀이 20.5mm + 여백 5.5mm)
       고쳐 쓰기 3단 ×  4줄 = 12문항 (§2 그대로, 줄 65mm 는 고쳐 쓸 세로셈 자리)
     줄 수를 고정하고 autoFit 을 꺼서 seed 와 상관없이 문항 수가 같게 한다. */
  const FORMS = [
    { key: 't1', label: '가로셈', format: 'horizontal', size: { 1: [3, 13, 17], 2: [3, 13, 16], 3: [2, 15, 17] },
      instruction: '식을 계산하고 답을 쓰세요.' },
    { key: 't2', label: '세로셈', format: 'ko221-vertical', workLines: 4, size: { 1: [5, 8, 15], 2: [5, 8, 15], 3: [5, 6, 14] },
      instruction: '소수점을 맞추어 세로로 계산하고 답을 쓰세요.' },
    { key: 't3', label: '세로셈 빈칸', format: 'ko221-vertical-blank', workLines: 4, size: { 1: [5, 8, 15], 2: [5, 8, 15], 3: [5, 6, 14] },
      instruction: '계산 과정을 살펴보고 □ 안에 알맞은 수를 쓰세요.' },
    // 한 칸에 틀린 풀이 + 고쳐 쓸 세로셈 자리.
    { key: 't4', label: '고쳐 쓰기', format: 'ko221-correction', workLines: 11, size: { 1: [2, 6, 16], 2: [2, 6, 16], 3: [2, 6, 15] },
      instruction: '잘못된 곳을 찾아 바르게 고쳐 쓰세요.' }
  ];

  const KIND_BORROW = ['borrow-flat', 'borrow-no-reduce', 'borrow-zero-cross'];
  const KIND_NO_BORROW = ['spurious-borrow', 'missing-point', 'digit-slip'];
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
    if (!drill || !(drill.profiles instanceof Map) || drill.profiles.has(SOURCE[3])) return;
    drill.profiles.set(SOURCE[3], {
      id: SOURCE[3], source: SOURCE[2], title: '소수 셋째 자리 뺄셈',
      group: '기본 연산', mode: 'basic', layout: 'horizontal', code: 'sub', decimalPlaces: [3, 3]
    });
  }

  const bridge = SheetGen.generate;              // gen-bridge(+ formats-errorfix) 의 원래 구현

  // 한 번에 16문항씩 기존 생성기에서 받아 온다 (gen-bridge 와 같은 방식).
  function draw(source, seed) {
    return bridge({
      typeId: 'ko221:draw', format: 'ko221-draw', cols: 16, rows: 1, count: 16,
      seed: seed >>> 0, gen: { legacyId: source }
    });
  }

  /* 개념 조건 검사 — spec 의 operandPlaces·operandRange·fractionalLastDigitNonzero·
     resultNonnegative·regroupCount 를 그대로 본다. */
  function accepted(q, concept) {
    const places = concept.places, [lo, hi] = concept.borrow, scale = scaleOf(places);
    if (placesOf(q.a) !== places || placesOf(q.b) !== places) return false;
    const A = toInt(q.a, places), B = toInt(q.b, places);
    if (!Number.isFinite(A) || !Number.isFinite(B)) return false;
    if (A % 10 === 0 || B % 10 === 0) return false;                  // 소수 끝자리 0 금지
    if (A < scale / 10 || B < scale / 10) return false;              // 0.1 이상
    if (A > 99999 || B > 99999) return false;                        // 99.999 이하
    if (A <= B) return false;                                        // 결과 0보다 큼
    const count = borrowCount(A, B);
    if (count < lo || count > hi) return false;                      // 받아내림 횟수
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
      const batch = draw(SOURCE[concept.places], (seed + Math.imul(round + 1, 7919)) >>> 0);
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
    for (let i = 0; i < frac.length; i++) out.push({ row, col: frac.length - 1 - i, digit: Number(frac[i]) });
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
    const count = config.count || config.cols * config.rows;
    const seed = (Number(config.seed) || 1) >>> 0;
    const rnd = random((seed ^ hash(config.typeId)) >>> 0);
    const concept = config.concept, form = config.form;
    let items;
    if (form === 't4') {
      const kinds = concept.borrow[1] > 0 ? KIND_BORROW : KIND_NO_BORROW;
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
    if (!config || !String(config.typeId || '').startsWith('2-2-1-')) return bridge.apply(this, arguments);
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
    '.ko221-stack{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;font-variant-numeric:tabular-nums;}',
    '.ko221-line{display:grid;grid-template-columns:var(--ko221-cols);align-items:center;height:1.3em;width:max-content;}',
    '.ko221-line.ko221-carry{height:.95em;}',
    '.ko221-line.ko221-rule{border-top:1px solid #111;}',
    '.ko221-cell{text-align:center;min-width:0;}',
    '.ko221-carry .ko221-cell{font-size:.62em;line-height:1;}',
    '.ko221-box{justify-self:center;border:1px solid #ccc;width:.78em;height:.8em;border-radius:1px;}',
    '.ko221-blank{border:1px dashed #555;background:#f7f7f7;}',
    '.ko221-mark{background:#dedede;box-shadow:inset 0 -2px 0 #111;}',
    '.answer-page .ko221-fill{color:#d71f10 !important;font-weight:700 !important;}',
    '.answer-page .ko221-all-red,.answer-page .ko221-all-red *{color:#d71f10 !important;font-weight:700 !important;}',
    '.ko221-fix-body{display:flex;flex-direction:column;height:100%;}',
    '.ko221-fix{display:flex;align-items:center;gap:2mm;flex:1 1 auto;min-height:0;}',
    '.ko221-fix-left{flex:0 0 auto;}',
    '.ko221-fix-right{flex:1 1 auto;align-self:stretch;margin:1mm 0;border:1px solid #ddd;background-image:repeating-linear-gradient(90deg,transparent 0 calc(var(--ko221-slot) - 1px),#f1f1f1 calc(var(--ko221-slot) - 1px) var(--ko221-slot));}',
    '.ko221-note{margin:1mm 0 0;font-size:.62em;color:#222;line-height:1.2;}'
  ].join('');

  function installCss() {
    if (document.getElementById('ko221-styles')) return;
    const style = node('style');
    style.id = 'ko221-styles';
    style.textContent = CSS;
    document.head.append(style);
  }

  // 값 → 칸 배열 (자연수 자리 whole 개 + 소수점 + 소수 자리 frac 개)
  function cellsOf(text, whole, frac, options) {
    const settings = options || {};
    const [left, right = ''] = String(text).split('.');
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
    ? node('span', 'ko221-cell ko221-box')
    : node('span', 'ko221-cell' + (cell.marked ? ' ko221-mark' : '') + (cell.blank ? ' ko221-blank' : '') + (cell.fill ? ' ko221-fill' : ''),
      cell.blank ? ' ' : (cell.ch || ' '));

  // 칸 배열은 [자연수 자리 whole 개][소수점][소수 자리 frac 개] 이다. col 0 = 소수 끝자리.
  const indexOf = (col, whole, frac) => (col < frac ? whole + frac - col : whole + frac - col - 1);

  function stackNode(lines, whole, frac) {
    const el = node('div', 'ko221-stack');
    el.style.setProperty('--ko221-cols', `0.8em repeat(${whole},1.06em) 0.5em repeat(${frac},1.06em)`);
    el.style.setProperty('--ko221-slot', '1.06em');
    lines.forEach(line => {
      if (line.carry && line.cells.every(cell => cell.box || !cell.ch)) return;
      const row = node('div', 'ko221-line' + (line.carry ? ' ko221-carry' : '') + (line.rule ? ' ko221-rule' : '') +
        (line.answer ? ' ko221-result' : ''));
      row.append(node('span', 'ko221-cell', line.sign || ''));
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
    const body = node('div', 'ko221-fix-body');
    const wrap = node('div', 'ko221-fix');
    const left = node('div', 'ko221-fix-left');
    left.append(stackNode([
      { carry: true, cells: carry },
      { sign: '', cells: cellsOf(item.a, whole, frac) },
      { sign: item.op, cells: cellsOf(item.b, whole, frac) },
      { rule: true, answer: true, cells: resultCells }
    ], whole, frac));
    wrap.append(left);
    if (answer) {
      const right = node('div', 'ko221-fix-left ko221-all-red');
      right.append(stackNode(solutionLines(item, item.right, whole, frac), whole, frac));
      wrap.append(right);
    } else {
      wrap.append(node('div', 'ko221-fix-right'));
    }
    body.append(wrap);
    cell.append(body);
  }

  /* ================= 7. 카탈로그 등록 ================= */

  function register() {
    const formats = {
      'ko221-vertical': renderVertical,
      'ko221-vertical-blank': renderBlank,
      'ko221-correction': renderCorrection
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
          typeId, title: concept.places === 3
            ? concept.name + ' · ' + form.label
            : `소수${concept.places}자리 빼기·내림${concept.borrow[1] ? '있음' : '없음'}·${{
              t1: '가로', t2: '세로', t3: '세로빈칸', t4: '고치기'
            }[form.key]}`,
          instruction: form.instruction, format: form.format,
          cols: form.size[concept.places][0], rows: form.size[concept.places][1],
          count: form.size[concept.places][0] * form.size[concept.places][1],
          maxProblems: form.size[concept.places][0] * form.size[concept.places][1],
          seed: 20261001, gen: { legacyId: SOURCE[concept.places] },
          concept, form: form.key, autoFit: false,
          places: concept.places, borrow: concept.borrow,
          fontPt: form.size[concept.places][2]
        };
        if (form.workLines) entry.workLines = form.workLines;
        Catalog.push(entry);
      });
    });
  }

  register();
  root.Ko221 = { concepts: CONCEPTS, forms: FORMS, columnSub, borrowCount, collect, buildWrong };
})(globalThis);
