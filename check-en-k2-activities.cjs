const fs=require('fs');
const path=require('path');
const assert=require('assert');

process.chdir(__dirname);
global.Worksheets={types:[]};
require('./ko/art/catalog.js');
require('./ko/art.js');
const api=require('./en/banks/k2-activities.js');
const manifest=require('./en/k2-activity-manifest.json');
const newIds=new Set(['number-tracing','dot-to-dot-numbers','repeating-patterns','shape-sorting','compose-shapes','nonstandard-measurement','make-picture-graph','tally-mark-activities','odd-even-coloring','skip-counting-paths','addition-maze','fact-family-houses']);
const strip=html=>html.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&[a-z#0-9]+;/gi,' ').replace(/\s+/g,' ').trim();
const field=(html,re)=>html.match(re)?.[1]||'';
let generated=0,methods=0,pages=0;

assert.equal(manifest.pages.length,26,'manifest page count');
assert.equal(api.definitions.length,26,'engine page count');
assert.equal(api.definitions.filter(def=>newIds.has(def.id)).length,12,'new page count');

for(const def of api.definitions){
  for(let seed=1;seed<=100;seed++){
    api.select('all');
    const one=api.generate('k2:'+def.id,seed);
    const two=api.generate('k2:'+def.id,seed);
    assert.deepEqual(one,two,def.id+' must be deterministic for seed '+seed);
    assert.equal(one.length,def.taskCount,def.id+' task count');
    for(const section of one){
      const q=section.questions[0];
      for(const key of ['methodId','prompt','visual','task','answer','reason'])assert.ok(String(q[key]??'').trim(),def.id+' missing '+key);
      const serialized=JSON.stringify(q);
      assert.ok(!/undefined|NaN/.test(serialized),def.id+' invalid generated value');
      if(q.methodId.startsWith('skip-path-')){
        const step=Number(q.methodId.split('-').pop()),values=String(q.answer).match(/\d+/g).map(Number);
        assert.equal(values.length,10,'skip path length');
        for(let i=1;i<values.length;i++)assert.equal(values[i]-values[i-1],step,'skip path step');
        assert.ok(values.every(value=>value<=100),'skip path range');
      }
      if(q.methodId.startsWith('addition-maze-')){
        const target=Number(q.prompt.match(/equal (\d+)/)[1]);
        for(const fact of String(q.answer).split(' → ')){const [a,b]=fact.match(/\d+/g).map(Number);assert.equal(a+b,target,'addition maze path');}
      }
      if(q.methodId==='color-odd'||q.methodId==='color-even'){
        const parity=q.methodId==='color-odd'?1:0;
        assert.ok(String(q.answer).match(/\d+/g).map(Number).every(value=>value%2===parity),'odd/even answer');
      }
      generated++;
    }
  }
  for(const method of def.methods){
    api.select(method);
    const sections=api.generate('k2:'+def.id,7301);
    assert.ok(sections.every(section=>section.questions[0].methodId===method),def.id+' method filter '+method);
    methods++;
  }
  api.select('all');
  const file=path.join('en',def.id+'.html'),html=fs.readFileSync(file,'utf8'),url='https://googoodan.com/en/'+def.id+'.html';
  assert.equal(field(html,/<title>([^<]+)<\/title>/),def.title+' | Googoodan',def.id+' title');
  assert.equal(field(html,/<h1>([^<]+)<\/h1>/),def.title,def.id+' h1');
  assert.equal(field(html,/<link rel="canonical" href="([^"]+)"/),url,def.id+' canonical');
  const description=field(html,/<meta name="description" content="([^"]+)"/);
  assert.ok(description.length>=120&&description.length<=170,def.id+' description length '+description.length);
  const alternates=[...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)">/g)];
  assert.equal(alternates.length,6,def.id+' hreflang count');
  assert.deepEqual(Object.fromEntries(alternates.map(match=>[match[1],match[2]])),{en:url,ko:'https://googoodan.com/ko/',ja:'https://googoodan.com/ja/',fr:'https://googoodan.com/fr/',de:'https://googoodan.com/de/','x-default':'https://googoodan.com/'},def.id+' hreflang values');
  const jsonLd=[...html.matchAll(/<script(?: id="website-identity")? type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(match=>JSON.parse(match[1]));
  assert.ok(jsonLd.some(data=>data['@type']==='WebSite'&&data.name==='googoodan'),def.id+' website schema');
  assert.ok(jsonLd.some(data=>data['@type']==='LearningResource'&&data.url===url&&data.name===def.title),def.id+' learning resource schema');
  const resource=html.match(/<section class="seo-resource"[\s\S]*?<\/section>/)?.[0]||'';
  assert.ok(strip(resource).split(/\s+/).length>=250,def.id+' static guide too short');
  assert.ok(html.includes('k2-activities.js?v=20260913-answer-space-fix')&&html.includes('k2-activities.css?v=20260913-answer-space-fix'),def.id+' cache version');
  if(process.argv.includes('--with-previews')){
    const preview=path.join('en','activity-previews',def.id+'.png');
    assert.ok(fs.existsSync(preview),def.id+' preview missing');
    const bytes=fs.readFileSync(preview);assert.equal(bytes.readUInt32BE(16),1000,def.id+' preview width');assert.equal(bytes.readUInt32BE(20),1500,def.id+' preview height');
  }
  pages++;
}
console.log(JSON.stringify({pages,newPages:newIds.size,methods,seedRuns:api.definitions.length*100,generatedQuestions:generated,previewsChecked:process.argv.includes('--with-previews')},null,2));
