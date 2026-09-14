/* Focused US number-sense entry points. Every number, answer, and random set
 * comes from the existing Korean core or English grade generator. This file
 * only selects source questions that match each page's stated range and adds
 * English presentation text. */
(() => {
  const core = globalThis.KoMath;
  const gradeMath = globalThis.GradeMath;
  if (!core || !gradeMath || !globalThis.Worksheets) return;

  const definitions = [
    {
      id: 'compare-two-digit-symbols',
      title: '2-Digit Number Comparison Worksheets',
      instruction: 'Compare the two-digit numbers. Write <, >, or = in each box.',
      example: '23 + 41',
      menuExample: '23 < 41',
      kind: 'compare',
      unit: '1-1-5',
      skill: 'compare:99',
      min: 10,
      max: 99
    },
    {
      id: 'compare-three-digit-symbols',
      title: '3-Digit Number Comparison Worksheets',
      instruction: 'Compare the three-digit numbers. Write <, >, or = in each box.',
      example: '324 + 517',
      menuExample: '324 < 517',
      kind: 'compare',
      unit: '2-2-1',
      skill: 'compare:999',
      min: 100,
      max: 999
    },
    {
      id: 'ten-more-ten-less-within-100',
      title: '10 More and 10 Less Within 100 Worksheets',
      instruction: 'Use place value to find 10 more or 10 less.',
      example: '46 + 10',
      kind: 'mental10'
    },
    {
      id: 'ten-hundred-more-less-within-1000',
      title: '10 and 100 More or Less Worksheets',
      instruction: 'Find 10 or 100 more or less without counting by ones.',
      example: '430 + 100',
      kind: 'mental100'
    },
    {
      id: 'missing-number-patterns-to-100',
      title: 'Missing Numbers to 100 Worksheets',
      instruction: 'Follow each counting pattern and write the missing number.',
      example: '24 + 1',
      kind: 'sequence100',
      unit: '1-1-5',
      skill: 'sequence:100'
    },
    {
      id: 'skip-counting-missing-numbers-to-1000',
      title: 'Skip Counting Missing Numbers to 1,000 Worksheets',
      instruction: 'Skip-count by 5s, 10s, or 100s and complete each pattern.',
      example: '250 + 100',
      kind: 'skip1000'
    }
  ];

  for (const def of definitions) {
    Worksheets.types.push({
      id: def.id,
      title: def.title,
      family: 'Natural numbers',
      group: 'Number sense',
      example: def.example,
      instruction: def.instruction,
      bankId: `number-sense-reuse:${def.id}`
    });
  }

  const numbers = value => (String(value).match(/\d[\d,]*/g) || []).map(n => Number(n.replaceAll(',', '')));
  const cleanVisual = value => String(value || '')
    .replaceAll('문제 그림', 'Problem diagram')
    .replaceAll('길이는 문제의 조건을 보세요', 'Use the measurements in the question');

  function select(seed, index, factory, predicate, key, seen = new Set(), maxAttempts = 800) {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const question = factory((seed + index * 7919 + attempt * 137) >>> 0);
      if (!predicate(question)) continue;
      const signature = key(question);
      if (seen.has(signature)) continue;
      seen.add(signature);
      return question;
    }
    throw new Error('No matching source question for focused number-sense worksheet.');
  }

  function coreQuestion(def, seed, index, seen, requiredRelation = null) {
    const q = select(
      seed,
      index,
      value => core.generate(def.unit, 0, value, 1, [{skill: def.skill, mode: 0}])[0].questions[0],
      question => {
        const values = numbers(question.visual);
        return def.kind !== 'compare' || (values.length >= 2 && values[0] >= def.min && values[0] <= def.max && values[1] >= def.min && values[1] <= def.max && (!requiredRelation || question.answer === requiredRelation));
      },
      question => `${question.visual}|${question.answer}`,
      seen,
      requiredRelation === '=' ? 20000 : 800
    );
    const values = numbers(q.visual);
    if (def.kind === 'compare') {
      const [a, b] = values;
      return {
        ...q,
        prompt: 'Write <, >, or = in the box.',
        visual: cleanVisual(q.visual),
        task: '',
        reason: `Compare place values from left to right. ${a} ${q.answer} ${b}.`
      };
    }
    const sequence = values;
    const step = sequence.length > 1 ? sequence[1] - sequence[0] : 1;
    return {
      ...q,
      prompt: 'Write the missing number in the counting pattern.',
      visual: cleanVisual(q.visual),
      task: '',
      reason: `The pattern increases by ${step} each time, so the missing number is ${q.answer}.`
    };
  }

  function gradeQuestions(grade, id, seed) {
    return gradeMath.generate(grade, id, seed).flatMap(section => section.questions);
  }

  function mentalQuestion(grade, id, amount, direction, seed, index, seen) {
    const pattern = new RegExp(`^Find ${amount} ${direction} than (\\d+)\\.$`);
    const q = select(
      seed,
      index,
      value => gradeQuestions(grade, id, value).find(question => pattern.test(question.prompt)),
      Boolean,
      question => question.prompt,
      seen
    );
    const start = Number(q.prompt.match(/\d+$/)?.[0] || q.prompt.match(/\d+/g)?.at(-1));
    return {
      ...q,
      task: String(q.task || '').replaceAll('class="write-box"', 'class="write-answer-box"'),
      reason: direction === 'more'
        ? `${start} + ${amount} = ${q.answer}.`
        : `${start} − ${amount} = ${q.answer}.`
    };
  }

  function skipQuestion(step, seed, index, seen) {
    const pattern = new RegExp(`^Start at (\\d+)\\. Add ${step} each time\\.$`);
    const q = select(
      seed,
      index,
      value => gradeQuestions(2, 'skip', value).find(question => pattern.test(question.prompt)),
      question => {
        if (!question) return false;
        const start = Number(question.prompt.match(/^Start at (\d+)/)[1]);
        return start + step * 3 <= 1000;
      },
      question => `${question.prompt}|${question.answer}`,
      seen
    );
    return {
      ...q,
      task: String(q.task || '').replaceAll('class="write-box"', 'class="write-answer-box"'),
      reason: `Add ${step} for each arrow. The two missing numbers are ${q.answer}.`
    };
  }

  function build(def, seed) {
    const seen = new Set();
    if (def.kind === 'compare' || def.kind === 'sequence100') {
      return Array.from({length: 6}, (_, i) => ({
        title: def.kind === 'compare' ? 'Compare place values' : 'Continue the counting pattern',
        questions: [coreQuestion(def, seed, i, seen, def.kind === 'compare' ? ['=', '<', '>', '<', '>', '<'][i] : null)]
      }));
    }
    if (def.kind === 'mental10') {
      const directions = ['more', 'less', 'more', 'less', 'more', 'less'];
      return directions.map((direction, i) => ({
        title: `Find 10 ${direction}`,
        questions: [mentalQuestion(1, 'ten-more', 10, direction, seed, i, seen)]
      }));
    }
    if (def.kind === 'mental100') {
      const targets = [[10, 'more'], [10, 'less'], [100, 'more'], [100, 'less'], [10, 'more'], [100, 'less']];
      return targets.map(([amount, direction], i) => ({
        title: `Find ${amount} ${direction}`,
        questions: [mentalQuestion(2, 'mental', amount, direction, seed, i, seen)]
      }));
    }
    const steps = [5, 10, 100, 5, 10, 100];
    return steps.map((step, i) => ({
      title: `Skip-count by ${step}s`,
      questions: [skipQuestion(step, seed, i, seen)]
    }));
  }

  function installMenuExamples() {
    const update = () => {
      for (const definition of definitions) {
        if (!definition.menuExample) continue;
        const example = document.querySelector(`.choice[data-id="${definition.id}"] .example`);
        if (example && example.textContent !== definition.menuExample) example.textContent = definition.menuExample;
        if (document.body?.dataset.type === definition.id) {
          const resourceExample = document.querySelector('#resource-example');
          if (resourceExample && resourceExample.textContent !== definition.menuExample) resourceExample.textContent = definition.menuExample;
        }
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

  installMenuExamples();
  globalThis.KoMath = {
    ...core,
    generate(id, profile, seed, count) {
      if (!String(id).startsWith('number-sense-reuse:')) return core.generate(id, profile, seed, count);
      const pageId = String(id).slice('number-sense-reuse:'.length);
      const def = definitions.find(item => item.id === pageId);
      if (!def) throw new Error(`Unknown number-sense page ${pageId}`);
      return build(def, seed >>> 0);
    }
  };

  globalThis.NumberSenseReuse = {definitions};
})();
