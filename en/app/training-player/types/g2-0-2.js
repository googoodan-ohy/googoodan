/* 묶음 2-0-2: 소수 계산 준비 · 반올림 · 결과 어림.
   수의 출처는 기존 Worksheets 생성기이며 이 파일은 선별, 표현, 검산만 담당한다. */
(function (root) {
  'use strict';
  const catalog = root.SheetCatalog, sheet = root.Sheet, bridge = root.SheetGen;
  if (!catalog || !sheet || !bridge || !root.Worksheets) return;
  const original = bridge.generate;
  const node = (tag, className, value) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (value !== undefined) el.textContent = String(value);
    return el;
  };
  const sources = ['decimal-add-1dp-2dp', 'decimal-sub-1dp-2dp', 'decimal-add-2dp-1dp', 'decimal-sub-2dp-1dp'];
  const arithmetic = ['decimal-add-1', 'decimal-sub-1', 'decimal-mul-1', 'decimal-div-1',
    'decimal-add-2', 'decimal-sub-2', 'decimal-mul-2', 'decimal-div-2'];
  const places = value => (String(value).split('.')[1] || '').length;
  const fixed = (value, dp) => Number(value).toFixed(dp);
  const round = (value, dp) => {
    const unit = 10 ** dp;
    return (Math.floor(Number(value) * unit + 0.50000001) / unit).toFixed(dp);
  };
  function style() {
    if (document.getElementById('g202-style')) return;
    const el = node('style'); el.id = 'g202-style';
    el.textContent = `
      .g202{width:100%;height:100%;box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1.2mm;
        font-size:1em;line-height:1.3;white-space:nowrap;text-align:center}
      .g202-rounding-compact{font-size:10pt!important}
      .g202-rounding-compact .g202-row{gap:1mm}
      .g202-estimate-compact{font-size:10pt!important;gap:2mm;white-space:normal}
      .g202-estimate-compact .g202-row{gap:1mm}
      .g202-estimate-compact .estimate-write{min-width:11mm}
      .g202-estimate-compact .compare-write{min-width:6mm}
      .g202-row{display:flex;align-items:center;justify-content:center;gap:1.6mm;white-space:nowrap}
      .g202 .write{display:inline-block;min-width:16mm;border-bottom:1px solid #555;text-align:center}
      .g202 .answer{display:inline-block;min-width:16mm;border-bottom:1px solid #555;text-align:center;font-weight:700}
      .g202 .small{font-size:.75em;color:#444;white-space:normal;max-width:90%}
      .g202 .hide{visibility:hidden}
      .g202-table{border-collapse:collapse;font-size:.95em;table-layout:fixed;width:92%}
      .g202-table td,.g202-table th{border:1px solid #888;text-align:center;padding:.4mm}
      .g202-table th{font-weight:400;background:#f3f3f3;font-size:.8em;padding:.4mm 0}
      .g202-choices{display:flex;gap:4mm;justify-content:center;white-space:nowrap}
      .g202 .mark-answer{display:inline-block;border:1.5px solid #d71f10;border-radius:50%;color:#111 !important;font-weight:400 !important;min-width:1.15em;text-align:center;line-height:1.15}
      .g202 .mark-plain{display:inline;line-height:1.15}
      .g202 .estimate-write{min-width:14mm}.g202 .compare-write{min-width:8mm}`;
    document.head.append(el);
  }
  function row(...children) { const r = node('div', 'g202-row'); r.append(...children); return r; }
  function blank(value, answer, extra) {
    return node('span', (answer ? 'answer' : 'write') + (extra ? ' ' + extra : ''), answer ? value : ' ');
  }
  function render(cell, q, answer, config) {
    style();
    const kind = config.kind, wrap = node('div', 'g202');
    if (kind === 'round' || kind === 'mark') wrap.classList.add('g202-rounding-compact');
    if (kind === 'estimate') wrap.classList.add('g202-estimate-compact');
    if (kind === 'align-table') {
      wrap.append(node('div', '', q.a + ' ' + q.op + ' ' + q.b));
      const table = node('table', 'g202-table'), head = node('tr');
      ['수', '십', '일', '.', '첫째', '둘째'].forEach(x => head.append(node('th', '', x)));
      table.append(head);
      [q.a, q.b].forEach((value, i) => {
        const r = node('tr'), parts = fixed(value, 2).split('.');
        const cells = [i ? '②' : '①', parts[0].padStart(2, ' ').charAt(0), parts[0].slice(-1), '.', ...parts[1]];
        cells.forEach((v, j) => r.append(node('td', '', j >= 4 && !answer && places(value) === 1 && j === 5 ? '□' : v)));
        table.append(r);
      });
      wrap.append(table); cell.append(wrap); return;
    }
    if (kind === 'align-blank') {
      wrap.append(row(node('span', '', q.a + ' ' + q.op + ' ' + q.b + ' → ' + q.short + ' ='), blank(q.long, answer)));
      cell.append(wrap); return;
    }
    if (kind === 'round') {
      wrap.append(row(node('span', '', q.value + ' → ' + q.target + '까지:'), blank(q.correct, answer)));
      cell.append(wrap); return;
    }
    if (kind === 'mark') {
      const r = node('div', 'g202-row'), digits = node('span', '');
      r.append(node('span', '', q.target + '까지: '));
      [...q.value].forEach((digit, i) => digits.append(node('span', answer && i === q.value.length - 1 ? 'mark-answer' : 'mark-plain', digit)));
      r.append(digits); wrap.append(r); cell.append(wrap); return;
    }
    if (kind === 'range') {
      const ch = node('div', 'g202-choices'); q.options.forEach((v, i) => ch.append(node('span', '', '①②③'[i] + ' ' + v)));
      wrap.append(row(node('span', '', q.a + ' ' + q.op + ' ' + q.b + ' = ?   답'), blank(q.choice, answer, 'compare-write')), ch);
      cell.append(wrap); return;
    }
    if (kind === 'estimate') {
      wrap.append(node('div', '', q.a + ' ' + q.op + ' ' + q.b + '을 어림하면 ' + q.estimate + '입니다.'));
      wrap.append(row(node('span', '', '실제값'), blank(q.correct, answer, 'estimate-write'), blank(q.comparison, answer, 'compare-write'), node('span', '', '어림한 값 ' + q.estimate)));
      cell.append(wrap); return;
    }
    if (kind === 'align-fix' || kind === 'round-fix' || kind === 'estimate-fix') {
      wrap.append(node('div', '', q.question));
      if (kind === 'estimate-fix') wrap.append(node('div', '', '어림값 ≈ ' + q.estimate));
      wrap.append(node('div', '', '잘못 쓴 값: ' + q.wrong));
      wrap.append(row(node('span', '', '바르게 고치기:'), blank(q.correct, answer)));
      cell.append(wrap);
    }
  }
  const formats = ['align-table', 'align-blank', 'align-fix', 'round', 'mark', 'round-fix', 'range', 'estimate', 'estimate-fix'];
  formats.forEach(kind => sheet.register('g202-' + kind, render));

  function valid(q) {
    const a = Number(q.a), b = Number(q.b), v = Number(q.answer);
    if (![a, b, v].every(Number.isFinite) || a < 0 || b <= 0 || v < 0) return false;
    const expected = q.op === '+' ? a + b : q.op === '−' ? a - b : q.op === '×' ? a * b : a / b;
    return Math.abs(expected - v) < 0.000001;
  }
  function candidates(config, accept, desired) {
    const seen = new Set(), rows = [];
    const list = config.kind.startsWith('align') ? sources : arithmetic;
    const seed = Number(config.seed) >>> 0;
    for (let batch = 0; batch < 1200 && rows.length < desired; batch++) {
      const source = list[batch % list.length];
      const drawn = root.Worksheets.generate(source, (seed + Math.imul(batch + 1, 104729)) >>> 0, 16);
      for (const q of drawn) {
        if (!valid(q) || !accept(q)) continue;
        const key = [q.a, q.op, q.b].join('|');
        if (seen.has(key)) continue;
        seen.add(key); rows.push(q);
        if (rows.length === desired) break;
      }
    }
    if (rows.length !== desired) throw Error(config.typeId + ': 조건에 맞는 문항 ' + desired + '개 중 ' + rows.length + '개');
    return rows;
  }
  function make(config) {
    const count = config.count, kind = config.kind;
    let rows;
    if (kind.startsWith('align')) {
      rows = candidates(config, q => (q.op === '+' || q.op === '−') && (kind !== 'align-fix' || Number(q.answer) !== 0), count);
      rows = rows.map((q, i) => {
        const short = places(q.a) === 1 ? q.a : q.b;
        const aligned = fixed(short, 2);
        if (kind === 'align-fix') return { ...q, question: q.a + ' ' + q.op + ' ' + q.b + ' = ?', wrong: fixed(Number(q.answer) * 10, 2), correct: q.answer, reason: '소수점을 맞추고 빈자리에 0을 채웁니다.' };
        return { ...q, short, long: aligned, number: i };
      });
    } else if (kind === 'round' || kind === 'mark' || kind === 'round-fix') {
      // 첫째·둘째·셋째 자리의 원수는 각각 기존 소수 덧셈과 곱셈 문항에서 얻는다.
      // 같은 수가 다른 식에 등장해도 반올림 문제는 한 번만 쓴다.
      const seen = new Set(); rows = [];
      const seed = Number(config.seed) >>> 0;
      const roundSources = ['decimal-add-1', 'decimal-add-2', 'decimal-mul-2'];
      for (let batch = 0; batch < 1200 && rows.length < count; batch++) {
        const dp = rows.length % 3, source = roundSources[dp];
        const drawn = root.Worksheets.generate(source, (seed + Math.imul(batch + 1, 104729)) >>> 0, 16);
        for (const q of drawn) {
          const value = dp === 2 ? String(q.answer) : String(q.a);
          if (!valid(q) || places(value) !== dp + 1 || Number(value) <= 1 || seen.has(value)) continue;
          seen.add(value); rows.push({ value, dp }); break;
        }
      }
      if (rows.length !== count) throw Error(config.typeId + ': 반올림 문항 부족');
      rows = rows.map(({ value, dp }) => {
        const target = ['일의 자리', '소수 첫째 자리', '소수 둘째 자리'][dp];
        const nextPlace = ['소수 첫째', '소수 둘째', '소수 셋째'][dp];
        const digit = value.replace('.', '')[value.split('.')[0].length + dp];
        const correct = round(value, dp), wrong = (Math.trunc(Number(value) * 10 ** dp) / 10 ** dp).toFixed(dp);
        return { value, target, nextPlace, digit, correct,
          question: value + ' → ' + target + '까지 반올림', wrong: wrong === correct ? fixed(Number(correct) + 1 / 10 ** dp, dp) : wrong,
          reason: '버릴 첫 자리의 숫자가 5 이상이면 올리고, 4 이하이면 버립니다.' };
      });
    } else {
      rows = candidates(config, q => places(q.a) >= 1 && places(q.b) >= 1 && Number(q.answer) > 0 && Number(q.answer) < 100 && (q.op !== '÷' || Number(q.b) >= 1), count);
      rows = rows.map((q, index) => {
        const actual = Number(q.answer), lower = Math.floor(actual / 5) * 5;
        const choices = [0, 1, 2].map(i => `${lower + 5 * i}~${(lower + 5 * i + 4.99).toFixed(2)}`);
        const shift = index % 3, options = choices.slice(shift).concat(choices.slice(0, shift));
        const ea = Math.round(Number(q.a)), eb = Math.round(Number(q.b));
        const estimate = q.op === '+' ? ea + eb : q.op === '−' ? ea - eb : q.op === '×' ? ea * eb : eb ? Math.round(ea / eb) : '—';
        return { ...q, options, choice: '①②③'[(3 - shift) % 3], estimate, correct: q.answer,
          comparison: actual > estimate ? '>' : actual < estimate ? '<' : '=',
          question: q.a + ' ' + q.op + ' ' + q.b + ' = ?', wrong: fixed(actual * 10, Math.min(2, places(q.answer))),
          reason: '먼저 결과의 크기를 어림해 소수점 위치를 확인합니다.' };
      });
    }
    rows.sort((a, b) => Number(a.value || a.a) - Number(b.value || b.a) || Number(a.b || 0) - Number(b.b || 0));
    return rows;
  }
  bridge.generate = function (config) {
    return config && /^g202-/.test(config.format) ? make(config) : original(config);
  };
  const definitions = [
    ['2-0-2-0-t1', '자리표로 계산 준비', 'align-table', 3, 8, '자리표에서 소수점을 맞추고 빈자리를 채우세요.', 13],
    ['2-0-2-0-t2', '소수점·빈자리 채우기', 'align-blank', 2, 14, '자릿수가 적은 수의 빈자리에 0을 채워 소수 자리를 맞추세요.', 17],
    ['2-0-2-0-t3', '어긋난 식 고치기', 'align-fix', 2, 6, '잘못된 계산을 바르게 고쳐 쓰세요.', 14],
    ['2-0-2-1-t1', '소수 반올림하기', 'round', 2, 13, '지정한 자리까지 반올림하여 쓰세요.', 10],
    ['2-0-2-1-t2', '반올림할 자리 찾기', 'mark', 2, 15, '반올림할 때 살펴볼 자리의 숫자에 동그라미 하세요.', 10],
    ['2-0-2-1-t3', '반올림 오류 고치기', 'round-fix', 2, 6, '잘못 반올림한 값을 바르게 고쳐 쓰세요.', 14],
    ['2-0-2-2-t1', '계산 결과 범위 고르기', 'range', 2, 14, '계산하기 전에 결과가 들어갈 범위를 고르세요.', 13],
    ['2-0-2-2-t2', '어림값과 실제값 비교', 'estimate', 2, 13, '각 수를 일의 자리까지 반올림해 어림한 값과 실제값을 비교해 >, <, =를 쓰세요.', 15],
    ['2-0-2-2-t3', '결과 자릿수 고치기', 'estimate-fix', 2, 6, '어림값을 보고 자릿수가 어긋난 결과를 고치세요.', 14]
  ];
  const have = new Set(catalog.map(x => x.typeId));
  definitions.forEach(([typeId, title, kind, cols, rows, instruction, fontPt]) => {
    if (have.has(typeId)) return;
    catalog.push({ typeId, title, instruction, format: 'g202-' + kind, kind,
      cols, rows, count: cols * rows, fontPt, maxProblems: cols * rows,
      seed: 20261002, autoFit: false, gen: { legacyId: kind.startsWith('align') ? sources[0] : arithmetic[0] } });
  });
})(globalThis);
