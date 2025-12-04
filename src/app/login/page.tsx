"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { GoogleLogin } from "@react-oauth/google";
import jwtDecode from "jwt-decode";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login, googleLogin } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await login(formData.email, formData.password);
      // Redirect happens in login function
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Login failed";
      setError(errorMessage);
      
      // Handle specific error cases
      if (errorMessage.includes("verify your email")) {
        setError(`${errorMessage}. Please check your email or request a new verification link.`);
      }
    } finally {
      setIsLoading(false);
    }
  };

const handleGoogleSuccess = async (credentialResponse: any) => {
  try {
    // You can get the JWT token from credentialResponse
    const idToken = credentialResponse.credential;
    
    if (!idToken) {
      setError("No token received from Google");
      return;
    }
    
    // Decode the token to see what's in it (optional, for debugging)
    const decodedToken = jwtDecode(idToken);
    console.log("Google token decoded:", decodedToken);
    
    // Send the token to your backend
    await googleLogin(idToken);
  } catch (err: any) {
    console.error("Google login error:", err);
    setError("Google login failed: " + (err.message || "Unknown error"));
  }
};

const handleGoogleError = () => {
  setError("Google login failed. Please try again or use email login.");
};

  const handleForgotPassword = () => {
    router.push("/reset-password");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title justify-center text-2xl font-bold">Login to Your Account</h2>
          
          {error && (
            <div className="alert alert-error">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                name="email"
                className="input input-bordered"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                type="password"
                name="password"
                className="input input-bordered"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <label className="label">
                <button
                  type="button"
                  className="label-text-alt link link-hover"
                  onClick={handleForgotPassword}
                >
                  Forgot password?
                </button>
              </label>
            </div>

            <div className="form-control mt-6">
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  "Login"
                )}
              </button>
            </div>
          </form>

          <div className="divider">OR</div>

          <div className="flex flex-col gap-2">
            {/* Google Login Button */}
            <div className="flex justify-center">
        <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap={false} // Disable One Tap
            theme="outline"
            size="large"
            text="continue_with"
            shape="rectangular"
            logo_alignment="left"
              />
            </div>
          </div>

          <p className="text-center mt-4">
            Don't have an account?{" "}
            <Link href="/register" className="link link-primary">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}