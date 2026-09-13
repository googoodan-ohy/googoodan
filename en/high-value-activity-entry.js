/* Focused entry pages for existing worksheet banks.
 * This adapter selects and translates existing profiles. It does not create
 * new numbers, questions, or answers. */
(() => {
  const body = document.body;
  const family = body.dataset.hvFamily;
  const entryTitle = body.dataset.hvTitle;
  const entryDescription = body.dataset.hvDescription;
  const entryCanonical = body.dataset.hvCanonical;
  const entryInstruction = body.dataset.hvInstruction;
  if (!family || !entryTitle || !entryCanonical || typeof render !== 'function') return;

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
  };

  // Source pages finalize their generic SEO in DOMContentLoaded handlers.
  // Restore this focused entry after those handlers without altering the engines.
  document.addEventListener('DOMContentLoaded', () => setTimeout(restoreEntry, 0));
  window.addEventListener('load', restoreEntry);

  const installRenderWrapper = afterRender => {
    const baseRender = render;
    render = function focusedActivityRender() {
      baseRender();
      afterRender?.();
      restoreEntry();
    };
    render();
  };

  current.title = entryTitle;
  current.instruction = entryInstruction || current.instruction;

  if (family === 'color') {
    const method = body.dataset.hvMethod;
    const select = document.querySelector('#color-operation');
    if (!select || !method) return;
    if (![...select.options].some(option => option.value === method)) {
      select.add(new Option('Subtraction within 10', method));
    }
    select.value = method;
    select.dispatchEvent(new Event('change', {bubbles: true}));
    select.closest('label')?.remove();
    installRenderWrapper(() => {
      const colors = [['Yellow','#fff09a'],['Blue','#b9dffa'],['Green','#c2e4bb'],['Pink','#f7bfd4']];
      const ranges = [[0, 2], [3, 5], [6, 8], [9, 10]];
      const rows = Worksheets.generate(method, seed, 16);
      const key = colors.map(([name,color], index) => '<span style="background:' + color + '">' + ranges[index][0] + '–' + ranges[index][1] + ': ' + name + '</span>').join('');
      document.querySelector('.problems').innerHTML = '<div class="color-key">' + key + '</div><div class="color-grid">' + rows.map(question => {
        let index = ranges.findIndex(([low, high]) => Number(question.answer) >= low && Number(question.answer) <= high);
        if (index < 0) index = ranges.length - 1;
        const [name,color] = colors[index];
        return `<div class="color-cell"${answers ? ` style="background:${color}"` : ''}>${question.a} ${question.op} ${question.b}<small>${answers ? `${question.answer} · ${name}` : 'Answer: ______'}</small></div>`;
      }).join('') + '</div>';
      document.querySelector('#set').textContent = `Set ${seed} · ${answers ? 'Answers' : '16 questions'}`;
    });
    return;
  }

  if (family === 'story') {
    const bank = body.dataset.hvBank;
    const profile = Number(body.dataset.hvProfile);
    const methods = (body.dataset.hvMethods || '').split(',').filter(Boolean);
    const count = Math.max(1, Number(body.dataset.hvCount) || methods.length);
    if (!bank || !Number.isInteger(profile) || !KoMath.profiles(bank)[profile]) return;
    current.bankId = bank;
    current.bankProfile = profile;
    if (methods.length) {
      const originalGenerate = KoMath.generate.bind(KoMath);
      globalThis.KoMath = {...globalThis.KoMath, generate(id, selectedProfile, worksheetSeed, n) {
        if (id !== bank || selectedProfile !== profile) return originalGenerate(id, selectedProfile, worksheetSeed, n);
        const sections = [];
        let pass = 0;
        while (sections.length < count && pass < count * 3) {
          const generated = originalGenerate(bank, profile, (worksheetSeed + pass * 7907) >>> 0, 1);
          for (const section of generated) {
            if (!methods.includes(section.skill)) continue;
            sections.push(section);
            if (sections.length === count) break;
          }
          pass++;
        }
        if (sections.length !== count) throw new Error('Could not materialize the requested existing story methods.');
        return sections;
      }};
    }
    const gradeSelect = document.querySelector('#story-grade');
    const profileSelect = document.querySelector('#story-profile');
    if (gradeSelect) gradeSelect.value = bank;
    if (profileSelect) profileSelect.value = String(profile);
    gradeSelect?.closest('.hundred-intro')?.remove();
    installRenderWrapper();
    return;
  }

  if (family === 'early-arithmetic') {
    const bank = body.dataset.hvBank;
    const profile = Number(body.dataset.hvProfile);
    const methods = (body.dataset.hvMethods || '').split(',').filter(Boolean);
    const count = Math.max(1, Number(body.dataset.hvCount) || 6);
    if (!bank || !Number.isInteger(profile) || !methods.length || !globalThis.KoEarlyArithmetic) return;
    const originalGenerate = KoMath.generate.bind(KoMath);
    const labels = {
      compensate: 'Balance both sides',
      'bridge-sub': 'Subtract by making 10',
      'zero-ten': 'Subtract from 10',
      'three-sub': 'Subtract three numbers',
      error: 'Find and fix the math mistake'
    };
    const translate = (question, method) => {
      const copy = {...question};
      if (method === 'compensate') {
        copy.prompt = 'Fill in the box so both sides of the equation have the same value.';
        copy.reason = 'Add on both sides to check that the two totals are equal.';
      } else if (method === 'bridge-sub') {
        copy.prompt = 'Break the teen number into 10 and some ones. Subtract from 10 first.';
        copy.reason = 'Subtract from 10, then add the ones that were separated from the teen number.';
      } else if (method === 'zero-ten') {
        copy.prompt = 'Subtract from 10.';
        copy.reason = 'Use the related number pair that makes 10 to check the difference.';
      } else if (method === 'three-sub') {
        copy.prompt = 'Subtract from left to right.';
        copy.reason = 'Subtract the second number first, then subtract the third number.';
      } else if (method === 'error') {
        copy.prompt = 'Check the equation. Find the mistake and write the correct answer.';
        copy.reason = 'Recalculate the left side and compare it with the answer that was shown.';
      }
      copy.visual = copy.visual.replaceAll('문제 그림', 'Activity diagram').replace(/src="art\//g, 'src="/ko/art/');
      return copy;
    };
    globalThis.KoMath = {...globalThis.KoMath, generate(id, unusedProfile, worksheetSeed, n) {
      if (id !== current.bankId) return originalGenerate(id, unusedProfile, worksheetSeed, n);
      const sections = [];
      let pass = 0;
      while (sections.length < count && pass < count * 2) {
        const generated = KoEarlyArithmetic.generate(bank, profile, (worksheetSeed + pass * 7907) >>> 0, 1, []);
        for (const section of generated) {
          if (!methods.includes(section.skill)) continue;
          sections.push({title: labels[section.skill], skill: section.skill, questions: [translate(section.questions[0], section.skill)]});
          if (sections.length === count) break;
        }
        pass++;
      }
      if (sections.length !== count) throw new Error('Could not materialize the requested existing activity methods.');
      return sections;
    }};
    document.querySelector('#early-activity')?.closest('label')?.remove();
    installRenderWrapper();
    return;
  }

  if (family === 'early-numbers') {
    const method = body.dataset.hvMethod;
    const count = Math.max(1, Number(body.dataset.hvCount) || 4);
    if (!method || !globalThis.EarlyActivities?.sourceFor || !globalThis.EarlyActivities?.translate) return;
    const originalGenerate = KoMath.generate.bind(KoMath);
    globalThis.KoMath = {...globalThis.KoMath, generate(id, profile, worksheetSeed, n) {
      if (id !== current.bankId) return originalGenerate(id, profile, worksheetSeed, n);
      const source = EarlyActivities.sourceFor(method);
      return Array.from({length:count}, (_, index) => {
        const question = EarlyActivities.translate(source((worksheetSeed + index * 7907) >>> 0), method);
        return {title:EarlyActivities.labels[method], skill:method, questions:[question]};
      });
    }};
    document.querySelector('#early-activity')?.closest('label')?.remove();
    installRenderWrapper();
  }
})();
