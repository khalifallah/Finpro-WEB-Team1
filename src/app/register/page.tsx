"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAuth } from "@/contexts/AuthContext";
import { GoogleLogin } from "@react-oauth/google";
import {
  registerSchema,
  RegisterFormData,
} from "@/validations/auth.validation";
import {
  FaUser,
  FaEnvelope,
  FaUserTie,
  FaStore,
  FaShieldAlt,
} from "react-icons/fa";

// Role type for options
type RoleType = "USER" | "STORE_ADMIN" | "SUPER_ADMIN";

export default function RegisterPage() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { register: authRegister, googleLogin } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      role: "USER",
      referredBy: null,
    },
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError("");

    try {
      await authRegister({
        fullName: data.fullName,
        email: data.email,
        role: data.role,
        referredBy: data.referredBy || undefined,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      await googleLogin(credentialResponse.credential);
    } catch (err) {
      setError("Google login failed");
    }
  };

  const handleGoogleError = () => {
    setError("Google login failed");
  };

  const roleOptions = [
    {
      value: "USER" as RoleType,
      label: "Regular User",
      description: "Shop for groceries and manage orders",
      icon: <FaUser className="text-base-content/70" />,
    },
    {
      value: "STORE_ADMIN" as RoleType,
      label: "Store Administrator",
      description: "Manage store inventory and operations",
      icon: <FaStore className="text-base-content/70" />,
    },
    {
      value: "SUPER_ADMIN" as RoleType,
      label: "Super Administrator",
      description: "Full system access and management",
      icon: <FaShieldAlt className="text-base-content/70" />,
    },
  ];

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-gradient-to-br from-base-200 to-base-300 p-4 py-8 sm:py-12">
      <div className="card w-full max-w-md bg-base-100 shadow-2xl overflow-hidden">
        <div className="card-body p-5 sm:p-8 gap-4">
          <div className="text-center mb-2 sm:mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-2">
              Create Account
            </h1>
            <p className="text-sm sm:text-base text-base-content/70">
              Register with email. You'll set your password after verification.
            </p>
          </div>

          {error && (
            <div className="alert alert-error animate-fadeIn text-sm p-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-3 sm:space-y-4"
          >
            {/* Full Name */}
            <div className="form-control">
              <label className="label py-1" htmlFor="fullName">
                <span className="label-text font-semibold">Full Name</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="text-base-content/50" />
                </div>
                <input
                  id="fullName"
                  type="text"
                  className={`input input-bordered w-full pl-10 h-10 sm:h-12 ${
                    errors.fullName ? "input-error" : ""
                  }`}
                  placeholder="John Doe"
                  {...register("fullName")}
                />
              </div>
              {errors.fullName && (
                <label className="label py-1">
                  <span className="label-text-alt text-error">
                    {errors.fullName?.message}
                  </span>
                </label>
              )}
            </div>

            {/* Email */}
            <div className="form-control">
              <label className="label py-1" htmlFor="email">
                <span className="label-text font-semibold">Email Address</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="text-base-content/50" />
                </div>
                <input
                  id="email"
                  type="email"
                  className={`input input-bordered w-full pl-10 h-10 sm:h-12 ${
                    errors.email ? "input-error" : ""
                  }`}
                  placeholder="you@example.com"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <label className="label py-1">
                  <span className="label-text-alt text-error">
                    {errors.email?.message}
                  </span>
                </label>
              )}
            </div>

            {/* Role Selection */}
            <div className="form-control">
              <label className="label py-1" htmlFor="role">
                <span className="label-text font-semibold">Account Type</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUserTie className="text-base-content/50" />
                </div>
                <select
                  id="role"
                  className={`select select-bordered w-full pl-10 h-10 sm:h-12 min-h-[2.5rem] appearance-none ${
                    errors.role ? "select-error" : ""
                  }`}
                  {...register("role")}
                >
                  {roleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg
                    className="w-4 h-4 text-base-content/50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </div>
              </div>
              {errors.role && (
                <label className="label py-1">
                  <span className="label-text-alt text-error">
                    {errors.role?.message}
                  </span>
                </label>
              )}

              {/* Role Description */}
              <div className="mt-2 p-3 bg-base-200 rounded-lg">
                {roleOptions
                  .filter((option) => option.value === selectedRole)
                  .map((option) => (
                    <div key={option.value} className="flex items-start gap-3">
                      <div className="mt-1 shrink-0">{option.icon}</div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm sm:text-base">
                          {option.label}
                        </p>
                        <p className="text-xs sm:text-sm text-base-content/70 break-words leading-tight">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Referral Code */}
            <div className="form-control">
              <label className="label py-1" htmlFor="referredBy">
                <span className="label-text font-semibold">
                  Referral Code{" "}
                  <span className="font-normal text-base-content/60 text-xs">
                    (Optional)
                  </span>
                </span>
              </label>
              <input
                id="referredBy"
                type="text"
                className="input input-bordered h-10 sm:h-12"
                placeholder="Referral code"
                {...register("referredBy")}
              />
              {errors.referredBy && (
                <label className="label py-1">
                  <span className="label-text-alt text-error">
                    {errors.referredBy?.message}
                  </span>
                </label>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="form-control mt-2">
              <label className="label cursor-pointer justify-start gap-3 items-start">
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm mt-0.5"
                  required
                />
                <span className="label-text text-xs sm:text-sm leading-snug">
                  I agree to the{" "}
                  <Link href="/terms" className="link link-primary">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="link link-primary">
                    Privacy Policy
                  </Link>
                </span>
              </label>
            </div>

            {/* Admin Note */}
            {selectedRole !== "USER" && (
              <div className="alert alert-info text-sm p-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="stroke-current shrink-0 w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <div className="w-full">
                  <p className="font-semibold text-xs uppercase">Admin Note</p>
                  <p className="text-xs mt-1 leading-tight">
                    {selectedRole === "STORE_ADMIN"
                      ? "Requires verification via support to activate store features."
                      : "Restricted access. Contact admin for approval."}
                  </p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="form-control mt-4 sm:mt-6">
              <button
                type="submit"
                className="btn btn-primary btn-block min-h-[2.5rem] h-10 sm:h-12"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Creating...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="divider my-4 text-xs text-base-content/50">OR</div>

          {/* Google Login Container */}
          <div className="space-y-3">
            <div className="flex justify-center w-full overflow-hidden">
              <div className="max-w-full">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap={false}
                  theme="outline"
                  size="large"
                  text="continue_with"
                  shape="rectangular"
                  width="100%"
                />
              </div>
            </div>
            <p className="text-center text-xs text-base-content/60 px-2">
              Google accounts are created as regular users
            </p>
          </div>

          {/* Login Link */}
          <div className="text-center mt-4">
            <p className="text-sm text-base-content/70">
              Already have an account?{" "}
              <Link
                href="/login"
                className="link link-primary font-semibold whitespace-nowrap"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
