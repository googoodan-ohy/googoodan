/* Common worksheet frame. Country-specific text is passed in; branding stays fixed. */
(function(root){
'use strict';
const brand='googoodan.com';
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function render({title,mode,labels,instruction,questionsHtml,setId,layout='vertical',numberDomain='',questionCount}){
 const rows=Math.ceil(questionCount/(['book-measurement','line-drawing','symmetry-drawing','number-name-writing','shape-explanation','equal-parts-drawing','pictures','story-pairs','repeating-patterns','ordinal-pictures'].includes(layout)?1:['angle-activities','unit-conversion','time-stories','forward-sequence','factor-classification','decimal-fraction-conversion','unlike-fraction-comparison','missing-factor-dividend','equation-truth','measurement-lineplots','vote-graphs','length-ordering','odd-even','ten-change','large-comparison','rounding','coordinate-reading','volume-layers','area-tiles','rectangle-measurement','clock-reading','expanded-form','shaded-fractions','common-denominators','fraction-simplify','decimal-comparison','decimal-place-digits','fraction-comparison','fraction-products','decimal-products','missing','stories','early-pictures','early-activities','number-words','number-order','number-neighbors','number-line','ten-frame','make-ten-missing','length-compare','shape-count','flat-shapes','shape-sides','number-bonds'].includes(layout)?2:3));
 if(!Number.isInteger(rows)||rows<1)throw Error('Invalid worksheet row count');
 if(!['questions','answers'].includes(mode))throw Error('Unknown worksheet mode');
 return `<article class="sheet" data-mode="${mode}" data-layout="${escape(layout)}" data-number-domain="${escape(numberDomain)}" style="--worksheet-rows:${rows}"><div class="sheet-top"><div class="sheet-brand-row"><span class="sheet-brand">${brand}</span><strong class="sheet-mode">${escape(labels[mode])}</strong></div><h2>${escape(title)}</h2></div><div class="sheet-meta"><span>${escape(labels.name)}: __________________</span><span>${escape(labels.date)}: __________</span></div><p class="sheet-instruction">${escape(instruction)}</p><div class="questions">${questionsHtml}</div><div class="sheet-foot"><strong>${brand}</strong><span>${escape(labels.set)} ${escape(setId)}</span></div></article>`;
}
root.GoogoodanWorksheet={brand,escape,render};
})(globalThis);
