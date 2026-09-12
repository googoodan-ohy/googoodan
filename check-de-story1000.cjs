const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
function context(){const c={KoMath:{profiles:()=>[],excludeArt(){}},KoCatalog:{units:[{id:'3-1-1',grade:3}]}};vm.createContext(c);for(const f of ['ko/art/catalog.js','ko/art.js','ko/banks/reading-stories.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c);return c;}
const original=context(),de=context();de.KoCatalog={units:[]};vm.runInContext(fs.readFileSync('de/reuse/story-units.js','utf8'),de);
let count=0;
for(const [id,sourceId,max]of [['de-by-stories12','1-1-3',9],['de-by-stories10012','1-2-6',99],['de-by-stories1000','3-1-1',999]])for(let p=0;p<6;p++)for(let seed=0;seed<40;seed++){
  const before=de.KoCatalog,sourceIndex=[0,2,4,1,3,5][p];
  const a=de.KoMath.generate(id,p,seed,3),b=original.KoMath.generate(sourceId,sourceIndex,seed,3);
  assert.equal(de.KoCatalog,before,'Source catalog must be restored');
  assert(!de.KoCatalog.units.some(x=>x.id==='3-1-1'),'Korean metadata must not enter menu');
  a.forEach((s,i)=>s.questions.forEach((q,j)=>{
    assert.equal(JSON.stringify(q.check),JSON.stringify(b[i].questions[j].check));
    const c=q.check;assert.equal(c.sum,c.a+c.b);assert.equal(c.difference,c.a-c.b);assert(c.sum<=max&&c.difference>=0);
    assert(!/[가-힣]|undefined|NaN/.test(q.prompt+q.task+q.visual+q.reason+q.answer));count++;
  }));
}
console.log('PASS '+count+' German story questions: original checks, range, localization and source catalog isolation');
