/* 0-4-0 묶음 — 똑같이 나누기 · 같은 크기로 묶기 · 곱셈과 나눗셈의 관계 (types/g0-4-0.js)

   대상: training-roadmap-20261001/worksheet-types.json 의 id 가 `0-4-0-` 로 시작하는 개념 3개와 그 유형 9개.
     0-4-0-0 똑같이 나누어 한 몫 구하기  t1 그림에 나누어 답 쓰기 / t2 그림과 식 연결 / t3 상황을 식으로
     0-4-0-1 같은 크기로 묶어 묶음 수 구하기 t1 그림에 묶어 답 쓰기 / t2 그림과 식 연결 / t3 상황을 식으로
     0-4-0-2 곱셈과 나눗셈의 관계      t1 짝이 되는 식 쓰기 / t2 그림으로 식 완성 / t3 빈칸 채우기

   문제는 사이트의 기존 생성기(Worksheets.generate)에서 뽑는다. 새 문제 엔진을 만들지 않는다.
   기존 생성기는 이 묶음의 조건(나누어떨어짐·수 범위·그림에 담기는 크기)을 보장하지 않으므로
   조건에 맞는 것만 걸러 내고, 모자라면 seed 를 바꿔 더 뽑는다 (gen-bridge.js 와 같은 방식).
   같은 typeId · 같은 seed → 같은 문제지. 유형마다 typeId 를 seed 에 섞어 같은 개념의 유형끼리도 문제가 겹치지 않는다.

   서식은 sheet/sheet.js 격자에 그린다. 공용 파일(sheet.js · formats-*.js · gen-bridge.js · catalog.js)은 고치지 않고,
   이 묶음에 맞는 서식만 이 파일 안에서 등록한다.
     격자 서식      ko-share-picture · ko-bundle-picture · ko-array-family
                    ko-word-equation · ko-family-write · ko-inverse-blank
     한 쪽 서식     ko-picture-match  (formats-matching.js 의 MatchingSheet.formats 에 붙인다 — 선 잇기 틀 재사용)
   공용 그림 서식(picture-groups · picture-work)을 쓰지 않은 까닭: 그 서식은 이미 묶어 놓은 그림과
   `${a} ÷ ${b} = □ ··· □` 발문이라 나머지가 따라붙는다. 이 묶음은 나눗셈 준비 단계라
   ⑴ 학생이 직접 나누거나 묶는 그림(빈 접시·빈 묶음) ⑵ 나누어떨어지는 경우만 ⑶ 나머지 없는 발문이 필요하다.

   확인: python sheet/check-0-4-0.py   — type.html 과 같은 파일 순서로 그려 27장(9유형 × seed 3개)의
                                       쪽 수·칸 넘침·문항 수·조건·빈칸·정답 누출·머리말 잘림을 잰다.
         python sheet/shot-0-4-0.py    — 유형마다 문제지·정답지 화면을 check-output-040/*.png 로 남긴다.
*/
(function (root) {
  'use strict';

  const INK = '#111', ANSWER_INK = '#d71f10';
  const BUNDLE = /^0-4-0-/;                                  // 이 파일이 맡은 묶음
  const CIRCLED = '①②③④⑤⑥⑦⑧⑨⑩';
  const DIV_SOURCES = ['natural-div-1-1', 'natural-div-2-1'];  // 한 자리÷한 자리, 두 자리÷한 자리
  const MUL_SOURCES = ['natural-mul-1-1'];                    // 한 자리×한 자리(곱셈구구)

  // 이 파일은 파이썬 정적 점검(esprima)으로도 읽을 수 있게 최신 문법(?., ??)을 쓰지 않는다.
  const esc = value => String(value === undefined || value === null ? '' : value).replace(/[&<>"']/g,
    c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const el = (tag, className, value) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (value !== undefined) node.textContent = value;
    return node;
  };
  const plain = (tag, className, html) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    node.innerHTML = html;
    return node;
  };
  const expand = (base, extra) => Object.assign({}, base, extra);

  /* ================= 1. 문제 만들기 (기존 생성기에서 뽑아 조건에 맞는 것만) ================= */

  function hash(text) {
    let h = 2166136261;
    for (const ch of String(text)) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  // 같은 typeId · 같은 seed → 같은 문제. 유형마다 다른 사실을 쓰도록 typeId 를 섞는다.
  const typeSeed = config => (Math.imul((Number(config.seed) || 1) >>> 0, 2654435761) ^ hash(String(config.typeId || ''))) >>> 0;

  function seeded(seed) {
    let s = (Number(seed) >>> 0) || 1;
    return (lo, hi) => {
      s += 0x6d2b79f5;
      let t = s;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return lo + Math.floor(((t ^ t >>> 14) >>> 0) / 4294967296 * (hi - lo + 1));
    };
  }
  function shuffle(list, rnd) {
    for (let i = list.length - 1; i > 0; i--) {
      const j = rnd(0, i), swap = list[i];
      list[i] = list[j]; list[j] = swap;
    }
    return list;
  }
  /** 제자리에 그대로 남는 짝이 없게 섞는다 — 오른쪽 식을 번호 순서만 보고 이을 수 없게. */
  function derange(count, rnd) {
    const order = [];
    for (let i = 0; i < count; i++) order.push(i);
    for (let attempt = 0; attempt < 200; attempt++) {
      shuffle(order, rnd);
      let fixed = false;
      for (let i = 0; i < count; i++) if (order[i] === i) fixed = true;
      if (!fixed) return order;
    }
    for (let i = 0; i < count; i++) order[i] = (i + 1) % count;   // 마지막 안전장치(한 칸씩 밀기)
    return order;
  }

  /**
   * 기존 생성기에서 24행씩 뽑아 조건에 맞는 것만 모은다. 모자라면 seed 를 바꿔 더 뽑는다.
   * factOf(row) → 문항 값, accept(fact) → 이 묶음의 조건 검사.
   */
  function collect(config, accept, factOf, sources) {
    if (!root.Worksheets || typeof root.Worksheets.generate !== 'function') throw Error('기존 Worksheets 생성기를 찾지 못했습니다.');
    const count = config.count || (config.cols * config.rows);
    const seed = typeSeed(config);
    const chosen = [], seen = new Set();
    for (let batch = 0; chosen.length < count && batch < 4000; batch++) {
      const source = sources[batch % sources.length];
      let rows;
      try { rows = root.Worksheets.generate(source, (seed + batch * 104729) >>> 0, 24); }
      catch (error) { rows = []; }
      for (const row of rows) {
        const fact = factOf(row);
        if (!fact || !accept(fact)) continue;
        const key = fact.a + ':' + fact.b;
        if (seen.has(key)) continue;
        seen.add(key); chosen.push(fact);
        if (chosen.length === count) break;
      }
    }
    if (chosen.length < count) throw Error(config.typeId + ': 조건에 맞는 고유 문항 ' + count + '개 중 ' + chosen.length + '개만 만들었습니다.');
    return chosen;
  }

  // 나눗셈: 나누어떨어지는 경우만 쓴다(나눗셈 준비 단계라 나머지는 0-4-1 묶음에서 다룬다).
  // 나누는 수 ≥ 2, 몫 ≥ 2 라서 0·1 이 들어가는 쉬운 문제는 한 장에 한 문항도 없다(layout-rules §2의 10% 이하 규칙).
  function divisionAccept(gen) {
    const divisorMin = gen.divisorMin || 2, divisorMax = gen.divisorMax || 9;
    const quotientMin = gen.quotientMin || 2, quotientMax = gen.quotientMax || 9;
    const dividendMin = gen.dividendMin || 2, dividendMax = gen.dividendMax || 81;
    return fact => fact.remainder === 0
      && fact.b >= divisorMin && fact.b <= divisorMax
      && fact.quotient >= quotientMin && fact.quotient <= quotientMax
      && fact.a >= dividendMin && fact.a <= dividendMax;
  }
  const divisionFact = row => {
    const a = Number(row.a), b = Number(row.b);
    if (!Number.isInteger(a) || !Number.isInteger(b) || b < 2) return null;
    return { a: a, b: b, quotient: Math.floor(a / b), remainder: a % b, op: '÷' };
  };
  // 곱셈: 곱셈구구 안에서만(2~9). 두 수가 같으면 짝이 되는 나눗셈식이 한 가지뿐이라 뺀다.
  function multiplicationAccept(gen) {
    const factorMin = gen.factorMin || 2, factorMax = gen.factorMax || 9;
    return fact => fact.a >= factorMin && fact.a <= factorMax
      && fact.b >= factorMin && fact.b <= factorMax
      && (!gen.distinct || fact.a !== fact.b);
  }
  const multiplicationFact = row => {
    const a = Number(row.a), b = Number(row.b);
    if (!Number.isInteger(a) || !Number.isInteger(b)) return null;
    return { a: a, b: b, product: a * b, op: '×' };
  };

  const bySize = (x, y) => x.a - y.a || x.b - y.b;
  const byProduct = (x, y) => x.product - y.product || x.a - y.a || x.b - y.b;

  function divisionItems(config) {
    const list = collect(config, divisionAccept(config.gen || {}), divisionFact, DIV_SOURCES);
    list.sort(bySize);
    return list;
  }
  function multiplicationItems(config) {
    const list = collect(config, multiplicationAccept(config.gen || {}), multiplicationFact, MUL_SOURCES);
    list.sort(byProduct);
    return list;
  }

  /* ================= 2. 그림 재료 (인쇄용 인라인 SVG, 흑백) ================= */

  const W = 200, H = 150;
  const svgOf = (body, vw, vh) => '<svg viewBox="0 0 ' + (vw || W) + ' ' + (vh || H) + '" preserveAspectRatio="xMidYMid meet" aria-hidden="true">' + body + '</svg>';
  const rectOf = (x, y, w, h, extra) => '<rect x="' + Number(x).toFixed(1) + '" y="' + Number(y).toFixed(1) +
    '" width="' + Number(w).toFixed(1) + '" height="' + Number(h).toFixed(1) + '" ' + (extra || '') + '/>';
  const boxOf = (x, y, w, h, dash) => rectOf(x, y, w, h, 'fill="none" stroke="' + INK + '" stroke-width="1.4"' + (dash ? ' stroke-dasharray="4 3"' : ''));
  const roundOf = (x, y, w, h, color) => rectOf(x, y, w, h, 'rx="5" fill="none" stroke="' + color + '" stroke-width="1.5"');
  const dotOf = (cx, cy, r, color) => !color ? '<image href="vendor/art/' + (globalThis.IconPool ? globalThis.IconPool.current() : '1f34e') + '.svg" x="' + (Number(cx) - r * 1.3).toFixed(1) + '" y="' + (Number(cy) - r * 1.3).toFixed(1) + '" width="' + (r * 2.6).toFixed(1) + '" height="' + (r * 2.6).toFixed(1) + '" style="filter:saturate(2) contrast(1.2) brightness(.92) drop-shadow(0 0 .7px #222)"/>' : '<circle cx="' + Number(cx).toFixed(1) + '" cy="' + Number(cy).toFixed(1) +
    '" r="' + Number(r).toFixed(1) + '" fill="' + (color || INK) + '"/>';

  /** 낱개를 격자로 그린다(perRow개씩, 0이면 아이콘이 가장 커지는 줄 수를 고른다). 상자 안에 담을 때도 쓴다. */
  function dotGrid(x, y, w, h, count, perRow) {
    if (count <= 0) return '';
    let cols = perRow;
    if (!cols) {
      let bestSize = -1;
      for (let c = 1; c <= count; c++) {
        const size = Math.min(w / c, h / Math.ceil(count / c));
        if (size > bestSize + 0.01) { bestSize = size; cols = c; }
      }
    }
    cols = Math.max(1, cols);
    const rows = Math.max(1, Math.ceil(count / cols));
    const cw = w / cols, ch = h / rows;
    const r = Math.max(1.4, Math.min(11, Math.min(cw, ch) * 0.34));
    let body = '';
    for (let i = 0; i < count; i++) {
      body += dotOf(x + cw * ((i % cols) + 0.5), y + ch * (Math.floor(i / cols) + 0.5), r);
    }
    return body;
  }
  // 상자 그릇(접시·묶음) b개를 한 줄로. 답 쪽에는 상자마다 quotient개를 담아 보여 준다.
  function boxRow(x, y, w, h, boxes, perBox, answer, gap) {
    const space = gap === undefined ? 6 : gap;
    const bw = (w - space * (boxes - 1)) / boxes;
    let body = '';
    for (let i = 0; i < boxes; i++) {
      const bx = x + i * (bw + space);
      body += boxOf(bx, y, bw, h, false);
      if (answer) body += dotGrid(bx + 2, y + 2, bw - 4, h - 4, perBox, 0);
    }
    return body;
  }

  /** t1(똑같이 나누기) 그림 — 위: 나눌 낱개, 아래: 빈 접시 b개. 답 쪽에는 접시마다 quotient개. */
  function shareBody(fact, answer) {
    let body = dotGrid(6, 2, 218, 46, fact.a, 0);
    body += boxRow(6, 54, 218, 44, fact.b, fact.quotient, answer);
    return body;
  }
  /** t1(같은 크기로 묶기) 그림 — 낱개 a개를 b개씩 묶는다. 답 쪽에는 묶음마다 붉은 테두리. */
  function bundleBody(fact, answer) {
    // 한 줄에 묶음이 정수 개 들어가게(열 수 = 묶음 크기 × k) 아이콘이 가장 크게 들어가는 k 를 골라 위아래까지 크게 쓴다.
    const groups = fact.quotient, size = fact.b, area = { x: 4, y: 4, w: 222, h: 92 };
    let best = null;
    for (let k = 1; k <= groups; k++) {
      const cols = size * k, rows = Math.ceil(groups / k);
      const cell = Math.min(area.w / cols, area.h / rows, 34);
      if (!best || cell > best.cell + 0.01) best = { k, cols, rows, cell };
    }
    const { k, cols, rows, cell } = best;
    const x0 = area.x + (area.w - cols * cell) / 2, y0 = area.y + (area.h - rows * cell) / 2;
    const r = cell / 2.6 * 0.96;
    let body = '';
    for (let g = 0; g < groups; g++) {
      const gx = x0 + (g % k) * size * cell, gy = y0 + Math.floor(g / k) * cell;
      for (let i = 0; i < size; i++) body += dotOf(gx + cell * (i + .5), gy + cell * .5, r);
      if (answer) body += roundOf(gx + 1.5, gy + 1.5, size * cell - 3, cell - 3, ANSWER_INK);
    }
    return body;
  }
  /** t2(그림으로 식 완성) 그림 — rows × cols 낱개 배열. */
  function arrayBody(fact) {
    const w = 196, h = 72, x = 12, y = 6;
    const cw = w / fact.b, ch = h / fact.a;
    let body = boxOf(x - 2, y - 2, w + 4, h + 4, false);
    for (let i = 1; i < fact.a; i++) body += rectOf(x, y + ch * i - .5, w, 1, 'fill="#ddd"');
    for (let i = 1; i < fact.b; i++) body += rectOf(x + cw * i - .5, y, 1, h, 'fill="#ddd"');
    body += dotGrid(x, y, w, h, fact.a * fact.b, fact.b);
    return body;
  }
  /** 연결용 작은 그림 — 상자 boxes개에 낱개 perBox개씩(가로 한 줄). */
  function smallPicture(boxes, perBox) {
    const w = 240, h = 110, gap = 6;
    const bw = (w - gap * (boxes + 1)) / boxes;
    let body = '';
    for (let i = 0; i < boxes; i++) {
      const bx = gap + i * (bw + gap);
      body += rectOf(bx, 5, bw, h - 10, 'fill="none" stroke="' + INK + '" stroke-width="2"');
      body += dotGrid(bx + 3, 8, bw - 6, h - 16, perBox, 0);
    }
    return '<svg viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="xMidYMid meet" aria-hidden="true">' + body + '</svg>';
  }

  /* ================= 3. 이 묶음용 CSS ================= */

  let styled = false;
  // 머리말이 두 줄이 되거나 제목이 잘리지 않도록 이 묶음 서식에서만 조금 작게 쓴다.
  const FORMAT_KEYS = ['ko-share-picture', 'ko-bundle-picture', 'ko-array-family',
    'ko-word-equation', 'ko-family-write', 'ko-inverse-blank', 'ko-picture-match'];
  const HEAD_SMALL = FORMAT_KEYS.map(key => 'body[data-format="' + key + '"] .sheet-head,body[data-format="' + key + '"] .sheet-title')
    .join(',') + '{font-size:9.5pt;}';
  function installCss() {
    if (styled || typeof document === 'undefined') return;
    styled = true;
    const style = document.createElement('style');
    style.id = 'ko040-style';
    style.textContent = [
      '.ko040-pic{display:flex;flex-direction:column;height:100%;min-height:0;white-space:normal;}',
      '.ko040-pic svg{flex:1;min-height:0;width:100%;display:block;}',
      '.ko040-foot{flex:none;padding-top:.4mm;font-size:1em;line-height:1.35;white-space:nowrap;text-align:center;}',
      '.ko040-foot .ko040-blank{min-width:7mm;}',
      '.ko040-blank{display:inline-block;min-width:9mm;height:1.2em;border:1px solid #555;text-align:center;vertical-align:-.25em;line-height:1.15;}',
      '.ko040-ink{color:' + ANSWER_INK + ';}',
      '.ko040-blank.ko040-ink{border-color:' + ANSWER_INK + ';}',
      // 한 칸 가운데에 내용을 놓아 아래쪽 빈 공간이 생기지 않게 한다(0-3-1 묶음과 같은 방법).
      '.ko040-mid{position:absolute;left:6mm;right:1mm;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;align-items:center;gap:1mm;line-height:1.35;white-space:normal;word-break:keep-all;}',
      '.ko040-mid>.ko040-say,.ko040-mid>.ko040-room{align-self:stretch;}',
      '.ko040-grp{display:flex;flex-direction:column;align-items:flex-start;gap:1.4mm;}',
      '.ko040-grp .ko040-write{flex:none;min-width:30mm;}',
      '.ko040-say{font-size:.98em;}',
      '.ko040-room{display:flex;align-items:center;gap:1.5mm;white-space:nowrap;}',
      '.ko040-label{font-size:.9em;color:#555;flex:none;}',
      '.ko040-write{display:inline-block;flex:1;min-width:16mm;height:1.15em;border-bottom:1px solid #555;}',
      '.ko040-eq{font-variant-numeric:tabular-nums;white-space:nowrap;}',
      // 선 잇기: 왼쪽 48% · 오른쪽 58% 자리에 ○, 가운데 10%는 선을 긋는 자리.
      '.ko040-pairs{position:absolute;inset:0;display:grid;grid-template-columns:48% 10% 42%;}',
      '.ko040-pairs .mt-pair{overflow:visible;}',
      '.ko040-match-pic{display:flex;align-items:center;justify-content:flex-end;min-width:0;white-space:nowrap;overflow:visible;}',
      '.ko040-match-pic svg{width:100%;height:auto;max-height:17mm;flex:none;display:block;}',
      '.ko040-cap{font-size:.9em;color:#222;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
      // 유형 이름이 길어 머리말에서 잘리지 않도록 이 묶음 서식일 때만 조금 작게 쓴다.
      HEAD_SMALL
    ].join('');
    document.head.appendChild(style);
  }

  /* ================= 4. 격자 서식 ================= */

  const blankHTML = (value, answer) => '<span class="ko040-blank' + (answer ? ' ko040-ink' : '') + '">' +
    (answer ? esc(value) : '') + '</span>';

  // 똑같이 나누기 — 낱개를 접시 b개에 똑같이 나눈다. 답 쪽에는 접시마다 quotient개가 담긴다.
  function renderSharePicture(cell, fact, answer) {
    installCss();
    const wrap = el('div', 'ko040-pic');
    wrap.innerHTML = svgOf(shareBody(fact, answer), 230, 100) +
      '<div class="ko040-foot">' + fact.a + '개를 ' + fact.b + '접시에 똑같이 나누면<br>한 접시에 ' +
      blankHTML(fact.quotient, answer) + '개</div>';
    cell.append(wrap);
  }
  // 같은 크기로 묶기 — 낱개를 b개씩 묶는다. 답 쪽에는 묶음마다 테두리가 그려진다.
  function renderBundlePicture(cell, fact, answer) {
    installCss();
    const wrap = el('div', 'ko040-pic');
    wrap.innerHTML = svgOf(bundleBody(fact, answer), 230, 100) +
      '<div class="ko040-foot">' + fact.a + '개를 ' + fact.b + '개씩 묶으면<br>몇 묶음일까요? ' +
      blankHTML(fact.quotient, answer) + '묶음</div>';
    cell.append(wrap);
  }
  // 그림 하나에 연결된 식 완성하기 — 배열 그림을 보고 곱셈식·나눗셈식 세 줄을 채운다.
  // 세 줄이 모두 빈칸이라 어느 줄에도 답이 인쇄되어 있지 않다.
  function renderArrayFamily(cell, fact, answer) {
    installCss();
    const wrap = el('div', 'ko040-pic');
    wrap.innerHTML = svgOf(arrayBody(fact), 220, 84) +
      '<div class="ko040-foot ko040-eq">' +
        blankHTML(fact.a, answer) + ' × ' + blankHTML(fact.b, answer) + ' = ' + blankHTML(fact.a * fact.b, answer) + '<br>' +
        blankHTML(fact.a * fact.b, answer) + ' ÷ ' + blankHTML(fact.a, answer) + ' = ' + blankHTML(fact.b, answer) + '<br>' +
        blankHTML(fact.a * fact.b, answer) + ' ÷ ' + blankHTML(fact.b, answer) + ' = ' + blankHTML(fact.a, answer) +
      '</div>';
    cell.append(wrap);
  }
  // 짧은 상황을 나눗셈식으로 나타내기 — 문장을 읽고 나눗셈식을 쓴다(답은 식 전체).
  function renderWordEquation(cell, fact, answer) {
    installCss();
    const box = el('div', 'ko040-mid');
    box.append(el('div', 'ko040-say', fact.sentence));
    const room = el('div', 'ko040-room');
    room.append(el('span', 'ko040-label', '나눗셈식'));
    room.append(plain('span', 'ko040-write' + (answer ? ' ko040-ink' : ''),
      answer ? esc(fact.a + ' ÷ ' + fact.b + ' = ' + fact.quotient) : ''));
    box.append(room);
    cell.append(box);
  }
  // 같은 수로 짝이 되는 식 쓰기 — 주어진 곱셈식과 같은 수를 쓰는 나눗셈식 두 개를 쓴다.
  function renderFamilyWrite(cell, fact, answer) {
    installCss();
    const box = el('div', 'ko040-mid');
    const grp = el('div', 'ko040-grp');
    box.append(grp);
    grp.append(plain('div', 'ko040-eq', fact.a + ' × ' + fact.b + ' = ' + fact.product));
    for (const divisor of [fact.a, fact.b]) {
      const room = el('div', 'ko040-room');
      room.append(el('span', 'ko040-label', '나눗셈식'));
      room.append(plain('span', 'ko040-write' + (answer ? ' ko040-ink' : ''),
        answer ? esc(fact.product + ' ÷ ' + divisor + ' = ' + (fact.product / divisor)) : ''));
      grp.append(room);
    }
    cell.append(box);
  }
  // 역연산 관계의 빈칸 채우기 — 곱셈식과 나눗셈식의 빈칸이 서로 같은 수가 된다.
  // 두 줄 어디에도 빈칸의 답이 인쇄되어 있지 않다(주어진 수는 피제수와 한 요인뿐).
  function renderInverseBlank(cell, fact, answer) {
    installCss();
    const box = el('div', 'ko040-mid ko040-eq');
    const blank = value => blankHTML(value, answer);
    const grp = el('div', 'ko040-grp');
    box.append(grp);
    if (fact.blankOf === 'a') {
      grp.append(plain('div', '', blank(fact.a) + ' × ' + fact.b + ' = ' + fact.product));
      grp.append(plain('div', '', fact.product + ' ÷ ' + blank(fact.a) + ' = ' + fact.b));
    } else {
      grp.append(plain('div', '', fact.a + ' × ' + blank(fact.b) + ' = ' + fact.product));
      grp.append(plain('div', '', fact.product + ' ÷ ' + fact.a + ' = ' + blank(fact.b)));
    }
    cell.append(box);
  }

  /* ================= 5. 선 잇기 서식 (formats-matching.js 의 틀에 붙인다) ================= */

  // 그림 쪽 설명은 묶음 수(접시 수)만 밝히고 전체 수는 밝히지 않는다 — 그림을 세어야 식을 고를 수 있다.
  const captionOf = (config, fact) => (config.gen && config.gen.picture === 'bundle'
    ? fact.b + '개씩 묶었습니다'
    : fact.b + '접시에 똑같이 나누었습니다');

  function buildPictureMatch(config) {
    const gen = config.gen || {};
    const bundles = Math.max(1, Number(gen.bundles) || 3);
    const perBundle = Math.max(4, Number(gen.perBundle) || 6);
    const total = bundles * perBundle;
    const list = collect(expand(config, { count: total }), divisionAccept(gen), divisionFact, DIV_SOURCES);
    const rnd = seeded(typeSeed(config) ^ 0x5bf03635);
    const items = [];
    for (let b = 0; b < bundles; b++) {
      const chunk = list.slice(b * perBundle, (b + 1) * perBundle);
      items.push({ kind: 'bundle', caption: '', pairs: chunk, order: derange(chunk.length, rnd), rowsWeight: perBundle });
    }
    return { items: items, layout: { cols: bundles, rows: perBundle, count: total }, pairs: total };
  }

  function renderPictureMatch(config, item, isAnswer) {
    installCss();
    const count = item.pairs.length;
    // 동그라미를 '3개씩 묶었습니다' 글자 바로 뒤에 붙인다(compact 배치: 그림 32mm + 글자 폭이 고정이라 점 위치가 줄마다 같다).
    const wl = 38, wr = 21, gap = 6;
    const wrap = el('div', 'mt-pairs-wrap mt-compact');
    wrap.style.setProperty('--wl', wl + 'mm'); wrap.style.setProperty('--wr', wr + 'mm'); wrap.style.setProperty('--gap', gap + 'mm');
    const grid = el('div', 'mt-pairs');
    grid.style.gridTemplateRows = 'repeat(' + count + ', minmax(0, 1fr))';
    const rowOf = [];
    item.order.forEach((pairIndex, row) => { rowOf[pairIndex] = row; });
    item.pairs.forEach((fact, index) => {
      const left = el('div', 'mt-pair mt-left');
      left.append(el('span', 'mt-idx', (index + 1) + '.'));
      left.append(plain('span', 'mt-text ko040-match-pic',
        (config.gen && config.gen.picture === 'bundle' ? smallPicture(fact.quotient, fact.b) : smallPicture(fact.b, fact.quotient))));
      left.append(el('span', 'mt-mark'));
      const right = el('div', 'mt-pair mt-right');
      right.append(el('span', 'mt-mark'));   // 오른쪽에는 번호를 찍지 않는다(번호만 보고 이을 수 없게)
      right.append(el('span', 'mt-text ko040-eq', fact.a + ' ÷ ' + fact.b + ' = ' + fact.quotient));
      grid.append(left, right);
    });
    wrap.append(grid);
    if (isAnswer) {
      const T = wl + wr + 18 + gap, x1 = ((wl + 7.5) / T * 1000).toFixed(1), x2 = ((wl + 9 + gap + 1.5) / T * 1000).toFixed(1);
      const lines = item.pairs.map((_, index) => '<line x1="' + x1 + '" y1="' + ((index + .5) / count * 1000).toFixed(1) +
        '" x2="' + x2 + '" y2="' + ((rowOf[index] + .5) / count * 1000).toFixed(1) + '"/>').join('');
      wrap.append(plain('div', 'mt-lines', '<svg viewBox="0 0 1000 1000" preserveAspectRatio="none">' + lines + '</svg>'));
    }
    return wrap;
  }

  /* ================= 6. 문항 만들기 연결 ================= */

  const SHARE_NOUNS = [
    { name: '사탕', unit: '개' }, { name: '귤', unit: '개' }, { name: '구슬', unit: '개' },
    { name: '쿠키', unit: '개' }, { name: '도토리', unit: '개' }, { name: '초콜릿', unit: '개' },
    { name: '색연필', unit: '자루' }, { name: '색종이', unit: '장' }, { name: '스티커', unit: '장' },
    { name: '동화책', unit: '권' }, { name: '장미', unit: '송이' }, { name: '호두', unit: '개' }
  ];
  const SHARE_WHO = [
    { key: '명에게', one: '한 명에게는', verb: '나누어 주면' },
    { key: '접시에', one: '한 접시에는', verb: '나누어 담으면' },
    { key: '봉지에', one: '한 봉지에는', verb: '나누어 담으면' },
    { key: '바구니에', one: '한 바구니에는', verb: '나누어 담으면' }
  ];
  const GROUP_NOUNS = [
    { name: '구슬', unit: '개' }, { name: '딱지', unit: '장' }, { name: '연필', unit: '자루' },
    { name: '사탕', unit: '개' }, { name: '바둑돌', unit: '개' }, { name: '색종이', unit: '장' },
    { name: '콩', unit: '개' }, { name: '클립', unit: '개' }, { name: '나무 막대', unit: '개' },
    { name: '구운 밤', unit: '개' }
  ];
  const GROUP_HOW = [
    '씩 묶으면 몇 묶음이 될까요?',
    '씩 한 봉지에 담으면 몇 봉지가 될까요?',
    '씩 한 상자에 넣으면 몇 상자가 될까요?'
  ];
  // 조사 선택은 수가 아니라 단위말의 마지막 음절 받침에 따른다.
  const objectParticle = unit => (unit === '장' || unit === '권') ? '을' : '를';
  function shareSentence(fact, index) {
    const noun = SHARE_NOUNS[index % SHARE_NOUNS.length];
    const who = SHARE_WHO[index % SHARE_WHO.length];
    return noun.name + ' ' + fact.a + noun.unit + objectParticle(noun.unit) + ' ' + fact.b + who.key + ' 똑같이 ' + who.verb + ' ' +
      who.one + ' 몇 ' + noun.unit + '일까요?';
  }
  function groupSentence(fact, index) {
    const noun = GROUP_NOUNS[index % GROUP_NOUNS.length];
    return noun.name + ' ' + fact.a + noun.unit + objectParticle(noun.unit) + ' ' + fact.b + noun.unit + GROUP_HOW[index % GROUP_HOW.length];
  }

  function items(config) {
    const format = config.format;
    if (format === 'ko-share-picture') return divisionItems(config);
    if (format === 'ko-bundle-picture') return divisionItems(config);
    if (format === 'ko-word-equation') {
      const share = String(config.typeId || '').indexOf('0-4-0-0') === 0;
      return divisionItems(config).map((fact, index) => expand(fact, {
        sentence: share ? shareSentence(fact, index) : groupSentence(fact, index),
        mode: share ? 'share' : 'group'
      }));
    }
    if (format === 'ko-family-write') return multiplicationItems(config);
    if (format === 'ko-array-family') return multiplicationItems(config);
    if (format === 'ko-inverse-blank') {
      return multiplicationItems(config).map((fact, index) => expand(fact, { blankOf: index % 2 ? 'a' : 'b' }));
    }
    throw Error('이 묶음의 서식이 아닙니다: ' + format);
  }

  const RENDERERS = {
    'ko-share-picture': renderSharePicture,
    'ko-bundle-picture': renderBundlePicture,
    'ko-array-family': renderArrayFamily,
    'ko-word-equation': renderWordEquation,
    'ko-family-write': renderFamilyWrite,
    'ko-inverse-blank': renderInverseBlank
  };

  function register() {
    if (!root.Sheet || typeof root.Sheet.register !== 'function') return false;
    installCss();
    for (const key of Object.keys(RENDERERS)) root.Sheet.register(key, RENDERERS[key]);
    if (root.MatchingSheet && root.MatchingSheet.formats) {
      root.MatchingSheet.formats['ko-picture-match'] = {
        page: 'blocks', title: '그림과 나눗셈식 연결하기',
        build: buildPictureMatch,
        render: (config, item, isAnswer) => renderPictureMatch(config, item, isAnswer)
      };
    }
    return true;
  }

  /* ================= 7. 유형 등록 ================= */
  // cols·rows 는 layout-rules.md §2 의 서식별 최소 기준이다. sheet.js 의 autoFit 이 공간이 남으면 줄을 늘린다.
  //   그림 3단×5줄=15 · 선 잇기 6~8쌍×3묶음=18 · 빈칸 식 3단×14줄=42 를 그대로 쓰고,
  //   문장형(2단×12줄=24)은 §2 의 '가로셈 두~세 자리 3단×15줄=45'보다 문장 두 줄이 들어가는 만큼 줄여 잡았다.
  //   나눗셈 준비 단계(3~9세)라 본문 12pt 를 쓰고 한 칸에 그림·문장이 들어가게 했다.

  const TYPES = [
    // 0-4-0-0 똑같이 나누어 한 몫 구하기 — 나누어떨어지는 경우만. 접시 수 ≤ 6, 한 접시 ≤ 6개(그림에 담기는 크기).
    { typeId: '0-4-0-0-t1', title: '똑같이 나누기 · 그림에 나누기', format: 'ko-share-picture',
      cols: 3, rows: 5, fontPt: 13, seed: 20261001, instruction: '그림을 살펴보고 알맞은 답을 쓰세요.',
      gen: { divisorMin: 2, divisorMax: 6, quotientMin: 2, quotientMax: 6, dividendMax: 24 } },
    { typeId: '0-4-0-0-t2', title: '똑같이 나누기 · 그림과 식 연결', format: 'ko-picture-match',
      cols: 4, rows: 5, fontPt: 12, seed: 20261002, instruction: '그림과 알맞은 나눗셈식을 선으로 연결하세요.',
      gen: { picture: 'share', bundles: 4, perBundle: 5, divisorMin: 2, divisorMax: 6, quotientMin: 2, quotientMax: 6, dividendMax: 36 } },
    { typeId: '0-4-0-0-t3', title: '똑같이 나누기 · 상황을 식으로', format: 'ko-word-equation',
      cols: 2, rows: 10, autoFit: false, maxProblems: 20, fontPt: 12, seed: 20261003, instruction: '문제를 읽고 나눗셈식으로 나타내세요.',
      gen: { divisorMin: 2, divisorMax: 6, quotientMin: 2, quotientMax: 12, dividendMax: 36 } },

    // 0-4-0-1 같은 크기로 묶어 묶음 수 구하기 — 묶음 크기 ≤ 8, 묶음 수 ≤ 6.
    { typeId: '0-4-0-1-t1', title: '같은 크기로 묶기 · 그림 묶기', format: 'ko-bundle-picture',
      cols: 3, rows: 5, fontPt: 13, seed: 20261011, instruction: '그림을 살펴보고 알맞은 답을 쓰세요.',
      gen: { divisorMin: 2, divisorMax: 8, quotientMin: 2, quotientMax: 6, dividendMax: 32 } },
    { typeId: '0-4-0-1-t2', title: '같은 크기로 묶기 · 그림 연결', format: 'ko-picture-match',
      cols: 4, rows: 5, fontPt: 12, seed: 20261012, instruction: '그림과 알맞은 나눗셈식을 선으로 연결하세요.',
      gen: { picture: 'bundle', bundles: 4, perBundle: 5, divisorMin: 2, divisorMax: 8, quotientMin: 2, quotientMax: 5, dividendMax: 40 } },
    { typeId: '0-4-0-1-t3', title: '같은 크기로 묶기 · 상황 식으로', format: 'ko-word-equation',
      cols: 2, rows: 10, autoFit: false, maxProblems: 20, fontPt: 12, seed: 20261013, instruction: '문제를 읽고 나눗셈식으로 나타내세요.',
      gen: { divisorMin: 2, divisorMax: 6, quotientMin: 2, quotientMax: 12, dividendMax: 36 } },

    // 0-4-0-2 곱셈과 나눗셈의 관계 — 곱셈구구 안에서만 쓰고, 두 수가 같은 식은 뺀다(짝이 한 가지뿐).
    { typeId: '0-4-0-2-t1', title: '곱셈과 나눗셈 · 짝이 되는 식', format: 'ko-family-write',
      cols: 3, rows: 8, autoFit: false, maxProblems: 24, fontPt: 14, seed: 20261021, instruction: '주어진 식과 같은 수로 짝이 되는 나눗셈식을 모두 쓰세요.',
      gen: { factorMin: 2, factorMax: 9, distinct: true } },
    { typeId: '0-4-0-2-t2', title: '곱셈과 나눗셈 · 그림으로 식', format: 'ko-array-family',
      cols: 3, rows: 5, fontPt: 13, seed: 20261022, instruction: '그림을 보고 곱셈식과 나눗셈식을 완성하세요.',
      gen: { factorMin: 2, factorMax: 6, distinct: true } },
    { typeId: '0-4-0-2-t3', title: '곱셈과 나눗셈 · 빈칸 채우기', format: 'ko-inverse-blank',
      cols: 3, rows: 14, fontPt: 15, seed: 20261023, instruction: '빈칸에 알맞은 수를 써넣으세요.',
      gen: { factorMin: 2, factorMax: 9, distinct: true } }
  ];

  function publish() {
    if (!Array.isArray(root.SheetCatalog)) return false;
    const have = new Set(root.SheetCatalog.map(entry => entry.typeId));
    for (const type of TYPES) {
      if (have.has(type.typeId)) continue;
      root.SheetCatalog.push(expand(type, { count: type.cols * type.rows }));
    }
    return true;
  }

  if (!register()) document.addEventListener('DOMContentLoaded', register, { once: true });

  /* --------- 문제 생성 연결(gen-bridge.js 와 같은 방식으로 감싼다) --------- */
  function connect() {
    if (!root.SheetGen || typeof root.SheetGen.generate !== 'function' || root.SheetGen.division040) return false;
    const base = root.SheetGen.generate;
    root.SheetGen.generate = function (config) {
      const matched = config && BUNDLE.test(String(config.typeId || ''))
        && !(root.MatchingSheet && root.MatchingSheet.formats && root.MatchingSheet.formats[config.format]);
      if (matched) return items(config);
      return base.apply(this, arguments);
    };
    Object.defineProperty(root.SheetGen, 'division040', { value: true });
    return true;
  }

  if (!publish()) document.addEventListener('DOMContentLoaded', publish, { once: true });
  if (!connect()) document.addEventListener('DOMContentLoaded', connect, { once: true });
  root.SheetTypes040 = { items: items, TYPES: TYPES, divisionItems: divisionItems, multiplicationItems: multiplicationItems };
})(globalThis);
