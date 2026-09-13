const fs = require('fs');
const path = require('path');

const root = __dirname;
const href = '/en/worksheet-controls.css?v=20260913-controls-layout';
const tag = `<link rel="stylesheet" href="${href}">`;
let scanned = 0;
let changed = 0;
let linked = 0;

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (entry.isFile() && entry.name.endsWith('.html')) update(file);
  }
}

function update(file) {
  scanned += 1;
  const before = fs.readFileSync(file, 'utf8');
  if (!/class=["'][^"']*\b(?:toolbar|tools)\b/.test(before)) return;
  linked += 1;
  let after = before;
  const existing = /<link\s+rel=["']stylesheet["']\s+href=["']\/en\/worksheet-controls\.css(?:\?v=[^"']*)?["']\s*\/?>/i;
  if (existing.test(after)) after = after.replace(existing, tag);
  else after = after.replace(/<\/head>/i, `${tag}</head>`);
  if (after !== before) {
    fs.writeFileSync(file, after);
    changed += 1;
  }
}

walk(root);
console.log(JSON.stringify({ scanned, linked, changed, href }));
