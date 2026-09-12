// Audit full page titles across drills, unit types and assessments in each unit.
// Run from any directory: node scripts/check-ko-print-title-duplicates.cjs
const fs = require('fs');
const path = require('path');

const printDir = path.resolve(__dirname, '../ko/print');
const namedEntities = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', middot: '·' };
function normalizeTitle(title) {
  return title.replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|nbsp|middot);/gi, (entity, value) => {
    if (!value.startsWith('#')) return namedEntities[value.toLowerCase()];
    const code = /^#x/i.test(value) ? parseInt(value.slice(2), 16) : Number(value.slice(1));
    return code > 0 && code <= 0x10ffff && !(code >= 0xd800 && code <= 0xdfff)
      ? String.fromCodePoint(code) : entity;
  }).normalize('NFC').replace(/\s+/g, ' ').trim();
}

const units = new Map();
const invalidTitles = [];
let checked = 0, skipped = 0;
for (const file of fs.readdirSync(printDir).filter(file => file.endsWith('.html')).sort()) {
  const match = file.match(/^(?:drill-(\d+-\d+-\d+)--.+|unit-(\d+-\d+-\d+)-.+|test-(\d+-\d+-\d+))\.html$/);
  if (!match) { skipped++; continue; }
  checked++;
  const unit = match[1] || match[2] || match[3];
  if (!units.has(unit)) units.set(unit, new Map());
  const html = fs.readFileSync(path.join(printDir, file), 'utf8');
  const titleMatch = html.match(/<title\b[^>]*>([\s\S]*?)<\/title\s*>/i);
  const title = titleMatch ? normalizeTitle(titleMatch[1]) : '';
  if (!title) { invalidTitles.push(file); continue; }
  const titles = units.get(unit);
  if (!titles.has(title)) titles.set(title, []);
  titles.get(title).push(file);
}

let duplicateGroups = 0, duplicatePages = 0;
for (const [unit, titles] of units) {
  for (const [title, files] of titles) {
    if (files.length < 2) continue;
    duplicateGroups++;
    duplicatePages += files.length;
    console.error(`[${unit}] ${title}\n  ${files.join(', ')}`);
  }
}
for (const file of invalidTitles) console.error(`Missing or empty title: ${file}`);
const failed = duplicateGroups > 0 || invalidTitles.length > 0 || checked === 0;
console.log(`${failed ? 'FAIL' : 'PASS'}: ${checked} pages in ${units.size} units; ${duplicateGroups} duplicate title groups (${duplicatePages} pages); ${invalidTitles.length} invalid titles; ${skipped} ungrouped HTML pages.`);
process.exitCode = failed ? 1 : 0;
