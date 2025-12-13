"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { axiosInstance } from "@/libs/axios/axios.config";
import {
  resetPasswordSchema,
  ResetPasswordFormData,
} from "@/validations/auth.validation";
import { FaEye, FaEyeSlash, FaKey } from "react-icons/fa";

export default function ConfirmResetPasswordPage() {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError,
  } = useForm<ResetPasswordFormData>({
    resolver: yupResolver(resetPasswordSchema),
  });

  const newPassword = watch("newPassword");

  // Validate token on component mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError("root", {
          type: "manual",
          message: "Invalid reset link. No token provided.",
        });
        setIsValidToken(false);
        return;
      }

      try {
        await axiosInstance.post("/auth/verify-reset-token", { token });
        setIsValidToken(true);
      } catch (err: any) {
        setError("root", {
          type: "manual",
          message:
            err.response?.data?.message ||
            "Invalid or expired reset token. Please request a new reset link.",
        });
        setIsValidToken(false);
      }
    };

    validateToken();
  }, [token, setError]);

  // Calculate password strength
  useEffect(() => {
    if (newPassword) {
      let strength = 0;

      // Check for minimum length
      if (newPassword.length >= 8) strength += 20;

      // Check for uppercase
      if (/[A-Z]/.test(newPassword)) strength += 20;

      // Check for lowercase
      if (/[a-z]/.test(newPassword)) strength += 20;

      // Check for numbers
      if (/[0-9]/.test(newPassword)) strength += 20;

      // Check for special characters
      if (/[^a-zA-Z0-9]/.test(newPassword)) strength += 20;

      setPasswordStrength(strength);
    } else {
      setPasswordStrength(0);
    }
  }, [newPassword]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setError("root", {
        type: "manual",
        message: "Token is missing. Please use the link from your email.",
      });
      return;
    }

    setIsLoading(true);

    try {
      await axiosInstance.post("/auth/reset-password", {
        token,
        newPassword: data.newPassword,
      });

      setMessage(
        "Password reset successfully! You can now login with your new password."
      );

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: any) {
      setError("root", {
        type: "manual",
        message: err.response?.data?.message || "Failed to reset password",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const getStrengthColor = () => {
    if (passwordStrength === 0) return "bg-gray-200";
    if (passwordStrength <= 40) return "bg-red-500";
    if (passwordStrength <= 60) return "bg-yellow-500";
    if (passwordStrength <= 80) return "bg-blue-500";
    return "bg-green-500";
  };

  const getStrengthText = () => {
    if (passwordStrength === 0) return "";
    if (passwordStrength <= 40) return "Weak";
    if (passwordStrength <= 60) return "Fair";
    if (passwordStrength <= 80) return "Good";
    return "Strong";
  };

  if (isValidToken === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="card w-full max-w-md bg-base-100 shadow-xl">
          <div className="card-body text-center">
            <span className="loading loading-spinner loading-lg"></span>
            <p>Validating reset token...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title justify-center text-2xl font-bold">
            {isValidToken ? "Set New Password" : "Invalid Reset Link"}
          </h2>

          {errors.root && (
            <div className="alert alert-error">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
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
              <span>{errors.root.message}</span>
            </div>
          )}

          {message && (
            <div className="alert alert-success">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{message}</span>
            </div>
          )}

          {isValidToken ? (
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* New Password */}
              <div className="form-control">
                <label className="label py-1" htmlFor="newPassword">
                  <span className="label-text font-semibold">New Password</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaKey className="text-base-content/50" />
                  </div>
                  <input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    className={`input input-bordered w-full pl-10 pr-12 ${
                      errors.newPassword ? "input-error" : ""
                    }`}
                    placeholder="Enter new password"
                    {...register("newPassword")}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={toggleNewPasswordVisibility}
                    aria-label={
                      showNewPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showNewPassword ? (
                      <FaEyeSlash className="text-base-content/50 hover:text-base-content cursor-pointer" />
                    ) : (
                      <FaEye className="text-base-content/50 hover:text-base-content cursor-pointer" />
                    )}
                  </button>
                </div>
                {errors.newPassword && (
                  <label className="label py-1">
                    <span className="label-text-alt text-error">
                      {errors.newPassword.message}
                    </span>
                  </label>
                )}

                {/* Password Strength Indicator */}
                {newPassword && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-base-content/70">
                        Password strength:
                      </span>
                      <span className="text-xs font-medium">
                        {getStrengthText()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getStrengthColor()}`}
                        style={{ width: `${passwordStrength}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <label className="label py-1">
                  <span className="label-text-alt text-xs text-base-content/60 leading-tight">
                    Must be 8+ characters with uppercase, lowercase, number, &
                    special character
                  </span>
                </label>
              </div>

              {/* Confirm Password */}
              <div className="form-control">
                <label className="label py-1" htmlFor="confirmPassword">
                  <span className="label-text font-semibold">
                    Confirm New Password
                  </span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaKey className="text-base-content/50" />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    className={`input input-bordered w-full pl-10 pr-12 ${
                      errors.confirmPassword ? "input-error" : ""
                    }`}
                    placeholder="Confirm new password"
                    {...register("confirmPassword")}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={toggleConfirmPasswordVisibility}
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <FaEyeSlash className="text-base-content/50 hover:text-base-content cursor-pointer" />
                    ) : (
                      <FaEye className="text-base-content/50 hover:text-base-content cursor-pointer" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <label className="label py-1">
                    <span className="label-text-alt text-error">
                      {errors.confirmPassword.message}
                    </span>
                  </label>
                )}
              </div>

              <div className="form-control mt-6">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="loading loading-spinner"></span>
                      Resetting...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center">
              <p className="mb-4">
                The password reset link is invalid or has expired.
              </p>
              <Link href="/reset-password" className="btn btn-primary">
                Request New Reset Link
              </Link>
            </div>
          )}

          <div className="mt-4 text-center">
            <Link href="/login" className="link link-primary">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
