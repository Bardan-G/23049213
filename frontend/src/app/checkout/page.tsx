'use client';
import { useCartStore } from "@/store/useCartStore";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import api from "@/lib/axios";

export default function CheckoutPage() {
    const { cart, totalPrice, clearCart } = useCartStore();
    const { data: session } = useSession();
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        address: '',
        city: '',
        zip: '',
        paymentMethod: 'cod', // Default to Cash on Delivery
    });

    const createOrderOnBackend = async () => {
        const response = await api.post('/orders', {
            items: cart.map(item => ({
                productId: item.id,
                quantity: item.quantity,
                price: parseFloat(item.price as any)
            })),
            total: totalPrice(),
            address: `${formData.address}, ${formData.city}, ${formData.zip}`,
            paymentMethod: formData.paymentMethod
        }, {
            headers: { Authorization: `Bearer ${session?.accessToken}` }
        });
        return response.data.orderId;
    };

    const handleCheckoutSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!session) {
            alert("Please login to place an order");
            router.push("/auth/login");
            return;
        }

        setLoading(true);

        try {
            const orderId = await createOrderOnBackend();

            if (formData.paymentMethod === 'cod') {
                clearCart();
                router.push('/orders/success');
            } else if (formData.paymentMethod === 'khalti') {
                initiateKhalti(orderId);
            } else if (formData.paymentMethod === 'esewa') {
                await initiateEsewa(orderId);
            }
        } catch (error) {
            console.error("Order creation failed:", error);
            alert("Failed to initiate order. Please try again.");
            setLoading(false);
        }
    };

    const initiateKhalti = (orderId: number) => {
        const config = {
            "publicKey": "test_public_key_dc74e0fd57cb46cd93832aee0a390234",
            "productIdentity": "order_" + orderId,
            "productName": "Furniture Order #" + orderId,
            "productUrl": window.location.origin,
            "eventHandler": {
                async onSuccess(payload: any) {
                    console.log("Khalti Success:", payload);
                    try {
                        await api.post('/orders/verify-khalti', { orderId, payload }, {
                            headers: { Authorization: `Bearer ${session?.accessToken}` }
                        });
                        clearCart();
                        router.push('/orders/success');
                    } catch (err) {
                        alert("Failed to verify Khalti payment.");
                        setLoading(false);
                    }
                },
                onError(error: any) {
                    console.log(error);
                    alert("Payment Failed");
                    setLoading(false);
                },
                onClose() {
                    console.log('widget is closing');
                    setLoading(false);
                }
            }
        };

        try {
            // @ts-ignore
            const checkout = new KhaltiCheckout(config);
            checkout.show({ amount: totalPrice() * 100 }); // Amount in paisa
        } catch (err) {
            alert("Khalti script not loaded.");
            console.error(err);
            setLoading(false);
        }
    };

    const initiateEsewa = async (orderId: number) => {
        const total_amount = totalPrice();
        const transaction_uuid = `${orderId}-${Math.random().toString(36).substring(2, 10)}-${Date.now().toString().slice(-6)}`;
        const product_code = "EPAYTEST";

        try {
            const response = await fetch('/api/payment/esewa', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ total_amount, transaction_uuid, product_code })
            });

            if (!response.ok) throw new Error("Failed to get payment signature");
            const { signature } = await response.json();

            const form = document.createElement("form");
            form.setAttribute("method", "POST");
            form.setAttribute("action", "https://rc-epay.esewa.com.np/api/epay/main/v2/form");

            const fields = {
                amount: total_amount,
                tax_amount: 0,
                total_amount: total_amount,
                transaction_uuid: transaction_uuid,
                product_code: product_code,
                product_service_charge: 0,
                product_delivery_charge: 0,
                success_url: `${window.location.origin}/orders/success`,
                failure_url: `${window.location.origin}/orders/failed`,
                signed_field_names: "total_amount,transaction_uuid,product_code",
                signature: signature
            };

            for (const key in fields) {
                const hiddenField = document.createElement("input");
                hiddenField.setAttribute("type", "hidden");
                hiddenField.setAttribute("name", key);
                // @ts-ignore
                hiddenField.setAttribute("value", fields[key]);
                form.appendChild(hiddenField);
            }

            document.body.appendChild(form);
            form.submit();
        } catch (error) {
            console.error("Esewa Payment Error:", error);
            alert("Esewa Payment Initiation Failed");
            setLoading(false);
        }
    };

    if (cart.length === 0) {
        return <div className="p-20 text-center">Your cart is empty.</div>;
    }

    return (
        <div className="min-h-screen bg-[#fdfbf7] p-8 md:p-16">
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">

                {/* Shipping Form */}
                <div>
                    <h1 className="text-3xl font-serif text-[#3e2723] mb-8">Checkout</h1>
                    <form onSubmit={handleCheckoutSubmit} className="space-y-6">
                        <div>
                            <label className="block text-[10px] uppercase tracking-widest text-[#3e2723]/60 mb-2">Shipping Address</label>
                            <input
                                type="text"
                                required
                                className="w-full bg-transparent border-b border-[#3e2723]/20 py-3 text-sm focus:outline-none focus:border-[#d4af37]"
                                placeholder="123 Furniture St"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest text-[#3e2723]/60 mb-2">City</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-transparent border-b border-[#3e2723]/20 py-3 text-sm focus:outline-none focus:border-[#d4af37]"
                                    placeholder="New York"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest text-[#3e2723]/60 mb-2">ZIP Code</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-transparent border-b border-[#3e2723]/20 py-3 text-sm focus:outline-none focus:border-[#d4af37]"
                                    placeholder="10001"
                                    value={formData.zip}
                                    onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="pt-8">
                            <h2 className="text-xl font-serif text-[#3e2723] mb-4">Payment Method</h2>
                            <div className="space-y-3">
                                <label className="flex items-center gap-3 p-4 border border-[#3e2723]/10 rounded-lg cursor-pointer hover:bg-white transition">
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="cod"
                                        checked={formData.paymentMethod === 'cod'}
                                        onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                                        className="text-[#3e2723] focus:ring-[#d4af37]"
                                    />
                                    <span className="text-sm font-bold text-[#3e2723]">Cash on Delivery</span>
                                </label>
                                <label className="flex items-center gap-3 p-4 border border-[#3e2723]/10 rounded-lg cursor-pointer hover:bg-white transition">
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="khalti"
                                        checked={formData.paymentMethod === 'khalti'}
                                        onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                                        className="text-[#3e2723] focus:ring-[#d4af37]"
                                    />
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-[#3e2723]">Pay with Khalti</span>
                                        <img src="https://web.khalti.com/static/img/logo1.png" alt="Khalti" className="h-6" />
                                    </div>
                                </label>
                                <label className="flex items-center gap-3 p-4 border border-[#3e2723]/10 rounded-lg cursor-pointer hover:bg-white transition">
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="esewa"
                                        checked={formData.paymentMethod === 'esewa'}
                                        onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                                        className="text-[#3e2723] focus:ring-[#d4af37]"
                                    />
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-[#3e2723] text-green-600">Pay with Esewa</span>
                                        {/* Ideally add Esewa logo here if available */}
                                    </div>
                                </label>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#3e2723] text-white py-4 mt-8 uppercase tracking-widest text-xs font-bold hover:bg-[#d4af37] transition-all disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : `Pay Rs. ${totalPrice().toFixed(2)}`}
                        </button>
                    </form>
                </div>

                {/* Order Summary */}
                <div className="bg-white p-8 rounded-lg shadow-sm h-fit">
                    <h2 className="text-xl font-serif text-[#3e2723] mb-6">Order Summary</h2>
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                        {cart.map((item) => (
                            <div key={item.id} className="flex gap-4 border-b border-gray-100 pb-4">
                                <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden">
                                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-[#3e2723]">{item.name}</p>
                                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                    <p className="text-[#d4af37] text-sm font-bold">Rs. {item.price}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="border-t border-gray-100 pt-6 mt-6">
                        <div className="flex justify-between text-[#3e2723] font-bold text-lg">
                            <span>Total</span>
                            <span>Rs. {totalPrice().toFixed(2)}</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
