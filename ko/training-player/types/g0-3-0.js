/* 묶음 0-3-0 — 곱셈 준비 (제작자 A·2026-10-02)
 *
 * 대상: training-roadmap-20261001/worksheet-types.json 의 id 가 `0-3-0-` 로 시작하는 개념 5개와
 *       그 유형 15개 (명세는 spec\spec-natural.json 의 같은 typeId).
 *   0-3-0-0 같은 수씩 묶기
 *       t1 그림을 같은 수씩 묶기 · t2 묶음 수와 전체 수 쓰기 · t3 그림과 묶음 표현 연결하기
 *   0-3-0-1 2·5·10씩 뛰어 세기
 *       t1 뛰어 세는 수 배열 완성하기 · t2 수직선에서 같은 간격으로 뛰기 · t3 같은 간격의 수 묶음 고르기
 *   0-3-0-2 같은 수의 덧셈을 곱셈으로 나타내기
 *       t1 그림 배열을 곱셈식으로 나타내기 · t2 덧셈식과 곱셈식 연결하기 · t3 곱셈식에 맞는 배열 완성하기
 *   0-3-0-3 배열과 곱셈식 연결
 *       t1 그림 배열을 곱셈식으로 나타내기 · t2 덧셈식과 곱셈식 연결하기 · t3 곱셈식에 맞는 배열 완성하기
 *   0-3-0-4 몇 배의 뜻
 *       t1 기준량의 몇 배인지 그림에서 찾기 · t2 배 그림과 곱셈식 연결하기 · t3 기준량과 비교량의 빈칸 채우기
 *
 * 문제 만들기 (작업 지시: 기존 생성기를 쓰되 조건에 안 맞는 문제는 걸러 내고 모자라면 더 뽑는다)
 *   · 수는 사이트의 기존 생성기 Worksheets.generate('multiply-one') 에서 먼저 가져온다.
 *   · 개념 조건(2~10의 한 묶음 수·묶음 수, 전체 100 이하, 2·5·10 간격 …)에 맞지 않는 문항은 버리고
 *     같은 묶음이 두 번 나오지 않게 한다.
 *   · 기존 생성기는 곱하는 수가 2~9뿐이라 10이 들어가는 묶음(예: 10개씩 4묶음)은 조건 범위에서 보충한다.
 *     (0-3-0-0 의 묶음 크기 10, 0-3-0-1 의 수직선 점프 등은 기존 생성기에 없는 값이다.)
 *   · 쉬운 것 → 어려운 것 순서로 놓는다(전체 수·곱이 작은 문항부터).
 *   · 0·1이 들어가는 쉬운 문제는 만들지 않는다(모든 수가 2 이상) → §2의 "0·1 문항 10% 이하"를 넘지 않는다.
 *   · 같은 typeId·같은 seed 면 같은 문제지(난수는 typeId 를 섞은 seed 에서만 나온다).
 *   · 0-3-0-2 와 0-3-0-3 은 로드맵의 유형 이름이 겹치므로(그림 배열을 곱셈식으로 / 곱셈식에 맞는 배열 완성)
 *     그림 활동을 갈라 놓았다. 0-3-0-2 는 묶음 그림, 0-3-0-3 은 격자 배열을 쓴다.
 *     두 묶음의 t2 는 명세대로 덧셈식과 곱셈식을 연결한다.
 *
 * 서식 (공용 파일 sheet.js · formats-*.js · gen-bridge.js · catalog.js 는 고치지 않는다)
 *   기존 서식  array-picture → formats-pictures.js 가 그리는 그림(배열·뛰어 세기 띠)과 문제 만들기를 그대로 쓰고
 *              gen.mode·gen.stepValues 로 개념 조건만 넘긴다(묶음 0-4-1 과 같은 방식).
 *   이 묶음 서식 g030-picture-groups  묶음 그림(같은 수씩 묶기·묶음 수와 전체 수·곱셈식으로 나타내기·배열 완성)
 *              g030-number-line     수직선에서 2·5·10씩 뛰기(기존 jump 서식은 문항이 15가지뿐이고 답을 인쇄한다)
 *              g030-picture-times   배 막대 그림(기준량 A · 비교량 B)
 *              g030-choice          같은 간격의 수 묶음 고르기
 *              g030-blank           기준량과 비교량의 빈칸 식
 *              g030-match           선 잇기(한 쪽 = 3묶음 × 6쌍, 그림도 이을 수 있게 이 묶음 전용으로 그린다)
 *
 * 배치 (layout-rules.md §2 최소 기준)
 *   그림 서식 3단×5줄 = 15 · 선 잇기 3묶음×6쌍 = 18쌍 · 빈칸 식 3단×14줄 = 42 · 고르기 2단×14줄 = 28
 *   그림 서식은 sheet.js 의 최소 칸 높이(38mm, 서식 이름에 picture)를 그대로 받아 자동 맞춤이 6줄(18문항)까지 늘린다.
 */
(function (root) {
  'use strict';

  const INK = '#111', ANSWER_INK = '#d71f10';
  const BUNDLE = /^0-3-0-/;                       // 이 파일이 맡은 묶음
  const PASSTHROUGH = ['array-picture'];          // 문제 만들기를 formats-pictures.js 가 맡는다
  const W = 200, H = 150;                         // 그림 서식 viewBox (formats-pictures.js 와 같게)
  const CIRCLED = '①②③④⑤⑥⑦⑧⑨⑩';

  /* ---------------------------------------------------------------- 기본 도구 */
  const el = (tag, cls, value) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (value !== undefined && value !== null) node.textContent = String(value);
    return node;
  };
  const html = (tag, cls, markup) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    node.innerHTML = markup;
    return node;
  };
  const esc = value => String(value === undefined || value === null ? '' : value)
    .replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function random(seed) {
    let state = (Number(seed) >>> 0) || 1;
    return () => {
      state += 0x6D2B79F5;
      let t = state;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function shuffle(list, rnd) {
    const out = list.slice();
    for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); const t = out[i]; out[i] = out[j]; out[j] = t; }
    return out;
  }
  /** 같은 유형·같은 seed 면 같은 문제, 유형이 다르면 다른 문제가 나오게 typeId 를 seed 에 섞는다. */
  function typeSeed(config) {
    const text = String((config && config.typeId) || '');
    let hash = 0x811C9DC5;
    for (let i = 0; i < text.length; i++) { hash ^= text.charCodeAt(i); hash = Math.imul(hash, 0x01000193); }
    return (((Number(config && config.seed) >>> 0) || 1) ^ hash) >>> 0;
  }

  /* ------------------------------------------------------- 개념이 정하는 조건 */
  // spec-natural.json 의 params(operation ×, groupSize 2~10, groupCount 2~10, total ≤ 100, stepValues 2·5·10)를
  // 유형별로 좁힌 값. 그림이 작은 서식(선 잇기·배 그림)은 한 묶음의 수를 더 좁혀 그림이 읽히게 한다.
  const CONCEPTS = {
    '0-3-0-0': { name: '같은 수씩 묶기', sizeMin: 2, sizeMax: 10, countMin: 2, countMax: 10, totalMax: 100 },
    '0-3-0-2': { name: '같은 수의 덧셈을 곱셈으로 나타내기', sizeMin: 2, sizeMax: 9, countMin: 2, countMax: 9, totalMax: 81 },
    '0-3-0-3': { name: '배열과 곱셈식 연결', sizeMin: 2, sizeMax: 9, countMin: 2, countMax: 9, totalMax: 81 },
    '0-3-0-4': { name: '몇 배의 뜻', sizeMin: 2, sizeMax: 9, countMin: 2, countMax: 9, totalMax: 81 }
  };
  const STEPS = [2, 5, 10];                       // 0-3-0-1 의 뛰어 세는 간격

  /* --------------------------- 기존 생성기에서 조건에 맞는 수를 먼저 가져오고 모자라면 더 뽑는다 */
  /** 기존 생성기(곱셈구구)가 내는 (한 묶음의 수, 묶음 수) 짝. 실패하면 빈 목록(보충분으로 채운다). */
  function legacyPairs(seed, want) {
    const out = [], seen = new Set();
    if (!root.Worksheets || typeof root.Worksheets.generate !== 'function') return out;
    for (let batch = 0; batch < 400 && out.length < want; batch++) {
      let rows;
      try { rows = root.Worksheets.generate('multiply-one', (seed + Math.imul(batch, 2654435761)) >>> 0, 16); }
      catch (error) { break; }
      for (const row of rows || []) {
        const a = Number(row.a), b = Number(row.b);
        if (!Number.isInteger(a) || !Number.isInteger(b)) continue;
        const key = a + 'x' + b;
        if (seen.has(key)) continue;
        seen.add(key); out.push({ size: a, count: b, total: a * b });
        if (out.length === want) break;
      }
    }
    return out;
  }
  /** 개념 조건에 맞는 (한 묶음의 수, 묶음 수) 전체 목록 — 기존 생성기 몫을 앞에, 보충분을 뒤에 둔다. */
  function pairPool(config, sizeMin, sizeMax, countMin, countMax, totalMax) {
    const seed = typeSeed(config);
    const limit = value => value <= totalMax;
    const legacy = legacyPairs(seed, 220).filter(f => f.size >= sizeMin && f.size <= sizeMax
      && f.count >= countMin && f.count <= countMax && limit(f.total));
    const seen = new Set(legacy.map(f => f.size + 'x' + f.count));
    const extra = [];
    for (let a = sizeMin; a <= sizeMax; a++) for (let b = countMin; b <= countMax; b++) {
      if (!limit(a * b) || seen.has(a + 'x' + b)) continue;
      seen.add(a + 'x' + b); extra.push({ size: a, count: b, total: a * b });
    }
    return legacy.concat(shuffle(extra, random(seed ^ 0x9E3779B9)));
  }
  /** 문항에 실을 짝 count개 — 기존 생성기 몫을 먼저 쓰고, 쉬운 것(전체 수가 작은 것)부터 놓는다. */
  function takePairs(config, pool, count, extraFilter) {
    const chosen = [], seen = new Set();
    for (const f of pool) {
      if (chosen.length === count) break;
      if (extraFilter && !extraFilter(f)) continue;
      const key = f.size + 'x' + f.count;
      if (seen.has(key)) continue;
      seen.add(key); chosen.push(f);
    }
    if (chosen.length !== count) {
      throw Error(config.typeId + ': 조건에 맞는 문항 ' + count + '개 중 ' + chosen.length + '개만 만들었습니다.');
    }
    chosen.sort((x, y) => x.total - y.total || x.size - y.size || x.count - y.count);
    return chosen;
  }

  /* ------------------------------------------------------------ 그림 서식 CSS */
  function installCss() {
    if (document.getElementById('g030-style')) return;
    const style = el('style');
    style.id = 'g030-style';
    style.textContent = [
      '.g030-pic{display:flex;flex-direction:column;height:100%;min-height:0;}',
      '.g030-canvas{flex:1;min-height:0;display:flex;}',
      '.g030-canvas svg{width:100%;height:100%;display:block;}',
      '.g030-foot{flex:none;padding-top:.4mm;font-size:.82em;line-height:1.25;white-space:nowrap;word-break:keep-all;}',
      '.g030-blank{display:inline-block;min-width:9mm;height:1.25em;border:1px solid #555;text-align:center;vertical-align:-.28em;line-height:1.2;}',
      '.g030-blank.is-answer{color:' + ANSWER_INK + ';border-color:' + ANSWER_INK + ';}',
      '.g030-ink{color:' + ANSWER_INK + ';}',
      '.g030-eq{font-size:1.4em;font-variant-numeric:tabular-nums;}',
      '.g030-eq .g030-ink{font-size:1em;}',
      // 고르기: 한 칸에 두 줄(무엇을 고르는지 + 가·나·다 세 묶음). 정답 묶음만 정답지에서 붉은 타원으로 감싼다.
      '.g030-choice{display:flex;flex-direction:column;justify-content:center;align-items:stretch;gap:.5mm;line-height:1.15;font-size:11.5pt;}',
      '.g030-prompt{font-weight:bold;text-align:center;}',
      '.g030-opts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1.6mm;margin-top:.8mm;}',
      // 가·나·다 한 묶음마다 상자 하나 — 위에 이름(가·나·다), 아래에 수 목록.
      '.g030-opt{display:flex;flex-direction:column;align-items:center;gap:.3mm;padding:.8mm .6mm 1mm;border:.35mm solid #555;border-radius:1.2mm;white-space:nowrap;font-size:.9em;background:#fff;}',
      '.g030-opt.is-right{border:.6mm solid ' + ANSWER_INK + ';}',
      '.g030-opt-label{color:#fff;background:#4a6f6c;border-radius:50%;width:4.2mm;height:4.2mm;display:inline-flex;align-items:center;justify-content:center;font-size:.85em;line-height:1;}',
      '.g030-opt-nums{letter-spacing:-.1mm;}',
      // ○표는 테두리로 그리면 글자 폭이 늘어 칸을 넘는다 → 음수 여백으로 늘어난 폭을 되돌린다.
      '.g030-ring{display:inline-block;border:1px solid ' + ANSWER_INK + ';border-radius:50%;padding:0 1mm;margin:0 -1.2mm;color:' + ANSWER_INK + ';}',
      // 유형 이름이 길어 머리말에서 잘리지 않도록 이 묶음 서식일 때만 머리말을 조금 작게 쓴다(0-3-1 과 같은 방식).
      'body[data-format^="g030-"] .sheet-head,body[data-format^="g030-"] .sheet-title{font-size:9pt;}',
      'body[data-g030-array="yes"] .sheet-head,body[data-g030-array="yes"] .sheet-title{font-size:8.5pt;}',
      // 빈칸 식: 한 줄
      '.g030-line{display:flex;align-items:center;height:100%;line-height:1.5;white-space:nowrap;}',
      // 선 잇기: 왼쪽 42% · 가운데 16%(정답선 자리) · 오른쪽 42%
      '.g030-pairs{position:absolute;inset:0;display:grid;grid-template-columns:42% 16% 42%;}',
      '.g030-pairs .mt-pair{overflow:visible;}',
      '.g030-mini{flex:0 0 auto;width:50mm;height:84%;display:flex;align-items:center;}',
      '.g030-mini svg{width:100%;height:100%;display:block;}'
    ].join('');
    document.head.append(style);
  }

  /* ------------------------------------------------------------ 그림 도구(SVG) */
  const svgOf = inner => '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid meet" aria-hidden="true">' + inner + '</svg>';
  const dotIcon = (cx, cy, r) => '<image href="vendor/art/' + (globalThis.IconPool ? globalThis.IconPool.current() : '1f34e') + '.svg" x="' + (Number(cx) - r * 1.3).toFixed(1) + '" y="' + (Number(cy) - r * 1.3).toFixed(1) + '" width="' + (r * 2.6).toFixed(1) + '" height="' + (r * 2.6).toFixed(1) + '" style="filter:saturate(2) contrast(1.2) brightness(.92) drop-shadow(0 0 .7px #222)"/>';
  const dot = (x, y, r) => dotIcon(x, y, r);
  const dotPlain = (x, y, r) => '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + r.toFixed(1) + '" fill="' + INK + '"/>';
  const box = (x, y, w, h, dash) => '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + w.toFixed(1)
    + '" height="' + h.toFixed(1) + '" fill="none" stroke="' + INK + '" stroke-width="1.2"'
    + (dash ? ' stroke-dasharray="4 3"' : '') + '/>';
  const svgText = (x, y, value, size, fill) => '<text x="' + x.toFixed(1) + '" y="' + y.toFixed(1)
    + '" text-anchor="middle" font-size="' + size + '" fill="' + (fill || INK) + '">' + esc(value) + '</text>';
  const DOTS_PER_ROW = 10;                        // 같은 수씩 묶기 그림은 한 줄에 10개씩 놓는다
  /** 점 배열(한 줄에 DOTS_PER_ROW개) — 묶기 전 그림과 정답지의 묶음 상자가 같은 자리를 쓴다. */
  function flatDots(total, area) {
    const rows = Math.max(1, Math.ceil(total / DOTS_PER_ROW));
    const cw = area.w / DOTS_PER_ROW, ch = area.h / rows, r = Math.min(cw, ch) * 0.3;
    let body = '';
    for (let i = 0; i < total; i++) {
      body += dot(area.x + cw * ((i % DOTS_PER_ROW) + .5), area.y + ch * (Math.floor(i / DOTS_PER_ROW) + .5), r);
    }
    return body;
  }
  /** 정답지에 그릴 묶음 상자 — 줄마다 같은 묶음에 속한 점들을 한 상자로 묶는다(줄을 넘으면 나뉜다). */
  function groupRuns(total, size, area) {
    const rows = Math.max(1, Math.ceil(total / DOTS_PER_ROW));
    const cw = area.w / DOTS_PER_ROW, ch = area.h / rows;
    let body = '';
    for (let row = 0; row < rows; row++) {
      const from = row * DOTS_PER_ROW, to = Math.min(total, from + DOTS_PER_ROW);
      let start = from;
      while (start < to) {
        const group = Math.floor(start / size);
        const end = Math.min(to, (group + 1) * size);
        const pad = Math.min(cw, ch) * 0.16;
        body += box(area.x + cw * (start - from) + pad, area.y + ch * row + pad,
          cw * (end - start) - pad * 2, ch - pad * 2, true);
        start = end;
      }
    }
    return body;
  }
  /** 묶기 전 그림 — 한 줄에 묶음이 정수 개 들어가게(열 수 = 묶음 크기 × k) 가장 큰 아이콘이 되는 k 를 골라 반듯한 격자로 놓는다.
   *  그래서 정답지의 점선 상자는 한 줄 안에서 이웃한 size 개를 감싸는 깔끔한 직사각형이 된다. */
  function looseGrid(total, size, area, answer) {
    const groups = Math.max(1, Math.round(total / size));
    let best = null;
    for (let k = 1; k <= groups; k++) {
      const cols = size * k, rows = Math.ceil(groups / k);
      const cell = Math.min(area.w / cols, area.h / rows);
      if (!best || cell > best.cell + 0.01) best = { k, cols, rows, cell };
    }
    const { k, cols, rows, cell } = best;
    const x0 = area.x + (area.w - cols * cell) / 2, y0 = area.y + (area.h - rows * cell) / 2;
    const r = cell / 2.6 * 0.96, pad = cell * 0.07;
    let body = '';
    for (let g = 0; g < groups; g++) {
      const gx = x0 + (g % k) * size * cell, gy = y0 + Math.floor(g / k) * cell;
      for (let i = 0; i < size; i++) body += dot(gx + cell * (i + .5), gy + cell * .5, r);
      if (answer) body += box(gx + pad, gy + pad, size * cell - pad * 2, cell - pad * 2, true);
    }
    return body;
  }
  // 묶음 상자를 몇 개씩 한 줄에 놓을지(그림이 한 쪽에 고르게 퍼지게)
  const BOX_COLS = { 2: 2, 3: 3, 4: 2, 5: 3, 6: 3, 7: 4, 8: 4, 9: 3, 10: 5 };
  /** 같은 수씩 담긴 묶음 상자 그림 — 상자 하나에 size개(한 줄에 5개까지). */
  function groupBoxes(groups, size, area) {
    // 상자 배치(몇 개씩 한 줄에, 상자 안은 몇 줄)를 모두 따져 아이콘이 가장 크게 들어가는 것을 고른다.
    // 상자가 세로로 길쭉해지지 않게 가로로 넓은 상자를 우선한다.
    let best = null;
    for (let cols = 1; cols <= groups; cols++) {
      const rows = Math.ceil(groups / cols);
      const bw = area.w / cols, bh = area.h / rows, pad = Math.min(bw, bh) * 0.08;
      const w = bw - pad * 2, h = bh - pad * 2;
      for (let perRow = 1; perRow <= size; perRow++) {
        const dRows = Math.ceil(size / perRow);
        const icon = Math.min(w / perRow, h / dRows);
        const wide = w >= h ? 1 : 0;
        const score = icon + wide * 0.01;
        if (!best || score > best.score) best = { cols, rows, bw, bh, pad, perRow, dRows, score };
      }
    }
    const { cols, bw, bh, pad, perRow, dRows } = best;
    let body = '';
    for (let g = 0; g < groups; g++) {
      const x = area.x + (g % cols) * bw + pad, y = area.y + Math.floor(g / cols) * bh + pad;
      const w = bw - pad * 2, h = bh - pad * 2;
      body += box(x, y, w, h, false);
      const cw = w / perRow, ch = h / dRows, r = Math.min(cw, ch) / 2.6 * 0.96;
      for (let i = 0; i < size; i++) {
        body += dot(x + cw * ((i % perRow) + .5), y + ch * (Math.floor(i / perRow) + .5), r);
      }
    }
    return body;
  }
  /** 배 막대 그림 — A는 base칸, B는 A와 같은 길이의 칸을 times번 이어 붙인 것(칸마다 경계선). */
  function barsBody(base, times) {
    const x0 = 26, x1 = 192, xm = 6;
    const total = base * times;
    const cw = (x1 - x0) / total;
    const barH = 30, yA = 10, yB = 62;
    const rules = (x, y, count, step, weight) => {
      let out = '';
      for (let i = 1; i < count; i++) {
        const on = i % step === 0;
        out += '<path d="M' + (x + cw * i).toFixed(1) + ' ' + y + 'V' + (y + barH)
          + '" stroke="' + INK + '" stroke-width="' + (on ? weight : 0.6) + '"/>';
      }
      return out;
    };
    let body = '';
    body += '<text x="' + (x0 - xm) + '" y="' + (yA + barH * 0.7) + '" text-anchor="end" font-size="20" fill="' + INK + '">A</text>';
    body += '<rect x="' + x0 + '" y="' + yA + '" width="' + (cw * base).toFixed(1) + '" height="' + barH + '" fill="#819fba"/>';
    body += box(x0, yA, cw * base, barH, false) + rules(x0, yA, base, base, 1.2);
    body += '<text x="' + (x0 - xm) + '" y="' + (yB + barH * 0.7) + '" text-anchor="end" font-size="20" fill="' + INK + '">B</text>';
    for (let group = 0; group < times; group++) body += '<rect x="' + (x0 + group * base * cw).toFixed(1) + '" y="' + yB + '" width="' + (base * cw).toFixed(1) + '" height="' + barH + '" fill="' + (group % 2 ? '#c4dfb8' : '#819fba') + '"/>';
    body += box(x0, yB, cw * total, barH, false) + rules(x0, yB, total, base, 1.8);
    return body;
  }

  /* ---------------------------------------------- 서식 1: 묶음 그림(g030-picture-groups) */
  /** '곱하기 n' 뒤에 붙는 목적격 조사(2 → 를, 3 → 을). */
  const objectJosa = n => ([2, 4, 5, 9].indexOf(Number(n)) >= 0 ? '를' : '을');
  const blank = (value, answer) => '<span class="g030-blank' + (answer ? ' is-answer' : '') + '">'
    + (answer ? esc(value) : '') + '</span>';
  const ink = value => '<span class="g030-ink">' + esc(value) + '</span>';
  const AREA_FLAT = { x: 8, y: 16, w: 184, h: 112 };
  const AREA_BOX = { x: 8, y: 16, w: 184, h: 112 };
  const AREA_EMPTY = { x: 14, y: 22, w: 172, h: 100 };
  /** 묶음 그림 한 문항 — kind 에 따라 그리는 것과 푸는 것이 달라진다. */
  function groupsFrame(item, answer) {
    const mode = item.mode, size = item.size, groups = item.groups, total = item.total;
    if (mode === 'mark') {                       // 그림을 같은 수씩 묶기(문제지: 점 배열, 정답지: 묶음 상자)
      const body = looseGrid(total, size, AREA_FLAT, answer);
      return { svg: svgOf(body), foot: size + '개씩 묶으면 ' + blank(groups, answer) + '묶음' };
    }
    if (mode === 'write') {                      // 묶음 수와 전체 수 쓰기(묶인 그림이 주어진다)
      return {
        svg: svgOf(groupBoxes(groups, size, AREA_BOX)),
        foot: '묶음 수 ' + blank(groups, answer) + '묶음 · 전체 수 ' + blank(total, answer) + '개'
      };
    }
    if (mode === 'times') {                      // 그림 배열을 곱셈식으로 나타내기
      return {
        svg: svgOf(groupBoxes(groups, size, AREA_BOX)),
        foot: blank(size, answer) + ' × ' + blank(groups, answer) + ' = ' + blank(total, answer)
      };
    }
    if (mode === 'build') {                      // 곱셈식에 맞는 배열 완성하기(문제지: 빈 자리, 정답지: 그린 배열)
      if (answer) {
        return { svg: svgOf(groupBoxes(groups, size, AREA_BOX)),
          foot: '<span class="g030-eq">' + size + ' × ' + groups + ' = ' + ink(total) + '</span>' };
      }
      return { svg: svgOf(box(AREA_EMPTY.x, AREA_EMPTY.y, AREA_EMPTY.w, AREA_EMPTY.h, true)),
        foot: '<span class="g030-eq">' + size + ' × ' + groups + '</span>' + objectJosa(groups) + ' 그림으로 나타내 보세요' };
    }
    return { svg: svgOf(''), foot: '' };
  }
  function renderGroups(cell, question, answer) {
    installCss();
    const frame = groupsFrame(question, answer);
    const wrap = el('div', 'g030-pic');
    wrap.append(html('div', 'g030-canvas', frame.svg), html('div', 'g030-foot', frame.foot));
    cell.append(wrap);
  }

  /* ------------------------------------------- 서식 2: 수직선에서 뛰기(g030-number-line) */
  // 기존 number-line 의 jump 서식은 문항 열쇠가 15가지뿐이라 3단×5줄(15문항)도 채우지 못하고,
  // 마지막 눈금 값(답)을 문제지에 그대로 인쇄한다. 이 묶음은 같은 그림을 조건(2·5·10 간격)에 맞춰
  // 직접 그리되, 마지막 눈금 값은 정답지에만 붉게 쓴다(문제지에는 값이 없다).
  function renderLine(cell, question, answer) {
    installCss();
    const start = question.start, step = question.step, jumps = question.jumps, end = question.end;
    const x0 = 12, x1 = 190, y = 88;          // 수직선을 칸 폭 거의 전체로 늘린다(아래 viewBox 도 그림 부분만 잘라 쓴다)
    const at = j => x0 + (x1 - x0) * j / jumps;
    let body = '<path d="M' + x0 + ' ' + y + 'H' + x1 + '" stroke="' + INK + '" stroke-width="1.4"/>';
    body += '<path d="M' + (x1 - 7) + ' ' + (y - 4) + 'L' + x1 + ' ' + y + 'L' + (x1 - 7) + ' ' + (y + 4) + 'Z" fill="' + INK + '"/>';
    for (let j = 0; j <= jumps; j++) {
      const x = at(j);
      body += '<path d="M' + x.toFixed(1) + ' ' + y + 'V' + (y + 7) + '" stroke="' + INK + '" stroke-width="1.1"/>';
      // 마지막 눈금의 값은 답이므로 문제지에는 쓰지 않는다.
      if (j < jumps) body += svgText(x, y + 26, start + j * step, 15, INK);
      else if (answer) body += svgText(x, y + 26, end, 15, ANSWER_INK);
    }
    for (let j = 0; j < jumps; j++) {
      const from = at(j), to = at(j + 1), mid = (from + to) / 2;
      body += '<path d="M' + from.toFixed(1) + ' ' + (y - 4) + ' Q' + mid.toFixed(1) + ' ' + (y - 30)
        + ' ' + to.toFixed(1) + ' ' + (y - 4) + '" fill="none" stroke="' + INK + '" stroke-width="1.3"/>';
      body += '<path d="M' + (to - 6).toFixed(1) + ' ' + (y - 11) + 'L' + to.toFixed(1) + ' ' + (y - 4)
        + 'L' + (to - 7).toFixed(1) + ' ' + (y - 1) + 'Z" fill="' + INK + '"/>';
      body += svgText(mid, y - 20, '+' + step, 14, INK);
    }
    body += '<circle cx="' + at(0).toFixed(1) + '" cy="' + y + '" r="4" fill="' + INK + '"/>';
    const wrap = el('div', 'g030-pic');
    wrap.append(html('div', 'g030-canvas', '<svg viewBox="2 50 196 70" preserveAspectRatio="xMidYMid meet" aria-hidden="true">' + body + '</svg>'),
      html('div', 'g030-foot', start + '에서 ' + step + '씩 ' + jumps + '번 뛰면 ' + blank(end, answer)));
    cell.append(wrap);
  }

  /* ------------------------------------------------- 서식 3: 배 막대 그림(g030-picture-times) */
  function rowsFrame(item, answer) {
    return { svg: '<svg viewBox="0 0 200 100" preserveAspectRatio="xMidYMid meet" aria-hidden="true">' + barsBody(item.base, item.times) + '</svg>', foot: 'B는 A의 ' + blank(item.times, answer) + '배' };
  }
  function renderRows(cell, question, answer) {
    installCss();
    const frame = rowsFrame(question, answer);
    const wrap = el('div', 'g030-pic');
    wrap.append(html('div', 'g030-canvas', frame.svg), html('div', 'g030-foot', frame.foot));
    cell.append(wrap);
  }

  /* ------------------------------------------- 서식 4: 같은 간격의 수 묶음 고르기(g030-choice) */
  function renderChoice(cell, question, answer) {
    installCss();
    const wrap = el('div', 'g030-choice');
    wrap.append(el('div', 'g030-prompt', question.step + '씩 뛰어 세기'));
    const row = el('div', 'g030-opts');
    question.options.forEach((option, index) => {
      const right = answer && index === question.correct;
      row.append(html('span', 'g030-opt' + (right ? ' is-right' : ''),
        '<span class="g030-opt-label">' + option.label + '</span>'
        + '<span class="g030-opt-nums">' + esc(option.values.join(', ')) + '</span>'));
    });
    wrap.append(row);
    cell.append(wrap);
  }

  /* ------------------------------------------- 서식 5: 기준량·비교량 빈칸 식(g030-blank) */
  function renderFill(cell, question, answer) {
    installCss();
    const b = value => blank(value, answer);
    let line;
    if (question.mask === 1) line = b(question.base) + '의 ' + question.times + '배는 ' + question.total;
    else if (question.mask === 2) line = question.base + '의 ' + b(question.times) + '배는 ' + question.total;
    else line = question.base + '의 ' + question.times + '배는 ' + b(question.total);
    cell.append(html('div', 'g030-line', line));
  }

  /* ------------------------------------------------- 서식 6: 선 잇기(g030-match) */
  /** 선 잇기 한 칸에 들어가는 작은 그림 — 왼쪽 42% 자리에 들어가므로 가로로 길고 낮게(200:40 → 300:40) 그린다. */
  function miniSvg(picture) {
    const w = 190, h = 64;
    const open = '<svg viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="xMidYMid meet" aria-hidden="true">';
    if (picture.kind === 'groups') {
      const cols = picture.groups, bw = w / cols, pad = Math.min(bw, h) * 0.08;
      let perRow = 1, bestIcon = 0;
      for (let p = 1; p <= picture.size; p++) {                // 상자 안 아이콘이 가장 크게 들어가는 줄 배치
        const icon = Math.min((bw - pad * 2) / p, (h - pad * 2) / Math.ceil(picture.size / p));
        if (icon > bestIcon + 0.01) { bestIcon = icon; perRow = p; }
      }
      const dRows = Math.ceil(picture.size / perRow);
      let body = '';
      for (let g = 0; g < cols; g++) {
        const x = g * bw + pad, y = pad, bwid = bw - pad * 2, bhei = h - pad * 2;
        body += '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + bwid.toFixed(1)
          + '" height="' + bhei.toFixed(1) + '" fill="none" stroke="' + INK + '" stroke-width="1"/>';
        const cw = bwid / perRow, ch = bhei / dRows, r = Math.min(cw, ch) * 0.37;
        for (let i = 0; i < picture.size; i++) {
          body += dot(x + cw * ((i % perRow) + .5), y + ch * (Math.floor(i / perRow) + .5), r);
        }
      }
      return open + body + '</svg>';
    }
    if (picture.kind === 'array') {
      const cols = picture.cols, rows = picture.rows;
      const cw = w / cols, ch = h / rows, r = Math.min(cw, ch) * 0.3;
      let body = '';
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          body += '<rect x="' + (col * cw).toFixed(1) + '" y="' + (row * ch).toFixed(1) + '" width="' + cw.toFixed(1)
            + '" height="' + ch.toFixed(1) + '" fill="none" stroke="#bbb" stroke-width=".6"/>';
          body += dot(cw * (col + .5), ch * (row + .5), r);
        }
      }
      return open + body + '</svg>';
    }
    // 배 그림 (A는 base칸, B는 같은 길이를 times번)
    const total = picture.base * picture.times;
    const x0 = 4, x1 = 186, cw = (x1 - x0) / total, barH = 24, yA = 6, yB = 34;
    let body = '';
    body += '<rect x="' + x0 + '" y="' + yA + '" width="' + (cw * picture.base).toFixed(1) + '" height="' + barH + '" fill="#819fba"/>';
    for (let group = 0; group < picture.times; group++) body += '<rect x="' + (x0 + group * picture.base * cw).toFixed(1) + '" y="' + yB + '" width="' + (picture.base * cw).toFixed(1) + '" height="' + barH + '" fill="' + (group % 2 ? '#c4dfb8' : '#819fba') + '"/>';

    body += '<rect x="' + x0 + '" y="' + yA + '" width="' + (cw * picture.base).toFixed(1) + '" height="' + barH + '" fill="none" stroke="' + INK + '" stroke-width="1"/>';
    body += '<rect x="' + x0 + '" y="' + yB + '" width="' + (cw * total).toFixed(1) + '" height="' + barH + '" fill="none" stroke="' + INK + '" stroke-width="1"/>';
    for (let i = 1; i < picture.base; i++) {                    // A 막대 안의 칸 경계
      body += '<path d="M' + (x0 + cw * i).toFixed(1) + ' ' + yA + 'V' + (yA + barH) + '" stroke="' + INK + '" stroke-width="0.8"/>';
    }
    for (let i = 1; i < total; i++) {
      const on = i % picture.base === 0;
      body += '<path d="M' + (x0 + cw * i).toFixed(1) + ' ' + yB + 'V' + (yB + barH) + '" stroke="' + INK
        + '" stroke-width="' + (on ? 2 : 0.8) + '"/>';
    }
    return open + body + '</svg>';
  }
  function matchValue(value) {
    if (value.text !== undefined && value.text !== null) return el('span', 'mt-text', value.text);
    return html('span', 'g030-mini', miniSvg(value.picture));
  }
  function renderMatchBundle(config, item, isAnswer) {
    installCss();
    const count = item.pairs.length;
    // 동그라미를 글자 바로 옆에 붙인 2단 배치(compact). 왼쪽·오른쪽 글자 폭은 내용에 맞춰 따로 잡는다.
    const fs = (Number(config && config.fontPt) || 12) / 12;
    const widthOf = value => value.text !== undefined && value.text !== null
      ? ([...String(value.text)].reduce((sum, ch) => sum + (ch === ' ' ? 1.15 : /[가-힣]/.test(ch) ? 3.3 : 2.5), 0) + 1) * fs : 36;
    const wl = Math.ceil(Math.max(14, ...item.pairs.map(pair => widthOf(pair.left)))),
      wr = Math.ceil(Math.max(14, ...item.pairs.map(pair => widthOf(pair.right)))), gap = 6;
    const wrap = el('div', 'mt-pairs-wrap mt-compact');
    wrap.style.setProperty('--wl', wl + 'mm'); wrap.style.setProperty('--wr', wr + 'mm'); wrap.style.setProperty('--gap', gap + 'mm');
    const grid = el('div', 'mt-pairs');
    grid.style.gridTemplateRows = 'repeat(' + count + ', minmax(0, 1fr))';
    const rowOf = [];
    item.pairs.forEach((pair, index) => {
      const left = el('div', 'mt-pair mt-left');
      left.append(el('span', 'mt-idx', (index + 1) + '.'), matchValue(pair.left), el('span', 'mt-mark'));
      grid.append(left);
    });
    // 오른쪽은 순서를 섞어 놓는다(번호만 보고 짝을 알 수 없다). 행마다 왼쪽·오른쪽이 한 쌍으로 놓이도록 DOM 순서를 맞춘다.
    const rights = [];
    item.order.forEach((pairIndex, row) => {
      rowOf[pairIndex] = row;
      const right = el('div', 'mt-pair mt-right');
      right.append(el('span', 'mt-mark'), matchValue(item.pairs[pairIndex].right));
      rights[row] = right;
    });
    const lefts = [...grid.children];
    grid.replaceChildren();
    lefts.forEach((left, row) => { grid.append(left, rights[row]); });
    wrap.append(grid);
    if (isAnswer) {
      const T = wl + wr + 18 + gap, x1 = ((wl + 7.5) / T * 1000).toFixed(1), x2 = ((wl + 9 + gap + 1.5) / T * 1000).toFixed(1);
      const lines = item.pairs.map((pair, index) => '<line x1="' + x1 + '" y1="' + ((index + .5) / count * 1000).toFixed(1)
        + '" x2="' + x2 + '" y2="' + ((rowOf[index] + .5) / count * 1000).toFixed(1) + '"/>').join('');
      wrap.append(html('div', 'mt-lines', '<svg viewBox="0 0 1000 1000" preserveAspectRatio="none">' + lines + '</svg>'));
    }
    return wrap;
  }

  /* --------------------------------------------------------- 문제 만들기(유형별) */
  /** 0-3-0-0 · 0-3-0-2 묶음 그림 문항 — mode 에 따라 조건 범위가 조금씩 다르다. */
  function groupItems(config, count) {
    const gen = config.gen || {}, mode = gen.kind;
    const concept = CONCEPTS[gen.conceptId];
    if (!concept) throw Error(config.typeId + ': 알 수 없는 개념 ' + gen.conceptId);
    let sizeMax = concept.sizeMax, countMax = concept.countMax, filter = null;
    if (mode === 'build') { sizeMax = 6; countMax = 6; filter = f => f.total <= 30; }   // 학생이 직접 그리는 자리
    if (mode === 'times') { sizeMax = 9; countMax = 9; }
    const pool = pairPool(config, concept.sizeMin, sizeMax, concept.countMin, countMax, concept.totalMax);
    const pairs = takePairs(config, pool, count, filter);
    return pairs.map(pair => ({
      mode: mode, size: pair.size, groups: pair.count, total: pair.total,
      key: mode + ':' + pair.size + 'x' + pair.count
    }));
  }
  /** 0-3-0-4-t1 배 막대 그림 — 기준량 A가 2~4칸이라 그림에서 몇 배인지 셀 수 있다. */
  function barItems(config, count) {
    const pool = pairPool(config, 2, 4, 2, 9, 100);
    return takePairs(config, pool, count).map(pair => ({
      base: pair.size, times: pair.count, total: pair.total, key: 'bar:' + pair.size + 'x' + pair.count
    }));
  }
  /** 0-3-0-1-t2 수직선에서 뛰기 — 2·5·10씩, 시작 눈금은 0 또는 같은 간격의 배수. */
  function lineItems(config, count) {
    const pool = [];
    for (const step of (config.gen && config.gen.steps) || STEPS) {
      for (let multiple = 0; multiple <= 2; multiple++) {            // 0 · 2 · 4 처럼 같은 간격의 자리에서 시작
        for (let jumps = 2; jumps <= 5; jumps++) {
          const start = multiple * step, end = start + step * jumps;
          if (end > 100) continue;                                    // 100까지의 수
          pool.push({ start: start, step: step, jumps: jumps, end: end,
            key: 'jump:' + start + ':' + step + ':' + jumps });
        }
      }
    }
    const chosen = shuffle(pool, random(typeSeed(config) ^ 0x66D1F3A5)).slice(0, count);
    if (chosen.length !== count) {
      throw Error(config.typeId + ': 수직선 문항 ' + count + '개 중 ' + chosen.length + '개만 만들었습니다.');
    }
    chosen.sort((x, y) => x.end - y.end || x.step - y.step || x.jumps - y.jumps);
    return chosen;
  }
  /** 0-3-0-4-t3 기준량·비교량 빈칸 — 빈 자리(전체·기준량·배)를 돌려 가며 쓴다(답이 하나로 정해진다). */
  function fillItems(config, count) {
    const pool = pairPool(config, 2, 9, 2, 9, 81);
    const out = [], seen = new Set();
    for (let i = 0; i < count; i++) {
      const round = Math.floor(i / pool.length), at = i % pool.length;
      const pair = pool[at];
      const mask = (at + round) % 3;                                  // 같은 짝에 빈 자리 셋을 차례로
      const key = mask + ':' + pair.size + 'x' + pair.count;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ base: pair.size, times: pair.count, total: pair.total, mask: mask, key: key });
    }
    if (out.length !== count) {
      throw Error(config.typeId + ': 빈칸 문항 ' + count + '개 중 ' + out.length + '개만 만들었습니다.');
    }
    out.sort((x, y) => x.total - y.total || x.base - y.base || x.mask - y.mask);
    return out;
  }
  /** 0-3-0-1-t3 같은 간격의 수 묶음 고르기 — 셋 중 하나만 간격이 같다. */
  const uniform = list => list.every((value, i) => i < 2 || value - list[i - 1] === list[1] - list[0]);
  function choiceItems(config, count) {
    const rnd = random(typeSeed(config) ^ 0x27D4EB2F);
    const steps = (config.gen && config.gen.steps) || STEPS;
    const items = [], seen = new Set(), seenCorrect = new Set();
    for (let guard = 0; items.length < count && guard < count * 400; guard++) {
      const step = steps[Math.floor(rnd() * steps.length)];
      const start = 2 + Math.floor(rnd() * 8);                    // 2~9 에서 시작
      const correct = [0, 1, 2, 3].map(i => start + step * i);
      if (correct[3] > 100) continue;
      if (seenCorrect.has(correct.join('-'))) continue;           // 같은 정답 묶음이 한 장에 두 번 나오지 않게
      const breakAt = 1 + Math.floor(rnd() * 3);
      const broken = correct.slice();
      broken[breakAt] = correct[breakAt] + (rnd() < 0.5 ? -1 : 1) * (1 + Math.floor(rnd() * Math.max(1, step - 1)));
      const uneven = correct.slice();
      uneven[2] = correct[2] + 1 + Math.floor(rnd() * 2);
      const usable = list => list.every(v => v >= 2 && v <= 100)
        && list.every((v, i) => i === 0 || v > list[i - 1]) && !uniform(list);
      if (!usable(broken) || !usable(uneven)) continue;
      if (broken.join() === uneven.join()) continue;
      const key = correct.join('-') + '|' + broken.join('-') + '|' + uneven.join('-');
      if (seen.has(key)) continue;
      seen.add(key); seenCorrect.add(correct.join('-'));
      const options = shuffle([
        { values: correct, right: true }, { values: broken, right: false }, { values: uneven, right: false }
      ], rnd).map((option, index) => ({ label: '가나다'[index], values: option.values, right: option.right }));
      items.push({ step: step, options: options, correct: options.findIndex(o => o.right), key: key });
    }
    if (items.length !== count) {
      throw Error(config.typeId + ': 고르기 문항 ' + count + '개 중 ' + items.length + '개만 만들었습니다.');
    }
    items.sort((x, y) => x.step - y.step || x.options[x.correct].values[3] - y.options[y.correct].values[3]);
    return items;
  }
  /** 선 잇기 짝 — 유형마다 왼쪽(그림/식)과 오른쪽(말/식)의 짝짓기 규칙이 다르다(전부 기존 생성기의 수에서 나온다). */
  function matchPairs(config, kind, need) {
    const seed = typeSeed(config);
    if (kind === 'group-phrase') {
      const all = [];
      for (let size = 2; size <= 7; size++) for (let count = 2; count <= 5; count++) all.push({ size: size, count: count });
      if (all.length < need) throw Error(config.typeId + ': 연결 짝 ' + need + '개를 만들 짝이 모자랍니다.');
      return shuffle(all, random(seed ^ 0x1F123BB5)).slice(0, need).map(pair => ({
        key: 'group:' + pair.size + 'x' + pair.count,
        left: { picture: { kind: 'groups', groups: pair.count, size: pair.size } },
        right: { text: pair.size + '개씩 ' + pair.count + '묶음' }
      }));
    }
    if (kind === 'add-mul') {
      const all = [];
      // 더하는 수 a(2~9) × 횟수 b(2~6, 덧셈식이 칸에 들어가도록). a·b 가 모두 6 이하이면 방향만 바꾼 짝(3×5 와 5×3)은 한 쪽만 쓴다.
      for (let a = 2; a <= 9; a++) for (let b = 2; b <= 6; b++) if (!(a <= 6 && a > b)) all.push({ a: a, b: b });
      if (all.length < need) throw Error(config.typeId + ': 연결 짝 ' + need + '개를 만들 짝이 모자랍니다.');
      return shuffle(all, random(seed ^ 0x2F123BB5)).slice(0, need).map(pair => ({
        key: 'add:' + pair.a + 'x' + pair.b,
        left: { text: new Array(pair.b + 1).join(String(pair.a) + ' + ').slice(0, -3) },
        right: { text: pair.a + ' × ' + pair.b }
      }));
    }
    if (kind === 'array-mul') {
      const all = [];
      for (let rows = 2; rows <= 4; rows++) for (let cols = rows; cols <= 10; cols++) all.push({ rows: rows, cols: cols });
      // 줄 수가 열 수보다 많지 않게 골라, 방향만 바꾼 배열(전치)이 한 장에 함께 나오지 않게 한다.
      if (all.length < need) throw Error(config.typeId + ': 연결 짝 ' + need + '개를 만들 짝이 모자랍니다.');
      return shuffle(all, random(seed ^ 0x3F123BB5)).slice(0, need).map(pair => ({
        key: 'array:' + pair.rows + 'x' + pair.cols,
        left: { picture: { kind: 'array', rows: pair.rows, cols: pair.cols } },
        right: { text: pair.cols + ' × ' + pair.rows + ' = ' + pair.cols * pair.rows }
      }));
    }
    if (kind === 'bar-mul') {
      const all = [];
      for (let base = 2; base <= 5; base++) for (let times = 2; times <= 9; times++) all.push({ base: base, times: times });
      const picked = [], taken = new Set();
      for (const pair of shuffle(all, random(seed ^ 0x4F123BB5))) {
        if (picked.length === need) break;
        if (taken.has(pair.times + 'x' + pair.base)) continue;      // 방향만 바꾼 짝은 한 장에 넣지 않는다
        taken.add(pair.base + 'x' + pair.times); picked.push(pair);
      }
      if (picked.length !== need) throw Error(config.typeId + ': 배 그림 짝 ' + need + '개를 만들지 못했습니다.');
      return picked.map(pair => ({
        key: 'bars:' + pair.base + 'x' + pair.times,
        left: { picture: { kind: 'bars', base: pair.base, times: pair.times } },
        right: { text: pair.base + ' × ' + pair.times + ' = ' + pair.base * pair.times }
      }));
    }
    throw Error(config.typeId + ': 알 수 없는 연결 유형 ' + kind);
  }
  /** 선 잇기 한 쪽 — 묶음 셋으로 나누고, 오른쪽 차례를 섞어 제자리에 남는 짝(가로선)을 없앤다. */
  function buildMatch(config) {
    const gen = config.gen || {};
    const bundles = Math.max(1, Number(config.cols) || 3);
    const per = Math.max(3, Number(config.rows) || 6);
    const pairs = matchPairs(config, gen.kind, bundles * per);
    const rnd = random(typeSeed(config) ^ 0x5BF03635);
    const items = [];
    for (let b = 0; b < bundles; b++) {
      const chunk = pairs.slice(b * per, (b + 1) * per);
      const order = shuffle(chunk.map((value, index) => index), rnd);
      for (let i = 0; i < order.length; i++) {
        if (order[i] !== i) continue;
        const j = (i + 1) % order.length;
        const swap = order[i]; order[i] = order[j]; order[j] = swap;
      }
      for (let i = 0; i < order.length; i++) {                    // 한 번에 안 없어지면 한 칸씩 돌린다
        if (order[i] !== i) continue;
        const first = order.shift(); order.push(first);
      }
      items.push({ kind: 'bundle', caption: '', pairs: chunk, order: order, rowsWeight: per });
    }
    return { items: items, layout: { cols: bundles, rows: per, count: pairs.length }, pairs: pairs.length };
  }

  function generateFor(config) {
    const gen = config.gen || {};
    const count = config.count || config.cols * config.rows;
    if (gen.kind === 'mark' || gen.kind === 'write' || gen.kind === 'times' || gen.kind === 'build') {
      return groupItems(config, count);
    }
    if (gen.kind === 'bars') return barItems(config, count);
    if (gen.kind === 'jump') return lineItems(config, count);
    if (gen.kind === 'fill') return fillItems(config, count);
    if (gen.kind === 'choice') return choiceItems(config, count);
    throw Error(config.typeId + ': 알 수 없는 문제 종류 ' + String(gen.kind));
  }

  /* --------------------------------------------------------------- 유형 목록 */
  // cols·rows 는 layout-rules §2 의 최소 기준. sheet.js 의 자동 맞춤이 공간이 남으면 줄을 늘린다.
  const SPECS = [
    // 같은 수씩 묶기 — 점 배열을 10개씩 한 줄에 놓고 2~10개씩 묶는다
    { typeId: '0-3-0-0-t1', title: '그림을 같은 수씩 묶기', instruction: '그림을 같은 수씩 묶어 보고 묶음 수를 쓰세요.',
      format: 'g030-picture-groups', cols: 3, rows: 6, gen: { conceptId: '0-3-0-0', kind: 'mark' } },
    { typeId: '0-3-0-0-t2', title: '묶음 수와 전체 수 쓰기', instruction: '그림을 보고 묶음 수와 전체 수를 쓰세요.',
      format: 'g030-picture-groups', cols: 3, rows: 6, gen: { conceptId: '0-3-0-0', kind: 'write' } },
    { typeId: '0-3-0-0-t3', title: '그림과 묶음 표현 연결하기', instruction: '서로 알맞은 것끼리 선으로 연결하세요.',
      format: 'g030-match', cols: 6, rows: 4, gen: { conceptId: '0-3-0-0', kind: 'group-phrase' } },

    // 2·5·10씩 뛰어 세기 — 배열·수직선은 기존 그림 서식, 고르기는 이 묶음 서식
    { typeId: '0-3-0-1-t1', title: '뛰어 세는 수 배열 완성하기', instruction: '빈칸에 알맞은 수를 써넣으세요.',
      format: 'array-picture', cols: 3, rows: 6, gen: { mode: 'sequence', stepValues: STEPS, numberMax: 100 } },
    { typeId: '0-3-0-1-t2', title: '수직선에서 같은 간격으로 뛰기', instruction: '수직선을 보고 알맞은 수를 쓰세요.',
      format: 'g030-number-line', cols: 3, rows: 6, gen: { conceptId: '0-3-0-1', kind: 'jump', steps: STEPS } },
    { typeId: '0-3-0-1-t3', title: '같은 간격의 수 묶음 고르기', instruction: '아래의 규칙대로 뛰어 세기 한 것을 고르세요.',
      format: 'g030-choice', cols: 2, rows: 10, autoFit: false, gen: { conceptId: '0-3-0-1', kind: 'choice', steps: STEPS } },

    // 같은 수의 덧셈을 곱셈으로 — 묶음 그림(왼쪽)으로 덧셈을 곱셈으로 바꾸는 연습
    { typeId: '0-3-0-2-t1', title: '그림 배열을 곱셈식으로 나타내기', instruction: '그림을 보고 곱셈식의 빈칸에 알맞은 수를 써넣으세요.',
      format: 'g030-picture-groups', cols: 3, rows: 6, gen: { conceptId: '0-3-0-2', kind: 'times' } },
    { typeId: '0-3-0-2-t2', title: '덧셈식과 곱셈식 연결하기', instruction: '서로 알맞은 것끼리 선으로 연결하세요.',
      format: 'g030-match', cols: 6, rows: 4, gen: { conceptId: '0-3-0-2', kind: 'add-mul' } },
    { typeId: '0-3-0-2-t3', title: '곱셈식에 맞는 배열 완성하기', instruction: '곱셈식에 맞게 알맞은 그림을 그려 보세요.',
      format: 'g030-picture-groups', cols: 3, rows: 6, gen: { conceptId: '0-3-0-2', kind: 'build' } },

    // 배열과 곱셈식 연결 — 격자 배열 그림은 기존 그림 서식, 연결은 이 묶음 서식
    { typeId: '0-3-0-3-t1', title: '그림 배열을 곱셈식으로 나타내기', instruction: '그림을 보고 곱셈식의 빈칸에 알맞은 수를 써넣으세요.',
      format: 'array-picture', cols: 3, rows: 6,
      gen: { mode: 'read', groupCountMax: 6, groupSizeMax: 6, operation: '×' } },
    { typeId: '0-3-0-3-t2', title: '덧셈식과 곱셈식 연결하기', instruction: '서로 알맞은 것끼리 선으로 연결하세요.',
      format: 'g030-match', cols: 6, rows: 4, gen: { conceptId: '0-3-0-3', kind: 'add-mul' } },
    { typeId: '0-3-0-3-t3', title: '곱셈식에 맞는 배열 완성하기', instruction: '곱셈식에 맞게 알맞은 그림을 그려 보세요.',
      format: 'array-picture', cols: 3, rows: 6,
      gen: { mode: 'build', groupCountMax: 6, groupSizeMax: 6, operation: '×' } },

    // 몇 배의 뜻 — 배 막대 그림과 곱셈식, 빈칸 식
    { typeId: '0-3-0-4-t1', title: '기준량의 몇 배인지 그림에서 찾기', instruction: '그림을 보고 B가 A의 몇 배인지 쓰세요.',
      format: 'g030-picture-times', cols: 3, rows: 6, gen: { conceptId: '0-3-0-4', kind: 'bars' } },
    { typeId: '0-3-0-4-t2', title: '배 그림과 곱셈식 연결하기', instruction: '서로 알맞은 것끼리 선으로 연결하세요.',
      format: 'g030-match', cols: 6, rows: 4, gen: { conceptId: '0-3-0-4', kind: 'bar-mul' } },
    { typeId: '0-3-0-4-t3', title: '기준량과 비교량의 빈칸 채우기', instruction: '빈칸에 알맞은 수를 써넣으세요.',
      format: 'g030-blank', cols: 3, rows: 13, gen: { conceptId: '0-3-0-4', kind: 'fill' } }
  ];

  /* ------------------------------------------------- 서식 등록(공용 틀을 그대로 씀) */
  function register() {
    if (!root.Sheet || typeof root.Sheet.register !== 'function') return false;
    root.Sheet.register('g030-picture-groups', renderGroups);
    root.Sheet.register('g030-number-line', renderLine);
    root.Sheet.register('g030-picture-times', renderRows);
    root.Sheet.register('g030-choice', renderChoice);
    root.Sheet.register('g030-blank', renderFill);
    if (root.MatchingSheet && root.MatchingSheet.formats) {
      root.MatchingSheet.formats['g030-match'] = {
        page: 'blocks', title: '연결하기',
        build: buildMatch,
        render: (config, item, isAnswer) => renderMatchBundle(config, item, isAnswer)
      };
    }
    return true;
  }

  /* ----------------------------- 문제 생성 연결(gen-bridge.js 와 같은 방식으로 감싼다) */
  const MINE = new Set(SPECS.map(spec => spec.typeId));
  function connect() {
    if (!root.SheetGen || typeof root.SheetGen.generate !== 'function' || root.SheetGen.g030) return false;
    const base = root.SheetGen.generate;
    root.SheetGen.generate = function (config) {
      // 그림 서식(array-picture·number-line)은 formats-pictures.js 가 조건(gen)에 맞춰 만든다.
      if (config && MINE.has(config.typeId) && PASSTHROUGH.indexOf(config.format) < 0) return generateFor(config);
      const items = base.apply(this, arguments);
      if (config && config.typeId === '0-3-0-1-t1') {
        return items.sort((a, b) => a.step - b.step || a.values[a.values.length - 1] - b.values[b.values.length - 1]);
      }
      if (config && (config.typeId === '0-3-0-3-t1' || config.typeId === '0-3-0-3-t3')) {
        document.body.dataset.g030Array = 'yes';
        installCss();
        return items.sort((a, b) => a.rows * a.cols - b.rows * b.cols || a.rows - b.rows || a.cols - b.cols);
      }
      return items;
    };
    Object.defineProperty(root.SheetGen, 'g030', { value: true });
    return true;
  }

  /* ----------------------------------------------------------------- 카탈로그 */
  const FONT_PT = { 'g030-picture-groups': 13, 'g030-picture-times': 13, 'g030-number-line': 13, 'g030-blank': 17, 'g030-match': 13, 'array-picture': 12 };
  function entryOf(spec, index) {
    const entry = {
      typeId: spec.typeId, title: spec.title, instruction: spec.instruction,
      format: spec.format, cols: spec.cols, rows: spec.rows, count: spec.cols * spec.rows,
      fontPt: FONT_PT[spec.format] || 12,
      seed: 20261030 + index, gen: spec.gen
    };
    // 문제지 칸 수는 spec 의 cols×rows 를 그대로 쓴다(자동 맞춤으로 늘리지 않는다).
    entry.autoFit = false;
    entry.maxProblems = entry.count;
    return entry;
  }
  function publish() {
    if (!Array.isArray(root.SheetCatalog)) return false;
    const have = new Set(root.SheetCatalog.map(entry => entry.typeId));
    SPECS.map(entryOf).forEach(entry => { if (!have.has(entry.typeId)) root.SheetCatalog.push(entry); });
    return true;
  }

  if (!register()) document.addEventListener('DOMContentLoaded', register, { once: true });
  if (!connect()) document.addEventListener('DOMContentLoaded', connect, { once: true });
  if (!publish()) document.addEventListener('DOMContentLoaded', publish, { once: true });

  root.G030 = {
    concepts: CONCEPTS, specs: SPECS, generateFor: generateFor, buildMatch: buildMatch,
    groupsFrame: groupsFrame, rowsFrame: rowsFrame, miniSvg: miniSvg, installCss: installCss
  };
})(globalThis);
