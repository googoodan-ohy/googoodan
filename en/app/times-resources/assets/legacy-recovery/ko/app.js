const {types}=Worksheets;
const generate=(id,s,n)=>id==='times-tables'?GDTimes.rows(s,n):Worksheets.generate(id,s,n);
if(!types.some(t=>t.id==='times-tables'))types.push(GDTimes.type);
const familyNames={'Natural numbers':'자연수',Fractions:'분수',Decimals:'소수','Times tables':'구구단'};
const operationNames={Addition:'더하기',Subtraction:'빼기',Multiplication:'곱하기',Division:'나누기','Number sense':'수 감각'};
for(const t of types){
 const c=t.config;
 if(c?.kind==='natural')t.title=c.da+'자리 '+({'add':'덧셈','sub':'뺄셈','mul':'곱셈','div':'나눗셈'}[c.code])+' · '+c.db+'자리';
 else t.title=t.title.replaceAll('Addition within 20','20까지의 덧셈').replaceAll('Subtraction within 10','10까지의 뺄셈').replaceAll('Two-digit addition','두 자리 덧셈').replaceAll('Two-digit subtraction','두 자리 뺄셈').replaceAll('no regrouping','받아올림·내림 없음').replaceAll('regrouping','받아올림·내림 있음').replaceAll('One digit','한 자리').replaceAll('one digit','한 자리').replaceAll('Two digits','두 자리').replaceAll('two digits','두 자리').replaceAll('no remainders','나머지 없음').replaceAll('Find the missing number','빈칸에 알맞은 수').replaceAll('Compare numbers within 10','10까지 수 비교').replaceAll('Compare numbers','수 비교').replaceAll('Addition','덧셈').replaceAll('Subtraction','뺄셈').replaceAll('Multiplication','곱셈').replaceAll('Division','나눗셈').replaceAll('decimal places','자리 소수').replaceAll('decimal place','자리 소수').replaceAll('Whole number','자연수').replaceAll('whole number','자연수').replaceAll('different denominators','다른 분모').replaceAll('same denominators','같은 분모').replaceAll('improper fraction','가분수').replaceAll('proper fraction','진분수').replaceAll('mixed fraction','대분수').replaceAll('with negative numbers','· 음수 포함');
 t.instruction=t.group==='Division'?'나눗셈을 계산하세요. 필요한 경우 나머지도 쓰세요.':t.group==='Number sense'?'빈칸에 알맞은 수나 기호를 쓰세요.':'차근차근 계산하고 답을 써 보세요.';
}
let koBrowse='topic',koGrade=1;
function koMenu(){
 groups.innerHTML='<nav class="edition-tabs" aria-label="문제지 메뉴"><a id="ko-topic" href="/" aria-current="page"><span class="arithmetic-menu-icons" aria-hidden="true"><span>＋</span><span>−</span><span>×</span><span>÷</span></span><span>사칙연산</span></a><a class="drill-menu-link" href="/ko/drills.html">단원별연산</a><a id="ko-grade" href="/ko/units.html">단원별유형</a></nav>';
 document.querySelector('#ko-topic').onclick=e=>{e.preventDefault();koBrowse='topic';menu()};
 document.querySelector('#ko-grade').onclick=()=>{location.href='/ko/units.html'};
 if(koBrowse==='grade'){
  const nav=document.createElement('div');nav.className='filter-row';
  for(let i=1;i<=6;i++){const b=document.createElement('button');b.textContent=i+'학년';b.setAttribute('aria-pressed',koGrade===i);b.onclick=()=>{koGrade=i;menu()};nav.append(b)}groups.append(nav);
  const n=document.createElement('p');n.className='curriculum-note';n.textContent='학년·단원 메뉴 배치 예시입니다. 교육과정별 자료는 다음 단계에서 연결합니다.';groups.append(n);
  for(const title of ['1학기 · 단원 선택','2학기 · 단원 선택']){const b=document.createElement('button');b.className='menu-tile';b.textContent=title+' →';b.onclick=()=>showDetail(koGrade+'학년 '+title,'단원별 문제지를 이 자리에 연결할 예정입니다. 현재는 연산별 메뉴에서 실제 문제 생성과 인쇄를 테스트할 수 있습니다.');groups.append(b)}return;
 }
 const nav=document.createElement('div');nav.className='filter-row';
 for(const f of Object.keys(familyNames)){const b=document.createElement('button');b.className='number-category';b.innerHTML=numberArt[f]+'<span>'+familyNames[f]+'</span>';b.setAttribute('aria-pressed',family===f);b.onclick=()=>{family=f;operation=f==='Times tables'?'Multiplication':'Addition';if(f==='Times tables'){current=GDTimes.type;seed++;}menu();if(f==='Times tables')render();};nav.append(b)}groups.append(nav);
 if(family==='Times tables'){GDTimes.menu(groups,()=>{current=GDTimes.type;seed++;history.replaceState(null,'',location.pathname+'?type=times-tables&tables='+GDTimes.selected.join(',')+'&max='+GDTimes.max);render();});return;}
 const ops=document.createElement('div');ops.className='operation-row';
 for(const op of ['Addition','Subtraction','Multiplication','Division']){const b=document.createElement('button');b.textContent=icons[op];b.setAttribute('aria-label',operationNames[op]);b.setAttribute('aria-pressed',operation===op);b.onclick=()=>{operation=op;menu()};ops.append(b)}groups.append(ops);
 const heading=document.createElement('h2');heading.className='menu-heading';heading.textContent=familyNames[family]+' · '+operationNames[operation];groups.append(heading);
 const list=document.createElement('div');list.className='choices';
 for(const t of types.filter(t=>t.family===family&&t.group===operation).sort((a,b)=>digitOrder(a)-digitOrder(b))){const b=document.createElement('button');b.className='choice';b.dataset.id=t.id;b.innerHTML='<span class="example">'+exampleHTML(t)+'</span><small>'+t.title+'</small>';if(t===current)b.setAttribute('aria-current','page');b.onclick=()=>choose(t);list.append(b)}groups.append(list);
}

let current=types.find(t=>t.id===(new URLSearchParams(location.search).get('type')||(new URLSearchParams(location.search).has('tables')?'times-tables':null)))||types.find(t=>t.id===document.body.dataset.type)||types[0],seed=Number(new URLSearchParams(location.search).get("set"))||Math.floor(Math.random()*1e9),answers=false;
const groups=document.querySelector('.groups');
let family=current.family,operation=current.group,browse=new URLSearchParams(location.search).get('browse')==='curriculum'?'curriculum':'topic',grade=['K','1','2','3','4','5'].includes(new URLSearchParams(location.search).get('grade'))?new URLSearchParams(location.search).get('grade'):'1';
const icons={'Natural numbers':'123',Fractions:'½',Decimals:'0.5',Addition:'+',Subtraction:'−',Multiplication:'×',Division:'÷','Number sense':'□'};
function mathHTML(x){
 const text=String(x).replace(' R ',' 나머지 ');if(!text.includes('/'))return text.startsWith('-')?'('+text+')':text;
 const parts=text.split(' '),f=parts.pop().split('/');
 return (parts.length?'<span class="mixed-whole">'+parts[0]+'</span>':'')+'<span class="fraction"><span>'+f[0]+'</span><span>'+f[1]+'</span></span>';
}
function fractionAnswer(p){
 const gcd=(a,b)=>b?gcd(b,a%b):Math.abs(a);
 const [a,b]=Worksheets.rational(p.a),[c,d]=Worksheets.rational(p.b);
 let n,den;
 if(p.op==='+'||p.op==='−'){den=b/gcd(b,d)*d;n=a*(den/b)+(p.op==='+'?1:-1)*c*(den/d);}
 else if(p.op==='×'){n=a*c;den=b*d;}else{n=a*d;den=b*c;}
 if(den<0){n=-n;den=-den;}
 if(n===0)return '0';
 const forms=[],add=s=>{if(forms.at(-1)!==s)forms.push(s);};
 add(den===1?String(n):n+'/'+den);
 const sign=n<0?'-':'',abs=Math.abs(n),whole=Math.floor(abs/den),rem=abs%den;
 if(whole&&rem){add(sign+whole+' '+rem+'/'+den);const g=gcd(rem,den);if(g>1)add(sign+whole+' '+rem/g+'/'+den/g);}
 else if(!rem)add(String(n/den));
 else {const g=gcd(abs,den);if(g>1)add(n/g+'/'+den/g);}
 return forms.map(s=>'<span class="fraction-form">'+mathHTML(s)+'</span>').join('<span class="fraction-equals"> = </span>');
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
 if(t.family==='Natural numbers'&&op==='÷'&&n%d)result=Math.floor(n/d)+' 나머지 '+n%d;
 return mathHTML(left)+' '+op+' '+mathHTML(right)+' = '+green(t.family==='Fractions'?fractionAnswer({a:left,b:right,op}):mathHTML(result));
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
'Times tables':'<svg viewBox="0 0 100 52" aria-hidden="true"><rect x="18" y="4" width="64" height="44" rx="8" fill="#e9f5e9" stroke="#278477"/><text x="50" y="32" text-anchor="middle" font-size="21" fill="#176e5c">2×3</text></svg>'};
function choose(t){if(t.id===current.id)return;WorksheetNavigation.go(location.pathname+'?type='+encodeURIComponent(t.id));}
function menu(){koMenu();}
menu();
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
let trackedWorksheet=null;
function trackWorksheet(event){window.GDAnalytics?.track(event,{worksheet_id:current.id,worksheet_name:current.title,edition:'ko',number_family:current.family,operation:current.group,sheet_mode:answers?'answer':'worksheet'});}
function writtenWork(p,show){
 const natural=current.family==='Natural numbers',decimal=current.family==='Decimals';
 if(p.op==='×'&&p.vertical&&natural){
  const a=Number(p.a),b=String(p.b),partials=[...b].reverse().map((d,i)=>a*Number(d)*10**i);
  return '<div class="worked multiplication"><div>'+a+'</div><div class="work-rule">× '+b+'</div><div class="working '+(show?'':'concealed')+'">'+(b.length>1?partials.map((v,i)=>'<div>'+(i===partials.length-1?'+ ':'')+v+'</div>').join(''):'')+'<div class="'+(b.length>1?'work-total':'')+'">'+p.answer+'</div></div></div>';
 }
 if(p.op!=='÷'||!natural&&!decimal)return null;
 let a=Number(p.a),b=Number(p.b),note='';
 if(decimal){
  const places=(String(p.b).split('.')[1]||'').length,scale=10**places;
  a=Math.round(a*scale*100)/100;b=Math.round(b*scale);
  note='<div class="division-note">'+p.a+' ÷ '+p.b+(places?'<span class="'+(show?'':'concealed')+'"> = '+a+' ÷ '+b+'</span>':'')+'</div>';
 }
 const precision=decimal?Math.max((String(a).split('.')[1]||'').length,(String(p.answer).split('.')[1]||'').length):0;
 const input=decimal?a.toFixed(precision):String(a),chars=[...input],digits=chars.filter(c=>c!=='.');
 const x0=Math.max(58,String(b).length*15+12,String(p.b).length*15+12),cell=15,startY=49;
 const txt=(v,x,y,extra='')=>'<text x="'+x+'" y="'+y+'" '+extra+'>'+v+'</text>';
 let rem=0,started=false,body='',q='',steps=0;
 for(let i=0;i<digits.length;i++){
  const n=rem*10+Number(digits[i]),d=Math.floor(n/b);rem=n-d*b;
  if(!started&&d===0&&i<digits.length-1&&i<(input.includes('.')?input.indexOf('.')-1:digits.length-1)){q+=' ';continue;}
  started=true;q+=String(d);
  const x=x0+(i+1)*cell;
  if(steps>0)body+=txt(n,x,startY+steps*42-2);
  body+=txt('−'+d*b,x,startY+steps*42+17);
  body+='<path d="M'+(x-Math.max(String(n).length,String(d*b).length+1)*cell)+' '+(startY+steps*42+22)+'H'+(x+3)+'"/>';
  if(i===digits.length-1)body+=txt(rem,x,startY+steps*42+39);
  steps++;
 }
 let qi=0,top='';for(let i=0;i<chars.length;i++){if(chars[i]==='.')top+=txt('.',x0+qi*cell+5,20);else{top+=txt(q[qi]||'0',x0+(qi+1)*cell,20);qi++;}}
 let dividend='',di=0;for(const c of (decimal&&!show?[...String(p.a)]:chars)){if(c==='.')dividend+=txt('.',x0+di*cell+5,startY);else dividend+=txt(c,x0+(++di)*cell,startY);}
 const width=x0+Math.max(digits.length,String(p.a).replace('.','').length)*cell+16,height=startY+steps*42+4;
 return note+'<svg class="long-division" viewBox="0 0 '+width+' '+height+'" style="height:'+height+'px" aria-label="세로 나눗셈: '+p.a+' 나누기 '+p.b+'"><g text-anchor="end" font-family="monospace" font-size="19" fill="#243e55">'+txt(decimal&&!show?p.b:b,x0-9,startY)+dividend+'<path d="M'+(x0-2)+' '+(startY+5)+'V29H'+(width-3)+'" fill="none" stroke="#243e55"/><g class="working '+(show?'':'concealed')+'" fill="#c62828" stroke-width="1">'+top+'<g stroke="#c62828">'+body.replaceAll('<text ','<text stroke="none" ')+'</g></g></g></svg>';
}

function render(){
 if(current.id==='times-tables'){
  current.title='구구단 · '+GDTimes.selected.join('·')+'단 연습 (× 1~'+GDTimes.max+')';GDTimes.decorate(seed);
  document.querySelector('#new').disabled=!GDTimes.selected.length;
  if(!GDTimes.selected.length){document.querySelector('#sheet-title').textContent='연습할 단을 선택해 주세요';document.querySelector('.problems').innerHTML='';document.querySelector('#print').disabled=true;return;}
 }else{GDTimes.reset();document.querySelector('#new').disabled=false;}
 updatePrintSelection();
 if(trackedWorksheet!==current.id){trackWorksheet('worksheet_view');trackedWorksheet=current.id;}
 document.title=/^(?:\/|\/ko\/(?:index\.html)?)$/.test(location.pathname)?'무료 초등 수학 문제지 · 덧셈 뺄셈 곱셈 나눗셈 | 구구단닷컴':current.title+' | 구구단닷컴';
 // Keep the page-specific static description; shared renderers must not overwrite SEO metadata.

 document.querySelectorAll('.choice').forEach(a=>{if(a.dataset.id===current.id)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
 document.querySelector('#questions').setAttribute('aria-pressed',!answers);document.querySelector('#answers').setAttribute('aria-pressed',answers);
 document.querySelector('#sheet-title').textContent=current.title;
 document.querySelector('#instructions').textContent=answers?(current.family==='Fractions'?'약분 전후의 값은 같습니다. 배운 과정에 맞춰 채점해 주세요.':'정답과 풀이 · 현재 문제지와 같은 문제입니다.'):current.instruction;
 document.querySelector('#mode').textContent=answers?'정답지':'연습 문제지';
 document.querySelector('.problems').classList.toggle('decimal-sheet',current.family==='Decimals');
 document.querySelector('.problems').classList.toggle('fraction-sheet',current.family==='Fractions');
 const sample=generate(current.id,seed,1)[0];
 const isDivision=sample.op==='÷'&&['Natural numbers','Decimals'].includes(current.family);
 const isMultiplication=sample.op==='×'&&sample.vertical;
 const digits=String(sample.b).length;
 const cols=isDivision?2:isMultiplication?3:current.family==='Fractions'?2:4;
 const count=isDivision?(current.family==='Decimals'?4:(digits>=4?2:Math.max(String(sample.a).length,digits)>=3?4:6)):isMultiplication?(digits>=4?6:digits>=3?9:12):current.family==='Fractions'?20:sample.vertical?24:28;
 const rows=generate(current.id,seed,count);
 const paper=document.querySelector('.paper');paper.dataset.family=current.family;paper.style.setProperty('--rows',Math.ceil(count/cols));paper.style.setProperty('--cols',cols);paper.classList.toggle('written-sheet',isDivision||isMultiplication);
 document.querySelector('.problems').innerHTML=rows.map((p,i)=>{
 const value=answers?`<span class="answer">${p.fraction?fractionAnswer(p):mathHTML(p.answer)}</span>`:'<span class="blank"></span>';
 const display=x=>mathHTML(x);
 let html=p.vertical?`<div class="vertical"><div>${p.a}</div><div class="bottom"><span>${p.op}</span><span>${p.b}</span></div><div class="result">${answers?value:'&nbsp;'}</div></div>`:`<span class="expression">${display(p.a)} ${p.op} ${display(p.b)} =</span>${value}`;
 if(p.op==='missing')html=`<span class="expression">${p.a} + <span class="box">${answers?escape(p.answer):''}</span> = ${p.a+p.b}</span>`;
 if(p.op==='compare')html=`<span class="expression">${p.a} <span class="box">${answers?escape(p.answer):''}</span> ${p.b}</span>`;
 html=writtenWork(p,answers)||html;
 return `<div class="problem ${p.op==='missing'||p.op==='compare'?'concept':''}"><span class="number">${i+1}.</span>${html}</div>`;
 }).join('');
 document.querySelector('#set').textContent=`Set ${seed} · ${answers?'정답':count+'문제'}`;
 document.querySelector('#status').textContent=current.title+(answers?' · 정답지':' · '+count+'문제 준비 완료');
}
document.querySelector('#questions').onclick=()=>{answers=false;render();};
document.querySelector('#answers').onclick=()=>{answers=true;trackWorksheet('worksheet_answer_view');render();};
document.querySelector('#new').onclick=()=>{seed=(seed+1)>>>0;trackWorksheet('worksheet_regenerate');render();};
function clearPrintBundle(){document.querySelector('#print-bundle')?.remove();document.body.classList.remove('printing-bundle');}
function preparePrintBundle(){
 if(window.GDTimes?.chartActive)return;
 clearPrintBundle();
 const modes=[];if(document.querySelector('#print-worksheet').checked)modes.push(false);if(document.querySelector('#print-answer').checked)modes.push(true);
 if(!modes.length)return;
 const originalSeed=seed,copies=Math.min(20,Math.max(1,Math.floor(Number(document.querySelector('#worksheet-copies')?.value)||1)));const original=answers,bundle=document.createElement('div');bundle.id='print-bundle';
 try{for(let copy=0;copy<copies;copy++){seed=(originalSeed+copy)>>>0;for(const mode of modes){answers=mode;render();const page=document.querySelector('.paper').cloneNode(true);page.removeAttribute('id');page.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));const footer=page.querySelector('.paper-footer');if(footer&&copies>1){const label=document.createElement('span');label.textContent=(copy+1)+' / '+copies;footer.append(label);}bundle.append(page);}}}finally{seed=originalSeed;answers=original;render();}
 document.body.append(bundle);document.body.classList.add('printing-bundle');
}
function updatePrintSelection(){document.querySelector('#print').disabled=(current.id==='times-tables'&&!GDTimes.selected.length)||(!document.querySelector('#print-worksheet').checked&&!document.querySelector('#print-answer').checked);}
for(const id of ['print-worksheet','print-answer'])document.querySelector('#'+id).onchange=updatePrintSelection;
window.GDPreparePDF=preparePrintBundle;
window.addEventListener('beforeprint',preparePrintBundle);
window.addEventListener('afterprint',clearPrintBundle);
document.querySelector('#print').onclick=()=>{if(document.querySelector('#print').disabled)return;trackWorksheet('worksheet_print_click');preparePrintBundle();window.print();};
window.addEventListener('popstate',()=>{current=types.find(t=>location.pathname.endsWith('/'+t.id+'.html'))||types[0];family=current.family;operation=current.group;browse=new URLSearchParams(location.search).get('browse')==='curriculum'?'curriculum':'topic';grade=new URLSearchParams(location.search).get('grade')||'1';menu();render();});
render();

window.GDWorksheetContext=()=>({type:current.id,set:seed,...(current.id==='times-tables'?{tables:GDTimes.selected.join(','),max:GDTimes.max}:{})});
