/* 0-4-1 기초 나눗셈 묶음 — 유형 정의 (types/g0-4-1.js)

   대상: training-roadmap-20261001/worksheet-types.json 의 id 가 `0-4-1-` 로 시작하는 개념 4개와 그 유형 14개.
     0-4-1-0 곱셈구구로 몫 구하기   t1 가로식 / t2 세로 나눗셈 / t3 세로 풀이 빈칸 / t4 잘못된 과정 고치기
     0-4-1-1 나머지의 뜻            t1 같은 수씩 묶고 남은 수 / t2 그림에서 몫과 나머지 / t3 나머지가 될 수 있는 수
     0-4-1-2 나머지가 있는 나눗셈   t1 가로식 / t2 세로 나눗셈 / t3 세로 풀이 빈칸 / t4 잘못된 과정 고치기
     0-4-1-3 몫과 나머지로 검산하기 t1 검산식 완성 / t2 계산과 검산 한 쌍 / t3 틀린 몫·나머지 고치기

   문제는 사이트의 기존 생성기(Worksheets.generate)에서 뽑는다. 새 문제 엔진을 만들지 않는다.
   기존 생성기는 이 묶음의 조건(피제수 ≤ 81 · 나누는 수 2~9 · 몫 ≤ 9 · 나머지 유무)을 보장하지 않으므로
   여기서 조건에 맞는 것만 걸러 내고, 모자라면 seed 를 바꿔 더 뽑는다 (gen-bridge.js 와 같은 방식).
   같은 typeId · 같은 seed → 같은 문제지.

   서식은 sheet/sheet.js 격자에 그린다. 공용 파일(sheet.js · formats-*.js · gen-bridge.js)은 고치지 않고,
   이 묶음에 없는 서식만 이 파일 안에서 등록한다.
     쓰는 서식   horizontal(sheet.js) · horizontal-division · long-division(formats-division.js)
                 picture-groups · picture-work(formats-pictures.js)
     새 서식     ko-division-missing · ko-division-error-fix · ko-division-choice
                 ko-division-check · ko-division-check-pair · ko-division-check-fix
*/
(function (root) {
  'use strict';

  const INK = '#111', ANSWER_INK = '#d71f10';
  const BUNDLE = /^0-4-1-/;                     // 이 파일이 맡은 묶음
  const PICTURE = ['picture-work', 'picture-groups'];   // 문제 만들기는 formats-pictures.js 가 맡는다
  const SOURCES = ['natural-div-2-1', 'natural-div-1-1'];  // 두 자리÷한 자리, 한 자리÷한 자리

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

  /* ================= 1. 문제 만들기 ================= */

  // 나눗셈 한 문항의 값. 몫·나머지·중간 곱을 미리 계산해 두면 서식마다 다시 셈하지 않아도 된다.
  function fact(a, b) {
    const quotient = Math.floor(a / b), remainder = a - quotient * b;
    return {
      a, b, op: '÷', quotient, remainder, product: b * quotient,
      answer: remainder ? quotient + ' R ' + remainder : String(quotient)
    };
  }

  // 이 묶음의 조건: 피제수 2~81, 나누는 수 2~9, 몫 1~9 (곱셈구구 안), 나머지 유무.
  // spec-natural.json 의 params(divisorMin 2 · divisorMax 9 · dividendMin 2 · dividendMax 81)를 그대로 쓴다.
  function accept(f, gen) {
    if (f.b < (gen.divisorMin || 2) || f.b > (gen.divisorMax || 9)) return false;
    if (f.a < (gen.dividendMin || 2) || f.a > (gen.dividendMax || 81)) return false;
    if (f.quotient < (gen.quotientMin || 1) || f.quotient > (gen.quotientMax || 9)) return false;
    if (gen.rule === 'exact' && f.remainder) return false;
    if (gen.rule === 'remainder' && !f.remainder) return false;
    return true;
  }

  function facts(config) {
    if (!root.Worksheets || typeof root.Worksheets.generate !== 'function') throw Error('기존 Worksheets 생성기를 찾지 못했습니다.');
    const gen = config.gen || {};
    const count = config.count || config.cols * config.rows;
    const sources = gen.sources || SOURCES;
    const chosen = [], seen = new Set();
    const easyLimit = Math.floor(count * 0.1);   // layout-rules §2: 0·1이 들어가는 쉬운 문제는 10% 이하
    let easy = 0;
    for (let batch = 0; chosen.length < count && batch < 4000; batch++) {
      const rows = root.Worksheets.generate(sources[batch % sources.length], (Number(config.seed) + batch * 104729) >>> 0, 24);
      for (const row of rows) {
        const a = Number(row.a), b = Number(row.b);
        if (!Number.isInteger(a) || !Number.isInteger(b) || b < 2) continue;
        const f = fact(a, b);
        if (!accept(f, gen)) continue;
        const key = a + ':' + b;
        if (seen.has(key)) continue;
        // 10·21 같은 두 자리 수의 숫자 0·1은 쉬운 피연산자 0·1과 다르다.
        // 이 묶음에는 0·1인 피연산자가 없으므로 몫이 1인 기본식을 쉬운 문제로 센다.
        const isEasy = f.quotient === 1;
        if (isEasy && easy >= easyLimit) continue;
        seen.add(key); chosen.push(f); if (isEasy) easy++;
        if (chosen.length === count) break;
      }
    }
    if (chosen.length < count) throw Error(config.typeId + ': 조건에 맞는 고유 문항 ' + count + '개 중 ' + chosen.length + '개만 만들었습니다.');
    chosen.sort((x, y) => x.a - y.a || x.b - y.b);   // 쉬운 것 → 어려운 것 (수 크기 기준)
    return chosen;
  }

  /* ================= 2. 세로 나눗셈 그리기 ================= */

  const CW = 16, FS = 16;                     // 한 자리 폭 / 글자 크기 (viewBox 좌표)
  const TOP_Y = 27;                           // 피제수 줄
  const GEO = {
    quotient: TOP_Y - 14, product: TOP_Y + 19, rule: TOP_Y + 23, remainder: TOP_Y + 38,
    bottom: TOP_Y + 44
  };

  function textAt(value, right, y, extra = '') {
    return `<text x="${right}" y="${y}" text-anchor="end" ${extra}>${esc(value)}</text>`;
  }
  // 빈칸으로 둘 자리는 점선 상자, 답 쪽에서는 붉은 글씨로 채운다.
  function slot(name, value, right, y, blanks, answer) {
    const width = String(value).length * CW;
    if (blanks.indexOf(name) < 0) return textAt(value, right, y);
    if (answer) return textAt(value, right, y, `fill="${ANSWER_INK}"`);
    return `<rect x="${right - width}" y="${y - FS}" width="${width}" height="${FS + 4}" fill="none" stroke="#888" stroke-width=".8" stroke-dasharray="2.5 2"/>`;
  }
  // 괄호 윗줄은 몫 글자(기준선 TOP_Y-14)와 피제수 글자 사이(y=15)에 긋는다.
  function bracket(x0, right) {
    return `<path d="M${x0 - 4} ${TOP_Y + 2}Q${x0} ${(TOP_Y + 17)/2} ${x0 - 4} 15H${right + 2}" fill="none" stroke="${INK}"/>`;
  }
  function size(divisor, dividend) {
    const x0 = String(divisor).length * CW + 14;
    const right = x0 + String(dividend).length * CW;
    return { x0, right, width: right + 6, height: GEO.bottom };
  }
  // 몫·곱·나머지까지 다 그린 한 벌. answer=false 이면 blanks 에 든 자리가 빈 상자가 된다.
  function working(f, answer, blanks = []) {
    const { x0, right, width, height } = size(f.b, f.a);
    let body = textAt(f.b, x0 - 6, TOP_Y) + bracket(x0, right) + textAt(f.a, right, TOP_Y);
    body += slot('quotient', f.quotient, right, GEO.quotient, blanks, answer);
    body += textAt('−', right - String(f.product).length * CW - 5, GEO.product);   // 빼기 자리 (formats-division.js 와 같게)
    body += slot('product', f.product, right, GEO.product, blanks, answer);
    body += `<path d="M${x0 - 1} ${GEO.rule}H${right + 2}" stroke="${INK}"/>`;
    body += slot('remainder', f.remainder, right, GEO.remainder, blanks, answer);
    return `<svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet" role="img"
      aria-label="${esc(f.a)} 나누기 ${esc(f.b)}"><g font-family="Arial,'NanumSquareRound','Malgun Gothic',sans-serif" font-size="${FS}" fill="${INK}">${body}</g></svg>`;
  }
  // 바르게 고쳐 쓸 빈 세로셈 틀 — 주어진 수만 인쇄하고 풀이 자리는 빈 줄로 둔다.
  function skeleton(f) {
    const { x0, right, width, height } = size(f.b, f.a);
    let body = textAt(f.b, x0 - 6, TOP_Y) + bracket(x0, right) + textAt(f.a, right, TOP_Y);
    // 빈 수정 풀이 영역은 보조선 없이 둔다.
    return `<svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><g font-family="Arial,'NanumSquareRound','Malgun Gothic',sans-serif" font-size="${FS}" fill="${INK}">${body}</g></svg>`;
  }
  function svgBox(html, className) {
    const box = el('div', className || 'ko41-svg');
    box.innerHTML = html;
    return box;
  }

  /* ================= 3. 틀린 풀이 만들기 (조건을 지키는 두 가지 오류) ================= */
  // 오류는 반드시 바른 값과 달라야 하고, 나머지는 0 이상 나누는 수보다 작아야 한다는 규칙을 깨야 한다.
  function wrongWorking(f, kind) {
    if (kind === 'remainder-too-big') {
      // 곱셈구구를 잘못 외워 몫을 하나 작게 셈 → 나머지가 나누는 수보다 커진다
      const q = f.quotient - 1, p = f.b * q, r = f.a - p;
      if (q >= 1 && r > f.remainder) return { a: f.a, b: f.b, quotient: q, product: p, remainder: r, note: '나머지가 나누는 수보다 큼' };
    }
    // 빼기를 잘못 셈 → 몫은 맞지만 나머지가 하나 어긋난다 (검산에서 드러난다)
    const r = f.remainder + 1 < f.b ? f.remainder + 1 : f.remainder - 1;
    if (r >= 0 && r !== f.remainder) return { a: f.a, b: f.b, quotient: f.quotient, product: f.product, remainder: r, note: '곱하고 빼는 계산을 잘못함' };
    return null;
  }

  // 검산식으로 틀린 몫이나 나머지를 고치는 유형은 검산 값이 피제수와 달라야 한다.
  // (나머지가 나누는 수보다 큰 오류는 b×몫+나머지가 그대로 피제수가 되어 검산으로 드러나지 않는다.)
  function wrongCheck(f, kind) {
    if (kind === 'quotient-slip') {
      const q = f.quotient - 1;                      // 곱셈구구를 잘못 외워 몫을 하나 작게 셈
      if (q >= 1) return { quotient: q, remainder: f.remainder, total: f.b * q + f.remainder, note: '곱셈구구를 잘못 외워 몫을 잘못 셈' };
    }
    const r = f.remainder + 1 < f.b ? f.remainder + 1 : f.remainder - 1;   // 빼기를 잘못 셈
    if (r >= 0 && r !== f.remainder) return { quotient: f.quotient, remainder: r, total: f.b * f.quotient + r, note: '곱하고 빼는 계산을 잘못함' };
    return null;
  }

  /* ================= 4. 서식 ================= */

  let styled = false;
  function css() {
    if (styled || typeof document === 'undefined') return;
    styled = true;
    const style = document.createElement('style');
    style.id = 'ko41-style';
    style.textContent = `
      .ko41 { display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; gap:.4mm; white-space:nowrap; font-variant-numeric:tabular-nums; }
      .ko41-line { line-height:1.35; }
      .ko41-line.is-answer { color:${ANSWER_INK}; }
      .ko41-blank { display:inline-block; min-width:9mm; height:1.25em; border:1px solid #555; text-align:center; vertical-align:-.28em; line-height:1.2; }
      .ko41-blank.is-answer { color:${ANSWER_INK}; border-color:${ANSWER_INK}; }
      .ko41-svg { width:100%; height:100%; min-height:0; }
      .ko41-svg svg { display:block; width:100%; height:100%; }
      .ko41-fix { display:flex; gap:1.5mm; flex:1; min-height:0; align-self:stretch; width:100%; }
      .ko41-fix > .ko41-half { flex:1; min-width:0; display:flex; flex-direction:column; }
      .ko41-half .ko41-svg { flex:1; min-height:0; }
      .ko41-note { flex:none; align-self:stretch; text-align:center; font-size:8pt; color:#444; white-space:normal; line-height:1.2; }
      .ko41-opts { display:flex; gap:3mm; align-items:center; justify-content:center; }
      .ko41-opt { display:inline-block; min-width:8mm; text-align:center; padding:0 1mm; }
      .ko41-opt.is-answer { color:${ANSWER_INK}; font-weight:bold; }
      .ko41-opt.is-answer .ko41-ring { display:inline-block; min-width:8mm; border:1px solid ${ANSWER_INK}; border-radius:50%; }
      .ko41-prompt { font-weight:bold; }
    `;
    document.head.appendChild(style);
  }

  // 세로 풀이의 빈칸 채우기 — 자리별 중간 계산을 인쇄하고 1~2곳만 빈칸으로 둔다.
  function renderMissing(cell, q, answer, config) {
    css();
    cell.append(svgBox(working(q, answer, (config.gen && config.gen.blanks) || [])));
  }
  // 잘못된 나눗셈 과정 고치기 — 왼쪽에 틀린 풀이, 오른쪽에 바르게 고쳐 쓸 빈 세로셈.
  function renderErrorFix(cell, q, answer, config) {
    css();
    const wrap = el('div', 'ko41');
    const row = el('div', 'ko41-fix');
    const left = el('div', 'ko41-half'), right = el('div', 'ko41-half');
    left.append(svgBox(working(q.wrong, answer, [])));
    // 정답지의 오른쪽은 새로 써 넣은 풀이이므로 몫·곱·나머지를 빨간색으로(나누는 수·나누어지는 수는 문제 값이라 검정).
    right.append(svgBox(answer ? working(q, true, ['quotient', 'product', 'remainder']) : skeleton(q)));
    row.append(left, right);
    wrap.append(row);
    cell.append(wrap);
  }
  // 나머지가 될 수 있는 수에 ○표 — 나누는 수만 보고 판단한다.
  function renderChoice(cell, q, answer) {
    css();
    const wrap = el('div', 'ko41');
    wrap.append(el('div', 'ko41-line ko41-prompt', '나누는 수 ' + q.b));
    const opts = el('div', 'ko41-opts');
    q.options.forEach(value => {
      const on = answer && value < q.b;
      const line = plain('span', 'ko41-opt' + (on ? ' is-answer' : ''), on ? `<span class="ko41-ring">${value}</span>` : String(value));
      opts.append(line);
    });
    wrap.append(opts);
    cell.append(wrap);
  }
  const blank = (value, answer) => `<span class="ko41-blank${answer ? ' is-answer' : ''}">${answer ? esc(value) : ''}</span>`;
  // 몫·나머지로 검산식 완성하기 — 검산식의 결과(피제수)를 쓴다.
  function renderCheck(cell, q, answer) {
    css();
    const wrap = el('div', 'ko41');
    wrap.append(plain('div', 'ko41-line', `${q.a} ÷ ${q.b} = ${q.quotient} ··· ${q.remainder}`));
    wrap.append(plain('div', 'ko41-line', `검산　${q.b} × ${q.quotient} + ${q.remainder} = ${blank(q.a, answer)}`));
    cell.append(wrap);
  }
  // 계산과 검산을 한 쌍으로 — 계산식과 검산식을 나란히 채운다.
  function renderCheckPair(cell, q, answer) {
    css();
    const wrap = el('div', 'ko41');
    wrap.append(plain('div', 'ko41-line', `${q.a} ÷ ${q.b} = ${blank(q.quotient, answer)} ··· ${blank(q.remainder, answer)}`));
    wrap.append(plain('div', 'ko41-line', `검산　${q.b} × ${blank(q.quotient, answer)} + ${blank(q.remainder, answer)} = ${blank(q.a, answer)}`));
    cell.append(wrap);
  }
  // 검산식으로 틀린 몫이나 나머지 고치기
  function renderCheckFix(cell, q, answer) {
    css();
    const wrap = el('div', 'ko41');
    wrap.append(el('div', 'ko41-line', `${q.a} ÷ ${q.b} = ${q.wrong.quotient} ··· ${q.wrong.remainder}`));
    wrap.append(el('div', 'ko41-line', `검산　${q.b} × ${q.wrong.quotient} + ${q.wrong.remainder} = ${q.wrong.total} ≠ ${q.a}`));
    wrap.append(plain('div', 'ko41-line', `바르게 ${blank(q.quotient, answer)} ··· ${blank(q.remainder, answer)}`));
    cell.append(wrap);
  }

  function register() {
    if (!root.Sheet || typeof root.Sheet.register !== 'function') return false;
    root.Sheet.register('ko-division-missing', renderMissing);
    root.Sheet.register('ko-division-error-fix', renderErrorFix);
    root.Sheet.register('ko-division-choice', renderChoice);
    root.Sheet.register('ko-division-check', renderCheck);
    root.Sheet.register('ko-division-check-pair', renderCheckPair);
    root.Sheet.register('ko-division-check-fix', renderCheckFix);
    return true;
  }

  /* ================= 5. 문항 만들기 연결 ================= */

  // 서식마다 문항에 얹을 값이 다르다. 그림 서식은 formats-pictures.js 가 만들도록 넘긴다.
  function items(config) {
    if (config.format === 'ko-division-choice') {
      // 나누는 수 2~19 까지 고르게 뽑는다(기존 생성기는 9 이하만 냄). 나머지는 0 ~ 나누는 수-1, 몫은 1~9 사이로 정한다.
      const rnd = seeded(Number(config.seed) || 1);
      const count = config.count || config.cols * config.rows;
      const pool = [];
      for (let d = 2; d <= 19; d++) pool.push(d);
      const divisors = [];
      const times = {};
      while (divisors.length < count) {
        // 나누는 수 d 의 나머지는 0~d-1 의 d가지뿐이라 d번을 넘기면 같은 문제가 반복된다.
        for (const d of shuffle(pool.slice(), rnd)) {
          if (divisors.length >= count) break;
          if ((times[d] || 0) >= d) continue;
          times[d] = (times[d] || 0) + 1; divisors.push(d);
        }
      }
      const used = new Set(), out = [];
      divisors.slice(0, count).forEach(d => {
        let r = rnd(0, d - 1), guard = 0;
        while (used.has(d + ':' + r) && guard++ < 40) r = rnd(0, d - 1);
        used.add(d + ':' + r);
        const f = fact(d * rnd(1, 9) + r, d);
        const options = [f.remainder, f.remainder ? 0 : f.b - 1, f.b + rnd(0, 1), f.b + 2 + rnd(0, 2)];
        out.push({ ...f, options: shuffle(options, rnd) });
      });
      return out.sort((x, y) => x.b - y.b || x.remainder - y.remainder);
    }
    const list = facts(config);
    if (config.format === 'ko-division-missing') return list;
    if (config.format === 'ko-division-error-fix') {
      return list.map((f, i) => {
        const wrong = wrongWorking(f, i % 2 ? 'remainder-too-big' : 'subtraction-slip');
        if (!wrong) throw Error(config.typeId + ': ' + f.a + ' ÷ ' + f.b + ' 의 틀린 풀이를 만들지 못했습니다.');
        return { ...f, wrong, note: wrong.note };
      });
    }
    if (config.format === 'ko-division-choice') {
      // 나머지가 될 수 있는 수 2개(< 나누는 수)와 될 수 없는 수 2개(≥ 나누는 수)를 섞어 놓는다.
      const rnd = seeded(Number(config.seed) || 1);
      return list.map(f => {
        const options = [f.remainder, f.remainder ? 0 : f.b - 1, f.b + rnd(0, 1), f.b + 2 + rnd(0, 2)];
        return { ...f, options: shuffle(options, rnd) };
      });
    }
    if (config.format === 'ko-division-check-fix') {
      return list.map((f, i) => {
        const wrong = wrongCheck(f, i % 2 ? 'quotient-slip' : 'remainder-slip');
        if (!wrong) throw Error(config.typeId + ': 틀린 검산식을 만들지 못했습니다.');
        return { ...f, wrong };
      });
    }
    return list;
  }

  function seeded(seed) {
    let s = seed >>> 0;
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
      const j = rnd(0, i);
      const swap = list[i]; list[i] = list[j]; list[j] = swap;
    }
    return list;
  }

  function connect() {
    if (!root.SheetGen || typeof root.SheetGen.generate !== 'function' || root.SheetGen.division0461) return false;
    const base = root.SheetGen.generate;
    root.SheetGen.generate = function (config) {
      if (config && BUNDLE.test(String(config.typeId || '')) && PICTURE.indexOf(config.format) < 0) return items(config);
      return base.apply(this, arguments);
    };
    Object.defineProperty(root.SheetGen, 'division0461', { value: true });
    return true;
  }

  /* ================= 6. 유형 등록 ================= */
  // cols·rows는 layout-rules.md §2의 서식별 최소 기준이다. sheet.js 의 autoFit 이 공간이 남으면 줄을 늘린다.
  // 0-4-1-0(곱셈구구로 몫 구하기) 가로셈은 짧은 식 기준인 4단 × 15줄 이상으로 둔다.
  //   workLines 는 세로셈의 풀이 줄 수 → sheet.js 의 최소 칸 높이 기준이 되어 자동 늘림이 멈추는 자리를 정한다.
  // 확인: tools/check-division-0461-static.py (조건·문항 수·틀린 풀이·SVG 정적 점검)
  //       sheet/check-division-0461.cjs (브라우저에서 1쪽 인쇄·칸 넘침 확인 — node 로 실행)

  const TYPES = [
    // 0-4-1-0 곱셈구구로 몫 구하기 — 곱셈구구의 72가지 나눗셈 사실, 나누어떨어지는 경우만
    { typeId: '0-4-1-0-t1', title: '곱셈구구로 몫 구하기 · 가로식', instruction: '곱셈구구를 이용하여 몫을 구하세요.',
      format: 'horizontal', cols: 4, rows: 15, fontPt: 18, seed: 20261011, gen: { rule: 'exact' } },
    { typeId: '0-4-1-0-t2', title: '곱셈구구로 몫 구하기 · 세로셈', instruction: '자리를 맞추어 몫을 구하세요.',
      format: 'long-division', cols: 4, rows: 5, fontPt: 12, seed: 20261012, workLines: 6, gen: { rule: 'exact' } },
    { typeId: '0-4-1-0-t3', title: '곱셈구구로 몫 구하기 · 세로 풀이 빈칸', instruction: '빈칸에 알맞은 수를 써넣으세요.',
      format: 'ko-division-missing', cols: 4, rows: 5, fontPt: 12, seed: 20261013, workLines: 6,
      gen: { rule: 'exact', blanks: ['quotient', 'product'] } },
    { typeId: '0-4-1-0-t4', title: '곱셈구구로 몫 구하기 · 틀린 풀이 고치기', instruction: '잘못된 곳을 찾아 바르게 고쳐 쓰세요.',
      format: 'ko-division-error-fix', cols: 3, rows: 4, fontPt: 12, seed: 20261014, gen: { rule: 'exact', quotientMin: 2 } },

    // 0-4-1-1 나머지의 뜻 — 그림으로 묶어 보고, 몫과 나머지를 구별하고, 나머지가 될 수 있는 수를 판단한다
    { typeId: '0-4-1-1-t1', title: '나머지의 뜻 · 묶고 남은 수', instruction: '같은 수씩 묶으면 몇 묶음이 되고 몇 개가 남는지 쓰세요.',
      format: 'picture-groups', cols: 3, rows: 5, fontPt: 12, seed: 20261021,
      gen: { op: '÷', divisorMin: 2, divisorMax: 6, dividendMax: 35 } },
    { typeId: '0-4-1-1-t2', title: '나머지의 뜻 · 그림에서 몫과 나머지', instruction: '그림을 보고 몫과 나머지를 쓰세요.',
      format: 'picture-work', cols: 2, rows: 6, autoFit: false, maxProblems: 12, fontPt: 12, seed: 20261022,
      gen: { op: '÷', divisorMin: 2, divisorMax: 6, dividendMax: 35 } },
    { typeId: '0-4-1-1-t3', title: '나머지의 뜻 · 나머지가 될 수 있는 수', instruction: '나머지가 될 수 있는 수에 모두 ○표 하세요.',
      format: 'ko-division-choice', cols: 3, rows: 14, fontPt: 16, seed: 20261023, autoFit: false, gen: { rule: 'any' } },

    // 0-4-1-2 나머지가 있는 나눗셈
    { typeId: '0-4-1-2-t1', title: '나머지가 있는 나눗셈 · 가로식', instruction: '몫과 나머지를 구하세요.',
      format: 'horizontal-division', cols: 3, rows: 15, fontPt: 16, seed: 20261031, gen: { rule: 'remainder' } },
    { typeId: '0-4-1-2-t2', title: '나머지가 있는 나눗셈 · 세로셈', instruction: '자리를 맞추어 몫과 나머지를 구하세요.',
      format: 'long-division', cols: 4, rows: 5, fontPt: 12, seed: 20261032, workLines: 6, gen: { rule: 'remainder' } },
    { typeId: '0-4-1-2-t3', title: '나머지가 있는 나눗셈 · 세로 풀이 빈칸', instruction: '빈칸에 알맞은 수를 써넣으세요.',
      format: 'ko-division-missing', cols: 4, rows: 5, fontPt: 12, seed: 20261033, workLines: 6,
      gen: { rule: 'remainder', blanks: ['quotient', 'remainder'] } },
    { typeId: '0-4-1-2-t4', title: '나머지가 있는 나눗셈 · 틀린 풀이 고치기', instruction: '잘못된 곳을 찾아 바르게 고쳐 쓰세요.',
      format: 'ko-division-error-fix', cols: 3, rows: 4, fontPt: 12, seed: 20261034, gen: { rule: 'remainder', quotientMin: 1 } },

    // 0-4-1-3 몫과 나머지로 검산하기 — 나머지가 있는 나눗셈으로 검산식 모양을 한 가지로 유지한다
    { typeId: '0-4-1-3-t1', title: '몫과 나머지로 검산 · 검산식 완성', instruction: '검산식을 완성하세요.',
      format: 'ko-division-check', cols: 3, rows: 14, fontPt: 14, seed: 20261041, autoFit: false, gen: { rule: 'remainder' } },
    { typeId: '0-4-1-3-t2', title: '몫과 나머지로 검산 · 계산과 검산', instruction: '계산하고 검산하세요.',
      format: 'ko-division-check-pair', cols: 2, rows: 15, fontPt: 13, seed: 20261042, autoFit: false, gen: { rule: 'remainder' } },
    { typeId: '0-4-1-3-t3', title: '검산으로 틀린 몫/나머지 고치기', instruction: '검산식으로 틀린 곳을 찾아 몫과 나머지를 바르게 고치세요.',
      format: 'ko-division-check-fix', cols: 3, rows: 4, fontPt: 13, seed: 20261043, gen: { rule: 'remainder', quotientMin: 2 } }
  ];

  function publish() {
    if (!Array.isArray(root.SheetCatalog)) return false;
    const have = new Set(root.SheetCatalog.map(entry => entry.typeId));
    for (const type of TYPES) {
      if (have.has(type.typeId)) continue;
      root.SheetCatalog.push({ ...type, count: type.cols * type.rows });
    }
    return true;
  }

  if (!register()) document.addEventListener('DOMContentLoaded', register, { once: true });
  if (!connect()) document.addEventListener('DOMContentLoaded', connect, { once: true });
  if (!publish()) document.addEventListener('DOMContentLoaded', publish, { once: true });

  root.Division0461 = { types: TYPES, facts, items, wrongWorking, working, css };
})(globalThis);
