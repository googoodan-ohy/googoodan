'use strict';
const fs = require('fs');
const path = require('path');

const enDir = __dirname;
const manifest = JSON.parse(fs.readFileSync(path.join(enDir, 'existing-activity-static-manifest.json'), 'utf8'));
const errors = [];
const seen = {title:new Set(), h1:new Set(), canonical:new Set(), slug:new Set()};
const extract = (html, re) => html.match(re)?.[1]?.trim() || '';
for (const page of manifest.pages) {
  const file = path.join(enDir, page.file);
  if (!fs.existsSync(file)) { errors.push(`missing ${page.file}`); continue; }
  const html = fs.readFileSync(file, 'utf8');
  const title = extract(html, /<title>([\s\S]*?)<\/title>/i);
  const h1 = extract(html, /<aside><h1>([\s\S]*?)<\/h1>/i);
  const canonical = extract(html, /<link rel="canonical" href="([^"]+)">/i);
  const description = extract(html, /<meta name="description" content="([^"]+)">/i);
  for (const [key, value] of Object.entries({title,h1,canonical,slug:page.slug})) {
    if (seen[key].has(value)) errors.push(`duplicate ${key}: ${value}`);
    seen[key].add(value);
  }
  if (title !== page.title + ' | Googoodan') errors.push(`title mismatch ${page.file}`);
  if (h1 !== page.title) errors.push(`h1 mismatch ${page.file}`);
  if (canonical !== page.canonical) errors.push(`canonical mismatch ${page.file}`);
  if (description !== page.description) errors.push(`description mismatch ${page.file}`);
  if (description.length < 100 || description.length > 180) errors.push(`description length ${description.length}: ${page.file}`);
  if (!html.includes(`data-activity-entry-mode="${page.mode}"`)) errors.push(`mode mismatch ${page.file}`);
  if (!html.includes(`data-activity-entry-control="${page.control}"`)) errors.push(`control mismatch ${page.file}`);
  if ((html.match(/<h1\b/gi)||[]).length !== 1) errors.push(`h1 count ${page.file}`);
  if ((html.match(/rel="canonical"/gi)||[]).length !== 1) errors.push(`canonical count ${page.file}`);
  for (const lang of ['en','ko','ja','fr','de','x-default']) if (!html.includes(`hreflang="${lang}"`)) errors.push(`missing hreflang ${lang}: ${page.file}`);
  if (!html.includes('/en/activity-entry.js?v=' + manifest.version)) errors.push(`missing entry adapter ${page.file}`);
  if (!html.includes('isAccessibleForFree')) errors.push(`missing LearningResource schema ${page.file}`);
  if (!html.includes('New problems') || !html.includes('Answer key') || !html.includes('Print')) errors.push(`missing controls/static guide ${page.file}`);
}
if (manifest.count !== manifest.pages.length) errors.push('manifest count mismatch');
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(JSON.stringify({pages:manifest.pages.length, uniqueTitles:seen.title.size, uniqueH1:seen.h1.size, uniqueCanonicals:seen.canonical.size, hreflangSets:manifest.pages.length, errors:0}, null, 2));
