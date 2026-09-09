/* Reuse authored concept activities at the England year where their skill belongs. */
(function(root){const api=root.GradeMath,base=api.generate,themes=api.grades;const mapping={
1:[[1,'place'],[1,'compare'],[1,'missing'],[1,'clock'],[1,'shape'],[1,'order-length'],[1,'unit-length'],[1,'halves'],[2,'arrays']],
2:[[1,'three'],[2,'odd-even'],[2,'arrays'],[2,'clock'],[2,'shape'],[2,'partition'],[2,'graphs'],[2,'measure-tools'],[0,'money','Pounds and pence']],
3:[[2,'place'],[2,'number-names'],[2,'compare'],[3,'round'],[3,'fraction'],[3,'fraction-line'],[3,'fraction-compare'],[3,'perimeter'],[3,'elapsed'],[3,'mass'],[3,'data']],
4:[[4,'equivalent'],[4,'tenths-hundredths'],[4,'decimal-compare'],[3,'area-tiles'],[4,'shape-class'],[4,'symmetry'],[5,'coordinate'],[5,'plot-points']],
5:[[4,'factors'],[4,'angle'],[4,'protractor'],[5,'decimal-place'],[5,'decimal-compare'],[5,'round-decimal'],[4,'area-perimeter'],[0,'negative','Temperatures below zero']],
6:[[5,'volume'],[5,'volume-parts'],[5,'write-expressions'],[0,'ratio','Sharing in a ratio'],[0,'percent','Percentages of amounts'],[0,'mean','Mean of a data set'],[0,'angles','Missing angles in triangles'],[0,'coordinates','Coordinates in four quadrants']]};
const grades={};for(const [year,list]of Object.entries(mapping)){grades[year]={...themes[Math.min(5,Number(year))],name:'Year '+year+' discoveries',motto:'Explore, practise, and explain your thinking.',units:list.map(([g,id,title])=>[id,title||themes[g].units.find(u=>u[0]===id)[1],'England Year '+year])};}
function custom(id,seed){let state=seed>>>0;const r=(a,b)=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return a+Math.floor(state/4294967296*(b-a+1))};return [0,1,2].map(mode=>({questions:Array.from({length:mode===1?3:2},()=>{let prompt,answer,visual='',task='Show your working: ____________________';const a=r(2,9),b=r(2,9);if(id==='money'){const pounds=r(1,5),pence=r(1,9)*10;prompt=mode===2?'An item costs £'+pounds+'.'+String(pence).padStart(2,'0')+'. You pay £10. How much change do you receive?':'You have '+pounds+' one-pound coins and '+(pence/10)+' ten-pence coins. What is their total value?';answer=mode===2?'£'+((1000-pounds*100-pence)/100).toFixed(2):'£'+((pounds*100+pence)/100).toFixed(2);}
else if(id==='negative'){prompt='It is −'+a+'°C. The temperature rises by '+(a+b)+'°C. What is the new temperature?';answer=b+'°C';}
else if(id==='ratio'){const total=(a+b)*3;prompt='Share '+total+' counters between Alex and Sam in the ratio '+a+':'+b+'. How many does each receive?';answer='Alex '+a*3+', Sam '+b*3;}
else if(id==='percent'){const percent=[10,20,25,50,75][r(0,4)],amount=r(1,20)*20;prompt='Find '+percent+'% of '+amount+'.';answer=percent*amount/100;}
else if(id==='mean'){const values=[a,b,a+2,b+2];prompt='Find the mean of these numbers: '+values.join(', ')+'.';answer=(a+b+2)/2;}
else if(id==='angles'){const first=a*5,second=b*5;prompt='A triangle has angles of '+first+'° and '+second+'°. Find its third angle.';answer=180-first-second+'°';}
else{const x=r(-5,5),y=r(-5,5),dx=r(-3,3),dy=r(-3,3);prompt='Point P is at ('+x+', '+y+'). Translate it '+Math.abs(dx)+' units '+(dx<0?'left':'right')+' and '+Math.abs(dy)+' units '+(dy<0?'down':'up')+'. Give its new coordinates.';answer='('+(x+dx)+', '+(y+dy)+')';}
return {prompt,visual,task,answer:String(answer)};})}));}
api.grades=grades;api.generate=(year,id,seed)=>{const entry=mapping[year]?.find(u=>u[1]===id);if(!entry)throw Error('Unknown England topic');if(!entry[0])return custom(id,seed);api.grades=themes;try{return base(entry[0],id,seed);}finally{api.grades=grades;}};root.GDGradeLocale={yearLabel:'Year',country:'England',noKindergarten:true};
})(globalThis);
