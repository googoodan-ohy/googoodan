(function(root){
const items=root.KoArtCatalog||(typeof require!=='undefined'?require('./art/catalog.json'):[]);
function session(seed,excluded=[]){let state=(seed^0xa731cd)>>>0;const rand=()=>((state=(Math.imul(state,1664525)+1013904223)>>>0)/4294967296);const denied=new Set(excluded);let pool=items.filter(x=>!denied.has(x.id));for(let i=pool.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]]}let used=[];return {take(predicate){const index=predicate?pool.findLastIndex(predicate):pool.length-1;if(index<0)throw Error("조건에 맞는 새 그림 부족");const a=pool.splice(index,1)[0];if(!a)throw Error('그림 자료 부족');used.push(a.id);return a},used}}
function icon(a,outline=false){return '<img class="object-icon'+(outline?' color-object':'')+'" src="'+a.file+'" alt="'+a.name+'" data-art-id="'+a.id+'" width="30" height="30">'}
function count(a,n,options={}){return '<div class="picture-count '+(options.outline?'to-color':'')+'" data-picture-kind="'+a.id+'">'+(n?Array.from({length:n},()=>icon(a,options.outline)).join(''):'<span class="empty-basket">텅 빈 바구니</span>')+'</div>'}
root.KoArt={items,session,icon,count};if(typeof module!=='undefined')module.exports=root.KoArt;
})(globalThis);
