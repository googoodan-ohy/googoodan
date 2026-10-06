(function(root){
const profiles=[
 {name:'数える・印を付ける・読む',activities:[['count','図を数えて数字を書く'],['mark','指定した個数を丸で囲む'],['words','数と読み方を結ぶ']]},
 {name:'順序と大きさを調べる',activities:[['ordinal','指定された順番に印を付ける'],['neighbors','前後の数を探す'],['compare','二つのまとまりの個数を比べる']]},
 {name:'数が表す意味',activities:[['zero','何もない数0'],['two-read','数と物の数え方'],['order','数のカードを順に並べる']]},
 {name:'条件から数を探す',activities:[['clue','条件に合う数を全て探す'],['line','数直線の数を求める'],['repair','数のカードの順を直す']]}
].map(x=>({...x,activities:x.activities.map(([method,title])=>({method,title}))}));
function generate(p,seed,n,excluded){
 const session=KoArt.session(seed,excluded);let state=seed>>>0;const r=k=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return Math.floor(state/4294967296*k)},between=(a,b)=>a+r(b-a+1);
 const equation=x=>'<div class="kequation">'+x+'</div>',blank='<span class="kblank"></span>';
 const sino=['れい','いち','に','さん','よん','ご','ろく','なな','はち','きゅう'];
 const names=['れい','ひとつ','ふたつ','みっつ','よっつ','いつつ','むっつ','ななつ','やっつ','ここのつ'];
 return profiles[p].activities.map(s=>({title:s.title,skill:s.method,questions:Array.from({length:s.method==='zero'?1:n},()=>{
 const asset=session.take(),a=between(1,9),b=between(1,9);let prompt='',visual='',task=blank,answer='',reason='',open=false;
 const count=x=>KoArt.count(asset,x),cards=xs=>'<div class="number-cards">'+xs.map(x=>'<b>'+x+'</b>').join('')+'</div>';
 if(s.method==='zero'){prompt='空のかごにある物の数を数字で書きましょう。';visual='<div class="empty-count-basket">からっぽです</div>';answer='0';reason='一つもないことを0で表します。'}
 if(s.method==='two-read'){prompt='図を数え、数字の読み方と「ひとつ、ふたつ」の数え方を書きましょう。';visual=count(a);task='数： ____　読み方： ______, ______';answer=a+' / '+sino[a]+', '+names[a];reason='数字の読み方と、物を数えるときの読み方があります。'}
 if(s.method==='count'){prompt='図は全部でいくつですか。数字で書きましょう。';visual=count(a);answer=a;reason='一つずつ数えると'+a+'個です。'}
 if(s.method==='mark'){const total=between(4,9),k=between(1,total-1);prompt='図の中の'+k+'個だけを丸で囲みましょう。';visual=count(total);task='';answer=k+'個に印';reason='どの図でも'+k+'個選んで印を付けます。';open=true}
 if(s.method==='words'){const vals=[a,a%9+1,(a+1)%9+1],rot=r(3),right=vals.slice(rot).concat(vals.slice(0,rot));prompt='数字と物の数え方を線で結びましょう。';visual='<span class="picture-badge">'+KoArt.icon(asset)+'</span><div class="match-columns"><div>'+vals.map(x=>'<p>'+x+' ●</p>').join('')+'</div><div>'+right.map(x=>'<p>● '+names[x]+'</p>').join('')+'</div></div>';task='';answer=vals.map(x=>x+' → '+names[x]).join(', ');reason='数え方を確かめます。'}
 if(s.method==='ordinal'){const total=between(4,8),k=between(1,total);prompt='左から'+k+'番目の図だけを丸で囲みましょう。';visual='<div class="ordinal-row">'+Array.from({length:total},()=>KoArt.icon(asset)).join('')+'</div>';task='';answer='左から'+k+'番目';reason='左から順に数え、一か所に印を付けます。';open=true}
 if(s.method==='neighbors'){const k=between(2,8);prompt='すぐ前とすぐ後の数を書きましょう。';visual=cards(['□',k,'□']);answer=(k-1)+', '+(k+1);reason=(k-1)+' → '+k+' → '+(k+1)+' の順です。'}
 if(s.method==='compare'){const k=between(1,4),j=between(5,9);prompt='図の数が多い方を丸で囲みましょう。';const reverse=r(2);visual='<div class="two-baskets"><div>ア'+count(reverse?j:k)+'</div><div>イ'+count(reverse?k:j)+'</div></div>';task='ア / イ';answer=reverse?'ア':'イ';reason=j+'個は'+k+'個より多いです。'}
 if(s.method==='bond'){const total=between(3,9),left=between(1,total-1);prompt='全体を二つに分けます。空欄を埋めましょう。';visual=count(total)+'<div class="number-bond"><b>'+total+'</b><span>↙　↘</span><span>'+left+'　　□</span></div>';answer=total-left;reason=left+'個を一方に置くと'+(total-left)+'個残ります。'}
 if(s.method==='complete'){const total=between(3,9),given=between(1,total-1);prompt='全部で'+total+'個になるように、足りない分の図を描きましょう。';visual=count(given);task='<div class="kdraw"></div>';answer=(total-given)+'個描き足す';reason=given+'個と'+(total-given)+'個を合わせると'+total+'個です。';open=true}
 if(s.method==='order'){let vals=[...new Set([a,b,between(1,9),between(1,9)])];while(vals.length<3){const v=between(1,9);if(!vals.includes(v))vals.push(v)}vals=vals.slice(0,3);prompt='小さい数から順に書きましょう。';visual=cards(vals);task='____ → ____ → ____';answer=[...vals].sort((x,y)=>x-y).join(' → ');reason='最も小さい数から並べます。'}
 if(s.method==='clue'){const lo=between(1,5),hi=lo+3;prompt=lo+'より大きく、'+hi+'より小さい数を全て探しましょう。';visual=cards([lo,lo+1,lo+2,hi]);answer=(lo+1)+', '+(lo+2);reason=lo+'と'+hi+'は条件に合いません。'}
 if(s.method==='line'){const start=between(1,5),missing=between(1,3);prompt='数直線の□に入る数を書きましょう。';visual='<svg class="concept-art" viewBox="0 0 240 55"><path d="M15 20H225" stroke="#456c78"/>'+Array.from({length:5},(_,i)=>'<path d="M'+(20+i*50)+' 16v9" stroke="#456c78"/><text x="'+(20+i*50)+'" y="44" font-size="17" text-anchor="middle">'+(i===missing?'□':start+i)+'</text>').join('')+'</svg>';answer=start+missing;reason='右へ一目盛り進むごとに1大きくなります。'}
 if(s.method==='repair'){const start=between(1,6);prompt='小さい順に並べるとき、二枚のカードが入れ替わりました。その二つの数を書きましょう。';visual=cards([start,start+2,start+1,start+3]);task='____と____';answer=(start+2)+', '+(start+1);reason='正しい順は'+[start,start+1,start+2,start+3].join(', ')+'です。'}
 if(!visual.includes('data-art-id'))visual='<span class="picture-badge">'+KoArt.icon(asset)+'</span>'+visual;
 return {methodId:s.method,skill:s.method,prompt,visual,task,answer:String(answer),reason,open,artId:asset.id};
 })}));
}
root.KoEarlyNumbers={profiles,generate};
})(globalThis);
