(function (root) {
  'use strict';
  // Fraction multiplication: all operands come from the existing Worksheets generator.
  const concepts = [
    { id: '1-3-2-0', name: '진분수 × 진분수', legacy: 'fraction-mul-different', forms: ['proper', 'proper'] },
    { id: '1-3-2-1', name: '가분수가 포함된 곱셈', legacy: 'fraction-mul-improper-proper', forms: ['improper', 'proper'] },
    { id: '1-3-2-2', name: '대분수 × 진분수', legacy: 'fraction-mul-mixed-proper', forms: ['mixed', 'proper'] },
    { id: '1-3-2-3', name: '대분수 × 대분수', legacy: 'fraction-mul-mixed-mixed', forms: ['mixed', 'mixed'] },
    { id: '1-3-2-4', name: '세 분수의 곱셈', legacy: 'fraction-mul-different', forms: ['proper', 'proper', 'proper'] }
  ];
  const formats = { horizontal: 'g132-horizontal', steps: 'g132-steps', matching: 'g132-matching-lines', error: 'g132-error-correction' };
  const types = [
    { suffix: 't1', title: '가로식으로 계산하기', format: formats.horizontal, cols: 3, rows: 8, fontPt: 14, workLines: 1, instruction: '계산하여 답을 기약분수나 대분수로 쓰세요.' },
    { suffix: 't2', title: '단계별 계산의 빈칸 채우기', format: formats.steps, cols: 2, rows: 9, fontPt: 14, workLines: 1, instruction: '빈칸에 알맞은 수를 써서 풀이를 완성하세요.' },
    { suffix: 't3', title: '계산 결과와 같은 분수 연결하기', format: formats.matching, cols: 6, rows: 4, fontPt: 12, workLines: 0, instruction: '서로 알맞은 것끼리 선으로 이으세요.' },
    { suffix: 't4', title: '잘못된 계산 과정 고치기', format: formats.error, cols: 3, rows: 4, fontPt: 12, workLines: 2, instruction: '잘못 계산한 곳을 찾아 바르게 고쳐 쓰세요.' }
  ];
  const mine = new Set(Object.values(formats));
  const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const gcd = (a, b) => b ? gcd(b, a % b) : Math.abs(a);
  function random(seed) {
    let state = (Number(seed) >>> 0) || 1;
    return (lo, hi) => {
      state += 0x6D2B79F5;
      let t = state;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return lo + Math.floor(((t ^ t >>> 14) >>> 0) / 4294967296 * (hi - lo + 1));
    };
  }
  function shuffle(items, rnd) {
    const out = items.slice();
    for (let i = out.length - 1; i > 0; i--) { const j = rnd(0, i); [out[i], out[j]] = [out[j], out[i]]; }
    return out;
  }
  function form(text) {
    const value = String(text);
    if (/^\d+ \d+\/\d+$/.test(value)) return 'mixed';
    if (!/^\d+\/\d+$/.test(value)) return null;
    const [n, d] = value.split('/').map(Number);
    return n < d ? 'proper' : 'improper';
  }
  function valid(text, expected) {
    if (form(text) !== expected) return false;
    const [n, d] = root.Worksheets.rational(text);
    if (!Number.isInteger(n) || !Number.isInteger(d) || d < 2 || d > 12) return false;
    if (expected === 'proper') return n >= 1 && n < d;
    if (expected === 'improper') return n >= d && n <= 10 * d - 1;
    const match = String(text).match(/^(\d+) (\d+)\/(\d+)$/);
    return !!match && +match[1] >= 1 && +match[1] <= 9 && +match[2] >= 1 && +match[2] < +match[3];
  }
  function display(n, d) {
    const reduced = String(root.Worksheets.fraction(n, d));
    const pair = reduced.split('/').map(Number);
    if (pair.length !== 2) return reduced;
    const whole = Math.floor(pair[0] / pair[1]), rem = pair[0] % pair[1];
    return whole && rem ? `${whole} ${rem}/${pair[1]}` : reduced;
  }
  function make(operands, concept, original) {
    if (operands.length !== concept.forms.length || !operands.every((x, i) => valid(x, concept.forms[i]))) return null;
    let n = 1, d = 1;
    for (const operand of operands) { const pair = root.Worksheets.rational(operand); n *= pair[0]; d *= pair[1]; }
    if (n <= 0 || d <= 0) return null;
    const reduced = String(root.Worksheets.fraction(n, d));
    if (original && reduced !== String(root.Worksheets.fraction(...root.Worksheets.rational(original.answer)))) return null;
    const numerators = operands.map(x => root.Worksheets.rational(x)[0]);
    const denominators = operands.map(x => root.Worksheets.rational(x)[1]);
    return { operands, key: operands.join('×'), n, d, numerators, denominators,
      product: `${n}/${d}`, reduced, answer: display(n, d), valueKey: reduced,
      easy: operands.some(x => {
        const mixed = x.match(/^\d+ (\d+)\/\d+$/);
        return mixed ? +mixed[1] === 1 : root.Worksheets.rational(x)[0] === 1;
      }),
      rank: operands.reduce((sum, x) => sum + root.Worksheets.rational(x)[0] + root.Worksheets.rational(x)[1], 0) };
  }
  function source(concept, seed, count, predicate) {
    const out = [], seen = new Set();
    for (let round = 0; out.length < count && round < 1500; round++) {
      const s = (Number(seed) + Math.imul(round, 2654435761)) >>> 0;
      const rows = root.Worksheets.generate(concept.legacy, s, 24);
      const third = concept.forms.length === 3 ? root.Worksheets.generate(concept.legacy, (s ^ 0x9E3779B9) >>> 0, 24) : null;
      rows.forEach((row, index) => {
        if (out.length >= count || row.op !== '×') return;
        const operands = third ? [String(row.a), String(row.b), String(third[index].a)] : [String(row.a), String(row.b)];
        const q = make(operands, concept, third ? null : row);
        if (!q || q.easy || seen.has(q.key) || (predicate && !predicate(q))) return;
        seen.add(q.key); out.push(q);
      });
    }
    if (out.length < count) throw Error(`${concept.name}: 조건에 맞는 고유 문항 ${count}개 중 ${out.length}개만 생성했습니다.`);
    return out;
  }
  const byDifficulty = (a, b) => a.rank - b.rank || a.key.localeCompare(b.key);
  function chain(q) {
    const tokens = [{ html: expr(q) }];
    if (q.operands.some(x => form(x) === 'mixed')) tokens.push({ value: q.numerators.map((n, i) => `${n}/${q.denominators[i]}`).join(' × '), expression: true });
    tokens.push({ value: q.product });
    if (q.reduced !== q.product) tokens.push({ value: q.reduced });
    if (q.answer !== q.reduced) tokens.push({ value: q.answer });
    return tokens;
  }
  function generate(config) {
    const concept = concepts.find(x => x.id === config.gen?.concept);
    if (!concept) throw Error(`알 수 없는 분수 곱셈 개념: ${config.gen?.concept}`);
    const count = config.count;
    if (config.format === formats.horizontal) return source(concept, config.seed, count).sort(byDifficulty);
    if (config.format === formats.steps) {
      const rnd = random(Number(config.seed) ^ 0x2345ABCD);
      return source(concept, config.seed, count, q => chain(q).length >= 3).sort(byDifficulty).map(q => {
        const tokens = chain(q), values = tokens.map((t, i) => t.value !== undefined ? i : -1).filter(i => i >= 0);
        const masked = [values[values.length - 1]];
        if (values.length > 2 && rnd(0, 1)) masked.push(values[0]);
        return { q, tokens, masked };
      });
    }
    if (config.format === formats.matching) {
      const pool = source(concept, config.seed, count * 5).sort(byDifficulty);
      const groups = Array.from({ length: config.cols }, () => []), used = new Set();
      for (const q of pool) {
        if (groups.every(g => g.length === config.rows)) break;
        const group = groups.find(g => g.length < config.rows && !g.some(x => x.valueKey === q.valueKey));
        if (group && !used.has(q.key)) { group.push(q); used.add(q.key); }
      }
      if (groups.some(g => g.length !== config.rows)) throw Error(`${concept.name}: 선 잇기 문항 부족`);
      return groups.map((pairs, i) => ({ kind: 'bundle', caption: '', pairs, rowsWeight: config.rows }));
    }
    if (config.format === formats.error) {
      const kinds = [
        { label: '분자와 분모를 교차하여 곱함', need: q => true,
          wrong: q => `${q.numerators[0] * q.denominators[1] * q.numerators.slice(2).reduce((n, v) => n * v, 1)}/${q.denominators[0] * q.numerators[1] * q.denominators.slice(2).reduce((n, v) => n * v, 1)}` },
        { label: '대분수를 가분수로 바꾸지 않음', need: q => q.operands.some(x => form(x) === 'mixed'),
          wrong: q => { const nums = q.operands.map(x => { const m = x.match(/^(\d+) (\d+)\/(\d+)$/); return m ? +m[2] : root.Worksheets.rational(x)[0]; }); return `${nums.reduce((n, v) => n * v, 1)}/${q.d}`; } },
        { label: '약분하지 않음', need: q => gcd(q.n, q.d) > 1,
          wrong: q => q.product }
      ].filter(kind => concept.forms.includes('mixed') || kind.label !== '대분수를 가분수로 바꾸지 않음');
      const pools = kinds.map((kind, i) => source(concept, (Number(config.seed) + i * 104729) >>> 0, count * 3, q => kind.need(q) && kind.wrong(q) !== q.reduced));
      const seen = new Set(), items = [];
      for (let i = 0; i < count; i++) {
        const kind = kinds[i % kinds.length];
        const q = pools[i % kinds.length].find(x => !seen.has(x.key));
        if (!q) throw Error(`${concept.name}: 오류 고치기 문항 부족`);
        seen.add(q.key); items.push({ q, kind });
      }
      return items.sort((a, b) => byDifficulty(a.q, b.q));
    }
    throw Error(`알 수 없는 서식: ${config.format}`);
  }
  function fracHTML(value) {
    const text = String(value);
    const mixed = text.match(/^(\d+) (\d+)\/(\d+)$/);
    if (mixed) return `<span class="g132-m"><span>${esc(mixed[1])}</span>${fracHTML(`${mixed[2]}/${mixed[3]}`)}</span>`;
    const fraction = text.match(/^(\d+)\/(\d+)$/);
    return fraction ? `<span class="g132-frac"><span>${esc(fraction[1])}</span><span>${esc(fraction[2])}</span></span>` : esc(text);
  }
  const el = (tag, cls, html) => { const x = document.createElement(tag); if (cls) x.className = cls; if (html !== undefined) x.innerHTML = html; return x; };
  const OP = '<span class="g132-op">×</span>', EQ = '<span class="g132-op">=</span>';
  const expr = q => q.operands.map(fracHTML).join(OP);
  /** 값 하나를 그림으로. 곱셈식(expression)은 분수끼리 × 로 잇는다. */
  const valueHTML = t => t.expression ? String(t.value).split(' × ').map(fracHTML).join(OP) : fracHTML(t.value);
  const resultValue = answerText => {
    if (/^\d+\s+\d+\/\d+$/.test(answerText)) return { mixed: answerText };
    return String(answerText).includes('/') ? { frac: answerText } : answerText;
  };
  /** 단계(tokens)를 한두 줄로 나눈다: 3개 이하는 한 줄, 그 이상은 앞 두 개 / 나머지. */
  function stepRows(tokens) { const all = tokens.map((t, i) => i); return tokens.length <= 3 ? [all] : [all.slice(0, 2), all.slice(2)]; }
  function stepHTML(item, answer, tokenIndex) {
    const t = item.tokens[tokenIndex];
    if (t.html !== undefined) return `<span class="g132-step-token">${t.html}</span>`;
    if (!item.masked.includes(tokenIndex)) return `<span class="g132-step-token">${EQ}${valueHTML(t)}</span>`;
    return `<span class="g132-step-token">${EQ}${answer ? `<span class="g132-answer">${valueHTML(t)}</span>` : `<span class="g132-blank${t.expression ? ' g132-blank-wide' : ''}"></span>`}</span>`;
  }
  function css() {
    if (document.getElementById('g132-style')) return;
    const style = document.createElement('style'); style.id = 'g132-style';
    style.textContent = `.sheet-page:has(.g132-line,.g132-frac) .sheet-head{gap:2mm;font-size:8pt}.sheet-page:has(.g132-line,.g132-frac) .sheet-title{font-size:8pt;letter-spacing:-.035em}.sheet-page:has(.g132-line,.g132-frac) .sheet-field{min-width:0}`
      + `.g132-frac{display:inline-flex;flex-direction:column;vertical-align:middle;text-align:center;line-height:1.05;min-width:1.25em;font-variant-numeric:tabular-nums}.g132-frac>span:first-child{border-bottom:1px solid #111;padding:0 .12em .04em}.g132-frac>span:last-child{padding:.04em .12em 0}`
      + `.g132-m{display:inline-flex;align-items:center;vertical-align:middle;gap:.12em}.g132-op{margin:0 .3em}`
      + `.g132-line{display:flex;align-items:center;justify-content:center;white-space:nowrap;line-height:1.2}.g132-rows{display:flex;flex-direction:column;align-items:center;gap:1.2mm}`
      + `.g132-blank{display:inline-flex;align-items:center;justify-content:center;min-width:15mm;height:14mm;border:1px solid #57736a;box-sizing:border-box;vertical-align:middle;flex:none}.g132-blank-wide{min-width:24mm}`
      + `.g132-work{margin-top:1.6mm;min-height:4.6mm;line-height:1.2;white-space:nowrap;border-bottom:1px dotted #bbb;align-self:stretch}.g132-work.g132-ink{font-size:.75em;color:#d71f10;border-bottom:0;min-height:0;display:flex;justify-content:center;align-items:center}`
      + `.g132-step-token{display:inline-flex;align-items:center;white-space:nowrap}.g132-answer{color:#d71f10}`
      + `.g132-fix{display:flex;flex-direction:column;align-items:center;align-self:stretch;height:100%}.g132-fix>.g132-line{font-size:14pt}.g132-note{font-size:9pt;color:#555;margin-top:1mm;text-align:center}`
      + `.g132-fixbox{align-self:stretch;flex:1;min-height:12mm;margin:1.5mm 1mm 0;border:1px dashed #bbb;border-radius:1mm;padding:1.2mm;display:flex;align-items:center;justify-content:center}.g132-solved{display:flex;flex-direction:column;align-items:center;gap:1mm;font-size:11.5pt;color:#d71f10}.g132-solved .g132-frac>span:first-child{border-bottom-color:#d71f10}`;
    document.head.append(style);
  }
  function render(cell, item, answer, config) {
    css();
    if (config.format === formats.horizontal) {
      cell.append(el('div', 'g132-line', `${expr(item)}${EQ}${answer ? `<span class="g132-answer">${fracHTML(item.answer)}</span>` : '<span class="g132-blank"></span>'}`));
      const num = item.numerators.join(' × ');
      cell.append(el('div', 'g132-work' + (answer ? ' g132-ink' : ''), answer ? `<span class="g132-frac"><span>${esc(num)}</span><span>${esc(item.denominators.join(' × '))}</span></span>${EQ}${fracHTML(item.product)}${item.answer !== item.product ? EQ + fracHTML(item.answer) : ''}` : ''));
    } else if (config.format === formats.steps) {
      const rows = stepRows(item.tokens);
      cell.append(el('div', 'g132-rows', rows.map(r => `<div class="g132-line">${r.map(i => stepHTML(item, answer, i)).join('')}</div>`).join('')));
    } else if (config.format === formats.error) {
      const { q, kind } = item, box = el('div', 'g132-fix');
      box.append(el('div', 'g132-line', `${expr(q)}${EQ}${fracHTML(kind.wrong(q))}`));
      let solved = '';
      if (answer) {
        const toks = chain(q).map(t => t.html !== undefined ? `<span class="g132-step-token">${t.html}</span>` : `<span class="g132-step-token">${EQ}${valueHTML(t)}</span>`);
        solved = `<div class="g132-solved">${toks.length <= 3 ? `<div class="g132-line">${toks.join('')}</div>` : `<div class="g132-line">${toks.slice(0, 2).join('')}</div><div class="g132-line">${toks.slice(2).join('')}</div>`}</div>`;
      }
      box.append(el('div', 'g132-fixbox', solved));
      cell.append(box);
    }
  }
  function renderBundle(config, item, answer) {
    css();
    return root.MatchingSheet.formats['matching-lines'].render(config, item, answer);
  }
  function buildMatching(config) {
    css();
    const rnd = random(Number(config.seed) ^ 0x9E3779B9);
    const items = generate(config).map(item => {
      const order = shuffle(item.pairs.map((_, i) => i), rnd);
      for (let i = 0; i < order.length; i++) {            // 제자리 짝(수평선)은 정답을 드러내므로 없앤다
        if (order[i] !== i) continue;
        const j = (i + 1) % order.length; [order[i], order[j]] = [order[j], order[i]];
      }
      return { kind: 'bundle', caption: '', rowsWeight: item.pairs.length, order, compact: true, compactWl: 34, compactWr: 14, compactGap: 8,
        pairs: item.pairs.map(q => [{ html: expr(q) }, resultValue(q.answer)]) };
    });
    const total = items.reduce((sum, item) => sum + item.pairs.length, 0);
    return { items, layout: { cols: items.length, rows: items[0].pairs.length, count: total }, pairs: total };
  }
  const baseGenerate = root.SheetGen.generate;
  root.SheetGen.generate = function (config) { return config && mine.has(config.format) ? generate(config) : baseGenerate.apply(this, arguments); };
  for (const format of [formats.horizontal, formats.steps, formats.error]) root.Sheet.register(format, render);
  root.MatchingSheet.formats[formats.matching] = { page: 'blocks', title: types[2].title, build: buildMatching, render: renderBundle };
  for (const concept of concepts) for (const type of types) root.SheetCatalog.push({
    typeId: `${concept.id}-${type.suffix}`, conceptId: concept.id,
    title: `${concept.name} — ${type.title}`, instruction: type.instruction, format: type.format,
    cols: type.cols, rows: (type.suffix === 't2' && /-[04]$/.test(concept.id)) ? 12 : type.rows, count: type.cols * ((type.suffix === 't2' && /-[04]$/.test(concept.id)) ? 12 : type.rows), fontPt: type.suffix === 't2' && /-[04]$/.test(concept.id) ? 18 : type.fontPt, workLines: type.workLines,
    seed: 20261001, autoFit: false, maxProblems: 24, gen: { concept: concept.id, legacyId: concept.legacy }
  });
  root.Training132 = { concepts, types, formats, generate, make };
})(globalThis);
