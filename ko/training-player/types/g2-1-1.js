/* 묶음 2-1-1 — 소수 덧셈(같은 자릿수) 유형 20종 (제작자 A, 2026-10-01)

   개념(prototypes\training-roadmap-20261001\worksheet-types.json):
     2-1-1-0  소수 첫째 자리 덧셈 — 받아올림 없음   (받아올림 0회)
     2-1-1-1  소수 첫째 자리 덧셈 — 받아올림 있음   (받아올림 1~2회)
     2-1-1-2  소수 둘째 자리 덧셈 — 받아올림 없음   (받아올림 0회)
     2-1-1-3  소수 둘째 자리 덧셈 — 받아올림 있음   (받아올림 1~3회)
     2-1-1-4  소수 셋째 자리 덧셈                   (제한 없음)
   유형(개념마다 4종): ① 가로셈 ② 세로셈 ③ 세로 풀이의 빈칸 채우기 ④ 잘못된 계산 과정 고치기

   - 문제와 정답은 사이트의 기존 생성기(Worksheets.generate)에서 가져온다.
     소수 한·두 자리는 types.js 의 decimal-add-1 / decimal-add-2 를 쓰고,
     소수 세 자리는 types.js 에 생성기가 없어 사이트가 4-2-3 에서 쓰는 방식
     (DrillCatalog.profiles + drill-engine 의 decimalPlaces:[3,3])을 그대로 쓴다.
     새 문제 엔진은 만들지 않는다.
   - 개념 이름의 조건(소수 자릿수·받아올림 횟수)에 맞지 않는 문항은 버리고 더 뽑는다.
     받아올림 횟수는 소수 자릿값(정수로 맞춘 값) 기준으로 센다.
     명세 operandRange 의 하한 0.1 보다 작은 피연산자(0.02, 0.007 …)도 버린다 —
     기존 생성기가 소수 둘째·셋째 자리에서 0.1 미만을 만들 수 있다.
   - 0·1이 들어간 쉬운 문항 제한은 소수에 적용하지 않는다(gen-bridge.js 와 같은 규칙).
   - '잘못된 계산 과정 고치기'는 기존 생성기가 낸 문제 위에 틀린 풀이만 얹는다
     (formats-errorfix.js 와 같은 방식). 틀린 값은 바른 값과 반드시 달라야 한다 —
     글자가 달라도 값이 같으면(12 대 12.0) 다른 오류 종류로 넘어가고,
     쓸 수 있는 오류가 없으면 문제지를 만들지 않고 바로 오류를 낸다.
     같은 소수 자릿수끼리 더하므로 '소수점을 맞추지 않음' 오류는 쓸 수 없다.
     받아올림이 없는 개념에는 '받아올림을 더하지 않음'도 쓸 수 없어
     '소수 부분을 쓰지 않음'을 함께 쓴다.
   - 이 파일은 유형 정의와 이 묶음 전용 렌더러만 담는다. 공용 파일은 고치지 않는다.
*/
(function (root) {
  'use strict';

  /* ================= 1. 공통 도구 ================= */

  const BUNDLE = '2-1-1';
  const NBSP = '\u00a0';
  const node = (tag, className, value) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (value !== undefined) el.textContent = value;
    return el;
  };

  // 칸 너비는 한 장 안에서 모두 같아야 하므로 자리 수를 config.stack 에 담아 두고 쓴다.
  // 폭은 글자 크기와 무관한 px 로 넣는다(renderVertical 등). 줄마다 글자 크기가 다른데
  // (받아올림 줄은 sheet.css 가 .65em) em 으로 잡으면 그 줄만 칸이 좁아져
  // 받아올림 숫자가 자기 자리 위가 아니라 오른쪽으로 밀려 그려진다.
  const PX_PER_PT = 96 / 72;                       // CSS 1pt = 4/3px
  const SLOT = { vertical: 0.95, blank: 0.95, correction: 0.78, point: 0.55, sign: 0.7 };
  const CSS = [
    '.d211-stack{width:max-content;max-width:100%;margin:0 auto;font-variant-numeric:tabular-nums;}',
    '.d211-stack .vertical-digit{width:var(--d211-slot,1.12em);}',
    '.d211-stack .vertical-sign{width:var(--d211-sign,.9em);}',
    '.d211-stack .d211-point{width:var(--d211-point,.55em);}',
    '.d211-plain{border-color:transparent !important;}',
    '.d211-given{min-height:1.3em;}',
    '.d211-blank{border:1px dashed #888;background:#f4f4f4;}',
    '.d211-marked{background:#dedede;box-shadow:inset 0 -2px 0 #111;}',
    '.d211-answer{color:#d71f10;font-weight:700;}',
    '.d211-fix{display:flex;gap:2mm;height:100%;padding-bottom:1mm;}',
    '.d211-wrong{flex:0 0 auto;}',
    // 틀린 풀이와 바른 풀이는 받아올림 칸까지 같은 모양이어야 한다(규칙 §5).
    // 글자 크기를 줄이면 sheet.css 의 .carry-row .vertical-digit(.65em)를 덮어써
    // 바른 풀이 쪽 받아올림 칸만 커지므로 크기를 따로 줄이지 않는다.
    '.d211-right{flex:1 1 auto;min-width:0;border-left:1px dashed #c8c8c8;padding-left:1.5mm;}',
    '.d211-frame{flex:1 1 auto;border:1px solid #ddd;min-height:12mm;background-image:repeating-linear-gradient(90deg,transparent 0 calc(var(--d211-slot) - 1px),#ececec calc(var(--d211-slot) - 1px) var(--d211-slot));}',
    '.d211-note{position:absolute;left:6mm;right:1mm;bottom:1mm;font-size:7.5pt;color:#444;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
    // 이 묶음은 제목에 개념 조건과 서식 이름을 모두 넣어야 하는데(같은 개념의 네 장을 종이에서
    // 구분하기 위해) 기본 제목 칸 55mm=208px 에는 들어가지 않는다
    // (예: '소수 1자리 덧셈(받아올림 없음)·가로셈' = 270px). 이 묶음 쪽에만 머리말 항목 사이
    // 간격과 입력 칸(이름·날짜·시간) 글자를 조금 줄여 제목 칸을 290px 안팎으로 넓힌다.
    // 공용 sheet.css 와 다른 묶음의 문제지는 그대로 둔다.
    '.sheet-page:has(.d211-sheet) .sheet-head{gap:2mm;}',
    '.sheet-page:has(.d211-sheet) .sheet-field{font-size:9pt;}',
    // 가로셈 답 밑줄은 공용 sheet.css 의 min-width 11mm 만 있어 정답지에서 답 글자가 들어가면
    // 글자 폭만큼 늘어난다 — 같은 장 안에서 줄마다 달라지고 문제지(빈칸)와도 모양이 갈린다(검수 C 지적).
    // 이 묶음 가로셈 정답의 가장 긴 글자는 소수 자릿수가 가장 많은 개념(2-1-1-4)의 여섯 자리 수
    // (예: 19.999 + 9.999 = 29.998)로, 생성기 피연산자 상한(정수부 두 자리·소수 셋째 자리)까지
    // 넓혀 확인해도 13pt 에서 53.02px = 14.03mm 다(대체 글꼴 Malgun Gothic 은 51.53px 로 더 좁다).
    // 15mm 로 고정하면 답이 길어도 밑줄이 늘어나지 않아 문제지와 정답지가 같은 모양이 된다.
    // (이 묶음 표시 d211-sheet 가 있는 쪽에만 걸리므로 공용 sheet.css 와 다른 묶음은 그대로다.)
    '.sheet-page:has(.d211-sheet) .answer-space{min-width:15mm;}'
  ].join('');

  function installStyle() {
    if (document.getElementById('g211-style')) return;
    const style = node('style');
    style.id = 'g211-style';
    style.textContent = CSS;
    document.head.append(style);
  }

  /* ================= 2. 소수 자릿값 ================= */

  // '3.70' 처럼 끝자리가 0 인 수는 그 소수 자릿수로 친 문항이 아니다(명세 fractionalLastDigitNonzero).
  function decimalScaled(value, places) {
    const match = /^(\d+)(?:\.(\d+))?$/.exec(String(value).trim());
    if (!match) return null;
    const fraction = match[2] || '';
    if (fraction.length !== places || fraction.endsWith('0')) return null;
    const scaled = Number(match[1] + fraction);
    return Number.isSafeInteger(scaled) ? scaled : null;
  }

  // 소수 자릿수를 맞춘 정수 두 개로 받아올림 횟수를 센다(맨 윗자리에서 나가는 올림도 센다).
  function carryCount(x, y) {
    let carry = 0, count = 0;
    while (x > 0 || y > 0) {
      carry = (x % 10) + (y % 10) + carry >= 10 ? 1 : 0;
      count += carry;
      x = Math.floor(x / 10);
      y = Math.floor(y / 10);
    }
    return count;
  }

  // 자리마다 생긴 올림(낮은 자리부터). 다음 자리에 더해지는 올림이다.
  function columnCarries(x, y) {
    const marks = [];
    let carry = 0;
    while (x > 0 || y > 0) {
      carry = (x % 10) + (y % 10) + carry >= 10 ? 1 : 0;
      marks.push(carry);
      x = Math.floor(x / 10);
      y = Math.floor(y / 10);
    }
    return marks;
  }

  // 끝자리 0 을 지우지 않고 소수 자릿수를 그대로 유지한다(자리 맞추기 연습).
  function fixedDecimal(scaled, places) {
    const text = String(scaled).padStart(places + 1, '0');
    return text.slice(0, text.length - places) + '.' + text.slice(text.length - places);
  }

  function stackLayout(places, sums) {
    let whole = 2;
    for (const sum of sums) whole = Math.max(whole, String(sum).length - places);
    whole = Math.max(1, whole);
    return { places: places, whole: whole, width: whole + places + 1, point: whole };
  }

  /* ================= 3. 기존 생성기에서 조건에 맞는 문항만 뽑기 ================= */

  const THREE_PLACE_SOURCE = 'g211-decimal-add-3dp';
  const SOURCE = { 1: 'decimal-add-1', 2: 'decimal-add-2', 3: THREE_PLACE_SOURCE };

  // 소수 세 자리는 types.js 에 없다. 사이트가 4-2-3 에서 쓰는 방법 그대로
  // drill-engine 의 decimalPlaces 를 쓰는 profile 을 등록한다(새 엔진 아님).
  function installThreePlaceSource() {
    const catalog = root.DrillCatalog;
    if (!catalog || !(catalog.profiles instanceof Map)) return false;
    if (!catalog.profiles.has(THREE_PLACE_SOURCE)) {
      catalog.profiles.set(THREE_PLACE_SOURCE, {
        id: THREE_PLACE_SOURCE, source: 'decimal-add-2', title: '소수 세 자리 덧셈',
        group: '기본 연산', mode: 'basic', layout: 'horizontal',
        decimalPlaces: [3, 3], code: 'add'
      });
    }
    return true;
  }

  function buildItems(config) {
    const gen = config.gen || {};
    const places = gen.places;
    const count = config.count || (config.cols || 3) * (config.rows || 8);
    const seed = Number(config.seed) || 1;
    const minCarry = gen.minCarry || 0;
    const maxCarry = gen.maxCarry == null ? 9 : gen.maxCarry;
    // 소수 0.1 이상 — 1자리는 1, 2자리는 10, 3자리는 100 (자릿값 정수 기준).
    const minOperand = 10 ** (places - 1);
    const picked = [], seen = new Set();
    for (let round = 0; round < 600 && picked.length < count; round++) {
      let rows;
      try {
        rows = root.Worksheets.generate(gen.source, (seed + Math.imul(round, 104729)) >>> 0, Math.max(32, count));
      } catch (error) {
        throw Error(config.typeId + ': 기존 생성기 실패(' + gen.source + ') — ' + error.message);
      }
      for (const row of rows) {
        if (picked.length >= count) break;
        if (row.op !== '+') continue;
        const x = decimalScaled(row.a, places), y = decimalScaled(row.b, places);
        // 명세 operandRange 하한 0.1 — 자릿값으로 바꾼 정수에서 본다(0.02·0.007 같은 수를 버린다).
        if (x === null || y === null || x < minOperand || y < minOperand) continue;
        const carries = carryCount(x, y);
        if (carries < minCarry || carries > maxCarry) continue;
        const key = x < y ? x + ':' + y : y + ':' + x;   // 순서만 바꾼 같은 문제는 한 번만
        if (seen.has(key)) continue;
        const sum = x + y;
        // 기존 생성기가 낸 정답과 같은 값인지 확인하고, 표기만 소수 자릿수에 맞춰 고정한다.
        if (Math.round(Number(row.answer) * 10 ** places) !== sum) {
          throw Error(config.typeId + ': 기존 생성기 정답과 다릅니다 (' + row.a + ' + ' + row.b + ' = ' + row.answer + ')');
        }
        seen.add(key);
        picked.push({
          a: String(row.a), b: String(row.b), op: '+', answer: fixedDecimal(sum, places),
          x: x, y: y, sum: sum, carries: carries,
          // 화면에 적히는 자리 수(0.6 → 2자리). 맨 윗자리 올림을 구분하는 데 쓴다.
          operandDigits: Math.max(String(row.a).replace('.', '').length, String(row.b).replace('.', '').length)
        });
      }
    }
    if (picked.length < count) {
      throw Error(config.typeId + ': 조건에 맞는 문항 ' + count + '개 중 ' + picked.length + '개만 만들었습니다.');
    }
    // 쉬운 것 → 어려운 것: 받아올림 횟수 → 수의 크기 순.
    picked.sort((p, q) => p.carries - q.carries || p.sum - q.sum || p.x - q.x || p.y - q.y);
    const layout = stackLayout(places, picked.map(item => item.sum));
    picked.forEach((item, index) => {
      item.no = index + 1;
      item.carryMarks = carrySlots(columnCarries(item.x, item.y), item.operandDigits, layout);
      if (gen.kind === 'blank') item.blank = blankSlot(item, index, layout);
      if (gen.kind === 'correction') item.wrong = wrongWork(item, index, layout, gen);
    });
    config.stack = layout;
    return picked;
  }

  /* ================= 4. 빈칸·틀린 풀이 만들기 ================= */

  // 답의 한 자리를 가린다. 받아올림이 지나간 자리를 먼저 고르고, 문항마다 자리를 옮겨 간다.
  function blankSlot(item, index, layout) {
    const digits = String(item.sum).length;
    const produced = columnCarries(item.x, item.y);
    const landed = [];
    for (let i = 1; i < digits; i++) if (produced[i - 1]) landed.push(i);   // i번째(낮은 자리부터) 자리에 올림이 들어옴
    const pool = landed.length ? landed : Array.from({ length: digits }, (_, i) => i);
    return slotFromRight(pool[index % pool.length], layout);
  }

  function charsOf(value, layout) {
    return String(value == null ? '' : value).padStart(layout.width, ' ').split('');
  }

  // 소수 자릿수 기준 i번째(낮은 자리부터) 자리가 화면에서 몇 번째 칸인지.
  function slotFromRight(i, layout) {
    return i < layout.places ? layout.width - 1 - i : layout.point - 1 - (i - layout.places);
  }

  // 받아올림은 바로 윗자리 칸 위에 붙는다 → 화면 칸 순서(왼쪽부터)로 담는다.
  // 맨 윗자리에서 나간 올림은 새 자리의 숫자로 쓰이므로 작은 올림 칸에는 넣지 않는다.
  function carrySlots(produced, operandDigits, layout) {
    const marks = new Array(layout.width).fill(0);
    for (let i = 0; i + 1 < operandDigits && i < produced.length; i++) {
      if (!produced[i]) continue;
      const slot = slotFromRight(i + 1, layout);
      if (slot >= 0) marks[slot] = 1;
    }
    return marks;
  }

  // 자리별로 더하되 올림을 다음 자리에 더하지 않은 값(마지막 올림은 새 자리에 그대로 쓴다).
  // produced[i] = i번째 자리에서 올림이 생겼는지 (낮은 자리부터).
  function carryLostValue(x, y) {
    const digits = [], produced = [];
    let carry = 0;
    while (x > 0 || y > 0) {
      const sum = (x % 10) + (y % 10);
      digits.unshift(sum % 10);
      produced.push(sum >= 10 ? 1 : 0);
      carry = sum >= 10 ? 1 : 0;
      x = Math.floor(x / 10);
      y = Math.floor(y / 10);
    }
    if (carry) digits.unshift(1);
    return { value: Number(digits.join('')), produced: produced };
  }

  // 글자를 소수점 칸을 빼고 오른쪽부터 채운다(소수점을 빠뜨린 답, 소수 부분을 뺀 답).
  function spreadDigits(text, layout, where) {
    const chars = new Array(layout.width).fill(' ');
    const slots = [];
    for (let i = 0; i < layout.width; i++) {
      if (where === 'whole' ? i < layout.point : i !== layout.point) slots.push(i);
    }
    let at = slots.length - 1;
    for (let i = String(text).length - 1; i >= 0 && at >= 0; i--, at--) chars[slots[at]] = String(text)[i];
    return chars;
  }

  const WRONG_NOTE = {
    'carry-lost': '받아올림을 다음 자리에 더하지 않음',
    'point-missing': '결과에 소수점을 쓰지 않음',
    'fraction-lost': '소수 부분을 쓰지 않음'
  };

  // 오류 하나를 만들어 본다. 이 문항에 쓸 수 없으면(올림이 없거나 값이 그대로면) null.
  function makeWrong(kind, item, layout) {
    const correct = charsOf(item.answer, layout);
    if (kind === 'carry-lost') {
      if (!item.carries) return null;
      const lost = carryLostValue(item.x, item.y);
      if (lost.value === item.sum) return null;                 // 올림을 놓쳐도 값이 같아지는 문항
      const chars = charsOf(fixedDecimal(lost.value, layout.places), layout);
      return finish(kind, chars, carrySlots(lost.produced, item.operandDigits, layout), correct, item, layout);
    }
    if (kind === 'point-missing') return finish(kind, spreadDigits(item.sum, layout, 'all'), null, correct, item, layout);
    return finish(kind, spreadDigits(Math.floor(item.sum / 10 ** layout.places), layout, 'whole'), null, correct, item, layout);
  }

  function finish(kind, chars, carryMarks, correct, item, layout) {
    const text = chars.join('');
    if (text === item.answer) return null;
    // 글자가 달라도 값이 같으면(예: 12.0 → 12) 사실은 맞는 풀이가 되므로 쓰지 않는다.
    const shown = Number(text.replace(/\s/g, ''));
    if (Number.isFinite(shown) && shown === Number(item.answer)) return null;
    // 바른 답과 다른 칸을 모두 표시한다(빈 칸도 표시해 빠진 자리를 보이게 한다).
    const highlight = {};
    for (let i = 0; i < layout.width; i++) if (chars[i] !== correct[i]) highlight[i] = 'd211-marked';
    return { kind: kind, text: text, note: WRONG_NOTE[kind], carryMarks: carryMarks, marks: highlight };
  }

  // 문항마다 오류를 돌려 가며 쓰고, 그 문항에 쓸 수 없는 오류는 건너뛴다.
  function wrongWork(item, index, layout, gen) {
    const order = gen.maxCarry > 0
      ? ['carry-lost', 'point-missing', 'fraction-lost']
      : ['point-missing', 'fraction-lost'];
    for (let step = 0; step < order.length; step++) {
      const built = makeWrong(order[(index + step) % order.length], item, layout);
      if (built) return built;
    }
    throw Error('2-1-1: 틀린 풀이를 만들지 못했습니다 (' + item.a + ' + ' + item.b + ')');
  }

  /* ================= 5. 그리기 ================= */

  // 숫자 한 줄. 오른쪽을 맞추고 소수점은 고정 칸에 넣어 자리가 저절로 맞는다.
  function numberRow(value, layout, options) {
    const opts = options || {};
    const el = node('div', opts.className || 'vertical-row');
    el.append(node('span', 'vertical-sign', opts.sign || ''));
    const chars = String(value == null ? '' : value).padStart(layout.width, ' ').split('');
    for (let i = 0; i < layout.width; i++) {
      const cls = ['vertical-digit'];
      if (i === layout.point) cls.push('d211-point');
      if (opts.slotClass) cls.push(opts.slotClass);
      if (opts.marks && opts.marks[i]) cls.push(opts.marks[i]);
      el.append(node('span', cls.join(' '), chars[i] === ' ' || chars[i] === '' ? NBSP : chars[i]));
    }
    return el;
  }

  function carryRow(layout, fill) {
    const marks = typeof fill === 'string' ? fill.split('') : fill;
    const el = node('div', 'vertical-row carry-row');
    el.append(node('span', 'vertical-sign'));
    for (let i = 0; i < layout.width; i++) {
      const cls = ['vertical-digit'];
      // 소수점 자리는 숫자 줄과 같은 폭을 준다(다르면 왼쪽 칸일수록 어긋남이 쌓인다).
      if (i === layout.point) cls.push('d211-point', 'd211-plain');
      const on = marks && marks[i] && marks[i] !== '0' && marks[i] !== ' ';
      el.append(node('span', cls.join(' '), on ? '1' : NBSP));
    }
    el.querySelectorAll('.vertical-digit').forEach(digit => { digit.style.border = 'none'; });
    return el;
  }

  function stack(question, layout, options) {
    const opts = options || {};
    // d211-sheet 는 이 묶음 표시 — 머리말 제목 칸을 넓히는 CSS 가 이 표시로 걸린다.
    // (셀 자신의 class 에 붙이면 'class="sheet-cell"' 을 그대로 세는 기존 검사 도구가 어긋난다.)
    const el = node('div', 'vertical d211-stack d211-sheet');
    if (opts.carry) el.append(carryRow(layout, opts.carryFill));
    el.append(numberRow(question.a, layout));
    el.append(numberRow(question.b, layout, { sign: '+' }));
    el.append(numberRow(opts.result, layout, {
      className: opts.plainResult ? 'vertical-row vertical-rule d211-given' : 'vertical-row vertical-rule vertical-result',
      slotClass: opts.answerSlotClass,
      marks: opts.resultMarks
    }));
    return el;
  }

  function slotWidth(kind) { return SLOT[kind] || SLOT.vertical; }

  // 칸 폭을 px 로 정해 준다. 쪽 글자 크기(config.fontPt)가 기준이고 줄마다 글자 크기가 달라도
  // 값이 바뀌지 않으므로 모든 줄의 자리가 정확히 맞는다.
  function slotVars(cell, kind, config) {
    const pt = (config.fontPt || 12) * PX_PER_PT;
    cell.style.setProperty('--d211-slot', slotWidth(kind) * pt + 'px');
    cell.style.setProperty('--d211-point', SLOT.point * pt + 'px');
    cell.style.setProperty('--d211-sign', SLOT.sign * pt + 'px');
  }

  function renderVertical(cell, question, answer, config) {
    installStyle();
    const layout = config.stack;
    const carry = config.gen.maxCarry > 0;
    slotVars(cell, 'vertical', config);
    cell.append(stack(question, layout, {
      carry: carry,
      carryFill: answer ? question.carryMarks : null,
      result: answer ? question.answer : '',
      answerSlotClass: answer ? 'd211-answer' : null
    }));
  }

  function renderBlank(cell, question, answer, config) {
    installStyle();
    const layout = config.stack;
    slotVars(cell, 'blank', config);
    const chars = charsOf(question.answer, layout);
    const marks = {};
    marks[question.blank] = answer ? 'd211-marked' : 'd211-blank';
    if (answer) marks[question.blank] = 'd211-marked d211-answer';   // 문제로 인쇄된 자리는 검정, 새로 채운 자리만 빨강
    if (!answer) chars[question.blank] = '□';
    cell.append(stack(question, layout, {
      carry: config.gen.maxCarry > 0,
      carryFill: answer ? question.carryMarks : null,
      plainResult: true,
      result: chars.join(''),
      resultMarks: marks
    }));
  }

  function renderCorrection(cell, question, answer, config) {
    installStyle();
    const layout = config.stack;
    const carry = false;
    slotVars(cell, 'correction', config);
    const wrap = node('div', 'd211-fix');
    const wrong = node('div', 'd211-wrong');
    wrong.append(stack(question, layout, {
      carry: carry,
      carryFill: question.wrong.carryMarks,
      result: question.wrong.text,
      resultMarks: answer ? question.wrong.marks : null
    }));
    wrap.append(wrong);
    if (answer) {
      const right = node('div', 'd211-right');
      right.append(stack(question, layout, {
        carry: carry, carryFill: question.carryMarks, result: question.answer, answerSlotClass: 'd211-answer'
      }));
      wrap.append(right);
    } else {
      wrap.append(node('div', 'd211-frame'));   // 바르게 고쳐 쓰는 빈 칸
    }
    cell.append(wrap);
  }

  // 가로셈은 공용 서식(sheet.js)을 그대로 쓰고, 이 묶음 표시(d211-sheet)를 셀 안에 둔다.
  // 그 표시로 머리말 제목 칸을 넓히는 CSS(.sheet-page:has(.d211-sheet))가 걸린다.
  let HORIZONTAL_BASE = null;

  function renderHorizontal(cell, question, answer, config) {
    installStyle();
    const mark = node('div', 'd211-sheet');
    HORIZONTAL_BASE(mark, question, answer, config);
    cell.append(mark);
  }

  function installFormats() {
    if (!root.Sheet || typeof root.Sheet.register !== 'function') return false;
    if (!HORIZONTAL_BASE) HORIZONTAL_BASE = root.Sheet.renderers && root.Sheet.renderers.get('horizontal');
    if (typeof HORIZONTAL_BASE !== 'function') return false;
    root.Sheet.register('g211-horizontal', renderHorizontal);
    root.Sheet.register('g211-vertical-decimal', renderVertical);
    root.Sheet.register('g211-vertical-blank', renderBlank);
    root.Sheet.register('g211-vertical-correction', renderCorrection);
    return true;
  }

  function installGenerator() {
    const base = root.SheetGen;
    if (!base || typeof base.generate !== 'function' || base.__g211) return false;
    const original = base.generate;
    base.generate = function (config) {
      if (config && config.gen && config.gen.bundle === BUNDLE) return buildItems(config);
      return original.apply(this, arguments);
    };
    Object.defineProperty(base, '__g211', { value: true });
    return true;
  }

  /* ================= 6. 유형 20종 ================= */

  // 제목은 '개념(자리 수 + 받아올림 조건)·서식' 으로 쓴다. 같은 개념의 네 장을
  // 종이에서 구분하려면 서식 이름이, 같은 서식의 개념 다섯을 구분하려면 받아올림 조건이 필요하다.
  // 개념 이름과 달리 '올림' 만 쓰면 제품의 '반올림'·'올림(어림)' 과 뜻이 겹쳐 '받아올림' 으로 적는다.
  // 이 길이(정답지 ' · 정답' 포함 270px)는 기본 제목 칸 208px 을 넘으므로 이 묶음 쪽 머리말
  // 간격·입력 칸 글자를 줄여 제목 칸을 넓힌다(위 CSS 의 .sheet-head 규칙).
  const CONCEPTS = [
    { id: '2-1-1-0', label: '소수 1자리 덧셈', carry: '받아올림 없음', places: 1, minCarry: 0, maxCarry: 0 },
    { id: '2-1-1-1', label: '소수 1자리 덧셈', carry: '받아올림 있음', places: 1, minCarry: 1, maxCarry: 2 },
    { id: '2-1-1-2', label: '소수 2자리 덧셈', carry: '받아올림 없음', places: 2, minCarry: 0, maxCarry: 0 },
    { id: '2-1-1-3', label: '소수 2자리 덧셈', carry: '받아올림 있음', places: 2, minCarry: 1, maxCarry: 3 },
    { id: '2-1-1-4', label: '소수 3자리 덧셈', carry: '', places: 3, minCarry: 0, maxCarry: 9 }
  ];
  // 서식별 단·줄은 layout-rules §2 의 최소 기준에서 시작하고, 남는 높이는 sheet.js 의 autoFit 이 채운다.
  // (가로셈 3×15=45 / 세로셈·빈칸 5×8=40 / 고치기 3×5=15)
  // size: 소수 자릿수(1·2·3)별 [단, 줄, 글자 pt]. 칸을 채우도록 글자를 키우고 문항 수는 40(소수 셋째 자리는 30) 이하로 둔다.
  const FORMS = [
    { key: 't1', kind: 'horizontal', format: 'g211-horizontal', label: '가로셈',
      size: { 1: [3, 13, 17], 2: [3, 13, 16], 3: [2, 15, 17] },
      instruction: '식을 계산하고 답을 쓰세요.' },
    { key: 't2', kind: 'vertical', format: 'g211-vertical-decimal', label: '세로셈',
      size: { 1: [5, 8, 15], 2: [5, 8, 15], 3: [5, 6, 14] },
      instruction: '소수점을 맞추어 세로로 계산하고 답을 쓰세요.' },
    { key: 't3', kind: 'blank', format: 'g211-vertical-blank', label: '빈칸',
      size: { 1: [5, 8, 15], 2: [5, 8, 15], 3: [5, 6, 14] },
      instruction: '계산 과정을 살펴보고 □ 안에 알맞은 수를 쓰세요.' },
    { key: 't4', kind: 'correction', format: 'g211-vertical-correction', label: '고치기',
      size: { 1: [3, 5, 18], 2: [3, 5, 17], 3: [3, 5, 15] },
      instruction: '잘못된 곳을 찾아 바르게 고쳐 쓰세요.' }
  ];

  function entries() {
    const list = [];
    CONCEPTS.forEach((concept, ci) => FORMS.forEach((form, fi) => {
      list.push({
        typeId: concept.id + '-' + form.key,
        title: concept.label + (concept.carry ? '(' + concept.carry + ')' : '') + '·' + form.label,
        instruction: form.instruction,
        format: form.format,
        cols: form.size[concept.places][0],
        rows: form.size[concept.places][1],
        count: form.size[concept.places][0] * form.size[concept.places][1],
        fontPt: form.size[concept.places][2],
        autoFit: false,
        maxProblems: form.size[concept.places][0] * form.size[concept.places][1],
        seed: 20261001 + ci * 10 + fi,
        gen: {
          bundle: BUNDLE, concept: concept.id, kind: form.kind,
          places: concept.places, minCarry: concept.minCarry, maxCarry: concept.maxCarry,
          source: SOURCE[concept.places]
        }
      });
    }));
    return list;
  }

  installThreePlaceSource();
  if (!installFormats()) document.addEventListener('DOMContentLoaded', installFormats, { once: true });
  if (!installGenerator()) document.addEventListener('DOMContentLoaded', installGenerator, { once: true });
  const catalog = entries();
  if (Array.isArray(root.SheetCatalog)) for (const entry of catalog) root.SheetCatalog.push(entry);

  // 검수 도구가 쓰는 입구(문제 생성 규칙을 그대로 다시 쓸 수 있게).
  root.Sheet211 = {
    bundle: BUNDLE, concepts: CONCEPTS, forms: FORMS, entries: catalog,
    buildItems: buildItems, decimalScaled: decimalScaled, carryCount: carryCount, fixedDecimal: fixedDecimal
  };
})(globalThis);
