(function(root){
const terms={
'1-1':[
['9\uae4c\uc9c0\uc758 \uc218',['number:9','count:9','bond:9','compare:9'],'2\uc21801-01,04'],
['\uc5ec\ub7ec \uac00\uc9c0 \ubaa8\uc591',['solid-basic','solid-sort','solid-basic'],'2\uc21803-01'],
['\ub367\uc148\uacfc Subtraction',['add:9','sub:9','bond:9'],'2\uc21801-04~07'],
['\ube44\uad50\ud558\uae30',['length-compare','area-compare','capacity-compare','weight-compare'],'2\uc21803-06'],
['50\uae4c\uc9c0\uc758 \uc218',['number:50','place:2','compare:50','sequence:50'],'2\uc21801-01~03']],
'1-2':[
['100\uae4c\uc9c0\uc758 \uc218',['number:100','place:2','compare:100','sequence:100'],'2\uc21801-01~03'],
['\ub367\uc148\uacfc Subtraction (1)',['add:20','sub:20','three:9'],'2\uc21801-05~09'],
['\ubaa8\uc591\uacfc \uc2dc\uac01',['flat-basic','flat-count','flat-build','clock:30'],'2\uc21803-03~05,07'],
['\ub367\uc148\uacfc Subtraction (2)',['add:20','bond:10','sub:20'],'2\uc21801-04~09'],
['\uaddc\uce59 \ucc3e\uae30',['pattern','sequence:100','array-pattern'],'2\uc21802-01~02'],
['\ub367\uc148\uacfc Subtraction (3)',['add:20','sub:20','unknown:20'],'2\uc21801-05~09']],
'2-1':[
['\uc138 Place value \uc218',['place:3','number:999','compare:999','sequence:999'],'2\uc21801-02~03'],
['\uc5ec\ub7ec \uac00\uc9c0 \ub3c4\ud615',['flat-basic','flat-count','cube-count'],'2\uc21803-02~05'],
['\ub367\uc148\uacfc Subtraction',['add:99','sub:99','three:20','unknown:99'],'2\uc21801-05~09'],
['\uae38\uc774 \uc7ac\uae30',['ruler:cm','measure:cm','length-compare'],'2\uc21803-10,12'],
['\ubd84\ub958\ud558\uae30',['sort','table','sort'],'2\uc21804-01~02'],
['Multiplication',['groups','mul:9','array'],'2\uc21801-10']],
'2-2':[
['\ub124 Place value \uc218',['place:4','number:9999','compare:9999','sequence:9999'],'2\uc21801-02~03'],
['Multiplication\uad6c\uad6c',['mul:9','groups','unknown-mul','array'],'2\uc21801-11'],
['\uae38\uc774 \uc7ac\uae30',['convert:m','measure-add:m','ruler:cm'],'2\uc21803-11~13'],
['\uc2dc\uac01\uacfc \uc2dc\uac04',['clock:5','elapsed','calendar'],'2\uc21803-07~09'],
['\ud45c\uc640 \uadf8\ub798\ud504',['table','graph:picture','sort'],'2\uc21804-01~03'],
['\uaddc\uce59 \ucc3e\uae30',['pattern','sequence:100','array-pattern'],'2\uc21802-01~02']],
'3-1':[
['\ub367\uc148\uacfc Subtraction',['add:999','sub:999','unknown:999'],'4\uc21801-03,08'],
['\ud3c9\uba74\ub3c4\ud615',['lines','angle-right','flat-count'],'4\uc21803-01~02'],
['Division',['div:9','groups-div','inverse'],'4\uc21801-05'],
['Multiplication',['mul:99','array','unknown-mul'],'4\uc21801-04'],
['\uae38\uc774\uc640 \uc2dc\uac04',['convert:mm','convert:km','clock:1','time-seconds'],'4\uc21803-13~16'],
['Fractions\uc640 Decimals',['fraction-model','fraction-compare','decimal-model','decimal-compare:1'],'4\uc21801-09,11~12']],
'3-2':[
['Multiplication',['mul:999','mul-two','unknown-mul'],'4\uc21801-04,08'],
['\uc6d0',['circle-parts','circle-size','circle-draw'],'4\uc21803-06~07'],
['Division',['div:99','div-remainder','inverse'],'4\uc21801-05~06,08'],
['\ub4e4\uc774\uc640 \ubb34\uac8c',['convert:L','convert:kg','convert:t','measure-add:L','measure-add:kg'],'4\uc21803-17~23'],
['Fractions',['fraction-model','fraction-form','fraction-compare'],'4\uc21801-09~11'],
['\uadf8\ub9bc\uadf8\ub798\ud504',['graph:picture','table','graph:picture'],'4\uc21804-01']],
'4-1':[
['\ud070 \uc218',['place:8','large-number','compare:99999999','sequence:99999999'],'4\uc21801-01~02'],
['\uac01\ub3c4',['angle-measure','angle-sum','triangle-angle','quad-angle'],'4\uc21803-24~25'],
['Multiplication\uacfc Division',['mul-two','div-two','inverse'],'4\uc21801-04,07~08'],
['\ud3c9\uba74\ub3c4\ud615\uc758 \uc774\ub3d9',['move','flip','turn'],'4\uc21803-04~05'],
['\ub9c9\ub300\uadf8\ub798\ud504',['graph:bar','table','graph:bar'],'4\uc21804-01,03'],
['\uaddc\uce59 \ucc3e\uae30',['sequence:999','array-pattern','equal','pattern'],'4\uc21802-01~03']],
'4-2':[
['Fractions\uc758 \ub367\uc148\uacfc Subtraction',['fraction-add-same','fraction-sub-same','fraction-mixed-same'],'4\uc21801-15'],
['\uc0bc\uac01\ud615',['triangle-side','triangle-angle','triangle-type'],'4\uc21803-08~09'],
['Decimals\uc758 \ub367\uc148\uacfc Subtraction',['decimal-add','decimal-sub','decimal-compare:3','decimal-place'],'4\uc21801-13~14,16'],
['\uc0ac\uac01\ud615',['quad-type','parallel','quad-angle'],'4\uc21803-03,10'],
['\uaebe\uc740\uc120\uadf8\ub798\ud504',['graph:line','graph:line','table'],'4\uc21804-02~03'],
['\ub2e4\uac01\ud615',['polygon','diagonal','tile'],'4\uc21803-11~12']],
'5-1':[
['Whole numbers\uc758 \ud63c\ud569 \uacc4\uc0b0',['mixed','mixed-bracket','mixed-story'],'6\uc21801-01'],
['\uc57d\uc218\uc640 \ubc30\uc218',['factor','multiple','gcd','lcm'],'6\uc21801-04~05'],
['\ub300\uc751 \uad00\uacc4',['correspond','correspond','equal'],'6\uc21802-01'],
['\uc57d\ubd84\uacfc \ud1b5\ubd84',['reduce','common-denominator','fraction-compare-unlike'],'6\uc21801-06~07'],
['Fractions\uc758 \ub367\uc148\uacfc Subtraction',['fraction-add','fraction-sub','fraction-mixed'],'6\uc21801-08'],
['\ub2e4\uac01\ud615\uc758 \ub458\ub808\uc640 \ub113\uc774',['perimeter','area-rectangle','area-triangle','area-parallelogram','area-trapezoid','area-rhombus'],'6\uc21803-11~14']],
'5-2':[
['\uc218\uc758 \ubc94\uc704\uc640 \uc62c\ub9bc, \ubc84\ub9bc, \ubc18\uc62c\ub9bc',['range','round-up','round-down','round-nearest'],'6\uc21801-02~03'],
['Fractions\uc758 Multiplication',['fraction-mul-whole','fraction-mul','fraction-mul-mixed'],'6\uc21801-09'],
['\ud569\ub3d9\uacfc \ub300\uce6d',['congruent','symmetry-line','symmetry-point'],'6\uc21803-01~02'],
['Decimals\uc758 Multiplication',['decimal-mul-whole','decimal-mul','decimal-scale'],'6\uc21801-13'],
['\uc9c1\uc721\uba74\uccb4\uc640 \uc815\uc721\uba74\uccb4',['cuboid','cube-net','cuboid-edges'],'6\uc21803-03~04'],
['\ud3c9\uade0\uacfc \uac00\ub2a5\uc131',['average','average-missing','chance'],'6\uc21804-01,04~06']],
'6-1':[
['Fractions\uc758 Division',['fraction-div-whole','whole-div-fraction-result','fraction-div-whole'],'6\uc21801-10~11'],
['\uac01\uae30\ub465\uacfc \uac01\ubfd4',['prism','pyramid','prism-net'],'6\uc21803-05~06'],
['Decimals\uc758 Division',['decimal-div-whole','decimal-fraction','decimal-div-whole'],'6\uc21801-12,14~15'],
['\ube44\uc640 \ube44\uc728',['ratio','percent','ratio-compare'],'6\uc21802-02~03'],
['\uc5ec\ub7ec \uac00\uc9c0 \uadf8\ub798\ud504',['graph:strip','graph:pie','graph-choice'],'6\uc21804-02~03'],
['\uc9c1\uc721\uba74\uccb4\uc758 \uac89\ub113\uc774\uc640 \ubd80\ud53c',['surface','volume','volume-convert'],'6\uc21803-17~19']],
'6-2':[
['Fractions\uc758 Division',['fraction-div','whole-div-fraction','fraction-div-mixed'],'6\uc21801-11'],
['\uacf5\uac04\uacfc \uc785\uccb4',['cube-count','cube-view','cube-missing'],'6\uc21803-09~10'],
['Decimals\uc758 Division',['decimal-div','decimal-div','decimal-fraction'],'6\uc21801-12,14~15'],
['\ube44\ub840\uc2dd\uacfc \ube44\ub840\ubc30\ubd84',['proportion','share-ratio','ratio-simplify'],'6\uc21802-04~05'],
['\uc6d0\uc758 \ub113\uc774',['circle-circumference','circle-area','circle-half'],'6\uc21803-15~16'],
['\uc6d0\uae30\ub465, \uc6d0\ubfd4, \uad6c',['cylinder','cone','sphere','cylinder-net'],'6\uc21803-07~08']]
};
const themes=[
['\uc0c8\uc2f9 \uc815\uc6d0\uc758 Rabbit','\uaf43\ubc2d\uc744 \ud568\uaed8 \ud0d0\ud5d8\ud574\uc694','#278477','#edf8e9','rabbit'],
['\ub3c4\ud1a0\ub9ac \uc232\uc758 \ub2e4\ub78c\uc950','\ucc28\uace1\ucc28\uace1 \uc2e4\ub825\uc744 \ubaa8\uc544\uc694','#ad693d','#fff3e4','squirrel'],
['\ubc14\ub2e4 \ud0d0\ud5d8\ub300','\uc0c8\ub85c\uc6b4 \uc0dd\uac01\uc744 \ucc3e\uc544 \ucd9c\ubc1c!','#237e9a','#eaf7fc','whale'],
['\ubcc4\ube5b \ucea0\ud551\uc7a5','\ubc18\uc9dd\uc774\ub294 \ubc1c\uacac\uc744 \uae30\ub85d\ud574\uc694','#86622f','#fff8e8','bear'],
['\uc6b0\uc8fc \ud0d0\uc0ac\uc120','\ud55c \uac78\uc74c \ub354 \uba40\ub9ac \uc0dd\uac01\ud574\uc694','#6752a1','#f1effc','rocket'],
['\uacf5\ub8e1 \uc5f0\uad6c\uc18c','\uad00\ucc30\ud558\uace0 \uaddc\uce59\uc744 \ubc1c\uacac\ud574\uc694','#438354','#edf7eb','dinosaur'],
['Robot \ubc1c\uba85\uc2e4','\ubc29\ubc95\uc744 \ucc3e\uace0 \uc124\uba85\ud574\uc694','#376b91','#edf4fb','robot'],
['\ud574\uc800 \uc5f0\uad6c \uae30\uc9c0','\uae4a\uc774 \uc0dd\uac01\ud558\uba70 \ud0d0\uad6c\ud574\uc694','#257d88','#eaf7f6','submarine'],
['\ud0d0\ud5d8\uac00\uc758 \uc9c0\ub3c4','\uac1c\ub150\uc744 \uc5f0\uacb0\ud574 \uae38\uc744 \ucc3e\uc544\uc694','#8c6240','#faf2e7','compass'],
['\ubbf8\ub798 \ub3c4\uc2dc \uc124\uacc4\uc18c','\ub17c\ub9ac\uc640 \uc544\uc774\ub514\uc5b4\ub97c \uc124\uacc4\ud574\uc694','#596b9b','#eff2fb','city'],
['\uc218\ud559 \uc5f0\uad6c \ud300','\uadfc\uac70\ub97c \ucc3e\uc544 \ud574\uacb0\ud574\uc694','#397a71','#ecf6f1','telescope'],
['\ub2e4\uc74c \uc138\uacc4\ub85c\uc758 \ud56d\ud574','\ubc30\uc6b4 \uac83\uc744 \ud568\uaed8 \ud3bc\uccd0\uc694','#6e5f90','#f4f0f9','satellite']
];
const recipes=[[0,1,2],[0,1,3],[0,1,4],[0,2,3],[0,2,4],[0,3,4],[1,2,3],[1,2,4],[1,3,4],[2,3,4],[0,1,2,3],[0,1,2,3,4]];
const modeNames=['\uac1c\ub150\uc744 \uc0b4\ud3b4\uc694','\ub2f5\uc744 \ucc3e\uc544\uc694','\uc633\uace0 \uadf8\ub984\uc744 \ucc3e\uc544\uc694','\uac1c\ub150\uc744 \ud65c\uc6a9\ud574\uc694','\uc0dd\uac01\uc744 \uc124\uba85\ud574\uc694'];
const units=Object.entries(terms).flatMap(([term,rows])=>rows.map(([name,skills,standard],i)=>({id:term+'-'+(i+1),grade:+term[0],semester:+term[2],number:i+1,name,skills,standard})));
root.KoCatalog={units,themes,recipes,modeNames};
if(typeof module!=='undefined')module.exports=root.KoCatalog;
})(globalThis);
