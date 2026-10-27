(function () {
  'use strict';

  var profile = window.CountryProfile;
  if (!profile || !profile.symbols) return;

  var symbols = profile.symbols;
  var multiply = typeof symbols.multiply === 'string' ? symbols.multiply : '×';
  var divide = typeof symbols.divide === 'string' ? symbols.divide : ':';
  var changedCount = 0;
  var excludedTags = { SCRIPT: true, STYLE: true, TEXTAREA: true, INPUT: true, SELECT: true };
  var processedText = typeof WeakMap !== 'undefined' ? new WeakMap() : null;
  var processedAttributes = typeof WeakMap !== 'undefined' ? new WeakMap() : null;

  function isDigitOrParen(character) {
    return !!character && /[0-9()\[\]{}]/.test(character);
  }

  function groupInteger(value) {
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  function transform(value, keep) {
    if (keep && String(value).indexOf(keep) === 0) { var rest = transformCore(String(value).slice(keep.length)); return { value: keep + rest.value, count: rest.count }; }
    return transformCore(value);
  }

  function transformCore(value) {
    var output = String(value);
    var count = 0;
    var dates = [];
    output = output.replace(/\b\d{4}[-/]\d{1,2}[-/]\d{1,2}\b/g, function (date) {
      dates.push(date); return '\uE000' + (dates.length - 1) + '\uE001';
    });
    // Keep clock notation (14:30) intact while spacing division colons.
    output = output.replace(/\b([01]?\d|2[0-3]):([0-5]\d)\b/g, function (clock) { dates.push(clock); return '\uE010' + (dates.length - 1) + '\uE011'; });
    // Treat common source formats as display strings only: no data or answer is changed.
    // A single comma followed by three digits is ambiguous with a French
    // decimal (for example 4,496). Group only unambiguous multi-group forms;
    // the affected place-value worksheet handles its source commas upstream.
    output = output.replace(/\d{1,3}(?:,\d{3}){2,}(?!\d)/g, function (n) {
      count += 1; dates.push(groupInteger(n.replace(/,/g, '')));
      return '\uE020' + (dates.length - 1) + '\uE021';
    });
    output = output.replace(/\d+(?:\.\d+)?/g, function (n) {
      var parts = n.split('.');
      var formatted = groupInteger(parts[0]);
      if (parts.length > 1) formatted += ',' + parts[1];
      if (formatted !== n) count += 1;
      return formatted;
    });
    output = output.replace(/(\d)\s*x\s*(?=\d)/gi, function (_, left) { count += 1; return left + ' × '; });
    if (multiply !== '×') output = output.replace(/×/g, function () { count += 1; return multiply; });
    if (divide !== '÷') output = output.replace(/÷/g, function () { count += 1; return ' ' + divide + ' '; });
    // Italian school arithmetic uses a spaced division colon; comparison and equality
    // signs are separated for legibility in horizontal statements.
    output = output.replace(/\s*:\s*/g, ' : ')
      .replace(/\s*([+×])\s*/g, ' $1 ')
      .replace(/\s*([=<>≤≥])\s*/g, ' $1 ')
      .replace(/(\d)(cm|mm|km|m|kg|mg|g|mL|ml|L|cl|h)(?![a-z])/gi, '$1 $2')
      .replace(/(\d)\s*(€)/g, '$1\u00a0$2')
      .replace(/[ \t]{2,}/g, ' ');
    output = output.replace(/\uE000(\d+)\uE001/g, function (_, index) { return dates[Number(index)]; });
    output = output.replace(/\uE020(\d+)\uE021/g, function (_, index) { return dates[Number(index)]; });
    output = output.replace(/\uE010(\d+)\uE011/g, function (_, index) { return dates[Number(index)]; });
    return { value: output, count: count };
  }

  function sheetTitleKeep(node) {
    var p = node.parentNode;
    if (p && p.classList && p.classList.contains('sheet-title')) { var c = window.Sheet && window.Sheet.last && window.Sheet.last.config; return String((c && c.title) || ''); }
    return '';
  }

  function transformTextNode(node) {
    if (processedText && processedText.get(node) === node.nodeValue) return;
    if (node.parentElement?.closest('.g002-line')) { if (processedText) processedText.set(node, node.nodeValue); return; }
    var result = transform(node.nodeValue, sheetTitleKeep(node));
    if (result.value !== node.nodeValue) {
      node.nodeValue = result.value;
      changedCount += result.count;
    }
    if (processedText) processedText.set(node, node.nodeValue);
  }

  function numericToken(node) {
    return !!node && String(node.textContent || node.nodeValue || '').trim().length > 0 && /^\d+$/.test(String(node.textContent || node.nodeValue || '').trim());
  }

  function decimalMarker(node) {
    if (!node || String(node.textContent || node.nodeValue || '').trim() !== '.') return false;
    var prev = node.previousSibling, next = node.nextSibling;
    while (prev && prev.nodeType === 3 && !prev.nodeValue.trim()) prev = prev.previousSibling;
    while (next && next.nodeType === 3 && !next.nodeValue.trim()) next = next.nextSibling;
    if (!numericToken(prev) || !numericToken(next)) return false;
    if (node.nodeType === 3) node.nodeValue = node.nodeValue.replace('.', ',');
    else node.textContent = ',';
    changedCount += 1;
    return true;
  }

  function visit(node) {
    if (!node) return;
    if (node.nodeType === 3) {
      if (!decimalMarker(node)) transformTextNode(node);
      return;
    }
    if (node.nodeType !== 1 && node.nodeType !== 9 && node.nodeType !== 11) return;
    if (node.nodeType === 1) {
      if (excludedTags[node.tagName]) return;
      var part = node.firstChild;
      while (part) {
        var following = part.nextSibling;
        decimalMarker(part);
        part = following;
      }
      ['title', 'aria-label'].forEach(function (name) {
        if (!node.hasAttribute(name)) return;
        var before = node.getAttribute(name);
        var prior = processedAttributes && processedAttributes.get(node);
        if (prior && prior[name] === before) return;
        var result = transform(before);
        if (result.value !== before) {
          node.setAttribute(name, result.value);
          changedCount += result.count;
        }
        if (processedAttributes) {
          prior = prior || {};
          prior[name] = node.getAttribute(name);
          processedAttributes.set(node, prior);
        }
      });
    }
    var child = node.firstChild;
    while (child) {
      var next = child.nextSibling;
      visit(child);
      child = next;
    }
  }

  function apply(root) {
    visit(root);
  }

  function applyTargets() {
    apply(document.getElementById('sheet-root'));
    apply(document.getElementById('teaching-guide'));
    var sheetRoot = document.getElementById('sheet-root');
    if (document.body && location.pathname.indexOf('/2-4-0-2-t1/') >= 0 && sheetRoot) {
      var labels = { 'cento': 'centinaia', 'dieci': 'decine', 'uno': 'unità', 'Primo': 'decimi', 'Secondo': 'centesimi' };
      sheetRoot.querySelectorAll('.g240-place-head').forEach(function (node) {
        var key = (node.textContent || '').trim();
        if (Object.prototype.hasOwnProperty.call(labels, key)) node.textContent = labels[key];
      });
    }
  }

  window.CountryDisplay = {
    apply: apply,
    stats: function () { return changedCount; }
  };

  applyTargets();
  var fitStyle = document.createElement('link');
  fitStyle.rel = 'stylesheet';
  fitStyle.href = '/it/training/it-fit.css?v=20261020-fit';
  document.head.appendChild(fitStyle);
  var layoutStyles = [fitStyle];
  ['/assets/brand.css?v=20261020-it-layout', '/assets/legacy-recovery/it/fixed-tabs.css?v=20261020-it-layout', '/assets/legacy-recovery/it/training-detail-layout.css?v=20261020-it-layout'].forEach(function (href) {
    var link = document.createElement('link'); link.rel = 'stylesheet'; link.href = href; document.head.appendChild(link); layoutStyles.push(link);
  });
  Promise.all(layoutStyles.map(function (link) {
    return new Promise(function (resolve) {
      if (link.sheet) { resolve(); return; }
      link.addEventListener('load', resolve, { once: true });
      link.addEventListener('error', resolve, { once: true });
      setTimeout(resolve, 3000);
    });
  })).then(function () {
    var layoutScript = document.createElement('script');
    layoutScript.src = '/assets/legacy-recovery/it/training-detail-layout.js?v=20261020-layout';
    document.body.appendChild(layoutScript);
  });
  var italianMathStyle = document.createElement('style');
  italianMathStyle.id = 'it-native-calculation-style';
  italianMathStyle.textContent = 'html[lang^="it"] .carry-row .vertical-digit:not(.g011-blank):not(.g21-blank),html[lang^="it"] .g21-borrow .vertical-digit:not(.g21-blank){border:0!important;background:transparent!important;color:#111!important}html[lang^="it"] .carry-row{color:#111}';
  document.head.appendChild(italianMathStyle);
  if (typeof MutationObserver !== 'undefined' && document.documentElement) {
    var observer = new MutationObserver(function () {
      applyTargets();
    });
    observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['title', 'aria-label']
    });
  }
}());
