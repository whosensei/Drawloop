import {pgTable ,integer,primaryKey,serial,text,varchar,timestamp} from "drizzle-orm/pg-core"

export const User = pgTable("Users" , {
    id :serial("user_id").primaryKey(),
    email : varchar("email").notNull().unique(),
    username : text("username").notNull(),
    password : text("password").notNull(), 
})

export const Room  = pgTable("Room" ,{
    RoomId : serial("room_id").primaryKey(),
    name : text("room_name").notNull(),
    createdAt : timestamp("created_at"),

})
