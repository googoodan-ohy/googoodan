(() => {
  if(current.id!=='color-by-number')return;
  let operation='add-small';
  const resource=document.querySelector('.seo-resource').innerHTML;
  const baseRender=render;
  const colors=[['Yellow','#fff09a'],['Blue','#b9dffa'],['Green','#c2e4bb'],['Pink','#f7bfd4']];
  render=function(){
    // Use an existing arithmetic type for the unchanged common renderer first.
    const requested=current;current=Worksheets.types.find(t=>t.id===operation);baseRender();current=requested;
    document.querySelector('#sheet-title').textContent=requested.title;
    document.querySelector('#instructions').textContent=requested.instruction;
    document.querySelector('.paper').classList.add('color-sheet');
    document.querySelector('link[rel="canonical"]').href='https://googoodan.com/en/color-by-number.html';
    document.title='Color by Number Math Worksheets | Googoodan';
    const rows=Worksheets.generate(operation,seed,16),step=operation==='add-small'?5:25;
    const key=colors.map(([name,color],i)=>`<span style="background:${color}">${i*step+(i?1:0)}–${(i+1)*step}: ${name}</span>`).join('');
    document.querySelector('.problems').innerHTML='<div class="color-key">'+key+'</div><div class="color-grid">'+rows.map(q=>{
      const index=Math.min(3,Math.max(0,Math.ceil(q.answer/step)-1)),[name,color]=colors[index];
      return `<div class="color-cell"${answers?' style="background:'+color+'"':''}>${q.a} ${q.op} ${q.b}<small>${answers?q.answer+' · '+name:'Answer: ______'}</small></div>`;
    }).join('')+'</div>';
    document.querySelector('#status').textContent=requested.title;
    document.querySelector('#set').textContent='Set '+seed+' · '+(answers?'Answers':'16 questions');
    document.querySelector('.seo-resource').innerHTML=resource;
  };
  const label=document.createElement('label');label.className='coverage-controls';label.innerHTML='Practice type <select id="color-operation"><option value="add-small">Addition within 20</option><option value="multiply-one">Multiplication facts</option></select>';
  document.querySelector('.toolbar').before(label);label.onchange=()=>{operation=label.querySelector('select').value;render();};render();
})();
