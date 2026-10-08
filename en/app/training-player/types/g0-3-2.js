/* 묶음 0-3-2 — 여러 자리 수의 곱셈 (제작자 A, 2026-10-02)
 *
 * 이 파일 하나에 묶음 0-3-2 의 유형 28개를 모두 담는다.
 *   (worksheet-types.json 의 개념 0-3-2-0 ~ 0-3-2-6 × 유형 t1 ~ t4)
 *     t1 가로셈으로 계산하기   t2 세로셈으로 계산하기
 *     t3 세로 풀이의 빈칸 채우기   t4 잘못된 계산 과정 고치기
 * 공용 파일(sheet.js, formats-*.js, gen-bridge.js, catalog.js)은 고치지 않고 이미 열려 있는
 * 등록 지점만 쓴다.
 *   Sheet.register(key, render)   격자 서식(가로셈·세로셈·빈칸·고치기)
 *   SheetGen.generate 감싸기      이 묶음 typeId 의 문제 생성(gen-bridge 와 같은 방식)
 *
 * 개념이 정하는 조건(로드맵 이름 + spec-*.json params)
 * --------------------------------------------------
 *   0-3-2-0  몇십 × 한 자리 수            첫째 수는 10~90 의 몇십, 둘째 수 2~9          72가지
 *   0-3-2-1  두 자리 × 한 자리 — 올림 없음  두 자리 × 2~9, 자리마다 올림 0회            48가지
 *   0-3-2-2  두 자리 × 한 자리 — 올림 있음  두 자리 × 2~9, 올림 1회 이상              672가지
 *   0-3-2-3  세 자리 × 한 자리            세 자리 × 2~9                          7,200가지
 *   0-3-2-4  두 자리 × 몇십              두 자리 × 10~90 의 몇십                    810가지
 *   0-3-2-5  두 자리 × 두 자리            두 자리 × 두 자리(몇십은 0-3-2-4 개념)      7,290가지
 *   0-3-2-6  세 자리 × 두 자리            세 자리 × 두 자리(몇십 제외)              72,900가지
 *
 * 문제는 사이트의 기존 생성기(Worksheets.generate)에서 뽑아 조건에 맞는 것만 남기고, 모자라면
 * 개념 조건을 만족하는 나머지 사실에서 더 뽑는다(신규 문제 엔진을 만들지 않는다). 가짓수가
 * 충분한 개념은 같은 문제를 한 장에 한 번만 쓰고, 같은 seed 면 같은 문제지가 나온다(seed 에 typeId 를 섞어 같은 개념의
 * t1~t4 가 같은 문제를 내지 않게 했다).
 *
 * 곱하는 수가 1인 문항(×1)은 어느 개념에도 넣지 않았다. 답이 곱해지는 수 그대로라 훈련의 값이
 * 없고, §2 의 "0·1이 들어가는 쉬운 문제는 10% 이하"를 지키는 데도 도움이 된다. 그래서 각 개념의
 * 문제 풀은 위 표의 수와 같다(예: 0-3-2-2 는 99×1 을 빼 672가지).
 *
 * 한 장 문항 수(layout-rules §2 최소 기준, sheet.js 자동 맞춤이 남는 높이만큼 늘린다)
 * ------------------------------------------------------------------
 *   t1 가로셈   0-3-2-0 4단×15줄=60(짧은 식) · 나머지 3단×15줄=45 · 0-3-2-5·6 2단×15줄=30(긴 식)
 *   t2 세로셈   ×한 자리 5단×7줄=35(0-3-2-0·1·2·3) · ×두 자리 4단×5줄=20(0-3-2-4·5·6)
 *   t3 빈칸     t2 와 같은 단·줄(§2 "같은 연산의 세로셈과 같은 단·줄")
 *   t4 고치기   3단×4줄=12  — 28유형 모두 §2 최소 기준을 넘긴다(풀 크기 때문에 못 채우는 유형 없음)
 * 세로셈의 칸 높이 하한은 workLines 로 잡는다(sheet.js minimumCellMm): ×한 자리 5줄,
 * ×두 자리 9줄(받아올림 줄 + 두 수 + 가로줄 + 부분곱 2줄 + 가로줄 + 답). 그래서 인쇄되는
 * 문항 수는 20(4단×5줄)~24, 가로셈은 자동 맞춤이 페이지 높이까지 늘려 72(0-3-2-0)까지 간다.
 * 실제 인쇄 문항 수는 검수 기록 표에 적어 두었다(같은 조건이면 브라우저·seed 와 무관하게 같다).
 *
 * 쉬운 문제(0이나 1이 들어간 문항) 비율
 * ----------------------------------
 *   0-3-2-0 과 0-3-2-4 는 문제 자체가 '몇십'이라 0이 개념 정의다. 그래서 0-3-2-0 은 첫째 수의
 *   0을, 0-3-2-4 는 둘째 수의 0을 세지 않고 나머지 수(0-3-2-4 는 곱해지는 수)에 0·1이 들어간
 *   경우만 쉬운 문항으로 센다. 그 밖의 개념은 피연산자 두 수에 0·1이 들어가면 쉬운 문항이다.
 *   쉬운 문항은 뒤로 미루고 어려운 문항을 먼저 채운다(모자랄 때만 쉬운 문항을 쓴다).
 *   0-3-2-1(올림 없음)은 48가지 중 0·1이 없는 식이 14가지뿐이다. t1~t3 은 이 14가지를
 *   고르게 반복해 최소 문항 수를 채우고, 같은 식이 바로 옆·아래에 놓이지 않게 한다.
 *   0-3-2-0·0-3-2-4 는 0% 다.
 *
 * 서식(모두 이 파일 안에만 둔다 — 공용 파일은 고치지 않는다)
 * ------------------------------------------------------------------
 *   g032-horizontal             가로셈(칸 가운데, 답 쓰는 자리)
 *   g032-vertical-mul           세로셈(받아올림 칸 + 두 수 + 가로줄 + [부분곱] + 답)
 *   g032-vertical-mul-missing   같은 세로셈에서 1~2곳만 빈칸(자리별 중간 계산은 인쇄)
 *   g032-vertical-mul-correction 틀린 풀이 옆에 바르게 고쳐 쓰는 빈 세로셈
 *   칸 폭은 유형마다 고정(곱해지는 수 자리 + 곱하는 수 자리)이라 한 장 안의 문제 모양이 모두
 *   같다(§5). 답은 정답지에만 채우고 문제지에는 비운다. 빈칸 유형은 계산 과정을 인쇄하고
 *   빈칸만 비우며, 고치기 유형의 '틀린 풀이'는 틀린 결과까지 인쇄한다(고칠 곳을 찾는 활동).
 *   머리말 제목이 길어 잘리지 않도록 이 묶음 서식에서만 머리말 글자를 작게 쓴다.
 */
(function (root) {
  'use strict';

  const NBSP = ' ';

  /* ------------------------------------------------------------ 1. 작은 도구 */
  const node = (tag, cls, value) => {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (value != null) el.textContent = value;
    return el;
  };
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
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      const swap = out[i]; out[i] = out[j]; out[j] = swap;
    }
    return out;
  }
  /** seed 에 typeId 를 섞는다 — 같은 개념의 t1~t4 가 같은 문제를 내지 않게(같은 유형·같은 seed 는 그대로). */
  function typeSeed(config) {
    const text = String((config && config.typeId) || '');
    let hash = 0x811C9DC5;
    for (let i = 0; i < text.length; i++) { hash ^= text.charCodeAt(i); hash = Math.imul(hash, 0x01000193); }
    return (((Number(config && config.seed) >>> 0) || 1) ^ hash) >>> 0;
  }
  const factKey = (a, b) => a + '×' + b;

  /* ------------------------------------------------------- 2. 곱셈 자리 계산 */
  /** 자리마다 올림을 계산한다. out[p] = p번째 자리(0=일의 자리)에서 위로 올린 수. */
  function mulCarries(a, b) {
    const out = [];
    let carry = 0, x = a, place = 0;
    while (x > 0) {
      const t = (x % 10) * b + carry;
      carry = Math.floor(t / 10);
      out[place] = carry;
      x = Math.floor(x / 10); place++;
    }
    return out;
  }
  /** 올림이 일어난 횟수(곱해지는 수의 자리에서 위로 올린 것만). 0이면 '올림 없음'. */
  function carryCount(a, b) {
    const list = mulCarries(a, b), length = String(a).length;
    let count = 0;
    for (let p = 0; p < length - 1; p++) if (list[p] > 0) count++;
    return count;
  }
  /** 올림을 다음 자리에 더하지 않고 자리마다 곱만 한 값(흔한 계산 실수). */
  function withoutCarry(a, b) {
    let value = 0, place = 1, x = a;
    while (x > 0) { value += ((x % 10) * b % 10) * place; place *= 10; x = Math.floor(x / 10); }
    return value;
  }

  /* ---------------------------------------------------------------- 3. 개념 */
  // accept 는 개념 이름이 정하는 조건 그대로다. b >= 2 는 ×1(너무 쉬운 문항)을 뺀 것이다.
  const CONCEPTS = [
    {
      id: '0-3-2-0', name: '몇십 × 한 자리 수', short: '몇십×한자리',
      legacy: 'natural-mul-2-1', steps: 1, carry: true, range: { a: [10, 90], b: [2, 9] },
      accept: (a, b) => a % 10 === 0
    },
    {
      id: '0-3-2-1', name: '두 자리 수 × 한 자리 수 — 올림 없음', short: '두자리×한자리·올림없음',
      legacy: 'natural-mul-2-1', steps: 1, carry: false, range: { a: [10, 99], b: [2, 9] },
      // 마지막 십의 자리에서 백의 자리로 넘어가는 올림도 금지한다.
      accept: (a, b) => a >= 10 && a <= 99 && b >= 2 && b <= 9 && mulCarries(a, b).every(carry => carry === 0)
    },
    {
      id: '0-3-2-2', name: '두 자리 수 × 한 자리 수 — 올림 있음', short: '두자리×한자리·올림있음',
      legacy: 'natural-mul-2-1', steps: 1, carry: true, range: { a: [10, 99], b: [2, 9] },
      accept: (a, b) => carryCount(a, b) > 0
    },
    {
      id: '0-3-2-3', name: '세 자리 수 × 한 자리 수', short: '세자리×한자리',
      legacy: 'natural-mul-3-1', steps: 1, carry: true, range: { a: [100, 999], b: [2, 9] },
      accept: () => true
    },
    {
      id: '0-3-2-4', name: '두 자리 수 × 몇십', short: '두자리×몇십',
      legacy: 'natural-mul-2-2', steps: 1, carry: true, range: { a: [10, 99], b: [10, 90] },
      accept: (a, b) => b % 10 === 0
    },
    {
      id: '0-3-2-5', name: '두 자리 수 × 두 자리 수', short: '두자리×두자리',
      legacy: 'natural-mul-2-2', steps: 2, carry: true, range: { a: [10, 99], b: [11, 99] },
      accept: (a, b) => b % 10 !== 0
    },
    {
      id: '0-3-2-6', name: '세 자리 수 × 두 자리 수', short: '세자리×두자리',
      legacy: 'natural-mul-3-2', steps: 2, carry: true, range: { a: [100, 999], b: [11, 99] },
      accept: (a, b) => b % 10 !== 0
    }
  ];
  const BY_ID = {};
  for (const concept of CONCEPTS) {
    concept.width = String(concept.range.a[1]).length + String(concept.range.b[1]).length;
    BY_ID[concept.id] = concept;
  }

  /** 쉬운 문항(0·1이 들어간 것). 몇십은 0이 개념 정의라 그 자리는 세지 않는다(파일 머리말 참고). */
  function isEasy(concept, fact) {
    if (concept.id === '0-3-2-0') return false;
    const text = concept.id === '0-3-2-4' ? String(fact.a) : String(fact.a) + String(fact.b);
    return /[01]/.test(text);
  }
  // 쉬운 것 → 어려운 것: 답이 작은 것부터, 같은 답이면 곱해지는 수·곱하는 수 순서로.
  const byDifficulty = (x, y) => Number(x.answer) - Number(y.answer) || Number(x.a) - Number(y.a) || Number(x.b) - Number(y.b);

  /** 개념 조건을 만족하는 모든 사실(문제 풀). 어려운 것부터가 아니라 쉬운 것부터 정렬해 둔다. */
  const POOLS = new Map();
  function poolFacts(concept) {
    if (POOLS.has(concept.id)) return POOLS.get(concept.id);
    const out = [];
    for (let a = concept.range.a[0]; a <= concept.range.a[1]; a++) {
      for (let b = concept.range.b[0]; b <= concept.range.b[1]; b++) {
        if (!concept.accept(a, b)) continue;
        out.push({ a, b, op: '×', answer: a * b });
      }
    }
    out.sort(byDifficulty);
    POOLS.set(concept.id, out);
    return out;
  }
  function poolCount(concept) {
    let total = 0;
    for (let a = concept.range.a[0]; a <= concept.range.a[1]; a++) {
      for (let b = concept.range.b[0]; b <= concept.range.b[1]; b++) if (concept.accept(a, b)) total++;
    }
    return total;
  }

  /* ---------------------------------------- 4. 기존 생성기에서 조건에 맞게 뽑기 */
  function drawLegacy(concept, seed, want) {
    const out = [], seen = new Set();
    if (!root.Worksheets || typeof root.Worksheets.generate !== 'function') return out;
    for (let batch = 0; batch < 1500 && out.length < want; batch++) {
      let rows;
      try { rows = root.Worksheets.generate(concept.legacy, (seed + batch * 104729) >>> 0, 16); }
      catch (error) { break; }
      for (const row of rows || []) {
        const a = Number(row.a), b = Number(row.b);
        if (!Number.isInteger(a) || !Number.isInteger(b) || a < 2 || b < 2) continue;
        if (!concept.accept(a, b)) continue;                  // 개념 조건에 맞는 문제만 남긴다
        const key = factKey(a, b);
        if (seen.has(key)) continue;
        seen.add(key); out.push({ a, b, op: '×', answer: a * b });
        if (out.length >= want) break;
      }
    }
    return out;
  }
  /** 목록에서 n개를 고르게 뽑는다(앞에서부터 잘라 쓰면 개념 범위의 한쪽만 덮게 된다). */
  function spread(list, want) {
    if (want <= 0) return [];
    if (list.length <= want) return list.slice();
    if (want === 1) return [list[0]];
    const out = [];
    for (let i = 0; i < want; i++) out.push(list[Math.round(i * (list.length - 1) / (want - 1))]);
    return out;
  }
  /** 한 장의 문제: 기존 생성기 → 조건 여과 → 중복 제거 → 모자라면 개념 풀에서 보충 → 쉬운 순 정렬. */
  function pickFacts(concept, config, count) {
    // 올림 없는 식은 어려운 사실이 14가지뿐이다. §6의 작은 문제 풀 반복 규칙을 적용한다.
    // 한 바퀴(14문항)를 같은 순서로 돌리면 3단·5단에서 같은 식의 간격이
    // 바로 옆(1칸)이나 바로 아래(3·5칸)가 되지 않으며 사용 횟수 차이도 1 이하이다.
    if (concept.id === '0-3-2-1' && config.gen && ['t1', 't2', 't3'].includes(config.gen.task)) {
      const facts = poolFacts(concept).filter(fact => !isEasy(concept, fact));
      const rnd = random(typeSeed(config));
      const ordered = [];
      for (let i = 0; i < facts.length; i += 4) ordered.push(...shuffle(facts.slice(i, i + 4), rnd));
      return Array.from({ length: count }, (_, i) => ordered[i % ordered.length]);
    }
    // 고치기(t4)도 어려운 사실이 14가지뿐이라 매번 같은 장이 나왔다. 쉬운 문제 10% 이하 규칙을 지키면서(14문항 중 1문항)
    // 어려운 14가지에서 13가지를 seed 로 고르고, 쉬운 문제 34가지 중 1가지를 seed 로 골라 장마다 달라지게 한다.
    if (concept.id === '0-3-2-1' && config.gen && config.gen.task === 't4' && count >= 8) {
      const rnd4 = random((typeSeed(config) ^ 0x7F4A7C15) >>> 0);
      const all = poolFacts(concept);
      const hard = shuffle(all.filter(fact => !isEasy(concept, fact)), rnd4).slice(0, count - 1);
      const easy = shuffle(all.filter(fact => isEasy(concept, fact) && fact.a % 10 !== 0), rnd4).slice(0, 1);
      return hard.concat(easy).sort(byDifficulty);
    }
    if (poolCount(concept) < count) throw Error(config.typeId + ': 조건에 맞는 문제가 ' + poolCount(concept) + '개뿐입니다(필요 ' + count + '개).');
    const seed = typeSeed(config);
    const legacy = shuffle(drawLegacy(concept, seed, Math.min(count * 3, 1200)), random(seed ^ 0x9E3779B9));
    const picked = [], used = new Set();
    const take = (list, want) => {
      const fresh = list.filter(fact => !used.has(factKey(fact.a, fact.b)));
      for (const fact of spread(fresh, want)) { used.add(factKey(fact.a, fact.b)); picked.push(fact); }
    };
    take(legacy.filter(fact => !isEasy(concept, fact)), count);
    // 올림 없는 식의 어려운 문제는 14개뿐이므로 보충 풀까지 먼저 살펴본다.
    if (concept.id === '0-3-2-1' && picked.length < count) {
      take(poolFacts(concept).filter(fact => !isEasy(concept, fact)), count - picked.length);
    }
    if (picked.length < count) take(legacy.filter(fact => isEasy(concept, fact)), count - picked.length);
    if (picked.length < count) {
      const pool = poolFacts(concept);
      take(pool.filter(fact => !isEasy(concept, fact)), count - picked.length);
      if (picked.length < count) take(pool.filter(fact => isEasy(concept, fact)), count - picked.length);
    }
    if (picked.length !== count) throw Error(config.typeId + ': 문항 ' + count + '개를 만들지 못했습니다.');
    return picked.sort(byDifficulty);
  }

  /* ------------------------------------------------- 5. 잘못된 계산(고치기 유형) */
  const WRONGS = {
    'zero-lost': { note: '곱의 0을 빠뜨림', value: (a, b) => (b % 10 === 0 ? a * (b / 10) : a % 10 === 0 ? (a / 10) * b : null) },
    'carry-lost': { note: '받아올림을 더하지 않음', value: (a, b) => (b >= 10 ? withoutCarry(a, b % 10) + withoutCarry(a, Math.floor(b / 10)) * 10 : withoutCarry(a, b)) },
    'carry-lost-tens': { note: '십의 자리에서 받아올림을 더하지 않음', value: (a, b) => (b % 10 === 0 ? withoutCarry(a, b / 10) * 10 : null) },
    'place-swap': { note: '자릿값을 혼동함', value: (a, b) => Number(String(a).split('').reverse().join('')) * b },
    'ones-only': { note: '십의 자리를 빠뜨림', value: (a, b) => (a % 10) * b },
    'add-instead': { note: '곱셈을 덧셈으로 계산함', value: (a, b) => a + b },
    'shift-lost': { note: '부분곱의 자리를 잘못 맞춤', value: (a, b) => a * (b % 10) + a * Math.floor(b / 10) },
    'tens-lost': { note: '십의 자리 부분곱을 빠뜨림', value: (a, b) => a * (b % 10) }
  };
  const KINDS = {
    '0-3-2-0': ['zero-lost', 'add-instead', 'place-swap'],
    '0-3-2-1': ['place-swap', 'zero-lost', 'ones-only'],
    '0-3-2-2': ['carry-lost', 'place-swap', 'add-instead'],
    '0-3-2-3': ['carry-lost', 'place-swap', 'ones-only'],
    '0-3-2-4': ['zero-lost', 'carry-lost-tens', 'add-instead'],
    '0-3-2-5': ['shift-lost', 'carry-lost', 'tens-lost'],
    '0-3-2-6': ['shift-lost', 'carry-lost', 'tens-lost']
  };
  /** 틀린 값은 바른 값과 달라야 하고 칸 수 안에 들어가야 한다. 안 되면 다음 오류 종류로 넘어간다. */
  function wrongFor(concept, item, index) {
    const kinds = KINDS[concept.id] || [];
    for (let step = 0; step < kinds.length; step++) {
      const kind = kinds[(index + step) % kinds.length];
      const value = WRONGS[kind].value(Number(item.a), Number(item.b));
      if (!Number.isInteger(value) || value <= 0) continue;
      if (value === Number(item.answer)) continue;
      if (String(value).length > concept.width) continue;
      // 두 자리 곱셈은 틀린 결과가 보이는 부분곱과 맞아떨어지도록 틀린 부분곱도 함께 만든다.
      let rows = null;
      if (concept.steps === 2) {
        const a = Number(item.a), ones = Number(item.b) % 10, tens = Math.floor(Number(item.b) / 10);
        if (kind === 'shift-lost') rows = { p1: a * ones, p2: a * tens, shift: 0 };
        else if (kind === 'tens-lost') rows = { p1: a * ones, hideP2: true, shift: 1 };
        else if (kind === 'carry-lost') rows = { p1: withoutCarry(a, ones), p2: withoutCarry(a, tens), shift: 1 };
      }
      return { kind, value, note: WRONGS[kind].note, rows };
    }
    return null;
  }

  /* ------------------------------------------------------------ 6. 빈칸 고르기 */
  /** 자리마다 올림 칸. box=false 는 칸을 그리지 않는 자리(곱해지는 수의 일의 자리 위). */
  function carrySlots(concept, a, b) {
    const width = concept.width, length = String(a).length;
    const factor = concept.steps === 2 ? b % 10 : b % 10 === 0 ? b / 10 : b;
    const carries = mulCarries(a, factor);
    const slots = [];
    for (let i = 0; i < width; i++) slots.push({ box: false, value: 0 });
    for (let p = 0; p <= length - 2; p++) {
      const column = width - 2 - p;
      if (column >= 0 && column < width) slots[column] = { box: true, value: carries[p] || 0 };
    }
    return slots;
  }
  /** 문항마다 1~2곳을 빈칸으로 둔다(자리별 중간 계산은 인쇄한다). 빈칸 답은 계산으로 하나로 정해진다. */
  function blanksOf(concept, item, index) {
    const width = concept.width;
    const column = place => width - 1 - place;
    const blanks = new Set();
    const resultLength = String(item.answer).length;
    const carries = carrySlots(concept, Number(item.a), Number(item.b))
      .map((slot, i) => (slot.box && slot.value ? i : -1)).filter(i => i >= 0);
    const variant = index % 3;
    if (variant === 0) {
      if (carries.length) blanks.add('carry:' + carries[carries.length - 1]);
      else blanks.add('result:' + column(0));
    } else if (variant === 1) {
      blanks.add('result:' + column(0));
    } else if (concept.steps === 2) {
      blanks.add('p2:' + column(1));
      blanks.add('result:' + column(0));
    } else {
      blanks.add('result:' + column(0));
      if (resultLength >= 2) blanks.add('result:' + column(1));
    }
    return blanks;
  }

  /* ------------------------------------------------------------ 7. 이 묶음 CSS */
  function installCss() {
    if (typeof document === 'undefined' || document.getElementById('g032-styles')) return;
    const style = node('style');
    style.id = 'g032-styles';
    style.textContent = [
      '.g032-center{height:100%;min-height:0;display:flex;flex-direction:column;align-items:center;justify-content:center}',
      '.g032-stack{--g032-slot:1.12em;display:inline-flex;flex-direction:column;font-variant-numeric:tabular-nums}',
      '.g032-stack .vertical-row{height:1.3em}',
      '.g032-stack .vertical-digit{width:var(--g032-slot);height:1.25em}',
      '.g032-stack .vertical-sign{width:1em}',
      // 받아올림 칸은 아래 자리 칸과 같은 폭이어야 자리가 맞는다(글자 .62em 기준 1.8em = 1.12em).
      '.g032-stack .carry-row .vertical-digit{width:1.8em;height:1.15em;font-size:.62em;border:1px solid #c9c9c9;color:#666}',
      '.g032-stack .carry-row .g032-nocarry{border:0}',
      '.g032-blank{border:1px solid #444;border-radius:2px;background:#fbfbfb}',
      '.g032-ink{color:#d71f10}',
      '.g032-sumrow{min-height:1.3em}',
      '.g032-mark{background:#dedede}',
      '.g032-eq{display:flex;align-items:center;gap:1.6mm;white-space:nowrap;line-height:1.2}',
      '.g032-eq .g032-answer{display:inline-flex;align-items:center;justify-content:center;min-width:3em;height:1.6em;border-bottom:1px solid #555}',
      '.g032-fix{display:flex;align-items:center;justify-content:center;gap:.5mm}',
      '.g032-arrow{color:#999;font-size:.9em}',
      '.g032-redo{border:1px dashed #c9c9c9;border-radius:2px;padding:0 .3mm}',
      '.g032-note{margin-top:.8mm;font-size:7.5pt;color:#444;max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
      // 머리말 제목이 길어 잘리지 않도록 이 묶음 서식에서만 머리말을 작게 쓴다(정답지의 ' · 정답'까지
      // 한 줄에 들어가는 크기다 — 제목 자리 208px 에 가장 긴 제목이 190px).
      'body[data-format^="g032-"] .sheet-head,body[data-format^="g032-"] .sheet-title{font-size:8pt;}'
    ].join('');
    document.head.append(style);
  }

  /* ------------------------------------------------------------ 8. 서식 그리기 */
  /** 세로셈 한 줄. shift 칸만큼 왼쪽으로 밀어 쓴다(부분곱의 자리 맞춤). */
  function digitRow(concept, text, options) {
    const o = options || {};
    const row = node('div', 'vertical-row' + (o.cls ? ' ' + o.cls : '') + (o.rule ? ' vertical-rule' : ''));
    row.append(node('span', 'vertical-sign', o.sign || NBSP));
    const digits = String(text == null ? '' : text);
    const shift = o.shift || 0;
    for (let i = 0; i < concept.width; i++) {
      const place = concept.width - 1 - i - shift;
      const char = place >= 0 && place < digits.length ? digits[digits.length - 1 - place] : '';
      const blank = o.blank && o.blank.has(o.key + ':' + i);
      const span = node('span', 'vertical-digit');
      if (blank) {
        span.classList.add('g032-blank');
        span.textContent = o.reveal && char ? char : NBSP;
        if (o.reveal && char && o.ink) span.classList.add('g032-ink');
      } else if (char) {
        span.textContent = char;
        if (o.mark && o.mark.has(i)) span.classList.add('g032-mark');
      } else span.textContent = NBSP;
      row.append(span);
    }
    return row;
  }
  /** 받아올림 줄. 문제지에서는 비워 두고(학생이 쓰는 칸) 정답지·빈칸 유형에서는 인쇄한다. */
  function carryRow(concept, item, options) {
    const o = options || {};
    const row = node('div', 'vertical-row carry-row');
    row.append(node('span', 'vertical-sign', NBSP));
    const slots = carrySlots(concept, Number(item.a), Number(item.b));
    slots.forEach((slot, i) => {
      const span = node('span', 'vertical-digit');
      if (!slot.box) { span.classList.add('g032-nocarry'); span.textContent = NBSP; row.append(span); return; }
      const blank = o.blank && o.blank.has('carry:' + i);
      const show = (o.showCarries || o.reveal) && slot.value ? String(slot.value) : '';
      if (blank) span.classList.add('g032-blank');
      span.textContent = blank && !o.reveal ? NBSP : show || NBSP;
      if (show && o.ink && (blank || !o.printed)) span.classList.add('g032-ink');
      row.append(span);
    });
    return row;
  }
  /** 세로셈 한 벌. view 로 문제지·정답지·빈칸·고치기를 가른다. */
  function buildStack(concept, item, view) {
    const o = view || {};
    const stack = node('div', 'vertical g032-stack');
    if (concept.carry) stack.append(carryRow(concept, item, o));
    stack.append(digitRow(concept, item.a, { key: 'a', sign: '', blank: o.blank, reveal: o.reveal, ink: o.ink }));
    stack.append(digitRow(concept, item.b, { key: 'b', sign: '×', blank: o.blank, reveal: o.reveal, ink: o.ink }));
    if (concept.steps === 2) {
      const ones = Number(item.b) % 10, tens = Math.floor(Number(item.b) / 10);
      const p1 = o.p1 != null ? o.p1 : Number(item.a) * ones;
      const p2 = o.p2 != null ? o.p2 : Number(item.a) * tens;
      const showPartials = !!(o.reveal || o.printed);
      stack.append(digitRow(concept, showPartials ? p1 : '', { key: 'p1', rule: true, blank: o.blank, reveal: o.reveal, ink: o.ink }));
      stack.append(digitRow(concept, o.hideP2 || !showPartials ? '' : p2, {
        key: 'p2', shift: o.p2Shift === 0 ? 0 : 1, blank: o.blank, reveal: o.reveal, ink: o.ink
      }));
    }
    const text = o.resultText != null ? o.resultText : o.fillResult ? item.answer : '';
    stack.append(digitRow(concept, text, {
      key: 'result', rule: true, cls: o.printed ? 'g032-sumrow' : 'vertical-result', blank: o.blank, reveal: o.reveal, ink: o.ink, mark: o.mark
    }));
    return stack;
  }
  /** 정답지에서 틀린 자리를 표시하기 위해, 틀린 값과 바른 값이 다른 칸을 찾는다. */
  function wrongMarks(concept, item) {
    const wrong = String(item.wrong), right = String(item.answer);
    const marks = new Set();
    for (let place = 0; place < concept.width; place++) {
      const w = wrong.length - 1 - place >= 0 ? wrong[wrong.length - 1 - place] : '';
      const r = right.length - 1 - place >= 0 ? right[right.length - 1 - place] : '';
      if (w !== r) marks.add(concept.width - 1 - place);
    }
    return marks;
  }

  const ANSWER_VIEW = { reveal: true, fillResult: true, showCarries: true, ink: true };
  function renderHorizontal(cell, item, answer) {
    installCss();
    const wrap = node('div', 'g032-center');
    const line = node('div', 'g032-eq');
    line.append(node('span', '', item.a + ' × ' + item.b + ' ='));
    line.append(node('span', 'g032-answer' + (answer ? ' g032-ink' : ''), answer ? String(item.answer) : NBSP));
    wrap.append(line);
    cell.append(wrap);
  }
  function renderVertical(cell, item, answer, config) {
    installCss();
    const concept = BY_ID[config.gen.concept];
    const wrap = node('div', 'g032-center');
    wrap.append(buildStack(concept, item, answer ? ANSWER_VIEW : {}));
    cell.append(wrap);
  }
  function renderMissing(cell, item, answer, config) {
    installCss();
    const concept = BY_ID[config.gen.concept];
    const wrap = node('div', 'g032-center');
    // 문제지에서도 자리별 중간 계산과 답을 인쇄하고, 빈칸으로 고른 1~2곳만 비운다.
    wrap.append(buildStack(concept, item, Object.assign({ fillResult: true, showCarries: true, printed: true, blank: item.blank }, answer ? { reveal: true, ink: true } : {})));
    cell.append(wrap);
  }
  function renderCorrection(cell, item, answer, config) {
    installCss();
    const concept = BY_ID[config.gen.concept];
    const wrap = node('div', 'g032-center');
    const row = node('div', 'g032-fix');
    const wrong = node('div', 'g032-wrong');
    // 틀린 풀이는 문제지에서도 틀린 결과까지 보여 준다(고칠 곳을 찾는 활동).
    wrong.append(buildStack(concept, item, {
      fillResult: true, showCarries: item.kind === 'carry-lost', resultText: item.wrong, printed: true,
      p1: item.wrongRows ? item.wrongRows.p1 : null, p2: item.wrongRows ? item.wrongRows.p2 : null,
      hideP2: !!(item.wrongRows && item.wrongRows.hideP2),
      p2Shift: item.kind === 'shift-lost' ? 0 : 1,
      mark: answer ? wrongMarks(concept, item) : null
    }));
    const redo = node('div', 'g032-redo');
    redo.append(buildStack(concept, item, answer ? ANSWER_VIEW : {}));
    row.append(wrong, node('span', 'g032-arrow', '→'), redo);
    wrap.append(row);
    cell.append(wrap);
  }

  /* --------------------------------------------------------- 9. 유형별 문제 만들기 */
  function generateFor(config) {
    const gen = config.gen || {};
    const concept = BY_ID[gen.concept];
    if (!concept) throw Error('묶음 0-3-2: 알 수 없는 개념 ' + gen.concept);
    const count = config.count || config.cols * config.rows;
    const items = pickFacts(concept, config, count);
    if (gen.task === 't3') return items.map((item, index) => Object.assign({}, item, { blank: blanksOf(concept, item, index) }));
    if (gen.task === 't4') return items.map((item, index) => {
      const wrong = wrongFor(concept, item, index);
      if (!wrong) throw Error(config.typeId + ': 틀린 계산을 만들지 못했습니다(' + item.a + '×' + item.b + ')');
      return Object.assign({}, item, { wrong: wrong.value, wrongNote: wrong.note, kind: wrong.kind, wrongRows: wrong.rows });
    });
    return items;
  }

  /* ---------------------------------------------------------- 10. 유형 정의 */
  const LABELS = { t1: '가로셈', t2: '세로셈', t3: '빈칸', t4: '고치기' };
  const TITLES = {
    t1: '가로셈으로 계산하기', t2: '세로셈으로 계산하기',
    t3: '세로 풀이의 빈칸 채우기', t4: '잘못된 계산 과정 고치기'
  };
  const INSTRUCTIONS = {
    t1: '계산하여 답을 쓰세요.', t2: '계산하여 답을 쓰세요.',
    t3: '빈칸에 알맞은 수를 써넣으세요.', t4: '잘못된 곳을 찾아 바르게 고쳐 쓰세요.'
  };
  const FORMATS = {
    t1: 'g032-horizontal', t2: 'g032-vertical-mul',
    t3: 'g032-vertical-mul-missing', t4: 'g032-vertical-mul-correction'
  };
  // 단·줄은 layout-rules §2 의 최소 기준이고, 남는 높이는 sheet.js 자동 맞춤이 채운다.
  const GRIDS = {
    '0-3-2-0': { t1: [4, 15], t2: [5, 7], t3: [5, 7], t4: [3, 4] },
    '0-3-2-1': { t1: [2, 7], t2: [2, 7], t3: [2, 7], t4: [2, 7] },
    '0-3-2-2': { t1: [3, 15], t2: [5, 7], t3: [5, 7], t4: [3, 4] },
    '0-3-2-3': { t1: [3, 15], t2: [5, 7], t3: [5, 7], t4: [2, 6] },
    '0-3-2-4': { t1: [3, 15], t2: [4, 5], t3: [4, 5], t4: [2, 6] },
    '0-3-2-5': { t1: [2, 15], t2: [4, 5], t3: [4, 5], t4: [2, 5] },
    '0-3-2-6': { t1: [2, 15], t2: [4, 5], t3: [4, 5], t4: [2, 5] }
  };
  // workLines: sheet.js 가 칸 높이 하한을 (workLines × 4.7 + 4)mm 로 잡는다.
  //   ×한 자리 세로셈은 '받아올림칸 + 두 수 + 가로줄 + 답', ×두 자리는 여기에 부분곱 2줄을 더한다.
  const WORKLINES = {
    '0-3-2-0': { t2: 5, t3: 5, t4: 6 },
    '0-3-2-1': { t2: 4, t3: 4, t4: 5 },
    '0-3-2-2': { t2: 5, t3: 5, t4: 6 },
    '0-3-2-3': { t2: 5, t3: 5, t4: 6 },
    '0-3-2-4': { t2: 5, t3: 5, t4: 6 },
    '0-3-2-5': { t2: 9, t3: 9, t4: 10 },
    '0-3-2-6': { t2: 9, t3: 9, t4: 10 }
  };
  // 글자 크기: 본문 12pt. 가장 쉬운 0-3-2-0 은 13pt. 세 자리×두 자리 고치기만 틀린 풀이와
  //   빈 세로셈을 3단(칸 안쪽 56mm)에 나란히 놓아야 해서 10pt 로 줄인다(칸이 5자리 두 벌 + 화살표).
  const FONT_PT = {
    t1: { '0-3-2-0': 17, '0-3-2-1': 24, '0-3-2-2': 19, '0-3-2-3': 19, '0-3-2-4': 19, '0-3-2-5': 18, '0-3-2-6': 18 },
    t2: { '0-3-2-0': 15, '0-3-2-1': 20, '0-3-2-2': 15, '0-3-2-3': 17, '0-3-2-4': 15, '0-3-2-5': 16, '0-3-2-6': 15 },
    t4: { '0-3-2-0': 13, '0-3-2-1': 19, '0-3-2-2': 13, '0-3-2-3': 15, '0-3-2-4': 15, '0-3-2-5': 14, '0-3-2-6': 13 }
  };
  function fontOf(conceptId, task) {
    const table = FONT_PT[task === 't3' ? 't2' : task];
    return (table && table[conceptId]) || 12;
  }

  const TYPES = [];
  for (const concept of CONCEPTS) {
    for (const task of ['t1', 't2', 't3', 't4']) {
      const grid = GRIDS[concept.id][task];
      TYPES.push({
        typeId: concept.id + '-' + task,
        title: LABELS[task] + ' · ' + concept.short,
        instruction: INSTRUCTIONS[task],
        format: FORMATS[task],
        cols: grid[0], rows: grid[1], count: grid[0] * grid[1],
        fontPt: fontOf(concept.id, task),
        // 이 개념의 올림 없는 식은 48가지뿐이다. 자동 행 추가는 중복이나 올림을 강요한다.
        autoFit: concept.id === '0-3-2-1' ? false : undefined,
        maxProblems: concept.id === '0-3-2-1' ? 14 : undefined,   // 올림 없는 식의 서로 다른 어려운 문제가 14가지뿐 — 반복 없이 14문항
        seed: 20261001,
        workLines: WORKLINES[concept.id][task],
        gen: { bundle: '0-3-2', concept: concept.id, task, legacy: concept.legacy, width: concept.width, steps: concept.steps, carry: concept.carry }
      });
    }
  }

  /* ------------------------------------------------------------ 11. 등록 */
  if (root.Sheet && typeof root.Sheet.register === 'function') {
    for (const [key, render] of Object.entries({
      'g032-horizontal': renderHorizontal,
      'g032-vertical-mul': renderVertical,
      'g032-vertical-mul-missing': renderMissing,
      'g032-vertical-mul-correction': renderCorrection
    })) {
      try { root.Sheet.register(key, render); }
      catch (error) { /* 다른 묶음이 먼저 등록한 서식은 건드리지 않는다 */ }
    }
  }
  if (root.SheetGen && typeof root.SheetGen.generate === 'function' && !root.SheetGen.__g032) {
    const original = root.SheetGen.generate;
    const wrapped = function (config) {
      if (config && config.gen && config.gen.bundle === '0-3-2') return generateFor(config);
      return original.apply(this, arguments);
    };
    wrapped.__g032 = true;
    root.SheetGen.generate = wrapped;
  }
  if (Array.isArray(root.SheetCatalog)) root.SheetCatalog.push(...TYPES);

  /* --------------------------------------------- 12. 스스로 검사(검수자가 쓴다) */
  function selfTest(options) {
    const seeds = (options && options.seeds) || [1, 7, 42];
    const report = { sheets: 0, items: 0, easy: 0, problems: [] };
    const fail = message => { if (report.problems.length < 40) report.problems.push(message); };
    for (const type of TYPES) {
      const concept = BY_ID[type.gen.concept];
      for (const seed of seeds) {
        let items;
        try { items = generateFor(Object.assign({}, type, { seed })); }
        catch (error) { fail(type.typeId + ' seed ' + seed + ': ' + error.message); continue; }
        report.sheets += 1; report.items += items.length;
        const seen = new Set();
        const repeatsAllowed = concept.id === '0-3-2-1' && ['t1', 't2', 't3'].includes(type.gen.task);
        const counts = new Map();
        for (const item of items) {
          const key = item.a + ':' + item.b;
          if (seen.has(key) && !repeatsAllowed) fail(type.typeId + ' seed ' + seed + ': 같은 문제가 두 번 나왔습니다(' + key + ')');
          seen.add(key);
          counts.set(key, (counts.get(key) || 0) + 1);
          if (!concept.accept(Number(item.a), Number(item.b))) fail(type.typeId + ' seed ' + seed + ': 개념 조건을 벗어난 문항(' + key + ')');
          if (Number(item.a) * Number(item.b) !== Number(item.answer)) fail(type.typeId + ' seed ' + seed + ': 정답이 틀렸습니다(' + key + ')');
          if (item.wrong != null) {
            if (Number(item.wrong) === Number(item.answer)) fail(type.typeId + ' seed ' + seed + ': 틀린 풀이가 바른 값(' + key + ')');
            if (String(item.wrong).length > concept.width) fail(type.typeId + ' seed ' + seed + ': 틀린 값이 칸을 넘습니다(' + key + ')');
          }
          if (item.blank) for (const slot of item.blank) {
            const [row, column] = slot.split(':');
            const place = concept.width - 1 - Number(column);
            const digits = row === 'carry' ? '' : String(row === 'result' ? item.answer : row === 'p1' ? Number(item.a) * (Number(item.b) % 10) : row === 'p2' ? Number(item.a) * Math.floor(Number(item.b) / 10) : item[row]);
            if (row !== 'carry' && !(place >= 0 && place < digits.length)) fail(type.typeId + ' seed ' + seed + ': 빈칸이 빈 자리에 놓였습니다(' + key + ' ' + slot + ')');
          }
          if (isEasy(concept, item)) report.easy += 1;
        }
        if (repeatsAllowed) {
          const keys = items.map(item => factKey(item.a, item.b));
          const uses = [...counts.values()];
          if (items.some((item, i) =>
            (i % type.cols > 0 && keys[i] === keys[i - 1]) ||
            (i >= type.cols && keys[i] === keys[i - type.cols]))) {
            fail(type.typeId + ' seed ' + seed + ': 같은 식이 바로 옆이나 아래에 놓였습니다.');
          }
          if (Math.max(...uses) - Math.min(...uses) > 1) fail(type.typeId + ' seed ' + seed + ': 반복 횟수가 고르지 않습니다.');
          if (items.some(item => isEasy(concept, item))) fail(type.typeId + ' seed ' + seed + ': 쉬운 식이 포함되었습니다.');
        }
      }
    }
    if (report.problems.length) throw Error('묶음 0-3-2 자체 검사 실패: ' + report.problems.slice(0, 5).join(' / '));
    return report;
  }
  function repeatTest(typeId, seed) {
    const type = TYPES.find(entry => entry.typeId === typeId);
    if (!type) throw Error('묶음 0-3-2 에 없는 유형: ' + typeId);
    const first = JSON.stringify(generateFor(Object.assign({}, type, { seed })).map(item => [item.a, item.b, item.wrong == null ? '' : item.wrong]));
    const second = JSON.stringify(generateFor(Object.assign({}, type, { seed })).map(item => [item.a, item.b, item.wrong == null ? '' : item.wrong]));
    if (first !== second) throw Error(typeId + ': 같은 seed 인데 문제가 달라집니다.');
    return true;
  }

  root.G032Sheet = {
    concepts: CONCEPTS, types: TYPES, typeIds: TYPES.map(type => type.typeId),
    formats: FORMATS, grids: GRIDS, workLines: WORKLINES,
    generate: generateFor, poolFacts, poolCount, isEasy, selfTest, repeatTest,
    carries: mulCarries, carryCount, wrongFor
  };
})(globalThis);
