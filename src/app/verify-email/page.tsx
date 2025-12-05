"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { axiosInstance } from "@/libs/axios/axios.config";

export default function VerifyEmailPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [needsPassword, setNeedsPassword] = useState(false);
  const [tokenValidated, setTokenValidated] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

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
          setError("Verification link has expired. Please request a new one.");
        } else {
          setIsVerified(true);
          setMessage("Email verified successfully!");
        }
      } catch (err: any) {
        console.error("Error verifying token:", err);
        setError(err.response?.data?.message || "Verification failed");
      } finally {
        setIsLoading(false);
        setTokenValidated(true);
      }
    } else if (email) {
      // NO TOKEN, just email
      console.log("No token provided, only email. User needs to click email link.");
      // Don't make any API calls that require token
      // Just show a helpful message
      setMessage("Please check your email for the verification link. Click the link to verify and set your password.");
      setTokenValidated(true);
      // Do NOT set needsPassword to true without a token
    } else {
      setTokenValidated(true);
    }
  };

  verifyToken();
}, [token, email]);

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!token) {
      setError("Verification token is missing. Please use the link from your email.");
      return;
    }
    
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await axiosInstance.post("/auth/set-password", {
        token,
        password
      });
      
      setMessage("Password set successfully! You can now login.");
      setIsVerified(true);
      setNeedsPassword(false);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to set password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setError("Email is required to resend verification");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await axiosInstance.post("/auth/resend-verification", { email });
      setMessage("New verification email sent successfully!");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to resend verification");
    } finally {
      setIsLoading(false);
    }
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
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title justify-center text-2xl font-bold">
            {isVerified ? "Email Verified!" : "Verify Your Email"}
          </h2>

          {error && (
            <div className="alert alert-error">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="alert alert-success">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{message}</span>
            </div>
          )}

          {!isVerified && needsPassword && (
            <form onSubmit={handleSetPassword}>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Set Your Password</span>
                </label>
                <input
                  type="password"
                  className="input input-bordered"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  minLength={8}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Confirm Password</span>
                </label>
                <input
                  type="password"
                  className="input input-bordered"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  minLength={8}
                />
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
                <svg className="w-16 h-16 text-success mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
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