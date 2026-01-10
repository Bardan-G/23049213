import { IsNumber, IsOptional, IsPositive, IsString } from "class-validator";

export class CreateProductDto {

    @IsString()
    name: string;

    @IsString()
    slug: string;
    
    @IsOptional()
    @IsString()
    description: string;

    @IsNumber()
    @IsPositive()
    price: number;

    @IsOptional()
    @IsNumber()
    discountPrice : number;

    @IsNumber()
    stock : number;

    categoryId: number;
    imageUrl: string;
}