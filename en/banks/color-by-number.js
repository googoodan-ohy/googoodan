/* Presentation only: operands and answers reuse Worksheets.generate. */
Worksheets.types.push({id:'color-by-number',title:'Color by Number Math Worksheets',family:'Practice extensions',group:'Practice extensions',example:'2 + 3',instruction:'Solve each calculation. Use the answer ranges in the key to color the mosaic.',customWorksheet:true});
{const original=Worksheets.generate;Worksheets.generate=(id,seed,n)=>original(id==='color-by-number'?'add-small':id,seed,n);}
