import { int, mysqlTable, varchar, timestamp } from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
  id: int().primaryKey().autoincrement(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const shortLinks = mysqlTable('shortLinks', {
  id: int().primaryKey().autoincrement(),
  url: varchar({ length: 255 }).notNull(),
  shortCode: varchar("short_code", { length: 25 }).notNull().unique(),
  userId: int("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});