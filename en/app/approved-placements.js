(()=>{'use strict';
  const placements=[
    ['1.MD.A.1','w00095-1','Ordering Three Lengths Worksheets'],
    ['1.MD.B.3','w00083-1','Telling Time: Hours and Half Hours Worksheets'],
    ['2.MD.A.2','old-grade-2-measure-units','Measure in two units'],
    ['2.MD.C.7','w00007-1','Telling Time to Five Minutes Worksheets'],
    ['2.MD.D.9','w00096-1','Reading Whole-Number Line Plots Worksheets'],
    ['3.MD.B.4','w00111-1','Line Plot Worksheets: Fraction Measurements'],
    ['3.MD.C.5.a','w00085-1','Counting Square Units: Area Worksheets'],
    ['3.NBT.A.1','w00088-1','Rounding to Tens and Hundreds Worksheets'],
    ['4.NBT.A.3','old-grade-4-round','Round to any whole-number place'],
    ['4.MD.C.6','w00110-1','Angles Worksheets: Measuring and Drawing Angles'],
    ['5.G.A.1','w00087-1','Reading Ordered Pairs Worksheets'],
    ['5.G.A.1','old-grade-5-plot-points','Plot and interpret points'],
    ['5.MD.C.3.b','w00086-1','Volume with Layers of Unit Cubes Worksheets']
  ];
  function find(nodes,code){
    for(const node of nodes){
      if(node.code===code)return node;
      const child=find(node.units||node.standards||node.children||[],code);
      if(child)return child;
    }
    return null;
  }
  for(const [code,id,title] of placements){
    const standard=find(window.USGradeUnits||[],code);
    if(!standard)throw Error(`Missing Common Core standard ${code}`);
    standard.items ||= [];
    if(standard.items.some(item=>item.url?.includes(`id=${encodeURIComponent(id)}`)))continue;
    standard.items.push({
      title,
      concept:`${code} · Printable worksheet and answer key`,
      url:`approved-worksheets/?id=${encodeURIComponent(id)}&embedded=1`,
      approvedWorksheetId:id
    });
  }
  window.USApprovedPlacements=placements;
  if(typeof render==='function')render();
})();
