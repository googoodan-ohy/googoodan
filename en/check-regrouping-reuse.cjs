'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const {execFileSync} = require('node:child_process');

const root = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'en', 'regrouping-reuse-static-manifest.json'), 'utf8'));
const sandbox = {console, Worksheets: {types: []}};
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
for (const file of [
  'ko/catalog.js',
  'ko/engine.js',
  'ko/art/catalog.js',
  'ko/art.js',
  'ko/banks/arithmetic-targets.js',
  'en/banks/regrouping-reuse.js'
]) vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), sandbox, {filename: file});

function carries(a, b, op) {
  let carry = 0, count = 0;
  while (a || b) {
    const x = a % 10, y = b % 10;
    carry = op === '+' ? (x + y + carry >= 10 ? 1 : 0) : (x - carry < y ? 1 : 0);
    count += carry;
    a = Math.floor(a / 10);
    b = Math.floor(b / 10);
  }
  return count;
}

function mulCarries(a, b) {
  let carry = 0, count = 0;
  while (a) {
    const total = (a % 10) * b + carry;
    carry = Math.floor(total / 10);
    if (carry) count++;
    a = Math.floor(a / 10);
  }
  return count;
}

let questions = 0;
for (const page of manifest.pages) {
  for (let seed = 0; seed < 200; seed++) {
    const sections = sandbox.KoMath.generate('regrouping-reuse:' + page.id, 0, seed, 1);
    if (sections.length !== 6) throw new Error(page.id + ' seed ' + seed + ': expected 6 sections');
    for (let i = 0; i < sections.length; i++) {
      const q = sections[i].questions[0];
      const c = q.check;
      if (!c) throw new Error(page.id + ': missing source check data');
      if (c.op !== (page.operation === 'addition' ? '+' : page.operation === 'subtraction' ? '−' : '×')) throw new Error(page.id + ': operation mismatch');
      const actual = c.op === '×' ? mulCarries(c.a, c.b) : carries(c.a, c.b, c.op);
      if (actual !== page.exactRegroupings || c.target !== page.exactRegroupings) {
        throw new Error(page.id + ' seed ' + seed + ': expected ' + page.exactRegroupings + ', got ' + actual);
      }
      if (String(c.a).length !== page.digits) throw new Error(page.id + ': source digit mismatch');
      if (c.op !== '×' && String(c.b).length !== page.digits) throw new Error(page.id + ': second operand digit mismatch');
      if (c.op === '×' && (c.b < 2 || c.b > 9)) throw new Error(page.id + ': one-digit factor mismatch');
      const expectedValue = c.op === '+' ? c.a + c.b : c.op === '−' ? c.a - c.b : c.a * c.b;
      if (c.value !== expectedValue) throw new Error(page.id + ': arithmetic result mismatch');
      if (c.op === '−' && c.a < c.b) throw new Error(page.id + ': negative subtraction');
      const activity = Math.floor(i / 2);
      if (activity === 0 && String(q.answer) !== String(c.value)) throw new Error(page.id + ': calculation answer mismatch');
      if (activity === 1 && String(q.answer) !== String(c.a)) throw new Error(page.id + ': inverse answer mismatch');
      if (activity === 2) {
        const displayed = Number((q.task.match(/=\s*(\d+)/) || [])[1]);
        if (!Number.isFinite(displayed)) throw new Error(page.id + ': missing check value');
        if (q.answer === '✓' && displayed !== c.value) throw new Error(page.id + ': true check mismatch');
        if (q.answer.startsWith('✗') && (displayed === c.value || !q.answer.endsWith(String(c.value)))) throw new Error(page.id + ': correction mismatch');
      }
      if (/[\u3131-\u318e\uac00-\ud7a3]/.test(q.prompt + q.task + q.answer + q.reason)) throw new Error(page.id + ': visible Korean remains');
      questions++;
    }
  }
}

const titles = new Set();
const h1s = new Set();
const canonicals = new Set();
let links = 0;
for (const page of manifest.pages) {
  const file = path.join(root, 'en', page.file);
  const html = fs.readFileSync(file, 'utf8');
  const title = (html.match(/<title>(.*?)<\/title>/i) || [])[1];
  const h1 = (html.match(/<h1>(.*?)<\/h1>/i) || [])[1];
  const description = (html.match(/<meta name="description" content="([^"]*)">/i) || [])[1];
  const canonical = (html.match(/<link rel="canonical" href="([^"]*)">/i) || [])[1];
  if (!title || !h1 || !description || !canonical) throw new Error(page.file + ': missing static SEO field');
  if (title.length > 75) throw new Error(page.file + ': title exceeds 75 characters');
  if (description.length < 100 || description.length > 165) throw new Error(page.file + ': description length ' + description.length);
  if (titles.has(title) || h1s.has(h1) || canonicals.has(canonical)) throw new Error(page.file + ': duplicate SEO field');
  titles.add(title); h1s.add(h1); canonicals.add(canonical);
  if (canonical !== page.canonical || !html.includes('<meta name="robots" content="index,follow">')) throw new Error(page.file + ': canonical/robots mismatch');
  const hreflangs = [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)"/g)].map(match => match[1]);
  if (hreflangs.join(',') !== 'en,ko,ja,fr,de,x-default') throw new Error(page.file + ': hreflang mismatch ' + hreflangs);
  for (const block of html.matchAll(/<script(?: id="[^"]*")? type="application\/ld\+json">(.*?)<\/script>/g)) JSON.parse(block[1]);
  if (!html.includes('/en/banks/regrouping-reuse.js?v=20260914-regrouping-english') ||
      !html.includes('/en/banks/regrouping-reuse.css?v=20260914-regrouping-english')) throw new Error(page.file + ': missing versioned adapter asset');
  const text = html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').trim();
  if (text.split(' ').length < 300) throw new Error(page.file + ': static content under 300 words');
  for (const match of html.matchAll(/href="(\/en\/[^"#?]+\.html)/g)) {
    const local = path.join(root, match[1].replace(/^\//, '').replaceAll('/', path.sep));
    if (!fs.existsSync(local)) throw new Error(page.file + ': broken link ' + match[1]);
    links++;
  }
}

const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const outputFiles = manifest.pages.map(page => path.join(root, 'en', page.file)).concat(
  path.join(root, 'en', 'regrouping-reuse-static-manifest.json'),
  path.join(root, 'en-seo-metadata-report.csv')
);
const buildFinalOutput = () => {
  for (const script of ['en/build-regrouping-reuse-static.cjs', 'build-en-seo-metadata.cjs']) {
    execFileSync(process.execPath, [path.join(root, script)], {
      cwd: root,
      stdio: ['ignore', 'pipe', 'pipe']
    });
  }
};
buildFinalOutput();
const first = outputFiles.map(hash);
buildFinalOutput();
const second = outputFiles.map(hash);
if (first.some((value, index) => value !== second[index])) throw new Error('Final regrouping and SEO builder output is not deterministic');

console.log(JSON.stringify({
  pages: manifest.pages.length,
  seedsPerPage: 200,
  questionsChecked: questions,
  uniqueTitles: titles.size,
  uniqueH1s: h1s.size,
  hreflangSets: manifest.pages.length,
  jsonLdPages: manifest.pages.length,
  internalLinksChecked: links,
  staticWordsMinimum: 300,
  deterministicFiles: outputFiles.length
}, null, 2));
