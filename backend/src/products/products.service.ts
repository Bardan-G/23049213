import { Inject, Injectable } from '@nestjs/common';
import { MySql2Database } from 'drizzle-orm/mysql2';
import { products, subcategories, categories } from 'src/db/schema'; // Import all 3
import { eq } from 'drizzle-orm';

@Injectable()
export class ProductsService {
    constructor(@Inject('DRIZZLE_CONNECTION') private db: MySql2Database) {}

    async create(data: any) {
        return await this.db.insert(products).values(data);
    }

    // NEW: Joins products -> subcategories -> categories
    async findAll() {
        return await this.db
            .select({
                id: products.id,
                name: products.name,
                description: products.description,
                price: products.price,
                stock: products.stock,
                imageUrl: products.imageUrl,
                subcategory: subcategories.name, // Get name instead of ID
                category: categories.name,       // Get parent category name
            })
            .from(products)
            .leftJoin(subcategories, eq(products.subcategoryId, subcategories.id))
            .leftJoin(categories, eq(subcategories.categoryId, categories.id));
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
                subcategory: subcategories.name,
                category: categories.name,
                subcategoryId: products.subcategoryId, // Useful for editing
            })
            .from(products)
            .leftJoin(subcategories, eq(products.subcategoryId, subcategories.id))
            .leftJoin(categories, eq(subcategories.categoryId, categories.id))
            .where(eq(products.id, id));
            
        return result[0];
    }

    async remove(id: number) {
        return await this.db.delete(products).where(eq(products.id, id));
    }
}