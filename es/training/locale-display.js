(function () {
  'use strict';

  var profile = window.CountryProfile;
  if (!profile || !profile.symbols) return;

  var symbols = profile.symbols;
  var multiply = typeof symbols.multiply === 'string' ? symbols.multiply : '×';
  var divide = typeof symbols.divide === 'string' ? symbols.divide : '÷';
  var changedCount = 0;
  var excludedTags = { SCRIPT: true, STYLE: true, TEXTAREA: true, INPUT: true, SELECT: true };

  function isDigitOrParen(character) {
    return !!character && /[0-9()\[\]{}]/.test(character);
  }

  var typeMatch = /\/training\/([^\/]+)\//.exec(location.pathname);
  var decimalType = !!(typeMatch && /^2-/.test(typeMatch[1])) && symbols.decimal === ',';

  function transform(value, keep) {
    if (keep && String(value).indexOf(keep) === 0) { var rest = transformCore(String(value).slice(keep.length)); return { value: keep + rest.value, count: rest.count }; }
    return transformCore(value);
  }

  function transformCore(value) {
    if (decimalType) value = value.replace(/(\d)\.(?=\d)/g, '$1,');
    var output = '';
    var count = 0;
    for (var i = 0; i < value.length; i += 1) {
      var character = value.charAt(i);
      var replacement = character;
      if (character === '×' && multiply !== '×') {
        replacement = multiply;
        count += 1;
      } else if (character === '÷' && divide !== '÷') {
        replacement = divide;
        count += 1;
        if (divide === ':') {
          var previous = i > 0 ? value.charAt(i - 1) : '';
          var next = i + 1 < value.length ? value.charAt(i + 1) : '';
          if (isDigitOrParen(previous) && previous !== ' ') output += ' ';
          replacement = ':';
          output += replacement;
          if (isDigitOrParen(next) && next !== ' ') output += ' ';
          continue;
        }
      }
      output += replacement;
    }
    return { value: output, count: count };
  }

  function sheetTitleKeep(node) {
    var p = node.parentNode;
    if (p && p.classList && p.classList.contains('sheet-title')) { var c = window.Sheet && window.Sheet.last && window.Sheet.last.config; return String((c && c.title) || ''); }
    return '';
  }

  function transformTextNode(node) {
    var result = transform(node.nodeValue, sheetTitleKeep(node));
    if (result.value !== node.nodeValue) {
      node.nodeValue = result.value;
      changedCount += result.count;
    }
  }

  function visit(node) {
    if (!node) return;
    if (node.nodeType === 3) {
      transformTextNode(node);
      return;
    }
    if (node.nodeType !== 1 && node.nodeType !== 9 && node.nodeType !== 11) return;
    if (node.nodeType === 1) {
      if (excludedTags[node.tagName]) return;
      ['title', 'aria-label'].forEach(function (name) {
        if (!node.hasAttribute(name)) return;
        var before = node.getAttribute(name);
        var result = transform(before);
        if (result.value !== before) {
          node.setAttribute(name, result.value);
          changedCount += result.count;
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

  // Decimal points split across elements ("2." + <u>6</u>, or <span>.</span>): a text node that is
  // exactly "." (or ends in digit + ".") directly followed by a text node starting with a digit.
  function splitDecimalPoints(root) {
    if (!decimalType || !root || root.nodeType !== 1) return;
    var walker = document.createTreeWalker(root, 4);
    var nodes = [];
    var n;
    while ((n = walker.nextNode())) {
      if (n.parentElement && excludedTags[n.parentElement.tagName]) continue;
      nodes.push(n);
    }
    for (var i = 0; i < nodes.length - 1; i += 1) {
      var value = nodes[i].nodeValue;
      var following = nodes[i + 1].nodeValue.replace(/^\s+/, '');
      if (!/^\d/.test(following)) continue;
      if (/^\s*\.\s*$/.test(value) || /\d\.$/.test(value)) {
        nodes[i].nodeValue = value.replace(/\.(\s*)$/, ',$1');
        changedCount += 1;
      }
    }
  }

  function apply(root) {
    visit(root);
    splitDecimalPoints(root);
  }

  function applyTargets() {
    apply(document.getElementById('sheet-root'));
    apply(document.getElementById('teaching-guide'));
  }

  window.CountryDisplay = {
    apply: apply,
    stats: function () { return changedCount; }
  };

  applyTargets();
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
