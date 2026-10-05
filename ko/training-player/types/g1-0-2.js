/* =============================================================================
   묶음 1-0-2 — 분수 크기와 동치 (개념 9개 × 유형 3~4개 = typeId 29개)
   개념: 1-0-2-0 ~ 1-0-2-8
     -0 분모가 같은 분수의 크기 비교   부등호 / 순서 / 가장 큰·작은 수
     -1 단위분수의 크기 비교           부등호 / 순서 / 가장 큰·작은 수
     -2 크기가 같은 분수 만들기        연결 / 빈칸 / 모두 고르기
     -3 약수·배수 다시 확인하기        관계 구별 / 곱셈식에서 찾기 / 목록 완성
     -4 공약수로 약분하기              과정 빈칸 / 공약수로 나눈 결과 / 연결
     -5 기약분수로 나타내기            과정 빈칸 / 기약분수 / 연결
     -6 공배수로 통분하기              분모 주어짐 / 분모 찾기 / 과정 빈칸 / 고치기
     -7 최소공배수로 통분하기          분모 주어짐 / 분모 찾기 / 과정 빈칸 / 고치기
     -8 분모가 다른 분수의 크기 비교   부등호 / 순서 / 가장 큰·작은 수

   규칙(AGENTS.md · layout-rules.md · tasks\make-1-0-2.md)
   · 문제 수치는 사이트의 기존 생성기에서만 가져온다.
       Worksheets.generate (src/bank/legacy/types.js)
         fraction-add-same / fraction-add-different  진분수 두 개
         multiply-one                                곱셈식 → 약수·배수
       DrillEngine.skill (src/ko-concept-layout/original-overrides/ko/drill-engine.js)
         compare-fraction  단위분수 비교        reduce     약분
         common            통분(최소공배수)      factor · multiple  약수·배수 목록
     개념 조건(분모가 같음/다름 · 단위분수 · 진분수 · 공약수 존재)에 맞지 않는 문항은 버리고,
     모자라면 seed 를 바꿔 더 뽑는다. 새 문제 엔진은 만들지 않는다.
   · 정답은 정수 연산(교차 곱셈·최대공약수·최소공배수)만으로 다시 계산한다(부동소수 금지).
   · 서식 키는 이 묶음 전용 g102-* 다. 공용 파일(sheet.js, formats-*.js, catalog.js)은 고치지 않는다.
   · 같은 typeId · 같은 seed → 언제나 같은 문제지. 한 장 = 한 유형, 전부 가로셈.

   명세(spec\spec-fraction.json)와 다르게 잡은 곳 — 명세 수정이 작업 범위 밖이라 이 파일에만 적는다.
   · errorKinds 중 "통분 없이 분자끼리·분모끼리 계산"은 덧셈 오류라 통분 문제에 쓸 수 없다.
     1-0-2-6·1-0-2-7 의 고치기 문제는 통분에서 실제로 나오는 오류 3종(분모만 바꿈 ·
     공배수가 아닌 분모/최소공배수가 아닌 공배수 · 분자와 분모에 다른 수를 곱함)으로 쓴다.
   · 1-0-2-4(공약수로 약분하기)와 1-0-2-5(기약분수로 나타내기)는 명세의 유형 제목이 같아 구별이 없다.
     이 파일은 1-0-2-4 를 "작은 공약수부터 차례로 나누기"(결과가 아직 기약이 아닐 수 있음),
     1-0-2-5 를 "최대공약수로 한 번에 나눠 기약분수 만들기"로 나눠 낸다.
     그래서 1-0-2-4-t2 의 제목만 명세와 달리 '공약수로 약분하기'(개념 이름)로 적었다.
   · 1-0-2-7 은 기존 생성기 DrillEngine.skill('common') 의 문제(1/a, 1/b)를 그대로 쓰고,
     분모가 있는 일반 진분수는 같은 계열의 fraction-add-different 로 채워 두 분모의
     최소공배수로 통분한다(통분은 표시 변환이고 수치는 기존 생성기가 낸 것이다).
   · 1-0-2-6-t2 는 공통 분모가 여럿이라 그대로 두면 답이 하나로 정해지지 않는다.
     앞 분수의 통분 결과를 주고 같은 공통 분모를 찾아 쓰게 하여 답을 하나로 만든다.
============================================================================= */
(function (root) {
  'use strict';

  /* ---------------------------------------------------------------- 1. 서식 키 */
  // sheet.js 는 서식 이름으로 최소 칸 높이(mm)를 정한다.
  //   'fraction'         → 14mm (비교·물음·고르기)
  //   'fraction-steps'   → 20mm (단계별 빈칸)
  //   'error-correction' → 52mm (틀린 풀이 + 고쳐 쓰는 자리)
  const FMT = {
    compare: 'g102-fraction-compare',
    short: 'g102-fraction-short-answer',
    steps: 'g102-fraction-steps',
    select: 'g102-fraction-selection',
    match: 'g102-fraction-match',
    error: 'g102-fraction-error-correction'
  };
  const FORMAT_OF = {
    sign: FMT.compare, order: FMT.compare, extremes: FMT.compare,
    short: FMT.short, steps: FMT.steps, select: FMT.select,
    match: FMT.match, error: FMT.error
  };

  /* ---------------------------------------------------------------- 2. 개념·유형 표
     instruction 은 명세(spec-fraction.json)의 문구를 그대로 쓴다. */
  const CONCEPTS = {
    '1-0-2-0': { name: '분모가 같은 분수의 크기 비교', tag: '분모 같음', source: 'same' },
    '1-0-2-1': { name: '단위분수의 크기 비교', tag: '단위분수', source: 'unit' },
    '1-0-2-2': { name: '크기가 같은 분수 만들기', tag: '크기가 같은 분수', source: 'reduce' },
    '1-0-2-3': { name: '약수·배수 다시 확인하기', tag: '약수와 배수', source: 'fact' },
    '1-0-2-4': { name: '공약수로 약분하기', tag: '공약수로 약분', source: 'reduce' },
    '1-0-2-5': { name: '기약분수로 나타내기', tag: '기약분수', source: 'reduce' },
    '1-0-2-6': { name: '공배수로 통분하기', tag: '공배수로 통분', source: 'common' },
    '1-0-2-7': { name: '최소공배수로 통분하기', tag: '최소공배수로 통분', source: 'common' },
    '1-0-2-8': { name: '분모가 다른 분수의 크기 비교', tag: '분모 다름', source: 'different' }
  };
  const INSTRUCTION = {
    sign: '분수의 크기를 비교하여 답을 쓰세요.',
    order: '분수의 크기를 비교하여 답을 쓰세요.',
    extremes: '가장 큰 수와 가장 작은 수를 쓰세요.',
    match: '서로 알맞은 것끼리 선으로 이으세요.',
    steps: '빈칸에 알맞은 수를 써서 풀이를 완성하세요.',
    select: '조건에 맞는 것을 골라 표시하세요.',
    short: '물음에 알맞은 답을 쓰세요.',
    error: '잘못 계산한 곳을 찾아 바르게 고쳐 쓰세요.'
  };
  // 문항 수는 layout-rules §2 의 최소 기준에서 시작한다.
  //   분수 변환·크기 비교 3단×14줄=42 · 분수 단계별 빈칸 2단×10줄=20
  //   선 잇기 6쌍×3묶음=18 · 잘못된 계산 고치기 3단×4줄=12 · 약수·배수 쓰기 2단×12줄=24
  // 칸 높이가 남으면 sheet.js 의 autoFit 이 줄을 늘려 종이 아래 빈 곳을 채운다.
  // 문제 풀이 좁은 유형(단위분수·최소공배수 통분)은 autoFit 을 끄고 줄 수를 미리 채운다.
  // title 은 머리말 한 줄(문제지 208px · 정답지 ' · 정답' 포함) 안에 들어가야 해서 짧게 적는다.
  // fullTitle 은 로드맵·명세의 유형 제목과 개념 이름이다(검수 대조용).
  const TYPES = [
    { concept: '1-0-2-0', suffix: 't1', kind: 'sign', title: '부등호 넣기 · 분모 같음', full: '두 수 사이에 부등호 넣기', cols: 3, rows: 14 },
    { concept: '1-0-2-0', suffix: 't2', kind: 'order', title: '순서대로 쓰기 · 분모 같음', full: '작은 수부터 순서대로 쓰기', cols: 3, rows: 14 },
    { concept: '1-0-2-0', suffix: 't3', kind: 'extremes', title: '큰 수 작은 수 · 분모 같음', full: '가장 큰 수와 가장 작은 수 찾기', cols: 3, rows: 14 },

    // 단위분수는 서로 다른 수가 11개뿐이라(2~12) 묶음 수가 한정된다. autoFit 을 끄고 14줄로 채운다.
    { concept: '1-0-2-1', suffix: 't1', kind: 'sign', title: '부등호 넣기 · 단위분수', full: '두 수 사이에 부등호 넣기', cols: 3, rows: 14, autoFit: false },
    { concept: '1-0-2-1', suffix: 't2', kind: 'order', title: '순서대로 쓰기 · 단위분수', full: '작은 수부터 순서대로 쓰기', cols: 3, rows: 14, autoFit: false },
    { concept: '1-0-2-1', suffix: 't3', kind: 'extremes', title: '큰 수 작은 수 · 단위분수', full: '가장 큰 수와 가장 작은 수 찾기', cols: 3, rows: 14, autoFit: false },

    { concept: '1-0-2-2', suffix: 't1', kind: 'match', title: '같은 크기 연결 · 같은 분수', full: '같은 크기를 나타내는 수 연결하기', cols: 3, rows: 6 },
    { concept: '1-0-2-2', suffix: 't2', kind: 'steps', title: '빈칸 채우기 · 같은 분수', full: '같은 크기의 수가 되도록 빈칸 채우기', cols: 2, rows: 10 },
    { concept: '1-0-2-2', suffix: 't3', kind: 'select', title: '모두 고르기 · 같은 분수', full: '같은 크기인 표현 모두 고르기', cols: 2, rows: 12 },

    { concept: '1-0-2-3', suffix: 't1', kind: 'short', title: '관계 구별 · 약수와 배수', full: '약수와 배수 관계 구별하기', cols: 3, rows: 14 },
    { concept: '1-0-2-3', suffix: 't2', kind: 'short', title: '약수·배수 찾기', full: '곱셈식에서 약수·배수 찾기', cols: 2, rows: 12 },
    { concept: '1-0-2-3', suffix: 't3', kind: 'steps', title: '목록 완성 · 약수와 배수', full: '약수·배수 목록 완성하기', cols: 2, rows: 10 },

    { concept: '1-0-2-4', suffix: 't1', kind: 'steps', title: '약분 과정 · 공약수', full: '공약수로 나누는 과정 완성하기', cols: 2, rows: 10 },
    { concept: '1-0-2-4', suffix: 't2', kind: 'short', title: '기약분수까지 약분하기', full: '기약분수까지 약분하기', cols: 3, rows: 14 },
    { concept: '1-0-2-4', suffix: 't3', kind: 'match', title: '약분 전후 연결 · 공약수', full: '약분 전후의 같은 분수 연결하기', cols: 3, rows: 6 },

    { concept: '1-0-2-5', suffix: 't1', kind: 'steps', title: '약분 과정 · 기약분수', full: '공약수로 나누는 과정 완성하기', cols: 2, rows: 10 },
    { concept: '1-0-2-5', suffix: 't2', kind: 'short', title: '기약분수로 나타내기', full: '기약분수까지 약분하기', cols: 3, rows: 14 },
    { concept: '1-0-2-5', suffix: 't3', kind: 'match', title: '약분 전후 연결 · 기약분수', full: '약분 전후의 같은 분수 연결하기', cols: 3, rows: 6 },

    { concept: '1-0-2-6', suffix: 't1', kind: 'short', title: '통분하기 · 공배수', full: '주어진 공통 분모로 통분하기', cols: 3, rows: 14 },
    { concept: '1-0-2-6', suffix: 't2', kind: 'short', title: '분모 찾기 · 공배수', full: '공통 분모를 찾아 통분하기', cols: 3, rows: 14 },
    { concept: '1-0-2-6', suffix: 't3', kind: 'steps', title: '통분 빈칸 · 공배수', full: '통분 과정의 빈칸 채우기', cols: 2, rows: 10 },
    { concept: '1-0-2-6', suffix: 't4', kind: 'error', title: '통분 고치기 · 공배수', full: '잘못 통분한 분수 고치기', cols: 3, rows: 4 },

    { concept: '1-0-2-7', suffix: 't1', kind: 'short', title: '통분하기 · 최소공배수', full: '주어진 공통 분모로 통분하기', cols: 3, rows: 14 },
    { concept: '1-0-2-7', suffix: 't2', kind: 'short', title: '분모 찾기 · 최소공배수', full: '공통 분모를 찾아 통분하기', cols: 3, rows: 14 },
    { concept: '1-0-2-7', suffix: 't3', kind: 'steps', title: '통분 빈칸 · 최소공배수', full: '통분 과정의 빈칸 채우기', cols: 2, rows: 10 },
    { concept: '1-0-2-7', suffix: 't4', kind: 'error', title: '통분 고치기 · 최소공배수', full: '잘못 통분한 분수 고치기', cols: 3, rows: 4 },

    { concept: '1-0-2-8', suffix: 't1', kind: 'sign', title: '부등호 넣기 · 분모 다름', full: '두 수 사이에 부등호 넣기', cols: 3, rows: 14 },
    { concept: '1-0-2-8', suffix: 't2', kind: 'order', title: '순서대로 쓰기 · 분모 다름', full: '작은 수부터 순서대로 쓰기', cols: 3, rows: 14 },
    { concept: '1-0-2-8', suffix: 't3', kind: 'extremes', title: '큰 수 작은 수 · 분모 다름', full: '가장 큰 수와 가장 작은 수 찾기', cols: 3, rows: 14 }
  ];

  // 칸을 채우도록 서식별 기본 글자 크기를 키운다(캡처 확인 후 조정).
  const FONT_OF = spec => (spec.concept >= '1-0-2-6' && spec.concept <= '1-0-2-7' && spec.kind === 'short' && spec.suffix === 't1' ? 14 : { sign: 18, order: 16, extremes: 15, steps: 16, select: 14, error: 17 }[spec.kind] || (spec.cols === 3 ? 16 : 15));
  const entries = TYPES.map(spec => {
    const entry = {
      typeId: spec.concept + '-' + spec.suffix,
      title: spec.title,
      fullTitle: spec.full + ' · ' + CONCEPTS[spec.concept].name,
      instruction: spec.concept === '1-0-2-7' && spec.kind === 'steps' ? '네모 안에 알맞은 숫자를 쓰세요.' : spec.concept === '1-0-2-7' && spec.kind === 'short' ? '최소공배수로 통분하시오.' : INSTRUCTION[spec.kind],
      format: FORMAT_OF[spec.kind],
      cols: spec.cols,
      rows: spec.rows,
      count: spec.cols * spec.rows,
      fontPt: spec.fontPt || FONT_OF(spec),
      seed: 20261001,
      gen: { bundle: '1-0-2', concept: spec.concept, kind: spec.kind, source: CONCEPTS[spec.concept].source }
    };
    if (spec.autoFit === false) entry.autoFit = false;
    // 순서대로 쓰기는 한 장 24문제(3단 × 8줄)로 고정한다.
    if (spec.kind === 'order' || (spec.kind === 'short' && spec.cols === 3)) { entry.rows = 8; entry.count = entry.cols * 8; entry.autoFit = false; entry.maxProblems = 24; }
    if (spec.kind === 'extremes') { entry.cols = 3; entry.rows = 6; entry.count = 18; entry.autoFit = false; entry.maxProblems = 18; entry.title = entry.title.replace('큰 수 작은 수', '가장 큰 수와 가장 작은 수'); }
    if (spec.kind === 'steps') { entry.cols = 2; entry.rows = 8; entry.count = 16; entry.maxProblems = 16; entry.autoFit = false; }
    if (spec.kind === 'select') { entry.cols = 2; entry.rows = 9; entry.count = 18; entry.maxProblems = 18; entry.autoFit = false; }
    if (spec.kind === 'match') { entry.cols = 6; entry.rows = 4; entry.count = 24; entry.autoFit = false; entry.maxProblems = 24; }
    return entry;
  });
  if (Array.isArray(root.SheetCatalog)) root.SheetCatalog.push(...entries);

  /* ---------------------------------------------------------------- 3. 수 도구
     정수 연산만 쓴다(부동소수 오차 금지). 분수는 {n, d} 로 다룬다. */
  const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
  const lcm = (a, b) => a / gcd(a, b) * b;
  function divisorsOf(value) {
    const out = [];
    for (let i = 1; i <= value; i++) if (value % i === 0) out.push(i);
    return out;
  }
  const copy = value => ({ n: value.n, d: value.d });
  const eq = (x, y) => x.n * y.d === y.n * x.d;          // 값이 같은가(교차 곱셈)
  const less = (x, y) => x.n * y.d < y.n * x.d;
  const isMultiple = (a, b) => {                          // a 가 b 의 정수배인가
    const left = a.n * b.d, right = b.n * a.d;
    return right > 0 && left % right === 0;
  };
  function reduced(value) { const g = gcd(value.n, value.d) || 1; return { n: value.n / g, d: value.d / g }; }
  const key = value => { const r = reduced(value); return r.n + '/' + r.d; };
  const text = value => (value.d === 1 ? String(value.n) : value.n + '/' + value.d);
  const esc = value => String(value).replace(/[&<>"']/g,
    c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function parseFraction(value) {
    const s = String(value).trim();
    let m = s.match(/^(\d+)\s+(\d+)\/(\d+)$/);
    if (m) return { n: Number(m[1]) * Number(m[3]) + Number(m[2]), d: Number(m[3]) };
    m = s.match(/^(\d+)\/(\d+)$/);
    if (m) return { n: Number(m[1]), d: Number(m[2]) };
    m = s.match(/^(\d+)$/);
    if (m) return { n: Number(m[1]), d: 1 };
    return null;
  }
  function random(seed) {
    let s = (Number(seed) >>> 0) || 1;
    return (lo, hi) => {
      s += 0x6d2b79f5;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return lo + Math.floor((((t ^ (t >>> 14)) >>> 0) / 4294967296) * (hi - lo + 1));
    };
  }
  function shuffled(list, rnd) {
    const out = list.slice();
    for (let i = out.length - 1; i > 0; i--) { const j = rnd(0, i); const tmp = out[i]; out[i] = out[j]; out[j] = tmp; }
    return out;
  }
  const pickCombos = (values, k, rnd) => shuffled(values, rnd).slice(0, k).sort((a, b) => a - b);
  function sortBy(items, score) {
    return items.map((item, index) => ({ item, index, score: score(item) }))
      .sort((x, y) => (x.score - y.score) || (x.index - y.index))
      .map(entry => entry.item);
  }
  /** g 를 1~2개의 (1보다 큰) 곱으로 나눈다 — 약분 과정을 한두 단계로 보여 주기 위해. */
  function factorPath(value, rnd) {
    const proper = divisorsOf(value).filter(divisor => divisor > 1 && divisor < value);
    if (!proper.length) return [value];
    const first = proper[rnd(0, proper.length - 1)];
    return [first, value / first].filter(part => part > 1);
  }

  /* ---------------------------------------------------------------- 4. 기존 생성기 연결 */
  function legacyRows(id, seed, count, filter) {
    const generator = root.FractionLegacyGenerate || (root.Worksheets && root.Worksheets.generate);
    if (typeof generator !== 'function') throw Error('기존 Worksheets 생성기를 찾지 못했습니다.');
    // 한 번에 너무 많이 요청하면 풀이 작은 생성기(multiply-one 은 64쌍)가 통째로 실패한다.
    const out = [], seen = new Set(), batchSize = Math.max(16, Math.min(count, 48));
    for (let batch = 0; out.length < count && batch < 200; batch++) {
      let rows;
      // seed 와 count 를 그대로 넘긴다(묶음 파일은 bind 된 함수를 받는다).
      try { rows = generator(id, (seed + Math.imul(batch, 2654435761)) >>> 0, batchSize); }
      catch (error) { break; }
      for (const q of rows) {
        const mark = q.a + '|' + q.op + '|' + q.b;
        if (seen.has(mark) || (filter && !filter(q))) continue;
        seen.add(mark); out.push(q);
        if (out.length === count) break;
      }
    }
    if (out.length < count) {
      throw Error('기존 생성기 ' + id + ' 에서 문항 ' + count + '개 중 ' + out.length + '개만 얻었습니다.');
    }
    return out;
  }
  /** DrillEngine.skill 을 seed 로 돌려 서로 다른 문제를 모은다.
      tolerant=true 면 모자라도 있는 만큼만 돌려준다(부르는 쪽이 조건으로 다시 거른다). */
  function skillRows(skill, seed, count, filter, tolerant) {
    if (!root.DrillEngine || typeof root.DrillEngine.skill !== 'function') {
      throw Error('기존 DrillEngine.skill 을 찾지 못했습니다.');
    }
    const rnd = random(seed), out = [], seen = new Set();
    for (let attempt = 0; out.length < count && attempt < 80000; attempt++) {
      const q = root.DrillEngine.skill(skill, rnd);
      if (seen.has(q.prompt) || (filter && !filter(q))) continue;
      seen.add(q.prompt); out.push(q);
    }
    if (out.length < count && !tolerant) {
      throw Error('기존 생성기 skill ' + skill + ' 에서 문항 ' + count + '개 중 ' + out.length + '개만 얻었습니다.');
    }
    return out;
  }

  /* ---------------------------------------------------------------- 5. 문제 재료 */
  /** 기존 fraction-* 생성기가 내는 진분수(분모 2~12). */
  const isProper = f => !!f && f.d >= 2 && f.n >= 1 && f.n < f.d && f.d <= 12;
  /** DrillEngine.skill('reduce') 가 내는 진분수 — 약분 전 분모는 96까지 간다. */
  const isReducible = f => !!f && f.d >= 2 && f.n >= 1 && f.n < f.d && f.d <= 96;

  /** 분모가 같은 진분수 두 개 — 기존 생성기 fraction-add-same. */
  function sameDenominatorRows(seed, need) {
    const out = [];
    for (const q of legacyRows('fraction-add-same', seed, Math.max(need, 96))) {
      const a = parseFraction(q.a), b = parseFraction(q.b);
      if (!isProper(a) || !isProper(b) || a.d !== b.d || a.n === b.n) continue;
      out.push({ a, b });
    }
    return out;
  }
  function sameDenominatorPool(seed, need) {
    const byDen = new Map();
    for (const q of legacyRows('fraction-add-same', seed, Math.max(need, 160))) {
      for (const part of [q.a, q.b]) {
        const f = parseFraction(part);
        if (!isProper(f)) continue;
        if (!byDen.has(f.d)) byDen.set(f.d, new Set());
        byDen.get(f.d).add(f.n);
      }
    }
    return byDen;
  }
  /** 분모가 다른 진분수 두 개 — 기존 생성기 fraction-add-different. */
  function differentDenominatorRows(seed, need) {
    const out = [];
    for (const q of legacyRows('fraction-add-different', seed, Math.max(need, 96))) {
      const a = parseFraction(q.a), b = parseFraction(q.b);
      if (!isProper(a) || !isProper(b) || a.d === b.d) continue;
      out.push({ a, b });
    }
    return out;
  }
  function differentDenominatorPool(seed, need) {
    const byDen = new Map();
    for (const q of legacyRows('fraction-add-different', seed, Math.max(need, 200))) {
      for (const part of [q.a, q.b]) {
        const f = parseFraction(part);
        if (!isProper(f)) continue;
        if (!byDen.has(f.d)) byDen.set(f.d, new Set());
        byDen.get(f.d).add(f.n);
      }
    }
    return byDen;
  }
  /** 단위분수 — 기존 생성기 DrillEngine.skill('compare-fraction') 이 낸 1/a, 1/b. */
  function unitDenominators(seed, need) {
    if (!root.DrillEngine || typeof root.DrillEngine.skill !== 'function') {
      throw Error('기존 DrillEngine.skill 을 찾지 못했습니다.');
    }
    const rnd = random(seed), out = [], seen = new Set();
    for (let attempt = 0; out.length < need && attempt < 20000; attempt++) {
      const q = root.DrillEngine.skill('compare-fraction', rnd);
      const parts = (q.prompt.match(/1\/(\d+)/g) || []).map(s => Number(s.slice(2)));
      for (const d of parts) {
        if (d < 2 || d > 12 || seen.has(d)) continue;
        seen.add(d); out.push(d);
      }
    }
    if (out.length < need) throw Error('단위분수 분모를 ' + need + '개 만들지 못했습니다: ' + out.length);
    return out;
  }
  /** 약분 재료 — 기존 생성기 DrillEngine.skill('reduce'). {from, base, g}
      약분 결과가 진분수가 되는 문항만 쓴다(선행 학습 수준 유지). */
  function reduceRows(seed, need) {
    const out = [];
    for (const q of skillRows('reduce', seed, Math.max(need, 64), null, true)) {
      const parts = q.prompt.match(/(\d+)\/(\d+)/);
      const from = parts ? { n: Number(parts[1]), d: Number(parts[2]) } : null;
      const base = parseFraction(q.answer);
      if (!from || !base || !isReducible(from) || !isProper(base)) continue;
      const g = gcd(from.n, from.d);
      if (g < 2) continue;                       // 이미 기약이면 약분 문제가 아니다
      out.push({ from, base, to: base, g });
    }
    return out;
  }
  /** 통분 재료 — 기존 생성기 DrillEngine.skill('common') + fraction-add-different. */
  function convertRows(seed, need) {
    const out = [], seen = new Set();
    const unitNeed = Math.ceil(need / 2);
    const rnd = random(seed ^ 0x27d4eb2f);
    for (let attempt = 0; out.length < unitNeed && attempt < 20000; attempt++) {
      const q = root.DrillEngine.skill('common', rnd);
      const parts = (q.prompt.match(/1\/(\d+)/g) || []).map(s => Number(s.slice(2)));
      if (parts.length !== 2 || parts[0] === parts[1]) continue;
      const x = { n: 1, d: parts[0] }, y = { n: 1, d: parts[1] };
      const mark = [key(x), key(y)].sort().join('|');
      if (seen.has(mark)) continue;
      seen.add(mark); out.push({ x, y });
    }
    for (const q of legacyRows('fraction-add-different', seed, Math.max(need, 128))) {
      const x = parseFraction(q.a), y = parseFraction(q.b);
      if (!isProper(x) || !isProper(y) || x.d === y.d) continue;
      const mark = [key(x), key(y)].sort().join('|');
      if (seen.has(mark)) continue;
      seen.add(mark); out.push({ x, y });
      if (out.length >= need) break;
    }
    return out;
  }
  /** 곱셈식 — 기존 생성기 multiply-one 과 DrillEngine.skill('factor') 의 a × g = x. */
  function multiplyFacts(seed, need) {
    const out = [], seen = new Set();
    // multiply-one 은 2~9 × 2~9 라서 서로 다른 식이 64개뿐이다. 그만큼만 요청한다.
    for (const q of legacyRows('multiply-one', seed, Math.min(Math.max(need, 32), 64))) {
      const a = Number(q.a), b = Number(q.b), c = Number(q.answer);
      const mark = a + '×' + b;
      if (!(a >= 2 && b >= 2 && a <= 9 && b <= 9 && c === a * b) || seen.has(mark)) continue;
      seen.add(mark); out.push({ a, b, c });
    }
    if (out.length < need) {
      const rnd = random(seed ^ 0x1f123bb5);
      for (let attempt = 0; out.length < need && attempt < 40000; attempt++) {
        const q = root.DrillEngine.skill('factor', rnd);
        const x = Number((q.prompt.match(/^(\d+)/) || [])[1]);
        if (!Number.isFinite(x) || x < 4) continue;
        for (let a = 2; a <= 12; a++) {
          if (x % a) continue;
          const b = x / a, mark = a + '×' + b;
          if (b < 2 || b > 12 || seen.has(mark)) continue;
          seen.add(mark); out.push({ a, b, c: x });
        }
      }
    }
    // 기존 생성기가 낼 수 있는 곱셈식에는 한계가 있다(2~9 는 64가지). 모자라면 부르는 쪽에서 판단한다.
    return out;
  }
  /** 약수·배수 목록 — 기존 생성기 factor · multiple. */
  function listRows(seed, need, maxLength) {
    const out = [], seen = new Set();
    const take = (skill, count_, label) => {
      for (const q of skillRows(skill, seed ^ (label === '약수' ? 0x1f123bb5 : 0x6d2b79f5), count_, null, true)) {
        const list = q.answer.split(',').map(s => Number(s.trim()));
        const target = Number((q.prompt.match(/^(\d+)/) || [])[1]);
        if (!Number.isFinite(target) || list.some(value => !Number.isFinite(value))) continue;
        if (list.length < 3 || list.length > maxLength) continue;
        if (list.join(', ').length > 20) continue;
        const mark = label + ':' + target + ':' + list.join(',');
        if (seen.has(mark)) continue;
        seen.add(mark); out.push({ target, label, list });
      }
    };
    take('factor', need * 3, '약수');       // 조건에 맞는 것만 남기므로 넉넉히 뽑는다
    take('multiple', need, '배수');
    if (out.length < need) throw Error('약수·배수 목록을 ' + need + '개 만들지 못했습니다: ' + out.length);
    return out;
  }

  /* ---------------------------------------------------------------- 6. 문항 만들기 */
  // 6-1. 부등호·순서·가장 큰 수 ---------------------------------------------------
  function signItems(concept, seed, count) {
    const source = CONCEPTS[concept].source;
    const pairs = [], seen = new Set();
    const push = (a, b) => {
      const mark = [key(a), key(b)].sort().join('|');
      if (seen.has(mark)) return;
      seen.add(mark); pairs.push({ a, b });
    };
    if (source === 'same') {
      sameDenominatorRows(seed, count).forEach(row => push(row.a, row.b));
    } else if (source === 'unit') {
      const dens = unitDenominators(seed, 11);
      for (const a of dens) for (const b of dens) if (a < b) push({ n: 1, d: a }, { n: 1, d: b });
    } else {
      // 분모가 다른 비교 — 크기가 같은 한 쌍(약분으로 확인)도 섞어 '=' 를 넣는다.
      const equals = reduceRows(seed ^ 0x9e3779b9, Math.max(6, Math.round(count * 0.2)));
      equals.slice(0, Math.max(2, Math.round(count * 0.08))).forEach(row => push(row.from, row.base));
      differentDenominatorRows(seed, count + 8).forEach(row => push(row.a, row.b));
    }
    const items = pairs.map(pair => ({
      a: pair.a, b: pair.b,
      sign: eq(pair.a, pair.b) ? '=' : less(pair.a, pair.b) ? '<' : '>'
    }));
    return sortBy(items, item => Math.max(item.a.d, item.b.d) * 100 + item.a.n + item.b.n).slice(0, count);
  }
  function orderItems(concept, seed, count, k) {
    const rnd = random(seed ^ 0x2545f491);
    return groupsFor(CONCEPTS[concept].source, seed, count, k).map(values => {
      const sorted = values.slice().sort((x, y) => (less(x, y) ? -1 : 1));
      let shown = shuffled(values, rnd);
      if (shown.every((value, index) => eq(value, sorted[index]))) shown = shown.slice(1).concat(shown.slice(0, 1));
      return { values: shown, sorted };
    });
  }
  function extremesItems(concept, seed, count, k) {
    const rnd = random(seed ^ 0x85ebca6b);
    return groupsFor(CONCEPTS[concept].source, seed, count, k).map(values => ({
      values: shuffled(values, rnd),
      max: values.reduce((best, value) => (less(best, value) ? value : best)),
      min: values.reduce((best, value) => (less(value, best) ? value : best))
    }));
  }
  /** 값이 서로 다른 분수 k개 묶음 — 개념 조건(같은 분모 / 단위분수 / 다른 분모)을 지킨다. */
  function groupsFor(source, seed, count, k) {
    const groups = [], seen = new Set(), rnd = random(seed ^ 0x5bf03635);
    const push = (values, mark) => { seen.add(mark); groups.push(values); };
    if (source === 'same') {
      const byDen = sameDenominatorPool(seed, Math.max(count, 160));
      const dens = [...byDen.keys()].sort((a, b) => a - b);
      for (let round = 0; groups.length < count && round < 600; round++) {
        for (const d of dens) {
          const nums = [...byDen.get(d)].sort((a, b) => a - b);
          if (nums.length < k) continue;
          const pick = pickCombos(nums, k, rnd);
          const mark = d + ':' + pick.join(',');
          if (seen.has(mark)) continue;
          push(pick.map(n => ({ n, d })), mark);
          if (groups.length >= count) break;
        }
      }
    } else if (source === 'unit') {
      const dens = unitDenominators(seed, 11);
      for (let round = 0; groups.length < count && round < 800; round++) {
        const pick = pickCombos(dens, k, rnd);
        if (pick.length < k) break;
        const mark = pick.join(',');
        if (seen.has(mark)) continue;
        push(pick.map(d => ({ n: 1, d })), mark);
      }
    } else {
      const byDen = differentDenominatorPool(seed, Math.max(count, 200));
      const dens = [...byDen.keys()].sort((a, b) => a - b);
      for (let round = 0; groups.length < count && round < 1200; round++) {
        const chosen = shuffled(dens, rnd).slice(0, k);
        if (chosen.length < k) break;
        const values = chosen.map(d => {
          const nums = [...byDen.get(d)].sort((a, b) => a - b);
          return { n: nums[rnd(0, nums.length - 1)], d };
        });
        const marks = values.map(key);
        if (new Set(marks).size !== k) continue;
        const mark = marks.slice().sort().join('|');
        if (seen.has(mark)) continue;
        push(values, mark);
      }
    }
    if (groups.length < count) {
      throw Error('분수 묶음을 ' + count + '개 만들지 못했습니다(' + source + '): ' + groups.length);
    }
    return groups;
  }

  // 6-2. 크기가 같은 분수 만들기 ---------------------------------------------------
  /** base(기약분수) → expanded = base × k. 기존 생성기 reduce 의 (n·g)/(d·g) → n/d 를 뒤집어 쓴다. */
  function sameValueItems(seed, count) {
    return sortBy(reduceRows(seed, Math.max(count, 64)).map(row => ({
      base: copy(row.base),
      expanded: copy(row.from),
      k: row.from.d / row.base.d,
      g: row.g
    })), item => item.expanded.d * 100 + item.expanded.n).slice(0, count);
  }
  function selectItems(seed, count) {
    const pool = sameValueItems(seed, Math.max(count * 3, 96));
    const rnd = random(seed ^ 0x165667b1);
    const wrongPool = [];
    for (const row of sameDenominatorRows(seed ^ 0x7f4a7c15, Math.max(count, 64))) { wrongPool.push(row.a, row.b); }
    for (const row of differentDenominatorRows(seed ^ 0x2545f491, Math.max(count, 64))) { wrongPool.push(row.a, row.b); }
    const items = [], seen = new Set();
    for (const source of pool) {
      if (items.length >= count) break;
      const target = source.base;
      const correct = [], usedText = new Set([text(target)]);
      for (const other of pool) {
        if (correct.length >= 2) break;
        if (other === source) continue;
        if (!eq(other.expanded, target) || usedText.has(text(other.expanded))) continue;
        usedText.add(text(other.expanded)); correct.push(other.expanded);
      }
      if (!correct.length) continue;
      const wrongs = [], needWrong = 4 - correct.length;      // 선택지는 언제나 4개
      for (const candidate of shuffled(wrongPool, rnd)) {
        if (wrongs.length >= needWrong) break;
        if (!isProper(candidate) || eq(candidate, target) || usedText.has(text(candidate))) continue;
        if (wrongs.some(other => eq(other, candidate))) continue;
        usedText.add(text(candidate)); wrongs.push(candidate);
      }
      if (wrongs.length < needWrong) continue;
      const options = shuffled(correct.map(f => ({ f, ok: true })).concat(wrongs.map(f => ({ f, ok: false }))), rnd);
      const mark = key(target) + ':' + options.map(option => text(option.f)).join(',');
      if (seen.has(mark)) continue;
      seen.add(mark);
      items.push({ target, options, okCount: correct.length });
    }
    if (items.length < count) throw Error('고르기 문항을 ' + count + '개 만들지 못했습니다: ' + items.length);
    return sortBy(items, item => item.target.d * 100 + item.target.n);
  }

  // 6-3. 약수·배수 ---------------------------------------------------------------
  function relationItems(seed, count) {
    const facts = multiplyFacts(seed, Math.max(count, 96));
    const items = [], seen = new Set();
    for (const fact of facts) {
      for (const shape of [1, 2, 3]) {
        if (items.length >= count) break;
        const mark = shape + ':' + fact.a + ':' + fact.b;
        if (seen.has(mark)) continue;
        seen.add(mark);
        // 1: c 는 a 의 □ (배수) · 2: a 는 c 의 □ (약수) · 3: a, b 는 c 의 □ (약수)
        items.push({ a: fact.a, b: fact.b, c: fact.c, shape, answer: shape === 1 ? '배수' : '약수' });
      }
      if (items.length >= count) break;
    }
    if (items.length < count) throw Error('약수·배수 관계 문항을 ' + count + '개 만들지 못했습니다.');
    return sortBy(items, item => item.c * 10 + item.shape);
  }
  function findItems(seed, count) {
    const facts = multiplyFacts(seed, Math.max(count * 2, 160));
    const items = [], seen = new Set();
    for (const fact of facts) {
      const task = items.length % 2 === 0 ? 'divisors' : 'multiples';
      const mark = task === 'divisors' ? task + ':' + fact.c : task + ':' + fact.a + ':' + fact.c;
      if (seen.has(mark)) continue;
      const list = task === 'divisors' ? divisorsOf(fact.c)
        : Array.from({ length: fact.b }, (unused, index) => fact.a * (index + 1));
      if (list.join(', ').length > 20) continue;      // 답이 한 줄을 넘으면 버린다
      seen.add(mark);
      items.push({ a: fact.a, b: fact.b, c: fact.c, list, task });
      if (items.length >= count) break;
    }
    if (items.length < count) throw Error('곱셈식 약수·배수 문항을 ' + count + '개 만들지 못했습니다: ' + items.length);
    return sortBy(items, item => item.c);
  }
  function listStepItems(seed, count) {
    const rnd = random(seed ^ 0x9e3779b9);
    const items = listRows(seed, count, 8).map(row => {
      const total = row.list.length;
      const blanks = [total - 1];
      const middles = [];
      for (let i = 1; i < total - 1; i++) middles.push(i);
      for (const index of shuffled(middles, rnd).slice(0, total > 6 ? 2 : 1)) blanks.push(index);
      blanks.sort((a, b) => a - b);
      return { target: row.target, label: row.label, list: row.list, blanks };
    });
    return sortBy(items, item => item.target * 10 + item.list.length).slice(0, count);
  }

  // 6-4. 약분 --------------------------------------------------------------------
  /** 공약수로 나누기(1-0-2-4) — 1~2개의 공약수로 차례로 나눈다(결과가 아직 기약이 아닐 수 있다). */
  function commonDivisorItems(seed, count) {
    const rnd = random(seed ^ 0x7feb352d);
    const items = [];
    for (const row of reduceRows(seed, Math.max(count, 64))) {
      const path = factorPath(row.g, rnd);
      let current = copy(row.from);
      const steps = [];
      for (const factor of path) {
        steps.push({ by: factor, to: { n: current.n / factor, d: current.d / factor } });
        current = steps[steps.length - 1].to;
      }
      if (!steps.length) continue;
      items.push({ from: copy(row.from), steps, to: copy(current), base: copy(row.base), g: row.g });
      if (items.length >= count) break;
    }
    if (items.length < count) throw Error('공약수 약분 문항을 ' + count + '개 만들지 못했습니다: ' + items.length);
    return sortBy(items, item => item.from.d * 100 + item.from.n);
  }
  /** 기약분수로 나타내기(1-0-2-5) — 최대공약수로 한 번에 나눈다. */
  function simplestItems(seed, count) {
    const items = [];
    for (const row of reduceRows(seed, Math.max(count, 64))) {
      items.push({ from: copy(row.from), to: copy(row.base), g: row.g });
      if (items.length >= count) break;
    }
    if (items.length < count) throw Error('기약분수 문항을 ' + count + '개 만들지 못했습니다: ' + items.length);
    return sortBy(items, item => item.from.d * 100 + item.from.n);
  }

  // 6-5. 통분 --------------------------------------------------------------------
  /** 공통 분모 = 두 분모의 최소공배수 × multiplier.
      1-0-2-7(최소공배수)은 최소공배수만, 1-0-2-6(공배수)은 2·3·4배(최소공배수가 아닌 공배수)만 쓴다. */
  function convertItems(concept, seed, count) {
    const leastOnly = concept === '1-0-2-7';
    const items = [], seen = new Set();
    const multipliers = leastOnly ? [1] : [2, 3, 4];
    for (const row of convertRows(seed, Math.max(count * 2, 160))) {
      const least = lcm(row.x.d, row.y.d);
      for (const multiplier of multipliers) {
        if (items.length >= count) break;
        const target = least * multiplier;
        // 이미 공통 분모로 되어 있는 분수만 있는 문항은 통분 연습이 되지 않는다.
        if (target === row.x.d || target === row.y.d) continue;
        const mark = [key(row.x), key(row.y)].sort().join('|') + '@' + target;
        if (seen.has(mark)) continue;
        seen.add(mark);
        items.push({
          x: copy(row.x), y: copy(row.y), target, least, multiplier,
          xc: { n: row.x.n * (target / row.x.d), d: target },
          yc: { n: row.y.n * (target / row.y.d), d: target }
        });
      }
      if (items.length >= count) break;
    }
    if (items.length < count) throw Error('통분 문항을 ' + count + '개 만들지 못했습니다: ' + items.length);
    return sortBy(items, item => item.least * 100 + item.target);
  }
  /** 통분 오류 3종 — 이 개념에서 실제로 나오는 오류만 쓴다. */
  const ERROR_KINDS = {
    '1-0-2-6': [
      { id: 'numOnly', note: '분모만 바꾸고 분자는 그대로 둠' },
      { id: 'badDen', note: '공배수가 아닌 수를 공통 분모로 씀' },
      { id: 'unequal', note: '분자와 분모에 다른 수를 곱함' }
    ],
    '1-0-2-7': [
      { id: 'numOnly', note: '분모만 바꾸고 분자는 그대로 둠' },
      { id: 'notLeast', note: '최소공배수가 아닌 공배수를 공통 분모로 씀' },
      { id: 'unequal', note: '분자와 분모에 다른 수를 곱함' }
    ]
  };
  function wrongConversion(kindId, item) {
    const target = item.target, y = item.y, x = item.x;
    switch (kindId) {
      case 'numOnly':                                  // 분자에 배수를 곱하지 않음
        return { n: y.n, d: target };
      case 'badDen': {                                 // 공배수가 아닌 분모(다른 분수의 분모로는 나누어지지 않음)
        for (let factor = 1; factor <= 12; factor++) {
          const wrong = target + y.d * factor;
          if (wrong % x.d === 0) continue;
          return { n: y.n * (wrong / y.d), d: wrong };
        }
        return null;
      }
      case 'notLeast': {                               // 공배수이긴 하지만 최소공배수의 2배
        const wrong = target * 2;
        return { n: y.n * (wrong / y.d), d: wrong };
      }
      case 'unequal':                                  // 분모에만 다른 수를 곱함
        return { n: y.n * (target / y.d) + 1, d: target };
      default: throw Error('알 수 없는 통분 오류: ' + kindId);
    }
  }
  function errorItems(concept, seed, count) {
    const kinds = ERROR_KINDS[concept];
    const items = [], seen = new Set();
    for (const row of convertRows(seed, Math.max(count * 3, 160))) {
      if (items.length >= count) break;
      const least = lcm(row.x.d, row.y.d);
      const target = concept === '1-0-2-7' ? least : least * (2 + (items.length % 3));
      if (target === row.x.d || target === row.y.d) continue;
      const mark = [key(row.x), key(row.y)].sort().join('|') + '@' + target;
      if (seen.has(mark)) continue;
      const item = {
        x: copy(row.x), y: copy(row.y), target, least,
        xc: { n: row.x.n * (target / row.x.d), d: target },
        yc: { n: row.y.n * (target / row.y.d), d: target }
      };
      const kind = kinds[items.length % kinds.length];
      const wrong = wrongConversion(kind.id, item);
      if (!wrong) continue;
      // 공배수가 아닌 분모를 쓰는 오류는 '값'은 그대로고 '모양'만 틀리다. 모양으로 견준다.
      if (text(wrong) === text(item.yc) || text(wrong) === text(item.y)) continue;
      if (wrong.n <= 0 || !Number.isInteger(wrong.n) || wrong.d <= 0) continue;
      seen.add(mark);
      items.push(Object.assign({}, item, { errorKind: kind.id, note: kind.note, wrong }));
    }
    if (items.length < count) throw Error('통분 고치기 문항을 ' + count + '개 만들지 못했습니다: ' + items.length);
    return sortBy(items, item => item.least * 100 + item.target);
  }
  /** 통분 과정의 빈칸 (1-0-2-6-t3 · 1-0-2-7-t3) */
  function convertStepItems(concept, seed, count) {
    const askedLeast = concept === '1-0-2-7';
    return convertItems(concept, seed, count).map(item => ({
      x: copy(item.x), y: copy(item.y), target: item.target, least: item.least, askedLeast
    })).slice(0, count);
  }

  // 6-6. 선 잇기 -----------------------------------------------------------------
  /** 연결쌍 — 같은 묶음 안에서 답이 하나로 정해지도록(오른쪽 값 중복 · 정수배 관계) 걸러 낸다.
      왼쪽 L 을 오른쪽 R 로 바꾸는 방법이 하나뿐이어야 하므로, 다른 왼쪽이 R 의 정수배이거나
      다른 오른쪽이 L 의 정수배이면 그 쌍은 쓰지 않는다. */
  function matchPairs(concept, seed, perBundle, bundleCount) {
    const need = perBundle * bundleCount;
    const source = concept === '1-0-2-2'
      ? sameValueItems(seed, need * 6).map(item => [item.base, item.expanded])
      : concept === '1-0-2-4'
        ? commonDivisorItems(seed, need * 6).map(item => [item.from, item.steps[0].to])
        : simplestItems(seed, need * 6).map(item => [item.from, item.to]);
    const bundles = [];
    const usedLeft = new Set(), usedRight = new Set();
    for (let index = 0; index < bundleCount; index++) {
      const bundle = [];
      for (const pair of source) {
        if (bundle.length >= perBundle) break;
        const [left, right] = pair;
        if (usedLeft.has(text(left)) || usedRight.has(text(right))) continue;
        // 같은 값이 두 번 나오면 어느 것과 이어야 하는지 정해지지 않는다.
        // 다른 왼쪽이 이 오른쪽의 정수배이거나(그 왼쪽도 같은 값이 된다) 다른 오른쪽이
        // 이 왼쪽의 정수배이면 짝이 갈리므로 쓰지 않는다.
        const conflicts = bundle.some(chosen =>
          eq(chosen[0], left) || eq(chosen[1], right)
          || isMultiple(chosen[0], right) || isMultiple(left, chosen[1]));
        if (conflicts) continue;
        bundle.push([left, right]);
        usedLeft.add(text(left)); usedRight.add(text(right));
      }
      if (bundle.length < perBundle) {
        throw Error('연결쌍 묶음을 만들지 못했습니다(' + concept + '): ' + bundle.length + '/' + perBundle);
      }
      bundles.push(bundle);
    }
    return bundles;
  }
  function matchBundles(concept, seed, count) {
    const bundles = count % 6 === 0 ? 6 : 3;                 // 24쌍 = 6세트 × 4(2단 × 3줄)
    const perBundle = Math.max(4, Math.round(count / bundles));
    const built = matchPairs(concept, seed, perBundle, bundles);
    const rnd = random(seed ^ 0x2545f491);
    return {
      items: built.map(bundle => ({
        kind: 'bundle', caption: '', rowsWeight: perBundle, compact: true, compactW: 16,   // 동그라미를 분수 바로 옆에 붙인 2단 배치
        pairs: bundle.map(pair => [{ html: fractionHTML(pair[0]) }, { html: fractionHTML(pair[1]) }]),
        order: matchOrder(bundle.length, rnd)
      })),
      layout: { cols: bundles, rows: perBundle, count: built.length * perBundle },
      pairs: built.length * perBundle
    };
  }
  /** 오른쪽 번호가 왼쪽 번호와 같아지지 않게(정답 노출 금지) 흩는다. */
  function matchOrder(size, rnd) {
    const list = Array.from({ length: size }, (unused, index) => index);
    for (let i = list.length - 1; i > 0; i--) { const j = rnd(0, i); const tmp = list[i]; list[i] = list[j]; list[j] = tmp; }
    for (let i = 0; i < list.length; i++) if (list[i] === i) {
      const j = (i + 1) % list.length;
      const tmp = list[i]; list[i] = list[j]; list[j] = tmp;
    }
    return list;
  }

  /* ---------------------------------------------------------------- 7. 서식(그리기) */
  const SLOT = '\u0001';      // 네모 빈칸(분수 안에서는 가로줄만 남는다)
  const LINE = '\u0002';      // 밑줄 빈칸
  const WIDE = '\u0003';      // 넓은 밑줄 빈칸(약수 목록처럼 답이 긴 자리)
  const CIRCLED = '①②③④⑤⑥⑦⑧⑨⑩';
  const stackHTML = (top, bottom) => '<span class="g102-frac"><span>' + top + '</span><span>' + bottom + '</span></span>';
  function fractionHTML(value) {
    if (value.d === 1) return '<span class="g102-whole">' + esc(value.n) + '</span>';
    return stackHTML(esc(value.n), esc(value.d));
  }
  const opHTML = symbol => '<span class="g102-op">' + symbol + '</span>';
  const ink = html => '<span class="g102-ink">' + html + '</span>';
  const label = (text_, soft) => '<span class="' + (soft ? 'g102-soft' : 'g102-label') + '">' + text_ + '</span>';

  function css() {
    if (typeof document === 'undefined' || document.getElementById('g102-styles')) return;
    const style = document.createElement('style');
    style.id = 'g102-styles';
    style.textContent = [
      // 분수는 언제나 줄 가운데에 맞춘다 — 홑분수·기호·빈칸의 높이가 갈리지 않게.
      '.g102-line{display:flex;align-items:center;white-space:nowrap;line-height:1.2;min-width:0}',
      '.g102-frac{display:inline-flex;vertical-align:middle;flex-direction:column;text-align:center;line-height:1;',
      'font-variant-numeric:tabular-nums;margin:0 .12em;min-width:1.5em}',
      '.g102-frac>span{display:block;padding:0 .14em;min-width:.9em}',
      '.g102-frac>span:first-child{border-bottom:1px solid #111;padding-bottom:.06em}',
      '.g102-frac>span:last-child{padding-top:.06em}',
      '.g102-whole{vertical-align:middle}',
      '.g102-op{display:inline-block;margin:0 .16em}',
      '.g102-box{display:inline-block;min-width:7mm;height:1.15em;border:1px solid #666;border-radius:.6mm;',
      'vertical-align:middle;text-align:center;line-height:1.05}',
      '.g102-frac>.g102-box{border:none;border-radius:0;min-width:1.4em;height:1.05em}',
      '.g102-underline{display:inline-block;min-width:12mm;height:1.1em;border-bottom:1px solid #555;text-align:center;vertical-align:middle}',
      '.g102-wide{min-width:34mm}',
      '.g102-slot{min-width:9mm}',
      '.g102-ink{color:#d71f10}',
      '.g102-fbox{display:inline-flex;align-items:center;justify-content:center;min-width:1.9em;height:2.7em;box-sizing:border-box;',
      'border:1px solid #666;border-radius:.6mm;vertical-align:middle;margin:0 .1em}',
      '.g102-fbox.g102-fans{border-color:transparent;font-size:1.25em;height:2.16em}',
      '.g102-sign{display:inline-block;min-width:6mm;height:1.15em;border:1px solid #666;border-radius:.6mm;',
      'vertical-align:middle;text-align:center;line-height:1.05;font-weight:bold}',
      '.g102-values>*{margin-right:2.2mm}',
      '.g102-orderbox{min-width:7.5mm;width:7.5mm;height:12mm;border-radius:0;flex:none}',
      '.g102-extreme-part{display:inline-flex;align-items:center;gap:.5mm;font-size:9pt}',
      '.g102-extreme-part .g102-fbox{min-width:9mm;height:14mm;border-radius:0}',
      '.g102-gap{display:inline-block;width:2.4mm}',
      '.g102-label{margin-right:.8mm}',
      '.g102-soft{font-size:.7em;color:#555;margin:0 1.2mm}',
      '.g102-note{font-size:.68em;color:#555;line-height:1.15;white-space:normal;word-break:keep-all;text-align:center;max-width:96%}',
      '.g102-work{width:86%;box-sizing:border-box;min-height:16mm;margin-top:1.5mm;border:1px solid #ccc;border-radius:1mm;padding:1mm}',
      '.g102-work.g102-solved{border-style:dashed}',
      '.g102-option{margin-right:1.8mm}',
      '.g102-circle{border:.4mm solid #b32b2b;border-radius:50%;padding:0 .8mm}',
      '.answer-page .sheet-cell.g102-tight{padding-top:.3mm;padding-bottom:0}'
    ].join('');
    document.head.appendChild(style);
  }
  /** 템플릿의 빈칸을 채운다. answer=false 면 빈칸 상자, true 면 붉은 답. */
  function fillSlots(template, fills, answer) {
    let index = 0;
    return template.replace(new RegExp('[' + SLOT + LINE + WIDE + ']', 'g'), match => {
      const value = fills[index++];
      const isFraction = typeof value === 'string' && value.indexOf('g102-frac') >= 0 && match === SLOT;
      if (answer && isFraction) return '<span class="g102-fbox g102-fans">' + ink(value) + '</span>';
      if (isFraction) return '<span class="g102-fbox"></span>';
      if (answer) return value == null ? '' : ink(value);
      if (match === SLOT) return '<span class="g102-box"></span>';
      if (match === WIDE) return '<span class="g102-underline g102-wide"></span>';
      return '<span class="g102-underline"></span>';
    });
  }

  function renderCompare(cell, item, answer, config) {
    css();
    const kind = config.gen.kind;
    if (answer && kind !== 'sign') cell.classList.add('g102-tight');
    if (kind === 'sign') {
      const sign = '<span class="g102-sign">' + (answer ? ink(item.sign) : '') + '</span>';
      cell.insertAdjacentHTML('beforeend',
        '<div class="g102-line">' + fractionHTML(item.a) + sign + fractionHTML(item.b) + '</div>');
      return;
    }
    if (kind === 'order') {
      const shown = '<div class="g102-line">' + item.values.map(fractionHTML).join('') + '</div>';
      const slots = item.sorted.map((value, index) => {
        const box = answer ? ink(fractionHTML(value)) : '<span class="g102-fbox g102-orderbox"></span>';
        return index === item.sorted.length - 1 ? box : box + opHTML('&lt;');
      }).join('');
      cell.insertAdjacentHTML('beforeend', shown + '<div class="g102-line">' + slots + '</div>');
      return;
    }
    const shown = '<div class="g102-line">' + item.values.map(fractionHTML).join('') + '</div>';
    const part = (text_, value) => '<span class="g102-extreme-part">' + label(text_) + (answer ? ink(fractionHTML(value)) : '<span class="g102-fbox"></span>') + '</span>';
    cell.insertAdjacentHTML('beforeend', shown + '<div class="g102-line">'
      + part('가장 큰 수', item.max) + '<span class="g102-gap"></span>' + part('가장 작은 수', item.min) + '</div>');
  }

  // 수 뒤의 조사 — 읽는 소리의 받침(영·일·삼·육·칠·팔·십·백)에 맞춘다.
  const hasBatchim = n => ['0', '1', '3', '6', '7', '8'].indexOf(String(n).slice(-1)) >= 0;
  const topic = n => (hasBatchim(n) ? '은' : '는');
  const withJosa = n => (hasBatchim(n) ? '과' : '와');
  /** 문항 종류별 줄(템플릿 + 채울 답). */
  function linesOf(item, kind) {
    if (kind === 'relation') {
      const fact = '<span class="g102-fixed">' + item.a + ' × ' + item.b + ' = ' + item.c + '</span>';
      const ask = item.shape === 1 ? item.c + topic(item.c) + ' ' + item.a + '의 ' + LINE + '입니다.'
        : item.shape === 2 ? item.a + topic(item.a) + ' ' + item.c + '의 ' + LINE + '입니다.'
          : item.a + withJosa(item.a) + ' ' + item.b + topic(item.b) + ' ' + item.c + '의 ' + LINE + '입니다.';
      return [
        { tpl: fact },
        { tpl: ask, fill: [item.answer] },
        { tpl: label('(약수 · 배수 중에서)', true) }
      ];
    }
    if (kind === 'find') {
      return [
        { tpl: '<span class="g102-fixed">' + item.a + ' × ' + item.b + ' = ' + item.c + '</span>' },
        { tpl: item.task === 'multiples' ? item.a + '의 배수를 ' + item.c + '까지 모두 쓰세요.'
            : item.c + '의 약수를 모두 쓰세요.' },
        { tpl: WIDE, fill: [item.list.join(', ')] }
      ];
    }
    if (kind === 'reduce-common') {                    // 1-0-2-4-t2 : 공약수로 차례로 나누기
      let chain = fractionHTML(item.from), current = copy(item.from);
      for (const step of item.steps) {
        chain += opHTML('=') + stackHTML(current.n + '÷' + step.by, current.d + '÷' + step.by) + opHTML('=')
          + fractionHTML(step.to);
        current = step.to;
      }
      return [{ tpl: chain + opHTML('=') + SLOT, fill: [fractionHTML(item.to)] }];
    }
    if (kind === 'reduce-simple') {                    // 1-0-2-5-t2 : 기약분수로
      return [{ tpl: fractionHTML(item.from) + opHTML('=') + SLOT, fill: [fractionHTML(item.to)] }];
    }
    if (kind === 'convert-given') {                    // 1-0-2-6-t1 : 공통 분모가 주어짐
      return [
        { tpl: fractionHTML(item.x) + opHTML(',') + fractionHTML(item.y) + opHTML('→')
            + label('공통 분모') + '<span class="g102-fixed">' + item.target + '</span>' },
        { tpl: SLOT + opHTML(',') + SLOT, fill: [fractionHTML(item.xc), fractionHTML(item.yc)] }
      ];
    }
    if (kind === 'convert-found') {                    // 1-0-2-6-t2 : 앞 분수에서 공통 분모를 찾음
      return [{
        tpl: fractionHTML(item.x) + opHTML('=') + fractionHTML(item.xc) + opHTML(',')
          + fractionHTML(item.y) + opHTML('=') + stackHTML(SLOT, SLOT),
        fill: [String(item.yc.n), String(item.target)]
      }];
    }
    if (kind === 'convert-least-given') {              // 1-0-2-7-t1 : 최소공배수가 주어짐
      return [
        { tpl: fractionHTML(item.x) + opHTML(',') + fractionHTML(item.y) + opHTML('→')
            + label('최소공배수') + '<span class="g102-fixed">' + item.target + '</span>' },
        { tpl: SLOT + opHTML(',') + SLOT, fill: [fractionHTML(item.xc), fractionHTML(item.yc)] }
      ];
    }
    // convert-least (1-0-2-7-t2) : 최소공배수를 스스로 찾아 통분
    return [
      { tpl: fractionHTML(item.x) + opHTML(',') + fractionHTML(item.y) },
      { tpl: SLOT + opHTML(',') + SLOT, fill: [fractionHTML(item.xc), fractionHTML(item.yc)] }
    ];
  }

  function renderShort(cell, item, answer, config) {
    css();
    const kind = item.kind || config.gen.kind;
    if (answer && (kind === 'convert-given' || kind === 'convert-least-given' || kind === 'convert-least')) {
      cell.classList.add('g102-tight');
    }
    cell.insertAdjacentHTML('beforeend', linesOf(item, kind).map(line => {
      const body = line.fill ? fillSlots(line.tpl, line.fill, answer) : line.tpl;
      return '<div class="g102-line">' + body + '</div>';
    }).join(''));
  }

  /** 단계별 빈칸 — 개념마다 풀이 모양이 다르다. */
  function stepLines(item, concept, shape) {
    if (concept === '1-0-2-2') {                       // 크기가 같은 분수 만들기
      const base = item.base, full = item.expanded;
      if (shape === 0) return [{ tpl: fractionHTML(base) + opHTML('=') + stackHTML(SLOT, full.d), fill: [String(full.n)] }];
      if (shape === 1) return [{ tpl: fractionHTML(base) + opHTML('=') + stackHTML(String(full.n), SLOT), fill: [String(full.d)] }];
      return [{ tpl: fractionHTML(base) + opHTML('=') + stackHTML(base.n + '×' + SLOT, base.d + '×' + SLOT),
        fill: [String(item.k), String(item.k)] }];
    }
    if (concept === '1-0-2-3') {                       // 약수·배수 목록 완성
      const parts = item.list.map((value, index) => (item.blanks.indexOf(index) >= 0 ? SLOT : String(value)));
      return [
        { tpl: item.target + '의 ' + item.label + '를 작은 것부터 ' + (item.label === '배수' ? item.list.length + '개 ' : '모두 ') + '쓰세요.' },
        { tpl: parts.join(', '), fill: item.blanks.map(index => String(item.list[index])) }
      ];
    }
    if (concept === '1-0-2-4') {                       // 공약수로 차례로 나누기
      const from = item.from;
      const first = item.steps[0];
      const rest = item.steps.slice(1);
      if (shape === 0) {
        // 마지막 단계의 결과만 빈칸으로 둔다(앞 단계 결과를 한 번 더 쓰지 않는다).
        let tpl = fractionHTML(from);
        let current = from;
        for (let i = 0; i < item.steps.length; i++) {
          const step = item.steps[i];
          tpl += opHTML('=') + stackHTML(current.n + '÷' + step.by, current.d + '÷' + step.by) + opHTML('=');
          tpl += i === item.steps.length - 1 ? stackHTML(SLOT, SLOT) : fractionHTML(step.to);
          current = step.to;
        }
        return [{ tpl, fill: [String(current.n), String(current.d)] }];
      }
      return [{
        tpl: fractionHTML(from) + opHTML('=') + stackHTML(from.n + '÷' + SLOT, from.d + '÷' + SLOT) + opHTML('=')
          + fractionHTML(first.to),
        fill: [String(first.by), String(first.by)]
      }];
    }
    if (concept === '1-0-2-5') {                       // 최대공약수로 한 번에
      const from = item.from, to = item.to;
      if (shape === 0) {
        return [{
          tpl: fractionHTML(from) + opHTML('=') + stackHTML(from.n + '÷' + SLOT, from.d + '÷' + SLOT) + opHTML('=')
            + fractionHTML(to),
          fill: [String(item.g), String(item.g)]
        }];
      }
      return [{
        tpl: fractionHTML(from) + opHTML('=') + stackHTML(from.n + '÷' + item.g, from.d + '÷' + item.g) + opHTML('=')
          + stackHTML(SLOT, SLOT),
        fill: [String(to.n), String(to.d)]
      }];
    }
    // 통분 (1-0-2-6 · 1-0-2-7)
    const target = item.target, x = item.x, y = item.y;
    const xTop = String(x.n * (target / x.d)), yTop = String(y.n * (target / y.d));
    if (item.askedLeast) {
      return [
        { tpl: fractionHTML(x) + opHTML(',') + fractionHTML(y) + opHTML('→')
            + label('최소공배수', true) + SLOT, fill: [String(item.least)] },
        { tpl: fractionHTML(x) + opHTML('=') + stackHTML(SLOT, String(target)) + opHTML(',')
            + fractionHTML(y) + opHTML('=') + stackHTML(SLOT, String(target)), fill: [xTop, yTop] }
      ];
    }
    return [
      { tpl: fractionHTML(x) + opHTML(',') + fractionHTML(y) + opHTML('→')
          + label('공통 분모', true) + '<span class="g102-fixed">' + target + '</span>' },
      { tpl: fractionHTML(x) + opHTML('=') + stackHTML(SLOT, String(target)) + opHTML(',')
          + fractionHTML(y) + opHTML('=') + stackHTML(SLOT, String(target)), fill: [xTop, yTop] }
    ];
  }

  function renderSteps(cell, item, answer, config) {
    css();
    const concept = conceptOf(config);
    cell.insertAdjacentHTML('beforeend', stepLines(item, concept, item.shape || 0).map(line => {
      const body = line.fill ? fillSlots(line.tpl, line.fill, answer) : line.tpl;
      return '<div class="g102-line">' + body + '</div>';
    }).join(''));
  }

  function renderSelect(cell, item, answer) {
    css();
    const target = fractionHTML(item.target) + label('와 크기가 같은 분수', true);
    const options = item.options.map((option, index) => {
      const body = fractionHTML(option.f);
      return '<span class="g102-option">' + CIRCLED[index] + ' '
        + (answer && option.ok ? '<span class="g102-circle">' + ink(body) + '</span>' : body) + '</span>';
    }).join('');
    cell.insertAdjacentHTML('beforeend',
      '<div class="g102-line">' + target + '</div><div class="g102-line">' + options + '</div>');
  }

  function renderError(cell, item, answer) {
    css();
    const fixed = fractionHTML(item.x) + opHTML('=') + fractionHTML(item.xc);
    const wrongLine = fractionHTML(item.y) + opHTML('=') + fractionHTML(item.wrong);
    const solved = fractionHTML(item.y) + opHTML('=') + ink(fractionHTML(item.yc)) + opHTML('✓');
    cell.insertAdjacentHTML('beforeend',
      '<div class="g102-line">' + fixed + '</div>'
      + '<div class="g102-line">' + wrongLine + '</div>'
      + '<div class="g102-work' + (answer ? ' g102-solved' : '') + '">'
      + (answer ? '<div class="g102-line">' + solved + '</div>' : '') + '</div>');
  }

  /* ---------------------------------------------------------------- 8. 문항 공급 */
  const cache = new Map();
  const conceptOf = config => (config.gen && config.gen.concept)
    || String(config.typeId || '').slice(0, 8);
  const kindOf = config => (config.gen && config.gen.kind)
    || (entries.find(entry => entry.typeId === config.typeId) || { gen: {} }).gen.kind;
  function hash(value) {
    let h = 2166136261;
    for (const ch of String(value)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  const seedFor = config => ((Number(config.seed) || 1) ^ hash(config.typeId)) >>> 0;

  function stepsFor(concept, seed, count) {
    if (concept === '1-0-2-2') {
      return sameValueItems(seed, count).map((item, index) => Object.assign({}, item, { shape: index % 3 }));
    }
    if (concept === '1-0-2-3') return listStepItems(seed, count);
    if (concept === '1-0-2-4') {
      return commonDivisorItems(seed, count).map((item, index) => Object.assign({}, item, { shape: index % 2 }));
    }
    if (concept === '1-0-2-5') {
      return simplestItems(seed, count).map((item, index) => Object.assign({}, item, { shape: index % 2 }));
    }
    return convertStepItems(concept, seed, count);
  }
  function shortFor(config, concept, seed, count) {
    if (concept === '1-0-2-3') {
      // t1 = 약수·배수 관계 낱말 고르기 · t2 = 곱셈식에서 약수·배수 모두 찾기
      if (String(config.typeId || '').endsWith('t1')) {
        return relationItems(seed, count).map(item => Object.assign({}, item, { kind: 'relation' }));
      }
      return findItems(seed, count).map(item => Object.assign({}, item, { kind: 'find' }));
    }
    if (concept === '1-0-2-4') {
      return simplestItems(seed, count).map(item => Object.assign({}, item, { kind: 'reduce-simple' }));
    }
    if (concept === '1-0-2-5') {
      return simplestItems(seed, count).map(item => Object.assign({}, item, { kind: 'reduce-simple' }));
    }
    // 1-0-2-6 · 1-0-2-7 — t1 은 공통 분모가 주어지고, t2 는 앞 분수의 통분 결과에서 찾는다.
    const first = String(config.typeId || '').endsWith('t1');
    const kind = concept === '1-0-2-7'
      ? (first ? 'convert-least-given' : 'convert-least')
      : (first ? 'convert-given' : 'convert-found');
    return convertItems(concept, seed, count).map(item => Object.assign({}, item, { kind }));
  }
  function buildItems(kind, concept, config, seed, count) {
    switch (kind) {
      case 'sign': return signItems(concept, seed, count);
      case 'order': return orderItems(concept, seed, count, 4);
      case 'extremes': return extremesItems(concept, seed, count, 5);
      case 'match': return matchBundles(concept, seed, count);
      case 'select': return selectItems(seed, count);
      case 'steps': return stepsFor(concept, seed, count);
      case 'short': return shortFor(config, concept, seed, count);
      case 'error': return errorItems(concept, seed, count);
      default: throw Error('알 수 없는 유형: ' + kind);
    }
  }
  /** layout-rules §2 — 0·1이나 아주 작은 분모만 쓰는 지나치게 쉬운 문항은 전체의 10% 이하. */
  function easyItem(item) {
    if (item.values) return item.values.every(f => f.d <= 4);                    // 순서·가장 큰 수
    if (item.sign) return item.a.d <= 4 && item.b.d <= 4;                        // 부등호
    if (item.options) return item.target.d <= 4;                                 // 고르기
    if (item.expanded) return item.base.d <= 4;                                  // 크기가 같은 분수
    if (item.from && item.to) return item.from.d <= 6;                           // 약분
    if (item.x && item.y) return (item.least || lcm(item.x.d, item.y.d)) <= 6;   // 통분
    if (item.c) return item.c <= 6;                                              // 약수·배수
    if (item.list) return item.target <= 6;                                      // 약수·배수 목록
    return false;
  }
  function capEasy(candidates, count) {
    const limit = Math.floor(count * 0.1);
    const chosen = [];
    let easy = 0;
    for (const item of candidates) {
      if (chosen.length >= count) break;
      if (easyItem(item)) { if (easy < limit) { easy++; chosen.push(item); } }
      else chosen.push(item);
    }
    for (const item of candidates) {                    // 쉬운 문항을 안 쓰고도 모자라면 채운다
      if (chosen.length >= count) break;
      if (chosen.indexOf(item) < 0) chosen.push(item);
    }
    return chosen;
  }
  function generate(config) {
    const concept = conceptOf(config), kind = kindOf(config);
    if (!CONCEPTS[concept]) throw Error('묶음 1-0-2 의 개념이 아닙니다: ' + config.typeId);
    const count = config.count || (config.cols * config.rows) || 0;
    const seed = seedFor(config);
    const mark = [concept, kind, seed, count].join('|');
    if (cache.has(mark)) return cache.get(mark);
    // 선 잇기는 묶음 크기가 정해져 있어 늘릴 수 없다. 나머지는 쉬운 문항을 덜어 낼 여유를 둔다.
    const wanted = kind === 'match' ? count : count + Math.ceil(count * 0.25) + 6;
    let candidates;
    try { candidates = buildItems(kind, concept, config, seed, wanted); }
    catch (error) { candidates = buildItems(kind, concept, config, seed, count); }
    const items = kind === 'match' ? candidates : capEasy(candidates, count);
    cache.set(mark, items);
    return items;
  }
  const isOurs = config => !!(config && config.typeId && entries.some(entry => entry.typeId === config.typeId));

  /* ---------------------------------------------------------------- 9. 연결 */
  if (root.SheetGen && typeof root.SheetGen.generate === 'function' && !root.SheetGen.g102) {
    const base = root.SheetGen.generate;
    root.SheetGen.generate = function (config) {
      if (!isOurs(config)) return base.apply(this, arguments);
      return generate(config);
    };
    Object.defineProperty(root.SheetGen, 'g102', { value: true });
  }
  if (root.Sheet && typeof root.Sheet.register === 'function') {
    const install = (format, render) => {
      try { root.Sheet.register(format, render); }
      catch (error) { console.warn('g1-0-2 서식 등록 실패: ' + format, error); }
    };
    install(FMT.compare, (cell, item, answer, config) => renderCompare(cell, item, answer, config));
    install(FMT.short, (cell, item, answer, config) => renderShort(cell, item, answer, config));
    install(FMT.steps, (cell, item, answer, config) => renderSteps(cell, item, answer, config));
    install(FMT.select, (cell, item, answer) => renderSelect(cell, item, answer));
    install(FMT.error, (cell, item, answer) => renderError(cell, item, answer));
  }
  // 선 잇기는 공용 틀(formats-matching.js 의 matching-lines)을 그대로 쓰고 이 묶음 키만 더한다.
  if (root.MatchingSheet && root.MatchingSheet.formats && root.MatchingSheet.formats['matching-lines']) {
    root.MatchingSheet.formats[FMT.match] = {
      page: 'blocks',
      title: '같은 크기 연결하기',
      build: config => { css(); return matchBundles(conceptOf(config), seedFor(config), config.count); },
      render: root.MatchingSheet.formats['matching-lines'].render
    };
  }

  /* ---------------------------------------------------------------- 10. 검수용 자체 확인
     개념 조건·정답·중복·연결쌍을 스스로 다시 계산해 확인한다. */
  const multiplierOf = item => (item.least ? item.target / item.least : 1);
  const asRational = value => value.d === 1 ? String(value.n) : value.n + '/' + value.d;
  function selfTest(seeds) {
    const report = { sheets: 0, items: 0, matchPairs: 0 };
    for (const seed of seeds || [1, 7, 42, 20261001]) {
      for (const entry of entries) {
        const concept = entry.gen.concept, kind = entry.gen.kind;
        const built = generate(Object.assign({}, entry, { seed }));
        const list = kind === 'match' ? built.items.flatMap(bundle => bundle.pairs) : built;
        if (kind !== 'match' && built.length !== entry.count) {
          throw Error(entry.typeId + ': 문항 수 ' + built.length + ' ≠ ' + entry.count);
        }
        if (kind === 'match') {
          if (built.pairs !== entry.count) throw Error(entry.typeId + ': 연결 쌍이 ' + built.pairs + '개입니다.');
          for (const bundle of built.items) {
            if (bundle.order.some((value, index) => value === index)) {
              throw Error(entry.typeId + ': 오른쪽 번호가 왼쪽 번호와 같은 줄이 있습니다.');
            }
          }
        }
        const marks = new Set();
        for (const item of list) {
          const mark = JSON.stringify(item);
          if (marks.has(mark)) throw Error(entry.typeId + ': 같은 문항이 두 번 나왔습니다.');
          marks.add(mark);
          if (kind === 'sign') {
            const expect = eq(item.a, item.b) ? '=' : less(item.a, item.b) ? '<' : '>';
            if (item.sign !== expect) throw Error(entry.typeId + ': 부등호가 틀립니다.');
            if (concept === '1-0-2-0' && item.a.d !== item.b.d) throw Error(entry.typeId + ': 분모가 다릅니다.');
            if (concept === '1-0-2-1' && (item.a.n !== 1 || item.b.n !== 1)) throw Error(entry.typeId + ': 단위분수가 아닙니다.');
            if (concept === '1-0-2-8' && item.a.d === item.b.d) throw Error(entry.typeId + ': 분모가 같습니다.');
          } else if (kind === 'order' || kind === 'extremes') {
            const values = kind === 'order' ? item.sorted : item.values;
            for (let i = 1; i < values.length && kind === 'order'; i++) {
              if (!less(values[i - 1], values[i])) throw Error(entry.typeId + ': 오름차순이 아닙니다.');
            }
            if (new Set(values.map(key)).size !== values.length) throw Error(entry.typeId + ': 값이 겹칩니다.');
            if (concept === '1-0-2-0' && values.some(f => f.d !== values[0].d)) throw Error(entry.typeId + ': 분모가 같지 않습니다.');
            if (concept === '1-0-2-1' && values.some(f => f.n !== 1)) throw Error(entry.typeId + ': 단위분수가 아닙니다.');
            if (concept === '1-0-2-8' && new Set(values.map(f => f.d)).size !== values.length) {
              throw Error(entry.typeId + ': 분모가 겹칩니다.');
            }
            if (kind === 'extremes') {
              const sorted = item.values.slice().sort((x, y) => (less(x, y) ? -1 : 1));
              if (!eq(item.max, sorted[sorted.length - 1]) || !eq(item.min, sorted[0])) {
                throw Error(entry.typeId + ': 가장 큰·작은 수가 틀립니다.');
              }
            }
          } else if (kind === 'short' && item.kind === 'relation') {
            if (item.a * item.b !== item.c) throw Error(entry.typeId + ': 곱셈식이 틀립니다.');
            if (item.answer !== (item.shape === 1 ? '배수' : '약수')) throw Error(entry.typeId + ': 관계 낱말이 틀립니다.');
            if (item.c % item.a) throw Error(entry.typeId + ': a 는 c 의 약수가 아닙니다.');
            if (item.shape === 1 && item.c / item.a !== item.b) throw Error(entry.typeId + ': 배수 관계가 틀립니다.');
          } else if (kind === 'short' && item.kind === 'reduce-common') {
            let current = item.from;
            for (const step of item.steps) {
              if (step.by < 2 || current.n % step.by || current.d % step.by) throw Error(entry.typeId + ': 공약수가 아닙니다.');
              if (step.to.n !== current.n / step.by || step.to.d !== current.d / step.by) {
                throw Error(entry.typeId + ': 약분 결과가 틀립니다.');
              }
              current = step.to;
            }
            if (!eq(current, item.from) || !eq(item.to, current)) throw Error(entry.typeId + ': 약분 값이 달라집니다.');
          } else if (kind === 'short' && item.kind === 'reduce-simple') {
            if (!eq(item.from, item.to) || gcd(item.to.n, item.to.d) !== 1) throw Error(entry.typeId + ': 기약분수가 아닙니다.');
          } else if (kind === 'short' && item.kind === 'find') {
            if (item.a * item.b !== item.c) throw Error(entry.typeId + ': 곱셈식이 틀립니다.');
            const expected = item.task === 'multiples'
              ? Array.from({ length: item.b }, (unused, index) => item.a * (index + 1))
              : divisorsOf(item.c);
            if (item.list.join(',') !== expected.join(',')) throw Error(entry.typeId + ': 약수·배수 목록이 틀립니다.');
          } else if (kind === 'steps' && item.base && item.expanded) {
            if (item.expanded.d % item.base.d || item.expanded.n !== item.base.n * item.k) {
              throw Error(entry.typeId + ': 크기가 같은 분수가 아닙니다.');
            }
          } else if (kind === 'steps' && item.steps) {
            if (!eq(item.steps[item.steps.length - 1].to, item.to)) throw Error(entry.typeId + ': 마지막 약분 값이 틀립니다.');
          } else if (kind === 'steps' && item.g && item.from && item.to) {
            if (!eq(item.from, item.to) || gcd(item.to.n, item.to.d) !== 1) throw Error(entry.typeId + ': 기약분수가 아닙니다.');
          } else if (kind === 'steps' && item.list) {
            const expect = item.label === '약수'
              ? divisorsOf(item.target).join(',') : item.list.map((unused, index) => item.target * (index + 1)).join(',');
            if (item.list.join(',') !== expect) throw Error(entry.typeId + ': 목록이 틀립니다.');
          } else if (kind === 'steps' && item.x && item.target) {
            const least = lcm(item.x.d, item.y.d);
            if (item.target % item.x.d || item.target % item.y.d) throw Error(entry.typeId + ': 공통 분모가 아닙니다.');
            if (concept === '1-0-2-7' && item.target !== least) throw Error(entry.typeId + ': 최소공배수가 아닙니다.');
            if (concept === '1-0-2-6' && item.target % least) throw Error(entry.typeId + ': 공배수가 아닙니다.');
          } else if (item.x && item.target && (kind === 'short' || kind === 'error')) {
            const least = lcm(item.x.d, item.y.d);
            if (item.target % item.x.d || item.target % item.y.d) throw Error(entry.typeId + ': 공통 분모가 아닙니다.');
            if (concept === '1-0-2-7' && item.target !== least) throw Error(entry.typeId + ': 최소공배수가 아닙니다.');
            if (concept === '1-0-2-6' && item.target % least) throw Error(entry.typeId + ': 공배수가 아닙니다.');
            const xc = { n: item.x.n * (item.target / item.x.d), d: item.target };
            const yc = { n: item.y.n * (item.target / item.y.d), d: item.target };
            if (!eq(xc, item.x) || !eq(yc, item.y)) throw Error(entry.typeId + ': 통분 값이 원래 분수와 다릅니다.');
            if (item.xc && (!eq(item.xc, xc) || !eq(item.yc, yc))) throw Error(entry.typeId + ': 통분 답이 틀립니다.');
            if (kind === 'error') {
              if (text(item.wrong) === text(yc)) throw Error(entry.typeId + ': 틀린 모양이 정답과 같습니다.');
              const isCommon = item.wrong.d % item.x.d === 0 && item.wrong.d % item.y.d === 0;
              if (item.errorKind === 'numOnly' && item.wrong.d !== item.target) {
                throw Error(entry.typeId + ': 분자만 틀린 것이 아닙니다.');
              }
              if (item.errorKind === 'badDen' && isCommon) {
                throw Error(entry.typeId + ': 잘못 쓴 분모가 공배수입니다.');
              }
              if (item.errorKind === 'notLeast' && (!isCommon || item.wrong.d === item.target)) {
                throw Error(entry.typeId + ': 최소공배수가 아닌 공배수를 쓰지 않았습니다.');
              }
            }
          } else if (kind === 'select') {
            if (item.options.length !== 4) throw Error(entry.typeId + ': 선택지가 4개가 아닙니다.');
            const yes = item.options.filter(option => option.ok);
            if (yes.length < 1 || yes.length > 2) throw Error(entry.typeId + ': 정답 선택지가 ' + yes.length + '개입니다.');
            if (yes.some(option => !eq(option.f, item.target))) throw Error(entry.typeId + ': 정답 선택지의 크기가 다릅니다.');
            if (item.options.filter(option => !option.ok).some(option => eq(option.f, item.target))) {
              throw Error(entry.typeId + ': 오답 선택지가 정답과 크기가 같습니다.');
            }
          }
          if (kind === 'match') {
            const left = parseHTMLFraction(item[0].html), right = parseHTMLFraction(item[1].html);
            if (!left || !right || !eq(left, right)) throw Error(entry.typeId + ': 연결쌍의 크기가 다릅니다.');
          }
        }
        if (kind === 'match') report.matchPairs += built.pairs;
        report.sheets++;
        report.items += kind === 'match' ? built.pairs : list.length;
      }
    }
    return report;
  }
  function parseHTMLFraction(html) {
    const parts = String(html).replace(/<[^>]*>/g, ' ').trim().split(/\s+/);
    return parts.length === 1 ? parseFraction(parts[0]) : parseFraction(parts[0] + '/' + parts[1]);
  }
  root.G102Sheet = {
    concepts: CONCEPTS, entries, formats: FMT, generate, selfTest,
    parseFraction: parseHTMLFraction, asRational
  };
})(globalThis);
