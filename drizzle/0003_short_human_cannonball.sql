ALTER TABLE "resumes" ADD COLUMN "source_type" text DEFAULT 'manual' NOT NULL;--> statement-breakpoint
ALTER TABLE "resumes" ADD COLUMN "repo_url" text;--> statement-breakpoint
ALTER TABLE "resumes" ADD COLUMN "repo_path" text;--> statement-breakpoint
ALTER TABLE "resumes" ADD COLUMN "repo_branch" text DEFAULT 'main';--> statement-breakpoint
ALTER TABLE "resumes" ADD COLUMN "last_synced_at" timestamp;--> statement-breakpoint
ALTER TABLE "resumes" ADD COLUMN "sync_error" text;