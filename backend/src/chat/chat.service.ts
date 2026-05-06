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
        try {
            // Fetch users to find admins
            const adminUsers = await this.db.select({ id: users.id }).from(users).where(eq(users.role, 'admin'));
            const adminIds = adminUsers.map(a => Number(a.id)).filter(id => !isNaN(id) && id > 0);
            if (adminIds.length === 0) return [];

            // Fetch all messages involving admins to group them by the other user
            const allAdminMessages = await this.db.select({
                senderId: messages.senderId,
                receiverId: messages.receiverId,
                createdAt: messages.createdAt
            }).from(messages)
            .where(or(
                inArray(messages.senderId, adminIds),
                inArray(messages.receiverId, adminIds)
            ));

            const userLastMessageMap = new Map<number, Date>();

            for (const msg of allAdminMessages) {
                const sender = Number(msg.senderId);
                const receiver = Number(msg.receiverId);
                
                // The customer is whichever one is NOT an admin.
                // If both are admins (rare), we can skip or track.
                let customerId = -1;
                if (adminIds.includes(sender) && !adminIds.includes(receiver)) {
                    customerId = receiver;
                } else if (!adminIds.includes(sender) && adminIds.includes(receiver)) {
                    customerId = sender;
                }

                if (customerId > 0) { // Safely ensure valid customer ID
                    const existingDate = userLastMessageMap.get(customerId);
                    const msgDate = new Date(msg.createdAt || new Date());
                    if (!existingDate || msgDate > existingDate) {
                        userLastMessageMap.set(customerId, msgDate);
                    }
                }
            }

            // Ensure we don't query with invalid IDs or empty arrays
            const userIds = Array.from(userLastMessageMap.keys()).filter(id => !isNaN(id) && id > 0);
            if (userIds.length === 0) return [];

            // Fetch user details
            const validUsers = await this.db.select({
                id: users.id,
                name: users.name,
                email: users.email
            }).from(users).where(inArray(users.id, userIds));

            return validUsers.map(user => {
                return {
                    ...user,
                    lastMessageAt: userLastMessageMap.get(Number(user.id)) || null
                };
            }).sort((a, b) => {
                if (!a.lastMessageAt) return 1;
                if (!b.lastMessageAt) return -1;
                return b.lastMessageAt.getTime() - a.lastMessageAt.getTime();
            });
        } catch (error) {
            console.error('getActiveChats error:', error);
            // Return empty list gracefully instead of crashing with 500
            return [];
        }
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
