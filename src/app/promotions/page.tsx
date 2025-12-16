"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function PromotionsPage() {
  const { user } = useAuth();
  const [selectedStore, setSelectedStore] = useState<any>(null); // Ideally fetch from context or local storage if needed globally

  // Mock data for navbar props since we don't fetch full homepage data here
  // In a real app, you might want to fetch categories/links or reuse a layout component
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
    <div className="min-h-screen flex flex-col">
      <Navbar
        categories={categories}
        featuredLinks={featuredLinks}
        selectedStore={selectedStore}
        onStoreChange={() => {}}
        onLocationRequest={() => {}}
        onCategorySelect={() => {}}
        onSearch={() => {}}
      />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-primary mb-4">
            Current Promotions
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Don't miss out on our special deals and discounts! Save big on your
            favorite groceries.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Promotion Card 1 */}
          <div className="card bg-base-100 shadow-xl border border-base-200">
            <figure className="px-10 pt-10">
              <div className="w-full h-48 bg-primary/10 rounded-xl flex items-center justify-center text-primary text-5xl">
                🍎
              </div>
            </figure>
            <div className="card-body items-center text-center">
              <h2 className="card-title">Fresh Fruits Sale!</h2>
              <p>Get 20% off on all imported apples and oranges.</p>
              <div className="card-actions">
                <button className="btn btn-primary">Shop Now</button>
              </div>
            </div>
          </div>

          {/* Promotion Card 2 */}
          <div className="card bg-base-100 shadow-xl border border-base-200">
            <figure className="px-10 pt-10">
              <div className="w-full h-48 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary text-5xl">
                🥛
              </div>
            </figure>
            <div className="card-body items-center text-center">
              <h2 className="card-title">Dairy Delight</h2>
              <p>Buy 2 cartons of milk and get a pack of cheese for free!</p>
              <div className="card-actions">
                <button className="btn btn-secondary">View Deal</button>
              </div>
            </div>
          </div>

          {/* Promotion Card 3 */}
          <div className="card bg-base-100 shadow-xl border border-base-200">
            <figure className="px-10 pt-10">
              <div className="w-full h-48 bg-accent/10 rounded-xl flex items-center justify-center text-accent text-5xl">
                🍞
              </div>
            </figure>
            <div className="card-body items-center text-center">
              <h2 className="card-title">Bakery Bonanza</h2>
              <p>All whole wheat breads are flat 15% off this weekend.</p>
              <div className="card-actions">
                <button className="btn btn-accent text-white">Grab It</button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
