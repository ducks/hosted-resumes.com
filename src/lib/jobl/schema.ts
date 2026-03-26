import { z } from "zod";

// Date format: "YYYY-MM" or "present" for ongoing positions
const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}$/, "Date must be in YYYY-MM format");

const dateOrPresent = z.union([dateString, z.literal("present")]);

// Person - required top-level section
export const PersonSchema = z.object({
  name: z.string().min(1, "Name is required"),
  headline: z.string().optional(),
  location: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  phone: z.string().optional(),
  summary: z.string().optional(),
});

// Skills - maps category names to string arrays
export const SkillsSchema = z.record(z.string(), z.array(z.string()));

// Experience entry
export const ExperienceEntrySchema = z.object({
  title: z.string().min(1, "Title is required"),
  company: z.string().min(1, "Company is required"),
  location: z.string().optional(),
  start: dateString.optional(),
  end: dateOrPresent.optional(),
  summary: z.string().optional(),
  technologies: z.array(z.string()).optional(),
  highlights: z.array(z.string()).optional(),
});

// Project entry
export const ProjectEntrySchema = z.object({
  name: z.string().min(1, "Project name is required"),
  url: z.string().url().optional(),
  summary: z.string().optional(),
  role: z.string().optional(),
  start: dateString.optional(),
  end: dateOrPresent.optional(),
  technologies: z.array(z.string()).optional(),
});

// Education entry
export const EducationEntrySchema = z.object({
  institution: z.string().min(1, "Institution is required"),
  degree: z.string().min(1, "Degree is required"),
  location: z.string().optional(),
  start: dateString.optional(),
  end: dateOrPresent.optional(),
  details: z.array(z.string()).optional(),
});

// Full JOBL resume schema
export const JoblResumeSchema = z.object({
  jobl_version: z.string().min(1, "JOBL version is required"),
  person: PersonSchema,
  skills: SkillsSchema.optional(),
  experience: z.array(ExperienceEntrySchema).optional(),
  projects: z.array(ProjectEntrySchema).optional(),
  education: z.array(EducationEntrySchema).optional(),
});

// Relaxed schemas for editor autosave - no min-length, format, or
// required-field constraints. Accepts any in-progress resume shape.
const PartialPersonSchema = z.object({
  name: z.string().optional(),
  headline: z.string().optional(),
  location: z.string().optional(),
  email: z.string().optional(),
  website: z.string().optional(),
  phone: z.string().optional(),
  summary: z.string().optional(),
});

const PartialExperienceEntrySchema = z.object({
  title: z.string().optional(),
  company: z.string().optional(),
  location: z.string().optional(),
  start: z.string().optional(),
  end: z.string().optional(),
  summary: z.string().optional(),
  technologies: z.array(z.string()).optional(),
  highlights: z.array(z.string()).optional(),
});

const PartialProjectEntrySchema = z.object({
  name: z.string().optional(),
  url: z.string().optional(),
  summary: z.string().optional(),
  role: z.string().optional(),
  start: z.string().optional(),
  end: z.string().optional(),
  technologies: z.array(z.string()).optional(),
});

const PartialEducationEntrySchema = z.object({
  institution: z.string().optional(),
  degree: z.string().optional(),
  location: z.string().optional(),
  start: z.string().optional(),
  end: z.string().optional(),
  details: z.array(z.string()).optional(),
});

export const PartialJoblResumeSchema = z.object({
  jobl_version: z.string().optional(),
  person: PartialPersonSchema.optional(),
  skills: z.record(z.string(), z.array(z.string())).optional(),
  experience: z.array(PartialExperienceEntrySchema).optional(),
  projects: z.array(PartialProjectEntrySchema).optional(),
  education: z.array(PartialEducationEntrySchema).optional(),
});

// Inferred types
export type Person = z.infer<typeof PersonSchema>;
export type ExperienceEntry = z.infer<typeof ExperienceEntrySchema>;
export type ProjectEntry = z.infer<typeof ProjectEntrySchema>;
export type EducationEntry = z.infer<typeof EducationEntrySchema>;
export type JoblResume = z.infer<typeof JoblResumeSchema>;
export type PartialJoblResume = z.infer<typeof PartialJoblResumeSchema>;
