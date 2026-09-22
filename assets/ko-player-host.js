window.addEventListener('message',event=>{
 const frame=document.querySelector('iframe.ko-player');
 if(!frame||event.source!==frame.contentWindow||event.origin!==location.origin||event.data?.type!=='ko-player-height')return;
 const height=Number(event.data.height);
 if(Number.isFinite(height)&&height>0&&height<10000)frame.style.height=height+'px';
});
