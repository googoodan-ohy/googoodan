# Spanish edition — initial scope

2026-09-12: 143 HTML pages; 32 selected activity profiles and 89 arithmetic profiles. This is not a complete curriculum or a claim of coverage of every autonomous community.

Official source checked: [Real Decreto 157/2022, consolidated BOE text](https://www.boe.es/buscar/act.php?id=BOE-A-2022-3296). National minimum content is organized in two-year cycles. First-cycle number work extends to 999; second-cycle number work extends to 9999 and includes proper fractions with denominators up to 12. Course placement here is editorial within that progression. Third-course subtraction and fifth-course fraction comparison are explicitly prerequisite review.

[Regional curriculum directory](https://educagob.educacionfpydeportes.gob.es/curriculo/curriculo-lomloe/menu-curriculos-basicos/ed-primaria/curriculo-comunidades-autonomas.html). No region-specific mapping is implemented yet. Do not present a regional selector as completed coverage until its mapping is verified.

The common menus and engines reuse Korean assets. Activity generation uses the unchanged ko/engine.js with explicit original skill/mode selections. Arithmetic drills use the original Korean 1-1-3, 2-1-3, 3-1-1, 3-1-4, 3-1-3 and 3-2-3 profiles and ko/drill-engine.js. Display translation does not alter generated numbers, answers or work. Profile --3 is excluded because the generic subtraction source can exceed the declared range of nine. Internal Korean IDs remain where generator behavior depends on them; public URLs use Spanish words.

Validation: 2,700 activity answers compared with original generation; 1,120 drill questions compared for answers, operands and working; browser checks for all 13 common routes, 10 activity routes and 7 drill routes. A4/Letter common-table PDFs each have one page. Activity and drill print checks must be retained before publication.

Remaining: sixth-course material, broader geometry, measurement, data, fractions, regional mappings, and more arithmetic units. Reuse compatible Korean activities only; do not fill gaps with unrelated topics. No search-volume or ranking claims have been measured.

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
