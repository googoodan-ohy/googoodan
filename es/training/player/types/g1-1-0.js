/* =============================================================================
   묶음 1-1-0 — 분수의 덧셈 준비 (개념 3개 · typeId 10개)

     개념 1-1-0-0 같은 단위분수끼리 모으기          t1 그림 두 묶음 / t2 수 모형 빈칸
                                                  t3 같은 합 짝 연결 / t4 모으기 관계도
     개념 1-1-0-1 대분수의 자연수·분수 부분 나누기   t1 나누어 쓰기 / t2 합쳐 쓰기 / t3 구성식 빈칸
     개념 1-1-0-2 결과를 약분하고 대분수로 정리하기  t1 약분 과정 / t2 기약분수·대분수 / t3 약분 전후 연결

   규칙(AGENTS.md · layout-rules.md)
   · 문제 수치는 사이트의 기존 생성기(Worksheets.generate)가 낸 것만 쓴다. 새 문제 엔진을 만들지 않는다.
       - 1-1-0-0 · 1-1-0-2 → fraction-add-same (분모가 같은 진분수 + 진분수)의 두 항과 그 합
       - 1-1-0-1          → fraction-add-mixed-whole 의 대분수 항(자연수 + 진분수)
     개념 조건에 맞지 않는 문항은 버리고, 모자라면 seed 를 바꿔 더 뽑는다. 중복 문항은 쓰지 않는다.
     기존 생성기가 낸 정답과 내가 만든 값이 같은지도 문항마다 확인한다(다르면 그 문항은 버린다).
   · 같은 생성기를 개념에 따라 나눠 쓴다.
       - 1-1-0-0 : 합이 1보다 작고 결과가 기약(단위 그대로)인 문항 → 그림·수 모형으로 '모으기'
       - 1-1-0-2 : 결과를 약분하거나 대분수로 고쳐야 하는 문항(합이 가분수이거나 약분 필요)
     이렇게 해서 1-1-0-0(모으기) → 1-1-0-2(정리하기)가 겹치지 않는다.
   · 1-1-0-1 의 대분수는 자연수 부분 1~9 · 분수 부분은 진분수이면서 기약인 것만 쓴다
     (약분은 1-1-0-2 에서 배우므로 여기서는 이미 기약인 분수만 다룬다).
   · 같은 typeId · 같은 seed → 언제나 같은 문제지.
   · 한 장 = 한 유형, 가로·세로를 섞지 않는다(이 묶음은 전부 가로셈 모양이다).
   · 서식 키는 이 묶음 전용 ko110-* 이다. 공용 파일(sheet.js, formats-*.js, gen-bridge.js)은 고치지 않는다.

   배치는 sheet.js 의 autoFit 이 맡는다 — 칸 높이 최소치는 서식 이름으로 정해지므로,
   그림 서식 이름에는 picture 를 넣어 38mm(그림 칸)가 잡히게 했고, 나머지는 글자 한 줄 높이다.
   유형별 문항 수 상한(COUNT_CAP)은 준비 학습 문항이라 지나치게 촘촘해지지 않게 둔 값이다.
============================================================================= */
(function (root) {
  'use strict';

  const INK = '#111';
  const SHADE = '#c4dfb8';          // 둘째 묶음 — 연한 민트색
  const ANSWER_INK = '#b32b2b';     // 정답지의 답
  const CIRCLED = '①②③④⑤⑥⑦⑧⑨⑩';

  /* ================================================================= 도구 */
  const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a) || 1);
  const reduce = (n, d) => { const g = gcd(n, d); return [n / g, d / g]; };
  function random(seed) {
    let s = (Number(seed) >>> 0) || 1;
    return () => {
      s += 0x6d2b79f5;
      let t = s;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function shuffle(list, rnd) {
    const out = list.slice();
    for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); const tmp = out[i]; out[i] = out[j]; out[j] = tmp; }
    return out;
  }
  function hash(text) {
    let h = 2166136261;
    for (const ch of String(text)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  const esc = value => String(value).replace(/[&<>"']/g,
    c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /** '2 3/5' · '7/4' · '3' 을 분자·분모로 되돌린다(기존 생성기 정답 확인용). */
  function rational(text) {
    const s = String(text).trim();
    const mixed = s.match(/^(\d+)\s+(\d+)\/(\d+)$/);
    if (mixed) return [(+mixed[1]) * (+mixed[3]) + (+mixed[2]), +mixed[3]];
    const plain = s.match(/^(\d+)\/(\d+)$/);
    if (plain) return [+plain[1], +plain[2]];
    return [+s, 1];
  }
  const sameValue = (text, n, d) => {
    const [a, b] = rational(text), [x, y] = reduce(n, d);
    const [p, q] = reduce(a, b);
    return x === p && y === q;
  };
  /** 기약분수 또는 대분수 글자(정답 검사·키 만들기에 쓴다). */
  function textOf(n, d) {
    const [rn, rd] = reduce(n, d);
    if (rd === 1) return String(rn);
    const whole = Math.trunc(rn / rd), rest = rn % rd;
    return whole ? whole + ' ' + rest + '/' + rd : rn + '/' + rd;
  }

  /* 분수 표시(HTML) — 문제지·정답지 공용 */
  const fracHTML = (n, d, answer) =>
    '<span class="ko110-frac' + (answer ? ' ko110-answer' : '') + '"><span>' + esc(n) + '</span><span>' + esc(d) + '</span></span>';
  const mixedHTML = (w, n, d, answer) =>
    '<span class="ko110-mixed' + (answer ? ' ko110-answer' : '') + '"><span class="ko110-whole">' + esc(w) + '</span>'
    + fracHTML(n, d, answer) + '</span>';
  /** 분자·분모로 그리는 값 — 가분수는 대분수로 고쳐 그린다. */
  function valueHTML(n, d, answer) {
    const [rn, rd] = reduce(n, d);
    if (rd === 1) return '<span class="ko110-whole' + (answer ? ' ko110-answer' : '') + '">' + esc(rn) + '</span>';
    const whole = Math.trunc(rn / rd), rest = rn % rd;
    return whole ? mixedHTML(whole, rest, rd, answer) : fracHTML(rn, rd, answer);
  }
  const opHTML = text => '<span class="ko110-op">' + text + '</span>';
  /** 낱개 수 빈칸(자연수 부분 등) */
  const boxHTML = () => '<span class="ko110-box"></span>';
  /** 분수 빈칸 — 분자 칸 / 가로줄 / 분모 칸 */
  const fracBlankHTML = () => '<span class="ko110-fracblank"><span></span><span></span></span>';
  /** 분모를 미리 보여 주고 분자만 비우는 분수 */
  const numBlankHTML = (bottom) => '<span class="ko110-frac"><span class="ko110-numbox"></span><span>' + esc(bottom) + '</span></span>';

  /** 수 모형 막대 — 칸 하나가 1/d. cells[i] 는 '' | 'solid' | 'shade'. */
  function barHTML(cells, solidColor = '#819fba') {
    const cw = 16, ch = 22;
    let body = '';
    cells.forEach((fill, index) => {
      const x = index * cw;
      if (fill === 'solid') body += '<rect x="' + x + '" y="0" width="' + cw + '" height="' + ch + '" fill="' + solidColor + '"/>';
      else if (fill === 'shade') body += '<rect x="' + x + '" y="0" width="' + cw + '" height="' + ch + '" fill="' + SHADE + '"/>';
      body += '<rect x="' + x + '" y="0" width="' + cw + '" height="' + ch + '" fill="none" stroke="' + INK
        + '" stroke-width="1.4"/>';
    });
    // preserveAspectRatio="none" — 분모가 달라도 막대는 늘 같은 크기(44mm×6mm)로 그린다.
    // 칸 수만 달라지고 칸 하나가 1/d 을 나타내는 모양은 한 장 안에서 같아진다.
    return '<svg class="ko110-bar" viewBox="0 0 ' + (cells.length * cw) + ' ' + ch
      + '" preserveAspectRatio="none" aria-hidden="true">' + body + '</svg>';
  }
  const solidCells = (d, count) => Array.from({ length: d }, (unused, index) => (index < count ? 'solid' : ''));

  /* ============================================== 기존 생성기에서 재료 뽑기 */
  const SOURCE_SAME = 'fraction-add-same';          // 분모가 같은 진분수 + 진분수
  const SOURCE_MIXED = 'fraction-add-mixed-whole';  // 대분수 + 자연수 (대분수 항만 쓴다)
  const BATCH = 96, ROUNDS = 400, POOL_MAX = 600;

  function legacyRows(source, seed) {
    if (!root.Worksheets || typeof root.Worksheets.generate !== 'function') {
      throw Error('기존 Worksheets 생성기를 찾지 못했습니다.');
    }
    return root.Worksheets.generate(source, seed >>> 0, BATCH);
  }

  const cmpUnit = (x, y) => (x.d - y.d) || (x.s - y.s) || (x.n - y.n);
  const cmpMixed = (x, y) => (x.d - y.d) || (x.w - y.w) || (x.n - y.n);
  /** 풀을 seed 로 섞는다 — 크기순으로 앞에서 자르면 seed 를 바꿔도 같은 문항만 나온다.
      고른 뒤 문제지에서는 다시 쉬운 것 → 어려운 것 순으로 세운다(sortUnit·sortMixed). */
  const mixPool = (list, seed) => shuffle(list, random((seed ^ 0x5bd1e995) >>> 0));

  /** 분모가 같은 진분수 두 항을 모아 조건에 맞는 것만 남긴다. */
  function unitPool(source, seed, accept) {
    const out = [], seen = new Set();
    for (let round = 0; round < ROUNDS && out.length < POOL_MAX; round++) {
      let rows;
      try { rows = legacyRows(source, (seed + Math.imul(round, 2654435761)) >>> 0); }
      catch (error) { break; }
      for (const row of rows) {
        const a = String(row.a).match(/^(\d+)\/(\d+)$/), b = String(row.b).match(/^(\d+)\/(\d+)$/);
        if (!a || !b) continue;
        const d = +a[2], n = +a[1], m = +b[1];
        if (+b[2] !== d || n < 1 || n >= d || m < 1 || m >= d) continue;   // 진분수·분모 같음
        const item = { d, n, m, s: n + m, key: d + ':' + n + ':' + m, legacy: String(row.answer) };
        // 기존 생성기가 낸 정답과 내 계산이 같은 문항만 쓴다.
        if (!sameValue(item.legacy, item.s, item.d)) continue;
        if (!accept(item) || seen.has(item.key)) continue;
        seen.add(item.key); out.push(item);
      }
    }
    return out;
  }

  /* 개념 1-1-0-0 — 합이 1보다 작고 결과가 기약(같은 단위 그대로)인 문항.
     결과에 약분이 필요하면 1-1-0-2 의 몫이라 여기서는 쓰지 않는다. */
  function unitItems(seed) {
    return mixPool(unitPool(SOURCE_SAME, seed, item => item.s < item.d && gcd(item.s, item.d) === 1)
      .sort(cmpUnit), seed);
  }
  /* 개념 1-1-0-2 — 결과를 약분하거나 대분수로 고쳐야 하는 문항(합이 1과 같으면 쓰지 않는다). */
  function reduceItems(seed) {
    return mixPool(unitPool(SOURCE_SAME, seed, item => item.s !== item.d && (gcd(item.s, item.d) > 1 || item.s > item.d))
      .sort(cmpUnit), seed);
  }

  /* 개념 1-1-0-1 — 대분수(자연수 1~9 + 진분수, 이미 기약)를 모은다. */
  function mixedItems(seed) {
    const out = [], seen = new Set();
    for (let round = 0; round < ROUNDS && out.length < POOL_MAX; round++) {
      let rows;
      try { rows = legacyRows(SOURCE_MIXED, (seed + Math.imul(round, 2654435761)) >>> 0); }
      catch (error) { break; }
      for (const row of rows) {
        const m = String(row.a).match(/^(\d+)\s+(\d+)\/(\d+)$/);
        if (!m) continue;
        const w = +m[1], n = +m[2], d = +m[3];
        if (w < 1 || n < 1 || n >= d || gcd(n, d) !== 1) continue;   // 자연수 + 기약 진분수
        const item = { w, n, d, key: w + ':' + n + ':' + d };
        if (seen.has(item.key)) continue;
        seen.add(item.key); out.push(item);
      }
    }
    return mixPool(out.sort(cmpMixed), seed);
  }

  /** 0·1이 들어간 지나치게 쉬운 문항은 전체의 10% 이하로 (layout-rules.md §5). */
  const isEasyUnit = item => item.n === 1 && item.m === 1;
  const isEasyMixed = item => item.w === 1 && item.n === 1;
  // 약분 전 인쇄된 분수에 0·1이 들어가는지를 센다. 약분한 답의 분자 1은 쉬운 재료로 취급하지 않는다.
  const isEasyReduce = item => item.s <= 1 || item.d <= 1;

  /** 쉬운 문항 수(10% 이하)와 값의 다양성을 지키면서 count개를 고른다. 모자라면 알린다.
      valueOf 를 주면 같은 값이 나오는 문항은 뒤로 미루고, 값이 모자랄 때만 다시 쓴다.
      (분모가 같은 덧셈 준비라 답이 겹치면 문제지가 단조로워진다.) */
  function take(pool, count, isEasy, valueOf) {
    const out = [], used = new Set();
    const easyLimit = Math.floor(count * 0.1);
    let easy = 0;
    for (let i = 0; i < pool.length && out.length < count; i++) {
      const item = pool[i];
      const value = valueOf ? valueOf(item) : null;
      // 아직 안 쓴 값이 뒤에 남아 있으면 같은 값은 건너뛴다(쉬운 순서는 그대로 지킨다).
      if (value !== null && used.has(value) && count - out.length < pool.length - i) continue;
      if (isEasy(item)) {
        if (easy >= easyLimit) continue;
        easy++;
      }
      out.push(item);
      if (value !== null) used.add(value);
    }
    if (out.length !== count) {
      throw Error('조건에 맞는 고유 문항 ' + count + '개 중 ' + out.length + '개만 있습니다.');
    }
    return out;
  }
  function uniquePrintedFractions(items) {
    const seen = new Set();
    return items.filter(item => {
      const key = item.s + '/' + item.d;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /* ================================================================= 유형 정의 */
  const FMT = {
    picture: 'ko110-picture-two',
    pictureBlank: 'ko110-picture-blank',
    bond: 'ko110-bond',
    split: 'ko110-split',
    join: 'ko110-join',
    compose: 'ko110-compose',
    reduceSteps: 'ko110-reduce-steps',
    reduceAnswer: 'ko110-reduce',
    unitPairs: 'ko110-unit-pairs',
    reducePairs: 'ko110-reduce-pairs'
  };

  /** 준비 학습 문항이라 지나치게 촘촘해지지 않도록 둔 문항 수 상한(autoFit 이 이 수를 넘기지 않는다). */
  const COUNT_CAP = {
    picture: 24, pictureBlank: 24, bond: 24,
    split: 48, join: 48, compose: 24,
    reduceSteps: 24, reduceAnswer: 42
  };

  const CONCEPTS = [
    { id: '1-1-0-0', name: '같은 단위분수끼리 모으기' },
    { id: '1-1-0-1', name: '대분수의 자연수 부분과 분수 부분 나누기' },
    { id: '1-1-0-2', name: '결과를 약분하고 대분수로 정리하기' }
  ];

  const TYPES = [
    { typeId: '1-1-0-0-t1', concept: '1-1-0-0', kind: 'picture', format: FMT.picture,
      title: '그림 두 묶음을 합쳐 수 쓰기', cols: 3, rows: 5, fontPt: 16, autoFit: false, maxProblems: 15,
      instruction: '그림 두 묶음을 합쳐 알맞은 수를 쓰세요.' },
    { typeId: '1-1-0-0-t2', concept: '1-1-0-0', kind: 'pictureBlank', format: FMT.pictureBlank,
      title: '수 모형의 빈칸 채우기', cols: 3, rows: 5, fontPt: 16, autoFit: false, maxProblems: 15,
      instruction: '수 모형을 보고 빈칸에 알맞은 수를 쓰세요.' },
    { typeId: '1-1-0-0-t3', concept: '1-1-0-0', kind: 'unitPairs', format: FMT.unitPairs,
      title: '같은 합을 만드는 짝 연결하기', cols: 2, rows: 2, fontPt: 14, autoFit: false, bundles: 4, perBundle: 5,
      instruction: '같은 합을 만드는 것끼리 선으로 이으세요.' },
    { typeId: '1-1-0-0-t4', concept: '1-1-0-0', kind: 'bond', format: FMT.bond,
      title: '모으기 관계도 완성하기', cols: 3, rows: 7, autoFit: false, maxProblems: 21, fontPt: 14,
      instruction: '빈칸에 알맞은 수를 써서 모으기 관계도를 완성하세요.' },

    { typeId: '1-1-0-1-t1', concept: '1-1-0-1', kind: 'split', format: FMT.split,
      title: '대분수를 자연수와 진분수로 나누기', cols: 3, rows: 8, autoFit: false, maxProblems: 24, fontPt: 22,
      instruction: '대분수를 자연수 부분과 분수 부분으로 나누어 쓰세요.' },
    { typeId: '1-1-0-1-t2', concept: '1-1-0-1', kind: 'join', format: FMT.join,
      title: '분리한 두 부분으로 대분수 쓰기', cols: 3, rows: 6, autoFit: false, maxProblems: 18, fontPt: 26,
      instruction: '자연수 부분과 분수 부분을 합쳐 대분수로 쓰세요.' },
    { typeId: '1-1-0-1-t3', concept: '1-1-0-1', kind: 'compose', format: FMT.compose,
      title: '대분수 구성식의 빈칸 채우기', cols: 2, rows: 9, autoFit: false, maxProblems: 18, fontPt: 24,
      instruction: '빈칸에 알맞은 수를 써서 대분수 구성식을 완성하세요.' },

    { typeId: '1-1-0-2-t1', concept: '1-1-0-2', kind: 'reduceSteps', format: FMT.reduceSteps,
      title: '공약수로 나누는 과정 완성하기', cols: 2, rows: 9, autoFit: false, maxProblems: 18, fontPt: 26,
      instruction: '빈칸에 알맞은 수를 써서 약분하는 과정을 완성하세요.' },
    { typeId: '1-1-0-2-t2', concept: '1-1-0-2', kind: 'reduceAnswer', format: FMT.reduceAnswer,
      title: '기약분수까지 약분하기', cols: 3, rows: 6, autoFit: false, maxProblems: 18, fontPt: 28,
      instruction: '약분하여 기약분수로 나타내고 가분수이면 대분수로 고쳐 쓰세요.' },
    { typeId: '1-1-0-2-t3', concept: '1-1-0-2', kind: 'reducePairs', format: FMT.reducePairs,
      title: '약분 전후의 같은 분수 연결하기', cols: 2, rows: 2, fontPt: 15, autoFit: false, bundles: 4, perBundle: 5,
      instruction: '약분하기 전과 후의 같은 분수를 선으로 이으세요.' }
  ];

  const entries = TYPES.map(type => ({
    typeId: type.typeId,
    title: type.title,
    instruction: type.instruction,
    format: type.format,
    cols: type.cols,
    rows: type.rows,
    count: type.cols * type.rows,
    fontPt: type.fontPt,
    seed: 20261001,
    autoFit: type.autoFit, maxProblems: type.maxProblems,
    gen: { concept: type.concept, kind: type.kind, bundles: type.bundles, perBundle: type.perBundle }
  }));

  /* ================================================================= 문항 만들기 */
  const kindOf = config => (config.gen && config.gen.kind) || '';
  const seedFor = config => ((Number(config.seed) || 1) ^ hash(config.typeId)) >>> 0;

  /** 연결하기 — 묶음으로 나누고, 오른쪽 순서를 섞어 같은 줄끼리 이어지지 않게 한다. */
  function bundleize(pairs, bundleCount, perBundle, rnd) {
    const built = [];
    for (let b = 0; b < bundleCount; b++) {
      const chunk = pairs.slice(b * perBundle, (b + 1) * perBundle);
      if (chunk.length !== perBundle) throw Error('연결하기 ' + (b + 1) + '묶음에 ' + chunk.length + '쌍뿐입니다.');
      const order = shuffle(chunk.map((unused, index) => index), rnd);
      for (let i = 0; i < order.length; i++) {
        if (order[i] !== i) continue;
        const j = (i + 1) % order.length, tmp = order[i];
        order[i] = order[j]; order[j] = tmp;
      }
      built.push({ kind: 'bundle', pairs: chunk, order, rowsWeight: perBundle });
    }
    return built;
  }

  /** 1-1-0-0-t3 — 두 식의 합이 같아야 짝. 한 장에서 값은 한 번만 쓴다(짝이 하나로 정해진다). */
  function unitPairBundles(config) {
    const seed = seedFor(config), bundles = config.gen.bundles || 3, per = config.gen.perBundle || 6;
    const count = bundles * per;
    const groups = new Map();
    for (const item of unitItems(seed)) {
      const key = item.d + ':' + item.s;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(item);
    }
    const ready = [];
    for (const [key, list] of groups) if (list.length >= 2) ready.push({ key, list });
    ready.sort((x, y) => {
      const [xd, xs] = x.key.split(':').map(Number), [yd, ys] = y.key.split(':').map(Number);
      return (xd - yd) || (xs - ys);
    });
    // 거울쌍(1/5+2/5 ↔ 2/5+1/5)뿐인 무리는 뒤로 미룬다 — 여러 가지로 나눌 수 있는 무리를 먼저 쓴다.
    const order = ready.filter(group => group.list.length >= 3).concat(ready.filter(group => group.list.length === 2));
    const pairs = [], easyLimit = Math.floor(count * 0.1);
    let easy = 0;
    for (const group of order) {
      if (pairs.length >= count) break;
      const first = group.list[0];
      const second = group.list.find(other => other !== first && (other.n !== first.m || other.m !== first.n)) || group.list[1];
      if (isEasyUnit(first) && isEasyUnit(second)) {
        if (easy >= easyLimit) continue;
        easy++;
      }
      pairs.push([first, second]);
    }
    if (pairs.length !== count) {
      throw Error(config.typeId + ': 같은 합을 만드는 짝 ' + count + '쌍 중 ' + pairs.length + '쌍만 있습니다.');
    }
    const expression = item => fracHTML(item.n, item.d) + opHTML('+') + fracHTML(item.m, item.d);
    return bundleize(pairs.map(pair => [expression(pair[0]), expression(pair[1])]), bundles, per, random(seed ^ 0x2545f491))
      .map(bundle => Object.assign(bundle, { dims: { L: 32, G: 12, R: 32 } }));
  }

  /** 1-1-0-2-t3 — 정리하기 전 분수와 정리한 뒤의 수(기약분수 또는 대분수)를 잇는다.
      같은 값이 두 번 나오면 어느 것과 이어야 할지 갈리므로 값은 한 장에서 한 번만 쓴다. */
  function reducePairBundles(config) {
    const seed = seedFor(config), bundles = config.gen.bundles || 3, per = config.gen.perBundle || 6;
    const count = bundles * per;
    const pairs = [], values = new Set(), easyLimit = Math.floor(count * 0.1);
    let easy = 0;
    for (const item of reduceItems(seed)) {
      if (pairs.length >= count) break;
      if (gcd(item.s, item.d) === 1) continue;
      const value = textOf(item.s, item.d);
      if (values.has(value)) continue;
      if (isEasyReduce(item)) {
        if (easy >= easyLimit) continue;
        easy++;
      }
      values.add(value);
      pairs.push([fracHTML(item.s, item.d), valueHTML(item.s, item.d)]);
    }
    if (pairs.length !== count) {
      throw Error(config.typeId + ': 정리 전후 짝 ' + count + '쌍 중 ' + pairs.length + '쌍만 있습니다.');
    }
    return bundleize(pairs, bundles, per, random(seed ^ 0x5bf03635));
  }

  const cache = new Map();
  function build(config) {
    const kind = kindOf(config), seed = seedFor(config);
    const count = config.count || (config.cols * config.rows) || 0;
    const cap = COUNT_CAP[kind];
    if (cap && count > cap) throw Error(config.typeId + ': 이 유형은 한 장에 ' + cap + '문항까지입니다.');
    const sumValue = item => textOf(item.s, item.d);
    const mixedValue = item => item.w + ' ' + item.n + '/' + item.d;
    switch (kind) {
      case 'picture':
      case 'pictureBlank':
        return take(unitItems(seed), count, isEasyUnit, sumValue).sort(cmpUnit);
      case 'bond': {
        // 빈칸은 관계도 전체(1) · 한 부분(1) · 두 부분(2)을 번갈아 둔다.
        return take(unitItems(seed), count, isEasyUnit, sumValue).sort(cmpUnit).map((item, index) => Object.assign({}, item, {
          blanks: [['whole'], ['left'], ['right'], ['left', 'right']][index % 4]
        }));
      }
      case 'split':
      case 'join':
      case 'compose':
        return take(mixedItems(seed), count, isEasyMixed, mixedValue).sort(cmpMixed);
      case 'reduceSteps':
        // 인쇄되는 첫 분수(s/d)가 고유하고 실제 약분이 필요한 문항만 쓴다.
        return take(uniquePrintedFractions(reduceItems(seed).filter(item => gcd(item.s, item.d) > 1)),
          count, isEasyReduce).sort(cmpUnit);
      case 'reduceAnswer':
        return take(uniquePrintedFractions(reduceItems(seed).filter(item => gcd(item.s, item.d) > 1)),
          count, isEasyReduce).sort(cmpUnit).map(item => Object.assign({}, item, {
          value: textOf(item.s, item.d), gcd: gcd(item.s, item.d)
        }));
      case 'unitPairs':
        return unitPairBundles(config);
      case 'reducePairs':
        return reducePairBundles(config);
      default:
        throw Error('묶음 1-1-0 의 유형이 아닙니다: ' + config.typeId);
    }
  }
  function generate(config) {
    const key = [config.typeId, kindOf(config), seedFor(config), config.count].join('|');
    if (cache.has(key)) return cache.get(key);
    const built = build(config);
    cache.set(key, built);
    return built;
  }
  const isOurs = config => !!(config && config.typeId && entries.some(entry => entry.typeId === config.typeId));

  /* ================================================================= 서식 그리기 */
  function css() {
    if (typeof document === 'undefined' || document.getElementById('ko110-styles')) return;
    const style = document.createElement('style');
    style.id = 'ko110-styles';
    style.textContent = [
      '.ko110-stack{display:flex;flex-direction:column;justify-content:center;gap:2mm;height:100%;'
        + 'width:fit-content;margin:0 auto}',
      '.ko110-barline{display:flex;align-items:center;gap:1.2mm;height:11mm}',
      // 연산 기호 자리를 고정 폭으로 두어 막대·빈칸이 줄마다 같은 곳에서 시작하게 한다.
      '.ko110-stack .ko110-op{flex:none;width:5.5mm;text-align:center;margin:0}',
      '.ko110-answerline{height:17mm}',      // 분수 빈칸(분자·분모 두 칸)이 들어가는 줄
      '.ko110-op{color:#333;margin:0 .25em}',
      '.ko110-bar{display:block;width:46mm;height:10mm}',
      '.ko110-eq{flex:1;display:flex;align-items:center;gap:1mm}',
      '.ko110-frac{display:inline-flex;flex-direction:column;align-items:center;text-align:center;line-height:1;',
      'vertical-align:middle;font-variant-numeric:tabular-nums;margin:0 .15em}',
      '.ko110-frac>span{display:block;padding:0 .18em;min-width:.9em}',
      '.ko110-frac>span:first-child{border-bottom:.12em solid #111;padding-bottom:.06em}',
      '.ko110-frac>span:last-child{padding-top:.06em}',
      '.ko110-mixed{display:inline-flex;align-items:center}',
      '.ko110-mixed>.ko110-whole{margin-right:.15em}',
      '.ko110-mixed>.ko110-whole{font-size:1em}',
      '.ko110-whole{font-variant-numeric:tabular-nums}',
      '.ko110-answer{color:' + ANSWER_INK + '}',
      '.ko110-box{display:inline-block;width:11mm;height:6.4mm;border:1px solid #555;border-radius:1mm;vertical-align:middle}',
      '.ko110-wide{width:20mm}',
      '.ko110-numbox{display:inline-block;min-width:5.5mm;height:1em;border:1px solid #555;border-radius:.6mm}',
      '.ko110-fracblank{display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;margin:0 .15em}',
      '.ko110-fracblank>span{display:block;width:7.5mm;height:1.2em;border:1px solid #555;border-radius:.6mm}',
      '.ko110-fracblank>span:first-child{border-bottom:0;border-radius:.6mm .6mm 0 0}',
      '.ko110-fracblank>span:last-child{border-top:0;border-radius:0 0 .6mm .6mm;border-top:.12em solid #111}',
      '.ko110-fracblank>span.ko110-fixednum{height:1.25em;width:7.5mm;text-align:center;line-height:1.25em;border:0;'
        + 'border-top:.12em solid #111}',
      '.ko110-divfrac{display:inline-flex;flex-direction:column;align-items:center;text-align:center;line-height:1.15;'
        + 'vertical-align:middle;margin:0 .15em}',
      '.ko110-divfrac>span:first-child{border-bottom:.12em solid #111;padding:0 .2em .1em}',
      '.ko110-divfrac>span:last-child{padding:.1em .2em 0}',
      '.ko110-bond{position:relative;width:100%;max-width:54mm;height:30mm;margin:0 auto}',
      '.ko110-bond-svg{position:absolute;inset:0;width:100%;height:100%}',
      '.ko110-bbox{position:absolute;width:36%;height:12.5mm;border:1px solid #666;border-radius:1mm;background:#fff;',
      'display:flex;align-items:center;justify-content:center;font-variant-numeric:tabular-nums}',
      '.ko110-bwhole{top:0;left:50%;transform:translateX(-50%)}',
      '.ko110-bleft{bottom:0;left:20%;transform:translateX(-50%)}',
      '.ko110-bright{bottom:0;left:80%;transform:translateX(-50%)}',
      '.ko110-line{display:flex;align-items:center;white-space:nowrap;line-height:1.1;min-width:0}',
       '.ko110-pairs{position:relative;width:100%;height:100%;min-height:0}',
      '.ko110-p2{position:relative;width:56.6mm;height:100%;margin:0 auto}',
      '.ko110-p2rows{position:absolute;inset:0;display:grid}',
      '.ko110-p2row{display:flex;align-items:center;white-space:nowrap}',
      '.ko110-p2l{display:flex;align-items:center;width:22.6mm;flex:none}',
      '.ko110-p2t{flex:1;display:flex;justify-content:flex-end;padding-right:1mm}',
      '.ko110-p2g{width:14mm;flex:none}',
      '.ko110-p2r{display:flex;align-items:center;width:20mm;flex:none}',
      '.ko110-p2t2{flex:1;padding-left:1.2mm;display:flex}',
      '.ko110-p2 .ko110-pdot{background:#222;border:0;width:2.6mm;height:2.6mm}',
       '.ko110-pgrid{position:absolute;inset:0;display:grid;grid-template-columns:44% 12% 44%;grid-template-rows:minmax(0,1fr)}',
       '.ko110-pcol{display:grid;min-width:0;min-height:0;align-content:stretch;grid-template-rows:repeat(6,minmax(0,1fr))}',
      '.ko110-prow{display:flex;align-items:center;min-width:0;height:100%;overflow:hidden;white-space:nowrap;gap:1.5mm}',
      '.ko110-pidx{color:#555;font-size:9pt;flex:none;min-width:5mm}',
      '.ko110-ptext{flex:1;min-width:0;display:flex;align-items:center}',
      '.ko110-pdot{flex:none;width:2.6mm;height:2.6mm;border:.35mm solid #333;border-radius:50%}',
      '.ko110-prow-right .ko110-pdot{margin-left:auto}',
      '.ko110-prow-right .ko110-ptext{justify-content:flex-end}',
      '.ko110-plines{position:absolute;inset:0;pointer-events:none}',
      '.ko110-plines svg{width:100%;height:100%;display:block}',
       '.ko110-plines line{stroke:' + ANSWER_INK + ';stroke-width:1.6;vector-effect:non-scaling-stroke}',
       'body[data-format="ko110-unit-pairs"] .sheet-cell>.sheet-number,',
       'body[data-format="ko110-reduce-pairs"] .sheet-cell>.sheet-number{display:none}',
       // 문제·정답 머리말의 유형 이름과 정답 표기가 모두 보이게 여백과 글자 크기를 맞춘다.
       'body[data-format^="ko110-"] .sheet-head{gap:2mm}',
       'body[data-format^="ko110-"] .sheet-head .sheet-title{font-size:8pt;letter-spacing:-.025em}',
       'body[data-format^="ko110-"] .sheet-head .sheet-field{min-width:19mm;font-size:8pt}'
    ].join('');
    document.head.appendChild(style);
  }

  /** 그림 두 묶음을 합쳐 수 쓰기 — 묶음 둘 + 합한 수 자리 */
  function renderPicture(cell, item, answer) {
    css();
    cell.insertAdjacentHTML('beforeend',
      '<div class="ko110-stack">'
      + '<div class="ko110-barline">' + opHTML('') + barHTML(solidCells(item.d, item.n)) + '</div>'
      + '<div class="ko110-barline">' + opHTML('+') + barHTML(solidCells(item.d, item.m), '#c4dfb8') + '</div>'
      + '<div class="ko110-barline ko110-answerline">' + opHTML('=') + '<span class="ko110-eq">'
      + (answer ? fracHTML(item.s, item.d, true) : fracBlankHTML()) + '</span></div>'
      + '</div>');
  }
  /** 수 모형의 빈칸 채우기 — 한 막대에 두 묶음을 차례로 표시하고 분자 세 자리를 비운다 */
  function renderPictureBlank(cell, item, answer) {
    css();
    const cells = solidCells(item.d, item.n);
    for (let i = 0; i < item.m; i++) cells[item.n + i] = 'shade';
    const numerator = (value) => (answer
      ? '<span class="ko110-frac"><span class="ko110-answer">' + esc(value) + '</span><span>' + esc(item.d) + '</span></span>'
      : numBlankHTML(item.d));
    cell.insertAdjacentHTML('beforeend',
      '<div class="ko110-stack">'
      + '<div class="ko110-barline">' + barHTML(cells) + '</div>'
      + '<div class="ko110-barline">' + numerator(item.n) + opHTML('+') + numerator(item.m) + opHTML('=')
      + numerator(item.s) + '</div>'
      + '</div>');
  }
  /** 모으기 관계도 — 위(전체) 하나, 아래(부분) 둘. blanks 에 든 자리를 비운다 */
  function renderBond(cell, item, answer) {
    css();
    const slot = (which, value) => {
      const blanked = item.blanks.indexOf(which) >= 0;
      if (blanked && !answer) return '<div class="ko110-bbox ko110-b' + which + ' ko110-bopen"></div>';
      // 정답지에서는 비워 둔 자리만 붉게 채운다(처음부터 보여 준 값은 검게 둔다).
      return '<div class="ko110-bbox ko110-b' + which + '">' + value(blanked) + '</div>';
    };
    cell.insertAdjacentHTML('beforeend',
      '<div class="ko110-bond">'
      + '<svg class="ko110-bond-svg" viewBox="0 0 200 100" preserveAspectRatio="none" aria-hidden="true">'
      + '<path d="M100 34 V52 M20 52 H180 M20 52 V64 M180 52 V64" fill="none" stroke="#777" stroke-width="1.4"/>'
      + '</svg>'
      + slot('whole', mark => fracHTML(item.s, item.d, mark))
      + slot('left', mark => fracHTML(item.n, item.d, mark))
      + slot('right', mark => fracHTML(item.m, item.d, mark))
      + '</div>');
  }
  /** 대분수를 자연수 부분과 분수 부분으로 나누어 쓰기 */
  function renderSplit(cell, item, answer) {
    css();
    cell.insertAdjacentHTML('beforeend',
      '<div class="ko110-line">' + mixedHTML(item.w, item.n, item.d)
      + opHTML('=') + (answer ? '<span class="ko110-whole ko110-answer">' + item.w + '</span>' : boxHTML())
      + opHTML('+') + (answer ? fracHTML(item.n, item.d, true) : fracBlankHTML())
      + '</div>');
  }
  /** 자연수 부분과 분수 부분을 합쳐 대분수로 쓰기 */
  function renderJoin(cell, item, answer) {
    css();
    cell.insertAdjacentHTML('beforeend',
      '<div class="ko110-line">' + '<span class="ko110-whole">' + item.w + '</span>' + opHTML('+') + fracHTML(item.n, item.d)
      + opHTML('=') + (answer ? mixedHTML(item.w, item.n, item.d, true) : '<span class="ko110-box ko110-wide"></span>')
      + '</div>');
  }
  /** 대분수 구성식의 빈칸 채우기 — □ + □/d = 대분수 */
  function renderCompose(cell, item, answer) {
    css();
    cell.insertAdjacentHTML('beforeend',
      '<div class="ko110-line">' + (answer ? '<span class="ko110-whole ko110-answer">' + item.w + '</span>' : boxHTML())
      + opHTML('+') + (answer ? '<span class="ko110-frac"><span class="ko110-answer">' + item.n + '</span><span>' + item.d + '</span></span>'
        : numBlankHTML(item.d))
      + opHTML('=') + mixedHTML(item.w, item.n, item.d)
      + '</div>');
  }
  /** 약분하는 과정 — s/d = (s÷g)/(d÷g) = □/□ */
  function renderReduceSteps(cell, item, answer) {
    css();
    const g = gcd(item.s, item.d), [rn, rd] = reduce(item.s, item.d);
    const division = '<span class="ko110-divfrac"><span>' + item.s + opHTML('÷') + g + '</span><span>'
      + item.d + opHTML('÷') + g + '</span></span>';
    cell.insertAdjacentHTML('beforeend',
      '<div class="ko110-line">' + fracHTML(item.s, item.d) + opHTML('=') + division + opHTML('=')
      + (answer ? fracHTML(rn, rd, true) : fracBlankHTML())
      + '</div>');
  }
  /** 기약분수까지 약분하기 — 결과를 정리해 쓴다 */
  function renderReduceAnswer(cell, item, answer) {
    css();
    cell.insertAdjacentHTML('beforeend',
      '<div class="ko110-line">' + fracHTML(item.s, item.d) + opHTML('=')
      + (answer ? valueHTML(item.s, item.d, true) : '<span class="ko110-box ko110-wide"></span>')
      + '</div>');
  }
  /** 연결하기 — 왼쪽 번호는 문항 번호, 오른쪽 번호는 그 줄의 순서(짝을 알려 주지 않는다) */
  function renderPairs(cell, bundle, answer) {
    css();
    // 동그라미를 분수 바로 옆에 붙인 고정 폭 배치: 한 줄 = 왼쪽(번호·분수·점) + 간격 + 오른쪽(점·분수). 오른쪽 순서는 섞여 있다.
    const count = bundle.pairs.length, D = bundle.dims || {}, L = D.L || 22.6, G = D.G || 14, R = D.R || 20, TOTAL = L + G + R;
    const wL = ' style="width:' + L + 'mm"', wG = ' style="width:' + G + 'mm"', wR = ' style="width:' + R + 'mm"';
    const rowOf = [];
    bundle.order.forEach((pairIndex, row) => { rowOf[pairIndex] = row; });
    const rows = bundle.pairs.map((pair, index) =>
      '<div class="ko110-p2row"><span class="ko110-p2l"' + wL + '><span class="ko110-pidx">' + (index + 1) + '.</span>'
      + '<span class="ko110-p2t">' + pair[0] + '</span><span class="ko110-pdot"></span></span>'
      + '<span class="ko110-p2g"' + wG + '></span>'
      + '<span class="ko110-p2r"' + wR + '><span class="ko110-pdot"></span><span class="ko110-p2t2">' + bundle.pairs[bundle.order[index]][1] + '</span></span></div>').join('');
    const x1 = ((L - 1.3) / TOTAL * 1000).toFixed(1), x2 = ((L + G + 1.3) / TOTAL * 1000).toFixed(1);
    const lines = answer
      ? '<div class="ko110-plines"><svg viewBox="0 0 1000 1000" preserveAspectRatio="none">'
        + bundle.pairs.map((unused, index) => '<line x1="' + x1 + '" y1="'
          + ((index + .5) / count * 1000).toFixed(1) + '" x2="' + x2 + '" y2="' + ((rowOf[index] + .5) / count * 1000).toFixed(1) + '"/>').join('')
        + '</svg></div>'
      : '';
    cell.insertAdjacentHTML('beforeend',
      '<div class="ko110-p2" style="width:' + TOTAL + 'mm"><div class="ko110-p2rows" style="grid-template-rows:repeat(' + count + ',minmax(0,1fr))">' + rows + '</div>' + lines + '</div>');
  }

  /* ================================================================= 연결 */
  if (root.SheetGen && typeof root.SheetGen.generate === 'function' && !root.SheetGen.ko110) {
    const base = root.SheetGen.generate;
    root.SheetGen.generate = function (config) {
      if (isOurs(config)) return generate(config);
      return base.apply(this, arguments);
    };
    root.SheetGen.ko110 = true;
  }
  if (root.Sheet && typeof root.Sheet.register === 'function') {
    const install = (format, render) => {
      try { root.Sheet.register(format, render); }
      catch (error) { console.warn('g1-1-0 서식 등록 실패: ' + format, error); }
    };
    install(FMT.picture, (cell, item, answer) => renderPicture(cell, item, answer));
    install(FMT.pictureBlank, (cell, item, answer) => renderPictureBlank(cell, item, answer));
    install(FMT.bond, (cell, item, answer) => renderBond(cell, item, answer));
    install(FMT.split, (cell, item, answer) => renderSplit(cell, item, answer));
    install(FMT.join, (cell, item, answer) => renderJoin(cell, item, answer));
    install(FMT.compose, (cell, item, answer) => renderCompose(cell, item, answer));
    install(FMT.reduceSteps, (cell, item, answer) => renderReduceSteps(cell, item, answer));
    install(FMT.reduceAnswer, (cell, item, answer) => renderReduceAnswer(cell, item, answer));
    install(FMT.unitPairs, (cell, bundle, answer) => renderPairs(cell, bundle, answer));
    install(FMT.reducePairs, (cell, bundle, answer) => renderPairs(cell, bundle, answer));
  }
  if (Array.isArray(root.SheetCatalog)) root.SheetCatalog.push(...entries);

  root.Ko110Sheet = {
    concepts: CONCEPTS, entries, formats: FMT, generate, build, textOf, reduce, unitItems, reduceItems, mixedItems,
    /** 검수용: 개념 조건·정답·중복·결정성을 스스로 다시 확인한다. */
    selfTest(seeds) {
      const report = { sheets: 0, items: 0, units: 0, reduced: 0, mixed: 0, pairs: 0 };
      for (const seed of seeds || [1, 7, 42]) {
        for (const entry of entries) {
          const items = generate(Object.assign({}, entry, { seed }));
          const kind = entry.gen.kind;
          report.sheets++;
          if (kind === 'unitPairs' || kind === 'reducePairs') {
            const flat = items.flatMap(bundle => bundle.pairs);
            if (flat.length !== entry.gen.bundles * entry.gen.perBundle) throw Error(entry.typeId + ': 연결 쌍이 ' + flat.length + '개입니다.');
            if (kind === 'unitPairs') {
              const values = new Set();
              for (const pair of flat) {
                const key = pair[0].replace(/[^0-9+]/g, '') + '|' + pair[1].replace(/[^0-9+]/g, '');
                if (values.has(key)) throw Error(entry.typeId + ': 같은 값이 두 번 나옵니다.');
                values.add(key);
              }
            }
            report.pairs += flat.length;
            continue;
          }
          if (items.length !== entry.count) throw Error(entry.typeId + ': 문항 수가 ' + items.length + '개입니다.');
          if (kind === 'split' || kind === 'join' || kind === 'compose') {
            for (const item of items) {
              if (!(item.n < item.d && item.n >= 1 && gcd(item.n, item.d) === 1 && item.w >= 1)) {
                throw Error(entry.typeId + ': 대분수 조건 위반 ' + item.w + ' ' + item.n + '/' + item.d);
              }
            }
            report.mixed += items.length;
          } else {
            for (const item of items) {
              if (item.s < 1 || item.n < 1 || item.m < 1) throw Error(entry.typeId + ': 항이 0입니다.');
              const sum = item.n + item.m;
              if (sum !== item.s) throw Error(entry.typeId + ': 합이 틀립니다.');
              const needs = gcd(item.s, item.d) > 1 || item.s > item.d;
              if (kind === 'picture' || kind === 'pictureBlank' || kind === 'bond') {
                if (item.s >= item.d || gcd(item.s, item.d) !== 1) {
                  throw Error(entry.typeId + ': 결과가 단위 그대로가 아닙니다 ' + item.s + '/' + item.d);
                }
                report.units++;
              } else {
                if (item.s === item.d || !needs) throw Error(entry.typeId + ': 정리가 필요 없는 문항입니다 ' + item.s + '/' + item.d);
                report.reduced++;
              }
            }
          }
          report.items += items.length;
        }
      }
      return report;
    }
  };
})(globalThis);
