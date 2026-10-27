// 왼쪽 첫 탭(연산 트레이닝) 이름·모양을 모든 화면에서 같게: ＋−×÷ 기호 빼고 같은 이름으로.
(() => {
  const c = (location.pathname.match(/^\/(ja|fr|es|it|de)\//) || [])[1];
  if (!c) return;
  const L = { ja: '計算トレーニング', fr: 'Entraînement au calcul', es: 'Entrenamiento de cálculo', it: 'Allenamento al calcolo', de: 'Rechentraining' };
  const label = L[c];
  // 둘째·셋째 탭도 모든 화면에서 같은 이름(예전 화면 자체 이름 기준)
  const L2 = { ja: ['単元別計算', '単元別問題'], fr: ['Calcul par chapitre', 'Exercices par chapitre'], es: ['Cálculo por temas', 'Actividades por temas'], it: ['Calcolo per argomento', 'Attività per argomento'], de: ['Rechnen nach Themen', 'Aufgabentypen nach Themen'] }[c];
  const isTrainingHref = h => new RegExp('^(https?://[^/]+)?/' + c + '/(training/(index\\.html)?)?$').test(h || '');
  const fix = () => {
    document.querySelectorAll('a').forEach(a => {
      if (a.closest('#all-nav') || a.classList.contains('gd-brand') || a.closest('header')) return;
      if (!a.closest('.unit-edition-tabs,.edition-tabs,.primary-nav')) return;
      const h = a.getAttribute('href') || '';
      if (/\/drills\.html$/.test(h) && L2 && a.textContent.trim() !== L2[0]) { a.textContent = L2[0]; return; }
      if (/\/units\.html$/.test(h) && L2 && a.textContent.trim() !== L2[1]) { a.textContent = L2[1]; return; }
      if (!isTrainingHref(h)) return;
      if (a.dataset.tabLabel === label && a.textContent.trim() === label) return;
      a.textContent = label;
      a.dataset.tabLabel = label;
    });
  };
  const run = () => { fix(); new MutationObserver(fix).observe(document.body, { childList: true, subtree: true }); };
  if (document.body) run(); else document.addEventListener('DOMContentLoaded', run);
})();
