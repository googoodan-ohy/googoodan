'use strict';
const fs = require('fs');
const path = require('path');
const {definitions} = require('./banks/k2-activities.js');

const enDir = __dirname;
const manifestFile = path.join(enDir, 'k2-activity-method-static-manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
const errors = [];
const extract = (html, pattern) => html.match(pattern)?.[1]?.trim() || '';
const stripTags = value => value.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ').replace(/\s+/g, ' ').trim();

if (manifest.sourceMethodCount !== 53) errors.push(`source method count ${manifest.sourceMethodCount}, expected 53`);
if (manifest.generatedCount !== 51 || manifest.pages.length !== 51) errors.push(`generated ${manifest.pages.length}, expected 51`);
if (manifest.skippedCount !== 2 || manifest.skipped.length !== 2) errors.push(`skipped ${manifest.skipped.length}, expected 2`);

const definitionMap = new Map(definitions.map(definition => [definition.id, definition]));
const ownFiles = new Set(manifest.pages.map(page => path.resolve(enDir, page.file).toLowerCase()));
const allHtml = [];
function walk(dir) {
  for (const item of fs.readdirSync(dir, {withFileTypes:true})) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) walk(full);
    else if (item.isFile() && item.name.endsWith('.html')) allHtml.push(full);
  }
}
walk(enDir);

const otherValues = {title:new Map(), h1:new Map(), canonical:new Map()};
for (const file of allHtml) {
  if (ownFiles.has(path.resolve(file).toLowerCase())) continue;
  const html = fs.readFileSync(file, 'utf8');
  const values = {
    title:extract(html, /<title>([\s\S]*?)<\/title>/i),
    h1:stripTags(extract(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i)),
    canonical:extract(html, /<link rel="canonical" href="([^"]+)"/i)
  };
  for (const [key, value] of Object.entries(values)) {
    if (!value) continue;
    if (!otherValues[key].has(value)) otherValues[key].set(value, []);
    otherValues[key].get(value).push(path.relative(enDir, file).replaceAll('\\', '/'));
  }
}

const seen = {slug:new Set(), method:new Set(), title:new Set(), h1:new Set(), canonical:new Set(), description:new Set()};
let jsonLdBlocks = 0;
let resourceWords = 0;
for (const page of manifest.pages) {
  const file = path.join(enDir, page.file);
  if (!fs.existsSync(file)) { errors.push(`missing ${page.file}`); continue; }
  const html = fs.readFileSync(file, 'utf8');
  const title = extract(html, /<title>([\s\S]*?)<\/title>/i);
  const h1 = stripTags(extract(html, /<aside><h1[^>]*>([\s\S]*?)<\/h1>/i));
  const description = extract(html, /<meta name="description" content="([^"]*)">/i);
  const canonical = extract(html, /<link rel="canonical" href="([^"]+)">/i);
  const definition = definitionMap.get(page.parent);
  if (!definition?.methods.includes(page.method)) errors.push(`${page.slug}: invalid ${page.parent}/${page.method}`);
  if (title !== page.title + ' | Googoodan') errors.push(`${page.slug}: title mismatch`);
  if (h1 !== page.title) errors.push(`${page.slug}: H1 mismatch`);
  if (description !== page.description) errors.push(`${page.slug}: description mismatch`);
  if (canonical !== page.canonical) errors.push(`${page.slug}: canonical mismatch`);
  if (!html.includes(`data-type="${page.parent}"`)) errors.push(`${page.slug}: parent type missing`);
  if (!html.includes(`data-hands-on-method="${page.method}"`)) errors.push(`${page.slug}: exact method missing`);
  if (!html.includes('/en/hands-on-entry.js?v=20260913-k2-activity-methods')) errors.push(`${page.slug}: entry adapter/version missing`);
  if (/name="robots"[^>]*noindex/i.test(html)) errors.push(`${page.slug}: noindex present`);

  const alternates = [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)">/gi)].map(match => [match[1], match[2]]);
  const expectedAlternates = new Map([
    ['en', page.canonical], ['ko','https://googoodan.com/ko/'], ['ja','https://googoodan.com/ja/'],
    ['fr','https://googoodan.com/fr/'], ['de','https://googoodan.com/de/'], ['x-default','https://googoodan.com/']
  ]);
  if (alternates.length !== expectedAlternates.size) errors.push(`${page.slug}: ${alternates.length} hreflang tags`);
  for (const [language, href] of alternates) {
    if (expectedAlternates.get(language) !== href) errors.push(`${page.slug}: bad hreflang ${language}=${href}`);
    expectedAlternates.delete(language);
  }
  if (expectedAlternates.size) errors.push(`${page.slug}: missing hreflang ${[...expectedAlternates.keys()].join(',')}`);

  const blocks = [...html.matchAll(/<script(?: id="website-identity")? type="application\/ld\+json">([\s\S]*?)<\/script>/gi)];
  if (blocks.length !== 2) errors.push(`${page.slug}: expected 2 JSON-LD blocks, got ${blocks.length}`);
  const parsed = [];
  for (const block of blocks) {
    try { parsed.push(JSON.parse(block[1])); jsonLdBlocks++; }
    catch (error) { errors.push(`${page.slug}: invalid JSON-LD ${error.message}`); }
  }
  const website = parsed.find(item => item['@type'] === 'WebSite');
  const resource = parsed.find(item => item['@type'] === 'LearningResource');
  if (website?.name !== 'googoodan' || website?.alternateName !== '구구단닷컴') errors.push(`${page.slug}: WebSite identity`);
  if (resource?.name !== page.title || resource?.url !== page.canonical || resource?.inLanguage !== 'en-US') errors.push(`${page.slug}: LearningResource identity`);

  const seo = extract(html, /(<section class="seo-resource"[\s\S]*?<\/section>)/i);
  const words = stripTags(seo).split(/\s+/).filter(Boolean).length;
  if (words < 190) errors.push(`${page.slug}: static guide only ${words} words`);
  resourceWords += words;
  if (!seo.includes('/en/' + page.parent + '.html')) errors.push(`${page.slug}: parent collection link missing`);
  if (!html.includes('id="questions"') || !html.includes('id="answers"') || !html.includes('id="new"') || !html.includes('id="print"')) errors.push(`${page.slug}: worksheet controls missing`);
  if (!html.includes('id="print-worksheet"') || !html.includes('id="print-answer"')) errors.push(`${page.slug}: print selection missing`);

  for (const [key, value] of Object.entries({slug:page.slug, method:page.method, title, h1, canonical, description})) {
    if (seen[key].has(value)) errors.push(`${page.slug}: duplicate own ${key} ${value}`);
    seen[key].add(value);
  }
  for (const [key, value] of Object.entries({title, h1, canonical})) {
    if (otherValues[key].has(value)) errors.push(`${page.slug}: ${key} duplicates ${otherValues[key].get(value).join(', ')}`);
  }

  for (const match of html.matchAll(/<(?:script|link)[^>]+(?:src|href)="([^"?#]+\.(?:js|css))([^"]*)"/gi)) {
    if (!match[2].includes('?v=')) errors.push(`${page.slug}: unversioned asset ${match[1]}${match[2]}`);
  }
}

const outputFiles = fs.readdirSync(path.join(enDir, 'print', 'hands-on')).filter(file => file.endsWith('.html'));
if (outputFiles.length !== manifest.pages.length) errors.push(`output directory has ${outputFiles.length} HTML files, manifest has ${manifest.pages.length}`);

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(JSON.stringify({
  sourceMethods:manifest.sourceMethodCount,
  generatedPages:manifest.pages.length,
  skippedExactRootPages:manifest.skippedCount,
  uniqueTitles:seen.title.size,
  uniqueH1:seen.h1.size,
  uniqueCanonicals:seen.canonical.size,
  validJsonLdBlocks:jsonLdBlocks,
  averageStaticGuideWords:Math.round(resourceWords / manifest.pages.length),
  errors:0
}, null, 2));
