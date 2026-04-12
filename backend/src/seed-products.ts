import { drizzle } from 'drizzle-orm/mysql2';
import * as mysql from 'mysql2/promise';
import * as schema from './db/schema';
import * as dotenv from 'dotenv';
import { eq } from 'drizzle-orm';
dotenv.config();

async function main() {
    console.log("Connecting to the live database...");
    const connection = await mysql.createConnection(process.env.DATABASE_URL!);
    const db = drizzle(connection, { schema, mode: 'default' });

    console.log("Creating Premium Categories...");
    const categoriesToInsert = ['Living Room', 'Dining', 'Kitchen', 'Office', 'Outdoor'];
    const catMap = new Map();
    for (const name of categoriesToInsert) {
        let cat = await db.query.categories.findFirst({ where: eq(schema.categories.name, name) });
        if (!cat) {
            const [res] = await db.insert(schema.categories).values({ name });
            catMap.set(name, res.insertId);
        } else {
            catMap.set(name, cat.id);
        }
    }

    console.log("Creating Premium Subcategories...");
    const subcats = [
        { name: 'Chairs', category: 'Dining' },
        { name: 'Sofas', category: 'Living Room' },
        { name: 'Stools', category: 'Kitchen' },
        { name: 'Chairs', category: 'Office' },
        { name: 'Chairs', category: 'Outdoor' }
    ];
    
    const subcatMap = new Map();
    for (const sub of subcats) {
        const catId = catMap.get(sub.category);
        let subcat = await db.query.subcategories.findFirst({
             where: (s, { and, eq }) => and(eq(s.name, sub.name), eq(s.categoryId, catId)) 
        });
        
        if (!subcat) {
            const [res] = await db.insert(schema.subcategories).values({ name: sub.name, categoryId: catId });
            subcatMap.set(`${sub.category}-${sub.name}`, res.insertId);
        } else {
            subcatMap.set(`${sub.category}-${sub.name}`, subcat.id);
        }
    }

    console.log("Inserting 7 Genuine 3D Furniture Products...");
    
    const products = [
        {
            name: "Nordic Oak Dining Chair",
            description: "A minimalist Nordic dining chair crafted from sustainable oak wood.",
            price: "12500.00",
            stock: 15,
            subcatKey: "Dining-Chairs",
            model3dUrl: "https://modelviewer.dev/shared-assets/models/Chair.glb",
            imageUrl: "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=500&q=80"
        },
        {
            name: "Velvet Lounge Sheen Chair",
            description: "Luxurious velvet lounge chair featuring a reflective sheen and ergonomic curve.",
            price: "25000.00",
            stock: 8,
            subcatKey: "Living Room-Chairs", // Note: Need Living Room-Chairs
            model3dUrl: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/SheenChair/glTF-Binary/SheenChair.glb",
            imageUrl: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=500&q=80"
        },
        {
            name: "Minimalist Wood Stool",
            description: "A solid wood stool perfect for kitchen islands and breakfast bars.",
            price: "8500.00",
            stock: 20,
            subcatKey: "Kitchen-Stools",
            model3dUrl: "https://modelviewer.dev/shared-assets/models/Chair.glb",
            imageUrl: "https://images.unsplash.com/photo-1503602642458-232111445657?w=500&q=80"
        },
        {
            name: "Ergonomic Lumbar Office Chair",
            description: "Advanced ergonomic office chair for sustained daily comfort and productivity.",
            price: "32000.00",
            stock: 12,
            subcatKey: "Office-Chairs",
            model3dUrl: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/SheenChair/glTF-Binary/SheenChair.glb",
            imageUrl: "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=500&q=80"
        },
        {
            name: "Modern Accent Armchair",
            description: "A statement piece armchair bringing contemporary design to any living space.",
            price: "41000.00",
            stock: 5,
            subcatKey: "Living Room-Sofas",
            model3dUrl: "https://modelviewer.dev/shared-assets/models/Chair.glb",
            imageUrl: "https://images.unsplash.com/photo-1540574163026-643ea2071304?w=500&q=80"
        },
        {
            name: "Rattan Outdoor Patio Chair",
            description: "Weather-resistant rattan chair with plush waterproof cushions.",
            price: "19000.00",
            stock: 10,
            subcatKey: "Outdoor-Chairs",
            model3dUrl: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/SheenChair/glTF-Binary/SheenChair.glb",
            imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&q=80"
        },
        {
            name: "Executive Leather Conference Chair",
            description: "Premium leather executive chair designed for boardrooms and executive suites.",
            price: "50000.00",
            stock: 3,
            subcatKey: "Office-Chairs",
            model3dUrl: "https://modelviewer.dev/shared-assets/models/Chair.glb",
            imageUrl: "https://images.unsplash.com/photo-1505693314120-0d443867891c?w=500&q=80"
        }
    ];

    // Ensure Living Room-Chairs exists
    let lrCatId = catMap.get('Living Room');
    let lrChair = await db.query.subcategories.findFirst({
        where: (s, { and, eq }) => and(eq(s.name, 'Chairs'), eq(s.categoryId, lrCatId))
    });
    if (!lrChair) {
        const [res] = await db.insert(schema.subcategories).values({ name: 'Chairs', categoryId: lrCatId });
        subcatMap.set('Living Room-Chairs', res.insertId);
    } else {
        subcatMap.set('Living Room-Chairs', lrChair.id);
    }

    for (const p of products) {
        const subId = subcatMap.get(p.subcatKey);
        await db.insert(schema.products).values({
            name: p.name,
            description: p.description,
            price: p.price,
            stock: p.stock,
            subcategoryId: subId,
            imageUrl: p.imageUrl,
            model3dUrl: p.model3dUrl,
            status: 'active'
        });
        console.log(`Inserted: ${p.name}`);
    }

    console.log("Successfully seeded 7 realistic 3D products!");
    await connection.end();
}

main().catch(console.error);
