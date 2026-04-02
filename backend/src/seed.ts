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

    // Target User
    const targetEmail = 'grihalaxmifurniture6@gmail.com';
    console.log(`Checking for user ${targetEmail}...`);

    const existingUser = await db.query.users.findFirst({
        where: eq(schema.users.email, targetEmail),
    });

    if (!existingUser) {
        console.log('User not found. Creating as Admin...');
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await db.insert(schema.users).values({
            name: 'Grihalaxmi Admin',
            email: targetEmail,
            password: hashedPassword,
            role: 'admin',
        });
        console.log('Admin user created successfully.');
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
        }
    }

    // Create basic categories
    console.log("Creating categories and subcategories...");
    await db.delete(schema.productVariants);
    await db.delete(schema.products);
    await db.delete(schema.subcategories);
    await db.delete(schema.categories);

    // 1. Living Room
    const [catLivingResult] = await db.insert(schema.categories).values({ name: 'Living Room' });
    const livingId = catLivingResult.insertId;
    // 2. Bedroom
    const [catBedResult] = await db.insert(schema.categories).values({ name: 'Bedroom' });
    const bedId = catBedResult.insertId;

    const [subSofaRes] = await db.insert(schema.subcategories).values({ name: 'Sofas', categoryId: livingId });
    const [subTableRes] = await db.insert(schema.subcategories).values({ name: 'Coffee Tables', categoryId: livingId });
    const [subBedRes] = await db.insert(schema.subcategories).values({ name: 'Beds', categoryId: bedId });
    const [subChairRes] = await db.insert(schema.subcategories).values({ name: 'Chairs', categoryId: livingId });

    const sofaId = subSofaRes.insertId;
    const tableId = subTableRes.insertId;
    const bedSubId = subBedRes.insertId;
    const chairId = subChairRes.insertId;

    console.log("Seeding 10 Products with Colors & 3D Models...");

    const seedProducts = [
        {
            name: "Modern Velvet Sofa",
            description: "A gorgeous 3-seater sofa perfect for modern living spaces.",
            price: '899.99',
            stock: 20,
            imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800",
            model3dUrl: "https://modelviewer.dev/shared-assets/models/Chair.glb", // using safe demo models
            subcategoryId: sofaId,
            variants: [
                { colorName: "Emerald Green", colorHex: "#2E8B57", imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800" },
                { colorName: "Midnight Blue", colorHex: "#191970", imageUrl: "https://images.unsplash.com/photo-1550226891-ef816aed4a98?auto=format&fit=crop&w=800" },
            ]
        },
        {
            name: "Minimalist Coffee Table",
            description: "Sleek wooden coffee table with a glass top.",
            price: '249.50',
            stock: 15,
            imageUrl: "https://images.unsplash.com/photo-1532372320572-cda25653a26d?auto=format&fit=crop&w=800",
            model3dUrl: null,
            subcategoryId: tableId,
            variants: [
                { colorName: "Oak Wood", colorHex: "#8B5A2B", imageUrl: "https://images.unsplash.com/photo-1532372320572-cda25653a26d?auto=format&fit=crop&w=800" },
                { colorName: "Walnut", colorHex: "#3E2723", imageUrl: "https://images.unsplash.com/photo-1499933374294-4584851497cc?auto=format&fit=crop&w=800" },
            ]
        },
        {
            name: "Ergonomic Office Chair",
            description: "Comfortable desk chair with lumbar support.",
            price: '199.99',
            stock: 50,
            imageUrl: "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&w=800",
            model3dUrl: "https://modelviewer.dev/shared-assets/models/Chair.glb",
            subcategoryId: chairId,
            variants: [
                { colorName: "Charcoal Black", colorHex: "#1A1A1A", imageUrl: "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&w=800" },
                { colorName: "Cloud White", colorHex: "#F5F5F5", imageUrl: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=800" },
            ]
        },
        {
            name: "King Size Poster Bed",
            description: "Luxurious four-poster bed frame.",
            price: '1299.00',
            stock: 5,
            imageUrl: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800",
            model3dUrl: null,
            subcategoryId: bedSubId,
            variants: [
                { colorName: "Cherry Wood", colorHex: "#5E2C04", imageUrl: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800" }
            ]
        },
        {
            name: "Geometric Bookshelf",
            description: "Abstract 5-tier bookshelf for modern homes.",
            price: '349.00',
            stock: 12,
            imageUrl: "https://images.unsplash.com/photo-1594620302200-9a762244a156?auto=format&fit=crop&w=800",
            model3dUrl: "https://modelviewer.dev/shared-assets/models/Chair.glb",
            subcategoryId: tableId,
            variants: [
                { colorName: "Matte Black", colorHex: "#000000", imageUrl: "https://images.unsplash.com/photo-1594620302200-9a762244a156?auto=format&fit=crop&w=800" },
                { colorName: "Gold Trim", colorHex: "#D4AF37", imageUrl: "https://images.unsplash.com/photo-1544457070-4cd773b4d71e?auto=format&fit=crop&w=800" }
            ]
        },
        {
            name: "Cloud Sectional",
            description: "Ultra-plush L-shaped sectional sofa.",
            price: '1599.99',
            stock: 8,
            imageUrl: "https://images.unsplash.com/photo-1540574163026-643ea20ade25?auto=format&fit=crop&w=800",
            model3dUrl: null,
            subcategoryId: sofaId,
            variants: [
                { colorName: "Ivory", colorHex: "#FFFFF0", imageUrl: "https://images.unsplash.com/photo-1540574163026-643ea20ade25?auto=format&fit=crop&w=800" }
            ]
        },
        {
            name: "Industrial Dining Chair",
            description: "Metal and rustic wood dining chair set of 2.",
            price: '149.00',
            stock: 30,
            imageUrl: "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=800",
            model3dUrl: null,
            subcategoryId: chairId,
            variants: [
                { colorName: "Gunmetal", colorHex: "#2a3439", imageUrl: "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=800" }
            ]
        },
        {
            name: "Classic Leather Armchair",
            description: "Vintage tufted leather armchair.",
            price: '599.00',
            stock: 7,
            imageUrl: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=800",
            model3dUrl: "https://modelviewer.dev/shared-assets/models/Chair.glb",
            subcategoryId: chairId,
            variants: [
                { colorName: "Cognac Brown", colorHex: "#9A4621", imageUrl: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=800" },
                { colorName: "Onyx Black", colorHex: "#0F0F0F", imageUrl: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=800" }
            ]
        },
        {
            name: "Floating Bed Frame",
            description: "Contemporary bed frame with LED underlighting.",
            price: '899.00',
            stock: 10,
            imageUrl: "https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&w=800",
            model3dUrl: null,
            subcategoryId: bedSubId,
            variants: []
        },
        {
            name: "Glass End Table",
            description: "Round glass side table with chrome legs.",
            price: '129.99',
            stock: 25,
            imageUrl: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=800",
            model3dUrl: "https://modelviewer.dev/shared-assets/models/Chair.glb",
            subcategoryId: tableId,
            variants: [
                { colorName: "Chrome", colorHex: "#E8E8E8", imageUrl: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=800" },
                { colorName: "Brass", colorHex: "#B5A642", imageUrl: "https://images.unsplash.com/photo-1532372320572-cda25653a26d?auto=format&fit=crop&w=800" }
            ]
        }
    ];

    for (const p of seedProducts) {
        const { variants, ...prodData } = p;
        const [insertedProduct] = await db.insert(schema.products).values(prodData as any);

        if (variants && variants.length > 0) {
            const variantsToInsert = variants.map(v => ({
                productId: insertedProduct.insertId,
                colorName: v.colorName,
                colorHex: v.colorHex,
                imageUrl: v.imageUrl
            }));
            await db.insert(schema.productVariants).values(variantsToInsert);
        }
    }
    console.log("Seeding complete!");

    await connection.end();
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});