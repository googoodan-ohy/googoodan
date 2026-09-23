(()=>{const header=document.querySelector('.site-header');if(!header)return;const mobile=matchMedia('(max-width:760px)');const foldBrowse=()=>{if(mobile.matches){const browse=document.querySelector('.browse');if(browse)browse.open=false;}};foldBrowse();if(mobile.addEventListener)mobile.addEventListener('change',foldBrowse);else mobile.addListener(foldBrowse);const update=()=>document.documentElement.style.setProperty('--site-header-offset',Math.ceil(header.getBoundingClientRect().height+16)+'px');update();if('ResizeObserver' in window)new ResizeObserver(update).observe(header);else window.addEventListener('resize',update);})();

// Local preview links carry the UI revision across page navigation.
if(['127.0.0.1','localhost'].includes(location.hostname)){
 document.querySelectorAll('a[href]').forEach(a=>{const u=new URL(a.href,location.href);if(u.origin===location.origin&&/^\/(ko|en)\//.test(u.pathname)&&!a.getAttribute('href').startsWith('#')&&(u.pathname.endsWith('.html')||u.pathname.endsWith('/'))){u.searchParams.set('view','scroll-frame-3');a.href=u.href;}});
}

// First-party, daily aggregate usage metrics.
{const metricsScript=document.createElement("script");metricsScript.src="/assets/site-metrics.js";metricsScript.defer=true;document.head.append(metricsScript);}

{const script=document.createElement("script");script.src="/assets/pdf-controls.js?v=1";document.head.append(script);}
