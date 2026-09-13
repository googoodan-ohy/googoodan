'use strict';
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');
const { PDFDocument } = require('pdf-lib');

const root = path.resolve(__dirname, '..');
const enDir = __dirname;
const manifestPath = path.join(enDir, 'high-value-activity-pages-manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const expected = new Set([
  'subtraction-color-by-number.html',
  'tape-diagram-word-problems.html',
  'balance-the-equation.html',
  'make-10-subtraction.html',
  'choose-operation-word-problems.html',
  'math-mistake-detective.html',
  'find-the-unknown-word-problems.html',
  'compare-word-problems-more-fewer.html',
  'word-problems-with-extra-information.html',
  'open-ended-math-word-problems.html',
  'subtracting-three-numbers.html',
  'greater-than-less-than-number-clues.html'
]);

function match(html, pattern, label, file) {
  const found = html.match(pattern);
  if (!found) throw new Error(`${file}: missing ${label}`);
  return found[1];
}
function visibleWords(html) {
  return html.replace(/<script\b[\s\S]*?<\/script>/gi, ' ').replace(/<style\b[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&\w+;/g, ' ').trim().split(/\s+/).filter(Boolean).length;
}
function staticCheck() {
  if (manifest.count !== expected.size || manifest.pages.length !== expected.size) throw new Error('Manifest must contain exactly twelve pages');
  if (new Set(manifest.pages.map(item => item.file)).size !== expected.size) throw new Error('Duplicate manifest file');
  for (const file of expected) if (!manifest.pages.some(item => item.file === file)) throw new Error(`Manifest missing ${file}`);
  const titles = new Set();
  const canonicals = new Set();
  const report = [];
  for (const item of manifest.pages) {
    const filePath = path.join(enDir, item.file);
    if (!fs.existsSync(filePath)) throw new Error(`Missing ${item.file}`);
    const html = fs.readFileSync(filePath, 'utf8');
    const title = match(html, /<title>([^<]+)<\/title>/i, 'title', item.file);
    const description = match(html, /<meta name="description" content="([^"]+)">/i, 'description', item.file);
    const canonical = match(html, /<link rel="canonical" href="([^"]+)">/i, 'canonical', item.file);
    const h1 = match(html, /<aside><h1>([^<]+)<\/h1>/i, 'H1', item.file);
    const guide = match(html, /(<section class="seo-resource" aria-labelledby="activity-guide-heading">[\s\S]*?<\/section>)<\/body>/i, 'static guide', item.file);
    const wordCount = visibleWords(guide);
    if (title !== `${item.title} | Googoodan` || h1 !== item.title) throw new Error(`${item.file}: title/H1 mismatch`);
    if (canonical !== item.canonical) throw new Error(`${item.file}: canonical mismatch`);
    if (description !== item.description || description.length < 120 || description.length > 180) throw new Error(`${item.file}: description length/identity ${description.length}`);
    if (wordCount < 250) throw new Error(`${item.file}: only ${wordCount} static guide words`);
    if (!/<meta name="robots" content="index,follow">/i.test(html)) throw new Error(`${item.file}: robots meta missing`);
    if (!html.includes('/en/high-value-activity-entry.js?v=20260913-us-activity-batch2')) throw new Error(`${item.file}: focused adapter missing`);
    if (!html.includes('/answer-boxes.css?v=20260913-bank-answers') || !html.includes('/answer-boxes.js?v=20260913-bank-answers')) throw new Error(`${item.file}: answer box cache version is stale`);
    const required = {en:item.canonical,ko:'https://googoodan.com/ko/',ja:'https://googoodan.com/ja/',fr:'https://googoodan.com/fr/',de:'https://googoodan.com/de/','x-default':'https://googoodan.com/'};
    for (const [lang, href] of Object.entries(required)) {
      const count = [...html.matchAll(new RegExp(`<link rel="alternate" hreflang="${lang}" href="([^"]+)">`, 'g'))];
      if (count.length !== 1 || count[0][1] !== href) throw new Error(`${item.file}: invalid ${lang} hreflang`);
    }
    const structuredScripts = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)];
    if (structuredScripts.length !== 1) throw new Error(`${item.file}: expected one JSON-LD graph`);
    const data = JSON.parse(structuredScripts[0][1]);
    const resource = data['@graph']?.find(node => Array.isArray(node['@type']) && node['@type'].includes('LearningResource'));
    if (!resource || resource.name !== item.title || resource.url !== item.canonical || resource.description !== item.description || resource.isAccessibleForFree !== true) throw new Error(`${item.file}: invalid LearningResource JSON-LD`);
    const cleanVisible = html.replace(/<script\b[\s\S]*?<\/script>/gi, ' ').replace(/<style\b[\s\S]*?<\/style>/gi, ' ');
    if (/[가-힣]/.test(cleanVisible)) throw new Error(`${item.file}: Korean text in visible static HTML`);
    if (/[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(html)) throw new Error(`${item.file}: C0 control character found`);
    if (titles.has(title) || canonicals.has(canonical)) throw new Error(`${item.file}: duplicate title or canonical in set`);
    titles.add(title); canonicals.add(canonical);
    report.push({file:item.file, words:wordCount, description:description.length});
  }
  const existingTitles = new Map();
  for (const file of fs.readdirSync(enDir).filter(name => name.endsWith('.html') && !expected.has(name))) {
    const html = fs.readFileSync(path.join(enDir, file), 'utf8');
    const title = html.match(/<title>([^<]+)<\/title>/i)?.[1];
    if (title) existingTitles.set(title, file);
  }
  for (const item of manifest.pages) {
    const title = `${item.title} | Googoodan`;
    if (existingTitles.has(title)) throw new Error(`${item.file}: title duplicates ${existingTitles.get(title)}`);
  }
  return {count:report.length, uniqueTitles:titles.size, uniqueCanonicals:canonicals.size, pages:report};
}

function serverFor(directory) {
  const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.json':'application/json'};
  const server = http.createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    let file = path.resolve(directory, '.' + pathname);
    if (!file.startsWith(directory)) { res.writeHead(403).end(); return; }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (!fs.existsSync(file)) { res.writeHead(404).end('Not found'); return; }
    res.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream');
    res.end(fs.readFileSync(file));
  });
  return server;
}

async function browserCheck() {
  const server = serverFor(root);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const candidates = [
    process.env.GD_CHROME,
    chromium.executablePath(),
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
  ].filter(Boolean);
  const executablePath = candidates.find(file => fs.existsSync(file));
  if (!executablePath) throw new Error('No Chromium-compatible browser found');
  const browser = await chromium.launch({headless:true, executablePath});
  const page = await browser.newPage({viewport:{width:1440,height:1100}});
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  const results = [];
  try {
    for (const item of manifest.pages) {
      const url = `http://127.0.0.1:${port}/en/${item.file}?set=24681357`;
      await page.goto(url, {waitUntil:'domcontentloaded'});
      await page.waitForFunction(() => document.querySelectorAll('.bank-question,.color-cell').length > 0 && document.querySelector('#save-pdf'));
      const before = await page.evaluate(() => {
        const signature = () => [...document.querySelectorAll('.bank-question,.color-cell')].map(node => {
          const copy = node.cloneNode(true);
          copy.querySelectorAll('.bank-answer,small').forEach(answer => answer.remove());
          return copy.textContent.replace(/\s+/g, ' ').trim();
        });
        return {
          title:document.title,
          h1:document.querySelector('main aside > h1')?.textContent.trim(),
          canonical:document.querySelector('link[rel=canonical]')?.href,
          mode:document.querySelector('#mode')?.textContent.trim(),
          set:document.querySelector('#set')?.textContent,
          count:document.querySelectorAll('.bank-question,.color-cell').length,
          signature:JSON.stringify(signature()),
          text:document.querySelector('.paper')?.textContent || '',
          bars:document.querySelectorAll('.story-bar').length,
          minus:[...document.querySelectorAll('.color-cell,.kequation')].filter(node => node.textContent.includes('−')).length,
          choose:[...document.querySelectorAll('.bank-question')].filter(node => node.textContent.includes('Choose an equation')).length,
          keyRanges:document.querySelectorAll('.color-key span').length,
          prompts:[...document.querySelectorAll('.bank-question > p:first-of-type')].map(node => node.textContent.replace(/\s+/g, ' ').trim()),
          equations:[...document.querySelectorAll('.kequation')].map(node => node.textContent.replace(/\s+/g, ' ').trim()),
          numberCardRows:[...document.querySelectorAll('.number-cards')].map(row => [...row.querySelectorAll('b')].map(node => Number(node.textContent))),
          pdfButton:!!document.querySelector('#save-pdf'),
          preparePDF:typeof window.GDPreparePDF === 'function'
        };
      });
      if (before.title !== `${item.title} | Googoodan` || before.h1 !== item.title || before.canonical !== item.canonical) throw new Error(`${item.file}: runtime SEO changed ${JSON.stringify({actual:{title:before.title,h1:before.h1,canonical:before.canonical},expected:{title:`${item.title} | Googoodan`,h1:item.title,canonical:item.canonical}})}`);
      if (before.mode !== 'Practice worksheet' || before.count < 3 || /[가-힣]/.test(before.text)) throw new Error(`${item.file}: invalid worksheet preview`);
      if (!before.pdfButton || !before.preparePDF) throw new Error(`${item.file}: PDF control unavailable`);
      if (item.family === 'color' && (before.count !== 16 || before.minus !== 16 || before.keyRanges !== 4)) throw new Error(`${item.file}: subtraction color mode not fixed ${JSON.stringify({count:before.count,minus:before.minus,keyRanges:before.keyRanges,text:before.text.slice(0,900)})}`);
      if (item.file === 'tape-diagram-word-problems.html' && before.bars !== 3) throw new Error(`${item.file}: tape diagrams missing`);
      if (item.file === 'choose-operation-word-problems.html' && before.choose !== 3) throw new Error(`${item.file}: choose-operation prompts missing`);
      if (item.file === 'balance-the-equation.html' && (before.count !== 6 || before.minus !== 0)) throw new Error(`${item.file}: balance profile mismatch`);
      if (item.file === 'make-10-subtraction.html' && (before.count !== 6 || before.minus !== 6)) throw new Error(`${item.file}: make-10 subtraction profile mismatch`);
      if (item.file === 'math-mistake-detective.html' && before.count !== 6) throw new Error(`${item.file}: detective profile mismatch`);
      if (item.file === 'find-the-unknown-word-problems.html' && (before.count !== 3 || !before.prompts.some(text => text.startsWith('Alex has')) || !before.prompts.some(text => text.startsWith('After Maya brings')) || !before.prompts.some(text => text.includes('for school supplies')))) throw new Error(`${item.file}: unknown-position story profile mismatch`);
      if (item.file === 'compare-word-problems-more-fewer.html' && (before.count !== 4 || before.prompts.filter(text => text.includes('more than')).length !== 2 || before.prompts.filter(text => text.includes('fewer')).length !== 2)) throw new Error(`${item.file}: compare-more/fewer filter mismatch`);
      if (item.file === 'word-problems-with-extra-information.html' && (before.count !== 3 || !before.prompts.some(text => text.includes('room 8')) || !before.prompts.some(text => text.includes('6 notebooks')) || !before.prompts.some(text => text.includes('sister is 7 years old')))) throw new Error(`${item.file}: extra-information profile mismatch`);
      if (item.file === 'open-ended-math-word-problems.html' && (before.count !== 3 || !before.text.includes('Write a question') || !before.text.includes('A friend says') || !before.text.includes('Why?'))) throw new Error(`${item.file}: open-ended profile mismatch`);
      if (item.file === 'subtracting-three-numbers.html' && (before.count !== 6 || before.equations.length !== 6 || before.equations.some(text => text.split(String.fromCharCode(8722)).length - 1 !== 2))) throw new Error(`${item.file}: three-number subtraction mismatch`);
      if (item.file === 'greater-than-less-than-number-clues.html' && (before.count !== 4 || before.prompts.some(text => !text.includes('greater than') || !text.includes('less than')) || before.numberCardRows.length !== 4 || before.numberCardRows.some(values => values.length !== 4 || values.some(value => value < 1 || value > 9)))) throw new Error(`${item.file}: number-clue profile mismatch`);

      await page.click('#answers');
      const answer = await page.evaluate(() => {
        const signature = () => [...document.querySelectorAll('.bank-question,.color-cell')].map(node => {
          const copy = node.cloneNode(true);
          copy.querySelectorAll('.bank-answer,small').forEach(answer => answer.remove());
          return copy.textContent.replace(/\s+/g, ' ').trim();
        });
        return {
          mode:document.querySelector('#mode')?.textContent.trim(),
          signature:JSON.stringify(signature()),
          visibleAnswers:document.querySelectorAll('.bank-answer').length || [...document.querySelectorAll('.color-cell small')].filter(node => node.textContent.includes('·')).length,
          worksheetChecked:document.querySelector('#print-worksheet')?.checked,
          answerChecked:document.querySelector('#print-answer')?.checked,
          text:document.querySelector('.paper')?.textContent || ''
        };
      });
      if (answer.mode !== 'Answer key' || answer.signature !== before.signature || answer.visibleAnswers < before.count || /[가-힣]/.test(answer.text)) throw new Error(`${item.file}: answer key mismatch`);
      if (answer.worksheetChecked || !answer.answerChecked) throw new Error(`${item.file}: answer checkbox sync failed`);

      await page.click('#new');
      const afterNew = await page.evaluate(() => {
        const signature = [...document.querySelectorAll('.bank-question,.color-cell')].map(node => {
          const copy = node.cloneNode(true);
          copy.querySelectorAll('.bank-answer,small').forEach(answer => answer.remove());
          return copy.textContent.replace(/\s+/g, ' ').trim();
        });
        return {set:document.querySelector('#set')?.textContent, signature:JSON.stringify(signature)};
      });
      if (afterNew.set === before.set || afterNew.signature === before.signature) throw new Error(`${item.file}: New problems did not change the set and content`);
      await page.click('#questions');
      const printDom = await page.evaluate(() => ({paper:!!document.querySelector('.paper'),problems:!!document.querySelector('.problems'),set:!!document.querySelector('#set'),status:!!document.querySelector('#status'),bundle:!!document.querySelector('#print-bundle')}));
      if (!printDom.paper || !printDom.problems || !printDom.set || !printDom.status) throw new Error(`${item.file}: print source DOM missing ${JSON.stringify(printDom)}`);
      await page.evaluate(() => window.GDPreparePDF());
      const letter = (await PDFDocument.load(await page.pdf({format:'Letter',printBackground:true,displayHeaderFooter:false}))).getPageCount();
      await page.evaluate(() => window.GDPreparePDF());
      const a4 = (await PDFDocument.load(await page.pdf({format:'A4',printBackground:true,displayHeaderFooter:false}))).getPageCount();
      await page.click('#answers');
      await page.evaluate(() => window.GDPreparePDF());
      const answerLetter = (await PDFDocument.load(await page.pdf({format:'Letter',printBackground:true,displayHeaderFooter:false}))).getPageCount();
      await page.evaluate(() => window.GDPreparePDF());
      const answerA4 = (await PDFDocument.load(await page.pdf({format:'A4',printBackground:true,displayHeaderFooter:false}))).getPageCount();
      if ([letter,a4,answerLetter,answerA4].some(count => count !== 1)) throw new Error(`${item.file}: print pages L${letter}/A4${a4}/AL${answerLetter}/AA4${answerA4}`);
      results.push({file:item.file,questions:before.count,answers:answer.visibleAnswers,letter,a4,answerLetter,answerA4});
    }
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
  if (pageErrors.length) throw new Error(`Browser errors:\n${pageErrors.join('\n')}`);
  return {pages:results.length,results};
}

(async () => {
  const report = {static:staticCheck()};
  if (process.argv.includes('--browser')) report.browser = await browserCheck();
  process.stdout.write(JSON.stringify(report, null, 2) + '\n');
})().catch(error => { console.error(error.stack || error); process.exitCode = 1; });
