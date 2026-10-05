(function (root) {
  'use strict';
  // 묶음 1-3-0: 수는 기존 Worksheets.generate 에서만 가져온다.
  const concepts = [
    { id: '1-3-0-0', name: '분수를 자연수만큼 반복하여 더하기', source: 'fraction-mul-proper-whole' },
    { id: '1-3-0-1', name: '자연수의 분수만큼 구하기', source: 'fraction-mul-whole-proper' },
    { id: '1-3-0-2', name: '분수의 분수만큼 구하기', source: 'fraction-mul-different' },
    { id: '1-3-0-3', name: '곱하기 전 약분하기', source: 'fraction-mul-different' }
  ];
  const formats = { picture: 'g130-picture', steps: 'g130-fraction-steps', matching: 'g130-matching-lines' };
  const titles = [
    ['그림에 분수만큼 표시하기', '그림과 곱셈식 연결하기', '단위분수 개수로 계산 과정 완성하기'],
    ['그림에 분수만큼 표시하기', '그림과 곱셈식 연결하기', '단위분수 개수로 계산 과정 완성하기'],
    ['그림에 분수만큼 표시하기', '그림과 곱셈식 연결하기', '단위분수 개수로 계산 과정 완성하기'],
    ['곱셈식에서 약분할 수 표시하기', '곱하기 전 약분 과정 완성하기', '약분한 식과 원래 식 연결하기']
  ];
  const gcd = (a, b) => b ? gcd(b, a % b) : Math.abs(a);
  const esc = v => String(v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const element = (tag, cls, html) => { const n = document.createElement(tag); n.className = cls || ''; if (html != null) n.innerHTML = html; return n; };
  const fmt = (n, d) => String(root.Worksheets.fraction(n, d));
  function frac(v) {
    const m = String(v).match(/^(\d+)\/(\d+)$/);
    return m ? `<span class="g130-frac"><span>${m[1]}</span><span>${m[2]}</span></span>` : esc(v);
  }
  function random(seed) {
    let s = (Number(seed) >>> 0) || 1;
    return (lo, hi) => { s += 0x6d2b79f5; let t = s; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return lo + Math.floor(((t ^ t >>> 14) >>> 0) / 4294967296 * (hi - lo + 1)); };
  }
  function shuffle(values, rnd) {
    const out = values.slice();
    for (let i = out.length - 1; i > 0; i--) { const j = rnd(0, i); [out[i], out[j]] = [out[j], out[i]]; }
    return out;
  }
  function parse(q, concept) {
    if (!q || q.op !== '×') return null;
    let a, d, b, e, whole;
    if (concept === 0 || concept === 1) {
      const f = concept === 0 ? q.a : q.b;
      whole = Number(concept === 0 ? q.b : q.a);
      const m = String(f).match(/^(\d+)\/(\d+)$/);
      if (!m) return null;
      a = +m[1]; d = +m[2]; b = whole; e = 1;
      if (!(whole >= 2 && whole <= 9 && a >= 2 && a < d && d <= 12 && gcd(a, d) === 1)) return null;
      if (concept === 0 && (whole > 4 || d > 8 || a * whole > 12)) return null;
      if (concept === 1 && (d > 9 || whole % d !== 0)) return null;
    } else {
      const ma = String(q.a).match(/^(\d+)\/(\d+)$/), mb = String(q.b).match(/^(\d+)\/(\d+)$/);
      if (!ma || !mb) return null;
      a = +ma[1]; d = +ma[2]; b = +mb[1]; e = +mb[2];
      if (!(a >= 2 && a < d && b >= 2 && b < e && d >= 2 && e >= 2 && d <= 12 && e <= 12 && gcd(a, d) === 1 && gcd(b, e) === 1)) return null;
      if (concept === 2 && d * e > 48) return null;
      if (concept === 3 && gcd(a, e) === 1 && gcd(b, d) === 1) return null;
    }
    const [n, den] = root.Worksheets.exact(q.a, q.b, '×');
    if (n <= 0 || den <= 0 || fmt(n, den) !== String(q.answer)) return null;
    let ca = a, cd = d, cb = b, ce = e;
    if (concept === 3) {
      const x = gcd(ca, ce); ca /= x; ce /= x;
      const y = gcd(cb, cd); cb /= y; cd /= y;
      if (gcd(ca * cb, cd * ce) !== 1) return null;
    }
    return { a, d, b, e, whole, ca, cd, cb, ce, answer: fmt(n, den), key: `${q.a}|${q.b}`, rank: d * e + a + b, concept };
  }
  function source(config, want) {
    const concept = Number(config.gen.concept), legacy = concepts[concept].source;
    const rows = [], seen = new Set();
    for (let round = 0; round < 1200 && rows.length < want; round++) {
      const batch = root.Worksheets.generate(legacy, (Number(config.seed) + Math.imul(round, 104729)) >>> 0, 48);
      for (const q of batch) {
        const p = parse(q, concept);
        if (!p || seen.has(p.key)) continue;
        seen.add(p.key); rows.push(p);
        if (rows.length === want) break;
      }
    }
    if (rows.length !== want) throw Error(`${config.typeId}: ${want}개 중 ${rows.length}개만 생성했습니다.`);
    rows.sort((x, y) => x.rank - y.rank || x.key.localeCompare(y.key));
    return rows;
  }
  const TIMES = '<span class="g130-op">×</span>', EQ = '<span class="g130-op">=</span>', PLUS = '<span class="g130-op">+</span>';
  const expression = p => p.concept === 0 ? `${frac(`${p.a}/${p.d}`)}${TIMES}${p.whole}` : p.concept === 1 ? `${p.whole}${TIMES}${frac(`${p.a}/${p.d}`)}` : `${frac(`${p.a}/${p.d}`)}${TIMES}${frac(`${p.b}/${p.e}`)}`;
  const reducedExpression = p => `${frac(`${p.ca}/${p.cd}`)}${TIMES}${frac(`${p.cb}/${p.ce}`)}`;
  function picture(p, answer) {
    const mark = (yes, chosen) => `<span class="g130-unit${yes && answer ? ' g130-mark' : ''}${chosen ? ' g130-guide' : ''}"></span>`;
    if (p.concept === 0) {
      let html = '<div class="g130-bars">';
      for (let group = 0; group < p.whole; group++) html += `<span class="g130-bar" style="grid-template-columns:repeat(${p.d},1fr)">${Array.from({ length: p.d }, (_, i) => mark(i < p.a, false)).join('')}</span>`;
      return html + '</div>';
    }
    if (p.concept === 1) return `<div class="g130-dots" style="grid-template-columns:repeat(${p.whole / p.d},1fr);grid-template-rows:repeat(${p.d},1fr)">${Array.from({ length: p.whole }, (_, i) => mark(Math.floor(i / (p.whole / p.d)) < p.a, false)).join('')}</div>`;
    return `<div class="g130-area" style="grid-template-columns:repeat(${p.d},1fr);grid-template-rows:repeat(${p.e},1fr)">${Array.from({ length: p.d * p.e }, (_, i) => mark(i % p.d < p.a && Math.floor(i / p.d) < p.b, i % p.d < p.a)).join('')}</div>`;
  }
  const blank = '<span class="g130-blank"></span>';
  const fractionBlank = '<span class="g130-blank g130-fraction-answer"></span>';
  const line = html => `<div class="g130-line">${html}</div>`;
  const ans = html => `<span class="g130-ans">${html}</span>`;
  function steps(p, subtype, answer) {
    if (p.concept === 0) return line(`${expression(p)}${EQ}${Array.from({ length: p.whole }, () => frac(`${p.a}/${p.d}`)).join(PLUS)}`) + line(`${p.a}개씩 ${p.whole}묶음 → ${frac(`1/${p.d}`)}이&nbsp;${answer ? ans(p.a * p.whole) : blank}개${EQ}${answer ? ans(frac(p.answer)) : fractionBlank}`);
    if (p.concept === 1) return line(`${expression(p)}${EQ}${p.whole}개를 ${p.d}묶음으로 나누어 ${p.a}묶음`) + line(`한 묶음 ${p.whole / p.d}개 →&nbsp;${answer ? ans(p.a * p.whole / p.d) : blank}개`);
    if (p.concept === 2) return line(`${expression(p)}${EQ}<span class="g130-frac"><span>${p.a}×${p.b}</span><span>${p.d}×${p.e}</span></span>`) + line(`${frac(`1/${p.d * p.e}`)}이&nbsp;${answer ? ans(p.a * p.b) : blank}개${EQ}${answer ? ans(frac(p.answer)) : fractionBlank}`);
    if (subtype === 1) {
      const pairs = [[p.a, p.e], [p.b, p.d]].filter(([x, y]) => gcd(x, y) > 1);
      return line(expression(p)) + line(`약분할 수:&nbsp;${answer ? ans(pairs.map(([x, y]) => `${x}↔${y} (÷${gcd(x, y)})`).join(', ')) : blank}`);
    }
    return line(`${expression(p)}${EQ}${answer ? ans(reducedExpression(p)) : blank}`) + line(`${EQ}${answer ? ans(frac(p.answer)) : fractionBlank}`);
  }
  function renderCell(cell, p, answer, config) {
    const subtype = Number(config.gen.subtype);
    if (config.format === formats.picture) {
      cell.append(element('div', 'g130-prompt g130-line', expression(p)));
      cell.append(element('div', 'g130-diagram', picture(p, answer)));
      cell.append(element('div', 'g130-sum g130-line', `표시한 부분:${EQ}${answer ? ans(frac(p.answer)) : fractionBlank}`));
    } else cell.append(element('div', 'g130-steps', steps(p, subtype, answer)));
  }
  function matching(config) {
    const rnd = random(Number(config.seed) ^ 0x1300ac);
    const bundles = config.cols, per = config.rows;
    const pool = source(config, bundles * per), groups = Array.from({ length: bundles }, () => []);
    for (const p of pool) {
      const rightKey = p.concept === 3 ? `${p.ca}/${p.cd}|${p.cb}/${p.ce}` : p.key;
      for (const group of groups) {
        if (group.length >= per || group.some(x => x.rightKey === rightKey)) continue;
        group.push({ ...p, rightKey }); break;
      }
      if (groups.every(g => g.length === per)) break;
    }
    if (groups.some(g => g.length !== per)) throw Error(`${config.typeId}: 연결할 고유 쌍이 부족합니다.`);
    return { items: groups.map(pairs => {
      const order = shuffle(pairs.map((_, i) => i), rnd);
      for (let i = 0; i < order.length; i++) {            // 제자리 짝(수평선)은 정답을 드러내므로 없앤다
        if (order[i] !== i) continue;
        const j = (i + 1) % order.length; [order[i], order[j]] = [order[j], order[i]];
      }
      return { kind: 'bundle', caption: '', rowsWeight: per, order, compact: true, compactWl: pairs[0].concept === 3 ? 30 : 34, compactWr: pairs[0].concept === 3 ? 30 : 22, compactGap: 8,
        pairs: pairs.map(p => [{ html: p.concept === 3 ? expression(p) : picture(p, true) }, { html: p.concept === 3 ? reducedExpression(p) : expression(p) }]) };
    }), layout: { cols: bundles, rows: per, count: bundles * per } };
  }
  function renderBundle(config, item, answer) {
    const wrap = root.MatchingSheet.formats['matching-lines'].render(config, item, answer);
    wrap.querySelectorAll('.mt-left .mt-text').forEach(node => node.classList.add('g130-match-visual'));
    return wrap;
  }
  const css = `
    body:is([data-format="g130-picture"],[data-format="g130-fraction-steps"],[data-format="g130-matching-lines"]) .sheet-head{gap:1mm}
    body:is([data-format="g130-picture"],[data-format="g130-fraction-steps"],[data-format="g130-matching-lines"]) .sheet-brand{font-size:7pt}
    body:is([data-format="g130-picture"],[data-format="g130-fraction-steps"],[data-format="g130-matching-lines"]) .sheet-title{font-size:7.5pt;min-width:0}
    body:is([data-format="g130-picture"],[data-format="g130-fraction-steps"],[data-format="g130-matching-lines"]) .sheet-field{font-size:7.5pt;min-width:0}
    .g130-frac{display:inline-flex;flex-direction:column;vertical-align:-.4em;line-height:1;text-align:center;min-width:1.2em}
    .g130-frac>span:first-child{border-bottom:1px solid #111;padding:0 .1em}
    .g130-frac>span:last-child{padding:0 .1em}
    .g130-prompt{white-space:nowrap;line-height:1.3;font-size:1.25em}
    .g130-diagram{height:21mm;display:flex;align-items:center;justify-content:center}
    .g130-bars{display:flex;flex-direction:column;gap:1.4mm;width:88%;height:23mm}
    .g130-bar,.g130-dots,.g130-area{display:grid;gap:0;border-left:1px solid #888;border-top:1px solid #888}
    .g130-bar{flex:1;min-height:0}
    .g130-dots{width:60%;height:23mm}
    .g130-area{width:80%;height:23mm}
    .g130-unit{border-right:1px solid #888;border-bottom:1px solid #888;background:white}
    .g130-guide{background:#edf6fc}
    .g130-mark{background:#ee8b82!important}
    .g130-sum{font-size:9pt;white-space:nowrap}
    .g130-blank{display:inline-block;min-width:9mm;height:1em;border-bottom:1px solid #888;vertical-align:baseline}
    .g130-fraction-answer{min-width:14mm;height:12mm!important;border:1px solid #57736a;box-sizing:border-box;vertical-align:middle}
    .g130-steps{font-size:10pt;line-height:1.5;white-space:nowrap}
    .g130-steps>div{min-height:5mm}
    .g130-match-visual .g130-bars{width:34mm;height:auto}
    .g130-match-visual .g130-bar{flex:none;height:3mm}
    .g130-match-visual .g130-dots{width:22mm;height:13mm}
    .g130-match-visual .g130-area{width:28mm;height:13mm}
    .g130-match-visual .g130-mark{background:#819fba!important}
    .mt-text.g130-match-visual{display:flex;justify-content:flex-end;align-items:center}
    .g130-frac{vertical-align:middle;line-height:1.05}.g130-frac>span:first-child{padding:0 .1em .04em}.g130-frac>span:last-child{padding:.04em .1em 0}
    .g130-op{margin:0 .3em}.g130-line{display:flex;align-items:center;justify-content:center;white-space:nowrap}
    .g130-ans{color:#d71f10}
    .g130-diagram{width:100%;height:auto;flex:1;min-height:20mm}
    .g130-sum{font-size:1em}
    .g130-steps{font-size:1em}
  `;
  function install() {
    document.head.append(element('style', '', css));
    const original = root.SheetGen.generate;
    root.SheetGen.generate = function (config) { return config && [formats.picture, formats.steps].includes(config.format) ? source(config, config.count) : original.apply(this, arguments); };
    root.Sheet.register(formats.picture, renderCell);
    root.Sheet.register(formats.steps, renderCell);
    root.MatchingSheet.formats[formats.matching] = { page: 'blocks', title: '선 잇기', build: matching, render: renderBundle };
    concepts.forEach((concept, index) => titles[index].forEach((title, i) => {
      if (index === 3 && i === 0) return; // 사용자 요청으로 약분할 수 표시 유형 폐기
      const subtype = i + 1, format = index === 3 && subtype === 1 ? formats.steps : subtype === 1 ? formats.picture : subtype === 2 && index !== 3 ? formats.matching : subtype === 3 && index === 3 ? formats.matching : formats.steps;
      const cols = format === formats.picture ? 3 : format === formats.matching ? 4 : 2;
      const rows = index === 0 && subtype === 3 ? 8 : format === formats.picture ? 5 : format === formats.matching ? 5 : 10;
      root.SheetCatalog.push({ typeId: `${concept.id}-t${subtype}`, conceptId: concept.id, title: `${concept.name} — ${title}`,
        instruction: format === formats.matching ? '서로 알맞은 것끼리 선으로 이으세요.' : format === formats.picture ? '그림에 표시하고 답을 쓰세요.' : '빈칸에 알맞은 수를 쓰세요.',
        format, cols, rows, count: cols * rows, fontPt: format === formats.steps ? 14 : 12, workLines: format === formats.steps ? 1 : 0,
        seed: 20261001, autoFit: false, maxProblems: index === 0 && subtype === 3 ? 16 : 24,
        gen: { concept: index, subtype, legacyId: concept.source } });
    }));
  }
  install();
  root.Training130 = { concepts, parse, source, matching };
})(globalThis);
