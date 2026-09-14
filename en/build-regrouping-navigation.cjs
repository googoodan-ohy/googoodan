'use strict';
const fs = require('node:fs');
const path = require('node:path');

const enDir = __dirname;
const root = path.resolve(enDir, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(enDir, 'regrouping-reuse-static-manifest.json'), 'utf8'));
const VERSION = '20260914-regrouping-english';
const START = '<!-- REGROUPING-NAVIGATION:START -->';
const END = '<!-- REGROUPING-NAVIGATION:END -->';

function writeChanged(file, content) {
  const before = fs.readFileSync(file, 'utf8');
  if (before !== content) fs.writeFileSync(file, content, 'utf8');
}

function replaceOrInsertMarker(file, block, anchor) {
  let html = fs.readFileSync(file, 'utf8');
  const marker = new RegExp(START + '[\\s\\S]*?' + END, 'g');
  const matches = html.match(marker) || [];
  if (matches.length > 1) throw new Error(path.basename(file) + ': duplicate regrouping marker');
  if (matches.length === 1) html = html.replace(marker, block);
  else {
    const index = html.lastIndexOf(anchor);
    if (index < 0) throw new Error(path.basename(file) + ': missing insertion anchor ' + anchor);
    html = html.slice(0, index) + block + html.slice(index);
  }
  writeChanged(file, html);
}

function linkBlock(title, intro, pages) {
  const links = pages.map(page =>
    '<li><a href="/en/' + page.file + '">' + page.h1 + '</a><small>Grade ' + page.grade + ' · ' + page.standard + ' · exact place-value practice</small></li>'
  ).join('');
  return START + '<section id="exact-regrouping-worksheets"><h2>' + title + '</h2><p>' + intro + '</p><ul class="cards">' + links + '</ul></section>' + END;
}

const pages = manifest.pages;
if (pages.length !== 17) throw new Error('Expected 17 regrouping pages, found ' + pages.length);
const targets = [
  ['grade-2.html', 'Exact regrouping practice for Grade 2', 'Choose the exact number of regrouping steps for focused two-digit addition and subtraction practice.', page => page.grade === 2],
  ['grade-3.html', 'Exact regrouping practice for Grade 3', 'Practice three-digit addition and subtraction with a chosen number of regrouping steps.', page => page.grade === 3],
  ['grade-4.html', 'Exact regrouping multiplication for Grade 4', 'Choose two-digit or three-digit multiplication by one digit and control the exact number of regrouping steps.', page => page.grade === 4],
  ['addition-worksheets.html', 'Addition worksheets by exact regrouping steps', 'Build place-value fluency with printable addition sets that keep the regrouping condition consistent.', page => page.operation === 'addition'],
  ['subtraction-worksheets.html', 'Subtraction worksheets by exact regrouping steps', 'Choose subtraction without regrouping or with an exact number of exchanges for targeted practice.', page => page.operation === 'subtraction'],
  ['worksheets.html', 'Multiplication worksheets by exact regrouping steps', 'Practice multiplying two-digit and three-digit numbers by one digit with a controlled regrouping count.', page => page.operation === 'multiplication'],
  ['multiply-one.html', 'Multiplication worksheets by exact regrouping steps', 'Move from one-digit facts to two-digit and three-digit multiplication by one digit with a controlled regrouping count.', page => page.operation === 'multiplication']
];

for (const [name, title, intro, include] of targets) {
  const selected = pages.filter(include);
  if (!selected.length) throw new Error(name + ': no matching pages');
  replaceOrInsertMarker(path.join(enDir, name), linkBlock(title, intro, selected), '</main>');
}

const gradesFile = path.join(enDir, 'grades.html');
const navigationScript = '<script defer src="/en/banks/regrouping-navigation.js?v=' + VERSION + '"></script>';
let grades = fs.readFileSync(gradesFile, 'utf8');
grades = grades.replace(/<script defer src="\/en\/banks\/regrouping-navigation\.js\?v=[^"]+"><\/script>/g, '');
const gradesEnd = grades.lastIndexOf('</body>');
if (gradesEnd < 0) throw new Error('grades.html: missing body end');
grades = grades.slice(0, gradesEnd) + navigationScript + grades.slice(gradesEnd);
writeChanged(gradesFile, grades);

const indexFile = path.join(enDir, 'index.html');
const menuStart = '<!-- REGROUPING-MENU-ASSETS:START -->';
const menuEnd = '<!-- REGROUPING-MENU-ASSETS:END -->';
const menuAssets = menuStart +
  '<link rel="stylesheet" href="/en/banks/regrouping-reuse.css?v=' + VERSION + '">' +
  '<script defer src="/ko/catalog.js?v=20260913-answer-space-fix"></script>' +
  '<script defer src="/ko/engine.js?v=20260913-unit-topic-titles"></script>' +
  '<script defer src="/ko/art/catalog.js?v=20260910"></script>' +
  '<script defer src="/ko/art.js?v=20260910"></script>' +
  '<script defer src="/ko/banks/arithmetic-targets.js?v=20260910"></script>' +
  '<script defer src="/en/banks/regrouping-reuse.js?v=' + VERSION + '"></script>' + menuEnd;
let index = fs.readFileSync(indexFile, 'utf8');
const menuMarker = new RegExp(menuStart + '[\\s\\S]*?' + menuEnd, 'g');
const menuMatches = index.match(menuMarker) || [];
if (menuMatches.length > 1) throw new Error('index.html: duplicate regrouping menu marker');
if (menuMatches.length === 1) index = index.replace(menuMarker, menuAssets);
else {
  const anchor = '<script defer src="/en/regional-english.js';
  const insertAt = index.indexOf(anchor);
  if (insertAt < 0) throw new Error('index.html: missing regional English script anchor');
  index = index.slice(0, insertAt) + menuAssets + index.slice(insertAt);
}
writeChanged(indexFile, index);

const sitemapFile = path.join(root, 'sitemap.xml');
const sitemapStart = '<!-- REGROUPING-NAVIGATION:START -->';
const sitemapEnd = '<!-- REGROUPING-NAVIGATION:END -->';
const sitemapBlock = sitemapStart + '\n' + pages.map(page =>
  '<url><loc>' + page.canonical + '</loc><lastmod>2026-09-14</lastmod></url>'
).join('\n') + '\n' + sitemapEnd + '\n';
let sitemap = fs.readFileSync(sitemapFile, 'utf8');
const sitemapMarker = new RegExp(sitemapStart + '[\\s\\S]*?' + sitemapEnd + '\\r?\\n?', 'g');
const sitemapMatches = sitemap.match(sitemapMarker) || [];
if (sitemapMatches.length > 1) throw new Error('sitemap.xml: duplicate regrouping marker');
if (sitemapMatches.length === 1) sitemap = sitemap.replace(sitemapMarker, sitemapBlock);
else {
  const end = sitemap.lastIndexOf('</urlset>');
  if (end < 0) throw new Error('sitemap.xml: missing urlset end');
  sitemap = sitemap.slice(0, end) + sitemapBlock + sitemap.slice(end);
}
writeChanged(sitemapFile, sitemap);

process.stdout.write('Integrated 17 exact-regrouping worksheets into grade, operation, menu, and sitemap navigation.\n');
