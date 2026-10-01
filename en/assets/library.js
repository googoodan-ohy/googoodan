(function(){
const config=JSON.parse(document.getElementById('library-config').textContent);
const mode=document.body.dataset.menu==='grade'?'grade':'topic';
const select=document.getElementById('library-select'),unit=document.getElementById('library-unit'),category=document.getElementById('library-category');
const matches=(t,op,cat)=>(t.operations||[]).includes(op)&&(!cat||t.category===cat);
function markMenu(operation,cat){document.querySelectorAll('.operation-menu').forEach(menu=>{menu.open=menu.dataset.operation===operation;menu.querySelectorAll('a[data-category]').forEach(a=>{if(menu.dataset.operation===operation&&a.dataset.category===cat)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current');});});}
function refresh(){
 const group=select.value;
 if(mode==='grade'){
  const options=config.units.filter(x=>String(x.grade)===group),prior=unit.value;
  unit.replaceChildren(...options.map(x=>new Option(x.title,x.id)));if(options.some(x=>x.id===prior))unit.value=prior;
 }else{
  const prior=category.value;
  category.replaceChildren(new Option('All worksheet types',''),...config.categories.filter(c=>config.types.some(t=>matches(t,group,c.id))).map(c=>new Option(c.label,c.id)));
  if([...category.options].some(o=>o.value===prior))category.value=prior;
 }
 const chosen=mode==='grade'?config.types.filter(x=>config.units.find(u=>String(u.grade)===group&&u.id===unit.value)?.types.includes(x.id)):config.types.filter(x=>matches(x,group,category.value));
 document.querySelectorAll('[data-type-id]').forEach(el=>{el.hidden=!chosen.some(t=>t.id===el.dataset.typeId);});
 document.querySelectorAll('.library-block').forEach(el=>{el.hidden=(mode==='grade'&&(el.dataset.grade!==group||el.dataset.unit!==unit.value))||![...el.querySelectorAll('[data-type-id]')].some(x=>!x.hidden);});
 document.getElementById('selection-count').textContent=`${chosen.length} worksheet ${chosen.length===1?'type':'types'} available.`;
 const url=new URL(location.href);url.searchParams.set(mode,group);if(mode==='grade')url.searchParams.set('unit',unit.value);else{url.searchParams.delete('unit');if(category.value)url.searchParams.set('category',category.value);else url.searchParams.delete('category');markMenu(group,category.value);}history.replaceState(null,'',url);
}
if(select){const url=new URL(location.href),v=mode==='grade'&&['K','k','kindergarten'].includes(url.searchParams.get(mode))?'0':url.searchParams.get(mode);if(mode==='topic'&&v==='Fractions'){location.replace('/en/fraction-worksheets.html');return;}if([...select.options].some(x=>x.value===v))select.value=v;if(category&&[...category.options].some(x=>x.value===url.searchParams.get('category')))category.value=url.searchParams.get('category');refresh();if(mode==='grade'&&[...unit.options].some(x=>x.value===url.searchParams.get('unit'))){unit.value=url.searchParams.get('unit');refresh();}select.onchange=refresh;if(unit)unit.onchange=refresh;if(category)category.onchange=refresh;}
const operationPage=document.querySelector('[data-operation-page]'),operationCategory=document.getElementById('operation-category');
if(operationPage&&operationCategory){
 const apply=()=>{let cat=location.hash.startsWith('#category-')?location.hash.slice(10):'';if(![...operationCategory.options].some(o=>o.value===cat&&!o.disabled))cat='';operationCategory.value=cat;document.querySelectorAll('.topic-category-section').forEach(s=>s.hidden=!!cat&&s.dataset.category!==cat);markMenu(operationPage.dataset.operationPage,cat);};
 operationCategory.onchange=()=>{const cat=operationCategory.value;history.replaceState(null,'',location.pathname+location.search+(cat?'#category-'+cat:''));apply();};window.addEventListener('hashchange',apply);apply();
}
const mobile=window.matchMedia('(max-width:760px)');if(mobile.matches)document.querySelector('.browse').open=false;
})();
