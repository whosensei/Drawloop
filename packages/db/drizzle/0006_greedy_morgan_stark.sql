ALTER TABLE "rooms" DROP CONSTRAINT "rooms_slug_unique";--> statement-breakpoint
ALTER TABLE "rooms" ADD COLUMN "members" integer;--> statement-breakpoint
ALTER TABLE "rooms" DROP COLUMN "slug";