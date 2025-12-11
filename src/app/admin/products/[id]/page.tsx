'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProductEditForm from '@/components/admin/ProductEditForm';
import ProductImageManager from '@/components/admin/ProductImageManager';

interface ProductImage {
  id: number;
  imageUrl: string;
}

// add productImages property to Product interface
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  categoryId: number;
  category?: { id: number; name: string };
  images: ProductImage[];
  productImages?: ProductImage[]; // Backend returns this
  stock?: number;
}

interface Category {
  id: number;
  name: string;
}

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    categoryId: 0,
  });

  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

  const getApiUrl = () => {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      Authorization: `Bearer ${token}`,
    };
  };

  // Fetch product data
  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${getApiUrl()}/products/${productId}`, {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch product');

      const data = await response.json();

      // Handle actual backend response structure
      let productData: Product;

      // Case 1: Direct response { id, name, productImages, ... }
      if (data.id && data.productImages) {
        productData = data;
      }
      // Case 2: Wrapped { data: { product: {...} } }
      else if (data.data?.product) {
        productData = data.data.product;
      }
      // Case 3: Wrapped { data: {...} }
      else if (data.data) {
        productData = data.data;
      }
      // Case 4: Default
      else {
        productData = data;
      }

      // Use 'productImages' from backend
      const images = productData.productImages || productData.images || [];
      
      // Ensure images have correct structure
      const normalizedImages: ProductImage[] = images
        .filter((img: any) => img && img.imageUrl) // Filter out null/undefined
        .map((img: any) => ({
          id: img.id,
          imageUrl: img.imageUrl,
        }));

      // Set product with normalized images
      setProduct({
        ...productData,
        images: normalizedImages, // Convert productImages to images for component
      } as Product);

      setFormData({
        name: productData.name || '',
        description: productData.description || '',
        price: productData.price || 0,
        categoryId: productData.category?.id || 0,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${getApiUrl()}/categories`, {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch categories');

      const data = await response.json();
      const categoriesData = Array.isArray(data) ? data : data.data || data.categories || [];
      setCategories(categoriesData);
    } catch (err) {
    }
  };

  useEffect(() => {
    fetchProduct();
    fetchCategories();
  }, [productId]);

  // Handle form data change
  const handleFormChange = (updates: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  // Handle new images upload
  const handleUploadImages = (files: File[]) => {
    const previews = files.map((file) => {
      const url = URL.createObjectURL(file);
      return url;
    });
    setNewImages((prev) => [...prev, ...files]);
    setNewImagePreviews((prev) => [...prev, ...previews]);
  };

  // Remove new image before upload
  const handleRemoveNewImage = (index: number) => {
    URL.revokeObjectURL(newImagePreviews[index]);
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Delete existing image from server
  const handleDeleteImage = async (imageId: number): Promise<void> => {
    try {
      const response = await fetch(
        `${getApiUrl()}/products/${productId}/images/${imageId}?confirm=yes`,
        {
          method: 'DELETE',
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'Failed to delete image');
      }

      // Update local state - remove deleted image
      setProduct((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          images: prev.images.filter((img) => img.id !== imageId),
        };
      });

      setSuccess('Image deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete image');
      // Don't return anything - just throw error for caller to handle
      throw err;
    }
  };

  // Save changes
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

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

    try {
      setSaving(true);

      // 1. Update product data
      const updateResponse = await fetch(`${getApiUrl()}/products/${productId}`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: formData.price,
          categoryId: formData.categoryId,
        }),
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'Failed to update product');
      }

      // 2. Upload new images if any
      if (newImages.length > 0) {
        const imageFormData = new FormData();
        newImages.forEach((file, index) => {
          imageFormData.append('images', file);
        });

        const imageEndpoint = `${getApiUrl()}/products/${productId}/images`;

        const imageResponse = await fetch(imageEndpoint, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: imageFormData,
        });

        if (!imageResponse.ok) {
          const errorData = await imageResponse.json().catch(() => ({}));
          throw new Error(errorData.error || errorData.message || 'Failed to upload images');
        }

        // Clear new images after successful upload
        newImagePreviews.forEach((preview) => {
          URL.revokeObjectURL(preview);
        });
        setNewImages([]);
        setNewImagePreviews([]);
      }

      setSuccess('Product updated successfully!');
      
      // Refresh product data
      await fetchProduct();

      setTimeout(() => {
        router.push('/admin/products');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-8">
        <div className="alert alert-error">
          <span>Product not found</span>
        </div>
        <button onClick={() => router.back()} className="btn btn-primary mt-4">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <p className="text-sm text-gray-500 mb-1">Update product:</p>
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
        </div>

        {/* Alerts */}
        {error && (
          <div className="alert alert-error mb-6">
            <svg className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success mb-6">
            <svg className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{success}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="p-8 space-y-8">
              {/* Product Form Fields */}
              <ProductEditForm
                formData={formData}
                categories={categories}
                onChange={handleFormChange}
                loading={saving}
              />

              {/* Stock Info */}
              {product.stock !== undefined && (
                <div className="alert alert-info">
                  <div>
                    <span className="font-semibold">Current Stock:</span>{' '}
                    <span className="text-primary font-bold">{product.stock} units</span>
                  </div>
                  <p className="text-xs mt-1">To manage stock, use the Stock Management page</p>
                </div>
              )}

              {/* Image Manager */}
              <ProductImageManager
                existingImages={product.images || []}
                onDeleteImage={handleDeleteImage}
                onUploadImages={handleUploadImages}
                newImages={newImages}
                newImagePreviews={newImagePreviews}
                onRemoveNewImage={handleRemoveNewImage}
                maxImages={5}
                loading={saving}
              />
            </div>

            {/* Form Actions */}
            <div className="px-8 py-6 border-t border-gray-200 bg-gray-50 flex gap-4 justify-end">
              <button
                type="button"
                onClick={() => router.back()}
                className="btn btn-ghost"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary gap-2"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}