'use strict';
const fs = require('fs');
const path = require('path');
const http = require('http');
const {chromium} = require('playwright');
const {PDFDocument} = require('pdf-lib');

const root = path.resolve(__dirname, '..');
const enDir = __dirname;
const version = '20260913-spatial-3d';
const expected = [
  {file:'faces-edges-vertices.html',title:'Faces, Edges and Vertices Worksheets',count:7,skills:['cuboid','cuboid-edges','prism','pyramid','cylinder','cone','sphere']},
  {file:'nets-of-3d-shapes.html',title:'Nets of 3D Shapes Worksheets',count:6,skills:['cube-net','prism-net','cylinder-net']},
  {file:'counting-cubes.html',title:'Counting Cubes Worksheets',count:6,skills:['cube-count']},
  {file:'front-top-side-views-cubes.html',title:'Front Top and Side Views of Cubes Worksheets',count:6,skills:['cube-view']},
  {file:'missing-hidden-cubes.html',title:'Missing and Hidden Cubes Worksheets',count:6,skills:['cube-missing']}
];

function one(html, pattern, label, file) {
  const matches = Array.from(html.matchAll(pattern));
  if (matches.length !== 1) throw new Error(file + ': expected one ' + label + ', found ' + matches.length);
  return matches[0][1];
}
function words(html) {
  return html.replace(/<script\b[\s\S]*?<\/script>/gi,' ').replace(/<style\b[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&\w+;/g,' ').trim().split(/\s+/).filter(Boolean).length;
}
function staticCheck() {
  const titles = new Set();
  const canonicals = new Set();
  const report = [];
  for (const item of expected) {
    const filePath = path.join(enDir,item.file);
    if (!fs.existsSync(filePath)) throw new Error('Missing ' + item.file);
    const html = fs.readFileSync(filePath,'utf8');
    const title = one(html,/<title>([^<]+)<\/title>/gi,'title',item.file);
    const description = one(html,/<meta name="description" content="([^"]+)">/gi,'description',item.file);
    const canonical = one(html,/<link rel="canonical" href="([^"]+)">/gi,'canonical',item.file);
    const h1 = one(html,/<aside><h1>([^<]+)<\/h1>/gi,'H1',item.file);
    const guide = one(html,/(<section class="seo-resource" aria-labelledby="spatial-guide-heading">[\s\S]*?<\/section>)<\/body>/gi,'static guide',item.file);
    const expectedCanonical = 'https://googoodan.com/en/' + item.file;
    if (title !== item.title + ' | Googoodan' || h1 !== item.title) throw new Error(item.file + ': title/H1 mismatch');
    if (canonical !== expectedCanonical) throw new Error(item.file + ': canonical mismatch');
    if (description.length < 120 || description.length > 180) throw new Error(item.file + ': description length ' + description.length);
    if (!/<html lang="en">/i.test(html) || !/<meta name="robots" content="index,follow">/i.test(html)) throw new Error(item.file + ': language or robots missing');
    if (words(guide) < 300) throw new Error(item.file + ': static guide only ' + words(guide) + ' words');
    if (!html.includes('/en/banks/spatial.js?v=' + version) || !html.includes('/en/banks/spatial-controls.js?v=' + version) || !html.includes('/en/banks/spatial.css?v=' + version)) throw new Error(item.file + ': spatial asset/version missing');
    if (!html.includes('/answer-boxes.css?v=20260913-bank-answers') || !html.includes('/answer-boxes.js?v=20260913-bank-answers')) throw new Error(item.file + ': answer box version stale');
    const alternates = {en:expectedCanonical,ko:'https://googoodan.com/ko/',ja:'https://googoodan.com/ja/',fr:'https://googoodan.com/fr/',de:'https://googoodan.com/de/',it:'https://googoodan.com/it/',es:'https://googoodan.com/es/','x-default':'https://googoodan.com/'};
    for (const pair of Object.entries(alternates)) {
      const lang = pair[0], href = pair[1];
      const pattern = new RegExp('<link rel="alternate" hreflang="' + lang.replace('-','\\-') + '" href="([^"]+)">','g');
      const found = Array.from(html.matchAll(pattern));
      if (found.length !== 1 || found[0][1] !== href) throw new Error(item.file + ': invalid ' + lang + ' hreflang');
    }
    const ld = Array.from(html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi));
    if (ld.length !== 1) throw new Error(item.file + ': JSON-LD count ' + ld.length);
    const data = JSON.parse(ld[0][1]);
    const resource = data['@graph'] && data['@graph'].find(function(node){ return Array.isArray(node['@type']) && node['@type'].includes('LearningResource'); });
    if (!resource || resource.name !== item.title || resource.url !== expectedCanonical || resource.isAccessibleForFree !== true || resource.inLanguage !== 'en-US') throw new Error(item.file + ': invalid LearningResource');
    const visible = html.replace(/<script\b[\s\S]*?<\/script>/gi,' ').replace(/<style\b[\s\S]*?<\/style>/gi,' ');
    if (/[가-힣]/.test(visible)) throw new Error(item.file + ': Korean visible in static HTML');
    if (titles.has(title) || canonicals.has(canonical)) throw new Error(item.file + ': duplicate title or canonical');
    titles.add(title);
    canonicals.add(canonical);
    report.push({file:item.file,description:description.length,words:words(guide)});
  }
  const adapter = fs.readFileSync(path.join(enDir,'banks','spatial.js'),'utf8');
  const allSkills = new Set(expected.flatMap(function(item){ return item.skills; }));
  for (const skill of allSkills) {
    if (!adapter.includes("['" + skill + "'")) throw new Error('Adapter is missing source skill ' + skill);
  }
  return {pages:report.length,uniqueTitles:titles.size,uniqueCanonicals:canonicals.size,results:report};
}

function serverFor(directory) {
  const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.json':'application/json'};
  return http.createServer(function(req,res) {
    const pathname = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    let file = path.resolve(directory,'.' + pathname);
    if (!file.startsWith(directory)) { res.writeHead(403).end(); return; }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file,'index.html');
    if (!fs.existsSync(file)) { res.writeHead(404).end('Not found'); return; }
    res.setHeader('Content-Type',mime[path.extname(file)] || 'application/octet-stream');
    res.end(fs.readFileSync(file));
  });
}

function signatureScript() {
  return Array.from(document.querySelectorAll('.bank-question')).map(function(node){
    const copy = node.cloneNode(true);
    copy.querySelectorAll('.bank-answer').forEach(function(answer){ answer.remove(); });
    return copy.textContent.replace(/\s+/g,' ').trim();
  }).join('|');
}

async function pagesInPdf(page,format) {
  const bytes = await page.pdf({format:format,printBackground:true,displayHeaderFooter:false});
  return (await PDFDocument.load(bytes)).getPageCount();
}

async function browserCheck() {
  const server = serverFor(root);
  await new Promise(function(resolve){ server.listen(0,'127.0.0.1',resolve); });
  const port = server.address().port;
  const candidates = [process.env.GD_CHROME,chromium.executablePath(),'C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].filter(Boolean);
  const executablePath = candidates.find(function(file){ return fs.existsSync(file); });
  if (!executablePath) throw new Error('No Chromium-compatible browser found');
  const browser = await chromium.launch({headless:true,executablePath:executablePath});
  const page = await browser.newPage({viewport:{width:1440,height:1100}});
  const errors = [];
  page.on('pageerror',function(error){ errors.push(error.message); });
  const results = [];
  try {
    for (const item of expected) {
      const url = 'http://127.0.0.1:' + port + '/en/' + item.file + '?set=24681357';
      await page.goto(url,{waitUntil:'domcontentloaded'});
      await page.waitForFunction(function(){ return document.querySelectorAll('.bank-question').length > 0 && document.querySelector('#save-pdf'); });
      const before = await page.evaluate(function(){
        return {
          title:document.title,
          h1:document.querySelector('main aside > h1') && document.querySelector('main aside > h1').textContent.trim(),
          canonical:document.querySelector('link[rel=canonical]') && document.querySelector('link[rel=canonical]').href,
          count:document.querySelectorAll('.bank-question').length,
          answers:document.querySelectorAll('.bank-answer').length,
          mode:document.querySelector('#mode') && document.querySelector('#mode').textContent.trim(),
          set:document.querySelector('#set') && document.querySelector('#set').textContent,
          text:document.querySelector('.paper') && document.querySelector('.paper').textContent,
          signature:(function(){ return Array.from(document.querySelectorAll('.bank-question')).map(function(node){ const copy=node.cloneNode(true); copy.querySelectorAll('.bank-answer').forEach(function(answer){answer.remove();}); return copy.textContent.replace(/\s+/g,' ').trim(); }).join('|'); })(),
          skills:globalThis.SpatialPractice.lastGenerated(),
          topNotes:Array.from(document.querySelectorAll('.diagram-note')).map(function(node){return node.textContent.trim();}),
          pdf:typeof window.GDPreparePDF === 'function' && !!document.querySelector('#save-pdf'),
          spatialClass:document.querySelector('.paper').classList.contains('spatial-sheet')
        };
      });
      if (before.title !== item.title + ' | Googoodan' || before.h1 !== item.title || before.canonical !== 'https://googoodan.com/en/' + item.file) throw new Error(item.file + ': runtime SEO mismatch');
      if (before.count !== item.count || before.answers !== 0 || before.mode !== 'Practice worksheet' || !before.pdf || !before.spatialClass) throw new Error(item.file + ': invalid initial worksheet state');
      if (/[가-힣]/.test(before.text)) throw new Error(item.file + ': Korean text in worksheet');
      if (before.topNotes.some(function(note){ return !note.startsWith('Top view'); })) throw new Error(item.file + ': top-view note not translated');
      const actualSkills = new Set(before.skills.map(function(row){ return row.skill; }));
      for (const skill of item.skills) if (!actualSkills.has(skill)) throw new Error(item.file + ': source skill not generated: ' + skill);
      for (const row of before.skills) {
        const textual = {sphere:'radius','prism-net':'triangular prism','cylinder-net':'rectangle'};
        if (textual[row.skill]) {
          if (row.answer !== textual[row.skill]) throw new Error(item.file + ': text answer translation mismatch for ' + row.skill);
        } else if (row.answer !== row.sourceAnswer) {
          throw new Error(item.file + ': source numeric answer changed for ' + row.skill);
        }
      }

      await page.click('#answers');
      const answer = await page.evaluate(function(){
        return {
          mode:document.querySelector('#mode').textContent.trim(),
          count:document.querySelectorAll('.bank-answer').length,
          text:document.querySelector('.paper').textContent,
          signature:(function(){ return Array.from(document.querySelectorAll('.bank-question')).map(function(node){ const copy=node.cloneNode(true); copy.querySelectorAll('.bank-answer').forEach(function(answer){answer.remove();}); return copy.textContent.replace(/\s+/g,' ').trim(); }).join('|'); })(),
          worksheetChecked:document.querySelector('#print-worksheet').checked,
          answerChecked:document.querySelector('#print-answer').checked
        };
      });
      if (answer.mode !== 'Answer key' || answer.count !== before.count || answer.signature !== before.signature || /[가-힣]/.test(answer.text)) throw new Error(item.file + ': answer key mismatch');
      if (answer.worksheetChecked || !answer.answerChecked) throw new Error(item.file + ': answer selection did not follow preview');

      await page.click('#new');
      const afterNew = await page.evaluate(function(){
        return {set:document.querySelector('#set').textContent,signature:Array.from(document.querySelectorAll('.bank-question')).map(function(node){return node.textContent;}).join('|')};
      });
      if (afterNew.set === before.set || afterNew.signature === before.signature) throw new Error(item.file + ': New problems did not create a new set');

      await page.click('#questions');
      await page.evaluate(function(){ window.GDPreparePDF(); });
      const questionLetter = await pagesInPdf(page,'Letter');
      await page.evaluate(function(){ window.GDPreparePDF(); });
      const questionA4 = await pagesInPdf(page,'A4');
      await page.click('#answers');
      await page.evaluate(function(){ window.GDPreparePDF(); });
      const answerLetter = await pagesInPdf(page,'Letter');
      await page.evaluate(function(){ window.GDPreparePDF(); });
      const answerA4 = await pagesInPdf(page,'A4');
      if ([questionLetter,questionA4,answerLetter,answerA4].some(function(count){return count !== 1;})) throw new Error(item.file + ': print pages L' + questionLetter + '/A4' + questionA4 + '/AL' + answerLetter + '/AA4' + answerA4);
      results.push({file:item.file,questions:before.count,answers:answer.count,questionLetter:questionLetter,questionA4:questionA4,answerLetter:answerLetter,answerA4:answerA4,skills:Array.from(actualSkills)});
    }
  } finally {
    await browser.close();
    await new Promise(function(resolve){server.close(resolve);});
  }
  if (errors.length) throw new Error('Browser errors:\n' + errors.join('\n'));
  return {pages:results.length,results:results};
}

(async function(){
  const report = {static:staticCheck()};
  if (process.argv.includes('--browser')) report.browser = await browserCheck();
  process.stdout.write(JSON.stringify(report,null,2) + '\n');
})().catch(function(error){ console.error(error.stack || error); process.exitCode = 1; });
