/* Cut-and-paste presentation for existing Korean-authored early-math activities. */
(() => {
  const previousGenerate = globalThis.KoMath?.generate?.bind(globalThis.KoMath);
  if (!previousGenerate || !globalThis.EarlyActivities || !globalThis.Worksheets) return;

  const definitions = [
    {
      id: 'cut-and-paste-math-worksheets',
      title: 'Cut and Paste Math Worksheets for Kindergarten',
      level: 'Kindergarten',
      methods: ['count', 'words', 'order', 'ten-missing']
    },
    {
      id: 'cut-and-paste-counting',
      title: 'Cut and Paste Counting Worksheets',
      level: 'Kindergarten',
      methods: ['count']
    },
    {
      id: 'cut-and-paste-number-words',
      title: 'Cut and Paste Number Words Worksheets',
      level: 'Kindergarten',
      methods: ['words']
    },
    {
      id: 'cut-and-paste-number-order',
      title: 'Cut and Paste Number Order Worksheets',
      level: 'Kindergarten-Grade 1',
      methods: ['order']
    },
    {
      id: 'cut-and-paste-make-10',
      title: 'Cut and Paste Make 10 Worksheets',
      level: 'Kindergarten-Grade 1',
      methods: ['ten-missing']
    },
    {
      id: 'cut-and-paste-number-patterns',
      title: 'Cut and Paste Number Pattern Worksheets',
      level: 'Kindergarten-Grade 1',
      methods: ['neighbors', 'line', 'repair']
    }
  ];

  const esc = value => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

  const rotate = (values, seed) => {
    if (values.length < 2) return values;
    const amount = (seed >>> 0) % values.length;
    return values.slice(amount).concat(values.slice(0, amount));
  };

  const cardBank = (values, seed) => {
    const cards = rotate([...values], seed).map(value => `<span class="cut-card">${esc(value)}</span>`).join('');
    return `<div class="cut-card-bank" aria-label="Cut-out answer cards"><small>Cut out the cards.</small><div>${cards}</div></div>`;
  };

  const pasteZone = answer => `<span class="paste-zone"><span class="cut-answer">${esc(answer)}</span></span>`;

  function choiceValues(method, seed, correct) {
    const values = [String(correct)];
    for (let i = 1; i < 16 && values.length < 3; i++) {
      const raw = EarlyActivities.sourceFor(method)(seed + i * 7919);
      const translated = EarlyActivities.translate(raw, method);
      const value = String(translated.answer);
      if (!values.includes(value)) values.push(value);
    }
    return values;
  }

  function transform(raw, translated, method, seed) {
    const q = {...translated};
    q.open = true;

    if (method === 'words') {
      const pairs = String(q.answer).split(',').map(part => part.trim().split(/\s*->\s*|\s*→\s*/)).filter(pair => pair.length === 2);
      q.prompt = 'Cut out the number-word cards. Paste each word beside its matching numeral.';
      q.visual = `<div class="cut-match-targets">${pairs.map(([number, word]) => `<div><b>${esc(number)}</b>${pasteZone(word)}</div>`).join('')}</div>${cardBank(pairs.map(pair => pair[1]), seed)}`;
      q.task = '';
      q.reason = 'Read each numeral and match it with the same number written as a word.';
      return q;
    }

    if (method === 'order') {
      const source = [...q.visual.matchAll(/<b>(\d+)<\/b>/g)].map(match => match[1]);
      const ordered = String(q.answer).split(/\s*→\s*/);
      q.prompt = 'Cut out the number cards. Paste them from least to greatest.';
      q.visual = `<div class="paste-sequence">${ordered.map(value => pasteZone(value)).join('<span aria-hidden="true">→</span>')}</div>${cardBank(source, seed)}`;
      q.task = '';
      q.reason = 'The completed row starts with the smallest number and ends with the greatest.';
      return q;
    }

    if (method === 'repair') {
      const source = [...q.visual.matchAll(/<b>(\d+)<\/b>/g)].map(match => match[1]);
      const ordered = [...source].sort((a, b) => Number(a) - Number(b));
      q.prompt = 'The cards are mixed up. Cut them out and paste the counting sequence in order.';
      q.visual = `<div class="paste-sequence four">${ordered.map(value => pasteZone(value)).join('<span aria-hidden="true">→</span>')}</div>${cardBank(source, seed)}`;
      q.task = '';
      q.answer = ordered.join(' → ');
      q.reason = 'The completed row counts forward by one.';
      return q;
    }

    if (method === 'neighbors') {
      const center = [...q.visual.matchAll(/<b>([^<]+)<\/b>/g)].map(match => match[1]).find(value => /^\d+$/.test(value));
      const answers = String(q.answer).split(',').map(value => value.trim());
      q.prompt = 'Cut out the two cards. Paste the number before and the number after.';
      q.visual = `<div class="paste-sequence">${pasteZone(answers[0])}<b class="fixed-card">${esc(center)}</b>${pasteZone(answers[1])}</div>${cardBank(answers, seed)}`;
      q.task = '';
      q.reason = 'The left card is one less and the right card is one more.';
      return q;
    }

    if (method === 'line') {
      const values = choiceValues(method, seed, q.answer);
      q.prompt = 'Find the missing number. Cut out the correct card and paste it in the box.';
      q.visual = `${q.visual}<div class="single-paste">${pasteZone(q.answer)}</div>${cardBank(values, seed)}`;
      q.task = '';
      q.reason = 'Each step to the right increases the number by one.';
      return q;
    }

    if (method === 'ten-missing') {
      const values = choiceValues(method, seed, q.answer);
      q.prompt = 'Make 10. Cut out the correct number and paste it in the empty box.';
      q.visual = `${q.visual.replace('□', '<span class="inline-paste"><span class="cut-answer">' + esc(q.answer) + '</span></span>')}${cardBank(values, seed)}`;
      q.task = '';
      q.reason = 'The pasted number and the given number make 10.';
      return q;
    }

    if (method === 'count') {
      const values = choiceValues(method, seed, q.answer);
      q.prompt = 'Count the pictures. Cut out the correct number and paste it in the box.';
      q.visual = `${q.visual}<div class="single-paste">${pasteZone(q.answer)}</div>${cardBank(values, seed)}`;
      q.task = '';
      q.reason = 'Touch each picture once, then choose the card with that total.';
      return q;
    }

    return q;
  }

  for (const definition of definitions) {
    if (Worksheets.types.some(type => type.id === definition.id)) continue;
    Worksheets.types.push({
      id: definition.id,
      title: definition.title,
      family: 'Early math activities',
      group: 'Cut and paste',
      example: 'Cut · Match · Paste',
      instruction: `${definition.level}. Cut out the cards and paste each answer in its matching space.`,
      bankId: `cutpaste:${definition.id}`
    });
  }

  function installMenuLabels() {
    const label = 'Cut · Match · Paste';
    const ids = new Set(definitions.map(definition => definition.id));
    const update = () => {
      document.querySelectorAll('.choice[data-id] .example').forEach(example => {
        const id = example.closest('.choice')?.dataset.id;
        if (ids.has(id) && example.textContent !== label) example.textContent = label;
      });
      if (ids.has(document.body?.dataset.type)) {
        const resourceExample = document.querySelector('#resource-example');
        if (resourceExample && resourceExample.textContent !== label) resourceExample.textContent = label;
      }
    };
    const start = () => {
      const groups = document.querySelector('.groups');
      if (groups) new MutationObserver(update).observe(groups, {childList: true, subtree: true});
      update();
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once: true});
    else start();
  }

  installMenuLabels();
  globalThis.KoMath.generate = function generateCutAndPaste(id, profile, seed, count) {
    if (!String(id).startsWith('cutpaste:')) return previousGenerate(id, profile, seed, count);
    const definition = definitions.find(item => `cutpaste:${item.id}` === id);
    if (!definition) throw new Error(`Unknown cut-and-paste worksheet: ${id}`);
    const seen = new Set();
    return Array.from({length: 4}, (_, index) => {
      const method = definition.methods[index % definition.methods.length];
      for (let attempt = 0; attempt < 800; attempt++) {
        const itemSeed = (Number(seed) + index * 104729 + attempt * 7919) >>> 0;
        const raw = EarlyActivities.sourceFor(method)(itemSeed);
        const translated = EarlyActivities.translate(raw, method);
        const question = transform(raw, translated, method, itemSeed);
        const visibleActivity = question.visual.replace(/<div class="cut-card-bank"[\s\S]*$/, '');
        const signature = `${method}|${visibleActivity}|${question.answer}`;
        if (seen.has(signature)) continue;
        seen.add(signature);
        return {
          title: EarlyActivities.labels[method],
          questions: [question]
        };
      }
      throw new Error(`Could not build four distinct ${method} activities.`);
    });
  };

  globalThis.CutAndPasteActivities = {definitions};
})();
