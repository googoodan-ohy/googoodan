(async()=>{
await CommonCoreBrowser.init();
const [bank,worksheets,training,units,searchIndex,trainingWorksheets,explanations,legacyGrades,koReuse]=await Promise.all(['concepts.json','worksheets.json','training.json','units.json','search.json','training-worksheets.json','training-explanations.json','legacy-grade-worksheets.json','ko-reuse-worksheets.json'].map(f=>fetch(f,{cache:"no-store"}).then(r=>{if(!r.ok)throw Error(f);return r.json()})));
const lessonFiles=await fetch('concept-lessons.json',{cache:'no-store'}).then(r=>r.json());
const lessonBank=Object.fromEntries(await Promise.all(Object.entries(lessonFiles).map(async([id,file])=>{const r=await fetch(file,{cache:'no-store'});if(!r.ok)throw Error(file);return [id,await r.json()]})));
for(const c of bank.concepts)c.lesson=lessonBank[c.id].html;
function relatedLessons(w){if(w.worksheetOnly||!w.conceptRefs?.length)return '';return '<section class="section lesson-copy"><h2>Teaching notes for this worksheet</h2>'+w.conceptRefs.map(id=>{const l=lessonBank[id];return '<article data-concept-id="'+id+'">'+l.html+'</article>'}).join('')+'</section>';}
const worksheetTopics=await fetch('worksheet-topics.json',{cache:'no-store'}).then(r=>r.json());
legacyGrades.push(...koReuse);
Object.assign(worksheets,trainingWorksheets);
Object.assign(worksheets,trainingWorksheets);
const topics={whole:'Whole Numbers',fractions:'Fractions',decimals:'Decimals',geometry:'Geometry',measurement:'Measurement',patterns:'Patterns & Relationships',data:'Data & Probability'};
const menu=document.querySelector('#menu'),content=document.querySelector('#content'),main=document.querySelector('main'),browse=document.querySelector('.browse');
if(innerWidth<=760)browse.open=false;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const link=(label,hash,active)=>`<a class="menu-link" href="#${hash}" ${active?'aria-current="page"':''}>${label}</a>`;
const head=(eyebrow,title,desc)=>`<div class="hero"><span class="eyebrow">${eyebrow}</span><h1>${title}</h1><p>${desc}</p></div>`;
function trainingExplanation(id){
 const e=explanations.worksheets[id];if(!e)return '';const l=explanations.lessons[e.lesson];
 return `<article class="section training-explanation"><h2>Teaching notes for parents and teachers</h2><p>${esc(e.intro)}</p>${e.condition?`<p>${esc(e.condition)}</p>`:''}<h3>${esc(l.title)}</h3><p>${esc(l.method)}</p><h3>Examples to explain together</h3>${e.examples.map(x=>`<div class="model"><strong>${esc(x.equation)}</strong><p>${esc(x.step)}</p></div>`).join('')}<h3>If your student needs help</h3><p>${esc(l.mistake)}</p><h3>Check understanding</h3><p>${esc(l.check)}</p><h3>Before independent practice</h3><p>Work through one example with your student, then ask them to explain the next step. Assign a few problems independently. If the same mistake appears again, revisit that step before assigning more.</p><a href="#concept/${l.concept}">See related teaching notes →</a></article>`;
}
const gradeName=g=>Number(g)===0?'Kindergarten':'Grade '+g;
function render(){
sessionStorage.setItem('us-concept-preview-route',location.hash||'#grades/1');
const [raw,arg,operation,selectedWorksheet,orientation]=location.hash.slice(1).split('/');const mode=['grades','topics','training','concept','search','legacy','standards'].includes(raw)?raw:'grades';
const origin=sessionStorage.getItem('layout-origin')||'grades';const navMode=(mode==='legacy'||mode==='concept')?origin.split('/')[0]:mode;
document.querySelectorAll('[data-mode]').forEach(a=>{if(a.dataset.mode===navMode)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});
if(navMode==='standards')menu.innerHTML='';
else if(navMode==='grades')menu.innerHTML='<p class="menu-heading">GRADES & UNITS</p>'+[0,1,2,3,4,5,6].map(g=>`<details class="grade-group" ${Number(arg||1)===g?'open':''}><summary>${gradeName(g)}</summary>${link('All '+gradeName(g)+' units','grades/'+g,!operation&&Number(arg||1)===g)}<div class="nested">${units.filter(u=>u.grade===g).map(u=>link(esc(u.title),'grades/'+g+'/'+u.id,Number(arg)===g&&operation===u.id)).join('')}</div></details>`).join('');
else if(navMode==='topics')menu.innerHTML='<p class="menu-heading">NUMBERS & OPERATIONS</p><div class="nested">'+['whole','fractions','decimals'].map(t=>link(topics[t],'topics/'+t,arg===t)).join('')+'</div>'+['geometry','measurement','patterns','data'].map(t=>link(topics[t],'topics/'+t,arg===t)).join('');
else menu.innerHTML=Object.entries(training).map(([domain,items])=>'<section class="training-domain domain-'+domain+'"><h2 class="domain-heading">'+topics[domain]+'</h2>'+items.map((t,i)=>link((['+','−','×','÷'][i]||'≈')+' &nbsp; '+t.name,'training/'+domain+'/'+i,(arg||'whole')===domain&&Number(operation||0)===i)).join('')+'</section>').join('');
if(mode==='standards'){
 CommonCoreBrowser.render({menu,content,grade:arg,code:operation,id:selectedWorksheet});
}else if(mode==='search'){
 let query='';try{query=decodeURIComponent(location.hash.slice('#search/'.length))}catch{};
 document.querySelector('#worksheet-query').value=query;
 const words=query.toLowerCase().trim().split(/\s+/).filter(Boolean);
 const found=words.length?searchIndex.filter(w=>words.every(word=>(w.title+' '+w.summary+' '+w.topic+' '+gradeName(w.grade)+' grade '+w.grade).toLowerCase().includes(word))):[];
 menu.innerHTML=link('Worksheets by Grade','grades',false)+link('Worksheets by Topic','topics',false)+link('Arithmetic Practice','training',false);
 content.innerHTML=head('FIND A WORKSHEET','Search worksheets',query?'Results for “'+esc(query)+'”':'Enter a topic or worksheet title, such as fractions or addition.')+`<p role="status">${found.length} worksheets found</p><div class="concept-list">${found.map(w=>`<a class="concept-row" href="#${w.route||'concept/'+w.conceptId+'/'+w.worksheetId}"><div><span class="eyebrow">${gradeName(w.grade)} · ${esc(w.topic)}</span><h3>${esc(w.title)} ↗</h3><p>${esc(w.summary)}</p></div></a>`).join('')}</div>`+(words.length&&!found.length?'<p>Try a shorter phrase, such as addition, fractions, or time.</p>':'');
}else if(mode==='legacy'){
 const w=legacyGrades.find(w=>w.id===arg);if(!w){content.innerHTML='<p>Worksheet not found.</p>';return;}
 content.innerHTML=`<a class="back-link" href="#${esc(origin)}">← Back to worksheets</a>`+head('GRADE '+w.grade,esc(w.title),'')+relatedLessons(w)+`<iframe title="${esc(w.title)}" src="${w.url}" style="width:100%;height:1400px;border:0;background:white"></iframe>`;
}else if(mode==='concept'){
 const c=bank.concepts.find(c=>c.id===arg);if(!c){content.innerHTML='<p class="empty">Choose a lesson from the menu.</p>';return;}
 content.innerHTML=`<a class="back-link" href="#${esc(origin)}">← Back to lessons</a>`+head(`${gradeName(c.grade)} · ${topics[c.topic]}`,esc(c.title),esc(c.intro))+`<div class="steps"><span>1 · Review the teaching notes</span><span>2 · Choose a worksheet</span><span>3 · Print for your student</span></div><div class="lesson-layout"><article class="section lesson-copy">${c.lesson}</article><aside class="practice-box"><h2>Worksheets for this skill</h2><p>Choose the practice that fits your student.</p>${c.worksheets.map(id=>{const w=worksheets[id];return `<a class="practice-link" data-worksheet="${w.url}" href="${w.url}"><small>${esc(w.kind)}</small>${esc(w.title)} ↗</a>`}).join('')}<p>Choose a worksheet above, then create a set and print it for your student. You can also view the answer key.</p><iframe id="worksheet-player" title="Practice worksheet" src="${worksheets[c.worksheets.includes(operation)?operation:c.worksheets[0]].url}"></iframe></aside></div>`;
}else if(mode==='training'){
 const domain=Object.hasOwn(training,arg)?arg:'whole';const i=/^\d+$/.test(operation||'')&&Number(operation)<training[domain].length?Number(operation):0,t=training[domain][i];
 const chosen=t.worksheets.includes(selectedWorksheet)?worksheets[selectedWorksheet]:null;
 content.innerHTML=head('ARITHMETIC PRACTICE',topics[domain]+' · '+t.name,'Choose a worksheet to see teaching notes and examples. Print a set when your student is ready to practice.')+(chosen?trainingExplanation(selectedWorksheet):'')+(chosen?`<a class="back-link" href="#training/${domain}/${i}">← All worksheets</a><section class="section"><h2>${esc(chosen.title)}</h2>${domain!=='fractions'&&(!chosen.formats||chosen.formats.includes('vertical'))?`<div class="actions"><a class="primary ${orientation==='horizontal'?'secondary':''}" href="#training/${domain}/${i}/${selectedWorksheet}/vertical">Vertical</a><a class="primary ${orientation==='horizontal'?'':'secondary'}" href="#training/${domain}/${i}/${selectedWorksheet}/horizontal">Horizontal</a></div>`:''}<iframe id="worksheet-player" title="${esc(chosen.title)}" src="${chosen.url}?layout=${domain!=='fractions'&&(!chosen.formats||chosen.formats.includes('vertical'))&&orientation!=='horizontal'?'vertical':'horizontal'}"></iframe></section>`:`<div class="training-gallery separate-gallery">${t.worksheets.map(id=>{const w=worksheets[id];return (w.formats||(domain==='fractions'?['horizontal']:['horizontal','vertical'])).map(format=>`<a class="training-card" href="#training/${domain}/${i}/${id}/${format}"><img src="thumbnails/${w.sourceType}${format==='vertical'?'-vertical':''}.png?v=a4-20260922c" alt="${esc(w.title)} ${format} worksheet preview" loading="lazy"><span title="${esc(w.title)} · ${format}">${esc(w.title)} · ${format==='vertical'?'Vertical':'Horizontal'}</span></a>`).join('')}).join('')}</div>`)+`<section class="section"><h2>Teaching tip</h2><p>${esc(t.tip)}</p></section>`;
}else{
 const grade=/^[0-6]$/.test(arg||'')?Number(arg):1;const topic=Object.hasOwn(topics,arg)?arg:'whole';const selected=mode==='grades'?String(grade):topic;
 const unit=mode==='grades'?units.find(u=>u.grade===grade&&u.id===operation):null;
 sessionStorage.setItem('layout-origin',mode+'/'+selected+(unit?'/'+unit.id:''));
 const items=bank.concepts.filter(c=>mode==='grades'?c.placements.some(m=>m.grade===grade&&(!unit||m.unit===unit.id)):c.topic===topic);
 const cards=items.flatMap(c=>c.worksheets.map(id=>({c,w:worksheets[id]})));
 const imports=legacyGrades.filter(w=>mode==='grades'?w.grade===grade&&(!unit||w.unit===unit.id):worksheetTopics[w.id]===topic);
 content.innerHTML=head(mode==='grades'?'WORKSHEETS BY GRADE':'WORKSHEETS BY TOPIC',mode==='grades'?(unit?esc(unit.title):gradeName(grade)+' Math'):topics[topic],'Choose a worksheet for your student. Review the teaching notes, work through an example together, then print a practice set.')+`<h2>Choose a worksheet <span class="count">· ${cards.length+imports.length} worksheets</span></h2><div class="training-gallery separate-gallery grade-gallery">${cards.map(({c,w})=>`<a class="training-card" href="#concept/${c.id}/${w.id}"><img src="/en/assets/worksheet-previews/${w.sourceType}.png?v=density-20260924" alt="${esc(w.title)} worksheet preview" loading="lazy"><span title="${esc(w.title)}">${esc(w.title)}</span></a>`).join('')}${imports.map(w=>`<a class="training-card" href="#legacy/${w.id}"><img src="${w.thumbnail}?v=density-20260924" alt="${esc(w.title)} worksheet preview" loading="lazy"><span title="${esc(w.title)}">${esc(w.title)}</span></a>`).join('')}</div>`;
 if(mode==='grades'&&!unit){content.innerHTML+=`<h2>${gradeName(grade)} units</h2><div class="concept-list">${units.filter(u=>u.grade===grade).map(u=>`<a class="concept-row" href="#grades/${grade}/${u.id}"><div><h3>${esc(u.title)}</h3><span class="count">View unit →</span></div></a>`).join('')}</div>`;}
 if(unit&&!items.length&&!legacyGrades.some(w=>w.grade===grade&&w.unit===unit.id)){content.innerHTML+=`<section class="section"><h2>Existing worksheets</h2><p>Choose a worksheet below and review it before assigning it.</p>${unit.worksheets.map(w=>`<a class="practice-link" data-worksheet="${w.url}" href="${w.url}">${esc(w.title)} ↗</a>`).join('')}</section>`;}
 menu.querySelectorAll('a').forEach(a=>{if(a.hash==='#'+mode+'/'+selected)a.setAttribute('aria-current','page')});
}
const player=document.querySelector('#worksheet-player');
if(player){
 player.addEventListener('load',()=>{
 const doc=player.contentDocument;
 const style=doc.createElement('style');style.textContent='@media screen{html{height:auto!important;overflow:hidden!important}body{position:static!important;height:auto!important;display:block!important;overflow:hidden!important}.site-header,.notice,body>footer,.layout>aside,.skip{display:none!important}.layout{display:block!important;padding:0!important;margin:0!important;overflow:visible!important}.layout>main{overflow:visible!important;padding:0!important}.layout>main>:not(#practice){display:none!important}#practice{margin:0!important;border:0!important;padding:12px!important}.sheet{max-width:100%!important}}';doc.head.append(style);
 const resize=()=>{player.style.height=Math.ceil(doc.body.getBoundingClientRect().height+12)+'px'};new player.contentWindow.ResizeObserver(resize).observe(doc.body);resize();
 });
 document.querySelectorAll('[data-worksheet]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();player.src=a.dataset.worksheet;document.querySelectorAll('[data-worksheet]').forEach(x=>x.removeAttribute('aria-current'));a.setAttribute('aria-current','page')}));
}
document.title=(content.querySelector('h1')?.textContent||'Math Worksheets')+' | googoodan.com';
main.scrollTop=0;if(innerWidth<=760)browse.open=false;
}
document.querySelector('.worksheet-search').addEventListener('submit',e=>{e.preventDefault();const q=document.querySelector('#worksheet-query').value.trim();const c=q.replace(/^CCSS\.Math\.Content\./i,'').toUpperCase();if(/^(K|[1-6])\.[A-Z]+\.[A-Z]\.\d+(\.[A-D])?$/.test(c)){const parts=c.split('.');if(parts.length===5)parts[4]=parts[4].toLowerCase();location.hash='standards/'+parts[0]+'/'+parts.join('.');}else location.hash='search/'+encodeURIComponent(q);});
window.addEventListener('hashchange',render);render();
})().catch(()=>{document.querySelector('#content').innerHTML='<p>Unable to load the worksheet library. Please reload the page.</p>'});
