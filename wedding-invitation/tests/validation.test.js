import {test} from 'node:test';
import assert from 'node:assert/strict';
import {imageType,MAX_BYTES,photoPath} from '../supabase/functions/guest-upload/validation.js';
test('only supported image signatures pass',()=>{
 assert.equal(imageType(new Uint8Array([255,216,255,0])),'image/jpeg');
 assert.equal(imageType(new Uint8Array([137,80,78,71,13,10,26,10])),'image/png');
 assert.equal(imageType(new TextEncoder().encode('RIFF0000WEBP')),'image/webp');
 for(const v of ['<svg>','<script>','GIF89a','', 'RIFF0000WAVE'])assert.equal(imageType(new TextEncoder().encode(v)),null);
 assert.equal(MAX_BYTES,10485760);
});
test('photo names use Seoul date across UTC midnight boundary and retain unique suffix',()=>{
 const before=photoPath('image/png',new Date('2026-10-16T14:59:59.123Z'),'abcdef12-aaaa');
 const after=photoPath('image/jpeg',new Date('2026-10-16T15:00:00.000Z'),'12345678-bbbb');
 assert.equal(before,'20261016_235959_123_abcdef12.png');
 assert.equal(after,'20261017_000000_000_12345678.jpg');
 assert.notEqual(photoPath('image/png',new Date(0),'aaaaaaaa'),photoPath('image/png',new Date(0),'bbbbbbbb'));
});
