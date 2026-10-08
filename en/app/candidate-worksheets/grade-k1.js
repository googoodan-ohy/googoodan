(function(root){
'use strict';
const box='<span class="answer-box" style="display:inline-block;min-width:36px;min-height:25px;border:1.5px solid #263b48;vertical-align:middle"></span>';
const names=['circle','triangle','square','rectangle','hexagon'];
function svg(s,w=260,h=96){return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" style="display:block;width:100%;height:92px;max-width:290px" role="img">${s}</svg>`;}
function shape(k,x,y,s=24,extra=''){const st=`fill="white" stroke="#263b48" stroke-width="2" ${extra}`;if(k===0)return `<circle cx="${x}" cy="${y}" r="${s}" ${st}/>`;if(k===1)return `<polygon points="${x},${y-s} ${x+s},${y+s} ${x-s},${y+s}" ${st}/>`;if(k===2)return `<rect x="${x-s}" y="${y-s}" width="${s*2}" height="${s*2}" ${st}/>`;if(k===3)return `<rect x="${x-s*1.4}" y="${y-s*.7}" width="${s*2.8}" height="${s*1.4}" ${st}/>`;return `<polygon points="${Array.from({length:6},(_,j)=>{const a=j*Math.PI/3;return `${x+s*Math.cos(a)},${y+s*Math.sin(a)}`;}).join(' ')}" ${st}/>`;}
const text=(s,x,y,size=14)=>`<text x="${x}" y="${y}" font-family="Arial,sans-serif" font-size="${size}" text-anchor="middle">${s}</text>`;
function rng(seed){let s=(Number(seed)||1)>>>0;return n=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return Math.floor(s/4294967296*n);};}
function generate(resource,seed){const id=resource.id,r=rng(seed),items=[];const put=(prompt,visual,task,answer)=>items.push({prompt,visual,task,answer:String(answer)});const pick=a=>a[r(a.length)];
for(let i=0;i<12;i++){
 if(id==='old-grade-1-clock'){
  const hour=1+r(12),minute=r(2)*30,cx=130,cy=46,rad=38;let s=`<circle cx="${cx}" cy="${cy}" r="${rad}" fill="white" stroke="#263b48" stroke-width="2"/>`;
  for(let n=1;n<=12;n++){let a=n*Math.PI/6;s+=text(n,cx+Math.sin(a)*29,cy-Math.cos(a)*29,9);}
  for(const [a,l,w] of [[minute*Math.PI/30,28,2],[(hour%12+minute/60)*Math.PI/6,20,3]])s+=`<path d="M${cx} ${cy}L${cx+Math.sin(a)*l} ${cy-Math.cos(a)*l}" stroke="#263b48" stroke-width="${w}" stroke-linecap="round"/>`;
  s+=`<circle cx="${cx}" cy="${cy}" r="2" fill="#263b48"/>`;put('Write the time.',svg(s),box+' : '+box,`${hour}:${String(minute).padStart(2, '0')}`);
 }else if(id==='old-grade-1-equal'||id==='w00097-1'){
  const a=r(11),b=r(11),sum=a+b,isTrue=(i+r(2))%2===0;let rhs=sum+(isTrue?0:pick([-2,-1,1,2]));if(rhs<0)rhs=sum+1;
  const c=r(sum+1),double=id==='old-grade-1-equal'&&i%3!==0;let expression=double?`${a} + ${b} = ${c} + ${rhs-c}`:`${a} + ${b} = ${rhs}`;if(double&&rhs-c<0)expression=`${a} + ${b} = ${rhs} + 0`;
  put('Write T if the equation is true, or F if it is false.','',expression+'　'+box,rhs===sum?'T':'F');
 }else if(id==='old-grade-1-halves'){
  const parts=pick([2,4]),wide=96+r(35),height=45+r(17);let s=`<rect x="${130-wide/2}" y="15" width="${wide}" height="${height}" fill="white" stroke="#263b48" stroke-width="2"/>`;
  if(i%2===0){for(let j=1;j<parts;j++)s+=`<path d="M${130-wide/2+j*wide/parts} 15v${height}" stroke="#263b48"/>`;put('How many equal parts are shown?',svg(s),box,parts);}
  else{put(`Draw lines to make ${parts} equal parts.`,svg(s),'',parts===2?'One line through the center makes two equal parts.':'Three equally spaced vertical lines, or one horizontal and one vertical center line, make four equal parts.');}
 }else if(id==='old-grade-1-order-length'){
  const lens=[45+r(20),90+r(20),140+r(20)];for(let j=2;j>0;j--){const z=r(j+1);[lens[j],lens[z]]=[lens[z],lens[j]];}
  const s=lens.map((n,j)=>text('ABC'[j],18,20+j*27)+`<rect x="40" y="${8+j*27}" width="${n}" height="12" fill="#e5e9eb" stroke="#263b48"/>`).join('');const asc=i%2===0;
  put(asc?'Write the letters from shortest to longest.':'Write the letters from longest to shortest.',svg(s),box+' → '+box+' → '+box,[0,1,2].sort((a,b)=>asc?lens[a]-lens[b]:lens[b]-lens[a]).map(j=>'ABC'[j]).join(' → '));
 }else if(id==='old-k-compose-shapes'||id==='old-grade-1-shape-build'||id==='w00108-1'){
  const level=id==='old-k-compose-shapes'?0:id==='old-grade-1-shape-build'?1:2;
  const kind=(i+r(2))%2,size=10+r(5)+i/12,order=[0,1,2];for(let j=2;j>0;j--){const z=r(j+1);[order[j],order[z]]=[order[z],order[j]];}
  const poly=points=>`<polygon points="${points}" fill="#dfe7eb" fill-opacity=".7" stroke="#263b48" stroke-width="1.5"/>`;
  const rect=(x,y,w,h)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#dfe7eb" fill-opacity=".7" stroke="#263b48" stroke-width="1.5"/>`;
  let count,result,piece,locations;
  if(level===0){
   count=2;result=kind===0?'rectangle':'square';
   piece=(j,x,y)=>kind===0?rect(x,y,size,size):j===0?poly(`${x},${y} ${x+2*size},${y} ${x},${y+2*size}`):poly(`${x+2*size},${y+2*size} ${x+2*size},${y} ${x},${y+2*size}`);
   locations=kind===0?[[0,0],[size,0]]:[[0,0],[0,0]];
  }else if(level===1){
   count=kind===0?3:4;result=kind===0?'rectangle':'square';piece=(j,x,y)=>rect(x,y,size,size);
   locations=kind===0?[[0,0],[size,0],[2*size,0]]:[[0,0],[size,0],[0,size],[size,size]];
  }else if(kind===0){
   count=2;result='pentagon';
   piece=(j,x,y)=>j===0?rect(x,y,2*size,2*size):poly(`${x},${y+size} ${x+size},${y} ${x+2*size},${y+size}`);
   locations=[[0,size],[0,0]];
  }else{
   count=3;result='rectangle';
   piece=(j,x,y)=>j===0?rect(x,y,2*size,2*size):j===1?poly(`${x},${y} ${x+size},${y} ${x},${y+2*size}`):poly(`${x+size},${y+2*size} ${x+size},${y} ${x},${y+2*size}`);
   locations=[[0,0],[2*size,0],[2*size,0]];
  }
  let drawing=Array.from({length:count},(_,j)=>piece(j,55+j*47,5)).join('');
  drawing+=order.map((mode,j)=>{
   const x=18+j*85,y=51,offset=mode===0?0:mode===1?8:-size*.65;
   const parts=locations.map(([dx,dy],q)=>piece(q,x+dx+(q===count-1?offset:0),y+dy)).join('');
   return parts+text('ABC'[j],x+size,100,12);
  }).join('');
  const letter='ABC'[order.indexOf(0)];
  put(`Use all ${count} pieces to make a ${result}. Which choice has no gaps or overlaps?`,svg(drawing,260,106),box,`${letter}: ${result}. All pieces join along complete edges.`);
 }else if(id==='old-k-shape-sorting'){
  const target=r(4),ks=Array.from({length:6},()=>r(4));ks[r(6)]=target;
  const s=ks.map((k,j)=>shape(k,24+j*43,38,13)+text('ABCDEF'[j],24+j*43,70)).join('');put(`Find all the ${names[target]}s. Write their letters.`,svg(s),box,ks.map((k,j)=>(k===target||(target===3&&k===2))?'ABCDEF'[j]:'').filter(Boolean).join(', '));
 }else if(id==='supplemental-shape-matching'){
  const k=r(4),order=[0,1,2,3];for(let j=3;j>0;j--){let z=r(j+1);[order[j],order[z]]=[order[z],order[j]];}
  let s=shape(k,28,36,18)+`<path d="M57 36h17" stroke="#263b48"/>`+order.map((a,j)=>shape(a,99+j*42,36,13)+text('ABCD'[j],99+j*42,72)).join('');put('Find the matching shape. Write its letter.',svg(s),box,'ABCD'[order.indexOf(k)]);
 }else if(id==='supplemental-shape-tracing'){
  const k=r(4),sz=18+r(11);put('Trace the shape. Draw the same shape in the box.',svg(shape(k,67,42,sz,'stroke-dasharray="4 4"')+`<rect x="145" y="7" width="100" height="75" fill="none" stroke="#9ba8b0" stroke-width="1"/>`),'','Trace and draw a '+names[k]+'.');
 }else if(id==='w00139-1'||id==='w00140-1'||id==='old-grade-1-shape'){
  const k=id==='w00140-1'?pick([1,2,3,4]):r(4),sz=20+r(9),turn=r(4)*90;
  const v=svg(`<g transform="rotate(${turn} 130 42)">${shape(k,130,42,sz)}</g>`);
  if(id==='w00140-1')put('How many straight sides?',v,box,k===1?3:k===4?6:4);
  else if(id==='old-grade-1-shape'&&i%3!==0)put(i%3===1?'How many sides?':'How many corners?',v,box,k===0?0:k===1?3:4);
  else put('Name the shape.',v,box,names[k]);
 }else if(id==='w00137-1'||id==='supplemental-size-comparison'){
  const a=28+r(15),b=a+18+r(20),swap=r(2),vals=swap?[b,a]:[a,b],more=r(2);let s;
  if(id==='w00137-1')s=vals.map((n,j)=>text('AB'[j],23,28+j*40)+`<rect x="48" y="${14+j*40}" width="${n*2}" height="16" fill="#e5e9eb" stroke="#263b48"/>`).join('');
  else s=shape(0,65,44,vals[0]/2)+shape(0,188,44,vals[1]/2)+text('A',65,86)+text('B',188,86);
  put(id==='w00137-1'?(more?'Which is longer? Write A or B.':'Which is shorter? Write A or B.'):(more?'Which is larger? Write A or B.':'Which is smaller? Write A or B.'),svg(s),box,(vals[0]>vals[1])===Boolean(more)?'A':'B');
 }else if(id==='supplemental-capacity-comparison'){
  let a=1+r(5),b=1+r(5);if(a===b)b=b%5+1;const more=r(2);const s=[a,b].map((n,j)=>text('AB'[j],18,29+j*43)+Array.from({length:n},(_,q)=>`<path d="M${40+q*37} ${8+j*43}h25l-4 26h-17z" fill="white" stroke="#263b48"/><path d="M${43+q*37} ${18+j*43}h19" stroke="#263b48"/>`).join('')).join('');
  put(`Same-size cups fill each container. Which holds ${more?'more':'less'}?`,svg(s),box,(a>b)===Boolean(more)?'A':'B');
 }else if(id==='supplemental-heavy-light'){
  const leftHeavy=r(2),heavy=r(2),ly=leftHeavy?55:27,ry=leftHeavy?27:55;
  const s=`<path d="M130 30v50M98 82h64M48 ${ly}L212 ${ry}" stroke="#263b48" stroke-width="3" fill="none"/><path d="M48 ${ly}v12M212 ${ry}v12" stroke="#263b48"/>`+shape(i%4,48,ly+22,9+i/2)+shape((i+1)%4,212,ry+22,9+i/2)+text('A',48,13)+text('B',212,13);
  put(`Which is ${heavy?'heavier':'lighter'}? Write A or B. The heavier side is lower.`,svg(s),box,Boolean(leftHeavy)===Boolean(heavy)?'A':'B');
 }else if(id==='supplemental-positional-words'){
  const dir=(i+r(4))%4,pos=[[130,14],[130,76],[80,45],[180,45]][dir],hw=18+i/2,hh=14+i/3;const s=`<rect x="${130-hw}" y="${45-hh}" width="${hw*2}" height="${hh*2}" fill="white" stroke="#263b48"/><circle cx="${pos[0]}" cy="${pos[1]}" r="${6+i/4}" fill="#263b48"/>`;
  put('Where is the dot relative to the box?',svg(s),'above / below / left / right', ['above','below','left','right'][dir]);
 }else if(id==='supplemental-kindergarten-skill-check'){
  const k=(i+r(5))%5,size=16+r(12)+i/12,turn=pick([0,30,45,60,90,120,180,270]);
  const drawing=svg(`<g transform="rotate(${turn} 130 43)">${shape(k,130,43,size)}</g>`);
  put('Name the shape.',drawing,box,names[k]);
 }else throw new Error('Unsupported K/1 candidate: '+id);
}
return items;
}
root.CandidateK1={generate};
if(typeof module!=='undefined')module.exports=root.CandidateK1;
})(globalThis);






