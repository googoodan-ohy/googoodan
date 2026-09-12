// Regression for unit/assessment preview, print selection and unchanged questions.
// Run with Playwright available through NODE_PATH. TEST_BASE can target deployment.
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{chromium}=require('playwright');
const base=process.env.TEST_BASE||'http://127.0.0.1:4181';
const out=process.env.TEST_OUT||'.work-english/ko-second-fix';fs.mkdirSync(out,{recursive:true});
let randomSeed=20260913;
function random(){randomSeed=(Math.imul(randomSeed,1664525)+1013904223)>>>0;return randomSeed/2**32}
function sample(prefix){const files=fs.readdirSync('ko/print').filter(f=>f.startsWith(prefix)&&f.endsWith('.html')).sort();for(let i=files.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[files[i],files[j]]=[files[j],files[i]]}return files.slice(0,20)}
const groups=[sample('unit-'),sample('test-')];
async function checkPage(page,file){
 const response=await page.goto(base+'/ko/print/'+file+'?set=369125');assert(response.ok(),file);
 await page.waitForFunction(()=>window.KoPreview&&document.querySelector('#sheet-view .sheet'));
 const context=await page.evaluate(()=>GDWorksheetContext());
 await page.locator('#answer').click();assert(await page.locator('#print-a').isChecked());assert(!await page.locator('#print-q').isChecked());
 assert(await page.locator('#sheet-view .sheet').evaluate(e=>e.classList.contains('answer-key')));
 const questionMarkup=await page.locator('#sheet-view .activities').innerHTML();
 const solutions=await page.locator('#sheet-view .solution').evaluateAll(els=>els.map(e=>({answer:[...e.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join(''),visible:getComputedStyle(e).visibility==='visible'})));
 assert(solutions.length>0&&solutions.every(s=>s.visible&&s.answer.trim()),file+' missing answers');
 const stem=file.replace(/\.html$/,'');
 await page.pdf({path:path.join(out,stem+'-a.pdf'),format:'A4',printBackground:true});
 assert.equal(await page.locator('#print-bundle > .sheet').count(),1,file);
 assert.equal(await page.locator('#print-bundle .activities').innerHTML(),questionMarkup,file+' printed answer order/numbers');
 assert(await page.locator('#print-bundle > .sheet').evaluate(e=>e.classList.contains('answer-key')));
 await page.locator('#worksheet').click();assert(await page.locator('#print-q').isChecked());assert(!await page.locator('#print-a').isChecked());
 assert.equal(await page.locator('#sheet-view .activities').innerHTML(),questionMarkup,file+' question/answer order/numbers');
 assert(await page.locator('#sheet-view .solution').evaluateAll(els=>els.every(e=>getComputedStyle(e).visibility==='hidden')));
 await page.pdf({path:path.join(out,stem+'-q.pdf'),format:'A4',printBackground:true});
 assert.equal(await page.locator('#print-bundle .activities').innerHTML(),questionMarkup,file+' printed question order/numbers');
 assert(!await page.locator('#print-bundle > .sheet').evaluate(e=>e.classList.contains('answer-key')));
 await page.locator('#print-a').check();assert.equal(await page.locator('#answer').getAttribute('aria-pressed'),'true');
 await page.evaluate(()=>GDPreparePDF());assert.equal(await page.locator('#print-bundle > .sheet').count(),2);
 const both=await page.locator('#print-bundle .activities').evaluateAll(els=>els.map(e=>e.innerHTML));assert(both.every(s=>s===questionMarkup),file+' combined order/numbers');
 await page.locator('#print-q').uncheck();assert.equal(await page.locator('#answer').getAttribute('aria-pressed'),'true');
 await page.locator('#print-a').uncheck();assert(await page.locator('#print').isDisabled());
 if(await page.locator('#save-pdf').count())assert(await page.locator('#save-pdf').isDisabled());
 assert.equal(await page.evaluate(()=>GDPreparePDF()),false);
 await page.locator('#print-q').check();assert.equal(await page.locator('#worksheet').getAttribute('aria-pressed'),'true');
 assert.deepEqual(await page.evaluate(()=>GDWorksheetContext()),context,file+' preserved seed');
 return {file,questionCount:solutions.length,answers:solutions.map(s=>s.answer),matched:true};
}
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true}),errors=[],results=[];
try{
 await Promise.all(groups.map(async files=>{const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));for(const file of files){try{results.push(await checkPage(page,file))}catch(e){throw Error(file+': '+e.message+'; browser errors: '+errors.join(' | '))}}await page.close()}));
 const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));
 for(const file of [groups[0][0],groups[1][0]]){
  await page.goto(base+'/ko/print/'+file+'?set=369125');await page.waitForFunction(()=>window.KoPreview&&document.querySelector('#sheet-view .sheet'));
  await page.locator('#worksheet-copies').fill('3');await page.locator('#print-q').check();await page.locator('#print-a').check();
  await page.evaluate(()=>GDPreparePDF());assert.equal(await page.locator('#print-bundle > .sheet').count(),6);
  const pages=await page.locator('#print-bundle .activities').evaluateAll(els=>els.map(e=>e.innerHTML));
  for(let i=0;i<6;i+=2)assert.equal(pages[i],pages[i+1]);assert.equal(new Set(pages).size,3);
  await page.pdf({path:path.join(out,file.replace('.html','')+'-six.pdf'),format:'A4',printBackground:true});
 }
 await page.goto(base+'/ko/?type=natural-add-1-1&set=369125');await page.waitForSelector('#worksheet-copies');
 await page.locator('#worksheet-copies').fill('3');await page.locator('#print-worksheet').check();await page.locator('#print-answer').check();
 await page.evaluate(()=>GDPreparePDF());assert.equal(await page.locator('#print-bundle > *').count(),6);
 await page.pdf({path:path.join(out,'main-six.pdf'),format:'A4',printBackground:true});
 assert.equal(errors.length,0,errors.join('\n'));fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({base,unit:20,assessment:20,results,errors},null,2));
 console.log('PASS 20 units + 20 assessments: selection, unchanged question order/numbers, answers, paired PDFs; 3-copy unit/test/main bundles contain 6 pages');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
