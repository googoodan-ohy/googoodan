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

## 2026-09-12: Fraction reuse needs quantity context

- Bayern M3/4 3.2 explicitly uses familiar simple fractions (one half, one quarter, three quarters) in connection with quantities, for example half a litre = 500 ml and a quarter-hour = 15 minutes.
- The generic Korean fraction-model generator creates a wider range of denominators and has no quantity context. It must not be copied wholesale into a Bayern primary unit as though it covers this objective.
- Reusing existing clock activities does not by itself complete the fraction-to-quantity objective. This remains a coverage gap until a compatible existing activity is found or a separate generator change is authorized.
- No fraction page was generated during this review; calculation logic remains unchanged.
- Source: https://www.lehrplanplus.bayern.de/fachlehrplan/grundschule/3/mathematik (M3/4 3.2).

## Pending placement review: rectangle perimeter

The Korean perimeter generator uses a labelled rectangle and the formula 2 × (length + width). A direct assignment to Bayern Klasse 3/4 was not substantiated in the current review. Do not infer that a formula worksheet matches the practical perimeter comparisons described for Klasse 1/2. Keep this candidate pending until an appropriate official placement and activity match are established.

## Sachaufgaben bis 9 (2026-09-12)

Bayern M1/2 1.3 links everyday stories with operations and mathematical questions. Reuse the original Korean reading-stories bank for total, initial amount and removed amount, plus choosing the matching equation. Keep the original seed, numbers (at most 9), pictures and answer relationships. Translate the displayed text only; pictures identify objects rather than represent their count. This is initial practice, not coverage of the whole number range to 100.
Source: https://www.lehrplanplus.bayern.de/fachlehrplan/grundschule/1/mathematik

The third story profile reuses the Korean whole-part diagram activities (bar-total, bar-part, bar-difference). The boxes show the numerical relationship; their widths are schematic, not proportional measurements. Original generation and answers remain unchanged.
