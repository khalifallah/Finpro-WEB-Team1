import React from "react";
import ProductCard from "./ProductCard";
import { ProductResponse } from '@/types/product.types'; // ← TAMBAH (1)
import Pagination from "./common/Pagination" // ← TAMBAH (2)

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ProductListProps {
  products: ProductResponse[]; // ← UPDATE (3)
  pagination?: PaginationData;
  loading: boolean;
  onProductClick?: (product: ProductResponse) => void; // ← TAMBAH (4)
  onAddToCart?: (product: ProductResponse) => void; // ← TAMBAH (4)
}

// ❌ HAPUS interface Product lama

const ProductList: React.FC<ProductListProps> = ({
  products,
  pagination,
  loading,
  onProductClick,
  onAddToCart,
}) => {
  if (loading && products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card bg-base-100 shadow-xl">
              <div className="skeleton h-48 w-full"></div>
              <div className="card-body">
                <div className="skeleton h-4 w-3/4 mb-2"></div>
                <div className="skeleton h-3 w-1/2 mb-4"></div>
                <div className="skeleton h-4 w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <svg
            className="w-24 h-24 text-gray-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            ></path>
          </svg>
          <h3 className="text-xl font-semibold mb-2">No products available</h3>
          <p className="text-gray-500 mb-6">
            No products are currently available at your selected store location.
          </p>
          <button className="btn btn-outline">Change Store Location</button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="w-full sm:w-auto">
          <h2 className="text-3xl font-bold">Featured Products</h2>
          <p className="text-gray-500">Available at your nearest store</p>
        </div>
        <div className="w-full sm:w-auto">
          <select className="select select-bordered w-full sm:w-auto cursor-pointer lg:min-w-[200px]">
            <option>Sort by: Featured</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Newest Arrivals</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product}
            onViewDetails={() => onProductClick?.(product)} // ← TAMBAH (5)
            onAddToCart={() => onAddToCart?.(product)} // ← TAMBAH (5)
          />
        ))}
      </div>

      {/* Pagination - UPDATE: Gunakan component baru */}
      {pagination && pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={(page) => {
            console.log('Change to page:', page);
            // Implement page change logic here
          }}
        />
      )}
    </div>
  );
};

export default ProductList;
