/* ?? 1-2-2: ?? ?? ?? ?? ??? ???? ??? 32? ??? ????. */
(function (root) {
  'use strict';

  /* ================= 1. 분수 도구 ================= */

  const GCD = (a, b) => (b ? GCD(b, a % b) : Math.abs(a) || 1);

  /** '2 1/5' | '7/4' | '3' → {whole, n, d} */
  function parts(text) {
    const s = String(text).trim();
    const mixed = s.match(/^(\d+)\s+(\d+)\/(\d+)$/);
    if (mixed) return { whole: +mixed[1], n: +mixed[2], d: +mixed[3] };
    const plain = s.match(/^(\d+)\/(\d+)$/);
    if (plain) return { whole: 0, n: +plain[1], d: +plain[2] };
    return { whole: +s, n: 0, d: 1 };
  }
  const isProper = p => p.d > 1 && p.whole === 0 && p.n > 0 && p.n < p.d;
  const isImproper = p => p.d > 1 && p.whole === 0 && p.n >= p.d;
  const isMixed = p => p.d > 1 && p.whole > 0 && p.n > 0 && p.n < p.d;
  const isWhole = p => p.d === 1 && p.whole > 0;
  const isLowest = p => p.n === 0 || GCD(p.n, p.d) === 1;
  const sameValue = (x, y) => x[0] * y[1] === y[0] * x[1];

  /** 기약분수·대분수 표기 (공용 분수 서식과 같은 규칙). */
  function canonical(n, d) {
    if (root.FractionSheet && root.FractionSheet.answer) return root.FractionSheet.answer(n, d);
    const g = GCD(n, d), num = n / g, den = d / g;
    if (den === 1) return String(num);
    const whole = Math.trunc(num / den), rest = Math.abs(num % den);
    return whole && rest ? whole + ' ' + rest + '/' + den : num + '/' + den;
  }
  function valueOf(text) {
    const p = parts(text);
    return [p.whole * p.d + p.n, p.d];
  }

  /* ================= 2. 개념 조건 ================= */

  // need(앞 수, 뒤 수) — 개념 이름이 말하는 조건. 두 수의 분수 부분은 기약 상태여야 한다.
  const unequal = (a, b) => a.d > 1 && b.d > 1 && a.d !== b.d;
  const multiple = (a, b) => a.d % b.d === 0 || b.d % a.d === 0;
  const fractionPart = p => p.n / p.d;
  const CONCEPTS = [
    { id:'1-2-2-0', name:'진분수 − 진분수 — 한 분모가 다른 분모의 배수', source:'fraction-sub-different',
      need:(a,b)=>isProper(a)&&isProper(b)&&unequal(a,b)&&multiple(a,b)&&fractionPart(a)>fractionPart(b) },
    { id:'1-2-2-1', name:'진분수 − 진분수 — 통분 후 계산', source:'fraction-sub-different',
      need:(a,b)=>isProper(a)&&isProper(b)&&unequal(a,b)&&!multiple(a,b)&&fractionPart(a)>fractionPart(b) },
    { id:'1-2-2-2', name:'가분수가 포함된 뺄셈', source:'fraction-sub-improper-proper',
      need:(a,b)=>isImproper(a)&&isProper(b)&&unequal(a,b) },
    { id:'1-2-2-3', name:'대분수 − 진분수 — 받아내림 없음', source:'fraction-sub-mixed-proper',
      need:(a,b)=>isMixed(a)&&isProper(b)&&unequal(a,b)&&fractionPart(a)>fractionPart(b) },
    { id:'1-2-2-4', name:'대분수 − 진분수 — 받아내림 있음', source:'fraction-sub-mixed-proper',
      need:(a,b)=>isMixed(a)&&isProper(b)&&unequal(a,b)&&fractionPart(a)<fractionPart(b) },
    { id:'1-2-2-5', name:'대분수 − 대분수 — 받아내림 없음', source:'fraction-sub-mixed-mixed',
      need:(a,b)=>isMixed(a)&&isMixed(b)&&unequal(a,b)&&a.whole>b.whole&&fractionPart(a)>fractionPart(b) },
    { id:'1-2-2-6', name:'대분수 − 대분수 — 받아내림 있음', source:'fraction-sub-mixed-mixed',
      need:(a,b)=>isMixed(a)&&isMixed(b)&&unequal(a,b)&&a.whole>b.whole&&fractionPart(a)<fractionPart(b) },
    { id:'1-2-2-7', name:'자연수 − 대분수', source:'fraction-sub-whole-mixed',
      need:(a,b)=>isWhole(a)&&isMixed(b)&&a.whole>b.whole+1 }
  ];
  const BY_KEY = new Map(CONCEPTS.map(c => [c.id, c]));
  const conceptOf = typeId => BY_KEY.get(String(typeId).replace(/-t\d$/, ''));

  /* ================= 3. 문항 고르기 ================= */

  const BATCH = 64;     // 한 번에 뽑는 문항 수
  const ROUNDS = 900;   // 조건에 맞는 문항을 모으는 최대 횟수
  const STALE = 180;     // 새 문항이 이만큼 연속으로 안 나오면 그만 뽑는다

  /**
   * 개념 조건에 맞는 고유 문항을 쉬운 것 → 어려운 것 순서로 모은다. 같은 seed → 같은 목록.
   * easyLimit: 분자가 1인 쉬운 문항의 최대 개수(최종 문제지 기준). soft 면 모자라도 오류를 내지 않는다.
   */
  function pool(concept, seed, want, easyLimit, soft) {
    const seen = new Set(), items = [];
    let easy = 0, stale = 0;
    for (let round = 0; round < ROUNDS && items.length < want && stale < STALE; round++) {
      const rows = root.Worksheets.generate(concept.source, (Number(seed) + Math.imul(round, 104729)) >>> 0, BATCH);
      let added = 0;
      for (const q of rows) {
        if (items.length >= want) break;
        const pa = parts(q.a), pb = parts(q.b);
        if (!concept.need(pa, pb) || !isLowest(pa) || !isLowest(pb)) continue;
        const key = q.a + '|' + q.b;
        if (seen.has(key)) continue;
        seen.add(key);
        // 빼기는 기존 생성기의 exact() 로 계산하고, 기존 정답과 값이 같은지 확인한다.
        const [n, d] = root.Worksheets.exact(q.a, q.b, '−');
        if (n <= 0 || !sameValue([n, d], valueOf(q.answer))) {
          throw Error(concept.id + ': 정답이 맞지 않습니다 — ' + q.a + ' − ' + q.b + ' (' + q.answer + ')');
        }
        if (concept.noWholeAnswer && n % d === 0) continue;   // 답이 자연수인 문항은 쓰지 않는다
        const trivial = pa.n === 1 || pb.n === 1;      // 분자가 1인 쉬운 문항
        if (trivial && easy >= easyLimit) continue;
        if (trivial) easy++;
        const cd = pa.d / GCD(pa.d, pb.d) * pb.d;
        const an = pa.n * (cd / pa.d), bn = pb.n * (cd / pb.d);
        const borrow = an < bn;
        const whole = pa.whole - pb.whole - (borrow ? 1 : 0);
        const num = an - bn + (borrow ? cd : 0);
        if (whole < 0 || num < 0 || !sameValue([whole * cd + num, cd], [n, d])) {
          throw Error(concept.id + ': ?? ??? ?? ???? ? ' + q.a + ' ? ' + q.b);
        }
        items.push({
          a: q.a, b: q.b, pa: pa, pb: pb, borrow: borrow,
          cd: cd, an: an, bn: bn, whole: whole, num: num,
          value: [n, d], text: canonical(n, d),
          rank: (pa.whole + pb.whole) * 3 + (pa.n + pb.n) + cd * 2
        });
        added++;
      }
      stale = added ? 0 : stale + 1;
    }
    if (!soft && items.length < want) throw Error(concept.id + ': 조건에 맞는 문항이 ' + items.length + '개뿐입니다(' + want + '개 필요).');
    items.sort((x, y) => x.rank - y.rank || x.a.localeCompare(y.a) || x.b.localeCompare(y.b));
    return items;
  }
  /** 문제지 한 장에 넣을 만큼만 (쉬운 문항 10% 이하 규칙은 pool 에서 이미 지켰다) */
  const pick = (items, count) => items.slice(0, count);
  const easyOf = count => Math.floor(count * 0.1);

  /**
   * pool 전체를 분모별로 돌아가며 섞은 순서. 쉬운 순서(rank)는 분모마다 그대로 두되,
   * 앞에서 잘라 쓰지 않게 해서 한 장에 분모 한두 가지가 몰리는 것을 막는다(검수 D 3·4).
   */
  function spread(items) {
    const buckets = new Map();
    for (const q of items) {
      if (!buckets.has(q.cd)) buckets.set(q.cd, []);
      buckets.get(q.cd).push(q);                      // items 는 이미 쉬운 순서다
    }
    const out = [];
    for (let round = 0; out.length < items.length; round++) {
      let added = false;
      for (const list of buckets.values()) if (list[round]) { out.push(list[round]); added = true; }
      if (!added) break;
    }
    return out;
  }

  /* ================= 4. 유형별 문항 만들기 ================= */

  /** 수 표시 조각 — {t:'num'|'frac'|'mixed'} */
  function show(p) {
    if (p.d === 1) return { t: 'num', s: String(p.whole) };
    if (p.whole > 0) return { t: 'mixed', w: p.whole, n: p.n, d: p.d };
    return { t: 'frac', n: p.n, d: p.d };
  }
  const EQ = { t: 'text', s: '=' };
  const MINUS = { t: 'text', s: '−' };
  const tag = text => (String(text).indexOf('/') < 0 ? String(text) : '[' + text + ']');
  const oneTag = p => (p.d === 1 ? String(p.whole) : p.whole > 0 ? `[${p.whole} ${p.n}/${p.d}]` : `[${p.n}/${p.d}]`);
  const middleText = q => (q.whole > 0 ? q.whole + ' ' + q.num + '/' + q.cd : q.num + '/' + q.cd);

  /** t1 가로식으로 계산하기 — 공용 분수 렌더러(formats-fraction.js)가 그대로 그린다. */
  const horizontalItem = q => ({ kind: 'same', a: q.a, b: q.b, op: '−', result: q.text });

  /** t2 단계별 계산의 빈칸 채우기 — ① 분자끼리 빼기(또는 받아내림) ② 기약분수·대분수로 고치기
      마지막 `= ___`(②의 답 자리)는 약분이 필요 없는 문항에도 똑같이 붙인다 — 한 장 안에서
      문항 모양이 갈리면 안 된다(layout-rules §5, 검수 C 2회차). */
  function stepsItem(q) {
    const chain = [show(q.pa), MINUS, show(q.pb), EQ];
    const convertedA = { whole:q.pa.whole, n:q.an, d:q.cd };
    const convertedB = { whole:q.pb.whole, n:q.bn, d:q.cd };
    chain.push(show(convertedA), MINUS, show(convertedB), EQ);
    chain.push(q.whole > 0
      ? { t:'mixedBlank', w:q.whole, d:q.cd, ans:String(q.num) }
      : { t:'fracBlank', d:q.cd, ans:String(q.num) });
    // 자연수 부분과 분자 네모로 결과를 완성한다. 중복된 마지막 답란은 생략한다.
    return { kind:'steps', parts:chain, answer:q.text, blanks:1 };
  }

  /** t3 계산 결과와 같은 분수 연결하기 — 식과 답을 짝으로. 값이 겹치면 헷갈리므로 값도 고유하게. */
  function matchPairs(concept, seed, count) {
    const left = new Set(), value = new Set(), pairs = [];
    for (const q of spread(pool(concept, seed, count * 8, concept.id === "1-2-2-0" ? count * 8 : easyOf(count), true))) {
      const expression = q.a + ' − ' + q.b;
      // 값이 겹치면 어느 식에 이어야 할지 헷갈리므로 기약 표기(q.text)로 견준다.
      if (left.has(expression) || value.has(q.text)) continue;
      left.add(expression); value.add(q.text);
      pairs.push([{ html: exprHTML(q.pa, q.pb) }, shown(q.text), q.rank]);
      if (pairs.length === count) break;
    }
    if (pairs.length !== count) throw Error(concept.id + ': 연결할 짝이 ' + pairs.length + '개뿐입니다.');
    pairs.sort((x, y) => x[2] - y[2]);                 // 문제지는 쉬운 것부터
    return pairs.map(pair => [pair[0], pair[1]]);
  }
  const fracHTML = (n, d) => `<span class="mt-frac"><span>${n}</span><span>${d}</span></span>`;
  function oneHTML(p) {
    if (p.d === 1) return String(p.whole);
    if (p.whole > 0) return `<span class="mt-mixed"><span>${p.whole}</span>${fracHTML(p.n, p.d)}</span>`;
    return fracHTML(p.n, p.d);
  }
  const exprHTML = (pa, pb) => `${oneHTML(pa)} − ${oneHTML(pb)}`;
  function shown(text) {
    const p = parts(text);
    if (p.d === 1) return String(text);
    return p.whole > 0 ? { mixed: String(text) } : { frac: String(text) };
  }

  /* ---- t4 잘못된 계산 과정 고치기: 개념마다 실제로 흔한 오류를 만든다 ---- */
  const ERROR_KINDS = {
    'frac-not-reduced': { label: '약분 안 함', note: '답을 약분하지 않음' },
    'frac-added': { label: '분자끼리 더함', note: '빼야 할 분자를 더함' },
    'frac-whole-flat': { label: '자연수 안 고침', note: '자연수를 분수로 바꾸지 않고 분자끼리만 뺌' },
    'frac-dropped-whole': { label: '자연수 빠뜨림', note: '답에 자연수 부분을 쓰지 않음' },
    'frac-whole-kept': { label: '자연수 안 뺌', note: '빼는 수의 자연수 부분을 빼지 않음' },
    'frac-borrow-skipped': { label: '받아내림 안 함', note: '대분수에서 받아내림을 하지 않음' }
  };

  /** 이 문항에 쓸 수 있는 오류 목록 — wrong 은 '학생이 쓴 답'. 값이 바른 답과 같으면 쓰지 않는다. */
  function errorKinds(q) {
    const out = [];
    const add = (id, num, whole, raw) => {
      if (num <= 0) return;
      if (whole > 0 && num >= q.cd) return;            // 대분수 자리에 가분수가 오면 어색하다
      const value = [whole * q.cd + num, q.cd];
      if (sameValue(value, q.value)) return;
      out.push({ id: id, value: value, raw: raw, sameValue: false });
    };
    // ① 답을 약분하지 않음 (값은 같고 적은 모양이 틀림)
    if (GCD(q.num, q.cd) > 1) out.push({ id: 'frac-not-reduced', value: [q.num, q.cd], raw: middleText(q), sameValue: true });
    // ② 어느 개념에서나 흔한 오류 — 빼야 할 분자를 더함
    const wholeDiff = q.pa.whole - q.pb.whole, numeratorSum = q.an + q.bn;
    add('frac-added', numeratorSum, wholeDiff, wholeDiff > 0 ? wholeDiff + ' ' + numeratorSum + '/' + q.cd : numeratorSum + '/' + q.cd);
    // ③ 개념마다 다른 흔한 오류
    if (q.pa.d === 1) {                                            // 자연수 − 진분수
      add('frac-whole-flat', q.pa.whole - q.bn, 0, (q.pa.whole - q.bn) + '/' + q.cd);
    } else if (q.pa.whole > 0 && q.pb.whole === 0 && !q.borrow) {   // 대분수 − 진분수 (받아내림 없음)
      add('frac-dropped-whole', q.num, 0, q.num + '/' + q.cd);
    } else if (q.pa.whole > 0 && q.pb.whole > 0 && !q.borrow) {     // 대분수 − 대분수 (받아내림 없음)
      add('frac-whole-kept', q.num, q.pa.whole, q.pa.whole + ' ' + q.num + '/' + q.cd);
    } else if (q.borrow) {                                         // 받아내림을 하지 않음
      add('frac-borrow-skipped', q.bn - q.an, q.pa.whole, q.pa.whole + ' ' + (q.bn - q.an) + '/' + q.cd);
    }
    return out;
  }

  /** 오류가 들어간 풀이 한 문항 — formats-errorfix.js 의 문항 모양 그대로.
      used — 이 문제지에서 이미 쓴 오류 종류. 한 장에 한 종류만 나오지 않게 가장 적게 쓴 것을 고른다(검수 D 4). */
  function errorItem(q, used) {
    const kinds = errorKinds(q);
    if (!kinds.length) return null;
    const count = id => (used && used.get(id)) || 0;
    const pick = kinds.slice().sort((x, y) => count(x.id) - count(y.id))[0];
    const kind = ERROR_KINDS[pick.id];
    const line1 = `${oneTag(q.pa)} − ${oneTag(q.pb)}`;
    const borrowed = q.borrow ? parts(q.pa.whole - 1 > 0 ? `${q.pa.whole - 1} ${q.cd + q.an}/${q.cd}` : `${q.cd + q.an}/${q.cd}`) : null;
    const right = [line1];
    if (borrowed) right.push(`= ${oneTag(borrowed)} − ${oneTag(q.pb)}`);
    if (q.text !== middleText(q)) right.push(`= ${tag(middleText(q))}`);
    right.push(`= ${tag(q.text)}`);
    return {
      key: q.a + ' − ' + q.b + ':' + pick.id,
      kind: pick.id,
      rank: q.rank,
      prompt: q.a + ' − ' + q.b,
      label: kind.label,
      note: kind.note,
      wrong: {
        text: pick.raw, value: pick.value, sameValue: !!pick.sameValue,
        lines: [{ t: 'text', s: line1 }, { t: 'text', s: '= *' + tag(pick.raw) + '*' }]
      },
      right: { text: q.text, value: q.value, lines: right.map(s => ({ t: 'text', s: s })) },
      work: { type: 'lines', count: 2 }
    };
  }

  /* ================= 5. SheetGen 연결 ================= */

  const HORIZONTAL = 'fracsubdiff-horizontal';
  const STEPS = 'fracsubdiff-steps';
  const MATCH = 'fracsubdiff-match';
  const ERROR = 'fracsubdiff-error-fix';

  function build(config) {
    const concept = conceptOf(config.typeId);
    if (!concept) throw Error('이 묶음의 유형이 아닙니다: ' + config.typeId);
    css();                                   // 이 묶음 쪽 머리말·정답 표시 서식
    const task = String(config.typeId).slice(-2);
    const count = config.count || config.cols * config.rows;
    const seed = Number(config.seed) || 1;
    if (task === 't1') return pick(pool(concept, seed, count, easyOf(count)), count).map(horizontalItem);
    if (task === 't2') return pick(pool(concept, seed, count, easyOf(count)), count).map(stepsItem);
    if (task === 't4') {
      const items = [], seen = new Set(), used = new Map();
      for (const q of spread(pool(concept, seed, count * 8, easyOf(count), true))) {
        const built = errorItem(q, used);
        if (!built || seen.has(built.key)) continue;
        seen.add(built.key);
        used.set(built.kind, (used.get(built.kind) || 0) + 1);
        items.push(built);
        if (items.length === count) break;
      }
      if (items.length !== count) throw Error(config.typeId + ': 고칠 계산을 ' + items.length + '개밖에 만들지 못했습니다.');
      items.sort((x, y) => x.rank - y.rank || x.prompt.localeCompare(y.prompt));
      items.forEach((item, index) => { item.no = index + 1; });
      return items;
    }
    throw Error('이 묶음에서 만들지 않는 유형입니다: ' + config.typeId);
  }

  const baseGenerate = root.SheetGen.generate;
  const MINE = new Set([HORIZONTAL, STEPS, ERROR]);
  root.SheetGen.generate = function (config) {
    if (config && MINE.has(config.format)) return build(config);
    return baseGenerate.apply(this, arguments);
  };

  // 머리말 서식(제목 한 줄)은 이 묶음 쪽에만 걸리게 쪽마다 표시를 달아 둔다.
  const baseRender = root.Sheet.render;
  root.Sheet.render = function (config) {
    const result = baseRender.apply(this, arguments);
    if (config && (MINE.has(config.format) || config.format === MATCH)) {
      const target = document.getElementById('sheet-root') || document;
      const pages = target.querySelectorAll('.sheet-page');
      for (let i = 0; i < pages.length; i++) pages[i].classList.add('fracsubdiff-page');
    }
    return result;
  };

  /* ================= 6. 서식 등록 ================= */

  function css() {
    if (document.getElementById('fracsubdiff-style')) return;
    const style = document.createElement('style');
    style.id = 'fracsubdiff-style';
    style.textContent = [
      '.fx-line{display:flex;align-items:center;white-space:nowrap;line-height:1.1}',
      '.fx-frac{display:inline-flex;flex-direction:column;text-align:center;line-height:1.06;vertical-align:middle;min-width:1.4em;font-variant-numeric:tabular-nums}',
      '.fx-frac>span:first-child{border-bottom:1px solid #111;padding:0 .12em .06em}',
      '.fx-frac>span:last-child{padding-top:.06em}',
      '.fx-mixed{display:inline-flex;align-items:center;gap:.1em}',
      '.fx-op{margin:0 .12em}',
      '.fx-blank{display:inline-flex;align-items:center;justify-content:center;min-width:15mm;height:14mm;border:1px solid #57736a;box-sizing:border-box;flex:none}',
      '.fx-box{display:inline-block;min-width:1.35em;height:1.15em;border:1px solid #777}',
      '.fx-ink{color:#d71f10}',
      '.fx-cell{padding-top:1.4mm}',
      '.fe-wrong,.fe-fix{display:block;text-align:center;white-space:normal;line-height:1.15}',
      '.fe-wrong{font-size:15pt;white-space:nowrap;margin-top:1mm;color:#111}',
      '.fe-f{display:inline-flex;flex-direction:column;vertical-align:middle;text-align:center;line-height:1.05;min-width:1.2em;margin:0 .08em}',
      '.fe-f>span:first-child{border-bottom:.08em solid #111;padding:0 .1em .04em}',
      '.fe-f>span:last-child{padding-top:.04em}',
      '.fe-m{display:inline-flex;align-items:center;vertical-align:middle;gap:.1em}',
      '.fe-note{font-size:9pt;color:#555;margin-top:1mm;text-align:center}',
      '.fe-work{align-self:stretch;flex:1;min-height:12mm;margin:1.5mm 1mm 0;border:1px dashed #bbb;border-radius:1mm;padding:1.2mm;display:flex;align-items:center;justify-content:center}',
      '.fe-fix{font-size:12pt;color:#d71f10;font-weight:700;text-align:left;line-height:1.5}',
      '.fe-fix>div{white-space:nowrap}',
      // 이 묶음 쪽 머리말 — 유형 이름이 ' · 정답'까지 한 줄에 들어가게 한다.
      // (검수 C: 제목 상자 55mm 인데 제목이 63.4~81.6mm. 필드 8.5pt·간격 2mm 로 상자를 ≈82mm 로 넓힘)
      '.fracsubdiff-page .sheet-head{gap:2mm}',
      '.fracsubdiff-page .sheet-field{font-size:8.5pt}',
      '.fracsubdiff-page .sheet-title{font-size:8pt}',
      '.answer-page.fracsubdiff-page .sheet-title{font-size:7pt}',
      // 가로셈 정답지 — 공용 분수 렌더러가 마지막에 그린 계산 결과만 붉게(검수 C: 정답이 검은 글씨).
      '.sheet-cell.fracsubdiff-horizontal .sf-content{font-size:18pt}',
      '.answer-page .fracsubdiff-horizontal .sf-content>:last-child{color:#d71f10}',
      // 선 잇기 답지 — 오른쪽 ○ 자리를 정답선 끝(58%)에 맞춘다. 42% 칸 끝에서 (58−42)%×190mm−1.5mm(○ 반지름).
      '.fracsubdiff-match .mt-right .mt-mark{margin-left:28.9mm;margin-right:3mm}'
    ].join('');
    document.head.appendChild(style);
  }
  const el = (tagName, cls, value) => {
    const node = document.createElement(tagName);
    if (cls) node.className = cls;
    if (value !== undefined) node.textContent = value;
    return node;
  };
  /** 주어진 분수(검정)와 답을 쓰는 자리(답지에서만 붉게)를 구분한다. */
  function fractionStack(top, bottom, paintTop, paintBottom) {
    const frac = el('span', 'fx-frac');
    frac.append(el('span', paintTop ? 'fx-ink' : '', top));
    frac.append(el('span', paintBottom ? 'fx-ink' : '', bottom));
    return frac;
  }
  const givenFrac = (n, d) => fractionStack(String(n), String(d), false, false);
  function blankFrac(value, d, answer) {
    const frac = el('span', 'fx-frac');
    frac.append(blankBox(value, answer, 'fx-box'), el('span', '', d));
    return frac;
  }
  const blankBox = (value, answer, cls) => el('span', cls + (answer ? ' fx-ink' : ''), answer ? String(value) : '\u00a0');
  function partNode(part, answer) {
    if (part.t === 'text') return el('span', 'fx-op', part.s);
    if (part.t === 'num') return el('span', '', part.s);
    if (part.t === 'frac') return givenFrac(part.n, part.d);
    if (part.t === 'fracBlank') {
      const frac = el('span', 'fx-frac');
      frac.append(blankBox(part.ans, answer, 'fx-box'), el('span', '', part.d));
      return frac;
    }
    if (part.t === 'mixed' || part.t === 'mixedBlank') {
      const mixed = el('span', 'fx-mixed');
      mixed.append(el('span', '', part.w));
      if (part.t === 'mixedBlank') {
        const frac = el('span', 'fx-frac');
        frac.append(blankBox(part.ans, answer, 'fx-box'), el('span', '', part.d));
        mixed.append(frac);
      } else mixed.append(givenFrac(part.n, part.d));
      return mixed;
    }
    // 마지막 답 줄 — 답이 분수면 분수 모양으로 보여 준다
    if (answer && String(part.ans).indexOf('/') > 0) {
      const p = parts(part.ans);
      return p.whole > 0
        ? (() => { const mixed = el('span', 'fx-mixed'); mixed.append(el('span', '', p.whole), fractionStack(String(p.n), String(p.d), true, true)); return mixed; })()
        : fractionStack(String(p.n), String(p.d), true, true);
    }
    return blankBox(part.ans, answer, 'fx-blank');
  }
  function renderSteps(cell, q, answer) {
    css();
    cell.classList.add('fx-cell');
    let line = el('div', 'fx-line');
    cell.append(line);
    let equals = 0;
    q.parts.forEach(part => {
      if (part.t === 'text' && part.s === '=') {
        equals++;
        if (equals === 2) {
          line = el('div', 'fx-line');
          line.append(partNode(part, answer));
          cell.append(line);
          return;
        }
      }
      line.append(partNode(part, answer));
    });
  }


  /* ---- 계산 고치기(t4): 틀린 풀이 한 줄 + 설명 + 바르게 고쳐 쓰는 칸 (g1-1-1 과 같은 모양) ---- */
  function efHTML(text) {
    return String(text).replace(/\*/g, '').replace(/\[(?:(\d+) )?(\d+)\/(\d+)\]/g, (m, w, n, d) => {
      const f = '<span class="fe-f"><span>' + n + '</span><span>' + d + '</span></span>';
      return w ? '<span class="fe-m"><span>' + w + '</span>' + f + '</span>' : f;
    });
  }
  function renderErrorFix(cell, q, answer) {
    css();
    const join = lines => lines.map(line => line.s).join(' ');
    const note = q.note ? '<div class="fe-note">' + String(q.note).replace(/</g, '&lt;') + '</div>' : '';
    cell.insertAdjacentHTML('beforeend',
      '<div class="fe-wrong">' + efHTML(join(q.wrong.lines)) + '</div>' +
      '<div class="fe-work' + (answer ? ' fe-solved' : '') + '">' + (answer ? '<div class="fe-fix">' + q.right.lines.map(line => '<div>' + efHTML(line.s) + '</div>').join('') + '</div>' : '') + '</div>');
  }

  /** 등록 — 원본이 없으면 건너뛰고, 이미 같은 키가 있으면 알린다(공용 파일은 건드리지 않는다). */
  function use(key, fn, from) {
    if (!fn) { console.warn('서식 원본을 찾지 못했습니다: ' + from); return; }
    try { root.Sheet.register(key, fn); } catch (error) { console.warn(key + ': ' + error.message); }
  }
  /** 가로셈 — 공용 분수 렌더러 그대로 쓰고, 이 묶음 표시(정답지 붉은 답)만 붙인다. */
  function renderHorizontal(cell, q, answer, config) {
    root.FractionSheet.render(cell, q, answer, config);
    cell.classList.add('fracsubdiff-horizontal');
  }
  if (root.Sheet && typeof root.Sheet.register === 'function') {
    use(HORIZONTAL, root.FractionSheet && renderHorizontal, 'formats-fraction.js');
    use(STEPS, (cell, q, answer) => renderSteps(cell, q, answer), '이 파일');
    use(ERROR, renderErrorFix, '이 파일');
  }

  // 선 잇기는 formats-matching.js 의 묶음 서식을 그대로 쓰고, 짝만 이 파일에서 만든다.
  if (root.MatchingSheet && root.MatchingSheet.formats && root.MatchingSheet.formats['matching-lines']) {
    const base = root.MatchingSheet.formats['matching-lines'];
    const random = seed => {
      let s = (Number(seed) >>> 0) || 1;
      return (lo, hi) => {
        s += 0x6D2B79F5;
        let t = s;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return lo + Math.floor(((t ^ t >>> 14) >>> 0) / 4294967296 * (hi - lo + 1));
      };
    };
    const shuffle = (list, rnd) => {
      const out = list.slice();
      for (let i = out.length - 1; i > 0; i--) { const j = rnd(0, i); const swap = out[i]; out[i] = out[j]; out[j] = swap; }
      return out;
    };
    root.MatchingSheet.formats[MATCH] = {
      page: 'blocks',
      title: '선 잇기',
      build: function (config) {
        const concept = conceptOf(config.typeId);
        if (!concept) throw Error('이 묶음의 유형이 아닙니다: ' + config.typeId);
        css();
        const bundles = Math.max(1, config.cols || 3);
        const per = Math.max(4, config.rows || 8);
        const pairs = matchPairs(concept, Number(config.seed) || 1, bundles * per);
        const rnd = random((Number(config.seed) ^ 0x5bf03635) >>> 0);
        const items = [];
        for (let b = 0; b < bundles; b++) {
          const chunk = pairs.slice(b * per, (b + 1) * per);
          let order = shuffle(chunk.map((_, i) => i), rnd);
          for (let i = 0; i < order.length; i++) {            // 제자리 짝(수평선)은 정답을 드러내므로 없앤다
            if (order[i] !== i) continue;
            const j = (i + 1) % order.length; const swap = order[i]; order[i] = order[j]; order[j] = swap;
          }
          // 동그라미를 분수 바로 옆에 붙인 2단 배치(compact)
          items.push({ kind: 'bundle', caption: '', pairs: chunk, order: order, rowsWeight: per, compact: true, compactWl: 30, compactWr: 12, compactGap: 8 });
        }
        return { items: items, layout: { cols: bundles, rows: per, count: pairs.length }, pairs: pairs.length };
      },
      // 공용 묶음 렌더러 그대로 쓰고, ○ 자리(정답선 끝)를 맞추는 CSS 를 이 묶음에만 걸기 위한 표시를 붙인다.
      render: function (config, item, isAnswer, built) {
        const wrap = base.render(config, item, isAnswer, built);
        return wrap;
      }
    };
  }

  /* ================= 7. 유형 목록 ================= */

  const INSTRUCTION = {
    t1: '계산하여 답을 기약분수나 대분수로 쓰세요.',
    t2: '빈칸에 알맞은 수를 써서 풀이를 완성하세요.',
    t3: '서로 알맞은 것끼리 선으로 이으세요.',
    t4: '잘못 계산한 곳을 찾아 바르게 고쳐 쓰세요.'
  };
  const TASK_TITLE = { t1: '가로셈', t2: '단계별 빈칸', t3: '결과 연결', t4: '계산 고치기' };
  const FORMAT = { t1: HORIZONTAL, t2: STEPS, t3: MATCH, t4: ERROR };
  // layout-rules.md §2 최소 기준 — 가로셈 3단×12줄, 단계별 빈칸 2단×10줄, 선 잇기 8쌍×3묶음, 고치기 3단×4줄.
  const LAYOUT = {
    t1: { cols: 2, rows: 12, fontPt: 17 },
    t2: { cols: 2, rows: 11, fontPt: 13 },   // 단계별 빈칸: 22문제(두 줄 식이라 글자는 13pt)
    t3: { cols: 4, rows: 5, fontPt: 12 },   // 선 잇기: 세트당 5문제 × 4세트(2단 × 2줄)
    t4: { cols: 3, rows: 4, fontPt: 11 }
  };

  const entries = [];
  for (const concept of CONCEPTS) {
    for (const task of ['t1', 't2', 't3', 't4']) {
      const layout = LAYOUT[task];
      entries.push({
        typeId: concept.id + '-' + task,
        title: concept.name + (concept.qualifier ? '(' + concept.qualifier + ')' : '') + ' · ' + TASK_TITLE[task],
        instruction: INSTRUCTION[task],
        format: FORMAT[task],
        cols: layout.cols, rows: layout.rows, count: layout.cols * layout.rows,
        fontPt: layout.fontPt, seed: 20261001, autoFit: false, maxProblems: task === 't2' ? 22 : 24,
        concept: concept.id,
        gen: { source: concept.source, concept: concept.id, task: task }
      });
    }
  }
  root.SheetCatalog.push(...entries);
  root.FracSubDiffBundle = { concepts: CONCEPTS, pool: pool, build: build, entries: entries };
})(globalThis);
