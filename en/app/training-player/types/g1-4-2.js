/* 묶음 1-4-2: 분수로 나누기. 수와 원래 답은 Worksheets.generate에서 가져온다. */
(function (root) {
  'use strict';
  const gcd = (a, b) => b ? gcd(b, a % b) : Math.abs(a);
  const reduced = (n, d) => { const g = gcd(n, d); return [n / g, d / g]; };
  const esc = x => String(x).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function rng(seed) {
    let state = (Number(seed) >>> 0) || 1;
    return max => { state += 0x6d2b79f5; let t = state; t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61); return Math.floor(((t ^ t >>> 14) >>> 0) / 4294967296 * max); };
  }
  function shuffle(list, random) {
    const out = list.slice(); for (let i = out.length - 1; i > 0; i--) { const j = random(i + 1); [out[i], out[j]] = [out[j], out[i]]; } return out;
  }
  const concepts = [
    {name:'분모 같은 분수÷분수', legacy:'fraction-div-same', form:['proper','proper'], relation:'same'},
    {name:'분모 다른 진분수÷진분수', legacy:'fraction-div-different', form:['proper','proper'], relation:'different'},
    {name:'자연수÷진분수', legacy:'fraction-div-whole-proper', form:['whole','proper']},
    {name:'가분수÷진분수', legacy:'fraction-div-improper-proper', form:['improper','proper']},
    {name:'대분수÷진분수', legacy:'fraction-div-mixed-proper', form:['mixed','proper']},
    {name:'진분수÷대분수', legacy:'fraction-div-proper-mixed', form:['proper','mixed']},
    {name:'대분수÷대분수', legacy:'fraction-div-mixed-mixed', form:['mixed','mixed']}
  ];
  function operand(text) {
    const s = String(text).trim(), m = s.match(/^(?:(\d+) )?(\d+)\/(\d+)$/);
    if (m) { const whole = Number(m[1] || 0), n = Number(m[2]), d = Number(m[3]);
      return {form:m[1] ? 'mixed' : n >= d ? 'improper' : 'proper', whole, n, d, value:whole * d + n}; }
    const whole = Number(s); return {form:'whole', whole, n:0, d:1, value:whole};
  }
  function validOperand(o, expected) {
    if (o.form !== expected || !Number.isInteger(o.value) || o.value < 1) return false;
    if (expected === 'whole') return o.whole <= 9;
    if (o.d < 2 || o.d > 12 || gcd(o.n, o.d) !== 1) return false;
    if (expected === 'mixed') return o.whole >= 1 && o.whole <= 9 && o.n >= 1 && o.n < o.d;
    if (expected === 'improper') return o.n >= o.d && o.n <= 10 * o.d - 1;
    return o.n >= 1 && o.n < o.d;
  }
  function convert(row, concept) {
    if (row.op !== '÷') return null;
    const a = operand(row.a), b = operand(row.b);
    if (!validOperand(a, concept.form[0]) || !validOperand(b, concept.form[1])) return null;
    if (concept.relation === 'same' && a.d !== b.d || concept.relation === 'different' && a.d === b.d) return null;
    const [n, d] = reduced(a.value * b.d, a.d * b.value);
    if (d > 200 || n > 999) return null;
    const answer = d === 1 ? String(n) : `${n}/${d}`;
    if (answer !== String(row.answer)) throw Error(`기존 생성기 정답 불일치: ${row.a} ÷ ${row.b}`);
    return {a, b, n, d, key:`${row.a}÷${row.b}`, rank:a.value / a.d + b.value / b.d + a.d / 100 + b.d / 1000};
  }
  const pools = new Map();
  function pool(concept, seed) {
    const key = concept.legacy + ':' + seed;
    if (pools.has(key)) return pools.get(key);
    const generate = root.FractionLegacyGenerate || root.Worksheets?.generate;
    if (typeof generate !== 'function') throw Error('기존 분수 생성기를 찾지 못했습니다.');
    const found = new Map();
    for (let batch = 0; batch < 600 && found.size < 300; batch++) {
      const rows = generate(concept.legacy, (Number(seed) + Math.imul(batch, 104729)) >>> 0, 32);
      for (const row of rows) { const q = convert(row, concept); if (q && !found.has(q.key)) found.set(q.key, q); }
    }
    const list = Array.from(found.values());
    if (list.length < 48) throw Error(`${concept.name}: 조건에 맞는 기존 문항이 ${list.length}개뿐입니다.`);
    const random = rng(seed + concepts.indexOf(concept) * 997);
    const result = shuffle(list, random); pools.set(key, result); return result;
  }
  function selected(config, needed, uniqueAnswer) {
    const concept = concepts[config.gen.conceptIndex], source = pool(concept, config.seed);
    const chosen = [], answers = new Set(); let easy = 0;
    for (const q of source) {
      const answerKey = `${q.n}/${q.d}`;
      if (uniqueAnswer && answers.has(answerKey)) continue;
      const isEasy = q.a.value === 1 || q.b.value === 1;
      if (isEasy && easy >= Math.floor(needed * .1)) continue;
      chosen.push(q); answers.add(answerKey); if (isEasy) easy++;
      if (chosen.length === needed) break;
    }
    if (chosen.length !== needed) throw Error(`${config.typeId}: 고유 문항 ${needed}개 중 ${chosen.length}개만 생성했습니다.`);
    return chosen.sort((x, y) => x.rank - y.rank || x.key.localeCompare(y.key));
  }
  const frac = (n, d) => `<span class="f142-frac"><span>${esc(n)}</span><span>${esc(d)}</span></span>`;
  function show(o) { return o.form === 'whole' ? esc(o.whole) : o.form === 'mixed' ? `${esc(o.whole)} ${frac(o.n,o.d)}` : frac(o.n,o.d); }
  function value(q) { return q.d === 1 ? esc(q.n) : q.n > q.d ? `${Math.floor(q.n / q.d)} ${frac(q.n % q.d,q.d)}` : frac(q.n,q.d); }
  const equation = q => `${show(q.a)} ÷ ${show(q.b)}`;
  const reciprocal = q => frac(q.b.d, q.b.value);
  const blank = (answer, html, wide) => `<span class="f142-blank${wide?' wide':''}${answer?' ink':''}">${answer ? html : ''}</span>`;
  function horizontal(cell, q, answer) {
    cell.classList.add('f142-cell'); cell.insertAdjacentHTML('beforeend',
      `<div class="f142-line">${equation(q)} = <span class="f142-answer${answer?' ink':''}">${answer ? value(q) : ''}</span></div>`);
  }
  function step(cell, q, answer) {
    cell.classList.add('f142-cell','f142-step');
    const transformedA = q.a.form === 'mixed' ? frac(q.a.value,q.a.d) : show(q.a);
    const transformedB = q.b.form === 'mixed' ? frac(q.b.value,q.b.d) : show(q.b);
    const left = q.a.form === 'mixed' ? blank(answer, transformedA, true) : transformedA;
    const divisor = q.b.form === 'mixed' ? blank(answer, transformedB, true) : transformedB;
    const hasMixed = q.a.form === 'mixed' || q.b.form === 'mixed';
    cell.insertAdjacentHTML('beforeend', `<div class="f142-line">${equation(q)}${hasMixed ? ` = ${left} ÷ ${divisor}` : ''}</div>` +
      `<div class="f142-line">= ${transformedA} × ${blank(answer,reciprocal(q),true)} = ${blank(answer,value(q),true)}</div>`);
  }
  function errorItem(q, i) {
    const kinds = ['no-invert','invert-left'];
    const kind = q.a.value === q.a.d ? 'no-invert' : kinds[i % kinds.length]; let wrong, label, wrongValue;
    if (kind === 'no-invert') {
      const [n,d] = reduced(q.a.value*q.b.value,q.a.d*q.b.d);
      wrong = `${frac(q.a.value,q.a.d)} × ${frac(q.b.value,q.b.d)}`;
      wrongValue = d===1 ? String(n) : frac(n,d); label = '나누는 분수를 뒤집지 않음';
    } else if (kind === 'invert-left') {
      const [n,d] = reduced(q.a.d*q.b.d,q.a.value*q.b.value);
      wrong = `${frac(q.a.d,q.a.value)} × ${reciprocal(q)}`;
      wrongValue = d===1 ? String(n) : frac(n,d); label = '나뉘는 수까지 뒤집음';
    }
    return {...q, wrong, wrongValue, label};
  }
  function error(cell, q, answer) {
    cell.classList.add('f142-cell','f142-error');
    cell.insertAdjacentHTML('beforeend', `<div class="f142-errorbox"><div><div>${equation(q)}</div><div class="f142-wrong">= ${q.wrong}</div><div>= ${q.wrongValue}</div></div>`+
      `<div class="f142-correct"><small>바르게 고치기</small><div>${answer ? `<span class="ink">${frac(q.a.value,q.a.d)} × ${reciprocal(q)}<br>= ${value(q)}</span>` : '<i></i><i></i>'}</div>`+
      `</div></div>`);
  }
  function generate(config) {
    if (config.gen.task === 'match') {
      const per = 4, bundles = 6, qs = selected(config, per * bundles, true), random = rng(config.seed + 142);
      return Array.from({ length: bundles }, (_, k) => {
        const pairs = qs.slice(k*per,(k+1)*per), order = shuffle(pairs.map((_, i) => i),random);
        for (let i=0;i<per;i++) if (order[i]===i) { const j=(i+1)%per; [order[i],order[j]]=[order[j],order[i]]; }   // 제자리 짝(수평선) 제거
        return {pairs,order};
      });
    }
    const questions = selected(config, config.count, false);
    return config.gen.task === 'error' ? questions.map(errorItem) : questions;
  }
  function css() {
    if (document.getElementById('f142-style')) return;
    const style = document.createElement('style'); style.id='f142-style'; style.textContent=`
      .f142-cell{padding-top:1mm;min-width:0}.f142-step .f142-line+.f142-line{margin-top:2.5mm}.f142-line{white-space:nowrap;line-height:1.5}
      .f142-frac{display:inline-flex;flex-direction:column;vertical-align:middle;text-align:center;line-height:1.05;min-width:1.2em}
      .f142-frac>span:first-child{border-bottom:1px solid #111;padding:0 .12em}.f142-frac>span:last-child{padding:0 .12em}
      .f142-answer{display:inline-flex;align-items:center;justify-content:center;min-width:15mm;min-height:14mm;height:14mm;box-sizing:border-box;border:1px solid #57736a;vertical-align:middle}
      .f142-blank{display:inline-flex;align-items:center;justify-content:center;min-width:8mm;min-height:1.3em;border:1px solid #777;vertical-align:middle}
      .f142-blank.wide{min-width:15mm;min-height:14mm;height:14mm;box-sizing:border-box}.f142-cell .ink{color:#d71f10}
      .f142-expr{display:inline-flex;align-items:center;gap:.3em;white-space:nowrap}.mt-text .f142-frac{min-width:1em}
      .f142-pairs{position:relative;display:grid;grid-template-columns:48% 48%;gap:4%;height:100%}
      .f142-match>.sheet-number{display:none}
      .f142-pairs>div{display:grid;grid-template-rows:repeat(8,minmax(0,1fr));min-height:0}
      .f142-pair{display:flex;align-items:center;gap:1mm;white-space:nowrap;overflow:hidden}.f142-pair span{min-width:0;overflow:hidden}
      .f142-pair b{font-weight:400;font-size:8pt}.f142-pair small{font-size:8pt;color:#666}
      .f142-pairs>div:first-child b{margin-left:auto}.f142-lines{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
      .f142-lines line{stroke:#a22;stroke-width:1.5;vector-effect:non-scaling-stroke}
      .f142-errorbox{display:grid;grid-template-columns:49% 49%;gap:2%;height:100%;width:100%;box-sizing:border-box;padding-left:6mm;font-size:11pt;line-height:1.5;overflow:hidden}
      .f142-wrong{margin-top:2mm}.f142-correct{border-left:1px dashed #bbb;padding-left:1mm;display:flex;flex-direction:column}
      .f142-correct small{font-size:8pt;color:#666}.f142-correct>div{flex:1;display:flex;flex-direction:column;justify-content:space-around}
      .f142-correct i{display:block;height:1.8em;border-bottom:1px solid #bbb}
      .sheet-page:has(.f142-cell) .sheet-head{gap:1.5mm}.sheet-page:has(.f142-cell) .sheet-brand{font-size:7pt}
      .sheet-page:has(.f142-cell) .sheet-field{font-size:8pt}.sheet-page:has(.f142-cell) .sheet-title{font-size:9pt}
    `; document.head.appendChild(style);
  }
  const formats = {'f142-horizontal':horizontal,'f142-step':step,'f142-match':null,'f142-error-correction':error};
  for (const [key,renderer] of Object.entries(formats)) if (renderer) root.Sheet.register(key,(cell,q,answer) => {css();renderer(cell,q,answer);});
  if (root.MatchingSheet && root.MatchingSheet.formats) root.MatchingSheet.formats['f142-match'] = {
    page: 'blocks', title: '선 잇기',
    build(config) {
      css();
      const items = generate(config).map(group => ({ kind: 'bundle', caption: '', rowsWeight: group.pairs.length, order: group.order, compact: true, compactWl: 32, compactWr: 18, compactGap: 10,
        pairs: group.pairs.map(q => [{ html: `<span class="f142-expr">${equation(q)}</span>` }, { html: value(q) }]) }));
      const total = items.reduce((sum, item) => sum + item.pairs.length, 0);
      return { items, layout: { cols: items.length, rows: items[0].pairs.length, count: total }, pairs: total };
    },
    render: (config, item, isAnswer) => root.MatchingSheet.formats['matching-lines'].render(config, item, isAnswer)
  };
  const originalGenerate = root.SheetGen.generate;
  root.SheetGen.generate = config => config.format in formats ? generate(config) : originalGenerate(config);
  const LAYOUT_PT = { t1: 17, t2: 13, t3: 12, t4: 12 };
  const tasks = [
    {key:'t1',name:'가로식',format:'f142-horizontal',cols:2,rows:12,instruction:'계산하여 답을 기약분수나 대분수로 쓰세요.'},
    {key:'t2',name:'빈칸',format:'f142-step',cols:2,rows:12,instruction:'빈칸에 알맞은 수를 써서 풀이를 완성하세요.'},
    {key:'t3',name:'연결',format:'f142-match',cols:6,rows:4,instruction:'서로 알맞은 것끼리 선으로 이으세요.',autoFit:false},
    {key:'t4',name:'고치기',format:'f142-error-correction',cols:3,rows:4,instruction:'잘못 계산한 곳을 찾아 바르게 고쳐 쓰세요.',workLines:3}
  ];
  concepts.forEach((concept,index) => tasks.forEach(task => root.SheetCatalog.push({
    typeId:`1-4-2-${index}-${task.key}`, title:`${concept.name} · ${task.name}`, instruction:task.instruction,
    format:task.format, cols:task.cols, rows:task.rows, count:task.cols*task.rows, fontPt:task.key==='t2'&&index>=4?11.5:LAYOUT_PT[task.key],
    workLines:task.workLines, autoFit:false, maxProblems:24, seed:20261001,
    gen:{legacyId:concept.legacy,conceptIndex:index,task:task.key==='t3'?'match':task.key==='t4'?'error':'normal'}
  })));
  root.F142 = {concepts,convert,generate};
})(globalThis);
