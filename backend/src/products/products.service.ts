import { Inject, Injectable } from '@nestjs/common';
import { MySql2Database } from 'drizzle-orm/mysql2';
import { products, subcategories, categories, productVariants, productImages } from 'src/db/schema'; // Import all 3
import { eq } from 'drizzle-orm';

@Injectable()
export class ProductsService {
    constructor(@Inject('DRIZZLE') private db: MySql2Database) { }

    async create(data: any) {
        // Extract variants, images and model3dUrl to handle separately
        const { variants, images, ...productData } = data;

        // Execute inside transaction to ensure relations only save if product saves
        return await this.db.transaction(async (tx) => {
            const [insertResult] = await tx.insert(products).values(productData);
            const productId = insertResult.insertId;

            if (variants && Array.isArray(variants) && variants.length > 0) {
                const variantsToInsert = variants.map(v => ({
                    ...v,
                    productId: productId
                }));
                await tx.insert(productVariants).values(variantsToInsert);
            }
            if (images && Array.isArray(images) && images.length > 0) {
                const imagesToInsert = images.map(url => ({
                    imageUrl: url,
                    productId: productId
                }));
                await tx.insert(productImages).values(imagesToInsert);
            }
            return { id: productId, ...productData, variants, images };
        });
    }

    async update(id: number, data: any) {
        const { variants, images, ...productData } = data;

        return await this.db.transaction(async (tx) => {
            await tx.update(products).set(productData).where(eq(products.id, id));

            // For simplicity, replace all variants. Delete existing, insert new ones.
            if (variants && Array.isArray(variants)) {
                await tx.delete(productVariants).where(eq(productVariants.productId, id));
                if (variants.length > 0) {
                    const variantsToInsert = variants.map(v => ({
                        ...v,
                        productId: id
                    }));
                    await tx.insert(productVariants).values(variantsToInsert);
                }
            }

            if (images && Array.isArray(images)) {
                await tx.delete(productImages).where(eq(productImages.productId, id));
                if (images.length > 0) {
                    const imagesToInsert = images.map(url => ({
                        imageUrl: url,
                        productId: id
                    }));
                    await tx.insert(productImages).values(imagesToInsert);
                }
            }
            return { message: "Updated successfully" };
        });
    }

    // NEW: Joins products -> subcategories -> categories
    async findAll(category?: string) {
        // We must query variants separately or use aggregate/includes since standard joins duplicate rows
        // With Drizzle query builder it's cleaner to fetch products, then variants, and map them if not using query API.

        const productsList = await this.db
            .select({
                id: products.id,
                name: products.name,
                description: products.description,
                price: products.price,
                stock: products.stock,
                imageUrl: products.imageUrl,
                model3dUrl: products.model3dUrl,
                subcategory: subcategories.name, // Get name instead of ID
                category: categories.name,       // Get parent category name
            })
            .from(products)
            .leftJoin(subcategories, eq(products.subcategoryId, subcategories.id))
            .leftJoin(categories, eq(subcategories.categoryId, categories.id))
            .where(category ? eq(categories.name, category) : undefined);

        // Fetch all variants for these products
        const productIds = productsList.map(p => p.id);
        const variantsList = productIds.length > 0
            ? await this.db.select().from(productVariants)
            : [];

        // Fetch all images for these products
        const imagesList = productIds.length > 0
            ? await this.db.select().from(productImages)
            : [];

        // Map variants and images to products
        return productsList.map(p => ({
            ...p,
            variants: variantsList.filter(v => v.productId === p.id),
            images: imagesList.filter(i => i.productId === p.id)
        }));
    }

    async findOne(id: number) {
        const result = await this.db
            .select({
                id: products.id,
                name: products.name,
                description: products.description,
                price: products.price,
                stock: products.stock,
                imageUrl: products.imageUrl,
                model3dUrl: products.model3dUrl,
                subcategory: subcategories.name,
                category: categories.name,
                subcategoryId: products.subcategoryId, // Useful for editing
                categoryId: subcategories.categoryId,
            })
            .from(products)
            .leftJoin(subcategories, eq(products.subcategoryId, subcategories.id))
            .leftJoin(categories, eq(subcategories.categoryId, categories.id))
            .where(eq(products.id, id));

        if (!result.length) return null;

        const variants = await this.db.select().from(productVariants).where(eq(productVariants.productId, id));
        const images = await this.db.select().from(productImages).where(eq(productImages.productId, id));

        return {
            ...result[0],
            variants,
            images
        };
    }

    async remove(id: number) {
        return await this.db.delete(products).where(eq(products.id, id));
    }
}