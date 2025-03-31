ALTER TABLE "rooms" ADD COLUMN "slug" integer;--> statement-breakpoint
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_slug_unique" UNIQUE("slug");