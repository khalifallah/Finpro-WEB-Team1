"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ContactPage() {
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

      <main className="flex-grow container mx-auto px-4 py-12 max-w-5xl">
        <h1 className="text-3xl font-bold text-center mb-10">Contact Us</h1>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Get in Touch</h2>
            <p className="text-gray-600 mb-6">
              Have questions about your order, our service, or just want to say
              hello? We'd love to hear from you.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <span className="text-2xl">📍</span>
                <div>
                  <h3 className="font-bold">Head Office</h3>
                  <p className="text-gray-600">
                    123 Grocery Lane, Market City, MC 12345
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="text-2xl">📧</span>
                <div>
                  <h3 className="font-bold">Email</h3>
                  <p className="text-gray-600">support@beyondmarket.com</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="text-2xl">📞</span>
                <div>
                  <h3 className="font-bold">Phone</h3>
                  <p className="text-gray-600">+62 812 3456 7890</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-base-100 p-6 rounded-xl shadow-lg border border-base-200">
            <h2 className="text-xl font-semibold mb-4">Send us a Message</h2>
            <form className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Name</span>
                </label>
                <input
                  type="text"
                  placeholder="Your name"
                  className="input input-bordered w-full"
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  placeholder="Your email"
                  className="input input-bordered w-full"
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Message</span>
                </label>
                <textarea
                  className="textarea textarea-bordered h-24"
                  placeholder="How can we help?"
                ></textarea>
              </div>
              <button className="btn btn-primary w-full">Send Message</button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
