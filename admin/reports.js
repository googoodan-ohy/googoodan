/* Error report counts: red badges for responses that arrived since the admin last opened each country's form. */
(()=>{'use strict';
const API=new URLSearchParams(location.search).get('reports')||'https://script.google.com/macros/s/AKfycbxpjhOyVMBUjavWc2wXe_g3xQXxrGHnX_OVge1MmAzL3jguEd3s1TR94byb2ER6ziKc/exec';
const SEEN_KEY='gd-report-seen-v1';
const COUNTRIES=[
  ['ko','한국','1eyom5EklnE0cYqgRxgJ1O1KtsS1r5jy3G0CTTvWe0VE'],
  ['us','미국','1Dul1Y2_gD_JXmJLUisduTXpYAPKDKGlH27ZF_K4WNlg'],
  ['ja','일본','1y74k5byBTesVI_AJW8RIJxEUPFsDN8PrF0luINK6xqQ'],
  ['fr','프랑스','1XMmIlBSPEa6iSsNsxgjBnQ6GLcFmzz_DAhtt7ga_tq0'],
  ['es','스페인','14EE9TYuWH48HCTbNNkOQccJNRZnOrj4sY7yjLtUL-i0'],
  ['it','이탈리아','1SuWWoYJW4y9lNjlh3HS43Xg79mQb489EU3yWsfEM3xI'],
  ['de','독일','1Xyt1cMACtuixHU240DNCaeDFGLy6lNNCJnX-XHbsyv0'],
  ['uk','영국','1fTHLFUz_RhsLmrveRi3HsEKEVuaiDgrFkGuF1ZkU-_I'],
  ['ca','캐나다','1YADXS4K4jZ2LR1xSYnbheUICXPR9lgwAQhv2OLDPspU'],
  ['au','호주','1aB3CL2zgMrFug2y4tL7j9tTmn1eilm_5xC617aZsK94']
];
const $=id=>document.getElementById(id);
const baseTitle=document.title;
let counts={};
function readSeen(){try{return JSON.parse(localStorage.getItem(SEEN_KEY)||'{}')}catch{return {}}}
function writeSeen(seen){try{localStorage.setItem(SEEN_KEY,JSON.stringify(seen))}catch{}}
function render(){
  const seen=readSeen(),grid=$('report-grid');let total=0;
  grid.replaceChildren();
  for(const [code,name,id] of COUNTRIES){
    const all=counts[code],fresh=typeof all==='number'?Math.max(0,all-(seen[code]||0)):0;total+=fresh;
    const a=document.createElement('a');a.className='report-btn'+(fresh?' has-new':'');a.href='https://docs.google.com/forms/d/'+id+'/edit#responses';a.target='_blank';a.rel='noopener';
    const strong=document.createElement('strong');strong.textContent=name;
    const sub=document.createElement('span');sub.textContent=typeof all==='number'?'전체 '+all.toLocaleString('ko-KR')+'건':'개수 확인 전';
    a.append(strong,sub);
    if(fresh){const b=document.createElement('b');b.className='badge';b.textContent=fresh>99?'99+':String(fresh);b.setAttribute('aria-label','새 신고 '+fresh+'건');a.append(b)}
    a.addEventListener('click',()=>{if(typeof counts[code]==='number'){const s=readSeen();s[code]=counts[code];writeSeen(s);setTimeout(render,0)}});
    grid.append(a);
  }
  const pill=$('report-pill');pill.hidden=!total;$('report-pill-text').textContent='새 오류 신고 '+total+'건';
  document.title=(total?'('+total+') ':'')+baseTitle;
}
async function refresh(){
  if(API.startsWith('__')){$('report-status').textContent='신고 개수 서버가 아직 연결되지 않았습니다.';render();return}
  try{
    const r=await fetch(API,{credentials:'omit',cache:'no-store'});if(!r.ok)throw Error(r.status);
    const d=await r.json();counts=d.counts||{};
    const at=d.at?new Date(d.at):new Date();
    $('report-status').textContent='확인 시각 '+at.toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'})+' · 5분마다 다시 확인';
  }catch{$('report-status').textContent='신고 개수를 불러오지 못했습니다. 잠시 뒤 다시 확인합니다.'}
  render();
}
refresh();setInterval(refresh,5*60*1000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});
})();
