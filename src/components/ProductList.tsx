import React from "react";
import ProductCard from "./ProductCard";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: {
    id: number;
    name: string;
  };
  images: Array<{
    id: number;
    imageUrl: string;
  }>;
  canAddToCart: boolean;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ProductListProps {
  products: Product[];
  pagination?: Pagination;
  loading: boolean;
}

const ProductList: React.FC<ProductListProps> = ({
  products,
  pagination,
  loading,
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
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold">Featured Products</h2>
          <p className="text-gray-500">
            Available at your nearest store
          </p>
        </div>
        <div className="flex gap-2">
          <select className="select select-bordered">
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
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center mt-12">
          <div className="join">
            <button className="join-item btn">«</button>
            {[...Array(pagination.totalPages)].map((_, i) => (
              <button
                key={i}
                className={`join-item btn ${
                  i + 1 === pagination.page ? "btn-active" : ""
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button className="join-item btn">»</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;