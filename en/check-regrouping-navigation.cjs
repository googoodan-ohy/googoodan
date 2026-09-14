'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');

const enDir = __dirname;
const root = path.resolve(enDir, '..');
const VERSION = '20260914-regrouping-english';
const manifest = JSON.parse(fs.readFileSync(path.join(enDir, 'regrouping-reuse-static-manifest.json'), 'utf8'));
const pages = manifest.pages;
const marker = /<!-- REGROUPING-NAVIGATION:START -->([\s\S]*?)<!-- REGROUPING-NAVIGATION:END -->/g;
const hubFiles = ['grade-2.html', 'grade-3.html', 'grade-4.html', 'addition-worksheets.html', 'subtraction-worksheets.html', 'worksheets.html', 'multiply-one.html'];

if (pages.length !== 17) throw new Error('Expected 17 manifest pages');
const expectedGradeCounts = new Map([[2, 3], [3, 7], [4, 7]]);
for (const [grade, expected] of expectedGradeCounts) {
  const actual = pages.filter(page => page.grade === grade).length;
  if (actual !== expected) throw new Error('Grade ' + grade + ': expected ' + expected + ', found ' + actual);
}

let staticLinks = 0;
const pageLinkCounts = new Map(pages.map(page => [page.file, 0]));
for (const name of hubFiles) {
  const html = fs.readFileSync(path.join(enDir, name), 'utf8');
  const blocks = [...html.matchAll(marker)];
  if (blocks.length !== 1) throw new Error(name + ': expected one navigation marker, found ' + blocks.length);
  for (const match of blocks[0][1].matchAll(/href="(\/en\/[^"#?]+\.html)"/g)) {
    const local = path.join(root, match[1].replace(/^\//, '').replaceAll('/', path.sep));
    if (!fs.existsSync(local)) throw new Error(name + ': broken link ' + match[1]);
    const file = path.basename(local);
    if (pageLinkCounts.has(file)) pageLinkCounts.set(file, pageLinkCounts.get(file) + 1);
    staticLinks++;
  }
}
for (const [file, count] of pageLinkCounts) {
  if (count < 2) throw new Error(file + ': expected links from its grade and operation hubs, found ' + count);
}

const grades = fs.readFileSync(path.join(enDir, 'grades.html'), 'utf8');
const scriptRef = '/en/banks/regrouping-navigation.js?v=' + VERSION;
if (grades.split(scriptRef).length - 1 !== 1) throw new Error('grades.html: versioned navigation script must appear exactly once');

const navigationCode = fs.readFileSync(path.join(enDir, 'banks', 'regrouping-navigation.js'), 'utf8');
const menuCounts = {};
for (const [grade, expected] of expectedGradeCounts) {
  const group = {dataset: {}, options: [], append(option) { this.options.push(option); }};
  const select = {
    group: null,
    selectedOptions: [],
    onchange() {},
    querySelector() { return this.group; },
    append(node) { this.group = node; }
  };
  let destination = '';
  const sandbox = {
    URLSearchParams,
    location: {pathname: '/en/grades.html', search: '?grade=' + grade, href: 'https://googoodan.com/en/grades.html?grade=' + grade},
    document: {
      getElementById(id) { return id === 'unit' ? select : null; },
      createElement(tag) { return tag === 'optgroup' ? group : {dataset: {}}; }
    },
    MutationObserver: class { observe() {} },
    WorksheetNavigation: {go(href) { destination = href; }}
  };
  sandbox.globalThis = sandbox;
  vm.runInNewContext(navigationCode, sandbox, {filename: 'regrouping-navigation.js'});
  if (!select.group || select.group.options.length !== expected) throw new Error('Grade ' + grade + ': menu expected ' + expected + ' options');
  const first = select.group.options[0];
  select.selectedOptions = [first];
  select.onchange({target: select});
  if (destination !== first.dataset.regroupingHref || !/^\/en\/grade-[234]-.*\.html$/.test(destination)) {
    throw new Error('Grade ' + grade + ': selection did not navigate to the worksheet page');
  }
  menuCounts[grade] = select.group.options.length;
}

const index = fs.readFileSync(path.join(enDir, 'index.html'), 'utf8');
const requiredAssets = [
  '/en/types.js',
  '/en/banks/regrouping-reuse.css?v=' + VERSION,
  '/ko/catalog.js',
  '/ko/engine.js',
  '/ko/art/catalog.js',
  '/ko/art.js',
  '/ko/banks/arithmetic-targets.js',
  '/en/banks/regrouping-reuse.js?v=' + VERSION,
  '/en/app.js'
];
let previous = -1;
for (const asset of requiredAssets) {
  let position = index.indexOf(asset);
  if (position < 0 && asset.startsWith('/en/')) position = index.indexOf(asset.slice(4));
  if (position < 0 || position <= previous) throw new Error('index.html: missing or out-of-order asset ' + asset);
  previous = position;
}

const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
for (const page of pages) {
  const escaped = page.canonical.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const count = (sitemap.match(new RegExp('<loc>' + escaped + '</loc>', 'g')) || []).length;
  if (count !== 1) throw new Error(page.canonical + ': sitemap count ' + count);
}

const outputFiles = hubFiles.map(name => path.join(enDir, name)).concat([
  path.join(enDir, 'grades.html'),
  path.join(enDir, 'index.html'),
  path.join(root, 'sitemap.xml')
]);
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const before = outputFiles.map(hash);
delete require.cache[require.resolve(path.join(enDir, 'build-regrouping-navigation.cjs'))];
require(path.join(enDir, 'build-regrouping-navigation.cjs'));
const after = outputFiles.map(hash);
if (before.some((value, index) => value !== after[index])) throw new Error('Navigation builder output is not deterministic');

console.log(JSON.stringify({
  pages: pages.length,
  gradeMenuOptions: menuCounts,
  hubFiles: hubFiles.length,
  staticLinksChecked: staticLinks,
  brokenStaticLinks: 0,
  sitemapDuplicates: 0,
  deterministicFiles: outputFiles.length
}, null, 2));
