"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

const SimpleNavbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-base-100 shadow-sm h-16">
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        {/* 1. LOGO (Klik lari ke Home) */}
        <Link href="/" className="flex items-center gap-2">
          {/* Pastikan path logo sesuai dengan public folder kamu */}
          <img
            src="/Beyond_Market_compressed.png"
            alt="Beyond Market"
            className="h-8 w-auto"
          />
          <span className="font-bold text-xl text-primary hidden sm:inline">
            Beyond Market
          </span>
        </Link>

        {/* 2. USER MENU SEBELAH KANAN */}
        <div className="flex items-center gap-4">
          {user ? (
            // JIKA USER LOGIN
            <div className="flex items-center gap-3">
              {/* Teks Sapaan (Hidden di HP) */}
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-base-content">
                  {user.fullName}
                </p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>

              {/* Dropdown Profile */}
              <div className="dropdown dropdown-end">
                <div
                  tabIndex={0}
                  role="button"
                  className="btn btn-ghost btn-circle avatar ring ring-transparent hover:ring-primary/20 transition-all"
                >
                  <div className="w-10 rounded-full bg-neutral text-neutral-content">
                    {user.photoUrl ? (
                      <img src={user.photoUrl} alt={user.fullName} />
                    ) : (
                      <span className="flex items-center justify-center h-full text-lg font-bold">
                        {user.fullName?.charAt(0)}
                      </span>
                    )}
                  </div>
                </div>

                {/* MENU DROPDOWN */}
                <ul
                  tabIndex={0}
                  className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow-lg bg-base-100 rounded-box w-56 border"
                >
                  {/* Info Header untuk Mobile */}
                  <li className="menu-title sm:hidden">
                    <p className="font-bold">{user.fullName}</p>
                  </li>

                  <li>
                    <Link href="/profile">My Profile</Link>
                  </li>

                  {/* --- [LOGIKA KHUSUS ADMIN] --- */}
                  {/* Sama persis dengan Navbar Utama */}
                  {(user.role === "SUPER_ADMIN" ||
                    user.role === "STORE_ADMIN") && (
                    <li>
                      <Link
                        href="/admin/dashboard"
                        className="text-primary font-medium"
                      >
                        Admin Dashboard
                      </Link>
                    </li>
                  )}
                  {/* ----------------------------- */}

                  <li>
                    <Link href="/orders">My Orders</Link>
                  </li>

                  <div className="divider my-1"></div>

                  <li>
                    <button onClick={logout} className="text-error">
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            // JIKA BELUM LOGIN
            <Link
              href="/login"
              className="btn btn-primary btn-sm rounded-full px-6"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default SimpleNavbar;
