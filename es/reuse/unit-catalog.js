/* The original ko/engine.js is loaded first. Keep its generator and catalog intact. */
(()=>{
const source=KoMath;
const definitions=[["es-1-contar",1,1,"Contar hasta 9","1-1-1","count:9"],["es-1-comparar",1,2,"Comparar números hasta 9","1-1-1","compare:9"],["es-2-decenas-unidades",2,1,"Decenas y unidades","1-2-1","place:2"],["es-2-sumas",2,2,"Sumas hasta 100","2-1-3","add:99"],["es-3-restas",3,1,"Repaso: restas hasta 1 000","3-1-1","sub:999"],["es-3-multiplicaciones",3,2,"Multiplicar por una cifra","3-1-4","mul:99"],["es-4-angulos-rectos",4,1,"Reconocer ángulos rectos","4-1-2","angle-right"],["es-4-simetria",4,2,"Ejes de simetría del cuadrado","4-1-2","symmetry-line"],["es-4-fracciones-figuras",4,3,"Fracciones y figuras","3-1-6","fraction-model"],["es-5-comparar-fracciones",5,1,"Repaso: fracciones con igual denominador","3-2-5","fraction-compare"]];
definitions.push(['es-4-tipos-angulos',4,4,'Ángulos agudos, rectos y obtusos','4-1-2','angle-type'],['es-4-transportador',4,5,'Leer el transportador de ángulos','4-1-2','angle-measure'],['es-5-perimetro-rectangulo',5,2,'Perímetro del rectángulo','5-1-6','perimeter'],['es-5-area-rectangulo',5,3,'Área del rectángulo','5-1-6','area-rectangle']);
definitions.push(['es-2-regla',2,3,'Leer la regla','2-1-4','ruler:cm'],['es-3-centimetros-milimetros',3,3,'Centímetros y milímetros','3-1-5','convert:mm'],['es-3-metros-centimetros',3,4,'Metros y centímetros','2-2-3','convert:m'],['es-4-kilogramos-gramos',4,6,'Kilogramos y gramos','3-2-4','convert:kg'],['es-4-litros-mililitros',4,7,'Litros y mililitros','3-2-4','convert:L']);
definitions.push(...[["es-5-decimales-figuras",5,4,"Décimas y números decimales","3-1-6","decimal-model"],["es-5-centesimas-decimales",5,5,"De centésimas a números decimales","6-1-3","decimal-fraction"],["es-5-simplificar-fracciones",5,6,"Simplificar fracciones","5-1-4","reduce"],["es-5-comparar-denominadores",5,7,"Comparar fracciones diferentes","5-1-4","fraction-compare-unlike"]]);
definitions.push(...[["es-2-leer-tablas",2,4,"Leer tablas de datos","2-2-5","table"],["es-3-pictogramas",3,5,"Leer pictogramas","3-2-6","graph:picture"],["es-4-graficos-barras",4,8,"Leer gráficos de barras","4-1-5","graph:bar"],["es-5-media-aritmetica",5,8,"Calcular la media aritmética","5-2-6","average"]]);
const dataText=s=>String(s).replaceAll('사과','Manzanas').replaceAll('배','Peras').replaceAll('귤','Mandarinas').replace(/● 한 개는 (\d+)명/g,'● = $1 personas').replaceAll('선택한 사람 수 (명)','Número de personas').replace(/>(가|나|다)</g,(_,x)=>'>'+({가:'A',나:'B',다:'C'}[x])+'<');
const decimalText=s=>String(s).split(/(<[^>]*>)/g).map((t,i)=>i%2?t:t.replace(/(\d)\.(\d)/g,'$1,$2')).join('');
const tr=s=>String(s).replaceAll('친구의 답:','Respuesta propuesta:').replaceAll('맞으면 ○, 틀리면 ×. 틀린 답은 고치세요.','Verdadero: ○. Falso: ×. Corrige la respuesta incorrecta.').replaceAll('바른 답:','Respuesta correcta:').replaceAll('예각','agudo').replaceAll('직각','recto').replaceAll('둔각','obtuso').replaceAll('아니요','No').replaceAll('예','Sí').replaceAll('문제 그림','Figura del ejercicio');
globalThis.EsSourceMath=source;globalThis.EsDefinitions=definitions;
globalThis.KoCatalog={units:definitions.map(([id,grade,number,name])=>({id,grade,number,name,semester:1,gradeLabel:'Curso '+grade})),themes:Array.from({length:10},()=>['Paso a paso','Observa, calcula y explica','#278477','#edf8e9','rabbit'])};
globalThis.KoMath={...source,profiles(id){const d=definitions.find(x=>x[0]===id);return d?[{name:d[3]}]:[];},generate(id,p,seed,n){
 const d=definitions.find(x=>x[0]===id);if(!d||p!==0)throw Error('Unsupported Spanish topic');
 return source.generate(d[4],0,seed,n,[0,1,2].map(mode=>({skill:d[5],mode}))).map((s,i)=>({...s,title:['Observa y resuelve','Completa o elige','Comprueba la respuesta'][i],questions:s.questions.map(q=>{
  const skill=d[5].split(':')[0];let prompt,reason;
  if(q.check?.kind==='calc'){const c=q.check;prompt=['Calcula el resultado.','Escribe el número que falta.','Comprueba el resultado propuesto.'][i];reason=c.x+' '+c.op+' '+c.y+' = '+c.result;}
  else if(skill==='perimeter'){const c=q.check;prompt='¿Cuál es el perímetro del rectángulo en cm?';reason='('+c.a+' + '+c.b+') × 2 = '+c.result+' cm';}
  else if(skill==='area-rectangle'){const c=q.check;prompt='¿Cuál es el área del rectángulo en cm²?';reason=c.a+' × '+c.b+' = '+c.result+' cm²';}
  else if(skill==='angle-type'){prompt='¿El ángulo es agudo, recto u obtuso?';reason='Agudo: menos de 90°. Recto: 90°. Obtuso: más de 90° y menos de 180°.';}
  else if(skill==='angle-measure'){prompt='Lee el transportador. ¿Cuánto mide el ángulo?';const degrees=q.reason.match(/(\d+)°를/)[1];reason='Empieza en el cero de la derecha: el otro lado marca '+degrees+'°.';}
  else if(skill==='ruler'){prompt='¿Cuánto mide la barra en cm?';reason='Resta la posición inicial de la final: '+q.reason+'.';}
  else if(skill==='convert'){const m=q.prompt.match(/^(\d+)(\w+) (\d+)(\w+)는 몇 (\w+)인가요/);prompt='Expresa '+m[1]+' '+m[2]+' y '+m[3]+' '+m[4]+' en '+m[5]+'.';reason=q.reason.replaceAll('입니다.','.');}
  else if(skill==='decimal-model'){prompt='Escribe la parte coloreada como número decimal.';reason=q.reason;}
  else if(skill==='decimal-fraction'){const n=q.prompt.match(/^(\d+)\/100/)[1];prompt='Escribe '+n+'/100 como número decimal.';reason=n+' centésimas: utiliza dos cifras después de la coma.';}
  else if(skill==='reduce'){prompt='Reduce la fracción a su forma irreducible.';const n=q.reason.match(/(\d+)로/)[1];reason='Divide el numerador y el denominador por su máximo común divisor, '+n+'.';}
  else if(skill==='fraction-compare-unlike'){prompt='Compara las fracciones con distinto denominador.';reason='Expresa las fracciones con un denominador común y compara los numeradores.';}
  else if(skill==='table'){const fruit=q.prompt.match(/^(사과|배|귤)/)[1];prompt='¿Cuántas frutas hay en la columna '+dataText(fruit)+'?';reason='Lee el número que aparece debajo del nombre de la fruta en la tabla.';}
  else if(skill==='graph'){if(i===2){prompt='Suma los valores de las categorías A y B.';reason=q.reason;}else{const label=({가:'A',나:'B',다:'C'})[q.prompt[0]];prompt='¿Cuántas personas han elegido la categoría '+label+'?';reason='Lee la escala o la leyenda y encuentra el valor de la categoría.';}}
  else if(skill==='average'){const sum=q.reason.match(/합 (\d+)/)[1];prompt='Calcula la media de los tres números.';reason='Divide la suma '+sum+' entre el número de datos, 3.';}
  else if(skill==='count'){prompt='¿Cuántos puntos hay?';reason='Cuenta cada punto una sola vez.';}
  else if(skill==='compare'){prompt='Compara los números. ¿Qué signo es correcto?';reason='Compara las cantidades y usa >, < o =.';}
  else if(skill==='place'){const number=q.prompt.match(/^\d+/)[0],place=q.prompt.includes('십의')?'decenas':'unidades';prompt='¿Cuál es la cifra de las '+place+' en el número '+number+'?';reason='Desde la derecha están las unidades y después las decenas.';}
  else if(skill==='angle-right'){prompt='¿La figura muestra un ángulo recto?';reason='Compara el ángulo con la esquina de una hoja rectangular.';}
  else if(skill==='symmetry-line'){prompt='¿Cuántos ejes de simetría tiene un cuadrado?';reason='Dos ejes pasan por los puntos medios de los lados y otros dos son las diagonales.';}
  else if(skill==='fraction-model'){prompt='¿Qué fracción representa la parte coloreada?';reason='El denominador indica todas las partes iguales; el numerador, las partes coloreadas.';}
  else{prompt='Compara las dos fracciones.';reason='Si los denominadores son iguales, compara los numeradores.';}
  if(!q.check&&i===1)prompt+=' Elige la respuesta.';
  if(!q.check&&i===2)prompt+=' Comprueba la respuesta propuesta.';
  const display=skill.startsWith('decimal-')?s=>decimalText(tr(s)):['table','graph'].includes(skill)?s=>dataText(tr(s)):tr;
  return {...q,prompt,reason:skill.startsWith('decimal-')?decimalText(reason):reason,visual:display(q.visual),task:display(q.task),answer:display(q.answer)};
 })}));
}};
})();
