"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
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
  role?: "SUPER_ADMIN" | "STORE_ADMIN" | "USER";
  store?: Store;
  emailVerifiedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  referralCode?: string;
  vouchers?: Voucher[];
}

export interface Voucher {
  id: number;
  code: string;
  description: string;
  type: string;
  value: number;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  expiresAt: string;
  is_active: boolean;
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
  refreshUserData: () => Promise<void>; // [BARU] Fungsi untuk memaksa refresh data
}

interface RegisterData {
  fullName: string;
  email: string;
  role?: string;
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

  // [BARU] Fungsi untuk mengambil data user terbaru dari backend
  const refreshUserData = async () => {
    try {
      const currentToken = localStorage.getItem("token");
      if (!currentToken) return;

      const response = await axiosInstance.get("/auth/me");
      const freshUser = response.data.data.user;

      if (freshUser) {
        setUser(freshUser);
        // Penting: Update localStorage agar sinkron jika internet mati/refresh cepat
        localStorage.setItem("user", JSON.stringify(freshUser));
      }
    } catch (error) {
      console.error("Failed to refresh user data:", error);
      // Opsional: Jika token expired, bisa logout otomatis di sini
    }
  };

  // Check for token in localStorage on initial load
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedToken) {
        setToken(storedToken);
        axiosInstance.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${storedToken}`;

        // 1. Set data dari localStorage dulu (agar UI cepat muncul)
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }

        // 2. Ambil data terbaru dari server (background update)
        await refreshUserData();
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  // Function to handle login
  const login = async (email: string, password: string) => {
    try {
      const response = await axiosInstance.post("/auth/login", {
        email,
        password,
      });
      const { token, user } = response.data.data;

      setToken(token);
      setUser(user);
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      axiosInstance.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${token}`;

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
        idToken,
      });

      const { token, user } = response.data.data;

      setToken(token);
      setUser(user);
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      axiosInstance.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${token}`;

      const redirectPath = localStorage.getItem("redirectAfterLogin") || "/";
      localStorage.removeItem("redirectAfterLogin");
      router.push(redirectPath);
    } catch (error: any) {
      console.error("Google login failed:", error);
      throw error;
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
      router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  const isAuthenticated = !!user;

  // Effect to handle protected routes
  useEffect(() => {
    if (isLoading) return;

    const publicPaths = [
      "/",
      "/login",
      "/register",
      "/reset-password",
      "/reset-password/confirm",
      "/verify-email",
    ];
    const isPublicPath =
      publicPaths.includes(pathname) || pathname.startsWith("/products");

    if (!isAuthenticated && !isPublicPath) {
      localStorage.setItem("redirectAfterLogin", pathname);
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        googleLogin,
        logout,
        register,
        setUser,
        setToken,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
