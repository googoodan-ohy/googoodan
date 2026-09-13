const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

const enDir = __dirname;
const rootDir = path.dirname(enDir);
const pageDir = path.join(enDir, 'print', 'common-core-arithmetic');
const manifestPath = path.join(pageDir, 'manifest.json');

function matches(html, pattern) {
  return [...html.matchAll(pattern)].map(match => match[1]);
}

function visibleWords(html) {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z0-9#]+;/gi, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function staticCheck() {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const files = fs.readdirSync(pageDir).filter(file => file.endsWith('.html')).sort();
  const expectedProfiles = new Set(manifest.pages.map(page => page.profile));
  const titles = new Set();
  const descriptions = new Set();
  const canonicals = new Set();
  const h1s = new Set();
  const errors = [];

  if (files.length !== 34) errors.push(`Expected 34 HTML files, found ${files.length}`);
  if (manifest.grades['1'] !== 15 || manifest.grades['2'] !== 19) errors.push('Manifest grade counts are not 15 and 19');
  if (expectedProfiles.size !== 34) errors.push(`Expected 34 unique profiles, found ${expectedProfiles.size}`);

  for (const file of files) {
    const html = fs.readFileSync(path.join(pageDir, file), 'utf8');
    const title = matches(html, /<title>([\s\S]*?)<\/title>/gi);
    const description = matches(html, /<meta name="description" content="([^"]*)">/gi);
    const canonical = matches(html, /<link rel="canonical" href="([^"]*)">/gi);
    const h1 = matches(html, /<h1>([\s\S]*?)<\/h1>/gi);
    const profile = matches(html, /data-static-profile="([^"]+)"/gi);
    const selfAlternate = matches(html, /<link rel="alternate" hreflang="en" href="([^"]*)">/gi);
    const jsonLd = matches(html, /<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi);
    const expectedUrl = `https://googoodan.com/en/print/common-core-arithmetic/${file}`;

    if (title.length !== 1) errors.push(`${file}: title count ${title.length}`);
    if (description.length !== 1) errors.push(`${file}: description count ${description.length}`);
    if (canonical.length !== 1 || canonical[0] !== expectedUrl) errors.push(`${file}: bad canonical`);
    if (h1.length !== 1) errors.push(`${file}: h1 count ${h1.length}`);
    if (profile.length !== 1 || !expectedProfiles.has(profile[0])) errors.push(`${file}: bad profile`);
    if (selfAlternate.length !== 1 || selfAlternate[0] !== expectedUrl) errors.push(`${file}: bad en hreflang`);
    if (description[0] && (description[0].length < 120 || description[0].length > 180)) errors.push(`${file}: description length ${description[0].length}`);
    if (visibleWords(html) < 240) errors.push(`${file}: fewer than 240 visible words`);
    if (jsonLd.length !== 1) errors.push(`${file}: JSON-LD count ${jsonLd.length}`);
    else {
      try { JSON.parse(jsonLd[0]); } catch (error) { errors.push(`${file}: invalid JSON-LD (${error.message})`); }
    }
    title.forEach(value => titles.add(value));
    description.forEach(value => descriptions.add(value));
    canonical.forEach(value => canonicals.add(value));
    h1.forEach(value => h1s.add(value));
  }

  for (const [label, values] of [['titles', titles], ['descriptions', descriptions], ['canonicals', canonicals], ['h1s', h1s]]) {
    if (values.size !== files.length) errors.push(`Expected ${files.length} unique ${label}, found ${values.size}`);
  }
  if (errors.length) throw new Error(`Static checks failed:\n${errors.join('\n')}`);
  return { files: files.length, titles: titles.size, descriptions: descriptions.size, canonicals: canonicals.size, h1s: h1s.size };
}

function contentType(file) {
  const ext = path.extname(file).toLowerCase();
  return ({ '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.json': 'application/json; charset=utf-8', '.png': 'image/png' })[ext] || 'application/octet-stream';
}

function server() {
  return http.createServer((request, response) => {
    const urlPath = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const normalized = path.normalize(urlPath).replace(/^([/\\])+/, '');
    const file = path.join(rootDir, normalized || 'index.html');
    if (!file.startsWith(rootDir) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      response.writeHead(404).end('Not found');
      return;
    }
    response.writeHead(200, { 'content-type': contentType(file), 'cache-control': 'no-store' });
    fs.createReadStream(file).pipe(response);
  });
}

async function browserCheck() {
  const { chromium } = require('playwright');
  const { PDFDocument } = require('pdf-lib');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const testServer = server();
  await new Promise(resolve => testServer.listen(0, '127.0.0.1', resolve));
  const port = testServer.address().port;
  const browserPaths = [process.env.GD_CHROME, chromium.executablePath(), 'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].filter(Boolean);
  const executablePath = browserPaths.find(candidate => fs.existsSync(candidate));
  if (!executablePath) throw new Error('No Chromium-compatible browser was found');
  const browser = await chromium.launch({ headless: true, executablePath });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, route => route.abort());

  const loaded = [];
  for (const item of manifest.pages) {
    const file = path.basename(item.file);
    const url = `http://127.0.0.1:${port}/en/print/common-core-arithmetic/${file}`;
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.DrillPage && document.querySelectorAll('.paper .problem').length > 0);
    const state = await page.evaluate(() => ({
      context: window.DrillPage.inspect(),
      profile: document.body.dataset.staticProfile,
      title: document.title,
      h1: document.querySelector('h1')?.textContent.trim(),
      canonical: document.querySelector('link[rel=canonical]')?.href,
      problems: document.querySelectorAll('.paper .problem').length
    }));
    if (state.context.profile !== item.profile || state.profile !== item.profile) throw new Error(`${file}: loaded ${state.context.profile}, expected ${item.profile}`);
    if (state.context.unit !== item.unit) throw new Error(`${file}: loaded ${state.context.unit}, expected ${item.unit}`);
    if (state.canonical !== item.url) throw new Error(`${file}: rendered canonical changed to ${state.canonical}`);
    if (!state.title.startsWith(item.title.replace(/ \| Googoodan$/, ''))) throw new Error(`${file}: rendered title changed to ${state.title}`);
    if (state.problems < 4) throw new Error(`${file}: only ${state.problems} problems rendered`);
    loaded.push(item.profile);
  }

  const representatives = [
    'grade-1-within20-horizontal-practice.html',
    'grade-1-add100-missing-number-practice.html',
    'grade-2-within1000-vertical-practice.html',
    'grade-2-fouradd-word-problems.html'
  ];
  const interactionResults = [];
  for (const file of representatives) {
    const url = `http://127.0.0.1:${port}/en/print/common-core-arithmetic/${file}`;
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.DrillPage && document.querySelectorAll('.paper .problem').length > 0);
    const before = await page.locator('#set').textContent();
    await page.click('#answers');
    const answerState = await page.evaluate(() => ({
      label: document.querySelector('#mode')?.textContent,
      visible: [...document.querySelectorAll('.drill-solution,.answer')].filter(element => getComputedStyle(element).visibility !== 'hidden' && getComputedStyle(element).display !== 'none').length,
      answerChecked: document.querySelector('#print-answer')?.checked,
      questionChecked: document.querySelector('#print-worksheet')?.checked
    }));
    if (answerState.label !== 'Answer key' || answerState.visible < 1 || !answerState.answerChecked || answerState.questionChecked) throw new Error(`${file}: answer preview did not synchronize`);
    await page.click('#questions');
    const questionState = await page.evaluate(() => ({
      label: document.querySelector('#mode')?.textContent,
      concealed: document.querySelectorAll('.drill-solution.concealed').length,
      answerChecked: document.querySelector('#print-answer')?.checked,
      questionChecked: document.querySelector('#print-worksheet')?.checked
    }));
    if (questionState.label !== 'Worksheet' || !questionState.questionChecked || questionState.answerChecked) throw new Error(`${file}: worksheet preview did not synchronize`);
    await page.click('#new');
    const after = await page.locator('#set').textContent();
    if (after === before) throw new Error(`${file}: new numbers did not change the set`);
    await page.evaluate(() => window.GDPreparePDF());
    const bundle = await page.evaluate(() => ({
      pages: document.querySelectorAll('#print-bundle > .paper').length,
      mode: document.querySelector('#print-bundle .paper-top > span:last-child')?.textContent
    }));
    if (bundle.pages !== 1 || bundle.mode !== 'Worksheet') throw new Error(`${file}: print bundle did not match worksheet selection`);
    const letterPdf = await page.pdf({ format: 'Letter', printBackground: true, displayHeaderFooter: false });
    const letterPages = (await PDFDocument.load(letterPdf)).getPageCount();
    await page.evaluate(() => window.GDPreparePDF());
    const a4Pdf = await page.pdf({ format: 'A4', printBackground: true, displayHeaderFooter: false });
    const a4Pages = (await PDFDocument.load(a4Pdf)).getPageCount();
    if (letterPages !== 1 || a4Pages !== 1) throw new Error(`${file}: expected one-page PDFs, got Letter ${letterPages} and A4 ${a4Pages}`);
    interactionResults.push({ file, answerVisible: answerState.visible, printPages: bundle.pages, letterPages, a4Pages });
  }

  await browser.close();
  await new Promise(resolve => testServer.close(resolve));
  if (errors.length) throw new Error(`Browser page errors:\n${errors.join('\n')}`);
  return { loadedProfiles: loaded.length, representatives: interactionResults };
}

(async () => {
  const staticResult = staticCheck();
  const report = { static: staticResult };
  if (process.argv.includes('--browser')) report.browser = await browserCheck();
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
})().catch(error => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
