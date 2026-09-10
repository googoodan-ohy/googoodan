(function(){
const C=KoCatalog,M=KoMath,$=s=>document.querySelector(s),E=s=>String(s).replace(/(-?\d+) +(\d+\/\d+)/g,'$1과 $2').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const params=new URLSearchParams(window.WORKSHEET_ENTRY?.query||location.search);
const replay=new URLSearchParams(location.search).get('set');if(replay&&/^\d{1,10}$/.test(replay))params.set('set',replay);
let grade=Math.min(6,Math.max(1,+params.get('grade')||1)),semester=+params.get('semester')===2?2:1;
let unit=C.units.find(u=>u.id===params.get('unit'))||C.units.find(u=>u.grade===grade&&u.semester===semester),profile=Math.max(0,+params.get('sheet')||0),seed=+params.get('set')||Math.floor(Math.random()*1e8),answer=false,sections=[],counts=[],compact=false;
grade=unit.grade;semester=unit.semester;
function mascot(kind){
 const face='<circle cx="45" cy="37" r="2" fill="#294552"/><circle cx="59" cy="37" r="2" fill="#294552"/><path d="M48 44Q52 48 56 44" stroke="#294552" fill="none" stroke-width="1.5"/>';
 const forms={
 rabbit:'<path d="M36 30Q24 2 35 4Q43 5 45 27M54 26Q64 0 71 7Q74 14 65 32" fill="#fff" stroke="currentColor" stroke-width="2"/><ellipse cx="52" cy="40" rx="24" ry="19" fill="#fff" stroke="currentColor" stroke-width="2"/>'+face,
 squirrel:'<path d="M70 60Q104 51 89 21Q75 12 74 28Q94 36 68 47" fill="#e7b17c" stroke="currentColor" stroke-width="2"/><path d="M32 31L32 15L44 24L60 24L70 15V37" fill="#d39b65" stroke="currentColor" stroke-width="2"/><ellipse cx="52" cy="41" rx="23" ry="19" fill="#f9d2a2"/>'+face,
 whale:'<path d="M17 45Q14 19 44 21Q74 20 77 46L95 33L93 54Q58 81 29 60Z" fill="#8ac9df" stroke="currentColor" stroke-width="2"/><path d="M37 16Q31 0 23 7M37 16Q39 0 49 7" stroke="currentColor" fill="none" stroke-width="3"/>'+face,
 bear:'<circle cx="32" cy="23" r="11" fill="#dbb079"/><circle cx="72" cy="23" r="11" fill="#dbb079"/><ellipse cx="52" cy="40" rx="27" ry="23" fill="#efd3a4"/>'+face+'<path d="M13 63L21 45L29 63Z" fill="#75a89c"/>',
 rocket:'<path d="M36 51L28 68L45 61M62 51L75 68L57 61" fill="#9b8cc8"/><path d="M40 60L50 78L59 60" fill="#efbb56"/><path d="M35 59Q31 25 50 7Q73 28 64 59Z" fill="#d9d3f1" stroke="currentColor" stroke-width="2"/><circle cx="50" cy="33" r="10" fill="#c7e7ee" stroke="currentColor"/>',
 dinosaur:'<path d="M24 63Q11 51 12 41L30 52Q29 25 48 24L48 14Q70 7 81 29L78 39L61 39V64L53 70L42 64L35 70Z" fill="#9ace91" stroke="currentColor" stroke-width="2"/><circle cx="69" cy="24" r="2" fill="#294552"/><path d="M29 43L20 37L30 32L25 24L38 26" fill="#e9bc69"/><path d="M64 33h10" stroke="#294552"/>',
 robot:'<rect x="29" y="18" width="47" height="36" rx="8" fill="#d2e5f2" stroke="currentColor" stroke-width="2"/><path d="M52 18V8" stroke="currentColor" stroke-width="2"/><circle cx="52" cy="7" r="4" fill="#edbb63"/><rect x="34" y="55" width="38" height="16" rx="4" fill="#a6c8dc"/>'+face+'<path d="M22 35V47M82 35V47M43 72V78M63 72V78" stroke="currentColor" stroke-width="5"/>',
 submarine:'<rect x="13" y="29" width="73" height="31" rx="16" fill="#edcd7f" stroke="currentColor" stroke-width="2"/><path d="M48 29V16H63" fill="none" stroke="currentColor" stroke-width="5"/><circle cx="36" cy="44" r="9" fill="#b8e0e3" stroke="currentColor"/><circle cx="64" cy="44" r="9" fill="#b8e0e3" stroke="currentColor"/><path d="M87 44L98 30V58Z" fill="#9bc9c9"/>',
 compass:'<path d="M9 20L34 13L62 22L94 12V64L65 72L36 64L9 73Z" fill="#f4dfb5" stroke="currentColor"/><circle cx="52" cy="43" r="24" fill="#fffaf0" stroke="currentColor" stroke-width="2"/><path d="M52 20L43 46L52 42L60 46Z" fill="#d57b65"/><path d="M52 65L43 46L52 42L60 46Z" fill="#79a3ae"/>',
 city:'<path d="M12 72V37H34V72M39 72V15H66V72M72 72V28H92V72" fill="#ccd6ec" stroke="currentColor" stroke-width="2"/><path d="M46 25h6m5 0h3m-14 11h6m5 0h3m-14 11h6m5 0h3M18 47h9M18 58h9M78 39h8M78 51h8" stroke="#edb850" stroke-width="4"/>',
 telescope:'<path d="M45 47L29 76M45 47L64 76M45 47V78" stroke="currentColor" stroke-width="3"/><path d="M19 34L72 12L82 33L30 54Z" fill="#aed9cc" stroke="currentColor" stroke-width="2"/><path d="M71 10L81 6L93 32L83 37Z" fill="#79b6a6"/>',
 satellite:'<path d="M39 29L62 43L53 61L31 47Z" fill="#d7d0e8" stroke="currentColor"/><path d="M11 13L35 27L24 45L1 31ZM67 46L93 61L81 79L57 65Z" fill="#8daccd" stroke="currentColor"/><path d="M37 24Q61 11 69 37Z" fill="#ece6f5" stroke="currentColor"/><path d="M57 27L72 12" stroke="currentColor" stroke-width="2"/><circle cx="73" cy="11" r="3" fill="#efbc5a"/>'
 };
 return '<svg class="mascot" viewBox="0 0 105 82" aria-hidden="true" style="color:var(--accent)">'+forms[kind]+'</svg>';
}
function theme(){return C.themes[(grade-1)*2+semester-1]}
function title(){return M.profiles(unit.id)[profile].name}
function mixedMarkup(html){return String(html).split(/(<[^>]*>)/g).map((s,i)=>i%2?s:s.replace(/(-?\d+) +(\d+\/\d+)/g,'$1과 $2')).join('')}
function qHTML(q,i){return '<div class="question" data-method="'+E(q.methodId||q.skill)+'" data-art="'+E(q.artId||'')+'"><span class="qnumber">'+i+'</span><div class="prompt">'+E(q.prompt)+'</div><div class="visual">'+mixedMarkup(q.visual)+'</div><div class="task">'+mixedMarkup(q.task)+'</div><div class="solution">'+E(q.answer)+'<span class="explanation">'+E(q.reason)+'</span></div></div>'}
function sheetHTML(isAnswer){
 let n=0;const t=theme();
 return '<article class="sheet '+(compact?'compact ':'')+(isAnswer?'answer-key':'')+'" data-sections="'+sections.length+'" data-grade="'+grade+'" style="--accent:'+t[2]+';--light:'+t[3]+'"><div class="sheet-top"><span class="worksheet-brand"><small>無料で、手軽に、くり返し練習！ · </small><b>googoodan</b> <small>· googoodan.com</small></span><span>'+grade+'年生 · '+(isAnswer?'解答と考え方':'算数の練習')+'</span></div><div class="hero"><div><small>'+E(t[0])+'</small><h2>'+unit.number+'. '+E(unit.name)+'</h2><small>'+title()+' · '+E(t[1])+'</small></div>'+mascot(t[4])+'</div><div class="fields"><span>名前: __________________</span><span>日付: ______________</span></div><div class="activities">'+sections.map((s,i)=>'<section class="activity"><h3><span>'+(i+1)+'</span>'+E(s.title)+'</h3><div class="question-grid">'+s.questions.slice(0,counts[i]).map(q=>qHTML(q,++n)).join('')+'</div></section>').join('')+'</div><footer class="sheet-footer"><b>無料で、手軽に、くり返し練習！ · googoodan · googoodan.com</b><span>'+unit.id+' / '+(profile+1)+' · '+seed+'</span></footer></article>';
}
function fit(){
 const holder=document.createElement('div');holder.className='measure';document.body.append(holder);
 function fits(){holder.innerHTML=sheetHTML(true);const a=holder.querySelector('.activities'),f=holder.querySelector('.sheet-footer');return a.scrollHeight<=a.clientHeight+0.5&&Math.max(...[...a.children].map(e=>e.getBoundingClientRect().bottom))<=f.getBoundingClientRect().top-8}
 let best=null;
 for(const small of [false,true]){
  compact=small;counts=sections.map(()=>1);if(!fits())continue;
  let changed=true;
  while(changed){changed=false;for(let i=0;i<counts.length;i++){if(counts[i]>=sections[i].questions.length)continue;counts[i]++;if(fits())changed=true;else counts[i]--;}}
  const total=counts.reduce((a,b)=>a+b,0);
  if(!best||total>best.total)best={total,compact,counts:[...counts]};
 }
 holder.remove();
 if(!best)throw Error('一枚に収まりません: '+unit.id+' / '+profile);
 counts=best.counts;compact=best.compact;
}

function scale(){const s=$('#sheet-view .sheet');if(!s)return;const ratio=Math.min(1,$('#sheet-view').clientWidth/s.offsetWidth);s.style.transform=ratio<1?'scale('+ratio+')':'';$('#sheet-view').style.height=s.offsetHeight*ratio+'px'}
function draw(){
 $('#sheet-view').innerHTML=sheetHTML(answer);$('#worksheet').setAttribute('aria-pressed',!answer);$('#answer').setAttribute('aria-pressed',answer);scale();
 $('#status').textContent=counts.reduce((a,b)=>a+b,0)+'問 · '+sections.length+'種類の練習 · 問題1枚 / 解答1枚';
}
function render(){
 profile=Math.min(profile,M.profiles(unit.id).length-1);sections=M.generate(unit.id,profile,seed,8);fit();draw();
 const t=theme();document.body.style.setProperty('--accent',t[2]);document.body.style.setProperty('--light',t[3]);
 $('#theme-scene').innerHTML=KoThemeScene(t[4],mascot);$('#theme-scene').setAttribute('aria-label',t[0]+' テーマの絵');$('#theme-name').textContent=t[0];$('#theme-motto').textContent=t[1];
 $('#coverage').textContent=sections.map(s=>s.title).join(' · ');
 
 history.replaceState(null,'',window.WORKSHEET_ENTRY?location.pathname:('?grade='+grade+'&semester='+semester+'&unit='+unit.id+'&sheet='+profile+'&set='+seed));
 renderProfileMenu();

}

let browseUnit=unit,browseGrade=grade,browseSemester=semester;
function goProfile(p){if(browseUnit.id===unit.id&&p===profile)return;unit=browseUnit;grade=unit.grade;semester=unit.semester;profile=p;render();}
function renderProfileMenu(){const active=browseUnit.id===unit.id;$('#profile-dots').innerHTML=M.profiles(browseUnit.id).map((item,i)=>'<button class="unit-type-choice" data-p="'+i+'" aria-pressed="'+(active&&i===profile)+'"><strong>'+E(item.name)+'</strong>'+(item.goal?'<small>'+E(item.goal)+'</small>':'')+'</button>').join('');$('#profile-dots').querySelectorAll('button').forEach(b=>b.onclick=()=>goProfile(+b.dataset.p));}
function menus(){
 $('#grades').innerHTML=[1,2,3,4,5,6].map(g=>'<button data-g="'+g+'" aria-pressed="'+(g===browseGrade)+'">'+g+'年生</button>').join('');
 $('#grades').querySelectorAll('button').forEach(b=>b.onclick=()=>{browseGrade=+b.dataset.g;browseUnit=C.units.find(u=>u.grade===browseGrade&&u.semester===browseSemester);menus();});
 $('#terms').innerHTML='';
 $('#terms').querySelectorAll('button').forEach(b=>b.onclick=()=>{browseSemester=+b.dataset.t;browseUnit=C.units.find(u=>u.grade===browseGrade&&u.semester===browseSemester);menus();});
 $('#unit').innerHTML=C.units.filter(u=>u.grade===browseGrade&&u.semester===browseSemester).map(u=>'<option value="'+u.id+'">'+u.number+'. '+E(u.name)+'</option>').join('');$('#unit').value=browseUnit.id;renderProfileMenu();
}
$('#unit').onchange=()=>{browseUnit=C.units.find(u=>u.id===$('#unit').value);renderProfileMenu()};
$('#new').onclick=()=>{window.GDAnalytics?.track('worksheet_regenerate',{worksheet_id:unit.id+'-'+profile,edition:'ko'});M.excludeArt([...document.querySelectorAll('#sheet-view [data-art-id]')].map(x=>x.dataset.artId));seed=(seed+1+Math.floor(Math.random()*99999999))%100000000;render()};
$('#worksheet').onclick=()=>{answer=false;draw()};$('#answer').onclick=()=>{answer=true;draw()};
function prepare(){if(!$('#print-q').checked&&!$('#print-a').checked){$('#print-bundle').innerHTML='';$('#status').textContent='印刷する問題または解答を選んでください。';return false}const originalSeed=seed,copies=Math.min(20,Math.max(1,Math.floor(Number(document.querySelector('#worksheet-copies')?.value)||1)));let pages='';try{for(let copy=0;copy<copies;copy++){seed=(originalSeed+copy)>>>0;render();pages+=($('#print-q').checked?sheetHTML(false):'')+($('#print-a').checked?sheetHTML(true):'');}}finally{seed=originalSeed;render();}$('#print-bundle').innerHTML=pages;return true}
for(const id of ['#print-q','#print-a'])$(id).onchange=()=>{$('#print').disabled=!$('#print-q').checked&&!$('#print-a').checked};
$('#print').onclick=async()=>{if(prepare()){await Promise.all([...document.querySelectorAll('#print-bundle img')].map(img=>img.decode().catch(()=>{})));window.print()}};window.GDPreparePDF=prepare;window.addEventListener('beforeprint',prepare);window.addEventListener('resize',scale);
window.GDWorksheetContext=()=>({grade,semester,unit:unit.id,sheet:profile,set:seed});
window.KoPreview={set:(id,p,s)=>{unit=C.units.find(u=>u.id===id);grade=unit.grade;semester=unit.semester;profile=p;seed=s;browseUnit=unit;browseGrade=grade;browseSemester=semester;menus();render()},prepare,inspect:()=>({unit:unit.id,profile,counts,sections}),sheetHTML};
menus();document.fonts.ready.then(render);
})();
