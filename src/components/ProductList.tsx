import React from "react";
import ProductCard from "./ProductCard";
import { ProductResponse } from "@/types/product.types"; // Sesuaikan path type

interface ProductListProps {
  products: ProductResponse[];
  loading?: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  // [UPDATE 1] Interface harus menerima quantity
  onAddToCart: (product: ProductResponse, quantity: number) => void;
}

const ProductList: React.FC<ProductListProps> = ({
  products,
  loading,
  onAddToCart,
}) => {
  console.log("📦 ProductList received products:", products);
  console.log("📦 Number of products:", products?.length);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex flex-col gap-4">
            <div className="skeleton h-48 w-full"></div>
            <div className="skeleton h-4 w-28"></div>
            <div className="skeleton h-4 w-full"></div>
            <div className="skeleton h-4 w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    console.log("📦 No products to display");
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-semibold text-gray-600">
          No products found
        </h3>
        <p className="text-gray-500">Try changing your search or filters</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-semibold text-gray-600">
          No products found
        </h3>
        <p className="text-gray-500">Try changing your search or filters</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Our Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            // [UPDATE 2] Penting! Teruskan 'quantity' (q) dari anak ke induk
            onAddToCart={(p, q) => onAddToCart(p, q)}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductList;
