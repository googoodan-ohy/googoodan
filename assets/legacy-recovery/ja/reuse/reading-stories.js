(function(root){
const A=root.KoArt;
const targets=new Set(['1-1-3','1-2-2','1-2-4','1-2-6','2-1-3','3-1-1']);
const definitions=[
 ['何を求めるお話かな',['total','initial','change']],
 ['同じ数でも問いがちがう',['paired','compare-more','compare-less']],
 ['お話と式を結ぶ',['choose-total','choose-initial','choose-change']],
 ['必要な情報を選ぶ',['extra-label','extra-other','extra-age']],
 ['図で関係を表す',['bar-total','bar-part','bar-difference']],
 ['問いを作って確かめる',['question','claim','justify']]
];
const sheets=definitions.map(([name,methods])=>({name,activities:methods.map((method,i)=>({method,title:['お話を読む','条件を考える','考えを表す'][i]})),goal:'求める量と分かっている量の関係を考える'}));
let exclude=[];
const words={"연필":["えんぴつ","本"],"펜":["ペン","本"],"크레용":["クレヨン","個"],"붓":["筆","本"],"펼치지 않은 책":["本","冊"],"노트":["ノート","冊"],"지우개":["消しゴム","個"],"자":["定規","個"],"삼각자":["三角定規","個"],"클립":["クリップ","個"],"주사위":["さいころ","個"],"풍선":["風船","個"],"선물":["プレゼントの箱","個"],"테디 베어":["くまのぬいぐるみ","個"],"요요":["ヨーヨー","個"],"축구공":["サッカーボール","個"],"야구공":["野球のボール","個"],"배구공":["バレーボール","個"],"농구":["バスケットボール","個"],"테니스":["テニスボール","個"],"사탕":["あめ","個"],"롤리팝":["棒付きのあめ","個"],"쿠키":["クッキー","個"],"도넛":["ドーナツ","個"],"컵케이크":["カップケーキ","個"],"밤":["くり","個"],"빨간 사과":["りんご","個"],"배":["なし","個"],"귤":["みかん","個"],"레몬":["レモン","個"],"딸기":["いちご","個"],"바나나":["バナナ","個"],"당근":["にんじん","個"],"감자":["じゃがいも","個"],"고구마":["さつまいも","個"],"토마토":["トマト","個"],"달걀":["たまご","個"],"양파":["たまねぎ","個"],"만두":["ぎょうざ","個"],"초밥":["すし","個"],"빵":["パン","個"],"복숭아":["もも","個"],"선글라스":["サングラス","個"],"야구모자":["ぼうし","個"],"양말":["くつ下","組"],"장갑":["手ぶくろ","組"],"우산":["かさ","個"],"손전등":["かい中電灯","個"],"열쇠":["かぎ","個"],"종":["ベル","個"],"비누":["せっけん","個"],"스펀지":["スポンジ","個"],"바구니":["かご","個"],"양동이":["バケツ","個"],"의자":["いす","個"],"꽃다발":["花束","個"],"튜립":["チューリップ","本"],"장미꽃":["ばら","本"],"해바라기":["ひまわり","本"],"네잎클로버":["四つ葉のクローバー","個"],"퍼즐":["パズル","個"],"운동화":["くつ","組"],"학교 가방":["ランドセル","個"],"헤드폰":["ヘッドホン","個"],"마이크":["マイク","個"],"기타":["ギター","個"],"바이올린":["バイオリン","個"],"트럼펫":["トランペット","個"],"드럼":["たいこ","個"],"실타래":["毛糸玉","個"],"연":["たこ","個"]};
const profiles=()=>sheets;
function generate(id,p,seed,n=8){
 const spec=sheets[p],u={grade:id.startsWith('1-')?1:id.startsWith('2-')?2:3};
 let state=seed>>>0;const r=k=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return Math.floor(state/4294967296*k)},between=(a,b)=>a+r(b-a+1),art=A.session(seed,exclude);
 const max=id==='1-1-3'?9:id==='1-2-6'?99:u.grade===1?19:u.grade===2?199:999;
 return spec.activities.map(s=>({title:s.title,skill:s.method,questions:Array.from({length:n},(_,i)=>{
 const asset=art.take(x=>!!words[x.name]),[noun,unit]=words[asset.name],b=between(1,Math.max(1,Math.floor(max/3))),a=between(b+1,max-b),sum=a+b,difference=a-b;
 let prompt='',task='式：__________________<br>答え：__________',answer='',reason='',open=false,visual='<span class="story-picture">'+A.icon(asset)+'</span>';
 const mode=s.method,initial=noun+' '+b+unit+'を追加で集めると全部で'+a+unit+'になりました。初めは何'+unit+'ありましたか。',
 total=noun+' '+a+unit+'あります。'+b+unit+'をもらいました。今は全部で何'+unit+'ですか。',
 change=noun+' '+a+unit+'ありましたが、今は'+b+unit+'残っています。何'+unit+'使いましたか。';
 let expected=sum;
 if(mode==='total'||mode==='choose-total'||mode==='bar-total'){prompt=total;answer=a+' + '+b+' = '+sum+' / '+sum+unit;reason='初めの数ともらった数を合わせて、今の数を求めます。'}
 if(mode==='initial'||mode==='choose-initial'||mode==='bar-part'){prompt=initial;expected=difference;answer=a+' − '+b+' = '+difference+' / '+difference+unit;reason='全部の数から追加で集めた数をひくと、初めの数が分かります。'}
 if(mode==='change'||mode==='choose-change'||mode==='bar-difference'){prompt=change;expected=difference;answer=a+' − '+b+' = '+difference+' / '+difference+unit;reason='初めの数から残りをひくと使った数です。'}
 if(mode==='paired'){prompt='① '+total+'\n② '+initial;task='① 式：______________<br>② 式：______________';answer='① '+a+' + '+b+' = '+sum+' ② '+a+' − '+b+' = '+difference;reason='同じ数でも、今の数を求めるか初めの数を求めるかで式が変わります。'}
 if(mode==='compare-more'){prompt='はるとは'+noun+' '+a+unit+'を集めました。あおいは、はるとより'+b+unit+'多く集めました。あおいは何'+unit+'集めましたか。';answer=a+' + '+b+' = '+sum;reason='はるとの数に多い分をたします。'}
 if(mode==='compare-less'){prompt='あおいは'+noun+' '+a+unit+'を集めました。はるとは、あおいより'+b+unit+'少なく集めました。はるとは何'+unit+'集めましたか。';expected=difference;answer=a+' − '+b+' = '+difference;reason='あおいの数から少ない分をひきます。'}
 if(mode.startsWith('choose-')){const options=[a+' + '+b,a+' − '+b],swap=r(2);if(swap)options.reverse();task=options.map((x,j)=>['① ','② '][j]+x).join('　')+'<br>合う式を○で囲み、答えを書きましょう： ____';answer=(options.indexOf(a+(mode==='choose-total'?' + ':' − ')+b)===0?'①':'②')+', '+expected+unit;reason+='「追加で」とあっても、何を求めるかを確かめます。'}
 if(mode.startsWith('extra-')){const unused=between(2,9),variant=i%3;const relation=variant===0?total:variant===1?initial:change;prompt=mode==='extra-label'?'箱の番号は'+unused+'番です。'+relation:mode==='extra-other'?relation+'隣にはシールも'+unused+'枚あります。':unused+'才の弟と片付けています。'+relation;expected=variant===0?sum:difference;task='必要な二つの数：____, ____<br>式：__________________';answer=a+', '+b+' / '+a+(variant===0?' + ':' − ')+b+' = '+expected;reason=(mode==='extra-label'?'箱の番号':mode==='extra-other'?'別の物の数':'弟の年齢')+'はこの問いの計算には必要ありません。'}
 if(mode.startsWith('bar-')){const whole=mode==='bar-total'?'□':a,left=mode==='bar-total'?a:'□',right=b;visual+='<div class="story-bar"><div>全部で'+whole+'</div><div><span>'+left+'</span><span>'+right+'</span></div></div>';prompt+='図の□も埋めましょう。'}
 if(mode==='question'){prompt=noun+' '+a+unit+'用意し、'+b+unit+'追加しました。この場面に合う問いを作り、自分で答えましょう。';task='自分の問い：__________________<br>__________________________<br>式と答え：__________________';answer='例：全部で何'+unit+'ですか。 '+a+' + '+b+' = '+sum;reason='問いと式と答えが合っていれば、別の問いでもかまいません。';open=true}
 if(mode==='claim'){prompt=initial+'友だちは「追加で集めたから'+a+' + '+b+'を計算すればよい」と言いました。考えを直しましょう。';expected=difference;answer=a+' − '+b+' = '+difference;reason='求めるのは追加で集める前の数です。今の数から追加した数をひきます。'}
 if(mode==='justify'){prompt=change+'その式を選んだ理由も書きましょう。';expected=difference;task+=' <div class="kreason">理由：__________________</div>';answer=a+' − '+b+' = '+difference;reason='初めの数 = 使った数 + 残りの数、という関係を使います。';open=true}
 return {methodId:mode,skill:mode,prompt,visual,task,answer,reason,open,artId:asset.id,check:{kind:'reading-story',a,b,sum,difference,expected,method:mode}};
 })}));
}
root.JaReadingStories={profiles:sheets,generate};
})(globalThis);
