"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TermsPage() {
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
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-8">
          Last Updated: December 2025
        </p>

        <div className="prose max-w-none">
          <h3>1. Agreement to Terms</h3>
          <p>
            These Terms of Service constitute a legally binding agreement made
            between you, whether personally or on behalf of an entity ("you")
            and Beyond Market ("we", "us", or "our"), concerning your access to
            and use of the Beyond Market website.
          </p>

          <h3>2. User Registration</h3>
          <p>
            You may be required to register with the Site. You agree to keep
            your password confidential and will be responsible for all use of
            your account and password. We reserve the right to remove, reclaim,
            or change a username you select if we determine, in our sole
            discretion, that such username is inappropriate, obscene, or
            otherwise objectionable.
          </p>

          <h3>3. Products and Purchases</h3>
          <p>
            We make every effort to display as accurately as possible the
            colors, features, specifications, and details of the products
            available on the Site. However, we do not guarantee that the colors,
            features, specifications, and details of the products will be
            accurate, complete, reliable, current, or free of other errors, and
            your electronic display may not accurately reflect the actual colors
            and details of the products.
          </p>

          <h3>4. Modifications and Interruptions</h3>
          <p>
            We reserve the right to change, modify, or remove the contents of
            the Site at any time or for any reason at our sole discretion
            without notice. However, we have no obligation to update any
            information on our Site. We also reserve the right to modify or
            discontinue all or part of the Site without notice at any time.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
