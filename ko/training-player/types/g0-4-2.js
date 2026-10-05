/* 0-4-2 나눗셈 묶음(두·세 자리 수) — 유형 정의 (types/g0-4-2.js)   [역할: 제작자 A]

   대상: training-roadmap-20261001/worksheet-types.json 의 id 가 `0-4-2-` 로 시작하는 개념 8개와 그 유형 32개.
     0-4-2-0 두 자리 수 ÷ 한 자리 수 — 나누어떨어짐   t1 가로식 / t2 세로셈 / t3 세로 풀이 빈칸 / t4 틀린 풀이 고치기
     0-4-2-1 두 자리 수 ÷ 한 자리 수 — 나머지 있음      (같은 네 서식)
     0-4-2-2 세 자리 수 ÷ 한 자리 수
     0-4-2-3 몫에 0이 들어가는 나눗셈
     0-4-2-4 몇십으로 나누기
     0-4-2-5 두 자리 수 ÷ 두 자리 수
     0-4-2-6 세 자리 수 ÷ 두 자리 수 — 몫 어림하기
     0-4-2-7 세 자리 수 ÷ 두 자리 수 — 몫 조정하기

   ── 문제 생성
     사이트의 기존 생성기(Worksheets.generate, src/bank/legacy/types.js)만 쓴다. 새 문제 엔진을 만들지 않는다.
     기존 생성기는 이 묶음의 조건(자릿수·나머지 유무·몫에 0·몇십으로 나누기·몫 어림/조정)을 보장하지 않으므로
     여기서 조건에 맞는 문항만 걸러 내고, 모자라면 seed 를 바꿔 더 뽑는다(gen-bridge.js 와 같은 방식).
     같은 typeId · 같은 seed → 같은 문제지. 한 장 안 중복은 없다.
     뽑기는 '쉬운 것 몇 개 + 나머지 풀 전체에 고르게 퍼진 자리'로 한다. 풀을 쉬운 순으로 정렬해 앞에서만
     자르면 쉬운 문항에 쏠린다는 1-2-1 검수 지적(D r1)을 그대로 반영한 것이다. 인쇄 순서는 어려운 것까지
     수 크기 순(쉬운 것 → 어려운 것)이다.

   ── 개념별 조건 (spec\spec-*.json 의 params 와 worksheet-types.json 의 name 을 그대로 옮긴 것)
     | 개념 | 기존 생성기 | 피제수 | 나누는 수 | 추가 조건 |
     |---|---|---|---|---|
     | 0-4-2-0 | natural-div-2-1 | 10~99  | 2~9  | 나머지 0 (나누어떨어짐) |
     | 0-4-2-1 | natural-div-2-1 | 10~99  | 2~9  | 나머지 1 이상 |
     | 0-4-2-2 | natural-div-3-1 | 100~999 | 2~9 | 나머지 1 이상 |
     | 0-4-2-3 | natural-div-3-1 | 100~999 | 2~9 | 나머지 1 이상 + 몫(2~3자리)에 0이 들어감 |
     | 0-4-2-4 | natural-div-3-2 | 100~999 | 10~90의 몇십 | 나머지 1 이상 |
     | 0-4-2-5 | natural-div-2-2 | 10~99  | 10~99 | 나머지 1 이상 |
     | 0-4-2-6 | natural-div-3-2 | 100~999 | 10~99 | 나머지 1 이상 + 어림한 몫의 첫 자리 = 실제 몫의 첫 자리 |
     | 0-4-2-7 | natural-div-3-2 | 100~999 | 10~99 | 나머지 1 이상 + 어림한 몫이 실제 몫의 첫 자리보다 1 큼 |

     나머지 유무는 개념마다 하나로 고정했다(0-4-2-0 만 '나머지 0'). 한 장 안에서 나누어떨어지는 문항과
     나머지가 있는 문항을 섞으면 가로셈 줄의 모양(= [ ] … [ ] 대 [ ])이 달라져 layout-rules §3·§5 의
     '한 장 안에서 문제의 모양이 같아야 한다'에 어긋나기 때문이다. 나머지 조건이 없는 개념(0-4-2-2 ~ 0-4-2-7)은
     나머지가 있는 문항으로 고정하되, 그 사실을 지시문('몫과 나머지를 구하세요.')에 적는다.

   ── 몫 어림하기 / 몫 조정하기의 '어림한 몫' (spec 의 quotientEstimate · quotientAdjustment 를 수로 옮긴 것)
     어림한 피제수 = a 를 십의 자리로 내림한 수(a // 10 * 10), 어림한 나누는 수 = b 를 십의 자리로 내림한 수
     (b // 10 * 10). 어림한 몫 = 어림한 피제수 ÷ 어림한 나누는 수(내림). 예: 738 ÷ 21 → 730 ÷ 20 = 36 (첫 자리 3).
     0-4-2-6 은 이 첫 자리가 실제 몫의 첫 자리와 같아 그대로 쓸 수 있는 문항만, 0-4-2-7 은 1만큼 커서
     줄여야 하는 문항만 담는다(내림으로 어림하므로 어림한 몫은 실제보다 작아지지 않는다).

   ── layout-rules.md §2 의 '0·1이 들어간 쉬운 문제 10% 이하' 예외 (다른 묶음의 소수·분수와 같은 방식으로 기록)
     이 묶음에서는 글자 그대로 쓸 수 없다. 0-4-2-3 은 '몫에 0이 들어가는' 것이 개념이고, 0-4-2-4 는 나누는
     수가 몇십이라 0이 반드시 들어가며, 피제수가 100~999 인 개념은 0·1이 자릿값으로 흔히 들어간다.
     대신 '계산 없이 답이 보이는 문항'을 쉬운 문항으로 세어 10% 이하로 유지한다:
       몫이 1 이하 · 나누는 수가 10 · 피제수가 100의 배수이면서 나누어떨어지는 문항.

   ── 서식
     재사용: horizontal(sheet.js — 0-4-2-0 가로식, 나머지가 없어 [ ] 하나), long-division(formats-division.js — 세로셈),
             horizontal-division 은 쓰지 않는다(3자리 몫 + 두 자리 나누는 수에서 지나치게 넓다).
     이 파일에서 등록: ko42-horizontal(가로식 [몫] … [나머지]) · ko42-division-missing(세로 풀이 빈칸)
                       ko42-error-fix(틀린 풀이 고치기)
     공용 파일(sheet.js · formats-*.js · gen-bridge.js · catalog.js)은 고치지 않는다.
     서식 이름이 sheet.js 의 minimumCellMm 과 맞물린다: ko42-division-missing 은 /division/ 으로 workLines 기준,
     ko42-error-fix 는 /error-fix/ 로 52mm 기준.

   ── 확인
     tools/check-division-0462-static.py — 문법·유형표·조건·문항 수·틀린 풀이·빈칸을 정적으로 점검
     sheet/check-division-0462-edge.py  — Edge headless 로 PDF·PNG 를 뽑아 1쪽 인쇄와 칸 넘침을 확인
*/
(function (root) {
  'use strict';

  const BUNDLE = /^0-4-2-/;
  const INK = '#111';
  const ANSWER_INK = '#d71f10';

  // 이 파일은 파이썬 정적 점검(esprima)으로도 읽을 수 있게 최신 문법(?., ??)을 쓰지 않는다.
  const esc = value => String(value === undefined || value === null ? '' : value).replace(/[&<>"']/g,
    c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const el = (tag, className, value) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (value !== undefined) node.textContent = value;
    return node;
  };

  /* ================= 1. 개념 조건 ================= */

  const CONCEPTS = {
    '0-4-2-0': {
      name: '두 자리 수 ÷ 한 자리 수 — 나누어떨어짐',
      sources: ['natural-div-2-1'], dividend: [10, 99], divisor: [2, 9], exact: true,
      wrongKinds: ['wrong-quotient-digit', 'wrong-product']
    },
    '0-4-2-1': {
      name: '두 자리 수 ÷ 한 자리 수 — 나머지 있음',
      sources: ['natural-div-2-1'], dividend: [10, 99], divisor: [2, 9], remainder: true,
      wrongKinds: ['wrong-remainder', 'wrong-product']
    },
    '0-4-2-2': {
      name: '세 자리 수 ÷ 한 자리 수',
      sources: ['natural-div-3-1'], dividend: [100, 999], divisor: [2, 9], remainder: true,
      wrongKinds: ['wrong-quotient-digit', 'wrong-product']
    },
    '0-4-2-3': {
      name: '몫에 0이 들어가는 나눗셈',
      sources: ['natural-div-3-1'], dividend: [100, 999], divisor: [2, 9], remainder: true,
      zeroQuotient: true, quotientDigits: [2, 3],
      wrongKinds: ['drop-zero', 'big-remainder', 'wrong-product']
    },
    '0-4-2-4': {
      name: '몇십으로 나누기',
      sources: ['natural-div-3-2'], dividend: [100, 999], divisor: [10, 99], multipleOf: 10, remainder: true,
      wrongKinds: ['wrong-quotient-digit', 'wrong-product']
    },
    '0-4-2-5': {
      name: '두 자리 수 ÷ 두 자리 수',
      sources: ['natural-div-2-2'], dividend: [10, 99], divisor: [10, 99], remainder: true,
      wrongKinds: ['wrong-quotient-digit', 'wrong-remainder']
    },
    '0-4-2-6': {
      name: '세 자리 수 ÷ 두 자리 수 — 몫 어림하기',
      sources: ['natural-div-3-2'], dividend: [100, 999], divisor: [10, 99], remainder: true, estimate: 'match',
      wrongKinds: ['wrong-quotient-digit', 'wrong-product']
    },
    '0-4-2-7': {
      name: '세 자리 수 ÷ 두 자리 수 — 몫 조정하기',
      sources: ['natural-div-3-2'], dividend: [100, 999], divisor: [10, 99], remainder: true, estimate: 'adjust',
      wrongKinds: ['no-adjust']
    }
  };

  // 한 문항의 값. 몫·나머지·중간 곱을 미리 계산해 두면 서식마다 다시 셈하지 않아도 된다.
  function fact(a, b) {
    const quotient = Math.floor(a / b), remainder = a - quotient * b;
    return {
      a: a, b: b, op: '÷', quotient: quotient, remainder: remainder, product: b * quotient,
      answer: remainder ? quotient + ' R ' + remainder : String(quotient)
    };
  }

  // 나누는 수를 십의 자리로 내림해 어림한 몫(내림). 0-4-2-6·0-4-2-7 의 '처음 어림한 몫'이다.
  function estimate(a, b) {
    const tens = Math.floor(b / 10) * 10;
    if (!tens) return 0;
    const value = Math.floor(Math.floor(a / 10) * 10 / tens);
    return value < 10 ? value : Number(String(value).charAt(0));
  }
  const firstDigit = value => Number(String(value).charAt(0));

  function accept(f, c) {
    if (f.a < c.dividend[0] || f.a > c.dividend[1]) return false;
    if (f.b < c.divisor[0] || f.b > c.divisor[1]) return false;
    if (c.multipleOf && f.b % c.multipleOf) return false;
    if (c.exact && f.remainder) return false;
    if (c.remainder && !f.remainder) return false;
    if (c.quotientDigits) {
      const digits = String(f.quotient).length;
      if (digits < c.quotientDigits[0] || digits > c.quotientDigits[1]) return false;
    }
    if (c.zeroQuotient && String(f.quotient).indexOf('0') < 0) return false;
    if (c.estimate === 'match' && !(estimate(f.a, f.b) >= 1 && estimate(f.a, f.b) === firstDigit(f.quotient))) return false;
    if (c.estimate === 'adjust' && !(estimate(f.a, f.b) >= 1 && estimate(f.a, f.b) - firstDigit(f.quotient) === 1)) return false;
    return true;
  }

  // 쉬운 문항: 계산 없이 답이 보이는 것만 센다(머리말의 예외 기록 참고).
  function easy(f) {
    return f.quotient <= 1 || f.b === 10 || (f.a % 100 === 0 && f.remainder === 0);
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

  /* ================= 2. 문제 뽑기 ================= */

  // 풀 전체에 고르게 퍼진 자리를 take 개 고른다(앞에서만 자르지 않는다).
  function spread(list, take, rnd) {
    if (take <= 0) return [];
    const sorted = list.slice().sort((x, y) => x.a - y.a || x.b - y.b);
    if (take >= sorted.length) return sorted;
    const picked = [], used = new Set();
    for (let i = 0; i < take; i++) {
      let index = Math.floor((i + rnd(0, 3) / 4) * sorted.length / take);
      if (index >= sorted.length) index = sorted.length - 1;
      while (used.has(index)) index = index + 1 < sorted.length ? index + 1 : 0;
      used.add(index); picked.push(sorted[index]);
    }
    return picked;
  }

  function pick(pool, count, seed) {
    const rnd = seeded(Number(seed) || 1);
    const strict = pool.filter(f => !easy(f)), soft = pool.filter(easy);
    const softQuota = Math.min(Math.floor(count * 0.1), soft.length);
    const chosen = spread(strict, count - softQuota, rnd).concat(spread(soft, softQuota, rnd));
    for (let i = chosen.length - 1; i > 0; i--) {   // 고른 뒤 자리를 섞고
      const j = rnd(0, i), swap = chosen[i]; chosen[i] = chosen[j]; chosen[j] = swap;
    }
    return chosen;
  }

  function facts(config) {
    if (!root.Worksheets || typeof root.Worksheets.generate !== 'function') throw Error('기존 Worksheets 생성기를 찾지 못했습니다.');
    const gen = config.gen || {};
    const concept = CONCEPTS[gen.concept];
    if (!concept) throw Error(config.typeId + ': 개념 조건을 찾지 못했습니다.');
    const count = config.count || config.cols * config.rows;
    const want = Math.max(count * 4, count + 80);
    const pool = [], seen = new Set();
    let idle = 0;
    for (let batch = 0; pool.length < want && batch < 4000 && idle < 60; batch++) {
      const source = concept.sources[batch % concept.sources.length];
      const rows = root.Worksheets.generate(source, (Number(config.seed) + batch * 104729) >>> 0, 24);
      let fresh = 0;
      for (const row of rows) {
        const a = Number(row.a), b = Number(row.b);
        if (!Number.isInteger(a) || !Number.isInteger(b)) continue;
        const f = fact(a, b);
        if (!accept(f, concept)) continue;
        const key = a + ':' + b;
        if (seen.has(key)) continue;
        seen.add(key); pool.push(f); fresh++;
      }
      idle = fresh ? 0 : idle + 1;
    }
    if (pool.length < count) throw Error(config.typeId + ': 조건에 맞는 고유 문항 ' + count + '개 중 ' + pool.length + '개만 만들었습니다.');
    const list = pick(pool, count, config.seed);
    list.sort((x, y) => x.a - y.a || x.b - y.b);   // 쉬운 것 → 어려운 것 (수 크기 기준)
    return list;
  }

  /* ================= 3. 세로 풀이 그리기 ================= */

  const CW = 18, FS = 18, TOP_Y = 27, ROW_H = 44, Q_Y = 7;

  // 자리별 중간 계산. formats-division.js 의 순서(한 자리씩 내려 계산)를 그대로 옮긴 것.
  //   steps[k] = { pos, n(그 자리의 부분 피제수), p(곱), r(뺀 나머지) }
  //   quot     = 몫의 자리별 숫자(몫이 시작되기 전 자리는 없음)
  function plan(f) {
    const digits = String(f.a).split('');
    const quot = [], steps = [];
    let rem = 0, started = false;
    for (let i = 0; i < digits.length; i++) {
      const n = rem * 10 + Number(digits[i]);
      const q = Math.floor(n / f.b);
      rem = n - q * f.b;
      if (!started && q === 0 && i < digits.length - 1) continue;   // 몫이 시작되기 전 자리
      started = true;
      quot.push({ pos: i, d: String(q) });
      steps.push({ pos: i, n: n, p: q * f.b, r: n - q * f.b });
    }
    return { a: String(f.a), b: String(f.b), digits: digits, quot: quot, steps: steps, rem: String(rem) };
  }

  function frame(p) {
    const x0 = Math.max(34, p.b.length * CW + 8);
    const right = x0 + p.digits.length * CW;
    return { x0: x0, right: right, xOf: pos => x0 + (pos + 1) * CW, last: p.steps.length - 1 };
  }
  function text(value, x, y, color) {
    return '<text x="' + x + '" y="' + y + '" text-anchor="end"' + (color && color !== INK ? ' fill="' + color + '"' : '') + '>' + esc(value) + '</text>';
  }
  // 빈칸으로 둘 자리는 점선 상자, 답 쪽에서는 붉은 글씨로 채운다.
  function slot(name, value, right, y, blanks, answer, color) {
    if (!blanks[name]) return text(value, right, y, color);
    const width = Math.max(String(value).length, 1) * CW;
    if (answer) return text(value, right, y, ANSWER_INK);
    return '<rect x="' + (right - width) + '" y="' + (y - FS) + '" width="' + width + '" height="' + (FS + 4) +
      '" fill="none" stroke="#888" stroke-width=".8" stroke-dasharray="2.5 2"/>';
  }
  function svgBox(inner, label) {
    // The quotient baseline is 7px; give its ascenders room above the old viewBox.
    const parts = inner.viewBox.split(' ');
    return '<svg viewBox="0 -12 ' + parts[2] + ' ' + (Number(parts[3]) + 12) + '" preserveAspectRatio="xMidYMid meet" role="img" aria-label="' + esc(label) + '">' +
      '<g font-family="Arial,\'Malgun Gothic\',sans-serif" font-size="' + FS + '" fill="' + INK + '">' + inner.body + '</g></svg>';
  }

  // 몫·중간 곱·나머지까지 그린 한 벌. blanks 에 든 자리가 (답 쪽이 아니면) 점선 상자가 된다.
  function working(p, options) {
    const blanks = options.blanks || {}, answer = !!options.answer;
    const answerColor = options.color || (answer ? ANSWER_INK : INK);
    // 문제에 이미 인쇄된 것(나누는 수·나누어지는 수·괄호, 빈칸 유형에서 비어 있지 않은 자리)은 정답지에서도 검은색, 새로 채우는 답만 빨간색.
    const color = options.blanks ? INK : answerColor;
    const { x0, right, xOf, last } = frame(p);
    // 한 장의 세로셈이 같은 크기로 보이도록 같은 장 안에서는 같은 크기의 그림판(common)을 쓴다.
    const common = p.common, viewLast = common ? common.last : last;
    const width = common ? common.w : right + 8, height = TOP_Y + 16 + viewLast * ROW_H + 65;
    let body = text(p.b, x0 - 7, TOP_Y, INK);
    body += '<path d="M' + (x0 - 3) + ' ' + (TOP_Y + 2) + 'Q' + (x0 + 1) + ' ' + ((TOP_Y + 15)/2) + ' ' + (x0 - 3) + ' 13H' + (right + 3) + '" fill="none" stroke="' + INK + '"/>';
    for (let i = 0; i < p.digits.length; i++) body += text(p.digits[i], xOf(i), TOP_Y, INK);
    p.quot.forEach(item => { body += slot('q' + item.pos, item.d, xOf(item.pos), Q_Y, blanks, answer, color); });
    p.steps.forEach((step, k) => {
      const y = TOP_Y + 16 + k * ROW_H;
      if (k) body += slot('n' + k, String(step.n), xOf(step.pos), y, blanks, answer, color);
      body += slot('p' + k, step.p ? '−' + step.p : '0', xOf(step.pos), y + 22, blanks, answer, color);
      const wide = Math.max(String(step.n).length, String(step.p).length + 1) * CW;
      body += '<path d="M' + (xOf(step.pos) - wide) + ' ' + (y + 26) + 'H' + (xOf(step.pos) + 2) + '" fill="none" stroke="' + color + '"/>';
      if (k === last) body += slot('r', String(step.r), xOf(step.pos), y + 46, blanks, answer, color);
    });
    return svgBox({ viewBox: '0 0 ' + width + ' ' + height, body: centered(body, width, right + 8) }, p.a + ' 나누기 ' + p.b);
  }

  function centered(body, width, own) {
    return width > own ? '<g transform="translate(' + ((width - own) / 2) + ' 0)">' + body + '</g>' : body;
  }

  // 바르게 고쳐 쓸 빈 세로셈 틀 — 주어진 수만 인쇄하고 풀이 자리는 빈 줄로 둔다.
  function skeleton(p) {
    const frameOf = frame(p), x0 = frameOf.x0, right = frameOf.right, xOf = frameOf.xOf;
    const last = p.common ? p.common.last : frameOf.last;
    const width = p.common ? p.common.w : right + 8, height = TOP_Y + 16 + last * ROW_H + 34;
    let body = text(p.b, x0 - 7, TOP_Y);
    body += '<path d="M' + (x0 - 3) + ' ' + (TOP_Y + 2) + 'Q' + (x0 + 1) + ' ' + ((TOP_Y + 15)/2) + ' ' + (x0 - 3) + ' 13H' + (right + 3) + '" fill="none" stroke="' + INK + '"/>';
    for (let i = 0; i < p.digits.length; i++) body += text(p.digits[i], xOf(i), TOP_Y);
    // 숫자가 없는 빈 연습 보조선은 표시하지 않는다.
    return svgBox({ viewBox: '0 0 ' + width + ' ' + height, body: centered(body, width, right + 8) }, p.a + ' 나누기 ' + p.b + ' 고쳐 쓰기');
  }

  // 세로셈 문제지에는 몫·곱·빼기·내려 쓰기와 나머지를 적을 줄을 모두 남긴다.
  function blankWorking(p) {
    const frameOf = frame(p), x0 = frameOf.x0, right = frameOf.right, xOf = frameOf.xOf;
    const last = p.common ? p.common.last : frameOf.last;
    const lines = p.common ? p.common.lines : Math.max(4, p.quot.length * 2 + 2);
    const width = p.common ? p.common.w : right + 8;
    const height = Math.max(TOP_Y + 16 + last * ROW_H + 65, TOP_Y + 24 + (lines - 1) * 17 + 8);
    let body = text(p.b, x0 - 7, TOP_Y);
    body += '<path d="M' + (x0 - 3) + ' ' + (TOP_Y + 2) + 'Q' + (x0 + 1) + ' ' + ((TOP_Y + 15)/2) + ' ' + (x0 - 3) + ' 13H' + (right + 3) + '" fill="none" stroke="' + INK + '"/>';
    for (let i = 0; i < p.digits.length; i++) body += text(p.digits[i], xOf(i), TOP_Y);
    // 숫자가 없는 빈 연습 보조선은 표시하지 않는다.
    return svgBox({ viewBox: '0 0 ' + width + ' ' + height, body: centered(body, width, right + 8) }, p.a + ' 나누기 ' + p.b);
  }

  // 한 장의 모든 세로셈이 쓸 그림판 크기: 가장 넓은 식, 가장 단계가 많은 식에 맞춘다.
  function measure(list) {
    const common = { w: 0, last: 0, lines: 4 };
    list.forEach(f => {
      const p = plan(f), fr = frame(p);
      common.w = Math.max(common.w, fr.right + 8);
      common.last = Math.max(common.last, fr.last);
      common.lines = Math.max(common.lines, p.quot.length * 2 + 2);
    });
    return common;
  }

  /* ================= 4. 틀린 풀이 만들기 (조건을 지키는 한 가지 오류) ================= */

  function copyPlan(p) {
    return {
      a: p.a, b: p.b, digits: p.digits.slice(),
      quot: p.quot.map(item => ({ pos: item.pos, d: item.d })),
      steps: p.steps.map(step => ({ pos: step.pos, n: step.n, p: step.p, r: step.r })),
      rem: p.rem
    };
  }
  const samePlan = (one, other) =>
    one.quot.map(item => item.d).join(',') + '|' + one.steps.map(s => s.n + '/' + s.p + '/' + s.r).join(',') ===
    other.quot.map(item => item.d).join(',') + '|' + other.steps.map(s => s.n + '/' + s.p + '/' + s.r).join(',');

  // 오류는 반드시 바른 값과 달라야 한다(같아지면 null 을 돌려주고 다음 오류를 쓴다).
  function wrongPlan(f, kind) {
    const right = plan(f);
    const wrong = copyPlan(right);
    if (kind === 'drop-zero') {
      const zeros = wrong.quot.filter(item => item.d === '0');
      if (!zeros.length) return null;
      const target = zeros[zeros.length - 1];
      target.d = ' ';
      return { plan: wrong, note: '몫의 0을 빠뜨림' };
    }
    if (kind === 'big-remainder') {
      const step = wrong.steps[wrong.steps.length - 1];
      if (step.n < f.b) return null;              // 이 자리에서 몫이 0이면 나머지가 커질 수 없다
      step.p = 0; step.r = step.n;
      return { plan: wrong, note: '나머지가 나누는 수보다 큼' };
    }
    if (kind === 'wrong-quotient-digit') {
      const digit = Number(wrong.quot[wrong.quot.length - 1].d);
      const fixed = digit + 1 <= 9 ? digit + 1 : digit - 1;
      if (fixed === digit) return null;
      wrong.quot[wrong.quot.length - 1].d = String(fixed);
      return { plan: wrong, note: '몫을 잘못 구함' };
    }
    if (kind === 'wrong-remainder') {
      const step = wrong.steps[wrong.steps.length - 1];
      const fixed = step.r + 1 < f.b ? step.r + 1 : step.r - 1;
      if (fixed === step.r || fixed < 0) return null;
      step.r = fixed;
      return { plan: wrong, note: '곱하고 빼는 계산을 잘못함' };
    }
    if (kind === 'wrong-product') {
      const step = wrong.steps[wrong.steps.length - 1];
      const fixed = step.p ? step.p - f.b : step.p + f.b;
      if (fixed === step.p || fixed < 0) return null;
      step.p = fixed;
      return { plan: wrong, note: '곱셈구구를 잘못 외워 곱을 잘못 씀' };
    }
    if (kind === 'no-adjust') {
      const value = estimate(f.a, f.b);
      if (!(value >= 1) || String(value) === wrong.quot[0].d) return null;
      wrong.quot[0].d = String(value);
      return { plan: wrong, note: '어림한 몫을 조정하지 않음' };
    }
    return null;
  }

  /* ================= 5. 서식 ================= */

  let styled = false;
  function css() {
    if (styled || typeof document === 'undefined') return;
    styled = true;
    const style = document.createElement('style');
    style.id = 'ko42-style';
    style.textContent = `
      .sheet-page .sheet-head { gap:1mm; font-size:8pt; }
      .sheet-page .sheet-head .sheet-title { min-width:0; }
      .sheet-page .sheet-head .sheet-field { min-width:0; }
      .ko42 { display:flex; flex-direction:column; height:100%; min-height:0; gap:.4mm; }
      .ko42-horizontal { display:flex; align-items:center; gap:1.5mm; white-space:nowrap; font-variant-numeric:tabular-nums; }
      .ko42-blank { display:inline-block; min-width:10mm; height:1.3em; border-bottom:1px solid #555; text-align:center; }
      .ko42-blank.ko42-rem { min-width:8mm; }
      .ko42-blank.is-answer { color:${ANSWER_INK}; }
      .ko42-dots { padding:0 .3mm; }
      .ko42-compact { gap:.5mm; font-size:14pt; }
      .ko42-compact .ko42-blank { min-width:6mm; }
      .ko42-compact .ko42-blank.ko42-rem { min-width:5mm; }
      .ko42-compact .ko42-dots { padding:0; }
      .ko42-estimate { padding-left:5mm; font-size:9pt; line-height:1.2; white-space:nowrap; }
      .ko42-estimate .is-answer { color:${ANSWER_INK}; }
      .ko42-box { display:inline-block; min-width:6mm; height:1.35em; border:1px solid #555; text-align:center; vertical-align:-.3em; line-height:1.3; }
      .ko42-box.is-answer { border-color:${ANSWER_INK}; }
      .ko42-estimate-cell { display:flex; flex-direction:column; }
      .ko42-estimate-cell > .division-format,
      .ko42-estimate-cell > .ko42-svg,
      .ko42-estimate-cell > .ko42 { flex:1; height:auto; min-height:0; }
      .ko42-svg { width:100%; height:100%; min-height:0; }
      .ko42-svg svg { display:block; width:100%; height:100%; }
      .ko42-fix { display:flex; gap:1.5mm; flex:1; min-height:0; }
      .ko42-half { flex:1; min-width:0; min-height:0; display:flex; flex-direction:column; }
      .ko42-half .ko42-svg { flex:1; min-height:0; }
      .ko42-note { flex:none; align-self:stretch; text-align:center; font-size:8pt; color:#444; line-height:1.2; white-space:normal; }
    `;
    document.head.appendChild(style);
  }

  function estimateLine(q, answer, concept) {
    const line = el('div', 'ko42-estimate');
    const initial = estimate(q.a, q.b);
    const adjusted = firstDigit(q.quotient);
    if (concept === '0-4-2-7') {
      line.append(el('span', '', '어림 '));
      line.append(el('span', 'ko42-box' + (answer ? ' is-answer' : ''), answer ? String(initial) : ''));
      line.append(el('span', '', ' → 조정 '));
      line.append(el('span', 'ko42-box' + (answer ? ' is-answer' : ''), answer ? String(adjusted) : ''));
    } else {
      line.append(el('span', '', '어림한 몫의 첫 자리 '));
      line.append(el('span', 'ko42-box' + (answer ? ' is-answer' : ''), answer ? String(initial) : ''));
    }
    return line;
  }

  function addEstimate(cell, q, answer, config) {
    const concept = config.gen && config.gen.concept;
    if (concept === '0-4-2-6' || concept === '0-4-2-7') {
      cell.classList.add('ko42-estimate-cell');
      cell.append(estimateLine(q, answer, concept));
    }
  }

  // 가로식 — a ÷ b = [몫] (나머지가 있는 문항은 … [나머지] 까지)
  function renderHorizontal(cell, q, answer, config) {
    css();
    addEstimate(cell, q, answer, config);
    const compact = config.gen && (config.gen.concept === '0-4-2-1' || config.gen.concept === '0-4-2-5');
    const line = el('div', 'ko42-horizontal' + (compact ? ' ko42-compact' : ''));
    line.append(el('span', '', q.a + ' ' + q.op + ' ' + q.b + ' ='));
    line.append(el('span', 'ko42-blank' + (answer ? ' is-answer' : ''), answer ? String(q.quotient) : ' '));
    if ((config.gen && config.gen.withRemainder) || q.remainder) {
      line.append(el('span', 'ko42-dots', '…'));
      line.append(el('span', 'ko42-blank ko42-rem' + (answer ? ' is-answer' : ''), answer ? String(q.remainder) : ' '));
    }
    cell.append(line);
  }

  // 세로 풀이의 빈칸 채우기 — 자리별 중간 계산을 인쇄하고 1~2곳만 빈칸으로 둔다.
  function renderMissing(cell, q, answer, config) {
    css();
    addEstimate(cell, q, answer, config);
    const blanks = {};
    (q.blanks || []).forEach(name => { blanks[name] = true; });
    const box = el('div', 'ko42-svg');
    box.innerHTML = working(q.plan, { blanks: blanks, answer: answer });
    cell.append(box);
  }

  // 틀린 풀이 고치기 — 왼쪽에 틀린 풀이, 오른쪽에 바르게 고쳐 쓸 빈 세로셈.
  function renderErrorFix(cell, q, answer, config) {
    css();
    addEstimate(cell, q, answer, config);
    const wrap = el('div', 'ko42');
    const row = el('div', 'ko42-fix');
    const left = el('div', 'ko42-half'), right = el('div', 'ko42-half');
    const leftSvg = el('div', 'ko42-svg'), rightSvg = el('div', 'ko42-svg');
    leftSvg.innerHTML = working(q.wrong, {});
    rightSvg.innerHTML = answer ? working(q.plan, { answer: true, color: ANSWER_INK }) : skeleton(q.plan);
    left.append(leftSvg); right.append(rightSvg); row.append(left, right); wrap.append(row);
    cell.append(wrap);
  }

  function register() {
    if (!root.Sheet || typeof root.Sheet.register !== 'function') return false;
    root.Sheet.register('ko42-horizontal', renderHorizontal);
    const originalLongDivision = root.Sheet.renderers.get('long-division');
    root.Sheet.renderers.set('long-division', function (cell, q, answer, config) {
      if (!BUNDLE.test(String(config.typeId || ''))) return originalLongDivision(cell, q, answer, config);
      css();
      addEstimate(cell, q, answer, config);
      const box = el('div', 'ko42-svg');
      const p = plan(q);
      p.common = q.common;
      box.innerHTML = answer ? working(p, { answer: true }) : blankWorking(p);
      cell.append(box);
    });
    root.Sheet.register('ko42-division-missing', renderMissing);
    root.Sheet.register('ko42-error-fix', renderErrorFix);
    return true;
  }

  /* ================= 6. 문항 만들기 연결 ================= */

  // 세로 풀이 빈칸은 문항마다 1~2곳을 비운다(첫 번째는 몫의 마지막 자리 + 나머지, 두 번째는 몫 + 마지막 곱,
  // 세 번째는 마지막 부분 피제수 + 마지막 곱).
  function blankSlots(plan, index) {
    const last = plan.steps.length - 1;
    const qPos = plan.quot[plan.quot.length - 1].pos;
    if (index % 3 === 1) return ['q' + qPos, 'p' + last];
    if (index % 3 === 2 && last >= 1) return ['n' + last, 'p' + last];
    return ['q' + qPos, 'r'];
  }

  function items(config) {
    const list = facts(config);
    const common = measure(list);
    const gen = config.gen || {};
    if (config.format === 'ko42-division-missing') {
      return list.map((f, i) => {
        const shape = plan(f);
        shape.common = common;
        return { ...f, plan: shape, blanks: blankSlots(shape, i), common };
      });
    }
    if (config.format === 'ko42-error-fix') {
      const concept = CONCEPTS[gen.concept] || {};
      const kinds = concept.wrongKinds || ['wrong-quotient-digit', 'wrong-product'];
      return list.map((f, i) => {
        let wrong = null;
        for (let attempt = 0; attempt < kinds.length && !wrong; attempt++) wrong = wrongPlan(f, kinds[(i + attempt) % kinds.length]);
        if (!wrong || samePlan(wrong.plan, plan(f))) throw Error(config.typeId + ': ' + f.a + ' ÷ ' + f.b + ' 의 틀린 풀이를 만들지 못했습니다.');
        const right = plan(f);
        right.common = common; wrong.plan.common = common;
        return { ...f, plan: right, wrong: wrong.plan, note: wrong.note, common };
      });
    }
    return list.map(f => ({ ...f, common }));
  }

  function connect() {
    if (!root.SheetGen || typeof root.SheetGen.generate !== 'function' || root.SheetGen.division0462) return false;
    const base = root.SheetGen.generate;
    root.SheetGen.generate = function (config) {
      if (config && BUNDLE.test(String(config.typeId || ''))) return items(config);
      return base.apply(this, arguments);
    };
    Object.defineProperty(root.SheetGen, 'division0462', { value: true });
    return true;
  }

  /* ================= 7. 유형 등록 ================= */
  // cols·rows는 layout-rules.md §2의 서식별 최소 기준이다. sheet.js 의 autoFit 이 공간이 남으면 줄을 늘린다.
  //   horizontal — 짧은 가로셈(두 자리 ÷ 한 자리) 4단×15줄 60, 두~세 자리 3단×15줄 45
  //   vertical   — 세로 나눗셈 ÷한 자리 4단×5줄 20, ÷두 자리 4단×4줄 16
  //   빈칸       — 같은 연산의 세로셈과 같은 단·줄, 고치기 3단×4줄 12
  //   workLines  — sheet.js minimumCellMm 의 세로셈 칸 높이 기준(자동 늘림이 멈추는 자리)
  const GEOMETRY = {
    '0-4-2-0': { horizontal: [4, 15], vertical: [4, 5], workLines: 6 },
    '0-4-2-1': { horizontal: [4, 15], vertical: [4, 5], workLines: 6 },
    '0-4-2-2': { horizontal: [3, 15], vertical: [4, 5], workLines: 8 },
    '0-4-2-3': { horizontal: [3, 15], vertical: [4, 5], workLines: 8 },
    '0-4-2-4': { horizontal: [3, 15], vertical: [4, 4], workLines: 6 },
    '0-4-2-5': { horizontal: [4, 15], vertical: [4, 4], workLines: 6 },
    '0-4-2-6': { horizontal: [3, 15], vertical: [4, 4], workLines: 6 },
    '0-4-2-7': { horizontal: [3, 15], vertical: [4, 4], workLines: 6 }
  };
  const SHAPES = [
    { key: 't1', suffix: '가로식', format: 'ko42-horizontal' },
    { key: 't2', suffix: '세로셈', format: 'long-division' },
    { key: 't3', suffix: '세로 풀이 빈칸', format: 'ko42-division-missing' },
    { key: 't4', suffix: '틀린 풀이 고치기', format: 'ko42-error-fix' }
  ];
  const INSTRUCTIONS = {
    '0-4-2-0': { t1: '나누어떨어지는 몫을 구하세요.', t2: '자리를 맞추어 몫을 구하세요.' },
    other: { t1: '몫과 나머지를 구하세요.', t2: '자리를 맞추어 몫과 나머지를 구하세요.' }
  };
  const FIX_INSTRUCTION = '잘못된 곳을 찾아 바르게 고쳐 쓰세요.';
  const BLANK_INSTRUCTION = '빈칸에 알맞은 수를 써넣으세요.';
  // 머리말 한 줄에 조건과 서식명이 함께 보이도록, 잘렸던 제목만 간결하게 적는다.
  const SHORT_NAMES = {
    '0-4-2-0': '두 자리÷한 자리(나누어떨어짐)',
    '0-4-2-1': '두 자리÷한 자리(나머지 있음)',
    '0-4-2-2': '세 자리÷한 자리',
    '0-4-2-3': '몫에 0이 들어가는 나눗셈',
    '0-4-2-4': '몇십으로 나누기',
    '0-4-2-5': '두 자리÷두 자리',
    '0-4-2-6': '세 자리÷두 자리(몫 어림하기)',
    '0-4-2-7': '세 자리÷두 자리(몫 조정하기)'
  };
  const SHORT_SHAPES = ['t1,t2,t3,t4', 't1,t2,t3,t4', 't3,t4', 't3,t4', 't4', 't3,t4', 't1,t2,t3,t4', 't1,t2,t3,t4'];

  // 가로식(t1) 글자 크기 — 칸 폭에 맞춰 키운다(나머지 있는 두·네 자리 식은 compact 서식이 따로 14pt 로 쓴다).
  const T1_FONT = { '0-4-2-0': 17, '0-4-2-2': 16, '0-4-2-3': 16, '0-4-2-4': 15, '0-4-2-6': 15, '0-4-2-7': 15 };
  const TYPES = [];
  Object.keys(CONCEPTS).forEach((conceptId, conceptIndex) => {
    const geo = GEOMETRY[conceptId];
    const words = INSTRUCTIONS[conceptId] || INSTRUCTIONS.other;
    SHAPES.forEach((shape, shapeIndex) => {
      const size = shape.key === 't1' ? geo.horizontal : shape.key === 't4' ? [3, 4] : geo.vertical;
      const type = {
        typeId: conceptId + '-' + shape.key,
        title: (SHORT_SHAPES[conceptIndex].split(',').includes(shape.key) ? SHORT_NAMES[conceptId] : CONCEPTS[conceptId].name) + ' · ' + shape.suffix,
        format: shape.format,
        cols: size[0], rows: size[1],
        fontPt: shape.key === 't1' ? (T1_FONT[conceptId] || 12) : 12,
        seed: 20264200 + conceptIndex * 10 + shapeIndex,
        instruction: shape.key === 't4' && conceptIndex === 6 ? '처음 어림한 몫을 확인하고 잘못된 풀이를 고쳐 쓰세요.' :
          shape.key === 't4' && conceptIndex === 7 ? '어림한 몫을 조정하고 잘못된 풀이를 고쳐 쓰세요.' :
          conceptIndex === 6 ? '처음 어림한 몫의 첫 자리를 적고 계산하세요.' :
          conceptIndex === 7 ? '처음 어림한 몫의 첫 자리와 조정한 수를 적고 계산하세요.' :
          shape.key === 't3' ? BLANK_INSTRUCTION : shape.key === 't4' ? FIX_INSTRUCTION : words[shape.key],
        gen: {
          concept: conceptId,
          withRemainder: shape.key === 't1' && !CONCEPTS[conceptId].exact
        }
      };
      if (shape.key === 't1' && (conceptIndex === 1 || conceptIndex === 5)) type.autoFit = false;
      // 세 자리 수가 들어가는 가로식은 한 장 30문제(세 자리 이상 계산 상한) — 제목에 '세 자리'가 없는 0-4-2-3·0-4-2-4 도 같게 맞춘다.
      if (shape.key === 't1' && [2, 3, 4, 6, 7].indexOf(conceptIndex) >= 0) { type.rows = 10; type.autoFit = false; type.maxProblems = 30; }
      if (shape.key === 't2' || shape.key === 't3') type.workLines = geo.workLines;
      TYPES.push(type);
    });
  });

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

  root.Division0462 = { concepts: CONCEPTS, types: TYPES, facts: facts, items: items, plan: plan, wrongPlan: wrongPlan, working: working, skeleton: skeleton, estimate: estimate, css: css };
})(globalThis);
