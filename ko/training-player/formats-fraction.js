(function (root) {
  'use strict';

  // The number pools come from the site's Worksheets and DrillEngine generators.
  const gcd = (a, b) => b ? gcd(b, a % b) : Math.abs(a);
  const lcm = (a, b) => a / gcd(a, b) * b;
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const random = seed => {
    let s = seed >>> 0;
    return (a, b) => {
      s += 0x6d2b79f5;
      let t = s;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return a + Math.floor(((t ^ t >>> 14) >>> 0) / 4294967296 * (b - a + 1));
    };
  };
  const rational = value => root.Worksheets.rational(value);
  function normalized(n, d) {
    if (d < 0) { n = -n; d = -d; }
    const divisor = gcd(Math.abs(n), d);
    return [n / divisor, d / divisor];
  }
  function answer(n, d) {
    [n, d] = normalized(n, d);
    if (d === 1 || n === 0) return String(n);
    const whole = Math.trunc(n / d), rem = Math.abs(n % d);
    return whole && rem ? `${whole} ${rem}/${d}` : `${n}/${d}`;
  }
  function frac(value) {
    const match = String(value).trim().match(/^(-?\d+)(?:\s+(\d+)\/(\d+))?$/);
    if (match) {
      if (!match[2]) return `<span class="sf-whole">${esc(match[1])}</span>`;
      return `<span class="sf-mixed"><span class="sf-whole">${esc(match[1])}</span>${frac(`${match[2]}/${match[3]}`)}</span>`;
    }
    const parts = String(value).split('/');
    if (parts.length !== 2) return esc(value);
    return `<span class="sf-frac"><span>${esc(parts[0])}</span><span>${esc(parts[1])}</span></span>`;
  }
  function sourceRows(id, seed, count, filter) {
    const generator = root.FractionLegacyGenerate || root.Worksheets?.generate;
    if (!generator) throw Error('Worksheets.generate is required for fraction sheets');
    const out = [], seen = new Set();
    for (let batch = 0; out.length < count && batch < 150; batch++) {
      const rows = generator(id, (seed + Math.imul(batch, 2654435761)) >>> 0, Math.max(count * 2, 64));
      for (const q of rows) {
        const key = `${q.a}|${q.op}|${q.b}`;
        if (seen.has(key) || filter && !filter(q)) continue;
        seen.add(key); out.push(q);
        if (out.length === count) break;
      }
    }
    if (out.length !== count) throw Error(`Insufficient fraction questions: ${id} (${out.length}/${count})`);
    return out;
  }
  function skillRows(skill, seed, count) {
    if (!root.DrillEngine || !root.DrillEngine.skill) throw Error('DrillEngine.skill is required for fraction conversion sheets');
    const r = random(seed), out = [], seen = new Set();
    for (let attempts = 0; out.length < count && attempts < 30000; attempts++) {
      const q = root.DrillEngine.skill(skill, r);
      if (seen.has(q.prompt)) continue;
      seen.add(q.prompt); out.push(q);
    }
    if (out.length !== count) throw Error(`Insufficient fraction skill questions: ${skill}`);
    return out;
  }
  function asConversion(q, skill) {
    const m = q.prompt.match(/(\d+)과\s+(\d+)\/(\d+)|(\d+)\/(\d+)/);
    if (!m) throw Error(`Unexpected fraction skill: ${q.prompt}`);
    if (skill === 'improper') return {kind:'convert', a:`${m[4]}/${m[5]}`, result:answer(Number(m[4]),Number(m[5]))};
    const whole = Number(m[1]), numerator = Number(m[2]), denominator = Number(m[3]);
    const [n,d] = normalized(whole * denominator + numerator, denominator);
    return {kind:'convert', a:`${whole} ${numerator}/${denominator}`, result:`${n}/${d}`};
  }
  function complexity(q) {
    const terms = [q.a,q.b].filter(Boolean).flatMap(v => String(v).match(/\d+\/\d+/g) || []);
    return terms.reduce((sum,v) => sum + Number(v.split('/')[1]), 0) + (q.common || 0);
  }
  const ordered = items => items.sort((a,b) => complexity(a) - complexity(b) || String(a.a).localeCompare(String(b.a)) || String(a.b).localeCompare(String(b.b)));
  function conversion(config) {
    const count = config.count || 42, seed = Number(config.seed) || 1;
    const type = config.gen?.skill || config.skill || 'improper';
    if (type === 'pair' || config.pair) {
      const half = Math.ceil(count / 2);
      const left = ordered(skillRows('improper', seed, half).map(q => asConversion(q, 'improper')));
      const right = ordered(skillRows('mixed', seed + 911, count - half).map(q => asConversion(q, 'mixed')));
      return {cols:2, rows:half, items:left.concat(right), headings:['가분수 → 대분수','대분수 → 가분수']};
    }
    if (['improper','mixed','reduce','common','compare-fraction'].includes(type)) {
      const items = skillRows(type, seed, count).map(q => {
        if (type === 'improper' || type === 'mixed') return asConversion(q, type);
        if (type === 'reduce') return {kind:'reduce', a:q.prompt.match(/\d+\/\d+/)[0], result:q.answer};
        if (type === 'common') {
          const parts = q.prompt.match(/\d+\/\d+/g);
          return {kind:'common', a:parts[0], b:parts[1], result:q.answer};
        }
        const parts = q.prompt.match(/\d+\/\d+/g);
        return {kind:'compare', a:parts[0], b:parts[1], result:q.answer};
      });
      return {cols:3, rows:14, items:ordered(items)};
    }
    throw Error(`Unknown fraction conversion skill: ${type}`);
  }
  function arithmetic(config, different) {
    const count = config.count || (different ? 24 : 36), seed = Number(config.seed) || 1;
    const op = config.gen?.op || config.op || 'add';
    const id = config.gen?.source || `fraction-${op}-${different ? 'different' : 'same'}`;
    const items = sourceRows(id, seed, count, q => {
      const [a, d] = rational(q.a), [b, e] = rational(q.b);
      return different ? d !== e : d === e;
    }).map(q => {
      const [n,d] = root.Worksheets.exact(q.a, q.b, q.op);
      return {kind:different?'different':'same', a:q.a, b:q.b, op:q.op, result:answer(n,d)};
    });
    return {cols:different?2:3, rows:12, items:ordered(items)};
  }
  function steps(config) {
    const count = config.count || 20, seed = Number(config.seed) || 1;
    const op = config.gen?.op || config.op || 'add';
    if (!['add','sub'].includes(op)) throw Error('Fraction steps use addition or subtraction');
    const items = sourceRows(`fraction-${op}-different`, seed, count, q => {
      const [a,d] = rational(q.a), [b,e] = rational(q.b);
      return d !== e && (q.op !== '−' || a * e >= b * d);
    }).map(q => {
      const [a,d] = rational(q.a), [b,e] = rational(q.b), common = lcm(d,e);
      const left = a * common / d, right = b * common / e;
      const raw = q.op === '+' ? left + right : left - right;
      return {kind:'steps', a:q.a, b:q.b, op:q.op, common, left, right, raw, result:answer(raw,common)};
    });
    return {cols:2, rows:10, items:ordered(items)};
  }
  function generate(config) {
    switch (config.format) {
      case 'fraction-convert': return conversion(config);
      case 'fraction-pair': return conversion({...config, gen:{skill:'pair'}});
      case 'fraction-same': return arithmetic(config, false);
      case 'fraction-different': return arithmetic(config, true);
      case 'fraction-steps': return steps(config);
      default: throw Error(`Unknown fraction format: ${config.format}`);
    }
  }
  function cell(q, isAnswer, number) {
    const result = isAnswer ? frac(q.result) : '<span class="sf-empty"></span>';
    let equation;
    if (q.kind === 'convert' || q.kind === 'reduce') equation = `${frac(q.a)} <span class="sf-op">=</span> ${result}`;
    else if (q.kind === 'common') {
      const pieces = isAnswer ? q.result.split(/,\s*/) : [];
      equation = `${frac(q.a)}, ${frac(q.b)} <span class="sf-op">→</span> ${isAnswer ? `${frac(pieces[0])}, ${frac(pieces[1])}` : '<span class="sf-empty sf-wide"></span>'}`;
    } else if (q.kind === 'compare') equation = `${frac(q.a)} <span class="sf-op">${isAnswer ? esc(q.result) : '□'}</span> ${frac(q.b)}`;
    else equation = `${frac(q.a)} <span class="sf-op">${esc(q.op)}</span> ${frac(q.b)} <span class="sf-op">=</span> ${result}`;
    if (q.kind === 'steps') {
      equation += `<div class="sf-work">${isAnswer ? `${frac(`${q.left}/${q.common}`)} ${esc(q.op)} ${frac(`${q.right}/${q.common}`)} = ${frac(`${q.raw}/${q.common}`)} → ${frac(q.result)}` : `통분 ${frac('□/□')} ${frac('□/□')}　계산 ${frac('□/□')}　약분 ${frac('□/□')}`}</div>`;
    } else if (q.kind === 'different') {
      equation += `<div class="sf-work">${isAnswer ? '통분하여 계산' : '통분: __________________________________'}</div>`;
    }
    return equation;
  }
  function css() {
    if (document.getElementById('sf-styles')) return;
    const style = document.createElement('style');
    style.id = 'sf-styles';
    style.textContent = `.sheet-grid:has(.sf-fraction-cell){grid-auto-flow:column}.sf-content{min-width:0;white-space:nowrap;line-height:1.2}.sf-frac{display:inline-flex;vertical-align:middle;flex-direction:column;text-align:center;line-height:1;min-width:1.4em;font-variant-numeric:tabular-nums}.sf-frac>span:first-child{border-bottom:1px solid #111;padding:0 .1em .08em}.sf-frac>span:last-child{padding-top:.08em}.sf-mixed{display:inline-flex;align-items:center;gap:.1em}.sf-op{display:inline-block;margin:0 .1em}.sf-empty{display:inline-flex;align-items:center;justify-content:center;border:1px solid #57736a;box-sizing:border-box;width:16mm;height:14mm;vertical-align:middle}.sf-wide{width:4em}.sf-work{font-size:8pt;margin-top:1.6mm;line-height:1.4;color:#333}.sf-fraction-cell.sheet-cell{padding-top:2mm}.sf-fraction-cell .sf-content{font-size:inherit}.sf-different .sf-content,.sf-steps .sf-content{font-size:11pt}.sheet-pair .sf-fraction-cell.sheet-cell{padding-top:1mm}.sheet-pair .sf-content{font-size:10pt}`;
    document.head.appendChild(style);
  }
  function render(cellNode, q, isAnswer, config) {
    css();
    cellNode.classList.add('sf-fraction-cell', config.format === 'fraction-different' ? 'sf-different' : config.format === 'fraction-steps' ? 'sf-steps' : 'sf-convert');
    const holder = document.createElement('div');
    holder.innerHTML = cell(q, isAnswer);
    holder.className = 'sf-content';
    cellNode.appendChild(holder);
  }
  const api = {generate, render, fractionHTML:frac, answer};
  root.FractionSheet = api;
  if (root.SheetGen) {
    const original = root.SheetGen.generate;
    root.SheetGen.generate = config => config.format.startsWith('fraction-') ? generate(config).items : original(config);
  }
  if (root.Sheet && root.Sheet.register) for (const key of ['fraction-convert','fraction-pair','fraction-same','fraction-different','fraction-steps']) root.Sheet.register(key, render);
})(globalThis);
