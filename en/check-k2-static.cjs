const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const enDir = __dirname;
const deployDir = path.resolve(enDir, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(enDir, 'k2-static-manifest.json'), 'utf8'));
const decode = value => String(value)
  .replaceAll('&amp;', '&')
  .replaceAll('&quot;', '"')
  .replaceAll('&#39;', "'")
  .replaceAll('&lt;', '<')
  .replaceAll('&gt;', '>');
const pick = (html, re, label, url) => {
  const match = html.match(re);
  assert(match, `${url}: missing ${label}`);
  return decode(match[1]);
};

assert.deepEqual(manifest.counts, { kindergarten: 54, grade1: 20, grade2: 26, total: 100 });
assert.equal(manifest.pages.length, 100);
const pageFiles = fs.readdirSync(path.join(enDir, 'print')).filter(file => file.endsWith('.html'));
assert.equal(pageFiles.length, 100, 'en/print must contain exactly the generated 100 HTML pages');

const values = { url: [], title: [], h1: [], description: [], canonical: [] };
let minWords = Infinity;
let maxWords = 0;
for (const page of manifest.pages) {
  const file = path.join(deployDir, ...page.url.split('/').filter(Boolean));
  assert(fs.existsSync(file), `${page.url}: file missing`);
  const html = fs.readFileSync(file, 'utf8');
  assert.match(html, /^<!doctype html><html lang="en">/);
  const title = pick(html, /<title>([^<]+)<\/title>/, 'title', page.url);
  const description = pick(html, /<meta name="description" content="([^"]+)">/, 'description', page.url);
  const canonical = pick(html, /<link rel="canonical" href="([^"]+)">/, 'canonical', page.url);
  const h1 = pick(html, /<h1 class="entry-title">([^<]+)<\/h1>/, 'H1', page.url);
  assert.equal(title, page.title, `${page.url}: title mismatch`);
  assert.equal(description, page.description, `${page.url}: description mismatch`);
  assert.equal(h1, page.h1, `${page.url}: H1 mismatch`);
  assert.equal(canonical, `https://googoodan.com${page.url}`, `${page.url}: canonical mismatch`);
  assert.match(html, /<meta name="robots" content="index,follow">/);
  for (const language of ['en', 'ko', 'ja', 'fr', 'de', 'x-default']) {
    const count = (html.match(new RegExp(`hreflang="${language}"`, 'g')) || []).length;
    assert.equal(count, 1, `${page.url}: expected one ${language} hreflang, got ${count}`);
  }
  const jsonBlocks = [...html.matchAll(/<script(?: id="website-identity")? type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  assert.equal(jsonBlocks.length, 2, `${page.url}: JSON-LD block count`);
  for (const block of jsonBlocks) JSON.parse(block[1]);
  assert.match(html, /<section class="k2-resource"/);
  assert.match(html, /matching answer key/i);
  assert.match(html, /US Letter and A4/i);
  assert.match(html, /<button id="worksheet"/);
  assert.match(html, /<button id="answer"/);
  assert.match(html, /<button id="new"/);
  assert.match(html, /<button id="print"/);
  if (page.kind === 'kindergarten') {
    assert(html.includes(`p.set('unit',${JSON.stringify(page.unit)})`), `${page.url}: K unit bootstrap mismatch`);
    assert(html.includes(`p.set('sheet',${JSON.stringify(page.profile)})`), `${page.url}: K profile bootstrap mismatch`);
    assert.match(html, /\/en\/adventure\.js\?v=/);
  } else {
    assert(html.includes(`p.set('grade',${JSON.stringify(String(page.grade))})`), `${page.url}: grade bootstrap mismatch`);
    assert(html.includes(`p.set('unit',${JSON.stringify(page.unit)})`), `${page.url}: grade unit bootstrap mismatch`);
    assert.match(html, /\/en\/grades\.js\?v=/);
  }
  const resource = html.match(/<section class="k2-resource"[\s\S]*?<\/section>/)[0];
  const words = (resource.replace(/<[^>]+>/g, ' ').match(/[A-Za-z0-9][A-Za-z0-9'’-]*/g) || []).length;
  minWords = Math.min(minWords, words);
  maxWords = Math.max(maxWords, words);
  assert(words >= 170, `${page.url}: static guide too short (${words} words)`);
  values.url.push(page.url);
  values.title.push(title);
  values.h1.push(h1);
  values.description.push(description);
  values.canonical.push(canonical);
}
for (const [key, list] of Object.entries(values)) assert.equal(new Set(list).size, 100, `${key} values must be unique`);
assert(Math.max(...values.title.map(value => value.length)) <= 65, 'titles must be 65 characters or shorter');
assert(Math.max(...values.description.map(value => value.length)) <= 160, 'descriptions must be 160 characters or shorter');
console.log(`100 K–2 static pages passed: unique URL/title/H1/description/canonical, valid JSON-LD, 6 hreflangs each, ${minWords}–${maxWords} static guide words.`);
