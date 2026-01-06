import { Body, Controller, HttpStatus, Post, UseGuards,Get,Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { dot } from 'node:test/reporters';
import { RegisterDto } from './dto/register.dto';
import { LoginDTO } from './dto/login.dto';
@Controller('auth')
export class AuthController {
    constructor(private authService:AuthService){}

    @Post ('register')
    register(@Body() dto:RegisterDto){
        return this.authService.register (dto);
    }
    

}
