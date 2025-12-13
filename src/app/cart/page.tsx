"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import AuthGuard from "@/components/AuthGuard";
import Link from "next/link";
// Import Logic yang sudah dipisah
import { cartService } from "@/services/cart.services";
import { Cart, CartItem } from "@/types/cart.types";

export default function CartPage() {
  const router = useRouter();
  const { user } = useAuth();

  // State menggunakan Tipe Data yang jelas
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingItem, setUpdatingItem] = useState<number | null>(null);

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      // [FIX] Ambil storeId dinamis, jangan hardcode 1
      const savedStore = localStorage.getItem("storeId");
      const storeId = savedStore ? Number(savedStore) : undefined;

      // Panggil Service
      const cartData = await cartService.getCart(storeId);

      // Filter item kosong (Logic lama Anda tetap dipakai)
      const filteredCartItems =
        cartData?.cartItems?.filter(
          (item) => item && item.product && item.quantity > 0
        ) || [];

      setCart({
        ...cartData,
        cartItems: filteredCartItems,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load cart");
      console.error("Fetch cart error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchCart();
    }
  }, [user, fetchCart]);

  // Logic Update Quantity (Refactored pakai Service)
  const updateQuantity = async (cartItemId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      setError("Quantity must be at least 1");
      return;
    }

    try {
      setUpdatingItem(cartItemId);
      setError("");

      // Panggil Service
      await cartService.updateItemQty(cartItemId, newQuantity);

      // Optimistic UI Update (Logic lama Anda yang bagus, tapi typenya rapi)
      setCart((prevCart) => {
        if (!prevCart) return prevCart;

        const updatedItems = prevCart.cartItems.map((item) => {
          if (item.id === cartItemId) {
            return { ...item, quantity: newQuantity };
          }
          return item;
        });

        const totalItems = updatedItems.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        const subtotal = updatedItems.reduce(
          (sum, item) => sum + item.product.defaultPrice * item.quantity,
          0
        );

        return { ...prevCart, cartItems: updatedItems, totalItems, subtotal };
      });
    } catch (err: any) {
      console.error("Update quantity error:", err);
      // Error handling logic lama tetap dipertahankan
      if (err.response?.status === 404) {
        setError("Item was removed from cart. Refreshing...");
        setTimeout(() => fetchCart(), 1000);
      } else {
        setError(err.message || "Failed to update quantity");
      }
      fetchCart();
    } finally {
      setUpdatingItem(null);
    }
  };

  const removeItem = async (cartItemId: number) => {
    try {
      await cartService.removeItem(cartItemId);

      // Optimistic UI Update
      setCart((prevCart) => {
        if (!prevCart) return prevCart;

        const filteredItems = prevCart.cartItems.filter(
          (item) => item.id !== cartItemId
        );

        const totalItems = filteredItems.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        const subtotal = filteredItems.reduce(
          (sum, item) => sum + item.product.defaultPrice * item.quantity,
          0
        );

        return { ...prevCart, cartItems: filteredItems, totalItems, subtotal };
      });
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to remove item");
      fetchCart();
    }
  };

  const clearCart = async () => {
    if (!confirm("Are you sure you want to clear your cart?")) return;
    try {
      await cartService.clearCart();
      setCart(null);
      setError("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to clear cart");
    }
  };

  const proceedToCheckout = async () => {
    try {
      if (!cart || cart.cartItems.length === 0) {
        setError("Your cart is empty");
        return;
      }

      // Validate cart items before proceeding
      const validItems = cart.cartItems.filter(
        (item) =>
          item &&
          item.product &&
          item.quantity > 0 &&
          item.stockAvailable >= item.quantity
      );

      if (validItems.length === 0) {
        setError("No valid items to checkout. Some items may be out of stock.");
        return;
      }

      const storeId = localStorage.getItem("storeId");
      if (!storeId) {
        setError("Store information is missing. Please refresh the page.");
        return;
      }

      const allItemIds = validItems.map((item) => item.id);

      if (allItemIds.length === 0) {
        setError("No items selected for checkout");
        return;
      }

      const itemsParam = JSON.stringify(allItemIds);

      router.push(`/checkout?storeId=${storeId}&items=${itemsParam}`);
    } catch (err: any) {
      setError(err.message || "Failed to proceed to checkout");
    }
  };

  // Helper formatting tetap sama
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  // === RENDER UI TIDAK BERUBAH SAMA SEKALI DARI KODE ANDA ===
  // (Copy paste bagian return (...) dari kode lama Anda ke sini)
  if (loading) {
    // ... (Kode loading Anda)
    return (
      <AuthGuard requireAuth requireVerification={true}>
        <div className="min-h-screen flex items-center justify-center">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </AuthGuard>
    );
  }

  if (!cart || cart.cartItems.length === 0) {
    // ... (Kode empty state Anda)
    return (
      <AuthGuard requireAuth requireVerification={true}>
        <div className="container mx-auto px-4 min-h-[calc(100vh-120px)] flex flex-col items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Your Cart</h1>
            <div className="max-w-md mx-auto">
              {/* SVG Icon */}
              <svg
                className="w-24 h-24 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                ></path>
              </svg>
              <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
              <p className="text-gray-500 mb-6">
                Add some products to your cart to start shopping
              </p>
              <Link href="/" className="btn btn-primary">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    // ... (Kode render utama Anda, tidak ada yang perlu diubah)
    <AuthGuard requireAuth requireVerification={true}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="space-y-4">
                  {cart.cartItems.map(
                    (
                      item // Type sudah otomatis terdeteksi
                    ) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 border-b pb-4 last:border-0"
                      >
                        {item.product.productImages?.[0]?.imageUrl && (
                          <div className="w-20 h-20 rounded-lg overflow-hidden bg-base-200">
                            <img
                              src={item.product.productImages[0].imageUrl}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="font-medium">{item.product.name}</h3>
                          <p className="text-sm text-gray-600">
                            {item.product.category?.name}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="join">
                              <button
                                className="join-item btn btn-xs"
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity - 1)
                                }
                                disabled={
                                  item.quantity <= 1 || updatingItem === item.id
                                }
                              >
                                {updatingItem === item.id ? (
                                  <span className="loading loading-spinner loading-xs"></span>
                                ) : (
                                  "-"
                                )}
                              </button>
                              <input
                                type="number"
                                className="join-item input input-xs w-12 text-center"
                                value={item.quantity}
                                readOnly
                              />
                              <button
                                className="join-item btn btn-xs"
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity + 1)
                                }
                                disabled={
                                  updatingItem === item.id ||
                                  item.quantity >= item.stockAvailable
                                }
                              >
                                {updatingItem === item.id ? (
                                  <span className="loading loading-spinner loading-xs"></span>
                                ) : (
                                  "+"
                                )}
                              </button>
                            </div>
                            <button
                              className="btn btn-xs btn-error"
                              onClick={() => removeItem(item.id)}
                              disabled={updatingItem === item.id}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">
                            {formatPrice(
                              item.product.defaultPrice * item.quantity
                            )}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatPrice(item.product.defaultPrice)} each
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>

                <div className="flex justify-between items-center mt-6">
                  <button className="btn btn-error btn-sm" onClick={clearCart}>
                    Clear Cart
                  </button>
                  <Link href="/" className="btn btn-outline">
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card bg-base-100 shadow-xl sticky top-4">
              <div className="card-body">
                <h2 className="card-title mb-4">Order Summary</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatPrice(cart.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Items</span>
                    <span>{cart.totalItems}</span>
                  </div>
                  <div className="divider"></div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatPrice(cart.subtotal)}</span>
                  </div>
                </div>
                <div className="mt-6">
                  <button
                    className="btn btn-primary btn-block"
                    onClick={proceedToCheckout}
                  >
                    Proceed to Checkout
                  </button>
                </div>
                <div className="mt-4 text-xs text-gray-500">
                  <p>
                    Shipping costs and taxes will be calculated during checkout.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
