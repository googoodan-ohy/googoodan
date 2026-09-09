/* Original practice mapping, checked against DfE Years 1–6 on 2026-09-09. */
(function(root){
const source='https://www.gov.uk/government/publications/national-curriculum-in-england-mathematics-programmes-of-study/national-curriculum-in-england-mathematics-programmes-of-study';
const specs=[];const add=(y,id,name,kind,a,b)=>specs.push([y,id,name,'Year '+y,kind,a,b]);
add(1,'bonds','Make ten','bond',10);add(1,'addsub','Addition and subtraction within 20','early',20);
add(2,'addsub','Addition and subtraction within 100','early',100);add(2,'tables','2, 5 and 10 times tables','facts',[2,5,10],12);
add(3,'addsub','Three-digit addition and subtraction','early',999);add(3,'tables','3, 4 and 8 times tables','facts',[3,4,8],12);add(3,'multiply','Two digits multiplied by one digit','mul',2,1);add(3,'divide','Two-digit exact division','div',2,1);add(3,'fractions','Same-denominator fractions within one whole','like',1);
add(4,'addsub','Four-digit addition and subtraction','early',9999);add(4,'tables','Times tables through 12 × 12','facts',Array.from({length:12},(_,i)=>i+1),12);add(4,'multiply','Three digits multiplied by one digit','mul',3,1);add(4,'divide','Three-digit exact division','div',3,1);add(4,'fractions','Same-denominator addition and subtraction','like');add(4,'quantities','Fractions of whole-number quantities','fractionwhole',1);
add(5,'addsub','Addition and subtraction beyond four digits','early',999999);add(5,'multiply1','Four digits multiplied by one digit','mul',4,1);add(5,'multiply2','Four digits multiplied by two digits','mul',4,2);add(5,'divide','Four-digit short division with remainders','div',4,1);add(5,'factors','Find factors','factors');add(5,'fractions','Fractions with related denominators','unlike',1);add(5,'fractionwhole','Fractions multiplied by whole numbers','fractionwhole');add(5,'decimals','Decimal addition and subtraction','decimal',3,1);add(5,'scale','Multiply and divide by powers of ten','decimal',3,2);
add(6,'multiply','Long multiplication: four digits by two digits','mul',4,2);add(6,'divide','Long division: four digits by two digits','div',4,2);add(6,'fractions','Unlike-denominator addition and subtraction','unlike');add(6,'fractionmultiply','Multiply two proper fractions','fractionmul');add(6,'fractiondivide','Divide a proper fraction by a whole number','unitdivide');add(6,'decimalmultiply','Decimals multiplied by whole numbers','decimal',2,3);add(6,'decimaldivide','Decimal division by whole numbers','decimal',2,4);add(6,'gcf','Highest common factor','gcf');add(6,'lcm','Lowest common multiple','lcm');add(6,'brackets','Brackets and order of operations','expressions');
root.GDCurriculumConfig={prefix:'eng',yearLabel:'Year',grades:[1,2,3,4,5,6],title:'England curriculum arithmetic',referenceLabel:'National curriculum',source,specs,
row(u,p,r,i){const subtract=i%2===1;let a,b,op;
if(u.kind==='facts'){b=u.a[r(0,u.a.length-1)];a=r(1,u.b);op=subtract?'÷':'×';if(subtract)a*=b;}
else if(u.kind==='div'&&u.grade<5){b=r(2,9);a=r(Math.ceil(10**(u.a-1)/b),Math.floor((10**u.a-1)/b))*b;op='÷';}
else if(u.kind==='like'&&u.a===1){const d=r(2,12),n=r(1,d-1),m=r(1,d-n);a=(subtract?n+m:n)+'/'+d;b=m+'/'+d;op=subtract?'−':'+';}
else if(u.kind==='unlike'){const d=r(2,8),e=u.a===1?d*r(2,4):d+r(1,5);a=r(1,2*d)+'/'+d;b=r(1,2*e)+'/'+e;op=subtract?'−':'+';if(subtract&&root.Worksheets.exact(a,b,op)[0]<0)[a,b]=[b,a];}
else if(u.kind==='fractionwhole'&&u.a===1){const d=r(2,12);a=r(1,d-1)+'/'+d;b=d*r(1,12);op='×';}
else if(u.kind==='fractionmul'){const d=r(2,12),e=r(2,12);a=r(1,d-1)+'/'+d;b=r(1,e-1)+'/'+e;op='×';}
else if(u.kind==='unitdivide'){const d=r(2,12);a=r(1,d-1)+'/'+d;b=r(1,12);op='÷';}
else if(u.kind==='decimal'){const scale=10**u.a;if(u.b===1){a=r(1,20*scale);b=r(1,10*scale);if(subtract&&a<b)[a,b]=[b,a];a=(a/scale).toFixed(u.a);b=(b/scale).toFixed(u.a);op=subtract?'−':'+';}else if(u.b===2){b=10**r(1,3);op=subtract?'÷':'×';a=subtract?r(1,999):(r(1,999)/1000).toFixed(3);}else if(u.b===3){a=(r(1,999)/100).toFixed(2);b=r(1,9);op='×';}else{b=r(2,12);a=(r(1,999)*b/100).toFixed(2);op='÷';}}
else return null;
return {a,b,op};}};
})(globalThis);
