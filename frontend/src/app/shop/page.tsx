'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import ProductCard from '@/components/ProductCard';

// 1. Define what a Product looks like
export interface Product {
  id: number;
  name: string;
  price: string;
  description?: string;
  imageUrl?: string;
  // categoryId?: number;
  category: string;
}

export default function ShopPage() {
  // 2. Tell useState this is an array of Products
  const [products, setProducts] = useState<Product[]>([]);

  // 3. Move the function INSIDE useEffect or call it INSIDE useEffect
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products');

        // Handle both clean array and [rows, fields] format just in case
        const data = response.data;
        const productsList = Array.isArray(data) ? (Array.isArray(data[0]) ? data[0] : data) : [];

        setProducts(productsList);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };

    fetchProducts();
  }, []); // Empty dependency array means this runs once on mount

  return (
    <div className="container mx-auto p-4 sm:p-8 pt-20 sm:pt-24 flex flex-col md:flex-row gap-8">
      {/* Sidebar Filter */}
      <aside className="w-full md:w-64 flex-shrink-0">
        <h2 className="font-serif text-xl font-bold text-[#3e2723] mb-4 border-b border-[#3e2723]/10 pb-2">Categories</h2>
        <ul className="space-y-2">
          <li>
            <a href="/shop" className="block text-gray-600 hover:text-[#d4af37] font-medium">All Furniture</a>
          </li>
          {['Living Room', 'Bedroom', 'Dining', 'Collections'].map((cat) => (
            <li key={cat}>
              <a href={`/${cat.toLowerCase().replace(' ', '-')}`} className="block text-gray-600 hover:text-[#d4af37]">
                {cat}
              </a>
            </li>
          ))}
        </ul>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        <h1 className="text-3xl font-bold mb-8 text-[#3e2723]">All Furniture</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.length > 0 ? (
            products.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))
          ) : (
            <p className="text-gray-400">No products found. Check your database!</p>
          )}
        </div>
      </div>
    </div>
  );
}