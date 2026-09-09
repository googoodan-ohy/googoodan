(function(){
'use strict';
function ready(){
 const toolbar=document.querySelector('.toolbar,.tools');if(!toolbar||document.getElementById('en-report-open'))return;
 if(window.KoPreview){const params=()=>({worksheet_id:window.GDWorksheetContext?.().unit+'-'+window.GDWorksheetContext?.().sheet,edition:'en'});window.GDAnalytics?.track('worksheet_view',params());for(const [id,event]of [['print','worksheet_print_click'],['answer','worksheet_answer_view']])document.getElementById(id)?.addEventListener('click',()=>window.GDAnalytics?.track(event,params()));}
 if(document.getElementById('sheet')&&!document.getElementById('print-q')){const choice=document.createElement('fieldset');choice.innerHTML='<legend>Print selection</legend><label><input type="checkbox" id="print-q" checked> Worksheet</label> <label><input type="checkbox" id="print-a"> Answer key</label>';toolbar.append(choice);const sync=()=>{document.getElementById('print').disabled=!document.getElementById('print-q').checked&&!document.getElementById('print-a').checked;};choice.addEventListener('change',sync);sync();}
 const row=document.createElement('div');row.className='en-support';row.innerHTML='<a href="/en/help.html">How to use</a><button type="button" id="en-report-open">Report an issue</button>';toolbar.after(row);
 const dialog=document.createElement('dialog');dialog.className='en-report';dialog.setAttribute('aria-labelledby','en-report-title');dialog.innerHTML='<h2 id="en-report-title">Report a worksheet issue</h2><p>Enter the question number and describe the issue. Copy the prepared message or open it in your email app. Nothing is sent automatically.</p><label for="en-report-text">Message</label><textarea id="en-report-text"></textarea><p>Do not include student names, schools, contact details, or passwords. For diagram or layout issues, attach a screenshot with personal information removed.</p><div class="en-support"><button type="button" id="en-report-copy">Copy message</button><a id="en-report-mail" href="mailto:ohy0973@gmail.com">Open email</a><button type="button" id="en-report-close">Close</button></div><p id="en-report-status" role="status"></p><small>Email: ohy0973@gmail.com</small>';document.body.append(dialog);
 const input=dialog.querySelector('textarea'),mail=dialog.querySelector('#en-report-mail'),status=dialog.querySelector('#en-report-status');
 function sync(){mail.href='mailto:ohy0973@gmail.com?subject='+encodeURIComponent('[구구단닷컴] Report a worksheet issue')+'&body='+encodeURIComponent(input.value.slice(0,1800));}
 row.querySelector('button').onclick=()=>{
  let details={};try{details=window.GDWorksheetContext?.()||{};}catch{}
  const url=new URL(location.pathname,location.origin);for(const [k,v]of Object.entries(details))if(['type','unit','grade','semester','sheet','drill','set','tables'].includes(k))url.searchParams.set(k,String(v));
  const marker=document.querySelector('#set,.sheet-footer span')?.textContent||'';
  input.value='Question number: \nIssue: \n\nWorksheet: '+document.title+'\nURL: '+url.href+'\nSet details: '+marker+'\nSettings: '+JSON.stringify(details);
  status.textContent='Review the message before sending. If no email app opens, copy it into Gmail or your usual email service.';sync();dialog.showModal();input.focus();input.setSelectionRange(7,7);
 };
 input.addEventListener('input',sync);
 dialog.querySelector('#en-report-copy').onclick=async()=>{let ok=false;try{await navigator.clipboard.writeText(input.value);ok=true;}catch{input.focus();input.select();try{ok=document.execCommand('copy');}catch{}}status.textContent=ok?'Copied. Paste into your email and send it.':'Message selected. Use your device’s Copy command.';};
 mail.addEventListener('click',()=>{sync();status.textContent='Send from your email app. For long messages, use Copy message and paste the full text.';});
 dialog.querySelector('#en-report-close').onclick=()=>dialog.close();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready);else ready();
})();
