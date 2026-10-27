(function (root) {
  'use strict';

  /* ===================== 묶음 0-2-0 · 뺄셈 준비 (제작자 A) =====================
     개념 4개 × 유형 3개 = 12개 typeId. 한 장 = 한 유형, 가로·세로를 섞지 않는다.
     모든 난수는 seed(과 typeId)에서만 나오므로 같은 seed 면 같은 문제지가 나온다.

     문제는 사이트 기존 생성기(Worksheets.generate)에서 뽑아 개념 조건에 맞는 것만 남긴다.
     조건에 맞는 고유 문항은 개념마다 100개 이상이므로 layout-rules §2 의 서식별 최소
     문항 수를 중복 없이 채운다.
       · 덜어 내는 상황(0-2-0-0): 2≤a≤20, 1≤b≤a-1   (자연수 뺄셈 'subtract-small'·'natural-sub-2-1')
       · 두 양의 차(0-2-0-1):      4≤a≤20, 2≤b≤a-2
       · 수직선 뒤로 세기(0-2-0-2): 2≤a≤20, 1≤b≤9, a-b≥1
       · 덧셈과 뺄셈의 관계(0-2-0-3): 2≤a,b, a+b≤20   (자연수 덧셈 'add-small')
     2022 개정 초등 범위(음수 없음, 0~20) 안이며 결과는 항상 0 이상이다.

     문항 수 근거(layout-rules §2, 15~16pt 선행 학습 단계는 한 단계 낮춘 값):
       · 그림이 있는 유형(고르기·그림식·수직선): 3단×5줄=15 이상
       · 수직선은 눈금 이름을 읽을 수 있게 2단×8줄=16
       · 문장제: 2단×12줄=24 (§2 에 문장제 줄이 없어 '가로셈 긴 식'에서 한 단계 낮춤)
       · 선 잇기: 3묶음×8쌍=24쌍
       · 짝이 되는 식 쓰기: 4단×15줄=60 (가로셈 짧은 식 최소 기준)
       · 역연산 빈칸: 3단×14줄=42 (빈칸 식 최소 기준)

     서식 9종(g020-*)은 이 파일 안에만 둔다. 공용 파일(sheet.js, formats-*.js)은 고치지 않는다.
     선 잇기만 formats-matching.js 가 안내하는 방식대로 MatchingSheet.formats 에 붙인다.
     문제지에는 답을 인쇄하지 않는다(정답지에서만 빈칸을 채운다).
  ============================================================================= */

  const BUNDLE = '0-2-0';
  const NBSP = ' ';

  /* ---------- 1. 개념 정의: worksheet-types.json 이름과 spec-*.json params 그대로 ---------- */

  const CONCEPTS = {
    '0-2-0-0': {
      name: '덜어 내는 상황과 뺄셈식 연결',
      short: '덜어 내기',
      kind: 'take',
      legacyIds: ['subtract-small', 'natural-sub-2-1'],
      accept: (a, b) => Number.isInteger(a) && Number.isInteger(b) && a >= 2 && a <= 20 && b >= 1 && b <= a - 1,
      easy: fact => fact.b <= 1 || fact.a - fact.b <= 1,
      sortKey: fact => fact.a * 10 + fact.b,
      labels: ['처음 수', '덜어 낸 수', '남은 수'],
      note: '처음 수에서 덜어 낸 수만큼 없애고 남은 수를 구한다(0~20)'
    },
    '0-2-0-1': {
      name: '두 양의 차와 뺄셈식 연결',
      short: '두 양의 차',
      kind: 'diff',
      legacyIds: ['subtract-small', 'natural-sub-2-1'],
      accept: (a, b) => Number.isInteger(a) && Number.isInteger(b) && a >= 4 && a <= 20 && b >= 2 && b <= a - 2,
      easy: fact => fact.b <= 2 || fact.a - fact.b <= 2 || fact.a <= 5,
      sortKey: fact => fact.a * 10 + fact.b,
      labels: ['많은 수', '적은 수', '차'],
      note: '두 양을 견주어 많은 쪽에서 적은 쪽을 빼 차를 구한다(0~20)'
    },
    '0-2-0-2': {
      name: '수직선에서 뒤로 세기',
      short: '수직선',
      kind: 'line',
      legacyIds: ['subtract-small', 'natural-sub-2-1'],
      accept: (a, b) => Number.isInteger(a) && Number.isInteger(b) && a >= 2 && a <= 20 && b >= 1 && b <= 9 && a - b >= 1,
      easy: fact => fact.b <= 1 || fact.a - fact.b <= 1,
      sortKey: fact => fact.a * 10 + fact.b,
      labels: ['시작한 수', '뒤로 간 칸', '도착한 수'],
      note: '0~20 수직선에서 한 칸씩 뒤로 세어 도착한 수를 찾는다'
    },
    '0-2-0-3': {
      name: '덧셈과 뺄셈의 관계',
      short: '덧뺄셈 관계',
      kind: 'inverse',
      legacyIds: ['add-small'],
      accept: (a, b) => Number.isInteger(a) && Number.isInteger(b) && a >= 2 && b >= 2 && a + b >= 4 && a + b <= 20,
      easy: fact => fact.a <= 1 || fact.b <= 1,
      sortKey: fact => (fact.a + fact.b) * 100 + Math.min(fact.a, fact.b),
      labels: ['한 부분', '다른 부분', '전체'],
      note: '한 덧셈식에서 두 뺄셈식을 이끌어 내는 역연산 관계(합 20 이하)'
    }
  };

  /* ---------- 2. 난수와 정렬 ---------- */

  function random(seed) {
    let s = seed >>> 0;
    return (a, b) => {
      s += 0x6d2b79f5;
      let t = s;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return a + Math.floor(((t ^ t >>> 14) >>> 0) / 4294967296 * (b - a + 1));
    };
  }

  function shuffled(items, seed) {
    const rnd = random(seed), out = items.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = rnd(0, i);
      const swap = out[i]; out[i] = out[j]; out[j] = swap;
    }
    return out;
  }

  function hashText(text) {
    let h = 2166136261;
    for (const ch of String(text)) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }

  /* ---------- 3. 기존 생성기에서 조건에 맞는 문제만 뽑기 ---------- */

  function collectFacts(concept, seed, want) {
    if (!root.Worksheets || typeof root.Worksheets.generate !== 'function') throw Error('기존 Worksheets 생성기를 찾지 못했습니다.');
    const found = new Map();
    const ids = concept.legacyIds;
    // 기존 생성기의 유한한 풀을 넘기지 않게 32개씩 여러 번 뽑아 조건에 맞는 것만 모은다.
    for (let batch = 0; batch < 900 && found.size < want; batch++) {
      ids.forEach((legacyId, index) => {
        let rows;
        try { rows = root.Worksheets.generate(legacyId, (seed + Math.imul(batch, 2654435761) + index * 7919) >>> 0, 32); }
        catch (error) { throw Error(concept.name + ': 기존 생성기 실패 - ' + error.message); }
        for (const raw of rows) {
          const a = Number(raw.a), b = Number(raw.b);
          if (!concept.accept(a, b)) continue;
          // 덧셈·뺄셈 관계(0-2-0-3)는 두 부분 a·b 와 전체 a+b 를 함께 들고 다닌다.
          const answer = concept.kind === 'inverse' ? a + b : a - b;
          const key = a + ':' + b;
          if (!found.has(key)) found.set(key, { a, b, op: concept.kind === 'inverse' ? '+' : '−', answer });
        }
      });
    }
    return found;
  }

  // 조건에 맞는 고유 문항을 고르게 뽑아 쉬운 것 → 어려운 것 순서로 돌려준다.
  // 0·1이 들어가는 쉬운 문항은 §2 에 따라 10% 이하로만 쓴다.
  function pickFacts(concept, seed, need) {
    const facts = collectFacts(concept, seed, need * 6 + 60);
    if (facts.size < need) throw Error(concept.name + ': 조건에 맞는 고유 문항이 ' + facts.size + '개뿐입니다(필요 ' + need + '개).');
    const order = shuffled([...facts.keys()], seed ^ 0x2f6e2b1);
    const easyLimit = Math.floor(need * 0.1);
    const picked = [], used = new Set();
    let easy = 0;
    for (const key of order) {
      if (picked.length >= need) break;
      const fact = facts.get(key);
      if (concept.easy(fact) && easy >= easyLimit) continue;
      if (concept.easy(fact)) easy++;
      used.add(key); picked.push(fact);
    }
    for (const key of order) {                    // 쉬운 문항이 모자랄 때만 (풀이 작은 개념)
      if (picked.length >= need) break;
      if (used.has(key)) continue;
      used.add(key); picked.push(facts.get(key));
    }
    picked.sort((x, y) => concept.sortKey(x) - concept.sortKey(y));
    return picked;
  }

  /* ---------- 4. 유형 정의(단·줄·문항 수) ---------- */

  const INSTRUCTION = {
    choose: '그림을 보고 알맞은 식을 골라 ○표 하세요.',
    picture: '그림을 보고 □ 안에 알맞은 수를 써넣으세요.',
    word: '문제를 읽고 식과 답을 쓰세요.',
    line: '점에서 화살표만큼 뒤로 갔을 때의 수를 쓰세요.',
    match: '이동한 칸 수와 알맞은 식을 선으로 연결하세요.',
    mark: '식에 맞게 수직선 위에 이동을 표시하세요.',
    pair: '덧셈식과 짝이 되는 뺄셈식을 쓰세요.',
    factpic: '그림을 보고 식을 완성하세요.',
    blank: '빈칸에 알맞은 수를 써넣으세요.'
  };

  // 개념 × t1~t3 → 작업 이름·서식·단×줄. cols × rows = 한 쪽 문항 수(autoFit 을 끄고 이 값으로만 배치한다).
  const TYPE_TABLE = {
    '0-2-0-0': { fontPt: 14, t1: ['choose', 'g020-choose', 3, 6], t2: ['picture', 'g020-picture', 3, 6], t3: ['word', 'g020-word', 2, 12] },
    '0-2-0-1': { fontPt: 14, t1: ['choose', 'g020-choose', 3, 6], t2: ['picture', 'g020-picture', 3, 6], t3: ['word', 'g020-word', 2, 8] },
    '0-2-0-2': { fontPt: 14, t1: ['line', 'g020-line', 2, 8], t2: ['match', 'g020-match', 8, 4], t3: ['mark', 'g020-mark', 2, 8] },
    '0-2-0-3': { fontPt: 17, t1: ['pair', 'g020-pair', 4, 15], t2: ['factpic', 'g020-factpic', 3, 5], t3: ['blank', 'g020-blank', 3, 14] }
  };
  // 머리말은 한 줄(§1)이라 제목이 길면 잘린다. 개념 짧은 이름 · 유형 짧은 이름으로 줄여
  // 문제지·정답지(' · 정답' 포함) 모두에서 잘리지 않게 한다(명세의 유형 이름은 activity 로 보존).
  const TASK_TITLE = {
    '0-2-0-0': { t1: '식 고르기', t2: '그림과 식', t3: '상황과 식' },
    '0-2-0-1': { t1: '식 고르기', t2: '그림과 식', t3: '상황과 식' },
    '0-2-0-2': { t1: '이동 끝 수', t2: '칸 수 연결', t3: '이동 표시' },
    '0-2-0-3': { t1: '짝 식 쓰기', t2: '그림과 식', t3: '빈칸 채우기' }
  };
  // worksheet-types.json 의 유형 이름(검수·명세 대조용, 머리말에는 짧은 이름을 쓴다).
  const FULL_TITLE = {
    '0-2-0-0': { t1: '그림 상황에 맞는 식 고르기', t2: '그림을 보고 식 완성하기', t3: '짧은 상황을 식으로 나타내기' },
    '0-2-0-1': { t1: '그림 상황에 맞는 식 고르기', t2: '그림을 보고 식 완성하기', t3: '짧은 상황을 식으로 나타내기' },
    '0-2-0-2': { t1: '수직선의 이동 끝 수 쓰기', t2: '이동한 칸 수와 식 연결하기', t3: '식에 맞는 이동 표시하기' },
    '0-2-0-3': { t1: '같은 수로 짝이 되는 식 쓰기', t2: '그림 하나에 연결된 식 완성하기', t3: '역연산 관계의 빈칸 채우기' }
  };

  const TYPES = [];
  Object.keys(CONCEPTS).forEach((conceptId, conceptIndex) => {
    const concept = CONCEPTS[conceptId], table = TYPE_TABLE[conceptId];
    ['t1', 't2', 't3'].forEach((key, keyIndex) => {
      const [task, format, cols, rows] = table[key];
      TYPES.push({
        typeId: conceptId + '-' + key,
        conceptId,
        title: concept.short + ' · ' + TASK_TITLE[conceptId][key],
        fullTitle: concept.name + ' · ' + FULL_TITLE[conceptId][key],
        instruction: INSTRUCTION[task],
        format,
        cols, rows, count: cols * rows,
        fontPt: format === 'g020-match' ? 12 : table.fontPt,   // 선 잇기 글자는 .g020-match-text 가 따로 정한다
        seed: 20261001 + conceptIndex * 137 + keyIndex * 7,
        autoFit: false,
        gen: { bundle: BUNDLE, concept: conceptId, task, legacyIds: concept.legacyIds }
      });
    });
  });

  /* ---------- 5. 상황 문장(짧은 상황을 식으로 나타내기) ---------- */

  const TAKE_STORIES = [
    { text: (a, b) => `사과가 ${a}개 있었는데 ${b}개를 먹었습니다.`, tail: '남은 사과는 몇 개일까요?', unit: '개' },
    { text: (a, b) => `풍선이 ${a}개 있었는데 ${b}개가 터졌습니다.`, tail: '남은 풍선은 몇 개일까요?', unit: '개' },
    { text: (a, b) => `구슬 ${a}개 중에서 ${b}개를 잃어버렸습니다.`, tail: '남은 구슬은 몇 개일까요?', unit: '개' },
    { text: (a, b) => `종이배 ${a}개 중에서 ${b}개를 동생에게 주었습니다.`, tail: '남은 종이배는 몇 개일까요?', unit: '개' },
    { text: (a, b) => `연필이 ${a}자루 있었는데 ${b}자루를 빌려주었습니다.`, tail: '남은 연필은 몇 자루일까요?', unit: '자루' },
    { text: (a, b) => `상자에 초콜릿이 ${a}개 있었는데 ${b}개를 꺼냈습니다.`, tail: '남은 초콜릿은 몇 개일까요?', unit: '개' }
  ];
  // 묻는 말은 '몇 개/몇 cm 더 많은가'로 하고(답이 수 하나로 정해진다), 두 양은 문장에서 밝힌다.
  // 문장 + 물음이 두 줄을 넘지 않도록 40자 안팎으로 짧게 쓴다(칸 높이 2단×12줄 기준).
  const DIFF_STORIES = [
    { text: (a, b) => `민준이는 사탕 ${a}개, 지우는 ${b}개를 가졌습니다.`, tail: '사탕은 몇 개 더 많을까요?', unit: '개' },
    { text: (a, b) => `빨간 리본은 ${a}cm, 파란 리본은 ${b}cm입니다.`, tail: '몇 cm 더 길까요?', unit: 'cm' },
    { text: (a, b) => `1반은 공 ${a}개, 2반은 ${b}개를 모았습니다.`, tail: '1반은 몇 개 더 많을까요?', unit: '개' },
    { text: (a, b) => `큰 상자에 ${a}개, 작은 상자에 ${b}개가 들었습니다.`, tail: '큰 상자는 몇 개 더 많을까요?', unit: '개' },
    { text: (a, b) => `언니는 구슬 ${a}개, 동생은 ${b}개를 가졌습니다.`, tail: '언니는 몇 개 더 많을까요?', unit: '개' }
  ];

  /* ---------- 6. 유형별 문항 만들기 ---------- */

  function decorate(config, concept, fact, index, seed) {
    const task = (config.gen || {}).task;
    const rnd = random((seed ^ hashText(config.typeId) ^ Math.imul(index + 1, 2654435761)) >>> 0);
    const item = { ...fact, concept: concept.name, kind: concept.kind };
    const a = fact.a, b = fact.b, c = fact.answer;
    if (task === 'choose') {
      // 그림에 맞는 식 고르기: 정답 식 하나와, 합으로 보는 실수·차를 다시 빼는 실수를 섞는다.
      const correct = `${a} − ${b}`;
      const others = [`${a} + ${b}`, `${a} − ${c}`, `${c} + ${b}`];
      const distractors = [];
      for (const text of others) {
        if (text === correct || distractors.includes(text)) continue;
        distractors.push(text);
        if (distractors.length === 2) break;
      }
      if (distractors.length !== 2) throw Error(config.typeId + ': 고르기 오답을 만들지 못했습니다(' + correct + ').');
      item.options = shuffled([{ text: correct, ok: true }, ...distractors.map(text => ({ text, ok: false }))],
        (seed ^ hashText(config.typeId + ':' + index)) >>> 0);
      item.correctText = correct;
      item.prompt = concept.kind === 'take' ? '덜어 내는 식을 고르세요.' : '두 수의 차를 구하는 식을 고르세요.';
    } else if (task === 'word') {
      const pool = concept.kind === 'take' ? TAKE_STORIES : DIFF_STORIES;
      const storyIndex = rnd(0, pool.length - 1);
      item.storyIndex = storyIndex;
      const story = pool[storyIndex];
      item.sentence = story.text(a, b);
      item.question = story.tail;
      item.unit = story.unit;
      item.answerText = `${c}${story.unit}`;
      item.equationText = `${a} − ${b} = ${c}`;
    } else if (task === 'pair') {
      // 덧셈식과 짝이 되는 뺄셈식: 전체에서 한 부분을 빼면 다른 부분이 남는다.
      const given = `${a} + ${b} = ${c}`;
      const askFirst = index % 2 === 0;
      item.given = given;
      item.ask = askFirst ? `${c} − ${a} = ` : `${c} − ${b} = `;
      item.blank = askFirst ? b : a;
    } else if (task === 'blank') {
      // 역연산 관계의 빈칸: 두 식 모두 같은 수가 답이 되도록 세 가지 모양을 돌려 쓴다.
      const pattern = index % 3;
      item.pattern = pattern;
      if (pattern === 0) item.lines = [`□ + ${b} = ${c}`, `${c} − ${b} = □`];
      else if (pattern === 1) item.lines = [`${a} + □ = ${c}`, `${c} − □ = ${a}`];
      else item.lines = [`${a} + ${b} = □`, `□ − ${b} = ${a}`];
      item.blanks = pattern === 0 ? [a, a] : pattern === 1 ? [b, b] : [c, c];
    }
    return item;
  }

  function questionsFor(config) {
    const gen = config.gen || {};
    const concept = CONCEPTS[gen.concept];
    if (!concept) throw Error('묶음 0-2-0에 없는 개념입니다: ' + gen.concept);
    const count = config.count || config.cols * config.rows;
    const seed = (Number(config.seed) || 1) >>> 0;
    const facts = pickFacts(concept, seed, count);
    if (facts.length !== count) throw Error(config.typeId + ': 문항 ' + count + '개를 채우지 못했습니다.');
    return facts.map((fact, index) => decorate(config, concept, fact, index, seed));
  }

  /* ---------- 7. 선 잇기 묶음 ---------- */

  function matchBundles(config) {
    const concept = CONCEPTS[(config.gen || {}).concept];
    if (!concept) throw Error('묶음 0-2-0에 없는 개념입니다: ' + (config.gen || {}).concept);
    const seed = (Number(config.seed) || 1) >>> 0;
    const bundles = Math.max(1, Math.min(8, config.cols || 8));   // 2단 × 4줄 = 8묶음
    const per = Math.max(4, Math.min(5, config.rows || 4));       // 묶음당 4문제
    const facts = pickFacts(concept, seed, bundles * per);
    const items = [];
    for (let index = 0; index < bundles; index++) {
      const chunk = facts.slice(index * per, (index + 1) * per);
      let order = shuffled(chunk.map((_, i) => i), (seed + index * 977) >>> 0);
      // 제자리 짝(수평선)은 정답을 드러내므로 서로 맞바꾸어 없앤다.
      for (let i = 0; i < order.length; i++) {
        if (order[i] !== i) continue;
        const j = (i + 1) % order.length, swap = order[i]; order[i] = order[j]; order[j] = swap;
      }
      items.push({ kind: 'bundle', compact: true, compactWl: 44, compactWr: 13, compactGap: 8, caption: '', pairs: chunk, order, rowsWeight: per });
    }
    return { items, layout: { cols: bundles, rows: per, count: facts.length } };
  }

  /* ---------- 8. 그림 도구 (이 묶음 전용, 인쇄용 흑백 SVG) ---------- */

  const esc = value => String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const SVG_HEAD = '<svg viewBox="0 0 200 %H%" preserveAspectRatio="xMidYMid meet" aria-hidden="true" shape-rendering="geometricPrecision">%BODY%</svg>';
  const frame = (height, body) => SVG_HEAD.replace('%H%', String(height)).replace('%BODY%', body);
  const line = (x1, y1, x2, y2, weight) => `<path d="M${x1} ${y1}L${x2} ${y2}" fill="none" stroke="#111" stroke-width="${weight || 1.2}"/>`;
  const rect = (x, y, w, h, extra) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" ${extra || ''}/>`;
  const dotIcon = (cx, cy, r) => '<image href="vendor/art/' + (globalThis.IconPool ? globalThis.IconPool.current() : '1f34e') + '.svg" x="' + (Number(cx) - r * 1.3).toFixed(1) + '" y="' + (Number(cy) - r * 1.3).toFixed(1) + '" width="' + (r * 2.6).toFixed(1) + '" height="' + (r * 2.6).toFixed(1) + '" style="filter:saturate(2) contrast(1.2) brightness(.92) drop-shadow(0 0 .7px #222)"/>';
  const dot = (cx, cy, r, extra) => !extra && r >= 4.5 ? dotIcon(cx, cy, r) : `<circle cx="${cx}" cy="${cy}" r="${r}" ${extra || 'fill="#111"'}/>`;
  const text = (x, y, value, size, anchor) => `<text x="${x}" y="${y}" text-anchor="${anchor || 'middle'}" font-size="${size || 9}" fill="#111">${esc(value)}</text>`;

  // 십 모형 한 판(5×2). ox·oy 는 판의 왼쪽 위.
  const FRAME_SLOT = 22, FRAME_W = FRAME_SLOT * 5, FRAME_H = FRAME_SLOT * 2;
  function tenFrame(ox, oy, states) {
    let body = '';
    for (let index = 0; index < 10; index++) {
      const col = index % 5, row = Math.floor(index / 5);
      const x = ox + col * FRAME_SLOT, y = oy + row * FRAME_SLOT;
      const cx = x + FRAME_SLOT / 2, cy = y + FRAME_SLOT / 2;
      body += rect(x + 1, y + 1, FRAME_SLOT - 2, FRAME_SLOT - 2, 'fill="none" stroke="#c9c9c9" stroke-width="0.9"');
      const state = states[index];
      if (state === 1) body += dot(cx, cy, 6.4);
      else if (state === 2) {
        const r = 6.8;
        body += dot(cx, cy, r, 'fill="none" stroke="#111" stroke-width="1.2"');
        body += line(cx - r * 0.7, cy - r * 0.7, cx + r * 0.7, cy + r * 0.7, 1.2);
        body += line(cx + r * 0.7, cy - r * 0.7, cx - r * 0.7, cy + r * 0.7, 1.2);
      }
    }
    return body;
  }
  const statesFor = (filled, crossed) => Array.from({ length: 10 }, (_, index) =>
    index >= filled ? 0 : index >= filled - crossed ? 2 : 1);
  // 20칸(십 모형 두 판을 위아래로). filled 까지 채우고 그중 마지막 crossed 개에 X 를 그린다.
  function tenStrip(filled, crossed) {
    const GAP = 9;
    return frame(FRAME_H * 2 + GAP + 8,
      tenFrame(45, 4, statesFor(Math.min(filled, 10), Math.max(0, crossed - Math.max(0, filled - 10))))
      + tenFrame(45, FRAME_H + GAP + 4, statesFor(Math.max(0, filled - 10), Math.min(crossed, Math.max(0, filled - 10)))));
  }

  // 두 양을 견주는 그림: 가·나 두 세로줄에 각각 a·b 개(10개마다 한 판).
  function twoGroupStrip(a, b) {
    // 두 10칸 판을 각각 끝까지 보이게 하고, 2판(20개)도 한 문항 칸에 들어오게 줄인다.
    const slot = 16, width = 180, height = 90;
    const column = (x, count, label) => {
      let body = text(x + 4, 10, label, 10, 'start');
      for (let panel = 0; panel < Math.ceil(count / 10); panel++) {
        for (let index = 0; index < 10; index++) {
          const px = x + index % 5 * slot, py = 16 + panel * 36 + Math.floor(index / 5) * slot;
          body += rect(px + .5, py + .5, slot - 1, slot - 1, 'fill="none" stroke="#aaa" stroke-width=".7"');
          if (panel * 10 + index < count) body += dot(px + slot / 2, py + slot / 2, 4.8);
        }
      }
      return body;
    };
    return `<svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet" aria-hidden="true" shape-rendering="geometricPrecision">${column(4, a, '가')}${column(96, b, '나')}</svg>`;
  }

  // 한 그림을 두 부분으로 가르기: 앞 a 개는 색칠, 뒤 b 개는 빈 동그라미(5개씩 한 줄).
  function splitStrip(a, b) {
    const SLOT = 22, R = 6.4, total = a + b, rows = Math.max(1, Math.ceil(total / 5));
    const width = Math.min(5, Math.max(1, total)) * SLOT, x0 = (200 - width) / 2;
    let body = '';
    for (let index = 0; index < total; index++) {
      const x = x0 + (index % 5) * SLOT, y = 4 + Math.floor(index / 5) * SLOT;
      const cx = x + SLOT / 2, cy = y + SLOT / 2;
      body += rect(x + 1, y + 1, SLOT - 2, SLOT - 2, 'fill="none" stroke="#c9c9c9" stroke-width="0.9"');
      body += index < a ? dot(cx, cy, R) : dot(cx, cy, R, 'fill="none" stroke="#111" stroke-width="1.4"');
    }
    return frame(rows * SLOT + 8, body);
  }

  // 0~20 수직선. dot: 시작 수, back: 뒤로 간 칸, answer: 도착 표시, landing: 도착 눈금 강조
  function numberLineSvg(options) {
    const o = options || {};
    const X0 = 10, X1 = 190, Y = 24, MAX = 20;
    const x = value => X0 + (X1 - X0) * value / MAX;
    let body = line(X0, Y, X1, Y, 1.4);
    for (let value = 0; value <= MAX; value++) {
      body += line(x(value), Y - 2.6, x(value), Y + 2.6, value % 5 === 0 ? 1.2 : 0.7);
      body += text(x(value), Y + 12.5, String(value), 6.9);
    }
    if (o.markers) {
      for (const value of o.markers) body += line(x(value), Y - 6, x(value), Y + 4, 1.6);
    }
    const ink = o.red ? '#d71f10' : '#111';   // 아이가 직접 그리는 표시(이동 표시 유형)는 정답지에서 빨강
    if (o.dot != null) body += dot(x(o.dot), Y, 3.4, `fill="${ink}"`);
    if (o.back > 0) {
      const from = o.dot, to = o.dot - o.back;
      const top = Y - 14 - Math.min(10, o.back);
      body += `<path d="M${x(from)} ${Y - 4}Q${(x(from) + x(to)) / 2} ${top} ${x(to)} ${Y - 4}" fill="none" stroke="${ink}" stroke-width="1.3"/>`;
      body += `<path d="M${x(to)} ${Y - 4}l3.4 3.2l-4.4 1.4z" fill="${ink}"/>`;
    }
    if (o.landing != null) body += dot(x(o.landing), Y, 3.4, 'fill="#fff" stroke="#d71f10" stroke-width="1.6"');
    return `<svg viewBox="0 4 200 36" preserveAspectRatio="xMidYMid meet" aria-hidden="true" shape-rendering="geometricPrecision">${body}</svg>`;
  }

  /* ---------- 9. 화면 만들기 ---------- */

  const node = (tag, className, value) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (value !== undefined) el.textContent = value;
    return el;
  };
  // 태그가 섞인 조각(연결 묶음)은 textContent 가 아니라 innerHTML 로 넣는다.
  const html = (tag, className, markup) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    el.innerHTML = markup;
    return el;
  };

  function blankBox(answer, value, extraClass) {
    const box = node('span', 'g020-blank' + (extraClass ? ' ' + extraClass : ''));
    if (answer) box.textContent = String(value);
    return box;
  }

  function figure(cell, svg) {
    const wrap = node('div', 'g020-figure');
    wrap.innerHTML = svg;
    cell.append(wrap);
    return wrap;
  }

  function equationRow(cell, parts) {
    const row = node('div', 'g020-eq');
    for (const part of parts) row.append(part);
    cell.append(row);
    return row;
  }

  const num = value => node('span', '', String(value));
  // 빈칸 아래에 이름을 붙인 칸(그림을 보고 식 완성하기) — 이름이 빈칸과 나란히 놓인다.
  function slot(answer, value, label) {
    const wrap = node('span', 'g020-slot');
    wrap.append(blankBox(answer, value));
    wrap.append(node('span', 'g020-label', label));
    return wrap;
  }

  /* 고르기: 그림 + 세 식 */
  function renderChoose(cell, q, answer, config) {
    css();
    const concept = CONCEPTS[(config.gen || {}).concept];
    if (concept.kind === 'diff') cell.classList.add('g020-diff');
    figure(cell, concept.kind === 'take' ? tenStrip(q.a, q.b) : twoGroupStrip(q.a, q.b));
    const options = node('div', 'g020-options');
    for (const option of q.options) {
      const item = node('span', 'g020-opt' + (answer && option.ok ? ' g020-picked' : ''), option.text);
      options.append(item);
    }
    cell.append(options);
  }

  /* 그림을 보고 식 완성하기 */
  function renderPicture(cell, q, answer, config) {
    css();
    const concept = CONCEPTS[(config.gen || {}).concept];
    if (concept.kind === 'diff') cell.classList.add('g020-diff');
    if (concept.kind === 'take') {
      figure(cell, tenStrip(q.a, q.b));
      equationRow(cell, [num(q.a), num('−'), slot(answer, q.b, concept.labels[1]), num('='), slot(answer, q.answer, concept.labels[2])]);
    } else {
      figure(cell, twoGroupStrip(q.a, q.b));
      equationRow(cell, [slot(answer, q.a, concept.labels[0]), num('−'), slot(answer, q.b, concept.labels[1]),
        num('='), slot(answer, q.answer, concept.labels[2])]);
    }
  }

  /* 짧은 상황을 식으로 나타내기 */
  function renderWord(cell, q, answer, config) {
    css();
    const sentence = node('div', 'g020-sentence', q.sentence + ' ' + q.question);
    cell.append(sentence);
    const row = node('div', 'g020-write-row');
    row.append(node('span', 'g020-tag', '(식)'));
    row.append(node('span', 'g020-write' + (answer ? ' g020-filled' : ''), answer ? q.equationText : NBSP));
    row.append(node('span', 'g020-tag', '(답)'));
    row.append(node('span', 'g020-write g020-write-short' + (answer ? ' g020-filled' : ''), answer ? q.answerText : NBSP));
    cell.append(row);
  }

  /* 수직선의 이동 끝 수 쓰기 */
  function renderLine(cell, q, answer) {
    css();
    figure(cell, numberLineSvg({ dot: q.a, back: q.b, landing: answer ? q.answer : null })).classList.add('g020-line-fig');
    const row = node('div', 'g020-eq');
    row.append(node('span', 'g020-tag', '답'));
    row.append(blankBox(answer, q.answer, 'g020-blank-wide'));
    cell.append(row);
  }

  /* 식에 맞는 이동 표시하기: 빈 수직선에 아이가 표시한다 */
  function renderMark(cell, q, answer) {
    css();
    const row = node('div', 'g020-eq g020-eq-ask');
    row.append(num(`${q.a} − ${q.b}`));
    cell.append(row);
    figure(cell, numberLineSvg(answer ? { dot: q.a, back: q.b, landing: q.answer, red: true } : {})).classList.add('g020-line-fig');
  }

  /* 같은 수로 짝이 되는 식 쓰기 */
  function renderPair(cell, q, answer) {
    css();
    cell.append(node('div', 'g020-given', q.given));
    const row = node('div', 'g020-eq');
    row.append(num(q.ask));
    row.append(blankBox(answer, q.blank, 'g020-blank-inline'));
    cell.append(row);
  }

  /* 그림 하나에 연결된 식 완성하기 */
  function renderFactPicture(cell, q, answer) {
    css();
    figure(cell, splitStrip(q.a, q.b));
    equationRow(cell, [num(q.a), num('+'), blankBox(answer, q.b), num('='), blankBox(answer, q.answer)]);
    equationRow(cell, [blankBox(answer, q.answer), num('−'), num(q.a), num('='), blankBox(answer, q.b)]);
  }

  /* 역연산 관계의 빈칸 채우기 */
  function renderBlank(cell, q, answer) {
    css();
    const blanks = q.blanks;
    const lines = q.lines;
    lines.forEach((text, index) => {
      const row = node('div', 'g020-eq g020-eq-left');
      for (const token of text.split(' ')) {
        if (token === '□') row.append(blankBox(answer, blanks[index === 0 ? 0 : 1], 'g020-blank-inline'));
        else row.append(num(token));
      }
      cell.append(row);
    });
  }

  /* ---------- 10. 선 잇기(0-2-0-2-t2) ---------- */

  function matchNumberLine(a, b) {
    const x = value => 8 + value * 9.2;
    let body = line(x(0), 15, x(20), 15, 1.2);
    for (let value = 0; value <= 20; value++) {
      body += line(x(value), value % 5 ? 12.5 : 10, x(value), 18, value % 5 ? .8 : 1.2);
      if (value % 5 === 0) body += text(x(value), 29, value, 10);
    }
    body += dot(x(a), 15, 3);
    body += `<path d="M${x(a)} 9 Q${(x(a) + x(a - b)) / 2} -3 ${x(a - b)} 9" fill="none" stroke="#111" stroke-width="1.3"/>`;
    body += `<path d="M${x(a - b)} 9 l3.6 2.6 -3.8 1.4z" fill="#111"/>`;
    return `<svg viewBox="0 -4 200 36" aria-hidden="true">${body}</svg>`;
  }

  function renderMatchBundle(config, item, isAnswer) {
    css();
    const valueHTML = root.MatchingSheet.valueHTML;
    const wrap = node('div', 'mt-pairs-wrap mt-compact');
    wrap.style.setProperty('--w', '15mm');
    wrap.style.setProperty('--wl', item.compactWl + 'mm');
    wrap.style.setProperty('--wr', item.compactWr + 'mm');
    wrap.style.setProperty('--gap', item.compactGap + 'mm');
    const grid = node('div', 'mt-pairs');
    const count = item.pairs.length;
    grid.style.gridTemplateRows = `repeat(${count}, minmax(0, 1fr))`;
    const rowOf = [];
    item.order.forEach((pairIndex, row) => { rowOf[pairIndex] = row; });
    item.pairs.forEach((pair, index) => {
      const right = item.pairs[item.order[index]];
      grid.append(html('div', 'mt-pair mt-left',
        `<span class="mt-idx">${index + 1}.</span><span class="mt-text g020-match-text"><span>${pair.a}에서 ${pair.b}칸 뒤로</span>${matchNumberLine(pair.a, pair.b)}</span><span class="mt-mark"></span>`));
      // 오른쪽에는 번호를 찍지 않는다(번호만 보고 이을 수 없게).
      grid.append(html('div', 'mt-pair mt-right',
        `<span class="mt-mark"></span>` +
        `<span class="mt-text">${valueHTML({ html: `${right.a} − ${right.b}` })}</span>`));
    });
    wrap.append(grid);
    if (isAnswer) {
      const lines = item.pairs.map((_, index) => {
        const from = ((index + 0.5) / count * 1000).toFixed(1);
        const to = ((rowOf[index] + 0.5) / count * 1000).toFixed(1);
        const total = item.compactWl + item.compactWr + 18 + item.compactGap;
        return `<line x1="${((item.compactWl + 7.5) / total * 1000).toFixed(1)}" y1="${from}" x2="${((item.compactWl + 9 + item.compactGap + 1.5) / total * 1000).toFixed(1)}" y2="${to}"/>`;
      }).join('');
      wrap.append(html('div', 'mt-lines', `<svg viewBox="0 0 1000 1000" preserveAspectRatio="none">${lines}</svg>`));
    }
    return wrap;
  }

  /* ---------- 11. 이 묶음 전용 CSS (공용 파일은 건드리지 않는다) ---------- */

  function css() {
    if (typeof document === 'undefined' || document.getElementById('g020-styles')) return;
    const style = node('style');
    style.id = 'g020-styles';
    style.textContent = [
      // flex-basis 0 이어야 그림 상자의 높이가 정해져 svg{height:100%} 가 먹는다.
      '.g020-figure{width:100%;flex:1 1 0;min-height:6mm;display:flex;align-items:center;justify-content:center}',
      '.g020-figure svg{height:100%;width:auto;max-width:100%;display:block}',
      '.g020-figure.g020-line-fig svg{width:100%;height:auto;max-height:100%}',
      '.g020-diff .g020-figure{height:27mm;flex:none;min-height:0}',
      '.g020-diff .g020-figure svg{max-height:100%}',
      '.mt-pairs .g020-match-text{display:flex;flex-direction:column;align-items:flex-end;justify-content:center;line-height:1.1;gap:.4mm;font-size:11pt}',
      '.g020-match-text svg{display:block;width:100%;height:7mm;flex:none}',
      '.g020-options{display:flex;justify-content:center;gap:2.6mm;white-space:nowrap;font-variant-numeric:tabular-nums;font-size:.98em}',
      '.g020-opt{padding:0 .6mm}',
      '.g020-picked{border:1.4px solid #d71f10;border-radius:50%;padding:0 1.6mm}',
      '.g020-eq{display:flex;align-items:center;justify-content:center;gap:1.2mm;white-space:nowrap;font-variant-numeric:tabular-nums;line-height:1.15}',
      '.g020-eq-left{justify-content:flex-start}',
      '.g020-blank{display:inline-flex;align-items:center;justify-content:center;min-width:8.5mm;height:1.2em;border:1px solid #666;border-radius:1px;background:#fbfbfb}',
      '.g020-blank-inline{min-width:9mm;margin:0 .4mm}',
      '.g020-blank-wide{min-width:13mm}',
      '.g020-slot{display:inline-flex;flex-direction:column;align-items:center;gap:.3mm}',
      '.g020-label{font-size:.68em;color:#555;line-height:1.05;white-space:nowrap}',
      '.g020-sentence{line-height:1.32;word-break:keep-all}',
      '.g020-write-row{display:flex;align-items:flex-end;gap:1.2mm;white-space:nowrap;flex-wrap:nowrap}',
      '.g020-tag{font-size:.9em;color:#333}',
      '.g020-write{display:inline-block;min-width:26mm;border-bottom:1px solid #555;text-align:center;padding:0 1mm}',
      '.g020-write-short{min-width:16mm}',
      '.g020-given{font-variant-numeric:tabular-nums;line-height:1.15}',
      '.g020-eq-ask{font-size:1.05em}'
    ].join('');
    document.head.append(style);
  }

  /* ---------- 12. 등록: 서식 · 생성기 · 카탈로그 ---------- */

  if (root.Sheet && typeof root.Sheet.register === 'function') {
    for (const [key, render] of Object.entries({
      'g020-choose': renderChoose,
      'g020-picture': renderPicture,
      'g020-word': renderWord,
      'g020-line': renderLine,
      'g020-mark': renderMark,
      'g020-pair': renderPair,
      'g020-factpic': renderFactPicture,
      'g020-blank': renderBlank
    })) {
      try { root.Sheet.register(key, render); }
      catch (error) { /* 다른 묶음이 먼저 등록한 서식은 건드리지 않는다 */ }
    }
  }

  // 선 잇기는 formats-matching.js 가 안내하는 방식대로 묶음 서식 등록부에 붙인다.
  if (root.MatchingSheet && root.MatchingSheet.formats) {
    root.MatchingSheet.formats['g020-match'] = {
      page: 'blocks',
      title: '이동한 칸 수와 식 연결하기',
      build: config => { css(); return matchBundles(config); },
      render: (config, item, isAnswer) => renderMatchBundle(config, item, isAnswer)
    };
  }

  if (root.SheetGen && typeof root.SheetGen.generate === 'function' && !root.SheetGen.__g020) {
    const original = root.SheetGen.generate;
    const wrapped = config => {
      if (config && config.gen && config.gen.bundle === BUNDLE) {
        return (config.gen || {}).task === 'match' ? matchBundles(config).items : questionsFor(config);
      }
      return original(config);
    };
    wrapped.__g020 = true;
    root.SheetGen.generate = wrapped;
  }

  if (Array.isArray(root.SheetCatalog)) root.SheetCatalog.push(...TYPES);

  root.GoogoodanG020 = { bundle: BUNDLE, concepts: CONCEPTS, types: TYPES, table: TYPE_TABLE,
    questionsFor, matchBundles, pickFacts, collectFacts, stories: { take: TAKE_STORIES, diff: DIFF_STORIES } };
})(globalThis);
