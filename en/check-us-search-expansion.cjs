'use strict';
const fs = require('fs');
const path = require('path');
const {parseCsv, REPORT_PATH} = require('../en-seo-metadata.cjs');

const root = path.resolve(__dirname, '..');
const en = __dirname;
const errors = [];
const manifest = JSON.parse(fs.readFileSync(path.join(en, 'cut-and-paste-manifest.json'), 'utf8'));
const numberSenseManifest = JSON.parse(fs.readFileSync(path.join(en, 'number-sense-static-manifest.json'), 'utf8'));
const pages = [
  'kindergarten.html',
  'number-sense-worksheets.html',
  'addition-worksheets.html',
  'subtraction-worksheets.html',
  ...manifest.pages.map(page => page.file),
  ...numberSenseManifest.pages.map(page => page.file)
];
const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
const reportRows = fs.existsSync(REPORT_PATH) ? parseCsv(fs.readFileSync(REPORT_PATH, 'utf8')) : [];
const reportTitles = new Map();
if (!fs.existsSync(REPORT_PATH)) errors.push('Missing SEO metadata report: en-seo-metadata-report.csv');
for (const row of reportRows) {
  if (!row.current_file || !row.recommended_title) continue;
  if (reportTitles.has(row.current_file)) errors.push('Duplicate SEO report row: ' + row.current_file);
  reportTitles.set(row.current_file, row.recommended_title);
}
const allTitles = new Map();
for (const file of walk(en).filter(file => file.endsWith('.html'))) {
  const source = fs.readFileSync(file, 'utf8');
  const title = source.match(/<title>([^<]+)<\/title>/i)?.[1];
  if (title) allTitles.set(title, (allTitles.get(title) || 0) + 1);
}

function walk(directory) {
  const files = [];
  for (const entry of fs.readdirSync(directory, {withFileTypes: true})) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walk(file));
    else files.push(file);
  }
  return files;
}

function count(source, needle) {
  return source.split(needle).length - 1;
}

function resolveInternal(href) {
  const url = new URL(href, 'https://googoodan.com');
  if (url.hostname !== 'googoodan.com') return null;
  let pathname = decodeURIComponent(url.pathname);
  if (pathname.endsWith('/')) pathname += 'index.html';
  return path.join(root, ...pathname.split('/').filter(Boolean));
}

for (const fileName of pages) {
  const file = path.join(en, fileName);
  if (!fs.existsSync(file)) {
    errors.push('Missing page: ' + fileName);
    continue;
  }
  const source = fs.readFileSync(file, 'utf8');
  const canonical = 'https://googoodan.com/en/' + fileName.replaceAll('\\', '/');
  const title = source.match(/<title>([^<]+)<\/title>/i)?.[1] || '';
  const h1 = source.match(/<h1(?:\s[^>]*)?>([\s\S]*?)<\/h1>/i)?.[1].replace(/<[^>]+>/g, '').trim() || '';
  const description = source.match(/<meta name="description" content="([^"]+)"/i)?.[1] || '';
  const reportFile = 'en/' + fileName.replaceAll('\\', '/');
  const expectedTitle = reportTitles.get(reportFile);
  if (!expectedTitle) errors.push(fileName + ': missing recommended_title in SEO metadata report');
  else if (title !== expectedTitle) errors.push(fileName + ': title differs from SEO metadata report: ' + title);
  if (!h1) errors.push(fileName + ': missing H1');
  if (description.length < 120 || description.length > 170) errors.push(fileName + ': description length ' + description.length);
  if (count(source, '<link rel="canonical" href="' + canonical + '">') !== 1) errors.push(fileName + ': canonical mismatch');
  if (!/<meta name="robots" content="index,follow">/i.test(source)) errors.push(fileName + ': robots');
  for (const language of ['en', 'ko', 'ja', 'fr', 'de', 'x-default']) {
    if (count(source, 'hreflang="' + language + '"') !== 1) errors.push(fileName + ': hreflang ' + language);
  }
  for (const match of source.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
    try { JSON.parse(match[1]); } catch (error) { errors.push(fileName + ': invalid JSON-LD: ' + error.message); }
  }
  const localAssets = [
    ...source.matchAll(/<script[^>]+src="([^"]+\.js(?:\?[^"]*)?)"/gi),
    ...source.matchAll(/<link[^>]+href="([^"]+\.css(?:\?[^"]*)?)"/gi)
  ].map(match => match[1]).filter(url => !/^https?:/i.test(url));
  for (const asset of localAssets) if (!asset.includes('?v=')) errors.push(fileName + ': unversioned asset ' + asset);
  const sitemapCount = count(sitemap, '<loc>' + canonical + '</loc>');
  if (sitemapCount !== 1) errors.push(fileName + ': sitemap count ' + sitemapCount);
  if ((allTitles.get(title) || 0) !== 1) errors.push(fileName + ': duplicate title count ' + allTitles.get(title));
  for (const match of source.matchAll(/href="([^"]+)"/gi)) {
    const href = match[1];
    if (!href.startsWith('/en/')) continue;
    const target = resolveInternal(href);
    if (target && !fs.existsSync(target)) errors.push(fileName + ': broken link ' + href);
  }
}

const integrated = ['index.html', 'worksheets.html', 'kindergarten.html', 'grade-1.html', 'grade-2.html', 'math-worksheets-for-kids.html', 'add-small.html', 'subtract-small.html', 'place-value.html', 'number-sense-worksheets.html', 'early-math-activities.html'];
for (const fileName of integrated) {
  const source = fs.readFileSync(path.join(en, fileName), 'utf8');
  if (count(source, '<!-- US-SEARCH-EXPANSION:START -->') !== 1 || count(source, '<!-- US-SEARCH-EXPANSION:END -->') !== 1) {
    errors.push(fileName + ': integration marker mismatch');
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(JSON.stringify({
  checkedPages: pages.length,
  integratedFiles: integrated.length,
  cutPastePages: manifest.count,
  numberSensePages: numberSenseManifest.pages.length,
  sitemapEntriesChecked: pages.length,
  brokenLinks: 0,
  duplicateTitles: 0,
  metadataErrors: 0
}, null, 2));
