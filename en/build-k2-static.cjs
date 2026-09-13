const fs = require('node:fs');
const path = require('node:path');

const enDir = __dirname;
const printDir = path.join(enDir, 'print');
const kindergarten = require(path.join(enDir, 'k-catalog.js'));
const gradeMath = require(path.join(enDir, 'grade-math.js'));

const SITE = 'https://googoodan.com';
const VERSION = '20260913-k2-static';

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
  return grade === 1 ? '1st' : '2nd';
}

const kindergartenTitleCounts = new Map();
for (const unit of kindergarten) for (const profile of unit.items) kindergartenTitleCounts.set(profile.title, (kindergartenTitleCounts.get(profile.title) || 0) + 1);

function titleCase(value) {
  const minor = new Set(['a', 'an', 'and', 'as', 'at', 'by', 'for', 'from', 'in', 'of', 'on', 'or', 'the', 'to', 'with']);
  const words = String(value).split(/\s+/);
  return words.map((word, index) => word.split('-').map((part, partIndex) => {
    const lower = part.toLowerCase();
    if (index > 0 && index < words.length - 1 && partIndex === 0 && minor.has(lower)) return lower;
    return lower ? lower[0].toUpperCase() + lower.slice(1) : lower;
  }).join('-')).join(' ');
}

const kindergartenSeoNames = {
  'add-2': 'Addition Sentences to 5', 'add-4': 'Addition Sentences to 10',
  'sub-2': 'Subtraction Sentences to 5', 'sub-4': 'Subtraction Sentences to 10',
  'sub-5': 'Subtraction Stories to 10'
};

const gradeSeoNames = {
  '1-add': 'Addition Within 20', '1-sub': 'Subtraction Within 20', '1-place': 'Tens and Ones',
  '1-shape': 'Shape Attributes', '1-clock': 'Hour and Half-Hour Time', '1-data': 'Picture Graphs',
  '1-missing': 'Missing Numbers', '1-three': 'Adding Three Numbers', '1-facts': 'Fact Families',
  '1-count-on': 'Counting On and Back', '1-equal': 'True or False Equations', '1-count120': 'Number Paths to 120',
  '1-compare': 'Comparing Two-Digit Numbers', '1-add100': 'Adding With Tens and Ones',
  '1-ten-more': 'Ten More and Ten Less', '1-tens-sub': 'Subtracting Multiples of Ten',
  '1-order-length': 'Compare and Order Lengths', '1-unit-length': 'Measuring With Equal Units',
  '1-shape-build': 'Building and Drawing Shapes', '1-halves': 'Halves and Fourths',
  '2-add': 'Addition Within 100', '2-sub': 'Subtraction Within 100', '2-place': 'Hundreds, Tens, and Ones',
  '2-money': 'Counting US Coins', '2-clock': 'Telling Time to Five Minutes', '2-length': 'Measure and Compare Lengths',
  '2-stories': 'Two-Step Word Problems', '2-facts20': 'Math Facts Within 20', '2-odd-even': 'Odd and Even Numbers',
  '2-arrays': 'Rows and Columns', '2-skip': 'Skip Counting to 1,000', '2-number-names': 'Number Names & Expanded Form',
  '2-compare': 'Compare Three-Digit Numbers', '2-four-add': 'Adding Four Numbers',
  '2-calc1000': 'Add & Subtract Within 1,000', '2-mental': 'Ten or One Hundred More',
  '2-measure-tools': 'Choosing Measuring Tools', '2-measure-units': 'Measuring in Two Units',
  '2-estimate-length': 'Estimating Length', '2-length-story': 'Length Word Problems',
  '2-numberline': 'Numbers on a Number Line', '2-lineplot': 'Measurement Line Plots',
  '2-graphs': 'Reading and Making Graphs', '2-shape': 'Shape Attributes',
  '2-tile': 'Tiling Rectangles', '2-partition': 'Halves, Thirds, and Fourths'
};

const actionLabels = {
  trace: 'trace and write numerals', count: 'count a picture group', draw: 'draw a matching quantity',
  match: 'match a number and a quantity', select: 'choose the matching quantity', scatter: 'count scattered pictures',
  rearrange: 'recognize a quantity in a new arrangement', next: 'write the next number', path: 'complete a number path',
  continue: 'continue a counting sequence', tens: 'count by tens', path10: 'complete a tens path', next10: 'write the next multiple of ten',
  more: 'find the group with more', less: 'find the group with fewer', equal: 'compare equal groups', larger: 'choose the larger number',
  smaller: 'choose the smaller number', sameNumber: 'recognize equal written numbers', pairCompare: 'match and compare two groups',
  join: 'join two small groups', part: 'find a missing part', split: 'break a whole into two parts', bond: 'complete a number bond',
  twoWays: 'show two ways to make a number', partStory: 'solve a parts-and-whole story', addPicture: 'add two picture groups',
  addChoice: 'choose an addition answer', addDraw: 'draw to show addition', addEquation: 'complete an addition sentence',
  addMatch: 'match an addition sentence and answer', addFrame: 'add with a ten-frame', addStory: 'solve a little addition story',
  joinStory: 'act out a joining story', subPicture: 'cross out pictures and subtract', subChoice: 'choose a subtraction answer',
  subDraw: 'draw to show subtraction', subEquation: 'complete a subtraction sentence', subMatch: 'match a subtraction sentence and answer',
  subStory: 'solve a little subtraction story', hideStory: 'act out a take-away story', tenFrame: 'complete a ten-frame',
  tenDraw: 'draw the missing dots to make 10', tenChoice: 'choose a partner that makes 10', tenEquation: 'complete a make-10 equation',
  tenStory: 'solve a make-10 story', teenCount: 'count ten and some more', teenEquation: 'break apart a teen number',
  teenMatch: 'match a teen number and its parts', teenDraw: 'draw a teen number', teenPart: 'show tens and ones',
  teenStory: 'solve a teen-number story', longer: 'choose the longer object', shorter: 'choose the shorter object',
  lengthStory: 'compare lengths in a story', taller: 'choose the taller object', lower: 'choose the shorter height',
  heightStory: 'compare heights in a story', heavier: 'choose the heavier object', lighter: 'choose the lighter object',
  weightStory: 'compare weights in a story', sortShape: 'sort objects by shape', countShape: 'count one shape category',
  mostShape: 'find the shape category with the most', sortColor: 'sort objects by color', countColor: 'count one color category',
  leastColor: 'find the color category with the fewest', sortSize: 'sort objects by size', countSize: 'count one size category',
  mostSize: 'find the size category with the most', shapeName: 'name a flat shape', shapeFind: 'find a named shape',
  shapeDraw: 'draw a shape', rotated: 'recognize a turned shape', shapeCorners: 'count corners', shapeSides: 'count sides',
  solidName: 'name a solid shape', flatSolid: 'sort flat and solid shapes', solidMatch: 'match a solid shape to an object',
  position: 'describe a shape position', positionDraw: 'draw an object in a given position', positionChoice: 'choose the described position',
  shapeCompare: 'compare shape attributes', compose: 'compose a larger shape', build: 'build and sketch with shapes'
};

const gradeGuides = {
  '1-add': 'Use counters or a quick drawing when a fact is new. Encourage counting on from the larger addend, then check that the sum stays within 20.',
  '1-sub': 'Let the learner cross out, count back, or think of a related addition fact. Ask what changed and what stayed the same.',
  '1-place': 'Read each two-digit number as tens and ones. Bundled sticks, connecting cubes, or drawn groups of ten make the place values visible.',
  '1-shape': 'Ask the learner to name visible attributes such as straight sides and corners. Turning a shape does not change its name.',
  '1-clock': 'Read the short hour hand first, then the minute hand. Connect :00 with an hour and :30 with half past the hour.',
  '1-data': 'Count each picture or block once. Compare categories by matching rows before finding how many more or fewer.',
  '1-missing': 'Name the unknown part before calculating. A related addition or subtraction fact can be used to check the missing number.',
  '1-three': 'Look for two addends that make 10, then add the remaining number. A drawing can show why changing the grouping keeps the total.',
  '1-facts': 'Read the four related facts aloud and notice that the same three numbers are reused. Cover one fact and rebuild it from the others.',
  '1-count-on': 'Start on the given number and move one space for each count. Point to each jump so the start is not counted as the first move.',
  '1-equal': 'Evaluate both sides of the equal sign. Explain that the sign means the two expressions have the same value.',
  '1-count120': 'Say the sequence aloud while writing. Pause at decade changes such as 39 to 40 and use a number chart when needed.',
  '1-compare': 'Compare tens first and ones second. Have the learner read the completed comparison as a full sentence.',
  '1-add100': 'Group tens with tens and ones with ones. Draw quick tens sticks and dots before using a written strategy.',
  '1-ten-more': 'Changing a number by ten changes the tens digit while the ones digit stays the same. Use a 120 chart to see the vertical pattern.',
  '1-tens-sub': 'Count backward by tens and track only the tens digit. Check the result by adding the subtracted tens back.',
  '1-order-length': 'Line up one end before comparing objects. Use shorter than, longer than, and equal in complete comparison sentences.',
  '1-unit-length': 'Place equal-size units end to end with no gaps or overlaps. Count units rather than the marks between them.',
  '1-shape-build': 'Combine familiar shapes, then describe which pieces were used. More than one correct drawing may be possible.',
  '1-halves': 'Check that every part has equal area. The number of equal parts determines whether they are halves or fourths.',
  '2-add': 'Estimate the size of the answer, add ones and tens, then check with the inverse operation. Use a place-value drawing when regrouping is needed.',
  '2-sub': 'Represent hundreds, tens, and ones before subtracting. Regroup one ten as ten ones when there are not enough ones.',
  '2-place': 'Read three-digit numbers in standard, word, and expanded form. Point out the value of each digit rather than only its name.',
  '2-money': 'Name each US coin and its value before counting. Begin with the greatest-value coins and write the total with the cent sign.',
  '2-clock': 'Count minute marks by fives from the 12. Check where the hour hand sits when the minute hand moves around the clock.',
  '2-length': 'Choose one unit and measure from zero. Compare lengths by subtraction and always include the unit in the answer.',
  '2-stories': 'Underline the question and identify each action in order. Draw a bar or write one equation for each step before calculating.',
  '2-facts20': 'Use make-10, doubles, and related facts instead of counting every object. Explain which fact strategy made the answer quick.',
  '2-odd-even': 'Pair every object. A number is even when no object is left without a partner and odd when one is left over.',
  '2-arrays': 'Describe an array with equal rows and equal columns. Repeated addition shows the total without introducing a rule too early.',
  '2-skip': 'Track place-value patterns while skip-counting by 5s, 10s, or 100s. Say the sequence aloud before filling blanks.',
  '2-number-names': 'Connect standard form, number words, and expanded form. Check that each written part matches its place value.',
  '2-compare': 'Compare hundreds first, then tens, then ones. Read < and > from left to right after placing the symbol.',
  '2-four-add': 'Make friendly pairs such as 10 or 100 before adding all four numbers. Reorder addends to simplify the work.',
  '2-calc1000': 'Use place-value drawings and written strategies within 1,000. Estimate first so an unreasonable answer is easy to spot.',
  '2-mental': 'Use the place-value pattern for ten more, ten less, one hundred more, or one hundred less without recomputing the whole number.',
  '2-measure-tools': 'Choose a ruler, yardstick, measuring tape, scale, or measuring cup to fit the object and attribute being measured.',
  '2-measure-units': 'Measure the same length with two unit sizes. Explain why a smaller unit produces a larger numerical measurement.',
  '2-estimate-length': 'Make a reasonable estimate, measure, and compare the two values. The goal is a sensible benchmark rather than an exact guess.',
  '2-length-story': 'Draw a length diagram with the known and unknown parts. Label every length with the same unit before solving.',
  '2-numberline': 'Locate the start, determine the value of each interval, and move the correct number of equal spaces along the line.',
  '2-lineplot': 'Read the label and scale before counting marks. Combine or compare the measurements only after recording each frequency.',
  '2-graphs': 'Read the graph title, labels, and key. Answer one-category questions before comparing or combining categories.',
  '2-shape': 'Classify shapes by sides, corners, and faces. A shape can belong to more than one group when it has several attributes.',
  '2-tile': 'Cover a rectangle with equal square tiles without gaps or overlaps. Connect rows and columns to repeated addition.',
  '2-partition': 'Divide a rectangle or circle into equal shares and name one share. Equal shares may have different shapes but must have equal area.'
};

function head({ title, description, canonical, h1, level, standard, entry }) {
  const resource = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: h1,
    description,
    url: canonical,
    inLanguage: 'en',
    educationalLevel: level,
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
  const exactEntry = entry.kind === 'kindergarten'
    ? `q.get('unit')===${JSON.stringify(entry.unit)}&&q.get('sheet')===${JSON.stringify(entry.sheet)}`
    : `q.get('grade')===${JSON.stringify(String(entry.grade))}&&q.get('unit')===${JSON.stringify(entry.unit)}`;
  const bootstrap = `(function(){var p=new URLSearchParams(location.search);${entry.kind === 'kindergarten' ? `if(!p.has('unit'))p.set('unit',${JSON.stringify(entry.unit)});if(!p.has('sheet'))p.set('sheet',${JSON.stringify(entry.sheet)});` : `if(!p.has('grade'))p.set('grade',${JSON.stringify(String(entry.grade))});if(!p.has('unit'))p.set('unit',${JSON.stringify(entry.unit)});`}history.replaceState(null,'',location.pathname+'?'+p.toString()+location.hash);addEventListener('DOMContentLoaded',function(){var keep=function(){var q=new URLSearchParams(location.search);if(${exactEntry}&&document.title!==${JSON.stringify(title)})document.title=${JSON.stringify(title)};};keep();var titleNode=document.querySelector('title');if(titleNode)new MutationObserver(keep).observe(titleNode,{childList:true});var k=document.querySelector('#grade-links a[href="kindergarten.html"]');if(k)k.href='/en/kindergarten.html';});})();`;
  const engineScripts = entry.kind === 'kindergarten'
    ? `<script defer src="/en/k-catalog.js?v=20260910"></script><script defer src="/en/k-engine.js?v=20260910"></script><script defer src="/en/print-fit.js?v=20260910"></script><script defer src="/en/adventure.js?v=20260910"></script>`
    : `<script defer src="/en/grade-math.js?v=20260913-bank-answers"></script><script defer src="/en/grade-extension.js?v=20260913-distinct-factors"></script><script defer src="/en/print-fit.js?v=20260910"></script><script defer src="/en/regional-english.js?v=20260913-maths-switch"></script><script defer src="/en/grades.js?v=20260913-regional-spelling"></script>`;
  return `<!doctype html><html lang="en"><head><meta name="google-adsense-account" content="ca-pub-7207988463177751"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeText(title)}</title><meta name="description" content="${escapeAttr(description)}"><meta name="robots" content="index,follow"><link rel="canonical" href="${canonical}"><link rel="alternate" hreflang="en" href="${canonical}"><link rel="alternate" hreflang="ko" href="${SITE}/ko/"><link rel="alternate" hreflang="ja" href="${SITE}/ja/"><link rel="alternate" hreflang="fr" href="${SITE}/fr/"><link rel="alternate" hreflang="de" href="${SITE}/de/"><link rel="alternate" hreflang="x-default" href="${SITE}/"><meta property="og:title" content="${escapeAttr(title)}"><meta property="og:description" content="${escapeAttr(description)}"><meta property="og:url" content="${canonical}"><meta property="og:type" content="website"><script type="application/ld+json">${JSON.stringify(resource)}</script><script id="website-identity" type="application/ld+json">${JSON.stringify(identity)}</script><link rel="stylesheet" href="/en/adventure.css?v=20260913-bank-answers"><link rel="stylesheet" href="/en/grades.css?v=sign-red-1"><link rel="stylesheet" href="/en/legal.css?v=20260910"><link rel="stylesheet" href="/brand.css?v=20260910-brand-name"><link rel="stylesheet" href="/ko/navigation.css?v=20260907-unified"><link rel="stylesheet" href="/en/site-help.css?v=20260908-help"><link rel="stylesheet" href="/ad-visibility.css?v=20260910-hide"><link rel="stylesheet" href="/answer-boxes.css?v=20260913-bank-answers"><script defer src="/answer-boxes.js?v=20260913-bank-answers"></script><style>.entry-title{font-size:27px}.entry-summary{font-size:13px}.entry-theme{display:block;margin:14px 0 4px;font-size:14px}.k2-resource{max-width:1080px;margin:0 auto 35px;padding:24px;background:#fff;border:1px solid #dce7e9;border-radius:12px;line-height:1.7}.k2-resource h2,.k2-resource h3{color:#164f5b}.k2-resource nav{display:flex;flex-wrap:wrap;gap:12px}.k2-resource nav a{padding:8px 11px;border:1px solid #bdd5d7;border-radius:8px;text-decoration:none}@media(max-width:850px){aside .entry-title,aside .entry-summary{display:block}.k2-resource{margin:0 15px 25px;padding:18px}}@media print{.k2-resource{display:none!important}}</style><script>${bootstrap}</script><script defer src="/analytics-config.js?v=20260910"></script><script defer src="/analytics.js?v=20260910"></script>${engineScripts}<script defer src="/brand.js?v=20260910-brand-name"></script><script defer src="/pdf-export.js?v=20260908-help"></script><script defer src="/worksheet-navigation.js?v=20260913-all-sites"></script><script defer src="/en/learning-navigation.js?v=20260913-canada-regions-only"></script><script defer src="/en/site-help.js?v=20260908-help"></script><script defer src="/output-selection.js?v=20260912-print-preview-sync"></script><script defer src="/visit-counter.js?v=20260913-country-visits"></script><script defer src="/worksheet-stats.js?v=20260913-country-counts"></script></head>`;
}

function learningNav() {
  return `<nav class="en-learning-nav" aria-label="Learning menus"><a href="/en/">Basic arithmetic</a><a href="/en/levels.html">Practice by level</a><fieldset class="en-region-picker"><legend>Country</legend><label for="learning-country">Country</label><select id="learning-country"><option value="US">United States</option><option value="GB">England</option><option value="CA">Canada</option><option value="AU">Australia</option></select><label id="learning-region-label" for="learning-region" hidden>Province or territory</label><select id="learning-region" hidden disabled><option value="">Choose a province or territory</option></select><p id="learning-region-status" role="status">Common Core-based math practice for the United States. The same worksheets are available nationwide.</p></fieldset><a id="curriculum-arithmetic-link" href="/en/us-arithmetic.html">Common Core arithmetic</a><a id="curriculum-topics-link" href="/en/grades.html">Common Core topics</a></nav>`;
}

function commonShell({ title, description, canonical, h1, entry, sidebar, resource }) {
  return `${head({ title, description, canonical, h1, level: entry.level, standard: entry.standard, entry })}<body><header><a href="/en/" class="brand">googoodan<span>●</span></a><span>Free printable math practice.</span><a href="/en/worksheets.html">All worksheets ↗</a></header><div class="ad ad-top" aria-label="Top advertising space"><b>ADVERTISEMENT</b><strong>Google AdSense · Top banner</strong><small>Reserved advertising space</small></div><main><aside>${learningNav()}<small class="eyebrow">FREE PRINTABLE · MATCHING ANSWER KEY</small><h1 class="entry-title">${escapeText(h1)}</h1><p class="entry-summary">${escapeText(description)}</p><a class="arithmetic-back" href="/en/"><span aria-hidden="true">＋ − × ÷</span> Arithmetic worksheets <span aria-hidden="true">→</span></a>${sidebar}</aside><section><nav class="tools" aria-label="Worksheet controls"><div><button id="worksheet" aria-pressed="true">Worksheet</button><button id="answer" aria-pressed="false">Answer key</button></div><div><button id="new">↻ New problems</button><button id="print">Print ↗</button></div></nav><article class="sheet" id="sheet"></article><details class="mobile-print-help"><summary>Printing from a phone?</summary><p>iPhone / iPad: Safari → Share → Print. Use an AirPrint printer on the same Wi-Fi network.</p><p>Android: Chrome → More (⋮) → Share → Print. Select a printer or Save as PDF if available.</p></details><p class="footnote" id="fit-note"></p><p class="footnote">Print on US Letter or A4 paper. Choose the worksheet, answer key, or both.</p><div class="ad bottom" aria-label="Below worksheet advertising space"><b>ADVERTISEMENT</b><strong>Google AdSense · Below worksheet</strong><small>Reserved advertising space</small></div><div id="status" role="status" class="sr"></div></section></main>${resource}<footer class="legal-footer" aria-label="Site information"><a href="/en/about.html">About</a><a href="/en/contact.html">Contact</a><a href="/en/privacy.html">Privacy</a><a href="/en/terms.html">Terms</a><span>© Googoodan</span></footer><nav class="en-help-footer" aria-label="Help and site information"><a href="/en/help.html">How to use</a><a href="/en/contact.html">Contact / report an issue</a><a href="/en/about.html">About</a><a href="/en/terms.html">Terms of use</a><a href="/en/privacy.html">Privacy</a><a href="/en/updates.html">Updates</a></nav><noscript>This page needs JavaScript to make a new worksheet. The title, teaching guide, and related worksheet links remain available without JavaScript.</noscript></body></html>\n`;
}

function kindergartenPage(item, allEntries, index) {
  const { unit, profile } = item;
  const repeatedTitle = kindergartenTitleCounts.get(profile.title) > 1;
  const baseTitle = titleCase(profile.title);
  const displayTitle = kindergartenSeoNames[profile.id] || (repeatedTitle ? `${titleCase(unit.title)} ${baseTitle}` : baseTitle);
  const filename = `k-${repeatedTitle ? `${unit.id}-` : ''}${slug(profile.title)}.html`;
  const urlPath = `/en/print/${filename}`;
  const canonical = SITE + urlPath;
  const h1 = `${displayTitle} Worksheets for Kindergarten`;
  const title = `${displayTitle} Kindergarten Worksheets | Googoodan`;
  const description = `Free printable ${displayTitle.toLowerCase()} worksheets for kindergarten. Generate three hands-on activities and a matching answer key for home or school.`;
  const activities = profile.modes.map(mode => actionLabels[mode] || mode).map(label => `<li>${escapeText(label[0].toUpperCase() + label.slice(1))}</li>`).join('');
  const previous = allEntries[(index - 1 + allEntries.length) % allEntries.length];
  const next = allEntries[(index + 1) % allEntries.length];
  const resource = `<section class="k2-resource" aria-labelledby="guide-heading"><h2 id="guide-heading">What children practice on this worksheet</h2><p><strong>${escapeText(displayTitle)}</strong> gives kindergarten learners a focused way to explore ${escapeText(unit.title.toLowerCase())}. The activities support ${escapeText(unit.code)} and use small steps, pictures, drawing, or simple number models suited to an early learner.</p><p>Each generated sheet has three short sections: Explore and discover, Think and try, and Show what you know. This profile includes:</p><ul>${activities}</ul><h3>Use the printable in a short lesson</h3><p>Read each direction aloud and let the child point, move counters, draw, or explain before writing. Complete one section at a time. Use <strong>New problems</strong> for another set with the same learning goal. Open the matching answer key to check fixed answers; drawing and open-response tasks include a sample or a clear checking note.</p><p>This worksheet is free to print for home or classroom use and is formatted for both US Letter and A4 paper. Select the worksheet, the answer key, or both before printing or saving a PDF.</p><h3>Related free worksheets</h3><nav aria-label="Related worksheets"><a href="${previous.urlPath}">Previous kindergarten worksheet</a><a href="/en/kindergarten.html?unit=${encodeURIComponent(unit.id)}&amp;sheet=${encodeURIComponent(profile.id)}">Browse ${escapeText(unit.title)}</a><a href="${next.urlPath}">Next kindergarten worksheet</a><a href="/en/grade-1.html">1st grade math worksheets</a></nav></section>`;
  const sidebar = `<nav id="grade-links" aria-label="Choose a grade"><a href="/en/kindergarten.html" aria-current="page">K</a><a href="/en/grades.html?grade=1">1</a><a href="/en/grades.html?grade=2">2</a><a href="/en/grades.html?grade=3">3</a><a href="/en/grades.html?grade=4">4</a><a href="/en/grades.html?grade=5">5</a></nav><label for="unit">Kindergarten · Choose a skill</label><select id="unit"><option value="${escapeAttr(unit.id)}">${escapeText(unit.title)}</option></select><div class="selector"><button id="previous" aria-label="Previous worksheet">←</button><div><strong id="variant">${escapeText(profile.title)}</strong><small id="position">Kindergarten worksheet</small></div><button id="next" aria-label="Next worksheet">→</button></div><p class="note">Three activities on every page.<br>Pick a skill or browse with the arrows.</p>`;
  return {
    filename,
    urlPath,
    html: commonShell({ title, description, canonical, h1, entry: { kind: 'kindergarten', unit: unit.id, sheet: profile.id, level: 'Kindergarten', standard: unit.code }, sidebar, resource }),
    manifest: { url: urlPath, kind: 'kindergarten', unit: unit.id, profile: profile.id, title, h1, description, standard: unit.code }
  };
}

function gradePage(item, allEntries, index) {
  const { grade, unit } = item;
  const seoName = gradeSeoNames[`${grade}-${unit[0]}`] || titleCase(unit[1]);
  const filename = `grade-${grade}-${slug(seoName)}-worksheet.html`;
  const urlPath = `/en/print/${filename}`;
  const canonical = SITE + urlPath;
  const gradeLabel = ordinal(grade);
  const h1 = `${seoName} Worksheets for ${gradeLabel} Grade`;
  const title = `${seoName} ${gradeLabel} Grade Worksheets | Googoodan`;
  const description = `Free printable ${seoName.toLowerCase()} worksheets for ${gradeLabel} grade. Generate new practice with a matching answer key for home or classroom use.`;
  const previous = allEntries[(index - 1 + allEntries.length) % allEntries.length];
  const next = allEntries[(index + 1) % allEntries.length];
  const guide = gradeGuides[`${grade}-${unit[0]}`] || `Work through ${unit[1].toLowerCase()} with a drawing, model, or equation. Ask the learner to explain one strategy and check the result.`;
  const resource = `<section class="k2-resource" aria-labelledby="guide-heading"><h2 id="guide-heading">${escapeText(seoName)}: focused ${escapeText(gradeLabel)} grade practice</h2><p>This free printable focuses on <strong>${escapeText(seoName.toLowerCase())}</strong> and is aligned to ${escapeText(unit[2])}. Every new set keeps the same grade-level goal while changing the numbers or visual models, so students can practice again without repeating the exact page.</p><p>The worksheet moves through three parts: Explore the idea, Build your skills, and Apply your thinking. Students meet the concept, complete focused questions, and use it in a model, explanation, or short problem. A matching answer key is generated from the same set.</p><h3>A practical teaching tip</h3><p>${escapeText(guide)}</p><h3>Print and practice</h3><p>Choose <strong>New problems</strong> whenever another version is useful. Select the worksheet, answer key, or both, then print or save the pages as a PDF. The layout is designed for one-page practice on US Letter and A4 paper. These worksheets are free for home learning, tutoring, and classroom instruction.</p><h3>Related free worksheets</h3><nav aria-label="Related worksheets"><a href="${previous.urlPath}">Previous ${escapeText(gradeLabel)} grade worksheet</a><a href="/en/grade-${grade}.html">All ${escapeText(gradeLabel)} grade math worksheets</a><a href="${next.urlPath}">Next ${escapeText(gradeLabel)} grade worksheet</a><a href="/en/math-worksheets-for-kids.html">Math worksheets for kids</a></nav></section>`;
  const sidebar = `<span class="entry-theme" id="theme-name">Grade ${grade} practice</span><p id="theme-message">Small steps, clear thinking, and a fresh set whenever you need it.</p><nav id="grade-links" aria-label="Choose a grade"><a href="/en/kindergarten.html">K</a><a href="/en/grades.html?grade=1"${grade === 1 ? ' aria-current="page"' : ''}>1</a><a href="/en/grades.html?grade=2"${grade === 2 ? ' aria-current="page"' : ''}>2</a><a href="/en/grades.html?grade=3">3</a><a href="/en/grades.html?grade=4">4</a><a href="/en/grades.html?grade=5">5</a></nav><label for="unit">Choose a skill</label><select id="unit"><option value="0">${escapeText(unit[1])}</option></select><div class="selector"><button id="previous" aria-label="Previous worksheet">←</button><div><strong id="variant">${escapeText(unit[1])}</strong><small id="position">Grade ${grade} worksheet</small></div><button id="next" aria-label="Next worksheet">→</button></div><p class="note">Three activities on every page.<br>Question count adjusts to fit one page.</p>`;
  return {
    filename,
    urlPath,
    html: commonShell({ title, description, canonical, h1, entry: { kind: 'grade', grade, unit: unit[0], level: `Grade ${grade}`, standard: unit[2] }, sidebar, resource }),
    manifest: { url: urlPath, kind: 'grade', grade, unit: unit[0], title, h1, description, standard: unit[2] }
  };
}

fs.mkdirSync(printDir, { recursive: true });

const kEntries = kindergarten.flatMap(unit => unit.items.map(profile => ({ unit, profile })));
const kPathEntries = kEntries.map(({ unit, profile }) => { const repeatedTitle = kindergartenTitleCounts.get(profile.title) > 1; return { urlPath: `/en/print/k-${repeatedTitle ? `${unit.id}-` : ``}${slug(profile.title)}.html` }; });
const gradeEntries = [1, 2].flatMap(grade => gradeMath.grades[grade].units.map(unit => ({ grade, unit })));
const gradePathEntries = gradeEntries.map(({ grade, unit }) => ({ urlPath: `/en/print/grade-${grade}-${slug(gradeSeoNames[`${grade}-${unit[0]}`] || titleCase(unit[1]))}-worksheet.html` }));

const pages = [
  ...kEntries.map((item, index) => kindergartenPage(item, kPathEntries, index)),
  ...gradeEntries.map((item, index) => gradePage(item, gradePathEntries, index))
];

if (pages.length !== 100) throw new Error(`Expected 100 pages, got ${pages.length}`);
const paths = new Set();
for (const page of pages) {
  if (paths.has(page.urlPath)) throw new Error(`Duplicate URL: ${page.urlPath}`);
  paths.add(page.urlPath);
  fs.writeFileSync(path.join(printDir, page.filename), page.html, 'utf8');
}

const manifest = {
  generator: '/en/build-k2-static.cjs',
  version: VERSION,
  counts: { kindergarten: kEntries.length, grade1: gradeMath.grades[1].units.length, grade2: gradeMath.grades[2].units.length, total: pages.length },
  pages: pages.map(page => page.manifest)
};
fs.writeFileSync(path.join(enDir, 'k2-static-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(`Generated ${pages.length} pages: ${kEntries.length} Kindergarten, ${gradeMath.grades[1].units.length} Grade 1, ${gradeMath.grades[2].units.length} Grade 2.`);
