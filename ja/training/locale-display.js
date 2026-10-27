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

  function transform(value) {
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

  function transformTextNode(node) {
    var result = transform(node.nodeValue);
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

  function apply(root) {
    visit(root);
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
