'use client';

import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import FormField from './FormField';
import {
  CreateStockRequest,
  UpdateStockRequest,
  StockResponse,
} from '@/types/stock.types';

const createValidationSchema = Yup.object().shape({
  productId: Yup.number()
    .required('Product is required')
    .typeError('Please select a valid product'),
  storeId: Yup.number()
    .required('Store is required')
    .typeError('Please select a valid store'),
  quantity: Yup.number()
    .required('Quantity is required')
    .positive('Quantity must be positive')
    .integer('Quantity must be a whole number')
    .typeError('Quantity must be a number'),
  reason: Yup.string(),
});

const updateValidationSchema = Yup.object().shape({
  quantity: Yup.number()
    .required('Quantity is required')
    .typeError('Quantity must be a number'),
  reason: Yup.string()
    .required('Reason is required')
    .min(3, 'Reason must be at least 3 characters'),
});

interface StockFormProps {
  onSubmit: (data: CreateStockRequest | UpdateStockRequest) => Promise<void>;
  initialData?: StockResponse;
  products?: Array<{ id: number; name: string }>;
  stores?: Array<{ id: number; name: string }>;
  loading?: boolean;
  isUpdate?: boolean;
}

export default function StockForm({
  onSubmit,
  initialData,
  products = [],
  stores = [],
  loading = false,
  isUpdate = false,
}: StockFormProps) {
  const validationSchema = isUpdate ? updateValidationSchema : createValidationSchema;

  const initialValues = {
    productId: initialData?.productId || '',
    storeId: initialData?.storeId || '',
    quantity: initialData?.quantity || '',
    reason: '',
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">
        {isUpdate ? 'Update Stock' : 'Create New Stock'}
      </h2>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={async (values) => {
          // Convert string values to numbers
          const formData = isUpdate
            ? ({
                quantity: Number(values.quantity),
                reason: values.reason,
              } as UpdateStockRequest)
            : ({
                productId: Number(values.productId),
                storeId: Number(values.storeId),
                quantity: Number(values.quantity),
              } as CreateStockRequest);

          await onSubmit(formData);
        }}
      >
        {({ errors, touched, isSubmitting }) => (
          <Form className="space-y-6">
            {!isUpdate && (
              <>
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
                    <option value="">Select a product</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </Field>
                </FormField>

                {/* Store */}
                <FormField
                  label="Store"
                  name="storeId"
                  error={errors.storeId}
                  touched={touched.storeId}
                  required
                >
                  <Field
                    as="select"
                    name="storeId"
                    className="select select-bordered w-full"
                  >
                    <option value="">Select a store</option>
                    {stores.map((store) => (
                      <option key={store.id} value={store.id}>
                        {store.name}
                      </option>
                    ))}
                  </Field>
                </FormField>
              </>
            )}

            {/* Quantity */}
            <FormField
              label={isUpdate ? 'New Quantity' : 'Initial Quantity'}
              name="quantity"
              error={errors.quantity}
              touched={touched.quantity}
              required
              hint={isUpdate ? 'Enter the new stock quantity' : 'Enter initial stock quantity'}
            >
              <Field
                as="input"
                type="number"
                name="quantity"
                placeholder="Enter quantity"
                className="input input-bordered w-full"
                min="0"
              />
            </FormField>

            {/* Reason (for update) */}
            {isUpdate && (
              <FormField
                label="Reason for Change"
                name="reason"
                error={errors.reason}
                touched={touched.reason}
                required
                hint="e.g., Stock adjustment, Damage, Recount"
              >
                <Field
                  as="textarea"
                  name="reason"
                  placeholder="Enter reason for stock change"
                  className="textarea textarea-bordered w-full"
                  rows="3"
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
                  'Update Stock'
                ) : (
                  'Create Stock'
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