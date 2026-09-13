const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const enDir = __dirname;
const outputDir = path.join(enDir, 'print', 'common-core-arithmetic');
const templatePath = path.join(enDir, 'us-arithmetic.html');
const catalogPath = path.join(enDir, 'us-arithmetic-catalog.js');
const SITE = 'https://googoodan.com';
const BUILD_VERSION = '20260913-common-core-static';

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

function loadCatalog() {
  const sandbox = {
    console,
    Worksheets: {
      types: [],
      generate() { return []; },
      fraction(n, d) { return d === 1 ? String(n) : `${n}/${d}`; },
      exact() { return [0, 1]; }
    },
    DrillEngine: { gcd() { return 1; }, lcm() { return 1; } }
  };
  sandbox.globalThis = sandbox;
  vm.runInNewContext(fs.readFileSync(catalogPath, 'utf8'), sandbox, { filename: catalogPath });
  return sandbox.USArithmetic;
}

const topics = {
  'us-1-within20': {
    short: 'Addition and Subtraction Within 20',
    keyword: 'addition and subtraction within 20 worksheets',
    concept: 'Students build fluency with sums and differences through 20 and connect subtraction to related addition facts.',
    strategy: 'Counting on, making ten, doubles, and fact families can all support accurate mental calculation.'
  },
  'us-1-add100': {
    short: 'Addition Within 100',
    keyword: 'addition within 100 worksheets',
    concept: 'Students add a two-digit number and a one-digit number while keeping each total at 100 or less.',
    strategy: 'Separate tens and ones, make a new ten when helpful, and check that the answer is reasonable.'
  },
  'us-1-tens': {
    short: 'Adding and Subtracting Multiples of 10',
    keyword: 'adding and subtracting multiples of 10 worksheets',
    concept: 'Students use place value to add and subtract whole tens without changing the ones digit.',
    strategy: 'A hundred chart or bundles of ten can show why each step changes the tens place by one or more tens.'
  },
  'us-2-facts20': {
    short: 'Addition and Subtraction Facts Within 20',
    keyword: 'addition and subtraction facts within 20 worksheets',
    concept: 'Students strengthen fluent recall of addition and subtraction facts with answers through 20.',
    strategy: 'Make-ten facts, doubles, near doubles, and related fact families help replace counting one by one.'
  },
  'us-2-within100': {
    short: 'Addition and Subtraction Within 100',
    keyword: 'addition and subtraction within 100 worksheets',
    concept: 'Students add and subtract within 100 using place value and the relationship between the two operations.',
    strategy: 'Work with tens and ones separately, then use the inverse operation to check the result.'
  },
  'us-2-within1000': {
    short: 'Addition and Subtraction Within 1,000',
    keyword: 'addition and subtraction within 1000 worksheets',
    concept: 'Students calculate with three-digit numbers and apply place-value strategies across hundreds, tens, and ones.',
    strategy: 'Estimate first, align equal place values, and explain each regrouping step before checking the answer.'
  },
  'us-2-fouradd': {
    short: 'Adding Four Two-Digit Numbers',
    keyword: 'adding four two digit numbers worksheets',
    concept: 'Students add four two-digit numbers and look for friendly pairs that make a multiple of ten.',
    strategy: 'Reorder addends to make tens, keep a clear running total, and estimate before calculating exactly.'
  }
};

const formatCopy = {
  horizontal: {
    label: 'Horizontal Practice',
    sentence: 'The horizontal format keeps each equation on one line, making it useful for mental math, fact strategies, and short daily practice.'
  },
  vertical: {
    label: 'Vertical Practice',
    sentence: 'The vertical format lines up place values and gives students room to record regrouping or other written steps.'
  },
  blank: {
    label: 'Missing Number Practice',
    sentence: 'The missing-number format changes which part is unknown, so students reason about the relationship among the numbers instead of following one fixed routine.'
  },
  review: {
    label: 'Prerequisite Review',
    sentence: 'This review uses the prerequisite generator already linked to the topic. It is a practical warm-up before students begin the grade-level work.'
  },
  challenge: {
    label: 'Missing Addend Practice',
    sentence: 'One addend is hidden in each problem. Students can subtract the known parts from the total or use addition reasoning to find the missing value.'
  },
  story: {
    label: 'Word Problems',
    sentence: 'Each problem places the same arithmetic in a short situation. Students identify the operation, calculate, and check that the answer fits the story.'
  }
};

function formatKey(profile) {
  if (profile.story) return 'story';
  if (profile.challenge) return 'challenge';
  if (profile.group === '기초 보충') return 'review';
  if (profile.mode === 'blank') return 'blank';
  return profile.layout === 'vertical' ? 'vertical' : 'horizontal';
}

function heading(topic, profile) {
  const format = formatKey(profile);
  if (format === 'story') return `${topic.short} Word Problems`;
  if (format === 'review') return `Grade ${profile.grade} Review for ${topic.short}`;
  if (format === 'challenge') return `Missing Addends: ${topic.short} Worksheets`;
  if (format === 'blank') return `Missing Number ${topic.short} Worksheets`;
  if (format === 'vertical') return `Vertical ${topic.short} Worksheets`;
  return `${topic.short} Worksheets: Horizontal Practice`;
}

function description(topic, profile, grade, standard) {
  const format = formatCopy[formatKey(profile)].label.toLowerCase();
  return `Free printable Grade ${grade} ${topic.keyword} with ${format} and matching answer keys. Common Core ${standard}.`;
}

function helperSection({ h1, topic, profile, grade, standard, siblings, currentFile }) {
  const format = formatCopy[formatKey(profile)];
  const siblingLinks = siblings
    .filter(item => item.file !== currentFile)
    .map(item => `<li><a href="/en/print/common-core-arithmetic/${escapeAttr(item.file)}">${escapeText(item.h1)}</a></li>`)
    .join('');
  return `<section class="seo-resource" aria-labelledby="common-core-guide-heading">
<h2 id="common-core-guide-heading">How to use this Grade ${grade} arithmetic worksheet</h2>
<p><strong>${escapeText(h1)}</strong> gives students focused practice connected to Common Core ${escapeText(standard)}. ${escapeText(topic.concept)} The worksheet opens with a fresh set of problems and includes an answer key generated from those exact numbers.</p>
<h3>Practice focus</h3>
<p>${escapeText(format.sentence)} ${escapeText(topic.strategy)} Ask the learner to explain one answer aloud; a short explanation often reveals whether the place-value or fact strategy is understood.</p>
<h3>Print a new worksheet and matching answer key</h3>
<p>Select <strong>New numbers</strong> to create another set without changing the skill. Use the <strong>Worksheet</strong> and <strong>Answer key</strong> controls to preview either page. The print choices can include the worksheet, the answer key, or both. The same seed is used for both versions, so every problem stays in the same position. Printing is free and works on US Letter and A4 paper.</p>
<p>This page is focused practice for one arithmetic objective rather than a complete assessment of the standard. Start with accuracy, use a drawing or place-value model when needed, and move to a fresh set after the learner can describe the method independently.</p>
<h3>More ${escapeText(topic.short)} practice</h3>
<ul>${siblingLinks}</ul>
<p><a href="/en/us-arithmetic.html?grade=${grade}">Browse all United States Common Core arithmetic worksheets</a></p>
</section>`;
}

function pageJsonLd({ h1, description: metaDescription, canonical, grade, standard }) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE}/#website`,
        name: 'Googoodan',
        alternateName: 'googoodan',
        url: SITE
      },
      {
        '@type': ['WebPage', 'LearningResource'],
        '@id': `${canonical}#worksheet`,
        url: canonical,
        name: h1,
        description: metaDescription,
        inLanguage: 'en-US',
        educationalLevel: `Grade ${grade}`,
        teaches: standard,
        isAccessibleForFree: true,
        isPartOf: { '@id': `${SITE}/#website` }
      }
    ]
  }).replace(/</g, '\\u003c');
}

function transformTemplate(template, entry, siblings) {
  const { unit, profile, topic, file, h1 } = entry;
  const canonical = `${SITE}/en/print/common-core-arithmetic/${file}`;
  const metaDescription = description(topic, profile, unit.grade, unit.standard);
  const documentTitle = `${h1} | Googoodan`;
  const init = `<script>(function(){window.GDCurriculumConfig={prefix:'us',title:${JSON.stringify(h1)},referenceLabel:'Common Core',source:'https://www.thecorestandards.org/Math/Content/'};const u=new URL(location.href);u.searchParams.set('unit',${JSON.stringify(unit.id)});u.searchParams.set('drill',${JSON.stringify(profile.id)});u.searchParams.set('type',${JSON.stringify(profile.id)});history.replaceState(null,'',u.pathname+'?'+u.searchParams.toString()+u.hash);})();</script>`;
  const alternates = `<link rel="alternate" hreflang="en" href="${canonical}"><link rel="alternate" hreflang="ko" href="${SITE}/ko/"><link rel="alternate" hreflang="ja" href="${SITE}/ja/"><link rel="alternate" hreflang="fr" href="${SITE}/fr/"><link rel="alternate" hreflang="de" href="${SITE}/de/"><link rel="alternate" hreflang="x-default" href="${SITE}/">`;
  const jsonLd = `<script type="application/ld+json">${pageJsonLd({ h1, description: metaDescription, canonical, grade: unit.grade, standard: unit.standard })}</script>`;
  const helper = helperSection({ h1, topic, profile: { ...profile, grade: unit.grade }, grade: unit.grade, standard: unit.standard, siblings, currentFile: file });

  let html = template;
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeText(documentTitle)}</title>`);
  html = html.replace(/<meta name="description" content="[^"]*">/i, `<meta name="description" content="${escapeAttr(metaDescription)}">`);
  html = html.replace(/<link rel="canonical" href="[^"]*">/i, `<link rel="canonical" href="${canonical}">`);
  html = html.replace(/<link rel="alternate"[^>]*>/gi, '');
  html = html.replace(/<script id="website-identity" type="application\/ld\+json">[\s\S]*?<\/script>/i, jsonLd);
  html = html.replace('<script defer src="us-arithmetic-catalog.js', '<script defer src="/en/us-arithmetic-catalog.js');
  html = html.replace('<script defer src="curriculum.js', '<script defer src="/en/curriculum.js');
  html = html.replace('<script defer src="app.js', '<script defer src="/en/app.js');
  html = html.replace('<script defer src="us-arithmetic-page.js', '<script defer src="/en/us-arithmetic-page.js');
  html = html.replace('<script defer src="/en/us-arithmetic-catalog.js', `${init}<script defer src="/en/us-arithmetic-catalog.js`);
  html = html.replace('</head>', `${alternates}</head>`);
  html = html.replace(/<body\s+data-type="[^"]*"\s+data-base="[^"]*">/i, `<body data-type="${escapeAttr(profile.id)}" data-base="/en/" data-regional-title="${escapeAttr(documentTitle)}" data-regional-canonical="${canonical}" data-static-unit="${escapeAttr(unit.id)}" data-static-profile="${escapeAttr(profile.id)}">`);
  html = html.replace(/<h1>Choose your practice<\/h1>/i, `<h1>${escapeText(h1)}</h1>`);
  html = html.replace(/<p>Choose a skill and print your practice\.<\/p>/i, `<p>Free printable Grade ${unit.grade} practice for ${escapeText(unit.name.toLowerCase())}, with a matching answer key.</p>`);
  html = html.replace(/<h2 id="sheet-title">[\s\S]*?<\/h2>/i, `<h2 id="sheet-title">${escapeText(profile.title)}</h2>`);
  html = html.replace('<a href="/">Korean ↗</a>', '<a href="/ko/">Korean ↗</a>');
  html = html.replace(/href="about\.html"/g, 'href="/en/about.html"');
  html = html.replace(/href="contact\.html"/g, 'href="/en/contact.html"');
  html = html.replace(/href="privacy\.html"/g, 'href="/en/privacy.html"');
  html = html.replace(/href="terms\.html"/g, 'href="/en/terms.html"');
  html = html.replace('</body>', `${helper}</body>`);
  return html;
}

function build() {
  const catalog = loadCatalog();
  const units = catalog.units.filter(unit => unit.grade === 1 || unit.grade === 2);
  const entries = [];

  for (const unit of units) {
    const topic = topics[unit.id];
    if (!topic) throw new Error(`Missing topic copy for ${unit.id}`);
    for (const profile of unit.drills) {
      const format = formatKey(profile);
      const base = `${unit.id.replace(/^us-/, 'grade-')}-${slug(formatCopy[format].label)}`;
      const file = `${base}.html`;
      entries.push({ unit, profile, topic, file, h1: heading(topic, { ...profile, grade: unit.grade }) });
    }
  }

  const duplicateFiles = entries.filter((item, index) => entries.findIndex(other => other.file === item.file) !== index);
  const duplicateTitles = entries.filter((item, index) => entries.findIndex(other => other.h1 === item.h1) !== index);
  if (duplicateFiles.length) throw new Error(`Duplicate output files: ${duplicateFiles.map(item => item.file).join(', ')}`);
  if (duplicateTitles.length) throw new Error(`Duplicate H1 values: ${duplicateTitles.map(item => item.h1).join(', ')}`);

  fs.mkdirSync(outputDir, { recursive: true });
  for (const oldFile of fs.readdirSync(outputDir).filter(file => file.endsWith('.html'))) fs.unlinkSync(path.join(outputDir, oldFile));

  const template = fs.readFileSync(templatePath, 'utf8');
  for (const entry of entries) {
    const siblings = entries.filter(item => item.unit.id === entry.unit.id);
    fs.writeFileSync(path.join(outputDir, entry.file), transformTemplate(template, entry, siblings), 'utf8');
  }

  const manifest = {
    generatedAt: '2026-09-13',
    buildVersion: BUILD_VERSION,
    source: 'en/us-arithmetic-catalog.js',
    count: entries.length,
    grades: {
      1: entries.filter(entry => entry.unit.grade === 1).length,
      2: entries.filter(entry => entry.unit.grade === 2).length
    },
    pages: entries.map(entry => ({
      file: `en/print/common-core-arithmetic/${entry.file}`,
      url: `${SITE}/en/print/common-core-arithmetic/${entry.file}`,
      grade: entry.unit.grade,
      unit: entry.unit.id,
      standard: entry.unit.standard,
      profile: entry.profile.id,
      sourceProfile: entry.profile.generatorUnit || entry.profile.unit,
      format: formatKey(entry.profile),
      title: `${entry.h1} | Googoodan`
    }))
  };
  fs.writeFileSync(path.join(outputDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  process.stdout.write(`Generated ${entries.length} Common Core arithmetic pages (Grade 1: ${manifest.grades[1]}, Grade 2: ${manifest.grades[2]}).\n`);
}

build();
