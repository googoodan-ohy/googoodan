/* 2-4-0: 소수 나눗셈 준비. 피연산자는 기존 Worksheets 생성기에서만 뽑는다. */
(function (root) {
  'use strict';
  const node = (tag, cls, value) => {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (value !== undefined) el.textContent = value;
    return el;
  };
  const css = `.g240-line{display:flex;align-items:center;justify-content:center;gap:1mm;white-space:nowrap;line-height:1.3}.g240-box{display:inline-block;min-width:2.4em;height:1.25em;border-bottom:1.5px solid #555;text-align:center;color:#d71f10;font-weight:700}.g240-small{font-size:.7em;color:#444;text-align:center}.g240-table{white-space:nowrap;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1.2mm}.g240-place{display:grid;grid-template-columns:repeat(3,1.7em) .7em repeat(2,1.9em);width:max-content;text-align:center;line-height:1.1}.g240-place-head{font-size:.55em;color:#444}.g240-place-digit{height:1.25em;border-bottom:1.5px solid #777;color:#d71f10;font-weight:700}.g240-place-point{border:0;color:#111;font-weight:400}.g240-wrong{color:#111}.g240-fixwrap{display:flex;flex-direction:column;justify-content:center;align-items:center;gap:3mm;height:100%;width:100%}.g240-fix{align-self:stretch;margin:0 3mm;border-bottom:1px solid #999;min-height:1.8em;color:#d71f10;font-weight:700;text-align:center;white-space:nowrap}`;
  if (typeof document !== 'undefined' && !document.getElementById('g240-style')) {
    const style = node('style'); style.id = 'g240-style'; style.textContent = css; document.head.append(style);
  }
  const SOURCES = ['decimal-div-1', 'decimal-div-2', 'decimal-div-1dp-2dp', 'decimal-div-2dp-1dp', 'decimal-div-1dp-0dp', 'decimal-div-2dp-0dp'];
  const places = x => (String(x).split('.')[1] || '').length;
  const scaled = x => Number(String(x).replace('.', ''));
  function fixed(n, p) {
    const s = String(n).padStart(p + 1, '0');
    return p ? s.slice(0, -p) + '.' + s.slice(-p) : s;
  }
  function accepted(q, concept) {
    const a = String(q.a), b = String(q.b), pa = places(a), pb = places(b);
    if (!/^[0-9]+(?:\.[0-9]+)?$/.test(a) || !/^[0-9]+(?:\.[0-9]+)?$/.test(b)) return false;
    if (pa < 1 || pa > 2 || pb > 2 || Number(b) <= 0) return false;
    if (concept < 2 && pb < 1) return false;
    if (Number(a) <= 0 || Number(b) <= 0 || Number(b) === 1) return false;
    const answer = Number(q.answer);
    if (!Number.isFinite(answer) || answer < 0 || places(q.answer) > 2) return false;
    return (concept !== 2 || places(q.answer) > 0) &&
      Math.abs(Number(a) / Number(b) - answer) < 1e-9;
  }
  const level = q => Number(q.a) + Number(q.b) + Number(q.answer);
  function draw(config, needed) {
    const concept = Number(config.gen.concept), out = [], seen = new Set();
    const seed = Number(config.seed) >>> 0;
    for (let batch = 0; batch < 3000 && out.length < needed; batch++) {
      const source = SOURCES[(batch + (concept === 2 ? 4 : 0)) % SOURCES.length];
      if (concept < 2 && source.endsWith('0dp')) continue;
      const rows = root.Worksheets.generate(source, (seed + batch * 104729) >>> 0, 16);
      for (const row of rows) {
        const key = row.a + ':' + row.b;
        if (seen.has(key) || !accepted(row, concept)) continue;
        seen.add(key);
        out.push({ a: String(row.a), b: String(row.b), op: '÷', answer: String(row.answer) });
        if (out.length === needed) break;
      }
    }
    if (out.length < needed) throw Error(config.typeId + ': 조건에 맞는 기존 생성기 문항이 ' + out.length + '/' + needed + '개입니다.');
    return out.sort((a, b) => level(a) - level(b) || Number(a.a) - Number(b.a));
  }
  const scale = q => 10 ** places(q.b);
  const transformed = q => {
    const k = scale(q);
    const pa = places(q.a), pb = places(q.b);
    const numerator = Number((Number(q.a) * k).toFixed(3));
    const denominator = scaled(q.b);
    return { numerator, denominator, k };
  };
  function blank(text, value, answer, cls) {
    const line = node('div', cls || 'g240-line');
    line.append(node('span', '', text), node('span', 'g240-box', answer ? String(value) : '\u00a0'));
    return line;
  }
  function equation(cell, q, answer, config) {
    const t = transformed(q), concept = Number(config.gen.concept);
    const label = concept === 0 ? (places(q.b) === 1 ? '0.1 단위' : '0.01 단위') : '각각 ×' + t.k;
    cell.append(node('div', 'g240-small', label));
    cell.append(blank(q.a + ' ÷ ' + q.b + ' = ' + t.numerator + ' ÷ ', t.denominator, answer));
  }
  const conv = q => (places(q.b) === 0 ? '' : ' = ' + transformed(q).numerator + ' ÷ ' + transformed(q).denominator);
  const fmt = q => { const t = transformed(q); return t.numerator + ' ÷ ' + t.denominator; };
  const mmW = tx => { let w = 0; for (const ch of String(tx)) w += /[0-9]/.test(ch) ? 2.7 : ch === ' ' ? 1.3 : 3.1; return w; };
  const rngOf = seed => { let x = (Number(seed) >>> 0) || 1; return () => ((x = (Math.imul(x ^ (x >>> 15), 2246822519) + 374761393) >>> 0) / 4294967296); };
  function derange(n, r) {
    for (let t = 0; t < 80; t++) {
      const o = [...Array(n).keys()].map(i => [r(), i]).sort((p, q) => p[0] - q[0]).map(p => p[1]);
      if (o.every((x, i) => x !== i)) return o;
    }
    return [...Array(n).keys()].map(i => (i + 1) % n);
  }
  function matchingBuild(config) {
    const bn = 8, pb = 4, pool = draw(config, bn * pb * 6), r = rngOf(config.seed), items = [], used = new Set();
    const rows = [];
    for (let b = 0; b < bn; b++) {
      const seenAns = new Set(), chunk = [];
      for (const q of pool) {
        if (used.has(q) || seenAns.has(q.answer)) continue;
        used.add(q); seenAns.add(q.answer); chunk.push(q);
        if (chunk.length === pb) break;
      }
      if (chunk.length < pb) throw Error(config.typeId + ': 한 묶음의 서로 다른 몫 ' + pb + '개를 확보하지 못했습니다.');
      rows.push(chunk);
    }
    const flat = rows.flat();
    const wl = Math.ceil(Math.max(...flat.map(q => mmW(q.a + ' ÷ ' + q.b)))) + 2;
    const wr = Math.ceil(Math.max(...flat.map(q => mmW(fmt(q))))) + 2;
    rows.forEach(chunk => items.push({ kind: 'bundle', compact: true, compactWl: wl, compactWr: wr, compactGap: 4, caption: '',
      pairs: chunk.map(q => [q.a + ' ÷ ' + q.b, fmt(q)]), order: derange(pb, r), rowsWeight: pb }));
    return { items, layout: { cols: bn, rows: pb, count: bn * pb }, pairs: bn * pb };
  }
  if (root.MatchingSheet && root.MatchingSheet.formats['matching-lines']) {
    root.MatchingSheet.formats['g240-mt'] = { page: 'blocks', title: '같은 몫 연결하기', build: matchingBuild,
      render: (config, item, isAnswer) => root.MatchingSheet.formats['matching-lines'].render(config, item, isAnswer) };
  }
  function wrong(cell, q, answer, config) {
    const t = transformed(q), concept = Number(config.gen.concept);
    const bad = concept === 2 ? `${q.a} ÷ ${q.b} = ${q.wrong}` : `${q.a} ÷ ${q.b} = ${t.numerator} ÷ ${q.b}`;
    const wrap = node('div', 'g240-fixwrap');
    wrap.append(node('div', 'g240-line g240-wrong', bad));
    wrap.append(node('div', 'g240-fix', answer ? `${q.a} ÷ ${q.b}${conv(q)} = ${q.answer}` : ' '));
    cell.append(wrap);
  }
  function table(cell, q, answer) {
    const t = transformed(q), wrap = node('div', 'g240-table');
    wrap.append(node('div', '', q.a + ' ÷ ' + q.b + conv(q)));
    const chart = node('div', 'g240-place');
    ['백', '십', '일', '.', '첫째', '둘째'].forEach(label => chart.append(node('span', 'g240-place-head', label)));
    const [whole, fraction = ''] = q.answer.split('.');
    const digits = [whole.at(-3), whole.at(-2), whole.at(-1), '.', fraction[0], fraction[1]];
    digits.forEach((digit, i) => chart.append(node('span', 'g240-place-digit' + (i === 3 ? ' g240-place-point' : ''),
      i === 3 ? '.' : answer && digit !== undefined ? digit : ' ')));
    wrap.append(chart); cell.append(wrap);
  }
  function point(cell, q, answer) {
    const t = transformed(q);
    cell.append(node('div', 'g240-line', q.a + ' ÷ ' + q.b + conv(q)));
    cell.append(blank('= ', q.answer, answer));
  }
  const FORMAT = { t1: ['g240-equation', 'g240-table'], t2: ['g240-mt', 'g240-point'], t3: ['g240-wrong', 'g240-wrong'] };
  const META = [
    { label: '같은 단위', titles: ['식 완성', '같은 몫 연결', '이동 오류 고치기'] },
    { label: '같은 배', titles: ['식 완성', '같은 몫 연결', '이동 오류 고치기'] },
    { label: '몫의 소수점', titles: ['자리표', '빈자리 채우기', '자릿값 고치기'] }
  ];
  const LAYOUT = [
    [{ cols: 3, rows: 13 }, { cols: 8, rows: 4 }, { cols: 3, rows: 5 }],
    [{ cols: 3, rows: 13 }, { cols: 8, rows: 4 }, { cols: 3, rows: 5 }],
    [{ cols: 2, rows: 12 }, { cols: 3, rows: 13 }, { cols: 3, rows: 5 }]
  ];
  const TYPES = [];
  for (let concept = 0; concept < 3; concept++) for (let kind = 0; kind < 3; kind++) {
    const layout = LAYOUT[concept][kind];
    TYPES.push({ typeId: `2-4-0-${concept}-t${kind + 1}`, title: META[concept].label + ' · ' + META[concept].titles[kind],
      instruction: concept === 2 && kind === 0 ? '나눗셈을 계산하고 자릿수에 맞춰 아래에 적으세요.' : kind === 1 && concept < 2 ? '왼쪽과 몫이 같은 오른쪽 식을 선으로 이으세요.' : kind === 2 ? '잘못된 식을 바르게 고쳐 쓰세요.' : '빈칸에 알맞은 수를 쓰세요.',
      format: FORMAT['t' + (kind + 1)][concept === 2 ? 1 : 0],
      cols: layout.cols, rows: layout.rows, count: layout.cols * layout.rows,
      fontPt: kind === 2 ? 17 : (concept === 2 && kind === 0 ? 15 : (kind === 1 && concept < 2 ? 11 : (concept === 2 ? 14 : 14))), autoFit: false, maxProblems: layout.cols * layout.rows, seed: 20261001,
      gen: { ko240: true, concept, kind } });
  }
  function questions(config) {
    const concept = Number(config.gen.concept), kind = Number(config.gen.kind), count = config.count;
    return draw(config, count).map((q, index) => {
      if (kind === 2 && concept === 2) {
        const factor = index % 2 ? 10 : 0.1;
        q.wrong = String(Number((Number(q.answer) * factor).toFixed(3)));
      }
      return q;
    });
  }
  [['g240-equation', equation], ['g240-wrong', wrong], ['g240-table', table], ['g240-point', point]]
    .forEach(([name, renderer]) => root.Sheet.register(name, renderer));
  const original = root.SheetGen.generate;
  root.SheetGen.generate = function (config) {
    return config?.gen?.ko240 ? questions(config) : original.apply(this, arguments);
  };
  root.SheetCatalog.push(...TYPES);
  root.Ko240 = { types: TYPES, questions, accepted, transformed };
})(globalThis);
