import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';


@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    findByEmail(email: string) {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }

    findByPhone(phone: string) {
        return this.prisma.user.findUnique({
            where: { phone }
        })

    }

    createUser(data: { name:string; email?: string; phone?: string; password: string }) {
        return this.prisma.user.create({
            data,
        });
    }


}
