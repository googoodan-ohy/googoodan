(function(root){
const colors=['#e67786','#358b83','#e2a630'];
const svg=(body,w=180,h=68)=>`<svg viewBox="0 0 ${w} ${h}" style="--art-width:${w};--art-height:${h}" aria-hidden="true">${body}</svg>`;
function shape(name,x=30,y=30,size=20,color=colors[0],angle=0){let body='';if(name==='circle')body=`<circle cx="${x}" cy="${y}" r="${size}"/>`;if(name==='square')body=`<rect x="${x-size}" y="${y-size}" width="${size*2}" height="${size*2}"/>`;if(name==='rectangle')body=`<rect x="${x-size}" y="${y-size*.6}" width="${size*2}" height="${size*1.2}"/>`;if(name==='triangle')body=`<path d="M${x} ${y-size}L${x+size} ${y+size}H${x-size}Z"/>`;if(name==='hexagon')body=`<path d="M${x-size} ${y}l${size/2} ${-size}h${size}l${size/2} ${size}l${-size/2} ${size}h${-size}Z"/>`;return `<g fill="${color}" stroke="#385567" stroke-width="1.3" transform="rotate(${angle} ${x} ${y})">${body}</g>`;}
function apple(x,y,cross=false){return `<g transform="translate(${x} ${y})"><path d="M0 4Q-12 -4 -11 9Q-9 21 0 17Q9 21 11 9Q12 -4 0 4" fill="#e67786" stroke="#9f4e5f"/><path d="M0 4Q0 -5 7 -4" fill="none" stroke="#43816b" stroke-width="2"/>${cross?'<path d="M-13 -3L13 22M13 -3L-13 22" stroke="#243d51" stroke-width="2"/>':''}</g>`;}
function objects(n,cross=0,scatter=false){const cols=n>10?10:5,w=cols*27+10,rows=Math.max(1,Math.ceil(n/cols));return `<div class="art object-art" role="img" aria-label="${n} apples${cross?', '+cross+' crossed out':''}">${svg((n===0?'<rect x="5" y="3" width="130" height="34" rx="8" fill="none" stroke="#a9bdc5" stroke-dasharray="3 3"/>':'')+Array.from({length:n},(_,i)=>apple(18+i%cols*27,10+Math.floor(i/cols)*30+(scatter?(i%3)*7:0),i>=n-cross)).join(''),w,rows*30+20+(scatter?14:0))}</div>`;}
function frame(n){return `<div class="art" role="img" aria-label="Ten-frame with ${n} filled spaces">${svg(Array.from({length:10},(_,i)=>`<rect x="${i%5*24+2}" y="${Math.floor(i/5)*24+2}" width="24" height="24" fill="white" stroke="#5f7d87"/>${i<n?`<circle cx="${i%5*24+14}" cy="${Math.floor(i/5)*24+14}" r="8" fill="#358b83"/>`:''}`).join(''),125,53)}</div>`;}
const box=(text='')=>`<span class="write-box">${text}</span>`;
const solid=name=>svg(name==='sphere'?'<circle cx="90" cy="33" r="27" fill="#e9ae45" stroke="#385567"/><ellipse cx="90" cy="33" rx="27" ry="9" fill="none" stroke="#385567" stroke-dasharray="3 3"/>':name==='cube'?'<path d="M63 19L84 5L115 18V50L94 64L63 51Z" fill="#95c9c3" stroke="#385567"/><path d="M63 19L94 32L115 18M94 32V64" fill="none" stroke="#385567"/>':name==='cone'?'<path d="M60 53L90 5L120 53" fill="#f1b4c2" stroke="#385567"/><ellipse cx="90" cy="53" rx="30" ry="10" fill="#f1b4c2" stroke="#385567"/>':'<path d="M65 14V54Q90 70 115 54V14" fill="#95c9c3" stroke="#385567"/><ellipse cx="90" cy="14" rx="25" ry="9" fill="#c9e8e3" stroke="#385567"/>');
function generate(profile,seed){let state=seed>>>0;const r=n=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return Math.floor(state/4294967296*n);},pick=a=>a[r(a.length)];
const question=(mode)=>{
const max=profile.max||10;let n=1+r(max),a,b,result;const q={mode,prompt:'',visual:'',task:'',answer:'',open:false};
const set=(prompt,visual,task,answer,open=false)=>Object.assign(q,{prompt,visual,task,answer:String(answer),open});
const choice=(correct,limit=10)=>{const opts=[correct,(correct+1)%(limit+1),(correct+2)%(limit+1)];for(let i=2;i>0;i--){const j=r(i+1);[opts[i],opts[j]]=[opts[j],opts[i]];}return opts.join('    /    ');};
if(['trace','count','draw','match','scatter','select','rearrange'].includes(mode)){
if(profile.id.startsWith('numbers-')){const lo={'numbers-1':0,'numbers-2':6,'numbers-3':11,'numbers-4':16}[profile.id];n=lo+r(max-lo+1);}
if(mode==='trace')set('Trace. Then write the number.',`<div class="trace">${n} ${n}</div>`,'Write: '+box(),n);
if(mode==='count'||mode==='scatter')set('How many apples?',objects(n,0,mode==='scatter'),box()+' apples',n);
if(mode==='draw')set('Draw '+n+' little dots.','<div class="drawing-space"></div>','',n+' dots',true);
if(mode==='match'||mode==='select')set('Circle the matching number.',objects(n),choice(n,max),n);
if(mode==='rearrange')set('Same apples, a new arrangement. How many in each?',objects(n)+objects(n,0,true),box()+' in each group',n);
}
else if(['next','path','continue','tens','path10','next10'].includes(mode)){
const step=mode==='tens'||mode.endsWith('10')?10:1;const start=step===10?r(8)*10:r(max-3);const missing=mode==='next'||mode==='next10'?1:mode==='continue'?3:2;const seq=Array.from({length:4},(_,i)=>i===missing?box():start+i*step);set(step===10?'Count by tens. Fill the gap.':'Count forward. Fill the gap.','<div class="number-path">'+seq.join(' → ')+'</div>','',start+missing*step);
}
else if(['more','less','equal','larger','smaller','sameNumber','pairCompare'].includes(mode)){
a=1+r(max);b=mode==='equal'||mode==='sameNumber'?(r(2)?a:Math.max(1,a-1)):a===max?a-1:a+1;
const symbolic=['larger','smaller','sameNumber'].includes(mode);const visual=symbolic?`<div class="equation">A: ${a} &nbsp; B: ${b}</div>`:`<div class="group-label">A</div>${objects(a)}<div class="group-label">B</div>${objects(b)}`;
if(mode==='equal'||mode==='sameNumber')set('Are the two groups equal?',visual,'Circle: Yes / No',a===b?'Yes':'No');else {const more=['more','larger','pairCompare'].includes(mode);set(mode==='pairCompare'?'Match apples in A and B. Which group has more?':'Circle the '+(more?'greater':'smaller')+(symbolic?' number.':' group.'),visual,'A / B',more?(a>b?'A':'B'):(a<b?'A':'B'));}
}
else if(['join','part','split','bond','twoWays','partStory'].includes(mode)){
n=profile.id==='parts-2'?5:2+r(max-1);a=1+r(n-1);b=n-a;
if(mode==='join')set('Put the groups together.',objects(a)+'<div class="math-sign">+</div>'+objects(b),box()+' in all',n);
if(mode==='part'||mode==='bond')set(mode==='bond'?'Finish the number bond.':'Find the missing part.',`<div class="bond">Whole: ${n}<br>Parts: ${a} and ${box()}</div>`, '',b);
if(mode==='split')set('Split '+n+' apples into two groups.',objects(n),box()+' + '+box()+' = '+n,`${a} + ${b} = ${n}. Other pairs totaling ${n} are correct.`,true);
if(mode==='twoWays')set('Make '+n+' in two different ways.','',box()+' + '+box()+' = '+n+'<br>'+box()+' + '+box()+' = '+n,`0 + ${n}; 1 + ${n-1}. Other distinct pairs totaling ${n} are correct.`,true);
if(mode==='partStory')set(`There are ${n} apples. ${a} are in a bag. How many are outside?`,objects(n),box()+' apples',b);
}
else if(/^(add|sub)/.test(mode)||['joinStory','hideStory'].includes(mode)){
const sub=mode.startsWith('sub')||mode==='hideStory';a=sub?1+r(max):r(max+1);b=sub?r(a+1):r(max-a+1);result=sub?a-b:a+b;const op=sub?'−':'+';const visual=sub?objects(a,b):objects(a)+'<div class="math-sign">+</div>'+objects(b);const equation=`${a} ${op} ${b} = `;
if(mode.endsWith('Picture'))set(sub?'Count the apples that are left.':'Count both groups.',visual,box()+' apples',result);
else if(mode.endsWith('Choice'))set('Circle the answer.',`<div class="equation">${equation}?</div>`,choice(result,max),result);
else if(mode.endsWith('Match'))set('Circle the equation that matches.',visual,(r(2)?`${a} ${op} ${b} = ${result+1}<br>${a} ${op} ${b} = ${result}`:`${a} ${op} ${b} = ${result}<br>${a} ${op} ${b} = ${result+1}`),`${equation}${result}`);
else if(mode.endsWith('Draw'))set(sub?`Draw ${a} dots. Cross out ${b}. How many remain?`:`Draw ${a} dots, then ${b} more. How many in all?`,'<div class="drawing-space"></div>',box(),result);
else if(mode==='addFrame')set('Add the two filled amounts.',frame(a)+'<div class="math-sign">+</div>'+frame(b),equation+box(),result);
else if(mode.endsWith('Equation'))set('Finish the number sentence.','',`<div class="equation">${equation}${box()}</div>`,result);
else set(mode==='hideStory'?`${a} apples are on a plate. Hide ${b}. How many can you still see?`:mode==='joinStory'?`One basket has ${a} apples. Another has ${b}. How many altogether?`:sub?`We have ${a} apples. We give away ${b}. How many are left?`:`We have ${a} apples. We get ${b} more. How many in all?`,visual,box()+' apples',result);
}
else if(mode.startsWith('ten')){a=1+r(9);b=10-a;
if(mode==='tenFrame')set('How many empty spaces?',frame(a),box(),b);
if(mode==='tenDraw')set('Draw dots in the empty spaces to make 10.',frame(a),'',`Draw ${b} more dots.`,true);
if(mode==='tenChoice')set('Circle how many more make 10.',objects(a),choice(b,10),b);
if(mode==='tenEquation')set('Find the missing part.',frame(a),`${a} + ${box()} = 10`,b);
if(mode==='tenStory')set(`We need 10 apples. We have ${a}. How many more?`,objects(a),box()+' apples',b);
}
else if(mode.startsWith('teen')){n=11+r(9);b=n-10;
if(mode==='teenCount')set('Count ten and the extra ones.',frame(10)+objects(b),box(),n);
if(mode==='teenEquation')set('Break the number into ten and ones.',`<div class="equation">${n} = 10 + ${box()}</div>`,'',b);
if(mode==='teenMatch')set('Circle the number shown.',frame(10)+objects(b),choice(n,20),n);
if(mode==='teenDraw')set(`Draw ${n} dots. Circle a group of ten.`,'<div class="drawing-space"></div>','',`${n} dots with 10 circled and ${b} outside.`,true);
if(mode==='teenPart')set(`Ten ones and ${b} extra ones make...`,frame(10)+objects(b),`10 + ${b} = ${box()}`,n);
if(mode==='teenStory')set(`A box holds 10 crayons. There are ${b} more outside. How many crayons?`,frame(10)+objects(b),box(),n); // dots model the quantities, not physical crayons
}
else if(['longer','shorter','lengthStory','taller','lower','heightStory','heavier','lighter','weightStory'].includes(mode)){
const heavy=['heavier','lighter','weightStory'].includes(mode),vertical=['taller','lower','heightStory'].includes(mode),bigA=!!r(2);const target=['shorter','lower','lighter'].includes(mode)?!bigA:bigA;let art;
if(heavy){const ya=bigA?42:18,yb=bigA?18:42;art=svg(`<path d="M90 27L75 65H105Z" fill="#d6e9e7" stroke="#385567"/><path d="M30 ${ya}L150 ${yb}" stroke="#385567" stroke-width="3"/><path d="M15 ${ya+12}h30M135 ${yb+12}h30M30 ${ya}v12M150 ${yb}v12" stroke="#385567" stroke-width="2"/><text x="25" y="${ya-5}">A</text><text x="145" y="${yb-5}">B</text>`,180,70);}
else if(vertical)art=svg(`<rect x="35" y="${bigA?10:35}" width="32" height="${bigA?50:25}" fill="#358b83"/><rect x="112" y="${bigA?35:10}" width="32" height="${bigA?25:50}" fill="#e67786"/><path d="M20 60H160" stroke="#385567"/><text x="44" y="76">A</text><text x="122" y="76">B</text>`,180,80);
else art=svg(`<text x="0" y="23">A</text><rect x="22" y="8" width="${bigA?140:75}" height="18" fill="#358b83"/><text x="0" y="57">B</text><rect x="22" y="42" width="${bigA?75:140}" height="18" fill="#e67786"/>`);
const word=heavy?(mode==='lighter'?'lighter':'heavier'):vertical?(mode==='lower'?'shorter':'taller'):(mode==='shorter'?'shorter':'longer');set((mode.endsWith('Story')?'Help Bunny choose. ':'')+'Which is '+word+'?'+(heavy?' The heavier side hangs lower.':''),'<div class="art">'+art+'</div>','Circle: A / B',target?'A':'B');
}
else if(/^(sort|countShape|mostShape|countColor|leastColor|countSize|mostSize)/.test(mode)){
const kind=mode.includes('Color')?'color':mode.includes('Size')?'size':'shape';const counts=[1+r(3),1+r(3),1+r(3)]; // <= 9 items in a category picture
if(mode.startsWith('most')||mode.startsWith('least')){counts[0]=1;counts[1]=2;counts[2]=3;for(let i=2;i>0;i--){const j=r(i+1);[counts[i],counts[j]]=[counts[j],counts[i]];}}
const names=kind==='color'?['pink','green','yellow']:kind==='size'?['small','medium','large']:['circle','square','triangle'];let items=[];counts.forEach((count,k)=>{for(let j=0;j<count;j++)items.push(k);});for(let i=items.length-1;i>0;i--){const j=r(i+1);[items[i],items[j]]=[items[j],items[i]];}
const art=svg(items.map((k,i)=>shape(kind==='shape'?names[k]:'circle',22+i%5*36,22+Math.floor(i/5)*38,kind==='size'?[6,10,15][k]:12,kind==='color'?colors[k]:colors[1])).join(''),190,83);const visual='<div class="art">'+art+'</div>'+(kind==='color'?'<small>pink · green · yellow</small>':'');
if(mode.startsWith('sort'))set('Group by '+kind+'. Write each group’s count.',visual,names.map(x=>x+': '+box()).join(' '),names.map((x,i)=>x+': '+counts[i]).join(', '));
else if(mode.startsWith('count')){const k=r(3);set('How many '+names[k]+(kind==='shape'?'s':' objects')+'?',visual,box(),counts[k]);}
else {const most=mode.startsWith('most');const index=counts.indexOf(most?Math.max(...counts):Math.min(...counts));set('Which group has the '+(most?'most':'fewest')+'?',visual,names.join(' / '),names[index]);}
}
else {
const names=['circle','square','triangle','rectangle','hexagon'];const name=pick(names);const sides={circle:0,square:4,triangle:3,rectangle:4,hexagon:6};const art='<div class="art">'+svg(shape(name,90,34,25,colors[r(3)],mode==='rotated'?45:0))+'</div>';
if(mode==='shapeName'||mode==='rotated')set('Name the shape.',art,names.join(' / '),name);
else if(mode==='shapeFind'){const target=pick(names.slice(0,3));set('Circle the '+target+'.','<div class="art">'+svg(names.slice(0,3).map((s,i)=>shape(s,30+i*60,34,21,colors[i])).join(''))+'</div>','',target);}
else if(mode==='shapeDraw')set('Draw a '+name+'.','<div class="drawing-space"></div>','',name+` (${sides[name]} straight sides). Size and orientation may vary.`,true);
else if(mode==='shapeSides'||mode==='shapeCorners')set('How many '+(mode==='shapeSides'?'straight sides':'corners')+'?',art,box(),sides[name]);
else if(mode==='shapeCompare')set('What is the same about a square and a rectangle?','<div class="art">'+svg(shape('square',45,32,24)+shape('rectangle',130,32,28))+'</div>','Both have '+box()+' straight sides.',4);
else if(['solidName','solidMatch','flatSolid'].includes(mode)){const name=pick(['sphere','cube','cone','cylinder']);if(mode==='flatSolid'){const flat=!!r(2);set('Is this shape flat or solid?',flat?art:'<div class="art">'+solid(name)+'</div>','Flat / Solid',flat?'Flat':'Solid');}else set(mode==='solidMatch'?'Which shape could model this object?':'Name this solid shape.','<div class="art">'+solid(name)+'</div>','sphere / cube / cone / cylinder',name);}
else if(mode.startsWith('position')){const pos=pick(['above','below','beside']);const coords={above:[90,10],below:[90,68],beside:[145,38]}[pos];const scene=svg(shape('square',90,38,17,colors[1])+`<text x="${coords[0]}" y="${coords[1]+6}" text-anchor="middle" font-size="22" fill="#996316">★</text>`,180,85);if(mode==='positionDraw')set('Draw a star '+pos+' the box.','<div class="art">'+svg(shape('square',90,40,15,colors[1]),180,85)+'</div>','',`Star ${pos} the box.`,true);else set('Where is the star?','<div class="art">'+scene+'</div>','above / below / beside',pos);}
else if(mode==='compose')set('Join the two triangles along the dotted edges. What shape can they make?','<div class="art">'+svg('<path d="M15 10H65V60Z M115 10V60H65Z" fill="#e9ae45" stroke="#385567"/><path d="M15 10L65 60M115 10L65 60" stroke="#385567" stroke-dasharray="3 3"/>')+'</div>','square / circle / triangle','square');
else if(mode==='build')set('Build a triangle with sticks or draw one. How many sticks for its sides?','<div class="drawing-space"></div>',box()+' sticks','3 sticks; a closed triangle. Adult checks the model.',true);
else throw Error('Unknown activity '+mode);
}
if(!q.prompt)throw Error('Missing activity '+mode);return q;
};
return profile.modes.map((mode,index)=>({mode,questions:Array.from({length:index===1?3:2},()=>question(mode))}));
}
root.KEngine={generate};if(typeof module!=='undefined')module.exports=root.KEngine;
})(globalThis);
