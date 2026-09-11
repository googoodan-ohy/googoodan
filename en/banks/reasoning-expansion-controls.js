(() => {
  const def=ReasoningExpansion.defs.find(d=>d[0]===current.id);if(!def)return;
  document.querySelector('.paper').classList.add('reasoning-expansion-sheet');
  const label=document.createElement('label');label.className='coverage-controls';label.textContent='Practice type ';
  const select=document.createElement('select');select.id='reasoning-skill';
  for(const[value,text]of [['all','Mixed practice'],...def[2].map(s=>[s,ReasoningExpansion.labels[s]])]){const o=document.createElement('option');o.value=value;o.textContent=text;select.append(o);}
  label.append(select);document.querySelector('.toolbar').before(label);select.onchange=()=>{ReasoningExpansion.select(select.value);render();};
})();
