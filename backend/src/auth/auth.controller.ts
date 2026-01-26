import { Body, Controller, Get, Post, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: any) {
    return this.authService.register(body.email, body.password, body.name);
  }

  @Post('login')
  async login(@Body() body: any) {
    return this.authService.login(body.email, body.password);
  }

  // PROTECTION TEST: Only accessible with a valid JWT
  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Request() req:any) {
    return req.user; // This is the data from JwtStrategy.validate()
  }
}