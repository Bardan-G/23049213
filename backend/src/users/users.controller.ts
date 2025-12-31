import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private userService: UsersService){}

    @Get()
    getAllUsers(){
        return this.userService.getUsers();
    }
    @Post()
    addUser(@Body() body:{id: number, name: string}){
        return this.userService.addUser(body.id,body.name);

    };
   
    @Delete(':id')
    deleteUser(@Param('id')id:string){
        return this.userService.deleteUser(Number(id))
    };
   
   
    
}
