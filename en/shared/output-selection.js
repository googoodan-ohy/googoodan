/* Preview follows output selection; keep both-sheet printing available. */
(()=>{
function install(){
 const q=document.querySelector('#print-worksheet,#print-q'),a=document.querySelector('#print-answer,#print-a');
 const qt=document.querySelector('#questions,#worksheet'),at=document.querySelector('#answers,#answer'),print=document.querySelector('#print');
 if(!q||!a||!qt||!at||!print)return;
 const style=document.createElement('style');
 style.textContent='@media print{body.printing-bundle #print-bundle>.grade-sheet+.grade-sheet{break-before:page;page-break-before:always}}';document.head.append(style);
 let syncing=false;
 function availability(){print.disabled=!q.checked&&!a.checked;const pdf=document.querySelector('#save-pdf');if(pdf)pdf.disabled=print.disabled||!!window.GDPDFBusy;}
 function clear(){document.querySelector('#print-bundle')?.replaceChildren();document.body.classList.remove('printing-bundle');}
 function fromSelection(){
  if(syncing)return;const wantQ=q.checked,wantA=a.checked;syncing=true;
  try{if(wantQ||wantA)(wantA?at:qt).click();}finally{q.checked=wantQ;a.checked=wantA;syncing=false;clear();availability();}
 }
 for(const [tab,answer]of [[qt,false],[at,true]])tab.addEventListener('click',()=>{
  if(syncing)return;q.checked=!answer;a.checked=answer;clear();availability();
 },true);
 q.addEventListener('change',fromSelection);a.addEventListener('change',fromSelection);
 // Browser Print / Save as PDF must use the same selection as the PDF button.
 window.addEventListener('beforeprint',()=>{
  if(window.GDTimes?.chartActive)return;
  if(typeof window.GDPreparePDF==='function'){
   window.GDPreparePDF();const bundle=document.querySelector('#print-bundle');
   if(bundle?.children.length)document.body.classList.add('printing-bundle');
  }
 });
 window.addEventListener('afterprint',clear);fromSelection();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();
