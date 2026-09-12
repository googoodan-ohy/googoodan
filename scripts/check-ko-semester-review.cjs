// Keep old review URLs usable without listing the same four worksheets three times.
// Run: node scripts/check-ko-semester-review.cjs
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=file=>fs.readFileSync(path.join(root,file),'utf8');
const context=vm.createContext({});context.window=context;
for(const file of ['en/types.js','ko/catalog.js','ko/drill-catalog.js','ko/drill-engine.js'])vm.runInContext(read(file),context,{filename:file});
const sitemap=read('sitemap.xml');
const units=['5-1-1','5-1-2','5-1-4'];
const suffixes=['mul','div'].flatMap(op=>['horizontal','vertical'].map(layout=>'--review-natural-'+op+'-3-2-'+layout));
let pages=0,comparisons=0;
for(const suffix of suffixes){
 const representative=units[0]+suffix,canonical='https://googoodan.com/ko/print/drill-'+representative+'.html';
 assert(sitemap.includes('<loc>'+canonical+'</loc>'),'Missing representative sitemap URL');
 const reference=context.DrillCatalog.profiles.get(representative);assert(reference);
 for(const unit of units){
  const id=unit+suffix,url='https://googoodan.com/ko/print/drill-'+id+'.html',html=read('ko/print/drill-'+id+'.html');
  assert.equal(html.match(/<link rel="canonical" href="([^"]+)"/)?.[1],canonical,id+' canonical');
  assert(html.match(/<title>([^<]+)<\/title>/)?.[1].includes('학기 시작 복습'),id+' title');
  assert([...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)].some(m=>m[1].includes('학기 시작 복습')),id+' static heading');
  const entry=JSON.parse(html.match(/window\.WORKSHEET_ENTRY=(\{[^\n]*?\});/)?.[1]||'null');assert(entry);
  const query=new URLSearchParams(entry.query);assert.equal(query.get('unit'),'5-1-review');assert.equal(query.get('drill'),representative);
  if(unit!=='5-1-1'){
   assert(!sitemap.includes('<loc>'+url+'</loc>'),id+' duplicate sitemap URL');
   const profile=context.DrillCatalog.profiles.get(id);assert(profile,id+' legacy generator missing');
   for(let seed=1;seed<=20;seed++){
    const expected=context.DrillEngine.rows(reference,seed,48),actual=context.DrillEngine.rows(profile,seed,48);
    assert.equal(JSON.stringify(actual),JSON.stringify(expected),id+' seed '+seed+' differs from representative');comparisons+=actual.length;
   }
  }
  pages++;
 }
}
for(const unit of units){
 const html=read('ko/worksheets/'+unit+'.html');
 for(const suffix of suffixes)assert(!html.includes('/ko/print/drill-'+unit+suffix+'.html'),unit+' duplicate unit-list entry');
 assert(html.includes('/ko/drills.html?unit=5-1-review'),unit+' review navigation missing');
}
console.log(`PASS: ${pages} working review entries, 4 canonical representatives, 8 duplicate sitemap entries excluded; ${comparisons} generated questions identical.`);
