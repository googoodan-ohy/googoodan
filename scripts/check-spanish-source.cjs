const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const load=(c,files)=>files.forEach(f=>vm.runInContext(fs.readFileSync(f,'utf8'),c));
const c={};vm.createContext(c);load(c,['ko/catalog.js','ko/engine.js','es/reuse/unit-catalog.js']);
const tr=s=>String(s).replaceAll('삼각형','triángulo').replaceAll('사각형','cuadrilátero').replaceAll('원','círculo').replaceAll('선분','segmento').replaceAll('반직선','semirrecta').replaceAll('직선','recta').replace(/(\d+)시\s*(\d+)분/g,(_,h,m)=>h+':'+m.padStart(2,'0')).replaceAll('바른 답:','Respuesta correcta:').replaceAll('예각','agudo').replaceAll('직각','recto').replaceAll('둔각','obtuso').replaceAll('아니요','No').replaceAll('예','Sí').replace(/(\d)\.(\d)/g,'$1,$2');let count=0;
for(const[id,g,n,name,src,skill]of c.EsDefinitions)for(let seed=0;seed<30;seed++){
const a=c.KoMath.generate(id,0,seed,3),b=c.EsSourceMath.generate(src,0,seed,3,[0,1,2].map(mode=>({skill,mode})));
a.forEach((s,i)=>s.questions.forEach((q,j)=>{assert.equal(q.answer,tr(b[i].questions[j].answer));assert.equal(JSON.stringify(q.check),JSON.stringify(b[i].questions[j].check));assert(!/[가-힣]|undefined|NaN/.test(q.prompt+q.task+q.reason+q.visual+q.answer));count++;}));}
const d={};vm.createContext(d);load(d,['en/types.js','es/reuse/drill-catalog.js','ko/drill-engine.js']);const rows=d.DrillEngine.rows;load(d,['es/reuse/drill-localize.js']);let drills=0;
for(const p of d.DrillCatalog.units.flatMap(u=>u.drills))for(let seed=0;seed<40;seed++){
const a=d.DrillEngine.rows(p,seed,4),b=rows(p,seed,4);a.forEach((q,i)=>{if(String(b[i].answer).includes('묶음'))assert.deepEqual(String(q.answer).match(/\d+/g),String(b[i].answer).match(/\d+/g));else assert.equal(q.answer,b[i].answer);assert.equal(q.work,typeof b[i].work==='string'?b[i].work.replaceAll(' 나머지 ',' resto '):b[i].work);for(const k of ['a','b','op','mask'])assert.equal(q[k],b[i][k]);assert(!/[가-힣]|undefined|NaN/.test((q.prompt||'')+(q.work||'')+q.answer));drills++;});}
console.log('PASS '+count+' activity answers and '+drills+' drill questions against the original Korean generators');
