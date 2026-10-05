/* =============================================================================
   묶음 1-1-2 — 분모가 다른 분수의 덧셈 (개념 7개 × 유형 4개 = typeId 28개)
   개념: 1-1-2-0 ~ 1-1-2-6  ·  유형: -t1 가로식 / -t2 단계별 빈칸 / -t3 결과 연결 / -t4 오류 고치기

   규칙(AGENTS.md · layout-rules.md)
   · 문제는 기존 생성기(src/bank/legacy/types.js 의 Worksheets.generate)에서만 뽑는다.
     개념 조건(분모가 다름 · 배수/서로소/공약수 관계 · 진/가/대분수 조합)에 맞지 않는 문항은 버리고,
     모자라면 seed 를 바꿔 더 뽑는다. 중복 문항 금지.
   · 정답은 같은 파일의 display 로 계산한다(정수 연산만 사용, 기약분수·대분수 표시).
   · 서식 키는 이 묶음 전용 g112-* 이다. 공용 파일(sheet.js, formats-*.js)은 고치지 않는다.
   · 같은 seed · 같은 typeId 면 언제나 같은 문제가 나온다.
============================================================================= */
(function (root) {
  'use strict';

  /* ---------------------------------------------------------------- 1. 서식 키
     sheet.js 의 최소 칸 높이는 서식 이름 문자열로 정해진다 —
     'fraction-different'·'fraction-steps' 는 20mm(풀이 한 줄), 'error-correction' 은 52mm. */
  const FMT = {
    horizontal: 'g112-fraction-different-horizontal',
    steps: 'g112-fraction-steps',
    matching: 'g112-fraction-match',
    errors: 'g112-fraction-different-error-correction'
  };

  /* ---------------------------------------------------------------- 2. 개념 정의
     forms    : 두 항의 모양(진분수 proper / 가분수 improper / 대분수 mixed)
     relation : 두 분모의 관계 — multiple(한쪽이 다른 쪽의 배수) / coprime(서로소)
                / shared-factor(공약수가 있으나 배수는 아님) / different(다르기만 함)
     source   : 기존 생성기 id (src/bank/legacy/types.js)
     lead     : 지시문 첫 문장 — 이 문제지가 어떤 개념인지 한 줄로 알린다 */
  const CONCEPTS = [
    { id: '1-1-2-0', label: '배수 분모 진분수 덧셈', forms: ['proper', 'proper'], relation: 'multiple',
      source: 'fraction-add-different',
      lead: '한 분모가 다른 분모의 배수입니다.' },
    { id: '1-1-2-1', label: '서로소 분모 진분수 덧셈', forms: ['proper', 'proper'], relation: 'coprime',
      source: 'fraction-add-different',
      lead: '두 분모가 서로소입니다.' },
    { id: '1-1-2-2', label: '공약수 분모 진분수 덧셈', forms: ['proper', 'proper'], relation: 'shared-factor',
      source: 'fraction-add-different',
      lead: '공약수가 있는 분모입니다.' },
    { id: '1-1-2-3', label: '가분수 + 진분수 덧셈', forms: ['improper', 'proper'], relation: 'different',
      source: 'fraction-add-improper-proper',
      lead: '가분수가 있는 덧셈입니다.' },
    { id: '1-1-2-4', label: '대분수 + 진분수 덧셈', forms: ['mixed', 'proper'], relation: 'different',
      source: 'fraction-add-mixed-proper',
      lead: '대분수와 진분수의 덧셈입니다.' },
    { id: '1-1-2-5', label: '대분수 + 대분수 덧셈', forms: ['mixed', 'mixed'], relation: 'different',
      source: 'fraction-add-mixed-mixed',
      lead: '대분수끼리의 덧셈입니다.' },
    { id: '1-1-2-6', label: '가분수 + 대분수 덧셈', forms: ['improper', 'mixed'], relation: 'different',
      source: 'fraction-add-improper-mixed',
      lead: '가분수와 대분수의 덧셈입니다.' }
  ];

  /* ---------------------------------------------------------------- 3. 유형 정의
     문항 수는 layout-rules §2 의 최소 기준(분수 사칙 통분 필요 2단×12줄=24,
     분수 단계별 빈칸 2단×10줄=20, 선 잇기 한 묶음 6쌍×3묶음=18, 잘못된 계산 고치기 3단×4줄=12)에서
     시작하고, 종이가 남으면 sheet.js 의 autoFit 이 줄을 늘린다. */
  const TYPE_SPEC = [
    { suffix: 't1', kind: 'horizontal', format: FMT.horizontal, task: '가로식으로 계산하기',
      cols: 3, rows: 8, autoFit: false, maxProblems: 24, fontPt: 16,
      ask: '통분하여 계산하고 답은 기약분수나 대분수로 쓰세요.' },
    { suffix: 't2', kind: 'steps', format: FMT.steps, task: '단계별 빈칸 채우기',
      cols: 3, rows: 8, autoFit: false, maxProblems: 24, fontPt: 13,
      ask: '통분한 분자와 답을 빈칸에 써서 풀이를 완성하세요.' },
    { suffix: 't3', kind: 'matching', format: FMT.matching, task: '계산 결과 연결하기',
      cols: 6, rows: 4, autoFit: false, maxProblems: 24, fontPt: 12,
      ask: '식과 계산 결과를 알맞은 것끼리 선으로 이으세요.' },
    { suffix: 't4', kind: 'errors', format: FMT.errors, task: '잘못된 계산 고치기',
      cols: 3, rows: 4, autoFit: false, maxProblems: 12, fontPt: 15,
      ask: '잘못 계산한 곳을 찾아 바르게 고쳐 쓰세요.' }
  ];

  const entries = [];
  for (const concept of CONCEPTS) for (const spec of TYPE_SPEC) {
    entries.push({
      typeId: concept.id + '-' + spec.suffix,
      // 머리말 제목은 한 줄(약 15자)까지만 들어간다 — 개념은 지시문 첫 문장으로 알린다.
      title: spec.task,
      instruction: concept.lead + ' ' + spec.ask,
      format: spec.format,
      cols: spec.cols, rows: spec.rows, count: spec.cols * spec.rows,
      ...(spec.autoFit === false ? { autoFit: false } : {}), ...(spec.maxProblems ? { maxProblems: spec.maxProblems } : {}),
      // 단계별 빈칸(t2)은 대분수가 들어가는 개념(1-1-2-4~6)에서 식이 길어 글자를 한 단계 낮춘다.
      fontPt: spec.suffix === 't2' && /^1-1-2-[456]$/.test(concept.id) ? 11 : (spec.suffix === 't2' ? 14 : spec.fontPt),
      seed: 20261001,
      gen: { concept: concept.id, kind: spec.kind, source: concept.source }
    });
  }
  if (Array.isArray(root.SheetCatalog)) root.SheetCatalog.push(...entries);

  /* ---------------------------------------------------------------- 4. 수 계산
     정수 연산만 쓴다(부동소수 오차 금지). 기존 생성기와 같은 표시 규칙:
     기약분수로 줄이고, 1보다 크면 대분수로 쓴다. */
  const gcd = (a, b) => b ? gcd(b, a % b) : Math.abs(a);
  const lcm = (a, b) => a / gcd(a, b) * b;
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
  /** 두 문자열이 같은 값을 나타내는가(약분 여부와 무관). */
  function sameValue(x, y) {
    const a = parse(x), b = parse(y);
    const [an, ad] = reduced(a.n, a.d), [bn, bd] = reduced(b.n, b.d);
    return an === bn && ad === bd;
  }

  /* ---------------------------------------------------------------- 5. 문항 만들기
     분모가 다른 덧셈의 공통분모 D = lcm(분모). An·Bn 은 공통분모에 맞춘 분자이다.
     wholeStyle(첫 항이 대분수)이면 자연수 부분과 분수 부분을 나누어 다룬다. */
  function makeItem(A, B, concept) {
    const D = lcm(A.d, B.d);
    const wholeStyle = concept.forms[0] === 'mixed';
    // 대분수 + 대분수·대분수 + 진분수는 자연수 부분을 따로 더한다. 가분수가 첫 항이면(가분수 + 대분수 포함)
    // 두 항을 모두 가분수 꼴 분자(A.n, B.n)로 통분해야 통분 풀이식이 성립한다.
    const An = (wholeStyle ? A.num : A.n) * (D / A.d);   // 공통분모에 맞춘 분자
    const Bn = (wholeStyle ? B.num : B.n) * (D / B.d);
    const wholeSum = wholeStyle ? A.whole + B.whole : 0;
    const fracSum = An + Bn;                       // 분수 부분의 분자 합
    const sum = fracSum + wholeSum * D;            // 자연수 부분까지 분모 D 로 나타낸 전체 분자
    const answer = display(A.n * B.d + B.n * A.d, A.d * B.d);
    return {
      a: A.text, b: B.text, op: '+',
      A, B, D, An, Bn, fracSum, sum, wholeSum, wholeStyle,
      slotNum: wholeStyle ? fracSum : sum,         // 단계 빈칸 가운데 □/D 의 분자
      carry: sum >= D,
      answer
    };
  }
  /** layout-rules §2: 0·1이 들어간 지나치게 쉬운 문제는 10% 이하.
      분수에서는 1/d + 1/e(단위분수끼리)를 가장 쉬운 문항으로 본다. */
  const isEasy = item => item.A.whole === 0 && item.B.whole === 0
    && item.A.num === 1 && item.B.num === 1;
  const byDifficulty = (x, y) => (x.D - y.D) || (x.wholeSum - y.wholeSum) || (x.sum - y.sum)
    || x.a.localeCompare(y.a) || x.b.localeCompare(y.b);

  /** 두 분모가 개념이 정한 관계인가. 분모가 같으면 이 묶음의 문항이 아니다. */
  function relationOk(relation, d, e) {
    if (d === e) return false;
    const g = gcd(d, e);
    if (relation === 'multiple') return d % e === 0 || e % d === 0;
    if (relation === 'coprime') return g === 1;
    if (relation === 'shared-factor') return g > 1 && d % e !== 0 && e % d !== 0;
    return true;
  }

  /** 기존 생성기에서 개념 조건에 맞는 문항만 뽑아 쉬운 순으로 돌려준다.
      opts.uniqueResult 를 주면 한 장 안에서 답이 겹치지 않게 뽑는다(선 잇기용). */
  function select(concept, seed, count, options) {
    const opts = options || {};
    if (!root.Worksheets || typeof root.Worksheets.generate !== 'function') {
      throw Error('기존 Worksheets 생성기를 찾지 못했습니다.');
    }
    const out = [], seen = new Set(), taken = new Set();
    const easyLimit = Math.floor(count * 0.1);
    let easy = 0;
    for (let batch = 0; batch < 800 && out.length < count; batch++) {
      let rows;
      try { rows = root.Worksheets.generate(concept.source, (seed + Math.imul(batch, 2654435761)) >>> 0, 96); }
      catch (error) { continue; }
      for (const row of rows) {
        const A = parse(row.a), B = parse(row.b);
        if (A.form !== concept.forms[0] || B.form !== concept.forms[1]) continue;
        if (!relationOk(concept.relation, A.d, B.d)) continue;
        const item = makeItem(A, B, concept);
        const key = [row.a, row.b].sort().join(':');   // 1/4+2/4 와 2/4+1/4 처럼 순서만 바꾼 문제도 같은 문제로 본다
        if (seen.has(key)) continue;
        if (opts.uniqueResult && taken.has(item.answer)) continue;
        if (isEasy(item) && easy >= easyLimit) continue;
        seen.add(key);
        if (opts.uniqueResult) taken.add(item.answer);
        if (isEasy(item)) easy++;
        out.push(item);
        if (out.length === count) break;
      }
    }
    if (out.length !== count) {
      throw Error(concept.id + ': 조건에 맞는 고유 문항 ' + count + '개 중 ' + out.length + '개만 만들었습니다.');
    }
    return out.sort(byDifficulty);
  }

  /* ---------------------------------------------------------------- 6. 잘못된 계산 고치기
     spec 의 params.errorKinds 를 이 묶음의 실제 오류로 옮긴다.
     · denSum      통분하지 않고 분자끼리·분모끼리 더함   (값이 틀림)
     · oneSide     한 분자만 공통 분모에 맞춤            (값이 틀림)
     · wrongCommon 작은 분모를 공통 분모로 잘못 씀        (값이 틀림)
     · noMixed     가분수 결과를 대분수로 고치지 않음     (값은 같고 모양이 틀림)
     · noReduce    답을 약분하지 않음                     (값은 같고 모양이 틀림) */
  const PLANS = {
    '1-1-2-0': [
      { kind: 'denSum', note: '통분 없이 분자·분모끼리 더함' },
      { kind: 'oneSide', note: '한 분자만 공통 분모에 맞추기' },
      { kind: 'wrongCommon', note: '공통 분모를 잘못 구함' }
    ]
  };
  const DEFAULT_PLAN = [
    { kind: 'denSum', note: '분모끼리 더하기' },
    { kind: 'noMixed', note: '가분수를 대분수로 고치지 않음' },
    { kind: 'noReduce', note: '약분하지 않음' }
  ];
  const planOf = concept => PLANS[concept.id] || DEFAULT_PLAN;

  /** 약분·대분수 정리가 필요한 분자 — 대분수는 분수 부분만 따로 정리한다. */
  const reducingNum = item => (item.wholeStyle ? item.fracSum : item.sum);
  function applicable(kind, item) {
    const { A, B, D, fracSum, wholeStyle } = item;
    switch (kind) {
      case 'denSum': return true;
      case 'oneSide':
      case 'wrongCommon': return A.d !== B.d;
      // 가분수 결과를 그대로 둔 경우 — 결과가 대분수(자연수 + 남는 분수)일 때만 성립한다
      case 'noMixed': return wholeStyle ? fracSum >= D : (item.sum > D && item.sum % D !== 0);
      case 'noReduce': return gcd(reducingNum(item), D) > 1;
      default: return false;
    }
  }
  /** 대분수로 고쳐 쓴 모양 — 가분수 53/6 은 8 5/6 으로 본다(학생이 먼저 고쳐 쓰는 모양). */
  function asMixedParts(operand) {
    if (operand.form === 'mixed') return { whole: operand.whole, num: operand.num };
    return { whole: Math.trunc(operand.n / operand.d), num: operand.n % operand.d };
  }
  /** 틀린 풀이는 약분하지 않은, 학생이 실제로 쓰는 모양 그대로 보여 준다. */
  function wrongText(kind, item) {
    const { A, B, D, fracSum, sum, wholeSum, wholeStyle } = item;
    const big = A.d >= B.d ? A : B, small = A.d >= B.d ? B : A;
    switch (kind) {
      case 'denSum': {                                                    // 분모끼리·분자끼리
        const first = asMixedParts(A), second = asMixedParts(B);
        const whole = first.whole + second.whole;
        return (whole ? whole + ' ' : '') + (first.num + second.num) + '/' + (A.d + B.d);
      }
      case 'oneSide': return (big.num + small.num) + '/' + big.d;          // 작은 쪽 분자를 안 고침
      case 'wrongCommon': return (big.num + small.num) + '/' + small.d;   // 작은 분모로 잘못 맞춤
      case 'noMixed':
      case 'noReduce': return wholeStyle ? wholeSum + ' ' + fracSum + '/' + D : sum + '/' + D;
      default: throw Error('알 수 없는 오류 유형: ' + kind);
    }
  }
  /** 값이 틀리는 오류와 모양만 틀리는 오류를 가른다.
      모양 오류(noMixed·noReduce)는 값이 정답과 같아야 하고, 값 오류는 달라야 한다. */
  const SHAPE_ERROR = { noMixed: true, noReduce: true };
  function usableError(kind, item) {
    if (!applicable(kind, item)) return false;
    const wrong = wrongText(kind, item);
    return SHAPE_ERROR[kind] ? wrong !== item.answer : !sameValue(wrong, item.answer);
  }
  function withErrors(concept, items) {
    const plan = planOf(concept);
    const used = new Map(plan.map(step => [step.kind, 0]));
    return items.map(item => {
      // 이 문항에 성립하는 오류 가운데 아직 덜 쓴 것을 고른다(한 장에 여러 오류가 섞이게).
      const usable = plan.filter(step => usableError(step.kind, item));
      if (!usable.length) throw Error(concept.id + ': 쓸 수 있는 틀린 풀이를 만들지 못했습니다.');
      const pick = usable.slice().sort((x, y) => (used.get(x.kind) - used.get(y.kind))
        || (plan.indexOf(x) - plan.indexOf(y)))[0];
      used.set(pick.kind, used.get(pick.kind) + 1);
      return Object.assign({}, item, { errorKind: pick.kind, note: pick.note, wrong: wrongText(pick.kind, item) });
    });
  }

  /* ---------------------------------------------------------------- 7. 선 잇기
     왼쪽 = 식, 오른쪽 = 계산 결과. 한 장 안에서 결과가 겹치면 어느 것과 이어야 하는지
     정해지지 않으므로 결과가 겹치지 않게 뽑는다. */
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
        pairs: chunk.map(item => [{ html: expressionHTML(item), value: item.a + ' + ' + item.b },
          { html: fracHTML(item.answer), value: item.answer }]),
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
    if (mixed) return '<span class="g112-mixed"><span class="g112-whole">' + mixed[1] + '</span>'
      + fracHTML(mixed[2] + '/' + mixed[3]) + '</span>';
    const fraction = s.match(/^(\d+)\/(\d+)$/);
    if (fraction) return '<span class="g112-frac"><span>' + fraction[1] + '</span><span>' + fraction[2] + '</span></span>';
    return '<span class="g112-whole">' + esc(s) + '</span>';
  }
  const expressionHTML = item => fracHTML(item.a) + '<span class="g112-op">+</span>' + fracHTML(item.b);
  const blankHTML = '<span class="g112-blank"></span>';
  /** 통분 과정 — 정답지의 풀이 줄과 오류 고치기 상자에 쓴다. */
  function processHTML(item) {
    return (item.wholeStyle ? '<span class="g112-whole">' + item.wholeSum + '</span><span class="g112-op">+</span>' : '')
      + fracHTML(item.An + '/' + item.D) + '<span class="g112-op">+</span>' + fracHTML(item.Bn + '/' + item.D)
      + '<span class="g112-op">=</span>'
      + (item.wholeStyle ? '<span class="g112-whole">' + item.wholeSum + '</span><span class="g112-op">+</span>' : '')
      + fracHTML(item.slotNum + '/' + item.D);
  }
  // 마지막 단계(분자 합/D)가 답과 같은 모양이면 같은 식을 두 번 쓰지 않는다.
  // 풀이는 두 줄로 쓴다: 통분한 식, 그 아래 '= 답'(줄바꿈이 식 중간에서 어긋나게 일어나지 않도록 직접 나눈다).
  const solutionHTML = item => '<div class="g112-line g112-solvedrow">' + processHTML(item) + '</div>'
    + (!item.wholeStyle && item.sum + '/' + item.D === item.answer ? ''
      : '<div class="g112-line g112-solvedrow"><span class="g112-op">=</span>' + fracHTML(item.answer) + '</div>');

  function css() {
    if (typeof document === 'undefined' || document.getElementById('g112-styles')) return;
    const style = document.createElement('style');
    style.id = 'g112-styles';
    style.textContent = [
      '.g112-block{display:flex;flex-direction:column;min-width:0;line-height:1.1}',
      '.g112-line{display:flex;align-items:center;white-space:nowrap;line-height:1.1;min-width:0}',
      '.g112-frac{display:inline-flex;flex-direction:column;align-items:center;text-align:center;line-height:1;',
      'vertical-align:middle;font-variant-numeric:tabular-nums;margin:0 .15em}',
      '.g112-frac>span{display:block;padding:0 .18em;min-width:.8em}',
      '.g112-frac>span:first-child{border-bottom:.12em solid #111;padding-bottom:.06em}',
      '.g112-frac>span:last-child{padding-top:.06em}',
      '.g112-mixed{display:inline-flex;align-items:center}',
      '.g112-mixed>.g112-whole{margin-right:.15em}',
      '.g112-op{margin:0 .3em}',
      '.g112-blank{display:inline-block;min-width:13mm;height:1.05em;border-bottom:1px solid #555}',
      '.g112-num.g112-empty{display:inline-block;min-width:2.1em;min-height:1em}',
      '.g112-workline{margin-top:1.2mm;height:9mm;border-bottom:1px dotted #bbb;font-size:.78em;color:#333;line-height:1.5}',
      '.g112-workline.g112-solved{border-bottom-style:none}',
      '.g112-mark{color:#b32b2b;font-weight:bold;margin-left:1mm}',
      '.g112-wrong{color:inherit}',
      // 틀린 결과(✗) 뒤에 바르게 고친 답을 쓰는 네모 칸
      '.g112-arrow{margin:0 1.2mm 0 1.6mm;color:#555}',
      '.g112-ansbox{display:inline-flex;align-items:center;justify-content:center;min-width:15mm;height:11mm;border:1px solid #666;border-radius:1mm;background:#fbfbfb;vertical-align:middle}',
      '.g112-work{align-self:stretch}',
      '.g112-fixline{justify-content:center;margin-top:1mm}',
      '.g112-note{font-size:9pt;color:#555;margin-top:.8mm;text-align:center;min-height:1.2em}',
      '.g112-block.g112-fill{height:calc(100% - 3mm);width:100%}',
      '.g112-fill>.g112-line{justify-content:center}',
      '.g112-work{flex:1;min-height:22mm;margin-top:1.2mm;border:1px solid #ccc;border-radius:1mm;padding:1.2mm}',
      '.g112-work.g112-solved{border-style:dashed}',
      '.g112-solvedrow{margin-top:1mm}.g112-solved-line{font-size:.9em;color:#111;line-height:1.35}'
    ].join('');
    document.head.appendChild(style);
  }

  function renderHorizontal(cell, item, answer) {
    css();
    cell.insertAdjacentHTML('beforeend', '<div class="g112-block"><div class="g112-line">' + expressionHTML(item)
      + '<span class="g112-op">=</span>' + (answer ? fracHTML(item.answer) : blankHTML) + '</div>'
      + '<div class="g112-workline' + (answer ? ' g112-solved' : '') + '">'
      + (answer ? processHTML(item) : '') + '</div></div>');
  }
  /** 단계별 빈칸: 공통분모 D 는 보여 주고, 통분한 분자와 정리한 답을 빈칸으로 둔다.
      대분수는 자연수 부분의 합을 미리 보여 준다(2 3/4 + 1 5/6 = 3 + □/12 = □). */
  function renderSteps(cell, item, answer) {
    css();
    const slot = '<span class="g112-frac"><span class="g112-num' + (answer ? '' : ' g112-empty') + '">'
      + (answer ? item.slotNum : '') + '</span><span>' + item.D + '</span></span>';
    const lead = item.wholeStyle
      ? '<span class="g112-whole">' + item.wholeSum + '</span><span class="g112-op">+</span>' : '';
    cell.insertAdjacentHTML('beforeend', '<div class="g112-block"><div class="g112-line">' + expressionHTML(item)
      + '<span class="g112-op">=</span>' + lead + slot
      + '<span class="g112-op">=</span>' + (answer ? fracHTML(item.answer) : blankHTML) + '</div></div>');
  }
  function renderErrors(cell, item, answer) {
    css();
    cell.insertAdjacentHTML('beforeend',
      '<div class="g112-block g112-fill"><div class="g112-line">' + expressionHTML(item) + '<span class="g112-op">=</span>'
      + '<span class="g112-wrong">' + fracHTML(item.wrong) + '</span></div>'
      + '<div class="g112-work' + (answer ? ' g112-solved' : '') + '">'
      + (answer ? '<div class="g112-solved-line">' + solutionHTML(item) + '</div>' : '') + '</div></div>');
  }
  const el = (tag, className, html) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (html != null) node.innerHTML = html;
    return node;
  };
  /** 선 잇기 한 묶음. 공용 렌더러와 같은 틀을 쓰되 오른쪽에 대응 번호를 찍지 않는다
      (오른쪽에 왼쪽 번호를 찍으면 그 번호만 보고 답을 이을 수 있다). */
  function renderMatchBundle(item, isAnswer) {
    const count = item.pairs.length;
    const wrap = el('div', 'mt-pairs-wrap');
    const grid = el('div', 'mt-pairs');
    grid.style.gridTemplateRows = 'repeat(' + count + ', minmax(0, 1fr))';
    const rowOf = [];
    item.order.forEach((pairIndex, row) => { rowOf[pairIndex] = row; });
    item.pairs.forEach((pair, index) => {
      const right = item.pairs[item.order[index]];
      grid.append(el('div', 'mt-pair mt-left', '<span class="mt-idx">' + (index + 1)
        + '.</span><span class="mt-text">' + root.MatchingSheet.valueHTML(pair[0]) + '</span><span class="mt-mark"></span>'));
      grid.append(el('div', 'mt-pair mt-right', '<span class="mt-mark"></span><span class="mt-text">'
        + root.MatchingSheet.valueHTML(right[1]) + '</span>'));
    });
    wrap.append(grid);
    if (isAnswer) {
      const lines = item.pairs.map((unused, index) => {
        const from = ((index + 0.5) / count * 1000).toFixed(1);
        const to = ((rowOf[index] + 0.5) / count * 1000).toFixed(1);
        return '<line x1="420" y1="' + from + '" x2="580" y2="' + to + '"/>';
      }).join('');
      wrap.append(el('div', 'mt-lines', '<svg viewBox="0 0 1000 1000" preserveAspectRatio="none">' + lines + '</svg>'));
    }
    return wrap;
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
    if (!concept) throw Error('묶음 1-1-2 의 개념이 아닙니다: ' + config.typeId);
    const kind = kindOf(config);
    const count = config.count || (config.cols * config.rows) || 0;
    const seed = seedFor(config);
    const key = [concept.id, kind, seed, count].join('|');
    if (cache.has(key)) return cache.get(key);
    const items = kind === 'matching'
      ? matchingBundles(config, concept, seed, count)
      : (kind === 'errors' ? withErrors(concept, select(concept, seed, count))
        : select(concept, seed, count));
    cache.set(key, items);
    return items;
  }
  const isOurs = config => !!(config && config.typeId
    && entries.some(entry => entry.typeId === config.typeId));

  /* ---------------------------------------------------------------- 10. 연결 */
  if (root.SheetGen && typeof root.SheetGen.generate === 'function' && !root.SheetGen.g112) {
    const base = root.SheetGen.generate;
    root.SheetGen.generate = function (config) {
      if (isOurs(config)) return generate(config);
      return base.apply(this, arguments);
    };
    Object.defineProperty(root.SheetGen, 'g112', { value: true });
  }
  if (root.Sheet && typeof root.Sheet.register === 'function') {
    const install = (format, render) => {
      try { root.Sheet.register(format, render); }
      catch (error) { console.warn('g1-1-2 서식 등록 실패: ' + format, error); }
    };
    install(FMT.horizontal, (cell, item, answer) => renderHorizontal(cell, item, answer));
    install(FMT.steps, (cell, item, answer) => renderSteps(cell, item, answer));
    install(FMT.errors, (cell, item, answer) => renderErrors(cell, item, answer));
  }
  // 선 잇기는 공용 선 잇기 쪽 틀(묶음·줄·정답 선)을 쓰고 이 묶음용 키만 더한다.
  if (root.MatchingSheet && root.MatchingSheet.formats && root.MatchingSheet.formats['matching-lines']) {
    root.MatchingSheet.formats[FMT.matching] = {
      page: 'blocks',
      title: '계산 결과 연결하기',
      build: config => { css(); return matchingBundles(config, conceptOf(config), seedFor(config), config.count); },
      render: (config, item, isAnswer) => {
        // 동그라미를 식·결과 바로 옆에 붙인 2단 배치(compact)
        item.compact = true; item.compactWl = 30; item.compactWr = 14; item.compactGap = 12;
        return root.MatchingSheet.formats['matching-lines'].render(config, item, isAnswer);
      }
    };
  }

  root.G112Sheet = {
    concepts: CONCEPTS, entries, formats: FMT, generate,
    parse, display, relationOk, wrongText, applicable,
    /** 검수용: 개념 조건과 정답을 스스로 다시 확인한다. */
    selfTest(seeds) {
      const report = { sheets: 0, items: 0, kinds: {}, minCount: {} };
      for (const seed of seeds || [1, 7, 42]) for (const concept of CONCEPTS) {
        for (const spec of TYPE_SPEC) {
          const config = entries.find(entry => entry.typeId === concept.id + '-' + spec.suffix);
          const items = generate(Object.assign({}, config, { seed }));
          const flat = spec.kind === 'matching' ? items.items.flatMap(bundle => bundle.pairs) : items;
          if (!flat.length) throw Error(config.typeId + ': 문항이 없습니다.');
          report.minCount[config.typeId] = Math.min(report.minCount[config.typeId] === undefined
            ? Infinity : report.minCount[config.typeId], spec.kind === 'matching' ? config.count : items.length);
          if (spec.kind !== 'matching') {
            const keys = new Set();
            for (const item of items) {
              if (keys.has(item.a + ':' + item.b)) throw Error(config.typeId + ': 같은 문제가 두 번 나왔습니다.');
              keys.add(item.a + ':' + item.b);
              if (item.A.form !== concept.forms[0] || item.B.form !== concept.forms[1]) {
                throw Error(config.typeId + ': 분수 모양이 개념과 다릅니다.');
              }
              if (!relationOk(concept.relation, item.A.d, item.B.d)) {
                throw Error(config.typeId + ': 두 분모가 개념이 정한 관계가 아닙니다.');
              }
              if (item.D !== lcm(item.A.d, item.B.d)) throw Error(config.typeId + ': 공통분모가 틀립니다.');
              if (item.sum !== item.fracSum + item.wholeSum * item.D) {
                throw Error(config.typeId + ': 통분한 분자의 합이 틀립니다.');
              }
              if (item.answer !== display(item.sum, item.D)
                || item.answer !== display(item.A.n * item.B.d + item.B.n * item.A.d, item.A.d * item.B.d)) {
                throw Error(config.typeId + ': 정답이 틀립니다.');
              }
              if (spec.kind === 'errors') {
                if (!item.note || !item.wrong) throw Error(config.typeId + ': 틀린 풀이가 없습니다.');
                if (item.wrong === item.answer) throw Error(config.typeId + ': 틀린 풀이가 정답과 같은 모양입니다.');
                if (SHAPE_ERROR[item.errorKind] ? !sameValue(item.wrong, item.answer)
                  : sameValue(item.wrong, item.answer)) {
                  throw Error(config.typeId + ': ' + item.errorKind + ' 틀린 풀이의 값이 어긋납니다.');
                }
                report.kinds[item.errorKind] = (report.kinds[item.errorKind] || 0) + 1;
              }
            }
          } else {
            const answers = new Set();
            for (const bundle of items.items) {
              if (bundle.pairs.length < 6) throw Error(config.typeId + ': 한 묶음의 쌍이 6개 미만입니다.');
              if (bundle.order.every((value, index) => value === index)) {
                throw Error(config.typeId + ': 오른쪽이 왼쪽과 같은 순서입니다.');
              }
              for (const pair of bundle.pairs) {
                if (answers.has(pair[1].value)) throw Error(config.typeId + ': 연결 결과가 겹칩니다.');
                answers.add(pair[1].value);
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
