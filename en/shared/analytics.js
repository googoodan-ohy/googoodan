/* Shared analytics. No Google requests until configured, on production,
   and visitor consent is granted. Local testing uses an in-memory log only. */
(function(){
 'use strict';
 if(window.GDAnalytics)return;
 const cfg=window.GD_ANALYTICS_CONFIG||{},id=cfg.measurementId||'';
 let operatorExcluded=false;try{operatorExcluded=localStorage.getItem('gd_operator_excluded')==='1';}catch{}
 const enabled=!operatorExcluded&&!navigator.webdriver&&/^G-[A-Z0-9]+$/.test(id)&&(cfg.allowedHosts||[]).includes(location.hostname);
 const key='gd_analytics_consent';let consent='unknown',started=false,lastView=null;
 try{consent=localStorage.getItem(key)||'unknown';}catch{}
 const events=[];
 const cleanURL=()=>location.origin+location.pathname;
 function record(name,params={}){
  if(!['page_view','worksheet_view','worksheet_print_click','worksheet_regenerate','worksheet_answer_view','worksheet_pdf_click','worksheet_pdf_ready','worksheet_pdf_error','worksheet_pdf_cancel'].includes(name))return;
  const safe={};for(const k of ['worksheet_id','worksheet_name','edition','number_family','operation','sheet_mode'])if(params[k]!==undefined)safe[k]=String(params[k]).slice(0,100);
  safe.page_location=cleanURL();
  events.push({name,...safe,status:started&&consent==='granted'?'queued':'not_sent'});if(events.length>100)events.shift();
  if(name==='worksheet_view')lastView=safe;
  if(started&&consent==='granted')window.gtag('event',name,safe);
 }
 function start(){
  if(!enabled||consent!=='granted'||started)return;
  started=true;window.dataLayer=window.dataLayer||[];window.gtag=window.gtag||function(){window.dataLayer.push(arguments);};
  window.gtag('consent','default',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
  window.gtag('js',new Date());
  window.gtag('config',id,{send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false,debug_mode:!!cfg.debug});
  const script=document.createElement('script');script.async=true;script.src='https://www.googletagmanager.com/gtag/js?id='+id;document.head.append(script);
  record('page_view',{edition:location.pathname.startsWith('/en/')?'en':'ko'});
  if(lastView)record('worksheet_view',lastView);
 }
 function setConsent(value){
  consent=value;try{localStorage.setItem(key,value);}catch{}
  if(value==='granted')start();
  else if(started){window['ga-disable-'+id]=true;window.gtag('consent','update',{analytics_storage:'denied'});}
  document.getElementById('gd-consent')?.remove();
  if(value==='granted'&&started){window['ga-disable-'+id]=false;window.gtag('consent','update',{analytics_storage:'granted'});}
 }
 function preferences(){
  if(!enabled||document.getElementById('gd-consent'))return;
  const en=location.pathname.startsWith('/en/'),box=document.createElement('section');box.id='gd-consent';box.setAttribute('aria-label',en?'Analytics preferences':'통계 수집 설정');
  box.style.cssText='position:fixed;bottom:18px;left:18px;right:18px;max-width:600px;background:white;border:1px solid #bbb;box-shadow:0 3px 20px #0002;padding:18px;z-index:99999;font:14px/1.6 Arial,sans-serif;color:#222';
  const p=document.createElement('p');p.textContent=en?'Allow Google Analytics to measure visits and worksheet use? Optional. Printing works either way.':'방문과 문제지 이용을 Google Analytics로 집계하도록 허용할까요? 선택 사항이며, 거절해도 인쇄할 수 있습니다.';box.append(p);
  for(const [value,label] of [['granted',en?'Allow':'허용'],['denied',en?'Decline':'거절']]){const b=document.createElement('button');b.textContent=label;b.style.cssText='padding:8px 20px;margin-right:10px;cursor:pointer';b.onclick=()=>setConsent(value);box.append(b);}
  const a=document.createElement('a');a.href='/analytics-privacy.html';a.textContent=en?'Privacy':'개인정보 안내';box.append(a);document.body.append(box);
 }
 window.GDAnalytics={track:record,events,preferences,status:()=>({configured:/^G-[A-Z0-9]+$/.test(id),enabled,consent,started})};
 // Embedded Korean worksheets reuse the top page tracker, avoiding extra page views.
 let tracker=window.GDAnalytics;
 try{if(window.parent!==window&&window.parent.GDAnalytics)tracker=window.parent.GDAnalytics;}catch{}
 if(tracker===window.GDAnalytics){start();if(enabled){
  const style=document.createElement('style');style.textContent='@media print{#gd-consent,#gd-privacy-settings{display:none!important}}';document.head.append(style);
  const b=document.createElement('button');b.id='gd-privacy-settings';b.textContent=location.pathname.startsWith('/en/')?'Analytics preferences':'통계 수집 설정';b.onclick=preferences;b.style.cssText='display:block;margin:16px auto;padding:7px 12px;font-size:12px';document.body.append(b);
  if(consent==='unknown')preferences();
 }}
 const path=decodeURIComponent(location.pathname),isKoreanSheet=/\/(work|problem)\//.test(path)&&!path.endsWith('/index.html');
 if(isKoreanSheet){
  // The full curriculum path avoids collisions between repeated type names.
  const canonical=document.querySelector('link[rel="canonical"]')?.href;
  const source=canonical?decodeURIComponent(new URL(canonical).pathname):path;
  const params={worksheet_id:source.replace(/^\/(work|problem)\//,'').replace(/\.html$/,''),worksheet_name:document.title,edition:'ko'};
  tracker.track('worksheet_view',params);
  document.addEventListener('click',event=>{
   const b=event.target.closest('button');if(!b)return;
   const action=b.getAttribute('onclick')||'';
   const mode=document.querySelector('#btnAnswer.active')?'answer':'worksheet';
   if(/\bprint\s*\(/.test(action))tracker.track('worksheet_print_click',{...params,sheet_mode:mode});
   else if(/\bregenerate\s*\(/.test(action))tracker.track('worksheet_regenerate',params);
   else if(/setMode\(['"]answer/.test(action))tracker.track('worksheet_answer_view',params);
  },true);
 }
})();
