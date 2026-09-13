(function(){
  'use strict';

  var localeText={
    ko:{summary:'Languages',label:'언어와 나라 선택'},
    en:{summary:'Languages',label:'Choose language and country'},
    ja:{summary:'言語',label:'言語と国を選ぶ'},
    fr:{summary:'Langues',label:'Choisir la langue et le pays'},
    de:{summary:'Sprachen',label:'Sprache und Land auswählen'},
    it:{summary:'Lingue',label:'Scegli lingua e paese'},
    es:{summary:'Idiomas',label:'Elegir idioma y país'}
  };

  var sites=[
    {key:'ko',href:'/ko/',name:'한국어',nameLang:'ko',place:'Korea'},
    {key:'US',href:'/en/?country=US',name:'United States',nameLang:'en',place:'English'},
    {key:'GB',href:'/en/?country=GB',name:'England',nameLang:'en',place:'English'},
    {key:'CA',href:'/en/?country=CA',name:'Canada',nameLang:'en',place:'English'},
    {key:'AU',href:'/en/?country=AU',name:'Australia',nameLang:'en',place:'English'},
    {key:'ja',href:'/ja/',name:'日本語',nameLang:'ja',place:'Japan'},
    {key:'fr',href:'/fr/',name:'Français',nameLang:'fr',place:'France'},
    {key:'de',href:'/de/',name:'Deutsch',nameLang:'de',place:'Germany'},
    {key:'it',href:'/it/',name:'Italiano',nameLang:'it',place:'Italy'},
    {key:'es',href:'/es/',name:'Español',nameLang:'es',place:'Spain'}
  ];

  function edition(){
    var path=(location.pathname||'/').split('/').filter(Boolean)[0];
    if(localeText[path])return path;
    var lang=(document.documentElement.lang||'').toLowerCase().split('-')[0];
    return localeText[lang]?lang:'ko';
  }

  function currentKey(lang){
    if(lang!=='en')return lang;
    var country=(new URLSearchParams(location.search)).get('country');
    country=(country||'US').toUpperCase();
    return /^(US|GB|CA|AU)$/.test(country)?country:'US';
  }

  function isLanguageLink(link){
    if(link.closest('.country-dropdown'))return false;
    var label=(link.textContent||'').replace(/\s+/g,' ').trim().replace(/\s*↗$/,'');
    if(!/^(Korean|한국어|English|日本語|Français|Deutsch|Italiano|Español)$/.test(label))return false;
    var href=link.getAttribute('href')||'';
    return /^(?:https?:\/\/googoodan\.com)?\/(?:ko|en|ja|fr|de|it|es)\/?(?:[?#].*)?$/.test(href)||href==='/';
  }

  function separatorOnly(node){
    return node.nodeType===3&&/^[\s·|/]*$/.test(node.nodeValue||'');
  }

  function tidySeparators(parent){
    if(!parent)return;
    Array.prototype.slice.call(parent.childNodes).forEach(function(node){
      if(!separatorOnly(node))return;
      var prev=node.previousSibling;
      var next=node.nextSibling;
      while(prev&&separatorOnly(prev))prev=prev.previousSibling;
      while(next&&separatorOnly(next))next=next.nextSibling;
      if(!prev||!next)node.remove();
    });
  }

  function makeMenu(lang){
    var copy=localeText[lang]||localeText.en;
    var active=currentKey(lang);
    var details=document.createElement('details');
    details.className='country-dropdown country-menu-injected';
    var summary=document.createElement('summary');
    summary.append(document.createTextNode(copy.summary+' '));
    var arrow=document.createElement('span');
    arrow.setAttribute('aria-hidden','true');
    arrow.textContent='▾';
    summary.appendChild(arrow);
    details.appendChild(summary);

    var nav=document.createElement('nav');
    nav.className='country-sites';
    nav.setAttribute('aria-label',copy.label);
    var inner=document.createElement('div');
    inner.className='country-sites-inner';
    var heading=document.createElement('strong');
    heading.lang=lang==='ko'?'ko':'en';
    heading.textContent=copy.summary;
    var hint=document.createElement('small');
    hint.textContent=lang==='ko'?'나라별 사이트':'Choose a site';
    heading.appendChild(hint);
    inner.appendChild(heading);
    var links=document.createElement('div');
    links.className='country-sites-links';
    sites.forEach(function(site){
      var link=document.createElement('a');
      link.href=site.href;
      if(site.key===active)link.setAttribute('aria-current','page');
      var name=document.createElement('b');
      name.lang=site.nameLang;
      name.textContent=site.name;
      var place=document.createElement('small');
      place.lang='en';
      place.textContent=site.place;
      link.append(name,place);
      links.appendChild(link);
    });
    inner.appendChild(links);
    nav.appendChild(inner);
    details.appendChild(nav);
    return details;
  }

  function init(){
    var header=document.querySelector('body > header')||document.querySelector('header');
    if(!header)return;
    var existing=header.querySelector('.country-dropdown');
    if(existing){
      header.classList.add('country-menu-ready');
      return;
    }

    var oldLinks=Array.prototype.filter.call(header.querySelectorAll('a'),isLanguageLink);
    var menu=makeMenu(edition());
    var touched=[];
    menu.classList.add('country-menu-floating');
    header.appendChild(menu);
    oldLinks.forEach(function(link){
      if(link.parentNode){touched.push(link.parentNode);link.remove();}
    });
    touched.forEach(tidySeparators);
    header.classList.add('country-menu-ready','country-menu-injected-header');

    document.addEventListener('click',function(event){
      if(menu.open&&!menu.contains(event.target))menu.open=false;
    });
    menu.addEventListener('keydown',function(event){
      if(event.key==='Escape'&&menu.open){
        menu.open=false;
        menu.querySelector('summary').focus();
      }
    });
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
