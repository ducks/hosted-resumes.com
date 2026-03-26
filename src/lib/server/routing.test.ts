import { describe, it, expect } from 'vitest';
import { parseHost } from './routing';

describe('parseHost', () => {
  const base = 'hosted-resumes.com';

  it('returns marketing for bare domain root', () => {
    expect(parseHost('hosted-resumes.com', base, '/'))
      .toEqual({ kind: 'marketing' });
  });

  it('returns app for /dashboard', () => {
    expect(parseHost('hosted-resumes.com', base, '/dashboard'))
      .toEqual({ kind: 'app' });
  });

  it('returns app for /editor/abc', () => {
    expect(parseHost('hosted-resumes.com', base, '/editor/abc'))
      .toEqual({ kind: 'app' });
  });

  it('returns app for /api/resumes', () => {
    expect(parseHost('hosted-resumes.com', base, '/api/resumes'))
      .toEqual({ kind: 'app' });
  });

  it('returns app for /settings', () => {
    expect(parseHost('hosted-resumes.com', base, '/settings'))
      .toEqual({ kind: 'app' });
  });

  it('returns marketing for /pricing', () => {
    expect(parseHost('hosted-resumes.com', base, '/pricing'))
      .toEqual({ kind: 'marketing' });
  });

  it('returns tenant for valid subdomain', () => {
    expect(parseHost('alice.hosted-resumes.com', base, '/'))
      .toEqual({ kind: 'tenant', subdomain: 'alice' });
  });

  it('returns tenant for hyphenated subdomain', () => {
    expect(parseHost('my-resume.hosted-resumes.com', base, '/'))
      .toEqual({ kind: 'tenant', subdomain: 'my-resume' });
  });

  it('returns marketing for subdomain starting with hyphen', () => {
    expect(parseHost('-bad.hosted-resumes.com', base, '/'))
      .toEqual({ kind: 'marketing' });
  });

  it('returns marketing for subdomain ending with hyphen', () => {
    expect(parseHost('bad-.hosted-resumes.com', base, '/'))
      .toEqual({ kind: 'marketing' });
  });

  it('lowercases host for tenant detection', () => {
    expect(parseHost('ALICE.hosted-resumes.com', base, '/'))
      .toEqual({ kind: 'tenant', subdomain: 'alice' });
  });

  it('returns marketing for localhost in dev mode', () => {
    expect(parseHost('localhost', 'localhost', '/'))
      .toEqual({ kind: 'marketing' });
  });

  it('returns tenant for subdomain on localhost', () => {
    expect(parseHost('alice.localhost', 'localhost', '/'))
      .toEqual({ kind: 'tenant', subdomain: 'alice' });
  });

  it('strips port from host', () => {
    expect(parseHost('hosted-resumes.com:3000', base, '/'))
      .toEqual({ kind: 'marketing' });
  });

  it('strips port and detects app route', () => {
    expect(parseHost('hosted-resumes.com:3000', base, '/dashboard'))
      .toEqual({ kind: 'app' });
  });

  it('returns marketing for nested subdomain', () => {
    expect(parseHost('a.b.hosted-resumes.com', base, '/'))
      .toEqual({ kind: 'marketing' });
  });

  it('returns marketing for unrelated host', () => {
    expect(parseHost('example.com', base, '/'))
      .toEqual({ kind: 'marketing' });
  });

  it('handles single-char subdomain', () => {
    expect(parseHost('x.hosted-resumes.com', base, '/'))
      .toEqual({ kind: 'tenant', subdomain: 'x' });
  });

  it('strips port from base domain for comparison', () => {
    expect(parseHost('localhost:5173', 'localhost:5173', '/'))
      .toEqual({ kind: 'marketing' });
  });

  it('returns app for localhost with app path', () => {
    expect(parseHost('localhost:5173', 'localhost:5173', '/dashboard'))
      .toEqual({ kind: 'app' });
  });
});
