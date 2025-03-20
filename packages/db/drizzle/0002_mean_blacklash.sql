CREATE TABLE "chats" (
	"id" serial PRIMARY KEY NOT NULL,
	"room_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "Room" RENAME TO "rooms";--> statement-breakpoint
ALTER TABLE "Users" RENAME TO "users";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "Users_email_unique";--> statement-breakpoint
ALTER TABLE "rooms" ADD COLUMN "admin_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_email_unique" UNIQUE("email");