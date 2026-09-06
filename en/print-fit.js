/* Measure using the print rules in an isolated, nonprinting frame. The visible
   preview and printout always contain the same fitted set of questions. */
function fitPrintedSheet(){
 const sheet=document.getElementById('sheet');
 let frame=document.getElementById('print-measure');
 if(!frame){frame=document.createElement('iframe');frame.id='print-measure';frame.title='Print layout measurement';frame.setAttribute('aria-hidden','true');frame.tabIndex=-1;frame.style.cssText='position:absolute;left:-10000px;top:0;width:800px;height:1100px;visibility:hidden;pointer-events:none';document.body.append(frame);}
 frame.style.setProperty("display","block","important");
 const collect=rules=>Array.from(rules).map(rule=>{
  if(rule.type===CSSRule.MEDIA_RULE)return rule.conditionText.includes('print')?collect(rule.cssRules):'';
  if(rule.type===CSSRule.STYLE_RULE)return rule.cssText;
  return '';
 }).join('\n');
 const css=Array.from(document.styleSheets).map(s=>{try{return collect(s.cssRules)}catch{return ''}}).join('\n');
 const doc=frame.contentDocument;doc.open();doc.write('<!doctype html><html><head><style>'+css+'\nhtml,body{width:190mm;margin:0;padding:0}.sheet{margin:0}</style></head><body></body></html>');doc.close();
 const limit=250*96/25.4;
 function inspect(){doc.body.innerHTML='';const clone=sheet.cloneNode(true);clone.classList.add('is-answer');doc.body.append(clone);const rect=clone.getBoundingClientRect();const footer=clone.querySelector('.sheet-footer').getBoundingClientRect();const end=clone.querySelector('.celebrate').getBoundingClientRect();return rect.height<=limit+1&&end.bottom<=footer.top-2;}
 let count=sheet.querySelectorAll('.card').length;
 while(!inspect()&&count>3){
  const activities=Array.from(sheet.querySelectorAll('.cards'));
  const middle=activities[1];
  let target=middle.children.length>2?middle:null;
  if(!target){target=activities.filter(a=>a.children.length>1).sort((a,b)=>activities.indexOf(b)-activities.indexOf(a))[0];}
  if(!target)break;target.lastElementChild.remove();count--;
 }
 sheet.querySelectorAll('.qid').forEach((el,i)=>el.textContent=i+1);
 const note=document.getElementById('fit-note');if(note)note.textContent=count+' questions · Sized to fit one printed page';
 frame.style.setProperty("display","none","important");
 return count;
}
