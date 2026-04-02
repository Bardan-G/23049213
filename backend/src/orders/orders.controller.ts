import { Body, Controller, Get, Post, Req, Res, UseGuards, Patch, Param } from '@nestjs/common';
import type { Response } from 'express';
import { OrdersService } from './orders.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    async placeOrder(@Req() req: any, @Body() body: any) {
        return this.ordersService.createOrder(req.user.userId, body);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('verify-khalti')
    async verifyKhalti(@Req() req: any, @Body() body: { orderId: number, payload: any }) {
        return this.ordersService.verifyKhaltiPayment(req.user.userId, body.orderId, body.payload);
    }

    // Removed AuthGuard so that eSewa callbacks (which lack session JWTs) are not rejected with 401
    @Post('verify-esewa')
    async verifyEsewa(@Body() body: { data: string }) {
        // esewa verification can be called from frontend without auth because data is signed
        return this.ordersService.verifyEsewaPayment(body.data);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get()
    async getOrders(@Req() req: any) {
        return this.ordersService.getUserOrders(req.user.userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get(':id/invoice')
    async getInvoice(@Req() req: any, @Param('id') id: string, @Res() res: Response) {
        return this.ordersService.generateInvoice(Number(id), req.user.userId, res);
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('admin')
    @Get('all')
    async getAllOrders() {
        return this.ordersService.getAllOrders();
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('admin')
    @Patch(':id/status')
    async updateStatus(@Param('id') id: string, @Body('status') status: string) {
        return this.ordersService.updateOrderStatus(Number(id), status);
    }
}
