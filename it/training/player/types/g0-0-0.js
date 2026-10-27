(function (root) {
  'use strict';

  /* ===================== 묶음 0-0-0 · 선행 학습 수 감각 =====================
     개념 5개 × 유형 19개 (worksheet-types.json 의 0-0-0-0 ~ 0-0-0-4,
     명세는 spec\spec-natural.json 의 같은 typeId).

       0-0-0-0  1~9의 수 세기와 숫자 연결   t1 그림을 세어 수 쓰기 / t2 그림과 숫자 연결하기
                                            t3 수를 보고 그만큼 표시하기 / t4 수 배열의 빈칸 채우기
       0-0-0-1  0의 뜻과 0~9의 수 순서      t1 빈 그림을 보고 0 쓰기 / t2 그림의 개수와 0~9 연결하기
                                            t3 0~9 수 배열의 빈칸 채우기 / t4 앞의 수와 뒤의 수 쓰기
                                            t5 수직선의 빠진 수 쓰기
       0-0-0-2  10~20의 수 세기와 순서      t1 그림을 세어 수 쓰기 / t2 그림과 숫자 연결하기
                                            t3 수를 보고 그만큼 표시하기 / t4 수 배열의 빈칸 채우기
       0-0-0-3  수의 크기 비교              t1 두 수 사이에 부등호 넣기 / t2 작은 수부터 순서대로 쓰기
                                            t3 가장 큰 수와 가장 작은 수 찾기
       0-0-0-4  수직선에서 수의 위치 찾기   t1 수직선의 위치에 수 쓰기 / t2 주어진 수의 위치 표시하기
                                            t3 수직선의 빠진 눈금 채우기

     이 묶음은 셈이 아니라 '수 자체'를 다루는 선행 학습이라 사이트의 기존 계산 생성기
     (Worksheets.generate 의 natural-* 유형)가 낼 문제가 없다. 다른 묶음처럼 '기존 생성기 출력을
     조건에 맞는 것만 걸러 쓰기'를 먼저 시도했지만 이 묶음에서는 성립하지 않는다.
       · 수 세기·수직선·앞뒤 수 : 기존 생성기에 아예 없는 유형이다(자연수 사칙·비교뿐이다).
       · 부등호·순서    : compare-ten 은 1~10, compare 는 0~99 만 만들어 0~20 조건과 맞지 않는다.
                          (0~20 을 조건으로 걸러 내면 쓸 수 있는 문항이 55개뿐이라 60문항을 못 채운다.)
     그래서 이 파일 안에서 기존 서식(formats-pictures.js·formats-matching.js)과 같은 결정적 방식
     (seed → 범위 선택 → 중복 제거)으로 수를 고른다. 새 문제 엔진이 아니라 수 목록·그림을
     고르는 최소 계산이다. 모든 난수는 config.seed 에서만 나오므로 같은 seed 면 같은 문제지가 나온다.

     ── 서식: 공용 서식을 쓸 수 있는 곳은 그대로 쓰고, 없으면 이 파일 안에만 만든다 ──
       · 선 잇기(g000-match) · 부등호(g000-compare) · 순서대로(g000-order) ·
         가장 큰/작은 수(g000-extremes)는 MatchingSheet.formats 에 항목만 더해
         공용 묶음 틀·격자 틀과 공용 렌더러(renderBundle / renderInequalityCell /
         renderOrderingCell / renderExtremesCell)를 그대로 쓴다(공용 파일은 고치지 않는다).
         다만 공용 문제 만들기는 좁은 수 범위(0~20)에서 서로 다른 수를 너무 많이 요구해
         실패하므로(부등호 count×3개, 순서 count×수개수개를 '서로 다른 수'로 만들어야 한다)
         문제 만들기만 이 묶음 조건에 맞게 이 파일에서 한다.
       · 그림 세기·표시하기·수 배열·앞뒤 수·수직선은 쓰임이 맞는 공용 서식이 없다.
         (공용 picture-count 는 10~20에서 서로 다른 문항이 12개까지만 나오고,
          공용 picture-work 'zero' 모드는 문항 열쇠가 모두 'zero' 라 빈 그림을 하나밖에 못 만들며,
          공용 number-line 은 '위치에 수 쓰기'와 0~9 범위를 그리지 못한다.)
         그래서 g000-* 서식과 렌더러를 이 파일에만 둔다(sheet.js·formats-*.js 는 그대로).
     ── 그림은 흑백 인쇄용 인라인 SVG 로 작게·검게 그린다(formats-pictures.js 와 같은 방식). ──

     ── 한 장 문항 수 (layout-rules.md §2 최소 기준) ─────────────────────────────
       · 그림 세기·표시하기(0-0-0-0-t1/t3, 0-0-0-1-t1, 0-0-0-2-t1/t3): 3단 × 5줄 = 15
         → sheet.js 자동 맞춤이 칸 높이(그림 서식 최소 38mm)가 남으면 줄을 늘려 3×6=18까지 간다.
       · 수 배열 빈칸 채우기(0-0-0-0-t4, 0-0-0-1-t3, 0-0-0-2-t4): 3단 × 8줄 = 24
         (§2 의 '그림 … 배열 …' 행 최소 15보다 넉넉히 잡아 남는 높이를 없앤다)
       · 수직선(0-0-0-1-t5, 0-0-0-4-t1/t2/t3): 2단 × 8줄 = 16
         (0~20 눈금 21개를 3단 폭에 넣으면 눈금 간격이 3mm도 안 되어 표시하기가 어렵다.
          2단으로 넓혀 눈금 간격을 두 배로 하고 §2 최소 15문항은 넘긴다)
       · 선 잇기(0-0-0-0-t2, 0-0-0-1-t2, 0-0-0-2-t2): 6쌍 × 3묶음 = 18쌍 (§2 그대로)
       · 부등호(0-0-0-3-t1): 4단 × 15줄 = 60 — 공용 inequality 서식이 정한 배치 그대로
       · 순서대로·가장 큰/작은 수(0-0-0-3-t2/t3): 2단 × 14줄 = 28 — 공용 ordering/extremes 배치 그대로
        · 앞의 수와 뒤의 수(0-0-0-1-t4): 2단 × 8줄 = 16 — 한쪽 빈칸 8문항 + 양쪽 빈칸 8문항

     ── 문항 풀과 '같은 문제 중복 금지' ─────────────────────────────────────────
       · 수 세기·표시하기: 1~9는 수가 9개뿐이라 §2 의 15문항을 채우려면 같은 수를 다른 그림
         (● ■ ▲ ★ ●작은점)으로 다시 쓴다. 한 문항 = (수, 그림) 이므로 겹치는 문항은 없다.
         10~20은 수 11개(10~20)로 같은 방식이다.
        · 앞의 수와 뒤의 수(0-0-0-1-t4): 중심 수 1~8마다 한쪽 이웃만 쓰는 문항과
          두 이웃을 모두 쓰는 문항을 한 번씩 낸다. 답칸 조건이 달라 16문항이 서로 다르다.
        · 빈 그림을 보고 0 쓰기: 사물 이름이 다른 빈 장면 18개로 같은 빈칸 반복을 피한다.
       · 수 배열: 이어지는 수 5개(10~20은 5개) 묶음에서 1~2곳을 비운다. 묶음과 빈칸 자리가
         다르면 다른 문항이다(예: 1 2 □ 4 5 와 1 □ 3 □ 5 는 다른 문항).
       · 부등호·순서·가장 큰/작은 수: 0~20 의 서로 다른 수 조합에서 뽑아 한 장 안에 같은
         조합이 두 번 나오지 않는다.
       · 선 잇기: 묶음마다 그림(사물) 하나를 쓰고 묶음 안에서 수가 겹치지 않는다. 묶음이
         다르면 그림이 달라 (수, 그림) 짝이 페이지 전체에서 겹치지 않는다.

     ── 0·1 이 들어간 쉬운 문항 비율(§2) ───────────────────────────────────────
       · 부등호·순서대로·가장 큰/작은 수(0-0-0-3)는 §2 그대로 0이나 1이 들어간 조합을
         한 장의 10% 이하로 제한한다(60문항이면 6문항, 28문항이면 2문항).
       · 수 세기·표시하기는 0과 1 자체를 배우는 단계라 §2 의 10% 기준을 그대로 적용할 수
          없다(0-0-0-1 은 개념 자체가 0이다). 대신 '수 1'은 한 장에 한 번만 넣고(15문항이면
          6.7%), '빈 그림을 보고 0 쓰기' 유형에서는 모든 문항이 0이다.
          10~20 은 모든 수에 1이나 0이 들어가므로 이 기준을 적용하지 않는다
         (수 자체를 읽는 훈련이다). 수직선(0-0-0-4)도 눈금 값 자체가 답이라 마찬가지다.

     ── 공용 파일은 고치지 않는다. 이 파일은 sheet\types\g0-0-0.js 하나뿐이다. ──
  ============================================================================= */

  const NBSP = ' ';
  const INK = '#111';
  const SHADE = '#d9d9d9';
  const ANSWER_INK = '#d71f10';
  const OBJECTS = ['apple', 'strawberry', 'grapes', 'rabbit', 'chick', 'dog', 'panda', 'balloon', 'car', 'bus', 'pencil', 'book', 'cookie', 'pizza', 'flower', 'butterfly'];
  const ART = {
    apple: '1f34e', strawberry: '1f353', grapes: '1f347', rabbit: '1f407',
    chick: '1f424', dog: '1f436', panda: '1f43c', balloon: '1f388',
    fish: '1f41f', car: '1f697', bird: '1f426', bus: '1f68c', pencil: '270f',
    book: '1f4d5', cookie: '1f36a', pizza: '1f355', flower: '1f33c', butterfly: '1f98b'
  };

  /* ---------- 1. 공통 도구 (모든 난수는 seed 에서만 나온다) ---------- */

  function random(seed) {
    let state = (Number(seed) >>> 0) || 1;
    return (lo, hi) => {
      state += 0x6D2B79F5;
      let t = state;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return lo + Math.floor(((t ^ t >>> 14) >>> 0) / 4294967296 * (hi - lo + 1));
    };
  }
  function shuffleWith(list, rnd) {
    const out = list.slice();
    for (let i = out.length - 1; i > 0; i--) { const j = rnd(0, i); const tmp = out[i]; out[i] = out[j]; out[j] = tmp; }
    return out;
  }
  const shuffled = (list, seed) => shuffleWith(list, random(seed));
  function hash(text) {
    let h = 2166136261;
    for (const ch of String(text)) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  const seedOf = config => ((Number(config.seed) || 1) ^ Math.imul(hash(config.typeId || ''), 2654435761)) >>> 0;
  function combinations(n, k) {
    const out = [];
    const pick = (start, chosen) => {
      if (chosen.length === k) { out.push(chosen.slice()); return; }
      for (let i = start; i < n; i++) { chosen.push(i); pick(i + 1, chosen); chosen.pop(); }
    };
    pick(0, []);
    return out;
  }
  const clamp = (value, lo, hi) => Math.min(hi, Math.max(lo, value));
  // layout-rules §2: 0과 1이 들어간 쉬운 문항은 한 장의 10% 이하로 둔다.
  const isEasyValue = value => value <= 1;
  const easyQuota = count => Math.max(1, Math.floor(count * 0.1));
  function compareIndexes(a, b) {
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      const x = i < a.length ? a[i] : -1, y = i < b.length ? b[i] : -1;
      if (x !== y) return x - y;
    }
    return 0;
  }

  /* ---------- 2. 문제 만들기 ---------- */

  // 수 세기(count)·표시하기(mark): 수를 오름차순으로 돌면서 문항마다 다른 그림을 쓴다.
  //   zeroEvery 를 주면 그 간격마다 0(빈 그림)을 끼워 넣는다(0의 뜻을 배우는 개념에서만).
  function countingItems(config, count) {
    const gen = config.gen || {};
    if (gen.zeroScenes) {
      const values = Array.from({ length: count }, (_, i) => i % 3 === 0 ? 0 : 1 + ((i - Math.floor(i / 3) - 1) % 5));
      const rnd = random(seedOf(config));
      return shuffleWith(values, rnd).map((n, i) => ({ n, scene: i % 5,
        object: OBJECTS[(i + rnd(0, OBJECTS.length - 1)) % OBJECTS.length], key: `scene:${i % 5}:${n}:${i}` }));
    }
    const min = Number(gen.numberMin), max = Number(gen.numberMax);
    const numbers = [];
    for (let n = min; n <= max; n++) if (n !== 0) numbers.push(n);
    if (!numbers.length) throw Error(config.typeId + ': 수 범위가 비었습니다.');
    const zeroEvery = Number(gen.zeroEvery) || 0;
    const zeroCount = zeroEvery ? Math.max(1, Math.round(count / zeroEvery)) : 0;
    const easyLimit = Math.max(1, Math.floor(count * 0.1));   // '수 1'은 한 장에 10% 이하
    const list = [];
    for (let i = 0; i < zeroCount; i++) list.push(0);
    let round = 0, easy = 0;
    const seedRnd = random(seedOf(config) ^ 0x3C6EF372);
    while (list.length < count && round < 30) {
      // 라운드마다 수의 순서를 seed 로 섞어, 수가 모자라 되풀이될 때 어떤 수가 두 번 나올지가 seed 마다 달라진다.
      for (const n of shuffleWith(numbers, seedRnd)) {
        if (list.length >= count) break;
        if (n === 1 && easy >= easyLimit) continue;
        if (n === 1) easy++;
        list.push(n);
      }
      round++;
    }
    if (list.length < count) throw Error(config.typeId + ': 수 문항을 채우지 못했습니다.');
    // 0(빈 그림)은 앞뒤로 몰리지 않게 사이사이에 고르게 흩뿌린다.
    const rest = list.filter(n => n > 0).sort((a, b) => a - b);
    const zeros = list.filter(n => n === 0).length;
    const ordered = [];
    const step = (rest.length + zeros) / (zeros + 1);
    let zi = 0;
    rest.forEach((n, i) => {
      while (zi < zeros && i >= Math.round((zi + 1) * step) - 1) { ordered.push(0); zi++; }
      ordered.push(n);
    });
    while (zi < zeros) { ordered.push(0); zi++; }
    const used = new Map();
    const objectShift = seedRnd(0, OBJECTS.length - 1);
    return ordered.slice(0, count).map(n => {
      const times = used.get(n) || 0;
      used.set(n, times + 1);
      return { n, object: OBJECTS[(hash(String(n)) + times * 2 + objectShift) % OBJECTS.length], key: n + ':' + times };
    });
  }

  // 수 배열의 빈칸 채우기: 이어지는 수 length 개에서 1~2곳을 비운다.
  function stripItems(config, count) {
    const gen = config.gen || {};
    const min = Number(gen.numberMin), max = Number(gen.numberMax);
    const length = clamp(Number(gen.length) || 5, 3, 6);
    const blankMin = clamp(Number(gen.blankMin) || 1, 1, length - 1);
    const blankMax = clamp(Number(gen.blankMax) || 2, blankMin, length - 1);
    const combos = [];
    for (let start = min; start + length - 1 <= max; start++) {
      const values = [];
      for (let i = 0; i < length; i++) values.push(start + i);
      for (let k = blankMin; k <= blankMax; k++) for (const blanks of combinations(length, k)) combos.push({ values, blanks });
    }
    const picked = shuffled(combos, seedOf(config)).slice(0, count);
    if (picked.length < count) throw Error(config.typeId + ': 수 배열 문항이 ' + picked.length + '개뿐입니다(필요 ' + count + '개).');
    picked.sort((a, b) => a.values[0] - b.values[0] || compareIndexes(a.blanks, b.blanks));
    return picked.map(item => ({ values: item.values, blanks: item.blanks, key: item.values[0] + ':' + item.blanks.join('-') }));
  }

  // 앞의 수와 뒤의 수: 0~9 안에서 양쪽이 모두 있는 수는 1~8 뿐이다(문항 풀 8개).
  function neighborItems(config, count) {
    const gen = config.gen || {};
    const min = Number(gen.numberMin), max = Number(gen.numberMax);
    const items = [];
    const rnd = random(seedOf(config));
    for (let n = min + 1; n <= max - 1; n++) {
      items.push({ n, before: n - 1, after: n + 1, ask: rnd(0, 1) ? 'before' : 'after', key: n + ':one' });
    }
    for (let n = min + 1; n <= max - 1; n++) {
      items.push({ n, before: n - 1, after: n + 1, ask: 'both', key: n + ':both' });
    }
    if (items.length < count) throw Error(config.typeId + ': 앞뒤 수 문항이 ' + items.length + '개뿐입니다(필요 ' + count + '개).');
    return items.slice(0, count);
  }

  // 수직선: mode 는 write(●자리의 수 쓰기)·mark(주어진 수의 자리 표시)·missing(빈 눈금).
  function lineItems(config, count) {
    const gen = config.gen || {};
    const mode = String(gen.mode || 'missing');
    const to = clamp(Number(gen.numberMax) || 20, 5, 20);
    const labelStep = to > 10 ? 2 : 1;
    const rnd = random(seedOf(config) ^ 0x2545F491);
    const items = [], seen = new Set();
    if (mode === 'missing') {
      const stops = [];
      for (let value = labelStep; value < to; value += labelStep) stops.push(value);
      // 빈 눈금은 세 곳. 네 곳으로 늘리면 0~20 에서 서로 떨어진 자리 조합이 15가지뿐이라
      // 2단×8줄(16문항)을 채울 수 없다(간격을 좁히면 빈칸 상자가 겹친다).
      const need = 3;
      if (stops.length < need) throw Error(config.typeId + ': 수직선 눈금이 모자랍니다.');
      let guard = 0;
      while (items.length < count && guard++ < 8000) {
        const blanks = [];
        let inner = 0;
        while (blanks.length < need && inner++ < 400) {
          const at = stops[rnd(0, stops.length - 1)];
          if (blanks.includes(at)) continue;
          if (blanks.some(value => Math.abs(value - at) < labelStep * 2)) continue;
          blanks.push(at);
        }
        if (blanks.length < need) continue;
        blanks.sort((a, b) => a - b);
        const key = blanks.join('-');
        if (seen.has(key)) continue;
        seen.add(key);
        items.push({ mode, to, labelStep, blanks, key });
      }
      items.sort((a, b) => a.blanks.reduce((sum, v) => sum + v, 0) - b.blanks.reduce((sum, v) => sum + v, 0));
    } else {
      const values = shuffled(Array.from({ length: to }, (_, i) => i + 1), seedOf(config)).slice(0, count);
      values.sort((a, b) => a - b).forEach(n => items.push({ mode, to, labelStep, n, key: String(n) }));
    }
    if (items.length < count) throw Error(config.typeId + ': 수직선 문항이 ' + items.length + '개뿐입니다(필요 ' + count + '개).');
    return items;
  }

  // 0~20 의 서로 다른 수 조합에서 뽑는다(공용 numberPool 은 좁은 범위에서 서로 다른 수를
  // count×3 개까지 요구해 실패하므로 이 묶음 조건에 맞게 직접 만든다).
  function distinctSets(config, count, size) {
    const gen = config.gen || {};
    const min = Number(gen.numberMin) || 0, max = Number(gen.numberMax) || 20;
    const values = [];
    for (let value = min; value <= max; value++) values.push(value);
    if (values.length < size) throw Error(config.typeId + ': 수 범위가 문항 크기보다 작습니다.');
    const rnd = random(seedOf(config)), items = [], seen = new Set();
    const easyLimit = easyQuota(count);
    let guard = 0, easy = 0;
    while (items.length < count && guard++ < 40000) {
      const chosen = [];
      while (chosen.length < size) {
        const value = values[rnd(0, values.length - 1)];
        if (!chosen.includes(value)) chosen.push(value);
      }
      const sorted = chosen.slice().sort((a, b) => a - b);
      const easyHere = sorted.some(isEasyValue);
      if (easyHere && easy >= easyLimit) continue;
      const key = sorted.join(':');
      if (seen.has(key)) continue;
      seen.add(key);
      if (easyHere) easy++;
      items.push({ values: chosen, sorted, key });
    }
    if (items.length < count) throw Error(config.typeId + ': 수 조합을 ' + count + '개 만들지 못했습니다.');
    items.sort((a, b) => a.sorted[a.sorted.length - 1] - b.sorted[b.sorted.length - 1]);
    return items;
  }

  // 두 수 사이에 부등호 넣기: 다섯 문항에 하나는 '=' 를 넣는다(공용 inequality 와 같은 방식).
  function compareItems(config, count) {
    const gen = config.gen || {};
    const min = Number(gen.numberMin) || 0, max = Number(gen.numberMax) || 20;
    const values = [];
    for (let value = min; value <= max; value++) values.push(value);
    const unequal = [];
    for (let i = 0; i < values.length; i++) for (let j = i + 1; j < values.length; j++) unequal.push([values[i], values[j]]);
    const pickUnequal = shuffled(unequal, seedOf(config));
    const pickEqual = shuffled(values, (seedOf(config) ^ 0x5BF03635) >>> 0);
    const easyLimit = easyQuota(count);
    const items = [];
    let ui = 0, ei = 0, easy = 0;
    for (let i = 0; i < count; i++) {
      const equal = i % 5 === 4;
      const bag = equal ? pickEqual : pickUnequal;
      let cursor = equal ? ei : ui, picked = null;
      while (cursor < bag.length) {
        const candidate = equal ? [bag[cursor], bag[cursor]] : bag[cursor];
        cursor++;
        const easyHere = isEasyValue(candidate[0]) || isEasyValue(candidate[1]);
        if (easyHere && easy >= easyLimit) continue;
        if (easyHere) easy++;
        picked = candidate;
        break;
      }
      if (!picked) throw Error(config.typeId + ': 부등호 문항을 만들지 못했습니다.');
      if (equal) ei = cursor; else ui = cursor;
      let a = picked[0], b = picked[1];
      if (!equal && i % 2 === 0) { const tmp = a; a = b; b = tmp; }
      items.push({ a, b, sign: a < b ? '<' : a > b ? '>' : '=', key: Math.min(a, b) + ':' + Math.max(a, b) });
    }
    items.sort((x, y) => Math.max(x.a, x.b) - Math.max(y.a, y.b));
    return items;
  }

  // 작은 수부터 순서대로 쓰기: 답이 그대로 보이지 않게 자리를 섞는다.
  function orderItems(config, count) {
    const items = distinctSets(config, count, clamp(Number((config.gen || {}).numberCount) || 4, 3, 5));
    const rnd = random((seedOf(config) ^ 0x27D4EB2F) >>> 0);
    return items.map(item => {
      let shown = shuffleWith(item.values, rnd);
      if (shown.every((value, index) => value === item.sorted[index])) shown = shown.slice(1).concat(shown[0]);
      return { values: shown, sorted: item.sorted, key: item.key };
    });
  }

  function extremeItems(config, count) {
    const items = distinctSets(config, count, clamp(Number((config.gen || {}).numberCount) || 4, 3, 5));
    const rnd = random((seedOf(config) ^ 0x165667B1) >>> 0);
    return items.map(item => {
      return { values: shuffleWith(item.values, rnd), biggest: item.sorted[item.sorted.length - 1], smallest: item.sorted[0], key: item.key };
    });
  }

  // 그림과 숫자 연결하기: 묶음마다 그림(사물) 하나를 쓰고, 묶음 안에서 수가 겹치지 않는다.
  //   묶음이 다르면 그림이 달라 (수, 그림) 짝이 페이지 전체에서 겹치지 않는다.
  function matchItems(config) {
    const gen = config.gen || {};
    const bundles = 6, per = 4;   // 2단 × 3줄, 세트당 4문제 = 24쌍
    const min = Number(gen.numberMin), max = Number(gen.numberMax);
    const values = [];
    for (let n = min; n <= max; n++) values.push(n);
    if (values.length < per) throw Error(config.typeId + ': 연결할 수 있는 수가 모자랍니다.');
    const rnd = random(seedOf(config));
    const items = [];
    // 0(빈 그림)은 사물과 상관없이 같은 그림이라 한 페이지에 두 번 나오면 같은 문항이 된다.
    const usedFixed = new Set();
    const objects = shuffleWith(OBJECTS, rnd);
    for (let b = 0; b < bundles; b++) {
      const object = objects[b % objects.length];
      const pool = values.filter(n => !(n === 0 && usedFixed.has(0)));
      const chosen = shuffleWith(pool, rnd).slice(0, per).sort((x, y) => x - y);
      if (chosen.includes(0)) usedFixed.add(0);
      // 세트 한 줄 높이(약 19mm)에 맞춰 그림 크기를 정한다(11 이상은 십 모형이 두 개라 더 높다).
      const pairs = chosen.map(n => [{ html: frameSVG(n, object, min >= 10 ? { widthMm: 19.5, heightMm: 17.2, forceTwo: true } : { widthMm: 40, heightMm: 16 }) }, String(n)]);
      // 제자리 짝(수평선)이 없도록 어떤 그림도 같은 줄의 숫자와 이어지지 않게 섞는다.
      let order = shuffleWith(pairs.map((_, i) => i), rnd);
      let guard = 0;
      while (order.some((value, i) => value === i) && guard++ < 200) order = shuffleWith(pairs.map((_, i) => i), rnd);
      if (order.some((value, i) => value === i)) order = pairs.map((_, i) => (i + 1) % pairs.length);
      items.push({ kind: 'bundle', compact: true, compactW: 40, compactWl: 40, compactWr: 8, compactGap: 16, caption: '', pairs, order, rowsWeight: per });
    }
    return { items, layout: { cols: 2, rows: 3 * per, count: bundles * per }, pairs: bundles * per };
  }

  /* ---------- 3. 그림 그리기(흑백 인쇄용 인라인 SVG) ---------- */

  const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const round = value => Math.round(value * 10) / 10;
  const rect = (x, y, w, h, extra = '') => `<rect x="${round(x)}" y="${round(y)}" width="${round(w)}" height="${round(h)}" ${extra}/>`;
  const txt = (x, y, value, size, anchor = 'middle', weight = '', ink = INK) =>
    `<text x="${round(x)}" y="${round(y)}" text-anchor="${anchor}" font-size="${size}" fill="${ink}"${weight ? ` font-weight="${weight}"` : ''}>${esc(value)}</text>`;
  const svg = (body, box, size) =>
    `<svg viewBox="${box}"${size ? ` width="${size.widthMm}mm" height="${size.heightMm}mm"` : ''} preserveAspectRatio="xMidYMid meet" aria-hidden="true">${body}</svg>`;
  function starPath(cx, cy, r) {
    const points = [];
    for (let i = 0; i < 10; i++) {
      const radius = i % 2 ? r * 0.45 : r;
      const angle = -Math.PI / 2 + i * Math.PI / 5;
      points.push(`${round(cx + Math.cos(angle) * radius)} ${round(cy + Math.sin(angle) * radius)}`);
    }
    return 'M' + points.join('L') + 'Z';
  }
  function glyph(object, cx, cy, r, paint, outlineOnly) {
    if (object === 'dot') {   // 검정 점 대신 그림 아이콘(문제마다 다른 그림)
      const id = globalThis.IconPool ? globalThis.IconPool.current() : '1f34e', size = r * 2.25;
      return `<image href="vendor/art/${id}.svg" x="${round(cx - size / 2)}" y="${round(cy - size / 2)}" width="${size.toFixed(1)}" height="${size.toFixed(1)}" style="filter:saturate(2) contrast(1.2) brightness(.92) drop-shadow(0 0 .7px #222)" preserveAspectRatio="xMidYMid meet"/>`;
    }
    if (ART[object]) {
      const size = r * 2.25;
      return `<image href="vendor/art/${ART[object]}.svg" x="${round(cx - size / 2)}" y="${round(cy - size / 2)}" width="${round(size)}" height="${round(size)}" opacity="${outlineOnly ? '.42' : '1'}" style="${outlineOnly ? '' : 'filter:saturate(2) contrast(1.2) brightness(.92) drop-shadow(0 0 .7px #222)'}" preserveAspectRatio="xMidYMid meet"/>`;
    }
    const paintAttrs = outlineOnly ? `fill="none" stroke="${paint || INK}" stroke-width="1.6"` : `fill="${paint || INK}"`;
    if (object === 'square') return rect(cx - r, cy - r, 2 * r, 2 * r, paintAttrs);
    if (object === 'triangle') return `<path d="M${round(cx)} ${round(cy - r)}L${round(cx + r)} ${round(cy + r)}L${round(cx - r)} ${round(cy + r)}Z" ${paintAttrs}/>`;
    if (object === 'star') return `<path d="${starPath(cx, cy, r)}" ${paintAttrs}/>`;
    if (object === 'dot') return `<circle cx="${round(cx)}" cy="${round(cy)}" r="${round(r * 0.72)}" ${paintAttrs}/>`;
    return `<circle cx="${round(cx)}" cy="${round(cy)}" r="${round(r)}" ${paintAttrs}/>`;
  }
  // 십 모형 한 개(5열 × 2행). 앞에서부터 filled 칸에 그림을 채운다.
  function tenFrame(x, y, u, filled, object) {
    let body = '';
    for (let i = 0; i < 10; i++) {
      const cx = x + (i % 5) * u, cy = y + Math.floor(i / 5) * u;
      body += rect(cx, cy, u, u, `fill="none" stroke="${INK}" stroke-width="1.1"`);
      if (i < filled) body += glyph(object, cx + u / 2, cy + u / 2, u * 0.4);
    }
    return body;
  }
  // 수 세기 그림: 10 이하는 십 모형 하나, 11 이상은 십 모형 둘(위아래로 쌓아 그림을 크게).
  function frameSVG(n, object, size) {
    const two = n > 10 || Boolean(size && size.forceTwo);
    const u = 24, gap = 10;
    const height = two ? 4 * u + gap : 2 * u;
    let body = '';
    if (two) {
      const first = Math.min(n, 10);
      body += tenFrame(0, 0, u, first, object);
      body += tenFrame(0, 2 * u + gap, u, n - first, object);
    } else body += tenFrame(0, 0, u, n, object);
    return svg(body, `0 0 ${5 * u} ${height}`, size);
  }
  // 접시·바구니·어항·주차장·나뭇가지에 실제 물건을 그린다. 빈 장면도 담는 그림은 남는다.
  function sceneSVG(scene, n, object) {
    const kind = scene % 5;
    const line = d => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
    const positions = kind === 3
      ? [[25.5, 61], [50.5, 61], [75.5, 61], [100.5, 61], [125, 61]]
      : [[22, 53], [48.5, 53], [75, 53], [101.5, 53], [128, 53]];
    let body = '';
    if (kind === 0) body += `<ellipse cx="75" cy="65" rx="64" ry="22" fill="none" stroke="${INK}" stroke-width="2"/>` + line('M18 70 Q75 97 132 70');
    if (kind === 1) body += line('M17 45 L27 83 Q75 95 123 83 L133 45 M17 45 Q75 57 133 45 M45 45 Q75 8 105 45');
    if (kind === 2) body += line('M18 29 L25 83 Q75 96 125 83 L132 29 M18 29 Q75 37 132 29') + line('M26 72 Q75 78 124 72');
    if (kind === 3) body += line('M13 82 H137 M13 39 H137 M13 39 V82 M137 39 V82 M38 39 V82 M63 39 V82 M88 39 V82 M113 39 V82');
    if (kind === 4) body += line('M12 76 Q75 86 138 68 M40 79 L35 53 M76 80 L77 48 M108 75 L117 47');
    for (let i = 0; i < n; i++) {
      const [x, y] = positions[i];
      body += glyph(object, x, y, kind === 3 ? 10.5 : 11.5);
    }
    return svg(body, '0 0 150 100');
  }
  // 수를 보고 그만큼 표시하기: 빈 십 모형에 사물 윤곽을 그려 두고 그 수만큼 색칠한다.
  //   정답지에는 표시할 칸을 회색으로 채워 보여 준다.
  function boardSVG(n, object, answer) {
    const two = n > 10;
    const u = 24, x = (150 - 5 * u) / 2, gap = 10;
    const height = two ? 2 * (2 * u) + gap : 2 * u;
    const y = 34;                       // '수 N' 아래. 그림 전체가 viewBox 안에 들어와야 잘리지 않는다.
    // 숫자만 크게: 초록 입체 그림자 + 코랄 본체 + 흰 테두리 + 작은 반짝이로 장식한다.
    const fam = `font-family="'Arial Rounded MT Bold','Segoe UI Black','NanumSquareRound','Malgun Gothic',Arial,sans-serif" font-weight="900" text-anchor="middle" font-size="34"`;
    let body = `<text x="77.5" y="28.5" ${fam} fill="#16867e">${n}</text>`
      + `<text x="75" y="26" ${fam} fill="#ef6a4e" stroke="#fff" stroke-width="1.6" paint-order="stroke" stroke-linejoin="round">${n}</text>`
      + `<text x="75" y="26" ${fam} fill="none" stroke="#c9472f" stroke-width=".5">${n}</text>`
      + `<circle cx="${75 - 7 - String(n).length * 9}" cy="12" r="2" fill="#f4b73f"/><circle cx="${75 + 7 + String(n).length * 9}" cy="18" r="1.6" fill="#16867e"/>`;
    let index = 0;
    for (let frame = 0; frame < (two ? 2 : 1); frame++) {
      const fy = y + frame * (2 * u + gap);
      for (let i = 0; i < 10; i++) {
        const cx = x + (i % 5) * u, cy = fy + Math.floor(i / 5) * u;
        const marked = Boolean(answer) && index < n;
        body += rect(cx, cy, u, u, `fill="${marked ? '#ff9a8f' : 'none'}" stroke="${INK}" stroke-width="1.1"`);
        if (marked) {   // 정답 표시: 진한 빨강 빗금을 촘촘히 그어 흑백 인쇄에서도 분명하게 한다.
          for (let k = 4; k < 2 * u; k += 4) {
            const ax = Math.max(0, k - u), ay = Math.min(k, u), bx = Math.min(k, u), by = Math.max(0, k - u);
            body += `<path d="M${round(cx + ax)} ${round(cy + ay)}L${round(cx + bx)} ${round(cy + by)}" stroke="#d71f10" stroke-width="1.5" fill="none"/>`;
          }
          body += rect(cx, cy, u, u, `fill="none" stroke="#d71f10" stroke-width="1.8"`);
        }
        body += glyph(object, cx + u / 2, cy + u / 2, u * 0.32, INK, true);
        index++;
      }
    }
    return svg(body, `0 0 150 ${y + height + 8}`);
  }
  // 수직선(0~to). write 는 ●자리 위 빈칸, mark 는 주어진 수의 자리, missing 은 빈 눈금.
  function lineSVG(q, answer) {
    const to = q.to, step = q.labelStep || 1;
    const x0 = 14, x1 = 266, y = 58;
    const fs = to > 10 ? 16 : 24, bs = to > 10 ? 22 : 27;   // 눈금 간격이 넓은 0~9 수직선은 숫자·빈칸을 더 크게
    const labelY = round(y + 12 + bs / 2 + fs * 0.36);
    const at = value => x0 + (x1 - x0) * value / to;
    const box = (x, top) => rect(x - bs / 2, top, bs, bs, 'fill="#fff" stroke="#555" stroke-width="1"');
    let body = `<path d="M${x0} ${y}H${x1}" fill="none" stroke="${INK}" stroke-width="1.6"/>`
      + `<path d="M${x1} ${y - 4}L${x1 + 7} ${y}L${x1} ${y + 4}Z" fill="${INK}"/>`;
    for (let value = 0; value <= to; value++) body += `<path d="M${round(at(value))} ${y}V${y + 9}" fill="none" stroke="${INK}" stroke-width="1.2"/>`;
    for (let value = 0; value <= to; value++) {
      const x = at(value);
      if (q.mode === 'missing' && q.blanks.includes(value)) {
        body += box(x, y + 12) + txt(x, labelY, answer ? value : '', fs, 'middle', 'bold', ANSWER_INK);
      } else if (value % step === 0) body += txt(x, labelY, value, fs);
    }
    if (q.mode === 'write') {
      const x = at(q.n);
      body += `<circle cx="${round(x)}" cy="${y}" r="5" fill="${INK}"/>`
        + `<path d="M${round(x)} ${y - 5}V${y - 20}" stroke="${INK}" stroke-width="1" fill="none"/>`
        + box(x, y - 42) + txt(x, y - 26, answer ? q.n : '', 16, 'middle', 'bold', ANSWER_INK);
    }
    if (q.mode === 'mark' && answer) body += `<circle cx="${round(at(q.n))}" cy="${y}" r="5" fill="${ANSWER_INK}"/>`;
    // 위아래 빈 여백을 잘라 수직선이 칸을 꽉 채우게 한다(write 모드는 위의 빈 칸 때문에 더 높다).
    return svg(body, q.mode === 'write' ? '0 10 280 88' : '0 50 280 ' + round(labelY + 7 - 50));
  }

  /* ---------- 4. 화면 만들기 ---------- */

  const node = (tag, className, value) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (value !== undefined) el.textContent = value;
    return el;
  };
  const answerText = value => `<span class="answer-space g000-ink">${value === '' || value == null ? NBSP : esc(value)}</span>`;
  function centered(child) {
    const wrap = node('div', 'g000-center');
    wrap.append(child);
    return wrap;
  }
  function pictureCell(cell, markup, foot) {
    const wrap = node('div', 'g000-pic');
    wrap.innerHTML = markup + (foot ? `<div class="g000-foot">${foot}</div>` : '');
    cell.append(wrap);
  }

  function renderCount(cell, q, answer) {
    css();
    pictureCell(cell, q.scene == null ? frameSVG(q.n, q.object) : sceneSVG(q.scene, q.n, q.object),
      '수 ' + answerText(answer ? q.n : ''));
  }
  function renderMark(cell, q, answer) {
    css();
    pictureCell(cell, boardSVG(q.n, q.object, answer));
  }
  function renderStrip(cell, q, answer) {
    css();
    const row = node('div', 'g000-strip');
    q.values.forEach((value, index) => {
      const blank = q.blanks.includes(index);
      const box = node('span', 'g000-num' + (blank ? ' g000-blank' : ''));
      box.textContent = blank ? (answer ? String(value) : NBSP) : String(value);
      if (blank && answer) box.classList.add('g000-ink');
      row.append(box);
    });
    cell.append(centered(row));
  }
  function renderNeighbor(cell, q, answer) {
    css();
    const line = node('div', 'g000-neighbor');
    const box = value => node('span', 'g000-bigbox' + (answer ? ' g000-ink' : ''), answer ? String(value) : NBSP);
    if (q.ask !== 'after') line.append(box(q.before));
    line.append(node('span', 'g000-center-num', String(q.n)));
    if (q.ask !== 'before') line.append(box(q.after));
    cell.append(centered(line));
  }
  function renderLine(cell, q, answer) {
    css();
    pictureCell(cell, lineSVG(q, answer), q.mode === 'mark' ? `${q.n}의 자리에 ●표 하세요` : '');
    cell.lastElementChild.classList.add('g000-line-svg');
  }

  /* ---------- 5. 이 묶음 전용 CSS (공용 파일은 건드리지 않는다) ---------- */

  function css() {
    if (document.getElementById('g000-styles')) return;
    const style = node('style');
    style.id = 'g000-styles';
    style.textContent = [
      '.g000-pic{display:flex;flex-direction:column;height:100%;min-height:0}',
      '.g000-pic svg{flex:1;min-height:0;width:100%;display:block}',
      '.g000-foot{flex:none;text-align:center;padding-top:.5mm;line-height:1.3}',
      '.g000-line-svg .g000-foot{font-size:.78em}',
      '.g000-center{height:100%;display:flex;align-items:center;justify-content:center}',
      '.g000-ink{color:' + ANSWER_INK + '}',
      '.g000-strip{display:flex;gap:1mm;align-items:center;justify-content:center}',
      '.g000-num{display:inline-flex;align-items:center;justify-content:center;width:9.6mm;height:13.5mm;font-size:1.25em;border:1px solid #999;font-variant-numeric:tabular-nums}',
      '.g000-blank{background:#fbfbfb;border-color:#555}',
      '.g000-neighbor{display:flex;align-items:center;justify-content:center;gap:5mm}',
      '.g000-bigbox{display:inline-flex;align-items:center;justify-content:center;width:19mm;height:17mm;font-size:1.2em;border:1px solid #555;border-radius:2px;background:#fbfbfb}',
      '.g000-center-num{font-size:2em;font-weight:bold;min-width:14mm;text-align:center}',
      '.g000-order .mt-order-write{white-space:nowrap;font-size:9pt}',
      '.g000-order .mt-order-write .mt-write{min-width:10mm;width:10mm}',
      '.g000-order .mt-order-write .mt-cmp{margin:0 .6mm}',
      '.g000-match-layout .mt-right .mt-text{font-size:1.25em;font-weight:700;text-align:left}',
      // 오른쪽 숫자는 문제에 인쇄된 값이므로 정답지에서도 검정(공용 sheet.css 의 .g000-match-layout 빨강 규칙을 되돌린다).
      '.answer-page .g000-match-layout .mt-right .mt-text{color:#111;font-weight:700}',
      '.answer-page .g000-num.ans-fill:not(text):not(tspan){font-size:1.25em}'
    ].join('');
    document.head.append(style);
  }

  /* ---------- 6. 문제 만들기 연결(SheetGen.generate 감싸기) ---------- */

  function itemsFor(config) {
    const count = Number(config.count) || (config.cols * config.rows);
    const task = (config.gen || {}).task;
    if (task === 'count' || task === 'mark') return countingItems(config, count);
    if (task === 'strip') return stripItems(config, count);
    if (task === 'neighbor') return neighborItems(config, count);
    if (task === 'line') return lineItems(config, count);
    throw Error('묶음 0-0-0에 없는 유형입니다: ' + config.typeId);
  }

  /* ---------- 7. 서식 등록 ---------- */

  const FORMATS = {
    'g000-picture-count': renderCount,
    'g000-picture-mark': renderMark,
    'g000-make-array': renderStrip,
    'g000-neighbor': renderNeighbor,
    'g000-number-line': renderLine
  };

  if (root.Sheet && typeof root.Sheet.register === 'function') {
    for (const [key, render] of Object.entries(FORMATS)) {
      try { root.Sheet.register(key, render); }
      catch (error) { /* 다른 묶음이 먼저 등록한 서식은 건드리지 않는다 */ }
    }
  }
  if (root.SheetGen && typeof root.SheetGen.generate === 'function' && !root.SheetGen.__g000) {
    const base = root.SheetGen.generate;
    const wrapped = function (config) {
      return config && config.gen && config.gen.bundle === '0-0-0' ? itemsFor(config) : base.apply(this, arguments);
    };
    wrapped.__g000 = true;
    root.SheetGen.generate = wrapped;
  }

  // 공용 MatchingSheet 묶음 틀·격자 틀을 그대로 쓰고 문제 만들기만 이 묶음 것으로 바꾼다.
  //   격자 서식은 공용 build 처럼 { items, layout, ... } 모양으로 돌려줘야 한다.
  function gridBuild(buildItems, extraOf) {
    return config => {
      const count = config.cols * config.rows;
      return { items: buildItems(config, count), layout: { cols: config.cols, rows: config.rows, count }, ...(extraOf ? extraOf(config, count) : {}) };
    };
  }
  if (root.MatchingSheet && root.MatchingSheet.formats && root.MatchingSheet.formats['matching-lines']) {
    const formats = root.MatchingSheet.formats;
    formats['g000-match'] = { page: 'blocks', title: '그림과 숫자 연결', build: matchItems,
      render: (config, item, isAnswer, built) => {
        css();
        const wrap = formats['matching-lines'].render(config, item, isAnswer, built);
        wrap.classList.add('g000-match-layout');
        return wrap;
      } };
    formats['g000-compare'] = { page: 'grid', title: '부등호 넣기', render: formats['inequality'].render,
      build: gridBuild(compareItems, (config, count) => ({ shown: value => String(value), blanks: count })) };
    formats['g000-order'] = { page: 'grid', title: '순서대로 쓰기', render: (config, item, isAnswer, built) => {
        css();
        const box = formats['ordering'].render(config, item, isAnswer, built);
        box.classList.add('g000-order');
        return box;
      },
      build: gridBuild(orderItems, (config, count) => ({ desc: false, blanks: count * (Number((config.gen || {}).numberCount) || 4) })) };
    formats['g000-extremes'] = { page: 'grid', title: '가장 큰 수·작은 수', render: formats['extremes'].render,
      build: gridBuild(extremeItems, (config, count) => ({ target: 'both', blanks: count * 2 })) };
  }

  /* ---------- 8. 유형 목록(카탈로그와 같은 모양) ---------- */

  // seed 는 유형마다 고정값 → 같은 seed 로 다시 열면 같은 문제지가 나온다.
  let seedCursor = 20261001;
  function type(typeId, title, instruction, format, cols, rows, extra) {
    const settings = extra || {};
    const { gen, ...rest } = settings;
    return {
      typeId, title, instruction, format, cols, rows, count: cols * rows, fontPt: 15,
      ...rest, seed: (seedCursor += 137), gen: { bundle: '0-0-0', ...(gen || {}) }
    };
  }

  const TYPES = [
    /* 0-0-0-0 · 1~9의 수 세기와 숫자 연결 */
    type('0-0-0-0-t1', '1~9 세기 · 그림을 세어 수 쓰기', '그림을 세어 수를 쓰세요.',
      'g000-picture-count', 3, 5, { gen: { task: 'count', numberMin: 1, numberMax: 9 } }),
    type('0-0-0-0-t2', '1~9 세기 · 그림과 숫자 연결하기', '그림과 숫자를 알맞게 이으세요.',
      'g000-match', 3, 6, { gen: { task: 'match', numberMin: 1, numberMax: 9 } }),
    type('0-0-0-0-t3', '1~9 세기 · 수만큼 표시하기', '수를 보고 그만큼 색칠하세요.',
      'g000-picture-mark', 3, 5, { gen: { task: 'mark', numberMin: 1, numberMax: 9 } }),
    type('0-0-0-0-t4', '1~9 세기 · 수 배열의 빈칸', '빈칸에 알맞은 수를 써넣으세요.',
      'g000-make-array', 3, 8, { autoFit: false, gen: { task: 'strip', numberMin: 1, numberMax: 9, length: 5 } }),

    /* 0-0-0-1 · 0의 뜻과 0~9의 수 순서 */
    type('0-0-0-1-t1', '0의 뜻 · 그림을 보고 수 쓰기', '그림 속 물건을 세어 수를 쓰세요.',
      'g000-picture-count', 3, 5, { gen: { task: 'count', numberMin: 0, numberMax: 5, zeroScenes: true } }),
    type('0-0-0-1-t2', '0~9 · 그림과 숫자 연결하기', '그림과 숫자를 알맞게 이으세요.',
      'g000-match', 3, 6, { gen: { task: 'match', numberMin: 0, numberMax: 9 } }),
    type('0-0-0-1-t3', '0~9 · 수 배열의 빈칸 채우기', '빈칸에 알맞은 수를 써넣으세요.',
      'g000-make-array', 3, 8, { autoFit: false, gen: { task: 'strip', numberMin: 0, numberMax: 9, length: 5 } }),
    type('0-0-0-1-t4', '0~9 · 앞의 수와 뒤의 수 쓰기', '숫자의 앞의 수와 뒤의 수를 생각해서 □ 안에 쓰세요.',
      'g000-neighbor', 2, 8, { fontPt: 18, autoFit: false, gen: { task: 'neighbor', numberMin: 0, numberMax: 9 } }),
    type('0-0-0-1-t5', '0~9 · 수직선의 빠진 수 쓰기', '수직선의 빈칸에 알맞은 수를 써넣으세요.',
      'g000-number-line', 2, 8, { autoFit: false, gen: { task: 'line', mode: 'missing', numberMin: 0, numberMax: 9 } }),

    /* 0-0-0-2 · 10~20의 수 세기와 순서 */
    type('0-0-0-2-t1', '10~20 · 그림을 세어 수 쓰기', '그림을 세어 수를 쓰세요.',
      'g000-picture-count', 3, 5, { gen: { task: 'count', numberMin: 10, numberMax: 20 } }),
    type('0-0-0-2-t2', '10~20 · 그림과 숫자 연결하기', '그림과 숫자를 알맞게 이으세요.',
      'g000-match', 3, 6, { gen: { task: 'match', numberMin: 10, numberMax: 20 } }),
    type('0-0-0-2-t3', '10~20 · 수만큼 표시하기', '수를 보고 그만큼 색칠하세요.',
      'g000-picture-mark', 3, 5, { gen: { task: 'mark', numberMin: 10, numberMax: 20 } }),
    type('0-0-0-2-t4', '10~20 · 수 배열의 빈칸', '빈칸에 알맞은 수를 써넣으세요.',
      'g000-make-array', 3, 8, { autoFit: false, gen: { task: 'strip', numberMin: 10, numberMax: 20, length: 5 } }),

    /* 0-0-0-3 · 수의 크기 비교 */
    type('0-0-0-3-t1', '수 크기 비교 · 두 수 사이에 부등호', '○ 안에 >, <, = 를 알맞게 써넣으세요.',
      'g000-compare', 4, 10, { fontPt: 18, autoFit: false, maxProblems: 40, gen: { task: 'compare', numberMin: 0, numberMax: 20 } }),
    type('0-0-0-3-t2', '수 크기 비교 · 작은 수부터 순서대로', '작은 수부터 순서대로 쓰세요.',
      'g000-order', 2, 14, { fontPt: 16, autoFit: false, maxProblems: 40, gen: { task: 'order', numberCount: 4, numberMin: 0, numberMax: 20 } }),
    type('0-0-0-3-t3', '수 크기 비교 · 가장 큰 수와 작은 수', '가장 큰 수와 가장 작은 수를 찾아 쓰세요.',
      'g000-extremes', 2, 14, { fontPt: 16, autoFit: false, maxProblems: 40, gen: { task: 'extreme', numberCount: 4, numberMin: 0, numberMax: 20 } }),

    /* 0-0-0-4 · 수직선에서 수의 위치 찾기 */
    type('0-0-0-4-t1', '수직선 · 위치에 수 쓰기', '●가 있는 곳의 수를 써넣으세요.',
      'g000-number-line', 2, 8, { autoFit: false, gen: { task: 'line', mode: 'write', numberMin: 0, numberMax: 20 } }),
    type('0-0-0-4-t2', '수직선 · 수의 위치 표시하기', '수직선에서 주어진 수의 자리에 ●표 하세요.',
      'g000-number-line', 2, 8, { autoFit: false, gen: { task: 'line', mode: 'mark', numberMin: 0, numberMax: 20 } }),
    type('0-0-0-4-t3', '수직선 · 빠진 눈금 채우기', '수직선의 빈칸에 알맞은 수를 써넣으세요.',
      'g000-number-line', 2, 8, { autoFit: false, gen: { task: 'line', mode: 'missing', numberMin: 0, numberMax: 20 } })
  ];

  function publish() {
    if (!Array.isArray(root.SheetCatalog)) return false;
    const have = new Set(root.SheetCatalog.map(entry => entry.typeId));
    for (const entry of TYPES) if (!have.has(entry.typeId)) root.SheetCatalog.push(entry);
    return true;
  }
  if (!publish()) document.addEventListener('DOMContentLoaded', publish, { once: true });

  root.GoogoodanG000 = {
    types: TYPES,
    formats: FORMATS,
    itemsFor,
    countingItems,
    stripItems,
    neighborItems,
    lineItems,
    compareItems,
    orderItems,
    extremeItems,
    matchItems,
    boardSVG,
    frameSVG,
    lineSVG
  };
})(globalThis);
