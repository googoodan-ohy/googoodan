/* 묶음 0-5-1 — 약수·배수·공약수·공배수 (개념 4개 × 유형 3개 = typeId 12개)

   개념(prototypes\training-roadmap-20261001\worksheet-types.json)
     0-5-1-0 약수 찾기            t1 곱셈 짝으로 약수 찾기 / t2 나누어떨어지는 수 고르기 / t3 빠진 약수 채우기
     0-5-1-1 배수 찾기            t1 곱셈으로 배수 목록 만들기 / t2 수 목록에서 배수 고르기 / t3 배수 배열의 빈칸 채우기
     0-5-1-2 공약수와 최대공약수  t1 약수 목록에서 공약수 찾기 / t2 공약수 중 최대공약수 쓰기 / t3 공약수 표의 빈칸 채우기
     0-5-1-3 공배수와 최소공배수  t1 배수 목록에서 공배수 찾기 / t2 공배수 중 최소공배수 쓰기 / t3 공배수 표의 빈칸 채우기

   문제는 사이트의 기존 생성기(Worksheets.generate)에서 뽑은 수로 만든다. 새 문제 엔진을 만들지 않는다.
   · 곱셈 생성기 multiply-one      → 곱(약수 문제의 수), 곱하는 수(배수의 밑)
   · 나눗셈 생성기 divide          → 피제수(나누어떨어지는 수 = 약수 문제의 수), 나누는 수·몫(배수의 밑)
   · 나눗셈 생성기 natural-div-2-1 → 나누어떨어지는 두 자리 피제수, 나누는 수
   위 생성기 출력에서 이 묶음의 조건(spec-natural.json: numberMin 2 · numberMax 100 · positiveIntegers)
   에 맞는 수만 걸러 내고, 중복을 지우고, seed 를 바꿔 가며 모자라면 더 뽑는다. 그래도 특정 수가
   한 번도 안 나오면 그 개념의 수 범위(4~100 또는 2~12)에서 빠진 수를 채운다 — 0-3-1 묶음과 같은
   방식이고, 정답(약수 목록·공약수·최대공약수·공배수·최소공배수)은 이 파일의 산술로 계산한다.
   같은 typeId · 같은 seed → 언제나 같은 문제지(Math.random 을 쓰지 않는다).

   ── 문항이 정해지는 방법(같은 문제가 한 장에 두 번 나오지 않게)
     약수 t1·t3        수 n 하나가 문항이다(4~100, 약수 4~8개). t3 은 빈칸 자리도 seed 로 정한다.
     약수 t2            (수 n, 보기 목록)이 문항이다 — 같은 n 이라도 보기가 다르면 다른 문항이다.
     배수 t1            (밑, 시작 번째)가 문항이다 — 6×3=▢ 6×4=▢ 6×5=▢ 처럼 목록의 일부를 만든다.
                        밑은 2~12뿐이라 11가지밖에 없으므로 시작 번째를 달리해 문항을 늘린다(11×8=88가지 이하).
     배수 t2            (밑, 보기 목록)이 문항이다.
     배수 t3            (밑, 시작 번째)가 문항이다 — 8개짜리 배열의 어느 부분인지가 다르면 다른 문항이다.
     공약수 t1·t2·t3    (작은 수, 큰 수) 짝이 문항이다. 공약수가 3개 이상(최대공약수 4 이상)인 짝만 쓴다.
     공배수 t1          (두 밑, 시작 번째)가 문항이다 — 두 목록의 어느 창을 보여 주는지가 다르면 다른 문항.
     공배수 t2          두 밑의 짝이 문항이다(최소공배수 100 이하).
     공배수 t3          (두 밑) 짝이 문항이다 — 처음 8개 목록 안에 공배수가 있는 짝만 쓴다.

   ── 배치(layout-rules.md)
     한 장 = 한 유형. 이 묶음은 전부 가로 한 줄 서식이라 가로셈·세로셈 섞임이 없고, 짝 유형
     (가분수↔대분수 같은)이 아니므로 한 장에 두 유형을 넣지 않는다.
     문항 수는 §2 "약수·배수·공약수·공배수 쓰기 2단 × 12줄 = 24"를 최소 기준으로 삼는다.
     표 서식은 §2 "표 채우기 — 한 장에 표 2~4개, 칸 40개 이상"을 따른다(표 4개 × 36칸 = 144칸).
     서식마다 단·줄은 이 파일이 정한 값(autoFit:false)을 쓴다 — 한 줄에 들어가는 글자 폭이 서식마다
     달라 sheet.js 의 자동 맞춤이 줄 수를 과하게 늘리기 때문이다. 줄 수는 실제 브라우저
     (Edge headless) 인쇄에서 한 쪽에 들어가는지 확인해 정했다(tmp-0-5-1-A/edge-probe.py).
     §2 "0·1이 들어가는 쉬운 문제는 10% 이하"는 이 묶음에서 다음처럼 지킨다 — 약수 목록에는
     1과 자기 자신이 반드시 들어가므로(약수의 정의) 목록의 1은 세지 않고, 배수의 밑을 2~12로 두어
     0·1의 배수 문제를 만들지 않는다. 고르기 문제의 보기에서도 1과 자기 자신은 뺀다.

   ── 서식(렌더러)은 이 파일에만 등록한다(공용 파일 sheet.js · formats-*.js · gen-bridge.js 는 고치지 않는다).
     ko051-divisor-list · ko051-divisor-choice · ko051-divisor-blank
     ko051-multiple-build · ko051-multiple-choice · ko051-multiple-array
     ko051-common-factor-list · ko051-gcd-write · ko051-factor-table
     ko051-common-multiple-list · ko051-lcm-write · ko051-multiple-table

   확인 도구: tmp-0-5-1-A/harness.py (V8 로 실제 생성·렌더) · tmp-0-5-1-A/check.py (파이썬 독립 검산)
              tmp-0-5-1-A/edge-probe.py (Edge headless 로 A4 쪽수·칸 넘침 실측)
*/
(function (root) {
  'use strict';

  const ANSWER_INK = '#d71f10';
  const BUNDLE = /^0-5-1-/;                       // 이 파일이 맡은 묶음
  const MUL_SOURCE = 'multiply-one';              // 기존 생성기 — 곱셈구구
  const DIV_SOURCES = ['divide', 'natural-div-2-1'];
  const MAX_DIVISORS = 8;                         // 약수 목록이 한 줄에 들어가는 최대 개수
  const ARRAY_TERMS = 8;                          // 배수 배열의 항 수
  const BUILD_TERMS = 3;                          // 곱셈으로 만드는 배수의 개수

  /* ================= 공통 도구 ================= */

  const el = (tag, className, value) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (value !== undefined) node.textContent = value;
    return node;
  };
  const esc = value => String(value === undefined || value === null ? '' : value)
    .replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const plain = (tag, className, html) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    node.innerHTML = html;
    return node;
  };

  // seed 하나에서만 나오는 난수. 같은 seed 면 같은 문제지가 나온다.
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

  function divisorList(n) {
    const out = [];
    for (let d = 1; d <= n; d++) if (n % d === 0) out.push(d);
    return out;
  }
  const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
  const lcm = (a, b) => a / gcd(a, b) * b;
  const multipleList = (base, start, count) =>
    Array.from({ length: count }, (_, i) => base * (start + i));
  const inBoth = (left, right) => left.filter(value => right.indexOf(value) >= 0);

  // 값의 글자 수로 빈칸·밑줄 폭을 정한다. 문제지의 빈 자리와 정답지의 답이 같은 폭을 쓴다.
  function widthEm(text, perChar) {
    const chars = String(text === undefined || text === null ? '' : text).length;
    return Math.max(3, chars * (perChar || 0.66)).toFixed(2) + 'em';
  }
  // 이 묶음의 유형마다 다른 문제가 나오게 seed 에 typeId 를 섞는다.
  function typeSeed(config) {
    const text = String((config && config.typeId) || '');
    let hash = 0x811C9DC5;
    for (let i = 0; i < text.length; i++) { hash ^= text.charCodeAt(i); hash = Math.imul(hash, 0x01000193); }
    return (((Number(config && config.seed) >>> 0) || 1) ^ hash) >>> 0;
  }
  const seedOf = (config, salt) => (typeSeed(config) ^ salt) >>> 0;

  /* ================= 1. 기존 생성기에서 수를 뽑는다 ================= */

  function legacyRows(id, seed, count) {
    if (!root.Worksheets || typeof root.Worksheets.generate !== 'function') return [];
    try {
      const rows = root.Worksheets.generate(id, seed >>> 0, count);
      return Array.isArray(rows) ? rows : [];
    } catch (error) { return []; }
  }

  // 생성기 출력에서 나온 수들 — 곱(약수의 후보), 곱하는 수, 나누어떨어지는 피제수, 나누는 수, 몫.
  // 곱셈의 두 인수와 나눗셈의 몫은 배수의 밑(2~12) 후보도 된다.
  function generatorNumbers(config) {
    const seed = seedOf(config, 0);
    const out = [], seen = new Set();
    const push = value => {
      const n = Math.round(Number(value));
      if (!Number.isFinite(n) || n < 2 || n > 108 || seen.has(n)) return;
      seen.add(n); out.push(n);
    };
    for (let batch = 0; batch < 160; batch++) {
      const s = (seed + batch * 104729) >>> 0;
      for (const row of legacyRows(MUL_SOURCE, s, 24)) {
        push(row.a); push(row.b); push(Number(row.a) * Number(row.b));
      }
      for (const row of legacyRows(DIV_SOURCES[0], (s + 15485863) >>> 0, 24)) {
        push(row.a); push(row.b); push(row.answer);                  // divide: a = b × 몫 (나누어떨어짐)
      }
      for (const row of legacyRows(DIV_SOURCES[1], (s + 32452843) >>> 0, 24)) {
        push(row.b);
        if (Number(row.a) % Number(row.b) === 0) push(row.a);        // 나누어떨어지는 것만 약수의 수로
      }
    }
    return out;
  }

  // 약수 문제에 쓸 수 있는 수인가 — 4~100이고 약수가 4~8개(목록이 한 줄에 들어간다).
  function divisorNumber(n) {
    if (!Number.isInteger(n) || n < 4 || n > 100) return null;
    const list = divisorList(n);
    if (list.length < 4 || list.length > MAX_DIVISORS) return null;
    return list;
  }
  // 배수 문제에 쓸 수 있는 밑인가 — 2~12.
  const multipleBase = n => Number.isInteger(n) && n >= 2 && n <= 12;

  // 조건에 맞는 수를 기존 생성기 출력에서 먼저 고르고, 빠진 수는 그 개념의 수 범위에서 채운다.
  function numberPool(config, accept) {
    const fromGenerator = [], seen = new Set();
    for (const value of generatorNumbers(config)) {
      if (!accept(value) || seen.has(value)) continue;
      seen.add(value); fromGenerator.push(value);
    }
    const fallback = [];
    for (let n = 2; n <= 100; n++) if (accept(n) && !seen.has(n)) fallback.push(n);
    return { fromGenerator, fallback };
  }
  const divisorPool = config => numberPool(config, n => !!divisorNumber(n));
  const basePool = config => numberPool(config, multipleBase);
  const allOf = pool => pool.fromGenerator.concat(pool.fallback);

  // 후보에서 문항 수만큼 고른다 — 생성기에서 나온 후보를 먼저 쓰고, 모자라면 채운 뒤,
  // 쉬운 것부터 줄 세운다. 고르는 순서는 seed 로만 정해진다.
  function pickList(config, candidates, count, salt, difficulty) {
    if (candidates.length < count) throw Error(config.typeId + ': 문항 후보 ' + candidates.length + '가지뿐이라 ' + count + '문항을 만들 수 없습니다.');
    const chosen = shuffle(candidates, random(seedOf(config, salt))).slice(0, count);
    return chosen.sort(difficulty);
  }

  /* ================= 2. 유형별 문항 만들기 ================= */

  const CONCEPTS = {
    '0-5-1-0': { name: '약수 찾기', kind: 'divisor' },
    '0-5-1-1': { name: '배수 찾기', kind: 'multiple' },
    '0-5-1-2': { name: '공약수와 최대공약수', kind: 'common-factor' },
    '0-5-1-3': { name: '공배수와 최소공배수', kind: 'common-multiple' }
  };
  function conceptOf(config) {
    const id = String(config.conceptId || config.typeId || '').slice(0, 7);
    const concept = CONCEPTS[id];
    if (!concept) throw Error(config.typeId + ': 알 수 없는 개념 ' + id);
    return concept;
  }
  function requireKind(config, kind) {
    const concept = conceptOf(config);
    if (concept.kind !== kind) throw Error(config.typeId + ': 서식과 개념이 맞지 않습니다(' + concept.name + ').');
  }

  // ── 약수 ─────────────────────────────────────────────────────────
  function divisorItems(config, count) {
    const pool = divisorPool(config);
    const chosen = [];
    const fromGenerator = shuffle(pool.fromGenerator, random(seedOf(config, 0x9E3779B9)));
    for (const n of fromGenerator) { if (chosen.length >= count) break; chosen.push(n); }
    if (chosen.length < count) {
      for (const n of shuffle(pool.fallback, random(seedOf(config, 0x85EBCA6B)))) {
        if (chosen.length >= count) break;
        chosen.push(n);
      }
    }
    if (chosen.length !== count) throw Error(config.typeId + ': 약수 문제의 수 ' + count + '개 중 ' + chosen.length + '개만 찾았습니다.');
    return chosen.sort((x, y) => x - y).map(n => ({ n, divisors: divisorNumber(n) }));
  }
  // 빠진 약수 채우기 — 가운데 약수 2곳을 빈칸으로 둔다(양 끝 1과 자기 자신은 남겨 답이 하나로 정해진다).
  function divisorBlankItems(config, count) {
    const rnd = random(seedOf(config, 0x27D4EB2F));
    return divisorItems(config, count).map(item => {
      const inner = item.divisors.slice(1, item.divisors.length - 1);
      const holes = shuffle(inner, rnd).slice(0, 2).sort((x, y) => x - y);
      return { n: item.n, divisors: item.divisors, holes, answer: item.divisors.join(', ') };
    });
  }
  // 나누어떨어지는 수 고르기 — n 을 나누어떨어지게 하는 수(약수) 2~3개와 아닌 수를 섞는다.
  // 보기는 n 이하의 수만 쓴다(n 보다 큰 수는 약수가 될 수 없어 보자마자 답이 아님이 드러난다).
  // 1과 자기 자신도 보기에서 뺀다(너무 쉬운 보기). 그래서 보기가 6개 이상 나오는 n ≥ 12 만 쓴다.
  function divisorChoiceItems(config, count) {
    const rnd = random(seedOf(config, 0x165667B1));
    const seen = new Set();
    const out = [];
    // n < 12 인 수는 보기 6개를 채울 수 없어 걸러지므로 넉넉히 뽑아 둔다.
    for (const item of divisorItems(config, count + 16)) {
      if (out.length >= count) break;
      const n = item.n;
      if (n < 12) continue;                                       // 보기 6개를 채우려면 n 이 충분히 커야 한다
      const proper = item.divisors.filter(d => d > 1 && d < n);
      const wrong = [];
      for (let v = 2; v < n && wrong.length < 10; v++) {
        if (n % v === 0) continue;
        wrong.push(v);
      }
      if (wrong.length < 4) continue;
      for (let attempt = 0; attempt < 30; attempt++) {
        const options = buildOptions(rnd, proper, wrong, 6);
        const key = n + ':' + options.options.map(o => o.v).join(',');
        if (seen.has(key)) continue;
        seen.add(key);
        out.push({ n, options: options.options });
        break;
      }
    }
    if (out.length !== count) throw Error(config.typeId + ': 고르기 문항 ' + count + '개 중 ' + out.length + '개만 만들었습니다.');
    return out.sort((x, y) => x.n - y.n);
  }
  // 맞는 보기 2~3개와 아닌 보기 3~4개, 모두 size 개. 보기는 작은 수부터 차례대로 인쇄한다.
  function buildOptions(rnd, correct, wrong, size) {
    const yes = shuffle(correct, rnd).slice(0, Math.min(correct.length, 3));
    const rest = [], used = new Set(yes);
    for (const value of shuffle(wrong, rnd)) {
      if (rest.length >= size - yes.length) break;
      if (used.has(value)) continue;
      used.add(value); rest.push(value);
    }
    const all = yes.map(v => ({ v, ok: true })).concat(rest.map(v => ({ v, ok: false })));
    all.sort((x, y) => x.v - y.v);
    return { options: all, correct: yes.length };
  }

  // ── 배수 ─────────────────────────────────────────────────────────
  // 곱셈으로 배수 목록 만들기 — (밑, 시작 번째). 밑은 2~12뿐이라 시작 번째로 문항을 늘린다.
  function multipleBuildItems(config, count) {
    const combos = [];
    for (const base of allOf(basePool(config))) {
      for (let start = 1; start + BUILD_TERMS - 1 <= 10; start++) {
        if (base * (start + BUILD_TERMS - 1) > 100) continue;
        combos.push({ base, start });
      }
    }
    // 첫 곱이 작은 것부터 — 같은 밑이 이웃하지 않게 밑이 섞이고, 수가 작은 문제부터 나온다.
    return pickList(config, combos, count, 0x7FEB352D, (x, y) => (x.base * x.start - y.base * y.start) || (x.base - y.base))
      .map(item => {
        const terms = [];
        for (let i = 0; i < BUILD_TERMS; i++) terms.push({ k: item.start + i, value: item.base * (item.start + i) });
        return { base: item.base, start: item.start, terms, answer: terms.map(t => t.value).join(', ') };
      });
  }
  // 수 목록에서 배수 고르기 — (밑, 보기 목록). 맞는 보기는 밑의 배수(밑 자신 제외).
  function multipleChoiceItems(config, count) {
    const rnd = random(seedOf(config, 0x2545F491));
    const bases = allOf(basePool(config));
    const seen = new Set();
    const out = [];
    let round = 0;
    while (out.length < count && round < 60) {
      round++;
      for (const base of shuffle(bases, rnd)) {
        if (out.length >= count) break;
        const proper = multipleList(base, 2, 7).filter(v => v <= 100);   // 밑의 2~8배 (밑 자신은 뺀다)
        // 아닌 보기도 맞는 보기와 같은 범위에서 고른다(너무 멀리 떨어진 수는 답이 아님을 알려 준다).
        const wrong = [];
        for (let v = base * 2; v <= Math.min(100, base * 8) && wrong.length < 12; v++) {
          if (v % base === 0) continue;
          wrong.push(v);
        }
        const options = buildOptions(rnd, proper, wrong, 6);
        const key = base + ':' + options.options.map(o => o.v).join(',');
        if (seen.has(key)) continue;
        seen.add(key);
        out.push({ base, options: options.options });
      }
    }
    if (out.length !== count) throw Error(config.typeId + ': 고르기 문항 ' + count + '개 중 ' + out.length + '개만 만들었습니다.');
    return out.sort((x, y) => (x.base - y.base) || (smallest(x.options) - smallest(y.options)));
  }
  const smallest = options => options.reduce((min, option) => Math.min(min, option.v), Infinity);
  // 배수 배열의 빈칸 채우기 — (밑, 시작 번째). 8개 배열에서 2곳을 빈칸으로 둔다.
  function multipleArrayItems(config, count) {
    const combos = [];
    for (const base of allOf(basePool(config))) {
      for (let start = 1; start + ARRAY_TERMS - 1 <= 16; start++) {
        if (base * (start + ARRAY_TERMS - 1) > 100) continue;
        combos.push({ base, start });
      }
    }
    const rnd = random(seedOf(config, 0x5BD1E995));
    // 첫 배수가 작은 것부터 — 같은 밑이 이웃하지 않게 밑이 섞인다.
    return pickList(config, combos, count, 0x7FEB352D, (x, y) => (x.base * x.start - y.base * y.start) || (x.base - y.base))
      .map(item => {
        const values = multipleList(item.base, item.start, ARRAY_TERMS);
        const holes = shuffle(values.slice(1, values.length - 1), rnd).slice(0, 2).sort((x, y) => x - y);
        return { base: item.base, start: item.start, values, holes };
      });
  }

  // ── 공약수 ───────────────────────────────────────────────────────
  // 공약수가 3개 이상(최대공약수 4 이상)인 두 수의 짝 — 약수 목록에서 수를 골라 짝짓는다.
  function commonFactorPairs(config, count) {
    const numbers = allOf(divisorPool(config));
    const strong = [], loose = [], seen = new Set();
    for (const a of numbers) {
      for (const b of numbers) {
        if (a >= b) continue;
        const common = divisorList(gcd(a, b));
        if (common.length < 3) continue;                       // 공약수가 1, 2개뿐인 짝은 너무 쉽다
        const key = a + ':' + b;
        if (seen.has(key)) continue;
        seen.add(key);
        (common.length >= 4 ? strong : loose).push({ a, b, da: divisorList(a), db: divisorList(b), common, greatest: gcd(a, b) });
      }
    }
    return pickList(config, strong.concat(loose), count, 0x85EBCA6B,
      (x, y) => (x.b - y.b) || (x.a - y.a));
  }

  // ── 공배수 ───────────────────────────────────────────────────────
  // 두 밑의 배수 목록(각각 start 번째부터 8개) 안에 함께 있는 수.
  // 두 목록의 겹치는 구간은 [큰 밑 × start, 작은 밑 × (start+7)] 이다 — 그 안의 공배수만 답이 된다.
  // (0개면 그 짝은 목록 문제에 쓰지 않는다.)
  function commonInArrays(a, b, start) {
    const step = lcm(a, b);
    const low = Math.max(a, b) * start;
    const high = Math.min(a, b) * (start + ARRAY_TERMS - 1);
    const out = [];
    for (let m = Math.ceil(low / step) * step; m <= high; m += step) out.push(m);
    return out;
  }
  // 배수 목록에서 공배수 찾기 — (두 밑, 시작 번째). 두 목록에 함께 있는 수가 답이다.
  function commonMultipleListItems(config, count) {
    const bases = allOf(basePool(config));
    const strong = [], loose = [];
    for (const a of bases) {
      for (const b of bases) {
        if (a >= b) continue;
        for (let start = 1; start + ARRAY_TERMS - 1 <= 16; start++) {
          if (b * (start + ARRAY_TERMS - 1) > 100) continue;
          const common = commonInArrays(a, b, start);
          if (!common.length) continue;
          const item = { a, b, start, common, ma: multipleList(a, start, ARRAY_TERMS), mb: multipleList(b, start, ARRAY_TERMS) };
          (common.length >= 2 ? strong : loose).push(item);
        }
      }
    }
    return pickList(config, strong.concat(loose), count, 0xC2B2AE35,
      (x, y) => (x.a - y.a) || (x.b - y.b) || (x.start - y.start));
  }
  // 공배수 중 최소공배수 쓰기 — 두 밑의 짝. 공배수는 작은 수부터 3개만 답으로 쓴다(지시문에 밝힌다).
  function commonMultipleWriteItems(config, count) {
    const bases = allOf(basePool(config));
    const combos = [];
    for (const a of bases) {
      for (const b of bases) {
        if (a >= b) continue;
        const least = lcm(a, b);
        if (least > 100) continue;                              // 초등 범위를 넘지 않게
        combos.push({ a, b, least, common: [least, least * 2, least * 3] });
      }
    }
    return pickList(config, combos, count, 0x2545F491, (x, y) => (x.b - y.b) || (x.a - y.a));
  }
  // 공배수 표의 빈칸 채우기 — 처음 8개 목록 안에 공배수가 있는 짝.
  function commonMultipleTableItems(config, count) {
    const bases = allOf(basePool(config));
    const strong = [], loose = [];
    for (const a of bases) {
      for (const b of bases) {
        if (a >= b) continue;
        const common = commonInArrays(a, b, 1);
        if (!common.length) continue;
        const item = { a, b, common, least: lcm(a, b), ma: multipleList(a, 1, ARRAY_TERMS), mb: multipleList(b, 1, ARRAY_TERMS) };
        (common.length >= 2 ? strong : loose).push(item);
      }
    }
    return pickList(config, strong.concat(loose), count, 0x27D4EB2F, (x, y) => (x.b - y.b) || (x.a - y.a));
  }

  // 답을 쓰는 줄의 폭을 한 장 안에서 같게 맞춘다(문제마다 줄 길이가 달라 보이지 않게).
  function evenWriteLines(list, fields) {
    let widest = 0;
    for (const item of list) {
      for (const field of fields) {
        const text = Array.isArray(item[field]) ? item[field].join(', ') : item[field];
        widest = Math.max(widest, String(text).length);
      }
    }
    for (const item of list) item.writeEm = widthEm('0'.repeat(widest));
    return list;
  }

  // ── 서식별 문항 ───────────────────────────────────────────────────
  function items(config) {
    const count = config.count || config.cols * config.rows;
    const format = config.format;
    if (format === 'ko051-divisor-list') {
      requireKind(config, 'divisor');
      return evenWriteLines(divisorItems(config, count), ['divisors']);
    }
    if (format === 'ko051-divisor-blank') {
      requireKind(config, 'divisor');
      return divisorBlankItems(config, count);
    }
    if (format === 'ko051-divisor-choice') {
      requireKind(config, 'divisor');
      return divisorChoiceItems(config, count);
    }
    if (format === 'ko051-multiple-build') {
      requireKind(config, 'multiple');
      return multipleBuildItems(config, count);
    }
    if (format === 'ko051-multiple-choice') {
      requireKind(config, 'multiple');
      return multipleChoiceItems(config, count);
    }
    if (format === 'ko051-multiple-array') {
      requireKind(config, 'multiple');
      return multipleArrayItems(config, count);
    }
    if (format === 'ko051-common-factor-list' || format === 'ko051-gcd-write') {
      requireKind(config, 'common-factor');
      return evenWriteLines(commonFactorPairs(config, count).map(item => ({ ...item, answer: item.common.join(', ') })), ['common']);
    }
    if (format === 'ko051-factor-table') {
      requireKind(config, 'common-factor');
      const rnd = random(seedOf(config, 0x165667B1));
      return commonFactorPairs(config, count).map(item => ({
        ...item,
        masks: {
          da: maskHoles(rnd, item.da, 3),
          db: maskHoles(rnd, item.db, 3),
          common: maskFirst(rnd, item.common, 2),
          greatest: true
        }
      }));
    }
    if (format === 'ko051-common-multiple-list') {
      requireKind(config, 'common-multiple');
      return evenWriteLines(commonMultipleListItems(config, count).map(item => ({ ...item, answer: item.common.join(', ') })), ['common']);
    }
    if (format === 'ko051-lcm-write') {
      requireKind(config, 'common-multiple');
      return evenWriteLines(commonMultipleWriteItems(config, count), ['common']);
    }
    if (format === 'ko051-multiple-table') {
      requireKind(config, 'common-multiple');
      const rnd = random(seedOf(config, 0x5BD1E995));
      return commonMultipleTableItems(config, count).map(item => ({
        ...item,
        masks: {
          ma: maskHoles(rnd, item.ma, 3),
          mb: maskHoles(rnd, item.mb, 3),
          common: maskFirst(rnd, item.common, 2),
          least: true
        }
      }));
    }
    throw Error(config.typeId + ': 이 묶음의 서식이 아닙니다 — ' + format);
  }

  // 목록에서 가운데 값 count 곳을 빈칸으로 고른다(첫 값과 끝 값은 남긴다 — 답이 하나로 정해진다).
  function maskHoles(rnd, values, count) {
    const inner = values.slice(1, values.length - 1);
    const holes = shuffle(inner, rnd).slice(0, Math.max(0, Math.min(count, inner.length)));
    return values.map(value => holes.indexOf(value) >= 0);
  }
  // 공약수·공배수 줄 — 첫 값(최대공약수·최소공배수)은 반드시 빈칸으로 두고 나머지에서 하나 더 고른다.
  // 그래야 최대공약수·최소공배수 칸의 답이 표 안에 그대로 인쇄되어 있지 않다.
  function maskFirst(rnd, values, count) {
    const holes = [values[0]];
    const rest = shuffle(values.slice(1), rnd).slice(0, Math.max(0, Math.min(count - 1, values.length - 1)));
    for (const value of rest) holes.push(value);
    return values.map(value => holes.indexOf(value) >= 0);
  }

  /* ================= 3. 서식(렌더러) ================= */

  let styled = false;
  function css() {
    if (styled || typeof document === 'undefined') return;
    styled = true;
    const style = document.createElement('style');
    style.id = 'ko051-style';
    style.textContent = `
      .ko051 { display:flex; flex-direction:column; justify-content:center; gap:.4mm; height:100%; white-space:nowrap; font-variant-numeric:tabular-nums; }
      .ko051-line { line-height:1.45; }
      .ko051-prompt { font-weight:bold; }
      .ko051-write { display:inline-block; border-bottom:1px solid #555; min-height:1.15em; vertical-align:-.2em; }
      .ko051-write.is-answer { color:${ANSWER_INK}; border-bottom-color:${ANSWER_INK}; }
      .ko051-box { display:inline-flex; align-items:center; justify-content:center; min-width:1.8em; height:1.2em; border:1px solid #555; vertical-align:-.24em; line-height:1; }
      .ko051-box.is-answer { color:${ANSWER_INK}; border-color:${ANSWER_INK}; }
      .ko051-sep { color:#555; }
      .ko051-gap { display:inline-block; width:1em; }
      .ko051-tight { display:inline-block; width:.75em; }
      .ko051-tablewrap { justify-content:flex-start; align-self:stretch; }
      .ko051-table { display:grid; flex:1; min-height:0; grid-template-rows:repeat(4, minmax(0, 1fr)); border-top:1px solid #999; border-left:1px solid #999; font-variant-numeric:tabular-nums; }
      .ko051-tcell { display:flex; align-items:center; justify-content:center; min-width:0; min-height:0; overflow:hidden; border-right:1px solid #999; border-bottom:1px solid #999; padding:0 1mm; }
      .ko051-tlabel { justify-content:flex-start; background:#f7f7f7; font-size:.85em; }
      .ko051-tset { grid-column:span 8; justify-content:flex-start; gap:3mm; }
      .ko051-tblank.is-answer { color:${ANSWER_INK}; }
      .ko051-tbox { display:inline-block; width:1.5em; height:1.1em; border:1px dashed #999; vertical-align:middle; }
      .ko051-opt { display:inline-block; min-width:1.8em; text-align:center; }
      .ko051-opt.is-answer { color:${ANSWER_INK}; font-weight:bold; }
      .ko051-ring { display:inline-block; min-width:1.8em; text-align:center; border:1px solid ${ANSWER_INK}; border-radius:50%; padding:0 .3mm; }
      .ko051-caption { font-size:.75em; color:#333; line-height:1.2; }
    `;
    document.head.appendChild(style);
  }

  // 빈 자리 폭: 그 문항의 writeEm(한 장에서 같게 맞춘 값)이 있으면 그것을, 없으면 답 길이로 정한다.
  const write = (value, answer, minWidth) =>
    `<span class="ko051-write${answer ? ' is-answer' : ''}" style="min-width:${minWidth || widthEm(value)}">${answer ? esc(value) : '&nbsp;'}</span>`;
  const box = (value, answer) =>
    `<span class="ko051-box${answer ? ' is-answer' : ''}">${answer ? esc(value) : ''}</span>`;
  const listText = values => values.join(', ');

  // 0-5-1-0-t1 곱셈 짝으로 약수 찾기
  function renderDivisorList(cell, q, answer) {
    css();
    const wrap = el('div', 'ko051');
    wrap.append(plain('div', 'ko051-line ko051-prompt', esc(q.n) + '의 약수'));
    wrap.append(plain('div', 'ko051-line', write(listText(q.divisors), answer, q.writeEm)));
    cell.append(wrap);
  }
  // 0-5-1-0-t2 나누어떨어지는 수 고르기
  function renderDivisorChoice(cell, q, answer) {
    css();
    const wrap = el('div', 'ko051');
    wrap.append(plain('div', 'ko051-line ko051-prompt', esc(q.n) + '를 나누어떨어지게 하는 수'));
    wrap.append(plain('div', 'ko051-line', optionsHTML(q.options, answer)));
    cell.append(wrap);
  }
  const optionsHTML = (options, answer) => options.map(option => (answer && option.ok
    ? `<span class="ko051-opt is-answer"><span class="ko051-ring">${esc(option.v)}</span></span>`
    : `<span class="ko051-opt">${esc(option.v)}</span>`)).join('<span class="ko051-gap"></span>');
  // 0-5-1-0-t3 빠진 약수 채우기
  function renderDivisorBlank(cell, q, answer) {
    css();
    const wrap = el('div', 'ko051');
    wrap.append(plain('div', 'ko051-line ko051-prompt', esc(q.n) + '의 약수'));
    const body = q.divisors.map(value => (q.holes.indexOf(value) >= 0 ? box(value, answer) : esc(value)))
      .join('<span class="ko051-sep">, </span>');
    wrap.append(plain('div', 'ko051-line', body));
    cell.append(wrap);
  }
  // 0-5-1-1-t1 곱셈으로 배수 목록 만들기
  function renderMultipleBuild(cell, q, answer) {
    css();
    const wrap = el('div', 'ko051');
    wrap.append(plain('div', 'ko051-line ko051-prompt', esc(q.base) + '의 배수'));
    const group = term => `${esc(q.base)}×${esc(term.k)}=${box(term.value, answer)}<span class="ko051-tight"></span>`;
    wrap.append(plain('div', 'ko051-line', q.terms.map(group).join('')));
    cell.append(wrap);
  }
  // 0-5-1-1-t2 수 목록에서 배수 고르기
  function renderMultipleChoice(cell, q, answer) {
    css();
    const wrap = el('div', 'ko051');
    wrap.append(plain('div', 'ko051-line ko051-prompt', esc(q.base) + '의 배수'));
    wrap.append(plain('div', 'ko051-line', optionsHTML(q.options, answer)));
    cell.append(wrap);
  }
  // 0-5-1-1-t3 배수 배열의 빈칸 채우기
  function renderMultipleArray(cell, q, answer) {
    css();
    const wrap = el('div', 'ko051');
    wrap.append(plain('div', 'ko051-line ko051-prompt', esc(q.base) + '의 배수'));
    const body = q.values.map(value => (q.holes.indexOf(value) >= 0 ? box(value, answer) : esc(value)))
      .join('<span class="ko051-sep">, </span>');
    wrap.append(plain('div', 'ko051-line', body));
    cell.append(wrap);
  }
  // 0-5-1-2-t1 약수 목록에서 공약수 찾기
  function renderCommonFactorList(cell, q, answer) {
    css();
    const wrap = el('div', 'ko051');
    wrap.append(plain('div', 'ko051-line', esc(q.a) + '의 약수 : ' + esc(listText(q.da))));
    wrap.append(plain('div', 'ko051-line', esc(q.b) + '의 약수 : ' + esc(listText(q.db))));
    wrap.append(plain('div', 'ko051-line ko051-prompt', '공약수 : ' + write(listText(q.common), answer, q.writeEm)));
    cell.append(wrap);
  }
  // 0-5-1-2-t2 공약수 중 최대공약수 쓰기 · 0-5-1-3-t2 공배수 중 최소공배수 쓰기
  function renderGreatest(cell, q, answer, labels) {
    css();
    const wrap = el('div', 'ko051');
    wrap.append(plain('div', 'ko051-line ko051-prompt', esc(q.a) + ' 와 ' + esc(q.b) + ' 의 ' + labels.title));
    wrap.append(plain('div', 'ko051-line', labels.list + ' : ' + write(listText(q.common), answer, q.writeEm)));
    wrap.append(plain('div', 'ko051-line', labels.answer + ' : ' + write(q.greatest, answer)));
    cell.append(wrap);
  }
  // 0-5-1-2-t3 공약수 표의 빈칸 채우기
  function renderFactorTable(cell, q, answer) {
    css();
    const wrap = el('div', 'ko051 ko051-tablewrap');
    wrap.append(plain('div', 'ko051-caption', esc(q.a) + ' 와 ' + esc(q.b)));
    wrap.append(tableNode({
      columns: '6.5em repeat(8, minmax(0, 1fr))',
      rows: [
        { label: q.a + '의 약수', values: q.da, masks: q.masks.da },
        { label: q.b + '의 약수', values: q.db, masks: q.masks.db },
        { label: '공약수', values: q.common, masks: q.masks.common, span: true },
        { label: '최대공약수', values: [q.greatest], masks: [q.masks.greatest], span: true }
      ]
    }, answer));
    cell.append(wrap);
  }
  // 0-5-1-3-t1 배수 목록에서 공배수 찾기
  function renderCommonMultipleList(cell, q, answer) {
    css();
    const wrap = el('div', 'ko051');
    wrap.append(plain('div', 'ko051-line', esc(q.a) + '의 배수 : ' + esc(listText(q.ma))));
    wrap.append(plain('div', 'ko051-line', esc(q.b) + '의 배수 : ' + esc(listText(q.mb))));
    wrap.append(plain('div', 'ko051-line ko051-prompt', '공배수 : ' + write(listText(q.common), answer, q.writeEm)));
    cell.append(wrap);
  }
  // 0-5-1-3-t3 공배수 표의 빈칸 채우기
  function renderMultipleTable(cell, q, answer) {
    css();
    const wrap = el('div', 'ko051 ko051-tablewrap');
    wrap.append(plain('div', 'ko051-caption', esc(q.a) + ' 와 ' + esc(q.b)));
    wrap.append(tableNode({
      columns: '6.5em repeat(8, minmax(0, 1fr))',
      rows: [
        { label: q.a + '의 배수', values: q.ma, masks: q.masks.ma },
        { label: q.b + '의 배수', values: q.mb, masks: q.masks.mb },
        { label: '공배수', values: q.common, masks: q.masks.common, span: true },
        { label: '최소공배수', values: [q.least], masks: [q.masks.least], span: true }
      ]
    }, answer));
    cell.append(wrap);
  }

  // 표 한 개 — 값 줄은 이름표 + 값 칸 8개, 마지막 두 줄은 이름표 + (8칸을 합친) 값 줄.
  // 빈칸 칸은 점선 상자로 표시한다(값이 없는 칸과 헷갈리지 않게). 정답지에서는 그 자리에 답이 들어간다.
  function tableNode(spec, answer) {
    const grid = el('div', 'ko051-table');
    grid.style.gridTemplateColumns = spec.columns;
    for (const row of spec.rows) {
      grid.append(el('div', 'ko051-tcell ko051-tlabel', row.label));
      if (row.span) {
        const set = el('div', 'ko051-tcell ko051-tset');
        row.values.forEach((value, index) => {
          const blank = row.masks[index] === true;
          if (!blank) { set.append(el('span', '', String(value))); return; }
          set.append(answer
            ? plain('span', 'ko051-tblank is-answer', esc(value))
            : plain('span', 'ko051-tblank', '<span class="ko051-tbox"></span>'));
        });
        grid.append(set);
      } else {
        for (let i = 0; i < MAX_DIVISORS; i++) {
          const value = row.values[i];
          const blank = row.masks[i] === true;
          if (!blank) {
            grid.append(el('div', 'ko051-tcell', value === undefined ? '' : String(value)));
            continue;
          }
          grid.append(answer
            ? plain('div', 'ko051-tcell ko051-tblank is-answer', esc(value))
            : plain('div', 'ko051-tcell ko051-tblank', '<span class="ko051-tbox"></span>'));
        }
      }
    }
    return grid;
  }

  function register() {
    if (!root.Sheet || typeof root.Sheet.register !== 'function') return false;
    root.Sheet.register('ko051-divisor-list', renderDivisorList);
    root.Sheet.register('ko051-divisor-choice', renderDivisorChoice);
    root.Sheet.register('ko051-divisor-blank', renderDivisorBlank);
    root.Sheet.register('ko051-multiple-build', renderMultipleBuild);
    root.Sheet.register('ko051-multiple-choice', renderMultipleChoice);
    root.Sheet.register('ko051-multiple-array', renderMultipleArray);
    root.Sheet.register('ko051-common-factor-list', renderCommonFactorList);
    root.Sheet.register('ko051-gcd-write', (cell, q, answer) =>
      renderGreatest(cell, q, answer, { title: '최대공약수', list: '공약수', answer: '최대공약수' }));
    root.Sheet.register('ko051-factor-table', renderFactorTable);
    root.Sheet.register('ko051-common-multiple-list', renderCommonMultipleList);
    root.Sheet.register('ko051-lcm-write', (cell, q, answer) =>
      renderGreatest(cell, q, answer, { title: '최소공배수', list: '공배수', answer: '최소공배수' }));
    root.Sheet.register('ko051-multiple-table', renderMultipleTable);
    return true;
  }

  /* ================= 4. 문항 만들기 연결 ================= */

  function connect() {
    if (!root.SheetGen || typeof root.SheetGen.generate !== 'function' || root.SheetGen.factors051) return false;
    const base = root.SheetGen.generate;
    root.SheetGen.generate = function (config) {
      if (config && BUNDLE.test(String(config.typeId || ''))) return items(config);
      return base.apply(this, arguments);
    };
    Object.defineProperty(root.SheetGen, 'factors051', { value: true });
    return true;
  }

  /* ================= 5. 유형 등록 ================= */
  // cols·rows 는 layout-rules §2 의 서식별 최소 기준과 실제 인쇄 실측으로 정했다(autoFit:false).
  //   2단 × 12~16줄 = 24~32문항 (약수·배수·공약수·공배수 쓰기의 최소 2단 × 12줄 = 24 이상)
  //   표 서식은 1단 × 4줄 = 표 4개(표마다 4줄 × 9칸 = 36칸 → 144칸, §2 "칸 40개 이상")
  // 문항 순서는 쉬운 것 → 어려운 것(수 크기 기준).
  const TYPES = [
    // 0-5-1-0 약수 찾기
    { typeId: '0-5-1-0-t1', conceptId: '0-5-1-0', title: '곱셈 짝으로 약수 찾기', instruction: '곱셈 짝을 이용하여 약수를 모두 쓰세요.',
      format: 'ko051-divisor-list', cols: 2, rows: 12, fontPt: 15, seed: 20261101, autoFit: false },
    { typeId: '0-5-1-0-t2', conceptId: '0-5-1-0', title: '나누어떨어지는 수 고르기', instruction: '왼쪽 수를 나누어떨어지게 하는 수에 모두 ○표 하세요.',
      format: 'ko051-divisor-choice', cols: 2, rows: 12, fontPt: 16, seed: 20261102, autoFit: false },
    { typeId: '0-5-1-0-t3', conceptId: '0-5-1-0', title: '빠진 약수 채우기', instruction: '빈칸에 알맞은 수를 써넣으세요.',
      format: 'ko051-divisor-blank', cols: 2, rows: 12, fontPt: 17, seed: 20261103, autoFit: false },

    // 0-5-1-1 배수 찾기
    { typeId: '0-5-1-1-t1', conceptId: '0-5-1-1', title: '곱셈으로 배수 목록 만들기', instruction: '곱셈을 이용하여 빈칸에 알맞은 수를 써넣으세요.',
      format: 'ko051-multiple-build', cols: 2, rows: 12, fontPt: 15, seed: 20261111, autoFit: false },
    { typeId: '0-5-1-1-t2', conceptId: '0-5-1-1', title: '수 목록에서 배수 고르기', instruction: '왼쪽 수의 배수에 모두 ○표 하세요.',
      format: 'ko051-multiple-choice', cols: 2, rows: 12, fontPt: 16, seed: 20261112, autoFit: false },
    { typeId: '0-5-1-1-t3', conceptId: '0-5-1-1', title: '배수 배열의 빈칸 채우기', instruction: '배수의 배열에서 빈칸에 알맞은 수를 써넣으세요.',
      format: 'ko051-multiple-array', cols: 2, rows: 12, fontPt: 17, seed: 20261113, autoFit: false },

    // 0-5-1-2 공약수와 최대공약수
    { typeId: '0-5-1-2-t1', conceptId: '0-5-1-2', title: '약수 목록에서 공약수 찾기', instruction: '두 수의 약수 목록을 보고 공약수를 모두 쓰세요.',
      format: 'ko051-common-factor-list', cols: 2, rows: 10, fontPt: 13, seed: 20261121, autoFit: false, maxProblems: 20 },
    { typeId: '0-5-1-2-t2', conceptId: '0-5-1-2', title: '공약수 중 최대공약수 쓰기', instruction: '두 수의 공약수를 모두 쓰고, 최대공약수를 쓰세요.',
      format: 'ko051-gcd-write', cols: 2, rows: 9, fontPt: 14, seed: 20261122, autoFit: false },
    { typeId: '0-5-1-2-t3', conceptId: '0-5-1-2', title: '공약수 표의 빈칸 채우기', instruction: '표의 빈칸에 알맞은 수를 써넣으세요.',
      format: 'ko051-factor-table', cols: 1, rows: 4, fontPt: 22, seed: 20261123, autoFit: false },

    // 0-5-1-3 공배수와 최소공배수
    { typeId: '0-5-1-3-t1', conceptId: '0-5-1-3', title: '배수 목록에서 공배수 찾기', instruction: '두 수의 배수 목록에 함께 있는 수를 모두 찾아 쓰세요.',
      format: 'ko051-common-multiple-list', cols: 2, rows: 10, fontPt: 13, seed: 20261131, autoFit: false, maxProblems: 20 },
    { typeId: '0-5-1-3-t2', conceptId: '0-5-1-3', title: '공배수 중 최소공배수 쓰기', instruction: '두 수의 공배수를 작은 수부터 3개 쓰고, 최소공배수를 쓰세요.',
      format: 'ko051-lcm-write', cols: 2, rows: 9, fontPt: 14, seed: 20261132, autoFit: false },
    { typeId: '0-5-1-3-t3', conceptId: '0-5-1-3', title: '공배수 표의 빈칸 채우기', instruction: '표의 빈칸에 알맞은 수를 써넣으세요.',
      format: 'ko051-multiple-table', cols: 1, rows: 4, fontPt: 22, seed: 20261133, autoFit: false }
  ];

  function publish() {
    if (!Array.isArray(root.SheetCatalog)) return false;
    const have = new Set(root.SheetCatalog.map(entry => entry.typeId));
    for (const type of TYPES) {
      if (have.has(type.typeId)) continue;
      root.SheetCatalog.push({ ...type, count: type.cols * type.rows });
    }
    return true;
  }

  if (!register()) document.addEventListener('DOMContentLoaded', register, { once: true });
  if (!connect()) document.addEventListener('DOMContentLoaded', connect, { once: true });
  if (!publish()) document.addEventListener('DOMContentLoaded', publish, { once: true });

  root.Bundle051 = { types: TYPES, items, generatorNumbers, divisorNumber, multipleBase, divisorList, gcd, lcm, css };
})(globalThis);
