'use strict';
const configNode=document.getElementById('worksheet-config');
const trainingConfig=JSON.parse(configNode.textContent);
window.trainingDomain=trainingConfig.numberDomain;
if(new URLSearchParams(location.search).get('layout')==='vertical'&&trainingDomain!=='fraction'){
 trainingConfig.layout='vertical';trainingConfig.count=trainingConfig.verticalCount||12;
 configNode.textContent=JSON.stringify(trainingConfig);
}
// Select unchanged questions from the original bank; never alter operands or answers.
function trainingMatches(q, selection) {
 const a=Number(q.a), b=Number(q.b);
 if(selection==='remainder')return a%b!==0;
 if(selection==='exact')return a%b===0;
 let x=a,y=b,carry=0,regroup=false,acrossZero=false;
 while(x>0||y>0){
  const digit=x%10, other=y%10;
  if(q.op==='+'){carry=digit+other+carry>=10?1:0;regroup=regroup||Boolean(carry);}
  else {const next=digit-carry<other?1:0;acrossZero=acrossZero||(digit===0&&carry===1);carry=next;regroup=regroup||Boolean(carry);}
  x=Math.floor(x/10);y=Math.floor(y/10);
 }
 return selection==='across-zero'?acrossZero:selection==='regroup'?regroup:selection==='no-regroup'?!regroup:false;
}
SharedQuestionBank.generate=function(type,seed){
 const division=type.legacyId.includes('-div-');
 if(!type.selection&&!division)return Worksheets.generate(type.legacyId,seed,type.count);
 const result=[],seen=new Set();
 for(let batch=0;batch<2000&&result.length<type.count;batch++){
  for(const q of Worksheets.generate(type.legacyId,Number(seed)+batch*104729,type.legacyId==='natural-div-1-1'?20:100)){
   const key=JSON.stringify(q);
   const divisor=String(q.b).trim();const ratio=divisor.match(/^(\d+)\/(\d+)$/);const isOne=Number(divisor)===1||(ratio&&Number(ratio[1])===Number(ratio[2]));
   if((!division||!isOne)&&(!type.selection||trainingMatches(q,type.selection))&&!seen.has(key)){seen.add(key);result.push(q);if(result.length===type.count)break;}
  }
 }
 if(result.length!==type.count)throw Error('Insufficient original questions for '+type.selection);
 return result;
};
