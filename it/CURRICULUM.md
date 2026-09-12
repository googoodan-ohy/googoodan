# Italian edition — initial release

Checked 2026-09-12. This release contains 120 HTML pages, 89 curriculum drill profiles and 14 activity profiles. These are selected exercises, not a complete curriculum. The common calculator also reuses the numeric families already present on the Korean home page.

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
