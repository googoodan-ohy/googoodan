// Exercise the real PDF exporter, using its download fallback for automation.
const fs=require('fs'),assert=require('assert/strict'),{chromium}=require('playwright');
const base=process.env.TEST_BASE||'http://127.0.0.1:4181',out=process.env.TEST_OUT||'.work-english/ko-second-fix';
fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true}),page=await browser.newPage({acceptDownloads:true,viewport:{width:390,height:844}}),errors=[];
await page.addInitScript(()=>{delete window.showSaveFilePicker});page.on('pageerror',e=>errors.push(e.message));
try{for(const [file,copies,both]of [['unit-3-1-3-0.html',1,false],['test-5-1-2.html',3,true]]){
 await page.goto(base+'/ko/print/'+file+'?set=369125');await page.waitForFunction(()=>window.KoPreview&&document.querySelector('#sheet-view .sheet'));
 await page.locator('#answer').click();assert(await page.locator('#print-a').isChecked());assert(!await page.locator('#print-q').isChecked());
 if(both)await page.locator('#print-q').check();await page.locator('#worksheet-copies').fill(String(copies));
 const download=page.waitForEvent('download',{timeout:90000});await page.getByRole('button',{name:'PDF 저장',exact:true}).click();
 await(await download).saveAs(out+'/'+file.replace('.html','')+'-download.pdf');
 assert.equal(await page.locator('#print-bundle > .sheet').count(),copies*(both?2:1));
 assert.equal(await page.locator('#answer').getAttribute('aria-pressed'),'true');
 assert((await page.locator('.pdf-save-note').innerText()).includes(copies*(both?2:1)+'페이지 PDF'));
}assert.equal(errors.length,0,errors.join('\n'));console.log('PASS actual mobile PDF downloads: unit answers 1 page; assessment 3 question/answer sets 6 pages');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
