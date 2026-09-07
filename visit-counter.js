/* ============================================================
   구구단닷컴 방문자 카운터
   ------------------------------------------------------------
   index.html / index_main.html / board.html / notice.html / info.html
   5개 페이지가 이 파일 하나를 함께 씁니다.
   Firestore의 stats/visits 문서에 실제 방문 수를 기록·표시합니다.
   (board-common.js가 이미 firebase를 초기화한 페이지에서는 그 앱을 그대로 재사용합니다)
   ============================================================ */
(function(){
  if (!['googoodan.com','www.googoodan.com'].includes(location.hostname) || navigator.webdriver) return;
  let operatorExcluded = false;
  try { operatorExcluded = localStorage.getItem('gd_operator_excluded') === '1'; } catch {}
  if (typeof firebase === 'undefined') return;

  const firebaseConfig = {
    apiKey: "AIzaSyBtt3L-bM-qqt6wz-mSHH_WQ8JuKUc0cK0",
    authDomain: "googoodan-cce67.firebaseapp.com",
    projectId: "googoodan-cce67",
    storageBucket: "googoodan-cce67.firebasestorage.app",
    messagingSenderId: "352992873909",
    appId: "1:352992873909:web:6b32ed2221bd7ceb471dfc"
  };
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  const fsdb = firebase.firestore();
  const ref = fsdb.collection('stats').doc('visits');

  function todayStr(){
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }
  function renderVisit(today, total){
    const t = document.getElementById('visitToday');
    const a = document.getElementById('visitTotal');
    if(t) t.textContent = (today || 0).toLocaleString('ko-KR');
    if(a) a.textContent = (total || 0).toLocaleString('ko-KR');
  }

  const dateNow = todayStr();
  let alreadyCounted = false;
  try {
    alreadyCounted = localStorage.getItem('gd_lastVisit') === dateNow;
  } catch(e){ /* 시크릿 모드 등에서 localStorage 접근 불가 - 매번 카운트됨 */ }

  if(!alreadyCounted && !operatorExcluded){
    fsdb.runTransaction(tx => {
      return tx.get(ref).then(snap => {
        let total = 1, today = 1;
        if(snap.exists){
          const data = snap.data();
          total = (data.total || 0) + 1;
          today = (data.todayDate === dateNow) ? (data.today || 0) + 1 : 1;
        }
        tx.set(ref, { total, today, todayDate: dateNow }, { merge: true });
        return { total, today };
      });
    }).then(result => {
      try { localStorage.setItem('gd_lastVisit', dateNow); } catch(e){}
      renderVisit(result.today, result.total);
    }).catch(err => console.error('방문자 카운트 오류:', err));
  }else{
    ref.get().then(snap => {
      if(snap.exists){
        const data = snap.data();
        const today = (data.todayDate === dateNow) ? (data.today || 0) : 0;
        renderVisit(today, data.total);
      }
    }).catch(err => console.error('방문자 카운트 오류:', err));
  }
})();
