/* 로컬 갤러리용 전체 학생용 문제지: 도구 버튼과 정답지만 숨긴다. */
(() => {
 if(new URLSearchParams(location.search).get('preview')!=='1')return;
 const style=document.createElement('style');style.textContent='html,body{overflow:hidden!important;background:white!important}.toolbar{display:none!important}.sheet-page{margin:0!important;box-shadow:none!important}';document.head.append(style);
 function ready(){document.body.className='view-problem';const page=document.querySelector('.problem-page');if(!page)return;parent.postMessage({kind:'gd-preview-size',type:new URLSearchParams(location.search).get('type'),height:page.getBoundingClientRect().height},'*')}
 window.addEventListener('load',()=>{ready();document.fonts.ready.then(ready)});
})();
