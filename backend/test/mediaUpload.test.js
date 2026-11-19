import test from 'node:test';
import assert from 'node:assert/strict';
import { validateImageBytes } from '../src/controllers/mediaController.js';

test('accepts supported product-image signatures',()=>{
  validateImageBytes(Buffer.from([0xff,0xd8,0xff,0x00]),'image/jpeg');
  validateImageBytes(Buffer.from([137,80,78,71,13,10,26,10]),'image/png');
  validateImageBytes(Buffer.from('RIFF0000WEBP'),'image/webp');
  const avif=Buffer.alloc(24);avif.write('ftyp',4);avif.write('avif',8);validateImageBytes(avif,'image/avif');
});

test('rejects spoofed product-image content',()=>{
  assert.throws(()=>validateImageBytes(Buffer.from('<script>'),'image/png'),error=>error.code==='IMAGE_CONTENT_MISMATCH');
  assert.throws(()=>validateImageBytes(Buffer.from('%PDF-'),'image/webp'),error=>error.code==='IMAGE_CONTENT_MISMATCH');
});
