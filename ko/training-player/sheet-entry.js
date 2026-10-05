(function () {
  'use strict';
  const params = new URLSearchParams(location.search);
  const type = params.get('type') || SheetCatalog[0].typeId;
  const base = SheetCatalog.find(c => c.typeId === type) || SheetCatalog.find(c => c.format === type);
  const error = document.getElementById('sheet-error');
  if (!base) { error.textContent = '등록된 유형 또는 서식이 아닙니다: ' + type; return; }
  const seed = Number(params.get('seed'));
  const config = { ...base, seed: Number.isFinite(seed) && params.has('seed') ? seed : base.seed };
  try {
    Sheet.render(config);
    document.body.dataset.rendered = 'yes';
    document.body.dataset.format = Sheet.last.config.format;
    document.body.dataset.cols = Sheet.last.config.cols;
    document.body.dataset.rows = Sheet.last.config.rows;
    document.body.dataset.count = Sheet.last.config.count;
    document.title = config.title + ' · 구구단닷컴';
  } catch (e) { error.textContent = e.stack || e.message; }
  document.getElementById('problem-button').onclick = () => document.body.className = 'view-problem';
  document.getElementById('answer-button').onclick = () => document.body.className = 'view-answer';
  document.getElementById('print-button').onclick = () => print();
})();
