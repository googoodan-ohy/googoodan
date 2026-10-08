/* Local English guides. Uses the existing eight-section teaching-guide format. */
(() => {
  'use strict';
  const base = new URL('.', document.currentScript.src);
  const load = () => fetch(new URL('english-worksheet-guides.json',base)).then(r => {
    if (!r.ok) throw Error('Guide data could not be loaded');
    return r.json();
  });
  let dataPromise;
  const data = () => dataPromise ||= load();
  const node = (tag,text) => { const n=document.createElement(tag); if(text!==undefined)n.textContent=text; return n; };
  function resolve(url) {
    const u=new URL(url,location.href),p=u.searchParams;
    if(p.has('keywordVariant'))return 'variant:'+p.get('keywordVariant');
    const type=p.get('type');
    if(type)return type.startsWith('kw74-')?'variant:'+type.slice(5):'type:'+type;
    if(u.pathname.endsWith('/en/app/keyword-100-facts.html'))return 'variant:51';
    if(u.pathname.endsWith('/en/app/keyword-count-100.html'))return 'variant:186';
    if(u.pathname.includes('/times-tables/'))return 'times:base';
    if(u.pathname.endsWith('/en/app/worksheets.html'))return 'new:'+(p.get('id')||'0');
    if((u.pathname.includes('/en/app/approved-worksheets/')||u.pathname.includes('/en/app/candidate-worksheets/'))&&p.has('id'))return 'resource:'+p.get('id');
    return null;
  }
  function render(g,container) {
    container.classList.add('english-teaching-guide');
    container.setAttribute('lang','en-US');
    container.replaceChildren();
    // Editorial review status is tracked in audit data, not public teaching notes.
    container.append(node('h2',g.title),node('p',g.overview));
    function section(title,items,ordered=false){
      container.append(node('h3',title));
      const ul=node(ordered?'ol':'ul');
      items.forEach(text=>ul.append(node('li',text)));container.append(ul);
    }
    section('Before You Begin',g.prerequisites);
    section('Teaching Steps for Parents and Teachers',g.teachingSteps,true);
    container.append(node('h3','Worked Examples'));
    for(const example of g.workedExamples){
      container.append(node('p',example.question));
      const ol=node('ol');example.steps.forEach(s=>ol.append(node('li',s)));container.append(ol);
      const details=node('details');details.append(node('summary','Show the example answer'),node('p',example.answer));container.append(details);
    }
    container.append(node('h3','Common Mistakes and How to Help'));
    for(const m of g.commonMistakes){container.append(node('h4',m.mistake),node('p',m.guidance));}
    section('Questions to Check Understanding',g.parentPrompts);
    container.append(node('h3','Using the Worksheet and Reviewing Answers'),node('p',g.practiceAdvice));
    section('Next Practice',g.nextSteps);
  }
  const css=node('style');css.textContent='.english-teaching-guide{display:block;grid-column:1/-1;max-width:none;margin:28px 0;padding:0;background:transparent;border:0;border-radius:0;font:16px/1.65 Arial,sans-serif;color:#214c50}.english-teaching-guide h2{font-size:24px;line-height:1.3;margin:19.92px 0;font-weight:700}.english-teaching-guide h3{font-size:18.72px;line-height:1.65;margin:18.72px 0;font-weight:700}.english-teaching-guide h4{font-size:16px;margin:16px 0 5px}.english-teaching-guide p{font-size:16px;margin:16px 0}.english-teaching-guide ul,.english-teaching-guide ol{padding-left:40px;margin:16px 0}.english-teaching-guide summary{display:list-item;list-style:disclosure-closed;cursor:pointer;background:transparent;padding:0;font-weight:normal}.english-teaching-guide summary:after{content:none}.english-teaching-guide details{border:0;background:transparent}.english-teaching-guide details[open]>summary{background:transparent}.standalone-english-guide{max-width:1000px;margin:28px auto;padding:0 24px}@media print{.english-teaching-guide{display:none!important}}';document.head.append(css);
  window.EnglishWorksheetGuides={data,resolve,render};
  if(document.body.dataset.guideReview)return;
  const rows=document.getElementById('rows');
  if(rows){
    let lastFrame=null;
    const check=()=>{
      const frame=rows.querySelector('#active-sheet');
      if(!frame){lastFrame=null;return;}
      if(frame===lastFrame)return;
      lastFrame=frame;
      const panel=node('article');panel.id='english-worksheet-guide';frame.after(panel);
      let version=0;
      const update=async()=>{
        const current=++version;
        let url=frame.src;
        try{if(frame.contentWindow.location.href!=='about:blank')url=frame.contentWindow.location.href;}catch{}
        const key=resolve(url);if(!key){panel.replaceChildren();return;}
        try{
          const guide=(await data())[key];
          if(current!==version||!panel.isConnected)return;
          if(!guide)throw Error('Missing guide: '+key);
          render(guide,panel);panel.dataset.guideKey=key;
          // The original ten-guide page already includes a guide. The parent
          // displays that same guide here, so hide the embedded duplicate only.
          const inner=frame.contentDocument?.querySelector('#worksheet-guide');if(inner)inner.style.display='none';
        }catch(e){panel.replaceChildren(node('p','The English guide could not be loaded. Please reload the page.'));console.error(e);}
      };
      frame.addEventListener('load',()=>{update();try{frame.contentDocument.addEventListener('change',()=>setTimeout(update,0));}catch{}});
      update();
    };
    new MutationObserver(check).observe(rows,{childList:true});check();
  }else if(window.self===window.top&&!location.pathname.endsWith('/en/app/worksheets.html')){
    const key=resolve(location.href);if(!key)return;
    const panel=node('article');panel.className='standalone-english-guide';document.body.append(panel);
    data().then(all=>{if(all[key]){render(all[key],panel);panel.dataset.guideKey=key;}}).catch(console.error);
  }
})();
