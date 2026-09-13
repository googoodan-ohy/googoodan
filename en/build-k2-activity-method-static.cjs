'use strict';
const fs = require('fs');
const path = require('path');
const {definitions, labels} = require('./banks/k2-activities.js');

const enDir = __dirname;
const outDir = path.join(enDir, 'print', 'hands-on');
const site = 'https://googoodan.com';
const version = '20260913-k2-activity-methods';

const details = {
  'number-bond': d('missing-part-number-bonds', 'Missing Part Number Bond Worksheets', 'Find the missing part in each number bond and check that both parts make the whole.', 'Use counters to build the whole, cover one part, and count what remains.'),
  'make-whole': d('draw-missing-part-number-bonds', 'Draw the Missing Part Number Bond Worksheets', 'Draw the missing dots that complete each whole, then write the missing part.', 'Count the known part first and add one dot at a time until the whole is reached.'),
  'base-ten-read': d('read-base-ten-blocks', 'Read Base Ten Blocks Worksheets', 'Count tens rods and ones cubes, then write the two-digit number and expanded value.', 'Count the rods by tens before counting the single cubes; say the number as tens and ones.'),
  'base-ten-build': d('build-numbers-base-ten-blocks', 'Build Numbers with Base Ten Blocks Worksheets', 'Read each number and draw tens rods and ones cubes to build it.', 'Break the number into tens and ones before drawing quick rods and cubes in the workspace.'),
  'skip-2': d('hundreds-chart-skip-counting-by-2', 'Hundreds Chart Skip Counting by 2 Worksheets', 'Color every second number on a 1–100 chart and describe the pattern.', 'Start at 2 and add 2 each time; notice the repeating ones digits in each row.'),
  'skip-5': d('hundreds-chart-skip-counting-by-5', 'Hundreds Chart Skip Counting by 5 Worksheets', 'Color every fifth number on a 1–100 chart and describe the pattern.', 'Count by fives from 5 and look for numbers ending in 5 or 0.'),
  'skip-10': d('hundreds-chart-skip-counting-by-10', 'Hundreds Chart Skip Counting by 10 Worksheets', 'Color every tenth number on a 1–100 chart and describe the pattern.', 'Move down the chart by tens and notice that every selected number ends in 0.'),
  'number-line-add': d('addition-number-line-shown-jumps', 'Addition on a Number Line with Jumps Worksheets', 'Follow the shown rightward jump and complete each addition equation within 20.', 'Point to the starting number, count the spaces in the jump, and name the landing number.'),
  'number-line-add-draw': d('draw-jumps-number-line-addition', 'Draw Jumps to Add on a Number Line Worksheets', 'Draw rightward jumps on the number line to solve addition within 20.', 'Mark the start first, draw one space for each count, and circle the endpoint.'),
  'number-line-sub': d('subtraction-number-line-shown-jumps', 'Subtraction on a Number Line with Jumps Worksheets', 'Follow the shown leftward jump and complete each subtraction equation within 20.', 'Begin at the larger number, count spaces to the left, and check the landing point.'),
  'number-line-sub-draw': d('draw-jumps-number-line-subtraction', 'Draw Jumps to Subtract on a Number Line Worksheets', 'Draw leftward jumps on the number line to solve subtraction within 20.', 'Place a dot on the starting number and move left one space for every one taken away.'),
  'missing-addend': d('missing-addends-first-grade', 'Missing Addend Worksheets for 1st Grade', 'Find the missing addend in equations within 20 and verify each completed equation.', 'Build the known part and count on to the total, or use the related subtraction fact.'),
  'missing-start': d('missing-start-number-addition', 'Missing Start Number Addition Worksheets', 'Find the unknown starting number in addition equations within 20.', 'Subtract the shown addend from the total, then put the answer back into the equation.'),
  'missing-subtrahend': d('missing-subtrahends-first-grade', 'Missing Subtrahend Worksheets for 1st Grade', 'Find the unknown number taken away in subtraction equations within 20.', 'Compare the starting amount and the amount left to find how many were removed.'),
  'true-false': d('true-false-equations-first-grade', 'True or False Addition and Subtraction Worksheets', 'Decide whether each addition or subtraction equation is true or false.', 'Work out both sides before deciding; the equal sign means both values must be the same.'),
  'fix-equation': d('fix-equations-first-grade', 'Fix the Equation Worksheets for 1st Grade', 'Find the error in each equation and write a corrected equation.', 'Recalculate the left side, compare it with the shown result, and change only what is wrong.'),
  'read-clock': d('read-clocks-five-minutes', 'Read Clock Worksheets to 5 Minutes', 'Read each analog clock and write the time to the nearest five minutes.', 'Read the short hour hand first, then count by fives around the clock for the minutes.'),
  'draw-hands': d('draw-clock-hands-five-minutes', 'Draw Clock Hands Worksheets to 5 Minutes', 'Read each digital time and draw the matching hour and minute hands.', 'Make the minute hand longer and place the hour hand between numbers when the minutes require it.'),
  'count-coins': d('find-value-us-coins', 'Find the Value of US Coins Worksheets', 'Count pennies, nickels, dimes, and quarters and write each total in cents.', 'Name every coin, start with the greatest value, and count on before adding the cent sign.'),
  'make-cents': d('make-amount-us-coins', 'Make an Amount with US Coins Worksheets', 'Circle a group of US coins that makes each target amount in cents.', 'Try the largest useful coin first, then count on with smaller coins to reach the exact amount.'),
  'shade-fraction': d('shade-fractions-equal-parts', 'Shade Fractions Worksheets for 1st and 2nd Grade', 'Shade the requested fraction of each equal-part model.', 'Use the denominator to count all equal parts and the numerator to count how many to shade.'),
  'name-fraction': d('name-shaded-fractions', 'Name the Shaded Fraction Worksheets', 'Look at each equal-part model and write the fraction that is shaded.', 'Count all equal parts for the denominator, then count only shaded parts for the numerator.'),
  'equal-groups': d('equal-groups-second-grade', 'Equal Groups Worksheets for 2nd Grade', 'Count equal groups and write a repeated-addition equation for the total.', 'Check that every group has the same number before adding that amount repeatedly.'),
  'array-count': d('rows-columns-arrays-second-grade', 'Rows and Columns Array Worksheets for 2nd Grade', 'Count rows and columns in each array and write repeated addition.', 'Read the array by rows first, then turn the description to see the same total by columns.'),
  'picture-number-match': d('match-picture-quantities-numbers', 'Match Picture Quantities to Numbers Worksheets', 'Count each picture group and draw a line to the matching numeral.', 'Touch each picture once while counting and check that every group and number is used once.'),
  'ten-frame-match': d('match-ten-frames-numbers', 'Match Ten Frames to Numbers Worksheets', 'Count the dots in each ten frame and match the frame to its numeral.', 'See a full row as five, then count on instead of beginning at one every time.'),
  'trace-number': d('trace-numbers-zero-to-twenty', 'Trace Numbers 0 to 20 Worksheets', 'Trace each dotted numeral and write the same number independently.', 'Start each numeral at the top and follow the same stroke direction before writing without the guide.'),
  'count-trace': d('count-and-trace-numbers', 'Count and Trace Numbers Worksheets', 'Count a picture group, trace its numeral, and write the number.', 'Count the objects first so the traced symbol stays connected to the quantity it represents.'),
  'connect-dots-10': d('number-dot-to-dot-one-to-ten', 'Number Dot to Dot 1 to 10 Worksheets', 'Connect numbered dots from 1 to 10 in counting order.', 'Say each number before drawing to the next dot and stop to check that none were skipped.'),
  'connect-dots-20': d('number-dot-to-dot-one-to-twenty', 'Number Dot to Dot 1 to 20 Worksheets', 'Connect numbered dots from 1 to 20 in counting order.', 'Keep the pencil on the sequence, naming each number and checking the teen numbers carefully.'),
  'extend-pattern': d('complete-repeating-patterns', 'Complete the Repeating Pattern Worksheets', 'Find the repeating unit and draw the shapes that come next.', 'Say the smallest repeating unit aloud before extending it; this prevents position guessing.'),
  'find-pattern-error': d('find-pattern-errors', 'Find the Pattern Error Worksheets', 'Find the shape that breaks each repeating pattern and correct it.', 'Mark the repeating unit, compare every group with it, and replace the first item that does not fit.'),
  'find-shape': d('find-and-circle-shapes', 'Find and Circle Shapes Worksheets', 'Find every named two-dimensional shape and circle it.', 'Trace each outline and use defining attributes such as straight sides and corners, even when a shape is turned.'),
  'sort-by-sides': d('sort-shapes-by-sides', 'Sort Shapes by Number of Sides Worksheets', 'Count sides and sort two-dimensional shapes into the correct groups.', 'Count only straight edges and explain why circles belong in the group with no straight sides.'),
  'combine-shapes': d('combine-shapes-new-shapes', 'Combine Shapes to Make New Shapes Worksheets', 'Decide which larger shape can be made from the shown small shapes.', 'Imagine sliding and turning pieces so their edges meet without gaps or overlaps.'),
  'shape-puzzle': d('shape-composition-puzzles', 'Shape Composition Puzzle Worksheets', 'Choose the set of pieces that can compose each target shape.', 'Compare outside boundaries and test how shared edges disappear when pieces are joined.'),
  'measure-cubes': d('measure-length-unit-cubes', 'Measure Length with Cubes Worksheets', 'Count equal unit cubes to measure the length of each pictured object.', 'Check that cubes touch with no gaps or overlaps and that the first cube starts at the endpoint.'),
  'compare-lengths': d('compare-lengths-first-grade', 'Compare Lengths Worksheets for 1st Grade', 'Compare two lengths measured with the same-size unit cubes.', 'Line up the starting points, count both rows, and subtract to tell how much longer one is.'),
  'build-picture-graph': d('create-picture-graphs', 'Create Picture Graphs Worksheets', 'Use a small data set to draw one picture for each item in a picture graph.', 'Read each category and count before drawing evenly spaced symbols; one symbol represents one item.'),
  'answer-picture-graph': d('read-answer-picture-graphs', 'Read and Answer Picture Graph Worksheets', 'Read a completed picture graph and answer a comparison question.', 'Find the requested rows, count their symbols, and use the difference when the question asks how many more.'),
  'read-tallies': d('read-tally-marks', 'Read Tally Marks Worksheets', 'Count groups of tally marks and write the number they represent.', 'Count each crossed bundle as five, then add any single marks that remain.'),
  'write-tallies': d('write-tally-marks', 'Write Tally Marks Worksheets', 'Draw tally marks to represent each given number.', 'Draw four upright marks and cross them with the fifth before beginning another group.'),
  'color-odd': d('color-odd-numbers', 'Color the Odd Numbers Worksheets', 'Find and color odd numbers from 1 to 20.', 'Pair counters for each number; one counter left without a partner shows that the number is odd.'),
  'color-even': d('color-even-numbers', 'Color the Even Numbers Worksheets', 'Find and color even numbers from 1 to 20.', 'Make pairs with counters; a number is even when every counter has a partner.'),
  'skip-path-2': d('skip-counting-by-twos-paths', 'Skip Counting by 2s Path Worksheets', 'Follow touching boxes that increase by 2 from START to FINISH.', 'Add 2 before looking for the next box and move only up, down, left, or right.'),
  'skip-path-5': d('skip-counting-by-fives-paths', 'Skip Counting by 5s Path Worksheets', 'Follow touching boxes that increase by 5 from START to FINISH.', 'Look for the next number ending in 5 or 0 and move only to an adjacent box.'),
  'skip-path-10': d('skip-counting-by-tens-paths', 'Skip Counting by 10s Path Worksheets', 'Follow touching boxes that increase by 10 from START to FINISH.', 'Keep the ones digit unchanged while adding one ten at every step.'),
  'addition-maze-10': d('addition-maze-within-ten', 'Addition Maze Worksheets Within 10', 'Solve addition facts and follow only boxes that equal the target within 10.', 'Solve every nearby fact before drawing a path so the route comes from arithmetic rather than guessing.'),
  'addition-maze-20': d('addition-facts-to-twenty-maze', 'Addition Facts to 20 Math Maze Worksheets', 'Solve addition facts and follow only boxes that equal the target within 20.', 'Mark correct sums lightly, then connect adjacent boxes from START to FINISH.'),
  'fact-family': d('addition-subtraction-fact-families', 'Addition and Subtraction Fact Family Worksheets', 'Use three related numbers to write two addition and two subtraction facts.', 'Keep the whole in the roof and use the two parts in both orders for addition.'),
  'missing-fact-family': d('missing-number-fact-family-houses', 'Missing Number Fact Family House Worksheets', 'Find the missing number in each fact house, then write all four related facts.', 'Identify whether the blank is a part or the whole before using addition or subtraction to fill it.')
};

function d(slug, title, instruction, tip) {
  return {slug, title, instruction, tip};
}

function escapeHtml(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

function replaceOne(text, pattern, replacement, label) {
  if (!pattern.test(text)) throw new Error('Could not replace ' + label);
  return text.replace(pattern, replacement);
}

function descriptionFor(entry) {
  const subject = entry.title.replace(/ Worksheets(?: for .*)?$/i, ' worksheets').toLowerCase();
  return `Free printable ${subject}. ${entry.instruction} Generate fresh practice and print the matching answer key.`;
}

function resource(entry, definition, description) {
  const parentUrl = `/en/${definition.id}.html`;
  const activityName = labels[entry.method];
  return `<section class="seo-resource" aria-labelledby="resource-heading"><h2 id="resource-heading">${escapeHtml(entry.title)}: printable activity guide</h2><p id="resource-description">${escapeHtml(description)}</p><p><strong>${escapeHtml(definition.level)} · ${escapeHtml(definition.standard)}.</strong> This page opens one focused activity: <strong>${escapeHtml(activityName)}</strong>. The pictures, numbers, models, and answers come from the same tested worksheet generator as the full activity collection.</p><h3>What children do</h3><p>${escapeHtml(entry.instruction)} The task stays consistent across the page, while <strong>New problems</strong> changes the numbers or pictures for another practice set.</p><h3>How the activity supports learning</h3><p>${escapeHtml(entry.tip)} Ask the child to describe one answer in words. A short explanation helps show whether the model and the math make sense together.</p><h3>Print the worksheet and answer key</h3><p>Preview the <strong>Worksheet</strong> first, then switch to <strong>Answer key</strong> to check the exact same set. The question order, pictures, and numbers remain aligned. In the print controls, choose the worksheet, the answer key, or both. Each selected page is designed to fit on one US Letter or A4 sheet and can also be saved as a PDF from the browser print dialog.</p><p>This free printable is suitable for short home practice, tutoring, math centers, or an independent classroom station. Begin with one page, use concrete objects or crayons when the direction calls for them, and generate a new set on another day. Accuracy and an explanation matter more than speed for these early math activities.</p><p><a href="${parentUrl}">Open the mixed ${escapeHtml(definition.title.toLowerCase())}</a> · <a href="/en/early-math-activities.html">Browse hands-on math worksheets</a> · <a href="/en/worksheets.html">Browse all printable math worksheets</a> · <a href="/en/help.html">Printing and PDF help</a></p><p id="resource-example">${escapeHtml(activityName)} · ${escapeHtml(definition.example)}.</p><p id="resource-instruction">Generate, preview, and print this activity with its matching answer key.</p><ul id="resource-related"><li><a href="${parentUrl}">${escapeHtml(definition.title)}</a></li><li><a href="/en/kindergarten.html">Kindergarten math worksheets</a></li><li><a href="/en/grade-1.html">1st grade math worksheets</a></li><li><a href="/en/grade-2.html">2nd grade math worksheets</a></li></ul></section>`;
}

function normalizeNestedPaths(html) {
  return html
    .replace(/href="style\.css/g, 'href="/en/style.css')
    .replace(/src="types\.js/g, 'src="/en/types.js')
    .replace(/src="curriculum\.js/g, 'src="/en/curriculum.js')
    .replace(/src="app\.js/g, 'src="/en/app.js')
    .replace(/href="legal\.css/g, 'href="/en/legal.css')
    .replace(/<a class="logo" href="index\.html">/g, '<a class="logo" href="/en/">')
    .replace(/href="(about|contact|privacy|terms)\.html"/g, 'href="/en/$1.html"')
    .replace(/href="index\.html"/g, 'href="/en/"');
}

function makePage(entry, definition) {
  const sourceFile = path.join(enDir, definition.id + '.html');
  if (!fs.existsSync(sourceFile)) throw new Error('Missing parent activity page: ' + sourceFile);
  let html = fs.readFileSync(sourceFile, 'utf8');
  const canonical = `${site}/en/print/hands-on/${entry.slug}.html`;
  const description = descriptionFor(entry);
  const fullTitle = entry.title + ' | Googoodan';

  html = replaceOne(html, /<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(fullTitle)}</title>`, 'title');
  html = replaceOne(html, /<meta name="description" content="[^"]*">/i, `<meta name="description" content="${escapeHtml(description)}">`, 'description');
  html = replaceOne(html, /<link rel="canonical" href="[^"]*">/i, `<link rel="canonical" href="${canonical}">`, 'canonical');
  html = html.replace(/<link rel="alternate" hreflang="[^"]+" href="[^"]*">/gi, '');
  const alternates = `<link rel="alternate" hreflang="en" href="${canonical}"><link rel="alternate" hreflang="ko" href="${site}/ko/"><link rel="alternate" hreflang="ja" href="${site}/ja/"><link rel="alternate" hreflang="fr" href="${site}/fr/"><link rel="alternate" hreflang="de" href="${site}/de/"><link rel="alternate" hreflang="x-default" href="${site}/">`;
  html = html.replace('</head>', `${alternates}<script defer src="/en/hands-on-entry.js?v=${version}"></script></head>`);
  html = html.replace(/<meta property="og:title" content="[^"]*">/i, `<meta property="og:title" content="${escapeHtml(entry.title)}">`)
    .replace(/<meta property="og:description" content="[^"]*">/i, `<meta property="og:description" content="${escapeHtml(description)}">`)
    .replace(/<meta property="og:url" content="[^"]*">/i, `<meta property="og:url" content="${canonical}">`)
    .replace(/<meta property="og:image(?::[^"]*)?" content="[^"]*">/gi, '')
    .replace(/<meta name="twitter:card" content="[^"]*">/gi, '');
  html = html.replace(/<script id="website-identity" type="application\/ld\+json">[\s\S]*?<\/script>/i,
    `<script id="website-identity" type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'WebSite','@id':site+'/#website',name:'googoodan',alternateName:'구구단닷컴',url:site+'/'})}</script>`);
  html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/i,
    `<script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'LearningResource',name:entry.title,description,url:canonical,inLanguage:'en-US',educationalLevel:definition.level,learningResourceType:'Hands-on activity worksheet',isAccessibleForFree:true,teaches:definition.standard})}</script>`);
  html = html.replace(/<body([^>]*)>/i, (match, attrs) => {
    const cleaned = attrs.replace(/\sdata-type="[^"]*"/i, '').replace(/\sdata-base="[^"]*"/i, '');
    return `<body${cleaned} data-type="${escapeHtml(definition.id)}" data-base="/en/" data-hands-on-parent="${escapeHtml(definition.id)}" data-hands-on-method="${escapeHtml(entry.method)}" data-hands-on-title="${escapeHtml(entry.title)}" data-hands-on-description="${escapeHtml(description)}" data-hands-on-canonical="${canonical}" data-hands-on-instruction="${escapeHtml(entry.instruction)}">`;
  });
  html = replaceOne(html, /<aside><h1>[\s\S]*?<\/h1>/i, `<aside><h1>${escapeHtml(entry.title)}</h1>`, 'H1');
  html = replaceOne(html, /<h2 id="sheet-title">[\s\S]*?<\/h2>/i, `<h2 id="sheet-title">${escapeHtml(entry.title)}</h2>`, 'sheet title');
  html = replaceOne(html, /<p class="instructions" id="instructions">[\s\S]*?<\/p>/i, `<p class="instructions" id="instructions">${escapeHtml(entry.instruction)}</p>`, 'instructions');
  html = replaceOne(html, /<section class="seo-resource"[\s\S]*?<\/section><\/body>/i, resource(entry, definition, description) + '</body>', 'SEO body');
  html = normalizeNestedPaths(html);
  return {html, canonical, description};
}

const allMethods = definitions.flatMap(definition => definition.methods.map(method => ({definition, method})));
const skipped = allMethods.filter(({definition}) => definition.methods.length === 1).map(({definition, method}) => ({
  parent: definition.id,
  method,
  reason: `The existing /en/${definition.id}.html page already opens this single exact method.`
}));
const selected = allMethods.filter(({definition}) => definition.methods.length > 1);
const expectedMethods = new Set(selected.map(item => item.method));
const detailMethods = new Set(Object.keys(details));
const missing = [...expectedMethods].filter(method => !detailMethods.has(method));
const extra = [...detailMethods].filter(method => !expectedMethods.has(method));
if (missing.length || extra.length) throw new Error(`Method metadata mismatch. Missing: ${missing.join(', ')}. Extra: ${extra.join(', ')}`);

fs.mkdirSync(outDir, {recursive: true});
const manifest = {version, generatedAt:new Date().toISOString(), sourceMethodCount:allMethods.length, generatedCount:0, skippedCount:skipped.length, skipped, pages:[]};
for (const {definition, method} of selected) {
  const entry = {...details[method], method};
  const {html, canonical, description} = makePage(entry, definition);
  const file = path.join(outDir, entry.slug + '.html');
  fs.writeFileSync(file, html, 'utf8');
  manifest.pages.push({
    slug:entry.slug,
    parent:definition.id,
    method,
    title:entry.title,
    description,
    instruction:entry.instruction,
    level:definition.level,
    standard:definition.standard,
    file:path.relative(enDir, file).replaceAll('\\', '/'),
    canonical
  });
}
manifest.generatedCount = manifest.pages.length;
fs.writeFileSync(path.join(enDir, 'k2-activity-method-static-manifest.json'), JSON.stringify(manifest, null, 2) + '\n', 'utf8');
console.log(JSON.stringify({sourceMethods:allMethods.length, generated:manifest.generatedCount, skipped:manifest.skippedCount, output:path.relative(enDir,outDir)}, null, 2));
