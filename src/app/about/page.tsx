"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AboutPage() {
  // Mock data for Navbar
  const categories = [{ id: 1, name: "Groceries", productCount: 10 }];
  const featuredLinks = [{ name: "Home", url: "/" }];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        categories={categories}
        featuredLinks={featuredLinks}
        selectedStore={null}
        onStoreChange={() => {}}
        onLocationRequest={() => {}}
      />

      <main className="flex-grow container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold text-center mb-8">
          About Beyond Market
        </h1>

        <div className="prose lg:prose-xl mx-auto">
          <p className="lead text-xl text-center text-gray-600 mb-10">
            We are revolutionizing the way you shop for groceries, bringing
            fresh produce directly from local farms to your doorstep.
          </p>

          <div className="grid md:grid-cols-2 gap-10 items-center mb-12">
            <div className="bg-gray-100 h-64 rounded-xl flex items-center justify-center"></div>
            <div>
              <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-gray-700">
                To provide accessible, high-quality, and affordable groceries to
                every household while empowering local farmers and minimizing
                our environmental footprint.
              </p>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Our Story</h2>
            <p className="text-gray-700 mb-4">
              Founded in 2025, Beyond Market started with a simple idea: grocery
              shopping shouldn't be a chore. We built a platform that connects
              you with the nearest high-quality stores, ensuring that your food
              is always fresh and your delivery is always fast.
            </p>
            <p className="text-gray-700">
              Today, we serve thousands of customers across the city,
              maintaining our commitment to quality and speed.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
