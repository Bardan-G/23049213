import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { createDecipheriv } from 'crypto';

@Injectable()
export class ProductService {
    constructor(private prismaService : PrismaService ) {}

    //Create Product

    async CreateProduct(dto:CreateProductDto){
        return this.prismaService.product.create({ 
            data: {
                name: dto.name,
                slug: dto.slug,
                description: dto.description,
                price: dto.price,
                discountPrice: dto.discountPrice,
                stock: dto.stock,
            }
         });
    }

    //Get All Products

    async GetAllProducts(){
        return this.prismaService.product.findMany({
            where:{
                isActive: true
            },
            OrderBy:{
                createAt: 'desc'
            }
        });
    }

    //Get Single Product by Slug

    async GetProductBySlug(slug:string){
        return this.prismaService.product.findUnique({
            where:{slug}
        });
    }
}
