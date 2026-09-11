const fs=require('fs'),path=require('path'),cp=require('child_process');const root=path.resolve(__dirname,'..'),ja=path.join(root,'ja'),work=path.join(root,'.work-english');const backup=path.join(work,'ja-before-fix-'+Date.now());fs.cpSync(ja,backup,{recursive:true});const base=cp.execFileSync('git',['show','HEAD:ja/reuse/core-numeric.js'],{cwd:root,encoding:'utf8'});fs.writeFileSync(path.join(work,'ja-core-before.js'),base);
const pairs=[
["'구슬 '+fmt(x)+'개に'+fmt(y)+'個を더 넣었습니다. 모두何개ですか。'","'ビー玉が'+fmt(x)+'個あります。'+fmt(y)+'個増えると、全部で何個になりますか。'"],
["'색종が'+fmt(x)+'장 중 '+fmt(y)+'장を썼습니다.何장が남았나요?'","'色紙が'+fmt(x)+'枚あります。そのうち'+fmt(y)+'枚使うと、何枚残りますか。'"],
["'한 묶음に'+fmt(x)+'こずつ'+fmt(y)+'묶음です。 모두何개ですか。'","'一つのまとまりに'+fmt(x)+'個ずつ入っています。'+fmt(y)+'まとまりでは、全部で何個ですか。'"],
["fmt(x)+'個を'+fmt(y)+'人에게 똑같が나누면 한 人이何個を받나요?'","fmt(x)+'個を'+fmt(y)+'人で同じ数ずつ分けます。一人分は何個ですか。'"],
["'세 바구니にりんご가 '+a+'개, '+b+'개, '+c+'개 있습니다. 모두何개ですか。'","'三つのかごにりんごがそれぞれ'+a+'個、'+b+'個、'+c+'個入っています。全部で何個ですか。'"],
["'공 '+total+'個を'+b+'こずつ상자に담습니다. 가득 찬 상자は何개이고何개가 남나요?'","'ボール'+total+'個を、一つの箱に'+b+'個ずつ入れます。いっぱいになる箱は何箱で、ボールは何個余りますか。'"],
["'리본 '+n+'/'+d+' m와 '+m+'/'+e+' m를 이으면何mですか。'","'リボン'+n+'/'+d+' mと'+m+'/'+e+' mをつなぐと、長さは何mになりますか。'"],
["n+'/'+d+' m 중 '+m+'/'+e+' m를 쓰면何m가 남나요?'","n+'/'+d+' mのリボンから'+m+'/'+e+' m使うと、何m残りますか。'"],
["n+'/'+d+'の'+m+'/'+e+'なしは 얼마ですか。'","n+'/'+d+'の'+m+'/'+e+'倍はいくつですか。'"],
["n+'/'+d+' m를 '+m+'/'+e+' m씩 나누면何조각 分량ですか。'","n+'/'+d+' mのリボンは、'+m+'/'+e+' mを1本分とすると何本分ですか。'"],
["'長さ가 '+x+' m인 리본を'","'長さ'+x+' mのリボンを'"],
["y+' m 더 이으면 全部で長さは何mですか。'","y+' mつぎ足すと、全部で何mになりますか。'"],
["y+' m 자르면何m가 남나요?'","y+' m切り取ると、何m残りますか。'"],
["y+'なし로 늘리면何mですか。'","y+'倍の長さにすると、何mになりますか。'"],
["y+' m씩 나누면何조각 分량ですか。'","y+' mを1本分として分けると、何本分になりますか。'"]
];let fixed=base;for(const [a,b]of pairs){if(!fixed.includes(a))throw Error('Missing '+a);fixed=fixed.replace(a,b);}fs.writeFileSync(path.join(work,'ja-core-for-commit.js'),fixed);
// Preserve unrelated working changes; replace only the five story-bearing lines.
const p=path.join(ja,'reuse/core-numeric.js'),current=fs.readFileSync(p,'utf8').split('\n'),beforeLines=base.split('\n'),afterLines=fixed.split('\n');let changedLines=0;for(let i=0;i<beforeLines.length;i++)if(beforeLines[i]!==afterLines[i]){current[i]=afterLines[i];changedLines++;}fs.writeFileSync(p,current.join('\n'));
const files=fs.readdirSync(ja,{recursive:true}).filter(f=>f.endsWith('.html'));const groups=new Map();for(const f of files){const h=fs.readFileSync(path.join(ja,f),'utf8').match(/<h1\b[^>]*>(.*?)<\/h1>/s)?.[1];if(!groups.has(h))groups.set(h,[]);groups.get(h).push(f);}const duplicates=[...groups].filter(([k,v])=>v.length>1);let h1Changed=0,brand=0,links=0,langs=0;
for(const f of files){const p=path.join(ja,f);let s=fs.readFileSync(p,'utf8');const canonical=s.match(/<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"/)[1];s=s.replace(/<link\b[^>]*hreflang=["'][^"']+["'][^>]*>/g,'');s=s.replace('</head>',Object.entries({ja:canonical,ko:'https://googoodan.com/',en:'https://googoodan.com/en/',fr:'https://googoodan.com/fr/','x-default':'https://googoodan.com/'}).map(([l,u])=>`<link rel="alternate" hreflang="${l}" href="${u}">`).join('')+'</head>');langs++;
let replaced=false;s=s.replace(/(<script[^>]*type="application\/ld\+json"[^>]*>)(.*?)(<\/script>)/gs,(m,a,b,c)=>{let data=JSON.parse(b);function visit(o){if(!o||typeof o!=='object')return;if(o.name==='구구단닷컴'){o.name='googoodan';if('alternateName'in o)o.alternateName='ググダン';replaced=true;}Object.values(o).forEach(visit);}visit(data);return a+JSON.stringify(data)+c;});if(replaced)brand++;
s=s.replace(/<a\b[^>]*href=["']\/["'][^>]*>\s*한국어\s*<\/a>/g,m=>{links++;return m.replace(/href=(["'])\/\1/,'href="/ko/"');});
const oldh=s.match(/<h1\b[^>]*>(.*?)<\/h1>/s)?.[1];if(groups.get(oldh).length>1){const title=s.match(/<title>(.*?)<\/title>/s)[1].replace(/\s*\|\s*googoodan\.?$/i,'');s=s.replace(/<h1([^>]*)>.*?<\/h1>/s,`<h1$1>${title}</h1>`);h1Changed++;}
s=s.replace(/(\/ja\/reuse\/core-numeric\.js)\?[^"\s]+/g,'$1?v=20260911-ja-language').replace(/(\/ja\/reuse\/drill-page\.js)\?[^"\s]+/g,'$1?v=20260911-ja-language');fs.writeFileSync(p,s);}
const dp=path.join(ja,'reuse/drill-page.js');fs.writeFileSync(dp,fs.readFileSync(dp,'utf8').replace("document.querySelector('aside h1').textContent='学年・単元別計算';",''));
const report={backup,pages:files.length,changedLines,pairs,hreflangPages:langs,brandPages:brand,linksChanged:links,h1Changed,duplicateKindsBefore:duplicates.length,duplicatePagesBefore:duplicates.reduce((n,[k,v])=>n+v.length,0)};fs.writeFileSync(path.join(work,'ja-fix-report.json'),JSON.stringify(report,null,2));console.log({...report,pairs:pairs.length});
