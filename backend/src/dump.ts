import { drizzle } from 'drizzle-orm/mysql2';
import * as mysql from 'mysql2/promise';
import * as schema from './db/schema';
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
    const connection = await mysql.createConnection(process.env.DATABASE_URL!);
    const db = drizzle(connection, { schema, mode: 'default' });

    const cats = await db.query.categories.findMany();
    const subs = await db.query.subcategories.findMany();
    
    console.log("Categories:", JSON.stringify(cats, null, 2));
    console.log("Subcategories:", JSON.stringify(subs, null, 2));

    await connection.end();
}
main().catch(console.error);
