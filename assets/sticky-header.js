(()=>{const header=document.querySelector('.site-header');if(!header)return;if(matchMedia('(max-width:760px)').matches){const browse=document.querySelector('.browse');if(browse)browse.open=false;}const update=()=>document.documentElement.style.setProperty('--site-header-offset',Math.ceil(header.getBoundingClientRect().height+16)+'px');update();if('ResizeObserver' in window)new ResizeObserver(update).observe(header);else window.addEventListener('resize',update);})();

// Local preview links carry the UI revision across page navigation.
if(['127.0.0.1','localhost'].includes(location.hostname)){
 document.querySelectorAll('a[href]').forEach(a=>{const u=new URL(a.href,location.href);if(u.origin===location.origin&&/^\/(ko|en)\//.test(u.pathname)&&!a.getAttribute('href').startsWith('#')&&(u.pathname.endsWith('.html')||u.pathname.endsWith('/'))){u.searchParams.set('view','scroll-frame-3');a.href=u.href;}});
}

// Keep local country switching on the current US redesign; production is unchanged.
if(['127.0.0.1','localhost'].includes(location.hostname)&&location.pathname.startsWith('/ko/')){
 document.querySelectorAll('a.locale-switch').forEach(a=>{
  const target=new URL(a.href,location.href);
  if(target.origin===location.origin&&target.pathname.startsWith('/en/')){
   const saved=sessionStorage.getItem('us-concept-preview-route')||'#grades/1';
   a.href='/lab/concept-layout/'+(/^#(?:grades|topics|training|concept|search)(?:\/|$)/.test(saved)?saved:'#grades/1');
  }
 });
}

{const s=document.createElement("script");s.src="/assets/pdf-controls.js?v=2";document.head.append(s);}
