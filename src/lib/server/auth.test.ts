import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from './auth';

describe('password hashing', () => {
  it('should hash and verify a password', () => {
    const password = 'test-password-123';
    const hash = hashPassword(password);

    expect(hash).toContain(':');
    expect(verifyPassword(password, hash)).toBe(true);
  });

  it('should reject wrong password', () => {
    const hash = hashPassword('correct-password');
    expect(verifyPassword('wrong-password', hash)).toBe(false);
  });

  it('should produce different hashes for the same password', () => {
    const password = 'same-password';
    const hash1 = hashPassword(password);
    const hash2 = hashPassword(password);

    expect(hash1).not.toBe(hash2);
    expect(verifyPassword(password, hash1)).toBe(true);
    expect(verifyPassword(password, hash2)).toBe(true);
  });

  it('should produce a salt:hash format with hex strings', () => {
    const hash = hashPassword('test');
    const [salt, derived] = hash.split(':');

    expect(salt).toMatch(/^[0-9a-f]{32}$/);
    expect(derived).toMatch(/^[0-9a-f]{128}$/);
  });
});
