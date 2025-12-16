"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import AuthGuard from "@/components/AuthGuard";
import Link from "next/link";

export default function WishlistPage() {
  const { user } = useAuth();

  // Mock data for Navbar since we are not fetching homepage data here
  const categories = [
    { id: 1, name: "Groceries", productCount: 10 },
    { id: 2, name: "Beverages", productCount: 8 },
    { id: 3, name: "Snacks", productCount: 15 },
  ];
  const featuredLinks = [
    { name: "Home", url: "/" },
    { name: "Products", url: "/products" },
    { name: "Categories", url: "/categories" },
    { name: "Promotions", url: "/promotions" },
  ];

  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar
          categories={categories}
          featuredLinks={featuredLinks}
          selectedStore={null}
          onStoreChange={() => {}}
          onLocationRequest={() => {}}
          onCategorySelect={() => {}}
          onSearch={() => {}}
        />

        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              My Wishlist
            </h1>
            <p className="text-gray-600 mb-8">
              Save your favorite items here to buy them later.
            </p>

            {/* Empty State for Basic Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Your wishlist is currently empty
              </h2>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                Explore our catalog and heart your favorite items to see them
                here.
              </p>
              <Link href="/" className="btn btn-primary px-8">
                Start Shopping
              </Link>
            </div>

            {/* Example of what a wishlist item might look like (Static for now) */}
            <div className="mt-12">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 opacity-50">
                Example of saved item (Preview):
              </h3>
              <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm flex items-center gap-4 opacity-60 pointer-events-none grayscale">
                <div className="w-20 h-20 bg-gray-200 rounded-md"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </AuthGuard>
  );
}
