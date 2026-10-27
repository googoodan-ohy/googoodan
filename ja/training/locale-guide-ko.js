(()=>{'use strict';
const L=window.CountryLocale||{},typeId=new URLSearchParams(location.search).get('type'),x=(L.items||{})[typeId]||{},g=x.guide,ui=L.ui||{},guides=window.CountryKoGuides||{},data=guides[typeId],labels=window.CountryKoGuideLabels||{};
const fixedToolbar={new:ui.newProblems,'problem-button':ui.problems,'answer-button':ui.answers,print:ui.print};
for(const [id,text]of Object.entries(fixedToolbar)){const el=document.getElementById(id);if(el&&text)el.textContent=text}
for(const [id,key]of [['print-q','problemSheet'],['print-a','answerSheet']]){const input=document.getElementById(id);if(input&&ui[key])for(const n of [...input.parentNode.childNodes])if(n.nodeType===3)n.textContent=ui[key]}
const bar=document.querySelector('.toolbar');
if(bar){for(const a of [...bar.querySelectorAll('a')]){const href=a.getAttribute('href'),label=a.textContent.trim();if(href==='/ko/training/'||(href==='#teaching-guide'&&label==='\uC9C0\uB3C4 \uC548\uB0B4'))a.remove();}}
for(const [href,text]of [['../index.html',ui.back||'연산 트레이닝 목록'],['#teaching-guide',ui.guide||labels.guide||'지도 안내']]){const a=document.createElement('a');a.href=href;a.textContent=text;if(bar)bar.append(a)}
CountryRuntime.scan(document.getElementById('sheet-root'));
if(!document.getElementById('teaching-guide')){const panel=document.createElement('section');panel.id='teaching-guide';panel.className='country-guide';
const heading=document.createElement('h2');heading.textContent=ui.guide||labels.guide||'지도 안내';panel.append(heading);
const node=(tag,text)=>{const el=document.createElement(tag);el.textContent=text==null?'':String(text);return el};
const list=(tag,items)=>{const el=document.createElement(tag);for(const item of Array.isArray(items)?items:[])el.append(node('li',item));return el};
const sectionHeading=key=>node('h2',labels[key]||key);
if(data){
 panel.append(node('h2',data.title),node('p',data.concept),node('p',data.overview));
 panel.append(sectionHeading('prerequisites'),list('ul',data.prerequisites));
 panel.append(sectionHeading('teachingSteps'),list('ol',data.teachingSteps));
 panel.append(sectionHeading('workedExamples'));
 for(const example of Array.isArray(data.workedExamples)?data.workedExamples:[]){const section=document.createElement('section');section.append(node('p',example.question));section.lastChild.className='problem-copy';section.append(list('ol',example.steps));const details=document.createElement('details'),summary=node('summary',labels.showAnswer||'정답 보기');details.append(summary,document.createTextNode(example.answer==null?'':String(example.answer)));section.append(details);panel.append(section)}
 panel.append(sectionHeading('commonMistakes'));
 for(const item of Array.isArray(data.commonMistakes)?data.commonMistakes:[])panel.append(node('h3',item.mistake),node('p',item.guidance));
 panel.append(sectionHeading('parentPrompts'),list('ul',data.parentPrompts));
 panel.append(sectionHeading('practiceAdvice'),node('p',data.practiceAdvice));
 panel.append(sectionHeading('nextSteps'),list('ul',data.nextSteps));
}else if(g){
 const oldLabels=ui.guideLabels||{};
 for(const key of ['skill','steps','example','check','misconception','support','extension']){const block=document.createElement('div'),head=node('h3',oldLabels[key]||key),content=node('p',Array.isArray(g[key])?g[key].join('\n'):g[key]||'');block.append(head,content);if(key==='example'){const examples=document.createElement('div');examples.className='worked-example';const sourceCell=document.querySelector('#sheet-root .problem-page :is(.sheet-cell,.mt-block)'),rect=sourceCell?sourceCell.getBoundingClientRect():null;for(const [cls,label]of [['problem-page',ui.problemSheet||'문제'],['answer-page',ui.answerSheet||'정답']]){const cell=document.querySelector('#sheet-root .'+cls+' :is(.sheet-cell,.mt-block)');if(cell){const wrap=document.createElement('div');wrap.className=cls;const title=node('strong',label),clone=cell.cloneNode(true);clone.style.cssText+=';width:'+Math.max((rect&&rect.width)||200,100)+'px;min-height:'+Math.max((rect&&rect.height)||100,70)+'px;position:relative;';wrap.append(title,clone);examples.append(wrap)}}block.append(examples)}panel.append(block)}
}
const noticeText=String(labels.reviewNotice||ui.reviewNotice||'').trim();if(noticeText){const notice=node('p',noticeText);notice.className='locale-review';panel.append(notice);}document.body.append(panel);}
const style=document.createElement('style');style.textContent='.country-guide{box-sizing:border-box;width:calc(100% - 24px);max-width:210mm;margin:24px auto;padding:24px;background:#fff;border:1px solid #bfd9d1;border-radius:12px;line-height:1.6;overflow-wrap:anywhere}.country-guide p{white-space:pre-line}.country-guide h3{font-size:16px}.worked-example{display:flex;flex-wrap:wrap;gap:20px}.country-guide .worked-example .problem-page,.country-guide .worked-example .answer-page{display:block!important;background:transparent}.worked-example strong{display:block;margin-bottom:8px}.locale-review{color:#8e3a21;background:#fff7ef;padding:8px 12px;font-size:12px}.country-guide details{overflow-wrap:anywhere}@media(max-width:360px){.country-guide{padding:16px;margin:12px auto}.country-guide section{min-width:0;max-width:100%}}@media print{.country-guide{display:none}}';document.head.append(style);
})();
