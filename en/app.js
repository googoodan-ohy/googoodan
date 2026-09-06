const {types,generate}=Worksheets;
let current=types.find(t=>t.id===document.body.dataset.type)||types[0],seed=Math.floor(Math.random()*1e9),answers=false;
const groups=document.querySelector('.groups');
let family=current.family,operation=current.group,browse=new URLSearchParams(location.search).get('browse')==='curriculum'?'curriculum':'topic',grade=['K','1','2','3','4','5'].includes(new URLSearchParams(location.search).get('grade'))?new URLSearchParams(location.search).get('grade'):'1';
const icons={'Natural numbers':'123',Fractions:'½',Decimals:'0.5',Addition:'+',Subtraction:'−',Multiplication:'×',Division:'÷','Number sense':'□'};
function mathHTML(x){
 const text=String(x);if(!text.includes('/'))return text.startsWith('-')?'('+text+')':text;
 const parts=text.split(' '),f=parts.pop().split('/');
 return (parts.length?'<span class="mixed-whole">'+parts[0]+'</span>':'')+'<span class="fraction"><span>'+f[0]+'</span><span>'+f[1]+'</span></span>';
}
function exampleHTML(t){
 const green=v=>'<span class="example-answer">'+v+'</span>';
 if(t.id==='missing')return '5 + '+green('4')+' = 9';
 if(t.id==='compare')return '14 '+green('&lt;')+' 19';
 if(t.id==='compare-ten')return '4 '+green('&lt;')+' 7';
 let [left,op,right]=t.example.split(' ');
 if(t.config?.kind==='fraction-pair'){const p=generate(t.id,123)[0];left=p.a;right=p.b;op=p.op;}
 if(t.family==='Fractions'&&op==='−'&&Worksheets.exact(left,right,op)[0]<0)[left,right]=[right,left];
 const [n,d]=Worksheets.exact(left,right,op);
 let result=t.family==='Fractions'?Worksheets.fraction(n,d):String(Number((n/d).toFixed(4)));
 if(t.family==='Natural numbers'&&op==='÷'&&n%d)result=Math.floor(n/d)+' R '+n%d;
 return mathHTML(left)+' '+op+' '+mathHTML(right)+' = '+green(mathHTML(result));
}
function digitOrder(t){
 if(t.family==='Decimals'){const a=t.config.dp??t.config.da,b=t.config.dp??t.config.db;return Math.max(a,b)*100+a*10+b;}
 const nums=t.example.match(/\d+/g)||['0','0'];
 const a=t.config?.da||nums[0].length,b=t.config?.db||nums[1]?.length||1;
 return Math.max(a,b)*100+a*10+b;
}
const numberArt={
'Natural numbers':'<svg viewBox="0 0 100 52" aria-hidden="true"><g fill="#df8351"><circle cx="18" cy="35" r="6"/><circle cx="43" cy="35" r="6"/><circle cx="43" cy="19" r="6"/><circle cx="73" cy="35" r="6"/><circle cx="73" cy="19" r="6"/><circle cx="87" cy="35" r="6"/></g></svg>',
'Fractions':'<svg viewBox="0 0 100 52" aria-hidden="true"><circle cx="50" cy="26" r="22" fill="#f4e8db" stroke="#a77648"/><path d="M50 4 A22 22 0 0 1 72 26 H50 Z" fill="#df8351"/><path d="M28 26H72M50 4V48" stroke="#a77648"/></svg>',
'Decimals':'<svg viewBox="0 0 100 52" aria-hidden="true"><rect x="10" y="12" width="80" height="22" fill="#f4e8db" stroke="#a77648"/><rect x="10" y="12" width="24" height="22" fill="#df8351"/><path d="M18 12V34M26 12V34M34 12V34M42 12V34M50 12V34M58 12V34M66 12V34M74 12V34M82 12V34" stroke="#a77648"/><text x="50" y="49" text-anchor="middle" font-size="13">0.3</text></svg>',
'Integers':'<svg viewBox="0 0 100 52" aria-hidden="true"><path d="M7 25H93M25 20V30M50 17V32M75 20V30" stroke="#a77648" stroke-width="2"/><circle cx="25" cy="25" r="4" fill="#df8351"/><g text-anchor="middle" font-size="12"><text x="25" y="47">−1</text><text x="50" y="47">0</text><text x="75" y="47">1</text></g></svg>'};
function choose(t){current=t;answers=false;seed=Math.floor(Math.random()*1e9);history.pushState({id:t.id},'',t.id+'.html'+(browse==='curriculum'?'?browse=curriculum&grade='+grade:''));render();menu();}
function menu(){
 if(browse==='curriculum'){location.replace(grade==='K'?'kindergarten.html':'grades.html?grade='+grade);return;}
 groups.innerHTML='';
 const controls=document.createElement('div');controls.className='browse-tabs';
 for(const [id,label] of [['topic','By topic'],['curriculum','US curriculum']]){const b=document.createElement('button');b.textContent=label;b.setAttribute('aria-pressed',browse===id);b.onclick=()=>{if(id==='curriculum'){location.assign(grade==='K'?'kindergarten.html':'grades.html?grade='+grade);return;}browse=id;menu();};controls.append(b);}groups.append(controls);
 const addChoices=list=>{const grid=document.createElement('div');grid.className='choices';if(browse==='topic')list=[...list].sort((a,b)=>digitOrder(a)-digitOrder(b));for(const t of list){const a=document.createElement('a');a.className='choice';a.href=t.id+'.html';a.dataset.id=t.id;a.innerHTML='<span class="example">'+exampleHTML(t)+'</span><small>'+t.title+'</small>';if(t.id===current.id)a.setAttribute('aria-current','page');a.onclick=e=>{if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;e.preventDefault();choose(t);};grid.append(a);}groups.append(grid);};
 const row=(labels,selected,action,symbols=false)=>{const r=document.createElement('div');r.className=symbols?'operation-row':'filter-row';for(const label of labels){const b=document.createElement('button');if(!symbols&&numberArt[label]){b.classList.add('number-category');b.innerHTML=numberArt[label]+'<span>'+label+'</span>';}else b.textContent=symbols?icons[label]:label;b.setAttribute('aria-label',label);b.setAttribute('aria-pressed',selected===label);b.onclick=()=>action(label);r.append(b);}groups.append(r);};
 if(browse==='topic'){
 row(['Natural numbers','Fractions','Decimals','Integers'],family,label=>{family=label;if(operation==='Number sense'&&family!=='Natural numbers')operation='Addition';menu();});
 row(['Addition','Subtraction','Multiplication','Division',...(family==='Natural numbers'?['Number sense']:[])],operation,label=>{operation=label;menu();},true);
 const h=document.createElement('h2');h.className='menu-heading';h.textContent=family+' · '+operation;groups.append(h);
 addChoices(types.filter(t=>t.family===family&&t.group===operation));
 }else{
 const preview=document.createElement('a');preview.className='choice';preview.href=grade==='K'?'kindergarten.html':'grades.html?grade='+grade;preview.innerHTML='<span class="example">'+(grade==='K'?'Kindergarten adventures':'Grade '+grade+' math journals')+' →</span><small>Colorful pictures · 3 activities per sheet</small>';groups.append(preview);
 const note=document.createElement('p');note.className='curriculum-note';note.textContent='Common Core · K–5 sample skills. State and school curricula vary.';groups.append(note);
 row(['K','1','2','3','4','5'],grade,label=>{grade=label;menu();});
 for(const c of Curriculum.filter(c=>c.grade===grade)){
 const h=document.createElement('div');h.className='standard-heading';h.innerHTML='<small>'+c.domain+'</small><h2>'+c.skill+'</h2><a target="_blank" rel="noopener" href="https://www.thecorestandards.org/Math/Content/'+c.url+'">'+c.code+' ↗</a>';groups.append(h);addChoices(c.ids.map(id=>types.find(t=>t.id===id)));
 }
 const n=document.createElement('p');n.className='curriculum-note';n.textContent='Focused practice for selected skills; not a complete curriculum or an assessment of the full standard.';groups.append(n);
 }
}
menu();
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
let trackedWorksheet=null;
function trackWorksheet(event){window.GDAnalytics?.track(event,{worksheet_id:current.id,worksheet_name:current.title,edition:'en',number_family:current.family,operation:current.group,sheet_mode:answers?'answer':'worksheet'});}
function render(){
 if(trackedWorksheet!==current.id){trackWorksheet('worksheet_view');trackedWorksheet=current.id;}
 document.title=current.title+' Worksheets | Googoodan';
 document.querySelector('meta[name="description"]').content=`Free ${current.title.toLowerCase()} worksheets. Choose a type, get new problems, and print instantly with answer keys.`;
 document.querySelector('link[rel="canonical"]').href='https://googoodan.com/en/'+current.id+'.html';
 document.querySelectorAll('.choice').forEach(a=>{if(a.dataset.id===current.id)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
 document.querySelector('#questions').setAttribute('aria-pressed',!answers);document.querySelector('#answers').setAttribute('aria-pressed',answers);
 document.querySelector('#sheet-title').textContent=current.title;
 document.querySelector('#instructions').textContent=answers?'Answer key · matches your current worksheet.':current.instruction;
 document.querySelector('#mode').textContent=answers?'Answer key':'Practice worksheet';
 document.querySelector('.problems').classList.toggle('decimal-sheet',current.family==='Decimals');
 document.querySelector('.problems').classList.toggle('fraction-sheet',current.family==='Fractions');
 const rows=generate(current.id,seed);
 document.querySelector('.problems').innerHTML=rows.map((p,i)=>{
 const value=answers?`<span class="answer">${mathHTML(p.answer)}</span>`:'<span class="blank"></span>';
 const display=x=>mathHTML(x);
 let html=p.vertical?`<div class="vertical"><div>${p.a}</div><div class="bottom"><span>${p.op}</span><span>${p.b}</span></div><div class="result">${answers?value:'&nbsp;'}</div></div>`:`<span class="expression">${display(p.a)} ${p.op} ${display(p.b)} =</span>${value}`;
 if(p.op==='missing')html=`<span class="expression">${p.a} + <span class="box">${answers?escape(p.answer):''}</span> = ${p.a+p.b}</span>`;
 if(p.op==='compare')html=`<span class="expression">${p.a} <span class="box">${answers?escape(p.answer):''}</span> ${p.b}</span>`;
 return `<div class="problem ${p.op==='missing'||p.op==='compare'?'concept':''}"><span class="number">${i+1}.</span>${html}</div>`;
 }).join('');
 document.querySelector('#set').textContent=`Set ${seed} · ${answers?'Answers':'20 questions'}`;
 document.querySelector('#status').textContent=current.title+(answers?', answer key':', 20 questions ready');
}
document.querySelector('#questions').onclick=()=>{answers=false;render();};
document.querySelector('#answers').onclick=()=>{answers=true;trackWorksheet('worksheet_answer_view');render();};
document.querySelector('#new').onclick=()=>{seed=(seed+1)>>>0;trackWorksheet('worksheet_regenerate');render();};
document.querySelector('#print').onclick=()=>{trackWorksheet('worksheet_print_click');window.print();};
window.addEventListener('popstate',()=>{current=types.find(t=>location.pathname.endsWith('/'+t.id+'.html'))||types[0];family=current.family;operation=current.group;browse=new URLSearchParams(location.search).get('browse')==='curriculum'?'curriculum':'topic';grade=new URLSearchParams(location.search).get('grade')||'1';menu();answers=false;render();});
render();
