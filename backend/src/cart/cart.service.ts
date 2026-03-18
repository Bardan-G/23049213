import { Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { MySql2Database } from "drizzle-orm/mysql2";
import * as schema from "src/db/schema"; // 1. Import everything as schema

@Injectable()
export class CartService {
  // 2. Pass schema to MySql2Database type
  constructor(@Inject('DRIZZLE') private db: MySql2Database<typeof schema>) { }

  async syncCart(userId: number, items: { productId: number; quantity: number }[]) {
    await this.db.delete(schema.cartItems).where(eq(schema.cartItems.userId, userId));

    if (items.length > 0) {
      await this.db.insert(schema.cartItems).values(
        items.map(item => ({
          userId,
          productId: item.productId,
          quantity: item.quantity,
        }))
      );
    }
    return { message: 'Cart synced successfully' };
  }

  async getCart(userId: number) {
    // This will now work perfectly!
    return await this.db.query.cartItems.findMany({
      where: eq(schema.cartItems.userId, userId),
      with: { product: true },
    });
  }
}