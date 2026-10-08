(function (root) {
  'use strict';

  // 그림·수 모형 서식 — A4 한 장 3단 × 5줄 = 15문항, 흑백 인쇄용 인라인 SVG.
  // 같은 그림 조각(십 프레임, 점 배열, 수 모형, 수직선, 분수 조각, 막대)을 쓰는 기존 활동은
  //   src/concept-layout/legacy-k-activities/k2-activities.js  (ten-frame · arrayDots · baseTen · numberLine · fractionModel · lengthBars)
  //   src/concept-layout/supplemental/player.js                (dots · rng 로 문항 만드는 방식)
  //   src/adapters/question-bank.js                            (dot-groups · area grid · 막대 비교)
  // 이며, 여기서는 같은 방식으로 그리되 인쇄용으로 작게·검게 다시 그린다.
  // 생성은 위 활동 생성기와 같은 결정적 방식(rng → 범위 선택 → 중복 제거)을 쓴다.
  const W = 200, H = 150;
  const KEYS = ['picture-count', 'picture-marking', 'picture-work', 'picture-groups', 'picture-model',
    'array-picture', 'relation-diagram', 'number-line', 'color-fraction', 'bar-compare'];
  const OBJECTS = ['apple', 'strawberry', 'grapes', 'rabbit', 'chick', 'dog', 'panda', 'balloon', 'car', 'bus', 'pencil', 'book', 'cookie', 'pizza', 'flower', 'butterfly'];
  const ART = {
    apple: '1f34e', strawberry: '1f353', grapes: '1f347', rabbit: '1f407',
    chick: '1f424', dog: '1f436', panda: '1f43c', balloon: '1f388',
    car: '1f697', bus: '1f68c', pencil: '270f', book: '1f4d5', cookie: '1f36a', pizza: '1f355', flower: '1f33c', butterfly: '1f98b'
  };
  // ---- 그림 아이콘 풀: 문제지 한 장에서 같은 아이콘이 되풀이되지 않게 seed 로 섞어 차례로 쓴다 ----
  const ICON_IDS = '1f32d,1f32e,1f32f,1f330,1f331,1f332,1f333,1f335,1f336,1f337,1f338,1f339,1f33a,1f33b,1f33c,1f33d,1f33e,1f33f,1f340,1f341,1f344,1f345,1f346,1f347,1f348,1f349,1f34a,1f34b,1f34c,1f34d,1f34e,1f350,1f351,1f352,1f353,1f354,1f355,1f356,1f357,1f358,1f359,1f35a,1f35b,1f35c,1f35d,1f35e,1f35f,1f360,1f361,1f362,1f363,1f364,1f365,1f366,1f369,1f36a,1f36b,1f36c,1f36d,1f36e,1f36f,1f370,1f371,1f372,1f373,1f375,1f37c,1f37f,1f380,1f381,1f382,1f388,1f389,1f3b2,1f3b3,1f3be,1f3c0,1f3c6,1f3cd,1f3ce,1f3d0,1f3d3,1f3fa,1f400,1f402,1f403,1f406,1f407,1f40b,1f40c,1f40f,1f410,1f411,1f413,1f414,1f417,1f418,1f41c,1f41d,1f41e,1f41f,1f420,1f421,1f422,1f424,1f426,1f427,1f428,1f429,1f42a,1f42b,1f42c,1f43e,1f43f,1f490,1f4ae,1f54a,1f577,1f578,1f680,1f681,1f686,1f689,1f68c,1f68e,1f68f,1f690,1f691,1f692,1f695,1f697,1f69a,1f69b,1f69c,1f69e,1f6b2,1f6e9,1f6fb,1f944,1f950,1f951,1f952,1f953,1f954,1f955,1f956,1f957,1f958,1f959,1f95a,1f95b,1f95c,1f95d,1f95e,1f95f,1f960,1f961,1f962,1f963,1f964,1f965,1f966,1f967,1f968,1f969,1f96a,1f96b,1f96c,1f96d,1f96e,1f96f,1f980,1f982,1f983,1f985,1f986,1f987,1f988,1f989,1f98b,1f98c,1f98d,1f98f,1f990,1f991,1f992,1f993,1f994,1f995,1f996,1f997,1f998,1f999,1f99a,1f99b,1f99c,1f99d,1f99e,1f99f,1f9a0,1f9a1,1f9a2,1f9a3,1f9a4,1f9a5,1f9a6,1f9a7,1f9a8,1f9a9,1f9aa,1f9ab,1f9ac,1f9ad,1f9ae,1f9c0,1f9c1,1f9c2,1f9c3,1f9c4,1f9c5,1f9c6,1f9c7,1f9c8,1f9c9,1f9ca,1f9cb,1f9e9,1f9f8,1fa80,1fa81,1fab0,1fab1,1fab2,1fab3,1fab4,1fab6,1fab7,1fab8,1fab9,1faba,1fad0,1fad1,1fad2,1fad3,1fad4,1fad5,1fad6,1fad7,1fad8,1fad9,2615,2618,26f5,2708'.split(',');
  const IconPool = {
    ids: ICON_IDS,
    // seed 로 섞은 목록의 index 번째 아이콘 코드
    pick(seed, index) {
      const n = ICON_IDS.length, start = (Math.imul((Number(seed) >>> 0) || 1, 2654435761) >>> 0) % n;
      const step = 37;   // 254 와 서로소 — 이웃한 번호가 비슷한 그림(과일끼리 등)으로 몰리지 않게 건너뛴다
      return ICON_IDS[(start + index * step) % n];
    }
  };
  function gcd(a, b) { return b ? gcd(b, a % b) : a; }
  // 문제 칸마다 sheet.js 가 at(seed, index) 로 현재 문항을 알려 주면, 그 칸 안의 점 그림은 모두 같은 아이콘이 된다(문제·정답지 동일).
  let state = { seed: 1, index: 0 };
  IconPool.at = (seed, index) => { state = { seed: Number(seed) || 1, index }; };
  IconPool.current = () => IconPool.pick(state.seed, state.index);
  IconPool.pickOther = () => IconPool.pick(state.seed, state.index + 97);   // 같은 문항 안에서 첫째 그림과 다른 둘째 그림
  root.IconPool = IconPool;
  const INK = '#111', SHADE = '#c4dfb8';

  // ---- 작은 도구 ------------------------------------------------------
  const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const svg = body => `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" aria-hidden="true" shape-rendering="geometricPrecision">${body}</svg>`;
  const rect = (x, y, w, h, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" ${extra}/>`;
  const outline = (x, y, w, h, dash, weight = 1.4) => rect(x, y, w, h, `fill="none" stroke="${INK}" stroke-width="${weight}"${dash ? ' stroke-dasharray="4 3"' : ''}`);
  const hline = (x1, x2, y, weight = 1.4, dash) => `<path d="M${x1} ${y}H${x2}" fill="none" stroke="${INK}" stroke-width="${weight}"${dash ? ' stroke-dasharray="4 3"' : ''}/>`;
  const vline = (x, y1, y2, weight = 1.4) => `<path d="M${x} ${y1}V${y2}" fill="none" stroke="${INK}" stroke-width="${weight}"/>`;
  const txt = (x, y, value, size = 15, anchor = 'middle') => `<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="${size}" fill="${INK}">${esc(value)}</text>`;
  const fracTxt = (x, y, n, d, size = 14) => txt(x, y, n, size) + `<path d="M${x - size * 0.5} ${y + 3}H${x + size * 0.5}" stroke="${INK}" stroke-width="1.2"/>` + txt(x, y + 3 + size * 0.95, d, size);
  function blankBox(x, y, w, h, answer, value, size = 15) {
    return outline(x, y, w, h, true, 1.2) + (answer ? txt(x + w / 2, y + h / 2 + size * 0.34, value, size) : '');
  }
  const answerSpace = (value, answer) => `<span class="answer-space">${answer ? esc(value) : ' '}</span>`;
  const blankSpace = (value, answer) => `<span class="blank-space">${answer ? esc(value) : ' '}</span>`;

  function random(seed) {
    let s = seed >>> 0;
    return (a, b) => {
      s += 0x6d2b79f5;
      let t = s;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return a + Math.floor(((t ^ t >>> 14) >>> 0) / 4294967296 * (b - a + 1));
    };
  }
  function hash(text) {
    let h = 2166136261;
    for (const ch of String(text)) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function starPath(cx, cy, s) {
    const points = [];
    for (let i = 0; i < 10; i++) {
      const radius = i % 2 ? s * 0.45 : s;
      const angle = -Math.PI / 2 + i * Math.PI / 5;
      points.push(`${(cx + Math.cos(angle) * radius).toFixed(1)} ${(cy + Math.sin(angle) * radius).toFixed(1)}`);
    }
    return `M${points.join('L')}Z`;
  }
  const SOLID = `fill="${INK}"`, HOLLOW = `fill="none" stroke="${INK}" stroke-width="1.3"`;
  function glyph(object, cx, cy, s, paint = SOLID) {
    if (object === 'dot' || (object === 'circle' && paint === SOLID)) object = IconPool.current();   // 검정 점 대신 그림 아이콘
    if (ART[object] || /^[0-9a-f]{4,5}$/.test(object)) {
      const size = s * 2.35;
      return `<image style="filter:saturate(2) contrast(1.2) brightness(.92) drop-shadow(0 0 .7px #222)" href="vendor/art/${ART[object] || object}.svg" x="${(cx - size / 2).toFixed(1)}" y="${(cy - size / 2).toFixed(1)}" width="${size.toFixed(1)}" height="${size.toFixed(1)}" preserveAspectRatio="xMidYMid meet"/>`;
    }
    if (object === 'square') return rect(cx - s, cy - s, 2 * s, 2 * s, paint);
    if (object === 'triangle') return `<path d="M${cx} ${cy - s}L${cx + s} ${cy + s}L${cx - s} ${cy + s}Z" ${paint}/>`;
    if (object === 'star') return `<path d="${starPath(cx, cy, s)}" ${paint}/>`;
    return `<circle cx="${cx}" cy="${cy}" r="${s}" ${paint}/>`;
  }
  const objectOf = value => OBJECTS[((Number(value) % OBJECTS.length) + OBJECTS.length) % OBJECTS.length];

  // 상자 안에 perRow개씩 담아 그림 (묶음·배열 공용)
  function items(x, y, w, h, count, object, perRow = 5, paint = SOLID) {
    const rows = Math.max(1, Math.ceil(count / perRow));
    const cw = w / perRow, ch = h / rows, size = Math.min(cw, ch) * 0.27;
    let body = '';
    for (let i = 0; i < count; i++) {
      const cx = x + cw * ((i % perRow) + 0.5), cy = y + ch * (Math.floor(i / perRow) + 0.5);
      body += glyph(object, cx, cy, size, typeof paint === 'function' ? paint(i) : paint);
    }
    return body;
  }
  // 십 프레임(2×5) — 10을 넘으면 프레임을 하나 더 그린다
  function tenFrames(n, object, paintFor = () => SOLID) {
    const frames = Math.max(1, Math.ceil(n / 10));
    const fw = 88, fh = 36, gap = 10;
    const x0 = (W - (frames * fw + (frames - 1) * gap)) / 2, y0 = (H - fh) / 2 - 4;
    let body = '';
    for (let f = 0; f < frames; f++) {
      const fx = x0 + f * (fw + gap);
      body += outline(fx, y0, fw, fh, false, 1.6);
      for (let row = 0; row < 2; row++) for (let col = 0; col < 5; col++) {
        body += rect(fx + fw * col / 5, y0 + fh * row / 2, fw / 5, fh / 2, `fill="none" stroke="#bbb" stroke-width=".8"`);
        const index = f * 10 + row * 5 + col;
        if (index < n) body += glyph(object, fx + fw * (col + 0.5) / 5, y0 + fh * (row + 0.5) / 2, 5.2, paintFor(index));
      }
    }
    return body;
  }
  // 같은 수씩 묶은 묶음 상자
  // 칸 안에 count 개를 넣을 때 아이콘이 가장 크게 들어가는 한 줄 개수(perRow)를 골라 칸을 꽉 채운다.
  function itemsFit(x, y, w, h, count, object, paint = SOLID) {
    if (count <= 0) return '';
    let best = null;
    for (let perRow = 1; perRow <= count; perRow++) {
      const rows = Math.ceil(count / perRow), cell = Math.min(w / perRow, h / rows);
      if (!best || cell > best.cell + 0.01) best = { perRow, rows, cell };
    }
    const { perRow, rows, cell } = best, size = cell * 0.4;   // 아이콘 한 변 ≈ 칸의 94%
    const gx = x + (w - perRow * cell) / 2, gy = y + (h - rows * cell) / 2;
    let body = '';
    for (let i = 0; i < count; i++) {
      body += glyph(object, gx + cell * ((i % perRow) + 0.5), gy + cell * (Math.floor(i / perRow) + 0.5), size, typeof paint === 'function' ? paint(i) : paint);
    }
    return body;
  }
  function bundleBox(x, y, w, h, count, object, perRow = 5) {
    return outline(x, y, w, h, false, 1.5) + itemsFit(x + 2, y + 2, w - 4, h - 4, count, object);
  }
  // 수 모형 — 백 판(10×10), 십 막대(10칸), 낱개(1칸)
  function baseBlocks(x, y, hundreds, tens, ones, unit = 5) {
    let body = '', cursor = x;
    for (let i = 0; i < hundreds; i++) {
      body += baseFlat(cursor, y, unit);
      cursor += unit * 10 + 6;
    }
    if (hundreds) cursor += 4;
    for (let i = 0; i < tens; i++) {
      body += baseRod(cursor, y, unit);
      cursor += unit + 2.5;
    }
    if (tens) cursor += 4;
    for (let i = 0; i < ones; i++) {
      body += rect(cursor, y + unit * 9, unit, unit, `fill="${INK}"`);
      cursor += unit + 2.5;
    }
    return body;
  }
  function baseFlat(x, y, unit) {
    let body = rect(x, y, unit * 10, unit * 10, `fill="${SHADE}" stroke="${INK}" stroke-width="1.2"`);
    for (let i = 1; i < 10; i++) body += vline(x + unit * i, y, y + unit * 10, 0.5) + hline(x, x + unit * 10, y + unit * i, 0.5);
    return body;
  }
  function baseRod(x, y, unit) {
    let body = rect(x, y, unit, unit * 10, `fill="${INK}"`);
    for (let i = 1; i < 10; i++) body += hline(x, x + unit, y + unit * i, 0.5);
    return body;
  }
  function baseWidth(hundreds, tens, ones, unit = 5) {
    const h = hundreds * (unit * 10 + 6) + (hundreds ? 4 : 0);
    const t = tens * (unit + 2.5);
    const o = ones * (unit + 2.5);
    return h + t + (tens ? 4 : 0) + o;
  }
  // 띠 모양 수 배열표(뛰어 세기)
  function sequenceStrip(values, blanks, answer) {
    // 숫자 카드를 크게: 카드가 쪽 폭을 거의 다 쓰도록 키우고 높이·글자도 키운다.
    const gap = 3, total = values.length, ch = 40;
    const cw = Math.min(40, (W - 6 - gap * (total - 1)) / total), y = H / 2 - ch / 2 - 4;
    const x0 = (W - (total * cw + (total - 1) * gap)) / 2;
    const fs = Math.min(22, cw * 0.62);
    let body = '';
    values.forEach((value, i) => {
      const x = x0 + i * (cw + gap);
      if (blanks.includes(i)) body += blankBox(x, y, cw, ch, answer, value, fs);
      else body += outline(x, y, cw, ch, false, 1.5) + txt(x + cw / 2, y + ch / 2 + fs * 0.35, value, fs);
    });
    return body;
  }

  // ---- 문항 만들기 ---------------------------------------------------
  const between = (r, a, b) => r(Math.min(a, b), Math.max(a, b));

  function resolveMode(config) {
    const gen = config.gen || {};
    if (gen.mode) return String(gen.mode);
    const task = String(gen.taskCondition || '');
    const op = String(gen.operation || gen.op || '');
    switch (config.format) {
      case 'picture-count':
        return gen.twoGroups || /합쳐|모으/.test(task) ? 'add' : 'count';
      case 'picture-marking':
        // '그림을 두 묶음으로 나누기'(wholeMax·partCount) 와 '수만큼 표시하기'(numberMax) 를 조건으로 가른다
        return /나누/.test(task) || gen.wholeMax != null || gen.partCount != null ? 'split' : 'mark';
      case 'picture-work':
        if (/빈 그림/.test(task) || gen.numberMin === 0 && gen.numberMax === 0) return 'zero';
        if (gen.tensBundles || /낱개/.test(task)) return 'bundle';
        if (/몇 배/.test(task) || op === '×' && /배/.test(task)) return 'times';
        return op === '−' ? 'sub' : op === '÷' ? 'divide' : 'add';
      case 'picture-groups':
        return op === '÷' ? 'share' : 'bundle';
      case 'array-picture':
        if (gen.sequence || /뛰어 세는/.test(task)) return 'sequence';
        return gen.mode === 'build' || /배열 완성/.test(task) ? 'build' : 'read';
      case 'picture-model':
        return /빈칸|나타내|그리/.test(task) ? 'build' : 'read';
      case 'relation-diagram':
        return /가르기/.test(task) ? 'split' : 'collect';
      case 'number-line':
        if (gen.line === 'fraction') return 'fraction';
        if (gen.line === 'decimal') return 'decimal';
        if (/위치 표시|표시하기/.test(task)) return 'mark';
        if (gen.jump || /이동|뛰기|뛰어/.test(task)) return 'jump';
        if (/위치에 수/.test(task)) return 'mark';
        return 'missing';
      case 'color-fraction':
        return /이름|분수 쓰|보고/.test(task) ? 'name' : 'shade';
      case 'bar-compare':
        return /긴|길이/.test(task) ? 'longer' : 'times';
      default:
        return 'default';
    }
  }

  const BUILDERS = {};

  BUILDERS['picture-count'] = (mode, gen, r, index) => {
    const object = objectOf(index);
    if (mode === 'add') {
      const total = between(r, 2, Math.min(Number(gen.numberMax) || 10, 10));
      const a = between(r, 1, total - 1), b = total - a;
      return { kind: 'add', mode, a, b, total, object, key: `add:${a}:${b}` };
    }
    const max = Math.min(Number(gen.numberMax) || 20, 20);
    const min = Math.max(Number(gen.numberMin) || 1, 0);
    // 'zero' 모드는 빈 그림(0) 하나뿐이라 15문항을 채울 수 없다 — 4문항에 1문항꼴로 0을 섞는다.
    const n = mode === 'zero' ? (index % 4 === 0 ? 0 : between(r, 1, Math.min(max, 9))) : between(r, min, max);
    // 좁은 범위(1~9 등)에서도 15문항을 채우도록 십 프레임과 한 줄 배열을 번갈아 쓴다.
    const layout = n > 10 ? 'frame' : (index % 2 ? 'row' : 'frame');
    return { kind: 'count', mode, n, layout, object, key: `count:${n}:${layout}` };
  };

  BUILDERS['picture-marking'] = (mode, gen, r, index) => {
    const object = objectOf(index);
    if (mode === 'split') {
      const max = Math.min(Number(gen.wholeMax) || 9, 10);
      const n = between(r, 3, max);
      const a = between(r, 1, n - 1), b = n - a;
      return { kind: 'split', mode, n, a, b, object, key: `split:${a}:${b}` };
    }
    const max = Math.min(Number(gen.numberMax) || 9, 20);
    // 표시할 자리 수(10칸·20칸)를 번갈아 써서 좁은 범위에서도 문항이 겹치지 않게 한다.
    const total = index % 2 ? 20 : 10;
    const n = between(r, 1, Math.min(max, total));
    return { kind: 'mark', mode, n, total, object, key: `mark:${n}:${total}` };
  };

  BUILDERS['picture-work'] = (mode, gen, r, index) => {
    const object = objectOf(index);
    if (mode === 'zero') return { kind: 'zero', mode, n: 0, object, key: 'zero' };
    if (mode === 'bundle') {
      // 11~19만 쓰면 9문항밖에 안 되므로 기본은 11~39까지 (tensBundlesMax:1 로 11~19 고정)
      const tens = between(r, Number(gen.tensBundles) || 1, Math.min(Number(gen.tensBundlesMax) || 3, 9));
      const ones = between(r, Number(gen.onesMin) || 1, Number(gen.onesMax) || 9);
      const n = tens * 10 + ones;
      return { kind: 'bundle', mode, tens, ones, n, object, key: `bundle:${tens}:${ones}` };
    }
    if (mode === 'divide') {
      // 그림으로 그릴 수 있는 크기로 묶는다 (나누는 수 ≤ 6, 몫 ≤ 5)
      const divisor = between(r, Number(gen.divisorMin) || 2, Math.min(Number(gen.divisorMax) || 6, 6));
      const quotient = between(r, 2, Math.min(5, Math.floor((Number(gen.dividendMax) || 30) / divisor)));
      const remainder = between(r, 0, divisor - 1);
      return { kind: 'divide', mode, divisor, quotient, remainder, dividend: divisor * quotient + remainder, object,
        key: `divide:${divisor}:${quotient}:${remainder}` };
    }
    if (mode === 'times') {
      const groupCount = between(r, Number(gen.groupCountMin) || 2, Math.min(Number(gen.groupCountMax) || 5, 5));
      const groupSize = between(r, Number(gen.groupSizeMin) || 2, Math.min(Number(gen.groupSizeMax) || 10, 10));
      return { kind: 'times', mode, groupCount, groupSize, total: groupCount * groupSize, object, key: `times:${groupSize}:${groupCount}` };
    }
    const max = Math.min(Number(gen.numberMax) || 20, 20);
    const sum = between(r, 4, max);
    const a = between(r, 1, sum - 1), b = sum - a;
    return { kind: mode, mode, a, b, sum, object, key: `${mode}:${a}:${b}` };
  };

  BUILDERS['picture-groups'] = (mode, gen, r, index) => {
    const object = objectOf(index);
    if (mode === 'share') {
      const divisor = between(r, Number(gen.divisorMin) || 2, Math.min(Number(gen.divisorMax) || 6, 6));
      const quotient = between(r, 2, Math.min(5, Math.floor((Number(gen.dividendMax) || 30) / divisor)));
      const remainder = between(r, 0, divisor - 1);
      return { kind: 'share', mode, divisor, quotient, remainder, dividend: divisor * quotient + remainder, object, key: `share:${divisor}:${quotient}:${remainder}` };
    }
    const bundleSize = Number(gen.bundleSize) || 10;
    const groups = between(r, 1, 5), ones = between(r, 0, bundleSize - 1);
    return { kind: 'bundle', mode, bundleSize, groups, ones, total: groups * bundleSize + ones, object, key: `bundle:${groups}:${ones}` };
  };

  BUILDERS['array-picture'] = (mode, gen, r, index) => {
    const object = objectOf(index);
    if (mode === 'sequence') {
      const step = (Array.isArray(gen.stepValues) ? gen.stepValues : [2, 5, 10])[r(0, 2)] || 2;
      const terms = between(r, 5, 7), start = step;
      const values = Array.from({ length: terms }, (_, i) => start + step * i);
      const blanks = [];
      while (blanks.length < 2) { const at = between(r, 1, terms - 1); if (!blanks.includes(at)) blanks.push(at); }
      blanks.sort((a, b) => a - b);
      return { kind: 'sequence', mode, step, values, blanks, object, key: `seq:${step}:${values[terms - 1]}:${blanks.join('-')}` };
    }
    const rows = between(r, 2, Math.min(Number(gen.groupCountMax) || 6, 6));
    const cols = between(r, 2, Math.min(Number(gen.groupSizeMax) || 6, 6));
    return { kind: mode, mode, rows, cols, object, key: `${mode}:${rows}:${cols}` };
  };

  BUILDERS['picture-model'] = (mode, gen, r, index) => {
    const object = objectOf(index);
    if (mode === 'build') {
      const tens = between(r, 1, 9), ones = between(r, 0, 9);
      return { kind: 'build', mode, hundreds: 0, tens, ones, n: tens * 10 + ones, object, key: `build:${tens}:${ones}` };
    }
    // 백 판이 들어가면 폭이 커지므로 십 막대·낱개 수를 줄여 한 칸에 들어가게 한다
    const hundreds = gen.hundreds ? between(r, 1, 2) : 0;
    const tens = hundreds ? between(r, 0, 4) : between(r, 1, 9);
    const ones = hundreds ? between(r, 0, 5) : between(r, 0, 9);
    return { kind: 'read', mode, hundreds, tens, ones, n: hundreds * 100 + tens * 10 + ones, object, key: `read:${hundreds}:${tens}:${ones}` };
  };

  BUILDERS['relation-diagram'] = (mode, gen, r, index) => {
    const wholeMax = Math.min(Number(gen.wholeMax) || 10, 10);
    const wholeMin = Math.max(Number(gen.wholeMin) || 3, 3);
    const whole = between(r, wholeMin, wholeMax);
    const a = between(r, 1, whole - 1), b = whole - a;
    const blanks = [0, 1, 2].slice(0, mode === 'split' ? 2 : 1);
    return { kind: mode, mode, whole, a, b, blanks, key: `${mode}:${a}:${b}` };
  };

  BUILDERS['number-line'] = (mode, gen, r, index) => {
    if (mode === 'fraction') {
      const denominator = [2, 3, 4, 5, 8][r(0, 4)];
      const numerator = between(r, 1, denominator - 1);
      return { kind: 'fraction', mode, denominator, numerator, key: `frac:${numerator}:${denominator}` };
    }
    if (mode === 'decimal') {
      const tenths = between(r, 1, 9);
      return { kind: 'decimal', mode, tenths, key: `dec:${tenths}` };
    }
    if (mode === 'mark') {
      const to = Math.min(Number(gen.numberMax) || 20, 20) <= 10 ? 10 : 20;
      const n = between(r, 1, to);
      return { kind: 'mark', mode, to, n, key: `mark:${to}:${n}` };
    }
    if (mode === 'jump') {
      // 눈금은 뛰는 값마다 하나씩 — 0에서 몇 번 뛰었는지 그림만 보고 읽는다.
      const values = Array.isArray(gen.stepValues) ? gen.stepValues : [1, 2, 5, 10];
      const step = values[r(0, values.length - 1)] || 2;
      const jumps = between(r, 2, 4);
      const from = (jumps > 2 && index % 2) ? step : 0;
      const end = from + step * jumps;
      return { kind: 'jump', mode, from, step, jumps, end, to: end, key: `jump:${from}:${step}:${jumps}` };
    }
    const to = (Number(gen.numberMax) || 10) <= 10 ? 10 : 20;
    // 20까지는 한 칸 간격이 좁아 짝수 눈금만 표시한다 (0, 2, 4 … 20).
    const labelStep = to > 10 ? 2 : 1;
    const stops = [];
    for (let value = labelStep; value < to; value += labelStep) stops.push(value);
    const blanks = [];
    for (let attempt = 0; blanks.length < (to > 10 ? 4 : 3) && attempt < 300; attempt++) {
      const at = stops[r(0, stops.length - 1)];
      if (blanks.some(chosen => Math.abs(chosen - at) < labelStep * 2)) continue;
      if (!blanks.includes(at)) blanks.push(at);
    }
    blanks.sort((a, b) => a - b);
    return { kind: 'missing', mode, to, blanks, labelStep, key: `missing:${to}:${blanks.join('-')}` };
  };

  BUILDERS['color-fraction'] = (mode, gen, r, index) => {
    const shape = gen.shape === 'bar' ? 'bar' : r(0, 1) ? 'circle' : 'bar';
    const denominator = [2, 3, 4, 6, 8][r(0, 4)];
    const numerator = between(r, 1, denominator - 1);
    return { kind: mode, mode, shape, denominator, numerator, key: `${mode}:${shape}:${numerator}:${denominator}` };
  };

  BUILDERS['bar-compare'] = (mode, gen, r, index) => {
    if (mode === 'longer') {
      const a = between(r, 4, 9), b = between(r, 2, 9);
      if (a === b) return { kind: 'longer', mode, a: a, b: a - 1, key: `longer:${a}:${a - 1}` };
      return { kind: 'longer', mode, a, b, key: `longer:${a}:${b}` };
    }
    const base = between(r, 2, Math.min(6, Number(gen.groupSizeMax) || 6));
    const times = between(r, 2, Math.min(4, Number(gen.groupCountMax) || 4));
    return { kind: 'times', mode, base, times, key: `times:${base}:${times}` };
  };

  // ---- 그리기: 문제지·정답지 공용 -------------------------------------
  const FRAMES = {};

  FRAMES['picture-count'] = (q, answer) => {
    if (q.mode === 'add') {
      const body = outline(14, 30, 78, 62, false, 1.6) + items(16, 32, 74, 58, q.a, q.object, 3)
        + txt(100, 68, '+', 20) + outline(108, 30, 78, 62, false, 1.6) + items(110, 32, 74, 58, q.b, q.object, 3);
      return { svg: svg(body), foot: `${blankSpace(q.a, answer)} + ${blankSpace(q.b, answer)} = ${answerSpace(q.total, answer)}` };
    }
    if (q.n === 0) return { svg: svg(outline(58, 40, 84, 56, true, 1.6)), foot: `수 ${answerSpace(0, answer)}` };
    if (q.layout === 'row') {
      const rows = q.n > 5 ? Math.ceil(q.n / 5) : 1;
      return { svg: svg(items(10, 30, 180, 60, q.n, q.object, rows === 1 ? q.n : 5)), foot: `수 ${answerSpace(q.n, answer)}` };
    }
    return { svg: svg(tenFrames(q.n, q.object)), foot: `수 ${answerSpace(q.n, answer)}` };
  };

  FRAMES['picture-marking'] = (q, answer) => {
    if (q.mode === 'split') {
      // 10칸 자리를 기준으로 n개를 한 줄에 그린다. 정답지에는 나눈 자리를 선으로 보여 준다.
      const slot = 16, startX = 12 + (176 - slot * q.n) / 2;
      const body = items(startX, 36, slot * q.n, 58, q.n, q.object, q.n);
      const cut = startX + slot * q.a;
      const divider = answer
        ? vline(cut, 26, 104, 1.6) + txt(startX + slot * q.a / 2, 122, q.a, 15) + txt(cut + slot * q.b / 2, 122, q.b, 15)
        : '';
      return { svg: svg(body + divider), foot: `${blankSpace(q.a, answer)} 와(과) ${blankSpace(q.b, answer)}` };
    }
    const perRow = q.total === 10 ? 5 : 10;
    // 정답지에는 표시한 자리를 회색으로 채우고, 그 위에 빈 동그라미 외곽선을 다시 그린다.
    let body = answer ? items(6, 36, 188, 74, q.n, 'circle', perRow, `fill="${SHADE}" stroke="none"`) : '';
    body += items(6, 36, 188, 74, q.total, 'circle', perRow, HOLLOW);
    return { svg: svg(body), foot: `수 ${q.n} 만큼 표시` };
  };

  FRAMES['picture-work'] = (q, answer) => {
    if (q.mode === 'zero') return { svg: svg(outline(58, 40, 84, 56, true, 1.6)), foot: `수 ${answerSpace(0, answer)}` };
    if (q.mode === 'bundle') {
      const body = bundleBox(20, 26, 74, 62, 10, 'dot') + items(112, 42, 70, 34, q.ones, q.object, 5);
      return { svg: svg(body + txt(103, 62, '+', 18)), foot: `수 ${answerSpace(q.n, answer)}` };
    }
    if (q.mode === 'times') {
      // 묶음을 2열 격자로 놓아 묶음 하나가 충분히 크게 보이도록 한다
      const cols = q.groupCount <= 2 ? q.groupCount : 2, rows = Math.ceil(q.groupCount / cols);
      const w = 176 / cols, h = 124 / rows;
      let body = '';
      for (let i = 0; i < q.groupCount; i++) {
        body += bundleBox(12 + (i % cols) * w, 14 + Math.floor(i / cols) * h, w - 8, h - 8, q.groupSize, q.object);
      }
      return { svg: svg(body), foot: `${q.groupSize} × ${q.groupCount} = ${answerSpace(q.total, answer)}` };
    }
    if (q.mode === 'divide') {
      // 묶음 상자를 격자로 놓되, 상자 안 아이콘이 가장 크게 들어가는 열 수(cols)를 고른다. 남은 것은 오른쪽 칸에 크게 놓는다.
      const n = Math.max(q.quotient, 1), area = { x: 8, y: 20, w: 136, h: 110 }, gap = 4;
      const fitCell = (w, h, count) => { let c = 0; for (let k = 1; k <= count; k++) c = Math.max(c, Math.min(w / k, h / Math.ceil(count / k))); return c; };
      let best = null;
      for (let cols = 1; cols <= n; cols++) {
        const rows = Math.ceil(n / cols), bw = (area.w - gap * (cols - 1)) / cols, bh = (area.h - gap * (rows - 1)) / rows;
        const cell = fitCell(bw - 4, bh - 4, q.divisor);
        if (!best || cell > best.cell + 0.01) best = { cols, rows, bw, bh, cell };
      }
      let body = '';
      for (let i = 0; i < n; i++) {
        body += bundleBox(area.x + (i % best.cols) * (best.bw + gap), area.y + Math.floor(i / best.cols) * (best.bh + gap), best.bw, best.bh, q.divisor, q.object);
      }
      body += outline(150, 20, 44, 110, true, 1.2) + itemsFit(152, 22, 40, 106, q.remainder, q.object);
      return { svg: svg(body), foot: `${q.dividend} ÷ ${q.divisor} = ${answerSpace(q.quotient, answer)} ··· ${answerSpace(q.remainder, answer)}` };
    }
    if (q.mode === 'sub') {
      // 지운 그림 — 뒤에서 b개를 X로 지운다 (k2-activities 의 cross-out-set 과 같은 방식)
      const cut = 16 + 168 * ((q.sum - q.b) / q.sum);
      let body = outline(12, 26, 176, 66, false, 1.6) + items(16, 30, 168, 58, q.sum, q.object, 6,
        index => index >= q.sum - q.b ? HOLLOW : SOLID);
      if (answer) {
        for (let i = q.sum - q.b; i < q.sum; i++) {
          const cx = 16 + 168 * ((i % 6) + 0.5) / 6, cy = 30 + 58 * (Math.floor(i / 6) + 0.5) / Math.ceil(q.sum / 6);
          body += `<path d="M${cx - 7} ${cy - 7}L${cx + 7} ${cy + 7}M${cx + 7} ${cy - 7}L${cx - 7} ${cy + 7}" stroke="${INK}" stroke-width="1.6"/>`;
        }
      }
      return { svg: svg(body + (answer ? vline(cut, 26, 92, 1.4) : '')), foot: `${q.sum} − ${q.b} = ${answerSpace(q.sum - q.b, answer)}` };
    }
    const body = outline(14, 30, 78, 62, false, 1.6) + items(16, 32, 74, 58, q.a, q.object, 3)
      + outline(108, 30, 78, 62, false, 1.6) + items(110, 32, 74, 58, q.b, q.object, 3);
    return { svg: svg(body), foot: `${blankSpace(q.a, answer)} + ${blankSpace(q.b, answer)} = ${blankSpace(q.sum, answer)}` };
  };

  FRAMES['picture-groups'] = (q, answer) => {
    if (q.mode === 'share') {
      // 묶음 상자는 위아래로 쌓으므로 가로를 넓게 쓰고, 남은 것은 오른쪽 넓은 칸에 크게 놓는다.
      const h = 112 / Math.max(q.quotient, 1);
      let body = '';
      for (let i = 0; i < q.quotient; i++) body += bundleBox(10, 16 + i * h, 124, h - 4, q.divisor, q.object);
      body += itemsFit(140, 18, 50, 106, q.remainder, q.object);
      return { svg: svg(body), foot: `${q.dividend} ÷ ${q.divisor} = ${answerSpace(q.quotient, answer)} ··· ${answerSpace(q.remainder, answer)}` };
    }
    const perRow = q.groups <= 4 ? 2 : 3, rows = Math.ceil(q.groups / perRow);
    const boxH = 88 / rows, boxW = 180 / perRow;
    let body = '';
    for (let i = 0; i < q.groups; i++) {
      body += bundleBox(10 + (i % perRow) * boxW, 10 + Math.floor(i / perRow) * boxH, boxW - 8, boxH - 8, q.bundleSize, 'dot');
    }
    // 낱개는 묶음 아래 한 줄에
    body += items(10, 6 + rows * boxH, 180, 30, q.ones, q.object, 10);
    return { svg: svg(body), foot: `묶음 ${answerSpace(q.groups, answer)}개, 낱개 ${answerSpace(q.ones, answer)}개 → ${answerSpace(q.total, answer)}` };
  };

  FRAMES['array-picture'] = (q, answer) => {
    if (q.mode === 'sequence') return { svg: svg(sequenceStrip(q.values, q.blanks, answer)), foot: `${q.step}씩 뛰어 세기` };
    const w = 150, h = 96, cw = w / q.cols, ch = h / q.rows;
    let body = `<g transform="translate(25 22)">`;
    for (let row = 0; row < q.rows; row++) {
      const y = row * ch;
      body += q.mode === 'read' ? rect(0, y, w, ch, `fill="none" stroke="#999" stroke-width=".8"`) : outline(0, y, w, ch, true, 1.1);
      for (let col = 0; col < q.cols; col++) {
        const cx = cw * (col + 0.5), cy = y + ch / 2;
        if (q.mode === 'read' || answer) body += glyph(q.object, cx, cy, Math.min(cw, ch) * 0.24);
      }
    }
    body += '</g>';
    if (q.mode === 'build') {
      return { svg: svg(body), foot: `${q.rows} × ${q.cols}${answer ? ` = ${q.rows * q.cols}` : ''}` };
    }
    return { svg: svg(body), foot: `${blankSpace(q.rows, answer)} × ${blankSpace(q.cols, answer)} = ${answerSpace(q.rows * q.cols, answer)}` };
  };

  FRAMES['picture-model'] = (q, answer) => {
    const unit = 5;
    const width = baseWidth(q.hundreds, q.tens, q.ones, unit);
    const x = Math.max(8, (W - width) / 2), y = 34;
    const chart = (hundreds, tens, ones) => {
      const labels = ['백', '십', '일'];
      const values = [hundreds, tens, ones];
      let body = '';
      labels.forEach((label, i) => {
        const cx = 62 + i * 34;
        body += txt(cx, 132, label, 12);
        body += blankBox(cx - 13, 106, 26, 20, answer, values[i], 13);
      });
      return body;
    };
    if (q.mode === 'build') {
      // 학생이 그리는 칸 — 정답지에는 같은 수 모형을 그려 넣는다
      const drawn = answer
        ? baseBlocks(Math.max(10, (W - baseWidth(q.hundreds, q.tens, q.ones, 4.4)) / 2), 42, q.hundreds, q.tens, q.ones, 4.4)
        : '';
      return {
        svg: svg(txt(100, 26, q.n, 22) + outline(16, 36, 168, 60, !answer, 1.4) + drawn + chart(q.hundreds, q.tens, q.ones)),
        foot: `수 ${answerSpace(q.n, answer)}`
      };
    }
    const blocks = q.mode === 'read' && q.n === 0 ? outline(58, 44, 84, 44, true, 1.6) : baseBlocks(x, y, q.hundreds, q.tens, q.ones, unit);
    return { svg: svg(blocks + chart(q.hundreds, q.tens, q.ones)), foot: `수 ${answerSpace(q.n, answer)}` };
  };

  FRAMES['relation-diagram'] = (q, answer) => {
    // 위 한 칸(전체), 아래 두 칸(부분)
    const wholeY = 30, partY = 104, leftX = 62, rightX = 138, barY = 70;
    const cell = (cx, cy, value, index) => q.blanks.includes(index) && !answer
      ? blankBox(cx - 21, cy - 14, 42, 28, false, '')
      : outline(cx - 21, cy - 14, 42, 28, false, 1.5) + txt(cx, cy + 6, value, 16);
    const body = cell(100, wholeY, q.whole, 0)
      + vline(100, wholeY + 14, barY, 1.4) + hline(leftX, rightX, barY, 1.4)
      + vline(leftX, barY, partY - 14, 1.4) + vline(rightX, barY, partY - 14, 1.4)
      + cell(leftX, partY, q.a, 1) + cell(rightX, partY, q.b, 2);
    const foot = q.mode === 'split'
      ? `${q.whole} 를 ${blankSpace(q.a, answer)} 와(과) ${blankSpace(q.b, answer)} 로`
      : `${q.a} + ${q.b} = ${blankSpace(q.whole, answer)}`;
    return { svg: svg(body), foot };
  };

  FRAMES['number-line'] = (q, answer) => {
    const lineY = 82, x0 = 20, x1 = 180;
    const draw = (to, labelFor) => {
      let body = hline(x0, x1, lineY, 1.6);
      for (let i = 0; i <= to; i++) {
        const x = x0 + (x1 - x0) * i / to;
        body += vline(x, lineY, lineY + 8, 1.2);
        const label = labelFor(i, x);
        if (label) body += label;
      }
      body += `<path d="M${x1} ${lineY - 4}L${x1 + 6} ${lineY}L${x1} ${lineY + 4}Z" fill="${INK}"/>`;
      return body;
    };
    if (q.mode === 'missing') {
      const step = q.labelStep || 1;
      const body = draw(q.to, (i, x) => {
        if (i % step) return '';
        if (q.blanks.includes(i)) return blankBox(x - 8, lineY + 12, 16, 19, answer, i, 12);
        return txt(x, lineY + 25, i, 12);
      });
      return { svg: svg(body), foot: `빠진 눈금 ${answerSpace(q.blanks.join(', '), answer)}` };
    }
    if (q.mode === 'mark') {
      const x = x0 + (x1 - x0) * q.n / q.to;
      const mark = answer ? `<circle cx="${x}" cy="${lineY}" r="5" fill="${INK}"/>` : '';
      const body = draw(q.to, (i, tx) => i % 2 === 0 ? txt(tx, lineY + 25, i, 12) : '') + mark;
      return { svg: svg(body), foot: `${q.n}의 위치에 표시 ${answerSpace('', answer)}` };
    }
    if (q.mode === 'jump') {
      // 눈금은 뛰는 지점마다 하나 (0, 2, 4 … 처럼 값이 눈금 위에 그대로 적힌다)
      const span = q.step * q.jumps, at = offset => x0 + (x1 - x0) * offset / span;
      let body = hline(x0, x1, lineY, 1.6);
      for (let j = 0; j <= q.jumps; j++) {
        const x = at(j * q.step);
        body += vline(x, lineY, lineY + 8, 1.2) + txt(x, lineY + 25, q.from + j * q.step, 13);
      }
      body += `<path d="M${x1} ${lineY - 4}L${x1 + 6} ${lineY}L${x1} ${lineY + 4}Z" fill="${INK}"/>`;
      for (let j = 0; j < q.jumps; j++) {
        const from = at(j * q.step), target = at((j + 1) * q.step), mid = (from + target) / 2;
        body += `<path d="M${from} ${lineY - 4} Q${mid} ${lineY - 36} ${target} ${lineY - 4}" fill="none" stroke="${INK}" stroke-width="1.5"/>`
          + `<path d="M${target - 6} ${lineY - 11}L${target} ${lineY - 4}L${target - 7} ${lineY - 1}Z" fill="${INK}"/>`
          + txt(mid, lineY - 24, '+' + q.step, 12);
      }
      body += `<circle cx="${at(q.from)}" cy="${lineY}" r="4" ${SOLID}/>`;
      return { svg: svg(body), foot: `${q.from} 에서 ${q.step}씩 ${q.jumps}번 뛰면 ${answerSpace(q.end, answer)}` };
    }
    if (q.mode === 'fraction') {
      const d = q.denominator;
      const body = draw(d, (i, x) => {
        if (i === 0) return txt(x, lineY + 25, '0', 13);
        if (i === d) return txt(x, lineY + 25, '1', 13);
        if (i === q.numerator) return answer ? fracTxt(x, lineY + 18, i, d, 13) : blankBox(x - 11, lineY + 12, 22, 34, false, '');
        return vline(x, lineY - 4, lineY, 1.2);
      });
      return { svg: svg(body), foot: `색칠한 곳의 분수 ${answerSpace(`${q.numerator}/${d}`, answer)}` };
    }
    if (q.mode === 'decimal') {
      const body = draw(10, (i, x) => {
        if (i === 0) return txt(x, lineY + 25, '0', 13);
        if (i === 10) return txt(x, lineY + 25, '1', 13);
        if (i === q.tenths) return answer ? txt(x, lineY + 25, (i / 10).toFixed(1), 13) : blankBox(x - 13, lineY + 12, 26, 19, false, '');
        return vline(x, lineY, lineY + 8, 1.2);
      });
      return { svg: svg(body), foot: `눈금에 알맞은 수 ${answerSpace((q.tenths / 10).toFixed(1), answer)}` };
    }
    return { svg: svg(''), foot: '' };
  };

  FRAMES['color-fraction'] = (q, answer) => {
    const d = q.denominator, n = q.numerator;
    const filled = i => answer && i < n;
    if (q.shape === 'circle') {
      const cx = 100, cy = 70, radius = 52;
      let body = '';
      for (let i = 0; i < d; i++) {
        const start = -90 + i * 360 / d, end = -90 + (i + 1) * 360 / d;
        const point = deg => [cx + radius * Math.cos(deg * Math.PI / 180), cy + radius * Math.sin(deg * Math.PI / 180)];
        const [sx, sy] = point(start), [ex, ey] = point(end);
        body += `<path d="M${cx} ${cy}L${sx.toFixed(2)} ${sy.toFixed(2)}A${radius} ${radius} 0 ${end - start > 180 ? 1 : 0} 1 ${ex.toFixed(2)} ${ey.toFixed(2)}Z" fill="${filled(i) ? SHADE : 'none'}" stroke="${INK}" stroke-width="1.4"/>`;
      }
      const foot = q.mode === 'name' ? `색칠한 부분 ${answerSpace(`${n}/${d}`, answer)}` : `${n}/${d} 만큼 색칠 ${answerSpace('', answer)}`;
      return { svg: svg(body), foot };
    }
    const w = 168, h = 46, x0 = 16, y0 = 52;
    let body = '';
    for (let i = 0; i < d; i++) body += rect(x0 + w * i / d, y0, w / d, h, `fill="${filled(i) ? SHADE : 'none'}" stroke="${INK}" stroke-width="1.4"`);
    const foot = q.mode === 'name' ? `색칠한 부분 ${answerSpace(`${n}/${d}`, answer)}` : `${n}/${d} 만큼 색칠 ${answerSpace('', answer)}`;
    return { svg: svg(body), foot };
  };

  FRAMES['bar-compare'] = (q, answer) => {
    const unit = Math.min(16, 150 / Math.max(q.kind === 'times' ? q.base * q.times : Math.max(q.a, q.b), 1));
    const bar = (x, y, count, label) => {
      let body = txt(x - 12, y + 10, label, 14);
      for (let i = 0; i < count; i++) body += rect(x + i * unit, y, unit, 13, `fill="none" stroke="${INK}" stroke-width="1.1"`);
      return body;
    };
    if (q.kind === 'longer') {
      const body = bar(30, 34, q.a, 'A') + bar(30, 88, q.b, 'B');
      return { svg: svg(body), foot: `더 긴 막대 ${answerSpace(q.a > q.b ? 'A' : 'B', answer)}` };
    }
    const body = bar(30, 34, q.base, 'A') + bar(30, 88, q.base * q.times, 'B');
    return { svg: svg(body), foot: `B는 A의 ${answerSpace(q.times, answer)}배` };
  };

  // ---- 문제지 틀에 붙이기 ---------------------------------------------
  function questions(config) {
    const format = config.format;
    const build = BUILDERS[format];
    if (!build) throw Error('그림 서식이 아닙니다: ' + format);
    const gen = config.gen || {};
    const count = config.count || (config.cols * config.rows);
    const seed = (hash([config.typeId, format, JSON.stringify(gen)].join('|')) ^ Math.imul(Number(config.seed) || 1, 2654435761)) >>> 0;
    const r = random(seed);
    const mode = resolveMode(config);
    const items = [], seen = new Set();
    for (let attempt = 0; items.length < count && attempt < count * 400; attempt++) {
      const q = build(mode, gen, r, items.length);
      if (seen.has(q.key)) continue;
      seen.add(q.key); q.format = format; items.push(q);
    }
    if (items.length !== count) throw Error(`${config.typeId || format}: 그림 문항 ${count}개 중 ${items.length}개만 생성했습니다.`);
    const size = q => q.total ?? q.n ?? q.whole ?? q.sum ?? 0;
    items.sort((a, b) => size(a) - size(b));
    return items;
  }

  function renderer(cell, q, answer) {
    const frame = FRAMES[q.format](q, answer);
    const wrap = document.createElement('div');
    wrap.className = 'pic';
    wrap.innerHTML = frame.svg + `<div class="pic-foot">${frame.foot}</div>`;
    cell.append(wrap);
    return frame;
  }

  // 시험·검수용: 문항 HTML 배열을 그대로 돌려준다.
  function render(config, answer = false) {
    css();
    return questions(config).map(q => {
      const cell = document.createElement('div');
      renderer(cell, q, answer);
      return cell.innerHTML;
    });
  }

  let styled = false;
  function css() {
    if (styled || typeof document === 'undefined') return;
    styled = true;
    const style = document.createElement('style');
    style.id = 'picture-styles';
    style.textContent = '.pic{display:flex;flex-direction:column;height:100%;min-height:0}'
      + '.pic svg{flex:1;min-height:0;width:100%;display:block}'
      + '.pic-foot{flex:none;padding-top:.4mm;font-size:1em;line-height:1.25;white-space:normal;word-break:keep-all;text-align:center}'
      + '.pic-foot .answer-space{min-width:7mm}'
      + '.pic-foot .blank-space{min-width:10mm;height:1.75em;vertical-align:middle}';
    document.head.appendChild(style);
  }

  // sheet.js 는 SheetGen.generate 로 문항을 받는다. 그림 서식만 여기서 만들고 나머지는 원래 연결층에 넘긴다.
  if (root.SheetGen && typeof root.SheetGen.generate === 'function' && !root.SheetGen.picturesWrapped) {
    const base = root.SheetGen.generate;
    root.SheetGen.generate = function (config) {
      if (config && KEYS.includes(config.format)) return questions(config);
      return base.apply(this, arguments);
    };
    root.SheetGen.picturesWrapped = true;
  }
  if (root.Sheet && typeof root.Sheet.register === 'function') {
    css();   // Sheet.render 로 그릴 때도 .pic 규칙이 필요하다
    for (const key of KEYS) root.Sheet.register(key, (cell, q, answer) => renderer(cell, q, answer));
  }
  root.PictureSheet = { keys: KEYS, questions, render, renderer, resolveMode, css };
})(globalThis);
