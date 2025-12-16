"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function FAQPage() {
  const categories = [{ id: 1, name: "Groceries", productCount: 10 }];
  const featuredLinks = [{ name: "Home", url: "/" }];

  const faqs = [
    {
      question: "How do I place an order?",
      answer:
        "Simply browse our products, add items to your cart, and proceed to checkout. You'll need to create an account or log in to complete your purchase.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept manual bank transfers and payment gateway options (Credit Card, E-Wallet) for your convenience.",
    },
    {
      question: "Can I cancel my order?",
      answer:
        "Yes, you can cancel your order as long as it hasn't been shipped yet. Go to 'My Orders' to manage your current orders.",
    },
    {
      question: "How is shipping cost calculated?",
      answer:
        "Shipping costs are calculated based on the distance from our store to your delivery address and the total weight of your items.",
    },
    {
      question: "Do you offer refunds?",
      answer:
        " refunds are processed on a case-by-case basis. If you receive damaged or incorrect items, please contact support immediately.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        categories={categories}
        featuredLinks={featuredLinks}
        selectedStore={null}
        onStoreChange={() => {}}
        onLocationRequest={() => {}}
      />

      <main className="flex-grow container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-10">
          Frequently Asked Questions
        </h1>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="collapse collapse-plus bg-base-100 border border-base-200 rounded-box"
            >
              <input
                type="radio"
                name="my-accordion-3"
                defaultChecked={index === 0}
              />
              <div className="collapse-title text-xl font-medium">
                {faq.question}
              </div>
              <div className="collapse-content">
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
