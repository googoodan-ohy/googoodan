const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

const enDir = __dirname;
const rootDir = path.dirname(enDir);
const pageDir = path.join(enDir, 'print', 'early-skill-practice');
const manifestPath = path.join(pageDir, 'manifest.json');

function captures(html, pattern) {
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
  const expectedByFile = new Map(manifest.pages.map(page => [path.basename(page.file), page]));
  const sets = { title: new Set(), description: new Set(), canonical: new Set(), h1: new Set(), profile: new Set() };
  const errors = [];

  if (files.length !== manifest.count) errors.push(`Manifest count ${manifest.count}, HTML count ${files.length}`);
  if (manifest.count !== 32) errors.push(`Expected 32 pages, found ${manifest.count}`);

  for (const file of files) {
    const item = expectedByFile.get(file);
    if (!item) {
      errors.push(`${file}: missing from manifest`);
      continue;
    }
    const html = fs.readFileSync(path.join(pageDir, file), 'utf8');
    const fields = {
      title: captures(html, /<title>([\s\S]*?)<\/title>/gi),
      description: captures(html, /<meta name="description" content="([^"]*)">/gi),
      canonical: captures(html, /<link rel="canonical" href="([^"]*)">/gi),
      h1: captures(html, /<h1>([\s\S]*?)<\/h1>/gi),
      profile: captures(html, /data-static-profile="([^"]*)"/gi)
    };
    for (const [name, values] of Object.entries(fields)) {
      if (values.length !== 1) errors.push(`${file}: ${name} count ${values.length}`);
      else sets[name].add(values[0]);
    }
    if (fields.title[0] !== item.title) errors.push(`${file}: title differs from manifest`);
    if (fields.description[0] !== item.description) errors.push(`${file}: description differs from manifest`);
    if (fields.canonical[0] !== item.url) errors.push(`${file}: canonical differs from manifest`);
    if (fields.h1[0] !== item.h1) errors.push(`${file}: h1 differs from manifest`);
    if (fields.profile[0] !== item.profile) errors.push(`${file}: profile differs from manifest`);
    if (item.description.length < 120 || item.description.length > 180) errors.push(`${file}: description length ${item.description.length}`);
    if (visibleWords(html) < 245) errors.push(`${file}: static content only ${visibleWords(html)} words`);
    for (const language of ['en', 'ko', 'ja', 'fr', 'de', 'x-default']) {
      const count = (html.match(new RegExp(`<link rel="alternate" hreflang="${language}"`, 'g')) || []).length;
      if (count !== 1) errors.push(`${file}: hreflang ${language} count ${count}`);
    }
    const json = captures(html, /<script id="website-identity" type="application\/ld\+json">([\s\S]*?)<\/script>/gi);
    if (json.length !== 1) errors.push(`${file}: JSON-LD count ${json.length}`);
    else {
      try { JSON.parse(json[0]); } catch (error) { errors.push(`${file}: invalid JSON-LD (${error.message})`); }
    }
    if (/<a class="language-link" href="\/">Korean/.test(html)) errors.push(`${file}: Korean link points to root`);
  }

  for (const [name, values] of Object.entries(sets)) {
    if (values.size !== files.length) errors.push(`${name}: expected ${files.length} unique values, found ${values.size}`);
  }
  if (errors.length) throw new Error(`Static checks failed:\n${errors.join('\n')}`);
  return { pages: files.length, unique: Object.fromEntries(Object.entries(sets).map(([key, value]) => [key, value.size])) };
}

function contentType(file) {
  return ({
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png'
  })[path.extname(file).toLowerCase()] || 'application/octet-stream';
}

function localServer() {
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
  const server = localServer();
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
  const browser = await chromium.launch({ headless: true, executablePath });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, route => route.abort());

  for (const item of manifest.pages) {
    const file = path.basename(item.file);
    await page.goto(`http://127.0.0.1:${port}/en/print/early-skill-practice/${file}`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.DrillPage && document.querySelectorAll('.paper .problem').length > 0);
    const state = await page.evaluate(() => ({
      context: window.DrillPage.inspect(),
      title: document.title,
      h1: document.querySelector('aside h1')?.textContent.trim(),
      canonical: document.querySelector('link[rel=canonical]')?.href,
      problemCount: document.querySelectorAll('.paper .problem').length,
      koreanText: /[가-힣]/.test(document.querySelector('.paper')?.textContent || '')
    }));
    if (state.context.unit !== item.stage || state.context.profile !== item.profile) throw new Error(`${file}: wrong generator context`);
    if (state.title !== item.title || state.h1 !== item.h1 || state.canonical !== item.url) throw new Error(`${file}: runtime SEO changed`);
    if (state.problemCount < 6) throw new Error(`${file}: only ${state.problemCount} problems`);
    if (state.koreanText) throw new Error(`${file}: Korean text in worksheet`);
  }

  const representatives = [
    'kindergarten-addition-within-5.html',
    '1st-grade-subtraction-within-20.html',
    '2nd-grade-missing-digit-two-digit-addition.html',
    '2nd-grade-vertical-three-digit-subtraction-with-regrouping.html',
    '2nd-grade-repeated-addition.html'
  ];
  const results = [];
  for (const file of representatives) {
    await page.goto(`http://127.0.0.1:${port}/en/print/early-skill-practice/${file}`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.DrillPage && document.querySelectorAll('.paper .problem').length > 0);
    const before = await page.locator('#set').textContent();
    const questions = await page.locator('.paper .problem').allTextContents();
    await page.click('#answers');
    const answerState = await page.evaluate(() => ({
      mode: document.querySelector('#mode')?.textContent,
      visibleAnswers: [...document.querySelectorAll('.drill-solution,.answer')].filter(node => getComputedStyle(node).visibility !== 'hidden' && getComputedStyle(node).display !== 'none').length,
      worksheetChecked: document.querySelector('#print-worksheet')?.checked,
      answerChecked: document.querySelector('#print-answer')?.checked
    }));
    const answers = await page.locator('.paper .problem').allTextContents();
    if (answerState.mode !== 'Answer key' || answerState.visibleAnswers < 1 || answerState.worksheetChecked || !answerState.answerChecked) throw new Error(`${file}: answer view did not synchronize`);
    if (questions.length !== answers.length) throw new Error(`${file}: worksheet and answer counts differ`);
    if (JSON.stringify(questions) !== JSON.stringify(answers)) throw new Error(`${file}: worksheet and answer problem order changed`);
    await page.click('#new');
    const after = await page.locator('#set').textContent();
    if (before === after) throw new Error(`${file}: New numbers did not change the set`);
    await page.evaluate(() => { document.querySelector('#questions').click(); window.GDPreparePDF(); });
    const bundle = await page.evaluate(() => ({ count: document.querySelectorAll('#print-bundle > .paper').length, mode: document.querySelector('#print-bundle #mode')?.textContent || document.querySelector('#print-bundle .paper-top span:last-child')?.textContent }));
    if (bundle.count !== 1 || bundle.mode !== 'Worksheet') throw new Error(`${file}: print bundle mismatch`);
    const letterPages = (await PDFDocument.load(await page.pdf({ format: 'Letter', printBackground: true, displayHeaderFooter: false }))).getPageCount();
    await page.evaluate(() => window.GDPreparePDF());
    const a4Pages = (await PDFDocument.load(await page.pdf({ format: 'A4', printBackground: true, displayHeaderFooter: false }))).getPageCount();
    if (letterPages !== 1 || a4Pages !== 1) throw new Error(`${file}: Letter ${letterPages}, A4 ${a4Pages}`);
    results.push({ file, problems: questions.length, visibleAnswers: answerState.visibleAnswers, letterPages, a4Pages });
  }

  await browser.close();
  await new Promise(resolve => server.close(resolve));
  if (pageErrors.length) throw new Error(`Browser errors:\n${pageErrors.join('\n')}`);
  return { allProfilesLoaded: manifest.pages.length, representatives: results };
}

(async () => {
  const report = { static: staticCheck() };
  if (process.argv.includes('--browser')) report.browser = await browserCheck();
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
})().catch(error => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
