(function(root){
const base=root.KoMath,banks={};let excluded=[];
const add=(id,name,op,digits,target)=>{(banks[id]??=[]).push({name,op,digits,target,activities:['계산 과정을 살펴요','가려진 수를 찾아요','계산을 검토해요'].map((title,i)=>({title,method:['calculate','inverse','diagnose'][i]}))});};
for(const [id,d] of [['2-1-3',2],['3-1-1',3]])for(const op of ['+','−'])for(let k=0;k<=(op==='−'?d-1:d);k++)add(id,(op==='+'?'받아올림':'받아내림')+(k===0?' 없이':k+'번')+' 계산하기',op,d,k);
for(const [id,d] of [['3-1-4',2],['3-2-1',3]])for(let k=0;k<=d;k++)add(id,'한 자리 수 곱하기 · 받아올림 '+k+'번','×',d,k);
for(const id of ['3-2-3','4-1-3'])for(const digits of [2,3])for(const remainder of [false,true])add(id,digits+'자리 ÷ '+(id==='4-1-3'?2:1)+'자리 · '+(remainder?'나머지가 있는 경우':'나누어떨어지는 경우'),'÷',digits,{divisorDigits:id==='4-1-3'?2:1,remainder});
function carries(a,b,op){let c=0,n=0;while(a||b){let x=a%10,y=b%10;if(op==='+'){c=x+y+c>=10?1:0}else{c=x-c<y?1:0}n+=c;a=Math.floor(a/10);b=Math.floor(b/10)}return n}
function mulCarries(a,b){let carry=0,n=0;while(a){let t=a%10*b+carry;carry=Math.floor(t/10);if(carry)n++;a=Math.floor(a/10)}return n}
function generate(id,p,seed,n=8){const offset=base.profiles(id).length;if(!banks[id]||p<offset)return base.generate(id,p,seed,n);const spec=banks[id][p-offset],art=KoArt.session(seed,excluded);let state=seed>>>0;const r=(lo,hi)=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return lo+Math.floor(state/4294967296*(hi-lo+1))};
return spec.activities.map((s,section)=>({title:s.title,skill:s.method,questions:Array.from({length:n},()=>{let a,b,value,rem=0,tries=0;const lo=10**(spec.digits-1),hi=10**spec.digits-1;
if(spec.op==='÷'){b=r(spec.target.divisorDigits===2?11:2,spec.target.divisorDigits===2?39:9);const min=Math.max(1,Math.ceil(lo/b)),max=Math.floor((hi-(spec.target.remainder?b-1:0))/b);value=r(min,max);rem=spec.target.remainder?r(1,b-1):0;a=b*value+rem}
else do{a=r(lo,hi);b=spec.op==='×'?r(2,9):r(lo,hi);if(spec.op==='−'&&a<b)[a,b]=[b,a];value=spec.op==='+'?a+b:spec.op==='−'?a-b:a*b;if(++tries>20000)throw Error('constraint '+JSON.stringify(spec));}while((spec.op==='×'?mulCarries(a,b):carries(a,b,spec.op))!==spec.target);
const asset=art.take();let prompt,task,answer,reason;const equation=a+' '+spec.op+' '+b,result=spec.op==='÷'?value+(rem?' 나머지 '+rem:''):String(value);
if(section===0){prompt='계산하고 풀이 과정을 쓰세요.';task='<div class="kequation">'+equation+' = □</div><div class="calculation-space"></div>';answer=result;reason=spec.op==='÷'?b+' × '+value+' + '+rem+' = '+a:spec.op==='×'?'각 자리에서 곱한 수를 자리에 맞추어 더합니다.':(spec.op==='+'?'받아올림':'받아내림')+' '+spec.target+'번을 확인합니다.'}
if(section===1){prompt=spec.op==='÷'?'□에 알맞은 나누어지는 수를 구하세요.':'□에 알맞은 수를 구하고 원래 식에 넣어 확인하세요.';task='<div class="kequation">□ '+spec.op+' '+b+' = '+result+'</div><div class="calculation-space"></div>';answer=String(a);reason=spec.op==='+'?value+' − '+b+' = '+a:spec.op==='−'?value+' + '+b+' = '+a:b+' × '+value+' + '+rem+' = '+a;if(spec.op==='×')reason=a+' × '+b+' = '+value}
if(section===2){const correct=r(0,1)===1,bad=value+(spec.op==='÷'?1:10**r(0,spec.digits-1));prompt='친구의 계산이 맞으면 ○, 틀리면 × 하고 고치세요.';task='<div class="kequation">'+equation+' = '+(correct?value:bad)+(rem?' 나머지 '+rem:'')+'</div><div class="calculation-space"></div>';answer=(correct?'○':'×, '+result);reason='검산: '+(spec.op==='÷'?b+' × '+value+' + '+rem+' = '+a:equation+' = '+value)}
return {methodId:spec.name+'-'+s.method,artId:asset.id,prompt,visual:'<span class="picture-badge">'+KoArt.icon(asset)+'</span>',task,answer,reason,check:{kind:'arithmetic-target',a,b,value,rem,op:spec.op,target:spec.target}};
})}));}
root.KoMath={...base,profiles:id=>base.profiles(id).concat(banks[id]||[]),generate,excludeArt:ids=>{excluded=ids;base.excludeArt(ids)}};
})(globalThis);
