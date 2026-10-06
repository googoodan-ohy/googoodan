/* English presentation adapter. Calculations, randomization and answers come
 * directly from the unchanged Korean engine through customSpecs. */
(() => {
  const source = KoMath;
  const definitions = [
    ['order-of-operations','Order of Operations Worksheets','5-1-1',['mixed','mixed-bracket'],'Grade 5 · grouped expressions'],
    ['simplifying-fractions','Simplifying Fractions Worksheets','5-1-4',['reduce'],'Grade 5 · fraction review'],
    ['area-and-perimeter','Area and Perimeter Worksheets','5-1-6',['perimeter','area-rectangle','area-triangle','area-parallelogram','area-trapezoid','area-rhombus'],'Grades 3–4: rectangles · Grade 6: other polygons'],
    ['surface-area','Surface Area Worksheets','6-1-6',['surface'],'Grade 6 · rectangular prisms'],
    ['probability','Probability Worksheets: Impossible, Certain and Even Chance','5-2-6',['chance'],'Introductory chance · preparation for Grade 7'],
    ['factors-and-multiples','Factors and Multiples Worksheets','5-1-2',['factor','multiple'],'Grade 4 · factors and multiples'],
    ['gcf-and-lcm','GCF and LCM Worksheets','5-1-2',['gcd','lcm'],'Grade 6 · common factors and multiples'],
    ['fraction-models','Fraction Models Worksheets','3-1-6',['fraction-model'],'Grade 3 · equal parts of a whole'],
    ['comparing-fractions','Comparing Fractions Worksheets','5-1-4',['fraction-compare','fraction-compare-unlike'],'Grade 4 · compare fractions of the same whole'],
    ['common-denominators','Common Denominator Worksheets','5-1-4',['common-denominator','fraction-form'],'Grade 5 · prepare for fraction operations'],
    ['angles','Angles Worksheets','4-1-2',['angle-right','lines','angle-type','angle-measure','angle-sum'],'Grade 4 · lines and angles'],
    ['telling-time','Telling Time Worksheets','2-2-4',['clock:30','clock:5','clock:1','elapsed'],'Grades 1–3 · time and elapsed time'],
    ['decimal-models','Decimal Models Worksheets','4-2-2',['decimal-model','decimal-fraction'],'Grade 4 · tenths and hundredths'],
    ['circle-area','Circle Area and Circumference Worksheets','6-2-5',['circle-parts','circle-size','circle-circumference','circle-area','circle-half'],'Grade 7 · circles']
  ];
  const names = {mixed:'Multiply before adding','mixed-bracket':'Parentheses first',reduce:'Reduce to simplest form',perimeter:'Rectangle perimeter','area-rectangle':'Rectangle area','area-triangle':'Triangle area','area-parallelogram':'Parallelogram area','area-trapezoid':'Trapezoid area','area-rhombus':'Rhombus area',surface:'Rectangular prism surface area',chance:'Impossible, certain or even chance'};
  let selected = 'all';
  const requestedGrade=Number(new URLSearchParams(globalThis.location?.search||'').get('grade'));
  // A link from an early grade must never start with later-grade questions.
  if(requestedGrade>=1&&requestedGrade<=3){
    const clockDef=definitions.find(d=>d[0]==='telling-time');
    clockDef[3]=requestedGrade===1?['clock:30']:requestedGrade===2?['clock:5']:['clock:1','elapsed'];
  }
  if(requestedGrade>=3&&requestedGrade<=4)definitions.find(d=>d[0]==='area-and-perimeter')[3]=['perimeter','area-rectangle'];
  Object.assign(names,{factor:'List factors',multiple:'First three multiples',gcd:'Greatest common factor',lcm:'Least common multiple','fraction-model':'Shaded fraction models','fraction-compare':'Compare like denominators','fraction-compare-unlike':'Compare unlike denominators','common-denominator':'Least common denominator','fraction-form':'Improper fractions to mixed numbers','angle-right':'Recognize a right angle',lines:'Lines, rays and segments','angle-type':'Acute, right and obtuse','angle-measure':'Read a protractor','angle-sum':'Add adjacent angles','clock:30':'Grade 1: hours and half hours','clock:5':'Grade 2: five-minute intervals','clock:1':'Grade 3: nearest minute',elapsed:'Grade 3: elapsed time','decimal-model':'Shaded tenths','decimal-fraction':'Hundredths as decimals','circle-parts':'Recognize a radius','circle-size':'Radius and diameter','circle-circumference':'Circumference','circle-area':'Circle area','circle-half':'Semicircle area'});
  function translate(q, skill) {
    let prompt, reason, answer=q.answer;
    const v=q.check;
    if(skill==='mixed'||skill==='mixed-bracket') {
      prompt='Evaluate the expression.';
      reason=skill==='mixed'?'Multiply first, then add.':'Add inside the parentheses first, then multiply.';
    } else if(skill==='reduce') {
      prompt='Write the fraction in simplest form.';
      reason='Divide the numerator and denominator by their greatest common factor.';
    } else if(['factor','multiple','gcd','lcm'].includes(skill)) {
      const [a,b]=q.prompt.match(/\d+/g);
      const texts={factor:[`List all positive factors of ${a}.`,'Each factor divides the number with no remainder.'],multiple:[`Write the first three positive multiples of ${a}.`,'Multiply the number by 1, 2 and 3.'],gcd:[`Find the greatest common factor of ${a} and ${b}.`,'List common factors and choose the greatest.'],lcm:[`Find the least common multiple of ${a} and ${b}.`,'Find the smallest positive number divisible by both numbers.']};
      [prompt,reason]=texts[skill];
    } else if(['fraction-model','fraction-compare','fraction-compare-unlike','common-denominator','fraction-form','decimal-model','decimal-fraction'].includes(skill)) {
      const texts={'fraction-model':['Write the fraction of the whole that is shaded.','Count shaded equal parts and all equal parts.'],'fraction-compare':['Compare the fractions using <, > or =. Both refer to the same whole.','With equal denominators, compare the numerators.'],'fraction-compare-unlike':['Compare the fractions using <, > or =. Both refer to the same whole.','Use equivalent fractions with a common denominator.'],'common-denominator':['Write both fractions with their least common denominator.','Use the least common multiple of the denominators.'],'fraction-form':['Write the improper fraction as a mixed number.','Divide the numerator by the denominator; express the remainder as a fraction.'],'decimal-model':['Write the shaded part of the whole as a decimal.','Each equal part is one tenth.'],'decimal-fraction':[`Write ${q.prompt.match(/\d+/)?.[0]}/100 as a decimal.`,'Divide the numerator by 100.']};
      [prompt,reason]=texts[skill];
    } else if(skill.startsWith('clock:')||skill==='elapsed') {
      const [h,m]=q.answer.match(/\d+/g);answer=h+':'+m.padStart(2,'0');
      prompt='Write the time shown on the clock.';reason='Read the hour hand, then the minute hand.';
      if(skill==='elapsed'){const [h,m,d]=q.prompt.match(/\d+/g);prompt=`What time is ${d} minutes after ${h}:${m.padStart(2,'0')}?`;reason='Count forward in minutes. One hour is 60 minutes.';}
    } else if(['angle-right','lines','angle-type','angle-measure','angle-sum'].includes(skill)) {
      const a=q.prompt.match(/\d+/g)||[];
      const texts={'angle-right':['Does the diagram show a right angle?','A right angle measures 90 degrees.'],lines:['Name the figure: line, ray or line segment.','A segment has two endpoints, a ray has one, and a line extends in both directions.'],'angle-type':['Classify the angle as acute, right or obtuse.','Compare the angle with 90 degrees.'],'angle-measure':['Read the protractor. What is the angle in degrees?','Start at zero on the right and read where the other ray points.'],'angle-sum':[`Two adjacent angles measure ${a[0]}° and ${a[1]}°. What is their combined angle?`,'Add the two angle measures.']};
      [prompt,reason]=texts[skill];answer=({'예':'Yes','아니요':'No','선분':'Line segment','반직선':'Ray','직선':'Line','예각':'Acute','직각':'Right','둔각':'Obtuse'})[answer]||answer;
      if(skill==='angle-measure'||skill==='angle-sum')answer+='°';
    } else if(skill.startsWith('circle-')) {
      const texts={'circle-parts':['Name the segment from the center to the circle.','A radius joins the center to a point on the circle.'],'circle-size':['Find the diameter in centimeters.','The diameter is twice the radius.'],'circle-circumference':['Find the circumference in centimeters. Use 3.14 for pi.','Multiply the diameter by 3.14.'],'circle-area':['Find the area in square centimeters. Use 3.14 for pi.','Multiply radius × radius × 3.14.'],'circle-half':['Find half the area of this circle, in square centimeters. Use 3.14 for pi.','Multiply radius × radius × 3.14, then divide by 2.']};
      [prompt,reason]=texts[skill];if(skill==='circle-parts')answer='Radius';else answer+=skill==='circle-area'||skill==='circle-half'?' cm²':' cm';
    } else if(skill==='chance') {
      const cases={
        '불가능하다':['A box contains only red balls. Without looking, you take one ball. How likely is it to be blue?','Impossible','There are no blue balls.'],
        '확실하다':['A box contains only blue balls. Without looking, you take one ball. How likely is it to be blue?','Certain','Every ball is blue.'],
        '반반이다':['A box contains one red ball and one blue ball. Each is equally likely to be picked. How likely are you to pick red?','Even chance','One of the two equally likely outcomes is red.']
      };
      [prompt,answer,reason]=cases[answer];
    } else {
      const {a,b,c}=v;
      const entries={
        perimeter:['Find the perimeter of the rectangle.','2 × (length + width)', 'cm'],
        'area-rectangle':[`Find the area of a rectangle with length ${a} cm and width ${b} cm.`,'length × width','cm²'],
        'area-triangle':[`Find the area of a triangle with base ${a} cm and perpendicular height ${b} cm.`,'base × height ÷ 2','cm²'],
        'area-parallelogram':[`Find the area of a parallelogram with base ${a} cm and perpendicular height ${b} cm.`,'base × height','cm²'],
        'area-trapezoid':[`A trapezoid has parallel bases ${a} cm and ${c} cm and perpendicular height ${b} cm. Find its area.`,'(base 1 + base 2) × height ÷ 2','cm²'],
        'area-rhombus':[`A rhombus has diagonals ${a} cm and ${b} cm. Find its area.`,'diagonal 1 × diagonal 2 ÷ 2','cm²'],
        surface:[`Find the total surface area of a rectangular prism with length ${a} cm, width ${b} cm and height ${c} cm.`,'2 × (length × width + length × height + width × height)','cm²']
      };
      let unit;[prompt,reason,unit]=entries[skill];answer+=' '+unit;reason+=' = '+answer;
    }
    return {...q,prompt,answer,reason,visual:q.visual.replaceAll('문제 그림','Problem diagram').replaceAll('길이는 문제의 조건을 보세요','Use the measurements in the question').replaceAll('반지름','Radius'),task:'<span class="kblank"></span>',sourceSkill:skill};
  }
  for(const [id,title,unit,skills,level] of definitions) {
    Worksheets.types.push({id,title,family:'Practice extensions',group:'Practice extensions',example:'Practice',instruction:level+'. Show your work, then check the answer key.',bankId:'coverage:'+id});
  }
  KoMath={...source,generate(id,profile,seed,n){
    if(!id.startsWith('coverage:'))return source.generate(id,profile,seed,n);
    const def=definitions.find(d=>'coverage:'+d[0]===id);
    const skills=selected==='all'?def[3]:def[3].filter(s=>s===selected);
    const seenChance=new Set(),seenQuestions=new Set();
    return Array.from({length:def[0]==='probability'?3:6},(_,i)=>{
      const skill=skills[i%skills.length];
      let q;
      // Select only source questions inside the relevant US denominator range.
      for(let attempt=0;attempt<100;attempt++){
        q=source.generate(def[2],0,seed+i*7891+attempt*137,1,[{skill,mode:0}])[0].questions[0];
        if(skill==='fraction-model') {if(![2,3,4,6,8].includes(Number(q.answer.split('/')[1])))continue;}
        if(skill==='fraction-compare'||skill==='fraction-compare-unlike') {const d=[...q.visual.matchAll(/<span>(\d+)<\/span>/g)].map(x=>+x[1]).filter((_,i)=>i%2);if(d.some(x=>![2,3,4,5,6,8,10,12,100].includes(x)))continue;}
        if(skill==='lcm'&&(q.prompt.match(/\d+/g)||[]).some(n=>Number(n)>12))continue;
        if(skill==='chance'&&seenChance.has(q.answer))continue;
        if(seenQuestions.has(skill+q.prompt+q.visual+q.answer)&&attempt<99)continue;
        break;
      }
      if(skill==='chance')seenChance.add(q.answer);
      seenQuestions.add(skill+q.prompt+q.visual+q.answer);
      return {title:names[skill],questions:[translate(q,skill)]};
    });
  }};
  globalThis.CoveragePractice={definitions,names,setSkill(skill){selected=skill;}};
})();
