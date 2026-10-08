/* 묶음 0-2-3 — 세 자리 이상의 뺄셈 (개념 6개 · typeId 23개), 제작자 A 2026-10-02
 *
 * 이 파일 하나에 이 묶음의 유형 정의·문제 생성·전용 서식을 모두 담는다. 공용 파일
 * (sheet.js, formats-*.js, gen-bridge.js, catalog.js, sheet.css)은 고치지 않고 열려 있는
 * 등록 지점만 쓴다.
 *   Sheet.register(key, render)   격자 서식(가로셈·세로셈·세로 빈칸·고치기·두 줄 식)
 *   SheetGen.generate 감싸기       이 묶음 typeId의 문제 생성(gen-bridge와 같은 방식)
 *
 * 개념(prototypes\training-roadmap-20261001\worksheet-types.json) — 모두 자연수 뺄셈이다.
 *   0-2-3-0  세 자리 수의 뺄셈 — 받아내림 없음    세 자리 − 세 자리, 받아내림 0회
 *   0-2-3-1  세 자리 수의 뺄셈 — 받아내림 한 번  세 자리 − 세 자리, 받아내림 1회
 *   0-2-3-2  세 자리 수의 뺄셈 — 연속 받아내림    이어진 두 자리 이상에서 받아내림(0을 지나는 경우 제외)
 *   0-2-3-3  0이 있는 수에서 받아내리기          윗수의 0을 지나서 받아내림(305 − 128 꼴)
 *   0-2-3-4  네 자리 수의 뺄셈                    네 자리 − 네 자리
 *   0-2-3-5  빈칸에 알맞은 수 찾기 — 뺄셈          세 자리 − 세 자리의 빈칸 식(한 곳 / 두 식 / 역연산 확인)
 * 유형: 0-2-3-0~4 는 개념마다 4가지(t1 가로셈 · t2 세로셈 · t3 세로 풀이 빈칸 · t4 고치기),
 *       0-2-3-5 는 3가지(t1 빈칸 한 곳 · t2 서로 연결된 두 식 · t3 역연산으로 구하고 확인).
 *
 * 문제 생성(작업 지시대로 기존 생성기를 쓰고 조건에 맞는 것만 남긴다)
 *   - 재료는 사이트의 기존 생성기 Worksheets.generate('natural-sub-3-3' / 'natural-sub-4-4')이다.
 *     (types.js 의 natural-sub-3-3 은 100~999 − 100~999, natural-sub-4-4 는 1000~9999 − 1000~9999,
 *      둘 다 윗수가 크거나 같은 문항만 낸다.) 새 문제 엔진은 만들지 않는다.
 *   - 받아내림 횟수·연속 여부는 공용 gen-bridge.js 의 SheetGen.carries(a, b, '−') 를 그대로 쓴다
 *     (다른 묶음의 선별과 같은 기준). 0을 지나는 받아내림은 이 파일의 borrowPlan 이 자리마다
 *     실제로 계산해 판정한다(gen-bridge 의 selection:'across-zero' 보다 엄격하다 — 윗수에 0이
 *     있고 그 0을 지나 10을 받아 오는 경우만 본다).
 *   - 개념 경계(같은 문제가 두 개념에 겹치지 않게)
 *       · 0-2-3-0 : 받아내림 0회          · 0-2-3-1 : 받아내림 1회
 *       · 0-2-3-2 : 연속 받아내림 2자리 이상, **0을 지나는 경우는 뺀다**
 *       · 0-2-3-3 : 0을 지나는 받아내림(0-2-3-2 의 반대쪽)
 *     0을 지나는 받아내림은 연습하는 기술이 달라(0-2-3-3) 연속 받아내림 문제지와 겹치지 않게 나눴다.
 *     0-2-3-0/1/2/3 이 세 자리 수를 나눠 가지고, 0-2-3-4 는 네 자리, 0-2-3-5 는 세 자리 빈칸 식이다.
 *   - 같은 문제는 한 장에서 한 번만. 조건에 맞는 후보를 모아 두었다가 난이도(받아내림 횟수 →
 *     수 크기) 순으로 고르게 퍼지도록 뽑는다. 그래서 한 장이 작은 수부터 큰 수까지 고루 담는다.
 *   - 같은 seed 면 같은 문제. 유형마다 seed 에 typeId 를 섞어(typeSeed) 같은 개념의 t1~t4 와
 *     0-2-3-5 가 같은 자리에 같은 식을 놓지 않게 했다.
 *   - 답이 0이 되는 문항(a = b)은 어느 개념에서도 쓰지 않는다.
 *
 * §2 규칙과 문항 수
 *   가로셈(3단×20줄=60 · 네 자리는 긴 식이라 2단×20줄=40), 세로셈·세로 빈칸(5단×9줄=45),
 *   고치기(3단×8줄=24), 빈칸 식(3단×14줄=42). 모두 layout-rules §2 의 최소 기준(가로셈 두~세 자리 45·
 *   네 자리 긴 식 30·세로셈 40·고치기 12·빈칸 식 42) 이상이고, 한 줄짜리 가로셈은 §5 대로
 *   '줄 높이 = 글자 한 줄 + 여백 4mm'가 되도록 줄을 늘려 한 쪽을 채운다.
 *   자동 맞춤(autoFit)은 끄고(autoFit:false) 줄 수를 직접 정했다 — 한 장의 문항 수와 모양이
 *   seed 와 무관하게 같아야 검수(문항 수·배치)가 가능하기 때문이다. 칸 내용은 칸 가운데에 둔다.
 *   0·1이 들어가는 쉬운 문항은 유형마다 전체의 10% 이하로만 넣는다(gen-bridge 와 같은 규칙).
 *   예외: 0-2-3-3 은 개념 자체가 '0이 있는 수'라 모든 문항에 0이 들어간다(0-3-1-4 '1과 0의 곱셈'과
 *   같은 성격의 예외 — 규칙 대상이 아니다).
 *
 * 명세(spec\spec-natural.json)와 다르게 간 곳(이 파일의 쓰기 범위 밖이라 명세는 그대로 둔다)
 *   - 0-2-3-5-t2 의 spec instruction 은 '서로 알맞은 것끼리 선으로 연결하세요.'(선 잇기 문구)인데
 *     실제 서식은 한 칸에 두 식의 빈칸을 채우는 것이다. 0-3-1-6-t2 와 같은 명세 오류이므로
 *     문제지에는 활동에 맞는 '두 식의 빈칸에 알맞은 수를 써넣으세요.'를 인쇄한다.
 *   - 0-2-3-0-t4 의 spec errorKinds 중 '윗수와 아랫수의 순서를 바꿈'은 받아내림이 없는 문항에서
 *     답이 바뀌지 않아(모든 자리에서 윗수가 크거나 같다) 쓸 수 없다. 대신 그 자리에는 답의 자리
 *     순서를 바꾸어 쓴 오류를 둔다(아래 ERROR_KINDS 참고).
 *   - 0-2-3-1·0-2-3-2 의 spec errorKinds '0을 지나는 받아내림에서 중간 자리를 잘못 씀'은 두 개념의
 *     문항에 0을 지나는 받아내림이 없어 성립하지 않는다(그 오류는 0-2-3-3 에서 쓴다).
 *
 * 확인(이 파일을 고친 뒤 다시 돌린다): review\tmp-0-2-3-A\probe.html 을 Edge headless 로 열어
 * 문항·배치를 덤프하고(gen-0-2-3-A.py), verify-0-2-3-A.py 가 답을 독립적으로 다시 계산한다.
 */
(function (root) {
  'use strict';

  const BUNDLE = '0-2-3';
  const NBSP = ' ';

  /* ================= 1. 공통 도구 ================= */

  const node = (tag, className, value) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (value !== undefined) el.textContent = value;
    return el;
  };

  function random(seed) {
    let state = (Number(seed) >>> 0) || 1;
    return (lo, hi) => {
      state += 0x6D2B79F5;
      let t = state;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      const value = ((t ^ t >>> 14) >>> 0) / 4294967296;
      return lo == null ? value : lo + Math.floor(value * (hi - lo + 1));
    };
  }

  /** 유형마다 다른 문제가 나오게 config.seed 에 typeId 를 섞는다(같은 유형·같은 seed면 같은 문제). */
  function typeSeed(config) {
    const text = String((config && config.typeId) || '');
    let hash = 0x811C9DC5;
    for (let i = 0; i < text.length; i++) { hash ^= text.charCodeAt(i); hash = Math.imul(hash, 0x01000193); }
    return (((Number(config && config.seed) >>> 0) || 1) ^ hash) >>> 0;
  }

  const digitsOf = (value, width) => String(value).padStart(width, '0').split('').map(Number);
  const numberFrom = (digits) => Number(digits.join(''));

  /* ================= 2. 받아내림 계산(자리별) ================= */
  /* 세로셈 한 벌을 자리마다 실제로 계산한다. 정답지에 적는 '줄어든 수'(marks)와 자리별 답(diff),
     0을 지나서 받아내림했는지(acrossZero)를 함께 돌려준다. 윗수가 작으면 null. */
  function borrowPlan(a, b, width) {
    const A = digitsOf(a, width), B = digitsOf(b, width);
    const work = A.slice();
    const marks = new Array(width).fill(null);
    const diff = new Array(width).fill(0);
    let acrossZero = false;
    for (let i = width - 1; i >= 0; i--) {
      if (work[i] < B[i]) {
        let j = i - 1;
        // 0인 자리를 지나서 빌려 온다 — 지나온 0은 9가 된다.
        while (j >= 0 && work[j] === 0) { work[j] = 9; marks[j] = 9; acrossZero = true; j -= 1; }
        if (j < 0) return null;                       // 윗수가 더 작은 경우(생성기 풀에서는 나오지 않는다)
        work[j] -= 1; marks[j] = work[j];
        work[i] += 10;
      }
      diff[i] = work[i] - B[i];
      if (diff[i] < 0 || diff[i] > 9) return null;
    }
    return { marks, diff, acrossZero };
  }

  /* ================= 3. 개념 ================= */

  const CONCEPTS = [
    { id: '0-2-3-0', label: '세 자리 뺄셈(없음)', full: '세 자리 수의 뺄셈 — 받아내림 없음',
      source: 'natural-sub-3-3', width: 3, borrowRow: false,
      accept: (fact) => fact.carries.count === 0 },
    { id: '0-2-3-1', label: '세 자리 뺄셈(한 번)', full: '세 자리 수의 뺄셈 — 받아내림 한 번',
      source: 'natural-sub-3-3', width: 3, borrowRow: true,
      accept: (fact) => fact.carries.count === 1 },
    { id: '0-2-3-2', label: '세 자리 뺄셈(연속)', full: '세 자리 수의 뺄셈 — 연속 받아내림',
      source: 'natural-sub-3-3', width: 3, borrowRow: true,
      accept: (fact) => fact.carries.longest >= 2 && !fact.plan.acrossZero },
    { id: '0-2-3-3', label: '0 지나는 받아내림', full: '0이 있는 수에서 받아내리기',
      source: 'natural-sub-3-3', width: 3, borrowRow: true, easyExempt: true,
      accept: (fact) => fact.plan.acrossZero },
    { id: '0-2-3-4', label: '네 자리 뺄셈', full: '네 자리 수의 뺄셈',
      source: 'natural-sub-4-4', width: 4, borrowRow: true,
      accept: () => true },
    { id: '0-2-3-5', label: '뺄셈 빈칸 찾기', full: '빈칸에 알맞은 수 찾기 — 뺄셈',
      source: 'natural-sub-3-3', width: 3, borrowRow: false, blank: true,
      accept: () => true }
  ];

  const conceptOf = (id) => CONCEPTS.filter((concept) => concept.id === id)[0];

  // 0·1이 들어간(쉬운) 문항인가 — gen-bridge 와 같은 기준.
  const easyFact = (fact) => /[01]/.test(String(fact.a) + String(fact.b));
  // 쉬운 것 → 어려운 것: 받아내림 횟수 → 두 수의 크기 → 윗수 → 아랫수.
  const byDifficulty = (x, y) => (x.carries.count - y.carries.count) || ((x.a + x.b) - (y.a + y.b)) ||
    (x.a - y.a) || (x.b - y.b);

  /* ================= 4. 조건에 맞는 문항 모으기 ================= */

  function collectFacts(concept, want, seed) {
    if (!root.Worksheets || typeof root.Worksheets.generate !== 'function') throw Error('기존 Worksheets 생성기를 찾지 못했습니다.');
    if (!root.SheetGen || typeof root.SheetGen.carries !== 'function') throw Error('받아내림 계산기(gen-bridge)를 찾지 못했습니다.');
    const found = new Map();
    // 한 번에 64개씩(기존 생성기의 유한한 풀을 넘기지 않게) 여러 번 뽑아 조건에 맞는 것만 모은다.
    for (let batch = 0; batch < 900 && found.size < want; batch++) {
      let rows;
      try { rows = root.Worksheets.generate(concept.source, (seed + Math.imul(batch, 104729)) >>> 0, 64); }
      catch (error) { throw Error(concept.full + ': 기존 생성기 실패 - ' + error.message); }
      for (const raw of rows) {
        const a = Number(raw.a), b = Number(raw.b);
        if (!Number.isInteger(a) || !Number.isInteger(b) || raw.op !== '−') continue;
        if (a < b || a === b) continue;                       // 답이 0인 문항은 쓰지 않는다
        if (String(a).length !== concept.width || String(b).length !== concept.width) continue;
        const key = a + ':' + b;
        if (found.has(key)) continue;
        const plan = borrowPlan(a, b, concept.width);
        if (!plan || numberFrom(plan.diff) !== a - b) continue;  // 자리별 계산과 전체 계산이 어긋나면 버린다
        const fact = { a: a, b: b, op: '−', answer: a - b, plan: plan,
          carries: root.SheetGen.carries(a, b, '−') };
        if (!concept.accept(fact)) continue;
        found.set(key, fact);
      }
    }
    return Array.from(found.values());
  }

  /** 정렬된 목록에서 k개를 고르게 퍼지도록 뽑는다(작은 수부터 큰 수까지 고루). */
  function spread(list, k) {
    if (k <= 0) return [];
    if (k >= list.length) return list.slice();
    const out = [];
    for (let i = 0; i < k; i++) out.push(list[Math.floor(i * list.length / k)]);
    return out;
  }

  /** 개념 + 서식 조건에 맞는 문항 count개. 조건에 맞는 후보가 모자라면 그 자리에서 오류를 낸다. */
  function pickFacts(concept, config, need) {
    const count = config.count || config.cols * config.rows;
    const seed = typeSeed(config);
    const want = Math.min(900, Math.max(count * 5, 300));
    let pool = collectFacts(concept, want, seed);
    if (need) pool = pool.filter(need);
    const normal = pool.filter((fact) => !easyFact(fact)).sort(byDifficulty);
    const easy = pool.filter(easyFact).sort(byDifficulty);
    // 0-2-3-3 은 개념 자체가 '0이 있는 수'라 10% 규칙을 적용하지 않는다(모든 문항이 0을 포함한다).
    const easyLimit = concept.easyExempt ? count : Math.floor(count * 0.1);
    const easyWant = Math.min(easyLimit, easy.length);
    const picked = spread(normal, count - easyWant).concat(spread(easy, easyWant));
    if (picked.length !== count) {                           // 쉬운 문항만 있는 개념의 나머지 자리
      const seen = new Set(picked.map((fact) => fact.a + ':' + fact.b));
      for (const fact of pool.slice().sort(byDifficulty)) {
        if (picked.length >= count) break;
        if (seen.has(fact.a + ':' + fact.b)) continue;
        picked.push(fact);
      }
    }
    if (picked.length !== count) {
      throw Error(config.typeId + ': 조건에 맞는 문항 ' + count + '개 중 ' + picked.length + '개만 만들었습니다.');
    }
    picked.sort(byDifficulty);                                // 쉬운 것 → 어려운 것
    return picked;
  }

  /* ================= 5. 잘못된 계산 과정(고치기 유형) ================= */
  /* 명세 spec-natural.json 의 errorKinds 를 이 개념에서 실제로 값이 달라지는 오류로 옮긴 것.
     값이 바른 답과 같아지거나 자리 수가 칸을 넘으면 그 문항에는 쓰지 않고 다음 오류로 넘어간다. */

  // 자리마다 10을 받아 오지만 왼쪽 자리를 줄이지 않는다 (523 − 187 → 446)
  function wrongNoReduce(a, b, width) {
    const A = digitsOf(a, width), B = digitsOf(b, width), out = new Array(width).fill(0);
    for (let i = width - 1; i >= 0; i--) {
      let top = A[i];
      if (top < B[i]) top += 10;
      out[i] = top - B[i];
    }
    return numberFrom(out);
  }

  // 자리마다 큰 수에서 작은 수를 뺀다 (523 − 187 → 464)
  function wrongAbsolute(a, b, width) {
    const A = digitsOf(a, width), B = digitsOf(b, width);
    return numberFrom(A.map((digit, i) => Math.abs(digit - B[i])));
  }

  // 0을 지나 빌려 올 때 중간의 0을 9로 고치지 않고 10으로 둔다 (305 − 128 → 187)
  function wrongZeroMiddle(a, b, width) {
    const A = digitsOf(a, width), B = digitsOf(b, width);
    const work = A.slice(), out = new Array(width).fill(0);
    for (let i = width - 1; i >= 0; i--) {
      if (work[i] < B[i]) {
        let j = i - 1;
        while (j >= 0 && work[j] === 0) { work[j] = 10; j -= 1; }
        if (j < 0) return null;
        work[j] -= 1;
        work[i] += 10;
      }
      out[i] = work[i] - B[i];
      if (out[i] < 0 || out[i] > 9) return null;             // 자리 값이 한 자리를 넘으면 쓸 수 없다
    }
    return numberFrom(out);
  }

  // 가장 왼쪽 자리에서 빌려 주고 그 자리를 줄이지 않는다 (523 − 187 → 436)
  function wrongDropLastBorrow(a, b, width) {
    const plan = borrowPlan(a, b, width);
    if (!plan || plan.marks[0] == null) return null;         // 가장 왼쪽 자리가 빌려 주지 않았으면 성립하지 않는다
    const wrong = a - b + Math.pow(10, width - 1);
    if (String(wrong).length > width) return null;
    return wrong;
  }

  const ERROR_KINDS = {
    '0-2-3-0': [
      { id: 'align', note: '아랫수를 한 자리 옮겨 어긋나게 셈', wrong: (fact, width) => fact.b % 10 === 0 ? null : fact.a - Math.floor(fact.b / 10) },
      { id: 'drop-zero', note: '0이 되는 자리를 빠뜨림', wrong: (fact) => String(fact.answer).includes('0') ? Number(String(fact.answer).replace(/0/g, '')) : null },
      { id: 'reverse', note: '답의 자리 순서를 바꾸어 씀', wrong: (fact) => {
        const text = String(fact.answer), reversed = text.split('').reverse().join('');
        return reversed === text ? null : Number(reversed);
      } }
    ],
    '0-2-3-1': [
      { id: 'no-reduce', note: '받아내린 뒤 윗자리 수를 줄이지 않음', wrong: (fact, width) => wrongNoReduce(fact.a, fact.b, width) },
      { id: 'absolute', note: '큰 숫자에서 작은 숫자를 무조건 뺌', wrong: (fact, width) => wrongAbsolute(fact.a, fact.b, width) }
    ],
    '0-2-3-2': [
      { id: 'no-reduce', note: '받아내린 뒤 윗자리 수를 줄이지 않음', wrong: (fact, width) => wrongNoReduce(fact.a, fact.b, width) },
      { id: 'absolute', note: '큰 숫자에서 작은 숫자를 무조건 뺌', wrong: (fact, width) => wrongAbsolute(fact.a, fact.b, width) },
      { id: 'drop-last', note: '이어지는 받아내림을 끝까지 하지 않음', wrong: (fact, width) => wrongDropLastBorrow(fact.a, fact.b, width) }
    ],
    '0-2-3-3': [
      { id: 'zero-middle', note: '0을 지날 때 중간 자리를 9로 고치지 않음', wrong: (fact, width) => wrongZeroMiddle(fact.a, fact.b, width) },
      { id: 'no-reduce', note: '받아내린 뒤 윗자리 수를 줄이지 않음', wrong: (fact, width) => wrongNoReduce(fact.a, fact.b, width) },
      { id: 'absolute', note: '큰 숫자에서 작은 숫자를 무조건 뺌', wrong: (fact, width) => wrongAbsolute(fact.a, fact.b, width) }
    ],
    '0-2-3-4': [
      { id: 'no-reduce', note: '받아내린 뒤 윗자리 수를 줄이지 않음', wrong: (fact, width) => wrongNoReduce(fact.a, fact.b, width) },
      { id: 'absolute', note: '큰 숫자에서 작은 숫자를 무조건 뺌', wrong: (fact, width) => wrongAbsolute(fact.a, fact.b, width) },
      { id: 'zero-middle', note: '0을 지날 때 중간 자리를 9로 고치지 않음', wrong: (fact, width) => wrongZeroMiddle(fact.a, fact.b, width) }
    ]
  };

  // 오류 하나를 문항에 적용한다. 쓸 수 없으면 null.
  function makeWrong(kind, fact, width) {
    const value = kind.wrong(fact, width);
    if (value == null || !Number.isInteger(value) || value < 0 || value === fact.answer) return null;
    if (String(value).length > width) return null;
    return { kinds: kind.id, note: kind.note, value: value };
  }

  // 문항마다 오류를 돌려 가며 쓴다(한 장이 같은 실수만 반복하지 않게). 쓸 수 있는 오류가 없으면 null.
  function wrongWork(fact, index, width, conceptId, offset) {
    const kinds = ERROR_KINDS[conceptId];
    if (!kinds || !kinds.length) return null;
    for (let step = 0; step < kinds.length; step++) {
      const built = makeWrong(kinds[(offset + index + step) % kinds.length], fact, width);
      if (built) return built;
    }
    return null;
  }

  /* ================= 6. 문항 만들기 ================= */

  const FORMS = {
    // 가로셈은 한 줄짜리라 §2 최소(3단×15줄)보다 줄을 늘려 칸 높이를 줄 수 + 여백 4mm 에 맞춘다(§5).
    t1: { key: 't1', suffix: '가로셈', kind: 'horizontal', format: 'g023-horizontal',
      cols: 3, rows: 10, fontPt: 12, instruction: '계산하여 답을 쓰세요.' },
    t2: { key: 't2', suffix: '세로셈', kind: 'vertical', format: 'g023-vertical',
      cols: 5, rows: 6, fontPt: 12, instruction: '계산하여 답을 쓰세요.' },
    t3: { key: 't3', suffix: '빈칸', kind: 'blank', format: 'g023-vertical-blank',
      cols: 5, rows: 6, fontPt: 12, instruction: '빈칸에 알맞은 수를 써넣으세요.' },
    t4: { key: 't4', suffix: '고치기', kind: 'correction', format: 'g023-correction',
      cols: 3, rows: 8, fontPt: 12, instruction: '잘못된 곳을 찾아 바르게 고쳐 쓰세요.' }
  };
  // 0-2-3-5 는 빈칸 식 세 가지 — 공용 blank-equation 서식(t1)과 이 묶음의 두 줄 서식(t2·t3).
  const BLANK_FORMS = [
    { key: 't1', suffix: '빈칸 한 곳', kind: 'single-blank', format: 'g023-blank-equation',
      cols: 3, rows: 10, fontPt: 12, instruction: '빈칸에 알맞은 수를 써넣으세요.' },
    { key: 't2', suffix: '두 식', kind: 'two-line', format: 'g023-two-line',
      cols: 3, rows: 10, fontPt: 12, instruction: '두 식의 빈칸에 알맞은 수를 써넣으세요.' },
    { key: 't3', suffix: '역연산', kind: 'inverse-line', format: 'g023-two-line',
      cols: 3, rows: 10, fontPt: 12, instruction: '빈칸에 알맞은 수를 써넣으세요.' }
  ];
  // 네 자리 수는 식이 길어 가로셈을 2단으로 둔다(layout-rules §2 '긴 식' 2단×15줄).
  const FORM_OVERRIDES = { '0-2-3-4': { t1: { cols: 2, rows: 15 } },
    '0-2-3-1': { t4: { cols: 3, rows: 6 } }, '0-2-3-2': { t4: { cols: 3, rows: 6 } }, '0-2-3-3': { t4: { cols: 3, rows: 6 } } };
  // 칸을 넘기지 않는 가장 큰 글자(pt)를 서식·개념별로 쟀다(받아내림 줄이 있으면 세로가 더 빠듯하다).
  const FONT_PT = {
    '0-2-3-0': { t1: 22, t2: 21, t3: 21, t4: 17 },
    '0-2-3-1': { t1: 22, t2: 20, t3: 20, t4: 17 },
    '0-2-3-2': { t1: 22, t2: 20, t3: 20, t4: 17 },
    '0-2-3-3': { t1: 22, t2: 20, t3: 20, t4: 17 },
    '0-2-3-4': { t1: 25, t2: 16, t3: 16, t4: 13 },
    '0-2-3-5': { t1: 22, t2: 14, t3: 14 }
  };

  function formsOf(concept) {
    const list = concept.id === '0-2-3-5' ? BLANK_FORMS : ['t1', 't2', 't3', 't4'].map((key) => FORMS[key]);
    const override = FORM_OVERRIDES[concept.id] || {};
    return list.map((form) => Object.assign({}, form, override[form.key] || {}));
  }

  /** 세로 풀이 빈칸: 답의 자리 중 이어지는 두 자리(끝에서 돌아 가며)를 빈칸으로 둔다. */
  function blanksOf(answer, width, index) {
    const text = String(answer);
    const start = width - text.length;
    const length = text.length;
    if (length <= 1) return [start];
    const first = index % length;
    const second = (first + 1) % length;
    const set = [start + first, start + second].sort((x, y) => x - y);
    return set.filter((value, i) => set.indexOf(value) === i);
  }

  function buildItems(config) {
    const gen = config.gen || {};
    const concept = conceptOf(gen.concept);
    if (!concept) throw Error('묶음 0-2-3에 없는 개념입니다: ' + gen.concept);
    const count = config.count || config.cols * config.rows;
    const layout = { width: concept.width, borrowRow: concept.borrowRow };
    config.stack = layout;
    const seed = typeSeed(config);

    if (gen.kind === 'correction') {
      // 쓸 수 있는 오류가 하나도 없는 문항은 처음부터 뽑지 않는다.
      const offset = random(seed ^ 0x27D4EB2F)(0, 3);
      const facts = pickFacts(concept, config, (fact) => ERROR_KINDS[gen.concept].some((kind) => makeWrong(kind, fact, concept.width)));
      return facts.map((fact, index) => {
        const wrong = wrongWork(fact, index, concept.width, gen.concept, offset);
        if (!wrong) throw Error(config.typeId + ': 틀린 풀이를 만들지 못했습니다 (' + fact.a + ' − ' + fact.b + ')');
        const marks = [];
        const correct = String(fact.answer).padStart(concept.width, ' ');
        const shown = String(wrong.value).padStart(concept.width, ' ');
        for (let i = 0; i < concept.width; i++) if (correct[i] !== shown[i]) marks.push(i);
        return Object.assign({}, fact, { wrong: wrong, wrongMarks: marks });
      });
    }

    if (gen.kind === 'two-line' || gen.kind === 'inverse-line') {
      const facts = pickFacts(concept, config);
      return facts.map((fact) => Object.assign({}, fact, { lines: linesOf(fact, gen.kind) }));
    }

    const facts = pickFacts(concept, config);
    return facts.map((fact, index) => {
      if (gen.kind === 'blank') return Object.assign({}, fact, { blanks: blanksOf(fact.answer, concept.width, index) });
      if (gen.kind === 'single-blank') return Object.assign({}, fact, { mask: index % 3 });
      return fact;
    });
  }

  /** 두 줄 문항의 줄 — 앞뒤 글과 빈칸의 답. 두 줄이 서로의 답을 인쇄하지 않게 한다.
   *  two-line  : 같은 수족의 두 식(a − b = □ / a − □ = b). 두 빈칸의 답이 모두 차(c)라
   *              어느 줄에도 차가 인쇄되지 않는다(0-3-1-6-t2 와 같은 짝 만들기).
   *  inverse-line: □ − b = c 를 덧셈으로 구하고, c + b = □ 로 확인한다(두 빈칸의 답이 모두 윗수 a). */
  function linesOf(fact, kind) {
    if (kind === 'two-line') {
      return [
        { before: fact.a + ' − ' + fact.b + ' =', answer: fact.answer },
        { before: fact.a + ' −', answer: fact.answer, after: '= ' + fact.b }
      ];
    }
    return [
      { before: '', answer: fact.a, after: '− ' + fact.b + ' = ' + fact.answer },
      { check: true, before: fact.answer + ' + ' + fact.b + ' =', answer: fact.a }
    ];
  }

  /* ================= 7. 그리기 ================= */

  const css = () => {
    if (document.getElementById('g023-style')) return;
    const style = node('style');
    style.id = 'g023-style';
    style.textContent = [
      '.g023-cell{height:100%;display:flex;align-items:center;justify-content:center;min-width:0}',
      // 세로셈: 자리 폭은 한 장 안에서 모두 같다(받아내림 줄까지 같은 폭).
      '.g023-stack{--g023-slot:1.12em;display:inline-flex;flex-direction:column;font-variant-numeric:tabular-nums}',
      '.g023-stack .vertical-row{height:1.3em}',
      '.g023-stack .vertical-digit{width:var(--g023-slot);height:1.25em}',
      '.g023-stack .vertical-sign{width:.9em}',
      '.g023-borrow{height:.95em}',
      '.g023-borrow .vertical-digit{width:1.806em;font-size:.62em !important;border:1px solid #ccc;height:1.1em;color:#444}',
      '.g023-borrow-val{color:#111}',
      '.g023-blank{border:1px solid #666;border-radius:2px;background:#fbfbfb}',
      '.g023-mark{background:#dedede}',
      '.g023-res{min-height:1.3em}',
      // 가로셈·빈칸 식
      '.g023-eq{display:flex;align-items:center;gap:1.2mm;white-space:nowrap;line-height:1.25}',
      '.g023-answer{display:inline-flex;align-items:center;justify-content:center;min-width:11mm;height:1.6em;border:1px solid #666;border-radius:2px;background:#fbfbfb;padding:0 1mm}',
      // 한 칸에 두 줄(연결된 두 식 / 역연산 확인)
      '.g023-two{display:flex;flex-direction:column;gap:1.4mm;min-width:0}',
      '.g023-two .g023-eq{height:1.6em}',
      '.g023-check-label{font-size:8pt;color:#555;margin-right:.6mm}',
      // 잘못된 계산 고치기: 왼쪽 틀린 풀이 + 오른쪽 바르게 고쳐 쓰는 빈 세로셈
      '.g023-fix{display:flex;align-items:center;justify-content:center;gap:2.5mm;height:100%;min-width:0}',
      '.g023-rewrite{border:1px dashed #c4c4c4;border-radius:2px;padding:.8mm 1.6mm}'
    ].join('');
    document.head.append(style);
  };

  function charsOf(value, width) {
    const text = String(value == null ? '' : value);
    return (NBSP.repeat(Math.max(0, width - text.length)) + text).split('').slice(-width);
  }

  // 세로셈 한 줄. mask 는 빈칸으로 둘 자리, marks 는 정답지에서 표시할 자리(왼쪽부터).
  function rowOf(width, options) {
    const o = options || {};
    const line = node('div', 'vertical-row' + (o.className ? ' ' + o.className : ''));
    line.append(node('span', 'vertical-sign', o.sign || NBSP));
    const chars = charsOf(o.text, width);
    for (let i = 0; i < width; i++) {
      const blank = o.mask && o.mask.indexOf(i) >= 0 && !o.reveal;
      const slot = node('span', 'vertical-digit');
      if (blank) { slot.textContent = NBSP; if (o.box) slot.classList.add('g023-blank'); }
      else {
        slot.textContent = chars[i] === ' ' ? NBSP : chars[i];
        if (o.marks && o.marks.indexOf(i) >= 0) slot.classList.add('g023-mark');
      }
      line.append(slot);
    }
    return line;
  }

  // 받아내림을 적는 작은 칸 줄. fill 이면 줄어든 수를 적고(정답지), 아니면 빈 칸만 둔다.
  function borrowRowOf(width, plan, fill) {
    const line = node('div', 'vertical-row g023-borrow');
    line.append(node('span', 'vertical-sign'));
    for (let i = 0; i < width; i++) {
      const slot = node('span', 'vertical-digit');
      const mark = plan && plan.marks[i];
      if (fill && mark != null) { slot.textContent = String(mark); slot.classList.add('g023-borrow-val'); }
      else slot.textContent = NBSP;
      line.append(slot);
    }
    return line;
  }

  /** 세로셈 한 벌. resultText 를 주면 그 값을 답 줄에 인쇄하고, 없으면 답 줄을 비운다. */
  function stackOf(fact, layout, options) {
    const o = options || {};
    const width = layout.width;
    const box = node('div', 'g023-stack vertical');
    if (layout.borrowRow) box.append(borrowRowOf(width, o.borrowPlan, o.fillBorrow));
    box.append(rowOf(width, { text: fact.a }));
    box.append(rowOf(width, { text: fact.b, sign: '−' }));
    box.append(rowOf(width, {
      text: o.resultText == null ? '' : o.resultText,
      mask: o.mask, marks: o.marks, reveal: o.reveal, box: o.box,
      className: 'vertical-rule g023-res'
    }));
    return box;
  }

  const centered = (child) => {
    const wrap = node('div', 'g023-cell');
    wrap.append(child);
    return wrap;
  };

  /* t1 — 가로셈 */
  function renderHorizontal(cell, question, answer) {
    css();
    const line = node('div', 'g023-eq');
    line.append(node('span', '', question.a + ' ' + question.op + ' ' + question.b + ' ='));
    line.append(node('span', 'g023-answer', answer ? String(question.answer) : NBSP));
    cell.append(centered(line));
  }

  /* t2 — 세로셈 (문제지: 답 줄 비움 · 정답지: 줄어든 수와 답) */
  function renderVertical(cell, question, answer, config) {
    css();
    cell.append(centered(stackOf(question, config.stack, answer
      ? { resultText: String(question.answer), borrowPlan: question.plan, fillBorrow: true }
      : {})));
  }

  /* t3 — 세로 풀이의 빈칸 채우기 (자리별 중간 계산은 인쇄하고 답의 1~2자리만 빈칸) */
  function renderBlank(cell, question, answer, config) {
    css();
    const layout = config.stack;
    cell.append(centered(stackOf(question, layout, {
      resultText: String(question.answer),
      mask: question.blanks, marks: question.blanks, reveal: answer, box: true,
      borrowPlan: question.plan, fillBorrow: true
    })));
  }

  /* t4 — 잘못된 계산 과정 고치기 (왼쪽 틀린 풀이 · 오른쪽 바르게 고쳐 쓰는 빈 세로셈) */
  function renderCorrection(cell, question, answer, config) {
    css();
    const layout = config.stack;
    const wrap = node('div', 'g023-fix');
    const wrong = node('div', 'g023-wrong');
    wrong.append(stackOf(question, layout, {
      resultText: String(question.wrong.value), marks: answer ? question.wrongMarks : null
    }));
    wrap.append(wrong);
    const right = node('div', answer ? '' : 'g023-rewrite');
    right.append(answer
      ? stackOf(question, layout, { resultText: String(question.answer), borrowPlan: question.plan, fillBorrow: true })
      : stackOf(question, layout, { borrowPlan: null, fillBorrow: false }));
    wrap.append(right);
    cell.append(centered(wrap));
  }

  /* 0-2-3-5 t1 — 빈칸이 한 곳인 식. 공용 blank-equation 과 같은 내용을 이 묶음 답 칸(상자)과
     가운데 정렬로 그린다(한 개념의 t1~t3 가 같은 모양의 빈칸 상자를 쓰게 하려고). */
  function renderSingleBlank(cell, question, answer) {
    css();
    const line = node('div', 'g023-eq');
    const parts = [String(question.a), String(question.b), String(question.answer)];
    parts.forEach((part, index) => {
      if (index === 1) line.append(node('span', '', ' ' + question.op + ' '));
      if (index === 2) line.append(node('span', '', ' = '));
      if (index === question.mask) line.append(node('span', 'g023-answer', answer ? part : NBSP));
      else line.append(node('span', '', part));
    });
    cell.append(centered(line));
  }

  /* 0-2-3-5 t2·t3 — 한 칸에 두 줄(연결된 두 식 / 역연산 확인) */
  function renderTwoLine(cell, question, answer) {
    css();
    const box = node('div', 'g023-two');
    question.lines.forEach((line) => {
      const row = node('div', 'g023-eq');
      if (line.check) row.append(node('span', 'g023-check-label', '확인'));
      if (line.before) row.append(node('span', '', line.before));
      row.append(node('span', 'g023-answer', answer ? String(line.answer) : NBSP));
      if (line.after) row.append(node('span', '', line.after));
      box.append(row);
    });
    cell.append(centered(box));
  }

  const RENDERERS = {
    'g023-horizontal': renderHorizontal,
    'g023-vertical': renderVertical,
    'g023-vertical-blank': renderBlank,
    'g023-correction': renderCorrection,
    'g023-blank-equation': renderSingleBlank,
    'g023-two-line': renderTwoLine
  };

  /* ================= 8. 유형 목록 ================= */

  function entries() {
    const list = [];
    CONCEPTS.forEach((concept, conceptIndex) => {
      formsOf(concept).forEach((form, formIndex) => {
        list.push({
          typeId: concept.id + '-' + form.key,
          // 머리말 제목 칸이 좁아 개념 이름과 서식 이름을 '·' 로 붙여 짧게 쓴다.
          title: concept.label + ' · ' + form.suffix,
          instruction: form.instruction,
          format: form.format,
          cols: form.cols,
          rows: form.rows,
          count: form.cols * form.rows,
          fontPt: (FONT_PT[concept.id] || {})[form.key] || form.fontPt,
          autoFit: false,
          maxProblems: 30,   // 세 자리 이상 수의 계산은 한 장 최대 30문제
          seed: 20261001 + conceptIndex * 137 + formIndex * 7,
          gen: { bundle: BUNDLE, concept: concept.id, conceptName: concept.full, kind: form.kind }
        });
      });
    });
    return list;
  }

  /* ================= 9. 등록 ================= */

  function installFormats() {
    if (!root.Sheet || typeof root.Sheet.register !== 'function') return false;
    for (const key of Object.keys(RENDERERS)) root.Sheet.register(key, RENDERERS[key]);
    return true;
  }

  function installGenerator() {
    const base = root.SheetGen;
    if (!base || typeof base.generate !== 'function' || base.__g023) return false;
    const original = base.generate;
    base.generate = function (config) {
      if (config && config.gen && config.gen.bundle === BUNDLE) return buildItems(config);
      return original.apply(this, arguments);
    };
    Object.defineProperty(base, '__g023', { value: true });
    return true;
  }

  if (!installFormats()) document.addEventListener('DOMContentLoaded', installFormats, { once: true });
  if (!installGenerator()) document.addEventListener('DOMContentLoaded', installGenerator, { once: true });
  const catalog = entries();
  if (Array.isArray(root.SheetCatalog)) for (const entry of catalog) root.SheetCatalog.push(entry);

  // 검수 도구가 쓰는 입구(문제 생성 규칙을 그대로 다시 쓸 수 있게).
  root.Sheet023 = {
    bundle: BUNDLE, concepts: CONCEPTS, forms: FORMS, blankForms: BLANK_FORMS, entries: catalog,
    borrowPlan: borrowPlan, wrongWork: wrongWork, makeWrong: makeWrong, errorKinds: ERROR_KINDS,
    buildItems: buildItems, collectFacts: collectFacts, pickFacts: pickFacts, linesOf: linesOf, blanksOf: blanksOf
  };
})(globalThis);
