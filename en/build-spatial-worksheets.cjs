'use strict';
const fs = require('fs');
const path = require('path');

const enDir = __dirname;
const site = 'https://googoodan.com';
const version = '20260913-spatial-3d';
const entries = [
  {
    file:'faces-edges-vertices.html',
    title:'Faces, Edges and Vertices Worksheets',
    description:'Free printable faces, edges and vertices worksheets for solid figures. Count parts of prisms, pyramids, cylinders, cones and spheres with answer keys.',
    grade:'Grades 2-5',
    standard:'CCSS 2.G.A.1 and later spatial reasoning review',
    instruction:'Count or identify the faces, edges, vertices, and other defining parts of each solid figure.',
    purpose:'Children identify defining parts of rectangular prisms, polygonal prisms, pyramids, cylinders, cones, and spheres. The mixed sheet moves beyond naming a solid and asks students to attend to its flat faces, edges, vertices, bases, and radius.',
    action:'Look at the named solid, decide which part the question asks about, and count carefully. On a prism or pyramid, use the shape of the base to organize the count rather than trying to memorize every example.',
    tip:'Have the student point to each part on a classroom solid or a small box. A rectangular prism always has 6 faces, 8 vertices, and 12 edges, which makes a useful reference for checking the first questions.',
    caveat:'The Grade 2 Common Core standard asks students to recognize shapes from defining attributes. Formal vocabulary and more complex prisms are useful review or enrichment in later elementary grades.',
    choices:['Rectangular prism: faces, edges or vertices','Edges of a rectangular prism','Prism attributes','Pyramid attributes','Circular bases of a cylinder','Vertex of a cone','Radius of a sphere']
  },
  {
    file:'nets-of-3d-shapes.html',
    title:'Nets of 3D Shapes Worksheets',
    description:'Free printable nets of 3D shapes worksheets for cubes, triangular prisms and cylinders. Study each net, generate a fresh set and print matching answers.',
    grade:'Grades 5-6',
    standard:'Related to CCSS 6.G.A.4; cylinder nets are an extension',
    instruction:'Study each net and identify the faces or the three-dimensional shape it makes.',
    purpose:'A net shows the two-dimensional faces of a solid laid flat. These questions use the existing cube, triangular-prism, and cylinder-net activities to connect a flat arrangement with the solid it can form.',
    action:'Trace how neighboring faces meet, count the face shapes, and imagine folding along every shared edge. For a cylinder, separate its two circular bases from the rectangle that forms the curved lateral surface.',
    tip:'Print one sheet, cut around a copied net, and fold it before completing a second set without cutting. Physical folding gives students a concrete image they can recall during later surface-area work.',
    caveat:'CCSS 6.G.A.4 focuses on nets made from rectangles and triangles for surface area. The cylinder item extends the spatial idea but is not presented as full coverage of that standard.',
    choices:['Net of a cube','Net of a triangular prism','Net of a cylinder']
  },
  {
    file:'counting-cubes.html',
    title:'Counting Cubes Worksheets',
    description:'Free printable counting cubes worksheets for grade 5. Read top-view stack heights, count every unit cube, make new structures and print matching answer keys.',
    grade:'Grade 5',
    standard:'CCSS 5.MD.C.4-5',
    instruction:'Use the top-view height map to count every unit cube in the structure.',
    purpose:'Each four-cell map is a top view of a structure made from unit cubes. A number tells how many cubes are stacked at that position, so students can find the total without guessing from a perspective drawing.',
    action:'Read every stack height, write an addition expression, and add the four values. Check that a zero represents an empty position and that each nonzero height includes the bottom cube in that stack.',
    tip:'Build the first map with linking cubes if possible. Then ask the student to touch each position on the printed map while naming its stack height before adding. This links the flat representation to the solid structure.',
    caveat:'The worksheet supports the unit-cube counting and additive reasoning used in Grade 5 volume work. It practices interpreting a height map rather than calculating length times width times height.',
    choices:['Count all unit cubes from a top-view height map']
  },
  {
    file:'front-top-side-views-cubes.html',
    title:'Front Top and Side Views of Cubes Worksheets',
    description:'Free printable front, top and side views of cubes worksheets. Read a top-view height map, find visible squares from each side and check matching answers.',
    grade:'Grades 4-6',
    standard:'Spatial visualization practice; no direct Common Core worksheet claim',
    instruction:'Read the top-view height map, then find how many unit squares appear in the front or right-side view.',
    purpose:'The map already gives the top view and the height of every stack. Students use those heights to determine the silhouette seen from the front or right side, where stacks in the same line can overlap.',
    action:'Mark which edge of the map is the front. For each line of sight, keep the tallest stack because shorter stacks behind it do not add another visible square at the same height. Add the visible column heights.',
    tip:'Use four stacks of linking cubes to model one question. Turn the model while keeping the printed front marker in place. Comparing the real front and side silhouettes helps prevent adding every cube when some are hidden.',
    caveat:'Front, top, and side views are common elementary spatial-reasoning activities, but this page does not claim direct coverage of one specific Common Core content standard.',
    choices:['Front view from a top-view height map','Right-side view from a top-view height map']
  },
  {
    file:'missing-hidden-cubes.html',
    title:'Missing and Hidden Cubes Worksheets',
    description:'Free printable missing and hidden cubes worksheets for grade 5. Use stack heights, remove a specified stack, find the cubes left and print matching answers.',
    grade:'Grade 5',
    standard:'Related to CCSS 5.MD.C.4-5',
    instruction:'Use the top-view height map to reason about a removed stack and the cubes that remain.',
    purpose:'A top-view height map records cubes that would be hidden in a perspective picture. Each task asks students to count the complete structure, remove the entire stack in the upper-left position, and find the remaining total.',
    action:'Add the four stack heights to find the original total. Identify the upper-left cell without turning the page, subtract that whole stack, and write how many unit cubes remain in the structure.',
    tip:'Ask the student to explain why a cell labeled 3 represents three cubes even though only the top cube would be visible from directly above. This language makes the hidden-cube idea explicit before subtraction begins.',
    caveat:'The activity supports Grade 5 unit-cube and volume reasoning. It is a focused height-map problem and does not claim to assess every part of the Grade 5 measurement and data standards.',
    choices:['Remove one stack and count the remaining cubes']
  }
];

function esc(value) {
  return String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
}
function replaceOne(text, pattern, replacement, label) {
  if (!pattern.test(text)) throw new Error('Could not replace ' + label);
  return text.replace(pattern, replacement);
}
function visibleWords(html) {
  return html.replace(/<script\b[\s\S]*?<\/script>/gi,' ').replace(/<style\b[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').trim().split(/\s+/).filter(Boolean).length;
}
function guide(entry) {
  const related = entries.filter(function(item){ return item.file !== entry.file; }).slice(0,4);
  const choiceItems = entry.choices.map(function(choice){ return '<li>' + esc(choice) + '</li>'; }).join('');
  const relatedItems = related.map(function(item){ return '<li><a href="/en/' + item.file + '">' + esc(item.title) + '</a></li>'; }).join('');
  const html = '<section class="seo-resource" aria-labelledby="spatial-guide-heading">' +
    '<h2 id="spatial-guide-heading">' + esc(entry.title) + ': free printable practice</h2>' +
    '<p id="resource-description">' + esc(entry.description) + '</p>' +
    '<p><strong>' + esc(entry.grade) + ' · ' + esc(entry.standard) + '.</strong> ' + esc(entry.purpose) + '</p>' +
    '<h3>Practice choices</h3><ul>' + choiceItems + '</ul>' +
    '<h3>How to use this worksheet</h3><p>' + esc(entry.action) + ' Select a focused practice type or keep the mixed set. Use <strong>New problems</strong> to create another version with fresh source figures or stack heights.</p>' +
    '<h3>Teaching tip</h3><p>' + esc(entry.tip) + ' Ask for a brief explanation after one answer. Spatial vocabulary becomes more useful when a student connects the word, the diagram, and the count.</p>' +
    '<h3>Worksheet and answer key</h3><p>Use the <strong>Worksheet</strong> and <strong>Answer key</strong> buttons to preview both versions. The answer key keeps the same questions, diagrams, and order as the current worksheet. The print choices let you print the worksheet, the answer key, or both. <strong>Save PDF</strong> uses that same selection.</p>' +
    '<p>Every selected sheet is designed for one US Letter or A4 page. No account is needed, and the printable may be used for home practice, tutoring, math centers, or ordinary classroom instruction. Students should read the labels on the diagram rather than measure the drawing.</p>' +
    '<h3>Scope</h3><p>' + esc(entry.caveat) + ' The generator supplies focused practice, so teachers should pair it with discussion and hands-on models when a concept is new.</p>' +
    '<h3>Related solid geometry practice</h3><ul id="resource-related">' + relatedItems +
    '<li><a href="/en/transformations.html">Geometry Transformations Worksheets</a></li>' +
    '<li><a href="/en/surface-area.html">Surface Area Worksheets</a></li>' +
    '<li><a href="/en/print/grade-skills/grade-5-volume-worksheet.html">Volume Worksheets</a></li>' +
    '<li><a href="/en/worksheets.html">All Printable Math Worksheets</a></li></ul>' +
    '<p id="resource-example">' + esc(entry.instruction) + '</p>' +
    '<p id="resource-instruction">Choose a practice type, generate a fresh set, preview the matching answer key, and print or save the selected pages.</p></section>';
  if (visibleWords(html) < 300) throw new Error(entry.file + ': guide has fewer than 300 words (' + visibleWords(html) + ')');
  return html;
}

function build(entry) {
  const sourcePath = path.join(enDir, 'angles.html');
  if (!fs.existsSync(sourcePath)) throw new Error('Missing template en/angles.html');
  let html = fs.readFileSync(sourcePath, 'utf8');
  const canonical = site + '/en/' + entry.file;
  const fullTitle = entry.title + ' | Googoodan';

  html = replaceOne(html, /<title>[\s\S]*?<\/title>/i, '<title>' + esc(fullTitle) + '</title>', 'title');
  html = replaceOne(html, /<meta name="description" content="[^"]*">/i, '<meta name="description" content="' + esc(entry.description) + '">', 'description');
  html = replaceOne(html, /<link rel="canonical" href="[^"]*">/i, '<link rel="canonical" href="' + canonical + '">', 'canonical');
  if (!/<meta name="robots"/i.test(html)) html = html.replace('</title>', '</title><meta name="robots" content="index,follow">');

  html = replaceOne(html, /<script defer src="\/en\/banks\/coverage\.js\?v=[^"]+"><\/script>/i, '<script defer src="/en/banks/spatial.js?v=' + version + '"></script>', 'coverage adapter');
  html = replaceOne(html, /<script defer src="\/en\/banks\/coverage-controls\.js\?v=[^"]+"><\/script>/i, '<script defer src="/en/banks/spatial-controls.js?v=' + version + '"></script>', 'coverage controls');
  html = replaceOne(html, /<link rel="stylesheet" href="\/en\/banks\/coverage\.css\?v=[^"]+">/i, '<link rel="stylesheet" href="/en/banks/coverage.css?v=20260913-answer-space-fix"><link rel="stylesheet" href="/en/banks/spatial.css?v=' + version + '">', 'coverage styles');

  html = html.replace(/<link rel="alternate" hreflang="[^"]+" href="[^"]*">/gi, '');
  html = html.replace(/<script\b[^>]*type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/gi, '');
  const structured = {'@context':'https://schema.org','@graph':[
    {'@type':'WebSite','@id':site+'/#website',name:'googoodan',alternateName:'\uAD6C\uAD6C\uB2E8\uB2F7\uCEF4',url:site+'/'},
    {'@type':['WebPage','LearningResource'],'@id':canonical+'#worksheet',url:canonical,name:entry.title,description:entry.description,inLanguage:'en-US',educationalLevel:entry.grade,teaches:entry.standard,learningResourceType:'Printable math worksheet',isAccessibleForFree:true,isPartOf:{'@id':site+'/#website'}}
  ]};
  const alternates =
    '<link rel="alternate" hreflang="en" href="' + canonical + '">' +
    '<link rel="alternate" hreflang="ko" href="' + site + '/ko/">' +
    '<link rel="alternate" hreflang="ja" href="' + site + '/ja/">' +
    '<link rel="alternate" hreflang="fr" href="' + site + '/fr/">' +
    '<link rel="alternate" hreflang="de" href="' + site + '/de/">' +
    '<link rel="alternate" hreflang="it" href="' + site + '/it/">' +
    '<link rel="alternate" hreflang="es" href="' + site + '/es/">' +
    '<link rel="alternate" hreflang="x-default" href="' + site + '/">';
  html = html.replace('</head>', '<script id="website-identity" type="application/ld+json">' + JSON.stringify(structured) + '</script>' + alternates + '</head>');

  html = html.replace(/<meta property="og:title" content="[^"]*">/i, '<meta property="og:title" content="' + esc(fullTitle) + '">')
    .replace(/<meta property="og:description" content="[^"]*">/i, '<meta property="og:description" content="' + esc(entry.description) + '">')
    .replace(/<meta property="og:url" content="[^"]*">/i, '<meta property="og:url" content="' + canonical + '">');
  html = replaceOne(html, /<body([^>]*)data-type="[^"]+"([^>]*)>/i, '<body$1data-type="' + entry.file.replace(/\.html$/,'') + '"$2>', 'body data type');
  html = replaceOne(html, /<aside><h1>[\s\S]*?<\/h1>/i, '<aside><h1>' + esc(entry.title) + '</h1>', 'H1');
  html = html.replace('<p>Choose a topic or a Common Core skill.</p>', '<p>Choose a solid geometry skill and create a printable set.</p>');
  html = replaceOne(html, /<h2 id="sheet-title">[\s\S]*?<\/h2>/i, '<h2 id="sheet-title">' + esc(entry.title) + '</h2>', 'sheet title');
  html = replaceOne(html, /<p class="instructions" id="instructions">[\s\S]*?<\/p>/i, '<p class="instructions" id="instructions">' + esc(entry.instruction) + '</p>', 'instruction');
  html = replaceOne(html, /<section class="seo-resource"\s+aria-labelledby="resource-heading">[\s\S]*?<\/section><\/body>/i, guide(entry) + '</body>', 'resource guide');
  html = html.replace(/<a class="logo" href="index\.html">/g, '<a class="logo" href="/en/">')
    .replace(/href="(about|contact|privacy|terms)\.html"/g, 'href="/en/$1.html"')
    .replace(/href="index\.html"/g, 'href="/en/"')
    .replace(/<a href="\/">Korean \u2197<\/a>/g, '<a href="/ko/">Korean \u2197</a>');
  return html;
}

for (const entry of entries) {
  fs.writeFileSync(path.join(enDir, entry.file), build(entry), 'utf8');
}
process.stdout.write(JSON.stringify({generated:entries.length,version:version,files:entries.map(function(entry){return entry.file;})}, null, 2) + '\n');
