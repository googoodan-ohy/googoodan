(function (root) {
  'use strict';
  /*
   * 묶음 1-3-1 — 분수와 자연수의 곱셈 (개념 5개 × 유형 4개 = typeId 20개)
   *
   * 개념   1-3-1-0 진분수 × 자연수 / 1-3-1-1 가분수 × 자연수 / 1-3-1-2 대분수 × 자연수
   *        1-3-1-3 자연수 × 진분수 / 1-3-1-4 자연수 × 대분수
   * 유형   t1 가로식으로 계산하기   t2 단계별 계산의 빈칸 채우기
   *        t3 계산 결과와 같은 분수 연결하기   t4 잘못된 계산 과정 고치기
   *
   * 수는 사이트의 기존 생성기(src/bank/legacy/types.js 의 fraction-mul-<형>-<형>)에서만 가져온다.
   * 새 문제 엔진을 만들지 않고, 개념 조건(진분수/가분수/대분수 × 자연수)에 맞지 않는 문항과
   * 자연수 1이 들어가 곱해도 그대로인 쉬운 문항(전체 10% 이하)·중복 문항은 걸러 내고 모자라면 더 뽑는다.
   *
   * 서식 키는 이 묶음 전용(g131-)이다. 공용 파일(sheet.js, formats-*.js)은 고치지 않고
   * install()에서 SheetGen.generate 를 감싸고(기존 서식 파일들과 같은 방식), Sheet.register 와
   * MatchingSheet.formats 로 이 묶음용 렌더러를 붙인다.
   *
   * 배치(layout-rules.md §2): t1 2단×12줄=24, t2 2단×10줄=20,
   *                          t3 3묶음×6쌍=18쌍, t4 3단×4줄=12 — 모두 최소 기준값이다.
   *                          실제 문항 수는 sheet.js 의 autoFit 이 인쇄 영역에 맞춰 늘린다.
   */

  const CONCEPTS = [
    { id: '1-3-1-0', name: '진분수 × 자연수', legacy: 'fraction-mul-proper-whole', form: 'proper' },
    { id: '1-3-1-1', name: '가분수 × 자연수', legacy: 'fraction-mul-improper-whole', form: 'improper' },
    { id: '1-3-1-2', name: '대분수 × 자연수', legacy: 'fraction-mul-mixed-whole', form: 'mixed' },
    { id: '1-3-1-3', name: '자연수 × 진분수', legacy: 'fraction-mul-whole-proper', form: 'proper' },
    { id: '1-3-1-4', name: '자연수 × 대분수', legacy: 'fraction-mul-whole-mixed', form: 'mixed' }
  ];

  const FORMAT = {
    horizontal: 'g131-fraction-horizontal',
    steps: 'g131-fraction-steps',
    matching: 'g131-matching-lines',
    errorfix: 'g131-error-correction'
  };

  const TYPES = [
    { suffix: 't1', name: '가로식으로 계산하기', format: FORMAT.horizontal, cols: 3, rows: 8, fontPt: 15, workLines: 1,
      instruction: '계산하여 답을 기약분수나 대분수로 쓰세요.' },
    { suffix: 't2', name: '단계별 계산의 빈칸 채우기', format: FORMAT.steps, cols: 2, rows: 11, fontPt: 13.5, workLines: 1,
      instruction: '빈칸에 알맞은 수를 써서 풀이를 완성하세요.' },
    { suffix: 't3', name: '계산 결과와 같은 분수 연결하기', format: FORMAT.matching, cols: 6, rows: 4, fontPt: 12, workLines: 0,
      instruction: '서로 알맞은 것끼리 선으로 이으세요.' },
    { suffix: 't4', name: '잘못된 계산 과정 고치기', format: FORMAT.errorfix, cols: 3, rows: 4, fontPt: 11, workLines: 2,
      instruction: '잘못 계산한 곳을 찾아 바르게 고쳐 쓰세요.' }
  ];

  const MINE = new Set(TYPES.map(type => type.format));
  const CIRCLED = '①②③④⑤⑥⑦⑧⑨⑩';
  // 자연수 1을 곱하는 문항은 곱셈 훈련이 되지 않아 한 장도 넣지 않는다
  // (layout-rules §2 는 0·1이 들어가는 쉬운 문항을 10% 이하로 두라고 하므로 이보다 엄격하다).
  const EASY_LIMIT = 0;

  /* ------------------------------------------------------------ 기본 도구 */
  const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const gcd = (a, b) => b ? gcd(b, a % b) : Math.abs(a);
  /** 같은 seed 면 같은 문제가 나오도록 하는 난수. */
  function random(seed) {
    let state = (Number(seed) >>> 0) || 1;
    return (lo, hi) => {
      state += 0x6D2B79F5;
      let t = state;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return lo + Math.floor(((t ^ t >>> 14) >>> 0) / 4294967296 * (hi - lo + 1));
    };
  }
  function shuffle(list, rnd) {
    const out = list.slice();
    for (let i = out.length - 1; i > 0; i--) { const j = rnd(0, i); const swap = out[i]; out[i] = out[j]; out[j] = swap; }
    return out;
  }
  const node = (tag, className, html) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (html !== undefined) el.innerHTML = html;
    return el;
  };
  /** 기약 가분수 문자열(Worksheets.fraction)을 답 표기(기약분수 또는 대분수)로 고친다. */
  function displayFraction(n, d) {
    const reduced = String(root.Worksheets.fraction(n, d));
    const parts = reduced.split('/');
    if (parts.length !== 2) return reduced;
    const [rn, rd] = parts.map(Number);
    const whole = Math.trunc(rn / rd), rem = rn % rd;
    return whole && rem ? `${whole} ${rem}/${rd}` : reduced;
  }
  function fracHTML(text) {
    const value = String(text).trim();
    const mixed = value.match(/^(\d+)\s+(\d+)\/(\d+)$/);
    if (mixed) return `<span class="g131-m"><span>${esc(mixed[1])}</span>${fracHTML(`${mixed[2]}/${mixed[3]}`)}</span>`;
    const plain = value.match(/^(\d+)\/(\d+)$/);
    if (plain) return `<span class="g131-frac"><span>${esc(plain[1])}</span><span>${esc(plain[2])}</span></span>`;
    return esc(value);
  }
  /** 가분수 문자열을 기약분수 문자열로. */
  const reducedOf = text => {
    const [n, d] = root.Worksheets.rational(text);
    return String(root.Worksheets.fraction(n, d));
  };

  /* -------------------------------------------------- 기존 생성기에서 뽑기 */
  /** 문항 하나가 개념 조건에 맞는지 확인하고 계산 값까지 붙여 돌려준다. 맞지 않으면 null. */
  function parseProblem(row, concept) {
    if (!row || row.op !== '×') return null;
    const a = String(row.a), b = String(row.b);
    const aFraction = a.includes('/'), bFraction = b.includes('/');
    if (aFraction === bFraction) return null;                   // 둘 다 분수이거나 둘 다 자연수면 이 개념이 아니다
    const fractionText = (aFraction ? a : b).trim(), wholeText = aFraction ? b : a;
    const whole = Number(wholeText);
    if (!Number.isInteger(whole) || whole < 1 || whole > 9) return null;
    const [fn, fd] = root.Worksheets.rational(fractionText);
    if (!(fd >= 2 && fd <= 12) || !(fn >= 1)) return null;
    const mixedMatch = fractionText.match(/^(\d+)\s+(\d+)\/(\d+)$/);
    const isMixed = !!mixedMatch;
    if (concept.form === 'mixed' ? !isMixed : isMixed) return null;
    if (concept.form === 'proper' && !(fn < fd)) return null;    // 진분수: 1 <= 분자 < 분모
    if (concept.form === 'improper' && !(fn > fd)) return null;   // 가분수: 분모 < 분자
    if (gcd(fn, fd) !== 1) return null;                          // 분수는 기약분수 꼴로만 쓴다(2 2/4 같은 꼴은 쓰지 않는다)
    const [n, d] = root.Worksheets.exact(a, b, row.op);
    if (!(n > 0) || !(d > 0)) return null;                       // 답은 항상 양수
    const reducedText = reducedOf(`${n}/${d}`);
    return {
      key: `${fractionText}|${whole}`,
      a, b, op: row.op, fractionText, whole, wholeFirst: !aFraction,
      fn, fd, mixed: isMixed,
      wholePart: mixedMatch ? Number(mixedMatch[1]) : 0,
      num: mixedMatch ? Number(mixedMatch[2]) : 0,
      den: mixedMatch ? Number(mixedMatch[3]) : 0,
      prodN: fn * whole, prodD: fd,
      prodText: `${fn * whole}/${fd}`,
      reducedText,
      answerText: displayFraction(n, d),
      valueKey: reducedText,
      easy: whole === 1,                                         // 자연수 1이면 곱해도 그대로다
      rank: fd * 100 + whole * 10 + fn
    };
  }
  /** 조건에 맞는 문항을 기존 생성기에서 count개 뽑는다. 모자라면 계속 더 뽑는다. */
  function sourceProblems(concept, seed, count, need, easyLimit) {
    const out = [], seen = new Set();
    let easy = 0;
    const batch = Math.max(count, 24);
    for (let round = 0; out.length < count && round < 800; round++) {
      const rows = root.Worksheets.generate(concept.legacy, (Number(seed) + Math.imul(round, 2654435761)) >>> 0, batch);
      for (const row of rows) {
        const problem = parseProblem(row, concept);
        if (!problem || seen.has(problem.key)) continue;
        if (need && !need(problem)) continue;
        if (problem.easy && easy >= easyLimit) continue;
        seen.add(problem.key); out.push(problem);
        if (problem.easy) easy++;
        if (out.length === count) break;
      }
    }
    if (out.length !== count) throw Error(`${concept.name}: 조건에 맞는 문항 ${count}개 중 ${out.length}개만 만들었습니다.`);
    return out;
  }
  const byDifficulty = (a, b) => a.rank - b.rank || a.fractionText.localeCompare(b.fractionText);
  const expressionHTML = problem =>
    problem.wholeFirst ? `${problem.whole}<span class="g131-eq">×</span>${fracHTML(problem.fractionText)}` : `${fracHTML(problem.fractionText)}<span class="g131-eq">×</span>${problem.whole}`;
  /** 가로식 문제지의 풀이 줄 — 실제 계산 과정 한 줄. */
  const workHTML = problem => problem.mixed
    ? `${fracHTML(`${problem.fn}/${problem.fd}`)}<span class="g131-eq">×</span>${problem.whole}<span class="g131-eq">=</span>${fracHTML(problem.prodText)}`
    : `<span class="g131-frac"><span>${problem.fn}×${problem.whole}</span><span>${problem.fd}</span></span><span class="g131-eq">=</span>${fracHTML(problem.prodText)}`;
  /** 풀이 사슬(식 = … = 답). value 가 있는 토큰만 빈칸으로 가릴 수 있다. */
  function chainTokens(problem) {
    const tokens = [{ html: expressionHTML(problem) }];
    let last = null;
    const push = text => { tokens.push({ text: '=', value: text }); last = text; };
    if (problem.mixed) {
      tokens.push({ text: '=', value: `${problem.fn}/${problem.fd}` });
      tokens.push({ text: `× ${problem.whole}` });
    }
    push(problem.prodText);
    if (problem.reducedText !== last) push(problem.reducedText);
    if (problem.answerText !== last) push(problem.answerText);
    return tokens;
  }
  const tokenHTML = token => {
    if (token.html !== undefined) return token.html;
    const sign = token.text ? `<span class="g131-eq">${esc(token.text)}</span>` : '';
    return token.value !== undefined ? `${sign} ${fracHTML(token.value)}`.trim() : sign;
  };

  /* ------------------------------------------------------------ 유형별 문항 */
  function horizontalItems(config, concept) {
    const count = config.count || config.cols * config.rows;
    return sourceProblems(concept, config.seed, count, null, EASY_LIMIT).sort(byDifficulty);
  }
  const valueCount = problem => chainTokens(problem).filter(token => token.value !== undefined).length;
  function stepItems(config, concept) {
    const count = config.count || config.cols * config.rows;
    const rnd = random((Number(config.seed) ^ 0x2545F491) >>> 0);
    // 단계가 하나뿐인 문제(곱한 값이 곧 답)는 '단계별' 문제지에 맞지 않으므로 걸러 낸다.
    return sourceProblems(concept, config.seed, count, problem => valueCount(problem) >= 2, EASY_LIMIT)
      .sort(byDifficulty)
      .map(problem => {
        // 마지막 값(답)은 반드시 가리고, 단계가 셋 이상이면 중간 한 곳을 더 가린다(1~2개).
        // 같은 seed 면 같은 자리가 비워진다.
        const tokens = chainTokens(problem);
        const values = tokens.map((token, index) => ({ token, index })).filter(item => item.token.value !== undefined);
        const mask = new Set([values[values.length - 1].index]);
        if (values.length > 2 && rnd(0, 1)) mask.add(values[rnd(0, values.length - 2)].index);
        return { problem, tokens, masked: [...mask].sort((a, b) => a - b) };
      });
  }
  function matchingItems(config, concept) {
    const bundles = Math.max(1, Math.min(6, config.gen?.bundles || config.cols || 3));
    const perBundle = Math.max(4, Math.min(10, config.gen?.perBundle || config.rows || 6));
    const wanted = bundles * perBundle;
    // 한 묶음 안에서 답이 겹치면 어느 것에 이어야 할지 알 수 없으므로 값이 겹치지 않게 담는다.
    const pool = sourceProblems(concept, config.seed, Math.max(wanted * 3, wanted + 12), null, EASY_LIMIT).sort(byDifficulty);
    const groups = Array.from({ length: bundles }, () => []);
    for (const problem of pool) {
      if (groups.every(group => group.length >= perBundle)) break;
      for (const group of groups) {
        if (group.length >= perBundle || group.some(other => other.valueKey === problem.valueKey)) continue;
        group.push(problem); break;
      }
    }
    if (groups.some(group => group.length !== perBundle)) throw Error(`${concept.name}: 연결하기 묶음을 채우지 못했습니다.`);
        return groups.map((group, index) => ({
      kind: 'bundle', caption: '', pairs: group, rowsWeight: perBundle
    }));
  }
  /*
   * 잘못된 계산 과정 고치기의 오류 종류. 명세의 errorKinds 세 가지를 그대로 쓰되,
   * '대분수를 가분수로 바꾸지 않기'는 대분수가 들어가는 개념에서만 나올 수 있으므로
   * 대분수가 없는 개념에서는 분자와 분모에 자연수를 모두 곱하는 오류를 대신 쓴다.
   */
  function errorKinds(concept) {
    const kinds = [{
      id: 'cross-multiplied', label: '분자와 분모를 교차하여 곱함',
      need: problem => problem.whole >= 2,                        // 자연수가 1이면 엇갈려 곱해도 값이 같다
      wrong: problem => `${problem.fn}/${problem.fd * problem.whole}`
    }];
    if (concept.form === 'mixed') kinds.push({
      id: 'mixed-not-converted', label: '대분수를 가분수로 바꾸지 않음',
      need: problem => problem.whole >= 2,                        // 자연수가 1이면 곱해도 값이 그대로라 틀린 셈이 아니다
      wrong: problem => `${problem.wholePart * problem.whole} ${problem.num}/${problem.den}`
    });
    else kinds.push({
      id: 'both-multiplied', label: '분자와 분모에 모두 자연수를 곱함',
      need: problem => problem.whole >= 2,
      wrong: problem => `${problem.fn * problem.whole}/${problem.fd * problem.whole}`
    });
    // 약분하지 않은 결과는 값이 같지만, 기약분수로 쓰라는 조건에 맞지 않는다.
    kinds.push({
      id: 'not-reduced', label: '약분하지 않음',
      need: problem => gcd(problem.prodN, problem.prodD) > 1 && problem.reducedText !== problem.prodText,
      wrong: problem => problem.prodText
    });
    return kinds;
  }
  function errorItems(config, concept) {
    const count = config.count || config.cols * config.rows;
    const kinds = errorKinds(concept);
    const perKind = Math.ceil(count / kinds.length) + 1;
    const seen = new Set();
    const pools = kinds.map((kind, index) => {
      const pool = sourceProblems(concept, (Number(config.seed) + index * 104729) >>> 0, perKind,
        problem => !seen.has(problem.key) && kind.need(problem), EASY_LIMIT);
      pool.forEach(problem => seen.add(problem.key));           // 같은 문제가 두 번 나오지 않게
      return pool;
    });
    const items = [];
    for (let i = 0; i < count; i++) items.push({ kind: kinds[i % kinds.length], problem: pools[i % kinds.length][Math.floor(i / kinds.length)] });
    if (items.some(item => !item.problem)) throw Error(`${concept.name}: 잘못된 계산 고치기 문항을 채우지 못했습니다.`);
    return items.sort((a, b) => a.problem.rank - b.problem.rank || a.kind.id.localeCompare(b.kind.id));
  }
  function generateItems(config) {
    const concept = CONCEPTS.find(item => item.id === config.gen?.concept);
    if (!concept) throw Error(`묶음 1-3-1에 없는 개념입니다: ${config.gen?.concept}`);
    switch (config.format) {
      case FORMAT.horizontal: return horizontalItems(config, concept);
      case FORMAT.steps: return stepItems(config, concept);
      case FORMAT.matching: return matchingItems(config, concept);
      case FORMAT.errorfix: return errorItems(config, concept);
      default: throw Error(`묶음 1-3-1에 없는 서식입니다: ${config.format}`);
    }
  }

  /* ---------------------------------------------------------------- 그리기 */
  const CSS = `
    html:has(#g131-style) .sheet-head{gap:2mm;font-size:8.5pt}
    html:has(#g131-style) .sheet-brand{font-size:7pt}
    html:has(#g131-style) .sheet-field{min-width:0}
    .g131-line{display:flex;align-items:center;justify-content:center;white-space:nowrap;line-height:1.2}
    .g131-frac{display:inline-flex;flex-direction:column;vertical-align:middle;text-align:center;line-height:1.05;min-width:1.3em;font-variant-numeric:tabular-nums}
    .g131-frac>span:first-child{border-bottom:1px solid #111;padding:0 .12em .04em}
    .g131-frac>span:last-child{padding:.04em .12em 0}
    .g131-m{display:inline-flex;align-items:center;vertical-align:middle;gap:.12em}
    .g131-eq{margin:0 .3em}
    .g131-tk{display:inline-flex;align-items:center;white-space:nowrap}
    .g131-ans{color:#d71f10}
    .g131-blank{display:inline-flex;align-items:center;justify-content:center;min-width:15mm;height:14mm;padding:0 .8mm;border:1px solid #57736a;border-radius:0;box-sizing:border-box;vertical-align:middle;flex:none}
    .g131-work{margin-top:1.6mm;min-height:4.6mm;border-bottom:1px dotted #bbb;align-self:stretch}
    .g131-work.g131-ink{margin-top:1.6mm;font-size:.78em;line-height:1.2;color:#d71f10;border-bottom:0;min-height:0;display:flex;justify-content:center;align-items:center}
    .g131-steps{flex-wrap:wrap}
    .g131-ef{display:flex;flex-direction:column;align-items:center;align-self:stretch;height:100%}
    .g131-ef .g131-line{font-size:15pt}
    .g131-note{display:block;margin-top:1mm;font-size:9pt;color:#555;text-align:center}
    .g131-fixbox{align-self:stretch;flex:1;min-height:12mm;margin:1.5mm 1mm 0;border:1px dashed #bbb;border-radius:1mm;padding:1.2mm;display:flex;align-items:center;justify-content:center}
    .g131-solved{display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:1mm 0;font-size:12pt;color:#d71f10}
    .g131-solved .g131-frac>span:first-child{border-bottom-color:#d71f10}
    .mt-compact .g131-frac{min-width:1.1em}
  `;
  function css() {
    if (document.getElementById('g131-style')) return;
    const style = document.createElement('style');
    style.id = 'g131-style';
    style.textContent = CSS;
    document.head.appendChild(style);
  }
  function renderCell(cell, item, isAnswer, config) {
    css();
    if (config.format === FORMAT.horizontal) {
      const problem = item;
      const value = isAnswer ? `<span class="g131-ans">${fracHTML(problem.answerText)}</span>` : '<span class="g131-blank"></span>';
      cell.append(node('div', 'g131-line', `${expressionHTML(problem)}<span class="g131-eq">=</span>${value}`));
      cell.append(node('div', 'g131-work' + (isAnswer ? ' g131-ink' : ''), isAnswer ? workHTML(problem) : ''));
      return;
    }
    if (config.format === FORMAT.steps) {
      const html = item.tokens.map((token, index) => {
        if (!item.masked.includes(index)) return `<span class="g131-tk">${tokenHTML(token)}</span>`;
        const sign = token.text ? `<span class="g131-eq">${esc(token.text)}</span>` : '';
        return `<span class="g131-tk">${sign}${isAnswer ? `<span class="g131-ans">${fracHTML(token.value)}</span>` : '<span class="g131-blank"></span>'}</span>`;
      }).join('');
      cell.append(node('div', 'g131-line g131-steps', html));
      return;
    }
    if (config.format === FORMAT.errorfix) {
      const { kind, problem } = item;
      const wrap = node('div', 'g131-ef');
      wrap.append(node('div', 'g131-line',
        `${expressionHTML(problem)}<span class="g131-eq">=</span>${fracHTML(kind.wrong(problem))}`));
      wrap.append(node('div', 'g131-fixbox', isAnswer
        ? `<div class="g131-solved">${chainTokens(problem).map(token => `<span class="g131-tk">${tokenHTML(token)}</span>`).join('')}</div>` : ''));
      cell.append(wrap);
      return;
    }
    throw Error(`묶음 1-3-1에 없는 서식입니다: ${config.format}`);
  }
  const resultValue = answerText => {
    if (/^\d+\s+\d+\/\d+$/.test(answerText)) return { mixed: answerText };
    return answerText.includes('/') ? { frac: answerText } : answerText;
  };
  /** 선 잇기 한 묶음 — 공용 묶음 서식(compact 2단)을 그대로 쓴다. */
  function renderBundle(config, item, isAnswer) {
    css();
    const base = root.MatchingSheet.formats['matching-lines'];
    return base.render(config, item, isAnswer);
  }
  /** 연결하기 한 쪽 — 세트마다 오른쪽 답의 차례를 섞는다(같은 seed 면 같은 차례, 제자리 짝 없음). */
  function buildMatching(config) {
    css();
    const rnd = random((Number(config.seed) ^ 0x9E3779B9) >>> 0);
    const items = generateItems(config).map(item => {
      const order = shuffle(item.pairs.map((_, index) => index), rnd);
      for (let i = 0; i < order.length; i++) {            // 제자리 짝(수평선)은 정답을 드러내므로 없앤다
        if (order[i] !== i) continue;
        const j = (i + 1) % order.length; const swap = order[i]; order[i] = order[j]; order[j] = swap;
      }
      return {
        kind: 'bundle', caption: '', rowsWeight: item.pairs.length, order,
        compact: true, compactWl: 27, compactWr: 14, compactGap: 10,
        pairs: item.pairs.map(problem => [{ html: expressionHTML(problem) }, resultValue(problem.answerText)])
      };
    });
    const total = items.reduce((sum, item) => sum + item.pairs.length, 0);
    return { items, layout: { cols: items.length, rows: items[0].pairs.length, count: total }, pairs: total };
  }

  /* ------------------------------------------------------------- 등록하기 */
  function install() {
    const base = root.SheetGen;
    if (base && typeof base.generate === 'function' && !base.__g131) {
      const original = base.generate;
      base.generate = function (config) {
        if (config && MINE.has(config.format)) return generateItems(config);
        return original.apply(this, arguments);
      };
      Object.defineProperty(base, '__g131', { value: true });
    }
    if (root.Sheet && typeof root.Sheet.register === 'function') {
      for (const format of [FORMAT.horizontal, FORMAT.steps, FORMAT.errorfix]) root.Sheet.register(format, renderCell);
    }
    // 선 잇기는 한 쪽 전체를 묶음으로 배치하므로 MatchingSheet 의 서식 등록부를 쓴다(그 파일이 안내하는 방식).
    if (root.MatchingSheet && root.MatchingSheet.formats) {
      root.MatchingSheet.formats[FORMAT.matching] = {
        page: 'blocks',
        title: TYPES.find(type => type.format === FORMAT.matching).name,
        build: buildMatching,
        render: (config, item, isAnswer) => renderBundle(config, item, isAnswer)
      };
    }
    const entries = [];
    for (const concept of CONCEPTS) {
      for (const type of TYPES) entries.push({
        typeId: `${concept.id}-${type.suffix}`,
        conceptId: concept.id,
        title: `${concept.name} — ${type.name}`,
        instruction: type.instruction,
        format: type.format,
        cols: type.cols, rows: type.rows, count: type.cols * type.rows,
        fontPt: type.fontPt, workLines: type.workLines, seed: 20261001, autoFit: false, maxProblems: 24,
        gen: { concept: concept.id, legacyId: concept.legacy }
      });
    }
    const requested = entries.find(entry => entry.typeId === '1-3-1-4-t2');
    Object.assign(requested, {cols:3,rows:6,count:18,maxProblems:18,autoFit:false});
    root.SheetCatalog.push(...entries);
  }
  install();

  root.Training131 = {
    concepts: CONCEPTS, types: TYPES, format: FORMAT, entries: root.SheetCatalog.filter(entry => entry.conceptId),
    generate: generateItems, render: renderCell, renderBundle, buildMatching, chainTokens, parseProblem
  };
})(globalThis);
