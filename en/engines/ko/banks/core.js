(function(root){
const labels={
number:'수의 자리와 순서',count:'그림의 개수 세기',place:'자리의 숫자 찾기',compare:'수의 크기 비교',sequence:'수의 규칙 찾기',bond:'수 가르기',add:'덧셈 계산',sub:'뺄셈 계산',unknown:'가려진 수 찾기',three:'세 수 계산',
'solid-basic':'입체 모양 알아보기','solid-sort':'입체 모양 분류','flat-basic':'평면도형 알아보기','flat-count':'변의 개수 세기','flat-build':'도형 조각으로 만들기','cube-count':'쌓기나무 세기',
'length-compare':'길이 비교','area-compare':'넓이 비교','capacity-compare':'들이 비교','weight-compare':'무게 비교',ruler:'눈금을 읽어 길이 구하기',measure:'알맞은 단위 찾기',convert:'단위 바꾸기','measure-add':'측정값 계산',
sort:'기준에 따라 분류',table:'표의 정보 읽기',graph:'그래프 해석',groups:'묶음으로 곱셈하기',mul:'곱셈 계산',array:'배열로 곱셈하기','unknown-mul':'곱셈의 빈칸 찾기',clock:'시계 읽기',elapsed:'걸린 시간 구하기',calendar:'주일과 날짜',pattern:'반복되는 규칙','array-pattern':'대응표의 규칙',
lines:'선분·직선·반직선','angle-right':'직각 찾기',div:'나눗셈 계산','groups-div':'묶음 수 구하기',inverse:'곱셈과 나눗셈의 관계','time-seconds':'분과 초 바꾸기',
'fraction-model':'그림을 분수로 나타내기','fraction-compare':'분수 크기 비교','decimal-model':'그림을 소수로 나타내기','decimal-compare':'소수 크기 비교','mul-two':'두 자리 수를 곱하기','circle-parts':'원의 구성 요소','circle-size':'반지름과 지름','circle-draw':'컴퍼스의 벌어진 길이','div-remainder':'몫과 나머지','fraction-form':'가분수를 대분수로',
'large-number':'만·억·조의 크기','angle-measure':'각도기 읽기','angle-sum':'각도의 합','triangle-angle':'삼각형의 각','quad-angle':'사각형의 각','div-two':'두 자리 수로 나누기',move:'밀어서 옮기기',flip:'뒤집기',turn:'돌리기',equal:'같은 값을 만드는 식',
'fraction-add-same':'동분모 분수 덧셈','fraction-sub-same':'동분모 분수 뺄셈','fraction-mixed-same':'대분수 계산','triangle-side':'변으로 삼각형 분류','triangle-type':'각으로 삼각형 분류','decimal-add':'소수 덧셈','decimal-sub':'소수 뺄셈','decimal-place':'소수의 자리','quad-type':'사각형의 성질',parallel:'평행한 변',polygon:'다각형 알아보기',diagonal:'대각선 찾기',tile:'빈틈없이 채우기',
mixed:'혼합 계산 순서','mixed-bracket':'괄호가 있는 식','mixed-story':'이야기와 혼합 계산',factor:'약수 찾기',multiple:'배수 찾기',gcd:'최대공약수',lcm:'최소공배수',correspond:'두 양의 대응 관계',reduce:'기약분수 만들기','common-denominator':'공통분모 만들기','fraction-compare-unlike':'이분모 분수 비교',
'fraction-add':'분수의 덧셈','fraction-sub':'분수의 뺄셈','fraction-mixed':'대분수의 계산',perimeter:'둘레 구하기','area-rectangle':'직사각형의 넓이','area-triangle':'삼각형의 넓이','area-parallelogram':'평행사변형의 넓이','area-trapezoid':'사다리꼴의 넓이','area-rhombus':'마름모의 넓이',range:'조건에 맞는 수의 범위','round-up':'올림','round-down':'버림','round-nearest':'반올림',
'fraction-mul-whole':'분수와 자연수의 곱','fraction-mul':'분수끼리의 곱','fraction-mul-mixed':'대분수의 곱',congruent:'합동과 대응변','symmetry-line':'선대칭도형','symmetry-point':'점대칭도형','decimal-mul-whole':'소수와 자연수의 곱','decimal-mul':'소수끼리의 곱','decimal-scale':'10배·100배와 소수점',
cuboid:'직육면체의 구성','cube-net':'정육면체의 전개도','cuboid-edges':'모서리 세기',average:'평균 구하기','average-missing':'평균으로 빠진 값 찾기',chance:'가능성 판단',
'fraction-div-whole':'분수를 자연수로 나누기','whole-div-fraction-result':'몫을 분수로 나타내기',prism:'각기둥의 구성',pyramid:'각뿔의 구성','prism-net':'전개도로 입체 찾기','decimal-div-whole':'소수를 자연수로 나누기','decimal-fraction':'분수와 소수 연결',ratio:'비로 나타내기',percent:'백분율 구하기','ratio-compare':'비율 비교','graph-choice':'알맞은 그래프 선택',surface:'직육면체의 겉넓이',volume:'직육면체의 부피','volume-convert':'부피 단위 바꾸기',
'fraction-div':'분수끼리 나누기','whole-div-fraction':'자연수를 분수로 나누기','fraction-div-mixed':'대분수 나눗셈','cube-view':'보는 방향과 모양','cube-missing':'가려진 쌓기나무','decimal-div':'소수끼리 나누기',proportion:'비례식의 빈칸','share-ratio':'비례배분','ratio-simplify':'간단한 자연수의 비','circle-circumference':'원의 둘레','circle-area':'원의 넓이','circle-half':'반원의 넓이',cylinder:'원기둥의 구성',cone:'원뿔의 구성',sphere:'구의 성질','cylinder-net':'원기둥 전개도'
};
// Approved topic names; keep the metadata in engine.js in sync.
const profileNames={
  "1-1-2": "입체 모양 구별하기",
  "1-1-3": "9까지 더하고 빼기",
  "1-1-4": "길이·넓이·무게 비교하기",
  "1-1-5": "50까지 수 비교하기",
  "1-2-1": "100까지 수 순서 찾기",
  "1-2-3": "도형 구별하고 시계 읽기",
  "1-2-5": "모양과 수의 규칙 찾기",
  "2-1-1": "세 자리 수 비교하기",
  "2-1-2": "평면도형·쌓기나무 알아보기",
  "2-1-3": "두 자리 수 더하고 빼기",
  "2-1-4": "자로 길이 재기",
  "2-1-5": "기준에 따라 분류하기",
  "2-1-6": "묶음으로 곱셈하기",
  "2-2-1": "네 자리 수 비교하기",
  "2-2-3": "m·cm 단위 바꾸기",
  "2-2-4": "시각과 시간 계산하기",
  "2-2-5": "표와 그래프 읽기",
  "2-2-6": "수 배열의 규칙 찾기",
  "3-1-1": "세 자리 수 더하고 빼기",
  "3-1-2": "선의 종류와 직각 찾기",
  "3-1-3": "곱셈구구로 나눗셈하기",
  "3-1-4": "두 자리 수 곱셈하기",
  "3-1-5": "길이·시간 단위 바꾸기",
  "3-1-6": "분수와 소수 비교하기",
  "3-2-1": "두·세 자리 수 곱셈하기",
  "3-2-2": "반지름과 지름 구하기",
  "3-2-3": "몫과 나머지 구하기",
  "3-2-4": "들이 단위 바꾸고 더하기",
  "3-2-5": "가분수를 대분수로 바꾸기",
  "3-2-6": "그림그래프 읽고 계산하기",
  "4-1-1": "큰 수 자릿값·크기 알기",
  "4-1-2": "각도 읽고 각의 합 구하기",
  "4-1-3": "두 자리 수로 곱셈·나눗셈",
  "4-1-4": "도형 밀기·뒤집기·돌리기",
  "4-1-5": "막대그래프와 표 읽기",
  "4-1-6": "수와 도형의 규칙 찾기",
  "4-2-1": "분모 같은 분수 계산하기",
  "4-2-2": "삼각형 분류·각 구하기",
  "4-2-3": "소수 더하고 빼고 비교하기",
  "4-2-4": "사각형 성질·각 알아보기",
  "4-2-5": "꺾은선그래프와 표 읽기",
  "4-2-6": "다각형·대각선 알아보기",
  "5-1-1": "혼합 계산 순서 익히기",
  "5-1-2": "약수·배수 구하기",
  "5-1-3": "대응 관계와 빈칸 찾기",
  "5-1-5": "통분해 분수 계산하기",
  "5-2-1": "수의 범위·어림 익히기",
  "5-2-2": "분수 곱셈 계산하기",
  "5-2-3": "합동·대칭 성질 알아보기",
  "5-2-4": "소수 곱셈·소수점 익히기",
  "5-2-5": "직육면체·전개도 살펴보기",
  "5-2-6": "평균·가능성 알아보기",
  "6-1-1": "분수를 자연수로 나누기",
  "6-1-2": "각기둥·각뿔 살펴보기",
  "6-1-3": "소수를 자연수로 나누기",
  "6-1-4": "비·비율·백분율 구하기",
  "6-1-5": "띠그래프 읽고 종류 고르기",
  "6-1-6": "겉넓이·부피 구하기",
  "6-2-1": "분수로 나눗셈하기",
  "6-2-2": "쌓기나무 수·모양 알아보기",
  "6-2-3": "소수로 나눗셈하기",
  "6-2-4": "비례식·비례배분 풀기",
  "6-2-5": "원주·원 넓이 구하기",
  "6-2-6": "원기둥·원뿔·구 살펴보기"
};
const banks={};
for(const u of KoCatalog.units){
 const seen=new Set(),activities=[];
 for(const skill of u.skills){
  const kind=skill.split(':')[0];let key=kind==='solid-sort'?'solid-basic':kind==='groups'?'array':kind==='groups-div'?'div':kind==='number'&&u.skills.some(x=>x.startsWith('place:'))?'place':kind==='cuboid-edges'?'cuboid':kind;
  if(seen.has(key))continue;seen.add(key);
  const mode=['unknown','unknown-mul','inverse'].includes(kind)?1:kind==='mixed-story'?3:0;
  activities.push({skill,mode,method:key,title:labels[kind]||u.name});
 }
 // One diagnostic activity per unit, never twelve recombinations of the same exercise.
 if(activities.length<3)activities.push({skill:activities[0].skill,mode:2,method:'diagnose',title:'주장의 옳고 그름 판단하기'});
 if(activities.length<3)activities.push({skill:'equal',mode:0,method:'prerequisite-equality',title:'이전에 배운 개념 · 같은 수 만들기'});
 const chunks=[];if(activities.length<=5)chunks.push(activities);else{chunks.push(activities.slice(0,3),activities.slice(3))}
 banks[u.id]=chunks.map((activities,i)=>({name:chunks.length===1?(profileNames[u.id]||'핵심 개념과 적용'):i===0?'기본 개념 연결':'여러 조건에 적용',activities}));
}
function generate(id,p,seed,n,excluded){
 const spec=banks[id][p],art=KoArt.session(seed,excluded);
 return spec.activities.map((s,i)=>({title:s.title,skill:s.skill,method:s.method,questions:Array.from({length:n},(_,j)=>{
  const q=KoLegacyMath.generate(id,0,seed+i*7891+j*137,1,[s])[0].questions[0],asset=art.take();
  // Counting illustrations are replaced at their mathematical source, not by decorative recolouring.
  if(q.visual.includes('fill="#edb65c"')){const count=(q.visual.match(/<circle /g)||[]).length;q.visual=KoArt.count(asset,count)}
  else q.visual='<span class="picture-badge">'+KoArt.icon(asset)+'</span>'+q.visual;
  q.methodId=s.method;q.artId=asset.id;
  return q;
 })}));
}
root.KoCoreBank={banks,generate,labels};
})(globalThis);
