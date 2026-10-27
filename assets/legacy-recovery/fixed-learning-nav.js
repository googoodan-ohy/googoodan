(()=>{
  'use strict';
  const langs={
    ja:{label:'学習メニュー',items:[['/ja/training/','計算トレーニング'],['/ja/drills.html','単元別計算'],['/ja/units.html','単元別問題'],['/ja/kuku/','九九']],times:/\/(?:kuku(?:-\d+)?|times-tables|tables|tabelline|einmaleins)(?:\/|\.html|$)/},
    fr:{label:'Menus d’apprentissage',items:[['/fr/training/','Entraînement au calcul'],['/fr/drills.html','Calcul par chapitre'],['/fr/units.html','Exercices par chapitre'],['/fr/tables-de-multiplication/','Tables de multiplication']],times:/\/tables-de-multiplication(?:\/|$)/},
    es:{label:'Menús de aprendizaje',items:[['/es/training/','Entrenamiento de cálculo'],['/es/drills.html','Cálculo por temas'],['/es/units.html','Actividades por temas'],['/es/tablas-de-multiplicar/','Tablas de multiplicar']],times:/\/tablas-de-multiplicar(?:\/|$)/},
    it:{label:'Menu di apprendimento',items:[['/it/training/','Allenamento al calcolo'],['/it/drills.html','Calcolo per argomento'],['/it/units.html','Attività per argomento'],['/it/tabelline/','Tabelline']],times:/\/tabelline(?:\/|$)/},
    de:{label:'Lernmenü',items:[['/de/training/','Rechentraining'],['/de/drills.html','Rechnen nach Themen'],['/de/units.html','Aufgabentypen nach Themen'],['/de/einmaleins/','Einmaleins']],times:/\/einmaleins(?:\/|$)/}
  };
  const lang=(document.documentElement.lang||location.pathname.split('/')[1]||'').slice(0,2).toLowerCase();
  const cfg=langs[lang]; if(!cfg)return;
  const path=location.pathname;
  function selectedIndex(nav){
    if(/^\/ja\/(?:print-list|geometry-worksheets|measurement-worksheets|story-problem-worksheets)\.html$/.test(path))return 2;
    if(cfg.times.test(path))return 3;
    if(path.startsWith('/'+lang+'/training/'))return 0;
    if(path==='/'+lang+'/drills.html'||path.startsWith('/'+lang+'/print/drill-'))return 1;
    if(path==='/'+lang+'/units.html'||path.startsWith('/'+lang+'/print/unit-')||/^\/(ja)\/grade-[1-6]\.html$/.test(path))return 2;
    if(document.querySelector('.popular-nav'))return 2;
    const current=[...nav.querySelectorAll(':scope > a[data-gd-menu-index]')].find(a=>a.getAttribute('aria-current')==='page');
    return current?Number(current.dataset.gdMenuIndex):2;
  }
  function ready(){
    // An early run (before <main> is parsed) may have left an empty shell;
    // drop it so it cannot take space from the real layout.
    document.querySelectorAll('body > .gd-fixed-shell').forEach(s=>{
      if(!s.querySelector('main, section, article, .preview, .content'))s.remove();
    });
    const candidates=[...document.querySelectorAll('.sidebar-mode-tabs,.edition-tabs,.unit-edition-tabs,.primary-nav,.gd-global-learning-nav')];
    const existing=candidates.find(n=>n.classList.contains('sidebar-mode-tabs'))||candidates.find(n=>n.querySelector('a[href="/'+lang+'/training/"]'));
    candidates.filter(n=>n!==existing).forEach(n=>n.remove());
    let nav=existing;
    let layout=document.querySelector('body > .layout, body > .page-layout, body > main.layout, body > main.page-layout, body > .gd-fixed-shell, .layout, .page-layout');
    let aside=layout?.querySelector(':scope > aside, :scope > .sidebar');
    const wrapContent=content=>{
      const originalAside=content.querySelector(':scope > aside');
      if(originalAside){
        layout=content;
        aside=originalAside;
        layout.classList.add('gd-fixed-shell');
        return;
      }
      layout=document.createElement('div');
      layout.className='gd-fixed-shell';
      aside=document.createElement('aside');
      aside.className='gd-global-learning-sidebar';
      const parent=content.parentNode;
      parent.insertBefore(layout,content);
      layout.append(aside,content);
    };
    if(!nav){
      nav=document.createElement('nav');
      nav.className=lang==='ja'?'edition-tabs':'gd-global-learning-nav primary-nav';
      nav.setAttribute('aria-label',cfg.label);
      if(aside)aside.insertBefore(nav,aside.firstChild);
      else if(layout){
        aside=document.createElement('aside');
        aside.className='gd-global-learning-sidebar';
        layout.insertBefore(aside,layout.firstChild);
        aside.append(nav);
        layout.classList.add('gd-fixed-shell');
      } else {
        const content=document.querySelector('body > main, body > article, body > .page-content');
        if(content){wrapContent(content);aside.append(nav)} else {
          const header=document.querySelector('body > header');
          if(header)header.after(nav);else document.body.insertBefore(nav,document.body.firstChild);
          nav.classList.add('gd-global-learning-nav-inline');
        }
      }
    }
    if(!layout){
      const content=document.querySelector('body > main, body > article, body > .page-content');
      if(content)wrapContent(content);
    }
    if(!layout)nav.classList.add('gd-global-learning-nav-inline');
    // These units pages have auxiliary content outside the preview column.
    // Keep it inside the scrollable column so it cannot collapse the shell or
    // become unreachable beyond the shell's clipped edge.
    if(['fr','es','it','de'].includes(lang)){
      const preview=layout?.querySelector(':scope > .preview, :scope > main, :scope > article, :scope > section');
      if(preview){
        [...layout.children].filter(child=>child!==aside&&child!==preview).forEach(child=>preview.append(child));
        document.querySelectorAll('body > .fr-static').forEach(directory=>preview.append(directory));
        document.querySelectorAll('body > .fr-resources').forEach(resources=>preview.append(resources));
      }
    }
    // Training detail pages render their long country guide as a body-level
    // sibling of the fixed shell. Move it into the worksheet's scroll area.
    const detailMain=document.querySelector('body > .gd-fixed-shell > main#sheet-root');
    if(detailMain)document.querySelectorAll('body > .country-guide').forEach(guide=>detailMain.append(guide));
    if(layout&&!aside){
      aside=document.createElement('aside');
      aside.className='gd-global-learning-sidebar';
      layout.insertBefore(aside,layout.firstChild);
      layout.classList.add('gd-fixed-shell');
    }
    if(lang!=='ja')nav.classList.add('gd-global-learning-nav');
    if(aside&&!aside.contains(nav))aside.insertBefore(nav,aside.firstChild);
    // Keep the four European primary destinations together at the start of the mobile sidebar.
    if(aside&&lang!=='ja'&&nav.dataset.gdPrimaryNavPlaced!=='1'){if(nav.parentNode!==aside||nav!==aside.firstElementChild)aside.insertBefore(nav,aside.firstChild);nav.dataset.gdPrimaryNavPlaced='1';}
    cfg.items.forEach(([href,label],i)=>{
      let a=[...nav.querySelectorAll(':scope > a')].find(x=>x.getAttribute('href')===href);
      if(!a){
        a=document.createElement('a');a.href=href;a.textContent=label;
        // Keep the four menu buttons together, ahead of any submenu the nav holds.
        const prev=[...nav.querySelectorAll(':scope > a[data-gd-menu-index]')].pop()||[...nav.querySelectorAll(':scope > a')].pop();
        if(prev)prev.after(a);else nav.prepend(a);
      }
      if(a.textContent.trim()!==label)a.textContent=label;
      a.dataset.gdMenuIndex=String(i);
    });
    // training-menu.js puts its submenu box right after the first button;
    // move such boxes below the fourth button so the four stay together.
    const lastMenu=[...nav.querySelectorAll(':scope > a[data-gd-menu-index]')].pop();
    if(lastMenu)[...nav.children].filter(el=>el.tagName!=='A'&&(el.compareDocumentPosition(lastMenu)&Node.DOCUMENT_POSITION_FOLLOWING)).reverse().forEach(el=>{if(lastMenu.nextElementSibling!==el)lastMenu.after(el)});
    const allowed=new Set(cfg.items.map(([href])=>new URL(href,location.origin).pathname));
    [...nav.children].filter(el=>el.tagName==='A'&&!allowed.has(new URL(el.getAttribute('href'),location.href).pathname)).forEach(el=>el.remove());
    const active=selectedIndex(nav);
    nav.querySelectorAll(':scope > a[data-gd-menu-index]').forEach(a=>{
      const on=Number(a.dataset.gdMenuIndex)===active;
      if(on)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');
    });
  }
  const start=()=>{
    ready();
    new MutationObserver(ready).observe(document.documentElement,{childList:true,subtree:true});
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
