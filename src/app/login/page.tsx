"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAuth } from "@/contexts/AuthContext";
import { GoogleLogin } from "@react-oauth/google";
import { loginSchema } from "@/validations/auth.validation";
import { FaEye, FaEyeSlash, FaEnvelope, FaLock } from "react-icons/fa";

type LoginFormData = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login, googleLogin } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      await login(data.email, data.password);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Login failed";

      if (errorMessage.includes("verify your email")) {
        console.log(
          `${errorMessage}. Please check your email or request a new verification link.`
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      await googleLogin(credentialResponse.credential);
    } catch (err: any) {
      console.log("Google login failed. Please try again or use email login.");
    }
  };

  const handleGoogleError = () => {
    console.log("Google login failed. Please try again or use email login.");
  };

  const handleForgotPassword = () => {
    router.push("/reset-password");
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-base-200 to-base-300 p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-2xl">
        <div className="card-body p-6 md:p-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-primary mb-2">
              Welcome Back
            </h1>
            <p className="text-base-content/70">
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Input */}
            <div className="form-control">
              <label className="label" htmlFor="email">
                <span className="label-text font-semibold">Email Address</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="text-base-content/50" />
                </div>
                <input
                  id="email"
                  type="email"
                  className={`input input-bordered w-full pl-10 ${
                    errors.email ? "input-error" : ""
                  }`}
                  placeholder="you@example.com"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {errors.email.message}
                  </span>
                </label>
              )}
            </div>

            {/* Password Input with Toggle */}
            <div className="form-control">
              <div className="flex justify-between items-center mb-2">
                <label className="label p-0" htmlFor="password">
                  <span className="label-text font-semibold">Password</span>
                </label>
                <button
                  type="button"
                  className="text-sm link link-hover link-primary"
                  onClick={handleForgotPassword}
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-base-content/50" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className={`input input-bordered w-full pl-10 pr-12 ${
                    errors.password ? "input-error" : ""
                  }`}
                  placeholder="Enter your password"
                  {...register("password")}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={togglePasswordVisibility}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <FaEyeSlash className="text-base-content/50 hover:text-base-content cursor-pointer" />
                  ) : (
                    <FaEye className="text-base-content/50 hover:text-base-content cursor-pointer" />
                  )}
                </button>
              </div>
              {errors.password && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {errors.password.message}
                  </span>
                </label>
              )}
            </div>

            {/* Remember Me Checkbox */}
            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-2">
                <input type="checkbox" className="checkbox checkbox-sm" />
                <span className="label-text">Remember me</span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="form-control mt-6">
              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="divider my-6">OR</div>

          {/* Google Login */}
          <div className="space-y-4">
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap={false}
                theme="outline"
                size="large"
                text="continue_with"
                shape="rectangular"
                logo_alignment="left"
              />
            </div>
          </div>

          {/* Registration Link */}
          <div className="text-center mt-6">
            <p className="text-base-content/70">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="link link-primary font-semibold"
              >
                Sign up now
              </Link>
            </p>
          </div>

          {/* Terms and Privacy */}
          <div className="mt-4 text-center text-xs text-base-content/50">
            <p>
              By continuing, you agree to our{" "}
              <Link href="/terms" className="link link-hover">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="link link-hover">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
