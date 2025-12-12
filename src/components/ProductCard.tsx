"use client";

import React, { useState } from "react";
import { ProductResponse } from "@/types/product.types";
import { useAuth } from "@/hooks/useAuth";
import CloudinaryImage from "./CloudinaryImage";

interface ProductCardProps {
  product: ProductResponse;
  onViewDetails?: () => void;
  onAddToCart?: (product: ProductResponse, quantity: number) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onViewDetails,
  onAddToCart,
}) => {
  const [quantity, setQuantity] = useState(1);
  const { isAuthenticated } = useAuth();

  console.log("🎴 ProductCard rendering product:", product);
  console.log("🎴 Product images:", product.images);

  // Get the first image URL
  const getFirstImageUrl = () => {
    if (!product.images || product.images.length === 0) {
      return "";
    }

    const firstImage = product.images[0];
    console.log("🎴 First image object:", firstImage);

    // Handle different possible structures
    if (typeof firstImage === "string") {
      return firstImage;
    } else if (firstImage && firstImage.imageUrl) {
      return firstImage.imageUrl;
    }

    return "";
  };

  const imageUrl = getFirstImageUrl();
  console.log("🎴 Final image URL:", imageUrl);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      localStorage.setItem("redirectAfterLogin", window.location.pathname);
      window.location.href = "/login";
      return;
    }

    console.log("Added to cart:", product.name, "Qty:", quantity);

    if (onAddToCart) {
      onAddToCart(product, quantity);
    }
  };

  const handleQuickView = () => {
    onViewDetails?.();
  };

  const isOutOfStock = !product.canAddToCart || product.stock === 0;
  const isAddToCartDisabled = !isAuthenticated || isOutOfStock;

  return (
    <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300">
      {/* Product Image */}
      <figure className="relative h-48 overflow-hidden">
        <CloudinaryImage
          src={imageUrl}
          alt={product.name}
          width={300}
          height={200}
          className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
        />
        {/* Badges */}
        <div className="absolute top-2 left-2">
          {product.stock < 10 && product.stock > 0 && (
            <div className="badge badge-warning">Low Stock</div>
          )}
          {product.stock === 0 && (
            <div className="badge badge-error">Out of Stock</div>
          )}
        </div>
        <div className="absolute top-2 right-2">
          <div className="badge badge-primary">{product.category.name}</div>
        </div>
      </figure>

      {/* Product Info */}
      <div className="card-body p-4">
        <h3 className="card-title text-lg font-semibold line-clamp-1">
          {product.name}
        </h3>
        <p className="text-gray-500 text-sm line-clamp-2 mb-2">
          {product.description}
        </p>

        {/* Price and Stock */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <span className="text-xl font-bold text-primary">
              {formatPrice(product.price)}
            </span>
          </div>
          <div className="text-sm text-gray-500">Stock: {product.stock}</div>
        </div>

        {/* Quantity Selector */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm">Quantity:</span>
          <div className="join">
            <button
              className="join-item btn btn-xs"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
            >
              -
            </button>
            <input
              type="number"
              className="join-item input input-xs w-12 text-center"
              value={quantity}
              onChange={(e) =>
                setQuantity(
                  Math.max(
                    1,
                    Math.min(product.stock, parseInt(e.target.value) || 1)
                  )
                )
              }
              min="1"
              max={product.stock}
            />
            <button
              className="join-item btn btn-xs"
              onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
              disabled={quantity >= product.stock}
            >
              +
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="card-actions">
          <button
            className="btn btn-primary btn-sm flex-1"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
          >
            {!isAuthenticated ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  />
                </svg>
                Login to Add
              </>
            ) : isOutOfStock ? (
              "Out of Stock"
            ) : (
              "Add to Cart"
            )}
          </button>
          <button className="btn btn-outline btn-sm" onClick={handleQuickView}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
