/* Display-only translation around the unchanged ko/drill-engine.js. */
(()=>{
function localize(q){if(!q.prompt)return q;let prompt=q.prompt;const rules=[
 [/^한 묶음의 양이 (.+)입니다\. (.+)묶음에 해당하는 양은 얼마인가요\?$/,(_,a,b)=>'Ogni gruppo contiene '+a+' elementi. Quanti elementi ci sono in '+b+(Number(b)===1?' gruppo?':' gruppi?')],
 [/^(.+)의 (.+)배에 해당하는 수를 구하세요\.$/,(_,a,b)=>'Calcola '+b+(Number(b)===1?' volta ':' volte ')+a+'.'],
 [/^전체 양 (.+)을 (.+)씩 나누면 몇 묶음인가요\?$/,(_,c,a)=>'Dividi '+c+' elementi in gruppi da '+a+'. Quanti gruppi ottieni?'],
 [/^전체 양 (.+)을 (.+)묶음으로 똑같이 나누면 한 묶음의 양은 얼마인가요\?$/,(_,c,b)=>'Distribuisci '+c+' elementi in '+b+(Number(b)===1?' gruppo.':' gruppi uguali.')+' Quanti elementi ci sono in ogni gruppo?'],
 [/^(.+)보다 (.+) 큰 수는 얼마인가요\?$/,(_,a,b)=>'Quale numero supera '+a+' di '+b+'?'],
 [/^(.+)이 (.+)이 되려면 얼마가 더 필요한가요\?$/,(_,a,c)=>'Quanto manca a '+a+' per arrivare a '+c+'?'],
 [/^(.+)은 (.+)보다 얼마나 작은가요\?$/,(_,b,c)=>'Di quanto '+b+' è minore di '+c+'?'],
 [/^두 양을 합하면 (.+)입니다\. 한 양이 (.+)이면 나머지는 얼마인가요\?$/,(_,c,a)=>'Due quantità sommate danno '+c+'. Una è '+a+'. Quanto vale l’altra?'],
 [/^(.+)에 어떤 수를 더했더니 (.+)이 되었습니다\. 어떤 수인가요\?$/,(_,a,c)=>'Aggiungo un numero a '+a+' e ottengo '+c+'. Quale numero ho aggiunto?'],
 [/^(.+)만큼 있던 양에 (.+)만큼을 더 모았습니다\. 모두 얼마인가요\?$/,(_,a,b)=>'A una quantità di '+a+' aggiungo '+b+'. Quanto ottengo in tutto?']
];for(const[pattern,translate]of rules)if(pattern.test(prompt)){prompt=prompt.replace(pattern,translate);break;}if(/[가-힣]/.test(prompt))throw Error('Untranslated Italian drill');return {...q,prompt};}
const rows=DrillEngine.rows,generate=Worksheets.generate;
DrillEngine={...DrillEngine,rows:(...args)=>rows(...args).map(localize)};
Worksheets.generate=(...args)=>generate(...args).map(localize);
})();
