function writtenWork(p,show){
 const natural=window.trainingDomain==='whole',decimal=window.trainingDomain==='decimal';
 if(p.op==='×'&&p.vertical&&natural){
  const a=Number(p.a),b=String(p.b),partials=[...b].reverse().map((d,i)=>a*Number(d)*10**i);
  return '<div class="worked multiplication"><div>'+a+'</div><div class="work-rule">× '+b+'</div><div class="working">'+(b.length>1?'<div class="'+(show?'':'concealed')+'">'+partials.map((v,i)=>'<div>'+(i===partials.length-1?'+ ':'')+v+'</div>').join('')+'</div>':'')+'<div class="multiplication-answer"><span class="answer '+(show?'':'concealed')+'">'+p.answer+'</span></div></div></div>';
 }
 if(p.op!=='÷'||!natural&&!decimal)return null;
 let a=Number(p.a),b=Number(p.b),note='';
 if(decimal){
  const places=(String(p.b).split('.')[1]||'').length,scale=10**places;
  a=Math.round(a*scale*100)/100;b=Math.round(b*scale);
  note='<div class="division-note">'+p.a+' ÷ '+p.b+(places?'<span class="'+(show?'':'concealed')+'"> = '+a+' ÷ '+b+'</span>':'')+'</div>';
 }
 const precision=decimal?Math.max((String(a).split('.')[1]||'').length,(String(p.answer).split('.')[1]||'').length):0;
 const input=decimal?a.toFixed(precision):String(a),chars=[...input],digits=chars.filter(c=>c!=='.');
 const x0=Math.max(58,String(b).length*15+12,String(p.b).length*15+12),cell=15,startY=49;
 const txt=(v,x,y,extra='')=>'<text x="'+x+'" y="'+y+'" '+extra+'>'+v+'</text>';
 let rem=0,started=false,body='',q='',steps=0;
 for(let i=0;i<digits.length;i++){
  const n=rem*10+Number(digits[i]),d=Math.floor(n/b);rem=n-d*b;
  if(!started&&d===0&&i<digits.length-1&&i<(input.includes('.')?input.indexOf('.')-1:digits.length-1)){q+=' ';continue;}
  started=true;q+=String(d);
  const x=x0+(i+1)*cell;
  if(steps>0)body+=txt(n,x,startY+steps*42-2);
  body+=txt('−'+d*b,x,startY+steps*42+17);
  body+='<path d="M'+(x-Math.max(String(n).length,String(d*b).length+1)*cell)+' '+(startY+steps*42+22)+'H'+(x+3)+'"/>';
  if(i===digits.length-1)body+=txt(rem,x,startY+steps*42+39);
  steps++;
 }
 let qi=0,top='';for(let i=0;i<chars.length;i++){if(chars[i]==='.')top+=txt('.',x0+qi*cell+5,20);else{top+=txt(q[qi]||'0',x0+(qi+1)*cell,20);qi++;}}
 let dividend='',di=0;for(const c of (decimal&&!show?[...String(p.a)]:chars)){if(c==='.')dividend+=txt('.',x0+di*cell+5,startY);else dividend+=txt(c,x0+(++di)*cell,startY);}
 const remainder=natural?Number(p.a)%Number(p.b):0;
 if(natural&&remainder)top+=txt('R '+remainder,x0+digits.length*cell+65,20);
 const width=(natural&&remainder?65:0)+x0+Math.max(digits.length,String(p.a).replace('.','').length)*cell+16,height=startY+steps*42+4;
 return note+'<svg class="long-division" width="'+width+'" height="'+height+'" viewBox="0 0 '+width+' '+height+'" style="height:'+height+'px" aria-label="Long division: '+p.a+' divided by '+p.b+'"><g text-anchor="end" font-family="monospace" font-size="19" fill="#243e55">'+txt(decimal&&!show?p.b:b,x0-9,startY)+dividend+'<path d="M'+(x0-2)+' '+(startY+5)+'V29H'+(x0+digits.length*cell+13)+'" fill="none" stroke="#243e55"/><g class="working '+(show?'':'concealed')+'" fill="#c62828" stroke-width="1">'+top+'<g stroke="#c62828">'+body.replaceAll('<text ','<text stroke="none" ')+'</g></g></g></svg>';
}
