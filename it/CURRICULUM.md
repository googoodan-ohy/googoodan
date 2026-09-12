# Italian edition — initial release

Checked 2026-09-12. This release contains 34 HTML pages, 7 curriculum drill profiles and 10 activity profiles. These are selected exercises, not a complete curriculum. The common calculator also reuses the numeric families already present on the Korean home page.

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

Still to expand: drill units beyond class one; broader picture-based activities, geometry, metric measurement, data and fractions; class-specific static directories. Reuse compatible Korean material and validate each mapping before adding it. Do not pad counts with duplicate pages or unrelated review.

Search wording was checked against Italian educational resources, including Giunti Scuola's “Addizioni e sottrazioni” and Cose per Crescere's fractions/primary worksheets. No search-volume data or top-100 keyword coverage has been measured.

Build experiments and checks are in `.work-english/italian/`. The draft builders create noindex pages and must not be run over a released edition without the release preparation and validation steps. Preserve current metadata and cache versions when rebuilding.
