'use client';

import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import FormField from './FormField';
import { CreateUserRequest, UpdateUserRequest } from '@/types/user.types';

const createValidationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  fullName: Yup.string()
    .required('Full name is required')
    .min(3, 'Full name must be at least 3 characters'),
  password: Yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain uppercase, lowercase, and number'
    ),
  confirmPassword: Yup.string()
    .required('Confirm password is required')
    .oneOf([Yup.ref('password')], 'Passwords must match'),
  storeId: Yup.number()
    .required('Store is required')
    .typeError('Please select a valid store'),
});

const updateValidationSchema = Yup.object().shape({
  fullName: Yup.string()
    .min(3, 'Full name must be at least 3 characters'),
  email: Yup.string()
    .email('Invalid email address'),
});

interface UserFormProps {
  onSubmit: (data: CreateUserRequest | UpdateUserRequest) => Promise<void>;
  stores?: Array<{ id: number; name: string }>;
  loading?: boolean;
  isUpdate?: boolean;
  isCreateStoreAdmin?: boolean;
}

export default function UserForm({
  onSubmit,
  stores = [],
  loading = false,
  isUpdate = false,
  isCreateStoreAdmin = true,
}: UserFormProps) {
  const validationSchema = isUpdate ? updateValidationSchema : createValidationSchema;

  const initialValues = {
    email: '',
    fullName: '',
    password: '',
    confirmPassword: '',
    storeId: '',
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">
        {isUpdate ? 'Edit User' : 'Create Store Admin'}
      </h2>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={async (values) => {
          const formData: CreateUserRequest | UpdateUserRequest = isUpdate
            ? {
                fullName: values.fullName || undefined,
                email: values.email || undefined,
              }
            : {
                email: values.email,
                fullName: values.fullName,
                password: values.password,
                role: 'STORE_ADMIN',
                storeId: Number(values.storeId),
              };

          await onSubmit(formData);
        }}
      >
        {({ errors, touched, isSubmitting }) => (
          <Form className="space-y-6">
            {/* Email */}
            <FormField
              label="Email"
              name="email"
              error={errors.email}
              touched={touched.email}
              required={!isUpdate}
            >
              <Field
                as="input"
                type="email"
                name="email"
                placeholder="admin@store.com"
                className="input input-bordered w-full"
              />
            </FormField>

            {/* Full Name */}
            <FormField
              label="Full Name"
              name="fullName"
              error={errors.fullName}
              touched={touched.fullName}
              required={!isUpdate}
            >
              <Field
                as="input"
                type="text"
                name="fullName"
                placeholder="John Doe"
                className="input input-bordered w-full"
              />
            </FormField>

            {/* Store - Only show on create */}
            {!isUpdate && (
              <FormField
                label="Assign to Store"
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
            )}

            {/* Password & Confirm - Only show on create */}
            {!isUpdate && (
              <>
                {/* Password */}
                <FormField
                  label="Password"
                  name="password"
                  error={errors.password}
                  touched={touched.password}
                  required
                  hint="Minimum 8 characters, include uppercase, lowercase, and number"
                >
                  <Field
                    as="input"
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    className="input input-bordered w-full"
                  />
                </FormField>

                {/* Confirm Password */}
                <FormField
                  label="Confirm Password"
                  name="confirmPassword"
                  error={errors.confirmPassword}
                  touched={touched.confirmPassword}
                  required
                >
                  <Field
                    as="input"
                    type="password"
                    name="confirmPassword"
                    placeholder="••••••••"
                    className="input input-bordered w-full"
                  />
                </FormField>
              </>
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
                  'Update User'
                ) : (
                  'Create Store Admin'
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