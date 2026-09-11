# German curriculum placement decisions

These decisions apply to the currently supported Bayern primary-school catalog. Other Bundeslaender must be checked independently. Reusability of a Korean generator is not evidence that the topic belongs in the target grade.

## 2026-09-12: Do not add formal rounding to Bayern Klasse 1–4

- Korean `ko/engine.js` provides `round-nearest`, `round-up` and `round-down`. These are available technically but are not being connected to Bayern primary-school units.
- ISB explicitly states that the rounding rule is no longer included in LehrplanPLUS Grundschule. LehrplanPLUS supplementary material also says that familiarity with rounding natural numbers cannot be assumed on entry to the next school stage.
- Estimation and approximate calculation are not permission to label a formal rounding worksheet as required Bayern primary-school content.
- No rounding page was created. Existing arithmetic engines, menus and routes remain unchanged by this decision.
- If another Bundesland is supported later, check its current official curriculum before deciding whether and where to reuse this generator.

Official sources checked:
- https://www.isb.bayern.de/schularten/gymnasium/leistungserhebungen/probeunterricht/mathematik/
- https://www.lehrplanplus.bayern.de/serviceinformation/l76993
- https://www.lehrplanplus.bayern.de/fachlehrplan/grundschule/3/mathematik
