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
  category:string;
}

export default function ShopPage() {
  // 2. Tell useState this is an array of Products
  const [products, setProducts] = useState<Product[]>([]);

  // 3. Move the function INSIDE useEffect or call it INSIDE useEffect
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products');
        console.log("Raw API Response:", response.data);

        // Extracting the rows from Drizzle's [rows, fields] format
        const result = Array.isArray(response.data[0]) 
          ? response.data[0] 
          : response.data;

        setProducts(Array.isArray(result) ? result : []);
      } catch (error) {
        console.error("Connection Error:", error);
      }
    };

    fetchProducts();
  }, []); // Empty dependency array means this runs once on mount

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8 text-white">All Furniture</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.length > 0 ? (
          products.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))
        ) : (
          <p className="text-gray-400">No products found. Check your database!</p>
        )}
      </div>
    </div>
  );
}