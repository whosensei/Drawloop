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
    createdAt: timestamp("created_at").defaultNow(),
    adminId: integer("admin_id").notNull(),
    members : integer("members")
})

export const chats = pgTable("chats", {
    id: serial("id").primaryKey().notNull(),
    roomId: integer("room_id").notNull(),
    userId: integer("user_id").notNull(),
    message: text("message").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
})

// New join table for user-room relationships
export const userRooms = pgTable("user_rooms", {
    userId: integer("user_id").notNull().references(() => User.id),
    roomId: integer("room_id").notNull().references(() => Room.id),
}, (t) => ({
    pk: primaryKey({ columns: [t.userId, t.roomId] }),
}));

export const usersRelations = relations(User, ({ many }) => ({
    rooms: many(userRooms),
    chats: many(chats),
}));

export const roomsRelations = relations(Room, ({ one, many }) => ({
    admin: one(User, { fields: [Room.adminId], references: [User.id] }),
    members: many(userRooms),
    chats: many(chats),
}));

export const userRoomsRelations = relations(userRooms, ({ one }) => ({
    user: one(User, { fields: [userRooms.userId], references: [User.id] }),
    room: one(Room, { fields: [userRooms.roomId], references: [Room.id] }),
}));

export const chatsRelations = relations(chats, ({ one }) => ({
    room: one(Room, { fields: [chats.roomId], references: [Room.id] }),
    user: one(User, { fields: [chats.userId], references: [User.id] }),
}));