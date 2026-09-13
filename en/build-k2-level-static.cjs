const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const enDir = __dirname;
const rootDir = path.dirname(enDir);
const outputDir = path.join(enDir, 'print', 'early-skill-practice');
const templatePath = path.join(enDir, 'levels.html');
const manifestPath = path.join(outputDir, 'manifest.json');
const SITE = 'https://googoodan.com';
const BUILD_VERSION = '20260913-early-skill-static';

function escapeText(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function escapeAttr(value) {
  return escapeText(value).replaceAll('"', '&quot;');
}

function slug(value) {
  return String(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function loadLevelCatalog() {
  const sandbox = { console };
  sandbox.globalThis = sandbox;
  for (const relative of [
    'en/types.js',
    'ko/catalog.js',
    'ko/drill-catalog.js',
    'ko/drill-engine.js',
    'en/level-catalog.js',
    'en/level-english.js'
  ]) {
    const file = path.join(rootDir, relative);
    vm.runInNewContext(fs.readFileSync(file, 'utf8'), sandbox, { filename: file });
  }
  return sandbox;
}

const numberWords = { 1: 'One', 2: 'Two', 3: 'Three', 4: 'Four' };
const operationNames = { add: 'Addition', sub: 'Subtraction' };

function typeConfig(runtime, profile) {
  return runtime.Worksheets.types.find(type => type.id === profile.source)?.config || {};
}

/*
 * This is intentionally conservative. These are the profiles that add a real
 * format, number range, or reasoning demand that is not already available as
 * a root /en worksheet, a K-2 journal page, a Common Core arithmetic page, or
 * one of the visual K-2 activity pages.
 */
function eligible(stage, profile) {
  if (profile.group === '기초 보충' || profile.mode === 'story') return false;
  if (stage.id === 'tables') return profile.skill === 'repeat';
  if (profile.skill) return false;

  if (stage.id === 'add-10') {
    if (profile.custom === 'early') {
      if (profile.code === 'sub' && profile.max === 10) return false;
      return [5, 9, 10].includes(profile.max);
    }
    return profile.source === 'natural-sub-1-1' && profile.layout === 'vertical';
  }

  if (stage.id === 'add-20') {
    if (profile.custom === 'early') return profile.code === 'sub' && profile.max === 20;
    return profile.source === 'natural-add-1-1' && profile.layout === 'vertical';
  }

  if (stage.id === 'add-2') {
    if (profile.mode === 'blank' || profile.mode === 'digit') return true;
    if (profile.condition) return profile.layout === 'horizontal';
    return profile.mode === 'basic' && profile.layout === 'vertical';
  }

  if (stage.id === 'add-3') {
    if (profile.mode === 'blank' || profile.mode === 'digit') return true;
    if (profile.condition) return true;
    return profile.mode === 'basic' && profile.layout === 'vertical';
  }

  return false;
}

function generatedFingerprint(runtime, profile) {
  return JSON.stringify(Array.from({ length: 20 }, (_, index) =>
    runtime.DrillEngine.rows(profile, 1701 + index, 8)
  ));
}

function gradeInfo(stage, profile) {
  if (stage.id === 'add-10' && profile.custom === 'early') {
    return { grade: 'Kindergarten', gradeSlug: 'kindergarten', standard: 'K.OA.A.2; K.OA.A.5' };
  }
  if (stage.id === 'add-10' || stage.id === 'add-20') {
    return { grade: '1st grade', gradeSlug: '1st-grade', standard: '1.OA.C.6' };
  }
  if (stage.id === 'tables') {
    return { grade: '2nd grade', gradeSlug: '2nd-grade', standard: '2.OA.C.4' };
  }
  return {
    grade: '2nd grade',
    gradeSlug: '2nd-grade',
    standard: stage.id === 'add-3' ? '2.NBT.B.7' : '2.NBT.B.5'
  };
}

function arithmeticBase(runtime, profile) {
  if (profile.skill === 'repeat') return 'Repeated Addition';
  if (profile.custom === 'early') {
    return `${operationNames[profile.code]} Within ${profile.max}`;
  }
  const config = typeConfig(runtime, profile);
  const a = numberWords[config.da] || String(config.da);
  const b = numberWords[config.db] || String(config.db);
  const operation = operationNames[config.code] || profile.title;
  if (config.da === config.db) return `${a}-Digit ${operation}`;
  if (config.code === 'add') return `${a}-Digit Plus ${b}-Digit Addition`;
  return `${a}-Digit Minus ${b}-Digit Subtraction`;
}

function seoHeading(runtime, profile) {
  const base = arithmeticBase(runtime, profile);
  if (profile.mode === 'digit') return `Missing Digit ${base} Worksheets`;
  if (profile.mode === 'blank') return `Missing Number ${base} Worksheets`;
  const condition = profile.condition === 'carry'
    ? ' With Regrouping'
    : profile.condition === 'no-carry'
      ? ' Without Regrouping'
      : '';
  if (profile.layout === 'vertical') return `Vertical ${base}${condition} Worksheets`;
  if (condition) return `Horizontal ${base}${condition} Worksheets`;
  return `${base} Worksheets`;
}

function formatLabel(profile) {
  if (profile.skill === 'repeat') return 'repeated-addition models';
  if (profile.mode === 'digit') return 'missing-digit written practice';
  if (profile.mode === 'blank') return 'missing-number equations';
  if (profile.condition === 'carry') return 'regrouping practice';
  if (profile.condition === 'no-carry') return 'practice without regrouping';
  return profile.layout === 'vertical' ? 'vertical practice' : 'focused practice';
}

function description(entry) {
  const focus = entry.h1.replace(/ Worksheets$/, '').toLowerCase();
  const standards = entry.standard.replace('; ', ' and ');
  return `Free printable ${focus} worksheets for ${entry.grade}: fresh numbers, answer keys, and one-page Letter/A4 printing. Aligned with ${standards}.`;
}

function relatedActivity(stage, profile) {
  const configCode = profile.code || (profile.source.includes('sub') ? 'sub' : profile.source.includes('add') ? 'add' : '');
  if (profile.skill === 'repeat') return ['/en/equal-groups-arrays.html', 'Equal groups and arrays worksheets'];
  if (stage.id === 'add-10') return ['/en/number-bonds.html', 'Number bonds and missing parts'];
  if (stage.id === 'add-20') return [configCode === 'sub' ? '/en/number-line-subtraction.html' : '/en/number-line-addition.html', 'Number line practice'];
  if (profile.mode === 'blank' || profile.mode === 'digit') return ['/en/missing-number-equations.html', 'Visual missing number equations'];
  return ['/en/tens-and-ones.html', 'Tens and ones with base ten blocks'];
}

function resourceSection(entry, siblings) {
  const siblingLinks = siblings
    .filter(sibling => sibling.filename !== entry.filename)
    .slice(0, 5)
    .map(sibling => `<li><a href="${escapeAttr(sibling.urlPath)}">${escapeText(sibling.h1)}</a></li>`)
    .join('');
  const [activityUrl, activityLabel] = relatedActivity(entry.stage, entry.profile);
  const modelAdvice = entry.profile.layout === 'vertical'
    ? 'Ask the learner to line up each place value before calculating. The printed columns leave room to record regrouping when it is needed.'
    : entry.profile.mode === 'blank' || entry.profile.mode === 'digit'
      ? 'Have the learner read the complete equation aloud, estimate the missing value, and then use the inverse operation to check it.'
      : entry.profile.skill === 'repeat'
        ? 'Build the first few examples with counters in equal rows. Say the repeated-addition sentence aloud before writing the total.'
        : 'Let the learner model the first example with counters, a ten frame, or a quick drawing before moving to the number sentence.';
  return `<section class="seo-resource" aria-labelledby="early-skill-guide-heading">
<h2 id="early-skill-guide-heading">How to use this ${escapeText(entry.grade)} worksheet</h2>
<p><strong>${escapeText(entry.h1)}</strong> provides one clear practice goal connected to ${escapeText(entry.standard)}. It uses the existing Googoodan problem generator, so every click on <strong>New numbers</strong> creates a fresh worksheet while keeping the same number range and format. The matching answer key is made from the exact same set.</p>
<h3>Build the idea before speed</h3>
<p>${escapeText(modelAdvice)} This page uses ${escapeText(formatLabel(entry.profile))}. Work a small group of problems first, pause to explain one strategy, and finish the remaining items only when the learner is ready. Young children often learn more from one short, successful page than from a long timed session.</p>
<h3>Print the worksheet and answer key</h3>
<p>Use the Worksheet and Answer key buttons to preview either version. The print choices let families and teachers print the worksheet, the answer key, or both. Select <strong>New numbers</strong> for another version without changing the skill. The page is free to print for home, tutoring, or classroom use and is formatted to fit one page on US Letter and A4 paper.</p>
<h3>Connect symbols to a visual model</h3>
<p>For an additional picture-based activity, try <a href="${escapeAttr(activityUrl)}">${escapeText(activityLabel)}</a>. Moving between objects, drawings, and equations helps early learners see what the numbers mean instead of memorizing an isolated routine.</p>
<h3>Related early math worksheets</h3>
<ul>${siblingLinks}</ul>
<p><a href="/en/levels.html">Browse all practice levels</a> · <a href="/en/math-worksheets-for-kids.html">Math worksheets for kids</a></p>
</section>`;
}

function jsonLd(entry) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE}/#website`,
        name: 'googoodan',
        alternateName: '구구단닷컴',
        url: `${SITE}/`
      },
      {
        '@type': ['WebPage', 'LearningResource'],
        '@id': `${entry.canonical}#worksheet`,
        url: entry.canonical,
        name: entry.h1,
        description: entry.description,
        inLanguage: 'en-US',
        educationalLevel: entry.grade,
        teaches: entry.standard,
        learningResourceType: 'Printable worksheet',
        isAccessibleForFree: true,
        isPartOf: { '@id': `${SITE}/#website` }
      }
    ]
  }).replace(/</g, '\\u003c');
}

function bootstrap(entry) {
  const exact = `q.get('unit')===${JSON.stringify(entry.stage.id)}&&q.get('drill')===${JSON.stringify(entry.profile.id)}`;
  return `<script>(function(){var p=new URLSearchParams(location.search);if(!p.has('unit'))p.set('unit',${JSON.stringify(entry.stage.id)});if(!p.has('drill'))p.set('drill',${JSON.stringify(entry.profile.id)});history.replaceState(null,'',location.pathname+'?'+p.toString()+location.hash);addEventListener('DOMContentLoaded',function(){var title=${JSON.stringify(entry.title)},canonical=${JSON.stringify(entry.canonical)},heading=${JSON.stringify(entry.h1)};var keep=function(){var q=new URLSearchParams(location.search);if(!(${exact}))return;var t=document.querySelector('title'),c=document.querySelector('link[rel=canonical]'),h=document.querySelector('aside h1');if(t&&t.textContent!==title)t.textContent=title;if(c&&c.href!==canonical)c.href=canonical;if(h&&h.textContent!==heading)h.textContent=heading;};keep();var t=document.querySelector('title'),c=document.querySelector('link[rel=canonical]'),h=document.querySelector('aside h1');if(t)new MutationObserver(keep).observe(t,{childList:true});if(c)new MutationObserver(keep).observe(c,{attributes:true,attributeFilter:['href']});if(h)new MutationObserver(keep).observe(h,{childList:true,subtree:true});});})();</script>`;
}

function transformTemplate(template, entry, siblings) {
  const alternates = `<link rel="alternate" hreflang="en" href="${entry.canonical}"><link rel="alternate" hreflang="ko" href="${SITE}/ko/"><link rel="alternate" hreflang="ja" href="${SITE}/ja/"><link rel="alternate" hreflang="fr" href="${SITE}/fr/"><link rel="alternate" hreflang="de" href="${SITE}/de/"><link rel="alternate" hreflang="x-default" href="${SITE}/">`;
  const social = `<meta property="og:title" content="${escapeAttr(entry.title)}"><meta property="og:description" content="${escapeAttr(entry.description)}"><meta property="og:url" content="${entry.canonical}"><meta property="og:type" content="website">`;
  const styles = `<style>.seo-resource{max-width:1080px;margin:0 auto 36px;padding:24px;background:#fff;border:1px solid #dce7e9;border-radius:12px;line-height:1.72}.seo-resource h2,.seo-resource h3{color:#164f5b}.seo-resource li{margin:.35em 0}@media(max-width:850px){.seo-resource{margin:0 15px 24px;padding:18px}}@media print{.seo-resource{display:none!important}}</style>`;
  let html = template;
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeText(entry.title)}</title>`);
  html = html.replace(/<meta name="description" content="[^"]*">/i, `<meta name="description" content="${escapeAttr(entry.description)}">`);
  html = html.replace(/<link rel="canonical" href="[^"]*">/i, `<link rel="canonical" href="${entry.canonical}">`);
  html = html.replace(/<link rel="alternate"[^>]*>/gi, '');
  html = html.replace(/<script id="website-identity" type="application\/ld\+json">[\s\S]*?<\/script>/i, `<script id="website-identity" type="application/ld+json">${jsonLd(entry)}</script>`);
  html = html.replace('<script defer src="/en/types.js', `${bootstrap(entry)}<script defer src="/en/types.js`);
  html = html.replace('</head>', `${alternates}${social}${styles}</head>`);

  for (const name of ['level-catalog.js', 'level-english.js', 'curriculum.js', 'app.js', 'level-page.js']) {
    html = html.replaceAll(`src="${name}`, `src="/en/${name}`);
  }
  html = html.replace(/<body\s+data-type="[^"]*"\s+data-base="[^"]*">/i, `<body data-type="${escapeAttr(entry.profile.id)}" data-base="/en/" data-static-unit="${escapeAttr(entry.stage.id)}" data-static-profile="${escapeAttr(entry.profile.id)}">`);
  html = html.replace('<h1>Choose your practice</h1>', `<h1>${escapeText(entry.h1)}</h1>`);
  html = html.replace('<p>Choose a skill and print your practice.</p>', `<p>${escapeText(entry.description)}</p>`);
  html = html.replace(/<h2 id="sheet-title">[\s\S]*?<\/h2>/i, `<h2 id="sheet-title">${escapeText(entry.profile.title)}</h2>`);
  html = html.replace('<a class="language-link" href="/">Korean ↗</a>', '<a class="language-link" href="/ko/">Korean ↗</a>');
  html = html.replaceAll('href="levels.html"', 'href="/en/levels.html"');
  html = html.replaceAll('href="grades.html"', 'href="/en/grades.html"');
  html = html.replaceAll('href="about.html"', 'href="/en/about.html"');
  html = html.replaceAll('href="contact.html"', 'href="/en/contact.html"');
  html = html.replaceAll('href="privacy.html"', 'href="/en/privacy.html"');
  html = html.replaceAll('href="terms.html"', 'href="/en/terms.html"');
  html = html.replace('</body>', `${resourceSection(entry, siblings)}</body>`);
  return html;
}

function build() {
  const runtime = loadLevelCatalog();
  const candidateStages = runtime.DrillCatalog.units.filter(stage =>
    ['add-10', 'add-20', 'add-2', 'add-3', 'tables'].includes(stage.id)
  );
  const fingerprints = new Set();
  const selected = [];

  for (const stage of candidateStages) {
    for (const profile of stage.drills) {
      if (!eligible(stage, profile)) continue;
      const fingerprint = generatedFingerprint(runtime, profile);
      if (fingerprints.has(fingerprint)) continue;
      fingerprints.add(fingerprint);
      selected.push({ stage, profile });
    }
  }

  const entries = selected.map(({ stage, profile }) => {
    const info = gradeInfo(stage, profile);
    const h1 = seoHeading(runtime, profile);
    const filename = `${info.gradeSlug}-${slug(h1.replace(/ worksheets$/i, ''))}.html`;
    const urlPath = `/en/print/early-skill-practice/${filename}`;
    const canonical = SITE + urlPath;
    const title = `${h1} for ${info.grade.replace('grade', 'Grade')} | Googoodan`;
    const entry = { stage, profile, ...info, h1, filename, urlPath, canonical, title };
    entry.description = description(entry);
    return entry;
  });

  const uniqueness = [
    ['filename', entry => entry.filename],
    ['title', entry => entry.title],
    ['h1', entry => entry.h1],
    ['canonical', entry => entry.canonical]
  ];
  for (const [label, getter] of uniqueness) {
    const values = entries.map(getter);
    if (new Set(values).size !== values.length) throw new Error(`Duplicate ${label} in selected pages`);
  }
  if (entries.length !== 32) throw new Error(`Expected 32 distinct K-2 level pages, got ${entries.length}`);

  fs.mkdirSync(outputDir, { recursive: true });
  for (const oldFile of fs.readdirSync(outputDir).filter(file => file.endsWith('.html'))) {
    fs.unlinkSync(path.join(outputDir, oldFile));
  }
  const template = fs.readFileSync(templatePath, 'utf8');
  for (const entry of entries) {
    const siblings = entries.filter(other => other.stage.id === entry.stage.id);
    fs.writeFileSync(path.join(outputDir, entry.filename), transformTemplate(template, entry, siblings), 'utf8');
  }

  const manifest = {
    generatedAt: '2026-09-13',
    buildVersion: BUILD_VERSION,
    source: ['en/level-catalog.js', 'ko/drill-catalog.js', 'ko/drill-engine.js'],
    count: entries.length,
    coverage: {
      kindergarten: entries.filter(entry => entry.grade === 'Kindergarten').length,
      grade1: entries.filter(entry => entry.grade === '1st grade').length,
      grade2: entries.filter(entry => entry.grade === '2nd grade').length
    },
    excludedAsExistingOrOutOfScope: [
      'number bonds and make-ten (already covered by K-2 visual pages)',
      'horizontal base types already available at /en/<type>.html',
      'Common Core word-problem formats already materialized separately',
      'multiplication and division facts beyond Grade 2'
    ],
    pages: entries.map(entry => ({
      file: `en/print/early-skill-practice/${entry.filename}`,
      url: entry.canonical,
      stage: entry.stage.id,
      profile: entry.profile.id,
      grade: entry.grade,
      standard: entry.standard,
      title: entry.title,
      h1: entry.h1,
      description: entry.description
    }))
  };
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  process.stdout.write(`Generated ${entries.length} distinct early-skill pages: K ${manifest.coverage.kindergarten}, Grade 1 ${manifest.coverage.grade1}, Grade 2 ${manifest.coverage.grade2}.\n`);
}

build();
