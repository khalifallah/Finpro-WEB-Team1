'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { isAuthenticated, userId, role, storeId } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    setMounted(true);
    
    // ✅ Get user email from localStorage (set during login)
    const storedEmail = localStorage.getItem('userEmail');
    if (storedEmail) {
      setUserEmail(storedEmail);
    }
  }, []);

  // ✅ PATCHED: Fallback to "A" for admin if no email
  const getUserInitial = () => {
    if (!userEmail) return 'A'; // ✅ Default admin initial
    return userEmail.charAt(0).toUpperCase();
  };

  // ✅ PATCHED: Fallback to "admin" for email display
  const getUserEmail = () => {
    return userEmail || 'admin'; // ✅ Default admin email
  };

  const menuItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
    { label: 'Products', href: '/admin/products', icon: '📦' },
    { label: 'Categories', href: '/admin/categories', icon: '🏷️' },
    { label: 'Stocks', href: '/admin/stocks', icon: '📈' },
    { label: 'Discounts', href: '/admin/discounts', icon: '🎁' },
    { label: 'Users', href: '/admin/users', icon: '👥' },
  ];

  const isActive = (href: string) => pathname?.startsWith(href);

  if (!mounted || !isAuthenticated) return null; // Prevent hydration mismatch & check auth

  return (
    <div className="drawer drawer-mobile">
      <input id="admin-drawer" type="checkbox" className="drawer-toggle" />

      {/* Main Content */}
      <div className="drawer-content flex flex-col">
        {/* Navbar */}
        <div className="navbar bg-base-100 border-b border-gray-200 sticky top-0 z-40">
          <div className="flex-1">
            <label
              htmlFor="admin-drawer"
              className="btn btn-ghost drawer-button lg:hidden"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </label>
            <div className="px-2 mx-2 flex items-center gap-2">
              {/* Use try-catch for image or fallback */}
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                BM
              </div>
              <span className="text-xl font-bold">Beyond Market Admin</span>
            </div>
          </div>

          {/* User Menu */}
          <div className="flex-none gap-2">
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-ghost btn-circle avatar cursor-pointer">
                <div className="w-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
                  {/* PATCHED: Default admin initial */}
                  {getUserInitial()}
                </div>
              </label>
              <ul
                tabIndex={0}
                className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
              >
                {/* PATCHED: Default admin email */}
                <li>
                  <a className="pointer-events-none text-xs py-2">
                    {getUserEmail()}
                  </a>
                </li>
                <li className="border-t">
                  <a href="/admin/profile">Profile</a>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      localStorage.removeItem('token');
                      localStorage.removeItem('userEmail');
                      window.location.href = '/login';
                    }}
                  >
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 bg-gray-50 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Sidebar */}
      <div className="drawer-side border-r border-gray-200">
        <label htmlFor="admin-drawer" className="drawer-overlay"></label>
        <ul className="menu p-4 w-80 min-h-full bg-base-100 text-base-content space-y-2">
          {/* Logo */}
          <li className="mb-6">
            <Link href="/admin/dashboard" className="text-lg font-bold px-4 py-3 flex items-center gap-3">
              {/* ✅ PATCHED: Fallback gradient logo */}
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                BM
              </div>
              <span>FinPro</span>
            </Link>
          </li>

          {/* Menu Items */}
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'bg-primary text-white'
                    : 'hover:bg-gray-100'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}