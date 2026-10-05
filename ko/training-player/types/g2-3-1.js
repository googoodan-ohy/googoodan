/* 묶음 2-3-1 — 소수와 자연수의 곱셈 유형 16종 (제작자 A, 2026-10-01 · 검수 반영 2026-10-02, 2회차)
   2회차(검수자 D 2회차, 2026-10-02) 반영:
     ① 2-3-1-2 빈칸 채우기(t3)는 문제지에 부분곱을 인쇄하지 않는다 — 두 부분곱을 그대로 보여 주면
        □ 를 곱셈 없이 그 두 수의 덧셈으로 채울 수 있었다. 정답지에는 그대로 보여 준다.
     ② 2-3-1-3 고치기(t4)의 세 번째 오류를 '곱의 끝 0을 지움'에서 '올림한 수를 더하지 않음'으로
        바꾼다 — 위 '잘못된 계산 과정 고치기' 설명 참고.

   개념(prototypes\training-roadmap-20261001\worksheet-types.json):
     2-3-1-0  소수 첫째 자리 × 자연수      소수 한 자리 × 두 자리 미만 자연수
     2-3-1-1  소수 둘째 자리 × 자연수      소수 두 자리 × 두 자리 미만 자연수
     2-3-1-2  자연수 × 소수                두 자리 자연수(10~20) × 소수 한 자리
     2-3-1-3  곱의 끝에 0이 생기는 경우    소수 한 자리 × 자연수, 곱의 끝자리가 0
   유형(개념마다 4종): ① 가로셈 ② 세로셈 ③ 세로 풀이의 빈칸 채우기 ④ 잘못된 계산 과정 고치기

   - 문제와 정답은 사이트의 기존 생성기(Worksheets.generate)에서 가져온다.
     types.js 의 decimal-mul-1dp-0dp / decimal-mul-2dp-0dp / decimal-mul-0dp-1dp 를 그대로 쓰고,
     개념 이름의 조건(소수 자릿수, 자연수의 범위, 곱의 끝 0)에 맞지 않는 문항은 버리고 더 뽑는다.
     새 문제 엔진은 만들지 않는다.
   - 곱하는 자연수의 범위
       2-3-1-0 · 2-3-1-1 · 2-3-1-3 : 2~9.  검수 지적(2026-10-02) 뒤에도 한 자리로 둔다 —
         ×10 은 곱이 반드시 0 으로 끝나 '곱의 끝에 0이 생기는 경우'(2-3-1-3)와 구별되지 않고,
         ×1 은 곱이 곱해지는 수 그대로여서 연습이 되지 않는다. 명세 spec-decimal.json 의
         wholeMultiplierRange [1,10] 은 이 두 이유로 2~9 로 고쳐 적어야 한다(명세 파일은 이 묶음의
         쓰기 범위 밖이라 이 파일에는 적지 못했다).
       2-3-1-2 : 10~20.  명세 wholeMultiplierRange [1,20] 과 개념 이름('자연수 × 소수')대로 두 자리
         자연수를 곱한다. 한 자리 자연수만 쓰면 2-3-1-0 과 순서만 바꾼 같은 문제지가 되므로,
         한 장 안의 문제 모양을 맞추기 위해(§5) 이 개념은 모두 두 자리 자연수만 쓴다.
         1~9 는 2-3-1-0·1 이 이미 다루므로 겹치지 않는다.
   - 소수점 아래 끝자리가 0인 곱(2.5×4=10.0)은 '곱의 끝에 0이 생기는 경우' 개념에서만 다룬다.
   - 0.4×6 처럼 소수가 1보다 작은 문항은 10% 이하로만 넣는다(layout-rules §2).
     소수 자릿값이 10보다 작은 수(0.1, 0.01~0.09)는 쓰지 않는다.
   - 곱하는 자연수는 한 장 안에서 고르게 뽑는다(자연수별로 돌아 가며). 곱의 끝이 0인 개념은
     ×5 에서 조건이 가장 쉽게 성립해, 앞에서부터 담으면 ×5 만 40~60% 를 차지했다(검수 지적).
   - 곱은 소수 자릿수를 그대로 살려 쓴다(2.5×4=10.0). 끝 0을 지운 값(10)도 같은 수이므로
     정답지에서 '10.0 = 10' 처럼 함께 보여 준다. 그래서 빈칸 채우기(2-3-1-3)는 답의 끝자리 0 을
     가리지 않는다 — 계산 없이 0 을 써도 맞는 자리이기 때문이다(검수 지적).
   - 2-3-1-2 의 세로셈(t2~t4)은 소수를 위에, 곱하는 두 자리 자연수를 아래에 쓴다(곱셈의 교환법칙).
     두 자리 수를 곱할 때는 부분곱 두 줄을 두고(§2 '×두 자리', 빈칸 문제지에서는 이 두 줄을 비워
     둔다 — 위 2회차 ①), 곱하는 수가 한 자리인 개념에는
     받아올림 줄을 둔다. 부분곱을 쓰는 개념은 한 자리 곱셈과 문제 모양이 섞이지 않도록
     받아올림 줄을 두지 않는다(공용 formats-decimal.js 의 decimalMul 과 같은 방식).
   - '잘못된 계산 과정 고치기'는 기존 생성기가 낸 문제 위에 틀린 풀이만 얹는다
     (formats-errorfix.js 와 같은 방식). 틀린 값은 바른 값과 반드시 달라야 한다 —
     자릿값만 바뀌고 수가 같은 오류(0.8 → .8)는 쓰지 않는다.
     오류는 개념마다 명세 errorKinds 를 이 개념에서 성립하는 형태로 옮겨 2~3가지 쓴다:
       2-3-1-0·1 : 소수점을 쓰지 않음 / 소수 자릿수를 하나 더 셈 / 올림한 수를 더하지 않음
       2-3-1-2 : 소수점을 쓰지 않음 / 소수 자릿수를 하나 더 셈 / 부분곱 자리를 어긋나게 더함
       2-3-1-3 : 소수점을 쓰지 않음 / 소수 자릿수를 하나 더 셈 / 올림한 수를 더하지 않음
       (명세의 '곱이 1보다 작을 때 앞의 0을 빠뜨림'은 수가 같아져 이 묶음에서는 쓰지 않는다.)
       2-3-1-3 에서 '곱의 끝 0을 지움'은 쓰지 않는다(검수 지적 2-3-1-D 2회차): 곱이 0 으로 끝나는
       문항에서는 ① 끝 0을 지운 값은 바른 답과 같은 수이고 ② 소수점을 떼고 곱한 수의 끝 0을 지운
       값(18.0 → 1.8)은 '소수 자릿수를 하나 더 셈'(18.0 → 1.80)과 언제나 같은 수가 되어, 화면에
       다른 값으로 드러나지 않으면서 설명 문구와도 어긋난다. 그래서 올림 오류를 대신 쓴다.
   - 명세 spec-decimal.json 2-3-1-* 16행은 이 파일(문제지)과 아직 다르다 — 명세 파일은 이 묶음의
     쓰기 범위 밖이라 고치지 못했다(2회차 검수자 D 도 '명세 파일만 고친다'로 적었다). 다른 점:
     ① 세로셈(t2) instruction 이 '소수점을 맞추어…'인데 실제는 '자연수와 같이 계산한 뒤…'(곱셈은
        소수점을 맞추는 것이 아니므로 구현이 맞다) ② 2-3-1-3 params.operandPlaces [1,1] 이 실제
        [1,0](소수 × 자연수)과 다름 ③ wholeMultiplierRange 가 실제 범위(2~9, 2-3-1-2 는 11~19)를
        담지 못함 ④ layout·count 가 규칙 §4 형식({cols,rows,count,fontPt,workLines})이 아니고 실제
        문제지(가로셈 3×15, 세로셈·빈칸 5×7, 고치기 3×5, 자동 맞춤으로 줄 수가 늘어남)와 다름.
     명세는 tools\build_decimal_spec.py 가 만드는 파일이라, 고치려면 그 생성기 쪽에 묶음별 예외를
     넣고 다시 만들어야 한다.
   - 머리말 제목은 제목 칸 55mm 안에 들어가야 해서(layout-rules §2 한 줄) 검수 지적의 긴 이름을
     줄여 쓴다 — '소수 첫째 자리 곱셈'(×자연수 생략), '곱의 끝이 0인 곱셈'. 실제 글자 폭은
     tmp-2-3-1-A/probe.html 로 재서 확인했다(최대 53.3mm < 55mm).
   - 이 파일은 유형 정의와 이 묶음 전용 렌더러만 담는다. 공용 파일(sheet.js, formats-*.js,
     catalog.js, sheet.css)은 고치지 않는다. 가로셈은 공용 'horizontal' 서식을 그대로 쓴다.
*/
(function (root) {
  'use strict';

  /* ================= 1. 공통 도구 ================= */

  const BUNDLE = '2-3-1';
  const NBSP = ' ';
  const node = (tag, className, value) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (value !== undefined) el.textContent = value;
    return el;
  };

  // 칸 너비는 한 장 안에서 모두 같아야 하므로 자리 폭을 config.stack 에 담아 두고 쓴다.
  // 올림 줄은 글자를 .65em 로 작게 쓰므로 칸 폭을 같은 배율(.65)로 나누어 아래 숫자 칸과 폭을 맞춘다.
  // 공용 sheet.css 의 '.carry-row .vertical-digit{font-size:.65em}' 까지 겹치면 글자가 .65² 로
  // 줄어 칸 폭 계산이 어긋나므로(검수 지적 2-3-1-B/C) 올림 칸에 font-size:1em 을 못박는다.
  const SLOT = { vertical: 0.95, blank: 0.95, correction: 0.8 };
  const CSS = [
    '.g231-stack{width:max-content;max-width:100%;margin:0 auto;font-variant-numeric:tabular-nums;}',
    '.g231-stack .vertical-digit{width:var(--g231-slot,1.12em);}',
    '.g231-stack .vertical-sign{width:.7em;}',
    '.g231-stack .g231-point{width:var(--g231-point,.5em);}',
    '.g231-partial{color:#555;}',
    '.g231-partial-rule{border-top:1px solid #111;}',   // 곱하는 수와 부분곱 사이의 가로줄(§2 '×두 자리')
    // 바르게 고쳐 쓰는 빈 세로셈 틀(문제지) — 왼쪽 틀린 풀이와 같은 자리 폭을 쓴다.
    '.g231-rewrite{width:100%;margin:0;display:flex;flex-direction:column;align-items:flex-end;}',
    '.g231-rewrite .vertical-row{height:2.1em;}',
    '.g231-stack .carry-row{font-size:.65em;height:1.6em;color:#777;}',
    '.g231-stack .carry-row .vertical-sign{width:calc(.7em / .65);}',
    '.g231-stack .carry-row .vertical-digit{font-size:1em;width:calc(var(--g231-slot,1.12em) / .65);height:1.4em;border:1px solid #bbb;}',
    '.g231-stack .carry-row .g231-point{width:calc(var(--g231-point,.5em) / .65);}',
    '.g231-plain{border-color:transparent !important;}',
    '.g231-blank{border:1px solid #688c85;background:transparent;box-sizing:border-box;border-radius:0;}',
    '.g231-marked{background:#dedede;box-shadow:inset 0 -2px 0 #111;}',
    '.g231-answer{color:#b32b2b;}',
    '.g231-fix{display:flex;width:100%;box-sizing:border-box;gap:1.5mm;height:100%;padding:0 2.5mm 1mm 0;font-size:.9em;}',
    '.g231-wrong{flex:0 0 auto;}',
    '.g231-right{flex:1 1 auto;min-width:0;border-left:1px dashed #c8c8c8;padding-left:1.5mm;}',
    '.g231-frame{flex:1 1 45%;min-width:16mm;box-sizing:border-box;border:1px solid #ddd;padding:1mm;display:flex;flex-direction:column;justify-content:center;align-items:flex-start;}',
    // 주석줄은 흐름 안에 두어 세로셈과 겹치지 않게 한다(검수 지적 2-3-1-C).
    // 고치기(한 칸에 두 세로셈)만 아래쪽에 절대 위치로 붙인다 — 세로셈이 짧아 겹치지 않는다.
    '.g231-note{margin-top:.8mm;font-size:7.5pt;line-height:1.25;color:#444;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
    '.g231-fix .g231-note{position:absolute;left:6mm;right:1mm;bottom:1mm;margin:0;}'
  ].join('');

  function installStyle() {
    if (document.getElementById('g231-style')) return;
    const style = node('style');
    style.id = 'g231-style';
    style.textContent = CSS;
    document.head.append(style);
  }

  /* ================= 2. 소수 자릿값 ================= */

  function decimalPlaces(value) {
    const text = String(value);
    const dot = text.indexOf('.');
    return dot < 0 ? 0 : text.length - dot - 1;
  }

  // 소수점을 뗀 정수. 0.4 → 4, 19.95 → 1995.
  function scaledOf(value) {
    return Number(String(value).replace('.', ''));
  }

  // 끝자리 0 을 지우지 않고 소수 자릿수를 그대로 유지한다(소수점 위치 연습).
  function fixedDecimal(scaled, places) {
    if (places <= 0) return String(scaled);
    const text = String(scaled).padStart(places + 1, '0');
    return text.slice(0, text.length - places) + '.' + text.slice(text.length - places);
  }

  // 곱셈 과정에서 다음 자리로 넘어가는 올림. 곱해지는 수와 같은 글자 수의 배열로 돌려준다.
  // (소수점 자리에는 올림 칸이 없다.)
  function carryMarks(multiplicand, multiplier) {
    const text = String(multiplicand);
    const slots = [];
    for (let i = 0; i < text.length; i++) if (text[i] !== '.') slots.push(i);
    const marks = new Array(text.length).fill('');
    let carry = 0;
    for (let k = slots.length - 1; k >= 0; k--) {
      const value = Number(text[slots[k]]) * multiplier + carry;
      carry = Math.floor(value / 10);
      if (k > 0) marks[slots[k - 1]] = carry ? String(carry) : '';
    }
    return marks;
  }

  /* ================= 3. 개념 ================= */

  // decimalFirst: 소수(곱해지는 수)가 세로셈 위에 오는가. false 면 자연수가 앞에 온다(2-3-1-2 는 세로셈에서
  //   교환법칙으로 소수를 위에 올린다 — 아래 stack 참고).
  // factor: 곱하는 자연수의 범위.  label 은 머리말에 들어가는 짧은 이름(제목 칸이 55mm 라 길면 잘린다).
  // wrongs: 이 개념에서 쓸 수 있는 오류 종류(값이 바른 답과 달라지는 것만).
  const CONCEPTS = [
    { id: '2-3-1-0', label: '소수 첫째 자리 곱셈', full: '소수 첫째 자리 × 자연수', places: 1,
      decimalFirst: true, endZero: false, factor: [2, 9],
      wrongs: ['point-missing', 'point-shifted', 'carry-lost'] },
    { id: '2-3-1-1', label: '소수 둘째 자리 곱셈', full: '소수 둘째 자리 × 자연수', places: 2,
      decimalFirst: true, endZero: false, factor: [2, 9],
      wrongs: ['point-missing', 'point-shifted', 'carry-lost'] },
    { id: '2-3-1-2', label: '자연수 × 소수', full: '자연수 × 소수', places: 1,
      decimalFirst: false, endZero: false, factor: [10, 20], partials: true,
      wrongs: ['point-missing', 'point-shifted', 'partial-shift'] },
    { id: '2-3-1-3', label: '곱의 끝이 0인 곱셈', full: '곱의 끝에 0이 생기는 경우', places: 1,
      decimalFirst: true, endZero: true, factor: [2, 9],
      wrongs: ['point-missing', 'point-shifted', 'carry-lost'] }
  ];

  // types.js 의 decimal-mul-<소수자리>dp-<자연수자리>dp
  function sourceOf(concept) {
    return 'decimal-mul-' + (concept.decimalFirst ? concept.places + 'dp-0dp' : '0dp-' + concept.places + 'dp');
  }

  // 개념 조건에 맞는 문항인가.
  function accepts(row, concept) {
    if (row.op !== '×') return false;
    const decimal = String(concept.decimalFirst ? row.a : row.b);
    const natural = String(concept.decimalFirst ? row.b : row.a);
    if (decimalPlaces(decimal) !== concept.places) return false;
    if (decimalPlaces(natural) !== 0) return false;
    const factor = Number(natural);
    if (!Number.isInteger(factor) || factor < concept.factor[0] || factor > concept.factor[1]) return false;
    if (scaledOf(decimal) < (concept.places >= 2 ? 10 : 2)) return false;   // 0.1(2자리는 0.01~0.09)은 너무 쉽다
    const naturalProduct = scaledOf(row.a) * scaledOf(row.b);       // 소수점을 뗀 값끼리의 곱
    if ((naturalProduct % 10 === 0) !== concept.endZero) return false;
    const shown = fixedDecimal(naturalProduct, concept.places);
    // 기존 생성기가 낸 정답과 같은 값인지 확인하고, 표기만 소수 자릿수에 맞춰 고정한다.
    if (Number(shown) !== Number(row.answer)) {
      throw Error('2-3-1: 기존 생성기 정답과 다릅니다 (' + row.a + ' × ' + row.b + ' = ' + row.answer + ')');
    }
    return true;
  }

  function isSimple(item) {
    return Number(item.decimal) < 1;                                // 0.4 × 6 처럼 쉬운 문항
  }

  /* ================= 4. 문제 만들기 ================= */

  // 두 자리 자연수를 곱할 때 세로셈에 쓰는 부분곱. 자릿값(10^i)을 반영해 소수 자릿수대로 적는다.
  //   3.5 × 12 → ['7.0', '35.0']  (7.0 + 35.0 = 42.0)
  function partialTexts(multiplicand, multiplier, places) {
    const digits = String(multiplier).split('');
    const out = [];
    for (let i = digits.length - 1; i >= 0; i--) {                 // 일의 자리부터
      const place = Math.pow(10, digits.length - 1 - i);           // 그 자리의 자릿값
      out.push(fixedDecimal(scaledOf(multiplicand) * Number(digits[i]) * place, places));
    }
    return out;
  }

  function buildItems(config) {
    const gen = config.gen || {};
    const concept = CONCEPTS.filter(c => c.id === gen.concept)[0];
    if (!concept) throw Error('2-3-1: 알 수 없는 개념 ' + gen.concept);
    const count = config.count || (config.cols || 3) * (config.rows || 4);
    const seed = Number(config.seed) || 1;
    const source = sourceOf(concept);
    const simpleLimit = Math.max(1, Math.floor(count * 0.1));
    // 자연수(곱하는 수)별로 후보를 모아 두었다가 돌아 가며 뽑는다 — 한 수에 쏠리지 않게(검수 지적).
    const buckets = new Map(), seen = new Set();
    for (let round = 0; round < 400; round++) {
      let rows;
      try {
        rows = root.Worksheets.generate(source, (seed + Math.imul(round, 104729)) >>> 0, Math.max(32, count));
      } catch (error) {
        throw Error(config.typeId + ': 기존 생성기 실패(' + source + ') — ' + error.message);
      }
      for (const row of rows) {
        if (!accepts(row, concept)) continue;
        const key = row.a + ':' + row.b;
        if (seen.has(key)) continue;
        seen.add(key);
        const natural = scaledOf(row.a) * scaledOf(row.b);
        const item = {
          a: String(row.a), b: String(row.b), op: '×',
          answer: fixedDecimal(natural, concept.places),            // 곱 (끝 0 유지)
          natural: natural,                                         // 소수점을 떼고 곱한 값
          places: concept.places,
          decimal: String(concept.decimalFirst ? row.a : row.b),
          factor: Number(concept.decimalFirst ? row.b : row.a)
        };
        const bucket = buckets.get(item.factor);
        if (bucket) bucket.push(item); else buckets.set(item.factor, [item]);
      }
      let total = 0;
      for (const list of buckets.values()) total += list.length;
      if (total >= count * 4 && round >= 12) break;
    }
    const factors = Array.from(buckets.keys()).sort((p, q) => p - q);
    const easy = [], normal = new Map();
    for (const factor of factors) {
      const list = [];
      for (const item of buckets.get(factor)) {
        if (isSimple(item)) easy.push(item); else list.push(item);   // 쉬운 문항은 모자랄 때만 쓴다
      }
      normal.set(factor, list);
    }
    const picked = [];
    let simple = 0;
    for (let round = 0; round < count && picked.length < count; round++) {
      for (const factor of factors) {
        const list = normal.get(factor);
        if (!list.length) continue;
        picked.push(list.shift());
        if (picked.length >= count) break;
      }
    }
    for (const item of easy) {
      if (picked.length >= count || simple >= simpleLimit) break;
      picked.push(item);
      simple++;
    }
    if (picked.length < count) {
      throw Error(config.typeId + ': 조건에 맞는 문항 ' + count + '개 중 ' + picked.length + '개만 만들었습니다.');
    }
    // 쉬운 것 → 어려운 것: 곱셈 값의 크기 순.
    picked.sort((p, q) => p.natural - q.natural || p.factor - q.factor ||
      (Number(p.a) - Number(q.a)) || (Number(p.b) - Number(q.b)));

    // 한 장 안의 칸 폭을 하나로 맞춘다(부분곱·틀린 풀이까지 포함해 가장 긴 줄에 맞춘다).
    let width = 1, carry = false;
    for (const item of picked) {
      if (concept.partials) item.partials = partialTexts(item.decimal, String(item.factor), concept.places);
      width = Math.max(width, item.a.length, item.b.length, item.answer.length,
        String(item.natural).length, fixedDecimal(item.natural, concept.places + 1).length,
        ...(item.partials || []).map(text => text.length));
      // 부분곱을 쓰는 개념은 부분곱 줄이 계산 과정을 보여 주므로 올림 줄을 두지 않는다.
      if (!concept.partials && String(scaledOf(item.a)).length > 1) carry = true;
    }
    // 세로셈에 적는 곱해지는 수(top)와 곱하는 수(bottom). 2-3-1-2 는 교환법칙으로 소수를 위에 올린다.
    // partialRows: 두 자리 자연수를 곱할 때 두는 부분곱 줄 수(곱하는 수의 자릿수).
    const layout = { width: width, places: concept.places, carry: carry,
      partialRows: concept.partials ? 2 : 0, swap: !concept.decimalFirst };
    config.stack = layout;

    picked.forEach((item, index) => {
      item.no = index + 1;
      if (!concept.partials) item.carryMarks = carryMarks(topOf(item, layout), item.factor);
      if (gen.kind === 'blank') item.blank = blankSlot(item, index, layout, concept);
      if (gen.kind === 'correction') item.wrong = wrongWork(item, index, layout, concept);
    });
    return picked;
  }

  /* ================= 5. 빈칸·틀린 풀이 만들기 ================= */

  // 곱의 한 자리를 가린다. 문항마다 자리를 옮겨 가며 가린다.
  // 곱의 끝이 0인 개념은 끝자리를 가리면 계산 없이 0을 써도 맞으므로 끝자리를 피한다(검수 지적).
  function blankSlot(item, index, layout, concept) {
    const digits = [];
    for (let i = 0; i < item.answer.length; i++) if (item.answer[i] !== '.') digits.push(i);
    const usable = concept.endZero && digits.length > 1 ? digits.slice(0, -1) : digits;
    return layout.width - item.answer.length + usable[index % usable.length];
  }

  // 오른쪽 끝을 맞추어 width 칸짜리 글자 배열로 만든다.
  function charsOf(value, width) {
    const text = String(value == null ? '' : value);
    const pad = Math.max(0, width - text.length);
    return (' '.repeat(pad) + text).split('');
  }

  // 정답지에 붙이는 오류 설명. 칸 폭(약 31mm) 안에 들어가야 하므로 짧게 쓴다.
  const WRONG_NOTE = {
    'point-missing': '결과에 소수점을 쓰지 않음',
    'point-shifted': '소수 자릿수를 하나 더 셈',
    'carry-lost': '올림한 수를 더하지 않음',
    'partial-shift': '부분곱 자리를 어긋나게 더함'
  };

  // 세로셈에 적는 곱해지는 수(위)와 곱하는 수(아래). 2-3-1-2 는 교환법칙으로 소수를 위에 올린다.
  const topOf = (item, layout) => (layout.swap ? item.b : item.a);
  const bottomOf = (item, layout) => (layout.swap ? item.a : item.b);

  // 부분곱을 제 자리에 놓지 않고(십의 자리 부분곱을 한 자리 옮기지 않고) 그대로 더한 값.
  // 1.3 × 12 → 부분곱 2.6 과 1.3 을 그대로 더해 3.9 (바른 값 15.6)
  function unshiftedPartials(multiplicand, multiplier, places) {
    const digits = String(multiplier).split('');
    const base = scaledOf(multiplicand);
    const out = [];
    for (let i = digits.length - 1; i >= 0; i--) {
      const place = Math.pow(10, digits.length - 1 - i);
      out.push(fixedDecimal(base * Number(digits[i]) * (place > 1 ? 1 : place), places));
    }
    return out;
  }

  // 올림을 더하지 않고 자리마다 곱한 값. 4.5 × 3 → 5×3=15 는 5만 쓰고 4×3=12 → 25 → 2.5 (바른 값 13.5)
  function lostCarryText(item, layout) {
    const text = topOf(item, layout);
    const digits = [];
    for (const ch of String(text)) {
      if (ch === '.') continue;
      digits.push(String((Number(ch) * item.factor) % 10));
    }
    return fixedDecimal(Number(digits.join('')), layout.places);
  }

  // 오류마다 만드는 값. 값이 바른 답과 같아지면 그 문항에는 쓸 수 없다(틀린 풀이가 아니므로).
  function makeWrong(kind, item, layout) {
    let text, partials = null;
    if (kind === 'point-missing') text = String(item.natural);                        // 소수점을 쓰지 않음
    else if (kind === 'point-shifted') text = fixedDecimal(item.natural, layout.places + 1);  // 자릿수를 하나 더 셈
    else if (kind === 'carry-lost') text = lostCarryText(item, layout);               // 올림한 수를 안 더함
    else if (kind === 'partial-shift') {                                              // 부분곱을 옮기지 않고 더함
      partials = unshiftedPartials(item.decimal, String(item.factor), layout.places);
      text = fixedDecimal(partials.reduce((sum, value) => sum + scaledOf(value), 0), layout.places);
    } else throw Error('2-3-1: 알 수 없는 오류 ' + kind);
    if (text === item.answer || Number(text) === Number(item.answer)) return null;
    const chars = charsOf(text, layout.width);
    const correct = charsOf(item.answer, layout.width);
    const marks = {};
    for (let i = 0; i < layout.width; i++) if (chars[i] !== correct[i]) marks[i] = 'g231-marked';
    return { kind: kind, text: text, note: WRONG_NOTE[kind], chars: chars, marks: marks, partials: partials };
  }

  // 개념마다 쓸 수 있는 오류를 번갈아 쓴다. 그 문항에서 성립하지 않는 오류는 건너뛴다.
  function wrongWork(item, index, layout, concept) {
    const kinds = concept.wrongs;
    for (let step = 0; step < kinds.length; step++) {
      const built = makeWrong(kinds[(index + step) % kinds.length], item, layout);
      if (built) return built;
    }
    throw Error('2-3-1: 틀린 풀이를 만들지 못했습니다 (' + item.a + ' × ' + item.b + ')');
  }

  /* ================= 6. 그리기 ================= */

  // 숫자 한 줄. 오른쪽 끝을 맞추고 소수점은 좁은 칸에 넣는다.
  function numberRow(chars, options) {
    const opts = options || {};
    const el = node('div', opts.className || 'vertical-row');
    el.append(node('span', 'vertical-sign', opts.sign || ''));
    for (let i = 0; i < chars.length; i++) {
      const point = chars[i] === '.';
      const cls = ['vertical-digit'];
      if (point) cls.push('g231-point');
      if (opts.slotClass) cls.push(opts.slotClass);
      if (opts.marks && opts.marks[i]) cls.push(opts.marks[i]);
      el.append(node('span', cls.join(' '), chars[i] === ' ' ? NBSP : chars[i]));
    }
    return el;
  }

  // 정답지에 쓰는 올림 칸. 곱해지는 수의 자리 위에만 칸을 둔다.
  // 빈 자리(수보다 왼쪽)는 아래 숫자 줄의 빈 자리와 같은 폭으로 그려야 열이 맞는다.
  function carryRow(multiplicand, marks, width) {
    const text = String(multiplicand);
    const chars = charsOf(text, width);
    const el = node('div', 'vertical-row carry-row');
    el.append(node('span', 'vertical-sign'));
    for (let i = 0; i < width; i++) {
      const at = i - (width - text.length);
      const cls = ['vertical-digit'];
      if (chars[i] === '.') cls.push('g231-point', 'g231-plain');
      else if (at < 0) cls.push('g231-plain');
      el.append(node('span', cls.join(' '), at >= 0 && marks && marks[at] ? marks[at] : NBSP));
    }
    el.querySelectorAll('.vertical-digit').forEach(digit => { digit.style.border = 'none'; });
    return el;
  }

  function stack(question, layout, options) {
    const opts = options || {};
    const el = node('div', 'vertical g231-stack');
    const top = topOf(question, layout), bottom = bottomOf(question, layout);
    if (opts.carry) el.append(carryRow(top, opts.carryFill || [], layout.width));
    el.append(numberRow(charsOf(top, layout.width)));
    el.append(numberRow(charsOf(bottom, layout.width), { sign: '×' }));
    if (layout.partialRows) {
      const rows = opts.partials && opts.partials.length ? opts.partials : new Array(layout.partialRows).fill('');
      rows.forEach((text, index) => {
        const digits = charsOf(text, layout.width), marks = {};
        if (opts.partialBlanks) {
          const positions = digits.map((digit, at) => /[0-9]/.test(digit) ? at : -1).filter(at => at >= 0);
          const at = positions[Math.min(index, positions.length - 1)];
          if (at !== undefined) {
            marks[at] = opts.partialAnswers ? 'g231-marked g231-answer' : 'g231-blank';
            if (!opts.partialAnswers) digits[at] = NBSP;
          }
        }
        el.append(numberRow(digits, { marks,
          className: 'vertical-row g231-partial' + (index === 0 ? ' g231-partial-rule' : '') }));
      });
    }
    el.append(numberRow(opts.result, {
      className: 'vertical-row vertical-result' + (!layout.partialRows || (opts.partials && opts.partials.some(value => String(value).trim())) ? ' vertical-rule' : ''),
      slotClass: opts.answerSlotClass,
      marks: opts.resultMarks
    }));
    return el;
  }

  // 곱의 끝 0 을 지운 값도 같은 수임을 정답지에서만 보여 준다. 보여 줄 것이 없으면 null.
  function noteLine(question) {
    const simple = String(Number(question.answer));
    if (simple === question.answer) return null;
    return node('div', 'g231-note', question.answer + ' = ' + simple);
  }

  function problemStack(question, layout, opts) {
    return stack(question, layout, Object.assign({
      carry: layout.carry,
      carryFill: null                       // 문제지에는 올림도 답도 쓰지 않는다
    }, opts || {}));
  }

  /* t2 — 세로셈. 문제지는 계산할 자리만 두고, 정답지에 올림·부분곱·답을 채운다. */
  function renderVertical(cell, question, answer, config) {
    installStyle();
    const layout = config.stack;
    cell.style.setProperty('--g231-slot', SLOT.vertical + 'em');
    cell.append(problemStack(question, layout, answer ? {
      carryFill: question.carryMarks,
      partials: question.partials,
      result: charsOf(question.answer, layout.width),
      answerSlotClass: 'g231-answer'
    } : { result: charsOf('', layout.width) }));   // 문제지 결과 줄은 비운다(정답 노출 금지)
    const note = answer ? noteLine(question) : null;
    if (note) cell.append(note);
  }

  function renderBlank(cell, question, answer, config) {
    installStyle();
    const layout = config.stack;
    cell.style.setProperty('--g231-slot', SLOT.blank + 'em');
    const chars = charsOf(question.answer, layout.width);
    const marks = {};
    marks[question.blank] = answer ? 'g231-marked' : 'g231-blank';
    if (answer) marks[question.blank] = 'g231-marked g231-answer';
    if (!answer) chars[question.blank] = NBSP;
    cell.append(problemStack(question, layout, {
      carryFill: answer ? question.carryMarks : null,
      // Hide one digit in each partial product so students must complete the multiplication.
      partials: question.partials,
      partialBlanks: true, partialAnswers: answer,
      result: chars, resultMarks: marks
    }));
    const note = answer ? noteLine(question) : null;
    if (note) cell.append(note);
  }

  // 바르게 고쳐 쓰는 빈 세로셈 틀. 왼쪽 틀린 풀이와 같은 자리 폭이라 그대로 따라 쓸 수 있다.
  function emptyStack(question, layout) {
    const el = node('div', 'vertical g231-stack g231-rewrite');
    if (layout.carry) el.append(carryRow(topOf(question, layout), [], layout.width));
    el.append(numberRow(charsOf('', layout.width)));
    el.append(numberRow(charsOf('', layout.width), { sign: '×' }));
    for (let i = 0; i < (layout.partialRows || 0); i++) {
      el.append(numberRow(charsOf('', layout.width),
        { className: 'vertical-row g231-partial' + (i === 0 ? ' g231-partial-rule' : '') }));
    }
    el.append(numberRow(charsOf('', layout.width), { className: 'vertical-row vertical-rule vertical-result' }));
    return el;
  }

  function renderCorrection(cell, question, answer, config) {
    installStyle();
    const layout = config.stack;
    cell.style.setProperty('--g231-slot', SLOT.correction + 'em');
    const wrap = node('div', 'g231-fix');
    const wrong = node('div', 'g231-wrong');
    wrong.append(stack(question, layout, {
      carry: layout.carry,
      carryFill: question.carryMarks,
      partials: question.wrong.partials || question.partials,   // 부분곱을 잘못 놓은 오류는 그 부분곱을 그대로 보여 준다
      result: question.wrong.chars,
      resultMarks: answer ? question.wrong.marks : null
    }));
    wrap.append(wrong);
    if (answer) {
      const right = node('div', 'g231-right');
      right.append(stack(question, layout, {
        carry: layout.carry, carryFill: question.carryMarks, partials: question.partials,
        result: charsOf(question.answer, layout.width), answerSlotClass: 'g231-answer'
      }));
      wrap.append(right);
    } else {
      const frame = node('div', 'g231-frame');
      // Leave the correction frame empty for the student to write the full calculation.
      wrap.append(frame);
    }
    cell.append(wrap);
  }

  function installFormats() {
    if (!root.Sheet || typeof root.Sheet.register !== 'function') return false;
    root.Sheet.register('g231-decimal-mul-vertical', renderVertical);
    // 서식 이름에 'vertical' 이 들어가야 sheet.js 의 자동 맞춤이 세로셈과 같은 칸 높이 하한을 준다
    // (검수 지적: 같은 연산의 세로셈과 빈칸 채우기는 같은 단·줄이어야 한다).
    root.Sheet.register('g231-decimal-mul-vertical-blank', renderBlank);
    root.Sheet.register('g231-decimal-mul-correction', renderCorrection);
    return true;
  }

  function installGenerator() {
    const base = root.SheetGen;
    if (!base || typeof base.generate !== 'function' || base.__g231) return false;
    const original = base.generate;
    base.generate = function (config) {
      if (config && config.gen && config.gen.bundle === BUNDLE) return buildItems(config);
      return original.apply(this, arguments);
    };
    Object.defineProperty(base, '__g231', { value: true });
    return true;
  }

  /* ================= 7. 유형 16종 ================= */

  // suffix 는 머리말에 들어가는 짧은 이름이다(제목 칸이 55mm 라 '가로셈으로 계산하기' 같은 긴 이름은 잘린다).
  const FORMS = [
    { key: 't1', suffix: '가로셈', kind: 'horizontal', format: 'horizontal',
      cols: 3, rows: 13, fontPt: 18, instruction: '식을 계산하고 답을 쓰세요.' },
    { key: 't2', suffix: '세로셈', kind: 'vertical', format: 'g231-decimal-mul-vertical',
      cols: 5, rows: 7, fontPt: 16, instruction: '자연수와 같이 계산한 뒤 소수점의 위치를 살펴 답을 쓰세요.' },
    { key: 't3', suffix: '빈칸', kind: 'blank', format: 'g231-decimal-mul-vertical-blank',
      cols: 5, rows: 7, fontPt: 16, instruction: '계산 과정을 살펴보고 □ 안에 알맞은 수를 쓰세요.' },
    { key: 't4', suffix: '고치기', kind: 'correction', format: 'g231-decimal-mul-correction',
      cols: 3, rows: 5, fontPt: 17, autoFit: false, instruction: '잘못된 곳을 찾아 바르게 고쳐 쓰세요.' }
  ];

  function entries() {
    const list = [];
    CONCEPTS.forEach((concept, ci) => FORMS.forEach((form, fi) => {
      list.push({
        typeId: concept.id + '-' + form.key,
        // 제목 칸이 55mm 라 개념 이름과 서식 이름을 '·' 로 붙여 쓴다(검수 지적: 개념 이름을 교과서 용어로).
        title: concept.label + '·' + form.suffix,
        instruction: form.instruction,
        format: form.format,
        cols: form.cols,
        rows: form.rows,
        count: form.cols * form.rows,
        fontPt: concept.partials && form.kind !== 'horizontal' ? 12 : (ci === 1 && form.kind === 'correction' ? 13 : form.fontPt),
        autoFit: form.autoFit,
        maxProblems: form.cols * form.rows,
        seed: 20261001 + ci * 10 + fi,
        gen: {
          bundle: BUNDLE, concept: concept.id, conceptName: concept.full, kind: form.kind,
          places: concept.places, decimalFirst: concept.decimalFirst, endZero: concept.endZero,
          factor: concept.factor, partials: !!concept.partials, source: sourceOf(concept)
        }
      });
    }));
    return list;
  }

  if (!installFormats()) document.addEventListener('DOMContentLoaded', installFormats, { once: true });
  if (!installGenerator()) document.addEventListener('DOMContentLoaded', installGenerator, { once: true });
  const catalog = entries();
  if (Array.isArray(root.SheetCatalog)) for (const entry of catalog) root.SheetCatalog.push(entry);

  // 검수 도구가 쓰는 입구(문제 생성 규칙을 그대로 다시 쓸 수 있게).
  root.Sheet231 = {
    bundle: BUNDLE, concepts: CONCEPTS, forms: FORMS, entries: catalog, notes: WRONG_NOTE,
    buildItems: buildItems, fixedDecimal: fixedDecimal, scaledOf: scaledOf, carryMarks: carryMarks,
    partialTexts: partialTexts, topOf: topOf, bottomOf: bottomOf
  };
})(globalThis);
