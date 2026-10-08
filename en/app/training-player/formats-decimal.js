(function (root) {
  'use strict';
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function style() {
    if (document.getElementById('decimal-format-style')) return;
    const el = document.createElement('style'); el.id = 'decimal-format-style';
    el.textContent = `
      .decimal-stack {width:max-content;max-width:100%;margin:0 auto;font-variant-numeric:tabular-nums;font-size:12pt;}
      .decimal-stack .decimal-row {display:grid;grid-template-columns:1em repeat(var(--whole),1.05em) .46em repeat(var(--fraction),1.05em);min-height:1.35em;align-items:center;text-align:center;}
      .decimal-stack .decimal-row span {min-width:0;}
      .decimal-stack .decimal-carry {height:.8em;min-height:.8em;}
      .decimal-stack .decimal-carry span:not(:first-child) {border:1px solid #bbb;height:.8em;}
      .decimal-stack .decimal-rule {border-top:1px solid #111;}
      .decimal-stack .decimal-answer {color:#d71f10;}
      .decimal-stack .decimal-partial {color:#d71f10;font-size:10pt;}
      .decimal-stack .decimal-unit-note {font-size:8pt;white-space:nowrap;margin-top:1mm;}
    `;
    document.head.appendChild(el);
  }
  function cells(value, whole, fraction, sign) {
    const [left, right = ''] = String(value ?? '').split('.');
    const out = [`<span>${esc(sign || '')}</span>`];
    for (let i = whole - 1; i >= 0; i--) out.push(`<span>${esc(left[left.length - i - 1] || '')}</span>`);
    out.push(`<span>${right ? '.' : ''}</span>`);
    for (let i = 0; i < fraction; i++) out.push(`<span>${esc(right[i] || '')}</span>`);
    return out.join('');
  }
  function row(value, whole, fraction, sign = '', klass = '') {
    return `<div class="decimal-row ${klass}">${cells(value, whole, fraction, sign)}</div>`;
  }
  function decimalAddSub(cell, p, show) {
    style();
    const whole = Math.max(2, ...[p.a,p.b,p.answer].map(v => String(v).split('.')[0].length));
    const fraction = Math.max(1, ...[p.a,p.b,p.answer].map(v => (String(v).split('.')[1] || '').length));
    const op = p.op === '−' || p.op === '-' ? '−' : '+';
    cell.innerHTML += `<div class="decimal-stack" style="--whole:${whole};--fraction:${fraction}"><div class="decimal-row decimal-carry">${Array(whole+fraction+2).fill('<span></span>').join('')}</div>${row(p.a,whole,fraction)}${row(p.b,whole,fraction,op)}<div class="decimal-rule"></div>${row(show ? p.answer : '.',whole,fraction,'','decimal-answer')}</div>`;
  }
  function decimalMul(cell, p, show) {
    style();
    const a = String(p.a), b = String(p.b), answer = String(p.answer);
    const fraction = Math.max(1, (a.split('.')[1] || '').length + (b.split('.')[1] || '').length);
    const whole = Math.max(2, a.split('.')[0].length, b.split('.')[0].length, answer.split('.')[0].length);
    const digitsA = Number(a.replace('.','')), digitsB = b.replace('.','');
    let partials = '';
    if (digitsB.length > 1) {
      [...digitsB].reverse().forEach((digit, i) => {
        const part = show ? String(digitsA * Number(digit) * 10 ** i) : '';
        partials += row(part, whole, fraction, i === digitsB.length-1 ? '+' : '', 'decimal-partial');
      });
    } else partials = row('',whole,fraction,'','decimal-partial');
    cell.innerHTML += `<div class="decimal-stack" style="--whole:${whole};--fraction:${fraction}">${row(a,whole,fraction)}${row(b,whole,fraction,'×')}<div class="decimal-rule"></div>${partials}<div class="decimal-rule"></div>${row(show ? answer : '',whole,fraction,'','decimal-answer')}<div class="decimal-unit-note">소수 자릿수: ${show ? fraction : '___'}</div></div>`;
  }
  function register() {
    if (!root.Sheet || typeof root.Sheet.register !== 'function') return false;
    root.Sheet.register('vertical-decimal-addsub', decimalAddSub);
    root.Sheet.register('decimal-vertical-addsub', decimalAddSub);
    root.Sheet.register('vertical-decimal-mul', decimalMul);
    root.Sheet.register('decimal-vertical-mul', decimalMul);
    return true;
  }
  if (!register()) document.addEventListener('DOMContentLoaded', register, {once:true});
})(globalThis);
