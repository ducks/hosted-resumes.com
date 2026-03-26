import { describe, it, expect } from 'vitest';
import { renderResume } from './render-resume';
import type { JoblResume } from '$lib/jobl/schema';

const minimalResume: JoblResume = {
  jobl_version: '1.0',
  person: {
    name: 'Test User',
  },
};

const fullResume: JoblResume = {
  jobl_version: '1.0',
  person: {
    name: 'Jane Doe',
    headline: 'Software Engineer',
    email: 'jane@example.com',
    phone: '555-0100',
    location: 'Portland, OR',
    summary: 'Experienced engineer.',
  },
  skills: {
    languages: ['TypeScript', 'Rust'],
  },
  experience: [
    {
      title: 'Senior Engineer',
      company: 'Acme Corp',
      start: '2020-01',
      end: 'present',
      highlights: ['Led migration to microservices'],
    },
  ],
  education: [
    {
      institution: 'State University',
      degree: 'BS Computer Science',
      start: '2012-09',
      end: '2016-05',
    },
  ],
};

describe('renderResume', () => {
  it('should produce a valid HTML document', () => {
    const html = renderResume(minimalResume, 'classic');
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<html');
    expect(html).toContain('</html>');
    expect(html).toContain('Test User');
  });

  it('should include @page rules for print sizing', () => {
    const html = renderResume(minimalResume, 'classic');
    expect(html).toContain('@page');
    expect(html).toContain('8.5in 11in');
  });

  it('should include print-color-adjust', () => {
    const html = renderResume(minimalResume, 'classic');
    expect(html).toContain('print-color-adjust: exact');
  });

  it('should render full resume data', () => {
    const html = renderResume(fullResume, 'classic');
    expect(html).toContain('Jane Doe');
    expect(html).toContain('Software Engineer');
    expect(html).toContain('jane@example.com');
    expect(html).toContain('Senior Engineer');
    expect(html).toContain('Acme Corp');
    expect(html).toContain('State University');
    expect(html).toContain('TypeScript');
  });

  it('should fall back to classic for unknown theme', () => {
    const html = renderResume(minimalResume, 'nonexistent');
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('Test User');
  });

  it('should render modern theme', () => {
    const html = renderResume(fullResume, 'modern');
    expect(html).toContain('Jane Doe');
    expect(html).toContain('<!DOCTYPE html>');
  });

  it('should render minimal theme', () => {
    const html = renderResume(fullResume, 'minimal');
    expect(html).toContain('Jane Doe');
    expect(html).toContain('<!DOCTYPE html>');
  });
});
