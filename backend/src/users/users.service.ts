import { Injectable } from '@nestjs/common';
import { dot } from 'node:test/reporters';

export class User {
    id:number;
    name:string;
    email?:string;
    phonenumber?:string;
    password:string;
    role:"Customer" | "Admin"
}

@Injectable()
export class UsersService {
    // constructor(private prisma :PrismaServices){}
    private users : User[]=[];
    private id = 1;
    prisma: any;


    createUser(user:Omit<User,'id'>){
        const newUser= {...user,id: this.id++};
        this.users.push(newUser);
        return newUser;
    };

    findUserByEmailorNumber(identifier:string){
        return this.users.find(u => u.email === identifier || u.phonenumber === identifier,);
    };

    findById( id : number){
        return this.users.find(u=> u.id === id)
    };

    async updateProfile(userId:number, address:string){
        return this.prisma.user.update({
            where: {id: userId},
            data: dot,
            select:{
                id: true,
                name: true,
                email: true,
                phonenumber: true,
                address: true,
            }
        });
    }

}
