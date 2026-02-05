import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ProductsService } from './products.service';
import { products } from 'src/db/schema';

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService:ProductsService){}

    @Get()
    async getProducts(){
        return this.productsService.findAll()
    }

    @Post('add')
    async addProduct(@Body() data:any){
        return this.productsService.create(data)
    } 
    @Get(':id')
    async getOneProduct(@Param('id')id:string){
        console.log("Searching for product with ID:", id);
        return await this.productsService.findOne(Number(id))
    } 
    @Delete(':id')
    async removeProduct(@Param('id')id:string){
        return await this.productsService.remove(Number(id));
    }
}
