(() => {
  const def = globalThis.SpatialPractice?.definitions.find(item => item.id === current.id);
  if (!def) return;
  const label = document.createElement('label');
  label.className = 'spatial-controls';
  label.textContent = 'Practice type ';
  const select = document.createElement('select');
  select.id = 'spatial-skill';
  select.setAttribute('aria-label','Choose a solid geometry skill');
  for (const [value,text] of [['all','Mixed practice'],...def.skills.map(([skill,,name]) => [skill,name])]) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = text;
    select.append(option);
  }
  label.append(select);
  document.querySelector('.toolbar').before(label);
  document.querySelector('.paper')?.classList.add('spatial-sheet');
  select.addEventListener('change', () => {
    globalThis.SpatialPractice.setSkill(select.value);
    render();
  });

  const symbols = {
    'faces-edges-vertices':'3D',
    'nets-of-3d-shapes':'▱',
    'counting-cubes':'▦',
    'front-top-side-views-cubes':'◫',
    'missing-hidden-cubes':'?'
  };
  document.querySelectorAll('.groups .choice[data-id]').forEach(link => {
    if (!symbols[link.dataset.id]) return;
    const example = link.querySelector('.example');
    if (example) example.textContent = symbols[link.dataset.id];
  });
})();
