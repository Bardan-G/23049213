import { int, mysqlTable, serial, varchar } from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users_table', {
  id: serial('id').primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  // age: int().notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),

})
;