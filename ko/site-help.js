(function(){
'use strict';
function ready(){
 const toolbar=document.querySelector('.toolbar');if(!toolbar||document.getElementById('gd-report-open'))return;
 if(window.KoPreview){const params=()=>({worksheet_id:window.GDWorksheetContext?.().unit+'-'+window.GDWorksheetContext?.().sheet,edition:'ko'});window.GDAnalytics?.track('worksheet_view',params());for(const [id,event]of [['print','worksheet_print_click'],['answer','worksheet_answer_view']])document.getElementById(id)?.addEventListener('click',()=>window.GDAnalytics?.track(event,params()));}
 const row=document.createElement('div');row.className='gd-support';row.innerHTML='<a href="/ko/help.html">처음 이용하시나요?</a><button type="button" id="gd-report-open">오류 제보</button>';toolbar.after(row);
 const dialog=document.createElement('dialog');dialog.className='gd-report';dialog.setAttribute('aria-labelledby','gd-report-title');dialog.innerHTML='<h2 id="gd-report-title">문제 오류 제보</h2><p>문항 번호와 이상한 부분을 적어 주세요. 준비된 내용을 복사하거나 이메일 앱으로 열 수 있습니다. 자동으로 전송되지 않습니다.</p><label for="gd-report-text">제보 내용</label><textarea id="gd-report-text"></textarea><p>학생 이름·학교·연락처·비밀번호는 적지 마세요. 그림이나 배치 문제는 개인정보를 가린 화면을 이메일에 첨부해 주세요.</p><div class="gd-support"><button type="button" id="gd-report-copy">내용 복사</button><a id="gd-report-mail" href="mailto:ohy0973@gmail.com">이메일로 작성</a><button type="button" id="gd-report-close">닫기</button></div><p id="gd-report-status" role="status"></p><small>보낼 주소: ohy0973@gmail.com</small>';document.body.append(dialog);
 const input=dialog.querySelector('textarea'),mail=dialog.querySelector('#gd-report-mail'),status=dialog.querySelector('#gd-report-status');
 function sync(){mail.href='mailto:ohy0973@gmail.com?subject='+encodeURIComponent('[구구단닷컴] 문제 오류 제보')+'&body='+encodeURIComponent(input.value.slice(0,1800));}
 row.querySelector('button').onclick=()=>{
  let details={};try{details=window.GDWorksheetContext?.()||{};}catch{}
  const url=new URL(location.pathname,location.origin);for(const [k,v]of Object.entries(details))if(['type','unit','grade','semester','sheet','drill','set','tables'].includes(k))url.searchParams.set(k,String(v));
  const marker=document.querySelector('#set,.sheet-footer span')?.textContent||'';
  input.value='문항 번호: \n이상한 부분: \n\n문제지: '+document.title+'\n주소: '+url.href+'\n문제지 번호: '+marker+'\n설정: '+JSON.stringify(details);
  status.textContent='내용을 확인한 뒤 보내 주세요. 이메일 앱이 열리지 않으면 내용을 복사해 Gmail 등에 붙여 넣으세요.';sync();dialog.showModal();input.focus();input.setSelectionRange(7,7);
 };
 input.addEventListener('input',sync);
 dialog.querySelector('#gd-report-copy').onclick=async()=>{let ok=false;try{await navigator.clipboard.writeText(input.value);ok=true;}catch{input.focus();input.select();try{ok=document.execCommand('copy');}catch{}}status.textContent=ok?'복사했습니다. 이메일 본문에 붙여 넣어 보내 주세요.':'내용을 선택했습니다. 기기의 복사 기능으로 복사해 주세요.';};
 mail.addEventListener('click',()=>{sync();status.textContent='이메일 앱에서 직접 전송해 주세요. 긴 내용은 ‘내용 복사’로 전체를 붙여 넣으세요.';});
 dialog.querySelector('#gd-report-close').onclick=()=>dialog.close();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready);else ready();
})();
