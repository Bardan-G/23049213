import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { DrizzleModule } from '../drizzle/drizzle.module';

@Module({
    imports: [DrizzleModule],
    controllers: [CartController],
    providers: [CartService],
    exports: [CartService],
})
export class CartModule { }
