const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const ctx={URLSearchParams};vm.createContext(ctx);for(const p of ['ko/catalog.js','ko/engine.js','en/types.js','en/banks/coverage.js'])vm.runInContext(fs.readFileSync(p,'utf8'),ctx);
let checked=0;
const gcd=(a,b)=>b?gcd(b,a%b):a;
for(const def of ctx.CoveragePractice.definitions)for(const skill of def[3])for(let seed=1;seed<=30;seed++){
 ctx.CoveragePractice.setSkill(skill);const sections=ctx.KoMath.generate('coverage:'+def[0],0,seed,1);
 for(const {questions:[q]}of sections){
  assert(!/[가-힣]|undefined|NaN/.test(q.prompt+q.answer+q.reason+q.visual));assert(q.answer.length);
  const v=q.check;
  if(v?.kind==='measure'){
   const {a,b,c}=v;let expected;
   switch(skill){case 'perimeter':expected=2*(a+b);break;case 'surface':expected=2*(a*b+a*c+b*c);break;case 'area-triangle':case 'area-rhombus':expected=a*b/2;break;case 'area-trapezoid':expected=(a+c)*b/2;break;default:expected=a*b;}
   assert.equal(parseFloat(q.answer),expected);
  }
  const nums=[...q.visual.matchAll(/<span>(\d+)<\/span>/g)].map(x=>+x[1]);
  if(skill==='reduce'){const [n,d]=nums,[an,ad=1]=q.answer.split('/').map(Number);assert.equal(n*ad,d*an);assert.equal(gcd(an,ad),1);}
  if(skill==='fraction-compare'||skill==='fraction-compare-unlike'){const [a,b,c,d]=nums;assert.equal(q.answer,a*d===c*b?'=':a*d>c*b?'>':'<');assert([2,3,4,5,6,8,10,12,100].includes(b)&&[2,3,4,5,6,8,10,12,100].includes(d));}
  if(skill==='fraction-model'){const [n,d]=q.answer.split('/').map(Number);assert.equal((q.visual.match(/<rect /g)||[]).length,d);assert.equal((q.visual.match(/fill="#8fc6c1"/g)||[]).length,n);assert([2,3,4,6,8].includes(d));}
  if(skill==='gcd'||skill==='lcm'){const [a,b]=q.prompt.match(/\d+/g).map(Number);assert.equal(+q.answer,skill==='gcd'?gcd(a,b):a*b/gcd(a,b));if(skill==='lcm')assert(a<=12&&b<=12);}
  if(skill==='mixed'||skill==='mixed-bracket'){const [a,b,c]=q.visual.replace(/<[^>]*>/g,'').match(/\d+/g).map(Number);assert.equal(+q.answer,skill==='mixed'?a+b*c:(a+b)*c);}
  checked++;
 }
 if(skill==='chance')assert.equal(new Set(sections.map(s=>s.questions[0].answer)).size,3);
}
const manifest=JSON.parse(fs.readFileSync('.work-english/coverage/manifest.json'));
for(const [id] of manifest.definitions){const html=fs.readFileSync('en/'+id+'.html','utf8');assert.equal((html.match(/<h1[ >]/g)||[]).length,1);assert(html.includes('https://googoodan.com/en/'+id+'.html'));for(const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g))JSON.parse(m[1]);for(const m of html.matchAll(/(?:src|href)="([^" ]+\.(?:js|css)[^" ]*)"/g))assert(m[1].includes('?v='),m[1]);}
console.log(`PASS: ${checked} generated questions; 15 static pages, JSON-LD and asset versions.`);
