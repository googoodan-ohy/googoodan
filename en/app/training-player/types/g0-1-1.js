/* 연산 트레이닝 묶음 0-1-1 — 기초 덧셈.
   기존 Worksheets 생성기의 문항을 개념 조건으로 걸러 재사용한다.
   같은 seed는 같은 문제지를 만든다. 가짓수가 적은 개념은 배치 규칙 §6대로 고르게 반복한다.
   0-1-1-4 세 수 덧셈의 세로셈·빈칸은 6단×8줄, 각 48문항이다.
   0-1-1-0~3은 명세 범위에서 서로 다른 두 수 식이 각각 최대 36·9·9·36개다.
   0-1-1-2는 개념 자체가 10을 포함하므로 쉬운 문제 비율 예외이다.
   0-1-1-0의 고치기는 1을 피연산자로 쓰지 않는 21개 식으로 구성한다.
*/
(function (root) {
  'use strict';

  /* ================= 1. 작은 도구 ================= */

  const node = (tag, className, value) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (value !== undefined) el.textContent = value;
    return el;
  };

  // 기존 생성기·다른 묶음과 같은 방식의 결정적 난수 (같은 seed → 같은 문제지)
  function rng(seed) {
    let state = (Number(seed) >>> 0) || 1;
    return (lo, hi) => {
      state += 0x6d2b79f5;
      let t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return lo + Math.floor((((t ^ (t >>> 14)) >>> 0) / 4294967296) * (hi - lo + 1));
    };
  }

  const padLeft = (value, width) => String(value).padStart(width, ' ');

  /* ================= 2. 개념 정의 ================= */

  // legacy : 기존 생성기 id,  test : 개념 조건(한 자리 두 수)
  // width  : 세로셈 칸 수(한 장 안에서 고정),  carry : 받아올림 칸을 둘지
  // kinds  : 잘못된 계산 과정 고치기에 쓸 오류(개념별)
  const CONCEPTS = [
    {
      id: '0-1-1-0', name: '합이 9 이하인 덧셈', short: '합 9 이하 덧셈',
      legacy: 'natural-add-1-1', test: (a, b) => a + b <= 9,
      width: 1, carry: false, blanks: ['a', 'b'], font: 15,
      kinds: ['one-off', 'recount', 'sum-diff']
    },
    {
      id: '0-1-1-1', name: '합이 10인 덧셈', short: '합 10 덧셈',
      legacy: 'natural-add-1-1', test: (a, b) => a + b === 10,
      width: 2, carry: true, blanks: ['a', 'b'], font: 16,
      kinds: ['carry-lost', 'one-off', 'swapped']
    },
    {
      id: '0-1-1-2', name: '10에 한 자리 수 더하기', short: '10 더하기',
      legacy: 'natural-add-2-1', test: (a, b) => (a === 10 && b >= 1 && b <= 9) || (b === 10 && a >= 1 && a <= 9),
      width: 2, carry: false, blanks: ['a', 'b'], font: 16,
      kinds: ['ones-only', 'swapped', 'complement']
    },
    {
      id: '0-1-1-3', name: '10을 만들어 한 자리 수끼리 더하기', short: '10 만들기',
      legacy: 'natural-add-1-1', test: (a, b) => a >= 2 && b >= 2 && a + b >= 11,
      width: 2, carry: true, blanks: ['a', 'b'], font: 15,
      kinds: ['rest-lost', 'double-add', 'wrong-split']
    },
    {
      id: '0-1-1-4', name: '세 수의 덧셈 — 10이 되는 두 수 먼저 묶기', short: '세 수 덧셈',
      three: true, test: (a, b, c) => a + b === 10 || a + c === 10 || b + c === 10,
      width: 2, carry: true, blanks: ['a', 'b', 'c'], font: 15,
      kinds: ['carry-lost', 'one-off', 'carry-double']
    }
  ];
  const BY_ID = {};
  CONCEPTS.forEach(concept => { BY_ID[concept.id] = concept; });

  // 개념별 문제 풀 크기(서로 다른 문제 수)와 한 장에 넣을 수 있는 최대 문항 수.
  // POOL 은 세로셈·빈칸이 같은 단·줄이 되도록 두 유형에 같은 값을 쓴다.
  // FIXCAP 은 고치기에 사용할 수 있는 원래 식의 수이다.
  const POOL = { '0-1-1-0': 36, '0-1-1-1': 9, '0-1-1-2': 18, '0-1-1-3': 36, '0-1-1-4': 60 };
  const FIXCAP = { '0-1-1-0': 21, '0-1-1-1': 9, '0-1-1-2': 18, '0-1-1-3': 36, '0-1-1-4': 60 };

  /* ================= 3. 잘못된 계산 만들기 ================= */

  const KINDS = {
    'one-off': { note: '수를 하나 빼먹고 셈', value: q => Number(q.answer) - 1 },
    'recount': { note: '두 번째 수를 셀 때 첫 수를 다시 셈', value: q => Number(q.a) * 2 },
    'sum-diff': { note: '합과 차를 혼동함', value: q => Math.abs(Number(q.a) - Number(q.b)) },
    'carry-lost': { note: '받아올림을 다음 자리에 더하지 않음', value: q => Number(q.answer) - 10 },
    'ones-only': { note: '10을 한 묶음으로 보지 않음', value: q => Number(q.answer) % 10 },
    'swapped': { note: '10과 낱개의 자리를 바꾸어 씀', value: q => String(q.answer).split('').reverse().join('') },
    'complement': { note: '보수인 두 수를 혼동함', value: q => (Number(q.b) < 10 ? 10 - Number(q.b) : null) },
    'rest-lost': { note: '가른 나머지를 더하지 않음', value: q => 10 },
    'double-add': { note: '같은 수를 두 번 더함', value: q => Number(q.a) * 2 },
    'wrong-split': { note: '10을 만들 수 있는 수를 잘못 가름', value: q => Number(q.answer) - 1 },
    'carry-double': { note: '받아올림을 두 번 더함', value: q => Number(q.answer) + 10 }
  };

  // 틀린 값은 바른 값과 달라야 하고, 세로셈 칸 수 안에 들어가야 한다.
  function wrongValue(kind, item, width) {
    const spec = KINDS[kind];
    if (!spec) return null;
    const value = spec.value(item);
    if (value == null) return null;
    const shown = String(value);
    if (!/^\d+$/.test(shown)) return null;
    if (Number(shown) === Number(item.answer)) return null;
    if (shown.length > width) return null;
    return shown;
  }

  /* ================= 4. 문제 만들기 ================= */

  // 기존 생성기에서 조건에 맞는 문제만 골라 낸다(모자라면 seed 를 바꾸어 더 뽑는다).
  function legacyFacts(concept, seed, needed) {
    if (!root.Worksheets || typeof root.Worksheets.generate !== 'function') throw Error('기존 Worksheets 생성기를 찾지 못했습니다.');
    const out = [], seen = new Set();
    for (let batch = 0; batch < 4000 && out.length < needed; batch++) {
      let rows;
      try {
        rows = root.Worksheets.generate(concept.legacy, (Number(seed) + batch * 104729) >>> 0, 16);
      } catch (error) {
        throw Error('기존 생성기 실패(' + concept.legacy + '): ' + error.message);
      }
      for (const row of rows) {
        const a = Number(row.a), b = Number(row.b), answer = Number(row.answer);
        if (!Number.isInteger(a) || !Number.isInteger(b) || !Number.isFinite(answer)) continue;
        if (!concept.test(a, b)) continue;
        const key = a + ':' + b;
        if (seen.has(key)) continue;
        seen.add(key);
        out.push({ a, b, answer, op: '+' });
      }
    }
    return out;
  }

  // 세 수의 덧셈: 기존 생성기로 10이 되는 두 수와 세 번째 수를 받아 묶는다.
  const RANKS = { front: 0, back: 1, split: 2 };
  function tripleFacts(seed, needed) {
    const pairs = legacyFacts({ legacy: 'natural-add-1-1', test: (a, b) => a + b === 10 && a > 1 && b > 1 }, seed, 7);
    const thirds = [];
    for (let batch = 0; batch < 40 && thirds.length < 8; batch++) {
      const rows = root.Worksheets.generate('natural-add-1-1', (Number(seed) + 7919 * (batch + 1)) >>> 0, 16);
      for (const row of rows) {
        for (const value of [Number(row.a), Number(row.b)]) {
          if (value >= 2 && value <= 9 && !thirds.includes(value)) thirds.push(value);
        }
      }
    }
    thirds.sort((x, y) => x - y);
    const out = [], seen = new Set();
    for (const rank of ['front', 'back', 'split']) {
      for (const pair of pairs) {
        for (const third of thirds) {
          const seq = rank === 'front' ? [pair.a, pair.b, third]
            : rank === 'back' ? [third, pair.a, pair.b]
              : [pair.a, third, pair.b];
          const key = seq.join(':');
          if (seen.has(key)) continue;
          seen.add(key);
          out.push({
            a: seq[0], b: seq[1], c: seq[2], op: '+',
            answer: seq[0] + seq[1] + seq[2], rank: RANKS[rank]
          });
        }
      }
    }
    return out;
  }

  // 쉬운 것 → 어려운 것(같은 조건 안에서 수 크기 기준). 같은 seed 면 같은 차례.
  function order(items, concept, answerOnly) {
    if (answerOnly) return items.slice().sort((x, y) => x.answer - y.answer);
    const key = concept.three
      ? item => [item.answer, item.rank, item.a, item.b, item.c]
      : item => [item.answer, item.a, item.b];
    return items.slice().sort((left, right) => {
      const x = key(left), y = key(right);
      for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) return x[i] - y[i];
      return 0;
    });
  }

  function wholePool(concept, seed) {
    const needed = POOL[concept.id];
    let items;
    if (concept.three) items = tripleFacts(seed, needed);
    else if (concept.id === '0-1-1-2') {
      // 10 + 낱개(9가지) 에 낱개 + 10(9가지)을 더해 18가지 (같은 개념 안에서 더하는 순서만 바꾼 새 문제)
      const base = legacyFacts({ ...concept, test: (a, b) => a === 10 && b >= 1 && b <= 9 }, seed, 9);
      items = base.concat(base.map(item => ({ a: item.b, b: item.a, answer: item.answer, op: '+' })));
    } else items = legacyFacts(concept, seed, needed);
    if (items.length < needed) throw Error(concept.id + ': 조건에 맞는 문제가 ' + needed + '개 필요한데 ' + items.length + '개뿐입니다.');
    return order(items, concept);
  }

  // 문제 풀을 count 등분한 지점에서 하나씩 고른다. 앞에서부터 잘라 쓰면 한 장이 개념 범위의
  // 아주 좁은 부분(예: 합이 가장 작은 몇 가지)만 덮게 되므로(2026-10-01 검수 D 지적),
  // 고르게 뽑은 뒤 다시 쉬운 순으로 놓는다.
  function spread(pool, count, concept) {
    if (count >= pool.length) return pool.slice(0, count);
    if (count <= 1) return pool.slice(0, count);
    const picked = [], used = new Set();
    for (let i = 0; i < count; i++) {
      let index = Math.round(i * (pool.length - 1) / (count - 1));
      while (used.has(index) && index < pool.length - 1) index += 1;
      while (used.has(index) && index > 0) index -= 1;
      used.add(index);
      picked.push(pool[index]);
    }
    return order(picked, concept);
  }

  // seed 로 섞는다(같은 seed → 같은 결과).
  function shuffled(list, seed, salt) {
    const rand = rng((Number(seed) ^ salt) >>> 0);
    const out = list.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = rand(0, i);
      const keep = out[i]; out[i] = out[j]; out[j] = keep;
    }
    return out;
  }

  // 풀을 쉬운 순으로 놓고 count 개 구간으로 나눈 뒤 구간마다 seed 로 하나씩 고른다
  // (범위를 고르게 덮으면서 seed 마다 다른 문제가 나온다). 풀 전체를 쓸 때는 합이 같은 문제끼리만 순서를 섞는다.
  function pickSeeded(pool, count, concept, seed) {
    const sorted = order(pool, concept);
    if (count >= sorted.length) return order(shuffled(sorted, seed, 0x3c6ef372), concept, true);
    const rand = rng((Number(seed) ^ 0x1b873593) >>> 0);
    const picked = [];
    for (let i = 0; i < count; i++) {
      const lo = Math.floor(i * sorted.length / count);
      const hi = Math.max(lo, Math.floor((i + 1) * sorted.length / count) - 1);
      picked.push(sorted[rand(lo, hi)]);
    }
    return picked;
  }

  // 가짓수가 적은 개념은 한 바퀴씩 고르게 반복한다. 한 바퀴 안에서는
  // 서로 다른 식을 쓰므로 옆 칸과 바로 아래 칸에도 같은 식이 붙지 않는다.
  function cycle(pool, count) {
    const out = [];
    while (out.length < count) out.push(...pool.slice(0, count - out.length));
    return out;
  }

  // 세로셈(t2)과 빈칸(t3)은 같은 단·줄이 되도록 같은 상한(POOL)을 쓴다.
  function calculation(concept, seed, count, cap) {
    const pool = wholePool(concept, seed);
    // 36칸이면 36가지 식을 한 번씩 쓴다(같은 식 반복 없음). 36칸보다 적으면 1 을 피연산자로 쓰지 않는 21가지에서 먼저 고른다.
    const base = concept.id === '0-1-1-0' && count <= 21 ? pool.filter(item => item.a !== 1 && item.b !== 1) : pool;
    return count > base.length ? cycle(pickSeeded(base, base.length, concept, seed), count) : pickSeeded(base, count, concept, seed);
  }

  function blanks(concept, seed, count, cap) {
    const items = calculation(concept, seed, count, cap);
    const rand = rng((Number(seed) ^ 0x5f3a7b1) >>> 0);
    return items.map(item => {
      const row = concept.blanks[rand(0, concept.blanks.length - 1)];
      const value = String(item[row]);
      const index = rand(0, value.length - 1);
      return { ...item, blank: { row, index } };
    });
  }

  function corrections(concept, seed, count, cap) {
    const pool = wholePool(concept, seed).filter(item => concept.id !== '0-1-1-0' || (item.a !== 1 && item.b !== 1));
    // 세로셈·빈칸과 같은 방식으로 고르게 뽑는다.
    const picked = count > pool.length ? cycle(pickSeeded(pool, pool.length, concept, seed), count) : pickSeeded(pool, count, concept, seed);
    const items = [];
    picked.forEach((item, index) => {
      // 문제마다 오류 종류를 돌아가며 쓴다. 그 종류가 이 개념의 칸 폭에 맞지 않으면(예:
      // 합 9 이하 개념의 한 자리 칸에 10 이 되는 틀린 값) 다음 종류로 넘어간다.
      // 가짓수가 모자란 개념은 순서를 돌려 반복한다(layout-rules §6).
      for (let step = 0; step < concept.kinds.length; step++) {
        const kind = concept.kinds[(index + step) % concept.kinds.length];
        const value = wrongValue(kind, item, concept.width);
        if (value == null) continue;
        items.push({ ...item, kind, wrong: value, wrongNote: KINDS[kind].note });
        break;
      }
    });
    if (items.length < count) throw Error(concept.id + ': 만들 수 있는 고치기 문제가 ' + count + '개보다 적습니다.');
    return items;
  }

  // sheet/gen-bridge.js 의 생성기를 감싼다(다른 묶음 서식은 그대로 원래 생성기로 넘긴다).
  function generate(config) {
    const gen = config.gen || {};
    const concept = BY_ID[gen.concept];
    if (!concept) throw Error('묶음 0-1-1: 알 수 없는 개념 ' + gen.concept);
    const count = config.count || config.cols * config.rows;
    if (gen.mode === 'blank') return blanks(concept, config.seed, count, POOL[concept.id]);
    if (gen.mode === 'fix') return corrections(concept, config.seed, count, FIXCAP[concept.id]);
    return calculation(concept, config.seed, count, POOL[concept.id]);
  }

  /* ================= 5. 서식(CSS) ================= */

  const CSS = [
    '.g011-center{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;min-height:0}',
    '.sheet-cell.g011-compact{padding-top:1mm;padding-bottom:.5mm}',
    '.g011-compact .vertical-row{height:1.18em}',
    '.g011-compact .vertical-digit,.g011-compact .vertical-sign{height:1.15em}',
    '.g011-compact .carry-row{height:.9em}',
    '.g011-blank{border:1px solid #333}',
    '.answer-page .g011-printed .vertical-digit:not(.g011-blank){color:#111 !important;font-weight:400 !important}',
    '.carry-row .g011-blank{border-color:#333}',
    /* 받아올림 칸도 자리 칸과 같은 폭으로 맞춘다(0.65em 글자 기준 1.12em) */
    '.g011-center .carry-row .vertical-digit{width:1.72em;font-size:.65em !important}',
    /* 일의 자리 위 칸은 받아올림이 생기지 않으므로 상자를 그리지 않는다(자리 맞춤용) */
    '.sheet-cell .carry-row .g011-nocarry{border:0}',
    '.g011-fix{display:flex;align-items:center;justify-content:center;gap:1.6mm}',
    '.g011-arrow{color:#999;font-size:11pt}',
    '.g011-wrong{color:#333}',
    '.g011-mark{color:#c00}',
    '.g011-redo{border:1px solid #ccc;box-sizing:border-box;background-image:repeating-linear-gradient(90deg,transparent 0,transparent calc(1.12em - 1px),#eee calc(1.12em - 1px),#eee 1.12em);background-position:left top}',
    '.g011-note{margin-top:1.4mm;font-size:7.5pt;color:#444;max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'
  ].join('');

  let styled = false;
  function installCss() {
    if (styled || typeof document === 'undefined') return;
    if (document.getElementById('g011-styles')) { styled = true; return; }
    styled = true;
    const style = document.createElement('style');
    style.id = 'g011-styles';
    style.textContent = CSS;
    document.head.append(style);
  }

  /* ================= 6. 세로셈 그리기 ================= */

  // 열별 받아올림(왼쪽 기준 열 인덱스 → 그 열 위에 쓰는 수). 정답지에만 채운다.
  function carriesOf(values, width) {
    const slots = new Array(width).fill(0);
    let carry = 0;
    for (let place = 0; place < width; place++) {
      let sum = carry;
      values.forEach(value => { sum += Math.floor(Number(value) / 10 ** place) % 10; });
      carry = Math.floor(sum / 10);
      const above = width - 2 - place;
      if (above >= 0) slots[above] = carry;
    }
    return slots;
  }

  // blankIndex 는 그 수의 왼쪽부터 센 자리. -1 이면 빈칸 없음.
  function digitRow(value, width, options) {
    const opts = options || {};
    const row = node('div', 'vertical-row' + (opts.cls ? ' ' + opts.cls : ''));
    row.append(node('span', 'vertical-sign', opts.sign || ''));
    const raw = String(value);
    const at = opts.blankIndex >= 0 ? width - raw.length + opts.blankIndex : -1;
    const chars = padLeft(raw, width).split('');
    chars.forEach((char, index) => {
      if (index === at && !opts.answer) row.append(node('span', 'vertical-digit g011-blank', '\u00a0'));
      else if (index === at) row.append(node('span', 'vertical-digit g011-blank', char));
      else if (char === ' ') row.append(node('span', 'vertical-digit', '\u00a0'));
      else row.append(node('span', 'vertical-digit', char));
    });
    return row;
  }

  // \ubb38\uc81c\uc9c0(\ud559\uc0dd\uc6a9)\uc5d0\uc11c\ub294 \ub2f5 \uc904\uc744 \ube44\uc6b4\ub2e4. \ucc44\uc6b0\ub294 \uacbd\uc6b0\ub294 \uc14b\ubfd0\uc774\ub2e4.
  //   \u2460 \uc815\ub2f5\uc9c0(answer === true)
  //   \u2461 \ube48\uce78 \uc720\ud615(t3) \u2014 \ud569\uc744 \ubcf4\uace0 \ube48 \uc790\ub9ac\ub97c \ucc3e\ub294 \ud65c\ub3d9\uc774\ub77c \ud569\uc744 \uc778\uc1c4\ud55c\ub2e4
  //   \u2462 \uace0\uce58\uae30(t4)\uc758 '\ud2c0\ub9b0 \ud480\uc774' \u2014 \ud2c0\ub9b0 \uacb0\uacfc\uae4c\uc9c0 \ubcf4\uc5ec \uc8fc\ub294 \uac83\uc774 \ud65c\ub3d9\uc774\ub2e4(keepResult)
  function resultFilled(item, answer, config) {
    return answer === true || !!(item && item.blank) || config.keepResult === true;
  }

  function stackOf(item, answer, config) {
    const width = config.width || 2;
    const values = [item.a, item.b].concat(item.c == null ? [] : [item.c]);
    const stack = node('div', 'vertical');
    if (config.carry) {
      const slots = carriesOf(values, width);
      const row = node('div', 'vertical-row carry-row');
      row.append(node('span', 'vertical-sign'));
      slots.forEach((value, index) => {
        // \uc77c\uc758 \uc790\ub9ac \uc704 \uce78\uc5d0\ub294 \ubc1b\uc544\uc62c\ub9bc\uc774 \uc0dd\uae30\uc9c0 \uc54a\ub294\ub2e4(\ubc1b\uc544\uc62c\ub9bc\uc740 \uadf8 \uc790\ub9ac\uc5d0\uc11c \uc704\ub85c \uc62c\ub77c\uac04\ub2e4).
        // \uc790\ub9ac \ub9de\ucda4\uc744 \uc704\ud574 \uce78\uc740 \ub0a8\uae30\ub418 \uc0c1\uc790\ub294 \uc624\ub978\ucabd\uc5d0\uc11c \ub450 \ubc88\uc9f8\uae4c\uc9c0\ub9cc \uadf8\ub9b0\ub2e4.
        const cls = index === slots.length - 1 ? 'vertical-digit g011-nocarry' : 'vertical-digit';
        row.append(node('span', cls, answer && value ? String(value) : '\u00a0'));
      });
      stack.append(row);
    }
    const blank = item.blank || null;
    const rows = [['a', item.a, ''], ['b', item.b, item.c == null ? (item.op || '+') : '']];
    if (item.c != null) rows.push(['c', item.c, '+']);
    rows.forEach(([key, value, sign]) => stack.append(digitRow(value, width, {
      sign,
      answer,
      blankIndex: blank && blank.row === key ? blank.index : -1
    })));
    stack.append(digitRow(resultFilled(item, answer, config) ? item.answer : '', width, {
      answer,
      // 빈칸 유형(t3)은 합을 문제지에 인쇄하므로 정답지에서도 검은색이어야 한다(아래 CSS 가 인쇄된 자리 글자를 검정으로 되돌린다).
      cls: 'vertical-rule vertical-result' + (item.blank ? ' g011-printed' : ''),
      blankIndex: blank && blank.row === 'sum' ? blank.index : -1
    }));
    return stack;
  }

  function renderVertical(cell, item, answer, config) {
    installCss();
    if (config.gen && config.gen.concept === '0-1-1-4') cell.classList.add('g011-compact');
    const wrap = node('div', 'g011-center');
    wrap.append(stackOf(item, answer, config));
    cell.append(wrap);
  }

  // 가로셈 — 기존 'horizontal' 과 같은 class 로 같은 모양을 그리되 칸 가운데에 놓는다.
  // 문항이 적어 칸이 넓은 유형에서 문제 아래 빈 공간이 커지지 않게 하려는 것(layout-rules §5).
  function renderHorizontal(cell, item, answer, config) {
    installCss();
    const wrap = node('div', 'g011-center');
    const line = node('div', 'horizontal');
    const parts = [item.a, item.b].concat(item.c == null ? [] : [item.c]);
    line.append(node('span', '', parts.join(' + ') + ' = '));
    line.append(node('span', 'answer-space', answer ? String(item.answer) : '\u00a0'));
    wrap.append(line);
    cell.append(wrap);
  }

  // 틀린 풀이 옆에 바르게 고쳐 쓰는 빈 세로셈
  function renderCorrection(cell, item, answer, config) {
    installCss();
    const wrap = node('div', 'g011-center');
    const row = node('div', 'g011-fix');
    const wrong = node('div', 'g011-wrong');
    // 틀린 풀이는 문제지에서도 틀린 결과까지 그대로 보여 준다(고칠 곳을 찾는 활동).
    wrong.append(stackOf({ a: item.a, b: item.b, c: item.c, op: item.op, answer: item.wrong }, false,
      { width: config.width, carry: false, keepResult: true }));
    if (answer) wrong.classList.add('g011-mark');
    row.append(wrong, node('div', 'g011-arrow', '→'));
    const redo = node('div', 'g011-redo');
    redo.style.width = ((config.width || 2) * 1.12 + 1.1).toFixed(2) + 'em';
    const lines = (config.carry ? 1 : 0) + (item.c == null ? 2 : 3) + 1;
    redo.style.height = (lines * 1.3).toFixed(2) + 'em';
    if (answer) redo.append(stackOf(item, true, config));
    row.append(redo);
    wrap.append(row);
    cell.append(wrap);
  }

  /* ================= 7. 유형 등록 ================= */

  const FORMATS = {
    horizontal: 'g011-horizontal',
    vertical: 'g011-vertical',
    correction: 'g011-vertical-correction'
  };

  const TYPES = [
    { key: 't1', title: '가로셈으로 계산하기', label: '가로셈', format: FORMATS.horizontal, mode: 'calc', instruction: '계산하여 답을 쓰세요.' },
    { key: 't2', title: '세로셈으로 계산하기', label: '세로셈', format: FORMATS.vertical, mode: 'calc', instruction: '계산하여 답을 쓰세요.' },
    { key: 't3', title: '세로 풀이의 빈칸 채우기', label: '빈칸', format: FORMATS.vertical, mode: 'blank', instruction: '빈칸에 알맞은 수를 써넣으세요.' },
    { key: 't4', title: '잘못된 계산 과정 고치기', label: '고치기', format: FORMATS.correction, mode: 'fix', instruction: '잘못된 곳을 찾아 바르게 고쳐 쓰세요.' }
  ];

  // workLines: sheet.js 가 칸 높이 하한을 (workLines × 4.7 + 4)mm 로 잡는다.
  //   세로셈은 '받아올림칸 + 두 수 + 답', 고치기는 '틀린 풀이 + 설명 한 줄'이
  //   들어갈 만큼 잡아야 자동 맞춤이 줄을 늘리다 내용을 잘라 내지 않는다.
  const WORKLINES = {
    '0-1-1-0': { t2: 5, t3: 5, t4: 6 },
    '0-1-1-1': { t2: 6, t3: 6, t4: 7 },
    '0-1-1-2': { t2: 5, t3: 5, t4: 6 },
    '0-1-1-3': { t2: 6, t3: 6, t4: 7 },
    // 세 수 덧셈은 전용 압축 세로셈으로 8줄(48문항)을 한 장에 배치한다.
    '0-1-1-4': { t2: 6, t3: 6, t4: 9 }
  };

  // 사용자 결정(2026-10-02): 서로 다른 문제 수(풀)보다 문항 수를 많게 하지 않는다 — 풀이 모자라는 개념은 문항 수를 풀 크기에 맞춰 줄인다.
  const GRIDS = {
    '0-1-1-0': { t1: [4, 9], t2: [6, 6], t3: [6, 6], t4: [3, 4] },       // 풀 36
    '0-1-1-1': { t1: [3, 5], t2: [3, 5], t3: [3, 5], t4: [3, 3] },       // 풀 9
    '0-1-1-2': { t1: [3, 6], t2: [3, 6], t3: [3, 6], t4: [3, 3] },       // 풀 18(10+낱개, 낱개+10)
    '0-1-1-3': { t1: [4, 9], t2: [6, 6], t3: [6, 6], t4: [3, 4] },       // 풀 36
    '0-1-1-4': { t1: [2, 15], t2: [6, 5], t3: [6, 5], t4: [3, 4] }
  };


  // 유형별 글자 크기(pt). 칸이 커서 아래가 비는 유형은 글자를 키워 채운다(2026-10-02 1차 수정).
  const FONTS = {
    '0-1-1-0': { t1: 20, t2: 22, t3: 22, t4: 28 },
    '0-1-1-1': { t1: 34, t2: 36, t3: 36, t4: 20 },   // 9문제라 글자를 크게
    '0-1-1-2': { t1: 32, t2: 28, t3: 28, t4: 20 },
    '0-1-1-3': { t1: 20, t2: 20, t3: 20, t4: 20 },
    '0-1-1-4': { t1: 20, t2: 19, t3: 19, t4: 18 }
  };

  function configOf(concept, type) {
    const grid = GRIDS[concept.id][type.key];
    return {
      typeId: concept.id + '-' + type.key,
      title: type.label + ' · ' + concept.short,
      instruction: type.instruction,
      format: type.format,
      cols: grid[0], rows: grid[1], count: grid[0] * grid[1],
      fontPt: (FONTS[concept.id] && FONTS[concept.id][type.key]) || concept.font, seed: 20261001,
      maxProblems: Math.min(40, grid[0] * grid[1]),
      width: concept.width, carry: concept.carry,
      workLines: WORKLINES[concept.id][type.key],
      autoFit: concept.id === '0-1-1-4' ? false : !(type.key !== 't4' || concept.id === '0-1-1-1' || concept.id === '0-1-1-2'),   // 세 수 덧셈은 정한 문항 수(30)로 고정
      gen: { concept: concept.id, mode: type.mode }
    };
  }

  const typeIds = [];
  for (const concept of CONCEPTS) {
    for (const type of TYPES) {
      typeIds.push(concept.id + '-' + type.key);
      if (Array.isArray(root.SheetCatalog)) root.SheetCatalog.push(configOf(concept, type));
    }
  }

  function installFormats() {
    if (!root.Sheet || typeof root.Sheet.register !== 'function') return false;
    root.Sheet.register(FORMATS.horizontal, renderHorizontal);
    root.Sheet.register(FORMATS.vertical, renderVertical);
    root.Sheet.register(FORMATS.correction, renderCorrection);
    return true;
  }

  function installGenerator() {
    const base = root.SheetGen;
    if (!base || typeof base.generate !== 'function' || base.g011Wrapped) return false;
    const original = base.generate;
    base.generate = function (config) {
      if (config && config.gen && BY_ID[config.gen.concept]) return generate(config);
      return original.apply(this, arguments);
    };
    base.g011Wrapped = true;
    return true;
  }

  if (!installFormats()) document.addEventListener('DOMContentLoaded', installFormats, { once: true });
  if (!installGenerator()) document.addEventListener('DOMContentLoaded', installGenerator, { once: true });

  /* ================= 8. 스스로 검사 ================= */

  function selfTest(options) {
    const seeds = (options && options.seeds) || [1, 7, 42];
    const report = { sheets: 0, items: 0, problems: [] };
    const fail = message => { report.problems.push(message); };
    for (const concept of CONCEPTS) {
      for (const type of TYPES) {
        const config = configOf(concept, type);
        for (const seed of seeds) {
          let items;
          try {
            items = generate({ ...config, seed });
          } catch (error) {
            fail(config.typeId + ' seed ' + seed + ': ' + error.message);
            continue;
          }
          report.sheets += 1;
          report.items += items.length;
          const seen = new Set(), problems = new Set();
          for (const item of items) {
            const key = [item.a, item.b, item.c, item.blank && item.blank.row + item.blank.index, item.kind].join(':');
            if (seen.has(key) && (concept.id === '0-1-1-4' || type.key === 't4' && (concept.id === '0-1-1-0' || concept.id === '0-1-1-3'))) fail(config.typeId + ' seed ' + seed + ': 같은 문항이 두 번 나왔습니다(' + key + ')');
            seen.add(key);
            // 한 장에 같은 문제(식)가 두 번 나오면 안 된다(2026-10-01 검수 B·D 지적).
            const problem = [item.a, item.b, item.c].join(':');
            if (problems.has(problem) && (concept.id === '0-1-1-4' || type.key === 't4' && (concept.id === '0-1-1-0' || concept.id === '0-1-1-3'))) fail(config.typeId + ' seed ' + seed + ': 같은 문제가 두 번 나왔습니다(' + problem + ')');
            problems.add(problem);
            const expect = Number(item.a) + Number(item.b) + (item.c == null ? 0 : Number(item.c));
            if (!Number.isFinite(Number(item.answer)) || Number(item.answer) !== expect) fail(config.typeId + ' seed ' + seed + ': 정답이 틀렸습니다(' + key + ')');
            if (!concept.test(item.a, item.b, item.c)) fail(config.typeId + ' seed ' + seed + ': 개념 조건을 벗어난 문항(' + key + ')');
            if (item.wrong != null && Number(item.wrong) === Number(item.answer)) fail(config.typeId + ' seed ' + seed + ': 틀린 풀이가 바른 값(' + key + ')');
          }
        }
      }
    }
    if (report.problems.length) throw Error('묶음 0-1-1 자체 검사 실패: ' + report.problems.slice(0, 6).join(' / '));
    return report;
  }

  root.G011Sheet = {
    concepts: CONCEPTS, types: TYPES, typeIds, grids: GRIDS, pool: POOL,
    generate, wholePool, selfTest, formats: FORMATS
  };
})(globalThis);
