/* Reuse the original Korean arithmetic bank; localize displayed text only. */
(()=>{
const base=KoMath;
const definitions=[
  {id:'de-by-multiply-carry',number:22,name:'Schriftlich multiplizieren',profiles:[
    ...[0,1,2].map(p=>({source:'3-1-4',p,name:'Zweistellig · '+p+' '+(p===1?'Übertrag':'Überträge')})),
    ...[0,1,2,3].map(p=>({source:'3-2-1',p,name:'Dreistellig · '+p+' '+(p===1?'Übertrag':'Überträge')}))
  ]},
  {id:'de-by-divide-written',number:23,name:'Schriftlich dividieren',profiles:[
    ...[0,1,2,3].map(p=>({source:'3-2-3',p,name:(p<2?'Zweistellig':'Dreistellig')+' · '+(p%2?'mit Rest':'ohne Rest')}))
  ]}
];
for(const d of definitions)KoCatalog.units.push({id:d.id,grade:3,semester:1,number:d.number,name:d.name,gradeLabel:'Klasse 3/4',region:'BY'});
const tr=s=>String(s).replaceAll('나머지','Rest');
KoMath={...base,profiles(id){const d=definitions.find(x=>x.id===id);return d?d.profiles:base.profiles(id);},generate(id,p,seed,n){
  const d=definitions.find(x=>x.id===id);if(!d)return base.generate(id,p,seed,n);
  const spec=d.profiles[p];
  return DeCarrySource.generate(spec.source,spec.p,seed,n).map((section,i)=>({...section,title:['Berechnen und Rechenweg notieren','Fehlende Zahl finden','Ergebnis prüfen'][i],questions:section.questions.map(q=>{
    const {a,b,value,rem,op}=q.check,division=op==='÷';
    return {...q,methodId:id+'-'+p+'-'+i,prompt:[
      'Berechne schriftlich. Notiere deinen Rechenweg im freien Feld.',
      division?'Finde die fehlende Zahl vor dem Divisionszeichen. Prüfe mit der Gegenrechnung.':'Finde den fehlenden Faktor. Setze ihn zur Kontrolle in die Rechnung ein.',
      'Richtig: ○. Falsch: ×. Verbessere ein falsches Ergebnis.'
    ][i],task:tr(q.task),answer:tr(q.answer),reason:division?b+' × '+value+' + '+rem+' = '+a+'. Der Rest muss kleiner als '+b+' sein.':a+' × '+b+' = '+value+'. Achte beim Multiplizieren auf die Stellen und Überträge.',visual:q.visual.replaceAll('src="art/','src="/ko/art/').replace(/alt="[^"]*"/g,'alt=""')};
  })}));
}};
})();
