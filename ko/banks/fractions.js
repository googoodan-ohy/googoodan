(function(root){
const profiles=[
 {name:'약분과 같은 크기의 분수',activities:[['divisors','이전에 배운 개념 · 공약수'],['reduce','기약분수로 약분하기'],['equivalent','같은 크기의 분수 이어 쓰기']]},
 {name:'통분과 크기 비교',activities:[['multiples','이전에 배운 개념 · 공배수'],['common','가장 작은 공통분모 찾기'],['order','분수를 크기순으로 놓기']]},
 {name:'조건에 맞는 분수 찾기',activities:[['count','기약분수인 진분수 찾기'],['bound','분모의 범위를 만족시키기'],['between','두 분수 사이의 분수 찾기']]},
 {name:'분수 탐구 · 거꾸로 생각하기',activities:[['change','같은 크기를 유지하며 바꾸기'],['sum','분자와 분모의 합으로 찾기'],['reverse','바뀌기 전 분수 찾기']]}
].map(x=>({...x,activities:x.activities.map(([method,title])=>({method,title}))}));
function generate(p,seed,n,excluded){
 let state=seed>>>0;const r=k=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return Math.floor(state/4294967296*k)},pick=xs=>xs[r(xs.length)];
 const gcd=(a,b)=>b?gcd(b,a%b):a,F=(a,b)=>'<span class="kf"><span>'+a+'</span><span>'+b+'</span></span>',eq=x=>'<div class="kequation">'+x+'</div>',session=KoArt.session(seed,excluded);
 return profiles[p].activities.map(s=>({title:s.title,skill:s.method,questions:Array.from({length:n},()=>{
  const d=pick([3,4,5,6,7,8,9]),eligible=Array.from({length:d-1},(_,i)=>i+1).filter(x=>gcd(x,d)===1),a=pick(eligible),k=2+r(4),asset=session.take();
  let prompt='',visual='',task='<span class="kblank"></span>',answer='',reason='',check={kind:'fraction-bank',method:s.method,a,d,k};
  if(s.method==='divisors'){const x=a*k,y=d*k,common=Array.from({length:k},(_,i)=>i+1).filter(v=>x%v===0&&y%v===0);prompt=x+'와 '+y+'의 공약수를 모두 쓰세요.';answer=common.join(', ');reason='두 수를 모두 나누어떨어지게 하는 수를 찾습니다.'}
  if(s.method==='reduce'){prompt='분자와 분모를 같은 수로 나누어 기약분수로 만드세요.';visual=eq(F(a*k,d*k)+' = '+F('□','□'));answer=a+'/'+d;reason='분자와 분모를 최대공약수 '+k+'로 나눕니다.'}
  if(s.method==='equivalent'){prompt='분모를 보고 같은 크기의 분수가 되도록 분자를 쓰세요.';visual=eq(F(a,d)+' = '+F('□',d*2)+' = '+F('□',d*3));answer=a*2+', '+a*3;reason='분모가 2배, 3배가 되면 분자도 2배, 3배가 됩니다.'}
  if(s.method==='multiples'){const e=d+1,L=d*e;prompt=d+'와 '+e+'의 공배수를 작은 수부터 3개 쓰세요.';answer=[L,2*L,3*L].join(', ');reason='최소공배수 '+L+'의 배수입니다.'}
  if(s.method==='common'){const e=d+1,L=d*e;prompt='가장 작은 공통분모로 통분하세요.';visual=eq(F(a,d)+' , '+F(1,e));answer=a*e+'/'+L+', '+d+'/'+L;reason='연속한 두 분모 '+d+'와 '+e+'의 최소공배수는 '+L+'입니다.'}
  if(s.method==='order'){const vals=[[1,d],[1,d+1],[1,d+2]],rot=r(3),shown=vals.slice(rot).concat(vals.slice(0,rot));prompt='작은 분수부터 차례로 쓰세요.';visual=eq(shown.map(([x,y])=>F(x,y)).join('　'));task='________ < ________ < ________';answer='1/'+(d+2)+' < 1/'+(d+1)+' < 1/'+d;reason='분자가 1인 분수는 분모가 클수록 작습니다.'}
  if(s.method==='count'){const nums=Array.from({length:d-1},(_,i)=>i+1).filter(x=>gcd(x,d)===1);prompt='분모가 '+d+'인 진분수 중 기약분수인 것을 모두 쓰고, 개수도 쓰세요.';answer=nums.map(x=>x+'/'+d).join(', ')+' ('+nums.length+'개)';reason='분자는 분모보다 작고, 분자와 분모의 공약수는 1뿐이어야 합니다.'}
  if(s.method==='bound'){const limit=d*k+r(d);prompt='다음 분수와 크기가 같고, 분모가 '+limit+' 이하인 분수 중 분모가 가장 큰 분수를 쓰세요.';visual=eq(F(a,d));answer=a*k+'/'+(d*k);reason='분모는 '+d+'의 배수입니다. '+limit+' 이하인 가장 큰 배수는 '+d*k+'입니다.';check.limit=limit}
  if(s.method==='between'){const low=1+r(2),hi=low+2,D=12;prompt='분모가 12인 분수 중 두 분수 사이에 있는 것을 모두 쓰세요. 양 끝의 분수는 제외합니다.';visual=eq(F(low,6)+' < □ < '+F(hi,6));answer=Array.from({length:3},(_,i)=>(low*2+i+1)+'/12').join(', ');reason=low*2+'/12보다 크고 '+hi*2+'/12보다 작아야 합니다.'}
  if(s.method==='change'){prompt='분모에 '+d+'를 더했습니다. 크기가 같은 분수가 되려면 분자에는 얼마를 더해야 하나요?';visual=eq(F(a,d)+' = '+F(a+' + □',d+' + '+d));answer=String(a);reason='분모가 2배이므로 분자도 2배가 되도록 '+a+'를 더합니다.'}
  if(s.method==='sum'){prompt='다음 분수와 크기가 같고, 분자와 분모의 합이 '+(a+d)*k+'인 분수를 쓰세요.';visual=eq(F(a,d));answer=(a*k)+'/'+(d*k);reason='원래 분자와 분모의 합 '+(a+d)+'의 '+k+'배입니다.'}
  if(s.method==='reverse'){const inc=1+r(3),originalD=d*k-inc;prompt='어떤 분수의 분모에 '+inc+'을 더한 뒤 약분했더니 아래 분수가 되었습니다. 바꾸기 전 분자가 '+a*k+'일 때 원래 분수를 쓰세요.';visual=eq(F(a,d));answer=a*k+'/'+originalD;reason='약분 전 분모는 '+d*k+'입니다. 더했던 '+inc+'을 빼면 '+originalD+'입니다.'}
  visual='<span class="picture-badge">'+KoArt.icon(asset)+'</span>'+visual;
  return {methodId:s.method,skill:s.method,prompt,visual,task,answer,reason,artId:asset.id,check};
 })}));
}
root.KoFractions={profiles,generate};
})(globalThis);
