CREATE TABLE "user_rooms" (
	"user_id" integer NOT NULL,
	"room_id" integer NOT NULL,
	CONSTRAINT "user_rooms_user_id_room_id_pk" PRIMARY KEY("user_id","room_id")
);
--> statement-breakpoint
ALTER TABLE "user_rooms" ADD CONSTRAINT "user_rooms_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_rooms" ADD CONSTRAINT "user_rooms_room_id_rooms_room_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("room_id") ON DELETE no action ON UPDATE no action;