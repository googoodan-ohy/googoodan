/* 연산 트레이닝 묶음 0-1-2 — 두 자리 수의 덧셈 (제작자 A, 2026-10-02)

   이 파일 하나에 묶음 0-1-2 의 유형 20개를 모두 정의한다.
   (worksheet-types.json 의 개념 0-1-2-0 ~ 0-1-2-4 × 유형 t1~t4)

     t1 가로셈으로 계산하기        t2 세로셈으로 계산하기
     t3 세로 풀이의 빈칸 채우기     t4 잘못된 계산 과정 고치기

   개념별 조건 — spec\spec-natural.json 의 같은 typeId params 를 그대로 옮긴 것
   ----------------------------------------------------------------------
     0-1-2-0 두 자리 수 + 한 자리 수 · 받아올림 없음   a 10~99, b 1~9, 합 ≤ 99, 받아올림 0회
     0-1-2-1 두 자리 수 + 한 자리 수 · 받아올림 있음   a 10~99, b 1~9, 합 ≤ 99, 받아올림 1회
     0-1-2-2 두 자리 수 + 두 자리 수 · 받아올림 없음   a,b 10~99, 받아올림 0회
     0-1-2-3 두 자리 수 + 두 자리 수 · 받아올림 한 번 a,b 10~99, 받아올림 1회
     0-1-2-4 두 자리 수 + 두 자리 수 · 받아올림 두 번 a,b 10~99, 받아올림 2회
   받아올림 횟수는 일의 자리에서 십의 자리로, 십의 자리에서 백의 자리로 올라간 횟수를 센다
   (gen-bridge.js 의 carries() 와 같은 기준). 0-1-2-1 은 합 ≤ 99 라 받아올림이 두 번 생길 수
   없으므로 '1회 이상'이 곧 '1회'다. 0-1-2-0 은 합 ≤ 99 도 자동으로 지켜진다(받아올림이 없으면
   a ≤ 98, b ≤ 9 라 합 ≤ 99). 0-1-2-1 은 a ≥ 90 이면 합이 100 을 넘으므로 조건에서 빠진다.

   문제의 출처
   -----------
   사이트의 기존 생성기(Worksheets.generate, src/bank/legacy/types.js)만 쓴다.
     · 0-1-2-0, 0-1-2-1 → natural-add-2-1 (두 자리 + 한 자리)
     · 0-1-2-2 ~ 0-1-2-4 → natural-add-2-2 (두 자리 + 두 자리)
   기존 생성기는 위 조건을 직접 보장하지 않으므로(예: natural-add-2-1 은 95+7=102 도 낸다)
   뽑은 문제를 조건과 하나씩 대조해 걸러 내고, 모자라면 seed 를 바꾸어 더 뽑는다.
   새 문제 엔진은 만들지 않았고, 정답도 생성기가 낸 값(a+b)을 그대로 쓴다.
   받아올림 여부만 이 파일에서 자리별로 다시 세어 확인한다.

   문제 풀과 한 장의 문항 수
   -------------------------
   개념마다 조건에 맞는 문제가 360~4,095가지로 넉넉해(같은 문제 중복 금지 규칙을 지킬 수 있다)
   layout-rules §2 의 최소 기준을 그대로 기본값으로 삼았다.

     t1 가로셈 3단 × 15줄 = 45   (두~세 자리 가로셈 45)
     t2 세로셈 6단 × 8줄  = 48   (두 자리 세로셈 48)
     t3 빈칸   6단 × 8줄  = 48   (세로 풀이의 빈칸은 같은 연산의 세로셈과 같은 단·줄)
     t4 고치기 3단 × 4줄  = 12   (잘못된 계산 과정 고치기 12)

   sheet.js 의 자동 맞춤(autoFit)이 켜져 있어 칸 높이가 남으면 줄 수를 늘린다(§5). 실제 인쇄
   문항 수는 아래 '실측 문항 수'에 적었다. t1 은 서식 이름이 sheet.js 의 minimumCellMm 어느
   규칙에도 걸리지 않아 하한이 10mm 이므로 3단×26줄=78문항까지 늘어난다(칸 10.0mm 는 §5 의
   '문제 줄(약 6mm) + 여백 4mm'와 같다). t2·t3 은 workLines 5(칸 하한 27.5mm), t4 는 workLines 6
   (32.2mm)로 잡아 각각 9줄·8줄에서 멈춘다. 자동 맞춤이 문제 풀보다 많은 문항을 요구하면
   생성기가 오류를 내고 sheet.js 가 직전 줄 수로 되돌아간다(중복 인쇄 없음).

   쉬운 문제(0 또는 1이 들어간 문제) 비율 — layout-rules §2 '전체의 10% 이하'
   ------------------------------------------------------------------
   문제를 고를 때 쉬운 문항 수를 floor(문항 수 × 0.1)로 못박고, 나머지는 0·1이 들어가지 않는
   문제에서만 뽑는다(gen-bridge.js 가 쓰는 것과 같은 방식). 그래서 실제 인쇄 문항에서 쉬운
   문항은 항상 10% 이하다. 예: 45문항이면 4문항(8.9%), 78문항이면 7문항(9.0%).
   쉬운 문제도 문제 풀 전체에 고르게 퍼지게 뽑으므로 20+3 같은 문제가 한쪽 끝에 몰리지 않는다.

   수의 퍼짐
   ---------
   한 장이 개념 범위의 앞부분만 덮지 않도록, 문제 풀(400가지)을 쉬운 순으로 세운 뒤 문항 수만큼
   등분한 지점에서 하나씩 고르고(spread) 다시 쉬운 순으로 놓는다(order). 그래서 한 장의 합이
   개념 범위 전체에 퍼지고, 문항은 쉬운 것 → 어려운 것 순서가 된다(§2).

   머리말 제목
   -----------
   sheet.css 의 .sheet-head 에서 제목이 가질 수 있는 폭은 55mm 다(브라우저 실측). 정답지는
   시트 틀(sheet.js)이 제목 뒤에 ' · 정답' 을 붙이므로 제목은 42mm 안팎이어야 두 쪽 모두
   잘리지 않는다. 그래서 제목을 `활동·2+1자리 올림N` 꼴로 줄였다(예: '가로셈·2+1자리 올림1',
   41.8mm — 정답지 54.0mm 로 55mm 안에 들어간다. '두 자리+한 자리 받아올림 있음' 은 60.1mm 라
   잘린다). '2+1자리' 는 두 자리 수 + 한 자리 수, '올림N' 은 받아올림 N회를 뜻한다.
   0-1-2-0 은 '올림0', 0-1-2-3·4 는 '올림1'·'올림2' 다.

   서식
   ----
   가로셈·세로셈·빈칸·고치기 모두 이 묶음 전용 서식(g012-horizontal / g012-vertical /
   g012-correction)을 쓴다. 사이트 공용 서식(sheet.js 의 horizontal·vertical, formats-*.js)은
   고치지 않았고, sheet.js 에 등록만 했다. 공용 가로셈은 문제를 칸 위쪽에 붙여 놓아 칸이 넓은
   유형에서 아래가 비므로(§5), 같은 class 로 같은 모양을 그리되 가운데에 놓는 서식을 따로 뒀다.
   세로셈 칸 폭은 개념마다 고정(0-1-2-0·1·2 는 2칸, 0-1-2-3·4 는 3칸)이라 한 장 안의 문제 모양이
   모두 같다(§5). 0-1-2-3 은 합이 두 자리(십의 자리에서 올림이 없는 경우)와 세 자리(올림이 있는
   경우)가 섞이므로 칸을 3으로 고정해 모양을 맞췄다. 받아올림이 없는 개념(0-1-2-0·2)은 받아올림
   줄을 두지 않고, 받아올림이 있는 개념만 둔다(쓸 일 없는 상자를 남기지 않는다).

   잘못된 계산(고치기 t4)의 오류 종류 — spec errorKinds 와의 관계
   -------------------------------------------------------
   spec 의 errorKinds 는 개념 묶음마다 두세 가지 이름만 적혀 있어 그대로는 화면에 그릴 수 없다.
   그래서 이름을 실제로 나오는 틀린 값으로 옮기고, 그 값이 칸 폭을 넘거나 바른 답과 같으면
   쓰지 않고 다음 종류로 넘어간다(문항마다 종류를 돌려 가며 쓴다).

     받아올림 없는 개념(0-1-2-0·2)
       '일의 자리와 십의 자리를 섞어 더함' → place-swap   (자리별 합의 자리를 바꾸어 씀)
       '십의 자리의 합을 빠뜨림'           → tens-drop    (일의 자리 합만 답으로 씀)
       '자리 맞춤을 잘못함'               → align-shift  (0-1-2-0: b 를 십의 자리에 맞추어 더함)
                                            reverse-digits(0-1-2-2: 두 수의 자리를 각각 뒤집음)
       (예비) 합과 차를 혼동함            → sum-diff
     받아올림 있는 개념(0-1-2-1·3·4)
       '문제 조건을 빠뜨림'               → carry-lost   (받아올림한 10을 윗자리에 더하지 않음)
       '자릿값을 혼동함'                  → place-swap(0-1-2-3·4) / ones-sum(0-1-2-1)
       (예비) 받아올림을 두 번 더함        → carry-added
       (예비) 합과 차를 혼동함            → sum-diff
   spec 에 없는 예비 종류는 앞의 종류가 그 문항의 칸 폭에 맞지 않을 때만 쓰인다. 틀린 값은
   언제나 바른 답과 다르고 칸 폭 안에 들어간다.

   정답지
   ------
   문제지에서는 답을 쓰는 자리(가로셈 답 칸, 세로셈 결과 줄, 고치기의 고칠 칸)를 비우고,
   정답지에서만 채운다. 다만 빈칸(t3)은 '합을 보고 빈 자리를 찾는' 활동이라 합을 그대로 인쇄하고,
   고치기(t4)의 '틀린 풀이'는 틀린 결과까지 보여 주는 것이 활동이라 그대로 인쇄한다.
   정답지에는 고친 풀이와 함께 어떤 실수인지 한 줄 설명(✗ …)을 붙인다.

   검증
   ----
   파일 끝 selfTest() 가 5개념 × 4유형 × seed 여러 개에서 조건·정답·중복·쉬움 비율·빈칸 위치를
   스스로 검사한다. 브라우저 밖에서는 tools\check-g0-1-2.py 가 같은 검사를 실제 파일로 돌린다.
*/
(function (root) {
  'use strict';

  /* ================= 1. 작은 도구 ================= */

  const NBSP = ' ';

  const node = (tag, className, value) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (value !== undefined) el.textContent = value;
    return el;
  };

  // 기존 생성기·다른 묶음과 같은 방식의 결정적 난수 (같은 seed → 같은 문제지)
  function rng(seed) {
    let state = (Number(seed) >>> 0) || 1;
    return (lo, hi) => {
      state += 0x6d2b79f5;
      let t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return lo + Math.floor((((t ^ (t >>> 14)) >>> 0) / 4294967296) * (hi - lo + 1));
    };
  }

  const padLeft = (value, width) => String(value).padStart(width, ' ');
  const onesOf = (a, b) => (a % 10) + (b % 10);
  const tensOf = (a, b) => Math.floor(a / 10) + Math.floor(b / 10);

  /* ================= 2. 개념 정의 ================= */

  // legacy : 기존 생성기 id
  // digits : [a 자릿수, b 자릿수]        maxAnswer : 합의 최대(넘으면 버린다)
  // carryTest : 받아올림 횟수 조건       width : 세로셈 칸 수(한 장 안에서 고정)
  // carryRow : 받아올림 줄을 그릴지      kinds : 고치기에서 쓸 오류(개념별)
  const CONCEPTS = [
    {
      id: '0-1-2-0', name: '두 자리 수 + 한 자리 수 — 받아올림 없음',
      short: '2+1자리 올림0',
      legacy: 'natural-add-2-1', digits: [2, 1], maxAnswer: 99,
      carryTest: count => count === 0,
      width: 2, carryRow: false, font: 13,
      kinds: ['place-swap', 'tens-drop', 'align-shift', 'sum-diff']
    },
    {
      id: '0-1-2-1', name: '두 자리 수 + 한 자리 수 — 받아올림 있음',
      short: '2+1자리 올림1',
      legacy: 'natural-add-2-1', digits: [2, 1], maxAnswer: 99,
      carryTest: count => count >= 1,
      width: 2, carryRow: true, font: 13,
      kinds: ['carry-lost', 'ones-sum', 'carry-added', 'sum-diff']
    },
    {
      id: '0-1-2-2', name: '두 자리 수 + 두 자리 수 — 받아올림 없음',
      short: '2+2자리 올림0',
      legacy: 'natural-add-2-2', digits: [2, 2], maxAnswer: 198,
      carryTest: count => count === 0,
      width: 2, carryRow: false, font: 13,
      kinds: ['place-swap', 'tens-drop', 'reverse-digits', 'sum-diff']
    },
    {
      id: '0-1-2-3', name: '두 자리 수 + 두 자리 수 — 받아올림 한 번',
      short: '2+2자리 올림1',
      legacy: 'natural-add-2-2', digits: [2, 2], maxAnswer: 198,
      carryTest: count => count === 1,
      width: 3, carryRow: true, font: 13,
      kinds: ['carry-lost', 'place-swap', 'carry-added', 'sum-diff']
    },
    {
      id: '0-1-2-4', name: '두 자리 수 + 두 자리 수 — 받아올림 두 번',
      short: '2+2자리 올림2',
      legacy: 'natural-add-2-2', digits: [2, 2], maxAnswer: 198,
      carryTest: count => count === 2,
      width: 3, carryRow: true, font: 13,
      kinds: ['carry-lost', 'place-swap', 'carry-added', 'sum-diff']
    }
  ];
  const BY_ID = {};
  CONCEPTS.forEach(concept => { BY_ID[concept.id] = concept; });

  // 문제 풀(한 개념에서 모을 서로 다른 문제 수)과 자동 맞춤이 요구할 수 있는 문항 수 상한.
  // 상한 = 단 수 × 시도할 수 있는 최대 줄 수(sheet.js: t1 27줄, t2·t3 10줄, t4 9줄).
  // 개념 0-1-2-1 은 조건에 맞는 문제가 모두 360가지뿐이라 그보다 많이 모으려 해도 모이지 않는다
  // (모자라면 있는 만큼만 쓴다 — 아래 legacyFacts 가 더 나오지 않으면 그친다).
  const POOL_SIZE = 400;
  const CAP = 100;

  /* ================= 3. 개념 조건 ================= */

  // a + b 의 자리별 받아올림 횟수(백의 자리로 올라가는 것도 센다). gen-bridge.js 와 같은 기준.
  function carries(a, b) {
    let count = 0, carry = 0, x = Number(a), y = Number(b);
    while (x || y) {
      carry = (x % 10) + (y % 10) + carry >= 10 ? 1 : 0;
      count += carry;
      x = Math.floor(x / 10); y = Math.floor(y / 10);
    }
    return count;
  }

  function matches(concept, a, b) {
    if (!Number.isInteger(a) || !Number.isInteger(b)) return false;
    if (String(a).length !== concept.digits[0] || String(b).length !== concept.digits[1]) return false;
    if (a + b > concept.maxAnswer) return false;
    return concept.carryTest(carries(a, b));
  }

  // 0 또는 1이 들어간 쉬운 문제(§2 의 10% 규칙에서 세는 기준)
  const isEasy = item => /[01]/.test(String(item.a) + String(item.b));

  /* ================= 4. 잘못된 계산 만들기 ================= */

  const KINDS = {
    'place-swap': { note: '일의 자리와 십의 자리를 바꿈', value: (a, b) => onesOf(a, b) * 10 + tensOf(a, b) },
    'tens-drop': { note: '십의 자리를 더하지 않음', value: (a, b) => onesOf(a, b) },
    'align-shift': { note: '자리 맞춤이 어긋남', value: (a, b) => a + b * 10 },
    'reverse-digits': { note: '각 수의 자리를 뒤집음', value: (a, b) => Number(String(a).split('').reverse().join('')) + Number(String(b).split('').reverse().join('')) },
    'carry-lost': { note: '받아올림을 더하지 않음', value: (a, b) => a + b - (onesOf(a, b) >= 10 ? 10 : 100) },
    'carry-added': { note: '받아올림을 두 번 더함', value: (a, b) => a + b + 10 },
    'ones-sum': { note: '일의 자리만 답으로 씀', value: (a, b) => onesOf(a, b) },
    'sum-diff': { note: '합과 차를 혼동함', value: (a, b) => Math.abs(a - b) }
  };

  // 틀린 값은 바른 값과 달라야 하고, 이 개념의 세로셈 칸 수 안에 들어가야 한다.
  function wrongValue(kind, item, width) {
    const spec = KINDS[kind];
    if (!spec) return null;
    const value = spec.value(Number(item.a), Number(item.b));
    if (value == null || !Number.isFinite(value)) return null;
    const shown = String(value);
    if (!/^\d+$/.test(shown)) return null;
    if (Number(shown) === Number(item.answer)) return null;
    if (shown.length > width) return null;
    return shown;
  }

  /* ================= 5. 문제 만들기 ================= */

  // 기존 생성기에서 조건에 맞는 문제만 골라 낸다(모자라면 seed 를 바꾸어 더 뽑는다).
  // 개념의 문제를 다 모으면 더 뽑아도 새 문제가 나오지 않으므로, 새 문제가 하나도 안 나오는
  // 묶음이 이어지면 그친다(0-1-2-1 처럼 문제가 360가지뿐인 개념에서 헛도는 것을 막는다).
  function legacyFacts(concept, seed, needed) {
    if (!root.Worksheets || typeof root.Worksheets.generate !== 'function') throw Error('기존 Worksheets 생성기를 찾지 못했습니다.');
    const out = [], seen = new Set();
    let dry = 0;
    for (let batch = 0; batch < 4000 && out.length < needed && dry < 40; batch++) {
      let rows;
      try {
        rows = root.Worksheets.generate(concept.legacy, (Number(seed) + batch * 104729) >>> 0, 16);
      } catch (error) {
        throw Error('기존 생성기 실패(' + concept.legacy + '): ' + error.message);
      }
      const before = out.length;
      for (const row of rows) {
        const a = Number(row.a), b = Number(row.b);
        if (!matches(concept, a, b)) continue;
        const key = a + ':' + b;
        if (seen.has(key)) continue;
        seen.add(key);
        out.push({ a, b, op: '+', answer: a + b });
      }
      dry = out.length > before ? 0 : dry + 1;
    }
    return out;
  }

  // 쉬운 것 → 어려운 것(같은 조건 안에서 합·수 크기 기준). 같은 seed 면 같은 차례.
  function order(items, concept) {
    const key = item => [item.answer, item.a, item.b];
    return items.slice().sort((left, right) => {
      const x = key(left), y = key(right);
      for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) return x[i] - y[i];
      return 0;
    });
  }

  // 문제 풀을 count 등분한 지점에서 하나씩 고른다(한 장이 개념 범위의 앞부분만 덮지 않게).
  function spread(pool, count) {
    if (count >= pool.length) return pool.slice(0, count);
    if (count <= 1) return pool.slice(0, count);
    const picked = [], used = new Set();
    for (let i = 0; i < count; i++) {
      let index = Math.round(i * (pool.length - 1) / (count - 1));
      while (used.has(index) && index < pool.length - 1) index += 1;
      while (used.has(index) && index > 0) index -= 1;
      used.add(index);
      picked.push(pool[index]);
    }
    return picked;
  }

  // 문제 풀은 (개념, seed)마다 한 번만 모은다(자동 맞춤이 여러 줄 수를 시도해도 다시 뽑지 않는다).
  const poolCache = new Map();
  function wholePool(concept, seed) {
    const key = concept.id + ':' + seed;
    const hit = poolCache.get(key);
    if (hit) return hit;
    const sorted = order(legacyFacts(concept, seed, POOL_SIZE), concept);
    if (poolCache.size > 64) poolCache.clear();
    poolCache.set(key, sorted);
    return sorted;
  }

  // 쉬운 문항은 floor(문항 수 × 0.1)개까지만 넣고(§2), 나머지는 0·1이 없는 문제에서 뽑는다.
  function draw(concept, seed, count) {
    if (count > CAP) throw Error(concept.id + ': 이 유형은 ' + CAP + '문항까지입니다.');
    const pool = wholePool(concept, seed);
    const easy = [], hard = [];
    for (const item of pool) (isEasy(item) ? easy : hard).push(item);
    const easyCount = Math.min(Math.floor(count * 0.1), easy.length);
    const hardCount = count - easyCount;
    if (hardCount > hard.length) {
      throw Error(concept.id + ': 쉬운 문항을 10% 이하로 두면 쓸 수 있는 문제가 ' + (easyCount + hard.length) + '개뿐입니다(필요 ' + count + '개).');
    }
    return order(spread(easy, easyCount).concat(spread(hard, hardCount)), concept);
  }

  // t3: 한 자릿값(일·십·백)에 빈칸을 하나만 둔다. 같은 자릿값에서 두 수를
  // 함께 가리면 합과 받아올림 조건을 보여 줘도 여러 답이 가능하다.
  function blanks(concept, seed, count) {
    const items = draw(concept, seed, count);
    const rand = rng((Number(seed) ^ 0x5f3a7b1) >>> 0);
    const rowOf = item => ({ a: String(item.a), b: String(item.b), sum: String(item.answer) });
    return items.map(item => {
      const text = rowOf(item);
      const first = rand(0, 1) === 0 ? 'a' : 'b';
      const firstIndex = rand(0, text[first].length - 1);
      const firstPlace = text[first].length - 1 - firstIndex;
      const list = [{ row: first, index: firstIndex }];
      // 서로 다른 줄·자릿값에서만 두 번째 빈칸을 고른다. 오른쪽 자리부터
      // 계산하면 각 자리의 미지수가 하나이므로 답이 하나로 정해진다.
      if (rand(0, 2) === 0) {
        const candidates = [];
        for (const row of ['a', 'b', 'sum']) {
          if (row === first) continue;
          for (let index = 0; index < text[row].length; index++) {
            if (text[row].length - 1 - index !== firstPlace) candidates.push({ row, index });
          }
        }
        if (candidates.length) list.push(candidates[rand(0, candidates.length - 1)]);
      }
      return { ...item, blanks: list };
    });
  }

  // t4: 한 문제를 한 번만 쓰고, 문항마다 오류 종류를 돌려 가며 쓴다.
  function corrections(concept, seed, count) {
    const picked = draw(concept, seed, count);
    const items = [];
    picked.forEach((item, index) => {
      for (let step = 0; step < concept.kinds.length; step++) {
        const kind = concept.kinds[(index + step) % concept.kinds.length];
        const value = wrongValue(kind, item, concept.width);
        if (value == null) continue;
        items.push({ ...item, kind, wrong: value, wrongNote: KINDS[kind].note });
        break;
      }
    });
    if (items.length < count) throw Error(concept.id + ': 만들 수 있는 고치기 문제가 ' + count + '개보다 적습니다.');
    return order(items, concept);
  }

  // sheet/gen-bridge.js 의 생성기를 감싼다(다른 묶음 서식은 그대로 원래 생성기로 넘긴다).
  function generate(config) {
    const gen = config.gen || {};
    const concept = BY_ID[gen.concept];
    if (!concept) throw Error('묶음 0-1-2: 알 수 없는 개념 ' + gen.concept);
    const count = config.count || config.cols * config.rows;
    if (gen.mode === 'blank') return blanks(concept, config.seed, count);
    if (gen.mode === 'fix') return corrections(concept, config.seed, count);
    return draw(concept, config.seed, count);
  }

  /* ================= 6. 서식(CSS) ================= */

  const CSS = [
    '.g012-center{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;min-height:0}',
    '.g012-steps-wrap{display:flex;flex-direction:column;align-items:center;justify-content:center}',
    '.g012-steps{display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:8pt;line-height:1.1;white-space:nowrap;color:#444;font-variant-numeric:tabular-nums}',
    '.g012-blank{border:1px solid #333}',
    '.answer-page .g012-printed .vertical-digit:not(.g012-blank){color:#111 !important;font-weight:400 !important}',
    /* 받아올림 칸도 자리 칸과 같은 폭으로 맞춘다(0.65em 글자 기준 1.72em) */
    '.g012-center .carry-row .vertical-digit{width:1.72em;font-size:.65em !important}',
    /* 일의 자리 위 칸에는 받아올림이 생기지 않으므로 상자를 그리지 않는다(자리 맞춤용) */
    '.sheet-cell .carry-row .g012-nocarry{border:0}',
    '.g012-fix{display:flex;align-items:center;justify-content:center;gap:1.6mm}',
    '.g012-arrow{color:#999;font-size:11pt}',
    '.g012-wrong{color:#333}',
    '.g012-mark{color:#c00}',
    '.g012-redo{border:1px solid #ccc;box-sizing:border-box;background-image:repeating-linear-gradient(90deg,transparent 0,transparent calc(1.12em - 1px),#eee calc(1.12em - 1px),#eee 1.12em);background-position:left top}',
    '.g012-note{margin-top:1.4mm;font-size:7.5pt;color:#444;max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'
  ].join('');

  let styled = false;
  function installCss() {
    if (styled || typeof document === 'undefined') return;
    if (document.getElementById('g012-styles')) { styled = true; return; }
    styled = true;
    const style = document.createElement('style');
    style.id = 'g012-styles';
    style.textContent = CSS;
    document.head.append(style);
  }

  /* ================= 7. 세로셈 그리기 ================= */

  // 열별 받아올림(왼쪽 기준 열 인덱스 → 그 열 위에 쓰는 수). 정답지에만 채운다.
  function carriesOf(item, width) {
    const slots = new Array(width).fill(0);
    let carry = 0;
    for (let place = 0; place < width; place++) {
      const sum = Math.floor(Number(item.a) / 10 ** place) % 10 + Math.floor(Number(item.b) / 10 ** place) % 10 + carry;
      carry = Math.floor(sum / 10);
      const above = width - 2 - place;
      if (above >= 0) slots[above] = carry;
    }
    return slots;
  }

  // blankIndex 는 그 수의 왼쪽부터 센 자리. -1 이면 빈칸 없음.
  function digitRow(value, width, options) {
    const opts = options || {};
    const row = node('div', 'vertical-row' + (opts.cls ? ' ' + opts.cls : ''));
    row.append(node('span', 'vertical-sign', opts.sign || ''));
    const raw = String(value);
    const at = opts.blankIndex >= 0 ? width - raw.length + opts.blankIndex : -1;
    const chars = padLeft(raw, width).split('');
    chars.forEach((char, index) => {
      if (index === at) row.append(node('span', 'vertical-digit g012-blank', opts.answer ? char : NBSP));
      else if (char === ' ') row.append(node('span', 'vertical-digit', NBSP));
      else row.append(node('span', 'vertical-digit', char));
    });
    return row;
  }

  // 문제지(학생용)에서는 답 줄을 비운다. 채우는 경우는 셋뿐이다.
  //   ① 정답지(answer === true)
  //   ② 빈칸 유형(t3) — 합을 보고 빈 자리를 찾는 활동이라 합을 인쇄한다
  //   ③ 고치기(t4)의 '틀린 풀이' — 틀린 결과까지 보여 주는 것이 활동이다(keepResult)
  function resultFilled(item, answer, config) {
    return answer === true || !!(item && item.blanks) || config.keepResult === true;
  }

  function blankIndexAt(item, rowKey) {
    if (!item.blanks) return -1;
    const hit = item.blanks.filter(spot => spot.row === rowKey)[0];
    return hit ? hit.index : -1;
  }

  function stackOf(item, answer, config) {
    const width = config.width || 2;
    const stack = node('div', 'vertical');
    if (config.carryRow) {
      const slots = carriesOf(item, width);
      const row = node('div', 'vertical-row carry-row');
      row.append(node('span', 'vertical-sign'));
      slots.forEach((value, index) => {
        // 일의 자리 위 칸에는 받아올림이 생기지 않는다(자리 맞춤을 위해 칸은 남기고 상자를 없앤다).
        const cls = index === slots.length - 1 ? 'vertical-digit g012-nocarry' : 'vertical-digit';
        row.append(node('span', cls, answer && value ? String(value) : NBSP));
      });
      stack.append(row);
    }
    stack.append(digitRow(item.a, width, { answer, blankIndex: blankIndexAt(item, 'a') }));
    stack.append(digitRow(item.b, width, { sign: item.op || '+', answer, blankIndex: blankIndexAt(item, 'b') }));
    stack.append(digitRow(resultFilled(item, answer, config) ? item.answer : '', width, {
      // 빈칸 유형(t3)은 합을 문제지에 인쇄하므로 정답지에서도 검은색(아래 CSS 가 인쇄된 자리 글자를 검정으로 되돌린다)
      answer, cls: 'vertical-rule vertical-result' + (item.blanks ? ' g012-printed' : ''), blankIndex: blankIndexAt(item, 'sum')
    }));
    return stack;
  }

  // 빈칸 유형은 각 자리의 계산을 옆에 인쇄한다. 가린 숫자는 중간 식에서도 숨겨
  // 피연산자나 합의 빈칸 정답이 그대로 노출되지 않게 한다.
  function stepsOf(item, answer) {
    const steps = node('div', 'g012-steps');
    const digit = (row, place) => {
      const raw = String(row === 'sum' ? item.answer : item[row]);
      const index = raw.length - 1 - place;
      if (index < 0) return '0';
      return !answer && item.blanks.some(spot => spot.row === row && spot.index === index)
        ? '·' : raw[index];
    };
    let carry = 0;
    const places = Math.max(String(item.a).length, String(item.b).length);
    for (let place = 0; place < places; place++) {
      const a = Math.floor(item.a / 10 ** place) % 10;
      const b = Math.floor(item.b / 10 ** place) % 10;
      const sum = a + b + carry;
      const parts = [digit('a', place), '+', digit('b', place)];
      if (carry) parts.push('+', String(carry));
      parts.push('=', digit('sum', place) === '·' ? '·' : String(sum));
      steps.append(node('div', '', (place === 0 ? '일 ' : '십 ') + parts.join('')));
      carry = Math.floor(sum / 10);
    }
    return steps;
  }

  function renderVertical(cell, item, answer, config) {
    installCss();
    const wrap = node('div', 'g012-center');
    if (item.blanks) {
      wrap.append(stackOf(item, answer, config));   // 칸 위의 '일 0+1=1' 같은 자리별 풀이식은 싣지 않는다
    } else wrap.append(stackOf(item, answer, config));
    cell.append(wrap);
  }

  // 가로셈 — 공용 'horizontal' 과 같은 class 로 같은 모양을 그리되 칸 가운데에 놓는다
  // (문항이 적어 칸이 넓은 유형에서 문제 아래 빈 공간이 커지지 않게 하려는 것, layout-rules §5).
  function renderHorizontal(cell, item, answer, config) {
    installCss();
    const wrap = node('div', 'g012-center');
    const line = node('div', 'horizontal');
    line.append(node('span', '', item.a + ' ' + (item.op || '+') + ' ' + item.b + ' = '));
    line.append(node('span', 'answer-space', answer ? String(item.answer) : NBSP));
    wrap.append(line);
    cell.append(wrap);
  }

  // 틀린 풀이 옆에 바르게 고쳐 쓰는 빈 세로셈
  function renderCorrection(cell, item, answer, config) {
    installCss();
    const width = config.width || 2;
    const wrap = node('div', 'g012-center');
    const row = node('div', 'g012-fix');
    const wrong = node('div', 'g012-wrong');
    // 틀린 풀이는 문제지에서도 틀린 결과까지 그대로 보여 준다(고칠 곳을 찾는 활동).
    wrong.append(stackOf({ a: item.a, b: item.b, op: item.op, answer: item.wrong }, false,
      { width, carryRow: false, keepResult: true }));
    if (answer) wrong.classList.add('g012-mark');
    row.append(wrong, node('div', 'g012-arrow', '→'));
    const redo = node('div', 'g012-redo');
    redo.style.width = (width * 1.12 + 1.1).toFixed(2) + 'em';
    redo.style.height = (((config.carryRow ? 1 : 0) + 3) * 1.3).toFixed(2) + 'em';
    if (answer) redo.append(stackOf(item, true, config));
    row.append(redo);
    wrap.append(row);
    cell.append(wrap);
  }

  /* ================= 8. 유형 등록 ================= */

  const FORMATS = {
    horizontal: 'g012-horizontal',
    vertical: 'g012-vertical',
    correction: 'g012-correction'
  };

  const TYPES = [
    { key: 't1', title: '가로셈으로 계산하기', label: '가로셈', format: FORMATS.horizontal, mode: 'calc', instruction: '계산하여 답을 쓰세요.' },
    { key: 't2', title: '세로셈으로 계산하기', label: '세로셈', format: FORMATS.vertical, mode: 'calc', instruction: '계산하여 답을 쓰세요.' },
    { key: 't3', title: '세로 풀이의 빈칸 채우기', label: '빈칸', format: FORMATS.vertical, mode: 'blank', instruction: '빈칸에 알맞은 수를 써넣으세요.' },
    { key: 't4', title: '잘못된 계산 과정 고치기', label: '고치기', format: FORMATS.correction, mode: 'fix', instruction: '잘못된 곳을 찾아 바르게 고쳐 쓰세요.' }
  ];

  // layout-rules §2 의 최소 기준. sheet.js 자동 맞춤이 남는 높이만큼 줄을 늘린다.
  const GRIDS = {
    // 2026-10-02 1차 수정: 자동 맞춤(autoFit)을 끄고 한 장 상한(전체 40, 세 자리 합 30)에 맞춘 칸 수로 고정한다.
    '0-1-2-0': { t1: [3, 13], t2: [6, 6], t3: [6, 6], t4: [3, 7] },
    '0-1-2-1': { t1: [3, 13], t2: [6, 6], t3: [6, 6], t4: [3, 7] },
    '0-1-2-2': { t1: [3, 13], t2: [6, 6], t3: [6, 6], t4: [3, 7] },
    '0-1-2-3': { t1: [3, 13], t2: [6, 6], t3: [6, 6], t4: [3, 7] },
    '0-1-2-4': { t1: [3, 13], t2: [6, 6], t3: [6, 6], t4: [3, 7] }
  };

  // 유형별 글자 크기(pt) — 칸 아래가 비지 않게 키운 값(2026-10-02 1차 수정, 캡처로 확인).
  const FONTS = {
    '0-1-2-0': { t1: 20, t2: 22, t3: 22, t4: 18 },
    '0-1-2-1': { t1: 20, t2: 22, t3: 22, t4: 14 },
    '0-1-2-2': { t1: 17, t2: 22, t3: 22, t4: 18 },
    '0-1-2-3': { t1: 17, t2: 19, t3: 19, t4: 14 },
    '0-1-2-4': { t1: 17, t2: 19, t3: 19, t4: 14 }
  };

  // workLines: sheet.js 가 칸 높이 하한을 (workLines × 4.7 + 4)mm 로 잡는다.
  //   세로셈은 '받아올림 줄 + 두 수 + 답'(약 25mm), 고치기는 '틀린 풀이 + 설명 한 줄'(약 29mm)이
  //   들어갈 만큼 잡아야 자동 맞춤이 줄을 늘리다 내용을 잘라 내지 않는다.
  const WORKLINES = {
    '0-1-2-0': { t2: 5, t3: 5, t4: 6 },
    '0-1-2-1': { t2: 5, t3: 5, t4: 6 },
    '0-1-2-2': { t2: 5, t3: 5, t4: 6 },
    '0-1-2-3': { t2: 5, t3: 5, t4: 6 },
    '0-1-2-4': { t2: 5, t3: 5, t4: 6 }
  };

  // 유형마다 다른 seed 를 써서 같은 개념의 t1~t4 가 같은 문제지를 두 번 인쇄하지 않게 한다.
  function seedOf(conceptIndex, typeIndex) {
    return 20261001 + conceptIndex * 137 + typeIndex * 7;
  }

  function configOf(concept, type, conceptIndex, typeIndex) {
    const grid = GRIDS[concept.id][type.key];
    return {
      typeId: concept.id + '-' + type.key,
      title: type.label + '·' + concept.short,
      instruction: type.instruction,
      format: type.format,
      cols: grid[0], rows: grid[1], count: grid[0] * grid[1],
      fontPt: (FONTS[concept.id] && FONTS[concept.id][type.key]) || concept.font, seed: seedOf(conceptIndex, typeIndex),
      autoFit: false, maxProblems: Math.min(concept.width === 3 && type.key !== 't4' ? 40 : 40, grid[0] * grid[1]),
      width: concept.width, carryRow: concept.carryRow,
      workLines: WORKLINES[concept.id][type.key],
      gen: { bundle: '0-1-2', concept: concept.id, mode: type.mode, legacyId: concept.legacy }
    };
  }

  const typeIds = [];
  CONCEPTS.forEach((concept, conceptIndex) => {
    TYPES.forEach((type, typeIndex) => {
      typeIds.push(concept.id + '-' + type.key);
      if (Array.isArray(root.SheetCatalog)) root.SheetCatalog.push(configOf(concept, type, conceptIndex, typeIndex));
    });
  });

  function installFormats() {
    if (!root.Sheet || typeof root.Sheet.register !== 'function') return false;
    root.Sheet.register(FORMATS.horizontal, renderHorizontal);
    root.Sheet.register(FORMATS.vertical, renderVertical);
    root.Sheet.register(FORMATS.correction, renderCorrection);
    return true;
  }

  function installGenerator() {
    const base = root.SheetGen;
    if (!base || typeof base.generate !== 'function' || base.g012Wrapped) return false;
    const original = base.generate;
    base.generate = function (config) {
      if (config && config.gen && BY_ID[config.gen.concept]) return generate(config);
      return original.apply(this, arguments);
    };
    base.g012Wrapped = true;
    return true;
  }

  if (!installFormats()) document.addEventListener('DOMContentLoaded', installFormats, { once: true });
  if (!installGenerator()) document.addEventListener('DOMContentLoaded', installGenerator, { once: true });

  /* ================= 9. 스스로 검사 ================= */

  function selfTest(options) {
    const seeds = (options && options.seeds) || [20261001, 1, 7, 42];
    const report = { sheets: 0, items: 0, easy: 0, problems: [] };
    const fail = message => { report.problems.push(message); };
    CONCEPTS.forEach((concept, conceptIndex) => {
      TYPES.forEach((type, typeIndex) => {
        const config = configOf(concept, type, conceptIndex, typeIndex);
        for (const seed of seeds) {
          let items;
          try { items = generate({ ...config, seed }); }
          catch (error) { fail(config.typeId + ' seed ' + seed + ': ' + error.message); return; }
          report.sheets += 1;
          report.items += items.length;
          const problems = new Set();
          let easy = 0;
          for (const item of items) {
            if (isEasy(item)) easy += 1;
            const key = [item.a, item.op, item.b].join(':');
            if (problems.has(key)) fail(config.typeId + ' seed ' + seed + ': 같은 문제가 두 번 나왔습니다(' + key + ')');
            problems.add(key);
            const expect = Number(item.a) + Number(item.b);
            if (Number(item.answer) !== expect) fail(config.typeId + ' seed ' + seed + ': 정답이 틀렸습니다(' + key + ')');
            if (!matches(concept, Number(item.a), Number(item.b))) fail(config.typeId + ' seed ' + seed + ': 개념 조건을 벗어난 문항(' + key + ')');
            if (item.wrong != null) {
              if (Number(item.wrong) === Number(item.answer)) fail(config.typeId + ' seed ' + seed + ': 틀린 풀이가 바른 값(' + key + ')');
              if (String(item.wrong).length > concept.width) fail(config.typeId + ' seed ' + seed + ': 틀린 풀이가 칸을 넘음(' + key + ')');
            }
            if (item.blanks) {
              for (const spot of item.blanks) {
                const text = spot.row === 'sum' ? String(item.answer) : String(item[spot.row]);
                if (!(spot.index >= 0 && spot.index < text.length)) fail(config.typeId + ' seed ' + seed + ': 빈칸 위치가 수를 벗어남(' + key + ')');
              }
              if (item.blanks.length === 1) { /* 한 곳은 항상 허용 */ }
            }
          }
          report.easy += easy;
          if (easy > Math.floor(items.length * 0.1)) fail(config.typeId + ' seed ' + seed + ': 쉬운 문항이 10%를 넘습니다(' + easy + '/' + items.length + ')');
          // 같은 seed 를 두 번 부르면 같은 문제지가 나와야 한다(결정성).
          const again = generate({ ...config, seed }).map(item => [item.a, item.op, item.b].join(':')).join('|');
          if (again !== items.map(item => [item.a, item.op, item.b].join(':')).join('|')) fail(config.typeId + ' seed ' + seed + ': 같은 seed 인데 문제가 달라졌습니다');
        }
      });
    });
    if (report.problems.length) throw Error('묶음 0-1-2 자체 검사 실패: ' + report.problems.slice(0, 6).join(' / '));
    return report;
  }

  root.G012Sheet = {
    concepts: CONCEPTS, types: TYPES, typeIds, grids: GRIDS, poolSize: POOL_SIZE,
    carries, matches, isEasy, generate, wholePool, draw, selfTest, formats: FORMATS, configOf
  };
})(globalThis);
