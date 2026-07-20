ALTER TABLE "tasks" ALTER COLUMN "requirements" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "requirements" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "short_description" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "max_participants" integer;