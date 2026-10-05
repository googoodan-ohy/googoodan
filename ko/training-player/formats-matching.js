(function (root) {
  'use strict';
  /*
   * formats-matching.js — 선 잇기 · 표 채우기 · 부등호 넣기 · 순서대로 쓰기 · 가장 큰/작은 수 · 고르기형
   *
   * 한 쪽 배치 (layout-rules.md 기준. A4 한 쪽 = 머리말 9mm + 지시문 8mm + 본문 260mm)
   *   matching-lines       묶음 3 × 묶음당 8쌍 = 24쌍      (묶음당 6~8쌍)
   *   multiplication-table 곱셈구구 빈칸 표 3개, 빈칸 40개 이상
   *   factor-table         약수·공약수·공배수·배 관계 표 4개, 빈칸 40개 이상
   *   number-array         수 배열표(100까지) 3개, 빈칸 40개 이상
   *   place-value-table    자리표 2개 × 5수 = 10수, 빈칸 40개
   *   inequality           4단 × 15줄 = 60   (○ 안에 >, =, <)
   *   ordering             2단 × 14줄 = 28   (순서대로 쓰기, 한 문항 수 4개)
   *   extremes             2단 × 14줄 = 28   (가장 큰 수·가장 작은 수 찾기, 한 문항 수 5개)
   *   condition-choice     2단 × 14줄 = 28   (조건에 맞는 것 모두 ○표)
   *
   * 그리는 방법
   *   MatchingSheet.mount(config)               #sheet-root 에 문제지 1쪽 + 정답지 1쪽을 그리고 단추를 연결한다.
   *   MatchingSheet.renderPage(config, 답인가)  쪽 하나(HTMLElement)를 돌려준다.
   *   Sheet.register 로도 등록한다 — Sheet 격자 안에서는 (cell, q, answer, config),
   *   서식 한 쪽 단위로 부를 때는 (config, isAnswer) 로 동작한다(첫 인자가 DOM이면 격자용).
   *
   * 문제 생성은 기존 생성기(root.Worksheets)를 먼저 쓰고, 없으면 같은 모양의 값을 만드는
   * 최소한의 대체 계산만 한다. 같은 typeId·같은 seed면 같은 문제가 나온다.
   * 서식 파일이므로 sheet.css(.sheet-page/.sheet-head/.sheet-grid/.sheet-cell)를 함께 불러야 한다.
   */
  const ANSWER_INK = '#b32b2b';
  const CIRCLED = '①②③④⑤⑥⑦⑧⑨⑩';

  // ---------------------------------------------------------------- 기본 도구
  const el = (tag, cls, html) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (html != null) node.innerHTML = html;
    return node;
  };
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
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
    for (let i = out.length - 1; i > 0; i--) { const j = rnd(0, i); const tmp = out[i]; out[i] = out[j]; out[j] = tmp; }
    return out;
  }
  const pickN = (list, n, rnd) => shuffle(list, rnd).slice(0, n);
  const within = (value, lo, hi) => Number.isFinite(value) && value >= lo && value <= hi;
  const gcd = (a, b) => b ? gcd(b, a % b) : Math.abs(a);
  const lcm = (a, b) => a / gcd(a, b) * b;
  function divisors(n) { const out = []; for (let d = 1; d <= n; d++) if (n % d === 0) out.push(d); return out; }
  const BLANK = '<span class="mt-inline-blank"></span>';
  /** 수 뒤에 붙는 조사 '로/으로' 고르기(받침이 없거나 ㄹ로 끝나면 '로'). */
  const roParticle = value => [0, 2, 4, 5, 8, 9].includes(Math.abs(Number(value)) % 10) ? '로' : '으로';
  /** 글자·분수·혼합수·직접 넣은 HTML 조각을 모두 받는 값 표시. */
  function valueHTML(value) {
    if (value == null) return '';
    if (typeof value !== 'object') return esc(value);
    if (value.html != null) return String(value.html);
    if (value.frac != null) {
      const parts = String(value.frac).split('/');
      return `<span class="mt-frac"><span>${esc(parts[0])}</span><span>${esc(parts[1] ?? '')}</span></span>`;
    }
    if (value.mixed != null) {
      const match = String(value.mixed).match(/^(-?\d+)\s+(\d+)\/(\d+)$/);
      if (match) return `<span class="mt-mixed"><span>${esc(match[1])}</span><span class="mt-frac"><span>${esc(match[2])}</span><span>${esc(match[3])}</span></span></span>`;
      return valueHTML({ frac: String(value.mixed) });
    }
    return esc(JSON.stringify(value));
  }

  // ------------------------------------------------ 기존 생성기 연결(있으면 먼저 사용)
  function legacyRows(id, seed, count, filter) {
    if (!root.Worksheets || typeof root.Worksheets.generate !== 'function') return null;
    const out = [], seen = new Set();
    for (let batch = 0; out.length < count && batch < 40; batch++) {
      let rows;
      try { rows = root.Worksheets.generate(id, (Number(seed) + batch * 2654435761) >>> 0, Math.max(count, 32)); }
      catch (error) { return out.length ? out : null; }
      for (const row of rows) {
        const key = row.a + ':' + row.op + ':' + row.b;
        if (seen.has(key) || (filter && !filter(row))) continue;
        seen.add(key); out.push(row);
        if (out.length === count) break;
      }
    }
    return out.length ? out : null;
  }
  /** Worksheets 를 못 쓸 때만 쓰는 최소 대체 계산(자연수 사칙·비교). 새 문제 엔진이 아니라 같은 모양의 값 생성이다. */
  function internalRows(id, seed, count) {
    const natural = String(id).match(/^natural-(add|sub|mul|div)-(\d)-(\d)$/);
    const special = { compare: ['cmp', 0, 99], 'compare-ten': ['cmp', 1, 10], 'multiply-one': ['mul', 1, 1], 'missing': ['cmp', 0, 19] }[id];
    if (!natural && !special) return null;
    const rnd = random(seed);
    const code = natural ? natural[1] : special[0];
    const da = natural ? Number(natural[2]) : special[1];
    const db = natural ? Number(natural[3]) : special[2];
    const span = digits => [10 ** (digits - 1) || 0, 10 ** digits - 1];
    const rows = [], seen = new Set();
    let guard = 0;
    while (rows.length < count && guard++ < 20000) {
      if (code === 'cmp') {
        const a = rnd(da, db), b = rows.length % 5 === 0 ? a : rnd(da, db);
        const key = a + ':' + b;
        if (seen.has(key)) continue;
        seen.add(key);
        rows.push({ a, b, op: 'compare', answer: a < b ? '<' : a > b ? '>' : '=' });
        continue;
      }
      const [amin, amax] = span(da), [bmin, bmax] = span(db);
      let a = rnd(amin, amax), b = rnd(bmin, bmax);
      if ((code === 'sub' || code === 'div') && a < b) { const tmp = a; a = b; b = tmp; }
      if (code === 'div') b = b || 1;
      const key = a + ':' + b;
      if (seen.has(key)) continue;
      seen.add(key);
      const answer = code === 'add' ? a + b : code === 'sub' ? a - b : code === 'mul' ? a * b : Math.floor(a / b);
      rows.push({ a, b, op: { add: '+', sub: '−', mul: '×', div: '÷' }[code], answer });
    }
    return rows;
  }
  function rowsOf(id, seed, count, filter) {
    return legacyRows(id, seed, count, filter) || internalRows(id, seed, count) || [];
  }
  /** 서로 다른 수를 count개. 기존 생성기의 수를 먼저 쓰고 모자라면 같은 범위에서 채운다. */
  function numberPool(config, count, min, max) {
    const gen = config.gen || {};
    const seed = Number(config.seed) || 1;
    const rnd = random((seed ^ 0x9E3779B9) >>> 0 || 7);
    const poolId = gen.poolId || (max <= 20 ? 'compare-ten' : max <= 99 ? 'compare' : 'natural-add-3-3');
    const values = [];
    const rows = legacyRows(poolId, seed + 7, Math.max(count, 64), row => within(Number(row.a), min, max) || within(Number(row.b), min, max));
    if (rows) {
      for (const row of rows) for (const value of [Number(row.a), Number(row.b), Number(row.answer)]) {
        if (within(value, min, max) && !values.includes(value)) values.push(value);
      }
    }
    let guard = 0;
    while (values.length < count && guard++ < 20000) {
      const value = rnd(min, max);
      if (!values.includes(value)) values.push(value);
    }
    if (values.length < count) throw Error(`수 범위 ${min}~${max} 안에서 서로 다른 수 ${count}개를 만들 수 없습니다.`);
    return values.slice(0, count);
  }

  // ---------------------------------------------------------------- 선 잇기
  function matchingPairs(config, count, rnd) {
    const gen = config.gen || {};
    if (Array.isArray(config.pairs)) {
      if (config.pairs.length < count) throw Error(`pairs 데이터가 모자랍니다: ${config.pairs.length}/${count}쌍`);
      return config.pairs.slice(0, count);
    }
    const seed = Number(config.seed) || 1;
    const kind = gen.pairKind || 'expr-result';
    const pairs = [];
    if (kind === 'expr-result') {
      const usedAnswer = new Set(), usedLeft = new Set();
      for (const row of rowsOf(gen.legacyId || 'natural-add-2-2', seed, count * 6)) {
        const left = `${row.a} ${row.op} ${row.b}`, answer = String(row.answer);
        if (usedAnswer.has(answer) || usedLeft.has(left)) continue;
        usedAnswer.add(answer); usedLeft.add(left);
        pairs.push([left, answer]);
        if (pairs.length === count) break;
      }
    } else if (kind === 'product-equal') {
      const used = new Set();
      let guard = 0;
      while (pairs.length < count && guard++ < 6000) {
        const product = rnd(8, 72);
        if (used.has(product)) continue;
        const facts = [];
        for (let a = 2; a <= 9; a++) if (product % a === 0 && product / a >= 2 && product / a <= 9) facts.push([a, product / a]);
        if (facts.length < 2) continue;
        const chosen = pickN(facts, 2, rnd);
        used.add(product);
        pairs.push([`${chosen[0][0]} × ${chosen[0][1]}`, `${chosen[1][0]} × ${chosen[1][1]}`]);
      }
    } else if (kind === 'sum-equal') {
      const used = new Set();
      let guard = 0;
      while (pairs.length < count && guard++ < 6000) {
        const sum = rnd(12, 40);
        if (used.has(sum)) continue;
        const parts = [];
        for (let a = 4; a <= sum - 4; a++) parts.push([a, sum - a]);
        if (parts.length < 2) continue;
        const chosen = pickN(parts, 2, rnd);
        used.add(sum);
        pairs.push([`${chosen[0][0]} + ${chosen[0][1]}`, `${chosen[1][0]} + ${chosen[1][1]}`]);
      }
    } else if (kind === 'add-mul') {
      const used = new Set();
      let guard = 0;
      while (pairs.length < count && guard++ < 4000) {
        const a = rnd(2, 9), b = rnd(2, 4);
        if (used.has(`${a}x${b}`)) continue;
        used.add(`${a}x${b}`);
        pairs.push([Array.from({ length: b }, () => a).join(' + '), `${a} × ${b}`]);
      }
    } else if (kind === 'fact-family') {
      const used = new Set();
      let guard = 0;
      while (pairs.length < count && guard++ < 4000) {
        const a = rnd(2, 9), b = rnd(2, 9);
        if (used.has(`${a}x${b}`)) continue;
        used.add(`${a}x${b}`);
        pairs.push([`${a} × ${b} = ${a * b}`, `${a * b} ÷ ${a} = ${b}`]);
      }
    } else if (kind === 'fraction-equal') {
      // 크기가 같은 분수 짝. 기약분수를 기준으로 잡아 한 묶음 안에서 값이 겹치지 않는다.
      const bases = [];
      for (let d = 2; d <= 12; d++) for (let n = 1; n < d; n++) if (gcd(n, d) === 1) bases.push([n, d]);
      for (const [n, d] of shuffle(bases, rnd)) {
        if (pairs.length === count) break;
        const k = rnd(2, 4);
        if (d * k > 24) continue;
        pairs.push([{ frac: `${n * k}/${d * k}` }, { frac: `${n}/${d}` }]);
      }
    } else {
      throw Error(`알 수 없는 pairKind: ${kind}`);
    }
    if (pairs.length !== count) throw Error(`${kind}: ${count}쌍 중 ${pairs.length}쌍만 만들었습니다.`);
    return pairs;
  }
  // 글자 폭(mm)을 어림한다: 숫자·기호는 좁고 한글은 넓다. 분수·혼합수는 고정 폭으로 본다.
  function widthMm(value) {
    if (value == null) return 0;
    if (typeof value === 'object') return value.html != null ? 30 : value.mixed != null ? 12 : 8;
    let total = 0;
    for (const ch of String(value)) total += /[ㄱ-힝]/.test(ch) ? 4.6 : /[0-9+\-−×÷=<>→ ]/.test(ch) ? 2.7 : 3.2;
    return total;
  }
  function buildMatching(config) {
    const gen = config.gen || {};
    // 기본 서식은 2단 × 4줄 = 8묶음(묶음당 4쌍)의 '붙인 점' 배치(compact)로 만든다. 쌍을 32개 만들 수 없거나
    // 글자가 반쪽 폭에 안 들어가면 원래 배치로 돌아간다.
    if (config.format === 'matching-lines' && !gen.compact && !gen.noCompact) {
      try {
        const rnd = random(Number(config.seed) || 1);
        const pairs = matchingPairs(config, 32, rnd);
        const w = Math.ceil(pairs.reduce((m, pair) => Math.max(m, widthMm(pair[0]), widthMm(pair[1])), 0)) + 2;
        if (w <= 28) return buildMatchingWith({ ...config, gen: { ...gen, bundles: 8, perBundle: 4, compact: true, compactW: Math.max(15, w), bundleCaption: '' } });
      } catch (error) { /* 원래 배치로 */ }
    }
    return buildMatchingWith(config);
  }
  function buildMatchingWith(config) {
    const gen = config.gen || {};
    const bundles = Math.max(1, Math.min(8, gen.bundles || config.cols || 3));
    let perBundle = Math.max(1, Math.min(10, gen.perBundle || config.rows || 8));
    const limit = /^1-/.test(String(config.typeId || '')) ? 24 : /(세|네|다섯|여섯|일곱|여덟|아홉|열)\s*자리|큰 수/.test(config.title || '') ? 30 : 40;   // 분수 단원 24, 세 자리 이상 수 30
    while (bundles * perBundle > limit && perBundle > 1) perBundle--;   // 한 장에 40문제(큰 수 30문제)를 넘지 않는다
    const rnd = random(Number(config.seed) || 1);
    const pairs = matchingPairs(config, bundles * perBundle, rnd);
    const items = [];
    for (let b = 0; b < bundles; b++) {
      const chunk = pairs.slice(b * perBundle, (b + 1) * perBundle);
      let order = shuffle(chunk.map((_, i) => i), rnd);
      // 제자리 짝(수평선)은 그 줄의 정답을 드러내므로 모두 없앤다.
      for (let i = 0; i < order.length && order.length > 1; i++) {
        if (order[i] !== i) continue;
        const j = (i + 1) % order.length; const swap = order[i]; order[i] = order[j]; order[j] = swap;
      }
      items.push({ kind: 'bundle', compact: Boolean(gen.compact), compactW: gen.compactW || 15, compactWl: gen.compactWl, compactWr: gen.compactWr, compactGap: gen.compactGap, caption: gen.bundleCaption || '', pairs: chunk, order, rowsWeight: perBundle });
    }
    return { items, layout: { cols: bundles, rows: perBundle, count: pairs.length }, pairs: pairs.length };
  }
  function renderBundle(item, isAnswer) {
    const count = item.pairs.length;
    const wrap = el('div', 'mt-pairs-wrap' + (item.compact ? ' mt-compact' : ''));
    const cw = item.compactW || 15;
    // 왼쪽·오른쪽 글자 폭과 동그라미 사이 간격을 따로 줄 수 있다(compactWl·compactWr·compactGap).
    const cwl = item.compactWl || cw, cwr = item.compactWr || cw, cgap = item.compactGap || 12;
    if (item.compact) {
      wrap.style.setProperty('--w', cw + 'mm');
      if (item.compactWl) wrap.style.setProperty('--wl', cwl + 'mm');
      if (item.compactWr) wrap.style.setProperty('--wr', cwr + 'mm');
      if (item.compactGap) wrap.style.setProperty('--gap', cgap + 'mm');
    }
    const grid = el('div', 'mt-pairs');
    grid.style.gridTemplateRows = `repeat(${count}, minmax(0, 1fr))`;
    const rowOf = [];
    item.order.forEach((pairIndex, row) => { rowOf[pairIndex] = row; });
    item.pairs.forEach((pair, index) => {
      const right = item.pairs[item.order[index]];
      grid.append(el('div', 'mt-pair mt-left',
        `<span class="mt-idx">${index + 1}.</span><span class="mt-text">${valueHTML(pair[0])}</span><span class="mt-mark"></span>`));
      grid.append(el('div', 'mt-pair mt-right',
        `<span class="mt-mark"></span><span class="mt-text">${valueHTML(right[1])}</span>`));
    });
    wrap.append(grid);
    if (isAnswer) {
      const lines = item.pairs.map((_, index) => {
        const from = ((index + 0.5) / count * 1000).toFixed(1);
        const to = ((rowOf[index] + 0.5) / count * 1000).toFixed(1);
        // compact: 동그라미가 글자 바로 옆(왼쪽 22.5mm, 오른쪽 47.5mm / 판 폭 72mm)에 붙는다.
        return item.compact ? `<line x1="${((cwl + 7.5) / (cwl + cwr + 18 + cgap) * 1000).toFixed(1)}" y1="${from}" x2="${((cwl + 9 + cgap + 1.5) / (cwl + cwr + 18 + cgap) * 1000).toFixed(1)}" y2="${to}"/>` : `<line x1="420" y1="${from}" x2="580" y2="${to}"/>`;
      }).join('');
      wrap.append(el('div', 'mt-lines', `<svg viewBox="0 0 1000 1000" preserveAspectRatio="none">${lines}</svg>`));
    }
    return wrap;
  }

  // ---------------------------------------------------------------- 표 채우기
  /** 채울 수 있는 칸 중에서 정확히 count개를 빈칸으로 만든다. 한 줄을 전부 비우지는 않는다. */
  function maskCells(cells, count, rnd) {
    const targets = cells.filter(cell => cell.v != null && !cell.head && !cell.label && !cell.blank);
    const perRow = new Map(); let filled = 0;
    for (const cell of shuffle(targets, rnd)) {
      if (filled >= count) break;
      const rowCells = cells.filter(other => other.row === cell.row && other.v != null && !other.head && !other.label);
      if ((perRow.get(cell.row) || 0) >= rowCells.length - 1) continue;
      cell.blank = true;
      perRow.set(cell.row, (perRow.get(cell.row) || 0) + 1);
      filled++;
    }
    return cells.filter(cell => cell.blank).length;
  }
  function maskList(list, count, rnd) {
    const indexes = shuffle(list.map((part, index) => index).filter(index => typeof list[index] !== 'object'), rnd).slice(0, count);
    for (const index of indexes) list[index] = { blank: list[index] };
    return indexes.length;
  }
  const blankCountOf = (cells) => cells.reduce((sum, cell) => sum
    + (cell.blank ? 1 : 0)
    + (Array.isArray(cell.list) ? cell.list.filter(part => typeof part === 'object').length : 0), 0);
  const cellOf = (value, extra) => Object.assign({ v: value }, extra || {});
  const tableBlock = (caption, columns, rows, cells) => ({ kind: 'table', caption, columns, rows, cells, rowsWeight: rows });
  function renderTable(table, isAnswer) {
    const grid = el('div', 'mt-table');
    grid.style.gridTemplateColumns = table.columns;
    grid.style.gridTemplateRows = `repeat(${table.rows}, minmax(0, 1fr))`;
    for (const data of table.cells) {
      const cls = ['mt-tcell'];
      if (data.head) cls.push('mt-head');
      if (data.label) cls.push('mt-label');
      if (data.blank) cls.push('mt-blank');
      const node = el('div', cls.join(' '));
      if (data.span) node.style.gridColumn = 'span ' + data.span;
      if (Array.isArray(data.list)) {
        node.innerHTML = data.list.map(part => (part && typeof part === 'object' && part.blank != null)
          ? (isAnswer ? `<span class="mt-ink">${esc(part.blank)}</span>` : BLANK)
          : esc(part)).join('<span class="mt-comma">, </span>');
      } else if (data.blank) {
        node.innerHTML = isAnswer ? `<span class="mt-ink">${valueHTML(data.v)}</span>` : '';
      } else {
        node.innerHTML = valueHTML(data.v);
      }
      grid.append(node);
    }
    return grid;
  }
  function buildMultiplicationTable(config) {
    const gen = config.gen || {};
    const rnd = random(Number(config.seed) || 1);
    const groups = gen.groups || [[2, 3, 4], [5, 6, 7], [8, 9]];
    const items = [];
    let masked = 0;
    for (const dan of groups) {
      const cells = [];
      cells.push(cellOf('×', { head: true, row: 0 }));
      for (let b = 1; b <= 9; b++) cells.push(cellOf(String(b), { head: true, row: 0 }));
      dan.forEach((a, index) => {
        const row = index + 1;
        cells.push(cellOf(String(a), { head: true, row }));
        for (let b = 1; b <= 9; b++) cells.push(cellOf(String(a * b), { row, product: true }));
      });
      const table = tableBlock(`${dan.join(', ')}단`, '10mm repeat(9, minmax(0, 1fr))', dan.length + 1, cells);
      const fillable = cells.filter(cell => cell.product);
      masked += maskCells(fillable, Math.round(fillable.length * (gen.blankRate != null ? gen.blankRate : 0.7)), rnd);
      items.push(table);
    }
    const minimum = gen.blankCount || 40;
    if (masked < minimum) {
      const rest = shuffle(items.flatMap(table => table.cells.filter(cell => cell.product && !cell.blank)), rnd);
      for (const cell of rest) { if (masked >= minimum) break; cell.blank = true; masked++; }
    }
    if (masked < minimum) throw Error(`곱셈구구 표 빈칸이 ${masked}개뿐입니다(최소 ${minimum}).`);
    return { items, layout: { cols: 1, rows: items.length, count: items.length }, blanks: masked };
  }
  function buildFactorTable(config) {
    const gen = config.gen || {};
    const rnd = random(Number(config.seed) || 1);
    const pairsAB = gen.pairsAB || [[12, 18], [16, 24], [20, 30], [18, 27], [24, 36], [15, 25]];
    const pairsLCM = gen.pairsLCM || [[4, 6], [3, 5], [6, 8], [4, 5], [6, 10], [8, 12]];
    const divTargets = gen.divisorTargets || [24, 36, 18, 30, 20, 28];
    const pick = rnd(0, Math.min(pairsAB.length, pairsLCM.length, divTargets.length) - 1);
    const columns = '34mm repeat(8, minmax(0, 1fr))';
    const width = 8;
    const items = [];

    // 1) 공약수 표 — 두 수의 약수, 공약수, 최대공약수
    const [a, b] = pairsAB[pick];
    const da = divisors(a), db = divisors(b), common = da.filter(d => b % d === 0);
    const g1 = [];
    g1.push(cellOf(`${a}의 약수`, { label: true, row: 0 }));
    da.slice(0, width).forEach(d => g1.push(cellOf(String(d), { row: 0 })));
    for (let i = da.length; i < width; i++) g1.push(cellOf(null, { head: true, row: 0 }));
    g1.push(cellOf(`${b}의 약수`, { label: true, row: 1 }));
    db.slice(0, width).forEach(d => g1.push(cellOf(String(d), { row: 1 })));
    for (let i = db.length; i < width; i++) g1.push(cellOf(null, { head: true, row: 1 }));
    const commonRow = common.map(d => String(d));
    g1.push(cellOf('공약수', { label: true, row: 2 }));
    g1.push({ v: null, row: 2, span: width, list: commonRow });
    g1.push(cellOf('최대공약수', { label: true, row: 3 }));
    g1.push({ v: null, row: 3, span: width, list: [String(common[common.length - 1])] });
    let masked = 0;
    masked += maskCells(g1.filter(cell => cell.row === 0), 4, rnd);
    masked += maskCells(g1.filter(cell => cell.row === 1), 4, rnd);
    masked += maskList(g1.find(cell => cell.list && cell.row === 2).list, 2, rnd);
    masked += maskList(g1.find(cell => cell.list && cell.row === 3).list, 1, rnd);
    items.push(tableBlock('공약수 표', columns, 4, g1));

    // 2) 공배수 표 — 두 수의 배수, 공배수, 최소공배수
    const [c, d] = pairsLCM[pick];
    const least = lcm(c, d);
    const g2 = [];
    [c, d].forEach((n, row) => {
      g2.push(cellOf(`${n}의 배수`, { label: true, row }));
      for (let i = 1; i <= width; i++) g2.push(cellOf(String(n * i), { row }));
    });
    const commonMultiples = Array.from({ length: width }, (_, i) => String(least * (i + 1)));
    g2.push(cellOf('공배수', { label: true, row: 2 }));
    g2.push({ v: null, row: 2, span: width, list: commonMultiples.slice() });
    g2.push(cellOf('최소공배수', { label: true, row: 3 }));
    g2.push({ v: null, row: 3, span: width, list: [String(least)] });
    masked += maskCells(g2.filter(cell => cell.row === 0), 5, rnd);
    masked += maskCells(g2.filter(cell => cell.row === 1), 5, rnd);
    masked += maskList(g2.find(cell => cell.list && cell.row === 2).list, 2, rnd);
    masked += maskList(g2.find(cell => cell.list && cell.row === 3).list, 1, rnd);
    items.push(tableBlock('공배수 표', columns, 4, g2));

    // 3) 배 관계 표 — 2씩 뛰어 세기(2·4·8의 배수)
    const base = gen.doubleBase || 2;
    const g3 = [];
    [base, base * 2, base * 4].forEach((step, row) => {
      g3.push(cellOf(`${step}의 배수`, { label: true, row }));
      for (let i = 1; i <= 6; i++) g3.push(cellOf(String(step * i), { row }));
      for (let i = 6; i < width; i++) g3.push(cellOf(null, { head: true, row }));
    });
    for (let row = 0; row < 3; row++) masked += maskCells(g3.filter(cell => cell.row === row), 4, rnd);
    items.push(tableBlock('배 관계 표', columns, 3, g3));

    // 4) 약수 표 — 한 수의 약수와 가장 작은/큰 약수
    const target = divTargets[pick];
    const dt = divisors(target);
    const g4 = [];
    g4.push(cellOf(`${target}의 약수`, { label: true, row: 0 }));
    dt.slice(0, width).forEach(v => g4.push(cellOf(String(v), { row: 0 })));
    for (let i = dt.length; i < width; i++) g4.push(cellOf(null, { head: true, row: 0 }));
    g4.push(cellOf('가장 작은 약수', { label: true, row: 1 }));
    g4.push({ v: null, row: 1, span: width, list: [String(dt[0])] });
    g4.push(cellOf('가장 큰 약수', { label: true, row: 2 }));
    g4.push({ v: null, row: 2, span: width, list: [String(dt[dt.length - 1])] });
    masked += maskCells(g4.filter(cell => cell.row === 0), 5, rnd);
    masked += maskList(g4.find(cell => cell.list && cell.row === 1).list, 1, rnd);
    masked += maskList(g4.find(cell => cell.list && cell.row === 2).list, 1, rnd);
    items.push(tableBlock('약수 표', columns, 3, g4));

    const total = items.reduce((sum, table) => sum + blankCountOf(table.cells), 0);
    if (total < 40) throw Error(`표 빈칸이 ${total}개뿐입니다(최소 40).`);
    return { items, layout: { cols: 1, rows: items.length, count: items.length }, blanks: total };
  }
  function buildNumberArray(config) {
    const gen = config.gen || {};
    const rnd = random(Number(config.seed) || 1);
    const max = gen.max || 100;
    const step = gen.step || 1;
    const tables = Math.max(1, Math.min(4, gen.tables || 3));
    const total = Math.floor(max / step);
    const perTable = Math.ceil(total / tables / 10) * 10;
    const items = [];
    for (let t = 0; t < tables; t++) {
      const first = t * perTable + 1, last = Math.min((t + 1) * perTable, total);
      if (first > total) break;
      const cells = [];
      for (let index = first; index <= last; index++) {
        cells.push(cellOf(String(index * step), { row: Math.floor((index - first) / 10), array: true }));
      }
      while (cells.length % 10 !== 0) cells.push(cellOf(null, { head: true, row: Math.floor(cells.length / 10) }));
      const rows = cells.length / 10;
      const caption = step === 1 ? `${first * step}~${last * step} 수 배열표` : `${step}씩 뛰어 세기`;
      const table = tableBlock(caption, 'repeat(10, minmax(0, 1fr))', rows, cells);
      const fillable = cells.filter(cell => cell.array);
      maskCells(fillable, Math.max(14, Math.round(fillable.length * 0.42)), rnd);
      items.push(table);
    }
    const blanks = items.reduce((sum, table) => sum + blankCountOf(table.cells), 0);
    if (blanks < 40) throw Error(`수 배열표 빈칸이 ${blanks}개뿐입니다(최소 40).`);
    return { items, layout: { cols: 1, rows: items.length, count: items.length }, blanks };
  }
  function buildPlaceValueTable(config) {
    const gen = config.gen || {};
    const rnd = random(Number(config.seed) || 1);
    const digits = Math.max(2, Math.min(5, gen.numberDigits || 4));
    const places = ['일', '십', '백', '천', '만'].slice(0, digits).reverse();
    const perTable = gen.perTable || 5;
    const tables = gen.tables || 2;
    const numbers = [];
    const lo = 10 ** (digits - 1), hi = 10 ** digits - 1;
    let guard = 0;
    while (numbers.length < perTable * tables && guard++ < 20000) {
      const value = rnd(lo, hi);
      if (numbers.includes(value)) continue;
      if (gen.zeroInNonLeadingPlaces === false && String(value).includes('0')) continue;
      numbers.push(value);
    }
    if (numbers.length < perTable * tables) throw Error(`자리표에 넣을 ${digits}자리 수를 만들지 못했습니다.`);
    const columns = `32mm repeat(${digits}, minmax(0, 1fr))`;
    const items = [];
    for (let t = 0; t < tables; t++) {
      const cells = [];
      cells.push(cellOf('자리', { head: true, row: 0 }));
      places.forEach(place => cells.push(cellOf(place, { head: true, row: 0 })));
      let row = 1;
      for (const value of numbers.slice(t * perTable, (t + 1) * perTable)) {
        const padded = String(value).split('');
        cells.push(cellOf(String(value), { label: true, row }));
        padded.forEach(digit => cells.push(cellOf(digit, { row, digit: true })));
        row++;
        cells.push(cellOf('자릿값', { label: true, row }));
        padded.forEach((digit, index) => cells.push(cellOf(String(Number(digit) * 10 ** (digits - 1 - index)), { row, place: true })));
        row++;
      }
      const table = tableBlock(`자리표 ${t + 1}`, columns, row, cells);
      const digitCells = cells.filter(cell => cell.digit || cell.place);
      maskCells(digitCells, Math.round(digitCells.length * (gen.blankRate != null ? gen.blankRate : 0.55)), rnd);
      items.push(table);
    }
    const blanks = items.reduce((sum, table) => sum + blankCountOf(table.cells), 0);
    if (blanks < 40) throw Error(`자리표 빈칸이 ${blanks}개뿐입니다(최소 40).`);
    return { items, layout: { cols: 1, rows: items.length, count: items.length }, blanks };
  }

  // ------------------------------------------------- 격자 서식(한 칸 = 한 문항)
  // 부등호는 자연수·소수를 다룬다. 분수 크기 비교는 분수 서식(formats-fraction.js 의 fraction-convert)이 맡는다.
  function buildInequality(config) {
    const gen = config.gen || {};
    const cols = config.cols || 4, rows = config.rows || 15, count = cols * rows;
    const decimals = (gen.kind || 'number') === 'decimal';
    const min = gen.numberMin != null ? gen.numberMin : decimals ? 1 : 10;
    const max = gen.numberMax != null ? gen.numberMax : decimals ? 99 : 9999;
    const scale = decimals ? 100 : 1;
    const pool = numberPool(config, count * 3, min * scale, max * scale);
    const items = [], seen = new Set();
    let cursor = 0;
    while (items.length < count && cursor < pool.length) {
      const equal = items.length % 5 === 4;          // 다섯 문항에 하나는 '=' 도 넣는다
      const a = pool[cursor];
      const b = equal ? a : pool[cursor + 1];
      cursor += equal ? 1 : 2;
      if (!within(b, min * scale, max * scale)) continue;
      const key = a <= b ? `${a}:${b}` : `${b}:${a}`;
      if (seen.has(key)) continue;
      seen.add(key);
      items.push({ a, b, sign: a < b ? '<' : a > b ? '>' : '=' });
    }
    if (items.length !== count) throw Error(`부등호 문항이 ${items.length}개뿐입니다(${count}개 필요).`);
    items.sort((x, y) => Math.max(x.a, x.b) - Math.max(y.a, y.b));
    const shown = decimals ? (value => (value / scale).toFixed(2)) : (value => String(value));
    return { items, layout: { cols, rows, count }, shown, blanks: count };
  }
  function renderInequalityCell(config, item, isAnswer, built) {
    const shown = (built && built.shown) || (value => String(value));
    const line = el('div', 'horizontal mt-sign-line');
    line.append(el('span', '', esc(shown(item.a))));
    line.append(el('span', 'mt-sign-box', isAnswer ? `<span class="mt-ink">${esc(item.sign)}</span>` : ''));
    line.append(el('span', '', esc(shown(item.b))));
    return line;
  }
  function buildOrdering(config) {
    const gen = config.gen || {};
    const cols = config.cols || 2, rows = config.rows || 14, count = cols * rows;
    const k = gen.numberCount || 4;
    const desc = gen.direction === 'desc';
    const min = gen.numberMin != null ? gen.numberMin : 10;
    const max = gen.numberMax != null ? gen.numberMax : 9999;
    const pool = numberPool(config, count * k, min, max);
    const rnd = random(Number(config.seed) || 1);
    const items = [];
    for (let i = 0; i < count; i++) {
      const values = pool.slice(i * k, (i + 1) * k);
      items.push({
        values: shuffle(values, rnd),
        sorted: values.slice().sort((x, y) => desc ? y - x : x - y)
      });
    }
    items.sort((x, y) => Math.max(...x.values) - Math.max(...y.values));
    return { items, layout: { cols, rows, count }, desc, blanks: count * k };
  }
  function renderOrderingCell(config, item, isAnswer, built) {
    const sign = `<span class="mt-cmp">${(built && built.desc) ? '&gt;' : '&lt;'}</span>`;
    const box = el('div', 'mt-order');
    box.append(el('div', 'mt-order-values', item.values.map(value => esc(value)).join('<span class="mt-gap"></span>')));
    box.append(el('div', 'mt-order-write', item.sorted.map((value, index) => {
      const part = isAnswer ? `<span class="mt-ink">${esc(value)}</span>` : '<span class="mt-write"></span>';
      return index === item.sorted.length - 1 ? part : part + sign;
    }).join('')));
    return box;
  }
  function buildExtremes(config) {
    const gen = config.gen || {};
    // 2단 × 14줄: 한 칸에 수 5개와 '가장 큰 수·가장 작은 수' 두 줄이 들어간다.
    const cols = config.cols || 2, rows = config.rows || 14, count = cols * rows;
    const k = gen.numberCount || 5;
    const min = gen.numberMin != null ? gen.numberMin : 100;
    const max = gen.numberMax != null ? gen.numberMax : 9999;
    const pool = numberPool(config, count * k, min, max);
    const rnd = random(Number(config.seed) || 1);
    const items = [];
    for (let i = 0; i < count; i++) {
      const values = pool.slice(i * k, (i + 1) * k);
      items.push({ values: shuffle(values, rnd), biggest: Math.max(...values), smallest: Math.min(...values) });
    }
    items.sort((x, y) => Math.max(...x.values) - Math.max(...y.values));
    return { items, layout: { cols, rows, count }, target: gen.target || 'both', blanks: count * 2 };
  }
  function renderExtremesCell(config, item, isAnswer, built) {
    const target = (built && built.target) || 'both';
    const box = el('div', 'mt-extremes');
    box.append(el('div', 'mt-order-values', item.values.map(value => esc(value)).join('<span class="mt-gap"></span>')));
    const part = (label, value) => `${esc(label)} ${isAnswer ? `<span class="mt-ink">${esc(value)}</span>` : '<span class="mt-write"></span>'}`;
    const pieces = [];
    if (target !== 'smallest') pieces.push(part('가장 큰 수', item.biggest));
    if (target !== 'biggest') pieces.push(part('가장 작은 수', item.smallest));
    box.append(el('div', 'mt-order-write', pieces.join('<span class="mt-gap"></span>')));
    return box;
  }
  function buildChoice(config) {
    const gen = config.gen || {};
    const cols = config.cols || 2, rows = config.rows || 14, count = cols * rows;
    const rnd = random(Number(config.seed) || 1);
    const kind = gen.kind || 'multiple';
    const size = gen.optionCount || 6;
    const items = [], used = new Set();
    let guard = 0;
    while (items.length < count && guard++ < 8000) {
      const base = rnd(gen.baseMin || 2, gen.baseMax || 12);
      let prompt, options;
      if (kind === 'multiple' || kind === 'divisible') {
        const multiples = [2, 3, 4].map(i => base * i);
        const outsiders = [];
        let outsiderGuard = 0;
        while (outsiders.length < size - multiples.length && outsiderGuard++ < 300) {
          const value = rnd(base + 1, base * 6 + 11);
          if (value % base === 0 || outsiders.includes(value)) continue;
          outsiders.push(value);
        }
        prompt = kind === 'multiple' ? `${base}의 배수` : `${base}${roParticle(base)} 나누어떨어지는 수`;
        options = multiples.map(v => ({ v, ok: true })).concat(outsiders.map(v => ({ v, ok: false })));
      } else if (kind === 'divisor') {
        const target = base * rnd(2, 5);
        const all = divisors(target).filter(v => v > 1 && v < target);
        if (all.length < 2) continue;
        const chosen = pickN(all, Math.min(3, all.length), rnd).map(v => ({ v, ok: true }));
        const outsiders = [];
        let outsiderGuard = 0;
        while (outsiders.length < size - chosen.length && outsiderGuard++ < 400) {
          const value = rnd(2, target - 1);
          if (target % value === 0 || outsiders.includes(value) || chosen.some(option => option.v === value)) continue;
          outsiders.push(value);
        }
        prompt = `${target}의 약수`;
        options = chosen.concat(outsiders.map(v => ({ v, ok: false })));
      } else if (kind === 'sum') {
        const total = gen.sum || 10;
        if (total < 6) throw Error('합 고르기는 sum이 6 이상이어야 합니다.');
        const pairs = [];
        for (let a = 1; a < total; a++) pairs.push(a);
        const yes = pickN(pairs, Math.min(3, Math.max(1, size - 3)), rnd).map(a => ({ v: `${a} + ${total - a}`, ok: true }));
        const no = [];
        let noGuard = 0;
        while (no.length < size - yes.length && noGuard++ < 400) {
          const a = rnd(1, total + 5), b = rnd(1, total + 5);
          if (a + b === total) continue;
          const text = `${a} + ${b}`;
          if (no.some(option => option.v === text) || yes.some(option => option.v === text)) continue;
          no.push({ v: text, ok: false });
        }
        prompt = `합이 ${total}인 덧셈식`;
        options = yes.concat(no);
      } else {
        throw Error(`알 수 없는 고르기 kind: ${kind}`);
      }
      const okCount = options.filter(option => option.ok).length;
      if (okCount < 1 || okCount > 3 || options.length !== size) continue;
      const signature = kind + ':' + options.map(option => option.v).sort().join(',');
      if (used.has(signature)) continue;
      used.add(signature);
      items.push({ prompt, options: shuffle(options, rnd) });
    }
    if (items.length !== count) throw Error(`고르기 문항이 ${items.length}개뿐입니다(${count}개 필요).`);
    items.sort((x, y) => Number(x.prompt.match(/\d+/)[0]) - Number(y.prompt.match(/\d+/)[0]));
    return { items, layout: { cols, rows, count }, blanks: count * size };
  }
  function renderChoiceCell(config, item, isAnswer) {
    const box = el('div', 'mt-choice');
    box.append(el('div', 'mt-choice-prompt', esc(item.prompt)));
    box.append(el('div', 'mt-choice-options', item.options.map(option => (isAnswer && option.ok
      ? `<span class="mt-circle mt-ink">${valueHTML(option.v)}</span>`
      : `<span class="mt-option">${valueHTML(option.v)}</span>`)).join('<span class="mt-gap"></span>')));
    return box;
  }

  // ---------------------------------------------------------------- 서식 표
  const FORMATS = {
    'matching-lines': { page: 'blocks', build: buildMatching, render: (config, item, isAnswer) => renderBundle(item, isAnswer), title: '선 잇기' },
    'multiplication-table': { page: 'blocks', build: buildMultiplicationTable, render: (config, item, isAnswer) => renderTable(item, isAnswer), title: '곱셈구구 표' },
    'factor-table': { page: 'blocks', build: buildFactorTable, render: (config, item, isAnswer) => renderTable(item, isAnswer), title: '약수·배수 표' },
    'number-array': { page: 'blocks', build: buildNumberArray, render: (config, item, isAnswer) => renderTable(item, isAnswer), title: '수 배열표' },
    'place-value-table': { page: 'blocks', build: buildPlaceValueTable, render: (config, item, isAnswer) => renderTable(item, isAnswer), title: '자리표' },
    inequality: { page: 'grid', build: buildInequality, render: renderInequalityCell, title: '부등호 넣기' },
    ordering: { page: 'grid', build: buildOrdering, render: renderOrderingCell, title: '순서대로 쓰기' },
    extremes: { page: 'grid', build: buildExtremes, render: renderExtremesCell, title: '가장 큰 수·작은 수' },
    'condition-choice': { page: 'grid', build: buildChoice, render: renderChoiceCell, title: '고르기' },
    'comparison-choice': { page: 'grid', build: buildChoice, render: renderChoiceCell, title: '고르기' }
  };

  // ---------------------------------------------------------------- 그리기
  function renderHead(config, isAnswer) {
    if (root.Sheet && typeof root.Sheet.createHeader === 'function') return root.Sheet.createHeader(config, isAnswer);
    const head = el('header', 'sheet-head');
    head.append(el('span', 'sheet-brand', '구구단닷컴'));
    head.append(el('span', 'sheet-title', esc(config.title || '') + (isAnswer ? ' · 정답' : '')));
    head.append(el('span', 'sheet-field', '이름 __________'));
    head.append(el('span', 'sheet-field', '날짜 __________'));
    head.append(el('span', 'sheet-field', '시간 _____분 / 정답 _____개'));
    return head;
  }
  function renderGridPage(config, built, isAnswer) {
    const grid = el('div', 'sheet-grid');
    grid.style.gridTemplateColumns = `repeat(${built.layout.cols}, minmax(0, 1fr))`;
    grid.style.gridTemplateRows = `repeat(${built.layout.rows}, minmax(0, 1fr))`;
    grid.style.fontSize = ((config.fontPt || 12) * 0.9).toFixed(2) + 'pt';
    built.items.forEach((item, index) => {
      const cellNode = el('div', 'sheet-cell');
      cellNode.append(el('span', 'sheet-number', String(index + 1)));
      cellNode.append(FORMATS[config.format].render(config, item, isAnswer, built));
      grid.append(cellNode);
    });
    return grid;
  }
  function renderBlockPage(config, built, isAnswer) {
    const body = el('div', 'mt-body');
    built.items.forEach((item, index) => {
      const block = el('div', 'mt-block');
      block.style.flex = String(item.rowsWeight || 1);
      // 지시문과 같은 말을 반복하는 기본 제목('그림과 숫자 연결' 등)은 달지 않는다. 별도 caption 이 있을 때만 표시한다.
      if (item.caption) block.append(el('div', 'mt-caption', `${index + 1}. ${esc(item.caption)}`));
      block.append(FORMATS[config.format].render(config, item, isAnswer, built));
      body.append(block);
    });
    return body;
  }
  function build(config) {
    const format = FORMATS[config.format];
    if (!format) throw Error(`알 수 없는 서식: ${config.format}`);
    if (!config.typeId) throw Error('유형 설정에 typeId가 필요합니다.');
    return format.build(config);
  }
  function renderPage(config, isAnswer, built) {
    const format = FORMATS[config.format];
    if (!format) throw Error(`알 수 없는 서식: ${config.format}`);
    const data = built || build(config);
    const page = el('section', 'sheet-page ' + (isAnswer ? 'answer-page' : 'problem-page'));
    page.style.fontSize = ((config.fontPt || 12) * 0.9).toFixed(2) + 'pt';
    page.append(renderHead(config, isAnswer));
    page.append(el('div', 'sheet-instruction', esc(config.instruction || '빈칸에 알맞은 답을 쓰세요.')));
    page.append(format.page === 'grid' ? renderGridPage(config, data, isAnswer) : renderBlockPage(config, data, isAnswer));
    return page;
  }
  function css() {
    if (document.getElementById('matching-format-style')) return;
    document.head.appendChild(el('style', '', `
      .mt-body{flex:1;min-height:0;display:flex;flex-direction:column;gap:3mm;}
      .mt-block{flex:1;min-height:0;display:flex;flex-direction:column;}
      .mt-caption{height:5mm;font-size:8pt;color:#666;line-height:1;}
      .mt-pairs-wrap{position:relative;flex:1;min-height:0;}
      .mt-pairs{position:absolute;inset:0;display:grid;grid-template-columns:42% 58%;}
      .mt-pair{display:flex;align-items:center;min-width:0;height:100%;overflow:visible;white-space:nowrap;}
      .mt-left,.mt-right{justify-content:flex-start;}
      .mt-idx{color:#555;font-size:9pt;flex:none;margin-right:2mm;}
      .mt-text{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;}
      .mt-mark{flex:none;width:2.2mm;height:2.2mm;background:#222;border-radius:50%;}
      .mt-left .mt-mark{margin-left:auto;margin-right:-1.1mm;}
      .mt-right .mt-mark{margin-left:-1.1mm;margin-right:3mm;}
      .mt-body:has(.mt-compact){display:grid;grid-template-columns:1fr 1fr;grid-auto-rows:minmax(0,1fr);gap:4mm 8mm;}
            .mt-body:has(.mt-compact) .mt-block:last-child:nth-child(odd){grid-column:1 / -1;}
      .mt-body:has(.mt-compact) .mt-block{border:.35mm solid #9bcabd;border-radius:2mm;background:#fff;padding:1mm 0;}
      .mt-compact .mt-pairs,.mt-compact .mt-lines{inset:0 auto 0 50%;width:calc(var(--wl, var(--w)) + var(--wr, var(--w)) + 18mm + var(--gap, 12mm));transform:translateX(-50%);}
      .mt-compact .mt-pairs{grid-template-columns:calc(var(--wl, var(--w)) + 9mm) calc(var(--wr, var(--w)) + 9mm);column-gap:var(--gap, 12mm);}
      .mt-compact .mt-idx{width:5mm;margin-right:0;}
      .mt-compact .mt-text{flex:none;width:var(--w);overflow:visible;}
      .mt-compact .mt-left .mt-text,.mt-compact .mt-left .g030-mini{width:var(--wl, var(--w));}
      .mt-compact .mt-right .mt-text,.mt-compact .mt-right .g030-mini{width:var(--wr, var(--w));}
      .mt-compact .mt-left .mt-text{text-align:right;}
      .mt-compact .mt-left .mt-mark{margin-left:1mm;margin-right:0;}
      .mt-compact .mt-right .mt-mark{margin-left:0;margin-right:1mm;}
      .mt-lines{position:absolute;inset:0;pointer-events:none;}
      .mt-lines svg{width:100%;height:100%;display:block;}
      .mt-lines line{stroke:${ANSWER_INK};stroke-width:1.6;vector-effect:non-scaling-stroke;}
      .mt-table{flex:1;min-height:0;display:grid;border-top:1px solid #999;border-left:1px solid #999;font-variant-numeric:tabular-nums;}
      .mt-tcell{display:flex;align-items:center;justify-content:center;min-width:0;min-height:0;overflow:hidden;border-right:1px solid #999;border-bottom:1px solid #999;padding:0 1mm;}
      .mt-head{background:#f2f2f2;font-size:10pt;font-weight:bold;}
      .mt-label{background:#f7f7f7;justify-content:flex-start;font-size:10pt;}
      .mt-blank{background:#fff;}
      .mt-comma{color:#888;}
      .mt-ink{color:${ANSWER_INK};}
      .mt-frac{display:inline-flex;flex-direction:column;text-align:center;line-height:1;vertical-align:middle;min-width:1.6em;font-variant-numeric:tabular-nums;}
      .mt-frac>span:first-child{border-bottom:1px solid #111;padding:0 .1em .05em;}
      .mt-frac>span:last-child{padding-top:.05em;}
      .mt-mixed{display:inline-flex;align-items:center;gap:.15em;}
      .mt-sign-line{justify-content:center;align-items:center;font-variant-numeric:tabular-nums;}
      .mt-sign-box{display:inline-flex;align-items:center;justify-content:center;width:9mm;height:9mm;border:.35mm solid #333;border-radius:50%;margin:0 2mm;line-height:1;}
      .mt-order,.mt-extremes,.mt-choice{display:flex;flex-direction:column;justify-content:center;gap:1.5mm;font-size:.95em;line-height:1.25;}
      /* 짧은 답칸 안내는 세 열에서도 한 줄: 사용자 수정 규칙 2026-10-04 */
      .mt-extremes .mt-order-write{font-size:9pt!important;white-space:nowrap;letter-spacing:-.15px;}
      .mt-extremes .mt-order-write .mt-write{min-width:7mm;width:7mm;}
      .mt-extremes .mt-order-write .mt-gap{width:2mm;}
      .mt-order-write{font-size:10pt;line-height:1.3;}
      .mt-order-values,.mt-choice-options{font-variant-numeric:tabular-nums;white-space:nowrap;overflow:hidden;}
      .mt-gap{display:inline-block;width:4mm;}
      .mt-cmp{margin:0 1.2mm;}
      .mt-write{display:inline-block;min-width:13mm;height:1.15em;border-bottom:1px solid #555;}
      .mt-choice-prompt{color:#333;}
      .mt-choice-options{font-size:.95em;}
      .mt-circle{border:.35mm solid ${ANSWER_INK};border-radius:50%;padding:0 1.2mm;}
      .mt-icon-blank{display:inline-flex;align-items:center;justify-content:center;width:1.7em;height:1.7em;vertical-align:middle;border:.35mm dashed #d71f10;border-radius:50%;}
      .mt-icon-blank img{width:1.2em;height:1.2em;opacity:.28;filter:grayscale(.6);}
      .mt-inline-blank{display:inline-block;min-width:11mm;height:1.25em;border:1px solid #555;vertical-align:-.15em;}
    `));
  }
  function mount(config) {
    const target = document.getElementById('sheet-root');
    const errorBox = document.getElementById('sheet-error');
    css();
    try {
      const built = build(config);
      target.replaceChildren(renderPage(config, false, built), renderPage(config, true, built));
      api.last = { config, built };
      const wire = (id, action) => { const button = document.getElementById(id); if (button) button.onclick = action; };
      wire('problem-button', () => { document.body.className = 'view-problem'; });
      wire('answer-button', () => { document.body.className = 'view-answer'; });
      wire('print-button', () => window.print());
      return built;
    } catch (error) {
      if (errorBox) errorBox.textContent = error.message;
      throw error;
    }
  }

  const api = { formats: FORMATS, build, generate: build, renderPage, mount, css, valueHTML, numberPool };
  root.MatchingSheet = api;
  if (root.Sheet && typeof root.Sheet.register === 'function') {
    for (const key of Object.keys(FORMATS)) {
      root.Sheet.register(key, function (target, question, answer, config) {
        if (target && target.nodeType === 1) {           // Sheet 격자: (cell, q, answer, config)
          const built = { items: [question], layout: { cols: 1, rows: 1, count: 1 }, shown: question.shown };
          return FORMATS[key].render(config, question, answer, built);
        }
        return renderPage(target, !!question);            // 서식 한 쪽: (config, isAnswer)
      });
    }
  }
})(globalThis);
