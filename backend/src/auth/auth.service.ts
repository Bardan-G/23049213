import { BadRequestException, Injectable } from "@nestjs/common";
import { UsersService } from "src/users/users.service";
import { RegisterDto } from "./dto/register.dto";
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private usersService : UsersService){}

  // Authentication logic will be implemented here
  // Register new user
  async register(dto:RegisterDto){
    const {name, email, phone, password} = dto;

    if(!email && !phone){
        throw new BadRequestException ('Email or phone number is required');
    }

    if(email){
        const existingEmail = await this.usersService.findByEmail(email);
        if(existingEmail){
            throw new BadRequestException('Email already exists');
        }
    }

    if(phone){
        const existingPhone = await this.usersService.findByPhone(phone);
        if(existingPhone){
            throw new BadRequestException('Phone number already exists');
        }
    }

    const hasedPassword = await bcrypt.hash(password, 10);

    const user = await this.usersService.createUser({
        name,
        email,
        phone,
        password: hasedPassword,
    });
    return {
        message: 'User registered successfully',
        userId : user.id,
    }

  }


    
}