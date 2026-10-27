/* 묶음 2-4-1 — 자연수로 나누기 (소수 ÷ 자연수) · 16유형

   이 파일 하나에 이 묶음의 유형 정의 · 문제 생성 · 서식(렌더러)을 모두 담는다.
   공용 파일(sheet.js, formats-*.js, gen-bridge.js)은 고치지 않고 읽어서 쓴다.

   ── 개념 4가지 (prototypes\training-roadmap-20261001\worksheet-types.json)
     2-4-1-0  소수 첫째 자리 ÷ 자연수 — 주어진 자리에서 나누어떨어짐
              피제수 소수 1자리, 제수 2~9, 몫은 소수 1자리에서 끝남 (예: 18.3 ÷ 3 = 6.1)
     2-4-1-1  소수 둘째 자리 ÷ 자연수 — 주어진 자리에서 나누어떨어짐
              피제수 소수 2자리, 제수 2~9, 몫은 소수 2자리에서 끝남 (예: 6.09 ÷ 3 = 2.03)
     2-4-1-2  소수 끝에 0을 내려 계산하기
              피제수 소수 1자리, 제수 2~9, 몫이 소수 2자리 → 끝에 0을 내려야 끝남 (예: 1.5 ÷ 2 = 0.75)
     2-4-1-3  자연수 ÷ 자연수 — 몫을 소수로 나타내기
              피제수·제수 모두 자연수, 몫은 정수가 아니고 소수 1~2자리에서 끝남 (예: 3 ÷ 4 = 0.75)

   ── 유형 4가지 (typeId 뒤 t1~t4)
     t1 가로식으로 몫 구하기      format 'horizontal' (sheet.js 의 기존 가로셈 서식)  3단 × 15줄 = 45
     t2 세로 나눗셈으로 계산하기  format 'ko241-division-vertical'                    4단 × 5줄 = 20
     t3 세로 풀이의 빈칸 채우기   format 'ko241-division-blank' (t2와 같은 단·줄)     4단 × 5줄 = 20
     t4 잘못된 나눗셈 과정 고치기 format 'ko241-division-error-fix'                  3단 × 4줄 = 12
   (문항 수는 layout-rules.md §2 의 최소 기준. 인쇄에서 잘리지 않는 최대 줄 수를 고정한다.)

   ── 문제 생성
     사이트의 기존 문제 생성기(Worksheets.generate, src/bank/legacy/types.js)만 쓴다.
     새 문제 엔진을 만들지 않는다. 소수 나눗셈 계열(decimal-div-1dp-0dp, decimal-div-2dp-0dp)과
     자연수 나눗셈 계열(natural-div-1-1, natural-div-2-1)에서 뽑아, 개념 이름이 말하는 조건에
     맞지 않는 문항은 정수 연산으로 걸러 내고 모자라면 더 뽑는다(gen-bridge.js 와 같은 방식).
     같은 seed → 같은 문제지. 어려운 순서로 줄 세운다.

   ── 오류 유형(t4) 이름은 spec\spec-decimal.json 의 errorKinds 목록에서 가져왔다.
     소수 첫째·둘째 자리, 0 내려 계산(2-4-1-0/1/2):
       '소수점 위치를 잘못 표시', '계산 결과의 크기를 확인하지 않음', '0을 빠뜨려 자릿값을 바꿈'
     자연수 ÷ 자연수(2-4-1-3):
       '몫의 소수점 위치를 잘못 표시', '계산 결과의 크기를 확인하지 않음',
       '몫의 0이나 피제수 끝에 붙인 0을 빠뜨림', '나머지를 원래 단위로 되돌리지 않음'
     오류가 들어간 풀이의 값은 바른 값과 반드시 다르다(문항마다 검사한다).
*/
(function (root) {
  'use strict';

  /* ================= 1. 수 다루기 ================= */

  const places = value => (String(value).split('.')[1] || '').length;   // 소수 자릿수
  const digitsOf = value => String(value).replace('.', '');             // 소수점을 뺀 숫자열

  // 소수점을 뺀 정수값. 소수 자릿수와 함께 쓰면 값을 정확히 나타낸다. ('18.3' → 183, 1자리)
  const scaledOf = value => Number(digitsOf(value));

  // n 을 소수 p 자리 수로 적는다. (formatScaled(61, 1) = '6.1', formatScaled(5, 2) = '0.05')
  function formatScaled(n, p) {
    let text = String(n);
    while (text.length <= p) text = '0' + text;
    return p ? text.slice(0, -p) + '.' + text.slice(-p) : text;
  }

  // 소수 끝의 0 을 지운다. (1.40 → 1.4)
  function trimZeros(text) {
    const value = String(text);
    return value.includes('.') ? value.replace(/0+$/, '').replace(/\.$/, '') : value;
  }

  const esc = value => String(value === undefined || value === null ? '' : value)
    .replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

  /* ================= 2. 개념 ================= */

  const CONCEPTS = {
    '2-4-1-0': {
      label: '소수 첫째 자리 ÷ 자연수',
      sources: ['decimal-div-1dp-0dp'],
      dividendPlaces: 1,
      appended: 0                       // 피제수 끝에 내려야 하는 0의 개수(고정)
    },
    '2-4-1-1': {
      label: '소수 둘째 자리 ÷ 자연수',
      sources: ['decimal-div-2dp-0dp'],
      dividendPlaces: 2,
      appended: 0
    },
    '2-4-1-2': {
      label: '소수 끝에 0을 내려 계산',
      sources: ['decimal-div-1dp-0dp'],
      dividendPlaces: 1,
      appended: 1
    },
    '2-4-1-3': {
      label: '자연수 ÷ 자연수 (소수 몫)',
      sources: ['natural-div-1-1', 'natural-div-2-1'],
      dividendPlaces: 0,
      appended: null                    // 몫의 소수 자릿수만큼 내린다
    }
  };

  // 개념 이름이 말하는 조건을 정수 연산으로 검사한다(부동소수 오차를 쓰지 않는다).
  function accepts(conceptId, aText, bText) {
    const b = Number(bText);
    if (!Number.isInteger(b) || b < 2 || b > 9) return false;          // 제수: 자연수 2~9
    const p = places(aText);
    const A = scaledOf(aText);
    if (!Number.isFinite(A)) return false;
    if (conceptId === '2-4-1-0') {
      // 소수 1자리 ÷ 자연수, 몫이 소수 첫째 자리에서 끝남
      return p === 1 && A % 10 !== 0 && A % b === 0;
    }
    if (conceptId === '2-4-1-1') {
      // 소수 2자리 ÷ 자연수, 몫이 소수 둘째 자리에서 끝남
      return p === 2 && A % 10 !== 0 && A % b === 0;
    }
    if (conceptId === '2-4-1-2') {
      // 소수 1자리 ÷ 자연수, 첫째 자리에서 끝나지 않고 끝에 0을 내려야 끝남
      if (p !== 1 || A % 10 === 0 || A % b === 0) return false;
      if ((10 * A) % b !== 0) return false;
      return ((10 * A) / b) % 10 !== 0;
    }
    if (conceptId === '2-4-1-3') {
      // 자연수 ÷ 자연수, 몫이 정수가 아니고 소수 1~2자리에서 끝남
      if (p !== 0 || A % b === 0) return false;
      return (100 * A) % b === 0;
    }
    return false;
  }

  // 정답. 위 조건 때문에 모든 나눗셈이 정수에서 떨어지므로 반올림이 없다.
  function answerOf(conceptId, aText, bText) {
    const A = scaledOf(aText);
    const b = Number(bText);
    if (conceptId === '2-4-1-0') return formatScaled(A / b, 1);
    if (conceptId === '2-4-1-1') return formatScaled(A / b, 2);
    if (conceptId === '2-4-1-2') return formatScaled((10 * A) / b, 2);
    if (conceptId === '2-4-1-3') return trimZeros(formatScaled((100 * A) / b, 2));
    throw Error('알 수 없는 개념: ' + conceptId);
  }

  /* ================= 3. 문제 뽑기 ================= */

  // gen-bridge.js 와 같은 규칙: 0이나 1이 들어간 쉬운 문항은 10% 이하.
  // 소수 피제수(2-4-1-0/1/2)는 자릿수 자체에 0·1이 흔해 이 규칙을 적용하지 않는다
  // (gen-bridge.js 도 legacyId 가 decimal- 이면 이 규칙을 적용하지 않는다).
  const isEasy = q => /[01]/.test(digitsOf(q.a) + String(q.b));

  const difficulty = q => Number(q.a) + Number(q.b) + Number(q.answer) * 2;

  function drawQuestions(conceptId, seed, count) {
    const generator = root.Worksheets;
    if (!generator || typeof generator.generate !== 'function') {
      throw Error('기존 Worksheets 생성기를 찾지 못했습니다.');
    }
    const concept = CONCEPTS[conceptId];
    const easyLimit = concept.dividendPlaces > 0 ? Infinity : Math.floor(count * 0.1);
    const out = [], seen = new Set();
    let easyCount = 0;
    for (let batch = 0; batch < 4000 && out.length < count; batch++) {
      const legacyId = concept.sources[batch % concept.sources.length];
      let rows;
      try {
        rows = generator.generate(legacyId, (Number(seed) + batch * 104729) >>> 0, 16);
      } catch (error) {
        throw Error('기존 생성기 실패(' + legacyId + '): ' + error.message);
      }
      for (const row of rows) {
        const a = String(row.a), b = String(row.b);
        const key = a + ':' + b;
        if (seen.has(key)) continue;
        seen.add(key);
        if (!accepts(conceptId, a, b)) continue;
        const easy = isEasy({ a: a, b: b });
        if (easy && easyCount >= easyLimit) continue;
        if (easy) easyCount += 1;
        out.push({ a: a, b: b, op: '÷', answer: answerOf(conceptId, a, b) });
        if (out.length >= count) break;
      }
    }
    if (out.length < count) {
      throw Error(conceptId + ': 조건에 맞는 문항 ' + count + '개를 만들지 못했습니다 (' + out.length + '개).');
    }
    out.sort((x, y) => difficulty(x) - difficulty(y) || String(x.a).localeCompare(String(y.a)));
    return out;
  }

  /* ================= 4. 세로셈 자료 만들기 =================
     렌더러(SVG·HTML)가 함께 쓰는 중간 표현.
     숫자 하나가 '자리 칸(slot)' 하나에 들어간다. 칸 번호는 피제수의 숫자에 0부터 붙는다.
     소수점은 (소수점 앞 자릿수 − 1)번 칸과 그 다음 칸 사이에 온다.                    */

  const digitCells = (value, lastSlot) => {
    const text = String(value);
    const first = lastSlot - (text.length - 1);
    return text.split('').map((ch, index) => ({ slot: first + index, ch: ch }));
  };

  // opts: {hideAppended, keepSteps}
  function divisionModel(aText, bText, answerText, opts) {
    const options = opts || {};
    const b = Number(bText);
    const givenDigits = digitsOf(aText);
    const dividendPlaces = places(aText);
    const appended = Math.max(0, places(answerText) - dividendPlaces);
    const displayed = givenDigits + (options.hideAppended ? '' : repeatZero(appended));
    const intDigits = givenDigits.length - dividendPlaces;         // 소수점 앞 자릿수
    const steps = [];
    let rem = 0;
    for (let i = 0; i < displayed.length; i++) {
      const cur = rem * 10 + Number(displayed[i]);
      const q = Math.floor(cur / b);
      rem = cur - q * b;
      steps.push({ i: i, cur: cur, q: q, prod: q * b, rem: rem });
    }
    if (rem !== 0 && options.keepSteps === undefined) {
      throw Error('나누어떨어지지 않는 문항: ' + aText + ' ÷ ' + bText);
    }
    const kept = options.keepSteps === undefined ? steps : steps.slice(0, options.keepSteps);

    // 몫: 소수점 앞쪽의 앞선 0은 쓰지 않는다. 정수부가 모두 0이면 0 하나만 남긴다.
    const heads = kept.slice(0, intDigits).map(step => String(step.q));
    const tails = kept.slice(intDigits).map(step => String(step.q));
    let whole = heads.join('').replace(/^0+/, '');
    if (!whole) whole = heads.length ? '0' : '';
    const quotient = whole.split('').map((ch, index) => ({
      slot: intDigits - whole.length + index, ch: ch
    })).concat(tails.map((ch, index) => ({ slot: intDigits + index, ch: ch })));

    // 풀이 줄: 한 단계마다 (받아 내린 수) → (곱한 수) → 가로줄, 마지막에 나머지
    const rows = [];
    kept.forEach((step, index) => {
      if (index > 0) rows.push({ kind: 'partial', cells: digitCells(step.cur, step.i) });
      if (step.q === 0) return;                                    // 빼지 않았으므로 곱셈 줄이 없다
      const cells = digitCells(step.prod, step.i);
      rows.push({
        kind: 'product', rule: true, from: cells[0].slot, to: step.i,
        cells: [{ slot: cells[0].slot - 1, ch: '−' }].concat(cells)
      });
    });
    const last = kept[kept.length - 1];
    if (last) rows.push({ kind: 'remainder', cells: digitCells(last.rem, last.i) });

    return {
      a: aText, b: b, answer: answerText,
      displayed: displayed,
      slots: displayed.length,
      intDigits: intDigits,                                        // 소수점 앞 자릿수
      dividendPointAt: displayed.length > intDigits ? intDigits : null,   // 피제수 소수점 자리
      quotient: quotient,
      quotientPointAt: tails.length > 0 ? intDigits : null,        // 몫 소수점 자리
      rows: rows,
      steps: kept,
      remainder: last ? last.rem : 0
    };
  }

  // 자리 칸과 소수점 자리로 나타낸 몫의 값을 '정수.소수' 문자열로 돌려준다(정확한 정수 비교용).
  function valueKey(cells, pointAt) {
    const ordered = cells.slice().sort((left, right) => left.slot - right.slot)
      .filter(cell => /[0-9]/.test(cell.ch));
    let whole = '', fraction = '';
    ordered.forEach(cell => {
      if (pointAt === null || pointAt === undefined || cell.slot < pointAt) whole += cell.ch;
      else fraction += cell.ch;
    });
    whole = whole.replace(/^0+/, '') || '0';
    fraction = fraction.replace(/0+$/, '');
    return fraction ? whole + '.' + fraction : whole;
  }

  function repeatZero(count) {
    let text = '';
    for (let index = 0; index < count; index++) text += '0';
    return text;
  }

  // 자리 칸 숫자열을 소수점이 있는 글자로 되돌린다(문제에 보이는 피제수).
  function displayText(figure) {
    if (figure.dividendPointAt === null || figure.dividendPointAt === undefined) return figure.displayed;
    return figure.displayed.slice(0, figure.dividendPointAt) + '.' +
      figure.displayed.slice(figure.dividendPointAt);
  }

  /* ================= 5. 세로셈 SVG (t2 · t3) ================= */

  // 자리 칸 폭 15, 몫 줄·피제수 줄·풀이 줄의 기준선. 위쪽이 잘리지 않도록 여유를 둔다.
  const CELL = 15, Q_BASE = 13, TOP_BASE = 31, WORK_TOP = 47, ROW_STEP = 18;
  const BAR_Y = Q_BASE + 4;                                        // 나눗셈 기호 위 가로줄

  const FIGURE_CSS = [
    'body[data-ko241-title="compact"] .sheet-head{gap:2mm;}',
    'body[data-ko241-title="compact"] .sheet-title{font-size:9pt;}',
    '.ko241-figure{width:100%;height:100%;}',
    '.ko241-figure svg{display:block;width:100%;height:100%;max-width:100%;}',
    ".ko241-figure text{font-family:Arial,'NanumSquareRound','Malgun Gothic',sans-serif;font-size:15px;fill:#111;font-variant-numeric:tabular-nums;}",
    '.ko241-figure .ko241-ink text{fill:#d71f10;}',
    '.ko241-figure .ko241-ink circle,.ko241-figure .ko241-ink path{stroke:#d71f10;}',
    '.ko241-figure .ko241-blank{fill:#fff;stroke:#555;stroke-width:1;}',
    '.ko241-figure .ko241-guide{stroke:#c9c9c9;stroke-width:.7;}'
  ].join('');

  function installStyle() {
    if (typeof document === 'undefined' || !document.head) return;
    if (document.getElementById('ko241-style')) return;
    const style = document.createElement('style');
    style.id = 'ko241-style';
    style.textContent = FIGURE_CSS;
    document.head.appendChild(style);
  }

  // figure: divisionModel 결과
  // opts: {solution, ink, guide, blank, reveal}
  //   solution: 몫과 풀이 줄을 그린다 (아니면 풀이 자리에 연한 줄만)
  //   ink:      몫과 풀이를 빨강으로 (정답지)
  //   blank:    {row, slot} 한 자리만 □ 로 비운다 (row 'q' 는 몫 줄)
  //   reveal:   비운 자리를 빨강 숫자로 채운다 (정답지)
  // 제수·나눗셈 기호·피제수는 언제나 검정으로 둔다.
  function figureSvg(figure, opts) {
    const options = opts || {};
    const solution = options.solution !== false;
    const blank = options.blank || null;
    const inkTarget = options.ink ? 'red' : 'base';
    const x0 = Math.max(36, String(figure.b).length * CELL + 14);
    const slotRight = slot => x0 + (slot + 1) * CELL;
    const width = x0 + figure.slots * CELL + 10;
    const groups = { base: [], red: [] };
    const text = (target, ch, x, y) => groups[target].push(
      '<text x="' + x + '" y="' + y + '" text-anchor="end">' + esc(ch) + '</text>');
    const point = (target, x, y) => groups[target].push(
      '<circle cx="' + x + '" cy="' + (y - 1.5) + '" r="1.1"/>');
    const box = (target, x, cy) => groups[target].push(
      '<rect class="ko241-blank" x="' + (x - CELL + 1.5) + '" y="' + (cy - 11) +
      '" width="' + (CELL - 2) + '" height="' + (CELL - 3) + '"/>');

    // 제수와 나눗셈 기호(왼쪽 세로줄 + 피제수 위 가로줄). 몫은 가로줄 위에 온다.
    text('base', String(figure.b), x0 - 6, TOP_BASE);
    groups.base.push('<path d="M' + (x0 - 2) + ' ' + (TOP_BASE + 5) + 'Q' + (x0 + 5) + ' ' + ((TOP_BASE + 5 + BAR_Y)/2) + ' ' + (x0 - 2) + ' ' + BAR_Y + 'H' + (width - 8) +
      '" fill="none" stroke="#111"/>');

    // 피제수
    figure.displayed.split('').forEach((ch, index) => text('base', ch, slotRight(index), TOP_BASE));
    if (figure.dividendPointAt !== null) point('base', x0 + figure.dividendPointAt * CELL + 2.5, TOP_BASE);

    // 몫 + 풀이 줄. 문제지와 정답지의 그림 높이를 같게 맞춘다(같은 배치로 보이게).
    let y = WORK_TOP;
    const rowCount = Math.max(figure.rows.length, options.guide || 0);
    if (solution) {
      const blankInQuotient = blank && blank.row === 'q';
      figure.quotient.forEach(cell => {
        if (blankInQuotient && blank.slot === cell.slot) {
          if (options.reveal) text('red', cell.ch, slotRight(cell.slot), Q_BASE);
          else box('base', slotRight(cell.slot), Q_BASE);
          return;
        }
        text(inkTarget, cell.ch, slotRight(cell.slot), Q_BASE);
      });
      if (blankInQuotient && !options.reveal &&
        !figure.quotient.some(cell => cell.slot === blank.slot)) {
        box('base', slotRight(blank.slot), Q_BASE);
      }
      if (figure.quotientPointAt !== null) point(inkTarget, x0 + figure.quotientPointAt * CELL + 2.5, Q_BASE);
      figure.rows.forEach((row, rowIndex) => {
        row.cells.forEach(cell => {
          const target = inkTarget;
          if (blank && rowIndex === blank.row && blank.slot === cell.slot) {
            if (options.reveal) text('red', cell.ch, slotRight(cell.slot), y);
            else box('base', slotRight(cell.slot), y);
            return;
          }
          text(target, cell.ch, slotRight(cell.slot), y);
        });
        if (row.rule) {
          groups[inkTarget].push('<path d="M' + (slotRight(row.from) - CELL) + ' ' + (y + 3) + 'H' +
            slotRight(row.to) + '" fill="none" stroke="#111"/>');
        }
        y += ROW_STEP;
      });
    } else {
      for (let index = 0; index < rowCount; index++) {
        groups.base.push('<path class="ko241-guide" d="M' + (x0 + 2) + ' ' + (y + 4) + 'H' + (width - 8) +
          '" fill="none"/>');
        y += ROW_STEP;
      }
    }
    y = Math.max(y, WORK_TOP + rowCount * ROW_STEP);                // 문제지·정답지 높이를 같게
    const height = Math.max(y + 8, TOP_BASE + 30);
    return '<div class="ko241-figure">' +
      '<svg viewBox="0 0 ' + width + ' ' + height + '" preserveAspectRatio="xMidYMin meet" role="img" aria-label="' +
      esc(figure.a + ' ÷ ' + figure.b) + '"><g>' + groups.base.join('') + '</g>' +
      (groups.red.length ? '<g class="ko241-ink">' + groups.red.join('') + '</g>' : '') +
      '</svg></div>';
  }

  /* ================= 6. 잘못된 풀이 만들기 (t4) ================= */

  // 틀린 풀이는 몫의 숫자·소수점 자리(quotientPointAt)를 바른 풀이와 다르게 만든다.
  const KINDS = {
    'point-dropped': {
      label: '소수점 위치를 잘못 표시', note: '몫에 소수점을 찍지 않았어요',
      build(figure) {
        // 숫자는 그대로 두고 소수점만 찍지 않는다.
        return {
          quotient: figure.quotient, quotientPointAt: null,
          displayed: figure.displayed, rows: figure.rows
        };
      }
    },
    'point-shifted': {
      label: '계산 결과의 크기를 확인하지 않음', note: '몫의 소수점을 한 자리 왼쪽으로 옮겼어요',
      build(figure) {
        // 숫자는 그대로 두고 소수점만 한 자리 왼쪽으로 옮긴다.
        if (figure.quotientPointAt === null || figure.quotientPointAt < 1) return null;
        return {
          quotient: figure.quotient, quotientPointAt: figure.quotientPointAt - 1,
          displayed: figure.displayed, rows: figure.rows
        };
      }
    },
    'zero-dropped': {
      label: '0을 빠뜨려 자릿값을 바꿈', note: '몫에서 0을 빠뜨렸어요',
      build(figure) {
        const ordered = figure.quotient.slice().sort((left, right) => left.slot - right.slot);
        let at = -1;
        ordered.forEach((cell, index) => { if (at < 0 && index > 0 && cell.ch === '0') at = index; });
        if (at < 0) return null;                                   // 몫에 0이 없으면 쓸 수 없다
        const cells = [];
        ordered.forEach((cell, index) => {
          if (index === at) return;                                // 0을 빠뜨리고 뒤 숫자를 당겨 쓴다
          cells.push({ slot: cell.slot - (index > at ? 1 : 0), ch: cell.ch });
        });
        const fraction = cells.filter(cell => figure.quotientPointAt !== null &&
          cell.slot >= figure.quotientPointAt);
        return {
          quotient: cells, quotientPointAt: fraction.length ? figure.quotientPointAt : null,
          displayed: figure.displayed, rows: figure.rows
        };
      }
    },
    'stop-early': {
      label: '0을 빠뜨려 자릿값을 바꿈', note: '끝에 0을 내리지 않고 끝냈어요',
      build(figure) {
        const given = digitsOf(figure.a).length;
        const hideAppended = figure.displayed.length > given;
        const keep = hideAppended ? given : Math.max(1, given - 1);
        if (figure.steps.length <= keep) return null;
        const wrong = divisionModel(figure.a, figure.b, figure.answer,
          { hideAppended: hideAppended, keepSteps: keep });
        if (wrong.remainder === 0) return null;                    // 나머지가 0이면 '덜 나눔'이 아니다
        return {
          quotient: wrong.quotient, quotientPointAt: wrong.quotientPointAt,
          displayed: wrong.displayed, rows: wrong.rows
        };
      }
    }
  };

  // 오류 유형 순서. 쓸 수 없는 유형은 그 문항에서 건너뛴다.
  const KIND_IDS = ['point-dropped', 'point-shifted', 'zero-dropped', 'stop-early'];

  // 오류 이름은 spec 의 errorKinds 문구를 그대로 쓴다(개념에 따라 다른 문구를 쓴다).
  function labelFor(conceptId, kindId) {
    if (conceptId !== '2-4-1-3') return KINDS[kindId].label;
    if (kindId === 'point-dropped') return '몫의 소수점 위치를 잘못 표시';
    if (kindId === 'zero-dropped') return '몫의 0이나 피제수 끝에 붙인 0을 빠뜨림';
    if (kindId === 'stop-early') return '나머지를 원래 단위로 되돌리지 않음';
    return '계산 결과의 크기를 확인하지 않음';
  }

  function noteFor(conceptId, kindId) {
    if (kindId === 'stop-early') {
      return conceptId === '2-4-1-3'
        ? '끝까지 나누지 않고 남은 수를 그대로 썼어요'
        : '끝에 0을 내리지 않고 끝냈어요';
    }
    return KINDS[kindId].note;
  }

  /* ================= 7. 서식(렌더러) ================= */

  const FORMATS = {
    vertical: 'ko241-division-vertical',
    blank: 'ko241-division-blank',
    correction: 'ko241-division-error-fix'
  };

  const ITEM_CSS = [
    '.ko241-item{position:absolute;inset:2mm 1mm 1mm 6mm;display:flex;align-items:flex-start;gap:1.6mm;}',
    '.ko241-wrong{flex:1 1 50%;min-width:0;}',
    '.ko241-right,.ko241-work{flex:1 1 50%;min-width:0;border-left:1px dashed #c8c8c8;padding-left:1.4mm;height:100%;}',
    '.ko241-work{border:1px dashed #c8c8c8;padding:1mm 1mm 0 1.5mm;}',
    '.ko241-grid{font-size:9.5pt;line-height:1.3;}',
    '.ko241-line{display:grid;align-items:center;height:1.3em;}',
    '.ko241-line.ko241-rule{height:.44em;}',
    '.ko241-rule-line{border-top:1px solid #111;}',
    '.ko241-cell{text-align:center;font-variant-numeric:tabular-nums;}',
    '.ko241-divisor{text-align:right;white-space:nowrap;}',
    '.ko241-mark{background:#dedede;box-shadow:inset 0 -2px 0 #111;}',
    '.ko241-answer .ko241-right .ko241-cell{color:#d71f10;}',
    '.ko241-work-hint{font-size:9.5pt;color:#bbb;white-space:nowrap;}',
    '.ko241-note{position:absolute;left:0;right:0;bottom:.6mm;font-size:7pt;line-height:1.25;color:#444;white-space:normal;overflow-wrap:anywhere;text-align:center;}'
  ].join('');

  function installItemStyle() {
    if (typeof document === 'undefined' || !document.head) return;
    if (document.getElementById('ko241-item-style')) return;
    const style = document.createElement('style');
    style.id = 'ko241-item-style';
    style.textContent = ITEM_CSS;
    document.head.appendChild(style);
  }

  function node(tag, className, value) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (value !== undefined) el.textContent = value;
    return el;
  }

  // t2 세로 나눗셈으로 계산하기
  function renderVertical(cell, question, show, config) {
    installStyle();
    const figure = question.figure || divisionModel(question.a, question.b, question.answer, {});
    cell.insertAdjacentHTML('beforeend', figureSvg(figure, {
      solution: !!show,
      ink: !!show,
      guide: (config && config.workLines) || 6
    }));
  }

  // t3 세로 풀이의 빈칸 채우기 — 계산 과정을 보여 주고 한 자리만 □ 로 비운다.
  function renderBlank(cell, question, show) {
    installStyle();
    const figure = question.figure || divisionModel(question.a, question.b, question.answer, {});
    cell.insertAdjacentHTML('beforeend', figureSvg(figure, {
      solution: true,
      ink: false,
      blank: question.blank || null,
      reveal: !!show                     // 정답지에서는 비운 자리만 빨강으로 채운다
    }));
  }

  // t4 잘못된 나눗셈 과정 고치기 — 왼쪽에 틀린 풀이, 오른쪽에 바르게 고쳐 쓰는 칸.
  function renderCorrection(cell, question, show) {
    installStyle();
    installItemStyle();
    const figure = question.figure || divisionModel(question.a, question.b, question.answer, {});
    const wrong = question.wrong || null;
    const marks = (question.wrongMarks || []).join(',');
    const wrap = node('div', 'ko241-item' + (show ? ' ko241-answer' : ''));

    const left = node('div', 'ko241-wrong');
    left.innerHTML = figureSvg(wrong ? { ...figure, ...wrong } : figure, { solution: true });
    wrap.appendChild(left);

    if (show) {
      const right = node('div', 'ko241-right');
      right.innerHTML = figureSvg(figure, { solution: true, ink: true });
      wrap.appendChild(right);
    } else {
      const work = node('div', 'ko241-work');
      // Empty rewrite frame.
      wrap.appendChild(work);
    }
    {                                    // 줄이 많은 풀이는 글자를 줄여 칸·설명 줄을 넘지 않게 한다
      const units = list => 2 + list.reduce((n, r) => n + 1 + (r.rule ? .34 : 0), 0);
      const lines = Math.max(units(figure.rows), wrong ? units(wrong.rows) : 0);
      const pt = Math.min(12.5, 9.5 * (show ? 148 : 165) / (16.5 * Math.max(1, lines)));
      wrap.style.fontSize = pt.toFixed(2) + 'pt';   // 정답지의 틀린 풀이는 sheet.css 가 글자 크기를 상속(1em)으로 고정하므로 바깥 상자에 둔다
      wrap.querySelectorAll('.ko241-grid').forEach(g => { g.style.fontSize = '1em'; });
    }
    cell.appendChild(wrap);
  }

  // 세로셈 한 벌을 HTML 격자로 그린다. 자리 칸 폭이 고정이라 숫자가 칸에 맞는다.
  //   figure: 자료 / wrong: 틀린 풀이(없으면 바른 풀이) / show: 정답지 / marks: 강조할 칸 번호
  function htmlStack(figure, wrong, show, marks) {
    const source = wrong || figure;
    const slots = figure.slots;
    const dividendPointAt = source.displayed.length > figure.intDigits ? figure.intDigits : null;
    const quotientVisible = wrong ? true : !!show;                  // 틀린 풀이는 언제나 그대로 보여 준다
    // 소수점 자리(경계)마다 좁은 칸을 둔다. 틀린 풀이는 소수점 자리가 다를 수 있다.
    const columns = ['1.9em'];
    for (let index = 0; index < slots; index++) {
      columns.push('1em');
      columns.push('.26em');
    }
    const template = columns.join(' ');
    const slotColumn = index => 2 + index * 2;
    const pointColumn = boundary => boundary * 2 + 1;
    const marked = String(marks || '').split(',').filter(Boolean);
    const grid = node('div', 'ko241-grid');

    const addRow = className => {
      const row = node('div', 'ko241-line ' + className);
      row.style.gridTemplateColumns = template;
      grid.appendChild(row);
      return row;
    };
    const addCell = (row, column, text, klass) => {
      const item = node('span', 'ko241-cell' + (klass ? ' ' + klass : ''), text);
      item.style.gridColumn = String(column);
      row.appendChild(item);
      return item;
    };

    const quotientRow = addRow('ko241-quotient');
    source.quotient.forEach(cell => {
      const isMarked = marked.indexOf(String(cell.slot)) >= 0;
      addCell(quotientRow, slotColumn(cell.slot),
        quotientVisible ? cell.ch : '', isMarked ? 'ko241-mark' : '');
    });
    if (show) {
      // 자리를 빠뜨린 오류는 틀린 풀이에 그 자리가 없다 → 빈 표시칸을 세워 보여 준다.
      marked.forEach(slotText => {
        const slot = Number(slotText);
        if (!source.quotient.some(cell => cell.slot === slot)) {
          addCell(quotientRow, slotColumn(slot), ' ', 'ko241-mark');
        }
      });
    }
    if (quotientVisible && source.quotientPointAt !== null &&
      source.quotientPointAt !== undefined) {
      addCell(quotientRow, pointColumn(source.quotientPointAt), '.');
    }

    const headRow = addRow('ko241-head');
    addCell(headRow, 1, String(figure.b) + ' │', 'ko241-divisor');
    source.displayed.split('').forEach((ch, index) => addCell(headRow, slotColumn(index), ch));
    if (dividendPointAt !== null) addCell(headRow, pointColumn(dividendPointAt), '.');

    source.rows.forEach(row => {
      const line = addRow('ko241-' + row.kind);
      row.cells.forEach(cell => addCell(line, slotColumn(cell.slot), cell.ch));
      if (row.rule) {                                              // 곱셈 줄 아래 가로줄
        const rule = addRow('ko241-rule');
        const bar = node('span', 'ko241-rule-line');
        bar.style.gridColumn = slotColumn(row.from) + ' / ' + (slotColumn(row.to) + 1);
        rule.appendChild(bar);
      }
    });
    return grid;
  }

  /* ================= 8. 유형 정의 ================= */

  // roadmap(worksheet-types.json)의 유형 이름. 화면 머리말은 짧은 이름을 쓴다.
  const TYPE_TITLES = {
    t1: { short: '가로셈', roadmap: '가로식으로 몫 구하기' },
    t2: { short: '세로셈', roadmap: '세로 나눗셈으로 계산하기' },
    t3: { short: '세로셈 빈칸', roadmap: '세로 풀이의 빈칸 채우기' },
    t4: { short: '잘못된 풀이 고치기', roadmap: '잘못된 나눗셈 과정 고치기' }
  };

  // 한 줄 머리말의 이름·날짜 칸을 침범하지 않도록 t4의 화면 제목만 줄인다.
  const CORRECTION_TITLES = {
    '2-4-1-0': '소수 첫째 자리÷자연수',
    '2-4-1-1': '소수 둘째 자리÷자연수',
    '2-4-1-2': '소수 끝에 0 내려 계산',
    '2-4-1-3': '자연수÷자연수(소수 몫)'
  };

  const INSTRUCTIONS = {
    t1: '식을 계산하고 답을 쓰세요.',
    t2: '소수점을 맞추어 세로로 계산하고 답을 쓰세요.',
    t3: '계산 과정을 살펴보고 □ 안에 알맞은 수를 쓰세요.',
    t4: '잘못된 곳을 찾아 바르게 고쳐 쓰세요.'
  };

  const INSTRUCTION_WHOLE = '몫을 소수로 나타내어 세로로 계산하고 답을 쓰세요.';

  const LAYOUTS = {
    t1: { format: 'horizontal', cols: 3, rows: 13, fontPt: 18 },
    t2: { format: FORMATS.vertical, cols: 4, rows: 5, workLines: 5 },
    t3: { format: FORMATS.blank, cols: 4, rows: 5, workLines: 5 },
    t4: { format: FORMATS.correction, cols: 3, rows: 4 }
  };

  const TYPES = [];
  Object.keys(CONCEPTS).forEach(conceptId => {
    ['t1', 't2', 't3', 't4'].forEach(kind => {
      const layout = LAYOUTS[kind];
      const type = {
        typeId: conceptId + '-' + kind,
        group: '2-4-1',
        concept: conceptId,
        kind: kind,
        roadmapTitle: TYPE_TITLES[kind].roadmap,
        title: kind === 't4' ? CORRECTION_TITLES[conceptId] :
          CONCEPTS[conceptId].label + ' · ' + TYPE_TITLES[kind].short,
        instruction: kind === 't2' && conceptId === '2-4-1-3'
          ? INSTRUCTION_WHOLE : INSTRUCTIONS[kind],
        format: layout.format,
        cols: layout.cols,
        rows: layout.rows,
        count: layout.cols * layout.rows,
        autoFit: false,
        maxProblems: layout.cols * layout.rows,
        fontPt: layout.fontPt || 12,
        seed: 20261001,
        gen: {
          ko241: true,
          concept: conceptId,
          kind: kind,
          legacyId: CONCEPTS[conceptId].sources[0]
        }
      };
      if (layout.workLines) type.workLines = layout.workLines;
      TYPES.push(type);
    });
  });

  const byId = {};
  TYPES.forEach(type => { byId[type.typeId] = type; });

  /* ================= 9. 유형별 문항 만들기 ================= */

  // t3 는 □ 로 비울 자리를 하나 고른다(0은 피한다).
  function blankSpot(figure, seed, index) {
    const spots = [];
    figure.quotient.forEach(cell => spots.push({ row: 'q', slot: cell.slot, ch: cell.ch }));
    figure.rows.forEach((row, rowIndex) => {
      if (row.kind === 'rule') return;
      row.cells.forEach(cell => {
        if (cell.ch !== '−') spots.push({ row: rowIndex, slot: cell.slot, ch: cell.ch });
      });
    });
    if (!spots.length) throw Error('빈칸으로 만들 자리가 없습니다.');
    const preferred = spots.filter(spot => spot.ch !== '0');
    const list = preferred.length ? preferred : spots;
    return list[(Number(seed) + index * 7) % list.length];
  }

  // t4 는 오류 유형마다 쓸 수 있는 문항이 다르므로, 유형이 골고루 나오도록 문항을 고른다.
  function correctionQuestions(conceptId, seed, count) {
    const poolSize = Math.min(count + 14, conceptId === '2-4-1-3' ? 120 : 60);
    const pool = drawQuestions(conceptId, seed, poolSize);
    const kinds = KIND_IDS;
    const used = new Set(), items = [];

    const buildItem = (question, kindId, index) => {
      const figure = divisionModel(question.a, question.b, question.answer, {});
      const wrong = KINDS[kindId].build(figure);
      if (!wrong) return null;
      // 값이 같으면 오류가 아니다 (숫자·소수점 자리로 값을 정확히 견준다).
      if (valueKey(figure.quotient, figure.quotientPointAt) ===
        valueKey(wrong.quotient, wrong.quotientPointAt)) return null;
      // 바른 몫과 자리가 다른 칸(빠진 칸 포함)을 표시한다. 소수점만 다른 경우에는 몫 전체를 표시한다.
      const wrongBySlot = {};
      wrong.quotient.forEach(cell => { wrongBySlot[cell.slot] = cell.ch; });
      let marks = figure.quotient.filter(cell => wrongBySlot[cell.slot] !== cell.ch).map(cell => cell.slot);
      if (!marks.length) marks = wrong.quotient.map(cell => cell.slot);
      if (!marks.length) return null;
      return {
        a: question.a, b: question.b, op: question.op, answer: question.answer,
        figure: figure, wrong: wrong, errorKind: kindId,
        errorLabel: labelFor(conceptId, kindId), errorNote: noteFor(conceptId, kindId),
        wrongMarks: marks, index: index
      };
    };

    // 1) 오류 유형마다 한 문항씩 먼저 확보한다(모든 유형이 문제지에 나오게).
    kinds.forEach((kindId, order) => {
      if (items.length >= count) return;
      for (let offset = 0; offset < pool.length; offset++) {
        const question = pool[(order * 5 + offset) % pool.length];
        const key = question.a + ':' + question.b;
        if (used.has(key)) continue;
        const item = buildItem(question, kindId, items.length);
        if (!item) continue;
        used.add(key);
        items.push(item);
        return;
      }
    });
    // 2) 남은 자리는 남은 문항으로 채운다.
    let cursor = 0;
    while (items.length < count && cursor < pool.length) {
      const question = pool[cursor];
      cursor += 1;
      const key = question.a + ':' + question.b;
      if (used.has(key)) continue;
      let item = null;
      for (let step = 0; step < kinds.length && !item; step++) {
        item = buildItem(question, kinds[(items.length + step) % kinds.length], items.length);
      }
      if (!item) continue;
      used.add(key);
      items.push(item);
    }
    if (items.length < count) {
      throw Error(conceptId + ': 잘못된 풀이를 만들 문항 ' + count + '개를 채우지 못했습니다 (' + items.length + '개).');
    }
    items.sort((x, y) => difficulty(x) - difficulty(y) || String(x.a).localeCompare(String(y.a)));
    return items;
  }

  function questionsFor(config) {
    const gen = config.gen || {};
    const type = byId[config.typeId] || { concept: gen.concept, kind: gen.kind };
    if (!type.concept || !type.kind) throw Error('2-4-1 묶음의 유형이 아닙니다: ' + config.typeId);
    if (typeof document !== 'undefined') {
      document.body.dataset.ko241Title = type.kind === 't4' ? '' : 'compact';
      installStyle();
    }
    const count = config.count || (config.cols * config.rows);
    const seed = Number(config.seed) || 1;
    if (type.kind === 't4') return correctionQuestions(type.concept, seed, count);
    const questions = drawQuestions(type.concept, seed, count);
    return questions.map((question, index) => {
      const item = { a: question.a, b: question.b, op: question.op, answer: question.answer };
      if (type.kind === 't3') {
        const figure = divisionModel(item.a, item.b, item.answer, {});
        item.figure = figure;
        item.blank = blankSpot(figure, seed, index);
      }
      return item;
    });
  }

  /* ================= 10. sheet.js 연결 ================= */

  const mine = new Set();

  function install() {
    if (root.Sheet && typeof root.Sheet.register === 'function') {
      [[FORMATS.vertical, renderVertical], [FORMATS.blank, renderBlank], [FORMATS.correction, renderCorrection]]
        .forEach(entry => {
          try {
            root.Sheet.register(entry[0], entry[1]);
            mine.add(entry[0]);
          } catch (error) {
            // 이미 다른 구현이 등록한 서식은 건드리지 않는다(sheet.js 는 중복 등록을 막는다).
          }
        });
    }
    const base = root.SheetGen;
    if (base && typeof base.generate === 'function' && !base.__ko241) {
      const original = base.generate;
      // 이 묶음의 유형(gen.ko241)일 때만 이 파일의 문항을 낸다. 다른 서식의 생성은 건드리지 않는다.
      base.generate = function (config) {
        if (config && config.gen && config.gen.ko241) return questionsFor(config);
        return original.apply(this, arguments);
      };
      Object.defineProperty(base, '__ko241', { value: true });
    }
    if (Array.isArray(root.SheetCatalog)) {
      TYPES.forEach(type => {
        if (!root.SheetCatalog.some(entry => entry.typeId === type.typeId)) root.SheetCatalog.push(type);
      });
    }
  }

  install();

  root.Ko241 = {
    types: TYPES,
    concepts: CONCEPTS,
    kinds: KINDS,
    formats: FORMATS,
    accepts: accepts,
    answerOf: answerOf,
    divisionModel: divisionModel,
    blankSpot: blankSpot,
    questions: questionsFor,
    installStyle: installStyle,
    figure: figureSvg
  };
})(globalThis);
