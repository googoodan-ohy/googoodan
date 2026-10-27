(function () {
  'use strict';

  var profile = window.CountryProfile;
  if (!profile || !profile.symbols) return;

  var symbols = profile.symbols;
  var multiply = typeof symbols.multiply === 'string' ? symbols.multiply : '·';
  var divide = typeof symbols.divide === 'string' ? symbols.divide : ':';
  var changedCount = 0;
  var excludedTags = { SCRIPT: true, STYLE: true, TEXTAREA: true, INPUT: true, SELECT: true };
  var processedText = typeof WeakMap !== 'undefined' ? new WeakMap() : null;
  var processedAttributes = typeof WeakMap !== 'undefined' ? new WeakMap() : null;

  function groupInteger(value) {
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f');
  }

  function transform(value, keep) {
    if (keep && String(value).indexOf(keep) === 0) { var rest = transformCore(String(value).slice(keep.length)); return { value: keep + rest.value, count: rest.count }; }
    return transformCore(value);
  }

  function transformCore(value) {
    var output = String(value), count = 0, protectedValues = [];
    function protect(text) {
      protectedValues.push(text);
      return '\uE000' + (protectedValues.length - 1) + '\uE001';
    }
    // Keep dates and German clock notation out of arithmetic punctuation rules.
    output = output.replace(/\b\d{4}[-/]\d{1,2}[-/]\d{1,2}\b/g, protect);
    output = output.replace(/\b(?:[01]?\d|2[0-3]):[0-5]\d\s*Uhr\b/gi, protect);

    // Source worksheets use comma groups for large integers and dots for decimals.
    // Convert only unambiguous multi-group commas here; single-group integers in
    // place-value sheets are normalized by the adapter before this pass.
    output = output.replace(/\d{1,3}(?:,\d{3}){2,}(?!\d)/g, function (n) {
      count += 1;
      return groupInteger(n.replace(/,/g, ''));
    });
    output = output.replace(/\d+(?:\.\d+)?/g, function (n) {
      var parts = n.split('.');
      var formatted = groupInteger(parts[0]);
      if (parts.length > 1) formatted += ',' + parts[1];
      if (formatted !== n) count += 1;
      return formatted;
    });

    output = output.replace(/(\d)\s*x\s*(?=\d)/gi, function (_, left) { count += 1; return left + ' · '; });
    output = output.replace(/×/g, function () { count += 1; return multiply; });
    output = output.replace(/÷/g, function () { count += 1; return ' ' + divide + ' '; });
    output = output.replace(/\s*:\s*/g, ' : ')
      .replace(/\s*([+·×])\s*/g, ' $1 ')
      .replace(/\s*([=<>≤≥])\s*/g, ' $1 ')
      .replace(/(\d)(cm|mm|km|m|kg|mg|g|mL|ml|L|cl|h)(?![a-z])/gi, '$1 $2')
      .replace(/(\d)\s*(€)/g, '$1\u00a0$2')
      .replace(/[ \t]{2,}/g, ' ');
    output = output.replace(/\uE000(\d+)\uE001/g, function (_, index) { return protectedValues[Number(index)]; });
    return { value: output, count: count };
  }

  function sheetTitleKeep(node) {
    var p = node.parentNode;
    if (p && p.classList && p.classList.contains('sheet-title')) { var c = window.Sheet && window.Sheet.last && window.Sheet.last.config; return String((c && c.title) || ''); }
    return '';
  }

  function transformTextNode(node) {
    if (processedText && processedText.get(node) === node.nodeValue) return;
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
    var previous = node.previousSibling, next = node.nextSibling;
    while (previous && previous.nodeType === 3 && !previous.nodeValue.trim()) previous = previous.previousSibling;
    while (next && next.nodeType === 3 && !next.nodeValue.trim()) next = next.nextSibling;
    if (!numericToken(previous) || !numericToken(next)) return false;
    if (node.nodeType === 3) node.nodeValue = node.nodeValue.replace('.', ',');
    else node.textContent = ',';
    changedCount += 1;
    return true;
  }

  function visit(node) {
    if (!node) return;
    if (node.nodeType === 3) {
      if (decimalMarker(node)) return;
      transformTextNode(node);
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

  function apply(root) { visit(root); }
  function applyGermanBorrowing() {
    var last = window.Sheet && window.Sheet.last;
    var config = last && last.config;
    if (!config || !config.gen || !config.gen.borrow || !String(config.gen.bundle || '').startsWith('0-2-1') || profile.layouts?.subtraction !== 'entbuendeln') return;
    var questions = last.questions || [];
    var sheetRoot = document.getElementById('sheet-root');
    if (!sheetRoot) return;
    Array.prototype.forEach.call(sheetRoot.querySelectorAll('.sheet-page'), function (page) {
      var answerPage = page.classList.contains('answer-page');
      var stacks = page.querySelectorAll('.g21-stack');
      Array.prototype.forEach.call(stacks, function (stack, index) {
        var question = questions[index];
        var borrowRow = stack.querySelector('.g21-borrow');
        var rows = stack.querySelectorAll('.vertical-row:not(.g21-borrow)');
        if (!question || !borrowRow || !rows.length) return;
        var topDigits = Array.prototype.slice.call(rows[0].querySelectorAll('.vertical-digit'));
        var borrowDigits = Array.prototype.slice.call(borrowRow.querySelectorAll('.vertical-digit'));
        var width = topDigits.length;
        var original = String(Math.abs(Number(question.a) || 0)).padStart(width, '0').slice(-width).split('').map(Number);
        var subtrahend = String(Math.abs(Number(question.b) || 0)).padStart(width, '0').slice(-width).split('').map(Number);
        var adjusted = original.slice(), changed = new Set();
        for (var i = width - 1; i >= 0; i -= 1) {
          if (adjusted[i] >= subtrahend[i]) continue;
          var donor = i - 1;
          while (donor >= 0 && adjusted[donor] === 0) donor -= 1;
          if (donor < 0) continue;
          adjusted[donor] -= 1;
          changed.add(donor);
          for (var j = donor + 1; j < i; j += 1) {
            adjusted[j] = 9;
            changed.add(j);
          }
          adjusted[i] += 10;
          changed.add(i);
        }
        borrowDigits.forEach(function (digit, slot) {
          var position = slot;
          var markerText = answerPage && changed.has(position) ? String(adjusted[position]) : '\u00a0';
          if (digit.textContent !== markerText) digit.textContent = markerText;
          digit.classList.toggle('german-borrow-value', answerPage && changed.has(position));
        });
        topDigits.forEach(function (digit, slot) {
          digit.classList.toggle('german-borrowed', answerPage && changed.has(slot));
        });
      });
    });
  }
  function applyTargets() {
    apply(document.getElementById('sheet-root'));
    apply(document.getElementById('teaching-guide'));
    applyGermanBorrowing();
  }

  window.CountryDisplay = { apply: apply, stats: function () { return changedCount; } };
  applyTargets();

  var germanCalculationStyle = document.createElement('style');
  germanCalculationStyle.id = 'de-native-calculation-style';
  germanCalculationStyle.textContent = 'html[lang^="de"] .carry-row .vertical-digit:not(.g011-blank):not(.g21-blank),html[lang^="de"] .g21-borrow .vertical-digit:not(.g21-blank){border:0!important;background:transparent!important;color:#111!important}html[lang^="de"] .german-borrow-value{color:#111!important;font-weight:600}html[lang^="de"] .german-borrowed{text-decoration:line-through;text-decoration-thickness:1px;text-decoration-color:#111}html[lang^="de"] .carry-row{color:#111}';
  document.head.appendChild(germanCalculationStyle);

  if (typeof MutationObserver !== 'undefined' && document.documentElement) {
    var observer = new MutationObserver(function () { applyTargets(); });
    observer.observe(document.documentElement, {
      subtree: true, childList: true, characterData: true, attributes: true,
      attributeFilter: ['title', 'aria-label']
    });
  }
}());
