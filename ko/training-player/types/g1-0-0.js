/* =============================================================================
   묶음 1-0-0 — 분수의 뜻 (선행 학습) · 개념 5개 × 유형 3개 = typeId 15개
   worksheet-types.json 의 개념 이름과 spec\spec-fraction.json 의 명세를 그대로 쓴다.

     1-0-0-0 전체를 똑같이 나누기      t1 똑같이 나눈 그림 고르기  t2 전체를 같은 크기로 나누기  t3 나눈 부분의 수와 한 부분 연결하기
     1-0-0-1 분모와 분자의 뜻          t1 그림에서 분모·분자 쓰기   t2 분모·분자의 역할 골라 연결하기  t3 분수에 맞게 그림 완성하기
     1-0-0-2 단위분수와 단위분수 몇 개  t1 단위분수 몇 개인지 세어 쓰기  t2 단위분수 개수와 분수 연결하기  t3 분수만큼 그림에 색칠하기
     1-0-0-3 그림과 분수 연결          t1 그림을 보고 분수 쓰기     t2 분수와 알맞은 그림 연결하기  t3 분수만큼 색칠하기
     1-0-0-4 수직선에서 분수 나타내기   t1 수직선의 위치에 수 쓰기   t2 주어진 수의 위치 표시하기    t3 수직선의 빠진 눈금 채우기

   문제의 출처
   -----------
   기존 생성기(src/bank/legacy/types.js 의 Worksheets.generate)가 내놓는 분수 문제
   (fraction-add/sub/mul/div-same|different)의 두 진분수에서 분자·분모를 가져온다.
   spec-fraction.json 의 조건(분모 2~12, 1 ≤ 분자 < 분모)에 맞는 것만 남기고 중복을 없앤 뒤,
   모자라면 같은 범위에서 더 뽑는다. 새 문제 엔진을 만들지 않는다 —
   여기서는 고르기·정렬·그림 그리기·정답 표시만 한다. 같은 typeId · 같은 seed → 같은 문제지.

   서식(그림·수직선·선 잇기·문장)은 모두 이 파일 안에만 둔다. 공용 파일(sheet.js,
   formats-*.js, gen-bridge.js)은 고치지 않았다. 선 잇기만 공용 선 잇기 틀(MatchingSheet)에
   이 묶음 전용 키를 더해 쓰고, 그리는 방식도 공용 'matching-lines' 렌더를 그대로 쓴다.

   한 장의 구성
   ------------
   · 한 장 = 한 유형. 가로셈·세로셈이 없으므로 섞임 규칙에 걸리지 않는다.
   · spec 의 layout(단 × 줄)을 그대로 쓰고 autoFit 을 끄지 않는다 → autoFit: false 로 문항 수를
     명세와 똑같이 맞춘다(0-2-1 묶음과 같은 방식). 그림·수직선 서식은 sheet.js 의 최소 칸 높이
     (그림 38mm)를 넘겨야 하므로 3단 × 5줄(15문항)로 잡았다.
   · 글자 크기는 spec 의 15pt 대신 12~14pt 를 쓴다. 문항 수가 §2 의 '선행 학습 15~16pt' 기준보다
     많은 유형(3단 × 14줄 = 42문항, 18mm 칸)은 15pt 로는 한 줄에 10자밖에 안 들어가 문장이 칸을
     넘친다. 15문항짜리 그림 유형은 13~14pt 로 크게 인쇄한다.
   · 정답지: 문제지와 같은 자리에 답만 인쇄한다. 색칠 문제는 첫 n부분을 색칠한 것을 정답으로 보여
     준다(어느 부분이든 n부분이면 정답이다). ○표 문제는 똑같이 나눈 그림에 ○를 그린다.

   참고: 분수의 값이 같은 것(예: 1/2 과 2/4)이 한 장에 함께 나오면 정답이 하나로 정해지지 않는
   유형(그림 연결·그림 보고 쓰기·수직선)이 있으므로, 그런 유형은 기약분수 값이 겹치지 않게 뽑는다.
============================================================================= */
(function (root) {
  'use strict';

  /* ---------------------------------------------------------------- 1. 서식 키
     sheet.js 의 최소 칸 높이는 서식 이름 문자열로 정해진다. 그림·수직선 서식은 이름에
     picture / number-line 을 넣어 38mm 를 받고, 문장·개수 서식은 18mm 칸에 맞춘다. */
  const FMT = {
    choose: 'ko100-choose-equal-picture',
    sentence: 'ko100-part-sentence',
    picture: 'ko100-fraction-picture',
    complete: 'ko100-complete-picture',
    shade: 'ko100-shade-picture',
    unit: 'ko100-unit-count',
    line: 'ko100-number-line',
    lineStep: 'ko100-number-line-step',
    lineMissing: 'ko100-number-line-missing',
    match: 'ko100-match'
  };

  const INK = '#111', SHADE = '#c4dfb8', NBSP = ' ';
  const TAGS = ['㉠', '㉡', '㉢'];
  const LINE = { x0: 8, x1: 92, y: 32 };

  /* ---------------------------------------------------------------- 2. 도구 */

  function random(seed) {
    let s = (Number(seed) >>> 0) || 1;
    return (a, b) => {
      s += 0x6d2b79f5;
      let t = s;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return a + Math.floor(((t ^ t >>> 14) >>> 0) / 4294967296 * (b - a + 1));
    };
  }
  function shuffle(list, rnd) {
    const out = list.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = rnd(0, i);
      const tmp = out[i]; out[i] = out[j]; out[j] = tmp;
    }
    return out;
  }
  function hash(text) {
    let h = 2166136261;
    for (const ch of String(text)) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  const gcd = (a, b) => b ? gcd(b, a % b) : Math.abs(a);
  const f1 = value => (Math.round(value * 100) / 100).toString();
  const esc = value => String(value == null ? '' : value)
    .replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const keyOf = f => f.n + '/' + f.d;
  const valueKey = f => { const g = gcd(f.n, f.d) || 1; return (f.n / g) + '/' + (f.d / g); };
  const display = f => f.n + '/' + f.d;

  /* ---------------------------------------------------------------- 3. 분수 풀
     기존 생성기의 분수 문제에서 진분수를 모으고, 모자라면 같은 범위에서 결정적으로 채운다. */
  const LEGACY_IDS = [
    'fraction-add-same', 'fraction-sub-same', 'fraction-mul-same', 'fraction-div-same',
    'fraction-add-different', 'fraction-sub-different', 'fraction-mul-different', 'fraction-div-different'
  ];
  function parseProper(text) {
    const m = String(text).match(/^(\d+)\/(\d+)$/);
    if (!m) return null;
    const n = Number(m[1]), d = Number(m[2]);
    if (!(d >= 2 && d <= 12) || !(n >= 1 && n < d)) return null;   // spec-fraction.json 조건
    return { n, d };
  }
  function legacyFractions(seed) {
    if (!root.Worksheets || typeof root.Worksheets.generate !== 'function') return [];
    const found = new Map();
    for (let batch = 0; batch < LEGACY_IDS.length; batch++) {
      let rows;
      try { rows = root.Worksheets.generate(LEGACY_IDS[batch], (Number(seed) + Math.imul(batch + 1, 2654435761)) >>> 0, 32); }
      catch (error) { continue; }
      for (const row of rows) for (const text of [row.a, row.b]) {
        const f = parseProper(text);
        if (f && !found.has(keyOf(f))) found.set(keyOf(f), f);
      }
    }
    return [...found.values()];
  }
  function allProper() {
    const out = [];
    for (let d = 2; d <= 12; d++) for (let n = 1; n < d; n++) out.push({ n, d });
    return out;
  }
  function fractionPool(seed) {
    const list = [], seen = new Set();
    for (const f of legacyFractions(seed)) if (!seen.has(keyOf(f))) { seen.add(keyOf(f)); list.push(f); }
    const rnd = random((Number(seed) ^ 0x1f123bb5) >>> 0);
    for (const f of shuffle(allProper(), rnd)) if (!seen.has(keyOf(f))) { seen.add(keyOf(f)); list.push(f); }
    return list;
  }
  /** 서로 다른 문항 count개. distinctValue 면 기약분수 값이 겹치지 않게, parts 면 그 분모만 쓴다.
      0·1이 들어가는 쉬운 문항(분자 1)은 §2 대로 전체의 10% 이하로 막고, 쉬운 것 → 어려운 것 순으로 세운다. */
  function pickFractions(seed, count, options) {
    const o = options || {};
    const rnd = random((Number(seed) ^ 0x2545f491) >>> 0);
    const pool = fractionPool(seed).filter(f => !o.parts || o.parts.includes(f.d));
    const usedValue = new Set(), picked = [];
    const easyLimit = Math.max(1, Math.floor(count * 0.1));
    let easy = 0;
    for (const f of shuffle(pool, rnd)) {
      if (picked.length === count) break;
      if (o.distinctValue && usedValue.has(valueKey(f))) continue;
      if (f.n === 1 && easy >= easyLimit) continue;
      picked.push(f); usedValue.add(valueKey(f)); if (f.n === 1) easy++;
    }
    if (picked.length !== count) throw Error('조건에 맞는 분수 ' + count + '개를 만들지 못했습니다(' + picked.length + '개).');
    picked.sort((a, b) => a.d - b.d || a.n - b.n);
    return picked;
  }
  /** 2..12 에서 서로 다른 수 n개(수직선 나눔 수, 연결 묶음 등). */
  function distinctNumbers(rnd, count, lo, hi) {
    const values = [];
    let guard = 0;
    while (values.length < count && guard++ < 4000) {
      const v = rnd(lo, hi);
      if (!values.includes(v)) values.push(v);
    }
    if (values.length !== count) throw Error('서로 다른 수 ' + count + '개를 만들지 못했습니다.');
    return values;
  }
  /** 오른쪽 단이 제자리에 놓이지 않게 섞는다(선 잇기). */
  function shuffleOrder(count, rnd) {
    const list = Array.from({ length: count }, (unused, index) => index);
    for (let i = list.length - 1; i > 0; i--) {
      const j = rnd(0, i);
      const tmp = list[i]; list[i] = list[j]; list[j] = tmp;
    }
    for (let i = 0; i < list.length; i++) if (list[i] === i) {
      const j = (i + 1) % list.length;
      const tmp = list[i]; list[i] = list[j]; list[j] = tmp;
    }
    return list;
  }

  /* ---------------------------------------------------------------- 4. 그림(SVG)
     분수 그림: 색칠한 조각은 파스텔색, 빈 조각은 흰색, 경계선은 검정. */
  const equalCuts = parts => Array.from({ length: parts + 1 }, (unused, i) => i / parts);
  /** 똑같이 나누지 않은 자리들 — 눈으로 보기에 확실히 다르게(가장 큰 칸 ≥ 가장 작은 칸의 1.9배). */
  function unevenCuts(parts, rnd) {
    for (let attempt = 0; attempt < 200; attempt++) {
      const gaps = Array.from({ length: parts }, () => 0.5 + rnd(0, 60) / 100);
      const sum = gaps.reduce((a, b) => a + b, 0);
      const scaled = gaps.map(g => g / sum);
      const min = Math.min.apply(null, scaled), max = Math.max.apply(null, scaled);
      if (min < 0.07 || max < min * 1.9) continue;
      const cuts = [0];
      let acc = 0;
      for (const g of scaled) { acc += g; cuts.push(acc); }
      cuts[parts] = 1;
      return cuts;
    }
    const gaps = Array.from({ length: parts }, (unused, i) => (i % 3 === 1 ? 2 : 1));
    const sum = gaps.reduce((a, b) => a + b, 0);
    const cuts = [0];
    let acc = 0;
    for (const g of gaps) { acc += g; cuts.push(acc / sum); }
    cuts[parts] = 1;
    return cuts;
  }
  // 색칠할 부분이 정해지지 않은 그림(똑같이 나누기 등)은 조각마다 연한 색을 번갈아 넣어 밋밋하지 않게 한다.
  const PASTEL = ['#e3aa9a', '#fff0b3', '#c4dfb8', '#819fba', '#87658f'];
  // 조각의 면적 비율이 같으면 원·막대에 관계없이 같은 색. 다르면 해당 그림 안에서 별도 색.
  function sizeColors(cuts, circle) {
    const ratios = cuts.slice(1).map((v,i) => Math.round((v-cuts[i]) / (circle ? 360 : 1) * 100000));
    const distinct = [...new Set(ratios)].sort((a,b) => a-b);
    const assigned = new Map(), used = new Set();
    for (const ratio of distinct) {
      let index = Math.round(100000 / ratio) % PASTEL.length;
      while (used.has(index) && used.size < PASTEL.length) index = (index+1) % PASTEL.length;
      used.add(index);assigned.set(ratio,PASTEL[index]);
    }
    return ratios.map(r => assigned.get(r));
  }

  function barBody(x, y, w, h, cuts, shaded) {
    const shade = shaded || [];
    const fills = sizeColors(cuts, false);
    let out = '';
    if (!shade.length) {
      for (let i = 0; i < cuts.length - 1; i++) {
        out += `<rect x="${f1(x + w * cuts[i])}" y="${f1(y)}" width="${f1(w * (cuts[i + 1] - cuts[i]) + 0.4)}" height="${f1(h)}" fill="${fills[i]}"/>`;
      }
    }
    for (let i = 0; i < cuts.length - 1; i++) {
      if (!shade.includes(i)) continue;
      out += `<rect x="${f1(x + w * cuts[i])}" y="${f1(y)}" width="${f1(w * (cuts[i + 1] - cuts[i]) + 0.4)}" height="${f1(h)}" fill="${fills[i]}"/>`;
    }
    for (let i = 1; i < cuts.length - 1; i++) {
      out += `<line x1="${f1(x + w * cuts[i])}" y1="${f1(y)}" x2="${f1(x + w * cuts[i])}" y2="${f1(y + h)}" stroke="${INK}" stroke-width="1.1"/>`;
    }
    out += `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" fill="none" stroke="${INK}" stroke-width="1.3"/>`;
    return out;
  }
  function circleBody(cx, cy, r, cuts, shaded) {
    const shade = shaded || [];
    const fills = sizeColors(cuts, true);
    const point = deg => [cx + r * Math.cos((deg - 90) * Math.PI / 180), cy + r * Math.sin((deg - 90) * Math.PI / 180)];
    let out = '';
    if (!shade.length) {
      for (let i = 0; i < cuts.length - 1; i++) {
        const a = cuts[i], b2 = cuts[i + 1], p1 = point(a), p2 = point(b2);
        out += `<path d="M${f1(cx)} ${f1(cy)} L${f1(p1[0])} ${f1(p1[1])} A${r} ${r} 0 ${b2 - a > 180 ? 1 : 0} 1 ${f1(p2[0])} ${f1(p2[1])} Z" fill="${fills[i]}"/>`;
      }
    }
    for (let i = 0; i < cuts.length - 1; i++) {
      if (!shade.includes(i)) continue;
      const a = cuts[i], b = cuts[i + 1];
      const p1 = point(a), p2 = point(b);
      out += `<path d="M${f1(cx)} ${f1(cy)} L${f1(p1[0])} ${f1(p1[1])} A${r} ${r} 0 ${b - a > 180 ? 1 : 0} 1 ${f1(p2[0])} ${f1(p2[1])} Z" fill="${fills[i]}"/>`;
    }
    for (let i = 0; i < cuts.length - 1; i++) {   // 시작 경계(맨 위 0°)도 그려야 n등분의 n개 경계가 모두 보인다
      const p = point(cuts[i]);
      out += `<line x1="${f1(cx)}" y1="${f1(cy)}" x2="${f1(p[0])}" y2="${f1(p[1])}" stroke="${INK}" stroke-width="1.1"/>`;
    }
    out += `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="${r}" fill="none" stroke="${INK}" stroke-width="1.3"/>`;
    return out;
  }
  const svgWrap = (w, h, body) => `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${body}</svg>`;
  /** 전체 그림 한 개. fig = {shape, parts(또는 d), shaded, cuts}
      viewBox 를 그림에 꼭 맞춰(circle 100×60, bar 100×34) 칸 안에서 최대한 크게 그린다. */
  function figureSVG(fig) {
    const shaded = fig.shaded || [];
    const pale = svg => fig.light ? svg.replace(/#[0-9a-f]{6}/g, color => ({'#e3aa9a':'#fff0ed','#fff0b3':'#fff9de','#c4dfb8':'#eff8ed','#819fba':'#edf4fb','#87658f':'#f4eef8'}[color] || color)) : svg;
    const parts = fig.parts || fig.d || 1;
    if (fig.shape === 'circle') {
      const cuts = (fig.cuts || equalCuts(parts)).map(t => t * 360);
      return pale(svgWrap(100, 60, circleBody(50, 30, 27, cuts, shaded)));
    }
    return pale(svgWrap(100, 34, barBody(4, 4, 92, 26, fig.cuts || equalCuts(parts), shaded)));
  }
  function svgText(x, y, value, size, color = INK) {
    return `<text x="${f1(x)}" y="${f1(y)}" text-anchor="middle" font-size="${size}" fill="${color}">${esc(value)}</text>`;
  }
  function svgFrac(cx, cy, top, bottom, size, color = INK) {
    return svgText(cx, cy - 1, top, size, color)
      + `<line x1="${f1(cx - size * 0.6)}" y1="${f1(cy + 1)}" x2="${f1(cx + size * 0.6)}" y2="${f1(cy + 1)}" stroke="${color}" stroke-width="0.7"/>`
      + svgText(cx, cy + size + 1.5, bottom, size, color);
  }
  const svgBox = (cx, cy, w, h, text, size) =>
    `<rect x="${f1(cx - w / 2)}" y="${f1(cy - h / 2)}" width="${w}" height="${h}" fill="none" stroke="${INK}" stroke-width="0.9" stroke-dasharray="2 1.6"/>`
    + (text ? svgFrac(cx, cy - size * 0.14 - 0.25, text[0], text[1], size, '#d71f10') : '');   // 칸에 채우는 분수는 정답이므로 빨강

  /** 수직선. o = {d, ticks, at, atText, labels, blanks, boxText, size, wide}
      3단 문제지의 그림은 100×56, 2단(1-0-0-4-t2)처럼 넓고 낮은 칸은 wide:true 로 200×44 를 쓴다. */
  function numberLineSVG(o) {
    const wide = !!o.wide, d = o.d;
    const x0 = wide ? 6 : LINE.x0, x1 = wide ? 194 : LINE.x1;
    const y = wide ? 26 : LINE.y, size = o.size || 6;
    const gap = (x1 - x0) / d;
    const at = i => x0 + gap * i;
    let body = `<line x1="${x0}" y1="${y}" x2="${x1}" y2="${y}" stroke="${INK}" stroke-width="1.3"/>`;
    for (let i = 0; i <= d; i++) {
      if (!o.ticks && i !== 0 && i !== d) continue;
      body += `<line x1="${f1(at(i))}" y1="${y - 4}" x2="${f1(at(i))}" y2="${y + 4}" stroke="${INK}" stroke-width="1.1"/>`;
    }
    const endSize = wide ? 13 : 8;
    body += svgText(x0, y + (wide ? 15 : 13), '0', endSize) + svgText(x1, y + (wide ? 15 : 13), '1', endSize);
    if (o.labels) for (const [index, group] of Object.entries(o.labels)) {
      body += svgFrac(at(Number(index)), y + 20 - size * 0.5, group[0], group[1], size);
    }
    if (o.blanks) for (const index of o.blanks) {
      body += svgBox(at(index), y + 20, Math.min(22, gap - 1.5), size > 6 ? 25 : 20, o.boxText ? o.boxText[index] : null, size);
    }
    if (o.at != null) {
      const x = at(o.at);
      const ah = wide ? 1.3 : 1;
      body += `<path d="M${f1(x)} ${f1(y - 5)} L${f1(x - 4 * ah)} ${f1(y - 5 - 9 * ah)} L${f1(x + 4 * ah)} ${f1(y - 5 - 9 * ah)} Z" fill="${INK}"/>`;
      if (!wide) body += svgBox(x, y - 27, 24, 22, o.atText, size + 2);   // wide 는 답을 아래 문제 줄에 쓴다
    }
    // 화살표 위 상자가 없는 수직선(빠진 눈금 채우기 등)은 위쪽 빈 공간을 잘라 그림이 칸의 가운데(문항 번호 쪽)로 오게 한다.
    const viewBox = o.at == null ? (o.labels ? '3 22 94 46' : '0 8 100 60') : '2 -8 96 56', align = o.at == null ? (o.labels ? 'xMidYMid' : 'xMidYMin') : 'xMidYMid';   // 상자 없는 수직선은 칸 위쪽(문항 번호 쪽)에 붙인다
    return wide ? `<svg viewBox="0 6 200 38" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${body}</svg>` : `<svg viewBox="${viewBox}" preserveAspectRatio="${align} meet" aria-hidden="true">${body}</svg>`;
  }

  /* ---------------------------------------------------------------- 5. 문항 만들기 */

  function seedFor(config) { return ((Number(config.seed) || 1) ^ hash(config.typeId || '')) >>> 0; }

  function makeFigure(rnd, equal) {
    const shape = rnd(0, 1) ? 'bar' : 'circle';
    const parts = rnd(2, 6);
    return { shape, parts, equal, cuts: equal ? equalCuts(parts) : unevenCuts(parts, rnd) };
  }
  /** t1 똑같이 나눈 그림 고르기 — 세 그림 중 똑같이 나눈 것을 1~2개 섞는다. */
  function chooseEqualItems(seed, count) {
    const rnd = random(seed);
    const items = [], seen = new Set();
    for (let guard = 0; items.length < count && guard < count * 80; guard++) {
      const flags = shuffle(rnd(0, 1) ? [true, false, false] : [true, true, false], rnd);
      const figures = flags.map(equal => makeFigure(rnd, equal));
      const key = figures.map(f => f.shape + f.parts + (f.equal ? '=' : '!') + f.cuts.slice(1, -1).map(f1).join(',')).join('|');
      if (seen.has(key)) continue;
      seen.add(key);
      items.push({ figures, picked: flags.map((equal, i) => equal ? i : -1).filter(i => i >= 0) });
    }
    if (items.length !== count) throw Error('똑같이 나눈 그림 문항을 ' + count + '개 만들지 못했습니다.');
    return items;
  }
  /** t2 전체를 같은 크기로 나누기 — 문장만 보고 한 부분(단위분수)을 쓴다. */
  const THINGS = [
    { name: '색 테이프', particle: '를' }, { name: '리본', particle: '을' }, { name: '종이', particle: '를' },
    { name: '색종이', particle: '를' }, { name: '피자', particle: '를' }, { name: '케이크', particle: '를' },
    { name: '김밥', particle: '을' }, { name: '초콜릿', particle: '을' }, { name: '빵', particle: '을' }, { name: '끈', particle: '을' }
  ];
  function partSentenceItems(seed, count) {
    const rnd = random(seed);
    const combos = [];
    for (let parts = 2; parts <= 12; parts++) for (const thing of THINGS) combos.push({ parts, thing });
    const pool = shuffle(combos, rnd);
    const picked = [], easyLimit = Math.max(1, Math.floor(count * 0.1));
    let easy = 0;
    for (const combo of pool) {
      if (picked.length === count) break;
      if (combo.parts <= 3 && easy >= easyLimit) continue;
      picked.push(combo); if (combo.parts <= 3) easy++;
    }
    if (picked.length !== count) throw Error('전체를 같은 크기로 나누기 문항을 ' + count + '개 만들지 못했습니다.');
    picked.sort((a, b) => a.parts - b.parts);
    return picked;
  }
  function shadeOf(n, d, rnd, spread) {
    if (!spread) return Array.from({ length: n }, (unused, i) => i);
    const indexes = Array.from({ length: d }, (unused, i) => i);
    return shuffle(indexes, rnd).slice(0, n).sort((a, b) => a - b);
  }
  /** 그림 보고 나타내기(1-0-0-1-t1, 1-0-0-3-t1) · 색칠하기 · 완성하기 */
  function pictureItems(seed, count) {
    const rnd = random((Number(seed) ^ 0x2f1b3c5d) >>> 0);
    return pickFractions(seed, count, { distinctValue: true }).map(f => ({
      n: f.n, d: f.d, shape: rnd(0, 1) ? 'bar' : 'circle', shaded: shadeOf(f.n, f.d, rnd, true)
    }));
  }
  function shadeItems(seed, count, unit, distinctValue) {
    const rnd = random((Number(seed) ^ 0x5bd1e995) >>> 0);
    const items = [], seen = new Set(), usedValue = new Set();
    // 단위분수 유형은 분자가 늘 1이므로 '쉬운 문항 10%' 제한을 걸지 않는다.
    const easyLimit = unit ? count : Math.max(1, Math.floor(count * 0.1));
    let easy = 0;
    for (let guard = 0; items.length < count && guard < count * 400; guard++) {
      const d = rnd(2, 12);
      const n = unit ? 1 : rnd(1, d - 1);
      const shape = rnd(0, 1) ? 'bar' : 'circle';
      const key = [n, d, shape].join(':');
      if (seen.has(key) || (distinctValue && usedValue.has(valueKey({ n, d })))) continue;
      if (n === 1 && easy >= easyLimit) continue;
      seen.add(key); usedValue.add(valueKey({ n, d })); if (n === 1) easy++;
      items.push({ n, d, shape, shaded: shadeOf(n, d, rnd, false) });
    }
    if (items.length !== count) throw Error('색칠 문항을 ' + count + '개 만들지 못했습니다.');
    items.sort((a, b) => a.d - b.d || a.n - b.n);
    return items;
  }
  /** t3 수직선의 빠진 눈금 채우기 — 3~6등분, 빠진 눈금 1~2개(서로 떨어져 있게). */
  function lineMissingItems(seed, count) {
    const rnd = random(seed);
    const combos = [];
    for (let d = 3; d <= 6; d++) {
      for (let a = 1; a < d; a++) combos.push({ d, blanks: [a] });
      for (let a = 1; a < d; a++) for (let b = a + 2; b < d; b++) combos.push({ d, blanks: [a, b] });
    }
    const pool = shuffle(combos, rnd).slice(0, count);
    if (pool.length !== count) throw Error('수직선 눈금 문항을 ' + count + '개 만들지 못했습니다.');
    pool.sort((a, b) => a.d - b.d || a.blanks[0] - b.blanks[0]);
    return pool;
  }

  /* ---------------------------------------------------------------- 6. 유형 정의 */
  const CONCEPT = {
    '1-0-0-0': '전체를 똑같이 나누기',
    '1-0-0-1': '분모와 분자의 뜻',
    '1-0-0-2': '단위분수와 단위분수 몇 개',
    '1-0-0-3': '그림과 분수 연결',
    '1-0-0-4': '수직선에서 분수 나타내기'
  };
  const DEFS = [
    { typeId: '1-0-0-0-t1', concept: '1-0-0-0', title: '똑같이 나눈 그림 고르기', format: FMT.choose, cols: 3, rows: 4, autoFit: false, maxProblems: 12, fontPt: 13, kind: 'chooseEqual',
      instruction: '그림을 보고 전체를 똑같이 나눈 그림을 모두 찾아 ○표 하세요.' },
    { typeId: '1-0-0-0-t2', concept: '1-0-0-0', title: '전체를 같은 크기로 나누기', format: FMT.sentence, cols: 3, rows: 8, autoFit: false, maxProblems: 24, fontPt: 14, kind: 'partSentence',
      instruction: '전체를 똑같이 나눈 한 부분을 분수로 쓰세요.' },
    { typeId: '1-0-0-0-t3', concept: '1-0-0-0', title: '나눈 부분의 수와 한 부분 연결하기', format: FMT.match, cols: 6, rows: 4, autoFit: false, maxProblems: 24, fontPt: 12, kind: 'matchPartUnit',
      instruction: '서로 알맞은 것끼리 선으로 이으세요.' },
    { typeId: '1-0-0-1-t1', concept: '1-0-0-1', title: '그림에서 분모·분자 쓰기', format: FMT.picture, cols: 3, rows: 5, fontPt: 13, kind: 'denNum',
      instruction: '그림을 보고 분모와 분자를 쓰세요.' },
    { typeId: '1-0-0-1-t2', concept: '1-0-0-1', title: '분모·분자의 역할 골라 연결하기', format: FMT.match, cols: 6, rows: 4, autoFit: false, maxProblems: 24, fontPt: 12, kind: 'matchRole',
      instruction: '서로 알맞은 것끼리 선으로 이으세요.' },
    { typeId: '1-0-0-1-t3', concept: '1-0-0-1', title: '분수에 맞게 그림 완성하기', format: FMT.complete, cols: 3, rows: 5, fontPt: 13, kind: 'complete',
      instruction: '그림을 보고 분수에 맞게 나누어 색칠하세요.' },
    { typeId: '1-0-0-2-t1', concept: '1-0-0-2', title: '단위분수 몇 개인지 세어 쓰기', format: FMT.unit, cols: 3, rows: 8, autoFit: false, maxProblems: 24, fontPt: 16, kind: 'unitCount',
      instruction: '물음에 알맞은 답을 쓰세요.' },
    { typeId: '1-0-0-2-t2', concept: '1-0-0-2', title: '단위분수 개수와 분수 연결하기', format: FMT.match, cols: 6, rows: 4, autoFit: false, maxProblems: 24, fontPt: 12, kind: 'matchUnitFraction',
      instruction: '서로 알맞은 것끼리 선으로 이으세요.' },
    { typeId: '1-0-0-2-t3', concept: '1-0-0-2', title: '분수만큼 그림에 색칠하기', format: FMT.shade, cols: 3, rows: 5, fontPt: 14, kind: 'shadeUnit',
      instruction: '그림을 보고 단위분수만큼 색칠하세요.' },
    { typeId: '1-0-0-3-t1', concept: '1-0-0-3', title: '그림을 보고 분수 쓰기', format: FMT.picture, cols: 3, rows: 5, fontPt: 13, kind: 'nameFraction',
      instruction: '그림을 보고 분수를 쓰세요.' },
    { typeId: '1-0-0-3-t2', concept: '1-0-0-3', title: '분수와 알맞은 그림 연결하기', format: FMT.match, cols: 6, rows: 4, autoFit: false, maxProblems: 24, fontPt: 12, kind: 'matchFractionPicture',
      instruction: '서로 알맞은 것끼리 선으로 이으세요.' },
    { typeId: '1-0-0-3-t3', concept: '1-0-0-3', title: '분수만큼 색칠하기', format: FMT.shade, cols: 3, rows: 5, fontPt: 14, kind: 'shadeFraction',
      instruction: '그림을 보고 분수만큼 색칠하세요.' },
    { typeId: '1-0-0-4-t1', concept: '1-0-0-4', title: '수직선의 위치에 수 쓰기', format: FMT.line, cols: 3, rows: 5, fontPt: 13, kind: 'lineWrite',
      instruction: '수직선을 보고 표시된 위치에 알맞은 분수를 쓰세요.' },
    { typeId: '1-0-0-4-t2', concept: '1-0-0-4', title: '주어진 수의 위치 표시하기', format: FMT.lineStep, cols: 2, rows: 10, fontPt: 11, kind: 'lineMark',
      instruction: '수직선에 주어진 분수의 위치를 표시하고, 빈칸에 알맞은 수를 써서 풀이를 완성하세요.' },
    { typeId: '1-0-0-4-t3', concept: '1-0-0-4', title: '수직선의 빠진 눈금 채우기', format: FMT.lineMissing, cols: 3, rows: 5, fontPt: 13, kind: 'lineMissing',
      instruction: '수직선을 보고 빈칸에 알맞은 분수를 쓰세요.' }
  ];
  // 인쇄 머리말의 남는 폭에 맞춘 이름. 전체 개념·유형명은 위 정의에 보존한다.
  const PRINT_TITLES = [
    '똑같이 나눈 그림', '같은 크기로 나누기', '부분 수·한 부분 연결',
    '그림의 분모·분자', '분모·분자 역할 연결', '분수 그림 완성',
    '단위분수 개수', '개수와 분수 연결', '단위분수 색칠',
    '그림 보고 분수 쓰기', '분수·그림 연결', '분수만큼 색칠',
    '수직선 위치 쓰기', '수직선 위치 표시', '빠진 눈금 채우기'
  ];
  const entries = DEFS.map((def, index) => ({
    typeId: def.typeId,
    title: PRINT_TITLES[index],
    instruction: def.instruction,
    format: def.format,
    cols: def.cols, rows: def.rows, count: def.cols * def.rows,
    fontPt: def.fontPt,
    seed: 20261001 + index * 7,
    autoFit: false,                     // spec 의 단·줄(문항 수)을 그대로 지킨다
    gen: { bundle: '1-0-0', kind: def.kind, concept: def.concept, specFormat: def.specFormat || '' }
  }));
  const byType = new Map(entries.map(entry => [entry.typeId, entry]));

  function generate(config) {
    const gen = config.gen || {};
    if (gen.bundle !== '1-0-0') throw Error('묶음 1-0-0 유형이 아닙니다: ' + config.typeId);
    const count = config.count || config.cols * config.rows;
    const seed = seedFor(config);
    switch (gen.kind) {
      case 'chooseEqual': return chooseEqualItems(seed, count);
      case 'partSentence': return partSentenceItems(seed, count);
      case 'denNum':
      case 'nameFraction': return pictureItems(seed, count);
      case 'complete':
      case 'shadeFraction': return shadeItems(seed, count, false, true);
      case 'shadeUnit': return shadeItems(seed, count, true);
      case 'unitCount': return pickFractions(seed, count, {});
      case 'lineWrite':
      case 'lineMark': return pickFractions(seed, count, { distinctValue: true });
      case 'lineMissing': return lineMissingItems(seed, count);
      default: throw Error('알 수 없는 유형: ' + gen.kind);
    }
  }

  /* ---------------------------------------------------------------- 7. 선 잇기 묶음
     묶음(블록)마다 왼쪽·오른쪽 값이 서로 겹치지 않아야 정답이 하나로 정해진다. */
  function matchBundles(config, pairsFor, caption) {
    const bundles = config.cols, perBundle = config.rows;
    const rnd = random(seedFor(config));
    const items = [];
    for (let b = 0; b < bundles; b++) {
      const pairs = pairsFor(b, rnd);
      if (pairs.length !== perBundle) throw Error(config.typeId + ': ' + perBundle + '쌍을 만들지 못했습니다.');
      // 동그라미를 그림·분수 바로 옆에 붙인 2단 배치(compact). 묶음 안 문제 수·묶음 수는 config 의 rows·cols.
      items.push({ kind: 'bundle', caption: '', compact: true, compactW: 28, ...(config.gen.kind === 'matchRole' ? { compactWl: 46, compactWr: 10, compactGap: 8 } : {}), rowsWeight: perBundle, pairs, order: shuffleOrder(perBundle, rnd) });
    }
    return { items, layout: { cols: bundles, rows: perBundle, count: bundles * perBundle }, pairs: bundles * perBundle };
  }
  const matchFigureHTML = (shape, d, shaded) =>
    `<span class="k100-ml-pic ${shape === 'circle' ? 'k100-round' : 'k100-wide'}">${figureSVG({ shape, parts: d, shaded })}</span>`;
  const fracPair = (n, d) => ({ frac: n + '/' + d });

  const MATCH_BUILD = {
    // 나눈 부분의 수(그림) ↔ 한 부분(1/n)
    matchPartUnit(config) {
      const shapes = ['bar', 'circle', 'bar'];
      return matchBundles(config, (b, rnd) => {
        const ds = distinctNumbers(rnd, config.rows, 2, 12);
        return ds.map(d => [ { html: matchFigureHTML(shapes[b], d, []) }, fracPair(1, d) ]);
      }, '똑같이 나눈 그림과 한 부분');
    },
    // n/d 에서 나눈 부분의 수(분모)와 색칠한 부분의 수(분자) ↔ 그 수
    matchRole(config) {
      const used = new Set();
      return matchBundles(config, (b, rnd) => {
        const numbers = new Set(), triple = [];
        for (const f of shuffle(allProper(), rnd)) {
          if (triple.length === 3) break;
          if (used.has(keyOf(f)) || numbers.has(f.n) || numbers.has(f.d)) continue;
          numbers.add(f.n); numbers.add(f.d); triple.push(f); used.add(keyOf(f));
        }
        if (triple.length !== 3) throw Error('분모·분자 연결의 분수 3개를 고르지 못했습니다.');
        const pairs = [];
        for (const f of triple) {
          pairs.push([ { html: fracHTML(f) + '에서 나눈 부분의 수' }, String(f.d) ]);
          pairs.push([ { html: fracHTML(f) + '에서 색칠한 부분의 수' }, String(f.n) ]);
        }
        return pairs.slice(0, config.rows);   // 한 세트가 5문제면 마지막 하나를 뺀다(오른쪽 수는 서로 달라 답이 하나)
      }, '분모와 분자의 뜻');
    },
    // 1/d 이 몇 개 ↔ n/d
    matchUnitFraction(config) {
      const picked = pickFractions(seedFor(config), config.cols * config.rows, { distinctValue: true });
      const chunk = config.rows;
      return matchBundles(config, b => picked.slice(b * chunk, (b + 1) * chunk).map(f => [
        { html: fracHTML({ n: 1, d: f.d }) + '이 ' + f.n + '개' }, fracPair(f.n, f.d)
      ]), '단위분수 몇 개와 분수');
    },
    // 분수 ↔ 색칠한 그림
    matchFractionPicture(config) {
      const picked = pickFractions(seedFor(config), config.cols * config.rows, { distinctValue: true });
      const chunk = config.rows, shapes = ['bar', 'circle', 'bar'];
      return matchBundles(config, (b, rnd) => picked.slice(b * chunk, (b + 1) * chunk).map(f => [
        fracPair(f.n, f.d),
        { html: matchFigureHTML(shapes[b], f.d, shadeOf(f.n, f.d, rnd, true)) }
      ]), '분수와 색칠한 그림');
    }
  };

  /* ---------------------------------------------------------------- 8. 그리기 */
  const node = (tag, className, value) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (value !== undefined) element.textContent = value;
    return element;
  };
  const blankBox = (text, className) => node('span', className || 'k100-box', text || NBSP);
  /** 분수 한 개를 세로로 쓴 span. 채워지지 않으면 빈 분수 칸. */
  function fracSpan(top, bottom) {
    const span = node('span', 'k100-frac');
    const num = node('span', 'k100-num', top == null ? NBSP : String(top));
    const den = node('span', 'k100-den', bottom == null ? NBSP : String(bottom));
    if (top == null) num.classList.add('k100-empty');
    if (bottom == null) den.classList.add('k100-empty');
    span.append(num, den);
    return span;
  }
  const fracText = f => fracSpan(f.n, f.d);
  function fracHTML(f) { return `<span class="k100-frac"><span class="k100-num">${f.n}</span><span class="k100-den">${f.d}</span></span>`; }

  /** 그림 + 아래 한 줄(문제지·정답지 공용). foot 을 주지 않으면 그림만 채운다. */
  function pictureCell(cell, svg, foot) {
    const wrap = node('div', 'k100-pic');
    const frame = node('div', 'k100-frame');
    frame.innerHTML = svg;
    wrap.append(frame);
    if (foot) wrap.append(foot);
    cell.append(wrap);
  }

  function renderChoose(cell, q, answer) {
    css();
    const column = node('div', 'k100-choose');
    q.figures.forEach((fig, index) => {
      const row = node('div', 'k100-fig' + (answer && q.picked.includes(index) ? ' k100-picked' : ''));
      row.append(node('span', 'k100-tag', TAGS[index]));
      const frame = node('div', 'k100-frame');
      frame.innerHTML = figureSVG(fig);
      row.append(frame);
      column.append(row);
    });
    cell.append(column);
  }

  function renderSentence(cell, q, answer) {
    css();
    const wrap = node('div', 'k100-sentence');
    wrap.className = 'k100-sentence k100-two';
    const label = node('span', 'k100-twoline');
    label.append(node('span', '', q.thing.name + ' ' + q.parts + '등분'), node('span', '', '→ 한 부분'));
    wrap.append(label);
    // 분수는 '1/2' 글자가 아니라 진짜 분수(분자 위·분모 아래)로, 분수를 쓸 수 있게 세로로 긴 네모 안에 둔다.
    const tall = node('span', 'k100-tallbox');
    tall.append(fracSpan(answer ? 1 : null, answer ? q.parts : null));
    wrap.append(tall);
    cell.append(wrap);
  }

  function renderPicture(cell, q, answer, config) {
    css();
    const foot = node('div', 'k100-foot');
    if (config.gen.kind === 'denNum') {
      foot.append(node('span', '', '분모 '), blankBox(answer ? q.d : ''));
      foot.append(node('span', 'k100-gap', ''), node('span', '', '분자 '), blankBox(answer ? q.n : ''));
    } else {
      foot.append(node('span', '', '분수 '), fracSpan(answer ? q.n : null, answer ? q.d : null));
    }
    pictureCell(cell, figureSVG(q), foot);
  }

  function renderComplete(cell, q, answer) {
    css();
    const foot = node('div', 'k100-foot');
    foot.append(fracText(q), node('span', '', '이 되도록 나누어 색칠하세요.'));
    pictureCell(cell, figureSVG({ shape: q.shape, parts: q.d, shaded: answer ? q.shaded : [], light: !answer, cuts: answer ? equalCuts(q.d) : [0, 1] }), foot);
  }

  function renderShade(cell, q, answer) {
    css();
    const foot = node('div', 'k100-foot');
    foot.append(fracText(q), node('span', '', '만큼 색칠하세요.'));
    pictureCell(cell, figureSVG({ shape: q.shape, parts: q.d, shaded: answer ? q.shaded : [], light: !answer }), foot);
  }

  function renderUnitCount(cell, q, answer) {
    css();
    const wrap = node('div', 'k100-sentence k100-equation');
    wrap.append(fracText(q), node('span', '', '은 '), fracText({ n: 1, d: q.d }), node('span', '', '이 '));
    wrap.append(blankBox(answer ? q.n : ''), node('span', '', '개'));
    cell.append(wrap);
  }

  function renderLineWrite(cell, q, answer) {
    css();
    pictureCell(cell, numberLineSVG({ d: q.d, ticks: true, at: q.n, atText: answer ? [q.n, q.d] : null }));
  }

  function renderLineMark(cell, q, answer) {
    css();
    const wrap = node('div', 'k100-mark');
    const head = node('div', 'k100-mark-head');
    head.append(fracText(q), node('span', '', '의 위치에 ●표 하세요.'));
    wrap.append(head);
    const body = node('div', 'k100-mark-body');
    const frame = node('div', 'k100-frame');
    frame.innerHTML = numberLineSVG(answer
      ? { d: q.d, ticks: true, at: q.n, wide: true }
      : { d: q.d, ticks: false, wide: true });
    body.append(frame);
    const step = node('div', 'k100-mark-step');
    const l1 = node('div'), l2 = node('div');
    l1.append(node('span', '', '0~1을 '), blankBox(answer ? q.d : ''), node('span', '', '등분'));
    l2.append(blankBox(answer ? q.n : ''), node('span', '', '번째 눈금'));
    step.append(l1, l2);
    body.append(step);
    wrap.append(body);
    cell.append(wrap);
  }

  function renderLineMissing(cell, q, answer) {
    css();
    const labels = {}, blanks = [];
    for (let i = 1; i < q.d; i++) {
      if (q.blanks.includes(i)) blanks.push(i);
      else labels[i] = [i, q.d];
    }
    const boxText = {};
    if (answer) for (const i of q.blanks) boxText[i] = [i, q.d];
    pictureCell(cell, numberLineSVG({ d: q.d, ticks: true, labels, blanks, boxText, size: 8 }));
  }

  const RENDER = {
    chooseEqual: renderChoose,
    partSentence: renderSentence,
    denNum: renderPicture,
    nameFraction: renderPicture,
    complete: renderComplete,
    shadeUnit: renderShade,
    shadeFraction: renderShade,
    unitCount: renderUnitCount,
    lineWrite: renderLineWrite,
    lineMark: renderLineMark,
    lineMissing: renderLineMissing
  };

  /* ---------------------------------------------------------------- 9. 이 묶음 전용 CSS */
  function css() {
    if (typeof document === 'undefined' || document.getElementById('ko100-styles')) return;
    const style = node('style');
    style.id = 'ko100-styles';
    style.textContent = [
      '.k100-pic,.k100-choose,.k100-sentence,.k100-mark{align-self:stretch;width:100%}',
      '.k100-pic{display:flex;flex-direction:column;height:100%;min-height:0}',
      '.k100-frame{flex:1;min-height:0;display:flex;align-items:center;justify-content:center}',
      '.k100-frame svg{width:100%;height:100%;display:block}',
      '.k100-foot{flex:none;padding-top:.5mm;line-height:1.3;text-align:center;white-space:normal;word-break:keep-all}',
      '.k100-pic .k100-foot{text-align:center}',
      '.k100-pic .k100-frame{min-height:12mm}',
      '.k100-choose{display:flex;flex-direction:column;justify-content:space-between;height:100%;gap:.6mm}',
      '.k100-fig{flex:1 1 0;height:0;min-height:0;display:flex;align-items:center;gap:1mm;padding:0 .6mm}',
      '.k100-fig .k100-frame{flex:1;height:100%;min-height:0}',
      '.k100-picked .k100-tag{border:1px solid #111;border-radius:50%}',
      '.k100-tag{flex:none;width:7mm;height:7mm;display:flex;align-items:center;justify-content:center;font-size:13pt;line-height:1}',
      '.k100-sentence{height:100%;display:flex;flex-wrap:wrap;align-items:center;align-content:center;gap:.6mm;line-height:1.2}',
      '.k100-equation{justify-content:center}',
      '.k100-two{flex-wrap:nowrap;justify-content:center;gap:2mm}',
      '.k100-twoline{display:flex;flex-direction:column;align-items:center;white-space:nowrap;line-height:1.3}',
      '.k100-mark{height:100%;display:flex;flex-direction:column;justify-content:center;gap:.5mm}',
      '.k100-mark-head{text-align:center;line-height:1.1}',
      '.k100-mark .k100-frame{flex:1;min-height:7mm}',
      '.k100-mark-body{flex:1;min-height:0;display:flex;align-items:center;gap:2mm}',
      '.k100-mark-body .k100-frame{flex:1;min-width:0;height:100%}',
      '.k100-mark-step{flex:none;text-align:center;line-height:1.5;white-space:nowrap}',
      '.k100-mark-step>div{display:flex;align-items:center;justify-content:flex-end;gap:1mm;margin:.6mm 0;font-size:.92em}',
      '.k100-mark-step .k100-box,.k100-mark-step [class*="box"]{flex:none}',
      '.k100-box{display:inline-flex;align-items:center;justify-content:center;min-width:8mm;height:1.35em;border:1px solid #666;border-radius:2px;background:#fbfbfb;padding:0 .8mm;vertical-align:-.22em}',
      '.k100-gap{display:inline-block;width:5mm}',
      '.k100-tallbox{display:inline-flex;align-items:center;justify-content:center;min-width:13mm;height:3.2em;border:1px solid #666;border-radius:2px;background:#fbfbfb;padding:0 2mm;vertical-align:middle;margin-left:1mm}',
      '.k100-tallbox .k100-frac{min-width:8mm}',
      '.k100-frac{display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;line-height:1.05;min-width:7mm;margin:0 .4mm}',
      '.k100-frac .k100-num{border-bottom:1px solid #111;padding:0 .5mm .1em;min-height:1.05em}',
      '.k100-frac .k100-den{padding:.08em .5mm 0;min-height:1.05em}',
      '.k100-empty{min-width:5mm}',
      '.k100-ml-pic{display:inline-flex;align-items:center;height:100%;vertical-align:middle}',
      '.k100-ml-pic svg{display:block}',
      '.k100-ml-pic.k100-wide svg{width:26mm;height:9mm}',
      '.k100-ml-pic.k100-round svg{width:10mm;height:9mm}',
      '.mt-right .k100-frac{font-size:.95em}'
    ].join('');
    document.head.append(style);
  }

  /* ---------------------------------------------------------------- 10. 등록 */
  if (root.Sheet && typeof root.Sheet.register === 'function') {
    const installed = new Map();
    for (const [kind, render] of Object.entries(RENDER)) {
      const format = entries.find(entry => entry.gen.kind === kind).format;
      if (installed.has(format)) continue;      // denNum·nameFraction 처럼 서식을 함께 쓰는 유형
      installed.set(format, render);
      try { root.Sheet.register(format, render); }
      catch (error) { /* 다른 묶음이 먼저 등록한 서식은 건드리지 않는다 */ }
    }
  }
  if (root.MatchingSheet && root.MatchingSheet.formats && root.MatchingSheet.formats['matching-lines']) {
    const base = root.MatchingSheet.formats['matching-lines'];
    root.MatchingSheet.formats[FMT.match] = {
      page: 'blocks',
      title: '알맞은 것 연결하기',
      render(config, item, answer, built) {
        const block = base.render(config, item, answer, built);
        // 공용 렌더러의 오른쪽 동그라미 번호가 왼쪽 문항 순서와 같아 정답을 드러낸다.
        block.querySelectorAll('.mt-right .mt-idx').forEach(label => label.remove());
        return block;
      },
      build: config => { css(); return MATCH_BUILD[config.gen.kind](config); }
    };
  }
  if (root.SheetGen && typeof root.SheetGen.generate === 'function' && !root.SheetGen.__ko100) {
    const base = root.SheetGen.generate;
    // 화살표 함수로 두면 arguments 가 바깥 IIFE 의 것(globalThis)이 되어 아래층에 설정이
    // 그대로 전달되지 않는다(다른 묶음처럼 function 으로 둔다).
    const wrapped = function (config) {
      return config && config.gen && config.gen.bundle === '1-0-0' ? generate(config) : base.apply(this, arguments);
    };
    Object.defineProperty(wrapped, '__ko100', { value: true });
    root.SheetGen.generate = wrapped;
  }
  if (Array.isArray(root.SheetCatalog)) root.SheetCatalog.push(...entries);
  else (root.SheetCatalog = root.SheetCatalog || []).push(...entries);

  root.Ko100Sheet = {
    types: entries, formats: FMT, generate, byType,
    /** 검수용: 유형 하나의 문항을 그대로 돌려준다(선 잇기는 묶음별 쌍). */
    items(typeId, seed) {
      const entry = byType.get(typeId);
      if (!entry) throw Error('묶음 1-0-0 에 없는 유형입니다: ' + typeId);
      const config = { ...entry, seed: Number(seed) || entry.seed };
      if (MATCH_BUILD[entry.gen.kind]) return MATCH_BUILD[entry.gen.kind](config);
      return generate(config);
    }
  };
})(globalThis);
