'use client';
import Link from "next/link";
import { CheckCircle, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import api from "@/lib/axios";
import { useCartStore } from "@/store/useCartStore";

function SuccessContent() {
    const searchParams = useSearchParams();
    const dataRaw = searchParams.get('data');
    const data = dataRaw ? dataRaw.replace(/ /g, '+') : null;
    const { clearCart } = useCartStore();

    const [verifying, setVerifying] = useState(!!data);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (data) {
            const verifyEsewa = async () => {
                try {
                    await api.post('/orders/verify-esewa', { data });
                    clearCart();
                    setVerifying(false);
                } catch (err: any) {
                    console.error("Esewa verification failed", err);
                    setError("Payment verification failed. Please contact support.");
                    setVerifying(false);
                }
            };
            verifyEsewa();
        }
    }, [data, clearCart]);

    if (verifying) {
        return (
            <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center p-6">
                <div className="text-center flex flex-col items-center">
                    <Loader2 size={48} className="text-[#d4af37] animate-spin mb-4" />
                    <h1 className="text-2xl font-serif text-[#3e2723]">Verifying Payment...</h1>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center p-6">
                <div className="text-center max-w-md">
                    <h1 className="text-4xl font-serif text-red-600 mb-4">Verification Failed</h1>
                    <p className="text-[#3e2723]/70 mb-8">{error}</p>
                    <Link href="/dashboard" className="bg-[#3e2723] text-white py-4 px-8 uppercase tracking-widest text-xs font-bold hover:bg-[#d4af37] transition-all">
                        View Orders
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center p-6">
            <div className="text-center max-w-md">
                <div className="flex justify-center mb-6">
                    <CheckCircle size={64} className="text-[#d4af37]" />
                </div>
                <h1 className="text-4xl font-serif text-[#3e2723] mb-4">Order Confirmed!</h1>
                <p className="text-[#3e2723]/70 mb-8 leading-relaxed">
                    Thank you for your purchase. Your order has been received and is being processed by our artisans.
                </p>
                <div className="flex flex-col gap-4">
                    <Link
                        href="/dashboard"
                        className="bg-[#3e2723] text-white py-4 px-8 uppercase tracking-widest text-xs font-bold hover:bg-[#d4af37] transition-all"
                    >
                        View Order
                    </Link>
                    <Link
                        href="/"
                        className="text-[#3e2723] uppercase tracking-widest text-xs font-bold hover:underline"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function OrderSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center p-6">
                <Loader2 size={48} className="text-[#d4af37] animate-spin mb-4" />
            </div>
        }>
            <SuccessContent />
        </Suspense>
    );
}
