'use strict';
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const en = __dirname;
const marker = 'US-SEARCH-EXPANSION';
const lastmod = '2026-09-14';

const catalog = {
  kindergarten: ['/en/kindergarten.html', 'Kindergarten math worksheets', 'Counting, number sense, shapes, and early operations'],
  numberSense: ['/en/number-sense-worksheets.html', 'Number sense worksheets for K-2', 'Counting, comparing, number order, ten frames, and place value'],
  addition: ['/en/addition-worksheets.html', 'Addition worksheets', 'Picture addition through multi-digit addition'],
  subtraction: ['/en/subtraction-worksheets.html', 'Subtraction worksheets', 'Visual subtraction through regrouping practice'],
  cutPaste: ['/en/cut-and-paste-math-worksheets.html', 'Cut and paste math worksheets', 'Counting, matching, ordering, and make 10 cards'],
  placeValue: ['/en/place-value.html', 'Place value worksheets', 'Ones and tens through expanded form'],
  longDivision: ['/en/long-division.html', 'Long division worksheets', 'One- and two-digit divisors, with or without remainders'],
  pictureAdd: ['/en/picture-addition.html', 'Picture addition worksheets', 'Join two picture groups'],
  lineAdd: ['/en/number-line-addition.html', 'Number line addition worksheets', 'Show addition as forward jumps'],
  cutMake10: ['/en/cut-and-paste-make-10.html', 'Cut and paste make 10 worksheets', 'Paste the missing partner for 10'],
  pictureSub: ['/en/picture-subtraction.html', 'Picture subtraction worksheets', 'Take away from a picture group'],
  lineSub: ['/en/number-line-subtraction.html', 'Number line subtraction worksheets', 'Show subtraction as backward jumps'],
  colorSub: ['/en/subtraction-color-by-number.html', 'Subtraction color by number worksheets', 'Solve and follow a color key'],
  grade1Place: ['/en/print/grade-1-tens-and-ones-worksheet.html', '1st grade place value worksheets', 'Tens and ones with visual models'],
  grade2Place: ['/en/print/grade-2-hundreds-tens-and-ones-worksheet.html', '2nd grade place value worksheets', 'Hundreds, tens, and ones']
};

const cutPages = [
  ['/en/cut-and-paste-counting.html', 'Cut and Paste Counting Worksheets'],
  ['/en/cut-and-paste-number-words.html', 'Cut and Paste Number Words Worksheets'],
  ['/en/cut-and-paste-number-order.html', 'Cut and Paste Number Order Worksheets'],
  ['/en/cut-and-paste-make-10.html', 'Cut and Paste Make 10 Worksheets'],
  ['/en/cut-and-paste-number-patterns.html', 'Cut and Paste Number Pattern Worksheets']
];

const numberSensePages = JSON.parse(fs.readFileSync(path.join(en, 'number-sense-static-manifest.json'), 'utf8')).pages.map(page => [
  '/en/' + page.file,
  page.title.replace(/ \| Googoodan$/, ''),
  page.grade + ' · ' + page.standard
]);

const escapeHtml = value => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

function cards(keys) {
  return '<ul class="cards">' + keys.map(key => {
    const item = catalog[key];
    return '<li><a href="' + item[0] + '">' + escapeHtml(item[1]) + '</a><small>' + escapeHtml(item[2]) + '</small></li>';
  }).join('') + '</ul>';
}

function cutCards() {
  return '<ul class="cards">' + cutPages.map(item =>
    '<li><a href="' + item[0] + '">' + escapeHtml(item[1]) + '</a><small>Free printable · matching answer key</small></li>'
  ).join('') + '</ul>';
}

function numberSenseCards(grade) {
  const pages = grade ? numberSensePages.filter(item => item[2].startsWith(grade + ' ·')) : numberSensePages;
  return '<ul class=\"cards\">' + pages.map(item =>
    '<li><a href=\"' + item[0] + '\">' + escapeHtml(item[1]) + '</a><small>' + escapeHtml(item[2]) + ' · matching answer key</small></li>'
  ).join('') + '</ul>';
}

function section(id, title, intro, keys, includeCutPages, extraCards = '') {
  return '<section class="seo-resource" aria-labelledby="' + id + '"><h2 id="' + id + '">' +
    escapeHtml(title) + '</h2><p>' + escapeHtml(intro) + '</p>' + cards(keys) +
    (includeCutPages ? cutCards() : '') + extraCards + '</section>';
}

function replaceBlock(fileName, html) {
  const file = path.join(en, fileName);
  if (!fs.existsSync(file)) throw new Error('Missing integration target: ' + fileName);
  const start = '<!-- ' + marker + ':START -->';
  const end = '<!-- ' + marker + ':END -->';
  const block = start + html + end;
  let source = fs.readFileSync(file, 'utf8');
  const pattern = new RegExp(start + '[\\s\\S]*?' + end);
  if (pattern.test(source)) source = source.replace(pattern, block);
  else {
    const at = source.lastIndexOf('</main>');
    if (at < 0) throw new Error('Missing </main> in ' + fileName);
    source = source.slice(0, at) + block + source.slice(at);
  }
  fs.writeFileSync(file, source, 'utf8');
}

const blocks = [
  ['index.html', section('us-search-heading', 'Find a free printable math worksheet', 'Start with a grade, a core skill, or a hands-on activity. Every linked worksheet can make new problems and print a matching answer key.', ['kindergarten', 'numberSense', 'addition', 'subtraction', 'cutPaste', 'placeValue', 'longDivision'], false)],
  ['worksheets.html', section('popular-worksheet-heading', 'Popular printable worksheet collections', 'Use these collections to find age-appropriate practice, then open a working generator to change the numbers, preview answers, and print.', ['kindergarten', 'numberSense', 'addition', 'subtraction', 'cutPaste', 'placeValue', 'longDivision'], true, numberSenseCards())],
  ['kindergarten.html', section('kindergarten-activity-heading', 'More Kindergarten number and cut-and-paste activities', 'Count, match, order, cut, and paste with short activities that use the same pictures and number models as the Kindergarten worksheets above.', ['numberSense', 'cutPaste'], true)],
  ['grade-1.html', section('grade1-core-heading', 'More 1st grade number and operation practice', 'Move from visual number sense and make-10 activities to focused addition and subtraction. Each collection links to printable worksheets with answers.', ['numberSense', 'addition', 'subtraction', 'cutPaste', 'placeValue'], false, numberSenseCards('Grade 1'))],
  ['grade-2.html', section('grade2-core-heading', 'More 2nd grade number and operation practice', 'Review place value, then choose two-digit addition or subtraction practice with clear answer keys.', ['numberSense', 'addition', 'subtraction', 'placeValue'], false, numberSenseCards('Grade 2'))],
  ['math-worksheets-for-kids.html', section('kids-activity-heading', 'Visual and hands-on math worksheets for kids', 'Younger learners can begin with pictures, number cards, and large answer spaces before moving to written calculations.', ['kindergarten', 'numberSense', 'cutPaste', 'addition', 'subtraction'], false)],
  ['add-small.html', section('addition-more-heading', 'More free printable addition worksheets', 'Choose picture models, make-10 practice, number-line addition, or multi-digit calculation from the full addition collection.', ['addition', 'pictureAdd', 'lineAdd', 'cutMake10'], false)],
  ['subtract-small.html', section('subtraction-more-heading', 'More free printable subtraction worksheets', 'Choose picture models, number-line subtraction, missing-number work, or regrouping practice from the full subtraction collection.', ['subtraction', 'pictureSub', 'lineSub', 'colorSub'], false)],
  ['place-value.html', section('place-value-grade-heading', 'Place value and number sense by grade', 'Begin with visual number sense, then choose focused place value practice for first or second grade.', ['numberSense', 'grade1Place', 'grade2Place'], false, numberSenseCards())],
  ['number-sense-worksheets.html', '<section class=\"seo-resource\" aria-labelledby=\"focused-number-sense-heading\"><h2 id=\"focused-number-sense-heading\">Focused number sense worksheet generators</h2><p>Choose a grade-level comparison, more-or-less, missing-number, or skip-counting page. Each page generates fresh questions and a matching answer key.</p>' + numberSenseCards() + '</section>'],
  ['early-math-activities.html', section('cut-paste-heading', 'Cut and paste math activities', 'Cut-out answer cards add a hands-on step to counting, number words, number order, number patterns, and make 10 practice.', ['cutPaste'], true)]
];

for (const [file, html] of blocks) replaceBlock(file, html);

const sitemapUrls = [
  'https://googoodan.com/en/kindergarten.html',
  'https://googoodan.com/en/number-sense-worksheets.html',
  'https://googoodan.com/en/addition-worksheets.html',
  'https://googoodan.com/en/subtraction-worksheets.html',
  'https://googoodan.com/en/cut-and-paste-math-worksheets.html',
  ...cutPages.map(item => 'https://googoodan.com' + item[0]),
  ...numberSensePages.map(item => 'https://googoodan.com' + item[0])
];
for (const url of sitemapUrls) {
  const file = path.join(root, ...new URL(url).pathname.split('/').filter(Boolean));
  if (!fs.existsSync(file)) throw new Error('Sitemap target does not exist: ' + url);
}
const sitemapFile = path.join(root, 'sitemap.xml');
let sitemap = fs.readFileSync(sitemapFile, 'utf8');
const added = [];
for (const url of sitemapUrls) {
  if (sitemap.includes('<loc>' + url + '</loc>')) continue;
  const entry = '<url><loc>' + url + '</loc><lastmod>' + lastmod + '</lastmod></url>';
  sitemap = sitemap.replace(/\s*<\/urlset>\s*$/, '\n' + entry + '\n</urlset>\n');
  added.push(url);
}
fs.writeFileSync(sitemapFile, sitemap, 'utf8');

console.log(JSON.stringify({
  linkedFiles: blocks.length,
  sitemapTargets: sitemapUrls.length,
  sitemapAdded: added.length,
  cutPastePages: 1 + cutPages.length,
  numberSensePages: numberSensePages.length
}, null, 2));
