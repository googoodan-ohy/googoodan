/* 묶음 2-4-2: 기존 Worksheets 소수 나눗셈을 조건별로 선별한다. */
(function (root) {
  'use strict';
  const names = [
    '소수 ÷ 소수(같은 자리)', '소수 ÷ 소수(다른 자리)', '자연수 ÷ 소수',
    '몫에 0이 있는 나눗셈', '소수 몫 반올림', '소수 나눗셈의 나머지'
  ];
  const titles = [
    ['가로식으로 몫 구하기', '세로 나눗셈으로 계산하기', '세로 풀이의 빈칸 채우기', '잘못된 나눗셈 과정 고치기'],
    ['지정한 자리까지 반올림하기', '반올림에 필요한 자리 표시하기', '잘못 반올림한 결과 고치기'],
    ['계산식에서 실제 나머지 쓰기', '나머지의 단위를 맞추어 검산하기', '나머지의 소수점 오류 고치기']
  ];
  const instructions = [
    '식을 계산하고 답을 쓰세요.', '소수점을 옮겨 세로로 계산하세요.',
    '세로 풀이의 □에 알맞은 숫자를 쓰세요.', '잘못된 곳을 찾아 바르게 고쳐 쓰세요.'
  ];
  const sources = {
    0: ['decimal-div-1'],
    1: ['decimal-div-2dp-1dp'],
    2: ['decimal-div-0dp-1dp'],
    3: ['decimal-div-1', 'decimal-div-2', 'decimal-div-2dp-1dp', 'decimal-div-1dp-2dp', 'decimal-div-0dp-1dp'],
    4: ['decimal-div-1', 'decimal-div-2', 'decimal-div-2dp-1dp', 'decimal-div-1dp-2dp'],
    5: ['decimal-div-1', 'decimal-div-2', 'decimal-div-2dp-1dp', 'decimal-div-0dp-1dp']
  };
  const places = x => (String(x).split('.')[1] || '').length;
  const scaled = x => Number(String(x).replace('.', ''));
  const fmt = (n, p) => {
    const neg = n < 0 ? '-' : ''; let s = String(Math.abs(n));
    while (s.length <= p) s = '0' + s;
    return neg + (p ? s.slice(0, -p) + '.' + s.slice(-p) : s);
  };
  const clean = s => String(s).includes('.') ? String(s).replace(/0+$/, '').replace(/\.$/, '') : String(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  // 정수식 A/10^pa ÷ B/10^pb = A*10^pb / (B*10^pa).
  function exact(q) {
    const pa = places(q.a), pb = places(q.b), A = scaled(q.a), B = scaled(q.b);
    const n = A * 10 ** pb, d = B * 10 ** pa;
    if (!(A > 0 && B > 0) || pa > 2 || pb > 2 || n * 100 % d) return null;
    const hundredths = n * 100 / d;
    if (hundredths > 99999 || hundredths <= 0) return null;
    return { pa, pb, A, B, n, d, hundredths, answer: clean(fmt(hundredths, 2)) };
  }
  function accept(group, q) {
    const v = exact(q); if (!v) return false;
    if (group === 0) return v.pa === 1 && v.pb === 1;
    if (group === 1) return v.pa === 2 && v.pb === 1;
    if (group === 2) return v.pa === 0 && v.pb === 1 && Number(q.a) <= 20;
    if (group === 3) {
      // 앞뒤 0이 아닌 몫의 의미 있는 자리 안에 0이 있어야 한다.
      const digits = v.answer.replace('.', '').replace(/^0+/, '').replace(/0+$/, '');
      return v.pa >= 1 && v.pa <= 2 && digits.length >= 2 && digits.includes('0');
    }
    if (group === 4) return v.pa > 0 && v.pb > 0 && v.hundredths % 10 !== 0;
    if (group === 5) return v.pa > 0;
    return false;
  }
  function pool(group, seed, count) {
    if (!root.Worksheets?.generate) throw Error('기존 Worksheets 생성기가 필요합니다.');
    const ids = sources[group], out = [], seen = new Set();
    const want = Math.max(count + 30, group === 3 ? count * 3 : count + 10);
    for (let batch = 0; batch < 5000 && out.length < want; batch++) {
      const id = ids[batch % ids.length];
      const rows = root.Worksheets.generate(id, (Number(seed) + batch * 104729) >>> 0, 16);
      for (const row of rows) {
        const key = row.a + ':' + row.b;
        if (seen.has(key) || !accept(group, row)) continue;
        seen.add(key);
        const v = exact(row);
        out.push({ a: String(row.a), b: String(row.b), op: '÷', answer: v.answer, value: v });
        if (out.length >= want) break;
      }
    }
    if (out.length < count) throw Error('2-4-2-' + group + ': 조건에 맞는 문항이 ' + out.length + '/' + count + '개입니다.');
    out.sort((a, b) => Number(a.a) - Number(b.a) || Number(a.b) - Number(b.b));
    return out;
  }
  function roundInfo(q, index) {
    const v = q.value;
    // 기존 생성기의 정확한 소수 둘째 자리 몫에서 실제 올림이 일어나는 목표를 고른다.
    const targets = [0, 1].filter(p => {
      const unit = 10 ** (2 - p);
      return Math.floor(v.hundredths / (unit / 10)) % 10 >= 5;
    });
    if (!targets.length) return null;
    const p = targets[index % targets.length], unit = 10 ** (2 - p);
    const rounded = Math.floor((v.hundredths + unit / 2) / unit);
    return { target: p, targetText: p ? '소수 첫째 자리' : '일의 자리',
      rounded: fmt(rounded, p), wrong: fmt(Math.floor(v.hundredths / unit), p),
      lookAt: p ? '소수 둘째 자리' : '소수 첫째 자리',
      digit: String(Math.floor(v.hundredths / (unit / 10)) % 10) };
  }
  function remainderInfo(q, index) {
    const v = q.value, stops = [0, 1, 2];
    for (let j = 0; j < stops.length; j++) {
      const p = stops[(index + j) % stops.length], unit = 10 ** (2 - p);
      const quotient = Math.floor(v.hundredths / unit);
      const remScaled = v.A * 10 ** (v.pb + p) - quotient * v.B * 10 ** v.pa;
      const remDenomPower = v.pa + v.pb + p;
      if (remScaled <= 0) continue;
      const remainder = clean(fmt(remScaled, remDenomPower));
      if (Number(remainder) >= Number(q.b)) continue;
      return { stop: p, quotient: fmt(quotient, p), remainder,
        wrong: clean(fmt(remScaled, Math.max(0, remDenomPower - v.pb))) };
    }
    return null;
  }
  function prepare(group, kind, q, i) {
    const result = { ...q };
    if (group <= 3 && kind === 4) {
      // 잘못된 몫은 반드시 바른 몫과 값이 다르다.
      result.wrong = clean(fmt(q.value.hundredths * 10, 2));
      result.error = '피제수의 소수점만 한 자리 옮겼어요.';
    }
    if (group === 4) {
      const info = roundInfo(q, i); if (!info) return null;
      Object.assign(result, info);
      if (kind === 3 && Number(result.wrong) === Number(result.rounded)) return null;
    }
    if (group === 5) {
      const info = remainderInfo(q, i); if (!info) return null;
      Object.assign(result, info);
      if (kind === 3 && Number(result.wrong) === Number(result.remainder)) return null;
    }
    return result;
  }
  function questions(config) {
    const group = config.gen.group, kind = config.gen.kind, count = config.count;
    const candidates = pool(group, config.seed, count);
    const out = [];
    for (const q of candidates) {
      const made = prepare(group, kind, q, out.length);
      if (made) out.push(made);
      if (out.length === count) break;
    }
    if (out.length < count) throw Error(config.typeId + ': 문항 ' + out.length + '/' + count + '개');
    return out;
  }
  function style() {
    if (document.getElementById('ko242-style')) return;
    const el = document.createElement('style'); el.id = 'ko242-style';
    el.textContent = '.ko242{font-variant-numeric:tabular-nums;font-size:1em;line-height:1.3;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;text-align:center}' +
      '.ko242 .shift{font-size:.8em;white-space:nowrap;color:#444}' +
      '.ko242 .bar{display:inline-block;border-top:1px solid #111;border-left:1px solid #111;padding:0 2px 0 3px}' +
      '.ko242 .sum{margin-left:7mm;white-space:nowrap}' +
      '.ko242 pre{margin:1mm 0 0 0;font:.85em/1.12 Consolas,monospace;white-space:pre;text-align:left}' +
      '.ko242 .work{height:1.2em;border-bottom:1px solid #ddd;margin-left:9mm;max-width:75%}' +
      '.ko242 .ink{color:#d71f10;font-weight:700}.ko242 .box{display:inline-block;min-width:2.6em;border-bottom:1.5px solid #555;text-align:center}' +
      '.ko242 .wrong{font-weight:bold}.ko242 .fix{border:1px dashed #bbb;min-height:7mm;margin-top:1mm;padding:1mm}' +
      '.ko242-figure-holder{width:100%;flex:1;min-height:0}.ko242-fix-row{display:flex;width:100%;height:85%;gap:2mm}.ko242-fix-left{width:46%;height:100%}.ko242-fix-right{flex:1;min-width:18mm;border:1px solid #bbb;height:100%;box-sizing:border-box}.ko242 .box{border:1px solid #688c85;height:7mm;min-width:12mm;box-sizing:border-box}.ko242 .note{font-size:.8em;color:#555}';
    document.head.appendChild(el);
  }
  function shifted(q) {
    const p = places(q.b), b = String(q.value.B);
    // 원래 피제수 × 10^p. 정수로 안전하게 다시 계산한다.
    const shiftedA = clean(fmt(q.value.A * 10 ** p, q.value.pa));
    return { a: shiftedA, b };
  }
  // 줄마다 [글자, 빨강 여부]. 문제로 인쇄된 줄은 검정, 학생이 새로 쓰는 줄·자리만 빨강.
  function longWork(q, kind, show) {
    const shiftedValue = shifted(q), divisor = Number(shiftedValue.b);
    const fractional = Math.max(places(shiftedValue.a), places(q.answer));
    const input = Number(shiftedValue.a).toFixed(fractional);
    const digits = input.replace('.', '');
    const width = Math.max(digits.length + 2, String(q.wrong || q.answer).length + 2);
    const pad = (s, n = width) => String(s).padStart(n, ' ');
    const quotient = kind === 4 ? q.wrong : q.answer;
    const blankAt = Math.max(0, quotient.length - 1);
    const lines = [];
    if (kind === 3) {
      const head = pad(quotient.slice(0, blankAt));
      lines.push([[head, false], [show ? quotient.slice(blankAt) : '□', show]]);
    } else if (kind === 2) lines.push([[pad(show ? quotient : '□'.repeat(quotient.length)), show]]);
    else lines.push([[pad(quotient), false]]);
    lines.push([[pad(shiftedValue.b) + ' │ ' + input, false]]);
    if (kind === 4) {
      lines.push([[pad(shiftedValue.b + ' × ' + q.wrong + ' = ' +
        clean(String(Number((divisor * Number(q.wrong)).toFixed(4))))), false]]);
      return lines;
    }
    const red = kind === 2;          // 계산하기(kind 2)는 풀이 줄이 새로 쓰는 답, 빈칸 채우기(kind 3)는 인쇄된 풀이
    let remainder = 0, started = false;
    for (let i = 0; i < digits.length; i++) {
      const current = remainder * 10 + Number(digits[i]);
      const digit = Math.floor(current / divisor), product = digit * divisor;
      remainder = current - product;
      if (!started && !digit) continue;
      started = true;
      const lead = Math.max(0, digits.length - i - 1);
      const place = text => pad(text, digits.length - lead) + ' '.repeat(lead);
      if (digit === 0) {
        lines.push([[place('↓' + digits[i]), red && show]]);
        continue;
      }
      if (kind === 2 && !show) {
        lines.push([[place('____'), false]]);
      } else {
        lines.push([[place(current), red && show]], [[place('−' + product), red && show]], [[place('────'), red && show]]);
      }
    }
    if (show && kind !== 4) lines.push([[pad('나머지 ' + remainder), red && show]]);
    return lines;
  }
  function renderDivision(cell, q, show, config) {
    style(); root.Ko241.installStyle();
    const kind = config.gen.kind, transformed = shifted(q);
    const model = root.Ko241.divisionModel(transformed.a, transformed.b, q.answer, {});
    const wrap = document.createElement('div'); wrap.className = 'ko242';
    const shift = document.createElement('div'); shift.className = 'shift';
    shift.textContent = q.a + ' ÷ ' + q.b + ' → ' + transformed.a + ' ÷ ' + transformed.b;
    wrap.appendChild(shift);
    if (kind === 4) {
      const fix = document.createElement('div'); fix.className = 'ko242-fix-row';
      const wrong = { ...model, quotient: [] };
      const whole = String(q.wrong).split('.')[0], fraction = String(q.wrong).split('.')[1] || '';
      const offset = model.intDigits - whole.length;
      [...whole + fraction].forEach((ch, index) => wrong.quotient.push({ slot: offset + index, ch }));
      wrong.quotientPointAt = fraction ? model.intDigits : null;
      const left = document.createElement('div'); left.className = 'ko242-fix-left';
      left.innerHTML = root.Ko241.figure(wrong, { solution: true }); fix.appendChild(left);
      const right = document.createElement('div'); right.className = 'ko242-fix-right';
      if (show) right.innerHTML = root.Ko241.figure(model, { solution: true, ink: true });
      fix.appendChild(right); wrap.appendChild(fix);
    } else {
      const spot = kind === 3 ? root.Ko241.blankSpot(model, config.seed || 1, q.blank || 0) : null;
      const holder = document.createElement('div'); holder.className = 'ko242-figure-holder';
      holder.innerHTML = root.Ko241.figure(model, { solution: kind === 3 || show, blank: spot, reveal: !!show, ink: kind === 2 && show });
      wrap.appendChild(holder);
    }
    cell.appendChild(wrap);
  }
  function renderShort(cell, q, show, config) {
    style();
    const group = config.gen.group, kind = config.gen.kind;
    const wrap = document.createElement('div'); wrap.className = 'ko242';
    let prompt, answer;
    if (group === 4) {
      if (kind === 1) { prompt = q.a + ' ÷ ' + q.b + ' ≈ ? (' + q.targetText + '까지)'; answer = q.rounded; }
      if (kind === 2) { prompt = '몫 ' + q.answer + ' → ' + q.targetText + '까지: 볼 자리?'; answer = q.lookAt + ' (' + q.digit + ')'; }
      if (kind === 3) { prompt = [q.a + ' ÷ ' + q.b + ' = ' + q.answer, q.targetText + ': ' + q.wrong]; answer = q.rounded; }
    } else {
      if (kind === 1) { prompt = q.a + ' ÷ ' + q.b + ' = ' + q.quotient + ' … ?'; answer = q.remainder; }
      if (kind === 2) { prompt = q.b + ' × ' + q.quotient + ' + ? = ' + q.a; answer = q.remainder; }
      if (kind === 3) { prompt = [q.a + ' ÷ ' + q.b + ' = ' + q.quotient, '나머지 ' + q.wrong]; answer = q.remainder; }
    }
    const lines = Array.isArray(prompt) ? prompt : [prompt];
    wrap.innerHTML = lines.map(t => '<div>' + esc(t) + '</div>').join('') +
      '<div>' + (kind === 3 ? '바른 답: ' : '') + '<span class="box ' + (show ? 'ink' : '') + '">' +
      (show ? esc(answer) : '&nbsp;') + '</span></div>';
    cell.appendChild(wrap);
  }
  const TYPES = [];
  for (let group = 0; group < 6; group++) {
    const max = group < 4 ? 4 : 3;
    for (let kind = 1; kind <= max; kind++) {
      let format, cols, rows;
      if (group < 4) {
        [format, cols, rows] = kind === 1 ? ['horizontal', 3, 13] :
          kind === 4 ? ['ko242-division-error-fix', 3, 4] : ['ko242-division', 4, 4];
      } else {
        [format, cols, rows] = kind === 3 ? ['ko242-short-error-fix', 3, 7] :
          group === 4 && kind === 1 ? ['ko242-short', 3, 13] :
          group === 4 && kind === 2 ? ['ko242-short', 3, 13] : ['ko242-short', 2, 13];
      }
      TYPES.push({ typeId: '2-4-2-' + group + '-t' + kind, group: '2-4-2',
        title: names[group] + ' · ' + (group < 4 ? titles[0][kind - 1] : titles[group - 3][kind - 1]),
        instruction: group < 4 ? instructions[kind - 1] : kind === 3 ? instructions[3] :
          group === 4 ? kind === 2 ? '몫을 반올림할 때 보아야 하는 자리를 쓰세요.' :
            '몫을 계산하고 지정한 자리까지 반올림하세요.' : '몫을 멈춘 자리에서 나머지를 구하세요.',
        format, cols, rows, count: cols * rows, maxProblems: cols * rows, autoFit: false,
        fontPt: group < 4 ? (kind === 1 ? 18 : kind === 4 ? 14 : kind === 3 ? 11 : 12) : (kind === 3 ? 14 : 13),
        workLines: group < 4 ? 6 : undefined, seed: 20261002,
        gen: { ko242: true, group, kind, legacyId: sources[group][0] } });
    }
  }
  if (root.Sheet?.register) {
    root.Sheet.register('ko242-division', renderDivision);
    root.Sheet.register('ko242-division-error-fix', renderDivision);
    root.Sheet.register('ko242-short', renderShort);
    root.Sheet.register('ko242-short-error-fix', renderShort);
  }
  if (root.SheetGen && !root.SheetGen.__ko242) {
    const previous = root.SheetGen.generate;
    root.SheetGen.generate = function (config) {
      return config?.gen?.ko242 ? questions(config) : previous.apply(this, arguments);
    };
    Object.defineProperty(root.SheetGen, '__ko242', { value: true });
  }
  if (Array.isArray(root.SheetCatalog)) for (const t of TYPES)
    if (!root.SheetCatalog.some(x => x.typeId === t.typeId)) root.SheetCatalog.push(t);
  root.Ko242 = { types: TYPES, questions, accept, exact, roundInfo, remainderInfo };
})(globalThis);
