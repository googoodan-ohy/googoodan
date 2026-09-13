// NODE_PATH must provide Playwright. TEST_BASE defaults to the local preview.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),base=process.env.TEST_BASE||'http://127.0.0.1:4181';
const out=path.resolve(process.env.TEST_OUT||path.join(root,'.work-english/ko-layout-proposal/checks-local'));
const c=vm.createContext({});
for(const f of ['en/types.js','ko/catalog.js','ko/drill-catalog.js','ko/drill-engine.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),c);
const profiles=c.DrillCatalog.units.flatMap(u=>u.drills.map(p=>({unit:u.id,...p}))).filter(p=>p.layout==='vertical'&&p.mode==='basic').map(p=>({...p,family:c.Worksheets.types.find(t=>t.id===p.id).family,q:c.Worksheets.generate(p.id,369125,1)[0]})).filter(p=>p.q.op==='÷'||p.family==='Decimals'&&p.q.op==='×').map(p=>({...p,count:p.q.op==='×'?12:p.family==='Decimals'?8:p.source==='natural-div-3-1'?9:12}));
const report={base,profiles:profiles.length,layoutChecks:0,pdfs:[],errors:[],modes:[],metadata:0};
const seeds=Array.from({length:20},(_,i)=>[369125,1,713,99999,12345678][i]??(i*7919+271));
async function ready(page,url){const r=await page.goto(base+url,{waitUntil:'domcontentloaded'});assert(r.ok());await page.waitForFunction(()=>window.DrillPage&&document.querySelector('.paper .problem'));await page.evaluate(()=>document.fonts.ready);return r;}
async function installChecks(page){await page.evaluate(()=>{
 window.writtenState=()=>{
  const paper=document.querySelector('.paper'),grid=paper.querySelector('.problems'),items=[...grid.children];
  const signature=items.map(el=>[el.querySelector('.number')?.textContent,el.querySelector('.long-division')?.getAttribute('aria-label')||[...el.querySelectorAll('.worked>div:not(.working)')].map(x=>x.textContent).join('|')]);
  const overflow=items.filter(el=>el.scrollHeight>el.clientHeight+1||el.scrollWidth>el.clientWidth+1).length;
  const context=GDWorksheetContext();
  const svgImageSafe=[...grid.querySelectorAll('svg.long-division')].every(svg=>{const css=getComputedStyle(svg);return parseFloat(css.marginLeft)===0&&parseFloat(css.marginRight)===0&&Number(svg.getAttribute('width'))>0&&Number(svg.getAttribute('height'))>0});
  return {context,count:items.length,signature,overflow,svgImageSafe,mode:paper.querySelector('#mode').textContent,rows:Worksheets.generate(context.drill,context.set,items.length)};
 };
 });}
(async()=>{
 fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const context=await browser.newContext({viewport:{width:1440,height:1100},acceptDownloads:true});
  await context.route('https://www.gstatic.com/firebasejs/**',r=>r.fulfill({status:200,contentType:'application/javascript',body:''}));
  await context.addInitScript(()=>{delete window.showSaveFilePicker});
  const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
  await ready(page,'/ko/drills.html?unit=3-2-3');await installChecks(page);
  for(const mode of ['desktop','mobile','print']){
   await page.setViewportSize(mode==='mobile'?{width:390,height:844}:{width:1440,height:1100});await page.emulateMedia({media:mode==='print'?'print':'screen'});
   for(const p of profiles){
    const rows=await page.evaluate(({p,seeds})=>seeds.map(seed=>{
     clearPrintBundle();DrillPage.set(p.unit,p.id,seed);document.querySelector('#answers').click();
     return writtenState();
    }),{p,seeds});
    for(let i=0;i<rows.length;i++){
     const s=rows[i];assert.equal(s.count,p.count,mode+' '+p.id+' count');assert.equal(s.overflow,0,mode+' '+p.id+' seed '+seeds[i]+' overflow');
     assert.equal(JSON.stringify(s.rows),JSON.stringify(c.Worksheets.generate(p.id,seeds[i],p.count)),p.id+' generator changed');
     assert.equal(s.signature.length,p.count);assert(s.svgImageSafe,mode+' '+p.id+' unsafe PDF SVG dimensions');report.layoutChecks++;
    }
   }
   report.modes.push(mode);console.log('PASS '+mode+': '+profiles.length*seeds.length+' layouts');
  }
  // Let page.pdf() switch to print media; forcing screen would print the menu too.
  await page.setViewportSize({width:1440,height:1100});await page.emulateMedia({media:null});
  for(const p of profiles){
   const response=await ready(page,'/ko/print/drill-'+p.id+'.html?set=369125');await installChecks(page);
   const raw=await response.text();
   assert(raw.includes('/ko/drill-density.css?v=20260913-written-density'));
   assert(raw.includes('drill-page.js?v=20260913-written-density'));
   assert.equal(await page.locator('meta[name=description]').getAttribute('content'),raw.match(/<meta name="description" content="([^"]*)"/)?.[1]);report.metadata++;
   let original;
   for(const answer of [false,true]){
    await page.locator(answer?'#answers':'#questions').click();
    const state=await page.evaluate(()=>writtenState());assert.equal(state.count,p.count);assert.equal(state.mode,answer?'정답지':'문제지');
    assert.equal(await page.locator('#print-answer').isChecked(),answer);assert.equal(await page.locator('#print-worksheet').isChecked(),!answer);
    if(original){assert.deepEqual(state.signature,original.signature);assert.deepEqual(state.rows,original.rows)}else original=state;
    await page.evaluate(()=>GDPreparePDF());
    const bundle=await page.locator('#print-bundle > .paper').evaluateAll(papers=>papers.map(p=>({count:p.querySelectorAll('.problem').length,mode:p.querySelector('#mode')?.textContent||p.querySelector('.paper-top').lastElementChild.textContent})));
    assert.equal(bundle.length,1);assert.equal(bundle[0].count,p.count);assert.equal(bundle[0].mode,answer?'정답지':'문제지');
    const filename=p.id+'-'+(answer?'a':'q')+'.pdf';await page.pdf({path:path.join(out,filename),format:'A4',printBackground:true});
    const after=await page.evaluate(()=>writtenState());assert.deepEqual(after.signature,state.signature);assert.equal(after.count,state.count);
    report.pdfs.push({file:filename,id:p.id,count:p.count,answer,rows:state.rows});
   }
  }
  await ready(page,'/ko/print/drill-3-2-3--3.html?set=369125');await installChecks(page);
  await page.locator('#worksheet-copies').fill('3');await page.locator('#print-worksheet').check();await page.locator('#print-answer').check();
  assert.equal((await page.evaluate(()=>writtenState())).mode,'정답지');
  await page.evaluate(()=>GDPreparePDF());
  const bundle=await page.locator('#print-bundle > .paper').evaluateAll(ps=>ps.map(p=>({count:p.querySelectorAll('.problem').length,signature:[...p.querySelectorAll('.long-division')].map(s=>s.getAttribute('aria-label'))})));
  assert.equal(bundle.length,6);for(let i=0;i<6;i+=2){assert.equal(bundle[i].count,9);assert.deepEqual(bundle[i],bundle[i+1])}
  assert.equal(new Set(bundle.map(p=>JSON.stringify(p.signature))).size,3);
  await page.pdf({path:path.join(out,'three-copies.pdf'),format:'A4',printBackground:true});report.copiesPages=6;
  await page.locator('#worksheet-copies').fill('1');await page.locator('#answers').click();
  const downloadEvent=page.waitForEvent('download',{timeout:90000});await page.locator('#save-pdf').click();const download=await downloadEvent;await download.saveAs(path.join(out,'download.pdf'));await page.waitForFunction(()=>!window.GDPDFBusy);report.download=true;
  assert.deepEqual(report.errors,[]);
  fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2));
  console.log(JSON.stringify({profiles:profiles.length,layoutChecks:report.layoutChecks,pdfs:report.pdfs.length,metadata:report.metadata,copies:6,download:true,errors:0}));
 }finally{await browser.close()}
})().catch(e=>{fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'failure.json'),JSON.stringify({message:e.message,stack:e.stack,report},null,2));console.error(e);process.exitCode=1});
