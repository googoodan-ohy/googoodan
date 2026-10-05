(function (root) {
  'use strict';
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const num = v => Number(v);
  const places = v => (String(v).split('.')[1] || '').length;
  function style() {
    if (document.getElementById('division-format-style')) return;
    const el = document.createElement('style'); el.id = 'division-format-style';
    el.textContent = `
      .division-format {width:100%;height:100%;font-variant-numeric:tabular-nums;}
      .division-format svg {display:block;width:100%;height:100%;max-width:100%;}
      .division-format.with-note svg {height:calc(100% - 4mm);}
      .division-format text {font-family:Arial,'NanumSquareRound','Malgun Gothic',sans-serif;fill:#111;font-size:18px;}
      .division-format .answer-ink text {fill:#d71f10;}
      .division-format .answer-ink path {stroke:#d71f10;}
      .division-horizontal {display:flex;align-items:flex-start;gap:1.5mm;white-space:nowrap;font-size:13.5pt;}
      .division-horizontal .division-box {display:inline-block;min-width:10mm;text-align:center;border-bottom:1px solid #111;height:1.3em;}
      .division-horizontal .remainder-box {min-width:7mm;}
      .division-shift-note {font-size:8pt;height:4mm;white-space:nowrap;}
    `;
    document.head.appendChild(el);
  }
  // Adapted from src/concept-layout/legacy-written-work.js: the same
  // digit-by-digit subtraction and bring-down sequence, fitted to a print cell.
  function divisionSvg(p, show, decimal) {
    const shift = decimal ? places(p.b) : 0;
    const factor = 10 ** shift;
    const dividend = decimal ? Number((num(p.a) * factor).toFixed(8)) : num(p.a);
    const divisor = decimal ? Number((num(p.b) * factor).toFixed(8)) : num(p.b);
    if (!Number.isFinite(dividend) || !Number.isFinite(divisor) || divisor <= 0) return '<span>문항 오류</span>';
    const answer = String(p.answer ?? '');
    const precision = decimal ? Math.max(places(dividend), places(answer)) : 0;
    const input = decimal ? dividend.toFixed(Math.min(precision, 4)) : String(dividend);
    const chars = [...input], digits = chars.filter(c => c !== '.');
    const cell = 18, x0 = Math.max(39, String(divisor).length * cell + 10), topY = 41, rowH = 25;
    const t = (value, x, y, extra = '') => `<text x="${x}" y="${y}" text-anchor="end" ${extra}>${esc(value)}</text>`;
    let base = t(divisor, x0 - 9, topY), d = 0;
    for (const c of chars) {
      if (c === '.') base += `<circle cx="${x0+d*cell+2}" cy="${topY-2}" r="1.5"/>`;
      else base += t(c, x0 + (++d)*cell, topY);
    }
    base += `<path d="M${x0-3} ${topY+2}Q${x0+1} ${(topY+2+24)/2} ${x0-3} 24H${x0+digits.length*cell+3}" fill="none" stroke="#111"/>`;
    let rem = 0, started = false, steps = 0, work = '', quotient = '';
    const decimalAt = input.includes('.') ? input.indexOf('.') : digits.length;
    for (let i = 0; i < digits.length; i++) {
      const n = rem * 10 + Number(digits[i]), q = Math.floor(n / divisor);
      rem = n - q * divisor;
      if (!started && q === 0 && i < digits.length - 1 && i < decimalAt - 1) { quotient += ' '; continue; }
      started = true; quotient += String(q);
      const x = x0 + (i + 1) * cell, y = topY + 16 + steps * rowH;
      if (steps) work += t(n, x, y);
      work += t('−' + q * divisor, x, y + 14);
      work += `<path d="M${x-Math.max(String(n).length,String(q*divisor).length+1)*cell} ${y+17}H${x+2}" fill="none"/>`;
      if (i === digits.length - 1) work += t(rem, x, y + 31);
      steps++;
    }
    let qtop = '', qi = 0;
    for (const c of chars) {
      if (c === '.') qtop += `<circle cx="${x0+qi*cell+2}" cy="19" r="1.5"/>`;
      else { qtop += t(quotient[qi] || ' ', x0 + (++qi)*cell, 21); }
    }
    if (!decimal && rem) qtop += t('…' + rem, x0 + digits.length*cell + 42, 21);
    const qdigits = String(answer).split(/\s*R\s*|…/)[0].replace(/[^0-9]/g, '').length || 1;
    const workLines = Math.max(4, qdigits * 2 + 2);
    const width = x0 + digits.length * cell + (decimal ? 12 : rem ? 48 : 10);
    const height = Math.max(topY + 16 + steps*rowH + 20, topY + workLines*17 + 6);
    let blank = '';
    // 학생용 빈 풀이 공간에는 보조 가로선을 넣지 않는다.
    const note = decimal && shift ? `<div class="division-shift-note">${esc(p.a)} ÷ ${esc(p.b)}${show ? ` → ${esc(dividend)} ÷ ${esc(divisor)}` : '　소수점 이동'}</div>` : '';
    return `<div class="division-format${note ? ' with-note' : ''}">${note}<svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMin meet" role="img" aria-label="${esc(p.a)} 나누기 ${esc(p.b)}"><g>${base}</g>${show ? `<g class="answer-ink" fill="#d71f10" stroke-width=".8">${qtop}${work}</g>` : blank}</svg></div>`;
  }
  function longDivision(cell, p, show) { style(); cell.innerHTML += divisionSvg(p, show, false); }
  function decimalDivision(cell, p, show) { style(); cell.innerHTML += divisionSvg(p, show, true); }
  function horizontalDivision(cell, p, show) {
    style();
    const q = Math.floor(num(p.a) / num(p.b)), r = num(p.a) % num(p.b);
    const answer = String(p.answer ?? '');
    const quotient = Number.isFinite(q) ? q : answer.split(/\s|R|…/)[0];
    cell.innerHTML += `<div class="division-horizontal"><span>${esc(p.a)} ÷ ${esc(p.b)} =</span><span class="division-box">${show ? esc(quotient) : ''}</span><span>나머지</span><span class="division-box remainder-box">${show ? esc(r) : ''}</span></div>`;
  }
  function register() {
    if (!root.Sheet || typeof root.Sheet.register !== 'function') return false;
    root.Sheet.register('long-division', longDivision);
    root.Sheet.register('horizontal-division', horizontalDivision);
    root.Sheet.register('decimal-division', decimalDivision);
    return true;
  }
  if (!register()) document.addEventListener('DOMContentLoaded', register, {once:true});
})(globalThis);
