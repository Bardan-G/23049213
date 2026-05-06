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

            if (parsedData.signed_field_names) {
                const secretKey = "8gBm/:&EnhH.1/q"; // Note: For production use production secret key
                const signedFields = parsedData.signed_field_names.split(',');
                const messageParts = signedFields.map((field: string) => {
                    let val = parsedData[field];
                    // Esewa documentation requires removing commas from total_amount before generating signature
                    if (field === 'total_amount' && typeof val === 'string') {
                        val = val.replace(/,/g, '');
                    }
                    return `${field}=${val}`;
                });
                const message = messageParts.join(',');

                const signature = crypto.createHmac('sha256', secretKey).update(message).digest('base64');

                if (signature !== parsedData.signature) {
                    console.error("Esewa signature mismatch!", signature, parsedData.signature);
                    throw new BadRequestException('Esewa signature mismatch. Payment verification failed.');
                }
            }

            // Extract orderId from transaction_uuid
            const transactionUuidStr = String(parsedData.transaction_uuid);
            const parts = transactionUuidStr.split('-');
            const orderId = Number(parts[0].replace('order_', ''));

            if (isNaN(orderId)) {
                throw new Error('Invalid order ID extracted from transaction UUID');
            }

            await this.db.update(schema.orders).set({ status: 'paid' }).where(eq(schema.orders.id, orderId));

            const order = await this.db.query.orders.findFirst({ where: eq(schema.orders.id, orderId) });
            if (order && order.userId) {
                await this.db.delete(schema.cartItems).where(eq(schema.cartItems.userId, order.userId));
                await this.notificationsService.createNotification("Payment Successful", `Your eSewa payment for order #${orderId} is confirmed.`, order.userId);
            }
            await this.notificationsService.createNotification("New Paid Order", `New order #${orderId} paid via eSewa.`, null);

            return { success: true };
        } catch (error: any) {
            console.error("Esewa verification error", error);
            throw new Error(error.message || 'Failed to verify eSewa payment');
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

        const doc = new PDFDocument({ margin: 50, size: 'A4' });

        // Generate formatted Order ID (e.g. ORD-2026-00011)
        const orderYear = order.createdAt ? new Date(order.createdAt).getFullYear() : new Date().getFullYear();
        const formattedOrderId = `ORD-${orderYear}-${String(order.id).padStart(5, '0')}`;

        // Response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=invoice-${formattedOrderId}.pdf`);

        doc.pipe(res);

        // Header - Company Details
        doc.fillColor('#3e2723').fontSize(24).font('Helvetica-Bold').text('G Kastha Living', 50, 50);
        doc.fillColor('#555555').fontSize(10).font('Helvetica')
           .text('Kathmandu, Nepal', 50, 80)
           .text('Phone: +977-1234567890', 50, 95)
           .text('Email: info@gkastha.com.np', 50, 110);

        // Header - Invoice Details (Right Aligned)
        doc.fillColor('#3e2723').fontSize(20).font('Helvetica-Bold').text('INVOICE', 400, 50, { align: 'right' });
        
        doc.fillColor('#555555').fontSize(10).font('Helvetica');
        doc.text(`Invoice No: ${formattedOrderId}`, 400, 80, { align: 'right' });
        doc.text(`Date: ${order.createdAt ? new Date(order.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}`, 400, 95, { align: 'right' });
        doc.text(`Status: ${order.status.toUpperCase()}`, 400, 110, { align: 'right' });

        doc.moveDown(3);

        // Billing To
        doc.fillColor('#3e2723').fontSize(12).font('Helvetica-Bold').text('Bill To:', 50, 150);
        doc.fillColor('#000000').fontSize(10).font('Helvetica')
           .text(order.user?.name || 'Guest', 50, 165)
           .text(order.address, 50, 180, { width: 250 })
           .text(`Payment Method: ${order.paymentMethod.toUpperCase()}`, 50, 210);

        doc.moveDown(2);

        // Table Drawing Function Helpers
        const generateHr = (y: number) => {
            doc.strokeColor('#dddddd').lineWidth(1).moveTo(50, y).lineTo(550, y).stroke();
        };

        let invoiceTableTop = 250;

        // Table Header
        doc.font('Helvetica-Bold').fillColor('#3e2723');
        generateHr(invoiceTableTop);
        doc.text('Item Description', 50, invoiceTableTop + 10);
        doc.text('Qty', 350, invoiceTableTop + 10, { width: 50, align: 'center' });
        doc.text('Unit Price', 400, invoiceTableTop + 10, { width: 70, align: 'right' });
        doc.text('Total', 480, invoiceTableTop + 10, { width: 70, align: 'right' });
        generateHr(invoiceTableTop + 25);

        // Table Content
        doc.font('Helvetica').fillColor('#000000');
        let currentY = invoiceTableTop + 35;

        for (const item of order.items) {
            const productName = item.product?.name || `Product #${item.productId}`;
            const qty = item.quantity;
            const price = Number(item.price);
            const lineTotal = qty * price;

            doc.text(productName, 50, currentY, { width: 280 });
            doc.text(String(qty), 350, currentY, { width: 50, align: 'center' });
            doc.text(`Rs. ${price.toFixed(2)}`, 400, currentY, { width: 70, align: 'right' });
            doc.text(`Rs. ${lineTotal.toFixed(2)}`, 480, currentY, { width: 70, align: 'right' });

            // Ensure spacing for multi-line items
            const height = doc.heightOfString(productName, { width: 280 });
            currentY += Math.max(height, 20) + 10;
            
            // Add a new page if we run out of space
            if (currentY > 700) {
                doc.addPage();
                currentY = 50;
            }
        }

        generateHr(currentY);

        // Totals
        const subtotalPosition = currentY + 15;
        doc.font('Helvetica-Bold').fontSize(12).fillColor('#3e2723');
        doc.text('Grand Total:', 350, subtotalPosition, { width: 120, align: 'right' });
        doc.text(`Rs. ${Number(order.total).toFixed(2)}`, 480, subtotalPosition, { width: 70, align: 'right' });

        // Footer
        doc.font('Helvetica').fontSize(10).fillColor('#aaaaaa');
        doc.text('Thank you for shopping with G Kastha Living. We hope you enjoy your new furniture!', 50, 750, { align: 'center', width: 500 });

        doc.end();
    }
}
