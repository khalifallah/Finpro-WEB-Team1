'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProductResponse } from '@/types/product.types';
import { productService } from '@/services/productService';

interface FormData {
  name: string;
  description: string;
  price: number;
  categoryId: number;
  productImages: File[];
}

interface Category {
  id: number;
  name: string;
}

export default function CreateProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');

  const [categories, setCategories] = useState<Category[]>([]);
  const [imagePreview, setImagePreview] = useState<string[]>([]);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    price: 0,
    categoryId: 0,
    productImages: [],
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

      const response = await fetch(`${apiUrl}/categories`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch categories');

      const data = await response.json();

      let categoriesData: Category[] = [];

      if (Array.isArray(data)) {
        categoriesData = data;
      } else if (data?.data && Array.isArray(data.data)) {
        categoriesData = data.data;
      } else if (data?.categories && Array.isArray(data.categories)) {
        categoriesData = data.categories;
      }

      setCategories(categoriesData);
    } catch (err: any) {
      console.error('Failed to fetch categories:', err);
      setError('Failed to load categories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length > 5) {
      setError('Maximum 5 images allowed');
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
      setFormData({ ...formData, productImages: files });
      setError(''); // Clear error when images are selected
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name.trim()) {
      setError('Product name is required');
      return;
    }
    if (formData.price <= 0) {
      setError('Price must be greater than 0');
      return;
    }
    if (formData.categoryId === 0) {
      setError('Please select a category');
      return;
    }
    if (formData.productImages.length === 0) {
      setError('At least one image is required');
      return;
    }

    try {
      setSubmitLoading(true);

      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', String(formData.price));
      formDataToSend.append('categoryId', String(formData.categoryId));

      // Add images
      formData.productImages.forEach((file) => {
        formDataToSend.append('images', file);
      });

      await productService.createProduct(formDataToSend);
      router.push('/admin/products');
    } catch (err: any) {
      setError(err.message || 'Failed to create product');
      console.error('Error creating product:', err);
    } finally {
      setSubmitLoading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = formData.productImages.filter((_, i) => i !== index);
    const newPreviews = imagePreview.filter((_, i) => i !== index);
    setFormData({ ...formData, productImages: newImages });
    setImagePreview(newPreviews);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Create New Product</h1>
          <p className="text-lg text-gray-600">Add a new product to the catalog</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 alert alert-error gap-3 rounded-lg border border-red-300 bg-red-50 shadow-sm">
            <svg
              className="stroke-current shrink-0 h-6 w-6 text-red-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm font-medium text-red-800">{error}</span>
          </div>
        )}

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="p-8 space-y-8">
            {/* Product Name Section */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Product Name
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter product name (e.g., Organic Coffee Beans)"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 bg-white placeholder-gray-400 transition-colors"
                required
              />
            </div>

            {/* Description Section */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Description
              </label>
              <textarea
                placeholder="Enter product description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 bg-white placeholder-gray-400 transition-colors resize-none"
                rows={4}
              />
            </div>

            {/* Price & Category Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Price */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Price (IDR)
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={formData.price}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setFormData({ ...formData, price: value ? Number(value) : 0 });
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 bg-white placeholder-gray-400 transition-colors"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Category
                  <span className="text-red-500 ml-1">*</span>
                </label>
                {loading ? (
                  <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center gap-2">
                    <span className="loading loading-spinner loading-sm"></span>
                    <span className="text-sm text-gray-600">Loading categories...</span>
                  </div>
                ) : (
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: Number(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 bg-white transition-colors"
                    required
                  >
                    <option value={0} disabled>
                      Select a category
                    </option>
                    {categories.length > 0 ? (
                      categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))
                    ) : (
                      <option disabled>No categories available</option>
                    )}
                  </select>
                )}
              </div>
            </div>

            {/* Product Images Section */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Product Images
                <span className="text-red-500 ml-1">*</span>
                <span className="text-xs font-normal text-gray-500 ml-2">
                  PNG, JPG, GIF up to 5MB (Max 5 files)
                </span>
              </label>

              {/* Upload Area */}
              <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-lg p-8 cursor-pointer hover:border-primary hover:bg-blue-50 transition-all duration-200">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  required={formData.productImages.length === 0}
                />
                <svg
                  className="w-12 h-12 text-gray-400 mb-3"
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
                <p className="mb-1 text-sm font-semibold text-gray-900">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
              </label>

              {/* Image Preview */}
              {imagePreview.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm font-semibold text-gray-900 mb-4">
                    Preview ({imagePreview.length})
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
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
                          onClick={() => removeImage(idx)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                          title="Remove image"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="px-8 py-6 border-t border-gray-200 bg-gray-50 flex gap-4 justify-end">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={submitLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-focus transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              disabled={submitLoading || loading}
            >
              {submitLoading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Creating...
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Create Product
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}