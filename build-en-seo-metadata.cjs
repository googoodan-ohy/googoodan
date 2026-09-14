'use strict';

const fs = require('fs');
const {
  GENERIC_H1,
  MATH_TITLE_SYMBOL,
  META_MAX,
  META_MIN,
  REPORT_PATH,
  TITLE_MAX,
  applyMetadata,
  buildRecords,
  extractMetadata,
  reportRows,
  serializeCsv,
} = require('./en-seo-metadata.cjs');

const EXPECTED_PAGE_COUNT = 837;
const DRY_RUN = process.argv.includes('--dry-run');

function normalized(value) {
  return String(value || '').replace(/\s+/g, ' ').trim().toLowerCase();
}

function coreMetadataChanged(record) {
  return record.before.title !== record.appliedTitle
    || record.before.h1 !== record.recommendedH1
    || record.before.description !== record.metaDescription
    || record.before.canonical !== record.canonical
    || (record.before.ogDescription && record.before.ogDescription !== record.metaDescription);
}

function validatePrepared(record, html) {
  const metadata = extractMetadata(html);
  const errors = [];
  if (metadata.title !== record.appliedTitle) errors.push(`title is ${JSON.stringify(metadata.title)}`);
  if (metadata.h1 !== record.recommendedH1) errors.push(`H1 is ${JSON.stringify(metadata.h1)}`);
  if (metadata.description !== record.metaDescription) errors.push('meta description did not synchronize');
  if (metadata.canonical !== record.canonical) errors.push(`canonical is ${JSON.stringify(metadata.canonical)}`);
  if (MATH_TITLE_SYMBOL.test(metadata.title)) errors.push('title still contains +, \u2212, \u00d7, or \u00f7');
  if (!/\bworksheets?\b/i.test(metadata.title)) errors.push('title has no Worksheet intent');
  if (metadata.title.length > TITLE_MAX) errors.push(`title length is ${metadata.title.length}`);
  if (/\b\d+\s+by\s+\d+\s+Digit Multiplication\b/i.test(metadata.title)) errors.push('multiplication title omits Digit after the first operand');
  if (/\b\d+\s+by\s+\d+\s+Digit\s+(?:Long\s+)?Division\b/i.test(metadata.title)) errors.push('division title omits Digit after the first operand');
  if (/\bNo Remainders? Worksheets\b/i.test(metadata.title)) errors.push('title uses No Remainder instead of Without Remainders');
  if (/\b[1-3]-Place(?:\s+Decimals?)?\b/i.test(metadata.title)) errors.push('title uses non-U.S. hyphenated decimal-place wording');
  if (!metadata.h1 || GENERIC_H1.test(metadata.h1)) errors.push('H1 is missing or generic');
  if (metadata.description.length < META_MIN || metadata.description.length > META_MAX) {
    errors.push(`meta description length is ${metadata.description.length}`);
  }
  for (const [field, value] of [['title', metadata.title], ['H1', metadata.h1], ['meta description', metadata.description]]) {
    if ((value.match(/\bworksheets?\b/gi) || []).length > 1) errors.push(`${field} repeats Worksheets`);
  }
  if (errors.length) throw new Error(`${record.relative}: ${errors.join('; ')}`);
}

function run() {
  const records = buildRecords();
  if (records.length !== EXPECTED_PAGE_COUNT) {
    throw new Error(`Expected ${EXPECTED_PAGE_COUNT} U.S. learning pages, found ${records.length}. Review the shared scope filter before writing.`);
  }

  const owners = {
    title: new Map(),
    h1: new Map(),
    meta: new Map(),
    mainKeyword: new Map(),
    secondaryKeywords: new Map(),
  };
  for (const record of records) {
    const values = {
      title: record.appliedTitle,
      h1: record.recommendedH1,
      meta: record.metaDescription,
      mainKeyword: record.mainKeyword,
      secondaryKeywords: record.secondaryKeywords,
    };
    for (const [field, value] of Object.entries(values)) {
      const key = normalized(value);
      if (owners[field].has(key)) throw new Error(`Duplicate prepared ${field}: ${value} (${owners[field].get(key)}, ${record.relative})`);
      owners[field].set(key, record.relative);
    }
    if (!/\bworksheets?\b/i.test(record.mainKeyword)
      || record.mainKeyword.length > 60
      || record.mainKeyword.trim().split(/\s+/).length > 8
      || /[&,]/.test(record.mainKeyword)) {
      throw new Error(`${record.relative}: primary keyword is not concise worksheet search intent`);
    }
    if (record.before.canonical !== record.canonical && record.relative !== 'en/grades.html') {
      throw new Error(`${record.relative}: canonical mutation is outside the allowed grades.html repair`);
    }
    record.changed = coreMetadataChanged(record);
    record.outputHtml = applyMetadata(record.html, record.before, record);
    validatePrepared(record, record.outputHtml);
  }

  let written = 0;
  let wouldWrite = 0;
  for (const record of records) {
    if (record.outputHtml === record.html) continue;
    wouldWrite += 1;
    if (!DRY_RUN) {
      fs.writeFileSync(record.absolute, record.outputHtml, 'utf8');
      written += 1;
    }
  }

  const report = serializeCsv(reportRows(records));
  const previousReport = fs.existsSync(REPORT_PATH) ? fs.readFileSync(REPORT_PATH, 'utf8') : '';
  if (!DRY_RUN && report !== previousReport) fs.writeFileSync(REPORT_PATH, report, 'utf8');

  const summary = {
    audited_pages: records.length,
    dry_run: DRY_RUN,
    would_change_html_files: wouldWrite,
    changed_html_files: written,
    title_changes: records.filter((record) => record.before.title !== record.appliedTitle).length,
    h1_changes: records.filter((record) => record.before.h1 !== record.recommendedH1).length,
    description_changes: records.filter((record) => record.before.description !== record.metaDescription).length,
    canonical_changes: records.filter((record) => record.before.canonical !== record.canonical).length,
    step_by_step_yes: records.filter((record) => record.stepByStep).length,
    priorities: {
      high: records.filter((record) => record.priority === 'High').length,
      medium: records.filter((record) => record.priority === 'Medium').length,
      low: records.filter((record) => record.priority === 'Low').length,
    },
    report: 'en-seo-metadata-report.csv',
  };
  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
}

try {
  run();
} catch (error) {
  console.error(error.stack || error.message || error);
  process.exitCode = 1;
}
