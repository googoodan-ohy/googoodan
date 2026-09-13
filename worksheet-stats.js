(()=>{if(window.GDWorksheetStats)return;window.GDWorksheetStats=true;const en=!document.documentElement.lang.startsWith('ko');
addEventListener('DOMContentLoaded',async()=>{
 let counter=document.querySelector('.visit-counter');
 if(!counter){const aside=document.querySelector('.layout>aside');if(aside){counter=document.createElement('div');counter.className='visit-counter';aside.prepend(counter);}}
 const item=document.createElement('span');item.id='worksheet-load-count';
 item.title=(en?"Today’s worksheet page loads across all visitors, based on Korea Standard Time. Includes reloads; excludes the operator. This is not an ad impression count.":"한국 시간 기준 오늘 전체 방문자의 문제지 페이지 로딩 합계입니다. 새로고침 포함, 운영자 제외. 실제 광고 노출 수는 아닙니다.");
 item.style.cssText='display:block;flex-basis:100%;font-size:11px;padding-top:5px;white-space:normal';
 item.append((en?"Today’s total worksheet loads ":"오늘 전체 유형 로딩 "));const number=document.createElement('b');number.textContent=(en?"Loading…":"집계 중");item.append(number);
 if(counter){counter.append(item);counter.style.flexWrap='wrap';}
 if(!['googoodan.com','www.googoodan.com'].includes(location.hostname)||navigator.webdriver){number.textContent=(en?"Test excluded":"테스트 제외");return;}
 let excluded=false;try{excluded=localStorage.getItem('gd_operator_excluded')==='1';}catch{}
 const endpoint='https://googoodan-community.googoodan-community.workers.dev';
 const edition=location.pathname.split('/')[1];const payload={id:crypto.randomUUID(),site:["ko","en","ja","fr","de","es","it"].includes(edition)?edition:'ko'};
 try{
  const response=await fetch(endpoint+(excluded?'/stats/today':'/stats/load'),excluded?{}:{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),keepalive:true});
  if(!response.ok)throw Error('HTTP '+response.status);const data=await response.json();
  number.textContent=data.total.toLocaleString(en?'en-US':'ko-KR')+(en?" loads":"회");
 }catch(e){number.textContent=(en?"Count unavailable":"집계 확인 필요");console.warn((en?"Worksheet load count failed":"유형 로딩 집계 실패"),e.message);}
});
})();
