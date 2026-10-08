/* 분수 계산 정리 1-5-0: 모든 문항의 두 피연산자는 기존 Worksheets 생성기에서 얻는다. */
(function (root) {
  'use strict';
  const prefix = 'g150-';
  const gcd = (a, b) => b ? gcd(b, a % b) : Math.abs(a);
  const reduce = (n, d) => { const g = gcd(n, d); return [n / g, d / g]; };
  const parse = v => root.Worksheets.rational(v);
  const text = (n, d, mixed = true) => {
    [n, d] = reduce(n, d);
    if (d === 1) return String(n);
    if (mixed && n > d) return `${Math.floor(n / d)} ${n % d}/${d}`;
    return `${n}/${d}`;
  };
  const html = value => {
    const s = String(value);
    const m = s.match(/^(?:(\d+) )?(\d+)\/(\d+)$/);
    if (!m) return `<span>${s.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</span>`;
    return `<span class="g150-mixed">${m[1] ? `<span>${m[1]}</span>` : ''}<span class="g150-frac"><span>${m[2]}</span><span>${m[3]}</span></span></span>`;
  };
  const val = v => (v && v.raw !== undefined ? v.raw : html(v));
  const OPH = op => `<span class="g150-op">${op}</span>`;
  const line = (...parts) => `<div class="g150-line">${parts.join('')}</div>`;
  /** 쓰는 칸: 문제지에서는 빈 상자, 정답지에서는 새로 쓴 값만 빨강. 분수 답은 세로로 긴 상자. */
  const box = (value, answer) => ({ raw: `<span class="g150-box${/\//.test(String(value)) ? ' g150-tall' : ''}">${answer ? `<span class="g150-answer">${html(value)}</span>` : ''}</span>` });
  const eq = (a, op, b, c) => [val(a), OPH(op), val(b), OPH('='), val(c)].join('');
  function css() {
    if (document.getElementById('g150-style')) return;
    const style = document.createElement('style'); style.id = 'g150-style';
    style.textContent = `body[data-format^="g150-"] .sheet-head{gap:2mm;font-size:8.5pt}body[data-format^="g150-"] .sheet-brand{font-size:7pt}body[data-format^="g150-"] .sheet-field{min-width:0}`
      + `.g150-body{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2mm;width:100%;height:100%;font-size:1em;white-space:nowrap}`
      + `.g150-line{display:flex;align-items:center;justify-content:center;gap:.2em;line-height:1.2;white-space:nowrap}`
      + `.g150-frac{display:inline-flex;vertical-align:middle;flex-direction:column;text-align:center;line-height:1.05;min-width:1.3em}.g150-frac>span:first-child{border-bottom:1px solid #222;padding:0 .12em .04em}.g150-frac>span:last-child{padding-top:.04em}`
      + `.g150-mixed{display:inline-flex;align-items:center;gap:.12em}.g150-op{margin:0 .22em}`
      + `.g150-answer{color:#d71f10}`
      + `.g150-box{display:inline-flex;align-items:center;justify-content:center;min-width:1.8em;height:1.5em;border:1px solid #999;border-radius:1px;padding:0 .15em;background:#fff}.g150-tall{min-width:2.2em;height:2.7em}`
      + `.g150-note{font-size:.62em;color:#555;text-align:center}`
      + `.g150-fix{align-self:stretch;flex:1;min-height:12mm;margin:0 1mm;border:1px dashed #bbb;border-radius:1mm;padding:1mm;display:flex;align-items:center;justify-content:center}`
      + `.g150-solved{color:#d71f10}.g150-solved .g150-frac>span:first-child{border-bottom-color:#d71f10}`
      + `.sheet-cell:has(.g150-body){padding:1.5mm 1mm 1mm 1mm}.sheet-grid:has(.g150-body){grid-auto-flow:column}`;
    document.head.append(style);
  }
  function rng(seed) {
    let x = (Number(seed) >>> 0) || 1;
    return max => { x += 0x6d2b79f5; let t = x; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) % max; };
  }
  const sources = {
    '+': ['fraction-add-different', 'fraction-add-same', 'fraction-add-mixed-proper', 'fraction-add-proper-mixed'],
    '−': ['fraction-sub-different', 'fraction-sub-same', 'fraction-sub-mixed-proper', 'fraction-sub-improper-proper'],
    '×': ['fraction-mul-different', 'fraction-mul-same', 'fraction-mul-mixed-proper', 'fraction-mul-improper-proper'],
    '÷': ['fraction-div-different', 'fraction-div-same', 'fraction-div-mixed-proper', 'fraction-div-improper-proper']
  };
  function normalize(row) {
    const [an, ad] = parse(row.a), [bn, bd] = parse(row.b);
    if (![an, ad, bn, bd].every(Number.isInteger) || ad < 1 || bd < 1 || an <= 0 || bn <= 0) return null;
    if (Math.max(ad, bd) > 12 || an > ad * 10 || bn > bd * 10) return null;
    let [rawN, rawD] = root.Worksheets.exact(row.a, row.b, row.op);
    if (rawN <= 0 || rawD <= 0) return null;
    // 덧셈·뺄셈의 통분은 분모의 곱이 아니라 최소공배수로 보여 준다(7/11 + 6/11 → 13/11, 143/121 아님).
    if (row.op === '+' || row.op === '−') {
      const lcd = ad / gcd(ad, bd) * bd;
      rawN = an * (lcd / ad) + (row.op === '+' ? 1 : -1) * bn * (lcd / bd); rawD = lcd;
      if (rawN <= 0) return null;
    }
    const [n, d] = reduce(rawN, rawD);
    if (d > 100 || text(n, d) !== String(row.answer) && text(n, d, false) !== String(row.answer)) return null;
    return {a: String(row.a), b: String(row.b), op: row.op, n, d, rawN, rawD,
      key: `${row.a}|${row.op}|${row.b}`, rank: ad + bd + Math.floor(an / ad) * 5 + Math.floor(bn / bd) * 5};
  }
  function sourcePool(op, seed, need) {
    const found = new Map();
    const ids = sources[op];
    for (let batch = 0; batch < 100 && found.size < need * 3; batch++) {
      for (let i = 0; i < ids.length; i++) {
        let rows;
        try { rows = (root.FractionLegacyGenerate || root.Worksheets.generate.bind(root.Worksheets))(ids[i], (Number(seed) + Math.imul(batch + 1, 104729) + i * 8191) >>> 0, 48); }
        catch (_) { continue; }
        for (const row of rows) { const q = normalize(row); if (q && q.op === op) found.set(q.key, q); }
      }
    }
    return [...found.values()].sort((a, b) => a.rank - b.rank || a.key.localeCompare(b.key));
  }
  function sourceItems(ops, config, accept = () => true) {
    const count = config.count;
    // 쉬운 문항만 앞에서 잘라 쓰지 않고 난이도 순서의 풀에서 고르게 퍼뜨려 뽑는다.
    const each = Math.ceil(count / ops.length) + 1;
    const spread = list => list.length <= each ? list : Array.from({ length: each }, (_, i) => list[Math.floor((i + .5) * list.length / each)]);
    const pools = ops.map(op => spread(sourcePool(op, (Number(config.seed) + op.charCodeAt(0)) >>> 0, count * 3).filter(accept)));
    const result = [], seen = new Set();
    for (let i = 0; result.length < count; i++) {
      let moved = false;
      for (let k = 0; k < ops.length && result.length < count; k++) {
        const q = pools[k][i];
        if (q && !seen.has(q.key)) { seen.add(q.key); result.push(q); moved = true; }
      }
      if (!moved) break;
    }
    if (result.length < count) throw Error(`${config.typeId}: 기존 생성기에서 조건에 맞는 문항 ${count}개 중 ${result.length}개`);
    return result.sort((a, b) => a.rank - b.rank || a.key.localeCompare(b.key));
  }
  function wrongParts(q) {
    const [an, ad] = parse(q.a), [bn, bd] = parse(q.b);
    if (q.op === '+') return [an + bn, ad + bd];
    if (q.op === '−') return [an - bn, ad];
    if (q.op === '×') return [an * bn, ad + bd];
    return [an * bn, ad * bd];
  }
  function make(config) {
    const kind = config.gen.kind, ops = config.gen.ops;
    let qs;
    if (kind === 'mixed') qs = sourceItems(ops, config);
    else if (kind === 'reduce') qs = sourceItems(ops, config, q => q.rawD > 1 && gcd(q.rawN, q.rawD) > 1 && q.n < q.d);
    else if (kind === 'improper') qs = sourceItems(ops, config, q => q.n > q.d && q.d > 1 && q.n % q.d !== 0);
    else if (kind === 'both') qs = sourceItems(ops, config, q => q.rawN > q.rawD && gcd(q.rawN, q.rawD) > 1 && q.d > 1 && q.n % q.d !== 0);
    else if (kind === 'error') qs = sourceItems(ops, config, q => {
      const [an, ad] = parse(q.a), [bn, bd] = parse(q.b);
      if (q.op === '−' && (ad === bd || an <= bn)) return false;
      const [wrongN, wrongD] = wrongParts(q);
      return wrongD > 0 && wrongN * q.d !== q.n * wrongD;
    });
    else qs = sourceItems(ops, config);
    const random = rng(Number(config.seed) + config.typeId.length * 101);
    return qs.map((q, index) => ({...q, kind, mask: random(2), index}));
  }
  function render(cell, q, answer) {
    css();
    const body = document.createElement('div'); body.className = 'g150-body';
    const result = text(q.n, q.d);
    const rev = q.op === '+' ? '−' : q.op === '−' ? '+' : q.op === '×' ? '÷' : '×';
    let html1 = '';
    if (q.kind === 'mixed') html1 = line(eq(q.a, q.op, q.b, box(result, answer)));
    else if (q.kind === 'blank' || q.kind === 'inverse') {
      const masked = q.mask ? q.b : q.a;
      html1 = line(eq(q.mask ? q.a : box(masked, answer), q.op, q.mask ? box(masked, answer) : q.b, result));
      if (q.kind === 'inverse') {
        const inverse = q.mask
          ? q.op === '+' ? [result, '−', q.a] : q.op === '−' ? [q.a, '−', result] : q.op === '×' ? [result, '÷', q.a] : [q.a, '÷', result]
          : [result, rev, q.b];
        html1 += `<div class="g150-note">역연산 확인</div>` + line(eq(inverse[0], inverse[1], inverse[2], box(masked, answer)));
      }
    } else if (q.kind === 'linked') {
      html1 = line(eq(q.a, q.op, q.b, box(result, answer))) + line(eq(box(result, answer), rev, q.b, q.a));
    } else if (q.kind === 'reduce' || q.kind === 'improper' || q.kind === 'both') {
      const shown = q.kind === 'improper' ? text(q.n, q.d, false) : `${q.rawN}/${q.rawD}`;
      const label = q.kind === 'reduce' ? '기약분수' : q.kind === 'improper' ? '대분수' : '약분·대분수';
      html1 = line(eq(q.a, q.op, q.b, shown)) + line(`<span>${label}</span>${OPH('=')}${val(box(result, answer))}`);
    } else if (q.kind === 'error') {
      const [wrongN, wrongD] = wrongParts(q);
      const mistake = q.op === '+' ? '분모까지 더함' : q.op === '−' ? '통분하지 않음'
        : q.op === '×' ? '분모를 더함' : '역수 없이 곱함';
      html1 = line(eq(q.a, q.op, q.b, `${wrongN}/${wrongD}`))
        + `<div class="g150-fix">${answer ? `<div class="g150-line g150-solved">${eq(q.a, q.op, q.b, result)}</div>` : ''}</div>`;
    }
    body.innerHTML = html1;
    cell.append(body);
  }
  const oldGenerate = root.SheetGen.generate;
  root.SheetGen.generate = config => config.format.startsWith(prefix) ? make(config) : oldGenerate(config);
  for (const kind of ['mixed', 'blank', 'inverse', 'linked', 'reduce', 'improper', 'both', 'error']) root.Sheet.register(prefix + kind, render);
  const names = [
    ['분수의 덧셈·뺄셈 섞어 연습하기', ['연산을 섞은 가로 계산', '빈칸 식으로 섞어 연습하기', '계산 오류 찾아 고치기'], ['mixed', 'blank', 'error'], ['+', '−']],
    ['분수의 곱셈·나눗셈 섞어 연습하기', ['연산을 섞은 가로 계산', '빈칸 식으로 섞어 연습하기', '계산 오류 찾아 고치기'], ['mixed', 'blank', 'error'], ['×', '÷']],
    ['약분과 대분수 정리 종합', ['계산 결과를 기약분수로 정리하기', '가분수 결과를 대분수로 정리하기', '약분과 대분수 변환을 함께 정리하기'], ['reduce', 'improper', 'both'], ['+', '−', '×', '÷']],
    ['빈칸에 알맞은 수 찾기 — 분수 사칙연산', ['빈칸이 한 곳인 식 완성하기', '서로 연결된 두 식의 빈칸 채우기', '역연산으로 빈칸을 구하고 확인하기'], ['blank', 'linked', 'inverse'], ['+', '−', '×', '÷']]
  ];
  names.forEach(([concept, titles, kinds, ops], c) => titles.forEach((title, t) => {
    const kind = kinds[t];
    const [cols, rows, fontPt] = { error: [3, 4, 14], mixed: [2, 12, 16], blank: [2, 10, 17], reduce: [3, 8, 14], improper: [3, 8, 14], both: [3, 8, 14], inverse: [2, 7, 14], linked: [3, 8, 14] }[kind];
    const typeId = `1-5-0-${c}-t${t + 1}`;
    const shortConcept = ['분수 덧뺄셈', '분수 곱나눗셈', '약분·대분수', '분수 사칙연산'][c];
    root.SheetCatalog.push({typeId, title: `${shortConcept} · ${title}`, instruction: kind === 'error' ? '잘못된 계산을 찾아 바르게 고쳐 쓰세요.' : kind === 'linked' ? '두 식을 이어 빈칸을 채우세요.' : '계산하여 빈칸에 알맞은 답을 쓰세요.',
      format: prefix + kind, cols, rows, count: cols * rows, fontPt, seed: 20261001, autoFit: false, maxProblems: 24,
      gen: {kind, ops}, workLines: kind === 'error' ? 2 : 1});
  }));
})(globalThis);
