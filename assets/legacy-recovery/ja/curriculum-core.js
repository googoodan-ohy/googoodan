(function(root){
'use strict';
const previous=root.JAMath.rows;
const supported=['clockRead','roundNumber','mean','median','speed','proportion','inverseProportion','letterExpression','trapezoidArea','parallelogramArea','cylinderVolume','circumference'];
const svg=body=>'<svg class="concept-art" viewBox="0 0 200 120" role="img" aria-label="問題の図"><g fill="none" stroke="#247460" stroke-width="1.8">'+body+'</g></svg>';
const label=(x,y,s)=>'<text x="'+x+'" y="'+y+'" text-anchor="middle" font-size="12" fill="#243e55" stroke="none">'+s+'</text>';
root.JAMath.rows=function(t,n,mode,seed){
 if(!supported.includes(t.op))return previous(t,n,mode,seed);
 let state=seed>>>0;const rnd=(min,max)=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return min+Math.floor(state/4294967296*(max-min+1));};
 return Array.from({length:n},()=>{
 const a=rnd(2,mode==='review'?5:12),b=rnd(2,mode==='review'?5:9),c=rnd(2,6);let prompt,answer,reason,visual='';
 switch(t.op){
 case 'clockRead':{const hour=rnd(1,12),minute=mode==='review'?0:rnd(0,11)*5;const hand=(angle,length,width)=>'<path stroke-width="'+width+'" d="M100 60L'+(100+length*Math.sin(angle*Math.PI/180)).toFixed(2)+' '+(60-length*Math.cos(angle*Math.PI/180)).toFixed(2)+'"/>';visual=svg('<circle cx="100" cy="60" r="48"/>'+Array.from({length:12},(_,i)=>{const angle=(i+1)*Math.PI/6;return label((100+39*Math.sin(angle)).toFixed(2),(64-39*Math.cos(angle)).toFixed(2),i+1)}).join('')+hand(hour*30+minute/2,25,3)+hand(minute*6,34,1.5));prompt='とけいは なんじ なんぷん ですか。';answer=hour+'時'+minute+'分';reason='短い針で時、長い針で分を読みます。';break;}
 case 'roundNumber':{const number=rnd(100,9999),place=mode==='review'?10:[10,100,1000][rnd(0,2)];prompt=number+' を四捨五入して、'+({'10':'十','100':'百','1000':'千'}[place])+'の位までの概数にしましょう。';answer=Math.round(number/place)*place;reason='残す位の一つ下の数字が5以上なら切り上げ、4以下なら切り捨てます。';break;}
 case 'mean':{const nums=[a,b,c,a+b-c+4];prompt=nums.join('、')+' の平均を求めましょう。';answer=(a+b+2)/2;reason='('+nums.join(' + ')+') ÷ 4 = '+answer;break;}
 case 'median':{const nums=[a,b,c,a+b,c+2].sort((x,y)=>x-y),mixed=[nums[2],nums[0],nums[4],nums[1],nums[3]];prompt= mixed.join('、')+' の中央値を求めましょう。';answer=nums[2];reason='小さい順に '+nums.join('、')+'。真ん中の数は '+answer+' です。';break;}
 case 'speed':prompt=(a*b)+' km を '+b+' 時間で進みました。時速は何 km ですか。';answer=a+' km/時';reason=(a*b)+' ÷ '+b+' = '+a;break;
 case 'proportion':prompt='y は x に比例し、x = '+b+' のとき y = '+a*b+' です。x = '+c+' のときの y を求めましょう。';answer=a*c;reason='比例定数は '+a*b+' ÷ '+b+' = '+a+'。y = '+a+' × '+c+' = '+answer;break;
 case 'inverseProportion':prompt='y は x に反比例し、x = '+b+' のとき y = '+a*c+' です。x = '+c+' のときの y を求めましょう。';answer=a*b;reason='x × y = '+a*b*c+' は一定。'+a*b*c+' ÷ '+c+' = '+answer;break;
 case 'letterExpression':prompt='1本 '+a+' 円のえんぴつを x 本買います。代金は '+a+' × x 円です。x = '+b+' のときの代金を求めましょう。';answer=a*b+'円';reason=a+' × '+b+' = '+a*b;break;
 case 'trapezoidArea':prompt='上底 '+a+' cm、下底 '+(a+2*c)+' cm、高さ '+b+' cm の台形の面積を求めましょう。';answer=(a+c)*b+' cm²';reason='('+a+' + '+(a+2*c)+') × '+b+' ÷ 2 = '+answer;visual=svg('<path d="M60 20H120L155 85H25Z"/><path d="M60 20V85" stroke-dasharray="3 3"/>'+label(90,14,a+' cm')+label(90,103,(a+2*c)+' cm')+label(82,55,b+' cm'));break;
 case 'parallelogramArea':prompt='底辺 '+a+' cm、高さ '+b+' cm の平行四辺形の面積を求めましょう。';answer=a*b+' cm²';reason=a+' × '+b+' = '+answer;visual=svg('<path d="M60 20H165L135 85H30Z"/><path d="M60 20V85" stroke-dasharray="3 3"/>'+label(85,103,a+' cm')+label(82,55,b+' cm'));break;
 case 'cylinderVolume':prompt='底面積 '+a+' cm²、高さ '+b+' cm の円柱の体積を求めましょう。';answer=a*b+' cm³';reason='底面積 × 高さ = '+a+' × '+b+' = '+answer;break;
 case 'circumference':prompt='直径 '+a+' cm の円の円周を求めましょう。円周率は3.14とします。';answer=a*314/100+' cm';reason=a+' × 3.14 = '+answer;break;
 }
 return{a,b,op:'',prompt,answer,reason,visual};
 });
};
})(window);
