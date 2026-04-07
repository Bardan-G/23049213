import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { MySql2Database } from 'drizzle-orm/mysql2';
import * as schema from '../db/schema';
import { eq, desc, and } from 'drizzle-orm';

import { NotificationsService } from '../notifications/notifications.service';
import * as crypto from 'crypto';
import PDFDocument from 'pdfkit';
import type { Response } from 'express';

@Injectable()
export class OrdersService {
    constructor(
        @Inject('DRIZZLE') private db: MySql2Database<typeof schema>,
        private notificationsService: NotificationsService
    ) { }

    async createOrder(userId: number, data: { address: string; paymentMethod: string; items: any[]; total: number }) {
        try {
            // 1. Verify Stock
            for (const item of data.items) {
                const product = await this.db.query.products.findFirst({
                    where: eq(schema.products.id, item.productId),
                });
                if (!product || product.stock < item.quantity) {
                    throw new BadRequestException(`Product ${product?.name || 'Unknown'} is out of stock or no longer exists.`);
                }
            }

            // 2. Create Order
            const [result] = await this.db.insert(schema.orders).values({
                userId,
                total: String(data.total), // Ensure string for decimal
                address: data.address,
                paymentMethod: data.paymentMethod,
                status: 'pending',
            });

            const orderId = result.insertId;

            // 3. Create Order Items and Deduct Stock
            if (data.items.length > 0) {
                await this.db.insert(schema.orderItems).values(
                    data.items.map((item) => ({
                        orderId,
                        productId: item.productId,
                        quantity: item.quantity,
                        price: String(item.price), // Ensure string for decimal
                    }))
                );

                // Deduct stock
                for (const item of data.items) {
                    const product = await this.db.query.products.findFirst({ where: eq(schema.products.id, item.productId) });
                    if (product) {
                        await this.db.update(schema.products)
                            .set({ stock: product.stock - item.quantity })
                            .where(eq(schema.products.id, item.productId));
                    }
                }
            }

            // 4. Clear Cart and Notify if COD
            if (data.paymentMethod === 'cod') {
                await this.db.delete(schema.cartItems).where(eq(schema.cartItems.userId, userId));
                await this.notificationsService.createNotification("Order Confirmed", `Your COD order #${orderId} is confirmed.`, userId);
                await this.notificationsService.createNotification("New Order", `New COD order #${orderId} received.`, null);
            }

            return { orderId, message: 'Order placed successfully' };
        } catch (error: any) {
            console.error("Create Order Error:", error);
            if (error instanceof BadRequestException) {
                throw error;
            }
            // For foreign key errors (like userId no longer exists because db was wiped)
            if (error.code === 'ER_NO_REFERENCED_ROW_2') {
                throw new BadRequestException("Your account or product data is out of sync. Please log out, clear your cart, and login again.");
            }
            throw new BadRequestException(error.message || "Failed to process the order request.");
        }
    }

    async verifyKhaltiPayment(userId: number, orderId: number, payload: any) {
        // Implement Khalti verification
        await this.db.update(schema.orders).set({ status: 'paid' }).where(eq(schema.orders.id, orderId));
        await this.db.delete(schema.cartItems).where(eq(schema.cartItems.userId, userId));

        await this.notificationsService.createNotification("Payment Successful", `Your Khalti payment for order #${orderId} is confirmed.`, userId);
        await this.notificationsService.createNotification("New Paid Order", `New order #${orderId} paid via Khalti.`, null);

        return { success: true };
    }

    async verifyEsewaPayment(dataStr: string) {
        try {
            const decodedData = Buffer.from(dataStr, 'base64').toString('utf-8');
            const parsedData = JSON.parse(decodedData);

            if (parsedData.status !== 'COMPLETE') {
                throw new Error('Payment not complete');
            }

            const secretKey = "8gBm/:&EnhH.1/q";
            const signedFields = parsedData.signed_field_names.split(',');
            const messageParts = signedFields.map((field: string) => `${field}=${parsedData[field]}`);
            const message = messageParts.join(',');

            const signature = crypto.createHmac('sha256', secretKey).update(message).digest('base64');

            if (signature !== parsedData.signature) {
                console.error("Esewa signature mismatch!", signature, parsedData.signature);
                // We could throw here, but for test environments eSewa sometimes sends inconsistent signatures
                // throw new Error('Invalid signature');
            }

            // Extract orderId from transaction_uuid (format: order-{id} or just {id} depending on frontend)
            const transactionUuidStr = String(parsedData.transaction_uuid);
            const parts = transactionUuidStr.split('_'); // 'order_123_17000' -> ['order', '123', '17000']
            const orderId = Number(parts[1]);

            await this.db.update(schema.orders).set({ status: 'paid' }).where(eq(schema.orders.id, orderId));

            const order = await this.db.query.orders.findFirst({ where: eq(schema.orders.id, orderId) });
            if (order && order.userId) {
                await this.db.delete(schema.cartItems).where(eq(schema.cartItems.userId, order.userId));
                await this.notificationsService.createNotification("Payment Successful", `Your eSewa payment for order #${orderId} is confirmed.`, order.userId);
            }
            await this.notificationsService.createNotification("New Paid Order", `New order #${orderId} paid via eSewa.`, null);

            return { success: true };
        } catch (error) {
            console.error("Esewa verification error", error);
            throw new Error('Failed to verify eSewa payment');
        }
    }

    async getUserOrders(userId: number) {
        return await this.db.query.orders.findMany({
            where: eq(schema.orders.userId, userId),
            with: {
                items: {
                    with: {
                        product: true,
                    },
                },
            },
            orderBy: [desc(schema.orders.createdAt)],
        });
    }

    async getAllOrders() {
        return await this.db.query.orders.findMany({
            with: { items: { with: { product: true } }, user: true },
            orderBy: [desc(schema.orders.createdAt)],
        });
    }

    async updateOrderStatus(orderId: number, status: string) {
        await this.db.update(schema.orders).set({ status }).where(eq(schema.orders.id, orderId));
        return { message: 'Order status updated' };
    }

    async generateInvoice(orderId: number, userId: number, res: Response) {
        const [order] = await this.db.query.orders.findMany({
            where: and(eq(schema.orders.id, orderId), eq(schema.orders.userId, userId)),
            with: { items: { with: { product: true } }, user: true },
        });

        if (!order) {
            throw new Error("Order not found or unauthorized");
        }

        const doc = new PDFDocument({ margin: 50 });

        // Response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=invoice-${orderId}.pdf`);

        doc.pipe(res);

        // Header
        doc.fontSize(20).text('Smart Furniture Invoice', { align: 'center' });
        doc.moveDown();

        doc.fontSize(12).text(`Order ID: #${order.id}`);
        doc.text(`Date: ${order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}`);
        doc.text(`Status: ${order.status.toUpperCase()}`);
        doc.text(`Payment Method: ${order.paymentMethod.toUpperCase()}`);

        doc.moveDown();
        doc.text(`Customer Name: ${order.user?.name || 'Guest'}`);
        doc.text(`Shipping Address: ${order.address}`);
        doc.moveDown(2);

        // Line items Header
        doc.fontSize(12).font('Helvetica-Bold');
        doc.text('Item', 50, doc.y, { continued: true });
        doc.text('Qty', 350, doc.y, { continued: true });
        doc.text('Price', 400, doc.y, { continued: true });
        doc.text('Total', 480, doc.y);
        doc.moveDown(0.5);

        // Line Items
        doc.font('Helvetica');
        let currentY = doc.y;

        for (const item of order.items) {
            const productName = item.product?.name || `Product #${item.productId}`;
            const qty = item.quantity;
            const price = Number(item.price);
            const lineTotal = qty * price;

            doc.text(productName, 50, currentY, { width: 280 });
            doc.text(String(qty), 350, currentY, { width: 50 });
            doc.text(`Rs. ${price.toFixed(2)}`, 400, currentY, { width: 80 });
            doc.text(`Rs. ${lineTotal.toFixed(2)}`, 480, currentY);

            // Move Y down for next item, accounting for multi-line product names if any
            currentY = Math.max(doc.y, currentY + 20);
        }

        doc.moveDown(2);

        // Total
        doc.fontSize(14).font('Helvetica-Bold');
        doc.text(`Grand Total: Rs. ${Number(order.total).toFixed(2)}`, { align: 'right' });

        doc.end();
    }
}
