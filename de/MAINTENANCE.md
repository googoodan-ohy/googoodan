# German page maintenance

- Reuse the Korean menu and worksheet layout; translate and map only compatible curriculum content.
- Public drill paths use drill-de-{state}-{class}-{German-topic}-{number}.html. Bayern's shared Klasse 1/2 scope uses klasse1-2; internal engine IDs stay unchanged.
- New unit pages must have one primary h1 equal to their static title without the brand suffix. Worksheet subheadings use h2.
- Keep titles at most 60 characters, including ` | googoodan`. Preserve a useful topic and grade before adding the state.
- Every German page uses its canonical as the German hreflang target and includes ko/en/ja/fr/x-default without duplicates.
- Version changed JS/CSS references. Run scripts/check-german-seo.cjs and verify menu navigation in a browser before publishing.
- scripts/german-seo.cjs is a one-time migration. The URL mapping is retained in scripts/german-url-map.json. Do not rerun it to generate future pages.

## Browser regression

Run `node scripts/check-german-unit-browser.cjs` with Playwright installed. The default base URL is http://127.0.0.1:4181; set DE_TEST_URL=https://googoodan.com for the published site. This checks every catalog profile through the actual grade/unit/type menu, answer toggling, number regeneration and preservation of static descriptions.

## Published scope (2026-09-11)

The unit-type catalog currently has 102 profiles: place value/comparison/sequences (2), right angles/symmetry (2), cuboids/cube nets (2), time/calendar (7), metric measures (5), table/graph activities (2), plane shapes (2), cube-building plans (3, including front/right views), introductory chance comparisons (1, three fixed situations), addition/subtraction to 1 000 (2), multiplication/division facts with 2 through 9 (2), division with remainders (1), larger multiplication/exact division (3, including two-digit factors), addition/subtraction to one million (2), ruler reading (1), mirror-grid activities (1), repeating shape patterns (1), equal sums (1), number bonds to 10/20 (2), multiplication-rule tables (1), multiplication arrays (1), picture multiplication and operation relationships (20, including zero/one, number-line steps, group stories, tables and number cards), three-addend sums (1), counting selected shapes (1), factors/positive multiples (2), mixed-unit conversion/comparison (5), drawing clock hands (2), and reading addition/subtraction story profiles in two number ranges (12: six to 9 and six within 100, including whole-part diagrams, comparisons, relevant information and explaining solutions). Six further profiles reuse ten-pair, ten-frame, bridging and inverse-operation strategies; two reuse table/story and relation activities within 100. Two additional profiles count tiles in rectangular grids and compare corresponding side lengths in congruent triangles. A further early-grade profile identifies Quader, Zylinder and Kugel. One early-grade profile reads fruit counts from simple tables. Two early-grade profiles compare lengths and equal-height rectangular areas. One drawing profile builds a quadrilateral from two triangles. These are selected Bayern Klasse 1/2 and 3/4 exercises, not complete curriculum coverage. The separate arithmetic menu and drill pages are not included in that profile count. Other Bundeslaender remain unsupported and must not be described as complete.

## Print regression

Run `node scripts/check-german-print.cjs`, then `python scripts/check-german-print-pages.py` (Playwright and pypdf required). This exports questions and answers separately for every unit-type profile and checks one A4 page per PDF. On 2026-09-12 all 90 profiles / 180 PDFs passed with seed 932718. Each question and answer PDF was exactly one A4 page. This checks the current catalog at one fixed seed; new or modified profiles also need multiple-seed layout checks. Generated PDFs remain in `.work-english/de-print-audit` and are not published.

- Before adding a reused topic, consult CURRICULUM_DECISIONS.md. In particular, do not map formal rounding to Bayern primary grades merely because the Korean generator supports it.

- After adding unit profiles, run build-de-grade-directories.cjs against the local server and scripts/check-german-grade-directories.cjs so the static grade-band indexes include every current type.

- picture-multiplication-source.js contains the unchanged Korean question-engine.js inside an isolated multiplication-only adapter. Do not edit its generator. check-de-picture-multiplication.cjs verifies source equality; run `node scripts/build-german-multiplication-source.cjs --check` to detect upstream drift. To rebuild after reviewing a source change, use `node scripts/build-german-multiplication-source.cjs --version=YYYYMMDD-label`; this also updates all HTML references and the page builder. Then run calculation, browser and print checks.

## Seeded language and sign audit

Run `node scripts/check-german-language-ranges.cjs` with the local preview running. On 2026-09-12, 90 profiles across seeds 0–39 produced 21,360 questions with no Hangul, undefined/NaN output, early-grade negative operands after arithmetic operators, or negative answer values detected. This is a sampled display/sign check, not a proof of all mathematical answers or curriculum coverage; keep the source-specific arithmetic checks.

## Asset connection regression

Run `node scripts/check-german-assets.cjs` after HTML or asset-reference changes. On 2026-09-12, all 153 German pages and 6,333 local script/stylesheet references passed: no duplicate local assets, missing files, or missing cache-version parameters. The browser menu regression also rejects leaked Korean catalog IDs before checking routes. This validates references and catalog ownership, not cache freshness by itself; still raise versions whenever an asset changes.

- Full 90-profile print regression repeated after the drawing/comparison additions: 180 one-page A4 PDFs, with grade-directory links also checked on the live site. The six recent source-specific suites checked 5,700 questions/activities in total.
