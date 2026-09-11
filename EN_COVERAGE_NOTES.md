# English worksheet reuse expansion — 2026-09-11

15 entry pages expose 36 Korean source skills and two arithmetic coloring formats.
These are selectable practice options, not 38 previously absent concepts. Several
concepts already existed inside the US topic generator. Do not add this count to
the existing catalog total without deduplicating the underlying skills.

## Source and scope

`en/banks/coverage.js` invokes the unchanged `ko/engine.js` with explicit
`customSpecs`. All operands, diagrams and answers are returned by that engine.
Only prompts, explanations and visible diagram labels are localized. The adapter
filters generated examples to fit US denominator and LCM ranges, without changing
the source arithmetic. Color mosaics use the existing English arithmetic generator.

| Pages | Intended placement | Reference |
|---|---|---|
| telling-time | Grades 1–3; grade links limit the available intervals | 1.MD.B.3, 2.MD.C.7, 3.MD.A.1 |
| fraction-models | Grade 3, denominators 2, 3, 4, 6, 8 | 3.NF.A.1 |
| factors-and-multiples | Grade 4 selected factor/multiple practice | 4.OA.B.4 |
| comparing-fractions | Grade 4 allowed denominators | 4.NF.A.2 |
| angles, decimal-models | Grade 4 | 4.MD.C.5–7, 4.G.A.1, 4.NF.C.6 |
| order-of-operations | Grade 5 introductory grouped expressions | 5.OA.A.1 |
| simplifying-fractions, common-denominators | Grade 5 fraction preparation/review | 5.NF.A.1 prerequisites |
| area-and-perimeter | Grades 3–4 rectangles; Grade 6 other polygons | 3.MD.C.7, 3.MD.D.8, 4.MD.A.3, 6.G.A.1 |
| gcf-and-lcm | Grade 6, GCF numbers <=100, LCM numbers <=12 | 6.NS.B.4 |
| surface-area | Grade 6 rectangular-prism formula practice | 6.G.A.4 supporting practice |
| probability | Introductory likelihood, preparation for Grade 7 | 7.SP.C.5 supporting practice |
| circle-area | Grade 7 | 7.G.B.4 |

Standards source: https://www.thecorestandards.org/Math/Content/

## Explicit limits

- Order of operations reuses two source structures, not full PEMDAS/exponents.
- Probability has three qualitative situations, not experimental/compound events.
- Surface area covers rectangular prisms, not nets or every solid.
- Coloring is a 16-cell calculation mosaic, not a hidden-picture drawing.
- The new standalone pages are linked from the English directory and appropriate
  grade pages. The existing grade unit selector is extended without redesigning it.
- Build: `node build-en-coverage.cjs`. Mathematical/static checks:
  `node check-en-coverage.cjs` (6,390 generated questions).
- Keep JS/CSS query versions synchronized with every published change.

No change was made to Korean source files or the English app title logic.
