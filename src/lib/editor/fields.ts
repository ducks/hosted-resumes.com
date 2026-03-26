export interface FieldDef {
  key: string;
  label: string;
  type: 'text' | 'email' | 'url' | 'tel' | 'textarea' | 'date' | 'tags';
  placeholder?: string;
}

export const personFields: FieldDef[] = [
  { key: 'name', label: 'Full name', type: 'text', placeholder: 'Jane Doe' },
  { key: 'headline', label: 'Headline', type: 'text', placeholder: 'Software Engineer' },
  { key: 'location', label: 'Location', type: 'text', placeholder: 'New York, NY' },
  { key: 'email', label: 'Email', type: 'email', placeholder: 'jane@example.com' },
  { key: 'website', label: 'Website', type: 'url', placeholder: 'https://example.com' },
  { key: 'phone', label: 'Phone', type: 'tel', placeholder: '+1 555-123-4567' },
  { key: 'summary', label: 'Summary', type: 'textarea', placeholder: 'Brief professional summary...' },
];

export const experienceFields: FieldDef[] = [
  { key: 'title', label: 'Title', type: 'text', placeholder: 'Software Engineer' },
  { key: 'company', label: 'Company', type: 'text', placeholder: 'Acme Corp' },
  { key: 'location', label: 'Location', type: 'text', placeholder: 'Remote' },
  { key: 'start', label: 'Start date', type: 'date', placeholder: 'YYYY-MM' },
  { key: 'end', label: 'End date', type: 'date', placeholder: 'YYYY-MM or present' },
  { key: 'summary', label: 'Summary', type: 'textarea', placeholder: 'What you did...' },
  { key: 'technologies', label: 'Technologies', type: 'tags', placeholder: 'Rust, PostgreSQL' },
  { key: 'highlights', label: 'Highlights', type: 'tags', placeholder: 'Shipped feature X' },
];

export const projectFields: FieldDef[] = [
  { key: 'name', label: 'Project name', type: 'text', placeholder: 'my-project' },
  { key: 'url', label: 'URL', type: 'url', placeholder: 'https://github.com/user/repo' },
  { key: 'summary', label: 'Summary', type: 'textarea', placeholder: 'What the project does...' },
  { key: 'role', label: 'Role', type: 'text', placeholder: 'Creator' },
  { key: 'start', label: 'Start date', type: 'date', placeholder: 'YYYY-MM' },
  { key: 'end', label: 'End date', type: 'date', placeholder: 'YYYY-MM or present' },
  { key: 'technologies', label: 'Technologies', type: 'tags', placeholder: 'Rust, SQLite' },
];

export const educationFields: FieldDef[] = [
  { key: 'institution', label: 'Institution', type: 'text', placeholder: 'University of...' },
  { key: 'degree', label: 'Degree', type: 'text', placeholder: 'BSc Computer Science' },
  { key: 'location', label: 'Location', type: 'text', placeholder: 'City, Country' },
  { key: 'start', label: 'Start date', type: 'date', placeholder: 'YYYY-MM' },
  { key: 'end', label: 'End date', type: 'date', placeholder: 'YYYY-MM or present' },
  { key: 'details', label: 'Details', type: 'tags', placeholder: 'Honors, relevant courses' },
];

export function emptyExperience(): Record<string, unknown> {
  return { title: '', company: '' };
}

export function emptyProject(): Record<string, unknown> {
  return { name: '' };
}

export function emptyEducation(): Record<string, unknown> {
  return { institution: '', degree: '' };
}
