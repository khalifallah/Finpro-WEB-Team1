"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { axiosInstance } from "@/libs/axios/axios.config";
import {
  setPasswordSchema,
  SetPasswordFormData,
} from "@/validations/auth.validation";
import { FaEye, FaEyeSlash, FaKey } from "react-icons/fa";

export default function VerifyEmailPage() {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [needsPassword, setNeedsPassword] = useState(false);
  const [tokenValidated, setTokenValidated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError,
  } = useForm<SetPasswordFormData>({
    resolver: yupResolver(setPasswordSchema),
  });

  const password = watch("password");

  // Check token on component mount
  useEffect(() => {
    const verifyToken = async () => {
      console.log("Debug: Token =", token, "Email =", email);

      if (token) {
        try {
          setIsLoading(true);
          console.log("Calling /auth/activate with token");
          const response = await axiosInstance.get(`/auth/activate/${token}`);
          const data = response.data.data;

          if (data.needsPassword) {
            setNeedsPassword(true);
            setMessage("Please set your password to complete verification.");
          } else if (data.isExpired) {
            setError("root", {
              type: "manual",
              message:
                "Verification link has expired. Please request a new one.",
            });
          } else {
            setIsVerified(true);
            setMessage("Email verified successfully!");
          }
        } catch (err: any) {
          console.error("Error verifying token:", err);
          setError("root", {
            type: "manual",
            message: err.response?.data?.message || "Verification failed",
          });
        } finally {
          setIsLoading(false);
          setTokenValidated(true);
        }
      } else if (email) {
        // NO TOKEN, just email
        console.log(
          "No token provided, only email. User needs to click email link."
        );
        setMessage(
          "Please check your email for the verification link. Click the link to verify and set your password."
        );
        setTokenValidated(true);
      } else {
        setTokenValidated(true);
      }
    };

    verifyToken();
  }, [token, email, setError]);

  // Calculate password strength
  useEffect(() => {
    if (password) {
      let strength = 0;

      // Check for minimum length
      if (password.length >= 8) strength += 20;

      // Check for uppercase
      if (/[A-Z]/.test(password)) strength += 20;

      // Check for lowercase
      if (/[a-z]/.test(password)) strength += 20;

      // Check for numbers
      if (/[0-9]/.test(password)) strength += 20;

      // Check for special characters
      if (/[^a-zA-Z0-9]/.test(password)) strength += 20;

      setPasswordStrength(strength);
    } else {
      setPasswordStrength(0);
    }
  }, [password]);

  const handleSetPassword = async (data: SetPasswordFormData) => {
    if (!token) {
      setError("root", {
        type: "manual",
        message:
          "Verification token is missing. Please use the link from your email.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await axiosInstance.post("/auth/set-password", {
        token,
        password: data.password,
      });

      setMessage("Password set successfully! You can now login.");
      setIsVerified(true);
      setNeedsPassword(false);
    } catch (err: any) {
      setError("root", {
        type: "manual",
        message: err.response?.data?.message || "Failed to set password",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setError("root", {
        type: "manual",
        message: "Email is required to resend verification",
      });
      return;
    }

    setIsLoading(true);

    try {
      await axiosInstance.post("/auth/resend-verification", { email });
      setMessage("New verification email sent successfully!");
    } catch (err: any) {
      setError("root", {
        type: "manual",
        message: err.response?.data?.message || "Failed to resend verification",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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

  // Don't show loading state indefinitely
  if (!tokenValidated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="card w-full max-w-md bg-base-100 shadow-xl">
          <div className="card-body text-center">
            <span className="loading loading-spinner loading-lg"></span>
            <p>Validating token...</p>
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
            {isVerified ? "Email Verified!" : "Verify Your Email"}
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

          {!isVerified && needsPassword && (
            <form onSubmit={handleSubmit(handleSetPassword)}>
              {/* Password */}
              <div className="form-control">
                <label className="label py-1" htmlFor="password">
                  <span className="label-text font-semibold">
                    Set Your Password
                  </span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaKey className="text-base-content/50" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className={`input input-bordered w-full pl-10 pr-12 ${
                      errors.password ? "input-error" : ""
                    }`}
                    placeholder="Enter new password"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={togglePasswordVisibility}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <FaEyeSlash className="text-base-content/50 hover:text-base-content cursor-pointer" />
                    ) : (
                      <FaEye className="text-base-content/50 hover:text-base-content cursor-pointer" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <label className="label py-1">
                    <span className="label-text-alt text-error">
                      {errors.password.message}
                    </span>
                  </label>
                )}

                {/* Password Strength Indicator */}
                {password && (
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
                    Confirm Password
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
                      Setting Password...
                    </>
                  ) : (
                    "Set Password & Complete Verification"
                  )}
                </button>
              </div>
            </form>
          )}

          {!isVerified && !needsPassword && !token && (
            <div className="text-center">
              <p>No verification token found.</p>
              <p className="mt-2">
                Please check your email for the verification link.
              </p>
              {email && (
                <button
                  className="btn btn-outline mt-4"
                  onClick={handleResendVerification}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="loading loading-spinner"></span>
                  ) : (
                    "Resend Verification Email"
                  )}
                </button>
              )}
            </div>
          )}

          {isVerified && (
            <div className="text-center">
              <div className="mb-4">
                <svg
                  className="w-16 h-16 text-success mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </div>
              <p className="mb-6">Your email has been successfully verified!</p>
              <Link href="/login" className="btn btn-primary">
                Go to Login
              </Link>
            </div>
          )}

          <div className="mt-4 text-center">
            <Link href="/" className="link link-primary text-sm">
              Back to Homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
