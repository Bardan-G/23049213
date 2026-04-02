import { drizzle } from 'drizzle-orm/mysql2';
import * as mysql from 'mysql2/promise';
import * as schema from './db/schema';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
    const connection = await mysql.createConnection(process.env.DATABASE_URL!);
    const db = drizzle(connection, { schema, mode: 'default' });

    console.log("Updating all product 3D models to Generic Chair...");
    const modelUrl = "https://modelviewer.dev/shared-assets/models/Chair.glb";
    
    await db.update(schema.products)
        .set({ model3dUrl: modelUrl });
        
    console.log("Successfully updated all products to use genuine furniture 3D model.");
    await connection.end();
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
