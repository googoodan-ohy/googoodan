(function(root){
const profiles=[
 {name:'約分と等しい分数',activities:[['divisors','復習・公約数'],['reduce','約分して既約分数にする'],['equivalent','等しい分数を続けて書く']]},
 {name:'通分と大小比較',activities:[['multiples','復習・公倍数'],['common','最小の共通分母を求める'],['order','分数を大きさの順に並べる']]},
 {name:'条件に合う分数を探す',activities:[['count','既約な真分数を探す'],['bound','分母の範囲に合う分数'],['between','二つの分数の間にある分数']]},
 {name:'分数の探究・逆から考える',activities:[['change','大きさを変えずに表す'],['sum','分子と分母の和から考える'],['reverse','変える前の分数を求める']]}
].map(x=>({...x,activities:x.activities.map(([method,title])=>({method,title}))}));
function generate(p,seed,n,excluded){
 let state=seed>>>0;const r=k=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return Math.floor(state/4294967296*k)},pick=xs=>xs[r(xs.length)];
 const gcd=(a,b)=>b?gcd(b,a%b):a,F=(a,b)=>'<span class="kf"><span>'+a+'</span><span>'+b+'</span></span>',eq=x=>'<div class="kequation">'+x+'</div>',session=KoArt.session(seed,excluded);
 return profiles[p].activities.map(s=>({title:s.title,skill:s.method,questions:Array.from({length:n},()=>{
  const d=pick([3,4,5,6,7,8,9]),eligible=Array.from({length:d-1},(_,i)=>i+1).filter(x=>gcd(x,d)===1),a=pick(eligible),k=2+r(4),asset=session.take();
  let prompt='',visual='',task='<span class="kblank"></span>',answer='',reason='',check={kind:'fraction-bank',method:s.method,a,d,k};
  if(s.method==='divisors'){const x=a*k,y=d*k,common=Array.from({length:k},(_,i)=>i+1).filter(v=>x%v===0&&y%v===0);prompt=x+'と'+y+'の公約数を全て書きましょう。';answer=common.join(', ');reason='二つの数をどちらも割り切れる数を探します。'}
  if(s.method==='reduce'){prompt='分子と分母を同じ数で割って約分しましょう。';visual=eq(F(a*k,d*k)+' = '+F('□','□'));answer=a+'/'+d;reason='分子と分母を最大公約数の'+k+'で割ります。'}
  if(s.method==='equivalent'){prompt='分母を見て、等しい分数になるように分子を書きましょう。';visual=eq(F(a,d)+' = '+F('□',d*2)+' = '+F('□',d*3));answer=a*2+', '+a*3;reason='分母を2倍、3倍すると、分子も2倍、3倍にします。'}
  if(s.method==='multiples'){const e=d+1,L=d*e;prompt=d+'と'+e+'の公倍数を小さい順に三つ書きましょう。';answer=[L,2*L,3*L].join(', ');reason='最小公倍数の'+L+'の倍数です。'}
  if(s.method==='common'){const e=d+1,L=d*e;prompt='最小の共通分母で通分しましょう。';visual=eq(F(a,d)+' , '+F(1,e));answer=a*e+'/'+L+', '+d+'/'+L;reason='連続する二つの分母'+d+'と'+e+'の最小公倍数は'+L+'です。'}
  if(s.method==='order'){const vals=[[1,d],[1,d+1],[1,d+2]],rot=r(3),shown=vals.slice(rot).concat(vals.slice(0,rot));prompt='小さい分数から順に書きましょう。';visual=eq(shown.map(([x,y])=>F(x,y)).join('　'));task='________ < ________ < ________';answer='1/'+(d+2)+' < 1/'+(d+1)+' < 1/'+d;reason='分子が1の分数は、分母が大きいほど小さくなります。'}
  if(s.method==='count'){const nums=Array.from({length:d-1},(_,i)=>i+1).filter(x=>gcd(x,d)===1);prompt='分母が'+d+'の真分数のうち、既約分数を全て書き、個数も答えましょう。';answer=nums.map(x=>x+'/'+d).join(', ')+' ('+nums.length+'個)';reason='分子は分母より小さく、分子と分母の公約数は1だけです。'}
  if(s.method==='bound'){const limit=d*k+r(d);prompt='次の分数と等しく、分母が'+limit+'以下の分数のうち、分母が最大のものを書きましょう。';visual=eq(F(a,d));answer=a*k+'/'+(d*k);reason='分母は'+d+'の倍数です。 '+limit+'以下の最大の倍数は'+d*k+'です。';check.limit=limit}
  if(s.method==='between'){const low=1+r(2),hi=low+2,D=12;prompt='分母が12の分数のうち、二つの分数の間にあるものを全て書きましょう。両端の分数は含みません。';visual=eq(F(low,6)+' < □ < '+F(hi,6));answer=Array.from({length:3},(_,i)=>(low*2+i+1)+'/12').join(', ');reason=low*2+'/12より大きく、'+hi*2+'/12より小さい必要があります。'}
  if(s.method==='change'){prompt='分母に'+d+'をたしました。等しい分数にするには、分子にいくつたしますか。';visual=eq(F(a,d)+' = '+F(a+' + □',d+' + '+d));answer=String(a);reason='分母が2倍なので、分子も2倍になるように'+a+'をたします。'}
  if(s.method==='sum'){prompt='次の分数と等しく、分子と分母の和が'+(a+d)*k+'になる分数を書きましょう。';visual=eq(F(a,d));answer=(a*k)+'/'+(d*k);reason='もとの分子と分母の和'+(a+d)+'の'+k+'倍です。'}
  if(s.method==='reverse'){const inc=1+r(3),originalD=d*k-inc;prompt='ある分数の分母に'+inc+'をたして約分すると、次の分数になりました。もとの分子が'+a*k+'のとき、もとの分数を書きましょう。';visual=eq(F(a,d));answer=a*k+'/'+originalD;reason='約分する前の分母は'+d*k+'です。たした'+inc+'をひくと'+originalD+'です。'}
  visual='<span class="picture-badge">'+KoArt.icon(asset)+'</span>'+visual;
  return {methodId:s.method,skill:s.method,prompt,visual,task,answer,reason,artId:asset.id,check};
 })}));
}
root.KoFractions={profiles,generate};
})(globalThis);
