'use client';

import { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  name: string;
  error?: string;
  touched?: boolean;
  children: ReactNode;
  required?: boolean;
  hint?: string;
}

export default function FormField({
  label,
  name,
  error,
  touched,
  children,
  required = false,
  hint,
}: FormFieldProps) {
  const hasError = touched && error;

  return (
    <div className="form-control w-full">
      <label className="label" htmlFor={name}>
        <span className="label-text font-semibold">
          {label} {required && <span className="text-error">*</span>}
        </span>
      </label>

      {children}

      {hint && !hasError && (
        <label className="label">
          <span className="label-text-alt text-gray-500">{hint}</span>
        </label>
      )}

      {hasError && (
        <label className="label">
          <span className="label-text-alt text-error">{error}</span>
        </label>
      )}
    </div>
  );
}