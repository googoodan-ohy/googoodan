(function (root) {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const targets = /^(?:0-4-1-[02]-t[23]|0-4-2-[0-7]-t[23]|2-4-1-[0-3]-t[23]|2-4-2-[0-3]-t[23])$/;

  function style() {
    if (document.getElementById('de-long-division-style')) return;
    const element = document.createElement('style');
    element.id = 'de-long-division-style';
    element.textContent = `
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
      .de-long-division { width:100%; height:100%; display:flex; flex-direction:column; align-items:flex-start; justify-content:center; overflow:hidden; font-variant-numeric:tabular-nums; }
      .de-long-division .equation { width:100%; font-size:10.5pt; line-height:1.2; white-space:nowrap; text-align:center; }
      .de-long-division .shift { width:100%; font-size:7.5pt; line-height:1.1; text-align:center; white-space:nowrap; }
      .de-long-division pre { max-width:100%; margin:1mm auto 0; font:8pt/1.08 Consolas,'Courier New',monospace; white-space:pre; text-align:left; }
      .de-long-division .answer-blank { display:inline-block; min-width:12mm; border-bottom:1px solid #333; height:1em; vertical-align:baseline; }
    `;
    document.head.appendChild(element);
  }

  const number = value => Number(value);
  const places = value => (String(value).split('.')[1] || '').length;
  function originalDivisionSvg(p, show, decimalMode) {
    const shift = decimalMode ? places(p.b) : 0;
    const factor = 10 ** shift;
    const dividend = decimalMode ? Number((number(p.a) * factor).toFixed(8)) : number(p.a);
    const divisor = decimalMode ? Number((number(p.b) * factor).toFixed(8)) : number(p.b);
    if (!Number.isFinite(dividend) || !Number.isFinite(divisor) || divisor <= 0) return '<span>문항 오류</span>';
    const answer = String(p.answer ?? '');
    const precision = decimalMode ? Math.max(places(dividend), places(answer)) : 0;
    const input = decimalMode ? dividend.toFixed(Math.min(precision, 4)) : String(dividend);
    const chars = [...input], digits = chars.filter(c => c !== '.');
    const cell = 18, x0 = Math.max(39, String(divisor).length * cell + 10), topY = 41, rowH = 25;
    const t = (value, x, y, extra = '') => `<text x="${x}" y="${y}" text-anchor="end" ${extra}>${esc(value)}</text>`;
    let base = t(divisor, x0 - 9, topY), digitIndex = 0;
    for (const character of chars) {
      if (character === '.') base += `<circle cx="${x0+digitIndex*cell+2}" cy="${topY-2}" r="1.5"/>`;
      else base += t(character, x0 + (++digitIndex)*cell, topY);
    }
    base += `<path d="M${x0-3} ${topY+2}Q${x0+1} ${(topY+2+24)/2} ${x0-3} 24H${x0+digits.length*cell+3}" fill="none" stroke="#111"/>`;
    let remainder = 0, started = false, steps = 0, work = '', quotient = '';
    const decimalAt = input.includes('.') ? input.indexOf('.') : digits.length;
    for (let i = 0; i < digits.length; i++) {
      const current = remainder * 10 + Number(digits[i]), qdigit = Math.floor(current / divisor);
      remainder = current - qdigit * divisor;
      if (!started && qdigit === 0 && i < digits.length - 1 && i < decimalAt - 1) { quotient += ' '; continue; }
      started = true; quotient += String(qdigit);
      const x = x0 + (i + 1) * cell, y = topY + 16 + steps * rowH;
      if (steps) work += t(current, x, y);
      work += t('−' + qdigit * divisor, x, y + 14);
      work += `<path d="M${x-Math.max(String(current).length,String(qdigit*divisor).length+1)*cell} ${y+17}H${x+2}" fill="none"/>`;
      if (i === digits.length - 1) work += t(remainder, x, y + 31);
      steps += 1;
    }
    let qtop = '', quotientIndex = 0;
    for (const character of chars) {
      if (character === '.') qtop += `<circle cx="${x0+quotientIndex*cell+2}" cy="19" r="1.5"/>`;
      else qtop += t(quotient[quotientIndex] || ' ', x0 + (++quotientIndex)*cell, 21);
    }
    if (!decimalMode && remainder) qtop += t('…' + remainder, x0 + digits.length*cell + 42, 21);
    const quotientDigits = String(answer).split(/\s*R\s*|…/)[0].replace(/[^0-9]/g, '').length || 1;
    const workLines = Math.max(4, quotientDigits * 2 + 2);
    const width = x0 + digits.length*cell + (decimalMode ? 12 : remainder ? 48 : 10);
    const height = Math.max(topY + 16 + steps*rowH + 20, topY + workLines*17 + 6);
    const note = decimalMode && shift ? `<div class="division-shift-note">${esc(p.a)} ÷ ${esc(p.b)}${show ? ` → ${esc(dividend)} ÷ ${esc(divisor)}` : '　소수점 이동'}</div>` : '';
    return `<div class="division-format${note ? ' with-note' : ''}">${note}<svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMin meet" role="img" aria-label="${esc(p.a)} 나누기 ${esc(p.b)}"><g>${base}</g>${show ? `<g class="answer-ink" fill="#d71f10" stroke-width=".8">${qtop}${work}</g>` : ''}</svg></div>`;
  }

  function originalLongDivision(cell, question, show) { style(); cell.innerHTML += originalDivisionSvg(question, show, false); }
  function originalDecimalDivision(cell, question, show) { style(); cell.innerHTML += originalDivisionSvg(question, show, true); }
  function originalHorizontalDivision(cell, question, show) {
    style();
    const quotientValue = Math.floor(number(question.a) / number(question.b));
    const remainder = number(question.a) % number(question.b);
    const answer = String(question.answer ?? '');
    const quotient = Number.isFinite(quotientValue) ? quotientValue : answer.split(/\s|R|…/)[0];
    cell.innerHTML += `<div class="division-horizontal"><span>${esc(question.a)} ÷ ${esc(question.b)} =</span><span class="division-box">${show ? esc(quotient) : ''}</span><span>나머지</span><span class="division-box remainder-box">${show ? esc(remainder) : ''}</span></div>`;
  }

  function decimal(value) {
    const text = String(value ?? '0').replace(',', '.');
    const parts = text.split('.');
    return { value:Number(text), places:(parts[1] || '').length, text };
  }

  function workingLines(a, b, answer) {
    const left = decimal(a), right = decimal(b);
    const shift = right.places;
    const factor = 10 ** shift;
    const divisor = Math.round(right.value * factor);
    const dividendValue = left.value * factor;
    const precision = Math.min(6, Math.max(0, left.places - shift));
    const dividend = dividendValue.toFixed(precision);
    const inputPlaces = (dividend.split('.')[1] || '').length;
    const answerPlaces = decimal(answer).places;
    const digits = dividend.replace('.', '') + '0'.repeat(Math.max(0, answerPlaces - inputPlaces));
    const width = Math.max(digits.length, String(answer).replace(/\D/g, '').length) + 2;
    const align = text => ' '.repeat(Math.max(0, width - String(text).length)) + text;
    const lines = [];
    let remainder = 0, started = false, places = 0;
    for (let index = 0; index < digits.length; index += 1) {
      const current = remainder * 10 + Number(digits[index]);
      const quotientDigit = divisor ? Math.floor(current / divisor) : 0;
      const product = quotientDigit * divisor;
      remainder = current - product;
      if (!started && quotientDigit === 0 && index < digits.length - 1) continue;
      started = true;
      places += 1;
      if (quotientDigit === 0 && index !== digits.length - 1) {
        lines.push(align(String(current)));
        lines.push(align('− 0'));
        lines.push(align('───'));
        continue;
      }
      if (places > 1) lines.push(align(String(current)));
      lines.push(align('− ' + String(product)));
    }
    if (shift) {
      const shiftedA = (left.value * factor).toFixed(precision).replace(/\.?0+$/, '');
      lines.unshift(shiftedA + ' : ' + String(divisor));
    }
    lines.push('Rest ' + String(remainder));
    return lines.join('\n');
  }

  function renderGerman(cell, question, show, config) {
    const a = question?.a ?? question?.dividend;
    const b = question?.b ?? question?.divisor;
    const rawAnswer = question?.answer ?? question?.quotient ?? '';
    const answer = question?.quotient ?? String(rawAnswer).split(/\s*R\s*|…/)[0];
    if (a === undefined || b === undefined) return false;
    style();
    const equation = esc(a) + ' : ' + esc(b) + ' = ' + (show ? esc(answer) : '<span class="answer-blank"></span>');
    const workText = show ? workingLines(a, b, answer) : '________________\n________________\n________________';
    const work = esc(workText);
    cell.innerHTML = '<div class="de-long-division"><div class="equation">' + equation + '</div><pre>' + work + '</pre></div>';
    const pre = cell.querySelector('.de-long-division pre');
    if (pre) pre.style.fontSize = pre.innerText.split('\n').length > 9 ? '6pt' : pre.innerText.split('\n').length > 7 ? '7pt' : '8pt';
    return true;
  }

  function registerDivisionLayouts() {
    const sheet = root.Sheet;
    if (!sheet || typeof sheet.register !== 'function' || sheet.__deDivisionLayouts) return;
    const original = sheet.register;
    sheet.register = function (format, renderer) {
      if (/^(?:long-division|ko-division-missing|ko42-division-missing|ko241-division-(?:vertical|blank)|ko242-division)$/.test(format)) {
        const wrapped = function (cell, question, show, config) {
          renderer.apply(this, arguments);
          if (config && targets.test(config.typeId)) renderGerman(cell, question, show, config);
        };
        return original.call(this, format, wrapped);
      }
      return original.apply(this, arguments);
    };
    Object.defineProperty(sheet, '__deDivisionLayouts', { value:true });
  }

  registerDivisionLayouts();
  root.DeDivision = { render:renderGerman, accepts:function (config) { return !!config && targets.test(config.typeId); } };
  if (root.Sheet && typeof root.Sheet.register === 'function') {
    root.Sheet.register('long-division', originalLongDivision);
    root.Sheet.register('horizontal-division', originalHorizontalDivision);
    root.Sheet.register('decimal-division', originalDecimalDivision);
  }
  if (!root.Sheet || typeof root.Sheet.register !== 'function') document.addEventListener('DOMContentLoaded', registerDivisionLayouts, { once:true });
})(globalThis);
