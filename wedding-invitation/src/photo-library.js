// Reads only through the signed-in user's Storage client; Storage RLS remains authoritative.
export async function deleteGuestPhoto(bucket,path){
 const {data,error}=await bucket.remove([path]);
 if(error)throw error;
 if(!data?.some(item=>item.name===path))throw new Error('삭제 권한 또는 파일 상태를 확인해 주세요.');
}
export async function listGuestPhotos(bucket){
 const photos=[];
 const folders=[''];
 for(let i=0;i<folders.length;i++){
  const prefix=folders[i];
  let offset=0;
  while(true){
   const {data,error}=await bucket.list(prefix,{limit:100,offset});
   if(error)throw error;
   for(const item of data){
    const path=prefix?`${prefix}/${item.name}`:item.name;
    if(item.id){
     if(item.name!=='.emptyFolderPlaceholder')photos.push({name:item.name,path});
    }else folders.push(path);
   }
   if(data.length<100)break;
   offset+=100;
  }
 }
 return photos.sort((a,b)=>a.path.localeCompare(b.path));
}
