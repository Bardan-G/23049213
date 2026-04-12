import { drizzle } from 'drizzle-orm/mysql2';
import * as mysql from 'mysql2/promise';
import * as schema from './db/schema';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { eq } from 'drizzle-orm';

dotenv.config();

async function main() {
    const connection = await mysql.createConnection(process.env.DATABASE_URL!);
    const db = drizzle(connection, { schema, mode: 'default' });

    // You can change this email or pass it as an argument
    const targetEmail = process.argv[2] || 'grihalaxmifurniture6@gmail.com';
    const rawPassword = process.argv[3] || 'admin123';
    
    console.log(`Checking for user ${targetEmail}...`);

    const existingUser = await db.query.users.findFirst({
        where: eq(schema.users.email, targetEmail),
    });

    if (!existingUser) {
        console.log('User not found. Creating as Admin...');
        const hashedPassword = await bcrypt.hash(rawPassword, 10);
        await db.insert(schema.users).values({
            name: 'Admin User',
            email: targetEmail,
            password: hashedPassword,
            role: 'admin',
        });
        console.log(`Admin user created successfully!`);
        console.log(`Email: ${targetEmail}`);
        console.log(`Password: ${rawPassword}`);
    } else {
        console.log(`User found. Current role: ${existingUser.role}`);
        if (existingUser.role !== 'admin') {
            console.log('Promoting user to admin...');
            await db.update(schema.users)
                .set({ role: 'admin' })
                .where(eq(schema.users.email, targetEmail));
            console.log('User promoted to admin.');
        } else {
            console.log('User is already an admin.');
            console.log(`If you want to reset password or need a new admin, run with: npm run seed:admin <email> <password>`)
        }
    }

    await connection.end();
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
