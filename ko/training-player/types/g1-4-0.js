/* 묶음 1-4-0: 나눗셈 준비. 수치는 기존 Worksheets/DrillEngine 생성기에서 가져온다. */
(function (root) {
  'use strict';
  const prefix = 'g140-';
  const concepts = {
    '1-4-0-0': '분수를 똑같이 나누기',
    '1-4-0-1': '분수 안에 단위분수가 몇 개 있는지 알아보기',
    '1-4-0-2': '역수의 뜻',
    '1-4-0-3': '자연수·대분수를 가분수로 바꾸어 준비하기'
  };
  const defs = [
    ['0-t1', '분수 그림을 같은 양으로 나누기', 'visual', 3, 5, '그림의 색칠한 부분을 똑같이 나누고 한 몫을 쓰세요.'],
    ['0-t2', '나눈 한 몫을 분수로 쓰기', 'short', 3, 14, '분수를 똑같이 나눈 한 몫을 쓰세요.'],
    ['0-t3', '그림과 나눗셈식 연결하기', 'match', 3, 6, '그림과 알맞은 나눗셈식을 이으세요.'],
    ['1-t1', '분수 안의 단위분수 개수 세기', 'short', 3, 14, '분수 안에 단위분수가 몇 개 있는지 쓰세요.'],
    ['1-t2', '분수 띠를 묶어 몫 쓰기', 'visual', 3, 5, '색칠한 단위분수를 세어 몫을 쓰세요.'],
    ['1-t3', '그림을 나눗셈식으로 나타내기', 'visual', 3, 5, '그림을 보고 나눗셈식을 쓰세요.'],
    ['2-t1', '서로 역수인 두 수 연결하기', 'match', 3, 6, '서로 역수인 두 수를 이으세요.'],
    ['2-t2', '곱이 1이 되는 빈칸 채우기', 'step', 2, 10, '곱이 1이 되도록 빈칸을 채우세요.'],
    ['2-t3', '자연수와 분수의 역수 쓰기', 'short', 3, 14, '주어진 수의 역수를 쓰세요.'],
    ['3-t1', '그림에서 단위분수 개수 세기', 'visual', 3, 5, '그림에서 단위분수의 개수를 쓰세요.'],
    ['3-t2', '자연수 부분을 바꾸어 가분수 완성하기', 'step', 2, 10, '자연수 부분을 분수로 바꾸어 가분수를 완성하세요.'],
    ['3-t3', '대분수와 같은 가분수 연결하기', 'match', 3, 6, '값이 같은 대분수와 가분수를 이으세요.'],
    ['3-t4', '변환 과정의 빈칸 채우기', 'step', 2, 10, '가분수로 바꾸는 과정의 빈칸을 채우세요.']
  ];
  const gcd = (a, b) => b ? gcd(b, a % b) : Math.abs(a);
  const esc = x => String(x).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const rand = seed => { let s = (Number(seed) >>> 0) || 1; return (lo, hi) => { s += 0x6d2b79f5; let t = s; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return lo + Math.floor(((t ^ t >>> 14) >>> 0) / 4294967296 * (hi - lo + 1)); }; };
  function shuffle(a, r) { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = r(0, i); [b[i], b[j]] = [b[j], b[i]]; } return b; }
  const frac = (n, d) => `${n}/${d}`;
  function reduced(n, d) { const g = gcd(n, d); return d / g === 1 ? String(n / g) : frac(n / g, d / g); }
  function parse(s) { const m = String(s).match(/^(?:(\d+) )?(\d+)\/(\d+)$/); return m ? { w: +(m[1] || 0), n: +m[2], d: +m[3] } : null; }
  function legacy(id, seed, count, accept) {
    const generate = root.FractionLegacyGenerate || root.Worksheets?.generate;
    if (typeof generate !== 'function') throw Error('기존 Worksheets.generate가 필요합니다.');
    const found = [], seen = new Set();
    for (let batch = 0; batch < 900 && found.length < count; batch++) {
      const rows = generate(id, (Number(seed) + Math.imul(batch, 104729)) >>> 0, 32);
      for (const row of rows) {
        const q = accept(row); if (!q || seen.has(q.key)) continue;
        seen.add(q.key); found.push(q); if (found.length === count) break;
      }
    }
    if (found.length < count) throw Error(`${id}: 조건에 맞는 문항 ${found.length}/${count}`);
    return found.sort((a, b) => a.rank - b.rank || a.key.localeCompare(b.key));
  }
  function skill(seed, count, accept) {
    if (typeof root.DrillEngine?.skill !== 'function') throw Error('기존 DrillEngine.skill이 필요합니다.');
    const r = rand(seed), out = [], seen = new Set();
    for (let i = 0; i < 40000 && out.length < count; i++) {
      const row = root.DrillEngine.skill('mixed', r), m = row.prompt.match(/^(\d+)과 (\d+)\/(\d+)/);
      if (!m) continue;
      const w = +m[1], n = +m[2], d = +m[3], top = w * d + n;
      if (w > 9 || d > 12 || gcd(n, d) !== 1 || row.answer !== frac(top, d)) continue;
      const q = { w, n, d, top, key: `${w} ${n}/${d}`, rank: top + d, kind: 'convert' };
      if (!accept(q) || seen.has(q.key)) continue;
      seen.add(q.key); out.push(q);
    }
    if (out.length < count) throw Error(`기존 분수 변환 문항 ${out.length}/${count}`);
    return out.sort((a, b) => a.rank - b.rank || a.key.localeCompare(b.key));
  }
  function makeBase(config) {
    const id = config.typeId, group = +id[6], type = +id.match(/-t(\d+)$/)[1], count = config.count;
    const salt = (Number(config.seed) + group * 997 + type * 104729) >>> 0;
    if (group === 0) return legacy('fraction-div-proper-whole', salt, count, row => {
      const a = parse(row.a), w = +row.b;
      if (!a || a.w || !(a.n >= 2 && a.n < a.d && a.d <= 12) || !(w >= 2 && w <= a.n) || a.n % w || gcd(a.n, a.d) !== 1) return null;
      const answer = reduced(a.n, a.d * w);
      if (row.answer !== answer) return null;
      return { n: a.n, d: a.d, w, answer, key: `${a.n}/${a.d}÷${w}`, rank: a.d + a.n + w, kind: 'divide' };
    });
    if (group === 1) return legacy('fraction-div-same', salt, count, row => {
      const a = parse(row.a), b = parse(row.b);
      if (!a || !b || a.w || b.w || a.d !== b.d || b.n !== 1 || a.n < 2 || a.n >= a.d || a.d > 12) return null;
      if (row.answer !== String(a.n)) return null;
      return { n: a.n, d: a.d, answer: String(a.n), key: `${a.n}/${a.d}÷1/${a.d}`, rank: a.d + a.n, kind: 'unit' };
    });
    if (group === 2) return legacy('fraction-div-same', salt, count, row => {
      const b = parse(row.b);
      if (!b || b.w || b.n < 1 || b.n >= b.d || b.d > 12 || gcd(b.n, b.d) !== 1) return null;
      const value = type === 3 && b.n === 1 ? String(b.d) : frac(b.n, b.d);
      const p = parse(value), answer = p ? reduced(p.d, p.n) : frac(1, +value);
      return { value, answer, n: b.n, d: b.d, key: value, rank: b.d + b.n, kind: 'reciprocal' };
    });
    return skill(salt, count, q => type !== 1 || (q.w <= 3 && q.d <= 8));
  }
  function make(config) { return makeBase(config); }
  function node(cls, html) { const el = document.createElement('div'); el.className = cls; el.innerHTML = html; return el; }
  const F = s => {
    const m = String(s).match(/^(?:(\d+) )?(\d+)\/(\d+)$/);
    if (!m) return esc(s);
    const f = `<span class="g140-frac"><span>${m[2]}</span><span>${m[3]}</span></span>`;
    return m[1] ? `<span class="g140-m"><span>${esc(m[1])}</span>${f}</span>` : f;
  };
  const T = s => `<span>${s}</span>`;
  const line = (...parts) => `<div class="g140-line">${parts.join('')}</div>`;
  /** 쓰는 칸: 문제지에서는 빈 상자, 정답지에서는 새로 쓴 값만 빨강. 분수 답은 세로로 긴 상자. */
  const box = (content, answer, tall) => `<span class="g140-box${tall ? ' g140-tall' : ''}">${answer ? `<span class="g140-answer">${content}</span>` : ''}</span>`;
  const numBox = (value, answer) => box(esc(value), answer, false);
  const fracBox = (text, answer) => box(F(text), answer, /\//.test(String(text)));
  function strip(n, d, marked) {
    let html = '<span class="g140-strip">';
    for (let i = 0; i < d; i++) html += `<span class="${i < n ? 'on' : ''}${marked && i < n && i % marked === 0 ? ' start' : ''}"></span>`;
    return html + '</span>';
  }
  function body(q, group, type, answer) {
    const A = text => fracBox(text, answer);
    const N = value => numBox(value, answer);
    if (group === 0) {
      const expr = F(frac(q.n, q.d)) + T('÷') + T(q.w);
      if (type === 1) return strip(q.n, q.d, answer ? q.n / q.w : 0) + line(expr, T('='), A(q.answer));
      if (type === 2) return line(expr, T('='), A(q.answer));
      return strip(q.n, q.d, q.n / q.w) + line(T('한 몫'), A(q.answer));
    }
    if (group === 1) {
      if (type === 1) return line(F(frac(q.n, q.d)), T('안에'), F(frac(1, q.d)), T('은'), N(q.answer), T('개'));
      if (type === 2) return strip(q.n, q.d, 1) + line(F(frac(1, q.d)), T('씩 묶으면'), N(q.answer), T('묶음'));
      return strip(q.n, q.d, 1) + line(A(frac(q.n, q.d)), T('÷'), A(frac(1, q.d)), T('='), N(q.answer));
    }
    if (group === 2) {
      if (type === 2) return line(F(q.value), T('×'), A(q.answer), T('= 1'));
      return line(F(q.value), T('의 역수:'), A(q.answer));
    }
    const mixed = `${q.w} ${q.n}/${q.d}`, improper = frac(q.top, q.d);
    if (type === 1) return `<div class="g140-strips">${strip(q.d, q.d, 1).repeat(q.w)}${strip(q.n, q.d, 1)}</div>` + line(F(mixed), T('='), F(frac(1, q.d)), T('이'), N(q.top), T('개'));
    if (type === 2) return line(T(q.w), T('='), A(frac(q.w * q.d, q.d))) + line(F(mixed), T('='), A(improper));
    if (type === 3) return line(F(mixed), T('='), A(improper));
    const numer = `<span class="g140-frac"><span>${q.w} × ${q.d} + ${q.n}</span><span>${q.d}</span></span>`;
    const half = `<span class="g140-frac"><span>${answer ? `<span class="g140-answer">${q.top}</span>` : '<span class="g140-box"></span>'}</span><span>${q.d}</span></span>`;
    return line(F(mixed), T('='), numer) + line(T('='), half);
  }
  function render(cell, q, answer, config) {
    const group = +config.typeId[6], type = +config.typeId.match(/-t(\d+)$/)[1];
    cell.append(node('g140-item', body(q, group, type, answer)));
  }
  /* 선 잇기: 세트(묶음)마다 같은 짝이 겹치지 않게 5개씩 담고, 공용 compact 2단 서식을 쓴다. */
  function matchPairs(config) {
    const group = +config.typeId[6], bundles = config.cols, per = config.rows, need = bundles * per;
    let rows = null;
    for (const times of [4, 3, 2, 1]) {
      try { rows = makeBase({ ...config, count: need * times }); break; } catch (error) { rows = null; }
    }
    if (!rows) throw Error(config.typeId + ': 연결할 문항을 만들지 못했습니다.');
    const dk = q => group === 0 ? `${q.n}/${q.d}` : group === 2 ? q.value + '|' + q.answer : `${q.w} ${q.n}/${q.d}`;
    const sets = Array.from({ length: bundles }, () => []);
    const r = rand((Number(config.seed) ^ 0x9e3779b9) >>> 0);
    for (const q of shuffle(rows, r)) {
      const target = sets.find(s => s.length < per && !s.some(x => dk(x) === dk(q) || (group === 2 && x.answer === q.answer)));
      if (target) target.push(q);
      if (sets.every(s => s.length === per)) break;
    }
    if (sets.some(s => s.length !== per)) throw Error(config.typeId + ': 세트를 채우지 못했습니다.');
    return sets.map(s => s.sort((a, b) => a.rank - b.rank || a.key.localeCompare(b.key)));
  }
  function buildMatch(config) {
    const group = +config.typeId[6];
    const r = rand((Number(config.seed) ^ 0x51f82d) >>> 0);
    const items = matchPairs(config).map(set => {
      const order = shuffle(set.map((_, i) => i), r);
      for (let i = 0; i < order.length; i++) {            // 제자리 짝(수평선)은 정답을 드러내므로 없앤다
        if (order[i] !== i) continue;
        const j = (i + 1) % order.length; const t = order[i]; order[i] = order[j]; order[j] = t;
      }
      return { kind: 'bundle', caption: '', rowsWeight: set.length, order, compact: true,
        compactWl: group === 0 ? 34 : 16, compactWr: group === 0 ? 24 : 16, compactGap: group === 0 ? 8 : 18,
        pairs: set.map(q => [
          { html: group === 0 ? strip(q.n, q.d, q.n / q.w) : group === 2 ? F(q.value) : F(`${q.w} ${q.n}/${q.d}`) },
          { html: group === 0 ? `<span class="g140-line">${F(frac(q.n, q.d))}${T('÷')}${T(q.w)}</span>` : group === 2 ? F(q.answer) : F(frac(q.top, q.d)) }]) };
    });
    return { items, layout: { cols: items.length, rows: items[0].pairs.length, count: items.length * items[0].pairs.length }, pairs: items.length * items[0].pairs.length };
  }
  const style = document.createElement('style'); style.id = 'g140-style';
  style.textContent = `.sheet-page:has(.g140-item,.g140-line) .sheet-head{gap:2mm}.sheet-page:has(.g140-item,.g140-line) .sheet-title{font-size:9pt}`
    + `.g140-item{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2.2mm;width:100%}`
    + `.g140-line{display:flex;align-items:center;justify-content:center;white-space:nowrap;gap:.35em;line-height:1.2}`
    + `.g140-frac{display:inline-flex;vertical-align:middle;flex-direction:column;text-align:center;line-height:1.05;min-width:1.15em}.g140-frac>span:first-child{border-bottom:1px solid #111;padding:0 .1em .04em}.g140-frac>span:last-child{padding:.04em .1em 0}`
    + `.g140-m{display:inline-flex;align-items:center;gap:.12em}`
    + `.g140-box{display:inline-flex;align-items:center;justify-content:center;min-width:1.7em;height:1.5em;border:1px solid #999;border-radius:1px;vertical-align:middle;background:#fff}.g140-tall{min-width:1.9em;height:2.6em}`
    + `.g140-answer{color:#d71f10}`
    + `.g140-strip{display:flex;width:82%;height:13mm;border:1px solid #666}.g140-strip>span{flex:1;border-right:1px solid #999}.g140-strip>span:last-child{border:0}.g140-strip .on{background:#c4dfb8}.g140-strip .start{border-left:2px solid #333}`
    + `.g140-strips{display:flex;flex-direction:column;gap:1mm;width:80%}.g140-strips .g140-strip{width:100%;height:6.5mm}`
    + `.mt-text .g140-strip{width:30mm;height:6mm}.mt-text .g140-frac{min-width:1em}`;
  document.head.append(style);
  const original = root.SheetGen.generate;
  root.SheetGen.generate = function (config) { return config?.format?.startsWith(prefix) && config.format !== prefix + 'match' ? make(config) : original.apply(this, arguments); };
  for (const name of ['visual', 'short', 'step']) root.Sheet.register(prefix + name, render);
  root.MatchingSheet.formats[prefix + 'match'] = { page: 'blocks', title: '선 잇기', build: buildMatch,
    render: (config, item, isAnswer) => root.MatchingSheet.formats['matching-lines'].render(config, item, isAnswer) };
  /* 유형별 배치: [표지, 제목, 서식, 열, 줄, 지시문, 글자 pt] — 한 장 최대 24문제(분수 단원) */
  const layouts = { 'visual': [3, 5, 17], 'short': [3, 8, 18], 'match': [4, 5, 12], 'step': [3, 8, 16] };
  for (const [suffix, title, format, cols0, rows0, instruction] of defs) {
    const conceptId = '1-4-0-' + suffix[0];
    const lay = layouts[format].slice(); if (suffix === '1-t1') lay[2] = 20; if (suffix === '0-t2' || suffix === '2-t2' || suffix === '2-t3') lay[2] = 23; if (suffix === '3-t2') lay[2] = 12.5; if (suffix === '3-t4') lay[2] = 14;
    let cols = lay[0], rows = lay[1];
    if (suffix === '1-t1') { cols = 2; rows = 12; lay[2] = 20; }   // 한 줄 식은 2단 × 12줄로 칸을 넓혀 글자를 키운다
    root.SheetCatalog.push({ typeId: conceptId + suffix.slice(1), conceptId, title, instruction,
      format: prefix + format, cols, rows, count: cols * rows, fontPt: lay[2], seed: 20261001,
      gen: { conceptId, source: suffix[0] === '3' ? 'DrillEngine.skill(mixed)' : 'Worksheets.generate(fraction-div-*)' }, autoFit: false, maxProblems: 24 });
  }
})(globalThis);
