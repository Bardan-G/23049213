import { relations } from 'drizzle-orm';
import { decimal, int, mysqlTable, serial, varchar, text, timestamp, bigint } from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users_table', {
  id: serial('id').primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
});

export const categories = mysqlTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
});

export const subcategories = mysqlTable('subcategories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  // FIXED: Changed int to bigint to match categories.id (serial)
  categoryId: bigint('category_id', { mode: 'number' })
    .references(() => categories.id, { onDelete: 'cascade' }),
});

export const products = mysqlTable('products', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  imageUrl: varchar('image_url', { length: 255 }),
  // FIXED: Ensure this is bigint to match subcategories.id (serial)
  subcategoryId: bigint('subcategory_id', { mode: 'number' })
    .references(() => subcategories.id, { onDelete: 'set null' }),
  stock: int('stock').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations remain the same
export const categoriesRelations = relations(categories, ({ many }) => ({
  subcategories: many(subcategories),
}));

export const subcategoriesRelations = relations(subcategories, ({ one, many }) => ({
  category: one(categories, {
    fields: [subcategories.categoryId],
    references: [categories.id],
  }),
  products: many(products),
}));

export const productsRelations = relations(products, ({ one }) => ({
  subcategory: one(subcategories, {
    fields: [products.subcategoryId],
    references: [subcategories.id],
  }),
}));

export const cartItems = mysqlTable('cart_items', {
  id: serial('id').primaryKey(),
  // Links the cart to a specific user
  userId: bigint('user_id', { mode: 'number' }).references(() => users.id, { onDelete: 'cascade' }),
  // Links to the product being bought
  productId: bigint('product_id', { mode: 'number' }).references(() => products.id, { onDelete: 'cascade' }),
  quantity: int('quantity').notNull().default(1),
  createdAt: timestamp('created_at').defaultNow(),
});

// Add Relations for easy fetching
export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  user: one(users, {
    fields: [cartItems.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
}));