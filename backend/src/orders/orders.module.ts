import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { DrizzleModule } from '../drizzle/drizzle.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
    imports: [DrizzleModule, NotificationsModule],
    controllers: [OrdersController],
    providers: [OrdersService],
})
export class OrdersModule { }
