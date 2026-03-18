import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('users') // Changed from 'user' to 'users' to match frontend
export class UserController {
    constructor(private readonly userService: UserService) { }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('admin')
    @Get('all')
    async getAllUsers() {
        return this.userService.findAll();
    }
}
