# English worksheet preview

Run `node server.js` from the project root, then open http://localhost:3000/en/index.html.

The English prototype is independent of the existing Korean worksheets. `types.js` holds 54 presets and deterministic question generation; `app.js` handles instant selection, answer keys, history, and printing. `style.css` includes responsive and print layouts. Run `node en/build.cjs` after editing the HTML template or preset titles to regenerate the static entry pages and English sitemap.

Each worksheet has a direct HTML URL. The sitemap in this folder is ready for later submission after deployment. This prototype has not been published or linked from the Korean home page.

Validation: generated 108,000 questions across all presets with checks for arithmetic answers, uniqueness, deterministic generation, digit counts, and denominator constraints. Browser selection and answer rendering were inspected. Actual printer output and A4/Letter pagination still need confirmation; the embedded browser did not expose a print dialog during verification.


Navigation: Natural numbers / Fractions / Decimals -> operation symbol -> preset. Breadcrumb buttons return to earlier menu levels. Direct worksheet URLs reopen their matching submenu. Run node en/check.cjs to validate all presets.

US edition: curriculum.js contains source-linked K-5 Common Core sample mappings. Topic controls remain visible. Curriculum links retain grade selection in URL parameters. There are 55 presets; node en/check.cjs validates 110,000 generated questions. about.html and privacy.html describe the preview scope. Ad placeholders do not load ad services and are excluded from print. Publication, live advertising setup, and actual printer verification remain pending.

Expanded arithmetic release: 156 presets; natural-number operands through four digits, decimal/whole-number operand combinations (0-2 decimal places), proper/improper/mixed fraction combinations, and a separate signed-integer extension. Number categories use inline SVG illustrations. Decimal division is accepted only if its exact rational quotient terminates at hundredths or earlier. 312,000 overall generated questions and 160,000 additional decimal division questions checked. This is arithmetic expansion, not complete elementary curriculum coverage; word problems, geometry, measurement, order-of-operations and further conceptual skills are not yet complete. The Common Core sample mappings remain a separate limited collection.
