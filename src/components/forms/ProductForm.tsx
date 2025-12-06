'use client';

import { useEffect, useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import FormField from './FormField';
import ImageUpload from './ImageUpload';
import {
  CreateProductRequest,
  UpdateProductRequest,
  ProductResponse,
  CategoryResponse,
} from '@/types/product.types';

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .required('Product name is required')
    .min(3, 'Product name must be at least 3 characters'),
  description: Yup.string()
    .required('Description is required')
    .min(10, 'Description must be at least 10 characters'),
  price: Yup.number()
    .required('Price is required')
    .positive('Price must be positive')
    .typeError('Price must be a number'),
  categoryId: Yup.number()
    .required('Category is required')
    .typeError('Please select a valid category'),
});

interface ProductFormProps {
  onSubmit: (data: CreateProductRequest | UpdateProductRequest, images?: File[]) => Promise<void>;
  initialData?: ProductResponse;
  categories: CategoryResponse[];
  loading?: boolean;
  existingImages?: Array<{ id: number; imageUrl: string }>;
}

export default function ProductForm({
  onSubmit,
  initialData,
  categories,
  loading = false,
  existingImages = [],
}: ProductFormProps) {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [removedImageIds, setRemovedImageIds] = useState<number[]>([]);

  const initialValues = {
    name: initialData?.name || '',
    description: initialData?.description || '',
    price: initialData?.price || '',
    categoryId: initialData?.category?.id || '',
  };

  const handleRemoveExistingImage = (index: number) => {
    if (existingImages[index]) {
      setRemovedImageIds((prev) => [...prev, existingImages[index].id]);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">
        {initialData ? 'Edit Product' : 'Create New Product'}
      </h2>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={async (values) => {
          const formData = {
            name: values.name,
            description: values.description,
            price: Number(values.price),
            categoryId: Number(values.categoryId),
          };

          await onSubmit(formData, selectedImages);
        }}
      >
        {({ errors, touched, isSubmitting }) => (
          <Form className="space-y-6">
            {/* Product Name */}
            <FormField
              label="Product Name"
              name="name"
              error={errors.name}
              touched={touched.name}
              required
            >
              <Field
                as="input"
                type="text"
                name="name"
                placeholder="Enter product name"
                className="input input-bordered w-full"
              />
            </FormField>

            {/* Description */}
            <FormField
              label="Description"
              name="description"
              error={errors.description}
              touched={touched.description}
              required
            >
              <Field
                as="textarea"
                name="description"
                placeholder="Enter product description"
                className="textarea textarea-bordered w-full"
                rows="4"
              />
            </FormField>

            {/* Price */}
            <FormField
              label="Price (IDR)"
              name="price"
              error={errors.price}
              touched={touched.price}
              required
            >
              <Field
                as="input"
                type="number"
                name="price"
                placeholder="Enter product price"
                className="input input-bordered w-full"
              />
            </FormField>

            {/* Category */}
            <FormField
              label="Category"
              name="categoryId"
              error={errors.categoryId}
              touched={touched.categoryId}
              required
            >
              <Field
                as="select"
                name="categoryId"
                className="select select-bordered w-full"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </Field>
            </FormField>

            {/* Image Upload */}
            <div>
              <label className="label">
                <span className="label-text font-semibold">Product Images</span>
              </label>
              <ImageUpload
                onImagesSelected={setSelectedImages}
                maxFiles={5}
                maxFileSize={5}
                previewUrls={existingImages.map((img) => img.imageUrl)}
                onRemovePreview={handleRemoveExistingImage}
              />
              {selectedImages.length === 0 && existingImages.length === 0 && (
                <p className="text-sm text-warning mt-2">
                  ⚠️ At least one image is recommended
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={loading || isSubmitting}
                className="btn btn-primary flex-1"
              >
                {loading || isSubmitting ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    {initialData ? 'Updating...' : 'Creating...'}
                  </>
                ) : initialData ? (
                  'Update Product'
                ) : (
                  'Create Product'
                )}
              </button>
              <button
                type="button"
                className="btn btn-outline flex-1"
                onClick={() => window.history.back()}
              >
                Cancel
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}