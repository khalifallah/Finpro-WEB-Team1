"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { axiosInstance } from "@/libs/axios/axios.config";

// Updated: Tambah store interface (Gerald)
export interface Store {
  id: number;
  name: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  photoUrl?: string;
  role?: 'SUPER_ADMIN' | 'STORE_ADMIN' | 'USER';  // Updated: Type yang lebih specific (Gerald)
  store?: Store;  // Updated: Store untuk Store Admin (Gerald)
  emailVerifiedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  googleLogin: (googleToken: string) => Promise<void>;
  logout: () => void;
  register: (data: RegisterData) => Promise<void>;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
}

interface RegisterData {
  fullName: string;
  email: string;
  referredBy?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Check for token in localStorage on initial load
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      // Set the default Authorization header for axios
      axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
    }

    setIsLoading(false);
  }, []);

  // Function to handle login
  const login = async (email: string, password: string) => {
    try {
      const response = await axiosInstance.post("/auth/login", { email, password });
      const { token, user } = response.data.data;
      
      setToken(token);
      setUser(user);
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      
      // Sync verification status
      await syncVerificationStatus(user.id);
      
      const redirectPath = localStorage.getItem("redirectAfterLogin") || "/";
      localStorage.removeItem("redirectAfterLogin");
      router.push(redirectPath);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  // Function to handle Google login
  const googleLogin = async (idToken: string) => {
    try {
      const response = await axiosInstance.post("/auth/google", { 
        idToken 
      });
      
      const { token, user } = response.data.data;
      
      // Ensure emailVerifiedAt is included
      if (!user.emailVerifiedAt) {
        console.warn("Google login: emailVerifiedAt not included in response");
      }
      
      setToken(token);
      setUser(user);
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      
      // Sync verification status with backend
      await syncVerificationStatus(user.id);
      
      const redirectPath = localStorage.getItem("redirectAfterLogin") || "/";
      localStorage.removeItem("redirectAfterLogin");
      router.push(redirectPath);
    } catch (error: any) {
      console.error("Google login failed:", error);
      throw error;
    }
  };

  // Function to sync verification status
  const syncVerificationStatus = async (userId: string) => {
    try {
      const response = await axiosInstance.get(`/auth/verification-status`);
      const backendUser = response.data.data.user;
      
      // If backend has different verification status, update frontend
      if (backendUser.emailVerifiedAt) {
        setUser(prev => prev ? { ...prev, emailVerifiedAt: backendUser.emailVerifiedAt } : null);
        localStorage.setItem("user", JSON.stringify({
          ...JSON.parse(localStorage.getItem("user") || "{}"),
          emailVerifiedAt: backendUser.emailVerifiedAt
        }));
      }
    } catch (error) {
      console.error("Failed to sync verification status:", error);
    }
  };

  // Function to handle logout
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete axiosInstance.defaults.headers.common["Authorization"];
    router.push("/login");
  };

  // Function to handle registration
  const register = async (data: RegisterData) => {
    try {
      const response = await axiosInstance.post("/auth/register", data);
      // Registration successful, email verification sent
      router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  // Function to check if user is authenticated
  const isAuthenticated = !!user;
  
  // Function to check if user is verified
  const isVerified = !!user?.emailVerifiedAt;

  // Effect to handle protected routes
  useEffect(() => {
    if (isLoading) return;

    const publicPaths = ["/", "/login", "/register", "/reset-password", "/reset-password/confirm", "/verify-email"];
    const isPublicPath = publicPaths.includes(pathname) || pathname.startsWith("/products");

    if (!isAuthenticated && !isPublicPath) {
      // Store the current path for redirect after login
      localStorage.setItem("redirectAfterLogin", pathname);
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, pathname, router]);
  
  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      isLoading, 
      login, 
      googleLogin, 
      logout, 
      register,
      setUser, 
      setToken 
    }}>
      {children}
    </AuthContext.Provider>
  );
};