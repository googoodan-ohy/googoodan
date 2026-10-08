(()=>{'use strict';
const sidebar=document.getElementById('sidebar');if(!sidebar)return;
const official=new Map();function index(nodes){for(const node of nodes||[]){if(node.code)official.set(node.code,node.officialText||node.title);index(node.standards||node.children)}}for(const domain of window.USGradeUnits||[])index(domain.units);
const selector='.grade-section>summary,.grade-domain>summary,.grade-cluster>summary,.standard-group>summary,.grade-domain .leaf,.code-suggestions .leaf';
const style=document.createElement('style');style.textContent=`
#sidebar .compact-menu-item{display:flex;align-items:flex-start;gap:6px;min-width:0;white-space:normal;overflow-wrap:anywhere;line-height:1.4}
#sidebar .compact-menu-item .menu-code{flex:none;font-weight:700}
#sidebar .compact-menu-item .menu-caption{min-width:0;flex:1;overflow:visible;text-overflow:clip;white-space:normal;overflow-wrap:anywhere}
#sidebar .compact-menu-item:after{flex:none;margin-left:auto}
#sidebar .grade-domain .compact-menu-item{font-size:12.5px;align-items:center;white-space:nowrap;overflow:hidden}
#sidebar .grade-domain .compact-menu-item .menu-caption{white-space:nowrap;overflow:hidden;text-overflow:clip}
#sidebar .topic-section>summary.compact-menu-item{font-size:14px;font-weight:650;line-height:1.35}
.curriculum-menu-tooltip{position:fixed;z-index:10000;width:360px;max-width:calc(100vw - 24px);max-height:calc(100vh - 24px);overflow:auto;padding:16px 18px;background:#fff;border:1px solid #c7d9d0;border-left:4px solid #176e5c;border-radius:10px;box-shadow:0 8px 28px #153d3026;color:#294c43;font:14px/1.65 Arial,sans-serif;overflow-wrap:anywhere}
.curriculum-menu-tooltip[hidden]{display:none}
.curriculum-menu-tooltip strong{display:block;color:#176e5c;font-size:15px;margin-bottom:5px}
`;document.head.append(style);
const tip=document.createElement('div');tip.id='curriculum-menu-tooltip';tip.className='curriculum-menu-tooltip';tip.setAttribute('role','tooltip');tip.hidden=true;document.body.append(tip);
let anchor=null,hideTimer;
function hide(){clearTimeout(hideTimer);if(anchor){anchor.removeAttribute('aria-describedby');anchor=null}tip.hidden=true}
function scheduleHide(){clearTimeout(hideTimer);hideTimer=setTimeout(hide,120)}
function position(){if(!anchor)return;const r=anchor.getBoundingClientRect(),aside=sidebar.closest('aside'),clip=aside.getBoundingClientRect();if(!anchor.isConnected||r.bottom<Math.max(0,clip.top)||r.top>Math.min(innerHeight,clip.bottom)){hide();return}tip.style.left='12px';tip.style.top='12px';const w=tip.offsetWidth,h=tip.offsetHeight;let left=r.right+10;if(left+w>innerWidth-12)left=r.left-w-10;if(left<12)left=Math.max(12,Math.min(innerWidth-w-12,r.left));tip.style.left=left+'px';tip.style.top=Math.max(12,Math.min(innerHeight-h-12,r.top))+'px'}
function show(item){clearTimeout(hideTimer);if(anchor!==item)hide();anchor=item;tip.replaceChildren();const code=item.dataset.menuCode;if(code){const title=document.createElement('strong');title.textContent=code;tip.append(title)}const content=document.createElement('div');content.textContent=item.dataset.menuFull;tip.append(content);item.setAttribute('aria-describedby',tip.id);tip.hidden=false;position()}
function shortCaption(value){let text=value.replace(/\s+/g,' ').trim().replace(/addition and subtraction/gi,'add & subtract').replace(/multiplication and division/gi,'multiply & divide').replace(/one- and two-step/gi,'one/two-step');const words=text.split(' ');let caption='';for(const word of words){const next=caption?caption+' '+word:word;if(next.length>25&&caption)break;caption=next}return caption||text}
function enhance(){sidebar.querySelectorAll(selector).forEach(item=>{if(item.classList.contains('compact-menu-item'))return;const original=item.textContent.trim();const match=original.match(/^([K1-6]\.[A-Z]+(?:\.[A-Z0-9a-z]+)*)\s*·\s*(.*)$/s);item.dataset.menuFull=match?(official.get(match[1])||match[2]):original;item.dataset.menuCode=match?match[1]:'';item.setAttribute('aria-label',original);item.removeAttribute('title');item.classList.add('compact-menu-item');item.replaceChildren();if(match){const code=document.createElement('span');code.className='menu-code';code.textContent=match[1];item.append(code)}const caption=document.createElement('span');caption.className='menu-caption';caption.textContent=match&&item.closest('.grade-domain')?shortCaption(match[2]):match?match[2]:original;item.append(caption);item.addEventListener('pointerenter',()=>show(item));item.addEventListener('pointerleave',scheduleHide);item.addEventListener('focus',()=>show(item));item.addEventListener('blur',scheduleHide);item.addEventListener('click',hide)});if(anchor&&!anchor.isConnected)hide()}
tip.addEventListener('pointerenter',()=>clearTimeout(hideTimer));tip.addEventListener('pointerleave',scheduleHide);document.addEventListener('keydown',e=>{if(e.key==='Escape')hide()});document.addEventListener('scroll',position,true);window.addEventListener('resize',position);enhance();new MutationObserver(enhance).observe(sidebar,{childList:true,subtree:true});
})();
