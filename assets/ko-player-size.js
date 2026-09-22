window.addEventListener('load',()=>{
 const root=document.getElementById('player-root');
 const update=()=>parent.postMessage({type:'ko-player-height',height:Math.ceil(root.getBoundingClientRect().height)+4},location.origin==='null'?'*':location.origin);
 new ResizeObserver(update).observe(root);update();
});
