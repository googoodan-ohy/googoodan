(()=>{'use strict';
const data=window.USGradeUnits,el=id=>document.getElementById(id),previousRender=render;
let selectedGrade='K',selectedCode='K.OA.A.1';
const flatten=nodes=>nodes.flatMap(n=>[n,...flatten(n.standards||n.children||[])]);
const all=flatten(data.flatMap(d=>d.units));
function showNode(u){
 selectedCode=u.code;selectedGrade=u.code.split('.')[0];
 show(u.officialText?u.code:u.title,[],'Math Worksheets / '+(selectedGrade==='K'?'Kindergarten':'Grade '+selectedGrade)+' / '+u.code,u.officialText||u.title);
 el('group-title').textContent='Related arithmetic practice · '+u.items.length;
 for(const [i,t] of u.items.entries()){
  const b=document.createElement('button');b.className='row';b.dataset.sheetUrl=t.url;
  const n=document.createElement('span');n.className='number';n.textContent=String(i+1);
  const text=document.createElement('span'),title=document.createElement('b'),detail=document.createElement('small');
  title.textContent=t.title;detail.textContent=t.concept||t.unit||'';text.append(title,detail);b.append(n,text);b.onclick=()=>window.openUSWorksheet(t.url,t.title);el('rows').append(b);
 }
 if(!u.items.length){const note=document.createElement('p');note.textContent='No matching arithmetic worksheet is currently linked to this standard.';el('rows').append(note)}
 el('explain').replaceChildren();const note=document.createElement('span');note.textContent=(u.practiceLimit?u.practiceLimit+' ':'')+'The text above is the Common Core standard. The materials below practice related arithmetic skills; they do not necessarily cover the entire standard. ';
 const link=document.createElement('a');link.href=u.source;link.target='_blank';link.rel='noopener';link.textContent='View official source';el('explain').append(note,link);
 document.querySelectorAll('#sidebar [data-standard-code]').forEach(x=>x.classList.toggle('selected',x.dataset.standardCode===u.code));
}
function nodeMenu(u,level){
 const children=u.standards||u.children||[];
 if(!children.length){const b=document.createElement('button');b.className='leaf';b.title=u.code;b.dataset.standardCode=u.code;b.textContent=u.code+' · '+u.title;b.onclick=()=>showNode(u);return b}
 const group=document.createElement('details');group.className=level===0?'grade-cluster':'standard-group';group.open=selectedCode===u.code||flatten(children).some(x=>x.code===selectedCode);
 const summary=document.createElement('summary');summary.textContent=u.code+' · '+u.title;summary.title=u.code;if(level>0)summary.dataset.standardCode=u.code;
 summary.onclick=e=>{e.preventDefault();const opening=!group.open;for(const sibling of group.parentElement.children){if(sibling!==group&&sibling.tagName==='DETAILS'){sibling.open=false;sibling.querySelectorAll('details').forEach(d=>d.open=false)}}group.open=opening;if(opening)showNode(u)};
 const list=document.createElement('div');list.className='standard-list';for(const child of children)list.append(nodeMenu(child,level+1));group.append(summary,list);return group;
}
render=function(){previousRender();if(mode!=='worksheets')return;el('sidebar').replaceChildren();el('panel-title').textContent='Browse by Grade';
 for(const g of ['K','1','2','3','4','5','6']){
 const section=document.createElement('details');section.className='grade-section';section.open=g===selectedGrade;
 const summary=document.createElement('summary');summary.textContent=g==='K'?'Kindergarten':'Grade '+g;
 summary.onclick=e=>{e.preventDefault();const opening=!section.open;el('sidebar').querySelectorAll('.grade-section').forEach(other=>{if(other!==section||!opening){other.open=false;other.querySelectorAll('details').forEach(d=>d.open=false)}});section.open=opening;if(opening)selectedGrade=g};section.append(summary);
 for(const d of data.filter(x=>x.grade===g)){
 const domain=document.createElement('details');domain.className='grade-domain';domain.open=flatten(d.units).some(x=>x.code===selectedCode);
 const h=document.createElement('summary');h.textContent=d.title;h.onclick=e=>{e.preventDefault();const opening=!domain.open;el('sidebar').querySelectorAll('.grade-domain').forEach(other=>{if(other!==domain||!opening){other.open=false;other.querySelectorAll('details').forEach(x=>x.open=false)}});domain.open=opening};
 const sub=document.createElement('div');sub.className='sub';d.units.forEach(u=>sub.append(nodeMenu(u,0)));domain.append(h,sub);section.append(domain);
 }el('sidebar').append(section);
 }showNode(all.find(u=>u.code===selectedCode)||all[0]);
};document.querySelector('[data-mode=worksheets]').onclick=()=>{mode='worksheets';render()};render();
})();
(()=>{const style=document.createElement('style');style.id='grade-menu-contrast';style.textContent=`
#sidebar .grade-section{margin:10px 0;border:1px solid #baccc5;border-radius:9px;overflow:hidden}
#sidebar .grade-section>summary{background:#e5ece9;color:#183e36;font-size:17px;font-weight:800;padding:13px 14px;border-radius:0;line-height:1.35}
#sidebar .grade-section[open]>summary{background:#176e5c;color:#fff;border-bottom:3px solid #ed9b61}
#sidebar .grade-domain{margin:0;padding:7px 8px;border-bottom:1px solid #dce5e1;background:#fff}
#sidebar .grade-domain:last-child{border-bottom:0}
#sidebar .grade-domain>summary{background:#edf2fa;color:#244b78;font-size:14px;font-weight:700;line-height:1.5;padding:10px;border-left:3px solid #698db7;border-radius:4px;gap:8px}
#sidebar .grade-domain[open]>summary{background:#e2ebf7;color:#173d68}
#sidebar .grade-domain .sub{margin:8px 0 4px 7px;padding-left:7px;border-left:1px solid #ccd6df}
#sidebar .grade-domain .leaf{background:white;color:#34434a;font-size:14px;font-weight:400;line-height:1.55;padding:10px 9px;margin:3px 0;border-bottom:1px solid #edf0f2;border-radius:4px}
#sidebar .grade-domain .leaf:hover{background:#fff3e5;color:#653c14}
#sidebar .grade-domain .leaf.selected{background:#fff0dc;color:#713e0d;font-weight:700;box-shadow:inset 3px 0 #e58b3d}
`;document.head.append(style)})();

(()=>{const s=document.createElement("style");s.textContent="#sidebar .grade-cluster>summary{padding:10px;background:#fff0dc;color:#713e0d;font-size:14px;line-height:1.5}#sidebar .standard-list{margin-left:8px;border-left:2px solid #d7e3dd;padding-left:6px}";document.head.append(s)})();

(()=>{const s=document.createElement('style');s.textContent='#sidebar .standard-group>summary{padding:10px 8px;background:#f4f7fa;line-height:1.55;font-size:14px;color:#304956}#sidebar [data-standard-code]{white-space:normal;overflow-wrap:anywhere}#sidebar summary.selected{background:#fff0dc;color:#713e0d}#sidebar .standard-list{margin-left:6px;padding-left:6px}';document.head.append(s)})();
