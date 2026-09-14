'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const {
  GENERIC_H1,
  MATH_TITLE_SYMBOL,
  META_MAX,
  META_MIN,
  PRACTICE_PAGE_TITLES,
  REPORT_HEADERS,
  REPORT_PATH,
  REPO_ROOT,
  TITLE_MAX,
  buildRecords,
  canonicalFor,
  decodeHtml,
  extractMetadata,
  hasMetaSearchIntent,
  parseCsv,
  targetFiles,
  withoutBrand,
} = require('./en-seo-metadata.cjs');

const EXPECTED_PAGE_COUNT = 837;
const BUILD_SCRIPT = path.join(REPO_ROOT, 'build-en-seo-metadata.cjs');
const EXACT_TITLE_EXPECTATIONS = new Map([
  ['en/natural-add-2-2.html', '2 Digit Addition Worksheets – Free Printable Practice'],
  ['en/natural-add-3-2.html', '3 Digit Plus 2 Digit Addition Worksheets'],
  ['en/add-carry.html', '2 Digit Addition With Regrouping Worksheets'],
  ['en/add-two.html', '2 Digit Addition Without Regrouping Worksheets'],
  ['en/natural-sub-2-2.html', '2 Digit Subtraction Worksheets'],
  ['en/natural-mul-3-2.html', '3 Digit by 2 Digit Multiplication Worksheets'],
  ['en/natural-div-4-1.html', '4 Digit by 1 Digit Division Worksheets'],
  ['en/divide.html', 'Division Without Remainders Worksheets'],
  ['en/fraction-add-different.html', 'Adding Fractions With Unlike Denominators Worksheets'],
  ['en/fraction-add-same.html', 'Adding Fractions With Like Denominators Worksheets'],
  ['en/fraction-mul-proper-improper.html', 'Multiplying Proper and Improper Fractions Worksheets'],
  ['en/fraction-div-mixed-proper.html', 'Dividing Mixed Numbers by Proper Fractions Worksheets'],
  ['en/decimal-add-1.html', 'Adding Decimals to 1 Decimal Place Worksheets'],
  ['en/decimal-div-2dp-0dp.html', 'Dividing Decimals by Whole Numbers Worksheets'],
  ['en/integer-add.html', 'Adding Negative Numbers Worksheets'],
  ['en/subtract-borrow.html', '2 Digit Subtraction With Regrouping Worksheets'],
  ['en/subtract-two.html', '2 Digit Subtraction Without Regrouping Worksheets'],
  ['en/multiply-two-one.html', '2 Digit by 1 Digit Multiplication Worksheets'],
  ['en/multiply-two.html', '2 Digit Multiplication Worksheets'],
  ['en/fraction-div-improper-improper.html', 'Dividing Improper Fractions by Improper Fractions Worksheets'],
  ['en/print/common-core-arithmetic-upper/grade-5-fractionmul-word-problems.html', 'Fraction & Mixed Number Multiplication Word Problem Worksheets'],
  ['en/print/level-skills-upper/grade-4-fraction-same-adding-improper-fractions-and-proper-fractions-with-like-denominators-worksheets.html', 'Like-Denominator Improper & Proper Fraction Addition Worksheets'],
]);

function decimalOperandSpec(relative) {
  const filename = path.posix.basename(relative, '.html').toLowerCase();
  const labels = {
    0: 'Whole(?: Numbers)?',
    1: '(?:Decimals to )?Tenths',
    2: '(?:Decimals to )?Hundredths',
    'whole-number': 'Whole(?: Numbers)?',
    'whole-numbers': 'Whole(?: Numbers)?',
    tenths: 'Tenths',
    hundredths: 'Hundredths',
    thousandths: 'Thousandths',
  };
  let match = filename.match(/^decimal-(add|sub|mul|div)-(0|1|2)dp-(0|1|2)dp$/);
  if (match) {
    if (relative === 'en/decimal-div-2dp-0dp.html') return null;
    const operation = { add: 'Addition|Addend', sub: 'Subtraction|Minus|Missing Number', mul: 'Multiplication|Multiplying|Factor', div: 'Division|Dividing' }[match[1]];
    const separator = match[1] === 'add' ? 'and' : match[1] === 'sub' ? 'Minus' : 'by';
    return { left: labels[match[2]], right: labels[match[3]], operation, separator };
  }
  match = filename.match(/decimal-(addition|subtraction|multiplication)-with-(whole-numbers|tenths|hundredths|thousandths)-and-(whole-numbers|tenths|hundredths|thousandths)-worksheets/);
  if (match) {
    const operation = { addition: 'Addition|Addend', subtraction: 'Subtraction|Minus|Missing Number', multiplication: 'Multiplication|Multiplying|Factor' }[match[1]];
    const separator = match[1] === 'addition' ? 'and' : match[1] === 'subtraction' ? 'Minus' : 'by';
    return { left: labels[match[2]], right: labels[match[3]], operation, separator };
  }
  match = filename.match(/decimal-division-(whole-numbers|tenths|hundredths|thousandths)-divided-by-(whole-numbers|tenths|hundredths|thousandths)-worksheets/);
  if (match) return { left: labels[match[1]], right: labels[match[2]], operation: 'Division|Dividing', separator: 'by' };
  return null;
}

function normalized(value) {
  return decodeHtml(String(value || '')).replace(/\s+/g, ' ').trim().toLowerCase();
}

function snapshotHash(files) {
  const hash = crypto.createHash('sha256');
  for (const absolute of [...files, REPORT_PATH].sort()) {
    hash.update(path.relative(REPO_ROOT, absolute).split(path.sep).join('/'));
    hash.update('\0');
    hash.update(fs.readFileSync(absolute));
    hash.update('\0');
  }
  return hash.digest('hex');
}

function runBuilder() {
  return execFileSync(process.execPath, [BUILD_SCRIPT], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function getAttribute(tag, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = tag.match(new RegExp(`\\b${escaped}\\s*=\\s*(["'])([\\s\\S]*?)\\1`, 'i'));
  return match ? decodeHtml(match[2]) : '';
}

function findMetaContents(html, property) {
  const values = [];
  for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
    if (getAttribute(match[0], 'property').toLowerCase() === property.toLowerCase()) values.push(getAttribute(match[0], 'content'));
  }
  return values;
}

function pageSchemaType(value) {
  const types = Array.isArray(value) ? value : [value];
  return types.some((type) => /^(?:WebPage|LearningResource|CreativeWork)$/i.test(String(type || '')));
}

function pageSchemas(html, canonical, errors, relative) {
  const schemas = [];
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (getAttribute(`<script ${match[1]}>`, 'type').toLowerCase() !== 'application/ld+json') continue;
    let data;
    try {
      data = JSON.parse(match[2].trim());
    } catch (error) {
      errors.push(`${relative}: invalid JSON-LD (${error.message})`);
      continue;
    }
    function visit(node) {
      if (Array.isArray(node)) {
        node.forEach(visit);
        return;
      }
      if (!node || typeof node !== 'object') return;
      const nodeUrl = String(node.url || node['@id'] || '');
      if ((pageSchemaType(node['@type']) || nodeUrl === canonical || nodeUrl.startsWith(`${canonical}#`)) && !/^WebSite$/i.test(String(node['@type'] || ''))) {
        schemas.push(node);
      }
      Object.values(node).forEach(visit);
    }
    visit(data);
  }
  return schemas;
}

function inlineScripts(html) {
  const bodies = [];
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const tag = `<script ${match[1]}>`;
    if (getAttribute(tag, 'src')) continue;
    if (getAttribute(tag, 'type').toLowerCase() === 'application/ld+json') continue;
    bodies.push(match[2]);
  }
  return bodies.join('\n');
}

function hasAttribute(tag, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\b${escaped}\\s*=`, 'i').test(tag);
}

function checkRuntimeMetadata(html, metadata, errors, relative) {
  const body = (html.match(/<body\b[^>]*>/i) || [])[0] || '';
  const expected = {
    'data-regional-title': metadata.title,
    'data-regional-description': metadata.description,
    'data-regional-canonical': metadata.canonical,
    'data-activity-entry-title': metadata.h1,
    'data-activity-entry-description': metadata.description,
    'data-activity-entry-canonical': metadata.canonical,
    'data-hands-on-title': metadata.h1,
    'data-hands-on-description': metadata.description,
    'data-hands-on-canonical': metadata.canonical,
    'data-hv-title': metadata.h1,
    'data-hv-description': metadata.description,
    'data-hv-canonical': metadata.canonical,
  };
  for (const [name, value] of Object.entries(expected)) {
    if (hasAttribute(body, name) && getAttribute(body, name) !== value) errors.push(`${relative}: ${name} is stale`);
  }
}

function checkStructuredInline(html, metadata, errors, relative) {
  const scripts = inlineScripts(html);
  for (const match of scripts.matchAll(/\bGDCurriculumConfig\s*=\s*\{[\s\S]*?\btitle\s*:\s*(["'])([\s\S]*?)\1/gi)) {
    if (decodeHtml(match[2]) !== metadata.h1) errors.push(`${relative}: GDCurriculumConfig.title is stale`);
  }
  if (!/MutationObserver/.test(scripts)) return;
  const expected = { title: metadata.title, canonical: metadata.canonical, heading: metadata.h1 };
  for (const [name, value] of Object.entries(expected)) {
    const matcher = new RegExp(`\\bvar\\s+${name}\\s*=\\s*(["'])([\\s\\S]*?)\\1`, 'g');
    for (const match of scripts.matchAll(matcher)) {
      if (decodeHtml(match[2]) !== value) errors.push(`${relative}: MutationObserver ${name} variable is stale`);
    }
  }
  for (const match of scripts.matchAll(/document\.title\s*(?:!==|===|!=|==|=)\s*(["'])([\s\S]*?)\1/g)) {
    if (decodeHtml(match[2]) !== metadata.title) errors.push(`${relative}: MutationObserver document.title literal is stale`);
  }
}

function sitemapLocations() {
  const sitemapPath = path.join(REPO_ROOT, 'sitemap.xml');
  const sitemap = fs.readFileSync(sitemapPath, 'utf8');
  return new Set([...sitemap.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)].map((match) => decodeHtml(match[1].trim())));
}

function gitHeadTitles(errors) {
  let output = '';
  try {
    output = execFileSync('git', ['grep', '-I', '-n', '-E', '<title[^>]*>.*</title>', 'HEAD', '--', 'en'], {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      maxBuffer: 32 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (error) {
    errors.push(`Could not read Git HEAD titles: ${error.message}`);
    return new Map();
  }
  const titles = new Map();
  for (const line of output.split(/\r?\n/)) {
    const match = line.match(/^HEAD:(en\/.*?):\d+:([\s\S]*)$/);
    if (!match) continue;
    const title = match[2].match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
    if (title) titles.set(match[1], decodeHtml(title[1]).replace(/\s+/g, ' ').trim());
  }
  return titles;
}

function checkReport(records, errors) {
  if (!fs.existsSync(REPORT_PATH)) {
    errors.push('en-seo-metadata-report.csv is missing');
    return new Map();
  }
  const reportText = fs.readFileSync(REPORT_PATH, 'utf8');
  const rows = parseCsv(reportText);
  const firstLine = reportText.split(/\r?\n/, 1)[0];
  const parsedHeader = parseCsv(`${firstLine}\n`);
  const rawHeaders = [];
  let field = '';
  let quoted = false;
  for (let index = 0; index < firstLine.length; index += 1) {
    const character = firstLine[index];
    if (quoted && character === '"' && firstLine[index + 1] === '"') {
      field += '"';
      index += 1;
    } else if (character === '"') quoted = !quoted;
    else if (character === ',' && !quoted) {
      rawHeaders.push(field);
      field = '';
    } else field += character;
  }
  rawHeaders.push(field);
  if (rawHeaders.join('\0') !== REPORT_HEADERS.join('\0')) errors.push('CSV headers do not match the required report schema');
  if (parsedHeader.length) errors.push('CSV header parser sanity check failed');
  if (rows.length !== EXPECTED_PAGE_COUNT) errors.push(`CSV has ${rows.length} rows; expected ${EXPECTED_PAGE_COUNT}`);
  const byFile = new Map();
  const headTitles = gitHeadTitles(errors);
  const expectedHeadRows = records.filter((record) => headTitles.has(record.relative)).length;
  let headRows = 0;
  let headTitleMatches = 0;
  const mainKeywordOwners = new Map();
  const secondaryKeywordOwners = new Map();
  for (const row of rows) {
    if (byFile.has(row.current_file)) errors.push(`CSV duplicate row: ${row.current_file}`);
    byFile.set(row.current_file, row);
    for (const header of REPORT_HEADERS) {
      if (!row[header]) errors.push(`${row.current_file || '(unknown row)'}: CSV field ${header} is empty`);
    }
    if (headTitles.has(row.current_file)) {
      headRows += 1;
      if ([row.current_title, row.recommended_title].includes(headTitles.get(row.current_file))) headTitleMatches += 1;
      else errors.push(`${row.current_file}: Git HEAD title differs from both CSV current_title and recommended_title`);
    }
    if (!['Yes', 'No'].includes(row.step_by_step_recommended)) errors.push(`${row.current_file}: invalid step-by-step recommendation`);
    if (!['High', 'Medium', 'Low'].includes(row.seo_priority)) errors.push(`${row.current_file}: invalid SEO priority`);
    if (!row.secondary_keywords.includes(';')) errors.push(`${row.current_file}: fewer than two secondary keywords`);
    if (!/\bworksheets?\b/i.test(row.main_keyword)) errors.push(`${row.current_file}: main keyword lacks worksheet search intent`);
    if (row.main_keyword.length > 60 || row.main_keyword.trim().split(/\s+/).length > 8) {
      errors.push(`${row.current_file}: main keyword is not a concise core search phrase`);
    }
    if (/[&,]/.test(row.main_keyword)) errors.push(`${row.current_file}: main keyword contains forbidden punctuation`);
    const mainKey = normalized(row.main_keyword);
    if (mainKeywordOwners.has(mainKey)) errors.push(`${row.current_file}: duplicate main keyword also used by ${mainKeywordOwners.get(mainKey)}`);
    else mainKeywordOwners.set(mainKey, row.current_file);
    const secondaryKey = normalized(row.secondary_keywords);
    if (secondaryKeywordOwners.has(secondaryKey)) errors.push(`${row.current_file}: duplicate secondary keywords also used by ${secondaryKeywordOwners.get(secondaryKey)}`);
    else secondaryKeywordOwners.set(secondaryKey, row.current_file);
  }
  if (headRows !== expectedHeadRows) errors.push(`CSV has ${headRows} Git HEAD learning pages; repository currently tracks ${expectedHeadRows}`);
  byFile.headRows = headRows;
  byFile.headTitleMatches = headTitleMatches;
  const orderedFiles = rows.map((row) => row.current_file);
  const sortedFiles = [...orderedFiles].sort((a, b) => a.localeCompare(b, 'en'));
  if (orderedFiles.join('\0') !== sortedFiles.join('\0')) errors.push('CSV rows are not sorted by current_file');
  for (const record of records) {
    const row = byFile.get(record.relative);
    if (!row) {
      errors.push(`${record.relative}: missing CSV row`);
      continue;
    }
    if (row.recommended_title !== record.appliedTitle) errors.push(`${record.relative}: CSV recommended title differs from HTML plan`);
    if (row.recommended_h1 !== record.recommendedH1) errors.push(`${record.relative}: CSV H1 differs from HTML plan`);
    if (row.meta_description !== record.metaDescription) errors.push(`${record.relative}: CSV description differs from HTML plan`);
    if (row.main_keyword !== record.mainKeyword) errors.push(`${record.relative}: CSV main keyword differs from helper plan`);
  }
  return byFile;
}

function run() {
  const firstBuildOutput = runBuilder();
  const filesAfterFirstBuild = targetFiles();
  if (filesAfterFirstBuild.length !== EXPECTED_PAGE_COUNT) {
    throw new Error(`Expected ${EXPECTED_PAGE_COUNT} U.S. learning pages, found ${filesAfterFirstBuild.length}`);
  }
  const firstHash = snapshotHash(filesAfterFirstBuild);
  const secondBuildOutput = runBuilder();
  const secondHash = snapshotHash(targetFiles());
  const deterministic = firstHash === secondHash;

  const errors = [];
  if (!deterministic) errors.push(`builder is not deterministic (${firstHash} != ${secondHash})`);
  const records = buildRecords();
  if (records.length !== EXPECTED_PAGE_COUNT) errors.push(`helper returned ${records.length} pages; expected ${EXPECTED_PAGE_COUNT}`);
  const reportByFile = checkReport(records, errors);
  const sitemap = sitemapLocations();
  const titleOwners = new Map();
  const h1Owners = new Map();
  const metaOwners = new Map();
  const missingFromSitemap = [];
  const metaSecondSentenceShells = new Set();
  let ogPages = 0;
  let schemaPages = 0;
  let exactTitleExamplesMatched = 0;
  let practiceTitlesMatched = 0;
  let gradeOneTwoPrintTitles = 0;
  let kindergartenPrintTitles = 0;
  let regroupingMultiplicationTitles = 0;
  let longDivisionFormatTitles = 0;
  let decimalOperandTitles = 0;

  for (const record of records) {
    const html = fs.readFileSync(record.absolute, 'utf8');
    const metadata = extractMetadata(html);
    const expectedCanonical = canonicalFor(record.relative);
    const row = reportByFile.get(record.relative);

    if (!metadata.title) errors.push(`${record.relative}: missing title`);
    if (!metadata.h1) errors.push(`${record.relative}: missing visible H1`);
    if (!metadata.description) errors.push(`${record.relative}: missing meta description`);
    if (!metadata.canonical) errors.push(`${record.relative}: missing canonical`);
    if (metadata.title !== record.appliedTitle) errors.push(`${record.relative}: title differs from applied plan`);
    if (metadata.h1 !== record.recommendedH1) errors.push(`${record.relative}: H1 differs from recommendation`);
    if (metadata.description !== record.metaDescription) errors.push(`${record.relative}: meta description differs from report`);
    if (metadata.canonical !== expectedCanonical) errors.push(`${record.relative}: canonical is not self-referencing (${metadata.canonical})`);
    if (!/\bworksheets?\b/i.test(metadata.title)) errors.push(`${record.relative}: title has no Worksheet intent`);
    if (metadata.title.length > TITLE_MAX) errors.push(`${record.relative}: title length ${metadata.title.length} exceeds ${TITLE_MAX}`);
    if (MATH_TITLE_SYMBOL.test(metadata.title)) errors.push(`${record.relative}: title contains a math operator symbol`);
    if (MATH_TITLE_SYMBOL.test(metadata.h1)) errors.push(`${record.relative}: H1 contains a math operator symbol`);
    const exactTitle = EXACT_TITLE_EXPECTATIONS.get(record.relative);
    if (exactTitle) {
      if (metadata.h1 === exactTitle) exactTitleExamplesMatched += 1;
      else errors.push(`${record.relative}: expected exact H1 ${JSON.stringify(exactTitle)}, found ${JSON.stringify(metadata.h1)}`);
    }
    const practiceTitle = PRACTICE_PAGE_TITLES.get(record.relative);
    if (practiceTitle) {
      if (metadata.h1 === practiceTitle) practiceTitlesMatched += 1;
      else errors.push(`${record.relative}: practice H1 is not the approved natural title`);
    }
    if (/^en\/print\/grade-[12]-/i.test(record.relative)) {
      gradeOneTwoPrintTitles += 1;
      if (!/^(?:1st|2nd) Grade .+ Worksheets$/i.test(metadata.h1)) errors.push(`${record.relative}: Grade 1/2 print H1 has the wrong U.S. search phrase order`);
    }
    if (/^en\/print\/k-/i.test(record.relative)) {
      kindergartenPrintTitles += 1;
      if (!/^Kindergarten .+ Worksheets$/i.test(metadata.h1)) errors.push(`${record.relative}: Kindergarten print H1 has the wrong search phrase order`);
    }
    if (/^en\/grade-4-(?:one|two|three|four)-digit-by-(?:one|two|three|four)-digit-multiplication-(?:no|one|two|three|four)-regroupings?\.html$/i.test(record.relative)) {
      regroupingMultiplicationTitles += 1;
      if (!/\b(?:Without|With(?: \d+)?) Regroupings?\b/i.test(metadata.h1)) errors.push(`${record.relative}: multiplication H1 omits its regrouping qualifier`);
    }
    if (/division-(?:with|without)-remainders-worksheets-long-division-format\.html$/i.test(record.relative)) {
      longDivisionFormatTitles += 1;
      if (!/^Division (?:With|Without) Remainders: \d+ Digit by \d+ Digit Worksheets$/i.test(metadata.h1)) errors.push(`${record.relative}: long-division-format H1 is not natural or loses operand digit labels`);
    }
    const decimalSpec = decimalOperandSpec(record.relative);
    if (decimalSpec) {
      decimalOperandTitles += 1;
      const orderedOperands = new RegExp(`${decimalSpec.left}\\s+${decimalSpec.separator}\\s+${decimalSpec.right}`, 'i');
      const namedOperation = new RegExp(`\\b(?:${decimalSpec.operation})\\b`, 'i');
      if (!orderedOperands.test(metadata.h1)) errors.push(`${record.relative}: decimal operand order or place-value wording is wrong`);
      if (!namedOperation.test(metadata.h1)) errors.push(`${record.relative}: decimal H1 omits the operation name`);
      if (/\b[1-3]\s+Decimal Places?\b/i.test(metadata.h1)) errors.push(`${record.relative}: decimal operands are described as numeric precision instead of place-value units`);
    }
    for (const [field, value] of [['title', metadata.title], ['H1', metadata.h1]]) {
      if (/\b\d+\s+by\s+\d+\s+Digit Multiplication\b/i.test(value)) errors.push(`${record.relative}: ${field} omits Digit after the first multiplication operand`);
      if (/\b\d+\s+by\s+\d+\s+Digit\s+(?:Long\s+)?Division\b/i.test(value)) errors.push(`${record.relative}: ${field} omits Digit after the first division operand`);
      if (/\bLong Division,\s*Remainders?\b/i.test(value)) errors.push(`${record.relative}: ${field} uses the awkward phrase Long Division, Remainders`);
      if (/\bNo Remainders? Worksheets\b/i.test(value)) errors.push(`${record.relative}: ${field} uses No Remainder instead of Without Remainders`);
      if (/\b[1-3]-Place(?:\s+Decimals?)?\b/i.test(value)) errors.push(`${record.relative}: ${field} uses non-U.S. hyphenated decimal-place wording`);
    }
    if (GENERIC_H1.test(metadata.h1)) errors.push(`${record.relative}: generic H1 remains (${metadata.h1})`);
    if (metadata.description.length < META_MIN || metadata.description.length > META_MAX) {
      errors.push(`${record.relative}: meta description length ${metadata.description.length} is outside ${META_MIN}-${META_MAX}`);
    }
    if (!hasMetaSearchIntent(metadata.description)) {
      errors.push(`${record.relative}: meta description is missing Free, printable/print, worksheet, practice, or answer key intent`);
    }
    if (/\b(horizontal|vertical|missing number|missing digit|long division)\s+\1\b/i.test(metadata.description)) {
      errors.push(`${record.relative}: meta description repeats a format phrase`);
    }
    if (/\banswer keys? worksheets\b/i.test(metadata.description)) errors.push(`${record.relative}: meta description contains awkward answer-key worksheet order`);
    if (/\bgrade\s+([1-6])\b[\s\S]*\b(?:\1(?:st|nd|rd|th)\s+grade|grade\s+\1)\b|\b([1-6])(?:st|nd|rd|th)\s+grade\b[\s\S]*\bgrade\s+\2\b/i.test(metadata.description)) {
      errors.push(`${record.relative}: meta description repeats its grade`);
    }
    if (/\bmissing\s+(?:number|digit)\s+missing\s+(?:number|digit|addend|factor|part)\b/i.test(metadata.description)) {
      errors.push(`${record.relative}: meta description repeats missing-number intent`);
    }
    if (/\bword\s+problem\b[\s\S]*\bword\s+problems\b/i.test(metadata.description)) {
      errors.push(`${record.relative}: meta description repeats word-problem intent`);
    }
    metaSecondSentenceShells.add(normalized(metadata.description.split(/(?<=[.!?])\s+/)[1] || ''));
    for (const [field, value] of [['title', metadata.title], ['H1', metadata.h1], ['meta description', metadata.description]]) {
      if ((value.match(/\bworksheets?\b/gi) || []).length > 1) errors.push(`${record.relative}: ${field} repeats Worksheets`);
    }
    if (/\bWorksheets(?:\s+Worksheets)+\b/i.test(html)) errors.push(`${record.relative}: repeated Worksheets remains in HTML runtime metadata`);

    const titleKey = normalized(metadata.title);
    if (titleOwners.has(titleKey)) errors.push(`${record.relative}: duplicate title also used by ${titleOwners.get(titleKey)}`);
    else titleOwners.set(titleKey, record.relative);
    const h1Key = normalized(metadata.h1);
    if (h1Owners.has(h1Key)) errors.push(`${record.relative}: duplicate H1 also used by ${h1Owners.get(h1Key)}`);
    else h1Owners.set(h1Key, record.relative);
    const metaKey = normalized(metadata.description);
    if (metaOwners.has(metaKey)) errors.push(`${record.relative}: duplicate meta description also used by ${metaOwners.get(metaKey)}`);
    else metaOwners.set(metaKey, record.relative);

    checkRuntimeMetadata(html, metadata, errors, record.relative);
    checkStructuredInline(html, metadata, errors, record.relative);

    if (!sitemap.has(expectedCanonical)) missingFromSitemap.push(record.relative);

    const ogTitles = findMetaContents(html, 'og:title');
    const ogDescriptions = findMetaContents(html, 'og:description');
    if (ogTitles.length || ogDescriptions.length) ogPages += 1;
    for (const ogTitle of ogTitles) {
      if (normalized(withoutBrand(ogTitle)) !== normalized(withoutBrand(metadata.title))) errors.push(`${record.relative}: og:title is stale (${ogTitle})`);
    }
    for (const ogDescription of ogDescriptions) {
      if (ogDescription !== metadata.description) errors.push(`${record.relative}: og:description is stale`);
    }

    const schemas = pageSchemas(html, expectedCanonical, errors, record.relative);
    if (schemas.length) schemaPages += 1;
    for (const schema of schemas) {
      if (Object.prototype.hasOwnProperty.call(schema, 'name') && normalized(schema.name) !== normalized(metadata.h1)) {
        errors.push(`${record.relative}: JSON-LD name is stale (${schema.name})`);
      }
      if (Object.prototype.hasOwnProperty.call(schema, 'headline') && normalized(schema.headline) !== normalized(metadata.h1)) {
        errors.push(`${record.relative}: JSON-LD headline is stale`);
      }
      if (Object.prototype.hasOwnProperty.call(schema, 'description') && schema.description !== metadata.description) {
        errors.push(`${record.relative}: JSON-LD description is stale`);
      }
    }

    if (row && row.current_title !== row.recommended_title && inlineScripts(html).includes(row.current_title)) {
      errors.push(`${record.relative}: inline bootstrap still contains the previous full title`);
    }
  }

  if (missingFromSitemap.length) {
    errors.push(`sitemap.xml is missing ${missingFromSitemap.length} target canonicals: ${missingFromSitemap.join(', ')}`);
  }
  if (exactTitleExamplesMatched !== EXACT_TITLE_EXPECTATIONS.size) errors.push(`Only ${exactTitleExamplesMatched}/${EXACT_TITLE_EXPECTATIONS.size} exact title expectations matched`);
  if (practiceTitlesMatched !== PRACTICE_PAGE_TITLES.size || PRACTICE_PAGE_TITLES.size !== 24) errors.push(`Only ${practiceTitlesMatched}/24 practice titles matched`);
  if (gradeOneTwoPrintTitles !== 46) errors.push(`Found ${gradeOneTwoPrintTitles} Grade 1/2 print titles; expected 46`);
  if (kindergartenPrintTitles !== 54) errors.push(`Found ${kindergartenPrintTitles} Kindergarten print titles; expected 54`);
  if (regroupingMultiplicationTitles !== 7) errors.push(`Found ${regroupingMultiplicationTitles} Grade 4 regrouping multiplication titles; expected 7`);
  if (longDivisionFormatTitles !== 8) errors.push(`Found ${longDivisionFormatTitles} long-division-format titles; expected 8`);
  if (decimalOperandTitles !== 57) errors.push(`Found ${decimalOperandTitles} decimal operand titles; expected 57`);
  if (metaSecondSentenceShells.size < 12) errors.push(`Meta descriptions use only ${metaSecondSentenceShells.size} distinct second-sentence patterns`);

  const summary = {
    audited_pages: records.length,
    unique_titles: titleOwners.size,
    unique_h1: h1Owners.size,
    unique_meta_descriptions: metaOwners.size,
    unique_main_keywords: new Set([...reportByFile.values()].map((row) => normalized(row.main_keyword))).size,
    unique_secondary_keywords: new Set([...reportByFile.values()].map((row) => normalized(row.secondary_keywords))).size,
    main_keywords_with_worksheet_intent: [...reportByFile.values()].filter((row) => /\bworksheets?\b/i.test(row.main_keyword)).length,
    main_keywords_over_8_words: [...reportByFile.values()].filter((row) => row.main_keyword.trim().split(/\s+/).length > 8).length,
    main_keywords_with_forbidden_punctuation: [...reportByFile.values()].filter((row) => /[&,]/.test(row.main_keyword)).length,
    git_head_current_titles_checked: reportByFile.headRows || 0,
    git_head_current_titles_matching: reportByFile.headTitleMatches || 0,
    missing_first_digit_multiplication_titles: records.filter((record) => /\b\d+\s+by\s+\d+\s+Digit Multiplication\b/i.test(record.recommendedH1)).length,
    missing_first_digit_division_titles: records.filter((record) => /\b\d+\s+by\s+\d+\s+Digit\s+(?:Long\s+)?Division\b/i.test(record.recommendedH1)).length,
    no_remainder_titles: records.filter((record) => /\bNo Remainders? Worksheets\b/i.test(record.recommendedH1)).length,
    hyphenated_decimal_place_titles: records.filter((record) => /\b[1-3]-Place(?:\s+Decimals?)?\b/i.test(record.recommendedH1)).length,
    meta_quality_phrase_errors: records.filter((record) => /\b(horizontal|vertical|missing number|missing digit|long division)\s+\1\b/i.test(record.metaDescription) || /\banswer keys? worksheets\b/i.test(record.metaDescription)).length,
    exact_title_examples_matched: exactTitleExamplesMatched,
    practice_titles_matched: practiceTitlesMatched,
    grade_1_2_print_titles_checked: gradeOneTwoPrintTitles,
    kindergarten_print_titles_checked: kindergartenPrintTitles,
    regrouping_multiplication_titles_checked: regroupingMultiplicationTitles,
    long_division_format_titles_checked: longDivisionFormatTitles,
    decimal_operand_titles_checked: decimalOperandTitles,
    meta_grade_repetition: records.filter((record) => /\bgrade\s+([1-6])\b[\s\S]*\b(?:\1(?:st|nd|rd|th)\s+grade|grade\s+\1)\b|\b([1-6])(?:st|nd|rd|th)\s+grade\b[\s\S]*\bgrade\s+\2\b/i.test(record.metaDescription)).length,
    meta_missing_number_repetition: records.filter((record) => /\bmissing\s+(?:number|digit)\s+missing\s+(?:number|digit|addend|factor|part)\b/i.test(record.metaDescription)).length,
    meta_word_problem_repetition: records.filter((record) => /\bword\s+problem\b[\s\S]*\bword\s+problems\b/i.test(record.metaDescription)).length,
    distinct_meta_second_sentence_shells: metaSecondSentenceShells.size,
    missing_title: records.filter((record) => !extractMetadata(fs.readFileSync(record.absolute, 'utf8')).title).length,
    missing_h1: records.filter((record) => !extractMetadata(fs.readFileSync(record.absolute, 'utf8')).h1).length,
    missing_meta: records.filter((record) => !extractMetadata(fs.readFileSync(record.absolute, 'utf8')).description).length,
    missing_canonical: records.filter((record) => !extractMetadata(fs.readFileSync(record.absolute, 'utf8')).canonical).length,
    title_operator_symbols: records.filter((record) => MATH_TITLE_SYMBOL.test(extractMetadata(fs.readFileSync(record.absolute, 'utf8')).title)).length,
    generic_h1: records.filter((record) => GENERIC_H1.test(extractMetadata(fs.readFileSync(record.absolute, 'utf8')).h1)).length,
    meta_outside_100_165: records.filter((record) => {
      const length = extractMetadata(fs.readFileSync(record.absolute, 'utf8')).description.length;
      return length < META_MIN || length > META_MAX;
    }).length,
    meta_with_search_intent: records.filter((record) => hasMetaSearchIntent(extractMetadata(fs.readFileSync(record.absolute, 'utf8')).description)).length,
    duplicate_titles: records.length - titleOwners.size,
    self_referencing_canonicals: records.filter((record) => extractMetadata(fs.readFileSync(record.absolute, 'utf8')).canonical === canonicalFor(record.relative)).length,
    sitemap_canonicals: records.length - missingFromSitemap.length,
    sitemap_missing: missingFromSitemap,
    og_pages_checked: ogPages,
    json_ld_pages_checked: schemaPages,
    deterministic_build: deterministic,
    first_build: JSON.parse(firstBuildOutput),
    second_build: JSON.parse(secondBuildOutput),
    errors: errors.length,
  };

  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
  if (errors.length) {
    console.error(`\nSEO metadata check failed with ${errors.length} error(s):`);
    for (const error of errors.slice(0, 200)) console.error(`- ${error}`);
    if (errors.length > 200) console.error(`- ... ${errors.length - 200} more`);
    process.exitCode = 1;
  }
}

try {
  run();
} catch (error) {
  console.error(error.stack || error.message || error);
  process.exitCode = 1;
}
