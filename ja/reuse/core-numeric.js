globalThis.JaCoreCatalog={"units":[{"id":"1-1-3","grade":1,"skills":["add:9","sub:9","bond:9"]},{"id":"1-1-5","grade":1,"skills":["number:50","place:2","compare:50","sequence:50"]},{"id":"1-2-1","grade":1,"skills":["number:100","place:2","compare:100","sequence:100"]},{"id":"2-1-1","grade":2,"skills":["place:3","number:999","compare:999","sequence:999"]},{"id":"2-1-3","grade":2,"skills":["add:99","sub:99","three:20","unknown:99"]},{"id":"2-1-6","grade":2,"skills":["groups","mul:9","array"]},{"id":"2-2-1","grade":2,"skills":["place:4","number:9999","compare:9999","sequence:9999"]},{"id":"3-1-1","grade":3,"skills":["add:999","sub:999","unknown:999"]},{"id":"3-1-3","grade":3,"skills":["div:9","groups-div","inverse"]},{"id":"3-1-4","grade":3,"skills":["mul:99","array","unknown-mul"]},{"id":"3-2-1","grade":3,"skills":["mul:999","mul-two","unknown-mul"]},{"id":"3-2-3","grade":3,"skills":["div:99","div-remainder","inverse"]},{"id":"4-1-1","grade":4,"skills":["place:8","large-number","compare:99999999","sequence:99999999"]},{"id":"4-1-3","grade":4,"skills":["mul-two","div-two","inverse"]}],"modeNames":["計算","選択","確かめ","文章題","説明"]};
(function(root){
const C=root.JaCoreCatalog;
const gcd=(a,b)=>b?gcd(b,a%b):Math.abs(a),fmt=n=>String(Number(n.toFixed(6))),frac=(n,d)=>{const g=gcd(n,d);return d/g===1?String(n/g):n/g+'/'+(d/g)};
const E=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'),F=(n,d)=>'<span class="kf"><span>'+n+'</span><span>'+d+'</span></span>';
const svg=(s,w=230,h=80)=>'<svg class="concept-art" viewBox="0 0 '+w+' '+h+'" role="img" aria-label="問題の図">'+s+'</svg>';
const text=(x,y,t)=>'<text x="'+x+'" y="'+y+'" text-anchor="middle" font-size="12" fill="#304b5b">'+E(t)+'</text>';
const dots=n=>svg(Array.from({length:n},(_,i)=>'<circle cx="'+(16+(i%10)*20)+'" cy="'+(18+Math.floor(i/10)*23)+'" r="7" fill="#edb65c" stroke="#a86d2d"/>').join(''),220,Math.ceil(n/10)*23+10);
const bar=(n,d)=>svg(Array.from({length:d},(_,i)=>'<rect x="'+(10+i*200/d)+'" y="17" width="'+200/d+'" height="32" fill="'+(i<n?'#8fc6c1':'white')+'" stroke="#527b83"/>').join(''),220,65);
const poly=n=>svg('<polygon points="'+Array.from({length:n},(_,i)=>{const t=2*Math.PI*i/n-Math.PI/2;return (110+35*Math.cos(t))+','+(45+35*Math.sin(t))}).join(' ')+'" fill="#e8d9f3" stroke="#7d6197" stroke-width="2"/>',230,90);
const rect=(a,b)=>svg('<rect x="35" y="20" width="150" height="48" fill="#dcefea" stroke="#42756e" stroke-width="2"/>'+text(110,14,a)+text(208,48,b),245,85);
const cubeArt=()=>svg('<path d="M50 30L83 9H161V55L128 76H50Z M50 30H128L161 9 M128 30V76" fill="#dfebf6" stroke="#527999" stroke-width="2"/>',220,85);
const grid=(rows,cols)=>svg(Array.from({length:rows*cols},(_,i)=>'<rect x="'+(8+i%cols*18)+'" y="'+(8+Math.floor(i/cols)*18)+'" width="18" height="18" fill="#e4f2ef" stroke="#688d87"/>').join(''),Math.max(120,cols*18+16),rows*18+16);
const clock=(h,m)=>{const ha=(h%12+m/60)*Math.PI/6,ma=m*Math.PI/30;return svg('<circle cx="110" cy="47" r="39" fill="white" stroke="#6a8293"/>'+Array.from({length:12},(_,i)=>{const t=(i+1)*Math.PI/6;return text(110+31*Math.sin(t),51-31*Math.cos(t),i+1)}).join('')+'<path d="M110 47L'+(110+21*Math.sin(ha))+' '+(47-21*Math.cos(ha))+'M110 47L'+(110+30*Math.sin(ma))+' '+(47-30*Math.cos(ma))+'" stroke="#375d78" stroke-width="3"/>',220,95)};
function generate(unitId,profile,seed,perSection=6,customSpecs=null){
const u=C.units.find(x=>x.id===unitId);if(!u)throw Error('Unknown unit '+unitId);if(profile<0||profile>=12)throw Error('Profile');
let state=seed>>>0;const r=n=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return Math.floor(state/4294967296*n)},pick=a=>a[r(a.length)],between=(a,b)=>a+r(b-a+1);
function make(skill,mode){
const [kind,param]=skill.split(':'),max=Number(param)||9;let a=between(2,9),b=between(2,9),c=between(2,6),prompt='',visual='',answer='',reason='',task='',open=false,check=null;
function finish(stem,art,result,explanation,options={}){
 if(typeof result==='number')result=Number(result.toFixed(6));prompt=stem;visual=art;answer=String(result);reason=explanation||'条件を順に確かめます。';task='<span class="kblank"></span>';
 const numeric=typeof result==='number',wrong=options.wrong??(numeric?result+1:'0');
 const choices=options.choices||(numeric?[result,Math.max(0,result-1),result+1]:[result,wrong]);const list=[...new Set(choices.map(String))];if(list.length>1){const shift=r(list.length);list.push(...list.splice(0,shift))}
 if(mode===1){prompt=stem.replace(/書きましょう\.|求めましょう\.|表しましょう\./g,'選びましょう.');if(!prompt.includes('選びましょう'))prompt+='正しい答えを選びましょう.';task='<div class="kchoices">'+list.map(E).join(' / ')+'</div>';}
 if(mode===2){const correct=r(2)===0,claim=correct?String(result):String(wrong);task='<div class="kclaim">友だちの答え：'+E(claim)+'</div>正しければ○、ちがえば×。まちがいを直しましょう。<div class="kshort-space"></div>';answer=correct?'○':'×、正しい答え：'+result;}
 if(mode===3)prompt=options.story||stem;
 if(mode===4){prompt=stem+'考え方も説明しましょう。';task+='<div class="kreason">理由：____________________</div>';open=true}
}
function calc(x,y,op,opts={}){
 const result=op==='+'?x+y:op==='−'?x-y:op==='×'?x*y:x/y,value=fmt(result),expr=fmt(x)+' '+op+' '+fmt(y);
 finish('計算しましょう。',opts.art||'',value,expr+' = '+value,{wrong:fmt(result+1),story:op==='+'?'구슬 '+fmt(x)+'개에 '+fmt(y)+'개를 더 넣었습니다. 모두 몇 개인가요?':op==='−'?'색종が'+fmt(x)+'장 중 '+fmt(y)+'장を썼습니다. 몇 장が남았나요?':op==='×'?'한 묶음에 '+fmt(x)+'개씩 '+fmt(y)+'묶음です。 모두 몇 개인가요?':fmt(x)+'개를 '+fmt(y)+'명에게 똑같が나누면 한 명が몇 개를 받나요?'});
 if(mode===0||mode===4)task='<div class="kequation">'+expr+' = □</div>'+(mode===4?'<div class="kreason">計算：__________________</div>':'');
 if(mode===1){prompt='□に入る数を書きましょう.';task='<div class="kequation">'+fmt(x)+' '+op+' □ = '+value+'</div>';answer=fmt(y);reason=expr+' = '+value+'なので □ = '+fmt(y)}
 if(mode===2)prompt=expr+'の計算を確かめましょう。';
 check={kind:'calc',x,y,op,result,mode,expected:mode===1?fmt(y):value};
}
if(['add','sub','unknown','three'].includes(kind)){
 a=between(1,max-1);b=between(1,max-a);
 if(kind==='three'){c=between(1,Math.max(1,Math.floor(max/3)));a=between(1,c);b=between(1,c);finish('三つの数の和を求めましょう.','<div class="kequation">'+a+' + '+b+' + '+c+'</div>',a+b+c,a+' + '+b+' + '+c+' = '+(a+b+c),{story:'세 바구니에 사과가 '+a+'개, '+b+'개, '+c+'개 있습니다. 모두 몇 개인가요?'})}
 else calc(kind==='sub'?a+b:a,b,kind==='sub'?'−':'+',{art:u.grade===1&&mode===0?dots(kind==='sub'?a+b:a):''});
}
else if(['mul','mul-two','unknown-mul','groups','array','groups-div','div','div-remainder','div-two','inverse'].includes(kind)){
 a=kind==='mul'?between(Math.max(2,Math.floor(max/10)),max):between(2,9);b=between(2,9);
 if(kind==='mul-two'){a=between(12,u.grade>=4?999:99);b=between(12,39)}
 if(kind==='div-two'){b=between(11,29);a=between(2,Math.floor(999/b))}
 if(kind==='div-remainder'){const rem=between(1,b-1),total=a*b+rem;finish(total+' ÷ '+b+'の商とあまりを求めましょう。','',a+' あまり '+rem,b+' × '+a+' + '+rem+' = '+total,{wrong:(a+1)+' あまり '+rem,story:'공 '+total+'개를 '+b+'개씩 상자에 담습니다. 가득 찬 상자는 몇 개이고 몇 개가 남나요?'});check={kind:'remainder',total,divisor:b,quotient:a,remainder:rem}}
 else if(['div','groups-div','div-two','inverse'].includes(kind)){if(kind==='div'&&max>9)a=between(10,Math.min(99,Math.floor(999/b)));calc(a*b,b,'÷')}
 else {if(kind==='groups'||kind==='array')a=between(2,6);calc(a,b,'×',{art:['groups','array'].includes(kind)?grid(a,b):''})}
}
else if(['number','count','place','compare','bond','large-number','sequence'].includes(kind)){
 if(kind==='count'){a=between(1,max);finish('図は全部で何個ですか。',dots(a),a,'一つずつ数えると'+a+'個です。')}
 else if(kind==='bond'){a=between(2,max);b=between(1,a-1);finish(a+'を'+b+'と□に分けましょう。',max<=10?dots(a):'',a-b,b+' + '+(a-b)+' = '+a)}
 else if(kind==='compare'){a=between(1,max);b=between(1,max);const ans=a>b?'>':a<b?'<':'=';finish('□に合う記号を書きましょう.','<div class="kequation">'+a+' □ '+b+'</div>',ans,'大きい位から比べます。',{choices:['>','<','='],wrong:ans==='>'?'<':'>'})}
 else if(kind==='sequence'){const step=max>99999?10000:max>999?100:max>100?10:1,start=between(1,Math.max(1,max-4*step));finish('□に入る数を書きましょう.','<div class="kequation">'+[start,start+step,'□',start+3*step].join(' → ')+'</div>',start+2*step,step+'ずつ増えます。')}
 else if(kind==='large-number'){const un=pick(['万','億','兆']),n=between(11,99);finish(un+'が'+n+'個ある数を書きましょう.','',n+un,n+' × 1'+un+' = '+n+un,{wrong:(n+1)+un})}
 else if(kind==='number'&&max===9){a=between(1,8);finish(a+'より1大きい数を書きましょう.',dots(a),a+1,a+'の次の数は'+(a+1)+'です。')}
 else {const digits=kind==='place'?max:String(max===100?99:max).length,n=between(10**(digits-1),Math.min(10**digits-1,kind==='number'?max:u.id==='1-1-5'?50:u.grade===1?99:99999999)),pos=r(digits),v=Math.floor(n/10**pos)%10,names=['一','十','百','千','万','十万','百万','千万'];finish(n+'の'+names[pos]+'の位の数字は何ですか。','',v,'右から'+(pos+1)+'番目の数字です。')}
}
else if(['pattern','array-pattern','correspond','equal'].includes(kind)){
 if(kind==='pattern'){const symbols=['●','▲','■'],pat=r(2)?[0,1,2]:[0,0,1],at=between(4,8),ans=symbols[pat[at%pat.length]];finish('규칙を보고 □를 채우세요.','<div class="kequation">'+Array.from({length:at},(_,i)=>symbols[pat[i%pat.length]]).join(' ')+' □</div>',ans,pat.map(i=>symbols[i]).join(' ')+'가 반복됩니다.',{choices:symbols,wrong:symbols.find(x=>x!==ans)})}
 else if(kind==='equal')finish('両側が等しくなるように□を埋めましょう。','<div class="kequation">'+a+' + '+b+' = '+(a-1)+' + □</div>',b+1,'一方の数が1小さくなると、もう一方は1大きくなります。');
 else {const k=u.grade===1?1:between(2,5),offset=0,vals=[1,2,3,4];visual='<table class="ktable"><tr><th>입력</th>'+vals.map(x=>'<td>'+x+'</td>').join('')+'</tr><tr><th>출력</th>'+vals.map(x=>'<td>'+(x===4?'□':x*k+offset)+'</td>').join('')+'</tr></table>';finish('규칙を찾아 □를 채우세요.',visual,4*k+offset,'입력 × '+k+(offset?' + '+offset:'')+' = 출력です。')}
}
else if(['flat-basic','flat-count','flat-build','solid-basic','solid-sort','sort','table'].includes(kind)){
 if(kind.startsWith('solid')){const names=u.grade===1?['상자 모양','둥근 기둥 모양','공 모양']:['직육면체','원기둥','구'],i=r(3),art=i===0?cubeArt():i===1?svg('<path d="M72 18V65Q110 89 148 65V18" fill="#f1e3c7" stroke="#997f53"/><ellipse cx="110" cy="18" rx="38" ry="12" fill="#fff6df" stroke="#997f53"/>'):svg('<circle cx="110" cy="42" r="34" fill="#dcecf5" stroke="#66869a"/>');finish('같은 모양의 이름を選びましょう.',art,names[i],'평평한 부분과 둥근 부분を살펴봅니다.',{choices:names,wrong:names[(i+1)%3]})}
 else if(kind==='sort'||kind==='table'){const vals=[between(1,6),between(1,6),between(1,6)],which=r(3),labels=kind==='sort'?['●','▲','■']:['사과','배','귤'];visual=kind==='sort'?'<div class="ksymbols">'+vals.flatMap((n,i)=>Array(n).fill(labels[i])).join(' ')+'</div>':'<table class="ktable"><tr>'+labels.map(x=>'<th>'+x+'</th>').join('')+'</tr><tr>'+vals.map(x=>'<td>'+x+'</td>').join('')+'</tr></table>';finish(labels[which]+'은 모두 몇 개인가요?',visual,vals[which],'같은 기준으로 분류해 개수를 셉니다.')}
 else {const names=['삼각형','사각형','원'],i=r(3),art=i<2?poly(i+3):svg('<circle cx="110" cy="43" r="33" fill="#f5e3b7" stroke="#9d855b"/>');if(kind==='flat-count')finish('곧은 변은 몇 개인가요?',art,i===2?0:i+3,'삼각형 3개, 사각형 4개, 원 0個です。');else if(kind==='flat-build'){finish('삼각형 2개를 붙여 사각형を그리세요.',grid(2,4),'삼각형 2개의 한 변を붙인 사각형','사각형 안에 대각선 하나를 그으면 삼각형 2個です。',{wrong:'삼각형 1개'});if(mode!==1&&mode!==2){task='<div class="kdraw"></div>';open=true}}else finish('도형의 이름を書きましょう.',art,names[i],'곧은 변과 굽은 선を살펴봅니다.',{choices:names,wrong:names[(i+1)%3]})}
}
else if(['length-compare','area-compare','capacity-compare','weight-compare'].includes(kind)){
 a=between(3,8);b=between(1,a-1);const swap=r(2),vals=swap?[b,a]:[a,b],names=['가','나'],word=kind==='length-compare'?'길이':kind==='area-compare'?'넓이':kind==='capacity-compare'?'들이':'무게';
 visual=svg(vals.map((v,i)=>'<rect x="45" y="'+(12+i*35)+'" width="'+v*18+'" height="17" fill="'+(i?'#edd2ac':'#abd5cc')+'"/>'+text(20,25+i*35,names[i])).join('')+text(125,90,'막대가 길수록 '+word+'가 큽니다.'),250,102);
 finish(word+'가 더 큰 것を選びましょう.',visual,names[swap?1:0],word+'를 나타내는 막대를 비교합니다.',{choices:names,wrong:names[swap?0:1]});
}
else if(['clock','elapsed','calendar','time-seconds'].includes(kind)){
 if(kind==='clock'){a=between(1,12);b=param==='30'?r(2)*30:param==='5'?r(12)*5:r(60);finish('시각を書きましょう.',clock(a,b),a+'시 '+b+'분','짧은바늘은 시, 긴바늘은 분です。',{wrong:a+'시 '+((b+5)%60)+'분'})}
 else if(kind==='calendar'){a=between(1,4);finish(a+'주일은 며칠인가요?','',a*7,'1주일은 7일です。')}
 else if(kind==='time-seconds'){a=between(1,4);b=between(1,59);finish(a+'분 '+b+'초는 몇 초인가요?','',a*60+b,a+' × 60 + '+b+'です。')}
 else {a=between(1,10);b=r(6)*10;const delta=between(1,6)*10,total=a*60+b+delta;finish(a+'시 '+b+'분부터 '+delta+'분 뒤의 시각은 언제인가요?',clock(a,b),Math.floor(total/60)+'시 '+total%60+'분','60분은 1시간です。',{wrong:a+'시 '+b+'분'})}
}
else if(['ruler','measure','convert','measure-add'].includes(kind)){
 const units={mm:['cm','mm',10],m:['m','cm',100],km:['km','m',1000],L:['L','mL',1000],kg:['kg','g',1000],t:['t','kg',1000],cm:['cm','cm',1]},[big,small,factor]=units[param]||units.cm;
 if(kind==='ruler'){a=between(1,7);b=between(a+1,10);visual=svg('<path d="M15 55H215" stroke="#607b83"/>'+Array.from({length:11},(_,i)=>'<path d="M'+(15+i*20)+' 50V60" stroke="#607b83"/>'+text(15+i*20,75,i)).join('')+'<rect x="'+(15+a*20)+'" y="25" width="'+(b-a)*20+'" height="15" fill="#efc17c"/>'+text(200,15,'cm'),230,90);finish('막대의 길이는 몇 cm인가요?',visual,b-a,b+' − '+a+' = '+(b-a))}
 else if(kind==='measure')finish('연필 길이를 잴 때 알맞은 단위를 選びましょう.','','cm','짧은 물체의 길이는 cm로 나타냅니다.',{choices:['cm','시간','kg'],wrong:'kg'});
 else {a=between(1,8);b=between(1,9)*(factor/10);const total=a*factor+b,extra=kind==='measure-add'?between(1,4)*(factor/10):0;finish(a+big+' '+b+small+(extra?'에 '+extra+small+'를 더하면':'는')+' 몇 '+small+'인가요?','',total+extra,'1'+big+' = '+factor+small+'です。 '+a+' × '+factor+' + '+b+(extra?' + '+extra:'')+' = '+(total+extra))}
}
else if(['fraction-model','fraction-form','fraction-compare','decimal-model','decimal-compare','decimal-place','decimal-fraction','reduce','common-denominator','fraction-compare-unlike'].includes(kind)){
 const d=between(2,9),n=between(1,d-1),m=between(1,d-1);
 if(kind==='fraction-model')finish('색칠한 부분を분수로 書きましょう.',bar(n,d),n+'/'+d,'전체 '+d+'칸 중 '+n+'칸です。',{wrong:d+'/'+n});
 if(kind==='fraction-form'){const w=between(1,4);finish('가분수를 대분수로 表しましょう.','<div class="kequation">'+F(w*d+n,d)+'</div>',w+' '+n+'/'+d,d+'개씩 '+w+'묶음과 '+n+'개가 남습니다.',{wrong:(w+1)+' '+n+'/'+d})}
 if(kind==='fraction-compare'||kind==='fraction-compare-unlike'){const e=kind==='fraction-compare'?d:d+1,ans=n*e>m*d?'>':n*e<m*d?'<':'=';finish('두 분수를 비교하세요.','<div class="kequation">'+F(n,d)+' □ '+F(m,e)+'</div>',ans,kind==='fraction-compare'?'분모가 같으면 분자를 비교합니다.':'공통분모로 바꾸어 분자를 비교합니다.',{choices:['>','<','='],wrong:ans==='>'?'<':'>'})}
 if(kind==='decimal-model'){a=between(1,9);finish('색칠한 부분を소수로 書きましょう.',bar(a,10),a/10,a+'/10 = '+a/10)}
 if(kind==='decimal-compare'){const scale=10**max;a=between(1,scale*3)/scale;b=between(1,scale*3)/scale;const ans=a>b?'>':a<b?'<':'=';finish('알맞은 기호를 書きましょう.','<div class="kequation">'+a+' □ '+b+'</div>',ans,'소수점を맞추고 높은 자리부터 비교합니다.',{choices:['>','<','='],wrong:ans==='>'?'<':'>'})}
 if(kind==='decimal-place'){a=between(101,999);const pos=r(3),names=['첫째','둘째','셋째'],v=Number(String(a)[pos]);finish((a/1000).toFixed(3)+'の소수 '+names[pos]+' 자리 숫자는 무엇인가요?','',v,'소수점 오른쪽부터 자리를 확인합니다.')}
 if(kind==='decimal-fraction'){a=between(1,99);finish(a+'/100を소수로 表しましょう.','',a/100,'100분의 1が'+a+'個です。')}
 if(kind==='reduce'){a=between(2,5);finish('기약분수로 약분하세요.','<div class="kequation">'+F(n*a,d*a)+'</div>',frac(n,d),'분자와 분모를 최대공약수 '+gcd(n*a,d*a)+'로 나눕니다.',{wrong:(n*a)+'/'+(d*a+1)})}
 if(kind==='common-denominator'){const e=d+1,l=d*e/gcd(d,e);finish('가장 작은 공통분모로 통분하세요.','<div class="kequation">'+F(n,d)+' , '+F(1,e)+'</div>',(n*l/d)+'/'+l+', '+(l/e)+'/'+l,'분모의 최소공배수는 '+l+'です。',{wrong:n+'/'+l+', 1/'+l})}
}
else if(kind.startsWith('fraction-')||kind==='whole-div-fraction'||kind==='whole-div-fraction-result'){
 let d=between(2,9),e=kind.includes('same')?d:between(2,9),n=between(1,d-1),m=between(1,e-1);
 if(kind.includes('mixed')){n+=d*between(1,3);m+=e*between(1,2)}
 let op=kind.includes('sub')?'−':kind.includes('mul')?'×':kind.includes('div')?'÷':'+';
 if(kind==='fraction-div-whole'||kind==='fraction-mul-whole'){m=between(2,5);e=1}
 if(kind==='whole-div-fraction'){n=between(1,6);d=1}
 if(kind==='whole-div-fraction-result'){n=between(1,9);d=1;m=between(2,9);e=1}
 if(op==='−'&&n*e<m*d){[n,m]=[m,n];[d,e]=[e,d]}
 let num=op==='+'?n*e+m*d:op==='−'?n*e-m*d:op==='×'?n*m:n*e,den=op==='÷'?d*m:d*e;if(u.grade===4&&(op==='+'||op==='−')){num=op==='+'?n+m:n-m;den=d}const ans=u.grade===4?(num%den===0?String(num/den):num+'/'+den):frac(num,den),expr=n+'/'+d+' '+op+' '+m+'/'+e;
 finish(u.grade===4?'計算しましょう。':'계산하고 기약분수 또는 자연수로 書きましょう.','<div class="kequation">'+F(n,d)+' '+op+' '+F(m,e)+'</div>',ans,expr+' = '+num+'/'+den+' = '+ans,{wrong:frac(num+1,den),story:op==='+'?'리본 '+n+'/'+d+' m와 '+m+'/'+e+' m를 이으면 몇 m인가요?':op==='−'?n+'/'+d+' m 중 '+m+'/'+e+' m를 쓰면 몇 m가 남나요?':op==='×'?n+'/'+d+'의 '+m+'/'+e+'배는 얼마인가요?':n+'/'+d+' m를 '+m+'/'+e+' m씩 나누면 몇 조각 분량인가요?'});
 if(mode===1){prompt='결과의 빈칸を채우세요.';task='<div class="kequation">= '+F('□',den)+'</div>';answer=String(num);reason=expr+' = '+num+'/'+den}
 check={kind:'fraction',n,d,m,e,op,num,den};
}
else if(kind.startsWith('decimal-')){
 let x=between(11,199)/10,y=between(11,99)/10,op=kind.includes('sub')?'−':kind.includes('mul')||kind==='decimal-scale'?'×':kind.includes('div')?'÷':'+';
 if(kind.includes('whole'))y=between(2,9);if(kind==='decimal-scale')y=pick([10,100]);if(op==='−'&&x<y)[x,y]=[y,x];
 if(op==='÷'){y=kind.includes('whole')?between(2,9):between(1,99)/10;x=Number((y*between(1,99)/10).toFixed(2))}
 calc(x,y,op);
 if(mode===3)prompt='길이가 '+x+' m인 리본を'+(op==='+'?y+' m 더 이으면 전체 길이는 몇 m인가요?':op==='−'?y+' m 자르면 몇 m가 남나요?':op==='×'?y+'배로 늘리면 몇 m인가요?':y+' m씩 나누면 몇 조각 분량인가요?');
}
else if(['mixed','mixed-bracket','mixed-story','factor','multiple','gcd','lcm','range','round-up','round-down','round-nearest'].includes(kind)){
 if(kind.startsWith('mixed')){const bracket=kind==='mixed-bracket'||mode===4,value=bracket?(a+b)*c:a+b*c,expr=bracket?'('+a+' + '+b+') × '+c:a+' + '+b+' × '+c;finish('순서에 따라 計算しましょう。','<div class="kequation">'+expr+'</div>',value,bracket?'괄호 안を먼저 계산한 뒤 곱합니다.':'곱셈を먼저 계산한 뒤 더합니다.',{story:bracket?'연필 '+a+'자루와 '+b+'자루를 한 상자에 담아 '+c+'상자를 준비했습니다. 모두 몇 자루인가요?':'연필 '+a+'자루에 '+b+'자루씩 든 묶음 '+c+'개를 더했습니다. 모두 몇 자루인가요?'})}
 else if(kind==='factor'){a=between(4,36);const f=Array.from({length:a},(_,i)=>i+1).filter(i=>a%i===0);finish(a+'의 약수를 모두 書きましょう.','',f.join(', '),a+'を나누어떨어지게 하는 자연수를 찾습니다.',{wrong:f.slice(1).join(', ')})}
 else if(kind==='multiple'){a=between(2,12);finish(a+'의 배수를 작은 수부터 3개 書きましょう.','',[a,a*2,a*3].join(', '),a+'에 1, 2, 3を각각 곱합니다.',{wrong:[a,a+1,a+2].join(', ')})}
 else if(kind==='gcd'||kind==='lcm'){a=between(4,24);b=between(4,24);const ans=kind==='gcd'?gcd(a,b):a*b/gcd(a,b);finish(a+'과 '+b+'의 '+(kind==='gcd'?'최대공약수':'최소공배수')+'는 무엇인가요?','',ans,kind==='gcd'?'공통인 약수 중 가장 큰 수를 찾습니다.':'공통인 배수 중 가장 작은 수를 찾습니다.')}
 else if(kind==='range'){a=between(10,30);const labels=['이상','이하','초과','미만'],idx=r(4),vals=[a-1,a,a+1],ok=vals.filter(n=>idx===0?n>=a:idx===1?n<=a:idx===2?n>a:n<a);finish(a+' '+labels[idx]+'인 수를 모두 書きましょう.','<div class="kequation">'+vals.join(', ')+'</div>',ok.join(', '),'이상·이하는 기준を포함하고 초과·미만은 포함하지 않습니다.',{wrong:vals.filter(n=>!ok.includes(n)).join(', ')})}
 else {a=between(101,999);const f=pick([10,100]),ans=(kind==='round-up'?Math.ceil(a/f):kind==='round-down'?Math.floor(a/f):Math.round(a/f))*f,verb=kind==='round-up'?'올림':kind==='round-down'?'버림':'반올림';finish(a+'を'+verb+'하여 '+(f===10?'십':'백')+'의 자리까지 表しましょう.','',ans,'남길 자리 아래를 보고 '+verb+'합니다.')}
}
else if(['ratio','percent','ratio-compare','proportion','share-ratio','ratio-simplify','average','average-missing','chance'].includes(kind)){
 if(kind==='ratio')finish('빨간 구슬 '+a+'개의 파란 구슬 '+b+'개에 대한 비를 書きましょう.','',a+' : '+b,'비교하는 양を앞에, 기준량を뒤에 씁니다.',{wrong:b+' : '+(a+1)});
 else if(kind==='percent'){const total=pick([20,25,50,100]),part=between(1,total);finish('전체 '+total+'개 중 '+part+'개는 몇 %인가요?','',Number((part/total*100).toFixed(6)),'비교하는 양 ÷ 기준량 × 100です。')}
 else if(kind==='ratio-compare'){const x=a/b,y=c/b;finish('비율が더 큰 것を選びましょう.','<div class="kequation">가: '+a+' : '+b+'　나: '+c+' : '+b+'</div>',x>y?'가':x<y?'나':'같다','기준량が같으므로 비교하는 양を비교합니다.',{choices:['가','나','같다'],wrong:x>y?'나':'가'})}
 else if(kind==='proportion')finish('비례식의 □를 求めましょう.','<div class="kequation">'+a+' : '+b+' = □ : '+b*c+'</div>',a*c,'두 수에 같은 수 '+c+'를 곱합니다.');
 else if(kind==='share-ratio'){const total=(a+b)*c;finish(total+'개를 '+a+' : '+b+'로 나눌 때 앞쪽 몫은 몇 개인가요?','',a*c,total+' × '+a+'/('+a+' + '+b+') = '+a*c)}
 else if(kind==='ratio-simplify'){const g=gcd(a,b);finish(a*c+' : '+b*c+'를 가장 간단한 자연수의 비로 表しましょう.','',a/g+' : '+b/g,'두 수를 최대공약수 '+g*c+'로 나눕니다.',{wrong:a/g+' : '+(b/g+1)})}
 else if(kind==='chance'){const ans=pick(['불가능하다','확실하다','반반이다']),stem=ans==='불가능하다'?'빨간 공만 있는 상자の파란 공を뽑を가능성은 어떤가요?':ans==='확실하다'?'파란 공만 있는 상자の파란 공を뽑を가능성은 어떤가요?':'빨간 공 1개와 파란 공 1개 중 보지 않고 하나를 뽑を때 빨간 공일 가능성은 어떤가요?';finish(stem,'',ans,'상자 안의 공 종류와 개수를 비교합니다.',{choices:['불가능하다','확실하다','반반이다'],wrong:ans==='확실하다'?'불가능하다':'확실하다'})}
 else {a=between(5,15);b=between(1,4);const vals=[a-b,a,a+b];if(kind==='average')finish('세 수의 평균を求めましょう.','<div class="kequation">'+vals.join(', ')+'</div>',a,'합 '+a*3+'を자료 수 3으로 나눕니다.');else finish('평균が'+a+'일 때 □를 求めましょう.','<div class="kequation">'+(a-b)+', □, '+(a+b)+'</div>',a,'합 '+a*3+'の알려진 두 수를 뺍니다.')}
}
else if(kind==='graph'||kind==='graph-choice'){
 const vals=[between(1,4)*10,between(1,4)*10,between(1,4)*10],labels=['가','나','다'],idx=r(3);let art='';
 if(param==='line')art=svg(Array.from({length:5},(_,i)=>'<path d="M35 '+(85-i*15)+'H210" stroke="#dce6ea"/>'+text(18,89-i*15,i*10)).join('')+'<polyline points="'+vals.map((v,i)=>(55+i*65)+','+(85-v*1.5)).join(' ')+'" fill="none" stroke="#568cac" stroke-width="2"/>'+vals.map((v,i)=>'<circle cx="'+(55+i*65)+'" cy="'+(85-v*1.5)+'" r="3" fill="#568cac"/>'+text(55+i*65,105,(i+1)+'일')).join('')+text(120,13,'기온 (℃)'),235,115);
 else if(param==='pie'||param==='strip'){vals[0]=20;vals[1]=30;vals[2]=50;const colors=['#a8d6ca','#eec487','#b8b0db'];art=param==='strip'?svg(vals.map((v,i)=>'<rect x="'+(10+vals.slice(0,i).reduce((x,y)=>x+y,0)*2)+'" y="20" width="'+v*2+'" height="32" fill="'+colors[i]+'" stroke="white"/>'+text(10+(vals.slice(0,i).reduce((x,y)=>x+y,0)+v/2)*2,66,labels[i]+' '+v+'%')).join(''),230,85):svg('<circle cx="80" cy="55" r="34" fill="none" stroke="'+colors[2]+'" stroke-width="24"/><circle cx="80" cy="55" r="34" fill="none" stroke="'+colors[0]+'" stroke-width="24" stroke-dasharray="'+(.2*2*Math.PI*34)+' '+(2*Math.PI*34)+'" transform="rotate(-90 80 55)"/><circle cx="80" cy="55" r="34" fill="none" stroke="'+colors[1]+'" stroke-width="24" stroke-dasharray="'+(.3*2*Math.PI*34)+' '+(2*Math.PI*34)+'" stroke-dashoffset="'+(-.2*2*Math.PI*34)+'" transform="rotate(-90 80 55)"/>'+vals.map((v,i)=>text(175,30+i*24,labels[i]+' '+v+'%')).join(''),240,112)}
 else if(param==='picture'){const scale=u.grade===2?1:10;if(scale===1)vals.forEach((v,i)=>vals[i]=v/10);art=svg(vals.map((v,i)=>text(15,22+i*25,labels[i])+Array.from({length:v/(u.grade===2?1:10)},(_,j)=>'<circle cx="'+(48+j*25)+'" cy="'+(18+i*25)+'" r="7" fill="#8fc6bc"/>').join('')).join('')+text(120,100,'● 한 개는 '+scale+'명'),240,112);}
 else art=svg(Array.from({length:5},(_,i)=>'<path d="M35 '+(85-i*15)+'H215" stroke="#dce6ea"/>'+text(18,89-i*15,i*10)).join('')+vals.map((v,i)=>'<rect x="'+(50+i*55)+'" y="'+(85-v*1.5)+'" width="27" height="'+v*1.5+'" fill="#91c6ba"/>'+text(64+i*55,103,labels[i])).join('')+text(125,12,'선택한 사람 수 (명)'),240,115);
 if(kind==='graph-choice')finish('시간에 따른 기온의 변화를 나타내기에 알맞은 그래프는 무엇인가요?','','꺾은선그래프','시간에 따라 변하는 모습を선으로 연결합니다.',{choices:['꺾은선그래프','원그래프','띠그래프'],wrong:'원그래프'});
 else if(mode<2)finish((param==='line'?(idx+1)+'일의 기온은 몇 ℃':labels[idx]+(param==='pie'||param==='strip'?'의 비율은 몇 %':'를 선택한 사람은 몇 명'))+'인가요?',art,vals[idx],'눈금이나 범례の해당 항목의 값を읽습니다.');
 else if(mode===2)finish(param==='line'?'첫째 날과 둘째 날의 기온 합を求めましょう.':'가와 나의 값を더하세요.',art,vals[0]+vals[1],vals[0]+' + '+vals[1]+' = '+(vals[0]+vals[1]));
 else if(mode===3)finish('가장 큰 값과 가장 작은 값의 차이를 求めましょう.',art,Math.max(...vals)-Math.min(...vals),'최댓값の최솟값を뺍니다.');
 else {finish('그래프의 자료를 표로 정리하세요.',art,vals.map((v,i)=>(param==='line'?(i+1)+'일':labels[i])+': '+v).join(', '),'항목별 값を표에 옮깁니다.',{wrong:'모두 0'});task='<table class="ktable"><tr>'+labels.map(x=>'<th>'+x+'</th>').join('')+'</tr><tr><td>　</td><td>　</td><td>　</td></tr></table>';open=true}
}
else if(['angle-right','lines','angle-type','angle-measure','angle-sum','triangle-angle','quad-angle','parallel','triangle-side','triangle-type','quad-type','polygon','diagonal','tile'].includes(kind)){
 if(kind==='angle-right'){const yes=r(2)===0;finish('직각인 그림인가요?',svg('<path d="M65 15V67H165" fill="none" stroke="#547b92" stroke-width="3" transform="'+(yes?'':'translate(25 0) skewX(-25)')+'"/>'),yes?'예':'아니요','종이의 반듯한 모서리와 겹쳐 확인합니다.',{choices:['예','아니요'],wrong:yes?'아니요':'예'})}
 else if(kind==='lines'){const idx=r(3),names=['선분','반직선','직선'];visual=svg('<path d="M35 42H190" stroke="#537e8d" stroke-width="3"/>'+(idx===0?'<circle cx="35" cy="42" r="4" fill="#537e8d"/><circle cx="190" cy="42" r="4" fill="#537e8d"/>':idx===1?'<circle cx="35" cy="42" r="4" fill="#537e8d"/><path d="M181 35L190 42L181 49" fill="none" stroke="#537e8d" stroke-width="2"/>':'<path d="M44 35L35 42L44 49M181 35L190 42L181 49" fill="none" stroke="#537e8d" stroke-width="2"/>'));finish('그림의 이름を書きましょう.',visual,names[idx],'끝점과 뻗는 방향を확인합니다.',{choices:names,wrong:names[(idx+1)%3]})}
 else if(kind==='angle-type'||kind==='angle-measure'){
 const angle=pick([30,40,60,90,120,130,150]),rad=angle*Math.PI/180,cx=110,cy=82,R=67;
 const ticks=Array.from({length:19},(_,i)=>{const t=i*Math.PI/18;return '<path d="M'+(cx+(R-6)*Math.cos(t))+' '+(cy-(R-6)*Math.sin(t))+'L'+(cx+R*Math.cos(t))+' '+(cy-R*Math.sin(t))+'" stroke="#7c929e"/>'+(i%3===0?text(cx+(R-17)*Math.cos(t),cy-(R-17)*Math.sin(t)+3,i*10):'')}).join('');
 visual=svg((kind==='angle-measure'?'<path d="M43 82A67 67 0 0 1 177 82" fill="#f7fafb" stroke="#a6bdc8"/>'+ticks:'')+'<path d="M110 82H181M110 82L'+(cx+R*Math.cos(rad))+' '+(cy-R*Math.sin(rad))+'" stroke="#486b98" stroke-width="2" fill="none"/>',230,98);
 finish(kind==='angle-type'?'각의 종류를 選びましょう.':'각도기의 눈금を읽어 각도를 求めましょう.',visual,kind==='angle-type'?(angle<90?'예각':angle===90?'직각':'둔각'):angle,kind==='angle-measure'?'오른쪽 0°부터 시작해 다른 변が가리키는 눈금 '+angle+'°를 읽습니다.':'90°보다 작으면 예각, 같으면 직각, 크고 180°보다 작으면 둔각です。',{choices:kind==='angle-type'?['예각','직각','둔각']:undefined,wrong:kind==='angle-type'?(angle===90?'예각':'직각'):angle+10})
}
 else if(kind==='angle-sum'){a=between(2,8)*10;b=between(1,8)*10;finish('이웃한 두 각 '+a+'°와 '+b+'°를 합치면 몇 도인가요?','',a+b,a+' + '+b+' = '+(a+b)+'°')}
 else if(kind==='triangle-angle'||kind==='quad-angle'){const tri=kind==='triangle-angle',sum=tri?180:360,vals=tri?[between(3,7)*10,between(3,7)*10]:[90,90,between(6,12)*10];finish((tri?'삼각형':'사각형')+'의 각 중 '+vals.map(v=>v+'°').join(', ')+'를 알고 있습니다. あまり 각은 몇 도인가요?','',sum-vals.reduce((x,y)=>x+y),'각의 합 '+sum+'°の알려진 각を뺍니다.')}
 else if(kind==='triangle-side'){a=between(3,9);finish('세 변が모두 '+a+' cm인 삼각형의 이름은 무엇인가요?',poly(3),'정삼각형','세 변의 길이가 모두 같습니다.',{choices:['정삼각형','직각삼각형','둔각삼각형'],wrong:'둔각삼각형'})}
 else if(kind==='triangle-type'){const idx=r(3),angles=[[60,60,60],[30,60,90],[30,30,120]][idx];finish('세 각が'+angles.join('°, ')+'°인 삼각형を각에 따라 분류하세요.','',['예각삼각형','직각삼각형','둔각삼각형'][idx],'직각 또는 둔각が있는지 확인합니다.',{choices:['예각삼각형','직각삼각형','둔각삼각형'],wrong:['둔각삼각형','예각삼각형','직각삼각형'][idx]})}
 else if(kind==='quad-type'){const idx=r(4),names=['직사각형','정사각형','마름모','평행사변형'],facts=['네 각が직각이고 가로 6 cm, 세로 3 cm','네 각が직각이고 네 변が모두 4 cm','네 변が같고 한 각が60°','마주 보는 두 쌍의 변が평행하고 이웃한 변が4 cm와 6 cm, 한 각が60°'];finish(facts[idx]+'인 사각형의 이름은 무엇인가요?','',names[idx],'변의 길이와 각의 조건を확인합니다.',{choices:names,wrong:names[(idx+1)%4]})}
 else if(kind==='parallel')finish('직사각형の마주 보는 두 변의 관계를 書きましょう.',rect('6 cm','3 cm'),'평행','아무리 늘여도 만나지 않는 두 직선です。',{choices:['평행','수직'],wrong:'수직'});
 else if(kind==='tile'){a=between(2,5);b=between(2,6);finish('한 칸에 조각 하나를 놓습니다. 몇 개가 필요한가요?',grid(a,b),a*b,a+' × '+b+' = '+a*b)}
 else {const n=between(3,8);if(kind==='diagonal')finish('한 꼭짓점の그を수 있는 대각선은 몇 개인가요?',poly(n),n-3,'자기 자신과 이웃한 두 꼭짓점を제외합니다.');else finish('다각형의 변은 몇 개인가요?',poly(n),n,'둘레를 따라 변を하나씩 셉니다.')}
}
else if(['circle-parts','circle-size','circle-draw','circle-circumference','circle-area','circle-half'].includes(kind)){
 a=between(2,12);visual=svg('<circle cx="80" cy="45" r="34" fill="#edf5fa" stroke="#678aa1"/><circle cx="80" cy="45" r="3" fill="#678aa1"/><path d="M80 45H114" stroke="#678aa1" stroke-width="2"/>'+text(180,48,'반지름 '+a+' cm'),250,90);
 if(kind==='circle-parts')finish('중심の원 위의 한 점까지 이은 선분의 이름은 무엇인가요?',visual,'반지름','중심の원 위의 점까지 이은 선분です。',{choices:['반지름','지름','꼭짓점'],wrong:'지름'});
 else if(kind==='circle-size')finish('원의 지름은 몇 cm인가요?',visual,a*2,'지름은 반지름의 2배です。');
 else if(kind==='circle-draw')finish('반지름 '+a+' cm인 원を그리려면 컴퍼스 두 발 사이를 몇 cm로 벌려야 하나요?','',a,'컴퍼스 두 발 사이는 반지름과 같습니다.');
 else {const result=kind==='circle-circumference'?2*a*3.14:kind==='circle-half'?a*a*3.14/2:a*a*3.14;finish((kind==='circle-circumference'?'원의 둘레(cm)':kind==='circle-half'?'が원의 절반인 반원의 넓이(cm²)':'원의 넓이(cm²)')+'를 求めましょう. (원주율: 3.14)',visual,Number(result.toFixed(2)),kind==='circle-circumference'?'지름 × 3.14 = '+a*2+' × 3.14':'반지름 × 반지름 × 3.14'+(kind==='circle-half'?' ÷ 2':''))}
}
else if(['move','flip','turn','congruent','symmetry-line','symmetry-point'].includes(kind)){
 if(kind==='move'){a=between(1,4);b=between(1,4);finish('오른쪽 '+a+'칸, 다시 오른쪽 '+b+'칸 움직이면 처음の오른쪽 몇 칸인가요?',grid(2,8),a+b,a+' + '+b+'칸です。')}
 else if(kind==='flip')finish('화살표를 좌우로 뒤집으면 어느 쪽を향하나요?','<div class="kequation">→</div>','왼쪽','좌우가 바뀝니다.',{choices:['왼쪽','오른쪽','위쪽'],wrong:'오른쪽'});
 else if(kind==='turn'){const turns=between(1,3),names=['오른쪽','아래쪽','왼쪽'];finish('시계 방향으로 직각만큼 '+turns+'번 돌리면 어느 쪽を향하나요?','<div class="kequation">↑</div>',names[turns-1],'위→오른쪽→아래→왼쪽으로 바뀝니다.',{choices:names,wrong:'위쪽'})}
 else if(kind==='congruent'){a=between(3,9);finish('합동인 두 삼각형の한 변が'+a+' cmです。 대응하는 변은 몇 cm인가요?',poly(3),a,'대응변의 길이는 같습니다.')}
 else if(kind==='symmetry-line')finish('정사각형의 대칭축은 몇 개인가요?',poly(4),4,'마주 보는 변의 중점を잇는 2개와 대각선 2個です。');
 else finish('점대칭인 도형を대칭의 중심 둘레로 몇 도 돌리면 처음과 겹치나요?','',180,'반 바퀴는 180°です。');
}
else if(kind.startsWith('area-')||['perimeter','surface','volume','volume-convert'].includes(kind)){
 a=between(3,12);b=between(2,9);c=between(2,8);let result,stem,art,why;
 if(kind==='perimeter'){result=2*(a+b);stem='직사각형의 둘레는 몇 cm인가요?';art=rect(a+' cm',b+' cm');why='(가로 + 세로) × 2'}
 else if(kind==='surface'){result=2*(a*b+b*c+a*c);stem='가로 '+a+' cm, 세로 '+b+' cm, 높が'+c+' cm인 직육면체의 겉넓이는 몇 cm²인가요?';art=cubeArt();why='(가로×세로 + 세로×높が+ 가로×높이) × 2'}
 else if(kind==='volume'){result=a*b*c;stem='가로 '+a+' cm, 세로 '+b+' cm, 높が'+c+' cm인 직육면체의 부피는 몇 cm³인가요?';art=cubeArt();why='가로 × 세로 × 높이'}
 else if(kind==='volume-convert'){result=a*1000000;stem=a+' m³는 몇 cm³인가요?';art='';why='1 m³ = 1,000,000 cm³'}
 else {b=2*between(2,5);if(kind==='area-trapezoid')c=a+between(1,5);result=kind==='area-triangle'?a*b/2:kind==='area-trapezoid'?(a+c)*b/2:kind==='area-rhombus'?a*b/2:a*b;stem=kind==='area-triangle'?'밑변 '+a+' cm, 높が'+b+' cm인 삼각형':kind==='area-trapezoid'?'윗변 '+a+' cm, 아랫변 '+c+' cm, 높が'+b+' cm인 사다리꼴':kind==='area-rhombus'?'두 대각선が'+a+' cm, '+b+' cm인 마름모':kind==='area-parallelogram'?'밑변 '+a+' cm, 높が'+b+' cm인 평행사변형':'가로 '+a+' cm, 세로 '+b+' cm인 직사각형';stem+='의 넓이는 몇 cm²인가요?';art=kind==='area-rectangle'?rect(a+' cm',b+' cm'):svg('<path d="'+(kind==='area-triangle'?'M35 70L95 12L180 70Z':kind==='area-trapezoid'?'M35 70L65 15H140L180 70Z':kind==='area-rhombus'?'M35 43L105 10L180 43L105 77Z':'M35 70L65 15H185L155 70Z')+'" fill="#e6edf8" stroke="#6d86a5" stroke-width="2"/>'+text(110,91,'길이는 문제의 조건を보세요'),220,100);why=kind==='area-triangle'?'밑변 × 높が÷ 2':kind==='area-trapezoid'?'(윗변 + 아랫변) × 높が÷ 2':kind==='area-rhombus'?'대각선 × 다른 대각선 ÷ 2':'밑변(가로) × 높이(세로)'}
 finish(stem,art,result,why+' = '+result);check={kind:'measure',skill:kind,a,b,c,result};
}
else if(['cuboid','cuboid-edges','cube-net','prism','pyramid','prism-net','cylinder','cone','sphere','cylinder-net','cube-count','cube-view','cube-missing'].includes(kind)){
 if(['cube-count','cube-view','cube-missing'].includes(kind)){
 const hs=[between(1,3),between(0,3),between(1,3),between(0,3)],sum=hs.reduce((x,y)=>x+y),front=r(2)===0;
 visual='<div class="height-map">'+hs.map(n=>'<span>'+n+'</span>').join('')+'</div><small class="diagram-note">위の본 모양 · 숫자는 그 자리의 개수 · 아래쪽が앞</small>';
 if(u.grade===2){const n=between(2,5);visual=svg(Array.from({length:n},(_,i)=>'<g transform="translate('+(i*29)+' 0)"><path d="M8 30L20 20H43V43L31 53H8ZM8 30H31L43 20M31 30V53" fill="#d9eaf3" stroke="#608397"/></g>').join(''),n*29+20,65);finish('쌓기나무는 모두 몇 개인가요?',visual,n,'나란히 놓인 쌓기나무를 하나씩 셉니다.')}
 else {const result=kind==='cube-view'?(front?Math.max(hs[0],hs[2])+Math.max(hs[1],hs[3]):Math.max(hs[0],hs[1])+Math.max(hs[2],hs[3])):kind==='cube-missing'?sum-hs[0]:sum;finish(kind==='cube-view'?(front?'앞':'오른쪽 옆')+'の보이는 정사각형은 몇 개인가요?':kind==='cube-missing'?'왼쪽 위 자리의 쌓기나무를 모두 빼면 몇 개가 남나요?':'쌓기나무는 모두 몇 개인가요?',visual,result,kind==='cube-view'?'보는 방향の겹친 줄마다 가장 높은 개수를 더하면 '+result+'個です。':hs.join(' + ')+' = '+sum+(kind==='cube-missing'?', '+sum+' − '+hs[0]+' = '+result:''))}
}
 else if(kind==='cube-net'){const cells=[[1,0],[0,1],[1,1],[2,1],[3,1],[1,2]],idx=r(6);visual=svg(cells.map(([x,y],i)=>'<rect x="'+(30+x*24)+'" y="'+(5+y*24)+'" width="24" height="24" fill="'+(i===idx?'#efca80':'#e7eff5')+'" stroke="#64879a"/>').join(''),170,85);finish('정육면체 전개도の색칠하지 않은 면은 몇 개인가요?',visual,5,'정사각형 6개 중 색칠한 1개를 빼면 5個です。');if(mode===4){prompt='が전개도를 접어 정육면체가 되는 까닭を설명하세요.';answer='6개의 정사각형が겹치지 않고 정육면체의 6개 면を만듭니다.';reason='직접 오려 접어 확인해도 좋습니다.'}}
 else if(['cuboid','cuboid-edges'].includes(kind)){const attr=kind==='cuboid-edges'?['모서리',12]:kind==='cube-net'?['전개도에 필요한 정사각형',6]:pick([['면',6],['꼭짓점',8],['모서리',12]]);finish((kind==='cube-net'?'정육면체':'직육면체')+'의 '+attr[0]+'은 몇 개인가요?',cubeArt(),attr[1],'면 6개, 꼭짓점 8개, 모서리 12個です。')}
 else if(kind==='prism-net'){visual=svg('<path d="M28 31H124V71H28ZM60 31V71M92 31V71M28 31L44 4L60 31M28 71L44 98L60 71" fill="#dce9f3" stroke="#62879c"/>',155,106);finish('が전개도를 접어 만든 입체도형의 이름を書きましょう.',visual,'삼각기둥','삼각형인 밑면 2개와 직사각형인 옆면 3個です。',{choices:['삼각기둥','삼각뿔','사각기둥'],wrong:'삼각뿔'})}
 else if(['prism','pyramid'].includes(kind)){const n=between(3,6),pyr=kind==='pyramid',attr=pick(['면','꼭짓점','모서리']),result=attr==='면'?(pyr?n+1:n+2):attr==='꼭짓점'?(pyr?n+1:2*n):(pyr?2*n:3*n),name=['','','','삼','사','오','육'][n]+(pyr?'각뿔':'각기둥');finish(name+'의 '+attr+'은 몇 개인가요?','',result,pyr?'밑면과 꼭대기 꼭짓점を구분하여 셉니다.':'위아래 밑면과 옆면を구분하여 셉니다.')}
 else {const facts={cylinder:['원기둥의 밑면은 몇 개인가요?',2,'합동인 원 2個です。'],cone:['원뿔의 꼭짓점은 몇 개인가요?',1,'꼭대기 꼭짓점은 1個です。'],sphere:['구의 중심の겉면까지의 거리는 무엇이라고 하나요?','반지름','반지름은 어느 방향이나 같습니다.'],'cylinder-net':['원기둥의 옆면を높が방향으로 잘라 펼치면 무슨 모양인가요?','직사각형','평행한 두 밑면 사이를 높が방향으로 자릅니다.']};const [stem,result,why]=facts[kind];finish(stem,'',result,why,{wrong:typeof result==='number'?result+1:'삼각형',choices:typeof result==='number'?undefined:[result,'삼각형','꼭짓점']})}
}
else throw Error('Unimplemented '+skill);
if(!prompt||answer==='')throw Error('Empty '+skill);
return {skill,mode,prompt,visual,task,answer,reason,open,check};
}
return (customSpecs||C.recipes[profile].map((mode,i)=>({mode,skill:u.skills[(Math.floor(profile/3)+i)%u.skills.length]}))).map(({mode,skill})=>({title:C.modeNames[mode],skill,mode,questions:Array.from({length:perSection},()=>make(skill,mode))}));
}
root.JaCoreLegacy={generate,frac,gcd};})(globalThis);
(function(root){
const labels={
number:'数の位と順序',count:'図の数を数える',place:'位の数字を求める',compare:'数の大小を比べる',sequence:'数のきまり',bond:'数を分ける',add:'たし算',sub:'ひき算',unknown:'□の数',three:'三つの数の計算',
'solid-basic':'입체 모양 알아보기','solid-sort':'입체 모양 분류','flat-basic':'평면도형 알아보기','flat-count':'변의 개수 세기','flat-build':'도형 조각으로 만들기','cube-count':'쌓기나무 세기',
'length-compare':'길이 비교','area-compare':'넓이 비교','capacity-compare':'들이 비교','weight-compare':'무게 비교',ruler:'눈금을 읽어 길이 구하기',measure:'알맞은 단위 찾기',convert:'단위 바꾸기','measure-add':'측정값 계산',
sort:'기준에 따라 분류',table:'표의 정보 읽기',graph:'그래프 해석',groups:'まとまりとかけ算',mul:'かけ算',array:'並び方とかけ算','unknown-mul':'かけ算の□',clock:'시계 읽기',elapsed:'걸린 시간 구하기',calendar:'주일과 날짜',pattern:'반복되는 규칙','array-pattern':'대응표의 규칙',
lines:'선분·직선·반직선','angle-right':'직각 찾기',div:'わり算','groups-div':'まとまりの数',inverse:'かけ算とわり算の関係','time-seconds':'분과 초 바꾸기',
'fraction-model':'그림을 분수로 나타내기','fraction-compare':'분수 크기 비교','decimal-model':'그림을 소수로 나타내기','decimal-compare':'소수 크기 비교','mul-two':'二けたをかける','circle-parts':'원의 구성 요소','circle-size':'반지름과 지름','circle-draw':'컴퍼스의 벌어진 길이','div-remainder':'商とあまり','fraction-form':'가분수를 대분수로',
'large-number':'万・億・兆','angle-measure':'각도기 읽기','angle-sum':'각도의 합','triangle-angle':'삼각형의 각','quad-angle':'사각형의 각','div-two':'二けたでわる',move:'밀어서 옮기기',flip:'뒤집기',turn:'돌리기',equal:'같은 값을 만드는 식',
'fraction-add-same':'동분모 분수 덧셈','fraction-sub-same':'동분모 분수 뺄셈','fraction-mixed-same':'대분수 계산','triangle-side':'변으로 삼각형 분류','triangle-type':'각으로 삼각형 분류','decimal-add':'소수 덧셈','decimal-sub':'소수 뺄셈','decimal-place':'소수의 자리','quad-type':'사각형의 성질',parallel:'평행한 변',polygon:'다각형 알아보기',diagonal:'대각선 찾기',tile:'빈틈없이 채우기',
mixed:'혼합 계산 순서','mixed-bracket':'괄호가 있는 식','mixed-story':'이야기와 혼합 계산',factor:'약수 찾기',multiple:'배수 찾기',gcd:'최대공약수',lcm:'최소공배수',correspond:'두 양의 대응 관계',reduce:'기약분수 만들기','common-denominator':'공통분모 만들기','fraction-compare-unlike':'이분모 분수 비교',
'fraction-add':'분수의 덧셈','fraction-sub':'분수의 뺄셈','fraction-mixed':'대분수의 계산',perimeter:'둘레 구하기','area-rectangle':'직사각형의 넓이','area-triangle':'삼각형의 넓이','area-parallelogram':'평행사변형의 넓이','area-trapezoid':'사다리꼴의 넓이','area-rhombus':'마름모의 넓이',range:'조건에 맞는 수의 범위','round-up':'올림','round-down':'버림','round-nearest':'반올림',
'fraction-mul-whole':'분수와 자연수의 곱','fraction-mul':'분수끼리의 곱','fraction-mul-mixed':'대분수의 곱',congruent:'합동과 대응변','symmetry-line':'선대칭도형','symmetry-point':'점대칭도형','decimal-mul-whole':'소수와 자연수의 곱','decimal-mul':'소수끼리의 곱','decimal-scale':'10배·100배와 소수점',
cuboid:'직육면체의 구성','cube-net':'정육면체의 전개도','cuboid-edges':'모서리 세기',average:'평균 구하기','average-missing':'평균으로 빠진 값 찾기',chance:'가능성 판단',
'fraction-div-whole':'분수를 자연수로 나누기','whole-div-fraction-result':'몫을 분수로 나타내기',prism:'각기둥의 구성',pyramid:'각뿔의 구성','prism-net':'전개도로 입체 찾기','decimal-div-whole':'소수를 자연수로 나누기','decimal-fraction':'분수와 소수 연결',ratio:'비로 나타내기',percent:'백분율 구하기','ratio-compare':'비율 비교','graph-choice':'알맞은 그래프 선택',surface:'직육면체의 겉넓이',volume:'직육면체의 부피','volume-convert':'부피 단위 바꾸기',
'fraction-div':'분수끼리 나누기','whole-div-fraction':'자연수를 분수로 나누기','fraction-div-mixed':'대분수 나눗셈','cube-view':'보는 방향과 모양','cube-missing':'가려진 쌓기나무','decimal-div':'소수끼리 나누기',proportion:'비례식의 빈칸','share-ratio':'비례배분','ratio-simplify':'간단한 자연수의 비','circle-circumference':'원의 둘레','circle-area':'원의 넓이','circle-half':'반원의 넓이',cylinder:'원기둥의 구성',cone:'원뿔의 구성',sphere:'구의 성질','cylinder-net':'원기둥 전개도'
};
const banks={};
for(const u of JaCoreCatalog.units){
 const seen=new Set(),activities=[];
 for(const skill of u.skills){
  const kind=skill.split(':')[0];let key=kind==='solid-sort'?'solid-basic':kind==='groups'?'array':kind==='groups-div'?'div':kind==='number'&&u.skills.some(x=>x.startsWith('place:'))?'place':kind==='cuboid-edges'?'cuboid':kind;
  if(seen.has(key))continue;seen.add(key);
  const mode=['unknown','unknown-mul','inverse'].includes(kind)?1:kind==='mixed-story'?3:0;
  activities.push({skill,mode,method:key,title:labels[kind]||u.name});
 }
 // One diagnostic activity per unit, never twelve recombinations of the same exercise.
 if(activities.length<3)activities.push({skill:activities[0].skill,mode:2,method:'diagnose',title:'説明を確かめる'});
 if(activities.length<3)activities.push({skill:'equal',mode:0,method:'prerequisite-equality',title:'復習・同じ数を作る'});
 const chunks=[];if(activities.length<=5)chunks.push(activities);else{chunks.push(activities.slice(0,3),activities.slice(3))}
 banks[u.id]=chunks.map((activities,i)=>({name:chunks.length===1?'基本と応用':i===0?'基本をつなぐ':'条件に合わせて考える',activities}));
}
function generate(id,p,seed,n,excluded){
 const spec=banks[id][p],art=KoArt.session(seed,excluded);
 return spec.activities.map((s,i)=>({title:s.title,skill:s.skill,method:s.method,questions:Array.from({length:n},(_,j)=>{
  const q=JaCoreLegacy.generate(id,0,seed+i*7891+j*137,1,[s])[0].questions[0],asset=art.take();
  // Counting illustrations are replaced at their mathematical source, not by decorative recolouring.
  if(q.visual.includes('fill="#edb65c"')){const count=(q.visual.match(/<circle /g)||[]).length;q.visual=KoArt.count(asset,count)}
  else q.visual='<span class="picture-badge">'+KoArt.icon(asset)+'</span>'+q.visual;
  q.methodId=s.method;q.artId=asset.id;
  return q;
 })}));
}
root.JaCoreBank={banks,generate,labels};
})(globalThis);
