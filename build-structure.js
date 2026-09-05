/**
 * work 폴더를 스캔해서 structure.json 을 생성합니다.
 * (기존 server.js 의 /api/structure 응답과 똑같은 형식입니다)
 *
 * 실행: node build-structure.js
 */
const fs = require('fs');
const path = require('path');

const WORK_DIR = path.join(__dirname, 'work');
const OUT_FILE = path.join(__dirname, 'structure.json');

function scanDirectory(dirPath) {
  const result = {};
  if (!fs.existsSync(dirPath)) return result;

  fs.readdirSync(dirPath).forEach(grade => {
    const gradePath = path.join(dirPath, grade);
    if (!fs.statSync(gradePath).isDirectory()) return;

    result[grade] = {};
    fs.readdirSync(gradePath).forEach(semester => {
      const semesterPath = path.join(gradePath, semester);
      if (!fs.statSync(semesterPath).isDirectory()) return;

      result[grade][semester] = {};
      fs.readdirSync(semesterPath).forEach(unit => {
        const unitPath = path.join(semesterPath, unit);
        if (!fs.statSync(unitPath).isDirectory()) return;

        const files = fs.readdirSync(unitPath)
          .filter(f => f.endsWith('.html'))
          .sort()
          .map(f => ({ name: f.replace('.html', ''), file: f }));

        if (files.length > 0) {
          result[grade][semester][unit] = files;
        }
      });
    });
  });

  return result;
}

const structure = scanDirectory(WORK_DIR);

let units = 0, files = 0;
Object.values(structure).forEach(g =>
  Object.values(g).forEach(s =>
    Object.values(s).forEach(list => { units++; files += list.length; })
  )
);

if (files === 0) {
  console.error('ERROR: no html files found under work/ - aborting.');
  process.exit(1);
}

fs.writeFileSync(OUT_FILE, JSON.stringify(structure, null, 2), 'utf8');
console.log('    structure.json written -- ' + units + ' units, ' + files + ' files');
