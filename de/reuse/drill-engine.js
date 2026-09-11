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
case 'groups':return {...out('Observe les groupes. Écris la multiplication et le total.',`${a} × ${b} = ${a*b}`),groups:[a,b]};
case 'factor':return out(`${x}の約数を全て書きましょう.`,factors(x).join(', '));
case 'multiple':return out(`${a}の倍数を小さい順に 5個書きましょう.`,Array.from({length:5},(_,i)=>a*(i+1)).join(', '));
case 'common-factor':return out(`${x}と ${y}の公約数を全て書きましょう.`,factors(gcd(x,y)).join(', '));
case 'common-multiple':return out(`${a}と ${b}の公倍数を小さい順に 3個書きましょう.`,[1,2,3].map(k=>lcm(a,b)*k).join(', '));
case 'gcd':return out(`${x}と ${y}の最大公約数を求めましょう.`,gcd(x,y));
case 'lcm':return out(`${a}と ${b}の最小公倍数を求めましょう.`,lcm(a,b));
case 'reduce':return out(`${n*g}/${d*g}を約分しましょう.`,f(n,d));
case 'common':{const z=lcm(a,b);return out(`1/${a}と 1/${b}を最小の共通分母で通分しましょう.`,`${z/a}/${z}, ${z/b}/${z}`);}
case 'compare-fraction':{const z=lcm(a,b);return out(`1/${a} □ 1/${b}  (>, <, =)`,a<b?'>':a>b?'<':'=',`${z/a}/${z}, ${z/b}/${z}`);}
case 'improper':{const nn=a*d+n;return out(`Décompose ${nn}/${d} en un entier et une fraction inférieure à 1.`,`${a}と ${n}/${d}`);}
case 'mixed':return out(`Écris ${a} + ${n}/${d} sous forme d’une seule fraction.`,`${a*d+n}/${d}`);
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
[`Welche Zahl ist um ${b} größer als ${a}?`,c,`${a} + ${b} = ${c}`],
[`Wie viel musst du zu ${a} addieren, um ${c} zu erhalten?`,b,`${c} − ${a} = ${b}`],
[`Wie groß ist der Unterschied zwischen ${c} und ${b}?`,a,`${c} − ${b} = ${a}`],
[`Zwei Mengen ergeben zusammen ${c}. Eine Menge ist ${a}. Wie groß ist die andere?`,b,`${c} − ${a} = ${b}`],
[`Zu ${a} wird eine Zahl addiert. Das Ergebnis ist ${c}. Welche Zahl ist es?`,b,`${c} − ${a} = ${b}`],
[`Eine Menge von ${a} wird um ${b} größer. Wie groß ist sie danach?`,c,`${a} + ${b} = ${c}`]];[prompt,answer,work]=items[form];}
else{if(q.op==='÷'){if(String(q.answer).includes(' R ')){const [quot,rem]=String(q.answer).split(' R ');return {prompt:`On répartit ${a} objets en groupes de ${b}. Combien de groupes complets et combien d’objets restants ?`,answer:`${quot} groupes, ${rem} objets restants`,work:`${a} ÷ ${b} = ${q.answer.replace(' R ',' reste ')}`};}[a,b,c]=[q.b,c,q.a];}
const fractional=String(a).includes('/')||String(b).includes('/');const allowInverse=grade>=6||!fractional&&grade>=3;const forms=allowInverse?4:2;const k=index%forms;
if(k===0){prompt=`Une quantité de ${a} est multipliée par ${b}. Quelle quantité obtient-on ?`;answer=c;work=`${a} × ${b} = ${c}`;}
else if(k===1){prompt=`Calcule ${b} fois ${a}.`;answer=c;work=`${a} × ${b} = ${c}`;}
else if(k===2){prompt=`Trouve le nombre qui, multiplié par ${a}, donne ${c}.`;answer=b;work=`${c} ÷ ${a} = ${b}`;}
else {prompt=`Quel nombre multiplié par ${b} donne ${c} ?`;answer=a;work=`${c} ÷ ${b} = ${a}`;}}
return {prompt,answer:String(answer),work};}
function rows(p,seed,count=20){const r=random(seed),out=[],grade=p.grade||+p.id[0],seen=new Set();let tries=0;
const slots=Array.from({length:count},(_,i)=>i);for(let i=slots.length-1;i>0;i--){const j=r(0,i);[slots[i],slots[j]]=[slots[j],slots[i]];}
while(out.length<count){if(++tries>12000)throw Error('Question pool exhausted '+p.id);let q;
if(p.mode==='skill')q=skill(p.skill,r);
else if(p.mode==='story'){let pool=p.pool;if((grade<3||grade===5)&&pool.every(x=>['×','÷'].includes(W.types.find(t=>t.id===x.source)?.config?.op)||x.source==='multiply-one')){const decimal=W.types.find(t=>t.id===pool[0].source)?.family==='Decimals';pool=pool.concat([{source:grade===5?(decimal?'decimal-add-1':'fraction-add-different'):'add-small'},{source:grade===5?(decimal?'decimal-sub-1':'fraction-sub-different'):'subtract-small'}]);}const s=pool[slots[out.length]%pool.length];q=one({...s.extra,source:s.source,layout:'horizontal'},r,tries);if(!q)continue;q=story(q,slots[out.length],r,grade);if(W.types.find(t=>t.id===s.source)?.family==='Decimals'){for(const key of ['prompt','answer','work'])if(typeof q[key]==='string')q[key]=q[key].replace(/(\d+)\/(\d+)/g,(match,n,d)=>{let den=Number(d);while(den%2===0)den/=2;while(den%5===0)den/=5;return den===1?String(Number((Number(n)/Number(d)).toFixed(8))):match;});}}
else{q=one({...p.sourceExtra,...p},r,tries);if(!q)continue;if(p.mode==='blank')q.mask=q.op==='÷'&&String(q.answer).includes(' R ')?2:slots[out.length]%3;if(p.mode==='digit'){// Mask one operand digit; a visible result and other operand guarantee uniqueness.
if(q.op==='×'&&(!Number(q.a)||!Number(q.b)))continue;const which=q.op==='÷'?0:r(0,2),value=String(which===2?q.answer:which===1?q.b:q.a),positions=[r(0,value.length-1)];if(value.length>1&&r(0,1)){let second=r(0,value.length-2);if(second>=positions[0])second++;positions.push(second);}q.digits={which,positions};}}
const signature=JSON.stringify(q);if(seen.has(signature)&&tries<1000)continue;seen.add(signature);out.push(q);}
return out;}
W.generate=function(id,seed,count){const p=DrillCatalog.profiles.get(id);return p?rows(p,seed,count):baseGenerate(id,seed,count);};
root.DrillEngine={rows,random,gcd,lcm,skill};
})(globalThis);
