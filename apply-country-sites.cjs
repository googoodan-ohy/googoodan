'use strict';
const fs=require('fs');
const path=require('path');

const root=__dirname;
const langs=['ko','en','ja','fr','de','it','es'];
const version='20260913-global-menu';
const css=`<link rel="stylesheet" href="/country-sites.css?v=${version}">`;
const js=`<script defer src="/country-sites.js?v=${version}"></script>`;

function walk(dir,out=[]){
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    const full=path.join(dir,entry.name);
    if(entry.isDirectory())walk(full,out);
    else if(entry.isFile()&&entry.name.toLowerCase().endsWith('.html'))out.push(full);
  }
  return out;
}

const report=[];
for(const lang of langs){
  let scanned=0,eligible=0,changed=0;
  for(const file of walk(path.join(root,lang))){
    scanned++;
    let html=fs.readFileSync(file,'utf8');
    if(!/<header\b/i.test(html))continue;
    eligible++;
    const before=html;
    html=html.replace(/<link\b[^>]*href=["']\/country-sites\.css(?:\?[^"']*)?["'][^>]*>/gi,css);
    html=html.replace(/<script\b[^>]*src=["']\/country-sites\.js(?:\?[^"']*)?["'][^>]*>\s*<\/script>/gi,js);
    if(!/\/country-sites\.css\?v=20260913-global-menu/.test(html))html=html.replace(/<\/head>/i,css+'</head>');
    if(!/\/country-sites\.js\?v=20260913-global-menu/.test(html))html=html.replace(/<\/head>/i,js+'</head>');
    if(html!==before){fs.writeFileSync(file,html);changed++;}
  }
  report.push({lang,scanned,eligible,changed});
}
console.table(report);
