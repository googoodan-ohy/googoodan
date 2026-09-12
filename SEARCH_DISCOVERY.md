# Italian and Spanish grade discovery

2026-09-12: Added five grade directories per edition. They list only existing catalogue entries, use the existing Korean-style interactive grade/unit menu, and preselect the relevant grade. No worksheet type count increased because of these directory pages.

Observed local search wording, not measured search volume or ranking:

- Italian: “schede di matematica”, “classe prima/seconda/terza/quarta/quinta”, “da stampare”. Examples: https://portalebambini.it/schede-matematica/ and https://www.maestraanita.it/schede-da-stampare-matematica/
- Spanish: “fichas”, “matemáticas”, “primaria”, “para imprimir”, course numbers. Examples: https://www.mundoprimaria.com/fichas-para-imprimir/ejercicios-matematicas and https://calculalo.app/cuadernillos-calculo

Each directory has an individual static title, description, canonical and CollectionPage/ItemList data, and links to available activities and arithmetic profiles. Home, activity and arithmetic pages link back to the grade directories. Spanish sixth-course content remains unsupported; no empty sixth-course landing page was created.

Validation: ten pages select the correct grade/unit in the browser, preserve static descriptions after JavaScript, show answers and print on one A4 page. Rebuild with scripts/build-grade-directories.cjs when catalogue coverage changes, then check links and metadata again. The generator does not modify question logic or CSS.
