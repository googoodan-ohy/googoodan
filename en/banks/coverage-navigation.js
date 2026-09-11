/* Extend the existing unit selector; retain its layout and native behavior. */
(() => {
  const links={
    1:[['telling-time','Hours and half hours']],
    2:[['telling-time','Time to five minutes']],
    3:[['fraction-models','Fraction models'],['telling-time','Time and elapsed time'],['area-and-perimeter','Rectangle area and perimeter']],
    4:[['factors-and-multiples','Factors and multiples'],['comparing-fractions','Compare fractions'],['angles','Lines and angles'],['decimal-models','Tenths and hundredths']],
    5:[['order-of-operations','Grouped expressions'],['simplifying-fractions','Simplify fractions'],['common-denominators','Common denominators']]
  };
  const select=document.getElementById('unit');if(!select)return;
  const g=Number(new URLSearchParams(location.search).get('grade'))||1;
  const group=document.createElement('optgroup');group.label='More practice with diagrams';
  for(const [id,title]of links[g]||[]){const option=document.createElement('option');option.value='/en/'+id+'.html?grade='+g;option.textContent=title;group.append(option);}
  select.append(group);
  select.addEventListener('change',event=>{if(select.value.startsWith('/en/')){event.stopImmediatePropagation();location.href=select.value;}},true);
})();
