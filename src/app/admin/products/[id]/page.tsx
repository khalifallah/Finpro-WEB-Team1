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

  const productId = params.id as string;

  // Derived state - check if user is super admin
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isAuthenticated = !!user;

  // Wait for auth to fully load before checking permissions
  useEffect(() => {
    // Don't do anything while auth is still loading
    if (authLoading) {
      return;
    }

    // Auth has finished loading, now we can check
    setAuthChecked(true);

    // Not authenticated - redirect to login
    if (!user) {
      console.log('No user found, redirecting to login');
      router.replace('/login');
      return;
    }

    // Not super admin - redirect with message
    if (user.role !== 'SUPER_ADMIN') {
      console.log('User is not super admin:', user.role);
      alert('Only Super Admin can edit products');
      router.replace('/admin/products');
      return;
    }

    // User is super admin - fetch data
    console.log('User is super admin, fetching product data');
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
      
      // Robust Handling berbagai kemungkinan struktur response
      let categoriesData: { id: number; name: string }[] = [];
      
      if (Array.isArray(result)) {
        categoriesData = result;
      } else if (result?.data && Array.isArray(result.data)) {
        categoriesData = result.data;
      } else if (result?.categories && Array.isArray(result.categories)) {
        categoriesData = result.categories;
      } else if (result?.data?.categories && Array.isArray(result.data.categories)) {
        categoriesData = result.data.categories;
      }
      
      console.log('Categories loaded:', categoriesData); // Debug log
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setCategories([]); // Set empty array on error
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isSuperAdmin) {
      alert('Only Super Admin can edit products');
      return;
    }

    try {
      setSaving(true);
      await productService.updateProduct(Number(productId), formData);
      alert('Product updated successfully!');
      router.push('/admin/products');
    } catch (error: any) {
      console.error('Failed to save product:', error);
      alert(error.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  // ✅ Show loading while auth is being checked
  if (authLoading || !authChecked) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="text-gray-600 mt-4">Checking permissions...</p>
      </div>
    );
  }

  // ✅ Show loading while fetching product (after auth is confirmed)
  if (loading && isSuperAdmin) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="text-gray-600 mt-4">Loading product...</p>
      </div>
    );
  }

  // Access denied (shouldn't reach here due to redirect, but just in case)
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

  // Product not found
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
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                placeholder="0"
                className="input input-bordered text-gray-900 bg-white"
                min="0"
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
                {/* ✅ FIX: Add safety check before map */}
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

          {/* Product Images Preview */}
          {product.productImages && product.productImages.length > 0 && (
            <div>
              <label className="label">
                <span className="label-text font-semibold text-gray-900">Product Images</span>
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