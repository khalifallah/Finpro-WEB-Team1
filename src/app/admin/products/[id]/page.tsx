'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { productService } from '@/services/productService';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: { id: number; name: string };
  productImages: { id: number; imageUrl: string }[];
}

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    categoryId: 0,
  });
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  
  // ✅ ADD: Image upload state
  const [newImages, setNewImages] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string[]>([]);

  const productId = params.id as string;
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  useEffect(() => {
    if (authLoading) return;

    setAuthChecked(true);

    if (!user) {
      router.replace('/login');
      return;
    }

    if (user.role !== 'SUPER_ADMIN') {
      alert('Only Super Admin can edit products');
      router.replace('/admin/products');
      return;
    }

    fetchProduct();
    fetchCategories();
  }, [authLoading, user, productId, router]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const data = await productService.getProductById(Number(productId));

      if (!data) {
        throw new Error('Product not found');
      }

      setProduct(data);
      setFormData({
        name: data.name || '',
        description: data.description || '',
        price: data.price || 0,
        categoryId: data.category?.id || 0,
      });
    } catch (error) {
      console.error('Failed to fetch product:', error);
      alert('Product not found');
      router.push('/admin/products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const result = await productService.getCategories();
      
      let categoriesData: { id: number; name: string }[] = [];
      
      if (Array.isArray(result)) {
        categoriesData = result;
      } else if (result?.data && Array.isArray(result.data)) {
        categoriesData = result.data;
      } else if (result?.categories && Array.isArray(result.categories)) {
        categoriesData = result.categories;
      }
      
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setCategories([]);
    }
  };

  // ✅ ADD: Handle image change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length > 5) {
      alert('Maximum 5 images allowed');
      return;
    }

    const previews = files.map((file) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(previews).then((results) => {
      setImagePreview(results);
      setNewImages(files);
    });
  };

  // ✅ ADD: Remove new image
  const removeNewImage = (index: number) => {
    const newImagesFiltered = newImages.filter((_, i) => i !== index);
    const newPreviewsFiltered = imagePreview.filter((_, i) => i !== index);
    setNewImages(newImagesFiltered);
    setImagePreview(newPreviewsFiltered);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isSuperAdmin) {
      alert('Only Super Admin can edit products');
      return;
    }

    try {
      setSaving(true);

      // ✅ UPDATE: Check if we have new images
      if (newImages.length > 0) {
        // Use FormData for update with images
        const formDataToSend = new FormData();
        formDataToSend.append('name', formData.name);
        formDataToSend.append('description', formData.description);
        formDataToSend.append('price', String(formData.price));
        formDataToSend.append('categoryId', String(formData.categoryId));

        newImages.forEach((file) => {
          formDataToSend.append('images', file);
        });

        await productService.updateProduct(Number(productId), formDataToSend);
      } else {
        // No new images, use JSON
        await productService.updateProduct(Number(productId), formData);
      }

      alert('Product updated successfully!');
      router.push('/admin/products');
    } catch (error: any) {
      console.error('Failed to save product:', error);
      alert(error.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !authChecked) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="text-gray-600 mt-4">Checking permissions...</p>
      </div>
    );
  }

  if (loading && isSuperAdmin) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="text-gray-600 mt-4">Loading product...</p>
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-sm border border-gray-200">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">Only Super Admin can edit products</p>
          <Link href="/admin/products" className="btn btn-primary">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-sm border border-gray-200">
          <div className="text-6xl mb-4">📦</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h1>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist</p>
          <Link href="/admin/products" className="btn btn-primary">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link href="/admin/products" className="btn btn-ghost btn-sm gap-1 mb-4">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Products
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
        <p className="text-gray-600 mt-2">Update product: {product.name}</p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Product Name */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold text-gray-900">Product Name</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter product name"
              className="input input-bordered text-gray-900 bg-white"
              required
            />
          </div>

          {/* Description */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold text-gray-900">Description</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter product description"
              className="textarea textarea-bordered text-gray-900 bg-white h-24"
            />
          </div>

          {/* Price & Category Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Price */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold text-gray-900">Price (IDR)</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={formData.price}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  setFormData({ ...formData, price: value ? Number(value) : 0 });
                }}
                placeholder="0"
                className="input input-bordered text-gray-900 bg-white"
                required
              />
            </div>

            {/* Category */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold text-gray-900">Category</span>
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: parseInt(e.target.value) })}
                className="select select-bordered text-gray-900 bg-white"
                required
              >
                <option value="">Select category</option>
                {Array.isArray(categories) && categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Current Stock Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Current Stock:</span> {product.stock} units
            </p>
            <p className="text-xs text-gray-600 mt-1">
              To manage stock, use the Stock Management page
            </p>
          </div>

          {/* Current Product Images */}
          {product.productImages && product.productImages.length > 0 && (
            <div>
              <label className="label">
                <span className="label-text font-semibold text-gray-900">Current Images</span>
              </label>
              <div className="grid grid-cols-4 gap-3">
                {product.productImages.map((img) => (
                  <div
                    key={img.id}
                    className="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-300"
                  >
                    <img src={img.imageUrl} alt="Product" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ✅ ADD: Upload New Images */}
          <div>
            <label className="label">
              <span className="label-text font-semibold text-gray-900">
                Upload New Images
                <span className="text-xs font-normal text-gray-500 ml-2">
                  (Optional - will replace existing images)
                </span>
              </span>
            </label>

            <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-primary hover:bg-blue-50 transition-all duration-200">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <svg
                className="w-10 h-10 text-gray-400 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-sm font-medium text-gray-700">Click to upload new images</p>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB (Max 5 files)</p>
            </label>

            {/* New Image Preview */}
            {imagePreview.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-semibold text-gray-900 mb-3">
                  New Images Preview ({imagePreview.length})
                </p>
                <div className="grid grid-cols-4 gap-3">
                  {imagePreview.map((preview, idx) => (
                    <div key={idx} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                        <img
                          src={preview}
                          alt={`Preview ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeNewImage(idx)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                        title="Remove image"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <Link href="/admin/products" className="btn btn-ghost">
              Cancel
            </Link>
            <button type="submit" disabled={saving} className="btn btn-primary gap-2">
              {saving ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}