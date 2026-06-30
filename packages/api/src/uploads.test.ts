import { describe, it, expect } from 'vitest';
import { resolveUploadFilename, isAllowedImage } from './uploads.js';

describe('uploads', () => {
  it('extrae nombre de archivo de la URL', () => {
    expect(resolveUploadFilename('/uploads/123-foto.jpg')).toBe('123-foto.jpg');
  });

  it('rechaza path traversal', () => {
    expect(resolveUploadFilename('/uploads/../secret')).toBeNull();
    expect(resolveUploadFilename('/uploads/foo/bar')).toBeNull();
  });

  it('acepta imagen por extension si el mime viene vacio', () => {
    expect(isAllowedImage({ type: '', name: 'foto.JPG' })).toBe(true);
    expect(isAllowedImage({ type: 'application/pdf', name: 'doc.pdf' })).toBe(false);
  });
});
