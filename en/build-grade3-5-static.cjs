const fs = require('node:fs');
const path = require('node:path');

const enDir = __dirname;
const outputDir = path.join(enDir, 'print', 'grade-skills');
const gradeMath = require(path.join(enDir, 'grade-math.js'));
const SITE = 'https://googoodan.com';
const VERSION = '20260913-grade3-5-static';

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

function ordinal(grade) {
  return grade === 3 ? '3rd' : grade === 4 ? '4th' : '5th';
}

const seoNames = {
  '3-mul': 'Multiplication Facts',
  '3-div': 'Division Facts',
  '3-fraction': 'Fractions of a Whole',
  '3-area': 'Area',
  '3-perimeter': 'Perimeter',
  '3-data': 'Scaled Bar Graphs',
  '3-groups': 'Equal Groups and Sharing',
  '3-unknown': 'Missing Factors and Quotients',
  '3-properties': 'Multiplication Properties and Strategies',
  '3-stories': 'Two-Step Word Problems',
  '3-patterns': 'Arithmetic Patterns',
  '3-round': 'Rounding to the Nearest 10 and 100',
  '3-calc1000': 'Addition and Subtraction Within 1,000',
  '3-tens-multiply': 'Multiplying by Multiples of 10',
  '3-fraction-line': 'Fractions on Number Lines',
  '3-fraction-compare': 'Comparing and Equivalent Fractions',
  '3-elapsed': 'Elapsed Time to the Minute',
  '3-mass': 'Mass and Liquid Volume',
  '3-lineplot': 'Fraction Line Plots',
  '3-area-tiles': 'Area With Square Tiles',
  '3-area-parts': 'Decomposing Rectangles to Find Area',
  '3-quadrilaterals': 'Classifying Quadrilaterals',
  '3-equal-area': 'Equal Parts and Fractions of Shapes',

  '4-mul': 'Multi-Digit Multiplication',
  '4-div': 'Division With Remainders',
  '4-equivalent': 'Equivalent Fractions',
  '4-fractionAdd': 'Adding Fractions With Like Denominators',
  '4-angle': 'Measuring Angles',
  '4-place': 'Place Value to 1,000,000',
  '4-times-as-many': 'Multiplicative Comparison',
  '4-stories': 'Multi-Step Word Problems',
  '4-factors': 'Factors, Multiples, and Prime Numbers',
  '4-patterns': 'Number Patterns and Rules',
  '4-ten-times': 'Place Value Times 10',
  '4-compare': 'Comparing Multi-Digit Numbers',
  '4-round': 'Rounding Multi-Digit Numbers',
  '4-large-calc': 'Multi-Digit Addition and Subtraction',
  '4-large-mul': 'Multi-Digit Multiplication Practice',
  '4-long-div': 'Long Division',
  '4-fraction-compare': 'Comparing Fractions With Unlike Denominators',
  '4-fraction-sub': 'Subtracting Fractions and Mixed Numbers',
  '4-fraction-whole': 'Multiplying Fractions by Whole Numbers',
  '4-tenths-hundredths': 'Tenths and Hundredths',
  '4-decimal-compare': 'Comparing Decimals',
  '4-convert': 'Measurement Conversions',
  '4-measure-stories': 'Measurement Word Problems',
  '4-area-perimeter': 'Area and Perimeter Formulas',
  '4-lineplot': 'Fraction Measurement Line Plots',
  '4-protractor': 'Measuring and Drawing Angles',
  '4-lines': 'Lines, Rays, and Angles',
  '4-shape-class': 'Classifying Triangles and Quadrilaterals',
  '4-symmetry': 'Lines of Symmetry',

  '5-decimal': 'Decimal Operations',
  '5-fractionAdd': 'Adding Fractions With Unlike Denominators',
  '5-fractionMul': 'Multiplying Fractions',
  '5-unitDiv': 'Dividing With Unit Fractions',
  '5-volume': 'Volume',
  '5-coordinate': 'Coordinate Plane',
  '5-expressions': 'Evaluating Numerical Expressions',
  '5-write-expressions': 'Writing Numerical Expressions',
  '5-paired-patterns': 'Numerical Patterns and Ordered Pairs',
  '5-place-ratio': 'Place Value Patterns',
  '5-powers10': 'Powers of 10',
  '5-decimal-place': 'Decimal Place Value and Expanded Form',
  '5-decimal-compare': 'Comparing Decimals to Thousandths',
  '5-round-decimal': 'Rounding Decimals',
  '5-whole-mul': 'Multi-Digit Multiplication',
  '5-whole-div': 'Long Division With Two-Digit Divisors',
  '5-decimal-mul': 'Multiplying Decimals',
  '5-decimal-div': 'Dividing Decimals',
  '5-fraction-sub': 'Subtracting Fractions and Mixed Numbers',
  '5-fraction-story': 'Fraction Word Problems and Estimation',
  '5-fraction-division': 'Fractions as Division',
  '5-fraction-area': 'Area With Fractional Side Lengths',
  '5-scaling': 'Fraction Multiplication as Scaling',
  '5-fraction-products': 'Fraction and Mixed Number Word Problems',
  '5-unit-sharing': 'Dividing Unit Fractions',
  '5-convert': 'Measurement Conversions',
  '5-lineplot': 'Fraction Line Plots',
  '5-volume-cubes': 'Volume With Unit Cubes',
  '5-volume-parts': 'Volume of Composite Rectangular Prisms',
  '5-plot-points': 'Plotting Points on the Coordinate Plane',
  '5-shape-properties': 'Properties of Two-Dimensional Shapes',
  '5-shape-hierarchy': 'Classifying Shapes in a Hierarchy'
};

const teachingFocus = {
  '3-mul': 'Build fact fluency by connecting equal groups, arrays, and products through 10 × 10.',
  '3-div': 'Connect each quotient to a known multiplication fact and check that equal groups use every object.',
  '3-fraction': 'Name the number of equal parts first, then count the selected parts to identify the fraction.',
  '3-area': 'Count square units and connect rows times columns to the area of a rectangle.',
  '3-perimeter': 'Trace the outside boundary and add every side length once.',
  '3-data': 'Use the graph scale before reading a bar, finding a total, or comparing categories.',
  '3-groups': 'Move between equal groups, arrays, multiplication, and fair-sharing division.',
  '3-unknown': 'Use the relationship between multiplication and division to find an unknown factor or quotient.',
  '3-properties': 'Break apart products with the distributive property and use commutative facts strategically.',
  '3-stories': 'Identify the two actions, write an equation for each step, and check whether the final answer fits the story.',
  '3-patterns': 'Describe how a sequence changes and use the rule to predict later terms.',
  '3-round': 'Locate a number between benchmark tens or hundreds before choosing the nearest endpoint.',
  '3-calc1000': 'Align hundreds, tens, and ones and explain any regrouping with place-value language.',
  '3-tens-multiply': 'Use a known one-digit fact and the value of a ten to multiply by 10, 20, 30, and other tens.',
  '3-fraction-line': 'Partition the interval from 0 to 1 into equal lengths and name a point by how many parts it is from zero.',
  '3-fraction-compare': 'Compare equal-size wholes with models, common denominators, or benchmark fractions.',
  '3-elapsed': 'Count forward in friendly jumps from the start time to the end time.',
  '3-mass': 'Choose grams, kilograms, milliliters, or liters and solve one-step measurement situations.',
  '3-lineplot': 'Read quarter-unit labels carefully and combine the measurements represented by the marks.',
  '3-area-tiles': 'Cover a rectangle with equal square units without gaps or overlaps.',
  '3-area-parts': 'Split a rectangle into smaller rectangles, find each area, and add the partial areas.',
  '3-quadrilaterals': 'Classify four-sided figures by parallel sides, equal sides, and right angles.',
  '3-equal-area': 'Verify that every part has equal area before naming the fractional part.',

  '4-mul': 'Use place value and partial products to multiply larger numbers accurately.',
  '4-div': 'Interpret the quotient and remainder and verify the result with multiplication and addition.',
  '4-equivalent': 'Multiply or divide the numerator and denominator by the same nonzero number.',
  '4-fractionAdd': 'Keep the common denominator and combine the numerators, then simplify when possible.',
  '4-angle': 'Relate an angle to a turn and use addition or subtraction to find an unknown measure.',
  '4-place': 'Read, write, compare, and explain the value of digits in numbers through one million.',
  '4-times-as-many': 'Translate “times as many” into multiplication and compare the two quantities.',
  '4-stories': 'Plan the order of operations, label intermediate results, and interpret remainders in context.',
  '4-factors': 'Use factor pairs to identify multiples, primes, and composites.',
  '4-patterns': 'Apply a stated rule and describe features that continue across the sequence.',
  '4-ten-times': 'Track how a digit’s value changes when its place shifts by one position.',
  '4-compare': 'Compare the highest place first and continue only when those digits are equal.',
  '4-round': 'Find the target place, inspect the digit to its right, and replace lower places with zeros.',
  '4-large-calc': 'Keep digits aligned by place and use estimation to judge whether the answer is reasonable.',
  '4-large-mul': 'Record partial products clearly and check the product with an estimate.',
  '4-long-div': 'Divide, multiply, subtract, and bring down in order; then check with multiplication.',
  '4-fraction-compare': 'Use benchmarks, common numerators, or common denominators to compare fractions.',
  '4-fraction-sub': 'Represent mixed numbers and regroup one whole when the fractional part is too small.',
  '4-fraction-whole': 'Think of repeated groups of the fraction and simplify the resulting product.',
  '4-tenths-hundredths': 'Connect tenths and hundredths fractions to decimal notation and grid models.',
  '4-decimal-compare': 'Compare tenths first and hundredths second, adding a trailing zero when it clarifies place value.',
  '4-convert': 'Use a conversion relationship within one measurement system and label the resulting unit.',
  '4-measure-stories': 'Choose the needed operation after identifying the quantity and unit asked for.',
  '4-area-perimeter': 'Distinguish the space inside a rectangle from the distance around it before selecting a formula.',
  '4-lineplot': 'Use the fractional scale consistently when counting and combining line-plot measurements.',
  '4-protractor': 'Place the center on the vertex, align the zero ray, and read the correct scale.',
  '4-lines': 'Identify endpoints and arrowheads, then distinguish parallel, perpendicular, and intersecting lines.',
  '4-shape-class': 'Use angle size, parallel lines, and side properties to justify each classification.',
  '4-symmetry': 'Fold or imagine folding a figure to test whether matching halves coincide.',

  '5-decimal': 'Align decimal points, preserve place value, and estimate before calculating.',
  '5-fractionAdd': 'Find a common denominator, rewrite equivalent fractions, and combine the numerators.',
  '5-fractionMul': 'Multiply numerators and denominators, then simplify and relate the result to a model.',
  '5-unitDiv': 'Interpret division involving unit fractions as sharing or finding how many groups fit.',
  '5-volume': 'Use cubic units and connect layers of cubes to length × width × height.',
  '5-coordinate': 'Read horizontal movement first and vertical movement second when naming ordered pairs.',
  '5-expressions': 'Use grouping symbols and the agreed order of operations to evaluate accurately.',
  '5-write-expressions': 'Translate verbal directions into one numerical expression without calculating it.',
  '5-paired-patterns': 'Generate two rules together and describe the relationship between corresponding terms.',
  '5-place-ratio': 'Explain why a digit is ten times the value to its right and one tenth the value to its left.',
  '5-powers10': 'Use exponents to count factors of ten and connect them to decimal-place shifts.',
  '5-decimal-place': 'Move among standard, word, fraction, and expanded forms through thousandths.',
  '5-decimal-compare': 'Compare whole-number parts, tenths, hundredths, and thousandths in order.',
  '5-round-decimal': 'Identify the target decimal place and use the digit immediately to its right.',
  '5-whole-mul': 'Organize partial products by place value and confirm the magnitude with estimation.',
  '5-whole-div': 'Estimate each quotient digit, subtract the partial product, and verify the final quotient.',
  '5-decimal-mul': 'Multiply as whole numbers, then place the decimal using the factors’ total decimal places.',
  '5-decimal-div': 'Use place-value reasoning to create an exact quotient and check by multiplication.',
  '5-fraction-sub': 'Rewrite unlike fractions with a common denominator and regroup mixed numbers when needed.',
  '5-fraction-story': 'Estimate first, represent the quantities, and decide whether addition or subtraction matches the context.',
  '5-fraction-division': 'Interpret a fraction as numerator divided by denominator in sharing situations.',
  '5-fraction-area': 'Multiply fractional side lengths and label the product in square units.',
  '5-scaling': 'Predict whether multiplying by a fraction makes a quantity smaller, equal, or larger.',
  '5-fraction-products': 'Model multiplication in fraction and mixed-number situations before calculating.',
  '5-unit-sharing': 'Use a diagram or equation to explain division of a unit fraction or by a unit fraction.',
  '5-convert': 'Choose a conversion factor within one system and explain why the number grows or shrinks.',
  '5-lineplot': 'Add and compare fractional measurements shown on an eighth-unit line plot.',
  '5-volume-cubes': 'Count cubes by layers and connect the structure to a volume expression.',
  '5-volume-parts': 'Find each rectangular prism’s volume and add only nonoverlapping parts.',
  '5-plot-points': 'Start at the origin, move along the x-axis, then move parallel to the y-axis.',
  '5-shape-properties': 'Use definitions to explain how one shape can belong to more than one category.',
  '5-shape-hierarchy': 'Organize categories from specific to broad and justify every inclusion relationship.'
};

function pageDescription(name, grade) {
  const first = `Free printable ${name.toLowerCase()} worksheets for ${ordinal(grade)} grade, with fresh questions, a matching answer key, and one-page Letter or A4 printing.`;
  if (first.length <= 160) return first;
  return `Free Grade ${grade} ${name.toLowerCase()} worksheets. Make fresh practice with a matching answer key, then print on Letter or A4 paper.`;
}

function pageTitle(name, grade) {
  const first = `${name} Worksheets – Grade ${grade} | Googoodan`;
  if (first.length <= 65) return first;
  return `${name} – Grade ${grade} | Googoodan`;
}

function learningNav() {
  return `<nav class="en-learning-nav" aria-label="Learning menus"><a href="/en/">Basic arithmetic</a><a href="/en/levels.html">Practice by level</a><fieldset class="en-region-picker"><legend>Country</legend><label for="learning-country">Country</label><select id="learning-country"><option value="US">United States</option><option value="GB">England</option><option value="CA">Canada</option><option value="AU">Australia</option></select><label id="learning-region-label" for="learning-region" hidden>Province or territory</label><select id="learning-region" hidden disabled><option value="">Choose a province or territory</option></select><p id="learning-region-status" role="status">Common Core-based math practice for the United States. The same worksheets are available nationwide.</p></fieldset><a id="curriculum-arithmetic-link" href="/en/us-arithmetic.html">Common Core arithmetic</a><a id="curriculum-topics-link" href="/en/grades.html">Common Core topics</a></nav>`;
}

function pageHtml(entry, links) {
  const { grade, unit, name, url, title, h1, description } = entry;
  const canonical = SITE + url;
  const theme = gradeMath.grades[grade];
  const standard = unit[2];
  const focus = teachingFocus[`${grade}-${unit[0]}`];
  if (!focus) throw new Error(`Missing teaching focus for Grade ${grade} ${unit[0]}`);
  const bootstrap = `(function(){var p=new URLSearchParams(location.search);if(!p.has('grade'))p.set('grade',${JSON.stringify(String(grade))});if(!p.has('unit'))p.set('unit',${JSON.stringify(unit[0])});history.replaceState(null,'',location.pathname+'?'+p.toString()+location.hash);addEventListener('DOMContentLoaded',function(){var keep=function(){var q=new URLSearchParams(location.search);if(q.get('grade')===${JSON.stringify(String(grade))}&&q.get('unit')===${JSON.stringify(unit[0])}&&document.title!==${JSON.stringify(title)})document.title=${JSON.stringify(title)};};keep();var titleNode=document.querySelector('title');if(titleNode)new MutationObserver(keep).observe(titleNode,{childList:true});var k=document.querySelector('#grade-links a[href="kindergarten.html"]');if(k)k.href='/en/kindergarten.html';});})();`;
  const resource = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: h1,
    description,
    url: canonical,
    inLanguage: 'en',
    educationalLevel: `Grade ${grade}`,
    learningResourceType: 'Printable worksheet',
    isAccessibleForFree: true,
    teaches: standard
  };
  const identity = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE}/#website`,
    name: 'googoodan',
    alternateName: '구구단닷컴',
    url: `${SITE}/`
  };
  const sidebar = `<span class="entry-theme" id="theme-name">${escapeText(theme.name)}</span><p id="theme-message">${escapeText(theme.motto)}</p><nav id="grade-links" aria-label="Choose a grade"><a href="/en/kindergarten.html">K</a><a href="/en/grades.html?grade=1">1</a><a href="/en/grades.html?grade=2">2</a><a href="/en/grades.html?grade=3"${grade === 3 ? ' aria-current="page"' : ''}>3</a><a href="/en/grades.html?grade=4"${grade === 4 ? ' aria-current="page"' : ''}>4</a><a href="/en/grades.html?grade=5"${grade === 5 ? ' aria-current="page"' : ''}>5</a></nav><label for="unit">Choose a skill</label><select id="unit"><option value="0">${escapeText(unit[1])}</option></select><div class="selector"><button id="previous" aria-label="Previous worksheet">←</button><div><strong id="variant">${escapeText(unit[1])}</strong><small id="position">Grade ${grade} worksheet</small></div><button id="next" aria-label="Next worksheet">→</button></div><p class="note">Three activities on every page.<br>Question count adjusts to fit one page.</p>`;
  const staticGuide = `<section class="grade-skill-resource" aria-labelledby="guide-heading"><h2 id="guide-heading">${escapeText(name)} practice for ${escapeText(ordinal(grade))} grade</h2><p>This free printable worksheet gives students focused practice with <strong>${escapeText(name.toLowerCase())}</strong>. It follows Common Core skill ${escapeText(standard)} and uses the existing Googoodan Grade ${grade} problem generator, so each new set stays on the same learning goal while the numbers, models, or situations change.</p><h3>What students work on</h3><p>${escapeText(focus)} The generated page moves through three short sections: Explore the idea, Build your skills, and Apply your thinking. Together they combine direct practice with a model, explanation, or short application instead of repeating one question format for the entire page.</p><h3>Teach, practice, and check</h3><p>Begin by reading the first direction and asking the student to name a useful strategy. Encourage a quick estimate, drawing, place-value model, equation, or labeled measurement when it fits the skill. After solving, have the learner explain one answer and use an inverse operation, benchmark, or model to check it.</p><p>Select <strong>New problems</strong> to create another version without changing the grade-level objective. The matching answer key is generated from the same set, so every number and question remains aligned. Choose the worksheet, answer key, or both before printing or saving a PDF. The practice is free for classroom, tutoring, or home use and is formatted as a one-page worksheet on both US Letter and A4 paper.</p><h3>Related free math worksheets</h3><nav aria-label="Related worksheets"><a href="${links.previous}">Previous Grade ${grade} skill</a><a href="/en/grade-${grade}.html">All ${escapeText(ordinal(grade))} grade worksheets</a><a href="${links.next}">Next Grade ${grade} skill</a><a href="/en/math-worksheets-for-kids.html">Math worksheets for kids</a></nav></section>`;
  return `<!doctype html><html lang="en"><head><meta name="google-adsense-account" content="ca-pub-7207988463177751"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeText(title)}</title><meta name="description" content="${escapeAttr(description)}"><meta name="robots" content="index,follow"><link rel="canonical" href="${canonical}"><link rel="alternate" hreflang="en" href="${canonical}"><link rel="alternate" hreflang="ko" href="${SITE}/ko/"><link rel="alternate" hreflang="ja" href="${SITE}/ja/"><link rel="alternate" hreflang="fr" href="${SITE}/fr/"><link rel="alternate" hreflang="de" href="${SITE}/de/"><link rel="alternate" hreflang="x-default" href="${SITE}/"><meta property="og:title" content="${escapeAttr(title)}"><meta property="og:description" content="${escapeAttr(description)}"><meta property="og:url" content="${canonical}"><meta property="og:type" content="website"><script type="application/ld+json">${JSON.stringify(resource)}</script><script id="website-identity" type="application/ld+json">${JSON.stringify(identity)}</script><link rel="stylesheet" href="/en/adventure.css?v=20260913-bank-answers"><link rel="stylesheet" href="/en/grades.css?v=sign-red-1"><link rel="stylesheet" href="/en/legal.css?v=20260910"><link rel="stylesheet" href="/brand.css?v=20260910-brand-name"><link rel="stylesheet" href="/ko/navigation.css?v=20260907-unified"><link rel="stylesheet" href="/en/site-help.css?v=20260908-help"><link rel="stylesheet" href="/ad-visibility.css?v=20260910-hide"><link rel="stylesheet" href="/answer-boxes.css?v=20260913-bank-answers"><script defer src="/answer-boxes.js?v=20260913-bank-answers"></script><style>.entry-title{font-size:27px}.entry-summary{font-size:13px}.entry-theme{display:block;margin:14px 0 4px;font-size:14px}.grade-skill-resource{max-width:1080px;margin:0 auto 35px;padding:24px;background:#fff;border:1px solid #dce7e9;border-radius:12px;line-height:1.7}.grade-skill-resource h2,.grade-skill-resource h3{color:#164f5b}.grade-skill-resource nav{display:flex;flex-wrap:wrap;gap:12px}.grade-skill-resource nav a{padding:8px 11px;border:1px solid #bdd5d7;border-radius:8px;text-decoration:none}@media(max-width:850px){aside .entry-title,aside .entry-summary{display:block}.grade-skill-resource{margin:0 15px 25px;padding:18px}}@media print{.grade-skill-resource{display:none!important}}</style><script>${bootstrap}</script><script defer src="/analytics-config.js?v=20260910"></script><script defer src="/analytics.js?v=20260910"></script><script defer src="/en/grade-math.js?v=20260913-bank-answers"></script><script defer src="/en/grade-extension.js?v=20260913-distinct-factors"></script><script defer src="/en/print-fit.js?v=20260910"></script><script defer src="/en/regional-english.js?v=20260913-maths-switch"></script><script defer src="/en/grades.js?v=20260913-regional-spelling"></script><script defer src="/brand.js?v=20260910-brand-name"></script><script defer src="/pdf-export.js?v=20260908-help"></script><script defer src="/worksheet-navigation.js?v=20260913-all-sites"></script><script defer src="/en/learning-navigation.js?v=20260913-canada-regions-only"></script><script defer src="/en/site-help.js?v=20260908-help"></script><script defer src="/output-selection.js?v=20260912-print-preview-sync"></script><script defer src="/visit-counter.js?v=20260913-country-visits"></script><script defer src="/worksheet-stats.js?v=20260913-country-counts"></script></head><body data-static-grade="${grade}" data-static-unit="${escapeAttr(unit[0])}"><header><a href="/en/" class="brand">googoodan<span>●</span></a><span>Free printable math practice.</span><a href="/en/worksheets.html">All worksheets ↗</a></header><div class="ad ad-top" aria-label="Top advertising space"><b>ADVERTISEMENT</b><strong>Google AdSense · Top banner</strong><small>Reserved advertising space</small></div><main><aside>${learningNav()}<small class="eyebrow">FREE PRINTABLE · MATCHING ANSWER KEY</small><h1 class="entry-title">${escapeText(h1)}</h1><p class="entry-summary">${escapeText(description)}</p><a class="arithmetic-back" href="/en/"><span aria-hidden="true">＋ − × ÷</span> Arithmetic worksheets <span aria-hidden="true">→</span></a>${sidebar}</aside><section><nav class="tools" aria-label="Worksheet controls"><div><button id="worksheet" aria-pressed="true">Worksheet</button><button id="answer" aria-pressed="false">Answer key</button></div><div><button id="new">↻ New problems</button><button id="print">Print ↗</button></div></nav><article class="sheet" id="sheet"></article><details class="mobile-print-help"><summary>Printing from a phone?</summary><p>iPhone / iPad: Safari → Share → Print. Use an AirPrint printer on the same Wi-Fi network.</p><p>Android: Chrome → More (⋮) → Share → Print. Select a printer or Save as PDF if available.</p></details><p class="footnote" id="fit-note"></p><p class="footnote">Print on US Letter or A4 paper. Choose the worksheet, answer key, or both.</p><div class="ad bottom" aria-label="Below worksheet advertising space"><b>ADVERTISEMENT</b><strong>Google AdSense · Below worksheet</strong><small>Reserved advertising space</small></div><div id="status" role="status" class="sr"></div></section></main>${staticGuide}<footer class="legal-footer" aria-label="Site information"><a href="/en/about.html">About</a><a href="/en/contact.html">Contact</a><a href="/en/privacy.html">Privacy</a><a href="/en/terms.html">Terms</a><span>© Googoodan</span></footer><nav class="en-help-footer" aria-label="Help and site information"><a href="/en/help.html">How to use</a><a href="/en/contact.html">Contact / report an issue</a><a href="/en/about.html">About</a><a href="/en/terms.html">Terms of use</a><a href="/en/privacy.html">Privacy</a><a href="/en/updates.html">Updates</a></nav><noscript>This page needs JavaScript to make a new worksheet. The title, teaching guide, and related worksheet links remain available without JavaScript.</noscript></body></html>\n`;
}

fs.mkdirSync(outputDir, { recursive: true });

const entries = [3, 4, 5].flatMap(grade => gradeMath.grades[grade].units.map(unit => {
  const key = `${grade}-${unit[0]}`;
  const name = seoNames[key];
  if (!name) throw new Error(`Missing SEO name for ${key}`);
  const filename = `grade-${grade}-${slug(name)}-worksheet.html`;
  const url = `/en/print/grade-skills/${filename}`;
  const h1 = `${name} Worksheets for ${ordinal(grade)} Grade`;
  const title = key === '4-fraction-compare' ? 'Comparing Unlike Fractions Worksheets – Grade 4 | Googoodan' : pageTitle(name, grade);
  const description = pageDescription(name, grade);
  return { grade, unit, name, filename, url, h1, title, description };
}));

const expected = { 3: 23, 4: 29, 5: 32 };
for (const grade of [3, 4, 5]) {
  const count = entries.filter(entry => entry.grade === grade).length;
  if (count !== expected[grade]) throw new Error(`Expected ${expected[grade]} Grade ${grade} profiles, got ${count}`);
}
if (entries.length !== 84) throw new Error(`Expected 84 pages, got ${entries.length}`);

const seenUrls = new Set();
const seenTitles = new Set();
for (let index = 0; index < entries.length; index++) {
  const entry = entries[index];
  if (seenUrls.has(entry.url)) throw new Error(`Duplicate URL: ${entry.url}`);
  if (seenTitles.has(entry.title)) throw new Error(`Duplicate title: ${entry.title}`);
  seenUrls.add(entry.url);
  seenTitles.add(entry.title);
  const previous = entries[(index - 1 + entries.length) % entries.length].url;
  const next = entries[(index + 1) % entries.length].url;
  fs.writeFileSync(path.join(outputDir, entry.filename), pageHtml(entry, { previous, next }), 'utf8');
}

const manifest = {
  generator: '/en/build-grade3-5-static.cjs',
  version: VERSION,
  counts: { grade3: expected[3], grade4: expected[4], grade5: expected[5], total: entries.length },
  pages: entries.map(entry => ({
    url: entry.url,
    file: `/en/print/grade-skills/${entry.filename}`,
    grade: entry.grade,
    unit: entry.unit[0],
    sourceTitle: entry.unit[1],
    standard: entry.unit[2],
    title: entry.title,
    h1: entry.h1,
    description: entry.description
  }))
};
fs.writeFileSync(path.join(enDir, 'grade3-5-static-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(`Generated ${entries.length} pages: Grade 3 ${expected[3]}, Grade 4 ${expected[4]}, Grade 5 ${expected[5]}.`);
