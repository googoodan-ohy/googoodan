(function(root){
const specs={
 '1-2-2':[
 ['Trois nombres et les compléments à 10',[['three-add','Additionner trois nombres'],['three-sub','Soustraire deux nombres successivement'],['ten-missing','Compléter pour faire 10']]],
 ['Faire 10 pour additionner',[['pair-ten','Trouver deux nombres qui font 10'],['ten-frame','Compléter un cadre de dix cases'],['bridge-add','Additionner en faisant 10']]],
 ['Soustraire et vérifier les calculs',[['bridge-sub','Soustraire en passant par 10'],['zero-ten','Soustraire de 10'],['error','Vérifier une addition']]]
 ],
 '1-2-4':[
 ['받아올림과 받아내림',[['bridge-add','Additionner en faisant 10'],['bridge-sub','Soustraire en passant par 10'],['picture-add','그림을 식으로 바꾸기']]],
 ['Relier les additions et les soustractions',[['inverse','Relier les deux opérations'],['compensate','Compléter des sommes égales'],['compare','Comparer les résultats']]],
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
 if(s.method==='three-add'){const x=between(1,3),y=between(1,3),z=between(1,3);prompt='Additionne les trois nombres.';visual=eq(x+' + '+y+' + '+z+' = □');answer=String(x+y+z);reason=x+' + '+y+' = '+(x+y)+', puis ajoute '+z+'.'}
 if(s.method==='three-sub'){const x=between(6,9),y=between(1,3),z=between(1,2);prompt='Effectue les soustractions de gauche à droite.';visual=eq(x+' − '+y+' − '+z+' = □');answer=String(x-y-z);reason='Calcule d’abord '+x+' − '+y+'.'}
 if(s.method==='ten-missing'){prompt='Complète pour obtenir une somme de 10.';visual=eq(a+' + □ = 10');answer=String(10-a);reason=a+' + '+(10-a)+' = 10.'}
 if(s.method==='pair-ten'){const x=between(1,4),y=10-x,z=between(5,9),vals=r(2)?[x,z,y]:[z,y,x];prompt='Entoure deux nombres dont la somme vaut 10, puis calcule la somme des trois nombres.';visual=eq(vals.join(' + ')+' = □');answer='Entoure '+x+' et '+y+' ; somme : '+(10+z);reason=x+' + '+y+' = 10 en premier.'}
 if(s.method==='ten-frame'){prompt='Combien manque-t-il pour remplir les dix cases ?';visual='<div class="ten-frame">'+Array.from({length:10},(_,i)=>'<span>'+(i<a?KoArt.icon(asset):'')+'</span>').join('')+'</div>';task='Nombre manquant : ____';answer=String(10-a);reason='Il reste '+(10-a)+' cases vides.'}
 if(s.method==='bridge-add'){const need=10-a,rest=b-need;prompt='Décompose le second nombre pour faire 10 en premier.';visual=eq(a+' + '+b+' = □');task=b+' = '+need+' + □<br>'+a+' + '+need+' = 10<br>10 + □ = □';answer=rest+', '+rest+', '+(a+b);reason='Décompose '+b+' en '+need+' et '+rest+'.'}
 if(s.method==='bridge-sub'){const total=10+between(1,7),sub=between(total-9,9),ones=total-10;prompt='Décompose le nombre en 10 et des unités pour calculer.';visual=eq(total+' − '+sub+' = □');task='10 − '+sub+' = □<br>□ + '+ones+' = □';answer=(10-sub)+', '+(10-sub)+', '+(total-sub);reason='Soustrais de 10, puis ajoute les '+ones+' unités.'}
 if(s.method==='zero-ten'){prompt='Soustrais de 10.';visual=eq('10 − '+a+' = □');answer=String(10-a);reason=a+' + '+(10-a)+' = 10.'}
 if(s.method==='picture-add'){const x=between(3,6),y=between(3,6);prompt='두 묶음을 모으는 덧셈식을 쓰세요.';visual='<div class="two-baskets"><div>'+KoArt.count(asset,x)+'</div><div>'+KoArt.count(asset,y)+'</div></div>';task='□ + □ = □';answer=x+' + '+y+' = '+(x+y);reason='각 묶음의 개수를 더합니다.'}
 if(s.method==='inverse'){prompt='Utilise les trois nombres pour écrire une addition et une soustraction.';visual=eq(a+'　'+b+'　'+(a+b));task='____ + ____ = ____<br>____ − ____ = ____';answer='Exemple : '+a+' + '+b+' = '+(a+b)+', '+(a+b)+' − '+a+' = '+b;reason='Tu peux changer l’ordre des termes ou écrire l’autre soustraction.'}
 if(s.method==='compensate'){prompt='Complète pour obtenir la même somme des deux côtés.';visual=eq(a+' + '+b+' = '+(a-1)+' + □');answer=String(b+1);reason='Si un terme diminue de 1, l’autre augmente de 1 pour garder la même somme.'}
 if(s.method==='compare'){const c=between(1,3),d=between(1,3),x=a+b,y=(a+c)+(b-d);prompt='Calcule les deux expressions et complète avec >, = ou <.';visual=eq(a+' + '+b+' □ '+(a+c)+' + '+(b-d));answer=x>y?'>':x<y?'<':'=';reason='À gauche : '+x+' ; à droite : '+y+'.'}
 if(s.method==='story'){prompt='그림 속 물건을 오전에 '+a+'개, 오후에 '+b+'개 모았습니다. 모두 몇 개인가요?';task='식: ____ + ____ = ____<br>답: ____개';answer=a+' + '+b+' = '+(a+b);reason='오전과 오후의 개수를 모읍니다.'}
 if(s.method==='missing-add'){prompt='처음에 몇 개가 있었을까요? '+b+'개를 더 모았더니 '+(a+b)+'개가 되었습니다.';task='□ + '+b+' = '+(a+b);answer=String(a);reason=(a+b)+'에서 더 모은 '+b+'를 빼면 '+a+'입니다.'}
 if(s.method==='error'){prompt='Vérifie le calcul et corrige le résultat.';visual=eq(a+' + '+b+' = '+(a+b+1));answer=String(a+b);reason='La somme correcte est '+(a+b)+'.'}
 if(s.method==='column-add'||s.method==='column-sub'){const sub=s.method==='column-sub',top=sub?a+b:a,bottom=b;prompt='같은 자리끼리 계산하세요.';visual='<div class="vertical-calc"><span>'+top+'</span><span>'+(sub?'−':'+')+' '+bottom+'</span><span>□□</span></div>';answer=String(sub?a:a+b);reason='일의 자리와 십의 자리를 각각 계산합니다.'}
 if(s.method==='table'){const c=between(1,9);prompt='준비한 수와 더 받은 수를 합해 표의 빈칸을 채우세요.';visual='<table class="ktable"><tr><th>준비한 수</th><th>더 받은 수</th><th>모두</th></tr><tr><td>'+a+'</td><td>'+b+'</td><td>□</td></tr><tr><td>'+a+'</td><td>'+c+'</td><td>□</td></tr></table>';answer=(a+b)+', '+(a+c);reason='각 줄의 두 수를 더합니다.'}
 if(!visual.includes('data-art-id'))visual='<span class="picture-badge">'+KoArt.icon(asset)+'</span>'+visual;
 if(!prompt||!answer)throw Error('활동 미구현 '+s.method);
 return {methodId:s.method,skill:s.method,prompt,visual,task,answer,reason,artId:asset.id,check};
 })}));
}
root.KoEarlyArithmetic={banks:{'1-2-2':banks['1-2-2'].slice(0,3),'1-2-4':[banks['1-2-4'][1]]},generate(id,p,...args){if(id==='1-2-4'&&p===0)return generate(id,1,...args);if(id!=='1-2-2'||(!Number.isInteger(p)||p<0||p>2))throw Error('Untranslated profile');return generate(id,p,...args)}};
})(globalThis);
