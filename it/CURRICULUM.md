# Italian edition — initial release

Checked 2026-09-12. This release contains 201 HTML pages, 89 curriculum drill profiles and 88 activity profiles. These are selected exercises, not a complete curriculum. The common calculator also reuses the numeric families already present on the Korean home page.

## Sources and placement

- DM 221/2025, article 1: adoption from 2026/27 beginning with first classes, gradually. https://www.gazzettaufficiale.it/atto/serie_generale/caricaArticoloDefault/originario?atto.codiceRedazionale=26G00021&atto.dataPubblicazioneGazzetta=2026-01-27&atto.tipoProvvedimento=DECRETO
- Final annex, part 3, mathematics: primary objectives at the ends of third and fifth class. https://www.gazzettaufficiale.it/atto/serie_generale/caricaArticolo?art.codiceRedazionale=26G00021&art.dataPubblicazioneGazzetta=2026-01-27&art.flagTipoArticolo=1&art.idArticolo=1&art.idGruppo=0&art.idSottoArticolo=1&art.idSottoArticolo1=10&art.progressivo=3&art.versione=1
- Prior cohort reference, DM 254/2012: https://www.mim.gov.it/documents/20182/51310/DM%2B254_2012.pdf

Class labels are an editorial progression within these goals, not a claim that national regulations mandate these exact units in these exact years. Class-five visual fractions are explicitly a prerequisite review. No regional curriculum equivalence is asserted; this is a national-reference selection.

## Reuse

- Common arithmetic: the same `/en/types.js` used by the Korean home page, with translated existing interface and times-table selector.
- Activities: unchanged `/ko/engine.js`, original Korean catalog, explicit customSpecs. `it/reuse/unit-catalog.js` changes display text and catalog placement only.
- Class-one drills: original Korean `1-1-3` definitions and unchanged `/ko/drill-engine.js`. Profile `--3` was excluded because its generic subtraction source can exceed the stated range of nine. Internal IDs remain unchanged where engine behavior depends on them; public paths use Italian names.
- CSS, navigation, themes and paper layout are shared with the Korean edition. No new calculation engine was implemented.

## Validation and remaining work

Initial validation: 12 common routes; 10 activity routes with 10 seeds each; 7 drill routes; 2,700 original-versus-localized activity answers; 27 one-page activity/drill A4 PDFs; A4 and Letter common-table PDFs; four-page PDF download containing two sets with answers.

Still to expand: drill units for class five; broader picture-based activities, geometry, metric measurement, data and fractions; class-specific static directories. Reuse compatible Korean material and validate each mapping before adding it. Do not pad counts with duplicate pages or unrelated review.

Search wording was checked against Italian educational resources, including Giunti Scuola's “Addizioni e sottrazioni” and Cose per Crescere's fractions/primary worksheets. No search-volume data or top-100 keyword coverage has been measured.

Build experiments and checks are in `.work-english/italian/`. The draft builders create noindex pages and must not be run over a released edition without the release preparation and validation steps. Preserve current metadata and cache versions when rebuilding.

## Three-digit addition and subtraction

2026-09-12: Added 21 original Korean 3-1-1 drill profiles as an editorial class-three progression: horizontal and written addition/subtraction, carry/borrowing practice, directly related two-digit review, missing numbers/digits and relational problems. Operand length is three digits; addition results may exceed 999. All original source, condition, mode, layout, pool and generation values are retained.

Validation: source-comparison checks now cover 4,480 drill questions, plus the prior 2,700 activity answers. All 21 new routes were browser-checked for correct selection, descriptions, answers and regeneration. Their 42 question/answer A4 PDFs each contain one page.

## Two-digit addition and subtraction

2026-09-12: Added 25 original Korean 2-1-3 profiles for class two. Basic horizontal/vertical calculations, with/without carrying or borrowing, prerequisite one-digit work, missing digits/numbers, and relational problems are separated into the existing four menu groups. The stated two-digit range refers to operands; sums can exceed 99. Original generation logic and settings remain unchanged.

Validation: 8,480 drill questions compared to the untranslated generator, plus 2,700 activity answers. All 25 added pages pass browser selection, static-description, answer and regeneration checks. All 50 question/answer A4 PDFs contain one page.

## Multiplication and tables

2026-09-12: Added 20 original Korean 3-1-4 profiles to class three as a second arithmetic unit. Two-digit by one-digit multiplication, prerequisite tables, missing factors/digits and equal-group problems reuse the original generation. Equal-group problems include inverse division; they are identified in the static explanation. Four complete Italian sentence templates translate the original multiplicative relations without changing answers or working.

Validation: 11,680 drill questions compared with the untranslated generator; 20 browser routes passed selection, regeneration, descriptions and answers. All 40 new question/answer A4 PDFs contain one page. The 100-page static check passes.

## Division with and without remainders

2026-09-12: Added 16 profiles as an editorial class-four progression: 15 original Korean 3-2-3 calculation, missing-number/digit and story profiles plus the original 3-1-3 exact-division profile for prerequisite review. Repeated multiplication-table review pages were not copied again. Internal source IDs remain unchanged to preserve generator behavior.

One full Italian remainder-story template and display translations for group/remainder labels preserve quotient, remainder and calculation. Validation compares 14,240 drill questions, retaining all original numbers and working; all 16 routes pass browser checks and all 32 question/answer A4 PDFs have one page.

## Illustrated geometry and measurement

2026-09-12: Added angle classification, protractor reading, rectangle perimeter and rectangle area. Original angle-type, angle-measure, perimeter and area-rectangle branches and SVG diagrams remain unchanged. Display wording, answer labels and explanations are localized. Activities are placed in classes four/five as an editorial progression within primary geometry goals.

Validation: 3,780 original-versus-localized activity answers across all 14 profiles; four routes with ten seeds each pass browser/diagram checks. All eight new question/answer A4 PDFs contain one page. Diagrams are marked as schematic in the static explanation.

2026-09-12: Five grade-directory pages added for discovery; profile counts are unchanged. See SEARCH_DISCOVERY.md.

## Metric measurement activities

2026-09-12: Added original ruler:cm, convert:mm, convert:m, convert:kg and convert:L activities with full Italian prompts and unchanged source values. Conversions express compound measurements in the smaller unit; reverse conversions are not claimed. Grade placement is editorial. Grade directories were rebuilt to include the new activities.

Validation: 5,130 source-compared activity answers across 19 profiles; five new routes with ten seeds each pass browser checks. All ten question/answer A4 PDFs contain one page. Static checks pass for 130 Italian pages.

## Decimal and fraction activities

2026-09-12: Added original decimal-model, decimal-fraction, reduce and fraction-compare-unlike activities. Decimal points are localized to commas only in displayed text nodes; SVG attributes and source numeric values stay unchanged. These selected primary activities are placed editorially in classes four/five.

Validation: 6,210 activity answers compared to source across 23 profiles. Four routes with ten seeds each pass descriptions, answers and diagrams; all eight new question/answer A4 PDFs contain one page. Grade directories include the activities and static checks pass for 134 pages.

## Tables, charts and arithmetic mean

2026-09-12: Added table, graph:picture, graph:bar and average from the original Korean engine. Class-two tables, class-three pictograms, class-four bar charts and class-five arithmetic mean are editorial placements within the documented primary data objectives. Values, chart coordinates, scales and correct answers are unchanged; visible labels and full instructions are Italian. The pictogram legend explicitly states ten people per symbol.

Validation: 7,290 activity answers and 14,240 drill questions agree with the original generators. Four new browser routes tested with ten seeds each; all eight question/answer A4 PDFs contain one page. Static checks pass for 138 Italian pages.

## Clock and time measures

2026-09-12: Added clock:30, calendar, clock:5, elapsed and time-seconds using the unchanged Korean engine. Course placement: class two for hours/half-hours and weeks/days, class three for five-minute readings and finding the final time, class four for minutes/seconds. These are editorial selections within time measurement, not a complete annual curriculum. The elapsed source gives an initial time and duration and asks for the final time; its displayed title reflects that precise task. Time labels use h:mm without changing the generated values.

Validation: 8,640 activity answers and 14,240 drill questions agree with their source. Five browser routes with ten seeds each pass diagrams, descriptions and answers. All ten question/answer PDFs contain one A4 page. Static checks pass for 143 Italian pages.

## Early plane geometry

2026-09-12: Added flat-basic, flat-count, lines and polygon using unchanged Korean drawings and generators. Class one recognizes triangle/quadrilateral/circle, class two counts straight sides, class three distinguishes line/ray/segment and counts polygon sides. These are editorial placements within primary plane-geometry objectives. Italian names preserve the original geometric categories: the four-sided figure is labelled quadrilatero rather than narrowing it to square.

Validation: 9,720 activity answers and 14,240 drill questions agree with source. Four new routes with ten seeds each pass images, descriptions and answers; all eight A4 question/answer PDFs contain one page. Static checks pass for 147 Italian pages.

## Fraction addition and subtraction

2026-09-12: Added original fraction-add-same/fraction-sub-same in class four and fraction-add/fraction-sub in class five. The latter allow coinciding or different denominators, so titles do not claim exclusively unlike denominators. Class-four originals retain their unreduced answers; class-five originals reduce results. No calculation or fraction-rendering logic was changed. Missing-numerator tasks preserve the original denominator and expected numerator.

Validation: 10,800 activity answers and 14,240 drill questions agree with source. Four browser routes with ten seeds each pass descriptions, answers and writing boxes. All eight question/answer PDFs contain one A4 page. Static checks pass for 151 Italian pages.

## Decimal operations

2026-09-12: Added decimal-add/sub in class four and decimal-mul-whole/div-whole in class five using unchanged Korean generators. Decimal text uses commas without touching SVG coordinates or numeric data. Corrected the calculation adapter so result-check questions include the original expression; explanations now reuse the source-formatted equation instead of exposing raw floating-point results. This also repairs existing integer result-check instructions.

Validation: 11,880 activity answers and 14,240 drill questions agree with source. Result-check tests require the operation to be visible. Four new browser routes with ten seeds each pass descriptions, answers and writing boxes; all eight question/answer PDFs contain one A4 page. Static checks pass for 155 Italian pages.

## Place digits, factors and multiples

2026-09-12: Added place:3 and place:4 in classes three/four, factor and multiple in class five. The digit prompt maps units/tens/hundreds/thousands explicitly and asks for the digit, not its total place value. Multiples explicitly means the first three positive multiples, matching the unchanged original generator (zero excluded). Factors are positive divisors.

Validation: 12,960 activity answers and 14,240 drill questions agree with source. Four browser routes with ten seeds each pass descriptions and answers; all eight question/answer PDFs contain one A4 page. Static checks pass for 159 Italian pages.

## Rounding and calculation strategies

2026-09-12: Added round-nearest, mixed, mixed-bracket and common-denominator as editorial class-five practice. Rounding covers three-digit numbers to tens/hundreds; order tasks combine addition/multiplication; common-denominator tasks ask for both equivalent fractions, not just the denominator. Generation, choices and answers remain the original Korean implementations.

Validation: 14,040 activity answers and 14,240 drill questions agree with source. Four routes with ten seeds each pass descriptions and answers; all eight question/answer PDFs contain one A4 page. Static checks pass for 163 Italian pages.

## Polygon areas

2026-09-12: Added area-triangle, area-parallelogram, area-trapezoid and area-rhombus as editorial class-five practice. Original numeric measurements and diagrams are reused. Prompts include base/height or diagonals and cm². Static text clarifies that the drawing is schematic and measurements come from the question, not a ruler.

Validation: 15,120 activity answers and 14,240 drill questions agree with source. Four routes with ten seeds each pass images, descriptions and answers; all eight question/answer PDFs contain one A4 page. Static checks pass for 167 Italian pages.

## Percentages, chance and missing data

2026-09-12: Added percent, chance and average-missing as selected class-five practice. Percent asks for the percentage represented by a part/whole, not for a quantity from a given percentage. Chance retains the three original red/blue-ball scenarios: impossible, certain and 50%. Missing-data questions retain the original three-number mean. Full instructions and display labels are localized; generation is unchanged.

Validation: 15,930 activity answers and 14,240 drill questions agree with source. Three browser routes with ten seeds each pass descriptions and answers; all six question/answer PDFs contain one A4 page. Static checks pass for 170 Italian pages.


## Cubes and spatial visualization

2026-09-12: Four profiles reuse cube-count (class-two adjacent cubes; class-five height map), cube-view and cube-missing. Class-five placement is editorial spatial visualization practice supported by DM254/2012 geometry objectives, https://www.mim.gov.it/documents/20182/51310/DM%2B254_2012.pdf. A height map is explicitly labelled as a top view, with the front at its lower edge. No cube-generation logic changed.

Validation: 17,010 activity answers and 14,240 drill questions match original engines; 174 static pages pass. Four browser routes, ten seeds each, and eight single-page A4 question/answer PDFs pass.


2026-09-12: Added introductory solid identification in year two (original solid-basic, 2-2-6). Cuboid, cylinder and sphere display names localized, including answer choices; source generation and pictures preserved. This is selected introductory geometry practice, not full curriculum coverage. Validation: 17,280 activity answers and 14,240 drill questions match original; browser, static metadata and both one-page A4 PDFs pass.


2026-09-12: Added first-year shape classification/counting (sort) and direct length comparison (length-compare). Original symbol groups and bar figures reused without changing values or generation. Diagram labels translated to A/B and short instructions to avoid SVG clipping. Selected introductory practice only. Validation: 17,820 activity answers and 14,240 drills agree with Korean sources; browser routes, regenerated sets and A4 question/answer PDFs pass.


2026-09-12: Added original pattern (ABC/AAB repeating shapes) in year one and sequence:100 (consecutive numbers, step one) in year two. Static descriptions state these limits. Reused source figures, answer boxes and generation unchanged. Validation: 18,360 activity answers and 14,240 drill questions agree with originals; all new browser routes and one-page A4 question/answer PDFs pass.


2026-09-12: Added bond:10 (year one, totals 2–10, not always ten) and array (year two, 2–6 rows and 2–9 columns). Original dots, grids, arithmetic, missing-factor questions and checks remain unchanged. These are introductory selected practice. Validation: 18,900 activity answers and 14,240 drills match original engines; local browser, regenerated sets, static metadata and all four A4 question/answer PDFs per language pass.


2026-09-12: Added decimal-mul and decimal-div, retaining original arithmetic and answers. Localized decimal commas apply to expressions, answers and explanations without changing SVG attributes. Placement: class five in Italy; course six in Spain. Division is exact, at most one decimal place in the quotient. Validation: 19,440 activity answers and 14,240 drills match original; browser routes and one-page A4 question/answer PDFs pass.


2026-09-12 usability audit: Localized the remaining 78 copy-count labels from Sets to Serie. At a 390px mobile viewport, unit selection works and actual PDF download produces four A4 pages for two question/answer sets, with different questions between sets. The same download check passed for Spanish. No worksheet generation or CSS changed.


2026-09-12: Versioned dynamically loaded html2canvas/jsPDF URLs and every reference to the language PDF exporter. Actual four-page question/answer download passed for both editions after the cache change. PDF generation and worksheet calculations are unchanged.


2026-09-12: Added two standalone 100-cell calculation grids (addition and multiplication), outside the 72 activity-profile count. Korean hundred.js copied with only two visible labels translated; Korean hundred.css reused directly. Static 10x10 blank table remains readable without JS. All 100 answers checked over ten shuffled grids per page, plus eight single-page A4 question/answer PDFs across both editions.


2026-09-12: Added actual grid translation, reflection and clockwise 90-degree rotation from the unchanged geometry-targets bank. A scoped wrapper captures that bank separately so numeric customSpecs are preserved. Questions draw the destination, reconstruct the original, and check a proposed transformation. Decorative art URLs are localized to /ko/art/; category keys and generation are unchanged. Placement: translation/reflection in year four; rotation in Italy five / Spain six. Validation: 20,250 activity answers plus 14,240 drill questions agree with originals; all six routes, twelve A4 PDFs and hidden/visible solution polygons pass.


2026-09-12: Reused data-targets line and percent banks in a scoped wrapper. Line tasks find tied maxima, draw from a table and compare consecutive increases; percent tasks use a total of 200, cumulative strip boundaries and paired category comparison. Original values and graphics preserved. Weekday/category labels and full prompts localized; section headings now describe actual drawing/data tasks. Validation: 20,790 activity answers and 14,240 drills match original; browser regeneration and A4 PDFs pass.


2026-09-12: Reused data-targets bar construction/comparison and picture-graph-to-table activities. Year-four bars include tied maxima, totals, drawing and paired-category differences. Year-three pictograms retain one symbol = 10 and correct confusion between symbols and actual counts. Original bank and artwork unchanged. Validation: 21,330 activity answers and 14,240 drills agree with original; all new routes and eight A4 question/answer PDFs across editions pass.


2026-09-12: Added circle-parts and circle-size as editorial year-four practice. Original radius figure and diameter calculation reused, with complete terminology translated before shorter overlapping words. Static text states that the drawing is schematic and measurements come from the given labels. Validation: 21,870 activity answers and 14,240 drills agree with original; all four new routes and eight one-page A4 PDFs pass.


2026-09-12: Added triangle-type and quad-type in editorial year four. Triangle angle data and quadrilateral property scenarios preserved; full shape names translated before overlapping fragments. Quadrilateral instructions ask for the most specific name to accommodate inclusive classifications. Validation: 22,410 activity answers and 14,240 drills agree with original; browser and A4 question/answer PDFs pass.


2026-09-12: Reused measurement-targets m/cm, kg/g and L/mL profiles in a scoped wrapper. Added reverse conversion into compound units and comparisons, alongside forward conversion. Original factors, values, bank indices and decorative art preserved. Grade placement remains editorial practice. Validation: 23,220 activity answers and 14,240 drills match original; six routes and twelve A4 question/answer PDFs pass.


2026-09-12: Added cm/mm and km/m measurement-bank profiles, with both-direction conversions and comparisons. Exact original bank indices 0/1 from 3-1-5 are used. Validation: 23,760 activity answers and 14,240 drills agree with original; four new browser routes and eight A4 question/answer PDFs pass.
