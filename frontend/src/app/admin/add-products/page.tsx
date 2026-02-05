'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

export default function AddProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [filteredSubs, setFilteredSubs] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: 0,
    subcategoryId: '',
  });

  // 1. Load Categories and Subcategories on mount
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data);
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    };
    fetchMetadata();
  }, []);

  // 2. Handle Category selection to filter Subcategories
  const handleCategoryChange = (catId: string) => {
    const category = categories.find(c => c.id === parseInt(catId));
    setFilteredSubs(category ? category.subcategories : []);
    setFormData({ ...formData, subcategoryId: '' }); // Reset subcat on cat change
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validation check
    if (!formData.subcategoryId) {
      alert("Please select a subcategory");
      return;
    }

    try {
      // 2. Data Sanitization
      const cleanData = {
        name: formData.name,
        description: formData.description || null, // Matches text('description')
        price: parseFloat(formData.price).toFixed(2), // Matches decimal(10,2)
        stock: Number(formData.stock),                // Matches int('stock')
        subcategoryId: parseInt(formData.subcategoryId), // Matches int references
        imageUrl: null, // Ensure this is sent as null if not used
      };

      await api.post('/products/add', cleanData);
      
      alert("Furniture added successfully!");
      router.push('/admin/products');
    } catch (err: any) {
      // 3. Log the specific server error message
      console.error("Server Error Details:", err.response?.data);
      alert(err.response?.data?.message || "Internal Server Error - Check Backend Console");
    }
  };

  return (
    <div className="p-10 bg-slate-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-8">Add New Furniture</h1>
      
      <form onSubmit={handleSubmit} className="max-w-2xl bg-slate-800 p-8 rounded-xl shadow-lg space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Product Name</label>
          <input 
            type="text" 
            required
            className="w-full p-3 bg-slate-700 rounded border border-slate-600 focus:border-blue-500 outline-none"
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select 
              className="w-full p-3 bg-slate-700 rounded border border-slate-600 outline-none"
              onChange={(e) => handleCategoryChange(e.target.value)}
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Subcategory</label>
            <select 
              required
              className="w-full p-3 bg-slate-700 rounded border border-slate-600 outline-none"
              value={formData.subcategoryId}
              onChange={(e) => setFormData({...formData, subcategoryId: e.target.value})}
            >
              <option value="">Select Subcategory</option>
              {filteredSubs.map(sub => (
                <option key={sub.id} value={sub.id}>{sub.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Price ($)</label>
            <input 
              type="number" step="0.01" required
              className="w-full p-3 bg-slate-700 rounded border border-slate-600 outline-none"
              onChange={(e) => setFormData({...formData, price: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Stock Count</label>
            <input 
              type="number" required
              className="w-full p-3 bg-slate-700 rounded border border-slate-600 outline-none"
              onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value)})}
            />
          </div>
        </div>

        <button 
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors"
        >
          Save Product to Inventory
        </button>
      </form>
    </div>
  );
}