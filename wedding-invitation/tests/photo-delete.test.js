import test from 'node:test';
import assert from 'node:assert/strict';
import {deleteGuestPhoto} from '../src/photo-library.js';
test('delete sends the exact legacy or root path to Storage and requires a confirmed result',async()=>{
 for(const path of ['20261016_213045_123_a1b2c3d4.png','2026-10-16/old.png']){
  await deleteGuestPhoto({remove:async(paths)=>{assert.deepEqual(paths,[path]);return {data:[{name:path}],error:null}}},path);
 }
 await assert.rejects(deleteGuestPhoto({remove:async()=>({data:[],error:null})},'photo.png'));
 await assert.rejects(deleteGuestPhoto({remove:async()=>({data:null,error:new Error('denied')})},'photo.png'),/denied/);
});
