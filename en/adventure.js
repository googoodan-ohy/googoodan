(() => {
const $=id=>document.getElementById(id),catalog=KCatalog;
const params=new URLSearchParams(location.search);
let unit=catalog.find(u=>u.id===params.get('unit'))||catalog[0],index=Math.max(0,unit.items.findIndex(p=>p.id===params.get('sheet'))),answer=false,seed=Number(params.get('set'))||Math.floor(Math.random()*1000000);
const mascot='<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M22 39 Q10 0 30 8 L44 37 M56 37 Q67 0 80 10 L78 45" fill="#fff" stroke="#237976" stroke-width="3"/><ellipse cx="50" cy="62" rx="35" ry="30" fill="white" stroke="#237976" stroke-width="3"/><circle cx="38" cy="57" r="3" fill="#243d51"/><circle cx="63" cy="57" r="3" fill="#243d51"/><path d="M45 69 Q50 75 56 69" fill="none" stroke="#243d51" stroke-width="2"/><ellipse cx="29" cy="66" rx="7" ry="4" fill="#f5bdc9"/><ellipse cx="73" cy="66" rx="7" ry="4" fill="#f5bdc9"/></svg>';
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
$('unit').innerHTML=catalog.map(u=>`<option value="${u.id}">${u.title} · ${u.items.length}</option>`).join('');
function render(){
const profile=unit.items[index];$('unit').value=unit.id;
const sections=KEngine.generate(profile,seed);
$('sheet').innerHTML='<div class="sheet-head"><span class="brand">googoodan<span>●</span></span><span class="edition">KINDERGARTEN / MATH ADVENTURES</span></div><div class="hero"><div><span class="edition">'+(answer?'ANSWER KEY':'LET’S GROW TOGETHER')+'</span><h2>'+profile.title+'</h2><p>'+unit.title+' · Three little learning adventures</p></div>'+mascot+'</div><div class="student"><span>Name:</span><span>Date: ______________</span></div>'+sections.map((section,s)=>'<section class="activity"><h3><span class="badge">'+(s+1)+'</span>'+['Explore & discover','Think & try','Show what you know'][s]+'</h3><div class="cards">'+section.questions.map((q,i)=>'<div class="card"><span class="qid">'+(s*2+(s===2?1:0)+i+1)+'</span><p class="story">'+q.prompt+'</p>'+q.visual+'<div class="task">'+q.task+'</div>'+('<div class="solution"><b>'+(q.open?'Example / check: ':'Answer: ')+'</b>'+escape(q.answer)+'</div>')+'</div>').join('')+'</div></section>').join('')+'<div class="celebrate"><span>You explored. You tried. You grew!</span><span class="stars" aria-label="Three stars to color">☆ ☆ ☆</span></div><footer class="sheet-footer"><span><b>googoodan.com/en</b> · Kindergarten Math</span><span>'+unit.code+' · '+profile.id+' · Set '+seed+'</span></footer>';
$('variant').textContent=profile.title;$('position').textContent=(index+1)+' / '+unit.items.length+' · 54 worksheets total';$('worksheet').setAttribute('aria-pressed',!answer);$('answer').setAttribute('aria-pressed',answer);$('sheet').classList.toggle('is-answer',answer);const count=fitPrintedSheet();$('status').textContent=profile.title+', '+(answer?'answer key':count+' activities ready');
document.title=profile.title+' | Kindergarten | Googoodan';
history.replaceState(null,'','?unit='+unit.id+'&sheet='+profile.id+'&set='+seed);
}
const track=event=>window.GDAnalytics?.track(event,{worksheet_id:'k-'+unit.items[index].id,worksheet_name:unit.items[index].title,edition:'en',sheet_mode:answer?'answer':'worksheet'});
$('unit').onchange=e=>{unit=catalog.find(u=>u.id===e.target.value);index=0;answer=false;render();track('worksheet_view');};
for(const [id,step] of [['previous',-1],['next',1]])$(id).onclick=()=>{index=(index+step+unit.items.length)%unit.items.length;answer=false;render();track('worksheet_view');};
$('new').onclick=()=>{seed=(seed+1)%1000000;render();track('worksheet_regenerate');};$('worksheet').onclick=()=>{answer=false;render();};$('answer').onclick=()=>{answer=true;render();track('worksheet_answer_view');};$('print').onclick=()=>{track('worksheet_print_click');window.print();};render();track('worksheet_view');
})();
