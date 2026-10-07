(()=>{'use strict';
function outputBoxes(doc){return {q:doc.querySelector('input[type="checkbox"]#print-q,input[type="checkbox"]#print-worksheet,input[type="checkbox"]#questions'),a:doc.querySelector('input[type="checkbox"]#print-a,input[type="checkbox"]#print-answer,input[type="checkbox"]#answers')};}
// Adapt preserved Korean renderers at the output boundary, without changing questions.
function preparePDF(win){
 if(typeof win.GDPreparePDF==='function')return win.GDPreparePDF();
 const doc=win.document,{q,a}=outputBoxes(doc);if(!q?.checked&&!a?.checked)return false;
 if(!win.KoPreview&&!win.DrillPage)throw Error('PDF renderer is unavailable');
 const state=new URL(win.location.href),seed=Number(state.searchParams.get('set')),copies=Math.min(20,Math.max(1,Math.floor(Number(doc.getElementById('worksheet-copies')?.value)||1)));
 if(!Number.isFinite(seed))throw Error('Invalid worksheet set');
 const originalMode=doc.querySelector('#answer[aria-pressed="true"],#answers[aria-pressed="true"]'),pages=[];
 const scroll={x:win.scrollX,y:win.scrollY};
 try{
  for(let i=0;i<copies;i++){
   if(win.KoPreview){
    win.KoPreview.set(state.searchParams.get('unit'),Number(state.searchParams.get('sheet'))||0,(seed+i)>>>0);
    if(q.checked)pages.push(win.KoPreview.sheetHTML(false));if(a.checked)pages.push(win.KoPreview.sheetHTML(true));
   }else{
    win.DrillPage.set(state.searchParams.get('unit'),state.searchParams.get('drill'),(seed+i)>>>0);
    for(const [selected,id]of [[q.checked,'questions'],[a.checked,'answers']])if(selected){doc.getElementById(id).click();pages.push(doc.querySelector('.paper').outerHTML);}
   }
  }
 }finally{
  if(win.KoPreview)win.KoPreview.set(state.searchParams.get('unit'),Number(state.searchParams.get('sheet'))||0,seed);
  else{win.DrillPage.set(state.searchParams.get('unit'),state.searchParams.get('drill'),seed);doc.getElementById(originalMode?'answers':'questions').click();}
  win.history.replaceState(null,'',state.href);win.scrollTo(scroll.x,scroll.y);
 }
 let bundle=doc.getElementById('print-bundle');if(!bundle){bundle=doc.createElement('div');bundle.id='print-bundle';bundle.style.display='none';doc.body.append(bundle);}bundle.innerHTML=pages.join('');return true;
}

function install(win){const doc=win.document,print=doc.getElementById('print');if(!print||doc.getElementById('save-pdf'))return;const ko=doc.documentElement.lang.startsWith('ko');if(!doc.getElementById('status')){const status=doc.createElement('p');status.id='status';print.parentElement.after(status)}print.textContent=ko?'인쇄':'Print';print.dataset.metric='print';
const label=doc.createElement('label');label.style.cssText='display:inline-flex;align-items:center;gap:6px;flex-wrap:wrap';label.textContent=ko?'PDF 문제지 장수 ':'PDF worksheet pages ';const count=doc.createElement('input');count.id='worksheet-copies';count.type='number';count.min=1;count.max=20;count.step=1;count.value=1;count.style.cssText='width:65px;padding:8px';label.append(count);const button=doc.createElement('button');button.id='save-pdf';button.type='button';button.dataset.metric='pdf';button.textContent=ko?'PDF 다운로드':'Download PDF';const note=doc.createElement('span');note.style.cssText='display:block;font-size:12px;flex-basis:100%';if(ko){
print.after(button);
const bar=print.closest('.tools')||print.closest('.toolbar')||print.parentElement;
const regenerate=doc.getElementById('new');
const group=doc.createElement('div');group.className='output-selection-group';
bar.insertBefore(group,print);
const tabs=bar.querySelector('.tabs');if(tabs)bar.insertBefore(tabs,group);
const boxes=outputBoxes(doc);
for(const box of [boxes.q,boxes.a]){const item=box?.closest('label');if(item)group.append(item);}
group.append(print);
bar.querySelectorAll('fieldset').forEach(el=>{if(!el.querySelector('input,select,button'))el.remove()});
if(regenerate)bar.prepend(regenerate);
group.append(button);
const css=doc.createElement('style');css.textContent='.output-selection-group{display:inline-flex;align-items:center;flex-wrap:wrap;gap:9px;border:1px solid #218879;border-radius:7px;padding:6px 9px;background:#218879;color:white}.output-selection-group label{display:inline-flex!important;align-items:center;gap:5px;white-space:nowrap}.output-selection-group label{color:white!important}.output-selection-group input{accent-color:#155e51}.output-selection-group #print,.output-selection-group #save-pdf{background:#176e5c!important;color:white!important;border:1px solid #ffffff55!important;border-radius:5px!important;padding:8px 12px!important}.tools{display:flex;align-items:center;flex-wrap:wrap;gap:9px}';doc.head.append(css);
}else print.after(label,button,note);
function info(){const {q,a}=outputBoxes(doc);const n=Math.min(20,Math.max(1,Math.floor(Number(count.value)||1)));const total=n*(Number(!!q?.checked)+Number(!!a?.checked));note.textContent=ko?`PDF 총 ${total}쪽 · 정답지 선택 시 장수가 추가됩니다. (최대 문제지 20장)`:`PDF: ${total} pages including selected answer keys (up to 20 worksheets).`;button.disabled=(!q?.checked&&!a?.checked)||print.disabled||!!win.GDPDFBusy}
count.oninput=info;doc.addEventListener('change',info);new MutationObserver(info).observe(print,{attributes:true,attributeFilter:['disabled']});info();
function library(src,test){if(test())return Promise.resolve();return new Promise((resolve,reject)=>{const s=doc.createElement('script');s.src=src;s.onload=()=>test()?resolve():reject(Error('Library failed'));s.onerror=()=>{s.remove();reject(Error('Download library failed'))};doc.head.append(s)})}
button.onclick=async()=>{if(!count.reportValidity())return;win.GDPDFBusy=true;button.disabled=true;const status=doc.getElementById('status');const controls=[...doc.querySelectorAll('button,input,select')].map(el=>[el,el.disabled]);let stage;const resources=[];try{if(preparePDF(win)===false)throw Error('Choose print materials');controls.forEach(([el])=>el.disabled=true);await Promise.all([library('/vendor/html2canvas.min.js',()=>win.html2canvas),library('/vendor/jspdf.umd.min.js',()=>win.jspdf)]);await doc.fonts.ready;for(const el of doc.querySelectorAll('link[href],img[src]')){const attr=el.tagName==='LINK'?'href':'src',value=el.getAttribute(attr);if(value&&!/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(value)){resources.push([el,attr,value]);el.setAttribute(attr,new URL(value,doc.baseURI).href);}}const pages=[...(doc.getElementById('print-bundle')||doc.getElementById('print-root')).querySelectorAll('.sheet,.paper')];if(!pages.length)throw Error('No pages');const letter=doc.getElementById('paper')?.value==='Letter',pw=letter?215.9:210,ph=letter?279.4:297,pdf=new win.jspdf.jsPDF({unit:'mm',format:letter?'letter':'a4',compress:true});stage=doc.createElement('div');stage.style.cssText='position:absolute;left:-12000px;top:0;background:white;';doc.body.append(stage);
for(let i=0;i<pages.length;i++){if(status)status.textContent=ko?`PDF 만드는 중 ${i+1}/${pages.length}`:`Creating PDF ${i+1}/${pages.length}`;const page=pages[i].cloneNode(true);page.style.setProperty('transform','none','important');page.style.setProperty('zoom','1','important');page.style.setProperty('margin','0','important');page.style.setProperty('box-sizing','border-box','important');page.style.setProperty('min-height','0','important');page.style.setProperty('box-shadow','none','important');if(!ko){page.style.width=pw+'mm';page.style.height=(ph-1)+'mm'}stage.replaceChildren(page);await Promise.all([...page.querySelectorAll('img')].map(async img=>{await img.decode();if(/\.svg(?:[?#]|$)/i.test(img.src)){const raster=doc.createElement('canvas');raster.width=Math.max(100,img.naturalWidth||img.width)*2;raster.height=Math.max(100,img.naturalHeight||img.height)*2;raster.getContext('2d').drawImage(img,0,0,raster.width,raster.height);img.src=raster.toDataURL('image/png');await img.decode()}}));const canvas=await win.html2canvas(page,{scale:2,backgroundColor:'#ffffff',useCORS:true,logging:false,windowWidth:1280,height:Math.max(page.scrollHeight,page.offsetHeight)});const width=Math.min(ko?Math.min(190,pw-20):pw,(ph-(ko?20:0))*canvas.width/canvas.height),height=canvas.height/canvas.width*width;if(i)pdf.addPage();pdf.addImage(canvas.toDataURL('image/jpeg',.95),'JPEG',(pw-width)/2,ko?10:0,width,height);canvas.width=canvas.height=1}
pdf.save('googoodan-'+Date.now()+'.pdf');if(status)status.textContent=ko?`PDF ${pages.length}쪽 저장 완료`:`Saved PDF: ${pages.length} pages`;
}catch(error){console.error(error);if(status)status.textContent=ko?'PDF 저장에 실패했습니다. 장수를 줄이거나 다시 시도해 주세요.':'PDF could not be saved. Try fewer pages or retry.'}finally{stage?.remove();for(const [el,attr,value]of resources)el.setAttribute(attr,value);win.GDPDFBusy=false;controls.forEach(([el,disabled])=>el.disabled=disabled);info()}};
}
const seen=new WeakSet,observed=new WeakSet;function scan(win){try{const doc=win.document;install(win);if(!observed.has(doc)){observed.add(doc);new win.MutationObserver(()=>scan(win)).observe(doc.documentElement,{childList:true,subtree:true})}doc.querySelectorAll('iframe').forEach(frame=>{if(seen.has(frame))return;seen.add(frame);const run=()=>{try{scan(frame.contentWindow)}catch{}};frame.addEventListener('load',run);run()})}catch{}}scan(window);
})();



;(()=>{if(!document.querySelector('script[data-gd-metrics-loader]')){const s=document.createElement('script');s.dataset.gdMetricsLoader='1';s.src='/assets/site-metrics.js?v=2-20261007';document.head.append(s)}})();
