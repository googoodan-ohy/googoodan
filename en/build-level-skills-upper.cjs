const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const enDir = __dirname;
const rootDir = path.dirname(enDir);
const outputDir = path.join(enDir, 'print', 'level-skills-upper');
const templatePath = path.join(enDir, 'levels.html');
const manifestPath = path.join(outputDir, 'manifest.json');
const SITE = 'https://googoodan.com';
const BUILD_VERSION = '20260913-upper-level-static';

function escapeText(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function escapeAttr(value) {
  return escapeText(value).replaceAll('"', '&quot;');
}

function slug(value) {
  return String(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function loadLevelCatalog() {
  const sandbox = { console };
  sandbox.globalThis = sandbox;
  for (const relative of [
    'en/types.js',
    'ko/catalog.js',
    'ko/drill-catalog.js',
    'ko/drill-engine.js',
    'en/level-catalog.js',
    'en/level-english.js'
  ]) {
    const file = path.join(rootDir, relative);
    vm.runInNewContext(fs.readFileSync(file, 'utf8'), sandbox, { filename: file });
  }
  return sandbox;
}

function typeFor(runtime, profile) {
  return runtime.Worksheets.types.find(type => type.id === profile.source);
}

function configFor(runtime, profile) {
  return typeFor(runtime, profile)?.config || {};
}

function decimalPlaces(profile, config) {
  if (profile.decimalPlaces) return [...profile.decimalPlaces];
  if (config.kind === 'decimal') return [config.dp, config.dp];
  return [config.da, config.db];
}

/*
 * Keep only profiles that produce a genuinely different worksheet from the
 * existing root /en pages and the curriculum pages. Review copies and word
 * problems are intentionally excluded because those are already materialized
 * elsewhere. The remaining differences are real constraints or formats:
 * horizontal division, explicit remainder rules, missing values/digits,
 * like-denominator operand pairs, vertical decimal work, and thousandths.
 */
function eligible(runtime, stage, profile) {
  if (!['기본 연산', '빈칸 응용'].includes(profile.group)) return false;
  if (profile.mode === 'story') return false;

  if (stage.id === 'tables') {
    return profile.mode === 'blank' || Boolean(profile.tables && !profile.tables.includes(0));
  }
  if (stage.id === 'div-facts') return profile.mode === 'blank';

  if (profile.mode === 'skill') {
    return ['improper', 'mixed', 'one-fraction'].includes(profile.skill);
  }

  if (profile.mode === 'blank' || profile.mode === 'digit') return true;

  const type = typeFor(runtime, profile);
  const config = type?.config || {};
  if (!type) return false;

  if (config.kind === 'natural') {
    if (profile.layout === 'horizontal') return true;
    return profile.condition !== undefined || profile.remainder !== undefined;
  }

  if (config.kind === 'fraction' || config.kind === 'fraction-pair') {
    return Boolean(profile.same && config.fa !== 'whole' && config.fb !== 'whole');
  }

  if (config.kind === 'decimal' || config.kind === 'decimal-pair') {
    const places = decimalPlaces(profile, config);
    return profile.layout === 'vertical' || Math.max(...places) >= 3;
  }

  return false;
}

function fingerprint(runtime, profile) {
  return JSON.stringify(Array.from({ length: 18 }, (_, index) =>
    runtime.DrillEngine.rows(profile, 2401 + index * 37, 8)
  ));
}

function semanticKey(runtime, stage, profile) {
  const config = configFor(runtime, profile);
  const code = operationCode(profile, config);
  if ((config.kind === 'decimal' || config.kind === 'decimal-pair') && ['add', 'sub', 'mul'].includes(code)) {
    const places = decimalPlaces(profile, config).sort((a, b) => a - b);
    return [stage.id, profile.mode, profile.layout, code, ...places].join('|');
  }
  return profile.id;
}

const gradeAndStandardByStage = {
  'tables': [3, '3.OA.C.7'],
  'div-facts': [3, '3.OA.C.7'],
  'div-1': [4, '4.NBT.B.6'],
  'div-2': [5, '5.NBT.B.6'],
  'fraction-forms': [4, '4.NF.B.3'],
  'fraction-same': [4, '4.NF.B.3'],
  'fraction-unlike': [5, '5.NF.A.1'],
  'fraction-mul': [5, '5.NF.B.4'],
  'fraction-div-whole': [6, '6.NS.A.1'],
  'fraction-div': [6, '6.NS.A.1'],
  'decimal-add': [5, '5.NBT.B.7'],
  'decimal-mul': [5, '5.NBT.B.7'],
  'decimal-div-whole': [5, '5.NBT.B.7'],
  'decimal-div': [6, '6.NS.B.3']
};

function gradeInfo(runtime, stage, profile) {
  let [grade, standard] = gradeAndStandardByStage[stage.id] || [stage.grade, ''];
  const config = configFor(runtime, profile);
  if (stage.id === 'decimal-add' && Math.max(...decimalPlaces(profile, config)) >= 3) {
    grade = 6;
    standard = '6.NS.B.3';
  }
  return { grade, standard, gradeLabel: `Grade ${grade}` };
}

const digitWords = { 1: 'One-Digit', 2: 'Two-Digit', 3: 'Three-Digit', 4: 'Four-Digit' };
const decimalNames = { 0: 'Whole Numbers', 1: 'Tenths', 2: 'Hundredths', 3: 'Thousandths' };
const formNames = {
  whole: 'Whole Numbers',
  proper: 'Proper Fractions',
  improper: 'Improper Fractions',
  mixed: 'Mixed Numbers'
};

function joinOperands(a, b) {
  if (a === b) return a;
  return `${a} and ${b}`;
}

function fractionPair(config) {
  const a = formNames[config.fa] || 'Fractions';
  const b = formNames[config.fb] || 'Fractions';
  if (config.fa === config.fb) return `Two ${a}`;
  return `${a} and ${b}`;
}

function operationCode(profile, config) {
  return profile.code || config.code || (profile.source.includes('-sub') ? 'sub' : profile.source.includes('-mul') ? 'mul' : profile.source.includes('-div') ? 'div' : 'add');
}

function naturalHeading(profile, config, grade) {
  const a = digitWords[config.da] || `${config.da}-Digit`;
  const b = digitWords[config.db] || `${config.db}-Digit`;
  let base = `${a} by ${b} Division`;
  if (profile.remainder === true) base += ' with Remainders';
  if (profile.remainder === false) base += ' without Remainders';
  if (profile.mode === 'blank') return `Missing Number ${base} Worksheets for Grade ${grade}`;
  if (profile.mode === 'digit') return `Missing Digit ${base} Worksheets for Grade ${grade}`;
  const format = profile.layout === 'vertical' ? 'Long Division Format' : 'Horizontal Practice';
  return `${base} Worksheets for Grade ${grade} — ${format}`;
}

function fractionHeading(stage, profile, config, grade) {
  if (profile.mode === 'skill') {
    const names = {
      improper: 'Improper Fractions to Mixed Numbers Worksheets',
      mixed: 'Mixed Numbers to Improper Fractions Worksheets',
      'one-fraction': 'Writing One as a Fraction Worksheets'
    };
    return `${names[profile.skill]} for Grade ${grade}`;
  }
  const code = operationCode(profile, config);
  const noun = { add: 'Addition', sub: 'Subtraction', mul: 'Multiplication', div: 'Division' }[code];
  const verb = { add: 'Adding', sub: 'Subtracting', mul: 'Multiplying', div: 'Dividing' }[code];
  const denominator = stage.id === 'fraction-same' ? 'Like Denominators' : stage.id === 'fraction-unlike' ? 'Unlike Denominators' : '';
  if (profile.mode === 'blank') {
    if (config.kind === 'fraction') {
      return `Missing Number Fraction ${noun}${denominator ? ` with ${denominator}` : ''} Worksheets for Grade ${grade}`;
    }
    return `Missing Number: ${verb} ${fractionPair(config)} Worksheets for Grade ${grade}`;
  }
  return `${verb} ${fractionPair(config)}${denominator ? ` with ${denominator}` : ''} Worksheets for Grade ${grade}`;
}

function decimalHeading(profile, config, grade) {
  const [aPlaces, bPlaces] = decimalPlaces(profile, config);
  const a = decimalNames[aPlaces] || `${aPlaces}-Decimal-Place Numbers`;
  const b = decimalNames[bPlaces] || `${bPlaces}-Decimal-Place Numbers`;
  const code = operationCode(profile, config);
  const pair = joinOperands(a, b);
  const base = code === 'add'
    ? `Decimal Addition with ${pair}`
    : code === 'sub'
      ? `Decimal Subtraction with ${pair}`
      : code === 'mul'
        ? `Decimal Multiplication with ${pair}`
        : `Decimal Division: ${a} Divided by ${b}`;
  if (profile.mode === 'blank') return `Missing Number ${base} Worksheets for Grade ${grade}`;
  const format = profile.layout === 'vertical' ? 'Vertical' : 'Horizontal';
  return `${format} ${base} Worksheets for Grade ${grade}`;
}

function factsHeading(stage, profile, grade) {
  if (stage.id === 'div-facts') return `Missing Number Division Facts Worksheets for Grade ${grade}`;
  if (profile.mode === 'blank') return profile.sourceExtra?.tables?.length === 1
    ? `Missing Factor ${profile.sourceExtra.tables[0]} Times Table Worksheets for Grade ${grade}`
    : `Missing Factor Multiplication Facts Worksheets for Grade ${grade}`;
  const tables = profile.tables;
  const list = tables.length === 1
    ? `${tables[0]} Times Table`
    : tables.length === 8
      ? 'Multiplication Facts 2-9'
      : `${tables.slice(0, -1).join(', ')}, and ${tables.at(-1)} Times Tables`;
  return `${list} Worksheets for Grade ${grade}`;
}

function seoHeading(runtime, stage, profile, grade) {
  if (stage.id === 'tables' || stage.id === 'div-facts') return factsHeading(stage, profile, grade);
  const config = configFor(runtime, profile);
  if (config.kind === 'natural') return naturalHeading(profile, config, grade);
  if (config.kind === 'fraction' || config.kind === 'fraction-pair' || profile.mode === 'skill') {
    return fractionHeading(stage, profile, config, grade);
  }
  return decimalHeading(profile, config, grade);
}

function focusText(runtime, stage, profile) {
  if (stage.id === 'tables') {
    return profile.mode === 'blank' ? 'use multiplication facts to find missing factors' : `practice the ${profile.tables.join(', ')} multiplication facts`;
  }
  if (stage.id === 'div-facts') return 'use multiplication facts to find missing values in division equations';
  const config = configFor(runtime, profile);
  if (config.kind === 'natural') {
    const remainder = profile.remainder === true ? ' and interpret a remainder' : profile.remainder === false ? ' with an exact whole-number quotient' : '';
    return `divide a ${config.da}-digit dividend by a ${config.db}-digit divisor${remainder}`;
  }
  if (profile.mode === 'skill') {
    return profile.skill === 'improper'
      ? 'rename improper fractions as mixed numbers'
      : profile.skill === 'mixed'
        ? 'rename mixed numbers as improper fractions'
        : 'represent one whole with equivalent fractions';
  }
  if (config.kind === 'fraction' || config.kind === 'fraction-pair') {
    const code = operationCode(profile, config);
    return `${code === 'add' ? 'add' : code === 'sub' ? 'subtract' : code === 'mul' ? 'multiply' : 'divide'} fractions${stage.id === 'fraction-same' ? ' with like denominators' : stage.id === 'fraction-unlike' ? ' with unlike denominators' : ''}`;
  }
  const [a, b] = decimalPlaces(profile, config);
  const code = operationCode(profile, config);
  return `${{ add: 'add', sub: 'subtract', mul: 'multiply', div: 'divide' }[code]} decimals with operands shown to ${decimalNames[a].toLowerCase()} and ${decimalNames[b].toLowerCase()}`;
}

function formatText(profile) {
  if (profile.mode === 'skill') return 'concept conversion practice';
  if (profile.mode === 'blank') return 'missing-number equations';
  if (profile.mode === 'digit') return 'missing-digit written work';
  if (profile.remainder === true) return `${profile.layout} division with remainders`;
  if (profile.remainder === false) return `${profile.layout} exact division`;
  return `${profile.layout} computation`;
}

function description(entry) {
  const exact = entry.title
    .replace(` - Grade ${entry.grade}`, '')
    .replace(' | Googoodan', '')
    .toLowerCase();
  const value = `Free Grade ${entry.grade} ${exact} worksheet. Fresh problems, a matching answer key, and one-page Letter/A4 printing.`;
  return value.length < 120 ? `${value} Ideal for daily fact fluency.` : value;
}
function seoTitle(entry) {
  let title = entry.h1
    .replaceAll('Two-Digit', '2-Digit')
    .replaceAll('Three-Digit', '3-Digit')
    .replaceAll('One-Digit', '1-Digit')
    .replaceAll('without Remainders', 'No Remainders')
    .replaceAll('with Remainders', 'With Remainders')
    .replaceAll('Improper Fractions and Proper Fractions', 'Improper and Proper Fractions')
    .replaceAll('Adding', 'Add')
    .replaceAll('Subtracting', 'Subtract')
    .replaceAll('Multiplying', 'Multiply')
    .replaceAll('Dividing', 'Divide')
    .replaceAll(' with Like Denominators', ', Like Denominators')
    .replaceAll(' with Unlike Denominators', ', Unlike Denominators')
    .replaceAll(' — Horizontal Practice', ' - Horizontal')
    .replaceAll(' — Long Division Format', ' - Vertical')
    .replace(` Worksheets for Grade ${entry.grade}`, ` - Grade ${entry.grade}`)
    .replace(` for Grade ${entry.grade}`, ` - Grade ${entry.grade}`)
    .replace(' Worksheets', '');
  return `${title} | Googoodan`;
}

function resourceSection(entry, siblings) {
  const links = siblings
    .filter(item => item.filename !== entry.filename)
    .slice(0, 6)
    .map(item => `<li><a href="${escapeAttr(item.urlPath)}">${escapeText(item.h1)}</a></li>`)
    .join('');
  const strategy = entry.stage.id.startsWith('decimal')
    ? 'Ask the student to name the place value of each digit before calculating. For vertical work, line up decimal points and use zeros only when they clarify equivalent place values.'
    : entry.stage.id.startsWith('fraction')
      ? 'Use a fraction strip, area model, or number line for the first example. Have the student explain why the denominator stays the same or why equivalent fractions are needed.'
      : 'Estimate the quotient first, then divide, multiply, subtract, and bring down in order. Check the completed quotient by multiplying it by the divisor.';
  return `<section class="seo-resource" aria-labelledby="upper-level-guide-heading">
<h2 id="upper-level-guide-heading">How to use this Grade ${entry.grade} worksheet</h2>
<p><strong>${escapeText(entry.h1)}</strong> provides focused practice connected to Common Core ${escapeText(entry.standard)}. Students ${escapeText(focusText(entry.runtime, entry.stage, entry.profile))}. The worksheet uses Googoodan's existing problem generator, so <strong>New numbers</strong> creates another version with the same format and constraints.</p>
<h3>Teach the method, then build fluency</h3>
<p>${escapeText(strategy)} This page uses ${escapeText(formatText(entry.profile))}, so the visual arrangement matches the skill named in the title. Begin with two or three problems, discuss one efficient method, and continue only after the student can explain the setup.</p>
<h3>Use missing values as a reasoning check</h3>
<p>${entry.profile.mode === 'blank' || entry.profile.mode === 'digit' ? 'The unknown changes position across the page. Students can use inverse operations and place value to recover it instead of following one memorized direction.' : 'After direct practice, cover one operand or digit in a completed example. Ask the student to recover the hidden value with an inverse operation and explain how the known values determine it.'} This makes the worksheet useful for an independent warm-up, a math center, tutoring, homework, or a short intervention.</p>
<h3>Print the worksheet and matching answer key</h3>
<p>Preview the <strong>Worksheet</strong> or <strong>Answer key</strong>, or choose both in the print selection. The answer key is generated from the exact same seed, numbers, and problem order. Each version is free to print and is formatted as one page on US Letter and A4 paper. Select <strong>New numbers</strong> whenever another practice set is needed.</p>
<h3>Related upper elementary worksheets</h3>
<ul>${links}</ul>
<p><a href="/en/levels.html">Browse all practice levels</a> · <a href="/en/worksheets.html">Browse all printable math worksheets</a></p>
</section>`;
}

function jsonLd(entry) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE}/#website`,
        name: 'googoodan',
        alternateName: '구구단닷컴',
        url: `${SITE}/`
      },
      {
        '@type': ['WebPage', 'LearningResource'],
        '@id': `${entry.canonical}#worksheet`,
        url: entry.canonical,
        name: entry.h1,
        description: entry.description,
        inLanguage: 'en-US',
        educationalLevel: `Grade ${entry.grade}`,
        teaches: entry.standard,
        learningResourceType: 'Printable worksheet',
        isAccessibleForFree: true,
        isPartOf: { '@id': `${SITE}/#website` }
      }
    ]
  }).replace(/</g, '\\u003c');
}

function bootstrap(entry) {
  const exact = `q.get('unit')===${JSON.stringify(entry.stage.id)}&&q.get('drill')===${JSON.stringify(entry.profile.id)}`;
  return `<script>(function(){var p=new URLSearchParams(location.search);if(!p.has('unit'))p.set('unit',${JSON.stringify(entry.stage.id)});if(!p.has('drill'))p.set('drill',${JSON.stringify(entry.profile.id)});history.replaceState(null,'',location.pathname+'?'+p.toString()+location.hash);addEventListener('DOMContentLoaded',function(){var title=${JSON.stringify(entry.title)},canonical=${JSON.stringify(entry.canonical)},heading=${JSON.stringify(entry.h1)};var keep=function(){var q=new URLSearchParams(location.search);if(!(${exact}))return;var t=document.querySelector('title'),c=document.querySelector('link[rel=canonical]'),h=document.querySelector('aside h1');if(t&&t.textContent!==title)t.textContent=title;if(c&&c.href!==canonical)c.href=canonical;if(h&&h.textContent!==heading)h.textContent=heading;};keep();var t=document.querySelector('title'),c=document.querySelector('link[rel=canonical]'),h=document.querySelector('aside h1');if(t)new MutationObserver(keep).observe(t,{childList:true});if(c)new MutationObserver(keep).observe(c,{attributes:true,attributeFilter:['href']});if(h)new MutationObserver(keep).observe(h,{childList:true,subtree:true});});})();</script>`;
}

function transformTemplate(template, entry, siblings) {
  const alternates = `<link rel="alternate" hreflang="en" href="${entry.canonical}"><link rel="alternate" hreflang="ko" href="${SITE}/ko/"><link rel="alternate" hreflang="ja" href="${SITE}/ja/"><link rel="alternate" hreflang="fr" href="${SITE}/fr/"><link rel="alternate" hreflang="de" href="${SITE}/de/"><link rel="alternate" hreflang="x-default" href="${SITE}/">`;
  const social = `<meta property="og:title" content="${escapeAttr(entry.title)}"><meta property="og:description" content="${escapeAttr(entry.description)}"><meta property="og:url" content="${entry.canonical}"><meta property="og:type" content="website">`;
  const styles = `<style>.seo-resource{max-width:1080px;margin:0 auto 36px;padding:24px;background:#fff;border:1px solid #dce7e9;border-radius:12px;line-height:1.72}.seo-resource h2,.seo-resource h3{color:#164f5b}.seo-resource li{margin:.35em 0}@media(max-width:850px){.seo-resource{margin:0 15px 24px;padding:18px}}@media print{.seo-resource{display:none!important}}</style>`;
  let html = template;
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeText(entry.title)}</title>`);
  html = html.replace(/<meta name="description" content="[^"]*">/i, `<meta name="description" content="${escapeAttr(entry.description)}">`);
  html = html.replace(/<link rel="canonical" href="[^"]*">/i, `<link rel="canonical" href="${entry.canonical}">`);
  html = html.replace(/<link rel="alternate"[^>]*>/gi, '');
  html = html.replace(/<script id="website-identity" type="application\/ld\+json">[\s\S]*?<\/script>/i, `<script id="website-identity" type="application/ld+json">${jsonLd(entry)}</script>`);
  html = html.replace('<script defer src="/en/types.js', `${bootstrap(entry)}<script defer src="/en/types.js`);
  html = html.replace('</head>', `${alternates}${social}${styles}</head>`);

  for (const name of ['level-catalog.js', 'level-english.js', 'curriculum.js', 'app.js', 'level-page.js']) {
    html = html.replaceAll(`src="${name}`, `src="/en/${name}`);
  }
  html = html.replace(/<body\s+data-type="[^"]*"\s+data-base="[^"]*">/i, `<body data-type="${escapeAttr(entry.profile.id)}" data-base="/en/" data-static-unit="${escapeAttr(entry.stage.id)}" data-static-profile="${escapeAttr(entry.profile.id)}" data-static-grade="${entry.grade}">`);
  html = html.replace('<h1>Choose your practice</h1>', `<h1>${escapeText(entry.h1)}</h1>`);
  html = html.replace('<p>Choose a skill and print your practice.</p>', `<p>${escapeText(entry.description)}</p>`);
  html = html.replace(/<h2 id="sheet-title">[\s\S]*?<\/h2>/i, `<h2 id="sheet-title">${escapeText(entry.profile.title)}</h2>`);
  html = html.replace('<a class="language-link" href="/">Korean ↗</a>', '<a class="language-link" href="/ko/">Korean ↗</a>');
  html = html.replaceAll('href="levels.html"', 'href="/en/levels.html"');
  html = html.replaceAll('href="grades.html"', 'href="/en/grades.html"');
  html = html.replaceAll('href="about.html"', 'href="/en/about.html"');
  html = html.replaceAll('href="contact.html"', 'href="/en/contact.html"');
  html = html.replaceAll('href="privacy.html"', 'href="/en/privacy.html"');
  html = html.replaceAll('href="terms.html"', 'href="/en/terms.html"');
  html = html.replace('</body>', `${resourceSection(entry, siblings)}</body>`);
  return html;
}

function build() {
  const runtime = loadLevelCatalog();
  const stages = runtime.DrillCatalog.units.filter(stage => stage.grade >= 3 && stage.grade <= 6 || ['tables', 'div-facts'].includes(stage.id));
  const fingerprints = new Set();
  const semanticKeys = new Set();
  const selected = [];
  const duplicateProfiles = [];
  const semanticDuplicates = [];

  for (const stage of stages) {
    for (const profile of stage.drills) {
      if (!eligible(runtime, stage, profile)) continue;
      const semantic = semanticKey(runtime, stage, profile);
      if (semanticKeys.has(semantic)) {
        semanticDuplicates.push({ stage: stage.id, profile: profile.id, title: profile.title, semantic });
        continue;
      }
      semanticKeys.add(semantic);
      const value = fingerprint(runtime, profile);
      if (fingerprints.has(value)) {
        duplicateProfiles.push({ stage: stage.id, profile: profile.id, title: profile.title });
        continue;
      }
      fingerprints.add(value);
      selected.push({ stage, profile });
    }
  }

  const entries = selected.map(({ stage, profile }) => {
    const info = gradeInfo(runtime, stage, profile);
    const h1 = seoHeading(runtime, stage, profile, info.grade);
    const core = h1.replace(` for Grade ${info.grade}`, '');
    const filename = `grade-${info.grade}-${stage.id}-${slug(core)}.html`;
    const urlPath = `/en/print/level-skills-upper/${filename}`;
    const canonical = SITE + urlPath;
    const entry = { runtime, stage, profile, ...info, h1, filename, urlPath, canonical };
    entry.title = seoTitle(entry);
    entry.description = description(entry);
    return entry;
  });

  const uniqueness = [
    ['filename', entry => entry.filename],
    ['title', entry => entry.title],
    ['h1', entry => entry.h1],
    ['canonical', entry => entry.canonical],
    ['profile', entry => entry.profile.id]
  ];
  for (const [label, getter] of uniqueness) {
    const values = entries.map(getter);
    if (new Set(values).size !== values.length) {
      const duplicates = values.filter((value, index) => values.indexOf(value) !== index);
      throw new Error(`Duplicate ${label}: ${[...new Set(duplicates)].join(', ')}`);
    }
  }
  if (entries.length > 220) throw new Error(`Conservative selection exceeds 220 pages: ${entries.length}`);
  if (entries.length < 80) throw new Error(`Selection unexpectedly small: ${entries.length}`);

  fs.mkdirSync(outputDir, { recursive: true });
  const template = fs.readFileSync(templatePath, 'utf8');
  const expectedFiles = new Set(entries.map(entry => entry.filename));
  for (const entry of entries) {
    const siblings = entries.filter(other => other.stage.id === entry.stage.id);
    fs.writeFileSync(path.join(outputDir, entry.filename), transformTemplate(template, entry, siblings), 'utf8');
  }
  for (const oldFile of fs.readdirSync(outputDir).filter(file => file.endsWith('.html'))) {
    if (!expectedFiles.has(oldFile)) fs.unlinkSync(path.join(outputDir, oldFile));
  }

  const stageCounts = Object.fromEntries(stages.map(stage => [stage.id, entries.filter(entry => entry.stage.id === stage.id).length]).filter(([, count]) => count));
  const gradeCounts = Object.fromEntries([3, 4, 5, 6].map(grade => [grade, entries.filter(entry => entry.grade === grade).length]));
  const manifest = {
    generatedAt: '2026-09-13',
    buildVersion: BUILD_VERSION,
    source: ['en/level-catalog.js', 'ko/drill-catalog.js', 'ko/drill-engine.js'],
    count: entries.length,
    conservativeCap: 220,
    reasonBelowCap: 'Only genuinely distinct format, constraint, missing-value, and decimal-place profiles were kept. Root-page equivalents, review copies, word problems, and curriculum-page equivalents were excluded.',
    gradeCounts,
    stageCounts,
    semanticDuplicatesExcluded: semanticDuplicates,
    generatedFingerprintDuplicatesExcluded: duplicateProfiles,
    pages: entries.map(entry => ({
      file: `en/print/level-skills-upper/${entry.filename}`,
      url: entry.canonical,
      stage: entry.stage.id,
      profile: entry.profile.id,
      grade: entry.grade,
      standard: entry.standard,
      title: entry.title,
      h1: entry.h1,
      description: entry.description,
      format: formatText(entry.profile)
    }))
  };
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  process.stdout.write(`Generated ${entries.length} distinct upper-level pages. Grades: ${JSON.stringify(gradeCounts)}.\n`);
}

build();
