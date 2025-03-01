CREATE TABLE "Room" (
	"room_id" serial PRIMARY KEY NOT NULL,
	"room_name" text NOT NULL,
	"created_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "Users" (
	"user_id" serial PRIMARY KEY NOT NULL,
	"email" varchar NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT "Users_email_unique" UNIQUE("email")
);
