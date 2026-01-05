import { Body, Controller, HttpStatus, Post, UseGuards,Get,Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { dot } from 'node:test/reporters';
import { RegisterDTO } from './dto/register.dto';
import { LoginDTO } from './dto/login.dto';
@Controller('auth')
export class AuthController {
    constructor(private authService:AuthService){}

    @Post('register')
    register(@Body()dto:RegisterDTO){
        return this.authService.registerUser(dto)
    }

    @Post('login')
    login(@Body()dto:LoginDTO){
        return this.authService.loginUser(dto)
    }
    

}
