/* 묶음 2-3-0: 기존 소수 곱셈 문항으로 곱의 자릿값을 설명하는 인쇄용 유형. */
(function (root) {
  'use strict';
  const BUNDLE = '2-3-0';
  const SOURCES = ['decimal-mul-1', 'decimal-mul-2', 'decimal-mul-1dp-2dp', 'decimal-mul-2dp-1dp'];
  const node = (tag, cls, value) => {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (value !== undefined) el.textContent = value;
    return el;
  };
  const places = value => (String(value).split('.')[1] || '').length;
  const unscaled = value => Number(String(value).replace('.', ''));
  function fixed(n, dp) {
    const s = String(n).padStart(dp + 1, '0');
    return dp ? s.slice(0, -dp) + '.' + s.slice(-dp) : s;
  }
  function candidate(row) {
    const a = String(row.a), b = String(row.b), da = places(a), db = places(b);
    if (row.op !== '×' || ![1, 2].includes(da) || ![1, 2].includes(db)) return null;
    if (unscaled(a) < 2 || unscaled(b) < 2 || Number(a) > 9.99 || Number(b) > 9.99) return null;
    const A = unscaled(a), B = unscaled(b), raw = A * B, dp = da + db;
    if (Number(row.answer) !== raw / 10 ** dp) throw Error('기존 생성기 곱 불일치: ' + a + ' × ' + b);
    return { a, b, A, B, da, db, dp, raw, answer: fixed(raw, dp), op: '×' };
  }
  function collect(config) {
    const need = config.count;
    const seed = Number(config.seed) >>> 0;
    const seen = new Set(), pool = [];
    for (let round = 0; round < 240 && pool.length < need * 30; round++) {
      const source = SOURCES[round % SOURCES.length];
      const rows = root.Worksheets.generate(source, (seed + Math.imul(round + 1, 104729)) >>> 0, 32);
      for (const row of rows) {
        const q = candidate(row);
        if (!q || seen.has(q.a + ':' + q.b)) continue;
        seen.add(q.a + ':' + q.b); pool.push(q);
      }
    }
    const concept = config.concept;
    let accepted = pool.filter(q => {
      if (concept === 0 && q.A > 9 && q.B > 9) return false;
      if (concept === 2 && config.form === 'error') return q.raw % 10 === 0 || q.raw < 10 ** q.dp;
      return true;
    });
    accepted.sort((x, y) => Number(x.a) * Number(x.b) - Number(y.a) * Number(y.b) || x.dp - y.dp || x.A - y.A || x.B - y.B);
    // 0 또는 1이 피연산자 숫자에 있는 쉬운 문항은 한 장의 10% 이하.
    const easyLimit = Math.floor(need * .1);
    const chosen = [], usedAnswers = new Set();
    let easy = 0;
    for (const q of accepted) {
      const simple = /[01]/.test(String(q.A) + String(q.B));
      if (simple && easy >= easyLimit) continue;
      // 선 잇기는 오른쪽 답 표현도 모두 서로 달라야 일대일 대응이 된다.
      if (config.form === 'match' && usedAnswers.has(q.answer)) continue;
      chosen.push(q); usedAnswers.add(q.answer);
      if (simple) easy++;
      if (chosen.length === need) break;
    }
    if (chosen.length !== need) throw Error(config.typeId + ': 기존 생성기에서 조건에 맞는 문항 ' + need + '개 중 ' + chosen.length + '개');
    return chosen;
  }
  function style() {
    if (document.getElementById('g230-style')) return;
    const el = node('style'); el.id = 'g230-style';
    el.textContent = `
      .g230{height:100%;width:100%;min-width:0;padding:1mm;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;line-height:1.3;white-space:nowrap;font-variant-numeric:tabular-nums;}
      .g230 .g230-line{flex:none;display:flex;align-items:center;justify-content:center;gap:.3em;min-height:1.5em;margin:.6mm 0;}
      .g230 .g230-frac .g230-box{min-width:2.6em;border-bottom:1.5px solid #555;}
      .g230 .g230-head{font-weight:700;}
      .g230 .g230-box{display:inline-block;min-width:2.2em;padding:0 .2em;border-bottom:1.5px solid #555;text-align:center;line-height:1.25;}
      .g230 .g230-ans{color:#d71f10;font-weight:700;}
      .g230 .g230-frac{display:inline-flex;flex-direction:column;align-items:center;line-height:1.2;vertical-align:middle;}
      .g230 .g230-frac>span:first-child{border-bottom:1.2px solid #111;padding:0 .2em .08em;}
      .g230 .g230-frac>span:last-child{padding-top:.08em;}
      .g230 .g230-work{align-self:stretch;flex:1;min-height:9mm;margin:1.5mm 2mm 0;border:1px dashed #bbb;border-radius:1.5mm;}
      .g230 .g230-table{border-collapse:collapse;width:100%;height:46mm;text-align:center;table-layout:fixed;}
      .g230 .g230-table td,.g230 .g230-table th{border:1px solid #888;padding:1mm .5mm;}
      .g230 .g230-table th{font-weight:700;background:#f2f2f2;font-size:.9em;}
      .g230 .g230-table td{font-size:1.15em;}
      .g230.g230-fraction-process{font-size:11pt!important;box-sizing:border-box;}
      .g230-fraction-process .g230-line{gap:.7mm;}
      .g230.g230-fraction-process .g230-box{box-sizing:border-box;min-width:15mm;height:14mm;border:1px solid #688c85;border-radius:0;display:inline-flex;align-items:center;justify-content:center;padding:0 .5mm;}
      .g230.g230-fraction-process .g230-frac .g230-box{min-width:9mm;height:7mm;border:1px solid #688c85;}
      .g230 .g230-note{font-size:.85em;color:#555;}
    `;
    document.head.append(el);
  }
  const plain = q => String(Number(q.answer));              // 곱을 보여 줄 때 끝의 0은 지운다(0.10 -> 0.1)
  function row(wrap, ...parts) {
    const div = node('div', 'g230-line');
    for (const part of parts) div.append(typeof part === 'string' ? document.createTextNode(part) : part);
    wrap.append(div); return div;
  }
  // 문제지에는 빈 칸(밑줄), 정답지에는 빨간 답. 문제로 인쇄된 값은 이 함수를 쓰지 않는다.
  function blank(show, value) { return node('span', 'g230-box' + (show ? ' g230-ans' : ''), show ? String(value) : ' '); }
  function fracPart(top, bottom) { // 분자·분모 자리에 글자도 빈칸 노드도 넣을 수 있다
    const f = node('span', 'g230-frac'), t = node('span'), b = node('span');
    [[t, top], [b, bottom]].forEach(([el, v]) => el.append(typeof v === 'string' ? document.createTextNode(v) : v));
    f.append(t, b); return f;
  }
  const expression = q => q.a + ' × ' + q.b;
  const den = q => String(10 ** q.dp);
  function renderSteps(cell, q, show, config) {
    style(); const wrap = node('div', 'g230');
    const c = config.concept, steps = config.form === 'steps';
    if (c === 1) wrap.classList.add('g230-fraction-process');
    row(wrap, expression(q)).classList.add('g230-head');
    if (c === 0) {
      if (steps) {
        row(wrap, '= (' + q.A + ' × ' + q.B + ') ÷ ' + den(q));
        row(wrap, '= ', blank(show, q.raw), ' ÷ ' + den(q) + ' = ', blank(show, plain(q)));
      } else {
        row(wrap, '= (' + q.A + ' × ' + q.B + ') ÷ ', blank(show, den(q)));
        row(wrap, '= ', blank(show, plain(q)));
      }
    } else {
      row(wrap, '= ', fracPart(String(q.A), String(10 ** q.da)), ' × ', fracPart(String(q.B), String(10 ** q.db)),
        ' = ', steps ? fracPart(blank(show, q.raw), den(q)) : fracPart(String(q.raw), blank(show, den(q))),
        ' = ', blank(show, plain(q)));
    }
    cell.append(wrap);
  }
  // 선 잇기: 공용 matching-lines 서식(2단 compact, 세트당 4쌍). 제자리 짝이 없는 순서로 섞는다.
  function rngOf(seed) { let x = (Number(seed) >>> 0) || 1; return () => ((x = (Math.imul(x ^ (x >>> 15), 2246822519) + 374761393) >>> 0) / 4294967296); }
  function derange(n, r) {
    for (let t = 0; t < 80; t++) {
      const o = [...Array(n).keys()].map(i => [r(), i]).sort((p, q) => p[0] - q[0]).map(p => p[1]);
      if (o.every((x, i) => x !== i)) return o;
    }
    return [...Array(n).keys()].map(i => (i + 1) % n);
  }
  const mm = t => { let w = 0; for (const ch of String(t)) w += /[0-9]/.test(ch) ? 2.7 : ch === ' ' ? 1.3 : 3.1; return w; };
  function matchingBuild(config) {
    const g = config.gen, bn = g.bundles, pb = g.perBundle, r = rngOf(config.seed);
    const rows = collect({ ...config, count: bn * pb });
    const concept1 = config.concept === 1;
    const rightOf = q => concept1
      ? { html: '<span class="mt-frac"><span>' + q.A + '</span><span>' + 10 ** q.da + '</span></span> × <span class="mt-frac"><span>' + q.B + '</span><span>' + 10 ** q.db + '</span></span>' }
      : '(' + q.A + ' × ' + q.B + ') ÷ ' + 10 ** q.dp;
    const wl = Math.ceil(Math.max(...rows.map(q => mm(expression(q))))) + 2;
    const wr = Math.ceil(Math.max(...rows.map(q => concept1
      ? mm(q.A + ' × ' + q.B) + 3 : mm('(' + q.A + ' × ' + q.B + ') ÷ ' + 10 ** q.dp)))) + 2;
    const items = [];
    for (let b = 0; b < bn; b++) {
      const chunk = rows.slice(b * pb, b * pb + pb);
      items.push({ kind: 'bundle', compact: true, compactWl: wl, compactWr: wr, compactGap: 4, caption: '',
        pairs: chunk.map(q => [expression(q), rightOf(q)]), order: derange(pb, r), rowsWeight: pb });
    }
    return { items, layout: { cols: bn, rows: pb, count: bn * pb }, pairs: bn * pb };
  }
  if (root.MatchingSheet && root.MatchingSheet.formats['matching-lines']) {
    root.MatchingSheet.formats['g230-match'] = { page: 'blocks', title: '같은 계산 연결하기',
      render: (config, item, isAnswer) => root.MatchingSheet.formats['matching-lines'].render(config, item, isAnswer),
      build: matchingBuild };
  }
  function renderPlaceTable(cell, q, show) {
    style(); const wrap = node('div', 'g230');
    row(wrap, expression(q) + ' = ' + q.A + ' × ' + q.B + '의 소수점 놓기').classList.add('g230-head');
    const table = node('table', 'g230-table');
    const headings = ['첫째 수 자리', '둘째 수 자리', '자리 합', '자연수 곱', '곱의 소수'];
    const values = [q.da, q.db, q.dp, q.raw, q.answer];
    const head = node('tr'), body = node('tr');
    headings.forEach((h, i) => {
      head.append(node('th', '', h));
      const td = node('td');
      if (i === 3) td.textContent = values[i]; else td.append(blank(show, values[i]));
      body.append(td);
    });
    table.append(head, body); wrap.append(table);
    row(wrap, '확인: ', blank(show, q.answer));
    cell.append(wrap);
  }
  function renderPoint(cell, q, show) {
    style(); const wrap = node('div', 'g230');
    row(wrap, expression(q) + ' → ' + q.A + ' × ' + q.B + ' = ' + q.raw);
    row(wrap, '소수점 아래 숫자 개수 ' + q.da + ' + ' + q.db + ' = ', blank(show, q.dp), '개');
    row(wrap, '곱: ', blank(show, q.answer));
    cell.append(wrap);
  }
  function wrongOf(q, index) {
    const right = Number(q.answer);
    const options = [
      { label: '소수 자릿수를 하나 적게 셈', value: fixed(q.raw, q.dp - 1) },
      { label: '소수 자릿수를 하나 많게 셈', value: fixed(q.raw, q.dp + 1) }
    ];
    if (q.raw < 10 ** q.dp) options.push({ label: '1보다 작은 곱의 앞자리 0을 빠뜨림', value: q.answer.slice(1) });
    if (q.raw % 10 === 0) options.push({ label: '자연수 곱의 끝 0을 먼저 지움', value: fixed(q.raw / 10, q.dp) });
    const distinct = options.filter(x => x.value !== q.answer && (x.value[0] === '.' || Number(x.value) !== right));
    return distinct[index % distinct.length];
  }
  function renderError(cell, q, show) {
    style(); const wrap = node('div', 'g230');
    const wrong = q.wrong;
    row(wrap, expression(q) + ' = ' + wrong.value).classList.add('g230-head');
    row(wrap, q.A + ' × ' + q.B + ' = ' + q.raw + '  /  소수 ' + q.dp + '자리');
    row(wrap, '바르게: ', blank(show, plain(q)));
    if (!show) wrap.append(node('div', 'g230-work'));
    cell.append(wrap);
  }
  const formats = {
    'g230-steps': renderSteps, 'g230-place-table': renderPlaceTable, 'g230-point': renderPoint, 'g230-error-correction': renderError
  };
  Object.keys(formats).forEach(key => root.Sheet.register(key, formats[key]));
  const original = root.SheetGen.generate;
  root.SheetGen.generate = function (config) {
    if (config?.gen?.bundle !== BUNDLE) return original.apply(this, arguments);
    const rows = collect(config);
    if (config.form === 'error') {
      // 오류 종류는 문항 번호로 결정한다. 렌더러가 문제/정답을 두 번 호출해도 동일하다.
      return rows.map((q, i) => ({ ...q, wrong: wrongOf(q, i) }));
    }
    return rows;
  };
  const concepts = [
    { id: '2-3-0-0', short: '자연수 곱과 연결', name: '소수의 곱을 자연수의 곱과 연결하기' },
    { id: '2-3-0-1', short: '분수로 바꾼 소수 곱', name: '분수로 바꾸어 소수의 곱 이해하기' },
    { id: '2-3-0-2', short: '곱의 소수점 위치', name: '곱의 소수점 위치 정하기' }
  ];
  const forms = [
    { key: 't1', form: 'equation', format: 'g230-steps', cols: 2, rows: 10, fontPt: 13, instruction: '소수의 곱을 바꾼 식의 □를 채우세요.' },
    { key: 't2', form: 'match', format: 'g230-match', cols: 8, rows: 4, fontPt: 11, instruction: '같은 계산을 나타내는 식끼리 선으로 이으세요.' },
    { key: 't3', form: 'steps', format: 'g230-steps', cols: 2, rows: 10, fontPt: 13, instruction: '변환 과정의 □에 알맞은 수를 쓰세요.' }
  ];
  const last = [
    { key: 't1', form: 'table', format: 'g230-place-table', cols: 1, rows: 4, fontPt: 12, instruction: '자리표를 살펴보고 빈칸을 채우세요.' },
    { key: 't2', form: 'point', format: 'g230-point', cols: 2, rows: 10, fontPt: 11, instruction: '소수점 위치와 빈자리를 채우세요.' },
    { key: 't3', form: 'error', format: 'g230-error-correction', cols: 3, rows: 5, fontPt: 13, instruction: '잘못된 소수점 위치를 바르게 고쳐 쓰세요.' }
  ];
  concepts.forEach((concept, ci) => (ci === 2 ? last : forms).forEach((f, fi) => {
    const typeId = concept.id + '-' + f.key;
    if (typeId === '2-3-0-2-t1') return;
    // 분수로 바꾼 곱(ci 1)은 한 칸에 분수 두 줄이 들어가 칸을 키운다.
    const rows = ci === 1 && f.form !== 'match' ? 8 : f.rows, fontPt = ci === 1 && f.form !== 'match' ? 11 : f.fontPt;
    root.SheetCatalog.push({
      typeId, title: concept.short + ' · ' + (ci === 2 ? ['자리표', '빈자리', '고치기'][fi] : ['식 완성', '선 잇기', '빈칸'][fi]),
      instruction: f.instruction, format: f.format, cols: f.cols, rows,
      count: f.cols * rows, maxProblems: f.cols * rows, fontPt, autoFit: false, seed: 20261002 + ci * 10 + fi,
      concept: ci, form: f.form, gen: { bundle: BUNDLE, sources: SOURCES, conceptName: concept.name,
        ...(f.form === 'match' ? { bundles: f.cols, perBundle: f.rows } : {}) }
    });
  }));
})(globalThis);
