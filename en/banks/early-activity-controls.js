(() => {
  const def=EarlyActivities.definitions.find(d=>d[0]===current.id);if(!def)return;
  document.querySelector('.paper').classList.add('early-activity-sheet');
  const label=document.createElement('label');label.className='coverage-controls';label.textContent='Activity ';
  const select=document.createElement('select');select.id='early-activity';
  for(const [value,text]of [['all','Mixed activity sheet'],...def[2].map(m=>[m,EarlyActivities.labels[m]])]){const option=document.createElement('option');option.value=value;option.textContent=text;select.append(option);}
  select.onchange=()=>{EarlyActivities.select(select.value);render();};label.append(select);document.querySelector('.toolbar').before(label);
})();
