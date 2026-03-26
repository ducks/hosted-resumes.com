import { describe, it, expect } from 'vitest';
import { validateUpload, buildObjectKey } from './upload-validation';

function makeFile(
  name: string,
  type: string,
  sizeBytes: number
): File {
  const buf = new Uint8Array(sizeBytes);
  return new File([buf], name, { type });
}

describe('validateUpload', () => {
  it('accepts jpeg', () => {
    const result = validateUpload(makeFile('photo.jpg', 'image/jpeg', 1024));
    expect(result).toEqual({ ok: true, ext: 'jpg' });
  });

  it('accepts png', () => {
    const result = validateUpload(makeFile('photo.png', 'image/png', 1024));
    expect(result).toEqual({ ok: true, ext: 'png' });
  });

  it('accepts webp', () => {
    const result = validateUpload(makeFile('photo.webp', 'image/webp', 1024));
    expect(result).toEqual({ ok: true, ext: 'webp' });
  });

  it('accepts gif', () => {
    const result = validateUpload(makeFile('anim.gif', 'image/gif', 1024));
    expect(result).toEqual({ ok: true, ext: 'gif' });
  });

  it('rejects unsupported mime type', () => {
    const result = validateUpload(makeFile('doc.pdf', 'application/pdf', 1024));
    expect(result).toEqual({
      ok: false,
      status: 415,
      error: 'unsupported file type, allowed: jpeg, png, webp, gif',
    });
  });

  it('rejects files over 2 MB', () => {
    const overLimit = 2 * 1024 * 1024 + 1;
    const result = validateUpload(makeFile('big.jpg', 'image/jpeg', overLimit));
    expect(result).toEqual({
      ok: false,
      status: 413,
      error: 'file too large, max 2 MB',
    });
  });

  it('accepts files at exactly 2 MB', () => {
    const atLimit = 2 * 1024 * 1024;
    const result = validateUpload(makeFile('exact.jpg', 'image/jpeg', atLimit));
    expect(result).toEqual({ ok: true, ext: 'jpg' });
  });
});

describe('buildObjectKey', () => {
  it('includes user id prefix', () => {
    const key = buildObjectKey('user-123', 'jpg');
    expect(key).toMatch(/^user-123\//);
  });

  it('ends with correct extension', () => {
    const key = buildObjectKey('user-123', 'png');
    expect(key).toMatch(/\.png$/);
  });

  it('contains a uuid segment', () => {
    const key = buildObjectKey('user-123', 'webp');
    const uuid = key.replace('user-123/', '').replace('.webp', '');
    expect(uuid).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
    );
  });

  it('generates unique keys', () => {
    const a = buildObjectKey('user-1', 'jpg');
    const b = buildObjectKey('user-1', 'jpg');
    expect(a).not.toEqual(b);
  });
});
