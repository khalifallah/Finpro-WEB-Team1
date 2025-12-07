"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { GoogleLogin } from "@react-oauth/google";
import { 
  FaUser, 
  FaEnvelope, 
  FaKey, 
  FaEye, 
  FaEyeSlash, 
  FaUserTie, 
  FaStore, 
  FaShieldAlt 
} from "react-icons/fa";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "USER", // Add default role
    referredBy: "",
  });
  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPassword: false,
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { register, googleLogin } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const togglePasswordVisibility = (field: 'password' | 'confirmPassword') => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      setIsLoading(false);
      return;
    }

    // Strong password validation (optional, based on backend)
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character");
      setIsLoading(false);
      return;
    }

    try {
      await register({
        fullName: formData.fullName,
        email: formData.email,
        role: formData.role,
        referredBy: formData.referredBy
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

  // Role options with descriptions
  const roleOptions = [
    {
      value: "USER",
      label: "Regular User",
      description: "Shop for groceries and manage orders",
      icon: <FaUser className="text-base-content/70" />
    },
    {
      value: "STORE_ADMIN",
      label: "Store Administrator",
      description: "Manage store inventory and operations",
      icon: <FaStore className="text-base-content/70" />
    },
    {
      value: "SUPER_ADMIN",
      label: "Super Administrator",
      description: "Full system access and management",
      icon: <FaShieldAlt className="text-base-content/70" />
    }
  ];

return (
    // Container Utama: min-h-[100dvh] untuk mobile browser, padding responsif
    <div className="min-h-[100dvh] flex items-center justify-center bg-gradient-to-br from-base-200 to-base-300 p-4 py-8 sm:py-12">
      
      {/* Kartu: w-full agar mengisi layar HP, max-w-md membatasi lebar di Desktop */}
      <div className="card w-full max-w-md bg-base-100 shadow-2xl overflow-hidden">
        
        {/* Card Body: Padding lebih kecil di mobile (p-5), lebih besar di tablet+ (sm:p-8) */}
        <div className="card-body p-5 sm:p-8 gap-4">
          
          <div className="text-center mb-2 sm:mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-2">Create Account</h1>
            <p className="text-sm sm:text-base text-base-content/70">Join our community today</p>
          </div>
          
          {error && (
            <div className="alert alert-error animate-fadeIn text-sm p-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {/* Full Name */}
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text font-semibold">Full Name</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="text-base-content/50" />
                </div>
                <input
                  type="text"
                  name="fullName"
                  className="input input-bordered w-full pl-10 h-10 sm:h-12"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text font-semibold">Email Address</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="text-base-content/50" />
                </div>
                <input
                  type="email"
                  name="email"
                  className="input input-bordered w-full pl-10 h-10 sm:h-12"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {/* Role Selection */}
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text font-semibold">Account Type</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUserTie className="text-base-content/50" />
                </div>
                <select
                  name="role"
                  className="select select-bordered w-full pl-10 h-10 sm:h-12 min-h-[2.5rem] appearance-none"
                  value={formData.role}
                  onChange={handleChange}
                  required
                >
                  {roleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-base-content/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
              
              {/* Role Description - Responsif Text */}
              <div className="mt-2 p-3 bg-base-200 rounded-lg">
                {roleOptions
                  .filter(option => option.value === formData.role)
                  .map(option => (
                    <div key={option.value} className="flex items-start gap-3">
                      <div className="mt-1 shrink-0">{option.icon}</div>
                      <div className="min-w-0"> {/* min-w-0 penting agar flex item bisa shrink */}
                        <p className="font-medium text-sm sm:text-base">{option.label}</p>
                        <p className="text-xs sm:text-sm text-base-content/70 break-words leading-tight">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Password */}
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text font-semibold">Password</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaKey className="text-base-content/50" />
                </div>
                <input
                  type={showPassword.password ? "text" : "password"}
                  name="password"
                  className="input input-bordered w-full pl-10 pr-12 h-10 sm:h-12"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 8 chars"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => togglePasswordVisibility('password')}
                  aria-label={showPassword.password ? "Hide password" : "Show password"}
                >
                  {showPassword.password ? (
                    <FaEyeSlash className="text-base-content/50 hover:text-base-content cursor-pointer" />
                  ) : (
                    <FaEye className="text-base-content/50 hover:text-base-content cursor-pointer" />
                  )}
                </button>
              </div>
              <label className="label py-1">
                <span className="label-text-alt text-xs text-base-content/60 leading-tight">
                  Must be 8+ chars with uppercase, lowercase, number, & special char
                </span>
              </label>
            </div>

            {/* Confirm Password */}
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text font-semibold">Confirm Password</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaKey className="text-base-content/50" />
                </div>
                <input
                  type={showPassword.confirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  className="input input-bordered w-full pl-10 pr-12 h-10 sm:h-12"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => togglePasswordVisibility('confirmPassword')}
                  aria-label={showPassword.confirmPassword ? "Hide password" : "Show password"}
                >
                  {showPassword.confirmPassword ? (
                    <FaEyeSlash className="text-base-content/50 hover:text-base-content cursor-pointer" />
                  ) : (
                    <FaEye className="text-base-content/50 hover:text-base-content cursor-pointer" />
                  )}
                </button>
              </div>
            </div>

            {/* Referral Code */}
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text font-semibold">
                  Referral Code <span className="font-normal text-base-content/60 text-xs">(Optional)</span>
                </span>
              </label>
              <input
                type="text"
                name="referredBy"
                className="input input-bordered h-10 sm:h-12"
                value={formData.referredBy}
                onChange={handleChange}
                placeholder="Referral code"
              />
            </div>

            {/* Terms and Conditions */}
            <div className="form-control mt-2">
              <label className="label cursor-pointer justify-start gap-3 items-start">
                <input type="checkbox" className="checkbox checkbox-sm mt-0.5" required />
                <span className="label-text text-xs sm:text-sm leading-snug">
                  I agree to the{" "}
                  <Link href="/terms" className="link link-primary">Terms of Service</Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="link link-primary">Privacy Policy</Link>
                </span>
              </label>
            </div>

            {/* Admin Note */}
            {formData.role !== "USER" && (
              <div className="alert alert-info text-sm p-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div className="w-full">
                  <p className="font-semibold text-xs uppercase">Admin Note</p>
                  <p className="text-xs mt-1 leading-tight">
                    {formData.role === "STORE_ADMIN" 
                      ? "Requires verification via support to activate store features."
                      : "Restricted access. Contact admin for approval."
                    }
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

          {/* Google Login Container - Dipastikan tidak overflow */}
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
              <Link href="/login" className="link link-primary font-semibold whitespace-nowrap">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}