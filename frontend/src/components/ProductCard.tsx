'use client';
import { Product } from '@/app/shop/page';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/useCartStore';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addToCart = useCartStore((state) => state.addToCart);
  const router = useRouter();

  return (
    <div onClick={() => router.push(`/shop/${product.id}`)} className="group cursor-pointer h-full">
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

        <h3 className="font-serif font-bold text-xl text-[#3E2723] group-hover:text-[#D4AF37] transition-colors">
          {product.name}
        </h3>

        <p className="text-sm text-gray-500 font-sans tracking-wide leading-relaxed line-clamp-2 mb-6 flex-grow">
          {product.description || "Elegant furniture designed for comfort and modern aesthetics."}
        </p>

        <div className="flex justify-between items-center mt-auto border-t border-gray-100 pt-4">
          <span className="text-lg font-bold text-[#D4AF37]">Rs. {product.price}</span>

          <button
            className="bg-[#3E2723] text-white px-5 py-2 uppercase tracking-widest text-[10px] font-bold hover:bg-[#D4AF37] transition-all shadow-sm z-10 relative"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addToCart(product);
              toast.success("Product added to cart");
            }}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}