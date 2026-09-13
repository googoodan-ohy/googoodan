const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp'
};

const server = http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
  const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const file = path.resolve(root, relative);
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    response.writeHead(404).end('Not found');
    return;
  }
  response.writeHead(200, { 'Content-Type': mime[path.extname(file).toLowerCase()] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(response);
});

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function pdfPages(buffer) {
  return (buffer.toString('latin1').match(/\/Type\s*\/Page\b/g) || []).length;
}

async function openAndCollect(browser, url) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  return { page, errors };
}

(async () => {
  await new Promise((resolve) => server.listen(4196, '127.0.0.1', resolve));
  const browserCandidates = [
    process.env.GOOGOODAN_CHROME,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
  ].filter(Boolean);
  const executablePath = browserCandidates.find((candidate) => fs.existsSync(candidate));
  const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
  const base = 'http://127.0.0.1:4196';
  const report = { pages: 0, answerFlows: 0, pdfs: 0, pdfPages: 0, errors: [] };
  try {
    const activity = await openAndCollect(browser, `${base}/en/count-and-color.html?set=42`);
    await activity.page.waitForSelector('.bank-question');
    assert(await activity.page.locator('.bank-question').count() === 4, 'count-and-color should render four tasks');
    await activity.page.click('#answers');
    await activity.page.waitForFunction(() => document.querySelector('#answers')?.getAttribute('aria-pressed') === 'true');
    assert(await activity.page.locator('.bank-answer').count() === 4, 'activity answer key should render four answers');
    assert(await activity.page.locator('#print-answer').isChecked(), 'answer preview should select answer printing');
    assert(!(await activity.page.locator('#print-worksheet').isChecked()), 'answer preview should clear worksheet-only printing');
    report.answerFlows++;
    for (const format of ['A4', 'Letter']) {
      const pdf = await activity.page.pdf({ format, printBackground: true, preferCSSPageSize: false });
      const pages = pdfPages(pdf);
      assert(pages === 1, `count-and-color ${format} printed ${pages} pages`);
      report.pdfs++;
      report.pdfPages += pages;
    }
    report.pages++;
    report.errors.push(...activity.errors);
    await activity.page.close();

    const staticUrls = [
      '/en/print/k-count-to-10.html?set=42',
      '/en/print/grade-2-counting-us-coins-worksheet.html?set=42'
    ];
    for (const url of staticUrls) {
      const result = await openAndCollect(browser, `${base}${url}`);
      await result.page.waitForSelector('#sheet .activity');
      await result.page.click('#answer');
      await result.page.waitForFunction(() => document.querySelector('#answer')?.getAttribute('aria-pressed') === 'true');
      assert(await result.page.locator('#sheet').innerText(), `${url} answer sheet is empty`);
      report.answerFlows++;
      for (const format of ['A4', 'Letter']) {
        const pdf = await result.page.pdf({ format, printBackground: true, preferCSSPageSize: false });
        const pages = pdfPages(pdf);
        assert(pages === 1, `${url} ${format} printed ${pages} pages`);
        report.pdfs++;
        report.pdfPages += pages;
      }
      report.pages++;
      report.errors.push(...result.errors);
      await result.page.close();
    }

    const arithmetic = await openAndCollect(browser, `${base}/en/print/common-core-arithmetic/grade-1-within20-horizontal-practice.html?set=42`);
    await arithmetic.page.waitForSelector('.problems .problem');
    const before = await arithmetic.page.locator('.problems').innerText();
    await arithmetic.page.click('#answers');
    await arithmetic.page.waitForFunction(() => document.querySelector('#answers')?.getAttribute('aria-pressed') === 'true');
    assert(await arithmetic.page.locator('.answer,.bank-answer').count() > 0, 'arithmetic answer key has no visible answers');
    const after = await arithmetic.page.locator('.problems').innerText();
    assert(after.length > before.length, 'arithmetic answer view should add answer text');
    report.answerFlows++;
    report.pages++;
    report.errors.push(...arithmetic.errors);
    await arithmetic.page.close();

    const hub = await openAndCollect(browser, `${base}/en/early-math-activities.html`);
    assert(await hub.page.locator('main a[href^="/en/"]').count() >= 17, 'activity hub has too few internal links');
    report.pages++;
    report.errors.push(...hub.errors);
    await hub.page.close();

    const directoryChecks = [
      ['/en/kindergarten.html', '#kindergarten-printables a', 54],
      ['/en/grade-1.html', '#grade-1-skill-pages a', 20],
      ['/en/grade-2.html', '#grade-2-skill-pages a', 26],
      ['/en/worksheets.html', '#k2-expanded-directory a', 148]
    ];
    for (const [url, selector, minimum] of directoryChecks) {
      const result = await openAndCollect(browser, `${base}${url}`);
      assert(await result.page.locator(selector).count() >= minimum, `${url} discovery links are incomplete`);
      report.pages++;
      report.errors.push(...result.errors);
      await result.page.close();
    }

    assert(report.errors.length === 0, `browser page errors: ${report.errors.join(' | ')}`);
    const rendered = JSON.stringify(report, null, 2);
    const resultDir = path.join(root, '.codex-scratch');
    fs.mkdirSync(resultDir, { recursive: true });
    fs.writeFileSync(path.join(resultDir, 'k2-browser-result.json'), rendered);
    console.log(rendered);
  } finally {
    await browser.close();
    server.close();
  }
})().catch((error) => {
  console.error(error.stack || error);
  server.close();
  process.exit(1);
});
