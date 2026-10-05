(async () => {
  'use strict';
  const read = async name => { const response = await fetch(name, {cache:'no-store'}); if (!response.ok) throw Error(name); return response.json(); };
  const [data, activities, trainingConcepts, ...gradeBooks] = await Promise.all(['catalog.json','activity-splits.json','concepts/training.json', ...[1,2,3,4,5,6].map(g=>'concepts/grade-'+g+'.json')].map(read));
  const newTrainingGuides=await read('/assets/training-types-catalog.json');
  const unitTraining=await read('/assets/unit-training-catalog.json');
  const gradeConcepts=new Map(gradeBooks.map(book=>[book.grade,book]));
  const $ = selector => document.querySelector(selector);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const domains = {whole:'자연수', fractions:'분수', decimals:'소수'};
  const topicNames = [...new Set(data.units.flatMap(unit => unit.topics || [unit.topic]))];
  const units = new Map(data.units.map(unit => [unit.id,unit]));
  const main = $('main'), menu = $('#menu'), content = $('#content'), browse = $('.browse');
  const selections = new Map(activities.map(activity => [activity.id,activity]));
  const groups = new Map();
  for (const [domain,list] of Object.entries(data.training)) list.forEach((group,index) => group.worksheets.forEach(id => groups.set(id,{domain,index,group})));
  const safeGet = key => { try { return sessionStorage.getItem(key); } catch { return null; } };
  const safeSet = (key,value) => { try { sessionStorage.setItem(key,value); } catch {} };
  const link = (label,hash,active=false) => `<a class="menu-link" href="#${esc(hash)}"${active?' aria-current="page"':''}>${esc(label)}</a>`;
  const hero = (title,text='') => `<div class="hero"><h1>${esc(title)}</h1>${text?`<p>${esc(text)}</p>`:''}</div>`;
  const formats = worksheet => worksheet.formats || (worksheet.originalConfig?.kind?.includes('fraction') ? ['horizontal'] : ['horizontal','vertical']);
  let playerObserver;
  const trainingSeeds=new Map();
  function cards(worksheets) {
    return '<div class="training-gallery separate-gallery grade-gallery">'+worksheets.map(w=>'<a class="training-card" href="#worksheet/'+esc(w.id)+'"><iframe class="type-sheet-static" loading="lazy" tabindex="-1" aria-hidden="true" src="/lab/ko-concept-layout/prebuilt-types/'+encodeURIComponent(w.id)+'.html"></iframe><span title="'+esc(w.title)+'">'+esc(w.title)+'</span></a>').join('')+'</div>';
  }
  function fitTypeSheets(){
    document.querySelectorAll('.type-sheet-static').forEach(frame=>{
      const fit=()=>{
        const doc=frame.contentDocument,sheet=doc?.querySelector('.sheet,.paper');if(!sheet)return;
        const width=Number(doc.body.dataset.sheetWidth)||794;
        doc.body.style.zoom=frame.clientWidth/width;
        frame.style.height=Math.ceil(sheet.offsetHeight*frame.clientWidth/width)+2+'px';
      };
      frame.addEventListener('load',fit);
      new ResizeObserver(fit).observe(frame);
    });
  }
  menu.addEventListener('toggle',event=>{
    const group=event.target;
    if(!group.matches('.grade-group')||group.open)return;
    group.querySelectorAll('details[open]').forEach(item=>item.open=false);
  },true);
  function gradeMenu(grade,unitId) {
    const semester=unitId?Number(unitId.split("-")[1]):1;
    return '<p class="menu-heading">학년과 단원</p>'+[1,2,3,4,5,6].map(g => `<details class="grade-group" name="school-grade"${g===grade?' open':''}><summary>${g}학년</summary><div class="semester-list">${[1,2].map(s=>`<details class="semester-group" name="school-semester"${g===grade&&s===semester?' open':''}><summary>${s}학기</summary><div class="semester-units">${data.units.filter(u=>u.grade===g&&Number(u.id.split("-")[1])===s).map(u=>'<div class="unit-menu-label">'+esc(u.id.split("-")[2]+". "+u.title.split("·").slice(1).join("·").trim())+'</div><div class="nested unit-training-submenu">'+link('유형','unit/'+u.id,u.id===unitId&&!location.pathname.includes('/training/'))+(unitTraining.units[u.id]?.length?link('연산','unittraining/'+u.id,location.pathname.includes('/unit/'+u.id+'/training/')):'')+'</div>').join('')}</div></details>`).join('')}</div></details>`).join('');
  }
  function trainingMenu(domain,index) {
    return Object.entries(domains).map(([key,name]) => `<section class="training-domain domain-${key}"><h2 class="domain-heading">${name}</h2>${data.training[key].map((g,i)=>link(g.name,`training/${key}/${i}`,domain===key&&index===i)).join('')}</section>`).join('');
  }
  function workedExample(example,index) {
    return `<section class="concept-example"><h4>아이에게 제시할 예제 ${index+1}</h4><p class="example-problem">${esc(example.problem)}</p><ol>${example.steps.map(step=>`<li>${esc(step)}</li>`).join('')}</ol><p class="example-answer"><strong>답</strong> ${esc(example.answer)}</p><p class="example-check"><strong>이해도 확인</strong> ${esc(example.check)}</p></section>`;
  }
  function conceptExplanation(w,activity=null,isTraining=false) {
    const book=isTraining?trainingConcepts:gradeConcepts.get(w.grade);
    const entry=activity?book.activities[activity.id]:book.worksheets[w.id];
    if(!entry?.lessonIds?.length)throw Error('Missing concept: '+(activity?.id||w.id));
    const lessons=entry.lessonIds.map(id=>{const lesson=book.lessons[id];if(!lesson)throw Error('Missing lesson: '+id);return {id,...lesson};});
    const reviewIds=new Set(entry.reviewLessonIds||[]);
    const coreLessons=lessons.filter(lesson=>!reviewIds.has(lesson.id));
    const reviewLessons=lessons.filter(lesson=>reviewIds.has(lesson.id));
    const renderLesson=lesson=>`<article class="section lesson-copy concept-lesson" data-concept-id="${esc(lesson.id)}"><h2>${esc(lesson.title)}</h2><p class="concept-overview">${esc(lesson.overview)}</p>${lesson.concepts.map(c=>`<section class="concept-point"><h3>${esc(c.title)}</h3><p>${esc(c.text)}</p></section>`).join('')}<h3>이렇게 지도해 주세요</h3><ol class="concept-steps">${lesson.steps.map(step=>`<li>${esc(step)}</li>`).join('')}</ol><h3>예제 지도 방법</h3>${(entry.examples&&lessons.length===1?entry.examples:lesson.examples).map(workedExample).join('')}<section class="concept-mistakes"><h3>아이가 혼동하기 쉬운 점과 지도 방법</h3>${lesson.mistakes.map(m=>`<p><strong>${esc(m.wrong)}</strong><br>${esc(m.correction)}</p>`).join('')}</section><h3>연습을 지도할 때 확인할 점</h3><ul>${lesson.practiceTips.map(t=>`<li>${esc(t)}</li>`).join('')}</ul></article>`;
    const review=reviewLessons.length?`<details class="concept-review"><summary>문제지에 함께 들어 있는 복습</summary><p>${esc(entry.reviewNote||'아래 설명은 이 문제지에 포함된 복습 문항을 지도할 때 참고하세요.')}</p>${reviewLessons.map(renderLesson).join('')}</details>`:'';
    return `<section class="concept-intro" data-explanation-for="${esc(activity?.id||w.id)}" aria-labelledby="concept-heading"><p class="eyebrow">학습 지도 안내</p><h2 id="concept-heading">부모님·선생님을 위한 지도 안내</h2><p>${esc(entry.focus)}</p><button type="button" class="lesson-jump">문제지·인쇄 화면으로 이동 ↓</button></section>`+coreLessons.map(renderLesson).join('')+review+`<section class="concept-practice-intro"><h2>문제지 활용 지도</h2><p>${esc(entry.howToUse)}</p></section>`;
  }
  function player(title,url,trainingId="") {
    return `<iframe scrolling="no" id="worksheet-player" data-training-id="${esc(trainingId)}" title="${esc(title)}" src="${esc(url)}"></iframe>`;
  }
  function fitPlayer() {
    const frame=$('#worksheet-player');if(!frame)return;
    frame.addEventListener('load',()=>{
      try {
        const doc=frame.contentDocument;
        const style=doc.createElement('style');
        style.textContent='@media screen{html{height:auto!important;min-height:0!important;overflow-x:auto!important;overflow-y:hidden!important}body{position:static!important;inset:auto!important;height:auto!important;min-height:0!important;display:block!important;overflow:visible!important}.site-header,body>footer,.layout>aside{display:none!important}.layout{display:block!important;height:auto!important;min-height:0!important;max-height:none!important;overflow:visible!important;padding:0!important}.layout>main{height:auto!important;min-height:0!important;overflow:visible!important;padding:0!important}main{min-width:0!important}#practice{margin:0!important;border:0!important;padding:8px!important}}';
        doc.head.append(style);
        const paper=doc.querySelector('#sheet-view')||doc.querySelector('#worksheet')||doc.querySelector('article.paper')||doc.querySelector('#sheet-root');
        if(paper){
          const dock=doc.createElement('div');dock.className='worksheet-bottom-controls';
          paper.before(dock);
          doc.querySelectorAll('.toolbar').forEach(el=>dock.append(el));
          const practice=doc.querySelector('#practice');
          if(practice){
            [...practice.children].filter(el=>el!==paper&&el!==dock&&(el.matches('.controls,fieldset'))).forEach(el=>dock.append(el));
            practice.querySelector(':scope > h2')?.setAttribute('hidden','');
            [...practice.children].filter(el=>el.tagName==='P'&&el.id!=='status').forEach(el=>el.hidden=true);
          }
          const css=doc.createElement('style');css.textContent='@media screen{.worksheet-half-viewport{overflow-y:scroll!important;overflow-x:auto;scrollbar-gutter:stable;min-height:0!important;max-height:none!important;border:1px solid #cfdfd8;border-radius:8px;background:#fff}.worksheet-half-viewport:focus-visible{outline:2px solid #176e5c;outline-offset:2px}.worksheet-bottom-controls{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:10px;margin:8px auto 16px;padding:12px;background:#f2f7f4;border:1px solid #cfdfd8;border-radius:8px;max-width:900px}.worksheet-bottom-controls .toolbar{position:static!important;margin:0!important;width:100%}.worksheet-bottom-controls fieldset{margin:0}.worksheet-bottom-controls button{cursor:pointer}}@media print{.worksheet-half-viewport{height:auto!important;overflow:visible!important;border:0!important}.worksheet-bottom-controls{display:none!important}}';doc.head.append(css);
        }

        const resize=()=>{if(!frame.isConnected)return;const height=Math.ceil(doc.body.getBoundingClientRect().height+20);if(Math.abs(frame.getBoundingClientRect().height-height)>1)frame.style.height=height+'px';};
        playerObserver=new frame.contentWindow.ResizeObserver(resize);playerObserver.observe(doc.body);resize();
      } catch { /* The direct worksheet link remains available. */ }
    });
  }
  function render() {
    const previousFrame=$('#worksheet-player');
    try {const set=new URL(previousFrame?.contentWindow.location.href).searchParams.get('set');if(previousFrame?.dataset.trainingId&&/^\d{1,10}$/.test(set)&&Number(set)<=4294967295)trainingSeeds.set(previousFrame.dataset.trainingId,set);} catch {}
    playerObserver?.disconnect();
    let parts;
    try {parts=decodeURIComponent(location.hash.slice(1)||(document.body.dataset.route==='search'?'search/'+encodeURIComponent(new URLSearchParams(location.search).get('q')||''):document.body.dataset.route)||'grades').split('/');} catch {parts=['invalid'];}
    const [mode='grades',arg='',routeFormat=''] = parts; const formatArg=routeFormat||new URLSearchParams(location.search).get('layout')||'';
    const activity=mode==='activity'?selections.get(arg):null;
    const worksheet=mode==='worksheet'||activity?data.worksheets[activity?activity.parentId:arg]:null;
    const trainingWorksheet=mode==='trainingsheet'?data.trainingWorksheets[arg]:null;
    const groupInfo=trainingWorksheet?groups.get(arg):null;
    const domain=Object.hasOwn(domains,arg)?arg:'whole';
    const op=/^[0-3]$/.test(formatArg)?Number(formatArg):0;
    const origin=document.body.dataset.home==='true'?'grades/1':safeGet('ko-browse-origin')||'grades/1';
    const validOrigin=/^(grades\/[1-6]|unit\/[1-6]-[12]-\d+|topics(?:\/[^<>]*)?|search\/[^<>]*)$/.test(origin)?origin:'grades/1';
    const navMode=trainingWorksheet||['training','traininglibrary','trainingdetail'].includes(mode)?'training':worksheet?(validOrigin.startsWith('topics')?'topics':'grades'):mode==='topics'?'topics':'grades';
    let grade=worksheet?.grade || units.get(arg)?.grade || (/^[1-6]$/.test(arg)?Number(arg):1);
    menu.innerHTML=navMode==='training'?trainingMenu(groupInfo?.domain||domain,groupInfo?.index??op):navMode==='topics'?'<p class="menu-heading">학습 주제</p>'+link('모든 주제','topics',mode==='topics'&&!arg)+topicNames.map(t=>link(t,'topics/'+t,mode==='topics'&&arg===t)).join(''):gradeMenu(grade,worksheet?.unit||(['unit','unittraining'].includes(mode)?arg:null));
    document.querySelectorAll('[data-mode]').forEach(a=>{if(a.dataset.mode===navMode)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
    if(document.body.dataset.home==='true'&&worksheet) {
      content.innerHTML=player(worksheet.title,worksheet.url)+conceptExplanation(worksheet,activity);
    } else if(mode==='training') {
      const group=data.training[domain][op];
      content.innerHTML=hero(`${domains[domain]} · ${group.name}`,'문제지 미리보기를 골라 연습하세요. 가로셈과 세로셈은 같은 유형의 계산을 다른 배치로 보여 줍니다.')+`<div class="training-gallery separate-gallery">${group.worksheets.map(id=>{const w=data.trainingWorksheets[id];return formats(w).map(f=>`<a class="training-card" href="#trainingsheet/${esc(id)}/${f}"><img src="training-thumbnails/${esc(w.sourceType)}${f==='vertical'?'-vertical':''}.png" alt="${esc(w.title)} ${f==='vertical'?'세로셈':'가로셈'} 미리보기" loading="lazy" width="420" height="594"><span title="${esc(w.title)} · ${f==='vertical'?'세로셈':'가로셈'}">${esc(w.title)} · ${f==='vertical'?'세로셈':'가로셈'}</span></a>`).join('');}).join('')}</div><section class="section"><h2>연습 전에</h2><p>${esc(group.tip)}</p></section>`;
    } else if(trainingWorksheet) {
      const w=trainingWorksheet, allowed=formats(w),format=allowed.includes(formatArg)?formatArg:allowed.includes('vertical')?'vertical':'horizontal';
      content.innerHTML=`<a class="back-link" href="#training/${groupInfo.domain}/${groupInfo.index}">← ${domains[groupInfo.domain]} ${groupInfo.group.name} 목록</a>`+hero(w.title)+`<nav class="controls" aria-label="계산 배치">${allowed.map(f=>`<a class="format-link" href="#trainingsheet/${esc(arg)}/${f}"${f===format?' aria-current="page"':''}>${f==='vertical'?'세로셈':'가로셈'}</a>`).join('')}</nav>`+player(w.title,w.url+'?layout='+format+(trainingSeeds.has(arg)?'&set='+trainingSeeds.get(arg):''),arg)+conceptExplanation(w,null,true);
    } else if(worksheet) {
      const title=activity?.title||worksheet.title,url=activity?.url||worksheet.url;
      content.innerHTML=player(title,url)+conceptExplanation(worksheet,activity);
    } else if(mode==='unittraining'||mode==='traininglibrary'||mode==='trainingdetail') {
      let u=units.get(arg),rows=unitTraining.units[arg]||[];
      if(mode==='traininglibrary'||mode==='trainingdetail'){
        const params=new URLSearchParams(location.search);
        const detail=newTrainingGuides.find(r=>r.typeId===arg);
        const domain=mode==='trainingdetail'&&detail?detail.domain:(params.get('domain')||'자연수');
        const category=r=>r.stage==='선행 학습'?'선행학습':r.stage==='연결·종합'?(r.group==='분수 학습으로 연결'?'연결':'종합'):r.stage;
        const order=['선행학습','덧셈','뺄셈','곱셈','나눗셈','연결','종합'];
        const domainRows=newTrainingGuides.filter(r=>r.domain===domain);
        const requested=mode==='trainingdetail'&&detail?category(detail):params.get('category');
        const selected=order.includes(requested)&&domainRows.some(r=>category(r)===requested)?requested:'선행학습';
        rows=domainRows.filter(r=>category(r)===selected);u={title:domain+' · '+selected};
        menu.innerHTML='<p class="menu-heading">연산 트레이닝</p>'+['자연수','분수','소수'].map((d,i)=>{
          const list=newTrainingGuides.filter(r=>r.domain===d);
          return '<details class="grade-group training-area area-'+i+'" name="training-domain"'+(d===domain?' open':'')+'><summary>'+d+'</summary><div class="training-category-menu">'+order.filter(c=>list.some(r=>category(r)===c)).map(c=>'<a class="menu-link" href="/ko/training/?domain='+encodeURIComponent(d)+'&category='+encodeURIComponent(c)+'"'+(d===domain&&c===selected?' aria-current="page"':'')+'>'+c+'</a>').join('')+'</div></details>';
        }).join('');
        document.querySelectorAll('[data-mode]').forEach(a=>{if(a.dataset.mode==='training')a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
      }
      if(!u||!rows.length){content.innerHTML=hero('연결된 자료가 없습니다.');return;}
      content.innerHTML='<div class="unit-training-workspace"><h1>'+esc(u.title)+' · 연산 트레이닝</h1></div><div class="training-sheet-grid">'+rows.map((r,i)=>'<a class="training-sheet-card" href="'+esc(r.url+(mode==='unittraining'?'?unit='+encodeURIComponent(arg):''))+'" aria-label="'+esc(r.title)+' 상세 보기"><h2>'+(i+1)+'. '+esc(r.title)+'</h2><iframe scrolling="no" loading="lazy" title="'+esc(r.concept+' · '+r.title)+'" data-sheet-src="/ko/training-player/prebuilt/'+encodeURIComponent(r.typeId)+'.html"></iframe></a>').join('')+'</div>';
      if(mode==='trainingdetail'){
        const sourceUnit=new URLSearchParams(location.search).get('unit');
        if(units.has(sourceUnit)&&(unitTraining.units[sourceUnit]||[]).some(r=>r.typeId===arg)){
          document.body.dataset.browseMode='grades';
          menu.innerHTML=gradeMenu(units.get(sourceUnit).grade,sourceUnit);
          menu.querySelectorAll('a').forEach(a=>{a.removeAttribute('aria-current');if(a.getAttribute('href')==='#unittraining/'+sourceUnit)a.setAttribute('aria-current','page');});
          document.querySelectorAll('[data-mode]').forEach(a=>{if(a.dataset.mode==='grades')a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
        }
        const detail=newTrainingGuides.find(r=>r.typeId===arg);
        if(detail)content.innerHTML=player(detail.title,'/ko/training-player/type.html?type='+encodeURIComponent(detail.typeId)+'&view=problem')+'<div class="training-guide-copy">'+(document.getElementById('training-guide-content')?.innerHTML||'')+'</div>';
      }
      const pendingSheets=[];let activeSheets=0;
      const loadNext=()=>{while(activeSheets<2&&pendingSheets.length){const frame=pendingSheets.shift();if(!frame.isConnected)continue;activeSheets++;frame.addEventListener('load',()=>{activeSheets--;loadNext();},{once:true});frame.src=frame.dataset.sheetSrc;}};
      const visibleSheets=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){visibleSheets.unobserve(entry.target);pendingSheets.push(entry.target);}}loadNext();},{rootMargin:'120px 0px'});
      content.querySelectorAll('.training-sheet-card').forEach(card=>{
        const frame=card.querySelector('iframe');visibleSheets.observe(frame);
        const fit=()=>{
          const doc=frame.contentDocument;if(!doc||!doc.querySelector('.sheet-page'))return;
          let style=doc.getElementById('gallery-style');
          if(!style){style=doc.createElement('style');style.id='gallery-style';style.textContent='@media screen{html,body{margin:0!important;padding:0!important;overflow:hidden!important;background:white!important}.toolbar{display:none!important}.sheet-page{margin:0!important;box-shadow:none!important}}';doc.head.append(style);}
          const scale=frame.clientWidth/(210*96/25.4);
          doc.body.style.zoom=scale;
          const pages=[...doc.querySelectorAll('.sheet-page')].filter(x=>getComputedStyle(x).display!=='none');
          frame.style.height=Math.ceil(pages.reduce((n,x)=>n+x.offsetHeight,0)*scale+2)+'px';
        };
        frame.addEventListener('load',()=>{
          fit();
        });
        new ResizeObserver(fit).observe(card);
      });
    } else if(['grades','unit','topics','search'].includes(mode)) {
      const chosen=mode==='unit'?units.get(arg):null;
      if(mode==='unit'&&!chosen){content.innerHTML=hero('단원을 찾을 수 없습니다.')+link('학년별 학습으로','grades');return;}
      safeSet('ko-browse-origin',mode+(arg?'/'+arg:''));
      if(mode==='search') {
        const tokens=arg.toLocaleLowerCase('ko').trim().split(/\s+/).filter(Boolean);
        const found=Object.values(data.worksheets).filter(w=>tokens.every(t=>(w.title+' '+w.grade+'학년 '+units.get(w.unit).title+' '+(units.get(w.unit).topics||[units.get(w.unit).topic]).join(' ')).toLocaleLowerCase('ko').includes(t)));
        const foundTraining=newTrainingGuides.filter(w=>tokens.every(t=>(w.domain+' '+w.concept+' '+w.title+' '+w.group).toLocaleLowerCase('ko').includes(t)));
        content.innerHTML=hero('검색 결과',arg?`“${arg}”에 맞는 자료를 찾았습니다.`:'학년, 단원 또는 문제지 이름을 입력하세요.')+(tokens.length?`<p role="status">학습 자료 ${found.length}개 · 연산 트레이닝 ${foundTraining.length}개</p>`+cards(found)+foundTraining.map(w=>`<a class="menu-link" href="${esc(w.url)}">${esc(w.concept+' · '+w.title)}</a>`).join('')+(!found.length&&!foundTraining.length?'<p class="empty">검색 결과가 없습니다. ‘분수’, ‘2학년’처럼 짧은 말로 다시 찾아보세요.</p>':''):'');
      } else {
        const list=data.units.filter(u=>mode==='unit'?u.id===arg:mode==='topics'?(arg?(u.topics||[u.topic]).includes(arg):true):u.grade===grade);
        content.innerHTML=(mode==='unit'?'':hero(chosen?.title||(mode==='topics'?(arg||'주제별 학습'):`${grade}학년 학습`),'필요한 문제지를 고르고 새 문제와 정답을 만들어 인쇄하세요.'))+list.map(u=>`<section class="section"><h2>${esc(u.title)} <span class="count">${u.worksheets.length}개</span></h2>${unitTraining.units[u.id]?.length?'<nav class="unit-training-entry">'+link('연산 트레이닝 · '+unitTraining.units[u.id].length+'개 유형','unittraining/'+u.id)+'</nav>':''}${cards(u.worksheets.map(id=>data.worksheets[id]))}</section>`).join('');
      }
    } else {content.innerHTML=hero('자료를 찾을 수 없습니다.')+link('학년별 학습으로','grades');}
    if(!document.body.dataset.route)document.title=(content.querySelector('h1')?.textContent||'초등 수학 문제지')+' | googoodan.com';
    main.scrollTop=0;if(innerWidth<=760)browse.open=false;
    document.querySelector('.lesson-jump')?.addEventListener('click',()=>document.querySelector('#worksheet-player').scrollIntoView({behavior:'smooth',block:'start'}));
    fitPlayer(); fitTypeSheets(); document.body.dataset.ready="true";
  }
  $('.worksheet-search').addEventListener('submit',event=>{event.preventDefault();location.hash='search/'+encodeURIComponent($('#worksheet-query').value.trim());});
  addEventListener('hashchange',render);render();
})().catch(()=>{document.querySelector('#content').innerHTML='<p role="alert">자료를 불러오지 못했습니다. 새로고침하여 다시 시도해 주세요.</p>';});


