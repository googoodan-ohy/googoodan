(function(root){const scope={Worksheets:{...root.Worksheets,types:root.Worksheets.types.slice()}};(function(globalThis){const Worksheets=globalThis.Worksheets;
(function(root){
const terms={
'1-1':[
['9까지의 수',['number:9','count:9','bond:9','compare:9'],'2수01-01,04'],
['여러 가지 모양',['solid-basic','solid-sort','solid-basic'],'2수03-01'],
['덧셈과 뺄셈',['add:9','sub:9','bond:9'],'2수01-04~07'],
['비교하기',['length-compare','area-compare','capacity-compare','weight-compare'],'2수03-06'],
['50까지의 수',['number:50','place:2','compare:50','sequence:50'],'2수01-01~03']],
'1-2':[
['100까지의 수',['number:100','place:2','compare:100','sequence:100'],'2수01-01~03'],
['덧셈과 뺄셈 (1)',['add:20','sub:20','three:9'],'2수01-05~09'],
['모양과 시각',['flat-basic','flat-count','flat-build','clock:30'],'2수03-03~05,07'],
['덧셈과 뺄셈 (2)',['add:20','bond:10','sub:20'],'2수01-04~09'],
['규칙 찾기',['pattern','sequence:100','array-pattern'],'2수02-01~02'],
['덧셈과 뺄셈 (3)',['add:20','sub:20','unknown:20'],'2수01-05~09']],
'2-1':[
['세 자리 수',['place:3','number:999','compare:999','sequence:999'],'2수01-02~03'],
['여러 가지 도형',['flat-basic','flat-count','cube-count'],'2수03-02~05'],
['덧셈과 뺄셈',['add:99','sub:99','three:20','unknown:99'],'2수01-05~09'],
['길이 재기',['ruler:cm','measure:cm','length-compare'],'2수03-10,12'],
['분류하기',['sort','table','sort'],'2수04-01~02'],
['곱셈',['groups','mul:9','array'],'2수01-10']],
'2-2':[
['네 자리 수',['place:4','number:9999','compare:9999','sequence:9999'],'2수01-02~03'],
['곱셈구구',['mul:9','groups','unknown-mul','array'],'2수01-11'],
['길이 재기',['convert:m','measure-add:m','ruler:cm'],'2수03-11~13'],
['시각과 시간',['clock:5','elapsed','calendar'],'2수03-07~09'],
['표와 그래프',['table','graph:picture','sort'],'2수04-01~03'],
['규칙 찾기',['pattern','sequence:100','array-pattern'],'2수02-01~02']],
'3-1':[
['덧셈과 뺄셈',['add:999','sub:999','unknown:999'],'4수01-03,08'],
['평면도형',['lines','angle-right','flat-count'],'4수03-01~02'],
['나눗셈',['div:9','groups-div','inverse'],'4수01-05'],
['곱셈',['mul:99','array','unknown-mul'],'4수01-04'],
['길이와 시간',['convert:mm','convert:km','clock:1','time-seconds'],'4수03-13~16'],
['분수와 소수',['fraction-model','fraction-compare','decimal-model','decimal-compare:1'],'4수01-09,11~12']],
'3-2':[
['곱셈',['mul:999','mul-two','unknown-mul'],'4수01-04,08'],
['원',['circle-parts','circle-size','circle-draw'],'4수03-06~07'],
['나눗셈',['div:99','div-remainder','inverse'],'4수01-05~06,08'],
['들이와 무게',['convert:L','convert:kg','convert:t','measure-add:L','measure-add:kg'],'4수03-17~23'],
['분수',['fraction-model','fraction-form','fraction-compare'],'4수01-09~11'],
['그림그래프',['graph:picture','table','graph:picture'],'4수04-01']],
'4-1':[
['큰 수',['place:8','large-number','compare:99999999','sequence:99999999'],'4수01-01~02'],
['각도',['angle-measure','angle-sum','triangle-angle','quad-angle'],'4수03-24~25'],
['곱셈과 나눗셈',['mul-two','div-two','inverse'],'4수01-04,07~08'],
['평면도형의 이동',['move','flip','turn'],'4수03-04~05'],
['막대그래프',['graph:bar','table','graph:bar'],'4수04-01,03'],
['규칙 찾기',['sequence:999','array-pattern','equal','pattern'],'4수02-01~03']],
'4-2':[
['분수의 덧셈과 뺄셈',['fraction-add-same','fraction-sub-same','fraction-mixed-same'],'4수01-15'],
['삼각형',['triangle-side','triangle-angle','triangle-type'],'4수03-08~09'],
['소수의 덧셈과 뺄셈',['decimal-add','decimal-sub','decimal-compare:3','decimal-place'],'4수01-13~14,16'],
['사각형',['quad-type','parallel','quad-angle'],'4수03-03,10'],
['꺾은선그래프',['graph:line','graph:line','table'],'4수04-02~03'],
['다각형',['polygon','diagonal','tile'],'4수03-11~12']],
'5-1':[
['자연수의 혼합 계산',['mixed','mixed-bracket','mixed-story'],'6수01-01'],
['약수와 배수',['factor','multiple','gcd','lcm'],'6수01-04~05'],
['대응 관계',['correspond','correspond','equal'],'6수02-01'],
['약분과 통분',['reduce','common-denominator','fraction-compare-unlike'],'6수01-06~07'],
['분수의 덧셈과 뺄셈',['fraction-add','fraction-sub','fraction-mixed'],'6수01-08'],
['다각형의 둘레와 넓이',['perimeter','area-rectangle','area-triangle','area-parallelogram','area-trapezoid','area-rhombus'],'6수03-11~14']],
'5-2':[
['수의 범위와 올림, 버림, 반올림',['range','round-up','round-down','round-nearest'],'6수01-02~03'],
['분수의 곱셈',['fraction-mul-whole','fraction-mul','fraction-mul-mixed'],'6수01-09'],
['합동과 대칭',['congruent','symmetry-line','symmetry-point'],'6수03-01~02'],
['소수의 곱셈',['decimal-mul-whole','decimal-mul','decimal-scale'],'6수01-13'],
['직육면체와 정육면체',['cuboid','cube-net','cuboid-edges'],'6수03-03~04'],
['평균과 가능성',['average','average-missing','chance'],'6수04-01,04~06']],
'6-1':[
['분수의 나눗셈',['fraction-div-whole','whole-div-fraction-result','fraction-div-whole'],'6수01-10~11'],
['각기둥과 각뿔',['prism','pyramid','prism-net'],'6수03-05~06'],
['소수의 나눗셈',['decimal-div-whole','decimal-fraction','decimal-div-whole'],'6수01-12,14~15'],
['비와 비율',['ratio','percent','ratio-compare'],'6수02-02~03'],
['여러 가지 그래프',['graph:strip','graph:pie','graph-choice'],'6수04-02~03'],
['직육면체의 겉넓이와 부피',['surface','volume','volume-convert'],'6수03-17~19']],
'6-2':[
['분수의 나눗셈',['fraction-div','whole-div-fraction','fraction-div-mixed'],'6수01-11'],
['공간과 입체',['cube-count','cube-view','cube-missing'],'6수03-09~10'],
['소수의 나눗셈',['decimal-div','decimal-div','decimal-fraction'],'6수01-12,14~15'],
['비례식과 비례배분',['proportion','share-ratio','ratio-simplify'],'6수02-04~05'],
['원의 넓이',['circle-circumference','circle-area','circle-half'],'6수03-15~16'],
['원기둥, 원뿔, 구',['cylinder','cone','sphere','cylinder-net'],'6수03-07~08']]
};
const themes=[
['새싹 정원의 토끼','꽃밭을 함께 탐험해요','#278477','#edf8e9','rabbit'],
['도토리 숲의 다람쥐','차곡차곡 실력을 모아요','#ad693d','#fff3e4','squirrel'],
['바다 탐험대','새로운 생각을 찾아 출발!','#237e9a','#eaf7fc','whale'],
['별빛 캠핑장','반짝이는 발견을 기록해요','#86622f','#fff8e8','bear'],
['우주 탐사선','한 걸음 더 멀리 생각해요','#6752a1','#f1effc','rocket'],
['공룡 연구소','관찰하고 규칙을 발견해요','#438354','#edf7eb','dinosaur'],
['로봇 발명실','방법을 찾고 설명해요','#376b91','#edf4fb','robot'],
['해저 연구 기지','깊이 생각하며 탐구해요','#257d88','#eaf7f6','submarine'],
['탐험가의 지도','개념을 연결해 길을 찾아요','#8c6240','#faf2e7','compass'],
['미래 도시 설계소','논리와 아이디어를 설계해요','#596b9b','#eff2fb','city'],
['수학 연구 팀','근거를 찾아 해결해요','#397a71','#ecf6f1','telescope'],
['다음 세계로의 항해','배운 것을 함께 펼쳐요','#6e5f90','#f4f0f9','satellite']
];
const recipes=[[0,1,2],[0,1,3],[0,1,4],[0,2,3],[0,2,4],[0,3,4],[1,2,3],[1,2,4],[1,3,4],[2,3,4],[0,1,2,3],[0,1,2,3,4]];
const modeNames=['개념을 살펴요','답을 찾아요','옳고 그름을 찾아요','개념을 활용해요','생각을 설명해요'];
const units=Object.entries(terms).flatMap(([term,rows])=>rows.map(([name,skills,standard],i)=>({id:term+'-'+(i+1),grade:+term[0],semester:+term[2],number:i+1,name,skills,standard})));
root.KoCatalog={units,themes,recipes,modeNames};
if(typeof module!=='undefined')module.exports=root.KoCatalog;
})(globalThis);

const KoCatalog=globalThis.KoCatalog;
/* Standalone curriculum drill catalogue. Existing worksheet types remain unchanged. */
(function(root){
const W=Worksheets,units=[],profiles=new Map(),labels={add:'덧셈',sub:'뺄셈',mul:'곱셈',div:'나눗셈'};
function unit(id){const original=KoCatalog.units.find(u=>u.id===id);const u={...original,drills:[]};units.push(u);return u;}
function put(u,source,title,group='기본 연산',mode='basic',layout='horizontal',extra={}){const id=u.id+'--'+u.drills.length;const base=W.types.find(t=>t.id===source)||W.types[0];const p={id,source,title,group,mode,layout,...extra};u.drills.push(p);profiles.set(id,p);W.types.push({...base,id,title,config:base.config?{...base.config}:undefined});return p;}
function natural(u,code,pairs,group='기본 연산',vertical=true){for(const [a,b]of pairs)for(const layout of vertical?['horizontal','vertical']:['horizontal'])put(u,`natural-${code}-${a}-${b}`,`${a}자리 ${code==='add'?'+':code==='sub'?'−':code==='mul'?'×':'÷'} ${b}자리 · ${layout==='vertical'?'세로셈':'가로셈'}`,group,'basic',layout);}
function source(u,id,title,group='기본 연산',vertical=false,extra={}){for(const layout of vertical?['horizontal','vertical']:['horizontal'])put(u,id,title+(vertical?' · '+(layout==='vertical'?'세로셈':'가로셈'):''),group,'basic',layout,extra);}
function skill(u,key,title,group='기초 보충'){put(u,'add-small',title,group,'skill','horizontal',{skill:key});}
function extensions(u){const bases=u.drills.filter(p=>p.group==='기본 연산'&&p.mode==='basic');const byOp=new Map();for(const p of bases){const t=W.types.find(t=>t.id===p.source);const op=t.config?.code||p.source.split('-')[0];if(!byOp.has(op))byOp.set(op,p);}
for(const [op,p] of byOp){put(u,p.source,(labels[op]||'계산')+' · 가로식 빈칸','빈칸 응용','blank','horizontal',{sourceExtra:p});if(u.grade>=2&&bases.some(b=>b.source===p.source&&b.layout==='vertical')&&W.types.find(t=>t.id===p.source)?.family==='Natural numbers')put(u,p.source,(labels[op]||'계산')+' · 세로 숫자 빈칸','빈칸 응용','digit','vertical',{sourceExtra:p});}
const candidates=bases.filter(p=>p.layout==='horizontal');if(candidates.length)put(u,candidates[0].source,'상황을 읽고 알맞은 계산 찾기','문장 연습','story','horizontal',{pool:candidates.map(p=>({source:p.source,extra:p}))});}
function prereq(u,full=false){for(const [k,n]of [['improper','가분수를 대분수로'],['mixed','대분수를 가분수로'],['factor','약수 찾기'],['common-factor','공약수 찾기'],['gcd','최대공약수'],['reduce','약분하기']])skill(u,k,n);if(full)for(const [k,n]of [['multiple','배수 찾기'],['common-multiple','공배수 찾기'],['lcm','최소공배수'],['common','통분하기']])skill(u,k,n);}
for(const [id,max,carry] of [['1-1-3',9,false],['1-2-2',99,false],['1-2-4',10,false],['1-2-6',20,true]]){const u=unit(id);for(const code of ['add','sub'])source(u,code==='add'?'add-small':'subtract-small',labels[code]+' · '+(max===99?'두 자리와 한 자리':max+'까지'), '기본 연산',false,{custom:'early',code,max,carry});skill(u,id==='1-1-3'?'bond9':'bond',id==='1-1-3'?'9까지 가르기·모으기':'10 만들기');source(u,'subtract-small','9까지 뺄셈','기초 보충',false,{custom:'early',code:'sub',max:9});source(u,'add-small','5까지 덧셈','기초 보충',false,{custom:'early',code:'add',max:5});extensions(u);}
{const u=unit('2-1-3');for(const op of ['add','sub']){natural(u,op,[[2,2]]);natural(u,op,[[2,1],[1,1]],'기초 보충');for(const condition of ['no-carry','carry'])for(const layout of ['horizontal','vertical'])put(u,'natural-'+op+'-2-2',labels[op]+' · '+(condition==='carry'?'받아올림·내림 집중':'받아올림·내림 없음')+' · '+(layout==='vertical'?'세로':'가로'),'기본 연산','basic',layout,{condition});}extensions(u);}
{const u=unit('2-1-6');source(u,'multiply-one','몇씩 몇 묶음의 곱셈');skill(u,'repeat','같은 수를 여러 번 더하기','기본 연산');skill(u,'groups','묶음 그림을 곱셈식으로','기본 연산');source(u,'add-small','덧셈 복습','기초 보충');extensions(u);}
function tables(u,group='기초 보충'){for(const ds of [[2],[3],[4],[5],[6],[7],[8],[9],[2,3,4],[4,5,6],[6,7,8,9],[2,3,4,5,6,7,8,9],[0,1]])source(u,'multiply-one',(ds.length>4?'구구단 전체':ds.join('·')+'단 익히기')+(u.id==='2-2-2'&&ds.length===1?' · 계산 연습':''),group,false,{tables:ds});}
{const u=unit('2-2-2');tables(u,'기본 연산');skill(u,'repeat','같은 수 덧셈');skill(u,'groups','그림을 곱셈식으로');extensions(u);}
{const u=unit('3-1-1');for(const op of ['add','sub']){natural(u,op,[[3,3]]);for(const layout of ['horizontal','vertical'])put(u,'natural-'+op+'-3-3',labels[op]+' · 받아올림·내림 집중 · '+(layout==='vertical'?'세로':'가로'),'기본 연산','basic',layout,{condition:'carry'});natural(u,op,[[2,2],[3,2]],'기초 보충');}extensions(u);}
{const u=unit('3-1-3');source(u,'divide','구구단 범위의 나눗셈');tables(u);extensions(u);}
for(const [id,mul,div,pm,pd] of [
['3-1-4',[[2,1]],[],[[1,1]],[]],['3-2-1',[[3,1],[2,2]],[],[[2,1],[1,1]],[]],
['3-2-3',[],[[2,1],[3,1]],[[1,1]],[]],['4-1-3',[[3,2]],[[2,2],[3,2]],[[2,2],[3,1]],[[2,1],[3,1]]]]){const u=unit(id);natural(u,'mul',mul);natural(u,'div',div);natural(u,'mul',pm,'기초 보충');natural(u,'div',pd,'기초 보충');tables(u);for(const [a,b]of div)for(const remainder of [false,true])for(const layout of ['horizontal','vertical'])put(u,`natural-div-${a}-${b}`,`${a}자리 ÷ ${b}자리 · ${remainder?'나머지 있음':'나누어떨어짐'} · ${layout==='vertical'?'세로':'가로'}`,'기본 연산','basic',layout,{remainder});extensions(u);}
{const u=unit('4-2-1');for(const op of ['add','sub']){source(u,`fraction-${op}-same`,'같은 분모 · '+labels[op]);for(const pair of [['mixed','mixed'],['whole','proper'],['improper','proper']])source(u,`fraction-${op}-${pair[0]}-${pair[1]}`,'같은 분모 · '+({mixed:'대분수',whole:'자연수',improper:'가분수'}[pair[0]])+' '+labels[op],'기본 연산',false,{same:true});}skill(u,'improper','가분수를 대분수로');skill(u,'mixed','대분수를 가분수로');skill(u,'one-fraction','자연수 1을 분수로');extensions(u);}
function decimals(u,ops,max,division=false){for(const op of ops)for(let a=0;a<=max;a++)for(let b=0;b<=max;b++){if(!a&&!b||division&&b!==0)continue;const id=a===b?`decimal-${op}-${a}`:`decimal-${op}-${a}dp-${b}dp`;if(W.types.some(t=>t.id===id))source(u,id,`${a?'소수 '+a+'자리':'자연수'} ${labels[op]} ${b?'소수 '+b+'자리':'자연수'}`,'기본 연산',true);else if(a===3||b===3)for(const layout of ['horizontal','vertical'])put(u,'decimal-'+op+'-2',`소수 ${a}자리 ${labels[op]} 소수 ${b}자리 · `+(layout==='vertical'?'세로':'가로'),'기본 연산','basic',layout,{decimalPlaces:[a,b],code:op});}skill(u,'decimal-scale','소수점과 10·100배');}
{const u=unit('4-2-3');decimals(u,['add','sub'],3);natural(u,'add',[[2,2]],'기초 보충');natural(u,'sub',[[2,2]],'기초 보충');extensions(u);}
{const u=unit('5-1-1');for(const [k,n]of [['mixed-add','덧셈·뺄셈 혼합'],['mixed-mul','곱셈·나눗셈 혼합'],['mixed-four','사칙 혼합'],['mixed-bracket','괄호가 있는 혼합 계산']])skill(u,k,n,'기본 연산');for(const op of ['add','sub','mul','div'])natural(u,op,[[2,1]],'기초 보충');put(u,'add-small','상황을 읽고 알맞은 계산 찾기','문장 연습','story','horizontal',{pool:[{source:'natural-add-2-2'},{source:'natural-sub-2-2'},{source:'multiply-one'},{source:'divide'}]});}
for(const id of ['5-1-2','5-1-4']){const u=unit(id);for(const [k,n]of [['factor','약수 찾기'],['multiple','배수 찾기'],['common-factor','공약수'],['common-multiple','공배수'],['gcd','최대공약수'],['lcm','최소공배수'],...(id==='5-1-4'?[['reduce','약분'],['common','통분'],['compare-fraction','통분해서 크기 비교']]:[])])skill(u,k,n,(id==='5-1-2'||['reduce','common','compare-fraction'].includes(k))?'기본 연산':'기초 보충');natural(u,'mul',[[1,1]],'기초 보충');source(u,'divide','나누어떨어지는 나눗셈','기초 보충');}
for(const [id,op]of [['5-1-5','add'],['5-2-2','mul'],['6-1-1','div'],['6-2-1','div']]){const u=unit(id),ops=op==='add'?['add','sub']:[op];for(const code of ops){source(u,`fraction-${code}-different`,'진분수 '+labels[code]+' 진분수',id==='6-1-1'?'기초 보충':'기본 연산');for(const a of ['whole','proper','improper','mixed'])for(const b of ['whole','proper','improper','mixed']){if(a==='whole'&&b==='whole'||a==='proper'&&b==='proper'||id==='6-1-1'&&b!=='whole')continue;const src=`fraction-${code}-${a}-${b}`;if(W.types.some(t=>t.id===src)){const names={whole:'자연수',proper:'진분수',improper:'가분수',mixed:'대분수'};source(u,src,names[a]+' '+labels[code]+' '+names[b]);}}}if(id==='6-1-1')u.drills=u.drills.filter(p=>p.source!=='fraction-div-different');prereq(u,['5-1-5','6-2-1'].includes(id));if(id==='5-1-5')for(const c of ['add','sub'])source(u,`fraction-${c}-same`,'같은 분모 '+labels[c],'기초 보충');if(op==='div')source(u,'fraction-mul-different','분수 곱셈 복습','기초 보충');extensions(u);}
{const u=unit('5-2-4');decimals(u,['mul'],2);natural(u,'mul',[[2,1],[2,2]],'기초 보충');extensions(u);}
for(const id of ['6-1-3','6-2-3']){const u=unit(id);decimals(u,['div'],2,id==='6-1-3');natural(u,'div',[[2,1],[3,1]],'기초 보충');source(u,'decimal-mul-1','소수 곱셈 검산','기초 보충');extensions(u);}

// Remedial lists stop at the immediately preceding grade; same-grade earlier concepts remain useful.
function review(u,src,label,learned,layout='horizontal',extra={}){const id=u.id+'--review-'+src+'-'+layout,base=W.types.find(t=>t.id===src);if(!base)throw Error('Unknown review source '+src);const p={id,source:src,title:label,group:'기초 보충',mode:'basic',layout,reviewGrade:learned,...extra};u.drills.push(p);profiles.set(id,p);W.types.push({...base,id,config:base.config?{...base.config}:undefined});}
for(const u of units){if(u.grade<4)continue;
const keep=p=>{if(p.group!=='기초 보충')return true;
if(u.grade===4){if(p.tables||p.source==='natural-mul-1-1')return false;if(u.id==='4-2-3')return false;return true;}
if(u.grade===5){if(p.tables||['improper','mixed'].includes(p.skill))return false;if(p.source.startsWith('natural-')||p.source==='divide')return false;return true;}
if(u.grade===6){if(['improper','mixed'].includes(p.skill)||p.source.startsWith('natural-div-'))return false;return true;}return true;};
u.drills=u.drills.filter(keep);
if(u.id==='4-2-3'){for(const op of ['add','sub'])for(const layout of ['horizontal','vertical'])review(u,'natural-'+op+'-3-3','3학년 복습 · 세 자리 '+labels[op]+' · '+(layout==='vertical'?'세로셈':'가로셈'),3,layout);}
if(['5-1-1','5-1-2','5-1-4','5-2-4'].includes(u.id)){for(const op of ['mul','div']){if(u.id==='5-2-4'&&op==='div')continue;for(const layout of ['horizontal','vertical'])review(u,'natural-'+op+'-3-2','4학년 복습 · 세 자리와 두 자리 '+labels[op]+' · '+(layout==='vertical'?'세로셈':'가로셈'),4,layout);}}
if(u.id==='5-2-2')for(const op of ['add','sub'])review(u,'fraction-'+op+'-same','4학년 복습 · 같은 분모 '+labels[op],4);
if(u.id==='6-1-3'||u.id==='6-2-3'){for(const layout of ['horizontal','vertical'])review(u,'decimal-mul-2','5학년 복습 · 소수 곱셈 · '+(layout==='vertical'?'세로셈':'가로셈'),5,layout);}
for(const p of u.drills.filter(p=>p.group==='기초 보충')){if(!p.reviewGrade)p.reviewGrade=(p.skill&&['factor','multiple','common-factor','common-multiple','gcd','lcm','reduce','common'].includes(p.skill))?5:u.grade-1;}
}

// Read operand-to-operand titles naturally; retain nouns in names such as '분수의 곱셈'.
for(const u of units)for(const p of u.drills){p.title=p.title.replace(/(덧셈|뺄셈|곱셈|나눗셈)(?= (?:자연수|진분수|가분수|대분수|소수))/g,m=>({덧셈:'더하기',뺄셈:'빼기',곱셈:'곱하기',나눗셈:'나누기'}[m]));const t=W.types.find(t=>t.id===p.id);if(t)t.title=p.title;}
const order=['기본 연산','기초 보충','빈칸 응용','문장 연습'];for(const u of units)u.drills.sort((a,b)=>order.indexOf(a.group)-order.indexOf(b.group));
root.DrillCatalog={units:units.sort((a,b)=>a.id.localeCompare(b.id)),profiles};
})(globalThis);

const DrillCatalog=globalThis.DrillCatalog;
(function(root){
const W=Worksheets,baseGenerate=W.generate,gcd=(a,b)=>b?gcd(b,a%b):Math.abs(a),lcm=(a,b)=>a/gcd(a,b)*b;
function random(seed){let s=seed>>>0;return (a,b)=>{s+=0x6d2b79f5;let t=s;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return a+Math.floor(((t^t>>>14)>>>0)/4294967296*(b-a+1));};}
const f=(n,d)=>W.fraction(n,d),val=x=>{const[n,d]=W.rational(x);return n/d};
function early(p,r){let a,b;do{a=r(0,p.max===99?89:p.max);b=r(0,p.max===99?9:p.max);if(p.carry){a=r(2,9);b=r(2,9);}}while(p.code==='add'?(a+b>p.max||p.carry&&a+b<=10||p.max===99&&a%10+b>9):p.carry?a+b<=10:a<b);if(p.carry&&p.code==='sub'){const t=a+b;b=a;a=t;}return {a,b,op:p.code==='add'?'+':'−',answer:p.code==='add'?a+b:a-b};}
function one(p,r,attempt){let q;
if(p.custom==='early')q=early(p,r);
else if(p.tables){const a=p.tables[r(0,p.tables.length-1)],b=r(1,9);q={a,b,op:'×',answer:a*b};}
else if(p.decimalPlaces){const[a,b]=p.decimalPlaces,x=r(1,20*10**a),y=r(1,10*10**b);q={a:(x/10**a).toFixed(a),b:(y/10**b).toFixed(b),op:p.code==='add'?'+':'−'};if(p.code==='sub'&&val(q.a)<val(q.b))[q.a,q.b]=[q.b,q.a];const[n,d]=W.exact(q.a,q.b,q.op);q.answer=String(Number((n/d).toFixed(3)));}
else q={...baseGenerate(p.source,r(0,0x7fffffff),1)[0]};
if(p.source==='divide'&&Number(q.answer)>9)return null;
if(p.same){const [n,d]=W.rational(q.a),[m,e]=W.rational(q.b);if(d!==1&&e!==1){const rem=Math.max(1,Math.round((m%e)/e*(d-1))),whole=Math.floor(m/e);q.b=String(q.b).includes(' ')?whole+' '+rem+'/'+d:(whole*d+rem)+'/'+d;}if(q.op==='−'&&val(q.a)<val(q.b))[q.a,q.b]=[q.b,q.a];const[nn,dd]=W.exact(q.a,q.b,q.op);q.answer=f(nn,dd);}
if(p.condition){const a=Number(q.a),b=Number(q.b);let x=a,y=b,carry=false;while(x||y){if(q.op==='+'?x%10+y%10>=10:x%10<y%10)carry=true;x=Math.floor(x/10);y=Math.floor(y/10);}if(carry!==(p.condition==='carry'))return null;}
if(p.remainder!==undefined&&!!(Number(q.a)%Number(q.b))!==p.remainder)return null;
q.vertical=p.layout==='vertical';return q;
}
function skill(key,r){const a=r(2,12),b=r(2,12),g=r(2,8),n=r(1,8),d=r(n+1,12),x=a*g,y=b*g;
const factors=v=>Array.from({length:v},(_,i)=>i+1).filter(k=>v%k===0);
const out=(prompt,answer,work='')=>({prompt,answer:String(answer),work});
switch(key){
case 'bond9':return out(`${a%9} + □ = 9`,9-a%9);
case 'bond':return out(`${a%10} + □ = 10`,10-a%10);
case 'repeat':return out(Array(a).fill(b).join(' + ')+' = ',a*b);
case 'groups':return {...out('그림을 보고 곱셈식과 전체 개수를 쓰세요.',`${a} × ${b} = ${a*b}`),groups:[a,b]};
case 'factor':return out(`${x}의 약수를 모두 쓰세요.`,factors(x).join(', '));
case 'multiple':return out(`${a}의 배수를 작은 것부터 5개 쓰세요.`,Array.from({length:5},(_,i)=>a*(i+1)).join(', '));
case 'common-factor':return out(`${x}과 ${y}의 공약수를 모두 쓰세요.`,factors(gcd(x,y)).join(', '));
case 'common-multiple':return out(`${a}과 ${b}의 공배수를 작은 것부터 3개 쓰세요.`,[1,2,3].map(k=>lcm(a,b)*k).join(', '));
case 'gcd':return out(`${x}과 ${y}의 최대공약수를 구하세요.`,gcd(x,y));
case 'lcm':return out(`${a}과 ${b}의 최소공배수를 구하세요.`,lcm(a,b));
case 'reduce':return out(`${n*g}/${d*g}을 기약분수로 나타내세요.`,f(n,d));
case 'common':{const z=lcm(a,b);return out(`1/${a}과 1/${b}을 가장 작은 공통 분모로 통분하세요.`,`${z/a}/${z}, ${z/b}/${z}`);}
case 'compare-fraction':{const z=lcm(a,b);return out(`1/${a} □ 1/${b}  (>, <, =)`,a<b?'>':a>b?'<':'=',`${z/a}/${z}, ${z/b}/${z}`);}
case 'improper':{const nn=a*d+n;return out(`${nn}/${d}을 대분수로 나타내세요.`,`${a}과 ${n}/${d}`);}
case 'mixed':return out(`${a}과 ${n}/${d}을 가분수로 나타내세요.`,`${a*d+n}/${d}`);
case 'one-fraction':return out(`1 = □/${d}`,d);
case 'decimal-scale':{const z=(a/10).toFixed(1),scale=[10,100,1000][r(0,2)];return out(`${z} × ${scale} = `,a*scale/10);}
case 'mixed-add':return out(`${x} + ${y} − ${g} = `,x+y-g);
case 'mixed-mul':return out(`${a*b} ÷ ${a} × ${g} = `,b*g);
case 'mixed-four':return out(`${x} + ${a} × ${b} − ${g} = `,x+a*b-g);
case 'mixed-bracket':return out(`(${a} + ${b}) × ${g} = `,(a+b)*g);
default:throw Error('Unknown skill '+key);
}}
function story(q,index,r,grade){let a=q.a,b=q.b,c=q.answer;const [nn,dd]=W.exact(a,b,q.op);c=f(nn,dd);let prompt,answer,work;
// Addition/subtraction relations alternate semantic roles, never a fixed operation order.
if(q.op==='+'||q.op==='−'){if(q.op==='−'){[a,b,c]=[q.b,c,q.a];}const form=index%6;const items=[
[`${a}보다 ${b} 큰 수는 얼마인가요?`,c,`${a} + ${b} = ${c}`],
[`${a}이 ${c}이 되려면 얼마가 더 필요한가요?`,b,`${c} − ${a} = ${b}`],
[`${b}은 ${c}보다 얼마나 작은가요?`,a,`${c} − ${b} = ${a}`],
[`두 양을 합하면 ${c}입니다. 한 양이 ${a}이면 나머지는 얼마인가요?`,b,`${c} − ${a} = ${b}`],
[`${a}에 어떤 수를 더했더니 ${c}이 되었습니다. 어떤 수인가요?`,b,`${c} − ${a} = ${b}`],
[`${a}만큼 있던 양에 ${b}만큼을 더 모았습니다. 모두 얼마인가요?`,c,`${a} + ${b} = ${c}`]];[prompt,answer,work]=items[form];}
else{if(q.op==='÷'){if(String(q.answer).includes(' R ')){const [quot,rem]=String(q.answer).split(' R ');return {prompt:`${a}개를 한 묶음에 ${b}개씩 묶습니다. 몇 묶음이고 몇 개가 남나요?`,answer:`${quot}묶음, ${rem}개`,work:`${a} ÷ ${b} = ${q.answer.replace(' R ',' 나머지 ')}`};}[a,b,c]=[q.b,c,q.a];}
const fractional=String(a).includes('/')||String(b).includes('/');const allowInverse=grade>=6||!fractional&&grade>=3;const forms=allowInverse?4:2;const k=index%forms;
if(k===0){prompt=`한 묶음의 양이 ${a}입니다. ${b}묶음에 해당하는 양은 얼마인가요?`;answer=c;work=`${a} × ${b} = ${c}`;}
else if(k===1){prompt=`${a}의 ${b}배에 해당하는 수를 구하세요.`;answer=c;work=`${a} × ${b} = ${c}`;}
else if(k===2){prompt=`전체 양 ${c}을 ${a}씩 나누면 몇 묶음인가요?`;answer=b;work=`${c} ÷ ${a} = ${b}`;}
else {prompt=`전체 양 ${c}을 ${b}묶음으로 똑같이 나누면 한 묶음의 양은 얼마인가요?`;answer=a;work=`${c} ÷ ${b} = ${a}`;}}
return {prompt,answer:String(answer),work};}
function rows(p,seed,count=20){const r=random(seed),out=[],grade=+p.id[0],seen=new Set();let tries=0;
const slots=Array.from({length:count},(_,i)=>i);for(let i=slots.length-1;i>0;i--){const j=r(0,i);[slots[i],slots[j]]=[slots[j],slots[i]];}
while(out.length<count){if(++tries>12000)throw Error('Question pool exhausted '+p.id);let q;
if(p.mode==='skill')q=skill(p.skill,r);
else if(p.mode==='story'){let pool=p.pool;if((grade<3||grade===5)&&pool.every(x=>['×','÷'].includes(W.types.find(t=>t.id===x.source)?.config?.op)||x.source==='multiply-one')){const decimal=W.types.find(t=>t.id===pool[0].source)?.family==='Decimals';pool=pool.concat([{source:grade===5?(decimal?'decimal-add-1':'fraction-add-different'):'add-small'},{source:grade===5?(decimal?'decimal-sub-1':'fraction-sub-different'):'subtract-small'}]);}const s=pool[slots[out.length]%pool.length];q=one({...s.extra,source:s.source,layout:'horizontal'},r,tries);if(!q)continue;q=story(q,slots[out.length],r,grade);}
else{q=one({...p.sourceExtra,...p},r,tries);if(!q)continue;if(p.mode==='blank')q.mask=q.op==='÷'&&String(q.answer).includes(' R ')?2:slots[out.length]%3;if(p.mode==='digit'){// Mask one operand digit; a visible result and other operand guarantee uniqueness.
if(q.op==='×'&&(!Number(q.a)||!Number(q.b)))continue;const which=q.op==='÷'?0:r(0,2),value=String(which===2?q.answer:which===1?q.b:q.a),positions=[r(0,value.length-1)];if(value.length>1&&r(0,1)){let second=r(0,value.length-2);if(second>=positions[0])second++;positions.push(second);}q.digits={which,positions};}}
const signature=JSON.stringify(q);if(seen.has(signature)&&tries<1000)continue;seen.add(signature);out.push(q);}
return out;}
W.generate=function(id,seed,count){const p=DrillCatalog.profiles.get(id);return p?rows(p,seed,count):baseGenerate(id,seed,count);};
root.DrillEngine={rows,random,gcd,lcm,skill};
})(globalThis);

})(scope);root.SharedDrillStories={generate:(id,seed,count)=>scope.Worksheets.generate(id,seed,count)};})(globalThis);