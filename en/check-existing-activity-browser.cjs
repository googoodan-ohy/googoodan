'use strict';
const fs = require('fs');
const http = require('http');
const os = require('os');
const path = require('path');
const {execFileSync} = require('child_process');
const {chromium} = require('playwright');

const root = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, 'existing-activity-static-manifest.json'), 'utf8'));
const pdfinfo = 'C:\\Users\\ohy10\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\native\\poppler\\Library\\bin\\pdfinfo.exe';
const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp'};

function serve() {
  return new Promise(resolve => {
    const server = http.createServer((req, res) => {
      const clean = decodeURIComponent(new URL(req.url, 'http://local').pathname).replace(/^\/+/, '');
      const target = path.resolve(root, clean || 'index.html');
      if (!target.startsWith(root + path.sep) && target !== path.join(root, 'index.html')) { res.writeHead(403).end(); return; }
      fs.readFile(target, (error, data) => {
        if (error) { res.writeHead(404).end('Not found'); return; }
        res.writeHead(200, {'content-type': mime[path.extname(target).toLowerCase()] || 'application/octet-stream', 'cache-control':'no-store'});
        res.end(data);
      });
    }).listen(0, '127.0.0.1', () => resolve(server));
  });
}

async function signature(page, control) {
  if (control === 'color') return page.$$eval('.color-cell', cells => cells.map(cell => {
    const copy = cell.cloneNode(true); copy.querySelector('small')?.remove(); return copy.textContent.trim();
  }));
  return page.$$eval('.bank-question', questions => questions.map(question => {
    const heading = question.querySelector('b')?.textContent.trim() || '';
    const prompt = question.querySelector('p')?.textContent.trim() || '';
    return heading + '|' + prompt;
  }));
}

async function main() {
  const server = await serve();
  const port = server.address().port;
  const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const browser = await chromium.launch({headless:true, executablePath:fs.existsSync(chrome)?chrome:undefined});
  const errors = [];
  let answerChecks = 0, regenerationChecks = 0, exactModeChecks = 0, pdfChecks = 0;
  try {
    const page = await browser.newPage({viewport:{width:1440,height:1100}});
    for (const item of manifest.pages) {
      const pageErrors = [];
      const listener = error => pageErrors.push(error.message);
      page.on('pageerror', listener);
      const url = `http://127.0.0.1:${port}/en/${item.file}?set=24681357`;
      await page.goto(url, {waitUntil:'domcontentloaded'});
      await page.waitForSelector('.problems > *');
      const state = await page.evaluate(() => ({
        title:document.title,
        h1:document.querySelector('main aside > h1')?.textContent.trim(),
        sheetTitle:document.querySelector('#sheet-title')?.textContent.trim(),
        canonical:document.querySelector('link[rel="canonical"]')?.href,
        mode:document.querySelector('#early-activity,#color-operation,#coverage-skill,#reasoning-skill')?.value
      }));
      if (state.title !== item.title + ' | Googoodan') errors.push(`${item.slug}: runtime title`);
      if (state.h1 !== item.title || state.sheetTitle !== item.title) errors.push(`${item.slug}: runtime heading`);
      if (state.canonical !== item.canonical) errors.push(`${item.slug}: runtime canonical ${state.canonical}`);
      if (state.mode !== item.mode) errors.push(`${item.slug}: expected mode ${item.mode}, got ${state.mode}`);
      else exactModeChecks++;
      const questions = await signature(page, item.control);
      if (!questions.length) errors.push(`${item.slug}: no generated questions`);
      await page.click('#answers');
      const answers = await signature(page, item.control);
      if (JSON.stringify(questions) !== JSON.stringify(answers)) errors.push(`${item.slug}: worksheet/answer questions changed`);
      const answerVisible = item.control === 'color'
        ? await page.$$eval('.color-cell small', nodes => nodes.length > 0 && nodes.every(n => !n.textContent.includes('______')))
        : await page.$$eval('.bank-answer', nodes => nodes.length > 0 && nodes.every(n => n.textContent.trim().length > 0));
      if (!answerVisible) errors.push(`${item.slug}: answer key missing`); else answerChecks++;
      await page.click('#questions');
      const beforeNew = await page.$eval('.problems', node => node.innerHTML);
      let afterNew = beforeNew;
      for (let attempt = 0; attempt < 5 && afterNew === beforeNew; attempt++) {
        await page.click('#new');
        afterNew = await page.$eval('.problems', node => node.innerHTML);
      }
      const modeAfterNew = await page.$eval('#early-activity,#color-operation,#coverage-skill,#reasoning-skill', el => el.value);
      if (beforeNew === afterNew) errors.push(`${item.slug}: five New problems attempts did not change content`);
      else regenerationChecks++;
      if (modeAfterNew !== item.mode) errors.push(`${item.slug}: mode lost after New problems`);
      if (pageErrors.length) errors.push(`${item.slug}: ${pageErrors.join('; ')}`);
      page.off('pageerror', listener);
    }

    const samples = [manifest.pages[0], manifest.pages[14], manifest.pages[16], manifest.pages[17]];
    for (const sample of samples) {
      await page.goto(`http://127.0.0.1:${port}/en/${sample.file}?set=97531`, {waitUntil:'domcontentloaded'});
      await page.waitForSelector('.problems > *');
      for (const format of ['A4','Letter']) {
        const file = path.join(os.tmpdir(), `googoodan-${sample.slug}-${format}.pdf`);
        await page.pdf({path:file, format, printBackground:true, preferCSSPageSize:false});
        const info = execFileSync(pdfinfo, [file], {encoding:'utf8'});
        const pages = Number(info.match(/^Pages:\s+(\d+)/m)?.[1]);
        fs.unlinkSync(file);
        if (pages !== 1) errors.push(`${sample.slug}: ${format} PDF has ${pages} pages`); else pdfChecks++;
      }
    }
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
  if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
  console.log(JSON.stringify({pages:manifest.pages.length, exactModeChecks, answerConsistencyChecks:answerChecks, regenerationChecks, representativePdfChecks:pdfChecks, pdfPageCount:1, errors:0}, null, 2));
}
main().catch(error => { console.error(error.stack || error); process.exit(1); });
