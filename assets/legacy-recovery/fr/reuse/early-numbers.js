(function(root){
const profiles=[
 {name:'Compter, entourer et lire les nombres',activities:[['count','Compter les images'],['mark','Entourer le nombre demandé'],['words','Relier les nombres aux mots']]},
 {name:'Comparer les nombres et les positions',activities:[['ordinal','Repérer une position'],['neighbors','Trouver le nombre précédent et suivant'],['compare','Comparer deux quantités']]},
 {name:'Zéro et ordre des nombres',activities:[['zero','Comprendre le nombre zéro'],['two-read','수를 두 가지로 읽기'],['order','Ranger les nombres']]},
 {name:'Trouver les nombres avec des indices',activities:[['clue','Trouver tous les nombres possibles'],['line','Compléter une droite graduée'],['repair','Remettre les nombres dans l’ordre']]}
].map(x=>({...x,activities:x.activities.map(([method,title])=>({method,title}))}));
function generate(p,seed,n,excluded){
 const session=KoArt.session(seed,excluded);let state=seed>>>0;const r=k=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return Math.floor(state/4294967296*k)},between=(a,b)=>a+r(b-a+1);
 const equation=x=>'<div class="kequation">'+x+'</div>',blank='<span class="kblank"></span>';
 const sino=['영','일','이','삼','사','오','육','칠','팔','구'];
 const names=['zéro','un','deux','trois','quatre','cinq','six','sept','huit','neuf'];
 return profiles[p].activities.map(s=>({title:s.title,skill:s.method,questions:Array.from({length:s.method==='zero'?1:n},()=>{
 const asset=session.take(),a=between(1,9),b=between(1,9);let prompt='',visual='',task=blank,answer='',reason='',open=false;
 const count=x=>KoArt.count(asset,x),cards=xs=>'<div class="number-cards">'+xs.map(x=>'<b>'+x+'</b>').join('')+'</div>';
 if(s.method==='zero'){prompt='Écris le nombre d’objets dans le panier vide.';visual='<div class="empty-count-basket">Le panier est vide</div>';answer='0';reason='Quand il n’y a aucun objet, on écrit 0.'}
 if(s.method==='two-read'){prompt='그림의 수를 세고 두 가지 방법으로 읽어 쓰세요.';visual=count(a);task='수: ____　읽기: ______, ______';answer=a+' / '+sino[a]+', '+names[a];reason='같은 수를 두 가지 말로 읽을 수 있습니다.'}
 if(s.method==='count'){prompt='Combien y a-t-il d’images ? Écris le nombre.';visual=count(a);answer=a;reason='En comptant les images une par une, on en trouve '+a+'.'}
 if(s.method==='mark'){const total=between(4,9),k=between(1,total-1);prompt='Entoure exactement '+k+' images.';visual=count(total);task='';answer='Entourer '+k+' images';reason='Il suffit de choisir et d’entourer '+k+' images.';open=true}
 if(s.method==='words'){const vals=[a,a%9+1,(a+1)%9+1],rot=r(3),right=vals.slice(rot).concat(vals.slice(0,rot));prompt='Relie chaque nombre au mot correspondant.';visual='<span class="picture-badge">'+KoArt.icon(asset)+'</span><div class="match-columns"><div>'+vals.map(x=>'<p>'+x+' ●</p>').join('')+'</div><div>'+right.map(x=>'<p>● '+names[x]+'</p>').join('')+'</div></div>';task='';answer=vals.map(x=>x+' → '+names[x]).join(', ');reason='Chaque mot indique le nombre correspondant.'}
 if(s.method==='ordinal'){const total=between(4,8),k=between(1,total);prompt='En partant de la gauche, entoure l’image en position '+k+'.';visual='<div class="ordinal-row">'+Array.from({length:total},()=>KoArt.icon(asset)).join('')+'</div>';task='';answer='Position '+k+' depuis la gauche';reason='Compte les positions depuis la gauche et marque une seule image.';open=true}
 if(s.method==='neighbors'){const k=between(2,8);prompt='Écris le nombre juste avant et le nombre juste après.';visual=cards(['□',k,'□']);answer=(k-1)+', '+(k+1);reason=(k-1)+' → '+k+' → '+(k+1)+' est l’ordre des nombres.'}
 if(s.method==='compare'){const k=between(1,4),j=between(5,9);prompt='Entoure le groupe qui contient le plus d’images.';const reverse=r(2);visual='<div class="two-baskets"><div>A'+count(reverse?j:k)+'</div><div>B'+count(reverse?k:j)+'</div></div>';task='A / B';answer=reverse?'A':'B';reason=j+' est plus grand que '+k+'.'}
 if(s.method==='bond'){const total=between(3,9),left=between(1,total-1);prompt='전체를 두 묶음으로 가릅니다. 빈칸을 채우세요.';visual=count(total)+'<div class="number-bond"><b>'+total+'</b><span>↙　↘</span><span>'+left+'　　□</span></div>';answer=total-left;reason=left+'개를 한쪽에 놓으면 '+(total-left)+'개가 남습니다.'}
 if(s.method==='complete'){const total=between(3,9),given=between(1,total-1);prompt='모두 '+total+'개가 되도록 부족한 만큼 간단한 그림을 더 그리세요.';visual=count(given);task='<div class="kdraw"></div>';answer=(total-given)+'개 더 그리기';reason=given+'개와 '+(total-given)+'개를 모으면 '+total+'개입니다.';open=true}
 if(s.method==='order'){let vals=[...new Set([a,b,between(1,9),between(1,9)])];while(vals.length<3){const v=between(1,9);if(!vals.includes(v))vals.push(v)}vals=vals.slice(0,3);prompt='Écris les nombres du plus petit au plus grand.';visual=cards(vals);task='____ → ____ → ____';answer=[...vals].sort((x,y)=>x-y).join(' → ');reason='Commence par le plus petit nombre.'}
 if(s.method==='clue'){const lo=between(1,5),hi=lo+3;prompt='Trouve tous les nombres plus grands que '+lo+' et plus petits que '+hi+'.';visual=cards([lo,lo+1,lo+2,hi]);answer=(lo+1)+', '+(lo+2);reason=lo+' et '+hi+' ne respectent pas les conditions.'}
 if(s.method==='line'){const start=between(1,5),missing=between(1,3);prompt='Écris le nombre manquant dans □ sur la droite graduée.';visual='<svg class="concept-art" viewBox="0 0 240 55"><path d="M15 20H225" stroke="#456c78"/>'+Array.from({length:5},(_,i)=>'<path d="M'+(20+i*50)+' 16v9" stroke="#456c78"/><text x="'+(20+i*50)+'" y="44" font-size="17" text-anchor="middle">'+(i===missing?'□':start+i)+'</text>').join('')+'</svg>';answer=start+missing;reason='Chaque graduation vers la droite ajoute 1.'}
 if(s.method==='repair'){const start=between(1,6);prompt='Deux cartes ont été échangées dans la suite croissante. Écris les deux nombres échangés.';visual=cards([start,start+2,start+1,start+3]);task='____ et ____';answer=(start+2)+', '+(start+1);reason='L’ordre correct est '+[start,start+1,start+2,start+3].join(', ')+'.'}
 if(!visual.includes('data-art-id'))visual='<span class="picture-badge">'+KoArt.icon(asset)+'</span>'+visual;
 return {methodId:s.method,skill:s.method,prompt,visual,task,answer:String(answer),reason,open,artId:asset.id};
 })}));
}
const selected=[0,1,3,2];root.KoEarlyNumbers={profiles:selected.map(i=>i===2?{...profiles[i],activities:profiles[i].activities.filter(a=>a.method!=='two-read')}:profiles[i]),generate(p,...args){if(!Number.isInteger(p)||p<0||p>=selected.length)throw Error("French profile not yet available");return generate(selected[p],...args).filter(a=>a.skill!=='two-read')}};
})(globalThis);
