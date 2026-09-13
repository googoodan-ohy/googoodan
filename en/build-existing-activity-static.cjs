'use strict';
const fs = require('fs');
const path = require('path');

const enDir = __dirname;
const outDir = path.join(enDir, 'print', 'activity');
const site = 'https://googoodan.com';
const version = '20260913-existing-activity-static';

const entries = [
  entry('kindergarten-count-and-write', 'count-and-circle.html', 'early', 'count',
    'Count and Write Worksheets for Kindergarten',
    'Free printable count and write worksheets for kindergarten. Children count familiar pictures, write each total, make new sets, and print matching answer keys.',
    'Kindergarten', 'K.CC.B.4–5',
    'Count each picture once, then write how many you see.',
    'Children connect a spoken counting sequence to a set they can see. Each page uses familiar picture groups and leaves a clear space for the numeral.',
    'Ask the learner to touch or point to each picture while counting. A second count in a different order is a useful way to check that the total stays the same.'),
  entry('circle-the-correct-number-of-pictures', 'count-and-circle.html', 'early', 'mark',
    'Circle the Correct Number of Pictures Worksheets',
    'Free printable kindergarten worksheets for circling a given number of pictures. Generate fresh visual counting practice and print a matching answer key.',
    'Kindergarten', 'K.CC.B.4–5',
    'Read the number, then circle exactly that many pictures.',
    'This activity asks children to make a set of a stated size instead of only counting a finished set. More than one choice of pictures can be correct.',
    'After circling, count the chosen pictures again and compare the total with the target number. Encourage a neat loop around the whole selected group.'),
  entry('compare-picture-groups-kindergarten', 'count-and-circle.html', 'early', 'compare',
    'Compare Picture Groups Worksheets for Kindergarten',
    'Free printable compare picture groups worksheets for kindergarten. Count two visual sets, find which has more, and print fresh practice with answers.',
    'Kindergarten', 'K.CC.C.6',
    'Count both groups, then circle the group that has more.',
    'Visual comparison helps children give meaning to more, fewer, and equal. The groups change whenever a new worksheet is generated.',
    'Have the learner count each group before deciding. Pairing one object from group A with one from group B can make the comparison visible without guessing.'),
  entry('number-word-matching-kindergarten', 'number-matching.html', 'early', 'words',
    'Number Word Matching Worksheets for Kindergarten',
    'Free printable number word matching worksheets for kindergarten. Match numerals to number words, create new activities, and print the answer key.',
    'Kindergarten', 'K.CC.A.3',
    'Draw a line from each numeral to the matching number word.',
    'The page links written numerals with common English number words. It works well after children can count the same quantities with objects.',
    'Read each word aloud first if needed. Then ask the learner to trace each matching line with a finger before drawing it with a pencil.'),
  entry('ordering-number-cards-kindergarten', 'number-matching.html', 'early', 'order',
    'Ordering Numbers Worksheets for Kindergarten',
    'Free printable ordering numbers worksheets for kindergarten. Put number cards from least to greatest, generate a new set, and print answers.',
    'Kindergarten', 'K.CC.A.1–2',
    'Write the number cards in order from smallest to greatest.',
    'Ordering cards strengthens the counting sequence and shows how each next number represents one more. Each generated sheet uses a fresh set.',
    'Let the learner say the counting sequence aloud and locate the smallest card first. Check the finished row by reading it from left to right.'),
  entry('ordinal-numbers-kindergarten', 'number-order-activities.html', 'early', 'ordinal',
    'Ordinal Numbers Worksheets for Kindergarten',
    'Free printable ordinal numbers worksheets for kindergarten. Count positions from the left, circle the requested picture, and print matching answers.',
    'Kindergarten', 'K.CC.B.4',
    'Start at the left and circle the picture in the named position.',
    'Ordinal language describes position rather than quantity. Children count in a fixed direction and identify first, second, third, and later places.',
    'Point out the starting side before counting. Ask the learner to name the positions along the row and then circle only the requested picture.'),
  entry('before-and-after-numbers', 'number-order-activities.html', 'early', 'neighbors',
    'Before and After Numbers Worksheets',
    'Free printable before and after numbers worksheets for kindergarten and first grade. Fill neighboring numbers, make new sets, and print answer keys.',
    'Kindergarten–Grade 1', 'K.CC.A.1; 1.NBT.A.1',
    'Write the number that comes immediately before and after.',
    'Finding neighboring numbers builds a flexible understanding of the counting sequence. Each item focuses on one center number and its two neighbors.',
    'If a child hesitates, begin counting a few numbers earlier and stop a few numbers later. Then reread the completed three-number sequence.'),
  entry('missing-numbers-on-a-number-line', 'number-order-activities.html', 'early', 'line',
    'Missing Numbers on a Number Line Worksheets',
    'Free printable missing numbers on a number line worksheets for kindergarten and first grade. Complete counting sequences and print matching answers.',
    'Kindergarten–Grade 1', 'K.CC.A.1–2; 1.NBT.A.1',
    'Follow the number line and fill in the missing number.',
    'A number line gives children a spatial model of the counting sequence. Moving one step to the right means one more.',
    'Ask the learner to point to each tick while saying the numbers. Check that the missing numeral fits both the number before it and the number after it.'),
  entry('fix-the-number-order', 'number-order-activities.html', 'early', 'repair',
    'Fix the Number Order Worksheets',
    'Free printable number order worksheets for kindergarten and first grade. Find two misplaced number cards, correct the sequence, and check answers.',
    'Kindergarten–Grade 1', 'K.CC.A.1–2; 1.NBT.A.1',
    'Find the two cards that are out of order and write the numbers to swap.',
    'Error spotting makes children inspect every step of a sequence. The task goes beyond copying because the learner must explain where the order breaks.',
    'Read the cards aloud from left to right. Mark the first place where the count stops increasing by one, then test the proposed swap.'),
  entry('complete-the-ten-frame', 'ten-frame-activities.html', 'early', 'ten-frame',
    'Complete the Ten Frame Worksheets',
    'Free printable complete the ten frame worksheets for kindergarten. Draw missing dots to make 10, generate fresh frames, and print answer keys.',
    'Kindergarten', 'K.OA.A.4',
    'Draw dots in the empty boxes to complete a full ten frame.',
    'A ten frame makes the distance from a number to 10 visible. Children can see filled spaces, empty spaces, and the complete group together.',
    'Have the learner count the existing dots, then the empty boxes. The number of added dots should combine with the starting number to make 10.'),
  entry('make-10-missing-number', 'ten-frame-activities.html', 'early', 'ten-missing',
    'Make 10 Missing Number Worksheets',
    'Free printable make 10 missing number worksheets with ten frames. Find the partner for 10, change the numbers, and print a matching answer key.',
    'Kindergarten–Grade 1', 'K.OA.A.4; 1.OA.C.6',
    'Use the ten frame to find the missing number that makes 10.',
    'The activity builds the number pairs that compose 10. These facts later support mental addition and subtraction within 20.',
    'Encourage the learner to describe both parts: how many spaces are filled and how many are empty. Say the full equation aloud after writing it.'),
  entry('pairs-that-make-10', 'ten-frame-activities.html', 'early', 'pair-ten',
    'Pairs That Make 10 Worksheets',
    'Free printable pairs that make 10 worksheets for first grade. Circle two numbers that make ten, solve the total, and print matching answers.',
    'Grade 1', '1.OA.C.6',
    'Circle a pair that makes 10, then add the remaining number.',
    'Making 10 is an efficient strategy for adding three small numbers. The learner first identifies a friendly pair and then finishes the sum.',
    'Ask which two numbers belong together and why. After solving, check that the circled pair totals exactly 10 before adding the number left over.'),
  entry('picture-addition-first-grade', 'picture-addition.html', 'early', 'picture-add',
    'Picture Addition Worksheets for 1st Grade',
    'Free printable picture addition worksheets for first grade. Count two groups, complete an addition sentence, create new sets, and print answers.',
    'Grade 1', '1.OA.A.1; 1.OA.C.6',
    'Count each picture group and complete the addition sentence.',
    'Pictures connect the action of joining groups with a written addition equation. The same structure appears with different familiar objects.',
    'Count the two groups separately before counting them together. Ask the learner to point to the number in the equation that represents each group.'),
  entry('make-10-addition-strategy', 'picture-addition.html', 'early', 'bridge-add',
    'Make 10 Addition Strategy Worksheets',
    'Free printable make 10 addition strategy worksheets for first grade. Decompose an addend, bridge through 10, generate new problems, and print answers.',
    'Grade 1', '1.OA.C.6',
    'Split the second addend to make 10 first, then add what remains.',
    'Bridging through 10 turns a difficult fact into a known combination and one small addition. The visual boxes show how the second addend is decomposed.',
    'Ask how much the first number needs to reach 10. That amount becomes one part of the second addend; the remaining part is added after 10 is made.'),
  entry('addition-color-by-number-within-20', 'color-by-number.html', 'color', 'add-small',
    'Addition Color by Number Worksheets Within 20',
    'Free printable addition color by number worksheets within 20. Solve each fact, use the color key, generate new mosaics, and print answers.',
    'Grades 1–2', '1.OA.C.6; 2.OA.B.2',
    'Solve each addition fact, then color the square using its answer range.',
    'This page combines addition fluency with a simple coloring code. Sixteen facts create a short independent practice activity rather than a long drill.',
    'Have the learner solve all facts lightly in pencil before coloring. Check an answer against the key once, then use the same range consistently.'),
  entry('multiplication-color-by-number', 'color-by-number.html', 'color', 'multiply-one',
    'Multiplication Color by Number Worksheets',
    'Free printable multiplication color by number worksheets. Practice basic facts, follow the answer-range key, make a new mosaic, and print answers.',
    'Grade 3', '3.OA.C.7',
    'Solve each multiplication fact, then color the square using its answer range.',
    'A compact color code gives students a reason to check each multiplication fact. A new set changes the facts while keeping the familiar routine.',
    'Solve before coloring so the picture does not become a guessing clue. When a color seems wrong, recalculate that fact and compare it with the range key.'),
  entry('telling-time-hour-and-half-hour', 'telling-time.html', 'coverage', 'clock:30',
    'Telling Time to the Hour and Half Hour Worksheets',
    'Free printable telling time to the hour and half hour worksheets for first grade. Read analog clocks, generate new times, and print matching answers.',
    'Grade 1', '1.MD.B.3',
    'Read the hour hand and minute hand, then write the time.',
    'The clocks use whole hours and half hours so beginners can focus on the two hands. Each new worksheet produces another set of analog clock faces.',
    'Read the shorter hour hand first. For a half hour, explain that the hour hand sits between two numbers while the minute hand points to 6.'),
  entry('commutative-property-arrays', 'multiplication-arrays.html', 'reasoning', 'm:commute',
    'Commutative Property Arrays Worksheets',
    'Free printable commutative property arrays worksheets. Read one array in two directions, write both multiplication equations, and print answers.',
    'Grade 3', '3.OA.B.5',
    'Read each array by rows and by columns, then write both multiplication equations.',
    'This is the one multiplication-array mode that does not duplicate the Grade 2 equal-groups activity. Students use the same array to see why changing factor order keeps the product.',
    'Ask the learner to describe rows first and columns second. Both equations must name the same total even though the factors change places.')
];

function entry(slug, source, control, mode, title, description, grade, standard, instruction, purpose, tip) {
  return {slug, source, control, mode, title, description, grade, standard, instruction, purpose, tip};
}

function escapeHtml(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

function replaceOne(text, pattern, replacement, label) {
  if (!pattern.test(text)) throw new Error('Could not replace ' + label);
  return text.replace(pattern, replacement);
}

function staticResource(e) {
  const title = escapeHtml(e.title);
  return `<section class="seo-resource" aria-label="${title} guide"><h2>${title}: free printable practice</h2><p>${escapeHtml(e.description)}</p><p><strong>${escapeHtml(e.grade)} · ${escapeHtml(e.standard)}.</strong> ${escapeHtml(e.purpose)}</p><h3>What children do</h3><p>${escapeHtml(e.instruction)} Use <strong>New problems</strong> to create another printable set while keeping the same activity and level.</p><h3>Use the worksheet and answer key</h3><p>${escapeHtml(e.tip)} Switch to <strong>Answer key</strong> to check the exact same pictures and numbers. Choose the worksheet, the answer key, or both in the print controls. The activity is free to print for home or classroom use and is designed to fit on one US Letter or A4 page.</p><h3>Build understanding</h3><p>Keep the first session short and let the child explain one answer in words. A correct explanation shows whether the picture, number, or model makes sense. Generate a new set for another day instead of repeating memorized positions.</p><p><a href="/en/early-math-activities.html">Explore more hands-on math worksheets for kids</a> · <a href="/en/worksheets.html">Browse all printable math worksheets</a> · <a href="/en/help.html">Printing and PDF help</a></p></section>`;
}

function makePage(e) {
  let html = fs.readFileSync(path.join(enDir, e.source), 'utf8');
  const canonical = `${site}/en/print/activity/${e.slug}.html`;
  html = replaceOne(html, /<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(e.title)} | Googoodan</title>`, 'title');
  html = replaceOne(html, /<meta name="description" content="[^"]*">/i, `<meta name="description" content="${escapeHtml(e.description)}">`, 'description');
  html = replaceOne(html, /<link rel="canonical" href="[^"]*">/i, `<link rel="canonical" href="${canonical}">`, 'canonical');
  html = html.replace(/<link rel="alternate" hreflang="[^"]+" href="[^"]*">/gi, '');
  const alternates = `<link rel="alternate" hreflang="en" href="${canonical}"><link rel="alternate" hreflang="ko" href="${site}/ko/"><link rel="alternate" hreflang="ja" href="${site}/ja/"><link rel="alternate" hreflang="fr" href="${site}/fr/"><link rel="alternate" hreflang="de" href="${site}/de/"><link rel="alternate" hreflang="x-default" href="${site}/">`;
  html = html.replace('</head>', `${alternates}<script defer src="/en/activity-entry.js?v=${version}"></script></head>`);
  html = html.replace(/<meta property="og:title" content="[^"]*">/i, `<meta property="og:title" content="${escapeHtml(e.title)}">`)
    .replace(/<meta property="og:description" content="[^"]*">/i, `<meta property="og:description" content="${escapeHtml(e.description)}">`)
    .replace(/<meta property="og:url" content="[^"]*">/i, `<meta property="og:url" content="${canonical}">`)
    .replace(/<meta property="og:image(?::[^"]*)?" content="[^"]*">/gi, '')
    .replace(/<meta name="twitter:card" content="[^"]*">/gi, '');
  html = html.replace(/<script id="website-identity" type="application\/ld\+json">[\s\S]*?<\/script>/i,
    `<script id="website-identity" type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'WebSite','@id':site+'/#website',name:'googoodan',alternateName:'구구단닷컴',url:site+'/'})}</script>`);
  html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/i,
    `<script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'LearningResource',name:e.title,description:e.description,url:canonical,inLanguage:'en-US',educationalLevel:e.grade,learningResourceType:'Activity worksheet',isAccessibleForFree:true,teaches:e.standard})}</script>`);
  html = html.replace(/<body([^>]*)>/i, (match, attrs) => `<body${attrs} data-activity-entry-mode="${escapeHtml(e.mode)}" data-activity-entry-control="${e.control}" data-activity-entry-title="${escapeHtml(e.title)}" data-activity-entry-description="${escapeHtml(e.description)}" data-activity-entry-canonical="${canonical}" data-activity-entry-instruction="${escapeHtml(e.instruction)}">`);
  html = replaceOne(html, /<aside><h1>[\s\S]*?<\/h1>/i, `<aside><h1>${escapeHtml(e.title)}</h1>`, 'H1');
  html = replaceOne(html, /<h2 id="sheet-title">[\s\S]*?<\/h2>/i, `<h2 id="sheet-title">${escapeHtml(e.title)}</h2>`, 'sheet title');
  html = replaceOne(html, /<p class="instructions" id="instructions">[\s\S]*?<\/p>/i, `<p class="instructions" id="instructions">${escapeHtml(e.instruction)}</p>`, 'instructions');
  html = replaceOne(html, /<section class="seo-resource"[\s\S]*?<\/section><\/body>/i, staticResource(e) + '</body>', 'SEO body');
  html = html.replace(/href="style\.css/g, 'href="/en/style.css')
    .replace(/src="types\.js/g, 'src="/en/types.js')
    .replace(/src="curriculum\.js/g, 'src="/en/curriculum.js')
    .replace(/src="app\.js/g, 'src="/en/app.js')
    .replace(/href="legal\.css/g, 'href="/en/legal.css')
    .replace(/<a class="logo" href="index\.html">/g, '<a class="logo" href="/en/">')
    .replace(/href="(about|contact|privacy|terms)\.html"/g, 'href="/en/$1.html"')
    .replace(/href="index\.html"/g, 'href="/en/"');
  return {html, canonical};
}

fs.mkdirSync(outDir, {recursive: true});
const manifest = {version, generatedAt: new Date().toISOString(), count: entries.length, pages: []};
for (const e of entries) {
  const {html, canonical} = makePage(e);
  const file = path.join(outDir, e.slug + '.html');
  fs.writeFileSync(file, html, 'utf8');
  manifest.pages.push({...e, file: path.relative(enDir, file).replaceAll('\\', '/'), canonical});
}
fs.writeFileSync(path.join(enDir, 'existing-activity-static-manifest.json'), JSON.stringify(manifest, null, 2) + '\n', 'utf8');
console.log(`Generated ${entries.length} existing activity entry pages in ${path.relative(enDir, outDir)}.`);
