(function(root){
'use strict';
const supportedDenominators=new Set([2,3,4,5,6,8,10,12]);
function generate(type,seed){
 if(type.bank==='verified-decimal-scaling'){
  if(type.id!=='word-problems-decimal-scaling'||type.count!==4)throw Error('Unsupported decimal scaling set');
  return root.DecimalScalingOriginals.select(seed).map(q=>({...q,a:Number(q.a),b:Number(q.b),op:'×',answer:q.answerDecimal,answerUnit:'meters',prompt:'One ribbon is '+q.a+' meters long. A second ribbon is '+q.b+' times as long. How long is the second ribbon?',work:q.a+' × '+q.b+' = '+q.answerDecimal}));
 }

 if((type.id==='word-problems-division-remainders'||type.id==='word-problems-two-digit-division')&&type.activity==='smaller-remainders'){
  const twoDigit=type.id==='word-problems-two-digit-division',minDivisor=twoDigit?10:2,maxDivisor=twoDigit?99:9;
  if(type.smallerRemainderSourceProfile!==(twoDigit?'4-1-3--39':'3-2-3--29')||type.count!==4)throw Error('Unsupported smaller remainder source');
  const questions=[],seen=new Set();
  for(let pass=0;pass<32&&questions.length<4;pass++){
   const sourceSeed=(seed+pass)>>>0;root.SharedDrillStories.generate(type.smallerRemainderSourceProfile,sourceSeed,48).forEach((q,sourceIndex)=>{
    const m=q.prompt.match(/^([0-9]+)개를 한 묶음에 ([0-9]+)개씩 묶습니다\. 몇 묶음이고 몇 개가 남나요\?$/);if(!m)return;
    const a=+m[1],b=+m[2],quotient=Math.floor(a/b),remainder=a%b;
    if(!Number.isSafeInteger(a)||!Number.isSafeInteger(b)||b<1||q.answer!==quotient+'묶음, '+remainder+'개'||q.work!==a+' ÷ '+b+' = '+quotient+' 나머지 '+remainder)throw Error('Original smaller remainder mismatch');
    if(a<10||a>999||b<minDivisor||b>maxDivisor||quotient<1||remainder<1||remainder>=b||questions.length===4||seen.has(a+':'+b))return;seen.add(a+':'+b);
    questions.push({...q,prompt:'A total of '+a+' items is packed in groups of '+b+'. How many complete groups are there, and how many items are left?',a,b,op:'÷',answer:quotient+' R '+remainder,work:a+' ÷ '+b+' = '+quotient+' R '+remainder,division:{quotient,remainder,quotientLabel:'Complete groups:',remainderLabel:'Items left:'},sourceProfile:type.smallerRemainderSourceProfile,sourcePrompt:q.prompt,sourceAnswer:q.answer,sourceWork:q.work,sourceSeed,sourceIndex});
   });
  }
  if(questions.length!==4)throw Error('Insufficient original smaller remainder questions');return questions;
 }
 if(type.id==='word-problems-multiplication-division'&&(type.activity==='two-digit-groups'||type.activity==='three-digit-groups')){
  const three=type.activity==='three-digit-groups',groupSource=three?type.threeDigitGroupsSourceProfile:type.twoDigitGroupsSourceProfile;
  if(groupSource!==(three?'3-2-1--23':'3-1-4--19'))throw Error('Unsupported group-total source');
  const questions=[],seen=new Set();
  for(let pass=0;pass<32&&questions.length<4;pass++){
   const sourceSeed=(seed+pass)>>>0;root.SharedDrillStories.generate(groupSource,sourceSeed,48).forEach((q,sourceIndex)=>{
    const m=q.prompt.match(/^한 묶음의 양이 (\d+)입니다\. (\d+)묶음에 해당하는 양은 얼마인가요\?$/);if(!m)return;
    const a=+m[1],b=+m[2],answer=+q.answer;
    if(!Number.isSafeInteger(answer)||answer!==a*b||q.work!==a+' × '+b+' = '+q.answer)throw Error('Original two-digit group mismatch');
    if((three?a<100||a>999:a<10||a>99)||b<1||b>9||questions.length===4||b===1&&questions.some(item=>item.b===1)||seen.has(a+':'+b))return;seen.add(a+':'+b);
    questions.push({...q,prompt:'Each group has '+a+' items. There '+(b===1?'is 1 group':'are '+b+' groups')+'. How many items are there in all?',a,b,answer,op:'×',...(three?{threeDigitGroupStory:true}:{twoDigitGroupStory:true}),sourceProfile:groupSource,sourcePrompt:q.prompt,sourceAnswer:q.answer,sourceWork:q.work,sourceSeed,sourceIndex});
   });
  }
  if(questions.length!==4)throw Error('Insufficient original two-digit group questions');return questions;
 }

 if(type.id==='word-problems-two-digit-division'&&type.activity==='exact-two-digit-sharing'){
  if(type.exactSharingSourceProfile!=='3-2-1--23'||type.count!==4)throw Error('Unsupported exact sharing source');
  const questions=[],seen=new Set();
  for(let pass=0;pass<32&&questions.length<4;pass++){
   const sourceSeed=(seed+pass)>>>0;root.SharedDrillStories.generate(type.exactSharingSourceProfile,sourceSeed,48).forEach((q,sourceIndex)=>{
    const m=q.prompt.match(/^전체 양 (\d+)을 (\d+)묶음으로 똑같이 나누면 한 묶음의 양은 얼마인가요\?$/);if(!m)return;
    const a=+m[1],b=+m[2],answer=+q.answer;
    if(!Number.isSafeInteger(answer)||answer*b!==a||q.work!==a+' ÷ '+b+' = '+q.answer)throw Error('Original exact sharing mismatch');
    if(b<10||b>99||answer<10||answer>99||a>9801||questions.length===4||seen.has(a+':'+b))return;seen.add(a+':'+b);
    questions.push({...q,prompt:'A total of '+a+' is shared equally among '+b+' groups. How much is in each group?',a,b,answer,op:'÷',groupDivisionMethod:'size',twoDigitSharingStory:true,answerUnit:'in each group',sourceProfile:type.exactSharingSourceProfile,sourcePrompt:q.prompt,sourceAnswer:q.answer,sourceWork:q.work,sourceSeed,sourceIndex});
   });
  }
  if(questions.length!==4)throw Error('Insufficient original exact sharing questions');return questions;
 }

 if(type.id==='word-problems-two-digit-division'&&type.activity==='exact-small-groups'){
  if(type.smallGroupingSourceProfile!=='3-1-4--19'||type.count!==4)throw Error('Unsupported small grouping source');
  const questions=[],seen=new Set();
  for(let pass=0;pass<32&&questions.length<4;pass++){
   const sourceSeed=(seed+pass)>>>0;root.SharedDrillStories.generate(type.smallGroupingSourceProfile,sourceSeed,48).forEach((q,sourceIndex)=>{
    const m=q.prompt.match(/^전체 양 (\d+)을 (\d+)씩 나누면 몇 묶음인가요\?$/);if(!m)return;
    const a=+m[1],b=+m[2],answer=+q.answer;
    if(!Number.isSafeInteger(answer)||answer*b!==a||q.work!==a+' ÷ '+b+' = '+q.answer)throw Error('Original small grouping mismatch');
    if(b<10||b>99||answer<1||answer>9||questions.length===4||answer===1&&questions.some(item=>item.answer===1)||seen.has(a+':'+b))return;seen.add(a+':'+b);
    questions.push({...q,prompt:'A total of '+a+' is divided into groups of '+b+'. How many groups are there?',a,b,answer,op:'÷',groupDivisionMethod:'count',smallGroupingStory:true,answerUnit:'groups',sourceProfile:type.smallGroupingSourceProfile,sourcePrompt:q.prompt,sourceAnswer:q.answer,sourceWork:q.work,sourceSeed,sourceIndex});
   });
  }
  if(questions.length!==4)throw Error('Insufficient original small grouping questions');return questions;
 }

 if(type.id==='word-problems-equal-groups-division'&&type.activity==='larger-shares'){
  if(type.largerSharingSourceProfile!=='3-1-4--19'||type.count!==4)throw Error('Unsupported larger sharing source');
  const questions=[],seen=new Set();
  for(let pass=0;pass<32&&questions.length<4;pass++){
   const sourceSeed=(seed+pass)>>>0;root.SharedDrillStories.generate(type.largerSharingSourceProfile,sourceSeed,48).forEach((q,sourceIndex)=>{
    const m=q.prompt.match(/^전체 양 (\d+)을 (\d+)묶음으로 똑같이 나누면 한 묶음의 양은 얼마인가요\?$/);if(!m)return;
    const a=+m[1],b=+m[2],answer=+q.answer;
    if(!Number.isSafeInteger(answer)||answer*b!==a||q.work!==a+' ÷ '+b+' = '+q.answer)throw Error('Original larger sharing mismatch');
    if(b<2||b>9||answer<10||answer>99||questions.length===4||seen.has(a+':'+b))return;seen.add(a+':'+b);
    questions.push({...q,prompt:'A total of '+a+' is shared equally among '+b+' groups. How much is in each group?',a,b,answer,op:'÷',groupDivisionMethod:'size',largerSharingStory:true,answerUnit:'in each group',sourceProfile:type.largerSharingSourceProfile,sourcePrompt:q.prompt,sourceAnswer:q.answer,sourceWork:q.work,sourceSeed,sourceIndex});
   });
  }
  if(questions.length!==4)throw Error('Insufficient original larger sharing questions');return questions;
 }

 if(type.id==='word-problems-difference-within-100'&&type.activity==='within-1000'){
  if(type.largerDifferenceSourceProfile!=='3-1-1--20'||type.count!==4)throw Error('Unsupported thousand comparison source');
  const questions=[],seen=new Set();
  for(let pass=0;pass<32&&questions.length<4;pass++){
   const sourceSeed=(seed+pass)>>>0;root.SharedDrillStories.generate(type.largerDifferenceSourceProfile,sourceSeed,48).forEach((q,sourceIndex)=>{
    const m=q.prompt.match(/^(\d+)은 (\d+)보다 얼마나 작은가요\?$/);if(!m)return;const b=+m[1],a=+m[2],answer=+q.answer;
    if(!Number.isSafeInteger(answer)||answer!==a-b||q.work!==a+' − '+b+' = '+q.answer)throw Error('Original thousand difference mismatch');
    if(b<100||a<=100||a>1000||a<=b||questions.length===4||seen.has(a+':'+b))return;seen.add(a+':'+b);
    questions.push({...q,prompt:'How much less is '+b+' than '+a+'?',a,b,answer,op:'−',comparisonDifferenceStory:true,comparisonBarStory:true,thousandDifferenceStory:true,sourceProfile:type.largerDifferenceSourceProfile,sourcePrompt:q.prompt,sourceAnswer:q.answer,sourceWork:q.work,sourceSeed,sourceIndex});
   });
  }
  if(questions.length!==4)throw Error('Insufficient original thousand comparison questions');return questions;
 }

 if(type.id==='word-problems-difference-within-100'&&type.activity==='crossing-100'){
  if(type.crossing100SourceProfile!=='5-1-1--12'||type.count!==4)throw Error('Unsupported crossing100 source');
  const questions=[],seen=new Set();
  for(let pass=0;pass<32&&questions.length<4;pass++){
   const sourceSeed=(seed+pass)>>>0;
   root.SharedDrillStories.generate(type.crossing100SourceProfile,sourceSeed,48).forEach((q,sourceIndex)=>{
    const m=q.prompt.match(/^(\d+)은 (\d+)보다 얼마나 작은가요\?$/);if(!m)return;
    const known=+m[1],whole=+m[2],answer=+q.answer;
    if(!Number.isSafeInteger(answer)||answer!==whole-known||q.work!==whole+' − '+known+' = '+q.answer)throw Error('Original crossing100 mismatch');
    if(known<10||known>99||whole<=100||whole>198||answer<10||answer>99||questions.length===4||seen.has(whole+':'+known))return;
    seen.add(whole+':'+known);questions.push({...q,prompt:'How much less is '+known+' than '+whole+'?',a:whole,b:known,answer,op:'−',comparisonDifferenceStory:true,comparisonBarStory:true,thousandDifferenceStory:true,sourceProfile:type.crossing100SourceProfile,sourcePrompt:q.prompt,sourceAnswer:q.answer,sourceWork:q.work,sourceSeed,sourceIndex});
   });
  }
  if(questions.length!==4)throw Error('Insufficient original crossing100 questions');return questions;
 }
 if(type.id==='word-problems-missing-part-within-100'&&type.activity==='crossing-100'){
  if(type.crossing100SourceProfile!=='5-1-1--12'||type.count!==4)throw Error('Unsupported crossing100 source');
  const questions=[],seen=new Set();
  for(let pass=0;pass<32&&questions.length<4;pass++){
   const sourceSeed=(seed+pass)>>>0;
   root.SharedDrillStories.generate(type.crossing100SourceProfile,sourceSeed,48).forEach((q,sourceIndex)=>{
    const m=q.prompt.match(/^(\d+)에 어떤 수를 더했더니 (\d+)이 되었습니다\. 어떤 수인가요\?$/);if(!m)return;
    const known=+m[1],whole=+m[2],answer=+q.answer;
    if(!Number.isSafeInteger(answer)||answer!==whole-known||q.work!==whole+' − '+known+' = '+q.answer)throw Error('Original crossing100 mismatch');
    if(known<10||known>99||whole<=100||whole>198||answer<10||answer>99||questions.length===4||seen.has(whole+':'+known))return;
    seen.add(whole+':'+known);questions.push({...q,prompt:'A number was added to '+known+' to make '+whole+'. What number was added?',a:whole,b:known,answer,op:'−',missingPartStory:true,missingPartMethod:'change',largerMissingPartStory:true,sourceProfile:type.crossing100SourceProfile,sourcePrompt:q.prompt,sourceAnswer:q.answer,sourceWork:q.work,sourceSeed,sourceIndex});
   });
  }
  if(questions.length!==4)throw Error('Insufficient original crossing100 questions');return questions;
 }
 if(type.id==='word-problems-missing-part-within-100'&&type.activity==='within-1000'){
  if(type.largerPartSourceProfile!=='3-1-1--20'||type.count!==4)throw Error('Unsupported larger missing-part source');
  const buckets={change:[],part:[]},seen=new Set();let zeros=0;
  for(let pass=0;pass<32&&(buckets.change.length<2||buckets.part.length<2);pass++){
   const sourceSeed=(seed+pass)>>>0;root.SharedDrillStories.generate(type.largerPartSourceProfile,sourceSeed,48).forEach((q,sourceIndex)=>{
    let m=q.prompt.match(/^(\d+)이 (\d+)이 되려면 얼마가 더 필요한가요\?$/),method=m?'change':null,known=m?+m[1]:0,whole=m?+m[2]:0;
    if(!m){m=q.prompt.match(/^두 양을 합하면 (\d+)입니다\. 한 양이 (\d+)이면 나머지는 얼마인가요\?$/);if(m){method='part';whole=+m[1];known=+m[2];}}
    if(!m)return;const answer=+q.answer;if(!Number.isSafeInteger(answer)||answer!==whole-known||q.work!==whole+' − '+known+' = '+q.answer)throw Error('Original larger missing-part mismatch');
    if(whole<=100||whole>1000||known<100||known>whole||buckets[method].length===2||seen.has(whole+':'+known)||answer===0&&zeros)return;
    seen.add(whole+':'+known);if(answer===0)zeros++;
    const prompt=method==='change'?'How much more is needed to change '+known+' to '+whole+'?':'Two amounts total '+whole+'. One amount is '+known+'. What is the other amount?';
    buckets[method].push({...q,prompt,a:whole,b:known,answer,op:'−',missingPartStory:true,missingPartMethod:method,largerMissingPartStory:true,sourceProfile:type.largerPartSourceProfile,sourcePrompt:q.prompt,sourceAnswer:q.answer,sourceWork:q.work,sourceSeed,sourceIndex});
   });
  }
  if(buckets.change.length!==2||buckets.part.length!==2)throw Error('Insufficient larger missing-part questions');return [buckets.change[0],buckets.part[0],buckets.change[1],buckets.part[1]];
 }

 if(type.id==='word-problems-multiplication-division'&&type.activity==='zero-one-groups'){
  if(type.groupIdentitySourceProfile!=='2-2-2--16')throw Error('Unsupported zero-and-one source');
  const buckets={empty:[],singleGroup:[],singleItem:[],regular:[]},seen=new Set();
  for(let pass=0;pass<64&&Object.values(buckets).some(x=>!x.length);pass++){
   const sourceSeed=(seed+pass)>>>0;root.SharedDrillStories.generate(type.groupIdentitySourceProfile,sourceSeed,48).forEach((q,sourceIndex)=>{
    const m=q.prompt.match(/^한 묶음의 양이 (\d+)입니다\. (\d+)묶음에 해당하는 양은 얼마인가요\?$/);if(!m)return;
    const a=+m[1],b=+m[2],answer=+q.answer;if(!Number.isSafeInteger(answer)||answer!==a*b||q.work!==a+' × '+b+' = '+q.answer)throw Error('Original zero-and-one group mismatch');
    if(a<0||a>9||b<1||b>5)return;const kind=a===0&&b>1?'empty':a>1&&b===1?'singleGroup':a===1&&b>1?'singleItem':a>1&&b>1?'regular':null;
    if(!kind||buckets[kind].length||seen.has(a+':'+b))return;seen.add(a+':'+b);
    buckets[kind].push({...q,a,b,answer,op:'×',identityGroupStory:true,identityGroupKind:kind,prompt:'Each group has '+a+' '+(a===1?'item':'items')+'. There '+(b===1?'is 1 group':'are '+b+' groups')+'. How many items are there in all?',sourceProfile:type.groupIdentitySourceProfile,sourcePrompt:q.prompt,sourceAnswer:q.answer,sourceWork:q.work,sourceSeed,sourceIndex});
   });
  }
  if(Object.values(buckets).some(x=>!x.length))throw Error('Insufficient original zero-and-one group questions');return [buckets.regular[0],buckets.empty[0],buckets.singleGroup[0],buckets.singleItem[0]];
 }

 if(type.id==='kindergarten-missing-part-bonds'&&type.activity==='zero-parts'){
  if(type.zeroPartSourceProfile!=='1-1-3--7'||type.zeroPartBoundarySourceProfile!=='1-2-4--7'||type.count!==4)throw Error('Unsupported empty-part activity');
  const art=root.KoArt.items.find(x=>x.id==='1f34e');if(!art)throw Error('Original apple art unavailable');
  function select(sourceProfile,boundary){
   const buckets={known:[],missing:[]};
   for(let pass=0;pass<64&&(!buckets.known.length||!buckets.missing.length);pass++){
    const sourceSeed=(seed+pass)>>>0;root.SharedDrillStories.generate(sourceProfile,sourceSeed,48).forEach((q,sourceIndex)=>{
     const m=q.prompt.match(/^두 양을 합하면 (\d+)입니다\. 한 양이 (\d+)이면 나머지는 얼마인가요\?$/);if(!m)return;const a=+m[1],b=+m[2],answer=+q.answer;
     if(!Number.isSafeInteger(answer)||answer!==a-b||q.work!==a+' − '+b+' = '+q.answer)throw Error('Original empty-part mismatch');
     if((boundary?a!==1&&a!==10:a<2||a>9)||b!==0&&answer!==0)return;const bucket=b===0?'known':'missing';if(buckets[bucket].length)return;
     buckets[bucket].push({...q,a,b,answer,op:'split-pictures',zeroPartActivity:true,prompt:b===0?'Circle no pictures. Find the other part.':b===1?'Circle the picture. Find the other part.':'Circle all '+b+' pictures. Find the other part.',visual:'<div class="picture-count">'+Array.from({length:a},()=>root.KoArt.icon(art)).join('')+'</div>',sourceProfile,sourcePrompt:q.prompt,sourceAnswer:q.answer,sourceWork:q.work,sourceSeed,sourceIndex});
    });
   }
   if(!buckets.known.length||!buckets.missing.length)throw Error('Insufficient original empty-part questions');return buckets;
  }
  const middle=select(type.zeroPartSourceProfile,false),boundary=select(type.zeroPartBoundarySourceProfile,true);
  return [middle.known[0],boundary.missing[0],boundary.known[0],middle.missing[0]];
 }

 if(type.bank==='korean-drill-stories'){
  if(type.sourceProfile==='2-2-2--16'&&type.response==='whole-scaling'){
   const twoDigit=type.activity==='two-digit-reference',twoDigitMultiplier=type.activity==='two-digit-multiplier',scalingSource=twoDigitMultiplier?type.twoDigitMultiplierScalingSourceProfile:twoDigit?type.twoDigitScalingSourceProfile:type.sourceProfile;
   if(twoDigit&&scalingSource!=='3-1-4--19')throw Error('Unsupported two-digit comparison source');
   if(twoDigitMultiplier&&scalingSource!=='3-2-1--23')throw Error('Unsupported two-digit multiplier comparison source');
   if(type.count!==4)throw Error('Whole scaling set requires four questions');
   if(twoDigitMultiplier){
    const questions=[],seen=new Set();let roundTens=0;
    for(let pass=0;pass<32&&questions.length<4;pass++){
     const sourceSeed=(seed+pass)>>>0;root.SharedDrillStories.generate(scalingSource,sourceSeed,48).forEach((q,sourceIndex)=>{
      const m=q.prompt.match(/^(\d+)의 (\d+)배에 해당하는 수를 구하세요\.$/);if(!m)return;
      const a=+m[1],b=+m[2],answer=+q.answer;
      if(!Number.isSafeInteger(answer)||answer!==a*b||q.work!==a+' × '+b+' = '+q.answer)throw Error('Original two-digit multiplier scaling mismatch');
      if(a<10||a>99||b<10||b>99||questions.length===4||b%10===0&&roundTens||seen.has(a+':'+b))return;
      seen.add(a+':'+b);if(b%10===0)roundTens++;
      questions.push({...q,prompt:'An amount is '+a+'. A second amount is '+b+' times as much. What is the second amount?',a,b,answer,op:'×',wholeScalingStory:true,twoDigitMultiplierScalingStory:true,sourceProfile:scalingSource,sourcePrompt:q.prompt,sourceAnswer:q.answer,sourceWork:q.work,sourceSeed,sourceIndex});
     });
    }
    if(questions.length!==4)throw Error('Insufficient original two-digit multiplier comparisons');return questions;
   }
   const buckets={one:[],many:[]},seen=new Set();
   for(let pass=0;pass<64&&(!buckets.one.length||buckets.many.length<3);pass++){
    const sourceSeed=(seed+pass)>>>0;root.SharedDrillStories.generate(scalingSource,sourceSeed,48).forEach((q,sourceIndex)=>{
     const m=q.prompt.match(/^(\d+)의 (\d+)배에 해당하는 수를 구하세요\.$/);if(!m)return;
     const a=+m[1],b=+m[2],answer=+q.answer;
     if(!Number.isSafeInteger(answer)||answer!==a*b||q.work!==a+' × '+b+' = '+q.answer)throw Error('Original whole scaling mismatch');
     const bucket=b===1?'one':'many';if((twoDigit?a<10||a>99:a<1||a>9)||b<1||b>9||buckets[bucket].length===(bucket==='one'?1:3)||seen.has(a+':'+b))return;seen.add(a+':'+b);
     buckets[bucket].push({...q,prompt:'An amount is '+a+'. A second amount is '+b+' times as much. What is the second amount?',a,b,answer,op:'×',wholeScalingStory:true,...(twoDigit?{sourceProfile:scalingSource,twoDigitScalingStory:true}:{}),sourcePrompt:q.prompt,sourceAnswer:q.answer,sourceWork:q.work,sourceSeed,sourceIndex});
    });
   }
   if(buckets.one.length!==1||buckets.many.length!==3)throw Error('Insufficient original whole scaling questions');return [buckets.many[0],buckets.one[0],buckets.many[1],buckets.many[2]];
  }

  if(type.sourceProfile==='1-2-6--7'&&type.response==='needed-amount'){
   if(type.count!==4)throw Error('Needed amount set requires four questions');
   const buckets={added:[],needed:[]},seen=new Set();
   for(let pass=0;pass<32&&(buckets.added.length<2||buckets.needed.length<2);pass++){
    const sourceSeed=(seed+pass)>>>0;root.SharedDrillStories.generate(type.sourceProfile,sourceSeed,48).forEach((q,sourceIndex)=>{
     let m=q.prompt.match(/^(\d+)에 어떤 수를 더했더니 (\d+)이 되었습니다\. 어떤 수인가요\?$/),method=m?'added':'needed';if(!m)m=q.prompt.match(/^(\d+)이 (\d+)이 되려면 얼마가 더 필요한가요\?$/);if(!m)return;
     const b=Number(m[1]),a=Number(m[2]),answer=Number(q.answer);
     if(!Number.isSafeInteger(answer)||answer!==a-b||q.work!==a+' − '+b+' = '+q.answer)throw Error('Original needed amount mismatch');
     if(b<0||b>=a||a>20||buckets[method].length===2||seen.has(b+':'+a))return;seen.add(b+':'+a);
     const prompt=method==='added'?'A number was added to '+b+' to make '+a+'. What number was added?':'How much more is needed to change '+b+' to '+a+'?';
     buckets[method].push({...q,prompt,a,b,answer,op:'−',neededAmountStory:true,neededAmountMethod:method,sourcePrompt:q.prompt,sourceAnswer:q.answer,sourceWork:q.work,sourceSeed,sourceIndex});
    });
   }
   if(buckets.added.length!==2||buckets.needed.length!==2)throw Error('Insufficient original needed amount questions');return [buckets.added[0],buckets.needed[0],buckets.added[1],buckets.needed[1]];
  }

  if(type.sourceProfile==='1-2-2--7'&&type.response==='comparison-difference-bars'){
   if(type.count!==4)throw Error('Larger comparison set requires four questions');
   const questions=[],seen=new Set();
   for(let pass=0;pass<32&&questions.length<4;pass++){
    const sourceSeed=(seed+pass)>>>0;root.SharedDrillStories.generate(type.sourceProfile,sourceSeed,48).forEach((q,sourceIndex)=>{
     const m=q.prompt.match(/^(\d+)은 (\d+)보다 얼마나 작은가요\?$/);if(!m)return;
     const b=Number(m[1]),a=Number(m[2]),answer=Number(q.answer);
     if(!Number.isSafeInteger(answer)||answer!==a-b||q.work!==a+' − '+b+' = '+q.answer)throw Error('Original larger difference mismatch');
     if(b<0||a<=20||a>100||a<=b||questions.length===4||seen.has(b+':'+a))return;seen.add(b+':'+a);
     questions.push({...q,prompt:'How much less is '+b+' than '+a+'?',a,b,answer,op:'−',comparisonDifferenceStory:true,comparisonBarStory:true,sourcePrompt:q.prompt,sourceAnswer:q.answer,sourceWork:q.work,sourceSeed,sourceIndex});
    });
   }
   if(questions.length!==4)throw Error('Insufficient original larger comparison questions');return questions;
  }

  if(type.sourceProfile==='1-2-6--7'&&type.response==='comparison-difference'){
   if(type.count!==4)throw Error('Difference set requires four questions');
   const questions=[],seen=new Set();
   for(let pass=0;pass<32&&questions.length<4;pass++){
    const sourceSeed=(seed+pass)>>>0;root.SharedDrillStories.generate(type.sourceProfile,sourceSeed,48).forEach((q,sourceIndex)=>{
     const m=q.prompt.match(/^(\d+)은 (\d+)보다 얼마나 작은가요\?$/);if(!m)return;
     const b=Number(m[1]),a=Number(m[2]),answer=Number(q.answer);
     if(!Number.isSafeInteger(answer)||answer!==a-b||q.work!==a+' − '+b+' = '+q.answer)throw Error('Original difference mismatch');
     if(b<0||a>20||a<=b||questions.length===4||seen.has(b+':'+a))return;seen.add(b+':'+a);
     questions.push({...q,prompt:'How much less is '+b+' than '+a+'?',a,b,answer,op:'−',comparisonDifferenceStory:true,sourcePrompt:q.prompt,sourceAnswer:q.answer,sourceWork:q.work,sourceSeed,sourceIndex});
    });
   }
   if(questions.length!==4)throw Error('Insufficient original difference questions');return questions;
  }

  if(type.sourceProfile==='5-2-2--22'&&type.response==='fraction-scaling-up'){
   if(type.count!==4)throw Error('Fraction scaling set requires four questions');
   const gcd=(a,b)=>b?gcd(b,a%b):a,parse=value=>{const s=String(value);let n,d,m;if(m=s.match(/^(\d+) (\d+)\/(\d+)$/)){d=BigInt(m[3]);n=BigInt(m[1])*d+BigInt(m[2]);}else if(m=s.match(/^(\d+)(?:\/(\d+))?$/)){n=BigInt(m[1]);d=BigInt(m[2]||1);}else throw Error('Invalid original fraction');if(d<=0n)throw Error('Invalid original denominator');const g=gcd(n,d);return {n:n/g,d:d/g};},key=v=>v.n+'/'+v.d,display=v=>v.d===1n?String(v.n):key(v),allowed=new Set([1n,2n,3n,4n,5n,6n,8n,9n,10n,12n,15n,16n,18n,20n,24n]),questions=[],seen=new Set();
   for(let pass=0;pass<64&&questions.length<4;pass++){
    const sourceSeed=(seed+pass)>>>0;root.SharedDrillStories.generate(type.sourceProfile,sourceSeed,48).forEach((q,sourceIndex)=>{
     const m=q.prompt.match(/^(.+)의 (.+)배에 해당하는 수를 구하세요\.$/);if(!m)return;const a=parse(m[1]),b=parse(m[2]),r=parse(q.answer);
     if(a.n<=0n||b.n<=0n||r.n<=0n||a.n*b.n*r.d!==r.n*a.d*b.d||q.work!==m[1]+' × '+m[2]+' = '+q.answer)throw Error('Original fraction scaling mismatch');
     if(a.n>=4n*a.d||a.d===1n||b.d===1n||b.n<=b.d||b.n>=3n*b.d||r.n>=8n*r.d||![a,b,r].every(v=>allowed.has(v.d)))return;
     const pair=key(a)+':'+key(b);if(questions.length===4||seen.has(pair))return;seen.add(pair);
     const total=display(a),factor=display(b),answer=display(r);questions.push({...q,prompt:'An amount is '+total+'. A larger amount is '+factor+' times as much. What is the larger amount?',a:total,b:factor,answer,work:total+' × '+factor+' = '+answer,op:'×',fractionStory:true,fractionScalingUpStory:true,sourcePrompt:q.prompt,sourceAnswer:q.answer,sourceWork:q.work,sourceSeed,sourceIndex});
    });
   }
   if(questions.length!==4)throw Error('Insufficient original fraction scaling questions');return questions;
  }

  if(type.sourceProfile==='6-1-1--11'&&type.response==='fraction-whole-groups'){
   if(type.count!==4)throw Error('Fraction group set requires four questions');
   const gcd=(a,b)=>b?gcd(b,a%b):a,parse=value=>{const s=String(value);let n,d,m;if(m=s.match(/^(\d+) (\d+)\/(\d+)$/)){d=BigInt(m[3]);n=BigInt(m[1])*d+BigInt(m[2]);}else if(m=s.match(/^(\d+)(?:\/(\d+))?$/)){n=BigInt(m[1]);d=BigInt(m[2]||1);}else throw Error('Invalid original fraction');if(d<=0n)throw Error('Invalid original denominator');const g=gcd(n,d);return {n:n/g,d:d/g};},key=v=>v.n+'/'+v.d,display=v=>v.d===1n?String(v.n):key(v),allowed=new Set([1n,2n,3n,4n,5n,6n,8n,10n,12n]),buckets={below:[],above:[]},seen=new Set();
   for(let pass=0;pass<64&&(buckets.below.length<2||buckets.above.length<2);pass++){
    const sourceSeed=(seed+pass)>>>0;root.SharedDrillStories.generate(type.sourceProfile,sourceSeed,48).forEach((q,sourceIndex)=>{
     const m=q.prompt.match(/^전체 양 (.+)을 (.+)씩 나누면 몇 묶음인가요\?$/);if(!m)return;const a=parse(m[1]),b=parse(m[2]),r=parse(q.answer);
     if(a.n<=0n||b.n<=0n||r.n<=0n||a.n*b.d*r.d!==b.n*r.n*a.d||q.work!==m[1]+' ÷ '+m[2]+' = '+q.answer)throw Error('Original fraction group mismatch');
     if(a.n>=6n*a.d||a.d===1n||b.d!==1n||b.n<2n||b.n>5n||r.n>=3n*r.d||r.d===1n||![a,b,r].every(v=>allowed.has(v.d)))return;
     const bucket=r.n<r.d?'below':'above',pair=key(a)+':'+key(b);if(buckets[bucket].length===2||seen.has(pair))return;seen.add(pair);
     const total=display(a),size=display(b),answer=display(r);buckets[bucket].push({...q,prompt:'A total amount is '+total+'. Each full group holds '+size+'. How many groups, including part of a group, does this make?',a:total,b:size,answer,work:total+' ÷ '+size+' = '+answer,op:'÷',fractionStory:true,fractionWholeGroupsStory:true,sourcePrompt:q.prompt,sourceAnswer:q.answer,sourceWork:q.work,sourceSeed,sourceIndex});
    });
   }
   if(buckets.below.length!==2||buckets.above.length!==2)throw Error('Insufficient original partial-group fraction questions');return [buckets.below[0],buckets.above[0],buckets.below[1],buckets.above[1]];
  }

  if(type.sourceProfile==='6-2-1--27'&&type.response==='fraction-partial-groups'){
   if(type.count!==4)throw Error('Fraction group set requires four questions');
   const gcd=(a,b)=>b?gcd(b,a%b):a,parse=value=>{const s=String(value);let n,d,m;if(m=s.match(/^(\d+) (\d+)\/(\d+)$/)){d=BigInt(m[3]);n=BigInt(m[1])*d+BigInt(m[2]);}else if(m=s.match(/^(\d+)(?:\/(\d+))?$/)){n=BigInt(m[1]);d=BigInt(m[2]||1);}else throw Error('Invalid original fraction');if(d<=0n)throw Error('Invalid original denominator');const g=gcd(n,d);return {n:n/g,d:d/g};},key=v=>v.n+'/'+v.d,display=v=>v.d===1n?String(v.n):key(v),allowed=new Set([1n,2n,3n,4n,5n,6n,8n,10n,12n]),buckets={below:[],above:[]},seen=new Set();
   for(let pass=0;pass<64&&(buckets.below.length<2||buckets.above.length<2);pass++){
    const sourceSeed=(seed+pass)>>>0;root.SharedDrillStories.generate(type.sourceProfile,sourceSeed,48).forEach((q,sourceIndex)=>{
     const m=q.prompt.match(/^전체 양 (.+)을 (.+)씩 나누면 몇 묶음인가요\?$/);if(!m)return;const a=parse(m[1]),b=parse(m[2]),r=parse(q.answer);
     if(a.n<=0n||b.n<=0n||r.n<=0n||a.n*b.d*r.d!==b.n*r.n*a.d||q.work!==m[1]+' ÷ '+m[2]+' = '+q.answer)throw Error('Original fraction group mismatch');
     if(a.n>=6n*a.d||b.n>=3n*b.d||b.d===1n||b.n===1n||r.n>=12n*r.d||r.d===1n||![a,b,r].every(v=>allowed.has(v.d)))return;
     const bucket=r.n<r.d?'below':'above',pair=key(a)+':'+key(b);if(buckets[bucket].length===2||seen.has(pair))return;seen.add(pair);
     const total=display(a),size=display(b),answer=display(r);buckets[bucket].push({...q,prompt:'A total amount is '+total+'. Each full group holds '+size+'. How many groups, including part of a group, does this make?',a:total,b:size,answer,work:total+' ÷ '+size+' = '+answer,op:'÷',fractionStory:true,fractionPartialGroupsStory:true,sourcePrompt:q.prompt,sourceAnswer:q.answer,sourceWork:q.work,sourceSeed,sourceIndex});
    });
   }
   if(buckets.below.length!==2||buckets.above.length!==2)throw Error('Insufficient original partial-group fraction questions');return [buckets.below[0],buckets.above[0],buckets.below[1],buckets.above[1]];
  }

  if(type.sourceProfile==='3-1-3--15'&&type.response==='equal-groups-division'){
   if(type.count!==4)throw Error('Equal-group division requires four questions');
   const buckets={count:[],size:[]},seen=new Set();
   for(let pass=0;pass<64&&(buckets.count.length<2||buckets.size.length<2);pass++){
    const sourceSeed=(seed+pass)>>>0;root.SharedDrillStories.generate(type.sourceProfile,sourceSeed,48).forEach((q,sourceIndex)=>{
     const count=q.prompt.match(/^전체 양 (\d+)을 (\d+)씩 나누면 몇 묶음인가요\?$/),size=q.prompt.match(/^전체 양 (\d+)을 (\d+)묶음으로 똑같이 나누면 한 묶음의 양은 얼마인가요\?$/),m=count||size;if(!m)return;
     const method=count?'count':'size',a=Number(m[1]),b=Number(m[2]),answer=Number(q.answer);
     if(!Number.isSafeInteger(a)||!Number.isSafeInteger(b)||!Number.isSafeInteger(answer)||a<=0||b<=0||answer<=0||answer*b!==a||q.work!==a+' ÷ '+b+' = '+q.answer)throw Error('Original equal-group division mismatch');
     if(a>81||b<2||b>9||answer<2||answer>9||buckets[method].length===2||seen.has(a+':'+b))return;seen.add(a+':'+b);
     const prompt=count?'A total of '+a+' is divided into groups of '+b+'. How many groups are there?':'A total of '+a+' is shared equally among '+b+' groups. How much is in each group?';
     buckets[method].push({...q,prompt,a,b,answer,op:'÷',groupDivisionMethod:method,answerUnit:count?'groups':'in each group',sourcePrompt:q.prompt,sourceAnswer:q.answer,sourceWork:q.work,sourceSeed,sourceIndex});
    });
   }
   if(buckets.count.length!==2||buckets.size.length!==2)throw Error('Insufficient original equal-group division questions');return [buckets.count[0],buckets.size[0],buckets.count[1],buckets.size[1]];
  }

  if((type.sourceProfile==='6-1-3--11'&&type.response==='decimal-group-measure')||(type.sourceProfile==='6-2-3--23'&&type.response==='decimal-divisor-groups')){
   const decimalDivisor=type.response==='decimal-divisor-groups',limits={below:decimalDivisor?2:1,above:decimalDivisor?2:3};
   if(type.count!==4)throw Error('Decimal group set requires four questions');
   const parse=value=>{const s=String(value);if(/^\d+\/\d+$/.test(s)){const [n,d]=s.split('/');if(BigInt(d)===0n)throw Error('Invalid original denominator');return {n:BigInt(n),d:BigInt(d)};}if(!/^\d+(?:\.\d+)?$/.test(s))throw Error('Invalid original quantity');const [w,f='']=s.split('.');return {n:BigInt(w+f),d:10n**BigInt(f.length)};},cents=v=>v.n*100n%v.d===0n?v.n*100n/v.d:null,display=c=>{const f=String(c%100n).padStart(2,'0').replace(/0+$/,'');return String(c/100n)+(f?'.'+f:'');};
   const buckets={below:[],above:[]},seen=new Set();
   for(let pass=0;pass<64&&(buckets.below.length<limits.below||buckets.above.length<limits.above);pass++){
    const sourceSeed=(seed+pass)>>>0;root.SharedDrillStories.generate(type.sourceProfile,sourceSeed,48).forEach((q,sourceIndex)=>{
     const m=q.prompt.match(/^전체 양 (.+)을 (.+)씩 나누면 몇 묶음인가요\?$/);if(!m)return;const a=parse(m[1]),b=parse(m[2]),r=parse(q.answer);
     if(a.n<=0n||b.n<=0n||r.n<=0n||a.n*b.d*r.d!==b.n*r.n*a.d||q.work!==m[1]+' ÷ '+m[2]+' = '+q.answer)throw Error('Original decimal group mismatch');
     const w=cents(a),k=cents(b),v=cents(r);if(w===null||k===null||v===null||w>=2000n||(decimalDivisor?(k<=0n||k>=1000n||k%100n===0n||v>10000n):(w%100n===0n||k<200n||k>1000n||k%100n!==0n))||v%100n===0n)return;
     const bucket=(decimalDivisor?k:v)<100n?'below':'above',limit=limits[bucket],pair=w+':'+k;if(buckets[bucket].length===limit||seen.has(pair))return;seen.add(pair);
     const total=display(w),size=display(k),answer=display(v);buckets[bucket].push({...q,prompt:'A total amount is '+total+'. Each full group holds '+size+'. How many groups, including part of a group, does this make?',a:total,b:size,answer,work:total+' ÷ '+size+' = '+answer,op:'÷',decimalStory:true,decimalGroupStory:true,...(decimalDivisor?{decimalDivisorStory:true}:{}),sourcePrompt:q.prompt,sourceAnswer:q.answer,sourceWork:q.work,sourceSeed,sourceIndex});
    });
   }
   if(buckets.below.length!==limits.below||buckets.above.length!==limits.above)throw Error('Insufficient original decimal group questions');return decimalDivisor?[buckets.below[0],buckets.above[0],buckets.below[1],buckets.above[1]]:[buckets.above[0],buckets.below[0],...buckets.above.slice(1)];
  }

  if(type.sourceProfile==='4-2-3--67'&&type.response==='missing-decimal-part'){
   if(type.count!==4)throw Error('Missing decimal set requires four questions');
   const parse=value=>{const s=String(value);let m;if(m=s.match(/^(\d+)\/(\d+)$/)){if(BigInt(m[2])===0n)throw Error('Invalid original denominator');return {n:BigInt(m[1]),d:BigInt(m[2])};}if(!/^\d+(?:\.\d+)?$/.test(s))throw Error('Invalid original decimal');const [w,f='']=s.split('.');return {n:BigInt(w+f),d:10n**BigInt(f.length)};};
   const cents=v=>v.n*100n%v.d===0n?v.n*100n/v.d:null,display=c=>{const f=String(c%100n).padStart(2,'0').replace(/0+$/,'');return String(c/100n)+(f?'.'+f:'');};
   const buckets={change:[],part:[]},seen=new Set();let zeros=0;
   for(let pass=0;pass<64&&(buckets.change.length<2||buckets.part.length<2);pass++){
    const sourceSeed=(seed+pass)>>>0,raw=root.SharedDrillStories.generate(type.sourceProfile,sourceSeed,48);
    raw.forEach((q,sourceIndex)=>{
     let m=q.prompt.match(/^(.+)이 (.+)이 되려면 얼마가 더 필요한가요\?$/),method=m?'change':null,a=m?m[2]:'',b=m?m[1]:'';
     if(!m){m=q.prompt.match(/^두 양을 합하면 (.+)입니다\. 한 양이 (.+)이면 나머지는 얼마인가요\?$/);if(m){method='part';a=m[1];b=m[2];}}if(!m)return;
     const whole=parse(a),known=parse(b),answer=parse(q.answer);
     if((whole.n*known.d-known.n*whole.d)*answer.d!==answer.n*whole.d*known.d||q.work!==a+' − '+b+' = '+q.answer)throw Error('Original missing decimal mismatch');
     const w=cents(whole),k=cents(known),r=cents(answer);if(w===null||k===null||r===null||w<100n||w>3000n||k<=0n||k>w||w%100n===0n&&k%100n===0n||buckets[method].length===2)return;
     const pair=w+':'+k;if(seen.has(pair)||r===0n&&zeros)return;seen.add(pair);if(r===0n)zeros++;
     a=display(w);b=display(k);const value=display(r),prompt=method==='change'?'How much more is needed to change '+b+' to '+a+'?':'Two amounts total '+a+'. One amount is '+b+'. What is the other amount?';
     buckets[method].push({...q,prompt,a,b,answer:value,work:a+' − '+b+' = '+value,op:'−',decimalStory:true,missingDecimalPart:true,missingPartMethod:method,sourcePrompt:q.prompt,sourceAnswer:q.answer,sourceWork:q.work,sourceSeed,sourceIndex});
    });
   }
   if(buckets.change.length!==2||buckets.part.length!==2)throw Error('Insufficient original missing decimal questions');return [buckets.change[0],buckets.part[0],buckets.change[1],buckets.part[1]];
  }

  if(type.sourceProfile==='4-2-1--13'&&type.response==='missing-fraction-part'||type.sourceProfile==='5-1-5--41'&&type.response==='missing-fraction-part-unlike'){
   const unlike=type.response==='missing-fraction-part-unlike',limits={change:unlike?0:2,part:unlike?4:2};
   if(type.count!==4)throw Error('Missing fraction set requires four questions');
   const parse=s=>{let m; s=String(s);if(m=s.match(/^(\d+) (\d+)\/(\d+)$/))return {n:+m[1]*+m[3]+ +m[2],d:+m[3]};if(m=s.match(/^(\d+)\/(\d+)$/))return {n:+m[1],d:+m[2]};if(/^\d+$/.test(s))return {n:+s,d:1};throw Error('Invalid original fraction');};
   const gcd=(a,b)=>b?gcd(b,a%b):a,key=v=>{const g=gcd(v.n,v.d);return v.n/g+'/'+(v.d/g);};
   const buckets={change:[],part:[]},seen=new Set();let zeros=0;
   for(let pass=0;pass<64&&(buckets.change.length<limits.change||buckets.part.length<limits.part);pass++){
    const sourceSeed=(seed+(unlike?Math.imul(pass,0x9e3779b9):pass))>>>0,raw=root.SharedDrillStories.generate(type.sourceProfile,sourceSeed,48);
    raw.forEach((q,sourceIndex)=>{
     let m=q.prompt.match(/^(.+)이 (.+)이 되려면 얼마가 더 필요한가요\?$/),method=m?'change':null,a=m?m[2]:'',b=m?m[1]:'';
     if(!m){m=q.prompt.match(/^두 양을 합하면 (.+)입니다\. 한 양이 (.+)이면 나머지는 얼마인가요\?$/);if(m){method='part';a=m[1];b=m[2];}}if(!m)return;
     const whole=parse(a),known=parse(b),answer=parse(q.answer);for(const v of [whole,known,answer])if(!Number.isSafeInteger(v.n)||!Number.isSafeInteger(v.d)||v.n<0||v.n>20000||v.d<1||v.d>1000)throw Error('Original fraction outside exact parsing bounds');
     if((whole.n*known.d-known.n*whole.d)*answer.d!==answer.n*whole.d*known.d||q.work!==a+' − '+b+' = '+q.answer)throw Error('Original missing fraction mismatch');
     const den=[whole.d,known.d].filter(d=>d!==1),invalidDen=unlike?(whole.d<2||known.d<2||whole.d>24||known.d>24||whole.d===known.d||whole.d/gcd(whole.d,known.d)*known.d>24):(!den.length||den.some(d=>!supportedDenominators.has(d))||new Set(den).size!==1);
     if(invalidDen||whole.n<whole.d||whole.n>(unlike?3:2)*whole.d||known.n<=0||known.n*whole.d>whole.n*known.d||buckets[method].length===limits[method])return;
     const pair=key(whole)+':'+key(known);if(seen.has(pair)||answer.n===0&&zeros)return;seen.add(pair);if(answer.n===0)zeros++;
     const prompt=method==='change'?'How much more is needed to change '+b+' to '+a+'?':'Two amounts total '+a+'. One amount is '+b+'. What is the other amount?';
     buckets[method].push({...q,prompt,a,b,op:'−',fractionStory:true,missingFractionPart:true,...(unlike?{unlikeMissingFractionPart:true,sourcePass:pass}:{}),missingPartMethod:method,sourcePrompt:q.prompt,sourceAnswer:q.answer,sourceSeed,sourceIndex});
    });
   }
   if(buckets.change.length!==limits.change||buckets.part.length!==limits.part)throw Error('Insufficient original missing fraction questions');return unlike?buckets.part:[buckets.change[0],buckets.part[0],buckets.change[1],buckets.part[1]];
  }

  if(type.sourceProfile!=='2-1-3--24'||type.count!==4)throw Error('Unsupported original drill-story profile');
  const buckets={change:[],part:[]},seen=new Set();let zeros=0;
  for(let pass=0;pass<32&&(buckets.change.length<2||buckets.part.length<2);pass++){
   const sourceSeed=(seed+pass)>>>0,raw=root.SharedDrillStories.generate(type.sourceProfile,sourceSeed,48);
   raw.forEach((q,sourceIndex)=>{
    let m=q.prompt.match(/^(\d+)이 (\d+)이 되려면 얼마가 더 필요한가요\?$/),method=m?'change':null;
    let known=m?+m[1]:0,whole=m?+m[2]:0;
    if(!m){m=q.prompt.match(/^두 양을 합하면 (\d+)입니다\. 한 양이 (\d+)이면 나머지는 얼마인가요\?$/);if(m){method='part';whole=+m[1];known=+m[2];}}
    if(!m)return;const value=Number(q.answer);
    if(!Number.isInteger(value)||value!==whole-known||q.work!==whole+' − '+known+' = '+q.answer)throw Error('Original missing-part mismatch');
    if(whole<20||whole>100||known<10||known>whole||buckets[method].length===2||seen.has(whole+':'+known)||value===0&&zeros)return;
    seen.add(whole+':'+known);if(value===0)zeros++;
    const prompt=method==='change'?'How much more is needed to change '+known+' to '+whole+'?':'Two amounts total '+whole+'. One amount is '+known+'. What is the other amount?';
    buckets[method].push({...q,prompt,answer:value,a:whole,b:known,op:'−',sourcePrompt:q.prompt,sourceAnswer:q.answer,sourceSeed,sourceIndex,missingPartStory:true,missingPartMethod:method});
   });
  }
  if(buckets.change.length!==2||buckets.part.length!==2)throw Error('Insufficient distinct missing-part source questions');
  return [buckets.change[0],buckets.part[0],buckets.change[1],buckets.part[1]];
 }
 if(type.bank==='grade-extension'&&type.id==='decimal-compare-hundredths'){
  if(type.sourceGrade!==4||type.sourceUnit!=='decimal-compare'||type.count!==6)throw Error('Unsupported hundredths comparison source');
  const buckets={symbol:[],explanation:[]},seen=new Set();
  for(let pass=0;pass<64&&(buckets.symbol.length<4||buckets.explanation.length<2);pass++){
   const sourceSeed=(seed+Math.imul(pass,0x9e3779b9))>>>0;
   root.GradeMath.generate(4,'decimal-compare',sourceSeed).forEach((g,sourceGroup)=>g.questions.forEach((q,sourceIndex)=>{
    const values=q.task.replace(/<[^>]*>/g,' ').match(/\d+(?:\.\d+)?/g);
    if(!values||values.length!==2||values.some(v=>!/^\d+(\.\d{1,2})?$/.test(v)))throw Error('Original hundredths format changed');
    const activityMode=q.prompt==='Write <, >, or =.'?'symbol':q.prompt==='Compare. Explain using place value.'?'explanation':null;
    if(!activityMode)throw Error('Original comparison prompt changed');
    const key=values.join('|'),limit=activityMode==='symbol'?4:2;
    if(seen.has(key)||buckets[activityMode].length===limit)return;
    seen.add(key);buckets[activityMode].push({...q,activityMode,comparisonValues:values,sourceSeed,sourceGroup,sourceIndex});
   }));
  }
  if(buckets.symbol.length!==4||buckets.explanation.length!==2)throw Error('Insufficient original hundredths pairs');
  return [...buckets.symbol,...buckets.explanation];
 }

 if(type.bank==='grade-extension'&&type.id==='quadrilateral-families'){
  if(type.count!==3||type.sourceGrade!==3||type.sourceUnit!=='quadrilaterals')throw Error('Unsupported quadrilateral source');
  const questions=[],seen=new Set(),sourceSeed=seed>>>0;
  root.GradeMath.generate(3,'quadrilaterals',sourceSeed).forEach((g,sourceGroup)=>g.questions.forEach((q,sourceIndex)=>{
   if(seen.has(q.prompt))return;seen.add(q.prompt);
   questions.push({...q,sourceSeed,sourceGroup,sourceIndex,activityMode:q.prompt.startsWith('Draw ')?'drawing':'explanation'});
  }));
  if(questions.length!==3)throw Error('Expected three distinct original quadrilateral tasks');
  return questions;
 }

 if(type.bank==='grade-extension'&&type.id==='prime-composite-multiples'){
  if(type.sourceGrade!==4||type.sourceUnit!=='factors'||type.count!==6)throw Error('Unsupported factors classification source');
  const buckets={classification:[],multiple:[]},seen=new Set();
  for(let pass=0;pass<64&&(buckets.classification.length<3||buckets.multiple.length<3);pass++){
   const sourceSeed=(seed+Math.imul(pass,0x9e3779b9))>>>0;
   root.GradeMath.generate(4,'factors',sourceSeed).forEach((group,sourceGroup)=>group.questions.forEach((q,sourceIndex)=>{
    let m,mode,number,divisor=null,expected;
    if(m=q.prompt.match(/^Is (\d+) prime or composite\?$/)){mode='classification';number=Number(m[1]);let prime=true;for(let n=2;n*n<=number;n++)if(number%n===0)prime=false;expected=prime?'prime':'composite';}
    else if(m=q.prompt.match(/^Is (\d+) a multiple of (\d+)\?$/)){mode='multiple';number=Number(m[1]);divisor=Number(m[2]);expected=number%divisor===0?'Yes':'No';}
    else return;
    if(number<2||number>100||q.answer!==expected)throw Error('Original factors classification mismatch');
    if(buckets[mode].length===3||seen.has(q.prompt))return;
    seen.add(q.prompt);buckets[mode].push({...q,activityMode:mode,number,divisor,sourceSeed,sourceGroup,sourceIndex});
   }));
  }
  if(buckets.classification.length!==3||buckets.multiple.length!==3)throw Error('Insufficient original factors classification');
  return buckets.classification.flatMap((q,i)=>[q,buckets.multiple[i]]);
 }
 if(type.bank==='grade-extension'&&type.id==='multiply-divide-powers-ten'){
  if(type.sourceGrade!==5||type.sourceUnit!=='powers10'||type.count!==6)throw Error('Unsupported powers of ten source');
  const selected=new Map();
  for(let pass=0;pass<256&&selected.size<6;pass++){
   const sourceSeed=(seed+Math.imul(pass,0x9e3779b9))>>>0;
   root.GradeMath.generate(5,'powers10',sourceSeed).forEach((group,sourceGroup)=>group.questions.forEach((q,sourceIndex)=>{
    const m=q.prompt.match(/^(Multiply|Divide) (\d+(?:\.\d+)?) by (10|100|1000)\.$/);
    if(!m)throw Error('Original powers of ten format changed');
    if((q.answer.split('.')[1]||'').length>3)return;
    const operation=m[1],factor=Number(m[3]),key=operation+':'+factor;
    if(!selected.has(key))selected.set(key,{...q,operation,value:m[2],factor,sourceSeed,sourceGroup,sourceIndex});
   }));
  }
  if(selected.size!==6)throw Error('Insufficient original powers of ten combinations');
  return [10,100,1000].flatMap(f=>[selected.get('Multiply:'+f),selected.get('Divide:'+f)]);
 }
 if(type.bank==='grade-extension'&&type.id==='tenths-hundredths-decimals'){
  if(type.sourceGrade!==4||type.sourceUnit!=='tenths-hundredths'||type.count!==6)throw Error('Unsupported decimal fraction source');
  const prompts=['Write as a decimal.','Write as hundredths.','Complete the equivalent fraction.'],buckets=[[],[],[]],seen=new Set();
  for(let pass=0;pass<32&&buckets.some(b=>b.length<2);pass++){
   const sourceSeed=(seed+Math.imul(pass,0x9e3779b9))>>>0;
   root.GradeMath.generate(4,'tenths-hundredths',sourceSeed).forEach((group,sourceGroup)=>group.questions.forEach((q,sourceIndex)=>{
    const mode=prompts.indexOf(q.prompt);let m,value,expected;
    if(mode===0){m=q.task.match(/<span class="fraction"><span>(\d+)<\/span><span>100<\/span>/);if(m){value=Number(m[1]);expected='0.'+String(value).padStart(2,'0');}}
    else if(mode===1){m=q.task.match(/^0\.(\d{2}) = /);if(m){value=Number(m[1]);expected=String(value);}}
    else if(mode===2){m=q.task.match(/<span class="fraction"><span>(\d+)<\/span><span>10<\/span>/);if(m){value=Number(m[1]);expected=String(value*10);}}
    if(!m||q.answer!==expected||value<1||value>(mode===2?9:99))throw Error('Original decimal fraction mismatch');
    const key=mode+':'+value;if(buckets[mode].length===2||seen.has(key))return;
    seen.add(key);buckets[mode].push({...q,activityMode:mode,value,sourceSeed,sourceGroup,sourceIndex});
   }));
  }
  if(buckets.some(b=>b.length!==2))throw Error('Insufficient original decimal fractions');return buckets.flat();
 }
 if(type.bank==='grade-extension'&&type.id==='fraction-compare-unlike-denominators'){
  if(type.sourceGrade!==4||type.sourceUnit!=='fraction-compare'||type.count!==6)throw Error('Unsupported unlike fraction source');
  const selected=[],seen=new Set();
  for(let pass=0;pass<32&&selected.length<6;pass++){
   const sourceSeed=(seed+Math.imul(pass,0x9e3779b9))>>>0;
   root.GradeMath.generate(4,'fraction-compare',sourceSeed).forEach((group,sourceGroup)=>group.questions.forEach((q,sourceIndex)=>{
    const matches=[...q.task.matchAll(/<span class="fraction"><span>(\d+)<\/span><span>(\d+)<\/span><\/span>/g)];
    if(matches.length!==2)throw Error('Original fraction format changed');
    const n=Number(matches[0][1]),d=Number(matches[0][2]),m=Number(matches[1][1]),e=Number(matches[1][2]);
    if(![2,3,4,6,8].includes(d)||![2,3,4,6,8].includes(e)||n<1||n>d||m<1||m>e||q.answer!==(n*e<m*d?'<':n*e>m*d?'>':'='))throw Error('Original fraction comparison mismatch');
    const key=[n,d,m,e].join(':');if(d===e||selected.length===6||seen.has(key))return;
    seen.add(key);selected.push({...q,numeratorLeft:n,denominatorLeft:d,numeratorRight:m,denominatorRight:e,sourceSeed,sourceGroup,sourceIndex});
   }));
  }
  if(selected.length!==6)throw Error('Insufficient original unlike fractions');return selected;
 }
 if(type.bank==='grade-extension'&&type.id==='missing-factor-dividend'){
  if(type.sourceGrade!==3||type.sourceUnit!=='unknown'||type.count!==6)throw Error('Unsupported missing factor/dividend source');
  const buckets={factor:[],dividend:[]},seen=new Set();
  for(let pass=0;pass<32&&(buckets.factor.length<3||buckets.dividend.length<3);pass++){
   const sourceSeed=(seed+Math.imul(pass,0x9e3779b9))>>>0;
   root.GradeMath.generate(3,'unknown',sourceSeed).forEach((group,sourceGroup)=>group.questions.forEach((q,sourceIndex)=>{
    let m,mode,left,right,expected;
    if(m=q.task.match(/^(\d+) × <span class="write-box"><\/span> = (\d+)$/)){mode='factor';left=Number(m[1]);right=Number(m[2]);expected=right/left;}
    else if(m=q.task.match(/^<span class="write-box"><\/span> ÷ (\d+) = (\d+)$/)){mode='dividend';left=Number(m[1]);right=Number(m[2]);expected=left*right;}
    else return;
    if(Number(q.answer)!==expected||left<2||left>9)throw Error('Original missing-number mismatch');
    if(buckets[mode].length===3||seen.has(q.task))return;
    seen.add(q.task);buckets[mode].push({...q,activityMode:mode,left,right,sourceSeed,sourceGroup,sourceIndex});
   }));
  }
  if(buckets.factor.length!==3||buckets.dividend.length!==3)throw Error('Insufficient original missing-number equations');
  return buckets.factor.flatMap((q,i)=>[q,buckets.dividend[i]]);
 }
 if(type.bank==='grade-extension'&&type.id==='addition-equations-true-false'){
  if(type.sourceGrade!==1||type.sourceUnit!=='equal'||type.count!==6)throw Error('Unsupported equation truth source');
  const buckets={True:[],False:[]},seen=new Set();
  for(let pass=0;pass<32&&(buckets.True.length<3||buckets.False.length<3);pass++){
   const sourceSeed=(seed+Math.imul(pass,0x9e3779b9))>>>0;
   root.GradeMath.generate(1,'equal',sourceSeed).forEach((group,sourceGroup)=>group.questions.forEach((q,sourceIndex)=>{
    const m=q.task.match(/^(\d+) \+ (\d+) = (\d+)<br>True \/ False$/);
    if(!m)throw Error('Original equation format changed');
    const a=Number(m[1]),b=Number(m[2]),result=Number(m[3]),expected=a+b===result?'True':'False';
    if(a<2||a>9||b<2||b>9||q.answer!==expected)throw Error('Original equation mismatch');
    if(buckets[expected].length===3||seen.has(q.task))return;
    seen.add(q.task);buckets[expected].push({...q,a,b,result,sourceSeed,sourceGroup,sourceIndex});
   }));
  }
  if(buckets.True.length!==3||buckets.False.length!==3)throw Error('Insufficient original true/false equations');
  // Source seeds provide a deterministic order without a fixed alternating answer pattern.
  return [...buckets.True,...buckets.False].sort((a,b)=>((Math.imul(a.a*100+a.b*10+a.result,2654435761)^seed)>>>0)-((Math.imul(b.a*100+b.b*10+b.result,2654435761)^seed)>>>0));
 }
 if(type.bank==='grade-extension'&&type.id==='read-quarter-unit-lineplots'){
  if(type.sourceGrade!==3||type.sourceUnit!=='lineplot'||type.count!==4)throw Error('Unsupported measurement plot source');
  const prompts=['Each × is one measurement. How many measurements?','How many measurements have the smallest shown value?'];
  const buckets=[[],[]],seen=new Set();
  for(let pass=0;pass<32&&buckets.some(b=>b.length<2);pass++){
   const sourceSeed=(seed+Math.imul(pass,0x9e3779b9))>>>0;
   root.GradeMath.generate(3,'lineplot',sourceSeed).forEach((group,sourceGroup)=>group.questions.forEach((q,sourceIndex)=>{
    const mode=prompts.indexOf(q.prompt);if(mode<0)return;
    const counts=[25,75,125,175].map(x=>[...q.visual.matchAll(/<text x="(\d+)" y="(\d+)" text-anchor="middle">×<\/text>/g)].filter(m=>Number(m[1])===x).length);
    const expected=mode===0?counts.reduce((a,b)=>a+b):counts[0];
    if(counts.some(n=>n<1||n>3)||Number(q.answer)!==expected)throw Error('Original measurement plot mismatch');
    const key=mode+':'+counts.join(',');if(buckets[mode].length===2||seen.has(key))return;
    seen.add(key);buckets[mode].push({...q,counts,activityMode:mode,sourceSeed,sourceGroup,sourceIndex});
   }));
  }
  if(buckets.some(b=>b.length!==2))throw Error('Insufficient original measurement plots');
  return buckets.flat();
 }
 if(type.bank==='grade-extension'&&type.id==='read-whole-number-lineplots'){
  if(type.sourceGrade!==2||type.sourceUnit!=='lineplot'||type.count!==4)throw Error('Unsupported measurement plot source');
  const prompts=['Each × is one measurement. How many measurements?','How many measurements have the smallest shown value?'];
  const buckets=[[],[]],seen=new Set();
  for(let pass=0;pass<32&&buckets.some(b=>b.length<2);pass++){
   const sourceSeed=(seed+Math.imul(pass,0x9e3779b9))>>>0;
   root.GradeMath.generate(2,'lineplot',sourceSeed).forEach((group,sourceGroup)=>group.questions.forEach((q,sourceIndex)=>{
    const mode=prompts.indexOf(q.prompt);if(mode<0)return;
    const counts=[25,75,125,175].map(x=>[...q.visual.matchAll(/<text x="(\d+)" y="(\d+)" text-anchor="middle">×<\/text>/g)].filter(m=>Number(m[1])===x).length);
    const expected=mode===0?counts.reduce((a,b)=>a+b):counts[0];
    if(counts.some(n=>n<1||n>3)||Number(q.answer)!==expected)throw Error('Original measurement plot mismatch');
    const key=mode+':'+counts.join(',');if(buckets[mode].length===2||seen.has(key))return;
    seen.add(key);buckets[mode].push({...q,counts,activityMode:mode,sourceSeed,sourceGroup,sourceIndex});
   }));
  }
  if(buckets.some(b=>b.length!==2))throw Error('Insufficient original measurement plots');
  return buckets.flat();
 }
 if(type.bank==='grade-extension'&&type.id==='read-vote-graphs'){
  if(type.sourceGrade!==2||type.sourceUnit!=='graphs'||type.count!==6)throw Error('Unsupported vote graph source');
  const prompts=['Each block is one vote. How many votes for A?','How many votes altogether?','How many more votes does the largest group have than the smallest?'];
  const buckets=[[],[],[]],seen=new Set();
  for(let pass=0;pass<32&&buckets.some(b=>b.length<2);pass++){
   const sourceSeed=(seed+Math.imul(pass,0x9e3779b9))>>>0;
   root.GradeMath.generate(2,'graphs',sourceSeed).forEach((group,sourceGroup)=>group.questions.forEach((q,sourceIndex)=>{
    const mode=prompts.indexOf(q.prompt),counts=[0,0,0];
    if(mode<0)throw Error('Original graph prompt changed');
    for(const m of q.visual.matchAll(/<rect x="(\d+)" y="(\d+)" width="18" height="16"/g)){
     const row=(Number(m[2])-5)/24;
     if(!Number.isInteger(row)||row<0||row>2||Number(m[1])!==25+18*counts[row])throw Error('Original graph geometry changed');
     counts[row]++;
    }
    const expected=mode===0?counts[0]:mode===1?counts.reduce((a,b)=>a+b):Math.max(...counts)-Math.min(...counts);
    if(counts.some(n=>n<1||n>8)||Number(q.answer)!==expected)throw Error('Original graph answer mismatch');
    const key=mode+':'+counts.join(',');
    if(buckets[mode].length===2||seen.has(key))return;
    seen.add(key);buckets[mode].push({...q,counts,activityMode:mode,sourceSeed,sourceGroup,sourceIndex});
   }));
  }
  if(buckets.some(b=>b.length!==2))throw Error('Insufficient original graph questions');
  return buckets.flat();
 }
 if(type.bank==='grade-extension'&&type.id==='order-three-lengths'){
  if(type.sourceGrade!==1||type.sourceUnit!=='order-length'||type.count!==4)throw Error('Unsupported length ordering source');
  const buckets=[[],[]],seen=new Set();
  for(let pass=0;pass<32&&buckets.some(b=>b.length<2);pass++){
   const sourceSeed=(seed+Math.imul(pass,0x9e3779b9))>>>0;
   root.GradeMath.generate(1,'order-length',sourceSeed).forEach((group,sourceGroup)=>group.questions.forEach((q,sourceIndex)=>{
    const mode=['List A, B, C from shortest to longest.','Which strip is longest?'].indexOf(q.prompt);
    const widths=[...q.visual.matchAll(/<rect x="22" y="(\d+)" width="(\d+)" height="16"/g)].map(m=>Number(m[2]));
    if(mode<0||widths.length!==3)throw Error('Original length format changed');
    const order=widths.map((w,i)=>[w,'ABC'[i]]).sort((a,b)=>a[0]-b[0]);
    if(q.answer!==(mode===0?order.map(x=>x[1]).join(', '):order[2][1]))throw Error('Original length answer mismatch');
    const key=mode+':'+widths.join(',');
    if(buckets[mode].length===2||seen.has(key))return;
    seen.add(key);buckets[mode].push({...q,activityMode:mode,sourceSeed,sourceGroup,sourceIndex});
   }));
  }
  if(buckets.some(b=>b.length!==2))throw Error('Insufficient original length tasks');
  return buckets.flat();
 }
 if(type.bank==='grade-extension'&&type.id==='odd-even-within-20'){
  if(type.sourceGrade!==2||type.sourceUnit!=='odd-even'||type.count!==6)throw Error('Unsupported odd/even source');
  const prompts=['Is this number odd or even?','Draw pairs. Is there one left over?','For an even number, write two equal addends. For an odd number, write "odd".'];
  const buckets=[[],[],[]],seen=new Set();
  for(let pass=0;pass<32&&buckets.some(b=>b.length<2);pass++){
   const sourceSeed=(seed+Math.imul(pass,0x9e3779b9))>>>0;
   root.GradeMath.generate(2,'odd-even',sourceSeed).forEach((group,sourceGroup)=>group.questions.forEach((q,sourceIndex)=>{
    const mode=prompts.indexOf(q.prompt),m=q.task.match(/<div class="equation">(\d+)<\/div>/);
    if(mode<0||!m)throw Error('Original odd/even format changed');
    const number=Number(m[1]),odd=number%2!==0;
    const expected=mode===0?(odd?'Odd':'Even'):mode===1?(odd?'Yes, one is left over.':'No, all objects are paired.'):(odd?'odd':`${number/2} + ${number/2}`);
    if(number<1||number>20||q.answer!==expected)throw Error('Original odd/even mismatch');
    const key=mode+':'+number;
    if(buckets[mode].length===2||seen.has(key))return;
    seen.add(key);buckets[mode].push({...q,number,activityMode:mode,sourceSeed,sourceGroup,sourceIndex});
   }));
  }
  if(buckets.some(b=>b.length!==2))throw Error('Insufficient original odd/even questions');
  return buckets.flat();
 }
 if(type.bank==='grade-extension'&&type.id==='rectangle-equal-parts'){
  if(type.sourceGrade!==2||type.sourceUnit!=='partition'||type.count!==3)throw Error('Unsupported equal-parts source');
  const selected=new Map();
  for(let pass=0;pass<32&&selected.size<3;pass++){
   const sourceSeed=(seed+Math.imul(pass,0x9e3779b9))>>>0;
   root.GradeMath.generate(2,'partition',sourceSeed).forEach((group,sourceGroup)=>group.questions.forEach((q,sourceIndex)=>{
    const m=q.prompt.match(/^Divide the rectangle into ([234]) equal-area parts\. Shade one part\.$/);
    if(!m)throw Error('Original partition format changed');
    const parts=Number(m[1]);
    if(q.answer!==`1/${parts}. Check ${parts} equal-area parts and one shaded part.`)throw Error('Original partition guidance changed');
    if(!selected.has(parts))selected.set(parts,{...q,parts,sourceSeed,sourceGroup,sourceIndex});
   }));
  }
  if(selected.size!==3)throw Error('Insufficient distinct original partitions');
  return [2,3,4].map(parts=>selected.get(parts));
 }
 if(type.bank==='grade-extension'&&type.id==='estimate-measure-book'){
  if(type.sourceGrade!==2||type.sourceUnit!=='estimate-length'||type.count!==1)throw Error('Unsupported estimate source');
  const sourceSeed=seed>>>0,groups=root.GradeMath.generate(2,'estimate-length',sourceSeed);
  const q=groups[0].questions[0];
  if(q.prompt!=='Choose a book. Estimate its length in centimeters. Measure it with a ruler. Compare.'||!q.open)throw Error('Original estimate activity changed');
  return [{...q,sourceSeed,sourceGroup:0,sourceIndex:0}];
 }

 if(type.bank==='grade-extension'&&type.id==='measure-draw-angles'){
  if(type.sourceGrade!==4||type.sourceUnit!=='protractor'||type.count!==4)throw Error('Unsupported angle source');
  const buckets={measure:[],draw:[]},seen=new Set();
  for(let pass=0;pass<64&&Object.values(buckets).some(b=>b.length<2);pass++){
   const sourceSeed=(seed+Math.imul(pass,0x9e3779b9))>>>0;
   root.GradeMath.generate(4,'protractor',sourceSeed).forEach((g,sourceGroup)=>g.questions.forEach((q,sourceIndex)=>{
    const drawing=q.prompt.match(/^Use a protractor to draw an angle of (\d+)°\.$/);
    const activityMode=drawing?'draw':q.prompt==='Use a protractor to measure the angle.'?'measure':null;
    if(!activityMode)throw Error('Original angle prompt changed');
    const degrees=Number(drawing?drawing[1]:q.answer),key=activityMode+':'+degrees;
    if(![30,45,60,90,120,135,150].includes(degrees))throw Error('Original angle range changed');
    if(buckets[activityMode].length===2||seen.has(key))return;
    seen.add(key);buckets[activityMode].push({...q,activityMode,degrees,sourceSeed,sourceGroup,sourceIndex});
   }));
  }
  if(Object.values(buckets).some(b=>b.length!==2))throw Error('Insufficient original angle tasks');
  return [0,1].flatMap(i=>[buckets.measure[i],buckets.draw[i]]);
 }

 if(type.bank==='grade-extension'&&type.id==='measurement-units-larger'){
  if(type.sourceGrade!==5||type.sourceUnit!=='convert'||type.count!==4)throw Error('Unsupported measurement conversion source');
  const factors={'cm:m':100,'g:kg':1000,'mL:L':1000,'in:ft':12},selected=new Map();
  for(let pass=0;pass<64&&selected.size<4;pass++){
   const sourceSeed=(seed+Math.imul(pass,0x9e3779b9))>>>0;
   root.GradeMath.generate(5,'convert',sourceSeed).forEach((g,sourceGroup)=>g.questions.forEach((q,sourceIndex)=>{
    const m=q.task.match(/^(\d+) (cm|g|mL|in) = .* (m|kg|L|ft)$/);if(!m)return;
    const amount=Number(m[1]),fromUnit=m[2],toUnit=m[3],key=fromUnit+':'+toUnit;
    if(!factors[key]||Number(q.answer)<2||Number(q.answer)>9||Number(q.answer)!==amount/factors[key])throw Error('Original conversion mismatch');
    if(!selected.has(key))selected.set(key,{...q,amount,fromUnit,toUnit,sourceSeed,sourceGroup,sourceIndex});
   }));
  }
  if(selected.size!==4)throw Error('Insufficient original conversion pairs');
  return Object.keys(factors).map(key=>selected.get(key));
 }

 if(type.bank==='grade-extension'&&type.id==='measurement-unit-conversions'){
  if(type.sourceGrade!==4||type.sourceUnit!=='convert'||type.count!==4)throw Error('Unsupported measurement conversion source');
  const factors={'m:cm':100,'kg:g':1000,'L:mL':1000,'ft:in':12},selected=new Map();
  for(let pass=0;pass<64&&selected.size<4;pass++){
   const sourceSeed=(seed+Math.imul(pass,0x9e3779b9))>>>0;
   root.GradeMath.generate(4,'convert',sourceSeed).forEach((g,sourceGroup)=>g.questions.forEach((q,sourceIndex)=>{
    const m=q.task.match(/^(\d+) (m|kg|L|ft) = .* (cm|g|mL|in)$/);if(!m)throw Error('Original conversion task changed');
    const amount=Number(m[1]),fromUnit=m[2],toUnit=m[3],key=fromUnit+':'+toUnit;
    if(!factors[key]||amount<2||amount>9||Number(q.answer)!==amount*factors[key])throw Error('Original conversion mismatch');
    if(!selected.has(key))selected.set(key,{...q,amount,fromUnit,toUnit,sourceSeed,sourceGroup,sourceIndex});
   }));
  }
  if(selected.size!==4)throw Error('Insufficient original conversion pairs');
  return Object.keys(factors).map(key=>selected.get(key));
 }

 if(type.bank==='grade-extension'&&type.id==='shape-attributes'){
  if(type.sourceGrade!==2||type.sourceUnit!=='shape'||type.count!==3)throw Error('Unsupported shape attributes source');
  const questions=[],seen=new Set(),sourceSeed=seed>>>0;
  root.GradeMath.generate(2,'shape',sourceSeed).forEach((g,sourceGroup)=>g.questions.forEach((q,sourceIndex)=>{
   if(seen.has(q.prompt))return;seen.add(q.prompt);
   questions.push({...q,sourceSeed,sourceGroup,sourceIndex});
  }));
  if(questions.length!==3)throw Error('Expected three original shape attribute tasks');
  return questions;
 }

 if(type.bank==='grade-extension'&&type.id==='shape-composition'){
  if(type.sourceGrade!==1||type.sourceUnit!=='shape-build'||type.count!==3)throw Error('Unsupported shape composition source');
  const questions=[],seen=new Set(),sourceSeed=seed>>>0;
  root.GradeMath.generate(1,'shape-build',sourceSeed).forEach((g,sourceGroup)=>g.questions.forEach((q,sourceIndex)=>{
   if(seen.has(q.prompt))return;seen.add(q.prompt);
   questions.push({...q,sourceSeed,sourceGroup,sourceIndex});
  }));
  if(questions.length!==3)throw Error('Expected three original composition tasks');
  return questions;
 }

 if(type.bank==='grade-extension'&&type.id==='lines-rays-segments'){
  if(type.sourceGrade!==4||type.sourceUnit!=='lines'||type.count!==3)throw Error('Unsupported lines source');
  const selected=new Map(),sourceSeed=seed>>>0;
  root.GradeMath.generate(4,'lines',sourceSeed).forEach((g,sourceGroup)=>g.questions.forEach((q,sourceIndex)=>{
   const activityMode=q.prompt==='Are these lines parallel?'?'parallel':q.prompt==='Are these lines perpendicular?'?'perpendicular':q.prompt==='Draw a line, a ray, and a line segment. Label each.'?'drawing':null;
   if(!activityMode)throw Error('Original lines prompt changed');
   if(!selected.has(activityMode))selected.set(activityMode,{...q,activityMode,sourceSeed,sourceGroup,sourceIndex});
  }));
  if(selected.size!==3)throw Error('Expected three original line tasks');
  return ['parallel','perpendicular','drawing'].map(mode=>selected.get(mode));
 }

 if(type.bank==='grade-extension'&&type.id==='rectangle-square-symmetry'){
  if(type.sourceGrade!==4||type.sourceUnit!=='symmetry'||type.count!==2)throw Error('Unsupported symmetry source');
  const selected=new Map(),sourceSeed=seed>>>0;
  root.GradeMath.generate(4,'symmetry',sourceSeed).forEach((g,sourceGroup)=>g.questions.forEach((q,sourceIndex)=>{
   const m=q.visual.match(/<rect x="60" y="10" width="(\d+)" height="(\d+)"/);if(!m)throw Error('Original symmetry diagram changed');
   const shape=m[1]===m[2]?'square':'rectangle';
   if(!selected.has(shape))selected.set(shape,{...q,shape,sourceSeed,sourceGroup,sourceIndex});
  }));
  if(selected.size!==2)throw Error('Expected two original symmetry shapes');
  return [selected.get('square'),selected.get('rectangle')];
 }

 if(type.bank==='grade-extension'&&type.id==='three-digit-number-names'){
  if(type.sourceGrade!==2||type.sourceUnit!=='number-names'||type.count!==4)throw Error('Unsupported number-name source');
  const buckets={digits:[],words:[]},seen=new Set();
  for(let pass=0;pass<64&&Object.values(buckets).some(b=>b.length<2);pass++){
   const sourceSeed=(seed+Math.imul(pass,0x9e3779b9))>>>0;
   root.GradeMath.generate(2,'number-names',sourceSeed).forEach((group,sourceGroup)=>group.questions.forEach((q,sourceIndex)=>{
    const activityMode=q.prompt==='Write this number using digits.'?'digits':q.prompt==='Write this number in words.'?'words':null;
    if(!activityMode)return;
    const match=q.task.match(/^<p>(.*?)<\/p>/);if(!match)throw Error('Original number-name task changed');
    const given=match[1],number=Number(activityMode==='digits'?q.answer:given);
    if(!Number.isInteger(number)||number<100||number>999)throw Error('Original number-name range changed');
    if(buckets[activityMode].length===2||seen.has(number))return;
    seen.add(number);buckets[activityMode].push({...q,given,number,activityMode,sourceSeed,sourceGroup,sourceIndex});
   }));
  }
  if(Object.values(buckets).some(b=>b.length!==2))throw Error('Insufficient original number-name questions');
  return [0,1].flatMap(i=>[buckets.digits[i],buckets.words[i]]);
 }

 if(type.bank==='grade-extension'&&type.id==='elapsed-time-word-problems'){
  if(type.sourceGrade!==3||type.sourceUnit!=='elapsed'||type.count!==6)throw Error('Unsupported elapsed-time source');
  const buckets={duration:[],finish:[],start:[]},seen=new Set();
  for(let pass=0;pass<64&&Object.values(buckets).some(b=>b.length<2);pass++){
   const sourceSeed=(seed+Math.imul(pass,0x9e3779b9))>>>0;
   root.GradeMath.generate(3,'elapsed',sourceSeed).forEach((group,sourceGroup)=>group.questions.forEach((q,sourceIndex)=>{
    const activityMode=q.prompt.endsWith('How many minutes?')?'duration':q.prompt.endsWith('When do you finish?')?'finish':q.prompt.endsWith('When did you start?')?'start':null;
    if(!activityMode)throw Error('Original elapsed-time format changed');
    if(buckets[activityMode].length===2||seen.has(q.prompt))return;
    seen.add(q.prompt);buckets[activityMode].push({...q,activityMode,answerUnit:activityMode==='duration'?'minutes':'',sourceSeed,sourceGroup,sourceIndex});
   }));
  }
  if(Object.values(buckets).some(b=>b.length!==2))throw Error('Insufficient original elapsed-time questions');
  return [0,1].flatMap(i=>['duration','finish','start'].map(mode=>buckets[mode][i]));
 }

 if(type.bank==='grade-extension'&&type.id==='skip-count-five-ten-hundred'){
  if(type.sourceGrade!==2||type.sourceUnit!=='skip'||type.count!==6)throw Error('Unsupported forward sequence source');
  const buckets={5:[],10:[],100:[]},seen=new Set();
  for(let pass=0;pass<64&&Object.values(buckets).some(b=>b.length<2);pass++){
   const sourceSeed=(seed+Math.imul(pass,0x9e3779b9))>>>0;
   root.GradeMath.generate(2,'skip',sourceSeed).forEach((group,sourceGroup)=>group.questions.forEach((q,sourceIndex)=>{
    const m=q.prompt.match(/^Start at (\d+)\. Add (5|10|100) each time\.$/);
    if(!m)throw Error('Original forward sequence format changed');
    const start=Number(m[1]),step=Number(m[2]);
    if(start<0||start+3*step>1000||q.answer!==`${start+2*step}, ${start+3*step}`)throw Error('Original forward sequence answer mismatch');
    if(buckets[step].length===2||seen.has(q.prompt))return;
    seen.add(q.prompt);buckets[step].push({...q,start,step,sourceSeed,sourceGroup,sourceIndex});
   }));
  }
  if(Object.values(buckets).some(b=>b.length!==2))throw Error('Insufficient original forward sequences');
  return [0,1].flatMap(i=>[5,10,100].map(step=>buckets[step][i]));
 }

 if(type.bank==='grade-extension'&&type.id==='ten-hundred-more-less'){
  if(type.sourceGrade!==2||type.sourceUnit!=='mental'||type.count!==4)throw Error('Unsupported Grade2 mental source');
  const keys=['10-more','10-less','100-more','100-less'],selected=new Map();
  for(let pass=0;pass<64&&selected.size<4;pass++){
   const sourceSeed=(seed+Math.imul(pass,0x9e3779b9))>>>0;
   root.GradeMath.generate(2,'mental',sourceSeed).forEach((group,sourceGroup)=>group.questions.forEach((q,sourceIndex)=>{
    const m=q.prompt.match(/^Find (10|100) (more|less) than (\d+)\.$/);
    if(!m)throw Error('Original Grade2 mental format changed');
    const change=Number(m[1]),direction=m[2],number=Number(m[3]),key=m[1]+'-'+direction;
    if(number<100||number>900||Number(q.answer)!==number+(direction==='more'?change:-change))throw Error('Original Grade2 mental answer mismatch');
    if(!selected.has(key))selected.set(key,{...q,number,change,direction,sourceSeed,sourceGroup,sourceIndex});
   }));
  }
  if(selected.size!==4)throw Error('Insufficient original Grade2 mental activities');
  return keys.map(key=>selected.get(key));
 }

 if(type.bank==='grade-extension'&&type.id==='ten-more-less'){
  if(type.sourceGrade!==1||type.sourceUnit!=='ten-more'||type.count!==6)throw Error('Unsupported ten more/less source');
  const buckets={more:[],less:[]},seen=new Set();
  for(let pass=0;pass<32&&(buckets.more.length<3||buckets.less.length<3);pass++){
   const sourceSeed=(seed+Math.imul(pass,0x9e3779b9))>>>0;
   root.GradeMath.generate(1,'ten-more',sourceSeed).forEach((group,sourceGroup)=>group.questions.forEach((q,sourceIndex)=>{
    const m=q.prompt.match(/^Find 10 (more|less) than (\d+)\.$/);
    if(!m)throw Error('Original ten more/less format changed');
    const direction=m[1],number=Number(m[2]);
    if(number<10||number>89||Number(q.answer)!==number+(direction==='more'?10:-10))throw Error('Original ten more/less mismatch');
    if(buckets[direction].length===3||seen.has(q.prompt))return;
    seen.add(q.prompt);buckets[direction].push({...q,number,direction,sourceSeed,sourceGroup,sourceIndex});
   }));
  }
  if(buckets.more.length!==3||buckets.less.length!==3)throw Error('Insufficient original ten more/less questions');
  return buckets.more.flatMap((q,i)=>[q,buckets.less[i]]);
 }
 if(type.bank==='grade-extension'&&type.id==='compare-two-digit-numbers'){
  if(type.sourceGrade!==1||type.sourceUnit!=='compare'||type.count!==6)throw Error('Unsupported two-digit comparison source');
  const selected=[],seen=new Set();
  for(let pass=0;pass<32&&selected.length<6;pass++){
   const sourceSeed=(seed+Math.imul(pass,0x9e3779b9))>>>0;
   root.GradeMath.generate(1,'compare',sourceSeed).forEach((group,sourceGroup)=>group.questions.forEach((q,sourceIndex)=>{
    const m=q.task.match(/^(\d+) <span class="write-box"><\/span> (\d+)/);
    if(!m)throw Error('Original comparison format changed');
    const a=Number(m[1]),b=Number(m[2]),key=a+':'+b;
    if(a<0||a>99||b<0||b>99||q.answer!==(a<b?'<':a>b?'>':'='))throw Error('Original comparison mismatch');
    if(a<10||b<10||selected.length===6||seen.has(key))return;
    seen.add(key);selected.push({...q,a,b,sourceSeed,sourceGroup,sourceIndex});
   }));
  }
  if(selected.length!==6)throw Error('Insufficient original two-digit comparisons');return selected;
 }
 if(type.bank==='grade-extension'&&type.id==='compare-large-whole-numbers'){
  if(type.sourceGrade!==4||type.sourceUnit!=='compare'||type.count!==6)throw Error('Unsupported large comparison source');
  const selected=[],seen=new Set();
  for(let pass=0;pass<32&&selected.length<6;pass++){
   const sourceSeed=(seed+Math.imul(pass,0x9e3779b9))>>>0;
   root.GradeMath.generate(4,'compare',sourceSeed).forEach((group,sourceGroup)=>group.questions.forEach((q,sourceIndex)=>{
    const m=q.task.match(/^(\d+) <span class="write-box"><\/span> (\d+)/);
    if(!m)throw Error('Original comparison format changed');
    const a=Number(m[1]),b=Number(m[2]),key=a+':'+b;
    if(a<0||a>999999||b<0||b>999999||q.answer!==(a<b?'<':a>b?'>':'='))throw Error('Original comparison mismatch');
    if(selected.length===6||seen.has(key))return;
    seen.add(key);selected.push({...q,a,b,sourceSeed,sourceGroup,sourceIndex});
   }));
  }
  if(selected.length!==6)throw Error('Insufficient original large comparisons');return selected;
 }
 if(type.bank==='grade-extension'&&type.id==='rounding-decimals'){
  if(type.sourceGrade!==5||type.sourceUnit!=='round-decimal'||type.count!==6)throw Error('Unsupported decimal rounding source');
  const selected=[],seen=new Set();let excluded=0;
  for(let pass=0;pass<32&&selected.length<6;pass++){
   const sourceSeed=(seed+Math.imul(pass,0x9e3779b9))>>>0;
   root.GradeMath.generate(5,'round-decimal',sourceSeed).forEach((group,sourceGroup)=>group.questions.forEach((q,sourceIndex)=>{
    if(selected.length===6)return;
    const m=q.prompt.match(/^Round (\d+(?:\.\d{1,2})?) to the nearest (whole number|tenth)\.$/);
    if(!m)throw Error('Original decimal rounding format changed');
    const [whole,decimal='']=m[1].split('.'),cents=Number(whole)*100+Number(decimal.padEnd(2,'0')),step=m[2]==='tenth'?10:100;
    const lower=Math.floor(cents/step)*step,expected=(cents-lower>=step/2?lower+step:lower)/100;
    if(Number(q.answer)!==expected){excluded++;return;}
    if(seen.has(q.prompt))return;
    seen.add(q.prompt);selected.push({...q,sourceSeed,sourceGroup,sourceIndex});
   }));
  }
  if(selected.length!==6)throw Error('Insufficient verified original decimal rounding questions');
  return selected.map(q=>({...q,excludedIncorrectCandidates:excluded}));
 }
 if(type.bank==='grade-extension'&&type.id==='rounding-tens-hundreds'){
  if(type.sourceGrade!==3||type.sourceUnit!=='round'||type.count!==6)throw Error('Unsupported rounding source');
  const selected=[],seen=new Set();
  for(let pass=0;pass<32&&selected.length<6;pass++){
   const sourceSeed=(seed+Math.imul(pass,0x9e3779b9))>>>0;
   root.GradeMath.generate(3,'round',sourceSeed).forEach((group,sourceGroup)=>group.questions.forEach((q,sourceIndex)=>{
    const m=q.prompt.match(/^Round (\d+) to the nearest (10|100)\.$/);
    if(!m)throw Error('Original rounding format changed');
    const number=Number(m[1]),place=Number(m[2]),lower=Math.floor(number/place)*place,key=number+':'+place;
    if(Number(q.answer)!==(number-lower>=place/2?lower+place:lower))throw Error('Original rounding mismatch');
    if(selected.length===6||seen.has(key))return;
    seen.add(key);selected.push({...q,number,place,sourceSeed,sourceGroup,sourceIndex});
   }));
  }
  if(selected.length!==6)throw Error('Insufficient original rounding questions');return selected;
 }
 if(type.bank==='grade-extension'&&type.id==='coordinate-ordered-pairs'){
  if(type.sourceGrade!==5||type.sourceUnit!=='coordinate'||type.count!==4)throw Error('Unsupported coordinate source');
  const selected=[],seen=new Set();
  for(let pass=0;pass<32&&selected.length<4;pass++){
   const sourceSeed=(seed+Math.imul(pass,0x9e3779b9))>>>0;
   root.GradeMath.generate(5,'coordinate',sourceSeed)[0].questions.forEach((q,sourceIndex)=>{
    const m=q.visual.match(/<circle cx="(\d+)" cy="(\d+)"/);
    if(!m)throw Error('Original coordinate diagram changed');
    const x=(Number(m[1])-35)/12,y=(75-Number(m[2]))/12;
    if(!Number.isInteger(x)||!Number.isInteger(y)||x<1||x>5||y<1||y>5||q.answer!=='('+x+', '+y+')')throw Error('Original coordinate mismatch');
    if(selected.length===4||seen.has(q.answer))return;
    seen.add(q.answer);selected.push({...q,x,y,sourceSeed,sourceGroup:0,sourceIndex});
   });
  }
  if(selected.length!==4)throw Error('Insufficient original coordinate questions');return selected;
 }
 if(type.bank==='grade-extension'&&type.id==='volume-unit-cube-layers'){
  if(type.sourceGrade!==5||type.sourceUnit!=='volume-cubes'||type.count!==4)throw Error('Unsupported volume layer source');
  const selected=[],seen=new Set();
  for(let pass=0;pass<32&&selected.length<4;pass++){
   const sourceSeed=(seed+Math.imul(pass,0x9e3779b9))>>>0;
   root.GradeMath.generate(5,'volume-cubes',sourceSeed).forEach((group,sourceGroup)=>group.questions.forEach((q,sourceIndex)=>{
    const m=q.prompt.match(/^A solid has (\d+) layers\. Each layer has (\d+) rows of (\d+) unit cubes\. Find its volume\.$/);
    if(!m)throw Error('Original volume prompt changed');
    const [layers,rows,cols]=m.slice(1).map(Number),key=[layers,rows,cols].join(':');
    if(Number(q.answer)!==layers*rows*cols)throw Error('Original volume mismatch');
    if(selected.length===4||seen.has(key))return;
    seen.add(key);selected.push({...q,layers,rows,cols,sourceSeed,sourceGroup,sourceIndex});
   }));
  }
  if(selected.length!==4)throw Error('Insufficient original volume questions');return selected;
 }
 if(type.bank==='grade-extension'&&type.id==='area-count-square-units'){
  if(type.sourceGrade!==3||type.sourceUnit!=='area-tiles'||type.count!==6)throw Error('Unsupported area tile source');
  const selected=[],seen=new Set();
  for(let pass=0;pass<32&&selected.length<6;pass++){
   const sourceSeed=(seed+Math.imul(pass,0x9e3779b9))>>>0;
   root.GradeMath.generate(3,'area-tiles',sourceSeed).forEach((group,sourceGroup)=>{
    if(sourceGroup===1)return;
    group.questions.forEach((q,sourceIndex)=>{
     const tiles=[...q.visual.matchAll(/<rect x="([\d.]+)" y="([\d.]+)" width="18" height="18"/g)];
     const cols=new Set(tiles.map(m=>m[1])).size,rows=new Set(tiles.map(m=>m[2])).size,key=rows+':'+cols;
     if(!tiles.length||tiles.length!==rows*cols||Number(q.answer)!==tiles.length)throw Error('Original area tile mismatch');
     if(selected.length===6||seen.has(key))return;
     seen.add(key);selected.push({...q,rows,cols,sourceSeed,sourceGroup,sourceIndex});
    });
   });
  }
  if(selected.length!==6)throw Error('Insufficient original area grids');return selected;
 }
 if(type.bank==='grade-extension'&&type.id==='rectangle-perimeter'){
  if(type.sourceGrade!==3||type.sourceUnit!=='perimeter'||type.count!==6)throw Error('Unsupported perimeter source');
  const selected=[],seen=new Set();
  for(let pass=0;pass<32&&selected.length<6;pass++){
   const sourceSeed=(seed+Math.imul(pass,0x9e3779b9))>>>0;
   root.GradeMath.generate(3,'perimeter',sourceSeed).forEach((group,sourceGroup)=>group.questions.forEach((q,sourceIndex)=>{
    const aMatch=q.visual.match(/>(\d+) units<\/text>/),bMatch=q.visual.match(/>(\d+) units high<\/text>/);
    if(!aMatch||!bMatch)throw Error('Original rectangle labels changed');
    const a=Number(aMatch[1]),b=Number(bMatch[1]),key=[a,b].sort((x,y)=>x-y).join(':');
    if(a<2||a>9||b<2||b>9||Number(q.answer)!==2*(a+b))throw Error('Original perimeter mismatch');
    if(selected.length===6||seen.has(key))return;
    seen.add(key);selected.push({...q,a,b,sourceSeed,sourceGroup,sourceIndex});
   }));
  }
  if(selected.length!==6)throw Error('Insufficient original perimeter questions');return selected;
 }
 if(type.bank==='grade-extension'&&['clock-hours-half-hours','clock-five-minutes'].includes(type.id)){
  const sourceGrade=type.id==='clock-five-minutes'?2:1;
  if(type.sourceGrade!==sourceGrade||type.sourceUnit!=='clock'||type.count!==6)throw Error('Unsupported clock source');
  const selected=[],seen=new Set();
  for(let pass=0;pass<32&&selected.length<6;pass++){
   const sourceSeed=(seed+Math.imul(pass,0x9e3779b9))>>>0;
   root.GradeMath.generate(sourceGrade,'clock',sourceSeed).forEach((group,sourceGroup)=>group.questions.forEach((q,sourceIndex)=>{
    if(!(sourceGrade===1?/^(?:[1-9]|1[0-2]):(?:00|30)$/:/^(?:[1-9]|1[0-2]):[0-5][05]$/).test(q.answer)||!q.visual.includes('<svg'))throw Error('Original clock format changed');
    if(selected.length===6||seen.has(q.answer))return;
    seen.add(q.answer);selected.push({...q,sourceSeed,sourceGroup,sourceIndex});
   }));
  }
  if(selected.length!==6)throw Error('Insufficient original clock questions');return selected;
 }
 if(type.bank==='grade-extension'&&['two-digit-expanded-form','three-digit-expanded-form'].includes(type.id)){
  const sourceGrade=type.id==='two-digit-expanded-form'?1:2;
  if(type.sourceGrade!==sourceGrade||type.sourceUnit!=='place'||type.count!==6)throw Error('Unsupported expanded-form source');
  const questions=[],seen=new Set();
  for(let pass=0;pass<32&&questions.length<6;pass++){
   const sourceSeed=(seed+pass)>>>0;
   root.GradeMath.generate(sourceGrade,'place',sourceSeed)[2].questions.forEach((q,sourceIndex)=>{
    const match=q.task.match(/class="equation">(\d+)</);
    if(!match)throw Error('Missing original expanded-form numeral');
    const number=Number(match[1]);
    if(number<(sourceGrade===1?10:100)||number>(sourceGrade===1?99:999))throw Error('Expanded-form source outside three-digit range');
    if(questions.length===6||seen.has(number))return;
    seen.add(number);questions.push({...q,number,sourceSeed,sourceGroup:2,sourceIndex});
   });
  }
  if(questions.length!==6)throw Error('Insufficient original expanded-form questions');
  return questions;
 }
 if(type.bank==='grade-extension'&&type.sourceUnit==='fraction-line'){
  if(type.sourceGrade!==3||type.count!==6)throw Error('Unsupported fraction number-line selection');
  const selected=[],seen=new Set();
  for(let pass=0;pass<32&&selected.length<6;pass++){
   const sourceSeed=(seed+Math.imul(pass,0x9e3779b9))>>>0;
   root.GradeMath.generate(3,'fraction-line',sourceSeed).forEach((group,sourceGroup)=>group.questions.forEach((q,sourceIndex)=>{
    const ticks=[...q.visual.matchAll(/<path d="M([0-9.]+) 30v10"/g)].map(m=>+m[1]);
    const d=ticks.length-1,m=q.visual.match(/<circle cx="([0-9.]+)"/),ans=String(q.answer).match(/^(\d+)\/(\d+)$/);
    if(![2,3,4,6,8].includes(d)||!m||!ans)throw Error('Original fraction number-line format changed');
    const x=+m[1],n=Math.round((x-15)*d/180),key=n+'/'+d;
    if(n<1||n>=d||+ans[1]*d!==n*+ans[2]||Math.abs(x-(15+n*180/d))>1e-8||ticks.some((t,i)=>Math.abs(t-(15+i*180/d))>1e-8))throw Error('Original number-line mismatch');
    if(seen.has(key)||selected.length===6)return;seen.add(key);
    selected.push({...q,prompt:'What fraction is marked?',sourceSeed,sourceGroup,sourceIndex,sourceAnswer:q.answer,sourceVisual:q.visual,reason:'There are '+d+' equal intervals from 0 to 1. The point is '+n+' intervals from 0.'});
   }));
  }
  if(selected.length!==6)throw Error('Insufficient original fraction number lines');return selected;
 }
 if(type.bank==='grade-extension'){
  if(type.sourceGrade===5&&type.sourceUnit==='fraction-products'&&type.response==='recipe-fraction-story'){
   if(type.count!==4)throw Error('Recipe set needs four stories');
   const proper=[],improper=[],seen=new Set();
   for(let pass=0;pass<64&&(proper.length<2||improper.length<2);pass++){
    const sourceSeed=(seed+pass)>>>0,groups=root.GradeMath.generate(5,'fraction-products',sourceSeed);
    for(let sourceGroup=0;sourceGroup<groups.length;sourceGroup++)for(let sourceIndex=0;sourceIndex<groups[sourceGroup].questions.length;sourceIndex++){
     const q=groups[sourceGroup].questions[sourceIndex],m=q.prompt.match(/^A recipe uses (\d+)\/(\d+) cup\. Make (\d+)\/(\d+) of the recipe\. How much is needed\?$/);if(!m||q.open||q.visual)throw Error('Unexpected recipe source');
     const [n,d,c,e]=m.slice(1).map(Number),[v,z=1]=q.answer.split('/').map(Number);
     if(d<2||d>8||e<2||e>8||n<1||n>=2*d||n===d||c<1||c>=e||v*d*e!==n*c*z)throw Error('Recipe range or exact answer');
     const target=n>d?improper:proper;if(target.length===2||seen.has(q.prompt))continue;seen.add(q.prompt);
     target.push({...q,prompt:q.prompt.replace(' cup.',n>d?' cups.':' of a cup.'),a:n+'/'+d,b:c+'/'+e,op:'×',fractionStory:true,recipeFractionStory:true,work:n+'/'+d+' × '+c+'/'+e+' = '+q.answer,sourceSeed,sourceGroup,sourceIndex});
    }
   }
   if(proper.length!==2||improper.length!==2)throw Error('Incomplete recipe fraction set');return [...proper,...improper];
  }

  if(type.sourceGrade===4&&type.sourceUnit==='stories'&&type.response==='vehicle-count'){
   if(type.count!==4)throw Error('Vehicle set needs four stories');
   const exact=[],rounded=[],seen=new Set();
   for(let pass=0;pass<64&&(exact.length<1||rounded.length<3);pass++){
    const sourceSeed=(seed+pass)>>>0,sourceGroup=2,group=root.GradeMath.generate(4,'stories',sourceSeed)[sourceGroup];
    for(let sourceIndex=0;sourceIndex<group.questions.length;sourceIndex++){
     const q=group.questions[sourceIndex],m=q.prompt.match(/^(\d+) students ride in vans holding (\d+) students each\. How many vans are needed\?$/);
     if(!m||q.open||q.visual)throw Error('Unexpected vehicle source');
     const a=+m[1],b=+m[2],quotient=Math.floor(a/b),remainder=a%b;
     if(b<2||b>9||a<2*b+1||a>9*b+8||Number(q.answer)!==quotient+(remainder?1:0))throw Error('Vehicle source range or answer');
     const target=remainder?rounded:exact,limit=remainder?3:1;
     if(target.length===limit||seen.has(q.prompt))continue;seen.add(q.prompt);
     target.push({...q,a,b,op:'÷',vehicleStory:true,quotient,remainder,work:a+' ÷ '+b+' = '+quotient+(remainder?' R '+remainder:''),sourceSeed,sourceGroup,sourceIndex});
    }
   }
   if(exact.length!==1||rounded.length!==3)throw Error('Incomplete vehicle story set');
   return [rounded[0],exact[0],rounded[1],rounded[2]];
  }

  if(type.sourceGrade===4&&type.sourceUnit==='measure-stories'&&type.response==='measurement-story'){
   const selected=new Map(),slots=['liters/×','liters/−','grams/×','grams/−'];
   if(type.count!==4)throw Error('Measurement set needs four unit/operation slots');
   for(let pass=0;pass<64&&selected.size<4;pass++){
    const sourceSeed=(seed+pass)>>>0,groups=root.GradeMath.generate(4,'measure-stories',sourceSeed);
    for(let sourceGroup=0;sourceGroup<groups.length;sourceGroup++)for(let sourceIndex=0;sourceIndex<groups[sourceGroup].questions.length;sourceIndex++){
     const q=groups[sourceGroup].questions[sourceIndex];let m=q.prompt.match(/^(?:There are) (\d+) containers holding (\d+) (liters|grams) each\. How much altogether\?$/),a,b,answerUnit,op;
     if(m){a=+m[1];b=+m[2];answerUnit=m[3];op='×';if(a<2||a>9||b<2||b>9)throw Error('Measurement product range');}
     else{m=q.prompt.match(/^A container holds (\d+) (liters|grams)\. Use (\d+)\. How much remains\?$/);if(!m)throw Error('Unexpected measurement story');a=+m[1];b=+m[3];answerUnit=m[2];op='−';if(a<4||a>81||b<1||b>Math.min(a,8))throw Error('Measurement difference range');}
     if(q.open||q.visual||q.task!=='<span class="write-box"></span> '+answerUnit||Number(q.answer)!==(op==='×'?a*b:a-b))throw Error('Measurement source answer or unit');
     const key=answerUnit+'/'+op;if(!selected.has(key))selected.set(key,{...q,a,b,op,answerUnit,measurementStory:true,work:a+' '+op+' '+b+' = '+q.answer,sourceSeed,sourceGroup,sourceIndex});
    }
   }
   if(selected.size!==4)throw Error('Incomplete measurement set');return slots.map(key=>selected.get(key));
  }

  const multiply=type.sourceGrade===3&&type.response==='two-step-multiply-subtract';
  const length=type.sourceGrade===2&&type.sourceUnit==='length-story'&&type.response==='two-step-length';
   if(!length&&(type.sourceUnit!=='stories'||!(multiply||type.sourceGrade===2&&type.response==='two-step-add-subtract')))throw Error('Unsupported grade story');
  const chosen=[],seen=new Set();
  for(let pass=0;pass<16&&chosen.length<type.count;pass++){
   const sourceSeed=(seed+pass)>>>0,groups=root.GradeMath.generate(type.sourceGrade,type.sourceUnit,sourceSeed);
   for(let groupIndex=0;groupIndex<groups.length;groupIndex++)for(let sourceIndex=0;sourceIndex<groups[groupIndex].questions.length;sourceIndex++){
    const q=groups[groupIndex].questions[sourceIndex];if(chosen.length===type.count||seen.has(q.prompt))continue;
    const m=q.prompt.match(length?/^Join ribbons (\d+) cm and (\d+) cm long\. Cut off (\d+) cm\. How many centimeters remain\?$/:multiply?/^(\d+) boxes hold (\d+) pencils each\. (\d+) pencils are used\. How many are left\?$/:/^There are (\d+) shells\. Find (\d+) more, then give away (\d+)\. How many remain\?$/);if(!m||q.open||q.visual)throw Error('Unexpected two-step source');
    const [a,b,c]=m.slice(1).map(Number),subtotal=multiply?a*b:a+b,value=Number(q.answer);
    if(value!==subtotal-c||(multiply?(a<2||a>9||b<2||b>9||c<1||c>8||c>subtotal):(a<4||a>18||b<1||b>8||c<2||c>9||a-c<2||a-c>9||subtotal>26)))throw Error('Two-step source range or answer');
    seen.add(q.prompt);chosen.push({...q,prompt:multiply?q.prompt.replace('1 pencils are used','1 pencil is used'):q.prompt,a,b,c,op:'two-step',firstOperation:multiply?'×':'+',twoStep:true,subtotal,steps:[a+(multiply?' × ':' + ')+b+' = '+subtotal,subtotal+' − '+c+' = '+q.answer],sourceSeed,sourceGroup:groupIndex,sourceIndex});
   }
  }
  if(chosen.length!==type.count)throw Error('Not enough distinct original two-step stories');return chosen;
 }

 if(type.bank==='legacy-core'&&type.method==='compare'){
  if(type.sourceUnit!=='2-1-1'||type.sourceProfile!==0||type.count!==6)throw Error('Unsupported three-digit comparison selection');
  const selected=[],seen=new Set();
  for(let pass=0;pass<32&&selected.length<6;pass++){
   const sourceSeed=(seed+Math.imul(pass,0x9e3779b9))>>>0;
   const group=root.SharedCoreBank.generate(type.sourceUnit,0,sourceSeed,12,[]).find(g=>g.method==='compare');
   if(!group)throw Error('Original comparison group missing');
   group.questions.forEach((q,sourceIndex)=>{
    const m=q.visual.match(/<div class="kequation">(\d+) □ (\d+)<\/div>/);
    if(!m)throw Error('Original comparison format changed');
    const a=+m[1],b=+m[2],expected=a>b?'>':a<b?'<':'=';
    if(q.answer!==expected)throw Error('Original comparison answer mismatch');
    const key=a+':'+b;if(a<100||a>999||b<100||b>999||seen.has(key)||selected.length===6)return;
    seen.add(key);selected.push({...q,a,b,visual:'',prompt:'Compare. Write >, <, or =.',reason:'Compare hundreds, then tens, then ones. Stop at the first different place.',sourcePrompt:q.prompt,sourceVisual:q.visual,sourceAnswer:q.answer,sourceReason:q.reason,sourceSeed,sourceIndex});
   });
  }
  if(selected.length!==6)throw Error('Insufficient original three-digit comparisons');return selected;
 }
 if(type.bank==='legacy-core'&&type.method==='fraction-model'){
  if(type.sourceUnit!=='3-1-6'||type.sourceProfile!==0||type.count!==6)throw Error('Unsupported shaded fraction selection');
  const selected=[],seen=new Set();
  for(let pass=0;pass<32&&selected.length<6;pass++){
   const sourceSeed=(seed+Math.imul(pass,0x9e3779b9))>>>0;
   const group=root.SharedCoreBank.generate(type.sourceUnit,0,sourceSeed,12,[]).find(g=>g.method==='fraction-model');
   if(!group)throw Error('Original shaded fraction group missing');
   group.questions.forEach((q,sourceIndex)=>{
    const m=String(q.answer).match(/^(\d+)\/(\d+)$/),svg=q.visual.match(/<svg[\s\S]*?<\/svg>/);
    if(!m||!svg)throw Error('Original fraction model format changed');
    const n=+m[1],d=+m[2];
    if(n<1||n>=d||(svg[0].match(/<rect /g)||[]).length!==d||(svg[0].match(/fill="#8fc6c1"/g)||[]).length!==n)throw Error('Original fraction diagram mismatch');
    if(![2,3,4,6,8].includes(d)||seen.has(q.answer)||selected.length===6)return;
    seen.add(q.answer);selected.push({...q,prompt:'What fraction of the whole strip is shaded?',visual:svg[0],reason:n+' of '+d+' equal parts are shaded.',sourceVisual:q.visual,sourcePrompt:q.prompt,sourceAnswer:q.answer,sourceReason:q.reason,sourceSeed,sourceIndex});
   });
  }
  if(selected.length!==6)throw Error('Insufficient original fraction models');return selected;
 }
 if(type.bank==='legacy-core'&&type.method==='common-denominator'){
  if(type.sourceUnit!=='5-1-4'||type.sourceProfile!==0||type.count!==6)throw Error('Unsupported common denominator selection');
  const selected=[],seen=new Set(),gcd=(a,b)=>b?gcd(b,a%b):a;
  for(let pass=0;pass<32&&selected.length<6;pass++){
   const sourceSeed=(seed+Math.imul(pass,0x9e3779b9))>>>0;
   const group=root.SharedCoreBank.generate(type.sourceUnit,0,sourceSeed,12,[]).find(g=>g.method==='common-denominator');
   if(!group)throw Error('Original common denominator group missing');
   group.questions.forEach((q,sourceIndex)=>{
    const f=[...q.visual.matchAll(/<span class="kf"><span>(\d+)<\/span><span>(\d+)<\/span><\/span>/g)].map(m=>[+m[1],+m[2]]);
    const ans=String(q.answer).match(/^(\d+)\/(\d+), (\d+)\/(\d+)$/);
    if(f.length!==2||!ans)throw Error('Original common denominator format changed');
    const [[a,d],[b,e]]=f,l=d*e/gcd(d,e),key=a+'/'+d+':'+b+'/'+e;
    if(d<2||d>9||e!==d+1||b!==1||a<1||a>=d||+ans[2]!==l||+ans[4]!==l||+ans[1]*d!==a*l||+ans[3]*e!==b*l)throw Error('Original common denominator mismatch');
    if(seen.has(key)||selected.length===6)return;seen.add(key);
    selected.push({...q,a:a+'/'+d,b:b+'/'+e,answerLeft:ans[1]+'/'+ans[2],answerRight:ans[3]+'/'+ans[4],visual:'',prompt:'Use the least common denominator. Rewrite both fractions.',reason:'The least common denominator is '+l+'.',sourcePrompt:q.prompt,sourceVisual:q.visual,sourceAnswer:q.answer,sourceReason:q.reason,sourceSeed,sourceIndex});
   });
  }
  if(selected.length!==6)throw Error('Insufficient original common denominator questions');return selected;
 }
 if(type.bank==='legacy-core'&&type.method==='reduce'){
  if(type.sourceUnit!=='5-1-4'||type.sourceProfile!==0||type.count!==6)throw Error('Unsupported simplification selection');
  const selected=[],seen=new Set(),gcd=(a,b)=>b?gcd(b,a%b):a;
  for(let pass=0;pass<32&&selected.length<6;pass++){
   const sourceSeed=(seed+Math.imul(pass,0x9e3779b9))>>>0;
   const group=root.SharedCoreBank.generate(type.sourceUnit,0,sourceSeed,12,[]).find(g=>g.method==='reduce');
   if(!group)throw Error('Original simplification group missing');
   group.questions.forEach((q,sourceIndex)=>{
    const m=q.visual.match(/<span class="kf"><span>(\d+)<\/span><span>(\d+)<\/span><\/span>/),ans=String(q.answer).match(/^(\d+)\/(\d+)$/);
    if(!m||!ans)throw Error('Original simplification format changed');
    const a=+m[1],d=+m[2],n=+ans[1],e=+ans[2],key=a+'/'+d;
    if(a<1||a>=d||d>45||a*e!==n*d||gcd(n,e)!==1||gcd(a,d)<2)throw Error('Original simplification mismatch');
    if(seen.has(key)||selected.length===6)return;seen.add(key);
    selected.push({...q,a:key,visual:'',prompt:'Write the fraction in simplest form.',reason:'Divide both numerator and denominator by '+gcd(a,d)+'.',sourcePrompt:q.prompt,sourceVisual:q.visual,sourceAnswer:q.answer,sourceReason:q.reason,sourceSeed,sourceIndex});
   });
  }
  if(selected.length!==6)throw Error('Insufficient original simplification questions');return selected;
 }
 if(type.bank==='legacy-core'&&type.method==='decimal-compare'){
  if(type.sourceUnit!=='4-2-3'||type.sourceProfile!==0||type.count!==6)throw Error('Unsupported decimal comparison selection');
  const selected=[],seen=new Set();
  for(let pass=0;pass<32&&selected.length<6;pass++){
   const sourceSeed=(seed+Math.imul(pass,0x9e3779b9))>>>0;
   const group=root.SharedCoreBank.generate(type.sourceUnit,0,sourceSeed,12,[]).find(g=>g.method==='decimal-compare');
   if(!group)throw Error('Original decimal comparison missing');
   group.questions.forEach((q,sourceIndex)=>{
    const m=q.visual.match(/<div class="kequation">([0-9.]+) □ ([0-9.]+)<\/div>$/);
    if(!m)throw Error('Original decimal comparison format changed');
    const a=Number(m[1]),b=Number(m[2]),expected=a>b?'>':a<b?'<':'=';
    if(a<0.001||a>3||b<0.001||b>3||q.answer!==expected)throw Error('Original decimal comparison mismatch');
    const key=m[1]+':'+m[2];if(seen.has(key)||selected.length===6)return;
    seen.add(key);selected.push({...q,a:m[1],b:m[2],visual:'',prompt:'Compare. Write >, <, or =.',reason:'Align the decimal points and compare from the greatest place.',sourcePrompt:q.prompt,sourceVisual:q.visual,sourceAnswer:q.answer,sourceReason:q.reason,sourceSeed,sourceIndex});
   });
  }
  if(selected.length!==6)throw Error('Insufficient original decimal comparisons');return selected;
 }
 if(type.bank==='legacy-core'&&type.method==='decimal-place'){
  if(type.sourceUnit!=='4-2-3'||type.sourceProfile!==0||type.count!==6)throw Error('Unsupported decimal digit selection');
  const selected=[],seen=new Set(),names=['tenths','hundredths','thousandths'];
  for(let pass=0;pass<32&&selected.length<6;pass++){
   const sourceSeed=(seed+Math.imul(pass,0x9e3779b9))>>>0;
   const group=root.SharedCoreBank.generate(type.sourceUnit,0,sourceSeed,12,[]).find(g=>g.method==='decimal-place');
   if(!group)throw Error('Original decimal digit group missing');
   group.questions.forEach((q,sourceIndex)=>{
    const m=q.prompt.match(/^(0\.\d{3})에서 소수 (첫째|둘째|셋째) 자리 숫자는 무엇인가요\?$/);
    if(!m)throw Error('Original decimal digit format changed');
    const pos=['첫째','둘째','셋째'].indexOf(m[2]),expected=Number(m[1][pos+2]);
    if(Number(q.answer)!==expected)throw Error('Original decimal digit answer mismatch');
    const key=m[1]+':'+pos;if(seen.has(key)||selected.length===6)return;
    seen.add(key);selected.push({...q,prompt:'In '+m[1]+', which digit is in the '+names[pos]+' place?',visual:'',a:m[1],place:names[pos],answer:expected,reason:'Read the places to the right of the decimal point: tenths, hundredths, thousandths.',sourcePrompt:q.prompt,sourceAnswer:q.answer,sourceReason:q.reason,sourceSeed,sourceIndex});
   });
  }
  if(selected.length!==6)throw Error('Insufficient original decimal digit questions');return selected;
 }
 if(type.bank==='legacy-core'&&type.method==='fraction-compare'){
  if(type.sourceUnit!=='3-1-6'||type.sourceProfile!==0||type.count!==6)throw Error('Unsupported fraction comparison selection');
  const selected=[],seen=new Set();
  for(let pass=0;pass<32&&selected.length<6;pass++){
   const sourceSeed=(seed+Math.imul(pass,0x9e3779b9))>>>0;
   const group=root.SharedCoreBank.generate(type.sourceUnit,0,sourceSeed,12,[]).find(g=>g.method==='fraction-compare');
   if(!group)throw Error('Original comparison group unavailable');
   group.questions.forEach((q,sourceIndex)=>{
    const f=[...q.visual.matchAll(/<span class="kf"><span>(\d+)<\/span><span>(\d+)<\/span><\/span>/g)].map(m=>[+m[1],+m[2]]);
    if(f.length!==2)throw Error('Original comparison format changed');
    const [[a,d],[b,e]]=f,expected=a*e>b*d?'>':a*e<b*d?'<':'=';
    if(d!==e||a<1||a>=d||b<1||b>=e||q.answer!==expected)throw Error('Original comparison mismatch');
    const key=a+'/'+d+':'+b+'/'+e;
    if(![2,3,4,6,8].includes(d)||seen.has(key)||selected.length===6)return;
    seen.add(key);selected.push({...q,a:a+'/'+d,b:b+'/'+e,visual:'',prompt:'Compare. Write >, <, or =.',reason:'The wholes and denominators match. Compare the numerators.',sourcePrompt:q.prompt,sourceVisual:q.visual,sourceAnswer:q.answer,sourceReason:q.reason,sourceSeed,sourceIndex});
   });
  }
  if(selected.length!==6)throw Error('Insufficient original fraction comparisons');return selected;
 }
 if(type.bank==='legacy-core'){
  if(!['length-compare','sort','flat-basic','flat-count','pattern','bond'].includes(type.method))throw Error('Unsupported core activity');
  const bondPictures=new Set(['red apple','pear','strawberry','banana','carrot','cookie','balloon','wrapped gift','rabbit','cat face','dog face','frog','fish','duck','butterfly','owl']);
  const excluded=type.method==='bond'?root.KoArt.items.filter(a=>!bondPictures.has(a.nameEn)).map(a=>a.id):[];
  const group=root.SharedCoreBank.generate(type.sourceUnit,type.sourceProfile,seed,type.count,excluded).find(g=>g.method===type.method);
  if(!group)throw Error('Original core activity unavailable');
  if(type.layout==='make-ten-missing'){
   const selected=[],seen=new Set();
   // Select existing whole=10 results across dispersed seeds; never change operands.
   for(let pass=0;pass<128&&selected.length<type.count;pass++){
    const sourceSeed=(seed+Math.imul(pass,0x9e3779b1))>>>0,candidates=pass===0?group.questions:root.SharedCoreBank.generate(type.sourceUnit,type.sourceProfile,sourceSeed,type.count,excluded).find(g=>g.method===type.method).questions;
    for(let sourceIndex=0;sourceIndex<candidates.length;sourceIndex++){
     const q=candidates[sourceIndex],m=q.prompt.match(/^(\d+)을 (\d+)과 □로 가르세요\.$/);
     if(!m)throw Error('Original make-ten bond format');
     const whole=Number(m[1]),given=Number(m[2]),value=Number(q.answer);
     if(whole!==10)continue;
     if(given<1||given>9||value!==10-given)throw Error('Original make-ten bond answer');
     if(seen.has(given))continue;seen.add(given);
     selected.push({...q,sourceSeed,sourceIndex,visual:'',prompt:'Write the missing number to make 10.',a:given,b:value,op:'missing',answer:value,reason:given+' and '+value+' make 10.'});
     if(selected.length===type.count)break;
    }
   }
   if(selected.length!==type.count)throw Error('Not enough original partners of ten');return selected;
  }
  if(type.method==='bond'){
   const selected=[],seen=new Set();
   for(let pass=0;pass<64&&selected.length<type.count;pass++){
    const sourceSeed=(seed+pass)>>>0,candidates=pass===0?group.questions:root.SharedCoreBank.generate(type.sourceUnit,type.sourceProfile,sourceSeed,type.count,excluded).find(g=>g.method===type.method).questions;
    for(let sourceIndex=0;sourceIndex<candidates.length;sourceIndex++){
     const q=candidates[sourceIndex],m=q.prompt.match(/^(\d+)을 (\d+)과 □로 가르세요\.$/),d=document.createElement('div');d.innerHTML=q.visual;
     const whole=m?Number(m[1]):NaN,part=m?Number(m[2]):NaN,value=Number(q.answer),pictures=[...d.querySelectorAll('.picture-count img')];
     if(!Number.isInteger(whole)||whole<2||whole>9||part<1||part>=whole||value!==whole-part||pictures.length!==whole||pictures.some(img=>!bondPictures.has(img.alt)))throw Error('Original number-bond picture/answer mismatch');
     const key=whole+':'+part;if(seen.has(key))continue;seen.add(key);selected.push({...q,sourceSeed,sourceIndex,visual:d.innerHTML,a:whole,b:part,op:'split-pictures',answer:value,prompt:'Circle '+part+' '+(part===1?'picture':'pictures')+'. Find the part outside the circles.',reason:part+' and '+value+' make '+whole+'. Any '+part+' pictures may be circled.'});if(selected.length===type.count)break;
    }
   }
   if(selected.length!==type.count)throw Error('Not enough original number bonds');return selected;
  }
  if(type.method==='pattern'){
   const selected=[],seen=new Set(),families={ABC:0,AAB:0};
   for(let pass=0;pass<128&&selected.length<type.count;pass++){
    const sourceSeed=(seed+pass)>>>0,candidates=pass===0?group.questions:root.SharedCoreBank.generate(type.sourceUnit,type.sourceProfile,sourceSeed,type.count,[]).find(g=>g.method===type.method).questions;
    for(let sourceIndex=0;sourceIndex<candidates.length;sourceIndex++){
     const q=candidates[sourceIndex],d=document.createElement('div');d.innerHTML=q.visual;const tokens=d.querySelector('.kequation')?.textContent.trim().split(/\s+/);
     if(!tokens||tokens.pop()!=='□'||tokens.some(s=>!['●','▲','■'].includes(s)))throw Error('Original pattern format mismatch');
     const unit=tokens.slice(0,3),family=unit.join('')==='●▲■'?'ABC':unit.join('')==='●●▲'?'AAB':null;
     if(!family||tokens.some((s,i)=>s!==unit[i%3])||q.answer!==unit[tokens.length%3])throw Error('Original repeating pattern mismatch');
     const key=tokens.join('');if(tokens.length<6||tokens.length>8||families[family]>=2||seen.has(key))continue;
     seen.add(key);families[family]++;selected.push({...q,sourceSeed,sourceIndex,visual:'',symbols:tokens,repeatUnit:unit,family,prompt:'Circle the first group of 3. Draw the next shape.',a:tokens.length,b:family,op:'repeat-pattern',answer:q.answer,reason:'Repeat '+unit.join(' ')+' in the same order.'});
    }
   }
   if(selected.length!==4||families.ABC!==2||families.AAB!==2)throw Error('Not enough varied original patterns');
   return selected;
  }
  if(['flat-basic','flat-count'].includes(type.method)){
   const countSides=type.method==='flat-count',selected=[],counts=countSides?{'0':0,'3':0,'4':0}:{'삼각형':0,'사각형':0,'원':0};
   for(let pass=0;pass<128&&selected.length<type.count;pass++){
    const sourceSeed=(seed+pass)>>>0,candidates=pass===0?group.questions:root.SharedCoreBank.generate(type.sourceUnit,type.sourceProfile,sourceSeed,type.count,[]).find(g=>g.method===type.method).questions;
    candidates.forEach((q,sourceIndex)=>{if(counts[q.answer]<2){counts[q.answer]++;selected.push({...q,sourceSeed,sourceIndex});}});
   }
   if(selected.length!==6||Object.values(counts).some(n=>n!==2))throw Error('Not enough original examples of each flat shape');
   return selected.map(q=>{
   const d=document.createElement('div');d.innerHTML=q.visual;const svg=d.querySelector('svg.concept-art'),polygon=svg?.querySelector('polygon'),circle=svg?.querySelector('circle');
   const points=polygon?[...polygon.points].map(p=>[p.x,p.y]):[],sides=points.length,value=circle?'circle':sides===3?'triangle':sides===4?'square':null;
   if(!value||(countSides?Number(q.answer)!==sides:q.answer!==({circle:'원',triangle:'삼각형',square:'사각형'}[value]))||svg.querySelectorAll('circle,polygon').length!==1)throw Error('Original flat shape mismatch');
   if(value==='square'){const edges=points.map((p,i)=>[points[(i+1)%4][0]-p[0],points[(i+1)%4][1]-p[1]]),lengths=edges.map(e=>e[0]**2+e[1]**2);if(lengths.some(n=>Math.abs(n-lengths[0])>0.001)||edges.some((e,i)=>Math.abs(e[0]*edges[(i+1)%4][0]+e[1]*edges[(i+1)%4][1])>0.001))throw Error('Pictured quadrilateral is not a square');}
   svg.setAttribute('viewBox','65 0 90 90');svg.setAttribute('aria-label',countSides?'A flat shape to trace and count its straight sides.':'A flat shape to trace and name.');
   if(countSides)return {...q,visual:svg.outerHTML,prompt:'Trace and count the straight sides.',a:sides,b:0,op:'count-sides',answer:sides,reason:sides===0?'The circle has a curved boundary and no straight sides.':sides+' straight sides. Count each edge once, stopping when you return to the start.'};
   return {...q,visual:svg.outerHTML,prompt:'Trace and name the shape.',a:sides,b:0,op:'name-shape',answer:value,reason:value==='square'?'Four equal straight sides and four square corners, even when turned.':value==='triangle'?'Three straight sides and three corners.':'A curved boundary with no straight sides or corners.'};
  });
  }
  if(type.method==='sort')return group.questions.map(q=>{
   const d=document.createElement('div');d.innerHTML=q.visual;
   const symbols=d.querySelector('.ksymbols')?.textContent.trim().split(/\s+/),target=q.prompt[0],names={'●':'circles','▲':'triangles','■':'squares'},value=Number(q.answer);
   if(!symbols||symbols.some(s=>!names[s])||!names[target]||!Number.isInteger(value)||value!==symbols.filter(s=>s===target).length||Object.keys(names).some(s=>symbols.filter(x=>x===s).length<1||symbols.filter(x=>x===s).length>6))throw Error('Original shape category/count mismatch');
   return {...q,visual:'',symbols,target,targetName:names[target],prompt:'Circle all the '+names[target]+'.',a:symbols.length,b:target,op:'count-shapes',answer:value,reason:'There are '+value+' '+names[target]+'. Count only the requested shape.'};
  });
  return group.questions.map(q=>{
   const d=document.createElement('div');d.innerHTML=q.visual;const svg=d.querySelector('svg.concept-art'),rects=[...svg.querySelectorAll('rect')],widths=rects.map(e=>Number(e.getAttribute('width'))),value=q.answer==='가'?'A':q.answer==='나'?'B':null;
   if(rects.length!==2||widths[0]===widths[1]||rects.some(e=>Number(e.getAttribute('x'))!==45||Number(e.getAttribute('height'))!==17)||value!==(widths[0]>widths[1]?'A':'B'))throw Error('Original length geometry/answer mismatch');
   svg.setAttribute('aria-label','Two bars labeled A and B, aligned at the left.');
   for(const text of svg.querySelectorAll('text')){if(text.textContent==='가'||text.textContent==='나'){text.textContent=text.textContent==='가'?'A':'B';text.setAttribute('font-size','20');}else{text.textContent='Start at the same end.';}}
   return {...q,visual:svg.outerHTML,prompt:'Circle the longer bar.',a:widths[0],b:widths[1],op:'length-compare',answer:value,reason:value+' extends farther from the shared starting point.'};
  });
 }

 if(type.bank==='early-arithmetic'){
 const familiar=new Set(['red apple','pear','strawberry','banana','carrot','grapes','cookie','cupcake','balloon','wrapped gift','rabbit','elephant','baby chick','bird','penguin','koala','cat face','dog face','frog','hamster','bear','panda','dolphin','duck','owl','fox','butterfly','giraffe','zebra','turtle','fish','tulip','sunflower']);
  const excluded=root.KoArt.items.filter(a=>!familiar.has(a.nameEn)).map(a=>a.id);
  const selected=[],seen=new Set();
  for(let pass=0;pass<32&&selected.length<type.count;pass++){
   const group=root.KoEarlyArithmetic.generate(type.sourceUnit,type.sourceProfile,(seed+pass)>>>0,type.count,excluded).find(g=>g.skill===type.method);
   if(!group||!['ten-frame','ten-missing'].includes(type.method))throw Error('Original make-ten activity unavailable');
   for(const q of group.questions){
    if(type.method==='ten-missing'){
     const node=document.createElement('div');node.innerHTML=q.visual;const match=node.querySelector('.kequation')?.textContent.match(/^(\d+) \+ □ = 10$/),given=match?Number(match[1]):NaN,value=Number(q.answer);
     if(!Number.isInteger(given)||given<5||given>9||value!==10-given||q.check.a!==given)throw Error('Original missing partner mismatch');
     if(!seen.has(given)){seen.add(given);selected.push({...q,visual:'',prompt:'Write the missing number to make 10.',a:given,b:value,op:'missing',answer:value,reason:given+' and '+value+' make 10.'});}
     if(selected.length===type.count)break;
     continue;
    }
    const d=document.createElement('div');d.innerHTML=q.visual;const cells=[...d.querySelectorAll('.ten-frame>span')],filled=cells.filter(e=>e.querySelector('img')).length,value=Number(q.answer);
    if(cells.length!==10||filled<5||filled>9||value!==10-filled||cells.some((e,i)=>!!e.querySelector('img')!==(i<filled)))throw Error('Original ten-frame mismatch');
    if(!seen.has(filled)){seen.add(filled);selected.push({...q,visual:d.innerHTML,prompt:'Draw dots to make 10.',a:filled,b:value,op:'make-ten',answer:value,reason:filled+' pictures and '+value+' new dots make 10.'});}
    if(selected.length===type.count)break;
   }
  }
  if(selected.length!==type.count)throw Error('Not enough different original ten frames');
  return selected;
 }

 if(type.bank==='early-numbers'){
  const familiar=new Set(['red apple','pear','strawberry','banana','carrot','grapes','cookie','cupcake','balloon','wrapped gift','rabbit','elephant','baby chick','bird','penguin','koala','cat face','dog face','frog','hamster','bear','panda','dolphin','duck','owl','fox','butterfly','giraffe','zebra','turtle','fish','tulip','sunflower']);
  const excluded=root.KoArt.items.filter(a=>!familiar.has(a.nameEn)).map(a=>a.id);
  let group=root.KoEarlyNumbers.generate(type.sourceProfile,seed,type.count,excluded).find(g=>g.skill===type.method);
  if(!group)throw Error('Original counting activity unavailable');
  if(type.method==='count'&&type.includeZero){
   const zero=root.KoEarlyNumbers.generate(2,seed,1,excluded).find(g=>g.skill==='zero')?.questions[0];
   if(!zero||zero.answer!=='0')throw Error('Original zero activity unavailable');
   const questions=group.questions.slice();questions[(seed>>>0)%questions.length]=zero;group={...group,questions};
  }
  if(['words','neighbors','line'].includes(type.method)){
   const selected=[],seen=new Set();
   for(let pass=0;pass<32&&selected.length<type.count;pass++){
    const candidates=pass===0?group.questions:root.KoEarlyNumbers.generate(type.sourceProfile,(seed+pass)>>>0,type.count,excluded).find(g=>g.skill===type.method).questions;
    for(const q of candidates){const node=document.createElement('div');node.innerHTML=q.visual;const key=node.querySelector(type.method==='words'?'.match-columns':type.method==='line'?'.concept-art':'.number-cards').textContent;if(!seen.has(key)){seen.add(key);selected.push(q);}if(selected.length===type.count)break;}
   }
   if(selected.length!==type.count)throw Error('Repeated activities could not be replaced from the original bank');
   group={...group,questions:selected};
  }
  return group.questions.map(q=>{
   const visual=q.visual.replace(/<div>가/g,'<div>A').replace(/<div>나/g,'<div>B');
   const d=document.createElement('div');d.innerHTML=visual;
   const counts=[...d.querySelectorAll('.picture-count')].map(e=>e.querySelectorAll('img').length);
   if(type.method==='count'&&q.methodId==='zero'){
    const empty=d.querySelector('.empty-count-basket');
    if(!empty||empty.querySelector('img')||q.answer!=='0')throw Error('Original empty group mismatch');
    d.querySelectorAll('.picture-badge').forEach(e=>e.remove());
    empty.textContent='';empty.classList.add('picture-count','count-zero-space');empty.setAttribute('aria-label','Empty counting area');
    return {...q,visual:d.innerHTML,prompt:'How many objects are inside the box?',a:0,b:0,op:'count',answer:0,sourceMethod:'zero',reason:'There are no objects inside. Write 0 to show none.'};
   }

   if(type.method==='ordinal'){
    const pictures=[...d.querySelectorAll('.ordinal-row img')],m=q.prompt.match(/^왼쪽부터 (\d+)번째 그림에만 동그라미 하세요\.$/),key=q.answer.match(/^왼쪽에서 (\d+)번째$/),target=m?Number(m[1]):NaN;
    if(pictures.length<4||pictures.length>8||!key||target!==Number(key[1])||target<1||target>pictures.length)throw Error('Original ordinal picture/answer mismatch');
    const word=['','first','second','third','fourth','fifth','sixth','seventh','eighth'][target];
    return {...q,visual:d.innerHTML,prompt:'Circle the '+word+' picture from the left.',a:pictures.length,b:target,op:'ordinal',answer:target,ordinalWord:word,reason:'Start at the left. Count each picture once and circle only position '+target+'.'};
   }
   if(type.method==='line'){
    const labels=[...d.querySelectorAll('svg.concept-art text')].map(e=>e.textContent.trim()),missing=labels.indexOf('□'),start=Number(labels[0]),value=Number(q.answer);
    if(labels.length!==5||labels.filter(n=>n==='□').length!==1||missing<1||missing>3||!Number.isInteger(start)||start<1||start>5||labels.some((n,i)=>i!==missing&&Number(n)!==start+i)||value!==start+missing)throw Error('Original number-line gap mismatch');
    return {...q,prompt:'Count by 1. Write the missing number.',a:start,b:missing,op:'number-line',lineValues:labels.map(n=>n==='□'?null:Number(n)),missingIndex:missing,answer:value};
   }
   if(type.method==='neighbors'){
    const cards=[...d.querySelectorAll('.number-cards>b')].map(e=>e.textContent.trim()),middle=Number(cards[1]),neighbors=String(q.answer).split(', ').map(Number);
    if(cards.length!==3||cards[0]!=='□'||cards[2]!=='□'||!Number.isInteger(middle)||middle<2||middle>8||neighbors.length!==2||neighbors[0]!==middle-1||neighbors[1]!==middle+1)throw Error('Original neighboring-number answer mismatch');
    return {...q,prompt:'Write the numbers just before and after.',a:middle,b:0,op:'neighbors',middle,neighbors,answer:neighbors.join(', ')};
   }
   if(type.method==='order'){
    const cards=[...d.querySelectorAll('.number-cards>b')].map(e=>Number(e.textContent));
    const sorted=String(q.answer).split(' → ').map(Number);
    if(cards.length!==3||new Set(cards).size!==3||cards.some(n=>!Number.isInteger(n)||n<1||n>9)||JSON.stringify(sorted)!==JSON.stringify([...cards].sort((a,b)=>a-b)))throw Error('Original ordering answer mismatch');
    return {...q,prompt:'Put the numbers in order.',a:cards.join(','),b:0,op:'order',cards,ordered:sorted,answer:sorted.join(' → ')};
   }
   if(type.method==='words'){
    const ko=['영','하나','둘','셋','넷','다섯','여섯','일곱','여덟','아홉'],en=['zero','one','two','three','four','five','six','seven','eight','nine'];
    const columns=[...d.querySelectorAll('.match-columns>div')];
    if(columns.length!==2)throw Error('Original matching columns missing');
    const left=[...columns[0].querySelectorAll('p')].map(e=>Number(e.textContent.replace('●','').trim()));
    const rightNodes=[...columns[1].querySelectorAll('p')],right=rightNodes.map(e=>ko.indexOf(e.textContent.replace('●','').trim()));
    if(left.length!==3||right.length!==3||new Set(left).size!==3||new Set(right).size!==3||left.some(n=>n<1||n>9||!right.includes(n))||q.answer!==left.map(n=>n+' → '+ko[n]).join(', '))throw Error('Original number-word mapping mismatch');
    rightNodes.forEach((e,i)=>{e.textContent='● '+en[right[i]];});
    return {...q,visual:d.innerHTML,prompt:'Match each number to its word.',a:left.join(','),b:right.join(','),op:'match-words',leftNumbers:left,rightNumbers:right,rightWords:right.map(n=>en[n]),matches:left.map(n=>right.indexOf(n)),answer:left.map(n=>n+' → '+en[n]).join(', ')};
   }
   if(type.method==='mark'){
    const match=String(q.answer).match(/^(\d+)개에 표시$/),target=match?Number(match[1]):NaN;
    if(counts.length!==1||counts[0]<4||counts[0]>9||!Number.isInteger(target)||target<1||target>=counts[0])throw Error('Original circling target mismatch');
    return {...q,visual,prompt:`Circle exactly ${target} ${target===1?'picture':'pictures'}.`,a:counts[0],b:target,op:'mark',answer:target};
   }
   if(type.method==='count'){
    if(counts.length!==1||counts[0]!==Number(q.answer))throw Error('Original counting answer mismatch');
    return {...q,visual,prompt:'Count the pictures. Write the number.',a:counts[0],b:0,op:'count',answer:Number(q.answer)};
   }
   if(type.method==='compare'){
    const answer=q.answer==='가'?'A':q.answer==='나'?'B':null;
    if(counts.length!==2||counts[0]===counts[1]||answer!==(counts[0]>counts[1]?'A':'B'))throw Error('Original comparison answer mismatch');
    return {...q,visual,prompt:'Circle the group with more pictures. Write A or B.',a:counts[0],b:counts[1],op:'compare-groups',answer};
   }
   throw Error('Unsupported early activity');
  });
 }

 if(type.bank==='reading-stories'){
  const selected=[],seen=new Set();
  for(let pass=0;pass<32&&selected.length<type.count;pass++){
   const size=Math.max(3,type.count);
   const groups=root.SharedReadingStories.generate(type.sourceUnit,type.sourceProfile,(seed+pass)>>>0,size).filter(g=>type.methods.includes(g.questions[0].methodId));
   if(!groups.length)throw Error('Reading-story methods unavailable');
   for(let i=0;i<size&&selected.length<type.count;i++)for(let g=0;g<groups.length&&selected.length<type.count;g++){
    const q=groups[g].questions[(i+g)%size];if(seen.has(q.prompt))continue;
    const answerText=q.methodId==='question'?q.answer.replace(/\$/g,''):q.answer;
    const m=answerText.match(/(\d+) ([+−]) (\d+) = (\d+)/);
    if(!m||Number(m[1])!==q.check.a||Number(m[3])!==q.check.b||Number(m[4])!==q.check.expected)throw Error('Source story and English answer disagree');
    const irrelevant={'extra-label':8,'extra-other':6,'extra-age':7}[q.methodId];
    if(irrelevant!==undefined&&[q.check.a,q.check.b].includes(irrelevant))continue;
    const extra={};
    if(type.response==='write-question'){
     const sample=q.answer.match(/^Example: (.+\?) \$(\d+) \+ \$(\d+) = \$(\d+)$/);
     if(!sample||Number(sample[2])!==q.check.a||Number(sample[3])!==q.check.b||Number(sample[4])!==q.check.expected)throw Error('Missing or inconsistent source question example');
     extra.sampleQuestion=sample[1];
    }
    if(type.response==='explain-reason'){if(!q.reason)throw Error('Missing example explanation');extra.exampleExplanation=q.methodId==='claim'?'The final total already includes the new items. Adding them again would count them twice.':'The starting amount includes what was used and what is left. Subtract the part left to find what was used.';}
    const displayPrompt=q.methodId==='claim'?q.prompt.replace('because the story says “brings more.”','because Maya brings more.'):q.prompt;
    if(type.response==='paired-stories'){
     const prompts=q.prompt.match(/^1\. ([\s\S]+)<br>2\. ([\s\S]+)$/),equations=[...q.answer.matchAll(/(\d+) ([+−]) (\d+) = (\d+)/g)];
     if(!prompts||equations.length!==2)throw Error('Incomplete source story pair');
     extra.parts=equations.map((e,j)=>({prompt:prompts[j+1],a:Number(e[1]),b:Number(e[3]),op:e[2],answer:Number(e[4]),work:e[0],method:j===0?'total':'initial'}));
     if(extra.parts.some((p,j)=>p.a!==q.check.a||p.b!==q.check.b||p.op!==(j===0?'+':'−')||p.answer!==(j===0?q.check.sum:q.check.difference)))throw Error('Source paired equations disagree');
    }
    if(type.response==='choose-equation'){
     const options=q.task.match(/Choose an equation: (\d+ [＋+−] \d+) or (\d+ [＋+−] \d+)\./);
     if(!options)throw Error('Missing original equation choices');
     extra.choices=options.slice(1);extra.correctChoice=extra.choices.indexOf(m[1]+' '+m[2]+' '+m[3]);
     if(extra.correctChoice<0)throw Error('Answer not present among source choices');
    }
    if(type.response==='bar-model'){
     const bar=q.visual.match(/<div class="story-bar"><div>Total (□|\d+)<\/div><div><span>(□|\d+)<\/span><span>(\d+)<\/span><\/div><\/div>/);
     if(!bar)throw Error('Missing original part-whole model');
     extra.bar={whole:bar[1]==='□'?null:Number(bar[1]),left:bar[2]==='□'?null:Number(bar[2]),right:Number(bar[3])};
     if((extra.bar.whole===null?Number(m[4]):extra.bar.whole)!==(extra.bar.left===null?Number(m[4]):extra.bar.left)+extra.bar.right)throw Error('Source bar does not match answer');
    }
    seen.add(q.prompt);selected.push({...extra,prompt:displayPrompt,a:Number(m[1]),b:Number(m[3]),op:m[2],answer:Number(m[4]),work:m[0],reason:q.reason,method:q.methodId,sourceCheck:q.check,usefulNumbers:irrelevant===undefined?undefined:q.check.a+' and '+q.check.b});
   }
  }
  if(selected.length!==type.count)throw Error('Not enough distinct reading stories');return selected;
 }
 if(type.layout==='stories'){
  const chosen=[],seen=new Set();
  for(let pass=0;pass<(type.sourceFractionDivisionWholePieces?512:32)&&chosen.length<type.count;pass++){
   for(const q of root.Worksheets.generate(type.legacyId,(seed+pass)>>>0,type.count)){
    if(type.sourceOperations&&!type.sourceOperations.some(op=>q.work.includes(' '+op+' ')))continue;
    if(type.sourceWholeByUnitFraction&&!/^\d+ ÷ 1\/\d+ = \d+$/.test(q.work))continue;
    if(type.sourceFractionDivisionWholePieces){const m=q.work.match(/^(\d+)\/(\d+) ÷ (\d+)\/(\d+) = (\d+)$/);if(!m||Number(m[1])%Number(m[2])===0||Number(m[4])%Number(m[3])===0)continue;if(m[5]==='1'&&chosen.some(q=>String(q.answer)==='1'))continue;}
    if(type.sourceUnlikeDenominators){const m=q.work.match(/^\d+\/(\d+) [+−] \d+\/(\d+) = /);if(!m)throw Error('Unsupported unlike-denominator source');if(m[1]===m[2])continue;}
    if(seen.has(q.prompt))continue;
    seen.add(q.prompt);chosen.push(q);if(chosen.length===type.count)break;
   }
  }
  if(chosen.length!==type.count)throw Error('Not enough distinct source stories');
  return chosen.map(q=>{
   if(type.response==='lcm-story'){
    const m=q.prompt.match(/^Two lights flash together now, then every (\d+) and (\d+) seconds\. In how many seconds will they first flash together again\?$/);
    if(!m||!/^\d+$/.test(String(q.answer))||q.work!=='')throw Error('Unsupported source LCM story');
    const [a,b]=m.slice(1).map(Number),n=Number(q.answer);
    if(a<1||a>12||b<1||b>12||n<1||n>a*b||n%a||n%b)throw Error('Source time is not a positive common multiple');
    for(let k=1;k<n;k++)if(k%a===0&&k%b===0)throw Error('Source time is not the first repeat');
    return {...q,a,b,op:'lcm',commonMultipleStory:true,prompt:'Two lights flash together now. One flashes every '+a+' '+(a===1?'second':'seconds')+' and the other every '+b+' '+(b===1?'second':'seconds')+'. In how many seconds will they first flash together again?'};
   }
   if(type.response==='gcf-story'){
    const m=q.prompt.match(/^Share (\d+) red counters and (\d+) blue counters into identical bags with none left\. What is the greatest number of bags\?$/);
    if(!m||!/^\d+$/.test(String(q.answer))||q.work!=='')throw Error('Unsupported source GCF story');
    const [a,b]=m.slice(1).map(Number),n=Number(q.answer);
    if(a<1||a>100||b<1||b>100||n<1||n>Math.min(a,b)||a%n||b%n)throw Error('Source bag count does not divide both collections');
    for(let k=n+1;k<=Math.min(a,b);k++)if(a%k===0&&b%k===0)throw Error('Source bag count is not greatest');
    return {...q,a,b,op:'gcf',commonFactorStory:true,prompt:q.prompt.replace(/\b1 (red|blue) counters/g,'1 $1 counter')};
   }
   if(type.response==='factor-list-story'){
    const m=q.prompt.match(/^Arrange (\d+) counters into equal rows with none left\. List every possible number of counters in a row\.$/);
    if(!m||!/^\d+(?:, \d+)*$/.test(String(q.answer)))throw Error('Unsupported factor-list story');
    const a=Number(m[1]),factorList=String(q.answer).split(', ').map(Number),expected=Array.from({length:a},(_,i)=>i+1).filter(n=>a%n===0);
    if(a<2||a>100||JSON.stringify(factorList)!==JSON.stringify(expected))throw Error('Source factor list disagrees');
    return {...q,a,b:0,op:'factors',factorList};
   }
   if(type.response==='grouped-expression-story'){
    const m=q.prompt.match(/^Each box contains (\d+) red and (\d+) blue counters\. How many counters are in (\d+) boxes\?$/);
    if(!m)throw Error('Unsupported grouped-expression story');
    const [a,b,c]=m.slice(1).map(Number),answer=Number(q.answer);
    if(a<1||a>12||b<1||b>12||c<2||c>9||!Number.isInteger(answer)||answer!==(a+b)*c)throw Error('Grouped-expression source answer disagrees');
    return {...q,a,b,c,groupedExpression:{addends:[a,b],groups:c},op:'×',answer,work:'('+a+' + '+b+') × '+c+' = '+answer,prompt:'Each box contains '+a+' red '+(a===1?'counter':'counters')+' and '+b+' blue '+(b===1?'counter':'counters')+'. How many counters are in '+c+' boxes?'};
   }
   if(type.response==='four-addends-story'){
    const m=q.prompt.match(/^Four boxes hold (\d+), (\d+), (\d+), (\d+) counters\. How many counters are there altogether\?$/);
    if(!m)throw Error('Unsupported four-box source story');
    const addends=m.slice(1).map(Number),answer=Number(q.answer);
    if(addends.some(n=>n<10||n>99)||!Number.isInteger(answer)||answer!==addends.reduce((a,b)=>a+b,0))throw Error('Four-box source answer disagrees');
    return {...q,a:addends[0],b:addends[1],addends,op:'+',answer,work:addends.join(' + ')+' = '+answer};
   }
   if(type.response==='decimal-area-story'){
    const m=q.work.match(/^(\d+\.\d{2}) × (\d+\.\d{2}) = (\d+(?:\.\d{1,4})?)$/),story=q.prompt.match(/^A rectangular field is (\d+\.\d{2}) feet long and (\d+\.\d{2}) feet wide\. What is its area in square feet\?$/);
    if(!m||!story||story[1]!==m[1]||story[2]!==m[2]||m[3]!==String(q.answer))throw Error('Unsupported source decimal area story');
    const units=(s,places)=>{const [w,f='']=s.split('.');return Number(w)*10**places+Number(f.padEnd(places,'0'));},a=units(m[1],2),b=units(m[2],2),product=units(m[3],4);
    if(a<1||a>2000||b<1||b>1000||product!==a*b)throw Error('Decimal area source answer disagrees');
    return {...q,a:m[1],b:m[2],op:'×',decimalStory:true,decimalAreaStory:true,prompt:q.prompt.replace(/\b1\.00 feet/g,'1.00 foot')};
   }
   if(type.response==='decimal-story'){
    const places=type.decimalPlaces??2;
    if(![2,3].includes(places))throw Error('Unsupported decimal precision');
    const m=q.work.match(/^(\d+\.\d+) ([+−]) (\d+\.\d+) = (\d+(?:\.\d+)?)$/);
    if(!m||m[1].split('.')[1].length!==places||m[3].split('.')[1].length!==places||(m[4].split('.')[1]||'').length>places||m[4]!==String(q.answer))throw Error('Unsupported source decimal story');
    const scale=10**places,units=s=>{const [w,f='']=s.split('.');return Number(w)*scale+Number(f.padEnd(places,'0'));};
    const a=units(m[1]),b=units(m[3]),answer=units(m[4]);
    if(a<1||b<1||Math.max(a,b)>20*scale||answer<0||answer>30*scale||answer!==(m[2]==='+'?a+b:a-b))throw Error('Source decimal answer disagrees');
    return {...q,a:m[1],b:m[3],op:m[2],decimalStory:true,prompt:q.prompt.replace(/\b1\.00(0?) feet/g,'1.00$1 foot').replace(/(1\.00(?:0)? foot) are shipped/g,'$1 is shipped')};
   }
   if(type.response==='fraction-division-pieces-story'){
    const m=q.work.match(/^(\d+)\/(\d+) ÷ (\d+)\/(\d+) = (\d+)$/),story=q.prompt.match(/^A warehouse has (\d+\/\d+) feet of cable\. Each piece is (\d+\/\d+) feet long\. How many pieces can be made\?$/);
    if(!m||!story||story[1]!==m[1]+'/'+m[2]||story[2]!==m[3]+'/'+m[4]||m[5]!==String(q.answer))throw Error('Unsupported fraction division pieces story');
    const [a,d,b,e,n]=m.slice(1).map(Number);
    if(a<1||a>20||b<1||b>20||d<2||d>12||e<2||e>12||a%d===0||e%b===0||n<1||a*e!==n*d*b)throw Error('Source does not make whole non-unit-fraction pieces');
    const length=(n,d)=>n+'/'+d+(n<d?' of a foot':' feet');
    return {...q,a:story[1],b:story[2],op:'÷',fractionStory:true,fractionDivisionPiecesStory:true,prompt:'A warehouse has '+length(a,d)+' of cable. Each piece is '+length(b,e)+' long. How many pieces can be made?'};
   }
   if(type.response==='fraction-fraction-area-story'){
    const m=q.work.match(/^(\d+)\/(\d+) × (\d+)\/(\d+) = (\d+(?:\/\d+)?)$/);
    const story=q.prompt.match(/^A rectangular field is (\d+\/\d+) feet long and (\d+\/\d+) feet wide\. What is its area in square feet\?$/);
    if(!m||!story||m[5]!==String(q.answer)||story[1]!==m[1]+'/'+m[2]||story[2]!==m[3]+'/'+m[4])throw Error('Unsupported source two-fraction area story');
    const a=Number(m[1]),d=Number(m[2]),b=Number(m[3]),e=Number(m[4]),[n,z=1]=m[5].split('/').map(Number);
    if(a<1||a>20||b<1||b>20||d<2||d>12||e<2||e>12||n*d*e!==a*b*z)throw Error('Source two-fraction area answer disagrees');
    return {...q,a:story[1],b:story[2],op:'×',fractionStory:true,fractionFractionAreaStory:true};
   }
   if(type.response==='fraction-area-story'){
    const m=q.work.match(/^(\d+)\/(\d+) × (\d+) = (\d+(?:\/\d+)?)$/);
    const story=q.prompt.match(/^A rectangular field is (\d+\/\d+) feet long and (\d+) feet wide\. What is its area in square feet\?$/);
    if(!m||!story||m[4]!==String(q.answer)||story[1]!==m[1]+'/'+m[2]||story[2]!==m[3])throw Error('Unsupported source fraction area story');
    const a=Number(m[1]),d=Number(m[2]),b=Number(m[3]),[n,z=1]=m[4].split('/').map(Number);
    if(a<1||a>12||d<2||d>12||b<1||b>9||n*d!==a*b*z)throw Error('Source fraction area answer disagrees');
    return {...q,a:m[1]+'/'+m[2],b,op:'×',fractionStory:true,fractionAreaStory:true,prompt:q.prompt.replace('1 feet wide','1 foot wide')};
   }
   if(type.response==='unlike-fraction-story'){
    const m=q.work.match(/^(\d+)\/(\d+) ([+−]) (\d+)\/(\d+) = (\d+(?:\/\d+)?)$/);
    if(!m||m[6]!==String(q.answer))throw Error('Unsupported unlike-fraction story');
    const a=Number(m[1]),d=Number(m[2]),b=Number(m[4]),e=Number(m[5]),[n,z=1]=m[6].split('/').map(Number),num=m[3]==='+'?a*e+b*d:a*e-b*d;
    if(d===e||d<2||d>12||e<2||e>12||a<1||a>3*d||b<1||b>3*e||n<0||n*d*e!==num*z)throw Error('Unlike-fraction story answer disagrees');
    return {...q,a:m[1]+'/'+m[2],b:m[4]+'/'+m[5],op:m[3],fractionStory:true,unlikeFractionStory:true,prompt:q.prompt.replace(/(\d+\/\d+) feet/g,'$1 of a foot').replace('of a foot are shipped','of a foot is shipped')};
   }
   if(type.response==='whole-unit-fraction-story'){
    const m=q.work.match(/^(\d+) ÷ 1\/(\d+) = (\d+)$/),story=q.prompt.match(/^A warehouse has (\d+) feet of cable\. Each piece is 1\/(\d+) feet long\. How many pieces can be made\?$/);
    if(!m||!story||m[1]!==story[1]||m[2]!==story[2]||m[3]!==String(q.answer))throw Error('Unsupported unit-fraction piece story');
    const a=Number(m[1]),d=Number(m[2]),n=Number(m[3]);if(a<1||a>12||d<2||d>12||n!==a*d)throw Error('Unit-fraction piece count disagrees');
    return {...q,a,b:'1/'+d,op:'÷',fractionStory:true,wholeUnitFractionStory:true,prompt:q.prompt.replace(/\b1 feet of cable/,'1 foot of cable').replace(/(1\/\d+) feet long/,'$1 of a foot long')};
   }
   if(type.response==='fraction-story'){
    const m=q.work.match(/^(\d+\/\d+) ([+−]) (\d+\/\d+) = (\d+(?:\/\d+)?)$/);
    if(!m||m[4]!==String(q.answer))throw Error('Unsupported source fraction story');
    const [an,ad]=m[1].split('/').map(Number),[bn,bd]=m[3].split('/').map(Number),[n,d=1]=m[4].split('/').map(Number);
    if(!supportedDenominators.has(ad)||ad!==bd||d<=0||n<0||n*ad!==(m[2]==='+'?an+bn:an-bn)*d)throw Error('Source fraction story answer disagrees');
    const prompt=q.prompt.replace(/(\d+\/\d+) feet/g,'$1 of a foot').replace('of a foot are shipped','of a foot is shipped');
    return {...q,a:m[1],b:m[3],op:m[2],fractionStory:true,prompt};
   }
   if(type.response==='division-remainder'){
    const m=q.work.match(/^(\d+) ÷ (\d+) = (\d+)(?: R (\d+))?$/);
    if(!m)throw Error('Unsupported source division story');
    const a=Number(m[1]),b=Number(m[2]),quotient=Number(m[3]),remainder=Number(m[4]||0);
    if(b<=0||remainder>=b||a!==b*quotient+remainder||String(q.answer)!==m[3]+(remainder?' R '+remainder:''))throw Error('Source division answer disagrees');
    const promptMatch=q.prompt.match(remainder?/^Pack (\d+) counters into groups of (\d+)\. How many full groups and how many counters remain\?$/:/^A warehouse has (\d+) feet of cable\. Each piece is (\d+) feet long\. How many pieces can be made\?$/);
    if(!promptMatch||Number(promptMatch[1])!==a||Number(promptMatch[2])!==b)throw Error('Division context or units disagree');
    return {...q,a,b,op:'÷',answer:remainder?q.answer:quotient,division:{quotient,remainder,quotientLabel:remainder?'Full groups:':'Pieces:',remainderLabel:remainder?'Counters left:':'Feet left:'}};
   }
   const m=q.work.match(/^(\d+) ([+−×÷]) (\d+) = (\d+)$/);
   if(!m)throw Error('Unsupported source story equation');
   return {...q,a:Number(m[1]),b:Number(m[3]),op:m[2],answer:Number(q.answer),prompt:q.prompt.replace(/\b1 counters\b/g,'1 counter').replace(/\b1 boxes\b/g,'1 box').replace(/\bThere are 1 box\b/g,'There is 1 box').replace(/\b1 feet wide\b/g,'1 foot wide')};
  });
 }
 if(type.layout==='pictures'){
  const group=root.KoEarlyArithmetic.generate('1-2-4',0,seed,type.count,[]).find(g=>g.questions[0].methodId==='picture-add');
  if(!group)throw Error('Original picture bank not available');
  return group.questions.map(q=>{const m=q.answer.match(/^(\d+) \+ (\d+) = (\d+)$/);if(!m)throw Error('Unexpected source answer');return {a:Number(m[1]),b:Number(m[2]),op:'+',answer:Number(m[3]),visual:q.visual,artId:q.artId};});
 }
 if(type.maxAnswer!==undefined||type.maxDividend!==undefined){
  const selected=[],seen=new Set();
  for(let pass=0;pass<32&&selected.length<type.count;pass++){
   for(const q of root.Worksheets.generate(type.legacyId,(seed+pass)>>>0,24)){
    const key=q.a+'|'+q.b;
    if(Number(q.answer)>type.maxAnswer||q.a>type.maxDividend||seen.has(key))continue;
    selected.push(q);seen.add(key);if(selected.length===type.count)break;
   }
  }
  if(selected.length!==type.count)throw Error('Not enough questions in the selected range');return selected;
 }
 if(type.layout==='fraction-products'){
  const allowed=new Set(type.sourceDenominators),selected=[],seen=new Set();
  for(let pass=0;pass<32&&selected.length<type.count;pass++){
   const sourceSeed=(seed+pass)>>>0,raw=root.Worksheets.generate(type.legacyId,sourceSeed,24);
   for(let sourceIndex=0;sourceIndex<raw.length;sourceIndex++){
    const q=raw[sourceIndex],d=Number(String(q.a).split('/')[1]),key=q.a+'|'+q.b;
    if(!allowed.has(d)||seen.has(key))continue;
    selected.push({...q,sourceSeed,sourceIndex});seen.add(key);if(selected.length===type.count)break;
   }
  }
  if(selected.length!==type.count)throw Error('Not enough original fraction products');return selected;
 }
 if(type.layout==='fractions'){
  const selected=[],seen=new Set();
  // Select existing bank questions only. No new fraction-generation algorithm.
  for(let pass=0;pass<32&&selected.length<type.count;pass++){
   for(const q of root.Worksheets.generate(type.legacyId,(seed+pass)>>>0,24)){
    const da=String(q.a).split('/')[1],db=String(q.b).split('/')[1],key=q.a+'|'+q.b;
    if(da!==db||!supportedDenominators.has(Number(da))||seen.has(key))continue;
    selected.push(q);seen.add(key);if(selected.length===type.count)break;
   }
  }
  if(selected.length!==type.count)throw Error('Not enough curriculum-compatible questions');return selected;
 }
 return root.Worksheets.generate(type.legacyId,seed,type.count);
}
root.SharedQuestionBank={generate};
})(globalThis);
