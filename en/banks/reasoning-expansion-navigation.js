(() => {
  const select=document.getElementById('unit');if(!select)return;
  const grade=Number(new URLSearchParams(location.search).get('grade'))||1;if(grade<3)return;
  const rows=grade<=4?[['multiplication-arrays','Equal groups and arrays'],['multiplication-strategies','Multiplication strategies'],['multiplication-missing-factors','Missing factors'],['multiplication-error-analysis','Check multiplication'],['multiplication-matching','Match multiplication facts'],['draw-multiplication-groups','Draw equal groups']]:[['equivalent-fraction-puzzles','Equivalent fraction puzzles'],['fraction-number-puzzles','Fraction number puzzles'],['fraction-missing-numbers','Missing fraction numbers'],['fraction-error-analysis','Check fraction calculations']];
  const group=document.createElement('optgroup');group.label=grade===4?'Multiplication review':'More reasoning activities';
  for(const[id,title]of rows){const option=document.createElement('option');option.value='/en/'+id+'.html?grade='+grade;option.textContent=title;group.append(option);}select.append(group);
  // coverage-navigation's existing capture listener handles these URL values.
})();
