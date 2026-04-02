import { drizzle } from 'drizzle-orm/mysql2';
import * as mysql from 'mysql2/promise';
import * as schema from './db/schema';
import * as dotenv from 'dotenv';
import { eq } from 'drizzle-orm';

dotenv.config();

async function main() {
    const connection = await mysql.createConnection(process.env.DATABASE_URL!);
    const db = drizzle(connection, { schema, mode: 'default' });

    console.log("Fetching all products to update 3D models...");

    const productsList = await db.query.products.findMany();

    for (const p of productsList) {
        // We will assign a fallback modelviewer model if it's missing or if we want to ensure all have one.
        // In a real scenario, these would be precise GLBs for each product type.
        let modelUrl = "https://modelviewer.dev/shared-assets/models/shiba.glb";
        const n = p.name.toLowerCase();

        if (n.includes('chair') || n.includes('sofa') || n.includes('sectional')) {
             // For seating, we'll use one model
             modelUrl = "https://modelviewer.dev/shared-assets/models/shiba.glb";
        } else if (n.includes('table') || n.includes('bookshelf') || n.includes('bed')) {
             // For hard furniture, we'll use another model
             modelUrl = "https://modelviewer.dev/shared-assets/models/Astronaut.glb";
        }

        console.log(`Updating ${p.name} with ${modelUrl}`);
        await db.update(schema.products)
            .set({ model3dUrl: modelUrl })
            .where(eq(schema.products.id, p.id));
    }

    console.log("3D models seeded successfully!");
    await connection.end();
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
