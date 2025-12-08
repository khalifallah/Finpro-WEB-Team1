'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import ProductForm, { ProductFormData } from '@/components/forms/ProductForm';

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
  const { isSuperAdmin, isAuthenticated, isLoading: authLoading } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Role-based protection
  useEffect(() => {
    if (!authLoading && isAuthenticated && !isSuperAdmin) {
      alert('Only Super Admin can edit products');
      router.replace('/admin/products');
      return;
    }

    if (!authLoading && isSuperAdmin) {
      fetchProduct();
    }
  }, [authLoading, isAuthenticated, isSuperAdmin, router]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/products/${params.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.ok) {
        throw new Error('Product not found');
      }

      const data = await response.json();
      setProduct(data);
    } catch (error) {
      console.error('Failed to fetch product:', error);
      alert('Product not found');
      router.push('/admin/products');
    } finally {
      setLoading(false);
    }
  };

  // Handle form submit
  const handleSubmit = async (data: ProductFormData) => {
    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('price', String(data.price));
      formData.append('categoryId', String(data.categoryId));

      // Append new images if any
      if (data.images && data.images.length > 0) {
        data.images.forEach((image) => {
          formData.append('images', image);
        });
      }

      // Send IDs of images to keep
      if (data.existingImages) {
        formData.append(
          'keepImageIds',
          JSON.stringify(data.existingImages.map((img) => img.id))
        );
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/products/${params.id}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (response.ok) {
        alert('Product updated successfully!');
        router.push('/admin/products');
      } else if (response.status === 403) {
        alert('You do not have permission to edit this product');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to update product');
      }
    } catch (error) {
      console.error('Failed to save product:', error);
      alert('Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  // Access denied
  if (!isSuperAdmin) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-sm border border-gray-200">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            Only Super Admin can edit products
          </p>
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
          <p className="text-gray-600 mb-6">
            The product you're looking for doesn't exist
          </p>
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

      {/* Form Card - Reusing ProductForm Component ✅ */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <ProductForm
          mode="edit"
          initialData={{
            name: product.name,
            description: product.description,
            price: product.price,
            categoryId: product.category?.id || 0,
            existingImages: product.productImages,
          }}
          currentStock={product.stock}
          onSubmit={handleSubmit}
          isSubmitting={submitting}
        />
      </div>
    </div>
  );
}