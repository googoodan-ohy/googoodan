(function () {
  'use strict';

  if (!document.body || document.body.dataset.trainingDetailLayout === 'ready') return;
  var match = location.pathname.match(/^\/de\/training\/([^/]+)\/?$/);
  if (!match) return;

  var slug = new URLSearchParams(location.search).get('type') || match[1];
  var parts = slug.split('-');
  var domains = { '0': '0', '1': '1', '2': '2' };
  var stages = { '0': '0', '1': '1', '2': '2', '3': '3', '4': '4', '5': '5' };
  var domainKey = domains[parts[0]] || 'natural';
  var stageKey = stages[parts[1]] || 'pre';
  var localeUI = (window.CountryLocale || {}).ui || {};
  var domainNames = { '0': (localeUI.domains || {})['자연수'] || 'Natürliche Zahlen', '1': (localeUI.domains || {})['분수'] || 'Brüche', '2': (localeUI.domains || {})['소수'] || 'Dezimalzahlen' };
  var stageHref = '/de/training/#' + domainKey + '-' + stageKey;

  try {
    history.replaceState(history.state, '', location.pathname + location.search + '#' + domainKey + '-' + stageKey);
  } catch (_) {}
  document.body.dataset.trainingDetailLayout = 'ready';

  function element(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  var header = element('header', 'site-header training-detail-header');
  var brand = element('a', 'gd-brand');
  brand.href = '/de/training/';
  brand.setAttribute('aria-label', 'googoodan.com');
  var logo = element('img');
  logo.src = '/assets/legacy-recovery/brand-logo.svg';
  logo.width = 52;
  logo.height = 52;
  logo.alt = '';
  var copy = element('span', 'gd-brand-copy');
  var name = element('span', 'gd-brand-name');
  name.append(document.createTextNode('googoodan'));
  name.append(element('span', '', '.'));
  name.append(document.createTextNode('com'));
  var tagline = element('small', '', 'Übe und mach Schritt für Schritt Fortschritte');
  copy.append(name, tagline);
  brand.append(logo, copy);
  header.append(brand);
  document.body.insertBefore(header, document.body.firstChild);

  var layout = element('main', 'layout page-layout training-detail-layout');
  var sidebar = element('aside', 'sidebar');
  var tabs = element('nav', 'edition-tabs');
  tabs.setAttribute('aria-label', 'Lernmenü');
  [
    ['/de/training/', 'Rechentraining'],
    ['/de/drills.html', 'Rechnen nach Kapitel'],
    ['/de/units.html', 'Übungen nach Kapitel']
  ].forEach(function (item) {
    var link = element('a', '', item[1]);
    link.href = item[0];
    tabs.append(link);
  });
  var menuDisclosure = element('details', 'training-menu-disclosure');
  var menuSummary = element('summary', '', 'Arbeitsblätter durchsuchen');
  menuDisclosure.append(menuSummary);
  sidebar.append(tabs, menuDisclosure);

  var content = element('section', 'content');
  var title = element('h1', 'detail-title');
  var sheetRoot = document.getElementById('sheet-root');
  var guide = document.getElementById('teaching-guide');
  var localeEntry = ((window.CountryLocale || {}).items || {})[slug] || {};
  if (guide) guide.remove();
  var worksheetTitle = localeEntry.title || '';
  var concept = localeEntry.concept || '';
  title.textContent = worksheetTitle;
  document.title = worksheetTitle + ' | googoodan.com';

  var toolbar = document.querySelector('.toolbar');
  var error = document.getElementById('sheet-error');
  if (toolbar) {
    var regenerate = toolbar.querySelector('#new');
    var problemTab = toolbar.querySelector('#problem-button');
    var answerTab = toolbar.querySelector('#answer-button');
    var printButton = toolbar.querySelector('#print');
    var pdfControl = toolbar.querySelector('#pdf, [data-pdf], .pdf-save, a[href$=".pdf"]');
    var controlLinks = Array.prototype.slice.call(toolbar.querySelectorAll('a'));
    controlLinks.forEach(function (link) {
      var href = link.getAttribute('href') || '';
      if (href === '#teaching-guide' || href.indexOf('/de/training/#') === 0 || link.textContent.indexOf('\u623b\u308b') >= 0 || link.textContent.indexOf('\u6307\u5c0e') >= 0 || /Zurück|Leitfaden/i.test(link.textContent)) {
        link.remove();
      }
    });
    var actions = element('div', 'toolbar-actions');
    var output = element('div', 'toolbar-output');
    if (regenerate) {
      regenerate.textContent = '\u21bb Neue Zahlen';
      actions.append(regenerate);
    }
    if (problemTab) actions.append(problemTab);
    if (answerTab) {
      answerTab.textContent = 'Antworten';
      actions.append(answerTab);
    }
    Array.prototype.slice.call(toolbar.querySelectorAll('label')).forEach(function (label) { output.append(label); });
    if (printButton) {
      printButton.textContent = 'Drucken';
      output.append(printButton);
    }
    if (pdfControl) {
      pdfControl.textContent = 'PDF speichern';
      output.append(pdfControl);
    }
    var grouped = [regenerate, problemTab, answerTab, printButton, pdfControl];
    Array.prototype.slice.call(toolbar.children).forEach(function (child) {
      if (grouped.indexOf(child) < 0 && child.classList && !child.matches('label')) output.append(child);
    });
    toolbar.replaceChildren(actions, output);
  }

  content.append(title);
  var stage = element('div', 'worksheet-stage');
  if (toolbar) stage.append(toolbar);
  if (error) stage.append(error);
  if (sheetRoot) stage.append(sheetRoot);
  content.append(stage);

  layout.append(sidebar, content);
  header.after(layout);

  var selectedDomain = domainNames[domainKey];
  var menuReady = false;
  var menuObserver;
  var desktopMenu = window.matchMedia('(min-width: 768px)').matches;
  function syncMenu() {
    if (menuReady) return;
    var menu = tabs.querySelector('#de-training-submenu');
    var first = tabs.querySelector('a[href="/de/training/"]');
    if (!menu || !first) return;
    menuDisclosure.append(menu);
    menu.hidden = false;
    first.removeAttribute('aria-controls');
    first.removeAttribute('aria-expanded');
    first.removeAttribute('aria-haspopup');
    first.addEventListener('click', function (event) { event.stopImmediatePropagation(); }, true);
    menuDisclosure.open = desktopMenu;
    menu.querySelectorAll('.domain-group').forEach(function (group) {
      group.open = desktopMenu && group.dataset.domain === selectedDomain;
    });
    menu.querySelectorAll('.stage-link').forEach(function (link) {
      var selected = link.getAttribute('href') === stageHref;
      if (selected) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    menuReady = true;
    menuObserver.disconnect();
  }
  menuObserver = new MutationObserver(syncMenu);
  menuObserver.observe(sidebar, { childList: true, subtree: true });
  window.addEventListener('resize', function () {
    if (!menuReady) return;
    var nextDesktop = window.matchMedia('(min-width: 768px)').matches;
    if (nextDesktop === desktopMenu) return;
    desktopMenu = nextDesktop;
    menuDisclosure.open = desktopMenu;
    var menu = menuDisclosure.querySelector('#de-training-submenu');
    if (menu) menu.querySelectorAll('.domain-group').forEach(function (group) {
      group.open = desktopMenu && group.dataset.domain === selectedDomain;
    });
  }, { passive: true });
  syncMenu();

  function fitSheet() {
    if (!sheetRoot) return;
    var pages = Array.prototype.filter.call(sheetRoot.children, function (node) {
      return node.classList && node.classList.contains('sheet-page') && getComputedStyle(node).display !== 'none';
    });
    if (!pages.length) return;
    if (!window.matchMedia('(max-width: 767px)').matches) {
      sheetRoot.style.removeProperty('height');
      sheetRoot.style.removeProperty('position');
      pages.forEach(function (page) {
        ['position', 'left', 'top', 'width', 'max-width', 'height', 'margin', 'transform', 'transform-origin'].forEach(function (property) { page.style.removeProperty(property); });
      });
      return;
    }
    var paperWidth = 210 * 96 / 25.4;
    var paperHeight = 297 * 96 / 25.4;
    var scale = Math.min(1, sheetRoot.clientWidth / paperWidth);
    sheetRoot.style.position = 'relative';
    sheetRoot.style.height = (paperHeight * scale * pages.length) + 'px';
    pages.forEach(function (page, index) {
      page.style.position = 'absolute';
      page.style.left = '50%';
      page.style.top = (paperHeight * scale * index) + 'px';
      page.style.width = '210mm';
      page.style.maxWidth = 'none';
      page.style.height = '297mm';
      page.style.margin = '0';
      page.style.transform = 'translateX(-50%) scale(' + scale + ')';
      page.style.transformOrigin = 'top center';
    });
  }
  if (sheetRoot) {
    var sheetObserver = new MutationObserver(fitSheet);
    sheetObserver.observe(sheetRoot, { childList: true });
    fitSheet();
    window.addEventListener('resize', fitSheet, { passive: true });
  }
})();
