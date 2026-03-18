import { Inject, Injectable } from '@nestjs/common';
import { MySql2Database } from 'drizzle-orm/mysql2';
import * as schema from '../db/schema';
import { eq, desc, isNull } from 'drizzle-orm';

@Injectable()
export class NotificationsService {
    constructor(@Inject('DRIZZLE') private db: MySql2Database<typeof schema>) { }

    async getUserNotifications(userId: number) {
        return await this.db.query.notifications.findMany({
            where: eq(schema.notifications.userId, userId),
            orderBy: [desc(schema.notifications.createdAt)],
            limit: 50,
        });
    }

    async getAdminNotifications() {
        return await this.db.query.notifications.findMany({
            where: isNull(schema.notifications.userId),
            orderBy: [desc(schema.notifications.createdAt)],
            limit: 50,
        });
    }

    async createNotification(title: string, message: string, userId: number | null = null) {
        await this.db.insert(schema.notifications).values({
            userId,
            title,
            message,
        });
    }

    async markAsRead(id: number) {
        await this.db.update(schema.notifications).set({ isRead: true }).where(eq(schema.notifications.id, id));
        return { success: true };
    }
}
