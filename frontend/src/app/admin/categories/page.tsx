'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/axios';

export default function ManageCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  
  // States for Category Form
  const [catName, setCatName] = useState('');
  
  // States for Subcategory Form
  const [subName, setSubName] = useState('');
  const [selectedParentId, setSelectedParentId] = useState('');

  const fetchCats = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  };

  useEffect(() => { fetchCats(); }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/categories', { name: catName });
      setCatName('');
      fetchCats();
      alert("Category added successfully!");
    } catch (err) {
      alert("Error adding category");
    }
  };

  const handleAddSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParentId) return alert("Please select a parent category!");
    
    try {
      await api.post('/categories/sub', { 
        name: subName, 
        categoryId: parseInt(selectedParentId) 
      });
      setSubName('');
      fetchCats();
      alert("Subcategory linked successfully!");
    } catch (err) {
      alert("Error adding subcategory");
    }
  };

  return (
    <div className="p-10 bg-slate-900 min-h-screen text-white">
      <h1 className="text-4xl font-extrabold mb-10 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
        Inventory Architecture
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 1. ADD CATEGORY FORM */}
        <div className="space-y-6">
          <form onSubmit={handleAddCategory} className="bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-700">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
              New Category
            </h2>
            <input 
              type="text" required value={catName}
              onChange={(e) => setCatName(e.target.value)}
              placeholder="e.g., Living Room"
              className="w-full p-3 bg-slate-900 rounded-lg mb-4 outline-none border border-slate-700 focus:border-blue-500 transition-all"
            />
            <button className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-bold transition-colors">
              Create Category
            </button>
          </form>

          {/* 2. ADD SUBCATEGORY FORM */}
          <form onSubmit={handleAddSubcategory} className="bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-700">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
              New Subcategory
            </h2>
            <select 
              required value={selectedParentId}
              onChange={(e) => setSelectedParentId(e.target.value)}
              className="w-full p-3 bg-slate-900 rounded-lg mb-4 outline-none border border-slate-700 focus:border-emerald-500"
            >
              <option value="">Choose Parent...</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <input 
              type="text" required value={subName}
              onChange={(e) => setSubName(e.target.value)}
              placeholder="e.g., Sofas"
              className="w-full p-3 bg-slate-900 rounded-lg mb-4 outline-none border border-slate-700 focus:border-emerald-500"
            />
            <button className="w-full bg-emerald-600 hover:bg-emerald-700 py-3 rounded-lg font-bold transition-colors">
              Link Subcategory
            </button>
          </form>
        </div>

        {/* 3. LIVE HIERARCHY VIEW */}
        <div className="lg:col-span-2 bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-700">
          <h2 className="text-2xl font-bold mb-6">Existing Structure</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map(cat => (
              <div key={cat.id} className="p-5 bg-slate-900 rounded-xl border border-slate-700 hover:border-slate-500 transition-all">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-bold text-blue-400">{cat.name}</h3>
                  <span className="text-[10px] uppercase tracking-widest text-slate-500 bg-slate-800 px-2 py-1 rounded">ID: {cat.id}</span>
                </div>
                <div className="space-y-2">
                  {cat.subcategories?.map((sub: any) => (
                    <div key={sub.id} className="text-sm text-slate-300 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                      {sub.name}
                    </div>
                  ))}
                  {(!cat.subcategories || cat.subcategories.length === 0) && (
                    <p className="text-xs text-slate-600 italic">No subcategories linked</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}