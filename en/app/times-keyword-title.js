(()=>{'use strict';
function requestedTitle(){const p=new URLSearchParams(location.search),tables=[...new Set((p.get('tables')||'').split(',').map(Number))].sort((a,b)=>a-b);
 const id=p.get('keywordVariant');if(id){const v=(window.USKeywordVariants||[]).find(x=>String(x.id)===id&&x.kind==='times');if(v&&tables.length===1&&tables[0]===Number(v.source))return v.title;return ''}
 if(p.get('keywordTitle')==='1'&&tables.length===12&&tables.every((x,i)=>x===i+1))return 'multiplication facts worksheets 1-12';return ''}
function setTitle(){const title=requestedTitle();if(!title)return;const heading=document.getElementById('sheet-title');if(heading&&heading.textContent!==title)heading.textContent=title;document.title=title+' · googoodan.com'}
window.addEventListener('load',()=>{setTitle();const heading=document.getElementById('sheet-title');if(heading)new MutationObserver(setTitle).observe(heading,{childList:true,characterData:true,subtree:true})});
})();
