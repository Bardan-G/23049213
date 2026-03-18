import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Inject } from '@nestjs/common';
import { MySql2Database } from 'drizzle-orm/mysql2';
import * as schema from '../db/schema';
import { sql } from 'drizzle-orm';

@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin')
export class AdminController {
    constructor(@Inject('DRIZZLE') private db: MySql2Database<typeof schema>) { }

    @Get('stats')
    async getStats() {
        const [userCount] = await this.db.select({ count: sql<number>`count(*)` }).from(schema.users);
        const [orderCount] = await this.db.select({ count: sql<number>`count(*)` }).from(schema.orders);
        const [productCount] = await this.db.select({ count: sql<number>`count(*)` }).from(schema.products);
        const [revenue] = await this.db.select({ total: sql<number>`sum(${schema.orders.total})` }).from(schema.orders);

        // Low stock logic (< 5 items)
        const lowStock = await this.db.select({ id: schema.products.id, name: schema.products.name, stock: schema.products.stock })
            .from(schema.products)
            .where(sql`${schema.products.stock} < 5`)
            .limit(5);

        // Sales Data for chart (Last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentOrders = await this.db.select({
            createdAt: schema.orders.createdAt,
            total: schema.orders.total
        })
            .from(schema.orders)
            .where(sql`${schema.orders.createdAt} >= ${sevenDaysAgo}`)
            .orderBy(schema.orders.createdAt);

        const salesDataMap = new Map<string, number>();
        recentOrders.forEach(order => {
            const dateStr = new Date(order.createdAt as unknown as Date).toLocaleDateString();
            salesDataMap.set(dateStr, (salesDataMap.get(dateStr) || 0) + Number(order.total));
        });

        const salesData = Array.from(salesDataMap.entries()).map(([date, amount]) => ({ date, amount }));

        return {
            users: userCount.count,
            orders: orderCount.count,
            products: productCount.count,
            revenue: revenue.total || 0,
            lowStock,
            salesData,
        };
    }
}
