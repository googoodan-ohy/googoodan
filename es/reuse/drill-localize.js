/* Display-only translation around the unchanged ko/drill-engine.js. */
(()=>{
function localize(q){if(!q.prompt)return q;let prompt=q.prompt;const rules=[
 [/^한 묶음의 양이 (.+)입니다\. (.+)묶음에 해당하는 양은 얼마인가요\?$/,(_,a,b)=>'Cada grupo tiene '+a+' elementos. ¿Cuántos elementos hay en '+b+(Number(b)===1?' grupo?':' grupos?')],
 [/^(.+)의 (.+)배에 해당하는 수를 구하세요\.$/,(_,a,b)=>'Calcula '+b+(Number(b)===1?' vez ':' veces ')+a+'.'],
 [/^전체 양 (.+)을 (.+)씩 나누면 몇 묶음인가요\?$/,(_,c,a)=>'Reparte '+c+' elementos en grupos de '+a+'. ¿Cuántos grupos obtienes?'],
 [/^전체 양 (.+)을 (.+)묶음으로 똑같이 나누면 한 묶음의 양은 얼마인가요\?$/,(_,c,b)=>'Reparte '+c+' elementos en '+b+(Number(b)===1?' grupo.':' grupos iguales.')+' ¿Cuántos elementos hay en cada grupo?'],
 [/^(.+)보다 (.+) 큰 수는 얼마인가요\?$/,(_,a,b)=>'¿Qué número es '+b+' mayor que '+a+'?'],
 [/^(.+)이 (.+)이 되려면 얼마가 더 필요한가요\?$/,(_,a,c)=>'¿Cuánto le falta a '+a+' para llegar a '+c+'?'],
 [/^(.+)은 (.+)보다 얼마나 작은가요\?$/,(_,b,c)=>'¿Cuánto menor es '+b+' que '+c+'?'],
 [/^두 양을 합하면 (.+)입니다\. 한 양이 (.+)이면 나머지는 얼마인가요\?$/,(_,c,a)=>'Dos cantidades suman '+c+'. Una es '+a+'. ¿Cuánto vale la otra?'],
 [/^(.+)에 어떤 수를 더했더니 (.+)이 되었습니다\. 어떤 수인가요\?$/,(_,a,c)=>'Sumo un número a '+a+' y obtengo '+c+'. ¿Qué número he sumado?'],
 [/^(.+)만큼 있던 양에 (.+)만큼을 더 모았습니다\. 모두 얼마인가요\?$/,(_,a,b)=>'A una cantidad de '+a+' le añado '+b+'. ¿Cuánto tengo en total?']
];for(const[pattern,translate]of rules)if(pattern.test(prompt)){prompt=prompt.replace(pattern,translate);break;}if(/[가-힣]/.test(prompt))throw Error('Untranslated Spanish drill');return {...q,prompt};}
const rows=DrillEngine.rows,generate=Worksheets.generate;
DrillEngine={...DrillEngine,rows:(...args)=>rows(...args).map(localize)};
Worksheets.generate=(...args)=>generate(...args).map(localize);
})();
