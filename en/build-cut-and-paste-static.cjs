'use strict';
const fs = require('fs');
const path = require('path');

const enDir = __dirname;
const templateFile = path.join(enDir, 'number-matching.html');
const site = 'https://googoodan.com';
const version = '20260914-cut-paste-unique';

const entries = [
  {
    slug: 'cut-and-paste-math-worksheets',
    title: 'Cut and Paste Math Worksheets for Kindergarten',
    description: 'Free printable cut and paste math worksheets for kindergarten with counting, number words, number order, make 10 activities, and matching answer keys.',
    level: 'Kindergarten',
    standards: 'K.CC.A-B; K.OA.A.4',
    summary: 'Practice counting, number words, number order, and partners for 10 on one mixed activity sheet.',
    activities: ['Count a picture group and paste its numeral.', 'Match written number words to numerals.', 'Order number cards from least to greatest.', 'Find and paste the missing partner that makes 10.'],
    tip: 'Use the mixed page when you want a short review of several early math skills. Each new set changes the pictures and numbers while keeping the same four-part routine.'
  },
  {
    slug: 'cut-and-paste-counting',
    title: 'Cut and Paste Counting Worksheets',
    description: 'Free printable cut and paste counting worksheets for kindergarten. Count familiar pictures, choose the matching numeral card, and print answer keys.',
    level: 'Kindergarten',
    standards: 'K.CC.B.4-5',
    summary: 'Count each familiar picture group, cut out the numeral choices, and paste the card that shows how many.',
    activities: ['Touch each picture once while counting.', 'Say the final number aloud.', 'Choose the numeral card with the same total.', 'Paste the card in the large dashed answer space.'],
    tip: 'Ask the child to count once from left to right and once in a different order. The total should stay the same even when the counting order changes.'
  },
  {
    slug: 'cut-and-paste-number-words',
    title: 'Cut and Paste Number Words Worksheets',
    description: 'Free printable cut and paste number word worksheets for kindergarten. Match numerals with English number words, make new sets, and print answers.',
    level: 'Kindergarten',
    standards: 'K.CC.A.3',
    summary: 'Read each numeral, cut out its written number word, and paste the word beside the matching number.',
    activities: ['Read the three numerals aloud.', 'Cut along the dotted borders around the word cards.', 'Match each word to the same numeral.', 'Paste the cards and check them with the answer key.'],
    tip: 'If reading the word is new, say it together first. Then mix the cards and let the learner use the beginning sound and letter pattern to find it again.'
  },
  {
    slug: 'cut-and-paste-number-order',
    title: 'Cut and Paste Number Order Worksheets',
    description: 'Free printable cut and paste number order worksheets for kindergarten and first grade. Arrange number cards from least to greatest with answers.',
    level: 'Kindergarten-Grade 1',
    standards: 'K.CC.A.1-2; 1.NBT.A.1',
    summary: 'Cut out three number cards and paste them into a row from least to greatest.',
    activities: ['Find the smallest number first.', 'Place the next greater number in the middle.', 'Put the greatest number in the last space.', 'Read the finished number sequence aloud.'],
    tip: 'A child who is unsure can say the counting sequence and point when each card number is reached. The card reached first is the least number.'
  },
  {
    slug: 'cut-and-paste-make-10',
    title: 'Cut and Paste Make 10 Worksheets',
    description: 'Free printable cut and paste make 10 worksheets for kindergarten and first grade. Find missing partners for ten and print matching answer keys.',
    level: 'Kindergarten-Grade 1',
    standards: 'K.OA.A.4; 1.OA.C.6',
    summary: 'Complete each addition sentence by cutting out and pasting the missing number that makes 10.',
    activities: ['Read the number already shown.', 'Think about how many more make a full group of 10.', 'Choose the correct card from the answer choices.', 'Paste it in the equation and check the complete fact.'],
    tip: 'A ten frame or ten small counters can help. Build the given number, count the empty places, and then select the card with that missing amount.'
  },
  {
    slug: 'cut-and-paste-number-patterns',
    title: 'Cut and Paste Number Pattern Worksheets',
    description: 'Free printable cut and paste number pattern worksheets for kindergarten and first grade. Complete number lines and counting sequences with answers.',
    level: 'Kindergarten-Grade 1',
    standards: 'K.CC.A.1-2; 1.NBT.A.1',
    summary: 'Use cut-out number cards to complete before-and-after patterns, number lines, and mixed counting sequences.',
    activities: ['Look for the number that comes before and after.', 'Move one step at a time on the number line.', 'Find where a mixed sequence stops counting forward.', 'Paste the cards so the finished row is in order.'],
    tip: 'Have the learner read the completed row from left to right. If every step increases by one, the cards are in the correct places.'
  }
];

const escapeHtml = value => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

function replaceOne(html, pattern, replacement, label) {
  if (!pattern.test(html)) throw new Error(`Could not replace ${label}`);
  return html.replace(pattern, replacement);
}

function alternates(canonical) {
  return [
    ['en', canonical],
    ['ko', `${site}/ko/`],
    ['ja', `${site}/ja/`],
    ['fr', `${site}/fr/`],
    ['de', `${site}/de/`],
    ['x-default', `${site}/`]
  ].map(([lang, href]) => `<link rel="alternate" hreflang="${lang}" href="${href}">`).join('');
}

function resource(entry) {
  const otherPages = entries.filter(item => item.slug !== entry.slug).slice(0, 5);
  return `<section class="seo-resource" aria-label="${escapeHtml(entry.title)} guide"><h2>Free printable ${escapeHtml(entry.title.toLowerCase())}</h2><p>${escapeHtml(entry.summary)} This page makes a real worksheet in the browser, so <strong>New problems</strong> creates another set instead of showing a fixed download.</p><p><strong>${escapeHtml(entry.level)} · ${escapeHtml(entry.standards)}.</strong> The worksheet and its matching answer key are free to print for home, classroom, tutoring, or math centers.</p><h3>What children do</h3><ul>${entry.activities.map(activity => `<li>${escapeHtml(activity)}</li>`).join('')}</ul><p>${escapeHtml(entry.tip)}</p><h3>Print the activity and answer key</h3><p>Choose <strong>Worksheet</strong> for the student page and <strong>Answer key</strong> to preview the same pictures, cards, and numbers with answers. In Print selection, select either page or both. The print layout fits US Letter and A4 paper, and the browser print dialog can save the pages as a PDF.</p><h3>Scissor and paste routine</h3><p>Let an adult help with scissors when needed. Solve each task before gluing so a card can still be moved. The dotted borders identify the cut-out cards, and the larger dashed boxes are the spaces where answers belong. After checking, paste the cards and ask the learner to explain one match or number pattern.</p><h3>More early math worksheets</h3><ul>${otherPages.map(item => `<li><a href="/en/${item.slug}.html">${escapeHtml(item.title)}</a></li>`).join('')}<li><a href="/en/kindergarten.html">Kindergarten math worksheets</a></li><li><a href="/en/number-sense-worksheets.html">Number sense worksheets for K-2</a></li><li><a href="/en/early-math-activities.html">Hands-on math worksheets for kids</a></li></ul></section>`;
}

function build(entry, template) {
  const canonical = `${site}/en/${entry.slug}.html`;
  let html = template;
  html = replaceOne(html, /<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(entry.title)} | Googoodan</title>`, 'title');
  html = replaceOne(html, /<meta name="description" content="[^"]*">/i, `<meta name="description" content="${escapeHtml(entry.description)}">`, 'description');
  html = replaceOne(html, /<link rel="canonical" href="[^"]*">/i, `<link rel="canonical" href="${canonical}">`, 'canonical');
  html = html.replace(/<link rel="alternate" hreflang="[^"]+" href="[^"]*">/gi, '');
  html = html.replace('</head>', `${alternates(canonical)}</head>`);
  if (!/<meta name="robots"/i.test(html)) html = html.replace('</head>', '<meta name="robots" content="index,follow"></head>');
  html = html.replace(/<meta property="og:title" content="[^"]*">/i, `<meta property="og:title" content="${escapeHtml(entry.title)}">`)
    .replace(/<meta property="og:description" content="[^"]*">/i, `<meta property="og:description" content="${escapeHtml(entry.description)}">`)
    .replace(/<meta property="og:url" content="[^"]*">/i, `<meta property="og:url" content="${canonical}">`)
    .replace(/<meta property="og:image(?::[^"]*)?" content="[^"]*">/gi, '')
    .replace(/<meta name="twitter:card" content="[^"]*">/gi, '');
  const website = {'@context': 'https://schema.org', '@type': 'WebSite', '@id': `${site}/#website`, name: 'googoodan', alternateName: '구구단닷컴', url: `${site}/`};
  const learning = {'@context': 'https://schema.org', '@type': 'LearningResource', name: entry.title, description: entry.description, url: canonical, inLanguage: 'en-US', educationalLevel: entry.level, learningResourceType: 'Cut-and-paste worksheet', isAccessibleForFree: true, teaches: entry.standards};
  html = replaceOne(html, /<script id="website-identity" type="application\/ld\+json">[\s\S]*?<\/script>/i, `<script id="website-identity" type="application/ld+json">${JSON.stringify(website)}</script>`, 'website JSON-LD');
  html = replaceOne(html, /<script type="application\/ld\+json">[\s\S]*?<\/script>/i, `<script type="application/ld+json">${JSON.stringify(learning)}</script>`, 'resource JSON-LD');
  html = html.replace('<script defer src="/en/regional-english.js?v=20260913-maths-switch"></script>', `<script defer src="/en/banks/cut-and-paste.js?v=${version}"></script><script defer src="/en/regional-english.js?v=20260913-maths-switch"></script>`);
  html = html.replace('<link rel="stylesheet" href="/en/banks/early-activities.css?v=20260911-early-activities"><script defer src="/en/banks/early-activity-controls.js?v=20260911-early-activities"></script>', `<link rel="stylesheet" href="/en/banks/early-activities.css?v=20260911-early-activities"><link rel="stylesheet" href="/en/banks/cut-and-paste.css?v=${version}"><script defer src="/en/banks/cut-and-paste-controls.js?v=${version}"></script>`);
  html = replaceOne(html, /<body data-type="[^"]+"/, `<body data-type="${entry.slug}"`, 'body type');
  html = replaceOne(html, /<aside><h1>[\s\S]*?<\/h1>/i, `<aside><h1>${escapeHtml(entry.title)}</h1>`, 'H1');
  html = replaceOne(html, /<h2 id="sheet-title">[\s\S]*?<\/h2>/i, `<h2 id="sheet-title">${escapeHtml(entry.title)}</h2>`, 'sheet title');
  html = replaceOne(html, /<p class="instructions" id="instructions">[\s\S]*?<\/p>/i, `<p class="instructions" id="instructions">${escapeHtml(entry.summary)}</p>`, 'instructions');
  html = replaceOne(html, /<section class="seo-resource"[\s\S]*?<\/section><\/body>/i, `${resource(entry)}</body>`, 'SEO resource');
  return {html, canonical};
}

const template = fs.readFileSync(templateFile, 'utf8');
const manifest = {version, count: entries.length, pages: []};
for (const entry of entries) {
  const built = build(entry, template);
  fs.writeFileSync(path.join(enDir, `${entry.slug}.html`), built.html, 'utf8');
  manifest.pages.push({...entry, file: `${entry.slug}.html`, canonical: built.canonical});
}
fs.writeFileSync(path.join(enDir, 'cut-and-paste-manifest.json'), JSON.stringify(manifest, null, 2) + '\n', 'utf8');
console.log(`Built ${entries.length} cut-and-paste worksheet pages.`);
