import { mysqlTable, serial, varchar, timestamp, int } from 'drizzle-orm/mysql-core'

export const users = mysqlTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const posts = mysqlTable('posts', {
  id: serial('id').primaryKey(),
  userId: int('user_id').notNull(),
  message: varchar('message', { length: 280 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const favorites = mysqlTable('favorites', {
  id: serial('id').primaryKey(),
  userId: int('user_id').notNull(),
  postId: int('post_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
