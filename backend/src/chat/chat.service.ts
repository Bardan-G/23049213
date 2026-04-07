import { Injectable, Inject } from '@nestjs/common';
import { MySql2Database } from 'drizzle-orm/mysql2';
import { messages, users } from '../db/schema';
import * as schema from '../db/schema';
import { eq, or, and, desc, sql, inArray } from 'drizzle-orm';

@Injectable()
export class ChatService {
    constructor(@Inject('DRIZZLE') private db: MySql2Database<typeof schema>) { }

    async saveMessage(senderId: number, receiverId: number, content: string) {
        const [result] = await this.db.insert(messages).values({
            senderId,
            receiverId,
            content,
        });

        // Fetch and return the newly created message with sender/receiver details
        const newMessageList = await this.db.select({
            id: messages.id,
            senderId: messages.senderId,
            receiverId: messages.receiverId,
            content: messages.content,
            createdAt: messages.createdAt,
            sender: {
                id: users.id,
                name: users.name,
                role: users.role,
            }
        }).from(messages)
            .leftJoin(users, eq(messages.senderId, users.id))
            .where(eq(messages.id, result.insertId));

        return newMessageList[0];
    }

    async getChatHistory(userId1: number, userId2: number) {
        // Fetch users to know who is who based on role
        const usersList = await this.db.select({ id: users.id, role: users.role }).from(users).where(
            or(eq(users.id, userId1), eq(users.id, userId2))
        );
        const user1 = usersList.find(u => Number(u.id) === Number(userId1));
        const user2 = usersList.find(u => Number(u.id) === Number(userId2));

        let queryCondition;

        if ((user1?.role === 'admin' && user2?.role === 'customer') || (user1?.role === 'customer' && user2?.role === 'admin')) {
            const customerId = user1?.role === 'customer' ? userId1 : userId2;
            
            // Get all admin IDs
            const adminUsers = await this.db.select({ id: users.id }).from(users).where(eq(users.role, 'admin'));
            const adminIds = adminUsers.map(a => a.id);
            if (adminIds.length === 0) adminIds.push(-1); // prevent empty array error

            queryCondition = or(
                // Message from Customer to any Admin
                and(eq(messages.senderId, customerId), inArray(messages.receiverId, adminIds)),
                // Message from any Admin to Customer
                and(inArray(messages.senderId, adminIds), eq(messages.receiverId, customerId))
            );
        } else {
            // Default exact peer-to-peer (just in case admins chat with each other)
            queryCondition = or(
                and(eq(messages.senderId, userId1), eq(messages.receiverId, userId2)),
                and(eq(messages.senderId, userId2), eq(messages.receiverId, userId1))
            );
        }

        return await this.db.select({
            id: messages.id,
            senderId: messages.senderId,
            receiverId: messages.receiverId,
            content: messages.content,
            createdAt: messages.createdAt,
            sender: {
                id: users.id,
                name: users.name,
                role: users.role,
            }
        })
            .from(messages)
            .leftJoin(users, eq(messages.senderId, users.id))
            .where(queryCondition)
            .orderBy(messages.createdAt);
    }

    async getActiveChats() {
        // Get unique users who have chatted with admins
        const chatUsers = await this.db.select({
            userId: sql<number>`CASE WHEN ${messages.senderId} IN (SELECT id FROM users_table WHERE role = 'admin') THEN ${messages.receiverId} ELSE ${messages.senderId} END`.as('userId'),
            lastMessageAt: sql<Date>`MAX(${messages.createdAt})`.as('lastMessageAt')
        })
            .from(messages)
            .groupBy(sql`userId`)
            .orderBy(desc(sql`lastMessageAt`));

        if (chatUsers.length === 0) return [];

        // Extract valid user IDs
        const userIds = chatUsers.map(c => c.userId).filter(id => id !== null);

        if (userIds.length === 0) return [];

        // Fetch user details for these IDs
        const allUsers = await this.db.select({
            id: users.id,
            name: users.name,
            email: users.email
        }).from(users);

        const numericUserIds = userIds.map(id => Number(id));
        const validUsers = allUsers.filter(u => numericUserIds.includes(Number(u.id)));

        return validUsers.map(user => {
            const match = chatUsers.find(c => Number(c.userId) === Number(user.id));
            return {
                ...user,
                lastMessageAt: match ? match.lastMessageAt : null
            };
        }).sort((a, b) => {
            if (!a.lastMessageAt) return 1;
            if (!b.lastMessageAt) return -1;
            return b.lastMessageAt.getTime() - a.lastMessageAt.getTime();
        });
    }

    async getAdminUser() {
        const adminUsers = await this.db.select({
            id: users.id
        }).from(users).where(eq(users.role, 'admin')).limit(1);

        if (adminUsers.length > 0) {
            return adminUsers[0];
        }
        return null;
    }
}
