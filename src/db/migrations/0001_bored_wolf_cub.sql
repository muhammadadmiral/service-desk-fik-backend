ALTER TABLE "users" ADD COLUMN "nip" varchar(20);--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_nip_unique" UNIQUE("nip");