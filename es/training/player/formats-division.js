(function (root) {
  'use strict';
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const numericText = v => String(v ?? '').replace(/\u202f/g, '').replace(',', '.');
  const num = v => Number(numericText(v));
  const places = v => (numericText(v).split('.')[1] || '').length;
  const isSpanish = () => root.CountryProfile?.country === 'es' || /^\/es\/training\//.test(location.pathname);
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
  // Spanish caja: dividend at left, divisor at upper right, quotient below it,
  // with the subtraction sequence continuing below the dividend.
  function divisionSvg(p, show, decimal) {
    const shift = decimal ? places(p.b) : 0;
    const factor = 10 ** shift;
    const dividend = decimal ? Number((num(p.a) * factor).toFixed(8)) : num(p.a);
    const divisor = decimal ? Number((num(p.b) * factor).toFixed(8)) : num(p.b);
    if (!Number.isFinite(dividend) || !Number.isFinite(divisor) || divisor <= 0) return '<span>\ubb38\ud56d \uc624\ub958</span>';
    const answer = numericText(p.answer ?? '');
    const precision = decimal ? Math.min(4, Math.max(places(dividend), places(answer))) : 0;
    const integerDividend = Number.isInteger(dividend) ? String(dividend) : dividend.toFixed(Math.min(precision, 4));
    const [wholeDividend, fractionalDividend = ''] = integerDividend.split('.');
    const input = decimal && precision > fractionalDividend.length
      ? wholeDividend + '.' + fractionalDividend.padEnd(precision, '0')
      : integerDividend;
    const chars = [...input], digits = chars.filter(c => c !== '.');
    const cell = 18, left = 8, topY = 41, rowH = 25;
    const wall = left + digits.length * cell + 8;
    const divisorText = String(divisor);
    const quotientColumns = Math.max(2, (answer.split(/[R…]/)[0].replace(/[^0-9]/g, '').length || 1));
    const right = wall + Math.max(quotientColumns, divisorText.length) * cell + 8;
    const t = (value, x, y, extra = '') => `<text x="${x}" y="${y}" text-anchor="end" ${extra}>${esc(value)}</text>`;
    let base = t(divisorText, right, topY), d = 0;
    for (const c of chars) {
      if (c === '.') base += t(',', left + d * cell + cell, topY);
      else base += t(c, left + (++d)*cell, topY);
    }
    base += `<path d="M${wall} 21V${topY+4}H${right+5}" fill="none" stroke="#111"/>`;
    let rem = 0, started = false, steps = 0, work = '', quotient = '', qFraction = '';
    const decimalAt = input.includes('.') ? input.indexOf('.') : digits.length;
    for (let i = 0; i < digits.length; i++) {
      const n = rem * 10 + Number(digits[i]), q = Math.floor(n / divisor);
      rem = n - q * divisor;
      const isFraction = i >= decimalAt;
      if (!started && q === 0 && i < digits.length - 1 && i < decimalAt - 1) { quotient += ' '; continue; }
      if (isFraction) qFraction += String(q);
      else { started = true; quotient += String(q); }
      const x = left + (i + 1) * cell, y = topY + 16 + steps * rowH;
      if (steps) work += t(n, x, y);
      work += t('−' + q * divisor, x, y + 14);
      work += `<path d="M${x-Math.max(String(n).length,String(q*divisor).length+1)*cell} ${y+17}H${x+2}" fill="none"/>`;
      if (i === digits.length - 1) work += t(rem, x, y + 31);
      steps++;
    }
    // Quotient belongs directly below the divisor in Spanish caja notation.
    let qtop = '', qx = right;
    let qShown = quotient.trim() || '0';
    if (decimal && precision) qShown += ',' + qFraction.padEnd(precision, '0');
    qShown = qShown.replace(/^0+(?=\d)/, '') || '0';
    if (qShown.startsWith(',')) qShown = '0' + qShown;
    for (let i = 0; i < qShown.length; i++) qtop += t(qShown[i], qx - (qShown.length - i - 1) * cell, topY + rowH);
    if (!decimal && rem) qtop += t('resto ' + rem, right, topY + rowH * 2);
    const qdigits = String(answer).split(/\s*R\s*|…/)[0].replace(/[^0-9]/g, '').length || 1;
    const workLines = Math.max(4, qdigits * 2 + 2);
    const width = right + 12;
    const height = Math.max(topY + 16 + steps*rowH + 20, topY + workLines*17 + 6);
    let blank = '';
    // 학생용 빈 풀이 공간에는 보조 가로선을 넣지 않는다.
    const spanish = isSpanish();
    const display = v => spanish ? numericText(v).replace('.', ',') : String(v ?? '');
    const note = decimal && shift ? `<div class="division-shift-note">${esc(display(p.a))} : ${esc(display(p.b))}${show ? ` → ${esc(display(dividend))} : ${esc(display(divisor))}` : '　소수점 이동'}</div>` : '';
    return `<div class="division-format${note ? ' with-note' : ''}">${note}<svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMin meet" role="img" aria-label="${esc(display(p.a))} 나누기 ${esc(display(p.b))}"><g>${base}</g>${show ? `<g class="answer-ink" fill="#d71f10" stroke-width=".8">${qtop}${work}</g>` : blank}</svg></div>`;
  }
  function longDivision(cell, p, show) { style(); cell.innerHTML += divisionSvg(p, show, isSpanish() && (places(p.a) > 0 || places(p.b) > 0)); }
  function decimalDivision(cell, p, show) { style(); cell.innerHTML += divisionSvg(p, show, true); }
  function spanishDivision(cell, p, show, decimal = false) {
    style(); cell.innerHTML += divisionSvg(p, show, decimal);
  }
  function horizontalDivision(cell, p, show) {
    style();
    const q = Math.floor(num(p.a) / num(p.b)), r = num(p.a) % num(p.b);
    const answer = String(p.answer ?? '');
    const quotient = Number.isFinite(q) ? q : answer.split(/\s|R|…/)[0];
    cell.innerHTML += `<div class="division-horizontal"><span>${esc(p.a)} : ${esc(p.b)} =</span><span class="division-box">${show ? esc(quotient) : ''}</span><span>resto</span><span class="division-box remainder-box">${show ? esc(r) : ''}</span></div>`;
  }
  function register() {
    if (!root.Sheet || typeof root.Sheet.register !== 'function') return false;
    root.Sheet.register('long-division', longDivision);
    root.Sheet.register('horizontal-division', horizontalDivision);
    root.Sheet.register('decimal-division', decimalDivision);
    root.Sheet.renderSpanishDivision = spanishDivision;
    return true;
  }
  if (!register()) document.addEventListener('DOMContentLoaded', register, {once:true});
})(globalThis);
