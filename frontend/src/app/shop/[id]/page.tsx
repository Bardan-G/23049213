'use client'
import api from "@/lib/axios";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProductDetailPage (){
    const {id} = useParams();
    const [product,setProducts] = useState<any>(null);
    const [loading,setLoading] = useState(true);

    useEffect(()=>{
        const fetchProducts = async ()=>{
            try{
                const res = await api.get(`/products/${id}`);
                setProducts(res.data)
            }catch (err){
                console.log("Error fetching product details",err);
            }
            finally{
                setLoading(false);
            }
        };
        if (id) fetchProducts()
    },[id])

    if (loading) return <div className="p-20 text-center">Loading details...</div>;
  if (!product) return <div className="p-20 text-center">Product not found.</div>;

  return (
    <div className="container mx-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
      {/* Product Image */}
      <div className="relative h-[500px] bg-gray-100 rounded-xl overflow-hidden">
        <img 
          src={product.imageUrl || 'https://via.placeholder.com/500'} 
          alt={product.name}
          className="object-cover w-full h-full"
        />
      </div>

      {/* Product Info */}
      <div className="flex flex-col justify-center">
        <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
        <p className="text-gray-500 text-sm mb-4 uppercase tracking-widest">{product.category}</p>
        <p className="text-2xl text-blue-600 font-semibold mb-6">${product.price}</p>
        <p className="text-gray-700 leading-relaxed mb-8">{product.description}</p>
        
        <button className="bg-black text-white py-4 px-8 rounded-full hover:bg-gray-800 transition shadow-lg">
          Add to Cart
        </button>
      </div>
    </div>
  )
}