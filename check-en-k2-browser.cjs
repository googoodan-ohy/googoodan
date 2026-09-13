const fs=require('fs');
const os=require('os');
const path=require('path');
const assert=require('assert');
const {chromium}=require('playwright');
const {PDFDocument}=require('pdf-lib');
const sharp=require('sharp');

const base=process.env.K2_BASE_URL||'http://127.0.0.1:4195';
const writePreviews=process.argv.includes('--write-previews');
const ids=['number-tracing','dot-to-dot-numbers','repeating-patterns','shape-sorting','compose-shapes','nonstandard-measurement','make-picture-graph','tally-mark-activities','odd-even-coloring','skip-counting-paths','addition-maze','fact-family-houses'];
const manifest=require('./en/k2-activity-manifest.json');
const byId=Object.fromEntries(manifest.pages.map(page=>[page.id,page]));

(async()=>{
  const browser=await chromium.launch({headless:true,executablePath:process.env.K2_BROWSER||'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'});
  const page=await browser.newPage({viewport:{width:1500,height:1700},deviceScaleFactor:1});
  const errors=[];
  page.on('pageerror',error=>errors.push(String(error)));
  page.on('console',message=>{if(message.type()==='error'&&!message.text().startsWith('Failed to load resource:'))errors.push(message.text());});
  page.on('response',response=>{if(response.status()>=400&&!/\/(?:favicon\.ico|api\/)/.test(response.url()))errors.push(response.status()+' '+response.url());});
  let pdfs=0,previews=0,answerChecks=0,regenerations=0;
  try{
    for(const id of ids){
      const def=byId[id];assert.ok(def,id+' missing from manifest');
      const url=base+'/en/'+id+'.html?set=2026';
      const staticHtml=fs.readFileSync(path.join(__dirname,'en',id+'.html'),'utf8'),staticDescription=staticHtml.match(/<meta name="description" content="([^"]+)"/)?.[1];
      const response=await page.goto(url,{waitUntil:'networkidle'});assert.equal(response.status(),200,id+' HTTP');
      await page.waitForSelector('.bank-question');
      assert.equal(await page.locator('.bank-question').count(),def.taskCount,id+' task count');
      const brokenImages=await page.locator('.paper img').evaluateAll(images=>images.filter(image=>!image.complete||image.naturalWidth===0).map(image=>image.getAttribute('src')));
      if(brokenImages.length)throw new Error(id+' broken images: '+JSON.stringify(brokenImages));
      const layout=await page.locator('.paper').evaluate(paper=>{const box=paper.getBoundingClientRect(),footer=paper.querySelector('.paper-footer')?.getBoundingClientRect();return{horizontal:paper.scrollWidth-paper.clientWidth,vertical:paper.scrollHeight-paper.clientHeight,footerBottom:footer?footer.bottom-box.bottom:0,clipped:[...paper.querySelectorAll('.bank-question')].filter(node=>node.scrollHeight>node.clientHeight+2||node.scrollWidth>node.clientWidth+2).length};});
      assert.ok(layout.horizontal<=1,id+' horizontal paper overflow');assert.ok(layout.vertical<=1,id+' vertical paper overflow');assert.ok(layout.footerBottom<=1,id+' footer outside paper');assert.equal(layout.clipped,0,id+' clipped activity cards');
      assert.equal(await page.locator('h1').innerText(),def.title,id+' h1');
      assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'),'https://googoodan.com/en/'+id+'.html',id+' canonical after JS');
      assert.equal(await page.locator('meta[name="description"]').getAttribute('content'),staticDescription,id+' description changed after JS');
      const worksheet=await page.locator('.bank-question').evaluateAll(nodes=>nodes.map(node=>{const copy=node.cloneNode(true);copy.querySelectorAll('.bank-answer').forEach(answer=>answer.remove());return copy.innerHTML;}));
      const hiddenLines=await page.locator('.activity-answer-line').evaluateAll(nodes=>nodes.every(node=>getComputedStyle(node).opacity==='0'));
      assert.ok(hiddenLines,id+' path answer leaks on worksheet');
      const keyColors=await page.locator('.activity-key').evaluateAll(nodes=>nodes.map(node=>getComputedStyle(node).backgroundColor));
      assert.ok(keyColors.every(color=>color!=='rgb(255, 229, 185)'),id+' highlighted answer leaks on worksheet');
      await page.locator('#answers').click();
      await page.waitForFunction(()=>document.querySelector('#mode')?.textContent==='Answer key');
      assert.equal(await page.locator('.bank-answer').count(),def.taskCount,id+' visible answer count');
      const answerBase=await page.locator('.bank-question').evaluateAll(nodes=>nodes.map(node=>{const copy=node.cloneNode(true);copy.querySelectorAll('.bank-answer').forEach(answer=>answer.remove());return copy.innerHTML;}));
      assert.deepEqual(answerBase,worksheet,id+' worksheet and answer key changed problem data');
      assert.ok(await page.locator('#print-answer').isChecked(),id+' answer tab did not select answer print');
      assert.ok(!await page.locator('#print-worksheet').isChecked(),id+' answer tab left worksheet print selected');
      answerChecks++;
      await page.locator('#questions').click();
      assert.ok(await page.locator('#print-worksheet').isChecked(),id+' worksheet tab did not select worksheet print');
      const before=await page.locator('#set').innerText();await page.locator('#new').click();const after=await page.locator('#set').innerText();assert.notEqual(after,before,id+' new problems');regenerations++;
      await page.goto(url,{waitUntil:'networkidle'});await page.waitForSelector('.bank-question');
      if(writePreviews){
        const shot=await page.locator('.paper').screenshot({type:'png'});
        await sharp(shot).resize(1000,1500,{fit:'contain',background:'#f7faf8'}).png({compressionLevel:9}).toFile(path.join(__dirname,'en','activity-previews',id+'.png'));
        previews++;
      }
      for(const format of ['A4','Letter']){
        const out=path.join(os.tmpdir(),'googoodan-'+id+'-'+format+'.pdf');
        await page.pdf({path:out,format,printBackground:true,preferCSSPageSize:false});
        const pdf=await PDFDocument.load(fs.readFileSync(out));
        assert.equal(pdf.getPageCount(),1,id+' '+format+' must be one page');
        fs.unlinkSync(out);pdfs++;
      }
      await page.locator('#print-answer').check();
      assert.ok(await page.locator('#print-worksheet').isChecked()&&await page.locator('#print-answer').isChecked(),id+' both print choices');
      await page.waitForFunction(()=>document.querySelector('#mode')?.textContent==='Answer key');
      const bundleOut=path.join(os.tmpdir(),'googoodan-'+id+'-both.pdf');
      await page.pdf({path:bundleOut,format:'A4',printBackground:true,preferCSSPageSize:false});
      const bundlePdf=await PDFDocument.load(fs.readFileSync(bundleOut));assert.equal(bundlePdf.getPageCount(),2,id+' worksheet and answer bundle');fs.unlinkSync(bundleOut);pdfs++;
    }
    if(errors.length)throw new Error('Browser console errors: '+JSON.stringify(errors));
    console.log(JSON.stringify({pages:ids.length,answerChecks,regenerations,pdfs,a4:ids.length,letter:ids.length,worksheetAndAnswerBundles:ids.length,previews},null,2));
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
