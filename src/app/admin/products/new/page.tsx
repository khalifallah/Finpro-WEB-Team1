'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import ProductForm, { ProductFormData } from '@/components/forms/ProductForm';

export default function CreateProductPage() {
  const router = useRouter();
  const { isSuperAdmin, isAuthenticated, isLoading } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  // Role-based protection
  useEffect(() => {
    if (!isLoading && isAuthenticated && !isSuperAdmin) {
      alert('Only Super Admin can create products');
      router.replace('/admin/products');
    }
  }, [isLoading, isAuthenticated, isSuperAdmin, router]);

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

      // Append images
      if (data.images) {
        data.images.forEach((image) => {
          formData.append('images', image);
        });
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/products`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (response.ok) {
        alert('Product created successfully!');
        router.push('/admin/products');
      } else if (response.status === 403) {
        alert('You do not have permission to create products');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to create product');
      }
    } catch (error) {
      console.error('Failed to create product:', error);
      alert('Failed to create product');
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (isLoading) {
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
            Only Super Admin can create new products
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
        <h1 className="text-3xl font-bold text-gray-900">Create New Product</h1>
        <p className="text-gray-600 mt-2">Add a new product to the catalog</p>
      </div>

      {/* Form Card - Reusing ProductForm Component ✅ */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <ProductForm
          mode="create"
          onSubmit={handleSubmit}
          isSubmitting={submitting}
        />
      </div>
    </div>
  );
}