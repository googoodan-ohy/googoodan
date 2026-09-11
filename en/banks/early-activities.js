/* Reuse Korean authored activities and artwork; translate presentation only. */
(() => {
  const definitions=[
    ['count-and-circle','Count and Circle Worksheets',['count','mark','compare'],'Kindergarten · count and compare within 9'],
    ['number-matching','Number Matching Worksheets',['words','order'],'Kindergarten · numbers and number words'],
    ['number-order-activities','Number Order Activity Worksheets',['ordinal','neighbors','line','repair'],'Kindergarten–Grade 1 · number order'],
    ['ten-frame-activities','Ten Frame and Make 10 Worksheets',['ten-frame','ten-missing','pair-ten'],'Kindergarten–Grade 1 · make 10'],
    ['picture-addition','Picture Addition Activity Worksheets',['picture-add','bridge-add'],'Grade 1 · addition within 20']
  ];
  const labels={count:'Count and write',mark:'Circle a set',compare:'Compare picture groups',words:'Match numbers and words',order:'Order the number cards',ordinal:'Find a position',neighbors:'Before and after',line:'Complete the number line',repair:'Fix the number order','ten-frame':'Complete a ten frame','ten-missing':'Find a partner for 10','pair-ten':'Circle a pair that makes 10','picture-add':'Pictures to an addition sentence','bridge-add':'Make 10 to add'};
  const numberWords={'하나':'one','둘':'two','셋':'three','넷':'four','다섯':'five','여섯':'six','일곱':'seven','여덟':'eight','아홉':'nine'};
  const originalIcon=KoArt.icon;
  KoArt.icon=(asset,...args)=>originalIcon({...asset,file:asset.file.startsWith('/')?asset.file:'/ko/'+asset.file,name:asset.nameEn||'counting picture'},...args);
  const familiarPictures=new Set(['rabbit','elephant','chicken','baby chick','bird','penguin','koala','poodle','cat face','dog face','frog','hamster','bear','panda','dolphin','duck','owl','fox','butterfly','deer','giraffe','zebra','hedgehog','turtle','fish','tropical fish','tulip','sunflower','red apple','pear','cherries','strawberry','banana','carrot','grapes','watermelon','cookie','cupcake','wrapped gift','balloon']);
  const excludedPictures=KoArt.items.filter(a=>!familiarPictures.has(a.nameEn)).map(a=>a.id);
  let selection='all';
  let grade=Number(new URLSearchParams(globalThis.location?.search||'').get('grade'));
  // Pair-ten uses three addends, so it is not offered on a Kindergarten entry.
  if(new URLSearchParams(globalThis.location?.search||'').get('grade')==='K')definitions.find(d=>d[0]==='ten-frame-activities')[2]=['ten-frame','ten-missing'];
  const sourceFor=method=>{
    const p=KoEarlyNumbers.profiles.findIndex(p=>p.activities.some(a=>a.method===method));
    if(p>=0)return seed=>KoEarlyNumbers.generate(p,seed,1,excludedPictures).find(s=>s.skill===method).questions[0];
    const id=method==='picture-add'||method==='bridge-add'?'1-2-4':'1-2-2';
    const index=KoEarlyArithmetic.banks[id].findIndex(p=>p.activities.some(a=>a.method===method));
    if(index<0)throw Error('Unsupported early activity: '+method);
    return seed=>KoEarlyArithmetic.generate(id,index,seed,1,excludedPictures).find(s=>s.skill===method).questions[0];
  };
  function english(q,method){
    let prompt,reason,task=q.task,answer=q.answer,visual=q.visual;
    const nums=q.prompt.match(/\d+/g)||[];
    switch(method){
      case 'count':prompt='Count the pictures. Write the number.';reason='Touch each picture once as you count.';break;
      case 'mark':prompt=`Circle exactly ${nums[0]} pictures.`;answer=`Circle any ${nums[0]} pictures.`;reason='Any set with the requested number of pictures is correct.';break;
      case 'compare':prompt='Circle the group with more pictures.';visual=visual.replace(/<div>가/g,'<div>A').replace(/<div>나/g,'<div>B');task='A / B';answer=answer==='가'?'A':'B';reason='Count both groups, then compare.';break;
      case 'words':prompt='Draw lines to match each number with its word.';reason='Read each word and find the matching numeral.';break;
      case 'order':prompt='Write the number cards in order, smallest first.';reason='Start with the smallest number.';break;
      case 'ordinal':prompt=`Start at the left. Circle picture number ${nums[0]}.`;answer=`Circle the ${nums[0]}${nums[0]==='1'?'st':nums[0]==='2'?'nd':nums[0]==='3'?'rd':'th'} picture from the left.`;reason='Count positions from left to right.';break;
      case 'neighbors':prompt='Write the number before and the number after.';reason='The number before is one less; the number after is one more.';break;
      case 'line':prompt='Fill in the missing number on the number line.';reason='Each step to the right increases the number by one.';break;
      case 'repair':prompt='Two cards are in the wrong order. Write the two numbers to swap.';task='____ and ____';reason='The cards should count forward by one.';break;
      case 'ten-frame':prompt='Draw one dot in each empty box to make 10. How many dots did you add?';task='Dots added: ____';reason='Count the empty boxes.';break;
      case 'ten-missing':prompt='Fill in the missing number to make 10.';reason='Find the number that adds to the given number to make 10.';break;
      case 'pair-ten':{const [a,b,c]=q.answer.match(/\d+/g);prompt='Circle two numbers that make 10. Then find the total.';answer=`Circle ${a} and ${b}. Total: ${c}.`;reason='Make a group of 10 first, then add the remaining number.';break;}
      case 'picture-add':prompt='Count both groups. Complete the addition sentence.';reason='Add the number of pictures in the two groups.';break;
      case 'bridge-add':prompt='Split the second number to make 10. Fill in the boxes.';reason='Use part of the second number to complete 10, then add what is left.';break;
      default:throw Error('Missing translation '+method);
    }
    for(const [ko,en]of Object.entries(numberWords)){visual=visual.replaceAll(ko,en);answer=answer.replaceAll(ko,en);}
    visual=visual.replaceAll('문제 그림','Activity diagram').replace(/<img\b[^>]*>/g,tag=>{
      const id=tag.match(/data-art-id="([^"]+)"/)?.[1],asset=KoArt.items.find(a=>a.id===id);
      const alt=(asset?.nameEn||'counting picture').replaceAll('&','&amp;').replaceAll('"','&quot;');
      return tag.replace(/src="art\//,'src="/ko/art/').replace(/alt="[^"]*"/,'alt="'+alt+'"');
    });
    return {...q,prompt,reason,visual,task,answer};
  }
  for(const[id,title,methods,level]of definitions)Worksheets.types.push({id,title,family:'Early math activities',group:'Early math activities',example:'Count · Match · Draw',instruction:level+'. Use a pencil to complete each activity.',bankId:'early:'+id});
  globalThis.KoMath={generate(id,p,seed){
    const def=definitions.find(d=>'early:'+d[0]===id);if(!def)throw Error('Unknown early worksheet');
    const methods=selection==='all'?def[2]:def[2].filter(m=>m===selection);
    if(!methods.length)throw Error('Unknown activity selection');
    return Array.from({length:4},(_,i)=>{const method=methods[i%methods.length],q=english(sourceFor(method)(seed+i*7907),method);return{title:labels[method],questions:[q]};});
  }};
  globalThis.EarlyActivities={definitions,labels,select(method){selection=method;},sourceFor};
})();
