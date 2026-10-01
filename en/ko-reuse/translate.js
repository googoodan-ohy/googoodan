(function(){
const dictionary={
'계산 과정을 살펴요':'Calculate','가려진 수를 찾아요':'Find Missing Numbers','계산을 검토해요':'Check the Calculation','이야기를 읽어요':'Read the Story','조건을 살펴요':'Look at the Information','생각을 표현해요':'Explain Your Thinking','표현을 바꾸어요':'Convert the Units','관계를 이용해요':'Use the Relationship','상황을 해결해요':'Solve the Problem',
'수의 자리와 순서':'Place Value','자리의 숫자 찾기':'Place Value','수의 크기 비교':'Compare Numbers','수의 규칙 찾기':'Number Sequences','□에 알맞은 기호를 쓰세요.':'Write the correct symbol in □.','가장 높은 자리부터 비교합니다.':'Compare from the greatest place value.','빠진 수를 쓰세요.':'Write the missing number.','혼합 계산 순서':'Order of Operations','괄호가 있는 식':'Expressions with Parentheses','이야기와 혼합 계산':'Word Problems','순서에 따라 계산하세요.':'Use the order of operations.','곱셈을 먼저 계산한 뒤 더합니다.':'Multiply first, then add.','괄호 안을 먼저 계산한 뒤 곱합니다.':'Evaluate the parentheses first, then multiply.',
'계산하세요.':'Calculate.','빈칸에 알맞은 수를 쓰세요.':'Write the missing number.','세 수의 합을 구하세요.':'Find the sum of the three numbers.',
'덧셈 계산':'Addition','뺄셈 계산':'Subtraction','수 가르기':'Number Bonds','세 수 계산':'Add Three Numbers','가려진 수 찾기':'Missing Numbers','나눗셈 계산':'Division','곱셈과 나눗셈의 관계':'Related Multiplication and Division Facts','주장의 옳고 그름 판단하기':'Check the Answer','곱셈 계산':'Multiplication','배열로 곱셈하기':'Multiplication Arrays','곱셈의 빈칸 찾기':'Missing Factors','두 자리 수를 곱하기':'Multiply Two-Digit Numbers','소수 덧셈':'Decimal Addition','소수 뺄셈':'Decimal Subtraction','소수 크기 비교':'Compare Decimals','소수의 자리':'Decimal Places','소수와 자연수의 곱':'Decimals Times Whole Numbers','소수끼리의 곱':'Multiply Decimals','10배·100배와 소수점':'Multiply by 10 and 100',
'알맞은 기호를 쓰세요.':'Write the correct comparison symbol.','소수점을 맞추고 높은 자리부터 비교합니다.':'Align decimal points. Compare from the greatest place value.','소수점 오른쪽부터 자리를 확인합니다.':'Count places to the right of the decimal point.',
'맞으면 ○, 틀리면 ×. 틀린 답은 고치세요.':'Write ○ if correct or × if incorrect. Correct any wrong answer.'
};
function translate(s){
if(dictionary[s])return dictionary[s];
s=s.replace(/(\d+)에서 (일|십|백|천)의 자리 숫자는 무엇인가요\?/g,(_,n,place)=>'What digit is in the '+({'일':'ones','십':'tens','백':'hundreds','천':'thousands'}[place])+' place in '+n+'?').replace(/오른쪽에서 (\d+)번째 숫자입니다\./g,'Count $1 place(s) from the right.').replace(/(\d+)씩 커집니다\./g,'Add $1 each time.').replace(/연필 (\d+)자루에 (\d+)자루씩 든 묶음 (\d+)개를 더했습니다\. 모두 몇 자루인가요\?/g,'You have $1 pencils and add $3 packs of $2 pencils each. How many pencils are there in all?');
s=s.replace(/([\d.]+)에서 소수 (첫째|둘째|셋째) 자리 숫자는 무엇인가요\?/g,(_,n,place)=>'What digit is in the '+({'첫째':'tenths','둘째':'hundredths','셋째':'thousandths'}[place])+' place in '+n+'?');
return s.replace(/(\d+)을 (\d+)과 □로 가르세요\./g,'Split $1 into $2 and □.').replace(/(.+)의 계산을 확인하세요\./g,'Check the calculation: $1.').replace(/([\d.]+)에서 소수 둘째 자리 숫자는 무엇인가요\?/g,'What digit is in the hundredths place in $1?').replace(/친구의 답:/g,"A student's answer:").replace(/바른 답:/g,'Correct answer:').replace(/이므로/g,', so').replace(/이름:/g,'Name:').replace(/날짜:/g,'Date:');
}
window.translateKoSheet=(markup,answer)=>{
const t=document.createElement('template');t.innerHTML=markup;const root=t.content,c=window.KO_REUSE;
root.querySelectorAll('.activity > h3').forEach(el=>el.remove());
root.querySelector('.sheet-top').innerHTML='<span class="worksheet-brand" style="align-items:baseline;position:relative;padding-left:29px"><img src="/en/assets/brand-logo.svg" alt="googoodan.com" width="24" height="24" style="width:24px;height:24px;position:absolute;left:0;top:50%;transform:translateY(-50%)"><b style="color:#176e5c">googoodan<span style="color:#ed764b">.com</span></b></span><span>Grade '+c.grade+' · '+(answer?'Answer key':'Worksheet')+'</span>';
root.querySelector('.hero h2').textContent=c.title;
const small=root.querySelectorAll('.hero small');small[0].textContent='MATH PRACTICE';small[1].textContent='Practice, check, and explain.';
root.querySelector('.sheet-footer b').textContent='googoodan.com';root.querySelector('.art-credit').textContent='Art: Twemoji © Twitter and contributors · CC BY 4.0 · googoodan.com/ko/art-gallery.html';
const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node;while(node=walker.nextNode())node.textContent=translate(node.textContent);
root.querySelectorAll('img').forEach(img=>{if(/[가-힣]/.test(img.alt)){img.alt=img.closest('.picture-count')?'Counting object':'';}});
root.querySelectorAll('[aria-label]').forEach(el=>{if(el.getAttribute('aria-label')==='문제 그림')el.setAttribute('aria-label','Problem diagram')});
const residual=root.textContent.match(/[가-힣][^<>\n]*/g);if(residual)throw Error('Untranslated worksheet text: '+residual.join(' | '));
return t.innerHTML;
};
})();
