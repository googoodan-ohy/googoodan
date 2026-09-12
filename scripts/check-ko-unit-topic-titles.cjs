// Verify topic names agree in the banks, legacy metadata, static pages and links.
// Run: node scripts/check-ko-unit-topic-titles.cjs
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const context = vm.createContext({});
context.window = context;
for (const file of ['ko/catalog.js', 'ko/engine.js', 'ko/banks/core.js']) {
  vm.runInContext(read(file), context, {filename:file});
}
const mapMatch = read('ko/banks/core.js').match(/const profileNames=(\{[\s\S]*?\});/);
assert(mapMatch, 'Core topic-name map is missing');
const names = JSON.parse(mapMatch[1]);
assert.equal(Object.keys(names).length, 64, 'Expected 64 reviewed topic names');
assert.equal(new Set(Object.values(names)).size, 64, 'Topic names must be unique');
const targets = new Map();
let pages = 0, links = 0;
for (const [id, name] of Object.entries(names)) {
  assert(name && Array.from(name).length <= 14, id+' name must be 1–14 characters');
  assert.equal(context.KoCoreBank.banks[id][0].name, name, id+' core name');
  assert.equal(context.KoLegacyMath.profiles(id)[0].name, name, id+' metadata name');
  const url = '/ko/print/unit-'+id+'-0.html', html = read(url.slice(1));
  assert(!html.includes('핵심 개념과 적용'), id+' obsolete topic name');
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
  assert(title?.includes(name), id+' page title');
  assert(html.match(/<meta name="description" content="([^"]+)"/)?.[1].includes(name), id+' description');
  assert([...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)].some(m=>m[1].includes(name)), id+' static heading');
  const entry = html.match(/window\.WORKSHEET_ENTRY=(\{[^\n]*?\});/)?.[1];
  assert(entry && JSON.parse(entry).title === title, id+' entry title');
  assert.equal(html.match(/<link rel="canonical" href="([^"]+)"/)?.[1], 'https://googoodan.com'+url, id+' canonical');
  for (const match of html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) JSON.parse(match[1]);
  targets.set(url,name);
  pages++;
}
function htmlFiles(dir) {
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{
    const file=path.join(dir,entry.name);
    return entry.isDirectory()?htmlFiles(file):entry.name.endsWith('.html')?[file]:[];
  });
}
for (const file of htmlFiles(path.join(root,'ko'))) {
  const html=fs.readFileSync(file,'utf8');
  const ownUrl='https://googoodan.com/'+path.relative(root,file).replaceAll('\\','/');
  const base=new URL(html.match(/<base[^>]+href=["']([^"']+)/)?.[1]||ownUrl,ownUrl);
  for (const match of html.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/g)) {
    const name=targets.get(new URL(match[1],base).pathname);
    if (!name) continue;
    assert(!match[2].includes('핵심 개념과 적용'),file+' stale link label');
    if (match[2].includes(name)) links++;
  }
}
console.log(`PASS: ${pages} topic pages; 64 unique names within 14 characters; ${links} updated topic links; bank and metadata names agree.`);
