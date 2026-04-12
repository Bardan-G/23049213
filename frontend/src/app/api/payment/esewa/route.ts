import { NextResponse } from 'next/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const { total_amount, transaction_uuid, product_code } = await request.json();

        if (!total_amount || !transaction_uuid || !product_code) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        // Esewa Test Configuration
        // In production, these should be in environment variables
        const secretKey = "8gBm/:&EnhH.1/q";

        // Message format for signature: "total_amount,transaction_uuid,product_code"
        const message = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;

        // Generate HMAC-SHA256 Signature
        const signature = crypto.createHmac('sha256', secretKey)
            .update(message)
            .digest('base64');

        return NextResponse.json({
            signature,
            signed_field_names: "total_amount,transaction_uuid,product_code"
        });

    } catch (error) {
        console.error("Esewa Signature Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
