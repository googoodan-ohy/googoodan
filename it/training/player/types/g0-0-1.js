/* Worksheet group 0-0-1: collecting, splitting, and tens with ones (27 types).
   Number pairs come from the existing Worksheets.generate(add-small/missing).
   Small number domains use different missing positions and representations to
   fill three matching bundles, fifteen picture cells, or forty table blanks.
   Split pictures leave the cut for the child to draw; answers show the cut.
   A seed reproduces the same worksheet. All hooks in this file target 0-0-1.
*/
(function (root) {
  'use strict';

  /* ================= 1. 작은 도구 ================= */

  const node = (tag, className, value) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (value !== undefined) el.textContent = value;
    return el;
  };
  const html = (tag, className, markup) => {
    const el = node(tag, className);
    el.innerHTML = markup;
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

  // '2와 3' / '3과 2' — 받침이 있으면 '과', 없으면 '와'
  const FINAL = [0, 1, 3, 6, 7, 8];
  const waGwa = value => FINAL.includes(Math.abs(Number(value)) % 10) ? '과' : '와';
  const blankSpace = (value, answer) => '<span class="blank-space">' + (answer ? String(value) : '&nbsp;') + '</span>';

  /* ================= 2. 개념 정의 ================= */

  // family: collect(모으기) · split(가르기) · tens(10과 낱개)
  // wholeMin/wholeMax: 전체(합)의 범위, target: '같은 합을 만드는 짝' 의 합
  const CONCEPTS = [
    { id: '0-0-1-0', name: '5 이내의 수 모으기', short: '5 이내 모으기', family: 'collect', wholeMin: 2, wholeMax: 5, target: 5 },
    { id: '0-0-1-1', name: '5 이내의 수 가르기', short: '5 이내 가르기', family: 'split', wholeMin: 2, wholeMax: 5 },
    { id: '0-0-1-2', name: '9 이내의 수 모으기', short: '9 이내 모으기', family: 'collect', wholeMin: 2, wholeMax: 9, target: 9 },
    { id: '0-0-1-3', name: '9 이내의 수 가르기', short: '9 이내 가르기', family: 'split', wholeMin: 2, wholeMax: 9 },
    { id: '0-0-1-4', name: '10 만들기', short: '10 만들기', family: 'collect', wholeMin: 10, wholeMax: 10, target: 10, ten: true },
    { id: '0-0-1-5', name: '10 가르기', short: '10 가르기', family: 'split', wholeMin: 10, wholeMax: 10, ten: true },
    { id: '0-0-1-6', name: '10과 낱개로 11~19 나타내기', short: '11~19', family: 'tens', numberMin: 11, numberMax: 19 }
  ];
  const BY_ID = {};
  CONCEPTS.forEach(concept => { BY_ID[concept.id] = concept; });

  // 유형 이름 — worksheet-types.json / spec 의 제목을 머리말 한 줄(이름·날짜·시간 칸 포함)에
  // 들어가게 줄인 것. 개념 이름(short)을 뒤에 붙여 어느 개념의 문제지인지 알 수 있게 한다.
  const TITLES = {
    collect: { t1: '그림 합치기', t2: '수 모형 빈칸', t3: '같은 합 잇기', t4: '모으기 관계도' },
    split: { t1: '그림 가르기', t2: '가르기 관계도', t3: '가르기 표', t4: '전체·부분 잇기' },
    tens: { t1: '10 묶음과 낱개', t2: '10과 낱개 빈칸', t3: '묶음과 수 잇기' }
  };
  const INSTRUCTIONS = {
    'collect-t1': '그림을 보고 두 묶음을 합한 수를 쓰세요.',
    'collect-t2': '수 모형을 보고 빈칸에 알맞은 수를 써넣으세요.',
    'collect-t3': '합이 같은 두 식을 찾아 선으로 연결하세요.',
    'collect-t4': '관계도를 보고 빈칸에 알맞은 수를 써넣으세요.',
    'split-t1': '그림에서 왼쪽에 적힌 수만큼 갈라 표시하고 남은 수를 쓰세요.',
    'split-t2': '관계도를 보고 빈칸에 알맞은 수를 써넣으세요.',
    'split-t3': '여러 방법으로 가르고 빈칸에 알맞은 수를 쓰세요.',
    'split-t4': '□에 알맞은 수를 찾아 선으로 연결하세요.',
    'tens-t1': '10 묶음과 낱개를 보고 수를 쓰세요.',
    'tens-t2': '수를 10과 낱개로 나누어 빈칸에 써넣으세요.',
    'tens-t3': '묶음 그림이나 식과 알맞은 수를 선으로 연결하세요.'
  };

  // [단(묶음), 줄(묶음당 쌍)] — 선 잇기는 [묶음 수, 묶음당 쌍 수]
  const GRIDS = {
    '0-0-1-0': { t1: [2, 5], t2: [2, 5], t3: [4, 3], t4: [2, 5] },
    '0-0-1-1': { t1: [2, 5], t2: [2, 5], t3: [4, 1], t4: [6, 3] },
    '0-0-1-2': { t1: [3, 5], t2: [3, 5], t3: [8, 4], t4: [3, 5] },
    '0-0-1-3': { t1: [2, 8], t2: [3, 5], t3: [4, 1], t4: [8, 4] },
    '0-0-1-4': { t1: [3, 3], t2: [3, 3], t3: [6, 3], t4: [3, 3] },
    '0-0-1-5': { t1: [2, 4], t2: [3, 3], t3: [4, 1], t4: [4, 4] },
    '0-0-1-6': { t1: [3, 3], t2: [3, 3], t3: [4, 4] }
  };
  // 한 유형이 넣을 수 있는 최대 칸 수(= 서로 다른 문제 수). 문제 풀보다 많이 내면 같은 문제가 되풀이되므로 풀 크기에 맞춘다.
  const CAPS = {
    '0-0-1-0': { t1: 10, t2: 10, t3: 12, t4: 10 },
    '0-0-1-1': { t1: 10, t2: 10, t3: 4, t4: 18 },
    '0-0-1-2': { t1: 36, t2: 36, t3: 32, t4: 36 },
    '0-0-1-3': { t1: 16, t2: 36, t3: 8, t4: 32 },
    '0-0-1-4': { t1: 9, t2: 9, t3: 9, t4: 9 },
    '0-0-1-5': { t1: 8, t2: 9, t3: 4, t4: 16 },
    '0-0-1-6': { t1: 9, t2: 9, t3: 16 }
  };
  // 서식 이름은 sheet.js 의 minimumCellMm 이 칸 높이 하한을 정하는 데 쓰인다(이름에 'picture' 가
  // 들어가면 38mm). 관계도 이름을 'g001-picture-relation' 으로 둔 것도 그래서다 — 그렇지 않으면
  // 자동 맞춤이 3단×12줄(36문항)까지 늘려 그림이 21mm 칸에 갇힌다.
  const FORMATS = {
    collect: { t1: 'g001-picture-add', t2: 'g001-picture-model', t3: 'matching-lines', t4: 'g001-picture-relation' },
    split: { t1: 'g001-picture-split', t2: 'g001-picture-relation', t3: 'g001-split-table', t4: 'matching-lines' },
    tens: { t1: 'g001-picture-tens-count', t2: 'g001-picture-tens', t3: 'matching-lines' }
  };

  /* ================= 3. 기존 생성기에서 문제 풀 만들기 ================= */

  function domainOf(concept) {
    const out = [];
    for (let whole = concept.wholeMin; whole <= concept.wholeMax; whole++) {
      for (let a = 1; a < whole; a++) out.push({ a, b: whole - a, whole });
    }
    return out;   // 쉬운 것(전체가 작은 것) → 어려운 것
  }

  // 기존 생성기에서 조건에 맞는 (a, b) 만 골라 낸다. 모자라면 seed 를 바꾸어 더 뽑는다.
  function legacyPairs(concept, seed, needed) {
    if (!root.Worksheets || typeof root.Worksheets.generate !== 'function') {
      throw Error('기존 Worksheets 생성기를 찾지 못했습니다.');
    }
    const sources = concept.family === 'split' ? ['missing', 'add-small'] : ['add-small', 'missing'];
    const out = [], seen = new Set();
    for (let batch = 0; batch < 4000 && out.length < needed; batch++) {
      const id = sources[batch % sources.length];
      let rows;
      try {
        rows = root.Worksheets.generate(id, (Number(seed) + batch * 104729) >>> 0, 16);
      } catch (error) {
        throw Error('기존 생성기 실패(' + id + '): ' + error.message);
      }
      for (const row of rows) {
        const a = Number(row.a), b = Number(row.b);
        if (!Number.isInteger(a) || !Number.isInteger(b)) continue;
        if (a < 1 || b < 1) continue;                 // 0 이 들어간 문제는 넣지 않는다
        const whole = a + b;
        if (whole < concept.wholeMin || whole > concept.wholeMax) continue;
        const key = a + ':' + b;
        if (seen.has(key)) continue;
        seen.add(key);
        out.push({ a, b, whole });
      }
    }
    return out;
  }

  // 개념의 문제 풀 전체(도메인) 중 기존 생성기가 실제로 낸 문제만 쓴다.
  function wholePool(concept, seed) {
    const domain = domainOf(concept);
    const found = new Map(legacyPairs(concept, seed, domain.length).map(item => [item.a + ':' + item.b, item]));
    const pool = domain.filter(item => found.has(item.a + ':' + item.b));
    if (pool.length < domain.length) {
      throw Error(concept.id + ': 기존 생성기가 낸 문제가 ' + domain.length + '가지 중 ' + pool.length + '가지뿐입니다.');
    }
    return pool;
  }

  // §2 의 '0·1 이 들어간 쉬운 문제는 전체의 10% 이하'.
  // 9 이내 개념은 쉬운 문항을 개념의 가장 쉬운 단계(전체 2·3)를 덮는 3개로 묶어 두고 나머지는
  // 1이 들어가지 않는 문항에서 고른다(3/15 = 20%, 3/18 = 16.7%). 전체를 골고루 뽑으면 1이 들어간
  // 문항이 8/15 = 53.3% 가 되고, 10% 이하로 맞추려면 전체 2·3 을 문제지에서 빼야 한다.
  // 5 이내(10가지 중 7가지)·10 만들기(9가지 중 2가지)·10과 낱개(9가지 전부)는 문제 풀 자체가
  // 작아 지킬 수 없다 — 파일 머리의 '쉬운 문제 비율' 설명에 근거를 적었다.
  const EASY_LIMIT = { '0-0-1-2': 3, '0-0-1-3': 3 };
  const isEasy = item => item.a <= 1 || item.b <= 1;

  function pickPool(concept, seed, count) {
    // 문제 풀을 seed 로 섞어서 '다른 문제로' 를 누를 때마다 다른 문항이 뽑히게 한다(뽑은 뒤에는 전체 → 첫째 수 순으로 다시 정렬).
    const rand = rng((Number(seed) ^ 0x2f1b7) >>> 0);
    const pool = wholePool(concept, seed).slice();
    for (let i = pool.length - 1; i > 0; i--) { const j = rand(0, i); [pool[i], pool[j]] = [pool[j], pool[i]]; }
    const byOrder = list => list.sort((x, y) => x.whole - y.whole || x.a - y.a);
    const limit = EASY_LIMIT[concept.id];
    // 풀 전체를 쓸 때(문제 수 = 가짓수)는 전체가 같은 것끼리만 쉬운 순으로 두고 그 안의 순서는 seed 로 섞는다(풀이 한정된 개념).
    if (limit == null) return spread(pool, count).slice().sort((x, y) => x.whole - y.whole);
    const easy = pool.filter(isEasy), hard = pool.filter(item => !isEasy(item));
    const easyCount = Math.min(limit, count, easy.length);
    if (count - easyCount > hard.length) return spread(pool, count);   // 넉넉하지 않으면 원래대로
    const chosen = spread(hard, count - easyCount).concat(easy.slice(0, easyCount));
    return chosen.sort((x, y) => x.whole - y.whole || x.a - y.a);
  }

  // 문제 풀을 count 등분한 지점에서 하나씩 고른다(한 장이 개념 범위의 한쪽만 덮지 않게).
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

  // 문제 풀이 모자라 같은 문제를 다른 표시(alternate)로 다시 낼 때, 어떤 문제를 다시 낼지도 seed 로 고른다.
  function alternates(picked, n, seed) {
    const rand = rng((Number(seed) ^ 0x7a3c91) >>> 0);
    const pool = picked.filter(item => !item.alternate).slice();
    for (let i = pool.length - 1; i > 0; i--) { const j = rand(0, i); [pool[i], pool[j]] = [pool[j], pool[i]]; }
    return pool.slice(0, n).map(item => (typeof item === 'number' ? { value: item, alternate: true } : { ...item, alternate: true }));
  }
  // 선 잇기 묶음의 줄 순서에서 제자리 짝(같은 줄끼리 잇는 수평선)을 없앤다 — 수평선은 정답을 그대로 드러낸다.
  function derangeOrder(order, rand) {
    if (order.length < 2) return order;
    const has = list => list.some((value, index) => value === index);
    let out = order.slice();
    for (let attempt = 0; attempt < 400 && has(out); attempt++) {
      out = order.slice();
      for (let i = out.length - 1; i > 0; i--) { const j = rand(0, i); [out[i], out[j]] = [out[j], out[i]]; }
    }
    if (has(out)) out = order.map((_, index) => (index + 1) % order.length);
    return out;
  }

  /* ================= 4. 문제 만들기 ================= */

  function itemsOf(concept, typeKey, seed, count) {
    if (concept.family === 'tens') {
      const numbers = [];
      for (let value = concept.numberMin; value <= concept.numberMax; value++) numbers.push(value);
      const picked = spread(numbers, Math.min(count, numbers.length));
      if (count > picked.length) picked.push(...alternates(picked.map(entry => (typeof entry === 'number' ? { value: entry } : entry)), count - picked.length, seed));
      // t1은 전체 수, t2는 낱개 수를 묻는다. 마지막 칸은 다른 자리를 묻는다.
      const iconOf = index => (root.IconPool ? root.IconPool.pick(seed, index) : '1f34e');
      if (typeKey === 't1') return picked.map((entry, index) => {
        const value = typeof entry === 'number' ? entry : entry.value;
        return { b: value - 10, total: value, alternate: Boolean(entry.alternate), iconId: iconOf(index) };
      });
      if (typeKey === 't2') return picked.map((entry, index) => {
        const value = typeof entry === 'number' ? entry : entry.value;
        return { b: value - 10, total: value, alternate: Boolean(entry.alternate), iconId: iconOf(index) };
      });
      return picked;
    }

    const picked = pickPool(concept, seed, Math.min(count, concept.ten ? 9 : count));
    if (count > picked.length) picked.push(...alternates(picked, count - picked.length, seed));
    // 문항마다 다른 그림 아이콘(seed 로 시작 위치가 달라진다)
    picked.forEach((pair, i) => { pair.iconId = root.IconPool ? root.IconPool.pick(seed, i) : '1f34e'; });
    if (concept.family === 'collect') {
      if (typeKey === 't1') {
        // 그림 두 묶음 + 합(foot) — 기존 picture-count 'add' 서식이 그대로 그린다
        return picked.map(pair => ({
          format: 'picture-count', kind: 'add', mode: 'add', object: pair.iconId, iconId: pair.iconId,
          a: pair.a, b: pair.b, total: pair.whole, alternate: pair.alternate,
          key: 'add:' + pair.a + ':' + pair.b + ':' + Boolean(pair.alternate)
        }));
      }
      if (typeKey === 't2') {
        // 수 모형(찬 상자 + 빈 상자) — 10 만들기는 십 프레임으로 그린다
        return picked.map(pair => ({ a: pair.a, b: pair.b, whole: pair.whole, style: concept.ten ? 'ten' : 'boxes', iconId: pair.iconId, alternate: pair.alternate }));
      }
      // t4 모으기 관계도 — 두 부분을 보고 전체(빈칸)를 쓴다
      return picked.map(pair => ({ a: pair.a, b: pair.b, whole: pair.whole, blank: pair.alternate ? 2 : 0, mode: 'collect', alternate: pair.alternate }));
    }

    if (typeKey === 't1') {
      // 그림을 두 묶음으로 나누기 — 문제지에서 경계를 직접 긋는다.
      return picked.map(pair => ({ a: pair.a, b: pair.b, whole: pair.whole, n: pair.whole, iconId: pair.iconId, alternate: pair.alternate }));
    }
    if (typeKey === 't2') {
      // 가르기 관계도 — 전체와 한 부분을 보고 나머지 부분(빈칸)을 쓴다
      return picked.map((pair, index) => ({ a: pair.a, b: pair.b, whole: pair.whole, blank: (index + (Number(seed) | 0)) % 2 ? 1 : 2, mode: 'split', alternate: pair.alternate }));
    }
    // t3: 한 표 안의 여러 빈칸을 채운다. 표는 2~4개로 제한한다.
    const tables = [];
    const pool = wholePool(concept, seed);
    if (concept.ten) pool.push({ a: 10, b: 0, whole: 10 });
    // 풀이 36가지 이상이면 표마다 서로 다른 9~10쌍을 쓴다(같은 문제를 표현만 바꿔 되풀이하지 않는다).
    //   5 이내(10가지)·10 가르기(10가지)는 풀 전체가 한 표 크기라 표현(+, −)만 달라진다.
    const rand = rng((Number(seed) ^ 0x1d872b41) >>> 0);
    const mixed = pool.slice();
    for (let i = mixed.length - 1; i > 0; i--) { const j = rand(0, i); [mixed[i], mixed[j]] = [mixed[j], mixed[i]]; }
    const disjoint = pool.length >= 36;
    const byOrder = list => list.sort((x, y) => x.whole - y.whole || x.a - y.a);
    // 표마다 어떤 식 모양(+ 빈칸, 빈칸 +, −)으로 낼지도 seed 로 섞는다.
    const forms = [0, 1, 2, 3];
    for (let i = forms.length - 1; i > 0; i--) { const j = rand(0, i); [forms[i], forms[j]] = [forms[j], forms[i]]; }
    for (let variant = 0; variant < 4; variant++) {
      const entries = disjoint
        ? byOrder(mixed.filter((_, index) => index % 4 === variant).slice(0, 9))
        : spread(pool, 10);
      tables.push({ wholeMin: concept.wholeMin, wholeMax: concept.wholeMax, entries, variant: forms[variant] });
    }
    return tables.slice(0, count);
  }

  /* ================= 5. 선 잇기 짝 만들기 ================= */

  // 왼쪽 항목마다 오른쪽에 맞는 항목이 하나만 있도록 만든다(답이 하나).
  // 문제 풀(서로 다른 문제 수)보다 많은 쌍을 만들지 않는다 — 같은 문제가 한 장에 되풀이되지 않게
  // 묶음 수·묶음당 쌍 수(GRIDS)를 풀 크기에 맞춰 두었고, 여기서는 쌍이 겹치지 않게 고른다.
  function matchingPairsOf(config) {
    const spec = (config.gen && config.gen.g001Pairs) || {};
    const concept = BY_ID[spec.concept];
    if (!concept) throw Error('묶음 0-0-1: 알 수 없는 개념 ' + spec.concept);
    const seed = Number(config.seed) || 1;
    const rand = rng((seed ^ 0x51f0a3) >>> 0);
    const bundles = config.gen.bundles || config.cols, per = config.gen.perBundle || config.rows;
    const shuffleWith = (list, r) => { const o = list.slice(); for (let i = o.length - 1; i > 0; i--) { const j = r(0, i); [o[i], o[j]] = [o[j], o[i]]; } return o; };
    const range = (lo, hi) => Array.from({ length: Math.max(0, hi - lo + 1) }, (_, i) => lo + i);
    // 묶음마다 서로 다른 '종류'(합·빈칸 수) per 개를 고른다. 아직 남은 문제가 많은 종류를 먼저 쓴다(풀이 가장 작은 종류가 모자라지 않게).
    const planBundles = (stock, count) => {
      const plan = [];
      for (let k = 0; k < bundles; k++) {
        const keys = shuffleWith(Object.keys(stock), rand).sort((x, y) => stock[y].length - stock[x].length).filter(key => stock[key].length).slice(0, count);
        if (keys.length < count) throw Error(config.typeId + ': 선 잇기 문제 풀이 모자랍니다(' + bundles + '묶음 × ' + count + '쌍).');
        plan.push(keys.map(key => ({ key, item: stock[key].pop() })));
      }
      return plan;
    };

    if (spec.kind === 'same-sum') {
      // 합이 같은 두 식 잇기. 한 묶음의 합은 모두 달라 답이 하나, 왼쪽 식은 한 장에서 겹치지 않는다.
      //   10 만들기: 왼쪽 수 a(1~9) ↔ 합이 10 이 되는 10 − a (서로 다른 문제 9개).
      if (concept.ten) {
        // 여섯 세트 × 세 쌍: 1~9를 두 차례 연습하되 세트 안에서는 중복하지 않는다.
        if (per > 9 || bundles * per > 18) throw Error(config.typeId + ': 10 만들기 연결 세트 범위를 넘었습니다.');
        const lefts = shuffleWith(range(1, 9), rand).concat(shuffleWith(range(1, 9), rand)).slice(0, bundles * per);
        const out = [];
        for (let k = 0; k < bundles; k++) lefts.slice(k * per, (k + 1) * per).sort((x, y) => x - y).forEach(a => out.push([String(a), String(10 - a)]));
        return out;
      }
      const sums = range(3, concept.wholeMax);
      const forms = sum => (concept.wholeMax <= 5 ? range(0, sum) : range(1, sum - 1));   // 5 이내만 0 + 수 모양을 쓴다
      const stock = {};
      sums.forEach(sum => { stock[sum] = shuffleWith(forms(sum), rand); });
      const out = [];
      for (const bundle of planBundles(stock, per).map(list => list.sort((x, y) => Number(x.key) - Number(y.key)))) {
        for (const { key, item } of bundle) {
          const sum = Number(key);
          const other = shuffleWith(forms(sum).filter(value => value !== item), rand)[0];
          out.push([item + ' + ' + (sum - item), other + ' + ' + (sum - other)]);
        }
      }
      return out;
    }
    if (spec.kind === 'whole-parts' || spec.kind === 'ten-split') {
      // 왼쪽: 전체와 한 부분이 적힌 식(빈칸 □) / 오른쪽: □에 들어갈 수. 한 묶음 안에서 □의 값이 모두 달라 답이 하나다.
      // 문제 = (전체, □의 값, 빈칸의 위치). 같은 문제는 한 장에서 한 번만 나온다.
      const lo = Math.max(2, concept.wholeMin), hi = concept.wholeMax;
      const stock = {};
      for (let m = 1; m <= hi - 1; m++) {
        const list = [];
        for (let whole = Math.max(lo, m + 1); whole <= hi; whole++) { if (spec.kind === 'ten-split' && whole !== 10) continue; list.push({ whole, m, v: 0 }, { whole, m, v: 1 }); }
        if (list.length) stock[m] = shuffleWith(list, rand);
      }
      const out = [];
      const plan = planBundles(stock, per);
      plan.forEach((bundle, k) => {
        bundle.map(entry => entry.item).sort((x, y) => x.m - y.m).forEach(({ whole, m, v }) => {
          const shown = whole - m;
          const box = '<span class="mt-icon-blank"><img src="vendor/art/1f34e.svg" alt=""></span>';   // 빈칸 자리: 흐린 사과 그림
          out.push([{ html: v === 0 ? whole + ' = ' + shown + ' + ' + box : whole + ' = ' + box + ' + ' + shown }, String(m)]);
        });
      });
      return out;
    }
    if (spec.kind === 'tens-bundle') {
      // 묶음 그림(또는 10 + 낱개 식) ↔ 수. 한 묶음 안의 수는 모두 달라 답이 하나다. 그림 묶음끼리·식 묶음끼리 수가 겹치지 않는다.
      const values = range(concept.numberMin, concept.numberMax);
      const picBundles = Math.ceil(bundles / 2), formulaBundles = Math.floor(bundles / 2);
      if (picBundles * per > values.length || formulaBundles * per > values.length) throw Error(config.typeId + ': 11~19 는 서로 다른 문제가 9개뿐입니다.');
      const picValues = shuffleWith(values, rand), formulaValues = shuffleWith(values, rand);
      const out = [];
      let pi = 0, fi = 0;
      for (let k = 0; k < bundles; k++) {
        const pic = k % 2 === 0;
        const chosen = (pic ? picValues.slice(pi, pi += per) : formulaValues.slice(fi, fi += per)).sort((x, y) => x - y);
        chosen.forEach(v => out.push([pic ? { html: bundleSvg(v) } : '10 + ' + (v - 10), String(v)]));
      }
      return out;
    }
    throw Error('알 수 없는 짝 종류: ' + spec.kind);
  }

  /* ================= 6. 서식(CSS) ================= */

  const CSS = [
    '.g001-centre{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;min-height:0}',
    '.g001-svg{flex:1;min-height:0;width:100%;display:flex;align-items:center;justify-content:center}',
    '.g001-svg svg{width:100%;height:100%;display:block}',
    '.g001-foot{flex:none;padding-top:.6mm;font-size:1em;white-space:nowrap}',
    '.g001-foot .blank-space{min-width:9mm;height:1.5em}',
    /* 선 잇기 묶음이 3개뿐이면 마지막 묶음이 아래 두 칸을 모두 쓴다(한쪽이 빈 채로 남지 않게) */
    '.mt-body:has(.mt-compact) .mt-block:nth-child(3):last-child{grid-column:1/-1}',
    /* 가르기 표 — 한 수를 여러 방법으로 가르는 칸 */
    '.g001-st{display:flex;flex-direction:column;align-items:center;justify-content:space-around;gap:1.2mm;height:100%;width:100%}',
    '.g001-st-head{font-size:.85em;color:#333;border-bottom:1px solid #bbb;padding-bottom:.3mm}',
    '.g001-st-cells{display:flex;flex-direction:column;justify-content:space-around;align-items:center;gap:1mm;width:100%;flex:1}',
    '.g001-st-cell{white-space:nowrap;font-variant-numeric:tabular-nums}',
    '.g001-st-cell .blank-space{min-width:9mm;margin-left:1mm}'
  ].join('');

  let styled = false;
  function installCss() {
    if (styled || typeof document === 'undefined') return;
    if (document.getElementById('g001-styles')) { styled = true; return; }
    styled = true;
    const style = document.createElement('style');
    style.id = 'g001-styles';
    style.textContent = CSS;
    document.head.append(style);
  }

  /* ================= 7. 그림 그리기(이 파일 전용 서식) ================= */

  const INK = '#111';
  const SOLID = 'fill="' + INK + '"';
  const HOLLOW = 'fill="none" stroke="' + INK + '" stroke-width="1.2"';
  const DASHED = 'fill="none" stroke="' + INK + '" stroke-width="1.2" stroke-dasharray="4 3"';
  const svgText = (x, y, value, size) => '<text x="' + x + '" y="' + y + '" text-anchor="middle" font-size="' + (size || 16) + '" fill="' + INK + '">' + value + '</text>';
  const svgRect = (x, y, w, h, paint) => '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" ' + paint + '/>';
  let curIcon = '1f34e';   // 지금 그리는 문항의 아이콘(문항마다 달라진다)
  const dotIcon = (cx, cy, r) => '<image href="vendor/art/' + curIcon + '.svg" x="' + (cx - r * 1.3).toFixed(1) + '" y="' + (cy - r * 1.3).toFixed(1) + '" width="' + (r * 2.6).toFixed(1) + '" height="' + (r * 2.6).toFixed(1) + '" style="filter:saturate(2) contrast(1.2) brightness(.92) drop-shadow(0 0 .7px #222)"/>';
  const svgCircle = (cx, cy, r, paint) => paint === SOLID ? dotIcon(cx, cy, r) : '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" ' + paint + '/>';
  const svgLine = (x1, y1, x2, y2, width) => '<path d="M' + x1 + ' ' + y1 + 'L' + x2 + ' ' + y2 + '" fill="none" stroke="' + INK + '" stroke-width="' + (width || 1.4) + '"/>';
  const svg = (body, box) => '<svg viewBox="' + (box || '0 0 200 150') + '" preserveAspectRatio="xMidYMid meet" aria-hidden="true">' + body + '</svg>';
  const ANSWER = '#d71f10';

  // 칸 안에 count 개를 perRow 열로 고르게 담는다(그림).
  function scatter(x, y, w, h, count, perRow, paint) {
    if (count <= 0) return '';
    const rows = Math.max(1, Math.ceil(count / perRow));
    const cw = w / perRow, ch = h / rows, size = Math.min(cw, ch) * 0.38;
    let body = '';
    for (let i = 0; i < count; i++) {
      const row = Math.floor(i / perRow), inRow = Math.min(perRow, count - row * perRow);   // 마지막 줄은 가운데로 모은다
      const cx = x + cw * ((i % perRow) + (perRow - inRow) / 2 + 0.5), cy = y + ch * (row + 0.5);
      body += svgCircle(cx, cy, size, paint);
    }
    return body;
  }

  // 문제지에는 점만, 정답지에는 두 묶음의 경계를 그린다.
  // 그림 가르기: 동그라미 대신 그림 아이콘(사과·딸기·포도·토끼·병아리·강아지·판다·풍선)을 크게 그린다.
  const ICONS = ['1f34e', '1f353', '1f347', '1f407', '1f424', '1f436', '1f43c', '1f388'];
  function splitSvg(item) {
    const slot = Math.min(36, 190 / item.n), size = slot * 0.94, cy = 70;
    const startX = (200 - slot * item.n) / 2;
    const icon = item.iconId || '1f34e';
    let body = '';
    for (let i = 0; i < item.n; i++) {
      body += '<image href="vendor/art/' + icon + '.svg" x="' + (startX + slot * i + (slot - size) / 2).toFixed(1) + '" y="' + (cy - size / 2).toFixed(1)
        + '" width="' + size.toFixed(1) + '" height="' + size.toFixed(1) + '" style="filter:saturate(2) contrast(1.2) brightness(.92) drop-shadow(0 0 .7px #222)"/>';
    }
    if (item.showCut) {
      const cut = startX + slot * item.a;
      body += svgLine(cut, cy - size / 2 - 10, cut, cy + size / 2 + 10, 2.4).replace(INK, '#d71f10');
    }
    return svg(body, '0 38 200 64');
  }

  // 십 프레임 한 장(5열 × 2행) — filled 칸까지 아이콘, 그 뒤 unknown 칸은 점선 원(정답지에서는 빨간 점)
  function tenFrameSvg(x0, y0, fw, fh, given, unknown, answer, solidIcons) {
    let body = '';
    const r = Math.min(fw / 5, fh / 2) * 0.38;
    for (let i = 0; i < 10; i++) {
      const col = i % 5, row = Math.floor(i / 5);
      const cx = x0 + fw * (col + 0.5) / 5, cy = y0 + fh * (row + 0.5) / 2;
      body += svgRect(x0 + fw * col / 5, y0 + fh * row / 2, fw / 5, fh / 2, 'fill="none" stroke="#bbb" stroke-width=".9"');
      if (i < given) body += svgCircle(cx, cy, r, SOLID);
      else if (i < given + unknown) body += solidIcons && answer ? '<circle cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="' + (r * 0.8).toFixed(1) + '" fill="' + ANSWER + '"/>'
        : '<circle cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="' + (r * 0.8).toFixed(1) + '" fill="none" stroke="#666" stroke-width="1.8" stroke-dasharray="3 2"/>' + (answer ? '<circle cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="' + (r * 0.8).toFixed(1) + '" fill="' + ANSWER + '"/>' : '');
    }
    return body + svgRect(x0, y0, fw, fh, 'fill="none" stroke="' + INK + '" stroke-width="1.8"');
  }

  // 수 모형의 빈칸 — 찬 상자 + 빈 상자(0-0-1-0·2) 또는 십 프레임(0-0-1-4)
  function modelSvg(item, answer) {
    curIcon = item.iconId || '1f34e';
    if (item.style === 'ten') {
      const given = item.tenGiven != null ? item.tenGiven : item.a;
      const unknown = item.tenUnknown != null ? item.tenUnknown : 0;
      return stackedFramesSvg(item, given, unknown, 'model', answer);
    }
    const perRow = Math.max(item.a, item.b) <= 4 ? 2 : 3;   // 적게 담을 때는 한 줄에 둘씩 — 아이콘을 키운다
    let body = svgRect(8, 6, 88, 88, 'fill="none" stroke="' + INK + '" stroke-width="1.8"')
      + scatter(12, 10, 80, 80, item.a, perRow, SOLID)
      + svgRect(104, 6, 88, 88, DASHED);
    if (answer) body += scatter(108, 10, 80, 80, item.b, perRow, 'fill="none" stroke="' + ANSWER + '" stroke-width="2.4"');
    return svg(body, '0 0 200 100');
  }

  // 십 프레임 두 장을 위아래로 쌓는다(10 만들기). 위: 준 수 a 만큼 아이콘.
  //   mode 'add': 아래 프레임에도 b 만큼 아이콘 / 'model': 아래는 점선 프레임(문제지는 비움, 정답지는 b 만큼 빨간 점)
  function stackedFramesSvg(item, a, b, mode, answer) {
    curIcon = item.iconId || '1f34e';
    const fw = 168, fh = 56, x0 = 16, y1 = 4, y2 = 90;
    let body = tenFrameSvg(x0, y1, fw, fh, a, 0, false, false)
      + '<path d="M100 ' + (y1 + fh + 7) + 'V' + (y2 - 7) + 'M89 ' + ((y1 + fh + y2) / 2) + 'H111" stroke="' + INK + '" stroke-width="4" fill="none" stroke-linecap="round"/>';
    if (mode === 'add') body += tenFrameSvg(x0, y2, fw, fh, b, 0, false, false);
    else {
      for (let i = 0; i < 10; i++) body += svgRect(x0 + fw * (i % 5) / 5, y2 + fh * Math.floor(i / 5) / 2, fw / 5, fh / 2, 'fill="none" stroke="#ccc" stroke-width=".9"');
      body += svgRect(x0, y2, fw, fh, DASHED);
      if (answer) {
        const r = Math.min(fw / 5, fh / 2) * 0.32;
        for (let i = 0; i < b; i++) body += '<circle cx="' + (x0 + fw * ((i % 5) + 0.5) / 5).toFixed(1) + '" cy="' + (y2 + fh * (Math.floor(i / 5) + 0.5) / 2).toFixed(1) + '" r="' + r.toFixed(1) + '" fill="' + ANSWER + '"/>';
      }
    }
    return svg(body, '0 0 200 ' + (y2 + fh + 4));
  }

  // 그림 합치기 — 두 묶음(왼쪽·오른쪽 상자)을 그리고 가운데에 + 를 둔다.
  function addSvg(item) {
    curIcon = item.iconId || '1f34e';
    const body = svgRect(8, 6, 78, 88, 'fill="none" stroke="' + INK + '" stroke-width="1.8"')
      + scatter(10, 8, 74, 84, item.a, Math.max(item.a, item.b) <= 4 ? 2 : 3, SOLID)
      + '<path d="M100 38V62M88 50H112" stroke="' + INK + '" stroke-width="4" fill="none" stroke-linecap="round"/>'
      + svgRect(114, 6, 78, 88, 'fill="none" stroke="' + INK + '" stroke-width="1.8"')
      + scatter(116, 8, 74, 84, item.b, Math.max(item.a, item.b) <= 4 ? 2 : 3, SOLID);
    return svg(body, '0 0 200 100');
  }

  // 관계도 — 전체(위)와 두 부분(아래) 중 한 곳을 비운다.
  function relationSvg(item, answer) {
    const wholeY = 32, partY = 104, leftX = 62, rightX = 138, barY = 72;
    const box = (cx, cy, value, blanked) => {
      const frame = blanked && !answer ? DASHED : 'fill="none" stroke="' + INK + '" stroke-width="1.5"';
      const label = blanked && !answer ? '' : String(value);
      return svgRect(cx - 21, cy - 14, 42, 28, frame)
        + (label ? (blanked ? svgText(cx, cy + 7.5, label, 22).replace('fill="' + INK + '"', 'fill="' + ANSWER + '" font-weight="700"') : svgText(cx, cy + 7.5, label, 22)) : '');
    };
    let body = box(100, wholeY, item.whole, item.blank === 0)
      + svgLine(100, wholeY + 14, 100, barY, 1.4) + svgLine(leftX, barY, rightX, barY, 1.4)
      + svgLine(leftX, barY, leftX, partY - 14, 1.4) + svgLine(rightX, barY, rightX, partY - 14, 1.4)
      + box(leftX, partY, item.a, item.blank === 1) + box(rightX, partY, item.b, item.blank === 2);
    return svg(body, '36 12 128 114');
  }

  // 10과 낱개 — 위: 가득 찬 십 프레임(10 묶음), 아래: 낱개 자리(점선 프레임). ones 를 주면 낱개를 그려 넣는다.
  function tensSvg(item, answer, ones) {
    curIcon = item.iconId || '1f34e';
    const fw = 176, fh = 62, x0 = 12;
    let body = tenFrameSvg(x0, 4, fw, fh, 10, 0, false, false);
    const y1 = 4 + fh + 12;
    if (ones) body += tenFrameSvg(x0, y1, fw, fh, ones, 0, false, false);
    else {
      for (let i = 0; i < 10; i++) body += svgRect(x0 + fw * (i % 5) / 5, y1 + fh * Math.floor(i / 5) / 2, fw / 5, fh / 2, 'fill="none" stroke="#ccc" stroke-width=".9"');
      body += svgRect(x0, y1, fw, fh, DASHED);
      if (answer) {   // 정답: 구해야 하는 낱개 수만큼 빨간 점
        const r = Math.min(fw / 5, fh / 2) * 0.32;
        for (let i = 0; i < item.b; i++) {
          body += '<circle cx="' + (x0 + fw * ((i % 5) + 0.5) / 5).toFixed(1) + '" cy="' + (y1 + fh * (Math.floor(i / 5) + 0.5) / 2).toFixed(1) + '" r="' + r.toFixed(1) + '" fill="' + ANSWER + '"/>';
        }
      }
    }
    return svg(body, '0 0 200 ' + (y1 + fh + 4));
  }

  // 선 잇기 왼쪽에 넣는 작은 묶음 그림 — 가득 찬 십 프레임(10 묶음) + 낱개 프레임. 줄 높이(약 13mm)에 맞춰 50mm × 9.3mm.
  function bundleSvg(value) {
    curIcon = (root.IconPool ? root.IconPool.pick(value, 0) : '1f34e');
    const ones = value - 10, cell = 10;
    let body = '';
    const frame = (x0, filled) => {
      for (let i = 0; i < 10; i++) {
        const cx = x0 + (i % 5) * cell + cell / 2, cy = Math.floor(i / 5) * cell + cell / 2;
        body += svgRect(x0 + (i % 5) * cell, Math.floor(i / 5) * cell, cell, cell, 'fill="none" stroke="#aaa" stroke-width=".8"');
        if (i < filled) body += svgCircle(cx, cy, 3.6, SOLID);
      }
      body += svgRect(x0, 0, 5 * cell, 2 * cell, 'fill="none" stroke="' + INK + '" stroke-width="1.5"');
    };
    frame(1, 10);
    frame(59, ones);
    return '<svg viewBox="0 0 110 20" width="50mm" height="9.3mm" style="vertical-align:middle" '
      + 'preserveAspectRatio="xMidYMid meet" aria-hidden="true">' + body + '</svg>';
  }

  /* ================= 8. 서식 등록 ================= */

  function picture(cell, svgMarkup, footMarkup) {
    const wrap = node('div', 'g001-centre');
    wrap.append(html('div', 'g001-svg', svgMarkup));
    if (footMarkup) wrap.append(html('div', 'g001-foot', footMarkup));
    cell.append(wrap);
  }

  function renderPictureAdd(cell, item, answer) {
    installCss();
    if (!root.PictureSheet || typeof root.PictureSheet.renderer !== 'function') {
      throw Error('그림 서식(formats-pictures.js)을 찾지 못했습니다.');
    }
    root.PictureSheet.css();
    if (item.alternate) {
      picture(cell, modelSvg({ ...item, whole: item.total, style: 'ten', tenGiven: item.a, tenUnknown: item.b }, answer),
        item.a + ' + ' + blankSpace(item.b, answer) + ' = ' + item.total);
    } else {
      picture(cell, item.total === 10 ? stackedFramesSvg(item, item.a, item.b, 'add', answer) : addSvg(item), blankSpace(item.a, answer) + ' + ' + blankSpace(item.b, answer) + ' = ' + blankSpace(item.total, answer));
    }
  }

  function renderPictureSplit(cell, item, answer) {
    installCss();
    picture(cell, splitSvg({ ...item, showCut: answer }),
      '왼쪽 ' + item.a + '개 | 오른쪽 ' + blankSpace(item.b, answer) + '개');
  }

  function renderPictureModel(cell, item, answer) {
    installCss();
    picture(cell, modelSvg(item.style === 'ten' ? { ...item, tenGiven: item.alternate ? item.b : item.a, tenUnknown: item.alternate ? item.a : item.b } : item, answer),
      item.alternate ? blankSpace(item.a, answer) + ' + ' + item.b + ' = ' + item.whole
        : item.a + ' + ' + blankSpace(item.b, answer) + ' = ' + item.whole);
  }

  function renderRelation(cell, item, answer) {
    installCss();
    const foot = item.blank === 0
      ? item.a + waGwa(item.a) + ' ' + item.b + (FINAL.includes(item.b % 10) ? '을' : '를') + ' 모으면 ' + blankSpace(item.whole, answer)
      : item.whole + (FINAL.includes(item.whole % 10) ? '은 ' : '는 ') + (item.blank === 1
        ? blankSpace(item.a, answer) + waGwa(item.a) + ' ' + item.b
        : item.a + waGwa(item.a) + ' ' + blankSpace(item.b, answer));
    picture(cell, relationSvg(item, answer), foot);
  }

  function renderTensBlank(cell, item, answer) {
    installCss();
    picture(cell, tensSvg(item, answer), item.alternate
      ? blankSpace(10, answer) + ' + ' + item.b + ' = ' + item.total
      : '10 + ' + blankSpace(item.b, answer) + ' = ' + item.total);
  }

  function renderTensCount(cell, item, answer) {
    installCss();
    picture(cell, tensSvg(item, false, item.b), item.alternate
      ? '낱개 ' + blankSpace(item.b, answer) + '개' : '전체 ' + blankSpace(item.total, answer));
  }

  function renderSplitTable(cell, item, answer) {
    installCss();
    const wrap = node('div', 'g001-centre');
    const table = node('div', 'g001-st');
    const cells = node('div', 'g001-st-cells');
    for (const pair of item.entries) {
      const line = node('div', 'g001-st-cell');
      const prompt = item.variant === 0
        ? pair.a + ' + ' + blankSpace(pair.b, answer) + ' = ' + pair.whole
        : item.variant === 1
          ? blankSpace(pair.a, answer) + ' + ' + pair.b + ' = ' + pair.whole
          : item.variant === 2
            ? pair.whole + ' − ' + pair.a + ' = ' + blankSpace(pair.b, answer)
            : pair.whole + ' − ' + pair.b + ' = ' + blankSpace(pair.a, answer);
      line.append(html('span', '', prompt));
      cells.append(line);
    }
    table.append(cells);
    wrap.append(table);
    cell.append(wrap);
  }

  function installFormats() {
    if (!root.Sheet || typeof root.Sheet.register !== 'function') return false;
    root.Sheet.register('g001-picture-add', renderPictureAdd);
    root.Sheet.register('g001-picture-split', renderPictureSplit);
    root.Sheet.register('g001-picture-model', renderPictureModel);
    root.Sheet.register('g001-picture-relation', renderRelation);
    root.Sheet.register('g001-picture-tens', renderTensBlank);
    root.Sheet.register('g001-picture-tens-count', renderTensCount);
    root.Sheet.register('g001-split-table', renderSplitTable);
    return true;
  }

  /* ================= 9. 기존 연결층에 끼우기 ================= */

  // sheet.js 는 선 잇기 서식을 SheetGen 이 아니라 MatchingSheet.build 로 그린다.
  // 이 묶음의 선 잇기만 짝을 미리 만들어 넘기고 나머지는 그대로 흘려보낸다.
  function installMatching() {
    const base = root.MatchingSheet;
    if (!base || typeof base.build !== 'function' || base.g001Wrapped) return false;
    const original = base.build;
    base.build = function (config) {
      if (config && config.gen && config.gen.g001Pairs) {
        installCss();
        const gen = config.gen;
        const bundles = gen.bundles || config.cols || 1;
        const perBundle = gen.perBundle || config.rows || 4;
        const pairs = matchingPairsOf({ ...config, gen });
        if (pairs.length !== bundles * perBundle) {
          throw Error(config.typeId + ': 선 잇기 짝이 ' + (bundles * perBundle) + '쌍 필요한데 ' + pairs.length + '쌍입니다.');
        }
        const built = original.call(this, { ...config, pairs, gen: { ...gen, bundles, perBundle, bundleCaption: gen.bundleCaption } });
        // 제자리 짝(수평선)이 정답을 드러내지 않도록 줄 순서를 다시 섞는다.
        const rand = rng((Number(config.seed) ^ 0x3b9aca07) >>> 0);
        for (const item of built.items || []) {
          if (Array.isArray(item.order)) item.order = derangeOrder(item.order, rand);
          // 왼쪽·오른쪽 글자 폭과 동그라미 간격(공용 buildMatching 은 compactW 만 항목에 싣는다)
          if (gen.compactWl) item.compactWl = gen.compactWl;
          if (gen.compactWr) item.compactWr = gen.compactWr;
          if (gen.compactGap) item.compactGap = gen.compactGap;
        }
        return built;
      }
      return original.apply(this, arguments);
    };
    base.g001Wrapped = true;
    return true;
  }

  function generate(config) {
    const gen = config.gen || {};
    const concept = BY_ID[gen.g001Concept];
    if (!concept) throw Error('묶음 0-0-1: 알 수 없는 개념 ' + gen.g001Concept);
    const typeKey = gen.g001Type;
    const count = config.count || config.cols * config.rows;
    const cap = CAPS[concept.id][typeKey];
    if (!cap) throw Error('묶음 0-0-1: 알 수 없는 유형 ' + concept.id + '-' + typeKey);
    if (count > cap) throw Error(config.typeId + ': 이 유형은 ' + cap + '문항까지입니다.');
    // 선 잇기는 sheet.js 가 MatchingSheet.build 로 그리지만, 검사기·검수자가 같은 방식으로
    // 문항을 볼 수 있게 여기서도 짝을 돌려준다.
    if (FORMATS[concept.family][typeKey] === 'matching-lines') return matchingPairsOf(config);
    return itemsOf(concept, typeKey, config.seed, count);
  }

  function installGenerator() {
    const base = root.SheetGen;
    if (!base || typeof base.generate !== 'function' || base.g001Wrapped) return false;
    const original = base.generate;
    base.generate = function (config) {
      if (config && config.gen && config.gen.g001Concept) return generate(config);
      return original.apply(this, arguments);
    };
    base.g001Wrapped = true;
    return true;
  }

  if (!installFormats()) document.addEventListener('DOMContentLoaded', installFormats, { once: true });
  if (!installMatching()) document.addEventListener('DOMContentLoaded', installMatching, { once: true });
  if (!installGenerator()) document.addEventListener('DOMContentLoaded', installGenerator, { once: true });

  /* ================= 10. 유형 등록 ================= */

  function configOf(concept, typeKey) {
    const grid = GRIDS[concept.id][typeKey];
    const format = FORMATS[concept.family][typeKey];
    const gen = { g001Concept: concept.id, g001Type: typeKey };
    if (format === 'matching-lines') {
      gen.bundles = grid[0];
      gen.perBundle = grid[1];
      gen.bundleCaption = concept.family === 'collect' || concept.family === 'split' || concept.family === 'tens' ? ''
        : concept.family === 'split' ? '전체와 두 부분' : '묶음과 수';
      gen.compact = true; gen.compactW = concept.family === 'split' ? 30 : concept.family === 'tens' ? 30 : 20;
      if (concept.family === 'tens') { gen.compactWl = 50; gen.compactWr = 10; gen.compactGap = 8; }
      if (concept.family === 'split') { gen.compactWl = 36; gen.compactWr = 8; gen.compactGap = 10; }   // 동그라미를 글자 바로 옆에 붙인다
      gen.g001Pairs = concept.family === 'collect'
        ? { concept: concept.id, kind: 'same-sum' }
        : concept.id === '0-0-1-5' ? { concept: concept.id, kind: 'ten-split' }
          : concept.id === '0-0-1-6' ? { concept: concept.id, kind: 'tens-bundle' }
            : { concept: concept.id, kind: 'whole-parts' };
    }
    return {
      typeId: concept.id + '-' + typeKey,
      title: TITLES[concept.family][typeKey] + ' · ' + concept.short,
      instruction: concept.ten && concept.family === 'collect' && typeKey === 't3' ? '합이 10이 되는 두 수를 선으로 연결하세요.' : INSTRUCTIONS[concept.family + '-' + typeKey],
      format,
      cols: grid[0], rows: grid[1], count: grid[0] * grid[1],
      fontPt: format === 'matching-lines' ? (concept.family === 'split' ? 15 : concept.ten ? 26 : 17) : format === 'g001-split-table' ? 18 : 16,   // §2 선행 학습·한 자리 수 단계는 15~16pt 이상(칸이 넉넉하면 키운다)
      seed: 20261001,
      // 표는 네 개로 고정된다. 자동 행 증가는 빈 두 번째 행을 만들어 지면을 반만 쓴다.
      // 문제 풀(서로 다른 문제 수)이 작은 유형은 칸을 늘리지 않는다(같은 문제가 되풀이된다).
      ...(CAPS[concept.id][typeKey] <= 16 ? { autoFit: false } : {}),
      maxProblems: 40,
      gen
    };
  }

  const typeIds = [];
  for (const concept of CONCEPTS) {
    for (const typeKey of ['t1', 't2', 't3', 't4']) {
      if (!GRIDS[concept.id][typeKey]) continue;
      const config = configOf(concept, typeKey);
      typeIds.push(config.typeId);
      if (Array.isArray(root.SheetCatalog)) root.SheetCatalog.push(config);
    }
  }

  /* ================= 11. 스스로 검사 ================= */

  function selfTest(options) {
    const seeds = (options && options.seeds) || [1, 7, 42, 20261001];
    const report = { sheets: 0, items: 0, pairs: 0, problems: [] };
    const fail = message => report.problems.push(message);
    const keyOf = item => [item.a, item.b, item.whole, item.n, item.blank, item.variant, item.alternate, item.mask].join(':');
    const make = (config, run) => {
      if (config.format === 'picture-work') return root.PictureSheet.questions(run);   // 기존 서식이 문항을 만든다
      if (config.format === 'matching-lines') return matchingPairsOf(run);
      return generate(run);
    };
    for (const concept of CONCEPTS) {
      for (const typeKey of ['t1', 't2', 't3', 't4']) {
        if (!GRIDS[concept.id][typeKey]) continue;
        const config = configOf(concept, typeKey);
        for (const seed of seeds) {
          const run = { ...config, seed };
          let items;
          try {
            items = make(config, run);
          } catch (error) {
            fail(config.typeId + ' seed ' + seed + ': ' + error.message);
            continue;
          }
          report.sheets += 1;
          if (config.format === 'matching-lines') {
            report.pairs += items.length;
            const rights = new Set();
            for (const pair of items) {
              if (!Array.isArray(pair) || pair.length !== 2) fail(config.typeId + ': 짝의 모양이 다릅니다');
              else if (rights.has(String(pair[1]))) fail(config.typeId + ' seed ' + seed + ': 오른쪽 짝이 겹칩니다(' + pair[1] + ')');
              else rights.add(String(pair[1]));
            }
            if (items.length !== config.count) fail(config.typeId + ' seed ' + seed + ': 짝이 ' + items.length + '개(' + config.count + '개 필요)');
            if (JSON.stringify(make(config, run)) !== JSON.stringify(items)) fail(config.typeId + ' seed ' + seed + ': 같은 seed 인데 짝이 달라집니다.');
            continue;
          }
          const seen = new Set();
          for (const item of items) {
            report.items += 1;
            const key = keyOf(item);
            if (seen.has(key)) fail(config.typeId + ' seed ' + seed + ': 같은 문항이 두 번 나왔습니다(' + key + ')');
            seen.add(key);
            if (concept.family === 'tens') {
              if (!(item.total >= concept.numberMin && item.total <= concept.numberMax)) fail(config.typeId + ': 범위 밖(' + item.total + ')');
              if (item.b !== item.total - 10 || !(item.b >= 1 && item.b <= 9)) fail(config.typeId + ': 10과 낱개로 나뉘지 않음(' + key + ')');
              continue;
            }
            if (config.format === 'g001-split-table') {
              if (!Array.isArray(item.entries) || item.entries.length < 9 || item.entries.length > 10) fail(config.typeId + ': 표의 빈칸이 9~10개가 아닙니다.');
              for (const pair of item.entries) {
                if (pair.a + pair.b !== pair.whole || pair.whole < concept.wholeMin || pair.whole > concept.wholeMax) {
                  fail(config.typeId + ': 표의 가르기 범위가 틀립니다.');
                }
              }
              continue;
            }
            const a = Number(item.a), b = Number(item.b);
            if (!(a >= 1 && b >= 1)) fail(config.typeId + ' seed ' + seed + ': 0 이 들어간 문항(' + key + ')');
            const whole = item.whole == null ? a + b : Number(item.whole);
            if (whole !== a + b) fail(config.typeId + ' seed ' + seed + ': 전체가 두 부분의 합이 아님(' + key + ')');
            if (whole < concept.wholeMin || whole > concept.wholeMax) fail(config.typeId + ' seed ' + seed + ': 개념 범위 밖(' + key + ')');
            if (config.format === 'g001-picture-relation' && !['0', '1', '2'].includes(String(item.blank))) fail(config.typeId + ': 빈칸 자리가 없음(' + key + ')');
          }
          if (items.length !== config.count) fail(config.typeId + ' seed ' + seed + ': 문항이 ' + items.length + '개(' + config.count + '개 필요)');
          // 같은 seed → 같은 문제 (두 번 만들면 완전히 같아야 한다)
          if (JSON.stringify(make(config, run)) !== JSON.stringify(items)) fail(config.typeId + ' seed ' + seed + ': 같은 seed 인데 문제가 달라집니다.');
        }
      }
    }
    if (report.problems.length) throw Error('묶음 0-0-1 자체 검사 실패: ' + report.problems.slice(0, 6).join(' / '));
    return report;
  }

  root.G001Sheet = {
    concepts: CONCEPTS, titles: TITLES, grids: GRIDS, caps: CAPS, formats: FORMATS,
    typeIds, generate, wholePool, matchingPairsOf, selfTest
  };
})(globalThis);
