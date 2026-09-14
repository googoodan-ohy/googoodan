/* US regrouping practice selected from the existing Korean arithmetic-target bank.
 * The source bank owns every number, answer, and exact carry/borrow constraint.
 * This adapter only selects aligned profiles, translates labels, and lays two
 * source questions from each activity into the standard English worksheet. */
(() => {
  const source = globalThis.KoMath;
  if (!source || !globalThis.Worksheets) return;

  const definitions = [
    entry('grade-2-two-digit-addition-one-regrouping', 2, '2.NBT.B.7', '2-1-3', '받아올림1번 계산하기', '+', 2, 1,
      'Two-Digit Addition with One Regrouping Worksheets'),
    entry('grade-2-two-digit-addition-two-regroupings', 2, '2.NBT.B.7', '2-1-3', '받아올림2번 계산하기', '+', 2, 2,
      'Two-Digit Addition with Two Regroupings Worksheets'),
    entry('grade-2-two-digit-subtraction-one-regrouping', 2, '2.NBT.B.7', '2-1-3', '받아내림1번 계산하기', '−', 2, 1,
      'Two-Digit Subtraction with One Regrouping Worksheets'),

    entry('grade-3-three-digit-addition-no-regrouping', 3, '3.NBT.A.2', '3-1-1', '받아올림 없이 계산하기', '+', 3, 0,
      'Three-Digit Addition Without Regrouping Worksheets'),
    entry('grade-3-three-digit-addition-one-regrouping', 3, '3.NBT.A.2', '3-1-1', '받아올림1번 계산하기', '+', 3, 1,
      'Three-Digit Addition with One Regrouping Worksheets'),
    entry('grade-3-three-digit-addition-two-regroupings', 3, '3.NBT.A.2', '3-1-1', '받아올림2번 계산하기', '+', 3, 2,
      'Three-Digit Addition with Two Regroupings Worksheets'),
    entry('grade-3-three-digit-addition-three-regroupings', 3, '3.NBT.A.2', '3-1-1', '받아올림3번 계산하기', '+', 3, 3,
      'Three-Digit Addition with Three Regroupings Worksheets'),
    entry('grade-3-three-digit-subtraction-no-regrouping', 3, '3.NBT.A.2', '3-1-1', '받아내림 없이 계산하기', '−', 3, 0,
      'Three-Digit Subtraction Without Regrouping Worksheets'),
    entry('grade-3-three-digit-subtraction-one-regrouping', 3, '3.NBT.A.2', '3-1-1', '받아내림1번 계산하기', '−', 3, 1,
      'Three-Digit Subtraction with One Regrouping Worksheets'),
    entry('grade-3-three-digit-subtraction-two-regroupings', 3, '3.NBT.A.2', '3-1-1', '받아내림2번 계산하기', '−', 3, 2,
      'Three-Digit Subtraction with Two Regroupings Worksheets'),

    entry('grade-4-two-digit-by-one-digit-multiplication-no-regrouping', 4, '4.NBT.B.5', '3-1-4', '한 자리 수 곱하기 · 받아올림 0번', '×', 2, 0,
      'Two-Digit by One-Digit Multiplication Without Regrouping Worksheets'),
    entry('grade-4-two-digit-by-one-digit-multiplication-one-regrouping', 4, '4.NBT.B.5', '3-1-4', '한 자리 수 곱하기 · 받아올림 1번', '×', 2, 1,
      'Two-Digit by One-Digit Multiplication with One Regrouping Worksheets'),
    entry('grade-4-two-digit-by-one-digit-multiplication-two-regroupings', 4, '4.NBT.B.5', '3-1-4', '한 자리 수 곱하기 · 받아올림 2번', '×', 2, 2,
      'Two-Digit by One-Digit Multiplication with Two Regroupings Worksheets'),
    entry('grade-4-three-digit-by-one-digit-multiplication-no-regrouping', 4, '4.NBT.B.5', '3-2-1', '한 자리 수 곱하기 · 받아올림 0번', '×', 3, 0,
      'Three-Digit by One-Digit Multiplication Without Regrouping Worksheets'),
    entry('grade-4-three-digit-by-one-digit-multiplication-one-regrouping', 4, '4.NBT.B.5', '3-2-1', '한 자리 수 곱하기 · 받아올림 1번', '×', 3, 1,
      'Three-Digit by One-Digit Multiplication with One Regrouping Worksheets'),
    entry('grade-4-three-digit-by-one-digit-multiplication-two-regroupings', 4, '4.NBT.B.5', '3-2-1', '한 자리 수 곱하기 · 받아올림 2번', '×', 3, 2,
      'Three-Digit by One-Digit Multiplication with Two Regroupings Worksheets'),
    entry('grade-4-three-digit-by-one-digit-multiplication-three-regroupings', 4, '4.NBT.B.5', '3-2-1', '한 자리 수 곱하기 · 받아올림 3번', '×', 3, 3,
      'Three-Digit by One-Digit Multiplication with Three Regroupings Worksheets')
  ];

  function entry(id, grade, standard, sourceUnit, sourceProfile, op, digits, target, title) {
    return {id, grade, standard, sourceUnit, sourceProfile, op, digits, target, title};
  }

  for (const def of definitions) {
    Worksheets.types.push({
      id: def.id,
      title: def.title,
      family: 'Natural numbers',
      group: def.op === '+' ? 'Addition' : def.op === '−' ? 'Subtraction' : 'Multiplication',
      example: def.op === '×' ? (def.digits === 2 ? '24 × 3' : '246 × 3') : def.op === '+' ? '247 + 385' : '642 − 278',
      instruction: instruction(def),
      bankId: `regrouping-reuse:${def.id}`
    });
  }

  function countWord(value) {
    return ['no', 'one', 'two', 'three'][value] || String(value);
  }

  function instruction(def) {
    const action = def.op === '+' ? 'add' : def.op === '−' ? 'subtract' : 'multiply';
    const times = def.target === 0 ? 'without regrouping' : `with exactly ${countWord(def.target)} regrouping ${def.target === 1 ? 'step' : 'steps'}`;
    return `Use place value to ${action} ${times}. Show and check each calculation.`;
  }

  function profileIndex(def) {
    const index = source.profiles(def.sourceUnit).findLastIndex(profile => profile.name === def.sourceProfile);
    if (index < 0) throw new Error(`Missing Korean source profile: ${def.sourceUnit} / ${def.sourceProfile}`);
    return index;
  }

  function normalizeTask(task) {
    return String(task || '')
      .replaceAll('class="kequation"', 'class="regrouping-equation"')
      .replaceAll('class="calculation-space"', 'class="regrouping-workspace"')
      .replaceAll('□', '<span class="kblank" aria-label="answer space"></span>');
  }

  function translateAnswer(answer) {
    return String(answer).replace(/^○$/, '✓').replace(/^×,\s*/, '✗, ');
  }

  function translateReason(question, def, activityIndex) {
    if (activityIndex === 0) {
      if (def.target === 0) return 'No regrouping is needed in this calculation.';
      if (def.op === '×') return `Regrouping occurs exactly ${countWord(def.target)} ${def.target === 1 ? 'time' : 'times'} in the standard multiplication steps.`;
      return `${def.op === '+' ? 'Addition' : 'Subtraction'} regrouping occurs exactly ${countWord(def.target)} ${def.target === 1 ? 'time' : 'times'}.`;
    }
    if (activityIndex === 1) return String(question.reason || '').replaceAll('검산:', 'Check:');
    return `Check: ${question.check.a} ${def.op} ${question.check.b} = ${question.check.value}.`;
  }

  function translateQuestion(question, def, activityIndex) {
    const prompts = [
      'Calculate. Show your place-value work.',
      'Find the missing number. Substitute it into the original equation to check.',
      'Write ✓ if the calculation is correct. If it is incorrect, write ✗ and correct it.'
    ];
    return {
      ...question,
      prompt: prompts[activityIndex],
      visual: '',
      task: normalizeTask(question.task),
      answer: translateAnswer(question.answer),
      reason: translateReason(question, def, activityIndex)
    };
  }

  function build(def, seed) {
    const sourceSections = source.generate(def.sourceUnit, profileIndex(def), seed >>> 0, 2);
    const sectionTitles = ['Compute and show the steps', 'Find the missing number', 'Check and correct'];
    return sourceSections.flatMap((section, activityIndex) =>
      section.questions.map(question => ({
        title: sectionTitles[activityIndex],
        questions: [translateQuestion(question, def, activityIndex)]
      }))
    );
  }

  globalThis.KoMath = {
    ...source,
    generate(id, profile, seed, count) {
      if (!String(id).startsWith('regrouping-reuse:')) return source.generate(id, profile, seed, count);
      const pageId = String(id).slice('regrouping-reuse:'.length);
      const def = definitions.find(item => item.id === pageId);
      if (!def) throw new Error(`Unknown regrouping worksheet ${pageId}`);
      return build(def, seed);
    }
  };

  globalThis.RegroupingReuse = {definitions};
})();
