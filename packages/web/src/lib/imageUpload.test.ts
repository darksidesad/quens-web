import { describe, it, expect } from 'vitest';
import { prepareImageForUpload } from './imageUpload';

describe('prepareImageForUpload', () => {
  it('acepta jpg pequeño sin recompress', async () => {
    const file = new File([new Uint8Array(100)], 'foto.jpg', { type: 'image/jpeg' });
    const out = await prepareImageForUpload(file);
    expect(out).toBe(file);
  });

  it('acepta archivo sin mime si la extensión es válida', async () => {
    const file = new File([new Uint8Array(100)], 'foto.jpg', { type: '' });
    const out = await prepareImageForUpload(file);
    expect(out).toBe(file);
  });
});
