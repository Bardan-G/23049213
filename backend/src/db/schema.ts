import { decimal, int, mysqlTable, serial, varchar,text,timestamp } from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users_table', {
  id: serial('id').primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  // age: int().notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),

});

export const products = mysqlTable('products',{
  id:serial('id').primaryKey(),
  name:varchar('name',{length:255}).notNull(),
  description:text('description'),
  price:decimal('price',{precision:10,scale:2}).notNull(),
  imageUrl:varchar('image_url',{length:255}),
  category:varchar('category',{length:100}).notNull(),
  subcategory:varchar('subcategory',{length:100}),
  stock:int('stock').notNull(),
  createdAt: timestamp('created_at').defaultNow()
})
