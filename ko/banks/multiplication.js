(function(root){
const single=[
 ['그림 묶음을 곱셈식으로','묶음 수를 바꿔 구구단 완성','생활 속 구구단'],
 ['덧셈을 곱셈으로 바꾸기','건너뛰어 세는 수직선','같은 답끼리 짝짓기'],
 ['배열을 보고 곱셈식 쓰기','가려진 묶음 수 찾기','잘못 계산한 구구단 고치기'],
 ['구구단 표의 빈칸 채우기','이웃한 구구단으로 계산하기','이야기에 맞는 식 고르기'],
 ['그림 묶음을 곱셈식으로','구구단 표의 빈칸 채우기','생활 속 구구단'],
 ['덧셈을 곱셈으로 바꾸기','가려진 묶음 수 찾기','같은 답끼리 짝짓기'],
 ['배열을 보고 곱셈식 쓰기','이웃한 구구단으로 계산하기','이야기에 맞는 식 고르기'],
 ['건너뛰어 세는 수직선','묶음 수를 바꿔 구구단 완성','잘못 계산한 구구단 고치기']
];
const modes={
'그림 묶음을 곱셈식으로':'groups','묶음 수를 바꿔 구구단 완성':'facts','생활 속 구구단':'story',
'덧셈을 곱셈으로 바꾸기':'repeated','건너뛰어 세는 수직선':'jump','같은 답끼리 짝짓기':'match',
'배열을 보고 곱셈식 쓰기':'array','가려진 묶음 수 찾기':'missing','잘못 계산한 구구단 고치기':'error',
'구구단 표의 빈칸 채우기':'table','이웃한 구구단으로 계산하기':'neighbor','이야기에 맞는 식 고르기':'choose'
};
const profiles=Array.from({length:8},(_,i)=>({name:(i+2)+'단 익히기',tables:[i+2],activities:single[i].map(title=>({title,method:modes[title]}))}));
const add=(name,tables,methods)=>profiles.push({name,tables,activities:methods.map(method=>({method,title:Object.keys(modes).find(k=>modes[k]===method)||({
'zero-groups':'빈 묶음의 개수','zero-order':'순서를 바꾼 0의 곱셈','zero-story':'0묶음인 이야기',family:'가족 소풍 이야기',pack:'상자 수 거꾸로 찾기',team:'준비물 계산의 실수 찾기',ticket:'장난감 탈것 배열하기',reverse:'이야기 속 묶음 수 찾기',compare:'두 묶음의 개수 비교',create:'구구단에 맞는 그림 그리기',commute:'줄과 칸을 바꾸어 보기',target:'목표 수를 만드는 구구단',chain:'구구단 규칙 이어가기'
})[method]}))});
add('2·3·4단 함께 익히기',[2,3,4],['facts','missing','compare']);
add('4·5·6단 함께 익히기',[4,5,6],['table','error','target']);
add('6·7·8단 함께 익히기',[6,7,8],['repeated','neighbor','match']);
add('7·8·9단 함께 익히기',[7,8,9],['array','chain','reverse']);
add('2~9단 모두 익히기',[2,3,4,5,6,7,8,9],['facts','missing','story']);
add('그림을 구구단으로 바꾸기',[2,3,4,5,6,7,8,9],['groups','array','create']);
add('가족과 모둠의 구구단',[2,3,4,5,6,7,8,9],['family','team','pack']);
add('구구단 탐정',[2,3,4,5,6,7,8,9],['error','reverse','target']);
add('구구단의 연결과 규칙',[2,3,4,5,6,7,8,9],['commute','neighbor','chain']);
add('생활 속 구구단 해결하기',[2,3,4,5,6,7,8,9],['ticket','compare','choose']);
add('1단 · 한 개씩 묶기',[1],['groups','facts','create']);
add('0의 곱셈 · 아무것도 없는 묶음',[0],['zero-groups','zero-order','zero-story']);
root.KoMultiplicationBank={profiles};
})(globalThis);
