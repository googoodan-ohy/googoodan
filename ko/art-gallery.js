const list=KoArtCatalog;let category='전체';document.querySelector('#summary').textContent=list.length+'개의 그림 소재 · 개별 SVG 파일 · 같은 문항 소재 중복 방지';
document.querySelector('#categories').innerHTML=['전체',...new Set(list.map(a=>a.category))].map(c=>'<button>'+c+'</button>').join('');
document.querySelectorAll('#categories button').forEach(b=>b.onclick=()=>{category=b.textContent;render()});
document.querySelector('#search').oninput=render;
function render(){const q=document.querySelector('#search').value;document.querySelector('#grid').innerHTML=list.filter(a=>(category==='전체'||a.category===category)&&a.name.includes(q)).map(a=>'<article><img loading="lazy" src="'+a.file+'" alt="'+a.name+'"><small>'+a.name+'</small></article>').join('')}
render();
