/* 묶음 0-0-2 — 자릿값과 수의 구성 (선행 학습 · 자연수), 19유형
 *
 * 개념 5개(0-0-2-0 ~ 0-0-2-4) × 유형 3~4개. 이 파일 하나에 유형 정의·문제 생성·전용 서식을 모두 담는다.
 * 공용 파일(sheet.js, formats-*.js, gen-bridge.js, catalog.js)과 type.html·sheet.html 은 고치지 않고
 * 이미 열려 있는 등록 지점만 쓴다.
 *   Sheet.register(key, render)          격자 서식(그림 묶기·값 쓰기·펼친 식·구성식 빈칸)
 *   MatchingSheet.formats[key] = {...}   한 쪽 단위 서식(자리표·그림 연결하기)
 *   SheetGen.generate 감싸기              이 묶음 typeId의 문제 생성(gen-bridge.js 와 같은 방식)
 *
 * 문제 생성 원칙(작업 지시대로)
 *   1) 사이트의 기존 생성기 Worksheets.generate 에서 수를 먼저 얻는다.
 *      두 자리 → natural-add-2-2, 세 자리 → natural-add-3-3, 네 자리 → natural-add-4-4,
 *      큰 수(5~8자리) → place-value(값 a). 0-0-2-0 도 natural-add-2-2 의 두 자리 수를 10~90 으로 걸러 쓴다.
 *   2) 개념 이름과 spec\spec-natural.json 의 params 가 정하는 조건(자릿수·10개씩 묶기·0의 자리)에
 *      맞지 않는 수는 버리고, 같은 수는 한 장에서 한 번만 쓴다.
 *   3) 기존 생성기 출력만으로 모자라면(특히 6~8자리 큰 수 — place-value 는 5자리까지만 준다)
 *      formats-matching.js 의 internalRows 와 같은 '같은 범위·같은 모양의 최소 대체 계산'으로만 더 뽑는다.
 *      새 문제 엔진은 만들지 않았다.
 *   4) 같은 seed 면 같은 문제. 순서는 쉬운 것 → 어려운 것(자릿수 → 수 크기).
 *
 * 0·1이 들어가는 수(§2 '쉬운 문제 10% 이하')
 *   자릿값 개념에서 0은 오히려 배워야 할 자리(4050의 백의 자리 0)라 spec 도 zeroInNonLeadingPlaces='허용'이다.
 *   그래도 §2 기준을 넘지 않게 한 장 문항의 10% 이하로만 넣고(내림), 나머지는 0·1이 없는 수로 채운다.
 *   '숫자가 나타내는 값'(t2)은 값이 0이 되는 자리(0이 나타내는 값)는 묻지 않고, 같은 숫자가 두 번
 *   나오는 수(5,054의 5)도 어느 자리인지 분명하지 않으므로 쓰지 않는다.
 *   펼친 식·구성식은 0인 자리를 항으로 쓰지 않는다(기존 place-value 생성기의 펼친 식과 같은 규칙).
 *
 * 문항 수와 서식(검수자·통합 담당이 먼저 읽을 것)
 *   spec 의 count(6·8·10·12·16)는 초안 값이고, layout-rules §2 의 최소 기준을 넘기도록 잡았다.
 *     · 자리표(t1)   §2 '표 채우기: 표 2~4개, 칸 40개 이상'
 *                    0-0-2-1 4개×8수×2자리=64칸, 0-0-2-2 3개×8수×3자리=72칸,
 *                    0-0-2-3 3개×6수×4자리=72칸, 0-0-2-4 3개×6수×8자리=144칸. 칸도 빈칸도 40개를 넘긴다.
 *     · 그림(t1·t2)  §2 '그림 세기·묶음: 3단×5줄 = 15'
 *     · 연결(t3)     §2 '선 잇기: 6~8쌍 × 3묶음 = 18~24쌍' → 6쌍 × 3묶음 = 18쌍
 *     · 값 쓰기(t2)  3단×15줄 = 45   (한 줄짜리 짧은 문답 — §2 가로셈 두 자리 기준과 같다)
 *     · 펼친 식(t3)·구성식(t4)
 *                    0-0-2-1·2·3 은 3단×14줄 = 42 (한 줄에 들어가는 식 — §2 빈칸 식 기준)
 *                    0-0-2-4 는 5~8자리라 식이 길어 두 줄로 접히므로 2단×15줄 = 30
 *                    (§2 '가로셈 — 긴 식(네 자리, 세 수, 혼합 계산) 2단×15줄 = 30' 기준)
 *   그림은 §2 의 '그림은 작게'에 맞춰 점·수 모형을 인쇄용으로 작게 그린다. 그림이 빈 종이처럼 보이지 않게
 *   점의 간격과 크기는 그리는 개수에 맞춰 칸을 채우도록 계산한다(loosePicture).
 *   서식 키는 묶음 전용(g002-*)이라 다른 묶음과 같은 페이지에 실려도 서로 덮어쓰지 않는다.
 *   spec 의 format 이름(picture-groups·picture-work·matching-lines·place-value-table·short-answer·
 *   expression-blank)과 실제 서식 키가 다른 곳은 아래 서식표에 적어 두었다(0-3-1 묶음과 같은 처리).
 *
 * 배치
 *   한 장 = 한 유형, 가로·세로를 섞지 않는다(이 묶음에는 세로셈이 없다). 문항 수는 위 표대로 고정하고
 *   (autoFit:false) 칸 높이는 줄 수로 계산했다. 정답지는 문제지와 같은 배치에 빈칸만 붉은 글씨로 채운다.
 *
 * 검증(제작자 확인)
 *   tools\check-g0-0-2.py — V8(py_mini_racer)로 이 파일을 type.html 과 같은 순서로 실행해
 *   19유형 × seed 4개를 뽑고, 자릿수·묶음 조건·정답·중복·결정성·0·1 비율을 파이썬에서 독립 검산한다.
 *   화면 쪽수·칸 여백은 tools\shot-g0-0-2.py (Edge headless) 로 확인한다.
 */
(function (root) {
  'use strict';

  /* ---------------------------------------------------------------- 공통 도구 */
  const node = (tag, cls, value) => {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (value != null) el.textContent = value;
    return el;
  };
  const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
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
  function shuffle(list, rnd) {
    const out = list.slice();
    for (let i = out.length - 1; i > 0; i--) { const j = rnd(0, i); const t = out[i]; out[i] = out[j]; out[j] = t; }
    return out;
  }
  /** 유형마다 다른 문제가 나오게 config.seed 에 typeId 를 섞는다(같은 유형·같은 seed면 같은 문제). */
  function typeSeed(config) {
    const text = String((config && config.typeId) || '');
    let hash = 0x811C9DC5;
    for (let i = 0; i < text.length; i++) { hash ^= text.charCodeAt(i); hash = Math.imul(hash, 0x01000193); }
    return (((Number(config && config.seed) >>> 0) || 1) ^ hash) >>> 0;
  }
  /** 1,000 단위로 끊어 쓴다(기존 place-value 생성기의 toLocaleString 과 같은 표기). */
  const comma = value => String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const digitCount = value => String(value).length;
  /** §2 의 '쉬운 문제'(0이나 1이 들어간 수). */
  const isEasy = value => /[01]/.test(String(value));
  const PLACE_NAMES = ['일', '십', '백', '천', '만', '십만', '백만', '천만'];
  /** 자리표의 열 이름 — 높은 자리가 왼쪽(수와 같은 차례). */
  const placeNames = digits => PLACE_NAMES.slice(0, digits).reverse();

  /* ------------------------------------------------------------ 개념이 정하는 조건 */
  const CONCEPTS = {
    '0-0-2-0': {
      name: '10개씩 묶어 세기', short: '10개씩 묶기', digits: [2, 2], pool: 'natural-add-2-2',
      min: 10, max: 90, bundle: 10,
      note: '수는 10~90, 10개씩 묶으면 묶음 수는 1~8, 낱개는 0~9'
    },
    '0-0-2-1': { name: '두 자리 수의 자릿값', short: '두 자리 수', digits: [2, 2], pool: 'natural-add-2-2', note: '10~99' },
    '0-0-2-2': { name: '세 자리 수의 자릿값', short: '세 자리 수', digits: [3, 3], pool: 'natural-add-3-3', note: '100~999' },
    '0-0-2-3': { name: '네 자리 수의 자릿값', short: '네 자리 수', digits: [4, 4], pool: 'natural-add-4-4', note: '1000~9999' },
    '0-0-2-4': {
      name: '큰 수의 자릿값과 수의 구성', short: '큰 수', digits: [5, 8], pool: 'place-value',
      note: '5~8자리(만·십만·백만·천만). 기존 place-value 생성기는 5자리까지만 주므로 6~8자리는 같은 범위의 최소 대체 계산으로 채운다'
    }
  };

  /* ------------------------------------------------------ 기존 생성기에서 수 얻기 */
  /** 기존 생성기(Worksheets.generate)에서 개념의 자릿수 범위에 맞는 수만 모은다.
   *  자릿수가 여럿이면(5~8자리) 자릿수마다 같은 몫(quota)을 채워 한 자릿수에 쏠리지 않게 한다. */
  function collectNumbers(concept, seed, need) {
    const [loD, hiD] = concept.digits, classes = hiD - loD + 1;
    const quota = classes === 1 ? need : Math.ceil(need / classes);
    const found = new Map(), counts = new Map();
    const take = value => {
      const n = Number(value);
      if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) return;
      const d = digitCount(n);
      if (d < loD || d > hiD) return;
      if (concept.min != null && n < concept.min) return;
      if (concept.max != null && n > concept.max) return;
      if (found.has(n)) return;
      if (classes > 1 && (counts.get(d) || 0) >= quota) return;
      found.set(n, d); counts.set(d, (counts.get(d) || 0) + 1);
    };
    const short = () => {
      if (found.size < need) return true;
      if (classes === 1) return false;
      for (let d = loD; d <= hiD; d++) if ((counts.get(d) || 0) < quota) return true;
      return false;
    };
    // 1) 기존 생성기에서 먼저 뽑는다(한 번에 작게 여러 번 — 유한한 풀을 넘기지 않게).
    if (concept.pool && root.Worksheets && typeof root.Worksheets.generate === 'function') {
      for (let batch = 0; batch < 800 && short(); batch++) {
        let rows;
        try { rows = root.Worksheets.generate(concept.pool, (seed + Math.imul(batch, 2654435761)) >>> 0, 32); }
        catch (error) { break; }                       // 이 생성기를 못 쓰면 아래 최소 대체 계산만 쓴다
        if (!Array.isArray(rows)) break;
        for (const row of rows) { take(row.a); take(row.b); }
      }
    }
    // 2) 기존 생성기만으로 모자라면 같은 범위·같은 모양의 수를 결정적으로 더 뽑는다(최소 대체 계산).
    //    쓸 수 있는 수가 다 떨어지면(같은 수만 나오면) 헛도는 일 없이 멈춘다.
    const rnd = random((seed ^ 0x9E3779B9) >>> 0 || 7);
    let guard = 0, misses = 0;
    while (short() && guard++ < need * 60 && misses < 800) {
      const before = found.size;
      for (let d = loD; d <= hiD; d++) {
        if (classes > 1 && (counts.get(d) || 0) >= quota) continue;
        take(rnd(10 ** (d - 1), 10 ** d - 1));
      }
      misses = found.size > before ? 0 : misses + 1;
    }
    if (!found.size) throw Error(concept.name + ': ' + loD + '~' + hiD + '자리 수를 하나도 만들지 못했습니다.');
    return found;
  }

  /** 한 장에 쓸 수 count 개 — 자릿수별로 고르게 뽑고, 쉬운 수(0·1 포함)는 10% 이하로만,
   *  마지막에 자릿수 → 수 크기 순서(쉬운 것 → 어려운 것)로 세운다.
   *  accept 를 주면 그 조건에 맞는 수만 쓴다(예: 숫자가 나타내는 값 — 같은 숫자가 두 번 나오면 자리가 분명하지 않음). */
  function numbersFor(config, concept, count, accept) {
    const seed = typeSeed(config);
    const found = collectNumbers(concept, seed, count * 4 + 40);
    const groups = new Map();
    for (const [value, digits] of found) {
      if (isEasy(value)) continue;
      if (accept && !accept(value)) continue;
      if (!groups.has(digits)) groups.set(digits, []);
      groups.get(digits).push(value);
    }
    const keys = [...groups.keys()].sort((a, b) => a - b);
    // 자릿수별 후보를 seed 로 섞어 뽑는다(두 자리 수처럼 후보 전체가 작아도 '다른 문제로' 를 누르면 수가 바뀐다).
    const pickRnd = random((seed ^ 0x6A09E667) >>> 0 || 5);
    for (const key of keys) groups.set(key, shuffle(groups.get(key), pickRnd));
    const easyTarget = Math.floor(count * 0.1);
    const picked = [];
    let turn = 0, guard = 0;
    while (picked.length < count - easyTarget && guard++ < count * 4) {
      if (!keys.some(key => groups.get(key).length)) break;
      const key = keys[turn % keys.length];
      turn++;
      if (!groups.get(key).length) continue;
      picked.push(groups.get(key).shift());
    }
    const easy = shuffle([...found.keys()].filter(n => isEasy(n) && (!accept || accept(n))).sort((a, b) => (digitCount(a) - digitCount(b)) || (a - b)), pickRnd);
    picked.push(...easy.slice(0, Math.min(easyTarget, count - picked.length)));
    if (picked.length !== count) throw Error((config.typeId || '') + ': 수 ' + count + '개를 채우지 못했습니다(' + picked.length + '개).');
    return picked.sort((a, b) => (digitCount(a) - digitCount(b)) || (a - b));
  }

  /* ------------------------------------------------------------ 문항 만들기 */
  /** 수 n 을 자릿값 항으로 펼친다. 0인 자리는 항으로 쓰지 않는다(기존 place-value 생성기와 같다). */
  function termsOf(n) {
    const digits = String(n).split(''), len = digits.length;
    const terms = [];
    digits.forEach((digit, index) => { const value = Number(digit) * 10 ** (len - 1 - index); if (value > 0) terms.push(value); });
    return terms;
  }

  /** 수 n 에서 한 번만 나오는 0 아닌 자리들 — 이 자리만 물으면 '몇의 자리 숫자'를 밝히지 않아도 답이 하나다. */
  function singleDigitPlaces(n) {
    const digits = String(n).split('');
    const places = [];
    digits.forEach((digit, index) => { if (digit !== '0' && digits.filter(other => other === digit).length === 1) places.push(index); });
    return places;
  }
  /** 숫자가 나타내는 값(t2) — 같은 숫자가 두 번 나오는 수(2,222)는 어느 자리인지 분명하지 않으므로 쓰지 않는다. */
  function valueItems(config, concept, count) {
    const numbers = numbersFor(config, concept, count, n => singleDigitPlaces(n).length > 0);
    const rnd = random(typeSeed(config) ^ 0x5F356495);
    return numbers.map(n => {
      const digits = String(n).split(''), len = digits.length;
      const once = singleDigitPlaces(n);
      if (!once.length) throw Error(config.typeId + ': ' + n + ' 에서 물어볼 자리를 찾지 못했습니다.');
      const at = once[rnd(0, once.length - 1)], place = 10 ** (len - 1 - at);
      return { kind: 'value', n, digit: Number(digits[at]), place, answer: Number(digits[at]) * place };
    });
  }

  /** 펼쳐 쓴 수를 하나의 수로(t3) — 항이 하나뿐이면 '10,000 = □' 처럼 문제가 되지 않으므로 항이 둘 이상인 수만 쓴다. */
  function expandItems(config, concept, count) {
    return numbersFor(config, concept, count, n => termsOf(n).length >= 2).map(n => ({ kind: 'expand', n, terms: termsOf(n), answer: n }));
  }

  /** 수의 구성식에서 빈칸 채우기(t4) — 빈칸이 2곳이면 사이에 아는 항을 두어 답이 하나로 정해지게 한다. */
  function composeItems(config, concept, count) {
    const numbers = numbersFor(config, concept, count, n => termsOf(n).length >= 2);
    const rnd = random(typeSeed(config) ^ 0x1B873593);
    return numbers.map((n, index) => {
      const terms = termsOf(n);
      let blanks;
      if (terms.length >= 4 && index % 3 === 2) {
        const pairs = [];
        for (let i = 0; i < terms.length; i++) for (let j = i + 2; j < terms.length; j++) pairs.push([i, j]);
        blanks = pairs[rnd(0, pairs.length - 1)];
      } else blanks = [index % terms.length];
      return { kind: 'compose', n, terms, blanks, answers: blanks.map(at => terms[at]) };
    });
  }

  /** 자리표에 수 채우기(t1) — 표마다 수를 넣고, 자리 칸 일부를 빈칸으로 둔다. */
  const TABLE_LAYOUT = {
    '0-0-2-1': { tables: 4, perTable: 8, blankRate: 0.70 },   // 64칸
    '0-0-2-2': { tables: 4, perTable: 7, blankRate: 0.60 },   // 84칸(세 자리 이상은 한 장 30줄 이하)
    '0-0-2-3': { tables: 4, perTable: 6, blankRate: 0.60 },   // 96칸
    '0-0-2-4': { tables: 3, perTable: 6, blankRate: 0.50 }    // 144칸
  };
  function tableBlocks(config, conceptId, concept) {
    const layout = TABLE_LAYOUT[conceptId];
    const digits = concept.digits[1];                          // 표의 열 수(자릿수)는 한 장에서 고정한다
    const numbers = numbersFor(config, concept, layout.tables * layout.perTable);
    const rnd = random(typeSeed(config) ^ 0x27D4EB2F);
    const items = [];
    let blanks = 0;
    for (let t = 0; t < layout.tables; t++) {
      const values = numbers.slice(t * layout.perTable, (t + 1) * layout.perTable);
      const cells = [], targets = [];
      values.forEach((value, row) => {
        String(value).split('').forEach((digit, index) => {
          const col = digits - String(value).length + index;    // 오른쪽(낮은 자리)부터 채운다
          cells.push({ v: digit, row, col, blank: false, zero: digit === '0' });
          if (digit !== '0') targets.push(cells.length - 1);    // 0인 자리는 답이 늘 0이라 빈칸으로 두지 않는다
        });
      });
      // 빈칸은 고르게 둔다. '수' 열에 그 수가 인쇄돼 있으므로 한 줄을 다 비워도 답할 수 있다.
      // 0인 자리는 답이 늘 0이라 빈칸으로 두지 않는다(targets 에서 이미 빠져 있다).
      let filled = 0;
      const want = Math.round(targets.length * layout.blankRate);
      for (const index of shuffle(targets, rnd)) {
        if (filled >= want) break;
        cells[index].blank = true;
        filled++;
      }
      blanks += filled;
      items.push({ kind: 'table', caption: '자리표 ' + (t + 1), places: placeNames(digits), digits, rows: values, cells, blanks: filled });
    }
    return { items, blanks };
  }

  /* ---------------------------------------------------------------- 그림 그리기 */
  // 흑백 인쇄용 인라인 SVG. formats-pictures.js 와 같은 방식(점·수 모형)을 이 묶음 크기에 맞게 다시 그린다.
  const dotIcon = (cx, cy, r) => '<image href="vendor/art/' + (globalThis.IconPool ? globalThis.IconPool.current() : '1f34e') + '.svg" x="' + (Number(cx) - r * 1.3).toFixed(1) + '" y="' + (Number(cy) - r * 1.3).toFixed(1) + '" width="' + (r * 2.6).toFixed(1) + '" height="' + (r * 2.6).toFixed(1) + '" style="filter:saturate(2) contrast(1.2) brightness(.92) drop-shadow(0 0 .7px #222)"/>';
  const solid = (cx, cy, r) => dotIcon(cx, cy, r);
  const solidDot = (cx, cy, r) => '<circle cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="' + r.toFixed(2) + '" fill="#111"/>';
  const outlineBox = (x, y, w, h) => '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="none" stroke="#111" stroke-width="1.2"/>';
  const picSvg = (body, w, h) => '<svg viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="xMidYMid meet" aria-hidden="true">' + body + '</svg>';
  /** 십 모형(10개가 붙은 막대) — 10개씩 묶음과 낱개를 셈막대로 나타낸다. */
  function rod(x, y, w, h) {
    let body = '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="1" fill="#fff" stroke="#111" stroke-width="1.3"/>';
    for (let i = 1; i < 10; i++) body += '<path d="M' + x + ' ' + (y + h * i / 10).toFixed(1) + 'H' + (x + w) + '" stroke="#111" stroke-width="0.8"/>';
    return body;
  }
  /** 낱개 점 — count 개를 atMost 열 안에 고르게 놓는다. */
  function looseDots(x, y, w, h, count, atMost) {
    if (count <= 0) return '';
    const cols = Math.max(1, Math.min(atMost, count)), rows = Math.ceil(count / cols);
    const dx = cols > 1 ? w / (cols - 1) : 0, dy = rows > 1 ? h / (rows - 1) : 0;
    const r = Math.max(1, Math.min(5, (dy || dx || 10) * 0.34));
    let body = '';
    for (let i = 0; i < count; i++) body += solid(x + dx * (i % cols), y + dy * Math.floor(i / cols), r);
    return body;
  }
  /** t1 '그림을 같은 수씩 묶기' — 아직 묶지 않은 점을 늘어놓고 10개씩 묶어 세게 한다.
   *  점의 간격·크기는 개수에 맞춰 칸을 채우도록 계산한다(그림이 빈 종이처럼 보이지 않게). */
  function loosePicture(n) {
    // 한 줄에 10개씩 붙여 늘어놓는다(10개씩 묶기 쉽게). 아이콘끼리 거의 맞닿게 해 복잡해 보이지 않게 한다.
    const W = 200, H = 120, cols = n <= 10 ? Math.max(5, n) : 10, rows = Math.ceil(n / cols);
    const cell = Math.min(19, (rows > 5 ? 104 : 116) / rows, 196 / cols), r = cell / 2.6 * 1.0;
    const x0 = 100 - cell * cols / 2 + cell / 2, y0 = 60 - cell * rows / 2 + cell / 2;
    let body = '';
    for (let i = 0; i < n; i++) body += solid(x0 + cell * (i % cols), y0 + cell * Math.floor(i / cols), r);
    return picSvg(body, W, H);
  }
  /** t2 '묶음 수와 전체 수 쓰기' — 10개씩 묶인 십 모형과 낱개를 함께 그린다. */
  function bundledPicture(groups, ones) {
    const W = 200, H = 168, gap = groups > 5 ? 8 : 16;
    const rodW = Math.min(28, (188 - (groups - 1) * gap) / groups), rodH = ones > 0 ? 98 : 148;
    const totalW = groups * rodW + (groups - 1) * gap;
    const x0 = (W - totalW) / 2, y0 = ones > 0 ? 2 : (H - rodH) / 2;
    let body = '';
    for (let i = 0; i < groups; i++) body += rod(x0 + i * (rodW + gap), y0, rodW, rodH);
    if (ones > 0) {
      // 낱개는 한 줄에 5개까지, 아이콘을 크게(r=11 → 지름 약 29).
      const cols = Math.min(5, ones), rows = Math.ceil(ones / cols), dx = 34, dy = 31;
      const startX = W / 2 - (cols - 1) * dx / 2, startY = 125 + (rows === 1 ? 14 : 0);
      for (let i = 0; i < ones; i++) body += solid(startX + dx * (i % cols), startY + dy * Math.floor(i / cols), 11.5);
    }
    return picSvg(body, W, H);
  }
  /** t3 연결용 작은 그림 — 십 모형(가로로 나란히)과 낱개를 한 줄 높이(약 13mm)에 크게. */
  function miniPicture(groups, ones) {
    const W = 190, H = 62, gap = 4;
    const rodW = Math.min(14, (118 - (groups - 1) * gap) / groups), rodH = 58;
    const rodsW = groups * rodW + (groups - 1) * gap;
    const dotsW = ones > 0 ? 54 : 0, space = ones > 0 && groups > 0 ? 12 : 0;
    const x0 = (W - rodsW - space - dotsW) / 2;
    let body = '';
    for (let i = 0; i < groups; i++) body += rod(x0 + i * (rodW + gap), 2, rodW, rodH);
    if (ones > 0) {
      const cols = Math.min(5, ones), rows = Math.ceil(ones / cols), dx = 11, dy = 25;
      const startX = x0 + rodsW + space + 6, startY = rows === 1 ? 31 : 18;
      for (let i = 0; i < ones; i++) body += solid(startX + dx * (i % cols), startY + dy * Math.floor(i / cols), 5);
    }
    return picSvg(body, W, H);
  }

  /** 답을 쓰는 상자 — 정답지에서만 붉은 글씨로 답을 채운다. */
  function answerBox(value, answer, wide) {
    return node('span', 'g002-box' + (wide ? ' g002-box-wide' : '') + (answer ? ' g002-ink' : ''), answer ? String(value) : '');
  }

  /* ------------------------------------------------------------- 이 묶음 CSS */
  function installCss() {
    if (document.getElementById('g002-style')) return;
    const style = node('style');
    style.id = 'g002-style';
    style.textContent = [
      '.g002-cell{height:100%;min-width:0;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:1.2mm;overflow:hidden;}',
      '.g002-line{display:flex;flex-wrap:nowrap;align-items:baseline;justify-content:center;gap:.8mm;line-height:1.3;}',
      '.g002-compact .g002-line{gap:.5mm;line-height:1.15;}',
      '.g002-line>span{white-space:nowrap;}',
      '.g002-ask{line-height:1.3;}',
      '.g002-box{display:inline-block;min-width:14mm;height:1.3em;border:1px solid #555;text-align:center;vertical-align:-.18em;}',
      '.g002-box-wide{min-width:20mm;}',
      '.g002-ink{color:#d71f10;}',
      '.g002-num{font-variant-numeric:tabular-nums;}',
      // 자리표(한 쪽 단위) — 표 2~4개를 세로로 채운다
      '.g002-table{flex:1;min-height:0;display:grid;width:max-content;max-width:100%;align-self:center;border-top:1px solid #999;border-left:1px solid #999;font-variant-numeric:tabular-nums;}',
      '.mt-body:has(.g002-half){display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:4mm 6mm;}',
      '.mt-body:has(.g002-half) .mt-block{min-width:0;}',
      '.g002-tcell{display:flex;align-items:center;justify-content:center;min-width:0;min-height:0;overflow:hidden;border-right:1px solid #999;border-bottom:1px solid #999;padding:0 1mm;}',
      '.g002-head{background:#f2f2f2;font-size:.95em;}',
      '.g002-label{justify-content:flex-end;padding-right:3mm;background:#f7f7f7;}',
      '.g002-digit{font-size:1.15em;}',
      '.answer-page .g002-tcell .ans-fill:not(text):not(tspan){font-size:1em}',
      '.g002-blank{background:#fff;}',
      // 그림 서식(격자) — 그림은 작게, 답 쓰는 줄은 아래에
      '.g002-pic{display:flex;flex-direction:column;height:100%;min-height:0;}',
      '.g002-pic svg{flex:1;min-height:0;width:100%;display:block;}',
      '.g002-foot{flex:none;padding-top:.5mm;line-height:1.5;white-space:nowrap;text-align:center;}',
      '.g002-foot .g002-box{min-width:10mm;}.g002-foot div{white-space:nowrap}',
      // 연결 서식 — 왼쪽 44% · 오른쪽 44% 자리에 ○를 두고 가운데는 선을 긋는 자리로 비운다
      '.g002-pairs{position:absolute;inset:0;display:grid;grid-template-columns:44% 12% 44%;}',
      // 공용 서식의 .mt-pair{overflow:hidden}(formats-matching.js)이 열 경계의 ○를 반달로 자르므로 되돌린다
      '.g002-pairs .mt-pair{overflow:visible;}',
      '.g002-mini{flex:1;display:flex;align-items:center;height:100%;min-width:0;}',
      '.g002-mini svg{width:100%;height:100%;max-height:12.5mm;display:block;}',
      // 제목이 길어도 머리말에서 잘리지 않게 이 묶음 서식일 때만 머리말을 조금 작게 쓴다.
      'body[data-format^="g002-"] .sheet-head,body[data-format^="g002-"] .sheet-title{font-size:9pt;}'
    ].join('');
    document.head.append(style);
  }

  /* ------------------------------------------- 서식 1: 자리표에 수 채우기(한 쪽) */
  function renderTable(config, item, isAnswer) {
    installCss();
    const grid = node('div', 'g002-table');
    // 자리 칸은 폭을 정해 두고 표를 가운데로 모은다(두 자리 수 표가 쪽 폭만큼 늘어나 보이지 않게).
    // 4자리 이하는 한 장에 2단 × 2줄로 놓는다(표 폭을 반쪽 안에 넣는다).
    const half = item.digits <= 4;
    if (half) grid.classList.add('g002-half');
    grid.style.gridTemplateColumns = (half ? '20mm' : '30mm') + ' repeat(' + item.digits + ', minmax(0, ' + (half ? (item.digits <= 2 ? 22 : item.digits === 3 ? 18 : 14) : item.digits >= 6 ? 20 : 22) + 'mm))';
    grid.style.justifyContent = 'center';
    grid.style.gridTemplateRows = 'repeat(' + (item.rows.length + 1) + ', minmax(0, 1fr))';
    grid.append(node('div', 'g002-tcell g002-head', '수'));
    for (const place of item.places) grid.append(node('div', 'g002-tcell g002-head', place));
    item.rows.forEach((value, row) => {
      grid.append(node('div', 'g002-tcell g002-label', comma(value)));
      for (let col = 0; col < item.digits; col++) {
        const cell = item.cells.find(other => other.row === row && other.col === col);
        const box = node('div', 'g002-tcell g002-digit');
        if (!cell) { grid.append(box); continue; }             // 자릿수가 모자란 윗자리는 빈 칸으로 둔다
        if (cell.blank) {
          box.classList.add('g002-blank');
          if (isAnswer) box.append(node('span', 'g002-ink', cell.v));
        } else box.textContent = cell.v;
        grid.append(box);
      }
    });
    return grid;
  }

  /* ------------------------------------- 서식 2: 그림을 같은 수씩 묶기(격자) */
  function renderLoose(cell, question, answer) {
    installCss();
    const wrap = node('div', 'g002-pic');
    wrap.innerHTML = loosePicture(question.n);
    const foot = node('div', 'g002-foot');
    foot.append(node('span', '', '묶음 '));
    foot.append(answerBox(question.groups, answer));
    foot.append(node('span', '', '개, 낱개 '));
    foot.append(answerBox(question.ones, answer));
    foot.append(node('span', '', '개'));
    wrap.append(foot);
    cell.append(wrap);
  }

  /* ----------------------------------- 서식 3: 묶음 수와 전체 수 쓰기(격자) */
  function renderBundled(cell, question, answer) {
    installCss();
    const wrap = node('div', 'g002-pic');
    wrap.innerHTML = bundledPicture(question.groups, question.ones);
    const foot = node('div', 'g002-foot');
    const first = node('div', ''), second = node('div', '');
    first.append(node('span', '', '묶음 '), answerBox(question.groups, answer), node('span', '', '개, 낱개 '), answerBox(question.ones, answer), node('span', '', '개'));
    second.append(node('span', '', '모두 '), answerBox(question.n, answer), node('span', '', '개'));
    foot.append(first, second);
    wrap.append(foot);
    cell.append(wrap);
  }

  /* ------------------------------- 서식 4: 숫자가 나타내는 값 쓰기(격자) */
  function renderValue(cell, question, answer) {
    installCss();
    const wrap = node('div', 'g002-cell');
    // 네 자리 이상은 긴 질문이 두 줄로 접히며 마지막 줄의 답칸을 자른다.
    // 숫자 읽는 소리의 받침에 따라 이/가: 1(일)·3(삼)·6(육)·7(칠)·8(팔) 은 '이', 2(이)·4(사)·5(오)·9(구) 는 '가'
    const josa = [0, 1, 3, 6, 7, 8].includes(question.digit) ? '이' : '가';
    const prompt = digitCount(question.n) >= 4
      ? comma(question.n) + '에서 ' + question.digit + '의 값은?'
      : comma(question.n) + '에서 ' + question.digit + josa + ' 나타내는 값은?';
    wrap.append(node('div', 'g002-line', prompt));
    const blank = node('div', 'g002-line');
    blank.append(answerBox(comma(question.answer), answer, true));
    wrap.append(blank);
    cell.append(wrap);
  }

  /* ------------------------- 서식 5: 펼쳐 쓴 수를 하나의 수로 나타내기(격자) */
  function renderExpand(cell, question, answer, config) {
    installCss();
    const compact = config.typeId === '0-0-2-4-t3';
    if (compact) cell.style.padding = '1mm 1mm .5mm 6mm';
    const wrap = node('div', 'g002-cell' + (compact ? ' g002-compact' : ''));
    const line = node('div', 'g002-line');
    question.terms.forEach((term, index) => line.append(node('span', 'g002-num', (index ? '+ ' : '') + comma(term))));
    line.append(node('span', '', '='));
    line.append(answerBox(comma(question.answer), answer, true));
    wrap.append(line);
    cell.append(wrap);
  }

  /* --------------------------- 서식 6: 수의 구성식에서 빈칸 채우기(격자) */
  function renderCompose(cell, question, answer, config) {
    installCss();
    const compact = config.typeId === '0-0-2-4-t4';
    if (compact) cell.style.padding = '1mm 1mm .5mm 6mm';
    const wrap = node('div', 'g002-cell' + (compact ? ' g002-compact' : ''));
    const line = node('div', 'g002-line');
    line.append(node('span', 'g002-num', comma(question.n) + ' ='));
    question.terms.forEach((term, index) => {
      if (index) line.append(node('span', '', '+'));
      if (question.blanks.indexOf(index) >= 0) {
        line.append(answerBox(comma(question.answers[question.blanks.indexOf(index)]), answer));
      } else line.append(node('span', 'g002-num', comma(term)));
    });
    wrap.append(line);
    cell.append(wrap);
  }

  /* ---------------------------- 서식 7: 그림과 묶음 표현 연결하기(한 쪽) */
  const CIRCLED = '①②③④⑤⑥⑦⑧⑨⑩';
  const PAIRS_PER_BUNDLE = 4, BUNDLES = 8;   // 2단 × 4줄 = 8묶음, 묶음마다 4문제
  /** 묶음마다 (묶음 수, 낱개 수)가 겹치지 않는 짝 6개를 고른다(한 장에서 한 짝은 한 번만). */
  function bundleRounds(config) {
    const concept = CONCEPTS['0-0-2-0'];
    const numbers = numbersFor(config, concept, PAIRS_PER_BUNDLE * BUNDLES);
    const bundles = Array.from({ length: BUNDLES }, () => []);
    numbers.forEach((n, index) => bundles[index % BUNDLES].push({ n, groups: Math.floor(n / concept.bundle), ones: n % concept.bundle }));
    const rnd = random(typeSeed(config) ^ 0x7F4A7C15);
    for (const bundle of bundles) {
      bundle.order = shuffle(bundle.map((_, index) => index), rnd);
      // 제자리에 남은 짝(고정점)은 그 줄만 나란한 선이 되어 답을 드러낸다 → 서로 맞바꿔 없앤다.
      for (let i = 0; i < bundle.order.length; i++) {
        if (bundle.order[i] !== i) continue;
        const j = (i + 1) % bundle.order.length;
        const swap = bundle.order[i]; bundle.order[i] = bundle.order[j]; bundle.order[j] = swap;
      }
    }
    return bundles;
  }
  function buildBundleMatch(config) {
    const bundles = bundleRounds(config);
    return {
      items: bundles.map(facts => ({ kind: 'bundle', caption: '', pairs: facts, order: facts.order, rowsWeight: facts.length })),
      layout: { cols: bundles.length, rows: PAIRS_PER_BUNDLE, count: bundles.reduce((sum, facts) => sum + facts.length, 0) }
    };
  }
  function renderBundleMatch(config, item, isAnswer) {
    installCss();
    const count = item.pairs.length, cwl = 36, cwr = 28, cgap = 6;
    const wrap = node('div', 'mt-pairs-wrap mt-compact');       // 동그라미가 그림·글자 바로 옆에 붙는 2단 배치(formats-matching.js 의 compact)
    wrap.style.setProperty('--w', cwl + 'mm');
    wrap.style.setProperty('--wl', cwl + 'mm');
    wrap.style.setProperty('--wr', cwr + 'mm');
    wrap.style.setProperty('--gap', cgap + 'mm');
    const grid = node('div', 'mt-pairs');
    grid.style.gridTemplateRows = 'repeat(' + count + ', minmax(0, 1fr))';
    const rowOf = [];
    item.order.forEach((pairIndex, row) => { rowOf[pairIndex] = row; });
    item.pairs.forEach((pair, index) => {
      const left = node('div', 'mt-pair mt-left');
      const mini = node('span', 'mt-text g002-mini');
      mini.innerHTML = miniPicture(pair.groups, pair.ones);
      left.append(node('span', 'mt-idx', (index + 1) + '.'), mini, node('span', 'mt-mark'));
      const linked = item.pairs[item.order[index]];
      const right = node('div', 'mt-pair mt-right');
      right.append(node('span', 'mt-mark'), node('span', 'mt-text', linked.groups + '묶음 ' + linked.ones + '낱개'));
      grid.append(left, right);
    });
    wrap.append(grid);
    if (isAnswer) {
      const total = cwl + cwr + 18 + cgap;
      const x1 = ((cwl + 7.5) / total * 1000).toFixed(1), x2 = ((cwl + 9 + cgap + 1.5) / total * 1000).toFixed(1);
      const lines = item.pairs.map((_, index) => '<line x1="' + x1 + '" y1="' + ((index + .5) / count * 1000).toFixed(1) +
        '" x2="' + x2 + '" y2="' + ((rowOf[index] + .5) / count * 1000).toFixed(1) + '"/>').join('');
      const svg = node('div', 'mt-lines');
      svg.innerHTML = '<svg viewBox="0 0 1000 1000" preserveAspectRatio="none">' + lines + '</svg>';
      wrap.append(svg);
    }
    return wrap;
  }

  /* ------------------------------------------------------------ 유형 정의 */
  // 머리말은 한 줄(이름·날짜·시간 칸과 함께)이라 제목이 길면 끝이 잘린다(1회차 검수 지적).
  // 유형 이름 뒤에 괄호로 개념의 짧은 이름만 붙여 20자 안쪽으로 둔다.
  const SHORT_TASK = {
    loose: '그림을 같은 수씩 묶기', bundled: '묶음 수와 전체 수 쓰기', match: '그림과 묶음 표현 연결하기',
    table: '자리표에 수 채우기', value: '숫자가 나타내는 값 쓰기', expand: '펼친 수를 하나의 수로', compose: '구성식에서 빈칸 채우기'
  };
  // 서식 키 → 문제를 만드는 방법. 격자 서식은 Sheet.register, 한 쪽 서식은 MatchingSheet.formats 에 건다.
  const SPECS = [
    // 0-0-2-0 — 10개씩 묶어 세기(그림)
    { typeId: '0-0-2-0-t1', conceptId: '0-0-2-0', task: 'loose', format: 'g002-loose', cols: 2, rows: 5, fontPt: 14,
      title: '10개씩 묶어 세기 · 그림을 같은 수씩 묶기', instruction: '그림을 살펴보고 10개씩 묶어서 답을 쓰세요.' },
    { typeId: '0-0-2-0-t2', conceptId: '0-0-2-0', task: 'bundled', format: 'g002-bundled', cols: 3, rows: 5, fontPt: 14,
      title: '10개씩 묶어 세기 · 묶음 수와 전체 수 쓰기', instruction: '그림을 살펴보고 알맞은 답을 쓰세요.' },
    { typeId: '0-0-2-0-t3', conceptId: '0-0-2-0', task: 'match', format: 'g002-bundle-match', cols: 8, rows: 4, fontPt: 14,
      title: '10개씩 묶어 세기 · 그림과 묶음 표현 연결하기', instruction: '그림과 알맞은 묶음 표현을 선으로 연결하세요.' },
    // 자리표에 수 채우기
    { typeId: '0-0-2-1-t1', conceptId: '0-0-2-1', task: 'table', format: 'g002-place-table', cols: 1, rows: 4, fontPt: 14,
      title: '두 자리 수의 자릿값 · 자리표에 수 채우기', instruction: '빈칸에 알맞은 수를 써넣으세요.' },
    { typeId: '0-0-2-2-t1', conceptId: '0-0-2-2', task: 'table', format: 'g002-place-table', cols: 1, rows: 4, fontPt: 14,
      title: '세 자리 수의 자릿값 · 자리표에 수 채우기', instruction: '빈칸에 알맞은 수를 써넣으세요.' },
    { typeId: '0-0-2-3-t1', conceptId: '0-0-2-3', task: 'table', format: 'g002-place-table', cols: 1, rows: 4, fontPt: 14,
      title: '네 자리 수의 자릿값 · 자리표에 수 채우기', instruction: '빈칸에 알맞은 수를 써넣으세요.' },
    { typeId: '0-0-2-4-t1', conceptId: '0-0-2-4', task: 'table', format: 'g002-place-table', cols: 1, rows: 3, fontPt: 14,
      title: '큰 수의 자릿값 · 자리표에 수 채우기', instruction: '빈칸에 알맞은 수를 써넣으세요.' },
    // 숫자가 나타내는 값 쓰기
    { typeId: '0-0-2-1-t2', conceptId: '0-0-2-1', task: 'value', format: 'g002-value', cols: 3, rows: 10, fontPt: 14,
      title: '두 자리 수의 자릿값 · 숫자가 나타내는 값 쓰기', instruction: '숫자가 나타내는 값을 쓰세요.' },
    { typeId: '0-0-2-2-t2', conceptId: '0-0-2-2', task: 'value', format: 'g002-value', cols: 3, rows: 10, fontPt: 14,
      title: '세 자리 수의 자릿값 · 숫자가 나타내는 값 쓰기', instruction: '숫자가 나타내는 값을 쓰세요.' },
    { typeId: '0-0-2-3-t2', conceptId: '0-0-2-3', task: 'value', format: 'g002-value', cols: 3, rows: 10, fontPt: 14,
      title: '네 자리 수의 자릿값 · 숫자가 나타내는 값 쓰기', instruction: '숫자가 나타내는 값을 쓰세요.' },
    { typeId: '0-0-2-4-t2', conceptId: '0-0-2-4', task: 'value', format: 'g002-value', cols: 3, rows: 10, fontPt: 13,
      title: '큰 수의 자릿값과 수의 구성 · 숫자가 나타내는 값 쓰기', instruction: '숫자가 나타내는 값을 쓰세요.' },
    // 펼쳐 쓴 수를 하나의 수로 나타내기
    { typeId: '0-0-2-1-t3', conceptId: '0-0-2-1', task: 'expand', format: 'g002-expand', cols: 3, rows: 11, fontPt: 18,
      title: '두 자리 수의 자릿값 · 펼쳐 쓴 수를 하나의 수로 나타내기', instruction: '펼쳐 쓴 수를 하나의 수로 나타내세요.' },
    { typeId: '0-0-2-2-t3', conceptId: '0-0-2-2', task: 'expand', format: 'g002-expand', cols: 3, rows: 10, fontPt: 15,
      title: '세 자리 수의 자릿값 · 펼쳐 쓴 수를 하나의 수로 나타내기', instruction: '펼쳐 쓴 수를 하나의 수로 나타내세요.' },
    { typeId: '0-0-2-3-t3', conceptId: '0-0-2-3', task: 'expand', format: 'g002-expand', cols: 2, rows: 15, fontPt: 15,
      title: '네 자리 수의 자릿값 · 펼쳐 쓴 수를 하나의 수로 나타내기', instruction: '펼쳐 쓴 수를 하나의 수로 나타내세요.' },
    { typeId: '0-0-2-4-t3', conceptId: '0-0-2-4', task: 'expand', format: 'g002-expand', cols: 1, rows: 20, fontPt: 12,
      title: '큰 수의 자릿값과 수의 구성 · 펼쳐 쓴 수를 하나의 수로 나타내기', instruction: '펼쳐 쓴 수를 하나의 수로 나타내세요.' },
    // 수의 구성식에서 빈칸 채우기
    { typeId: '0-0-2-1-t4', conceptId: '0-0-2-1', task: 'compose', format: 'g002-compose', cols: 3, rows: 11, fontPt: 18,
      title: '두 자리 수의 자릿값 · 수의 구성식에서 빈칸 채우기', instruction: '빈칸에 알맞은 수를 써넣으세요.' },
    { typeId: '0-0-2-2-t4', conceptId: '0-0-2-2', task: 'compose', format: 'g002-compose', cols: 3, rows: 10, fontPt: 15,
      title: '세 자리 수의 자릿값 · 수의 구성식에서 빈칸 채우기', instruction: '빈칸에 알맞은 수를 써넣으세요.' },
    { typeId: '0-0-2-3-t4', conceptId: '0-0-2-3', task: 'compose', format: 'g002-compose', cols: 2, rows: 15, fontPt: 15,
      title: '네 자리 수의 자릿값 · 수의 구성식에서 빈칸 채우기', instruction: '빈칸에 알맞은 수를 써넣으세요.' },
    { typeId: '0-0-2-4-t4', conceptId: '0-0-2-4', task: 'compose', format: 'g002-compose', cols: 1, rows: 20, fontPt: 12,
      title: '큰 수의 자릿값과 수의 구성 · 수의 구성식에서 빈칸 채우기', instruction: '빈칸에 알맞은 수를 써넣으세요.' }
  ];

  /** 한 유형의 문항 배열 — 격자 서식은 SheetGen 이, 한 쪽 서식은 build 가 부른다. */
  function generateFor(config) {
    const spec = SPECS.find(item => item.typeId === config.typeId);
    if (!spec) throw Error('묶음 0-0-2에 없는 유형입니다: ' + config.typeId);
    const concept = CONCEPTS[spec.conceptId];
    const count = config.count || config.cols * config.rows;
    if (spec.task === 'loose' || spec.task === 'bundled') {
      // 그림을 한 줄 10개씩 늘어놓는 t1 은 59 이하(최대 6줄)만 써야 아이콘이 읽히는 크기로 들어간다.
      return numbersFor(config, concept, count, spec.task === 'loose' ? n => n <= 59 : null).map(n => ({ n, groups: Math.floor(n / concept.bundle), ones: n % concept.bundle }));
    }
    if (spec.task === 'value') return valueItems(config, concept, count);
    if (spec.task === 'expand') return expandItems(config, concept, count);
    if (spec.task === 'compose') return composeItems(config, concept, count);
    // 한 쪽 단위 서식(자리표·연결)은 MatchingSheet.build 가 그린다. 여기서는 같은 문항을 그대로 돌려준다.
    if (spec.task === 'table') return tableBlocks(config, spec.conceptId, concept).items;
    if (spec.task === 'match') return buildBundleMatch(config).items;
    throw Error('묶음 0-0-2에 없는 서식입니다: ' + spec.task);
  }

  /* ------------------------------------------------------------ 서식 등록 */
  if (root.MatchingSheet && root.MatchingSheet.formats) {
    // 자리표: 한 쪽에 표 2~4개를 세로로 채운다(표 칸·빈칸 40개 이상).
    root.MatchingSheet.formats['g002-place-table'] = {
      page: 'blocks', title: '자리표',
      build: config => {
        const spec = SPECS.find(item => item.typeId === config.typeId);
        return tableBlocks(config, spec.conceptId, CONCEPTS[spec.conceptId]);
      },
      render: (config, item, isAnswer) => renderTable(config, item, isAnswer)
    };
    // 그림과 묶음 표현 연결하기: 짝 만들기와 그리기를 이 묶음 규칙으로 한다.
    root.MatchingSheet.formats['g002-bundle-match'] = {
      page: 'blocks', title: '그림과 묶음 표현 연결하기',
      build: buildBundleMatch,
      render: (config, item, isAnswer) => renderBundleMatch(config, item, isAnswer)
    };
  }
  if (root.Sheet && typeof root.Sheet.register === 'function') {
    root.Sheet.register('g002-loose', renderLoose);
    root.Sheet.register('g002-bundled', renderBundled);
    root.Sheet.register('g002-value', renderValue);
    root.Sheet.register('g002-expand', renderExpand);
    root.Sheet.register('g002-compose', renderCompose);
  }

  /* --------------------------- 문제 생성 연결(gen-bridge.js 와 같은 방식으로 감싼다) */
  const MINE = new Set(SPECS.map(spec => spec.typeId));
  if (root.SheetGen && typeof root.SheetGen.generate === 'function' && !root.SheetGen.__g002) {
    const original = root.SheetGen.generate;
    root.SheetGen.generate = function (config) {
      if (config && MINE.has(config.typeId)) return generateFor(config);
      return original.apply(this, arguments);
    };
    Object.defineProperty(root.SheetGen, '__g002', { value: true });
  }

  /* ----------------------------------------------------------------- 카탈로그 */
  // 문제지 머리말은 한 줄(이름·날짜·시간 칸과 함께)이라 제목이 길면 끝이 잘린다(1회차 검수 지적).
  // 명세의 유형 이름 전체 대신 '유형 이름(개념의 짧은 이름)'으로 20자 안쪽에 맞춘다.
  function shortTitle(spec) {
    return SHORT_TASK[spec.task] + '(' + CONCEPTS[spec.conceptId].short + ')';
  }
  if (Array.isArray(root.SheetCatalog)) root.SheetCatalog.push(...SPECS.map(spec => ({
    typeId: spec.typeId, title: shortTitle(spec), instruction: spec.instruction, format: spec.format,
    cols: spec.cols, rows: spec.rows, count: spec.cols * spec.rows, fontPt: spec.fontPt,
    seed: 20261001, autoFit: false, maxProblems: /^0-0-2-[01]-/.test(spec.typeId) ? 40 : 30, gen: { conceptId: spec.conceptId, task: spec.task }
  })));

  root.GoogoodanG002 = {
    concepts: CONCEPTS, specs: SPECS, numbersFor, collectNumbers, termsOf,
    valueItems, expandItems, composeItems, tableBlocks, buildBundleMatch, generateFor
  };
})(globalThis);
