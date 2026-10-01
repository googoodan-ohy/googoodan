document.addEventListener('DOMContentLoaded',()=>{
 const grade=document.getElementById('ko-grade'),unit=document.getElementById('ko-unit'),topic=document.getElementById('ko-topic');
 if(!grade&&!topic)return;
 if(topic){const selected=new URL(location.href).searchParams.get('topic');if([...topic.options].some(o=>o.value===selected))topic.value=selected;}
 const blocks=[...document.querySelectorAll('.library-block')];
 function update(){
  if(topic){
   document.querySelectorAll('[data-topic-menu]').forEach(menu=>menu.open=menu.dataset.topicMenu===topic.value);
   const url=new URL(location.href);if(topic.value)url.searchParams.set('topic',topic.value);else url.searchParams.delete('topic');history.replaceState(null,'',url);
  }
  let count=0;
  for(const block of blocks){block.hidden=!!((grade?.value&&block.dataset.grade!==grade.value)||(unit?.value&&block.dataset.unit!==unit.value)||(topic?.value&&block.dataset.topic!==topic.value));if(!block.hidden)count+=block.querySelectorAll('.worksheet-gallery>li').length;}
  document.querySelectorAll('[data-topic-group]').forEach(group=>group.hidden=!!(topic?.value&&group.dataset.topicGroup!==topic.value));
  document.getElementById('selection-count').textContent=count+'개 문제지 · 정답과 풀이 포함';
 }
 if(grade)grade.addEventListener('change',()=>{unit.value='';for(const option of unit.options)option.hidden=!!(grade.value&&option.dataset.grade&&option.dataset.grade!==grade.value);update()});
 unit?.addEventListener('change',update);topic?.addEventListener('change',update);update();
});
