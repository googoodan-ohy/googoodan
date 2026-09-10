(function(root){
const single=[
 ['Écrire la multiplication de groupes','Compléter la table de multiplication','Résoudre un problème de multiplication'],
 ['Passer de l’addition à la multiplication','Avancer sur une droite graduée','Relier les produits'],
 ['Écrire la multiplication d’un tableau','Trouver le nombre de groupes','Corriger une multiplication'],
 ['Compléter un tableau de produits','Utiliser un produit voisin','Choisir la bonne opération'],
 ['Écrire la multiplication de groupes','Compléter un tableau de produits','Résoudre un problème de multiplication'],
 ['Passer de l’addition à la multiplication','Trouver le nombre de groupes','Relier les produits'],
 ['Écrire la multiplication d’un tableau','Utiliser un produit voisin','Choisir la bonne opération'],
 ['Avancer sur une droite graduée','Compléter la table de multiplication','Corriger une multiplication']
];
const modes={
'Écrire la multiplication de groupes':'groups','Compléter la table de multiplication':'facts','Résoudre un problème de multiplication':'story',
'Passer de l’addition à la multiplication':'repeated','Avancer sur une droite graduée':'jump','Relier les produits':'match',
'Écrire la multiplication d’un tableau':'array','Trouver le nombre de groupes':'missing','Corriger une multiplication':'error',
'Compléter un tableau de produits':'table','Utiliser un produit voisin':'neighbor','Choisir la bonne opération':'choose'
};
const profiles=Array.from({length:8},(_,i)=>({name:(i+2)+'단 익히기',tables:[i+2],activities:single[i].map(title=>({title,method:modes[title]}))}));
const add=(name,tables,methods)=>profiles.push({name,tables,activities:methods.map(method=>({method,title:Object.keys(modes).find(k=>modes[k]===method)||({
'zero-groups':'빈 묶음의 개수','zero-order':'순서를 바꾼 0의 곱셈','zero-story':'0묶음인 이야기',family:'가족 소풍 이야기',pack:'상자 수 거꾸로 찾기',team:'준비물 계산의 실수 찾기',ticket:'장난감 탈것 배열하기',reverse:'이야기 속 묶음 수 찾기',compare:'두 묶음의 개수 비교',create:'구구단에 맞는 그림 그리기',commute:'줄과 칸을 바꾸어 보기',target:'목표 수를 만드는 구구단',chain:'구구단 규칙 이어가기'
})[method]}))});
add('2·3·4단 함께 익히기',[2,3,4],['facts','missing','compare']);
add('4·5·6단 함께 익히기',[4,5,6],['table','error','target']);
add('6·7·8단 함께 익히기',[6,7,8],['repeated','neighbor','match']);
add('7·8·9단 함께 익히기',[7,8,9],['array','chain','reverse']);
add('2~9단 모두 익히기',[2,3,4,5,6,7,8,9],['facts','missing','story']);
add('그림을 구구단으로 바꾸기',[2,3,4,5,6,7,8,9],['groups','array','create']);
add('가족과 모둠의 구구단',[2,3,4,5,6,7,8,9],['family','team','pack']);
add('구구단 탐정',[2,3,4,5,6,7,8,9],['error','reverse','target']);
add('구구단의 연결과 규칙',[2,3,4,5,6,7,8,9],['commute','neighbor','chain']);
add('Résoudre un problème de multiplication 해결하기',[2,3,4,5,6,7,8,9],['ticket','compare','choose']);
add('1단 · 한 개씩 묶기',[1],['groups','facts','create']);
add('0의 곱셈 · 아무것도 없는 묶음',[0],['zero-groups','zero-order','zero-story']);
root.FrTimesBank={profiles};
})(globalThis);

(function(root){
const bank=root.FrTimesBank,A=root.KoArt;
let exclusions=[];
const blank='<span class="kblank"></span>',eq=s=>'<div class="kequation">'+s+'</div>';
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
function profiles(id){return bank.profiles}
function generate(id,p,seed,n=8){
 const spec=profiles(id)[p];if(!spec)throw Error('문제지 번호 오류');
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
  if(method==='facts'){prompt='Complète la multiplication.';visual=badge;task=eq(a+' × '+b+' = □');answer=String(product);reason=b+' groupes de '+a+' donnent '+product+'.'}
  if(method==='facts'&&spec.tables.length===1){prompt='Complète la table de '+a+' de 1 à 9.';task='<div class="facts-nine">'+Array.from({length:9},(_,j)=>'<span>'+a+' × '+(j+1)+' = □</span>').join('')+'</div>';answer=Array.from({length:9},(_,j)=>a*(j+1)).join(', ');reason='Quand le facteur augmente de 1, le produit augmente de '+a+'.'}
  if(method==='groups'){const g=Math.min(b,4);prompt='Écris : objets par groupe × nombre de groupes.';visual=groups(a,g,asset);task=eq('□ × □ = □');answer=a+' × '+g+' = '+a*g;reason=g+' groupes contiennent chacun '+a+' objets.';check.product=a*g;check.b=g}
  if(method==='repeated'){const g=2+b%4;prompt='Écris cette addition répétée sous forme de multiplication.';visual=badge+eq(Array(g).fill(a).join(' + '));task=eq('□ × □ = □');answer=a+' × '+g+' = '+a*g;reason='On additionne '+g+' fois le nombre '+a+'.';check.product=a*g;check.b=g}
  if(method==='array'){const g=Math.min(b,5);prompt='Écris : objets par ligne × nombre de lignes.';visual=array(a,g,asset);task=eq('□ × □ = □');answer=a+' × '+g+' = '+a*g;reason='Il y a '+g+(g===1?' ligne de ':' lignes de ')+a+' objets.';check.product=a*g;check.b=g}
  if(method==='jump'){const g=2+b%4;prompt='On avance par bonds de '+a+'. Écris le nombre atteint et la multiplication.';visual=badge+'<svg class="concept-art" viewBox="0 0 250 48"><path d="M10 32H240" stroke="#597889"/>'+Array.from({length:g+1},(_,j)=>'<path d="M'+(15+j*220/g)+' 28v8" stroke="#597889"/><text x="'+(15+j*220/g)+'" y="47" font-size="11" text-anchor="middle">'+(j===g?'□':j*a)+'</text>'+(j<g?'<path d="M'+(15+j*220/g)+' 28q'+110/g+' -32 '+220/g+' 0" fill="none" stroke="#278477"/>':'')).join('')+'</svg>';task=eq('□ × □ = □');answer=a+' × '+g+' = '+a*g;reason='Depuis 0, '+g+' bonds de '+a+' donnent '+a*g+'.';check.product=a*g;check.b=g}
  if(method==='missing'){prompt='Trouve le nombre de groupes manquant.';visual=badge;task=eq(a+' × □ = '+product);answer=String(b);reason='Cherche dans la table de '+a+' le produit égal à '+product+'.'}
  if(method==='error'){const wrong=product+(r(2)?a:1);prompt='Repère l’erreur et corrige le calcul.';visual=badge+eq(a+' × '+b+' = '+wrong);task='Calcul corrigé : __________________';answer=a+' × '+b+' = '+product;reason=b+' groupes de '+a+' font '+product+'.'}
  if(method==='table'){const start=1+b%6;prompt='Complète les cases vides de la table de '+a+'.';visual=badge+'<table class="ktable"><tr><th>Facteur</th>'+[start,start+1,start+2].map(x=>'<td>'+x+'</td>').join('')+'</tr><tr><th>'+a+'</th><td>□</td><td>'+a*(start+1)+'</td><td>□</td></tr></table>';task='';answer=a*start+', '+a*(start+2);reason='Quand le facteur augmente de 1, le produit augmente de '+a+'.'}
  if(method==='neighbor'){const k=2+b%7;prompt='Utilise le produit connu pour compléter la multiplication suivante.';visual=badge+eq(a+' × '+k+' = '+a*k);task=eq(a+' × '+(k+1)+' = '+a*k+' + □ = □');answer=a+', '+a*(k+1);reason='On ajoute un groupe de '+a+'.'}
  if(method==='match'){const k=1+b%7, vals=[a*k,a*(k+1),a*(k+2)],offset=r(3),choices=vals.slice(offset).concat(vals.slice(0,offset));prompt='Relie chaque multiplication à son résultat.';visual=badge+'<div class="match-columns"><div>'+[k,k+1,k+2].map(x=>'<p>'+a+' × '+x+' ●</p>').join('')+'</div><div>'+choices.map(x=>'<p>● '+x+'</p>').join('')+'</div></div>';task='';answer=[k,k+1,k+2].map(x=>a+' × '+x+' → '+a*x).join(' / ');reason='Calcule d’abord chaque produit.'}
  if(['story','family','team','pack','ticket','reverse','choose'].includes(method)){
   const contexts=[
    {stem:'한 가족에 새가 '+a+'마리씩 있습니다. '+b+'가족이 소풍을 갔습니다.',unit:'마리',ask:'새는 모두 몇 마리인가요?',back:'새가 모두 '+product+'마리입니다. 한 가족에 '+a+'마리씩이라면 몇 가족인가요?'},
    {stem:'한 모둠에 학생이 '+a+'명씩 있습니다. '+b+'모둠이 운동장에 모였습니다.',unit:'명',ask:'학생은 모두 몇 명인가요?',back:'학생 '+product+'명이 한 모둠에 '+a+'명씩 모였습니다. 몇 모둠인가요?'},
    {stem:'한 상자에 장난감이 '+a+'개씩 들어 있습니다. 상자가 '+b+'개 있습니다.',unit:'개',ask:'장난감은 모두 몇 개인가요?',back:'장난감 '+product+'개를 한 상자에 '+a+'개씩 담았습니다. 상자는 몇 개인가요?'},
    {stem:'놀이 기구 한 대에 자리가 '+a+'개씩 있습니다. '+b+'대가 운행합니다.',unit:'개',ask:'자리는 모두 몇 개인가요?',back:'자리가 모두 '+product+'개입니다. 한 대에 '+a+'자리씩이면 몇 대인가요?'},
    {stem:'한 봉지에 간식이 '+a+'개씩 있습니다. '+b+'봉지를 준비했습니다.',unit:'개',ask:'간식은 모두 몇 개인가요?',back:'간식 '+product+'개를 한 봉지에 '+a+'개씩 담았습니다. 몇 봉지인가요?'},
    {stem:'꽃밭 한 줄에 꽃이 '+a+'송이씩 있습니다. 꽃이 '+b+'줄로 피었습니다.',unit:'송이',ask:'꽃은 모두 몇 송이인가요?',back:'꽃 '+product+'송이를 한 줄에 '+a+'송이씩 심었습니다. 몇 줄인가요?'}
   ];
   const c=contexts[method==='family'?0:method==='team'?1:method==='pack'?2:method==='ticket'?3:index%contexts.length];
   const name=asset.name.replace(' 얼굴','');
   const contextsByArt=[
 ['Chaque famille compte '+a+' animaux comme celui du dessin. Il y a '+b+' familles.','Combien y a-t-il d’animaux en tout?',product+' animaux forment des familles de '+a+'. Combien de familles?',' animaux'],
 ['Chaque groupe reçoit '+a+' objets comme celui du dessin. Il y a '+b+' groupes.','Combien faut-il d’objets en tout?',product+' objets sont partagés en groupes de '+a+'. Combien de groupes?',' objets'],
 ['Chaque boîte contient '+a+' jouets comme celui du dessin. Il y a '+b+' boîtes.','Combien y a-t-il de jouets en tout?',product+' jouets sont rangés par '+a+' dans chaque boîte. Combien de boîtes?',' jouets'],
 ['On place '+a+' véhicules miniatures par rangée. Il y a '+b+' rangées.','Combien y a-t-il de véhicules en tout?',product+' véhicules sont placés par rangées de '+a+'. Combien de rangées?',' véhicules'],
 ['Chaque plateau contient '+a+' aliments comme celui du dessin. Il y a '+b+' plateaux.','Combien y a-t-il d’aliments en tout?',product+' aliments sont répartis par '+a+' sur chaque plateau. Combien de plateaux?',' aliments'],
 ['Chaque feuille porte '+a+' autocollants comme celui du dessin. Il y a '+b+' feuilles.','Combien y a-t-il d’autocollants en tout?',product+' autocollants sont répartis par '+a+' sur chaque feuille. Combien de feuilles?',' autocollants']
 ];
   const context=contextsByArt[storyKind];c.stem=context[0];c.ask=context[1];c.back=context[2];c.unit=context[3];
   prompt=c.stem+' '+c.ask;visual=badge;
task='Multiplication : □ × □ = □<br>Réponse : __________';answer=a+' × '+b+' = '+product+' ('+product+c.unit+')';reason='Multiplie le nombre par groupe par le nombre de groupes.';
   if(method==='pack'||method==='reverse'){prompt=c.back;task=eq(a+' × □ = '+product);answer=String(b);reason=a+' × '+b+' = '+product+'입니다.'}
   if(method==='team'){prompt=c.stem+' 준비물을 '+(product+a)+'개라고 계산했습니다. 맞는지 확인하고 고치세요.';task='맞으면 ○, 틀리면 ×: ____<br>Calcul corrigé : __________________';answer='×, '+a+' × '+b+' = '+product;reason='모둠 수보다 한 묶음 더 계산했습니다.'}
   if(method==='choose'){task='<div class="story-options">① '+a+' + '+b+'　② '+a+' × '+b+'</div>Opération : ____　Résultat : ____';answer='②, '+product+c.unit;reason='Il y a '+b+' groupes de '+a+' : on multiplie.'}
  }
  if(method==='compare'){const c=Math.min(9,b+1),first=a*b,second=a*c;prompt='두 사람이 모은 수를 비교해 기호를 쓰세요.';visual=badge+'<div>가: '+a+'개씩 '+b+'묶음<br>나: '+a+'개씩 '+c+'묶음</div>';task=eq('가 □ 나');answer=first===second?'=':'<';reason=first+'와 '+second+'를 비교합니다.'}
  if(method==='target'){const k=2+b%7;prompt='두 수 카드로 목표 수를 만드는 곱셈식을 쓰세요. 카드는 한 번씩 사용합니다.';visual=badge+'<div class="number-cards">'+[a,k,10].sort((x,y)=>x-y).map(x=>'<b>'+x+'</b>').join('')+'</div><div>목표 수: '+a*k+'</div>';task=eq('□ × □ = '+a*k);answer=a+' × '+k+' (또는 '+k+' × '+a+')';reason='두 수를 골라 곱한 값이 목표 수가 되는지 확인합니다.'}
  if(method==='chain'){const k=1+b%5;prompt='곱셈식의 규칙을 보고 이어질 식 두 개를 쓰세요.';visual=badge+eq(a+' × '+k+' = '+a*k)+eq(a+' × '+(k+1)+' = '+a*(k+1));task='__________ = ____<br>__________ = ____';answer=a+' × '+(k+2)+' = '+a*(k+2)+', '+a+' × '+(k+3)+' = '+a*(k+3);reason='곱하는 수는 1씩, 곱은 '+a+'씩 커집니다.'}
  if(method==='commute'){const k=Math.min(b,4);prompt='같은 배열을 가로와 세로로 묶어 식 두 개를 쓰세요.';visual=array(a,k,asset);task=eq('□ × □ = □')+eq('□ × □ = □');answer=a+' × '+k+' = '+a*k+', '+k+' × '+a+' = '+a*k;reason='묶어 보는 방향을 바꾸어도 전체 개수는 같습니다.'}
  if(method==='create'){const k=2+b%3;prompt=a+' × '+k+'에 맞게 묶음 그림을 그리세요. 점이나 간단한 그림으로 나타내도 됩니다.';visual=badge;task='<div class="kdraw"></div>';answer='예: '+a+'개씩 '+k+'묶음, 모두 '+a*k+'개';reason='한 묶음의 개수와 묶음 수를 확인합니다.';open=true}
  if(method==='zero-groups'){prompt='빈 바구니가 '+b+'개 있습니다. 물건은 모두 몇 개인가요?';visual=badge+'<div class="empty-count-basket">한 바구니에 0개</div>';task=eq('0 × '+b+' = □');answer='0';reason='빈 바구니가 여러 개 있어도 물건은 없습니다.'}
if(method==='zero-order'){prompt='곱하는 순서를 바꾸어 두 식을 완성하세요.';visual=badge;task=eq(b+' × 0 = □')+eq('0 × '+b+' = □');answer='0, 0';reason='어떤 수에 0을 곱해도 곱은 0입니다.'}
if(method==='zero-story'){prompt='한 봉지에 구슬이 '+b+'개씩 들어갑니다. 아직 한 봉지도 만들지 않았습니다. 담은 구슬은 모두 몇 개인가요?';visual=badge;task=eq(b+' × □ = □');answer=b+' × 0 = 0';reason='봉지 수가 0이므로 담은 구슬도 0개입니다.'}
if(!prompt||!answer)throw Error('미구현 구구단 활동 '+method);
  return {skill:'times',methodId:method,prompt,visual,task,answer,reason,open,check,artId:asset.id};
 }
 return spec.activities.map((s,i)=>({title:s.title,skill:'times',method:s.method,questions:Array.from({length:s.method==='facts'&&spec.tables.length===1?1:n},(_,j)=>question(s.method,j,i))}));
}
root.FrTimes={fiveProfiles:[{...bank.profiles[3],name:'La table de 5 : tableau, produit voisin et problèmes'}],generateFive(p,seed,n,ids=[]){if(p!==0)throw Error('Unsupported profile');exclusions=ids;return generate('2-2-2',3,seed,n)},sixProfiles:[{...bank.profiles[4],name:'La table de 6 : groupes, tableau et problèmes'}],generateSix(p,seed,n,ids=[]){if(p!==0)throw Error('Unsupported profile');exclusions=ids;return generate('2-2-2',4,seed,n)},twoProfiles:[{...bank.profiles[0],name:'La table de 2 : groupes, calculs et problèmes'}],generateTwo(p,seed,n,ids=[]){if(p!==0)throw Error('Unsupported profile');exclusions=ids;return generate('2-2-2',0,seed,n)},nineProfiles:[{...bank.profiles[7],name:'La table de 9 : avancer, compléter et vérifier'}],generateNine(p,seed,n,ids=[]){if(p!==0)throw Error('Unsupported profile');exclusions=ids;return generate('2-2-2',7,seed,n)},sevenProfiles:[{...bank.profiles[5],name:'La table de 7 : additionner, compléter et relier'}],generateSeven(p,seed,n,ids=[]){if(p!==0)throw Error('Unsupported profile');exclusions=ids;return generate('2-2-2',5,seed,n)},threeProfiles:[{...bank.profiles[1],name:'La table de 3 : additionner, avancer et relier'}],generateThree(p,seed,n,ids=[]){if(p!==0)throw Error('Unsupported profile');exclusions=ids;return generate('2-2-2',1,seed,n)},profiles:[{...bank.profiles[2],name:'La table de 4 : comprendre et vérifier'}],generate(p,seed,n,ids=[]){if(p!==0)throw Error('Unsupported profile');exclusions=ids;return generate('2-2-2',2,seed,n)}};
})(globalThis);
