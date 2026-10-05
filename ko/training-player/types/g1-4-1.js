/* 묶음 1-4-1 — 분수 ÷ 자연수 (진분수 · 가분수 · 대분수) 문제지
   prototypes/training-roadmap-20261001/worksheet-types.json 의 개념 1-4-1-0 ~ 1-4-1-3 과
   spec/spec-fraction.json 의 typeId 16개를 이 파일 하나로 만든다.

   - 문제 수치는 사이트의 기존 생성기(Worksheets.generate)가 낸 것을 쓴다.
     새 문제 엔진을 만들지 않는다. 조건에 맞지 않는 문항은 버리고 더 뽑는다.
   - 정답은 기존 생성기의 정답과 겹쳐 확인한다(다르면 생성 실패로 알린다).
   - 같은 typeId · 같은 seed → 같은 문제지.
   - 공용 파일(sheet.js, formats-*.js, catalog.js)은 고치지 않는다.
     서식은 Sheet.register, 유형은 SheetCatalog.push 로만 붙인다.

   2026-10-02 검수 반영 (review\1-4-1-B-r1.md · C-r1.md · D-r1.md)
     B1·C1  연결하기 오른쪽 번호를 '그 줄에 놓인 순서'로 찍어 계산하지 않고 짝을 찾지 못하게 하고,
            같은 줄끼리 이어지는 쌍(고정점)을 없앴다.
     C2·C3  답을 쓰는 자리(밑줄·빈칸 상자) 높이를 분수 높이에 맞추고 가운데/아래로 맞춰
            밑줄·상자 테두리가 분자를 가로지르지 않게 했다.
     C4·D7  머리말 제목에 개념 조건을 넣고(나눔/역수 곱 → 나누어떨어짐/나누어떨어지지 않음),
            이 묶음 쪽에서만 머리말 간격·보조 글자를 줄여 '· 정답'까지 한 줄에 들어가게 했다.
     C5     오류 이름표를 두 줄까지 접어 쓴다(잘려서 뜻이 사라지지 않게).
     D1     개념마다 문제 풀을 만들어 유형끼리 다른 몫을 나눠 준다(같은 문항 되풀이 방지).
     D2·D3  나누는 수(÷2~÷9)와 분모(2~12)를 고르게 섞어 뽑는다(쉬운 것부터 퍼지게).
     D4     기약분수가 아닌 분수는 문제 수로 쓰지 않는다.
     D5     중간식을 보여 주는 서식(t2·t4)은 그 식을 그대로 계산한 값이 답이 되는 문항만 쓴다.
     D6     1-4-1-0 고치기는 이 개념에서 배우는 풀이(분자만 나누기)와 견줄 수 있는 오류만 쓴다.

   2026-10-02 2회차 검수 반영 (review\1-4-1-C-r2.md · D-r2.md)
     C  홑분수의 세로 위치를 줄 가운데로 맞췄다(vertical-align:-.42em → middle). 이제 대분수 안의
        분수·빈칸 상자·정답 자리와 같은 높이라 한 문항 안에서 분수 높이가 갈리지 않는다.
     D  1-4-1-0-t4 의 오류가 자리 바꿈 하나뿐이던 것을 이 개념에서 실제로 나오는 둘로 늘렸다 —
        자리 바꿈 + '나누지 않고 그대로 곱함'(kindId multiply-divisor). 12문항이 6+6으로 나뉜다.
        (명세 spec\spec-fraction.json 의 1-4-1-0-t4 errorKinds 3종은 이 개념에 쓸 수 없는 값이라
         이 파일의 두 종류가 이 개념의 실제 오류 목록이다. 명세 수정은 이 작업 범위 밖이다.)

   서식 넷 (한 장 = 한 유형, 전부 가로셈):
     fd-fraction-horizontal         가로식으로 계산하기
     fd-fraction-step               단계별 계산의 빈칸 채우기
     fd-fraction-match              계산 결과와 같은 분수 연결하기 (3묶음 × 8쌍)
     fd-fraction-error-correction   잘못된 계산 과정 고치기 (3단 × 4줄)
*/
(function (root) {
  'use strict';

  const ANSWER_INK = '#d71f10';
  const CIRCLED = '①②③④⑤⑥⑦⑧⑨⑩';

  /* ------------------------------------------------------------------ 기본 도구 */
  const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
  function reduce(n, d) { const g = gcd(n, d) || 1; return [n / g, d / g]; }
  const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // formats-matching.js · formats-fraction.js 와 같은 난수기. 같은 seed → 같은 문제.
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
  function shuffle(list, rnd) {
    const out = list.slice();
    for (let i = out.length - 1; i > 0; i--) { const j = rnd(0, i); const tmp = out[i]; out[i] = out[j]; out[j] = tmp; }
    return out;
  }
  /** 0, ½, ¼, ¾ … 처럼 퍼지는 순서 — 한 무리 안에서 쉬운 것과 어려운 것을 고르게 섞는다. */
  function vanDerCorput(index) {
    let value = 0, fraction = .5, rest = index;
    while (rest > 0) { value += fraction * (rest & 1); rest >>= 1; fraction /= 2; }
    return value;
  }

  /* ------------------------------------------------------------- 분수 표시(HTML) */
  const fracParts = (topHTML, bottomHTML) => `<span class="fd-frac"><span>${topHTML}</span><span>${bottomHTML}</span></span>`;
  const fracHTML = (n, d) => fracParts(esc(n), esc(d));
  const mixedHTML = (whole, n, d) => `<span class="fd-mixed"><span class="fd-whole">${esc(whole)}</span>${fracHTML(n, d)}</span>`;
  const OP = op => `<span class="fd-op">${op}</span>`;
  /** {n, d} 기약분수를 기약분수 또는 대분수로 그린다. */
  function valueHTML(value) {
    if (value.d === 1) return `<span class="fd-whole">${value.n}</span>`;
    if (value.n > value.d) { const whole = Math.floor(value.n / value.d); return mixedHTML(whole, value.n - whole * value.d, value.d); }
    return fracHTML(value.n, value.d);
  }
  const valueText = value => value.d === 1 ? String(value.n)
    : value.n > value.d ? `${Math.floor(value.n / value.d)} ${value.n % value.d}/${value.d}` : `${value.n}/${value.d}`;
  function operandHTML(q) { return q.form === 'mixed' ? mixedHTML(q.whole, q.n, q.d) : fracHTML(q.n, q.d); }
  const reciprocalHTML = w => fracHTML(1, w);

  /* ------------------------------------------------------------- 개념 정의 */
  // form: 진분수 proper · 가분수 improper · 대분수 mixed   divisible: 분자가 나누어떨어지는가
  const CONCEPTS = {
    '1-4-1-0': { id: '1-4-1-0', form: 'proper', legacy: 'fraction-div-proper-whole', divisible: true },
    '1-4-1-1': { id: '1-4-1-1', form: 'proper', legacy: 'fraction-div-proper-whole', divisible: false },
    '1-4-1-2': { id: '1-4-1-2', form: 'improper', legacy: 'fraction-div-improper-whole' },
    '1-4-1-3': { id: '1-4-1-3', form: 'mixed', legacy: 'fraction-div-mixed-whole' }
  };
  const ERROR_KINDS = {
    // 1-4-1-0 은 분자만 나누는 풀이를 배우는 개념이라 역수 이야기가 나오는 오류는 쓰지 않는다(D6).
    // 이 개념은 문제 수가 모두 기약분수라 분모를 나누는 오류(d % w == 0)를 만들 수 없다
    // (w | n 이면서 w | d 이면 w | gcd(n, d) = 1 이어야 해 모순).
    // 그래서 이 개념에서 실제로 나오는 오류 둘을 쓴다(D 2회차) — 나누지 않고 그대로 곱하기,
    // 나누는 수와 나뉘는 수를 바꾸어 계산하기. 한 장에 두 오류가 6+6으로 함께 보인다.
    '1-4-1-0': ['swap-operands', 'multiply-divisor'],
    '1-4-1-1': ['no-reciprocal', 'dividend-reciprocal', 'swap-operands'],
    '1-4-1-2': ['no-reciprocal', 'dividend-reciprocal', 'swap-operands'],
    '1-4-1-3': ['no-reciprocal', 'dividend-reciprocal', 'mixed-not-improper']
  };
  const ERROR_LABEL = {
    'no-reciprocal': '역수를 곱하지 않음',
    'multiply-divisor': '나누지 않고 그대로 곱함',
    'dividend-reciprocal': '나뉘는 분수의 역수를 사용함',
    'swap-operands': '나누는 수와 나뉘는 수를 바꾸어 계산함',
    'divide-denominator': '분자를 나누지 않고 분모를 나눔',
    'mixed-not-improper': '대분수를 가분수로 바꾸지 않음'
  };

  /* --------------------------------------------------- 기존 생성기에서 문항 뽑기 */
  /** "1 1/2" · "7/4" · "3/4" · "3" 을 {whole, n, d} 로 읽는다. */
  function parseOperand(text) {
    const s = String(text).trim();
    if (s.includes(' ')) { const [whole, rest] = s.split(/\s+/); const [n, d] = rest.split('/').map(Number); return { whole: Number(whole), n, d }; }
    if (s.includes('/')) { const [n, d] = s.split('/').map(Number); return { whole: 0, n, d }; }
    return { whole: Number(s), n: 0, d: 1 };
  }
  /** 기존 생성기가 낸 한 줄을 이 묶음의 조건에 맞는 문항으로 바꾼다. 맞지 않으면 null. */
  function toQuestion(concept, row) {
    if (row.op !== '÷') return null;
    const w = Number(row.b);
    if (!Number.isInteger(w) || w < 2 || w > 9) return null;                 // 1로 나누기는 훈련 가치가 없어 뺀다
    const a = parseOperand(row.a);
    if (!Number.isInteger(a.n) || !Number.isInteger(a.d) || a.d < 2 || a.d > 12) return null;
    if (gcd(a.n, a.d) !== 1) return null;                                    // 기약분수만 문제 수로 쓴다(D4)
    if (concept.form === 'proper' && (a.whole || a.n < 1 || a.n >= a.d)) return null;
    if (concept.form === 'improper' && (a.whole || a.n < a.d || a.n > 10 * a.d - 1)) return null;
    if (concept.form === 'mixed' && (!(a.whole >= 1 && a.whole <= 9) || a.n < 1 || a.n >= a.d)) return null;
    if (concept.divisible === true && a.n % w !== 0) return null;
    if (concept.divisible === false && a.n % w === 0) return null;
    const num = a.whole * a.d + a.n;                                         // 가분수로 바꾼 분자
    const [an, ad] = reduce(num, a.d * w);                                   // (num/d) ÷ w
    if (ad > 100) return null;                                               // 답의 분모는 초등 범위(100 이하)로 둔다
    const text = ad === 1 ? String(an) : `${an}/${ad}`;
    if (text !== String(row.answer)) throw Error(`기존 생성기 정답과 다릅니다: ${row.a} ÷ ${row.b} → ${row.answer} (다시 계산 ${text})`);
    return {
      conceptId: concept.id, form: concept.form, whole: a.whole, n: a.n, d: a.d, w,
      num, answer: { n: an, d: ad }, key: `${row.a}÷${w}`,
      // clear: 문제에 보여 주는 중간식(num/d × 1/w)이 약분 없이 그대로 답이 되는가(D5)
      clear: concept.divisible === true || gcd(num, w) === 1,
      rank: a.d * 2 + w * 3 + a.whole * 4 + a.n
    };
  }
  function legacyGenerator() {
    const generator = root.FractionLegacyGenerate || (root.Worksheets && root.Worksheets.generate);
    if (typeof generator !== 'function') throw Error('기존 Worksheets 생성기를 찾지 못했습니다.');
    return generator;
  }
  const rankCompare = (x, y) => x.rank - y.rank || String(x.key).localeCompare(String(y.key));
  const byRank = list => list.slice().sort(rankCompare);

  /* 문제 풀 — 한 개념에서 조건을 만족하는 문항을 전부 모아 두고 유형끼리 나눠 쓴다. */
  const POOL_BATCHES = 1200;
  const POOL_CACHE = new Map();
  const SHARE_CACHE = new Map();
  const TYPE_KEYS = ['t1', 't2', 't3', 't4'];
  // 유형별로 나눠 줄 몫 — 자동 맞춤이 줄 수를 늘려도 뽑기 순서가 흔들리지 않게 넉넉히 잡는다.
  const SHARE_CAPS = { t1: 36, t2: 30, t3: 24, t4: 15 };
  // 중간식을 그대로 보여 주는 t2·t4 는 그 식의 값이 답과 같은 표기로 나오는 문항만 쓴다(D5).
  const SHARE_FILTER = { t1: null, t2: q => q.clear, t3: null, t4: q => q.clear };
  // 겹침을 견줄 기준 — 자동 맞춤 전 기본 배치에서 보이는 문항 수(작은 쪽)로 나눠 견준다.
  // 몫을 다 채운 뒤에는 겹치는 문항이 뒤로 밀리므로, 앞에서 보이는 문항끼리 겹침이 먼저 줄어든다.
  const SHARE_BASE = { t1: 24, t2: 20, t3: 24, t4: 12 };
  const PAIR_MIN_CAP = {};
  for (const a of TYPE_KEYS) for (const b of TYPE_KEYS) if (a < b) PAIR_MIN_CAP[a + '|' + b] = Math.min(SHARE_BASE[a], SHARE_BASE[b]);
  const pairKeyOf = (a, b) => (a < b ? a + '|' + b : b + '|' + a);

  /** 뽑기 순서: 나누는 수 무리끼리 번갈아, 무리 안에서는 쉬운 것부터 고르게 퍼지게. */
  function spreadOrder(list) {
    const groups = new Map();
    for (const q of list) { if (!groups.has(q.w)) groups.set(q.w, []); groups.get(q.w).push(q); }
    const keys = Array.from(groups.keys()).sort((x, y) => x - y);
    const queues = [];
    keys.forEach((w, position) => {
      const flat = byRank(groups.get(w));
      const order = flat.map((_, i) => i).sort((x, y) => vanDerCorput(x) - vanDerCorput(y) || x - y);
      const group = order.map(i => flat[i]);
      // 나누는 수 무리마다 시작 자리를 달리한다 — 그러지 않으면 한 바퀴(무리마다 하나씩)가
      // 모두 같은 피제수(가장 쉬운 것)로 채워져 한 장이 같은 모양으로 반복된다.
      const shift = group.length ? Math.round(group.length * position / keys.length) % group.length : 0;
      queues.push(group.slice(shift).concat(group.slice(0, shift)));
    });
    const out = [];
    let moved = true;
    while (moved) {
      moved = false;
      for (const queue of queues) { const q = queue.shift(); if (q) { out.push(q); moved = true; } }
    }
    return out;
  }
  function poolOf(concept, seed) {
    const cacheKey = concept.id + '|' + seed;
    if (!POOL_CACHE.has(cacheKey)) {
      const generator = legacyGenerator();
      const found = new Map();
      for (let batch = 0; batch < POOL_BATCHES; batch++) {
        let rows;
        // 문제 풀은 seed 와 상관없이 같은 순서로 모은다 — 유형끼리 나눠 쓰는 몫이 seed 마다 흔들리면
        // 같은 개념의 유형들이 결국 같은 문항을 쓰게 되기 때문이다(D1).
        try { rows = generator(concept.legacy, (Math.imul(batch, 104729) + 1) >>> 0, 48); }
        catch (error) { throw Error(`기존 생성기 실패(${concept.legacy}): ${error.message}`); }
        for (const row of rows) { const q = toQuestion(concept, row); if (q && !found.has(q.key)) found.set(q.key, q); }
      }
      const list = spreadOrder(Array.from(found.values()));
      // 문제 풀이 넉넉한 개념은 seed 마다 시작 자리를 옮겨 새 문제지를 만들 수 있게 한다.
      // 1-4-1-0 처럼 풀이 모자란 개념은 몫이 흔들리면 유형끼리 같은 문항을 쓰게 되어 고정한다.
      // 같은 seed 면 모든 유형이 같은 만큼 옮기므로 유형끼리 나눠 쓰는 몫은 흔들리지 않는다 → 풀이 작아도 seed 마다 옮긴다.
      const rotate = list.length >= 2;
      const shift = rotate && list.length ? (Math.imul((Number(seed) >>> 0) || 1, 2654435761) >>> 0) % list.length : 0;
      POOL_CACHE.set(cacheKey, shift ? list.slice(shift).concat(list.slice(0, shift)) : list);
    }
    return POOL_CACHE.get(cacheKey);
  }
  /** 유형마다 문제 풀에서 다른 몫을 나눠 준다 — 같은 문항을 되풀이하지 않게(D1). */
  function shareOf(concept, seed) {
    const cacheKey = concept.id + '|' + seed + '|share';
    if (SHARE_CACHE.has(cacheKey)) return SHARE_CACHE.get(cacheKey);
    const pool = poolOf(concept, seed);
    const owned = { t1: [], t2: [], t3: [], t4: [] };
    const taken = { t1: new Set(), t2: new Set(), t3: new Set(), t4: new Set() };
    const pairs = new Map();
    const take = (typeKey, index) => {
      owned[typeKey].push(pool[index]);
      taken[typeKey].add(index);
      for (const other of TYPE_KEYS) {
        if (other === typeKey || !taken[other].has(index)) continue;
        const pairKey = pairKeyOf(typeKey, other);
        pairs.set(pairKey, (pairs.get(pairKey) || 0) + 1);
      }
    };
    // 1단계 — 기본 배치에서 보이는 문항(SHARE_BASE)부터 고르게 나눈다.
    for (const typeKey of TYPE_KEYS) {
      const filter = SHARE_FILTER[typeKey];
      const need = Math.min(SHARE_BASE[typeKey], pool.length);
      while (owned[typeKey].length < need) {
        let best = -1, bestScore = Infinity;
        for (let index = 0; index < pool.length; index++) {
          const item = pool[index];
          if (taken[typeKey].has(index)) continue;
          if (filter && !filter(item)) continue;
          let worst = 0, total = 0, count = 0;             // 이 문항을 넣었을 때 상대들과 생기는 겹침
          for (const other of TYPE_KEYS) {
            if (other === typeKey || !taken[other].has(index)) continue;
            const pairKey = pairKeyOf(typeKey, other);
            const share = ((pairs.get(pairKey) || 0) + 1) / PAIR_MIN_CAP[pairKey];
            worst = Math.max(worst, share); total += share; count++;
          }
          // 가장 많이 겹치는 상대부터 낮추고 → 겹치는 상대가 적은 문항 → 겹침 합이 작은 문항 →
          // 마지막은 문제 풀 앞쪽(고르게 퍼진) 문항 순으로 고른다.
          const score = worst * 1e9 + count * 1e6 + total * 1e3 + index;
          if (score < bestScore) { bestScore = score; best = index; }
        }
        if (best < 0) break;                               // 조건에 맞는 문항이 모자란다
        take(typeKey, best);
      }
    }
    // 1단계에서 '다른 유형이 쓰지 않은 문항'을 몫 앞쪽에 두고, 자동 맞춤이 줄 수를 늘렸을 때만
    // 보이는 몫(2단계)은 뒤로 밀어 기본 배치의 겹침을 줄인다.
    const owners = new Map();
    for (const typeKey of TYPE_KEYS) for (const q of owned[typeKey]) {
      if (!owners.has(q.key)) owners.set(q.key, 0);
      owners.set(q.key, owners.get(q.key) + 1);
    }
    for (const typeKey of TYPE_KEYS) owned[typeKey] = owned[typeKey].map((q, i) => ({ q, shared: owners.get(q.key), i }))
      .sort((a, b) => a.shared - b.shared || a.i - b.i).map(rec => rec.q);
    // 2단계 — 남는 몫은 문제 풀 순서대로 뒤에 채운다(이미 나눠 준 문항도 뒤에 붙는다).
    for (const typeKey of TYPE_KEYS) {
      const filter = SHARE_FILTER[typeKey];
      const cap = Math.min(SHARE_CAPS[typeKey], pool.length);
      for (let index = 0; owned[typeKey].length < cap && index < pool.length; index++) {
        if (taken[typeKey].has(index)) continue;
        if (filter && !filter(pool[index])) continue;
        take(typeKey, index);
      }
    }
    SHARE_CACHE.set(cacheKey, owned);
    return owned;
  }
  /** 한 유형이 쓸 문항 목록 — 자기 몫을 먼저, 모자라면 문제 풀의 나머지에서(조건에 맞는 것만). */
  function drawFor(config, typeKey, limit) {
    const concept = conceptOf(config), seed = Number(config.seed) || 0;
    const filter = SHARE_FILTER[typeKey];
    const own = shareOf(concept, seed)[typeKey];
    const out = own.slice(0, limit);
    if (out.length < limit) {
      const keys = new Set(own.map(q => q.key));
      for (const q of poolOf(concept, seed)) {
        if (out.length >= limit) break;
        if (keys.has(q.key)) continue;
        if (filter && !filter(q)) continue;
        keys.add(q.key); out.push(q);
      }
    }
    return out;
  }
  // 예전 검수 도구가 부르는 이름 — 문제 풀에서 같은 조건으로 뽑는다.
  function collect(concept, seed, need, accept) {
    const out = [];
    for (const q of poolOf(concept, Number(seed) || 0)) {
      if (accept && !accept(q)) continue;
      out.push(q);
      if (out.length >= need) break;
    }
    return out;
  }
  function pick(concept, seed, count, accept) {
    const chosen = collect(concept, seed, Math.max(count * 2, count + 12), accept).slice(0, count);
    if (chosen.length < count) throw Error(`${concept.id}: 조건에 맞는 문항이 ${chosen.length}개뿐입니다(${count}개 필요).`);
    return byRank(chosen);
  }

  /* -------------------------------------------------------------- 서식별 문항 만들기 */
  const conceptOf = config => {
    const concept = CONCEPTS[config.gen && config.gen.conceptId];
    if (!concept) throw Error(`묶음 1-4-1: 알 수 없는 개념 ${config.gen && config.gen.conceptId}`);
    return concept;
  };
  const typeKeyOf = config => {
    const key = (config.gen && config.gen.typeKey) || (/-(t\d)$/.exec(String(config.typeId || '')) || [])[1];
    if (!TYPE_KEYS.includes(key)) throw Error(`묶음 1-4-1: 알 수 없는 유형 ${config.typeId}`);
    return key;
  };

  // 1) 가로식으로 계산하기
  function horizontalItems(config) {
    return byRank(drawFor(config, typeKeyOf(config), config.count));
  }
  function renderHorizontal(cell, q, answer) {
    css();
    cell.classList.add('fd-cell', 'fd-horizontal');
    cell.insertAdjacentHTML('beforeend',
      `<div class="fd-line">${operandHTML(q)} ${OP('÷')} ${q.w} ${OP('=')} ` +
      `<span class="fd-answer-space${answer ? ' fd-ink' : ''}">${answer ? valueHTML(q.answer) : ''}</span></div>`);
  }

  // 2) 단계별 계산의 빈칸 채우기 — 한 장 안에서 빈칸 자리와 모양이 같다.
  function stepItems(config) {
    const concept = conceptOf(config);
    return byRank(drawFor(config, typeKeyOf(config), config.count)).map(q => ({ ...q, shape: concept.id }));
  }
  const blankBox = (answer, html, wide) =>
    `<span class="fd-blank${wide ? ' fd-blank-wide' : ''}${answer ? ' fd-ink' : ''}">${answer ? html : ''}</span>`;
  function renderStep(cell, q, answer) {
    css();
    cell.classList.add('fd-cell', 'fd-step');
    let line;
    if (q.shape === '1-4-1-0') {
      // 분자가 나누어떨어질 때: 분자만 나누고 분모는 그대로
      line = `${operandHTML(q)} ${OP('÷')} ${q.w} ${OP('=')} ` +
        `${fracParts(`${q.n} ${OP('÷')} ${q.w}`, blankBox(answer, q.d))} ${OP('=')} ${blankBox(answer, valueHTML(q.answer), true)}`;
    } else if (q.form === 'mixed') {
      // 대분수: 가분수로 바꾼 뒤 역수를 곱한다
      line = `${operandHTML(q)} ${OP('÷')} ${q.w} ${OP('=')} ` +
        `${blankBox(answer, fracHTML(q.num, q.d), true)} ${OP('×')} ${reciprocalHTML(q.w)} ${OP('=')} ${blankBox(answer, valueHTML(q.answer), true)}`;
    } else {
      // 진분수(나누어떨어지지 않음) · 가분수: 나누는 수의 역수를 곱한다
      line = `${operandHTML(q)} ${OP('÷')} ${q.w} ${OP('=')} ` +
        `${operandHTML(q)} ${OP('×')} ${blankBox(answer, reciprocalHTML(q.w), true)} ${OP('=')} ${blankBox(answer, valueHTML(q.answer), true)}`;
    }
    cell.insertAdjacentHTML('beforeend', `<div class="fd-line">${line}</div>`);
  }

  // 3) 계산 결과와 같은 분수 연결하기 — 3묶음 × 8쌍, 한 묶음 안에서 답이 겹치지 않는다.
  function matchItems(config) {
    const concept = conceptOf(config), gen = config.gen || {};
    const bundles = gen.bundles || 3, per = gen.perBundle || 8, total = bundles * per;
    const pool = drawFor(config, typeKeyOf(config), Math.min(poolOf(concept, Number(config.seed) || 0).length, Math.max(total * 4, 96)));
    const used = new Set();
    const groups = [];
    for (let b = 0; b < bundles; b++) {
      const group = [], answers = new Set();
      for (const q of pool) {
        if (group.length >= per) break;
        const value = valueText(q.answer);
        if (used.has(q.key) || answers.has(value)) continue;
        answers.add(value); used.add(q.key); group.push(q);
      }
      if (group.length !== per) throw Error(`연결하기: ${b + 1}묶음에 넣을 문항이 ${group.length}개뿐입니다(${per}개 필요).`);
      groups.push(group);
    }
    const rnd = random((Number(config.seed) || 1) + 5171);
    return groups.map(group => {
      // 같은 자리끼리 이어지지 않게(고정점 제거) 순서를 만든다
      const order = shuffle(group.map((_, i) => i), rnd);
      for (let i = 0; i < order.length; i++) {
        if (order[i] !== i) continue;
        const j = (i + 1) % order.length, tmp = order[i];
        order[i] = order[j]; order[j] = tmp;
      }
      return { kind: 'bundle', pairs: group, order };
    });
  }
  function renderMatch(cell, bundle, answer) {
    css();
    cell.classList.add('fd-cell', 'fd-match');
    const count = bundle.pairs.length;
    const rowOf = [];
    bundle.order.forEach((pairIndex, row) => { rowOf[pairIndex] = row; });
    const left = bundle.pairs.map((q, i) =>
      `<div class="fd-row fd-row-left"><span class="fd-idx">${i + 1}.</span>` +
      `<span class="fd-text">${operandHTML(q)} ${OP('÷')} ${q.w}</span><span class="fd-dot"></span></div>`).join('');
    // 오른쪽 번호는 왼쪽 문항 번호가 아니라 '그 줄에 놓인 순서'다 — 계산해야 짝을 찾을 수 있다(B1·C1).
    const right = bundle.order.map((pairIndex, row) =>
      `<div class="fd-row fd-row-right"><span class="fd-dot"></span><span class="fd-idx">${CIRCLED[row]}</span>` +
      `<span class="fd-text">${valueHTML(bundle.pairs[pairIndex].answer)}</span></div>`).join('');
    const lines = answer
      ? `<div class="fd-lines"><svg viewBox="0 0 1000 1000" preserveAspectRatio="none">` +
        bundle.pairs.map((_, i) => `<line x1="420" y1="${((i + .5) / count * 1000).toFixed(1)}" x2="480" y2="${((rowOf[i] + .5) / count * 1000).toFixed(1)}"/>`).join('') +
        `</svg></div>`
      : '';
    cell.insertAdjacentHTML('beforeend',
      `<div class="fd-pairs-wrap"><div class="fd-pairs" style="--fd-rows:${count}">` +
      `<div class="fd-side fd-side-left">${left}</div><div class="fd-side fd-side-right">${right}</div></div>${lines}</div>`);
  }

  // 4) 잘못된 계산 과정 고치기 — 틀린 풀이 세 줄 + 바르게 고쳐 쓰는 자리
  /** 틀린 풀이 한 벌. 쓸 수 없는 오류 유형이면 null. */
  function errorItem(q, kindId) {
    const a = operandHTML(q), improper = fracHTML(q.num, q.d), reciprocal = reciprocalHTML(q.w);
    const right = q.conceptId === '1-4-1-0'
      ? [`${a} ${OP('÷')} ${q.w}`, `${OP('=')} ${fracParts(`${q.n} ${OP('÷')} ${q.w}`, esc(q.d))}`, `${OP('=')} ${valueHTML(q.answer)}`]
      : [`${a} ${OP('÷')} ${q.w}`, `${OP('=')} ${q.form === 'mixed' ? improper : a} ${OP('×')} ${reciprocal}`, `${OP('=')} ${valueHTML(q.answer)}`];
    let wrongValue, wrong;
    if (kindId === 'no-reciprocal') {
      wrongValue = reduce(q.num * q.w, q.d);
      wrong = [`${a} ${OP('÷')} ${q.w}`, `${OP('=')} ${a} ${OP('×')} ${q.w}`, `${OP('=')} ${valueHTML({ n: wrongValue[0], d: wrongValue[1] })}`];
    } else if (kindId === 'multiply-divisor') {
      // 1-4-1-0 용 — 셈은 '역수를 곱하지 않음'과 같지만 이름표에 역수 이야기를 쓰지 않는다(D6).
      wrongValue = reduce(q.num * q.w, q.d);
      wrong = [`${a} ${OP('÷')} ${q.w}`, `${OP('=')} ${a} ${OP('×')} ${q.w}`, `${OP('=')} ${valueHTML({ n: wrongValue[0], d: wrongValue[1] })}`];
    } else if (kindId === 'dividend-reciprocal') {
      wrongValue = reduce(q.d, q.num * q.w);
      wrong = [`${a} ${OP('÷')} ${q.w}`, `${OP('=')} ${fracHTML(q.d, q.num)} ${OP('×')} ${reciprocal}`, `${OP('=')} ${valueHTML({ n: wrongValue[0], d: wrongValue[1] })}`];
    } else if (kindId === 'swap-operands') {
      wrongValue = reduce(q.w * q.d, q.num);
      wrong = [`${a} ${OP('÷')} ${q.w}`, `${OP('=')} ${q.w} ${OP('÷')} ${a}`, `${OP('=')} ${valueHTML({ n: wrongValue[0], d: wrongValue[1] })}`];
    } else if (kindId === 'divide-denominator') {
      if (q.d % q.w) return null;                                            // 분모가 나누어떨어질 때만 쓸 수 있는 오류
      wrongValue = reduce(q.num, q.d / q.w);
      wrong = [`${a} ${OP('÷')} ${q.w}`, `${OP('=')} ${fracParts(esc(q.n), `${esc(q.d)} ${OP('÷')} ${q.w}`)}`, `${OP('=')} ${valueHTML({ n: wrongValue[0], d: wrongValue[1] })}`];
    } else if (kindId === 'mixed-not-improper') {
      if (q.form !== 'mixed') return null;
      wrongValue = reduce(q.whole * q.d * q.w + q.n, q.d * q.w);
      wrong = [`${a} ${OP('÷')} ${q.w}`, `${OP('=')} ${esc(q.whole)}과 (${fracHTML(q.n, q.d)} ${OP('÷')} ${q.w})`, `${OP('=')} ${valueHTML({ n: wrongValue[0], d: wrongValue[1] })}`];
    } else return null;
    const value = { n: wrongValue[0], d: wrongValue[1] };
    if (value.n * q.answer.d === q.answer.n * value.d) return null;          // 틀린 값과 바른 값이 같으면 오류 문항이 아니다
    return { ...q, kind: kindId, label: ERROR_LABEL[kindId], wrongLines: wrong, rightLines: right };
  }
  function errorItems(config) {
    const concept = conceptOf(config), count = config.count, kinds = ERROR_KINDS[concept.id];
    const pool = drawFor(config, typeKeyOf(config), Math.min(poolOf(concept, Number(config.seed) || 0).length, Math.max(count * 4, 60)));
    const failed = new Set(), used = new Set(), items = [];
    for (let slot = 0; items.length < count && slot < count * 4; slot++) {
      for (let step = 0; step < kinds.length; step++) {
        const kindId = kinds[(slot + step) % kinds.length];
        let source = null, built = null;
        for (const q of pool) {
          if (used.has(q.key) || failed.has(q.key + '|' + kindId)) continue;
          const candidate = errorItem(q, kindId);
          if (candidate) { source = q; built = candidate; break; }
          failed.add(q.key + '|' + kindId);
        }
        if (!built) continue;
        used.add(source.key); items.push(built);
        break;
      }
    }
    if (items.length !== count) throw Error(`${concept.id}: 잘못된 풀이 문항을 ${count}개 만들지 못했습니다(${items.length}개).`);
    return byRank(items);
  }
  function renderError(cell, q, answer) {
    css();
    cell.classList.add('fd-cell', 'fd-error');
    const wrong = q.wrongLines.map((line, index) =>
      `<div class="fd-line${index === 1 && answer ? ' fd-mark' : ''}">${line}</div>`).join('');
    const body = answer
      ? `${q.rightLines.map(line => `<div class="fd-line fd-ink">${line}</div>`).join('')}`
      : `<div class="fd-rule"></div><div class="fd-rule"></div><div class="fd-rule"></div>`;
    cell.insertAdjacentHTML('beforeend',
      `<div class="fd-error-box"><div class="fd-wrong">${wrong}</div>` +
      `<div class="fd-right"><span class="fd-label">바르게</span>${body}</div></div>`);
  }

  /* ------------------------------------------------------------------ 서식 CSS */
  function css() {
    if (document.getElementById('fd-141-style')) return;
    const style = document.createElement('style');
    style.id = 'fd-141-style';
    style.textContent = `
      .fd-cell{padding-top:1.2mm}
      .fd-line{display:block}
      .mt-text .fd-frac{min-width:1em}
      .fd-line{white-space:nowrap;line-height:1.35;text-align:center}
      .fd-op{display:inline-block;margin:0 .12em}
      /* 분수는 줄 가운데에 맞춘다 — 대분수·정답 자리(flex)와 같은 높이가 된다(C 2회차). */
      .fd-frac{display:inline-flex;flex-direction:column;vertical-align:middle;text-align:center;line-height:1.05;min-width:1.15em;font-variant-numeric:tabular-nums}
      .fd-frac>span:first-child{border-bottom:1px solid #111;padding:0 .12em}
      .fd-frac>span:last-child{padding:0 .12em}
      .fd-mixed{display:inline-flex;align-items:center;gap:.1em;margin:0 .06em}
      .fd-ink{color:${ANSWER_INK}}
      /* 답을 쓰는 자리 — 답이 분수(두 줄)라도 밑줄이 글자를 가로지르지 않게 높이를 분수에 맞춘다. */
      .fd-answer-space{display:inline-flex;align-items:flex-end;justify-content:center;min-width:15mm;min-height:14mm;height:14mm;box-sizing:border-box;padding:0 .2em .1em;line-height:1.05;border-bottom:1px solid #555;vertical-align:middle}
      .fd-answer-space>*{flex:none}
      /* 빈칸 상자도 분수 높이에 맞춘다(상자 아래 테두리가 분모를 지나지 않게). */
      .fd-blank{display:inline-flex;align-items:center;justify-content:center;min-width:9mm;min-height:1.15em;padding:0 .12em;line-height:1.15;border:1px solid #555;vertical-align:middle}
      .fd-blank>*{flex:none}
      .fd-blank-wide{min-width:13mm;min-height:2.3em}
      .fd-pairs-wrap{position:relative;height:100%;min-height:0}
      .fd-pairs{position:absolute;inset:0;display:grid;grid-template-columns:42% 52%;column-gap:6%}
      .fd-side{display:grid;grid-template-rows:repeat(var(--fd-rows),minmax(0,1fr));min-height:0}
      .fd-row{display:flex;align-items:center;gap:1.4mm;min-width:0;white-space:nowrap;overflow:hidden}
      .fd-idx{color:#555;font-size:9pt;flex:none}
      .fd-text{flex:1;min-width:0;overflow:hidden}
      .fd-dot{flex:none;width:2.6mm;height:2.6mm;border:.35mm solid #333;border-radius:50%}
      .fd-row-left .fd-dot{margin-left:auto}
      .fd-lines{position:absolute;inset:0;pointer-events:none}
      .fd-lines svg{width:100%;height:100%;display:block}
      .fd-lines line{stroke:${ANSWER_INK};stroke-width:1.6;vector-effect:non-scaling-stroke}
      .fd-error-box{display:flex;gap:.8mm;height:100%;align-items:stretch;width:100%}
      .fd-wrong{flex:0 0 44%;min-width:0}.fd-wrong .fd-line{text-align:left}
      .fd-right{flex:1 1 56%;min-width:0;border-left:1px dashed #c8c8c8;padding-left:.8mm;display:flex;flex-direction:column}
      .fd-wrong .fd-line,.fd-right .fd-line{font-size:.92em}
      .fd-right .fd-line{flex:1 1 0;display:flex;align-items:center;min-height:1.5em;overflow:hidden}
      .fd-mark{background:#dedede;box-shadow:inset 0 -2px 0 #888}
      .fd-label{flex:none;font-size:8pt;color:#666;line-height:1.5}
      /* 고쳐 쓰는 자리는 남는 높이를 세 줄이 나누어 가진다(칸 아래 빈 공간을 남기지 않는다). */
      .fd-rule{flex:1 1 0;min-height:1.9em;border-bottom:1px solid #ddd}
      /* 오류 이름표는 좁은 칸에서 잘리지 않게 두 줄까지 접어 쓴다(C5). */
      .fd-note{flex:none;font-size:7pt;color:#444;line-height:1.1;white-space:normal;word-break:keep-all;overflow:hidden}
      /* 이 묶음 쪽에서만 머리말 간격·보조 글자를 줄여 유형 이름과 '· 정답'이 한 줄에 들어가게 한다(C4·D7). */
      .sheet-page:has(.fd-cell) .sheet-head{gap:1.5mm}
      .sheet-page:has(.fd-cell) .sheet-brand{font-size:7pt}
      .sheet-page:has(.fd-cell) .sheet-field{font-size:8pt}
      .sheet-page:has(.fd-cell) .sheet-title{font-size:9.5pt}
    `;
    document.head.appendChild(style);
  }

  /* ------------------------------------------------------------ 서식표와 유형 등록 */
  const FORMATS = {
    'fd-fraction-horizontal': horizontalItems,
    'fd-fraction-step': stepItems,
    'fd-fraction-match': matchItems,
    'fd-fraction-error-correction': errorItems
  };
  // 머리말은 한 줄이고 제목 칸이 좁아, 개념을 가르는 조건까지 짧게 적는다(C4·D7).
  const CONCEPT_TITLE = {
    '1-4-1-0': '진분수÷자연수(나누어떨어짐)',
    '1-4-1-1': '진분수÷자연수(나누어떨어지지 않음)',
    '1-4-1-2': '가분수÷자연수',
    '1-4-1-3': '대분수÷자연수'
  };
  const TYPE_TITLE = { t1: '가로식', t2: '빈칸', t3: '연결', t4: '고치기' };
  const INSTRUCTION = {
    t1: '계산하여 답을 기약분수나 대분수로 쓰세요.',
    t2: '빈칸에 알맞은 수를 써서 풀이를 완성하세요.',
    t3: '서로 알맞은 것끼리 선으로 이으세요.',
    t4: '잘못 계산한 곳을 찾아 바르게 고쳐 쓰세요.'
  };
  // 한 장 배치 — layout-rules.md §2 의 최소 기준 이상에서 시작해 sheet.js 의 자동 맞춤이 빈 공간을 채운다.
  const LAYOUT = {
    t1: { format: 'fd-fraction-horizontal', cols: 2, rows: 12, fontPt: 17, autoFit: false },
    t2: { format: 'fd-fraction-step', cols: 2, rows: 10, fontPt: 14.5, autoFit: false },
    t3: { format: 'fd-fraction-match', cols: 6, rows: 4, fontPt: 12, autoFit: false, bundles: 6, perBundle: 4 },
    t4: { format: 'fd-fraction-error-correction', cols: 3, rows: 4, fontPt: 13, workLines: 3, autoFit: false }
  };

  const RENDER = {
    'fd-fraction-horizontal': renderHorizontal,
    'fd-fraction-step': renderStep,
    'fd-fraction-match': renderMatch,
    'fd-fraction-error-correction': renderError
  };
  if (!root.Sheet || typeof root.Sheet.register !== 'function') throw Error('sheet.js 를 먼저 불러야 합니다.');
  for (const key of Object.keys(FORMATS)) if (key !== 'fd-fraction-match') root.Sheet.register(key, RENDER[key]);
  if (root.MatchingSheet && root.MatchingSheet.formats) {
    root.MatchingSheet.formats['fd-fraction-match'] = {
      page: 'blocks', title: '선 잇기',
      build(config) {
        css();
        const items = matchItems(config).map(bundle => ({
          kind: 'bundle', caption: '', rowsWeight: bundle.pairs.length, order: bundle.order, compact: true, compactWl: 30, compactWr: 18, compactGap: 10,
          pairs: bundle.pairs.map(q => [{ html: `<span class="fd-line">${operandHTML(q)}${OP('÷')}${q.w}</span>` }, { html: valueHTML(q.answer) }])
        }));
        const total = items.reduce((sum, item) => sum + item.pairs.length, 0);
        return { items, layout: { cols: items.length, rows: items[0].pairs.length, count: total }, pairs: total };
      },
      render: (config, item, isAnswer) => root.MatchingSheet.formats['matching-lines'].render(config, item, isAnswer)
    };
  }

  if (!root.SheetGen || typeof root.SheetGen.generate !== 'function') throw Error('gen-bridge.js 를 먼저 불러야 합니다.');
  const baseGenerate = root.SheetGen.generate;
  root.SheetGen.generate = config => (FORMATS[config.format] ? FORMATS[config.format](config) : baseGenerate(config));

  if (!Array.isArray(root.SheetCatalog)) throw Error('catalog.js 를 먼저 불러야 합니다.');
  for (const conceptId of Object.keys(CONCEPTS)) {
    for (const key of ['t1', 't2', 't3', 't4']) {
      const layout = LAYOUT[key], gen = { conceptId, legacyId: CONCEPTS[conceptId].legacy, typeKey: key };
      if (layout.bundles) { gen.bundles = layout.bundles; gen.perBundle = layout.perBundle; }
      const entry = {
        typeId: `${conceptId}-${key}`,
        title: `${CONCEPT_TITLE[conceptId]} · ${TYPE_TITLE[key]}`,
        format: layout.format,
        cols: layout.cols, rows: layout.rows, count: layout.cols * layout.rows,
        fontPt: layout.fontPt, seed: 20261001, instruction: INSTRUCTION[key], gen,
        autoFit: false
      };
      if (layout.workLines) entry.workLines = layout.workLines;
      entry.maxProblems = 24;
      root.SheetCatalog.push(entry);
    }
  }
  root.FdBundle141 = { FORMATS, CONCEPTS, internal: { toQuestion, collect, pick, errorItem } };
})(globalThis);
