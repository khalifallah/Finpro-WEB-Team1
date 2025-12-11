'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import FormField from './FormField';
import ImageUpload from './ImageUpload';

interface Category {
  id: number;
  name: string;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  categoryId: number;
  images?: File[];
  existingImages?: { id: number; imageUrl: string }[];
}

interface ProductFormProps {
  mode: 'create' | 'edit';
  initialData?: ProductFormData;
  currentStock?: number;
  onSubmit: (data: ProductFormData) => Promise<void>;
  isSubmitting?: boolean;
}

export default function ProductForm({
  mode,
  initialData,
  currentStock,
  onSubmit,
  isSubmitting = false,
}: ProductFormProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    price: initialData?.price || 0,
    categoryId: initialData?.categoryId || 0,
    images: [],
    existingImages: initialData?.existingImages || [],
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/categories`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories || data || []);
        }
      } catch (error) {
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'Please select a category';
    }

    if (mode === 'create' && (!formData.images || formData.images.length === 0)) {
      newErrors.images = 'At least one product image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    await onSubmit(formData);
  };

  // Handle image change
  const handleImageChange = (files: File[]) => {
    setFormData({ ...formData, images: files });
    if (errors.images) {
      setErrors({ ...errors, images: '' });
    }
  };

  // Handle remove existing image
  const handleRemoveExistingImage = (imageId: number) => {
    setFormData({
      ...formData,
      existingImages: formData.existingImages?.filter((img) => img.id !== imageId),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Product Name */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-semibold text-gray-900">
            Product Name <span className="text-error">*</span>
          </span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => {
            setFormData({ ...formData, name: e.target.value });
            if (errors.name) setErrors({ ...errors, name: '' });
          }}
          placeholder="Enter product name"
          className={`input input-bordered text-gray-900 bg-white ${
            errors.name ? 'input-error' : ''
          }`}
        />
        {errors.name && (
          <label className="label">
            <span className="label-text-alt text-error">{errors.name}</span>
          </label>
        )}
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
          rows={4}
        />
      </div>

      {/* Price & Category Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Price */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold text-gray-900">
              Price (IDR) <span className="text-error">*</span>
            </span>
          </label>
          <input
            type="number"
            value={formData.price || ''}
            onChange={(e) => {
              setFormData({ ...formData, price: parseInt(e.target.value) || 0 });
              if (errors.price) setErrors({ ...errors, price: '' });
            }}
            placeholder="0"
            className={`input input-bordered text-gray-900 bg-white ${
              errors.price ? 'input-error' : ''
            }`}
            min="0"
          />
          {errors.price && (
            <label className="label">
              <span className="label-text-alt text-error">{errors.price}</span>
            </label>
          )}
        </div>

        {/* Category */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold text-gray-900">
              Category <span className="text-error">*</span>
            </span>
          </label>
          <select
            value={formData.categoryId || ''}
            onChange={(e) => {
              setFormData({ ...formData, categoryId: parseInt(e.target.value) || 0 });
              if (errors.categoryId) setErrors({ ...errors, categoryId: '' });
            }}
            className={`select select-bordered text-gray-900 bg-white ${
              errors.categoryId ? 'select-error' : ''
            }`}
          >
            <option value="">
              {loadingCategories ? 'Loading categories...' : 'Select category'}
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <label className="label">
              <span className="label-text-alt text-error">{errors.categoryId}</span>
            </label>
          )}
        </div>
      </div>

      {/* Current Stock Info (Edit Mode Only) */}
      {mode === 'edit' && currentStock !== undefined && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Current Stock:</span> {currentStock} units
          </p>
          <p className="text-xs text-gray-600 mt-1">
            To manage stock, use the{' '}
            <Link href="/admin/stocks" className="text-primary hover:underline">
              Stock Management
            </Link>{' '}
            page
          </p>
        </div>
      )}

      {/* Existing Images (Edit Mode) */}
      {mode === 'edit' && formData.existingImages && formData.existingImages.length > 0 && (
        <div>
          <label className="label">
            <span className="label-text font-semibold text-gray-900">Current Images</span>
          </label>
          <div className="grid grid-cols-4 gap-3">
            {formData.existingImages.map((img) => (
              <div
                key={img.id}
                className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-300 group"
              >
                <img
                  src={img.imageUrl}
                  alt="Product"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveExistingImage(img.id)}
                  className="absolute top-1 right-1 btn btn-circle btn-xs btn-error opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image Upload */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-semibold text-gray-900">
            {mode === 'create' ? 'Product Images' : 'Add New Images'}
            {mode === 'create' && <span className="text-error"> *</span>}
          </span>
        </label>
        <ImageUpload
          onImagesSelected={handleImageChange}
          maxFiles={5}
        />
        {errors.images && (
          <label className="label">
            <span className="label-text-alt text-error">{errors.images}</span>
          </label>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
        <Link href="/admin/products" className="btn btn-ghost">
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary gap-2"
        >
          {isSubmitting ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              {mode === 'create' ? 'Creating...' : 'Saving...'}
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {mode === 'create' ? 'Create Product' : 'Save Changes'}
            </>
          )}
        </button>
      </div>
    </form>
  );
}