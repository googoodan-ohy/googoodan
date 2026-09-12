/* The original ko/engine.js is loaded first. Keep its generator and catalog intact. */
(()=>{
const source=KoMath;
const definitions=[["es-1-contar",1,1,"Contar hasta 9","1-1-1","count:9"],["es-1-comparar",1,2,"Comparar números hasta 9","1-1-1","compare:9"],["es-2-decenas-unidades",2,1,"Decenas y unidades","1-2-1","place:2"],["es-2-sumas",2,2,"Sumas hasta 100","2-1-3","add:99"],["es-3-restas",3,1,"Repaso: restas hasta 1 000","3-1-1","sub:999"],["es-3-multiplicaciones",3,2,"Multiplicar por una cifra","3-1-4","mul:99"],["es-4-angulos-rectos",4,1,"Reconocer ángulos rectos","4-1-2","angle-right"],["es-4-simetria",4,2,"Ejes de simetría del cuadrado","4-1-2","symmetry-line"],["es-4-fracciones-figuras",4,3,"Fracciones y figuras","3-1-6","fraction-model"],["es-5-comparar-fracciones",5,1,"Repaso: fracciones con igual denominador","3-2-5","fraction-compare"]];
const tr=s=>String(s).replaceAll('친구의 답:','Respuesta propuesta:').replaceAll('맞으면 ○, 틀리면 ×. 틀린 답은 고치세요.','Verdadero: ○. Falso: ×. Corrige la respuesta incorrecta.').replaceAll('바른 답:','Respuesta correcta:').replaceAll('아니요','No').replaceAll('예','Sí').replaceAll('문제 그림','Figura del ejercicio');
globalThis.EsSourceMath=source;globalThis.EsDefinitions=definitions;
globalThis.KoCatalog={units:definitions.map(([id,grade,number,name])=>({id,grade,number,name,semester:1,gradeLabel:'Curso '+grade})),themes:Array.from({length:10},()=>['Paso a paso','Observa, calcula y explica','#278477','#edf8e9','rabbit'])};
globalThis.KoMath={...source,profiles(id){const d=definitions.find(x=>x[0]===id);return d?[{name:d[3]}]:[];},generate(id,p,seed,n){
 const d=definitions.find(x=>x[0]===id);if(!d||p!==0)throw Error('Unsupported Spanish topic');
 return source.generate(d[4],0,seed,n,[0,1,2].map(mode=>({skill:d[5],mode}))).map((s,i)=>({...s,title:['Observa y resuelve','Completa o elige','Comprueba la respuesta'][i],questions:s.questions.map(q=>{
  const skill=d[5].split(':')[0];let prompt,reason;
  if(q.check?.kind==='calc'){const c=q.check;prompt=['Calcula el resultado.','Escribe el número que falta.','Comprueba el resultado propuesto.'][i];reason=c.x+' '+c.op+' '+c.y+' = '+c.result;}
  else if(skill==='count'){prompt='¿Cuántos puntos hay?';reason='Cuenta cada punto una sola vez.';}
  else if(skill==='compare'){prompt='Compara los números. ¿Qué signo es correcto?';reason='Compara las cantidades y usa >, < o =.';}
  else if(skill==='place'){const number=q.prompt.match(/^\d+/)[0],place=q.prompt.includes('십의')?'decenas':'unidades';prompt='¿Cuál es la cifra de las '+place+' en el número '+number+'?';reason='Desde la derecha están las unidades y después las decenas.';}
  else if(skill==='angle-right'){prompt='¿La figura muestra un ángulo recto?';reason='Compara el ángulo con la esquina de una hoja rectangular.';}
  else if(skill==='symmetry-line'){prompt='¿Cuántos ejes de simetría tiene un cuadrado?';reason='Dos ejes pasan por los puntos medios de los lados y otros dos son las diagonales.';}
  else if(skill==='fraction-model'){prompt='¿Qué fracción representa la parte coloreada?';reason='El denominador indica todas las partes iguales; el numerador, las partes coloreadas.';}
  else{prompt='Compara las dos fracciones.';reason='Si los denominadores son iguales, compara los numeradores.';}
  if(!q.check&&i===1)prompt+=' Elige la respuesta.';
  if(!q.check&&i===2)prompt+=' Comprueba la respuesta propuesta.';
  return {...q,prompt,reason,visual:tr(q.visual),task:tr(q.task),answer:tr(q.answer)};
 })}));
}};
})();
