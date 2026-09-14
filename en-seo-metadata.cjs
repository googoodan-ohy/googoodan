'use strict';

const fs = require('fs');
const path = require('path');

const REPO_ROOT = __dirname;
const EN_ROOT = path.join(REPO_ROOT, 'en');
const REPORT_PATH = path.join(REPO_ROOT, 'en-seo-metadata-report.csv');
const SITE_ORIGIN = 'https://googoodan.com/';
const META_MIN = 100;
const META_MAX = 165;
const TITLE_MAX = 75;
const BRAND_SUFFIX = ' | Googoodan';
const BASE_TITLE_MAX = TITLE_MAX - BRAND_SUFFIX.length;

const INFORMATIONAL_ROOT_FILES = new Set([
  'about.html',
  'contact.html',
  'help.html',
  'privacy.html',
  'regions.html',
  'terms.html',
  'updates.html',
]);

const REGION_ROOT_FILE = /^(?:australia-|canada-|england-).*\.html$/i;
const GENERIC_H1 = /^(?:find your worksheet|choose your practice)$/i;
const MATH_TITLE_SYMBOL = /[+\u2212\u00d7\u00f7]/u;
const REPORT_HEADERS = [
  'current_file',
  'current_title',
  'recommended_title',
  'main_keyword',
  'secondary_keywords',
  'recommended_h1',
  'meta_description',
  'step_by_step_recommended',
  'seo_priority',
];

const SPECIAL_PAGE_TITLES = new Map([
  ['en/add-carry.html', '2 Digit Addition With Regrouping Worksheets'],
  ['en/add-two.html', '2 Digit Addition Without Regrouping Worksheets'],
  ['en/decimal-add-1.html', 'Adding Decimals to 1 Decimal Place Worksheets'],
  ['en/decimal-add-2.html', 'Adding Decimals to 2 Decimal Places Worksheets'],
  ['en/decimal-div-1.html', 'Dividing Decimals to 1 Decimal Place Worksheets'],
  ['en/decimal-div-2.html', 'Dividing Decimals to 2 Decimal Places Worksheets'],
  ['en/decimal-div-2dp-0dp.html', 'Dividing Decimals by Whole Numbers Worksheets'],
  ['en/decimal-mul-1.html', 'Multiplying Decimals to 1 Decimal Place Worksheets'],
  ['en/decimal-mul-2.html', 'Multiplying Decimals to 2 Decimal Places Worksheets'],
  ['en/decimal-sub-1.html', 'Subtracting Decimals to 1 Decimal Place Worksheets'],
  ['en/decimal-sub-2.html', 'Subtracting Decimals to 2 Decimal Places Worksheets'],
  ['en/divide.html', 'Division Without Remainders Worksheets'],
  ['en/fraction-mul-proper-improper.html', 'Multiplying Proper and Improper Fractions Worksheets'],
  ['en/fraction-div-improper-improper.html', 'Dividing Improper Fractions by Improper Fractions Worksheets'],
  ['en/grade-1.html', '1st Grade Math Worksheets'],
  ['en/grade-2.html', '2nd Grade Math Worksheets'],
  ['en/grades.html', 'Common Core Math Worksheets by Grade'],
  ['en/hundred-multiplication.html', 'Hundred Chart Multiplication Worksheets'],
  ['en/integer-add.html', 'Adding Negative Numbers Worksheets'],
  ['en/integer-div.html', 'Dividing Negative Numbers Worksheets'],
  ['en/integer-mul.html', 'Multiplying Negative Numbers Worksheets'],
  ['en/integer-sub.html', 'Subtracting Negative Numbers Worksheets'],
  ['en/index.html', 'Free Printable Math Worksheets'],
  ['en/levels.html', 'Math Practice Worksheets by Level'],
  ['en/long-division.html', 'Long Division Worksheets'],
  ['en/natural-add-2-2.html', '2 Digit Addition Worksheets \u2013 Free Printable Practice'],
  ['en/natural-div-4-1.html', '4 Digit by 1 Digit Division Worksheets'],
  ['en/natural-mul-3-2.html', '3 Digit by 2 Digit Multiplication Worksheets'],
  ['en/natural-sub-2-2.html', '2 Digit Subtraction Worksheets'],
  ['en/multiply-two-one.html', '2 Digit by 1 Digit Multiplication Worksheets'],
  ['en/multiply-two.html', '2 Digit Multiplication Worksheets'],
  ['en/probability.html', 'Probability and Chance Worksheets'],
  ['en/print/common-core-arithmetic/grade-2-within1000-missing-number-practice.html', 'Add & Subtract Within 1,000 \u2013 Missing Number Worksheets'],
  ['en/print/common-core-arithmetic/grade-2-within1000-word-problems.html', 'Grade 2 Add & Subtract to 1,000 Word Problem Worksheets'],
  ['en/print/common-core-arithmetic-upper/grade-4-mul2-missing-number-practice.html', '2 Digit by 2 Digit Missing Factor Worksheets'],
  ['en/print/common-core-arithmetic-upper/grade-4-mul4-missing-number-practice.html', '4 Digit by 1 Digit Missing Factor Worksheets'],
  ['en/print/common-core-arithmetic-upper/grade-5-decimals-missing-number-practice.html', 'Missing Decimal Operations: 2 Decimal Places Worksheets'],
  ['en/print/common-core-arithmetic-upper/grade-5-decimals-prerequisite-review.html', '2 Decimal Places Operations Review Worksheets – Grade 5'],
  ['en/print/common-core-arithmetic-upper/grade-5-decimals-vertical-practice.html', 'Vertical Decimal Operations to 2 Decimal Places Worksheets'],
  ['en/print/common-core-arithmetic-upper/grade-5-decimals-word-problems.html', '2 Decimal Places Operations Word Problem Worksheets'],
  ['en/print/common-core-arithmetic-upper/grade-5-fractionmul-word-problems.html', 'Fraction & Mixed Number Multiplication Word Problem Worksheets'],
  ['en/print/level-skills-upper/grade-4-fraction-same-adding-improper-fractions-and-proper-fractions-with-like-denominators-worksheets.html', 'Like-Denominator Improper & Proper Fraction Addition Worksheets'],
  ['en/print/level-skills-upper/grade-6-fraction-div-whole-missing-number-dividing-proper-fractions-and-whole-numbers-worksheets.html', 'Missing Number: Proper Fraction by Whole Number Worksheets'],
  ['en/print/level-skills-upper/grade-5-decimal-mul-vertical-decimal-multiplication-with-tenths-and-hundredths-worksheets.html', 'Vertical Decimal Multiplication: Tenths by Hundredths Worksheets'],
  ['en/practice/div-facts.html', 'Division Fact Practice Worksheets'],
  ['en/practice/factors.html', 'Factors and Multiples Practice Worksheets'],
  ['en/practice/tables.html', 'Multiplication Fact Practice Worksheets'],
  ['en/transformations.html', 'Geometry Transformations Worksheets'],
  ['en/subtract-borrow.html', '2 Digit Subtraction With Regrouping Worksheets'],
  ['en/subtract-two.html', '2 Digit Subtraction Without Regrouping Worksheets'],
  ['en/us-arithmetic.html', 'Common Core Arithmetic Worksheets'],
  ['en/worksheets.html', 'Math Worksheets With Answer Keys'],
]);

const PRACTICE_PAGE_TITLES = new Map([
  ['en/practice/add-10.html', 'Addition and Subtraction Within 10 Worksheets'],
  ['en/practice/add-2.html', '2 Digit Addition and Subtraction Worksheets'],
  ['en/practice/add-20.html', 'Addition and Subtraction Within 20 Worksheets'],
  ['en/practice/add-3.html', '3 Digit Addition and Subtraction Worksheets'],
  ['en/practice/decimal-add.html', 'Decimal Addition and Subtraction Worksheets'],
  ['en/practice/decimal-div-whole.html', 'Dividing Decimals by Whole Numbers Practice Worksheets'],
  ['en/practice/decimal-div.html', 'Dividing by Decimals Worksheets'],
  ['en/practice/decimal-mul.html', 'Multiplying Decimals Worksheets'],
  ['en/practice/div-1.html', 'Division by 1 Digit Numbers Worksheets'],
  ['en/practice/div-2.html', 'Division by 2 Digit Numbers Worksheets'],
  ['en/practice/div-facts.html', 'Division Fact Practice Worksheets'],
  ['en/practice/equivalent.html', 'Simplifying Fractions and Common Denominators Worksheets'],
  ['en/practice/factors.html', 'Factors and Multiples Practice Worksheets'],
  ['en/practice/fraction-div-whole.html', 'Dividing Fractions by Whole Numbers Worksheets'],
  ['en/practice/fraction-div.html', 'Dividing by Fractions Worksheets'],
  ['en/practice/fraction-forms.html', 'Improper Fractions and Mixed Numbers Worksheets'],
  ['en/practice/fraction-mul.html', 'Multiplying Fractions Worksheets'],
  ['en/practice/fraction-same.html', 'Like Denominator Fraction Addition and Subtraction Worksheets'],
  ['en/practice/fraction-unlike.html', 'Unlike Denominator Fraction Addition and Subtraction Worksheets'],
  ['en/practice/index.html', 'Math Practice Worksheets by Skill'],
  ['en/practice/mixed.html', 'Mixed Operations Worksheets'],
  ['en/practice/mul-1.html', 'Multiplication by 1 Digit Numbers Worksheets'],
  ['en/practice/mul-2.html', 'Multiplication by 2 Digit Numbers Worksheets'],
  ['en/practice/tables.html', 'Multiplication Fact Practice Worksheets'],
]);

const SPECIAL_PRIMARY_KEYWORDS = new Map([
  ['en/print/common-core-arithmetic/grade-2-facts20-missing-number-practice.html', 'missing number addition subtraction to 20 worksheets'],
  ['en/print/common-core-arithmetic/grade-2-within1000-prerequisite-review.html', 'grade 2 addition subtraction to 1000 review worksheets'],
  ['en/print/common-core-arithmetic-upper/grade-3-tensmul-horizontal-practice.html', 'horizontal multiplying by multiples of 10 worksheets'],
  ['en/print/common-core-arithmetic-upper/grade-3-within1000-horizontal-practice.html', 'horizontal addition subtraction within 1000 worksheets'],
  ['en/print/common-core-arithmetic-upper/grade-3-within1000-missing-number-practice.html', 'missing number addition subtraction to 1000 worksheets'],
  ['en/print/common-core-arithmetic-upper/grade-3-within1000-prerequisite-review.html', 'grade 3 addition subtraction to 1000 review worksheets'],
  ['en/print/common-core-arithmetic-upper/grade-4-largeadd-horizontal-practice.html', 'horizontal multi-digit addition subtraction worksheets'],
  ['en/print/common-core-arithmetic-upper/grade-4-mul2-horizontal-practice.html', 'horizontal 2 digit multiplication worksheets'],
  ['en/print/common-core-arithmetic-upper/grade-4-mul4-horizontal-practice.html', 'horizontal 4 digit multiplication worksheets'],
  ['en/print/common-core-arithmetic-upper/grade-5-div-horizontal-practice.html', 'horizontal long division with 2 digit divisors worksheets'],
  ['en/print/common-core-arithmetic-upper/grade-5-mul-horizontal-practice.html', 'horizontal multi-digit multiplication worksheets'],
  ['en/print/common-core-arithmetic-upper/grade-5-unitdivide-horizontal-practice.html', 'horizontal unit fraction division worksheets'],
  ['en/print/common-core-arithmetic-upper/grade-5-fractionmul-word-problems.html', 'fraction mixed number multiplication word problem worksheets'],
  ['en/print/level-skills-upper/grade-4-fraction-same-adding-improper-fractions-and-proper-fractions-with-like-denominators-worksheets.html', 'improper plus proper fraction addition worksheets'],
  ['en/practice/fraction-same.html', 'like denominator fraction operations worksheets'],
  ['en/practice/fraction-unlike.html', 'unlike denominator fraction operations worksheets'],
]);

function toPosix(value) {
  return value.split(path.sep).join('/');
}

function listHtmlFiles(directory) {
  const result = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...listHtmlFiles(absolute));
    else if (entry.isFile() && entry.name.toLowerCase().endsWith('.html')) result.push(absolute);
  }
  return result;
}

function isUsLearningPage(absolute) {
  const relativeToEn = toPosix(path.relative(EN_ROOT, absolute));
  if (!relativeToEn || relativeToEn.startsWith('../')) return false;
  if (!relativeToEn.includes('/')) {
    if (INFORMATIONAL_ROOT_FILES.has(relativeToEn.toLowerCase())) return false;
    if (REGION_ROOT_FILE.test(relativeToEn)) return false;
  }
  return true;
}

function targetFiles() {
  return listHtmlFiles(EN_ROOT)
    .filter(isUsLearningPage)
    .sort((a, b) => toPosix(path.relative(REPO_ROOT, a)).localeCompare(toPosix(path.relative(REPO_ROOT, b)), 'en'));
}

function relativeFile(absolute) {
  return toPosix(path.relative(REPO_ROOT, absolute));
}

function canonicalFor(relative) {
  const encoded = relative.split('/').map(encodeURIComponent).join('/');
  const publicPath = encoded.endsWith('/index.html') ? encoded.slice(0, -'index.html'.length) : encoded;
  return new URL(publicPath, SITE_ORIGIN).href;
}

function decodeHtml(value = '') {
  return value
    .replace(/&#(\d+);/g, (_, number) => String.fromCodePoint(Number(number)))
    .replace(/&#x([0-9a-f]+);/gi, (_, number) => String.fromCodePoint(Number.parseInt(number, 16)))
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&apos;|&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function plainText(value = '') {
  return decodeHtml(value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim());
}

function getAttribute(tag, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = tag.match(new RegExp(`\\b${escaped}\\s*=\\s*(["'])([\\s\\S]*?)\\1`, 'i'));
  return match ? decodeHtml(match[2]) : '';
}

function setAttribute(tag, name, value) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const matcher = new RegExp(`(\\b${escaped}\\s*=\\s*)(["'])([\\s\\S]*?)\\2`, 'i');
  const encoded = escapeHtml(value);
  if (matcher.test(tag)) return tag.replace(matcher, (_, prefix, quote) => `${prefix}${quote}${encoded}${quote}`);
  return tag.replace(/\s*\/?\s*>$/, (ending) => ` ${name}="${encoded}"${ending}`);
}

function findElement(html, tagName) {
  const match = new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i').exec(html);
  if (!match) return null;
  return { full: match[0], inner: match[1], index: match.index, end: match.index + match[0].length };
}

function findVoidTag(html, tagName, attribute, expected) {
  const matcher = new RegExp(`<${tagName}\\b[^>]*>`, 'gi');
  for (const match of html.matchAll(matcher)) {
    if (getAttribute(match[0], attribute).toLowerCase() === expected.toLowerCase()) {
      return { full: match[0], index: match.index, end: match.index + match[0].length };
    }
  }
  return null;
}

function extractMetadata(html) {
  const titleElement = findElement(html, 'title');
  const h1Element = findElement(html, 'h1');
  const descriptionTag = findVoidTag(html, 'meta', 'name', 'description');
  const canonicalTag = findVoidTag(html, 'link', 'rel', 'canonical');
  const ogTitleTag = findVoidTag(html, 'meta', 'property', 'og:title');
  const ogDescriptionTag = findVoidTag(html, 'meta', 'property', 'og:description');
  return {
    title: titleElement ? plainText(titleElement.inner) : '',
    h1: h1Element ? plainText(h1Element.inner) : '',
    description: descriptionTag ? getAttribute(descriptionTag.full, 'content') : '',
    canonical: canonicalTag ? getAttribute(canonicalTag.full, 'href') : '',
    ogTitle: ogTitleTag ? getAttribute(ogTitleTag.full, 'content') : '',
    ogDescription: ogDescriptionTag ? getAttribute(ogDescriptionTag.full, 'content') : '',
  };
}

function withoutBrand(title) {
  return title.replace(/\s*\|\s*Googoodan\.?\s*$/i, '').trim();
}

function withBrand(base) {
  return `${base.trim()}${BRAND_SUFFIX}`;
}

function titleCaseWords(value) {
  return value.replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
}

function regroupingTitle(relative) {
  const filename = path.posix.basename(relative, '.html').toLowerCase();
  const words = { one: 1, two: 2, three: 3, four: 4 };
  let match = filename.match(/^grade-\d+-(one|two|three|four)-digit-(addition|subtraction)-(no|one|two|three|four)-regroupings?$/);
  if (match) {
    const digits = words[match[1]];
    const operation = titleCaseWords(match[2]);
    const qualifier = match[3] === 'no' ? 'Without Regrouping' : `With ${titleCaseWords(match[3])} Regrouping${match[3] === 'one' ? '' : 's'}`;
    return `${digits} Digit ${operation} ${qualifier} Worksheets`;
  }
  match = filename.match(/^grade-\d+-(one|two|three|four)-digit-by-(one|two|three|four)-digit-(multiplication|division)-(no|one|two|three|four)-regroupings?$/);
  if (match) {
    const leftDigits = words[match[1]];
    const rightDigits = words[match[2]];
    const operation = titleCaseWords(match[3]);
    if (operation === 'Multiplication') {
      const qualifier = match[4] === 'no' ? 'Without Regrouping' : `With ${words[match[4]]} Regrouping${match[4] === 'one' ? '' : 's'}`;
      return `${leftDigits} Digit by ${rightDigits} Digit ${operation} ${qualifier} Worksheet`;
    }
    const qualifier = match[4] === 'no' ? 'Without Regrouping' : `With ${titleCaseWords(match[4])} Regrouping${match[4] === 'one' ? '' : 's'}`;
    return `${leftDigits} Digit by ${rightDigits} Digit ${operation} ${qualifier} Worksheets`;
  }
  return '';
}

function decimalOperationTitle(relative) {
  const filename = path.posix.basename(relative, '.html').toLowerCase();
  const match = filename.match(/^decimal-(add|sub|mul|div)-(0|1|2)dp-(0|1|2)dp$/);
  if (!match) return '';
  const precision = { 0: 'Whole Numbers', 1: 'Tenths', 2: 'Hundredths' };
  const decimalOperand = { 0: 'Whole Numbers', 1: 'Decimals to Tenths', 2: 'Decimals to Hundredths' };
  const left = precision[match[2]];
  const right = precision[match[3]];
  if (match[1] === 'add') return `Decimal Addition: ${left} and ${right} Worksheets`;
  if (match[1] === 'sub') return `Decimal Subtraction: ${left} Minus ${right} Worksheets`;
  if (match[1] === 'mul') {
    if (match[2] === '0' || match[3] === '0') return `Multiplying ${decimalOperand[match[2]]} by ${decimalOperand[match[3]]} Worksheets`;
    return `Decimal Multiplication: ${left} by ${right} Worksheets`;
  }
  return `Decimal Division: ${left} by ${right} Worksheets`;
}

function naturalOperationTitle(relative) {
  const filename = path.posix.basename(relative, '.html').toLowerCase();
  const match = filename.match(/^natural-(add|sub|mul|div)-(\d+)-(\d+)$/);
  if (!match) return '';
  const left = Number(match[2]);
  const right = Number(match[3]);
  if (match[1] === 'add') return left === right
    ? `${left} Digit Addition Worksheets`
    : `${left} Digit Plus ${right} Digit Addition Worksheets`;
  if (match[1] === 'sub') return left === right
    ? `${left} Digit Subtraction Worksheets`
    : `${left} Digit Minus ${right} Digit Subtraction Worksheets`;
  if (match[1] === 'mul') {
    if (left === 1 && right === 1) return '';
    return `${left} Digit by ${right} Digit Multiplication Worksheets`;
  }
  if (left === 1 && right === 1) return '';
  return `${left} Digit by ${right} Digit Division Worksheets`;
}

function elementaryPrintTitle(relative, currentTitle) {
  const filename = path.posix.basename(relative, '.html');
  let topic = withoutBrand(currentTitle);
  const gradeMatch = relative.match(/^en\/print\/grade-([12])-[^/]+\.html$/i);
  if (gradeMatch) {
    const ordinal = gradeMatch[1] === '1' ? '1st' : '2nd';
    topic = topic
      .replace(new RegExp(`^${ordinal} Grade\\s+`, 'i'), '')
      .replace(new RegExp(`\\s+${ordinal} Grade Worksheets$`, 'i'), '')
      .replace(/\s+Worksheets$/i, '')
      .trim();
    return `${ordinal} Grade ${topic} Worksheets`;
  }
  if (/^en\/print\/k-[^/]+\.html$/i.test(relative)) {
    topic = topic
      .replace(/^Kindergarten\s+/i, '')
      .replace(/\s+Kindergarten Worksheets$/i, '')
      .replace(/\s+Worksheets$/i, '')
      .trim();
    return `Kindergarten ${topic} Worksheets`;
  }
  return '';
}

function fractionOperationTitle(relative) {
  const filename = path.posix.basename(relative, '.html').toLowerCase();
  const match = filename.match(/^fraction-(add|sub|mul|div)-(proper|improper|mixed|whole)-(proper|improper|mixed|whole)$/);
  if (!match) return '';
  const plural = {
    proper: 'Proper Fractions',
    improper: 'Improper Fractions',
    mixed: 'Mixed Numbers',
    whole: 'Whole Numbers',
  };
  const left = plural[match[2]];
  const right = plural[match[3]];
  const singular = {
    proper: 'Proper Fraction',
    improper: 'Improper Fraction',
    mixed: 'Mixed Number',
    whole: 'Whole Number',
  };
  const same = match[2] === match[3];
  if (match[1] === 'add') return same
    ? `Adding Two ${left} Worksheets`
    : `Adding ${left} and ${right} Worksheets`;
  if (match[1] === 'sub') return `${singular[match[2]]} Minus ${singular[match[3]]} Worksheets`;
  if (match[1] === 'mul') return same
    ? `Multiplying Two ${left} Worksheets`
    : (/^(?:proper|improper)$/.test(match[2]) && /^(?:proper|improper)$/.test(match[3])
      ? `${titleCaseWords(match[2])} and ${titleCaseWords(match[3])} Fraction Multiplication Worksheets`
      : `${singular[match[2]]} & ${singular[match[3]]} Multiplication Worksheets`);
  return `Dividing ${left} by ${right} Worksheets`;
}

function printFormat(relative) {
  const filename = path.posix.basename(relative, '.html').toLowerCase();
  if (filename.includes('missing-number')) return 'Missing Number';
  if (filename.includes('missing-digit')) return 'Missing Digit';
  if (filename.includes('long-division-format')) return 'Long Division';
  if (filename.includes('horizontal')) return 'Horizontal';
  if (filename.includes('vertical')) return 'Vertical';
  if (filename.includes('word-problem')) return 'Word Problem';
  if (filename.includes('prerequisite-review')) return 'Review';
  return '';
}

function decimalSlugShort(value) {
  return ({
    'whole-number': 'Whole Numbers',
    'whole-numbers': 'Whole Numbers',
    tenths: 'Tenths',
    hundredths: 'Hundredths',
    thousandths: 'Thousandths',
  })[value] || '';
}

function printDecimalTitle(relative) {
  if (!relative.includes('/print/')) return '';
  const filename = path.posix.basename(relative, '.html').toLowerCase();
  const format = printFormat(relative);
  let match = filename.match(/decimal-(addition|subtraction|multiplication)-with-(whole-numbers|tenths|hundredths|thousandths)(?:-and-(whole-numbers|tenths|hundredths|thousandths))?-worksheets/);
  let core = '';
  if (match) {
    const left = decimalSlugShort(match[2]);
    const right = decimalSlugShort(match[3]);
    if (!right) {
      core = `${format || 'Practice'} Decimal ${titleCaseWords(match[1])}: ${left}`;
    } else if (format === 'Missing Number' && match[1] === 'addition') {
      core = `Missing Addend: ${left} and ${right}`;
    } else if (format === 'Missing Number' && match[1] === 'subtraction') {
      core = `Missing Number: ${left} Minus ${right}`;
    } else if (format === 'Missing Number') {
      core = `Missing Factor: ${left} by ${right}`;
    } else if (match[1] === 'addition') core = `${format} Decimal Addition: ${left} and ${right}`;
    else if (match[1] === 'subtraction') core = `${format} Decimal Subtraction: ${left} Minus ${right}`;
    else core = `${format} Decimal Multiplication: ${left} by ${right}`;
  }
  match = filename.match(/decimal-division-(whole-numbers|tenths|hundredths|thousandths)-divided-by-(whole-numbers|tenths|hundredths|thousandths)-worksheets/);
  if (match) {
    const left = decimalSlugShort(match[1]);
    const right = decimalSlugShort(match[2]);
    core = format === 'Missing Number'
      ? `Missing Number Decimal Division: ${left} by ${right}`
      : `${format} Decimal Division: ${left} by ${right}`;
  }
  if (!core) return '';
  return `${core.replace(/^\s+/, '')} Worksheets`;
}

function printFractionTitle(relative) {
  if (!relative.includes('/print/')) return '';
  const filename = path.posix.basename(relative, '.html').toLowerCase();
  if (/dividing-proper-fractions-and-whole-numbers-worksheets/.test(filename)) {
    return 'Dividing Proper Fractions by Whole Numbers Worksheets';
  }
  const match = filename.match(/fraction-(?:same|unlike)-(adding|subtracting)-(proper-fractions|improper-fractions|mixed-numbers|two-mixed-numbers)-and-(proper-fractions|improper-fractions|mixed-numbers|two-mixed-numbers)-with-(like|unlike)-denominators-worksheets/);
  if (!match) return '';
  const adjective = (value) => ({
    'proper-fractions': 'Proper',
    'improper-fractions': 'Improper',
    'mixed-numbers': 'Mixed Number',
    'two-mixed-numbers': 'Mixed Number',
  })[value];
  const left = adjective(match[2]);
  const right = adjective(match[3]);
  const denominator = titleCaseWords(match[4]);
  if (match[1] === 'adding') {
    if (left === right) return `Adding ${left}s With ${denominator} Denominators Worksheets`;
    return `${left} and ${right} ${denominator}-Denominator Fraction Worksheets`;
  }
  if (left === right) return `${left} Subtraction With ${denominator} Denominators Worksheets`;
  return `${left} Minus ${right} ${denominator}-Denominator Fraction Worksheets`;
}

function divisionPrintTitle(relative) {
  const filename = path.posix.basename(relative, '.html').toLowerCase();
  const match = filename.match(/grade-\d+-div-\d+-(two|three)-digit-by-(one|two)-digit-division-(with|without)-remainders-worksheets-(horizontal-practice|long-division-format)$/);
  if (!match) return '';
  const number = { one: 1, two: 2, three: 3 };
  const left = number[match[1]];
  const right = number[match[2]];
  const remainder = match[3] === 'without' ? 'Without Remainders' : 'With Remainders';
  if (match[4] === 'horizontal-practice') return `${left} Digit by ${right} Digit Division ${remainder} Worksheets`;
  return `Division ${remainder}: ${left} Digit by ${right} Digit Worksheets`;
}

function missingFractionTitle(relative) {
  const filename = path.posix.basename(relative, '.html').toLowerCase();
  let match = filename.match(/missing-number-fraction-(addition|subtraction)-with-(like|unlike)-denominators-worksheets$/);
  if (match) return `Missing Number ${titleCaseWords(match[2])}-Denominator ${titleCaseWords(match[1])} Worksheets`;
  if (/fractionwhole-missing-number-practice$/.test(filename)) return 'Missing Factor: Fraction by Whole Number Worksheets';
  if (/fractionmul-missing-number-practice$/.test(filename)) return 'Missing Factor: Fraction and Mixed Number Worksheets';
  if (/unlike-missing-number-practice$/.test(filename)) return 'Missing-Number Unlike Fraction Add & Subtract Worksheets';
  return '';
}

function normalizeClassificationPhrases(base) {
  let value = base;
  value = value
    .replace(/\bAddition\s*[·:]\s*different denominators\b/gi, 'Adding Fractions With Unlike Denominators')
    .replace(/\bAddition\s*[·:]\s*same denominators\b/gi, 'Adding Fractions With Like Denominators')
    .replace(/\bSubtraction\s*[·:]\s*different denominators\b/gi, 'Subtracting Fractions With Unlike Denominators')
    .replace(/\bSubtraction\s*[·:]\s*same denominators\b/gi, 'Subtracting Fractions With Like Denominators')
    .replace(/\bDivision\s*[·:]\s*no remainders?\b/gi, 'Division Without Remainders')
    .replace(/\bDivision\s*[·:]\s*remainders?\b/gi, 'Division With Remainders')
    .replace(/\bdifferent denominators\b/gi, 'Unlike Denominators')
    .replace(/\bsame denominators\b/gi, 'Like Denominators')
    .replace(/\bmixed fractions?\b/gi, (text) => (/^[A-Z]/.test(text) ? 'Mixed Numbers' : 'mixed numbers'));

  value = value
    .replace(/\b(\d+)\s+digits?\s*\+\s*(\d+)\s+digits?\b/gi, '$1 Digit Plus $2 Digit Addition')
    .replace(/\b(\d+)\s+digits?\s*\u2212\s*(\d+)\s+digits?\b/giu, '$1 Digit Minus $2 Digit Subtraction')
    .replace(/\b(\d+)\s+digits?\s*\u00d7\s*(\d+)\s+digits?\b/giu, '$1 Digit by $2 Digit Multiplication')
    .replace(/\b(\d+)\s+digits?\s*\u00f7\s*(\d+)\s+digits?\b/giu, '$1 Digit by $2 Digit Division');

  value = value
    .replace(/\b(proper|improper) fraction\s*\u00d7\s*(proper|improper) fraction\b/giu, (_, left, right) => `Multiplying ${titleCaseWords(left)} and ${titleCaseWords(right)} Fractions`)
    .replace(/\b(mixed number|proper fraction|improper fraction)\s*\u00f7\s*(mixed number|proper fraction|improper fraction)\b/giu, (_, left, right) => `Dividing ${titleCaseWords(left)} by ${titleCaseWords(right)}`);

  return value
    .replace(/\bWord Problems Worksheets\b/gi, 'Word Problem Worksheets')
    .replace(/\s*\+\s*/g, ' Plus ')
    .replace(/\s*\u2212\s*/gu, ' Minus ')
    .replace(/\s*\u00d7\s*/gu, ' by ')
    .replace(/\s*\u00f7\s*/gu, ' Divided by ')
    .replace(/\s+/g, ' ')
    .trim();
}

function addWorksheetIntent(base) {
  if (/\bworksheets?\b/i.test(base)) return base;
  if (/\bword problems?\b/i.test(base)) {
    return base.replace(/\bword problems?\b/i, (text) => `${text.replace(/s$/i, '')} Worksheets`);
  }
  const separator = base.match(/\s+(?:[\u2013\u2014-]\s+(?:Grade\b|Horizontal\b|Vertical\b|Long Division\b)|for\s+(?:Grade\b|\d+(?:st|nd|rd|th)\s+Grade\b))/i);
  if (separator && separator.index > 0) {
    return `${base.slice(0, separator.index)} Worksheets${base.slice(separator.index)}`;
  }
  return `${base} Worksheets`;
}

function normalizeTitlePhrases(base) {
  let value = base
    .replace(/\b([1-3])-Place Decimal Operations\b/gi, (_, count) => `Decimal Operations to ${count} Decimal Place${count === '1' ? '' : 's'}`)
    .replace(/\b([1-3])-Place Decimals?\b/gi, (_, count) => `${count} Decimal Place${count === '1' ? '' : 's'}`)
    .replace(/\b([1-3])-Place\b/gi, (_, count) => `${count} Decimal Place${count === '1' ? '' : 's'}`)
    .replace(/\bWord Problems Worksheets\b/gi, 'Word Problem Worksheets')
    .replace(/\bNo Remainders\b/gi, 'Without Remainders')
    .replace(/\b(One|Two|Three|Four)-Digit\b/gi, (_, word) => ({ One: 1, Two: 2, Three: 3, Four: 4 }[titleCaseWords(word)] + ' Digit'))
    .replace(/\b([1-4])-Digit\b/g, '$1 Digit')
    .replace(/\bWith (One|Two|Three|Four) Regroupings?\b/gi, (_, word) => `With ${{ One: 1, Two: 2, Three: 3, Four: 4 }[titleCaseWords(word)]} Regrouping${/^one$/i.test(word) ? '' : 's'}`)
    .replace(/\bWorksheets?\s*:\s*(Horizontal|Vertical)(?: Practice)?\b/gi, 'Worksheets \u2013 $1')
    .replace(/\bWorksheets?\s*:\s*Long Division(?: Format)?\b/gi, 'Worksheets \u2013 Long Division')
    .replace(/\bWorksheets?\s+for\s+Grade\s+(\d+)\b/gi, 'Worksheets \u2013 Grade $1')
    .replace(/\bWorksheets?\s+for\s+(\d+)(?:st|nd|rd|th)\s+Grade\b/gi, 'Worksheets \u2013 Grade $1')
    .replace(/\s+-\s+(Grade\s+\d+|Horizontal|Vertical|Long Division|Missing Number)\b/gi, ' \u2013 $1')
    .replace(/\s+\u2013\s+(Horizontal|Vertical) Practice\b/gi, ' \u2013 $1')
    .replace(/^Grade\s+(\d+)\s+Review\s+for\s+(.+?)\s+Worksheets$/i, '$2 Review Worksheets \u2013 Grade $1')
    .replace(/\bHorizontal Practice\b/gi, 'Horizontal')
    .replace(/\bVertical Practice\b/gi, 'Vertical')
    .replace(/\bLong Division Format\b/gi, 'Long Division')
    .replace(/\s+/g, ' ')
    .trim();
  let worksheetSeen = false;
  value = value.replace(/\bworksheets?\b/gi, () => {
    if (worksheetSeen) return '';
    worksheetSeen = true;
    return 'Worksheets';
  });
  return value.replace(/\s+([,:;])/g, '$1').replace(/\s+/g, ' ').trim();
}

function compactTitleBase(base, relative) {
  let value = normalizeTitlePhrases(base);
  const replacements = [
    [/\b(Vertical|Horizontal) Decimal (Addition|Subtraction|Multiplication|Division):/gi, '$1 $2:'],
    [/\bMissing Number Decimal Division:/gi, 'Missing Number Division:'],
    [/\bWhole Numbers\b/gi, 'Whole'],
    [/\bAddition and Subtraction\b/gi, 'Add & Subtract'],
    [/\bAddition & Subtraction\b/gi, 'Add & Subtract'],
    [/\bAdding and Subtracting\b/gi, 'Add & Subtract'],
    [/\bAdding & Subtracting\b/gi, 'Add & Subtract'],
    [/\bMultiplication and Division\b/gi, 'Multiply & Divide'],
    [/\bMultiplying and Dividing\b/gi, 'Multiply & Divide'],
    [/\bDecimal Operations to Hundredths\b/gi, 'Decimal Operations to 2 Decimal Places'],
    [/\bMulti-Digit\b/gi, 'Multidigit'],
    [/\bMultiplication Properties and Strategies\b/gi, 'Multiplication Properties & Strategies'],
    [/\bPlace Value and Expanded Form\b/gi, 'Place Value & Expanded Form'],
    [/\bTriangles and Quadrilaterals\b/gi, 'Triangles & Quadrilaterals'],
    [/\bFraction and Mixed Number\b/gi, 'Fraction & Mixed Number'],
    [/\bVolume of Composite Rectangular Prisms\b/gi, 'Composite Rectangular Prism Volume'],
    [/\bFour Two Digit Numbers\b/gi, 'Four 2 Digit Numbers'],
    [/\bMissing Number Long Division with (\d) Digit Divisors\b/gi, 'Missing Number: $1 Digit Divisor Long Division'],
    [/\bMissing Number (\d) Digit by (\d) Digit Multiplication\b/gi, '$1 Digit by $2 Digit Missing Factor'],
    [/\bMultiplying Fractions by Whole Numbers Word Problem\b/gi, 'Fraction by Whole Number Word Problem'],
    [/\bMultiplying Fractions & Mixed Numbers Word Problem\b/gi, 'Fraction & Mixed Number Multiplication Problems'],
    [/\bAdding & Subtracting (Like|Unlike) Fractions Word Problem\b/gi, '$1-Denominator Fraction Word Problem'],
    [/\bLong Division with (\d) Digit Divisors Word Problem\b/gi, '$1 Digit Divisor Division Word Problem'],
    [/\bParentheses & Order of Operations:\s*Missing Parts\b/gi, 'Order of Operations Missing Parts'],
  ];
  for (const [pattern, replacement] of replacements) {
    if (value.length <= BASE_TITLE_MAX) break;
    value = value.replace(pattern, replacement);
  }
  if (value.length > BASE_TITLE_MAX && relative.includes('/print/')) {
    value = value.replace(/\s+\u2013\s+Grade\s+\d+\b/i, '').trim();
  }
  if (value.length > BASE_TITLE_MAX && relative.includes('/print/')) {
    value = value.replace(/\s+\u2013\s+Horizontal\b/i, '').trim();
  }
  if (value.length > BASE_TITLE_MAX && relative.includes('/print/')) {
    value = value.replace(/^Horizontal\s+/i, '').trim();
  }
  if (value.length > BASE_TITLE_MAX) value = value
    .replace(/\bSubtracting (Proper|Improper) Fractions from (Proper|Improper) Fractions\b/i, 'Subtracting $1 from $2 Fractions')
    .replace(/\bDividing (Proper|Improper) Fractions by (Proper|Improper) Fractions\b/i, '$1 by $2 Fraction Division')
    .replace(/\b(?:Adding|Multiplying) (Proper|Improper) Fractions and (Proper|Improper) Fractions\b/i, (full, left, right) => `${full.startsWith('Adding') ? 'Adding' : 'Multiplying'} ${left} and ${right} Fractions`)
    .replace(/\bTimed Times Table Practice\b/i, 'Times Table Practice')
    .replace(/\bTimed Addition Practice\b/i, 'Addition Practice');
  return normalizeTitlePhrases(value);
}

function recommendTitle(relative, currentTitle) {
  const currentBase = withoutBrand(currentTitle);
  let base = SPECIAL_PAGE_TITLES.get(relative)
    || PRACTICE_PAGE_TITLES.get(relative)
    || elementaryPrintTitle(relative, currentTitle)
    || regroupingTitle(relative)
    || naturalOperationTitle(relative)
    || decimalOperationTitle(relative)
    || fractionOperationTitle(relative)
    || printDecimalTitle(relative)
    || printFractionTitle(relative)
    || divisionPrintTitle(relative)
    || missingFractionTitle(relative)
    || currentBase;
  base = normalizeClassificationPhrases(base);
  base = addWorksheetIntent(base);
  base = compactTitleBase(base, relative);
  return withBrand(base);
}

function slugLabel(relative) {
  return titleCaseWords(path.posix.basename(relative, '.html')
    .replace(/^grade-(\d+)-/, 'Grade $1 ')
    .replace(/-worksheets?$/, '')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' '));
}

function gradeQualifier(relative) {
  const match = path.posix.basename(relative).match(/(?:^|-)grade-(\d+)(?:-|\.)/i)
    || path.posix.basename(relative).match(/^(\d+)(?:st|nd|rd|th)-grade-/i);
  return match ? `Grade ${match[1]}` : '';
}

function qualifiedTitle(base, relative) {
  const format = printFormat(relative);
  const grade = gradeQualifier(relative);
  let topic = base
    .replace(/\bworksheets?\b/gi, '')
    .replace(/\s+\u2013\s+Grade\s+\d+\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  let qualifier = format || grade || (/\/practice\//i.test(relative) ? 'Practice' : 'Skill Practice');
  let candidate = `${qualifier} ${topic} Worksheets`
    .replace(/^Grade (\d+) Adding Fractions With (Like|Unlike) Denominators Worksheets$/i, 'Grade $1 $2-Denominator Fraction Addition Worksheets')
    .replace(/^Grade (\d+) Subtracting Fractions With (Like|Unlike) Denominators Worksheets$/i, 'Grade $1 $2-Denominator Fraction Subtraction Worksheets')
    .replace(/^Missing Number Dividing Proper Fractions by Whole Numbers Worksheets$/i, 'Missing Number Fraction Division by Whole Numbers Worksheets');
  candidate = compactTitleBase(candidate, relative);
  if (candidate.length > BASE_TITLE_MAX && grade && qualifier !== grade) {
    candidate = compactTitleBase(`${format} ${topic} Worksheets`, relative);
  }
  return candidate;
}

function disambiguateTitles(records) {
  for (let round = 0; round < 4; round += 1) {
    const groups = new Map();
    for (const record of records) {
      const key = record.appliedTitle.toLowerCase();
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(record);
    }
    const duplicates = [...groups.values()].filter((group) => group.length > 1);
    if (!duplicates.length) return;
    for (const group of duplicates) {
      const keeper = group.find((record) => !record.relative.includes('/print/')) || group[0];
      for (const record of group) {
        if (record === keeper) continue;
        const base = withoutBrand(record.appliedTitle);
        let candidate = qualifiedTitle(base, record.relative);
        if (round > 0) {
          const family = record.relative.includes('/grade-skills/') ? 'Grade Skill'
            : record.relative.includes('/common-core-') ? 'Core Practice'
              : record.relative.includes('/level-skills-') ? 'Skill Practice'
                : 'Practice';
          candidate = compactTitleBase(`${family} ${candidate.replace(/\bWorksheets\b/i, '').trim()} Worksheets`, record.relative);
        }
        record.appliedTitle = withBrand(candidate);
      }
    }
  }
  throw new Error('Could not create unique natural titles after four qualification passes');
}

function recommendH1(currentH1, appliedTitle) {
  return withoutBrand(appliedTitle);
}

function gradeKeyword(relative) {
  const match = relative.match(/^en\/(kindergarten|grade-([1-6]))\.html$/i);
  if (!match) return '';
  if (match[1].toLowerCase() === 'kindergarten') return 'kindergarten math worksheets';
  const ordinal = { 1: '1st', 2: '2nd', 3: '3rd', 4: '4th', 5: '5th', 6: '6th' }[match[2]];
  return `${ordinal} grade math worksheets`;
}

function conciseTopic(h1, relative = '') {
  let topic = h1
    .replace(/\s+\u2013\s+Free Printable Practice\b/gi, '')
    .replace(/\s+[-\u2013\u2014]\s+Free Printables?(?: Practice)?\b/gi, '')
    .replace(/\bfree printables?\b/gi, '')
    .replace(/\bworksheets?\b/gi, '')
    .replace(/\s+[\u2013\u2014-]\s+Grade\s+\d+\b/gi, '')
    .replace(/\s+[\u2013\u2014-]\s+(?:Horizontal|Vertical|Long Division|Missing Number|Missing Digit)\b/gi, '')
    .replace(/^(?:Horizontal|Vertical|Missing Number|Missing Digit|Missing Addend|Missing Factor|Practice)[:\s]+/i, '')
    .replace(/\bPrerequisite Review\b/gi, '')
    .replace(/\bReview\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (/^en\/integer-(add|sub|mul|div)\.html$/i.test(relative)) {
    topic = topic.replace(/\bintegers?\b/gi, 'negative numbers');
  }
  const words = topic.split(' ');
  while ((topic.length > 60 || words.length > 8) && words.length > 3) {
    words.pop();
    topic = words.join(' ').replace(/[,:;\u2013\u2014-]+$/g, '').trim();
  }
  return topic || 'math skill';
}

function keywordFromH1(h1, relative) {
  const longDivision = path.posix.basename(relative, '.html').match(/(two|three)-digit-by-(one|two)-digit-division-(with|without)-remainders-worksheets-long-division-format$/i);
  if (longDivision) {
    const number = { one: 1, two: 2, three: 3 };
    return `${number[longDivision[1].toLowerCase()]} by ${number[longDivision[2].toLowerCase()]} long division ${longDivision[3].toLowerCase()} remainders worksheets`;
  }
  if (SPECIAL_PRIMARY_KEYWORDS.has(relative)) return compactPrimaryKeyword(SPECIAL_PRIMARY_KEYWORDS.get(relative));
  const grade = gradeKeyword(relative);
  if (grade) return compactPrimaryKeyword(grade);
  if (/^en\/(?:addition|subtraction|multiplication|division|fraction|decimal)-worksheets\.html$/i.test(relative)) {
    return compactPrimaryKeyword(`${path.posix.basename(relative, '-worksheets.html')} worksheets`);
  }
  let phrase = withoutBrand(h1)
    .replace(/\s+[-\u2013\u2014]\s+Free Printables?(?: Practice)?\b/i, '')
    .replace(/\s+/g, ' ')
    .trim();
  let match = phrase.match(/^(.+?)\s+Worksheets\s+\u2013\s+(Grade\s+\d+|Horizontal|Vertical|Long Division|Missing Number|Missing Digit)$/i);
  if (match) phrase = `${match[2]} ${match[1]} Worksheets`;
  match = phrase.match(/^(.+?)\s+\u2013\s+(Missing Number|Missing Digit)\s+Worksheets$/i);
  if (match) phrase = `${match[2]} ${match[1]} Worksheets`;
  if (!/\bworksheets?\b/i.test(phrase)) phrase = `${phrase} Worksheets`;
  return compactPrimaryKeyword(phrase);
}

function primaryWordCount(value) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

function compactPrimaryKeyword(value) {
  let phrase = value.toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/,/g, '')
    .replace(/\s*[–—:]\s*/g, ' ')
    .replace(/\badding and subtracting\b/g, 'addition and subtraction')
    .replace(/\badd and subtract\b/g, 'addition subtraction')
    .replace(/\bmultiplying and dividing\b/g, 'multiplication and division')
    .replace(/\bmultiplication and division facts\b/g, 'multiplication division facts')
    .replace(/\bparentheses and order of operations\b/g, 'order of operations')
    .replace(/\bmultiplying fractions and mixed numbers\b/g, 'fraction mixed number multiplication')
    .replace(/\bfraction and mixed number\b/g, 'fraction mixed number')
    .replace(/\b(?:addition and subtraction|addition subtraction) (like|unlike) fractions\b/g, '$1 denominator fraction operations')
    .replace(/\bfactors and multiples\b/g, 'factors multiples')
    .replace(/\bwith (\d+) regroupings?\b/g, '$1 regrouping')
    .replace(/\bwithout regrouping\b/g, 'no regrouping')
    .replace(/\bto the hour and half hour\b/g, 'hour and half-hour')
    .replace(/\bto add on a number line\b/g, 'number line addition')
    .replace(/\bto subtract on a number line\b/g, 'number line subtraction')
    .replace(/\brounding to the nearest\b/g, 'rounding to')
    .replace(/\bequal parts and fractions of shapes\b/g, 'equal parts shape fractions')
    .replace(/\bdecimal place value and expanded form\b/g, 'decimal place value expanded form')
    .replace(/\bfraction mixed number word problems?\b/g, 'fraction mixed number problems')
    .replace(/\blong division with (\d+) digit divisors\b/g, '$1 digit divisor long division')
    .replace(/\badding four (\d+) digit numbers\b/g, 'four $1 digit number addition')
    .replace(/\b(\d+) digit by (\d+) digit (multiplication|division) word problems?\b/g, '$1 by $2 digit $3 problems')
    .replace(/\bmissing (digit|number) (\d+) digit by (\d+) digit (division|multiplication)\b/g, 'missing $1 $2 by $3 digit $4')
    .replace(/\b(\d+) digit by (\d+) digit division (with|without) remainders\b/g, '$1 by $2 digit division $3 remainders')
    .replace(/\b(\d+) digit by (\d+) digit long division remainders\b/g, '$1 by $2 digit long division remainders')
    .replace(/^(vertical|horizontal) decimal (addition|subtraction|multiplication|division)\b/, '$1 $2')
    .replace(/^vertical (subtraction|multiplication) whole numbers\b/, 'vertical $1 whole')
    .replace(/^horizontal subtraction (tenths|hundredths) minus\b/, 'horizontal $1 minus')
    .replace(/^missing-value decimal division\b/, 'missing-value division')
    .replace(/^decimal subtraction whole numbers\b/, 'decimal subtraction whole')
    .replace(/^skill practice (\d+) digit by (\d+) digit (multiplication|division) worksheets$/, '$1 by $2 digit $3 practice worksheets')
    .replace(/^missing number decimal division\s+/, 'missing-value decimal division ')
    .replace(/^multiplying whole numbers by decimals to (tenths|hundredths) worksheets$/, 'whole by decimal multiplication to $1 worksheets')
    .replace(/^multiplying decimals to (tenths|hundredths) by whole numbers worksheets$/, 'decimal by whole multiplication to $1 worksheets')
    .replace(/^decimal subtraction whole numbers minus (tenths|hundredths) worksheets$/, 'whole minus $1 decimal subtraction worksheets')
    .replace(/^decimal subtraction (tenths|hundredths) minus whole numbers worksheets$/, '$1 minus whole decimal subtraction worksheets')
    .replace(/\s+/g, ' ')
    .trim();
  phrase = phrase
    .replace(/^(\d) decimal places? and (\d) decimal places? addition worksheets$/, (_, left, right) => `${left} decimal place${left === '1' ? '' : 's'} plus ${right} decimal place${right === '1' ? '' : 's'} worksheets`)
    .replace(/^(\d) decimal places? divided by (\d) decimal places? worksheets$/, (_, left, right) => `decimal division ${left} place${left === '1' ? '' : 's'} by ${right} place${right === '1' ? '' : 's'} worksheets`)
    .replace(/^multiply (\d) decimal places? by (\d) decimal places? worksheets$/, (_, left, right) => `decimal multiplication ${left} place${left === '1' ? '' : 's'} by ${right} place${right === '1' ? '' : 's'} worksheets`)
    .replace(/^(\d) digit by \d digit multiplication no regrouping worksheets$/, '$1 digit multiplication without regrouping worksheets')
    .replace(/^(\d) digit by \d digit multiplication (\d) regroupings? worksheets$/, (_, digits, count) => `${digits} digit multiplication with ${count} regrouping${count === '1' ? '' : 's'} worksheets`)
    .replace(/^missing number addition subtraction facts within 20 worksheets$/, 'missing number addition subtraction to 20 worksheets')
    .replace(/^(\d) by (\d) digit long division without remainders worksheets$/, '$1 by $2 long division without remainders worksheets')
    .replace(/^division (with|without) remainders (\d) digit by (\d) digit worksheets$/, '$2 by $3 digit division $1 remainders worksheets')
    .replace(/^vertical (\d) decimal places? by (\d) decimal places? worksheets$/, (_, left, right) => `vertical decimals ${left} place${left === '1' ? '' : 's'} by ${right} place${right === '1' ? '' : 's'} worksheets`);
  if (primaryWordCount(phrase) > 8) phrase = phrase.replace(/^grade \d+\s+/, '');
  if (primaryWordCount(phrase) > 8) phrase = phrase.replace(/\bword problem\b/g, 'problems');
  if (primaryWordCount(phrase) > 8) phrase = phrase.replace(/\b(?:the|of|a)\b/g, ' ').replace(/\s+/g, ' ').trim();
  if (primaryWordCount(phrase) > 8) {
    throw new Error(`Primary keyword needs a natural eight-word rule: ${phrase}`);
  }
  return phrase;
}

function descriptionTopic(h1, relative = '') {
  let base = withoutBrand(h1);
  const suffixGrade = (base.match(/\s+\u2013\s+(Grade\s+\d+)\b/i) || [])[1] || '';
  const leadingGrade = (base.match(/^(Kindergarten|(?:1st|2nd|3rd|4th|5th|6th) Grade|Grade \d+)\b/i) || [])[1] || '';
  const grade = leadingGrade || suffixGrade;
  const suffixFormat = (base.match(/\s+\u2013\s+(Horizontal|Vertical|Long Division|Missing Number|Missing Digit)\b/i) || [])[1] || '';
  const routeFormat = printFormat(relative);
  const routeGrade = gradeQualifier(relative);
  base = base
    .replace(/\bWorksheets?\s+(?:With|&)\s+Answer Keys?\b/i, 'Worksheets')
    .replace(/\s+\u2013\s+Free Printable Practice\b/i, '')
    .replace(/\s+[-\u2013\u2014]\s+Free Printables?(?: Practice)?\b/i, '')
    .replace(/\bfree printables?\b/gi, '')
    .replace(/^(?:Kindergarten|(?:1st|2nd|3rd|4th|5th|6th) Grade|Grade \d+)\s+/i, '')
    .replace(/\s+\u2013\s+Grade\s+\d+\b/i, '')
    .replace(/\s+\u2013\s+(?:Horizontal|Vertical|Long Division|Missing Number|Missing Digit)\b/i, '')
    .replace(/\bworksheets?\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  const baseHasFormat = routeFormat === 'Word Problem'
    ? /\bWord Problems?\b/i.test(base)
    : routeFormat === 'Missing Number'
      ? /\bMissing (?:Number|Digit|Addend|Factor|Part)\b/i.test(base)
      : routeFormat && new RegExp(`\\b${routeFormat.replace(/\s+/g, '\\s+')}\\b`, 'i').test(base);
  const implicitFormat = routeFormat && !suffixFormat && !baseHasFormat ? routeFormat : '';
  const implicitGrade = routeGrade && !grade && !new RegExp(`\\b${routeGrade.replace(/\s+/g, '\\s+')}\\b`, 'i').test(base) ? routeGrade : '';
  const prefix = [grade || implicitGrade, suffixFormat, implicitFormat].filter(Boolean).join(' ');
  const topic = `${prefix}${prefix ? ' ' : ''}${base}`.trim().toLowerCase();
  return topic
    .replace(/\bcommon core\b/g, 'Common Core')
    .replace(/\b([1-3])-place\b/g, '$1-place');
}

function stableVariant(relative, count) {
  let hash = 0;
  for (const character of relative) hash = (hash * 31 + character.codePointAt(0)) >>> 0;
  return hash % count;
}

function fitDescription(h1, relative) {
  const topic = descriptionTopic(h1, relative);
  if (relative === 'en/index.html') return 'Explore free printable math worksheets for skill practice by grade or topic. Generate a fresh set and use the matching answer key at home or in class.';
  if (relative === 'en/worksheets.html') return 'Find free printable math worksheets with answer keys for focused practice in arithmetic, fractions, decimals, measurement, geometry, and more.';
  const integerMatch = relative.match(/^en\/integer-(add|sub|mul|div)\.html$/i);
  if (integerMatch) {
    const operation = { add: 'addition', sub: 'subtraction', mul: 'multiplication', div: 'division' }[integerMatch[1].toLowerCase()];
    return `Free printable ${topic} worksheets. Practice integer ${operation} with positive and negative numbers, then print the matching answer key.`;
  }
  const haystack = `${relative} ${h1}`;
  const category = /missing-number|missing-digit|missing addend|missing factor|missing part/i.test(haystack) ? 'missing'
    : /word-problem|word problem/i.test(haystack) ? 'word'
      : /prerequisite-review|\breview\b/i.test(haystack) ? 'review'
        : /\/print\/(?:activity|hands-on|hv)\//i.test(relative) ? 'activity'
          : /horizontal|vertical|long-division-format/i.test(haystack) ? 'format'
            : /^en\/print\/(?:grade-[12]-|k-)/i.test(relative) ? 'grade'
              : /^en\/practice\//i.test(relative) ? 'practice'
                : relative.includes('/print/') ? 'print' : 'generator';
  const banks = {
    missing: [
      `Free printable ${topic} worksheets with an answer key. Students complete each missing value for focused practice at home, in tutoring, or in class.`,
      `Use free printable ${topic} worksheets for targeted practice. A matching answer key makes it easy to check work during lessons or at home.`,
      `Practice ${topic} with free printable worksheets. Each page includes a matching answer key for independent work, small groups, or homework.`,
    ],
    word: [
      `Free printable ${topic} worksheets with an answer key. Students read, model, and solve each task for practical math practice at home or school.`,
      `Use these free printable ${topic} worksheets for problem-solving practice. A matching answer key supports quick review in class or at home.`,
      `Build reasoning with free printable ${topic} worksheets. The included answer key helps check practice during lessons, tutoring, or homework.`,
    ],
    review: [
      `Free printable ${topic} worksheets provide focused review and practice. Use the matching answer key to check readiness at home or in class.`,
      `Review ${topic} with free printable worksheets and a matching answer key. The practice works well for warm-ups, tutoring, or homework.`,
      `Use free printable ${topic} worksheets for skill review and practice. A matching answer key helps students check their work independently.`,
    ],
    activity: [
      `Free printable ${topic} worksheets turn the skill into hands-on practice. A matching answer key supports lessons, centers, or learning at home.`,
      `Use these free printable ${topic} worksheets for visual, hands-on practice. The included answer key makes checking work quick and clear.`,
      `Try free printable ${topic} worksheets for active math practice. Each activity includes a matching answer key for home or classroom use.`,
    ],
    format: [
      `Free printable ${topic} worksheets offer clearly arranged practice. A matching answer key supports independent work, tutoring, or classroom lessons.`,
      `Practice ${topic} with free printable worksheets in a clear layout. The included answer key helps students check each completed set.`,
      `Use free printable ${topic} worksheets for structured practice. Each page comes with a matching answer key for home or classroom use.`,
    ],
    grade: [
      `Free printable ${topic} worksheets support grade-level practice. A matching answer key makes them useful for classwork, homework, or tutoring.`,
      `Use these free printable ${topic} worksheets for focused grade-level practice. Each page includes a matching answer key for quick checking.`,
      `Build grade-level skills with free printable ${topic} worksheets. The matching answer key supports lessons, independent practice, or homework.`,
    ],
    practice: [
      `Free printable ${topic} worksheets provide focused skill practice. Create a set and use the matching answer key at home, in tutoring, or in class.`,
      `Practice ${topic} with free printable worksheets and a matching answer key. Use each set for a lesson, homework, or independent review.`,
      `Use free printable ${topic} worksheets for repeatable math practice. Each set includes a matching answer key for quick checking.`,
    ],
    print: [
      `Free printable ${topic} worksheets provide ready-to-use practice. A matching answer key supports lessons, tutoring, homework, or independent work.`,
      `Use these free printable ${topic} worksheets for focused practice. The included answer key makes checking work simple at home or in class.`,
      `Practice ${topic} with free printable worksheets. Each page includes a matching answer key for classroom lessons, tutoring, or homework.`,
    ],
    generator: [
      `Free printable ${topic} worksheets with a matching answer key. Generate a fresh practice set for home, tutoring, or classroom use.`,
      `Build skills with free printable ${topic} worksheets. Generate new practice questions and a matching answer key for lessons or home.`,
      `Use free printable ${topic} worksheets for focused practice. Create another set with its matching answer key whenever more practice is needed.`,
    ],
  };
  const candidates = banks[category];
  const start = stableVariant(relative, candidates.length);
  for (let offset = 0; offset < candidates.length; offset += 1) {
    const candidate = candidates[(start + offset) % candidates.length];
    if (candidate.length >= META_MIN && candidate.length <= META_MAX) return candidate;
  }
  const shortest = `Free printable ${topic} worksheets. Get fresh practice and a matching answer key for home or class.`;
  return shortest.length >= META_MIN ? shortest : `${shortest} Print anytime.`;
}

function hasMetaSearchIntent(description) {
  const value = description.toLowerCase();
  return /\bfree\b/.test(value)
    && /\bprint(?:able|ing)?\b/.test(value)
    && /\bworksheets?\b/.test(value)
    && /\bpractice\b/.test(value)
    && /\banswer keys?\b/.test(value);
}

function recommendDescription(currentDescription, h1, metadataChanged, relative) {
  return fitDescription(h1, relative);
}

function secondaryKeywords(mainKeyword, h1, relative) {
  const grade = gradeKeyword(relative);
  if (grade) {
    const number = Number((relative.match(/grade-(\d)/i) || [])[1]);
    if (!number) return 'kindergarten worksheets; free printable kindergarten math worksheets; kindergarten worksheets with answers';
    const word = { 1: 'first', 2: 'second', 3: 'third', 4: 'fourth', 5: 'fifth', 6: 'sixth' }[number];
    return `${word} grade math worksheets; free printable ${grade}; grade ${number} worksheets with answers`;
  }
  const worksheetPhrase = /\bworksheets?\b/i.test(mainKeyword) ? mainKeyword : `${mainKeyword} worksheets`;
  const topic = worksheetPhrase.replace(/\bworksheets?\b/gi, '').replace(/\s+/g, ' ').trim();
  const detailedPhrase = withoutBrand(h1)
    .replace(/&/g, ' and ')
    .replace(/,/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
  const candidates = [
    `free printable ${normalizedKeyword(detailedPhrase) === normalizedKeyword(worksheetPhrase) ? worksheetPhrase : detailedPhrase}`,
    `${topic} practice sheets with answer key`,
    `${topic} printable math practice`,
  ];
  const integerMatch = relative.match(/^en\/integer-(add|sub|mul|div)\.html$/i);
  if (integerMatch) {
    const operation = { add: 'addition', sub: 'subtraction', mul: 'multiplication', div: 'division' }[integerMatch[1].toLowerCase()];
    candidates.push(`integer ${operation} worksheets`);
  }
  return candidates.filter((value, index, values) => value !== mainKeyword && values.indexOf(value) === index).slice(0, 3).join('; ');
}

function normalizedKeyword(value) {
  return value.replace(/\s+/g, ' ').trim().toLowerCase();
}

function stepByStepRecommended(relative, h1) {
  const haystack = `${relative} ${h1}`;
  if (/color|model|shade|matching|puzzle|error-analysis|mistake-detective/i.test(haystack)) return false;
  return /regroup|multi[ -]?digit|long division|place value|rounding|order of operations|equation|word problem|area|perimeter|volume|percent|ratio|coordinate|conversion|natural-(?:add|sub|mul|div)|fraction-(?:add|sub|mul|div)|decimal-(?:add|sub|mul|div)|integer-(?:add|sub|mul|div)/i.test(haystack);
}

function seoPriority(relative, h1, stepByStep) {
  const haystack = `${relative} ${h1}`;
  if (/error-analysis|mistake-detective|(?:decimal|fraction)-(?:add|sub|mul|div)-(?:0|1|2)dp-|\/print\/.*(?:horizontal|vertical|missing-number|missing-digit)/i.test(haystack)) return 'Low';
  if (/^en\/(?:kindergarten|grade-[1-6]|grades|worksheets|math-worksheets|addition-worksheets|subtraction-worksheets|multiplication-worksheets|division-worksheets|fraction-worksheets|decimal-worksheets)\.html$/i.test(relative)) return 'High';
  if (/place-value|rounding|counting-coins|telling-time|money|long-division|word-problem|times-table|multiply-one|regroup/i.test(haystack)) return 'High';
  if (stepByStep || /addition|subtraction|multiplication|division|fractions?|decimals?|measurement|geometry|number sense/i.test(haystack)) return 'Medium';
  if (/index\.html$|practice|print|facts|number|cut-and-paste/i.test(haystack)) return 'Medium';
  return 'Low';
}

function replaceRange(source, start, end, replacement) {
  return source.slice(0, start) + replacement + source.slice(end);
}

function replaceElementInner(html, tagName, value) {
  const element = findElement(html, tagName);
  if (!element) return html;
  const openEnd = element.full.indexOf('>') + 1;
  const closeStart = element.full.toLowerCase().lastIndexOf(`</${tagName.toLowerCase()}>`);
  const replacement = element.full.slice(0, openEnd) + escapeHtml(value) + element.full.slice(closeStart);
  return replaceRange(html, element.index, element.end, replacement);
}

function setOrInsertMetaDescription(html, description) {
  const tag = findVoidTag(html, 'meta', 'name', 'description');
  if (tag) return replaceRange(html, tag.index, tag.end, setAttribute(tag.full, 'content', description));
  const title = findElement(html, 'title');
  const addition = `<meta name="description" content="${escapeHtml(description)}">`;
  if (title) return html.slice(0, title.end) + addition + html.slice(title.end);
  return html.replace(/<head\b[^>]*>/i, (head) => `${head}${addition}`);
}

function setOrInsertCanonical(html, canonical) {
  const tag = findVoidTag(html, 'link', 'rel', 'canonical');
  if (tag) return replaceRange(html, tag.index, tag.end, setAttribute(tag.full, 'href', canonical));
  const description = findVoidTag(html, 'meta', 'name', 'description');
  const addition = `<link rel="canonical" href="${escapeHtml(canonical)}">`;
  if (description) return html.slice(0, description.end) + addition + html.slice(description.end);
  const title = findElement(html, 'title');
  if (title) return html.slice(0, title.end) + addition + html.slice(title.end);
  return html.replace(/<head\b[^>]*>/i, (head) => `${head}${addition}`);
}

function setExistingMeta(html, property, value) {
  const tag = findVoidTag(html, 'meta', 'property', property);
  if (!tag) return html;
  return replaceRange(html, tag.index, tag.end, setAttribute(tag.full, 'content', value));
}

function pageSchemaType(value) {
  const types = Array.isArray(value) ? value : [value];
  return types.some((type) => /^(?:WebPage|LearningResource|CreativeWork)$/i.test(String(type || '')));
}

function updateJsonLd(html, h1, description, canonical) {
  return html.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi, (full, attributes, body) => {
    if (getAttribute(`<script ${attributes}>`, 'type').toLowerCase() !== 'application/ld+json') return full;
    let data;
    try {
      data = JSON.parse(body.trim());
    } catch {
      return full;
    }
    let changed = false;
    function visit(node) {
      if (Array.isArray(node)) {
        node.forEach(visit);
        return;
      }
      if (!node || typeof node !== 'object') return;
      const nodeUrl = String(node.url || node['@id'] || '');
      const isPage = pageSchemaType(node['@type']) || nodeUrl === canonical || nodeUrl.startsWith(`${canonical}#`);
      if (isPage && !/^WebSite$/i.test(String(node['@type'] || ''))) {
        if (Object.prototype.hasOwnProperty.call(node, 'name') && node.name !== h1) {
          node.name = h1;
          changed = true;
        }
        if (Object.prototype.hasOwnProperty.call(node, 'headline') && node.headline !== h1) {
          node.headline = h1;
          changed = true;
        }
        if (Object.prototype.hasOwnProperty.call(node, 'description') && node.description !== description) {
          node.description = description;
          changed = true;
        }
      }
      Object.values(node).forEach(visit);
    }
    visit(data);
    return changed ? full.replace(body, JSON.stringify(data)) : full;
  });
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function replaceManyLiterals(source, pairs) {
  const replacements = new Map();
  for (const [before, after] of pairs) {
    if (!before || before === after || replacements.has(before)) continue;
    replacements.set(before, after);
  }
  if (!replacements.size) return source;
  const pattern = [...replacements.keys()].sort((a, b) => b.length - a.length).map(escapeRegExp).join('|');
  return source.replace(new RegExp(pattern, 'g'), (match) => replacements.get(match));
}

function quotedJsValue(value, quote) {
  const json = JSON.stringify(value).slice(1, -1);
  return quote === "'" ? json.replace(/'/g, "\\'") : json;
}

function repairStructuredInline(body, after) {
  let result = body.replace(/(\bGDCurriculumConfig\s*=\s*\{[\s\S]*?\btitle\s*:\s*)(["'])([\s\S]*?)\2/i,
    (_, prefix, quote) => `${prefix}${quote}${quotedJsValue(after.h1, quote)}${quote}`);
  if (!/MutationObserver/.test(result)) return result;
  const assignments = [
    ['title', after.title],
    ['canonical', after.canonical],
    ['heading', after.h1],
  ];
  for (const [name, value] of assignments) {
    const matcher = new RegExp(`(\\bvar\\s+${name}\\s*=\\s*)(["'])([\\s\\S]*?)\\2`, 'g');
    result = result.replace(matcher, (_, prefix, quote) => `${prefix}${quote}${quotedJsValue(value, quote)}${quote}`);
  }
  return result.replace(/(document\.title\s*(?:!==|===|!=|==|=)\s*)(["'])([\s\S]*?)\2/g,
    (_, prefix, quote) => `${prefix}${quote}${quotedJsValue(after.title, quote)}${quote}`);
}

function updateInlineBootstrap(html, before, after) {
  const rawPairs = [
    [before.title, after.title],
    [withoutBrand(before.title), withoutBrand(after.title)],
    [before.h1, after.h1],
    [before.description, after.description],
    [before.canonical, after.canonical],
  ];
  const pairs = [];
  for (const [oldValue, newValue] of rawPairs) {
    pairs.push([oldValue, newValue]);
    pairs.push([escapeHtml(oldValue), escapeHtml(newValue)]);
    pairs.push([JSON.stringify(oldValue || '').slice(1, -1), JSON.stringify(newValue || '').slice(1, -1)]);
  }
  return html.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi, (full, attributes, body) => {
    const scriptTag = `<script ${attributes}>`;
    if (getAttribute(scriptTag, 'src')) return full;
    if (getAttribute(scriptTag, 'type').toLowerCase() === 'application/ld+json') return full;
    const replaced = replaceManyLiterals(body, pairs);
    const updated = repairStructuredInline(replaced, after);
    return updated === body ? full : full.replace(body, updated);
  });
}

function updateBodyRuntimeMetadata(html, after) {
  const values = {
    'data-regional-title': after.title,
    'data-regional-description': after.description,
    'data-regional-canonical': after.canonical,
    'data-activity-entry-title': after.h1,
    'data-activity-entry-description': after.description,
    'data-activity-entry-canonical': after.canonical,
    'data-hands-on-title': after.h1,
    'data-hands-on-description': after.description,
    'data-hands-on-canonical': after.canonical,
    'data-hv-title': after.h1,
    'data-hv-description': after.description,
    'data-hv-canonical': after.canonical,
  };
  return html.replace(/<body\b[^>]*>/i, (body) => {
    let updated = body;
    for (const [name, value] of Object.entries(values)) {
      if (getAttribute(updated, name)) updated = setAttribute(updated, name, value);
    }
    return updated;
  });
}

function applyMetadata(html, before, record) {
  const after = {
    title: record.appliedTitle,
    h1: record.recommendedH1,
    description: record.metaDescription,
    canonical: record.canonical,
  };
  let result = updateInlineBootstrap(html, before, after);
  result = updateBodyRuntimeMetadata(result, after);
  result = replaceElementInner(result, 'title', after.title);
  result = setOrInsertMetaDescription(result, after.description);
  result = setOrInsertCanonical(result, after.canonical);
  result = replaceElementInner(result, 'h1', after.h1);
  result = setExistingMeta(result, 'og:title', after.title);
  result = setExistingMeta(result, 'og:description', after.description);
  result = updateJsonLd(result, after.h1, after.description, after.canonical);
  return result;
}

function csvEscape(value) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

function serializeCsv(rows) {
  const lines = [REPORT_HEADERS.map(csvEscape).join(',')];
  for (const row of rows) lines.push(REPORT_HEADERS.map((header) => csvEscape(row[header])).join(','));
  return lines.join('\n') + '\n';
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') quoted = false;
      else field += character;
    } else if (character === '"') quoted = true;
    else if (character === ',') {
      row.push(field);
      field = '';
    } else if (character === '\n') {
      row.push(field.replace(/\r$/, ''));
      if (row.some(Boolean)) rows.push(row);
      row = [];
      field = '';
    } else field += character;
  }
  if (field || row.length) {
    row.push(field.replace(/\r$/, ''));
    rows.push(row);
  }
  if (!rows.length) return [];
  const headers = rows.shift();
  return rows.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] || ''])));
}

function readPreviousTitleMap() {
  if (!fs.existsSync(REPORT_PATH)) return new Map();
  const rows = parseCsv(fs.readFileSync(REPORT_PATH, 'utf8'));
  return new Map(rows.map((row) => [row.current_file, row.current_title || row.previous_title]));
}

function buildRecords() {
  const previous = readPreviousTitleMap();
  const records = targetFiles().map((absolute) => {
    const relative = relativeFile(absolute);
    const html = fs.readFileSync(absolute, 'utf8');
    const before = extractMetadata(html);
    return {
      absolute,
      relative,
      html,
      before,
      previousTitle: previous.get(relative) || before.title,
      appliedTitle: recommendTitle(relative, before.title),
      canonical: canonicalFor(relative),
    };
  });
  disambiguateTitles(records);
  for (const record of records) {
    record.recommendedH1 = recommendH1(record.before.h1, record.appliedTitle);
    const changed = record.before.title !== record.appliedTitle || record.before.h1 !== record.recommendedH1;
    record.metaDescription = recommendDescription(record.before.description, record.recommendedH1, changed, record.relative);
    record.mainKeyword = keywordFromH1(record.recommendedH1, record.relative);
    record.secondaryKeywords = secondaryKeywords(record.mainKeyword, record.recommendedH1, record.relative);
    record.stepByStep = stepByStepRecommended(record.relative, record.recommendedH1);
    record.priority = seoPriority(record.relative, record.recommendedH1, record.stepByStep);
  }
  return records;
}

function reportRows(records) {
  return records.map((record) => ({
    current_file: record.relative,
    current_title: record.previousTitle,
    recommended_title: record.appliedTitle,
    main_keyword: record.mainKeyword,
    secondary_keywords: record.secondaryKeywords,
    recommended_h1: record.recommendedH1,
    meta_description: record.metaDescription,
    step_by_step_recommended: record.stepByStep ? 'Yes' : 'No',
    seo_priority: record.priority,
  }));
}

module.exports = {
  EN_ROOT,
  GENERIC_H1,
  INFORMATIONAL_ROOT_FILES,
  MATH_TITLE_SYMBOL,
  META_MAX,
  META_MIN,
  PRACTICE_PAGE_TITLES,
  REGION_ROOT_FILE,
  REPORT_HEADERS,
  REPORT_PATH,
  REPO_ROOT,
  SITE_ORIGIN,
  TITLE_MAX,
  applyMetadata,
  buildRecords,
  canonicalFor,
  decodeHtml,
  extractMetadata,
  hasMetaSearchIntent,
  parseCsv,
  relativeFile,
  reportRows,
  serializeCsv,
  targetFiles,
  withoutBrand,
};
