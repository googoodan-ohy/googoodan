(function(root){
'use strict';
const box='<span class="write-box"></span>';
const svg=(s,w=300,h=120)=>`<div class="art"><svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Worksheet diagram">${s}</svg></div>`;
const text=(x,y,s,size=14)=>`<text x="${x}" y="${y}" text-anchor="middle" font-size="${size}" fill="#17364a">${s}</text>`;
const stroke='stroke="#284e65" stroke-width="2"';
function generate(resource,seed){
let state=(Number(seed)||1)>>>0; const r=n=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return Math.floor(state/4294967296*n)};
const type=resource.sourceUnit||resource.sourceType, pick=a=>a[r(a.length)],items=[];
const toolStart=r(12); const count=['four-add','word-problems-four-addends','clock'].includes(type)?24:12;
for(let i=0;i<count;i++){
let prompt='',visual='',task=box,answer='';
if(type==='clock'){
const hour=1+r(12),minute=((i+r(12))%12)*5,ha=(hour%12+minute/60)*Math.PI/6,ma=minute*Math.PI/30;
visual=svg(`<circle cx="150" cy="60" r="53" fill="white" ${stroke}/>`+Array.from({length:60},(_,j)=>{const a=j*Math.PI/30;return `<path d="M${150+48*Math.sin(a)} ${60-48*Math.cos(a)}L${150+(j%5?45:42)*Math.sin(a)} ${60-(j%5?45:42)*Math.cos(a)}" stroke="#284e65"/>`}).join('')+Array.from({length:12},(_,j)=>{const a=(j+1)*Math.PI/6;return text(150+36*Math.sin(a),65-36*Math.cos(a),j+1,11)}).join('')+`<path d="M150 60L${150+25*Math.sin(ha)} ${60-25*Math.cos(ha)}" ${stroke} stroke-width="4"/><path d="M150 60L${150+39*Math.sin(ma)} ${60-39*Math.cos(ma)}" ${stroke}/><circle cx="150" cy="60" r="3" fill="#284e65"/>`);
prompt='Read the clock. Write the time.';task=box+' : '+box;answer=hour+':'+String(minute).padStart(2,'0');
}else if(['four-add','word-problems-four-addends'].includes(type)){
const nums=Array.from({length:4},()=>10+r(90)); const sum=nums.reduce((a,b)=>a+b,0);
if(type==='four-add'){prompt='Add the four numbers.';task=`<div class="equation">${nums.join(' + ')} = ${box}</div>`;}
else{const objects=['colored pencils','marbles','books','stickers'],object=objects[i%4];prompt=`Four boxes hold ${nums.join(', ')} ${object}. How many ${object} are there altogether?`;visual=`<div class="equation">${nums.map((n,j)=>`${'ABCD'[j]}: ${n}`).join('　')}</div>`;task=box;}answer=String(sum);
}else if(['odd-even','odd-even-within-20'].includes(type)){
const n=1+((i*7+r(20))%20);visual=svg(Array.from({length:n},(_,j)=>`<circle cx="${35+Math.floor(j/2)*24}" cy="${j%2?75:45}" r="8" fill="#d4e9ef" ${stroke}/>`).join(''),300,105);prompt='Use the pairs to decide whether the number of objects is odd or even.';task=box;answer=n%2?'Odd':'Even';
if(resource.id==='w00094-1'){visual=`<div class="equation">${n}</div>`;prompt='Is the number odd or even?';if(i%2===0){prompt='Write the even number as a sum of two equal addends.';const even=2*(1+r(10));visual=`<div class="equation">${even} = ${box} + ${box}</div>`;task='Equal addends';answer=`${even/2} + ${even/2}`;}}
}else if(['partition','rectangle-equal-parts'].includes(type)){
const n=[2,3,4][i%3],shaded=1+r(n-1),vertical=r(2)===0,ww=180+r(35),hh=60+r(12),x=45,y=15;
visual=svg(Array.from({length:n},(_,j)=>`<rect x="${x+(vertical?j*ww/n:0)}" y="${y+(vertical?0:j*hh/n)}" width="${vertical?ww/n:ww}" height="${vertical?hh:hh/n}" fill="${j<shaded?'#a8cbd6':'white'}" ${stroke}/>`).join(''),300,110);
prompt=`The rectangle has ${n} equal parts. What fraction is shaded?`;task=box+' / '+n;answer=shaded+'/'+n;
if(resource.id==='old-grade-2-partition'){
const names={2:'halves',3:'thirds',4:'fourths'};
visual=svg(`<rect x="${x}" y="${y}" width="${ww}" height="${hh}" fill="white" ${stroke}/>`+Array.from({length:n+1},(_,j)=>`<circle cx="${x+j*ww/n}" cy="${y}" r="1.4" fill="#879fac"/><circle cx="${x+j*ww/n}" cy="${y+hh}" r="1.4" fill="#879fac"/>`).join(''),300,110);
prompt=`Draw lines to divide the rectangle into ${names[n]}. Shade one part.`;
task='One part is '+box+' / '+n+' of the whole.';
answer=`1/${n}. Drawing: ${n} equal-area parts with exactly one shaded. Example: ${n-1} vertical lines through the matching guide dots. Other equal-area partitions are valid.`;
}
}else if(['shape','shape-attributes'].includes(type)){
const choices=[3,4,5,6],n=choices[i%4],angle=r(12)*Math.PI/6;
if(resource.id==='w00113-1'&&i%3===2){const shift=r(11)-5;visual=svg(`<g transform="translate(${shift},0)"><path d="M100 38L133 15H198V80L165 103H100Z M100 38H165L198 15 M165 38V103" fill="#e7f1f5" ${stroke}/><path d="M133 15V80H198M100 103L133 80" stroke="#8097a4" stroke-dasharray="4 3" fill="none"/></g>`);prompt='How many square faces does the cube have?';answer='6';task=box;}
else{const pts=Array.from({length:n},(_,j)=>`${150+48*Math.cos(angle+j*2*Math.PI/n)},${58+48*Math.sin(angle+j*2*Math.PI/n)}`).join(' ');visual=svg(`<polygon points="${pts}" fill="#e7f1f5" ${stroke}/>`);prompt=i%2?'How many corners does the shape have?':'How many sides does the shape have?';task=box;answer=String(n);}
if(resource.id==='old-grade-2-shape'){prompt='Name the shape.';answer={3:'Triangle',4:'Square',5:'Pentagon',6:'Hexagon'}[n];}
}else if(type==='lineplot'){
const start=2+r(6),counts=Array.from({length:5},()=>r(5));if(!counts.some(Boolean))counts[2]=2;
visual=svg(`<path d="M35 100H265" ${stroke}/>`+counts.map((n,j)=>`<path d="M${45+j*52} 96v8" ${stroke}/>`+text(45+j*52,120,start+j,12)+Array.from({length:n},(_,k)=>text(45+j*52,87-k*18,'×',17)).join('')).join('')+text(150,142,'Length (cm)',12),300,150);
const index=r(5);prompt=i%3===0?'Each × represents one measurement. How many measurements are shown?':i%3===1?`How many objects measure ${start+index} cm?`:`How many objects are longer than ${start+2} cm?`;task=box;answer=String(i%3===0?counts.reduce((a,b)=>a+b,0):i%3===1?counts[index]:counts[3]+counts[4]);
if(i%2===0){
const data=counts.flatMap((n,j)=>Array(n).fill(start+j));
for(let k=data.length-1;k>0;k--){const j=r(k+1);[data[k],data[j]]=[data[j],data[k]];}
prompt='Use the measured lengths to make a line plot. Draw one × for each measurement.';
visual='<div style="font-size:13px;margin-bottom:6px">Lengths (cm): '+data.join(', ')+'</div>'+svg(`<path d="M35 100H265" ${stroke}/>`+counts.map((n,j)=>`<path d="M${45+j*52} 96v8" ${stroke}/>`+text(45+j*52,120,start+j,12)).join('')+text(150,142,'Length (cm)',12),300,150);
task='Total measurements: '+box;
answer='Plot: '+counts.map((n,j)=>`${start+j} cm: ${n} ×`).join('; ')+'. Total: '+data.length+'.';
}
}else if(type==='measure-tools'){
const scenarios=[['a pencil','Ruler'],['a classroom floor','Measuring tape'],['a book cover','Ruler'],['a playground','Measuring tape'],['an eraser','Ruler'],['a desk','Meter stick'],['a notebook','Ruler'],['a door frame','Meter stick'],['a hallway','Measuring tape'],['a postage stamp','Ruler'],['a bookcase','Meter stick'],['a window','Measuring tape']];const [object,tool]=scenarios[(i+toolStart)%12];prompt='Choose a tool to measure the length or height of '+object+'.';visual=svg(`<rect x="15" y="20" width="100" height="20" fill="#fae6ad" ${stroke}/>`+Array.from({length:10},(_,j)=>`<path d="M${20+j*9} 20v${j%5?7:13}" stroke="#284e65"/>`).join('')+text(65,62,'Ruler',11)+`<path d="M135 18H220V38H135Z" fill="#cddfe9" ${stroke}/>`+text(177,62,'Meter stick',10)+`<circle cx="261" cy="29" r="19" fill="#d4e9ef" ${stroke}/><path d="M246 29h-10v10h20" fill="none" ${stroke}/>`+text(259,62,'Tape',11),300,80);task=box;answer=tool==='Ruler'?'Ruler':tool==='Meter stick'?'Meter stick or measuring tape':'Measuring tape';
}else if(['estimate-length','estimate-measure-book'].includes(type)){
const len=3+r(6),offset=r(3),pitch=24,width=len*pitch;visual=svg(`<rect x="${20+offset*pitch}" y="12" width="${width}" height="38" rx="2" fill="#d9e9ed" ${stroke}/><path d="M${28+offset*pitch} 12v38" ${stroke}/>`+text(20+offset*pitch+width/2,37,'Book')+`<path d="M20 74H284" ${stroke}/>`+Array.from({length:12},(_,j)=>`<path d="M${20+j*pitch} 68v12" ${stroke}/>`+text(20+j*pitch,95,j,11)).join('')+text(265,114,'cm',12),300,120);prompt='Estimate the pictured book’s length in centimeters. Then use the ruler in the picture to check.';task='Estimate: '+box+' cm<br>Ruler: '+box+' cm';answer=`Estimates vary. Ruler: ${len} cm (${offset+len} − ${offset}).`;
if(resource.id==='w00112-1'){
const measured=12+r(16),difference=1+r(5),estimate=measured+(i%2?difference:-difference),pitch=8;
prompt=`Sam estimates that the book is ${estimate} cm long. Read the ruler. How many centimeters does the estimate differ from the measured length?`;
visual=svg(`<rect x="25" y="12" width="${measured*pitch}" height="38" rx="2" fill="#e5eff3" ${stroke}/><path d="M31 12v38" ${stroke}/>`+text(25+measured*pitch/2,37,'Book',12)+`<path d="M25 74H265" ${stroke}/>`+Array.from({length:31},(_,j)=>`<path d="M${25+j*pitch} ${j%5?70:66}v${j%5?8:16}" stroke="#284e65"/>`+(j%5?'':text(25+j*pitch,97,j,11))).join('')+text(280,97,'cm',11),300,115);
task='Measured: '+box+' cm<br>Difference: '+box+' cm';
answer=`${measured} cm; difference: ${difference} cm.`;
}
}else throw new Error('Unsupported Grade 2 candidate: '+resource.id+' / '+type);
items.push({prompt,visual,task,answer:String(answer)});
}return items;
}
root.CandidateG2={generate}; if(typeof module!=='undefined')module.exports=root.CandidateG2;
})(globalThis);
