# Spanish edition — initial scope

2026-09-12: 171 HTML pages; 59 selected activity profiles and 89 arithmetic profiles. This is not a complete curriculum or a claim of coverage of every autonomous community.

Official source checked: [Real Decreto 157/2022, consolidated BOE text](https://www.boe.es/buscar/act.php?id=BOE-A-2022-3296). National minimum content is organized in two-year cycles. First-cycle number work extends to 999; second-cycle number work extends to 9999 and includes proper fractions with denominators up to 12. Course placement here is editorial within that progression. Third-course subtraction and fifth-course fraction comparison are explicitly prerequisite review.

[Regional curriculum directory](https://educagob.educacionfpydeportes.gob.es/curriculo/curriculo-lomloe/menu-curriculos-basicos/ed-primaria/curriculo-comunidades-autonomas.html). No region-specific mapping is implemented yet. Do not present a regional selector as completed coverage until its mapping is verified.

The common menus and engines reuse Korean assets. Activity generation uses the unchanged ko/engine.js with explicit original skill/mode selections. Arithmetic drills use the original Korean 1-1-3, 2-1-3, 3-1-1, 3-1-4, 3-1-3 and 3-2-3 profiles and ko/drill-engine.js. Display translation does not alter generated numbers, answers or work. Profile --3 is excluded because the generic subtraction source can exceed the declared range of nine. Internal Korean IDs remain where generator behavior depends on them; public URLs use Spanish words.

Validation: 2,700 activity answers compared with original generation; 1,120 drill questions compared for answers, operands and working; browser checks for all 13 common routes, 10 activity routes and 7 drill routes. A4/Letter common-table PDFs each have one page. Activity and drill print checks must be retained before publication.

Remaining: broader sixth-course material, broader geometry, measurement, data, fractions, regional mappings, and more arithmetic units. Reuse compatible Korean activities only; do not fill gaps with unrelated topics. No search-volume or ranking claims have been measured.

Build experiments are under .work-english/spanish/. Builders recreate drafts and must not overwrite published pages without release preparation, version updates and verification.

## Two- and three-digit calculation expansion

2026-09-12: Added 25 two-digit profiles in course two and 21 three-digit profiles in course three. Course-two sums can exceed 99; course-three sums can exceed 999. The ranges refer to operands and stay within the relevant national cycle endpoints. Prerequisite practice is labelled Repaso. Region-specific alignment remains unimplemented.

Validation: 8,480 original-versus-localized drill questions plus 2,700 activity answers. All 46 added routes passed browser checks for descriptions, selected profiles, answers and regeneration. All 92 question/answer A4 PDFs contain one page. Titles, canonical links and local asset references pass the 80-page static check.

## Multiplication and equal groups

2026-09-12: Added 20 original Korean 3-1-4 profiles to course three. Two-digit by one-digit multiplication, prerequisite tables, missing factors/digits and equal groups use original generation settings. Four full Spanish templates translate multiplicative relations, including inverse division, without changing the answer or calculation.

Validation: 11,680 original-versus-localized drill questions; all 20 new routes pass selection, description, regeneration and answer checks. All 40 question/answer A4 PDFs contain one page. Static checks pass for 100 Spanish pages.

## Division with and without remainders

2026-09-12: Added 16 profiles to course four: 15 original Korean 3-2-3 calculation, missing-digit/number and story profiles, plus original 3-1-3 exact division as prerequisite review. Repeated table worksheets were not added again. Course placement is editorial within the second-cycle arithmetic objectives, not autonomous-community certification.

The complete remainder-story translation preserves quotient and remainder; only group and remainder wording changes. Validation: 14,240 original-versus-localized drill questions; 16 new browser routes pass descriptions, selection, regeneration and answers. All 32 new question/answer A4 PDFs contain one page. Static checks pass for 116 pages.

## Illustrated angles, perimeter and area

2026-09-12: Added angle classification and protractor reading in course four, rectangle perimeter and area in course five. The original Korean angle-type, angle-measure, perimeter and area-rectangle generators and SVG diagrams are unchanged. Spanish prompts, labels and explanations are localized. Course placement remains editorial within the national cycles.

Validation: 3,780 activity answers compared to source across 14 profiles; four new routes with ten seeds each pass diagram, description and answer checks. All eight question/answer A4 PDFs contain one page. Static checks pass for 120 pages.

2026-09-12: Five grade-directory pages added for discovery; profile counts are unchanged. See SEARCH_DISCOVERY.md.

## Metric measurement

2026-09-12: Added ruler:cm, convert:mm, convert:m, convert:kg and convert:L using the original Korean generator and data. Full Spanish instructions express compound measurements in the smaller unit; reverse conversions are not claimed. Grade directories include these activities.

Validation: 5,130 source-compared activity answers across 19 profiles; five routes with ten seeds each pass browser checks. All ten question/answer A4 PDFs contain one page. Static checks pass for 130 Spanish pages.

## Decimals and fractions

2026-09-12: Added decimal-model, decimal-fraction, reduce and fraction-compare-unlike using unchanged Korean generators. Display translation preserves numerical values and SVG coordinates; decimal text uses a comma. All four are editorial course-five placements within the third-cycle number representation, fraction comparison and divisibility objectives of [RD 157/2022](https://www.boe.es/buscar/act.php?id=BOE-A-2022-3296). This is selected practice, not complete regional curriculum coverage.

Validation: 6,210 activity answers and 14,240 drill questions agree with their original generators. Four new routes with ten seeds each pass diagram, description and answer checks. All eight question/answer PDFs contain one A4 page. Static checks pass for 134 pages.

## Tables, charts and arithmetic mean

2026-09-12: Added table, graph:picture, graph:bar and average from the unchanged Korean engine. Course-two tables, course-three pictograms, course-four bar charts and course-five arithmetic mean are editorial placements within the national data-reading progression. RD 157/2022 third-cycle objectives explicitly include mean; regional coverage is not claimed. Values, scales and chart coordinates are preserved. The pictogram legend states ten people per symbol.

Validation: 7,290 activity answers and 14,240 drill questions agree with the original generators. Four new browser routes tested with ten seeds each; all eight question/answer A4 PDFs contain one page. Static checks pass for 138 Spanish pages.

## Clock and time measures

2026-09-12: Added clock:30, calendar, clock:5, elapsed and time-seconds using unchanged Korean generators. Course two: hours/half-hours and weeks/days; course three: five-minute readings and finding a final time; course four: minutes/seconds. Placement is editorial within national time-measurement progression, not regional certification. The elapsed source asks for a final time given an initial time and duration, so the title is Calcular la hora final. Display labels use h:mm and preserve original times.

Validation: 8,640 activity answers and 14,240 drill questions agree with the original generators. Five browser routes with ten seeds each pass images, descriptions and answers. All ten question/answer PDFs contain one A4 page. Static checks pass for 143 Spanish pages.

## Early plane geometry

2026-09-12: Added flat-basic, flat-count, lines and polygon from the original Korean engine. Course one recognizes triangle/quadrilateral/circle, course two counts straight sides, course three distinguishes line/ray/segment and counts polygon sides. Placements are editorial within primary plane geometry. The original four-sided category remains cuadrilátero rather than being narrowed to square. Drawings and correct answers are unchanged apart from display translation.

Validation: 9,720 activity answers and 14,240 drill questions agree with source. Four new browser routes with ten seeds each pass images, descriptions and answers. All eight question/answer A4 PDFs contain one page. Static checks pass for 147 Spanish pages.

## Fraction addition and subtraction

2026-09-12: Added fraction-add-same/fraction-sub-same as course-five prerequisite practice, followed by fraction-add/fraction-sub. Placement follows third-cycle fraction operations rather than claiming a regional annual sequence. The generic originals may also produce equal denominators, so titles do not claim exclusively different denominators. Same-denominator sources retain unreduced results; generic sources reduce results. Missing-numerator tasks preserve the original denominator and expected numerator.

Validation: 10,800 activity answers and 14,240 drill questions agree with source. Four routes with ten seeds each pass descriptions, answers and writing boxes. All eight question/answer A4 PDFs contain one page. Static checks pass for 151 Spanish pages.

## Decimal operations

2026-09-12: Added decimal-add/sub and decimal-mul-whole/div-whole as editorial course-five practice within third-cycle decimal operations. The second operand in multiplication/division is a natural number. Decimal text uses commas without changing numeric data or SVG coordinates. The calculation adapter now includes the expression in result-check prompts and reuses the source-formatted explanation, avoiding raw floating-point display artifacts; this also repairs existing integer result-check instructions.

Validation: 11,880 activity answers and 14,240 drill questions agree with source. Result-check tests require the operation in the prompt. Four new browser routes with ten seeds each pass descriptions, answers and writing boxes. All eight question/answer A4 PDFs contain one page. Static checks pass for 155 Spanish pages.

## Place digits, factors and multiples

2026-09-12: Added place:3 in course two (first-cycle numbers to 999), place:4 in course three (second-cycle numbers to 9999), factor and multiple in course five. Digit prompts map units/tens/hundreds/thousands explicitly and ask for the digit rather than total place value. Multiples are explicitly the first three positive multiples, excluding zero to match the original generator. Divisors are positive.

Validation: 12,960 activity answers and 14,240 drill questions agree with source. Four new browser routes with ten seeds each pass descriptions and answers. All eight question/answer A4 PDFs contain one page. Static checks pass for 159 Spanish pages.

## Rounding and calculation strategies

2026-09-12: Added round-nearest, mixed, mixed-bracket and common-denominator as editorial course-five practice. Rounding is prerequisite review of three-digit numbers to tens/hundreds; expressions combine addition/multiplication; common-denominator tasks require both equivalent fractions. No original generation, choices or answers were changed.

Validation: 14,040 activity answers and 14,240 drill questions agree with source. Four new browser routes with ten seeds each pass descriptions and answers. All eight question/answer A4 PDFs contain one page. Static checks pass for 163 Spanish pages.

## Sixth-course polygon areas

2026-09-12: Added original area-triangle, area-parallelogram, area-trapezoid and area-rhombus as editorial course-six practice within third-cycle area objectives. Original measurements and diagrams are retained; prompts specify bases/heights or diagonals and cm². Drawings are explicitly schematic. Added the sixth-course directory only after actual activities existed; its four links and grade selection are verified. Expanded display themes to twelve entries to support grade six using the unchanged Korean rendering scheme.

Validation: 15,120 activity answers and 14,240 drill questions agree with source. Four activity routes with ten seeds each and the sixth-course directory pass browser checks. Grade switching and type selection work. All nine question/answer/directory A4 PDFs contain one page. Static checks pass for 168 Spanish pages.

## Percentages, chance and missing data

2026-09-12: Added percent, chance and average-missing as selected course-six practice. Percent computes the percentage from a part/whole, not the quantity for a given percentage. Chance preserves three original red/blue-ball scenarios (impossible, certain, 50%); missing-data tasks preserve the original three-number mean. Instructions and display labels are Spanish, with generation unchanged.

Validation: 15,930 activity answers and 14,240 drill questions agree with source. Three browser routes with ten seeds each pass descriptions and answers; all six question/answer PDFs contain one A4 page. Static checks pass for 171 Spanish pages.


## Cubes and spatial visualization

2026-09-12: Added four profiles: adjacent cube counting in course two; height-map counting, front/right views and column removal in course six. Placement is editorial practice under RD157/2022 spatial sense and manipulatives, https://www.boe.es/buscar/act.php?id=BOE-A-2022-3296. This does not claim region-specific textbook alignment. Original Korean cube generation and figures remain unchanged.

Validation: 17,010 activity answers and 14,240 drill questions match original engines. All 175 static pages pass. Four browser routes with ten seeds each and eight single-page A4 PDFs pass.
