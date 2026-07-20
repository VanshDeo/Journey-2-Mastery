ALTER TABLE "tasks" ADD COLUMN "bonus_points" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "deadline" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "participants_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "requirements" jsonb DEFAULT '[]'::jsonb;