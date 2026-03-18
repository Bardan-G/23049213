import { Body, Controller, Delete, Get, Param, Post, UseGuards, Patch, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Get()
    async getProducts(@Query('category') category?: string) {
        return this.productsService.findAll(category)
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('admin')
    @Post('add')
    async addProduct(@Body() data: any) {
        return this.productsService.create(data)
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('admin')
    @Patch(':id')
    async updateProduct(@Param('id') id: string, @Body() data: any) {
        return this.productsService.update(Number(id), data);
    }

    @Get(':id')
    async getOneProduct(@Param('id') id: string) {
        return await this.productsService.findOne(Number(id))
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('admin')
    @Delete(':id')
    async removeProduct(@Param('id') id: string) {
        return await this.productsService.remove(Number(id));
    }
}
