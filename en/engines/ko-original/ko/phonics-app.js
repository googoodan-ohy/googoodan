const raw = window.PhonicsData;
if (!raw || !Array.isArray(raw.patterns)) throw new Error('파닉스 단어은행을 불러오지 못했습니다.');

const query = new URLSearchParams(location.search);
const groups = document.querySelector('.groups');
const allPatterns = [...raw.patterns];
const allGrades = [...new Set(allPatterns.flatMap(p => p.stats.grades))].sort((a,b) => Number(a)-Number(b));
let selectedGrade = allGrades.includes(query.get('grade')) ? query.get('grade') : allGrades[0];
let selectedType = null;
let seed = Math.floor(Math.random() * 1e9);
let generation = 0;
let answers = false;
let imagesOnly = false;
let printBusy = false;
let printTimer = null;
let currentWords = [];
const artworkTurns = new Map();
const worksheetArtwork = new Map();
let artworkGeneration = -1;

const escape = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const escapeAttr = value => escape(value).replaceAll('"','&quot;').replaceAll("'",'&#39;');
const patternLabel = type => String(type?.title || type?.id || '파닉스').replaceAll('_',' ');
const normalizeWord = word => String(word).trim().toLowerCase();
const wordArtId = word => normalizeWord(word).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
function artForTurn(word, turn) {
 const id = wordArtId(word);
 const variants = window.PhonicsArtVariants?.[id]?.filter(item => item.file);
 if (variants?.length) {
  const wordOffset = [...id].reduce((value,char) => ((value * 31) + char.charCodeAt(0)) >>> 0,0);
  return variants[(seed + turn + wordOffset) % variants.length];
 }
 const file = window.PhonicsArt?.[id];
 return file ? {...window.PhonicsArtDetails?.[id],file} : null;
}
function chosenArt(word) {
 const id = wordArtId(word);
 return worksheetArtwork.has(id) ? worksheetArtwork.get(id) : artForTurn(word,artworkTurns.get(id)||0);
}
function prepareWorksheetArtwork(words) {
 if (artworkGeneration === generation) return;
 worksheetArtwork.clear();
 for (const item of words) {
  const id = wordArtId(item.word), turn = artworkTurns.get(id)||0;
  worksheetArtwork.set(id,artForTurn(item.word,turn));
  artworkTurns.set(id,turn+1);
 }
 artworkGeneration = generation;
}
const artPath = word => chosenArt(word)?.file;
const artDetails = word => chosenArt(word);

function seededRandom(value) {
 let t = value >>> 0;
 return () => {
  t += 0x6D2B79F5;
  let x = Math.imul(t ^ (t >>> 15), 1 | t);
  x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
  return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
 };
}
function buildSeededOrder(items, value) {
 const result = [...items], random = seededRandom(value);
 for (let i=result.length-1;i>0;i--) {
  const j = Math.floor(random()*(i+1));
  [result[i],result[j]] = [result[j],result[i]];
 }
 return result;
}
function typeWords(type=selectedType, grade=selectedGrade) {
 const unique = new Map();
 for (const item of type?.words || []) {
  if (item.grade && String(item.grade) !== String(grade)) continue;
  const word = normalizeWord(item.word);
  if (word && !unique.has(word)) unique.set(word,{...item,word});
 }
 return [...unique.values()];
}
function availableWords(type=selectedType, grade=selectedGrade) {
 const words = typeWords(type,grade);
 return imagesOnly ? words.filter(item => artPath(item.word)) : words;
}
function worksheetWordCount(total) {
 return total <= 2 ? total : Math.min(8,total-1);
}
function chooseWords() {
 const pool = buildSeededOrder(availableWords(),seed);
 if (!pool.length) return [];
 const offset = generation % pool.length;
 const rotated = [...pool.slice(offset),...pool.slice(0,offset)];
 return rotated.slice(0,worksheetWordCount(pool.length));
}
function resetWords() {
 seed = Math.floor(Math.random()*1e9);
 generation = 0;
 artworkTurns.clear();
 worksheetArtwork.clear();
 artworkGeneration = -1;
}
function regenerateWords() {
 if (!canRegenerate() || printBusy) return;
 generation += 1;
 clearPrintBundle();
 render();
}
function canRegenerate() {
 const pool=availableWords();
 return pool.length>1 || (pool.length===1 && (window.PhonicsArtVariants?.[wordArtId(pool[0].word)]?.length||0)>1);
}
function filterTypeList(grade) {
 return allPatterns.filter(p => p.stats.grades.includes(String(grade)))
  .sort((a,b) => String(a.id).localeCompare(String(b.id),'en'));
}
function selectType(typeId,grade) {
 selectedGrade = grade;
 const available = filterTypeList(grade);
 selectedType = available.find(p => p.id === typeId) || available[0];
 resetWords();
 clearPrintBundle();
 updateAddress();
 menu();
 render();
}
function updateAddress() {
 const params = new URLSearchParams(location.search);
 params.set('grade',selectedGrade);
 if (selectedType?.id) params.set('type',selectedType.id);
 try { history.replaceState({type:selectedType?.id},'',`?${params}`); }
 catch { /* Local file previews may prevent URL history replacement. */ }
}
function menu() {
 groups.innerHTML = '';
 const editionNav = document.createElement('nav');
 editionNav.className = 'edition-tabs';
 editionNav.setAttribute('aria-label','문제지 메뉴');
 editionNav.innerHTML = '<a href="index.html">종합연산</a><a href="drills.html">학년단원별연산</a><a href="units.html">학년단원별유형</a><a href="phonics.html" aria-current="page">영어파닉스</a>';
 groups.append(editionNav);
 const gradeHeading = document.createElement('div');
 gradeHeading.className = 'menu-step';
 gradeHeading.innerHTML = '<span>1</span><div><strong>단계 선택</strong><small>학습 순서에 맞는 단계를 골라 주세요.</small></div>';
 groups.append(gradeHeading);
 const gradeRow = document.createElement('div');
 gradeRow.className = 'filter-row';
 gradeRow.setAttribute('aria-label','단계 선택');
 for (const grade of allGrades) {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = grade+'단계';
  button.setAttribute('aria-pressed',selectedGrade === grade);
  button.onclick = () => selectType(null,grade);
  gradeRow.append(button);
 }
 groups.append(gradeRow);
 const typeHeading = document.createElement('div');
 typeHeading.className = 'menu-step';
 typeHeading.innerHTML = '<span>2</span><div><strong>소리 유형 선택</strong><small>각 유형의 준비된 그림 수를 확인할 수 있어요.</small></div>';
 groups.append(typeHeading);
 const typeRow = document.createElement('div');
 typeRow.className = 'choices';
 typeRow.setAttribute('aria-label','소리 유형 선택');
 for (const type of filterTypeList(selectedGrade)) {
  const words = typeWords(type,selectedGrade);
  const ready = words.filter(item => artPath(item.word)).length;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'choice';
  button.dataset.id = type.id;
  button.innerHTML = `<span class="example">${escape(patternLabel(type))}</span><small>그림 ${ready} / 전체 ${words.length}단어</small>`;
  if (selectedType?.id === type.id) button.setAttribute('aria-current','page');
  button.onclick = () => selectType(type.id,selectedGrade);
  typeRow.append(button);
 }
 groups.append(typeRow);
}
function creditMarkup(words) {
 const groups = new Map();
 words.forEach((item,index) => {
  const picture=artDetails(item.word),source=window.PhonicsArtSources?.[picture?.sourceId];
  if(!picture?.file||!source)return;
  const author=picture.author||source.author,key=picture.sourceId+'|'+author;
  if(!groups.has(key))groups.set(key,{source,author,pictures:[]});
  groups.get(key).pictures.push({number:index+1,url:picture.sourceUrl||source.url});
 });
 return [...groups.values()].map(({source,author,pictures}) => {
  const authorText=escape(author)+(source.authorUrl?` · <a href="${escapeAttr(source.authorUrl)}">${escape(source.authorUrl.replace(/^https?:\/\//,'').replace(/\/$/,''))}</a>`:'');
  // Neutral link labels preserve attribution without giving away an English answer in a filename.
  const originals=pictures.map(picture=>`<a href="${escapeAttr(picture.url)}">그림 ${picture.number}</a>`).join(' · ');
  return `<p>${escape(source.name)}${source.version&&source.version.length<15 ? ' '+escape(source.version) : ''} · 저작자: ${authorText} · <a href="${escapeAttr(source.licenseUrl)}">${escape(source.license)}</a> · 원본: ${originals} · 원본 변경 없음.${source.usageNote?' '+escape(source.usageNote):''}</p>`;
 }).join('');
}
function fillPaper(paper,words,showAnswers) {
 const ready = words.filter(item => artPath(item.word)).length;
 const missing = words.length-ready;
 const colorRequired = words.some(item => artDetails(item.word)?.imageRole === 'color-swatch' || artDetails(item.word)?.requiresColor);
 const hasContext = words.some(item => artDetails(item.word)?.contextHint);
 paper.querySelector('#sheet-title').textContent = `Phonics · ${patternLabel(selectedType)}`;
 paper.querySelector('#mode').textContent = showAnswers ? '정답지' : '연습 문제지';
 const instructions = showAnswers
  ? '같은 순서의 단어를 확인하고 문제지를 채점해 주세요.'
  : missing ? '그림이 있는 칸은 단어를 쓰고, 그림 준비 중인 칸은 제시된 단어를 읽고 써 보세요.'
  : hasContext ? '그림과 상황 힌트를 보고 알맞은 영어 단어를 써 보세요.' : '그림을 보고 알맞은 영어 단어를 써 보세요.';
 paper.querySelector('#instructions').textContent = instructions + (colorRequired ? ' 색상 문제는 컬러로 인쇄해 주세요.' : '');
 const sheet = paper.querySelector('.problems');
 sheet.className = 'problems phonics-problem-set';
 sheet.style.setProperty('--phonics-rows',String(Math.max(1,Math.ceil(words.length/2))));
 sheet.innerHTML = words.length ? words.map((item,index) => {
  const path = artPath(item.word), details = artDetails(item.word);
  const illustration = path
   ? `<img src="${escapeAttr(path)}" alt="${escapeAttr(details?.meaning || item.word)}" loading="eager" decoding="sync" />`
   : `<div class="token"><span>그림 준비 중</span><b>${escape(item.word)}</b></div><small>단어를 읽고 써 보세요</small>`;
  return `<div class="problem phonics-item">
   <span class="number">${index+1}.</span>
   <div class="phonics-card">
    <div class="phonics-art${path ? ' has-art' : ' is-placeholder'}" data-word="${escapeAttr(item.word)}" data-art-id="${escapeAttr(wordArtId(item.word))}">${illustration}</div>
    <div class="phonics-word-line">
     ${details?.contextHint ? `<p class="phonics-context-hint"><span>상황 힌트</span>${escape(details.contextHint)}</p>` : ''}
     <div class="label">단어</div>
     ${showAnswers ? `<span class="phonics-word phonics-answer">${escape(item.word)}</span>` : '<span class="phonics-word"><span class="phonics-blank" aria-label="단어 쓰는 칸"></span></span>'}
     <p class="phonics-meta">${escape(selectedGrade)}단계 · ${escape(patternLabel(selectedType))} · ${item.required ? '필수 단어' : '확장 단어'}</p>
    </div>
   </div>
  </div>`;
 }).join('') : `<div class="phonics-empty"><strong>이 유형은 아직 준비된 그림이 없어요.</strong><p>전체 단어를 보면 그림 자리와 함께 읽고 쓰는 연습을 할 수 있어요.</p><button type="button" data-show-all>전체 단어 보기</button></div>`;
 paper.querySelector('.finish-line').hidden = !words.length;
 paper.querySelector('#set').textContent = `Set ${seed}-${generation+1} · ${words.length}문항`;
 paper.querySelector('.phonics-credits').innerHTML = creditMarkup(words);
 const showAll = paper.querySelector('[data-show-all]');
 if (showAll) showAll.onclick = () => setImagesOnly(false);
}
function render() {
 currentWords = chooseWords();
 prepareWorksheetArtwork(currentWords);
 const all = typeWords(), ready = all.filter(item => artPath(item.word)).length;
 const missing = currentWords.filter(item => !artPath(item.word)).length;
 document.title = `${patternLabel(selectedType)} 파닉스 | 구구단닷컴`;
 document.querySelector('meta[name="description"]').content = `${patternLabel(selectedType)} 영어 파닉스 워크시트 만들기`;
 document.querySelector('#questions').setAttribute('aria-pressed',!answers);
 document.querySelector('#answers').setAttribute('aria-pressed',answers);
 document.querySelector('#selected-summary').textContent = `${selectedGrade}단계 · ${patternLabel(selectedType)}`;
 document.querySelector('#selected-count').textContent = `${currentWords.length}문항 · ${answers ? '정답지' : '문제지'}`;
 document.querySelector('#art-availability').textContent = `선택한 유형: 그림 ${ready} / 전체 ${all.length}단어`;
 document.querySelector('#worksheet-art-status').textContent = currentWords.length
  ? `현재 문제지: 그림 ${currentWords.length-missing}개${missing ? ` · 그림 자리 ${missing}개 준비 중` : ' · 모든 그림 준비 완료'}`
  : '그림 있는 단어가 준비되면 이곳에 문제지가 표시됩니다.';
 const poolSize = availableWords().length;
 const nextButton = document.querySelector('#new');
 nextButton.disabled = !canRegenerate() || printBusy;
 nextButton.textContent = poolSize === 2 ? '↻ 두 단어 순서 바꾸기' : poolSize === 1 ? canRegenerate() ? '↻ 같은 단어 다른 그림' : '변환할 다른 단어가 없어요' : '↻ 같은 유형 새 단어';
 nextButton.title = !canRegenerate() ? '다른 유형을 고르거나 전체 단어를 표시해 주세요.' : '';
 document.querySelector('#art-only').checked = imagesOnly;
 fillPaper(document.querySelector('.paper'),currentWords,answers);
 document.querySelector('#status').textContent = `${patternLabel(selectedType)} · ${currentWords.length}문항 · 그림 ${currentWords.length-missing}개 · 그림 자리 ${missing}개`;
 updatePrintSelection();
}
function setImagesOnly(value) {
 imagesOnly = value;
 resetWords();
 clearPrintBundle();
 render();
}
function clearPrintBundle() {
 if (printTimer) { clearTimeout(printTimer); printTimer = null; }
 document.querySelector('#print-bundle')?.remove();
 document.body.classList.remove('printing-bundle');
}
function preparePrintBundle() {
 if (document.querySelector('#print-bundle')) return document.querySelector('#print-bundle');
 if (!currentWords.length) return null;
 const modes = [];
 if (document.querySelector('#print-worksheet').checked) modes.push(false);
 if (document.querySelector('#print-answer').checked) modes.push(true);
 if (!modes.length) return null;
 const bundle = document.createElement('div');
 bundle.id = 'print-bundle';
 for (const mode of modes) {
  const page = document.querySelector('.paper').cloneNode(true);
  fillPaper(page,currentWords,mode);
  page.querySelectorAll('[id]').forEach(element => element.removeAttribute('id'));
  bundle.append(page);
 }
 document.body.append(bundle);
 document.body.classList.add('printing-bundle');
 return bundle;
}
function updatePrintSelection() {
 const selected = document.querySelector('#print-worksheet').checked || document.querySelector('#print-answer').checked;
 document.querySelector('#print').disabled = printBusy || !currentWords.length || !selected;
}
function waitForImages(root) {
 return Promise.all([...root.querySelectorAll('img')].map(img => new Promise((resolve,reject) => {
  if (img.complete) { img.naturalWidth ? resolve() : reject(new Error('이미지를 불러오지 못했습니다.')); return; }
  const finish = error => {
   clearTimeout(timer);
   img.removeEventListener('load',loaded);
   img.removeEventListener('error',failed);
   error ? reject(error) : resolve();
  };
  const loaded = () => finish();
  const failed = () => finish(new Error('이미지를 불러오지 못했습니다.'));
  const timer = setTimeout(() => finish(new Error('이미지 로딩 시간이 길어지고 있습니다.')),10000);
  img.addEventListener('load',loaded,{once:true});
  img.addEventListener('error',failed,{once:true});
 })));
}
function setPrintBusy(value) {
 printBusy = value;
 document.querySelector('#print').textContent = value ? '그림 확인 중…' : '인쇄 ↗';
 document.querySelectorAll('.groups button,#questions,#answers,#art-only,#print-worksheet,#print-answer').forEach(button => { button.disabled = value; });
 document.querySelector('#new').disabled = value || !canRegenerate();
 updatePrintSelection();
}
document.querySelector('#questions').onclick = () => { answers=false; clearPrintBundle(); render(); };
document.querySelector('#answers').onclick = () => { answers=true; clearPrintBundle(); render(); };
document.querySelector('#new').onclick = regenerateWords;
document.querySelector('#art-only').onchange = event => setImagesOnly(event.target.checked);
for (const id of ['print-worksheet','print-answer']) document.querySelector('#'+id).onchange = () => { clearPrintBundle(); updatePrintSelection(); };
document.querySelector('#print').onclick = async () => {
 if (document.querySelector('#print').disabled) return;
 setPrintBusy(true);
 const printButton = document.querySelector('#print');
 try {
  const bundle = preparePrintBundle();
  if (!bundle) return;
  await waitForImages(bundle);
  if (document.fonts?.ready) await document.fonts.ready;
  window.print();
  printTimer = setTimeout(clearPrintBundle,60000);
 } catch (error) {
  clearPrintBundle();
  document.querySelector('#worksheet-art-status').textContent = '그림을 불러오지 못해 인쇄를 멈췄어요. 페이지를 새로고침한 뒤 다시 눌러 주세요.';
  document.querySelector('#status').textContent = error.message;
 } finally {
  setPrintBusy(false);
  printButton.focus();
 }
};
window.addEventListener('beforeprint',() => { preparePrintBundle(); });
window.addEventListener('afterprint',clearPrintBundle);
window.addEventListener('popstate',() => {
 const params = new URLSearchParams(location.search), grade = params.get('grade');
 if (allGrades.includes(grade)) selectedGrade = grade;
 selectedType = filterTypeList(selectedGrade).find(type => type.id === params.get('type')) || filterTypeList(selectedGrade)[0];
 resetWords();
 clearPrintBundle();
 menu();
 render();
});
selectedType = filterTypeList(selectedGrade).find(type => type.id === query.get('type')) || filterTypeList(selectedGrade)[0];
menu();
render();
