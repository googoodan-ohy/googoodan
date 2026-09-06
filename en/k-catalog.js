// Each entry is an authored combination of three activities, not a shuffled layout.
(function(root){
const units=[
['numbers','Numbers 0–20','K.CC.A.3',[
['Meet 0–5',5,'trace,count,draw'],['Meet 6–10',10,'trace,count,match'],['Meet 11–15',15,'trace,match,draw'],['Meet 16–20',20,'trace,count,draw']]],
['count','Count the pictures','K.CC.B.4–5',[
['Count to 5',5,'count,match,draw'],['Count to 10',10,'count,select,draw'],['Scattered treasures',10,'scatter,select,count'],['Count to 20',20,'count,match,select'],['Same number, new arrangement',10,'rearrange,scatter,draw']]],
['sequence','Number paths','K.CC.A.1–2',[
['Next numbers to 10',10,'next,path,continue'],['Number paths to 20',20,'path,continue,next'],['Count on to 100',100,'continue,next,path'],['Count by tens',100,'tens,path10,next10']]],
['compare','More, fewer, equal','K.CC.C.6–7',[
['More or fewer to 5',5,'more,less,equal'],['Compare groups to 10',10,'more,less,equal'],['Compare written numbers',10,'larger,smaller,sameNumber'],['Match and compare',10,'pairCompare,larger,equal']]],
['parts','Put together, take apart','K.OA.A.1,3',[
['Join little groups',5,'join,part,split'],['Break apart 5',5,'split,part,join'],['Number bonds to 10',10,'bond,part,split'],['Two ways to make a number',10,'twoWays,bond,join'],['Parts and wholes',10,'partStory,split,bond']]],
['add','Addition','K.OA.A.1–2,5',[
['Picture addition to 5',5,'addPicture,addChoice,addDraw'],['Number sentences to 5',5,'addEquation,addMatch,addChoice'],['Picture addition to 10',10,'addPicture,addFrame,addDraw'],['Number sentences to 10',10,'addEquation,addChoice,addMatch'],['Little addition stories',10,'addStory,joinStory,addPicture'],['Addition adventure',10,'addPicture,addEquation,addStory']]],
['sub','Subtraction','K.OA.A.1–2,5',[
['Cross out and count to 5',5,'subPicture,subChoice,subDraw'],['Number sentences to 5',5,'subEquation,subMatch,subChoice'],['Take away to 10',10,'subPicture,subDraw,subStory'],['Number sentences to 10',10,'subEquation,subChoice,subMatch'],['Little subtraction stories',10,'subStory,hideStory,subPicture'],['Subtraction adventure',10,'subPicture,subEquation,subStory']]],
['ten','Make 10','K.OA.A.4',[
['Fill the ten-frame',10,'tenFrame,tenDraw,tenChoice'],['Find the missing part',10,'tenEquation,tenFrame,tenChoice'],['Ten little treasures',10,'tenStory,tenDraw,tenEquation']]],
['teen','Numbers 11–19','K.NBT.A.1',[
['Ten and some more',19,'teenCount,teenEquation,teenMatch'],['Build a teen number',19,'teenDraw,teenCount,teenEquation'],['Break apart teen numbers',19,'teenEquation,teenPart,teenMatch'],['Teen-number adventure',19,'teenStory,teenDraw,teenPart']]],
['measure','Compare sizes','K.MD.A.1–2',[
['Longer and shorter',0,'longer,shorter,lengthStory'],['Taller and shorter',0,'taller,lower,heightStory'],['Heavier and lighter',0,'heavier,lighter,weightStory']]],
['sort','Sort and count','K.MD.B.3',[
['Sort by shape',10,'sortShape,countShape,mostShape'],['Sort by color',10,'sortColor,countColor,leastColor'],['Sort by size',10,'sortSize,countSize,mostSize'],['Sorting detective',10,'countShape,leastColor,mostSize']]],
['geometry','Shapes and positions','K.G.A.1–3, K.G.B.4–6',[
['Meet flat shapes',0,'shapeName,shapeFind,shapeDraw'],['Turn a shape around',0,'rotated,shapeCorners,shapeSides'],['Solid-shape explorers',0,'solidName,flatSolid,solidMatch'],['Where is the star?',0,'position,positionDraw,positionChoice'],['Shape detectives',0,'shapeSides,shapeCorners,shapeCompare'],['Build with shapes',0,'compose,shapeDraw,build']]]
];
const catalog=units.map(([id,title,code,items])=>({id,title,code,items:items.map(([title,max,modes],i)=>({id:id+'-'+(i+1),title,max,modes:modes.split(',')}))}));
root.KCatalog=catalog;if(typeof module!=='undefined')module.exports=catalog;
})(globalThis);
