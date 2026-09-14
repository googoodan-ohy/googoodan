(() => {
  if (!document.body.dataset.type.startsWith('cut-and-paste-')) return;
  document.querySelector('.paper')?.classList.add('early-activity-sheet', 'cut-paste-sheet');
})();
