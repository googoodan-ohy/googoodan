/* Fraction subtraction preparation: all nine types in bundle 1-2-0.
   Operands come only from the preserved Worksheets generator. */
(function (root) {
  'use strict';
  const KEY = 'ko120-picture', STEP = 'ko120-step', MATCH = 'ko120-match';
  const SOURCES = ['fraction-sub-same', 'fraction-sub-whole-proper', 'fraction-sub-mixed-proper'];
  const names = ['같은 단위분수끼리 덜어 내기', '자연수 1을 분수로 바꾸기', '대분수에서 1을 받아내리기'];
  const tasks = [
    ['단위 그림을 합치거나 지워 수 쓰기', '그림을 보고 남은 양을 분수로 쓰세요.', KEY, 3, 5],
    ['같은 단위의 개수로 식 완성하기', '같은 단위의 개수를 보고 빈칸을 채우세요.', STEP, 2, 10],
    ['그림과 계산식 연결하기', '그림과 알맞은 계산식을 선으로 이으세요.', MATCH, 6, 4]
  ];
  const esc = x => String(x).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const gcd = (a, b) => b ? gcd(b, a % b) : Math.abs(a);
  const rat = x => root.Worksheets.rational(x);
  const equal = (text, n, d) => { const [a,b] = rat(text); return a * d === n * b; };
  const frac = (n,d,red) => '<span class="ko120-frac"><span' + (red ? ' class="ko120-red"' : '') + '>' + esc(n) + '</span><span>' + esc(d) + '</span></span>';   // 정답이면 새로 쓴 분자만 빨강(분모는 문제에 인쇄된 값)
  const box = (value, answer) => '<span class="ko120-box' + (answer ? ' ko120-red' : '') + '">' + (answer ? esc(value) : '&nbsp;') + '</span>';
  const numeratorBlank = (n,d,answer) => answer ? frac(n,d,true) : '<span class="ko120-frac"><span>' + box('',false) + '</span><span>' + esc(d) + '</span></span>';
  const borrowed = (q,answer) => (q.w > 1 ? `${q.w-1} + ` : '') + numeratorBlank(q.d+q.n,q.d,answer);
  function rng(seed) { let s = seed >>> 0; return n => { s += 0x6d2b79f5; let t = s; t = Math.imul(t ^ t >>> 15,t|1); t ^= t + Math.imul(t ^ t >>> 7,t|61); return ((t ^ t >>> 14) >>> 0) % n; }; }
  function pool(group, seed, wanted) {
    const out = [], seen = new Set(), source = SOURCES[group];
    for (let batch = 0; batch < 400 && out.length < wanted; batch++) {
      const rows = root.Worksheets.generate(source, (Number(seed) + Math.imul(batch, 2654435761)) >>> 0, 64);
      for (const row of rows) {
        let q;
        if (group === 0) {
          const a = String(row.a).match(/^(\d+)\/(\d+)$/), b = String(row.b).match(/^(\d+)\/(\d+)$/);
          if (!a || !b || +a[2] !== +b[2]) continue;
          const n = +a[1], m = +b[1], d = +a[2];
          if (d < 3 || d > 12 || n <= m || n >= d || m < 1 || m >= d || n === 1 || !equal(row.answer,n-m,d)) continue;
          q = {n,m,d,w:0, key:`${d}:${n}:${m}`, rank:d*100+n*10+m};
        } else if (group === 1) {
          if (String(row.a) !== '1') continue;
          const b = String(row.b).match(/^(\d+)\/(\d+)$/);
          if (!b) continue;
          const m = +b[1], d = +b[2];
          if (d < 2 || d > 12 || m < 1 || m >= d || !equal(row.answer,d-m,d)) continue;
          q = {n:0,m,d,w:1,key:`${d}:${m}`,rank:d*100+m};
        } else {
          const a = String(row.a).match(/^(\d+)\s+(\d+)\/(\d+)$/), b = String(row.b).match(/^(\d+)\/(\d+)$/);
          if (!a || !b || +a[3] !== +b[2]) continue;
          const w = +a[1], n = +a[2], d = +a[3], m = +b[1];
          if (w < 1 || w > 9 || d < 3 || d > 12 || n < 1 || n >= d || m <= n || m >= d || !equal(row.answer,(w-1)*d+d+n-m,d)) continue;
          q = {n,m,d,w,key:`${w}:${d}:${n}:${m}`,rank:d*1000+w*100+n*10+m};
        }
        if (seen.has(q.key)) continue;
        seen.add(q.key); out.push(q);
        if (out.length === wanted) break;
      }
    }
    if (out.length !== wanted) throw Error(`1-2-0-${group}: 조건에 맞는 고유 문항 ${out.length}/${wanted}`);
    return out.sort((a,b) => a.rank-b.rank);
  }
  function groupOf(config) { const m = String(config.typeId).match(/^1-2-0-([012])-t[123]$/); if (!m) throw Error('잘못된 유형: '+config.typeId); return +m[1]; }
  function items(config) {
    // 1-2-0-1-t1 은 막대와 '1 = □/분모' 만 보이므로 분모가 같은 문항은 같은 그림이다 → 분모(2~12)마다 하나씩, 문항 수를 분모 가짓수 안으로 둔다.
    if (groupOf(config) === 1 && String(config.typeId).endsWith('-t1')) {
      const byD = new Map(); for (const q of pool(1, config.seed, 40)) if (!byD.has(q.d)) byD.set(q.d, q);
      const list = [...byD.values()], drop = rng(((Number(config.seed) >>> 0) ^ 0x2f4e1c) >>> 0);
      while (list.length > config.count) list.splice(drop(list.length), 1);
      return list.sort((a, b) => a.rank - b.rank);
    }
    return pool(groupOf(config), config.seed, config.count);
  }
  function bar(d, filled, erased) {
    let s = '<svg class="ko120-bar" viewBox="0 0 240 25" preserveAspectRatio="none" aria-hidden="true">';
    for (let i=0;i<d;i++) { const x=i*240/d; s += `<rect x="${x}" y="1" width="${240/d}" height="22" fill="${i<filled ? '#bcbcbc':'white'}" stroke="#555" stroke-width=".8"/>`; if (i<erased) s += `<path d="M${x+2} 3L${x+240/d-2} 21" stroke="#111" stroke-width="1.3"/>`; }
    return s+'</svg>';
  }
  function picture(cell,q,answer,config) {
    const g=groupOf(config); cell.classList.add('ko120-cell'); cell.classList.add(g>1 ? 'ko120-big2' : g>0 ? 'ko120-big' : 'ko120-big0');
    let h='';
    if (g===0) h=`<span class="ko120-eq">${frac(q.n,q.d)} − ${frac(q.m,q.d)}</span>${bar(q.d,q.n,q.m)}<span>남은 양: ${numeratorBlank(q.n-q.m,q.d,answer)}</span>`;
    if (g===1) h=`${bar(q.d,q.d,0)}<span>1 = ${numeratorBlank(q.d,q.d,answer)}</span>`;
    if (g===2) h=`<span class="ko120-eq ko120-oneline"><span>${q.w} ${frac(q.n,q.d)} − ${frac(q.m,q.d)}</span><span>=</span><span>${q.w>1?`${q.w-1} `:''}${numeratorBlank(q.d+q.n,q.d,answer)} − ${frac(q.m,q.d)}</span></span><div class="ko120-two-bars">${bar(q.d,q.d,0)}${bar(q.d,q.n,0)}</div>`;   // 막대 위 한 줄: 대분수 − 분수 = (자연수−1)과 (d+n)/d − 분수 (받아내린 분자가 빈칸)
    const wrap=document.createElement('div'); wrap.className='ko120-picture'; wrap.innerHTML=h; cell.append(wrap);
  }
  function step(cell,q,answer,config) {
    const g=groupOf(config), t=String(config.typeId).slice(-2); cell.classList.add('ko120-cell'); cell.classList.add(g>0 ? 'ko120-big-s' : 'ko120-big0-s');
    let h;
    if (g===0) h=`${frac(q.n,q.d)} − ${frac(q.m,q.d)} = ${frac(q.n,q.d)}에서 ${frac(q.m,q.d)}${[1,3,6,7,8,10,11].includes(q.m)?'을':'를'} 덜기<br>${q.n} − ${q.m} = ${box(q.n-q.m,answer)} → ${numeratorBlank(q.n-q.m,q.d,answer)}`;
    else if (g===1 && t==='t2') h=`<span class="ko120-eq">1 = ${numeratorBlank(q.d,q.d,answer)} = ${numeratorBlank(q.d-q.m,q.d,answer)} + ${frac(q.m,q.d)}</span>`;   // 식을 한 줄로
    else if (g===1) h=`<span class="ko120-eq">1 − ${frac(q.m,q.d)} = ${numeratorBlank(q.d,q.d,answer)} − ${frac(q.m,q.d)} = ${numeratorBlank(q.d-q.m,q.d,answer)}</span>`;   // 식을 한 줄로
    else if (t==='t2') h=`<span class="ko120-eq ko120-oneline"><span>${q.w} ${frac(q.n,q.d)} − ${frac(q.m,q.d)}</span><span>=</span><span>${q.w>1?`${q.w-1} `:''}${numeratorBlank(q.d+q.n,q.d,answer)} − ${frac(q.m,q.d)}</span><span>=</span><span>${q.w>1?`${q.w-1} `:''}${numeratorBlank(q.d+q.n-q.m,q.d,answer)}</span></span>`;   // 한 줄: 대분수 − 분수 = 받아내린 식 = 결과
    else h=`<span class="ko120-eq ko120-oneline"><span>${q.w} ${frac(q.n,q.d)} − ${frac(q.m,q.d)}</span><span>=</span><span>${borrowed(q,answer)} − ${frac(q.m,q.d)}</span></span>`;   // 한 줄
    const wrap=document.createElement('div'); wrap.className='ko120-step'; wrap.innerHTML=h; cell.append(wrap);
  }
  function css() {
    if (document.getElementById('ko120-style')) return;
    const style=document.createElement('style'); style.id='ko120-style'; style.textContent=`
      .ko120-eq{display:inline-flex;align-items:center;gap:1.5mm;white-space:nowrap}.ko120-oneline{gap:2.4mm;font-size:1.05em}.ko120-cell{font-size:11pt;padding-top:3mm}.ko120-picture{display:flex;flex-direction:column;gap:2mm;align-items:flex-start;white-space:nowrap;line-height:1.15;width:100%}.ko120-bar{width:100%;height:7mm}.ko120-two-bars{display:flex;gap:1mm;width:100%}.ko120-two-bars .ko120-bar{width:calc(50% - .5mm)}.ko120-step{white-space:nowrap;line-height:1.8}.ko120-frac{display:inline-flex;vertical-align:middle;flex-direction:column;text-align:center;line-height:1.05;min-width:1.15em}.ko120-frac>span:first-child{border-bottom:1px solid #111}.ko120-box{display:inline-flex;align-items:center;justify-content:center;vertical-align:middle;min-width:1.5em;height:1.5em;border:1px solid #777;text-align:center}.ko120-red{color:#d71f10}.ko120-page .sheet-head{gap:2mm}.ko120-page .sheet-title{font-size:8.5pt}.ko120-page .sheet-field{font-size:8pt}.ko120-page .sheet-brand{font-size:7pt}.ko120-match .mt-left .mt-text{font-size:9pt}.ko120-match .mt-right .mt-text{font-size:9pt}.ko120-cell.ko120-big{font-size:17pt}.ko120-cell.ko120-big2{font-size:14.5pt}.ko120-cell.ko120-big-s{font-size:15pt}.ko120-cell.ko120-big0-s{font-size:12.5pt}.ko120-big0-s .ko120-step,.ko120-big-s .ko120-step{line-height:1.4}.ko120-cell.ko120-big0-s,.ko120-cell.ko120-big-s,.ko120-cell.ko120-big2{padding-top:1.5mm}.ko120-big2 .ko120-picture{align-items:center;gap:2.5mm;width:calc(100% - 5mm);margin-left:0}.ko120-big2 .ko120-two-bars .ko120-bar{height:9mm}.ko120-cell.ko120-big0{font-size:14.5pt}.ko120-big0 .ko120-picture{align-items:center;gap:3mm;width:calc(100% - 5mm);margin-left:0}.ko120-big0 .ko120-bar{height:11mm}.ko120-big .ko120-picture{align-items:center;gap:4mm;width:calc(100% - 5mm);margin-left:0}.ko120-big .ko120-bar{height:13mm}.ko120-big .ko120-two-bars .ko120-bar{height:12mm}.ko120-big .ko120-picture>span:not(.ko120-eq){font-size:1.15em}`;
    document.head.append(style);
  }
  root.Sheet.register(KEY,picture); root.Sheet.register(STEP,step);
  const originalGenerate=root.SheetGen.generate;
  root.SheetGen.generate=function(config) { if (config && [KEY,STEP].includes(config.format)) { css(); return items(config); } return originalGenerate.apply(this,arguments); };
  const originalRender=root.Sheet.render;
  root.Sheet.render=function(config) { const result=originalRender.apply(this,arguments); if(config && [KEY,STEP,MATCH].includes(config.format)) document.querySelectorAll('#sheet-root .sheet-page').forEach(p=>p.classList.add('ko120-page')); return result; };
  if (root.MatchingSheet?.formats?.['matching-lines']) {
    const base=root.MatchingSheet.formats['matching-lines'];
    root.MatchingSheet.formats[MATCH]={page:'blocks',title:'그림과 계산식 연결',build(config){
      css(); const g=groupOf(config), count=config.cols*config.rows, candidates=pool(g,config.seed,count*4), used=new Set(), chosen=[];
      for(const q of candidates) { const result=g===0?`${q.n-q.m}/${q.d}`:g===1?`${q.d-q.m}/${q.d}`:`${q.w-1} ${q.d+q.n-q.m}/${q.d}`; if(used.has(result)) continue; used.add(result); chosen.push(q); if(chosen.length===count) break; }
      if(chosen.length<count) throw Error(config.typeId+': 서로 다른 대응쌍이 부족합니다.');
      const rnd=rng((Number(config.seed)^0x51f82d)>>>0), bundles=[];
      for(let b=0;b<config.cols;b++) { const chunk=chosen.slice(b*config.rows,(b+1)*config.rows); const pairs=chunk.map(q=>{
        const left={html:bar(q.d,g===0?q.n:q.d,g===0?q.m:0)};
        const right={html:'<span class="ko120-eq">'+(g===0?`${frac(q.n,q.d)} − ${frac(q.m,q.d)}`:g===1?`1 − ${frac(q.m,q.d)}`:`${q.w} ${frac(q.n,q.d)} − ${frac(q.m,q.d)}`)+'</span>'};   // 진짜 분수 모양
        return [left,right]; });
        const order=pairs.map((_,i)=>i); for(let i=order.length-1;i>0;i--){const j=rnd(i+1);[order[i],order[j]]=[order[j],order[i]];} for(let i=0;i<order.length;i++){ if(order[i]===i){ const j=(i+1)%order.length; [order[i],order[j]]=[order[j],order[i]]; } }   // 제자리 짝(가로선)은 정답을 드러내므로 없앤다
        bundles.push({kind:'bundle',caption:'',pairs,order,rowsWeight:config.rows,compact:true,compactWl:30,compactWr:30,compactGap:6}); }
      return {items:bundles,layout:{cols:config.cols,rows:config.rows,count},pairs:count};
    },render(config,item,isAnswer,built){const wrap=base.render(config,item,isAnswer,built);wrap.classList.add('ko120-match');return wrap;}};
  }
  for(let g=0;g<3;g++) for(let t=1;t<=3;t++) {
    const meta=tasks[t-1], title=t===1&&g>0?'그림으로 단위 바꾸기':t===2&&g>0?'바꾸기 전후 같은 양의 빈칸 채우기':t===3&&g>0?'받아내림 준비식 완성하기':meta[0];
    const format=t===3&&g>0?STEP:meta[2], cols=(t===1&&g===2)?2:(t===3&&g>0?2:(t===1&&g===1?2:meta[3])), rows=(t===1&&g===2)?7:(t===3&&g>0?10:(t===1&&g===1?5:meta[4]));   // 받아내림 그림(1-2-0-2-t1)은 식을 막대 위 한 줄로 쓰므로 2단 × 7줄
    const instruction=t===1&&g===1?'그림을 보고 1을 같은 크기의 분수로 바꾸세요.':t===1&&g===2?'그림을 보고 1을 받아내린 식을 완성하세요.':t===3&&g>0?'빈칸에 알맞은 수를 써서 풀이를 완성하세요.':meta[1];
    root.SheetCatalog.push({typeId:`1-2-0-${g}-t${t}`,title:`${names[g]} · ${title}`,instruction,format,cols,rows,count:cols*rows,fontPt:12,seed:20261001,autoFit:false,maxProblems:24,gen:{source:SOURCES[g],concept:`1-2-0-${g}`,task:`t${t}`}});
  }
})(globalThis);
