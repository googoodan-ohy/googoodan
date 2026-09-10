globalThis.JaCoreCatalog={"units":[{"id":"1-1-2","grade":1,"skills":["solid-basic","solid-sort","solid-basic"]},{"id":"1-1-3","grade":1,"skills":["add:9","sub:9","bond:9"]},{"id":"1-1-4","grade":1,"skills":["length-compare","area-compare","capacity-compare","weight-compare"]},{"id":"1-1-5","grade":1,"skills":["number:50","place:2","compare:50","sequence:50"]},{"id":"1-2-1","grade":1,"skills":["number:100","place:2","compare:100","sequence:100"]},{"id":"1-2-3","grade":1,"skills":["flat-basic","flat-count","flat-build","clock:30"]},{"id":"1-2-5","grade":1,"skills":["pattern","sequence:100","array-pattern"]},{"id":"2-1-1","grade":2,"skills":["place:3","number:999","compare:999","sequence:999"]},{"id":"2-1-3","grade":2,"skills":["add:99","sub:99","three:20","unknown:99"]},{"id":"2-1-4","grade":2,"skills":["ruler:cm","measure:cm","length-compare"]},{"id":"2-1-5","grade":2,"skills":["sort","table","sort"]},{"id":"2-1-6","grade":2,"skills":["groups","mul:9","array"]},{"id":"2-2-1","grade":2,"skills":["place:4","number:9999","compare:9999","sequence:9999"]},{"id":"2-2-3","grade":2,"skills":["convert:m","measure-add:m","ruler:cm"]},{"id":"2-2-4","grade":2,"skills":["clock:5","elapsed","calendar"]},{"id":"2-2-5","grade":2,"skills":["table","graph:picture","sort"]},{"id":"2-2-6","grade":2,"skills":["pattern","sequence:100","array-pattern"]},{"id":"3-1-1","grade":3,"skills":["add:999","sub:999","unknown:999"]},{"id":"3-1-3","grade":3,"skills":["div:9","groups-div","inverse"]},{"id":"3-1-4","grade":3,"skills":["mul:99","array","unknown-mul"]},{"id":"3-1-5","grade":3,"skills":["convert:mm","convert:km","clock:1","time-seconds"]},{"id":"3-1-6","grade":3,"skills":["fraction-model","fraction-compare","decimal-model","decimal-compare:1"]},{"id":"3-2-1","grade":3,"skills":["mul:999","mul-two","unknown-mul"]},{"id":"3-2-2","grade":3,"skills":["circle-parts","circle-size","circle-draw"]},{"id":"3-2-3","grade":3,"skills":["div:99","div-remainder","inverse"]},{"id":"3-2-4","grade":3,"skills":["convert:L","convert:kg","convert:t","measure-add:L","measure-add:kg"]},{"id":"3-2-5","grade":3,"skills":["fraction-model","fraction-form","fraction-compare"]},{"id":"3-2-6","grade":3,"skills":["graph:picture","table","graph:picture"]},{"id":"4-1-1","grade":4,"skills":["place:8","large-number","compare:99999999","sequence:99999999"]},{"id":"4-1-2","grade":4,"skills":["angle-measure","angle-sum","triangle-angle","quad-angle"]},{"id":"4-1-3","grade":4,"skills":["mul-two","div-two","inverse"]},{"id":"4-1-5","grade":4,"skills":["graph:bar","table","graph:bar"]},{"id":"4-1-6","grade":4,"skills":["sequence:999","array-pattern","equal","pattern"]},{"id":"4-2-1","grade":4,"skills":["fraction-add-same","fraction-sub-same","fraction-mixed-same"]},{"id":"4-2-3","grade":4,"skills":["decimal-add","decimal-sub","decimal-compare:3","decimal-place"]},{"id":"4-2-4","grade":4,"skills":["quad-type","parallel","quad-angle"]},{"id":"4-2-5","grade":4,"skills":["graph:line","graph:line","table"]},{"id":"5-1-1","grade":5,"skills":["mixed","mixed-bracket","mixed-story"]},{"id":"5-1-2","grade":5,"skills":["factor","multiple","gcd","lcm"]},{"id":"5-1-3","grade":5,"skills":["correspond","correspond","equal"]},{"id":"5-1-5","grade":5,"skills":["fraction-add","fraction-sub","fraction-mixed"]},{"id":"5-2-1","grade":5,"skills":["range","round-up","round-down","round-nearest"]},{"id":"5-2-2","grade":5,"skills":["fraction-mul-whole","fraction-mul","fraction-mul-mixed"]},{"id":"5-2-4","grade":5,"skills":["decimal-mul-whole","decimal-mul","decimal-scale"]},{"id":"5-2-5","grade":5,"skills":["cuboid","cube-net","cuboid-edges"]},{"id":"6-1-1","grade":6,"skills":["fraction-div-whole","whole-div-fraction-result","fraction-div-whole"]},{"id":"6-1-3","grade":6,"skills":["decimal-div-whole","decimal-fraction","decimal-div-whole"]},{"id":"6-1-4","grade":6,"skills":["ratio","percent","ratio-compare"]},{"id":"6-1-5","grade":6,"skills":["graph:strip","graph:pie","graph-choice"]},{"id":"6-2-1","grade":6,"skills":["fraction-div","whole-div-fraction","fraction-div-mixed"]},{"id":"6-2-3","grade":6,"skills":["decimal-div","decimal-div","decimal-fraction"]},{"id":"6-2-4","grade":6,"skills":["proportion","share-ratio","ratio-simplify"]},{"id":"6-2-5","grade":6,"skills":["circle-circumference","circle-area","circle-half"]}],"modeNames":["計算","選択","確かめ","文章題","説明"]};
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
 finish('計算しましょう。',opts.art||'',value,expr+' = '+value,{wrong:fmt(result+1),story:op==='+'?'구슬 '+fmt(x)+'개に'+fmt(y)+'個を더 넣었습니다. 모두何개ですか。':op==='−'?'색종が'+fmt(x)+'장 중 '+fmt(y)+'장を썼습니다.何장が남았나요?':op==='×'?'한 묶음に'+fmt(x)+'こずつ'+fmt(y)+'묶음です。 모두何개ですか。':fmt(x)+'個を'+fmt(y)+'人에게 똑같が나누면 한 人이何個を받나요?'});
 if(mode===0||mode===4)task='<div class="kequation">'+expr+' = □</div>'+(mode===4?'<div class="kreason">計算：__________________</div>':'');
 if(mode===1){prompt='□に入る数を書きましょう.';task='<div class="kequation">'+fmt(x)+' '+op+' □ = '+value+'</div>';answer=fmt(y);reason=expr+' = '+value+'なので □ = '+fmt(y)}
 if(mode===2)prompt=expr+'の計算を確かめましょう。';
 check={kind:'calc',x,y,op,result,mode,expected:mode===1?fmt(y):value};
}
if(['add','sub','unknown','three'].includes(kind)){
 a=between(1,max-1);b=between(1,max-a);
 if(kind==='three'){c=between(1,Math.max(1,Math.floor(max/3)));a=between(1,c);b=between(1,c);finish('三つの数の和を求めましょう.','<div class="kequation">'+a+' + '+b+' + '+c+'</div>',a+b+c,a+' + '+b+' + '+c+' = '+(a+b+c),{story:'세 바구니にりんご가 '+a+'개, '+b+'개, '+c+'개 있습니다. 모두何개ですか。'})}
 else calc(kind==='sub'?a+b:a,b,kind==='sub'?'−':'+',{art:u.grade===1&&mode===0?dots(kind==='sub'?a+b:a):''});
}
else if(['mul','mul-two','unknown-mul','groups','array','groups-div','div','div-remainder','div-two','inverse'].includes(kind)){
 a=kind==='mul'?between(Math.max(2,Math.floor(max/10)),max):between(2,9);b=between(2,9);
 if(kind==='mul-two'){a=between(12,u.grade>=4?999:99);b=between(12,39)}
 if(kind==='div-two'){b=between(11,29);a=between(2,Math.floor(999/b))}
 if(kind==='div-remainder'){const rem=between(1,b-1),total=a*b+rem;finish(total+' ÷ '+b+'の商とあまりを求めましょう。','',a+' あまり '+rem,b+' × '+a+' + '+rem+' = '+total,{wrong:(a+1)+' あまり '+rem,story:'공 '+total+'個を'+b+'こずつ상자に담습니다. 가득 찬 상자は何개이고何개가 남나요?'});check={kind:'remainder',total,divisor:b,quotient:a,remainder:rem}}
 else if(['div','groups-div','div-two','inverse'].includes(kind)){if(kind==='div'&&max>9)a=between(10,Math.min(99,Math.floor(999/b)));calc(a*b,b,'÷')}
 else {if(kind==='groups'||kind==='array')a=between(2,6);calc(a,b,'×',{art:['groups','array'].includes(kind)?grid(a,b):''})}
}
else if(['number','count','place','compare','bond','large-number','sequence'].includes(kind)){
 if(kind==='count'){a=between(1,max);finish('図は全部で何個ですか。',dots(a),a,'一つずつ数えると'+a+'個です。')}
 else if(kind==='bond'){a=between(2,max);b=between(1,a-1);finish(a+'を'+b+'と□に分けましょう。',max<=10?dots(a):'',a-b,b+' + '+(a-b)+' = '+a)}
 else if(kind==='compare'){a=between(1,max);b=between(1,max);const ans=a>b?'>':a<b?'<':'=';finish('□に合う記号を書きましょう。','<div class="kequation">'+a+' □ '+b+'</div>',ans,'大きい位から比べます。',{choices:['>','<','='],wrong:ans==='>'?'<':'>'})}
 else if(kind==='sequence'){const step=max>99999?10000:max>999?100:max>100?10:1,start=between(1,Math.max(1,max-4*step));finish('□に入る数を書きましょう.','<div class="kequation">'+[start,start+step,'□',start+3*step].join(' → ')+'</div>',start+2*step,step+'ずつ増えます。')}
 else if(kind==='large-number'){const un=pick(['万','億','兆']),n=between(11,99);finish(un+'が'+n+'個ある数を書きましょう.','',n+un,n+' × 1'+un+' = '+n+un,{wrong:(n+1)+un})}
 else if(kind==='number'&&max===9){a=between(1,8);finish(a+'より1大きい数を書きましょう.',dots(a),a+1,a+'の次の数は'+(a+1)+'です。')}
 else {const digits=kind==='place'?max:String(max===100?99:max).length,n=between(10**(digits-1),Math.min(10**digits-1,kind==='number'?max:u.id==='1-1-5'?50:u.grade===1?99:99999999)),pos=r(digits),v=Math.floor(n/10**pos)%10,names=['一','十','百','千','万','十万','百万','千万'];finish(n+'の'+names[pos]+'の位の数字は何ですか。','',v,'右から'+(pos+1)+'番目の数字です。')}
}
else if(['pattern','array-pattern','correspond','equal'].includes(kind)){
 if(kind==='pattern'){const symbols=['●','▲','■'],pat=r(2)?[0,1,2]:[0,0,1],at=between(4,8),ans=symbols[pat[at%pat.length]];finish('きまりを見て□を埋めましょう。','<div class="kequation">'+Array.from({length:at},(_,i)=>symbols[pat[i%pat.length]]).join(' ')+' □</div>',ans,pat.map(i=>symbols[i]).join(' ')+'が繰り返されます。',{choices:symbols,wrong:symbols.find(x=>x!==ans)})}
 else if(kind==='equal')finish('両側が等しくなるように□を埋めましょう。','<div class="kequation">'+a+' + '+b+' = '+(a-1)+' + □</div>',b+1,'一方の数が1小さくなると、もう一方は1大きくなります。');
 else {const k=u.grade===1?1:between(2,5),offset=0,vals=[1,2,3,4];visual='<table class="ktable"><tr><th>入れる数</th>'+vals.map(x=>'<td>'+x+'</td>').join('')+'</tr><tr><th>出る数</th>'+vals.map(x=>'<td>'+(x===4?'□':x*k+offset)+'</td>').join('')+'</tr></table>';finish('きまりを見つけて□を埋めましょう。',visual,4*k+offset,'入れる数 × '+k+(offset?' + '+offset:'')+' = 出る数です。')}
}
else if(['flat-basic','flat-count','flat-build','solid-basic','solid-sort','sort','table'].includes(kind)){
 if(kind.startsWith('solid')){const names=u.grade===1?['箱の形','筒の形','ボールの形']:['直方体','円柱','球'],i=r(3),art=i===0?cubeArt():i===1?svg('<path d="M72 18V65Q110 89 148 65V18" fill="#f1e3c7" stroke="#997f53"/><ellipse cx="110" cy="18" rx="38" ry="12" fill="#fff6df" stroke="#997f53"/>'):svg('<circle cx="110" cy="42" r="34" fill="#dcecf5" stroke="#66869a"/>');finish('形の名前を選びましょう。',art,names[i],'平らなところと丸いところを見ます。',{choices:names,wrong:names[(i+1)%3]})}
 else if(kind==='sort'||kind==='table'){const vals=[between(1,6),between(1,6),between(1,6)],which=r(3),labels=kind==='sort'?['●','▲','■']:['りんご','なし','みかん'];visual=kind==='sort'?'<div class="ksymbols">'+vals.flatMap((n,i)=>Array(n).fill(labels[i])).join(' ')+'</div>':'<table class="ktable"><tr>'+labels.map(x=>'<th>'+x+'</th>').join('')+'</tr><tr>'+vals.map(x=>'<td>'+x+'</td>').join('')+'</tr></table>';finish(labels[which]+'は全部で何個ですか。',visual,vals[which],'同じ種類に分けて数えます。')}
 else {const names=['三角形','四角形','円'],i=r(3),art=i<2?poly(i+3):svg('<circle cx="110" cy="43" r="33" fill="#f5e3b7" stroke="#9d855b"/>');if(kind==='flat-count')finish('まっすぐな辺は何本ですか。',art,i===2?0:i+3,'三角形は3本、四角形は4本、円は0本です。');else if(kind==='flat-build'){finish('三角形2つを合わせて四角形をかきましょう。',grid(2,4),'三角形2つの一辺を合わせた四角形','四角形の中に対角線をかくと三角形2つになります。',{wrong:'三角形1つ'});if(mode!==1&&mode!==2){task='<div class="kdraw"></div>';open=true}}else finish('形の名前を書きましょう。',art,names[i],'まっすぐな辺と曲がった線を見ます。',{choices:names,wrong:names[(i+1)%3]})}
}
else if(['length-compare','area-compare','capacity-compare','weight-compare'].includes(kind)){
 a=between(3,8);b=between(1,a-1);const swap=r(2),vals=swap?[b,a]:[a,b],names=['ア','イ'],word=kind==='length-compare'?'長さ':kind==='area-compare'?'広さ':kind==='capacity-compare'?'かさ':'重さ';
 visual=svg(vals.map((v,i)=>'<rect x="45" y="'+(12+i*35)+'" width="'+v*18+'" height="17" fill="'+(i?'#edd2ac':'#abd5cc')+'"/>'+text(20,25+i*35,names[i])).join('')+text(125,90,'棒が長いほど'+word+'が大きいです。'),250,102);
 finish(word+'が大きい方を選びましょう。',visual,names[swap?1:0],word+'を表す棒を比べます。',{choices:names,wrong:names[swap?0:1]});
}
else if(['clock','elapsed','calendar','time-seconds'].includes(kind)){
 if(kind==='clock'){a=between(1,12);b=param==='30'?r(2)*30:param==='5'?r(12)*5:r(60);finish('時こくを書きましょう。',clock(a,b),a+'時'+b+'分','短い針は時、長い針は分を表します。',{wrong:a+'時'+((b+5)%60)+'分'})}
 else if(kind==='calendar'){a=between(1,4);finish(a+'週間は何日ですか。','',a*7,'1週間は7日です。')}
 else if(kind==='time-seconds'){a=between(1,4);b=between(1,59);finish(a+'分'+b+'秒は何秒ですか。','',a*60+b,a+' × 60 + '+b+'です。')}
 else {a=between(1,10);b=r(6)*10;const delta=between(1,6)*10,total=a*60+b+delta;finish(a+'時'+b+'分から'+delta+'分後の時こくは何時何分ですか。',clock(a,b),Math.floor(total/60)+'時'+total%60+'分','60分は1時間です。',{wrong:a+'時'+b+'分'})}
}
else if(['ruler','measure','convert','measure-add'].includes(kind)){
 const units={mm:['cm','mm',10],m:['m','cm',100],km:['km','m',1000],L:['L','mL',1000],kg:['kg','g',1000],t:['t','kg',1000],cm:['cm','cm',1]},[big,small,factor]=units[param]||units.cm;
 if(kind==='ruler'){a=between(1,7);b=between(a+1,10);visual=svg('<path d="M15 55H215" stroke="#607b83"/>'+Array.from({length:11},(_,i)=>'<path d="M'+(15+i*20)+' 50V60" stroke="#607b83"/>'+text(15+i*20,75,i)).join('')+'<rect x="'+(15+a*20)+'" y="25" width="'+(b-a)*20+'" height="15" fill="#efc17c"/>'+text(200,15,'cm'),230,90);finish('棒の長さは何cmですか。',visual,b-a,b+' − '+a+' = '+(b-a))}
 else if(kind==='measure')finish('えんぴつの長さを測る単位を選びましょう。','','cm','短い物の長さはcmで表します。',{choices:['cm','時間','kg'],wrong:'kg'});
 else {a=between(1,8);b=between(1,9)*(factor/10);const total=a*factor+b,extra=kind==='measure-add'?between(1,4)*(factor/10):0;finish(a+big+' '+b+small+(extra?'に'+extra+small+'をたすと':'は')+'何'+small+'ですか。','',total+extra,'1'+big+' = '+factor+small+'です。 '+a+' × '+factor+' + '+b+(extra?' + '+extra:'')+' = '+(total+extra))}
}
else if(['fraction-model','fraction-form','fraction-compare','decimal-model','decimal-compare','decimal-place','decimal-fraction','reduce','common-denominator','fraction-compare-unlike'].includes(kind)){
 const d=between(2,9),n=between(1,d-1),m=between(1,d-1);
 if(kind==='fraction-model')finish('色のついた部分を分数で表しましょう。',bar(n,d),n+'/'+d,'全部で'+d+'こに分けたうちの'+n+'こです。',{wrong:d+'/'+n});
 if(kind==='fraction-form'){const w=between(1,4);finish('仮分数を帯分数で表しましょう。','<div class="kequation">'+F(w*d+n,d)+'</div>',w+' '+n+'/'+d,d+'こずつ'+w+'まとまりと'+n+'こ残ります。',{wrong:(w+1)+' '+n+'/'+d})}
 if(kind==='fraction-compare'||kind==='fraction-compare-unlike'){const e=kind==='fraction-compare'?d:d+1,ans=n*e>m*d?'>':n*e<m*d?'<':'=';finish('二つの分数を比べましょう。','<div class="kequation">'+F(n,d)+' □ '+F(m,e)+'</div>',ans,kind==='fraction-compare'?'分母が同じときは分子を比べます。':'分母をそろえて分子を比べます。',{choices:['>','<','='],wrong:ans==='>'?'<':'>'})}
 if(kind==='decimal-model'){a=between(1,9);finish('色のついた部分を小数で表しましょう。',bar(a,10),a/10,a+'/10 = '+a/10)}
 if(kind==='decimal-compare'){const scale=10**max;a=between(1,scale*3)/scale;b=between(1,scale*3)/scale;const ans=a>b?'>':a<b?'<':'=';finish('合う記号を書きましょう。','<div class="kequation">'+a+' □ '+b+'</div>',ans,'小数点をそろえて、大きい位から比べます。',{choices:['>','<','='],wrong:ans==='>'?'<':'>'})}
 if(kind==='decimal-place'){a=between(101,999);const pos=r(3),names=['第1','第2','第3'],v=Number(String(a)[pos]);finish((a/1000).toFixed(3)+'の小数'+names[pos]+'位の数字は何ですか。','',v,'小数点の右から位を確かめます。')}
 if(kind==='decimal-fraction'){a=between(1,99);finish(a+'/100を小数で表しましょう。','',a/100,'100分の1が'+a+'個です。')}
 if(kind==='reduce'){a=between(2,5);finish('기약分수로 약分하세요.','<div class="kequation">'+F(n*a,d*a)+'</div>',frac(n,d),'分자와 分모를 最大公約数 '+gcd(n*a,d*a)+'でわります。',{wrong:(n*a)+'/'+(d*a+1)})}
 if(kind==='common-denominator'){const e=d+1,l=d*e/gcd(d,e);finish('가장 작은 공통分모로 통分하세요.','<div class="kequation">'+F(n,d)+' , '+F(1,e)+'</div>',(n*l/d)+'/'+l+', '+(l/e)+'/'+l,'分모の最小公倍数は '+l+'です。',{wrong:n+'/'+l+', 1/'+l})}
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
 finish(u.grade===4?'計算しましょう。':'計算して、約分した分数か整数で答えましょう。','<div class="kequation">'+F(n,d)+' '+op+' '+F(m,e)+'</div>',ans,expr+' = '+num+'/'+den+' = '+ans,{wrong:frac(num+1,den),story:op==='+'?'리본 '+n+'/'+d+' m와 '+m+'/'+e+' m를 이으면何mですか。':op==='−'?n+'/'+d+' m 중 '+m+'/'+e+' m를 쓰면何m가 남나요?':op==='×'?n+'/'+d+'の'+m+'/'+e+'なしは 얼마ですか。':n+'/'+d+' m를 '+m+'/'+e+' m씩 나누면何조각 分량ですか。'});
 if(mode===1){prompt='答えの□を埋めましょう。';task='<div class="kequation">= '+F('□',den)+'</div>';answer=String(num);reason=expr+' = '+num+'/'+den}
 check={kind:'fraction',n,d,m,e,op,num,den};
}
else if(kind.startsWith('decimal-')){
 let x=between(11,199)/10,y=between(11,99)/10,op=kind.includes('sub')?'−':kind.includes('mul')||kind==='decimal-scale'?'×':kind.includes('div')?'÷':'+';
 if(kind.includes('whole'))y=between(2,9);if(kind==='decimal-scale')y=pick([10,100]);if(op==='−'&&x<y)[x,y]=[y,x];
 if(op==='÷'){y=kind.includes('whole')?between(2,9):between(1,99)/10;x=Number((y*between(1,99)/10).toFixed(2))}
 calc(x,y,op);
 if(mode===3)prompt='長さ가 '+x+' m인 리본を'+(op==='+'?y+' m 더 이으면 全部で長さは何mですか。':op==='−'?y+' m 자르면何m가 남나요?':op==='×'?y+'なし로 늘리면何mですか。':y+' m씩 나누면何조각 分량ですか。');
}
else if(['mixed','mixed-bracket','mixed-story','factor','multiple','gcd','lcm','range','round-up','round-down','round-nearest'].includes(kind)){
 if(kind.startsWith('mixed')){const bracket=kind==='mixed-bracket'||mode===4,value=bracket?(a+b)*c:a+b*c,expr=bracket?'('+a+' + '+b+') × '+c:a+' + '+b+' × '+c;finish('順序を考えて計算しましょう。','<div class="kequation">'+expr+'</div>',value,bracket?'かっこの中を先に計算してからかけます。':'かけ算を先に計算してからたします。',{story:bracket?'えんぴつ'+a+'本と'+b+'本を一つの箱に入れて、'+c+'箱用意しました。全部で何本ですか。':'えんぴつ'+a+'本に、'+b+'本ずつのまとまりを'+c+'つ加えました。全部で何本ですか。'})}
 else if(kind==='factor'){a=between(4,36);const f=Array.from({length:a},(_,i)=>i+1).filter(i=>a%i===0);finish(a+'の約数をすべて書きましょう。','',f.join(', '),a+'をわり切れる整数を探します。',{wrong:f.slice(1).join(', ')})}
 else if(kind==='multiple'){a=between(2,12);finish(a+'の倍数を小さい方から3つ書きましょう。','',[a,a*2,a*3].join(', '),a+'に1、2、3をそれぞれかけます。',{wrong:[a,a+1,a+2].join(', ')})}
 else if(kind==='gcd'||kind==='lcm'){a=between(4,24);b=between(4,24);const ans=kind==='gcd'?gcd(a,b):a*b/gcd(a,b);finish(a+'と'+b+'の'+(kind==='gcd'?'最大公約数':'最小公倍数')+'は何ですか。','',ans,kind==='gcd'?'共通する約数のうち最も大きい数を探します。':'共通する倍数のうち最も小さい数を探します。')}
 else if(kind==='range'){a=between(10,30);const labels=['以上の','以下の','より大きい','未満の'],idx=r(4),vals=[a-1,a,a+1],ok=vals.filter(n=>idx===0?n>=a:idx===1?n<=a:idx===2?n>a:n<a);finish(a+' '+labels[idx]+'数をすべて書きましょう。','<div class="kequation">'+vals.join(', ')+'</div>',ok.join(', '),'以上・以下は境目の数を含み、より大きい・未満は含みません。',{wrong:vals.filter(n=>!ok.includes(n)).join(', ')})}
 else {a=between(101,999);const f=pick([10,100]),ans=(kind==='round-up'?Math.ceil(a/f):kind==='round-down'?Math.floor(a/f):Math.round(a/f))*f,verb=kind==='round-up'?'切り上げ':kind==='round-down'?'切り捨て':'四捨五入';finish(a+'を'+verb+'して'+(f===10?'十':'百')+'の位まで表しましょう。','',ans,'残す位のすぐ下を見て'+verb+'します。')}
}
else if(['ratio','percent','ratio-compare','proportion','share-ratio','ratio-simplify','average','average-missing','chance'].includes(kind)){
 if(kind==='ratio')finish('赤い玉'+a+'個と青い玉'+b+'個の比を書きましょう。','',a+' : '+b,'赤い玉の数、青い玉の数の順に比を書きます。',{wrong:b+' : '+(a+1)});
 else if(kind==='percent'){const total=pick([20,25,50,100]),part=between(1,total);finish('全部で'+total+'個のうち'+part+'個は何%ですか。','',Number((part/total*100).toFixed(6)),'比べる量÷もとにする量×100です。')}
 else if(kind==='ratio-compare'){const x=a/b,y=c/b;finish('割合が大きい方を選びましょう。','<div class="kequation">ア：'+a+' : '+b+'　イ：'+c+' : '+b+'</div>',x>y?'ア':x<y?'イ':'等しい','もとにする量が同じなので、比べる量の大小を調べます。',{choices:['ア','イ','等しい'],wrong:x>y?'イ':'ア'})}
 else if(kind==='proportion')finish('等しい比になるように□の数を求めましょう。','<div class="kequation">'+a+' : '+b+' = □ : '+b*c+'</div>',a*c,'両方の数に同じ数'+c+'をかけます。');
 else if(kind==='share-ratio'){const total=(a+b)*c;finish(total+'個を'+a+' : '+b+'の比で分けると、前の数に当たる分は何個ですか。','',a*c,total+' × '+a+'/('+a+' + '+b+') = '+a*c)}
 else if(kind==='ratio-simplify'){const g=gcd(a,b);finish(a*c+' : '+b*c+'を最も簡単な整数の比にしましょう。','',a/g+' : '+b/g,'両方の数を最大公約数'+g*c+'でわります。',{wrong:a/g+' : '+(b/g+1)})}
 else if(kind==='chance'){const ans=pick(['불가능하다','확실하다','반반이다']),stem=ans==='불가능하다'?'빨간 공만 있は 상자の파란 공を뽑を가능성은 어떤가요?':ans==='확실하다'?'파란 공만 있は 상자の파란 공を뽑を가능성은 어떤가요?':'빨간 공 1개와 파란 공 1個のうち보지 않고 하나를 뽑を때 빨간 공日目 가능성은 어떤가요?';finish(stem,'',ans,'상자 안の공 종류와 개수를 비교します。',{choices:['불가능하다','확실하다','반반이다'],wrong:ans==='확실하다'?'불가능하다':'확실하다'})}
 else {a=between(5,15);b=between(1,4);const vals=[a-b,a,a+b];if(kind==='average')finish('세 수の평균を求めましょう.','<div class="kequation">'+vals.join(', ')+'</div>',a,'합 '+a*3+'を자료 수 3으でわります。');else finish('평균が'+a+'日目 때 □를 求めましょう.','<div class="kequation">'+(a-b)+', □, '+(a+b)+'</div>',a,'합 '+a*3+'の알려진 두 수를 뺍니다.')}
}
else if(kind==='graph'||kind==='graph-choice'){
 const vals=[between(1,4)*10,between(1,4)*10,between(1,4)*10],labels=['ア','イ','ウ'],idx=r(3);let art='';
 if(param==='line')art=svg(Array.from({length:5},(_,i)=>'<path d="M35 '+(85-i*15)+'H210" stroke="#dce6ea"/>'+text(18,89-i*15,i*10)).join('')+'<polyline points="'+vals.map((v,i)=>(55+i*65)+','+(85-v*1.5)).join(' ')+'" fill="none" stroke="#568cac" stroke-width="2"/>'+vals.map((v,i)=>'<circle cx="'+(55+i*65)+'" cy="'+(85-v*1.5)+'" r="3" fill="#568cac"/>'+text(55+i*65,105,(i+1)+'日目')).join('')+text(120,13,'気温（℃）'),235,115);
 else if(param==='pie'||param==='strip'){vals[0]=20;vals[1]=30;vals[2]=50;const colors=['#a8d6ca','#eec487','#b8b0db'];art=param==='strip'?svg(vals.map((v,i)=>'<rect x="'+(10+vals.slice(0,i).reduce((x,y)=>x+y,0)*2)+'" y="20" width="'+v*2+'" height="32" fill="'+colors[i]+'" stroke="white"/>'+text(10+(vals.slice(0,i).reduce((x,y)=>x+y,0)+v/2)*2,66,labels[i]+' '+v+'%')).join(''),230,85):svg('<circle cx="80" cy="55" r="34" fill="none" stroke="'+colors[2]+'" stroke-width="24"/><circle cx="80" cy="55" r="34" fill="none" stroke="'+colors[0]+'" stroke-width="24" stroke-dasharray="'+(.2*2*Math.PI*34)+' '+(2*Math.PI*34)+'" transform="rotate(-90 80 55)"/><circle cx="80" cy="55" r="34" fill="none" stroke="'+colors[1]+'" stroke-width="24" stroke-dasharray="'+(.3*2*Math.PI*34)+' '+(2*Math.PI*34)+'" stroke-dashoffset="'+(-.2*2*Math.PI*34)+'" transform="rotate(-90 80 55)"/>'+vals.map((v,i)=>text(175,30+i*24,labels[i]+' '+v+'%')).join(''),240,112)}
 else if(param==='picture'){const scale=u.grade===2?1:10;if(scale===1)vals.forEach((v,i)=>vals[i]=v/10);art=svg(vals.map((v,i)=>text(15,22+i*25,labels[i])+Array.from({length:v/(u.grade===2?1:10)},(_,j)=>'<circle cx="'+(48+j*25)+'" cy="'+(18+i*25)+'" r="7" fill="#8fc6bc"/>').join('')).join('')+text(120,100,'●一つは'+scale+'人'),240,112);}
 else art=svg(Array.from({length:5},(_,i)=>'<path d="M35 '+(85-i*15)+'H215" stroke="#dce6ea"/>'+text(18,89-i*15,i*10)).join('')+vals.map((v,i)=>'<rect x="'+(50+i*55)+'" y="'+(85-v*1.5)+'" width="27" height="'+v*1.5+'" fill="#91c6ba"/>'+text(64+i*55,103,labels[i])).join('')+text(125,12,'選んだ人数（人）'),240,115);
 if(kind==='graph-choice')finish('時間にともなう気温の変化には、どのグラフが合いますか。','','折れ線グラフ','時間とともに変わる様子を線で結びます。',{choices:['折れ線グラフ','円グラフ','帯グラフ'],wrong:'円グラフ'});
 else if(mode<2)finish((param==='line'?(idx+1)+'日目の気温は何℃':labels[idx]+(param==='pie'||param==='strip'?'の割合は何%':'を選んだ人は何人'))+'ですか。',art,vals[idx],'目もりや凡例から値を読みます。');
 else if(mode===2)finish(param==='line'?'1日目と2日目の気温を足しましょう。':'アとイの値を足しましょう。',art,vals[0]+vals[1],vals[0]+' + '+vals[1]+' = '+(vals[0]+vals[1]));
 else if(mode===3)finish('最も大きい値と最も小さい値の差を求めましょう。',art,Math.max(...vals)-Math.min(...vals),'最大の値から最小の値をひきます。');
 else {finish('グラフの資料を表にまとめましょう。',art,vals.map((v,i)=>(param==='line'?(i+1)+'日目':labels[i])+': '+v).join(', '),'項目ごとの値を表に書きます。',{wrong:'すべて0'});task='<table class="ktable"><tr>'+labels.map(x=>'<th>'+x+'</th>').join('')+'</tr><tr><td>　</td><td>　</td><td>　</td></tr></table>';open=true}
}
else if(['angle-right','lines','angle-type','angle-measure','angle-sum','triangle-angle','quad-angle','parallel','triangle-side','triangle-type','quad-type','polygon','diagonal','tile'].includes(kind)){
 if(kind==='angle-right'){const yes=r(2)===0;finish('직각인 그림ですか。',svg('<path d="M65 15V67H165" fill="none" stroke="#547b92" stroke-width="3" transform="'+(yes?'':'translate(25 0) skewX(-25)')+'"/>'),yes?'예':'아니요','종이の반듯한 辺와 겹쳐 확인します。',{choices:['예','아니요'],wrong:yes?'아니요':'예'})}
 else if(kind==='lines'){const idx=r(3),names=['선分','반직선','직선'];visual=svg('<path d="M35 42H190" stroke="#537e8d" stroke-width="3"/>'+(idx===0?'<circle cx="35" cy="42" r="4" fill="#537e8d"/><circle cx="190" cy="42" r="4" fill="#537e8d"/>':idx===1?'<circle cx="35" cy="42" r="4" fill="#537e8d"/><path d="M181 35L190 42L181 49" fill="none" stroke="#537e8d" stroke-width="2"/>':'<path d="M44 35L35 42L44 49M181 35L190 42L181 49" fill="none" stroke="#537e8d" stroke-width="2"/>'));finish('그림の이름を書きましょう.',visual,names[idx],'끝점と뻗は 방향を확인します。',{choices:names,wrong:names[(idx+1)%3]})}
 else if(kind==='angle-type'||kind==='angle-measure'){
 const angle=pick([30,40,60,90,120,130,150]),rad=angle*Math.PI/180,cx=110,cy=82,R=67;
 const ticks=Array.from({length:19},(_,i)=>{const t=i*Math.PI/18;return '<path d="M'+(cx+(R-6)*Math.cos(t))+' '+(cy-(R-6)*Math.sin(t))+'L'+(cx+R*Math.cos(t))+' '+(cy-R*Math.sin(t))+'" stroke="#7c929e"/>'+(i%3===0?text(cx+(R-17)*Math.cos(t),cy-(R-17)*Math.sin(t)+3,i*10):'')}).join('');
 visual=svg((kind==='angle-measure'?'<path d="M43 82A67 67 0 0 1 177 82" fill="#f7fafb" stroke="#a6bdc8"/>'+ticks:'')+'<path d="M110 82H181M110 82L'+(cx+R*Math.cos(rad))+' '+(cy-R*Math.sin(rad))+'" stroke="#486b98" stroke-width="2" fill="none"/>',230,98);
 finish(kind==='angle-type'?'각の종류를 選びましょう.':'分度器の目盛りを読んで角度を求めましょう。',visual,kind==='angle-type'?(angle<90?'예각':angle===90?'직각':'둔각'):angle,kind==='angle-measure'?'右の0°から、もう一方の辺が指す目盛り'+angle+'°を読みます。':'90°보다 작으면 예각, 같으면 직각, 크고 180°보다 작으면 둔각です。',{choices:kind==='angle-type'?['예각','직각','둔각']:undefined,wrong:kind==='angle-type'?(angle===90?'예각':'직각'):angle+10})
}
 else if(kind==='angle-sum'){a=between(2,8)*10;b=between(1,8)*10;finish('隣り合う二つの角'+a+'°と'+b+'°を合わせると何度ですか。','',a+b,a+' + '+b+' = '+(a+b)+'°')}
 else if(kind==='triangle-angle'||kind==='quad-angle'){const tri=kind==='triangle-angle',sum=tri?180:360,vals=tri?[between(3,7)*10,between(3,7)*10]:[90,90,between(6,12)*10];finish((tri?'三角形':'四角形')+'の角のうち'+vals.map(v=>v+'°').join(', ')+'が分かっています。残りの角は何度ですか。','',sum-vals.reduce((x,y)=>x+y),'角の和'+sum+'°から分かっている角を引きます。')}
 else if(kind==='triangle-side'){a=between(3,9);finish('세 변が모두 '+a+' cm인 三角形の이름은 무엇ですか。',poly(3),'정三角形','세 변の長さ가 모두 같습니다.',{choices:['정三角形','직각三角形','둔각三角形'],wrong:'둔각三角形'})}
 else if(kind==='triangle-type'){const idx=r(3),angles=[[60,60,60],[30,60,90],[30,30,120]][idx];finish('세 각が'+angles.join('°, ')+'°인 三角形を각に따라 分류하세요.','',['예각三角形','직각三角形','둔각三角形'][idx],'직각 또は 둔각が있は지 확인します。',{choices:['예각三角形','직각三角形','둔각三角形'],wrong:['둔각三角形','예각三角形','직각三角形'][idx]})}
 else if(kind==='quad-type'){const idx=r(4),names=['長方形','正方形','ひし形','平行四辺形'],facts=['四つの角が直角で、横6cm、縦3cm','四つの角が直角で、四つの辺がすべて4cm','四つの辺の長さが等しく、一つの角が60°','向かい合う二組の辺が平行で、隣り合う辺が4cmと6cm、一つの角が60°'];finish(facts[idx]+'の四角形の名前は何ですか。','',names[idx],'辺の長さと角の条件を確かめます。',{choices:names,wrong:names[(idx+1)%4]})}
 else if(kind==='parallel')finish('長方形の向かい合う二つの辺の関係を書きましょう。',rect('6 cm','3 cm'),'平行','どこまでも延ばしても交わらない二つの直線です。',{choices:['平行','垂直'],wrong:'垂直'});
 else if(kind==='tile'){a=between(2,5);b=between(2,6);finish('한 칸に조각 하나를 놓습니다.何개가 필요한가요?',grid(a,b),a*b,a+' × '+b+' = '+a*b)}
 else {const n=between(3,8);if(kind==='diagonal')finish('한 頂点の그を수 있は 대각선はいくつですか。',poly(n),n-3,'자기 자신と이웃한 두 頂点を제외します。');else finish('다각형の변はいくつですか。',poly(n),n,'둘레를 따라 변を하나씩 셉니다.')}
}
else if(['circle-parts','circle-size','circle-draw','circle-circumference','circle-area','circle-half'].includes(kind)){
 a=between(2,12);visual=svg('<circle cx="80" cy="45" r="34" fill="#edf5fa" stroke="#678aa1"/><circle cx="80" cy="45" r="3" fill="#678aa1"/><path d="M80 45H114" stroke="#678aa1" stroke-width="2"/>'+text(180,48,'半径 '+a+' cm'),250,90);
 if(kind==='circle-parts')finish('中心から円周上の一点まで結んだ線分の名前は何ですか。',visual,'半径','中心から円周上の点まで結んだ線分です。',{choices:['半径','直径','頂点'],wrong:'直径'});
 else if(kind==='circle-size')finish('円の直径は何cmですか。',visual,a*2,'直径は半径の2倍です。');
 else if(kind==='circle-draw')finish('半径 '+a+'cmの円をかくには、コンパスを何cm開きますか。','',a,'コンパスの開きは半径と同じです。');
 else {const result=kind==='circle-circumference'?2*a*3.14:kind==='circle-half'?a*a*3.14/2:a*a*3.14;finish((kind==='circle-circumference'?'円周(cm)':kind==='circle-half'?'この円の半分の面積(cm²)':'円の面積(cm²)')+'を求めましょう。（円周率：3.14）',visual,Number(result.toFixed(2)),kind==='circle-circumference'?'直径 × 3.14 = '+a*2+' × 3.14':'半径 × 半径 × 3.14'+(kind==='circle-half'?' ÷ 2':''))}
}
else if(['move','flip','turn','congruent','symmetry-line','symmetry-point'].includes(kind)){
 if(kind==='move'){a=between(1,4);b=between(1,4);finish('오른쪽 '+a+'칸, 다時오른쪽 '+b+'칸 움직이면 처음の오른쪽何칸ですか。',grid(2,8),a+b,a+' + '+b+'こです。')}
 else if(kind==='flip')finish('화살표를 좌우로 뒤집으면 어느 쪽を향하나요?','<div class="kequation">→</div>','왼쪽','좌우가 바뀝니다.',{choices:['왼쪽','오른쪽','위쪽'],wrong:'오른쪽'});
 else if(kind==='turn'){const turns=between(1,3),names=['오른쪽','아래쪽','왼쪽'];finish('시계 방향으로 직각만큼 '+turns+'번 돌리면 어느 쪽を향하나요?','<div class="kequation">↑</div>',names[turns-1],'위→오른쪽→아래→왼쪽으로 바뀝니다.',{choices:names,wrong:'위쪽'})}
 else if(kind==='congruent'){a=between(3,9);finish('합동인 두 三角形の한 변が'+a+' cmです。 대응하は 변은何cmですか。',poly(3),a,'대응변の長さは 같습니다.')}
 else if(kind==='symmetry-line')finish('正方形の대칭축はいくつですか。',poly(4),4,'마주 보は 변の중점を잇は 2개와 대각선 2個です。');
 else finish('점대칭인 도형を대칭の중심 둘레로何도 돌리면 처음と겹치나요?','',180,'반 바퀴は 180°です。');
}
else if(kind.startsWith('area-')||['perimeter','surface','volume','volume-convert'].includes(kind)){
 a=between(3,12);b=between(2,9);c=between(2,8);let result,stem,art,why;
 if(kind==='perimeter'){result=2*(a+b);stem='長方形の둘레は何cmですか。';art=rect(a+' cm',b+' cm');why='(가로 + 세로) × 2'}
 else if(kind==='surface'){result=2*(a*b+b*c+a*c);stem='가로 '+a+' cm, 세로 '+b+' cm, 높が'+c+' cm인 直方体の겉広さは何cm²ですか。';art=cubeArt();why='(가로×세로 + 세로×높が+ 가로×높이) × 2'}
 else if(kind==='volume'){result=a*b*c;stem='가로 '+a+' cm, 세로 '+b+' cm, 높が'+c+' cm인 直方体の부피は何cm³ですか。';art=cubeArt();why='가로 × 세로 × 높이'}
 else if(kind==='volume-convert'){result=a*1000000;stem=a+' m³は何cm³ですか。';art='';why='1 m³ = 1,000,000 cm³'}
 else {b=2*between(2,5);if(kind==='area-trapezoid')c=a+between(1,5);result=kind==='area-triangle'?a*b/2:kind==='area-trapezoid'?(a+c)*b/2:kind==='area-rhombus'?a*b/2:a*b;stem=kind==='area-triangle'?'밑변 '+a+' cm, 높が'+b+' cm인 三角形':kind==='area-trapezoid'?'윗변 '+a+' cm, 아랫변 '+c+' cm, 높が'+b+' cm인 사다리꼴':kind==='area-rhombus'?'두 대각선が'+a+' cm, '+b+' cm인 ひし形':kind==='area-parallelogram'?'밑변 '+a+' cm, 높が'+b+' cm인 平行四辺形':'가로 '+a+' cm, 세로 '+b+' cm인 長方形';stem+='の広さは何cm²ですか。';art=kind==='area-rectangle'?rect(a+' cm',b+' cm'):svg('<path d="'+(kind==='area-triangle'?'M35 70L95 12L180 70Z':kind==='area-trapezoid'?'M35 70L65 15H140L180 70Z':kind==='area-rhombus'?'M35 43L105 10L180 43L105 77Z':'M35 70L65 15H185L155 70Z')+'" fill="#e6edf8" stroke="#6d86a5" stroke-width="2"/>'+text(110,91,'長さは 문제の조건を보세요'),220,100);why=kind==='area-triangle'?'밑변 × 높が÷ 2':kind==='area-trapezoid'?'(윗변 + 아랫변) × 높が÷ 2':kind==='area-rhombus'?'대각선 × 다른 대각선 ÷ 2':'밑변(가로) × 높이(세로)'}
 finish(stem,art,result,why+' = '+result);check={kind:'measure',skill:kind,a,b,c,result};
}
else if(['cuboid','cuboid-edges','cube-net','prism','pyramid','prism-net','cylinder','cone','sphere','cylinder-net','cube-count','cube-view','cube-missing'].includes(kind)){
 if(['cube-count','cube-view','cube-missing'].includes(kind)){
 const hs=[between(1,3),between(0,3),between(1,3),between(0,3)],sum=hs.reduce((x,y)=>x+y),front=r(2)===0;
 visual='<div class="height-map">'+hs.map(n=>'<span>'+n+'</span>').join('')+'</div><small class="diagram-note">위の본 모양 · 숫자は 그 자리の개수 · 아래쪽が앞</small>';
 if(u.grade===2){const n=between(2,5);visual=svg(Array.from({length:n},(_,i)=>'<g transform="translate('+(i*29)+' 0)"><path d="M8 30L20 20H43V43L31 53H8ZM8 30H31L43 20M31 30V53" fill="#d9eaf3" stroke="#608397"/></g>').join(''),n*29+20,65);finish('쌓기나무は 모두何개ですか。',visual,n,'나란히 놓인 쌓기나무를 하나씩 셉니다.')}
 else {const result=kind==='cube-view'?(front?Math.max(hs[0],hs[2])+Math.max(hs[1],hs[3]):Math.max(hs[0],hs[1])+Math.max(hs[2],hs[3])):kind==='cube-missing'?sum-hs[0]:sum;finish(kind==='cube-view'?(front?'앞':'오른쪽 옆')+'の보이は 正方形はいくつですか。':kind==='cube-missing'?'왼쪽 위 자리の쌓기나무를 모두 빼면何개가 남나요?':'쌓기나무は 모두何개ですか。',visual,result,kind==='cube-view'?'보は 방향の겹친 줄마다 가장 높은 개수をたすと '+result+'個です。':hs.join(' + ')+' = '+sum+(kind==='cube-missing'?', '+sum+' − '+hs[0]+' = '+result:''))}
}
 else if(kind==='cube-net'){const cells=[[1,0],[0,1],[1,1],[2,1],[3,1],[1,2]],idx=r(6);visual=svg(cells.map(([x,y],i)=>'<rect x="'+(30+x*24)+'" y="'+(5+y*24)+'" width="24" height="24" fill="'+(i===idx?'#efca80':'#e7eff5')+'" stroke="#64879a"/>').join(''),170,85);finish('立方体の展開図で色をぬっていない面はいくつですか。',visual,5,'正方形6枚から色をぬった1枚を引くと5枚です。');if(mode===4){prompt='この展開図を折ると立方体になる理由を説明しましょう。';answer='6枚の正方形が重ならず、立方体の6つの面になります。';reason='切り取って折り、確かめてもよいです。'}}
 else if(['cuboid','cuboid-edges'].includes(kind)){const attr=kind==='cuboid-edges'?['辺',12]:kind==='cube-net'?['전개도に필요한 正方形',6]:pick([['面',6],['頂点',8],['辺',12]]);finish((kind==='cube-net'?'立方体':'直方体')+'の'+attr[0]+'はいくつですか。',cubeArt(),attr[1],'面は6つ、頂点は8つ、辺は12本です。')}
 else if(kind==='prism-net'){visual=svg('<path d="M28 31H124V71H28ZM60 31V71M92 31V71M28 31L44 4L60 31M28 71L44 98L60 71" fill="#dce9f3" stroke="#62879c"/>',155,106);finish('が전개도를 접어 만든 입체形の名前を書きましょう。',visual,'삼각기둥','三角形인 밑면 2개와 長方形인 옆면 3個です。',{choices:['삼각기둥','삼각뿔','사각기둥'],wrong:'삼각뿔'})}
 else if(['prism','pyramid'].includes(kind)){const n=between(3,6),pyr=kind==='pyramid',attr=pick(['面','頂点','辺']),result=attr==='面'?(pyr?n+1:n+2):attr==='頂点'?(pyr?n+1:2*n):(pyr?2*n:3*n),name=['','','','삼','사','오','육'][n]+(pyr?'각뿔':'각기둥');finish(name+'の'+attr+'はいくつですか。','',result,pyr?'밑면と꼭대기 頂点を구分して셉니다.':'위아래 밑면と옆면を구分して셉니다.')}
 else {const facts={cylinder:['円柱の밑면はいくつですか。',2,'합동인 원 2個です。'],cone:['원뿔の頂点はいくつですか。',1,'꼭대기 頂点은 1個です。'],sphere:['구の중심の겉면까지の거리は 무엇이라고 하나요?','半径','半径은 어느 방향이나 같습니다.'],'cylinder-net':['円柱の옆면を높が방향으로 잘라 펼치면 무슨 모양ですか。','長方形','平行한 두 밑면 사이를 높が방향으로 자릅니다.']};const [stem,result,why]=facts[kind];finish(stem,'',result,why,{wrong:typeof result==='number'?result+1:'三角形',choices:typeof result==='number'?undefined:[result,'三角形','頂点']})}
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
'solid-basic':'立体の形を知る','solid-sort':'立体の形を分ける','flat-basic':'平らな形を知る','flat-count':'辺を数える','flat-build':'形を組み合わせる','cube-count':'쌓기나무 세기',
'length-compare':'長さを比べる','area-compare':'広さを比べる','capacity-compare':'かさを比べる','weight-compare':'重さを比べる',ruler:'目もりから長さを読む',measure:'単位を選ぶ',convert:'単位を変える','measure-add':'量の計算',
sort:'種類に分ける',table:'表を読む',graph:'グラフを読む',groups:'まとまりとかけ算',mul:'かけ算',array:'並び方とかけ算','unknown-mul':'かけ算の□',clock:'時計を読む',elapsed:'時間を求める',calendar:'週と日',pattern:'繰り返すきまり','array-pattern':'表のきまり',
lines:'선분·직선·반직선','angle-right':'직각 찾기',div:'わり算','groups-div':'まとまりの数',inverse:'かけ算とわり算の関係','time-seconds':'分と秒',
'fraction-model':'図を分数で表す','fraction-compare':'分数を比べる','decimal-model':'図を小数で表す','decimal-compare':'小数を比べる','mul-two':'二けたをかける','circle-parts':'円のつくり','circle-size':'半径と直径','circle-draw':'コンパスの開き','div-remainder':'商とあまり','fraction-form':'仮分数から帯分数へ',
'large-number':'万・億・兆','angle-measure':'分度器を読む','angle-sum':'角を合わせる','triangle-angle':'三角形の角','quad-angle':'四角形の角','div-two':'二けたでわる',move:'밀어서 옮기기',flip:'뒤집기',turn:'돌리기',equal:'等しい式',
'fraction-add-same':'同分母のたし算','fraction-sub-same':'同分母のひき算','fraction-mixed-same':'帯分数の計算','triangle-side':'변으로 삼각형 분류','triangle-type':'각으로 삼각형 분류','decimal-add':'小数のたし算','decimal-sub':'小数のひき算','decimal-place':'小数の位','quad-type':'四角形の性質',parallel:'平行な辺',polygon:'다각형 알아보기',diagonal:'대각선 찾기',tile:'빈틈없이 채우기',
mixed:'計算の順序','mixed-bracket':'かっこのある式','mixed-story':'文章と計算の順序',factor:'約数を求める',multiple:'倍数を求める',gcd:'最大公約数',lcm:'最小公倍数',correspond:'二つの量の関係',reduce:'기약분수 만들기','common-denominator':'공통분모 만들기','fraction-compare-unlike':'이분모 분수 비교',
'fraction-add':'分数のたし算','fraction-sub':'分数のひき算','fraction-mixed':'帯分数の計算',perimeter:'둘레 구하기','area-rectangle':'직사각형의 넓이','area-triangle':'삼각형의 넓이','area-parallelogram':'평행사변형의 넓이','area-trapezoid':'사다리꼴의 넓이','area-rhombus':'마름모의 넓이',range:'数の範囲','round-up':'切り上げ','round-down':'切り捨て','round-nearest':'四捨五入',
'fraction-mul-whole':'分数と整数のかけ算','fraction-mul':'分数同士のかけ算','fraction-mul-mixed':'帯分数のかけ算',congruent:'합동과 대응변','symmetry-line':'선대칭도형','symmetry-point':'점대칭도형','decimal-mul-whole':'小数と整数のかけ算','decimal-mul':'小数同士のかけ算','decimal-scale':'10倍・100倍と小数点',
cuboid:'直方体のつくり','cube-net':'立方体の展開図','cuboid-edges':'辺を数える',average:'평균 구하기','average-missing':'평균으로 빠진 값 찾기',chance:'가능성 판단',
'fraction-div-whole':'分数を整数でわる','whole-div-fraction-result':'商を分数で表す',prism:'각기둥의 구성',pyramid:'각뿔의 구성','prism-net':'전개도로 입체 찾기','decimal-div-whole':'小数を整数でわる','decimal-fraction':'分数と小数',ratio:'比で表す',percent:'百分率を求める','ratio-compare':'割合を比べる','graph-choice':'グラフを選ぶ',surface:'직육면체의 겉넓이',volume:'직육면체의 부피','volume-convert':'부피 単位を変える',
'fraction-div':'分数同士のわり算','whole-div-fraction':'整数を分数でわる','fraction-div-mixed':'帯分数のわり算','cube-view':'보는 방향과 모양','cube-missing':'가려진 쌓기나무','decimal-div':'小数同士のわり算',proportion:'等しい比と□','share-ratio':'比で分ける','ratio-simplify':'簡単な整数の比','circle-circumference':'円周','circle-area':'円の面積','circle-half':'半円の面積',cylinder:'원기둥의 구성',cone:'원뿔의 구성',sphere:'구의 성질','cylinder-net':'원기둥 전개도'
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
