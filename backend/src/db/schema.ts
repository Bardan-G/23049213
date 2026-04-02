import { relations } from 'drizzle-orm';
import { decimal, int, mysqlTable, serial, varchar, text, longtext, timestamp, bigint, boolean } from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users_table', {
  id: serial('id').primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  role: varchar('role', { length: 20 }).notNull().default('customer'), // 'admin' | 'customer'
});

export const categories = mysqlTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
});

export const subcategories = mysqlTable('subcategories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  // FIXED: Changed int to bigint to match categories.id (serial)
  categoryId: bigint('category_id', { mode: 'number', unsigned: true })
    .references(() => categories.id, { onDelete: 'cascade' }),
});

export const products = mysqlTable('products', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  imageUrl: longtext('image_url'),
  model3dUrl: longtext('model_3d_url'),
  // FIXED: Ensure this is bigint to match subcategories.id (serial)
  subcategoryId: bigint('subcategory_id', { mode: 'number', unsigned: true })
    .references(() => subcategories.id, { onDelete: 'set null' }),
  stock: int('stock').notNull(),
  status: varchar('status', { length: 20 }).notNull().default('active'), // 'active' | 'inactive'
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').onUpdateNow(),
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

export const productVariants = mysqlTable('product_variants', {
  id: serial('id').primaryKey(),
  productId: bigint('product_id', { mode: 'number', unsigned: true })
    .references(() => products.id, { onDelete: 'cascade' }),
  colorName: varchar('color_name', { length: 255 }).notNull(),
  colorHex: varchar('color_hex', { length: 50 }).notNull(),
  imageUrl: longtext('image_url'), // Use text to allow long base64 strings
});

export const productImages = mysqlTable('product_images', {
  id: serial('id').primaryKey(),
  productId: bigint('product_id', { mode: 'number', unsigned: true })
    .references(() => products.id, { onDelete: 'cascade' }),
  imageUrl: longtext('image_url').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const productVariantsRelations = relations(productVariants, ({ one }) => ({
  product: one(products, {
    fields: [productVariants.productId],
    references: [products.id],
  }),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  subcategory: one(subcategories, {
    fields: [products.subcategoryId],
    references: [subcategories.id],
  }),
  variants: many(productVariants),
  images: many(productImages),
}));

export const cartItems = mysqlTable('cart_items', {
  id: serial('id').primaryKey(),
  // Links the cart to a specific user
  userId: bigint('user_id', { mode: 'number', unsigned: true }).references(() => users.id, { onDelete: 'cascade' }),
  // Links to the product being bought
  productId: bigint('product_id', { mode: 'number', unsigned: true }).references(() => products.id, { onDelete: 'cascade' }),
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

export const orders = mysqlTable('orders', {
  id: serial('id').primaryKey(),
  userId: bigint('user_id', { mode: 'number', unsigned: true }).references(() => users.id, { onDelete: 'cascade' }),
  total: decimal('total', { precision: 10, scale: 2 }).notNull(),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  address: text('address').notNull(),
  paymentMethod: varchar('payment_method', { length: 50 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const orderItems = mysqlTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: bigint('order_id', { mode: 'number', unsigned: true }).references(() => orders.id, { onDelete: 'cascade' }),
  productId: bigint('product_id', { mode: 'number', unsigned: true }).references(() => products.id),
  quantity: int('quantity').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
});

export const ordersRelations = relations(orders, ({ many, one }) => ({
  items: many(orderItems),
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const notifications = mysqlTable('notifications', {
  id: serial('id').primaryKey(),
  userId: bigint('user_id', { mode: 'number', unsigned: true }).references(() => users.id, { onDelete: 'cascade' }), // Nullable for admin notifications
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  isRead: boolean('is_read').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const messages = mysqlTable('messages', {
  id: serial('id').primaryKey(),
  senderId: bigint('sender_id', { mode: 'number', unsigned: true }).references(() => users.id, { onDelete: 'cascade' }),
  receiverId: bigint('receiver_id', { mode: 'number', unsigned: true }).references(() => users.id, { onDelete: 'cascade' }), // Null if it's a general message to admin, or we store admin's ID
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: 'senderRelations',
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
    relationName: 'receiverRelations',
  }),
}));