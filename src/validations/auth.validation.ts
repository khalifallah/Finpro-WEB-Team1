import * as yup from "yup";

// Base password validation
const passwordValidation = yup
  .string()
  .min(8, "Password must be at least 8 characters")
  .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
  .matches(/[a-z]/, "Password must contain at least one lowercase letter")
  .matches(/[0-9]/, "Password must contain at least one number")
  .matches(
    /[^a-zA-Z0-9]/,
    "Password must contain at least one special character"
  )
  .required("Password is required");

// Register validation (without password)
export const registerSchema = yup.object({
  fullName: yup
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must not exceed 100 characters")
    .required("Full name is required"),
  email: yup
    .string()
    .email("Invalid email address")
    .trim()
    .required("Email is required"),
  role: yup
    .string()
    .oneOf(["USER", "STORE_ADMIN", "SUPER_ADMIN"], "Invalid role")
    .default("USER"),
  referredBy: yup.string().optional().nullable().default(null),
});

// Infer the type from the schema
export type RegisterFormData = yup.InferType<typeof registerSchema>;

// Set password validation (for verify-email, token comes from URL)
export const setPasswordSchema = yup.object({
  password: passwordValidation,
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm password is required"),
});

export type SetPasswordFormData = yup.InferType<typeof setPasswordSchema>;

// Backend set password validation (includes token)
export const backendSetPasswordSchema = yup.object({
  token: yup.string().required("Token is required"),
  password: passwordValidation,
});

// Login validation
export const loginSchema = yup.object({
  email: yup
    .string()
    .email("Invalid email address")
    .trim()
    .required("Email is required"),
  password: yup.string().required("Password is required"),
});

export type LoginFormData = yup.InferType<typeof loginSchema>;

// Change password validation
export const changePasswordSchema = yup.object({
  currentPassword: yup.string().required("Current password is required"),
  newPassword: passwordValidation,
  confirmNewPassword: yup
    .string()
    .oneOf([yup.ref("newPassword")], "Passwords must match")
    .required("Confirm new password is required"),
});

// Reset password validation (for reset-password/confirm)
export type RequestPasswordResetFormData = yup.InferType<typeof requestPasswordResetSchema>;

// Reset password validation (for reset-password/confirm)
export const resetPasswordSchema = yup.object({
  newPassword: yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .matches(/[^a-zA-Z0-9]/, 'Password must contain at least one special character')
    .required('New password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('newPassword')], 'Passwords must match')
    .required('Confirm password is required'),
});

export type ResetPasswordFormData = yup.InferType<typeof resetPasswordSchema>;

// Backend reset password validation (includes token)
export const backendResetPasswordSchema = yup.object({
  token: yup.string().required("Token is required"),
  newPassword: passwordValidation,
});

// Request password reset validation
export const requestPasswordResetSchema = yup.object({
  email: yup
    .string()
    .email("Invalid email address")
    .required("Email is required"),
});

// Email update validation
export const emailUpdateSchema = yup.object({
  email: yup
    .string()
    .email("Invalid email address")
    .required("New email is required"),
  currentPassword: yup
    .string()
    .required("Current password is required for email change"),
});

// Google auth validation
export const googleAuthSchema = yup.object({
  idToken: yup.string().required("Google ID token is required"),
});

// Set social password validation
export const setSocialPasswordSchema = yup.object({
  password: passwordValidation,
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm password is required"),
});
