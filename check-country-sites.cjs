'use strict';
const fs=require('fs');
const path=require('path');
const http=require('http');
const {chromium}=require('playwright');

const root=__dirname;
const languages=['ko','en','ja','fr','de','it','es'];
const version='20260913-global-menu';
const reps=[
  {lang:'en',url:'/en/england-arithmetic.html?country=GB',summary:'Languages',active:'England'},
  {lang:'en',url:'/en/grades.html?grade=3&unit=perimeter&country=US',summary:'Languages',active:'United States'},
  {lang:'en',url:'/en/grade-1.html',summary:'Languages',active:'United States'},
  {lang:'ko',url:'/ko/drills.html',summary:'Languages',active:'한국어'},
  {lang:'ja',url:'/ja/drills.html',summary:'言語',active:'日本語'},
  {lang:'fr',url:'/fr/drills.html',summary:'Langues',active:'Français'},
  {lang:'de',url:'/de/drills.html',summary:'Sprachen',active:'Deutsch'},
  {lang:'it',url:'/it/drills.html',summary:'Lingue',active:'Italiano'},
  {lang:'es',url:'/es/drills.html',summary:'Idiomas',active:'Español'}
];

function walk(dir,out=[]){
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    const full=path.join(dir,entry.name);
    if(entry.isDirectory())walk(full,out);
    else if(entry.isFile()&&entry.name.toLowerCase().endsWith('.html'))out.push(full);
  }
  return out;
}

const staticRows=[];
for(const lang of languages){
  let eligible=0,valid=0;
  for(const file of walk(path.join(root,lang))){
    const html=fs.readFileSync(file,'utf8');
    if(!/<header\b/i.test(html))continue;
    eligible++;
    const css=(html.match(new RegExp('/country-sites\\.css\\?v='+version,'g'))||[]).length;
    const js=(html.match(new RegExp('/country-sites\\.js\\?v='+version,'g'))||[]).length;
    if(css!==1||js!==1)throw new Error(`${path.relative(root,file)}: css=${css}, js=${js}`);
    valid++;
  }
  staticRows.push({lang,eligible,valid});
}

const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg'};
const server=http.createServer((req,res)=>{
  let pathname=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);
  let relative=pathname.replace(/^\/+/, '');
  let file=path.resolve(root,relative||'index.html');
  if(!file.startsWith(path.resolve(root))){res.writeHead(403);res.end();return;}
  if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
  if(!fs.existsSync(file)){res.writeHead(404);res.end('not found');return;}
  res.writeHead(200,{'content-type':mime[path.extname(file).toLowerCase()]||'application/octet-stream'});
  fs.createReadStream(file).pipe(res);
});

(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const port=server.address().port;
  const executablePath=['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'].find(fs.existsSync);
  const browser=await chromium.launch({headless:true,executablePath});
  const results=[];
  try{
    for(const viewport of [{name:'desktop',width:1440,height:1000},{name:'mobile',width:390,height:844}]){
      const page=await browser.newPage({viewport:{width:viewport.width,height:viewport.height}});
      const errors=[];
      page.on('pageerror',error=>errors.push(error.message));
      for(const rep of reps){
        await page.goto(`http://127.0.0.1:${port}${rep.url}`,{waitUntil:'networkidle'});
        await page.waitForSelector('header .country-dropdown > summary',{state:'visible'});
        const data=await page.evaluate(()=>{
          const header=document.querySelector('body > header')||document.querySelector('header');
          const details=header.querySelector('.country-dropdown');
          const summary=details.querySelector(':scope > summary');
          const headerBox=header.getBoundingClientRect();
          const box=summary.getBoundingClientRect();
          const old=[...document.querySelectorAll('header a')].filter(a=>!a.closest('.country-dropdown')&&/^(Korean|한국어|English|日本語|Français|Deutsch|Italiano|Español)\s*(?:↗)?$/.test(a.textContent.trim()));
          summary.click();
          const menu=details.querySelector('.country-sites').getBoundingClientRect();
          const links=[...details.querySelectorAll('.country-sites-links a')].map(a=>({name:a.querySelector('b').textContent.trim(),href:a.getAttribute('href'),current:a.getAttribute('aria-current')}));
          return {summary:summary.textContent.replace('▾','').trim(),header:{top:headerBox.top,right:headerBox.right},box:{x:box.x,y:box.y,width:box.width,height:box.height,right:box.right},menu:{left:menu.left,right:menu.right,width:menu.width},links,oldLinks:old.length};
        });
        if(data.summary!==rep.summary)throw new Error(`${rep.url}: summary ${data.summary}`);
        if(data.links.length!==10)throw new Error(`${rep.url}: links ${data.links.length}`);
        if(data.links.filter(x=>x.current==='page').length!==1||!data.links.some(x=>x.current==='page'&&x.name===rep.active))throw new Error(`${rep.url}: current language/country mismatch`);
        if(data.oldLinks!==0)throw new Error(`${rep.url}: ${data.oldLinks} legacy header language links remain at runtime`);
        if(data.menu.left < -1 || data.menu.right > viewport.width+1)throw new Error(`${rep.url}: menu outside ${viewport.name} viewport`);
        if(data.box.height<36||data.box.height>48)throw new Error(`${rep.url}: summary height ${data.box.height}`);
        const expectedRight=viewport.name==='desktop'?32:18;
        const expectedTop=viewport.name==='desktop'?19:12;
        const rightGap=Math.round(data.header.right-data.box.right);
        const topGap=Math.round(data.box.y-data.header.top);
        if(Math.abs(rightGap-expectedRight)>1||Math.abs(topGap-expectedTop)>1)throw new Error(`${rep.url}: inconsistent ${viewport.name} position right=${rightGap}, top=${topGap}`);
        await page.emulateMedia({media:'print'});
        const printDisplay=await page.$eval('header .country-dropdown',el=>getComputedStyle(el).display);
        if(printDisplay!=='none')throw new Error(`${rep.url}: menu visible in print`);
        await page.emulateMedia({media:'screen'});
        results.push({viewport:viewport.name,lang:rep.lang,url:rep.url,links:data.links.length,summary:data.summary,button:Math.round(data.box.width)+'x'+Math.round(data.box.height),rightGap,topGap,menuWidth:Math.round(data.menu.width)});
      }
      await page.close();
    }
  } finally {
    await browser.close();
    await new Promise(resolve=>server.close(resolve));
  }
  console.table(staticRows);
  console.table(results);
})().catch(error=>{console.error(error);process.exitCode=1;server.close();});
