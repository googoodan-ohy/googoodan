(function (root) {
  'use strict';
  const BUNDLE = '2-3-2';
  const concepts = [
    { id: '2-3-2-0', name: '소수 첫째 자리 × 소수 첫째 자리', short: '소수 한 자리끼리', source: 'decimal-mul-1', places: [1, 1] },
    { id: '2-3-2-1', name: '소수 첫째 자리 × 소수 둘째 자리', short: '소수 한·두 자리', source: 'decimal-mul-1dp-2dp', places: [1, 2] },
    { id: '2-3-2-2', name: '소수 둘째 자리 × 소수 둘째 자리', short: '소수 두 자리끼리', source: 'decimal-mul-2', places: [2, 2] },
    { id: '2-3-2-3', name: '곱에 0을 채워 소수점 나타내기', short: '곱에 0 채우기', source: 'decimal-mul-1dp-2dp', places: [1, 2] },
    { id: '2-3-2-4', name: '1보다 작은 수를 곱할 때의 크기', short: '1보다 작은 수의 곱', source: 'decimal-mul-1dp-2dp', places: [1, 2] }
  ];
  const byId = Object.fromEntries(concepts.map(c => [c.id, c]));
  const placeCount = value => (String(value).split('.')[1] || '').length;
  const scaled = value => Number(String(value).replace('.', ''));
  function fixed(n, places) {
    const s = String(n).padStart(places + 1, '0');
    return places ? s.slice(0, -places) + '.' + s.slice(-places) : s;
  }
  function accepts(row, concept) {
    if (row.op !== '×' || placeCount(row.a) !== concept.places[0] || placeCount(row.b) !== concept.places[1]) return false;
    const a = scaled(row.a), b = scaled(row.b);
    if (a < 1 || b < 1 || a % 10 === 0 || b % 10 === 0) return false;
    const product = a * b, places = concept.places[0] + concept.places[1];
    if (Number(fixed(product, places)) !== Number(row.answer)) return false;
    if (concept.id === '2-3-2-3') return a >= 2 && a < 10 && b >= 1 && b < 100 && product < 100;
    if (concept.id === '2-3-2-4') return Number(row.b) >= .1 && Number(row.b) <= .99 && Number(row.a) <= 99.99 && Number(row.answer) < Number(row.a);
    return true;
  }
  function draw(config) {
    const concept = byId[config.gen.concept], count = config.count;
    const chosen = [], seen = new Set(), seed = Number(config.seed) || 1;
    for (let batch = 0; batch < 4000 && chosen.length < count; batch++) {
      const rows = root.Worksheets.generate(concept.source, (seed + Math.imul(batch, 104729)) >>> 0, 16);
      for (const q of rows) {
        const key = q.a + ':' + q.b;
        if (seen.has(key) || !accepts(q, concept)) continue;
        seen.add(key);
        const product = scaled(q.a) * scaled(q.b), places = concept.places[0] + concept.places[1];
        chosen.push({ a: String(q.a), b: String(q.b), op: '×', answer: fixed(product, places), product, places });
        if (chosen.length === count) break;
      }
    }
    if (chosen.length < count) throw Error(config.typeId + ': 조건에 맞는 문항이 ' + chosen.length + '/' + count + '개입니다.');
    chosen.sort((x, y) => x.product - y.product || Number(x.a) - Number(y.a) || Number(x.b) - Number(y.b));
    chosen.forEach((q, i) => {
      q.blank = (i * 7 + seed) % q.answer.replace('.', '').length;
      const wrongPlaces = q.places + (i % 2 ? 1 : -1);
      q.wrong = fixed(q.product, wrongPlaces);
      if (Number(q.wrong) === Number(q.answer)) q.wrong = String(q.product);
      q.ref = i % 2 && Number(q.a) > 1 ? 'b' : 'a';
      q.claim = i % 4 < 2 ? '>' : '<';
    });
    return chosen;
  }
  const CSS = `
    .g232-work{width:max-content;max-width:100%;margin:auto;font-family:ui-monospace,Consolas,monospace;font-size:1.15em;line-height:1.25;font-variant-numeric:tabular-nums;text-align:right}
    .g232-work .g232-row{min-height:1.35em;white-space:pre;border-bottom:1px solid transparent}
    .g232-work .g232-rule{border-top:1px solid #333}
    .g232-digit-box{display:inline-block;width:.9em;height:1.1em;box-sizing:border-box;border:1px solid #688c85;vertical-align:middle;}
    .g232-compare-circle{display:inline-flex;align-items:center;justify-content:center;width:7mm;height:7mm;border:1px solid #688c85;border-radius:50%;box-sizing:border-box;vertical-align:middle;}
    .g232-answer{color:#d71f10;font-weight:700}
    .g232-fix{display:flex;width:100%;box-sizing:border-box;gap:2mm;align-items:center;justify-content:space-around;height:100%}
    .g232-fix .g232-work{font-size:.95em;margin:0}
    .g232-write{border:1px solid #bbb;flex:1 1 45%;min-width:18mm;box-sizing:border-box;height:85%}
    .g232-text{font-size:1em;line-height:1.5;margin:0;white-space:nowrap;text-align:center;align-self:center}
    .g232-text .g232-answer{font-weight:700}
    .g232-text .g232-box{display:inline-block;min-width:2.4em;border-bottom:1.5px solid #555;text-align:center}
    .g232-text .g232-circle{display:inline-block;border:1.5px solid #d71f10;border-radius:50%;padding:0 .35em;color:#d71f10;font-weight:700}
    .g232-text .g232-choice{display:inline-block;padding:0 .35em;border:1.5px solid transparent;border-radius:50%}
    .g232-table{font-size:1em;line-height:1.5;width:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%}
    .g232-table table{border-collapse:collapse;width:96%;height:46%;text-align:center;margin-top:2mm}
    .g232-table td{border:1px solid #888;padding:.5mm;font-size:1.1em}
    .g232-table tr:first-child td{background:#f2f2f2;font-weight:700;font-size:.9em}
  `;
  function style() {
    if (document.getElementById('g232-style')) return;
    const el = document.createElement('style'); el.id = 'g232-style'; el.textContent = CSS; document.head.append(el);
  }
  function node(tag, cls, value) {
    const el = document.createElement(tag); if (cls) el.className = cls;
    if (value !== undefined) el.textContent = value; return el;
  }
  const pad = (text, cls) => { const row = node('div', 'g232-row' + (cls ? ' ' + cls : '')); return row; };
  // 세로셈. 문제로 인쇄된 값은 검정, 새로 쓰는 값(부분곱·결과 칸)만 빨강.
  //   partials: 부분곱 줄을 보이는가, resultChars: [글자, 빨강여부] 배열(없으면 빈 줄), resultAns: 결과 전체가 새 답인가
  function stack(q, opts) {
    const div = node('div', 'g232-work');
    div.append(node('div', 'g232-row', q.a), node('div', 'g232-row', '× ' + q.b));
    div.append(node('div', 'g232-row g232-rule', ' '));
    const digits = String(q.b).replace('.', '');
    for (let i = digits.length - 1; i >= 0; i--) {
      const part = node('div', 'g232-row' + (opts.partialsAnswer && !opts.partialBlanks ? ' g232-answer' : ''));
      const value = opts.partials ? String(scaled(q.a) * Number(digits[i]) * 10 ** (digits.length - 1 - i)) : ' ';
      [...value].forEach((ch, at) => {
        if (opts.partialBlanks && at === 0) part.append(node('span', opts.partialAnswers ? 'g232-answer' : 'g232-digit-box', opts.partialAnswers ? ch : ' '));
        else part.append(document.createTextNode(ch));
      });
      div.append(part);
    }
    const result = node('div', 'g232-row' + (opts.partials ? ' g232-rule' : ''));
    const chars = opts.result == null ? [' '] : typeof opts.result === 'string' ? [...opts.result].map(ch => [ch, opts.resultAnswer]) : opts.result;
    result.textContent = '';
    for (const [ch, red] of chars) result.append(node('span', ch === null ? 'g232-digit-box' : red ? 'g232-answer' : '', ch === null ? ' ' : ch));
    if (!chars.length) result.textContent = ' ';
    div.append(result);
    return div;
  }
  function renderVertical(cell, q, answer) {
    style(); cell.append(stack(q, { partials: answer, partialsAnswer: true, result: answer ? q.answer : null, resultAnswer: true }));
  }
  function renderBlank(cell, q, answer) {
    style(); const digitsOnly = q.answer.replace('.', '').split('');
    const at = q.blank % digitsOnly.length;
    const beforeDot = q.answer.indexOf('.');
    const chars = [];
    digitsOnly.forEach((d, i) => {
      if (i === beforeDot) chars.push(['.', false]);
      chars.push([i === at ? (answer ? d : null) : d, i === at && answer]);
    });
    cell.append(stack(q, { partials: true, partialBlanks: true, partialAnswers: answer, result: chars }));
  }
  function renderFix(cell, q, answer) {
    style(); const wrap = node('div', 'g232-fix');
    wrap.append(stack(q, { partials: true, result: q.wrong, resultAnswer: false }));
    if (answer) wrap.append(stack(q, { partials: true, partialsAnswer: false, result: q.answer, resultAnswer: true }));
    else wrap.append(node('div', 'g232-write'));
    cell.append(wrap);
  }
  const blankBox = (show, value) => node('span', 'g232-box' + (show ? ' g232-answer' : ''), show ? value : ' ');
  function renderTable(cell, q, answer) {
    style(); const wrap = node('div', 'g232-table');
    wrap.append(node('div', '', q.a + ' × ' + q.b));
    const table = node('table'), head = node('tr'), row = node('tr');
    ['소수점 뺀 곱', '소수 자리', '곱'].forEach((label, i) => {
      head.append(node('td', '', label));
      const td = node('td');
      if (i === 0) td.textContent = q.product; else if (i === 1) td.textContent = q.places; else td.append(blankBox(answer, q.answer));
      row.append(td);
    }); table.append(head, row); wrap.append(table); cell.append(wrap);
  }
  function renderShort(cell, q, answer) {
    style(); cell.append(node('div', 'g232-text', q.a + ' × ' + q.b + ' → ' + q.product + ' (소수 ' + q.places + '자리)'));
    const t = node('div', 'g232-text', '곱: '); t.append(blankBox(answer, q.answer)); cell.append(t);
  }
  function renderBad(cell, q, answer) {
    style(); cell.append(node('div', 'g232-text', q.a + ' × ' + q.b + ' = ' + q.wrong));
    const t = node('div', 'g232-text', '바르게: '); t.append(blankBox(answer, q.answer)); cell.append(t);
  }
  const sign = (x, y) => (x > y ? '>' : x < y ? '<' : '=');
  const refOf = q => (q.ref === 'b' ? q.b : q.a);
  function renderDirection(cell, q, answer) {
    style(); const t = node('div', 'g232-text', q.a + ' × ' + q.b + '의 곱은 ' + refOf(q) + '보다');
    const bigger = Number(q.answer) > Number(refOf(q));
    cell.append(t);
    const c = node('div', 'g232-text');
    [['커짐', true], ['작아짐', false]].forEach(([label, isBig], i) => {
      if (i) c.append(document.createTextNode('   '));
      c.append(node('span', answer && isBig === bigger ? 'g232-circle' : 'g232-choice', label));
    });
    cell.append(c);
  }
  function renderCompare(cell, q, answer) {
    style(); const t = node('div', 'g232-text', q.a + ' × ' + q.b + ' = '); t.append(blankBox(answer, q.answer)); cell.append(t);
    const u = node('div', 'g232-text', refOf(q) + '  '); u.append(node('span', 'g232-compare-circle' + (answer ? ' g232-answer' : ''), answer ? sign(Number(refOf(q)), Number(q.answer)) : ' '), document.createTextNode('  ' + (answer ? q.answer : '곱'))); cell.append(u);
  }
  function renderClaim(cell, q, answer) {
    style(); cell.append(node('div', 'g232-text', q.a + ' × ' + q.b + ' ' + q.claim + ' ' + refOf(q)));
    const truth = sign(Number(q.answer), Number(refOf(q))) === q.claim;
    const t = node('div', 'g232-text');
    t.append(node('span', answer ? 'g232-circle' : '', answer ? (truth ? '○' : '×') : '( ○ / × )'));
    cell.append(t);
  }
  const forms = {
    t1: { short: '가로셈', title: '가로셈으로 계산하기', instruction: '식을 계산하고 답을 쓰세요.', format: 'horizontal', cols: 3, rows: 13 },
    t2: { short: '세로셈', title: '세로셈으로 계산하기', instruction: '자연수처럼 계산한 뒤 소수점을 찍으세요.', format: 'g232-vertical-mul', cols: 4, rows: 5 },
    t3: { short: '세로 빈칸', title: '세로 풀이의 빈칸 채우기', instruction: '□ 안에 알맞은 수를 쓰세요.', format: 'g232-vertical-mul-blank', cols: 4, rows: 5 },
    t4: { short: '풀이 고치기', title: '잘못된 계산 과정 고치기', instruction: '틀린 계산을 오른쪽에 바르게 고쳐 쓰세요.', format: 'g232-error-fix', cols: 3, rows: 4 }
  };
  const special = {
    '2-3-2-3': [
      { short: '자리표', title: '자리표를 이용해 계산 준비하기', instruction: '소수점 없이 곱하고 소수 자릿수를 살펴보세요.', format: 'g232-place-table', cols: 3, rows: 5 },
      { short: '빈자리 채우기', title: '소수점 위치와 빈자리 채우기', instruction: '곱에 0을 채워 답을 쓰세요.', format: 'g232-short', cols: 3, rows: 13 },
      { short: '자릿값 고치기', title: '자릿값이 어긋난 식 고치기', instruction: '잘못된 곱을 바르게 고치세요.', format: 'g232-bad', cols: 3, rows: 13 }
    ],
    '2-3-2-4': [
      { short: '크기 고르기', title: '곱의 크기가 커질지 작아질지 고르기', instruction: '곱이 처음 수보다 커질지 작아질지 고르세요.', format: 'g232-direction', cols: 3, rows: 13 },
      { short: '크기 비교', title: '계산 후 원래 수와 크기 비교하기', instruction: '곱을 구하고 처음 수와 비교하여 ○ 안에 >, <, = 중 알맞은 것을 써넣으세요.', format: 'g232-compare', cols: 3, rows: 11 },
      { short: '설명 판단', title: '곱의 크기에 대한 설명 판단하기', instruction: '설명이 옳으면 ○, 틀리면 × 하세요.', format: 'g232-claim', cols: 3, rows: 13 }
    ]
  };
  // Leave room for the answer page's " · 정답" suffix in the shared header.
  const compactTitles = {
    '2-3-2-0-t4': '소수 한 자리끼리·고치기',
    '2-3-2-2-t4': '소수 두 자리끼리·고치기',
    '2-3-2-4-t1': '1보다 작은 수 곱·크기',
    '2-3-2-4-t2': '1보다 작은 수 곱·크기 비교',
    '2-3-2-4-t3': '1보다 작은 수 곱·설명 판단'
  };
  const FONT = { horizontal: 18, 'g232-vertical-mul': 14, 'g232-vertical-mul-blank': 14, 'g232-error-fix': 13, 'g232-place-table': 14, 'g232-short': 15, 'g232-bad': 15, 'g232-direction': 15, 'g232-compare': 15, 'g232-claim': 15 };
  const catalog = [];
  concepts.forEach((concept, ci) => {
    const list = special[concept.id] || Object.values(forms);
    list.forEach((form, i) => catalog.push({
      typeId: concept.id + '-t' + (i + 1), title: compactTitles[concept.id + '-t' + (i + 1)] || concept.short + '·' + form.short,
      roadmapTitle: form.title, instruction: form.instruction, format: form.format,
      cols: form.cols, rows: form.rows, count: form.cols * form.rows,
      fontPt: ((ci === 1 || ci === 2) && /vertical-mul/.test(form.format) ? 12 : (ci === 3 && form.format === 'g232-short' ? 13 : (ci === 4 && form.format === 'g232-direction' ? 13 : FONT[form.format] || 15))), autoFit: false, maxProblems: form.cols * form.rows, seed: 20261001 + ci * 10 + i,
      gen: { bundle: BUNDLE, concept: concept.id, legacyId: concept.source }
    }));
  });
  function install() {
    const renderers = [
      ['g232-vertical-mul', renderVertical], ['g232-vertical-mul-blank', renderBlank],
      ['g232-error-fix', renderFix], ['g232-place-table', renderTable], ['g232-short', renderShort],
      ['g232-bad', renderBad], ['g232-direction', renderDirection], ['g232-compare', renderCompare], ['g232-claim', renderClaim]
    ];
    renderers.forEach(([key, fn]) => root.Sheet.register(key, fn));
    const original = root.SheetGen.generate;
    root.SheetGen.generate = function (config) {
      return config?.gen?.bundle === BUNDLE ? draw(config) : original.apply(this, arguments);
    };
    catalog.forEach(entry => root.SheetCatalog.push(entry));
  }
  install();
  root.Sheet232 = { concepts, catalog, accepts, draw };
})(globalThis);
