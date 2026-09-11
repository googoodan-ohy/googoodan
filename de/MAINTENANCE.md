# German page maintenance

- Reuse the Korean menu and worksheet layout; translate and map only compatible curriculum content.
- Public drill paths use drill-de-{state}-{class}-{German-topic}-{number}.html. Bayern's shared Klasse 1/2 scope uses klasse1-2; internal engine IDs stay unchanged.
- New unit pages must have one primary h1 equal to their static title without the brand suffix. Worksheet subheadings use h2.
- Keep titles at most 60 characters, including ` | googoodan`. Preserve a useful topic and grade before adding the state.
- Every German page uses its canonical as the German hreflang target and includes ko/en/ja/fr/x-default without duplicates.
- Version changed JS/CSS references. Run scripts/check-german-seo.cjs and verify menu navigation in a browser before publishing.
- scripts/german-seo.cjs is a one-time migration. The URL mapping is retained in scripts/german-url-map.json. Do not rerun it to generate future pages.
