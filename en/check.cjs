const assert=require('node:assert/strict');
const {types,generate,rational,exact}=require('./types.js');
const value=x=>{const [n,d]=rational(x);return n/d;};
let count=0;
for(const t of types)for(let seed=0;seed<100;seed++){
 const rows=generate(t.id,seed);
 assert.equal(rows.length,20,t.id);
 assert.equal(new Set(rows.map(p=>`${p.a}:${p.b}`)).size,20,t.id);
 assert.deepEqual(rows,generate(t.id,seed));
 for(const p of rows){
 const a=value(p.a),b=value(p.b);
 if(p.op==='compare')assert.equal(p.answer,a<b?'<':a>b?'>':'=');
 else if(p.op==='missing')assert.equal(p.answer,b);
 else if(String(p.answer).includes(' R ')){
 const [q,r]=String(p.answer).split(' R ').map(Number);assert.equal(q*b+r,a);assert.ok(r>=0&&r<b);
 }else{
 const expected=p.op==='+'?a+b:p.op==='−'?a-b:p.op==='×'?a*b:a/b;
 assert.ok(Math.abs(value(p.answer)-expected)<1e-7,`${t.id}: ${a} ${p.op} ${b}`);
 }
 if(t.config?.kind==='natural'){
 assert.equal(String(p.a).length,t.config.da);assert.equal(String(p.b).length,t.config.db);
 if(t.config.code==='sub'||t.config.code==='div')assert.ok(a>=b);
 }
 if(t.config?.kind==='fraction'){
 const d=String(p.a).split('/')[1],e=String(p.b).split('/')[1];
 assert.equal(d===e,t.config.same);
 }
 if(t.family==='Decimals'){
 const da=t.config.dp??t.config.da,db=t.config.dp??t.config.db;
 assert.equal((String(p.a).split('.')[1]||'').length,da);
 assert.equal((String(p.b).split('.')[1]||'').length,db);
 if(p.op==='÷'){const [n,d]=exact(p.a,p.b,p.op);assert.equal((n*100)%d,0,t.id);assert.ok((String(p.answer).split('.')[1]||'').length<=2);}
 }
 count++;
 }
}
console.log(`${types.length} types: ${count} questions passed arithmetic, uniqueness, deterministic generation, and preset checks.`);
