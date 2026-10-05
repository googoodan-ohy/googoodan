(function (root) {
  'use strict';
  // Keep operands and answers from the site's worksheet generator. Only select,
  // deduplicate and order its output here.
  function carries(a, b, op) {
    let incoming = 0, count = 0, consecutive = 0, longest = 0;
    while (a || b) {
      const x = a % 10, y = b % 10;
      incoming = op === '+' ? Number(x + y + incoming >= 10) : Number(x - incoming < y);
      count += incoming;
      consecutive = incoming ? consecutive + 1 : 0;
      longest = Math.max(longest, consecutive);
      a = Math.floor(a / 10); b = Math.floor(b / 10);
    }
    return { count, longest };
  }
  function matches(q, gen) {
    const a = Number(q.a), b = Number(q.b);
    const decimal = String(gen.legacyId || '').startsWith('decimal-');
    if (!Number.isFinite(a) || !Number.isFinite(b) || (!decimal && (!Number.isInteger(a) || !Number.isInteger(b)))) return false;
    if (gen.selection === 'regroup' && !carries(a, b, q.op).count) return false;
    if (gen.selection === 'no-regroup' && carries(a, b, q.op).count) return false;
    if (gen.selection === 'across-zero' && !(String(a).includes('0') && carries(a, b, q.op).count)) return false;
    if (gen.carries != null && carries(a, b, q.op).count !== gen.carries) return false;
    if (gen.consecutiveBorrows && carries(a, b, '−').longest < gen.consecutiveBorrows) return false;
    if (gen.tables && !gen.tables.includes(a)) return false;
    if (gen.minA != null && a < gen.minA) return false;
    if (gen.maxA != null && a > gen.maxA) return false;
    if (gen.minB != null && b < gen.minB) return false;
    if (gen.maxB != null && b > gen.maxB) return false;
    return true;
  }
  function easy(q) { return /[01]/.test(String(q.a) + String(q.b)); }
  function difficulty(q) {
    return Number(q.a) + Number(q.b) + carries(Number(q.a), Number(q.b), q.op).count * 100;
  }
  function generate(config) {
    if (!root.Worksheets || typeof root.Worksheets.generate !== 'function') throw Error('기존 Worksheets 생성기를 찾지 못했습니다.');
    const gen = config.gen || {}, count = config.count || config.cols * config.rows;
    const decimal = String(gen.legacyId || '').startsWith('decimal-');
    const chosen = [], seen = new Set(), easyLimit = Math.floor(count * 0.1);
    let easyCount = 0;
    // Small batches avoid exhausting finite legacy pools (e.g. 1-digit tables).
    for (let batch = 0; batch < 2000 && chosen.length < count; batch++) {
      let candidates;
      try { candidates = root.Worksheets.generate(gen.legacyId, (Number(config.seed) + batch * 104729) >>> 0, 16); }
      catch (error) { throw Error('기존 생성기 실패: ' + error.message); }
      for (const original of candidates) {
        const q = { ...original };
        const key = [q.a, q.op, q.b].join(':');
        if (seen.has(key) || !matches(q, gen)) continue;
        if (!decimal && easy(q) && easyCount >= easyLimit) continue;
        seen.add(key); chosen.push(q); if (!decimal && easy(q)) easyCount++;
        if (chosen.length === count) break;
      }
    }
    if (chosen.length !== count) throw Error(config.typeId + ': 조건에 맞는 고유 문항 ' + count + '개 중 ' + chosen.length + '개만 생성했습니다.');
    chosen.sort((a, b) => difficulty(a) - difficulty(b) || Number(a.a) - Number(b.a) || Number(a.b) - Number(b.b));
    if (config.format === 'blank-equation') chosen.forEach((q, i) => { q.mask = i % 3; });
    return chosen;
  }
  root.SheetGen = { generate, carries, matches };
})(globalThis);
