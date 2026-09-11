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

The unit-type catalog currently has 29 profiles: place value/comparison/sequences (2), right angles/symmetry (2), cuboids/cube nets (2), time/calendar (6), metric measures (3), table/graph activities (2), plane shapes (2), cube-building plans (2), introductory chance comparisons (1, three fixed situations), addition/subtraction to 1 000 (2), multiplication/division facts with 2 through 9 (2), division with remainders (1), and larger multiplication/exact division (2). These are selected Bayern Klasse 1/2 and 3/4 exercises, not complete curriculum coverage. The separate arithmetic menu and drill pages are not included in that profile count. Other Bundeslaender remain unsupported and must not be described as complete.
