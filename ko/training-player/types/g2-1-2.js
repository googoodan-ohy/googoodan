/* 묶음 2-1-2: 서로 다른 소수 자릿수와 세 수의 덧셈. */
(function (root) {
  'use strict';
  const BUNDLE = '2-1-2';
  const make = (tag, cls, value) => {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (value !== undefined) el.textContent = value;
    return el;
  };
  const concepts = [
    { id: '2-1-2-0', name: '자연수 + 소수', places: [0, 1], source: 'decimal-add-0dp-1dp' },
    { id: '2-1-2-1', name: '소수 첫째 자리 + 소수 둘째 자리', places: [1, 2], source: 'decimal-add-1dp-2dp' },
    { id: '2-1-2-2', name: '소수 둘째 자리 + 소수 셋째 자리', places: [2, 3], source: 'g212-add-2dp-3dp' },
    { id: '2-1-2-3', name: '소수 세 수의 덧셈', places: [1, 2, 2], source: 'decimal-add-1dp-2dp' }
  ];
  // size(개념 번호별): [단, 줄, 글자 pt]. 칸을 채우도록 글자를 키우고 문항 수는 40(소수 셋째 자리 포함은 30) 이하로 둔다.
  const forms = [
    { suffix: 't1', kind: 'horizontal', label: '가로셈', instruction: '식을 계산하고 답을 쓰세요.',
      size: [[3, 13, 16], [3, 13, 16], [2, 15, 17], [2, 15, 15]] },
    { suffix: 't2', kind: 'vertical', label: '세로셈', instruction: '소수점을 맞추어 세로로 계산하고 답을 쓰세요.',
      size: [[5, 8, 15], [5, 8, 15], [5, 6, 15], [5, 6, 15]] },
    { suffix: 't3', kind: 'blank', label: '세로 풀이 빈칸', instruction: '계산 과정을 살펴보고 □ 안에 알맞은 수를 쓰세요.',
      size: [[5, 8, 15], [5, 8, 15], [5, 6, 15], [5, 6, 15]] },
    { suffix: 't4', kind: 'correction', label: '잘못된 풀이 고치기', instruction: '잘못된 곳을 찾아 바르게 고쳐 쓰세요.',
      size: [[2, 6, 17], [2, 6, 17], [2, 6, 17], [2, 6, 17]] }
  ];
  const entries = concepts.flatMap((concept, ci) => forms.map((form, fi) => {
    const [cols, rows, fontPt] = form.size[ci];
    return {
      typeId: concept.id + '-' + form.suffix,
      title: concept.name + '·' + form.label,
      instruction: form.instruction,
      format: 'g212-' + form.kind,
      cols, rows, count: cols * rows, fontPt, autoFit: false, maxProblems: cols * rows,
      seed: 20261002 + ci * 10 + fi,
      gen: { bundle: BUNDLE, concept: ci, kind: form.kind }
    };
  }));

  // 사이트의 기존 소수 문제 생성기를 그대로 호출한다. 두 자리 + 세 자리만
  // 기존 drill-engine의 decimalPlaces 설정을 사용한다.
  if (root.DrillCatalog?.profiles instanceof Map && !root.DrillCatalog.profiles.has('g212-add-2dp-3dp')) {
    root.DrillCatalog.profiles.set('g212-add-2dp-3dp', {
      id: 'g212-add-2dp-3dp', source: 'decimal-add-1dp-2dp', title: '소수 둘째 자리 + 셋째 자리',
      group: '기본 연산', mode: 'basic', layout: 'horizontal', decimalPlaces: [2, 3], code: 'add'
    });
  }
  function scaled(value, places) {
    const m = /^(\d+)(?:\.(\d+))?$/.exec(String(value));
    if (!m) return null;
    const fraction = m[2] || '';
    if (fraction.length !== places || (places && fraction.endsWith('0'))) return null;
    return Number(m[1]) * 10 ** places + Number(fraction.padEnd(places, '0') || 0);
  }
  function fixed(value, places) {
    if (!places) return String(value);
    const s = String(value).padStart(places + 1, '0');
    return s.slice(0, -places) + '.' + s.slice(-places);
  }
  function carryCount(values) {
    let carry = 0, count = 0, xs = values.slice();
    while (xs.some(Boolean) || carry) {
      const total = xs.reduce((n, x) => n + x % 10, carry);
      carry = Math.floor(total / 10);
      if (carry) count++;
      xs = xs.map(x => Math.floor(x / 10));
    }
    return count;
  }
  function build(config) {
    const concept = concepts[config.gen.concept], places = concept.places;
    const scale = Math.max(...places), count = config.count;
    const out = [], seen = new Set();
    const seed = Number(config.seed) || 1;
    for (let batch = 0; batch < 1800 && out.length < count; batch++) {
      const rows = root.Worksheets.generate(concept.source, (seed + Math.imul(batch, 104729)) >>> 0, 32);
      const extra = places.length === 3
        ? root.Worksheets.generate('decimal-add-2', (seed + Math.imul(batch + 17, 65537)) >>> 0, 32)
        : null;
      rows.forEach((row, index) => {
        if (out.length >= count || row.op !== '+') return;
        const raw = places.length === 3 ? [row.a, row.b, extra[index]?.b] : [row.a, row.b];
        if (raw.some(v => v == null)) return;
        const values = raw.map((v, i) => scaled(v, places[i]));
        if (values.some((v, i) => v == null || v < (i === 0 && places[i] === 0 ? 1 : 10 ** Math.max(0, places[i] - 1)) || (i === 0 && places[i] === 0 && v > 99))) return;
        const units = values.map((v, i) => v * 10 ** (scale - places[i]));
        const sum = units.reduce((a, b) => a + b, 0);
        if (concept.id === '2-1-2-3' && sum > 29997) return;
        if (Math.round(Number(row.answer) * 10 ** scale) !== units[0] + units[1]) return;
        const key = concept.id + ':' + (places.length === 3 ? [raw[0], ...raw.slice(1).sort()].join(':') : raw.join(':'));
        if (seen.has(key)) return;
        seen.add(key);
        out.push({ a: String(raw[0]), b: String(raw[1]), c: raw[2] == null ? null : String(raw[2]),
          op: '+', answer: fixed(sum, scale), units, sum, carries: carryCount(units) });
      });
    }
    if (out.length !== count) throw Error(config.typeId + ': 고유 문항 ' + count + '개 중 ' + out.length + '개만 생성했습니다.');
    out.sort((a, b) => a.carries - b.carries || a.sum - b.sum || a.a.localeCompare(b.a));
    const whole = Math.max(2, ...out.map(q => String(Math.floor(q.sum / 10 ** scale)).length));
    config.stack = { whole, fraction: scale };
    out.forEach((q, i) => {
      const digits = q.answer.replace('.', '');
      q.blankIndex = (i * 7 + 1) % digits.length;
      // 실제 덧셈 결과에서 한 자릿값을 빼어, 뚜렷이 잘못된 결과를 제시한다.
      const power = i % (scale + 1);
      const delta = 10 ** power;
      q.wrong = fixed(q.sum > delta ? q.sum - delta : q.sum + delta, scale);
      q.wrongNote = power >= scale ? '일의 자리 계산이 틀림' : '소수 ' + ['첫째', '둘째', '셋째'][scale - power - 1] + ' 자리 계산이 틀림';
    });
    return out;
  }
  function style() {
    if (document.getElementById('g212-style')) return;
    const el = make('style'); el.id = 'g212-style';
    el.textContent = `
      .g212-stack{width:max-content;max-width:100%;margin:auto;font-variant-numeric:tabular-nums}
      .g212-row{display:grid;grid-template-columns:.8em repeat(var(--whole),.82em) .4em repeat(var(--fraction),.82em);min-height:1.18em;text-align:center;align-items:center}
      .g212-row>span{min-width:0}.g212-carry{height:.7em;min-height:.7em}
      .g212-carry span:not(:first-child){border:1px solid #ddd;height:.65em}
      .g212-rule{border-top:1px solid #222}.g212-answer{color:#d71f10;font-weight:700}.g212-blank{background:#eee;border:1px dashed #777}
      .g212-fix{display:flex;gap:1.5mm;height:100%;align-items:flex-start}.g212-fix .g212-stack{margin:0}
      .g212-write{flex:1;border-left:1px dashed #bbb;min-height:85%;padding-left:1mm}
      .g212-note{position:absolute;left:5mm;bottom:.5mm;font-size:.7em;color:#333}
      .sheet-page:has(.g212-mark) .sheet-head{gap:2mm}.sheet-page:has(.g212-mark) .sheet-field{font-size:9pt}
      .sheet-page:has(.g212-mark) .answer-space{min-width:14mm}
    `;
    document.head.append(el);
  }
  function row(value, config, sign, cls, blankIndex, ansIndex) {
    const { whole, fraction } = config.stack;
    const line = make('div', 'g212-row ' + (cls || ''));
    line.append(make('span', '', sign || ''));
    const [integer = '', decimal = ''] = String(value ?? '').split('.');
    const left = integer.padStart(whole, ' '), right = decimal.padEnd(fraction, ' ');
    let digitIndex = 0;
    for (let i = 0; i < whole; i++) {
      const ch = left[i], here = ch !== ' ' ? digitIndex++ : -1, blank = here >= 0 && here === blankIndex;
      line.append(make('span', blank ? 'g212-blank' : here >= 0 && here === ansIndex ? 'g212-answer' : '', blank ? '□' : ch === ' ' ? '\u00a0' : ch));
    }
    line.append(make('span', '', decimal ? '.' : '\u00a0'));
    for (let i = 0; i < fraction; i++) {
      const ch = right[i], here = ch !== ' ' ? digitIndex++ : -1, blank = here >= 0 && here === blankIndex;
      line.append(make('span', blank ? 'g212-blank' : here >= 0 && here === ansIndex ? 'g212-answer' : '', blank ? '□' : ch === ' ' ? '\u00a0' : ch));
    }
    return line;
  }
  function stack(q, config, result, blankIndex, answerColor, ansIndex) {
    const el = make('div', 'g212-stack g212-mark');
    el.style.setProperty('--whole', config.stack.whole);
    el.style.setProperty('--fraction', config.stack.fraction);
    el.append(row(q.a, config, ''), row(q.b, config, '+'));
    if (q.c != null) el.append(row(q.c, config, '+'));
    el.append(row(result, config, '', 'g212-rule' + (answerColor ? ' g212-answer' : ''), blankIndex, ansIndex));
    return el;
  }
  function render(cell, q, answer, config) {
    style();
    const kind = config.gen.kind;
    if (kind === 'horizontal') {
      const line = make('div', 'horizontal g212-mark');
      line.append(make('span', '', [q.a, q.b, q.c].filter(v => v != null).join(' + ') + ' = '));
      line.append(make('span', 'answer-space', answer ? q.answer : '\u00a0'));
      cell.append(line);
    } else if (kind === 'correction') {
      const wrap = make('div', 'g212-fix g212-mark');
      wrap.append(stack(q, config, q.wrong));
      const right = make('div', 'g212-write');
      right.append(stack(q, config, answer ? q.answer : '', null, answer));
      wrap.append(right);
      cell.append(wrap);
    } else cell.append(stack(q, config, kind === 'blank' ? q.answer : (answer ? q.answer : ''),
      kind === 'blank' && !answer ? q.blankIndex : null, kind !== 'blank' && answer, kind === 'blank' && answer ? q.blankIndex : null));
  }
  function install() {
    if (!root.Sheet?.register || !root.SheetGen?.generate) return false;
    for (const kind of ['horizontal', 'vertical', 'blank', 'correction']) root.Sheet.register('g212-' + kind, render);
    if (!root.SheetGen.__g212) {
      const original = root.SheetGen.generate;
      root.SheetGen.generate = function (config) {
        return config?.gen?.bundle === BUNDLE ? build(config) : original.apply(this, arguments);
      };
      Object.defineProperty(root.SheetGen, '__g212', { value: true });
    }
    return true;
  }
  if (!install()) document.addEventListener('DOMContentLoaded', install, { once: true });
  if (Array.isArray(root.SheetCatalog)) root.SheetCatalog.push(...entries);
  root.Sheet212 = { entries, build, scaled, carryCount };
})(globalThis);
