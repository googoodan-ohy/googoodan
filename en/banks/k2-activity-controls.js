(() => {
  const def=K2Activities.definitions.find(item=>item.id===current.id);
  if(!def)return;
  const paper=document.querySelector('.paper');
  paper.classList.add('k2-activity-sheet','k2-'+def.id);
  if(def.methods.length<2)return;
  const params=new URLSearchParams(location.search),requested=params.get('activity');
  const initial=def.methods.includes(requested)?requested:'all';
  K2Activities.select(initial);
  const label=document.createElement('label');
  label.className='coverage-controls k2-activity-control';
  label.textContent='Activity ';
  const select=document.createElement('select');
  select.id='k2-activity';
  for(const [value,text] of [['all','Mixed activity sheet'],...def.methods.map(method=>[method,K2Activities.labels[method]])]){
    const option=document.createElement('option');option.value=value;option.textContent=text;option.selected=value===initial;select.append(option);
  }
  select.onchange=()=>{
    K2Activities.select(select.value);
    const next=new URL(location.href);
    if(select.value==='all')next.searchParams.delete('activity');else next.searchParams.set('activity',select.value);
    history.replaceState(null,'',next.pathname+next.search);
    render();
  };
  label.append(select);
  document.querySelector('.toolbar').before(label);
})();
