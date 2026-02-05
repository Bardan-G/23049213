import { Body, Controller, Get, Post } from '@nestjs/common';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    @Post()
    create(@Body() data: { name: string }) {
        return this.categoriesService.create(data);
    }

    @Post('sub')
  createSubcategory(@Body() data: { name: string; categoryId: number }) {
    return this.categoriesService.createSub(data);
  }
    @Get()
    async getCategories() {
        return await this.categoriesService.findAll();
    }
}