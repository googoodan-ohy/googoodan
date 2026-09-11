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

The fourth story profile reuses paired, compare-more and compare-less without changing the source arithmetic. German wording preserves the two distinct situations in paired questions and the direction of each comparison.

The fifth story profile reuses extra-label, extra-other and extra-age. It preserves the source distractor value and the required two quantities, and practices finding relevant information in everyday texts (M1/2 1.3).

The sixth story profile reuses question, claim and justify. Open-answer flags are preserved, and German example answers explicitly allow other valid questions and solutions. No source generator logic is changed.

## Stories within 100 (2026-09-12)

The same six story activities are offered at a second number range via the unchanged Korean 1-2-6 source. Its largest possible sum is 99, stated on the static pages. This belongs to Bayern M1/2 work within 100; it is not a new mathematical skill or a claim of six unique additional concepts. Both number ranges retain source values, distractors, images and answer relationships.

## Cube-building views (2026-09-12)

Reuse the Korean cube-view activity in Bayern M3/4 2.1, relating two- and three-dimensional building representations. The original four-stack height map, front/right direction, hidden-stack rule and answers are preserved. The worksheet asks for the visible square count, not a perspective drawing or a complete treatment of spatial reasoning.
Source: https://www.lehrplanplus.bayern.de/fachlehrplan/grundschule/3/mathematik
