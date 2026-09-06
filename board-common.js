/* ============================================================
   구구단닷컴 공용 게시판 스크립트
   ------------------------------------------------------------
   board.html(이용후기) / notice.html(공지사항) / info.html(학습정보)
   3개 페이지가 이 파일 하나를 함께 사용합니다.
   각 페이지는 이 파일을 불러온 뒤 initBoard({...}) 한 번만 호출하면 됩니다.
   ============================================================ */

/* ---------------- Firebase 설정 ---------------- */
const firebaseConfig = {
  apiKey: "AIzaSyBtt3L-bM-qqt6wz-mSHH_WQ8JuKUc0cK0",
  authDomain: "googoodan-cce67.firebaseapp.com",
  projectId: "googoodan-cce67",
  storageBucket: "googoodan-cce67.firebasestorage.app",
  messagingSenderId: "352992873909",
  appId: "1:352992873909:web:6b32ed2221bd7ceb471dfc"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const googleProvider = new firebase.auth.GoogleAuthProvider();

/* ---------------- Cloudinary 설정 (이미지 첨부) ---------------- */
const CLOUDINARY_CLOUD_NAME = 'f1an26px';
const CLOUDINARY_UPLOAD_PRESET = 'googoodan_board';

/* ---------------- 관리자 계정 (공지사항/학습정보 글쓰기 권한) ---------------- */
const ADMIN_EMAIL = 'ohy0973@gmail.com';

const PAGE_SIZE = 15;
const SANITIZE_TAGS = ['p','br','strong','em','u','s','span','ol','ul','li','a','img','h1','h2','h3','blockquote','code','pre'];
const SANITIZE_ATTR = ['style','href','src','class','alt'];

let BOARD = null;
let currentUser = null;
let isAdmin = false;
let posts = [];
let lastDoc = null;
let noMore = false;
let currentComments = {};
let editingPostId = null;
let quillEditor = null;

/* ---------------- 유틸 ---------------- */
function escapeHtml(s){
  return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function sanitizeHtml(html){
  return DOMPurify.sanitize(html || '', { ALLOWED_TAGS: SANITIZE_TAGS, ALLOWED_ATTR: SANITIZE_ATTR });
}
function renderContent(p){
  // 새 글: contentHtml(리치 텍스트) / 예전 글: content(일반 텍스트)+imageUrl 둘 다 지원
  if(p.contentHtml){
    const div = document.createElement('div');
    div.innerHTML = sanitizeHtml(p.contentHtml);
    div.querySelectorAll('a').forEach(a => { a.target = '_blank'; a.rel = 'noopener noreferrer'; });
    return `<div class="post-rich">${div.innerHTML}</div>`;
  }
  const legacyImg = p.imageUrl ? `<img class="post-image" src="${escapeHtml(p.imageUrl)}" alt="첨부 이미지">` : '';
  return `<div class="post-plain">${escapeHtml(p.content || '')}</div>${legacyImg}`;
}
function fmtDate(ts){
  if(!ts || !ts.toDate) return '방금 전';
  const d = ts.toDate();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function uploadImage(file){
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  return fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData
  }).then(res => {
    if(!res.ok) throw new Error('이미지 업로드 실패');
    return res.json();
  }).then(data => data.secure_url);
}

/* ---------------- 초기화 ---------------- */
function initBoard(config){
  BOARD = Object.assign({
    collection: 'posts',   // Firestore 컬렉션 이름
    writeMode: 'open',     // 'open' = 로그인한 누구나 글쓰기 / 'admin' = 관리자만
    categories: null       // null이면 카테고리 선택 없음, 배열이면 드롭다운 표시
  }, config);
  BOARD.viewedThisSession = new Set();

  auth.onAuthStateChanged(user => {
    currentUser = user;
    isAdmin = !!(user && user.email === ADMIN_EMAIL);
    renderAuth();
    renderWriteButton();
  });

  initEditor();
  loadPosts();
}

function renderWriteButton(){
  const btn = document.getElementById('writeBtn');
  if(!btn) return;
  if(BOARD.writeMode === 'admin'){
    btn.classList.toggle('hidden', !isAdmin);
  }else{
    btn.classList.remove('hidden');
  }
}

/* ---------------- 로그인 ---------------- */
function googleLogin(){
  auth.signInWithPopup(googleProvider).catch(err => {
    console.error(err);
    alert('로그인에 실패했어요. 잠시 후 다시 시도해주세요.');
  });
}
function logout(){ auth.signOut(); }

function renderAuth(){
  const el = document.getElementById('authArea');
  if(!el) return;
  if(currentUser){
    const initial = (currentUser.displayName || '?').charAt(0);
    el.innerHTML = `
      <div class="user-chip">
        <span class="av">${escapeHtml(initial)}</span>
        ${escapeHtml(currentUser.displayName || '사용자')}
        <button class="logout" onclick="logout()">로그아웃</button>
      </div>`;
  }else{
    el.innerHTML = `<div class="btn-login" onclick="googleLogin()">🟢 구글로 로그인</div>`;
  }
}

/* ---------------- 리치 텍스트 에디터 (Quill) ---------------- */
function initEditor(){
  quillEditor = new Quill('#wEditor', {
    theme: 'snow',
    modules: { toolbar: '#wToolbar' },
    placeholder: '내용을 입력하세요'
  });
  quillEditor.getModule('toolbar').addHandler('image', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
      const file = input.files[0];
      if(!file) return;
      if(!file.type.startsWith('image/')){ alert('이미지 파일만 첨부할 수 있어요'); return; }
      if(file.size > 5 * 1024 * 1024){ alert('이미지 용량은 5MB 이하로 올려주세요'); return; }
      const range = quillEditor.getSelection(true);
      uploadImage(file).then(url => {
        quillEditor.insertEmbed(range.index, 'image', url, 'user');
        quillEditor.setSelection(range.index + 1);
      }).catch(err => {
        console.error(err);
        alert('이미지 업로드에 실패했어요');
      });
    };
    input.click();
  });
}

/* ---------------- 게시글 목록 ---------------- */
function loadPosts(){
  document.getElementById('postList').innerHTML = '<div class="loading" style="padding:30px 0;">불러오는 중...</div>';
  db.collection(BOARD.collection).orderBy('createdAt', 'desc').limit(PAGE_SIZE).get()
    .then(snap => {
      posts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      lastDoc = snap.docs[snap.docs.length - 1] || null;
      noMore = snap.docs.length < PAGE_SIZE;
      renderList();
    })
    .catch(err => {
      console.error(err);
      document.getElementById('postList').innerHTML = '<div class="loading">게시글을 불러오지 못했어요. 잠시 후 다시 시도해주세요.</div>';
    });
}
function loadMore(){
  if(!lastDoc || noMore) return;
  db.collection(BOARD.collection).orderBy('createdAt', 'desc').startAfter(lastDoc).limit(PAGE_SIZE).get()
    .then(snap => {
      const more = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      posts = posts.concat(more);
      lastDoc = snap.docs[snap.docs.length - 1] || lastDoc;
      noMore = snap.docs.length < PAGE_SIZE;
      renderList();
    });
}
function renderList(){
  const list = document.getElementById('postList');
  document.getElementById('postCount').textContent = `전체 글 ${posts.length}개`;
  document.getElementById('moreBtn').classList.toggle('hidden', noMore);

  if(posts.length === 0){
    list.innerHTML = '<div class="loading" style="padding:30px 0;">아직 등록된 글이 없어요.</div>';
    return;
  }
  list.innerHTML = '';
  posts.forEach(p => {
    const item = document.createElement('div');
    item.className = 'post-item';
    const catBadge = BOARD.categories
      ? `<span class="badge-cat">${escapeHtml(p.category || BOARD.categories[0])}</span>`
      : '';
    item.innerHTML = `
      <div class="post-row">
        ${catBadge}
        <span class="post-title">${escapeHtml(p.title)}</span>
        <span class="post-meta">
          <span>${escapeHtml(p.authorName || '익명')}</span><span>${fmtDate(p.createdAt)}</span><span>💬 ${p.commentCount || 0}</span><span>조회 ${p.views || 0}</span>
        </span>
      </div>
      <div class="post-detail hidden" id="detail-${p.id}"></div>
    `;
    item.querySelector('.post-row').onclick = () => toggleDetail(p.id);
    list.appendChild(item);
  });
}

/* ---------------- 게시글 상세 + 댓글 ---------------- */
function toggleDetail(id){
  const box = document.getElementById(`detail-${id}`);
  const wasOpen = !box.classList.contains('hidden');
  document.querySelectorAll('.post-detail').forEach(b => b.classList.add('hidden'));
  if(wasOpen) return;

  const p = posts.find(x => x.id === id);
  box.classList.remove('hidden');
  box.innerHTML = '<div class="loading" style="padding:10px 0;">불러오는 중...</div>';
  bumpViews(id);

  db.collection(BOARD.collection).doc(id).collection('comments').orderBy('createdAt', 'asc').get()
    .then(snap => {
      const comments = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const canManagePost = currentUser && (currentUser.uid === p.authorUid || isAdmin);
      currentComments = {};
      comments.forEach(c => { currentComments[c.id] = c; });
      box.innerHTML = `
        <div class="detail-meta">
          <span>${escapeHtml(p.authorName || '익명')} · ${fmtDate(p.createdAt)} · 조회 ${p.views || 0}</span>
          ${canManagePost ? `<span class="detail-actions">
            <button onclick="editPost('${id}')">수정</button>
            <button class="danger" onclick="deletePost('${id}')">삭제</button>
          </span>` : ''}
        </div>
        ${renderContent(p)}
        <div class="comment-list">
          ${comments.map(c => `
            <div class="comment-item" id="comment-${c.id}">
              <span class="c-av">${escapeHtml((c.authorName||'?').charAt(0))}</span>
              <span class="c-body">
                <span class="c-author">${escapeHtml(c.authorName||'익명')}</span><span class="c-date">${fmtDate(c.createdAt)}</span>${currentUser && c.authorUid === currentUser.uid ? `<button class="c-edit" onclick="editComment('${id}','${c.id}')">수정</button>` : ''}${currentUser && (currentUser.uid === c.authorUid || isAdmin) ? `<button class="c-del" onclick="deleteComment('${id}','${c.id}')">삭제</button>` : ''}<br>
                <span class="c-text" id="ctext-${c.id}">${escapeHtml(c.text)}</span>
                <div class="c-edit-box hidden" id="cedit-${c.id}">
                  <input type="text" id="ceditInput-${c.id}">
                  <button class="save" onclick="saveCommentEdit('${id}','${c.id}')">저장</button>
                  <button class="cancel" onclick="cancelCommentEdit('${c.id}')">취소</button>
                </div>
              </span>
            </div>`).join('') || '<div style="color:var(--muted); font-size:12px;">아직 댓글이 없어요</div>'}
          ${currentUser ? `
            <div class="comment-write">
              <input type="text" id="cInput-${id}" placeholder="댓글을 남겨보세요">
              <button onclick="submitComment('${id}')">등록</button>
            </div>` : `
            <div class="comment-gate">
              댓글은 로그인 후 남길 수 있어요
              <div class="btn-login" onclick="googleLogin()">🟢 구글로 로그인</div>
            </div>`}
        </div>
      `;
    });
}

function bumpViews(postId){
  if(BOARD.viewedThisSession.has(postId)) return;
  BOARD.viewedThisSession.add(postId);
  db.collection(BOARD.collection).doc(postId).update({
    views: firebase.firestore.FieldValue.increment(1)
  }).then(() => {
    const p = posts.find(x => x.id === postId);
    if(p) p.views = (p.views || 0) + 1;
  }).catch(()=>{});
}

/* ---------------- 댓글 ---------------- */
function submitComment(postId){
  if(!currentUser) return;
  const input = document.getElementById(`cInput-${postId}`);
  const text = input.value.trim();
  if(!text) return;
  input.disabled = true;

  db.collection(BOARD.collection).doc(postId).collection('comments').add({
    text,
    authorName: currentUser.displayName || '익명',
    authorUid: currentUser.uid,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => db.collection(BOARD.collection).doc(postId).update({
    commentCount: firebase.firestore.FieldValue.increment(1)
  })).then(() => {
    const p = posts.find(x => x.id === postId);
    if(p) p.commentCount = (p.commentCount || 0) + 1;
    toggleDetail(postId); toggleDetail(postId); // 새로고침
  }).catch(err => {
    console.error(err);
    alert('댓글 등록에 실패했어요');
    input.disabled = false;
  });
}
function editComment(postId, commentId){
  const c = currentComments[commentId];
  if(!c || !currentUser || currentUser.uid !== c.authorUid) return;
  document.getElementById(`ctext-${commentId}`).classList.add('hidden');
  const box = document.getElementById(`cedit-${commentId}`);
  box.classList.remove('hidden');
  const input = document.getElementById(`ceditInput-${commentId}`);
  input.value = c.text;
  input.focus();
}
function cancelCommentEdit(commentId){
  document.getElementById(`cedit-${commentId}`).classList.add('hidden');
  document.getElementById(`ctext-${commentId}`).classList.remove('hidden');
}
function saveCommentEdit(postId, commentId){
  if(!currentUser) return;
  const input = document.getElementById(`ceditInput-${commentId}`);
  const text = input.value.trim();
  if(!text) return;
  db.collection(BOARD.collection).doc(postId).collection('comments').doc(commentId).update({ text })
    .then(() => { toggleDetail(postId); toggleDetail(postId); })
    .catch(err => { console.error(err); alert('댓글 수정에 실패했어요'); });
}
function deleteComment(postId, commentId){
  if(!currentUser) return;
  if(!confirm('댓글을 삭제할까요?')) return;
  db.collection(BOARD.collection).doc(postId).collection('comments').doc(commentId).delete()
    .then(() => db.collection(BOARD.collection).doc(postId).update({
      commentCount: firebase.firestore.FieldValue.increment(-1)
    }))
    .then(() => {
      const p = posts.find(x => x.id === postId);
      if(p) p.commentCount = Math.max(0, (p.commentCount || 1) - 1);
      toggleDetail(postId); toggleDetail(postId);
    })
    .catch(err => { console.error(err); alert('댓글 삭제에 실패했어요'); });
}

/* ---------------- 글쓰기 / 수정 / 삭제 ---------------- */
function canWrite(){
  if(!currentUser) return false;
  return BOARD.writeMode === 'admin' ? isAdmin : true;
}

function openWrite(){
  if(currentUser && !canWrite()){
    alert('이 게시판은 관리자만 글을 쓸 수 있어요.');
    return;
  }
  editingPostId = null;
  quillEditor.setContents([]);
  document.querySelector('#writeLoggedIn h3').textContent = '새 글 쓰기';
  document.querySelector('.modal-actions .submit').textContent = '등록';
  document.getElementById('writeModal').classList.remove('hidden');
  document.getElementById('writeLoggedIn').classList.toggle('hidden', !currentUser);
  document.getElementById('writeLoggedOut').classList.toggle('hidden', !!currentUser);
}
function closeWrite(){
  document.getElementById('writeModal').classList.add('hidden');
  document.getElementById('wTitle').value = '';
  quillEditor.setContents([]);
  const catEl = document.getElementById('wCategory');
  if(catEl) catEl.selectedIndex = 0;
  editingPostId = null;
}
function editPost(id){
  const p = posts.find(x => x.id === id);
  if(!p || !currentUser || !(currentUser.uid === p.authorUid || isAdmin)) return;
  editingPostId = id;
  document.getElementById('writeModal').classList.remove('hidden');
  document.getElementById('writeLoggedIn').classList.remove('hidden');
  document.getElementById('writeLoggedOut').classList.add('hidden');
  const catEl = document.getElementById('wCategory');
  if(catEl) catEl.value = p.category || (BOARD.categories ? BOARD.categories[0] : '');
  document.getElementById('wTitle').value = p.title || '';
  quillEditor.root.innerHTML = sanitizeHtml(p.contentHtml || escapeHtml(p.content || '').replace(/\n/g, '<br>'));
  document.querySelector('#writeLoggedIn h3').textContent = '글 수정';
  document.querySelector('.modal-actions .submit').textContent = '수정 완료';
}
function submitPost(){
  if(!canWrite()) return;
  const title = document.getElementById('wTitle').value.trim();
  const rawHtml = quillEditor.root.innerHTML;
  const isEmpty = quillEditor.getText().trim().length === 0 && !/<img/.test(rawHtml);
  if(!title || isEmpty){ alert('제목과 내용을 입력해주세요'); return; }
  const contentHtml = sanitizeHtml(rawHtml);

  const btn = document.querySelector('.modal-actions .submit');
  const isEdit = !!editingPostId;
  btn.disabled = true; btn.textContent = isEdit ? '수정 중...' : '등록 중...';

  const data = { title, contentHtml };
  const catEl = document.getElementById('wCategory');
  if(catEl) data.category = catEl.value;

  const task = isEdit
    ? db.collection(BOARD.collection).doc(editingPostId).update(data)
    : db.collection(BOARD.collection).add({
        ...data,
        authorUid: currentUser.uid,
        authorName: currentUser.displayName || '익명',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        views: 0,
        commentCount: 0
      });

  task.then(() => {
    closeWrite();
    loadPosts();
  }).catch(err => {
    console.error(err);
    alert(isEdit ? '수정에 실패했어요. 잠시 후 다시 시도해주세요.' : '글 등록에 실패했어요. 잠시 후 다시 시도해주세요.');
  }).finally(() => {
    btn.disabled = false; btn.textContent = isEdit ? '수정 완료' : '등록';
  });
}
function deletePost(id){
  const p = posts.find(x => x.id === id);
  if(!p || !currentUser || !(currentUser.uid === p.authorUid || isAdmin)) return;
  if(!confirm('이 글을 삭제할까요? 댓글도 함께 삭제되고 되돌릴 수 없어요.')) return;

  db.collection(BOARD.collection).doc(id).collection('comments').get()
    .then(snap => {
      const batch = db.batch();
      snap.docs.forEach(d => batch.delete(d.ref));
      batch.delete(db.collection(BOARD.collection).doc(id));
      return batch.commit();
    })
    .then(() => { loadPosts(); })
    .catch(err => { console.error(err); alert('삭제에 실패했어요. 잠시 후 다시 시도해주세요.'); });
}
