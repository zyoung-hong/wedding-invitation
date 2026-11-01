import {test} from 'node:test';
import assert from 'node:assert/strict';
import {listGuestPhotos} from '../src/photo-library.js';
test('admin includes timestamp files at root and legacy files in dated folders',async()=>{
 const bucket={async list(path){return {data:path===''?[{id:'a',name:'20261017_001122_123_abcdef12.png'},{id:null,name:'2026-10-16'}]:[{id:'b',name:'legacy-photo.jpg'}],error:null}}};
 const found=await listGuestPhotos(bucket);
 assert.deepEqual(found.map(x=>x.path).sort(),['2026-10-16/legacy-photo.jpg','20261017_001122_123_abcdef12.png'].sort());
});
test('admin loads later pages and does not silently discard permission failures',async()=>{
 const calls=[];
 const bucket={async list(path,{offset}){calls.push(offset);return {data:offset===0?Array.from({length:100},(_,i)=>({id:String(i),name:`photo-${i}.png`})):[{id:'last',name:'last.png'}],error:null}}};
 assert.equal((await listGuestPhotos(bucket)).length,101);
 assert.deepEqual(calls,[0,100]);
 await assert.rejects(listGuestPhotos({async list(){return {data:null,error:new Error('Access denied')}}}),/Access denied/);
});
