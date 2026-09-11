/* Reuse ko question-engine, fractions and fraction-targets without rewriting
 * their number generation or answer calculation. */
(() => {
  const source=KoMath,legacy=KoLegacyMath;
  const defs=[
    ['equivalent-fraction-puzzles','Equivalent Fraction Puzzles Worksheets',['f:equivalent','f:change','f:bound','f:sum'],'Grade 5 · fraction reasoning and enrichment'],
    ['fraction-number-puzzles','Fraction Number Puzzles Worksheets',['f:count','f:between','f:reverse'],'Grade 5 · fraction reasoning and enrichment'],
    ['fraction-missing-numbers','Missing Number Fraction Worksheets',['t:add-proper','t:sub-proper','t:add-mixed','t:sub-mixed','t:mul-proper','t:mul-mixed','t:mul-whole-left','t:mul-whole-right','t:div-proper','t:div-mixed','t:div-whole-left'],'Grades 5–6 · Grade 6 for fraction division'],
    ['fraction-error-analysis','Fraction Error Analysis Worksheets',['e:fraction-add','e:fraction-sub','e:fraction-mul','e:fraction-div'],'Grades 5–6 · Grade 6 for fraction division'],
    ['multiplication-arrays','Multiplication Arrays and Equal Groups Worksheets',['m:groups','m:array','m:commute'],'Grade 3 · equal groups and arrays'],
    ['multiplication-strategies','Multiplication Strategies Worksheets',['m:repeated','m:jump','m:neighbor','m:chain'],'Grade 3 · repeated addition and patterns'],
    ['multiplication-missing-factors','Missing Factor Multiplication Worksheets',['m:missing','m:target','m:table'],'Grade 3 · find unknown factors'],
    ['multiplication-error-analysis','Multiplication Error Analysis Worksheets',['m:error'],'Grade 3 · check and correct'],
    ['multiplication-matching','Multiplication Matching Worksheets',['m:match'],'Grade 3 · match facts and products'],
    ['draw-multiplication-groups','Draw Equal Groups Multiplication Worksheets',['m:create'],'Grade 3 · draw a multiplication model']
  ];
  const labels={'f:equivalent':'Fill missing numerators','f:change':'Keep fractions equivalent','f:bound':'Meet a denominator limit','f:sum':'Use a numerator-and-denominator sum','f:count':'List fractions in simplest form','f:between':'Find fractions between bounds','f:reverse':'Work backward to a fraction','t:add-proper':'Missing addend: proper fractions','t:sub-proper':'Missing minuend: proper fractions','t:add-mixed':'Missing addend: mixed numbers','t:sub-mixed':'Missing minuend: mixed numbers','t:mul-proper':'Missing factor: proper fractions','t:mul-mixed':'Missing factor: mixed numbers','t:mul-whole-left':'Missing whole-number factor','t:mul-whole-right':'Fraction factor × whole number','t:div-proper':'Grade 6: missing dividend, proper fractions','t:div-mixed':'Grade 6: missing dividend, mixed numbers','t:div-whole-left':'Grade 6: missing whole-number dividend','e:fraction-add':'Check fraction addition','e:fraction-sub':'Check fraction subtraction','e:fraction-mul':'Check fraction multiplication','e:fraction-div':'Grade 6: check fraction division','m:groups':'Equal groups to an equation','m:array':'Arrays to an equation','m:commute':'Two equations for one array','m:repeated':'Repeated addition to multiplication','m:jump':'Skip-counting jumps','m:neighbor':'Use a known fact','m:chain':'Continue multiplication patterns','m:missing':'Find the missing factor','m:target':'Choose factors for a target','m:table':'Complete a fact table','m:error':'Correct an incorrect product','m:match':'Match equations and products','m:create':'Draw equal groups'};
  const grade=Number(new URLSearchParams(globalThis.location?.search||'').get('grade'));
  if(grade>0&&grade<6)for(const d of defs)d[2]=d[2].filter(s=>!s.includes('div'));
  let selected='all';
  const targetMap={'add-proper':['5-1-5',0],'sub-proper':['5-1-5',1],'add-mixed':['5-1-5',2],'sub-mixed':['5-1-5',3],'mul-proper':['5-2-2',0],'mul-mixed':['5-2-2',1],'mul-whole-left':['5-2-2',2],'mul-whole-right':['5-2-2',3],'div-proper':['6-2-1',0],'div-mixed':['6-2-1',1],'div-whole-left':['6-2-1',2]};
  function raw(skill,seed){
    const [family,method]=skill.split(':');
    if(family==='f'){const p=KoFractions.profiles.findIndex(p=>p.activities.some(a=>a.method===method));return KoFractions.generate(p,seed,1,[]).find(s=>s.skill===method).questions[0];}
    if(family==='m'){
      const candidates=KoMultiplicationBank.profiles.map((p,i)=>({p,i})).filter(({p})=>p.tables.every(n=>n>=2&&n<=9)&&p.activities.some(a=>a.method===method));
      const index=candidates[(seed>>>0)%candidates.length].i;
      return source.generate('2-2-2',index,seed,1).find(s=>s.method===method).questions[0];
    }
    if(family==='t'){const[id,p]=targetMap[method];const count=source.profiles(id).length,added=id==='5-1-5'?4:id==='5-2-2'?4:3;return source.generate(id,count-added+p,seed,1)[1].questions[0];}
    return legacy.generate('5-1-5',0,seed,1,[{skill:method,mode:2}])[0].questions[0];
  }
  function translate(q,skill){
    const [family,method]=skill.split(':');let prompt,reason,answer=q.answer,task=q.task,visual=q.visual;
    if(family==='f'){
      const {a,d,k,limit}=q.check;
      const text={equivalent:['Fill in the missing numerators to make equivalent fractions.','Multiply numerator and denominator by the same factor.'],change:[`The denominator increases by ${d}. How much must the numerator increase to keep the fraction equivalent?`,'Keep the numerator and denominator in the same ratio.'],bound:[`Write the equivalent fraction with the greatest denominator that is no more than ${limit}.`,'The denominator must be a multiple of the simplest denominator.'],sum:[`Write an equivalent fraction whose numerator and denominator add to ${(a+d)*k}.`,'Scale both parts by the same factor and check their sum.'],count:[`List all proper fractions with denominator ${d} that are in simplest form. How many are there?`,'The numerator must be smaller than the denominator and share no factor greater than one.'],between:['List all fractions with denominator 12 strictly between the two shown fractions. Do not include the endpoints.','Express both endpoints in twelfths and find the numerators between them.'],reverse:[`After adding ${q.prompt.match(/\d+/)?.[0]} to a fraction's denominator and simplifying, the result is shown below. Its original numerator was ${a*k}. Find the original fraction.`,'First undo the simplification, then subtract the amount added to the denominator.']};
      [prompt,reason]=text[method];answer=answer.replaceAll('개',' fractions');
    }else if(family==='t'){
      prompt='Find the missing number. Substitute it into the original equation to check.';reason=q.reason.replace('확인:','Check:');
    }else if(family==='e'){
      prompt='Check the proposed answer. Write correct or incorrect. If it is incorrect, write the correct answer.';
      task=task.replaceAll('친구의 답:','Proposed answer:').replaceAll('맞으면 ○, 틀리면 ×. 틀린 답은 고치세요.','Correct / incorrect: ______. Correction: ______');
      answer=answer.replaceAll('×, 바른 답:','Incorrect. Correct answer:').replaceAll('○','Correct');
      reason='Recalculate using the rules for this operation, then compare with the proposed answer.';
      // The original engine puts the operands in the prompt for some tasks;
      // fraction tasks already include their full expression in the visual.
    }else{
      const {a,b,product}=q.check;
      const text={groups:['Write an equation: items in each group × number of groups.','Count equal groups and the items in each group.'],array:['Write an equation: items in each row × number of rows.','Count rows and the items in one row.'],commute:['Write two multiplication equations for the array, one in each direction.','Changing the grouping direction does not change the total.'],repeated:['Rewrite the repeated addition as multiplication.','Count how many times the same number is added.'],jump:[`Follow jumps of ${a}. Find the endpoint and write a multiplication equation.`,'Count equal jumps from zero.'],neighbor:['Use the known fact to complete the next multiplication.','Add one more equal group.'],chain:['Continue the pattern. Write the next two equations.','The second factor increases by one each time.'],missing:['Find the missing factor.','Use multiplication or division to check the unknown factor.'],target:['Choose two number cards to make the target product. Use each card at most once.','Check the product of the two chosen numbers.'],table:['Complete the missing entries in the multiplication table.','Each next product increases by the repeated factor.'],error:['Find the incorrect product and write the corrected equation.','Recount the equal groups or use a known fact to check.'],match:['Draw lines to match each multiplication with its product.','Calculate each product before matching.'],create:[`Draw equal groups for ${(q.prompt.match(/\d+/g)||[]).slice(0,2).join(' × ')}. Use dots or simple pictures.`,'Check the number of groups and the items in each group.']};
      [prompt,reason]=text[method];task=task.replaceAll('바른 식:','Correct equation:');
      visual=visual.replaceAll('곱하는 수','Multiplier').replace(new RegExp(a+'단','g'),'× '+a).replaceAll('목표 수:','Target product:');
      answer=answer.replace(/예: (\d+)개씩 (\d+)묶음, 모두 (\d+)개/,'Example: $2 groups of $1, $3 in total').replaceAll('또는','or');
    }
    visual=visual.replace(/<img\b[^>]*>/g,tag=>{const id=tag.match(/data-art-id="([^"]+)"/)?.[1],asset=KoArt.items.find(a=>a.id===id);const alt=(asset?.nameEn||'picture').replaceAll('&','&amp;').replaceAll('"','&quot;');return tag.replace(/src="art\//,'src="/ko/art/').replace(/alt="[^"]*"/,'alt="'+alt+'"');});
    return{...q,prompt,reason,answer,task,visual,sourceSkill:skill};
  }
  for(const[id,title,skills,level]of defs)Worksheets.types.push({id,title,family:'Reasoning practice',group:'Reasoning practice',example:'Find · Model · Explain',instruction:level+'. Show your work and check your answer.',bankId:'expansion:'+id});
  KoMath={...source,generate(id,p,seed,n){if(!id.startsWith('expansion:'))return source.generate(id,p,seed,n);const def=defs.find(d=>'expansion:'+d[0]===id),skills=selected==='all'?def[2]:def[2].filter(s=>s===selected);if(!skills.length)throw Error('Invalid skill');return Array.from({length:4},(_,i)=>{const skill=skills[((seed>>>0)+i)%skills.length];return{title:labels[skill],questions:[translate(raw(skill,seed+i*7919),skill)]};});}};
  globalThis.ReasoningExpansion={defs,labels,raw,select(skill){selected=skill;}};
})();
