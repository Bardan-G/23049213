import { Inject, Injectable } from '@nestjs/common';
import { MySql2Database } from 'drizzle-orm/mysql2';
import * as schema from '../db/schema';
import { desc } from 'drizzle-orm';

@Injectable()
export class UserService {
    constructor(@Inject('DRIZZLE') private db: MySql2Database<typeof schema>) { }

    async findAll() {
        return await this.db.query.users.findMany({
            columns: {
                id: true,
                name: true,
                email: true,
                role: true,
                // createdAt might not exist in schema based on previous read, let's check schema.ts content again if needed.
                // Re-reading schema.ts: id, name, email, password, role. calculate createdAt if missing?
                // Schema has no createdAt for users in the file I read earlier?
                // Let's check schema.ts content in memory. 
                // Line 4: users table... id, name, email, password, role. NO createdAt.
                // So I will omit createdAt or return null.
            }
        });
    }
}


