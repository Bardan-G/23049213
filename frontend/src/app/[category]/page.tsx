'use client';
import { useEffect, useState, use } from 'react';
import api from '@/lib/axios';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/app/shop/page';

export default function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
    const { category } = use(params);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    // Convert slug "living-room" to "Living Room"
    const categoryName = category
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                // Pass the formatted name to the backend
                const response = await api.get(`/products?category=${encodeURIComponent(categoryName)}`);

                const data = response.data;
                const productsList = Array.isArray(data) ? (Array.isArray(data[0]) ? data[0] : data) : [];
                setProducts(productsList);
            } catch (error) {
                console.error("Failed to fetch products:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [categoryName]);

    return (
        <div className="container mx-auto p-4 sm:p-8 pt-28 sm:pt-32 bg-[#FAFAFA] min-h-screen max-w-none w-full">
            <button 
               onClick={() => window.location.href='/shop'} 
               className="text-[#3E2723] text-[10px] uppercase tracking-[0.2em] font-bold font-sans mb-8 hover:text-[#D4AF37] transition-colors flex items-center gap-2 group"
            >
               <span className="transform group-hover:-translate-x-1 transition-transform">&larr;</span> Back to Categories
            </button>
            <h1 className="text-4xl lg:text-5xl font-serif font-bold mb-10 text-[#3E2723]">{categoryName}</h1>

            {loading ? (
                <div className="text-center py-20">Loading...</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                    {products.length > 0 ? (
                        products.map((item) => (
                            <ProductCard key={item.id} product={item} />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-20 text-gray-500">
                            <p className="text-xl">No products found in this category.</p>
                            <p className="mt-2 text-sm">Try adding some from the Admin Dashboard!</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
