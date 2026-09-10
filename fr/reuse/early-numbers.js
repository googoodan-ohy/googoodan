(function(root){
const profiles=[
 {name:'Compter, entourer et lire les nombres',activities:[['count','Compter les images'],['mark','Entourer le nombre demandé'],['words','Relier les nombres aux mots']]},
 {name:'Comparer les nombres et les positions',activities:[['ordinal','Repérer une position'],['neighbors','Trouver le nombre précédent et suivant'],['compare','Comparer deux quantités']]},
 {name:'수가 나타내는 뜻',activities:[['zero','아무것도 없는 수 0'],['two-read','수를 두 가지로 읽기'],['order','수 카드를 순서대로 놓기']]},
 {name:'조건을 읽고 수 찾기',activities:[['clue','조건에 맞는 수 모두 찾기'],['line','수직선의 자리 찾기'],['repair','잘못 놓인 수 카드 고치기']]}
].map(x=>({...x,activities:x.activities.map(([method,title])=>({method,title}))}));
function generate(p,seed,n,excluded){
 const session=KoArt.session(seed,excluded);let state=seed>>>0;const r=k=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return Math.floor(state/4294967296*k)},between=(a,b)=>a+r(b-a+1);
 const equation=x=>'<div class="kequation">'+x+'</div>',blank='<span class="kblank"></span>';
 const sino=['영','일','이','삼','사','오','육','칠','팔','구'];
 const names=['zéro','un','deux','trois','quatre','cinq','six','sept','huit','neuf'];
 return profiles[p].activities.map(s=>({title:s.title,skill:s.method,questions:Array.from({length:s.method==='zero'?1:n},()=>{
 const asset=session.take(),a=between(1,9),b=between(1,9);let prompt='',visual='',task=blank,answer='',reason='',open=false;
 const count=x=>KoArt.count(asset,x),cards=xs=>'<div class="number-cards">'+xs.map(x=>'<b>'+x+'</b>').join('')+'</div>';
 if(s.method==='zero'){prompt='아무것도 없는 바구니의 개수를 수로 쓰세요.';visual='<div class="empty-count-basket">비어 있어요</div>';answer='0';reason='하나도 없는 것은 0으로 나타냅니다.'}
 if(s.method==='two-read'){prompt='그림의 수를 세고 두 가지 방법으로 읽어 쓰세요.';visual=count(a);task='수: ____　읽기: ______, ______';answer=a+' / '+sino[a]+', '+names[a];reason='같은 수를 두 가지 말로 읽을 수 있습니다.'}
 if(s.method==='count'){prompt='Combien y a-t-il d’images ? Écris le nombre.';visual=count(a);answer=a;reason='En comptant les images une par une, on en trouve '+a+'.'}
 if(s.method==='mark'){const total=between(4,9),k=between(1,total-1);prompt='Entoure exactement '+k+' images.';visual=count(total);task='';answer='Entourer '+k+' images';reason='Il suffit de choisir et d’entourer '+k+' images.';open=true}
 if(s.method==='words'){const vals=[a,a%9+1,(a+1)%9+1],rot=r(3),right=vals.slice(rot).concat(vals.slice(0,rot));prompt='Relie chaque nombre au mot correspondant.';visual='<span class="picture-badge">'+KoArt.icon(asset)+'</span><div class="match-columns"><div>'+vals.map(x=>'<p>'+x+' ●</p>').join('')+'</div><div>'+right.map(x=>'<p>● '+names[x]+'</p>').join('')+'</div></div>';task='';answer=vals.map(x=>x+' → '+names[x]).join(', ');reason='Chaque mot indique le nombre correspondant.'}
 if(s.method==='ordinal'){const total=between(4,8),k=between(1,total);prompt='En partant de la gauche, entoure l’image en position '+k+'.';visual='<div class="ordinal-row">'+Array.from({length:total},()=>KoArt.icon(asset)).join('')+'</div>';task='';answer='Position '+k+' depuis la gauche';reason='Compte les positions depuis la gauche et marque une seule image.';open=true}
 if(s.method==='neighbors'){const k=between(2,8);prompt='Écris le nombre juste avant et le nombre juste après.';visual=cards(['□',k,'□']);answer=(k-1)+', '+(k+1);reason=(k-1)+' → '+k+' → '+(k+1)+' est l’ordre des nombres.'}
 if(s.method==='compare'){const k=between(1,4),j=between(5,9);prompt='Entoure le groupe qui contient le plus d’images.';const reverse=r(2);visual='<div class="two-baskets"><div>A'+count(reverse?j:k)+'</div><div>B'+count(reverse?k:j)+'</div></div>';task='A / B';answer=reverse?'A':'B';reason=j+' est plus grand que '+k+'.'}
 if(s.method==='bond'){const total=between(3,9),left=between(1,total-1);prompt='전체를 두 묶음으로 가릅니다. 빈칸을 채우세요.';visual=count(total)+'<div class="number-bond"><b>'+total+'</b><span>↙　↘</span><span>'+left+'　　□</span></div>';answer=total-left;reason=left+'개를 한쪽에 놓으면 '+(total-left)+'개가 남습니다.'}
 if(s.method==='complete'){const total=between(3,9),given=between(1,total-1);prompt='모두 '+total+'개가 되도록 부족한 만큼 간단한 그림을 더 그리세요.';visual=count(given);task='<div class="kdraw"></div>';answer=(total-given)+'개 더 그리기';reason=given+'개와 '+(total-given)+'개를 모으면 '+total+'개입니다.';open=true}
 if(s.method==='order'){let vals=[...new Set([a,b,between(1,9),between(1,9)])];while(vals.length<3){const v=between(1,9);if(!vals.includes(v))vals.push(v)}vals=vals.slice(0,3);prompt='작은 수부터 차례대로 쓰세요.';visual=cards(vals);task='____ → ____ → ____';answer=[...vals].sort((x,y)=>x-y).join(' → ');reason='가장 작은 수부터 놓습니다.'}
 if(s.method==='clue'){const lo=between(1,5),hi=lo+3;prompt=lo+'보다 크고 '+hi+'보다 작은 수를 모두 찾으세요.';visual=cards([lo,lo+1,lo+2,hi]);answer=(lo+1)+', '+(lo+2);reason=lo+'와 '+hi+'는 조건에 맞지 않습니다.'}
 if(s.method==='line'){const start=between(1,5),missing=between(1,3);prompt='수직선의 □에 들어갈 수를 쓰세요.';visual='<svg class="concept-art" viewBox="0 0 240 55"><path d="M15 20H225" stroke="#456c78"/>'+Array.from({length:5},(_,i)=>'<path d="M'+(20+i*50)+' 16v9" stroke="#456c78"/><text x="'+(20+i*50)+'" y="44" font-size="17" text-anchor="middle">'+(i===missing?'□':start+i)+'</text>').join('')+'</svg>';answer=start+missing;reason='오른쪽으로 한 칸 갈 때마다 1씩 커집니다.'}
 if(s.method==='repair'){const start=between(1,6);prompt='작은 수부터 놓으려다 카드 두 장이 바뀌었습니다. 바뀐 두 수를 쓰세요.';visual=cards([start,start+2,start+1,start+3]);task='____와 ____';answer=(start+2)+', '+(start+1);reason='바른 순서는 '+[start,start+1,start+2,start+3].join(', ')+'입니다.'}
 if(!visual.includes('data-art-id'))visual='<span class="picture-badge">'+KoArt.icon(asset)+'</span>'+visual;
 return {methodId:s.method,skill:s.method,prompt,visual,task,answer:String(answer),reason,open,artId:asset.id};
 })}));
}
root.KoEarlyNumbers={profiles:profiles.slice(0,2),generate(p,...args){if(p<0||p>1)throw Error("French profile not yet available");return generate(p,...args)}};
})(globalThis);
