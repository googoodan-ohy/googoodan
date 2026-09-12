/* The original ko/engine.js is loaded first. Keep its generator and catalog intact. */
(()=>{
const source=KoMath;
const definitions=[
 ['it-1-contare',1,1,'Contare fino a 9','1-1-1','count:9'],
 ['it-1-confrontare',1,2,'Confrontare i numeri fino a 9','1-1-1','compare:9'],
 ['it-2-decine-unita',2,1,'Decine e unità','1-2-1','place:2'],
 ['it-2-addizioni',2,2,'Addizioni entro 100','2-1-3','add:99'],
 ['it-3-sottrazioni',3,1,'Sottrazioni entro 1 000','3-1-1','sub:999'],
 ['it-3-moltiplicazioni',3,2,'Moltiplicare per una cifra','3-1-4','mul:99'],
 ['it-4-angoli-retti',4,1,'Riconoscere gli angoli retti','4-1-2','angle-right'],
 ['it-4-simmetria',4,2,'Assi di simmetria del quadrato','4-1-2','symmetry-line'],
 ['it-5-frazioni-figure',5,1,'Ripasso: frazioni e figure','3-1-6','fraction-model'],
 ['it-5-confronto-frazioni',5,2,'Frazioni con lo stesso denominatore','3-2-5','fraction-compare'],
 ['it-4-tipi-angoli',4,3,'Angoli acuti, retti e ottusi','4-1-2','angle-type'],
 ['it-4-goniometro',4,4,'Leggere il goniometro','4-1-2','angle-measure'],
 ['it-5-perimetro-rettangolo',5,3,'Perimetro del rettangolo','5-1-6','perimeter'],
 ['it-5-area-rettangolo',5,4,'Area del rettangolo','5-1-6','area-rectangle']
];
definitions.push(['it-2-righello',2,3,'Leggere il righello','2-1-4','ruler:cm'],['it-3-centimetri-millimetri',3,3,'Centimetri e millimetri','3-1-5','convert:mm'],['it-3-metri-centimetri',3,4,'Metri e centimetri','2-2-3','convert:m'],['it-4-chilogrammi-grammi',4,5,'Chilogrammi e grammi','3-2-4','convert:kg'],['it-4-litri-millilitri',4,6,'Litri e millilitri','3-2-4','convert:L']);
definitions.push(['it-4-decimali-figure',4,7,'Decimi e numeri decimali','3-1-6','decimal-model'],['it-4-centesimi-decimali',4,8,'Dai centesimi ai numeri decimali','6-1-3','decimal-fraction'],['it-5-semplificare-frazioni',5,5,'Semplificare le frazioni','5-1-4','reduce'],['it-5-confrontare-denominatori',5,6,'Confrontare frazioni diverse','5-1-4','fraction-compare-unlike']);
const tr=s=>String(s).replace(/(\d+)시\s*(\d+)분/g,(_,h,m)=>h+':'+m.padStart(2,'0')).replaceAll('친구의 답:','Risposta proposta:').replaceAll('맞으면 ○, 틀리면 ×. 틀린 답은 고치세요.','Vero: ○. Falso: ×. Correggi la risposta sbagliata.').replaceAll('바른 답:','Risposta corretta:').replaceAll('예각','acuto').replaceAll('직각','retto').replaceAll('둔각','ottuso').replaceAll('아니요','No').replaceAll('예','Sì').replaceAll('문제 그림','Figura dell’esercizio');
definitions.push(...[["it-2-leggere-tabelle",2,4,"Leggere le tabelle","2-2-5","table"],["it-3-pittogrammi",3,5,"Leggere i pittogrammi","3-2-6","graph:picture"],["it-4-grafici-barre",4,9,"Leggere i grafici a barre","4-1-5","graph:bar"],["it-5-media-aritmetica",5,7,"Calcolare la media aritmetica","5-2-6","average"]]);
definitions.push(...[["it-2-ore-mezzore",2,5,"Orologio: ore e mezzore","1-2-3","clock:30"],["it-2-settimane-giorni",2,6,"Settimane e giorni","2-2-4","calendar"],["it-3-orologio-minuti",3,6,"Orologio: intervalli di 5 minuti","2-2-4","clock:5"],["it-3-tempo-trascorso",3,7,"Calcolare l’orario finale","2-2-4","elapsed"],["it-4-minuti-secondi",4,10,"Convertire minuti e secondi","3-1-5","time-seconds"]]);
const dataText=s=>String(s).replaceAll('사과','Mele').replaceAll('배','Pere').replaceAll('귤','Mandarini').replace(/● 한 개는 (\d+)명/g,'● = $1 persone').replaceAll('선택한 사람 수 (명)','Numero di persone').replace(/>(가|나|다)</g,(_,x)=>'>'+({가:'A',나:'B',다:'C'}[x])+'<');
const decimalText=s=>String(s).split(/(<[^>]*>)/g).map((t,i)=>i%2?t:t.replace(/(\d)\.(\d)/g,'$1,$2')).join('');
globalThis.ItSourceMath=source;globalThis.ItDefinitions=definitions;
globalThis.KoCatalog={units:definitions.map(([id,grade,number,name])=>({id,grade,number,name,semester:1,gradeLabel:'Classe '+grade})),themes:Array.from({length:10},()=>['Un passo alla volta','Osserva, calcola e spiega','#278477','#edf8e9','rabbit'])};
globalThis.KoMath={...source,profiles(id){const d=definitions.find(x=>x[0]===id);return d?[{name:d[3]}]:[];},generate(id,p,seed,n){
 const d=definitions.find(x=>x[0]===id);if(!d||p!==0)throw Error('Unsupported Italian topic');
 return source.generate(d[4],0,seed,n,[0,1,2].map(mode=>({skill:d[5],mode}))).map((s,i)=>({...s,title:['Osserva e risolvi','Completa o scegli','Controlla la risposta'][i],questions:s.questions.map(q=>{
  const skill=d[5].split(':')[0];let prompt,reason;
  if(q.check?.kind==='calc'){const c=q.check;prompt=['Calcola il risultato.','Scrivi il numero mancante.','Controlla il risultato proposto.'][i];reason=c.x+' '+c.op+' '+c.y+' = '+c.result;}
  else if(skill==='perimeter'){const c=q.check;prompt='Qual è il perimetro del rettangolo in cm?';reason='('+c.a+' + '+c.b+') × 2 = '+c.result+' cm';}
  else if(skill==='area-rectangle'){const c=q.check;prompt='Qual è l’area del rettangolo in cm²?';reason=c.a+' × '+c.b+' = '+c.result+' cm²';}
  else if(skill==='angle-type'){prompt='L’angolo è acuto, retto oppure ottuso?';reason='Acuto: meno di 90°. Retto: 90°. Ottuso: più di 90° e meno di 180°.';}
  else if(skill==='angle-measure'){prompt='Leggi il goniometro. Quanto misura l’angolo?';const degrees=q.reason.match(/(\d+)°를/)[1];reason='Parti dallo zero a destra: l’altro lato indica '+degrees+'°.';}
  else if(skill==='ruler'){prompt='Quanto è lunga la barretta in cm?';reason='Sottrai la misura iniziale da quella finale: '+q.reason+'.';}
  else if(skill==='convert'){const m=q.prompt.match(/^(\d+)(\w+) (\d+)(\w+)는 몇 (\w+)인가요/);prompt='Esprimi '+m[1]+' '+m[2]+' e '+m[3]+' '+m[4]+' in '+m[5]+'.';reason=q.reason.replaceAll('입니다.','.');}
  else if(skill==='decimal-model'){prompt='Scrivi la parte colorata come numero decimale.';reason=q.reason;}
  else if(skill==='decimal-fraction'){const n=q.prompt.match(/^(\d+)\/100/)[1];prompt='Scrivi '+n+'/100 come numero decimale.';reason=n+' centesimi: usa due cifre dopo la virgola.';}
  else if(skill==='reduce'){prompt='Riduci la frazione ai minimi termini.';const n=q.reason.match(/(\d+)로/)[1];reason='Dividi numeratore e denominatore per il loro massimo comune divisore, '+n+'.';}
  else if(skill==='fraction-compare-unlike'){prompt='Confronta le frazioni con denominatori diversi.';reason='Porta le frazioni allo stesso denominatore e confronta i numeratori.';}
  else if(skill==='table'){const fruit=q.prompt.match(/^(사과|배|귤)/)[1];prompt='Quanti elementi ci sono nella colonna '+dataText(fruit)+'?';reason='Leggi il numero sotto il nome del frutto nella tabella.';}
  else if(skill==='graph'){if(i===2){prompt='Somma i valori delle categorie A e B.';reason=q.reason;}else{const label=({가:'A',나:'B',다:'C'})[q.prompt[0]];prompt='Quante persone hanno scelto la categoria '+label+'?';reason='Leggi la scala o la legenda e trova il valore della categoria.';}}
  else if(skill==='average'){const sum=q.reason.match(/합 (\d+)/)[1];prompt='Calcola la media dei tre numeri.';reason='Dividi la somma '+sum+' per il numero dei dati, 3.';}
  else if(skill==='clock'){prompt='Scrivi l’ora indicata dall’orologio.';reason='La lancetta corta indica le ore; quella lunga indica i minuti.';}
  else if(skill==='calendar'){const weeks=q.prompt.match(/^(\d+)/)[1];prompt='Quanti giorni ci sono in '+weeks+' '+(weeks==='1'?'settimana':'settimane')+'?';reason='Una settimana ha 7 giorni: moltiplica il numero di settimane per 7.';}
  else if(skill==='elapsed'){const m=q.prompt.match(/^(\d+)시 (\d+)분부터 (\d+)분/);prompt='Ora iniziale: '+m[1]+':'+m[2].padStart(2,'0')+'. Che ora sarà dopo '+m[3]+' minuti?';reason='Aggiungi i minuti trascorsi. Ogni 60 minuti passa un’ora.';}
  else if(skill==='time-seconds'){const m=q.prompt.match(/^(\d+)분 (\d+)초/);prompt='Esprimi '+m[1]+' min e '+m[2]+' s in secondi.';reason=q.reason.replaceAll('입니다.','')+' s; 1 min = 60 s.';}
  else if(skill==='count'){prompt='Quanti pallini ci sono?';reason='Conta ogni pallino una sola volta.';}
  else if(skill==='compare'){prompt='Confronta i numeri. Quale segno è corretto?';reason='Confronta le quantità e usa >, < oppure =.';}
  else if(skill==='place'){const number=q.prompt.match(/^\d+/)[0],place=q.prompt.includes('십의')?'decine':'unità';prompt='Qual è la cifra delle '+place+' nel numero '+number+'?';reason='Da destra trovi prima le unità, poi le decine.';}
  else if(skill==='angle-right'){prompt='La figura mostra un angolo retto?';reason='Confronta l’angolo con quello di un foglio rettangolare.';}
  else if(skill==='symmetry-line'){prompt='Quanti assi di simmetria ha un quadrato?';reason='Due assi passano per i punti medi dei lati e due sono le diagonali.';}
  else if(skill==='fraction-model'){prompt='Quale frazione rappresenta la parte colorata?';reason='Il denominatore conta tutte le parti uguali; il numeratore conta quelle colorate.';}
  else{prompt='Confronta le due frazioni.';reason='Con denominatori uguali, confronta i numeratori.';}
  if(!q.check&&i===1)prompt+=' Scegli la risposta.';
  if(!q.check&&i===2)prompt+=' Controlla la risposta proposta.';
  const display=skill.startsWith('decimal-')?s=>decimalText(tr(s)):['table','graph'].includes(skill)?s=>dataText(tr(s)):tr;
  return {...q,prompt,reason:skill.startsWith('decimal-')?decimalText(reason):reason,visual:display(q.visual),task:display(q.task),answer:display(q.answer)};
 })}));
}};
})();
