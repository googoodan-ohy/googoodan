'use strict';
const fs = require('fs');
const http = require('http');
const os = require('os');
const path = require('path');
const {execFileSync} = require('child_process');
const {chromium} = require('playwright');
const {labels} = require('./banks/k2-activities.js');

const root = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, 'k2-activity-method-static-manifest.json'), 'utf8'));
const pdfinfo = 'C:\\Users\\ohy10\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\native\\poppler\\Library\\bin\\pdfinfo.exe';
const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp'};

function serve() {
  return new Promise(resolve => {
    const server = http.createServer((request, response) => {
      const pathname = decodeURIComponent(new URL(request.url, 'http://local').pathname);
      const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
      const file = path.resolve(root, relative);
      if ((!file.startsWith(root + path.sep) && file !== path.join(root, 'index.html')) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
        response.writeHead(404).end('Not found');
        return;
      }
      response.writeHead(200, {'content-type':mime[path.extname(file).toLowerCase()] || 'application/octet-stream','cache-control':'no-store'});
      fs.createReadStream(file).pipe(response);
    }).listen(0, '127.0.0.1', () => resolve(server));
  });
}

async function questionSignature(page) {
  return page.$$eval('.bank-question', questions => questions.map(question => {
    const clone = question.cloneNode(true);
    clone.querySelectorAll('.bank-answer').forEach(answer => answer.remove());
    return clone.innerHTML.replace(/\s+/g, ' ').trim();
  }));
}

async function pageState(page) {
  return page.evaluate(() => ({
    title:document.title,
    h1:document.querySelector('main aside > h1')?.textContent.trim(),
    sheetTitle:document.querySelector('#sheet-title')?.textContent.trim(),
    description:document.querySelector('meta[name="description"]')?.content,
    canonical:document.querySelector('link[rel="canonical"]')?.href,
    parent:document.body.dataset.handsOnParent,
    method:document.body.dataset.handsOnMethod,
    selected:document.querySelector('#k2-activity')?.value,
    worksheetPressed:document.querySelector('#questions')?.getAttribute('aria-pressed'),
    answerPressed:document.querySelector('#answers')?.getAttribute('aria-pressed'),
    printWorksheet:document.querySelector('#print-worksheet')?.checked,
    printAnswer:document.querySelector('#print-answer')?.checked,
    bankAnswers:document.querySelector('.paper')?.classList.contains('bank-answers')
  }));
}

async function main() {
  const server = await serve();
  const port = server.address().port;
  const browser = await chromium.launch({headless:true, ...(fs.existsSync(chrome)?{executablePath:chrome}:{})});
  const errors = [];
  const report = {pages:manifest.pages.length, exactModeChecks:0, seoPersistenceChecks:0, answerConsistencyChecks:0, answerVisibilityChecks:0, answerLeakChecks:0, newProblemChecks:0, contentVariationChecks:0, fixedFormatChecks:0, printSelectionChecks:0, representativePdfChecks:0, twoPageBundleChecks:0, errors:0};
  try {
    const page = await browser.newPage({viewport:{width:1440,height:1100}});
    for (const item of manifest.pages) {
      const runtimeErrors = [];
      const failed = [];
      const onPageError = error => runtimeErrors.push(error.message);
      const onFailed = request => failed.push(`${request.url()} ${request.failure()?.errorText || 'failed'}`);
      page.on('pageerror', onPageError);
      page.on('requestfailed', onFailed);
      const url = `http://127.0.0.1:${port}/en/${item.file}?set=24681357`;
      await page.goto(url, {waitUntil:'domcontentloaded'});
      await page.waitForSelector('.bank-question');

      const state = await pageState(page);
      if (state.parent !== item.parent || state.method !== item.method || state.selected !== item.method) errors.push(`${item.slug}: expected ${item.parent}/${item.method}, got ${state.parent}/${state.method}/${state.selected}`);
      else report.exactModeChecks++;
      if (state.title !== item.title + ' | Googoodan' || state.h1 !== item.title || state.sheetTitle !== item.title || state.description !== item.description || state.canonical !== item.canonical) errors.push(`${item.slug}: runtime SEO/heading did not stay static`);
      else report.seoPersistenceChecks++;
      const headings = await page.$$eval('.bank-question > b:first-child', nodes => nodes.map(node => node.textContent.trim().replace(/^\d+\.\s*/, '')));
      if (!headings.length || headings.some(heading => heading !== labels[item.method])) errors.push(`${item.slug}: rendered mixed method headings ${JSON.stringify(headings)}`);

      const question = await questionSignature(page);
      const leak = await page.evaluate(() => {
        const answerLines = [...document.querySelectorAll('.activity-answer-line')].map(node => getComputedStyle(node).opacity);
        const answerKeys = [...document.querySelectorAll('.activity-key')].map(node => {
          const style = getComputedStyle(node);
          return {background:style.backgroundColor, shadow:style.boxShadow};
        });
        return {
          answerParagraphs:document.querySelectorAll('.bank-answer').length,
          bankAnswers:document.querySelector('.paper')?.classList.contains('bank-answers'),
          visibleAnswerLines:answerLines.filter(opacity => Number(opacity) > 0.01).length,
          highlightedKeys:answerKeys.filter(item => item.background === 'rgb(255, 229, 185)' || item.shadow.includes('rgb(223, 131, 81)')).length
        };
      });
      if (leak.answerParagraphs || leak.bankAnswers || leak.visibleAnswerLines || leak.highlightedKeys) errors.push(`${item.slug}: answer clue visible on worksheet ${JSON.stringify(leak)}`);
      else report.answerLeakChecks++;

      await page.click('#answers');
      await page.waitForFunction(() => document.querySelector('#answers')?.getAttribute('aria-pressed') === 'true');
      const answerState = await pageState(page);
      const answer = await questionSignature(page);
      if (JSON.stringify(question) !== JSON.stringify(answer)) errors.push(`${item.slug}: worksheet and answer questions changed`);
      else report.answerConsistencyChecks++;
      const answerParagraphs = await page.$$eval('.bank-answer', nodes => nodes.map(node => node.textContent.trim()));
      if (!answerParagraphs.length || answerParagraphs.some(text => !text)) errors.push(`${item.slug}: answer key content missing`);
      else report.answerVisibilityChecks++;
      if (!answerState.bankAnswers || answerState.printWorksheet || !answerState.printAnswer) errors.push(`${item.slug}: answer preview/print selection not synchronized`);
      else report.printSelectionChecks++;
      if (answerState.title !== item.title + ' | Googoodan' || answerState.canonical !== item.canonical || answerState.description !== item.description) errors.push(`${item.slug}: SEO changed in answer view`);

      await page.click('#questions');
      await page.waitForFunction(() => document.querySelector('#questions')?.getAttribute('aria-pressed') === 'true');
      const beforeNew = await page.$eval('.problems', node => node.innerHTML);
      const beforeSet = await page.$eval('#set', node => node.textContent.trim());
      await page.click('#new');
      let afterNew = await page.$eval('.problems', node => node.innerHTML);
      const afterSet = await page.$eval('#set', node => node.textContent.trim());
      if (afterSet === beforeSet) errors.push(`${item.slug}: New problems did not advance the set`);
      else report.newProblemChecks++;
      for (let attempt=1; attempt<5 && afterNew===beforeNew; attempt++) {
        await page.click('#new');
        afterNew = await page.$eval('.problems', node => node.innerHTML);
      }
      const fixedFormats = new Set(['skip-2','skip-5','skip-10','color-odd','color-even']);
      if (afterNew === beforeNew && !fixedFormats.has(item.method)) {
        await page.goto(`http://127.0.0.1:${port}/en/${item.file}?set=975318642`, {waitUntil:'domcontentloaded'});
        await page.waitForSelector('.bank-question');
        afterNew = await page.$eval('.problems', node => node.innerHTML);
      }
      const afterState = await pageState(page);
      if (fixedFormats.has(item.method)) {
        if (afterNew !== beforeNew) errors.push(`${item.slug}: fixed-format activity unexpectedly changed its mathematical content`);
        else report.fixedFormatChecks++;
      } else if (afterNew === beforeNew) errors.push(`${item.slug}: generator did not provide a different set`);
      else report.contentVariationChecks++;
      if (afterState.selected !== item.method || afterState.title !== item.title + ' | Googoodan' || afterState.canonical !== item.canonical) errors.push(`${item.slug}: exact method or SEO lost after New problems`);
      if (!afterState.printWorksheet || afterState.printAnswer) errors.push(`${item.slug}: worksheet preview/print selection not synchronized`);
      if (runtimeErrors.length) errors.push(`${item.slug}: page errors ${runtimeErrors.join('; ')}`);
      if (failed.length) errors.push(`${item.slug}: failed resources ${failed.join('; ')}`);
      page.off('pageerror', onPageError);
      page.off('requestfailed', onFailed);
    }

    const sampleMethods = ['number-bond','skip-2','read-clock','count-coins','shade-fraction','connect-dots-20','build-picture-graph','addition-maze-20'];
    for (const method of sampleMethods) {
      const item = manifest.pages.find(page => page.method === method);
      await page.goto(`http://127.0.0.1:${port}/en/${item.file}?set=97531`, {waitUntil:'domcontentloaded'});
      await page.waitForSelector('.bank-question');
      for (const format of ['A4','Letter']) {
        const file = path.join(os.tmpdir(), `googoodan-hands-on-${item.slug}-${format}.pdf`);
        await page.pdf({path:file, format, printBackground:true, preferCSSPageSize:false});
        const info = execFileSync(pdfinfo, [file], {encoding:'utf8'});
        const pages = Number(info.match(/^Pages:\s+(\d+)/m)?.[1]);
        fs.unlinkSync(file);
        if (pages !== 1) errors.push(`${item.slug}: ${format} PDF has ${pages} pages`);
        else report.representativePdfChecks++;
      }
    }

    const bundle = manifest.pages.find(item => item.method === 'draw-hands');
    await page.goto(`http://127.0.0.1:${port}/en/${bundle.file}?set=86420`, {waitUntil:'domcontentloaded'});
    await page.waitForSelector('.bank-question');
    await page.check('#print-answer');
    const bundleFile = path.join(os.tmpdir(), 'googoodan-hands-on-question-answer-bundle.pdf');
    await page.pdf({path:bundleFile, format:'Letter', printBackground:true, preferCSSPageSize:false});
    const bundleInfo = execFileSync(pdfinfo, [bundleFile], {encoding:'utf8'});
    const bundlePages = Number(bundleInfo.match(/^Pages:\s+(\d+)/m)?.[1]);
    fs.unlinkSync(bundleFile);
    if (bundlePages !== 2) errors.push(`worksheet+answer bundle has ${bundlePages} pages`);
    else report.twoPageBundleChecks++;
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
  if (errors.length) {
    report.errors = errors.length;
    console.error(JSON.stringify(report, null, 2));
    console.error(errors.join('\n'));
    process.exit(1);
  }
  console.log(JSON.stringify(report, null, 2));
}

main().catch(error => { console.error(error.stack || error); process.exit(1); });
