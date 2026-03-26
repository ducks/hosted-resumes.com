import { pgTable, text, timestamp, integer, jsonb, boolean, uniqueIndex } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

// Users table - stores authentication and account info
export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  username: text('username').notNull().unique(), // used for subdomain: username.hosted-resumes.com
  displayName: text('display_name'),
  tier: text('tier').notNull().default('free'), // 'free', 'pro', 'business'
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  usernameIdx: uniqueIndex('username_idx').on(table.username),
  emailIdx: uniqueIndex('email_idx').on(table.email),
}));

// Resumes table - stores the current state of each resume
export const resumes = pgTable('resumes', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  slug: text('slug').notNull(), // URL-friendly identifier for the resume
  title: text('title').notNull(),
  theme: text('theme').notNull().default('classic'), // 'classic', 'modern', 'minimal'
  isPublished: boolean('is_published').notNull().default(false),
  joblContent: jsonb('jobl_content').notNull(), // JOBL-formatted resume data as JSON
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userSlugIdx: uniqueIndex('user_slug_idx').on(table.userId, table.slug),
}));

// Resume versions table - immutable history of all resume changes
export const resumeVersions = pgTable('resume_versions', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  resumeId: text('resume_id').notNull().references(() => resumes.id, { onDelete: 'cascade' }),
  versionNumber: integer('version_number').notNull(),
  joblContent: jsonb('jobl_content').notNull(),
  theme: text('theme').notNull(),
  changeDescription: text('change_description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  resumeVersionIdx: uniqueIndex('resume_version_idx').on(table.resumeId, table.versionNumber),
}));

// Sessions table - for authentication sessions
export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
});

// Types derived from schema
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Resume = typeof resumes.$inferSelect;
export type NewResume = typeof resumes.$inferInsert;
export type ResumeVersion = typeof resumeVersions.$inferSelect;
export type NewResumeVersion = typeof resumeVersions.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
