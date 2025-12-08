"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import AuthGuard from "@/components/AuthGuard";
import { axiosInstance } from "@/libs/axios/axios.config";
import Image from "next/image";
import Link from "next/link";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [product, setProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [storeId, setStoreId] = useState<number>(1); // Default store ID

  const productId = params.id;

  useEffect(() => {
    fetchProduct();
    // Get store from localStorage if available
    const storedStore = localStorage.getItem("selectedStore");
    if (storedStore) {
      setStoreId(JSON.parse(storedStore).id);
    }
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/products/${productId}`, {
        params: { storeId }
      });
      setProduct(response.data.data.product || response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async () => {
    try {
      if (!user) {
        router.push("/login?redirect=/products/" + productId);
        return;
      }

      if (!user.emailVerifiedAt) {
        setError("Please verify your email before adding items to cart");
        return;
      }

      const response = await axiosInstance.post("/cart/items", {
        productId: product.id,
        quantity,
        storeId
      });

      setSuccess(response.data.message || "Item added to cart!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add item to cart");
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="alert alert-error">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{error}</span>
        </div>
        <Link href="/" className="btn btn-primary mt-4">
          Back to Home
        </Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Product not found</h1>
        <Link href="/" className="btn btn-primary">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {error && (
        <div className="alert alert-error mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div>
          {product.images && product.images.length > 0 ? (
            <div className="carousel w-full rounded-lg overflow-hidden">
              {product.images.map((image: any, index: number) => (
                <div
                  key={image.id}
                  id={`slide-${index}`}
                  className="carousel-item relative w-full"
                >
                  <img
                    src={image.imageUrl}
                    alt={product.name}
                    className="w-full h-96 object-cover"
                  />
                  <div className="absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2">
                    <a
                      href={`#slide-${index === 0 ? product.images.length - 1 : index - 1}`}
                      className="btn btn-circle"
                    >
                      ❮
                    </a>
                    <a
                      href={`#slide-${index === product.images.length - 1 ? 0 : index + 1}`}
                      className="btn btn-circle"
                    >
                      ❯
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full h-96 bg-base-300 rounded-lg flex items-center justify-center">
              <span className="text-4xl">📦</span>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div>
          <div className="mb-4">
            <span className="badge badge-primary">
              {product.category?.name}
            </span>
          </div>
          
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          
          <p className="text-gray-600 mb-6">{product.description}</p>
          
          <div className="mb-6">
            <span className="text-4xl font-bold text-primary">
              {formatPrice(product.price)}
            </span>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium">Stock:</span>
              <span className={`badge ${product.stock > 0 ? 'badge-success' : 'badge-error'}`}>
                {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
              </span>
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="mb-6">
            <label className="block font-medium mb-2">Quantity</label>
            <div className="join">
              <button
                className="join-item btn"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                -
              </button>
              <input
                type="number"
                className="join-item input input-bordered w-20 text-center"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                max={product.stock}
              />
              <button
                className="join-item btn"
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                disabled={quantity >= product.stock}
              >
                +
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              className="btn btn-primary btn-block"
              onClick={addToCart}
              disabled={product.stock <= 0 || quantity > product.stock}
            >
              Add to Cart
            </button>
            
            <Link href="/" className="btn btn-outline btn-block">
              Continue Shopping
            </Link>
            
            <Link href="/cart" className="btn btn-ghost btn-block">
              View Cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}