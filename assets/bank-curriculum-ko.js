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
