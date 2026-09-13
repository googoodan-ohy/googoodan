const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const en = __dirname;
const staticManifest = JSON.parse(fs.readFileSync(path.join(en, 'k2-static-manifest.json'), 'utf8')).pages;
const activityManifest = JSON.parse(fs.readFileSync(path.join(en, 'k2-activity-manifest.json'), 'utf8')).pages;
const arithmeticManifest = JSON.parse(fs.readFileSync(path.join(en, 'print', 'common-core-arithmetic', 'manifest.json'), 'utf8')).pages;
const levelManifest = JSON.parse(fs.readFileSync(path.join(en, 'print', 'early-skill-practice', 'manifest.json'), 'utf8')).pages;
const existingActivityManifest = JSON.parse(fs.readFileSync(path.join(en, 'existing-activity-static-manifest.json'), 'utf8')).pages;
const gradeStaticManifest = JSON.parse(fs.readFileSync(path.join(en, 'grade3-5-static-manifest.json'), 'utf8')).pages;
const arithmeticUpperManifest = JSON.parse(fs.readFileSync(path.join(en, 'print', 'common-core-arithmetic-upper', 'manifest.json'), 'utf8')).pages;
const levelUpperManifest = JSON.parse(fs.readFileSync(path.join(en, 'print', 'level-skills-upper', 'manifest.json'), 'utf8')).pages;
const activityMethodManifest = JSON.parse(fs.readFileSync(path.join(en, 'k2-activity-method-static-manifest.json'), 'utf8')).pages;
const highValueActivityManifest = JSON.parse(fs.readFileSync(path.join(en, 'high-value-activity-pages-manifest.json'), 'utf8')).pages;

const esc = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

function replaceBlock(file, name, html, anchor = '</main>') {
  const start = `<!-- ${name}:START -->`;
  const end = `<!-- ${name}:END -->`;
  let source = fs.readFileSync(file, 'utf8');
  const block = `${start}${html}${end}`;
  const pattern = new RegExp(`${start}[\\s\\S]*?${end}`);
  if (pattern.test(source)) source = source.replace(pattern, block);
  else {
    const at = source.lastIndexOf(anchor);
    if (at < 0) throw new Error(`Anchor ${anchor} not found in ${file}`);
    source = `${source.slice(0, at)}${block}${source.slice(at)}`;
  }
  fs.writeFileSync(file, source);
}

const activityGrades = {
  'count-and-color': ['K'],
  'picture-subtraction': ['K', '1'],
  'number-bonds': ['K', '1'],
  'tens-and-ones': ['1'],
  'hundreds-chart-coloring': ['2'],
  'number-line-addition': ['1'],
  'number-line-subtraction': ['1'],
  'missing-number-equations': ['1'],
  'true-false-equations': ['1'],
  'telling-time-5-minutes': ['2'],
  'counting-coins': ['2'],
  'fraction-coloring': ['1', '2'],
  'equal-groups-arrays': ['2'],
  'picture-number-matching': ['K']
};

function audienceFor(activity) {
  if (activityGrades[activity.id]) return activityGrades[activity.id];
  const value = activity.level || '';
  const grades = [];
  if (/Kindergarten/i.test(value)) grades.push('K');
  if (/Grade 1|Grades 1/i.test(value)) grades.push('1');
  if (/Grade 2|Grades 1[–-]2/i.test(value)) grades.push('2');
  return grades.length ? grades : ['K', '1', '2'];
}

function linkList(items, urlOf, labelOf) {
  return `<ul class="cards">${items.map((item) => `<li><a href="${esc(urlOf(item))}">${esc(labelOf(item))}</a><small>Free printable · matching answer key</small></li>`).join('')}</ul>`;
}

function staticFor(kind, grade) {
  return staticManifest.filter((page) => page.kind === kind && (grade == null || Number(page.grade) === grade));
}

function activitiesFor(grade) {
  return activityManifest.filter((page) => audienceFor(page).includes(String(grade)));
}

function activityLinks(grade) {
  return linkList(activitiesFor(grade), (page) => `/en/${page.id}.html`, (page) => page.title);
}

function existingActivitiesFor(grade) {
  return existingActivityManifest.filter((page) => {
    const value = page.grade || '';
    if (String(grade) === 'K') return /Kindergarten/.test(value);
    if (String(grade) === '1') return /Grade 1|Grades 1/.test(value);
    if (String(grade) === '2') return /Grade 2|Grades 1[–-]2/.test(value);
    if (String(grade) === '3') return /Grade 3/.test(value);
    return false;
  });
}

function existingActivityLinks(grade) {
  return linkList(existingActivitiesFor(grade), (page) => new URL(page.canonical).pathname, (page) => page.title);
}

function activityMethodLinks(grade) {
  return linkList(activityMethodManifest.filter((page) => audienceFor(page).includes(String(grade))), (page) => new URL(page.canonical).pathname, (page) => page.title);
}

function highValueActivitiesFor(grade) {
  return highValueActivityManifest.filter((page) => {
    if (String(grade) === 'K') return /Kindergarten/.test(page.grade);
    if (String(grade) === '1') return /Grade 1|Grades 1/.test(page.grade);
    if (String(grade) === '2') return /Grade 2|Grades 1[–-]2/.test(page.grade);
    return false;
  });
}

function highValueActivityLinks(grade) {
  return linkList(highValueActivitiesFor(grade), (page) => new URL(page.canonical).pathname, (page) => page.title);
}

const kPages = staticFor('kindergarten');
const g1Pages = staticFor('grade', 1);
const g2Pages = staticFor('grade', 2);
const a1Pages = arithmeticManifest.filter((page) => Number(page.grade) === 1);
const a2Pages = arithmeticManifest.filter((page) => Number(page.grade) === 2);
const lKPages = levelManifest.filter((page) => page.grade === 'Kindergarten');
const l1Pages = levelManifest.filter((page) => page.grade === '1st grade');
const l2Pages = levelManifest.filter((page) => page.grade === '2nd grade');
const g3Pages = gradeStaticManifest.filter((page) => Number(page.grade) === 3);
const g4Pages = gradeStaticManifest.filter((page) => Number(page.grade) === 4);
const g5Pages = gradeStaticManifest.filter((page) => Number(page.grade) === 5);
const upperArithmeticByGrade = Object.fromEntries([3, 4, 5, 6].map((grade) => [grade, arithmeticUpperManifest.filter((page) => Number(page.grade) === grade)]));
const upperLevelByGrade = Object.fromEntries([3, 4, 5, 6].map((grade) => [grade, levelUpperManifest.filter((page) => Number(page.grade) === grade)]));

replaceBlock(path.join(en, 'kindergarten.html'), 'K2-DISCOVERY', `
<section id="kindergarten-printables" class="seo-resource"><h2>Kindergarten printable worksheets by skill</h2><p>Open one focused activity, make a fresh set, and print the worksheet with its matching answer key. These pages use the same Kindergarten generator while giving every skill a clear, permanent address.</p>${linkList(kPages, (page) => page.url, (page) => page.h1)}${linkList(lKPages, (page) => new URL(page.url).pathname, (page) => page.title.replace(/ \| Googoodan$/, ''))}</section>
<section id="kindergarten-hands-on" class="seo-resource"><h2>Hands-on Kindergarten math activities</h2><p>Use pictures, coloring, matching, ten frames, and number bonds to make early number ideas visible.</p>${activityLinks('K')}${existingActivityLinks('K')}${activityMethodLinks('K')}${highValueActivityLinks('K')}<p><a href="/en/early-math-activities.html">Browse all early math activity worksheets</a></p></section>`);

replaceBlock(path.join(en, 'grade-1.html'), 'K2-DISCOVERY', `
<section id="grade-1-hands-on"><h2>Hands-on 1st grade math activities</h2><p>Draw jumps, color equal parts, build number bonds, and connect tens and ones before moving to abstract calculation.</p>${activityLinks('1')}${existingActivityLinks('1')}${activityMethodLinks('1')}${highValueActivityLinks('1')}</section>
<section id="grade-1-skill-pages"><h2>1st grade worksheets by Common Core skill</h2><p>Each link opens a working generator with new numbers, a matching answer key, and free printing.</p>${linkList(g1Pages, (page) => page.url, (page) => page.h1)}</section>
<section id="grade-1-arithmetic-pages"><h2>1st grade arithmetic practice formats</h2><p>Choose horizontal, vertical, missing-number, review, or word-problem practice for the same grade-level skill.</p>${linkList(a1Pages, (page) => new URL(page.url).pathname, (page) => page.title.replace(/ \| Googoodan$/, ''))}${linkList(l1Pages, (page) => new URL(page.url).pathname, (page) => page.title.replace(/ \| Googoodan$/, ''))}<p><a href="/en/early-math-activities.html">Browse all early math activity worksheets</a></p></section>`);

replaceBlock(path.join(en, 'grade-2.html'), 'K2-DISCOVERY', `
<section id="grade-2-hands-on"><h2>Hands-on 2nd grade math activities</h2><p>Practice time, coins, equal groups, fractions, and skip counting with pictures children can mark and discuss.</p>${activityLinks('2')}${existingActivityLinks('2')}${activityMethodLinks('2')}${highValueActivityLinks('2')}</section>
<section id="grade-2-skill-pages"><h2>2nd grade worksheets by Common Core skill</h2><p>Each link opens a working generator with new numbers, a matching answer key, and free printing.</p>${linkList(g2Pages, (page) => page.url, (page) => page.h1)}</section>
<section id="grade-2-arithmetic-pages"><h2>2nd grade arithmetic practice formats</h2><p>Choose horizontal, vertical, missing-number, review, or word-problem practice for the same grade-level skill.</p>${linkList(a2Pages, (page) => new URL(page.url).pathname, (page) => page.title.replace(/ \| Googoodan$/, ''))}${linkList(l2Pages, (page) => new URL(page.url).pathname, (page) => page.title.replace(/ \| Googoodan$/, ''))}<p><a href="/en/early-math-activities.html">Browse all early math activity worksheets</a></p></section>`);


replaceBlock(path.join(en, 'grade-3.html'), 'K2-DISCOVERY', `
<section id="grade-3-hands-on"><h2>Hands-on 3rd grade math activities</h2><p>Use color and arrays to connect multiplication facts with patterns and properties.</p>${existingActivityLinks('3')}<p><a href="/en/early-math-activities.html">Browse early and elementary math activity worksheets</a></p></section>
<section id="grade-3-skill-pages"><h2>3rd grade worksheets by Common Core skill</h2><p>Open a focused generator, make a fresh set, and print the worksheet with its matching answer key.</p>${linkList(g3Pages, (page) => page.url, (page) => page.h1)}</section>
<section id="grade-3-arithmetic-pages"><h2>3rd grade arithmetic practice formats</h2><p>Practice each grade-level computation as a horizontal, vertical, missing-number, review, or word-problem worksheet.</p>${linkList(upperArithmeticByGrade[3], (page) => new URL(page.url).pathname, (page) => page.title.replace(/ \| Googoodan$/, ''))}${linkList(upperLevelByGrade[3], (page) => new URL(page.url).pathname, (page) => page.h1)}</section>`);
replaceBlock(path.join(en, 'grade-4.html'), 'K2-DISCOVERY', `
<section id="grade-4-skill-pages"><h2>4th grade worksheets by Common Core skill</h2><p>Open a focused generator, make a fresh set, and print the worksheet with its matching answer key.</p>${linkList(g4Pages, (page) => page.url, (page) => page.h1)}</section>
<section id="grade-4-arithmetic-pages"><h2>4th grade arithmetic practice formats</h2><p>Choose computation, missing-number, prerequisite review, word-problem, fraction, and decimal practice.</p>${linkList(upperArithmeticByGrade[4], (page) => new URL(page.url).pathname, (page) => page.title.replace(/ \| Googoodan$/, ''))}${linkList(upperLevelByGrade[4], (page) => new URL(page.url).pathname, (page) => page.h1)}</section>`);
replaceBlock(path.join(en, 'grade-5.html'), 'K2-DISCOVERY', `
<section id="grade-5-skill-pages"><h2>5th grade worksheets by Common Core skill</h2><p>Open a focused generator, make a fresh set, and print the worksheet with its matching answer key.</p>${linkList(g5Pages, (page) => page.url, (page) => page.h1)}</section>
<section id="grade-5-arithmetic-pages"><h2>5th grade arithmetic practice formats</h2><p>Build fluency with whole-number, fraction, and decimal worksheets in several useful formats.</p>${linkList(upperArithmeticByGrade[5], (page) => new URL(page.url).pathname, (page) => page.title.replace(/ \| Googoodan$/, ''))}${linkList(upperLevelByGrade[5], (page) => new URL(page.url).pathname, (page) => page.h1)}</section>`);
replaceBlock(path.join(en, 'grade-6.html'), 'K2-DISCOVERY', `
<section id="grade-6-arithmetic-pages"><h2>6th grade arithmetic worksheets by skill</h2><p>Choose fraction, decimal, division, missing-number, review, or word-problem practice. Each page makes fresh questions and a matching answer key.</p>${linkList(upperArithmeticByGrade[6], (page) => new URL(page.url).pathname, (page) => page.title.replace(/ \| Googoodan$/, ''))}${linkList(upperLevelByGrade[6], (page) => new URL(page.url).pathname, (page) => page.h1)}</section>`);

const allDiscovery = [
  ...activityManifest.map((page) => ({ url: `/en/${page.id}.html`, label: page.title, note: page.level })),
  ...staticManifest.map((page) => ({ url: page.url, label: page.h1, note: page.standard })),
  ...arithmeticManifest.map((page) => ({ url: new URL(page.url).pathname, label: page.title.replace(/ \| Googoodan$/, ''), note: page.standard })),
  ...levelManifest.map((page) => ({ url: new URL(page.url).pathname, label: page.title.replace(/ \| Googoodan$/, ''), note: page.standard })),
  ...existingActivityManifest.map((page) => ({ url: new URL(page.canonical).pathname, label: page.title, note: page.standard })),
  ...activityMethodManifest.map((page) => ({ url: new URL(page.canonical).pathname, label: page.title, note: page.standard })),
  ...highValueActivityManifest.map((page) => ({ url: new URL(page.canonical).pathname, label: page.title, note: page.standard })),
  ...gradeStaticManifest.map((page) => ({ url: page.url, label: page.h1, note: page.standard })),
  ...arithmeticUpperManifest.map((page) => ({ url: new URL(page.url).pathname, label: page.title.replace(/ \| Googoodan$/, ''), note: page.standard })),
  ...levelUpperManifest.map((page) => ({ url: new URL(page.url).pathname, label: page.h1, note: page.standard }))
];

replaceBlock(path.join(en, 'worksheets.html'), 'K2-DISCOVERY', `
<section id="k2-expanded-directory"><h2>Printable worksheets by grade and skill</h2><p>Browse ${allDiscovery.length} focused math pages. Every link opens a real worksheet generator and includes a matching answer key.</p>${linkList(allDiscovery, (page) => page.url, (page) => page.label)}<p><a href="/en/early-math-activities.html">Hands-on math activities for younger learners</a></p></section>`);

replaceBlock(path.join(en, 'index.html'), 'K2-DISCOVERY', `
<section id="k2-activity-directory" class="seo-resource"><h2>Hands-on math worksheets for younger learners</h2><p>Count, color, match, draw, and build number sense with printable Kindergarten through 2nd grade activities.</p><ul class="cards"><li><a href="/en/early-math-activities.html">Hands-on early math activity worksheets</a></li><li><a href="/en/kindergarten.html">Kindergarten math worksheets</a></li><li><a href="/en/grade-1.html">1st grade math worksheets</a></li><li><a href="/en/grade-2.html">2nd grade math worksheets</a></li></ul></section>`);

const relatedActivitySections = {
  'add-small.html': '<section class="seo-resource"><h2>Build addition with pictures and movement</h2><ul class="cards"><li><a href="/en/picture-addition.html">Picture addition worksheets</a></li><li><a href="/en/number-line-addition.html">Number line addition worksheets</a></li><li><a href="/en/number-bonds.html">Number bond worksheets</a></li><li><a href="/en/addition-maze.html">Addition maze worksheets</a></li><li><a href="/en/fact-family-houses.html">Fact family house worksheets</a></li></ul></section>',
  'subtract-small.html': '<section class="seo-resource"><h2>See subtraction with pictures and number lines</h2><ul class="cards"><li><a href="/en/picture-subtraction.html">Picture subtraction worksheets</a></li><li><a href="/en/number-line-subtraction.html">Number line subtraction worksheets</a></li><li><a href="/en/fact-family-houses.html">Related addition and subtraction facts</a></li><li><a href="/en/subtraction-color-by-number.html">Subtraction color by number</a></li><li><a href="/en/make-10-subtraction.html">Make 10 subtraction worksheets</a></li><li><a href="/en/subtracting-three-numbers.html">Subtracting three numbers worksheets</a></li></ul></section>',
  'place-value.html': '<section class="seo-resource"><h2>Build place value with visual models</h2><ul class="cards"><li><a href="/en/tens-and-ones.html">Tens and ones with base ten blocks</a></li><li><a href="/en/print/grade-2-hundreds-tens-and-ones-worksheet.html">Hundreds, tens, and ones worksheets</a></li></ul></section>',
  'telling-time.html': '<section class="seo-resource"><h2>Hands-on clock worksheets</h2><ul class="cards"><li><a href="/en/print/activity/telling-time-hour-and-half-hour.html">Time to the hour and half hour</a></li><li><a href="/en/telling-time-5-minutes.html">Telling time to five minutes</a></li></ul></section>',
  'multiplication-arrays.html': '<section class="seo-resource"><h2>Explore multiplication with arrays</h2><ul class="cards"><li><a href="/en/equal-groups-arrays.html">Equal groups and arrays</a></li><li><a href="/en/print/activity/commutative-property-arrays.html">Commutative property arrays</a></li><li><a href="/en/print/activity/multiplication-color-by-number.html">Multiplication color by number</a></li></ul></section>',
  'picture-graph.html': '<section class="seo-resource"><h2>Make and read picture graphs</h2><ul class="cards"><li><a href="/en/make-picture-graph.html">Making picture graphs worksheets</a></li><li><a href="/en/tally-mark-activities.html">Tally mark activities</a></li></ul></section>',
  'fraction-models.html': '<section class="seo-resource"><h2>Color and name equal parts</h2><ul class="cards"><li><a href="/en/fraction-coloring.html">Fraction coloring worksheets</a></li><li><a href="/en/print/grade-2-halves-thirds-and-fourths-worksheet.html">Halves, thirds, and fourths</a></li></ul></section>',
  'picture-addition.html': '<section class="seo-resource"><h2>Explore equations and check mathematical thinking</h2><ul class="cards"><li><a href="/en/balance-the-equation.html">Balance the equation worksheets</a></li><li><a href="/en/math-mistake-detective.html">Math mistake detective worksheets</a></li></ul></section>',
  'number-order-activities.html': '<section class="seo-resource"><h2>Compare and order numbers</h2><ul class="cards"><li><a href="/en/greater-than-less-than-number-clues.html">Greater than and less than number clues</a></li></ul></section>',
  'word-problems.html': '<section class="seo-resource"><h2>Model and choose operations in word problems</h2><ul class="cards"><li><a href="/en/find-the-unknown-word-problems.html">Find the unknown word problems</a></li><li><a href="/en/compare-word-problems-more-fewer.html">Compare word problems with more and fewer</a></li><li><a href="/en/word-problems-with-extra-information.html">Word problems with extra information</a></li><li><a href="/en/open-ended-math-word-problems.html">Open-ended math word problems</a></li><li><a href="/en/tape-diagram-word-problems.html">Tape diagram word problems</a></li><li><a href="/en/choose-operation-word-problems.html">Choose the operation word problems</a></li></ul></section>'
};
for (const [fileName, html] of Object.entries(relatedActivitySections)) {
  replaceBlock(path.join(en, fileName), 'ACTIVITY-LINKS', html);
}
const activityHubPath = path.join(en, 'early-math-activities.html');
const activityCards = activityManifest.map((page) => `<li><a href="/en/${esc(page.id)}.html">${esc(page.title)}</a><small>${esc(page.level)} · ${esc(page.standard)}</small></li>`).join('');
const existingActivityCards = existingActivityManifest.map((page) => `<li><a href="${esc(new URL(page.canonical).pathname)}">${esc(page.title)}</a><small>${esc(page.grade)} · ${esc(page.standard)}</small></li>`).join('');
const activityMethodCards = activityMethodManifest.map((page) => `<li><a href="${esc(new URL(page.canonical).pathname)}">${esc(page.title)}</a><small>${esc(page.level)} · ${esc(page.standard)}</small></li>`).join('');
const highValueActivityCards = highValueActivityManifest.map((page) => `<li><a href="${esc(new URL(page.canonical).pathname)}">${esc(page.title)}</a><small>${esc(page.grade)} · ${esc(page.standard)}</small></li>`).join('');
const activityHub = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Hands-On Math Worksheets for Kids K–2 | Googoodan</title><meta name="description" content="Free printable hands-on math worksheets for Kindergarten through 2nd grade. Count, color, match, draw, and print every activity with an answer key."><meta name="robots" content="index,follow"><link rel="canonical" href="https://googoodan.com/en/early-math-activities.html"><link rel="alternate" hreflang="en" href="https://googoodan.com/en/early-math-activities.html"><link rel="alternate" hreflang="ko" href="https://googoodan.com/ko/"><link rel="alternate" hreflang="ja" href="https://googoodan.com/ja/"><link rel="alternate" hreflang="fr" href="https://googoodan.com/fr/"><link rel="alternate" hreflang="de" href="https://googoodan.com/de/"><link rel="alternate" hreflang="x-default" href="https://googoodan.com/"><meta property="og:title" content="Hands-On Math Worksheets for Kids K–2 | Googoodan"><meta property="og:description" content="Count, color, match, and draw with free printable early math activities and matching answer keys."><meta property="og:url" content="https://googoodan.com/en/early-math-activities.html"><meta property="og:type" content="website"><link rel="stylesheet" href="/brand.css?v=20260910-brand-name"><link rel="stylesheet" href="/worksheet-directory.css?v=20260910"><link rel="stylesheet" href="/en/search-landing.css?v=20260912-us-search"><link rel="stylesheet" href="/en/site-help.css?v=20260908-help"><script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Hands-On Math Worksheets for Kids K–2', description: 'Free printable hands-on math worksheets for Kindergarten through 2nd grade with matching answer keys.', url: 'https://googoodan.com/en/early-math-activities.html', inLanguage: 'en' })}</script><script id="website-identity" type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebSite', '@id': 'https://googoodan.com/#website', name: 'googoodan', alternateName: '구구단닷컴', url: 'https://googoodan.com/' })}</script><script defer src="/analytics-config.js?v=20260910"></script><script defer src="/analytics.js?v=20260910"></script></head><body><header><a class="gd-brand" href="/en/"><img src="/brand-logo.svg" alt="" width="52" height="52"><span class="gd-brand-copy"><span class="gd-brand-name">googoodan<span>.</span></span><small>Free printable math practice</small></span></a><nav aria-label="Site navigation"><a href="/en/worksheets.html">All worksheets</a> · <a href="/en/kindergarten.html">Kindergarten</a> · <a href="/en/grade-1.html">Grade 1</a> · <a href="/en/grade-2.html">Grade 2</a></nav></header><main><nav aria-label="Breadcrumb"><a href="/en/">Math worksheets</a> › <span aria-current="page">Hands-on early math activities</span></nav><p class="eyebrow">FREE PRINTABLES · MATCHING ANSWER KEYS</p><h1>Hands-On Math Worksheets for Kids K–2</h1><p class="intro">Young children learn mathematics by seeing quantities and making marks of their own. These printable activities turn early number ideas into small actions: count a picture, color a set, draw a jump, match a numeral, read a clock, or build an equal group. Choose one activity at a time, make a fresh problem set, and print the worksheet with its matching answer key.</p><section><h2>Choose a visual math activity</h2><ul class="cards">${activityCards}</ul></section><section><h2>More picture, matching, and coloring formats</h2><p>These focused pages open an exact mode from the existing activity generators, so children can repeat one kind of visual task without searching through a mixed menu.</p><ul class="cards">${existingActivityCards}${activityMethodCards}${highValueActivityCards}</ul></section><section><h2>Find the right starting point</h2><p>Kindergarten activities focus on counting, matching quantities to numerals, and composing small numbers. First grade activities connect pictures and number paths to addition, subtraction, place value, and the meaning of the equal sign. Second grade activities add clocks, U.S. coins, equal groups, skip-counting patterns, and equal shares. The grade label on each activity is a guide; an easier page can also work as review.</p><ul class="cards"><li><a href="/en/kindergarten.html">Kindergarten math worksheets</a><small>Counting, quantities, shapes, and making numbers</small></li><li><a href="/en/grade-1.html">1st grade math worksheets</a><small>Number sense and addition or subtraction within 20</small></li><li><a href="/en/grade-2.html">2nd grade math worksheets</a><small>Place value, measurement, time, money, and equal groups</small></li></ul></section><section><h2>Print a short activity with its answers</h2><p>Open an activity and choose <strong>New problems</strong> whenever you want a different set. Select the worksheet, the answer key, or both, then use Print or save the pages as a PDF. The question sheet and answer key keep the same pictures and numbers. Each activity is designed to fit on one Letter or A4 page.</p><p>A short sheet is often enough for young learners. Ask the child to explain one picture or show a second way to solve it. Coloring and drawing are part of the mathematics here: they help children connect a written symbol to a quantity, position, or group they can see.</p></section><section><h2>More free printable practice</h2><ul class="cards"><li><a href="/en/math-worksheets-for-kids.html">Math worksheets for kids, Kindergarten through Grade 6</a></li><li><a href="/en/worksheets.html">All printable arithmetic worksheets</a></li><li><a href="/en/help.html">Printing and PDF help</a></li></ul></section></main><footer><nav class="en-help-footer" aria-label="Help and site information"><a href="/en/help.html">How to use</a> · <a href="/en/contact.html">Contact</a> · <a href="/en/about.html">About</a> · <a href="/en/terms.html">Terms of use</a> · <a href="/en/privacy.html">Privacy</a></nav></footer></body></html>`;
fs.writeFileSync(activityHubPath, activityHub);

const sitemapPath = path.join(root, 'sitemap.xml');
let sitemap = fs.readFileSync(sitemapPath, 'utf8');
const urls = [
  'https://googoodan.com/en/early-math-activities.html',
  ...activityManifest.map((page) => `https://googoodan.com/en/${page.id}.html`),
  ...staticManifest.map((page) => `https://googoodan.com${page.url}`),
  ...arithmeticManifest.map((page) => page.url),
  ...levelManifest.map((page) => page.url),
  ...existingActivityManifest.map((page) => page.canonical),
  ...activityMethodManifest.map((page) => page.canonical),
  ...highValueActivityManifest.map((page) => page.canonical),
  ...gradeStaticManifest.map((page) => `https://googoodan.com${page.url}`),
  ...arithmeticUpperManifest.map((page) => page.url),
  ...levelUpperManifest.map((page) => page.url)
];
const uniqueUrls = [...new Set(urls)];
const newEntries = uniqueUrls.filter((url) => !sitemap.includes(`<loc>${url}</loc>`));
if (newEntries.length) {
  const xml = newEntries.map((url) => `<url><loc>${url}</loc><lastmod>2026-09-13</lastmod></url>`).join('\n');
  sitemap = sitemap.replace(/\s*<\/urlset>\s*$/, `\n${xml}\n</urlset>\n`);
  fs.writeFileSync(sitemapPath, sitemap);
}

console.log(JSON.stringify({
  kindergarten: kPages.length,
  grade1: g1Pages.length,
  grade2: g2Pages.length,
  arithmeticGrade1: a1Pages.length,
  arithmeticGrade2: a2Pages.length,
  levelKindergarten: lKPages.length,
  levelGrade1: l1Pages.length,
  levelGrade2: l2Pages.length,
  existingActivities: existingActivityManifest.length,
  grade3: g3Pages.length,
  grade4: g4Pages.length,
  grade5: g5Pages.length,
  grade6: upperArithmeticByGrade[6].length + upperLevelByGrade[6].length,
  upperArithmetic: arithmeticUpperManifest.length,
  upperLevel: levelUpperManifest.length,
  activityMethods: activityMethodManifest.length,
  highValueActivities: highValueActivityManifest.length,
  activities: activityManifest.length,
  discoveryLinks: allDiscovery.length,
  sitemapAdded: newEntries.length
}, null, 2));
