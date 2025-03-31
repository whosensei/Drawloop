import { pgTable, integer, primaryKey, serial, text, varchar, timestamp } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm";


export const User = pgTable("users", {
    id: serial("user_id").primaryKey(),
    email: text("email").notNull().unique(),
    username: text("username").notNull(),
    password: text("password").notNull(),
})

export const Room = pgTable("rooms", {
    id: serial("room_id").primaryKey(),
    name: text("room_name").notNull(),
    createdAt: timestamp("created_at"),
    adminId: integer("admin_id").notNull(),
    slug : integer("slug").unique()
})

export const chats = pgTable("chats", {
    id: serial("id").primaryKey().notNull(),
    roomId: integer("room_id").notNull(),
    userId: integer("user_id").notNull(),
    message: text("message").notNull(),
    createdAt: timestamp("created_at"),
})

export const usersRelations = relations(User, ({ many }) => ({
    rooms: many(Room),
    chats: many(chats),
}));

export const roomsRelations = relations(Room, ({ one, many }) => ({
    admin: one(User, { fields: [Room.adminId], references: [User.id] }),
    chats: many(chats),
}));

export const chatsRelations = relations(chats, ({ one }) => ({
    room: one(Room, { fields: [chats.roomId], references: [Room.id] }),
    user: one(User, { fields: [chats.userId], references: [User.id] }),
}));