(()=>{
const bar=document.querySelector('.toolbar'),n=document.getElementById('new-button'),p=document.getElementById('problem-button'),a=document.getElementById('answer-button'),printButton=document.getElementById('print-button');
bar.querySelectorAll('a').forEach(a=>a.remove());n.id='new';n.textContent='↻ 숫자변환';p.textContent='문제지';a.textContent='정답지';printButton.id='print';printButton.textContent='인쇄';
for(const [id,label,checked] of [['print-q','문제지',true],['print-a','정답지',false]]){const l=document.createElement('label'),c=document.createElement('input');c.type='checkbox';c.id=id;c.checked=checked;l.append(c,document.createTextNode(label));bar.insertBefore(l,printButton);}
const q=document.getElementById('print-q'),ans=document.getElementById('print-a');
function sync(){document.body.dataset.printQ=q.checked;document.body.dataset.printA=ans.checked;printButton.disabled=!q.checked&&!ans.checked;}
q.onchange=ans.onchange=sync;sync();printButton.onclick=()=>{sync();if(!printButton.disabled)window.print()};
function view(answer){document.body.className=answer?'view-answer':'view-problem';p.setAttribute('aria-pressed',String(!answer));a.setAttribute('aria-pressed',String(answer));}
p.onclick=()=>view(false);a.onclick=()=>view(true);view(document.body.classList.contains('view-answer'));
window.GDPreparePDF=()=>{if(!q.checked&&!ans.checked)return false;let bundle=document.getElementById('print-bundle');if(!bundle){bundle=document.createElement('div');bundle.id='print-bundle';bundle.hidden=true;document.body.append(bundle);}bundle.replaceChildren();for(const [enabled,cls]of [[q.checked,'.problem-page'],[ans.checked,'.answer-page']])if(enabled){const page=document.querySelector('#sheet-root '+cls).cloneNode(true);page.classList.add('paper');page.style.setProperty('display','flex','important');bundle.append(page);}return true;};
const style=document.createElement('style');style.textContent='.toolbar button{cursor:pointer;border-radius:6px;padding:9px 12px}.toolbar #new{background:#1764bd;color:white;border-color:#1764bd}.toolbar button[aria-pressed="true"]{background:#218879;color:white}.toolbar label{font-size:12px}@media print{body[data-print-q="false"] #sheet-root .problem-page,body[data-print-a="false"] #sheet-root .answer-page,#print-bundle,#status{display:none!important}}';document.head.append(style);
})();
