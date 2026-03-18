import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { DrizzleModule } from './drizzle/drizzle.module';
import { ProductsModule } from './products/products.module';
import { DbModule } from './db/db.module';
import { CategoriesModule } from './categories/categories.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { AdminModule } from './admin/admin.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), DrizzleModule, AuthModule, ProductsModule, DbModule, CategoriesModule, CartModule, OrdersModule, AdminModule, NotificationsModule, ChatModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
