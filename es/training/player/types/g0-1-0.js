/* 묶음 0-1-0 — 덧셈 준비: 합치는 상황 · 수직선 · 순서를 바꾸어 더하기 (제작자 A, 2026-10-02)

   대상: training-roadmap-20261001/worksheet-types.json 의 id 가 `0-1-0-` 로 시작하는 개념 3개와
   그 유형 9개(개념마다 t1~t3). 이 파일 하나에 유형 정의·문제 생성·전용 서식을 모두 담는다.

     0-1-0-0 합치는 상황과 덧셈식 연결   t1 그림 상황에 맞는 식 고르기
                                          t2 그림을 보고 식 완성하기
                                          t3 짧은 상황을 식으로 나타내기
     0-1-0-1 수직선에서 앞으로 세기       t1 수직선의 이동 끝 수 쓰기
                                          t2 이동한 칸 수와 식 연결하기
                                          t3 식에 맞는 이동 표시하기
     0-1-0-2 두 수의 순서를 바꾸어 더하기 t1 순서를 바꾼 덧셈식 짝짓기
                                          t2 그림에서 두 덧셈식 쓰기
                                          t3 합이 같은 식의 빈칸 채우기

   문제의 출처
   -----------
   사이트의 기존 생성기(Worksheets.generate, src/bank/legacy/types.js)만 쓴다. 이 묶음의 조건을
   그대로 보장하는 유형이 없으므로, 기존 생성기가 낸 (a, b) 중 조건에 맞는 것만 남기고 모자라면
   seed 를 바꾸어 더 뽑는다(gen-bridge.js 와 같은 방식). 새 문제 엔진을 만들지 않는다.
     · 합치는 상황(0-1-0-0), 순서 바꾸기(0-1-0-2) → natural-add-1-1 (1~9 + 1~9)
     · 수직선(0-1-0-1)                         → add-small (합이 20 이하인 덧셈)
   조건에 맞는 (a, b) 풀(모두 피연산자가 2 이상 → 0·1이 들어간 쉬운 문제 0%)
     · 0-1-0-0 : 2~9 + 2~9                          64가지
     · 0-1-0-1 : 2~9 + 2~9, 합 20 이하              64가지
     · 0-1-0-2 : 2~9 두 수에서 a < b (순서만 다른 짝은 한 번만)  28가지
   그림·수직선·상황 문장은 위에서 뽑은 (a, b)로 이 파일이 그린다. 정답은 모두 기존 생성기가 낸
   두 수의 합을 그대로 쓴다(0-1-0-2 의 빈칸은 자리를 바꾼 피연산자라 같은 합에서 나온다).

   한 장 문항 수 (layout-rules §2 최소 기준) — 2026-10-02 Edge headless 실측(seed 1·7·42)
   -----------------------------------------------------------------------------------
     typeId          서식            단×줄(기본)  실제 인쇄   §2 최소
     0-1-0-0-t1      고르기(그림)    3×5          3단×5줄 = 15  15 (그림·수직선)
     0-1-0-0-t2      그림+식         3×6          3단×7줄 = 21  15
     0-1-0-0-t3      상황+식         2×10         2단×11줄 = 22 (규정 없음, 15 이상)
     0-1-0-1-t1      수직선 끝 수    2×8          2단×9줄 = 18   15
     0-1-0-1-t2      선 잇기         3묶음×6쌍     18쌍          18~24쌍
     0-1-0-1-t3      식에 맞는 표시  2×8          2단×9줄 = 18   15
     0-1-0-2-t1      선 잇기         3묶음×8쌍     24쌍          18~24쌍
     0-1-0-2-t2      그림+두 식      3×5          3단×6줄 = 18   15
     0-1-0-2-t3      빈칸 식         3×14         3단×14줄 = 42  42
   칸 수는 sheet.js 의 자동 맞춤이 정한다. 이 묶음 서식은 칸 안에 그림·수직선이 있어 내용 높이가
   일정한데, 자동 맞춤은 절대 배치한 틀(.g010-mid) 안쪽의 넘침을 보지 못한다(fits() 는 칸의 직계
   자식만 잰다). 그래서 유형마다 cap 을 '칸 높이 ≥ 내용 높이 + 아래 여백 4mm' 가 되는 최대
   줄 수로 잡아 두었다(2026-10-02 Edge 실측: cap 을 넘겨 6줄로 늘리면 0-1-0-0-t1 의 그림 윗변이
   2.3mm 잘렸다). cap 에서 멈추는 방식은 0-1-1·0-2-1 과 같다(자동 맞춤은 넘치는 시도를 만나면
   멈추고 마지막으로 들어간 줄 수를 다시 그린다).
    0-1-0-2-t3 은 서로 다른 수의 짝 28개에서 순서가 다른 식 56개를 만들고, 그중 42개를
    한 칸에 한 식씩 넣는다. 따라서 칸 42개와 서로 다른 빈칸 식 42개를 모두 채운다.
    쉬운 문제(0·1이 들어간 것) 비율은 이 묶음 모든 유형에서 0% 다. 피연산자를 0·1이
   아닌 2 이상으로만 뽑기 때문이다(0-1-0-2 는 2~9). 수 범위는 4~18(수직선은 끝 수 18까지)이다.

   서식
   ----
   이 묶음 전용 서식 8종을 이 파일에서 등록한다. 공용 파일(sheet.js · formats-*.js · gen-bridge.js ·
   catalog.js)은 고치지 않고 열려 있는 두 등록 지점만 쓴다.
     Sheet.register(key, render)          격자 서식 — g010-count-choice · g010-count-equation ·
                                          g010-count-pair · g010-word-equation · g010-line-end ·
                                          g010-line-mark · g010-swap-blank
     MatchingSheet.formats[key] = {...}   한 쪽 단위 서식 — g010-match (선 잇기)
   기존 그림 서식(formats-pictures.js)을 쓰지 않은 이유:
     · 그림 문항      — 이 묶음은 '두 묶음을 합치는 상황'만 다루므로 두 상자 그림을 고정 모양으로 그린다
     · 수직선         — 기존 'jump' 서식은 2·5·10씩 뛰어 세는 그림이라 '한 칸씩 이동'과 다르다
     · 선 잇기        — 기존 서식은 오른쪽 ○ 옆에 짝 번호(①②③)를 찍어 번호만 보고 이을 수 있었다
                        (0-3-1 검수 지적과 같은 문제). 이 파일은 오른쪽에 ○만 찍는다.
   같은 typeId·같은 seed 면 같은 문제지(모든 난수는 seed 에서만 나온다).

   2026-10-02 제작자 자체 점검
   -------------------------
     · 문제지에는 답을 인쇄하지 않는다(빈칸·고르기 자리를 비운다). 정답지에만 빨간 글씨로 채운다.
      · 한 장에 같은 문제를 두 번 쓰지 않는다. t3 은 같은 두 수라도 순서가 다른 식을 구별한다.
     · 지시문은 명세(spec-natural.json) 문구를 그대로 쓰되, 서식과 어긋나는 세 곳만 활동에 맞게 적었다.
        0-1-0-0-t2 '그림을 보고 식을 완성하세요.'
        0-1-0-0-t3 '상황을 읽고 덧셈식으로 나타내세요.'
        0-1-0-1-t3 '식에 맞게 수직선 위에 이동을 표시하세요.'
     · 확인한 방법
        python tools/check-g0-1-0.py            9유형 × seed 1·7·42·20261001 → 문항 수·중복·
                                                개념 조건·정답(파이썬에서 다시 계산)·보기·상황 문장
        python tmp-0-1-0-A/run_probe.py         9유형 × seed 1·7·42 → Edge headless 로 문제지·정답지
                                                1쪽씩인지(pdf 2쪽), 칸 넘침·잘림·아래 여백, 보기 수,
                                                빈칸 상자·연결선·정답 표시, 머리말 잘림
       실측 결과: 9유형 모두 문제지 1쪽 + 정답지 1쪽(pdf 2쪽), 칸 넘침 0, 아래 여백 4.0~5.8mm,
       머리말 한 줄. 1회차에서 찾은 잘림(0-1-0-0-t1 그림 2.3mm, 0-1-0-1-t3 수직선 2.0mm)은 고쳤다.
       로드맵 제목 '짧은 상황을 식으로 나타내기' 는 정답지 머리말에서 2px 잘려 시트 제목만
       '상황을 식으로 나타내기' 로 줄였다(활동은 그대로).
     · 선 잇기 그림은 오른쪽에 번호를 찍지 않는다(0-3-1 검수 지적과 같은 이유 — 번호만 보고
       이을 수 있으면 활동이 되지 않는다). 정답지의 연결선은 두 ○의 한가운데를 잇는다.
*/
(function (root) {
  'use strict';

  var INK = '#111', ANSWER_INK = '#b32b2b', NBSP = ' ';

  /* ===================== 1. 작은 도구 ===================== */

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined && text !== null) node.textContent = String(text);
    return node;
  }

  function esc(value) {
    return String(value === undefined || value === null ? '' : value).replace(/[&<>"']/g,
      function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }

  // 다른 묶음과 같은 결정적 난수 — 같은 seed 면 같은 문제지
  function rng(seed) {
    var state = (Number(seed) >>> 0) || 1;
    return function (lo, hi) {
      state += 0x6d2b79f5;
      var t = state;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return lo + Math.floor(((t ^ t >>> 14) >>> 0) / 4294967296 * (hi - lo + 1));
    };
  }

  function isInt(value) { return typeof value === 'number' && isFinite(value) && Math.floor(value) === value; }

  /* ---- 인라인 SVG (흑백 인쇄용, viewBox 좌표로 그림) ---- */

  var SOLID = 'fill="' + INK + '"';
  var HOLLOW = 'fill="none" stroke="' + INK + '" stroke-width="1.6"';

  function svgOf(body, w, h, align) {
    return '<svg viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="' + (align || 'xMidYMid') +
      ' meet" aria-hidden="true">' + body + '</svg>';
  }
  function hline(x1, x2, y, weight) {
    return '<path d="M' + x1 + ' ' + y + 'H' + x2 + '" fill="none" stroke="' + INK + '" stroke-width="' + (weight || 1.5) + '"/>';
  }
  function vline(x, y1, y2, weight) {
    return '<path d="M' + x + ' ' + y1 + 'V' + y2 + '" fill="none" stroke="' + INK + '" stroke-width="' + (weight || 1.2) + '"/>';
  }
  function box(x, y, w, h) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="none" stroke="' + INK + '" stroke-width="1.4"/>';
  }
  function txt(x, y, value, size, anchor) {
    return '<text x="' + x + '" y="' + y + '" text-anchor="' + (anchor || 'middle') + '" font-size="' +
      (size || 12) + '" fill="' + INK + '">' + esc(value) + '</text>';
  }
  function blankBoxSVG(x, y, w, h, answer, value, size) {
    var box = '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h +
      '" fill="none" stroke="#777" stroke-width="1.1" stroke-dasharray="3 2.4"/>';
    // 문제지에도 빈 <text> 를 두어 정답지와 요소 순서를 맞춘다(정답 글자만 빨강으로 표시되게)
    if (!answer) return box + '<text></text>';
    return box + '<text x="' + (x + w / 2) + '" y="' + (y + h / 2 + (size || 12) * 0.36) +
      '" text-anchor="middle" font-size="' + (size || 12) + '" fill="' + ANSWER_INK + '">' + esc(value) + '</text>';
  }

  /* ===================== 2. 개념 정의 ===================== */

  // accept(a, b) : 개념 이름이 정하는 조건(기존 생성기가 보장하지 않으므로 여기서 거른다).
  // pool         : 조건에 맞는 서로 다른 (a, b) 의 수. t3 은 각 짝의 두 순서를 별도 식으로 쓴다.
  var CONCEPTS = {
    '0-1-0-0': {
      name: '합치는 상황과 덧셈식 연결', legacy: 'natural-add-1-1',
      accept: function (a, b) { return a >= 2 && a <= 9 && b >= 2 && b <= 9; },
      pool: 64, note: '한 자리 수 두 묶음(각 2~9개)을 합치는 상황, 합은 18 이하'
    },
    '0-1-0-1': {
      name: '수직선에서 앞으로 세기', legacy: 'add-small',
      accept: function (a, b) { return a >= 2 && a <= 9 && b >= 2 && b <= 9 && a + b <= 20; },
      pool: 64, note: '0~20 수직선에서 한 칸씩 앞으로 b칸, 시작하는 수는 2~9, 끝 수는 18 이하'
    },
    '0-1-0-2': {
      name: '두 수의 순서를 바꾸어 더하기', legacy: 'natural-add-1-1',
      accept: function (a, b) { return a >= 2 && a <= 9 && b >= 2 && b <= 9 && a < b; },
      pool: 28, note: '한 자리 수 두 수(2~9), 순서만 바꾼 짝은 한 번만 쓴다'
    }
  };

  /* ===================== 3. 기존 생성기에서 문제 뽑기 ===================== */

  var POOLS = {};

  function byDifficulty(x, y) { return x.sum - y.sum || x.a - y.a || x.b - y.b; }

  // 기존 생성기에서 조건에 맞는 (a, b) 만 남긴다. 모자라면 seed 를 바꾸어 더 뽑는다.
  function poolOf(conceptId, seed) {
    var cacheKey = conceptId + '@' + seed;
    if (POOLS[cacheKey]) return POOLS[cacheKey];
    var concept = CONCEPTS[conceptId], out = [], seen = {}, batch, i;
    if (!root.Worksheets || typeof root.Worksheets.generate !== 'function') throw Error('기존 Worksheets 생성기를 찾지 못했습니다.');
    for (batch = 0; batch < 4000 && out.length < concept.pool; batch++) {
      var rows;
      try { rows = root.Worksheets.generate(concept.legacy, (Number(seed) + batch * 104729) >>> 0, 16); }
      catch (error) { throw Error('기존 생성기 실패(' + concept.legacy + '): ' + error.message); }
      for (i = 0; i < rows.length; i++) {
        var a = Number(rows[i].a), b = Number(rows[i].b);
        if (!isInt(a) || !isInt(b) || !concept.accept(a, b)) continue;
        var key = a + ':' + b;
        if (seen[key]) continue;
        seen[key] = 1;
        out.push({ a: a, b: b, sum: a + b });
      }
    }
    out.sort(byDifficulty);
    POOLS[cacheKey] = out;
    return out;
  }

  // 문제 풀을 count 등분한 지점에서 고르게 뽑는다(앞에서만 잘라 쓰면 쉬운 문제만 나온다).
  function spread(pool, count) {
    if (count >= pool.length) return pool.slice(0, count);
    if (count <= 1) return pool.slice(0, count);
    var picked = [], used = {}, i;
    for (i = 0; i < count; i++) {
      var index = Math.round(i * (pool.length - 1) / (count - 1));
      while (used[index] && index < pool.length - 1) index += 1;
      while (used[index] && index > 0) index -= 1;
      used[index] = 1;
      picked.push(pool[index]);
    }
    return picked.sort(byDifficulty);
  }

  function pickPairs(conceptId, seed, count, cap) {
    if (count > cap) throw Error(conceptId + ': 이 유형은 ' + cap + '문항까지입니다(요청 ' + count + ').');
    var pool = poolOf(conceptId, seed);
    if (pool.length < count) throw Error(conceptId + ': 서로 다른 문제가 ' + count + '개 필요한데 ' + pool.length + '개뿐입니다.');
    // seed 로 풀을 섞어 뽑는다 — '다른 문제로' 를 누르면 다른 수가 나온다. 뽑은 뒤에는 작은 합부터 다시 늘어놓는다.
    var shuffled = pool.slice(), rand = rng((Number(seed) ^ 0x3c6ef372) >>> 0), i, j, tmp;
    for (i = shuffled.length - 1; i > 0; i--) { j = rand(0, i); tmp = shuffled[i]; shuffled[i] = shuffled[j]; shuffled[j] = tmp; }
    return spread(shuffled, count).slice().sort(function (x, y) { return (x.sum - y.sum) || (x.a - y.a); });
  }

  /* ===================== 4. 유형별 문항 만들기 ===================== */

  // (0-1-0-0-t3) 합치는 상황 문장 — 두 수를 차례로 말하는 짧은 글.
  // 자리 표시 {a} · {b} 만 바꾸어 쓴다. 모두 '합치는' 상황이다.
  var SITUATIONS = [
    '사과가 {a}개 있습니다. 사과를 {b}개 더 받았습니다.',
    '빨간 풍선이 {a}개, 파란 풍선이 {b}개 있습니다.',
    '구슬 {a}개와 구슬 {b}개를 한 통에 담았습니다.',
    '상자에 공이 {a}개 있습니다. 공 {b}개를 더 넣었습니다.',
    '밭에서 당근을 {a}개 뽑았습니다. 다시 {b}개를 뽑았습니다.',
    '수조에 금붕어가 {a}마리 있습니다. {b}마리를 더 넣었습니다.',
    '색종이 {a}장과 {b}장을 이어 붙였습니다.',
    '화분에 꽃이 {a}송이 피었습니다. 꽃이 {b}송이 더 피었습니다.',
    '책상 위에 연필이 {a}자루 있습니다. {b}자루를 더 놓았습니다.',
    '바구니에 귤이 {a}개 있습니다. 귤 {b}개를 더 담았습니다.'
  ];

  function situationText(index, a, b) {
    return SITUATIONS[index % SITUATIONS.length].replace('{a}', a).replace('{b}', b);
  }

  // (0-1-0-0-t1) 그림에 맞지 않는 식 두 개를 만들어 보기 3개를 만든다.
  function optionSet(item, rnd) {
    var a = item.a, b = item.b, sum = item.sum;
    var big = Math.max(a, b), small = Math.min(a, b);
    var correct = a + ' + ' + b + ' = ' + sum;
    var candidates = [
      big + ' − ' + small + ' = ' + (big - small),      // 빼기로 본 경우
      a + ' + ' + a + ' = ' + (a + a),                  // 두 번째 묶음을 첫 묶음과 같게 봄
      b + ' + ' + b + ' = ' + (b + b),                  // 첫 묶음을 두 번째 묶음과 같게 봄
      a + ' + ' + b + ' = ' + (sum + 1)                 // 합을 하나 크게 봄
    ];
    var wrong = [];
    for (var i = 0; i < candidates.length; i++) {
      if (candidates[i] === correct) continue;
      if (wrong.indexOf(candidates[i]) >= 0) continue;
      wrong.push(candidates[i]);
    }
    if (wrong.length < 2) throw Error('보기를 만들지 못했습니다: ' + correct);
    var picks = [], first = rnd(0, wrong.length - 1);
    picks.push(wrong[first]);
    var second = (first + 1 + rnd(0, wrong.length - 2)) % wrong.length;
    picks.push(wrong[second]);
    var options = [{ text: correct, correct: true }, { text: picks[0], correct: false }, { text: picks[1], correct: false }];
    // 보기 차례를 seed 로 섞는다(정답이 늘 첫 자리에 오지 않게).
    for (var j = options.length - 1; j > 0; j--) {
      var k = rnd(0, j), swap = options[j]; options[j] = options[k]; options[k] = swap;
    }
    return options;
  }

  /* ===================== 5. 서식(CSS) ===================== */

  var CSS = [
    // 칸 가운데 정렬(§5: 문제 줄 + 답 줄 + 아래 여백 4mm). 아래 여백은 padding 으로 잡아 둔다.
    '.g010-mid{position:absolute;left:6mm;right:1mm;top:1mm;bottom:1mm;display:flex;flex-direction:column;' +
      'align-items:center;justify-content:center;gap:1.4mm;padding-bottom:3.5mm;min-height:0;}',
    '.g010-pic{width:100%;flex:0 0 auto;}',
    '.g010-pic svg{width:100%;height:auto;display:block;}',
    '.g010-line{width:100%;flex:0 0 auto;}',
    '.g010-line svg{width:100%;height:auto;display:block;}',
    '.g010-opts{display:flex;flex-direction:column;align-items:flex-start;gap:1mm;width:auto;align-self:center;}',
    '.g010-opt{white-space:nowrap;padding:0 1.5mm;}',
    '.g010-opt.g010-pick{border:.45mm solid ' + ANSWER_INK + ';border-radius:50%;}',
    '.g010-eq{display:flex;align-items:center;justify-content:center;gap:1.6mm;white-space:nowrap;font-size:1.1em;}',
    '.g010-box{display:inline-flex;align-items:center;justify-content:center;min-width:7.5mm;height:1.3em;' +
      'border:.35mm solid #555;border-radius:.6mm;}',
    '.g010-box.g010-fixed{border-color:#111;background:#f4f4f4;font-weight:bold;}',
    '.g010-ink{color:' + ANSWER_INK + ';}',
    '.g010-text{width:100%;line-height:1.45;word-break:keep-all;text-align:center;}',
    '.g010-write{display:flex;align-items:center;justify-content:center;gap:1.5mm;width:100%;white-space:nowrap;}',
    '.g010-write .answer-space{min-width:40mm;height:1.45em;text-align:center;}',
    '.g010-pairs{position:absolute;inset:0;display:grid;grid-template-columns:70% 8% 22%;}',
    // 공용 .mt-pair{overflow:hidden} 이 열 경계의 ○를 잘라 내므로 이 묶음에서만 되돌린다.
    '.g010-pairs .mt-pair{overflow:visible;}',
    '.g010-pairs .mt-left .mt-mark{margin-left:-3.5mm;}',
    '.g010-pairs .mt-right .mt-text{font-size:1.3em;padding-left:6mm;}',
    '.g010-strip{flex:1;min-width:0;height:100%;display:flex;align-items:center;}',
    '.g010-strip svg{width:100%;height:100%;display:block;}',
    '.g010-cap{font-size:1em;}',
    '.mt-body:has(.g010-wide){grid-template-columns:1fr!important;}',
    '.mt-compact .mt-left .g010-strip{flex:none;width:var(--wl);}',
    '.mt-compact.g010-wide .mt-right .mt-text{font-size:1.25em;}',
    '.mt-compact .mt-text{font-size:1.2em;}'
  ].join('');

  var styled = false;
  function installCss() {
    if (styled || typeof document === 'undefined') return;
    if (document.getElementById('g010-style')) { styled = true; return; }
    styled = true;
    var style = document.createElement('style');
    style.id = 'g010-style';
    style.textContent = CSS;
    document.head.append(style);
  }

  /* ===================== 6. 그림 그리기 ===================== */

  // 두 묶음 그림(0-1-0-0): 상자 두 개에 낱개를 3개씩 한 줄로 담는다. 왼쪽 = 첫째 묶음.
  function objects(x, y, w, h, count, shape) {
    var rows = Math.ceil(count / 3);
    var rowY = rows <= 1 ? [y + h * 0.5] : rows === 2 ? [y + h * 0.3, y + h * 0.72] : [y + h * 0.16, y + h * 0.5, y + h * 0.84];
    var colX = [x + w * 0.18, x + w * 0.5, x + w * 0.82];
    var body = '', i;
    for (i = 0; i < count; i++) {
      var cx = colX[i % 3], cy = rowY[Math.floor(i / 3)], r = h > 80 ? 10 : 8.5;
      if (shape === 'triangle') {   // 삼각형 대신 둘째 묶음용 그림 아이콘(첫째 묶음과 다른 그림)
        var icon2 = root.IconPool ? root.IconPool.pickOther() : '1f353';
        body += '<image href="vendor/art/' + icon2 + '.svg" x="' + (cx - r * 1.3) + '" y="' + (cy - r * 1.3) + '" width="' + (r * 2.6) + '" height="' + (r * 2.6) + '" style="filter:saturate(2) contrast(1.2) brightness(.92) drop-shadow(0 0 .7px #222)"/>';
      } else if (shape === 'circle') {
        body += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" ' + HOLLOW + '/>';
      } else {
        body += '<image href="vendor/art/' + (globalThis.IconPool ? globalThis.IconPool.current() : '1f34e') + '.svg" x="' + (cx - r * 1.3) + '" y="' + (cy - r * 1.3) + '" width="' + (r * 2.6) + '" height="' + (r * 2.6) + '" style="filter:saturate(2) contrast(1.2) brightness(.92) drop-shadow(0 0 .7px #222)"/>';
      }
    }
    return body;
  }

  function groupsSVG(a, b, shape2, tall) {
    var bh = tall ? 94 : 74;
    var body = box(4, 6, 92, bh) + box(104, 6, 92, bh);
    body += objects(4, 6, 92, bh, a, 'dot');
    body += objects(104, 6, 92, bh, b, shape2 || 'triangle');
    return svgOf(body, 200, bh + 12);
  }

  // 수직선(0-1-0-1): 0~20 정수 눈금, 한 칸씩 이동. 눈금 이름은 짝수마다(20까지는 한 칸 간격이 좁다).
  //   mode 'end'  : 이동을 그려 두고 끝 수 자리를 비운다(t1)
  //   mode 'mark' : 시작점만 찍고 이동은 학생이 그린다(t3)
  //   mode 'strip': 선 잇기 왼쪽 그림 — 끝 수 없이 이동만 보여 준다(t2)
  function numberLine(q, answer, mode, options) {
    var opt = options || {};
    var W = opt.w || 200, H = opt.h || 54;
    var y = opt.axis || 36, x0 = 8, x1 = 192, step = (x1 - x0) / 20;
    var at = function (value) { return x0 + step * value; };
    var arcTop = opt.arcTop || 18;
    var labelY = opt.labelY || (y + 15);
    var body = '';
    if (opt.equation) {   // 식에 맞는 이동 표시하기: 식을 그림 안 왼쪽 위에 함께 둔다
      // 식은 가운데에 둔다(문제지 '□ + □ =' 의 끝이 x=126 이고 정답은 그 오른쪽에 쓴다)
      body += txt(100, opt.equationY || 16, q.a + ' + ' + q.b + ' =', 17, 'middle');
      if (!answer) body += '<text></text>';
      else body += '<text x="' + (100 + 29) + '" y="' + (opt.equationY || 16) + '" font-size="17" fill="' + ANSWER_INK +
        '" text-anchor="start">' + q.sum + '</text>';
    }
    body += hline(x0, x1, y, 1.5);
    var i;
    for (i = 0; i <= 20; i++) body += vline(at(i), y, y + 4.5, 1.1);
    // 이동(한 칸씩 b번)
    if (mode !== 'mark') {
      for (i = 0; i < q.b; i++) {
        var from = at(q.a + i), to = at(q.a + i + 1), mid = (from + to) / 2;
        body += '<path d="M' + from + ' ' + (y - 4) + ' Q' + mid + ' ' + (y - arcTop) + ' ' + to + ' ' + (y - 4) +
          '" fill="none" stroke="' + INK + '" stroke-width="1.5"/>';
        if (i === q.b - 1) {
          body += '<path d="M' + (to - 6) + ' ' + (y - 10) + 'L' + to + ' ' + (y - 4) + 'L' + (to - 7) + ' ' + (y - 1) + 'Z" ' + SOLID + '/>';
        }
      }
    } else {   // 정답지: 학생이 그릴 이동을 대신 그려 준다(문제지에는 같은 자리에 빈 묶음 <g> 를 둔다)
      body += '<g>';
      if (answer) {
        for (i = 0; i < q.b; i++) {
          var mx = at(q.a + i), nx = at(q.a + i + 1), mm = (mx + nx) / 2;
          body += '<path d="M' + mx + ' ' + (y - 4) + ' Q' + mm + ' ' + (y - arcTop) + ' ' + nx + ' ' + (y - 4) +
            '" fill="none" stroke="' + ANSWER_INK + '" stroke-width="1.5"/>';
        }
        body += '<path d="M' + (at(q.sum) - 6) + ' ' + (y - 10) + 'L' + at(q.sum) + ' ' + (y - 4) +
          'L' + (at(q.sum) - 7) + ' ' + (y - 1) + 'Z" fill="' + ANSWER_INK + '"/>';
      }
      body += '</g>';
    }
    // 눈금 이름(짝수). t1 은 도착한 자리에 빈 상자를 두고 그 자리의 이름을 빼며,
    // 도착한 수가 홀수일 때도 상자는 그 자리에 그린다(상자가 없으면 답을 쓸 곳이 없다).
    // 답 상자는 눈금 숫자 아래 줄에 둔다(홀수 눈금에 놓으면 옆 숫자와 겹친다). 도착한 자리의 눈금 숫자는 답이므로 뺀다.
    if (mode === 'end') body += blankBoxSVG(at(q.sum) - 9, labelY + 4, 18, 14, answer, q.sum, 12);
    for (i = 0; i <= 20; i += 2) {
      if (mode === 'end' && i === q.sum) continue;
      body += txt(at(i), labelY, i, mode === 'strip' ? 9 : mode === 'mark' ? 10 : 12);   // 선 잇기 그림은 수직선을 키우는 대신 눈금 숫자를 줄인다
    }
    body += '<circle cx="' + at(q.a) + '" cy="' + y + '" r="4.4" ' + SOLID + '/>';
    if (mode === 'strip') {
      // 선 잇기 그림: 도착 자리를 표시해 두어 이동이 끝난 곳을 알 수 있게 한다(끝 수는 쓰지 않는다).
      body += '<circle cx="' + at(q.sum) + '" cy="' + y + '" r="4.4" fill="none" stroke="' + INK + '" stroke-width="1.4"/>';
    }
    if (mode === 'mark' && answer) {
      body += '<circle cx="' + at(q.sum) + '" cy="' + y + '" r="4.4" fill="' + ANSWER_INK + '"/>';
    }
    return svgOf(body, W, H);
  }

  /* ===================== 7. 문항 만들기(서식별) ===================== */

  function itemsFor(spec, seed, count) {
    var rnd = rng((Number(seed) ^ 0x9e3779b1) >>> 0);
    // 이 유형은 28개의 수 짝에서 두 순서의 식을 만들 수 있다. 각 칸은 서로 다른 식 하나다.
    var deck = null;
    if (spec.kind === 'situation') {   // 상황 문장은 한 번씩 돌려 쓴다(같은 문장이 연달아 나오지 않게)
      deck = shuffle(SITUATIONS.map(function (_, k) { return k; }), rnd);
    }
    if (spec.kind === 'swap-blank') {
      if (count > spec.cap) throw Error(spec.concept + ': 이 유형은 ' + spec.cap + '문항까지입니다(요청 ' + count + ').');
      var base = poolOf(spec.concept, seed);
      var expressions = [];
      base.forEach(function (pair) {
        expressions.push({ a: pair.a, b: pair.b, sum: pair.sum, direction: 0, key: pair.a + ':' + pair.b });
        expressions.push({ a: pair.a, b: pair.b, sum: pair.sum, direction: 1, key: pair.b + ':' + pair.a });
      });
      // seed 로 섞어 뽑아야 '다른 문제로' 에서 다른 식이 나온다. 뽑은 뒤에는 합이 작은 식부터 다시 늘어놓는다.
      return spread(shuffle(expressions, rnd), count).slice().sort(function (x, y) { return (x.sum - y.sum) || (x.a - y.a) || (x.direction - y.direction); });
    }
    var pairs = pickPairs(spec.concept, seed, count, spec.cap);
    return pairs.map(function (pair, index) {
      var item = { a: pair.a, b: pair.b, sum: pair.sum, key: pair.a + ':' + pair.b };
      if (spec.kind === 'choose') item.options = optionSet(item, rnd);
      if (spec.kind === 'situation') item.situation = situationText(deck[index % deck.length], pair.a, pair.b);
      return item;
    });
  }

  /* ===================== 8. 격자 서식 ===================== */

  function pickWrap(cell, item, answer) {
    var wrap = el('div', 'g010-mid');
    cell.append(wrap);
    return wrap;
  }

  // 0-1-0-0-t1 그림 상황에 맞는 식 고르기
  function renderChoose(cell, item, answer) {
    installCss();
    var wrap = pickWrap(cell, item, answer);
    var pic = el('div', 'g010-pic');
    pic.innerHTML = groupsSVG(item.a, item.b, 'triangle');
    wrap.append(pic);
    var list = el('div', 'g010-opts');
    item.options.forEach(function (option) {
      var row = el('div', 'g010-opt' + (answer && option.correct ? ' g010-pick' : ''), option.text);
      list.append(row);
    });
    wrap.append(list);
  }

  // 0-1-0-0-t2 그림을 보고 식 완성하기 — 첫째 묶음은 인쇄하고 둘째 묶음과 합을 쓴다
  function renderComplete(cell, item, answer) {
    installCss();
    var wrap = pickWrap(cell, item, answer);
    var pic = el('div', 'g010-pic');
    pic.innerHTML = groupsSVG(item.a, item.b, 'triangle');
    wrap.append(pic);
    var line = el('div', 'g010-eq');
    line.append(el('span', 'g010-box g010-fixed', item.a));
    line.append(el('span', '', '+'));
    line.append(el('span', 'g010-box', answer ? item.b : NBSP));
    line.append(el('span', '', '='));
    line.append(el('span', 'g010-box', answer ? item.sum : NBSP));
    if (answer) line.classList.add('g010-ink');
    wrap.append(line);
  }

  // 0-1-0-0-t3 짧은 상황을 식으로 나타내기
  function renderSituation(cell, item, answer) {
    installCss();
    var wrap = pickWrap(cell, item, answer);
    wrap.append(el('div', 'g010-text', item.situation));
    var line = el('div', 'g010-write');
    line.append(el('span', '', '식'));
    var write = el('span', 'answer-space', answer ? item.a + ' + ' + item.b + ' = ' + item.sum : NBSP);
    if (answer) write.classList.add('g010-ink');
    line.append(write);
    wrap.append(line);
  }

  // 0-1-0-1-t1 수직선의 이동 끝 수 쓰기 / 0-1-0-1-t3 식에 맞는 이동 표시하기
  function renderLineEnd(cell, item, answer) {
    installCss();
    var wrap = pickWrap(cell, item, answer);
    wrap.append(lineBox(item, answer, 'end'));
  }
  function renderLineMark(cell, item, answer) {
    installCss();
    var wrap = pickWrap(cell, item, answer);
    wrap.append(lineBox(item, answer, 'mark'));
  }
  function lineBox(item, answer, mode) {
    var holder = el('div', 'g010-line');
    // 칸 높이(2단×9줄 = 28.9mm) 안에 내용(24.6mm) + 아래 여백 4mm 가 들어가야 한다(§5).
    // 그림을 키우면 줄 수가 줄어 문항이 줄고, 줄이면 답을 쓸 자리가 좁아진다 — 2026-10-02 실측값으로 맞췄다.
    var opt = mode === 'mark'
      ? { w: 200, h: 56, axis: 38, labelY: 52, arcTop: 12, equation: true, equationY: 15 }
      : { w: 200, h: 58, axis: 22, labelY: 36, arcTop: 18 };
    holder.innerHTML = numberLine(item, answer, mode, opt);
    return holder;
  }

  // 0-1-0-2-t2 그림에서 두 덧셈식 쓰기
  function renderTwoEquations(cell, item, answer) {
    installCss();
    var wrap = pickWrap(cell, item, answer);
    var pic = el('div', 'g010-pic');
    pic.innerHTML = groupsSVG(item.a, item.b, 'triangle', true);
    wrap.append(pic);
    var first = el('div', 'g010-eq' + (answer ? ' g010-ink' : ''));
    if (answer) {
      first.append(el('span', '', item.a + ' + ' + item.b + ' = ' + item.sum));
    } else {
      first.append(el('span', 'g010-box', NBSP), el('span', '', '+'), el('span', 'g010-box', NBSP),
        el('span', '', '='), el('span', 'g010-box', NBSP));
    }
    var second = el('div', 'g010-eq' + (answer ? ' g010-ink' : ''));
    if (answer) {
      second.append(el('span', '', item.b + ' + ' + item.a + ' = ' + item.sum));
    } else {
      second.append(el('span', 'g010-box', NBSP), el('span', '', '+'), el('span', 'g010-box', NBSP),
        el('span', '', '='), el('span', 'g010-box', NBSP));
    }
    wrap.append(first, second);
  }

  // 0-1-0-2-t3 합이 같은 식의 빈칸 채우기 — 칸마다 식 하나와 빈칸 하나.
  function renderSwapBlank(cell, item, answer) {
    installCss();
    var wrap = pickWrap(cell, item, answer);
    var first = item.direction ? item.b : item.a;
    var second = item.direction ? item.a : item.b;
    var line = el('div', 'g010-eq');
    line.append(el('span', '', first + ' + ' + second + ' = ' + second + ' +'));
    line.append(el('span', 'g010-box' + (answer ? ' g010-ink' : ''), answer ? first : NBSP));
    wrap.append(line);
  }

  /* ===================== 9. 선 잇기 서식 ===================== */

  function shuffle(list, rnd) {
    var out = list.slice();
    for (var i = out.length - 1; i > 0; i--) {
      var j = rnd(0, i), swap = out[i]; out[i] = out[j]; out[j] = swap;
    }
    return out;
  }

  function buildMatch(config) {
    var spec = BY_TYPE[config.typeId];
    var bundles = config.cols, perBundle = config.rows;
    var pairs = pickPairs(spec.concept, config.seed, bundles * perBundle, spec.cap);
    var rnd = rng((Number(config.seed) ^ 0x5bf03635) >>> 0);
    var items = [], b;
    for (b = 0; b < bundles; b++) {
      var chunk = pairs.slice(b * perBundle, (b + 1) * perBundle);
      var order = shuffle(chunk.map(function (value, index) { return index; }), rnd);
      // 제자리에 남은 짝은 그 줄만 나란한 선이 되어 답을 드러낸다 → 서로 맞바꾸어 없앤다.
      for (var i = 0; i < order.length; i++) {
        if (order[i] !== i) continue;
        var j = (i + 1) % order.length, swap = order[i]; order[i] = order[j]; order[j] = swap;
      }
      items.push({ kind: 'bundle', caption: '', pairs: chunk, order: order, rowsWeight: perBundle });
    }
    return { items: items, layout: { cols: bundles, rows: perBundle, count: pairs.length }, pairs: pairs.length };
  }

  function renderMatch(config, item, isAnswer) {
    installCss();
    var spec = BY_TYPE[config.typeId];
    var count = item.pairs.length;
    var wide = spec.kind === 'match-line';           // 수직선 그림은 한 줄 넓은 세트(왼쪽 글자 폭 크게)
    // 공용 compact 배치(동그라미가 그림·글자 바로 옆)를 쓴다. 폭(mm): 왼쪽 wl · 오른쪽 wr · 동그라미 사이 gap
    var wl = wide ? 104 : 17, wr = wide ? 22 : 17, gap = wide ? 14 : 14;
    var wrap = el('div', 'mt-pairs-wrap mt-compact' + (wide ? ' g010-wide' : ''));
    wrap.style.setProperty('--w', wl + 'mm');
    wrap.style.setProperty('--wl', wl + 'mm');
    wrap.style.setProperty('--wr', wr + 'mm');
    wrap.style.setProperty('--gap', gap + 'mm');
    var grid = el('div', 'mt-pairs');
    grid.style.gridTemplateRows = 'repeat(' + count + ', minmax(0, 1fr))';
    var rowOf = [];
    item.order.forEach(function (pairIndex, row) { rowOf[pairIndex] = row; });
    item.pairs.forEach(function (pair, index) {
      var rightPair = item.pairs[item.order[index]];
      var left = el('div', 'mt-pair mt-left');
      left.append(el('span', 'mt-idx', (index + 1) + '.'), leftCell(spec.kind, pair), el('span', 'mt-mark'));
      var right = el('div', 'mt-pair mt-right');
      // 오른쪽에는 번호를 찍지 않는다(번호만 보고 이을 수 없게).
      right.append(el('span', 'mt-mark'), rightCell(spec.kind, rightPair));
      grid.append(left, right);
    });
    wrap.append(grid);
    if (isAnswer) {
      var total = wl + wr + 18 + gap;
      var lines = item.pairs.map(function (_, index) {
        return '<line x1="' + ((wl + 7.5) / total * 1000).toFixed(1) + '" y1="' + ((index + .5) / count * 1000).toFixed(1) +
          '" x2="' + ((wl + 9 + gap + 1.5) / total * 1000).toFixed(1) + '" y2="' + ((rowOf[index] + .5) / count * 1000).toFixed(1) + '"/>';
      }).join('');
      var svg = el('div', 'mt-lines');
      svg.innerHTML = '<svg viewBox="0 0 1000 1000" preserveAspectRatio="none">' + lines + '</svg>';
      wrap.append(svg);
    }
    return wrap;
  }

  function leftCell(kind, pair) {
    if (kind === 'match-line') {
      var strip = el('span', 'g010-strip');
      strip.innerHTML = numberLine(pair, false, 'strip', { w: 200, h: 56, axis: 28, labelY: 43, arcTop: 12 });
      strip.firstChild.setAttribute('preserveAspectRatio', 'xMidYMid meet');   // 수직선을 문항 번호와 동그라미 사이 가운데에 둔다
      return strip;
    }
    return el('span', 'mt-text', pair.a + ' + ' + pair.b);
  }
  function rightCell(kind, pair) {
    if (kind === 'match-line') return el('span', 'mt-text', pair.a + ' + ' + pair.b);
    return el('span', 'mt-text', pair.b + ' + ' + pair.a);
  }

  /* ===================== 10. 유형 목록 ===================== */

  var SPECS = [
    // cap 은 그 서식의 내용 높이로 정한 최대 문항 수다(칸 높이 = 260mm ÷ 줄 수 ≥ 내용 + 4mm).
    // sheet.js 의 자동 맞춤은 절대 배치된 .g010-mid 안쪽 넘침을 볼 수 없으므로 cap 이 줄 수를 정한다.
    { typeId: '0-1-0-0-t1', concept: '0-1-0-0', kind: 'choose', format: 'g010-count-choice',
      cols: 3, rows: 5, cap: 15, fontPt: 15,
      title: '그림 상황에 맞는 식 고르기', instruction: '알맞은 답을 골라 표시하세요.' },
    { typeId: '0-1-0-0-t2', concept: '0-1-0-0', kind: 'complete', format: 'g010-count-equation',
      cols: 3, rows: 6, cap: 18, fontPt: 15,
      title: '그림을 보고 식 완성하기', instruction: '그림을 보고 식을 완성하세요.' },
    { typeId: '0-1-0-0-t3', concept: '0-1-0-0', kind: 'situation', format: 'g010-word-equation',
      cols: 2, rows: 9, cap: 18, fontPt: 14,
      // 머리말은 한 줄이라 로드맵 제목 '짧은 상황을 식으로 나타내기' 는 정답지에서 잘린다(실측 2px)
      // → 시트 제목만 '상황을 식으로 나타내기' 로 줄인다.
      title: '상황을 식으로 나타내기', instruction: '상황을 읽고 덧셈식으로 나타내세요.' },
    { typeId: '0-1-0-1-t1', concept: '0-1-0-1', kind: 'line-end', format: 'g010-line-end',
      cols: 2, rows: 9, cap: 18, fontPt: 12,
      title: '수직선의 이동 끝 수 쓰기', instruction: '수직선에서 이동이 끝난 수를 쓰세요.' },
    { typeId: '0-1-0-1-t2', concept: '0-1-0-1', kind: 'match-line', format: 'g010-match',
      cols: 2, rows: 4, cap: 8, fontPt: 13,
      title: '이동한 칸 수와 식 연결하기', instruction: '서로 알맞은 것끼리 선으로 연결하세요.' },
    { typeId: '0-1-0-1-t3', concept: '0-1-0-1', kind: 'line-mark', format: 'g010-line-mark',
      cols: 2, rows: 7, cap: 14, fontPt: 12,
      title: '식에 맞는 이동 표시하기', instruction: '식에 맞게 수직선 위에 이동을 표시하세요.' },
    { typeId: '0-1-0-2-t1', concept: '0-1-0-2', kind: 'match-swap', format: 'g010-match',
      cols: 6, rows: 4, cap: 24, fontPt: 16,
      title: '순서를 바꾼 덧셈식 짝짓기', instruction: '서로 알맞은 것끼리 선으로 연결하세요.' },
    { typeId: '0-1-0-2-t2', concept: '0-1-0-2', kind: 'two-equations', format: 'g010-count-pair',
      cols: 3, rows: 4, cap: 12, fontPt: 17,
      title: '그림에서 두 덧셈식 쓰기', instruction: '그림을 보고 덧셈식을 두 가지로 쓰세요.' },
    { typeId: '0-1-0-2-t3', concept: '0-1-0-2', kind: 'swap-blank', format: 'g010-swap-blank',
      cols: 3, rows: 10, cap: 30, fontPt: 18,
      title: '합이 같은 식의 빈칸 채우기', instruction: '빈칸에 알맞은 수를 써넣으세요.' }
  ];

  var BY_TYPE = {};
  SPECS.forEach(function (spec) { BY_TYPE[spec.typeId] = spec; });

  function generateFor(config) {
    var spec = BY_TYPE[config.typeId];
    if (!spec) throw Error('묶음 0-1-0: 알 수 없는 유형 ' + config.typeId);
    var count = config.count || config.cols * config.rows;
    return itemsFor(spec, config.seed, count);
  }

  /* ===================== 11. 등록 ===================== */

  // 서식 이름은 sheet.js 의 minimumCellMm() 이 문자열로 최소 칸 높이를 정하므로,
  // 여기서는 'picture'·'number-line' 같은 낱말을 쓰지 않는다(최소 칸 높이 10mm).
  // 문항마다 필요한 높이가 달라 규칙으로 정할 수 없고, 실제 넘침은 sheet.js 의 fits() 가
  // 칸 안의 내용 높이로 판정하므로 그 값에 맡긴다(3단 그림 15~21문항, 수직선 16~18문항).
  var RENDERERS = {
    'g010-count-choice': renderChoose,
    'g010-count-equation': renderComplete,
    'g010-count-pair': renderTwoEquations,
    'g010-word-equation': renderSituation,
    'g010-line-end': renderLineEnd,
    'g010-line-mark': renderLineMark,
    'g010-swap-blank': renderSwapBlank
  };

  function installFormats() {
    if (root.Sheet && typeof root.Sheet.register === 'function') {
      installCss();
      Object.keys(RENDERERS).forEach(function (key) { root.Sheet.register(key, RENDERERS[key]); });
    }
    if (root.MatchingSheet && root.MatchingSheet.formats) {
      root.MatchingSheet.formats['g010-match'] = {
        page: 'blocks', title: '그림과 식 연결하기',
        build: buildMatch,
        render: function (config, item, isAnswer) { return renderMatch(config, item, isAnswer); }
      };
    }
    return !!(root.Sheet && typeof root.Sheet.register === 'function' && root.MatchingSheet && root.MatchingSheet.formats);
  }

  function installGenerator() {
    var base = root.SheetGen;
    if (!base || typeof base.generate !== 'function' || base.g010Wrapped) return false;
    var original = base.generate;
    base.generate = function (config) {
      if (config && BY_TYPE[config.typeId]) return generateFor(config);
      return original.apply(this, arguments);
    };
    base.g010Wrapped = true;
    return true;
  }

  if (!installFormats()) document.addEventListener('DOMContentLoaded', installFormats, { once: true });
  if (!installGenerator()) document.addEventListener('DOMContentLoaded', installGenerator, { once: true });

  /* ===================== 12. 카탈로그 ===================== */

  function entryOf(spec) {
    return {
      typeId: spec.typeId, title: spec.title, instruction: spec.instruction,
      format: spec.format, cols: spec.cols, rows: spec.rows, count: spec.cols * spec.rows,
      fontPt: spec.fontPt, seed: 20261001, autoFit: false, maxProblems: Math.min(40, spec.cols * spec.rows),
      gen: { concept: spec.concept, kind: spec.kind }
    };
  }
  if (Array.isArray(root.SheetCatalog)) {
    var existing = {};
    root.SheetCatalog.forEach(function (entry) { existing[entry.typeId] = 1; });
    SPECS.forEach(function (spec) { if (!existing[spec.typeId]) root.SheetCatalog.push(entryOf(spec)); });
  }

  /* ===================== 13. 스스로 검사 ===================== */

  function selfTest(options) {
    var seeds = (options && options.seeds) || [1, 7, 42];
    var report = { sheets: 0, items: 0, problems: [] };
    var fail = function (message) { report.problems.push(message); };
    SPECS.forEach(function (spec) {
      seeds.forEach(function (seed) {
        var config = entryOf(spec);
        var items;
        try { items = generateFor({ typeId: spec.typeId, seed: seed, cols: spec.cols, rows: spec.rows, count: config.count }); }
        catch (error) { fail(spec.typeId + ' seed ' + seed + ': ' + error.message); return; }
        report.sheets += 1;
        report.items += items.length;
        var seen = {};
        items.forEach(function (item) {
          var key = item.key || item.a + ':' + item.b;
          if (seen[key]) fail(spec.typeId + ' seed ' + seed + ': 같은 문제가 두 번 나왔습니다(' + key + ')');
          seen[key] = 1;
          if (item.sum !== item.a + item.b) fail(spec.typeId + ' seed ' + seed + ': 합이 틀렸습니다(' + key + ')');
          var concept = CONCEPTS[spec.concept];
          if (!concept.accept(item.a, item.b)) fail(spec.typeId + ' seed ' + seed + ': 개념 조건 밖(' + key + ')');
          if (item.options) {
            var right = item.options.filter(function (option) { return option.correct; }).length;
            if (right !== 1) fail(spec.typeId + ' seed ' + seed + ': 고르기 정답이 ' + right + '개(' + key + ')');
            var texts = {};
            item.options.forEach(function (option) {
              if (texts[option.text]) fail(spec.typeId + ' seed ' + seed + ': 보기가 겹칩니다(' + option.text + ')');
              texts[option.text] = 1;
            });
          }
        });
      });
    });
    if (report.problems.length) throw Error('묶음 0-1-0 자체 검사 실패: ' + report.problems.slice(0, 6).join(' / '));
    return report;
  }

  root.G010Sheet = {
    concepts: CONCEPTS, specs: SPECS, byType: BY_TYPE, generate: generateFor,
    poolOf: poolOf, selfTest: selfTest, renderers: RENDERERS,
    buildMatch: buildMatch, renderMatch: renderMatch, numberLine: numberLine, groupsSVG: groupsSVG
  };
})(globalThis);
