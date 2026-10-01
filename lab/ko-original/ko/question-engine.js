(function(root){
const old=root.KoMath,bank=root.KoMultiplicationBank,A=root.KoArt;
let exclusions=[];
const blank='<span class="kblank"></span>',eq=s=>'<div class="kequation">'+s+'</div>';
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
function profiles(id){if(KoEarlyArithmetic.banks[id])return KoEarlyArithmetic.banks[id];if(id==='5-1-4')return KoFractions.profiles;if(id==='1-1-1')return KoEarlyNumbers.profiles;return id==='2-2-2'?bank.profiles:KoCoreBank.banks[id]}
function generate(id,p,seed,n=8){
 if(KoEarlyArithmetic.banks[id])return KoEarlyArithmetic.generate(id,p,seed,n,exclusions);
 if(id==='5-1-4')return KoFractions.generate(p,seed,n,exclusions);
 if(id==='1-1-1')return KoEarlyNumbers.generate(p,seed,n,exclusions);
 if(id!=='2-2-2')return KoCoreBank.generate(id,p,seed,n,exclusions);
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
  if(method==='facts'){prompt='구구단을 완성하세요.';visual=badge;task=eq(a+' × '+b+' = □');answer=String(product);reason=a+'씩 '+b+'묶음은 '+product+'입니다.'}
  if(method==='facts'&&spec.tables.length===1){prompt=a+'단을 1부터 9까지 완성하세요.';task='<div class="facts-nine">'+Array.from({length:9},(_,j)=>'<span>'+a+' × '+(j+1)+' = □</span>').join('')+'</div>';answer=Array.from({length:9},(_,j)=>a*(j+1)).join(', ');reason='곱하는 수가 1씩 커지면 답은 '+a+'씩 커집니다.'}
  if(method==='groups'){const g=Math.min(b,4);prompt='그림을 보고 한 묶음의 수와 묶음 수를 식으로 쓰세요.';visual=groups(a,g,asset);task=eq('□ × □ = □');answer=a+' × '+g+' = '+a*g;reason=a+'개씩 '+g+'묶음입니다.';check.product=a*g;check.b=g}
  if(method==='repeated'){const g=2+b%4;prompt='같은 수를 여러 번 더한 식을 곱셈식으로 바꾸세요.';visual=badge+eq(Array(g).fill(a).join(' + '));task=eq('□ × □ = □');answer=a+' × '+g+' = '+a*g;reason=a+'를 '+g+'번 더합니다.';check.product=a*g;check.b=g}
  if(method==='array'){const g=Math.min(b,5);prompt='한 줄에 있는 수 × 줄 수로 나타내세요.';visual=array(a,g,asset);task=eq('□ × □ = □');answer=a+' × '+g+' = '+a*g;reason='한 줄에 '+a+'개씩 '+g+'줄입니다.';check.product=a*g;check.b=g}
  if(method==='jump'){const g=2+b%4;prompt=a+'씩 뛰었습니다. 도착한 수와 곱셈식을 쓰세요.';visual=badge+'<svg class="concept-art" viewBox="0 0 250 48"><path d="M10 32H240" stroke="#597889"/>'+Array.from({length:g+1},(_,j)=>'<path d="M'+(15+j*220/g)+' 28v8" stroke="#597889"/><text x="'+(15+j*220/g)+'" y="47" font-size="11" text-anchor="middle">'+(j===g?'□':j*a)+'</text>'+(j<g?'<path d="M'+(15+j*220/g)+' 28q'+110/g+' -32 '+220/g+' 0" fill="none" stroke="#278477"/>':'')).join('')+'</svg>';task=eq('□ × □ = □');answer=a+' × '+g+' = '+a*g;reason='0에서 '+a+'씩 '+g+'번 뛰면 '+a*g+'입니다.';check.product=a*g;check.b=g}
  if(method==='missing'){prompt='가려진 묶음 수를 찾으세요.';visual=badge;task=eq(a+' × □ = '+product);answer=String(b);reason=a+'단에서 '+product+'이 되는 곱셈을 찾습니다.'}
  if(method==='error'){const wrong=product+(r(2)?a:1);prompt='계산에서 틀린 곳을 찾아 바르게 고치세요.';visual=badge+eq(a+' × '+b+' = '+wrong);task='바른 식: __________________';answer=a+' × '+b+' = '+product;reason=a+'씩 '+b+'묶음이므로 '+product+'입니다.'}
  if(method==='table'){const start=1+b%6;prompt=a+'단 표의 빈칸을 모두 채우세요.';visual=badge+'<table class="ktable"><tr><th>곱하는 수</th>'+[start,start+1,start+2].map(x=>'<td>'+x+'</td>').join('')+'</tr><tr><th>'+a+'단</th><td>□</td><td>'+a*(start+1)+'</td><td>□</td></tr></table>';task='';answer=a*start+', '+a*(start+2);reason='곱하는 수가 1 늘면 곱은 '+a+'만큼 커집니다.'}
  if(method==='neighbor'){const k=2+b%7;prompt='알고 있는 곱셈을 이용해 다음 곱셈을 완성하세요.';visual=badge+eq(a+' × '+k+' = '+a*k);task=eq(a+' × '+(k+1)+' = '+a*k+' + □ = □');answer=a+', '+a*(k+1);reason='한 묶음 '+a+'개를 더합니다.'}
  if(method==='match'){const k=1+b%7, vals=[a*k,a*(k+1),a*(k+2)],offset=r(3),choices=vals.slice(offset).concat(vals.slice(0,offset));prompt='곱셈식과 같은 값끼리 선으로 이으세요.';visual=badge+'<div class="match-columns"><div>'+[k,k+1,k+2].map(x=>'<p>'+a+' × '+x+' ●</p>').join('')+'</div><div>'+choices.map(x=>'<p>● '+x+'</p>').join('')+'</div></div>';task='';answer=[k,k+1,k+2].map(x=>a+' × '+x+' → '+a*x).join(' / ');reason='각 식의 곱을 먼저 구합니다.'}
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
    ['한 가족에 '+name+' '+a+'마리씩 있습니다. '+b+'가족이 소풍을 갔습니다.','모두 몇 마리인가요?',name+' '+product+'마리가 한 가족에 '+a+'마리씩 모였습니다. 몇 가족인가요?','마리'],
    ['한 모둠에 그림 속 물건을 '+a+'개씩 나누어 줍니다. '+b+'모둠에 나누어 주려 합니다.','물건은 모두 몇 개 필요한가요?','그림 속 물건 '+product+'개를 한 모둠에 '+a+'개씩 나누어 주었습니다. 몇 모둠인가요?','개'],
    ['그림 속 놀이 도구를 한 상자에 '+a+'개씩 담았습니다. 상자가 '+b+'개 있습니다.','도구는 모두 몇 개인가요?','그림 속 놀이 도구 '+product+'개를 상자마다 '+a+'개씩 담았습니다. 몇 상자인가요?','개'],
    ['장난감 탈것을 한 줄에 '+a+'대씩 놓았습니다. '+b+'줄로 놓았습니다.','장난감은 모두 몇 대인가요?','장난감 탈것 '+product+'대를 한 줄에 '+a+'대씩 놓았습니다. 몇 줄인가요?','대'],
    ['그림 속 음식을 한 쟁반에 '+a+'개씩 담았습니다. 쟁반이 '+b+'개 있습니다.','음식은 모두 몇 개인가요?','그림 속 음식 '+product+'개를 한 쟁반에 '+a+'개씩 담았습니다. 몇 쟁반인가요?','개'],
    ['그림 속 모습을 스티커로 만들었습니다. 한 장에 '+a+'개씩 붙인 스티커 종이가 '+b+'장 있습니다.','스티커는 모두 몇 개인가요?','스티커 '+product+'개를 한 장에 '+a+'개씩 붙였습니다. 종이는 몇 장인가요?','개']
   ];
   const context=contextsByArt[storyKind];c.stem=context[0];c.ask=context[1];c.back=context[2];c.unit=context[3];
   prompt=c.stem+' '+c.ask;visual=badge;
task='곱셈식: □ × □ = □<br>답: __________';answer=a+' × '+b+' = '+product+' ('+product+c.unit+')';reason='한 묶음의 수에 묶음 수를 곱합니다.';
   if(method==='pack'||method==='reverse'){prompt=c.back;task=eq(a+' × □ = '+product);answer=String(b);reason=a+' × '+b+' = '+product+'입니다.'}
   if(method==='team'){prompt=c.stem+' 준비물을 '+(product+a)+'개라고 계산했습니다. 맞는지 확인하고 고치세요.';task='맞으면 ○, 틀리면 ×: ____<br>바른 식: __________________';answer='×, '+a+' × '+b+' = '+product;reason='모둠 수보다 한 묶음 더 계산했습니다.'}
   if(method==='choose'){task='<div class="story-options">① '+a+' + '+b+'　② '+a+' × '+b+'</div>맞는 식: ____　계산한 답: ____';answer='②, '+product+c.unit;reason='같은 수 '+a+'가 '+b+'묶음이므로 곱셈입니다.'}
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
root.KoMath={...old,profiles,generate,excludeArt:ids=>{exclusions=ids}};
})(globalThis);
