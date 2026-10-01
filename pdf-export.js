(()=>{
 const en=document.documentElement.lang.startsWith("en")||location.pathname.startsWith("/en/");
 const loads=new Map();function load(src){if(!loads.has(src))loads.set(src,new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=()=>reject(Error((en?"Could not load the PDF tools.":"PDF 도구를 불러오지 못했습니다.")));document.head.append(s);}));return loads.get(src);}
 window.saveWorksheetPDF=async function(button){
  if(button.disabled||window.GDPDFBusy)return;window.GDPDFBusy=true;let handle,frame;const original=button.textContent;
  const track=name=>{let c={};try{c=window.GDWorksheetContext?.()||{};}catch{}window.GDAnalytics?.track(name,{edition:en?'en':'ko',worksheet_id:c.drill||c.unit||c.type||location.pathname});};track('worksheet_pdf_click');
  const filename=(document.querySelector('#sheet-title,#profile-name')?.textContent||document.title).replace(/[\\/:*?"<>|]/g,' ').slice(0,90)+'.pdf';
  try{
   if('showSaveFilePicker' in window){try{handle=await window.showSaveFilePicker({suggestedName:filename,types:[{description:(en?"PDF document":"PDF 문서"),accept:{'application/pdf':['.pdf']}}]});}catch(e){if(e.name==='AbortError'){track('worksheet_pdf_cancel');return;}if(e.name!=='SecurityError'&&e.name!=='NotAllowedError')throw e;}}
   button.disabled=true;button.textContent=(en?"Preparing PDF…":"PDF 준비 중…");
   if(typeof window.GDPreparePDF!=='function')throw Error((en?"PDF saving is not available on this page yet.":"이 화면은 아직 PDF 저장 준비 중입니다."));
   window.GDPreparePDF();const bundle=document.querySelector('#print-bundle');if(!bundle?.children.length)throw Error((en?"Select worksheets or answer sheets to save.":"저장할 문제지 또는 정답지를 선택해 주세요."));
   await Promise.all([load('/vendor/html2canvas.min.js'),load('/vendor/jspdf.umd.min.js')]);
   const css=await Promise.all([...document.querySelectorAll('link[rel=stylesheet]')].map(async link=>{const r=await fetch(link.href);if(!r.ok)throw Error((en?"Could not load the worksheet styles.":"문제지 스타일을 불러오지 못했습니다."));return (await r.text()).replace(/url\((?!["']?(?:data:|https?:|\/|#))(["']?)([^)'" ]+)\1\)/g,(_,q,url)=>'url("'+new URL(url,link.href).href+'")');}));
   const styles=[...css,...[...document.querySelectorAll('style')].map(s=>s.textContent)].join('\n').replace(/@media\s+screen/gi,'@media not all').replace(/@media\s+print/gi,'@media all');
   frame=document.createElement('iframe');frame.setAttribute('aria-hidden','true');frame.style.cssText='position:fixed;left:-20000px;top:0;width:1280px;height:1200px;border:0;pointer-events:none';document.body.append(frame);
   const doc=frame.contentDocument;doc.open();doc.write('<!doctype html><html lang="'+(en?'en':'ko')+'"><head><base href="'+document.baseURI+'"><style>'+styles+'</style><style>body.printing-bundle>:not(#print-bundle){display:block!important}html,body{margin:0!important;padding:0!important;background:white!important}#print-bundle{display:block!important}.paper,.sheet{zoom:1!important;transform:none!important;box-shadow:none!important;margin:0!important}.paper{width:186mm!important}*{animation:none!important;transition:none!important}</style></head><body class="'+document.body.className+' printing-bundle">'+bundle.outerHTML+'</body></html>');doc.close();
   await doc.fonts.ready;await Promise.all([...doc.images].map(img=>img.decode().catch(()=>{})));
   const pages=[...doc.querySelector('#print-bundle').children];const pdf=new jspdf.jsPDF({unit:'mm',format:'a4',compress:true});
   for(let i=0;i<pages.length;i++){
    button.textContent=(en?"Creating PDF ":"PDF 생성 ")+(i+1)+'/'+pages.length;
    pages[i].style.setProperty('display','flex','important');pages[i].style.setProperty('visibility','visible','important');
    const canvas=await html2canvas(pages[i],{scale:2,width:Math.ceil(pages[i].getBoundingClientRect().width),height:Math.ceil(pages[i].getBoundingClientRect().height),backgroundColor:'#ffffff',useCORS:true,logging:false,windowWidth:1280,windowHeight:1200});
    if(!canvas.width||!canvas.height)throw Error((en?"Could not determine the PDF page size: ":"PDF 페이지 크기를 계산하지 못했습니다: ")+pages[i].getBoundingClientRect().width+' × '+pages[i].getBoundingClientRect().height);
    if(i)pdf.addPage();const w=Math.min(186,273*canvas.width/canvas.height),h=w*canvas.height/canvas.width;
    pdf.addImage(canvas.toDataURL('image/jpeg',0.94),'JPEG',12,12,w,h);canvas.width=canvas.height=0;
   }
   const blob=pdf.output('blob');if(handle){const stream=await handle.createWritable();await stream.write(blob);await stream.close();}else{const a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);}
   track('worksheet_pdf_ready');
   const msg=document.querySelector('.pdf-save-note');if(msg)msg.textContent=pages.length+(en?" pages prepared as a PDF. Check your downloads or selected location. Each copy contains different problems.":"페이지 PDF 파일을 만들었습니다. 기기의 다운로드·저장 위치를 확인해 주세요. 선택한 매수마다 숫자가 다른 문제가 들어 있습니다.");
  }catch(e){if(e.name!=='AbortError'){track('worksheet_pdf_error');const msg=document.querySelector('.pdf-save-note');if(msg)msg.textContent=(en?"PDF save failed: ":"PDF 저장 실패: ")+e.message;}}
  finally{window.GDPDFBusy=false;frame?.remove();button.disabled=document.querySelector('#print')?.disabled||false;button.textContent=original;}
 };
})();
