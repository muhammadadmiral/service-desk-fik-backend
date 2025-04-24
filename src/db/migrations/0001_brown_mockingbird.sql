ALTER TABLE "users" DROP CONSTRAINT "users_uid_unique";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "uid";