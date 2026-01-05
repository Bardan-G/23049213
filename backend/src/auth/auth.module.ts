import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { JwtStrategy } from './jwt_strategy';

@Module({
  imports:[
    JwtModule.register({
      secret:'secretKey',
      signOptions:{expiresIn:'1h'}
    })
  ],
  controllers: [AuthController],
  providers: [AuthService,UsersService,JwtStrategy]
})
export class AuthModule {}
