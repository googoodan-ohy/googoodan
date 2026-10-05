/* =============================================================================
   묶음 1-0-1 — 분수의 종류와 변환 (개념 4개 × 유형 3~4개 = typeId 14개)
   개념: 1-0-1-0 진분수·가분수·대분수 구분
         1-0-1-1 가분수를 대분수로 바꾸기
         1-0-1-2 대분수를 가분수로 바꾸기
         1-0-1-3 자연수를 분수로 나타내기
   유형: -t1 … -t4 (명세 spec/spec-fraction.json 의 같은 typeId)

   규칙(AGENTS.md · layout-rules.md)
   · 문제는 기존 생성기에서만 뽑는다 — src/bank/legacy/types.js 의 Worksheets.generate
     (fraction-add-* 의 두 항)와 src/ko-concept-layout/original-overrides/ko/drill-engine.js 의
     DrillEngine.skill('improper'|'mixed'). 새 문제 엔진을 만들지 않는다.
   · 개념 이름이 말하는 조건(분수의 종류 · 분모 2~12 · 자연수 1~9 · 기약 상태)에 맞지 않는
     문항은 걸러 내고, 모자라면 seed 를 바꾸어 더 뽑는다. 중복 문항 금지.
   · 정답은 이 파일의 정수 연산(몫·나머지·곱)으로만 계산한다 — 부동소수 오차 없음.
   · 서식 키는 이 묶음 전용 g101-* 이다. 공용 파일(sheet.js, formats-*.js 등)은 고치지 않는다.
   · 같은 typeId · 같은 seed 면 언제나 같은 문제가 나온다.
   · 한 장 = 한 유형. 가로셈·세로셈을 섞지 않는다(이 묶음은 모두 가로 한 줄짜리 변환이다).
============================================================================= */
(function (root) {
  'use strict';

  /* ---------------------------------------------------------------- 1. 서식 키
     sheet.js 의 최소 칸 높이는 서식 이름 문자열로 정해진다(minimumCellMm).
       g101-fraction-picture          → 38mm (그림)
       g101-fraction-error-correction → 52mm (고쳐 쓰기)
       g101-fraction-steps            → 20mm (단계별 빈칸)
       나머지 g101-fraction-*          → 14mm
     선 잇기 두 서식은 MatchingSheet 로 그려서 자동 맞춤(autoFit)을 쓰지 않는다. */
  const FMT = {
    classify: 'g101-fraction-select',
    typeMatch: 'g101-fraction-type-match',
    pick: 'g101-fraction-pick',
    picture: 'g101-fraction-picture',
    answer: 'g101-fraction-answer',
    steps: 'g101-fraction-steps',
    pair: 'g101-fraction-match',
    errors: 'g101-fraction-error-correction'
  };

  /* ---------------------------------------------------------------- 2. 유형 정의
     문항 수는 layout-rules §2 의 최소 기준에서 시작한다.
       분수 변환 3단×14줄=42 · 선 잇기 한 묶음 6쌍×3묶음=18 · 그림 3단×5줄=15 ·
       분수 단계별 빈칸 2단×10줄=20 · 잘못된 계산 고치기 3단×4줄=12
     종이가 남으면 sheet.js 의 autoFit 이 줄을 늘린다.
     fontPt 는 §2 의 '선행 학습 15~16pt'를 기본으로 한다. 한 칸에 식이 두 줄 이상 들어가거나
     (단계별 빈칸·몫과 나머지) 보기 세 개가 한 줄에 들어가 폭이 빠듯한 유형(1-0-1-0-t3)은
     12~13pt 로 낮춘다. 그림·분류처럼 한 줄만 들어가는 유형은 15pt 를 지킨다. */
  const TYPES = [
    { typeId: '1-0-1-0-t1', title: '분수를 종류별로 분류하기', roadmapTitle: '분수를 종류별로 분류하기', format: FMT.classify,
      cols: 3, rows: 8, autoFit: false, maxProblems: 24, fontPt: 17, kind: 'classify',
      instruction: '조건에 맞는 것을 골라 표시하세요.' },
    { typeId: '1-0-1-0-t2', title: '분수의 종류 연결하기', roadmapTitle: '그림과 진분수·가분수·대분수 연결하기', format: FMT.typeMatch,
      cols: 3, rows: 6, fontPt: 16, kind: 'typeMatch',
      instruction: '그림과 분수를 보고 종류가 같은 것끼리 선으로 이으세요.' },
    { typeId: '1-0-1-0-t3', title: '조건에 맞는 분수 고르기', roadmapTitle: '조건에 맞는 분수 골라 쓰기', format: FMT.pick,
      cols: 3, rows: 8, autoFit: false, maxProblems: 24, fontPt: 14, kind: 'pick',
      instruction: '물음에 알맞은 답을 쓰세요.' },

    { typeId: '1-0-1-1-t1', title: '그림으로 대분수 나타내기', roadmapTitle: '분수 그림을 묶어 대분수로 나타내기', format: FMT.picture,
      cols: 3, rows: 5, fontPt: 15, kind: 'pictureImproper',
      instruction: '그림을 보고 대분수로 나타내세요.' },
    { typeId: '1-0-1-1-t2', title: '가분수를 대분수로 바꾸기', roadmapTitle: '몫·나머지를 이용해 대분수로 바꾸기', format: FMT.answer,
      cols: 3, rows: 8, autoFit: false, maxProblems: 24, fontPt: 13, kind: 'quotient',
      instruction: '몫과 나머지를 구한 뒤 대분수로 나타내세요.' },
    { typeId: '1-0-1-1-t3', title: '가분수와 대분수 연결하기', roadmapTitle: '가분수와 같은 대분수 연결하기', format: FMT.pair,
      cols: 6, rows: 4, autoFit: false, maxProblems: 24, fontPt: 12, kind: 'pairToMixed',
      instruction: '서로 알맞은 것끼리 선으로 이으세요.' },
    { typeId: '1-0-1-1-t4', title: '잘못 바꾼 대분수 고치기', roadmapTitle: '잘못 바꾼 대분수 고치기', format: FMT.errors,
      cols: 3, rows: 4, fontPt: 14, kind: 'errorFix',
      instruction: '잘못 바꾼 곳을 찾아 바르게 고쳐 쓰세요.' },

    { typeId: '1-0-1-2-t1', title: '그림으로 가분수 나타내기', roadmapTitle: '그림에서 단위분수 개수 세기', format: FMT.picture,
      cols: 3, rows: 5, fontPt: 15, kind: 'pictureCount',
      instruction: '그림을 보고 가분수로 나타내세요.' },
    { typeId: '1-0-1-2-t2', title: '가분수로 고쳐 나타내기', roadmapTitle: '자연수 부분을 바꾸어 가분수 완성하기', format: FMT.steps,
      cols: 2, rows: 8, fontPt: 17, kind: 'stepsWholePart',
      instruction: '빈칸에 알맞은 수를 써서 풀이를 완성하세요.' },
    { typeId: '1-0-1-2-t3', title: '대분수와 가분수 연결하기', roadmapTitle: '대분수와 같은 가분수 연결하기', format: FMT.pair,
      cols: 6, rows: 4, autoFit: false, maxProblems: 24, fontPt: 12, kind: 'pairToImproper',
      instruction: '서로 알맞은 것끼리 선으로 이으세요.' },
    { typeId: '1-0-1-2-t4', title: '변환 과정의 빈칸 채우기', roadmapTitle: '변환 과정의 빈칸 채우기', format: FMT.steps,
      cols: 2, rows: 8, fontPt: 17, kind: 'stepsProcess',
      instruction: '빈칸에 알맞은 수를 써서 풀이를 완성하세요.' },

    { typeId: '1-0-1-3-t1', title: '자연수를 분수로 나타내기', roadmapTitle: '주어진 분모로 자연수 나타내기', format: FMT.answer,
      cols: 3, rows: 14, fontPt: 18, kind: 'wholeFraction',
      instruction: '물음에 알맞은 답을 쓰세요.' },
    { typeId: '1-0-1-3-t2', title: '그림과 분수 연결하기', roadmapTitle: '그림과 자연수·분수 연결하기', format: FMT.pair,
      cols: 6, rows: 4, autoFit: false, maxProblems: 24, fontPt: 12, kind: 'pairWhole',
      instruction: '그림이 나타내는 자연수와 같은 분수를 찾아 이으세요.' },
    { typeId: '1-0-1-3-t3', title: '자연수와 같은 분수 만들기', roadmapTitle: '자연수와 같은 분수의 빈칸 채우기', format: FMT.steps,
      cols: 2, rows: 8, fontPt: 17, kind: 'stepsWhole',
      instruction: '빈칸에 알맞은 수를 써서 풀이를 완성하세요.' }
  ];
  const CONCEPT_OF = typeId => String(typeId).replace(/-t\d+$/, '');

  /* ---------------------------------------------------------------- 3. 분수 도구 */
  const GCD = (a, b) => (b ? GCD(b, a % b) : Math.abs(a) || 1);

  /** '2 3/5' · '7/4' · '3' → {whole,num,den,n,d,form,text} (n/d = 가분수로 쓴 값) */
  function parts(text) {
    const s = String(text).trim();
    let m = s.match(/^(\d+)\s+(\d+)\/(\d+)$/);
    if (m) {
      const whole = +m[1], num = +m[2], den = +m[3];
      return { whole, num, den, n: whole * den + num, d: den, form: 'mixed', text: s };
    }
    m = s.match(/^(\d+)\/(\d+)$/);
    if (m) {
      const num = +m[1], den = +m[2];
      return { whole: 0, num, den, n: num, d: den, form: num >= den ? 'improper' : 'proper', text: s };
    }
    return { whole: +s, num: 0, den: 1, n: +s, d: 1, form: 'whole', text: s };
  }
  /** 기약분수 · 대분수 표기 (공용 분수 서식과 같은 규칙) */
  function display(n, d) {
    const g = GCD(n, d), num = n / g, den = d / g;
    if (den === 1) return String(num);
    const whole = Math.trunc(num / den), rest = num % den;
    return whole ? whole + ' ' + rest + '/' + den : num + '/' + den;
  }
  /* 명세(spec-fraction.json)의 수 범위 — 분모 2~12, 자연수 부분 1~9, 가분수는 10×분모-1 이하 */
  function inRange(f) {
    if (f.den < 2 || f.den > 12) return false;
    if (f.form === 'proper') return f.num >= 1 && f.num < f.den;
    if (f.form === 'improper') return f.whole === 0 && f.num >= f.den && f.num <= 10 * f.den - 1;
    if (f.form === 'mixed') return f.whole >= 1 && f.whole <= 9 && f.num >= 1 && f.num < f.den;
    return false;
  }
  const isLowest = f => GCD(f.num, f.den) === 1;
  const usable = f => inRange(f) && isLowest(f);       // 보여 주는 분수는 항상 기약 상태
  const wholeOf = f => Math.floor(f.n / f.d);          // 가분수의 자연수 부분
  const restOf = f => f.n % f.d;                       // 가분수의 나머지(진분수 부분의 분자)

  const TYPE_NAMES = ['진분수', '가분수', '대분수'];
  const NAME_OF = { proper: '진분수', improper: '가분수', mixed: '대분수' };
  const KINDS = ['proper', 'improper', 'mixed'];

  /* ---------------------------------------------------------------- 4. 기존 생성기에서 수 뽑기
     Worksheets.generate 가 만들 수 있는 분수 짝 — 두 항 모두 분모 2~12, 자연수 1~9 범위다. */
  const PAIR_SOURCES = [
    'fraction-add-whole-proper', 'fraction-add-whole-improper', 'fraction-add-whole-mixed',
    'fraction-add-proper-whole', 'fraction-add-proper-improper', 'fraction-add-proper-mixed',
    'fraction-add-improper-whole', 'fraction-add-improper-proper', 'fraction-add-improper-mixed',
    'fraction-add-improper-improper', 'fraction-add-mixed-whole', 'fraction-add-mixed-proper',
    'fraction-add-mixed-improper', 'fraction-add-mixed-mixed'
  ];
  const poolCache = new Map();
  /** kinds(진분수 proper / 가분수 improper / 대분수 mixed)에 맞는 기약 분수를 모은다. */
  function valuePool(seed, kinds) {
    const key = seed + '|' + kinds.join(',');
    if (poolCache.has(key)) return poolCache.get(key);
    if (!root.Worksheets || typeof root.Worksheets.generate !== 'function') {
      throw Error('기존 Worksheets 생성기를 찾지 못했습니다.');
    }
    const want = new Set(kinds), out = [], seen = new Set();
    for (let batch = 0; batch < 420 && out.length < 1600; batch++) {
      const id = PAIR_SOURCES[batch % PAIR_SOURCES.length];
      let rows;
      try { rows = root.Worksheets.generate(id, (seed + Math.imul(batch + 1, 2654435761)) >>> 0, 12); }
      catch (error) { continue; }
      for (const row of rows) for (const text of [row.a, row.b]) {
        const f = parts(text);
        if (!want.has(f.form) || !usable(f)) continue;
        if (seen.has(f.text)) continue;
        seen.add(f.text); out.push(f);
      }
    }
    if (!out.length) throw Error('기존 생성기에서 분수를 얻지 못했습니다: ' + kinds.join(','));
    poolCache.set(key, out);
    return out;
  }
  /** drill-engine 의 skill 이 만드는 값 — 명세가 지정한 생성기(improper · mixed)를 그대로 쓴다. */
  function skillValues(skill, seed, rounds) {
    if (!root.DrillEngine || typeof root.DrillEngine.skill !== 'function') return [];
    let rnd;
    try { rnd = root.DrillEngine.random(seed >>> 0); } catch (error) { return []; }
    const out = [], seen = new Set();
    for (let i = 0; i < rounds; i++) {
      let q;
      try { q = root.DrillEngine.skill(skill, rnd); } catch (error) { break; }
      const f = skillToFraction(skill, q);
      if (!f || !usable(f) || seen.has(f.text)) continue;
      seen.add(f.text); out.push(f);
    }
    return out;
  }
  function skillToFraction(skill, q) {
    const prompt = String((q && q.prompt) || '');
    if (skill === 'improper') {
      const m = prompt.match(/^(\d+)\/(\d+)/);
      return m ? parts(m[1] + '/' + m[2]) : null;
    }
    if (skill === 'mixed') {
      const m = prompt.match(/^(\d+)과\s+(\d+)\/(\d+)/);
      return m ? parts(m[1] + ' ' + m[2] + '/' + m[3]) : null;
    }
    return null;
  }
  /** 기존 생성기 두 곳을 합친다(명세가 지정한 skill 먼저, 나머지를 Worksheets 로 채운다). */
  function fractionSource(seed, kinds, skill) {
    const out = skill ? skillValues(skill, seed, 900) : [];
    for (const f of valuePool(seed, kinds)) out.push(f);
    return out;
  }

  /** 자연수(1~9)와 분모(2~12) 짝 — 기존 생성기 fraction-add-whole-proper 의 두 항에서 그대로 얻는다. */
  function wholePairs(seed) {
    const out = [], seen = new Set();
    for (let batch = 0; batch < 400 && out.length < 400; batch++) {
      let rows;
      try {
        rows = root.Worksheets.generate('fraction-add-whole-proper',
          (seed + Math.imul(batch + 1, 2654435761)) >>> 0, 24);
      } catch (error) { continue; }
      for (const row of rows) {
        const whole = parts(row.a), den = parts(row.b);
        if (whole.form !== 'whole' || whole.whole < 1 || whole.whole > 9) continue;
        if (den.form !== 'proper' || !usable(den)) continue;
        const key = whole.whole + '/' + den.den;
        if (seen.has(key)) continue;
        seen.add(key); out.push({ whole: whole.whole, den: den.den });
      }
    }
    if (!out.length) throw Error('기존 생성기에서 자연수·분모 짝을 얻지 못했습니다.');
    return out;
  }

  /* ---------------------------------------------------------------- 5. 고르기 */
  /** 쉬운 문항 판정 — layout-rules §2: 0·1이 들어간 쉬운 문제는 전체의 10% 이하.
      분수에서는 단위분수(분자가 1)를 쉬운 문항으로 본다. 자연수 부분 1까지 쉬움으로 묶으면
      대분수(1 2/3 같은)가 거의 다 걸러져 '세 종류 구분' 유형이 진분수만으로 채워진다. */
  const easyFraction = f => f.num === 1;
  const bySize = (x, y) => (x.den - y.den) || (x.n - y.n) || (x.text < y.text ? -1 : x.text > y.text ? 1 : 0);

  /** 난이도 순으로 세운 뒤 중복을 빼고 count 개를 고른다. 쉬운 문항은 10%까지만. */
  function take(pool, count, keyOf, easyOf, sortOf) {
    const pick = (cap) => {
      const out = [], seen = new Set();
      const easyLimit = cap ? Math.floor(count * 0.1) : Infinity;
      let easy = 0;
      for (const item of pool) {
        const key = keyOf(item);
        if (seen.has(key)) continue;
        const isEasy = easyOf ? easyOf(item) : false;
        if (isEasy && easy >= easyLimit) continue;
        seen.add(key); if (isEasy) easy++;
        out.push(item);
        if (out.length === count) break;
      }
      return out;
    };
    let out = pick(true);
    if (out.length < count) out = pick(false);       // 쉬움 제한 때문에 모자라면 제한을 푼다
    if (out.length !== count) {
      throw Error('조건에 맞는 고유 문항 ' + count + '개 중 ' + out.length + '개만 만들었습니다.');
    }
    return out.sort(sortOf || bySize);
  }

  /** 같은 seed 로 같은 순서를 만드는 섞기(공용 렌더러의 order 자리에 쓴다). */
  function shuffle(list, seed) {
    const out = list.slice();
    let s = (seed >>> 0) || 1;
    const next = () => {
      s += 0x6d2b79f5;
      let t = s;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(next() * (i + 1));
      const tmp = out[i]; out[i] = out[j]; out[j] = tmp;
    }
    return out;
  }
  /** keyOf 로 묶음을 만들어 돌아가며 늘어놓는다. pool 앞에서 그냥 잘라 쓰면 분모가 2·3 에 몰린다
      (묶음 1-2-1 검수 지적). 뽑을 때만 퍼뜨리고, 문제지 순서는 take() 가 다시 쉬운 순으로 세운다.
      items 는 이미 쉬운 순서로 정렬해 둔 목록이어야 한다. */
  function spread(items, keyOf) {
    const buckets = new Map();
    for (const item of items) {
      const key = keyOf(item);
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key).push(item);
    }
    const out = [];
    for (let round = 0; out.length < items.length; round++) {
      let added = false;
      for (const list of buckets.values()) if (list[round]) { out.push(list[round]); added = true; }
      if (!added) break;
    }
    return out;
  }
  /** seed 로 섞기 — 크기순으로 앞에서 자르면 seed 를 바꿔도 같은 문항만 나온다. */
  const mix = (list, seed) => shuffle(list, seed ^ 0x5bd1e995);
  /** 분모로 퍼뜨린 목록 — 유형마다 분모가 한쪽에 몰리지 않게 쓴다. */
  const spreadByDen = items => spread(items, f => f.den);
  /** 분수 종류 × 분모로 퍼뜨린 목록 — 세 종류가 모두 나오면서 분모도 고르게 섞이게 한다.
      (분모로만 퍼뜨리면 진분수가 작은 분자부터 채워져 한 장이 진분수만으로 채워진다.) */
  const spreadByKindDen = items => spread(items, f => f.form + '#' + f.den);

  /** 선 잇기의 오른쪽 순서 — 같은 줄에 제자리로 놓이면 선을 긋지 않아도 답이 보인다. */
  function derange(order) {
    const out = order.slice();
    for (let i = 0; i < out.length; i++) {
      if (out[i] !== i || out.length < 2) continue;
      const j = (i + 1) % out.length;          // 순열이라 out[j] ≠ i 이므로 새 제자리가 생기지 않는다
      const tmp = out[i]; out[i] = out[j]; out[j] = tmp;
    }
    return out;
  }

  /* ---------------------------------------------------------------- 6. 개념별 문항 만들기 */

  /* 1-0-1-0-t1 — 분수를 종류별로 분류하기 */
  function itemsClassify(seed, count) {
    const pool = spreadByKindDen(mix(valuePool(seed, KINDS).slice(), seed));
    return take(pool, count, f => f.text, easyFraction, bySize).map(f => ({
      kind: 'classify', text: f.text, form: f.form,
      options: TYPE_NAMES.slice(), mask: TYPE_NAMES.indexOf(NAME_OF[f.form])
    }));
  }

  /* 1-0-1-0-t2 — 그림과 진분수·가분수·대분수 연결하기 (그림+분수 ↔ 종류 이름)
     종류가 3가지뿐이라 한 그림이 여러 줄에 걸친 종류 상자 하나로 이어진다(묶음마다 진2·가2·대2).
     선 잇기 한 줄(14mm)에 들어가도록 분모 6 이하, 자연수 부분 4 이하만 쓴다. */
  const PIC_WHOLE_MAX = 4, PIC_DEN_MAX = 6;
  function picPossible(f) {
    if (f.den > PIC_DEN_MAX) return false;
    if (f.form === 'proper') return true;
    return wholeOf(f) >= 1 && wholeOf(f) <= PIC_WHOLE_MAX;
  }
  function itemsTypeMatch(seed, count) {
    const bundles = 3, per = count / bundles, perKind = per / 3;
    const source = spreadByKindDen(mix(valuePool(seed, KINDS).filter(picPossible), seed));
    const build = (cap) => {
      const used = new Set(), items = [];
      let easyBudget = cap ? Math.floor(count * 0.1) : Infinity;
      for (let b = 0; b < bundles; b++) {
        const picked = [];
        for (const kind of KINDS) {
          let added = 0;
          for (const f of source) {
            if (added >= perKind) break;
            if (f.form !== kind || used.has(f.text)) continue;
            const easy = easyFraction(f);
            if (easy && easyBudget <= 0) continue;                  // 쉬운 문항은 한 장의 10%까지만
            // 값이 같은 그림이 한 묶음에 두 번 나오면 어느 것인지 가릴 수 없다.
            if (picked.some(other => other.n * f.d === f.n * other.d)) continue;
            used.add(f.text); picked.push(f); added++;
            if (easy) easyBudget--;
          }
          if (added !== perKind) return null;
        }
        const pictures = shuffle(picked, seed ^ (b * 104729 + 17));
        items.push({
          kind: 'bundle', caption: '', rowsWeight: per, categories: TYPE_NAMES.slice(), pictures,
          order: pictures.map(f => TYPE_NAMES.indexOf(NAME_OF[f.form]))
        });
      }
      return items;
    };
    const items = build(true) || build(false);        // 쉬움 제한 때문에 모자라면 제한을 푼다
    if (!items) throw Error('종류 연결하기 그림 ' + count + '개를 만들지 못했습니다.');
    return { items, layout: { cols: bundles, rows: per, count }, pairs: count };
  }

  /* 1-0-1-0-t3 — 조건에 맞는 분수 골라 쓰기 (보기 3개 중 조건에 맞는 것 하나)
     한 줄에 보기 세 개가 들어가므로 분모 9 이하만 쓴다(분류·연결은 범위 제한 없음). */
  function pickPossible(f) { return f.den <= 9; }
  function itemsPick(seed, count) {
    const source = spreadByKindDen(mix(valuePool(seed, KINDS).filter(pickPossible), seed));
    const byKind = { proper: [], improper: [], mixed: [] };
    for (const f of source) byKind[f.form].push(f);
    const cursor = { proper: 0, improper: 0, mixed: 0 }, used = new Set(), all = [];
    for (let i = 0; i < source.length * 6; i++) {
      const kind = KINDS[i % KINDS.length];
      const target = byKind[kind][cursor[kind] % byKind[kind].length]; cursor[kind]++;
      const others = [];
      for (const other of KINDS) {
        if (other === kind) continue;
        others.push(byKind[other][(i * 7 + others.length * 11 + 3) % byKind[other].length]);
      }
      const candidates = shuffle([target, others[0], others[1]], seed ^ (i * 2654435761 + 5));
      const key = candidates.map(f => f.text).join('|');
      if (used.has(key)) continue;
      used.add(key);
      all.push({
        kind: 'pick', form: kind, name: NAME_OF[kind], candidates: candidates.map(f => f.text),
        answerText: target.text, n: target.n, den: target.den, easy: easyFraction(target)
      });
    }
    // 쉬운 문항 10% 제한 — 조건 때문에 모자라면 제한을 푼다(take 와 같은 방식).
    const select = (cap) => {
      const out = [];
      const easyLimit = cap ? Math.floor(count * 0.1) : Infinity;
      let easy = 0;
      for (const item of all) {
        if (item.easy && easy >= easyLimit) continue;
        if (item.easy) easy++;
        out.push(item);
        if (out.length === count) break;
      }
      return out;
    };
    let out = select(true);
    if (out.length < count) out = select(false);
    if (out.length !== count) {
      throw Error('조건에 맞는 분수 골라 쓰기 ' + count + '개 중 ' + out.length + '개만 만들었습니다.');
    }
    return out.sort(bySize);
  }

  /* 그림 서식이 쓸 수 있는 값 — 분모 9 이하, 자연수 부분 4 이하 */
  function pictureGuard(f) {
    if (f.form !== 'improper' && f.form !== 'mixed') return false;
    return f.den <= 9 && wholeOf(f) >= 1 && wholeOf(f) <= PIC_WHOLE_MAX;
  }

  /* 1-0-1-1-t1 — 분수 그림을 묶어 대분수로 나타내기 (가분수 그림 → 대분수) */
  function itemsPictureImproper(seed, count) {
    const pool = spreadByDen(mix(fractionSource(seed, ['improper'], 'improper').filter(pictureGuard), seed));
    return take(pool, count, f => f.text, easyFraction, bySize).map(f => ({
      kind: 'picture', whole: wholeOf(f), num: restOf(f), den: f.d,
      answerText: display(f.n, f.d), n: f.n, d: f.d
    }));
  }

  /* 1-0-1-2-t1 — 그림에서 단위분수 개수 세기 (대분수 그림 → 가분수) */
  function itemsPictureCount(seed, count) {
    const pool = spreadByDen(mix(fractionSource(seed, ['mixed'], 'mixed').filter(pictureGuard), seed));
    return take(pool, count, f => f.text, easyFraction, bySize).map(f => ({
      kind: 'pictureCount', whole: f.whole, num: f.num, den: f.den,
      answerText: String(f.n), n: f.n, d: f.den
    }));
  }

  /* 1-0-1-1-t2 — 몫·나머지를 이용해 대분수로 바꾸기 */
  function itemsQuotient(seed, count) {
    const pool = spreadByDen(mix(fractionSource(seed, ['improper'], 'improper').filter(f => wholeOf(f) <= 9), seed));
    return take(pool, count, f => f.text, easyFraction, bySize).map(f => ({
      kind: 'quotient', n: f.n, d: f.d, quotient: wholeOf(f), rest: restOf(f),
      answerText: display(f.n, f.d)
    }));
  }

  /* 1-0-1-1-t3 · 1-0-1-2-t3 — 가분수 ↔ 대분수 연결하기 */
  function pairItems(seed, count, kind) {
    const pool = spreadByDen(mix(fractionSource(seed, ['improper'], 'improper').filter(f => wholeOf(f) <= 9), seed));
    const picked = take(pool, count, f => f.text, easyFraction, bySize);
    const bundles = count % 4 === 0 ? count / 4 : 3, per = count / bundles;   // 세트당 4문제(2단 배치로 아래까지 채움)
    const items = [];
    for (let b = 0; b < bundles; b++) {
      const chunk = picked.slice(b * per, (b + 1) * per);
      items.push({
        kind: 'bundle', caption: '', rowsWeight: per,
        pairs: chunk.map(f => (kind === 'pairToMixed'
          ? [{ html: fracHTML(f.text) }, { html: fracHTML(display(f.n, f.d)) }]
          : [{ html: fracHTML(display(f.n, f.d)) }, { html: fracHTML(f.text) }])),
        order: derange(shuffle(chunk.map((unused, index) => index), seed ^ (b * 2654435761 + 7)))
      });
    }
    return { items, layout: { cols: bundles, rows: per, count }, pairs: count };
  }

  /* 1-0-1-1-t4 — 잘못 바꾼 대분수 고치기 */
  const ERROR_NOTES = {
    swap: '몫과 나머지를 바꾸어 씀',
    rawNumerator: '나머지를 구하지 않고 분자를 그대로 씀',
    wholeOnly: '나머지를 분수로 나타내지 않음'
  };
  function errorFits(kind, f) {
    if (kind === 'swap') return wholeOf(f) !== restOf(f);   // 몫과 나머지가 같으면 바꾸어도 정답과 같다
    if (kind === 'rawNumerator') return true;               // 가분수의 분자는 항상 분모보다 크다
    if (kind === 'wholeOnly') return restOf(f) > 0;
    return false;
  }
  function wrongText(kind, f) {
    const whole = wholeOf(f), rest = restOf(f);
    if (kind === 'swap') return rest + ' ' + whole + '/' + f.d;
    if (kind === 'rawNumerator') return whole + ' ' + f.n + '/' + f.d;
    if (kind === 'wholeOnly') return String(whole);
    throw Error('알 수 없는 오류 유형: ' + kind);
  }
  function itemsErrorFix(seed, count) {
    const pool = spreadByDen(mix(fractionSource(seed, ['improper'], 'improper').filter(f => wholeOf(f) <= 9), seed));
    const picked = take(pool, count, f => f.text, easyFraction, bySize);
    const plan = ['swap', 'rawNumerator', 'wholeOnly'];      // 한 장에 세 가지 오류가 모두 나오게 돌린다
    return picked.map((f, index) => {
      const wanted = plan[index % plan.length];
      const kind = errorFits(wanted, f) ? wanted : plan.find(name => errorFits(name, f));
      return {
        kind: 'error', n: f.n, d: f.d, quotient: wholeOf(f), rest: restOf(f),
        wrongText: wrongText(kind, f), note: ERROR_NOTES[kind], errorKind: kind,
        answerText: display(f.n, f.d)
      };
    });
  }

  /* 1-0-1-2-t2 — 자연수 부분을 바꾸어 가분수 완성하기 */
  function itemsStepsWholePart(seed, count) {
    const pool = spreadByDen(mix(fractionSource(seed, ['mixed'], 'mixed').filter(f => f.whole <= 9), seed));
    return take(pool, count, f => f.text, easyFraction, bySize).map(f => ({
      kind: 'stepsWholePart', whole: f.whole, num: f.num, den: f.den,
      wholeAsFraction: f.whole * f.den, answerText: String(f.n), n: f.n, d: f.den
    }));
  }

  /* 1-0-1-2-t4 — 변환 과정의 빈칸 채우기 (결과를 보고 자연수 부분을 찾는다) */
  function itemsStepsProcess(seed, count) {
    const pool = spreadByDen(mix(fractionSource(seed, ['mixed'], 'mixed').filter(f => f.whole <= 9), seed));
    return take(pool, count, f => f.text, easyFraction, bySize).map(f => ({
      kind: 'stepsProcess', whole: f.whole, num: f.num, den: f.den,
      answerText: String(f.whole), n: f.n, d: f.den
    }));
  }

  /* 1-0-1-3-t1 — 주어진 분모로 자연수 나타내기 */
  function itemsWholeFraction(seed, count) {
    // seed 로 섞은 뒤 분모별로 퍼뜨린다(풀 1~4 × 2~12 = 44짝 중 선택) — seed 마다 다른 문제.
    const pool = spreadByDen(shuffle(wholePairs(seed).filter(pair => pair.whole <= 4), seed ^ 0x5bd1e995));
    return take(pool, count, pair => pair.whole + '/' + pair.den, pair => pair.whole === 1,
      (x, y) => (x.whole - y.whole) || (x.den - y.den)).map(pair => ({
        kind: 'wholeFraction', whole: pair.whole, den: pair.den,
        answerText: String(pair.whole * pair.den), n: pair.whole * pair.den, d: pair.den
      }));
  }

  /* 1-0-1-3-t2 — 그림과 자연수·분수 연결하기 (전체 막대 그림 ↔ 같은 값의 분수) */
  function itemsPairWhole(seed, count) {
    const bundles = count % 4 === 0 ? count / 4 : 3, per = count / bundles, WMAX = 8;   // 세트당 4문제
    const pool = spreadByDen(wholePairs(seed).filter(pair => pair.whole <= WMAX)
      .sort((x, y) => (x.whole - y.whole) || (x.den - y.den)));
    const build = (cap) => {
      const used = new Set(), items = [];
      let easyBudget = cap ? Math.floor(count * 0.1) : Infinity;
      for (let b = 0; b < bundles; b++) {
        const chunk = [];
        for (const pair of pool) {
          if (chunk.length >= per) break;
          const key = pair.whole + '/' + pair.den;
          if (used.has(key)) continue;
          if (chunk.some(other => other.whole === pair.whole)) continue;   // 한 묶음의 자연수는 서로 달라야 한다
          const easy = pair.whole === 1;
          if (easy && easyBudget <= 0) continue;                          // 쉬운 문항은 한 장의 10%까지만
          used.add(key); chunk.push(pair);
          if (easy) easyBudget--;
        }
        if (chunk.length !== per) return null;
        items.push({
          kind: 'bundle', caption: '', rowsWeight: per,
          pairs: chunk.map(pair => [
            { html: barModel(pair.whole, 0, pair.den, 200, 60, '34mm', '10mm', true) },
            { html: fracHTML(pair.whole * pair.den + '/' + pair.den) }
          ]),
          order: derange(shuffle(chunk.map((unused, index) => index), seed ^ (b * 2654435761 + 11)))
        });
      }
      return items;
    };
    const items = build(true) || build(false);
    if (!items) throw Error('연결하기 ' + count + '쌍을 만들지 못했습니다.');
    return { items, layout: { cols: bundles, rows: per, count }, pairs: count };
  }

  /* 1-0-1-3-t3 — 자연수와 같은 분수의 빈칸 채우기 */
  function itemsStepsWhole(seed, count) {
    // seed 로 섞은 뒤 분모별로 퍼뜨린다(풀 1~4 × 2~12 = 44짝 중 선택) — seed 마다 다른 문제.
    const pool = spreadByDen(shuffle(wholePairs(seed).filter(pair => pair.whole <= 4), seed ^ 0x5bd1e995));
    return take(pool, count, pair => pair.whole + '/' + pair.den, pair => pair.whole === 1,
      (x, y) => (x.whole - y.whole) || (x.den - y.den)).map(pair => ({
        kind: 'stepsWhole', whole: pair.whole, den: pair.den,
        product: pair.whole * pair.den, answerText: String(pair.whole * pair.den),
        n: pair.whole * pair.den, d: pair.den
      }));
  }

  /* ---------------------------------------------------------------- 7. 문항 공급 */
  const cache = new Map();
  function hash(text) {
    let h = 2166136261;
    for (const ch of String(text)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  // 같은 seed 라도 유형마다 다른 문제가 나오게 typeId 로 한 번 더 섞는다.
  const seedFor = config => ((Number(config.seed) || 1) ^ hash(config.typeId)) >>> 0;

  const BUILDERS = {
    classify: itemsClassify,
    typeMatch: itemsTypeMatch,
    pick: itemsPick,
    pictureImproper: itemsPictureImproper,
    pictureCount: itemsPictureCount,
    quotient: itemsQuotient,
    pairToMixed: (seed, count) => pairItems(seed, count, 'pairToMixed'),
    pairToImproper: (seed, count) => pairItems(seed, count, 'pairToImproper'),
    errorFix: itemsErrorFix,
    stepsWholePart: itemsStepsWholePart,
    stepsProcess: itemsStepsProcess,
    wholeFraction: itemsWholeFraction,
    pairWhole: itemsPairWhole,
    stepsWhole: itemsStepsWhole
  };
  const typeSpec = typeId => TYPES.find(spec => spec.typeId === typeId);

  function generate(config) {
    const spec = typeSpec(config && config.typeId);
    if (!spec) throw Error('묶음 1-0-1 의 유형이 아닙니다: ' + (config && config.typeId));
    const count = config.count || (config.cols * config.rows) || 0;
    const seed = seedFor(config);
    const key = [config.typeId, count, seed].join('|');
    if (cache.has(key)) return cache.get(key);
    const build = BUILDERS[spec.kind];
    if (!build) throw Error('알 수 없는 유형 종류: ' + spec.kind);
    const items = build(seed, count);
    cache.set(key, items);
    return items;
  }
  const isOurs = config => !!(config && typeSpec(config.typeId));

  /* ---------------------------------------------------------------- 8. 그리기 */
  const esc = value => String(value).replace(/[&<>"']/g,
    c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  /** '3' · '7/4' · '2 3/5' 을 분수꼴 HTML 로 그린다. */
  function fracHTML(text) {
    const s = String(text);
    const mixed = s.match(/^(\d+)\s+(\d+)\/(\d+)$/);
    if (mixed) return '<span class="g101-mixed"><span class="g101-whole">' + mixed[1] + '</span>'
      + fracHTML(mixed[2] + '/' + mixed[3]) + '</span>';
    const fraction = s.match(/^(\d+)\/(\d+)$/);
    if (fraction) return '<span class="g101-frac"><span>' + fraction[1] + '</span><span>' + fraction[2] + '</span></span>';
    return '<span class="g101-whole">' + esc(s) + '</span>';
  }
  /** 분자·분모 자리에 HTML 을 그대로 넣는 분수 — 빈칸이 분자 안에 들어가는 풀이에 쓴다. */
  const stackHTML = (numHTML, denHTML) =>
    '<span class="g101-frac"><span>' + numHTML + '</span><span>' + denHTML + '</span></span>';
  const blankHTML = (wide) => '<span class="g101-blank' + (wide ? ' g101-wide' : '') + '"></span>';
  const boxHTML = '<span class="g101-box g101-whole"></span>';   // 풀이의 빈칸(대분수 자연수 자리)
  const answerBox = (value, answer) => (answer ? '<span class="g101-ink">' + value + '</span>' : boxHTML);
  const SHADE = '#c4dfb8', INK = '#111';

  /** 분수 막대 그림 — 전체 막대 whole 개 + (num>0 이면) 분모 den 으로 나눈 부분 막대 하나.
      왼쪽부터 전체 막대 → 부분 막대 순서라 '몇 개를 묶었는지'가 그림에 그대로 보인다. */
  function barModel(whole, num, den, W, H, cssW, cssH, divideWhole) {
    const pad = 4, gap = 4, bars = whole + (num > 0 ? 1 : 0);
    const barW = (W - 2 * pad - gap * (bars - 1)) / bars;
    const top = pad, height = H - 2 * pad;
    let body = '';
    for (let i = 0; i < whole; i++) {
      const x = pad + i * (barW + gap);
      body += '<rect x="' + x.toFixed(1) + '" y="' + top + '" width="' + barW.toFixed(1)
        + '" height="' + height.toFixed(1) + '" fill="' + SHADE + '" stroke="' + INK + '" stroke-width="1.3"/>';
      // 자연수만 있는 그림(자연수 → 분수)은 전체 막대도 분모만큼 나누어 보여 준다.
      if (divideWhole) {
        for (let k = 1; k < den; k++) {
          const y = top + (height / den) * k;
          body += '<line x1="' + x.toFixed(1) + '" y1="' + y.toFixed(1) + '" x2="' + (x + barW).toFixed(1)
            + '" y2="' + y.toFixed(1) + '" stroke="' + INK + '" stroke-width="0.9"/>';
        }
      }
    }
    if (num > 0) {
      const x = pad + whole * (barW + gap), step = height / den;
      for (let k = 0; k < num; k++) {
        body += '<rect x="' + x.toFixed(1) + '" y="' + (top + step * k).toFixed(1) + '" width="' + barW.toFixed(1)
          + '" height="' + step.toFixed(1) + '" fill="' + SHADE + '"/>';
      }
      for (let k = 1; k < den; k++) {
        const y = top + step * k;
        body += '<line x1="' + x.toFixed(1) + '" y1="' + y.toFixed(1) + '" x2="' + (x + barW).toFixed(1)
          + '" y2="' + y.toFixed(1) + '" stroke="' + INK + '" stroke-width="0.9"/>';
      }
      body += '<rect x="' + x.toFixed(1) + '" y="' + top + '" width="' + barW.toFixed(1) + '" height="'
        + height.toFixed(1) + '" fill="none" stroke="' + INK + '" stroke-width="1.3"/>';
    }
    return '<svg class="g101-svg" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none"'
      + (cssW ? ' style="width:' + cssW + ';height:' + cssH + '"' : '') + '>' + body + '</svg>';
  }

  function css() {
    if (typeof document === 'undefined' || document.getElementById('g101-styles')) return;
    const style = document.createElement('style');
    style.id = 'g101-styles';
    style.textContent = [
      // 이 묶음 문제지만 머리말 글자를 한 단계 줄인다 — 유형 이름이 길어 ' · 정답'까지 붙으면 잘린다.
      // (.g101 은 이 묶음 렌더러가 칸/묶음에 붙이는 표시다.)
      '.sheet-page:has(.g101) .sheet-head{font-size:9pt}',
      '.g101-line{display:flex;align-items:center;white-space:nowrap;line-height:1.15;min-width:0}',
      // 나눗셈식 줄과 분수 줄 사이를 띄우고, 분수는 굵게 쓴다.
      '.g101-fracline{margin-top:3.2mm;font-weight:700}',
      '.g101-fracline .g101-frac,.g101-fracline .g101-frac *{font-weight:700}',
      '.g101-frac{display:inline-flex;flex-direction:column;align-items:center;text-align:center;line-height:1;',
      'vertical-align:middle;font-variant-numeric:tabular-nums;margin:0 .12em}',
      '.g101-frac>span{display:block;padding:0 .16em;min-width:.7em}',
      '.g101-frac>span:first-child{border-bottom:.12em solid #111;padding-bottom:.05em}',
      '.g101-frac>span:last-child{padding-top:.05em}',
      '.g101-mixed{display:inline-flex;align-items:center}',
      '.g101-mixed>.g101-whole{margin-right:.12em}',
      '.g101-op{margin:0 .3em}',
      '.g101-blank{display:inline-block;min-width:11mm;height:1.15em;border-bottom:1px solid #555}',
      '.g101-wide{min-width:16mm}',
      '.g101-box{display:inline-block;min-width:8mm;height:1.05em;border:1px solid #555;vertical-align:-.15em}',
      '.g101-ink{color:#d71f10}',
      '.g101-note{font-size:8.5pt;color:#555;margin-top:.6mm;white-space:nowrap}',
      '.g101-wrong{color:#111}',
      '.g101-work{min-height:24mm;align-self:stretch;display:flex;align-items:center;justify-content:center;margin-top:1.2mm;border:1px solid #ccc;border-radius:1mm;padding:1mm}',
      '.g101-solved .ans-fill{font-size:1em!important}',
      '.g101-solved{display:flex;align-items:center;white-space:nowrap;gap:1mm;color:#d71f10;font-size:1em;line-height:1.35;font-weight:700}',
      // 분류하기 — 보기 세 개가 한 줄에 들어가야 해서 좌우 여백을 쓰지 않는다
      '.g101-pick-q{margin-bottom:1mm}',
      '.g101-opt{display:inline-block}',
      '.g101-opt+.g101-opt{margin-left:3mm}',
      '.g101-on{border:.4mm solid #d71f10;border-radius:50%;color:#d71f10;padding:0 .6mm}',
      // 골라 쓰기
      '.g101-name{font-weight:bold}',
      '.g101-cands{margin-top:.6mm}',
      '.g101-gap{display:inline-block;width:7mm}',   // 보기 분수끼리 붙어 보이지 않게
      // 그림
      '.g101-pic{display:flex;flex-direction:column;height:100%;min-height:0}',
      '.g101-svg{flex:1;min-height:0;width:100%;display:block}',
      '.g101-svg[style]{flex:none}',
      '.g101-pic-foot{flex:none;padding-top:.4mm;white-space:nowrap;line-height:1.2}',
      // 종류 연결하기 — 오른쪽 종류 상자 하나가 두 줄씩 맡는다
      '.g101-tm{position:relative;flex:1;min-height:0}',
      '.g101-tm-grid{position:absolute;inset:0;display:grid;grid-template-columns:47% 53%}',
      '.g101-tm-left{display:grid;grid-auto-rows:minmax(0,1fr);min-height:0}',
      '.g101-tm-cell{display:flex;align-items:center;gap:1.5mm;min-width:0;overflow:hidden;white-space:nowrap}',
      '.g101-tm-right{display:grid;grid-auto-rows:minmax(0,1fr);min-height:0}',
      '.g101-tm-cat{grid-row:span 2;display:flex;align-items:center;gap:1.5mm;font-weight:bold;',
      'border:1px solid #999;border-radius:1mm;margin:.8mm 0 .8mm 3mm;padding:0 2mm;font-size:1.25em}',
      '.g101-tm-mark{flex:none;width:3mm;height:3mm;border:.35mm solid #333;border-radius:50%}',
      '.g101-tm-cell .g101-tm-mark{margin-left:auto;margin-right:1mm}',
      '.g101-tm-lines{position:absolute;inset:0;pointer-events:none}',
      '.g101-tm-lines svg{width:100%;height:100%;display:block}',
      '.g101-tm-lines line{stroke:#b32b2b;stroke-width:1.6;vector-effect:non-scaling-stroke}'
    ].join('');
    document.head.appendChild(style);
  }

  /* --- 격자 서식 --- */
  function renderClassify(cell, q, answer) {
    css();
    cell.insertAdjacentHTML('beforeend', '<div class="g101-line g101-pick-q">' + fracHTML(q.text) + '</div>'
      + '<div class="g101-line">' + q.options.map((name, index) =>
        '<span class="g101-opt' + (answer && index === q.mask ? ' g101-on' : '') + '">' + esc(name) + '</span>').join('') + '</div>');
  }
  /* 조건과 답 칸을 윗줄에, 보기를 아랫줄에 둔다 — 한 줄에 몰아넣으면 분수끼리 붙어 읽기 어렵다. */
  function renderPick(cell, q, answer) {
    css();
    cell.insertAdjacentHTML('beforeend',
      '<div class="g101-line"><span class="g101-name">' + esc(q.name) + '</span>'
      + '<span class="g101-op">→</span>'
      + (answer ? '<span class="g101-ink">' + fracHTML(q.answerText) + '</span>' : blankHTML(false)) + '</div>'
      + '<div class="g101-line g101-cands">'
      + q.candidates.map(fracHTML).join('<span class="g101-gap"></span>') + '</div>');
  }
  /* 그림 아래 한 줄 — 지시문이 묻는 것을 밝히므로 그림만 보고 답을 쓴다.
     (한 칸 56mm 안에 들어가야 해서 글자를 늘리지 않는다.) */
  function renderPicture(cell, q, answer) {
    css();
    cell.insertAdjacentHTML('beforeend', '<div class="g101-pic">' + barModel(q.whole, q.num, q.den, 200, 118)
      + '<div class="g101-pic-foot">= '
      + (answer ? '<span class="g101-ink">' + fracHTML(q.answerText) + '</span>' : blankHTML(true))
      + '</div></div>');
  }
  function renderPictureCount(cell, q, answer) {
    css();
    cell.insertAdjacentHTML('beforeend', '<div class="g101-pic">' + barModel(q.whole, q.num, q.den, 200, 118)
      + '<div class="g101-pic-foot">= '
      + stackHTML(answer ? '<span class="g101-ink">' + esc(q.answerText) + '</span>' : boxHTML, q.den)
      + '</div></div>');
  }
  function renderQuotient(cell, q, answer) {
    css();
    cell.insertAdjacentHTML('beforeend',
      '<div class="g101-line">' + esc(q.n) + '<span class="g101-op">÷</span>' + esc(q.d) + '<span class="g101-op">=</span>'
      + answerBox(q.quotient, answer) + '<span class="g101-op">…</span>' + answerBox(q.rest, answer) + '</div>'
      + '<div class="g101-line g101-fracline">' + fracHTML(q.n + '/' + q.d) + '<span class="g101-op">=</span>'
      + (answer ? '<span class="g101-ink">' + fracHTML(q.answerText) + '</span>' : blankHTML(false)) + '</div>');
  }
  function renderError(cell, q, answer) {
    css();
    cell.insertAdjacentHTML('beforeend',
      '<div class="g101-line">' + fracHTML(q.n + '/' + q.d) + '<span class="g101-op">=</span>'
      + '<span class="g101-wrong">' + fracHTML(q.wrongText) + '</span></div>'
      + '<div class="g101-work">' + (answer
        ? '<div class="g101-solved">' + q.n + ' ÷ ' + q.d + ' = ' + q.quotient + ' … ' + q.rest
          + ' → ' + fracHTML(q.answerText) + '</div>' : '') + '</div>');
  }
  function renderWholeFraction(cell, q, answer) {
    css();
    cell.insertAdjacentHTML('beforeend',
      '<div class="g101-line">' + esc(q.whole) + '<span class="g101-op">=</span>'
      + stackHTML(answer ? '<span class="g101-ink">' + esc(q.answerText) + '</span>' : boxHTML, q.den) + '</div>');
  }
  /** 단계별 빈칸 두 가지 — 모든 문항이 같은 자리에 빈칸을 둔다. */
  function renderSteps(cell, q, answer) {
    css();
    if (q.kind === 'stepsWholePart') {
      // 3 1/4 = □/4 + 1/4 = □/4  (자연수 부분을 분모가 같은 분수로 바꾸어 더한다)
      cell.insertAdjacentHTML('beforeend',
        '<div class="g101-line">' + fracHTML(q.whole + ' ' + q.num + '/' + q.den) + '<span class="g101-op">=</span>'
        + stackHTML(answerBox(q.wholeAsFraction, answer), q.den) + '<span class="g101-op">+</span>'
        + fracHTML(q.num + '/' + q.den) + '<span class="g101-op">=</span>'
        + stackHTML(answerBox(q.n, answer), q.den) + '</div>');
    } else {
      // 3 = (3 × 5)/5 = □/5  (자연수를 주어진 분모의 분수로 바꾼다)
      cell.insertAdjacentHTML('beforeend',
        '<div class="g101-line">' + esc(q.whole) + '<span class="g101-op">=</span>'
        + stackHTML(q.whole + ' × ' + q.den, q.den) + '<span class="g101-op">=</span>'
        + stackHTML(answerBox(q.product, answer), q.den) + '</div>');
    }
  }
  /** 1-0-1-2-t4 — □ 1/4 = (□ × 4 + 1)/4 = 13/4 (결과를 보고 자연수 부분을 찾는다) */
  function renderStepsProcess(cell, q, answer) {
    css();
    const wholeHTML = answerBox(q.whole, answer);
    cell.insertAdjacentHTML('beforeend',
      '<div class="g101-line"><span class="g101-mixed">' + wholeHTML + fracHTML(q.num + '/' + q.den) + '</span>'
      + '<span class="g101-op">=</span>' + stackHTML(wholeHTML + ' × ' + q.den + ' + ' + q.num, q.den)
      + '<span class="g101-op">=</span>' + fracHTML(q.n + '/' + q.den) + '</div>');
  }

  /* --- 선 잇기 --- */
  /* 종류 연결하기: 그림이 두 줄씩 걸친 종류 상자 하나로 이어진다(공용 선 잇기 틀은 1:1 전용). */
  function renderTypeMatch(config, item, isAnswer) {
    css();
    const wrap = document.createElement('div');
    wrap.className = 'g101-tm g101';
    const grid = document.createElement('div');
    grid.className = 'g101-tm-grid';
    const left = document.createElement('div');
    left.className = 'g101-tm-left';
    const right = document.createElement('div');
    right.className = 'g101-tm-right';
    item.pictures.forEach(f => {
      const row = document.createElement('div');
      row.className = 'g101-tm-cell';
      row.innerHTML = barModel(f.whole, f.whole ? restOf(f) : f.num, f.den, 200, 60, '48mm', '12.5mm')
        + fracHTML(f.text) + '<span class="g101-tm-mark"></span>';
      left.append(row);
    });
    item.categories.forEach(name => {
      const box = document.createElement('div');
      box.className = 'g101-tm-cat';
      box.innerHTML = '<span class="g101-tm-mark"></span>' + esc(name);
      right.append(box);
    });
    grid.append(left, right);
    wrap.append(grid);
    if (isAnswer) {
      const bars = item.pictures.length, cats = item.categories.length;
      const lines = item.pictures.map((unused, index) => {
        const from = (((index + 0.5) / bars) * 1000).toFixed(1);
        const to = (((item.order[index] + 0.5) / cats) * 1000).toFixed(1);
        return '<line x1="455" y1="' + from + '" x2="500" y2="' + to + '"/>';
      }).join('');
      const overlay = document.createElement('div');
      overlay.className = 'g101-tm-lines';
      overlay.innerHTML = '<svg viewBox="0 0 1000 1000" preserveAspectRatio="none">' + lines + '</svg>';
      wrap.append(overlay);
    }
    return wrap;
  }

  /* ---------------------------------------------------------------- 9. 등록 */
  if (root.SheetGen && typeof root.SheetGen.generate === 'function' && !root.SheetGen.g101) {
    const base = root.SheetGen.generate;
    root.SheetGen.generate = function (config) {
      if (isOurs(config)) return generate(config);
      return base.apply(this, arguments);
    };
    Object.defineProperty(root.SheetGen, 'g101', { value: true });
  }
  if (root.Sheet && typeof root.Sheet.register === 'function') {
    // 칸에 이 묶음 표시(.g101)를 달아 머리말 규칙이 이 문제지에만 걸리게 한다.
    const install = (format, render) => {
      try {
        root.Sheet.register(format, (cell, q, answer, config) => {
          cell.classList.add('g101');
          return render(cell, q, answer, config);
        });
      } catch (error) { console.warn('g1-0-1 서식 등록 실패: ' + format, error); }
    };
    install(FMT.classify, renderClassify);
    install(FMT.pick, renderPick);
    install(FMT.picture, (cell, q, answer) =>
      (q.kind === 'pictureCount' ? renderPictureCount(cell, q, answer) : renderPicture(cell, q, answer)));
    install(FMT.answer, (cell, q, answer) =>
      (q.kind === 'wholeFraction' ? renderWholeFraction(cell, q, answer) : renderQuotient(cell, q, answer)));
    install(FMT.steps, (cell, q, answer) =>
      (q.kind === 'stepsProcess' ? renderStepsProcess(cell, q, answer) : renderSteps(cell, q, answer)));
    install(FMT.errors, renderError);
  }
  // 선 잇기 — 공용 틀(묶음·줄·정답 선)을 그대로 쓰고, 종류 연결만 이 묶음 틀로 그린다.
  if (root.MatchingSheet && root.MatchingSheet.formats && root.MatchingSheet.formats['matching-lines']) {
    const shared = root.MatchingSheet.formats['matching-lines'].render;
    root.MatchingSheet.formats[FMT.pair] = {
      page: 'blocks', title: '선 잇기', build: buildFor,
      render: (config, item, isAnswer, built) => {
        // 동그라미를 분수 바로 옆에 붙인 2단 배치(compact): 왼쪽 가분수·오른쪽 대분수 폭을 따로 준다.
        item.compact = true; item.compactGap = 14;
        if (config.gen && config.gen.kind === 'pairWhole') { item.compactWl = 36; item.compactWr = 10; item.compactGap = 12; }   // 왼쪽은 34mm 막대 그림
        else { item.compactWl = 12; item.compactWr = 16; }
        const node = shared(config, item, isAnswer, built);
        node.classList.add('g101');
        return node;
      }
    };
    root.MatchingSheet.formats[FMT.typeMatch] = {
      page: 'blocks', title: '종류 연결하기', build: buildFor, render: renderTypeMatch
    };
  }
  function buildFor(config) {
    const spec = typeSpec(config.typeId);
    if (!spec) throw Error('묶음 1-0-1 의 유형이 아닙니다: ' + config.typeId);
    css();
    return generate(config);
  }

  /* ---------------------------------------------------------------- 10. 카탈로그 */
  const entries = TYPES.map(spec => ({
    typeId: spec.typeId, title: spec.title, instruction: spec.instruction,
    format: spec.format, cols: spec.cols, rows: spec.rows, count: spec.cols * spec.rows,
    fontPt: spec.fontPt, seed: 20261001, gen: { concept: CONCEPT_OF(spec.typeId), kind: spec.kind },
    ...(spec.autoFit === false ? { autoFit: false } : {}), ...(spec.maxProblems ? { maxProblems: spec.maxProblems } : {})
  }));
  if (Array.isArray(root.SheetCatalog)) root.SheetCatalog.push(...entries);

  /** selfTest 용 — 정수 연산으로 정답을 다시 계산한다. */
  function expectedAnswer(item) {
    switch (item.kind) {
      case 'picture': return display(item.n, item.d);
      case 'pictureCount': return String(item.n);
      case 'quotient': return display(item.n, item.d);
      case 'error': return display(item.n, item.d);
      case 'stepsWholePart': return String(item.n);
      case 'stepsProcess': return String(item.whole);
      case 'wholeFraction': return String(item.whole * item.den);
      case 'stepsWhole': return String(item.whole * item.den);
      default: return null;
    }
  }

  root.G101Sheet = {
    types: TYPES, entries, formats: FMT, generate, expectedAnswer,
    parts, display, wholeOf, restOf, usable, seedFor,
    /** 검수용: 개념 조건·정답·중복·개수를 스스로 다시 확인한다. */
    selfTest(seeds) {
      const report = { sheets: 0, items: 0, byKind: {} };
      for (const seed of seeds || [1, 7, 42]) for (const spec of TYPES) {
        const config = entries.find(entry => entry.typeId === spec.typeId);
        const built = generate(Object.assign({}, config, { seed }));
        const list = built.items ? built.items.flatMap(bundle => bundle.pairs || bundle.pictures) : built;
        if (list.length !== config.count) {
          throw Error(spec.typeId + ': 문항 수 ' + list.length + ' ≠ ' + config.count);
        }
        if (spec.kind === 'classify' || spec.kind === 'pick') {
          const keys = new Set();
          for (const item of built) {
            const key = item.kind === 'classify' ? item.text : item.candidates.join('|');
            if (keys.has(key)) throw Error(spec.typeId + ': 같은 문항이 두 번 나왔습니다.');
            keys.add(key);
            if (item.kind === 'classify') {
              const f = parts(item.text);
              if (!usable(f)) throw Error(spec.typeId + ': 범위 밖 분수 ' + item.text);
              if (item.options[item.mask] !== NAME_OF[f.form]) throw Error(spec.typeId + ': 종류 표시가 틀립니다.');
            } else {
              const forms = item.candidates.map(text => parts(text).form);
              if (forms.filter(form => form === item.form).length !== 1) {
                throw Error(spec.typeId + ': 조건에 맞는 보기가 하나가 아닙니다.');
              }
              if (parts(item.answerText).form !== item.form) throw Error(spec.typeId + ': 고른 분수가 조건과 다릅니다.');
            }
          }
        } else if (spec.kind === 'typeMatch') {
          for (const bundle of built.items) {
            if (bundle.pictures.length !== bundle.categories.length * 2) throw Error(spec.typeId + ': 묶음 구성이 틀립니다.');
            const values = bundle.pictures.map(f => [f.n, f.d]);
            for (let i = 0; i < values.length; i++) for (let j = i + 1; j < values.length; j++) {
              if (values[i][0] * values[j][1] === values[j][0] * values[i][1]) {
                throw Error(spec.typeId + ': 한 묶음에 값이 같은 그림이 있습니다.');
              }
            }
          }
        } else if (!built.items) {
          const keys = new Set();
          for (const item of built) {
            const key = item.n + '/' + item.d + ':' + item.kind;
            if (keys.has(key)) throw Error(spec.typeId + ': 같은 문항이 두 번 나왔습니다.');
            keys.add(key);
            const want = expectedAnswer(item);
            if (want !== null && String(want) !== String(item.answerText)) {
              throw Error(spec.typeId + ': 정답 ' + item.answerText + ' ≠ ' + want);
            }
            if (item.kind === 'error' && String(item.wrongText) === String(item.answerText)) {
              throw Error(spec.typeId + ': 틀린 풀이가 정답과 같습니다.');
            }
          }
        }
        report.sheets++; report.items += list.length;
        report.byKind[spec.kind] = (report.byKind[spec.kind] || 0) + list.length;
      }
      return report;
    }
  };
})(globalThis);
