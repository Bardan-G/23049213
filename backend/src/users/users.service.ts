import { Injectable } from '@nestjs/common';

export type User = any;
@Injectable()
export class UsersService {
    private readonly users = [
        {
            UserId:1,
            username: 'Bardan G Neupane',
            password: 'test123'
        },
        {
            UserId:2,
            username: 'Ashish',
            password: 'test123'
        },
        {
            UserId:3,
            username: 'Saurab',
            password: 'test123'
        },
    ];
    async findOne(username:string): Promise<User | undefined>{
        return this.users.find(user=> user.username === username);
    }
}
