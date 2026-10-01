'use strict';
const art=window.PhonicsArt||{},details=window.PhonicsArtDetails||{},sources=window.PhonicsArtSources||{},variants=window.PhonicsArtVariants||{};
const bank=window.PhonicsData;
const bankLoaded=Array.isArray(bank?.patterns);
const normalizeWord=value=>String(value||'').trim().toLowerCase();
const wordId=word=>normalizeWord(word).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const escape=value=>String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
function choicesFor(id,item){
 const candidates=Array.isArray(variants[id])&&variants[id].length
  ? variants[id] : art[id] ? [{...item,file:art[id]}] : [];
 const seen=new Set();
 return candidates.filter(choice=>{
  if(!choice?.file)return false;
  const key=choice.sha256||choice.file;
  if(seen.has(key))return false;
  seen.add(key);
  return true;
 });
}
function buildEntries(){
 const words=new Map();
 for(const pattern of bankLoaded?bank.patterns:[]){
  for(const record of pattern.words||[]){
   const word=normalizeWord(record.word);
   if(!word)continue;
   if(!words.has(word))words.set(word,{word,grades:new Set()});
   if(record.grade!=null&&String(record.grade).trim())words.get(word).grades.add(String(record.grade));
  }
 }
 return [...words.values()].map(record=>{
  const id=wordId(record.word),item=details[id]||{},choices=choicesFor(id,item);
  return {
   id,word:record.word,
   grades:[...record.grades].sort((a,b)=>Number(a)-Number(b)),
   meaning:item.meaning||choices.find(choice=>choice.meaning)?.meaning||null,
   note:item.note||null,
   choices
  };
 }).sort((a,b)=>a.word.localeCompare(b.word,'en'));
}
const entries=buildEntries();
const isEarly=item=>item.grades.some(grade=>Number(grade)>=1&&Number(grade)<=3);
function countStates(items){
 return {
  all:items.length,
  three:items.filter(item=>item.choices.length>=3).length,
  partial:items.filter(item=>item.choices.length>=1&&item.choices.length<=2).length,
  missing:items.filter(item=>!item.choices.length).length
 };
}
const fullCounts=countStates(entries),earlyCounts=countStates(entries.filter(isEarly));
const uniqueFiles=window.PhonicsArtMeta?.uniqueFiles??new Set(entries.flatMap(item=>item.choices.map(choice=>choice.file))).size;
document.querySelector('#summary').textContent=bankLoaded
 ? `전체 ${fullCounts.all}개 단어 중 그림이 있는 단어 ${fullCounts.all-fullCounts.missing}개 · 그림 준비 중 ${fullCounts.missing}개. 연결된 원본 그림 ${uniqueFiles}개.`
 : '단어은행을 불러오지 못했습니다. 페이지를 새로고침해 주세요.';
document.querySelector('#early-summary').textContent=bankLoaded
 ? `1~3단계 ${earlyCounts.all}개 단어: 그림 3종 이상 ${earlyCounts.three}개 · 1~2종 ${earlyCounts.partial}개 · 그림 준비 중 ${earlyCounts.missing}개.${window.PhonicsArtMeta?.early?.contextWords?` 이 중 ${window.PhonicsArtMeta.early.contextWords}개 단어는 상황 힌트를 함께 쓰는 그림이 있습니다.`:''}`
 : '';
const params=new URLSearchParams(location.search);
let page=0,stateFilter=['all','three','partial','missing'].includes(params.get('state'))?params.get('state'):'all';
const pageSize=24;
const search=document.querySelector('#search'),earlyOnly=document.querySelector('#early-only');
search.value=params.get('q')||'';
earlyOnly.checked=params.get('early')==='1';
function rememberFilters(){
 const url=new URL(location.href);
 for(const [key,value] of [['q',search.value.trim()],['early',earlyOnly.checked?'1':''],['state',stateFilter==='all'?'':stateFilter]]){
  if(value)url.searchParams.set(key,value);else url.searchParams.delete(key);
 }
 history.replaceState(null,'',url);
}
function scopedEntries(){
 const term=search.value.trim().toLowerCase();
 const terms=term.split(',').map(value=>value.trim()).filter(Boolean),exactWords=term.includes(',');
 return entries.filter(item=>{
  const matches=!terms.length||(exactWords
   ? terms.includes(item.word)
   : `${item.word} ${item.meaning||''}`.toLowerCase().includes(terms[0]));
  return matches&&(!earlyOnly.checked||isEarly(item));
 });
}
function stateMatches(item){
 return stateFilter==='all'
  ||stateFilter==='three'&&item.choices.length>=3
  ||stateFilter==='partial'&&item.choices.length>=1&&item.choices.length<=2
  ||stateFilter==='missing'&&!item.choices.length;
}
function cardMarkup(item){
 const illustrations=item.choices.length
  ? `<div class="variant-list">${item.choices.map((choice,index)=>{
    const source=sources[choice.sourceId]||{};
    return `<figure class="variant"><button type="button" class="picture-open" data-picture="${index}" aria-label="${escape(item.word)} 그림 ${index+1} 크게 보기"><img src="${escape(choice.file)}" alt="${escape(choice.meaning||item.meaning||item.word)}" width="64" height="64" loading="lazy" decoding="async"></button><figcaption>${escape(source.name||'')}${choice.sourceUrl?`<br><a href="${escape(choice.sourceUrl)}" title="${escape(choice.author||source.author||'')}">원본 보기</a>`:''}</figcaption></figure>`;
   }).join('')}</div><span class="variant-count">그림 ${item.choices.length}종${item.choices.some(choice=>choice.contextHint)?' · 상황 힌트 포함':''}</span>`
  : '<div class="variant-placeholder" aria-hidden="true">그림 자리</div><span class="variant-count is-pending">그림 준비 중 · 0종</span>';
 return `<article class="card${item.choices.length?'':' pending-card'}" data-word="${escape(item.word)}">${illustrations}<b>${escape(item.word)}</b><span>${escape(item.meaning||'뜻 검토 중')}</span><small class="card-grades">${item.grades.map(grade=>escape(grade)+'단계').join(' · ')}</small>${item.note?`<small>${escape(item.note)}</small>`:''}</article>`;
}
function render(){
 const scoped=scopedEntries(),counts=countStates(scoped);
 document.querySelectorAll('[data-state]').forEach(button=>{
  const state=button.dataset.state;
  button.setAttribute('aria-pressed',String(state===stateFilter));
  button.querySelector('.filter-count').textContent=String(counts[state]);
 });
 const matching=scoped.filter(stateMatches),pages=Math.ceil(matching.length/pageSize);
 page=pages?Math.max(0,Math.min(page,pages-1)):0;
 document.querySelector('#grid').innerHTML=matching.slice(page*pageSize,(page+1)*pageSize).map(cardMarkup).join('');
 const start=matching.length?page*pageSize+1:0,end=Math.min((page+1)*pageSize,matching.length);
 document.querySelector('#count').textContent=`${matching.length}개 단어${matching.length?` · ${start}–${end} 표시`:''}`;
 document.querySelector('#page').textContent=pages?`${page+1} / ${pages}`:'0 / 0';
 document.querySelector('#prev').disabled=!pages||page===0;
 document.querySelector('#next').disabled=!pages||page>=pages-1;
 const empty=document.querySelector('#empty');
 empty.hidden=matching.length>0;
 empty.textContent=bankLoaded?'선택한 조건에 맞는 단어가 없습니다. 검색어나 필터를 바꿔 보세요.':'단어은행을 불러오지 못했습니다. 페이지를 새로고침해 주세요.';
}
search.addEventListener('input',()=>{page=0;rememberFilters();render();});
earlyOnly.onchange=()=>{page=0;rememberFilters();render();};
document.querySelectorAll('[data-state]').forEach(button=>{
 button.onclick=()=>{stateFilter=button.dataset.state;page=0;rememberFilters();render();};
});
document.querySelector('#prev').onclick=()=>{if(page>0){page--;render();}};
document.querySelector('#next').onclick=()=>{
 const count=scopedEntries().filter(stateMatches).length;
 if((page+1)*pageSize<count){page++;render();}
};
const viewer=document.querySelector('#art-viewer');
let viewedEntry=null,viewedIndex=0;
function renderPicture(){
 const choice=viewedEntry.choices[viewedIndex],source=sources[choice.sourceId]||{};
 document.querySelector('#art-viewer-title').textContent=viewedEntry.word;
 document.querySelector('#art-viewer-meaning').textContent=choice.meaning||viewedEntry.meaning||'';
 if(choice.contextHint)document.querySelector('#art-viewer-meaning').textContent+=' · 상황 힌트: '+choice.contextHint;
 const picture=document.querySelector('#art-viewer-image');
 picture.src=choice.file;picture.alt=choice.meaning||viewedEntry.word;
 document.querySelector('#art-viewer-count').textContent=`${viewedIndex+1} / ${viewedEntry.choices.length}`;
 document.querySelector('#art-viewer-prev').disabled=viewedIndex===0;
 document.querySelector('#art-viewer-next').disabled=viewedIndex===viewedEntry.choices.length-1;
 const authorLink=source.authorUrl?` · <a href="${escape(source.authorUrl)}" target="_blank" rel="noopener">${escape(source.authorUrl.replace(/^https?:\/\//,'').replace(/\/$/,''))}</a>`:'';
 document.querySelector('#art-viewer-credit').innerHTML=`${choice.title?`<p>작품 이름: ${escape(choice.title)}</p>`:''}<p>${escape(source.name)} · ${escape(choice.author||source.author||'')}${authorLink}</p><p>${choice.sourceUrl?`<a href="${escape(choice.sourceUrl)}" target="_blank" rel="noopener">원본 보기</a> · `:''}<a href="${escape(source.licenseUrl)}" target="_blank" rel="noopener">${escape(source.license)}</a></p><p>원본을 수정하지 않고 표시한 그림입니다.${choice.imageRole==='color-swatch'||choice.requiresColor?' 색상 문제는 컬러로 인쇄해 주세요.':''}</p>${source.usageNote?`<p>${escape(source.usageNote)}</p>`:''}`;
}
document.querySelector('#grid').addEventListener('click',event=>{
 const button=event.target.closest('[data-picture]');if(!button)return;
 viewedEntry=entries.find(item=>item.word===button.closest('[data-word]').dataset.word);
 viewedIndex=Number(button.dataset.picture);renderPicture();viewer.showModal();
});
document.querySelector('#art-viewer-close').onclick=()=>viewer.close();
function stepPicture(step){
 if(!viewedEntry)return;
 const next=viewedIndex+step;
 if(next>=0&&next<viewedEntry.choices.length){viewedIndex=next;renderPicture();}
}
document.querySelector('#art-viewer-prev').onclick=()=>stepPicture(-1);
document.querySelector('#art-viewer-next').onclick=()=>stepPicture(1);
viewer.addEventListener('keydown',event=>{
 if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();stepPicture(event.key==='ArrowLeft'?-1:1);}
});
viewer.addEventListener('click',event=>{
 if(event.target!==viewer)return;
 const bounds=viewer.getBoundingClientRect();
 if(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom)viewer.close();
});
document.querySelector('#source-list').innerHTML=Object.values(sources).map(source=>{
 const version=String(source.version||'');
 const author=escape(source.author)+(source.authorUrl?` · <a href="${escape(source.authorUrl)}">${escape(source.authorUrl.replace(/^https?:\/\//,'').replace(/\/$/,''))}</a>`:'');
 return `<p><b>${escape(source.name)} ${version.length<15?escape(version):''}</b><br>저작자: ${author}<br><a href="${escape(source.url)}">출처</a> · <a href="${escape(source.licenseUrl)}">${escape(source.license)}</a></p>${source.usageNote?`<p>${escape(source.usageNote)}</p>`:''}${source.licenseFiles?.length?`<p class="sources-files">원본 라이선스: ${source.licenseFiles.map((file,index)=>`<a href="${escape(file.file)}">전문 ${index+1}</a>`).join(' · ')}</p>`:''}`;
}).join('');
render();
