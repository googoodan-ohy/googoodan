(function () {
  'use strict';
  const params = new URLSearchParams(location.search);
  const type = params.get('type') || SheetCatalog[0].typeId;
  const keywordVariant = (window.USKeywordVariants||[]).find(v => v.kind==='training' && type==='kw74-'+v.id);
  const base = keywordVariant ? SheetCatalog.find(c => c.typeId === keywordVariant.source) : (SheetCatalog.find(c => c.typeId === type) || SheetCatalog.find(c => c.format === type));
  const error = document.getElementById('sheet-error');
  if (!base) { error.textContent = '등록된 유형 또는 서식이 아닙니다: ' + type; return; }
  const seed = Number(params.get('seed'));
  const config = { ...base, seed: Number.isFinite(seed) && params.has('seed') ? seed : (keywordVariant ? (base.seed+keywordVariant.id*9973)>>>0 : base.seed) };
  if (keywordVariant) { config.title=keywordVariant.title; config.keywordVariant=keywordVariant.id; if(keywordVariant.rule.startsWith('divisor_')){config.cols=3;config.rows=5;config.count=15;config.maxProblems=15;config.autoFit=false;} if(keywordVariant.rule==='exact_division_3_1'){config.format='horizontal';config.cols=3;config.rows=10;config.count=30;config.maxProblems=30;config.autoFit=false;} if(keywordVariant.rule.startsWith('mixed_')){if(keywordVariant.rule==='mixed_numberline'){config.format='kw74-numberline';config.cols=2;config.rows=8;config.count=16;config.maxProblems=16;}else{if(keywordVariant.rule!=='mixed_mul_regroup')config.format='horizontal';config.cols=3;config.rows=10;config.count=30;config.maxProblems=30;}config.autoFit=false;} }
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





