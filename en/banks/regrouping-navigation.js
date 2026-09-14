/* Links the exact-regrouping worksheet collection into the US grade picker.
 * GradeMath continues to own the existing journal choices; this file only adds
 * a separate group of links to the static worksheet generators. */
(() => {
  const pages = Object.freeze([
    page(2, 'grade-2-two-digit-addition-one-regrouping', '2-Digit Addition with 1 Regrouping'),
    page(2, 'grade-2-two-digit-addition-two-regroupings', '2-Digit Addition with 2 Regroupings'),
    page(2, 'grade-2-two-digit-subtraction-one-regrouping', '2-Digit Subtraction with 1 Regrouping'),
    page(3, 'grade-3-three-digit-addition-no-regrouping', '3-Digit Addition Without Regrouping'),
    page(3, 'grade-3-three-digit-addition-one-regrouping', '3-Digit Addition with 1 Regrouping'),
    page(3, 'grade-3-three-digit-addition-two-regroupings', '3-Digit Addition with 2 Regroupings'),
    page(3, 'grade-3-three-digit-addition-three-regroupings', '3-Digit Addition with 3 Regroupings'),
    page(3, 'grade-3-three-digit-subtraction-no-regrouping', '3-Digit Subtraction Without Regrouping'),
    page(3, 'grade-3-three-digit-subtraction-one-regrouping', '3-Digit Subtraction with 1 Regrouping'),
    page(3, 'grade-3-three-digit-subtraction-two-regroupings', '3-Digit Subtraction with 2 Regroupings'),
    page(4, 'grade-4-two-digit-by-one-digit-multiplication-no-regrouping', '2-Digit by 1-Digit Multiplication Without Regrouping'),
    page(4, 'grade-4-two-digit-by-one-digit-multiplication-one-regrouping', '2-Digit by 1-Digit Multiplication with 1 Regrouping'),
    page(4, 'grade-4-two-digit-by-one-digit-multiplication-two-regroupings', '2-Digit by 1-Digit Multiplication with 2 Regroupings'),
    page(4, 'grade-4-three-digit-by-one-digit-multiplication-no-regrouping', '3-Digit by 1-Digit Multiplication Without Regrouping'),
    page(4, 'grade-4-three-digit-by-one-digit-multiplication-one-regrouping', '3-Digit by 1-Digit Multiplication with 1 Regrouping'),
    page(4, 'grade-4-three-digit-by-one-digit-multiplication-two-regroupings', '3-Digit by 1-Digit Multiplication with 2 Regroupings'),
    page(4, 'grade-4-three-digit-by-one-digit-multiplication-three-regroupings', '3-Digit by 1-Digit Multiplication with 3 Regroupings')
  ]);

  function page(grade, id, label) {
    return Object.freeze({grade, id, label, href: `/en/${id}.html`});
  }

  globalThis.RegroupingNavigation = Object.freeze({pages});

  const select = document.getElementById('unit');
  const grade = Number(new URLSearchParams(location.search).get('grade'));
  const choices = pages.filter(item => item.grade === grade);
  if (!select || !choices.length) return;

  function appendChoices() {
    if (select.querySelector('optgroup[data-regrouping-navigation]')) return;
    const group = document.createElement('optgroup');
    group.label = 'Exact Regrouping Worksheets';
    group.dataset.regroupingNavigation = 'true';
    for (const item of choices) {
      const option = document.createElement('option');
      option.value = `regrouping:${item.id}`;
      option.textContent = item.label;
      option.dataset.regroupingHref = item.href;
      group.append(option);
    }
    select.append(group);
  }

  const gradeChange = select.onchange;
  select.onchange = function (event) {
    const href = this.selectedOptions[0]?.dataset.regroupingHref;
    if (!href) return gradeChange?.call(this, event);
    if (globalThis.WorksheetNavigation?.go) return globalThis.WorksheetNavigation.go(href);
    location.href = href;
  };

  appendChoices();
  new MutationObserver(appendChoices).observe(select, {childList: true});
})();
