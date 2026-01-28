import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { DrizzleModule } from './drizzle/drizzle.module';
import { ProductsModule } from './products/products.module';
import { DbModule } from './db/db.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }),DrizzleModule, AuthModule, ProductsModule,DbModule,ProductsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
