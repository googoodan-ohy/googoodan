/* 묶음 0-5-0 — 계산 순서 (연산 트레이닝, 제작자 A, 2026-10-02)

   대상: prototypes\training-roadmap-20261001\worksheet-types.json 에서 id 가 `0-5-0-` 로 시작하는
         개념 4개와 그 유형 12개. 조건은 spec\spec-natural.json 의 같은 typeId 에서 가져왔다.

     개념(worksheet-types.json)                       연산        괄호
       0-5-0-0 덧셈과 뺄셈이 섞인 계산                + −         없음
       0-5-0-1 곱셈과 나눗셈이 섞인 계산              × ÷         없음
       0-5-0-2 덧셈·뺄셈과 곱셈·나눗셈이 섞인 계산    + − × ÷     없음
       0-5-0-3 괄호가 있는 혼합 계산                  + − × ÷     있음

     유형(개념마다 셋)
       t1 계산 순서 표시 후 계산하기     format ko050-order
       t2 중간 계산의 빈칸 채우기        format ko050-steps
       t3 순서를 잘못 적용한 풀이 고치기 format ko050-error-fix

   명세의 조건(spec-natural.json params)
   -------------------------------------
     operandMin 1 · operandMax 99 · integerIntermediate · nonnegativeResult
     operationOrder '괄호 → 곱셈·나눗셈 → 덧셈·뺄셈; 같은 우선순위는 왼쪽부터'
   이 파일은 그 조건을 그대로 지킨다. 모든 중간값과 결과는 정수이고 1 이상 99 이하이며,
   연산은 개념이 정한 두 가지(또는 네 가지)를 모두 쓴다. 곱셈은 곱셈구구 안(한 자리 × 한 자리),
   나눗셈은 그 역(나누어떨어지고 몫 2~9, 피제수 ≤ 81)만 쓴다 — 묶음 0-4-1 과 같은 범위라
   2학년 과정을 벗어나지 않는다. 두 자리 수는 덧셈·뺄셈 자리에만 온다.

   문제의 출처 — 기존 생성기를 그대로 쓴다
   ---------------------------------------
   새 문제 엔진을 만들지 않는다. 수는 사이트의 기존 생성기(Worksheets.generate,
   src\bank\legacy\types.js)가 내놓는 값만 쓴다. 이 묶음의 식은 세 수이므로(예: 24 + 13 − 8)
   생성기가 내놓는 두 수짜리 문제를 그대로 인쇄할 수는 없다. 그래서 기존 생성기에서
   수를 받아 오고(한 자리 2~9 는 natural-mul-1-1 · multiply-one · natural-div-1-1,
   두 자리 12~99 는 natural-add-2-2 · natural-sub-2-2 · natural-add-2-1 · natural-div-2-1),
   이 파일은 그 수로 식을 짜 맞추고 조건에 맞지 않는 것을 버린다 — 묶음 0-1-1 의 '세 수의 덧셈'
   (기존 생성기가 낸 10이 되는 두 수 + 세 번째 수를 묶는다)과 같은 방식이다.
   값은 전부 정수 연산으로 다시 계산해 검사하며, 서로 다른 식만 남기고 모자라면 seed 를 바꾸어
   더 받아 온다. 같은 typeId · 같은 seed → 같은 문제지.

   0·1 이 들어간 쉬운 수는 쓰지 않는다(layout-rules §2 '10% 이하'). 수를 받아 올 때
   0 또는 1 이 들어간 값(10, 21, 30 …)을 아예 빼므로 쉬운 문항은 0% 다.

   서식(layout-rules §2)
   ----------------------
     t1 ko050-order     2단×15줄 = 30문항  (§2 '가로셈 — 긴 식(세 수, 혼합 계산)' 최소 기준.
                                            실제 인쇄는 자동 맞춤이 늘려 2단×21줄 = 42문항)
     t2 ko050-steps     2단×10줄 = 20문항  (§2 '단계별 빈칸 채우기' 최소 기준. 실제 2단×11줄 = 22문항)
     t3 ko050-error-fix 3단×4줄 = 12문항   (§2 '잘못된 계산 과정 고치기' 최소값. 서식 이름에 error-fix 가
                                            들어가 sheet.js 의 최소 칸 높이 52mm 가 적용되므로
                                            자동 맞춤은 5줄까지 — 실제 3단×5줄 = 15문항)
   단·줄은 기본값이고 sheet.js 의 자동 맞춤이 칸 높이가 남으면 줄을 늘린다.
   가로셈과 세로셈을 섞지 않는다 — 이 묶음은 모두 가로셈이다. 한 장 한 유형이고 짝 유형이 없다.
   문항은 쉬운 것 → 어려운 것(수 크기·받아올림 횟수·연산 종류) 순서로 놓고, 문제 풀 전체에
   고르게 퍼지도록 뽑는다(앞에서부터 잘라 쓰지 않는다).

   틀린 풀이(t3)
   -------------
   0-5-0-0·1·2 는 순서 오류와 함께 명세 errorKinds 중 계산 실수 한 가지를 보인다.
   덧셈은 일의 자리 합을 하나 크게, 곱셈은 구구단 곱을 하나 크게 적는다.
   0-5-0-3 은 괄호 안을 나중에 계산한 순서 오류만 보인다.
   틀린 풀이의 값은 바른 값과 반드시 달라야 하고(같으면 버린다), 그 값도 0보다 큰 정수여야 한다.
   그래서 24 + 13 − 8 처럼 오른쪽부터 계산해도 값이 같은 모양과, 26 ÷ 2 × 2 = 6.5 나
   27 − 2 + 28 = −3 처럼 2학년이 쓸 수 없는 값이 나오는 모양은 t3 문제 풀에서 자동으로 빠진다.

   공용 파일(sheet.js · formats-*.js · gen-bridge.js)은 고치지 않는다. 이 묶음에 없는 서식
   셋(ko050-order · ko050-steps · ko050-error-fix)만 이 파일 안에서 등록한다.
*/
(function (root) {
  'use strict';

  const BUNDLE = /^0-5-0-/;          // 이 파일이 맡은 묶음
  const MINUS = '−';                  // 기존 생성기와 같은 뺄셈 기호
  const ANSWER_INK = '#d71f10';
  const RANK = { '+': 1, '−': 1, '×': 2, '÷': 2 };
  const NAME = { '+': '덧셈', '−': '뺄셈', '×': '곱셈', '÷': '나눗셈' };

  // 이 파일은 파이썬 정적 점검(esprima)으로도 읽을 수 있게 최신 문법(?., ??)을 쓰지 않는다.
  const esc = value => String(value === undefined || value === null ? '' : value)
    .replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
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

  /* ================= 1. 수 받아 오기 (기존 생성기) ================= */

  // 기존 생성기에서 이 묶음이 쓰는 수를 받아 온다. 한 자리는 곱셈구구·한 자리 나눗셈에서,
  // 두 자리는 두 자리 덧셈·뺄셈·나눗셈에서 — 개념에 맞는 범위를 그대로 가져다 쓴다.
  const SOURCES = {
    small: ['natural-mul-1-1', 'multiply-one', 'natural-div-1-1'],
    big: ['natural-add-2-2', 'natural-sub-2-2', 'natural-add-2-1', 'natural-div-2-1']
  };
  const LIMIT = { small: [2, 9], big: [12, 99] };

  function numbers(config, kind, need) {
    if (!root.Worksheets || typeof root.Worksheets.generate !== 'function') throw Error('기존 Worksheets 생성기를 찾지 못했습니다.');
    const ids = SOURCES[kind], range = LIMIT[kind];
    const out = [], seen = new Set();
    let stall = 0;
    for (let batch = 0; out.length < need && batch < 200 && stall < ids.length * 4; batch++) {
      let rows;
      try { rows = root.Worksheets.generate(ids[batch % ids.length], (Number(config.seed) + Math.imul(batch + 1, 104729)) >>> 0, 24); }
      catch (error) { stall++; continue; }
      const before = out.length;
      for (const row of rows) {
        for (const raw of [row.a, row.b]) {
          const value = Number(raw);
          if (!Number.isInteger(value) || value < range[0] || value > range[1]) continue;
          if (/[01]/.test(String(value))) continue;        // 0·1 이 들어간 쉬운 수는 쓰지 않는다
          if (seen.has(value)) continue;
          seen.add(value); out.push(value);
        }
      }
      stall = out.length > before ? 0 : stall + 1;
    }
    if (!out.length) throw Error(config.typeId + ': 기존 생성기에서 쓸 수 있는 수를 받지 못했습니다.');
    return out;
  }

  // 열거 순서를 고르게 흩뿌린다 — 앞에서부터 잘라 쓰면 작은 수만 나온다.
  function mix(t, slot) {
    let h = Math.imul(t ^ 0x9e3779b9, 0x85ebca6b);
    h = Math.imul(h ^ (slot * 7919 + 17), 0xc2b2ae35);
    h ^= h >>> 13;
    return (h >>> 0);
  }

  /* ================= 2. 식의 모양 ================= */

  // 곱셈은 곱셈구구 안(한 자리 × 한 자리, 곱 ≤ 81), 나눗셈은 그 역(나누어떨어지고 몫 2~9)만 쓴다.
  // 묶음 0-4-1(곱셈구구로 몫 구하기)과 같은 범위라 2학년 과정을 벗어나지 않는다.
  const exact = (a, b) => b >= 2 && b <= 9 && a % b === 0 && a / b >= 2 && a / b <= 9;

  // roles 는 세 수의 출처(한 자리/두 자리), ops 는 연산 두 개, paren 은 괄호로 묶는 쪽.
  // accept 는 그 모양만의 조건이고, 중간값·결과의 정수·범위 조건은 makeItem 이 공통으로 본다.
  const SHAPES = {
    // 0-5-0-0 덧셈과 뺄셈이 섞인 계산 — 같은 순위라 왼쪽부터. 두 자리 수끼리 더하고 빼는 셈.
    '0-5-0-0': [
      { id: 'p1', ops: ['+', MINUS], roles: ['big', 'big', 'small'], paren: null },
      { id: 'm1', ops: [MINUS, '+'], roles: ['big', 'big', 'small'], paren: null, accept: n => n[0] > n[1] },
      { id: 'p2', ops: ['+', MINUS], roles: ['big', 'small', 'big'], paren: null },
      { id: 'm2', ops: [MINUS, '+'], roles: ['big', 'small', 'big'], paren: null, accept: n => n[0] > n[1] }
    ],
    // 0-5-0-1 곱셈과 나눗셈이 섞인 계산
    '0-5-0-1': [
      { id: 'x1', ops: ['×', '÷'], roles: ['small', 'small', 'small'], paren: null,
        accept: n => exact(n[0] * n[1], n[2]) },
      { id: 'd1', ops: ['÷', '×'], roles: ['big', 'small', 'small'], paren: null,
        accept: n => exact(n[0], n[1]) }
    ],
    // 0-5-0-2 덧셈·뺄셈과 곱셈·나눗셈이 섞인 계산 — 우선순위가 다르므로 순서가 결과를 바꾼다
    '0-5-0-2': [
      { id: 'a1', ops: ['+', '×'], roles: ['big', 'small', 'small'], paren: null },
      { id: 'a2', ops: [MINUS, '×'], roles: ['big', 'small', 'small'], paren: null },
      { id: 'a3', ops: ['×', '+'], roles: ['small', 'small', 'big'], paren: null },
      { id: 'a4', ops: ['×', MINUS], roles: ['small', 'small', 'big'], paren: null, accept: n => n[0] * n[1] > n[2] },
      { id: 'a5', ops: ['+', '÷'], roles: ['big', 'big', 'small'], paren: null, accept: n => exact(n[1], n[2]) },
      { id: 'a6', ops: [MINUS, '÷'], roles: ['big', 'big', 'small'], paren: null, accept: n => exact(n[1], n[2]) },
      { id: 'a7', ops: ['÷', '+'], roles: ['big', 'small', 'big'], paren: null, accept: n => exact(n[0], n[1]) },
      { id: 'a8', ops: ['÷', MINUS], roles: ['big', 'small', 'small'], paren: null, accept: n => exact(n[0], n[1]) }
    ],
    // 0-5-0-3 괄호가 있는 혼합 계산 — 괄호 안을 먼저 계산한다. 괄호 안이 곱셈구구의 한 가지가 된다.
    '0-5-0-3': [
      { id: 'b1', ops: ['+', '×'], roles: ['small', 'small', 'small'], paren: 'left',
        accept: n => n[0] + n[1] <= 9 },
      { id: 'b2', ops: [MINUS, '×'], roles: ['small', 'small', 'small'], paren: 'left',
        accept: n => n[0] > n[1] && n[0] - n[1] <= 9 },
      { id: 'b3', ops: ['+', '÷'], roles: ['big', 'big', 'small'], paren: 'left',
        accept: n => exact(n[0] + n[1], n[2]) },
      { id: 'b4', ops: [MINUS, '÷'], roles: ['big', 'big', 'small'], paren: 'left',
        accept: n => n[0] > n[1] && exact(n[0] - n[1], n[2]) },
      { id: 'b5', ops: ['÷', '+'], roles: ['big', 'small', 'small'], paren: 'right',
        accept: n => exact(n[0], n[1] + n[2]) },
      { id: 'b6', ops: ['÷', MINUS], roles: ['big', 'small', 'small'], paren: 'right',
        accept: n => n[1] > n[2] && exact(n[0], n[1] - n[2]) },
      { id: 'b7', ops: [MINUS, '×'], roles: ['big', 'big', 'small'], paren: 'left',
        accept: n => n[0] > n[1] && n[0] - n[1] <= 9 },
      { id: 'b8', ops: ['×', '+'], roles: ['small', 'small', 'small'], paren: 'right',
        accept: n => n[1] + n[2] <= 9 }
    ]
  };

  /* ================= 3. 계산 순서 ================= */

  const apply = (left, op, right) =>
    op === '+' ? left + right : op === MINUS ? left - right : op === '×' ? left * right : left / right;

  // 식을 자리 목록으로 — 수와 연산이 번갈아 놓인다.
  const place = item => [
    { value: item.nums[0] }, { op: item.ops[0] }, { value: item.nums[1] },
    { op: item.ops[1] }, { value: item.nums[2] }
  ];
  const keep = slot => (slot.op ? { op: slot.op } : { value: slot.value });

  // 한 번 계산한다: side 0 은 왼쪽 묶음(수0 연산0 수1), side 1 은 오른쪽 묶음(수1 연산1 수2).
  // 이미 한 번 접었으면 남은 묶음 하나만 있으므로 side 와 상관없이 그 묶음을 계산한다.
  function collapse(list, side) {
    const at = (list.length === 5 && side === 1) ? 2 : 0;
    const value = apply(list[at].value, list[at + 1].op, list[at + 2].value);
    const rest = list.slice(0, at).map(keep).concat([{ value: value, just: true }], list.slice(at + 3).map(keep));
    return { list: rest, value: value };
  }

  // 계산 순서: 괄호 안 → 곱셈·나눗셈 → 덧셈·뺄셈, 같은 순위는 왼쪽부터 (명세 params)
  function firstSide(item) {
    if (item.paren === 'left') return 0;
    if (item.paren === 'right') return 1;
    return RANK[item.ops[0]] < RANK[item.ops[1]] ? 1 : 0;
  }
  function run(item, first) {
    const one = collapse(place(item), first);
    const two = collapse(one.list, 0);
    return { first: one.value, value: two.value, one: one.list, two: two.list };
  }

  // 받아올림/받아내림 횟수 — 어려운 순서를 정할 때 쓴다 (sheet\gen-bridge.js 와 같은 규칙)
  function carries(a, b, op) {
    let incoming = 0, count = 0;
    while (a || b) {
      const x = a % 10, y = b % 10;
      incoming = op === '+' ? Number(x + y + incoming >= 10) : Number(x - incoming < y);
      count += incoming;
      a = Math.floor(a / 10); b = Math.floor(b / 10);
    }
    return count;
  }

  function difficulty(item) {
    let score = item.nums[0] + item.nums[1] + item.nums[2];
    if (item.ops.indexOf('×') >= 0) score += 30;
    if (item.ops.indexOf('÷') >= 0) score += 45;
    if (item.paren) score += 20;
    const pair = item.side === 0 ? [item.nums[0], item.nums[1]] : [item.nums[1], item.nums[2]];
    const op = item.ops[item.side];
    if (op === '+' || op === MINUS) score += 100 * carries(pair[0], pair[1], op);
    return score;
  }

  /* ================= 4. 문항 만들기 ================= */

  const CAP = 360;                    // 문제 풀 최대 크기 (자동 맞춤이 늘려도 이 안에서)

  function makeItem(shape, nums) {
    if (shape.accept && !shape.accept(nums)) return null;
    const item = { nums: nums, ops: shape.ops, paren: shape.paren || null, shape: shape.id };
    const side = firstSide(item);
    const right = run(item, side);
    const value = right.value;
    if (!Number.isInteger(right.first) || right.first < 1 || right.first > 99) return null;
    if (!Number.isInteger(value) || value < 1 || value > 99) return null;
    const other = run(item, 1 - side);
    item.side = side;
    item.value = value;
    item.wrongSide = 1 - side;
    item.wrongFirst = other.first;
    item.wrongValue = other.value;
    item.errorKind = null;
    // FIX: t3 의 명세에 적힌 계산 실수도 실제 틀린 풀이에 나타나게 한다.
    // 덧셈 실수는 잘못 먼저 계산한 단계에, 구구단 실수는 곱셈 단계에 둔다.
    if (shape.id[0] === 'm' || shape.id[0] === 'a') {
      if (item.ops[item.wrongSide] === '+') {
        item.wrongFirst = other.first + 1;
        item.wrongValue = item.wrongSide === 0
          ? apply(item.wrongFirst, item.ops[1], nums[2])
          : apply(nums[0], item.ops[0], item.wrongFirst);
        item.errorKind = '일의 자리 합을 잘못 셈';
      }
    } else if (shape.id === 'x1' && item.ops[1 - item.wrongSide] === '×') {
      item.wrongValue = other.value + 1;
      item.errorKind = '구구단 곱을 잘못 외움';
    } else if (shape.id === 'd1') {
      item.wrongFirst = other.first - 1;
      item.wrongValue = nums[0] / item.wrongFirst;
      item.errorKind = '구구단 곱을 잘못 외움';
    }
    item.wrongNote = wrongNote(item, side);
    item.key = nums.join(':') + ':' + shape.id;
    return item;
  }

  // 명세 errorKinds 의 표현 — 실제로 잘못 계산한 연산을 그대로 적는다.
  function wrongNote(item, side) {
    if (item.paren) return '괄호 안을 나중에 계산함';
    const bad = item.ops[1 - side], good = item.ops[side];
    const order = RANK[bad] === RANK[good] ? '같은 순위를 오른쪽부터 계산함'
      : NAME[bad] + '을 ' + NAME[good] + '보다 먼저 계산함';
    return item.errorKind ? '순서 오류 · ' + item.errorKind : order;
  }

  function buildPool(config) {
    const shapes = SHAPES[config.gen.concept];
    const pools = { small: numbers(config, 'small', 8), big: numbers(config, 'big', 28) };
    const out = [], seen = new Set();
    // 모양마다 같은 몫을 채운다 — 한 모양이 문제 풀을 다 차지하면 다른 모양이 사라진다.
    const perShape = config.format === 'ko050-error-fix'
      ? 180 : Math.max(24, Math.ceil(CAP / shapes.length));
    for (const shape of shapes) {
      const sizes = shape.roles.map(role => pools[role].length);
      if (sizes.indexOf(0) >= 0) continue;
      let total = 1;
      for (const size of sizes) total *= size;
      const budget = Math.min(total * 2, 8000);
      let mine = 0;
      for (let t = 0; t < budget && mine < perShape; t++) {
        const nums = shape.roles.map((role, slot) => pools[role][mix(t + 1, slot) % pools[role].length]);
        const item = makeItem(shape, nums);
        if (!item || seen.has(item.key)) continue;
        seen.add(item.key); out.push(item); mine++;
      }
      // 구구단 오류용은 나누기까지 정수가 되는 조합이 드물어 생성기 수를 전부 조합한다.
      if (config.format === 'ko050-error-fix' && (shape.id === 'x1' || shape.id === 'd1')) {
        for (const a of pools[shape.roles[0]]) for (const b of pools.small) for (const c of pools.small) {
          const item = makeItem(shape, [a, b, c]);
          if (item && !seen.has(item.key)) { seen.add(item.key); out.push(item); }
        }
      }
    }
    if (!out.length) throw Error(config.typeId + ': 조건에 맞는 문항을 만들지 못했습니다.');
    return out.sort((a, b) => difficulty(a) - difficulty(b) || (a.key < b.key ? -1 : 1));
  }

  const cache = new Map();
  function pool(config) {
    const key = config.typeId + '|' + config.seed;
    if (!cache.has(key)) cache.set(key, buildPool(config));
    return cache.get(key);
  }

  // 문제 풀을 count 등분한 자리에서 하나씩 고른다 — 앞에서부터 잘라 쓰면 쉬운 문제만 나온다.
  function spread(list, count, jitter) {
    if (count >= list.length) return list.slice();
    const step = list.length / count, out = [];
    for (let i = 0; i < count; i++) {
      const at = Math.min(list.length - 1, Math.floor((i + (jitter || 0)) * step));   // jitter: seed 가 바뀌면 고르는 자리가 달라진다
      if (out.indexOf(list[at]) < 0) out.push(list[at]);
    }
    for (let i = 0; out.length < count && i < list.length; i++) if (out.indexOf(list[i]) < 0) out.push(list[i]);
    return out;
  }

  function items(config) {
    const count = config.count || config.cols * config.rows;
    // t3 는 순서를 잘못 적용한 값이 바른 값과 달라야 하고, 그 값도 정수여야 한다.
    // (같은 순위를 오른쪽부터 계산해도 값이 같은 24 + 13 − 8 은 여기서 걸러진다 — t1·t2 에서는 쓴다.
    //  6.5 나 −3 처럼 2학년이 쓸 수 없는 값이 나오는 모양도 함께 걸러 낸다.)
    const usable = pool(config).filter(item => config.format !== 'ko050-error-fix'
      || ((item.paren || item.errorKind)
        && item.wrongValue !== item.value && Number.isInteger(item.wrongValue) && item.wrongValue >= 1
        && item.wrongValue <= 99 && Number.isInteger(item.wrongFirst) && item.wrongFirst >= 1
        && item.wrongFirst <= 99));
    const picked = spread(usable, count, (mix(Number(config.seed) || 1, 5) % 1000) / 1000).sort((a, b) => difficulty(a) - difficulty(b) || (a.key < b.key ? -1 : 1));
    if (picked.length < count) throw Error(config.typeId + ': 조건에 맞는 문항 ' + count + '개 중 ' + picked.length + '개만 만들었습니다.');
    return picked.map((item, index) => ({ ...item, index: index }));
  }

  /* ================= 5. 서식 ================= */

  let styled = false;
  function css() {
    if (styled || typeof document === 'undefined') return;
    styled = true;
    const style = document.createElement('style');
    style.id = 'ko050-style';
    style.textContent = `
      /* 높이를 100% 로 묶지 않는다 — 내용이 칸보다 크면 sheet.js 의 자동 맞춤이 그 넘침을 보고
         줄 수를 줄인다(높이를 묶으면 칸 안에서 잘려 넘침이 보이지 않는다). */
      .ko050 { display:flex; flex-direction:column; min-height:0; gap:.5mm; white-space:nowrap; font-variant-numeric:tabular-nums; }
      .ko050-row { display:flex; align-items:flex-end; }
      .ko050-tok { display:inline-flex; flex-direction:column; align-items:center; }
      .ko050-mark { display:block; width:1.5em; height:1.4em; margin-bottom:.3em; border:.4pt solid #bbb; border-radius:.7mm; font-size:.65em; line-height:1.4em; text-align:center; color:${ANSWER_INK}; }
      .ko050-mark.plain { border-color:transparent; }
      .ko050-glyph { line-height:1.35; }
      .ko050-num .ko050-glyph { padding:0 .2mm; }
      .ko050-op .ko050-glyph { padding:0 .8mm; }
      .ko050-paren .ko050-glyph { padding:0 .1mm; }
      .ko050-eq { padding:0 1mm; }
      .ko050-ans { display:inline-block; min-width:2.2em; height:1.2em; border-bottom:.5pt solid #555; text-align:center; line-height:1.2; }
      .ko050-ans.has { color:${ANSWER_INK}; }
      .ko050-line { line-height:1.4; }
      .ko050-blank { display:inline-block; min-width:1.7em; height:1.2em; border:.5pt solid #555; text-align:center; vertical-align:-.25em; line-height:1.2; }
      .ko050-blank.has { color:${ANSWER_INK}; border-color:${ANSWER_INK}; }
      .ko050-fix { display:flex; gap:3mm; width:100%; }
      .ko050-wide { align-self:stretch; justify-content:center; }
      .ko050-half { flex:1 1 0; min-width:0; display:flex; flex-direction:column; }
      .ko050-half .ko050-line { line-height:1.35; }
      .ko050-rule { height:1.9em; border-bottom:.4pt dotted #bbb; }
      .ko050-note { flex:none; font-size:.72em; color:${ANSWER_INK}; white-space:normal; line-height:1.2; }
      .ko050-fixed .ko050-line { color:${ANSWER_INK}; }
      .ko050-prompt { flex:none; font-size:8pt; color:#555; }
    `;
    document.head.appendChild(style);
  }

  // 자리 목록을 글로 — 방금 계산한 값(just)은 빈칸으로 두거나 정답 쪽에서 붉게 채운다.
  function text(item, list, blank, answer) {
    const five = list.length === 5;
    let html = '';
    for (let i = 0; i < list.length; i++) {
      const slot = list[i];
      if (five && item.paren === 'left' && i === 0) html += '(';
      if (five && item.paren === 'right' && i === 2) html += '(';
      if (slot.op) html += ' ' + esc(slot.op) + ' ';
      else if (slot.just && blank) html += '<span class="ko050-blank' + (answer ? ' has' : '') + '">' + (answer ? esc(slot.value) : '') + '</span>';
      else html += esc(slot.value);
      if (five && item.paren === 'left' && i === 2) html += ')';
      if (five && item.paren === 'right' && i === 4) html += ')';
    }
    return html;
  }

  // t1 — 식을 그대로 두고 연산 위에 순서 표시 자리를 둔 다음 답을 쓴다.
  function renderOrder(cell, q, answer) {
    css();
    const wrap = el('div', 'ko050');
    const row = el('div', 'ko050-row');
    const marks = [];
    marks[q.side] = 1; marks[1 - q.side] = 2;
    const token = (kind, html, opIndex) => {
      const box = plain('span', 'ko050-tok ko050-' + kind, '<span class="ko050-glyph">' + html + '</span>');
      const mark = el('span', 'ko050-mark' + (opIndex === undefined ? ' plain' : ''), opIndex === undefined ? '' : String(answer ? marks[opIndex] : ''));
      box.insertBefore(mark, box.firstChild);
      row.append(box);
    };
    if (q.paren === 'left') token('paren', '(');
    token('num', esc(q.nums[0]));
    token('op', esc(q.ops[0]), 0);
    if (q.paren === 'right') token('paren', '(');
    token('num', esc(q.nums[1]));
    if (q.paren === 'left') token('paren', ')');
    token('op', esc(q.ops[1]), 1);
    token('num', esc(q.nums[2]));
    if (q.paren === 'right') token('paren', ')');
    token('eq', '=');
    const box = plain('span', 'ko050-tok', '<span class="ko050-ans' + (answer ? ' has' : '') + '">' + (answer ? esc(q.value) : '') + '</span>');
    box.insertBefore(el('span', 'ko050-mark plain', ''), box.firstChild);
    row.append(box);
    wrap.append(row);
    cell.append(wrap);
  }

  // t2 — 식을 한 줄 쓰고, 한 단계씩 줄여 가며 중간 계산 자리를 빈칸으로 둔다.
  function renderSteps(cell, q, answer) {
    css();
    const wrap = el('div', 'ko050');
    wrap.append(plain('div', 'ko050-line', text(q, place(q), false, false)));
    const one = collapse(place(q), q.side);
    wrap.append(plain('div', 'ko050-line', '= ' + text(q, one.list, true, answer)));
    const two = collapse(one.list, 0);
    wrap.append(plain('div', 'ko050-line', '= ' + text(q, two.list, true, answer)));
    cell.append(wrap);
  }

  // t3 — 왼쪽에 순서를 잘못 적용한 풀이, 오른쪽에 바르게 고쳐 쓸 자리.
  function renderErrorFix(cell, q, answer) {
    css();
    const wrap = el('div', 'ko050 ko050-wide');
    const row = el('div', 'ko050-fix');
    const left = el('div', 'ko050-half'), right = el('div', 'ko050-half');
    const wrong = run(q, q.wrongSide);
    if (q.wrongFirst !== wrong.first) {
      wrong.one[q.wrongSide === 0 ? 0 : 2].value = q.wrongFirst;
    }
    left.append(plain('div', 'ko050-line', text(q, place(q), false, false)));
    left.append(plain('div', 'ko050-line', '= ' + text(q, wrong.one, false, false)));
    left.append(plain('div', 'ko050-line', '= ' + esc(q.wrongValue)));
    if (answer) {
      const right2 = run(q, q.side);
      right.classList.add('ko050-fixed');
      right.append(plain('div', 'ko050-line', text(q, place(q), false, false)));
      right.append(plain('div', 'ko050-line', '= ' + text(q, right2.one, false, false)));
      right.append(plain('div', 'ko050-line', '= ' + esc(q.value)));
    } else {
      for (let i = 0; i < 3; i++) right.append(el('div', 'ko050-rule'));
    }
    row.append(left, right);
    wrap.append(row);
    cell.append(wrap);
  }

  function register() {
    if (!root.Sheet || typeof root.Sheet.register !== 'function') return false;
    root.Sheet.register('ko050-order', renderOrder);
    root.Sheet.register('ko050-steps', renderSteps);
    root.Sheet.register('ko050-error-fix', renderErrorFix);
    return true;
  }

  /* ================= 6. 유형 등록 ================= */

  // cols·rows 는 layout-rules.md §2 의 최소 기준값이다 (t1·t2 2단, t3 3단).
  // sheet.js 의 자동 맞춤이 칸 높이가 남으면 줄을 늘린다 — 실제 인쇄 문항 수는
  // tools\check-0-5-0-browser.py 로 확인한다 (t1 42문항 · t2 22문항 · t3 15문항).
  //
  // 제목은 머리말 한 줄(10pt, 208px)에 들어가야 해서 개념·유형을 줄여 적는다.
  //   개념 전체 이름  0-5-0-0 덧셈과 뺄셈이 섞인 계산 / 0-5-0-1 곱셈과 나눗셈이 섞인 계산
  //                   0-5-0-2 덧셈·뺄셈과 곱셈·나눗셈이 섞인 계산 / 0-5-0-3 괄호가 있는 혼합 계산
  //   유형 전체 이름  t1 계산 순서 표시 후 계산하기 / t2 중간 계산의 빈칸 채우기
  //                   t3 순서를 잘못 적용한 풀이 고치기
  // 긴 제목은 ' · 정답' 이 붙는 정답지에서 잘린다(2026-10-02 브라우저 실측 208px).
  const SHORT = { '0-5-0-0': '덧셈·뺄셈', '0-5-0-1': '곱셈·나눗셈', '0-5-0-2': '사칙연산', '0-5-0-3': '괄호 혼합' };
  const LAYOUT = {
    t1: { title: '순서 표시', instruction: '계산 순서를 1, 2로 표시하고 계산하세요.',
          format: 'ko050-order', cols: 3, rows: 10, fontPt: 12, autoFit: false, maxProblems: 40 },
    t2: { title: '중간 계산', instruction: '빈칸에 알맞은 수를 써넣으세요.',
          format: 'ko050-steps', cols: 3, rows: 8, fontPt: 12, autoFit: false, maxProblems: 40 },
    t3: { title: '순서 고치기', instruction: '잘못된 곳을 찾아 바르게 고쳐 쓰세요.',
          format: 'ko050-error-fix', cols: 2, rows: 6, fontPt: 11, autoFit: false, maxProblems: 40 }
  };

  // 칸을 넘기지 않는 가장 큰 글자(pt) — 개념마다 식 길이가 달라 따로 쟀다.
  const PT = {
    '0-5-0-0': { t1: 18, t2: 17, t3: 17 },
    '0-5-0-1': { t1: 18, t2: 17, t3: 17 },
    '0-5-0-2': { t1: 18, t2: 17, t3: 17 },
    '0-5-0-3': { t1: 15, t2: 17, t3: 17 }
  };
  const TYPES = [];
  ['0-5-0-0', '0-5-0-1', '0-5-0-2', '0-5-0-3'].forEach((concept, ci) => {
    ['t1', 't2', 't3'].forEach((kind, ki) => {
      const layout = LAYOUT[kind];
      TYPES.push({
        typeId: concept + '-' + kind,
        title: SHORT[concept] + ' · ' + layout.title,
        instruction: layout.instruction,
        format: layout.format, cols: layout.cols, rows: layout.rows, fontPt: (PT[concept] || {})[kind] || layout.fontPt, autoFit: layout.autoFit, maxProblems: layout.maxProblems,
        seed: 20261051 + ci * 3 + ki,
        gen: { concept: concept }
      });
    });
  });

  function connect() {
    if (!root.SheetGen || typeof root.SheetGen.generate !== 'function' || root.SheetGen.calcOrder050) return false;
    const base = root.SheetGen.generate;
    root.SheetGen.generate = function (config) {
      if (config && BUNDLE.test(String(config.typeId || ''))) return items(config);
      return base.apply(this, arguments);
    };
    Object.defineProperty(root.SheetGen, 'calcOrder050', { value: true });
    return true;
  }

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

  root.CalcOrder050 = { types: TYPES, items, pool, buildPool, makeItem, run, text, difficulty, numbers };
})(globalThis);
