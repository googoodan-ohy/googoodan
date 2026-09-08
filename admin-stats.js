(()=>{
 const $=id=>document.getElementById(id),day=()=>new Date(Date.now()+32400000).toISOString().slice(0,10);let rows=[],shown=[],loaded=false;
 $('statsEnd').value=day();$('statsStart').value=day().slice(0,8)+'01';
 function render(){
  const start=$('statsStart').value,end=$('statsEnd').value,site=$('statsSite').value,monthly=$('statsUnit').value==='month',map=new Map();
  for(let t=Date.parse(start);t<=Date.parse(end);t+=86400000){const date=new Date(t).toISOString().slice(0,10),key=monthly?date.slice(0,7):date;if(!map.has(key))map.set(key,{key,ko:0,en:0});}
  for(const r of rows){const key=monthly?r.day.slice(0,7):r.day;if(map.has(key))map.get(key)[r.site]+=r.loads;}
  shown=[...map.values()].map(r=>({...r,total:site==='all'?r.ko+r.en:r[site]}));
  const total=shown.reduce((n,r)=>n+r.total,0),days=(Date.parse(end)-Date.parse(start))/86400000+1;
  $('statsSummary').textContent=`합계 ${total.toLocaleString()}회 · 선택 기간 일평균 ${(total/days).toFixed(1)}회`;
  $('statsRows').replaceChildren();$('statsChart').replaceChildren();const max=Math.max(1,...shown.map(r=>r.total));
  for(const r of shown){const tr=document.createElement('tr');for(const value of [r.key,site==='en'?'—':r.ko,site==='ko'?'—':r.en,r.total]){const td=document.createElement('td');td.textContent=typeof value==='number'?value.toLocaleString():value;tr.append(td);}$('statsRows').append(tr);const bar=document.createElement('div');bar.style.height=Math.max(1,r.total/max*100)+'%';bar.title=r.key+': '+r.total+'회';$('statsChart').append(bar);}
 }
 async function load(){if(!token)return;loaded=true;$('statsNotice').textContent='불러오는 중…';try{const data=await api('/admin/stats',{adminToken:token,start:$('statsStart').value,end:$('statsEnd').value});rows=data.rows;render();$('statsNotice').textContent=data.firstDay?'집계 시작: '+data.firstDay+' · 조회 기간 밖의 기록은 합계에서 제외됩니다.':'아직 기록이 없습니다. 적용 후 방문부터 집계됩니다.';}catch(e){$('statsNotice').textContent=e.message;$('statsSummary').textContent='';$('statsRows').replaceChildren();$('statsChart').replaceChildren();shown=[];}}
 $('statsForm').onsubmit=e=>{e.preventDefault();load();};$('statsSite').onchange=render;$('statsUnit').onchange=render;
 $('statsCsv').onclick=()=>{if(!shown.length)return;const site=$('statsSite').value;const csv='\uFEFF기간,한국어,영어,선택 합계\r\n'+shown.map(r=>[r.key,site==='en'?'':r.ko,site==='ko'?'':r.en,r.total].join(',')).join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download=`type-loads-${site}-${$('statsStart').value}-${$('statsEnd').value}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 new MutationObserver(()=>{if(!$('manage').hidden&&!loaded)load();if($('manage').hidden){loaded=false;rows=[];shown=[];$('statsRows').replaceChildren();$('statsChart').replaceChildren();$('statsSummary').textContent='';}}).observe($('manage'),{attributes:true,attributeFilter:['hidden']});if(!$('manage').hidden)load();
})();
