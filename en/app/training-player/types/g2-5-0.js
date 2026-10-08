/* 묶음 2-5-0: 기존 Worksheets 문제를 조건별로 골라 만든 소수 사칙 종합 문제지. */
(function (root) {
  'use strict';
  const BUNDLE = '2-5-0-';
  const OP = { add: '+', sub: '−', mul: '×', div: '÷' };
  const source = code => [1, 2].flatMap(p => [
    `decimal-${code}-${p}`, `decimal-${code}-${p}dp-0dp`,
    `decimal-${code}-0dp-${p}dp`, `decimal-${code}-1dp-2dp`,
    `decimal-${code}-2dp-1dp`
  ]);
  const places = s => (String(s).split('.')[1] || '').length;
  const number = x => Number(x);
  const fmt = x => String(Number(Number(x).toFixed(4)));
  const box = (value, show) => {
    const el = document.createElement('span'); el.className = 'g250-box' + (show ? ' g250-ans' : '');
    el.textContent = show ? String(value) : '\u00a0'; return el;
  };
  const line = (cell, text) => { const el = document.createElement('div'); el.className = 'g250-line'; el.textContent = text; cell.append(el); return el; };
  if (!document.getElementById('g250-style')) {
    const style = document.createElement('style'); style.id = 'g250-style';
    style.textContent = '.g250-line{line-height:1.3;white-space:nowrap;text-align:center}.g250-box{display:inline-flex;align-items:center;justify-content:center;min-width:12mm;height:7mm;padding:0 .5mm;box-sizing:border-box;text-align:center;border:1px solid #688c85;border-radius:0;line-height:1.25;vertical-align:middle}.g250-check-box{min-width:29mm;height:8mm}.g250-ans{color:#d71f10;font-weight:700}.g250-head{font-weight:700}.g250-small{font-size:.8em;color:#444}.g250-fix{height:100%;display:flex;flex-direction:column;justify-content:space-around;align-items:center}.g250-fix .g250-box{min-width:3.2em}.g250-choice{display:inline-block;padding:0 .35em;border:1.5px solid transparent;border-radius:50%}.g250-circle{border-color:#d71f10;color:#d71f10;font-weight:700}';
    document.head.append(style);
  }
  const REG = [
    ['2-5-0-0', '소수 덧셈·뺄셈 혼합', ['add', 'sub']],
    ['2-5-0-1', '소수 곱셈·나눗셈 혼합', ['mul', 'div']],
    ['2-5-0-2', '계산 결과 크기·소수점', ['add', 'sub', 'mul', 'div']],
    ['2-5-0-3', '소수 사칙연산 빈칸', ['add', 'sub', 'mul', 'div']]
  ];
  const specs = {
    '0': [
      ['연산을 섞은 가로 계산', 'horizontal', 3, 13, '식을 계산하고 답을 쓰세요.'],
      ['빈칸 식으로 섞어 연습하기', 'g250-blank', 3, 13, '□ 안에 알맞은 수를 쓰세요.'],
      ['계산 오류 찾아 고치기', 'g250-error', 3, 5, '잘못된 계산을 바르게 고쳐 쓰세요.']
    ],
    '1': [
      ['연산을 섞은 가로 계산', 'horizontal', 3, 13, '식을 계산하고 답을 쓰세요.'],
      ['빈칸 식으로 섞어 연습하기', 'g250-blank', 3, 13, '□ 안에 알맞은 수를 쓰세요.'],
      ['계산 오류 찾아 고치기', 'g250-error', 3, 5, '잘못된 계산을 바르게 고쳐 쓰세요.']
    ],
    '2': [
      ['계산 전 결과의 범위 고르기', 'g250-range', 3, 10, '계산 결과가 들어갈 범위를 고르세요.'],
      ['어림값과 실제 계산값 비교하기', 'g250-estimate', 3, 13, '어림하고 실제 값을 계산하여 비교하세요.'],
      ['자릿수가 어긋난 결과 고치기', 'g250-error', 3, 5, '자릿값이 잘못된 답을 고쳐 쓰세요.']
    ],
    '3': [
      ['빈칸이 한 곳인 식 완성하기', 'g250-blank', 3, 13, '□ 안에 알맞은 수를 쓰세요.'],
      ['서로 연결된 두 식의 빈칸 채우기', 'g250-linked', 2, 9, '연결된 두 식의 빈칸을 채우세요.'],
      ['역연산으로 빈칸을 구하고 확인하기', 'g250-inverse', 3, 13, '역연산으로 □를 구하고 확인하세요.']
    ]
  };
  const shortTitles = [
    ['소수 덧뺄셈 · 가로 혼합', '소수 덧뺄셈 · 빈칸 혼합', '소수 덧뺄셈 · 오류 고치기'],
    ['소수 곱나눗셈 · 가로 혼합', '소수 곱나눗셈 · 빈칸 혼합', '소수 곱나눗셈 · 오류 고치기'],
    ['계산 결과 범위 고르기', '어림값·실제값 비교', '소수점·자릿값 고치기'],
    ['소수 사칙 · 한 칸 빈식', '소수 사칙 · 연결된 두 식', '소수 사칙 · 역연산 확인']
  ];
  const FONT = { horizontal: 18, 'g250-blank': 17, 'g250-error': 14, 'g250-range': 14, 'g250-estimate': 14, 'g250-linked': 14, 'g250-inverse': 15 };
  const TYPES = [];
  REG.forEach(([concept, label], i) => specs[String(i)].forEach(([title, format, cols, rows, instruction], j) => {
    TYPES.push({ typeId: `${concept}-t${j + 1}`, title: shortTitles[i][j], fullTitle: `${label} · ${title}`, instruction,
      format, cols, rows, count: cols * rows, fontPt: FONT[format] || 18, maxProblems: cols * rows,
      seed: 20261001, autoFit: false, gen: { ko250: true, concept, kind: j + 1 } });
  }));
  function valid(row, code, concept) {
    if (!row || row.op !== OP[code]) return false;
    const a = number(row.a), b = number(row.b), actual = number(row.answer);
    if (![a, b, actual].every(Number.isFinite) || a < 0 || b <= 0 || actual < 0) return false;
    const pa = places(row.a), pb = places(row.b);
    if (pa > 2 || pb > 2 || (concept === '2-5-0-0' && (pa < 1 || pb < 1))) return false;
    if (concept !== '2-5-0-0' && pa === 0 && pb === 0) return false;
    if (code === 'div' && places(row.answer) > 2) return false;
    const check = code === 'add' ? a + b : code === 'sub' ? a - b : code === 'mul' ? a * b : a / b;
    return Math.abs(check - actual) < 1e-8 && actual <= 999;
  }
  function questions(config) {
    const { concept, kind } = config.gen;
    const codes = REG.find(x => x[0] === concept)[2];
    const count = config.count;
    const buckets = new Map(codes.map(code => [code, []]));
    const seen = new Set();
    const target = Math.ceil(count / codes.length) + 8;
    for (let round = 0; round < 350 && codes.some(c => buckets.get(c).length < target); round++) {
      for (const code of codes) {
        if (buckets.get(code).length >= target) continue;
        const ids = source(code), id = ids[round % ids.length];
        const seed = (Number(config.seed) + Math.imul(round, 104729) + codes.indexOf(code) * 8191) >>> 0;
        const rows = root.Worksheets.generate(id, seed, 16);
        for (const row of rows) {
          const key = `${row.a}:${row.op}:${row.b}`;
          if (!valid(row, code, concept) || seen.has(key)) continue;
          if (concept === '2-5-0-1' && kind <= 2 && (number(row.a) === 1 || number(row.b) === 1)) continue;
          seen.add(key);
          buckets.get(code).push({ a: String(row.a), b: String(row.b), op: row.op,
            answer: fmt(row.answer), code });
        }
      }
    }
    const result = [];
    for (let n = 0; n < count; n++) {
      const code = codes[n % codes.length], bucket = buckets.get(code);
      if (!bucket.length) throw Error(`${config.typeId}: 기존 생성기에서 ${count}문항을 모으지 못했습니다.`);
      result.push(bucket.shift());
    }
    result.sort((x, y) => number(x.answer) - number(y.answer) || number(x.a) - number(y.a));
    return result.map((q, index) => decorate(q, concept, kind, index));
  }
  function decorate(q, concept, kind, index) {
    const item = { ...q }, a = number(q.a), b = number(q.b), ans = number(q.answer);
    if (concept === '2-5-0-2' && kind === 1) {
      const ranges = ['0~1미만', '1~10미만', '10~100미만', '100~1000미만'];
      item.range = ranges[ans < 1 ? 0 : ans < 10 ? 1 : ans < 100 ? 2 : 3];
      const at = ranges.indexOf(item.range);
      item.choices = [item.range, ranges[at === 3 ? 2 : at + 1]];
      if (index % 2) item.choices.reverse();
    }
    if (concept === '2-5-0-2' && kind === 2) {
      const nearA = q.op === '÷' ? Math.round(a * 10) / 10 : Math.round(a);
      const nearB = q.op === '÷' ? Math.max(.1, Math.round(b * 10) / 10) : Math.round(b);
      item.estimate = fmt(q.op === '+' ? nearA + nearB : q.op === '−' ? nearA - nearB :
        q.op === '×' ? nearA * nearB : nearA / nearB);
    }
    if ((concept === '2-5-0-0' || concept === '2-5-0-1') && kind === 2 || concept === '2-5-0-3' && (kind === 1 || kind === 3)) {
      item.mask = index % 3;
      if (q.op === '÷' && item.mask === 1) item.mask = 0;
    }
    if (concept === '2-5-0-3' && kind === 2) item.link = q.op === '+' ? `${q.answer} − □ = □` :
      q.op === '−' ? `${q.answer} + □ = □` : q.op === '×' ? `${q.answer} ÷ □ = □` : `${q.answer} × □ = □`;
    if (kind === 3 && concept !== '2-5-0-3') {
      item.wrong = fmt(ans * (index % 2 ? 10 : .1));
      if (number(item.wrong) === ans) item.wrong = fmt(ans + 1);
      item.reason = q.code === 'add' || q.code === 'sub' ? '소수점 위치 확인' :
        q.code === 'mul' ? '곱의 소수 자릿수 확인' : '몫의 크기 확인';
    }
    return item;
  }
  root.Sheet.register('g250-blank', (cell, q, answer) => {
    const el = document.createElement('div'); el.className = 'g250-line';
    [q.a, q.b, q.answer].forEach((part, i) => {
      if (i) el.append(document.createTextNode(i === 1 ? ` ${q.op} ` : ' = '));
      el.append(i === q.mask ? box(part, answer) : document.createTextNode(part));
    }); cell.append(el);
  });
  root.Sheet.register('g250-error', (cell, q, answer) => {
    const wrap = document.createElement('div'); wrap.className = 'g250-fix';
    line(wrap, `${q.a} ${q.op} ${q.b} = ${q.wrong}`);
    const note = line(wrap, `고친 답: `); note.append(box(q.answer, answer));
    cell.append(wrap);
  });
  root.Sheet.register('g250-range', (cell, q, answer) => {
    line(cell, `${q.a} ${q.op} ${q.b}`).classList.add('g250-head');
    q.choices.forEach((v, i) => {
      const row = line(cell, '');
      const c = document.createElement('span');
      c.className = 'g250-choice' + (answer && v === q.range ? ' g250-circle' : '');
      c.textContent = `${i + 1}  ${v}`; row.append(c);
    });
  });
  root.Sheet.register('g250-estimate', (cell, q, answer) => {
    line(cell, `${q.a} ${q.op} ${q.b}`);
    const el = line(cell, '어림: '); el.append(box(q.estimate, answer), document.createTextNode('  실제: '), box(q.answer, answer));
  });
  root.Sheet.register('g250-linked', (cell, q, answer) => {
    const op = q.op === '+' ? '−' : q.op === '−' ? '+' : q.op === '×' ? '÷' : '×';
    const first = line(cell, `${q.a} ${q.op} ${q.b} = `); first.append(box(q.answer, answer));
    const el = line(cell, ''); el.append(box(q.answer, answer), document.createTextNode(` ${op} ${q.b} = `), box(q.a, answer));
  });
  root.Sheet.register('g250-inverse', (cell, q, answer) => {
    const parts = [q.a, q.b, q.answer], el = line(cell, '');
    parts.forEach((p, i) => { if (i) el.append(document.createTextNode(i === 1 ? ` ${q.op} ` : ' = ')); el.append(i === q.mask ? box(p, answer) : document.createTextNode(p)); });
    const inverse = q.op === '+' ? `${q.answer} − ${q.b} = ${q.a}` : q.op === '−' ? `${q.answer} + ${q.b} = ${q.a}` :
      q.op === '×' ? `${q.answer} ÷ ${q.b} = ${q.a}` : `${q.answer} × ${q.b} = ${q.a}`;
    const check = line(cell, '확인: '); check.classList.add('g250-small');
    const checkBox = box(inverse, answer); checkBox.classList.add('g250-check-box'); check.append(checkBox);
  });
  const original = root.SheetGen.generate;
  root.SheetGen.generate = function (config) {
    return config?.gen?.ko250 ? questions(config) : original.apply(this, arguments);
  };
  TYPES.forEach(t => { if (!root.SheetCatalog.some(x => x.typeId === t.typeId)) root.SheetCatalog.push(t); });
  root.Ko250 = { types: TYPES, questions, valid };
})(globalThis);
