'use strict';
const fs = require('fs');
const path = require('path');

const enDir = __dirname;
const site = 'https://googoodan.com';
const version = '20260913-high-value-activity';

const entries = [
  page({
    file:'subtraction-color-by-number.html', source:'color-by-number.html', family:'color', method:'subtract-small',
    title:'Subtraction Color by Number Worksheets',
    description:'Free printable subtraction color by number worksheets within 10. Solve each fact, follow the color key, make a fresh set, and print the matching answer key.',
    grade:'Grade 1', standard:'1.OA.C.6',
    instruction:'Solve each subtraction fact. Use the answer ranges in the key to color the mosaic.',
    purpose:'Students practice subtraction facts within 10 while using each difference to select a color range. The compact mosaic gives every calculation a visible purpose.',
    action:'Solve all 16 subtraction facts in pencil. Match each difference to the four-range color key, then color the corresponding square.',
    tip:'Ask the student to finish the arithmetic before coloring. If a color seems out of place, recalculate that difference and check its range instead of guessing from neighboring squares.'
  }),
  page({
    file:'tape-diagram-word-problems.html', source:'word-problems.html', family:'story', bank:'1-2-6', profile:4,
    title:'Tape Diagram Word Problems Worksheets',
    description:'Free printable tape diagram word problems for grades 1–2. Model addition and subtraction stories, generate fresh numbers, and print the matching answer key.',
    grade:'Grades 1–2', standard:'1.OA.A.1; 2.OA.A.1',
    instruction:'Read each story. Use the tape diagram to identify the whole, the known part, and the missing part.',
    purpose:'Tape diagrams, also called bar models, show how the quantities in a story are related. The same model supports joining, missing-part, and difference situations.',
    action:'Read the question before choosing an operation. Label the whole and the two parts in the diagram, write an equation, and solve for the box.',
    tip:'Have the student point to the quantity being found. A larger number in the story is not always the answer, and the word “more” does not always mean that the required operation is addition.'
  }),
  page({
    file:'balance-the-equation.html', source:'picture-addition.html', family:'early-arithmetic', bank:'1-2-4', profile:1, methods:['compensate'], count:6,
    title:'Balance the Equation Worksheets',
    description:'Free printable balance the equation worksheets for first grade. Find the missing number that makes both sides equal, create fresh sets, and print matching answers.',
    grade:'Grade 1', standard:'1.OA.D.7–8',
    instruction:'Fill in each box so both sides of the equation have the same value.',
    purpose:'These missing-number equations treat the equal sign as a statement that two expressions have the same value. Students reason about both sides instead of reading the sign as “the answer comes next.”',
    action:'Calculate the total on the complete side, then decide what number makes the other side match. Write the missing number in the large answer space.',
    tip:'Ask the student to read the equation as “has the same value as.” After filling the box, add both sides again. This quick check makes the meaning of equality visible.'
  }),
  page({
    file:'make-10-subtraction.html', source:'picture-addition.html', family:'early-arithmetic', bank:'1-2-2', profile:2, methods:['bridge-sub','zero-ten'], count:6,
    title:'Make 10 Subtraction Worksheets',
    description:'Free printable make 10 subtraction worksheets for first grade. Break apart teen numbers, subtract from 10, generate fresh practice, and print the matching answer key.',
    grade:'Grade 1', standard:'1.OA.C.6',
    instruction:'Use 10 as a friendly number to solve each subtraction problem.',
    purpose:'The worksheet practices two connected ideas: subtracting directly from 10 and breaking a teen number into 10 plus some ones. Both rely on fluent number pairs that make 10.',
    action:'For a teen-number problem, subtract from 10 first and then add the extra ones. Complete each displayed step rather than writing only the final difference.',
    tip:'Use a ten frame or counters when the steps are new. Once the student can explain why the leftover ones are added back, move toward solving the same structure mentally.'
  }),
  page({
    file:'choose-operation-word-problems.html', source:'word-problems.html', family:'story', bank:'1-2-6', profile:2,
    title:'Choose the Operation Word Problems Worksheets',
    description:'Free printable choose the operation word problems for grades 1–2. Decide whether to add or subtract, solve fresh stories, and print matching answer keys.',
    grade:'Grades 1–2', standard:'1.OA.A.1; 2.OA.A.1',
    instruction:'Read each story, choose the addition or subtraction equation that matches, and solve.',
    purpose:'Students decide which operation represents the relationship in each story. The choices include total, starting-amount, and change-unknown situations with familiar school contexts.',
    action:'Underline the known quantities and circle what the question asks. Compare the two offered equations, choose the one that matches the story, and then calculate.',
    tip:'Do not teach a single clue-word rule. Ask whether quantities are being joined, separated, or compared, and identify which quantity is unknown before choosing addition or subtraction.'
  }),
  page({
    file:'math-mistake-detective.html', source:'picture-addition.html', family:'early-arithmetic', bank:'1-2-6', profile:2, methods:['error'], count:6,
    title:'Math Mistake Detective Worksheets',
    description:'Free printable math mistake detective worksheets for second grade. Check incorrect addition equations, correct each error, make new sets, and print matching answers.',
    grade:'Grade 2', standard:'2.NBT.B.5–7',
    instruction:'Check each equation, find the math mistake, and write the correct answer.',
    purpose:'Every displayed equation contains an answer that needs checking. Students become error detectives by recalculating two-digit addition and replacing an incorrect result.',
    action:'Cover the shown answer, solve the left side independently, and compare the two results. Record the corrected answer and explain one mistake aloud.',
    tip:'Treat a wrong answer as useful evidence. Ask whether the ones, tens, or regrouping caused the mismatch, then verify the correction with a second strategy or an estimate.'
  })
];

function page(config) { return config; }
function escapeHtml(value) {
  return String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
}
function replaceOne(text, pattern, replacement, label) {
  if (!pattern.test(text)) throw new Error(`Could not replace ${label}`);
  return text.replace(pattern, replacement);
}
function words(text) {
  return text.replace(/<[^>]+>/g, ' ').replace(/&\w+;/g, ' ').trim().split(/\s+/).filter(Boolean).length;
}

function resource(entry) {
  const related = entries.filter(item => item.file !== entry.file).slice(0, 3);
  const html = `<section class="seo-resource" aria-labelledby="activity-guide-heading"><h2 id="activity-guide-heading">${escapeHtml(entry.title)}: free printable activity</h2><p id="resource-description">${escapeHtml(entry.description)}</p><p><strong>${escapeHtml(entry.grade)} · ${escapeHtml(entry.standard)}.</strong> ${escapeHtml(entry.purpose)}</p><h3>What students do</h3><p>${escapeHtml(entry.action)} Select <strong>New problems</strong> whenever another version is useful. The activity keeps the same learning goal while the existing worksheet engine supplies a fresh set of numbers, pictures, or story details.</p><h3>A practical teaching routine</h3><p>${escapeHtml(entry.tip)} Begin with one example together, let the student complete the remaining questions independently, and ask for a short explanation of one answer. The explanation helps distinguish a lucky guess from an understood strategy.</p><h3>Worksheet and matching answer key</h3><p>Use the <strong>Worksheet</strong> and <strong>Answer key</strong> buttons to preview both versions. They use the exact same set, so every number, diagram, and question stays in the same position while the answers appear. The print choices let you print only the worksheet, only the answer key, or both. <strong>Save PDF</strong> uses the same selection.</p><p>Each selected sheet is designed to fit on one US Letter or A4 page. No account is required, and the printable may be used for home practice, tutoring, math centers, or ordinary classroom instruction. Keep the first session short, review any error, and make a new set on another day for spaced practice.</p><h3>Continue with related practice</h3><p>Choose a nearby activity only after this one feels comfortable. Related pages use the same familiar controls and include their own matching answers.</p><ul id="resource-related">${related.map(item => `<li><a href="/en/${item.file}">${escapeHtml(item.title)}</a></li>`).join('')}<li><a href="/en/early-math-activities.html">Hands-on math worksheets for kids</a></li><li><a href="/en/worksheets.html">All printable math worksheets</a></li></ul><p id="resource-example">${escapeHtml(entry.instruction)}</p><p id="resource-instruction">Generate a fresh set, preview its matching answer key, then print or save the pages you selected.</p></section>`;
  if (words(html) < 250) throw new Error(`${entry.file}: static guide is shorter than 250 words`);
  return html;
}

function bodyData(entry) {
  const values = {
    'data-hv-family':entry.family,
    'data-hv-title':entry.title,
    'data-hv-description':entry.description,
    'data-hv-canonical':`${site}/en/${entry.file}`,
    'data-hv-instruction':entry.instruction,
    'data-hv-method':entry.method,
    'data-hv-bank':entry.bank,
    'data-hv-profile':entry.profile,
    'data-hv-methods':entry.methods?.join(','),
    'data-hv-count':entry.count
  };
  return Object.entries(values).filter(([,value]) => value !== undefined).map(([key,value]) => `${key}="${escapeHtml(value)}"`).join(' ');
}

function build(entry) {
  const sourcePath = path.join(enDir, entry.source);
  if (!fs.existsSync(sourcePath)) throw new Error(`Missing source ${entry.source}`);
  let html = fs.readFileSync(sourcePath, 'utf8');
  const canonical = `${site}/en/${entry.file}`;
  const fullTitle = `${entry.title} | Googoodan`;
  html = replaceOne(html, /<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(fullTitle)}</title>`, 'title');
  html = replaceOne(html, /<meta name="description" content="[^"]*">/i, `<meta name="description" content="${escapeHtml(entry.description)}">`, 'description');
  html = replaceOne(html, /<link rel="canonical" href="[^"]*">/i, `<link rel="canonical" href="${canonical}">`, 'canonical');
  if (!/<meta name="robots"/i.test(html)) html = html.replace('</title>', '</title><meta name="robots" content="index,follow">');
  html = html.replace(/<link rel="alternate" hreflang="[^"]+" href="[^"]*">/gi, '');
  html = html.replace(/<script\b[^>]*type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<meta property="og:image(?::[^"]*)?" content="[^"]*">/gi, '').replace(/<meta name="twitter:card" content="[^"]*">/gi, '');
  html = html.replace(/<meta property="og:title" content="[^"]*">/i, `<meta property="og:title" content="${escapeHtml(fullTitle)}">`)
    .replace(/<meta property="og:description" content="[^"]*">/i, `<meta property="og:description" content="${escapeHtml(entry.description)}">`)
    .replace(/<meta property="og:url" content="[^"]*">/i, `<meta property="og:url" content="${canonical}">`);
  const structured = {'@context':'https://schema.org','@graph':[
    {'@type':'WebSite','@id':site+'/#website',name:'googoodan',alternateName:'구구단닷컴',url:site+'/'},
    {'@type':['WebPage','LearningResource'],'@id':canonical+'#worksheet',url:canonical,name:entry.title,description:entry.description,inLanguage:'en-US',educationalLevel:entry.grade,teaches:entry.standard,learningResourceType:'Printable activity worksheet',isAccessibleForFree:true,isPartOf:{'@id':site+'/#website'}}
  ]};
  const alternates = `<link rel="alternate" hreflang="en" href="${canonical}"><link rel="alternate" hreflang="ko" href="${site}/ko/"><link rel="alternate" hreflang="ja" href="${site}/ja/"><link rel="alternate" hreflang="fr" href="${site}/fr/"><link rel="alternate" hreflang="de" href="${site}/de/"><link rel="alternate" hreflang="x-default" href="${site}/">`;
  html = html.replace('</head>', `<script id="website-identity" type="application/ld+json">${JSON.stringify(structured)}</script>${alternates}<script defer src="/en/high-value-activity-entry.js?v=${version}"></script></head>`);
  html = html.replace(/<body([^>]*)>/i, (match, attrs) => `<body${attrs} ${bodyData(entry)}>`);
  html = replaceOne(html, /<aside><h1>[\s\S]*?<\/h1>/i, `<aside><h1>${escapeHtml(entry.title)}</h1>`, 'H1');
  html = replaceOne(html, /<h2 id="sheet-title">[\s\S]*?<\/h2>/i, `<h2 id="sheet-title">${escapeHtml(entry.title)}</h2>`, 'sheet title');
  html = replaceOne(html, /<p class="instructions" id="instructions">[\s\S]*?<\/p>/i, `<p class="instructions" id="instructions">${escapeHtml(entry.instruction)}</p>`, 'instructions');
  html = replaceOne(html, /<section class="seo-resource"\s+aria-labelledby="resource-heading">[\s\S]*?<\/section><\/body>/i, resource(entry) + '</body>', 'static guide');
  if (!/id="status"/i.test(html)) {
    html = html.replace('<noscript>', '<div class="sr" id="status" role="status" aria-live="polite"></div><noscript>');
  }
  html = html.replace(/<a class="logo" href="index\.html">/g, '<a class="logo" href="/en/">')
    .replace(/href="(about|contact|privacy|terms)\.html"/g, 'href="/en/$1.html"')
    .replace(/href="index\.html"/g, 'href="/en/"')
    .replace(/<a href="\/">Korean ↗<\/a>/g, '<a href="/ko/">Korean ↗</a>');
  return {html, canonical};
}

const manifest = {version, count:entries.length, pages:[]};
for (const entry of entries) {
  const {html, canonical} = build(entry);
  fs.writeFileSync(path.join(enDir, entry.file), html, 'utf8');
  manifest.pages.push({...entry, canonical});
}
fs.writeFileSync(path.join(enDir, 'high-value-activity-pages-manifest.json'), JSON.stringify(manifest, null, 2) + '\n', 'utf8');
console.log(JSON.stringify({generated:entries.length, files:entries.map(entry => entry.file)}, null, 2));
