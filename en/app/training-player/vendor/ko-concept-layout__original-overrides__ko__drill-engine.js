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
if(p.same){const [n,d]=W.rational(q.a),[m,e]=W.rational(q.b);if(d!==1&&e!==1){const rem=Math.max(1,Math.round((m%e)/e*(d-1))),whole=Math.floor(m/e);q.b=String(q.b).includes(' ')?whole+' '+rem+'/'+d:(whole*d+rem)+'/'+d;}if(q.op==='−'&&val(q.a)<val(q.b))[q.a,q.b]=[q.b,q.a];const[nn,dd]=W.exact(q.a,q.b,q.op);const common=Math.max(W.rational(q.a)[1],W.rational(q.b)[1]),num=Math.round(nn/dd*common),whole=Math.floor(num/common),rem=num%common;q.answer=rem?(whole?whole+' ':'')+rem+'/'+common:String(whole);}
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
function story(q,index,r,grade,p={}){
 const a=q.a,b=q.b;let c=q.answer;
 const decimal=String(p.source).includes('decimal')||p.decimalPlaces;
 if(decimal){const[n,d]=W.exact(a,b,q.op);c=String(Number((n/d).toFixed(6)));}
 if(q.op==='÷'&&String(c).includes(' R ')){const[quot,rem]=String(c).split(' R ');return{prompt:`${a}개를 한 묶음에 ${b}개씩 묶습니다. 몇 묶음이고 몇 개가 남나요?`,answer:`${quot}묶음, ${rem}개`,work:`${a} ÷ ${b} = ${quot} 나머지 ${rem}`};}
 let prompt;
 if(grade<=2){const prompt=q.op==='+'?`상자에 공이 ${a}개 있습니다. ${b}개를 더 넣으면 모두 몇 개인가요?`:q.op==='−'?`공 ${a}개 중 ${b}개를 꺼냈습니다. 몇 개가 남았나요?`:q.op==='×'?`한 상자에 공이 ${a}개씩 있습니다. ${b}상자에는 공이 모두 몇 개인가요?`:`공 ${a}개를 ${b}명에게 똑같이 나누면 한 명이 몇 개를 받나요?`;return{prompt,answer:String(c),work:`${a} ${q.op} ${b} = ${c}`};}
 if(q.op==='+')prompt=index%2?`길이가 ${a} m인 리본과 ${b} m인 리본을 이었습니다. 전체 길이는 몇 m인가요?`:`${a}보다 ${b} 큰 수는 얼마인가요?`;
 else if(q.op==='−')prompt=index%2?`길이가 ${a} m인 리본에서 ${b} m를 잘랐습니다. 남은 길이는 몇 m인가요?`:`${a}와 ${b}의 차는 얼마인가요?`;
 else if(q.op==='×')prompt=index%2?`${a}의 ${b}배에 해당하는 수를 구하세요.`:`한 조각의 길이가 ${a} m인 리본의 ${b}배에 해당하는 길이는 몇 m인가요?`;
 else if(Number.isInteger(Number(b))&&Number(b)>0)prompt=`길이가 ${a} m인 리본을 ${b}명이 똑같이 나누어 가집니다. 한 명이 받는 리본은 몇 m인가요?`;
 else prompt=`길이가 ${a} m인 리본은 한 조각의 길이가 ${b} m인 리본의 몇 조각 분량인가요?`;
 return {prompt,answer:String(c),work:`${a} ${q.op} ${b} = ${c}`};
}
function rows(p,seed,count=20){const r=random(seed),out=[],grade=+p.id[0],seen=new Set();let tries=0;
const slots=Array.from({length:count},(_,i)=>i);for(let i=slots.length-1;i>0;i--){const j=r(0,i);[slots[i],slots[j]]=[slots[j],slots[i]];}
while(out.length<count){if(++tries>12000)throw Error('Question pool exhausted '+p.id);let q;
if(p.mode==='skill')q=skill(p.skill,r);
else if(p.mode==='story'){const pool=p.pool;const s=pool[slots[out.length]%pool.length];q=one({...s.extra,source:s.source,layout:'horizontal'},r,tries);if(!q)continue;q=story(q,slots[out.length],r,grade,s);}
else{q=one({...p.sourceExtra,...p},r,tries);if(!q)continue;if(p.mode==='blank')q.mask=q.op==='÷'&&String(q.answer).includes(' R ')?2:slots[out.length]%3;if(p.mode==='digit'){// Mask one operand digit; a visible result and other operand guarantee uniqueness.
if(q.op==='×'&&(!Number(q.a)||!Number(q.b)))continue;const which=q.op==='÷'?0:r(0,2),value=String(which===2?q.answer:which===1?q.b:q.a),positions=[r(0,value.length-1)];if(value.length>1&&r(0,1)){let second=r(0,value.length-2);if(second>=positions[0])second++;positions.push(second);}q.digits={which,positions};}}
const signature=JSON.stringify(q);if(seen.has(signature)&&tries<1000)continue;seen.add(signature);out.push(q);}
return out;}
W.generate=function(id,seed,count){const p=DrillCatalog.profiles.get(id);return p?rows(p,seed,count):baseGenerate(id,seed,count);};
root.DrillEngine={rows,random,gcd,lcm,skill};
})(globalThis);
