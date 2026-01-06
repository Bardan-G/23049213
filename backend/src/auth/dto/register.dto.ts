import { IsNotEmpty, IsOptional } from "class-validator";

export class RegisterDto {

    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    email: string;
    
    @IsOptional()
    phone?: string
    
    @IsNotEmpty()
    password: string;


}