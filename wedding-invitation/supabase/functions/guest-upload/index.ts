import {createClient} from 'npm:@supabase/supabase-js@2';
import {MAX_BYTES,imageType,photoPath} from './validation.js';
const origin=Deno.env.get('ALLOWED_ORIGIN')!;
const headers={'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'apikey,content-type','Access-Control-Allow-Methods':'POST,OPTIONS','Vary':'Origin'};
const reply=(status:number,message:string)=>new Response(JSON.stringify({message}),{status,headers:{...headers,'Content-Type':'application/json'}});
Deno.serve(async(req)=>{
 if(!origin||req.headers.get('origin')!==origin)return reply(403,'Forbidden');
 if(req.method==='OPTIONS')return new Response(null,{headers});
 if(req.method!=='POST')return reply(405,'Method not allowed');
 // Streaming cap also applies when Content-Length is absent or false.
 try{
 const reader=req.body?.getReader();if(!reader)return reply(400,'Missing body');
 const chunks:Uint8Array[]=[];let size=0;
 while(true){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>51*1024*1024){await reader.cancel();return reply(413,'Too large')}chunks.push(value)}
 const form=await new Response(new Blob(chunks),{headers:{'Content-Type':req.headers.get('content-type')||''}}).formData();
 const token=form.get('token');if(typeof token!=='string'||token.length>2048)return reply(400,'Invalid challenge');
 const verification=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body:new URLSearchParams({secret:Deno.env.get('TURNSTILE_SECRET_KEY')!,response:token})}).then(r=>r.json());
 if(!verification.success||verification.hostname!==new URL(origin).hostname||verification.action!=='wedding-upload')return reply(403,'Challenge failed');
 const files=form.getAll('photos');if(!files.length||files.length>5||files.some(f=>!(f instanceof File)||!f.size||f.size>MAX_BYTES))return reply(400,'Invalid files');
 const checked=[];
 for(const file of files as File[]){const bytes=new Uint8Array(await file.arrayBuffer());const type=imageType(bytes);if(!type||file.type!==type)return reply(400,'Invalid image');checked.push({bytes,type})}
 const db=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false}});
 const budget=await db.rpc('reserve_wedding_upload',{n:checked.length});if(budget.error||!budget.data)return reply(429,'Daily limit reached');
 const paths:string[]=[];
 for(const f of checked){const path=photoPath(f.type);const {error}=await db.storage.from('wedding-guests').upload(path,f.bytes,{contentType:f.type,upsert:false});if(error){if(paths.length)await db.storage.from('wedding-guests').remove(paths);return reply(503,'Upload failed')}paths.push(path)}
 // Never return object paths or download URLs to guests. Original bytes are stored unchanged.
 return reply(201,'Uploaded');
 }catch{return reply(400,'Unable to process upload')}
});
