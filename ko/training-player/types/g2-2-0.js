/* 2-2-0: decimal subtraction preparation. All numerical examples originate in Worksheets. */
(function (root) {
  'use strict';
  const Sheet = root.Sheet, Catalog = root.SheetCatalog, Matching = root.MatchingSheet;
  const blank = '\u00a0';
  const el = (tag, cls, value) => { const n = document.createElement(tag); if (cls) n.className = cls; if (value !== undefined) n.textContent = value; return n; };
  const fmt = (n, p) => (n / 10 ** p).toFixed(p);
  function random(seed) {
    let state = (Number(seed) >>> 0) || 1;
    return max => { state += 0x6d2b79f5; let t = state; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) % max; };
  }
  function shuffle(items, rnd) {
    const out = items.slice();
    for (let i = out.length - 1; i > 0; i--) { const j = rnd(i + 1); [out[i], out[j]] = [out[j], out[i]]; }
    return out;
  }
  function source(id, seed, count, accept, keyOf) {
    if (!root.Worksheets?.generate) throw Error('기존 Worksheets 생성기가 없습니다.');
    const result = [], seen = new Set();
    for (let batch = 0; batch < 1000 && result.length < count; batch++) {
      const rows = root.Worksheets.generate(id, (Number(seed) + Math.imul(batch, 104729)) >>> 0, 32);
      for (const q of rows) {
        if (!accept(q)) continue;
        const key = keyOf(q);
        if (seen.has(key)) continue;
        seen.add(key); result.push(q);
        if (result.length === count) break;
      }
    }
    if (result.length !== count) throw Error(id + ': 조건에 맞는 고유 문항 ' + count + '개 중 ' + result.length + '개만 찾았습니다.');
    return result;
  }
  const sub = q => q.op === '−' || q.op === '-';
  const validUnits = q => sub(q) && Number.isInteger(q.a) && Number.isInteger(q.b) &&
    q.a >= 2 && q.a <= 19 && q.b >= 1 && q.b <= 9 && q.a >= q.b && Number(q.answer) === q.a - q.b;
  function unitRows(config, count, exchange) {
    const seed = config.seed, filter = q => validUnits(q) && (!exchange || q.a >= 10 && q.a <= 19 && q.a % 10 < q.b);
    const id = exchange ? 'natural-sub-2-1' : 'natural-sub-2-1';
    let rows = source(id, seed, count, filter, q => q.a + ':' + q.b);
    if (!exchange && count <= 42) {
      const smallCount = Math.min(Math.floor(count / 2), 20);
      const small = source('natural-sub-1-1', seed + 17, smallCount, filter, q => q.a + ':' + q.b);
      rows = small.concat(rows.slice(0, count - smallCount));
    }
    return rows.map(q => ({ a: Number(q.a), b: Number(q.b), c: Number(q.answer), p: config.gen.p || 1 }))
      .sort((x, y) => x.a - y.a || x.b - y.b);
  }
  const decimalValid = q => sub(q) && /^\d+\.\d$/.test(String(q.a)) && /^\d+\.\d{2}$/.test(String(q.b)) &&
    Math.round(Number(q.a) * 100) >= Math.round(Number(q.b) * 100) &&
    Math.round(Number(q.answer) * 100) === Math.round((Number(q.a) - Number(q.b)) * 100);
  function alignedRows(config, count) {
    return source('decimal-sub-1dp-2dp', config.seed, count, decimalValid, q => q.a + ':' + q.b)
      .map(q => ({ a: String(q.a), b: String(q.b), c: String(q.answer), aligned: Number(q.a).toFixed(2) }))
      .sort((x, y) => Number(x.a) - Number(y.a) || Number(x.b) - Number(y.b));
  }
  function buildItems(config) {
    const kind = config.gen.kind, count = config.count;
    if (kind === 'unit-picture' || kind === 'unit-equation') return unitRows(config, count, false);
    if (kind === 'exchange-picture' || kind === 'exchange-equal' || kind === 'exchange-prep') {
      let rows = unitRows(config, kind === 'exchange-equal' ? 45 : count, true);
      if (kind === 'exchange-equal') {
        // 이 식은 윗수 a 와 단위만 쓰므로 같은 (a, 단위) 가 반복되지 않게 윗수마다 한 번, 단위 두 가지로 만든다(최대 20개).
        const seenA = new Set(), uniq = [];
        for (const q of rows) if (!seenA.has(q.a)) { seenA.add(q.a); uniq.push(q); }
        rows = [];
        for (const p of [1, 2]) for (const q of uniq) rows.push({ ...q, p });
        // 윗수 10~18(9가지) × 단위 2가지 = 18개가 전부라 모두 쓴다 → seed 마다 단위별 줄 안의 순서를 섞는다.
        const rnd = random((Number(config.seed) ^ 0x220e) >>> 0);
        return [1, 2].flatMap(p => shuffle(rows.filter(q => q.p === p), rnd)).slice(0, count);
      }
      rows.forEach((q, i) => { q.p = i % 2 ? 2 : 1; });
      return rows;
    }
    if (kind === 'align-blank' || kind === 'align-error') return alignedRows(config, count);
    throw Error(config.typeId + ': 알 수 없는 유형');
  }
  const CSS = `
    .g220-body{position:absolute;inset:1mm 1mm 1mm 6mm;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1mm;font-variant-numeric:tabular-nums;line-height:1.25}
    .g220-unit{font-size:.8em;color:#222}.g220-diagram{display:flex;align-items:center;gap:2mm;max-width:100%}
    .g220-cells{display:grid;grid-template-columns:repeat(10,3.9mm);gap:.2mm;padding:.5mm;border:1px solid #777}
    .g220-cells i{width:3.9mm;height:3.9mm;background:#ddd;border:1px solid #555;box-sizing:border-box}
    .g220-cells i.used{background:white;position:relative}.g220-cells i.used:after{content:'×';position:absolute;inset:0;text-align:center;font-size:11pt;line-height:3.7mm}
    .g220-box{display:inline-flex;align-items:center;justify-content:center;min-width:1.8em;height:1.6em;border:1px solid #555;margin:0 .5mm;vertical-align:middle}
    .g220-answer{color:#d71f10;font-weight:700}.g220-line{white-space:nowrap;font-size:1.15em}.g220-small{font-size:.8em;color:#222}
    .g220-match{position:relative;flex:1;min-height:0;display:grid;grid-template-columns:44% 12% 44%;grid-template-rows:repeat(6,1fr);font-variant-numeric:tabular-nums}
    .g220-match>div{display:flex;align-items:center;white-space:nowrap}.g220-match .right{grid-column:3}.g220-match svg{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}.g220-match line{stroke:#b32b2b;stroke-width:1.5;vector-effect:non-scaling-stroke}
    .g220-mini{display:grid;grid-template-columns:repeat(10,1.5mm);gap:.15mm;margin-left:1mm}.g220-mini i{width:1.5mm;height:1.5mm;background:#777;border:1px solid #555}
    .mt-body:has(.g220-table){display:grid;grid-template-columns:repeat(2,minmax(0,1fr));grid-template-rows:repeat(2,minmax(0,1fr));gap:3mm}
    .g220-table{flex:1;min-height:0;display:grid;grid-template-columns:18% 18% 10% 10% 22% 22%;grid-template-rows:repeat(11,minmax(0,1fr));font-variant-numeric:tabular-nums;font-size:1.15em}
    .g220-table>div{display:flex;align-items:center;justify-content:center;min-width:0;border-bottom:1px solid #ddd}
    .g220-table .g220-heading{font-size:.75em;color:#222;text-align:center}
    .g220-table .g220-place{border-left:1px solid #ddd}
    .g220-table .g220-box{min-width:9mm;height:1.6em;margin:0;font-size:1em}
    .g220-correction{width:100%;display:flex;align-items:center;justify-content:space-around;gap:2mm}
    .g220-stack{font-size:1.15em;display:grid;grid-template-columns:repeat(6,1em);justify-items:center;line-height:1.1;font-variant-numeric:tabular-nums}
    .g220-stack.g220-wrong{grid-template-columns:repeat(8,1em)}
    .g220-stack .rule{grid-column:1/-1;width:100%;border-top:1px solid #333;height:1mm}
    .g220-fix{width:28mm;height:27mm;border:1px solid #ddd;background:repeating-linear-gradient(0deg,transparent 0 5mm,#eee 5mm 5.2mm)}
  `;
  function css() { if (document.getElementById('g220-style')) return; const s = el('style'); s.id = 'g220-style'; s.textContent = CSS; document.head.append(s); }
  function box(value, answer) { return el('span', 'g220-box' + (answer ? ' g220-answer' : ''), answer ? String(value) : blank); }
  function model(q) {
    const wrap = el('div', 'g220-diagram');
    for (let start = 0; start < q.a; start += 10) {
      const cells = el('div', 'g220-cells');
      for (let j = start; j < Math.min(start + 10, q.a); j++) cells.append(el('i', j >= q.a - q.b ? 'used' : ''));
      wrap.append(cells);
    }
    return wrap;
  }
  function renderUnit(cell, q, answer, config) {
    css(); const kind = config.gen.kind, body = el('div', 'g220-body'); cell.append(body);
    if (kind === 'unit-picture') {
      body.append(el('div', 'g220-unit', '한 칸 = 0.1 · ×표한 칸은 덜어 냄'), model(q));
      const line = el('div', 'g220-line'); line.append(el('span', '', fmt(q.a, 1) + ' − ' + fmt(q.b, 1) + ' = '), box(fmt(q.c, 1), answer)); body.append(line);
    } else if (kind === 'unit-equation') {
      body.append(el('div', 'g220-small', '0.1이 ' + q.a + '개에서 ' + q.b + '개를 덜면'));
      const line = el('div', 'g220-line'); line.append(el('span', '', q.a + ' − ' + q.b + ' = '), box(q.c, answer), el('span', '', '개')); body.append(line);
    } else if (kind === 'exchange-picture') {
      body.append(el('div', 'g220-unit', '한 칸 = ' + fmt(1, q.p) + ' · 10칸 = ' + fmt(10, q.p)));
      body.append(el('div', 'g220-line', q.a + '칸 − ' + q.b + '칸 →'));
      const line = el('div', 'g220-line'); line.append(el('span', '', (q.a - 10) + '칸 + ')); line.append(box(10, answer)); line.append(el('span', '', '칸 − ' + q.b + '칸')); body.append(line);
      body.append(model(q));
    } else if (kind === 'exchange-equal') {
      const unit = fmt(1, q.p);
      const line = el('div', 'g220-line'); line.append(el('span', '', fmt(q.a, q.p) + ' = ' + fmt(q.a - 10, q.p) + ' + '), box('10', answer), el('span', '', ' × ' + unit)); body.append(line);
      body.append(el('div', 'g220-small', '큰 단위 ' + fmt(10, q.p) + '을 ' + unit + ' 10개로 바꿈'));
    } else if (kind === 'exchange-prep') {
      const unit = fmt(1, q.p);
      body.append(el('div', 'g220-line', fmt(q.a, q.p) + ' − ' + fmt(q.b, q.p) + ' ='));
      const line = el('div', 'g220-line'); line.append(el('span', '', '(' + fmt(q.a - 10, q.p) + ' + ')); line.append(box('10', answer)); line.append(el('span', '', ' × ' + unit + ') − ' + fmt(q.b, q.p))); body.append(line);
    } else if (kind === 'align-blank') {
      const line = el('div', 'g220-line'); line.append(el('span', '', q.a), box('0', answer), el('span', '', ' − ' + q.b)); body.append(line);
    } else if (kind === 'align-error') {
      const wrong = (Math.round(Number(q.a) * 1000) - Math.round(Number(q.b) * 100)) / 1000;
      const correction = el('div', 'g220-correction');
      const wrongWork = el('div', 'g220-stack g220-wrong');
      const rightWork = el('div', 'g220-stack');
      const row = (stack, value, width) => [...String(value).padStart(width, ' ')].forEach(ch => stack.append(el('span', '', ch === ' ' ? blank : ch)));
      row(wrongWork, q.aligned.padStart(7, ' ').padEnd(8, ' '), 8);
      row(wrongWork, '−' + q.b, 8);
      wrongWork.append(el('div', 'rule'));
      row(wrongWork, wrong.toFixed(3), 8);
      row(rightWork, q.aligned, 6);
      row(rightWork, '−' + q.b, 6);
      rightWork.append(el('div', 'rule'));
      const resultStart = rightWork.children.length;
      row(rightWork, answer ? Number(q.c).toFixed(2) : '', 6);
      if (answer) [...rightWork.children].slice(resultStart).forEach(n => n.classList.add('g220-answer'));
      correction.append(wrongWork, rightWork);
      body.append(correction);
    }
  }
  function matchingBuild(config) {
    // 세트당 4쌍, 2단 × 4줄(8세트). 한 세트 안의 결과는 서로 다르고 같은 식은 한 번만 쓴다.
    const pool = shuffle(unitRows(config, 60, false), random(config.seed ^ 0x220));
    const items = [], used = new Set(), per = 4, sets = 8;
    for (let group = 0; group < sets; group++) {
      const pairs = [], results = new Set();
      for (const q of pool) {
        const key = q.a + ':' + q.b;
        if (used.has(key) || results.has(q.c)) continue;
        pairs.push(q); results.add(q.c); used.add(key);
        if (pairs.length === per) break;
      }
      if (pairs.length !== per) throw Error(config.typeId + ': 선 잇기 ' + per * sets + '쌍을 만들지 못했습니다.');
      const rnd = random(config.seed + group * 8191);
      let order = shuffle([0, 1, 2, 3], rnd);
      for (let t = 0; t < 40 && order.some((value, i) => value === i); t++) order = shuffle([0, 1, 2, 3], rnd);
      if (order.some((value, i) => value === i)) order = [1, 2, 3, 0];
      items.push({ kind: 'bundle', compact: true, compactWl: 28, compactWr: 12, compactGap: 22, caption: '',
        pairs: pairs.map(q => [fmt(q.a, 1) + ' − ' + fmt(q.b, 1), fmt(q.c, 1)]), order, rowsWeight: per });
    }
    return { items, layout: { cols: sets, rows: per, count: per * sets }, pairs: per * sets };
  }
  function matchingRender(config, item, answer) { return Matching.formats['matching-lines'].render(config, item, answer); }
  function tableBuild(config) {
    const rows = alignedRows(config, 40), items = [];
    for (let i = 0; i < 4; i++) items.push({ caption: '자리표 ' + (i + 1) + ' · 소수점을 맞춰 쓰기', rows: rows.slice(i * 10, i * 10 + 10) });
    return { items, layout: { cols: 2, rows: 4, count: 40 } };
  }
  function tableRender(config, item, answer) {
    css(); const table = el('div', 'g220-table');
    ['윗수', '아랫수', '십', '일', '소수 첫째', '소수 둘째'].forEach((name, i) =>
      table.append(el('div', 'g220-heading' + (i >= 2 ? ' g220-place' : ''), name)));
    item.rows.forEach(q => {
      const [whole, fraction] = q.aligned.split('.');
      table.append(el('div', '', q.a), el('div', '', q.b),
        el('div', 'g220-place', whole.length > 1 ? whole[0] : blank),
        el('div', 'g220-place', whole.at(-1)),
        el('div', 'g220-place', fraction[0]));
      const slot = el('div', 'g220-place'); slot.append(box('0', answer)); table.append(slot);
    });
    return table;
  }
  const defs = [
    ['2-2-0-0', '0.1 단위끼리 덜어 내기', [
      ['그림에서 덜고 남은 수 쓰기', 'unit-picture', 'g220-unit', 2, 6, '한 칸이 0.1인 그림에서 지운 만큼 덜고 남은 수를 쓰세요.'],
      ['같은 단위의 개수로 식 완성하기', 'unit-equation', 'g220-unit', 2, 12, '0.1 단위의 개수로 뺄셈식을 완성하세요.'],
      ['계산식과 결과 연결하기', 'match', 'g220-match', 8, 4, '계산식과 계산 결과를 선으로 이으세요.']
    ]],
    ['2-2-0-1', '1과 0.1을 더 작은 단위로 바꾸기', [
      ['그림으로 단위 바꾸기', 'exchange-picture', 'g220-unit', 2, 6, '큰 단위 1개를 작은 단위 10개로 바꾸어 보세요.'],
      ['바꾸기 전후 빈칸 채우기', 'exchange-equal', 'g220-unit', 2, 9, '바꾸기 전후가 같은 양이 되도록 빈칸을 채우세요.'],
      ['받아내림 준비식 완성하기', 'exchange-prep', 'g220-unit', 2, 12, '받아내림을 준비하는 식의 빈칸을 채우세요.']
    ]],
    ['2-2-0-2', '소수 끝에 0을 붙여 받아내림 준비하기', [
      ['자리표를 이용해 계산 준비하기', 'align-table', 'g220-table', 4, 10, '소수점을 맞추고 한 자리 소수 끝에 0을 붙여 쓰세요.'],
      ['소수점 위치와 빈자리 채우기', 'align-blank', 'g220-unit', 3, 13, '소수점을 맞춘 뒤 빈자리에 들어갈 숫자를 쓰세요.'],
      ['자릿값이 어긋난 식 고치기', 'align-error', 'g220-error', 2, 6, '잘못된 계산을 살펴보고 바른 식과 답을 쓰세요.']
    ]]
  ];
  const entries = [];
  defs.forEach(([id, concept, forms]) => forms.forEach(([title, kind, format, cols, rows, instruction], i) => {
    entries.push({ typeId: id + '-t' + (i + 1), title: concept.replace('소수 끝에 0을 붙여 받아내림 준비하기', '소수 끝에 0 붙이기') + ' · ' + title, instruction,
      format, cols, rows, count: cols * rows, maxProblems: cols * rows,
      fontPt: { 'unit-picture': 15, 'unit-equation': 18, match: 14, 'exchange-picture': 15, 'exchange-equal': 17, 'exchange-prep': 16, 'align-table': 14, 'align-blank': 16, 'align-error': 15 }[kind],
      seed: 20261001, autoFit: false, gen: { bundle: '2-2-0', kind } });
  }));
  Sheet.register('g220-unit', renderUnit);
  Sheet.register('g220-error', renderUnit);
  Matching.formats['g220-match'] = { page: 'blocks', build: matchingBuild, render: matchingRender, title: '계산식과 그림 연결하기' };
  Matching.formats['g220-table'] = { page: 'blocks', build: tableBuild, render: tableRender, title: '자리표' };
  const original = root.SheetGen.generate;
  root.SheetGen.generate = function (config) { return config?.gen?.bundle === '2-2-0' ? buildItems(config) : original.apply(this, arguments); };
  entries.forEach(entry => { if (!['2-2-0-2-t1', '2-2-0-2-t2'].includes(entry.typeId)) Catalog.push(entry); });
  root.Sheet220 = { entries, buildItems, matchingBuild, tableBuild };
})(globalThis);
