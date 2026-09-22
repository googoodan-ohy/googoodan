(function(root){
const specs={
 '1-2-2':[
 ['세 수와 10의 짝',[['three-add','세 수의 덧셈'],['three-sub','세 수의 뺄셈'],['ten-missing','10을 만드는 빈칸']]],
 ['10을 먼저 만드는 전략',[['pair-ten','10이 되는 두 수 먼저 찾기'],['ten-frame','10칸 그림 완성하기'],['bridge-add','10을 만들어 더하기']]],
 ['10에서 빼는 전략',[['bridge-sub','10에서 빼고 더하기'],['zero-ten','10에서 빼기'],['error','풀이의 실수 찾기']]]
 ],
 '1-2-4':[
 ['받아올림과 받아내림',[['bridge-add','10을 만들어 더하기'],['bridge-sub','10에서 빼고 더하기'],['picture-add','그림을 식으로 바꾸기']]],
 ['서로 연결되는 식',[['inverse','덧셈과 뺄셈 연결'],['compensate','같은 합 만드는 수 찾기'],['compare','계산한 값 비교하기']]],
 ['이야기 속 가려진 수',[['story','모아서 구하기'],['missing-add','처음 수 거꾸로 찾기'],['error','계산의 실수 고치기']]]
 ],
 '1-2-6':[
 ['두 자리 수의 계산',[['column-add','자리를 맞추어 더하기'],['column-sub','자리를 맞추어 빼기'],['compare','두 식의 값 비교하기']]],
 ['표와 이야기로 계산',[['table','준비물 표 읽고 계산하기'],['story','두 묶음 모으기'],['missing-add','가려진 수 찾기']]],
 ['관계로 생각하는 연산',[['inverse','덧셈과 뺄셈의 관계'],['compensate','같은 합 만들기'],['error','잘못된 계산 고치기']]]
 ]
};
const banks=Object.fromEntries(Object.entries(specs).map(([id,rows])=>[id,rows.map(([name,acts])=>({name,activities:acts.map(([method,title])=>({method,title}))}))]));
function generate(id,p,seed,n,excluded){
 let state=seed>>>0;const r=k=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return Math.floor(state/4294967296*k)},between=(a,b)=>a+r(b-a+1),art=KoArt.session(seed,excluded);
 const eq=s=>'<div class="kequation">'+s+'</div>';
 return banks[id][p].activities.map(s=>({title:s.title,skill:s.method,questions:Array.from({length:n},()=>{
 const asset=art.take(),large=id==='1-2-6';let a,b;
 if(large){a=10*between(1,4)+between(1,4);b=10*between(1,3)+between(1,4)}
 else{a=between(5,9);b=between(10-a,9)}
 let prompt='',visual='',task='<span class="kblank"></span>',answer='',reason='',check={kind:'early-calc',method:s.method,a,b};
 if(s.method==='three-add'){const x=between(1,3),y=between(1,3),z=between(1,3);prompt='세 수를 차례로 더하세요.';visual=eq(x+' + '+y+' + '+z+' = □');answer=String(x+y+z);reason=x+' + '+y+' = '+(x+y)+', 여기에 '+z+'를 더합니다.'}
 if(s.method==='three-sub'){const x=between(6,9),y=between(1,3),z=between(1,2);prompt='왼쪽부터 차례로 빼세요.';visual=eq(x+' − '+y+' − '+z+' = □');answer=String(x-y-z);reason='먼저 '+x+' − '+y+'를 계산합니다.'}
 if(s.method==='ten-missing'){prompt='합이 10이 되도록 빈칸을 채우세요.';visual=eq(a+' + □ = 10');answer=String(10-a);reason=a+'에 '+(10-a)+'를 더하면 10입니다.'}
 if(s.method==='pair-ten'){const x=between(1,4),y=10-x,z=between(5,9),vals=r(2)?[x,z,y]:[z,y,x];prompt='합이 10인 두 수에 동그라미 하고, 세 수의 합을 구하세요.';visual=eq(vals.join(' + ')+' = □');answer=x+'와 '+y+'에 표시, 합은 '+(10+z);reason=x+' + '+y+' = 10을 먼저 계산합니다.'}
 if(s.method==='ten-frame'){prompt='10칸이 모두 차려면 몇 개가 더 필요한가요?';visual='<div class="ten-frame">'+Array.from({length:10},(_,i)=>'<span>'+(i<a?KoArt.icon(asset):'')+'</span>').join('')+'</div>';task='더 필요한 수: ____';answer=String(10-a);reason='비어 있는 칸이 '+(10-a)+'칸입니다.'}
 if(s.method==='bridge-add'){const need=10-a,rest=b-need;prompt='뒤의 수를 나누어 10을 먼저 만드세요.';visual=eq(a+' + '+b+' = □');task=b+' = '+need+' + □<br>'+a+' + '+need+' = 10<br>10 + □ = □';answer=rest+', '+rest+', '+(a+b);reason=b+'를 '+need+'와 '+rest+'로 나눕니다.'}
 if(s.method==='bridge-sub'){const total=10+between(1,7),sub=between(total-9,9),ones=total-10;prompt='십몇을 10과 낱개로 나누어 계산하세요.';visual=eq(total+' − '+sub+' = □');task='10 − '+sub+' = □<br>□ + '+ones+' = □';answer=(10-sub)+', '+(10-sub)+', '+(total-sub);reason='10에서 먼저 뺀 뒤 낱개 '+ones+'를 더합니다.'}
 if(s.method==='zero-ten'){prompt='10에서 빼세요.';visual=eq('10 − '+a+' = □');answer=String(10-a);reason=a+' + '+(10-a)+' = 10입니다.'}
 if(s.method==='picture-add'){const x=between(3,6),y=between(3,6);prompt='두 묶음을 모으는 덧셈식을 쓰세요.';visual='<div class="two-baskets"><div>'+KoArt.count(asset,x)+'</div><div>'+KoArt.count(asset,y)+'</div></div>';task='□ + □ = □';answer=x+' + '+y+' = '+(x+y);reason='각 묶음의 개수를 더합니다.'}
 if(s.method==='inverse'){prompt='세 수를 모두 사용해 덧셈식 하나와 뺄셈식 하나를 쓰세요.';visual=eq(a+'　'+b+'　'+(a+b));task='____ + ____ = ____<br>____ − ____ = ____';answer='예: '+a+' + '+b+' = '+(a+b)+', '+(a+b)+' − '+a+' = '+b;reason='더하는 두 수의 순서를 바꾸거나 다른 수를 빼도 됩니다.'}
 if(s.method==='compensate'){prompt='양쪽의 합이 같도록 빈칸을 채우세요.';visual=eq(a+' + '+b+' = '+(a-1)+' + □');answer=String(b+1);reason='한쪽 수가 1 작아지면 다른 수는 1 커져야 합이 같습니다.'}
 if(s.method==='compare'){const c=between(1,3),d=between(1,3),x=a+b,y=(a+c)+(b-d);prompt='두 식을 계산하고 >, =, < 중 알맞은 기호를 쓰세요.';visual=eq(a+' + '+b+' □ '+(a+c)+' + '+(b-d));answer=x>y?'>':x<y?'<':'=';reason='왼쪽은 '+x+', 오른쪽은 '+y+'입니다.'}
 if(s.method==='story'){prompt='그림 속 물건을 오전에 '+a+'개, 오후에 '+b+'개 모았습니다. 모두 몇 개인가요?';task='식: ____ + ____ = ____<br>답: ____개';answer=a+' + '+b+' = '+(a+b);reason='오전과 오후의 개수를 모읍니다.'}
 if(s.method==='missing-add'){prompt='처음에 몇 개가 있었을까요? '+b+'개를 더 모았더니 '+(a+b)+'개가 되었습니다.';task='□ + '+b+' = '+(a+b);answer=String(a);reason=(a+b)+'에서 더 모은 '+b+'를 빼면 '+a+'입니다.'}
 if(s.method==='error'){prompt='계산을 확인하고 잘못된 답을 고치세요.';visual=eq(a+' + '+b+' = '+(a+b+1));answer=String(a+b);reason='정확한 합은 '+(a+b)+'입니다.'}
 if(s.method==='column-add'||s.method==='column-sub'){const sub=s.method==='column-sub',top=sub?a+b:a,bottom=b;prompt='같은 자리끼리 계산하세요.';visual='<div class="vertical-calc"><span>'+top+'</span><span>'+(sub?'−':'+')+' '+bottom+'</span><span>□□</span></div>';answer=String(sub?a:a+b);reason='일의 자리와 십의 자리를 각각 계산합니다.'}
 if(s.method==='table'){const c=between(1,9);prompt='준비한 수와 더 받은 수를 합해 표의 빈칸을 채우세요.';visual='<table class="ktable"><tr><th>준비한 수</th><th>더 받은 수</th><th>모두</th></tr><tr><td>'+a+'</td><td>'+b+'</td><td>□</td></tr><tr><td>'+a+'</td><td>'+c+'</td><td>□</td></tr></table>';answer=(a+b)+', '+(a+c);reason='각 줄의 두 수를 더합니다.'}
 if(!visual.includes('data-art-id'))visual='<span class="picture-badge">'+KoArt.icon(asset)+'</span>'+visual;
 if(!prompt||!answer)throw Error('활동 미구현 '+s.method);
 return {methodId:s.method,skill:s.method,prompt,visual,task,answer,reason,artId:asset.id,check};
 })}));
}
root.KoEarlyArithmetic={banks,generate};
})(globalThis);
