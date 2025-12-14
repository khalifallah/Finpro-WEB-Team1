'use client';

import { useState } from 'react';
import { Formik, Form, Field, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import FormField from './FormField';
import {
  CreateDiscountRuleRequest,
  UpdateDiscountRuleRequest,
  DiscountRuleResponse,
} from '@/types/discount.types';

type DiscountType = 'BOGO' | 'DIRECT_PERCENTAGE' | 'DIRECT_NOMINAL';

const validationSchema = Yup.object().shape({
  productId: Yup.number()
    .typeError('Please select a valid product')
    .required('Please select a product'),
  description: Yup.string()
    .required('Description is required')
    .min(5, 'Description must be at least 5 characters'),
  type: Yup.string()
    .required('Discount type is required')
    .oneOf(['BOGO', 'DIRECT_PERCENTAGE', 'DIRECT_NOMINAL'], 'Invalid discount type'),
  value: Yup.number()
    .typeError('Value must be a number'),
  minPurchase: Yup.number()
    .typeError('Min purchase must be a number'),
  maxDiscountAmount: Yup.number()
    .typeError('Max discount must be a number'),
});

interface DiscountFormProps {
  onSubmit: (data: CreateDiscountRuleRequest | UpdateDiscountRuleRequest) => Promise<void>;
  initialData?: DiscountRuleResponse;
  products?: Array<{ id: number; name: string }>;
  loading?: boolean;
  isUpdate?: boolean;
}

export default function DiscountForm({
  onSubmit,
  initialData,
  products = [],
  loading = false,
  isUpdate = false,
}: DiscountFormProps) {
  // Gunakan type DiscountType untuk state
  const [discountType, setDiscountType] = useState<DiscountType>(
    (initialData?.type as DiscountType) || 'BOGO'
  );

  const initialValues = {
    productId: initialData?.productId || '',
    description: initialData?.description || '',
    type: initialData?.type || 'BOGO',
    value: initialData?.value || '',
    minPurchase: initialData?.minPurchase || '',
    maxDiscountAmount: initialData?.maxDiscountAmount || '',
  };

  const discountTypeInfo: Record<DiscountType, string> = {
    BOGO: 'Buy One Get One - Offer free item',
    DIRECT_PERCENTAGE: 'Discount by percentage (e.g., 20%)',
    DIRECT_NOMINAL: 'Discount by fixed amount (e.g., Rp 10.000)',
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">
        {isUpdate ? 'Edit Discount' : 'Create New Discount'}
      </h2>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={async (values) => {
          // ✅ FIX: Convert string values to numbers
          const formData: CreateDiscountRuleRequest | UpdateDiscountRuleRequest = {
            productId: values.productId ? Number(values.productId) : undefined,
            description: values.description,
            type: values.type as DiscountType,
            value: values.value ? Number(values.value) : undefined,
            minPurchase: values.minPurchase ? Number(values.minPurchase) : undefined,
            maxDiscountAmount: values.maxDiscountAmount ? Number(values.maxDiscountAmount) : undefined,
          };
          await onSubmit(formData);
        }}
      >
        {({ errors, touched, isSubmitting, values }) => (
          <Form className="space-y-6">
            {/* Product */}
            <FormField
              label="Product"
              name="productId"
              error={errors.productId}
              touched={touched.productId}
              required
            >
              <Field
                as="select"
                name="productId"
                className="select select-bordered w-full"
              >
                <option value="" disabled>
                  Select product
                </option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </Field>
            </FormField>

            {/* Description */}
            <FormField
              label="Description"
              name="description"
              error={errors.description}
              touched={touched.description}
              required
              hint="e.g., Weekend Special Sale, Member Promo"
            >
              <Field
                as="textarea"
                name="description"
                placeholder="Enter discount description"
                className="textarea textarea-bordered w-full"
                rows="3"
              />
            </FormField>

            {/* Discount Type */}
            <FormField
              label="Discount Type"
              name="type"
              error={errors.type}
              touched={touched.type}
              required
            >
              <Field
                as="select"
                name="type"
                className="select select-bordered w-full"
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  // ✅ FIX: Cast value to DiscountType
                  setDiscountType(e.target.value as DiscountType);
                }}
              >
                <option value="BOGO">BOGO (Buy One Get One)</option>
                <option value="DIRECT_PERCENTAGE">Direct Percentage</option>
                <option value="DIRECT_NOMINAL">Direct Nominal</option>
              </Field>
              <p className="text-xs text-gray-500 mt-2">
                {discountTypeInfo[values.type as DiscountType]}
              </p>
            </FormField>

            {/* Value */}
            {discountType !== 'BOGO' && (
              <FormField
                label={
                  discountType === 'DIRECT_PERCENTAGE'
                    ? 'Discount Percentage (%)'
                    : 'Discount Amount (Rp)'
                }
                name="value"
                error={errors.value}
                touched={touched.value}
                required
              >
                <Field
                  as="input"
                  type="number"
                  name="value"
                  placeholder={
                    discountType === 'DIRECT_PERCENTAGE'
                      ? 'e.g., 20'
                      : 'e.g., 10000'
                  }
                  className="input input-bordered w-full"
                  min="0"
                />
              </FormField>
            )}

            {/* Minimum Purchase */}
            <FormField
              label="Minimum Purchase (Rp)"
              name="minPurchase"
              error={errors.minPurchase}
              touched={touched.minPurchase}
              hint="Leave empty for no minimum"
            >
              <Field
                as="input"
                type="number"
                name="minPurchase"
                placeholder="e.g., 50000"
                className="input input-bordered w-full"
                min="0"
              />
            </FormField>

            {/* Maximum Discount Amount */}
            {discountType === 'DIRECT_PERCENTAGE' && (
              <FormField
                label="Maximum Discount Amount (Rp)"
                name="maxDiscountAmount"
                error={errors.maxDiscountAmount}
                touched={touched.maxDiscountAmount}
                required
                hint="Maximum discount that can be applied"
              >
                <Field
                  as="input"
                  type="number"
                  name="maxDiscountAmount"
                  placeholder="e.g., 100000"
                  className="input input-bordered w-full"
                  min="0"
                />
              </FormField>
            )}

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
                    {isUpdate ? 'Updating...' : 'Creating...'}
                  </>
                ) : isUpdate ? (
                  'Update Discount'
                ) : (
                  'Create Discount'
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