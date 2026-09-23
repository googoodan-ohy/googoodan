(()=>{'use strict';if(window.top!==window||window.__gdMetrics||!['googoodan.com','www.googoodan.com'].includes(location.hostname)||!/^\/(ko|en)\//.test(location.pathname)||navigator.webdriver)return;window.__gdMetrics=true;
const API='https://googoodan-community.googoodan-community.workers.dev',site=location.pathname.startsWith('/ko/')?'ko':'us',key='gd_daily_visitor_v1';let memory=null,sentDay='';
const day=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
function excluded(){try{return localStorage.getItem('gd_analytics_optout')==='1'||localStorage.getItem('gd_operator_excluded')==='1'}catch{return false}}
function visitor(){const date=day();try{const stored=JSON.parse(localStorage.getItem(key)||'null');if(stored&&stored.day===date&&stored.id)return stored}catch{}if(!memory||memory.day!==date)memory={day:date,id:crypto.randomUUID()};try{localStorage.setItem(key,JSON.stringify(memory))}catch{}return memory}
function send(kind,id){if(excluded())return;fetch(API+'/metrics/event',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({site,kind,id}),keepalive:true,credentials:'omit',referrerPolicy:'no-referrer'}).catch(()=>{})}
function visit(){if(excluded())return;const v=visitor();if(sentDay!==v.day){sentDay=v.day;send('visit',v.id)}}
const docs=new WeakSet,frames=new WeakSet;
function attach(doc){if(!doc||docs.has(doc))return;docs.add(doc);doc.addEventListener('click',e=>{const b=e.target.closest?.('button,a,input[type="button"],input[type="submit"]');if(!b||b.disabled||b.getAttribute('aria-disabled')==='true')return;const id=(b.id||'').toLowerCase(),text=b.textContent||b.value||'';let kind=b.dataset.metric;if(!['print','pdf','print_pdf'].includes(kind)){if(id==='print')kind=/pdf/i.test(text)?'print_pdf':'print';else if(['pdf','save-pdf','download-pdf','export-pdf'].includes(id))kind='pdf';else return}visit();send(kind,crypto.randomUUID())},true);
const scan=()=>doc.querySelectorAll('iframe').forEach(f=>{if(frames.has(f))return;frames.add(f);const init=()=>{try{attach(f.contentDocument)}catch{}};f.addEventListener('load',init);init()});scan();new MutationObserver(scan).observe(doc.documentElement,{childList:true,subtree:true})}
visit();attach(document);document.addEventListener('visibilitychange',()=>{if(!document.hidden)visit()});
})();
