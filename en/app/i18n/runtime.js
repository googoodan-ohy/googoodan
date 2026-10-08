/* Display-only English. Original catalog/generator objects, IDs and input values stay intact. */
(()=>{'use strict';
const dictionary=window.USI18nDictionary||{},original=new WeakMap(),missing=new Set();
const hasKo=s=>/[가-힣]/.test(s),norm=s=>s.replace(/\s+/g,' ').trim(),numbers=/\d+(?:\.\d+)?/g;
const digitWords=Object.fromEntries([...('영일이삼사오육칠팔구')].map((c,i)=>[c,'zero one two three four five six seven eight nine'.split(' ')[i]]));
function t(raw,depth=0){
 if(typeof raw!=='string'||!hasKo(raw)||depth>6)return raw;
 const multi=norm(raw).match(/^(?:구구단 · )?([0-9·]+)단 연습(?: \(× ([0-9]+)~([0-9]+)\))?(?: · ([0-9]+)문제 준비 완료)?$/);
 if(multi)return 'Times Table Practice: '+multi[1].split('·').join(', ')+(multi[2]?' (× '+multi[2]+'–'+multi[3]+')':'')+(multi[4]?' · '+multi[4]+' problems ready':'');
 const s=norm(raw),values=s.match(numbers)||[],key=s.replace(numbers,'#');let out;
 if(Object.hasOwn(dictionary,key))out=dictionary[key].replace(/\{(\d+)\}/g,(_,i)=>values[Number(i)-1]??'{'+i+'}');
 else if(/^[영일이삼사오육칠팔구] 점 [영일이삼사오육칠팔구 ]+$/.test(s))out=s.split(' ').map(x=>x==='점'?'point':digitWords[x]).join(' ');
 else{
  const tables=s.match(/^([\d·]+)단 연습(?: \(× (\d+)~(\d+)\))?$/);
  if(tables)out='Times Tables '+tables[1]+(tables[2]?' (× '+tables[2]+'–'+tables[3]+')':'');
  const factors=s.match(/^(\d+)의 (약수|배수) : ([\d, ]+)$/);
  if(factors)out=(factors[2]==='약수'?'Factors':'Multiples')+' of '+factors[1]+': '+factors[3];
  for(const sep of [' · ',' / ',' — ',' | '])if(s.includes(sep)){const parts=s.split(sep).map(x=>t(x,depth+1));if(parts.every(x=>!hasKo(x))){out=parts.join(sep);break;}}
  if(out===undefined)for(const [suffix,en]of [[' 문제지 미리보기',' Worksheet Preview'],[' 문제와 정답',' Questions and Answers']])if(s.endsWith(suffix)){const v=t(s.slice(0,-suffix.length),depth+1);if(!hasKo(v))out=v+en;}
  if(out===undefined){const m=s.match(/^(\d+\. |← |↻ )(.*)$/);if(m){const v=t(m[2],depth+1);if(!hasKo(v))out=m[1]+v;}}
 }
 if(out===undefined){missing.add(s);return raw;}
 return (raw.match(/^\s*/)?.[0]||'')+out+(raw.match(/\s*$/)?.[0]||'');
}
function translate(root=document){
 if(document.body)document.body.lang='en-US';
 const text=n=>{const e=n.parentElement;if(!e||e.closest('script,style,noscript,textarea,[contenteditable="true"]'))return;const value=n.nodeValue;if(!hasKo(value))return;let en=t(value);if(e.closest('.division-horizontal')&&value.trim()==='나머지')en='R';if(e.closest('.g140-line')&&value.trim()==='은')en=':';if(en!==value){original.set(n,value);n.nodeValue=en;}};
 if(root.nodeType===3)text(root);
 else{const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);while(walker.nextNode())text(walker.currentNode);}
 const elements=root.nodeType===1?[root,...root.querySelectorAll('[title],[alt],[aria-label],[placeholder]')]:root.querySelectorAll?.('[title],[alt],[aria-label],[placeholder]')||[];
 for(const el of elements)for(const name of ['title','alt','aria-label','placeholder'])if(el.hasAttribute(name)){const value=el.getAttribute(name);const en=t(value);if(value!==en)el.setAttribute(name,en);}
}
window.USI18n={t,translate,original,missing};
const observer=new MutationObserver(records=>{const roots=new Set();for(const r of records){if(r.type==='childList')for(const n of r.addedNodes)roots.add(n);else roots.add(r.target);}for(const r of roots)if(r.isConnected)translate(r);});
translate(document);observer.observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['title','alt','aria-label','placeholder']});
document.addEventListener('DOMContentLoaded',()=>translate(document));window.addEventListener('load',()=>translate(document));window.addEventListener('beforeprint',()=>translate(document));
})();
