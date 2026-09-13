(function(root){
'use strict';
function country(){
 const path=location.pathname;
 if(path.includes('england-'))return 'GB';
 if(path.includes('australia-'))return 'AU';
 if(path.includes('canada-'))return 'CA';
 if(path.includes('us-arithmetic'))return 'US';
 const selected=new URLSearchParams(location.search).get('country')||document.getElementById('learning-country')?.value;
 if(selected)return selected;
 try{return JSON.parse(localStorage.getItem('gd-learning-region')||'{}').country||'US'}catch{return 'US'}
}
const spelling={centimeter:'centimetre',centimeters:'centimetres',millimeter:'millimetre',millimeters:'millimetres',kilometer:'kilometre',kilometers:'kilometres',meter:'metre',meters:'metres',liter:'litre',liters:'litres',color:'colour',colors:'colours',colored:'coloured',coloring:'colouring',center:'centre',centers:'centres'};
function text(value,region=country()){
 if(!['GB','AU','CA'].includes(region))return value;
 return value.replace(/\b(centimeters?|millimeters?|kilometers?|meters?|liters?|colors?|colored|coloring|centers?|math)\b/gi,word=>{
  const lower=word.toLowerCase(),replacement=lower==='math'?(region==='CA'?'math':'maths'):spelling[lower];
  return word===word.toUpperCase()?replacement.toUpperCase():word[0]===word[0].toUpperCase()?replacement[0].toUpperCase()+replacement.slice(1):replacement;
 });
}
function apply(container){
 if(!container)return;
 const walker=document.createTreeWalker(container,NodeFilter.SHOW_TEXT);
 let node;while((node=walker.nextNode())){
  if(node.parentElement?.closest('script,style,code'))continue;
  const next=text(node.nodeValue);if(next!==node.nodeValue)node.nodeValue=next;
 }
}
root.GDRegionalEnglish={country,text,apply};
})(window);
