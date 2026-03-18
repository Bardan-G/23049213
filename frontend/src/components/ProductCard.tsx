'use client';
import { Product } from '@/app/shop/page';
import React from 'react';
import Link from 'next/link'; // Import Link for navigation
import { useCartStore } from '@/store/useCartStore';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addToCart = useCartStore((state) => state.addToCart);

  return (
    // Wrap the card in a Link to the dynamic ID route
    <Link href={`/shop/${product.id}`} className="group">
      <div className="border rounded-lg p-4 shadow-sm hover:shadow-xl transition-all duration-300 bg-white h-full flex flex-col">

        {/* Product Image Container */}
        <div className="relative h-48 w-full bg-gray-100 rounded-md mb-4 overflow-hidden">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="text-gray-400 italic">No image available</span>
            </div>
          )}

          {/* Subtle Category Badge */}
          {product.category && (
            <span className="absolute top-2 left-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded uppercase backdrop-blur-sm">
              {product.category}
            </span>
          )}
        </div>

        <h3 className="font-bold text-lg text-gray-800 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>

        <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-grow">
          {product.description || "Elegant furniture designed for comfort and modern aesthetics."}
        </p>

        <div className="flex justify-between items-center mt-auto">
          <span className="text-xl font-bold text-gray-900">Rs. {product.price}</span>

          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm z-10 relative"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addToCart(product);
              // Optional: You could add a toast notification here
              // alert('Added to cart!'); 
            }}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </Link>
  );
}