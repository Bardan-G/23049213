'use client'
import api from "@/lib/axios";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useCartStore } from "@/store/useCartStore"; // 1. Import the store

export default function ProductDetailPage() {
    const { id } = useParams();
    const [product, setProduct] = useState<any>(null); // Fixed naming: setProduct
    const [loading, setLoading] = useState(true);

    const addToCart = useCartStore((state) => state.addToCart); // 2. Get the action

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await api.get(`/products/${id}`);
                setProduct(res.data);
            } catch (err) {
                console.log("Error fetching product details", err);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchProduct();
    }, [id]);

    if (loading) return <div className="p-20 text-center text-white">Loading details...</div>;
    if (!product) return <div className="p-20 text-center text-white">Product not found.</div>;

    return (
        <div className="container mx-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-12 text-white bg-slate-900 min-h-screen">
            {/* Product Image */}
            <div className="relative h-[500px] bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
                <img 
                    src={product.imageUrl || 'https://via.placeholder.com/500'} 
                    alt={product.name}
                    className="object-cover w-full h-full"
                />
            </div>

            {/* Product Info */}
            <div className="flex flex-col justify-center">
                <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
                <p className="text-slate-400 text-sm mb-4 uppercase tracking-widest">{product.category}</p>
                <p className="text-3xl text-emerald-400 font-semibold mb-6">${product.price}</p>
                <p className="text-slate-300 leading-relaxed mb-8">{product.description}</p>
                
                {/* 3. Wire up the button */}
                <button 
                    onClick={() => {
                        addToCart(product);
                        alert(`${product.name} added to cart!`);
                    }}
                    className="bg-blue-600 text-white py-4 px-8 rounded-full hover:bg-blue-700 transition shadow-lg font-bold"
                >
                    Add to Cart
                </button>
            </div>
        </div>
    );
}