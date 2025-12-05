"use client";

import { ReactNode, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireVerification?: boolean;
  redirectTo?: string;
}

export default function AuthGuard({ 
  children, 
  requireAuth = true, 
  requireVerification = false,
  redirectTo = "/login" 
}: AuthGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (requireAuth && !user) {
      localStorage.setItem("redirectAfterLogin", window.location.pathname);
      router.push(redirectTo);
    }

    if (requireVerification && user && !user.emailVerifiedAt) {
      router.push("/verify-email");
    }
  }, [user, isLoading, requireAuth, requireVerification, router, redirectTo]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (requireAuth && !user) {
    return null; // Will redirect in useEffect
  }

  if (requireVerification && user && !user.emailVerifiedAt) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
}