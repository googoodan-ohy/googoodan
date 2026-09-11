const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync('ko/question-engine.js', 'utf8');
const target = 'de/reuse/picture-multiplication-source.js';
const invocation = '})(globalThis);';
if (source.split(invocation).length !== 2) throw new Error('Unexpected Korean generator wrapper; review before rebuilding.');
const output = '// Korean generator unchanged; isolate its multiplication route from the German catalog.\n' +
  '(()=>{const KoEarlyArithmetic={banks:{}};const sandbox={KoMath:{},KoMultiplicationBank:globalThis.KoMultiplicationBank,KoArt:globalThis.KoArt};\n' +
  source.replace(invocation, '})(sandbox);') +
  '\nglobalThis.DePictureMultiplication=sandbox.KoMath;})();\n';
const normalize = s => s.replace(/\r\n/g, '\n');
if (fs.existsSync(target) && normalize(fs.readFileSync(target, 'utf8')) === normalize(output)) {
  console.log('German multiplication source is up to date; no published files changed.');
} else {
  if (process.argv.includes('--check')) throw new Error('German multiplication source differs from the Korean source.');
  const version = process.argv.find(x => x.startsWith('--version='))?.slice(10);
  if (!version || !/^[A-Za-z0-9-]+$/.test(version)) throw new Error('Rebuilding requires --version=YYYYMMDD-label to invalidate browser caches.');
  fs.writeFileSync(target, output);
  let updated = 0;
  for (const file of fs.readdirSync('de', { recursive: true }).filter(f => f.endsWith('.html'))) {
    const full = path.join('de', file), html = fs.readFileSync(full, 'utf8');
    const changed = html.replace(/picture-multiplication-source\.js(?:\?v=[^"\s]+)?/g, 'picture-multiplication-source.js?v=' + version);
    if (changed !== html) { fs.writeFileSync(full, changed); updated++; }
  }
  const builder = 'build-de-picture-multiplication.cjs';
  const script = fs.readFileSync(builder, 'utf8');
  fs.writeFileSync(builder, script.replace(/picture-multiplication-source\.js\?v=[^"\s]+/g, 'picture-multiplication-source.js?v=' + version));
  console.log('Rebuilt Korean source wrapper and versioned ' + updated + ' HTML references. Run German calculation/browser/print checks before publishing.');
}
