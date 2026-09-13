/* Static search entry pages for one exact K-2 hands-on activity.
 * The existing activity bank remains the only question generator. */
(() => {
  const body = document.body;
  const parent = body.dataset.handsOnParent;
  const method = body.dataset.handsOnMethod;
  const entryTitle = body.dataset.handsOnTitle;
  const entryDescription = body.dataset.handsOnDescription;
  const entryCanonical = body.dataset.handsOnCanonical;
  const entryInstruction = body.dataset.handsOnInstruction;
  if (!parent || !method || !entryTitle || !entryCanonical || typeof render !== 'function') return;

  const definition = globalThis.K2Activities?.definitions?.find(item => item.id === parent);
  if (!definition?.methods.includes(method)) return;

  const restoreEntry = () => {
    document.title = entryTitle + ' | Googoodan';
    const description = document.querySelector('meta[name="description"]');
    if (description && entryDescription) description.content = entryDescription;
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.href = entryCanonical;
    const heading = document.querySelector('main aside > h1');
    if (heading) heading.textContent = entryTitle;
    const sheetTitle = document.querySelector('#sheet-title');
    if (sheetTitle) sheetTitle.textContent = entryTitle;
    const answerView = document.querySelector('#answers')?.getAttribute('aria-pressed') === 'true';
    const instructions = document.querySelector('#instructions');
    if (instructions && !answerView && entryInstruction) instructions.textContent = entryInstruction;
    document.querySelectorAll('.groups a.choice[data-id]').forEach(link => {
      link.href = '/en/' + link.dataset.id + '.html';
    });
  };

  globalThis.K2Activities.select(method);
  const select = document.querySelector('#k2-activity');
  if (select && [...select.options].some(option => option.value === method)) select.value = method;

  const baseRender = render;
  render = function handsOnEntryRender() {
    globalThis.K2Activities.select(method);
    baseRender();
    if (select && select.value !== method) select.value = method;
    restoreEntry();
  };
  render();
})();
