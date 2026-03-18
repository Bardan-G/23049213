import { Body, Controller, Delete, Get, Post, Req, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('cart')
export class CartController {
    constructor(private readonly cartService: CartService) { }

    @UseGuards(AuthGuard('jwt'))
    @Post('sync')
    async syncCart(@Req() req: any, @Body() body: { items: { productId: number; quantity: number }[] }) {
        return this.cartService.syncCart(req.user.userId, body.items);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get()
    async getCart(@Req() req: any) {
        return this.cartService.getCart(req.user.userId);
    }
}
