(function(){
const key='gd-worksheet-navigation';window.WorksheetNavigation={go(href){const target=new URL(href,location.href);try{sessionStorage.setItem(key,JSON.stringify({path:target.pathname,at:Date.now(),y:scrollY,x:scrollX,menu:document.querySelector('.groups')?.scrollTop||0}));}catch{}location.assign(target.href);}};
document.addEventListener('click',e=>{
 const link=e.target.closest?.('.edition-tabs a,.unit-edition-tabs a');
 if(!link||e.button!==0||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;
 const target=new URL(link.href,location.href);if(target.origin!==location.origin)return;
 const unit=document.querySelector('#drill-unit,#unit')?.value;
 if(unit&&/\/(drills|units)\.html$/.test(target.pathname)){target.searchParams.set('unit',unit);const [grade,semester]=unit.split('-');target.searchParams.set('grade',grade);target.searchParams.set('semester',semester);}
 e.preventDefault();window.WorksheetNavigation.go(target.href);
});
addEventListener('DOMContentLoaded',()=>{
 const print=document.querySelector('#print');if(!print||document.querySelector('#save-pdf'))return;
 const pdf=document.createElement('button');pdf.type='button';pdf.id='save-pdf';pdf.textContent='PDF 저장';pdf.title='PDF 파일을 만들어 저장합니다';
 pdf.style.cssText='border:1px solid #176e5c;background:white;color:#176e5c;border-radius:7px;padding:10px 13px;font:inherit;font-weight:700;white-space:nowrap';
 print.after(pdf);
 const quantity=document.createElement('label');quantity.style.cssText='display:inline-flex;align-items:center;gap:6px;font-size:12px;white-space:nowrap';quantity.append('매수');
 const count=document.createElement('input');count.id='worksheet-copies';count.type='number';count.min='1';count.max='20';count.step='1';count.value='1';count.setAttribute('aria-label','서로 다른 문제지 매수');count.title='1~20매. 정답지 선택 시 같은 수의 정답지가 추가됩니다.';count.style.cssText='width:50px;padding:8px 4px;border:1px solid #bfd8d7;border-radius:5px;font:inherit';
 const arrows=document.createElement('span');arrows.style.cssText='display:flex;flex-direction:column';for(const [label,delta]of [['▲',1],['▼',-1]]){const b=document.createElement('button');b.type='button';b.textContent=label;b.setAttribute('aria-label',delta>0?'매수 늘리기':'매수 줄이기');b.style.cssText='padding:0 6px;font-size:10px;line-height:16px;border:1px solid #bfd8d7;background:white;color:#176e5c';b.onclick=()=>{count.value=String(Math.min(20,Math.max(1,(Number(count.value)||1)+delta)));};arrows.append(b);}
 count.onchange=()=>{count.value=String(Math.min(20,Math.max(1,Math.floor(Number(count.value)||1))));};quantity.append(count,arrows);pdf.after(quantity);
 const hint=document.createElement('p');hint.hidden=true;hint.setAttribute('role','status');hint.style.cssText='font-size:12px;color:#42665d;margin:8px 0';hint.textContent='인쇄창의 대상(프린터)에서 “PDF로 저장”을 선택하세요. 선택한 문제지·정답지가 파일로 저장됩니다.';
 (print.closest('.toolbar')||print.parentElement).after(hint);
 const description=document.createElement('p');description.className='pdf-save-note';description.style.cssText='font-size:12px;line-height:1.7;color:#42665d;margin:8px 0';description.textContent='선택한 매수만큼 숫자가 서로 다른 문제지를 만들어 하나의 PDF 파일로 저장합니다. 예: 3매 선택 → 다른 문제지 3장. 정답지 선택 시 정답 3장이 추가됩니다.';hint.after(description);
 const printStyle=document.createElement('style');printStyle.textContent='@media print{.pdf-save-note{display:none!important}body.printing-bundle>:not(#print-bundle){display:none!important}body.printing-bundle>#print-bundle{display:block!important}}';document.head.append(printStyle);
 pdf.onclick=()=>{if(print.disabled)return;window.saveWorksheetPDF(pdf);};
 const sync=()=>{pdf.disabled=print.disabled||!!window.GDPDFBusy;};sync();new MutationObserver(sync).observe(print,{attributes:true,attributeFilter:['disabled']});
 window.addEventListener('beforeprint',()=>{hint.hidden=true;});
});
addEventListener('DOMContentLoaded',async()=>{
 let counter=document.querySelector('.visit-counter');
 if(!counter){const aside=document.querySelector('.layout>aside');if(aside){counter=document.createElement('div');counter.className='visit-counter';aside.prepend(counter);}}
 const item=document.createElement('span');item.id='worksheet-load-count';
 item.title='한국 시간 기준 오늘 전체 방문자의 문제지 페이지 로딩 합계입니다. 새로고침 포함, 운영자 제외. 실제 광고 노출 수는 아닙니다.';
 item.style.cssText='display:block;flex-basis:100%;font-size:11px;padding-top:5px;white-space:normal';
 item.append('오늘 전체 유형 로딩 ');const number=document.createElement('b');number.textContent='집계 중';item.append(number);
 if(counter){counter.append(item);counter.style.flexWrap='wrap';}
 if(!['googoodan.com','www.googoodan.com'].includes(location.hostname)||navigator.webdriver){number.textContent='테스트 제외';return;}
 let excluded=false;try{excluded=localStorage.getItem('gd_operator_excluded')==='1';}catch{}
 const endpoint='https://googoodan-community.googoodan-community.workers.dev';
 const payload={id:crypto.randomUUID(),site:location.pathname.startsWith('/en/')?'en':'ko'};
 try{
  const response=await fetch(endpoint+(excluded?'/stats/today':'/stats/load'),excluded?{}:{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),keepalive:true});
  if(!response.ok)throw Error('HTTP '+response.status);const data=await response.json();
  number.textContent=data.total.toLocaleString('ko-KR')+'회';
 }catch(e){number.textContent='집계 확인 필요';console.warn('유형 로딩 집계 실패',e.message);}
});
addEventListener('load',()=>{let saved;try{saved=JSON.parse(sessionStorage.getItem(key));sessionStorage.removeItem(key);}catch{}if(!saved||saved.path!==location.pathname||Date.now()-saved.at>30000)return;requestAnimationFrame(()=>requestAnimationFrame(()=>{window.scrollTo({left:saved.x,top:saved.y,behavior:'instant'});const g=document.querySelector('.groups');if(g)g.scrollTop=saved.menu;}));});
})();