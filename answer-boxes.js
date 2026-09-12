(()=>{
const box='<span class="write-answer-box" aria-label="□"></span>';
window.GDAnswerBoxes=function(html){let svg=0;return String(html).split(/(<[^>]+>)/g).map((part,i)=>{if(i%2){if(/^<svg\b/i.test(part))svg++;if(/^<\/svg/i.test(part))svg--;return part;}return svg?part:part.replace(/□/g,box);}).join('');};
function apply(root){const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const nodes=[];while(walker.nextNode()){const n=walker.currentNode,p=n.parentElement;if(n.data.includes('□')&&p&&p.closest('.paper,.sheet')&&!p.closest('svg,script,style,.prompt,.solution,.answer,.write-answer-box,h1,h2,h3')&&p.closest('.task,.visual,.expression,.equation,.problem,.question,.kequation'))nodes.push(n);}for(const n of nodes){const t=document.createElement('template');t.innerHTML=GDAnswerBoxes(n.data.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'));n.replaceWith(t.content);}}
const start=()=>{apply(document.body);new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes)if(n.nodeType===1&&!n.matches('.write-answer-box'))apply(n);}).observe(document.body,{childList:true,subtree:true});};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();window.addEventListener('beforeprint',()=>apply(document.body));
})();
