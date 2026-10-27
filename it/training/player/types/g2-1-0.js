/* 묶음 2-1-0: 소수 덧셈 준비. 수는 기존 Worksheets 생성기에서 뽑고 단위만 표시한다. */
(function (root) {
  'use strict';
  const NBSP = '\u00a0', INK = '#b32b2b';
  const el = (tag, cls, value) => { const n = document.createElement(tag); if (cls) n.className = cls; if (value !== undefined) n.textContent = value; return n; };
  const fmt = (n, places) => (n / (10 ** places)).toFixed(places);
  function random(seed) { let s = (Number(seed) >>> 0) || 1; return (max) => { s += 0x6d2b79f5; let t = s; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) % max; }; }
  function shuffle(a, rnd) { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = rnd(i + 1); [b[i], b[j]] = [b[j], b[i]]; } return b; }
  function source(id, seed, count, accept, keyOf) {
    if (!root.Worksheets || typeof root.Worksheets.generate !== 'function') throw Error('기존 Worksheets 생성기가 없습니다.');
    const out = [], seen = new Set();
    for (let batch = 0; batch < 1000 && out.length < count; batch++) {
      const rows = root.Worksheets.generate(id, (Number(seed) + Math.imul(batch, 104729)) >>> 0, 32);
      for (const q of rows) {
        if (!accept(q)) continue;
        const key = keyOf(q);
        if (seen.has(key)) continue;
        seen.add(key); out.push(q);
        if (out.length === count) break;
      }
    }
    if (out.length !== count) throw Error(id + ': 조건에 맞는 문항 ' + count + '개 중 ' + out.length + '개만 생성했습니다.');
    return out;
  }
  function units(config, count) {
    const places = Number(config.gen.places);
    // 원 생성기의 1~9개+1~9개를 0.1 또는 0.01 단위 묶음으로 표시한다.
    return source('natural-add-1-1', config.seed, count,
      q => q.op === '+' && Number.isInteger(q.a) && Number.isInteger(q.b) && q.a >= 2 && q.a <= 9 && q.b >= 2 && q.b <= 9 && Number(q.answer) === q.a + q.b,
      q => q.a + ':' + q.b).map(q => ({ a: q.a, b: q.b, sum: q.a + q.b, places }));
  }
  function aligned(config, count) {
    return source('decimal-add-1dp-2dp', config.seed, count,
      q => q.op === '+' && /^\d+\.\d$/.test(String(q.a)) && /^\d+\.\d{2}$/.test(String(q.b)) && Number(q.a) >= .1 && Number(q.b) >= .01 && Math.round(Number(q.answer) * 100) === Math.round((Number(q.a) + Number(q.b)) * 100),
      q => q.a + ':' + q.b).map(q => ({ a: String(q.a), b: String(q.b), aligned: Number(q.a).toFixed(2), sum: (Math.round(Number(q.a) * 100) + Math.round(Number(q.b) * 100)) / 100 }));
  }
  function buildItems(config) {
    const kind = config.gen.kind, count = config.count;
    const list = kind === 'align-table' ? aligned(config, 40) : kind.startsWith('align-') ? aligned(config, count) : units(config, count);
    return list.sort((x, y) => kind.startsWith('align-') ? x.sum - y.sum || Number(x.a) - Number(y.a) : x.sum - y.sum || x.a - y.a || x.b - y.b);
  }
  const CSS = `
    .g210-center{position:absolute;inset:1mm 1mm 1mm 6mm;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1mm;font-variant-numeric:tabular-nums;}
    .g210-units{display:flex;align-items:center;justify-content:center;gap:2mm;width:100%;}
    .g210-block{display:grid;grid-template-columns:repeat(5,5.4mm);gap:.5mm;border:1px solid #888;padding:1mm;}
    .g210-block i{width:5.4mm;height:5.4mm;border:1px solid #444;background:#e7e7e7;}
    .g210-plus{font-size:1.6em}.g210-unit{font-size:.85em;color:#333}.g210-line{white-space:nowrap;text-align:center;line-height:1.35;font-size:1.25em}
    .g210-box{display:inline-flex;align-items:center;justify-content:center;min-width:14mm;height:1.7em;border:1px solid #555;margin:0 .7mm;vertical-align:middle;}
    .g210-relation{gap:0;}
    .g210-relation-inputs{display:flex;align-items:center;justify-content:center;gap:1.5mm;}
    .g210-relation-node{display:flex;align-items:center;justify-content:center;min-width:15mm;height:1.8em;border:1px solid #666;font-size:1.2em;line-height:1;}
    .g210-relation-arrows{height:1.4em;font-size:1.1em;line-height:1.4em;letter-spacing:4mm;color:#555;}
    .g210-relation .g210-box{height:1.8em;min-width:15mm;margin:0;font-size:1.2em;}
    .g210-small{font-size:.9em}.g210-wrong{text-decoration:line-through;color:#111;font-size:1.25em}
    .g210-match{position:relative;flex:1;min-height:0;display:grid;grid-template-columns:42% 16% 42%;grid-template-rows:repeat(6,1fr);font-variant-numeric:tabular-nums;}
    .g210-match-left,.g210-match-right{display:flex;align-items:center;white-space:nowrap;}.g210-match-right{grid-column:3}.g210-match svg{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}.g210-match line{stroke:${INK};stroke-width:1.5;vector-effect:non-scaling-stroke}
    .g210-table{width:100%;height:100%;display:grid;grid-template-columns:2.2fr repeat(3,.7fr);grid-template-rows:repeat(11,1fr);font-variant-numeric:tabular-nums;font-size:1.1em;}
    .g210-table>div{display:flex;align-items:center;justify-content:center;border:1px solid #ddd;border-right:0;border-bottom:0;white-space:nowrap;}
    .g210-table>div:nth-child(4n){border-right:1px solid #ddd}.g210-table>div:nth-last-child(-n+4){border-bottom:1px solid #ddd}
    .g210-table-head{font-size:.8em;background:#f5f5f5;font-weight:bold;}
    .g210-table .g210-box{height:1.5em;min-width:9mm;margin:0;font-size:1em;}
    .sheet-page:has(.g210-table) .sheet-head,.sheet-page:has(.g210-align-blank) .sheet-head{gap:1.5mm;font-size:8pt}
    .sheet-page:has(.g210-table) .sheet-field,.sheet-page:has(.g210-align-blank) .sheet-field{font-size:8pt;min-width:0}
    .sheet-page:has(.g210-table) .sheet-brand,.sheet-page:has(.g210-align-blank) .sheet-brand{font-size:7pt}
    .sheet-page:has(.g210-table) .sheet-head,.sheet-page:has(.g210-match) .sheet-head,.sheet-page:has(.g210-center) .sheet-head{gap:2mm}.sheet-page:has(.g210-table) .sheet-field,.sheet-page:has(.g210-match) .sheet-field,.sheet-page:has(.g210-center) .sheet-field{font-size:9pt}
    .sheet-page:has(.g210-wrong) .sheet-title{font-size:8pt}
  `;
  function installCss() { if (document.getElementById('g210-style')) return; const s = el('style'); s.id = 'g210-style'; s.textContent = CSS; document.head.append(s); }
  function box(value, answer) { return el('span', 'g210-box', answer ? String(value) : NBSP); }
  function blocks(a, b) {
    const wrap = el('div', 'g210-units');
    [a, b].forEach((n, i) => { if (i) wrap.append(el('span', 'g210-plus', '+')); const group = el('div', 'g210-block'); for (let j = 0; j < n; j++) group.append(el('i')); wrap.append(group); });
    return wrap;
  }
  function renderUnit(cell, q, answer, config) {
    installCss(); const kind = config.gen.kind, p = q.places, a = fmt(q.a, p), b = fmt(q.b, p), sum = fmt(q.sum, p);
    const wrap = el('div', 'g210-center'); cell.append(wrap);
    if (kind === 'picture' || kind === 'model-blank') {
      wrap.append(el('div', 'g210-unit', '■ 한 칸 = ' + fmt(1, p)), blocks(q.a, q.b));
      const line = el('div', 'g210-line');
      if (kind === 'picture') { line.append(el('span', '', a + ' + ' + b + ' = '), box(sum, answer)); }
      else { line.append(el('span', '', a + ' + ')); line.append(box(b, answer)); line.append(el('span', '', ' = ' + sum)); }
      wrap.append(line);
    } else if (kind === 'relation') {
      wrap.classList.add('g210-relation');
      const inputs = el('div', 'g210-relation-inputs');
      inputs.append(el('span', 'g210-relation-node', a), el('span', 'g210-plus', '+'), el('span', 'g210-relation-node', b));
      wrap.append(inputs, el('div', 'g210-relation-arrows', '↘  ↙'), box(sum, answer));
    } else {
      wrap.append(el('div', 'g210-small', q.a + '칸과 ' + q.b + '칸을 모으면'));
      const line = el('div', 'g210-line'); line.append(el('span', '', a + ' + ' + b + ' = '), box(sum, answer)); wrap.append(line);
    }
  }
  function renderAlign(cell, q, answer, config) {
    installCss(); const kind = config.gen.kind, wrap = el('div', 'g210-center'); cell.append(wrap);
    const line = el('div', 'g210-line');
    if (kind === 'align-blank') { wrap.classList.add('g210-align-blank'); line.append(el('span', '', q.a)); line.append(box('0', answer)); line.append(el('span', '', ' + ' + q.b)); }
    else {
      const wrong = (Number(q.a) / 10).toFixed(2);
      wrap.append(el('div', 'g210-small', '잘못 맞춘 식'));
      wrap.append(el('div', 'g210-wrong', wrong + ' + ' + q.b));
      line.append(el('span', '', '바르게: '), box(q.aligned + ' + ' + q.b, answer));
    }
    wrap.append(line);
  }
  function buildMatch(config) {
    // 세트당 4쌍, 2단 × 4줄(8세트). 한 세트 안의 합은 모두 다르고, 같은 두 수(순서만 다른 것 포함)는 한 번만 쓴다.
    const p = config.gen.places, pool = shuffle(units(config, 64), random(config.seed ^ 0x785));
    const items = [], used = new Set(), per = 4, sets = 8;
    for (let group = 0; group < sets; group++) {
      const pairs = [], sums = new Set();
      for (const q of pool) {
        const k = Math.min(q.a, q.b) + ':' + Math.max(q.a, q.b);
        if (used.has(k) || sums.has(q.sum)) continue;
        pairs.push(q); sums.add(q.sum); used.add(k); if (pairs.length === per) break;
      }
      if (pairs.length !== per) throw Error(config.typeId + ': 선 잇기 ' + per * sets + '쌍을 만들지 못했습니다.');
      const rnd = random((Number(config.seed) + group * 8191) >>> 0);
      let order = shuffle([0, 1, 2, 3], rnd);
      for (let t = 0; t < 40 && order.some((x, i) => x === i); t++) order = shuffle([0, 1, 2, 3], rnd);
      if (order.some((x, i) => x === i)) order = [1, 2, 3, 0];
      items.push({ kind: 'bundle', compact: true, compactWl: p === 1 ? 28 : 34, compactWr: p === 1 ? 12 : 13, compactGap: 16, caption: '',
        pairs: pairs.map(q => [fmt(q.a, p) + ' + ' + fmt(q.b, p), fmt(q.sum, p)]), order, rowsWeight: per });
    }
    return { items, layout: { cols: sets, rows: per, count: per * sets }, pairs: per * sets };
  }
  function renderMatch(config, item, answer) { return root.MatchingSheet.formats['matching-lines'].render(config, item, answer); }
  function buildTable(config) { const rows = aligned(config, 40), items = []; for (let i = 0; i < 4; i++) items.push({ rows: rows.slice(i * 10, i * 10 + 10), rowsWeight: 1 }); return { items, layout: { cols: 2, rows: 2, count: 40 } }; }
  function renderTable(config, item, answer) {
    installCss(); const table = el('div', 'g210-table');
    ['주어진 식', '정수', '0.1', '0.01'].forEach(label => table.append(el('div', 'g210-table-head', label)));
    item.rows.forEach(q => {
      const [whole, tenth] = q.a.split('.');
      table.append(el('div', '', q.a + ' + ' + q.b), el('div', '', whole), el('div', '', tenth));
      const slot = el('div'); slot.append(box('0', answer)); table.append(slot);
    });
    return table;
  }
  const specs = [
    ['2-1-0-0', '0.1 단위끼리 모으기', 1], ['2-1-0-1', '0.01 단위끼리 모으기', 2]
  ];
  const entries = [];
  for (const [id, concept, places] of specs) {
    const forms = [
      ['그림 두 묶음을 합쳐 수 쓰기', 'picture', 'g210-picture', 2, 6, '한 칸의 크기를 보고 두 묶음을 합쳐 쓰세요.'],
      ['수 모형의 빈칸 채우기', 'model-blank', 'g210-picture', 2, 6, '한 칸의 크기를 보고 빈칸을 채우세요.'],
      ['같은 합을 만드는 짝 연결하기', 'match', 'g210-matching', 8, 4, '같은 합을 나타내는 식과 수를 선으로 이으세요.'],
      ['모으기 관계도 완성하기', 'relation', 'g210-relation', 3, 8, '두 묶음을 모은 수를 빈칸에 쓰세요.']
    ];
    forms.forEach(([title, kind, format, cols, rows, instruction], i) => entries.push({ typeId: id + '-t' + (i + 1), title: (places === 1 ? '0.1' : '0.01') + ' 모으기 · ' + title, instruction, format, cols, rows, count: cols * rows, fontPt: kind === 'match' ? 14 : kind === 'relation' ? 15 : 15, maxProblems: cols * rows, seed: 20261001, autoFit: false, gen: { bundle: '2-1-0', kind, places } }));
  }
  [
    ['자리표를 이용해 계산 준비하기', 'align-table', 'g210-table', 4, 10, '소수점을 맞추고 한 자리 소수 끝에 0을 붙여 쓰세요.'],
    ['소수점 위치와 빈자리 채우기', 'align-blank', 'g210-align', 3, 13, '끝에 붙일 0을 빈칸에 쓰세요.'],
    ['자릿값이 어긋난 식 고치기', 'align-error', 'g210-error', 2, 6, '잘못된 자릿값을 찾아 식을 바르게 고쳐 쓰세요.']
  ].forEach(([title, kind, format, cols, rows, instruction], i) => entries.push({ typeId: '2-1-0-2-t' + (i + 1), title: '소수 0 붙여 맞추기 · ' + title, instruction, format, cols, rows, count: cols * rows, fontPt: kind === 'align-table' ? 14 : 16, maxProblems: cols * rows, seed: 20261001, autoFit: false, gen: { bundle: '2-1-0', kind } }));
  root.Sheet.register('g210-picture', renderUnit);
  root.Sheet.register('g210-relation', renderUnit);
  root.Sheet.register('g210-align', renderAlign);
  root.Sheet.register('g210-error', renderAlign);
  root.MatchingSheet.formats['g210-matching'] = { page: 'blocks', title: '같은 합 연결하기', build: buildMatch, render: renderMatch };
  root.MatchingSheet.formats['g210-table'] = { page: 'grid', title: '자리표', build: buildTable, render: renderTable };
  const original = root.SheetGen.generate;
  root.SheetGen.generate = function (config) { return config?.gen?.bundle === '2-1-0' ? buildItems(config) : original.apply(this, arguments); };
  entries.forEach(entry => { if (entry.typeId !== '2-1-0-2-t3') root.SheetCatalog.push(entry); });
  root.Sheet210 = { entries, buildItems, buildMatch, buildTable };
})(globalThis);
