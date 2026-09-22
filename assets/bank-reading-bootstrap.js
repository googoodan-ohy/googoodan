globalThis.KoMath={profiles:()=>[],excludeArt(){},generate(){throw Error('Unsupported bank')}};
const originalIcon=KoArt.icon;KoArt.icon=(asset,...args)=>originalIcon({...asset,file:asset.file.startsWith('/')?asset.file:'/ko/'+asset.file},...args).replace(/alt="[^"]*"/g,'alt=""');
