const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const vm = require('node:vm');

const enDir = __dirname;
const rootDir = path.dirname(enDir);
const pageDir = path.join(enDir, 'print', 'level-skills-upper');
const manifestPath = path.join(pageDir, 'manifest.json');

function captures(html, pattern) {
  return [...html.matchAll(pattern)].map(match => match[1]);
}

function visibleText(html) {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z0-9#]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function loadRuntime() {
  const sandbox = { console };
  sandbox.globalThis = sandbox;
  for (const relative of [
    'en/types.js',
    'ko/catalog.js',
    'ko/drill-catalog.js',
    'ko/drill-engine.js',
    'en/level-catalog.js',
    'en/level-english.js'
  ]) {
    const file = path.join(rootDir, relative);
    vm.runInNewContext(fs.readFileSync(file, 'utf8'), sandbox, { filename: file });
  }
  return sandbox;
}

function allExistingFields() {
  const outputPrefix = path.resolve(pageDir) + path.sep;
  const result = { title: new Map(), h1: new Map(), canonical: new Map() };
  const walk = directory => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(file);
      else if (entry.isFile() && entry.name.endsWith('.html') && !path.resolve(file).startsWith(outputPrefix)) {
        const html = fs.readFileSync(file, 'utf8');
        const fields = {
          title: captures(html, /<title>([\s\S]*?)<\/title>/gi)[0],
          h1: captures(html, /<h1(?:\s[^>]*)?>([\s\S]*?)<\/h1>/gi)[0]?.replace(/<[^>]+>/g, '').trim(),
          canonical: captures(html, /<link rel="canonical" href="([^"]*)">/gi)[0]
        };
        for (const [name, value] of Object.entries(fields)) {
          if (value && !result[name].has(value)) result[name].set(value, path.relative(rootDir, file));
        }
      }
    }
  };
  walk(enDir);
  return result;
}

function staticCheck() {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const runtime = loadRuntime();
  const existing = allExistingFields();
  const files = fs.readdirSync(pageDir).filter(file => file.endsWith('.html')).sort();
  const expected = new Map(manifest.pages.map(item => [path.basename(item.file), item]));
  const sets = { title: new Set(), description: new Set(), canonical: new Set(), h1: new Set(), profile: new Set(), fingerprint: new Set() };
  const errors = [];

  if (manifest.count > 220) errors.push(`Page cap exceeded: ${manifest.count}`);
  if (manifest.count !== 97) errors.push(`Expected conservative count 97, got ${manifest.count}`);
  if (files.length !== manifest.count) errors.push(`Manifest ${manifest.count}, HTML ${files.length}`);

  for (const file of files) {
    const item = expected.get(file);
    if (!item) {
      errors.push(`${file}: not in manifest`);
      continue;
    }
    const fullPath = path.join(pageDir, file);
    const html = fs.readFileSync(fullPath, 'utf8');
    const fields = {
      title: captures(html, /<title>([\s\S]*?)<\/title>/gi),
      description: captures(html, /<meta name="description" content="([^"]*)">/gi),
      canonical: captures(html, /<link rel="canonical" href="([^"]*)">/gi),
      h1: captures(html, /<h1(?:\s[^>]*)?>([\s\S]*?)<\/h1>/gi).map(value => value.replace(/<[^>]+>/g, '').trim()),
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
    if (item.title.length > 90) errors.push(`${file}: title length ${item.title.length}`);
    if (visibleText(html).split(/\s+/).length < 250) errors.push(`${file}: thin static body`);
    if (/[가-힣]/.test(visibleText(html))) errors.push(`${file}: visible Korean text`);
    if (/<a class="language-link" href="\/">Korean/.test(html)) errors.push(`${file}: Korean link points to root`);
    for (const language of ['en', 'ko', 'ja', 'fr', 'de', 'x-default']) {
      const links = captures(html, new RegExp(`<link rel="alternate" hreflang="${language}" href="([^"]*)">`, 'gi'));
      if (links.length !== 1) errors.push(`${file}: hreflang ${language} count ${links.length}`);
    }
    const json = captures(html, /<script id="website-identity" type="application\/ld\+json">([\s\S]*?)<\/script>/gi);
    if (json.length !== 1) errors.push(`${file}: JSON-LD count ${json.length}`);
    else {
      try {
        const value = JSON.parse(json[0]);
        const graph = value['@graph'] || [];
        const website = graph.find(node => node['@type'] === 'WebSite');
        const resource = graph.find(node => Array.isArray(node['@type']) && node['@type'].includes('LearningResource'));
        if (website?.name !== 'googoodan' || website?.url !== 'https://googoodan.com/') errors.push(`${file}: WebSite identity mismatch`);
        if (resource?.url !== item.url || resource?.teaches !== item.standard) errors.push(`${file}: resource JSON-LD mismatch`);
      } catch (error) {
        errors.push(`${file}: invalid JSON-LD (${error.message})`);
      }
    }

    const stage = runtime.DrillCatalog.units.find(unit => unit.id === item.stage);
    const profile = stage?.drills.find(candidate => candidate.id === item.profile);
    if (!profile) {
      errors.push(`${file}: profile binding missing`);
      continue;
    }
    if (profile.group === '기초 보충' || profile.mode === 'story') errors.push(`${file}: review/story profile included`);
    const generated = Array.from({ length: 12 }, (_, index) => runtime.DrillEngine.rows(profile, 4109 + index * 53, 8));
    const fingerprint = JSON.stringify(generated);
    if (sets.fingerprint.has(fingerprint)) errors.push(`${file}: generated output duplicates another selected page`);
    sets.fingerprint.add(fingerprint);
    if (/[가-힣]/.test(JSON.stringify(generated))) errors.push(`${file}: generated Korean text`);

    for (const name of ['title', 'h1', 'canonical']) {
      const value = fields[name][0];
      if (value && existing[name].has(value)) errors.push(`${file}: ${name} duplicates ${existing[name].get(value)}`);
    }

    const localSources = captures(html, /<(?:script|link)[^>]+(?:src|href)="(\/(?:en|ko)\/[^"?#]+)[^">]*"/gi);
    for (const source of localSources) {
      const dependency = path.join(rootDir, source.replace(/^\//, ''));
      if (!fs.existsSync(dependency)) errors.push(`${file}: missing dependency ${source}`);
    }
  }

  for (const [name, values] of Object.entries(sets)) {
    if (values.size !== files.length) errors.push(`${name}: expected ${files.length} unique, got ${values.size}`);
  }
  if (errors.length) throw new Error(`Static checks failed:\n${errors.join('\n')}`);
  return {
    pages: files.length,
    grades: manifest.gradeCounts,
    stages: manifest.stageCounts,
    uniqueTitles: sets.title.size,
    uniqueProfiles: sets.profile.size,
    uniqueGeneratedOutputs: sets.fingerprint.size,
    duplicateAgainstExisting: 0
  };
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
    await page.goto(`http://127.0.0.1:${port}/en/print/level-skills-upper/${file}`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.DrillPage && document.querySelectorAll('.paper .problem').length > 0);
    const state = await page.evaluate(() => ({
      context: window.DrillPage.inspect(),
      title: document.title,
      h1: document.querySelector('aside h1')?.textContent.trim(),
      canonical: document.querySelector('link[rel=canonical]')?.href,
      problems: document.querySelectorAll('.paper .problem').length,
      paperText: document.querySelector('.paper')?.textContent || ''
    }));
    if (state.context.unit !== item.stage || state.context.profile !== item.profile) throw new Error(`${file}: wrong runtime profile`);
    if (state.title !== item.title || state.h1 !== item.h1 || state.canonical !== item.url) throw new Error(`${file}: runtime SEO changed`);
    if (state.problems < 4) throw new Error(`${file}: only ${state.problems} problems`);
    if (/[가-힣]/.test(state.paperText)) throw new Error(`${file}: Korean text in worksheet`);

    const worksheetState = await page.evaluate(() => {
      const context = window.GDWorksheetContext();
      const count = document.querySelectorAll('.paper .problem').length;
      return {
        context,
        signature: JSON.stringify(window.Worksheets.generate(context.drill, context.set, count))
      };
    });
    await page.click('#answers');
    const answerState = await page.evaluate(() => {
      const context = window.GDWorksheetContext();
      const count = document.querySelectorAll('.paper .problem').length;
      return {
        context,
        signature: JSON.stringify(window.Worksheets.generate(context.drill, context.set, count)),
        mode: document.querySelector('#mode')?.textContent,
        visibleAnswers: [...document.querySelectorAll('.drill-solution,.answer,.working:not(.concealed)')].filter(node => getComputedStyle(node).visibility !== 'hidden' && getComputedStyle(node).display !== 'none').length,
        worksheetChecked: document.querySelector('#print-worksheet')?.checked,
        answerChecked: document.querySelector('#print-answer')?.checked
      };
    });
    if (worksheetState.signature !== answerState.signature || worksheetState.context.set !== answerState.context.set) throw new Error(`${file}: answer key changed the problem set`);
    if (answerState.mode !== 'Answer key' || answerState.visibleAnswers < 1 || answerState.worksheetChecked || !answerState.answerChecked) throw new Error(`${file}: answer preview/checkbox mismatch`);
    await page.click('#questions');
  }

  const find = pattern => manifest.pages.find(item => pattern.test(item.h1));
  const representatives = [
    find(/3 Times Table Worksheets/),
    find(/Division with Remainders.*Horizontal/),
    find(/Missing Digit.*Division/),
    find(/Improper Fractions to Mixed Numbers/),
    find(/Like Denominators/),
    find(/Horizontal Decimal Addition.*Thousandths/),
    find(/Vertical Decimal Multiplication/),
    find(/Vertical Decimal Division.*Grade 6/)
  ].filter((item, index, all) => item && all.findIndex(other => other.file === item.file) === index);
  if (representatives.length < 8) throw new Error(`Only ${representatives.length} representative profiles found`);

  const printResults = [];
  for (const item of representatives) {
    const file = path.basename(item.file);
    await page.goto(`http://127.0.0.1:${port}/en/print/level-skills-upper/${file}`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.DrillPage && document.querySelectorAll('.paper .problem').length > 0);
    const before = await page.evaluate(() => {
      const context = window.GDWorksheetContext();
      return {
        context,
        signature: JSON.stringify(window.Worksheets.generate(context.drill, context.set, document.querySelectorAll('.paper .problem').length)),
        set: document.querySelector('#set')?.textContent,
        problemCount: document.querySelectorAll('.paper .problem').length
      };
    });
    await page.click('#answers');
    const answer = await page.evaluate(() => {
      const context = window.GDWorksheetContext();
      return {
        context,
        signature: JSON.stringify(window.Worksheets.generate(context.drill, context.set, document.querySelectorAll('.paper .problem').length)),
        mode: document.querySelector('#mode')?.textContent,
        visibleAnswers: [...document.querySelectorAll('.drill-solution,.answer,.working:not(.concealed)')].filter(node => getComputedStyle(node).visibility !== 'hidden' && getComputedStyle(node).display !== 'none').length,
        worksheetChecked: document.querySelector('#print-worksheet')?.checked,
        answerChecked: document.querySelector('#print-answer')?.checked
      };
    });
    if (before.signature !== answer.signature || before.context.set !== answer.context.set) throw new Error(`${file}: answer key changed the problem set`);
    if (answer.mode !== 'Answer key' || answer.visibleAnswers < 1 || answer.worksheetChecked || !answer.answerChecked) throw new Error(`${file}: answer preview/checkbox mismatch`);

    await page.click('#new');
    const afterSet = await page.locator('#set').textContent();
    if (before.set === afterSet) throw new Error(`${file}: New numbers did not change the set`);

    await page.click('#questions');
    await page.evaluate(() => window.GDPreparePDF());
    const letter = (await PDFDocument.load(await page.pdf({ format: 'Letter', printBackground: true, displayHeaderFooter: false }))).getPageCount();
    await page.evaluate(() => window.GDPreparePDF());
    const a4 = (await PDFDocument.load(await page.pdf({ format: 'A4', printBackground: true, displayHeaderFooter: false }))).getPageCount();
    await page.click('#answers');
    await page.evaluate(() => window.GDPreparePDF());
    const answerLetter = (await PDFDocument.load(await page.pdf({ format: 'Letter', printBackground: true, displayHeaderFooter: false }))).getPageCount();
    if (letter !== 1 || a4 !== 1 || answerLetter !== 1) throw new Error(`${file}: Letter ${letter}, A4 ${a4}, answer Letter ${answerLetter}`);
    printResults.push({ file, problems: before.problemCount, visibleAnswers: answer.visibleAnswers, letter, a4, answerLetter });
  }

  await browser.close();
  await new Promise(resolve => server.close(resolve));
  if (pageErrors.length) throw new Error(`Browser errors:\n${pageErrors.join('\n')}`);
  return { allProfilesLoaded: manifest.pages.length, answerConsistency: manifest.pages.length, printResults };
}

(async () => {
  const report = { static: staticCheck() };
  if (process.argv.includes('--browser')) report.browser = await browserCheck();
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
})().catch(error => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
