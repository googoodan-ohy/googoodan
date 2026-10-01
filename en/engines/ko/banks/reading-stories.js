(function(root){
const base=root.KoMath,A=root.KoArt;
const targets=new Set(['1-1-3','1-2-2','1-2-4','1-2-6','2-1-3','3-1-1']);
const definitions=[
 ['무엇을 구하는 이야기일까요?',['total','initial','change']],
 ['같은 숫자, 다른 질문',['paired','compare-more','compare-less']],
 ['이야기와 식 연결하기',['choose-total','choose-initial','choose-change']],
 ['필요한 정보 골라 쓰기',['extra-label','extra-other','extra-age']],
 ['그림으로 관계 나타내기',['bar-total','bar-part','bar-difference']],
 ['질문을 만들고 확인하기',['question','claim','justify']]
];
const sheets=definitions.map(([name,methods])=>({name,activities:methods.map((method,i)=>({method,title:['이야기를 읽어요','조건을 살펴요','생각을 표현해요'][i]})),goal:'문장에서 구하는 양과 알려진 양의 관계를 판단하기'}));
let exclude=[];
const words={
'연필':['연필','자루'],'펜':['펜','자루'],'크레용':['크레용','개'],'붓':['붓','자루'],'펼치지 않은 책':['책','권'],'노트':['공책','권'],'지우개':['지우개','개'],'자':['자','개'],'삼각자':['삼각자','개'],'클립':['클립','개'],'주사위':['주사위','개'],'풍선':['풍선','개'],'선물':['선물 상자','개'],'테디 베어':['곰 인형','개'],'요요':['요요','개'],'축구공':['축구공','개'],'야구공':['야구공','개'],'배구공':['배구공','개'],'농구':['농구공','개'],'테니스':['테니스공','개'],'사탕':['사탕','개'],'롤리팝':['막대 사탕','개'],'쿠키':['쿠키','개'],'도넛':['도넛','개'],'컵케이크':['컵케이크','개'],'밤':['밤','개'],'빨간 사과':['사과','개'],'배':['배','개'],'귤':['귤','개'],'레몬':['레몬','개'],'딸기':['딸기','개'],'바나나':['바나나','개'],'당근':['당근','개'],'감자':['감자','개'],'고구마':['고구마','개'],'토마토':['토마토','개'],'달걀':['달걀','개'],'양파':['양파','개'],'만두':['만두','개'],'초밥':['초밥','개'],'빵':['빵','개'],'복숭아':['복숭아','개'],'선글라스':['선글라스','개'],'야구모자':['모자','개'],'양말':['양말','켤레'],'장갑':['장갑','켤레'],'우산':['우산','개'],'손전등':['손전등','개'],'열쇠':['열쇠','개'],'종':['종','개'],'비누':['비누','개'],'스펀지':['스펀지','개'],'바구니':['바구니','개'],'양동이':['양동이','개'],'의자':['의자','개'],'꽃다발':['꽃다발','개'],'튜립':['튤립','송이'],'장미꽃':['장미','송이'],'해바라기':['해바라기','송이'],'네잎클로버':['네잎클로버','개'],'퍼즐':['퍼즐','개'],'운동화':['운동화','켤레'],'학교 가방':['책가방','개'],'헤드폰':['헤드폰','개'],'마이크':['마이크','개'],'기타':['기타','개'],'바이올린':['바이올린','개'],'트럼펫':['트럼펫','개'],'드럼':['북','개'],'실타래':['실타래','개'],'연':['연','개']
};
const profiles=id=>targets.has(id)?base.profiles(id).concat(sheets):base.profiles(id);
function generate(id,p,seed,n=8){
 const count=base.profiles(id).length;if(!targets.has(id)||p<count)return base.generate(id,p,seed,n);
 const spec=sheets[p-count],u=KoCatalog.units.find(x=>x.id===id);
 let state=seed>>>0;const r=k=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return Math.floor(state/4294967296*k)},between=(a,b)=>a+r(b-a+1),art=A.session(seed,exclude);
 const max=id==='1-1-3'?9:id==='1-2-6'?99:u.grade===1?19:u.grade===2?199:999;
 return spec.activities.map(s=>({title:s.title,skill:s.method,questions:Array.from({length:n},(_,i)=>{
 const asset=art.take(x=>!!words[x.name]),[noun,unit]=words[asset.name],b=between(1,Math.max(1,Math.floor(max/3))),a=between(b+1,max-b),sum=a+b,difference=a-b;
 let prompt='',task='식: __________________<br>답: __________',answer='',reason='',open=false,visual='<span class="story-picture">'+A.icon(asset)+'</span>';
 const mode=s.method,initial=noun+' '+b+unit+'를 더 모았더니 모두 '+a+unit+'가 되었습니다. 처음에는 몇 '+unit+'가 있었나요?',
 total=noun+' '+a+unit+'가 있습니다. '+b+unit+'를 더 받았습니다. 지금은 모두 몇 '+unit+'인가요?',
 change=noun+' '+a+unit+'가 있었는데 지금은 '+b+unit+'가 남았습니다. 몇 '+unit+'를 사용했나요?';
 let expected=sum;
 if(mode==='total'||mode==='choose-total'||mode==='bar-total'){prompt=total;answer=a+' + '+b+' = '+sum+' / '+sum+unit;reason='처음 수와 더 받은 수를 모아 지금의 수를 구합니다.'}
 if(mode==='initial'||mode==='choose-initial'||mode==='bar-part'){prompt=initial;expected=difference;answer=a+' − '+b+' = '+difference+' / '+difference+unit;reason='모두 모인 수에서 더 모은 수를 빼야 처음 수를 알 수 있습니다.'}
 if(mode==='change'||mode==='choose-change'||mode==='bar-difference'){prompt=change;expected=difference;answer=a+' − '+b+' = '+difference+' / '+difference+unit;reason='처음 수에서 남은 수를 빼면 사용한 수입니다.'}
 if(mode==='paired'){prompt='① '+total+'\n② '+initial;task='① 식: ______________<br>② 식: ______________';answer='① '+a+' + '+b+' = '+sum+' ② '+a+' − '+b+' = '+difference;reason='숫자가 같아도 구하는 것이 지금의 수인지 처음 수인지에 따라 식이 달라집니다.'}
 if(mode==='compare-more'){prompt='도윤이는 '+noun+' '+a+unit+'를 모았습니다. 수아는 도윤이보다 '+b+unit+' 더 모았습니다. 수아는 몇 '+unit+'를 모았나요?';answer=a+' + '+b+' = '+sum;reason='기준인 도윤이의 수에 더 많은 양을 더합니다.'}
 if(mode==='compare-less'){prompt='수아는 '+noun+' '+a+unit+'를 모았습니다. 도윤이는 수아보다 '+b+unit+' 적게 모았습니다. 도윤이는 몇 '+unit+'를 모았나요?';expected=difference;answer=a+' − '+b+' = '+difference;reason='기준인 수아의 수에서 적은 양을 뺍니다.'}
 if(mode.startsWith('choose-')){const options=[a+' + '+b,a+' − '+b],swap=r(2);if(swap)options.reverse();task=options.map((x,j)=>['① ','② '][j]+x).join('　')+'<br>맞는 식에 동그라미 하고 답을 쓰세요: ____';answer=(options.indexOf(a+(mode==='choose-total'?' + ':' − ')+b)===0?'①':'②')+', '+expected+unit;reason+=' ‘더’라는 말이 있어도 무엇을 구하는지 확인합니다.'}
 if(mode.startsWith('extra-')){const unused=between(2,9),variant=i%3;const relation=variant===0?total:variant===1?initial:change;prompt=mode==='extra-label'?'상자 번호는 '+unused+'번입니다. '+relation:mode==='extra-other'?relation+' 옆에는 스티커 '+unused+'장도 있습니다.':unused+'살 동생과 정리를 합니다. '+relation;expected=variant===0?sum:difference;task='필요한 두 수: ____, ____<br>식: __________________';answer=a+', '+b+' / '+a+(variant===0?' + ':' − ')+b+' = '+expected;reason=(mode==='extra-label'?'상자 번호':mode==='extra-other'?'다른 물건의 개수':'동생의 나이')+'는 이 질문의 계산에 필요하지 않습니다.'}
 if(mode.startsWith('bar-')){const whole=mode==='bar-total'?'□':a,left=mode==='bar-total'?a:'□',right=b;visual+='<div class="story-bar"><div>전체 '+whole+'</div><div><span>'+left+'</span><span>'+right+'</span></div></div>';prompt+=' 그림의 □도 채우세요.'}
 if(mode==='question'){prompt=noun+' '+a+unit+'를 준비하고 '+b+unit+'를 더 준비했습니다. 이 상황에 맞는 질문을 만들고 스스로 답해 보세요.';task='내 질문: __________________<br>__________________________<br>식과 답: __________________';answer='예: 모두 몇 '+unit+'인가요? '+a+' + '+b+' = '+sum;reason='질문과 식, 답이 서로 맞으면 다른 질문도 가능합니다.';open=true}
 if(mode==='claim'){prompt=initial+' 친구는 “더 모았으니 '+a+' + '+b+'를 계산하면 돼.”라고 말했습니다. 친구의 생각을 고치세요.';expected=difference;answer=a+' − '+b+' = '+difference;reason='구하는 것은 더 모으기 전의 수입니다. 지금의 수에서 더 모은 수를 빼야 합니다.'}
 if(mode==='justify'){prompt=change+' 왜 그 식을 골랐는지도 쓰세요.';expected=difference;task+=' <div class="kreason">이유: __________________</div>';answer=a+' − '+b+' = '+difference;reason='처음 수 = 사용한 수 + 남은 수 관계를 이용합니다.';open=true}
 prompt=prompt.replaceAll('권를','권을').replaceAll('권가','권이');
 return {methodId:mode,skill:mode,prompt,visual,task,answer,reason,open,artId:asset.id,check:{kind:'reading-story',a,b,sum,difference,expected,method:mode}};
 })}));
}
root.KoMath={...base,profiles,generate,excludeArt:ids=>{exclude=ids;base.excludeArt(ids)}};
})(globalThis);
