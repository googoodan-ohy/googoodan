/**
 * 구구단닷컴 백엔드 서버
 * - 외부 패키지(Express 등) 없이 Node.js 기본 모듈만 사용합니다.
 * - 그래서 npm install 없이 바로 "node server.js" 로 실행할 수 있습니다.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// 배포 환경(호스팅 서비스)이 PORT를 지정해주면 그 값을 쓰고, 없으면 로컬 기본값 3000 사용
const PORT = process.env.PORT || 3000;

// 이 server.js 파일과 같은 위치의 work 폴더를 항상 자동으로 찾음
const WORK_DIR = path.join(__dirname, 'work');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

function sendJSON(res, data, status = 200) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
  });
  res.end(body);
}

function sendFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('파일을 찾을 수 없습니다');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

// 작업 폴더 전체를 스캔해서 { 학년: { 학기: { 단원: [파일들] } } } 구조로 반환
function scanDirectory(dirPath) {
  const result = {};
  if (!fs.existsSync(dirPath)) return result;

  try {
    const grades = fs.readdirSync(dirPath);
    grades.forEach(grade => {
      const gradePath = path.join(dirPath, grade);
      if (!fs.statSync(gradePath).isDirectory()) return;

      result[grade] = {};
      const semesters = fs.readdirSync(gradePath);

      semesters.forEach(semester => {
        const semesterPath = path.join(gradePath, semester);
        if (!fs.statSync(semesterPath).isDirectory()) return;

        result[grade][semester] = {};
        const units = fs.readdirSync(semesterPath);

        units.forEach(unit => {
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
  } catch (error) {
    console.error('디렉토리 스캔 오류:', error);
  }

  return result;
}

function listProblems(grade, semester, unit) {
  const unitPath = path.join(WORK_DIR, grade, semester, unit);
  if (!fs.existsSync(unitPath)) return [];

  try {
    return fs.readdirSync(unitPath)
      .filter(f => f.endsWith('.html'))
      .sort()
      .map(f => ({ name: f.replace('.html', ''), file: f }));
  } catch (error) {
    return [];
  }
}

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url);
  // 각 경로 조각을 디코딩 (한글/공백/쉼표 등이 포함된 폴더명 대응)
  const segments = parsed.pathname.split('/').filter(Boolean).map(decodeURIComponent);

  // API: 전체 폴더 구조
  if (segments[0] === 'api' && segments[1] === 'structure') {
    return sendJSON(res, scanDirectory(WORK_DIR));
  }

  // API: 특정 단원의 문제지 목록  /api/problems/:grade/:semester/:unit
  if (segments[0] === 'api' && segments[1] === 'problems') {
    const [, , grade, semester, unit] = segments;
    return sendJSON(res, listProblems(grade, semester, unit));
  }

  // 문제지 파일 제공  /problem/:grade/:semester/:unit/:filename
  if (segments[0] === 'problem') {
    const [, grade, semester, unit, filename] = segments;
    const filePath = path.join(WORK_DIR, grade, semester, unit, filename + '.html');
    // WORK_DIR 밖으로 벗어나는 경로 요청 방지
    if (!path.resolve(filePath).startsWith(path.resolve(WORK_DIR))) {
      res.writeHead(403);
      return res.end('접근 불가');
    }
    return sendFile(res, filePath);
  }

  // 그 외 요청은 프로젝트 폴더 안의 정적 파일로 처리 (index_main.html 등)
  let staticPath = parsed.pathname === '/' ? '/index_main.html' : parsed.pathname;
  staticPath = path.join(__dirname, decodeURIComponent(staticPath));

  if (!path.resolve(staticPath).startsWith(path.resolve(__dirname))) {
    res.writeHead(403);
    return res.end('접근 불가');
  }

  fs.stat(staticPath, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('페이지를 찾을 수 없습니다');
    }
    sendFile(res, staticPath);
  });
});

server.listen(PORT, () => {
  console.log(`✓ 서버 시작: http://localhost:${PORT}`);
  console.log(`✓ 작업 폴더: ${WORK_DIR}`);
  console.log(`✓ API 테스트: http://localhost:${PORT}/api/structure`);
});
