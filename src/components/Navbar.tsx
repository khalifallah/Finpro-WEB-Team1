import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";

interface Category {
  id: number;
  name: string;
  productCount: number;
}

interface FeaturedLink {
  name: string;
  url: string;
  icon?: string;
}

interface NavbarProps {
  categories: Category[];
  featuredLinks: FeaturedLink[];
  selectedStore: any;
  onStoreChange: (storeId: number) => void;
}


const Navbar: React.FC<NavbarProps> = ({
  categories,
  featuredLinks,
  selectedStore,
  onStoreChange,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const { user, logout, isLoading } = useAuth();

  const getIcon = (iconName?: string) => {
    switch (iconName) {
      case "home":
        return "🏠";
      case "shopping-bag":
        return "🛍️";
      case "grid":
        return "📊";
      case "tag":
        return "🏷️";
      case "shopping-cart":
        return "🛒";
      case "user":
        return "👤";
      default:
        return "📌";
    }
  };

   return (
    <div className="navbar bg-base-100 shadow-lg sticky top-0 z-50">
      <div className="navbar-start">
        {/* Mobile Menu Button */}
        <div className="dropdown">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-ghost lg:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />
            </svg>
          </div>
          {isMenuOpen && (
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
            >
              {featuredLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.url}>
                    {getIcon(link.icon)} {link.name}
                  </Link>
                </li>
              ))}
              <li>
                <details>
                  <summary>Categories</summary>
                  <ul className="p-2">
                    {categories.map((category) => (
                      <li key={category.id}>
                        <Link href={`/products?category=${category.id}`}>
                          {category.name} ({category.productCount})
                        </Link>
                      </li>
                    ))}
                  </ul>
                </details>
              </li>
              {/* Auth links for mobile */}
              {user ? (
                <>
                  <li>
                    <Link href="/profile">
                      👤 Profile {!user.emailVerifiedAt && "⚠️"}
                    </Link>
                  </li>
                  <li>
                    <button onClick={logout}>🚪 Logout</button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link href="/login">🔑 Login</Link>
                  </li>
                  <li>
                    <Link href="/register">📝 Register</Link>
                  </li>
                </>
              )}
            </ul>
          )}
        </div>

        {/* Logo */}
        <Link href="/" className="btn btn-ghost text-xl">
          🛒 Beyond Market
        </Link>
      </div>

      {/* Desktop Navigation */}
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          {featuredLinks.slice(0, 4).map((link) => (
            <li key={link.name}>
              <Link href={link.url}>
                <span className="mr-1">{getIcon(link.icon)}</span>
                {link.name}
              </Link>
            </li>
          ))}

          {/* Categories Dropdown */}
          <li>
            <details open={isCategoryMenuOpen}>
              <summary onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}>
                Categories
              </summary>
              <ul className="p-2 bg-base-100 rounded-box shadow-lg z-50">
                {categories.map((category) => (
                  <li key={category.id}>
                    <Link href={`/products?category=${category.id}`}>
                      {category.name}
                      <span className="badge badge-neutral ml-2">
                        {category.productCount}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          </li>
        </ul>
      </div>

      <div className="navbar-end">
        {/* Store Info */}
        {selectedStore && (
          <div className="dropdown dropdown-end hidden md:block">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {selectedStore.name}
            </div>
            <div
              tabIndex={0}
              className="dropdown-content z-[1] card card-compact w-64 p-2 shadow bg-base-100"
            >
              <div className="card-body">
                <h3 className="card-title">{selectedStore.name}</h3>
                <p className="text-sm">{selectedStore.address}</p>
                {selectedStore.distance && (
                  <p className="text-xs text-gray-500">
                    {selectedStore.distance.toFixed(1)} km away
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="form-control hidden md:block">
          <input
            type="text"
            placeholder="Search products..."
            className="input input-bordered w-24 md:w-auto"
          />
        </div>

        {/* Cart */}
        <Link href="/cart" className="btn btn-ghost btn-circle">
          <div className="indicator">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span className="badge badge-sm indicator-item">0</span>
          </div>
        </Link>

        {/* User Profile Dropdown */}
        {isLoading ? (
          <div className="btn btn-ghost btn-circle">
            <span className="loading loading-spinner loading-sm"></span>
          </div>
        ) : user ? (
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle avatar"
            >
              {user.photoUrl ? (
                <div className="w-10 rounded-full">
                  <img
                    alt="User Avatar"
                    src={user.photoUrl}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
                  {user.fullName?.charAt(0).toUpperCase()}
                </div>
              )}
              {!user.emailVerifiedAt && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-warning rounded-full flex items-center justify-center">
                  <span className="text-xs">!</span>
                </div>
              )}
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
            >
              <li>
                <div className="px-4 py-2 border-b">
                  <p className="font-semibold">{user.fullName}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  {!user.emailVerifiedAt && (
                    <div className="badge badge-warning badge-sm mt-1">
                      Unverified
                    </div>
                  )}
                </div>
              </li>
              <li>
                <Link href="/profile" className="justify-between">
                  Profile
                  {!user.emailVerifiedAt && (
                    <span className="badge badge-warning">!</span>
                  )}
                </Link>
              </li>
              <li><Link href="/orders">My Orders</Link></li>
              <li><Link href="/settings">Settings</Link></li>
              <li className="divider mt-0 mb-0"></li>
              <li><button onClick={logout}>Logout</button></li>
            </ul>
          </div>
        ) : (
          <div className="flex gap-2">
            <Link href="/login" className="btn btn-ghost btn-sm">
              Login
            </Link>
            <Link href="/register" className="btn btn-primary btn-sm">
              Register
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;