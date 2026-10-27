(function () {
  const key = 'gd-position:' + location.pathname + location.search;
  const state = () => ({ x: scrollX, y: scrollY, view: document.body.className });
  const report = () => {
    parent.postMessage({ kind: 'gd-position', state: state() }, '*');
    if (parent === window) try { localStorage.setItem(key, JSON.stringify(state())); } catch (_) {}
  };
  const forcedProblem = new URLSearchParams(location.search).get('view') === 'problem' && performance.getEntriesByType('navigation')[0]?.type !== 'reload';
  function restore(s) {
    document.body.className = forcedProblem ? 'view-problem' : (s.view || 'view-problem');
    requestAnimationFrame(() => { scrollTo(s.x || 0, s.y || 0); report(); });
  }
  addEventListener('message', e => {
    if (e.source === parent && e.data?.kind === 'gd-restore') restore(e.data.state);
  });
  addEventListener('scroll', report);
  document.addEventListener('click', () => setTimeout(report, 0));
  addEventListener('beforeunload', report);
  if (parent === window) try { const s = JSON.parse(localStorage.getItem(key) || 'null'); if (s) restore(s); } catch (_) {}
})();
