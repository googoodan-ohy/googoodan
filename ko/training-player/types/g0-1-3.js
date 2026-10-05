/* 묶음 0-1-3 — 세 자리·네 자리 수의 덧셈 (제작자 A, 2026-10-02)

   이 파일 하나에 묶음 0-1-3 의 유형 19개를 모두 정의한다.
   (worksheet-types.json 의 개념 0-1-3-0 ~ 0-1-3-4 × 유형 = 4+4+4+4+3)
     0-1-3-0 ~ 0-1-3-3 : t1 가로셈으로 계산하기 / t2 세로셈으로 계산하기 /
                         t3 세로 풀이의 빈칸 채우기 / t4 잘못된 계산 과정 고치기
     0-1-3-4           : t1 빈칸이 한 곳인 식 완성하기 / t2 서로 연결된 두 식의 빈칸 채우기 /
                         t3 역연산으로 빈칸을 구하고 확인하기
   공용 파일(sheet.js, formats-*.js, gen-bridge.js, catalog.js, type.html, sheet.html)은
   고치지 않고 이미 열려 있는 등록 지점만 쓴다.
     Sheet.register(key, render)   격자 서식(이 파일의 g013-* 서식 7종)
     SheetGen.generate 감싸기       이 묶음 typeId 의 문제 생성(gen-bridge.js 와 같은 방식)
     SheetCatalog.push             카탈로그 항목(catalog.js 항목과 같은 모양)

   문제의 출처
   -----------
   사이트의 기존 생성기(Worksheets.generate, src/bank/legacy/types.js)의 natural-add-3-3 /
   natural-add-4-4 만 쓴다. 개념 이름이 정하는 조건(받아올림 횟수·연속성)에 맞지 않는 문제는
   버리고, 모자라면 seed 를 바꾸어 더 뽑는다(묶음 0-1-1·0-2-1·0-3-1 과 같은 방식). 새 문제
   엔진을 만들지 않는다. 정답은 생성기가 낸 두 수를 그대로 더한 값이고, 빈칸·고치기 문제도
   같은 값 위에 만든다.

   개념별 조건 (spec-natural.json 의 params 그대로)
   ----------------------------------------------
     0-1-3-0  세 자리 + 세 자리, 받아올림 0회          (natural-add-3-3, count(올림) = 0)
     0-1-3-1  세 자리 + 세 자리, 받아올림 1회          (natural-add-3-3, count(올림) = 1)
     0-1-3-2  세 자리 + 세 자리, 인접한 자리 연속 2회   (natural-add-3-3, longest(올림) ≥ 2)
     0-1-3-3  네 자리 + 네 자리                        (natural-add-4-4)
     0-1-3-4  a + b = c, a·b 는 세 자리                 (natural-add-3-3)
              명세 operandDigits 는 [1, 3] 이고 resultMax 9999 다. 이 묶음은 '세 자리 이상으로
              확장' 단계라 세 자리 수만 쓴다(1~3 자리 범위 안). 세 자리 + 세 자리의 합은
              최대 1998 이라 resultMax 9999 안이다.

   문제 풀과 한 장 문항 수 (layout-rules §2)
   ----------------------------------------
   0-1-3-0 ~ 0-1-3-3 은 조건에 맞는 문제가 사실상 무한하므로(예: 받아올림 없는 세 자리 덧셈
   108,900가지) §2 의 최소 기준을 그대로 넘긴다. 문제는 기존 생성기에서 120가지(고정 크기)를
   받아 조건에 맞는 것만 남기고, 쉬운 순으로 정렬한 풀에서 문항 수만큼 **고르게** 뽑은 뒤
   다시 쉬운 순으로 놓는다(§2 '쉬운 것 → 어려운 것', 검수 D 의 '앞부분만 덮지 말 것').
     t1 가로셈 : 세 자리 3단×15줄(45) · 네 자리 2단×15줄(30)  — §2 최소 그대로
     t2 세로셈 : 5단×8줄(40)                                 — §2 최소 그대로
     t3 빈칸   : t2 와 같은 단·줄(§2 '세로 풀이의 빈칸 채우기는 같은 연산의 세로셈과 같음')
     t4 고치기 : 3단×4줄(12)                                 — §2 최소 그대로
     (0-1-3-4) t1~t3 3단×14줄(각 42) — §2 빈칸 식 기준
   여기 적은 단·줄은 기본값이고, sheet.js 의 자동 맞춤(§1 '공간이 남으면 더 넣는다',
   §5 '칸 높이는 문제 줄 + 답 줄 + 여백 4mm')이 칸 높이가 남으면 줄 수를 늘린다. 그래서 실제
   인쇄 문항 수는 유형마다 위 기본값보다 많을 수 있고, 풀(120가지)보다 많이 늘지는 않는다.
   한 장에 같은 문제를 두 번 쓰지 않는다(§2 '같은 문제 중복 금지') — 뽑을 때 서로 다른
   문제만 고르고, 고치기도 문항 수가 풀 크기를 넘지 않는다.

   §2 에서 이 묶음이 달리 적용한 것 (검수자·통합 담당이 먼저 읽을 것)
   ----------------------------------------------------------------
   ⑴ t3(빈칸)은 **문항당 한 곳만** 비운다. 명세는 1~2곳을 허용하지만, 두 곳을 비우면 답이
      하나로 정해지지 않는 경우가 생긴다(예: 3□5 + 2□1 = 566 은 십의 자리 두 곳의 합이 6이기만
      하면 되어 여러 답이 가능하다). 한 곳만 비우면 자리별 계산으로 답이 정확히 하나로 정해진다.
      비우는 곳은 피연산자(a·b) 또는 합 중 한 자리이고, **비우지 않은 수는 모두 인쇄**한다.
      합을 비웠으면 합의 나머지 자리를, 피연산자를 비웠으면 합을 그대로 인쇄한다(합을 보고
      빈 자리를 찾는 활동 — 검수 B·C 가 확인한 묶음 0-1-1 의 t3 방식과 같다).
   ⑵ 0·1 이 들어가는 문제 10% 규칙은 세 자리·네 자리 수 문제지에 적용하지 않는다. 세 자리 수
      에서 0·1 은 흔한 자리 숫자이고(예: 305 + 412), 0·1 을 빼면 개념의 수 범위를 크게 좁힌다.
      이 규칙은 한 자리 수 단계(0+3, 1+5)를 염두에 둔 것으로 보아 이 묶음에는 적용하지 않는다.
   ⑶ 0-1-3-4-t2 는 '서로 연결된 두 식'을 **같은 두 수를 자리만 바꾼 두 식**(245 + 356 = □ /
      356 + 245 = □, 덧셈의 교환법칙)으로 본다. 3단×14줄의 각 묶음에서 두 빈칸을
      채우고 같은 답끼리 선으로 연결한다. 두 식 사이에 선을 그을 공간을 둔다.
   ⑷ 0-1-3-4-t3 은 역연산(뺄셈)을 **확인 줄로만** 쓴다. 개념의 operation 은 '+' 이므로 첫 줄은
      덧셈식(□ + 245 = 601)이고, 둘째 줄 '확인: 601 − 245 = □' 로 거꾸로 계산해 확인한다.
      두 줄의 빈칸은 같은 값이라 학생이 역연산으로 구한 수를 식에 그대로 넣어 확인하게 된다.

   서식 (이 파일 안에만 둔다 — 공용 파일은 고치지 않는다)
   ---------------------------------------------------
     g013-horizontal          가로셈 한 줄(답 자리는 문제지에서 비움)
     g013-vertical            세로셈(받아올림 칸 + 두 수 + 답 줄)
     g013-vertical-missing    세로셈에서 한 자리만 빈칸(테두리 상자)
     g013-vertical-correction 틀린 풀이 → 바르게 고쳐 쓰는 빈 세로셈
     g013-expression          가로 빈칸 식 한 줄(□ + 245 = 601)
     g013-two-line            서로 연결된 두 식(두 줄 모두 빈칸)
     g013-inverse             역연산으로 구하고 확인(첫 줄 빈칸 + 확인 줄)
   문제지(학생용)와 정답지는 같은 칸·같은 차례이고, 정답지에만 답·받아올림·고친 풀이가 찍힌다.
   한 장 = 한 유형이고 가로셈(t1·0-1-3-4 의 t1~t3)과 세로셈(t2~t4)을 섞지 않는다.
   받아올림 칸은 받아올림이 실제로 생길 수 있는 자리(오른쪽에서 두 번째부터)에만 테두리를
   그린다(묶음 0-1-1 검수 C 5번 지적과 같은 규칙). 받아올림이 없는 개념(0-1-3-0)에는
   받아올림 줄을 두지 않는다.

   서식 이름과 sheet.js 자동 맞춤
   -----------------------------
   sheet.js 의 minimumCellMm() 은 **서식 이름 문자열**로 칸 높이 하한을 정한다.
   g013-vertical / g013-vertical-missing / g013-vertical-correction 은 /vertical/ 에 걸려
   (workLines × 4.7 + 4)mm 를 하한으로 쓴다(0-1-3-0 은 받아올림 줄이 없어 workLines 를 4 로
   낮춰 11줄까지, 받아올림 줄이 있는 개념은 5 로 두어 9줄까지 넣는다). 가로 한 줄 서식
   (g013-horizontal·g013-expression·g013-two-line·g013-inverse)은 하한 10mm 로 계산되어
   칸에 들어가는 만큼 줄이 늘어난다.

   실제 인쇄 결과 (Edge headless 계측, seed 20261001 — sheet/run-g0-1-3-edge.py)
   -------------------------------------------------------------------------
     유형            기본 격자   실제 인쇄(자동 맞춤)   §2 최소   칸 넘침/쪽 넘침
     0-1-3-0-t1     3×15=45     3×26=78                45        없음
     0-1-3-0-t2     5×8 =40     5×11=55                40        없음
     0-1-3-0-t3     5×8 =40     5×11=55(세로셈과 같은 단·줄) 40    없음
     0-1-3-0-t4     3×4 =12     3×8 =24                12        없음
     0-1-3-1-t1     3×15=45     3×26=78                45        없음
     0-1-3-1-t2/t3  5×8 =40     5×9 =45                40        없음
     0-1-3-1-t4     3×4 =12     3×8 =24                12        없음
     0-1-3-2-t1     3×15=45     3×26=78                45        없음
     0-1-3-2-t2/t3  5×8 =40     5×9 =45                40        없음
     0-1-3-2-t4     3×4 =12     3×8 =24                12        없음
     0-1-3-3-t1     2×15=30     2×26=52                30        없음
     0-1-3-3-t2/t3  5×8 =40     5×9 =45                40        없음
     0-1-3-3-t4     3×4 =12     3×6 =18                12        없음
     0-1-3-4-t1     3×14=42     3×26=78                42        없음
     0-1-3-4-t2     3×14=42     자동 맞춤 끔            42        없음
     0-1-3-4-t3     3×14=42     3×18=54                42        없음
   문항 수가 기본 격자보다 많은 것은 sheet.js 자동 맞춤이 칸 높이 하한과 내용 높이 안에서
   줄을 늘린 결과다(§1 '공간이 남으면 더 넣는다', §5 '칸 높이는 문제 줄 + 답 줄 + 여백 4mm').
   문제지 78문항은 3단×26줄로 칸 높이 10.0mm(13pt 한 줄 6.4mm + 여백)이고, 세로셈은 5단×9줄
   (칸 28.9mm, 내용 22.3mm) 또는 5단×11줄(칸 23.6mm, 내용 17.9mm — 받아올림 줄이 없는 개념)이다.
   문항은 풀 120가지에서 고르게 뽑으므로 자동 맞춤이 늘려도 같은 문제가 두 번 나오지 않는다.
   19유형 모두 PDF 2쪽(문제지 1쪽 + 정답지 1쪽), 칸 넘침 0·제목 잘림 0 (seed 1·7·42·20261001 확인).

   검수자가 볼 만한 것 (제작자 자체 점검 결과 — sheet/check-g0-1-3-static.py · -render.py)
   ----------------------------------------------------------------------------------
     · 개념 조건·정답: 4 seed × 19유형 × 자동 맞춤이 고를 수 있는 모든 문항 수(81,552문항)에서
       위반 0건. 받아올림 횟수·연속성·자릿수·합이 모두 개념 정의와 맞는다.
     · 문제지에 정답 없음: 계산 유형은 결과 줄이 비어 있고(0/78·0/55·0/45), 가로셈도 답 자리가
       비어 있다. 빈칸 유형은 비우지 않은 수(합 포함)를 그대로 인쇄하고, 고치기 유형은 틀린
       풀이만 왼쪽에 인쇄한다(바른 풀이는 정답지의 오른쪽 칸에만, 붉은색 #c00).
     · 빈칸은 문항당 한 곳이고 답이 정확히 하나다(0~9 를 넣어 확인). 정답지에서 그 자리가 채워진다.
     · 고치기의 틀린 값은 바른 값과 다르고 칸 수 안에 들어간다. 같은 문제를 두 번 쓰지 않는다.
     · 같은 seed → 같은 문제지(문자 단위 동일), seed 를 바꾸면 문제가 완전히 달라진다.
     · 다른 seed 의 풀은 개념마다 다른 스트림에서 뽑는다(poolOf 참고) — 개념끼리 문제가 겹치지 않는다.
*/

(function (root) {
  'use strict';

  const NBSP = '\u00a0';

  /* ================= 1. 작은 도구 ================= */

  const node = (tag, className, value) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (value !== undefined) el.textContent = value;
    return el;
  };

  // 기존 생성기·다른 묶음과 같은 방식의 결정적 난수 (같은 seed → 같은 문제지)
  function random(seed) {
    let state = (Number(seed) >>> 0) || 1;
    return (lo, hi) => {
      state += 0x6d2b79f5;
      let t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return lo + Math.floor((((t ^ (t >>> 14)) >>> 0) / 4294967296) * (hi - lo + 1));
    };
  }

  // typeId 를 seed 에 섞어 같은 개념의 유형끼리 같은 문제를 내지 않게 한다(묶음 0-3-1 과 같음).
  function hashSeed(text) {
    let hash = 0x811c9dc5;
    for (let i = 0; i < String(text).length; i++) {
      hash ^= String(text).charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
    }
    return hash >>> 0;
  }
  const typeSeedOf = config => (((Number(config && config.seed) >>> 0) || 1) ^ hashSeed(config && config.typeId)) >>> 0;

  /* ================= 2. 개념 정의 ================= */

  // width   : 세로셈 칸 수(한 장 안에서 고정 — §5 '한 장 안에서 문제의 모양이 같아야 한다')
  // carryRow: 받아올림 줄을 둘지(0-1-3-0 은 받아올림이 없어 두지 않는다)
  const CONCEPTS = {
    '0-1-3-0': {
      name: '세 자리 수의 덧셈 — 받아올림 없음', short: '세 자리·올림 없음',
      legacy: 'natural-add-3-3', accept: (a, b) => carries(a, b).count === 0,
      width: 3, carryRow: false, fontPt: 13
    },
    '0-1-3-1': {
      name: '세 자리 수의 덧셈 — 받아올림 한 번', short: '세 자리·올림 1회',
      legacy: 'natural-add-3-3', accept: (a, b) => carries(a, b).count === 1,
      width: 4, carryRow: true, fontPt: 13
    },
    '0-1-3-2': {
      name: '세 자리 수의 덧셈 — 연속 받아올림', short: '세 자리·연속 올림',
      legacy: 'natural-add-3-3', accept: (a, b) => carries(a, b).longest >= 2,
      width: 4, carryRow: true, fontPt: 13
    },
    '0-1-3-3': {
      name: '네 자리 수의 덧셈', short: '네 자리 덧셈',
      legacy: 'natural-add-4-4', accept: () => true,
      // 네 자리 + 네 자리의 합은 다섯 자리까지 나오므로 칸을 다섯으로 잡고 글자를 12pt 로 낮춘다.
      width: 5, carryRow: true, fontPt: 12
    },
    '0-1-3-4': {
      name: '빈칸에 알맞은 수 찾기 — 덧셈', short: '덧셈',
      legacy: 'natural-add-3-3', accept: () => true,
      width: 3, carryRow: false, fontPt: 13, expression: true
    }
  };
  const BY_ID = {};
  for (const id of Object.keys(CONCEPTS)) {
    CONCEPTS[id].id = id;                       // 풀 상자·오류 표의 열쇠로 쓴다
    BY_ID[id] = CONCEPTS[id];
  }

  /* ================= 3. 받아올림 분석 ================= */

  const placeDigit = (value, place) => Math.floor(Number(value) / 10 ** place) % 10;

  // 자리별 받아올림. places 는 받아올림이 생긴 자리(0 = 일의 자리), lowest 는 가장 낮은 자리.
  function carries(a, b) {
    let up = 0, count = 0, run = 0, longest = 0, lowest = -1;
    const places = [];
    for (let place = 0; place < 8; place++) {
      const sum = up + placeDigit(a, place) + placeDigit(b, place);
      up = sum >= 10 ? 1 : 0;
      if (up) {
        count += 1; run += 1;
        longest = Math.max(longest, run);
        places.push(place);
        if (lowest < 0) lowest = place;
      } else run = 0;
    }
    return { count, longest, places, lowest };
  }

  // 세로셈 받아올림 줄 — width 칸 중 오른쪽 끝(일의 자리) 위에는 받아올림이 생기지 않으므로
  // 그 자리는 자리 맞춤용으로 남기고 테두리를 그리지 않는다(묶음 0-1-1 검수 C 5번).
  function carrySlots(a, b, width) {
    const slots = new Array(width).fill(0);
    let up = 0;
    for (let place = 0; place < width; place++) {
      const sum = up + placeDigit(a, place) + placeDigit(b, place);
      up = sum >= 10 ? 1 : 0;
      const above = width - 2 - place;
      if (above >= 0) slots[above] = up;
    }
    return slots;
  }

  /* ================= 4. 문제 풀 (기존 생성기에서 뽑는다) ================= */

  const POOL_SIZE = 120;
  const poolCache = new Map();

  function collect(concept, seed, wanted) {
    if (!root.Worksheets || typeof root.Worksheets.generate !== 'function') throw Error('기존 Worksheets 생성기를 찾지 못했습니다.');
    const out = [], seen = new Set();
    for (let batch = 0; batch < 4000 && out.length < wanted; batch++) {
      let rows;
      try { rows = root.Worksheets.generate(concept.legacy, (Number(seed) + batch * 104729) >>> 0, 16); }
      catch (error) { throw Error('기존 생성기 실패(' + concept.legacy + '): ' + error.message); }
      for (const row of rows) {
        const a = Number(row.a), b = Number(row.b);
        if (String(row.op) !== '+' || !Number.isInteger(a) || !Number.isInteger(b)) continue;
        if (!concept.accept(a, b)) continue;
        const key = a + ':' + b;
        if (seen.has(key)) continue;
        seen.add(key);
        out.push({ a, b, op: '+', answer: a + b });
      }
    }
    if (out.length < wanted) throw Error(concept.name + ': 조건에 맞는 문제가 ' + wanted + '개 필요한데 ' + out.length + '개뿐입니다.');
    out.sort((x, y) => x.answer - y.answer || x.a - y.a || x.b - y.b);   // 쉬운 것 → 어려운 것
    return out;
  }

  // 개념마다 다른 seed 로 뽑는다 — 같은 생성기·같은 seed 를 그대로 쓰면 조건이 겹치는 개념
  // (0-1-3-1 과 0-1-3-4 등)의 풀이 같은 문제로 채워진다. 유형(seed 는 그대로 두고 typeId 를
  // 섞는 것)과 달리 개념은 뽑기 스트림 자체를 바꾼다. 같은 개념·같은 seed 면 여전히 같은 풀이다.
  function poolOf(concept, seed) {
    const base = (Number(seed) >>> 0) || 1;
    const key = concept.id + ':' + base;
    if (!poolCache.has(key)) poolCache.set(key, collect(concept, (base ^ hashSeed(concept.id)) >>> 0, POOL_SIZE));
    return poolCache.get(key);
  }

  // 풀을 문항 수만큼 등분한 지점에서 하나씩 고른다. 앞에서부터 잘라 쓰면 한 장이 개념 범위의
  // 아주 좁은 부분만 덮게 되므로(검수 D 지적), 고르게 뽑은 뒤 다시 쉬운 순으로 놓는다.
  function spread(pool, count) {
    if (count >= pool.length) return pool.slice();
    if (count <= 1) return pool.slice(0, count);
    const picked = [], used = new Set();
    for (let i = 0; i < count; i++) {
      let index = Math.round(i * (pool.length - 1) / (count - 1));
      while (used.has(index) && index < pool.length - 1) index += 1;
      while (used.has(index) && index > 0) index -= 1;
      used.add(index);
      picked.push(pool[index]);
    }
    picked.sort((x, y) => x.answer - y.answer || x.a - y.a || x.b - y.b);
    return picked;
  }

  function pick(concept, config, count) {
    const pool = poolOf(concept, config.seed);
    if (pool.length < count) throw Error(config.typeId + ': 조건에 맞는 문제가 ' + pool.length + '개뿐입니다(필요 ' + count + '개).');
    return spread(pool, count);
  }

  /* ================= 5. 유형별 문제 만들기 ================= */

  // t1·t2 — 계산 문제. 그대로 쓴다.
  function calculations(concept, config, count) {
    return pick(concept, config, count).map(item => ({ ...item, task: 'calc' }));
  }

  // t3 — 한 자리만 비운다. 피연산자(a·b) 또는 합(sum) 중 한 곳, 그 수의 왼쪽부터 센 자리.
  function blanks(concept, config, count) {
    const rand = random(typeSeedOf(config) ^ 0x5f3a7b1);
    return pick(concept, config, count).map(item => {
      const rows = ['a', 'b', 'sum'];
      const row = rows[rand(0, rows.length - 1)];
      const value = String(row === 'sum' ? item.answer : item[row]);
      const index = rand(0, value.length - 1);
      return { ...item, task: 'blank', blank: { row, index } };
    });
  }

  /* -------- 잘못된 계산 과정(고치기) — spec 의 errorKinds 를 실제 틀린 값으로 옮긴 것 -------- */

  const swapPlace = value => {                       // 일의 자리와 십의 자리를 바꾼 수
    const text = String(value);
    const head = text.slice(0, -2), tail = text.slice(-2);
    return Number(head + tail[1] + tail[0]);
  };

  const ERRORS = {
    // 0-1-3-0: 일의 자리와 십의 자리를 섞어 더함 / 십의 자리의 합을 빠뜨림 / 자리 맞춤을 잘못함
    '0-1-3-0': [
      { id: 'swap-place', note: '일의 자리와 십의 자리를 바꾸어 더함.', wrong: q => Number(q.a) + swapPlace(Number(q.b)) },
      { id: 'drop-tens', note: '십의 자리의 합을 빠뜨렸습니다.', wrong: q => Number(q.answer) - (placeDigit(q.a, 1) + placeDigit(q.b, 1)) * 10 },
      { id: 'misalign', note: '자리 맞춤을 잘못했습니다.', wrong: q => Number(q.a) + Math.floor(Number(q.b) / 10) }
    ],
    // 0-1-3-1 ~ 0-1-3-3: 일의 자리 합을 잘못 셈 / 받아올림을 다음 자리에 더하지 않음 / 자릿값을 맞추지 않음
    '0-1-3-1': [
      { id: 'ones-slip', note: '일의 자리 합을 잘못 셈했습니다.', wrong: q => Number(q.answer) + (Number(q.a) % 2 ? 1 : 2) },
      { id: 'carry-lost', note: '받아올림을 다음 자리에 더하지 않음.', wrong: q => Number(q.answer) - 10 ** (carries(Number(q.a), Number(q.b)).lowest + 1) },
      { id: 'misalign', note: '자릿값을 맞추지 않았습니다.', wrong: q => Number(q.a) + Math.floor(Number(q.b) / 10) }
    ],
    '0-1-3-2': [
      { id: 'carry-lost', note: '받아올림을 다음 자리에 더하지 않음.', wrong: q => Number(q.answer) - 10 ** (carries(Number(q.a), Number(q.b)).lowest + 1) },
      { id: 'ones-slip', note: '일의 자리 합을 잘못 셈했습니다.', wrong: q => Number(q.answer) + (Number(q.a) % 2 ? 1 : 2) },
      { id: 'misalign', note: '자릿값을 맞추지 않았습니다.', wrong: q => Number(q.a) + Math.floor(Number(q.b) / 10) }
    ],
    '0-1-3-3': [
      { id: 'carry-lost', note: '받아올림을 다음 자리에 더하지 않음.', wrong: q => Number(q.answer) - 10 ** (carries(Number(q.a), Number(q.b)).lowest + 1) },
      { id: 'misalign', note: '자릿값을 맞추지 않았습니다.', wrong: q => Number(q.a) + Math.floor(Number(q.b) / 10) },
      { id: 'ones-slip', note: '일의 자리 합을 잘못 셈했습니다.', wrong: q => Number(q.answer) + (Number(q.a) % 2 ? 1 : 2) }
    ]
  };

  // 틀린 값은 바른 값과 달라야 하고, 세로셈 칸 수 안에 들어가야 한다.
  function wrongOf(kind, item, width) {
    const value = kind.wrong(item);
    if (value == null || !Number.isInteger(value) || value < 0) return null;
    if (String(value).length > width) return null;
    if (value === Number(item.answer)) return null;
    return value;
  }

  function corrections(concept, config, count) {
    const kinds = ERRORS[concept.id];
    const pool = poolOf(concept, config.seed);
    if (count > pool.length) throw Error(config.typeId + ': 이 유형은 ' + pool.length + '문항까지입니다.');
    const picked = spread(pool, count);
    // 문제마다 오류 종류를 돌려 가며 쓴다(한 장이 같은 실수만 반복하지 않게).
    const items = picked.map((item, index) => {
      for (let step = 0; step < kinds.length; step++) {
        const kind = kinds[(index + step) % kinds.length];
        const wrong = wrongOf(kind, item, concept.width);
        if (wrong == null) continue;
        return { ...item, task: 'fix', kind: kind.id, wrong, note: kind.note };
      }
      return null;
    });
    if (items.some(item => !item)) throw Error(config.typeId + ': 만들 수 있는 고치기 문제가 ' + count + '개보다 적습니다.');
    return items;
  }

  /* -------- 0-1-3-4 — 빈칸에 알맞은 수 찾기 -------- */

  const MASK_ORDER = ['a', 'b', 'c'];

  // t1 — 빈칸이 한 곳. 자리를 돌려 가며 비운다(첫째 수 / 둘째 수 / 결과).
  function expressionBlank(concept, config, count) {
    const offset = typeSeedOf(config) % 3;
    return pick(concept, config, count).map((item, index) => ({
      ...item, task: 'expression', mask: MASK_ORDER[(index + offset) % 3]
    }));
  }

  // t2 — 서로 연결된 두 식. 같은 두 수를 자리만 바꾼 두 식의 합을 각각 구한다(교환법칙).
  //   a < b 인 짝만 쓴다(a = b 이면 두 줄이 같은 식이 된다). 한 장에 같은 짝을 두 번 쓰지 않는다.
  function twoLine(concept, config, count) {
    const pairs = [], seen = new Set();
    for (const fact of poolOf(concept, config.seed)) {
      if (fact.a === fact.b) continue;
      const key = [Math.min(fact.a, fact.b), Math.max(fact.a, fact.b)].join(':');
      if (seen.has(key)) continue;
      seen.add(key);
      pairs.push(fact);
    }
    if (pairs.length < count) throw Error(config.typeId + ': 쓸 수 있는 두 식 짝이 ' + pairs.length + '개뿐입니다(필요 ' + count + '개).');
    return spread(pairs, count).map(item => ({ ...item, task: 'two-line' }));
  }

  // t3 — 역연산으로 빈칸을 구하고 확인하기. 첫 줄은 피연산자 한 곳이 빈 덧셈식,
  //      둘째 줄은 그 수를 거꾸로 계산해 확인하는 뺄셈식(명세의 operation '+' 는 첫 줄이 지킨다).
  function inverse(concept, config, count) {
    const rand = random(typeSeedOf(config) ^ 0x2c1b3f7d);
    return pick(concept, config, count).map(item => {
      const mask = rand(0, 1) ? 'a' : 'b';
      return { ...item, task: 'inverse', mask };
    });
  }

  /* ================= 6. 생성기 연결 ================= */

  function generate(config) {
    const gen = config.gen || {};
    const concept = BY_ID[gen.concept];
    if (!concept) throw Error('묶음 0-1-3: 알 수 없는 개념 ' + gen.concept);
    const count = config.count || config.cols * config.rows;
    if (concept.expression) {
      if (gen.task === 't1') return expressionBlank(concept, config, count);
      if (gen.task === 't2') return twoLine(concept, config, count);
      return inverse(concept, config, count);
    }
    if (gen.task === 't3') return blanks(concept, config, count);
    if (gen.task === 't4') return corrections(concept, config, count);
    return calculations(concept, config, count);
  }

  /* ================= 7. 서식(CSS) ================= */

  const CSS = [
    '.g013-center{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;min-height:0;gap:.6mm}',
    '.g013-center.g013-two-line{gap:2mm}',
    /* 빈칸 상자 — 세로셈 한 자리 */
    '.g013-blank{border:1px solid #333}',
    '.answer-page .g013-printed .vertical-digit:not(.g013-blank){color:#111 !important;font-weight:400 !important}',
    /* 받아올림 칸도 자리 칸과 같은 폭으로 맞춘다(0.65em 글자 기준 1.72em) */
    '.g013-center .carry-row .vertical-digit{width:1.72em;font-size:.65em !important}',
    /* 일의 자리 위 칸은 받아올림이 생기지 않으므로 상자를 그리지 않는다(자리 맞춤용) */
    '.carry-row .g013-nocarry{border:0}',
    /* 가로 빈칸 식의 □ */
    '.g013-box{display:inline-block;box-sizing:border-box;min-width:11mm;height:1.25em;line-height:1.2em;padding:0 1.2mm;border:1px solid #555;text-align:center;vertical-align:middle}',
    '.g013-check{color:inherit}',
    '.g013-check-label{color:#666;font-size:.85em}',
    /* 고치기 — 틀린 풀이 → 고쳐 쓰는 빈 세로셈 */
    '.g013-fix{display:flex;align-items:center;justify-content:center;gap:1.6mm}',
    /* 네 자리 수는 틀린 풀이와 고쳐 쓰는 칸을 좌우로 놓으면 칸 폭을 넘으므로 위아래로 놓는다 */
    '.g013-fix-column{flex-direction:column;gap:.8mm}',
    '.g013-arrow{color:#999;font-size:11pt}',
    '.g013-wrong{color:#333}',
    '.g013-mark{color:#c00}',
    '.g013-redo{border:1px solid #ccc;box-sizing:border-box;background-image:repeating-linear-gradient(90deg,transparent 0,transparent calc(1.12em - 1px),#eee calc(1.12em - 1px),#eee 1.12em);background-position:left top}',
    '.g013-note{margin-top:1.4mm;font-size:7.5pt;color:#444;max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'
  ].join('');

  let styled = false;
  function installCss() {
    if (styled || typeof document === 'undefined') return;
    if (document.getElementById('g013-styles')) { styled = true; return; }
    styled = true;
    const style = document.createElement('style');
    style.id = 'g013-styles';
    style.textContent = CSS;
    document.head.append(style);
  }

  /* ================= 8. 세로셈 그리기 ================= */

  // blankIndex 는 그 수의 왼쪽부터 센 자리(0부터). -1 이면 빈칸 없음.
  function digitRow(value, width, opts) {
    const options = opts || {};
    const row = node('div', 'vertical-row' + (options.cls ? ' ' + options.cls : ''));
    row.append(node('span', 'vertical-sign', options.sign || ''));
    const raw = String(value == null ? '' : value);
    const at = options.blankIndex >= 0 ? width - raw.length + options.blankIndex : -1;
    const chars = raw.padStart(width, ' ').split('');
    chars.forEach((char, index) => {
      if (index === at) row.append(node('span', 'vertical-digit g013-blank', options.answer ? char : NBSP));
      else row.append(node('span', 'vertical-digit', char === ' ' ? NBSP : char));
    });
    return row;
  }

  // 문제지(학생용)의 합 줄에 무엇을 찍을지.
  //   정답지 → 합,  빈칸 유형(합을 보고 빈 자리를 찾는다) → 합,
  //   고치기의 '틀린 풀이'(showResult) → 틀린 값,  계산 유형 → 비운다(학생이 쓴다).
  function sumText(item, answer, config) {
    if (answer || item.blank || config.showResult) return String(item.answer);
    return '';
  }

  // stackOf(item, answer, config) — item.answer 를 결과 줄에 쓴다.
  function stackOf(item, answer, config) {
    const width = config.width;
    const stack = node('div', 'vertical');
    if (config.carryRow) {
      const slots = carrySlots(item.a, item.b, width);
      const row = node('div', 'vertical-row carry-row');
      row.append(node('span', 'vertical-sign'));
      slots.forEach((value, index) => {
        const cls = 'vertical-digit' + (index === slots.length - 1 ? ' g013-nocarry' : '');
        row.append(node('span', cls, answer && value ? String(value) : NBSP));
      });
      stack.append(row);
    }
    const blank = item.blank || null;
    stack.append(digitRow(item.a, width, {
      answer, blankIndex: blank && blank.row === 'a' ? blank.index : -1
    }));
    stack.append(digitRow(item.b, width, {
      sign: '+', answer, blankIndex: blank && blank.row === 'b' ? blank.index : -1
    }));
    const text = sumText(item, answer, config);
    stack.append(digitRow(text === '' ? '' : text, width, {
      // 빈칸 유형(t3)은 합을 문제지에 인쇄하므로 정답지에서도 검은색(아래 CSS 가 인쇄된 자리 글자를 검정으로 되돌린다)
      answer, cls: 'vertical-rule vertical-result' + (item.blank ? ' g013-printed' : ''),
      blankIndex: blank && blank.row === 'sum' && text !== '' ? blank.index : -1
    }));
    return stack;
  }

  function renderVertical(cell, item, answer, config) {
    installCss();
    const wrap = node('div', 'g013-center');
    wrap.append(stackOf(item, answer, config));
    cell.append(wrap);
  }

  // 가로셈 — 기존 'horizontal' 과 같은 class 로 같은 모양을 그리되 칸 가운데에 놓는다.
  function renderHorizontal(cell, item, answer, config) {
    installCss();
    const wrap = node('div', 'g013-center');
    const line = node('div', 'horizontal');
    line.append(node('span', '', item.a + ' + ' + item.b + ' = '));
    line.append(node('span', 'answer-space', answer ? String(item.answer) : NBSP));
    wrap.append(line);
    cell.append(wrap);
  }

  // 틀린 풀이 옆에 바르게 고쳐 쓰는 빈 세로셈.
  // 틀린 풀이에는 받아올림 줄을 두지 않는다 — 어느 받아올림을 빠뜨렸는지가 고칠 거리라서
  // 미리 보여 주지 않는다(묶음 0-1-1 과 같은 판단). 한 장 안의 모양도 모두 같아진다.
  function renderCorrection(cell, item, answer, config) {
    installCss();
    const wrap = node('div', 'g013-center');
    // 다섯 칸(네 자리 수)은 좌우로 놓으면 칸 폭을 넘는다(0-1-3-3 검수 계측 244px > 213px).
    const wide = config.width >= 5;
    const row = node('div', 'g013-fix' + (wide ? ' g013-fix-column' : ''));
    const inner = { width: config.width, carryRow: false, showResult: true };
    const wrong = node('div', 'g013-wrong');
    wrong.append(stackOf({ a: item.a, b: item.b, answer: item.wrong }, false, inner));
    if (answer) wrong.classList.add('g013-mark');
    row.append(wrong, node('div', 'g013-arrow', wide ? '↓' : '→'));
    const redo = node('div', 'g013-redo');
    redo.style.width = (config.width * 1.12 + 1.1).toFixed(2) + 'em';
    redo.style.height = (3 * 1.3).toFixed(2) + 'em';
    if (answer) redo.append(stackOf(item, true, inner));
    row.append(redo);
    wrap.append(row);
    cell.append(wrap);
  }

  /* -------- 0-1-3-4 서식 — 가로 빈칸 식 -------- */

  // parts: [{text, blank}] 순서대로 한 줄에 놓는다(빈 자리는 □ 상자).
  function appendParts(line, parts, answer) {
    parts.forEach(part => {
      if (part.plain) line.append(node('span', '', part.plain));
      else if (part.blank) line.append(node('span', 'g013-box', answer ? String(part.text) : NBSP));
      else line.append(node('span', '', String(part.text)));
    });
  }

  function equationParts(item) {
    return [
      { text: String(item.a), blank: item.mask === 'a' },
      { plain: ' + ' },
      { text: String(item.b), blank: item.mask === 'b' },
      { plain: ' = ' },
      { text: String(item.answer), blank: item.mask === 'c' }
    ];
  }

  // 확인 줄 — 첫 줄의 빈칸을 거꾸로 계산해 확인한다(0-1-3-4-t3).
  function checkParts(item) {
    const first = item.mask === 'a';
    return [
      { plain: '확인  ' },
      { text: String(item.answer) },
      { plain: ' − ' },
      { text: String(first ? item.b : item.a) },
      { plain: ' = ' },
      { text: String(first ? item.a : item.b), blank: true }
    ];
  }

  function renderExpression(cell, item, answer, config) {
    installCss();
    const wrap = node('div', 'g013-center');
    const line = node('div', 'horizontal');
    appendParts(line, equationParts(item), answer);
    wrap.append(line);
    cell.append(wrap);
  }

  // 서로 연결된 두 식 — 같은 두 수를 자리만 바꾼 두 식(둘 다 결과가 빈칸).
  function renderTwoLine(cell, item, answer, config) {
    installCss();
    const wrap = node('div', 'g013-center g013-two-line');
    [[item.a, item.b], [item.b, item.a]].forEach(pair => {
      const line = node('div', 'horizontal');
      appendParts(line, [
        { text: String(pair[0]) },
        { plain: ' + ' },
        { text: String(pair[1]) },
        { plain: ' = ' },
        { text: String(item.answer), blank: true }
      ], answer);
      wrap.append(line);
    });
    cell.append(wrap);
  }

  // 역연산으로 빈칸을 구하고 확인하기 — 첫 줄 덧셈식(피연산자 빈칸) + 둘째 줄 확인(뺄셈).
  function renderInverse(cell, item, answer, config) {
    installCss();
    const wrap = node('div', 'g013-center');
    const first = node('div', 'horizontal');
    appendParts(first, equationParts(item), answer);
    const check = node('div', 'horizontal g013-check');
    appendParts(check, checkParts(item), answer);
    wrap.append(first, check);
    cell.append(wrap);
  }

  /* ================= 9. 유형 정의와 등록 ================= */

  const FORMAT = {
    horizontal: 'g013-horizontal',
    vertical: 'g013-vertical',
    missing: 'g013-vertical-missing',
    correction: 'g013-vertical-correction',
    expression: 'g013-expression',
    twoLine: 'g013-two-line',
    inverse: 'g013-inverse'
  };

  const CALC_TYPES = {
    t1: { title: '가로셈으로 계산하기', label: '가로셈', format: FORMAT.horizontal, instruction: '계산하여 답을 쓰세요.' },
    t2: { title: '세로셈으로 계산하기', label: '세로셈', format: FORMAT.vertical, instruction: '계산하여 답을 쓰세요.' },
    t3: { title: '세로 풀이의 빈칸 채우기', label: '빈칸', format: FORMAT.missing, instruction: '빈칸에 알맞은 수를 써넣으세요.' },
    t4: { title: '잘못된 계산 과정 고치기', label: '고치기', format: FORMAT.correction, instruction: '잘못된 곳을 찾아 바르게 고쳐 쓰세요.' }
  };
  const EXPRESSION_TYPES = {
    t1: { title: '빈칸이 한 곳인 식 완성하기', label: '빈칸 한 곳', format: FORMAT.expression, instruction: '빈칸에 알맞은 수를 써넣으세요.' },
    // 두 식의 빈칸을 채운 뒤 같은 결과의 빈칸끼리 선으로 연결한다.
    t2: { title: '서로 연결된 두 식의 빈칸 채우기', label: '두 식', format: FORMAT.twoLine, instruction: '두 식의 빈칸에 알맞은 수를 써넣으세요.' },
    t3: { title: '역연산으로 빈칸을 구하고 확인하기', label: '역연산', format: FORMAT.inverse, instruction: '빈칸에 알맞은 수를 써넣으세요.' }
  };

  // 기본 단·줄(layout-rules §2 최소 기준). sheet.js 자동 맞춤이 칸 높이가 남으면 줄을 늘린다.
  const GRIDS = {
    // 2026-10-02 1차 수정: 자동 맞춤을 끄고 한 장 상한(세 자리 30·네 자리 25)에 맞춘 칸 수로 고정한다.
    '0-1-3-0': { t1: [3, 10], t2: [5, 6], t3: [5, 6], t4: [3, 7] },
    '0-1-3-1': { t1: [3, 10], t2: [4, 7], t3: [4, 7], t4: [3, 7] },
    '0-1-3-2': { t1: [3, 10], t2: [4, 7], t3: [4, 7], t4: [3, 7] },
    '0-1-3-3': { t1: [2, 12], t2: [3, 8], t3: [3, 8], t4: [3, 5] },
    '0-1-3-4': { t1: [3, 10], t2: [3, 10], t3: [3, 10] }
  };

  // 유형별 글자 크기(pt) — 칸 아래가 비지 않게 키운 값(캡처로 확인).
  const FONTS = {
    '0-1-3-0': { t1: 20, t2: 17, t3: 17, t4: 15 },
    '0-1-3-1': { t1: 20, t2: 17, t3: 17, t4: 14 },
    '0-1-3-2': { t1: 20, t2: 17, t3: 17, t4: 14 },
    '0-1-3-3': { t1: 20, t2: 15, t3: 15, t4: 16 },
    '0-1-3-4': { t1: 20, t2: 20, t3: 15 }
  };

  // workLines: sheet.js 가 세로셈 서식의 칸 높이 하한을 (workLines × 4.7 + 4)mm 로 잡는다.
  //   0-1-3-0 은 받아올림 줄이 없어 4(하한 22.8mm → 11줄), 받아올림 줄이 있는 개념은 5
  //   (하한 27.5mm → 9줄 = 45문항)로 두어 §2 최소(세~네 자리 세로셈 40)를 넘긴다.
  //   고치기는 틀린 풀이 + (정답지의) 설명 한 줄이 들어가야 하므로 6(하한 32.2mm → 8줄 = 24문항).
  const WORKLINES = {
    '0-1-3-0': { t1: 2, t2: 4, t3: 4, t4: 6 },
    '0-1-3-1': { t1: 2, t2: 5, t3: 5, t4: 6 },
    '0-1-3-2': { t1: 2, t2: 5, t3: 5, t4: 6 },
    '0-1-3-3': { t1: 2, t2: 5, t3: 5, t4: 6 },
    '0-1-3-4': { t1: 2, t2: 2, t3: 2 }
  };

  const TYPES = [];
  for (const conceptId of Object.keys(CONCEPTS)) {
    const concept = CONCEPTS[conceptId];
    const table = concept.expression ? EXPRESSION_TYPES : CALC_TYPES;
    for (const key of Object.keys(table)) {
      const type = table[key], grid = GRIDS[conceptId][key];
      const entry = {
        typeId: conceptId + '-' + key,
        title: type.label + ' · ' + concept.short,
        instruction: type.instruction,
        format: type.format,
        cols: grid[0], rows: grid[1], count: grid[0] * grid[1],
        fontPt: (FONTS[conceptId] && FONTS[conceptId][key]) || concept.fontPt,
        autoFit: false,
        seed: 20261001,
        maxProblems: conceptId === '0-1-3-3' ? 25 : 30,   // 세 자리 이상 덧셈은 최대 30문제, 네 자리 덧셈은 25문제 이하로 고정한다
        width: concept.width,
        carryRow: concept.carryRow,
        workLines: WORKLINES[conceptId][key],
        gen: { bundle: '0-1-3', concept: conceptId, task: key }
      };
      TYPES.push(entry);
    }
  }

  function installFormats() {
    if (!root.Sheet || typeof root.Sheet.register !== 'function') return false;
    const formats = {
      [FORMAT.horizontal]: renderHorizontal,
      [FORMAT.vertical]: renderVertical,
      [FORMAT.missing]: renderVertical,
      [FORMAT.correction]: renderCorrection,
      [FORMAT.expression]: renderExpression,
      [FORMAT.twoLine]: renderTwoLine,
      [FORMAT.inverse]: renderInverse
    };
    for (const key of Object.keys(formats)) {
      if (root.Sheet.renderers.has(key)) continue;   // 이미 있으면 그대로 둔다
      root.Sheet.register(key, formats[key]);
    }
    return true;
  }

  function installGenerator() {
    const base = root.SheetGen;
    if (!base || typeof base.generate !== 'function' || base.g013Wrapped) return false;
    const original = base.generate;
    base.generate = function (config) {
      if (config && config.gen && config.gen.bundle === '0-1-3') return generate(config);
      return original.apply(this, arguments);
    };
    base.g013Wrapped = true;
    return true;
  }

  if (!installFormats()) document.addEventListener('DOMContentLoaded', installFormats, { once: true });
  if (!installGenerator()) document.addEventListener('DOMContentLoaded', installGenerator, { once: true });
  if (Array.isArray(root.SheetCatalog)) root.SheetCatalog.push(...TYPES.map(entry => ({ ...entry })));

  /* ================= 10. 스스로 검사 ================= */

  // 빈칸에 0~9 를 넣어 답이 정확히 하나인지 확인한다(문제지의 빈칸은 한 곳이다).
  function blankSolutions(item) {
    const value = item.blank.row === 'sum' ? String(item.answer) : String(item[item.blank.row]);
    const at = item.blank.index;
    const solved = [];
    for (let digit = 0; digit <= 9; digit++) {
      const text = value.slice(0, at) + digit + value.slice(at + 1);
      if (item.blank.row === 'sum' && Number(text) !== Number(item.a) + Number(item.b)) continue;
      if (item.blank.row === 'a' && Number(text) + Number(item.b) !== Number(item.answer)) continue;
      if (item.blank.row === 'b' && Number(item.a) + Number(text) !== Number(item.answer)) continue;
      solved.push(digit);
    }
    return solved;
  }

  function selfTest(options) {
    const seeds = (options && options.seeds) || [1, 7, 42];
    const report = { sheets: 0, items: 0, problems: [] };
    const fail = message => { report.problems.push(message); };
    for (const entry of TYPES) {
      const concept = CONCEPTS[entry.gen.concept];
      for (const seed of seeds) {
        const config = { ...entry, seed };
        let items;
        try { items = generate(config); }
        catch (error) { fail(entry.typeId + ' seed ' + seed + ': ' + error.message); continue; }
        report.sheets += 1;
        report.items += items.length;
        if (items.length !== config.count) fail(entry.typeId + ' seed ' + seed + ': 문항 수가 ' + items.length + ' (기대 ' + config.count + ')');
        const seen = new Set(), pairs = new Set();
        for (const item of items) {
          const key = item.a + ':' + item.b;
          if (seen.has(key)) fail(entry.typeId + ' seed ' + seed + ': 같은 문제가 두 번 나왔습니다(' + key + ')');
          seen.add(key);
          const pair = [Math.min(item.a, item.b), Math.max(item.a, item.b)].join(':');
          if (pairs.has(pair)) fail(entry.typeId + ' seed ' + seed + ': 같은 수 짝이 두 번 나왔습니다(' + pair + ')');
          pairs.add(pair);
          if (Number(item.answer) !== Number(item.a) + Number(item.b)) fail(entry.typeId + ' seed ' + seed + ': 정답이 틀렸습니다(' + key + ')');
          if (!concept.accept(Number(item.a), Number(item.b))) fail(entry.typeId + ' seed ' + seed + ': 개념 조건을 벗어난 문항(' + key + ')');
          if (item.blank) {
            const value = item.blank.row === 'sum' ? String(item.answer) : String(item[item.blank.row]);
            if (!(item.blank.index >= 0 && item.blank.index < value.length)) fail(entry.typeId + ' seed ' + seed + ': 빈칸 자리가 수 밖(' + key + ')');
            const solved = blankSolutions(item);
            if (solved.length !== 1) fail(entry.typeId + ' seed ' + seed + ': 빈칸 답이 ' + solved.length + '가지(' + key + ')');
          }
          if (item.task === 'fix') {
            if (item.wrong === Number(item.answer)) fail(entry.typeId + ' seed ' + seed + ': 틀린 풀이가 바른 값(' + key + ')');
            if (String(item.wrong).length > config.width) fail(entry.typeId + ' seed ' + seed + ': 틀린 값이 칸 수를 넘음(' + key + ')');
          }
        }
      }
    }
    if (report.problems.length) throw Error('묶음 0-1-3 자체 검사 실패: ' + report.problems.slice(0, 6).join(' / '));
    return report;
  }

  root.G013Sheet = {
    concepts: CONCEPTS, types: TYPES, typeIds: TYPES.map(entry => entry.typeId),
    grids: GRIDS, worklines: WORKLINES, poolSize: POOL_SIZE,
    generate, poolOf, spread, carries, selfTest, formats: FORMAT
  };
})(globalThis);
