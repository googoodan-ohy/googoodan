const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');const ctx={URLSearchParams};vm.createContext(ctx);
for(const p of ['ko/art/catalog.js','ko/art.js','ko/banks/early-numbers.js','ko/banks/early-arithmetic.js','en/types.js','en/banks/early-activities.js'])vm.runInContext(fs.readFileSync(p,'utf8'),ctx);
let total=0;
for(const[id,title,methods]of ctx.EarlyActivities.definitions)for(const method of methods)for(let seed=0;seed<30;seed++){
 ctx.EarlyActivities.select(method);const sections=ctx.KoMath.generate('early:'+id,0,seed);
 for(const [i,section]of sections.entries()){
  const q=section.questions[0],source=ctx.EarlyActivities.sourceFor(method)(seed+i*7907);
  assert(!/[가-힣]|undefined|NaN/.test(q.prompt+q.task+q.visual+q.answer+q.reason),method);
  assert(q.visual.match(/data-art-id/g)?.length===source.visual.match(/data-art-id/g)?.length);
  const count=(q.visual.match(/class="object-icon/g)||[]).length;
  if(method==='count')assert.equal(count,+q.answer);
  if(method==='ten-frame')assert.equal(+q.answer,10-count);
  if(method==='picture-add'){const[a,b,c]=q.answer.match(/\d+/g).map(Number);assert.equal(a+b,c);assert.equal(count,c);}
  for(const m of q.visual.matchAll(/src="([^"]+)"/g)){assert(m[1].startsWith('/ko/art/'));assert(fs.existsSync(m[1].slice(1)),m[1]);}
  total++;
 }
}
for(const[id]of ctx.EarlyActivities.definitions){const s=fs.readFileSync('en/'+id+'.html','utf8');assert.equal((s.match(/<h1[ >]/g)||[]).length,1);for(const m of s.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g))JSON.parse(m[1]);assert(s.includes('property="og:image"'));assert(s.includes('www.pinterest.com/pin/create/button/'));}
console.log('PASS '+total+' translated activities, artwork paths, counts and static metadata');
