(function(root){
const single=[
 ['まとまりをかけ算の式にする','九九を完成させる','身の回りの九九'],
 ['たし算をかけ算にする','数直線でとびとびに数える','同じ答えを結ぶ'],
 ['並び方から式を書く','まとまりの数を求める','九九のまちがいを直す'],
 ['九九の表を埋める','九九のきまりで計算する','お話に合う式を選ぶ'],
 ['まとまりをかけ算の式にする','九九の表を埋める','身の回りの九九'],
 ['たし算をかけ算にする','まとまりの数を求める','同じ答えを結ぶ'],
 ['並び方から式を書く','九九のきまりで計算する','お話に合う式を選ぶ'],
 ['数直線でとびとびに数える','九九を完成させる','九九のまちがいを直す']
];
const modes={
'まとまりをかけ算の式にする':'groups','九九を完成させる':'facts','身の回りの九九':'story',
'たし算をかけ算にする':'repeated','数直線でとびとびに数える':'jump','同じ答えを結ぶ':'match',
'並び方から式を書く':'array','まとまりの数を求める':'missing','九九のまちがいを直す':'error',
'九九の表を埋める':'table','九九のきまりで計算する':'neighbor','お話に合う式を選ぶ':'choose'
};
const profiles=Array.from({length:8},(_,i)=>({name:(i+2)+'のだんを練習',tables:[i+2],activities:single[i].map(title=>({title,method:modes[title]}))}));
const add=(name,tables,methods)=>profiles.push({name,tables,activities:methods.map(method=>({method,title:Object.keys(modes).find(k=>modes[k]===method)||({
'zero-groups':'空のまとまり','zero-order':'0をかける順序','zero-story':'まとまりが0のお話',family:'動物のグループ',pack:'箱の数を求める',team:'用意する数のまちがいを直す',ticket:'乗り物のおもちゃを並べる',reverse:'お話からまとまりを求める',compare:'二つの集まりを比べる',create:'九九に合う図をかく',commute:'たてと横から考える',target:'目標の数を作る九九',chain:'九九のきまりを続ける'
})[method]}))});
add('2・3・4のだん',[2,3,4],['facts','missing','compare']);
add('4・5・6のだん',[4,5,6],['table','error','target']);
add('6・7・8のだん',[6,7,8],['repeated','neighbor','match']);
add('7・8・9のだん',[7,8,9],['array','chain','reverse']);
add('2〜9のだんのまとめ',[2,3,4,5,6,7,8,9],['facts','missing','story']);
add('図から九九を考える',[2,3,4,5,6,7,8,9],['groups','array','create']);
add('グループと九九',[2,3,4,5,6,7,8,9],['family','team','pack']);
add('九九のまちがい探し',[2,3,4,5,6,7,8,9],['error','reverse','target']);
add('九九のつながりときまり',[2,3,4,5,6,7,8,9],['commute','neighbor','chain']);
add('九九の文章題',[2,3,4,5,6,7,8,9],['ticket','compare','choose']);
add('1のだん・一つずつのまとまり',[1],['groups','facts','create']);
add('0のかけ算・空のまとまり',[0],['zero-groups','zero-order','zero-story']);
root.KoMultiplicationBank={profiles};
})(globalThis);

(function(root){
const bank=root.KoMultiplicationBank,A=root.KoArt;
let exclusions=[];
const blank='<span class="kblank"></span>',eq=s=>'<div class="kequation">'+s+'</div>';
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
function profiles(){return bank.profiles}
function generate(id,p,seed,n=8){
 const spec=profiles(id)[p];if(!spec)throw Error('プリント番号エラー');
 let state=seed>>>0;const r=max=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return Math.floor(state/4294967296*max)},pick=xs=>xs[r(xs.length)];
 const art=A.session(seed,exclusions);
 const groups=(a,b,asset)=>'<div class="times-groups">'+Array.from({length:b},()=>'<span class="times-group">'+Array.from({length:a},()=>A.icon(asset)).join('')+'</span>').join('')+'</div>';
 const array=(a,b,asset)=>'<div class="times-array" style="grid-template-columns:repeat('+a+',16px)">'+Array.from({length:a*b},()=>A.icon(asset)).join('')+'</div>';
 function question(method,index,section){
  const a=spec.tables[(index+section+seed%spec.tables.length)%spec.tables.length],b=1+(index+section*3+seed%9)%9,product=a*b;
  const animals=['토끼','펭귄','코끼리','기린','얼룩말','오리','비둘기','부엉이','앵무새','백조','홍학','수달','비버','돌고래','물개','사슴','고슴도치','캥거루','라마','하마','너구리','양','염소','거북이','소','강아지 얼굴','고양이 얼굴','곰 얼굴','판다 얼굴','여우 얼굴','사자 얼굴'];
  const storyKind=method==='family'?0:method==='team'?1:method==='pack'?2:method==='ticket'?3:index%6;
  const isStory=['story','family','team','pack','ticket','reverse','choose'].includes(method);
  const asset=art.take(isStory?(x=>storyKind===0?animals.includes(x.name):storyKind===1?x.category==='생활 물건'&&!['활과 화살','칼','도끼','면도칼','쥐덫','쌍검'].includes(x.name):storyKind===2?x.category==='놀이와 운동':storyKind===3?['자동차','택시','버스','트롤리버스','미니버스','경주용 자동차','트랙터','오토바이','자전거','기차','기관차','고속 열차','고속철','전철','지하철','모노레일','트램','케이블카','곤돌라','배','여객선','쾌속정','보트','비행기','경비행기'].includes(x.name):storyKind===4?x.category==='음식':x.category==='동물과 자연'):undefined);
let prompt='',visual='',task=blank,answer='',reason='',open=false,check={kind:'times',a,b,product,method};
  const badge='<span class="picture-badge">'+A.icon(asset)+'</span>';
  if(method==='facts'){prompt='九九を完成させましょう。';visual=badge;task=eq(a+' × '+b+' = □');answer=String(product);reason=a+'ずつ'+b+'まとまりは'+product+'です。'}
  if(method==='facts'&&spec.tables.length===1){prompt=a+'のだんを1から9まで完成させましょう。';task='<div class="facts-nine">'+Array.from({length:9},(_,j)=>'<span>'+a+' × '+(j+1)+' = □</span>').join('')+'</div>';answer=Array.from({length:9},(_,j)=>a*(j+1)).join(', ');reason='かける数が1増えると、答えは'+a+'ずつ増えます。'}
  if(method==='groups'){const g=Math.min(b,4);prompt='図を見て、一つ分の数といくつ分かを式にしましょう。';visual=groups(a,g,asset);task=eq('□ × □ = □');answer=a+' × '+g+' = '+a*g;reason=a+'個ずつ'+g+'まとまりです。';check.product=a*g;check.b=g}
  if(method==='repeated'){const g=2+b%4;prompt='同じ数をたした式を、かけ算の式にしましょう。';visual=badge+eq(Array(g).fill(a).join(' + '));task=eq('□ × □ = □');answer=a+' × '+g+' = '+a*g;reason=a+'を'+g+'回たします。';check.product=a*g;check.b=g}
  if(method==='array'){const g=Math.min(b,5);prompt='一列の数 × 列の数で表しましょう。';visual=array(a,g,asset);task=eq('□ × □ = □');answer=a+' × '+g+' = '+a*g;reason='一列に'+a+'個ずつ'+g+'列です。';check.product=a*g;check.b=g}
  if(method==='jump'){const g=2+b%4;prompt=a+'ずつ進みます。着いた数とかけ算の式を書きましょう。';visual=badge+'<svg class="concept-art" viewBox="0 0 250 48"><path d="M10 32H240" stroke="#597889"/>'+Array.from({length:g+1},(_,j)=>'<path d="M'+(15+j*220/g)+' 28v8" stroke="#597889"/><text x="'+(15+j*220/g)+'" y="47" font-size="11" text-anchor="middle">'+(j===g?'□':j*a)+'</text>'+(j<g?'<path d="M'+(15+j*220/g)+' 28q'+110/g+' -32 '+220/g+' 0" fill="none" stroke="#278477"/>':'')).join('')+'</svg>';task=eq('□ × □ = □');answer=a+' × '+g+' = '+a*g;reason='0から'+a+'ずつ'+g+'回進むと'+a*g+'です。';check.product=a*g;check.b=g}
  if(method==='missing'){prompt='□に入るまとまりの数を求めましょう。';visual=badge;task=eq(a+' × □ = '+product);answer=String(b);reason=a+'のだんで'+product+'になるかけ算を探します。'}
  if(method==='error'){const wrong=product+(r(2)?a:1);prompt='計算のまちがいを見つけて直しましょう。';visual=badge+eq(a+' × '+b+' = '+wrong);task='正しい式： __________________';answer=a+' × '+b+' = '+product;reason=a+'ずつ'+b+'まとまりなので、'+product+'です。'}
  if(method==='table'){const start=1+b%6;prompt=a+'のだんの表の□を埋めましょう。';visual=badge+'<table class="ktable"><tr><th>かける数</th>'+[start,start+1,start+2].map(x=>'<td>'+x+'</td>').join('')+'</tr><tr><th>'+a+'のだん</th><td>□</td><td>'+a*(start+1)+'</td><td>□</td></tr></table>';task='';answer=a*start+', '+a*(start+2);reason='かける数が1増えると、答えは'+a+'だけ増えます。'}
  if(method==='neighbor'){const k=2+b%7;prompt='分かっているかけ算を使って、次の式を完成させましょう。';visual=badge+eq(a+' × '+k+' = '+a*k);task=eq(a+' × '+(k+1)+' = '+a*k+' + □ = □');answer=a+', '+a*(k+1);reason='一つ分の'+a+'個をたします。'}
  if(method==='match'){const k=1+b%7, vals=[a*k,a*(k+1),a*(k+2)],offset=r(3),choices=vals.slice(offset).concat(vals.slice(0,offset));prompt='かけ算の式と同じ答えを線で結びましょう。';visual=badge+'<div class="match-columns"><div>'+[k,k+1,k+2].map(x=>'<p>'+a+' × '+x+' ●</p>').join('')+'</div><div>'+choices.map(x=>'<p>● '+x+'</p>').join('')+'</div></div>';task='';answer=[k,k+1,k+2].map(x=>a+' × '+x+' → '+a*x).join(' / ');reason='まずそれぞれの式の答えを求めます。'}
  if(['story','family','team','pack','ticket','reverse','choose'].includes(method)){
   const c={};
   const contextsByArt=[
    ['動物が一つのグループに'+a+'ひきずついます。'+b+'グループあります。','全部で何びきいますか。','動物が全部で'+product+'ひきいます。一つのグループが'+a+'ひきなら、何グループですか。','ひき'],
    ['一つのグループに道具を'+a+'個ずつ配ります。'+b+'グループに配ります。','全部で何個必要ですか。','道具'+product+'個を一つのグループに'+a+'個ずつ配りました。何グループに配りましたか。','個'],
    ['おもちゃを一つの箱に'+a+'個ずつ入れます。箱が'+b+'個あります。','おもちゃは全部で何個ですか。','おもちゃ'+product+'個を一つの箱に'+a+'個ずつ入れました。箱は何個ですか。','個'],
    ['乗り物のおもちゃを一列に'+a+'台ずつ並べます。'+b+'列あります。','全部で何台ですか。','乗り物のおもちゃ'+product+'台を一列に'+a+'台ずつ並べました。何列ですか。','台'],
    ['食べ物を一つの皿に'+a+'個ずつのせます。皿が'+b+'枚あります。','全部で何個ですか。','食べ物'+product+'個を一つの皿に'+a+'個ずつのせました。皿は何枚ですか。','個'],
    ['シールを一枚の紙に'+a+'枚ずつはります。紙が'+b+'枚あります。','シールは全部で何枚ですか。','シール'+product+'枚を一枚の紙に'+a+'枚ずつはりました。紙は何枚ですか。','枚']
   ];
   const context=contextsByArt[storyKind];c.stem=context[0];c.ask=context[1];c.back=context[2];c.unit=context[3];
   prompt=c.stem+' '+c.ask;visual=badge;
task='かけ算の式： □ × □ = □<br>答え： __________';answer=a+' × '+b+' = '+product+' ('+product+c.unit+')';reason='一つ分の数に、いくつ分かをかけます。';
   if(method==='pack'||method==='reverse'){prompt=c.back;task=eq(a+' × □ = '+product);answer=String(b);reason=a+' × '+b+' = '+product+'です。'}
   if(method==='team'){prompt=c.stem+' 用意する数を'+(product+a)+'個と計算しました。正しいか確かめて直しましょう。';task='正しければ○、ちがえば×： ____<br>正しい式： __________________';answer='×, '+a+' × '+b+' = '+product;reason='一つのグループの分を多く計算しています。'}
   if(method==='choose'){task='<div class="story-options">① '+a+' + '+b+'　② '+a+' × '+b+'</div>合う式： ____　計算の答え： ____';answer='②, '+product+c.unit;reason='同じ数'+a+'が'+b+'まとまりあるので、かけ算です。'}
  }
  if(method==='compare'){const c=Math.min(9,b+1),first=a*b,second=a*c;prompt='二つの集まりの数を比べて、記号を書きましょう。';visual=badge+'<div>ア： '+a+'個ずつ'+b+'まとまり<br>イ： '+a+'個ずつ'+c+'まとまり</div>';task=eq('ア □ イ');answer=first===second?'=':'<';reason=first+'と'+second+'を比べます。'}
  if(method==='target'){const k=2+b%7;prompt='二枚のカードで目標の数になるかけ算の式を作りましょう。カードは一回ずつ使います。';visual=badge+'<div class="number-cards">'+[a,k,10].sort((x,y)=>x-y).map(x=>'<b>'+x+'</b>').join('')+'</div><div>目標の数： '+a*k+'</div>';task=eq('□ × □ = '+a*k);answer=a+' × '+k+' (または '+k+' × '+a+')';reason='二つの数を選び、かけた答えが目標の数になるか確かめます。'}
  if(method==='chain'){const k=1+b%5;prompt='かけ算のきまりを見て、続く二つの式を書きましょう。';visual=badge+eq(a+' × '+k+' = '+a*k)+eq(a+' × '+(k+1)+' = '+a*(k+1));task='__________ = ____<br>__________ = ____';answer=a+' × '+(k+2)+' = '+a*(k+2)+', '+a+' × '+(k+3)+' = '+a*(k+3);reason='かける数は1ずつ、答えは'+a+'ずつ増えます。'}
  if(method==='commute'){const k=Math.min(b,4);prompt='同じ並びをたてと横から見て、二つの式を書きましょう。';visual=array(a,k,asset);task=eq('□ × □ = □')+eq('□ × □ = □');answer=a+' × '+k+' = '+a*k+', '+k+' × '+a+' = '+a*k;reason='まとまりを見る向きを変えても、全部の数は同じです。'}
  if(method==='create'){const k=2+b%3;prompt=a+' × '+k+'に合うまとまりの図をかきましょう。点や簡単な絵でもかまいません。';visual=badge;task='<div class="kdraw"></div>';answer='例： '+a+'個ずつ'+k+'まとまり、全部で'+a*k+'個';reason='一つ分の数と、いくつ分かを確かめます。';open=true}
  if(method==='zero-groups'){prompt='空のかごが'+b+'個あります。物は全部で何個ですか。';visual=badge+'<div class="empty-count-basket">一つのかごに0個</div>';task=eq('0 × '+b+' = □');answer='0';reason='空のかごがいくつあっても、物は0個です。'}
if(method==='zero-order'){prompt='かける順序を変えて、二つの式を完成させましょう。';visual=badge;task=eq(b+' × 0 = □')+eq('0 × '+b+' = □');answer='0, 0';reason='どんな数に0をかけても、答えは0です。'}
if(method==='zero-story'){prompt='一つの袋に玉が'+b+'個ずつ入ります。まだ袋を一つも作っていません。入れた玉は全部で何個ですか。';visual=badge;task=eq(b+' × □ = □');answer=b+' × 0 = 0';reason='袋の数が0なので、入れた玉も0個です。'}
if(!prompt||!answer)throw Error('未対応の九九活動 '+method);
  return {skill:'times',methodId:method,prompt,visual,task,answer,reason,open,check,artId:asset.id};
 }
 return spec.activities.map((s,i)=>({title:s.title,skill:'times',method:s.method,questions:Array.from({length:s.method==='facts'&&spec.tables.length===1?1:n},(_,j)=>question(s.method,j,i))}));
}
root.JaMultiplication={profiles:bank.profiles,generate,excludeArt:ids=>{exclusions=ids}};
})(globalThis);
