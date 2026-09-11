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

## Picture multiplication (2026-09-12)

Reuse Korean multiplication profile 13 (groups, array, create) for Bayern M1/2 multiplication as repeated groups and rectangular arrangements. Group size is written first, preserving Korean source order; the static page explains the convention and commutativity. No combinatorics generator was found in the inspected Korean banks, so no new combinatorics generator is introduced.
Source: https://www.lehrplanplus.bayern.de/fachlehrplan/grundschule/1/mathematik

The second picture-multiplication profile reuses Korean profile 16: commute, neighbor and chain. It practices reversing factors in the same array and deriving successive products from a known product. Source expressions, numbers and answers are unchanged.

The third picture-multiplication profile reuses Korean profile 10 unchanged (6, 7 and 8 tables): repeated addition, neighboring products and matching expressions to values. The limited table selection is explicit in the menu and title.

The fourth picture-multiplication profile reuses Korean profile 19 for multiplying by zero: empty groups, reversing factors, and zero filled groups. Singular/plural German text is localized without changing source calculations.

Picture-multiplication profiles 4 and 5 reuse Korean profiles 1 and 2 unchanged. They cover the 3-times table via repeated addition, number-line jumps and matching; and the 4-times table via arrays, missing group counts and correcting products. Menu titles state the source table restriction.

Picture-multiplication profile 6 reuses Korean profile 14: family, team and pack. It retains the original animal/object pictures, group sizes, intentionally incorrect proposal and inverse group-count question. German wording identifies the pictured category without changing mathematical conditions.

Picture-multiplication profile 7 reuses Korean profile 17 (ticket, compare, choose): vehicle arrays, comparing grouped totals, and choosing addition or multiplication for the unchanged group story. Comparison signs are validated against the displayed quantities.

Picture-multiplication profile 8 reuses Korean profile 9 (4/5/6 tables): table gaps, erroneous products and number-card target products. The cards and alternate factor orders remain exactly as generated by the Korean source.

Picture-multiplication profile 9 reuses Korean profile 18: groups of one, the complete 1-times table, and drawing groups of one. The source emits one nine-entry table rather than repeated table questions; this structure is preserved.

## Ten strategies (2026-09-12)

Three profiles reuse KoEarlyArithmetic 1-2-2 unchanged: three-number operations/complements, making ten with pairs and ten-frames, and subtracting via ten with an addition-error check. They support Bayern M1/2 calculation strategies within 20. The original numeric work steps and graphics are preserved; only visible language is localized.
Source: https://www.lehrplanplus.bayern.de/fachlehrplan/grundschule/1/mathematik

## Linked addition/subtraction (2026-09-12)

Reuse only inverse and compensate from KoEarlyArithmetic 1-2-4 profile 1. Its compare activity can generate negative terms (seed 35 includes 9 + 2 versus 12 + -1), outside the intended primary positive-number practice. Exclude that section rather than change its generator. The published profile has two sections and retains original values and answers.

## Calculation strategies within 100 (2026-09-12)

Reuse KoEarlyArithmetic 1-2-6 profiles 1 and 2: tables, additive stories, missing initial values, inverse relations, compensation and error correction. The column-calculation profile is not imported into Klasse 1/2; formal written algorithms belong to the later Bayern band. Source calculations, graphics and answer relationships remain unchanged.
Source: https://www.lehrplanplus.bayern.de/fachlehrplan/grundschule/1/mathematik

## 2026-09-12: Tile counting
Reuse ko/engine.js tile unchanged in de-by-tiles (Bayern 3/4). This is supplementary structured counting for laying out surfaces, not a complete parkettierung activity. Reference: https://www.lehrplanplus.bayern.de/fachlehrplan/grundschule/3/mathematik (2.4). Exclude parallel-line and degree-based quadrilateral classification pending appropriate curriculum evidence. 900 source-answer checks, ten browser seeds and two one-page PDFs passed.

## 2026-09-12: Congruent side lengths
Reuse ko/engine.js congruent unchanged in de-by-congruent, Bayern 3/4. Supplement the deckungsgleich concept in 2.2/2.3 with equal corresponding side lengths; do not claim net construction or congruence proofs. Source triangles are symbolic, not measurement diagrams; static instructions make this explicit. 900 source-answer checks, ten browser seeds and two single-page A4 PDFs passed. No reusable scale-drawing generator was found in the inspected Korean geometry bank; enlargement/reduction remains unsupported rather than creating new generator logic. Reference: https://www.lehrplanplus.bayern.de/fachlehrplan/grundschule/3/mathematik

## 2026-09-12: Early solid names
Reuse ko/engine.js solid-basic with original unit 2-1-2 in de-by-bodies12 (Bayern Klasse 1/2, 2.2). Translate Quader/Zylinder/Kugel, keeping original drawing paths and answer selection. Source sphere is a simple circular schematic, not a realistic perspective drawing. Only these three bodies are provided; other curricular bodies remain unimplemented. 900 source-answer/drawing checks, ten browser seeds and two single-page PDFs passed. Reference: https://www.lehrplanplus.bayern.de/fachlehrplan/grundschule/1/mathematik

## 2026-09-12: Early table reading
Reuse ko/engine.js table unchanged in de-by-readtable12. Bayern 1/2 section 4.1 explicitly includes reading information from simple tables. Fruit labels are localized, source values 1–6 and answers are unchanged. This exercises reading one category, not collecting data or drawing graphs. 900 source-answer/table-value checks, ten browser seeds and two single-page PDFs passed. Reference: https://www.lehrplanplus.bayern.de/fachlehrplan/grundschule/1/mathematik

## 2026-09-12: Comparing lengths and areas
Reuse ko/engine.js length-compare and area-compare unchanged in de-by-compare12. Bayern 1/2 sections 3.2 and 2.5 support length/area comparison. Both diagrams have equal-height rectangles and a common left edge; instructions explicitly restrict the length-based area comparison to this case. This is supplementary visual comparison, not measuring or covering with unit squares. Weight/capacity comparison not mapped to early grades. 1,800 source/graph-answer checks and four single-page PDFs passed. Reference: https://www.lehrplanplus.bayern.de/fachlehrplan/grundschule/1/mathematik
