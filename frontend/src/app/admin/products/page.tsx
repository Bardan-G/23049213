'use client';
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Plus, Trash2 } from "lucide-react";

export default function AdminProductsPage() {
  const { data: session } = useSession();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null); // Track editing state
  const [errorMessage, setErrorMessage] = useState('');

  interface VariantData {
    colorName: string;
    colorHex: string;
    imageUrl: string;
  }

  const [formData, setFormData] = useState({
    name: '', description: '', price: '', stock: '', imageUrl: '', model3dUrl: '', categoryId: 1, subcategoryId: 1, variants: [] as VariantData[]
  });
  const [useFileUpload, setUseFileUpload] = useState(false);

  const [categories, setCategories] = useState<any[]>([]);

  const fetchProducts = () => {
    api.get('/products').then(res => setProducts(res.data)).finally(() => setLoading(false));
  };

  const fetchCategories = () => {
    api.get('/categories').then(res => setCategories(res.data));
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // ... (existing code)

  <div className="flex gap-2">
    <select
      className="border p-2 rounded"
      value={formData.categoryId}
      onChange={e => setFormData({ ...formData, categoryId: Number(e.target.value), subcategoryId: Number(e.target.value) })} // meaningful subcategory logic requires more work, keeping safe default
    >
      {categories.length > 0 ? (
        categories.map((cat: any) => (
          <option key={cat.id} value={cat.id}>{cat.name}</option>
        ))
      ) : (
        <option value={1}>Loading Categories...</option>
      )}
    </select>
  </div>

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    try {
      await api.delete(`/products/${id}`, {
        headers: { Authorization: `Bearer ${session?.accessToken}` }
      });
      fetchProducts();
    } catch (error) {
      alert("Failed to delete product");
    }
  };

  const startEdit = (product: any) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      imageUrl: product.imageUrl,
      model3dUrl: product.model3dUrl || '',
      categoryId: product.categoryId || 1, // You might want to get this from product if available
      subcategoryId: product.subcategoryId || 1,
      variants: product.variants || []
    });
    setShowForm(true);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', description: '', price: '', stock: '', imageUrl: '', model3dUrl: '', categoryId: 1, subcategoryId: 1, variants: [] });
    setUseFileUpload(false);
    setErrorMessage('');
    setShowForm(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, variantIndex?: number) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert("Image exceeds 5MB size limit. Please upload a smaller image.");
        e.target.value = ''; // Reset input
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof variantIndex === 'number') {
          const newVariants = [...formData.variants];
          newVariants[variantIndex].imageUrl = reader.result as string;
          setFormData({ ...formData, variants: newVariants });
        } else {
          setFormData({ ...formData, imageUrl: reader.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const addVariant = () => {
    setFormData({ ...formData, variants: [...formData.variants, { colorName: '', colorHex: '#000000', imageUrl: '' }] });
  };

  const updateVariant = (index: number, field: keyof VariantData, value: string) => {
    const newVariants = [...formData.variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setFormData({ ...formData, variants: newVariants });
  };

  const removeVariant = (index: number) => {
    setFormData({ ...formData, variants: formData.variants.filter((_, i) => i !== index) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock),
        categoryId: Number(formData.categoryId),
        subcategoryId: Number(formData.subcategoryId)
      };

      const config = { headers: { Authorization: `Bearer ${session?.accessToken}` } };

      if (editingId) {
        await api.patch(`/products/${editingId}`, payload, config);
      } else {
        await api.post('/products/add', payload, config);
      }

      cancelEdit();
      fetchProducts();
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || `Failed to ${editingId ? 'update' : 'create'} product`;
      setErrorMessage(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Products</h1>
        <button
          onClick={() => { cancelEdit(); setShowForm(!showForm); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={20} /> Add Product
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Product' : 'New Product'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input placeholder="Name" className="border p-2 rounded" required value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              <input placeholder="Price" type="number" className="border p-2 rounded" required value={formData.price || ''} onChange={e => setFormData({ ...formData, price: e.target.value })} />
              <input placeholder="Stock" type="number" className="border p-2 rounded" required value={formData.stock || ''} onChange={e => setFormData({ ...formData, stock: e.target.value })} />

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 mb-1">
                  <label className="text-sm text-gray-600">Image Source:</label>
                  <label className="text-xs flex items-center gap-1 cursor-pointer">
                    <input type="radio" checked={!useFileUpload} onChange={() => setUseFileUpload(false)} /> URL Linking
                  </label>
                  <label className="text-xs flex items-center gap-1 cursor-pointer">
                    <input type="radio" checked={useFileUpload} onChange={() => setUseFileUpload(true)} /> Device Upload
                  </label>
                </div>

                {useFileUpload ? (
                  <input key="file-upload" type="file" accept="image/*" className="border p-2 rounded text-sm w-full" onChange={handleImageUpload} />
                ) : (
                  <input key="image-url" placeholder="Image URL" className="border p-2 rounded w-full" value={formData.imageUrl || ''} onChange={e => setFormData({ ...formData, imageUrl: e.target.value })} />
                )}
                {useFileUpload && formData.imageUrl && formData.imageUrl.startsWith('data:image') && (
                  <p className="text-xs text-green-600 truncate py-1">✓ File ready to be uploaded</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <input placeholder="3D Model URL (.glb / .gltf)" className="border p-2 rounded w-full" value={formData.model3dUrl || ''} onChange={e => setFormData({ ...formData, model3dUrl: e.target.value })} />
                <p className="text-[10px] text-gray-500">Optional: Link to a 3D model required for the interactive viewer.</p>
              </div>
            </div>

            <textarea placeholder="Description" className="w-full border p-2 rounded" required value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} />

            {/* Colors / Variants Section */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-700 text-sm">Product Color Variants</h3>
                <button type="button" onClick={addVariant} className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded transition">
                  + Add Color
                </button>
              </div>

              {formData.variants.length === 0 ? (
                <p className="text-xs text-gray-500 italic text-center py-2">No variations. Product has a single default color.</p>
              ) : (
                <div className="space-y-3">
                  {formData.variants.map((v, i) => (
                    <div key={i} className="flex flex-col sm:flex-row gap-3 items-center border border-gray-200 p-3 rounded bg-white">
                      <input placeholder="Color Name (e.g. Matte Black)" className="border p-2 rounded text-sm flex-1" value={v.colorName} onChange={e => updateVariant(i, 'colorName', e.target.value)} required />
                      <div className="flex items-center gap-2">
                        <input type="color" value={v.colorHex} onChange={e => updateVariant(i, 'colorHex', e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
                        <span className="text-xs text-gray-400 font-mono">{v.colorHex}</span>
                      </div>
                      <div className="flex-1 w-full flex flex-col gap-1">
                        {useFileUpload ? (
                          <input type="file" accept="image/*" className="border p-1 rounded text-xs w-full" onChange={(e) => handleImageUpload(e, i)} />
                        ) : (
                          <input placeholder="Image URL for this Color" className="border p-2 rounded text-sm w-full" value={v.imageUrl} onChange={e => updateVariant(i, 'imageUrl', e.target.value)} />
                        )}
                      </div>
                      <button type="button" onClick={() => removeVariant(i)} className="text-red-500 p-2 hover:bg-red-50 rounded">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Category</label>
                <select
                  className="w-full border p-2 rounded"
                  value={formData.categoryId}
                  onChange={e => {
                    const catId = Number(e.target.value);
                    const cat = categories.find((c: any) => c.id === catId);
                    const defaultSub = cat?.subcategories?.[0]?.id || '';
                    setFormData({ ...formData, categoryId: catId, subcategoryId: defaultSub });
                  }}
                >
                  <option value="" disabled>Select Category</option>
                  {categories.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Subcategory</label>
                <select
                  className="w-full border p-2 rounded"
                  value={formData.subcategoryId || ''}
                  onChange={e => setFormData({ ...formData, subcategoryId: Number(e.target.value) })}
                  disabled={!formData.categoryId}
                >
                  <option value="" disabled>Select Subcategory</option>
                  {categories.find((c: any) => c.id === formData.categoryId)?.subcategories?.map((sub: any) => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2 items-center">
              <button type="submit" className="bg-emerald-600 text-white px-6 py-2 rounded">{editingId ? 'Update' : 'Save'} Product</button>
              <button type="button" onClick={cancelEdit} className="bg-gray-300 text-gray-700 px-6 py-2 rounded">Cancel</button>
            </div>
            {errorMessage && (
              <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
            )}
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 font-medium text-gray-500">ID</th>
              <th className="p-4 font-medium text-gray-500">Name</th>
              <th className="p-4 font-medium text-gray-500">Price</th>
              <th className="p-4 font-medium text-gray-500">Stock</th>
              <th className="p-4 font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                <td className="p-4">{product.id}</td>
                <td className="p-4 font-medium">{product.name}</td>
                <td className="p-4">Rs. {product.price}</td>
                <td className="p-4">{product.stock}</td>
                <td className="p-4 flex gap-2">
                  <button onClick={() => startEdit(product)} className="text-blue-500 hover:bg-blue-50 p-2 rounded">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(product.id)} className="text-red-500 hover:bg-red-50 p-2 rounded">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}