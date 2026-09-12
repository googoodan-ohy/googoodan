# Spanish edition — initial scope

2026-09-12: 80 HTML pages; 10 selected activity profiles and 53 arithmetic profiles. This is not a complete curriculum or a claim of coverage of every autonomous community.

Official source checked: [Real Decreto 157/2022, consolidated BOE text](https://www.boe.es/buscar/act.php?id=BOE-A-2022-3296). National minimum content is organized in two-year cycles. First-cycle number work extends to 999; second-cycle number work extends to 9999 and includes proper fractions with denominators up to 12. Course placement here is editorial within that progression. Third-course subtraction and fifth-course fraction comparison are explicitly prerequisite review.

[Regional curriculum directory](https://educagob.educacionfpydeportes.gob.es/curriculo/curriculo-lomloe/menu-curriculos-basicos/ed-primaria/curriculo-comunidades-autonomas.html). No region-specific mapping is implemented yet. Do not present a regional selector as completed coverage until its mapping is verified.

The common menus and engines reuse Korean assets. Activity generation uses the unchanged ko/engine.js with explicit original skill/mode selections. Arithmetic drills use the original Korean 1-1-3, 2-1-3 and 3-1-1 profiles and ko/drill-engine.js. Display translation does not alter generated numbers, answers or work. Profile --3 is excluded because the generic subtraction source can exceed the declared range of nine. Internal Korean IDs remain where generator behavior depends on them; public URLs use Spanish words.

Validation: 2,700 activity answers compared with original generation; 1,120 drill questions compared for answers, operands and working; browser checks for all 13 common routes, 10 activity routes and 7 drill routes. A4/Letter common-table PDFs each have one page. Activity and drill print checks must be retained before publication.

Remaining: sixth-course material, broader geometry, measurement, data, fractions, regional mappings, and more arithmetic units. Reuse compatible Korean activities only; do not fill gaps with unrelated topics. No search-volume or ranking claims have been measured.

Build experiments are under .work-english/spanish/. Builders recreate drafts and must not overwrite published pages without release preparation, version updates and verification.

## Two- and three-digit calculation expansion

2026-09-12: Added 25 two-digit profiles in course two and 21 three-digit profiles in course three. Course-two sums can exceed 99; course-three sums can exceed 999. The ranges refer to operands and stay within the relevant national cycle endpoints. Prerequisite practice is labelled Repaso. Region-specific alignment remains unimplemented.

Validation: 8,480 original-versus-localized drill questions plus 2,700 activity answers. All 46 added routes passed browser checks for descriptions, selected profiles, answers and regeneration. All 92 question/answer A4 PDFs contain one page. Titles, canonical links and local asset references pass the 80-page static check.
