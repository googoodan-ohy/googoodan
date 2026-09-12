const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const c={};vm.createContext(c);
for(const file of ['ko/art/catalog.js','ko/art.js','de/reuse/core-numbers.js','de/reuse/unit-catalog.js','de/reuse/carry-source.js','de/reuse/written-products-units.js'])vm.runInContext(fs.readFileSync(file,'utf8'),c);
assert(fs.readFileSync('de/reuse/carry-source.js','utf8').includes(fs.readFileSync('ko/banks/arithmetic-targets.js','utf8')));
let count=0;
for(const id of ['de-by-multiply-carry','de-by-divide-written'])for(const [p,spec] of c.KoMath.profiles(id).entries())for(let seed=0;seed<40;seed++){
  const original=c.DeCarrySource.generate(spec.source,spec.p,seed,3),out=c.KoMath.generate(id,p,seed,3);
  out.forEach((section,i)=>section.questions.forEach((q,j)=>{
    const {a,b,value,rem,op,target}=q.check;
    assert.equal(JSON.stringify(q.check),JSON.stringify(original[i].questions[j].check));
    assert.equal(q.answer,String(original[i].questions[j].answer).replaceAll('나머지','Rest'));
    assert(b>=2&&b<=9&&a>=10&&a<=999);
    if(op==='×'){
      assert.equal(a*b,value);let x=a,carry=0,carries=0;while(x){carry=Math.floor((x%10*b+carry)/10);if(carry)carries++;x=Math.floor(x/10);}assert.equal(carries,target);
    }else{assert.equal(b*value+rem,a);assert(rem>=0&&rem<b);assert.equal(rem>0,target.remainder);}
    assert(!/[가-힣]|undefined|NaN/.test(q.prompt+q.task+q.visual+q.reason+q.answer));count++;
  }));
}
console.log('PASS '+count+' original-source multiplication/division questions, range, carries, remainders and localization');
