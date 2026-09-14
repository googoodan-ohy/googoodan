'use strict';
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const {chromium} = require('playwright');

const root = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, 'regrouping-reuse-static-manifest.json'), 'utf8'));
const VERSION = '20260914-regrouping-english';
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp'
};

function serve() {
  return new Promise(resolve => {
    const server = http.createServer((request, response) => {
      const pathname = decodeURIComponent(new URL(request.url, 'http://local').pathname);
      const relative = pathname === '/' ? 'index.html' : pathname.endsWith('/')
        ? pathname.replace(/^\/+/, '') + 'index.html'
        : pathname.replace(/^\/+/, '');
      const file = path.resolve(root, relative);
      if ((!file.startsWith(root + path.sep) && file !== path.join(root, 'index.html')) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
        response.writeHead(404).end('Not found');
        return;
      }
      response.writeHead(200, {'content-type': mime[path.extname(file).toLowerCase()] || 'application/octet-stream', 'cache-control': 'no-store'});
      fs.createReadStream(file).pipe(response);
    }).listen(0, '127.0.0.1', () => resolve(server));
  });
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function main() {
  const server = await serve();
  const port = server.address().port;
  const base = `http://127.0.0.1:${port}`;
  const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const browser = await chromium.launch({headless: true, executablePath: fs.existsSync(chrome) ? chrome : undefined});
  const page = await browser.newPage({viewport: {width: 1440, height: 1100}});
  const pageErrors = [];
  const response404s = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  page.on('response', response => {
    if (response.status() === 404) response404s.push(new URL(response.url()).pathname);
  });
  const gradeMenuCounts = {};
  try {
    for (const grade of [2, 3, 4]) {
      const response = await page.goto(`${base}/en/grades.html?grade=${grade}`, {waitUntil: 'domcontentloaded'});
      assert(response && response.status() === 200, `Grade ${grade} menu did not return 200`);
      await page.waitForSelector('#unit optgroup[data-regrouping-navigation]', {state: 'attached'});
      const expected = manifest.pages.filter(item => item.grade === grade).length;
      let count = await page.locator('#unit optgroup[data-regrouping-navigation] > option').count();
      assert(count === expected, `Grade ${grade} expected ${expected} exact-regrouping choices, found ${count}`);
      await page.click('#answer');
      await page.waitForSelector('#unit optgroup[data-regrouping-navigation]', {state: 'attached'});
      count = await page.locator('#unit optgroup[data-regrouping-navigation] > option').count();
      assert(count === expected, `Grade ${grade} choices disappeared after Answer key render`);
      gradeMenuCounts[grade] = count;
    }

    await page.goto(`${base}/en/grades.html?grade=2`, {waitUntil: 'domcontentloaded'});
    const grade2Target = manifest.pages.find(item => item.grade === 2);
    await page.waitForSelector(`option[value="regrouping:${grade2Target.id}"]`, {state: 'attached'});
    await Promise.all([
      page.waitForURL(`**/en/${grade2Target.file}`),
      page.selectOption('#unit', `regrouping:${grade2Target.id}`)
    ]);
    await page.waitForSelector('.regrouping-equation');
    assert(new URL(page.url()).pathname === `/en/${grade2Target.file}`, 'Grade selector did not open the exact worksheet URL');

    for (const item of manifest.pages) {
      const response = await page.request.get(`${base}/en/${item.file}`);
      assert(response.status() === 200, `${item.file} did not return 200`);
    }

    const indexResponse = await page.goto(`${base}/en/`, {waitUntil: 'domcontentloaded'});
    assert(indexResponse && indexResponse.status() === 200, 'English index did not return 200');
    const cssHref = `/en/banks/regrouping-reuse.css?v=${VERSION}`;
    assert(await page.locator(`link[rel="stylesheet"][href="${cssHref}"]`).count() === 1, 'Index is missing the versioned regrouping CSS');
    await page.waitForSelector('a.choice[data-id="grade-2-two-digit-addition-one-regrouping"]');
    const operationCounts = {};
    operationCounts.addition = await page.locator('a.choice[data-id^="grade-"]').count();
    await page.getByRole('button', {name: 'Subtraction'}).click();
    operationCounts.subtraction = await page.locator('a.choice[data-id^="grade-"]').count();
    await page.getByRole('button', {name: 'Multiplication'}).click();
    operationCounts.multiplication = await page.locator('a.choice[data-id^="grade-"]').count();
    assert(operationCounts.addition === 6 && operationCounts.subtraction === 4 && operationCounts.multiplication === 7,
      `Index exact menu counts were ${JSON.stringify(operationCounts)}`);
    await page.getByRole('button', {name: 'Addition'}).click();
    const target = manifest.pages.find(item => item.id === 'grade-3-three-digit-addition-three-regroupings');
    await Promise.all([
      page.waitForURL(`**/en/${target.file}`),
      page.locator(`a.choice[data-id="${target.id}"]`).click()
    ]);
    await page.waitForSelector('.regrouping-equation');

    const worksheetState = await page.evaluate(version => {
      const equations = [...document.querySelectorAll('.regrouping-equation')];
      const workspaces = [...document.querySelectorAll('.regrouping-workspace')];
      const blanks = [...document.querySelectorAll('.kblank')];
      const workspaceStyle = workspaces[0] ? getComputedStyle(workspaces[0]) : null;
      const blankStyle = blanks[0] ? getComputedStyle(blanks[0]) : null;
      return {
        bodyType: document.body.dataset.type,
        equations: equations.length,
        workspaces: workspaces.length,
        blanks: blanks.length,
        css: [...document.styleSheets].some(sheet => sheet.href?.includes(`/en/banks/regrouping-reuse.css?v=${version}`)),
        equationDisplay: equations[0] ? getComputedStyle(equations[0]).display : '',
        workspaceDisplay: workspaceStyle?.display || '',
        workspaceBorder: workspaceStyle?.borderBottomStyle || '',
        workspaceHeight: parseFloat(workspaceStyle?.minHeight || '0'),
        blankDisplay: blankStyle?.display || '',
        blankWidth: parseFloat(blankStyle?.minWidth || '0'),
        blankBorder: blankStyle?.borderBottomStyle || ''
      };
    }, VERSION);
    assert(worksheetState.bodyType === target.id, 'Index menu opened the wrong worksheet');
    assert(worksheetState.equations === 6 && worksheetState.workspaces === 6, `Expected 6 questions/workspaces, got ${JSON.stringify(worksheetState)}`);
    assert(worksheetState.blanks >= 4, `Expected visible answer blanks, found ${worksheetState.blanks}`);
    assert(worksheetState.css && worksheetState.equationDisplay === 'flex', 'Regrouping equation stylesheet did not apply');
    assert(worksheetState.workspaceDisplay !== 'none' && worksheetState.workspaceBorder === 'dotted' && worksheetState.workspaceHeight > 0,
      'Regrouping workspace stylesheet did not apply');
    assert(['block', 'inline-block'].includes(worksheetState.blankDisplay) && worksheetState.blankWidth > 0 && worksheetState.blankBorder === 'solid',
      'Regrouping blank stylesheet did not apply: ' + JSON.stringify(worksheetState));

    await page.click('#answers');
    await page.waitForSelector('.paper.bank-answers');
    const answerState = await page.evaluate(() => ({
      answers: [...document.querySelectorAll('.bank-answer')].filter(node => node.textContent.trim()).length,
      hiddenWorkspaces: [...document.querySelectorAll('.regrouping-workspace')].filter(node => getComputedStyle(node).display === 'none').length
    }));
    assert(answerState.answers === 6, `Expected 6 visible answers, found ${answerState.answers}`);
    assert(answerState.hiddenWorkspaces === 6, `Expected 6 hidden answer-key workspaces, found ${answerState.hiddenWorkspaces}`);
    assert(pageErrors.length === 0, 'Browser page errors: ' + pageErrors.join(' | '));

    console.log(JSON.stringify({
      gradeMenuOptions: gradeMenuCounts,
      gradeSelectionDestination: `/en/${grade2Target.file}`,
      indexExactChoices: operationCounts,
      worksheetQuestions: worksheetState.equations,
      styledWorkspaces: worksheetState.workspaces,
      styledBlanks: worksheetState.blanks,
      answerKeyAnswers: answerState.answers,
      pageResponses200: manifest.pages.length,
      response404s: [...new Set(response404s)],
      pageErrors: 0
    }, null, 2));
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

main().catch(error => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
