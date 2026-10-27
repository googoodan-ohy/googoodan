(function () {
  'use strict';

  if (!document.body || document.body.dataset.trainingDetailLayout === 'ready') return;
  var match = location.pathname.match(/^\/ja\/training\/([^/]+)\/?$/);
  if (!match) return;

  var slug = match[1];
  var parts = slug.split('-');
  var domains = { '0': 'natural', '1': 'fraction', '2': 'decimal' };
  var stages = { '0': 'pre', '1': 'add', '2': 'sub', '3': 'mul', '4': 'div', '5': 'combined' };
  var domainKey = domains[parts[0]] || 'natural';
  var stageKey = stages[parts[1]] || 'pre';
  var domainNames = { natural: '\u81ea\u7136\u6570', fraction: '\u5206\u6570', decimal: '\u5c0f\u6570' };
  var stageHref = '/ja/training/#' + domainKey + '-' + stageKey;

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
  brand.href = '/ja/training/';
  brand.setAttribute('aria-label', 'googoodan \u30db\u30fc\u30e0');
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
  var tagline = element('small', '', '\u4e00\u679a\u306e\u7df4\u7fd2\u3001\u81ea\u4fe1\u306b\u3064\u306a\u304c\u308b');
  copy.append(name, tagline);
  brand.append(logo, copy);
  header.append(brand);
  document.body.insertBefore(header, document.body.firstChild);

  var layout = element('main', 'layout page-layout training-detail-layout');
  var sidebar = element('aside', 'sidebar');
  var tabs = element('nav', 'edition-tabs');
  tabs.setAttribute('aria-label', '\u5b66\u7fd2\u30e1\u30cb\u30e5\u30fc');
  [
    ['/ja/training/', '\u56db\u5247\u8a08\u7b97'],
    ['/ja/drills.html', '\u5358\u5143\u5225\u8a08\u7b97'],
    ['/ja/units.html', '\u5358\u5143\u5225\u554f\u984c']
  ].forEach(function (item) {
    var link = element('a', '', item[1]);
    link.href = item[0];
    tabs.append(link);
  });
  var menuDisclosure = element('details', 'training-menu-disclosure');
  var menuSummary = element('summary', '', '\u5b66\u7fd2\u8cc7\u6599\u3092\u63a2\u3059');
  menuDisclosure.append(menuSummary);
  sidebar.append(tabs, menuDisclosure);

  var content = element('section', 'content');
  var title = element('h1', 'detail-title');
  var sheetRoot = document.getElementById('sheet-root');
  var guide = document.getElementById('teaching-guide');
  var guideData = window.CountryKoGuides && window.CountryKoGuides[slug];
  var guideHeadings = guide ? Array.prototype.filter.call(guide.children, function (node) { return node.tagName === 'H2'; }) : [];
  var guideParagraph = guide ? Array.prototype.find.call(guide.children, function (node) { return node.tagName === 'P'; }) : null;
  var sheetTitle = (sheetRoot && sheetRoot.querySelector('.sheet-title')) || null;
  var worksheetTitle = (guideData && guideData.title) || (guideHeadings[1] && guideHeadings[1].textContent.trim()) || (sheetTitle && sheetTitle.textContent.trim()) || '';
  var concept = (guideData && guideData.concept) || (guideParagraph && guideParagraph.textContent.trim()) || '';
  title.textContent = [concept, worksheetTitle].filter(Boolean).join(' \u00b7 ');

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
      if (href === '#teaching-guide' || href.indexOf('/ja/training/#') === 0 || link.textContent.indexOf('\u623b\u308b') >= 0 || link.textContent.indexOf('\u6307\u5c0e') >= 0) {
        link.remove();
      }
    });
    var actions = element('div', 'toolbar-actions');
    var output = element('div', 'toolbar-output');
    if (regenerate) {
      regenerate.textContent = '\u21bb \u6570\u5b57\u3092\u5909\u3048\u308b';
      actions.append(regenerate);
    }
    if (problemTab) actions.append(problemTab);
    if (answerTab) {
      answerTab.textContent = '\u7b54\u3048';
      actions.append(answerTab);
    }
    Array.prototype.slice.call(toolbar.querySelectorAll('label')).forEach(function (label) { output.append(label); });
    if (printButton) {
      printButton.textContent = '\u5370\u5237\u3059\u308b';
      output.append(printButton);
    }
    if (pdfControl) {
      pdfControl.textContent = 'PDF\u4fdd\u5b58';
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
  if (guide) content.append(guide);
  layout.append(sidebar, content);
  header.after(layout);

  var selectedDomain = domainNames[domainKey];
  var menuReady = false;
  var menuObserver;
  var desktopMenu = window.matchMedia('(min-width: 768px)').matches;
  function syncMenu() {
    if (menuReady) return;
    var menu = tabs.querySelector('#ja-training-submenu');
    var first = tabs.querySelector('a[href="/ja/training/"]');
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
    var menu = menuDisclosure.querySelector('#ja-training-submenu');
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
