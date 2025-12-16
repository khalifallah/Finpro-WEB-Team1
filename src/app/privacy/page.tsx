"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PrivacyPolicyPage() {
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
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">
          Last Updated: December 2025
        </p>

        <div className="prose max-w-none">
          <h3>1. Introduction</h3>
          <p>
            Beyond Market ("we", "our", or "us") is committed to protecting your
            privacy. This Privacy Policy explains how we collect, use, disclose,
            and safeguard your information when you visit our website.
          </p>

          <h3>2. Information We Collect</h3>
          <p>
            We may collect information about you in a variety of ways. The
            information we may collect on the Site includes:
          </p>
          <ul>
            <li>
              <strong>Personal Data:</strong> Personally identifiable
              information, such as your name, shipping address, email address,
              and telephone number.
            </li>
            <li>
              <strong>Derivative Data:</strong> Information our servers
              automatically collect when you access the Site, such as your IP
              address, your browser type, your operating system, your access
              times, and the pages you have viewed directly before and after
              accessing the Site.
            </li>
          </ul>

          <h3>3. Use of Your Information</h3>
          <p>
            Having accurate information about you permits us to provide you with
            a smooth, efficient, and customized experience. Specifically, we may
            use information collected about you via the Site to:
          </p>
          <ul>
            <li>Create and manage your account.</li>
            <li>Process your orders and deliver products.</li>
            <li>Email you regarding your account or order.</li>
            <li>
              Fulfill and manage purchases, orders, payments, and other
              transactions performed via the Site.
            </li>
          </ul>

          <h3>4. Contact Us</h3>
          <p>
            If you have questions or comments about this Privacy Policy, please
            contact us at{" "}
            <a href="mailto:privacy@beyondmarket.com" className="text-primary">
              privacy@beyondmarket.com
            </a>
            .
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
