(() => {
  const def=CoveragePractice.definitions.find(d=>d[0]===current.id);
  if(!def)return;
  const label=document.createElement('label');label.className='coverage-controls';
  label.textContent='Practice type ';
  const select=document.createElement('select');select.id='coverage-skill';
  for(const [value,text] of [['all','All available skills'],...def[3].map(s=>[s,CoveragePractice.names[s]])]){
    const option=document.createElement('option');option.value=value;option.textContent=text;select.append(option);
  }
  label.append(select);document.querySelector('.toolbar').before(label);
  select.onchange=()=>{CoveragePractice.setSkill(select.value);render();};
})();
