import { Inject, Injectable } from "@nestjs/common";
import { MySql2Database } from "drizzle-orm/mysql2";
import { categories, subcategories } from "src/db/schema";

@Injectable()
export class CategoriesService {
    constructor(@Inject('DRIZZLE') private db: MySql2Database) {}

    // Add a Category
    async create(data: { name: string }) {
        return await this.db.insert(categories).values({
            name: data.name
        });
    }

    // Add a Subcategory
    async createSub(data: { name: string; categoryId: number }) {
        return await this.db.insert(subcategories).values({
            name: data.name,
            categoryId: data.categoryId
        });
    }

    async findAll() {
        const allCategories = await this.db.select().from(categories);
        const allSubcategories = await this.db.select().from(subcategories);

        return allCategories.map(cat => ({
            ...cat,
            subcategories: allSubcategories.filter(sub => sub.categoryId === cat.id)
        }));
    }
}