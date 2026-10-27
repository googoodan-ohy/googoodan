(function () {
  'use strict';

  const ASSET_ROOT = '/assets/legacy-recovery/ja/';
  const VERSION = '20261018-wsid-v1';
  const WORKSHEET_SELECTOR = '.paper, #sheet-view .sheet, .problem-page, .sheet-page';
  const GUIDE_GAP = 16;
  const registryPromise = fetch(ASSET_ROOT + 'worksheet-registry.json?v=' + VERSION, { cache: 'force-cache' })
    .then((response) => {
      if (!response.ok) throw new Error('worksheet registry request failed');
      return response.json();
    });
  const catalogPromise = fetch(ASSET_ROOT + 'worksheet-id-catalog.json?v=' + VERSION, { cache: 'force-cache' })
    .then((response) => {
      if (!response.ok) throw new Error('worksheet id catalog request failed');
      return response.json();
    });
  const guideCache = new Map();
  const warned = new Set();
  let revision = 0;
  let scheduled = false;
  let running = false;
  let rerun = false;
  const selfWrittenWorksheetIds = new WeakMap();
  let resizeObserver = null;
  let observedPaper = null;
  let observedParent = null;
  let geometryMutationObserver = null;
  let geometryObservedPaper = null;
  let geometryFrame = 0;

  function currentContext() {
    try {
      return typeof window.GDWorksheetContext === 'function' ? window.GDWorksheetContext() : null;
    } catch (_) {
      return null;
    }
  }

  function stableValue(value) {
    if (Array.isArray(value)) return '[' + value.map(stableValue).join(',') + ']';
    if (value && typeof value === 'object') {
      return '{' + Object.keys(value)
        .filter((key) => value[key] !== undefined)
        .sort()
        .map((key) => JSON.stringify(key) + ':' + stableValue(value[key]))
        .join(',') + '}';
    }
    return JSON.stringify(value);
  }

  function profileKey(profile) {
    return String(profile?.id ?? profile?.key ?? profile?.mode ?? profile?.name ?? profile?.generatorKey ?? 'basic');
  }

  function resolveWorksheetId(catalog) {
    const context = currentContext();
    if (context?.drill) return 'ja:drill:' + String(context.drill);

    const unitId = String(context?.unit ?? '');
    if (unitId) {
      let profiles = [];
      try {
        profiles = window.KoMath?.profiles?.(unitId) || [];
      } catch (_) {
        return null;
      }
      const profileIndex = Number(context.sheet ?? 0);
      const profile = Number.isInteger(profileIndex) && profileIndex >= 0 ? profiles[profileIndex] : null;
      if (!profile) return null;

      const unitRule = catalog.units?.[unitId];
      if (unitRule) {
        const signature = stableValue(profile);
        return unitRule.profiles?.find((item) => item.signature === signature)?.worksheetId || null;
      }

      return catalog.types?.[unitId]?.profiles?.[profileKey(profile)] || null;
    }

    const typeId = String(context?.type ?? document.body?.dataset?.type ?? '');
    if (!typeId) return null;
    if (typeId === 'times-tables') {
      const tables = String(context?.tables ?? '')
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean)
        .sort((a, b) => Number(a) - Number(b) || a.localeCompare(b));
      return tables.length ? 'ja:times-tables:' + tables.map(encodeURIComponent).join(',') : null;
    }
    return catalog.types?.[typeId]?.profiles?.[catalog.types[typeId].defaultProfile] || null;
  }

  function worksheetNodes() {
    return Array.from(document.querySelectorAll(WORKSHEET_SELECTOR));
  }

  function writeWorksheetId(node, value) {
    const nextValue = value || null;
    const currentValue = node.hasAttribute('data-worksheet-id') ? node.dataset.worksheetId : null;
    if (currentValue === nextValue) return;
    selfWrittenWorksheetIds.set(node, nextValue);
    if (nextValue === null) node.removeAttribute('data-worksheet-id');
    else node.dataset.worksheetId = nextValue;
  }

  function scheduleGuideWidth() {
    if (geometryFrame || typeof window.requestAnimationFrame !== 'function') return;
    geometryFrame = window.requestAnimationFrame(() => {
      geometryFrame = 0;
      syncGuideWidth();
    });
  }

  function visiblePaperBottom(paper) {
    const paperRect = paper.getBoundingClientRect();
    const paperStyle = window.getComputedStyle(paper);
    // getBoundingClientRect() excludes the outline, so include its outward edge.
    const outlineBottom = outlineOutset(paperStyle);
    let bottom = paperRect.bottom + outlineBottom;
    paper.querySelectorAll('*').forEach((node) => {
      const style = window.getComputedStyle(node);
      if (style.display === 'none' || style.visibility === 'hidden' || style.visibility === 'collapse') return;
      const rect = node.getBoundingClientRect();
      if (rect.width || rect.height) bottom = Math.max(bottom, rect.bottom);
    });
    return bottom;
  }

  function outlineOutset(style) {
    const outlineStyle = String(style.outlineStyle || 'none');
    if (outlineStyle === 'none' || outlineStyle === 'hidden') return 0;
    const width = Math.max(0, parseFloat(style.outlineWidth) || 0);
    const offset = parseFloat(style.outlineOffset) || 0;
    return Math.max(0, width + offset);
  }

  function visibleGuideTop(section) {
    const rect = section.getBoundingClientRect();
    return rect.top - outlineOutset(window.getComputedStyle(section));
  }

  function mirrorPaperSurface(paper, section) {
    const source = window.getComputedStyle(paper);
    const properties = [
      'borderTopWidth', 'borderTopStyle', 'borderTopColor',
      'borderRightWidth', 'borderRightStyle', 'borderRightColor',
      'borderBottomWidth', 'borderBottomStyle', 'borderBottomColor',
      'borderLeftWidth', 'borderLeftStyle', 'borderLeftColor',
      'borderTopLeftRadius', 'borderTopRightRadius',
      'borderBottomRightRadius', 'borderBottomLeftRadius', 'boxShadow',
      'outlineStyle', 'outlineWidth', 'outlineColor', 'outlineOffset',
    ];
    properties.forEach((property) => {
      if (section.style[property] !== source[property]) section.style[property] = source[property];
    });
    if (section.style.backgroundColor !== 'rgb(255, 255, 255)') section.style.backgroundColor = 'rgb(255, 255, 255)';
  }

  function syncGuideWidth() {
    const section = document.getElementById('page-guide');
    const paper = worksheetNodes().find((node) => node.isConnected && node.getBoundingClientRect().width > 0);
    if (!section || !paper || (window.matchMedia && window.matchMedia('print').matches)) return;

    const parent = section.parentElement;
    if (!parent) return;
    if (typeof window.ResizeObserver === 'function') {
      if (!resizeObserver) resizeObserver = new window.ResizeObserver(scheduleGuideWidth);
      if (observedPaper !== paper || observedParent !== parent) {
        resizeObserver.disconnect();
        observedPaper = paper;
        observedParent = parent;
        resizeObserver.observe(paper);
        if (parent !== paper) resizeObserver.observe(parent);
      }
    }
    if (typeof window.MutationObserver === 'function' && geometryObservedPaper !== paper) {
      if (!geometryMutationObserver) geometryMutationObserver = new window.MutationObserver(scheduleGuideWidth);
      geometryMutationObserver.disconnect();
      geometryMutationObserver.observe(paper, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true,
        attributeFilter: ['class', 'style', 'hidden'],
      });
      geometryObservedPaper = paper;
    }

    const paperRect = paper.getBoundingClientRect();
    const parentRect = parent.getBoundingClientRect();
    const parentStyle = window.getComputedStyle(parent);
    const paddingLeft = parseFloat(parentStyle.paddingLeft) || 0;
    const paddingRight = parseFloat(parentStyle.paddingRight) || 0;
    const contentLeft = parentRect.left + parent.clientLeft + paddingLeft;
    const available = Math.max(0, parent.clientWidth - paddingLeft - paddingRight);
    if (!paperRect.width || !available) return;

    mirrorPaperSurface(paper, section);
    const width = Math.min(paperRect.width, available);
    const left = Math.max(0, Math.min(available - width, paperRect.left - contentLeft));
    const px = (value) => (Math.round(value * 100) / 100) + 'px';
    if (section.style.width !== px(width)) section.style.width = px(width);
    if (section.style.maxWidth !== 'none') section.style.maxWidth = 'none';
    if (section.style.marginLeft !== px(left)) section.style.marginLeft = px(left);
    if (section.style.marginRight !== '0px') section.style.marginRight = '0px';

    const visibleBottom = visiblePaperBottom(paper);
    const sectionTop = visibleGuideTop(section);
    const gapAdjustment = visibleBottom + GUIDE_GAP - sectionTop;
    if (Math.abs(gapAdjustment) > 0.5) {
      const currentMarginTop = parseFloat(window.getComputedStyle(section).marginTop) || 0;
      section.style.marginTop = px(Math.max(0, currentMarginTop + gapAdjustment));
      const remainingGap = visibleBottom + GUIDE_GAP - visibleGuideTop(section);
      if (Math.abs(remainingGap) > 0.5) {
        const adjustedMarginTop = parseFloat(window.getComputedStyle(section).marginTop) || 0;
        section.style.marginTop = px(Math.max(0, adjustedMarginTop + remainingGap));
      }
    }
  }

  function isGuideTarget(target) {
    return target instanceof Element && (target.id === 'page-guide' || Boolean(target.closest('#page-guide')));
  }

  function containsWorksheetNode(node) {
    if (!(node instanceof Element) || node.id === 'print-bundle' || node.closest('#print-bundle')) return false;
    return node.matches(WORKSHEET_SELECTOR) || Boolean(node.querySelector(WORKSHEET_SELECTOR));
  }

  function warnMissing(worksheetId) {
    const key = worksheetId || 'unresolved';
    if (warned.has(key)) return;
    warned.add(key);
    console.warn('[ja worksheet guide] missing guide for worksheetId: ' + key);
  }

  function clearGuide(section, worksheetId) {
    section.replaceChildren();
    section.hidden = true;
    section.className = 'page-guide';
    section.lang = 'ja';
    section.dataset.guideVersion = VERSION;
    const nextWorksheetId = worksheetId || '';
    if (section.dataset.worksheetId !== nextWorksheetId) section.dataset.worksheetId = nextWorksheetId;
    delete section.dataset.guideSource;
    scheduleGuideWidth();
  }

  function addTextBlock(node, value) {
    const lines = String(value ?? '').split(/\r?\n/);
    lines.forEach((line, index) => {
      if (index) node.append(document.createElement('br'));
      node.append(document.createTextNode(line));
    });
  }

  function addList(parent, values, tagName) {
    const list = document.createElement(tagName);
    (Array.isArray(values) ? values : []).forEach((value) => {
      const item = document.createElement('li');
      addTextBlock(item, value);
      list.append(item);
    });
    parent.append(list);
  }

  function heading(parent, value, className) {
    const node = document.createElement('h2');
    if (className) node.className = className;
    node.textContent = value;
    parent.append(node);
    return node;
  }

  function paragraph(parent, value, className) {
    const node = document.createElement('p');
    if (className) node.className = className;
    addTextBlock(node, value);
    parent.append(node);
    return node;
  }

  function renderGuide(section, data, worksheetId) {
    section.replaceChildren();
    section.hidden = false;
    section.className = 'page-guide';
    section.lang = 'ja';
    section.dataset.guideVersion = VERSION;
    section.dataset.guideSource = 'worksheet-registry';
    section.dataset.worksheetId = worksheetId;

    heading(section, '\u6307\u5c0e\u30ac\u30a4\u30c9');
    heading(section, data.title, 'page-guide-title');
    paragraph(section, data.concept, 'page-guide-concept');
    paragraph(section, data.overview);

    heading(section, '\u307e\u305a\u78ba\u8a8d\u3059\u308b\u3053\u3068');
    addList(section, data.prerequisites, 'ul');
    heading(section, '\u6307\u5c0e\u306e\u9032\u3081\u65b9');
    addList(section, data.teachingSteps, 'ol');

    heading(section, '\u4f8b\u984c\u3068\u89e3\u304d\u65b9');
    (Array.isArray(data.workedExamples) ? data.workedExamples : []).forEach((example) => {
      const block = document.createElement('section');
      block.className = 'page-guide-example';
      paragraph(block, example.question, 'problem-copy');
      addList(block, example.steps, 'ol');
      const details = document.createElement('details');
      const summary = document.createElement('summary');
      summary.textContent = '\u4f8b\u984c\u306e\u7b54\u3048\u3092\u898b\u308b';
      const answer = document.createElement('div');
      answer.className = 'page-guide-answer';
      answer.textContent = String(example.answer ?? '');
      details.append(summary, answer);
      block.append(details);
      section.append(block);
    });

    heading(section, '\u3088\u304f\u3042\u308b\u3064\u307e\u305a\u304d');
    (Array.isArray(data.commonMistakes) ? data.commonMistakes : []).forEach((item) => {
      const block = document.createElement('div');
      block.className = 'page-guide-mistake';
      const titleNode = document.createElement('h3');
      addTextBlock(titleNode, item.mistake);
      block.append(titleNode);
      paragraph(block, item.guidance);
      section.append(block);
    });

    heading(section, '\u304a\u3046\u3061\u306e\u65b9\u3078');
    addList(section, data.parentPrompts, 'ul');
    heading(section, '\u7df4\u7fd2\u306e\u3059\u3059\u3081\u65b9');
    paragraph(section, data.practiceAdvice);
    heading(section, '\u6b21\u306e\u30b9\u30c6\u30c3\u30d7');
    addList(section, data.nextSteps, 'ul');
    scheduleGuideWidth();
  }

  function fetchGuide(worksheetId, entry) {
    if (!entry?.guide) return Promise.reject(new Error('guide path missing'));
    if (!guideCache.has(worksheetId)) {
      guideCache.set(worksheetId, fetch(ASSET_ROOT + entry.guide, { cache: 'force-cache' }).then((response) => {
        if (!response.ok) throw new Error('guide request failed');
        return response.json();
      }));
    }
    return guideCache.get(worksheetId);
  }

  async function sync(requestRevision) {
    const section = document.getElementById('page-guide');
    if (!section) return;
    const nodes = worksheetNodes();
    let registry;
    let catalog;

    try {
      [registry, catalog] = await Promise.all([registryPromise, catalogPromise]);
    } catch (_) {
      if (requestRevision === revision) {
        const fallbackId = nodes.find((node) => node.dataset.worksheetId)?.dataset.worksheetId || section.dataset.worksheetId || '';
        clearGuide(section, fallbackId);
        if (nodes.length || fallbackId) warnMissing(fallbackId);
      }
      return;
    }
    if (requestRevision !== revision) return;

    const resolvedId = resolveWorksheetId(catalog);
    if (nodes.length && !resolvedId) {
      nodes.forEach((node) => writeWorksheetId(node, null));
      clearGuide(section, '');
      warnMissing('');
      return;
    }
    if (resolvedId) {
      nodes.forEach((node) => {
        writeWorksheetId(node, resolvedId);
      });
    }

    const activeNode = nodes.find((node) => node.dataset.worksheetId);
    const worksheetId = activeNode?.dataset.worksheetId || resolvedId || section.dataset.worksheetId || '';
    if (!worksheetId) return;

    const entry = registry[worksheetId];
    if (!entry?.guide) {
      clearGuide(section, worksheetId);
      warnMissing(worksheetId);
      return;
    }

    if (
      section.dataset.worksheetId === worksheetId &&
      section.dataset.guideSource === 'worksheet-registry' &&
      section.childElementCount > 0
    ) {
      section.hidden = false;
      syncGuideWidth();
      return;
    }

    clearGuide(section, worksheetId);
    try {
      const data = await fetchGuide(worksheetId, entry);
      if (requestRevision !== revision) return;
      const latestNodes = worksheetNodes();
      const latestResolvedId = resolveWorksheetId(catalog);
      if (latestNodes.length && latestResolvedId !== worksheetId) return;
      if (latestNodes.length) {
        latestNodes.forEach((node) => {
          writeWorksheetId(node, worksheetId);
        });
      }
      renderGuide(section, data, worksheetId);
      syncGuideWidth();
    } catch (_) {
      if (requestRevision === revision) {
        clearGuide(section, worksheetId);
        warnMissing(worksheetId);
      }
    }
  }

  function enqueueSync() {
    if (scheduled) return;
    scheduled = true;
    queueMicrotask(() => {
      scheduled = false;
      if (running) {
        rerun = true;
        return;
      }
      running = true;
      const requestRevision = revision;
      sync(requestRevision).catch((error) => {
        console.error('[ja worksheet guide] sync failed', error);
      }).finally(() => {
        running = false;
        if (rerun) {
          rerun = false;
          enqueueSync();
        }
      });
    });
  }

  function scheduleSync() {
    revision += 1;
    if (running) rerun = true;
    enqueueSync();
  }

  const observer = new MutationObserver((records) => {
    const changedIds = new Set();
    let shouldSync = false;

    records.forEach((record) => {
      if (record.type === 'attributes' && record.attributeName === 'data-worksheet-id') {
        if (record.target instanceof Element && record.target.matches(WORKSHEET_SELECTOR)) changedIds.add(record.target);
        return;
      }
      if (record.type !== 'childList' || isGuideTarget(record.target)) return;
      if ([...record.addedNodes, ...record.removedNodes].some(containsWorksheetNode)) shouldSync = true;
    });

    for (const node of changedIds) {
      if (selfWrittenWorksheetIds.has(node)) {
        const expectedValue = selfWrittenWorksheetIds.get(node);
        selfWrittenWorksheetIds.delete(node);
        const actualValue = node.hasAttribute('data-worksheet-id') ? node.dataset.worksheetId : null;
        if (actualValue === expectedValue) continue;
      }
      shouldSync = true;
      break;
    }
    if (shouldSync) scheduleSync();
  });
  observer.observe(document.body, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['data-worksheet-id'],
  });
  document.addEventListener('change', scheduleSync, true);
  document.addEventListener('click', scheduleSync, true);
  window.addEventListener('popstate', scheduleSync);
  window.addEventListener('hashchange', scheduleSync);
  window.addEventListener('resize', scheduleGuideWidth, { passive: true });
  window.addEventListener('afterprint', scheduleGuideWidth);
  scheduleSync();
})();
