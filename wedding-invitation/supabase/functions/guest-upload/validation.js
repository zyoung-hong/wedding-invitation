export const MAX_BYTES=10*1024*1024;
export function photoPath(type, now=new Date(), unique=crypto.randomUUID()){
 const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(now);
 const p=Object.fromEntries(parts.map(x=>[x.type,x.value]));
 const stamp=`${p.year}${p.month}${p.day}_${p.hour}${p.minute}${p.second}_${String(now.getUTCMilliseconds()).padStart(3,'0')}`;
 const ext=type==='image/jpeg'?'jpg':type==='image/png'?'png':'webp';
 return `${stamp}_${unique.slice(0,8)}.${ext}`;
}
export function imageType(b){
 if(b[0]===255&&b[1]===216&&b[2]===255)return 'image/jpeg';
 if([137,80,78,71,13,10,26,10].every((v,i)=>b[i]===v))return 'image/png';
 if(String.fromCharCode(...b.slice(0,4))==='RIFF'&&String.fromCharCode(...b.slice(8,12))==='WEBP')return 'image/webp';
 return null;
}
