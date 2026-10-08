/* 소수의 뜻과 자릿값: 기존 Worksheets 소수 생성기의 피연산자를 선별한다. */
(function (root) {
  'use strict';
  const F = 'g200-', DEFAULT_SEED = 20261001;
  const entries = [];
  const add = (id, title, instruction, format, cols, rows, gen, extra = {}) =>
    entries.push({ typeId: '2-0-0-' + id, title, instruction, format: F + format,
      cols, rows, count: cols * rows, fontPt: 12, seed: DEFAULT_SEED,
      autoFit: false, maxProblems: cols * rows, gen: { bundle: '2-0-0', ...gen }, ...extra });

  for (const [group, denominator] of [[0, 10], [2, 100]]) {
    const label = denominator === 10 ? '10' : '100';
    add(group + '-t1', '분모 ' + label + '인 분수 → 소수', '분모를 바꾸어 소수로 나타내세요.',
      'fraction-model', 3, 5, { kind: 'fraction', denominator, variant: 'write' }, { fontPt: 18 });
    const sets = denominator === 10 ? 6 : 8;   // 분모 10 은 서로 다른 분수가 24개뿐이라 6세트
    add(group + '-t2', '같은 크기의 분수와 소수 연결하기', '같은 크기의 분수와 소수를 선으로 이으세요.',
      'match', sets, 4, { kind: 'fraction', denominator, variant: 'match', bundles: sets, perBundle: 4 });
    add(group + '-t3', '분수에서 소수로 바꾸는 과정 채우기', '빈칸에 알맞은 수를 쓰세요.',
      'fraction-steps', 2, denominator === 10 ? 9 : 10, { kind: 'fraction', denominator, variant: 'steps' }, { fontPt: 16 });
  }
  for (const [group, places] of [[1, 1], [3, 2], [4, 3]]) {
    const name = ['첫째', '둘째', '셋째'][places - 1];
    add(group + '-t1', '소수 ' + name + ' 자리 · 읽는 말 쓰기', '소수를 읽는 말로 쓰세요.',
      'read', 3, 13, { kind: 'reading', places, variant: 'words' }, { fontPt: 17 });
    add(group + '-t2', '소수 ' + name + ' 자리 · 숫자 쓰기', '읽는 말을 숫자로 쓰세요.',
      'read', 3, 13, { kind: 'reading', places, variant: 'digits' }, { fontPt: 17 });
    add(group + '-t3', '소수 ' + name + ' 자리 · 수와 읽는 말 연결하기', '같은 수와 읽는 말을 선으로 이으세요.',
      'match', 8, 4, { kind: 'reading', places, variant: 'match', bundles: 8, perBundle: 4 });
  }
  add('5-t1', '소수의 자리표에 수 채우기', '자리표의 빈칸을 채우세요.',
    'place-table', 2, 5, { kind: 'place', variant: 'table' }, { fontPt: 18 });
  add('5-t2', '소수의 숫자가 나타내는 값 쓰기', '밑줄 친 숫자가 나타내는 값을 쓰세요.',
    'place', 3, 13, { kind: 'place', variant: 'value' }, { fontPt: 17 });
  add('5-t3', '펼쳐 쓴 수를 하나의 수로 나타내기', '펼쳐 쓴 수를 소수로 쓰세요.',
    'place', 2, 12, { kind: 'place', variant: 'expand' }, { fontPt: 16 });
  add('5-t4', '수의 구성식에서 빈칸 채우기', '구성식의 빈칸 하나를 채우세요.',
    'place', 2, 12, { kind: 'place', variant: 'blank' }, { fontPt: 13.5 });

  function hash(s) { let h = 2166136261; for (const c of s) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) { let s = seed >>> 0; return (lo, hi) => { s += 0x6d2b79f5; let t = s; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return lo + Math.floor(((t ^ t >>> 14) >>> 0) / 4294967296 * (hi - lo + 1)); }; }
  function shuffle(a, r) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = r(0, i); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function installThirdPlace() {
    const profiles = root.DrillCatalog && root.DrillCatalog.profiles;
    if (!(profiles instanceof Map)) throw Error('기존 DrillCatalog가 없습니다.');
    const id = 'g200-decimal-add-3dp';
    if (!profiles.has(id)) profiles.set(id, { id, source: 'decimal-add-2', title: '소수 셋째 자리', group: '기본 연산', mode: 'basic', layout: 'horizontal', decimalPlaces: [3, 3], code: 'add' });
    return id;
  }
  function numbers(config, places, count, maxWhole) {
    const id = places === 3 ? installThirdPlace() : 'decimal-add-' + places;
    const scale = 10 ** places, found = new Map();
    for (let batch = 0; batch < 1200 && found.size < count; batch++) {
      const seed = (Number(config.seed) + hash(config.typeId) + Math.imul(batch, 104729)) >>> 0;
      const rows = root.Worksheets.generate(id, seed, 32);
      for (const row of rows) for (const value of [row.a, row.b]) {
        const n = Math.round(Number(value) * scale), whole = Math.floor(n / scale);
        if (!Number.isFinite(n) || n < 1 || whole > maxWhole || n % 10 === 0) continue;
        if (!found.has(n)) found.set(n, { n, places, text: (n / scale).toFixed(places) });
      }
    }
    if (found.size < count) throw Error(config.typeId + ': 기존 생성기의 조건 일치 수가 모자랍니다 (' + found.size + '/' + count + ').');
    return [...found.values()];
  }
  const digits = ['영','일','이','삼','사','오','육','칠','팔','구'];
  const tens = ['', '십','이십','삼십','사십','오십','육십','칠십','팔십','구십'];
  function KoreanWhole(n) { return n < 10 ? digits[n] : tens[Math.floor(n / 10)] + (n % 10 ? digits[n % 10] : ''); }
  function spoken(q) { const [whole, fractional] = q.text.split('.'); return KoreanWhole(Number(whole)) + ' 점 ' + [...fractional].map(c => digits[Number(c)]).join(' '); }
  function getNumbers(config, places, count, maxWhole) {
    const r = rng((Number(config.seed) ^ hash(config.typeId)) >>> 0);
    const pool = numbers(config, places, count + 20, maxWhole);
    return shuffle(pool, r).slice(0, count).sort((a, b) => a.n - b.n);
  }
  function fractionItems(config) {
    const { denominator: d, variant, bundles: bn = 3, perBundle: pb = 6 } = config.gen, count = config.count;
    const base = d === 10 ? numbers(config, 1, 9, 0).map(q => q.n) : numbers(config, 2, Math.min(80, count + 20), 0).map(q => q.n);
    const r = rng((Number(config.seed) ^ hash(config.typeId)) >>> 0), pool = [];
    for (const factor of [1, 10, 100]) for (const n of base) {
      if (d * factor > 1000 || (variant === 'steps' && factor === 1)) continue;
      pool.push({ n, d, numerator: n * factor, denominator: d * factor, decimal: (n / d).toFixed(d === 10 ? 1 : 2) });
    }
    let picked;
    if (variant === 'match') {
      const available = shuffle(pool, r), used = new Set(); picked = [];
      for (let bundle = 0; bundle < bn; bundle++) {
        const values = new Set();
        for (const q of available) {
          const key = q.numerator + '/' + q.denominator;
          if (used.has(key) || values.has(q.decimal)) continue;
          used.add(key); values.add(q.decimal); picked.push(q);
          if (values.size === pb) break;
        }
      }
    } else picked = shuffle(variant === 'write' ? pool.filter(q => q.denominator > d) : pool, r).slice(0, count);
    if (picked.length < count) throw Error(config.typeId + ': 분수 후보 부족');
    if (variant === 'match') return picked;
    // 분모 10 의 단계 풀이는 서로 다른 문항이 18개(1~9 × 2가지 분모)뿐이라 전부 쓴다 → seed 마다 순서만 섞는다.
    if (variant === 'steps' && d === 10) return picked;
    return picked.sort((a, b) => a.n - b.n || a.denominator - b.denominator);
  }
  function placeItems(config) {
    const count = config.count, r = rng((Number(config.seed) ^ hash(config.typeId)) >>> 0);
    let pool = [];
    for (const p of [1, 2, 3]) pool.push(...getNumbers(config, p, Math.max(count, 24), 99));
    pool = shuffle(pool, r).slice(0, count).sort((a,b) => a.places - b.places || a.n - b.n);
    return pool.map((q, i) => {
      const [whole, frac] = q.text.split('.'), padded = frac.padEnd(3, '0');
      const place = i % q.places, digit = Number(frac[place]);
      const value = (digit / 10 ** (place + 1)).toFixed(place + 1);
      const terms = [...whole].map((d, j) => Number(d) * 10 ** (whole.length - j - 1)).concat([...frac].map((d,j) => Number(d) / 10 ** (j+1))).filter(Boolean);
      const termTexts = terms.map(x => String(Number(x.toFixed(3))));
      return { ...q, whole, frac, padded, place, digit, value, terms: termTexts, mask: i % termTexts.length };
    });
  }
  function generate(config) {
    const g = config.gen;
    if (g.kind === 'fraction') return fractionItems(config);
    if (g.kind === 'reading') return getNumbers(config, g.places, g.variant === 'match' ? g.bundles * g.perBundle : config.count, 9);
    if (g.kind === 'place') return placeItems(config);
    throw Error(config.typeId + ': 알 수 없는 생성 종류');
  }
  const el = (tag, cls, value) => { const n = document.createElement(tag); if (cls) n.className = cls; if (value != null) n.textContent = String(value); return n; };
  function css() {
    if (document.getElementById('g200-css')) return;
    const s = el('style'); s.id = 'g200-css'; s.textContent = `
      .g200-line{display:flex;align-items:center;justify-content:center;gap:1.5mm;width:100%;height:100%;line-height:1.25;white-space:nowrap}
      .g200-box{display:inline-flex;align-items:center;justify-content:center;min-width:12mm;height:1.5em;border:1px solid #777;padding:0 .5mm}
      .g200-fraction{display:inline-flex;flex-direction:column;text-align:center;line-height:1.05;min-width:8mm;vertical-align:middle}
      .g200-fraction>span:first-child{border-bottom:1px solid #111;padding:0 .5mm}
      .g200-fraction>.g200-numerator{min-width:8mm;width:8mm;height:7mm;border:1px solid #57736a;padding:0;margin-bottom:1mm;box-sizing:border-box}
      .g200-model{display:flex;align-items:center;justify-content:center;height:60%;width:100%;padding-top:5mm;box-sizing:border-box}
      .g200-model svg{width:90%;height:100%;display:block}
      .g200-model+.g200-line{height:40%;gap:.7mm}
      .g200-model+.g200-line .g200-box{min-width:10mm;padding:0}
      .g200-read{letter-spacing:-.03em}
      .g200-place-long{white-space:normal;flex-wrap:wrap;align-content:center;gap:.5mm 1mm}
      .g200-table{width:100%;height:60%;border-collapse:collapse;text-align:center}
      .g200-table td,.g200-table th{border:1px solid #888;padding:.5mm}
      .g200-table th{font-weight:normal;font-size:.7em}
    `; document.head.append(s);
  }
  function box(value) { return el('span', 'g200-box', value == null ? '\u00a0' : value); }
  function frac(n, d) { const node = el('span', 'g200-fraction'); node.append(el('span', '', n), el('span', '', d)); return node; }
  function fractionWithBlank(n, d) { const node = el('span', 'g200-fraction'); const numerator = box(n); numerator.classList.add('g200-numerator'); node.append(numerator, el('span', '', d)); return node; }
  function fractionRender(cell, q, answer, config) {
    css(); const variant = config.gen.variant, line = el('div', 'g200-line');
    if (variant === 'write') {
      const picture = el('div', 'g200-model');
      let tiles = '';
      const square = q.d === 100, columns = 10, rows = square ? 10 : 1, width = square ? 10 : 14.4, height = square ? 10 : 22;
      for (let i = 0; i < q.d; i++) {
        const x = 3 + (i % columns) * width, y = 3 + Math.floor(i / columns) * height;
        tiles += `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${i < q.n ? '#bbb' : '#fff'}" stroke="#777" stroke-width=".3"/>`;
      }
      const vw = 3 * 2 + width * columns, vh = 3 * 2 + height * rows;
      picture.innerHTML = `<svg viewBox="0 0 ${vw} ${vh}"><g>${tiles}</g><rect x="3" y="3" width="${width * columns}" height="${height * rows}" fill="none" stroke="#111"/></svg>`;
      cell.append(picture); line.append(frac(q.n, q.d), el('span', '', '='),
        fractionWithBlank(answer ? q.numerator : null, q.denominator), el('span', '', '='), box(answer ? q.decimal : null));
    } else {
      line.append(frac(q.numerator, q.denominator), el('span', '', '='), fractionWithBlank(answer ? q.n : null, q.d), el('span', '', '='), box(answer ? q.decimal : null));
    }
    cell.append(line);
  }
  function readingRender(cell, q, answer, config) {
    css(); const line = el('div', 'g200-line g200-read');
    if (config.gen.variant === 'words') line.append(el('span', '', q.text), el('span', '', '→'), box(answer ? spoken(q) : null));
    else line.append(el('span', '', spoken(q)), el('span', '', '→'), box(answer ? q.text : null));
    cell.append(line);
  }
  function placeRender(cell, q, answer, config) {
    css(); const line = el('div', 'g200-line'), variant = config.gen.variant;
    if (variant === 'expand' || variant === 'blank') line.classList.add('g200-place-long');
    if (variant === 'table') {
      const table = el('table', 'g200-table'), head = el('tr');
      ['십', '일', '첫째', '둘째', '셋째'].forEach(x => head.append(el('th', '', x)));
      table.append(head); const body = el('tr');
      [q.whole.length > 1 ? q.whole[0] : '0', q.whole.at(-1), ...q.padded].forEach((x, i) => { const td = el('td'); td.append(box(answer ? x : null)); body.append(td); });
      table.append(body); cell.append(el('div', '', q.text), table); return;
    }
    if (variant === 'value') {
      const marked = el('span', '', q.text); const offset = q.text.indexOf('.') + 1 + q.place;
      const chars = [...q.text]; chars[offset] = '<u>' + chars[offset] + '</u>'; marked.innerHTML = chars.join('');
      line.append(marked, el('span', '', '의 값 →'), box(answer ? q.value : null));
    } else if (variant === 'expand') line.append(el('span', '', q.terms.join(' + ') + ' ='), box(answer ? q.text : null));
    else {
      q.terms.forEach((term, i) => { if (i) line.append(el('span', '', '+')); line.append(i === q.mask ? box(answer ? term : null) : el('span', '', term)); });
      line.append(el('span', '', '=' + q.text));
    }
    cell.append(line);
  }
  // 제자리 짝(수평선)이 없는 순서: 정답이 한눈에 드러나지 않게 한다.
  function derange(n, r) {
    for (let t = 0; t < 60; t++) { const o = shuffle([...Array(n).keys()], r); if (o.every((x, i) => x !== i)) return o; }
    return [...Array(n).keys()].map(i => (i + 1) % n);
  }
  function textMm(t) { let w = 0; for (const ch of String(t)) w += /[ㄱ-힝]/.test(ch) ? 4.4 : ch === ' ' ? 1.4 : 2.7; return w; }
  function matchingBuild(config) {
    css(); const g = config.gen, bn = g.bundles, pb = g.perBundle, pairs = generate(config),
      r = rng((Number(config.seed) ^ hash(config.typeId) ^ 0x51ab) >>> 0), items = [];
    const reading = g.kind !== 'fraction';
    const wr = reading ? Math.ceil(Math.max(...pairs.map(q => textMm(spoken(q))))) + 2 : 14;
    for (let b = 0; b < bn; b++) {
      const chunk = pairs.slice(b * pb, b * pb + pb);
      const represented = chunk.map(q => reading ? [q.text, spoken(q)] : [{ frac: q.numerator + '/' + q.denominator }, q.decimal]);
      items.push({ kind: 'bundle', compact: true, compactWl: reading ? 12 : 16, compactWr: wr, compactGap: reading ? 8 : 14,
        caption: '', pairs: represented, order: derange(pb, r), rowsWeight: pb });
    }
    return { items, layout: { cols: bn, rows: pb, count: bn * pb }, pairs: bn * pb };
  }
  function matchingRender(config, item, isAnswer) {
    return root.MatchingSheet.formats['matching-lines'].render(config, item, isAnswer);
  }
  if (root.MatchingSheet && root.MatchingSheet.formats['matching-lines']) {
    root.MatchingSheet.formats[F + 'match'] = { page:'blocks', title:'알맞은 것 연결하기',
      render:matchingRender, build:matchingBuild };
  }
  if (root.Sheet) {
    root.Sheet.register(F + 'fraction-model', fractionRender);
    root.Sheet.register(F + 'fraction-steps', fractionRender);
    root.Sheet.register(F + 'read', readingRender);
    root.Sheet.register(F + 'place', placeRender);
    root.Sheet.register(F + 'place-table', placeRender);
  }
  const old = root.SheetGen.generate;
  root.SheetGen.generate = function (config) {
    return config?.gen?.bundle === '2-0-0' ? generate(config) : old.apply(this, arguments);
  };
  root.SheetCatalog.push(...entries);
  root.Ko200Sheet = { types:entries, generate, matchingBuild };
})(globalThis);
