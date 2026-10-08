(async function(){
  const data=await fetch('worksheet-data.json?v=20261008-approved1').then(r=>{if(!r.ok)throw Error('Worksheet data unavailable');return r.json()});
  const byId=new Map(data.resources.map(r=>[r.id,r]));
  const byCode=new Map(data.entries.map(e=>[e.code,e]));
  const candidates=[
    {id:'w00095-1',code:'1.MD.A.1',grade:1,unit:'order-length'},
    {id:'w00083-1',code:'1.MD.B.3',grade:1,unit:'clock'},
    {id:'old-grade-2-measure-units',code:'2.MD.A.2',grade:2,unit:'measure-units'},
    {id:'w00007-1',code:'2.MD.C.7',grade:2,unit:'clock'},
    {id:'w00096-1',code:'2.MD.D.9',grade:2,unit:'lineplot'},
    {id:'w00111-1',code:'3.MD.B.4',grade:3,unit:'lineplot'},
    {id:'w00085-1',code:'3.MD.C.5.a',grade:3,unit:'area-tiles'},
    {id:'w00088-1',code:'3.NBT.A.1',grade:3,unit:'round'},
    {id:'old-grade-4-round',code:'4.NBT.A.3',grade:4,unit:'round'},
    {id:'w00110-1',code:'4.MD.C.6',grade:4,unit:'protractor'},
    {id:'w00087-1',code:'5.G.A.1',grade:5,unit:'coordinate'},
    {id:'old-grade-5-plot-points',code:'5.G.A.1',grade:5,unit:'plot-points'},
    {id:'w00086-1',code:'5.MD.C.3.b',grade:5,unit:'volume-cubes'}
  ].filter(c=>byId.get(c.id)?.eligible);
  const $=id=>document.getElementById(id);
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const params=new URLSearchParams(location.search);
  if(params.get('embedded')==='1')document.body.classList.add('embedded');
  const keywordVariant=(window.USKeywordVariants||[]).find(v=>String(v.id)===params.get('keywordVariant')&&v.kind==='approved'&&v.source===params.get('id'));
  let selected=candidates.find(c=>c.id===params.get('id'))||candidates[0],mode='problem',setIndex=0;
  const generated=new Map();
  $('summary').textContent=`${candidates.length} printable worksheet types`;
  function makeItems(candidate,seed){
    if(!window.GradeMath?.generate)throw Error('Original generator unavailable');
    const target=['w00088-1','old-grade-4-round'].includes(candidate.id)?24:candidate.unit==='area-tiles'?9:12,items=[],seen=new Set();
    for(let step=0;step<80&&items.length<target;step++){
      const groups=window.GradeMath.generate(candidate.grade,candidate.unit,(seed+step)>>>0);
      for(const q of groups.flatMap(group=>group.questions)){
        if(keywordVariant&&candidate.id===keywordVariant.source&&keywordVariant.rule==='nearest_10'&&!/nearest 10\./i.test(q.prompt))continue;
        if(keywordVariant&&candidate.id===keywordVariant.source&&keywordVariant.rule==='nearest_100'&&!/nearest 100\./i.test(q.prompt))continue;
        const key=q.prompt+'|'+q.visual+'|'+q.task;
        if(seen.has(key))continue;seen.add(key);
        items.push({prompt:String(q.prompt||''),visual:String(q.visual||''),task:String(q.task||''),answer:String(q.answer??'')});
        if(items.length===target)break;
      }
    }
    if(items.length<6)throw Error(`Too few changing problems: ${candidate.id}`);
    return items;
  }
  function getItems(candidate){
    if(!generated.has(candidate.id))generated.set(candidate.id,makeItems(candidate,(123+(keywordVariant?.id||0)*9973)>>>0));
    return generated.get(candidate.id);
  }
  function navigation(){
    const query=$('search').value.trim().toLowerCase();
    const list=candidates.filter(c=>!query||`${c.code} ${byId.get(c.id).title}`.toLowerCase().includes(query));
    $('standards').innerHTML=list.map(c=>`<button type="button" data-id="${esc(c.id)}" class="${selected?.id===c.id?'active':''}"><b>${esc(c.code)}</b> · ${esc(byId.get(c.id).title)}</button>`).join('')||'<p>No matching worksheets</p>';
    $('standards').querySelectorAll('button[data-id]').forEach(b=>b.onclick=()=>{selected=candidates.find(c=>c.id===b.dataset.id);const url=new URL(location.href);url.searchParams.set('id',selected.id);history.replaceState(null,'',url);render()});
  }
  function paper(candidate,r,answer){
    const page=document.createElement('article');page.className=`sheet-page ${answer?'answer-page':'problem-page'}`;
    page.innerHTML=`<div class="sheet-head"><div class="sheet-brand">googoodan.com</div><div class="sheet-title">${esc(r.title)}</div><div class="sheet-kind">${answer?'Answer key':'Worksheet'}</div><div class="sheet-fields"><div class="sheet-field">Name</div><div class="sheet-field">Date</div><div class="sheet-field">Grade / Class</div></div></div><div class="sheet-instruction">Complete each problem.</div><div class="sheet-grid"></div>`;
    const grid=page.querySelector('.sheet-grid');grid.style.gridTemplateRows=`repeat(${Math.ceil(r.items.length/3)},minmax(0,1fr))`;
    for(const [i,q] of r.items.entries()){
      const cell=document.createElement('div');cell.className='sheet-cell';
      cell.innerHTML=`<span class="sheet-number">${i+1}</span><div class="legacy-prompt">${esc(q.prompt)}</div><div class="legacy-visual">${q.visual}</div><div class="legacy-task">${q.task}</div>`;
      if(answer){
        const blanks=cell.querySelectorAll('.write-box,.blank,.k2-blank');
        if(blanks.length===1&&q.answer.length<=18&&!q.answer.includes(';')){blanks[0].textContent=q.answer;blanks[0].classList.add('ans-fill')}
        else{const a=document.createElement('div');a.className='legacy-answer';a.textContent=`Answer: ${q.answer}`;cell.append(a)}
      }
      grid.append(cell);
    }
    return page;
  }
  function render(){
    navigation();if(!selected)return;
    const original=byId.get(selected.id),e=byCode.get(selected.code),r={...original,items:getItems(selected)};
    if(keywordVariant&&selected.id===keywordVariant.source)r.title=keywordVariant.title;
    $('standard-title').textContent=`${selected.code} · ${r.title}`;
    $('standard-text').textContent=e?.standard||'';
    $('review-note').textContent='Print this worksheet or its answer key. Select New numbers for a different set.';
    $('source').textContent=`${r.items.length} problems · Set ${setIndex+1}`;
    document.title=`${r.title} · googoodan.com`;
    document.body.classList.remove('view-problem','view-answer');if(mode==='problem')document.body.classList.add('view-problem');if(mode==='answer')document.body.classList.add('view-answer');
    for(const id of ['problem','answer','both'])$(id).classList.toggle('active',mode===id);
    $('pages').replaceChildren(paper(selected,r,false),paper(selected,r,true));
  }
  for(const id of ['problem','answer','both'])$(id).onclick=()=>{mode=id;render()};
  $('new-set').onclick=()=>{setIndex++;generated.set(selected.id,makeItems(selected,(123+(keywordVariant?.id||0)*9973+Math.imul(setIndex,10007))>>>0));render()};
  $('print').onclick=()=>window.print();
  $('search').oninput=navigation;
  render();
})().catch(err=>{document.getElementById('pages').textContent=`Preview error: ${err.message}`;console.error(err)});

