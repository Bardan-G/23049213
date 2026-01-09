import { BadRequestException, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "src/users/users.service";
import { RegisterDTO } from "./dto/register.dto";
import { ExceptionsHandler } from "@nestjs/core/exceptions/exceptions-handler";
import * as bcrypt from 'bcrypt';
import { LoginDTO } from "./dto/login.dto";
import { identity } from "rxjs";
import { plainToClass } from "class-transformer";
@Injectable ()
export class AuthService {
    constructor(
        private usersService:UsersService,
        private jwtService:JwtService
    ){}

    async registerUser(dto:RegisterDTO){
        if(!dto.email && !dto.phonenumber)
            throw new BadRequestException ("Email or Phonenumber is required!")
        const identifier =(dto.email || dto.phonenumber)!;

        const existing = this.usersService.findUserByEmailorNumber(
            identifier
        )
        if(existing){throw new BadRequestException ("User already exists")}

        const hasedPassword = await bcrypt.hash(dto.password,10);

        const user = this.usersService.createUser({
            name:dto.name,
            email:dto.email,
            phonenumber:dto.phonenumber,
            password:hasedPassword,
            role:"Customer"
        });
        return{message:"Register Sucessully",UserId:user.id}
    }

    async loginUser(dto:LoginDTO){
        const user = this.usersService.findUserByEmailorNumber(dto.identifier);
        if(!user){throw new BadRequestException("User not found")}

        const isMatch = await bcrypt.compare(dto.password,user.password)
        if(!isMatch){throw new BadRequestException("Password doesn't mathed")}

        const payload = {sub:user.id,role:user.role}

        return{
            accessToken:this.jwtService.sign(payload)
        }
    }
    
}
