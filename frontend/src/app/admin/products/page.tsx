'use client'

import api from "@/lib/axios";
import { useEffect, useState } from "react"
import Link from "next/link"; // To link to your Add Product page

export default function AdminProductPage() {
  // Fix: Initialize as empty array to avoid 'undefined' and 'never' errors
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      const data = Array.isArray(res.data[0]) ? res.data[0] : res.data;
      setProducts(data);
    } catch (error) {
      console.error("Failed to fetch:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this piece of furniture?')) {
      try {
        await api.delete(`/products/${id}`);
        // Optimistic UI: Filter out the deleted product locally for speed
        setProducts(products.filter(p => p.id !== id));
      } catch (error) {
        alert("Delete failed!");
      }
    }
  };

  return (
    <div className="p-10 bg-slate-900 min-h-screen text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Inventory Management</h1>
        <Link 
          href="/admin/add-product" 
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-bold"
        >
          + Add New Furniture
        </Link>
      </div>

      <div className="bg-slate-800 rounded-lg overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-700">
              <th className="p-4">ID</th>
              <th className="p-4">Furniture Name</th>
              <th className="p-4">Price</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="p-10 text-center">Loading Inventory...</td></tr>
            ) : products.length > 0 ? (
              products.map((p) => (
                <tr key={p.id} className="border-b border-slate-700 hover:bg-slate-750 transition-colors">
                  <td className="p-4 text-slate-400">{p.id}</td>
                  <td className="p-4 font-medium">{p.name}</td>
                  <td className="p-4 text-blue-400">${p.price}</td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => handleDelete(p.id)}
                      className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white px-4 py-1.5 rounded-md transition-all border border-red-500/20"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={4} className="p-10 text-center text-slate-500">No products found. Add some furniture to start!</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}