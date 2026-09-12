# Spanish edition — initial scope

2026-09-12: 120 HTML pages; 14 selected activity profiles and 89 arithmetic profiles. This is not a complete curriculum or a claim of coverage of every autonomous community.

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
