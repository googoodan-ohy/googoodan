/* Static search entry pages for existing worksheet generators.
 * This adapter selects one existing activity mode and preserves page-specific SEO.
 * It does not change any question, answer, or randomization logic. */
(() => {
  const body = document.body;
  const mode = body.dataset.activityEntryMode;
  const control = body.dataset.activityEntryControl;
  const entryTitle = body.dataset.activityEntryTitle;
  const entryDescription = body.dataset.activityEntryDescription;
  const entryCanonical = body.dataset.activityEntryCanonical;
  const entryInstruction = body.dataset.activityEntryInstruction;
  if (!mode || !control || !entryTitle || !entryCanonical || typeof render !== 'function') return;

  const selectMode = () => {
    let select;
    if (control === 'early') {
      globalThis.EarlyActivities?.select(mode);
      select = document.querySelector('#early-activity');
    } else if (control === 'color') {
      select = document.querySelector('#color-operation');
    } else if (control === 'coverage') {
      globalThis.CoveragePractice?.setSkill(mode);
      select = document.querySelector('#coverage-skill');
    } else if (control === 'reasoning') {
      globalThis.ReasoningExpansion?.select(mode);
      select = document.querySelector('#reasoning-skill');
    }
    if (select && [...select.options].some(option => option.value === mode)) select.value = mode;
    if (control === 'color' && select) select.dispatchEvent(new Event('change', {bubbles: true}));
  };

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
    const instructions = document.querySelector('#instructions');
    if (instructions && !answers && entryInstruction) instructions.textContent = entryInstruction;
    document.querySelectorAll('.groups a.choice[data-id]').forEach(link => {
      link.href = '/en/' + link.dataset.id + '.html';
    });
  };

  selectMode();
  const baseRender = render;
  render = function activityEntryRender() {
    baseRender();
    restoreEntry();
  };
  render();
})();
