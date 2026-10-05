(function (root) {
  'use strict';
  const renderers = new Map();
  const node = (tag, className, value) => {
    const el = document.createElement(tag); if (className) el.className = className;
    if (value !== undefined) el.textContent = value; return el;
  };
  function register(formatKey, renderFn) {
    if (renderers.has(formatKey) && renderers.get(formatKey) !== renderFn) throw Error('서식 중복 등록: ' + formatKey);
    renderers.set(formatKey, renderFn);
  }
  function digits(value, width) {
    const row = node('div', 'vertical-row');
    const sign = node('span', 'vertical-sign'); row.append(sign);
    const chars = String(value).padStart(width, ' ').split('');
    chars.forEach(ch => row.append(node('span', 'vertical-digit', ch === ' ' ? '\u00a0' : ch)));
    return row;
  }
  function carrySlots(width) {
    const row = node('div', 'vertical-row carry-row'); row.append(node('span', 'vertical-sign'));
    for (let i = 0; i < width; i++) row.append(node('span', 'vertical-digit', '\u00a0'));
    return row;
  }
  function createHeader(config, answer) {
    const head = node('header', 'sheet-head');
    head.append(node('span', 'sheet-brand', '구구단닷컴'));
    head.append(node('span', 'sheet-title', config.title + (answer ? ' · 정답' : '')));
    head.append(node('span', 'sheet-kind', answer ? '정답지' : '학습 문제지'));
    const fields = node('div', 'sheet-fields');
    fields.append(node('span', 'sheet-field', '이름'), node('span', 'sheet-field', '날짜'), node('span', 'sheet-field', '시간 / 맞힌 개수'));
    head.append(fields);
    return head;
  }
  register('horizontal', (cell, q, answer) => {
    const line = node('div', 'horizontal');
    line.append(node('span', '', q.a + ' ' + q.op + ' ' + q.b + ' = '));
    line.append(node('span', 'answer-space', answer ? String(q.answer) : '\u00a0'));
    cell.append(line);
  });
  register('blank-equation', (cell, q, answer, config) => {
    // 곱셈구구(0-3-1) 빈칸 식은 글자를 150% 로 키우고 칸의 가로·세로 가운데에 놓는다.
    if (String(config?.gen?.conceptId || '').startsWith('0-3-1')) cell.classList.add('cell-center-big');
    const line = node('div', 'horizontal');
    const parts = [String(q.a), String(q.b), String(q.answer)];
    parts.forEach((part, index) => {
      if (index === 1) line.append(node('span', '', ' ' + q.op + ' '));
      if (index === 2) line.append(node('span', '', ' = '));
      line.append(node('span', index === q.mask ? 'blank-space' : '', index === q.mask && !answer ? '\u00a0' : part));
    });
    cell.append(line);
  });
  register('vertical-addsub', (cell, q, answer, config) => {
    const pattern = String(config.gen?.legacyId || '').match(/^natural-(?:add|sub)-(\d+)-(\d+)$/);
    const fixed = pattern ? Math.max(Number(pattern[1]), Number(pattern[2])) + (q.op === '+' ? 1 : 0) : 0;
    const width = Math.max(fixed, String(q.a).length, String(q.b).length, String(q.answer).length);
    const stack = node('div', 'vertical');
    stack.append(carrySlots(width), digits(q.a, width));
    const bottom = digits(q.b, width); bottom.firstChild.textContent = q.op; stack.append(bottom);
    const result = digits(answer ? q.answer : '', width); result.classList.add('vertical-rule', 'vertical-result');
    stack.append(result); cell.append(stack);
  });
  register('vertical-mul', (cell, q, answer) => {
    const two = String(q.b).length > 1;
    const width = Math.max(String(q.answer).length, String(q.a).length + String(q.b).length);
    const stack = node('div', 'vertical');
    stack.append(carrySlots(width), digits(q.a, width));
    const bottom = digits(q.b, width); bottom.firstChild.textContent = '×'; stack.append(bottom);
    if (two) {
      const first = digits(answer ? Number(q.a) * (Number(q.b) % 10) : '', width);
      const second = digits(answer ? Number(q.a) * Math.floor(Number(q.b) / 10) * 10 : '', width);
      first.classList.add('vertical-rule', 'partial-row'); second.classList.add('partial-row');
      stack.append(first, second);
    }
    const result = digits(answer ? q.answer : '', width);
    result.classList.add('vertical-rule', 'vertical-result'); stack.append(result); cell.append(stack);
  });
  function grid(config, questions, answer) {
    const wrap = node('div', 'sheet-grid');
    wrap.style.gridTemplateColumns = `repeat(${config.cols}, minmax(0, 1fr))`;
    wrap.style.gridTemplateRows = `repeat(${config.rows}, minmax(0, 1fr))`;
    wrap.style.fontSize = ((config.fontPt || 12) * 0.9).toFixed(2) + 'pt';
    const renderer = renderers.get(config.format);
    if (!renderer) throw Error('등록되지 않은 서식: ' + config.format);
    questions.forEach((q, i) => {
      const cell = node('div', 'sheet-cell'); cell.append(node('span', 'sheet-number', String(i + 1)));
      if (globalThis.IconPool) globalThis.IconPool.at((Number(config.seed) || 1) + String(config.typeId || '').length * 131, i);
      renderer(cell, q, answer, config); wrap.append(cell);
    });
    return wrap;
  }
  function page(config, questions, answer) {
    const page = node('section', 'sheet-page ' + (answer ? 'answer-page' : 'problem-page'));
    page.append(createHeader(config, answer), node('div', 'sheet-instruction', config.instruction || '계산하여 답을 쓰세요.'));
    if (config.pair) {
      const pair = node('div', 'sheet-pair');
      for (const side of ['left', 'right']) {
        const sub = config.pair[side], half = node('div', 'pair-half');
        half.append(node('div', 'pair-heading', sub.title), grid(sub, questions[side], answer));
        pair.append(half);
      }
      page.append(pair);
    } else page.append(grid(config, questions, answer));
    return page;
  }
  function validate(config) {
    if (config.pair) {
      for (const side of ['left', 'right']) validate(config.pair[side]);
      return;
    }
    if (!config.typeId || !config.format || !Number.isInteger(config.cols) || !Number.isInteger(config.rows)) throw Error('유형 설정에 typeId, format, cols, rows가 필요합니다.');
    if (config.count !== config.cols * config.rows) throw Error(config.typeId + ': count는 cols × rows와 같아야 합니다.');
  }
  // The usable grid height is measured in the actual browser, after fonts and
  // format-specific CSS have loaded. Work lines plus 4 mm are the lower bound.
  function minimumCellMm(config) {
    const key = config.format;
    if (/matching-lines|table|array$/.test(key)) return 20;
    if (/picture|diagram|number-line|color-fraction|bar-compare/.test(key)) return 38;
    if (/error-fix|error-correction/.test(key)) return 52;
    if (/division/.test(key) && !/horizontal/.test(key)) return ((config.workLines || (String(config.gen?.legacyId || '').includes('-2') ? 8 : 6)) + 2) * 4.2 + 4;
    if (/vertical.*mul|vertical-mul/.test(key)) return (config.workLines || (String(config.gen?.legacyId || '').endsWith('-2-2') ? 5 : 4)) * 4.7 + 4;
    if (/vertical|correction/.test(key)) return (config.workLines || 4) * 4.7 + 4;
    if (/fraction-different|fraction-steps/.test(key)) return 20;
    if (/fraction/.test(key)) return 14;
    if (/ordering|extremes|condition-choice/.test(key)) return 14;
    return 10;
  }
  function fits(target, config) {
    const mm = 96 / 25.4;
    const floor = minimumCellMm(config) * mm;
    for (const page of target.querySelectorAll('.sheet-page')) {
      const hidden = getComputedStyle(page).display === 'none';
      if (hidden) page.style.display = 'flex';
      try {
      const grid = page.querySelector('.sheet-grid');
      if (!grid) continue;
      const rowHeight = grid.getBoundingClientRect().height / config.rows;
      if (rowHeight + .5 < floor) return false;
      for (const cell of grid.children) {
        if (cell.scrollWidth > cell.clientWidth + 1 || cell.scrollHeight > cell.clientHeight + 1) return false;
        for (const child of cell.children) {
          if (child.classList.contains('sheet-number')) continue;
          if (child.getBoundingClientRect().bottom > cell.getBoundingClientRect().bottom - 2) return false;
        }
      }
      } finally { if (hidden) page.style.removeProperty('display'); }
    }
    return true;
  }
  function renderOnce(config, target) {
    if (root.MatchingSheet?.formats?.[config.format]) {
      root.MatchingSheet.css();
      const built = root.MatchingSheet.build(config);
      target.replaceChildren(root.MatchingSheet.renderPage(config, false, built), root.MatchingSheet.renderPage(config, true, built));
      root.Sheet.last = { config, questions: built.items };
      return built.items;
    }
    const questions = config.pair ? {
      left: root.SheetGen.generate(config.pair.left),
      right: root.SheetGen.generate(config.pair.right)
    } : root.SheetGen.generate(config);
    target.replaceChildren(page(config, questions, false), page(config, questions, true));
    pastelDiagramFills(target);
    singleAdditionSign(target);
    singleMultiplicationRule(target);
    root.Sheet.last = { config, questions };
    return questions;
  }
  // 어떤 경우에도 한 장(문제지)에 문제를 40개 넘게 싣지 않는다.
  const MAX_PROBLEMS = 40;
  // 세 자리 이상 수의 계산(덧셈·뺄셈·곱셈·나눗셈)은 한 장에 30문제를 넘지 않는다. 유형 제목의 '세·네·다섯… 자리' 로 가려낸다.
  const BIG_NUMBER = /(세|네|다섯|여섯|일곱|여덟|아홉|열)\s*자리|큰 수|[3-9]\s*자리|\d{3,}\s*[+\-−×÷]/;
  function limitOf(config) {
    let max = Math.min(config.maxProblems || MAX_PROBLEMS, MAX_PROBLEMS);   // 유형이 더 낮은 상한(예: 25·30)을 지정할 수 있다
    const title = config.title || (config.pair && ((config.pair.left || {}).title || '')) || '';
    if (BIG_NUMBER.test(title)) max = Math.min(max, 30);
    if (/^1-/.test(String(config.typeId || ''))) max = Math.min(max, 24);   // 분수 단원(typeId 1-…)은 한 장 최대 24문제
    return max;
  }
  function capProblems(config) {
    const MAX = limitOf(config);
    if (config.pair) {
      const sides = ['left', 'right'], total = sides.reduce((sum, side) => sum + config.pair[side].cols * config.pair[side].rows, 0);
      if (total <= MAX) return config;
      const pair = {};
      for (const side of sides) {
        const sub = config.pair[side], rows = Math.max(1, Math.floor(MAX / 2 / sub.cols));
        pair[side] = { ...sub, rows, count: sub.cols * rows };
      }
      return { ...config, pair };
    }
    if (!(config.cols > 0) || config.cols * config.rows <= MAX) return config;
    const rows = Math.max(1, Math.floor(MAX / config.cols));
    return { ...config, rows, count: config.cols * rows };
  }
  // 정답지에서만 채워지는 글자(문제지에서는 비어 있는 자리)에 ans-fill 표시를 달아 CSS 가 모두 같은 빨간색으로 칠하게 한다.
  // 유형마다 클래스 이름이 달라 이름 규칙만으로는 빠지는 곳이 생기기 때문이다.
  function markAnswerFills(target) {
    const problem = target.querySelector('.problem-page'), answer = target.querySelector('.answer-page');
    if (!problem || !answer) return;
    const clean = node => (node.textContent || '').replace(/[\s ]/g, '');
    const walk = (a, q) => {
      if (!a || !q) return;
      // 문제지에는 빈 칸인데 정답지에는 하위 요소(분수 등)가 채워진 경우: 그 안의 글자 전부가 정답이다.
      if (!q.children.length && a.children.length && !clean(q)) {
        for (const leaf of a.querySelectorAll('*')) if (!leaf.children.length && clean(leaf)) leaf.classList.add('ans-fill');
        return;
      }
      if (!a.children.length && !q.children.length) {
        if (clean(a) && !clean(q)) a.classList.add('ans-fill');
        return;
      }
      const n = Math.min(a.children.length, q.children.length);
      for (let i = 0; i < n; i++) walk(a.children[i], q.children[i]);
    };
    walk(answer, problem);
  }
  // 글자 크기 상한(사용자 확정 2026-10-03): 기준 시험지(분모 10인 분수 → 소수)의 본문 글자 21.6px(16.2pt)를 넘는 글자는 모두 이 크기로 줄인다.
  const FONT_CAP_PX = 21.6;
  function capFonts(target) {
    const saved = document.body.className;
    document.body.className = '';            // 문제지·정답지를 모두 배치해 측정
    try {
      for (const page of target.querySelectorAll('.sheet-page')) {
        for (const el of page.querySelectorAll('*')) {
          if (el.closest('.sheet-head')) continue;
          if (el instanceof SVGElement) {
            if (!/^(text|tspan)$/i.test(el.tagName)) continue;
            const svg = el.ownerSVGElement; if (!svg) continue;
            const vb = svg.viewBox && svg.viewBox.baseVal, w = svg.getBoundingClientRect().width;
            const k = vb && vb.width ? w / vb.width : 1;
            const fs = parseFloat(getComputedStyle(el).fontSize);
            if (k > 0 && fs * k > FONT_CAP_PX + 0.2) el.style.setProperty('font-size', (FONT_CAP_PX / k).toFixed(2) + 'px', 'important');
          } else {
            const fs = parseFloat(getComputedStyle(el).fontSize);
            if (fs > FONT_CAP_PX + 0.2) el.style.setProperty('font-size', FONT_CAP_PX + 'px', 'important');
          }
        }
      }
    } finally { document.body.className = saved; }
  }
  // 공통 세로 덧셈: 여러 피가수를 쌓아도 맨 아래 피가수에 + 하나만 표시한다.
  // 중간 회색으로 칠한 학습 도형을 파스텔색으로 통일. 흰색 빈 부분과 검정 경계는 보존.
  function pastelDiagramFills(target) {
    const colors = ['#c4dfb8','#819fba','#e3aa9a','#fff0b3','#87658f'];
    for (const svg of target.querySelectorAll('.sheet-cell svg,.mt-block svg')) {
      let index = 0;
      for (const el of svg.querySelectorAll('[fill]')) {
        const fill = el.getAttribute('fill').toLowerCase();
        const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/.exec(fill);
        if (!hex) continue;
        const h = hex[1].length === 3 ? [...hex[1]].map(c => c+c).join('') : hex[1];
        const values = [0,2,4].map(i => parseInt(h.slice(i,i+2),16));
        if (values[0]===values[1] && values[1]===values[2] && values[0]>=100 && values[0]<=235) el.setAttribute('fill',colors[0]);
      }
    }
  }
  // 세로 곱셈에서 숫자가 없는 빈 계산 공간의 추가 가로선만 제거.
  function singleMultiplicationRule(target) {
    for (const stack of target.querySelectorAll('.vertical,.decimal-stack')) {
      const signs = [...stack.querySelectorAll('.vertical-sign,.decimal-row')];
      if (!signs.some(el => el.textContent.includes('×'))) continue;
      const rules = [...stack.querySelectorAll('.vertical-rule,.decimal-rule')].filter(el => el.closest('.vertical,.decimal-stack') === stack);
      rules.slice(1).forEach(el => {
        const first = rules[0];
        const rows = [...stack.children];
        const begin = rows.indexOf(first), end = rows.indexOf(el);
        // 부분곱·합에 숫자가 있으면 실제 계산 구분선이므로 보존한다.
        const working = rows.slice(Math.max(0,begin), end+1).some(row => /[0-9]/.test(row.textContent));
        const decimalResult = el.classList.contains('decimal-rule') && /[0-9]/.test(el.nextElementSibling?.textContent || '');
        if (!working && !decimalResult) el.style.setProperty('border-top','0','important');
      });
    }
  }
  function singleAdditionSign(target) {
    for (const stack of target.querySelectorAll('.vertical')) {
      const signs = [...stack.querySelectorAll('.vertical-sign')].filter(el => el.closest('.vertical') === stack && el.textContent.trim());
      if (signs.length > 1 && signs.every(el => el.textContent.trim() === '+')) {
        signs.slice(0, -1).forEach(el => { el.textContent = ''; });
      }
    }
  }
  function render(config) {
    config = capProblems(config);
    validate(config);
    const target = document.getElementById('sheet-root');
    if (!target) throw Error('#sheet-root가 필요합니다.');
    target.replaceChildren();
    let questions;
    questions = renderOnce(config, target);
    // Keep requested counts as an upper limit; reduce rows when either page is crowded.
    // Matching bundles have their own layout and cannot use cols × rows directly.
    if (config.autoFit !== false && !config.pair && config.cols > 0 && !root.MatchingSheet?.formats?.[config.format]) {
      capFonts(target);
      while (config.rows > 1 && !fits(target, config)) {
        config = { ...config, rows: config.rows - 1, count: config.cols * (config.rows - 1) };
        questions = renderOnce(config, target);
        capFonts(target);
      }
    }
    pastelDiagramFills(target);
    singleAdditionSign(target);
    singleMultiplicationRule(target);
    root.Sheet.last = { config, questions };
    try { markAnswerFills(target); } catch (error) { /* 표시는 보조 기능 */ }
    try { capFonts(target); } catch (error) { /* 글자 상한은 보조 기능 */ }
    return questions;
  }
  root.Sheet = { register, render, renderers, minimumCellMm, fits, createHeader };
})(globalThis);
