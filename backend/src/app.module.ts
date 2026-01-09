import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import {  AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersService } from './users/users.service';
import { PrismaModule } from './prisma/prisma.module';
import { ProductService } from './product/product.service';
import { ProductController } from './product/product.controller';
import { ProductModule } from './product/product.module';

@Module({
  imports: [ AuthModule , PrismaModule, ProductModule,ConfigModule.forRoot()],
  controllers: [AppController, ProductController],
  providers: [AppService, UsersService, ProductService],
})
export class AppModule {}
