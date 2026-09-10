(function(root){
const specs={
 '1-2-2':[
 ['三つの数と10の組',[['three-add','三つの数のたし算'],['three-sub','三つの数のひき算'],['ten-missing','10を作る穴埋め']]],
 ['先に10を作る方法',[['pair-ten','10になる二つの数を探す'],['ten-frame','10マスの図を完成させる'],['bridge-add','10を作ってたす']]],
 ['10からひく方法',[['bridge-sub','10からひいてたす'],['zero-ten','10からひく'],['error','解き方の間違いを探す']]]
 ],
 '1-2-4':[
 ['繰り上がりと繰り下がり',[['bridge-add','10を作ってたす'],['bridge-sub','10からひいてたす'],['picture-add','図を式に表す']]],
 ['つながりのある式',[['inverse','たし算とひき算のつながり'],['compensate','同じ和になる数を探す'],['compare','計算した値を比べる']]],
 ['文章の中の隠れた数',[['story','合わせて求める'],['missing-add','はじめの数を逆から求める'],['error','計算の間違いを直す']]]
 ],
 '1-2-6':[
 ['二けたの数の計算',[['column-add','位をそろえてたす'],['column-sub','位をそろえてひく'],['compare','二つの式の値を比べる']]],
 ['表と文章で計算する',[['table','表を読んで計算する'],['story','二つのまとまりを合わせる'],['missing-add','隠れた数を求める']]],
 ['数の関係から考える',[['inverse','たし算とひき算の関係'],['compensate','同じ和を作る'],['error','間違った計算を直す']]]
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
 if(s.method==='three-add'){const x=between(1,3),y=between(1,3),z=between(1,3);prompt='三つの数を順にたしましょう。';visual=eq(x+' + '+y+' + '+z+' = □');answer=String(x+y+z);reason=x+' + '+y+' = '+(x+y)+', ここに'+z+'をたします。'}
 if(s.method==='three-sub'){const x=between(6,9),y=between(1,3),z=between(1,2);prompt='左から順にひきましょう。';visual=eq(x+' − '+y+' − '+z+' = □');answer=String(x-y-z);reason='先に'+x+' − '+y+'を計算します。'}
 if(s.method==='ten-missing'){prompt='和が10になるように空欄を埋めましょう。';visual=eq(a+' + □ = 10');answer=String(10-a);reason=a+'に'+(10-a)+'をたすと10です。'}
 if(s.method==='pair-ten'){const x=between(1,4),y=10-x,z=between(5,9),vals=r(2)?[x,z,y]:[z,y,x];prompt='和が10になる二つの数を丸で囲み、三つの数の和を求めましょう。';visual=eq(vals.join(' + ')+' = □');answer=x+'と'+y+'を囲み、和は'+(10+z);reason=x+' + '+y+' = 10を先に計算します。'}
 if(s.method==='ten-frame'){prompt='10マスを全て埋めるには、あと何個必要ですか。';visual='<div class="ten-frame">'+Array.from({length:10},(_,i)=>'<span>'+(i<a?KoArt.icon(asset):'')+'</span>').join('')+'</div>';task='あと必要な数： ____';answer=String(10-a);reason='空いているマスは'+(10-a)+'マスです。'}
 if(s.method==='bridge-add'){const need=10-a,rest=b-need;prompt='後ろの数を分けて、先に10を作りましょう。';visual=eq(a+' + '+b+' = □');task=b+' = '+need+' + □<br>'+a+' + '+need+' = 10<br>10 + □ = □';answer=rest+', '+rest+', '+(a+b);reason=b+'を'+need+'と'+rest+'に分けます。'}
 if(s.method==='bridge-sub'){const total=10+between(1,7),sub=between(total-9,9),ones=total-10;prompt='十いくつを10と一の位の数に分けて計算しましょう。';visual=eq(total+' − '+sub+' = □');task='10 − '+sub+' = □<br>□ + '+ones+' = □';answer=(10-sub)+', '+(10-sub)+', '+(total-sub);reason='10から先にひいて、一の位の数'+ones+'をたします。'}
 if(s.method==='zero-ten'){prompt='10からひきましょう。';visual=eq('10 − '+a+' = □');answer=String(10-a);reason=a+' + '+(10-a)+' = 10です。'}
 if(s.method==='picture-add'){const x=between(3,6),y=between(3,6);prompt='二つのまとまりを合わせるたし算の式を書きましょう。';visual='<div class="two-baskets"><div>'+KoArt.count(asset,x)+'</div><div>'+KoArt.count(asset,y)+'</div></div>';task='□ + □ = □';answer=x+' + '+y+' = '+(x+y);reason='それぞれのまとまりの数をたします。'}
 if(s.method==='inverse'){prompt='三つの数を全て使い、たし算とひき算の式を一つずつ書きましょう。';visual=eq(a+'　'+b+'　'+(a+b));task='____ + ____ = ____<br>____ − ____ = ____';answer='例： '+a+' + '+b+' = '+(a+b)+', '+(a+b)+' − '+a+' = '+b;reason='たす二つの数の順を入れ替えたり、もう一方の数をひいたりしてもかまいません。'}
 if(s.method==='compensate'){prompt='両側の和が等しくなるように空欄を埋めましょう。';visual=eq(a+' + '+b+' = '+(a-1)+' + □');answer=String(b+1);reason='一方の数が1小さくなると、もう一方は1大きくすれば和が同じです。'}
 if(s.method==='compare'){const c=between(1,3),d=between(1,3),x=a+b,y=(a+c)+(b-d);prompt='二つの式を計算し、>、=、<から当てはまる記号を書きましょう。';visual=eq(a+' + '+b+' □ '+(a+c)+' + '+(b-d));answer=x>y?'>':x<y?'<':'=';reason='左は'+x+', 右は'+y+'です。'}
 if(s.method==='story'){prompt='図の物を午前に'+a+'個、午後に'+b+'個集めました。全部で何個ですか。';task='式： ____ + ____ = ____<br>答え： ____個';answer=a+' + '+b+' = '+(a+b);reason='午前と午後の数を合わせます。'}
 if(s.method==='missing-add'){prompt='はじめは何個ありましたか。'+b+'個をさらに集めると'+(a+b)+'個になりました。';task='□ + '+b+' = '+(a+b);answer=String(a);reason=(a+b)+'から後で集めた'+b+'をひくと'+a+'です。'}
 if(s.method==='error'){prompt='計算を確かめて、間違った答えを直しましょう。';visual=eq(a+' + '+b+' = '+(a+b+1));answer=String(a+b);reason='正しい和は'+(a+b)+'です。'}
 if(s.method==='column-add'||s.method==='column-sub'){const sub=s.method==='column-sub',top=sub?a+b:a,bottom=b;prompt='同じ位どうしで計算しましょう。';visual='<div class="vertical-calc"><span>'+top+'</span><span>'+(sub?'−':'+')+' '+bottom+'</span><span>□□</span></div>';answer=String(sub?a:a+b);reason='一の位と十の位をそれぞれ計算します。'}
 if(s.method==='table'){const c=between(1,9);prompt='用意した数と追加の数を合わせて、表の空欄を埋めましょう。';visual='<table class="ktable"><tr><th>用意した数</th><th>追加の数</th><th>全部</th></tr><tr><td>'+a+'</td><td>'+b+'</td><td>□</td></tr><tr><td>'+a+'</td><td>'+c+'</td><td>□</td></tr></table>';answer=(a+b)+', '+(a+c);reason='各行の二つの数をたします。'}
 if(!visual.includes('data-art-id'))visual='<span class="picture-badge">'+KoArt.icon(asset)+'</span>'+visual;
 if(!prompt||!answer)throw Error('未実装の活動 '+s.method);
 return {methodId:s.method,skill:s.method,prompt,visual,task,answer,reason,artId:asset.id,check};
 })}));
}
root.KoEarlyArithmetic={banks,generate};
})(globalThis);
