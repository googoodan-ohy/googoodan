(function(root){
 'use strict';
 const box='<span class="write-box"></span>';
 const svg=(body,w=240,h=120)=>`<div class="art"><svg viewBox="0 0 ${w} ${h}" role="img">${body}</svg></div>`;
 const shapeData=[
  {name:'square',families:['quadrilateral','parallelogram','rectangle','rhombus','square'],sym:4,points:'65,15 135,15 135,85 65,85'},
  {name:'rectangle',families:['quadrilateral','parallelogram','rectangle'],sym:2,points:'40,25 160,25 160,85 40,85'},
  {name:'rhombus',families:['quadrilateral','parallelogram','rhombus'],sym:2,points:'100,10 175,55 100,100 25,55'},
  {name:'parallelogram',families:['quadrilateral','parallelogram'],sym:0,points:'65,20 170,20 140,85 35,85'},
  {name:'quadrilateral',families:['quadrilateral'],sym:0,points:'40,15 170,35 145,95 65,80'}
 ];
 // The largest vertex radius is 84; center at (120,95) with 11 units of padding.
 // This keeps every rotated quadrilateral inside the same frame in Grades 3–5.
 const shape=(s,rotation=0)=>svg(`<g transform="translate(20 40) rotate(${rotation} 100 55)"><polygon points="${s.points}" fill="#eef3ff" stroke="#34496b" stroke-width="2"/></g>`,240,190);
 const item=(prompt,visual,answer,task=box)=>({prompt,visual,task,answer:String(answer)});
 function generate(resource,seed){
  let state=(Number(seed)||1)>>>0; const r=n=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return Math.floor(state/4294967296*n)};
  const id=resource.id,unit=resource.sourceUnit||resource.sourceType;
  const count=unit==='round'?24:12;
  return Array.from({length:count},(_,i)=>{
   if(unit==='round'){
    const place=i%2?100:10,n=10+r(990);return item(`Round to the nearest ${place===10?'ten':'hundred'}.`,'',Math.round(n/place)*place,`${n} → ${box}`);
   }
   if(unit==='equal-area'){
    const d=[2,3,4,6,8][(i+r(5))%5],n=1+r(d-1),width=120+r(50),height=40+r(25);
    const v=svg(Array.from({length:d},(_,j)=>`<rect x="${25+j*width/d}" y="20" width="${width/d}" height="${height}" fill="${j<n?'#8aadd9':'white'}" stroke="#34496b"/>`).join(''));
    return item(i%2?'What fraction of the whole is not shaded?':'What fraction of the whole is shaded?',v,`${i%2?d-n:n}/${d}`,`${box} / ${d}`);
   }
   if(unit==='lineplot'){
    const label=n=>{const whole=Math.floor(n/4),rem=n%4;return rem?`${whole||''}${whole?' ':''}${rem===2?'1/2':rem+'/4'}`:String(whole)};
    if(i%2===0){
     const n=1+((Math.floor(i/2)+(Number(seed)||1)%15)%15),v=svg(`<rect x="30" y="15" width="${n*11}" height="18" fill="#8aadd9" stroke="#34496b"/><path d="M30 43H206" stroke="#34496b"/>`+Array.from({length:17},(_,k)=>`<path d="M${30+k*11} 43v${k%4===0?14:k%2===0?10:6}" stroke="#34496b"/>${k%4===0?`<text x="${30+k*11}" y="73" text-anchor="middle" font-size="11">${k/4}</text>`:''}`).join('')+'<text x="118" y="95" text-anchor="middle" font-size="11">inches</text>');
     return item('Read the strip length to the nearest 1/4 inch.',v,label(n)+' inches',box+' inches');
    }
    const start=1+r(3),counts=Array.from({length:5},()=>r(3));counts[r(5)]=1+r(3);
    const data=counts.flatMap((n,k)=>Array.from({length:n},()=>label(start*4+k)));
    const v=svg('<path d="M25 90H215" stroke="#34496b"/>'+counts.map((n,k)=>`<path d="M${30+k*45} 86v8" stroke="#34496b"/><text x="${30+k*45}" y="110" text-anchor="middle" font-size="10">${label(start*4+k)}</text>`).join('')+'<text x="120" y="130" text-anchor="middle" font-size="10">Length (inches)</text>',240,140);
    return item('Make a line plot of the ruler measurements. Put one × above the length for each strip.',`<div>${data.join(', ')} inches</div>`+v,counts.map((n,k)=>`${label(start*4+k)} inches: ${n} ×`).join('; '),'');
   }
   if(['quadrilaterals','quadrilateral-families','shape-hierarchy','shape-properties'].includes(unit)){
    const s=shapeData[(i+r(5))%5],family=['rectangle','rhombus','parallelogram','quadrilateral','square'][(i+r(5))%5];
    if(id==='w00006-1'){
     const mode=i%4,v=shape(s,(i*17+r(13))%90);
     if(mode===0)return item('How many straight sides make it a quadrilateral?',v,'4 straight sides','3 / 4 / 5');
     if(mode===1)return item('Four right angles: is it a rectangle?',v,s.families.includes('rectangle')?'Yes':'No','Yes / No');
     if(mode===2)return item('Four equal sides: is it a rhombus?',v,s.families.includes('rhombus')?'Yes':'No','Yes / No');
     const pairs=[['square','rectangle','four right angles'],['square','rhombus','four equal sides'],['rectangle','quadrilateral','four straight sides'],['rhombus','quadrilateral','four straight sides']],p=pairs[r(pairs.length)];
     return item(`${p[0]} → ${p[1]}: write the defining property.`,shape(shapeData.find(x=>x.name===p[0]),(i*17+r(13))%90),p[2]);
    }
    if(unit==='shape-hierarchy'){
     const chains=[['square','rectangle','parallelogram','quadrilateral'],['square','rhombus','parallelogram','quadrilateral'],['rectangle','parallelogram','quadrilateral'],['rhombus','parallelogram','quadrilateral']],c=chains[i%4],k=r(c.length),diagram=shapeData.find(s=>s.name===c[0]);return item('Complete the classification from most specific to broadest.',shape(diagram,(i*17+r(13))%90),c[k],c.map((n,j)=>j===k?box:n).join(' ⊂ '));
    }
    if(unit==='shape-properties')return item(`${s.name}: are all of these shapes also a ${family}?`,shape(s,(i*17+r(13))%90),s.families.includes(family)?'Yes':'No','Yes / No');
    return item(i%2?`Is this shape a ${family}?`:'Select every name that describes this shape.',shape(s,(i*17+r(13))%90),i%2?(s.families.includes(family)?'Yes':'No'):s.families.join(', '),i%2?'Yes / No':'quadrilateral · parallelogram · rectangle · rhombus · square');
   }
   if(unit==='symmetry'||unit==='rectangle-square-symmetry'){
    const s=shapeData[unit==='rectangle-square-symmetry'?i%2:(i+r(5))%5];return item('Draw all lines of symmetry. Write how many.',shape(s,(i*17+r(13))%90),`${s.sym} lines`,box+' lines');
   }
   if(unit==='lines'||unit==='lines-rays-segments'){
    const kind=i%3,slant=r(3)*12,y1=45-slant,y2=45+slant;
    const arrows=(x,y,dir)=>`<path d="M${x+dir*9} ${y-5}L${x} ${y}L${x+dir*9} ${y+5}" fill="none" stroke="#34496b" stroke-width="2"/>`;
    if(i%4!==3||unit==='lines-rays-segments'){
     const v=svg(`<g transform="rotate(${i*3+r(3)} 120 45)"><path d="M35 45H205" stroke="#34496b" stroke-width="2"/>${kind===0?arrows(35,45,1):'<circle cx="35" cy="45" r="3" fill="#34496b"/>'}${kind!==2?arrows(205,45,-1):'<circle cx="205" cy="45" r="3" fill="#34496b"/>'}<text x="45" y="65">A</text><text x="190" y="65">B</text></g>`);return item('Name the figure: line, ray, or line segment.',v,['line','ray','line segment'][kind]);
    }
    const relation=Math.floor(i/4)%3,parallel=relation===0,perpendicular=relation===1;return item('Describe the relationship between the two lines.',svg('<g transform="rotate('+(i*3)+' 120 60)">'+(parallel?`<path d="M30 ${y1}L210 ${y2}M30 ${y1+30}L210 ${y2+30}" stroke="#34496b" stroke-width="2"/>`:`<path d="M30 60H210M${perpendicular?120:70} 10L${perpendicular?120:160} 100" stroke="#34496b" stroke-width="2"/>`)+'</g>'),parallel?'parallel':perpendicular?'perpendicular':'neither parallel nor perpendicular','parallel / perpendicular / neither parallel nor perpendicular');
   }
   if(unit==='protractor'){
    const a=10+((i+(Number(seed)||1)%16)%16)*10,rad=a*Math.PI/180;
    const ticks=Array.from({length:19},(_,k)=>{const t=k*Math.PI/18;return `<path d="M${120+85*Math.cos(t)} ${100-85*Math.sin(t)}L${120+78*Math.cos(t)} ${100-78*Math.sin(t)}" stroke="#aab8ca"/><text x="${120+68*Math.cos(t)}" y="${103-68*Math.sin(t)}" text-anchor="middle" font-size="7">${k*10}</text>`}).join('');
    return item('Read the angle measure.',svg(`<path d="M35 100A85 85 0 0 1 205 100" fill="none" stroke="#aab8ca"/>${ticks}<path d="M120 100H210M120 100L${120+90*Math.cos(rad)} ${100-90*Math.sin(rad)}" stroke="#34496b" stroke-width="3"/><circle cx="120" cy="100" r="3"/>`,240,125),a,box+' °');
   }
   if(unit==='shape-class'){
    if(i%2===0){const a=[30,40,50,60,90,100,110,120][r(8)],b=10+r(Math.floor((170-a)/10))*10,c=180-a-b;return item('Classify the triangle by its angles.',svg(`<polygon points="35,100 205,100 100,15" fill="#eef3ff" stroke="#34496b"/><text x="35" y="115">${a}°</text><text x="185" y="115">${b}°</text><text x="105" y="15">${c}°</text><text x="120" y="75" text-anchor="middle" font-size="10">Diagram is not to scale</text>`,240,130),[a,b,c].includes(90)?'right triangle':Math.max(a,b,c)>90?'obtuse triangle':'acute triangle','acute triangle / right triangle / obtuse triangle');}
    const s=shapeData[r(5)];return item('How many pairs of parallel sides?',shape(s,i*7+r(5)),s.families.includes('parallelogram')?2:0,box+' pairs');
   }
   if(unit==='coordinate'||unit==='plot-points'){
    const x=i>=6?1+r(6):r(7),y=r(7),plot=unit==='plot-points'&&i%2===0;
    const grid=Array.from({length:7},(_,k)=>`<path d="M45 ${140-k*18}H153M${45+k*18} 32V140" stroke="#d2dae5"/><text x="${45+k*18}" y="156" text-anchor="middle" font-size="9">${k}</text>${k?`<text x="33" y="${143-k*18}" font-size="9">${k}</text>`:''}`).join('');
    const v=svg(grid+`<path d="M45 25V140H170" fill="none" stroke="#34496b"/><text x="175" y="143">x</text><text x="40" y="20">y</text>`+(plot?'':`<circle cx="${45+x*18}" cy="${140-y*18}" r="4" fill="#34496b"/><text x="${51+x*18}" y="${134-y*18}">P</text>`),240,165);
    if(i>=6){const context='A reading chart uses x for the day number and y for books read that day.';return item(plot?`${context} On day ${x}, Sam read ${y} books. Plot point P.`:i%3===1?`${context} On which day did Sam read the number of books shown at P?`:i%3===2?`${context} How many books did Sam read on the day shown at P?`:`${context} Write (day, books) for point P.`,v,plot?`(${x}, ${y})`:i%3===1?x:i%3===2?y:`(${x}, ${y})`,plot?'':box);}
    return item(plot?`Plot point P(${x}, ${y}) on the grid.`:i%3===1?'Write the x-coordinate of point P.':i%3===2?'Write the y-coordinate of point P.':'Write the ordered pair for point P.',v,plot?`(${x}, ${y})`:i%3===1?x:i%3===2?y:`(${x}, ${y})`,plot?'':box);
   }
   throw new Error('Unsupported Grade 3–5 candidate: '+id+' / '+unit);
  });
 }
 root.CandidateG345={generate};
 if(typeof module!=='undefined')module.exports=root.CandidateG345;
})(globalThis);



