import { drizzle } from 'drizzle-orm/mysql2';
import * as mysql from 'mysql2/promise';
import * as schema from './db/schema';
import * as dotenv from 'dotenv';
import { eq } from 'drizzle-orm';

dotenv.config();

async function main() {
    const connection = await mysql.createConnection(process.env.DATABASE_URL!);
    const db = drizzle(connection, { schema, mode: 'default' });

    const targetEmail = 'grihalaxmifurniture6@gmail.com';
    console.log(`Checking for user ${targetEmail}...`);

    const user = await db.query.users.findFirst({
        where: eq(schema.users.email, targetEmail),
    });

    if (user) {
        console.log(`User found: ID=${user.id}, Name="${user.name}", Role=${user.role}`);

        let updates: any = {};
        if (user.role !== 'admin') {
            console.log('Role is not admin. Queuing update...');
            updates.role = 'admin';
        }

        // User asked to "add username", assuming they might want a specific name or just ensuring it exists.
        // If name is null or looks like a placeholder, we could update it, but let's stick to ensuring admin first.
        // If the user wants to change the name, we can do that too. Let's set a proper admin name if it's generic.
        if (!user.name) {
            console.log('Name is missing. Queuing update...');
            updates.name = 'Grihalaxmi Admin';
        }

        if (Object.keys(updates).length > 0) {
            await db.update(schema.users)
                .set(updates)
                .where(eq(schema.users.email, targetEmail));
            console.log('User updated successfully.');
            const updatedUser = await db.query.users.findFirst({ where: eq(schema.users.email, targetEmail) });
            console.log(`New Status: Name="${updatedUser?.name}", Role=${updatedUser?.role}`);
        } else {
            console.log('User is already correctly configured.');
        }

    } else {
        console.log('User NOT found in database. They need to register first, or I can create them now.');
    }

    await connection.end();
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
