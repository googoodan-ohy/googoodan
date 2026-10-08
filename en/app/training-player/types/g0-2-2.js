(function (root) {
  'use strict';

  /* ===================== 묶음 0-2-2 · 두 자리 수의 뺄셈 (제작자 A, 2026-10-02) =====================
     개념 5개 × 유형 4개 = typeId 20개. 한 장 = 한 유형, 가로셈(t1)과 세로셈(t2·t3·t4)은 섞지 않는다.
     모든 난수는 seed 에서만 나오므로 같은 seed 면 같은 문제지가 나온다.

     문제는 사이트 기존 생성기(Worksheets.generate)에서 뽑아 개념 조건에 맞는 것만 남긴다.
     · 0-2-2-0 · 0-2-2-1 · 0-2-2-4 → natural-sub-2-1 (두 자리 − 한 자리)
     · 0-2-2-2 · 0-2-2-3           → natural-sub-2-2 (두 자리 − 두 자리)
     · 0-2-2-4 는 빼는 수가 한 자리일 때와 두 자리일 때가 모두 있으므로 두 생성기를 함께 쓴다.

     개념 조건(spec\spec-natural.json 의 params)과 이 파일이 남기는 문제
     ------------------------------------------------------------------
     0-2-2-0 두 자리 수 − 한 자리 수 — 받아내림 없음 : 일의 자리에서 바로 빼지는 경우(받아내림 0회)
     0-2-2-1 두 자리 수 − 한 자리 수 — 받아내림 있음 : 일의 자리에서 받아내림 1회
     0-2-2-2 두 자리 수 − 두 자리 수 — 받아내림 없음 : 두 자리끼리, 받아내림 0회, a > b
     0-2-2-3 두 자리 수 − 두 자리 수 — 받아내림 있음 : 두 자리끼리, 받아내림 1회(십의 자리는 줄일 수 있어야 함)
     0-2-2-4 몇십에서 빼기                          : 피감수 20~90(10의 배수), 빼는 수 1~89, 답 1 이상

     §2 '같은 문제 중복 금지' 때문에 문제 풀 전체를 한 장에 한 번씩만 쓴다. 조건에 맞는 고유 문제는
     288 / 224 / 1232 / 784 / 288가지로, 한 장 최대 문항 수(가로셈 약 100, 세로셈·빈칸 약 72, 고치기 약 36)보다
     넉넉하다. 그래서 다른 묶음처럼 '문항 수를 문제 풀 크기로 줄이는' 예외가 필요 없다.

     §2 '0·1이 들어가는 쉬운 문제는 전체의 10% 이하'
     ------------------------------------------------
     피감수·감수에 0이나 1이 들어가는 문제(12−5, 30−20, 7−1 …)는 넣지 않았다(비율 0%). 그래서
     두 자리 수 개념에서는 10~19 와 20·21 처럼 0·1이 들어가는 수가 나오지 않는다.
     다만 0-2-2-4 는 spec 이 firstMultipleOf 10 이라 피감수가 항상 20~90(일의 자리 0)이므로
     피감수의 0은 개념 자체에 들어 있다. 이 개념만 '빼는 수에 0·1이 들어가는가'로 판정했고,
     일의 자리가 0인 빼는 수(= 받아내림이 없는 문제)도 빼서 모두 받아내림이 일어나는 문제만 넣었다.
     → 이 예외는 제작자가 확정할 수 없으므로 사용자 확인이 필요하다.

     한 장 문항 수(layout-rules §2 최소 기준 이상)와 단·줄
     -----------------------------------------------------
     §2 최소는 가로셈 45(두 자리), 세로셈 48(두 자리), 빈칸 = 같은 세로셈 48, 고치기 12 다.
     여기에 §1·§5 의 '남는 높이만큼 줄 수를 늘린다'를 적용해, 기본 단·줄은 §2 와 같게 두고
     sheet.js 의 자동 맞춤(autoFit)이 한 쪽에 들어가는 만큼 줄을 늘리게 했다. 줄 높이 하한은
     workLines 로 맞춘다(받아내림 줄이 있는 개념은 한 줄 더). t3 는 t2 와 같은 단·줄·문항 수가 된다.

     서식 4종(g022-horizontal/vertical/missing/correction)과 이 묶음 전용 CSS 는 이 파일 안에만 둔다.
     공용 파일(sheet.js, sheet.css, formats-*.js, type.html)은 고치지 않는다.
  ================================================================================================ */

  const NBSP = ' ';
  const MINUS = '−';

  /* ---------- 1. 개념 정의: worksheet-types.json 이름과 spec-natural.json params 그대로 ---------- */

  const ones = n => n % 10;
  const tens = n => Math.floor(n / 10) % 10;
  const hasEasyDigit = n => /[01]/.test(String(n));   // §2 의 '0·1이 들어가는' 문제 판정

  const CONCEPTS = {
    '0-2-2-0': {
      name: '두 자리 수 ' + MINUS + ' 한 자리 수 — 받아내림 없음',
      legacy: ['natural-sub-2-1'],
      borrow: false,
      cap: 288,
      accept: (a, b) => a >= 10 && a <= 99 && b >= 1 && b <= 9 && ones(a) >= b,
      easy: (a, b) => hasEasyDigit(a) || hasEasyDigit(b),
      note: '두 자리 − 한 자리, 일의 자리에서 바로 빼지는 경우(받아내림 0회), 답 0 이상'
    },
    '0-2-2-1': {
      name: '두 자리 수 ' + MINUS + ' 한 자리 수 — 받아내림 있음',
      legacy: ['natural-sub-2-1'],
      borrow: true,
      cap: 224,
      accept: (a, b) => a >= 10 && a <= 99 && b >= 1 && b <= 9 && ones(a) < b,
      easy: (a, b) => hasEasyDigit(a) || hasEasyDigit(b),
      note: '두 자리 − 한 자리, 일의 자리에서 받아내림 1회, 답 0 이상'
    },
    '0-2-2-2': {
      name: '두 자리 수 ' + MINUS + ' 두 자리 수 — 받아내림 없음',
      legacy: ['natural-sub-2-2'],
      borrow: false,
      cap: 1232,
      accept: (a, b) => a >= 10 && a <= 99 && b >= 10 && b <= 99 && a > b && ones(a) >= ones(b) && tens(a) >= tens(b),
      easy: (a, b) => hasEasyDigit(a) || hasEasyDigit(b),
      note: '두 자리끼리, 자리마다 바로 빼지는 경우(받아내림 0회), a > b'
    },
    '0-2-2-3': {
      name: '두 자리 수 ' + MINUS + ' 두 자리 수 — 받아내림 있음',
      legacy: ['natural-sub-2-2'],
      borrow: true,
      cap: 784,
      accept: (a, b) => a >= 10 && a <= 99 && b >= 10 && b <= 99 && a > b && ones(a) < ones(b) && tens(a) > tens(b),
      easy: (a, b) => hasEasyDigit(a) || hasEasyDigit(b),
      note: '두 자리끼리, 일의 자리에서 받아내림 1회(십의 자리를 줄일 수 있는 경우), a > b'
    },
    '0-2-2-4': {
      name: '몇십에서 빼기',
      legacy: ['natural-sub-2-1', 'natural-sub-2-2'],
      borrow: true,
      cap: 288,
      accept: (a, b) => a >= 20 && a <= 90 && ones(a) === 0 && b >= 1 && b <= 89 && b < a && ones(b) !== 0,
      easy: (a, b) => hasEasyDigit(b),   // 피감수의 일의 자리 0 은 개념 자체(10의 배수)이므로 빼는 수로만 판정한다
      note: '피감수 20~90(10의 배수), 빼는 수 1~89, 받아내림이 일어나는 경우만, 답 1 이상'
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

  function byDifficulty(x, y) {
    return x.a - y.a || x.b - y.b;
  }

  /* ---------- 3. 기존 생성기에서 조건에 맞는 문제만 뽑기 ---------- */

  function collectFacts(concept, seed, want) {
    if (!root.Worksheets || typeof root.Worksheets.generate !== 'function') throw Error('기존 Worksheets 생성기를 찾지 못했습니다.');
    const found = new Map();
    const ids = concept.legacy;
    let stale = 0;
    // 한 번에 32개씩(기존 생성기의 유한한 풀을 넘기지 않게) 여러 번 뽑아 조건에 맞는 것만 모은다.
    // 더 뽑아도 새 문제가 안 나오면(풀을 다 모으면) 그만둔다.
    for (let batch = 0; batch < 400 && found.size < want && stale < 40; batch++) {
      const id = ids[batch % ids.length];
      let rows;
      try { rows = root.Worksheets.generate(id, (seed + Math.imul(batch, 2654435761)) >>> 0, 32); }
      catch (error) { throw Error(concept.name + ': 기존 생성기 실패 - ' + error.message); }
      const before = found.size;
      for (const raw of rows) {
        const a = Number(raw.a), b = Number(raw.b);
        if (!Number.isInteger(a) || !Number.isInteger(b)) continue;
        if (raw.op !== MINUS) continue;
        if (!concept.accept(a, b)) continue;
        const key = a + ':' + b;
        if (!found.has(key)) found.set(key, { a, b, op: MINUS, answer: a - b });
      }
      stale = found.size === before ? stale + 1 : 0;
    }
    return found;
  }

  // 쉬운 것 → 어려운 것 순서를 지키면서 문제 풀 전체에 고르게 퍼지게 고른다.
  function drawFacts(concept, seed, need) {
    const want = Math.min(concept.cap, Math.max(need * 2 + 40, 120));
    const found = collectFacts(concept, seed, want);
    const usable = [];
    for (const fact of found.values()) if (!concept.easy(fact.a, fact.b)) usable.push(fact);
    usable.sort(byDifficulty);
    if (usable.length < need) throw Error(concept.name + ': 조건에 맞는 고유 문항이 ' + usable.length + '개뿐입니다(필요 ' + need + '개).');
    if (usable.length === need) return usable.slice();
    const picked = [];
    for (let i = 0; i < need; i++) picked.push(usable[Math.floor(i * usable.length / need)]);
    return picked;
  }

  /* ---------- 4. 잘못된 계산 과정(고치기 유형) ---------- */
  // spec 의 errorKinds 를 이 단계에서 실제로 나오는 틀린 풀이로 옮긴 것.
  // wrong 은 틀린 답, borrow 는 틀린 풀이에 적힌 받아내림 값(null 이면 받아내리지 않은 풀이)이다.
  // 답과 같아지거나 0 이하가 되는 값은 쓰지 않는다.

  const ERRORS = {
    '0-2-2-0': [
      { id: 'minus-one', note: '일의 자리에서 하나를 더 뺌', wrong: f => f.answer - 1, borrow: () => null },
      { id: 'tens-sub', note: '일의 자리 수를 십의 자리에서 뺌', wrong: f => (tens(f.a) > f.b ? (tens(f.a) - f.b) * 10 + ones(f.a) : null), borrow: () => null },
      { id: 'plus-one', note: '일의 자리에서 하나를 덜 뺌', wrong: f => f.answer + 1, borrow: () => null },
      { id: 'drop-zero', note: '0이 되는 자리를 빠뜨림', wrong: f => (f.answer % 10 === 0 ? f.answer / 10 : null), borrow: () => null }
    ],
    '0-2-2-1': [
      { id: 'big-small', note: '일의 자리에서 큰 수에서 작은 수를 무조건 뺌', wrong: f => tens(f.a) * 10 + (f.b - ones(f.a)), borrow: () => null },
      { id: 'minus-one', note: '일의 자리에서 하나를 더 뺌', wrong: f => f.answer - 1, borrow: f => tens(f.a) - 1 },
      { id: 'plus-one', note: '일의 자리에서 하나를 덜 뺌', wrong: f => f.answer + 1, borrow: f => tens(f.a) - 1 },
      { id: 'digit-order', note: '답의 두 자리를 바꾸어 씀', wrong: f => (ones(f.answer) === 0 ? null : Number(String(f.answer).split('').reverse().join(''))), borrow: f => tens(f.a) - 1 }
    ],
    '0-2-2-2': [
      { id: 'minus-one', note: '일의 자리에서 하나를 더 뺌', wrong: f => f.answer - 1, borrow: () => null },
      { id: 'swap-b', note: '아랫수의 자리를 바꾸어 씀', wrong: f => (ones(f.b) === tens(f.b) ? null : f.a - (ones(f.b) * 10 + tens(f.b))), borrow: () => null },
      { id: 'plus-one', note: '일의 자리에서 하나를 덜 뺌', wrong: f => f.answer + 1, borrow: () => null },
      { id: 'drop-zero', note: '0이 되는 자리를 빠뜨림', wrong: f => (f.answer % 10 === 0 ? f.answer / 10 : null), borrow: () => null }
    ],
    '0-2-2-3': [
      { id: 'tens-kept', note: '받아내린 뒤 윗자리 수를 줄이지 않음', wrong: f => f.answer + 10, borrow: f => tens(f.a) },
      { id: 'digit-order', note: '답의 두 자리를 바꾸어 씀', wrong: f => (ones(f.answer) === 0 ? null : Number(String(f.answer).split('').reverse().join(''))), borrow: f => tens(f.a) - 1 },
      { id: 'minus-one', note: '일의 자리에서 하나를 더 뺌', wrong: f => f.answer - 1, borrow: f => tens(f.a) - 1 },
      { id: 'plus-one', note: '일의 자리에서 하나를 덜 뺌', wrong: f => f.answer + 1, borrow: f => tens(f.a) - 1 }
    ],
    '0-2-2-4': [
      { id: 'tens-kept', note: '받아내린 뒤 윗자리 수를 줄이지 않음', wrong: f => f.answer + 10, borrow: f => tens(f.a) },
      { id: 'big-small', note: '큰 수에서 작은 수를 무조건 뺌', wrong: f => (tens(f.a) - tens(f.b)) * 10 + (ones(f.b) - ones(f.a)), borrow: () => null },
      { id: 'ten-dropped', note: '받아낸 10을 일의 자리에 더하지 않음', wrong: f => (tens(f.a) - 1 - tens(f.b)) * 10 + ones(f.b), borrow: f => tens(f.a) - 1 },
      { id: 'plus-one', note: '일의 자리에서 하나를 덜 뺌', wrong: f => f.answer + 1, borrow: f => tens(f.a) - 1 }
    ]
  };

  function correctionItems(facts, conceptId, seed) {
    const kinds = ERRORS[conceptId];
    const rnd = random(seed ^ 0x5bf03635);
    const items = [], used = new Set();
    const offset = rnd(0, kinds.length - 1);
    facts.forEach((fact, index) => {
      // 오류 종류를 문항마다 돌려 가며 쓴다(한 장이 같은 실수만 반복하지 않게).
      for (let step = 0; step < kinds.length; step++) {
        const kind = kinds[(offset + index + step) % kinds.length];
        const wrong = kind.wrong(fact);
        if (wrong == null || !Number.isInteger(wrong) || wrong < 1 || wrong === fact.answer) continue;
        const key = fact.a + ':' + fact.b + ':' + wrong;
        if (used.has(key)) continue;
        used.add(key);
        items.push({ ...fact, kind: kind.id, kindNote: kind.note, wrong: wrong, wrongBorrow: kind.borrow(fact) });
        break;
      }
    });
    if (items.length !== facts.length) throw Error(conceptId + ': 고치기 문항 ' + facts.length + '개를 채우지 못했습니다.');
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
  const SHORT_NAME = {
    '0-2-2-0': '두 자리 − 한 자리(받아내림 없음)',
    '0-2-2-1': '두 자리 − 한 자리(받아내림 있음)',
    '0-2-2-2': '두 자리 − 두 자리(받아내림 없음)',
    '0-2-2-3': '두 자리 − 두 자리(받아내림 있음)',
    '0-2-2-4': '몇십에서 빼기'
  };
  const TASK_SHORT = { t1: '가로셈', t2: '세로셈', t3: '빈칸 채우기', t4: '고치기' };
  const INSTRUCTION = {
    t1: '계산하여 답을 쓰세요.',
    t2: '계산하여 답을 쓰세요.',
    t3: '빈칸에 알맞은 수를 써넣으세요.',
    t4: '잘못된 곳을 찾아 바르게 고쳐 쓰세요.'
  };
  // 서식 이름은 sheet.js 의 minimumCellMm 이 칸 높이 하한을 고르는 데 쓰므로 'vertical'/'correction' 을 넣어 둔다.
  const FORMAT = { t1: 'g022-horizontal', t2: 'g022-vertical', t3: 'g022-vertical-missing', t4: 'g022-correction' };

  // cols × rows 는 layout-rules §2 의 최소 기준(가로셈 45, 세로셈·빈칸 48, 고치기 12)을 넘게 잡은 기본값이다.
  // workLines 는 받아내림 줄까지 넣은 칸 높이 하한(workLines × 4.7 + 4)mm 이며, 자동 맞춤이 이 하한과
  // 실제 칸 넘침을 보고 줄 수를 늘린다.
  const LAYOUT = {
    // 한 장 최대 40문제: 가로셈 3단 × 13줄 = 39, 세로셈·빈칸 6단 × 6줄 = 36, 고치기 3단 × 4줄 = 12. 글자(pt)는 칸을 넘기지 않는 가장 큰 값.
    '0-2-2-0': { pt: { t1: 26, t2: 23, t3: 23, t4: 20 }, fontPt: 13, workLines: 4, t1: [3, 13], t2: [6, 6], t3: [6, 6], t4: [3, 4] },
    '0-2-2-1': { pt: { t1: 26, t2: 21, t3: 21, t4: 20 }, fontPt: 13, workLines: 5, t1: [3, 13], t2: [6, 6], t3: [6, 6], t4: [3, 4] },
    '0-2-2-2': { pt: { t1: 26, t2: 23, t3: 23, t4: 20 }, fontPt: 13, workLines: 4, t1: [3, 12], t2: [6, 6], t3: [6, 6], t4: [3, 4] },
    '0-2-2-3': { pt: { t1: 26, t2: 21, t3: 21, t4: 20 }, fontPt: 13, workLines: 5, t1: [3, 13], t2: [6, 6], t3: [6, 6], t4: [3, 4] },
    '0-2-2-4': { pt: { t1: 26, t2: 21, t3: 21, t4: 20 }, fontPt: 13, workLines: 5, t1: [3, 13], t2: [6, 6], t3: [6, 6], t4: [3, 4] }
  };

  const TYPES = [];
  Object.keys(CONCEPTS).forEach((conceptId, conceptIndex) => {
    const concept = CONCEPTS[conceptId], layout = LAYOUT[conceptId];
    for (const key of ['t1', 't2', 't3', 't4']) {
      const cols = layout[key][0], rows = layout[key][1];
      TYPES.push({
        typeId: conceptId + '-' + key,
        title: SHORT_NAME[conceptId] + ' · ' + TASK_SHORT[key],
        instruction: INSTRUCTION[key],
        format: FORMAT[key],
        cols: cols, rows: rows, count: cols * rows,
        fontPt: layout.pt[key],
        autoFit: false,
        maxProblems: 40,
        workLines: layout.workLines,
        ...(conceptId === '0-2-2-2' && key === 't1' ? { maxProblems: 36 } : {}),   // 받아내림 없음 가로셈은 36문제로 고정
        seed: 20261002 + conceptIndex * 137 + Number(key.slice(1)) * 7,
        gen: { bundle: '0-2-2', concept: conceptId, task: key, legacyId: concept.legacy[0], borrow: concept.borrow }
      });
    }
  });

  /* ---------- 6. 유형별 문항 만들기 ---------- */

  function questionsFor(config) {
    const gen = config.gen || {};
    const concept = CONCEPTS[gen.concept];
    if (!concept) throw Error('묶음 0-2-2에 없는 개념입니다: ' + gen.concept);
    const count = config.count || config.cols * config.rows;
    const facts = drawFacts(concept, Number(config.seed) || 1, count);
    if (facts.length !== count) throw Error(config.typeId + ': 문항 ' + count + '개를 채우지 못했습니다.');
    if (gen.task === 't4') return correctionItems(facts, gen.concept, Number(config.seed) || 1);
    return facts.map(fact => ({ ...fact, task: gen.task }));
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

  function pad(text, width) {
    return String(text).padStart(width, ' ').slice(-width);
  }

  // digits: { text, mask:Set(빈칸), box:bool(빈칸 상자), mark:Set(정답지에서 짚어 줄 자리), reveal:bool(정답지) }
  function digitRow(width, options) {
    const o = options || {};
    const line = node('div', 'g022-row' + (o.className ? ' ' + o.className : ''));
    line.append(node('span', 'g022-sign', o.sign ? o.sign : NBSP));
    const chars = pad(o.text == null ? '' : o.text, width).split('');
    for (let i = 0; i < width; i++) {
      const isBlank = o.mask && o.mask.has(i) && !o.reveal;   // 정답지에서는 빈칸 자리에 답을 인쇄한다
      const digit = node('span', 'g022-digit');
      if (isBlank) { digit.textContent = NBSP; if (o.box) digit.classList.add('g022-blank'); }
      else {
        digit.textContent = chars[i] === ' ' ? NBSP : chars[i];
        if (o.mark && o.mark.has(i)) digit.classList.add('g022-mark');
      }
      line.append(digit);
    }
    return line;
  }

  // 받아내림을 적는 작은 칸. 십의 자리 위에만 두고, value 를 주면 그 값을 적는다(정답지·틀린 풀이).
  function borrowRow(width, value, blank) {
    const line = node('div', 'g022-row g022-borrow');
    const tensAt = width - 2;   // 두 자리 수의 십의 자리 자리(왼쪽부터 센 자리)
    line.append(node('span', 'g022-sign'));
    for (let i = 0; i < width; i++) {
      const digit = node('span', 'g022-digit');
      if (i === tensAt && value != null) { digit.textContent = String(value); digit.classList.add('g022-borrow-value'); }
      else if (i === tensAt && blank) { digit.textContent = NBSP; digit.classList.add('g022-blank'); }
      else digit.textContent = NBSP;
      line.append(digit);
    }
    return line;
  }

  // 세로셈 한 벌. resultText 를 주면 답 줄에 그 값을 인쇄한다(정답지·틀린 풀이).
  function stack(fact, concept, options) {
    const o = options || {};
    const width = o.width || stackWidth(fact);
    const box = node('div', 'g022-stack');
    if (concept.borrow) box.append(borrowRow(width, o.borrowValue, o.borrowBlank));
    box.append(digitRow(width, { text: fact.a, mask: o.mask && o.mask.a, box: o.box, reveal: o.reveal }));
    box.append(digitRow(width, { text: fact.b, sign: MINUS, mask: o.mask && o.mask.b, box: o.box, reveal: o.reveal }));
    box.append(digitRow(width, {
      text: o.resultText == null ? '' : o.resultText,
      mask: o.mask && o.mask.result, box: o.boxResult, mark: o.markResult, reveal: o.reveal,
      className: 'g022-rule g022-res'
    }));
    return box;
  }

  function centered(child) {
    const wrap = node('div', 'g022-cell');
    wrap.append(child);
    return wrap;
  }

  /* 가로셈으로 계산하기 */
  function renderHorizontal(cell, q, answer) {
    css();
    const line = node('div', 'g022-eq');
    line.append(node('span', 'g022-exp', q.a + ' ' + MINUS + ' ' + q.b + ' ='));
    line.append(node('span', 'g022-answer', answer ? String(q.answer) : NBSP));
    cell.append(centered(line));
  }

  /* 세로셈으로 계산하기: 받아내림이 있는 개념은 십의 자리 위에 받아내림 칸을 둔다 */
  function renderVertical(cell, q, answer, config) {
    css();
    const concept = CONCEPTS[config.gen.concept];
    cell.append(centered(stack(q, concept, {
      resultText: answer ? String(q.answer) : null,
      borrowBlank: concept.borrow,
      borrowValue: concept.borrow && answer ? tens(q.a) - 1 : null
    })));
  }

  /* 세로 풀이의 빈칸 채우기: 자리별 중간 계산을 인쇄하고 1~2곳만 빈칸으로 둔다 */
  function renderMissing(cell, q, answer, config) {
    css();
    const concept = CONCEPTS[config.gen.concept];
    const width = stackWidth(q);
    // 문제지에는 답의 십의 자리까지만 인쇄하고 일의 자리를 빈칸으로 둔다(자리 맞춤은 왼쪽부터).
    const tensText = q.answer >= 10 ? pad(String(Math.floor(q.answer / 10)), width - 1) : ' '.repeat(width - 1);
    const options = {
      mask: { result: new Set([width - 1]) },
      boxResult: true,
      reveal: answer,
      resultText: answer ? String(q.answer) : tensText + ' ',
      borrowBlank: concept.borrow,
      borrowValue: concept.borrow && answer ? tens(q.a) - 1 : null
    };
    cell.append(centered(stack(q, concept, options)));
  }

  /* 잘못된 계산 과정 고치기: 틀린 풀이 옆에 바르게 고쳐 쓰는 빈 세로셈 */
  function renderCorrection(cell, q, answer, config) {
    css();
    const concept = CONCEPTS[config.gen.concept];
    const width = stackWidth(q, q.wrong);
    const wrongText = pad(q.wrong, width), correctText = pad(q.answer, width);
    // 정답지에서는 틀린 답과 바른 답이 다른 자리만 짚어 준다.
    const marks = new Set();
    if (answer) for (let i = 0; i < width; i++) if (wrongText[i] !== correctText[i]) marks.add(i);
    const wrong = node('div', 'g022-wrong');
    wrong.append(stack(q, concept, { width: width, resultText: wrongText, reveal: true, markResult: answer ? marks : null, borrowValue: q.wrongBorrow }));
    const redo = node('div', 'g022-redo');
    redo.style.width = (width * 1.12 + 1.1).toFixed(2) + 'em';
    redo.style.height = ((concept.borrow ? 0.85 : 0) + 3 * 1.3 + 0.15).toFixed(2) + 'em';
    if (answer) redo.append(stack(q, concept, { width: width, resultText: correctText, reveal: true, borrowValue: concept.borrow ? tens(q.a) - 1 : null }));
    const pair = node('div', 'g022-fix');
    pair.append(wrong, node('span', 'g022-arrow', '→'), redo);
    cell.append(centered(pair));
  }

  /* ---------- 8. 이 묶음 전용 CSS (공용 파일은 건드리지 않는다) ---------- */

  function css() {
    if (document.getElementById('g022-styles')) return;
    const style = node('style');
    style.id = 'g022-styles';
    style.textContent = [
      '.g022-cell{height:100%;display:flex;align-items:center;justify-content:center}',
      '.g022-stack{display:inline-flex;flex-direction:column;font-variant-numeric:tabular-nums}',
      '.g022-row{display:flex;justify-content:flex-end;align-items:center;height:1.3em}',
      '.g022-digit,.g022-sign{display:inline-flex;align-items:center;justify-content:center;width:1.12em;height:1.25em}',
      '.g022-sign{width:.9em}',
      '.g022-borrow{height:.85em}',
      '.g022-borrow .g022-digit{font-size:.62em;height:1.05em;color:#444}',
      '.g022-borrow .g022-blank,.g022-borrow .g022-borrow-value{border:1px solid #ccc}',
      '.g022-blank{border:1px solid #666;border-radius:2px;background:#fbfbfb}',
      '.g022-mark{background:#dcdcdc;border-radius:2px}',
      '.g022-rule{border-top:1px solid #111}',
      '.g022-res{min-height:1.3em}',
      '.g022-eq{display:flex;align-items:center;gap:1.6mm;white-space:nowrap;line-height:1.2}',
      '.g022-exp{letter-spacing:.02em}',
      '.g022-answer{display:inline-flex;align-items:center;justify-content:center;min-width:11mm;height:1.6em;border:1px solid #666;border-radius:2px;background:#fbfbfb;padding:0 1mm}',
      '.g022-fix{display:flex;align-items:center;gap:2.4mm}',
      '.g022-wrong{opacity:.95}',
      '.g022-arrow{color:#999;font-size:11pt}',
      '.g022-redo{border:1px dashed #b9b9b9;border-radius:2px;box-sizing:content-box;padding:0 1mm}'
    ].join('');
    document.head.append(style);
  }

  /* ---------- 9. 등록: 카탈로그 · 서식 · 생성기 ---------- */

  if (root.Sheet && typeof root.Sheet.register === 'function') {
    for (const [key, render] of Object.entries({
      'g022-horizontal': renderHorizontal,
      'g022-vertical': renderVertical,
      'g022-vertical-missing': renderMissing,
      'g022-correction': renderCorrection
    })) {
      try { root.Sheet.register(key, render); }
      catch (error) { /* 다른 묶음이 먼저 등록한 서식은 건드리지 않는다 */ }
    }
  }

  if (root.SheetGen && typeof root.SheetGen.generate === 'function' && !root.SheetGen.__g022) {
    const original = root.SheetGen.generate;
    const wrapped = config => (config.gen && config.gen.bundle === '0-2-2' ? questionsFor(config) : original(config));
    wrapped.__g022 = true;
    root.SheetGen.generate = wrapped;
  }

  if (Array.isArray(root.SheetCatalog)) root.SheetCatalog.push(...TYPES);

  root.GoogoodanG022 = { concepts: CONCEPTS, types: TYPES, layout: LAYOUT, errors: ERRORS, questionsFor, drawFacts, correctionItems };
})(globalThis);
