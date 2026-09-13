const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const enDir = __dirname;
const outputDir = path.join(enDir, 'print', 'common-core-arithmetic-upper');
const templatePath = path.join(enDir, 'us-arithmetic.html');
const catalogPath = path.join(enDir, 'us-arithmetic-catalog.js');
const SITE = 'https://googoodan.com';
const BUILD_VERSION = '20260913-common-core-upper-static';

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
  'us-3-facts': {
    short: 'Multiplication and Division Facts',
    keyword: 'multiplication and division facts worksheets',
    concept: 'Students practice related multiplication and division facts so they can recognize fact families and calculate efficiently.',
    strategy: 'Use equal groups, arrays, skip counting, and the inverse relationship between multiplication and division.'
  },
  'us-3-within1000': {
    short: 'Addition and Subtraction Within 1,000',
    keyword: 'addition and subtraction within 1,000 worksheets',
    concept: 'Students add and subtract three-digit numbers while applying place value and regrouping across hundreds, tens, and ones.',
    strategy: 'Estimate first, align equal place values, and use the inverse operation to check each result.'
  },
  'us-3-tensmul': {
    short: 'Multiplying by Multiples of 10',
    keyword: 'multiplying by multiples of 10 worksheets',
    concept: 'Students connect basic multiplication facts to products involving whole tens such as 4 times 60.',
    strategy: 'Find the related one-digit fact, then use place value to explain why the product is ten times as large.'
  },
  'us-4-largeadd': {
    short: 'Multi-Digit Addition and Subtraction',
    keyword: 'multi-digit addition and subtraction worksheets',
    concept: 'Students add and subtract larger whole numbers accurately using the standard algorithm and place-value reasoning.',
    strategy: 'Line up place values, regroup one column at a time, and compare the exact result with an estimate.'
  },
  'us-4-mul4': {
    short: 'Four-Digit by One-Digit Multiplication',
    keyword: 'four digit by one digit multiplication worksheets',
    concept: 'Students multiply a whole number of up to four digits by a one-digit factor.',
    strategy: 'Break the larger factor into place-value parts or record each regrouping step in the standard algorithm.'
  },
  'us-4-mul2': {
    short: 'Two-Digit by Two-Digit Multiplication',
    keyword: 'two digit by two digit multiplication worksheets',
    concept: 'Students multiply two two-digit numbers and connect partial products to the standard algorithm.',
    strategy: 'Estimate the product, calculate each partial product, and check whether the final answer has a reasonable size.'
  },
  'us-4-div1': {
    short: 'Long Division with One-Digit Divisors',
    keyword: 'long division worksheets with one-digit divisors',
    concept: 'Students divide whole-number dividends of up to four digits by a one-digit divisor.',
    strategy: 'Estimate each quotient digit, multiply, subtract, and bring down the next digit before checking with multiplication.'
  },
  'us-4-likefractions': {
    short: 'Adding and Subtracting Like Fractions',
    keyword: 'adding and subtracting fractions with like denominators worksheets',
    concept: 'Students add and subtract fractions that name equal-size parts and interpret the result as a fraction of the same whole.',
    strategy: 'Keep the common denominator, combine the numerators, and simplify the result when possible.'
  },
  'us-4-fractionwhole': {
    short: 'Multiplying Fractions by Whole Numbers',
    keyword: 'multiplying fractions by whole numbers worksheets',
    concept: 'Students interpret a whole number times a fraction as repeated addition and calculate the product.',
    strategy: 'Multiply the numerator by the whole number, keep the denominator, and simplify or rename the result.'
  },
  'us-4-factors': {
    short: 'Factors and Multiples',
    keyword: 'factors and multiples worksheets',
    concept: 'Students identify factor pairs and use multiplication facts to reason about multiples.',
    strategy: 'Test factor pairs in order and stop after the pair reverses so that no factors are skipped or repeated.'
  },
  'us-5-mul': {
    short: 'Multi-Digit Multiplication',
    keyword: 'multi-digit multiplication worksheets',
    concept: 'Students fluently multiply multi-digit whole numbers using place-value strategies and the standard algorithm.',
    strategy: 'Estimate first, record partial products clearly, and compare the final answer with the estimate.'
  },
  'us-5-div': {
    short: 'Long Division with Two-Digit Divisors',
    keyword: 'long division worksheets with two-digit divisors',
    concept: 'Students divide multi-digit whole numbers by two-digit divisors and interpret remainders when they occur.',
    strategy: 'Use compatible numbers to estimate each quotient digit, then multiply and subtract before bringing down.'
  },
  'us-5-decimals': {
    short: 'Decimal Operations to Hundredths',
    keyword: 'decimal operations worksheets to hundredths',
    concept: 'Students add, subtract, multiply, and divide decimals through hundredths using place-value understanding.',
    strategy: 'Attend to place value, estimate before calculating, and use trailing zeros when they make equivalent values easier to compare.'
  },
  'us-5-unlike': {
    short: 'Adding and Subtracting Unlike Fractions',
    keyword: 'adding and subtracting fractions with unlike denominators worksheets',
    concept: 'Students replace unlike fractions with equivalent fractions that share a common denominator before calculating.',
    strategy: 'Choose a common denominator, rename both fractions, combine the numerators, and simplify.'
  },
  'us-5-fractionmul': {
    short: 'Multiplying Fractions and Mixed Numbers',
    keyword: 'multiplying fractions and mixed numbers worksheets',
    concept: 'Students multiply fractions and mixed numbers and interpret multiplication as scaling.',
    strategy: 'Rename mixed numbers as improper fractions, multiply numerators and denominators, then simplify.'
  },
  'us-5-unitdivide': {
    short: 'Dividing with Unit Fractions',
    keyword: 'dividing unit fractions worksheets',
    concept: 'Students divide unit fractions by whole numbers and whole numbers by unit fractions in meaningful numerical situations.',
    strategy: 'Use a visual model or ask how many equal fractional parts fit in the quantity before applying a rule.'
  },
  'us-5-expressions': {
    short: 'Parentheses and Order of Operations',
    keyword: 'order of operations worksheets with parentheses',
    concept: 'Students evaluate numerical expressions by carrying out operations in the order indicated by grouping symbols.',
    strategy: 'Calculate inside parentheses first, then complete multiplication or division before addition or subtraction.'
  },
  'us-6-fractiondiv': {
    short: 'Dividing Fractions by Fractions',
    keyword: 'dividing fractions by fractions worksheets',
    concept: 'Students compute quotients of fractions and interpret what the quotient means in a numerical situation.',
    strategy: 'Estimate the quotient, multiply by the reciprocal, simplify, and verify by multiplying the quotient by the divisor.'
  },
  'us-6-longdiv': {
    short: 'Multi-Digit Long Division',
    keyword: 'multi-digit long division worksheets',
    concept: 'Students fluently divide multi-digit whole numbers using the standard algorithm.',
    strategy: 'Estimate each quotient digit, multiply, subtract, bring down, and check the result with multiplication.'
  },
  'us-6-decimals': {
    short: 'Multi-Digit Decimal Operations',
    keyword: 'multi-digit decimal operations worksheets',
    concept: 'Students fluently add, subtract, multiply, and divide multi-digit decimals using standard procedures.',
    strategy: 'Estimate with nearby whole numbers, track place value carefully, and use the estimate to check the decimal point.'
  },
  'us-6-gcf': {
    short: 'Greatest Common Factor',
    keyword: 'greatest common factor worksheets',
    concept: 'Students find common factors of two whole numbers and identify the greatest one.',
    strategy: 'List factor pairs systematically or use prime factorization, then compare the factors shared by both numbers.'
  },
  'us-6-lcm': {
    short: 'Least Common Multiple',
    keyword: 'least common multiple worksheets',
    concept: 'Students list or calculate common multiples of two whole numbers and identify the least positive one.',
    strategy: 'List multiples in order or use prime factorization, then verify that the result is divisible by both numbers.'
  }
};

const formatCopy = {
  horizontal: {
    slug: 'horizontal-practice',
    label: 'Horizontal Practice',
    sentence: 'The horizontal format keeps each expression on one line, making it useful for mental strategies, quick checks, and daily fluency practice.'
  },
  vertical: {
    slug: 'vertical-practice',
    label: 'Vertical Practice',
    sentence: 'The vertical format lines up place values and gives students space to record regrouping, partial products, or long-division steps.'
  },
  blank: {
    slug: 'missing-number-practice',
    label: 'Missing Number Practice',
    sentence: 'The missing-number format changes which part is unknown, so students reason about relationships instead of repeating one fixed procedure.'
  },
  review: {
    slug: 'prerequisite-review',
    label: 'Prerequisite Review',
    sentence: 'This review uses the prerequisite generator already linked to the topic and gives students a focused warm-up before grade-level work.'
  },
  challenge: {
    slug: 'missing-part-challenge',
    label: 'Missing Part Challenge',
    sentence: 'Students complete a missing part of a factor list or expression and explain how the known values determine the answer.'
  },
  story: {
    slug: 'word-problems',
    label: 'Word Problems',
    sentence: 'Each problem places the same arithmetic in a short context so students choose a method, calculate, and decide whether the answer is reasonable.'
  }
};

function formatKey(profile) {
  if (profile.story) return 'story';
  if (profile.challenge) return 'challenge';
  if (profile.group === '기초 보충') return 'review';
  if (profile.mode === 'blank') return 'blank';
  return profile.layout === 'vertical' ? 'vertical' : 'horizontal';
}

function heading(topic, profile, grade) {
  const format = formatKey(profile);
  if (format === 'story') return `${topic.short} Word Problems for Grade ${grade}`;
  if (format === 'review') return `Grade ${grade} Prerequisite Review: ${topic.short}`;
  if (format === 'challenge') return `Missing Parts: ${topic.short} Worksheets for Grade ${grade}`;
  if (format === 'blank') return `Missing Number ${topic.short} Worksheets for Grade ${grade}`;
  return `${topic.short} Worksheets for Grade ${grade} — ${formatCopy[format].label}`;
}

function pageTitle(topic, profile, grade) {
  const compact = topic.short
    .replaceAll('Addition and Subtraction', 'Addition & Subtraction')
    .replaceAll('Adding and Subtracting', 'Adding & Subtracting')
    .replaceAll('Multiplication and Division', 'Multiplication & Division')
    .replaceAll('Fractions and Mixed Numbers', 'Fractions & Mixed Numbers')
    .replaceAll('Parentheses and Order', 'Parentheses & Order')
    .replaceAll('Factors and Multiples', 'Factors & Multiples');
  const format = formatKey(profile);
  if (format === 'story') return `${compact} Word Problems - Grade ${grade} | Googoodan`;
  if (format === 'review') return `${compact} Review - Grade ${grade} | Googoodan`;
  if (format === 'challenge') return `${compact}: Missing Parts - Grade ${grade} | Googoodan`;
  if (format === 'blank') return `Missing Number ${compact} - Grade ${grade} | Googoodan`;
  if (format === 'vertical') return `Vertical ${compact} Worksheets - Grade ${grade} | Googoodan`;
  return `${compact} Worksheets - Grade ${grade} | Googoodan`;
}

function description(topic, profile, grade, standard) {
  const format = formatCopy[formatKey(profile)].label.toLowerCase();
  return `Free ${topic.keyword} for Grade ${grade}. ${format}, fresh problems, and a matching answer key. Common Core ${standard}.`;
}

function helperSection({ h1, topic, profile, grade, standard, siblings, currentFile }) {
  const format = formatCopy[formatKey(profile)];
  const siblingLinks = siblings
    .filter(item => item.file !== currentFile)
    .map(item => `<li><a href="/en/print/common-core-arithmetic-upper/${escapeAttr(item.file)}">${escapeText(item.h1)}</a></li>`)
    .join('');
  return `<section class="seo-resource" aria-labelledby="common-core-guide-heading">
<h2 id="common-core-guide-heading">How to use this Grade ${grade} arithmetic worksheet</h2>
<p><strong>${escapeText(h1)}</strong> gives students focused practice connected to Common Core ${escapeText(standard)}. ${escapeText(topic.concept)} The page opens with a fresh set of problems and includes an answer key generated from those exact numbers.</p>
<h3>Practice focus</h3>
<p>${escapeText(format.sentence)} ${escapeText(topic.strategy)} Ask the learner to explain one answer aloud and show a second method when possible. A short explanation makes place-value, fraction, or operation misunderstandings easier to notice.</p>
<h3>Print a worksheet and its matching answer key</h3>
<p>Select <strong>New numbers</strong> to create another set without changing the skill. Use the <strong>Worksheet</strong> and <strong>Answer key</strong> controls to preview either page. The print choices can include the worksheet, the answer key, or both. Both versions keep the same seed, numbers, and problem order. Printing is free and is designed for US Letter and A4 paper.</p>
<h3>A practical practice routine</h3>
<p>Begin without a timer and let the student mark any item that needs a model or written step. Review those items together, then print one new set for independent practice. Accuracy and a clear method matter more than speed. When the learner can solve the problems and explain the method consistently, continue to a related format or the next curriculum objective.</p>
<p>This worksheet practices one arithmetic objective; it is not a complete assessment of every skill in the standard. Teachers can use it for a warm-up, math center, homework check, or short intervention. Families can use one page at a time and keep the answer key separate for quick feedback.</p>
<h3>More ${escapeText(topic.short)} practice</h3>
<ul>${siblingLinks}</ul>
<p><a href="/en/us-arithmetic.html?grade=${grade}">Browse all United States Common Core arithmetic worksheets</a></p>
</section>`;
}

function pageJsonLd({ h1, metaDescription, canonical, grade, standard }) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE}/#website`,
        name: 'googoodan',
        alternateName: '구구단닷컴',
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
        learningResourceType: 'Worksheet',
        isAccessibleForFree: true,
        isPartOf: { '@id': `${SITE}/#website` }
      }
    ]
  }).replace(/</g, '\\u003c');
}

function transformTemplate(template, entry, siblings) {
  const { unit, profile, topic, file, h1 } = entry;
  const canonical = `${SITE}/en/print/common-core-arithmetic-upper/${file}`;
  const metaDescription = description(topic, profile, unit.grade, unit.standard);
  const documentTitle = entry.title;
  const init = `<script>(function(){window.GDCurriculumConfig={prefix:'us',title:${JSON.stringify(h1)},referenceLabel:'Common Core',source:'https://www.thecorestandards.org/Math/Content/'};const u=new URL(location.href);u.searchParams.set('unit',${JSON.stringify(unit.id)});u.searchParams.set('drill',${JSON.stringify(profile.id)});u.searchParams.set('type',${JSON.stringify(profile.id)});history.replaceState(null,'',u.pathname+'?'+u.searchParams.toString()+u.hash);})();</script>`;
  const alternates = `<link rel="alternate" hreflang="en" href="${canonical}"><link rel="alternate" hreflang="ko" href="${SITE}/ko/"><link rel="alternate" hreflang="ja" href="${SITE}/ja/"><link rel="alternate" hreflang="fr" href="${SITE}/fr/"><link rel="alternate" hreflang="de" href="${SITE}/de/"><link rel="alternate" hreflang="x-default" href="${SITE}/">`;
  const jsonLd = `<script type="application/ld+json">${pageJsonLd({ h1, metaDescription, canonical, grade: unit.grade, standard: unit.standard })}</script>`;
  const helper = helperSection({ h1, topic, profile, grade: unit.grade, standard: unit.standard, siblings, currentFile: file });

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
  const units = catalog.units.filter(unit => unit.grade >= 3 && unit.grade <= 6);
  const entries = [];

  for (const unit of units) {
    const topic = topics[unit.id];
    if (!topic) throw new Error(`Missing topic copy for ${unit.id}`);
    for (const profile of unit.drills) {
      const format = formatKey(profile);
      const file = `${unit.id.replace(/^us-/, 'grade-')}-${formatCopy[format].slug}.html`;
      entries.push({ unit, profile, topic, file, format, h1: heading(topic, profile, unit.grade), title: pageTitle(topic, profile, unit.grade) });
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
    grades: Object.fromEntries([3, 4, 5, 6].map(grade => [grade, entries.filter(entry => entry.unit.grade === grade).length])),
    formats: Object.fromEntries(Object.keys(formatCopy).map(format => [format, entries.filter(entry => entry.format === format).length])),
    pages: entries.map(entry => ({
      file: `en/print/common-core-arithmetic-upper/${entry.file}`,
      url: `${SITE}/en/print/common-core-arithmetic-upper/${entry.file}`,
      grade: entry.unit.grade,
      unit: entry.unit.id,
      standard: entry.unit.standard,
      profile: entry.profile.id,
      sourceProfile: entry.profile.generatorUnit || entry.profile.unit,
      format: entry.format,
      title: entry.title
    }))
  };
  fs.writeFileSync(path.join(outputDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  process.stdout.write(`Generated ${entries.length} Common Core arithmetic pages: ${Object.entries(manifest.grades).map(([grade, count]) => `Grade ${grade}: ${count}`).join(', ')}.\n`);
}

build();
