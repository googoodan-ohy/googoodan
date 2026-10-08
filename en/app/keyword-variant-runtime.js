/* Local-only keyword worksheets: reuse existing generators with checked constraints. */
(()=>{'use strict';
const variants=window.USKeywordVariants||[];
const byId=new Map(variants.map(v=>[String(v.id),v]));
const training=variants.filter(v=>v.kind==='training');
const mixedSources={
 mixed_mul_regroup:['0-3-2-1-t1','0-3-2-2-t1'],
 mixed_decimal_whole_mul_div:['2-3-1-0-t1','2-4-1-0-t1'],
 mixed_add_sub_20:['0-1-1-2-t1','0-2-1-1-t1'],
 mixed_numberline:['0-1-0-1-t1','0-2-0-2-t1'],
 mixed_add_sub_regroup:['0-1-2-3-t1','0-2-2-3-t1']
};
if(Array.isArray(window.USArithmeticCatalog)){
 const byType=new Map(window.USArithmeticCatalog.map(x=>[x.typeId,x]));
 for(const v of training){const base=byType.get(v.source);if(!base)continue;
  window.USArithmeticCatalog.push({...base,typeId:'kw74-'+v.id,title:v.title,concept:base.concept+' · Dynamic keyword worksheet',keywordVariant:v.id});
 }
}
if(Array.isArray(window.SheetCatalog)){
 const byType=new Map(window.SheetCatalog.map(x=>[x.typeId,x]));
 for(const v of training){const base=byType.get(v.source);if(!base)continue;
  window.SheetCatalog.push({...base,typeId:'kw74-'+v.id,title:v.title,seed:(base.seed+v.id*9973)>>>0,keywordVariant:v.id,gen:{...base.gen}});
 }
}
function borrowCount(a,b){let borrow=0,count=0;while(a>0||b>0){let da=a%10-borrow,db=b%10;if(da<db){borrow=1;count++}else borrow=0;a=Math.floor(a/10);b=Math.floor(b/10)}return count}
function carryCount(a,b){let carry=0,count=0;while(a>0||b>0){const sum=a%10+b%10+carry;carry=sum>=10?1:0;if(carry)count++;a=Math.floor(a/10);b=Math.floor(b/10)}return count}
function denom(s){const m=String(s).match(/\/(\d+)/);return m?Number(m[1]):0}
if(window.Sheet?.register&&!window.Sheet.renderers.has('kw74-numberline')){
 const style=document.createElement('style');style.textContent='.kw74-line-eq{font-size:17px;font-weight:600;margin:4px 0 7px}.kw74-line-svg{width:100%;height:auto;max-height:86px}.kw74-line-answer{font-size:15px;margin-top:6px}';document.head.append(style);
 window.Sheet.register('kw74-numberline',(cell,q,answer)=>{
  const eq=document.createElement('div');eq.className='kw74-line-eq';eq.textContent=q.a+' '+q.op+' '+q.b+' = '+(answer?q.answer:'□');cell.append(eq);
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 310 82');svg.setAttribute('class','kw74-line-svg');
  const x=n=>18+Math.max(0,Math.min(20,n))*13.7,from=x(q.a),to=x(q.answer),start=Math.min(from,to),end=Math.max(from,to);
  let marks='';for(let n=0;n<=20;n++){const px=x(n);marks+='<line x1="'+px+'" y1="45" x2="'+px+'" y2="53" stroke="#456f69"/>'+(n%5===0?'<text x="'+px+'" y="68" text-anchor="middle" font-size="10" fill="#244b44">'+n+'</text>':'')}
  svg.innerHTML='<line x1="18" y1="49" x2="292" y2="49" stroke="#457c70" stroke-width="2"/>'+marks+'<path d="M '+from+' 40 Q '+((from+to)/2)+' 8 '+to+' 40" fill="none" stroke="#1a806c" stroke-width="2"/><circle cx="'+from+'" cy="40" r="3" fill="#1a806c"/><path d="M '+to+' 40 l '+(q.op==='+'?-5:5)+' -5 m '+(q.op==='+'?-5:5)+' 5 l '+(q.op==='+'?-5:5)+' 5" fill="none" stroke="#1a806c" stroke-width="2"/>';
  cell.append(svg);const a=document.createElement('div');a.className='kw74-line-answer';a.textContent=answer?'Landing point: '+q.answer:'Landing point: □';cell.append(a);
 });
}
function passes(q,rule){
 if(!rule)return true;
 if(rule==='add_carry')return Number.isInteger(q.a)&&Number.isInteger(q.b)&&carryCount(q.a,q.b)>0;
 if(rule==='sub_no_borrow')return Number.isInteger(q.a)&&Number.isInteger(q.b)&&borrowCount(q.a,q.b)===0;
 if(rule==='sub_borrow')return Number.isInteger(q.a)&&Number.isInteger(q.b)&&borrowCount(q.a,q.b)>0;
 if(rule==='round_hundredth')return q.target==='소수 둘째 자리';
 if(rule==='round_tenth')return q.target==='소수 첫째 자리';
 if(rule==='unlike_denom')return denom(q.a)&&denom(q.b)&&denom(q.a)!==denom(q.b);
 if(rule.startsWith('divisor_'))return rule.slice(8).split('_').map(Number).includes(Number(q.b));
 return false;
}
if(window.SheetGen&&typeof window.SheetGen.generate==='function'){
 const original=window.SheetGen.generate;
 window.SheetGen.generate=function(config){
  const v=byId.get(String(config?.keywordVariant));if(!v||v.kind!=='training')return original.apply(this,arguments);
  if(v.rule==='exact_division_3_1'){
   const need=config.count||config.cols*config.rows,found=[],seen=new Set();
   if(!window.Worksheets?.generate)throw Error('Existing three-digit division generator unavailable');
   for(let step=0;step<80&&found.length<need;step++)for(const q of window.Worksheets.generate('natural-div-3-1',(Number(config.seed)+step*10007)>>>0,80)){
    if(q.a<100||q.a>999||q.b<2||q.b>9||q.a%q.b)continue;
    const key=q.a+':'+q.b;if(seen.has(key))continue;seen.add(key);
    found.push({a:q.a,b:q.b,op:'÷',answer:String(q.a/q.b)});if(found.length===need)break;
   }
   if(found.length<need)throw Error('Cannot fill exact three-digit division worksheet');
   return found;
  }
  if(mixedSources[v.rule]){
   const need=config.count||config.cols*config.rows;
   const groups=mixedSources[v.rule].map((id,i)=>{
    const source=window.SheetCatalog.find(x=>x.typeId===id);
    if(!source)throw Error('Missing existing generator '+id);
    const sample=original.call(this,{...source,seed:(Number(config.seed)+i*10007)>>>0,count:Math.ceil(need/2)});
    if(!Array.isArray(sample)||sample.length<Math.ceil(need/2))throw Error('Not enough source problems for '+v.rule);
    return sample;
   });
   const out=[];for(let i=0;out.length<need;i++)for(let g=0;g<groups.length;g++){const item=groups[g][i];if(item)out.push(v.rule==='mixed_numberline'?{a:item.a,b:item.b,op:g===0?'+':'−',answer:g===0?item.sum:item.answer}:item);if(out.length===need)break}
   return out;
  }
  if(!v.rule)return original.call(this,config);
  const need=config.count||config.cols*config.rows,found=[],seen=new Set();
  for(let attempt=0;attempt<80&&found.length<need;attempt++){
   const sample=original.call(this,{...config,keywordVariant:null,seed:(Number(config.seed)+attempt*10007)>>>0,count:Math.max(need,30)});
   if(!Array.isArray(sample))throw Error('Keyword variant source did not return a question list');
   for(const q of sample){if(!passes(q,v.rule))continue;
    const key=JSON.stringify([q.a,q.b,q.op,q.value,q.target,q.nums]);
    if(seen.has(key))continue;seen.add(key);found.push(q);if(found.length===need)break;
   }
  }
  if(found.length<need)throw Error('Cannot fill worksheet with verified '+v.rule+' problems: '+found.length+'/'+need);
  if(v.rule==='divisor_2_3'&&!(found.some(q=>q.b===2)&&found.some(q=>q.b===3)))throw Error('Both divisor 2 and 3 are required');
  return found;
 };
}
})();
