/* 소수 크기와 변환: 기존 Worksheets 수 자료를 선별해 21개 종이 유형으로 구성한다. */
(function (root) {
  'use strict';
  const prefix = '2-0-1-';
  const source = 'g201-decimal-source';
  const catalog = root.SheetCatalog;
  const original = root.SheetGen.generate;
  const node = (tag, cls, value) => {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (value !== undefined) el.textContent = value;
    return el;
  };
  const dec = n => String(Number(Number(n).toFixed(6)));
  const gcd = (a, b) => b ? gcd(b, a % b) : a;
  const fraction = (n, d) => `${n}/${d}`;
  const reduced = (n, d) => { const g = gcd(n, d); return fraction(n / g, d / g); };
  const seeded = (a, b) => (Math.imul(a >>> 0, 1664525) + b + 1013904223) >>> 0;

  // drill-engine이 이미 감싼 Worksheets.generate를 이용한다. 소수 셋째 자리도 같은 엔진의 profile이다.
  if (!root.DrillCatalog.profiles.has(source)) root.DrillCatalog.profiles.set(source, {
    id: source, source: 'decimal-add-2', title: '소수 세 자리 수 자료', group: '기본 연산',
    mode: 'basic', layout: 'horizontal', decimalPlaces: [3, 3], code: 'add'
  });

  function candidates(seed, round) {
    const result = [];
    for (const [id, places] of [['decimal-add-1', 1], ['decimal-add-2', 2], [source, 3]]) {
      const rows = root.Worksheets.generate(id, seeded(seed + round * 104729, places), 28);
      for (const q of rows) for (const value of [q.a, q.b]) {
        const text = String(value), number = Number(text);
        if (!/^\d+\.\d{1,3}$/.test(text) || !Number.isFinite(number) || number <= 0 || number > 99.999) continue;
        if (text.endsWith('0')) continue;
        result.push({ text, number, places });
      }
    }
    return result;
  }

  function make(config, raw, index) {
    const concept = Number(config.typeId.split('-')[3]);
    const task = Number(config.typeId.split('-')[4].slice(1));
    const n = raw.number, p = raw.places, base = 10 ** p, integer = Math.round(n * base);
    const other = dec(n + (index % 2 ? 1 : -1) / base);
    if (concept === 0) {
      const short = dec(n), long = raw.text + (p === 1 ? '0' : '0');
      if (p === 3) return null;
      if (task === 1) return { left: short, value: long, key: short + '=' + long };
      if (task === 2) return { prompt: `${short} = □`, answer: long, key: short + '=' + long };
      const eq1 = raw.text + '0', eq2 = raw.text + '00', pat = index % 3;
      const choices = pat === 0 ? [eq1, other, eq2] : pat === 1 ? [other, eq1, eq2] : [eq1, eq2, other];
      const answer = choices.map((x, i) => x === other ? null : '①②③'[i]).filter(Boolean).join(', ');
      return { prompt: `${raw.text}${'013678'.includes(raw.text.slice(-1)) ? '과' : '와'} 같은 수 모두 고르기`, choices, answer, key: short + '=' + long };
    }
    if (concept === 1) {
      const a = raw.text, b = index % 6 === 0 ? a + '0' : other;
      if (Number(b) < 0 || Number(b) > 99.999) return null;
      if (task === 1) return { prompt: `${a}  □  ${b}`, answer: n < Number(b) ? '<' : n > Number(b) ? '>' : '=', key: a + ':' + b };
      const c = dec(n + (index % 3 + 2) / base);
      if (Number(c) > 99.999 || Number(b) === n) return null;
      const values = [a, b, c];
      if (task === 2) return { prompt: values.join(' , '), answer: values.slice().sort((x, y) => Number(x) - Number(y)).join(' < '), key: values.join(':') };
      return { prompt: values.join(' , '), answer: `가장 큰 수 ${c}, 가장 작은 수 ${Number(b) < n ? b : a}`, key: values.join(':') };
    }
    if (concept === 2) {
      if (p > 2 || n > 10) return null;
      const step = p === 1 ? 0.1 : 0.01, start = Math.floor(n / (step * 10)) * step;
      const pos = Math.round((n - start) / step);
      if (pos < 1 || pos > 9 || start + step * 10 > 10) return null;
      return { start: dec(start), end: dec(start + step * 10), value: raw.text, pos,
        prompt: task === 2 ? `${raw.text}의 위치에 점을 찍으세요.` : task === 3 ? '□ 눈금의 수를 쓰세요.' : '● 위치의 수를 쓰세요.',
        answer: raw.text, key: `${start}:${step}:${pos}:${task}` };
    }
    if (concept === 3) {
      if (task === 1) return { prompt: `${raw.text} = □/${base}`, answer: String(integer), key: raw.text };
      if (task === 2) return { left: raw.text, value: fraction(integer, base), key: raw.text };
      if (gcd(integer, base) === 1) return null;
      return { prompt: `${raw.text} = ${integer}/${base} = □`, answer: reduced(integer, base), key: raw.text };
    }
    if (concept === 4) {
      if (n >= 1) return null;
      const denominators = [2, 4, 5, 8, 10, 20, 25, 40, 50, 100, 125, 200, 250, 500, 1000];
      const d = denominators[(integer + index) % denominators.length];
      const numerator = Math.max(1, Math.min(d - 1, Math.round(n * d)));
      const target = [10, 100, 1000].find(x => x % d === 0);
      if (!target || gcd(numerator, d) !== 1) return null;
      if (task !== 2 && d === target) return null;   // 분모가 이미 10·100·1000 이면 '1/10 = 1/10' 같은 항등 단계가 된다.
      const product = numerator * (target / d);
      const decimal = dec(numerator / d);
      if (task === 1) return { prompt: `${numerator}/${d} = □/${target} = □`, answer: `${product}, ${decimal}`, key: `${numerator}/${d}` };
      if (task === 2) return { left: fraction(numerator, d), value: decimal, key: `${numerator}/${d}` };
      return { prompt: `${numerator}/${d} = □/${target} = □`, answer: `${product}, ${decimal}`, key: `${numerator}/${d}` };
    }
    const multiply = concept === 5, power = index % 3 + 1, factor = 10 ** power;
    const result = multiply ? n * factor : n / factor;
    if (result > 99999) return null;
    const op = multiply ? `× ${factor}` : `÷ ${factor}`;
    const correct = dec(result), wrong = dec(multiply ? n / factor : n * factor);
    if (task === 1) return { prompt: `${raw.text} ${op}`, answer: correct, input: raw.text, factor, key: `${raw.text}:${factor}` };
    if (task === 2) return { prompt: `${raw.text} ${op} = □`, answer: correct, input: raw.text, factor, key: `${raw.text}:${factor}` };
    return { prompt: `${raw.text} ${op} = ${wrong}`, answer: `${raw.text} ${op} = ${correct}`, key: `${raw.text}:${factor}` };
  }

  function generate(config) {
    if (!config.typeId.startsWith(prefix)) return original(config);
    const picked = [], seen = new Set(), seed = Number(config.seed) >>> 0;
    const needed = config.format === 'g201-table' ? config.count * 8 : config.count;
    for (let round = 0; round < 800 && picked.length < needed; round++) {
      for (const [i, raw] of candidates(seed, round).entries()) {
        const q = make(config, raw, i + round * 137);
        if (!q || seen.has(q.key)) continue;
        seen.add(q.key); picked.push(q);
        if (picked.length === needed) break;
      }
    }
    if (picked.length !== needed) throw Error(`${config.typeId}: 고유 문항 ${needed}개 중 ${picked.length}개만 확보`);
    if (config.format === 'g201-table') {
      const groups = [];
      for (let i = 0; i < picked.length; i += 8) groups.push({ items: picked.slice(i, i + 8) });
      return groups;
    }
    return picked;
  }
  root.SheetGen.generate = generate;

  // 선 잇기: 세트 4쌍, 2단 compact, 제자리 짝(수평선) 없는 순서.
  function derange(n, seed) {
    let s = seed >>> 0;
    const rnd = () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
    for (let t = 0; t < 80; t++) {
      const o = [...Array(n).keys()];
      for (let i = n - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [o[i], o[j]] = [o[j], o[i]]; }
      if (o.every((x, i) => x !== i)) return o;
    }
    return [...Array(n).keys()].map(i => (i + 1) % n);
  }
  const asValue = v => /^\d+\/\d+$/.test(String(v)) ? { frac: String(v) } : String(v);
  const valueMm = (v, fs) => { const t = String(v); const parts = /^\d+\/\d+$/.test(t) ? t.split('/') : [t]; return Math.max(...parts.map(x => x.length)) * fs * 0.2 + 3; };
  function matchingBuild(config) {
    const pairs = generate(config), items = [], per = 4, bundles = pairs.length / per;
    const fs = config.fontPt || 15;
    const wl = Math.ceil(Math.max(...pairs.map(q => valueMm(q.left, fs)))), wr = Math.ceil(Math.max(...pairs.map(q => valueMm(q.value, fs))));
    for (let b = 0; b < bundles; b++) {
      const chunk = pairs.slice(b * per, b * per + per);
      items.push({ kind: 'bundle', compact: true, compactWl: wl, compactWr: wr, compactGap: 20, caption: '',
        pairs: chunk.map(q => [asValue(q.left), asValue(q.value)]),
        order: derange(per, (Number(config.seed) >>> 0) + b * 7919 + 13), rowsWeight: per });
    }
    return { items, layout: { cols: bundles, rows: per, count: pairs.length }, pairs: pairs.length };
  }
  if (root.MatchingSheet && root.MatchingSheet.formats['matching-lines']) {
    root.MatchingSheet.formats['g201-match'] = { page: 'blocks', title: '같은 크기의 수 연결하기',
      render: (config, item, isAnswer) => root.MatchingSheet.formats['matching-lines'].render(config, item, isAnswer), build: matchingBuild };
  }

  const css = `
    .g201-body{width:100%;height:100%;box-sizing:border-box;font-size:1em;line-height:1.35;display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:0 1.2mm;text-align:center}
    .g201-choice-prompt{display:flex;align-items:center;justify-content:center;white-space:nowrap;font-size:10pt;gap:.3mm}.g201-parenthesis-answer{display:inline-block;min-width:12mm;text-align:center}.g201-choice-prompt .g201-ink{color:#d71f10}
    .g201-extremes-compact{font-size:10pt!important;line-height:1.25}.g201-extremes-compact .g201-row{gap:.5mm}.g201-extremes-compact .g201-parenthesis-answer{min-width:14mm}.g201-extremes-compact .g201-ink{color:#d71f10}
    .g201-prompt{white-space:nowrap}.g201-answer{display:inline-block;min-width:13mm;border-bottom:1px solid #555;text-align:center}
    .g201-stack{flex-direction:column;flex-wrap:nowrap;gap:2mm}.g201-stack>div{white-space:nowrap}
    .g201-stack .g201-answer{min-width:30mm}
    .g201-row{display:flex;align-items:center;justify-content:center;gap:1.5mm;white-space:nowrap}
    .g201-frac{display:inline-flex;flex-direction:column;align-items:center;text-align:center;line-height:1.1;vertical-align:middle;min-width:1.5em}
    .g201-frac>span:first-child{border-bottom:1px solid #111;padding:0 .15em .06em;min-width:100%;box-sizing:border-box}
    .g201-frac>span:last-child{padding-top:.06em}
    .g201-nbox{display:inline-block;min-width:1.8em;min-height:1.2em;border:1px solid #777;box-sizing:border-box;line-height:1.2}
    .g201-fbox{display:inline-flex;align-items:center;justify-content:center;min-width:2.4em;min-height:2.6em;border:1px solid #777;box-sizing:border-box;padding:.2em}
    .g201-line{position:relative;height:11mm;width:100%;margin:1.5mm 0 0}.g201-track{position:absolute;left:3%;right:3%;top:70%;border-top:1.2px solid #222;display:flex;justify-content:space-between}
    .g201-tick{height:4mm;border-left:1px solid #333;position:relative;top:-2mm}.g201-dot{position:absolute;top:-4.6mm;left:-1.6mm;font-size:.8em;line-height:1}
    .g201-ends{display:flex;justify-content:space-between;width:94%;font-size:.9em}
    .g201-line-prompt{font-size:10pt!important;line-height:1.2;white-space:nowrap}
    .g201-lbody{flex-direction:column;flex-wrap:nowrap;gap:0}
    .g201-lbody .g201-answer{margin-top:.8mm}
    .g201-body:has(.g201-table){padding:0 1mm 1mm;align-items:stretch}
    .g201-table{border-collapse:collapse;width:100%;height:100%;font-size:1em;text-align:center}
    .g201-table td,.g201-table th{border:1px solid #999;padding:.3mm .2mm;font-weight:normal}
    .g201-place-fraction{display:inline-flex;flex-direction:column;align-items:center;font-size:8pt;line-height:1.15}.g201-place-fraction>span:last-child{border-top:1px solid currentColor;padding-top:1px;font-size:7pt}
    .g201-place{font-size:.9em;table-layout:fixed}.g201-place th:first-child{width:27mm}.g201-place td:first-child{white-space:nowrap}
    .g201-rel{font-size:1em}
    .g201-work{flex-direction:column;flex-wrap:nowrap;gap:4mm}.g201-work .g201-wrong{white-space:nowrap}
    .g201-work .g201-writing{width:92%;height:11mm;border-bottom:1px solid #aaa;display:flex;align-items:flex-end;justify-content:center;white-space:nowrap}
    .sheet-page:has(.g201-body) .sheet-head{gap:2mm}
    .sheet-page:has(.g201-body) .sheet-field{min-width:18mm;font-size:8pt}
    .sheet-page:has(.g201-body) .sheet-title{font-size:8.5pt}
  `;
  const style = node('style'); style.textContent = css; document.head.append(style);
  const fracNode = (n, d) => { const f = node('span', 'g201-frac'); f.append(typeof n === 'string' || typeof n === 'number' ? node('span', '', n) : n, node('span', '', d)); return f; };
  function answerSpan(value, show) {
    if (/^\d+\/\d+$/.test(String(value))) {
      const [n, d] = String(value).split('/'), box = node('span', 'g201-fbox');
      if (show) box.append(fracNode(n, d)); else box.textContent = ' ';
      return box;
    }
    return node('span', 'g201-answer', show ? value : ' ');
  }
  // "3/5 = □/10 = □" 같은 식을 진짜 분수로 그린다.
  function mathRow(prompt, values, show) {
    const row = node('div', 'g201-row'), re = /(□|\d+)\/(\d+)|□/g;
    let last = 0, k = 0, m;
    const next = () => values[k++] ?? '';
    while ((m = re.exec(prompt))) {
      if (m.index > last) row.append(node('span', 'g201-prompt', prompt.slice(last, m.index).trim()));
      if (m[2] !== undefined) {
        if (m[1] === '□') { const box = node('span', 'g201-nbox', show ? next() : ' '); row.append(fracNode(box, m[2])); }
        else row.append(fracNode(m[1], m[2]));
      } else row.append(answerSpan(next(), show));
      last = re.lastIndex;
    }
    if (last < prompt.length) row.append(node('span', 'g201-prompt', prompt.slice(last).trim()));
    return row;
  }
  root.Sheet.register('g201-short', (cell, q, show) => {
    const body = node('div', 'g201-body');
    const ans = String(q.answer);
    if (q.choices) {
      body.classList.add('g201-stack');
      const prompt = node('div', 'g201-choice-prompt');
      prompt.append(node('span', '', q.prompt.replace('같은 수 모두 고르기', '같은 수를 모두 고르시오.')), node('span', '', ' ('), node('span', 'g201-parenthesis-answer' + (show ? ' g201-ink' : ''), show ? q.answer : '\u00a0'), node('span', '', ')'));
      body.append(prompt, node('div', '', q.choices.map((x, i) => `${'①②③'[i]} ${x}`).join('    ')));
    } else if (ans.startsWith('가장 큰 수')) {
      body.classList.add('g201-stack');
      const m = /가장 큰 수 (\S+), 가장 작은 수 (\S+)/.exec(ans);
      body.classList.add('g201-extremes-compact');
      body.append(node('div', '', q.prompt));
      for (const [label, v] of [['가장 큰 수', m[1]], ['가장 작은 수', m[2]]]) {
        const r = node('div', 'g201-row');
        r.append(node('span', '', label + ' ('), node('span', 'g201-parenthesis-answer' + (show ? ' g201-ink' : ''), show ? v : '\u00a0'), node('span', '', ')'));
        body.append(r);
      }
    } else if (q.prompt.includes('□')) {
      body.append(mathRow(q.prompt, ans.split(',').map(x => x.trim()), show));
    } else if (ans.includes(' < ')) {
      body.classList.add('g201-stack');
      body.append(node('div', '', q.prompt), answerSpan(ans, show));
    } else {
      body.append(node('span', 'g201-prompt', q.prompt), answerSpan(q.answer, show));
    }
    cell.append(body);
  });
  root.Sheet.register('g201-line', (cell, q, show, config) => {
    const task = Number(config.typeId.split('-')[4].slice(1));
    const body = node('div', 'g201-body g201-lbody'); body.append(node('div', 'g201-line-prompt', q.prompt));
    const line = node('div', 'g201-line'), track = node('div', 'g201-track');
    for (let i = 0; i <= 10; i++) {
      const tick = node('span', 'g201-tick');
      if (i === q.pos && (task === 2 ? show : true)) tick.append(node('b', 'g201-dot', task === 3 ? '□' : '●'));
      track.append(tick);
    }
    line.append(track);
    const ends = node('div', 'g201-ends'); ends.append(node('span', '', q.start), node('span', '', q.end));
    body.append(line, ends);
    if (task !== 2) body.append(answerSpan(q.answer, show));
    cell.append(body);
  });
  root.Sheet.register('g201-table', (cell, q, show, config) => {
    const task = Number(config.typeId.split('-')[4].slice(1));
    const body = node('div', 'g201-body');
    const table = node('table', `g201-table ${task === 1 ? 'g201-place' : 'g201-rel'}`);
    const items = q.items;
    const headers = task === 1 ? ['계산', '만', '천', '백', '십', '일', '.', '1/10', '1/100', '1/1000', '1/10000', '1/100000', '1/1000000'] : ['처음 수', '관계', '바뀐 수'];
    const head = node('tr'); headers.forEach(h => { const th = node('th'); if (/^1\/\d+$/.test(h)) { const f = node('span', 'g201-place-fraction'); f.append(node('span', '', '1'), node('span', '', h.split('/')[1])); th.append(f); } else th.textContent = h; head.append(th); }); table.append(head);
    items.forEach(item => {
      const row = node('tr');
      if (task === 1) {
        const chars = String(item.answer).split('.');
        const digits = chars[0].padStart(5, ' ').split('').concat('.').concat((chars[1] || '').padEnd(6, ' ').split(''));
        row.append(node('td', '', item.prompt));
        digits.forEach((d, i) => row.append(node('td', '', i === 5 ? '.' : show ? d : ' ')));
      } else {
        [item.input, `${config.typeId.includes('-5-') ? '×' : '÷'} ${item.factor}`, show ? item.answer : ' '].forEach(v => row.append(node('td', '', v)));
      }
      table.append(row);
    });
    body.append(table); cell.append(body);
  });
  root.Sheet.register('g201-correct', (cell, q, show) => {
    const body = node('div', 'g201-body g201-work');
    body.append(node('div', 'g201-wrong', q.prompt));
    body.append(node('div', 'g201-writing', show ? q.answer : ' '));
    cell.append(body);
  });

  const concepts = [
    ['소수 끝의 0과 크기가 같은 소수', ['같은 크기를 나타내는 수 연결하기', '같은 크기의 수가 되도록 빈칸 채우기', '같은 크기인 표현 모두 고르기']],
    ['소수의 크기 비교', ['두 수 사이에 부등호 넣기', '작은 수부터 순서대로 쓰기', '가장 큰 수와 가장 작은 수 찾기']],
    ['수직선에서 소수 나타내기', ['수직선의 위치에 수 쓰기', '주어진 수의 위치 표시하기', '수직선의 빠진 눈금 채우기']],
    ['소수를 분수로 나타내기', ['소수 자릿값을 이용해 분수 쓰기', '같은 크기의 소수와 분수 연결하기', '분수로 바꾼 뒤 약분하기']],
    ['분수를 소수로 나타내기', ['분모를 10·100·1000으로 바꾸어 소수 쓰기', '같은 크기의 분수와 소수 연결하기', '분수에서 소수로 바꾸는 과정 채우기']],
    ['소수의 10배·100배·1000배', ['자리표에서 수의 변화 완성하기', '배의 관계 표 채우기', '소수점 위치 오류 고치기']],
    ['소수의 10분의 1·100분의 1·1000분의 1', ['자리표에서 수의 변화 완성하기', '배의 관계 표 채우기', '소수점 위치 오류 고치기']]
  ];
  const shortConcepts = ['소수 끝 0', '소수 크기', '소수 수직선', '소수→분수', '분수→소수', '소수 ×10·100·1000', '소수 ÷10·100·1000'];
  concepts.forEach(([concept, titles], c) => titles.forEach((title, t) => {
    if (c === 0 && t === 1) return; // 사용자 요청으로 소수 끝 0 빈칸 유형 폐기
    const typeId = `${prefix}${c}-t${t + 1}`;
    let format = 'g201-short', cols = 3, rows = 13, fontPt = 16;
    if (title.includes('연결하기')) { format = 'g201-match'; cols = 8; rows = 4; fontPt = c === 3 ? 13 : c === 4 ? 14 : 15; }
    else if (c === 2) { format = 'g201-line'; cols = 3; rows = 5; fontPt = 14; }
    else if (c >= 5 && t < 2) { format = 'g201-table'; cols = 1; rows = 3; fontPt = 14; }
    else if (c >= 5 && t === 2) { format = 'g201-correct'; cols = 3; rows = 5; fontPt = 18; }
    else if ((c === 3 && t !== 1) || c === 4) { cols = 2; rows = 10; fontPt = 18; }
    else if (c === 0 && t === 2) { cols = 2; rows = 10; fontPt = 15; }
    else if ((c === 0 && t === 1) || (c === 1 && t === 0)) fontPt = 20;
    else if (c === 1 && t > 0) { cols = 3; rows = 9; fontPt = 15; }
    catalog.push({ typeId, title: `${shortConcepts[c]} · ${title}`, concept, instruction: title + '.', format,
      cols, rows, count: cols * rows, seed: 20261001, gen: { legacyId: source },
      fontPt, autoFit: false, maxProblems: cols * rows });
  }));
})(globalThis);
