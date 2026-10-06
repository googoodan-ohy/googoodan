(function(root){
'use strict';

const supported=new Set(['US','GB','CA','AU']);
const nodeStates=new WeakMap();
let titleState=null;

function validCountry(value){
 const normalized=String(value||'').toUpperCase();
 return supported.has(normalized)?normalized:'';
}

function country(){
 const requested=validCountry(new URLSearchParams(location.search).get('country'));
 if(requested)return requested;
 const path=location.pathname.toLowerCase();
 if(path.includes('england-'))return 'GB';
 if(path.includes('australia-'))return 'AU';
 if(path.includes('canada-'))return 'CA';
 if(path.includes('us-arithmetic'))return 'US';
 try{
  const saved=validCountry(JSON.parse(localStorage.getItem('gd-learning-region')||'{}').country);
  if(saved)return saved;
 }catch{}
 for(const language of navigator.languages||[navigator.language]){
  const match=String(language||'').match(/^en[-_](US|GB|CA|AU)\b/i);
  if(match)return match[1].toUpperCase();
 }
 return 'US';
}

const words={
 centimeter:{US:'centimeter',regional:'centimetre'},centimeters:{US:'centimeters',regional:'centimetres'},
 centimetre:{US:'centimeter',regional:'centimetre'},centimetres:{US:'centimeters',regional:'centimetres'},
 millimeter:{US:'millimeter',regional:'millimetre'},millimeters:{US:'millimeters',regional:'millimetres'},
 millimetre:{US:'millimeter',regional:'millimetre'},millimetres:{US:'millimeters',regional:'millimetres'},
 kilometer:{US:'kilometer',regional:'kilometre'},kilometers:{US:'kilometers',regional:'kilometres'},
 kilometre:{US:'kilometer',regional:'kilometre'},kilometres:{US:'kilometers',regional:'kilometres'},
 meter:{US:'meter',regional:'metre'},meters:{US:'meters',regional:'metres'},
 metre:{US:'meter',regional:'metre'},metres:{US:'meters',regional:'metres'},
 liter:{US:'liter',regional:'litre'},liters:{US:'liters',regional:'litres'},
 litre:{US:'liter',regional:'litre'},litres:{US:'liters',regional:'litres'},
 color:{US:'color',regional:'colour'},colors:{US:'colors',regional:'colours'},
 colour:{US:'color',regional:'colour'},colours:{US:'colors',regional:'colours'},
 colored:{US:'colored',regional:'coloured'},coloured:{US:'colored',regional:'coloured'},
 coloring:{US:'coloring',regional:'colouring'},colouring:{US:'coloring',regional:'colouring'},
 center:{US:'center',regional:'centre'},centers:{US:'centers',regional:'centres'},
 centre:{US:'center',regional:'centre'},centres:{US:'centers',regional:'centres'}
};

function matchCase(source,replacement){
 if(source===source.toUpperCase())return replacement.toUpperCase();
 if(source[0]===source[0].toUpperCase())return replacement[0].toUpperCase()+replacement.slice(1);
 return replacement;
}

function text(value,region=country()){
 const selected=validCountry(region)||'US';
 const regional=selected!=='US';
 return String(value).replace(/\b(centimeters?|centimetres?|millimeters?|millimetres?|kilometers?|kilometres?|meters?|metres?|liters?|litres?|colors?|colours?|colored|coloured|coloring|colouring|centers?|centres?|maths?)\b/gi,word=>{
  const lower=word.toLowerCase();
  const replacement=lower==='math'||lower==='maths'
   ?(selected==='GB'||selected==='AU'?'maths':'math')
   :words[lower][regional?'regional':'US'];
  return matchCase(word,replacement);
 });
}

function localizedNodeText(value,node,region){
 let source=String(value);
 if(node.parentElement?.closest('.brand-note')){
  const label={US:'US math worksheets',GB:'England maths worksheets',CA:'Canadian math worksheets',AU:'Australian maths worksheets'}[region];
  source=source.replace(/(?:US|England|Australian|Canadian)\s+maths?\s+worksheets/i,label);
 }
 return text(source,region);
}

function apply(container,region=country()){
 if(!container)return;
 const selected=validCountry(region)||'US';
 const walker=document.createTreeWalker(container,NodeFilter.SHOW_TEXT);
 let node;
 while((node=walker.nextNode())){
  if(node.parentElement?.closest('script,style,code'))continue;
  const previous=nodeStates.get(node);
  const source=previous&&node.nodeValue===previous.rendered?previous.source:node.nodeValue;
  const rendered=localizedNodeText(source,node,selected);
  if(rendered!==node.nodeValue)node.nodeValue=rendered;
  nodeStates.set(node,{source,rendered});
 }
}

function applyTitle(region=country()){
 const selected=validCountry(region)||'US';
 const source=titleState&&document.title===titleState.rendered?titleState.source:document.title;
 const rendered=text(source,selected);
 if(rendered!==document.title)document.title=rendered;
 titleState={source,rendered};
}

function applyPage(region=country()){
 apply(document.body,region);
 applyTitle(region);
}

root.GDRegionalEnglish={country,text,apply,applyTitle,applyPage};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>applyPage());
else applyPage();
})(window);
