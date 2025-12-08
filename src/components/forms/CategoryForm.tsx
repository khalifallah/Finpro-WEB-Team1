'use client';

import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import FormField from './FormField';
import {
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CategoryResponse,
} from '@/types/product.types';

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .required('Category name is required')
    .min(3, 'Category name must be at least 3 characters')
    .max(50, 'Category name must not exceed 50 characters'),
});

interface CategoryFormProps {
  onSubmit: (data: CreateCategoryRequest | UpdateCategoryRequest) => Promise<void>;
  initialData?: CategoryResponse;
  loading?: boolean;
}

export default function CategoryForm({
  onSubmit,
  initialData,
  loading = false,
}: CategoryFormProps) {
  const initialValues = {
    name: initialData?.name || '',
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">
        {initialData ? 'Edit Category' : 'Create New Category'}
      </h2>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={async (values) => {
          await onSubmit(values);
        }}
      >
        {({ errors, touched, isSubmitting }) => (
          <Form className="space-y-6">
            {/* Category Name */}
            <FormField
              label="Category Name"
              name="name"
              error={errors.name}
              touched={touched.name}
              required
              hint="Choose a unique category name"
            >
              <Field
                as="input"
                type="text"
                name="name"
                placeholder="e.g., Electronics, Clothing, Food"
                className="input input-bordered w-full"
              />
            </FormField>

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
                  'Update Category'
                ) : (
                  'Create Category'
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