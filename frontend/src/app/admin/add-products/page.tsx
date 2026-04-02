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
    model3dUrl: '',
  });
  
  const [images, setImages] = useState<string[]>(['']); // Array of image URLs

  const handleAddImage = () => setImages([...images, '']);
  const handleRemoveImage = (index: number) => setImages(images.filter((_, i) => i !== index));
  const handleImageChange = (index: number, value: string) => {
    const newImages = [...images];
    newImages[index] = value;
    setImages(newImages);
  };

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
        imageUrl: images.find(img => img.trim() !== '') || null, // Keep first image as primary imageUrl for backward compatibility
        images: images.filter(img => img.trim() !== ''), // Pass valid images
        model3dUrl: formData.model3dUrl || null,
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

        <div>
          <label className="block text-sm font-medium mb-2">3D Model URL (.glb / .gltf) - Optional</label>
          <input 
            type="text" 
            className="w-full p-3 bg-slate-700 rounded border border-slate-600 focus:border-blue-500 outline-none"
            placeholder="https://example.com/model.glb"
            onChange={(e) => setFormData({...formData, model3dUrl: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Product Images (URLs)</label>
          {images.map((img, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input 
                type="text" 
                className="w-full p-3 bg-slate-700 rounded border border-slate-600 focus:border-blue-500 outline-none"
                placeholder="https://example.com/image.jpg"
                value={img}
                onChange={(e) => handleImageChange(index, e.target.value)}
              />
              {images.length > 1 && (
                <button 
                  type="button" 
                  onClick={() => handleRemoveImage(index)}
                  className="px-4 bg-red-600 hover:bg-red-700 rounded text-white font-bold"
                >
                  X
                </button>
              )}
            </div>
          ))}
          <button 
            type="button" 
            onClick={handleAddImage}
            className="px-4 py-2 mt-2 bg-slate-600 hover:bg-slate-500 rounded text-sm text-white transition-colors"
          >
            + Add Another Image URL
          </button>
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