const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

const enDir = __dirname;
const deployDir = path.resolve(enDir, '..');
const outputDir = path.join(enDir, 'print', 'grade-skills');
const manifestPath = path.join(enDir, 'grade3-5-static-manifest.json');
const gradeMath = require(path.join(enDir, 'grade-math.js'));

function decode(value) {
  return String(value)
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>');
}

function one(html, expression, label, url) {
  const matches = [...html.matchAll(expression)];
  assert.equal(matches.length, 1, `${url}: expected one ${label}, got ${matches.length}`);
  return decode(matches[0][1]);
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

function listHtmlFiles(dir) {
  const files = [];
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) files.push(...listHtmlFiles(full));
    else if (item.isFile() && item.name.endsWith('.html')) files.push(full);
  }
  return files;
}

function staticCheck() {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert.deepEqual(manifest.counts, { grade3: 23, grade4: 29, grade5: 32, total: 84 });
  assert.equal(manifest.pages.length, 84);
  const generatedFiles = fs.readdirSync(outputDir).filter(file => file.endsWith('.html')).sort();
  assert.equal(generatedFiles.length, 84, `Expected 84 generated HTML files, got ${generatedFiles.length}`);

  const expectedUnits = new Set([3, 4, 5].flatMap(grade => gradeMath.grades[grade].units.map(unit => `${grade}:${unit[0]}`)));
  assert.equal(expectedUnits.size, 84, 'The source catalog must expose 84 distinct Grade 3–5 profiles');
  assert.deepEqual(new Set(manifest.pages.map(page => `${page.grade}:${page.unit}`)), expectedUnits, 'Manifest and source profile sets differ');

  const unique = { urls: [], titles: [], descriptions: [], canonicals: [], h1s: [] };
  let minWords = Infinity;
  let maxWords = 0;
  let deterministicSets = 0;
  for (const page of manifest.pages) {
    const file = path.join(deployDir, ...page.file.split('/').filter(Boolean));
    assert(fs.existsSync(file), `${page.url}: generated file is missing`);
    const html = fs.readFileSync(file, 'utf8');
    assert.match(html, /^<!doctype html><html lang="en">/);
    const title = one(html, /<title>([^<]+)<\/title>/g, 'title', page.url);
    const description = one(html, /<meta name="description" content="([^"]+)">/g, 'description', page.url);
    const canonical = one(html, /<link rel="canonical" href="([^"]+)">/g, 'canonical', page.url);
    const h1 = one(html, /<h1 class="entry-title">([^<]+)<\/h1>/g, 'H1', page.url);
    assert.equal(title, page.title, `${page.url}: title differs from manifest`);
    assert.equal(description, page.description, `${page.url}: description differs from manifest`);
    assert.equal(h1, page.h1, `${page.url}: H1 differs from manifest`);
    assert.equal(canonical, `https://googoodan.com${page.url}`, `${page.url}: canonical mismatch`);
    assert(title.length <= 65, `${page.url}: title is ${title.length} characters`);
    assert(description.length >= 120 && description.length <= 160, `${page.url}: description is ${description.length} characters`);
    assert.match(html, /<meta name="robots" content="index,follow">/);
    assert.equal(one(html, /<body data-static-grade="([^"]+)"/g, 'static grade', page.url), String(page.grade));
    assert.equal(one(html, /data-static-unit="([^"]+)"/g, 'static unit', page.url), page.unit);
    assert(html.includes(`p.set('grade',${JSON.stringify(String(page.grade))})`), `${page.url}: grade bootstrap mismatch`);
    assert(html.includes(`p.set('unit',${JSON.stringify(page.unit)})`), `${page.url}: unit bootstrap mismatch`);
    assert.match(html, /\/en\/grade-math\.js\?v=/);
    assert.match(html, /\/en\/grade-extension\.js\?v=/);
    assert.match(html, /\/en\/grades\.js\?v=/);
    assert.match(html, /<section class="grade-skill-resource"/);
    assert.match(html, /matching answer key/i);
    assert.match(html, /US Letter and A4/i);
    for (const language of ['en', 'ko', 'ja', 'fr', 'de', 'x-default']) {
      const count = (html.match(new RegExp(`hreflang="${language}"`, 'g')) || []).length;
      assert.equal(count, 1, `${page.url}: expected one ${language} hreflang, got ${count}`);
    }
    assert.match(html, /hreflang="ko" href="https:\/\/googoodan\.com\/ko\/"/);
    assert.match(html, /hreflang="x-default" href="https:\/\/googoodan\.com\/"/);
    const jsonLd = [...html.matchAll(/<script(?: id="website-identity")? type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
    assert.equal(jsonLd.length, 2, `${page.url}: JSON-LD block count`);
    for (const block of jsonLd) JSON.parse(block[1]);
    const words = visibleWords(html.match(/<section class="grade-skill-resource"[\s\S]*?<\/section>/)[0]);
    assert(words >= 190, `${page.url}: static guide has only ${words} visible words`);
    minWords = Math.min(minWords, words);
    maxWords = Math.max(maxWords, words);

    for (const seed of [1, 7, 42, 999, 8675309]) {
      const first = gradeMath.generate(page.grade, page.unit, seed);
      const second = gradeMath.generate(page.grade, page.unit, seed);
      assert.deepEqual(first, second, `${page.url}: generator is not deterministic for seed ${seed}`);
      assert.equal(first.length, 3, `${page.url}: expected three worksheet sections`);
      for (const section of first) {
        assert(section.questions.length >= 2, `${page.url}: section contains too few questions`);
        for (const question of section.questions) {
          assert(String(question.prompt).trim(), `${page.url}: empty question prompt`);
          assert(String(question.answer).trim(), `${page.url}: empty answer`);
        }
      }
      deterministicSets++;
    }

    unique.urls.push(page.url);
    unique.titles.push(title);
    unique.descriptions.push(description);
    unique.canonicals.push(canonical);
    unique.h1s.push(h1);
  }
  for (const [label, values] of Object.entries(unique)) assert.equal(new Set(values).size, 84, `${label} must be unique`);

  const generatedSet = new Set(manifest.pages.map(page => path.resolve(deployDir, ...page.file.split('/').filter(Boolean)).toLowerCase()));
  const otherTitles = new Set();
  const otherCanonicals = new Set();
  for (const file of listHtmlFiles(enDir)) {
    if (generatedSet.has(file.toLowerCase())) continue;
    const html = fs.readFileSync(file, 'utf8');
    const title = html.match(/<title>([^<]+)<\/title>/i)?.[1];
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/i)?.[1];
    if (title) otherTitles.add(decode(title));
    if (canonical) otherCanonicals.add(decode(canonical));
  }
  for (const title of unique.titles) assert(!otherTitles.has(title), `Generated title already exists elsewhere: ${title}`);
  for (const canonical of unique.canonicals) assert(!otherCanonicals.has(canonical), `Generated canonical already exists elsewhere: ${canonical}`);

  return {
    pages: 84,
    grades: manifest.counts,
    deterministicSets,
    uniqueTitles: new Set(unique.titles).size,
    uniqueCanonicals: new Set(unique.canonicals).size,
    staticGuideWords: `${minWords}–${maxWords}`,
    externalTitleCollisions: 0,
    externalCanonicalCollisions: 0
  };
}

function serve() {
  const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg' };
  return http.createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
    const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
    const file = path.resolve(deployDir, relative);
    if (!file.startsWith(deployDir) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      response.writeHead(404).end('Not found');
      return;
    }
    response.writeHead(200, { 'content-type': mime[path.extname(file).toLowerCase()] || 'application/octet-stream', 'cache-control': 'no-store' });
    fs.createReadStream(file).pipe(response);
  });
}

function pdfPages(buffer) {
  return (buffer.toString('latin1').match(/\/Type\s*\/Page\b/g) || []).length;
}

async function browserCheck() {
  const { chromium } = require('playwright');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const server = serve();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const executableCandidates = [
    process.env.GOOGOODAN_CHROME,
    chromium.executablePath(),
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
  ].filter(Boolean);
  const executablePath = executableCandidates.find(candidate => fs.existsSync(candidate));
  if (!executablePath) throw new Error('No Chromium-compatible browser was found');
  const browser = await chromium.launch({ headless: true, executablePath });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1050 } });
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, route => route.abort());
  const loaded = [];
  try {
    for (const item of manifest.pages) {
      await page.goto(`http://127.0.0.1:${port}${item.url}?set=42`, { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => window.GDWorksheetContext && document.querySelectorAll('#sheet .card').length > 0);
      const state = await page.evaluate(() => ({
        context: window.GDWorksheetContext(),
        staticGrade: document.body.dataset.staticGrade,
        staticUnit: document.body.dataset.staticUnit,
        title: document.title,
        h1: document.querySelector('h1.entry-title')?.textContent.trim(),
        canonical: document.querySelector('link[rel="canonical"]')?.href,
        cards: document.querySelectorAll('#sheet .card').length,
        sections: document.querySelectorAll('#sheet .activity').length
      }));
      assert.equal(state.context.grade, item.grade, `${item.url}: runtime grade mismatch`);
      assert.equal(state.context.unit, item.unit, `${item.url}: runtime unit mismatch`);
      assert.equal(state.staticGrade, String(item.grade), `${item.url}: static grade mismatch`);
      assert.equal(state.staticUnit, item.unit, `${item.url}: static unit mismatch`);
      assert.equal(state.title, item.title, `${item.url}: runtime title changed`);
      assert.equal(state.h1, item.h1, `${item.url}: runtime H1 changed`);
      assert.equal(state.canonical, item.url.replace(/^/, 'https://googoodan.com'), `${item.url}: runtime canonical changed`);
      assert.equal(state.sections, 3, `${item.url}: runtime section count`);
      assert(state.cards >= 6, `${item.url}: only ${state.cards} questions rendered`);
      loaded.push(`${item.grade}:${item.unit}`);
    }

    const representativeKeys = [
      '3:groups', '3:fraction-line',
      '4:long-div', '4:protractor',
      '5:decimal-div', '5:volume-parts'
    ];
    const representatives = [];
    for (const key of representativeKeys) {
      const item = manifest.pages.find(candidate => `${candidate.grade}:${candidate.unit}` === key);
      assert(item, `Missing representative ${key}`);
      await page.goto(`http://127.0.0.1:${port}${item.url}?set=24680`, { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => document.querySelectorAll('#sheet .card').length > 0 && document.querySelector('#print-q'));
      const worksheetQuestions = await page.evaluate(() => [...document.querySelectorAll('#sheet .card')].map(card => ({ prompt: card.querySelector('.story')?.textContent, task: card.querySelector('.task')?.textContent })));
      await page.click('#answer');
      await page.waitForFunction(() => document.querySelector('#answer')?.getAttribute('aria-pressed') === 'true');
      const answerState = await page.evaluate(() => ({
        questions: [...document.querySelectorAll('#sheet .card')].map(card => ({ prompt: card.querySelector('.story')?.textContent, task: card.querySelector('.task')?.textContent })),
        visibleSolutions: [...document.querySelectorAll('#sheet .solution')].filter(element => getComputedStyle(element).display !== 'none' && getComputedStyle(element).visibility !== 'hidden').length,
        answerChecked: document.querySelector('#print-a')?.checked,
        worksheetChecked: document.querySelector('#print-q')?.checked
      }));
      assert.deepEqual(answerState.questions, worksheetQuestions, `${item.url}: worksheet and answer questions changed`);
      assert.equal(answerState.visibleSolutions, worksheetQuestions.length, `${item.url}: answer solutions are not all visible`);
      assert(answerState.answerChecked && !answerState.worksheetChecked, `${item.url}: answer preview and print selection are out of sync`);

      await page.click('#worksheet');
      assert(await page.locator('#print-q').isChecked(), `${item.url}: worksheet print selection did not follow preview`);
      assert(!(await page.locator('#print-a').isChecked()), `${item.url}: answer print selection stayed checked`);
      const seedBefore = await page.evaluate(() => window.GDWorksheetContext().set);
      await page.click('#new');
      const seedAfter = await page.evaluate(() => window.GDWorksheetContext().set);
      assert.notEqual(seedAfter, seedBefore, `${item.url}: New problems did not change the seed`);

      await page.evaluate(() => {
        const answer = document.querySelector('#print-a');
        answer.checked = true;
        answer.dispatchEvent(new Event('change', { bubbles: true }));
        window.GDPreparePDF();
      });
      const bundle = await page.evaluate(() => ({
        pages: document.querySelectorAll('#print-bundle > .sheet').length,
        worksheets: document.querySelectorAll('#print-bundle > .sheet:not(.is-answer)').length,
        answers: document.querySelectorAll('#print-bundle > .sheet.is-answer').length
      }));
      assert.deepEqual(bundle, { pages: 2, worksheets: 1, answers: 1 }, `${item.url}: two-page worksheet and answer bundle mismatch`);

      await page.evaluate(() => {
        document.querySelector('#print-a').checked = false;
        document.querySelector('#print-a').dispatchEvent(new Event('change', { bubbles: true }));
        window.GDPreparePDF();
        document.body.classList.add('printing-bundle');
      });
      const letter = await page.pdf({ format: 'Letter', printBackground: true, displayHeaderFooter: false, preferCSSPageSize: false });
      await page.evaluate(() => { document.body.classList.remove('printing-bundle'); window.GDPreparePDF(); document.body.classList.add('printing-bundle'); });
      const a4 = await page.pdf({ format: 'A4', printBackground: true, displayHeaderFooter: false, preferCSSPageSize: false });
      await page.evaluate(() => document.body.classList.remove('printing-bundle'));
      const letterPages = pdfPages(letter);
      const a4Pages = pdfPages(a4);
      assert.equal(letterPages, 1, `${item.url}: Letter PDF has ${letterPages} pages`);
      assert.equal(a4Pages, 1, `${item.url}: A4 PDF has ${a4Pages} pages`);
      representatives.push({ profile: key, questions: worksheetQuestions.length, answerSolutions: answerState.visibleSolutions, combinedBundlePages: bundle.pages, letterPages, a4Pages });
    }
    assert.equal(pageErrors.length, 0, `Browser page errors:\n${pageErrors.join('\n')}`);
    return { loadedProfiles: loaded.length, representatives };
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

(async () => {
  const report = { static: staticCheck() };
  if (process.argv.includes('--browser')) report.browser = await browserCheck();
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
})().catch(error => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
