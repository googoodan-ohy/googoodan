(function(root){
const types = [
 ['add-small','Addition','7 + 5','Addition within 20','Add the numbers.'],
 ['add-two','Addition','23 + 14','Two-digit addition · no regrouping','Add the numbers.'],
 ['add-carry','Addition','27 + 18','Two-digit addition · regrouping','Add the numbers.'],
 ['subtract-small','Subtraction','9 − 4','Subtraction within 10','Subtract the numbers.'],
 ['subtract-two','Subtraction','58 − 23','Two-digit subtraction · no regrouping','Subtract the numbers.'],
 ['subtract-borrow','Subtraction','52 − 18','Two-digit subtraction · regrouping','Subtract the numbers.'],
 ['multiply-one','Multiplication','6 × 7','One digit × one digit','Multiply the numbers.'],
 ['multiply-two-one','Multiplication','23 × 4','Two digits × one digit','Multiply the numbers.'],
 ['multiply-two','Multiplication','23 × 14','Two digits × two digits','Multiply the numbers.'],
 ['divide','Division','24 ÷ 6','Division · no remainders','Divide the numbers.'],
 ['missing','Number sense','5 + □ = 9','Find the missing number','Write the missing number in each box.'],
 ['compare','Number sense','14 □ 19','Compare numbers','Write <, >, or = in each box.']
].map(([id,group,example,title,instruction])=>({id,group,example,title,instruction}));
types.forEach(t=>t.family='Natural numbers');
const operations=[['add','Addition','+'],['sub','Subtraction','−'],['mul','Multiplication','×'],['div','Division','÷']];
types.push({id:'compare-ten',family:'Natural numbers',group:'Number sense',example:'4 □ 7',title:'Compare numbers within 10',instruction:'Write <, >, or = in each box.'});
for(const [code,group,op] of operations){
 for(const [da,db] of [[1,1],[1,2],[2,1],[2,2],[3,1],[3,2],[3,3],[1,3],[2,3],[4,1],[4,2],[4,3],[4,4]]){
 if((code==='sub'||code==='div')&&da<db)continue;
 const a=da===1?6:da===2?24:da===3?248:1248,b=db===1?3:db===2?12:db===3?124:1124;
 types.push({id:`natural-${code}-${da}-${db}`,family:'Natural numbers',group,example:`${a} ${op} ${b}`,title:`${da} digit${da>1?'s':''} ${op} ${db} digit${db>1?'s':''}`,instruction:code==='div'?'Divide. Write a remainder if needed.':'Calculate each answer.',config:{kind:'natural',code,op,da,db}});
 }
 for(const dp of [1,2])types.push({id:`decimal-${code}-${dp}`,family:'Decimals',group,example:`${dp===1?'2.4':'2.45'} ${op} ${dp===1?'1.2':'1.25'}`,title:`${group} · ${dp} decimal place${dp>1?'s':''}`,instruction:'Calculate each answer.',config:{kind:'decimal',code,op,dp}});
 for(const same of [true,false])types.push({id:`fraction-${code}-${same?'same':'different'}`,family:'Fractions',group,example:`1/3 ${op} ${same?'2/3':'1/4'}`,title:`${group} · ${same?'same':'different'} denominators`,instruction:'Calculate. Write your answer as a fraction in simplest form.',config:{kind:'fraction',code,op,same}});
}
const gcd=(a,b)=>b?gcd(b,a%b):a;
const fraction=(n,d)=>{const g=gcd(Math.abs(n),d);return d/g===1?String(n/g):`${n/g}/${d/g}`;};
const rational=text=>{const s=String(text);if(s.includes(' ')){const [w,f]=s.split(' '),[n,d]=f.split('/').map(Number);return [Number(w)*d+n,d];}if(s.includes('/'))return s.split('/').map(Number);const places=(s.split('.')[1]||'').length,d=10**places;return [Math.round(Number(s)*d),d];};
function exact(a,b,op){const [n,d]=rational(a),[m,e]=rational(b);return op==='+'?[n*e+m*d,d*e]:op==='−'?[n*e-m*d,d*e]:op==='×'?[n*m,d*e]:[n*e,d*m];}
const forms=['whole','proper','improper','mixed'];
const samples={whole:'3',proper:'2/5',improper:'7/4',mixed:'2 1/3'};
for(const [code,group,op] of operations){
 for(const da of [0,1,2])for(const db of [0,1,2]){
 if(da===0&&db===0||da===db)continue;
 const a=da===0?'3':da===1?'3.6':'3.75',b=db===0?(code==='div'&&da===2?'3':'2'):db===1?(code==='div'&&da===2?'1.5':'1.2'):'0.25';
 types.push({id:`decimal-${code}-${da}dp-${db}dp`,family:'Decimals',group,example:`${a} ${op} ${b}`,title:`${da?da+' decimal place'+(da>1?'s':''):'Whole number'} ${op} ${db?db+' decimal place'+(db>1?'s':''):'whole number'}`,instruction:code==='div'?'Divide exactly. Answers end within two decimal places.':'Calculate each answer.',config:{kind:'decimal-pair',code,op,da,db}});
 }
 for(const fa of forms)for(const fb of forms){
 if(fa==='whole'&&fb==='whole'||fa==='proper'&&fb==='proper')continue;
 if(code==='sub'&&fa==='proper'&&fb!=='proper')continue;
 const a=samples[fa],b=samples[fb];
 types.push({id:`fraction-${code}-${fa}-${fb}`,family:'Fractions',group,example:`${a} ${op} ${b}`,exampleA:a,exampleB:b,title:`${fa==='whole'?'Whole number':fa+' fraction'} ${op} ${fb==='whole'?'whole number':fb+' fraction'}`,instruction:'Calculate. Write your answer as a fraction in simplest form.',config:{kind:'fraction-pair',code,op,fa,fb}});
 }
 types.push({id:`integer-${code}`,family:'Integers',group,example:`-6 ${op} 3`,title:`${group} with negative numbers`,instruction:'Calculate with positive and negative integers.',config:{kind:'integer',code,op}});
}
function generate(id,seed,count=20){
 let state=seed>>>0;
 const rand=(lo,hi)=>{state+=0x6D2B79F5;let t=state;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return lo+Math.floor(((t^t>>>14)>>>0)/4294967296*(hi-lo+1));};
 const rows=[],seen=new Set();
 let attempts=0;
 while(rows.length<count){
 if(++attempts>100000)throw Error('Insufficient question pool: '+id);
 const config=types.find(t=>t.id===id)?.config;
 if(config){
 let a,b,answer,raw;const {kind,code,op}=config;
 if(kind==='natural'){
 a=rand(10**(config.da-1),10**config.da-1);b=rand(10**(config.db-1),10**config.db-1);
 if((code==='sub'||code==='div')&&a<b)continue;
 answer=code==='add'?a+b:code==='sub'?a-b:code==='mul'?a*b:Math.floor(a/b)+(a%b?` R ${a%b}`:'');
 }else if(kind==='integer'){
 a=rand(-20,20);b=rand(-20,20);if(!b)continue;
 if(code==='div')a=b*rand(-12,12);
 answer=code==='add'?a+b:code==='sub'?a-b:code==='mul'?a*b:a/b;
 }else if(kind==='decimal'||kind==='decimal-pair'){
 const da=config.dp??config.da,db=config.dp??config.db,sa=10**da,sb=10**db;
 const x=rand(1,20*sa),y=rand(1,10*sb);
 // A decimal operand must actually have a non-zero last decimal digit.
 if(da&&x%10===0||db&&y%10===0)continue;
 if(code==='sub'&&x*sb<y*sa)continue;
 a=(x/sa).toFixed(da);b=(y/sb).toFixed(db);
 const [n,d]=exact(a,b,op);
 // Integer arithmetic guarantees termination at hundredths, without rounding.
 if(code==='div'&&(n*100)%d!==0)continue;
 answer=String(Number((n/d).toFixed(4)));
 }else if(kind==='fraction-pair'){
 const operand=form=>{const den=rand(2,12),num=rand(1,den-1),whole=rand(1,9);return form==='whole'?String(whole):form==='proper'?`${num}/${den}`:form==='improper'?`${den*whole+num}/${den}`:`${whole} ${num}/${den}`;};
 a=operand(config.fa);b=operand(config.fb);const [n,d]=exact(a,b,op);if(code==='sub'&&n<0)continue;answer=fraction(n,d);
 }else{
 let d=rand(2,12),e=config.same?d:rand(2,12);if(!config.same&&d===e)continue;
 let n=rand(1,d-1),m=rand(1,e-1);if(code==='sub'&&n*e<m*d){[n,m]=[m,n];[d,e]=[e,d];}
 a=`${n}/${d}`;b=`${m}/${e}`;
 answer=code==='add'?fraction(n*e+m*d,d*e):code==='sub'?fraction(n*e-m*d,d*e):code==='mul'?fraction(n*m,d*e):fraction(n*e,d*m);
 }
 raw=`${a}:${b}`;if(seen.has(raw))continue;seen.add(raw);
 rows.push({a,b,op,answer,vertical:kind==='natural',fraction:kind==='fraction'||kind==='fraction-pair'});continue;
 }
 let a,b,op,answer,vertical=false;
 switch(id){
 case 'add-small': a=rand(1,19);b=rand(1,20-a);op='+';break;
 case 'add-two': a=rand(10,79);b=rand(1,8-Math.floor(a/10))*10+rand(0,9-a%10);op='+';vertical=true;break;
 case 'add-carry': a=rand(1,8)*10+rand(1,9);b=rand(10,99);if(a%10+b%10<10)continue;op='+';vertical=true;break;
 case 'subtract-small': a=rand(1,10);b=rand(0,a);op='−';break;
 case 'subtract-two': a=rand(20,99);b=rand(1,Math.floor(a/10)-1)*10+rand(0,a%10);op='−';vertical=true;break;
 case 'subtract-borrow': a=rand(2,9)*10+rand(0,8);b=rand(1,Math.floor(a/10)-1)*10+rand(a%10+1,9);op='−';vertical=true;break;
 case 'multiply-one':a=rand(2,9);b=rand(2,9);op='×';break;
 case 'multiply-two-one':a=rand(10,99);b=rand(2,9);op='×';vertical=true;break;
 case 'multiply-two':a=rand(10,99);b=rand(10,99);op='×';vertical=true;break;
 case 'divide':b=rand(2,9);a=b*rand(1,12);op='÷';break;
 case 'missing':a=rand(0,19);b=rand(0,20-a);op='missing';break;
 case 'compare-ten':a=rand(1,10);b=rows.length%5===0?a:rand(1,10);op='compare';break;
 case 'compare':a=rand(0,99);b=rows.length%5===0?a:rand(0,99);op='compare';break;
 default:throw Error('Unknown worksheet');
 }
 answer=op==='+'?a+b:op==='−'?a-b:op==='×'?a*b:op==='÷'?a/b:op==='missing'?b:a<b?'<':a>b?'>':'=';
 const key=a+':'+b;if(seen.has(key))continue;seen.add(key);rows.push({a,b,op,answer,vertical});
 }return rows;
}
for(const [id,title,bankId] of [['bar-graph','Bar Graph','2-2-5'],['picture-graph','Picture Graph','3-2-6'],['line-graph','Line Graph','4-2-5']])types.push({id,title:title+' Worksheets',family:'Data',group:'Data',example:'2 + 3',instruction:'Read the data, complete the graph and explain your answer.',bankId});
types.push({id:'word-problems',title:'Math Word Problems Worksheets',family:'Stories',group:'Stories',example:'2 + 3',instruction:'Read carefully. Write an equation and explain your answer.',bankId:'1-2-6'});
types.push({id:'transformations',title:'Geometry Transformations Worksheets - Slides, Flips and Turns',family:'Geometry',group:'Geometry',example:'2 + 3',instruction:'Use the grid to slide, flip or turn each shape.',bankId:'4-1-4'});
types.push({"id":"average","title":"Mean and Average Worksheets","family":"Reasoning","group":"Reasoning","example":"2 + 3","instruction":"Show your work and explain your answer.","bankId":"5-2-6"});
types.push({"id":"ratio","title":"Ratio and Proportion Worksheets","family":"Reasoning","group":"Reasoning","example":"2 + 3","instruction":"Show your work and explain your answer.","bankId":"6-1-4"});
root.Worksheets={types,generate,rational,exact,fraction};
if(typeof module!=='undefined')module.exports=root.Worksheets;
})(globalThis);

