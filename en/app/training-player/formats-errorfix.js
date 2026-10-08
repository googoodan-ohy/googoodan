/* 잘못된 계산 과정 고치기 — 문제지 서식 (formats-errorfix.js)

   종이에 인쇄해 푸는 연산 문제지. 한 장 = 3단 × 4줄 = 12문항.
   왼쪽에 '실제로 흔한 오류가 들어간 풀이'를 보여 주고, 오른쪽 빈 칸에 바르게 고쳐 쓴다.
   정답지는 같은 배치에 틀린 곳 표시 + 바른 풀이를 채운다.

   - 문제와 바른 답은 사이트의 기존 생성기(Worksheets.generate)에서 가져온다.
     이 파일은 그 위에 '오류가 들어간 풀이'만 만들어 얹는다. 새 문제 엔진이 아니다.
   - 오류가 들어간 결과는 바른 결과와 반드시 다르다. 문항마다 검사한다.
     ('약분하지 않음'처럼 값은 같고 적은 형태가 틀린 경우는 형태가 달라야 한다.)
   - 같은 유형 · 같은 seed → 같은 문제지.

   유형 설정(sheet/sheet.js 인터페이스):
     {typeId, title, instruction, format, cols:3, rows:4, count:12, fontPt:11, seed,
      gen:{topic:'add'|'sub'|'mul'|'div'|'fraction'|'decimal', errorKinds:[...], source}}
   오류 이름은 한국어 이름('올림을 빠뜨림')과 내부 키('mul-carry-lost') 둘 다 받는다.
*/
(function (root) {
  'use strict';

  /* ================= 1. 기본 도구 ================= */

  const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a) || 1);
  const lcm = (a, b) => (a / gcd(a, b)) * b;
  const pad = (value, width) => String(value).padStart(width, ' ');
  const revDigits = value => String(value).split('').reverse().map(Number);

  function rng(seed) {
    let s = (Number(seed) >>> 0) || 1;
    return (lo, hi) => {
      s += 0x6d2b79f5;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return lo + Math.floor((((t ^ (t >>> 14)) >>> 0) / 4294967296) * (hi - lo + 1));
    };
  }

  // 받아올림/받아내림 횟수 (sheet/gen-bridge.js 와 같은 규칙)
  function carryCount(a, b, op) {
    let incoming = 0, count = 0, run = 0, longest = 0;
    while (a || b) {
      const x = a % 10, y = b % 10;
      incoming = op === '+' ? Number(x + y + incoming >= 10) : Number(x - incoming < y);
      count += incoming;
      run = incoming ? run + 1 : 0;
      longest = Math.max(longest, run);
      a = Math.floor(a / 10); b = Math.floor(b / 10);
    }
    return { count, longest };
  }

  /* ================= 2. 유리수와 소수 ================= */

  const R = {
    make(n, d) { const g = gcd(n, d); return [n / g, d / g]; },
    eq(x, y) { return x[0] * y[1] === y[0] * x[1]; },
    sub(x, y) { return R.make(x[0] * y[1] - y[0] * x[1], x[1] * y[1]); },
    mul(x, y) { return R.make(x[0] * y[0], x[1] * y[1]); },
    div(x, y) { return R.make(x[0] * y[1], x[1] * y[0]); },
    mixed(w, n, d) { return R.make(w * d + n, d); },
    display(x) { return `${x[0]}/${x[1]}`; },          // 약분 전 형태 그대로 (2/4 등)
    plain(x) { return x[1] === 1 ? String(x[0]) : `${x[0]}/${x[1]}`; },
    text(x, mixed) {
      const [n, d] = x;
      if (d === 1) return String(n);
      if (mixed && Math.abs(n) > d) {
        const w = Math.trunc(n / d), r = Math.abs(n % d);
        return r ? `${w} ${r}/${d}` : String(w);
      }
      return `${n}/${d}`;
    }
  };

  function fracParts(text) {
    const s = String(text).trim();
    const mixed = s.match(/^(\d+)\s+(\d+)\/(\d+)$/);
    if (mixed) return { whole: +mixed[1], n: +mixed[2], d: +mixed[3] };
    const plain = s.match(/^(\d+)\/(\d+)$/);
    if (plain) return { whole: 0, n: +plain[1], d: +plain[2] };
    return { whole: +s, n: 0, d: 1 };
  }
  const fracValue = text => {
    const p = fracParts(text);
    return R.mixed(p.whole, p.n, p.d);
  };

  // "12.4" → {int:124, places:1, scale:10}
  function decParts(text) {
    const s = String(text).trim();
    const m = s.match(/^(\d+)\.(\d+)$/);
    if (m) return { int: Number(m[1] + m[2]), places: m[2].length, scale: 10 ** m[2].length };
    return { int: Number(s), places: 0, scale: 1 };
  }
  function decStr(value, scale) {
    const places = String(scale).length - 1;
    if (!places) return String(value);
    const text = String(Math.abs(value)).padStart(places + 1, '0');
    const shown = (text.slice(0, -places) + '.' + text.slice(-places)).replace(/0+$/, '').replace(/\.$/, '');
    return (value < 0 ? '-' : '') + shown;
  }
  // 기존 생성기의 정답 문자열 → 유리수 ("3/2", "16.15", "42")
  function answerValue(text) {
    const s = String(text).trim();
    if (s.includes('R')) return null;
    if (s.includes('/')) return fracValue(s);
    const m = s.match(/^(\d+)\.(\d+)$/);
    if (m) return R.make(Number(m[1] + m[2]), 10 ** m[2].length);
    return R.make(Number(s), 1);
  }

  /* ================= 3. 자리별 계산 (오류 포함) ================= */

  // 덧셈: 'plain' 바른 계산, 'lost' 받아올림 빠뜨림, 'double' 받아올림을 두 번 더함
  function addColumns(a, b, mode) {
    let x = a, y = b, mul = 1, value = 0, col = 0, carry = 0, doubled = false;
    const carries = {};
    while (x || y || carry) {
      const dx = x % 10, dy = y % 10;
      if (mode === 'lost') {
        value += ((dx + dy) % 10) * mul;
        carry = 0;
      } else {
        let sum = dx + dy + carry;
        if (mode === 'double' && carry && !doubled && sum + carry <= 9) {
          sum += carry;                                    // 받아올림한 1을 한 번 더
          doubled = true;
        }
        value += (sum % 10) * mul;
        carry = Math.floor(sum / 10);
        if (carry) carries[col + 1] = String(carry);
      }
      col += 1;
      mul *= 10;
      x = Math.floor(x / 10); y = Math.floor(y / 10);
    }
    return { value, carries, doubled };
  }

  // 뺄셈: 'plain' 바른 계산, 'no-reduce' 받아내림 후 윗자리를 줄이지 않음,
  //       'zero-ten' 0을 지날 때 0을 9로 바꾸지 않고 10으로 둠
  function subColumns(a, b, mode) {
    const da = revDigits(a), db = revDigits(b);
    const cur = da.slice();
    const borrows = [], top = {};
    let value = 0, crossed = false;
    for (let i = 0; i < da.length; i++) {
      const y = db[i] || 0;
      let x = cur[i];
      if (x < y) {
        let j = i + 1;
        while (j < da.length && cur[j] === 0) j++;
        if (j >= da.length) return null;
        if (mode !== 'no-reduce') { cur[j] -= 1; top[j] = String(cur[j]); }
        for (let k = j - 1; k > i; k--) {
          if (cur[k] === 0 && mode === 'zero-ten') { cur[k] = 10; crossed = true; }
          else cur[k] = 9;
        }
        borrows.push(i);
        x = cur[i] + 10;
        cur[i] = x;
      }
      value += (x - y) * 10 ** i;
    }
    return { value, borrows, top, crossed };
  }

  // 각 자리에서 큰 수 − 작은 수
  function subReversed(a, b) {
    const da = revDigits(a), db = revDigits(b);
    let value = 0;
    for (let i = 0; i < da.length; i++) value += Math.abs(da[i] - (db[i] || 0)) * 10 ** i;
    return value;
  }

  // 곱셈: dropCarry = 올림을 다음 자리에 더하지 않음, product = 특정 자리 곱을 잘못 씀
  function mulColumns(a, b, opts) {
    const options = opts || {};
    const ds = revDigits(a);
    let carry = 0, value = 0, mul = 1;
    ds.forEach((d, i) => {
      const plain = options.product && options.product[i] != null ? options.product[i] : d * b;
      if (options.dropCarry) {
        if (i === ds.length - 1) value += plain * mul;      // 가장 높은 자리는 그대로 씀
        else value += (plain % 10) * mul;
      } else {
        const sum = plain + carry;
        value += (sum % 10) * mul;
        carry = Math.floor(sum / 10);
      }
      mul *= 10;
    });
    if (!options.dropCarry) value += carry * mul;
    return value;
  }

  // 긴 나눗셈: 몫 자리 · 곱 · 나머지
  function longDivision(dividend, divisor) {
    const ds = String(dividend).split('').map(Number);
    const steps = [];
    let rem = 0, started = false;
    for (let i = 0; i < ds.length; i++) {
      const cur = rem * 10 + ds[i];
      const q = Math.floor(cur / divisor);
      if (!started && q === 0) { rem = cur; continue; }
      started = true;
      const prod = q * divisor;
      steps.push({ i, cur, q, prod, rem: cur - prod });
      rem = cur - prod;
    }
    return { digits: ds, steps, remainder: rem, quotient: steps.map(s => s.q).join('') };
  }

  /* ================= 4. 문제지 줄 ================= */

  const vline = (rows, opts) => ({ t: 'v', rows, align: (opts && opts.align) || 'point', carry: (opts && opts.carry) || null });
  const tline = text => ({ t: 'text', s: text });
  const fracText = (n, d) => `[${n}/${d}]`;
  const mixedText = (w, n, d) => `[${w} ${n}/${d}]`;
  // 가분수는 대분수로 보여 준다 (값은 그대로)
  function koreanMixed(value) {
    const [n, d] = value;
    if (d === 1 || Math.abs(n) < d) return fracText(n, d);
    const whole = Math.trunc(n / d), rest = Math.abs(n % d);
    return rest ? mixedText(whole, rest, d) : String(whole);
  }

  function diffMarks(right, wrong) {
    const out = [];
    const size = Math.max(right.length, wrong.length);
    for (let i = 0; i < size; i++) if ((right[i] || ' ') !== (wrong[i] || ' ')) out.push(i);
    return out;
  }

  // 긴 나눗셈 줄. opts: shift 몫을 한 자리 왼쪽으로, keep 단계 수,
  //       openRemainder 마지막 나머지로 내려 쓴 수, dropZeroAt 몫의 0을 빠뜨린 단계
  function longDivisionLine(info, divisor, opts) {
    const options = opts || {};
    const divWidth = String(divisor).length;
    const base = divWidth + 1;
    const slots = base + info.digits.length;
    const steps = info.steps.slice(0, options.keep == null ? info.steps.length : options.keep);
    const rows = [], marks = [];
    const shift = options.shift ? -1 : 0;

    const quotientRow = { cells: [] };
    steps.forEach(step => {
      if (options.dropZeroAt === step.i) return;
      quotientRow.cells.push({ at: base + step.i + shift, ch: String(step.q) });
    });
    if (options.dropZeroAt != null) {
      const at = base + options.dropZeroAt + shift;
      quotientRow.cells.push({ at, ch: '', blank: true });
      marks.push({ row: 0, at });
    }
    if (options.blankQuotientAt != null) {
      const at = base + options.blankQuotientAt + shift;
      quotientRow.cells.push({ at, ch: '', blank: true });
      marks.push({ row: 0, at });
    }
    if (options.markQuotient) quotientRow.cells.forEach(cell => marks.push({ row: 0, at: cell.at }));
    rows.push(quotientRow);

    const head = { cells: [{ at: 0, ch: String(divisor) }, { at: divWidth, ch: '│' }] };
    info.digits.forEach((d, i) => head.cells.push({ at: base + i, ch: String(d) }));
    rows.push(head);

    steps.forEach((step, index) => {
      const last = index === steps.length - 1;
      const end = base + step.i + shift;
      const product = String(step.prod);
      const productRow = { cells: [] };
      for (let k = 0; k < product.length; k++) productRow.cells.push({ at: end - (product.length - 1 - k), ch: product[k] });
      rows.push(productRow);

      const shown = last && options.openRemainder != null ? String(options.openRemainder) : String(step.rem);
      const start = Math.max(0, end - Math.max(String(step.cur).length, shown.length) + 1);
      const remRow = { cells: [], rule: [start, end] };
      const rowIndex = rows.length;
      for (let k = 0; k < shown.length; k++) {
        const at = end - (shown.length - 1 - k);
        remRow.cells.push({ at, ch: shown[k] });
        if (last && (options.openRemainder != null || options.markRemainder)) marks.push({ row: rowIndex, at });
      }
      rows.push(remRow);
    });

    return { t: 'ld', slots, rows, marks, divisor };
  }

  /* ================= 5. 오류 유형 ================= */

  const KINDS = {
    /* ---------- 자연수 덧셈 ---------- */
    'add-carry-lost': {
      topic: 'add', label: '받아올림 빠뜨림', note: '받아올림한 1을 더하지 않음',
      source: 'natural-add-2-2',
      need: q => carryCount(Number(q.a), Number(q.b), '+').count >= 1,
      build(q) {
        const a = Number(q.a), b = Number(q.b);
        const right = addColumns(a, b, 'plain');
        const wrong = addColumns(a, b, 'lost');
        if (wrong.value === right.value) return null;
        const width = String(Math.max(a, b, right.value, wrong.value)).length;
        const marks = diffMarks(pad(right.value, width), pad(wrong.value, width));
        const stack = rows => vline(rows, { carry: right.carries });
        return item({
          key: `${a}+lost:${b}`, kind: 'add-carry-lost', rank: a + b, prompt: `${a} + ${b}`,
          wrong: { text: String(wrong.value), value: [wrong.value, 1], lines: [stack([{ text: pad(a, width) }, { text: pad(b, width), sign: '+' }, { text: pad(wrong.value, width), rule: true, marks }])] },
          right: { text: String(right.value), value: [right.value, 1], lines: [stack([{ text: pad(a, width) }, { text: pad(b, width), sign: '+' }, { text: pad(right.value, width), rule: true }])] },
          work: { type: 'v', slots: width, rows: 3 }
        });
      }
    },
    'add-carry-doubled': {
      topic: 'add', label: '받아올림 두 번 더함', note: '받아올림한 1을 두 번 더함',
      source: 'natural-add-2-2',
      need: q => carryCount(Number(q.a), Number(q.b), '+').count >= 1,
      build(q) {
        const a = Number(q.a), b = Number(q.b);
        const right = addColumns(a, b, 'plain');
        const wrong = addColumns(a, b, 'double');
        if (!wrong.doubled || wrong.value === right.value) return null;
        const width = String(Math.max(a, b, right.value, wrong.value)).length;
        const marks = diffMarks(pad(right.value, width), pad(wrong.value, width));
        return item({
          key: `${a}+twice:${b}`, kind: 'add-carry-doubled', rank: a + b, prompt: `${a} + ${b}`,
          wrong: { text: String(wrong.value), value: [wrong.value, 1], lines: [vline([{ text: pad(a, width) }, { text: pad(b, width), sign: '+' }, { text: pad(wrong.value, width), rule: true, marks }], { carry: right.carries })] },
          right: { text: String(right.value), value: [right.value, 1], lines: [vline([{ text: pad(a, width) }, { text: pad(b, width), sign: '+' }, { text: pad(right.value, width), rule: true }], { carry: right.carries })] },
          work: { type: 'v', slots: width, rows: 3 }
        });
      }
    },
    'add-place-shift': {
      topic: 'add', label: '자리 어긋남', note: '한 자리 옮겨 써서 어긋남',
      source: 'natural-add-2-2',
      need: q => Number(q.b) >= 1,
      build(q) {
        const a = Number(q.a), b = Number(q.b);
        const right = a + b, wrong = a + b * 10;
        const width = String(Math.max(right, wrong)).length;
        const shifted = String(b) + ' ';                     // 오른쪽(일의 자리)을 비운 채 어긋나게
        return item({
          key: `${a}+shift:${b}`, kind: 'add-place-shift', rank: a + b, prompt: `${a} + ${b}`,
          wrong: { text: String(wrong), value: [wrong, 1], lines: [vline([{ text: pad(a, width) }, { text: pad(shifted, width), sign: '+', marks: [width - 1] }, { text: pad(wrong, width), rule: true, marks: diffMarks(pad(right, width), pad(wrong, width)) }])] },
          right: { text: String(right), value: [right, 1], lines: [vline([{ text: pad(a, width) }, { text: pad(b, width), sign: '+' }, { text: pad(right, width), rule: true }])] },
          work: { type: 'v', slots: width, rows: 3 }
        });
      }
    },

    /* ---------- 자연수 뺄셈 ---------- */
    'sub-reversed': {
      topic: 'sub', label: '거꾸로 뺌', note: '큰 수에서 작은 수를 뺌',
      source: 'natural-sub-2-2',
      need: q => carryCount(Number(q.a), Number(q.b), '−').count >= 1,
      build(q) {
        const a = Number(q.a), b = Number(q.b);
        const right = subColumns(a, b, 'plain');
        const wrong = subReversed(a, b);
        if (!right || wrong === right.value) return null;
        const width = String(Math.max(a, b, right.value, wrong)).length;
        const marks = diffMarks(pad(right.value, width), pad(wrong, width));
        return item({
          key: `${a}−rev:${b}`, kind: 'sub-reversed', rank: a + b, prompt: `${a} − ${b}`,
          wrong: { text: String(wrong), value: [wrong, 1], lines: [vline([{ text: pad(a, width) }, { text: pad(b, width), sign: '−' }, { text: pad(wrong, width), rule: true, marks }])] },
          right: { text: String(right.value), value: [right.value, 1], lines: [vline([{ text: pad(a, width) }, { text: pad(b, width), sign: '−' }, { text: pad(right.value, width), rule: true }], { carry: right.top })] },
          work: { type: 'v', slots: width, rows: 3 }
        });
      }
    },
    'sub-borrow-no-reduce': {
      topic: 'sub', label: '윗자리 안 줄임', note: '받아내림 후 윗자리 안 줄임',
      source: 'natural-sub-2-2',
      need: q => carryCount(Number(q.a), Number(q.b), '−').count >= 1,
      build(q) {
        const a = Number(q.a), b = Number(q.b);
        const right = subColumns(a, b, 'plain');
        const wrong = subColumns(a, b, 'no-reduce');
        if (!right || !wrong || wrong.value === right.value) return null;
        const width = String(Math.max(a, b, right.value, wrong.value)).length;
        const marks = diffMarks(pad(right.value, width), pad(wrong.value, width));
        return item({
          key: `${a}−nodec:${b}`, kind: 'sub-borrow-no-reduce', rank: a + b, prompt: `${a} − ${b}`,
          wrong: { text: String(wrong.value), value: [wrong.value, 1], lines: [vline([{ text: pad(a, width) }, { text: pad(b, width), sign: '−' }, { text: pad(wrong.value, width), rule: true, marks }])] },
          right: { text: String(right.value), value: [right.value, 1], lines: [vline([{ text: pad(a, width) }, { text: pad(b, width), sign: '−' }, { text: pad(right.value, width), rule: true }], { carry: right.top })] },
          work: { type: 'v', slots: width, rows: 3 }
        });
      }
    },
    'sub-across-zero': {
      topic: 'sub', label: '0 건너 받아내림 오류', note: '0을 지날 때 10을 그대로 씀',
      source: 'natural-sub-3-2',
      need: q => String(q.a).slice(1).includes('0') && carryCount(Number(q.a), Number(q.b), '−').count >= 1,
      build(q) {
        const a = Number(q.a), b = Number(q.b);
        const right = subColumns(a, b, 'plain');
        const wrong = subColumns(a, b, 'zero-ten');
        if (!right || !wrong || !wrong.crossed || wrong.value === right.value) return null;
        const width = String(Math.max(a, b, right.value, wrong.value)).length;
        const marks = diffMarks(pad(right.value, width), pad(wrong.value, width));
        return item({
          key: `${a}−zero:${b}`, kind: 'sub-across-zero', rank: a + b, prompt: `${a} − ${b}`,
          wrong: { text: String(wrong.value), value: [wrong.value, 1], lines: [vline([{ text: pad(a, width) }, { text: pad(b, width), sign: '−' }, { text: pad(wrong.value, width), rule: true, marks }])] },
          right: { text: String(right.value), value: [right.value, 1], lines: [vline([{ text: pad(a, width) }, { text: pad(b, width), sign: '−' }, { text: pad(right.value, width), rule: true }], { carry: right.top })] },
          work: { type: 'v', slots: width, rows: 3 }
        });
      }
    },

    /* ---------- 자연수 곱셈 ---------- */
    'mul-carry-lost': {
      topic: 'mul', label: '올림 빠뜨림', note: '올림한 수를 더하지 않음',
      source: 'natural-mul-2-1',
      need: q => Number(q.b) >= 2 && Number(q.a) >= 12,
      build(q) {
        const a = Number(q.a), b = Number(q.b);
        const right = mulColumns(a, b);
        const wrong = mulColumns(a, b, { dropCarry: true });
        if (wrong === right) return null;
        const width = String(Math.max(a, b, right, wrong)).length;
        const marks = diffMarks(pad(right, width), pad(wrong, width));
        return item({
          key: `${a}×lost:${b}`, kind: 'mul-carry-lost', rank: a * b, prompt: `${a} × ${b}`,
          wrong: { text: String(wrong), value: [wrong, 1], lines: [vline([{ text: pad(a, width) }, { text: pad(b, width), sign: '×' }, { text: pad(wrong, width), rule: true, marks }])] },
          right: { text: String(right), value: [right, 1], lines: [vline([{ text: pad(a, width) }, { text: pad(b, width), sign: '×' }, { text: pad(right, width), rule: true }])] },
          work: { type: 'v', slots: width, rows: 3 }
        });
      }
    },
    'mul-partial-shift': {
      topic: 'mul', label: '부분곱 자리 어긋남', note: '부분곱을 한 자리 밀지 않음',
      source: 'natural-mul-2-2',
      need: q => Number(q.a) >= 11 && Number(q.b) >= 12,
      build(q) {
        const a = Number(q.a), b = Number(q.b);
        const first = a * (b % 10), second = a * Math.floor(b / 10);
        const right = first + second * 10;
        const wrong = first + second;
        if (wrong === right) return null;
        const width = String(Math.max(a, b, right, wrong, first, second)).length + 1;
        const wrongSecond = pad(second, width - 1);
        return item({
          key: `${a}×shift:${b}`, kind: 'mul-partial-shift', rank: a * b, prompt: `${a} × ${b}`,
          wrong: {
            text: String(wrong), value: [wrong, 1],
            lines: [vline([
              { text: pad(a, width) },
              { text: pad(b, width), sign: '×' },
              { text: pad(first, width), rule: true },
              { text: pad(wrongSecond, width), marks: [width - 1] },
              { text: pad(wrong, width), rule: true, marks: diffMarks(pad(right, width), pad(wrong, width)) }
            ])]
          },
          right: {
            text: String(right), value: [right, 1],
            lines: [vline([
              { text: pad(a, width) },
              { text: pad(b, width), sign: '×' },
              { text: pad(first, width), rule: true },
              { text: pad(second * 10, width) },
              { text: pad(right, width), rule: true }
            ])]
          },
          work: { type: 'v', slots: width, rows: 5 }
        });
      }
    },
    'mul-table-slip': {
      topic: 'mul', label: '구구 오류', note: '구구단 곱을 잘못 외움',
      source: 'natural-mul-2-1',
      need: q => Number(q.b) >= 2 && String(q.a).length >= 2,
      build(q, r) {
        const a = Number(q.a), b = Number(q.b);
        const right = mulColumns(a, b);
        const digits = revDigits(a);
        const at = r(0, digits.length - 1);
        const trueProduct = digits[at] * b;
        const slip = trueProduct + r(1, 2) * digits[at] * (r(0, 1) ? 1 : -1);
        if (slip <= 0 || slip === trueProduct) return null;
        const override = {};
        override[at] = slip;
        const wrong = mulColumns(a, b, { product: override });
        if (wrong === right || wrong < 0) return null;
        const width = String(Math.max(a, b, right, wrong)).length;
        const marks = diffMarks(pad(right, width), pad(wrong, width));
        return item({
          key: `${a}×table:${b}`, kind: 'mul-table-slip', rank: a * b, prompt: `${a} × ${b}`,
          wrong: { text: String(wrong), value: [wrong, 1], lines: [vline([{ text: pad(a, width) }, { text: pad(b, width), sign: '×' }, { text: pad(wrong, width), rule: true, marks }])] },
          right: { text: String(right), value: [right, 1], lines: [vline([{ text: pad(a, width) }, { text: pad(b, width), sign: '×' }, { text: pad(right, width), rule: true }])] },
          work: { type: 'v', slots: width, rows: 3 }
        });
      }
    },

    /* ---------- 자연수 나눗셈 ---------- */
    'div-quotient-place': {
      topic: 'div', label: '몫 자리 잘못', note: '몫의 첫 자리를 왼쪽에 씀',
      source: 'natural-div-3-1',
      need: q => Number(q.b) >= 2 && Number(q.a) >= 100 && Number(String(q.a)[0]) < Number(q.b),
      build(q) {
        const a = Number(q.a), b = Number(q.b);
        const info = longDivision(a, b);
        if (info.steps.length < 2) return null;
        const wrong = Number(info.quotient) * 10;
        return item({
          key: `${a}÷place:${b}`, kind: 'div-quotient-place', rank: a, prompt: `${a} ÷ ${b}`,
          wrong: { text: String(wrong), value: [wrong, 1], lines: [longDivisionLine(info, b, { shift: true, markQuotient: true })] },
          right: { text: info.quotient + (info.remainder ? ' R ' + info.remainder : ''), value: R.make(a, b), lines: [longDivisionLine(info, b)] },
          work: { type: 'ld', divisor: b, digits: String(a) }
        });
      }
    },
    'div-remainder-too-big': {
      topic: 'div', label: '나머지가 큼', note: '나머지가 나누는 수보다 큼',
      source: 'natural-div-3-1',
      need: q => Number(q.b) >= 2 && Number(q.a) >= 100,
      build(q) {
        const a = Number(q.a), b = Number(q.b);
        const info = longDivision(a, b);
        if (info.steps.length < 2) return null;
        const last = info.steps[info.steps.length - 1];
        const previous = info.steps[info.steps.length - 2];
        const opened = previous.rem * 10 + Number(String(a)[last.i]);
        if (opened < b) return null;                          // 나머지가 나누는 수보다 커야 함
        const stopped = Number(info.quotient.slice(0, -1));
        const wrongValue = R.make(stopped * b + opened, b);
        if (R.eq(wrongValue, R.make(a, b))) return null;
        return item({
          key: `${a}÷rem:${b}`, kind: 'div-remainder-too-big', rank: a, prompt: `${a} ÷ ${b}`,
          wrong: {
            text: `${stopped} R ${opened}`, value: wrongValue,
            lines: [longDivisionLine(info, b, { keep: info.steps.length - 1, openRemainder: opened, blankQuotientAt: last.i })]
          },
          right: { text: info.quotient + (info.remainder ? ' R ' + info.remainder : ''), value: R.make(a, b), lines: [longDivisionLine(info, b)] },
          work: { type: 'ld', divisor: b, digits: String(a) }
        });
      }
    },
    'div-quotient-zero': {
      topic: 'div', label: '몫의 0 빠뜨림', note: '몫 가운데 0을 빠뜨림',
      source: 'natural-div-3-1',
      need: q => Number(q.b) >= 2 && /\d0\d/.test(String(Math.floor(Number(q.a) / Number(q.b)))),
      build(q) {
        const a = Number(q.a), b = Number(q.b);
        const info = longDivision(a, b);
        const zeroIndex = info.steps.findIndex((step, index) => step.q === 0 && index > 0 && index < info.steps.length - 1);
        if (zeroIndex < 0) return null;
        const dropped = Number(info.steps.filter((step, index) => index !== zeroIndex).map(step => step.q).join(''));
        if (dropped === Number(info.quotient)) return null;
        return item({
          key: `${a}÷zero:${b}`, kind: 'div-quotient-zero', rank: a, prompt: `${a} ÷ ${b}`,
          wrong: { text: String(dropped), value: [dropped, 1], lines: [longDivisionLine(info, b, { dropZeroAt: info.steps[zeroIndex].i })] },
          right: { text: info.quotient + (info.remainder ? ' R ' + info.remainder : ''), value: R.make(a, b), lines: [longDivisionLine(info, b)] },
          work: { type: 'ld', divisor: b, digits: String(a) }
        });
      }
    },

    /* ---------- 분수 ---------- */
    'frac-add-denominators': {
      topic: 'fraction', label: '분모끼리 더함', note: '분모끼리 그냥 더함',
      source: 'fraction-add-different',
      need: q => fracParts(q.a).d !== fracParts(q.b).d,
      build(q) {
        const pa = fracParts(q.a), pb = fracParts(q.b);
        const right = R.make(pa.n * pb.d + pb.n * pa.d, pa.d * pb.d);
        const raw = [pa.n + pb.n, pa.d + pb.d];
        const wrong = R.make(raw[0], raw[1]);
        if (R.eq(wrong, right)) return null;
        const common = lcm(pa.d, pb.d);
        return item({
          key: `${q.a}+den:${q.b}`, kind: 'frac-add-denominators', rank: pa.d + pb.d, prompt: `${q.a} + ${q.b}`,
          wrong: {
            text: R.display(raw), value: wrong,
            lines: [
              tline(`${fracText(pa.n, pa.d)} + ${fracText(pb.n, pb.d)}`),
              tline(`= *${fracText(raw[0], raw[1])}*`)
            ]
          },
          right: {
            text: R.plain(right), value: right,
            lines: [
              tline(`${fracText(pa.n, pa.d)} + ${fracText(pb.n, pb.d)}`),
              tline(`= ${fracText(pa.n * common / pa.d, common)} + ${fracText(pb.n * common / pb.d, common)}`),
              tline(`= ${fracText(right[0], right[1])}`)
            ]
          },
          work: { type: 'lines', count: 3 }
        });
      }
    },
    'frac-numerator-not-changed': {
      topic: 'fraction', label: '분자 안 바꿈', note: '통분할 때 분자를 안 바꿈',
      source: 'fraction-add-different',
      need: q => fracParts(q.a).d !== fracParts(q.b).d,
      build(q) {
        const pa = fracParts(q.a), pb = fracParts(q.b);
        const right = R.make(pa.n * pb.d + pb.n * pa.d, pa.d * pb.d);
        const common = lcm(pa.d, pb.d);
        const raw = [pa.n + pb.n, common];
        const wrong = R.make(raw[0], raw[1]);
        if (R.eq(wrong, right)) return null;
        return item({
          key: `${q.a}+num:${q.b}`, kind: 'frac-numerator-not-changed', rank: pa.d + pb.d, prompt: `${q.a} + ${q.b}`,
          wrong: {
            text: R.display(raw), value: wrong,
            lines: [
              tline(`${fracText(pa.n, pa.d)} + ${fracText(pb.n, pb.d)}`),
              tline(`= *${fracText(pa.n, common)} + ${fracText(pb.n, common)}*`),
              tline(`= ${fracText(raw[0], raw[1])}`)
            ]
          },
          right: {
            text: R.plain(right), value: right,
            lines: [
              tline(`${fracText(pa.n, pa.d)} + ${fracText(pb.n, pb.d)}`),
              tline(`= ${fracText(pa.n * common / pa.d, common)} + ${fracText(pb.n * common / pb.d, common)}`),
              tline(`= ${fracText(right[0], right[1])}`)
            ]
          },
          work: { type: 'lines', count: 3 }
        });
      }
    },
    'frac-not-reduced': {
      topic: 'fraction', label: '약분 안 함', note: '답을 약분하지 않음',
      source: 'fraction-mul-different',
      need: q => {
        const pa = fracParts(q.a), pb = fracParts(q.b);
        return gcd(pa.n * pb.n, pa.d * pb.d) > 1;
      },
      build(q) {
        const pa = fracParts(q.a), pb = fracParts(q.b);
        const raw = [pa.n * pb.n, pa.d * pb.d];
        const right = R.make(raw[0], raw[1]);
        if (R.display(raw) === R.display(right)) return null;
        return item({
          key: `${q.a}×red:${q.b}`, kind: 'frac-not-reduced', rank: pa.d + pb.d, prompt: `${q.a} × ${q.b}`,
          wrong: {
            text: R.display(raw), value: right, sameValue: true,
            lines: [
              tline(`${fracText(pa.n, pa.d)} × ${fracText(pb.n, pb.d)}`),
              tline(`= *${fracText(raw[0], raw[1])}*`)
            ]
          },
          right: {
            text: R.plain(right), value: right,
            lines: [
              tline(`${fracText(pa.n, pa.d)} × ${fracText(pb.n, pb.d)}`),
              tline(`= ${fracText(raw[0], raw[1])} = ${fracText(right[0], right[1])}`)
            ]
          },
          work: { type: 'lines', count: 3 }
        });
      }
    },
    'frac-wrong-reduce': {
      topic: 'fraction', label: '약분 잘못', note: '분모를 다른 수로 나눔',
      source: 'fraction-mul-same',
      need: q => gcd(fracParts(q.a).n * fracParts(q.b).n, fracParts(q.a).d * fracParts(q.b).d) > 1,
      build(q) {
        const pa = fracParts(q.a), pb = fracParts(q.b);
        const raw = [pa.n * pb.n, pa.d * pb.d];
        const g = gcd(raw[0], raw[1]);
        const right = R.make(raw[0], raw[1]);
        let other = 0;
        for (let k = 2; k <= raw[1]; k++) if (raw[1] % k === 0 && k !== g) { other = k; break; }
        if (!other) return null;
        const wrong = R.make(raw[0] / g, raw[1] / other);
        if (R.eq(wrong, right) || R.display(wrong) === R.display(right)) return null;
        return item({
          key: `${q.a}×wred:${q.b}`, kind: 'frac-wrong-reduce', rank: pa.d + pb.d, prompt: `${q.a} × ${q.b}`,
          wrong: {
            text: R.plain(wrong), value: wrong,
            lines: [
              tline(`${fracText(pa.n, pa.d)} × ${fracText(pb.n, pb.d)}`),
              tline(`= ${fracText(raw[0], raw[1])}`),
              tline(`= *${fracText(wrong[0], wrong[1])}*`)
            ]
          },
          right: {
            text: R.plain(right), value: right,
            lines: [
              tline(`${fracText(pa.n, pa.d)} × ${fracText(pb.n, pb.d)}`),
              tline(`= ${fracText(raw[0], raw[1])} = ${fracText(right[0], right[1])}`)
            ]
          },
          work: { type: 'lines', count: 3 }
        });
      }
    },
    'frac-mixed-borrow': {
      topic: 'fraction', label: '대분수 받아내림 오류', note: '대분수 받아내림을 안 함',
      source: 'fraction-sub-mixed-proper',
      need: q => {
        const pa = fracParts(q.a), pb = fracParts(q.b);
        return pa.n * pb.d < pb.n * pa.d;                     // 분수 부분에서 받아내림이 필요
      },
      build(q) {
        const pa = fracParts(q.a), pb = fracParts(q.b);
        const common = lcm(pa.d, pb.d);
        const left = pa.n * common / pa.d, rightNum = pb.n * common / pb.d;
        const right = R.make((pa.whole * common + left) - rightNum, common);
        const wrong = R.make(pa.whole * common + (rightNum - left), common);
        if (R.eq(wrong, right)) return null;
        return item({
          key: `${q.a}−mixed:${q.b}`, kind: 'frac-mixed-borrow', rank: pa.d + pb.d, prompt: `${q.a} − ${q.b}`,
          wrong: {
            text: R.text(wrong, true), value: wrong,
            lines: [
              tline(`${mixedText(pa.whole, pa.n, pa.d)} − ${fracText(pb.n, pb.d)}`),
              tline(`= ${mixedText(pa.whole, left, common)} − ${fracText(rightNum, common)}`),
              tline(`= *${mixedText(pa.whole, rightNum - left, common)}*`)
            ]
          },
          right: {
            text: R.text(right, true), value: right,
            lines: [
              tline(`${mixedText(pa.whole, pa.n, pa.d)} − ${fracText(pb.n, pb.d)}`),
              tline(`= ${mixedText(pa.whole, left, common)} − ${fracText(rightNum, common)}`),
              tline(`= ${mixedText(pa.whole - 1, common + left, common)} − ${fracText(rightNum, common)}`),
              tline(`= ${koreanMixed(right)}`)
            ]
          },
          work: { type: 'lines', count: 3 }
        });
      }
    },
    'frac-no-reciprocal': {
      topic: 'fraction', label: '역수 안 취함', note: '역수를 곱하지 않음',
      source: 'fraction-div-different',
      need: q => fracParts(q.a).d !== fracParts(q.b).d,
      build(q) {
        const pa = fracParts(q.a), pb = fracParts(q.b);
        const right = R.div(R.make(pa.n, pa.d), R.make(pb.n, pb.d));
        const wrong = R.mul(R.make(pa.n, pa.d), R.make(pb.n, pb.d));
        if (R.eq(wrong, right)) return null;
        return item({
          key: `${q.a}÷rec:${q.b}`, kind: 'frac-no-reciprocal', rank: pa.d + pb.d, prompt: `${q.a} ÷ ${q.b}`,
          wrong: {
            text: R.plain(wrong), value: wrong,
            lines: [
              tline(`${fracText(pa.n, pa.d)} ÷ ${fracText(pb.n, pb.d)}`),
              tline(`= *${fracText(pa.n, pa.d)} × ${fracText(pb.n, pb.d)}*`),
              tline(`= ${fracText(wrong[0], wrong[1])}`)
            ]
          },
          right: {
            text: R.plain(right), value: right,
            lines: [
              tline(`${fracText(pa.n, pa.d)} ÷ ${fracText(pb.n, pb.d)}`),
              tline(`= ${fracText(pa.n, pa.d)} × ${fracText(pb.d, pb.n)}`),
              tline(`= ${fracText(right[0], right[1])}`)
            ]
          },
          work: { type: 'lines', count: 3 }
        });
      }
    },

    /* ---------- 소수 ---------- */
    'dec-point-misalign': {
      topic: 'decimal', label: '소수점 안 맞춤', note: '소수점 자리를 맞추지 않음',
      source: 'decimal-add-1dp-2dp',
      need: q => String(q.a).includes('.') && String(q.b).includes('.'),
      build(q) {
        const pa = decParts(q.a), pb = decParts(q.b);
        const scale = pa.scale * pb.scale;
        const rightInt = pa.int * pb.scale + pb.int * pa.scale;
        const right = R.make(rightInt, scale);
        const wrongInt = pa.int + pb.int;                     // 소수점을 맞추지 않고 자리만 더함
        const wrong = R.make(wrongInt, pa.scale);
        if (R.eq(wrong, right)) return null;
        const rightText = String(q.answer);
        const wrongText = decStr(wrongInt, pa.scale);
        const width = Math.max(q.a.length, q.b.length, wrongText.length, rightText.length);
        return item({
          key: `${q.a}+pt:${q.b}`, kind: 'dec-point-misalign', rank: pa.int, prompt: `${q.a} + ${q.b}`,
          wrong: {
            text: wrongText, value: wrong,
            lines: [vline([
              { text: pad(q.a, width) },
              { text: pad(q.b, width), sign: '+' },
              { text: pad(wrongText, width), rule: true, marks: [width - wrongText.length + wrongText.indexOf('.')] }
            ], { align: 'right' })]
          },
          right: {
            text: rightText, value: right,
            lines: [vline([{ text: pad(q.a, width) }, { text: pad(q.b, width), sign: '+' }, { text: pad(rightText, width), rule: true }])]
          },
          work: { type: 'v', slots: width, rows: 3 }
        });
      }
    },
    'dec-product-point': {
      topic: 'decimal', label: '곱의 소수점 위치', note: '곱의 소수점 자리를 잘못 정함',
      source: 'decimal-mul-1',
      need: q => String(q.a).includes('.') && String(q.b).includes('.'),
      build(q) {
        const pa = decParts(q.a), pb = decParts(q.b);
        const digits = pa.int * pb.int;
        const right = R.make(digits, pa.scale * pb.scale);
        const wrong = R.make(digits, pa.scale);               // 한 수의 소수 자리만 셈
        if (R.eq(wrong, right)) return null;
        const wrongText = decStr(digits, pa.scale);
        const rightText = String(q.answer);
        const width = Math.max(q.a.length, q.b.length, wrongText.length, rightText.length);
        return item({
          key: `${q.a}×pt:${q.b}`, kind: 'dec-product-point', rank: pa.int, prompt: `${q.a} × ${q.b}`,
          wrong: {
            text: wrongText, value: wrong,
            lines: [vline([
              { text: pad(q.a, width) },
              { text: pad(q.b, width), sign: '×' },
              { text: pad(wrongText, width), rule: true, marks: [width - wrongText.length + wrongText.indexOf('.')] }
            ])]
          },
          right: {
            text: rightText, value: right,
            lines: [vline([{ text: pad(q.a, width) }, { text: pad(q.b, width), sign: '×' }, { text: pad(rightText, width), rule: true }])]
          },
          work: { type: 'v', slots: width, rows: 3 }
        });
      }
    },
    'dec-missing-zero': {
      topic: 'decimal', label: '0 채우기 빠뜨림', note: '자리를 맞추는 0을 안 씀',
      source: 'decimal-sub-1dp-2dp',
      need: q => {
        const a = (String(q.a).split('.')[1] || '').length;
        const b = (String(q.b).split('.')[1] || '').length;
        return b > a;
      },
      build(q) {
        const pa = decParts(q.a), pb = decParts(q.b);
        const gap = pb.scale / pa.scale;
        const tail = pb.int % gap;
        const rightInt = pa.int * gap - pb.int;
        const wrongInt = (pa.int - Math.floor(pb.int / gap)) * gap + tail;   // 0을 채우지 않고 아래 자리를 그대로 내림
        const right = R.make(rightInt, pb.scale);
        const wrong = R.make(wrongInt, pb.scale);
        if (R.eq(wrong, right)) return null;
        const rightText = String(q.answer);
        const wrongText = decStr(wrongInt, pb.scale);
        const width = Math.max(q.a.length + 1, q.b.length, wrongText.length, rightText.length);
        return item({
          key: `${q.a}−zero:${q.b}`, kind: 'dec-missing-zero', rank: pa.int, prompt: `${q.a} − ${q.b}`,
          wrong: {
            text: wrongText, value: wrong,
            lines: [vline([
              { text: pad(q.a + ' ', width), marks: [width - 1] },
              { text: pad(q.b, width), sign: '−' },
              { text: pad(wrongText, width), rule: true, marks: diffMarks(pad(rightText, width), pad(wrongText, width)) }
            ])]
          },
          right: {
            text: rightText, value: right,
            lines: [vline([{ text: pad(q.a + '0', width) }, { text: pad(q.b, width), sign: '−' }, { text: pad(rightText, width), rule: true }])]
          },
          work: { type: 'v', slots: width, rows: 3 }
        });
      }
    }
  };

  function item(fields) {
    return {
      key: fields.key,
      kind: fields.kind,
      rank: fields.rank,
      prompt: fields.prompt,
      label: KINDS[fields.kind].label,
      note: KINDS[fields.kind].note,
      wrong: fields.wrong,
      right: fields.right,
      work: fields.work
    };
  }

  /* ================= 6. 한국어 오류 이름 ================= */

  const ALIAS = {
    '받아올림을 빠뜨림': 'add-carry-lost',
    '받아올림을 두 번 더함': 'add-carry-doubled',
    '자리 어긋남': 'add-place-shift',
    '큰 수에서 작은 수를 거꾸로 뺌': 'sub-reversed',
    '받아내림 후 윗자리에서 안 줄임': 'sub-borrow-no-reduce',
    '0 건너 받아내림 오류': 'sub-across-zero',
    '올림을 빠뜨림': 'mul-carry-lost',
    '구구단 곱을 잘못 외움': 'mul-table-slip',
    '두 자리 곱셈의 부분곱 자리를 맞추지 않음': 'mul-partial-shift',
    '몫 자리 잘못': 'div-quotient-place',
    '나머지가 나누는 수보다 큼': 'div-remainder-too-big',
    '몫의 0 빠뜨림': 'div-quotient-zero',
    '분모끼리 더함': 'frac-add-denominators',
    '통분 때 분자 안 바꿈': 'frac-numerator-not-changed',
    '약분 안 함': 'frac-not-reduced',
    '약분 잘못': 'frac-wrong-reduce',
    '대분수 받아내림 오류': 'frac-mixed-borrow',
    '역수 안 취함': 'frac-no-reciprocal',
    '소수점 줄 안 맞춤': 'dec-point-misalign',
    '곱의 소수점 위치 오류': 'dec-product-point',
    '자릿수 채우는 0 빠뜨림': 'dec-missing-zero'
  };

  const TOPIC_KINDS = {
    add: ['add-carry-lost', 'add-carry-doubled', 'add-place-shift'],
    sub: ['sub-reversed', 'sub-borrow-no-reduce', 'sub-across-zero'],
    mul: ['mul-carry-lost', 'mul-table-slip', 'mul-partial-shift'],
    div: ['div-quotient-place', 'div-remainder-too-big', 'div-quotient-zero'],
    fraction: ['frac-add-denominators', 'frac-numerator-not-changed', 'frac-not-reduced', 'frac-wrong-reduce', 'frac-mixed-borrow', 'frac-no-reciprocal'],
    decimal: ['dec-point-misalign', 'dec-product-point', 'dec-missing-zero']
  };

  const FORMAT_TOPIC = {
    'error-fix': null,
    'error-correction': null,
    'error-fix-add': 'add',
    'error-fix-sub': 'sub',
    'error-fix-mul': 'mul',
    'error-fix-div': 'div',
    'error-fix-fraction': 'fraction',
    'error-fix-decimal': 'decimal'
  };

  const TOPIC_TITLE = {
    add: '자연수 덧셈', sub: '자연수 뺄셈', mul: '자연수 곱셈',
    div: '자연수 나눗셈', fraction: '분수 사칙', decimal: '소수'
  };
  const INSTRUCTION = '잘못된 곳을 찾아 바르게 고쳐 쓰세요.';

  function resolveKinds(request, topic) {
    if (request && request.length) {
      const picked = [];
      request.forEach(name => {
        const id = ALIAS[name] || name;
        if (KINDS[id] && picked.indexOf(id) < 0) picked.push(id);
      });
      if (picked.length) return picked;
    }
    if (!topic) throw Error('error-fix: gen.topic 또는 gen.errorKinds 가 필요합니다.');
    return TOPIC_KINDS[topic].slice();
  }

  /* ================= 7. 문항 만들기 ================= */

  function takeKind(kindId, count, seed) {
    const kind = KINDS[kindId];
    if (!kind) throw Error(`알 수 없는 오류 유형: ${kindId}`);
    if (!root.Worksheets || typeof root.Worksheets.generate !== 'function') throw Error('Worksheets 생성기를 찾지 못했습니다.');
    const out = [], seen = new Set();
    for (let round = 0; round < 80 && out.length < count; round++) {
      let rows;
      try {
        rows = root.Worksheets.generate(kind.source, (Number(seed) + Math.imul(round, 7919)) >>> 0, Math.max(count * 8, 24));
      } catch (error) {
        throw Error(`${kindId}: 기존 생성기 실패 (${kind.source}) — ${error.message}`);
      }
      const random = rng(seed + round * 131);
      for (const q of rows) {
        if (out.length >= count) break;
        const key = `${q.a}|${q.op}|${q.b}`;
        if (seen.has(key) || !kind.need(q)) continue;
        const built = kind.build(q, random);
        if (!built) continue;
        built.source = q.answer;                              // 기존 생성기의 정답 (검산용)
        seen.add(key);
        out.push(built);
      }
    }
    if (out.length < count) throw Error(`${kindId}: 조건에 맞는 문항을 ${count}개 만들지 못했습니다 (${out.length}개).`);
    return out;
  }

  // 오류가 들어간 결과는 바른 결과와 달라야 한다.
  function checkItem(built, kindId) {
    if (!built.wrong || !built.right) throw Error(`${kindId}: 풀이가 없습니다.`);
    if (built.wrong.text === built.right.text) throw Error(`${kindId}: 틀린 답과 바른 답이 같습니다 (${built.prompt}).`);
    if (!built.wrong.sameValue && R.eq(built.wrong.value, built.right.value)) {
      throw Error(`${kindId}: 틀린 값과 바른 값이 같습니다 (${built.prompt}).`);
    }
    // 바른 풀이의 값은 기존 생성기가 낸 정답과 같아야 한다 (정답을 새로 만들지 않았다는 확인)
    const expected = answerValue(built.source);
    if (expected && !R.eq(built.right.value, expected)) {
      throw Error(`${kindId}: 기존 생성기의 정답과 다릅니다 (${built.prompt}: ${built.source} vs ${R.display(built.right.value)}).`);
    }
    return built;
  }

  function generateQuestions(config) {
    const gen = config.gen || {};
    const topic = gen.topic || FORMAT_TOPIC[config.format] || null;
    const kinds = resolveKinds(gen.errorKinds, topic);
    const count = config.count || (config.cols || 3) * (config.rows || 4);
    const seed = Number(config.seed) || 1;
    const per = Math.ceil(count / kinds.length);
    const pool = kinds.map((kindId, index) => takeKind(kindId, per, seed + index * 104729));
    const items = [];
    for (let i = 0; i < count; i++) {
      const bucket = pool[i % kinds.length];
      if (!bucket.length) break;
      items.push(bucket.shift());
    }
    if (items.length !== count) throw Error(`${config.typeId || 'error-fix'}: 문항 ${count}개를 채우지 못했습니다.`);
    items.forEach(built => checkItem(built, built.kind));
    items.sort((a, b) => a.rank - b.rank || String(a.prompt).localeCompare(String(b.prompt)));
    items.forEach((built, index) => { built.no = index + 1; });
    return items;
  }

  /* ================= 8. 그리기 ================= */

  const node = (tag, className, value) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (value !== undefined) el.textContent = value;
    return el;
  };

  const CSS = [
    '.ef-item{display:flex;height:100%;padding-bottom:3mm;gap:1.6mm;align-items:flex-start}',
    '.ef-item.ef-k-frac .ef-line{font-size:10pt}',
    '.ef-item.ef-k-frac .ef-wrong{flex:0 0 47%}',
    '.ef-item.ef-k-frac .ef-work,.ef-item.ef-k-frac .ef-right{flex:1 1 53%}',
    '.ef-wrong{flex:1 1 55%;min-width:0}',
    '.ef-work,.ef-right{flex:1 1 45%;min-width:0;border-left:1px dashed #c8c8c8;padding-left:1.6mm;height:100%}',
    '.ef-line{white-space:nowrap;line-height:1.6;margin:0 0 1mm}',
    '.ef-frac{display:inline-flex;flex-direction:column;vertical-align:-0.42em;text-align:center;font-size:.82em;line-height:1.06;min-width:1.1em}',
    '.ef-frac>span:first-child{border-bottom:1px solid #111;padding:0 .1em}',
    '.ef-frac>span:last-child{padding:0 .1em}',
    '.ef-mixed{display:inline-flex;align-items:center;gap:.1em;margin:0 .1em}',
    '.ef-mark{background:#dedede;box-shadow:inset 0 -2px 0 #111}',
    '.vertical{--ef-slot:.98em}',
    '.vertical.ef-narrow{--ef-slot:.88em}',
    '.ef-k-dec .vertical.ef-narrow{--ef-slot:.75em}',
    '.vertical .vertical-digit{width:var(--ef-slot)}',
    '.vertical .vertical-sign{width:.85em}',
    '.ef-right .vertical .vertical-digit{font-size:.94em}',
    '.ef-right .vertical .vertical-sign{width:.66em}',
    '.vertical-row.ef-carry{height:.9em}',
    '.ef-carry .vertical-digit{font-size:.62em;border:1px solid #bbb;line-height:1}',
    '.ef-carry .vertical-digit.ef-off{border-color:transparent}',
    '.ef-slot-mark{background:#dedede}',
    '.ef-blank-mark{border:1px dashed #888;background:#f2f2f2}',
    '.ef-ld{display:inline-block}',
    '.ef-ld-row{display:grid;grid-template-columns:repeat(var(--ef-cols),var(--ef-slot));height:1.28em;align-items:center}',
    '.ef-ld-c{text-align:center;font-variant-numeric:tabular-nums;font-size:.92em;line-height:1}',
    '.ef-ld-rule{border-top:1px solid #111;height:1.28em}',
    '.ef-frame{border:1px solid #ddd;height:100%;min-height:14mm}',
    '.ef-frame-v{background-image:repeating-linear-gradient(90deg,transparent 0 calc(var(--ef-slot) - 1px),#ececec calc(var(--ef-slot) - 1px) var(--ef-slot))}',
    '.ef-frame-ld{display:flex;align-items:flex-start;gap:.3em;font-size:.92em;color:#bbb;padding:2mm 0 0 1mm}',
    '.ef-empty{height:1.6em;border-bottom:1px solid #ddd}',
    '.answer-page .ef-right,.answer-page .ef-right *{color:#d71f10 !important;border-color:#d71f10 !important;font-weight:700}',
    '.answer-page .ef-right .ans-fill{font-size:1em !important}',
    '.ef-note{position:absolute;left:2mm;bottom:.8mm;font-size:7.5pt;color:#444;white-space:nowrap;overflow:hidden;max-width:94%}'
  ].join('');

  function installCss() {
    if (document.getElementById('ef-styles')) return;
    const style = node('style');
    style.id = 'ef-styles';
    style.textContent = CSS;
    document.head.append(style);
  }

  function fracNode(spec) {
    const parts = String(spec).trim().split(/\s+/);
    const pair = (parts.length > 1 ? parts[1] : parts[0]).split('/');
    const stack = node('span', 'ef-frac');
    stack.append(node('span', '', pair[0]), node('span', '', pair[1]));
    if (parts.length < 2) return stack;
    const mixed = node('span', 'ef-mixed');
    mixed.append(node('span', '', parts[0]), stack);
    return mixed;
  }

  // [n/d] 분수, [w n/d] 대분수, *...* 틀린 곳 (정답지에서만 표시)
  function richText(text, answer) {
    const frag = document.createDocumentFragment();
    const source = String(text);
    const rx = /\[([^\]]*)\]|\*([^*]*)\*|([^[*]+)/g;
    let m, last = 0;
    while ((m = rx.exec(source))) {
      if (m.index > last) frag.append(document.createTextNode(source.slice(last, m.index)));
      last = rx.lastIndex;
      if (m[1] != null) frag.append(fracNode(m[1]));
      else if (m[2] != null) {
        if (answer) {
          const mark = node('span', 'ef-mark');
          mark.append(richText(m[2], answer));
          frag.append(mark);
        } else frag.append(richText(m[2], answer));
      } else frag.append(document.createTextNode(m[3]));
    }
    if (last < source.length) frag.append(document.createTextNode(source.slice(last)));
    return frag;
  }

  function carryNode(carry, slots) {
    const row = node('div', 'vertical-row ef-carry');
    row.append(node('span', 'vertical-sign'));
    for (let i = 0; i < slots; i++) {
      const value = carry[slots - 1 - i];                     // carry 키는 오른쪽부터 센 자리
      row.append(node('span', 'vertical-digit' + (value == null ? ' ef-off' : ''), value == null ? ' ' : String(value)));
    }
    return row;
  }

  function vNode(line, answer) {
    const rows = line.rows.map(row => ({ ...row, text: String(row.text) }));
    const hasPoint = rows.some(row => row.text.includes('.'));
    let slots, starts;
    if (hasPoint && line.align === 'point') {
      const pointSlot = Math.max(...rows.map(row => {
        const at = row.text.indexOf('.');
        return at < 0 ? row.text.length : at;
      }));
      starts = rows.map(row => {
        const at = row.text.indexOf('.');
        return at < 0 ? pointSlot - row.text.length : pointSlot - at;
      });
      slots = Math.max(pointSlot + 1, ...rows.map((row, i) => starts[i] + row.text.length));
    } else {
      slots = Math.max(...rows.map(row => row.text.length));
      starts = rows.map(row => slots - row.text.length);
    }
    const stack = node('div', 'vertical' + (hasPoint ? ' ef-narrow' : ''));
    if (line.carry) stack.append(carryNode(line.carry, slots));
    rows.forEach((row, index) => {
      const el = node('div', 'vertical-row');
      el.append(node('span', 'vertical-sign', row.sign || ''));
      const marks = answer && row.marks ? row.marks : [];
      for (let i = 0; i < slots; i++) {
        const at = i - starts[index];
        const raw = at >= 0 && at < row.text.length ? row.text[at] : ' ';
        const blank = raw === ' ' || raw === ' ';
        const slot = node('span', 'vertical-digit', blank ? ' ' : raw);
        if (marks.indexOf(at) >= 0) slot.classList.add(blank ? 'ef-blank-mark' : 'ef-slot-mark');
        el.append(slot);
      }
      if (row.rule) el.classList.add('vertical-rule');
      stack.append(el);
    });
    return stack;
  }

  function ldNode(line, answer) {
    const box = node('div', 'ef-ld');
    box.style.setProperty('--ef-cols', String(line.slots));
    box.style.setProperty('--ef-slot', '1.1em');
    line.rows.forEach((row, index) => {
      const el = node('div', 'ef-ld-row');
      row.cells.forEach(cell => {
        const marked = answer && line.marks.some(mark => mark.row === index && mark.at === cell.at);
        const cls = 'ef-ld-c' + (marked ? (cell.ch ? ' ef-slot-mark' : ' ef-blank-mark') : '');
        const slot = node('span', cls, cell.ch || ' ');
        slot.style.gridColumn = String(cell.at + 1);
        el.append(slot);
      });
      if (row.rule) {
        const rule = node('span', 'ef-ld-rule');
        rule.style.gridColumn = `${row.rule[0] + 1} / span ${row.rule[1] - row.rule[0] + 1}`;
        el.append(rule);
      }
      box.append(el);
    });
    return box;
  }

  function lineNode(line, answer) {
    if (line.t === 'v') return vNode(line, answer);
    if (line.t === 'ld') return ldNode(line, answer);
    const el = node('div', 'ef-line');
    el.append(richText(line.s, answer));
    return el;
  }

  function workNode(work) {
    if (work.type === 'lines') {
      const box = node('div', 'ef-frame');
      for (let i = 0; i < (work.count || 2); i++) box.append(node('div', 'ef-empty'));
      return box;
    }
    if (work.type === 'ld') {
      const box = node('div', 'ef-frame ef-frame-ld');
      box.append(node('span', '', `${work.divisor} │ ${work.digits}`));
      return box;
    }
    const box = node('div', 'ef-frame ef-frame-v');
    box.style.setProperty('--ef-slot', '1.1em');
    return box;
  }

  function renderCell(cell, built, answer) {
    installCss();
    const wrap = node('div', 'ef-item ef-k-' + String(built.kind).split('-')[0]);
    const wrong = node('div', 'ef-wrong');
    built.wrong.lines.forEach(line => wrong.append(lineNode(line, answer)));
    wrap.append(wrong);
    if (answer) {
      const right = node('div', 'ef-right');
      built.right.lines.forEach(line => right.append(lineNode(line, answer)));
      wrap.append(right);
    } else {
      const work = node('div', 'ef-work');
      work.append(workNode(built.work || { type: 'lines', count: 2 }));
      wrap.append(work);
    }
    cell.append(wrap);
  }

  /* ================= 9. sheet.js 연결 ================= */

  const isErrorFix = format => Object.prototype.hasOwnProperty.call(FORMAT_TOPIC, format);

  const mine = new Set();

  function install() {
    if (root.Sheet && typeof root.Sheet.register === 'function') {
      Object.keys(FORMAT_TOPIC).forEach(format => {
        try {
          root.Sheet.register(format, (cell, built, answer) => renderCell(cell, built, answer));
          mine.add(format);
        } catch (error) {
          // 이미 다른 구현이 등록한 서식은 건드리지 않는다 (sheet.js 는 중복 등록을 막는다)
        }
      });
    }
    const base = root.SheetGen;
    if (base && typeof base.generate === 'function' && !base.__errorFix) {
      const original = base.generate;
      base.generate = function (config) {
        if (config && isErrorFix(config.format) && (!root.Sheet || mine.has(config.format))) return generateQuestions(config);
        return original.apply(this, arguments);
      };
      Object.defineProperty(base, '__errorFix', { value: true });
    }
  }

  // 여러 seed로 전 유형을 만들어 오류/정답이 갈리는지 스스로 검사한다.
  function selfTest(options) {
    const seeds = (options && options.seeds) || [1, 7, 13, 29];
    const report = { sheets: 0, items: 0, kinds: {} };
    seeds.forEach(seed => {
      Object.keys(TOPIC_KINDS).forEach(topic => {
        const config = { typeId: `selftest-${topic}`, format: `error-fix-${topic}`, cols: 3, rows: 4, count: 12, seed, gen: { topic } };
        const items = generateQuestions(config);
        const keys = new Set();
        items.forEach(built => {
          checkItem(built, built.kind);
          if (keys.has(built.key)) throw Error(`${topic}: 같은 문제가 두 번 나왔습니다 (${built.key}).`);
          keys.add(built.key);
          report.kinds[built.kind] = (report.kinds[built.kind] || 0) + 1;
        });
        report.sheets += 1;
        report.items += items.length;
      });
    });
    return report;
  }

  install();

  root.ErrorFixSheet = {
    formats: Object.keys(FORMAT_TOPIC),
    catalog: Object.keys(FORMAT_TOPIC).filter(key => FORMAT_TOPIC[key]).map(key => ({
      typeId: key, format: key, topic: FORMAT_TOPIC[key],
      title: '잘못된 계산 과정 고치기 · ' + TOPIC_TITLE[FORMAT_TOPIC[key]],
      instruction: INSTRUCTION,
      cols: 3, rows: 4, count: 12, fontPt: 11, seed: 20261001,
      gen: { topic: FORMAT_TOPIC[key] }
    })),
    kinds: Object.keys(KINDS),
    topics: Object.keys(TOPIC_KINDS),
    layout: { cols: 3, rows: 4, count: 12 },
    generate: generateQuestions,
    takeKind,
    selfTest
  };
})(globalThis);
