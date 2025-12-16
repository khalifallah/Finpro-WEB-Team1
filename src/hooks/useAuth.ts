'use client';

import { useState, useEffect } from 'react';
import jwtDecode from 'jwt-decode';

interface DecodedToken {
  id: number;
  email: string;
  role: 'SUPER_ADMIN' | 'STORE_ADMIN' | 'USER';
  storeId?: number;
  iat: number;
  exp: number;
}

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [storeId, setStoreId] = useState<number | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded: DecodedToken = jwtDecode(token);
        
        // Check if token expired
        if (decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem('token');
          setLoading(false);
          return;
        }

        setIsAuthenticated(true);
        setRole(decoded.role);
        setStoreId(decoded.storeId || null);
        setUserId(decoded.id);
      } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = (token: string) => {
    localStorage.setItem('token', token);
    const decoded: DecodedToken = jwtDecode(token);
    setIsAuthenticated(true);
    setRole(decoded.role);
    setStoreId(decoded.storeId || null);
    setUserId(decoded.id);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setRole(null);
    setStoreId(null);
    setUserId(null);
  };

  const isSuperAdmin = role === 'SUPER_ADMIN';
  const isStoreAdmin = role === 'STORE_ADMIN';
  const isAdmin = isSuperAdmin || isStoreAdmin;

  return {
    isAuthenticated,
    role,
    storeId,
    userId,
    loading,
    isSuperAdmin,
    isStoreAdmin,
    isAdmin,
    login,
    logout,
  };
};