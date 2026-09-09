(function(root){
'use strict';
const specs=[
['K','within5','Add and subtract within 5','K.OA.A.5','early',5],['K','within10','Add and subtract within 10','K.OA.A.2','early',10],['K','make10','Make ten','K.OA.A.4','bond',10],
[1,'within20','Add and subtract within 20','1.OA.C.6','early',20],[1,'add100','Add within 100','1.NBT.C.4','add100'],[1,'tens','Add and subtract multiples of ten','1.NBT.C.4;1.NBT.C.6','tens'],
[2,'facts20','Fluent facts within 20','2.OA.B.2','early',20],[2,'within100','Add and subtract within 100','2.NBT.B.5','early',100],[2,'within1000','Add and subtract within 1000','2.NBT.B.7','early',1000],[2,'fouradd','Add four two-digit numbers','2.NBT.B.6','fouradd'],
[3,'facts','Multiplication and division facts','3.OA.C.7','facts'],[3,'within1000','Add and subtract within 1000','3.NBT.A.2','early',1000],[3,'tensmul','Multiply by multiples of ten','3.NBT.A.3','tensmul'],
[4,'largeadd','Multi-digit addition and subtraction','4.NBT.B.4','early',1000000],[4,'mul4','Multiply up to four digits by one digit','4.NBT.B.5','mul',4,1],[4,'mul2','Multiply two two-digit numbers','4.NBT.B.5','mul',2,2],[4,'div1','Divide up to four digits by one digit','4.NBT.B.6','div',4,1],[4,'likefractions','Add and subtract like fractions','4.NF.B.3','like'],[4,'fractionwhole','Multiply a fraction by a whole number','4.NF.B.4','fractionwhole'],[4,'factors','Factors and multiples','4.OA.B.4','factors'],
[5,'mul','Multi-digit multiplication','5.NBT.B.5','mul',3,2],[5,'div','Divide with two-digit divisors','5.NBT.B.6','div',4,2],[5,'decimals','Decimal operations to hundredths','5.NBT.B.7','decimal',2],[5,'unlike','Add and subtract unlike fractions','5.NF.A.1','unlike'],[5,'fractionmul','Multiply fractions and mixed numbers','5.NF.B.4','fractionmul'],[5,'unitdivide','Divide with unit fractions','5.NF.B.7','unitdivide'],[5,'expressions','Parentheses and order of operations','5.OA.A.1','expressions'],
[6,'fractiondiv','Divide fractions by fractions','6.NS.A.1','fractiondiv'],[6,'longdiv','Multi-digit division','6.NS.B.2','div',5,2],[6,'decimals','Multi-digit decimal operations','6.NS.B.3','decimal',3],[6,'gcf','Greatest common factor','6.NS.B.4','gcf'],[6,'lcm','Least common multiple','6.NS.B.4','lcm']
];
const units=[],profiles=new Map(),W=root.Worksheets;let numbering={};
for(const [grade,id,name,standard,kind,a,b]of specs){const g=grade==='K'?0:grade;const u={id:'us-'+grade+'-'+id,grade:g,gradeLabel:grade==='K'?'Kindergarten':'Grade '+grade,number:(numbering[grade]=(numbering[grade]||0)+1),semester:1,name,standard,kind,a,b,drills:[]};units.push(u);
 const family=['like','unlike','fractionwhole','fractionmul','unitdivide','fractiondiv'].includes(kind)?'Fractions':kind==='decimal'?'Decimals':'Natural numbers';
 const variants=['fouradd','bond','factors','gcf','lcm','expressions'].includes(kind)?[['skill','horizontal','Practice']]:[['basic','horizontal','Horizontal practice'],['basic','vertical','Vertical practice'],['blank','horizontal','Missing numbers']];
 // Fractions use a horizontal layout so numerator and denominator stay aligned.
 for(const [mode,layout,label]of variants.filter(v=>family!=='Fractions'||v[1]!=='vertical')){const p={id:u.id+'-'+u.drills.length,title:name+' · '+label,group:mode==='blank'?'빈칸 응용':'기본 연산',mode,layout,unit:u.id,standard,skill:mode==='skill'?kind:undefined};u.drills.push(p);profiles.set(p.id,p);W.types.push({id:p.id,title:p.title,instruction:'Calculate.',example:'2 + 3',family,group:'Practice',config:{kind:'us-curriculum'}});}
}
root.USArithmetic={units,profiles};root.DrillCatalog={units,profiles};
function rows(p,seed,count){const u=units.find(x=>x.id===p.unit);let state=seed>>>0;const r=(min,max)=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return min+Math.floor(state/4294967296*(max-min+1))};const fraction=(n,d)=>W.fraction(n,d);const out=[];
for(let i=0;i<count;i++){let a,b,op,answer,prompt;const minus=i%2===1;
 switch(u.kind){
 case 'early':a=r(0,u.a);b=r(0,u.a-a);op=minus?'−':'+';if(minus)[a,b]=[a+b,b];break;
 case 'add100':a=r(10,90);b=r(0,Math.min(9,100-a));op='+';break;
 case 'tens':a=r(0,9)*10;b=r(0,9-a/10)*10;op=minus?'−':'+';if(minus)[a,b]=[a+b,b];break;
 case 'facts':b=r(1,10);a=r(0,10);op=minus?'÷':'×';if(minus)a*=b;break;
 case 'tensmul':a=r(1,9);b=r(1,9)*10;op='×';break;
 case 'mul':a=r(10**(u.a-1),10**u.a-1);b=r(10**(u.b-1),10**u.b-1);op='×';break;
 case 'div':b=r(u.b===1?2:10,10**u.b-1);a=r(10**(u.a-1),10**u.a-1);op='÷';answer=Math.floor(a/b)+(a%b?' R '+a%b:'');break;
 case 'decimal':{const scale=10**u.a;op=['+','−','×','÷'][i%4];a=r(1,20*scale);b=r(1,10*scale);if(op==='−'&&a<b)[a,b]=[b,a];if(op==='÷'){b=r(1,9);a=r(1,20*scale)*b;}a=(a/scale).toFixed(u.a);b=op==='÷'?b:(b/scale).toFixed(u.a);break;}
 case 'like':{const d=[2,3,4,5,6,8,10,12][r(0,7)];let n=r(1,d*2),m=r(1,d*2);if(minus&&n<m)[n,m]=[m,n];a=n+'/'+d;b=m+'/'+d;op=minus?'−':'+';break;}
 case 'unlike':{const d=r(2,12),e=r(2,11)+(r(0,1));a=r(1,d*3)+'/'+d;b=r(1,e*3)+'/'+e;op=minus?'−':'+';if(op==='−'&&W.exact(a,b,op)[0]<0)[a,b]=[b,a];break;}
 case 'fractionwhole':a=r(1,12)+'/'+r(2,12);b=r(1,9);op='×';break;
 case 'fractionmul':a=r(1,20)+'/'+r(2,12);b=r(1,20)+'/'+r(2,12);op='×';break;
 case 'unitdivide':a='1/'+r(2,12);b=r(1,12);op='÷';if(minus)[a,b]=[b,a];break;
 case 'fractiondiv':a=r(1,20)+'/'+r(2,12);b=r(1,20)+'/'+r(2,12);op='÷';break;
 case 'bond':a=r(1,9);prompt=a+' + □ = 10';answer=10-a;break;
 case 'fouradd':{const n=Array.from({length:4},()=>r(10,99));prompt=n.join(' + ')+' = ';answer=n.reduce((a,b)=>a+b,0);break;}
 case 'factors':{a=r(2,100);prompt='List all factors of '+a+'.';answer=Array.from({length:a},(_,j)=>j+1).filter(x=>a%x===0).join(', ');break;}
 case 'gcf':{a=r(1,100);b=r(1,100);prompt='Find the greatest common factor of '+a+' and '+b+'.';answer=DrillEngine.gcd(a,b);break;}
 case 'lcm':{a=r(1,12);b=r(1,12);prompt='Find the least common multiple of '+a+' and '+b+'.';answer=DrillEngine.lcm(a,b);break;}
 case 'expressions':{a=r(1,12);b=r(1,12);const c=r(2,9);prompt='('+a+' + '+b+') × '+c+' = ';answer=(a+b)*c;break;}
 default:throw Error('Unknown US topic '+u.kind);
 }
 if(prompt){out.push({prompt,answer:String(answer),work:''});continue;}
 if(answer===undefined){const [n,d]=W.exact(a,b,op);answer=u.kind==='decimal'?String(Number((n/d).toFixed(8))):fraction(n,d);}
 const q={a,b,op,answer,vertical:p.layout==='vertical'};if(p.mode==='blank')q.mask=op==='÷'&&String(answer).includes(' R ')||op==='×'&&(!Number(a)||!Number(b))?2:i%3;out.push(q);
}return out;}
// Keep the Korean four-group workflow, with prerequisite generators reused.
const reviewIds={'within10':'us-K-within5','make10':'us-K-within5','within20':'us-K-within10','add100':'us-1-within20','tens':'us-1-within20','facts20':'us-1-within20','within100':'us-1-add100','within1000':'us-2-within100','fouradd':'us-2-within100','facts':'us-2-facts20','tensmul':'us-3-facts','largeadd':'us-3-within1000','mul4':'us-3-facts','mul2':'us-4-mul4','div1':'us-3-facts','likefractions':'us-3-facts','fractionwhole':'us-4-likefractions','factors':'us-3-facts','mul':'us-4-mul2','div':'us-4-div1','decimals':'us-4-largeadd','unlike':'us-4-likefractions','fractionmul':'us-4-fractionwhole','unitdivide':'us-3-facts','expressions':'us-3-facts','fractiondiv':'us-5-unitdivide','longdiv':'us-5-div','gcf':'us-4-factors','lcm':'us-4-factors'};
function register(u,p){u.drills.push(p);profiles.set(p.id,p);const base=W.types.find(t=>t.id===p.typeSource)||W.types.find(t=>t.id===u.drills[0].id);W.types.push({...base,id:p.id,title:p.title});}
for(const u of units){const key=u.id.split('-').slice(2).join('-'),previous=units.find(x=>x.id===reviewIds[key])||u;const source=previous.drills[0];register(u,{...source,id:u.id+'-review',unit:u.id,generatorUnit:previous.id,typeSource:source.id,group:'기초 보충',title:'Review: '+previous.name});
 if(!u.drills.some(p=>p.group==='빈칸 응용'))register(u,{...u.drills[0],id:u.id+'-challenge',group:'빈칸 응용',challenge:true,title:u.name+' · complete the missing part'});
 register(u,{...u.drills[0],id:u.id+'-story',mode:'story',layout:'horizontal',group:'문장 연습',story:true,title:u.name+' · word problems'});
 u.drills.sort((a,b)=>['기본 연산','기초 보충','빈칸 응용','문장 연습'].indexOf(a.group)-['기본 연산','기초 보충','빈칸 응용','문장 연습'].indexOf(b.group));}
const baseRows=rows;rows=function(p,seed,count){const generator=units.find(u=>u.id===(p.generatorUnit||p.unit)),original=baseRows({...p,unit:generator.id},seed,count);return original.map(q=>{
 if(p.challenge){if(generator.kind==='bond')return {...q,prompt:'□ + '+(10-Number(q.answer))+' = 10'};if(generator.kind==='fouradd'){const nums=q.prompt.match(/\d+/g).map(Number);return {prompt:nums.slice(0,3).join(' + ')+' + □ = '+q.answer,answer:String(nums[3]),work:''};}if(generator.kind==='expressions'){const nums=q.prompt.match(/\d+/g).map(Number);return {prompt:'('+nums[0]+' + □) × '+nums[2]+' = '+q.answer,answer:String(nums[1]),work:''};}const nums=q.prompt.match(/\d+/g).map(Number);if(generator.kind==='factors'){const factors=q.answer.split(', '),at=Math.floor(factors.length/2),answer=factors[at];factors[at]='□';return {prompt:'Complete the factors of '+nums[0]+': '+factors.join(', '),answer,work:''};}return {...q,prompt:q.prompt.replace('Find the ','Complete: ').replace('.',' = □')};}
 if(!p.story)return q;
 if(q.op){const a=q.a,b=q.b,answer=String(q.answer);if(generator.grade<=3){const prompt=q.op==='+'?'You have '+a+' counters and get '+b+' more. How many counters do you have now?':q.op==='−'?'You have '+a+' counters and give away '+b+'. How many counters remain?':q.op==='×'?'There are '+a+' boxes with '+b+' counters in each. How many counters are there altogether?':'Share '+a+' counters equally among '+b+' children. How many counters does each child get?';return {prompt,answer,work:a+' '+q.op+' '+b+' = '+answer};}const prompt=q.op==='+'?'A ribbon is '+a+' metres long. Another '+b+' metres is added. How long is it now?':q.op==='−'?'A ribbon is '+a+' metres long. '+b+' metres is cut off. How much remains?':q.op==='×'?'A rectangle is '+a+' metres long and '+b+' metres wide. What is its area in square metres?':answer.includes(' R ')?'Pack '+a+' counters into groups of '+b+'. How many full groups and how many counters remain?':'A ribbon is '+a+' metres long. Each piece is '+b+' metres long. How many pieces can be made?';return {prompt,answer,work:String(a)+' '+q.op+' '+b+' = '+answer};}
 const nums=q.prompt.match(/\d+/g).map(Number);if(generator.kind==='bond')return {...q,prompt:'You need 10 counters. You have '+nums[0]+'. How many more do you need?'};if(generator.kind==='fouradd')return {...q,prompt:'Four boxes hold '+nums.slice(0,4).join(', ')+' counters. How many counters are there altogether?'};if(generator.kind==='factors')return {...q,prompt:'Arrange '+nums[0]+' counters into equal rows with none left. List every possible number of counters in a row.'};if(generator.kind==='gcf')return {...q,prompt:'Share '+nums[0]+' red counters and '+nums[1]+' blue counters into identical bags with none left. What is the greatest number of bags?'};if(generator.kind==='lcm')return {...q,prompt:'Two lights flash together now, then every '+nums[0]+' and '+nums[1]+' seconds. In how many seconds will they first flash together again?'};return {...q,prompt:'Each box contains '+nums[0]+' red and '+nums[1]+' blue counters. How many counters are in '+nums[2]+' boxes?'};
});};
const original=W.generate;W.generate=(id,seed,count=24)=>profiles.has(id)?rows(profiles.get(id),seed,count):original(id,seed,count);root.USArithmetic.rows=rows;
})(globalThis);
