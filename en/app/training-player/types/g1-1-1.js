/* =============================================================================
   묶음 1-1-1 — 분모가 같은 분수의 덧셈 (개념 9개 × 유형 4개 = typeId 36개)
   개념: 1-1-1-0 ~ 1-1-1-8  ·  유형: -t1 가로식 / -t2 단계별 빈칸 / -t3 결과 연결 / -t4 오류 고치기

   규칙(AGENTS.md · layout-rules.md)
   · 문제는 기존 생성기(src/bank/legacy/types.js 의 Worksheets.generate)에서만 뽑는다.
     개념 조건(분모 같음 · 진/가/대분수 조합 · 자연수 부분으로 올림 유무)에 맞지 않는 문항은 버리고,
     모자라면 seed 를 바꿔 더 뽑는다. 중복 문항 금지.
   · 정답은 같은 파일의 exact/fraction 과 같은 규칙(정수 연산만 사용, 기약분수·대분수 표시)으로 계산한다.
   · 서식 키는 이 묶음 전용 g111-* 이다. 공용 파일(sheet.js, formats-*.js)은 고치지 않는다.
   · 같은 seed · 같은 typeId 면 언제나 같은 문제가 나온다.
============================================================================= */
(function (root) {
  'use strict';

  /* ---------------------------------------------------------------- 1. 서식 키 */
  const FMT = {
    horizontal: 'g111-fraction-horizontal',
    steps: 'g111-fraction-steps',
    matching: 'g111-fraction-match',
    // sheet.js 의 최소 칸 높이는 서식 이름으로 정해진다 — 'error-correction' 이 들어가야
    // 한 칸에 틀린 풀이 + 고쳐 쓰는 자리가 들어갈 높이(52mm)가 잡힌다.
    errors: 'g111-fraction-error-correction'
  };

  /* ---------------------------------------------------------------- 2. 개념 정의
     forms  : 두 항의 모양(진분수 proper / 가분수 improper / 대분수 mixed)
     carry  : true = 분수 부분의 합이 1 이상(자연수 부분으로 올림 있음), false = 올림 없음, 'any' = 제한 없음
     source : 기존 생성기 id (src/bank/legacy/types.js) */
  const CONCEPTS = [
    { id: '1-1-1-0', name: '진분수 + 진분수 — 합이 1보다 작음', forms: ['proper', 'proper'],
      source: 'fraction-add-same', carry: false,
      instruction: '분모가 같은 진분수끼리 더하여 답을 기약분수로 쓰세요.' },
    { id: '1-1-1-1', name: '진분수 + 진분수 — 합이 1 이상', forms: ['proper', 'proper'],
      source: 'fraction-add-same', carry: true,
      instruction: '분모가 같은 진분수끼리 더하여 답을 기약분수나 대분수로 쓰세요.' },
    { id: '1-1-1-2', name: '가분수 + 진분수', forms: ['improper', 'proper'],
      source: 'fraction-add-improper-proper', carry: 'any',
      instruction: '분모가 같은 가분수와 진분수를 더하여 답을 기약분수나 대분수로 쓰세요.' },
    { id: '1-1-1-3', name: '가분수 + 가분수', forms: ['improper', 'improper'],
      source: 'fraction-add-improper-improper', carry: 'any',
      instruction: '분모가 같은 가분수끼리 더하여 답을 기약분수나 대분수로 쓰세요.' },
    { id: '1-1-1-4', name: '대분수 + 진분수 — 자연수 부분으로 올림 없음', forms: ['mixed', 'proper'],
      source: 'fraction-add-mixed-proper', carry: false,
      instruction: '분모가 같은 대분수와 진분수를 더하세요. 자연수는 자연수끼리, 분수는 분수끼리 더합니다.' },
    { id: '1-1-1-5', name: '대분수 + 진분수 — 자연수 부분으로 올림 있음', forms: ['mixed', 'proper'],
      source: 'fraction-add-mixed-proper', carry: true,
      instruction: '분모가 같은 대분수와 진분수를 더하세요. 분수의 합이 1보다 크면 자연수로 올려 줍니다.' },
    { id: '1-1-1-6', name: '대분수 + 대분수 — 자연수 부분으로 올림 없음', forms: ['mixed', 'mixed'],
      source: 'fraction-add-mixed-mixed', carry: false,
      instruction: '분모가 같은 대분수끼리 더하세요. 자연수는 자연수끼리, 분수는 분수끼리 더합니다.' },
    { id: '1-1-1-7', name: '대분수 + 대분수 — 자연수 부분으로 올림 있음', forms: ['mixed', 'mixed'],
      source: 'fraction-add-mixed-mixed', carry: true,
      instruction: '분모가 같은 대분수끼리 더하세요. 분수의 합이 1보다 크면 자연수로 올려 줍니다.' },
    { id: '1-1-1-8', name: '가분수 + 대분수', forms: ['improper', 'mixed'],
      source: 'fraction-add-improper-mixed', carry: 'any',
      instruction: '분모가 같은 가분수와 대분수를 더하여 답을 기약분수나 대분수로 쓰세요.' }
  ];

  /* ---------------------------------------------------------------- 3. 유형 정의
     문항 수는 layout-rules §2 의 최소 기준(분수 사칙 3단×12줄=36, 분수 단계별 빈칸 2단×10줄=20,
     선 잇기 한 묶음 6쌍×3묶음=18, 잘못된 계산 고치기 3단×4줄=12)에서 시작하고,
     종이가 남으면 sheet.js 의 autoFit 이 줄을 늘린다. */
  const TYPE_SPEC = [
    { suffix: 't1', kind: 'horizontal', format: FMT.horizontal, title: '가로식으로 계산하기',
      cols: 3, rows: 8, autoFit: false, maxProblems: 24, fontPt: 18, instruction: concept => concept.instruction },
    { suffix: 't2', kind: 'steps', format: FMT.steps, title: '단계별 빈칸 채우기',
      cols: 3, rows: 8, autoFit: false, maxProblems: 24, fontPt: 12, instruction: () => '빈칸에 알맞은 수를 써서 풀이를 완성하세요.' },
    { suffix: 't3', kind: 'matching', format: FMT.matching, title: '계산 결과 연결하기',
      cols: 6, rows: 4, autoFit: false, maxProblems: 24, fontPt: 12, instruction: () => '서로 알맞은 것끼리 선으로 이으세요.' },
    { suffix: 't4', kind: 'errors', format: FMT.errors, title: '잘못된 계산 고치기',
      cols: 3, rows: 4, autoFit: false, maxProblems: 12, fontPt: 15, instruction: () => '잘못 계산한 곳을 찾아 바르게 고쳐 쓰세요.' }
  ];

  const entries = [];
  for (const concept of CONCEPTS) for (const spec of TYPE_SPEC) {
    entries.push({
      typeId: concept.id + '-' + spec.suffix,
      title: spec.title,
      instruction: spec.instruction(concept),
      format: spec.format,
      cols: spec.cols, rows: spec.rows, count: spec.cols * spec.rows,
      ...(spec.autoFit === false ? { autoFit: false } : {}), ...(spec.maxProblems ? { maxProblems: spec.maxProblems } : {}),
      fontPt: spec.fontPt,
      seed: 20261001,
      gen: {
        concept: concept.id, kind: spec.kind, source: concept.source,
        // 올림이 없는 개념(1-1-1-0·4·6)의 단계별 문제는 약분이 필요한 문항을 먼저 쓴다.
        softReduce: concept.carry === false && spec.kind === 'steps'
      }
    });
  }
  if (Array.isArray(root.SheetCatalog)) root.SheetCatalog.push(...entries);

  /* ---------------------------------------------------------------- 4. 수 계산
     정수 연산만 쓴다(부동소수 오차 금지). 기존 생성기와 같은 표시 규칙:
     기약분수로 줄이고, 1보다 크면 대분수로 쓴다. */
  const gcd = (a, b) => b ? gcd(b, a % b) : Math.abs(a);
  function reduced(n, d) { const g = gcd(Math.abs(n), d) || 1; return [n / g, d / g]; }
  function display(n, d) {
    const [rn, rd] = reduced(n, d);
    if (rd === 1) return String(rn);
    const whole = Math.trunc(rn / rd), rest = rn % rd;
    return whole ? whole + ' ' + rest + '/' + rd : rn + '/' + rd;
  }
  /** "2 3/5" · "7/4" · "3" 을 분자·분모와 모양 정보로 나눈다. */
  function parse(text) {
    const s = String(text).trim();
    let m = s.match(/^(\d+)\s+(\d+)\/(\d+)$/);
    if (m) {
      const whole = +m[1], num = +m[2], den = +m[3];
      return { whole, num, den, n: whole * den + num, d: den, form: 'mixed', text: s };
    }
    m = s.match(/^(\d+)\/(\d+)$/);
    if (m) {
      const n = +m[1], d = +m[2];
      return { whole: 0, num: n, den: d, n, d, form: n >= d ? 'improper' : 'proper', text: s };
    }
    return { whole: +s, num: 0, den: 1, n: +s, d: 1, form: 'whole', text: s };
  }

  /* ---------------------------------------------------------------- 5. 문항 만들기 */
  function makeItem(A, B, concept) {
    const d = A.den;
    const rawNum = A.n + B.n;            // 두 분수를 분모 d 로 통일했을 때의 분자 합
    const fracNum = A.num + B.num;       // 자연수 부분을 뺀 분수의 분자 합
    return {
      a: A.text, b: B.text, op: '+',
      A, B, d, rawNum, fracNum,
      // 대분수 + (진분수·대분수)는 자연수와 분수를 나누어 더한다. 가분수가 섞이면 그렇게 하지 않는다.
      wholeStyle: concept.forms[0] === 'mixed',
      wholeSum: A.whole + B.whole,
      // 단계 풀이의 가운데 빈칸(□/d)에 들어가는 수.
      // 대분수를 자연수와 분수로 나누어 더할 때는 분수 부분의 합, 그 밖에는 분자 전체의 합.
      slotNum: concept.forms[0] === 'mixed' ? fracNum : rawNum,
      carry: fracNum >= d,               // 분수 부분의 합이 1 이상인가
      mixed: A.form === 'mixed' || B.form === 'mixed',
      answer: display(rawNum, d),        // 기약분수 또는 대분수
      answerText: display(rawNum, d)
    };
  }
  /** layout-rules §2: 0·1이 들어간 지나치게 쉬운 문제는 10% 이하.
      분수에서는 1/d + 1/d(단위분수끼리)를 가장 쉬운 문항으로 본다. */
  const isEasy = item => item.A.whole === 0 && item.B.whole === 0
    && item.A.num === 1 && item.B.num === 1;
  const byDifficulty = (x, y) => (x.d - y.d) || (x.wholeSum - y.wholeSum) || (x.rawNum - y.rawNum)
    || x.a.localeCompare(y.a) || x.b.localeCompare(y.b);

  /** 기존 생성기에서 개념 조건에 맞는 문항만 뽑아 쉬운 순으로 돌려준다.
      opts.soft 를 주면 그 조건에 맞는 문항을 먼저 모으고, 모자랄 때만 조건을 풀어 채운다. */
  function select(concept, seed, count, options) {
    const opts = options || {};
    if (!root.Worksheets || typeof root.Worksheets.generate !== 'function') {
      throw Error('기존 Worksheets 생성기를 찾지 못했습니다.');
    }
    const out = [], seen = new Set(), taken = new Set();
    const easyLimit = Math.floor(count * 0.1);
    let easy = 0;
    for (const strict of (opts.soft ? [true, false] : [false])) {
      for (let batch = 0; batch < 800 && out.length < count; batch++) {
        let rows;
        try { rows = root.Worksheets.generate(concept.source, (seed + Math.imul(batch, 2654435761)) >>> 0, 96); }
        catch (error) { continue; }
        for (const row of rows) {
          const A = parse(row.a), B = parse(row.b);
          if (A.den !== B.den) continue;                                 // 분모가 같아야 한다
          if (A.form !== concept.forms[0] || B.form !== concept.forms[1]) continue;
          const item = makeItem(A, B, concept);
          if (concept.carry !== 'any' && item.carry !== concept.carry) continue;
          const key = [row.a, row.b].sort().join(':');   // 1/4+2/4 와 2/4+1/4 처럼 순서만 바꾼 문제도 같은 문제로 본다
          if (seen.has(key)) continue;
          if (strict && !opts.soft(item)) continue;
          if (opts.uniqueResult && taken.has(item.answer)) continue;
          if (isEasy(item) && easy >= easyLimit) continue;
          seen.add(key);
          if (opts.uniqueResult) taken.add(item.answer);
          if (isEasy(item)) easy++;
          out.push(item);
          if (out.length === count) break;
        }
      }
      if (out.length === count) break;
    }
    if (out.length !== count) {
      throw Error(concept.id + ': 조건에 맞는 고유 문항 ' + count + '개 중 ' + out.length + '개만 만들었습니다.');
    }
    return out.sort(byDifficulty);
  }

  /* ---------------------------------------------------------------- 6. 잘못된 계산 고치기
     개념별로 실제로 흔한 오류만 쓴다(spec 의 params.errorKinds).
     · denSum        분모끼리 더함              (값이 틀림)
     · noReduce      약분하지 않음              (값은 같지만 답의 모양이 틀림)
     · noMixed       가분수를 대분수로 고치지 않음(값은 같지만 답의 모양이 틀림)
     · wholeDrop     자연수 부분을 더하지 않음   (값이 틀림)
     · carryDropped  올림한 1을 자연수에 더하지 않음(값이 틀림)
     · carryIgnore   분수 부분을 가분수로 남겨 둠 (값은 같지만 답의 모양이 틀림) */
  const NOTES = {
    denSum: '분모끼리 더함',
    noReduce: '약분하지 않음',
    noMixed: '가분수를 대분수로 고치지 않음',
    wholeDrop: '자연수 부분을 더하지 않음',
    carryDropped: '올림한 1을 자연수 부분에 더하지 않음',
    carryIgnore: '가분수를 대분수로 고치지 않음'
  };
  const PLANNED = {
    '1-1-1-0': ['denSum', 'noReduce'],
    '1-1-1-1': ['denSum', 'noMixed', 'noReduce'],
    '1-1-1-2': ['denSum', 'noMixed', 'noReduce'],
    '1-1-1-3': ['denSum', 'noMixed', 'noReduce'],
    '1-1-1-4': ['denSum', 'wholeDrop', 'noReduce'],
    '1-1-1-5': ['denSum', 'carryDropped', 'carryIgnore'],
    '1-1-1-6': ['denSum', 'wholeDrop', 'noReduce'],
    '1-1-1-7': ['denSum', 'carryDropped', 'carryIgnore'],
    '1-1-1-8': ['denSum', 'wholeDrop', 'noReduce']
  };
  function applicable(kind, item) {
    switch (kind) {
      case 'denSum': return true;
      case 'noReduce': return gcd(item.wholeStyle ? item.fracNum : item.rawNum, item.d) > 1;
      case 'noMixed': return !item.mixed && item.rawNum > item.d;
      case 'wholeDrop': return item.A.form === 'mixed' || item.B.form === 'mixed';
      // 분수 부분의 합이 분모와 같으면(예: 3/4 + 1/4) 올림을 빠뜨린 풀이가 '7 0/4' 처럼 어색해지므로 합이 분모보다 클 때만 쓴다.
      case 'carryDropped': return item.carry === true && item.fracNum > item.d;
      case 'carryIgnore': return item.carry === true;
      default: return false;
    }
  }
  /** 틀린 풀이는 약분하지 않은 그대로 보여 준다(학생이 실제로 쓰는 모양). */
  function wrongText(kind, item) {
    const { d, rawNum, fracNum, wholeSum, wholeStyle } = item;
    switch (kind) {
      case 'denSum':                      // 분모끼리 더함
        return wholeStyle ? wholeSum + ' ' + fracNum + '/' + (d * 2) : rawNum + '/' + (d * 2);
      case 'noReduce':                    // 답을 약분하지 않음
        if (wholeStyle) return wholeSum + ' ' + fracNum + '/' + d;
        if (rawNum > d && rawNum % d) return Math.floor(rawNum / d) + ' ' + (rawNum % d) + '/' + d;
        return rawNum + '/' + d;
      case 'noMixed': return rawNum + '/' + d;                       // 가분수를 대분수로 고치지 않음
      case 'wholeDrop': return fracNum + '/' + d;                    // 자연수 부분을 더하지 않음
      case 'carryDropped': return wholeSum + ' ' + (fracNum - d) + '/' + d;  // 올림한 1을 더하지 않음
      case 'carryIgnore': return wholeSum + ' ' + fracNum + '/' + d;         // 가분수로 남겨 둠
      default: throw Error('알 수 없는 오류 유형: ' + kind);
    }
  }
  function withErrors(concept, items) {
    const plan = PLANNED[concept.id];
    return items.map((item, index) => {
      const wanted = plan[index % plan.length];
      const kind = applicable(wanted, item) ? wanted
        : plan.find(name => applicable(name, item)) || 'denSum';
      return Object.assign({}, item, { errorKind: kind, note: NOTES[kind], wrong: wrongText(kind, item) });
    });
  }

  /* ---------------------------------------------------------------- 7. 선 잇기
     왼쪽 = 식, 오른쪽 = 계산 결과. 한 묶음 안에서 결과가 겹치면 어느 것과 이어야 하는지
     정해지지 않으므로 한 장 전체에서 결과가 겹치지 않게 뽑는다. */
  function rng(seed) {
    let s = seed >>> 0;
    return () => {
      s += 0x6d2b79f5;
      let t = s;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function order(perBundle, random) {
    const list = Array.from({ length: perBundle }, (unused, index) => index);
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      const tmp = list[i]; list[i] = list[j]; list[j] = tmp;
    }
    // 오른쪽에서 같은 줄에 그대로 놓이면(제자리) 옆과 맞바꾼다.
    for (let i = 0; i < list.length; i++) if (list[i] === i) {
      const j = (i + 1) % list.length;
      const tmp = list[i]; list[i] = list[j]; list[j] = tmp;
    }
    return list;
  }
  function matchingBundles(config, concept, seed, count) {
    const bundles = count % 4 === 0 ? count / 4 : 3;           // 세트당 4문제 × 6세트 = 24(분수 단원 최대)
    const perBundle = Math.max(4, Math.round(count / bundles));
    const items = select(concept, seed, bundles * perBundle, { uniqueResult: true });
    const random = rng(seed ^ 0x2545f491);
    const built = [];
    for (let b = 0; b < bundles; b++) {
      const chunk = items.slice(b * perBundle, (b + 1) * perBundle);
      built.push({
        kind: 'bundle', caption: '', rowsWeight: perBundle,
        pairs: chunk.map(item => [{ html: expressionHTML(item) }, { html: fracHTML(item.answer) }]),
        order: order(perBundle, random)
      });
    }
    return { items: built, layout: { cols: bundles, rows: perBundle, count: items.length }, pairs: items.length };
  }

  /* ---------------------------------------------------------------- 8. 서식(그리기) */
  const esc = value => String(value).replace(/[&<>"']/g,
    c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  /** "3" · "7/4" · "2 3/5" 을 분수꼴 HTML 로 그린다(문제지 서식과 같은 모양). */
  function fracHTML(text) {
    const s = String(text);
    const mixed = s.match(/^(\d+)\s+(\d+)\/(\d+)$/);
    if (mixed) return '<span class="g111-mixed"><span class="g111-whole">' + mixed[1] + '</span>'
      + fracHTML(mixed[2] + '/' + mixed[3]) + '</span>';
    const fraction = s.match(/^(\d+)\/(\d+)$/);
    if (fraction) return '<span class="g111-frac"><span>' + fraction[1] + '</span><span>' + fraction[2] + '</span></span>';
    return '<span class="g111-whole">' + esc(s) + '</span>';
  }
  const expressionHTML = item => fracHTML(item.a) + '<span class="g111-op">+</span>' + fracHTML(item.b);
  const blankHTML = '<span class="g111-blank"></span>';

  function css() {
    if (typeof document === 'undefined' || document.getElementById('g111-styles')) return;
    const style = document.createElement('style');
    style.id = 'g111-styles';
    style.textContent = [
      '.g111-line{display:flex;align-items:center;white-space:nowrap;line-height:1.1;min-width:0}',
      '.g111-frac{display:inline-flex;flex-direction:column;align-items:center;text-align:center;line-height:1;',
      'vertical-align:middle;font-variant-numeric:tabular-nums;margin:0 .15em}',
      '.g111-frac>span{display:block;padding:0 .18em;min-width:.8em}',
      '.g111-frac>span:first-child{border-bottom:.12em solid #111;padding-bottom:.06em}',
      '.g111-frac>span:last-child{padding-top:.06em}',
      '.g111-mixed{display:inline-flex;align-items:center}',
      '.g111-mixed>.g111-whole{margin-right:.15em}',
      '.g111-op{margin:0 .35em}',
      '.g111-blank{display:inline-flex;align-items:center;justify-content:center;min-width:13mm;height:14mm;border:1px solid #57736a;box-sizing:border-box;flex:none}',
      '.g111-numerator-box{display:inline-block;width:8mm;height:7mm;border:1px solid #57736a;box-sizing:border-box;vertical-align:middle}',
      '.g111-num.g111-empty{display:inline-block;min-width:2.1em;min-height:1em}',
      '.g111-mark{color:#b32b2b;font-weight:bold;margin-left:1mm}',
      '.g111-wrong{color:inherit}',
      // 틀린 결과(✗) 뒤에 바르게 고친 답을 쓰는 네모 칸
      '.g111-arrow{margin:0 1.2mm 0 1.6mm;color:#555}',
      '.g111-ansbox{display:inline-flex;align-items:center;justify-content:center;min-width:15mm;height:11mm;border:1px solid #666;border-radius:1mm;background:#fbfbfb;vertical-align:middle}',
      '.g111-work{align-self:stretch}',
      '.g111-fixline{justify-content:center;margin-top:1mm}',
      '.g111-note{font-size:9pt;color:#555;margin-top:.8mm}',
      '.g111-work{flex:1;min-height:13mm;margin-top:1.2mm;border:1px solid #ccc;border-radius:1mm;padding:1.2mm}',
      '.g111-work.g111-solved{border-style:dashed}',
      '.g111-solved-line{font-size:.9em;color:#111;line-height:1.3}'
    ].join('');
    document.head.appendChild(style);
  }

  function renderHorizontal(cell, item, answer) {
    css();
    cell.insertAdjacentHTML('beforeend', '<div class="g111-line">' + expressionHTML(item)
      + '<span class="g111-op">=</span>' + (answer ? fracHTML(item.answer) : blankHTML) + '</div>');
  }
  /** 단계별 빈칸: 가운데 □/d 에 분자끼리 더한 수, 마지막에 정리한 답.
      대분수는 자연수 부분의 합을 미리 보여 준다(2 3/5 + 1 4/5 = 3 + □/5 = □). */
  function renderSteps(cell, item, answer) {
    css();
    const slot = '<span class="g111-frac"><span class="g111-num' + (answer ? '' : ' g111-empty') + '">'
      + (answer ? item.slotNum : '<span class="g111-numerator-box"></span>') + '</span><span>' + item.d + '</span></span>';
    const lead = item.wholeStyle
      ? '<span class="g111-whole">' + item.wholeSum + '</span><span class="g111-op">+</span>' : '';
    cell.insertAdjacentHTML('beforeend', '<div class="g111-line">' + expressionHTML(item)
      + '<span class="g111-op">=</span>' + lead + slot
      + '</div>');
  }
  function renderErrors(cell, item, answer) {
    css();
    // 가운데 단계(분자끼리 더한 값)가 답과 같은 모양이면(예: 3/4 = 3/4) 같은 식을 두 번 쓰지 않는다.
    const slotText = item.wholeStyle ? '' : item.slotNum + '/' + item.d;
    const step = '<div class="g111-line">' + expressionHTML(item) + '<span class="g111-op">=</span>'
      + (item.wholeStyle ? '<span class="g111-whole">' + item.wholeSum + '</span><span class="g111-op">+</span>' : '')
      + '<span class="g111-frac"><span>' + item.slotNum + '</span><span>' + item.d + '</span></span>'
      + (slotText === item.answer ? '' : '<span class="g111-op">=</span>' + fracHTML(item.answer)) + '</div>';
    cell.insertAdjacentHTML('beforeend',
      '<div class="g111-line">' + expressionHTML(item) + '<span class="g111-op">=</span>'
      + '<span class="g111-wrong">' + fracHTML(item.wrong) + '</span></div>'
      + '<div class="g111-work' + (answer ? ' g111-solved' : '') + '">'
      + (answer ? '<div class="g111-solved-line">' + step + '</div>' : '') + '</div>');
  }

  /* ---------------------------------------------------------------- 9. 문항 공급 */
  const cache = new Map();
  const conceptOf = config => CONCEPTS.find(c => c.id === (config.gen && config.gen.concept))
    || CONCEPTS.find(c => config.typeId && config.typeId.indexOf(c.id + '-') === 0);
  const kindOf = config => (config.gen && config.gen.kind)
    || ({ t1: 'horizontal', t2: 'steps', t3: 'matching', t4: 'errors' })[String(config.typeId || '').slice(-2)];
  function hash(text) {
    let h = 2166136261;
    for (const ch of String(text)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  // 같은 seed 라도 유형마다 다른 문제가 나오게 typeId 로 한 번 더 섞는다.
  const seedFor = config => ((Number(config.seed) || 1) ^ hash(config.typeId)) >>> 0;

  function generate(config) {
    const concept = conceptOf(config);
    if (!concept) throw Error('묶음 1-1-1 의 개념이 아닙니다: ' + config.typeId);
    const kind = kindOf(config);
    const count = config.count || (config.cols * config.rows) || 0;
    const seed = seedFor(config);
    const key = [concept.id, kind, seed, count].join('|');
    if (cache.has(key)) return cache.get(key);
    // 단계별 빈칸: 합이 1보다 작은(올림이 없는) 개념은 그대로 두면 가운데 빈칸과 마지막 답이
    // 같은 값이 되어 단계가 의미 없어진다. 약분이 필요한 문항을 먼저 쓰고, 모자라면 그대로 채운다.
    const soft = config.gen && config.gen.softReduce ? (item => gcd(item.slotNum, item.d) > 1) : null;
    const items = kind === 'matching'
      ? matchingBundles(config, concept, seed, count)
      : (kind === 'errors' ? withErrors(concept, select(concept, seed, count))
        : select(concept, seed, count, { soft }));
    cache.set(key, items);
    return items;
  }
  const isOurs = config => !!(config && config.typeId
    && entries.some(entry => entry.typeId === config.typeId));

  /* ---------------------------------------------------------------- 10. 연결 */
  if (root.SheetGen && typeof root.SheetGen.generate === 'function' && !root.SheetGen.g111) {
    const base = root.SheetGen.generate;
    root.SheetGen.generate = function (config) {
      if (isOurs(config)) return generate(config);
      return base.apply(this, arguments);
    };
    Object.defineProperty(root.SheetGen, 'g111', { value: true });
  }
  if (root.Sheet && typeof root.Sheet.register === 'function') {
    const install = (format, render) => {
      try { root.Sheet.register(format, render); }
      catch (error) { console.warn('g1-1-1 서식 등록 실패: ' + format, error); }
    };
    install(FMT.horizontal, (cell, item, answer) => renderHorizontal(cell, item, answer));
    install(FMT.steps, (cell, item, answer) => renderSteps(cell, item, answer));
    install(FMT.errors, (cell, item, answer) => renderErrors(cell, item, answer));
  }
  // 오른쪽 번호는 답의 원래 번호가 아니라, 인쇄된 오른쪽 줄의 위치를 가리킨다.
  // 공용 선 잇기의 정답 선은 그대로 두고, 이 묶음에서만 번호 노출을 막는다.
  if (root.MatchingSheet && root.MatchingSheet.formats && root.MatchingSheet.formats['matching-lines']) {
    const renderMatching = root.MatchingSheet.formats['matching-lines'].render;
    const rightLabels = '①②③④⑤⑥⑦⑧⑨⑩';
    root.MatchingSheet.formats[FMT.matching] = {
      page: 'blocks',
      title: '계산 결과 연결하기',
      build: config => { css(); return matchingBundles(config, conceptOf(config), seedFor(config), config.count); },
      render: (config, bundle, isAnswer) => {
        // 동그라미를 식·결과 바로 옆에 붙인 2단 배치(compact). 왼쪽 식은 넓게, 오른쪽 결과는 좁게 폭을 따로 준다.
        bundle.compact = true; bundle.compactWl = 28; bundle.compactWr = 14; bundle.compactGap = 12;
        return renderMatching(config, bundle, isAnswer);
      }
    };
  }

  root.G111Sheet = {
    concepts: CONCEPTS, entries, formats: FMT, generate,
    parse, display, wrongText, applicable, NOTES,
    /** 검수용: 개념 조건과 정답을 스스로 다시 확인한다. */
    selfTest(seeds) {
      const report = { sheets: 0, items: 0, kinds: {} };
      for (const seed of seeds || [1, 7, 42]) for (const concept of CONCEPTS) {
        for (const spec of TYPE_SPEC) {
          const config = entries.find(entry => entry.typeId === concept.id + '-' + spec.suffix);
          const items = generate(Object.assign({}, config, { seed }));
          const flat = spec.kind === 'matching' ? items.items.flatMap(bundle => bundle.pairs) : items;
          if (!flat.length) throw Error(config.typeId + ': 문항이 없습니다.');
          if (spec.kind !== 'matching') {
            const keys = new Set();
            for (const item of items) {
              if (keys.has(item.a + ':' + item.b)) throw Error(config.typeId + ': 같은 문제가 두 번 나왔습니다.');
              keys.add(item.a + ':' + item.b);
              if (item.A.den !== item.B.den) throw Error(config.typeId + ': 분모가 다릅니다.');
              if (concept.forms[0] !== item.A.form || concept.forms[1] !== item.B.form) {
                throw Error(config.typeId + ': 분수 모양이 개념과 다릅니다.');
              }
              if (concept.carry !== 'any' && item.carry !== concept.carry) {
                throw Error(config.typeId + ': 올림 조건이 다릅니다.');
              }
              // 독립 확인: (a 분자×b 분모 + b 분자×a 분모) / (a 분모×b 분모)
              const n = item.A.n * item.B.d + item.B.n * item.A.d;
              const d = item.A.d * item.B.d;
              if (display(n, d) !== item.answer) throw Error(config.typeId + ': 정답이 틀립니다.');
              if (spec.kind === 'errors') {
                if (!item.note || !item.wrong) throw Error(config.typeId + ': 틀린 풀이가 없습니다.');
                if (item.wrong === item.answer) throw Error(config.typeId + ': 틀린 풀이가 정답과 같습니다.');
                report.kinds[item.errorKind] = (report.kinds[item.errorKind] || 0) + 1;
              }
            }
          }
          report.sheets++; report.items += flat.length;
        }
      }
      return report;
    }
  };
})(globalThis);
