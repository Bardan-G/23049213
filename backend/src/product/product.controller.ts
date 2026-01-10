import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';

@Controller('product')
export class ProductController {
    constructor(private prodcutService : ProductService) {}

    @Get()
    async getAllProducts() {
        return this.prodcutService.GetAllProducts();
    }
    
    @Get(':slug')
    async getProductBySlug(@Param('slug') slug: string) {
        return this.prodcutService.GetProductBySlug(slug);
    }

    @Post()
    async createProduct(@Body() dto:CreateProductDto) {
        return this.prodcutService.CreateProduct(dto);
    }
}
