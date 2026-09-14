'use strict';
const fs = require('fs');
const path = require('path');

const enDir = __dirname;
const templatePath = path.join(enDir, 'area-and-perimeter.html');
const site = 'https://googoodan.com';
const version = '20260914-number-sense-symbols';

const entries = [
  page(
    'compare-two-digit-symbols',
    '2-Digit Number Comparison Worksheets | Googoodan',
    '2-Digit Number Comparison Worksheets',
    'Free printable 1st grade worksheets for comparing two-digit numbers with <, >, and =. Make fresh practice and print a matching answer key.',
    'Grade 1', '1.NBT.B.3',
    'Compare Two-Digit Numbers with <, >, and =',
    'Compare the tens digits first. If the tens are equal, compare the ones digits. Write the correct symbol in the large answer box.',
    'Each generated question uses two numbers from 10 through 99. This keeps every item inside the two-digit range named on the page and gives students repeated practice with the meaning of greater than, less than, and equal to.',
    'Ask the student to read each completed statement aloud, such as “47 is greater than 32.” Reading the whole comparison helps connect the symbol to mathematical language.',
    ['/en/print/grade-1-tens-and-ones-worksheet.html','/en/print/grade-1-comparing-two-digit-numbers-worksheet.html','/en/grade-1.html']
  ),
  page(
    'compare-three-digit-symbols',
    '3-Digit Number Comparison Worksheets | Googoodan',
    '3-Digit Number Comparison Worksheets',
    'Free printable 2nd grade worksheets for comparing three-digit numbers with <, >, and =. Generate new sets and print the matching answer key.',
    'Grade 2', '2.NBT.A.4',
    'Compare Three-Digit Numbers by Place Value',
    'Compare hundreds first, then tens, then ones. Write <, >, or = in the large answer box.',
    'Every problem uses numbers from 100 through 999, so the worksheet matches the stated three-digit skill. Students compare the value of each position instead of relying on the length of the numeral.',
    'Have the student underline the first place where the digits differ. That digit decides the comparison, even when later digits look larger.',
    ['/en/print/grade-2-hundreds-tens-and-ones-worksheet.html','/en/print/grade-2-compare-three-digit-numbers-worksheet.html','/en/grade-2.html']
  ),
  page(
    'ten-more-ten-less-within-100',
    '10 More and 10 Less Within 100 Worksheets | Googoodan',
    '10 More and 10 Less Within 100 Worksheets',
    'Free printable 1st grade 10 more and 10 less worksheets within 100. Change the numbers, print practice, and include a matching answer key.',
    'Grade 1', '1.NBT.C.5',
    'Find 10 More or 10 Less Without Counting by Ones',
    'Use place value to find 10 more or 10 less. Notice what changes in the tens and ones places.',
    'The questions alternate between 10 more and 10 less. Starting numbers stay in a range that makes the existing grade-level generator appropriate for first-grade place-value practice.',
    'Cover the answer and ask what happens to the tens digit. Then check whether the ones digit stayed the same. A number chart can support students who are still building the pattern.',
    ['/en/print/grade-1-ten-more-and-ten-less-worksheet.html','/en/print/grade-1-number-paths-to-120-worksheet.html','/en/grade-1.html']
  ),
  page(
    'ten-hundred-more-less-within-1000',
    '10 and 100 More or Less Worksheets | Googoodan',
    '10 and 100 More or Less Worksheets',
    'Free printable 2nd grade worksheets for finding 10 or 100 more and less within 1,000. Generate fresh practice and matching answer keys.',
    'Grade 2', '2.NBT.B.8',
    'Find 10 or 100 More or Less Within 1,000',
    'Use place value to find 10 more, 10 less, 100 more, or 100 less. Solve mentally, then check the answer key.',
    'Each set deliberately includes all four directions: 10 more, 10 less, 100 more, and 100 less. The values come from the existing second-grade mental-math generator.',
    'Ask which place changes before calculating. Students can explain that adding or subtracting 10 affects the tens place, while adding or subtracting 100 affects the hundreds place.',
    ['/en/print/grade-2-ten-or-one-hundred-more-worksheet.html','/en/print/grade-2-number-names-and-expanded-form-worksheet.html','/en/grade-2.html']
  ),
  page(
    'missing-number-patterns-to-100',
    'Missing Numbers to 100 Worksheets | Googoodan',
    'Missing Numbers to 100 Worksheets',
    'Free printable 1st grade missing-number worksheets with counting patterns to 100. Generate new sequences and print the matching answer key.',
    'Grade 1', '1.NBT.A.1',
    'Complete Counting Patterns Within 100',
    'Read the sequence from left to right. Count on by one and write the missing number in the large box.',
    'The existing number-sequence generator supplies fresh four-number patterns. This focused page keeps every value at 100 or below and uses a step of one, exactly matching its title.',
    'Encourage the student to say every number, including the printed ones. After filling the blank, read the whole pattern again to check that each number is one more than the last.',
    ['/en/print/grade-1-number-paths-to-120-worksheet.html','/en/print/activity/missing-numbers-on-a-number-line.html','/en/grade-1.html']
  ),
  page(
    'skip-counting-missing-numbers-to-1000',
    'Skip Counting Missing Numbers to 1,000 Worksheets | Googoodan',
    'Skip Counting Missing Numbers to 1,000 Worksheets',
    'Free printable 2nd grade skip-counting worksheets with missing numbers to 1,000. Practice by 5s, 10s, and 100s with answer keys.',
    'Grade 2', '2.NBT.A.2',
    'Complete Skip-Counting Patterns to 1,000',
    'Add the same amount at every arrow. Fill missing numbers while skip-counting by 5s, 10s, and 100s.',
    'Every generated sheet includes practice with all three second-grade skip-counting steps. The existing grade generator supplies the starting numbers and exact answers, and every sequence stays at or below 1,000.',
    'Circle the digit or place that changes in each pattern. When counting by 5s, check the ones digit; when counting by 10s or 100s, track the tens or hundreds place.',
    ['/en/print/grade-2-skip-counting-to-1-000-worksheet.html','/en/print/hands-on/hundreds-chart-skip-counting-by-10.html','/en/grade-2.html']
  )
];

function page(id, title, h1, description, grade, standard, heading, directions, purpose, tip, related) {
  return {id, title, h1, description, grade, standard, heading, directions, purpose, tip, related};
}

function escapeHtml(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

function replaceOne(text, pattern, replacement, label) {
  const matches = text.match(new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`));
  if (!matches || matches.length !== 1) throw new Error(`${label}: expected one match, found ${matches ? matches.length : 0}`);
  return text.replace(pattern, replacement);
}

function resource(entry) {
  const links = entry.related.map((href, index) => {
    const labels = index === 0 ? 'Prerequisite place-value practice' : index === 1 ? 'Related generated worksheet' : `All ${entry.grade.toLowerCase()} math worksheets`;
    return `<li><a href="${href}">${labels}</a></li>`;
  }).join('');
  return `<section class="seo-resource" aria-labelledby="number-sense-guide"><h2 id="number-sense-guide">${escapeHtml(entry.heading)}</h2><p>${escapeHtml(entry.purpose)}</p><p>This is a working worksheet generator, not a sample image. Choose <strong>New problems</strong> to make another set with the same learning goal. Switch between <strong>Worksheet</strong> and <strong>Answer key</strong> to preview both pages. The answer key always uses the same numbers as the current worksheet.</p><h3>How students use this page</h3><p>${escapeHtml(entry.directions)}</p><p>${escapeHtml(entry.tip)}</p><p>Keep the session short enough for the learner to work carefully. Review one error together and ask the student to explain the place-value or counting pattern used. A clear explanation shows whether the answer came from the intended idea rather than a guess. A later fresh set can check whether the same idea transfers to different numbers.</p><h3>Grade-level focus</h3><p>This practice is designed for ${escapeHtml(entry.grade)} and focuses on ${escapeHtml(entry.standard)}. It provides focused skill practice rather than a full assessment of the standard. Teachers can use one page for a warm-up, independent work, a math center, tutoring, or a short home review.</p><h3>Free printing and fresh practice</h3><p>No sign-up is required. Print the worksheet alone, the answer key alone, or both. The same print dialog can save the pages as a PDF. The layout is designed for US Letter and A4 paper. Generate another set when a student needs more practice, then check the work with the matching answers.</p><h3>Related number-sense worksheets</h3><ul>${links}</ul></section>`;
}

function build(entry, template) {
  const canonical = `${site}/en/${entry.id}.html`;
  let html = template;
  html = replaceOne(html, /<title>.*?<\/title>/i, `<title>${escapeHtml(entry.title)}</title>`, 'title');
  html = replaceOne(html, /<meta name="description" content="[^"]*">/i, `<meta name="description" content="${escapeHtml(entry.description)}">`, 'description');
  html = html.includes('<meta name="robots"')
    ? replaceOne(html, /<meta name="robots" content="[^"]*">/i, '<meta name="robots" content="index,follow">', 'robots')
    : html.replace(/(<meta name="description" content="[^"]*">)/i, '$1<meta name="robots" content="index,follow">');
  html = replaceOne(html, /<link rel="canonical" href="[^"]*">/i, `<link rel="canonical" href="${canonical}">`, 'canonical');
  html = html.replace(/<link rel="alternate" hreflang="[^"]+" href="[^"]*">/gi, '');
  const alternates = `<link rel="alternate" hreflang="en" href="${canonical}"><link rel="alternate" hreflang="ko" href="${site}/ko/"><link rel="alternate" hreflang="ja" href="${site}/ja/"><link rel="alternate" hreflang="fr" href="${site}/fr/"><link rel="alternate" hreflang="de" href="${site}/de/"><link rel="alternate" hreflang="x-default" href="${site}/">`;
  html = html.replace(/(<meta property="og:title")/i, `${alternates}$1`);
  html = replaceOne(html, /<meta property="og:title" content="[^"]*">/i, `<meta property="og:title" content="${escapeHtml(entry.title)}">`, 'og:title');
  html = replaceOne(html, /<meta property="og:description" content="[^"]*">/i, `<meta property="og:description" content="${escapeHtml(entry.description)}">`, 'og:description');
  html = replaceOne(html, /<meta property="og:url" content="[^"]*">/i, `<meta property="og:url" content="${canonical}">`, 'og:url');
  html = replaceOne(html, /<script id="website-identity" type="application\/ld\+json">.*?<\/script>/i, `<script id="website-identity" type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'WebSite','@id':`${site}/#website`,name:'googoodan',alternateName:'구구단닷컴',url:`${site}/`})}</script>`, 'website JSON-LD');
  html = html.replace(/<script type="application\/ld\+json">.*?<\/script>/i, `<script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'LearningResource',name:entry.h1,description:entry.description,url:canonical,inLanguage:'en-US',educationalLevel:entry.grade,learningResourceType:'Printable worksheet generator',isAccessibleForFree:true,teaches:entry.standard})}</script>`);
  html = html.replace('<link rel="stylesheet" href="style.css', '<link rel="stylesheet" href="/en/style.css')
    .replace('<script defer src="types.js', '<script defer src="/en/types.js')
    .replace('<script defer src="curriculum.js', '<script defer src="/en/curriculum.js')
    .replace('<script defer src="app.js', '<script defer src="/en/app.js')
    .replace('<link rel="stylesheet" href="legal.css', '<link rel="stylesheet" href="/en/legal.css');
  html = html.replace(/<script defer src="\/en\/banks\/coverage-controls\.js[^"]*"><\/script>/i, '')
    .replace(/<script defer src="\/en\/banks\/coverage\.js[^"]*"><\/script>/i, `<script defer src="/en/grade-math.js?v=20260913-bank-answers"></script><script defer src="/en/grade-extension.js?v=20260913-distinct-factors"></script><script defer src="/en/banks/number-sense-reuse.js?v=${version}"></script>`);
  html = replaceOne(html, /<body data-type="[^"]*" data-base="[^"]*">/i, `<body data-type="${entry.id}" data-base="/en/">`, 'body data');
  html = html.replace('<a class="logo" href="index.html">', '<a class="logo" href="/en/">');
  html = replaceOne(html, /<aside><h1>.*?<\/h1><p>.*?<\/p>/i, `<aside><h1>${escapeHtml(entry.h1)}</h1><p>${escapeHtml(entry.description)}</p>`, 'visible H1');
  html = replaceOne(html, /<h2 id="sheet-title">.*?<\/h2>/i, `<h2 id="sheet-title">${escapeHtml(entry.h1)}</h2>`, 'sheet title');
  html = replaceOne(html, /<p class="instructions" id="instructions">.*?<\/p>/i, `<p class="instructions" id="instructions">${escapeHtml(entry.directions)}</p>`, 'instructions');
  html = html.replace(/href="(about|contact|privacy|terms)\.html"/g, 'href="/en/$1.html"')
    .replace(/href="index\.html"/g, 'href="/en/"');
  html = replaceOne(html, /<section class="seo-resource"[\s\S]*?<\/section><\/body>/i, `${resource(entry)}</body>`, 'resource section');
  return {html, canonical};
}

const template = fs.readFileSync(templatePath, 'utf8');
const manifest = {version, sources:['ko/catalog.js','ko/engine.js','en/grade-math.js','en/grade-extension.js','en/banks/number-sense-reuse.js'], pages:[]};
for (const entry of entries) {
  const {html, canonical} = build(entry, template);
  const file = path.join(enDir, `${entry.id}.html`);
  fs.writeFileSync(file, html, 'utf8');
  manifest.pages.push({id:entry.id,file:path.basename(file),canonical,title:entry.title,grade:entry.grade,standard:entry.standard});
}
fs.writeFileSync(path.join(enDir, 'number-sense-static-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(`Built ${entries.length} focused number-sense pages.`);
