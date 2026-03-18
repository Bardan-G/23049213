'use client'
import api from "@/lib/axios";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useCartStore } from "@/store/useCartStore";
import { useSession } from "next-auth/react";
// Dynamic import for model-viewer since it relies on window
import dynamic from 'next/dynamic';
import { Box } from "lucide-react";

// Register model-viewer web component globally
if (typeof window !== "undefined") {
    require("@google/model-viewer");
}

export default function ProductDetailPage() {
    const { id } = useParams();
    const { data: session } = useSession();
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [selectedColorIndex, setSelectedColorIndex] = useState<number | null>(null);
    const [viewMode, setViewMode] = useState<'2D' | '3D'>('2D');

    const addToCart = useCartStore((state) => state.addToCart);
    const syncCart = useCartStore((state) => state.syncCart);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await api.get(`/products/${id}`);
                setProduct(res.data);
            } catch (err) {
                console.error("Error fetching product details", err);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchProduct();
    }, [id]);

    const handleAddToCart = async () => {
        addToCart(product);
        if (session?.accessToken) {
            await syncCart(session.accessToken);
        }
        alert(`${product.name} added to cart!`);
    };

    if (loading) return <div className="p-20 text-center text-gray-800">Loading details...</div>;
    if (!product) return <div className="p-20 text-center text-gray-800">Product not found.</div>;

    // Determine currently displayed image based on color selection
    let displayImageUrl = product.imageUrl || 'https://via.placeholder.com/500';
    if (selectedColorIndex !== null && product.variants?.[selectedColorIndex]?.imageUrl) {
        displayImageUrl = product.variants[selectedColorIndex].imageUrl;
    }

    // Check if product has 3D capability
    const has3DModel = !!product.model3dUrl;

    return (
        <div className="container mx-auto p-4 sm:p-8 pt-20 sm:pt-24 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 bg-[#Fdfbf7] min-h-screen">
            {/* Left Side: Media Viewer */}
            <div className="flex flex-col gap-4">
                <div className="relative h-[300px] sm:h-[400px] md:h-[500px] bg-white shadow-sm rounded-xl overflow-hidden border border-gray-100 flex items-center justify-center">

                    {/* Render 3D Viewer or standard Image */}
                    {viewMode === '3D' && has3DModel ? (
                        <div className="w-full h-full bg-gray-50 flex items-center justify-center relative">
                            {/* @ts-ignore - model-viewer is a web component standard */}
                            <model-viewer
                                src={product.model3dUrl}
                                auto-rotate
                                camera-controls
                                // shadow-intensity="1"
                                className="w-full h-full object-contain focus:outline-none"
                                style={{ width: '100%', height: '100%', outline: 'none' }}
                            />
                            <div className="absolute bottom-4 left-0 right-0 flex justify-center pointer-events-none">
                                <span className="bg-black/50 text-white backdrop-blur text-xs px-3 py-1 rounded-full uppercase tracking-wider">Drag to Rotate</span>
                            </div>
                        </div>
                    ) : (
                        <img
                            src={displayImageUrl}
                            alt={product.name}
                            className="object-cover w-full h-full shadow-inner transition-opacity duration-300"
                        />
                    )}
                </div>

                {/* View Toggles (if 3D is available) */}
                {has3DModel && (
                    <div className="flex justify-center gap-2 mt-2">
                        <button
                            onClick={() => setViewMode('2D')}
                            className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-colors border ${viewMode === '2D' ? 'bg-[#3E2723] text-white border-[#3E2723]' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'}`}
                        >
                            2D Photo
                        </button>
                        <button
                            onClick={() => setViewMode('3D')}
                            className={`px-6 py-2 flex items-center gap-2 rounded-full text-xs font-bold uppercase tracking-widest transition-colors border ${viewMode === '3D' ? 'bg-[#3E2723] text-white border-[#3E2723]' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'}`}
                        >
                            <Box size={14} /> 3D View
                        </button>
                    </div>
                )}
            </div>

            {/* Right Side: Product Info */}
            <div className="flex flex-col justify-start pt-4">
                <h1 className="text-3xl sm:text-4xl font-serif font-bold mb-2 text-[#3E2723]">{product.name}</h1>
                <p className="text-[#3E2723]/60 text-xs mb-8 uppercase tracking-[0.2em]">{product.category}</p>
                <p className="text-2xl sm:text-3xl text-[#D4AF37] font-semibold mb-6">Rs. {product.price}</p>

                {/* Color Variants Selectors */}
                {product.variants && product.variants.length > 0 && (
                    <div className="mb-8 border-t border-gray-100 pt-6">
                        <p className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-3">
                            Select Color: {selectedColorIndex !== null ? <span className="text-[#3E2723]">{product.variants[selectedColorIndex].colorName}</span> : ''}
                        </p>
                        <div className="flex flex-wrap gap-3">
                            {product.variants.map((variant: any, index: number) => (
                                <button
                                    key={index}
                                    onClick={() => { setSelectedColorIndex(index); setViewMode('2D'); }}
                                    aria-label={`Select ${variant.colorName}`}
                                    className={`w-10 h-10 rounded-full border-2 transition-all p-1 hover:scale-110 ${selectedColorIndex === index ? 'border-[#D4AF37]' : 'border-transparent shadow-sm'}`}
                                >
                                    <div
                                        className="w-full h-full rounded-full border border-black/10 shadow-sm"
                                        style={{ backgroundColor: variant.colorHex }}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="border-t border-gray-100 pt-6 mb-8">
                    <h3 className="text-xs uppercase tracking-widest text-[#3E2723] font-bold mb-3">Details</h3>
                    <p className="text-gray-600 leading-relaxed font-serif">{product.description}</p>
                </div>

                <button
                    onClick={handleAddToCart}
                    className="w-full sm:w-2/3 bg-[#3E2723] text-white py-4 px-8 uppercase tracking-widest text-sm font-bold hover:bg-[#D4AF37] transition-all shadow-lg text-center"
                >
                    Add to Cart
                </button>
            </div>
        </div>
    );
}