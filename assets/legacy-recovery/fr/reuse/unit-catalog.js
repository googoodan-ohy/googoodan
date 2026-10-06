const FrCurriculumSource=globalThis.KoMath;
const angleTypeActivities=[{title:'Angles aigus, droits et obtus',method:'angle-type'}];function angleTypeGenerate(p,seed,n){if(p!==0)throw Error('Unknown profile');const art=KoArt.session(seed,excluded);return FrCoreGeometry.generate('4-1-2',seed,n).map((s,i)=>({...s,title:angleTypeActivities[i].title,questions:s.questions.map(q=>{const a=art.take();return {...q,methodId:'angle-type',artId:a.id,visual:'<span class="picture-badge">'+KoArt.icon(a)+'</span>'+q.visual}})}))}
const angleActivities=[{title:'Reconnaître un angle droit',method:'angle-right'},{title:'Compter les côtés',method:'flat-count'}];function angleGenerate(p,seed,n){if(p!==0)throw Error('Unknown profile');const art=KoArt.session(seed,excluded);return FrCoreGeometry.generate('3-1-2',seed,n).map((s,i)=>({...s,title:angleActivities[i].title,questions:s.questions.map(q=>{const a=art.take();return {...q,methodId:angleActivities[i].method,artId:a.id,visual:'<span class="picture-badge">'+KoArt.icon(a)+'</span>'+q.visual}})}))}
const decimalOpActivities=[{title:'Multiplier par un entier',method:'decimal-mul-whole'},{title:'Multiplier par 10 ou 100',method:'decimal-scale'},{title:'Diviser par un entier',method:'decimal-div-whole'}];function decimalOpGenerate(p,seed,n){if(p!==0)throw Error('Unknown profile');const art=KoArt.session(seed,excluded);return FrCoreDecimals.generate('cm2-decimal-operations',seed,n).map((s,i)=>({...s,title:decimalOpActivities[i].title,questions:s.questions.map(q=>{const a=art.take();return {...q,methodId:decimalOpActivities[i].method,artId:a.id,visual:'<span class="picture-badge">'+KoArt.icon(a)+'</span>'+q.visual}})}))}
const decimalPlaceActivities=[{title:'Comparer des décimaux',method:'decimal-compare'},{title:'Repérer le chiffre d’une position',method:'decimal-place'}];function decimalPlaceGenerate(p,seed,n){if(p!==0)throw Error('Unknown profile');const art=KoArt.session(seed,excluded);return FrCoreDecimals.generate('cm2-decimal-place',seed,n).map((s,i)=>({...s,title:decimalPlaceActivities[i].title,questions:s.questions.map(q=>{const a=art.take();return {...q,methodId:decimalPlaceActivities[i].method,artId:a.id,visual:'<span class="picture-badge">'+KoArt.icon(a)+'</span>'+q.visual}})}))}
const decimalModelActivities=[{title:'Lire une partie colorée',method:'decimal-model'},{title:'Comparer des décimaux',method:'decimal-compare'},{title:'Écrire des centièmes',method:'decimal-fraction'}];function decimalModelGenerate(p,seed,n){if(p!==0)throw Error('Unknown profile');const art=KoArt.session(seed,excluded);return [...FrCoreDecimals.generate('3-1-6',seed,n),...FrCoreDecimals.generate('6-1-3',seed,n)].map((s,i)=>({...s,title:decimalModelActivities[i].title,questions:s.questions.map(q=>{const a=art.take();return {...q,methodId:decimalModelActivities[i].method,artId:a.id,visual:'<span class="picture-badge">'+KoArt.icon(a)+'</span>'+q.visual}})}))}
const decimalActivities=[{title:'Additionner des nombres décimaux',method:'decimal-add'},{title:'Soustraire des nombres décimaux',method:'decimal-sub'}];function decimalGenerate(p,seed,n){if(p!==0)throw Error('Unknown profile');const art=KoArt.session(seed,excluded);return FrCoreDecimals.generate('4-2-3',seed,n).map((s,i)=>({...s,title:decimalActivities[i].title,questions:s.questions.map(q=>{const a=art.take();return {...q,methodId:decimalActivities[i].method,artId:a.id,visual:'<span class="picture-badge">'+KoArt.icon(a)+'</span>'+q.visual}})}))}
const fractionActivities=[{title:'Lire une fraction représentée',method:'fraction-model'},{title:'Comparer deux fractions',method:'fraction-compare'}];function fractionGenerate(p,seed,n){if(p!==0)throw Error('Unknown profile');const art=KoArt.session(seed,excluded);return FrCoreFractions.generate('3-1-6',seed,n).map((s,i)=>({...s,title:fractionActivities[i].title,questions:s.questions.map(q=>{const a=art.take();return {...q,methodId:fractionActivities[i].method,artId:a.id,visual:'<span class="picture-badge">'+KoArt.icon(a)+'</span>'+q.visual}})}))}
const geometryActivities=[{title:'Reconnaître les figures',method:'flat-basic'},{title:'Compter les côtés',method:'flat-count'},{title:'Assembler deux triangles',method:'flat-build'}];function geometryGenerate(p,seed,n){if(p!==0)throw Error('Unknown profile');const art=KoArt.session(seed,excluded);return FrCoreGeometry.generate('1-2-3',seed,n).map((s,i)=>({...s,title:geometryActivities[i].title,questions:s.questions.map(q=>{const a=art.take();return {...q,methodId:geometryActivities[i].method,artId:a.id,visual:'<span class="picture-badge">'+KoArt.icon(a)+'</span>'+q.visual}})}))}
const numberUnits={'fr-cm1-numbers':'cm1-numbers','fr-cm2-numbers':'4-1-1','fr-ce2-numbers9999':'2-2-1','fr-ce1-numbers999':'2-1-1','fr-cp-numbers50':'1-1-5','fr-cp-numbers100':'1-2-1'};const numberActivities=[{title:'Repérer la valeur des chiffres',method:'place'},{title:'Comparer les nombres',method:'compare'},{title:'Compléter une suite',method:'sequence'}];function numberGenerate(id,p,seed,n){if(p!==0)throw Error('Unknown profile');const art=KoArt.session(seed,excluded);return FrCoreNumbers.generate(numberUnits[id],seed,n).map((s,i)=>({...s,title:numberActivities[i].title,questions:s.questions.map(q=>{const a=art.take();return {...q,methodId:numberActivities[i].method,artId:a.id,visual:'<span class="picture-badge">'+KoArt.icon(a)+'</span>'+q.visual}})}))}
globalThis.KoCatalog={units:[{id:'fr-cp-numbers',grade:1,semester:1,number:1,name:'Les nombres jusqu’à 9'}],themes:[["Un peu de pratique pour progresser","Réfléchis et vérifie","#278477","#edf8e9","rabbit"],["Un peu de pratique pour progresser","Réfléchis et vérifie","#ad693d","#fff3e4","squirrel"],["Un peu de pratique pour progresser","Réfléchis et vérifie","#237e9a","#eaf7fc","whale"],["Un peu de pratique pour progresser","Réfléchis et vérifie","#86622f","#fff8e8","bear"],["Un peu de pratique pour progresser","Réfléchis et vérifie","#6752a1","#f1effc","rocket"],["Un peu de pratique pour progresser","Réfléchis et vérifie","#438354","#edf7eb","dinosaur"],["Un peu de pratique pour progresser","Réfléchis et vérifie","#376b91","#edf4fb","robot"],["Un peu de pratique pour progresser","Réfléchis et vérifie","#257d88","#eaf7f6","submarine"],["Un peu de pratique pour progresser","Réfléchis et vérifie","#8c6240","#faf2e7","compass"],["Un peu de pratique pour progresser","Réfléchis et vérifie","#596b9b","#eff2fb","city"],["Un peu de pratique pour progresser","Réfléchis et vérifie","#397a71","#ecf6f1","telescope"],["Un peu de pratique pour progresser","Réfléchis et vérifie","#6e5f90","#f4f0f9","satellite"]]};let excluded=[];globalThis.KoMath={profiles:id=>id==='fr-cm1-angles'?[{name:'Comparer à un angle droit',activities:angleTypeActivities}]:id==='fr-cm2-area'?FrMeasurement.areaProfiles:id==='fr-ce1-angles'?[{name:'Angles droits et côtés',activities:angleActivities}]:id==='fr-cm1-capacity'?FrMeasurement.capacityProfiles:id==='fr-cm1-symmetry'?FrGeometry.profiles:id==='fr-cm2-line'?FrData.lineProfiles:id==='fr-cm1-bar'?FrData.profiles:id==='fr-cm2-fraction-multiply'?FrFractionTargets.multiplyProfiles:id==='fr-cm2-decimal-operations'?[{name:'Multiplier et diviser',activities:decimalOpActivities}]:id==='fr-cm2-decimal-place'?[{name:'Comparer et lire',activities:decimalPlaceActivities}]:id==='fr-cm1-division'?FrArithmeticTargets.divisionProfiles:id==='fr-cm1-decimal-model'?[{name:'Représenter et comparer',activities:decimalModelActivities}]:id==='fr-cm1-decimals'?[{name:'Additionner et soustraire',activities:decimalActivities}]:id==='fr-cm1-fraction-calcul'?FrFractionTargets.profiles:id==='fr-ce1-times8'?FrTimes.eightProfiles:id==='fr-ce1-times5'?FrTimes.fiveProfiles:id==='fr-ce1-times6'?FrTimes.sixProfiles:id==='fr-ce1-times2'?FrTimes.twoProfiles:id==='fr-ce1-times9'?FrTimes.nineProfiles:id==='fr-ce1-times7'?FrTimes.sevenProfiles:id==='fr-ce1-times3'?FrTimes.threeProfiles:id==='fr-ce1-times4'?FrTimes.profiles:id==='fr-ce1-clock'?[FrMeasurement.clockProfiles[0]]:id==='fr-ce2-clock'?[FrMeasurement.clockProfiles[1]]:id==='fr-ce2-fractions'?[{name:'Représenter et comparer',activities:fractionActivities}]:id==='fr-ce2-duration'?FrMeasurement.durationProfiles:id==='fr-ce2-length'?FrMeasurement.metricProfiles.slice(0,2):id==='fr-ce2-mass'?[FrMeasurement.metricProfiles[2]]:id==='fr-ce1-length'?FrMeasurement.profiles:id==='fr-ce2-multiplication3'?FrArithmeticTargets.multiplicationThreeProfiles:id==='fr-ce2-multiplication'?FrArithmeticTargets.multiplicationProfiles:id==='fr-ce2-addsub'?FrArithmeticTargets.threeDigitProfiles:id==='fr-ce1-addsub'?FrArithmeticTargets.profiles:id==='fr-cp-figures'?[{name:"Reconnaître et assembler",activities:geometryActivities}]:numberUnits[id]?[{name:"Valeur des chiffres et ordre",activities:numberActivities}]:id==='fr-cp-calcul100'?KoEarlyArithmetic.banks['1-2-6']:id==='fr-cp-relations'?KoEarlyArithmetic.banks['1-2-4']:id==='fr-cp-ten'?KoEarlyArithmetic.banks['1-2-2']:KoEarlyNumbers.profiles,generate:(id,p,seed,n)=>id==='fr-cm1-angles'?angleTypeGenerate(p,seed,n):id==='fr-cm2-area'?FrMeasurement.generateArea(p,seed,n,excluded):id==='fr-ce1-angles'?angleGenerate(p,seed,n):id==='fr-cm1-capacity'?FrMeasurement.generateCapacity(p,seed,n,excluded):id==='fr-cm1-symmetry'?FrGeometry.generate(p,seed,n,excluded):id==='fr-cm2-line'?FrData.generateLine(p,seed,n,excluded):id==='fr-cm1-bar'?FrData.generate(p,seed,n,excluded):id==='fr-cm2-fraction-multiply'?FrFractionTargets.generateMultiply(p,seed,n,excluded):id==='fr-cm2-decimal-operations'?decimalOpGenerate(p,seed,n):id==='fr-cm2-decimal-place'?decimalPlaceGenerate(p,seed,n):id==='fr-cm1-division'?FrArithmeticTargets.generateDivision(p,seed,n,excluded):id==='fr-cm1-decimal-model'?decimalModelGenerate(p,seed,n):id==='fr-cm1-decimals'?decimalGenerate(p,seed,n):id==='fr-cm1-fraction-calcul'?FrFractionTargets.generate(p,seed,n,excluded):id==='fr-ce1-times8'?FrTimes.generateEight(p,seed,n,excluded):id==='fr-ce1-times5'?FrTimes.generateFive(p,seed,n,excluded):id==='fr-ce1-times6'?FrTimes.generateSix(p,seed,n,excluded):id==='fr-ce1-times2'?FrTimes.generateTwo(p,seed,n,excluded):id==='fr-ce1-times9'?FrTimes.generateNine(p,seed,n,excluded):id==='fr-ce1-times7'?FrTimes.generateSeven(p,seed,n,excluded):id==='fr-ce1-times3'?FrTimes.generateThree(p,seed,n,excluded):id==='fr-ce1-times4'?FrTimes.generate(p,seed,n,excluded):id==='fr-ce1-clock'?FrMeasurement.generateClock(0,seed,n,excluded):id==='fr-ce2-clock'?FrMeasurement.generateClock(1,seed,n,excluded):id==='fr-ce2-fractions'?fractionGenerate(p,seed,n):id==='fr-ce2-duration'?FrMeasurement.generateDuration(p,seed,n,excluded):id==='fr-ce2-length'?FrMeasurement.generateMetric(p,seed,n,excluded):id==='fr-ce2-mass'?FrMeasurement.generateMetric(2,seed,n,excluded):id==='fr-ce1-length'?FrMeasurement.generate(p,seed,n,excluded):id==='fr-ce2-multiplication3'?FrArithmeticTargets.generateMultiplicationThree(p,seed,n,excluded):id==='fr-ce2-multiplication'?FrArithmeticTargets.generateMultiplication(p,seed,n,excluded):id==='fr-ce2-addsub'?FrArithmeticTargets.generateThreeDigit(p,seed,n,excluded):id==='fr-ce1-addsub'?FrArithmeticTargets.generate(p,seed,n,excluded):id==='fr-cp-figures'?geometryGenerate(p,seed,n):numberUnits[id]?numberGenerate(id,p,seed,n):id==='fr-cp-calcul100'?KoEarlyArithmetic.generate('1-2-6',p,seed,n,excluded):id==='fr-cp-relations'?KoEarlyArithmetic.generate('1-2-4',p,seed,n,excluded):id==='fr-cp-ten'?KoEarlyArithmetic.generate('1-2-2',p,seed,n,excluded):KoEarlyNumbers.generate(p,seed,n,excluded),excludeArt:ids=>{excluded=ids}};const icon=KoArt.icon,count=KoArt.count,absolute=a=>({...a,file:a.file.startsWith('/')?a.file:'/ko/'+a.file});KoArt.icon=(a,...args)=>icon(absolute(a),...args).replace(/alt="[^"]*"/g,'alt=""');KoArt.count=(a,...args)=>count(absolute(a),...args).replace(/alt="[^"]*"/g,'alt=""');
KoCatalog.units.push({id:"fr-cp-ten",grade:1,semester:1,number:2,name:"Trois nombres et compléments à 10"});

KoCatalog.units.push({id:"fr-cp-relations",grade:1,semester:1,number:3,name:"Relations entre additions et soustractions"});
KoCatalog.units.push({id:"fr-cp-calcul100",grade:1,semester:1,number:4,name:"Calculer avec des nombres à deux chiffres"});
KoCatalog.units.push({id:"fr-cp-numbers50",grade:1,semester:1,number:5,name:"Les nombres jusqu’à 50"});
KoCatalog.units.push({id:"fr-cp-numbers100",grade:1,semester:1,number:6,name:"Les nombres jusqu’à 100"});
KoCatalog.units.push({id:"fr-cp-figures",grade:1,semester:1,number:7,name:"Les figures planes"});
KoCatalog.units.push({id:"fr-ce1-numbers999",grade:2,semester:1,number:1,name:"Les nombres à trois chiffres"});
KoCatalog.units.push({id:"fr-ce1-addsub",grade:2,semester:1,number:2,name:"Addition et soustraction à deux chiffres"});
KoCatalog.units.push({id:"fr-ce2-numbers9999",grade:3,semester:1,number:1,name:"Les nombres à quatre chiffres"});
KoCatalog.units.push({id:"fr-ce2-addsub",grade:3,semester:1,number:2,name:"Addition et soustraction à trois chiffres"});
KoCatalog.units.push({id:"fr-ce2-multiplication",grade:3,semester:1,number:3,name:"Multiplier par un chiffre"});
KoCatalog.units.push({id:"fr-ce2-multiplication3",grade:3,semester:1,number:4,name:"Multiplier un nombre à trois chiffres"});
KoCatalog.units.push({id:"fr-ce1-length",grade:2,semester:1,number:3,name:"Mètres et centimètres"});
KoCatalog.units.push({id:"fr-ce2-length",grade:3,semester:1,number:5,name:"Convertir les longueurs"},{id:"fr-ce2-mass",grade:3,semester:1,number:6,name:"Kilogrammes et grammes"});
KoCatalog.units.push({id:"fr-ce2-duration",grade:3,semester:1,number:7,name:"Calculer des durées"});
KoCatalog.units.push({id:"fr-ce2-fractions",grade:3,semester:1,number:8,name:"Représenter et comparer les fractions"});
KoCatalog.units.push({id:"fr-ce1-clock",grade:2,semester:1,number:4,name:"Heures et demi-heures"},{id:"fr-ce2-clock",grade:3,semester:1,number:9,name:"Lire l’heure de cinq en cinq minutes"});
KoCatalog.units.push({id:"fr-ce1-times4",grade:2,semester:1,number:5,name:"Comprendre la table de 4"});
KoCatalog.units.push({id:"fr-ce1-times3",grade:2,semester:1,number:6,name:"Comprendre la table de 3"});
KoCatalog.units.push({id:"fr-ce1-times7",grade:2,semester:1,number:7,name:"Comprendre la table de 7"});
KoCatalog.units.push({id:"fr-ce1-times9",grade:2,semester:1,number:8,name:"Comprendre la table de 9"});
KoCatalog.units.push({id:"fr-ce1-times2",grade:2,semester:1,number:9,name:"Comprendre la table de 2"});
KoCatalog.units.push({id:"fr-ce1-times6",grade:2,semester:1,number:10,name:"Comprendre la table de 6"});
KoCatalog.units.push({id:"fr-ce1-times5",grade:2,semester:1,number:11,name:"Comprendre la table de 5"});
KoCatalog.units.push({id:"fr-ce1-times8",grade:2,semester:1,number:12,name:"Comprendre la table de 8"});
KoCatalog.units.push({id:'fr-cm1-fraction-calcul',grade:4,semester:1,number:1,name:'Calculer avec des fractions de même dénominateur'});
KoCatalog.units.push({id:"fr-cm1-decimals",grade:4,semester:1,number:2,name:"Additionner et soustraire les nombres décimaux"});
KoCatalog.units.push({id:"fr-cm1-decimal-model",grade:4,semester:1,number:3,name:"Représenter et comparer les nombres décimaux"});
KoCatalog.units.push({id:"fr-cm1-division",grade:4,semester:1,number:4,name:"Diviser par un nombre à un chiffre"});
KoCatalog.units.push({id:"fr-cm2-decimal-place",grade:5,semester:1,number:1,name:"Comparer et lire les nombres décimaux"});
KoCatalog.units.push({id:"fr-cm2-decimal-operations",grade:5,semester:1,number:2,name:"Multiplier et diviser les nombres décimaux"});
KoCatalog.units.push({id:'fr-cm2-fraction-multiply',grade:5,semester:1,number:3,name:'Multiplier une fraction et un entier'});
KoCatalog.units.push({id:"fr-cm1-bar",grade:4,semester:1,number:5,name:"Lire et construire un diagramme en barres"});
KoCatalog.units.push({id:"fr-cm2-line",grade:5,semester:1,number:4,name:"Lire et construire une courbe"});
KoCatalog.units.push({id:"fr-cm1-symmetry",grade:4,semester:1,number:6,name:"Construire une figure symétrique"});
KoCatalog.units.push({id:"fr-cm1-capacity",grade:4,semester:1,number:7,name:"Convertir et comparer des contenances"});
KoCatalog.units.push({id:"fr-cm2-numbers",grade:5,semester:1,number:5,name:"Les nombres jusqu’à 999 999 999"});
KoCatalog.units.push({id:"fr-ce1-angles",grade:2,semester:1,number:13,name:"Angles droits et côtés"});
KoCatalog.units.push({id:"fr-cm2-area",grade:5,semester:1,number:6,name:"Convertir et comparer des aires"});
KoCatalog.units.push({id:"fr-cm1-angles",grade:4,semester:1,number:8,name:"Reconnaître les angles"});
KoCatalog.units.push({id:"fr-cm1-numbers",grade:4,semester:1,number:9,name:"Les nombres jusqu’à 999 999"});

// French cycle 3 curriculum additions (reusing existing generators).
(()=>{
const base=globalThis.KoMath;
const defs=[
 {id:'fr-cm1-proportionality',grade:4,number:10,name:'Proportionnalité',profiles:[{name:'Compléter une proportion',kind:'source',source:'6-2-4',skill:'proportion'}]},
 {id:'fr-cm1-perimeter',grade:4,number:11,name:'Périmètre du rectangle',profiles:[{name:'Calculer le périmètre d’un rectangle',kind:'source',source:'5-1-6',skill:'perimeter'}]},
 {id:'fr-cm1-area-formulas',grade:4,number:12,name:'Aire du rectangle',profiles:[{name:'Calculer l’aire d’un rectangle',kind:'source',source:'5-1-6',skill:'area-rectangle'}]},
 {id:'fr-cm2-proportionality',grade:5,number:7,name:'Proportionnalité',profiles:[{name:'Compléter une proportion',kind:'source',source:'6-2-4',skill:'proportion'}]},
 {id:'fr-cm2-perimeter',grade:5,number:8,name:'Périmètres et circonférence',profiles:[
   {name:'Périmètre du rectangle',kind:'source',source:'5-1-6',skill:'perimeter'},
   {name:'Circonférence du cercle',kind:'source',source:'6-2-5',skill:'circle-circumference'}]},
 {id:'fr-cm2-area-formulas',grade:5,number:9,name:'Aire du rectangle',profiles:[{name:'Calculer l’aire d’un rectangle',kind:'source',source:'5-1-6',skill:'area-rectangle'}]},
 {id:'fr-cm2-symmetry',grade:5,number:10,name:'Axes et figures symétriques',profiles:[
   {name:'Construire par symétrie axiale',kind:'symmetry-grid'},
   {name:'Axes de symétrie du carré',kind:'source',source:'5-2-3',skill:'symmetry-line'}]},
 {id:'fr-cm2-angles',grade:5,number:11,name:'Reconnaître et mesurer les angles',profiles:[
   {name:'Angles aigus, droits et obtus',kind:'source',source:'4-1-2',skill:'angle-type'},
   {name:'Mesurer au rapporteur',kind:'source',source:'4-1-2',skill:'angle-measure'}]},
 {id:'fr-cm2-solids',grade:5,number:12,name:'Solides et patrons',profiles:[
   {name:'Faces, sommets et arêtes du pavé droit',kind:'source',source:'5-2-5',skill:'cuboid'},
   {name:'Patron du cube',kind:'source',source:'5-2-5',skill:'cube-net'}]},
 {id:'fr-cm2-time',grade:5,number:13,name:'Heures et durées',profiles:[{name:'Calculer une durée',kind:'duration'}]},
 {id:'fr-cm2-measures',grade:5,number:14,name:'Masse et contenance',profiles:[
   {name:'Kilogrammes et grammes',kind:'mass'},
   {name:'Litres et millilitres',kind:'capacity'}]},
 {id:'fr-cm2-probability',grade:5,number:15,name:'Probabilités',profiles:[{name:'Exprimer une chance sur deux',kind:'source',source:'5-2-6',skill:'chance'}]}
];
KoCatalog.units.push(...defs.map(d=>({id:d.id,grade:d.grade,semester:1,number:d.number,name:d.name})));
const find=id=>defs.find(d=>d.id===id);
const activityTitles=['Comprendre et résoudre','Choisir ou compléter','Vérifier une réponse'];
const decimalText=s=>String(s).split(/(<[^>]*>)/g).map((t,i)=>i%2?t:t.replace(/(\d)\.(\d)/g,'$1,$2')).join('');
const commonText=s=>String(s)
 .replaceAll('친구의 답:','Réponse proposée :')
 .replaceAll('맞으면 ○, 틀리면 ×. 틀린 답은 고치세요.','Écris ○ si la réponse est juste ou × si elle est fausse, puis corrige-la.')
 .replaceAll('바른 답:','Bonne réponse :')
 .replaceAll('문제 그림','Figure de l’exercice')
 .replaceAll('예각','angle aigu').replaceAll('직각','angle droit').replaceAll('둔각','angle obtus')
 .replaceAll('직육면체','pavé droit').replaceAll('정육면체','cube')
 .replaceAll('삼각기둥','prisme droit à base triangulaire').replaceAll('삼각뿔','pyramide à base triangulaire').replaceAll('사각기둥','prisme droit à base quadrangulaire')
 .replaceAll('반지름','rayon').replaceAll('지름','diamètre')
 .replaceAll('직사각형','rectangle').replaceAll('삼각형','triangle').replaceAll('꼭짓점','sommet')
 .replaceAll('불가능하다','0 chance sur 2').replaceAll('반반이다','1 chance sur 2').replaceAll('확실하다','2 chances sur 2');
function sourceQuestion(q,skill,mode){
 let prompt='',reason='';
 if(skill==='proportion'){
  prompt=mode===1?'Choisis le nombre qui complète la proportion.':mode===2?'Complète la proportion, puis vérifie la réponse proposée.':'Trouve le nombre qui complète la proportion.';
  const m=String(q.reason).match(/같은 수 (\d+)/);reason='On multiplie les deux termes par le même nombre'+(m?' : '+m[1]+'.':'.');
 }else if(skill==='perimeter'){
  const c=q.check;prompt='Calcule le périmètre du rectangle en cm.'+(mode===1?' Choisis la bonne réponse.':mode===2?' Vérifie la réponse proposée.':'');reason='('+c.a+' + '+c.b+') × 2 = '+c.result+' cm.';
 }else if(skill==='area-rectangle'){
  const c=q.check;prompt='Calcule l’aire du rectangle de '+c.a+' cm sur '+c.b+' cm.'+(mode===1?' Choisis la bonne réponse.':mode===2?' Vérifie la réponse proposée.':'');reason=c.a+' × '+c.b+' = '+c.result+' cm².';
 }else if(skill==='circle-circumference'){
  prompt='Calcule la circonférence du cercle en cm (π ≈ 3,14).'+(mode===1?' Choisis la bonne réponse.':mode===2?' Vérifie la réponse proposée.':'');reason=decimalText(commonText(q.reason).replace('diamètre × 3.14','diamètre × 3,14'))+'.';
 }else if(skill==='symmetry-line'){
  prompt='Combien un carré possède-t-il d’axes de symétrie ?'+(mode===1?' Choisis la bonne réponse.':mode===2?' Vérifie la réponse proposée.':'');reason='Deux axes passent par les milieux des côtés opposés et deux autres suivent les diagonales.';
 }else if(skill==='angle-type'){
  prompt='Indique si l’angle est aigu, droit ou obtus.'+(mode===1?' Choisis la bonne réponse.':mode===2?' Vérifie la réponse proposée.':'');reason='Un angle aigu mesure moins de 90°, un angle droit 90° et un angle obtus entre 90° et 180°.';
 }else if(skill==='angle-measure'){
  prompt='Lis le rapporteur et indique la mesure de l’angle.'+(mode===1?' Choisis la bonne réponse.':mode===2?' Vérifie la réponse proposée.':'');const m=String(q.reason).match(/눈금 (\d+)°/);reason='Pars de 0° à droite et lis la graduation indiquée'+(m?' : '+m[1]+'°.':'.');
 }else if(skill==='cuboid'){
  const attr=String(q.prompt).includes('모서리')?'arêtes':String(q.prompt).includes('꼭짓점')?'sommets':'faces';prompt='Combien le pavé droit possède-t-il de '+attr+' ?'+(mode===1?' Choisis la bonne réponse.':mode===2?' Vérifie la réponse proposée.':'');reason='Un pavé droit possède 6 faces, 8 sommets et 12 arêtes.';
 }else if(skill==='cube-net'){
  prompt='Dans ce patron de cube, combien de faces ne sont pas colorées ?'+(mode===1?' Choisis la bonne réponse.':mode===2?' Vérifie la réponse proposée.':'');reason='Le patron compte 6 carrés : un est coloré, il en reste 5.';
 }else if(skill==='chance'){
  const src=String(q.prompt);prompt=src.startsWith('빨간 공만')?'Une boîte contient seulement des boules rouges. Quelle est la chance de tirer une boule bleue ?':src.startsWith('파란 공만')?'Une boîte contient seulement des boules bleues. Quelle est la chance de tirer une boule bleue ?':'Une boîte contient une boule rouge et une boule bleue. Quelle est la chance de tirer la boule rouge sans regarder ?';prompt+=mode===1?' Choisis la bonne réponse.':mode===2?' Vérifie la réponse proposée.':'';reason='Compare le nombre de résultats favorables au nombre total de boules.';
 }else throw Error('Unsupported source skill '+skill);
 const convert=skill==='circle-circumference'?x=>decimalText(commonText(x)):commonText;
 return {...q,prompt,reason,visual:convert(q.visual),task:convert(q.task),answer:convert(q.answer)};
}
function generateProfile(d,profile,seed,n){
 const spec=d.profiles[profile];if(!spec)throw Error('Unsupported French curriculum profile');
 if(spec.kind==='symmetry-grid')return FrGeometry.generate(0,seed,n,excluded);
 if(spec.kind==='duration')return FrMeasurement.generateDuration(0,seed,n,excluded);
 if(spec.kind==='mass')return FrMeasurement.generateMetric(2,seed,n,excluded);
 if(spec.kind==='capacity')return FrMeasurement.generateCapacity(0,seed,n,excluded);
 return FrCurriculumSource.generate(spec.source,0,seed,n,[0,1,2].map(mode=>({skill:spec.skill,mode}))).map((section,i)=>({...section,title:activityTitles[i],questions:section.questions.map(q=>sourceQuestion(q,spec.skill,i))}));
}
globalThis.KoMath={...base,
 profiles(id){const d=find(id);return d?d.profiles.map(({name})=>({name})):base.profiles(id);},
 generate(id,p,seed,n){const d=find(id);return d?generateProfile(d,p,seed,n):base.generate(id,p,seed,n);},
 excludeArt(ids){base.excludeArt?.(ids);FrCurriculumSource.excludeArt?.(ids);}
};
})();
