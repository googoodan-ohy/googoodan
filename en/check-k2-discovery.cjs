const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const en = __dirname;
const manifests = [
  JSON.parse(fs.readFileSync(path.join(en, 'k2-static-manifest.json'), 'utf8')).pages.map((page) => ({ url: `https://googoodan.com${page.url}`, title: page.title })),
  JSON.parse(fs.readFileSync(path.join(en, 'k2-activity-manifest.json'), 'utf8')).pages.map((page) => ({ url: `https://googoodan.com/en/${page.id}.html`, title: page.title })),
  JSON.parse(fs.readFileSync(path.join(en, 'print', 'common-core-arithmetic', 'manifest.json'), 'utf8')).pages.map((page) => ({ url: page.url, title: page.title })),
  JSON.parse(fs.readFileSync(path.join(en, 'print', 'early-skill-practice', 'manifest.json'), 'utf8')).pages.map((page) => ({ url: page.url, title: page.title })),
  JSON.parse(fs.readFileSync(path.join(en, 'existing-activity-static-manifest.json'), 'utf8')).pages.map((page) => ({ url: page.canonical, title: page.title })),
  JSON.parse(fs.readFileSync(path.join(en, 'grade3-5-static-manifest.json'), 'utf8')).pages.map((page) => ({ url: `https://googoodan.com${page.url}`, title: page.title })),
  JSON.parse(fs.readFileSync(path.join(en, 'print', 'common-core-arithmetic-upper', 'manifest.json'), 'utf8')).pages.map((page) => ({ url: page.url, title: page.title })),
  JSON.parse(fs.readFileSync(path.join(en, 'print', 'level-skills-upper', 'manifest.json'), 'utf8')).pages.map((page) => ({ url: page.url, title: page.title })),
  JSON.parse(fs.readFileSync(path.join(en, 'k2-activity-method-static-manifest.json'), 'utf8')).pages.map((page) => ({ url: page.canonical, title: page.title })),
  JSON.parse(fs.readFileSync(path.join(en, 'high-value-activity-pages-manifest.json'), 'utf8')).pages.map((page) => ({ url: page.canonical, title: page.title }))
];
const pages = manifests.flat();
const errors = [];
const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');

const fileForUrl = (url) => {
  const pathname = new URL(url).pathname;
  return path.join(root, ...pathname.split('/').filter(Boolean));
};

for (const page of pages) {
  const file = fileForUrl(page.url);
  if (!fs.existsSync(file)) {
    errors.push(`missing file: ${page.url}`);
    continue;
  }
  const source = fs.readFileSync(file, 'utf8');
  if (!/<title>[^<]+<\/title>/.test(source)) errors.push(`missing title: ${page.url}`);
  if (!/<h1(?:\s[^>]*)?>[^<]+<\/h1>/.test(source)) errors.push(`missing h1: ${page.url}`);
  if (!/<meta\s+name="description"\s+content="[^"]+"/.test(source)) errors.push(`missing description: ${page.url}`);
  if (!source.includes(`<link rel="canonical" href="${page.url}">`)) errors.push(`canonical mismatch: ${page.url}`);
  const sitemapCount = sitemap.split(`<loc>${page.url}</loc>`).length - 1;
  if (sitemapCount !== 1) errors.push(`sitemap count ${sitemapCount}: ${page.url}`);
}

const hubUrl = 'https://googoodan.com/en/early-math-activities.html';
if ((sitemap.split(`<loc>${hubUrl}</loc>`).length - 1) !== 1) errors.push('activity hub sitemap count is not 1');

for (const fileName of ['index.html', 'worksheets.html', 'kindergarten.html', 'grade-1.html', 'grade-2.html', 'grade-3.html', 'grade-4.html', 'grade-5.html', 'grade-6.html']) {
  const source = fs.readFileSync(path.join(en, fileName), 'utf8');
  const starts = source.split('<!-- K2-DISCOVERY:START -->').length - 1;
  const ends = source.split('<!-- K2-DISCOVERY:END -->').length - 1;
  if (starts !== 1 || ends !== 1) errors.push(`${fileName}: discovery marker ${starts}/${ends}`);
}

const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
if (new Set(sitemapUrls).size !== sitemapUrls.length) errors.push(`sitemap has ${sitemapUrls.length - new Set(sitemapUrls).size} duplicate URLs`);

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(JSON.stringify({
  discoveredPages: pages.length,
  sitemapUrls: sitemapUrls.length,
  hubs: 9,
  activityHub: 1,
  errors: 0
}, null, 2));
