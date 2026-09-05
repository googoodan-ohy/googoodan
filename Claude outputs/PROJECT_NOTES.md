# 구구단닷컴 프로젝트 인수인계 노트

> 새 대화를 시작할 때 이 파일을 첨부하면, 지금까지의 경위를 설명하지 않아도 됩니다.
> 최종 갱신: 2026-09-05

---

## 1. 이게 뭔가

초등학교 1~6학년 수학 문제지를 학년·학기·단원별로 골라 보고, 숫자를 바꿔가며 인쇄할 수 있는 웹사이트입니다.

- **사이트 주소**: https://googoodan.com
- **GitHub 저장소**: https://github.com/googoodan-ohy/googoodan (Public)
- **로컬 폴더**: `G:\구구단닷컴`
- **호스팅**: GitHub Pages (main 브랜치 / root)
- **콘텐츠 규모**: 71개 단원, 350개 문제지 HTML

---

## 2. 폴더 구조

```
G:\구구단닷컴\
├── index.html            ← 웹사이트 메인 (정적 버전)
├── index_main.html       ← 로컬 서버용 원본 (건드리지 말 것)
├── server.js             ← 로컬 Node 서버 (집에서 npm start 할 때만 사용)
├── package.json
├── structure.json        ← 문제지 목록 (자동 생성, 직접 수정 금지)
├── build-structure.js    ← structure.json 생성기
├── update-site.bat       ← ★ 사이트 갱신 (이것만 쓰면 됨)
├── .nojekyll             ← GitHub이 한글 폴더명 건드리지 않게 함
├── .gitignore
├── CNAME                 ← GitHub이 도메인 저장할 때 자동 생성
├── SETUP_GUIDE.md        ← 로컬 실행 안내 (예전 문서)
└── work\                 ← 문제지 본체
    └── {학년}\{학기}\{N단원 단원명}\{유형N 유형이름}.html
```

---

## 3. 일상 운영 — 이것만 기억하면 됨

문제지를 추가하거나 고친 뒤:

### `update-site.bat` 더블클릭

이 파일이 5단계를 자동으로 처리합니다.

1. `work` 폴더를 훑어 `structure.json` 재생성
2. 변경사항 스테이징
3. 커밋
4. GitHub에서 최신 내용 받아오기 (pull --rebase)
5. 업로드 (push)

1분쯤 뒤 사이트에 반영됩니다. **GitHub Desktop을 열 필요 없습니다.**

### 문제지 추가 방법

`work\{학년}\{학기}\{단원폴더}\` 안에 `.html` 파일을 넣으면 끝입니다. 파일명이 그대로 사이트의 버튼 이름이 됩니다. 새 단원은 폴더를 만들면 됩니다.

---

## 4. 구조상 알아둬야 할 것 (중요)

**원래 이 프로젝트는 Node.js 서버 앱이었습니다.** `server.js`가 실행 중일 때 `work` 폴더를 실시간 스캔해 메뉴를 만들었습니다. GitHub Pages는 정적 호스팅이라 서버를 돌릴 수 없어서, **정적 방식으로 전환**했습니다.

`index.html`은 `index_main.html`에서 딱 4곳을 고친 버전입니다.

| 원본 (`index_main.html`) | 웹용 (`index.html`) |
|---|---|
| `fetch('/api/structure')` | `fetch('structure.json')` |
| `fetch('/api/problems/...')` | `structure` 객체에서 직접 조회 |
| `iframe src="/problem/..."` | `iframe src="work/..."` (상대경로) |
| "서버가 실행 중이 아닙니다" 오류 문구 | "structure.json을 못 불러왔습니다" |

### 그래서 지켜야 할 규칙

- **`index.html`을 고쳤으면 `index_main.html`과 어긋나게 됩니다.** 디자인이나 기능을 바꿀 때는 두 파일 다 손봐야 합니다.
- 집에서 `npm start`로 쓰던 방식(`index_main.html` + `server.js`)도 그대로 살아 있습니다. 웹과 로컬이 따로 놉니다.
- `structure.json`은 직접 편집하지 마세요. `update-site.bat`이 매번 새로 만듭니다.

---

## 5. 도메인 / DNS 설정 (완료됨)

- **구입처**: 후이즈 (whois.co.kr) — 2026-09-05 등록, 2031-09-05 만료
- **네임서버**: `ns1.whoisdomain.kr` / `ns2.whoisdomain.kr` (후이즈 기본)
- **설정 위치**: 후이즈 → 내 도메인 자산 관리 → **네임서버 고급설정**

| 종류 | 호스트명 | 값 |
|---|---|---|
| A | (빈칸) | 185.199.108.153 |
| A | (빈칸) | 185.199.109.153 |
| A | (빈칸) | 185.199.110.153 |
| A | (빈칸) | 185.199.111.153 |
| CNAME | www | googoodan-ohy.github.io |

GitHub 쪽은 `Settings → Pages → Custom domain`에 `googoodan.com` 등록 완료, `DNS check successful` 확인됨.

---

## 6. 미완료 항목

### HTTPS 인증서

`Enforce HTTPS` 체크박스가 아직 비활성 상태입니다. GitHub이 Let's Encrypt 인증서를 발급하는 중이며, 보통 15분~1시간, 드물게 하루까지 걸립니다.

- 확인 위치: https://github.com/googoodan-ohy/googoodan/settings/pages
- 활성화되면 체크할 것
- **몇 시간이 지나도 회색이면**: Custom domain을 `Remove` 했다가 `googoodan.com`을 다시 `Save` → 인증서 발급 재시도됨

---

## 7. 이미 겪은 함정들 (반복하지 말 것)

**① 스크립트에 한글을 넣지 말 것**
`.ps1` 파일을 UTF-8(BOM 없음)로 저장했더니, 한국어 Windows의 PowerShell 5.1이 CP949로 읽어 따옴표까지 깨지며 파싱 실패했습니다. `.bat`/`.ps1`은 **ASCII만** 사용하세요.

**② 경로를 하드코딩하지 말 것**
`cd "G:\구구단닷컴"` 대신 `cd /d "%~dp0"` (배치) 또는 `$PSScriptRoot` (PowerShell). 한글 경로 인코딩 문제를 원천 차단합니다.

**③ `.git` 폴더는 원격 도구로 쓸 수 없음**
Claude의 파일 전송 도구는 `.git` 디렉터리 쓰기를 차단합니다. `git init`은 반드시 사용자 컴퓨터에서 실행해야 합니다.

**④ 후이즈 A레코드 호스트명에 `@`를 넣지 말 것**
후이즈는 `@`를 특수문자로 거부합니다. 도메인 자체(apex)를 가리키려면 **빈칸**으로 둡니다.

**⑤ GitHub이 `CNAME` 파일을 자동 생성함**
도메인 저장 시 GitHub이 저장소에 `CNAME`을 직접 커밋합니다. 그래서 `update-site.bat`에 `git pull --rebase`를 넣어뒀습니다. 이 줄을 지우면 push가 거부됩니다.

**⑥ 무시해도 되는 경고들**
- `LF will be replaced by CRLF` — 윈도우 줄바꿈 안내
- 명령창에 파일명이 `\355\225\234...` 로 보임 — git이 한글을 8진수로 표시하는 기본 동작. 실제 파일명은 멀쩡함

**⑦ 첫 push 때 GitHub 로그인 요구**
명령줄 git은 GitHub Desktop과 자격증명을 공유하지 않아, Git Credential Manager OAuth 인증을 한 번 해야 합니다. 이미 완료했으므로 다시 뜨지 않습니다.

---

## 8. 참고

- 저장소가 **Public**입니다. 공개되면 곤란한 파일은 `work` 폴더에 넣지 마세요.
- `index_main.html`에 광고 자리(728×90)가 잡혀 있습니다. 애드센스를 붙일 계획이라면 그 부분을 활용할 수 있습니다.
- 운영자는 영어수학학원을 운영 중이며, 이 사이트를 기반으로 유튜브 등 추가 수입을 만들려 하고 있습니다.
