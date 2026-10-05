// 선 잇기·표 채우기 샘플 목록. 샘플 쪽(matching-samples.html)과 검사기(check-matching.cjs)가 함께 쓴다.
(function (root) {
  'use strict';
  const samples = [
    { typeId:'matching-expr-result', title:'선 잇기 · 식과 답', instruction:'왼쪽과 오른쪽에서 서로 맞는 것끼리 선으로 연결하세요.', format:'matching-lines', cols:3, rows:8, count:24, fontPt:12, seed:2101, gen:{ pairKind:'expr-result', legacyId:'natural-add-2-2' } },
    { typeId:'matching-fraction-equal', title:'선 잇기 · 크기가 같은 분수', instruction:'왼쪽과 오른쪽에서 크기가 같은 분수끼리 선으로 연결하세요.', format:'matching-lines', cols:3, rows:7, count:21, fontPt:12, seed:2102, gen:{ pairKind:'fraction-equal' } },
    { typeId:'table-multiplication', title:'곱셈구구 표 채우기', instruction:'빈칸에 알맞은 곱을 써넣으세요.', format:'multiplication-table', cols:1, rows:3, count:3, fontPt:12, seed:2103, gen:{} },
    { typeId:'table-factor', title:'약수·배수 표 채우기', instruction:'빈칸에 알맞은 수를 써넣으세요.', format:'factor-table', cols:1, rows:4, count:4, fontPt:12, seed:2104, gen:{} },
    { typeId:'table-number-array', title:'수 배열표 채우기 (100까지)', instruction:'빈칸에 알맞은 수를 써넣으세요.', format:'number-array', cols:1, rows:3, count:3, fontPt:12, seed:2105, gen:{ max:100 } },
    { typeId:'table-place-value', title:'자리표에 수 채우기', instruction:'빈칸에 알맞은 수를 써넣으세요.', format:'place-value-table', cols:1, rows:2, count:2, fontPt:12, seed:2106, gen:{ numberDigits:4 } },
    { typeId:'inequality-numbers', title:'○ 안에 부등호 넣기', instruction:'○ 안에 >, =, < 중 알맞은 것을 써넣으세요.', format:'inequality', cols:4, rows:15, count:60, fontPt:12, seed:2107, gen:{ kind:'number', numberMin:10, numberMax:9999 } },
    { typeId:'ordering-numbers', title:'작은 수부터 순서대로 쓰기', instruction:'작은 수부터 순서대로 쓰세요.', format:'ordering', cols:2, rows:14, count:28, fontPt:12, seed:2108, gen:{ numberCount:4, direction:'asc', numberMin:10, numberMax:9999 } },
    { typeId:'extremes-numbers', title:'가장 큰 수와 가장 작은 수', instruction:'가장 큰 수와 가장 작은 수를 쓰세요.', format:'extremes', cols:2, rows:14, count:28, fontPt:12, seed:2109, gen:{ numberCount:5, numberMin:100, numberMax:9999 } },
    { typeId:'condition-choice-multiple', title:'조건에 맞는 수 고르기', instruction:'조건에 맞는 모든 것을 찾아 ○표 하세요.', format:'condition-choice', cols:2, rows:14, count:28, fontPt:11, seed:2110, gen:{ kind:'multiple', optionCount:6 } }
  ];
  root.MatchingSamplesData = samples;
  if (typeof module !== 'undefined' && module.exports) module.exports = samples;
})(typeof globalThis !== 'undefined' ? globalThis : this);
