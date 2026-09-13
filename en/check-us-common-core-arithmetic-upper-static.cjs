const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const vm = require('node:vm');

const enDir = __dirname;
const rootDir = path.dirname(enDir);
const pageDir = path.join(enDir, 'print', 'common-core-arithmetic-upper');
const manifestPath = path.join(pageDir, 'manifest.json');

function captures(html, pattern) {
  const flags = pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`;
  return [...html.matchAll(new RegExp(pattern.source, flags))].map(match => match[1]);
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

function walkHtml(directory) {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walkHtml(full));
    else if (entry.isFile() && entry.name.endsWith('.html')) files.push(full);
  }
  return files;
}

function loadCatalog() {
  const sandbox = {
    console,
    Worksheets: {
      types: [],
      generate() { return []; },
      fraction(n, d) { return d === 1 ? String(n) : `${n}/${d}`; },
      exact() { return [0, 1]; }
    },
    DrillEngine: { gcd() { return 1; }, lcm() { return 1; } }
  };
  sandbox.globalThis = sandbox;
  vm.runInNewContext(fs.readFileSync(path.join(enDir, 'us-arithmetic-catalog.js'), 'utf8'), sandbox);
  return sandbox.USArithmetic;
}

function staticCheck() {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const files = fs.readdirSync(pageDir).filter(file => file.endsWith('.html')).sort();
  const catalog = loadCatalog();
  const expected = catalog.units
    .filter(unit => unit.grade >= 3 && unit.grade <= 6)
    .flatMap(unit => unit.drills.map(profile => ({ grade: unit.grade, unit: unit.id, profile: profile.id })));
  const expectedProfiles = new Set(expected.map(item => item.profile));
  const manifestProfiles = new Set(manifest.pages.map(page => page.profile));
  const expectedGradeCounts = Object.fromEntries([3, 4, 5, 6].map(grade => [grade, expected.filter(item => item.grade === grade).length]));
  const errors = [];
  const titles = new Set();
  const descriptions = new Set();
  const canonicals = new Set();
  const h1s = new Set();

  if (files.length !== expected.length) errors.push(`Expected ${expected.length} HTML files, found ${files.length}`);
  if (manifest.count !== expected.length) errors.push(`Manifest count ${manifest.count}, expected ${expected.length}`);
  for (const grade of [3, 4, 5, 6]) {
    if (Number(manifest.grades[String(grade)]) !== expectedGradeCounts[grade]) errors.push(`Grade ${grade}: manifest ${manifest.grades[String(grade)]}, expected ${expectedGradeCounts[grade]}`);
  }
  if (manifestProfiles.size !== expectedProfiles.size || [...expectedProfiles].some(id => !manifestProfiles.has(id))) {
    errors.push(`Manifest profile set does not match the ${expectedProfiles.size} renderable Grade 3-6 profiles`);
  }

  for (const file of files) {
    const html = fs.readFileSync(path.join(pageDir, file), 'utf8');
    const title = captures(html, /<title>([\s\S]*?)<\/title>/gi);
    const description = captures(html, /<meta name="description" content="([^"]*)">/gi);
    const canonical = captures(html, /<link rel="canonical" href="([^"]*)">/gi);
    const h1 = captures(html, /<h1>([\s\S]*?)<\/h1>/gi);
    const unit = captures(html, /data-static-unit="([^"]+)"/gi);
    const profile = captures(html, /data-static-profile="([^"]+)"/gi);
    const jsonLd = captures(html, /<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi);
    const expectedUrl = `https://googoodan.com/en/print/common-core-arithmetic-upper/${file}`;
    const entry = manifest.pages.find(page => path.basename(page.file) === file);
    const alternates = Object.fromEntries([...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)">/gi)].map(match => [match[1], match[2]]));

    if (!entry) errors.push(`${file}: missing from manifest`);
    if (title.length !== 1 || title[0].replaceAll('&amp;', '&') !== entry?.title) errors.push(`${file}: bad title`);
    if (description.length !== 1) errors.push(`${file}: description count ${description.length}`);
    if (description[0] && (description[0].length < 100 || description[0].length > 180)) errors.push(`${file}: description length ${description[0].length}`);
    if (canonical.length !== 1 || canonical[0] !== expectedUrl) errors.push(`${file}: bad canonical`);
    if (h1.length !== 1) errors.push(`${file}: h1 count ${h1.length}`);
    if (unit.length !== 1 || unit[0] !== entry?.unit) errors.push(`${file}: bad unit binding`);
    if (profile.length !== 1 || profile[0] !== entry?.profile || !expectedProfiles.has(profile[0])) errors.push(`${file}: bad profile binding`);
    if (visibleWords(html) < 280) errors.push(`${file}: fewer than 280 visible words`);
    if (html.includes('<a href="/">Korean ↗</a>')) errors.push(`${file}: Korean language link still points to /`);

    const expectedAlternates = {
      en: expectedUrl,
      ko: 'https://googoodan.com/ko/',
      ja: 'https://googoodan.com/ja/',
      fr: 'https://googoodan.com/fr/',
      de: 'https://googoodan.com/de/',
      'x-default': 'https://googoodan.com/'
    };
    for (const [language, href] of Object.entries(expectedAlternates)) {
      if (alternates[language] !== href) errors.push(`${file}: bad ${language} hreflang`);
    }
    if (Object.keys(alternates).length !== 6) errors.push(`${file}: expected 6 unique hreflang values, found ${Object.keys(alternates).length}`);

    if (jsonLd.length !== 1) errors.push(`${file}: JSON-LD count ${jsonLd.length}`);
    else {
      try {
        const data = JSON.parse(jsonLd[0]);
        const graph = Array.isArray(data['@graph']) ? data['@graph'] : [];
        const site = graph.find(node => node['@type'] === 'WebSite');
        const resource = graph.find(node => Array.isArray(node['@type']) && node['@type'].includes('LearningResource'));
        if (site?.name !== 'googoodan' || site?.url !== 'https://googoodan.com') errors.push(`${file}: bad WebSite JSON-LD`);
        if (resource?.url !== expectedUrl || resource?.inLanguage !== 'en-US' || resource?.educationalLevel !== `Grade ${entry?.grade}`) errors.push(`${file}: bad LearningResource JSON-LD`);
      } catch (error) {
        errors.push(`${file}: invalid JSON-LD (${error.message})`);
      }
    }

    title.forEach(value => titles.add(value));
    description.forEach(value => descriptions.add(value));
    canonical.forEach(value => canonicals.add(value));
    h1.forEach(value => h1s.add(value));
  }

  for (const [label, values] of [['titles', titles], ['descriptions', descriptions], ['canonicals', canonicals], ['h1s', h1s]]) {
    if (values.size !== files.length) errors.push(`Expected ${files.length} unique ${label}, found ${values.size}`);
  }

  const titleLocations = new Map();
  for (const file of walkHtml(enDir)) {
    const html = fs.readFileSync(file, 'utf8');
    const title = captures(html, /<title>([\s\S]*?)<\/title>/i)[0];
    if (!title) continue;
    const list = titleLocations.get(title) || [];
    list.push(path.relative(enDir, file).replaceAll('\\', '/'));
    titleLocations.set(title, list);
  }
  for (const title of titles) {
    const locations = titleLocations.get(title) || [];
    if (locations.length !== 1) errors.push(`English title collision: ${title} (${locations.join(', ')})`);
  }

  if (errors.length) throw new Error(`Static checks failed:\n${errors.join('\n')}`);
  return {
    files: files.length,
    grades: expectedGradeCounts,
    formats: manifest.formats,
    uniqueTitles: titles.size,
    uniqueDescriptions: descriptions.size,
    uniqueCanonicals: canonicals.size,
    uniqueH1s: h1s.size,
    titleCollisionsAcrossEnglish: 0
  };
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
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, route => route.abort());

  const loaded = [];
  for (const item of manifest.pages) {
    const file = path.basename(item.file);
    const url = `http://127.0.0.1:${port}/en/print/common-core-arithmetic-upper/${file}`;
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.DrillPage && document.querySelectorAll('.paper .problem').length > 0);
    const worksheet = await page.evaluate(() => {
      const context = window.GDWorksheetContext();
      const profile = window.DrillCatalog.profiles.get(context.drill);
      return {
        context,
        inspect: window.DrillPage.inspect(),
        staticUnit: document.body.dataset.staticUnit,
        staticProfile: document.body.dataset.staticProfile,
        title: document.title,
        canonical: document.querySelector('link[rel=canonical]')?.href,
        description: document.querySelector('meta[name=description]')?.content,
        rows: JSON.stringify(window.USArithmetic.rows(profile, context.set, document.querySelectorAll('.paper .problem').length)),
        concealedAnswers: document.querySelectorAll('.paper .concealed').length,
        questionChecked: document.querySelector('#print-worksheet')?.checked,
        answerChecked: document.querySelector('#print-answer')?.checked
      };
    });
    if (worksheet.context.unit !== item.unit || worksheet.inspect.unit !== item.unit || worksheet.staticUnit !== item.unit) throw new Error(`${file}: loaded unit ${worksheet.context.unit}, expected ${item.unit}`);
    if (worksheet.context.drill !== item.profile || worksheet.inspect.profile !== item.profile || worksheet.staticProfile !== item.profile) throw new Error(`${file}: loaded profile ${worksheet.context.drill}, expected ${item.profile}`);
    if (worksheet.canonical !== item.url) throw new Error(`${file}: rendered canonical changed to ${worksheet.canonical}`);
    if (worksheet.title !== item.title) throw new Error(`${file}: rendered title changed to ${worksheet.title}`);
    if (worksheet.inspect.count < 4) throw new Error(`${file}: only ${worksheet.inspect.count} problems rendered`);
    if (worksheet.concealedAnswers < 1 || !worksheet.questionChecked || worksheet.answerChecked) throw new Error(`${file}: initial worksheet preview state is wrong`);

    await page.click('#answers');
    const answer = await page.evaluate(() => {
      const context = window.GDWorksheetContext();
      const profile = window.DrillCatalog.profiles.get(context.drill);
      return {
        label: document.querySelector('#mode')?.textContent,
        rows: JSON.stringify(window.USArithmetic.rows(profile, context.set, document.querySelectorAll('.paper .problem').length)),
        concealedAnswers: document.querySelectorAll('.paper .concealed').length,
        questionChecked: document.querySelector('#print-worksheet')?.checked,
        answerChecked: document.querySelector('#print-answer')?.checked
      };
    });
    if (answer.label !== 'Answer key' || answer.concealedAnswers !== 0 || answer.questionChecked || !answer.answerChecked) throw new Error(`${file}: answer preview did not synchronize`);
    if (answer.rows !== worksheet.rows) throw new Error(`${file}: worksheet and answer key rows differ`);

    await page.click('#questions');
    const question = await page.evaluate(() => {
      const context = window.GDWorksheetContext();
      const profile = window.DrillCatalog.profiles.get(context.drill);
      return {
        label: document.querySelector('#mode')?.textContent,
        rows: JSON.stringify(window.USArithmetic.rows(profile, context.set, document.querySelectorAll('.paper .problem').length)),
        concealedAnswers: document.querySelectorAll('.paper .concealed').length,
        questionChecked: document.querySelector('#print-worksheet')?.checked,
        answerChecked: document.querySelector('#print-answer')?.checked
      };
    });
    if (question.label !== 'Worksheet' || question.concealedAnswers < 1 || !question.questionChecked || question.answerChecked) throw new Error(`${file}: worksheet preview did not synchronize`);
    if (question.rows !== worksheet.rows) throw new Error(`${file}: returning to worksheet changed its rows`);
    loaded.push({ profile: item.profile, problems: worksheet.inspect.count });
  }

  const representatives = [];
  for (const format of Object.keys(manifest.formats)) {
    const item = manifest.pages.find(pageItem => pageItem.format === format);
    if (!item) continue;
    const file = path.basename(item.file);
    const url = `http://127.0.0.1:${port}/en/print/common-core-arithmetic-upper/${file}`;
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.DrillPage && document.querySelectorAll('.paper .problem').length > 0);
    const originalSet = await page.locator('#set').textContent();
    await page.click('#new');
    const newSet = await page.locator('#set').textContent();
    if (newSet === originalSet) throw new Error(`${file}: New numbers did not change the set`);

    await page.click('#questions');
    await page.evaluate(() => window.GDPreparePDF());
    const worksheetBundle = await page.evaluate(() => ({
      pages: document.querySelectorAll('#print-bundle > .paper').length,
      mode: document.querySelector('#print-bundle .paper-top > span:last-child')?.textContent
    }));
    const letterPdf = await page.pdf({ format: 'Letter', printBackground: true, displayHeaderFooter: false });
    const letterPages = (await PDFDocument.load(letterPdf)).getPageCount();

    await page.click('#answers');
    await page.evaluate(() => window.GDPreparePDF());
    const answerBundle = await page.evaluate(() => ({
      pages: document.querySelectorAll('#print-bundle > .paper').length,
      mode: document.querySelector('#print-bundle .paper-top > span:last-child')?.textContent
    }));
    const a4Pdf = await page.pdf({ format: 'A4', printBackground: true, displayHeaderFooter: false });
    const a4Pages = (await PDFDocument.load(a4Pdf)).getPageCount();
    if (worksheetBundle.pages !== 1 || worksheetBundle.mode !== 'Worksheet') throw new Error(`${file}: worksheet print bundle is wrong`);
    if (answerBundle.pages !== 1 || answerBundle.mode !== 'Answer key') throw new Error(`${file}: answer-key print bundle is wrong`);
    if (letterPages !== 1 || a4Pages !== 1) throw new Error(`${file}: expected one-page PDFs, got Letter ${letterPages} and A4 ${a4Pages}`);
    representatives.push({ format, file, letterWorksheetPages: letterPages, a4AnswerPages: a4Pages });
  }

  await browser.close();
  await new Promise(resolve => testServer.close(resolve));
  if (pageErrors.length) throw new Error(`Browser page errors:\n${pageErrors.join('\n')}`);
  return { loadedProfiles: loaded.length, answerConsistentProfiles: loaded.length, representatives };
}

(async () => {
  const report = { static: staticCheck() };
  if (process.argv.includes('--browser')) report.browser = await browserCheck();
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
})().catch(error => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
