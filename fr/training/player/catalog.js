(function (root) {
  'use strict';
  const entries = [];
  const add = (typeId, title, format, cols, rows, gen = {}, extra = {}) =>
    entries.push({ typeId, title, format, cols, rows, count: cols * rows,
      fontPt: 12, seed: 20261001, instruction: '계산하여 답을 쓰세요.', gen, ...extra });

  add('add-one-horizontal', '한 자리 덧셈', 'horizontal', 4, 10, { legacyId: 'natural-add-1-1' }, {fontPt:15});
  add('add-two-carry-vertical', '두 자리 덧셈 세로셈', 'vertical-addsub', 6, 8, {legacyId:'natural-add-2-2', carries:1});
  add('mul-two-one-vertical', '두 자리 × 한 자리', 'vertical-mul', 5, 7, {legacyId:'natural-mul-2-1'}, {workLines:4});
  add('mul-two-two-vertical', '두 자리 × 두 자리', 'vertical-mul', 4, 5, {legacyId:'natural-mul-2-2'}, {workLines:5});
  add('blank-equations', '덧셈식 빈칸 채우기', 'blank-equation', 3, 14, {legacyId:'natural-add-2-2'});
  add('division-one-digit', '세로 나눗셈 한 자리', 'long-division', 4, 5, {legacyId:'natural-div-3-1'}, {workLines:6});
  add('division-horizontal', '가로 나눗셈', 'horizontal-division', 3, 15, {legacyId:'natural-div-2-1'});
  add('decimal-division', '소수 나눗셈', 'decimal-division', 4, 4, {legacyId:'decimal-div-1'}, {workLines:8});
  add('vertical-decimal-addsub', '소수 세로 덧셈', 'vertical-decimal-addsub', 5, 8, {legacyId:'decimal-add-1'});
  add('decimal-vertical-addsub', '소수 세로 덧셈', 'decimal-vertical-addsub', 5, 8, {legacyId:'decimal-add-1'});
  add('vertical-decimal-mul', '소수 세로 곱셈', 'vertical-decimal-mul', 4, 5, {legacyId:'decimal-mul-1'});
  add('decimal-vertical-mul', '소수 세로 곱셈', 'decimal-vertical-mul', 4, 5, {legacyId:'decimal-mul-1'});
  for (const [key, title, gen, cols, rows] of [
    ['fraction-convert','가분수를 대분수로 바꾸기',{skill:'improper'},3,14],
    ['fraction-pair','가분수와 대분수',{skill:'improper'},3,14],
    ['fraction-same','분모가 같은 분수 덧셈',{op:'add'},3,12],
    ['fraction-different','분모가 다른 분수 덧셈',{op:'add'},2,12],
    ['fraction-steps','분수 덧셈 단계별 빈칸',{op:'add'},2,10]
  ]) add(key,title,key,cols,rows,gen);
  if (root.MatchingSamplesData) entries.push(...root.MatchingSamplesData);
  const topics = {add:'add',sub:'sub',mul:'mul',div:'div',fraction:'fraction',decimal:'decimal'};
  for (const key of root.ErrorFixSheet?.formats || []) {
    const topic = topics[key.replace('error-fix-','')] || 'add';
    add(key, '잘못된 계산 고치기 · ' + ({add:'덧셈',sub:'뺄셈',mul:'곱셈',div:'나눗셈',fraction:'분수',decimal:'소수'}[topic]||topic), key, 3, 4, {topic}, {fontPt:13});
  }
  for (const key of root.PictureSheet?.keys || []) {
    add(key, '그림으로 알아보기 · ' + key, key, 3, 5, {}, {fontPt:12});
  }
  // Every registered key gets a direct URL, including aliases supplied by modules.
  const existing = new Set(entries.map(e => e.format));
  for (const key of root.Sheet.renderers.keys()) if (!existing.has(key)) {
    add(key, key, key, 3, 14, {legacyId:'natural-add-2-2'});
  }
  root.SheetCatalog = entries;
})(globalThis);
