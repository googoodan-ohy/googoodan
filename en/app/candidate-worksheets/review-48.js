(async function () {
  const resources = await fetch('resources.json').then(r => { if (!r.ok) throw Error('Resource list unavailable'); return r.json(); });
  const embedded = new URLSearchParams(location.search).get('embedded') === '1';
  if (embedded) document.body.classList.add('embedded');
  if (new URLSearchParams(location.search).get('thumb') === '1') document.body.classList.add('thumb');
  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const generated = new Map();
  const requestedId = new URLSearchParams(location.search).get('id');
  let selected = resources.find(r => r.id === requestedId) || resources[0], mode = ['problem','answer','both'].includes(new URLSearchParams(location.search).get('mode')) ? new URLSearchParams(location.search).get('mode') : 'problem', setIndex = 0;
  $('summary').textContent = `${resources.length} existing titles · review pending`;

  function make(resource, seed) {
    const api = resource.grade <= 1 ? window.CandidateK1 : resource.grade === 2 ? window.CandidateG2 : window.CandidateG345;
    if (!api?.generate) throw Error('Generator unavailable for this grade');
    const items = api.generate(resource, seed);
    if (!Array.isArray(items) || items.length < 8 || items.some(q => !q.prompt && !q.visual && !q.task || q.answer === undefined || q.answer === '')) {
      throw Error('Incomplete generated worksheet');
    }
    return items;
  }
  function itemsFor(resource) {
    if (!generated.has(resource.id)) generated.set(resource.id, make(resource, 123 + setIndex * 10007));
    return generated.get(resource.id);
  }
  function navigation() {
    const query = $('search').value.trim().toLowerCase();
    const shown = resources.filter(r => !query || `${r.title} ${r.id} ${r.codes.join(' ')}`.toLowerCase().includes(query));
    $('standards').innerHTML = shown.map(r => `<button type="button" data-id="${esc(r.id)}" class="${r.id === selected.id ? 'active' : ''}"><b>${esc(r.title)}</b><small>${r.grade ? 'Grade ' + r.grade : 'Kindergarten'} · ${esc(r.codes.join(', '))}</small></button>`).join('') || '<p>No matching materials.</p>';
    $('standards').querySelectorAll('button[data-id]').forEach(button => button.onclick = () => { selected = resources.find(r => r.id === button.dataset.id); history.replaceState(null, '', `?id=${encodeURIComponent(selected.id)}`); render(); });
  }
  function paper(resource, items, answer) {
    const page = document.createElement('article');
    page.className = `sheet-page ${answer ? 'answer-page' : 'problem-page'}`;
    page.innerHTML = `<div class="sheet-head"><div class="sheet-brand">googoodan.com</div><div class="sheet-title">${esc(resource.title)}</div><div class="sheet-kind">${answer ? 'Answer key' : 'Worksheet'}</div><div class="sheet-fields"><div class="sheet-field">Name</div><div class="sheet-field">Date</div><div class="sheet-field">Grade / Class</div></div></div><div class="sheet-instruction">Complete each problem.</div><div class="sheet-grid ${items.length > 15 ? 'dense' : ''}"></div>`;
    const grid = page.querySelector('.sheet-grid');
    grid.style.gridTemplateRows = `repeat(${Math.ceil(items.length / 3)}, minmax(0,1fr))`;
    items.forEach((q, i) => {
      const cell = document.createElement('div');
      cell.className = 'sheet-cell';
      cell.innerHTML = `<span class="sheet-number">${i + 1}</span><div class="legacy-prompt">${esc(q.prompt)}</div><div class="legacy-visual">${q.visual || ''}</div><div class="legacy-task">${q.task || ''}</div>`;
      if (answer) {
        const box = cell.querySelector('.write-box,.blank,.k2-blank');
        if (box && cell.querySelectorAll('.write-box,.blank,.k2-blank').length === 1 && String(q.answer).length < 16 && !String(q.answer).includes('/')) {
          box.textContent = String(q.answer); box.classList.add('ans-fill');
        } else {
          const value = document.createElement('div'); value.className = 'legacy-answer'; value.textContent = `Answer: ${q.answer}`; cell.append(value);
        }
      }
      grid.append(cell);
    });
    return page;
  }
  function render() {
    navigation();
    $('standard-title').textContent = selected.title;
    $('standard-text').textContent = `${selected.grade ? 'Grade ' + selected.grade : 'Kindergarten'} · ${selected.codes.join(', ')}`;
    $('review-note').textContent = embedded ? '' : 'Separate draft for owner review. This material is not connected to the site.';
    document.body.classList.toggle('view-problem', mode === 'problem');
    document.body.classList.toggle('view-answer', mode === 'answer');
    for (const id of ['problem','answer','both']) $(id).classList.toggle('active', mode === id);
    try {
      const items = itemsFor(selected);
      const originalUrl = selected.sourceUrl?.startsWith('/') ? `http://127.0.0.1:4205${selected.sourceUrl}` : selected.sourceUrl;
      $('source').innerHTML = `${esc(selected.id)} · ${items.length} changing problems · <a class="original-link" href="${esc(originalUrl)}" target="_blank" rel="noopener">Original material</a>`;
      $('pages').replaceChildren(paper(selected, items, false), paper(selected, items, true));
    } catch (error) {
      $('source').textContent = `${selected.id} · generation error`;
      $('pages').innerHTML = `<div class="empty-state">${esc(error.message)}</div>`;
      console.error(selected.id, error);
    }
  }
  for (const id of ['problem','answer','both']) $(id).onclick = () => { mode = id; render(); };
  $('new-set').onclick = () => { setIndex++; generated.delete(selected.id); render(); };
  $('print').onclick = () => window.print();
  $('search').oninput = navigation;
  render();
})().catch(error => { document.getElementById('pages').textContent = `Preview error: ${error.message}`; console.error(error); });
