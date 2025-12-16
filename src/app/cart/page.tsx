"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import AuthGuard from "@/components/AuthGuard";
import Link from "next/link";
// Import Logic yang sudah dipisah
import { cartService } from "@/services/cart.services";
import { Cart } from "@/types/cart.types";

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
      // Backend sekarang mengirimkan data: finalPrice, discountAmount, appliedDiscount
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

        // Hitung ulang total sederhana untuk optimistic update (kalkulasi diskon akurat akan datang dari fetchCart setelahnya)
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
    } finally {
      // Selalu fetch ulang data terbaru dari server untuk memastikan kalkulasi diskon akurat
      fetchCart();
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
      // Fetch cart lagi untuk update total diskon
      fetchCart();
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
      maximumFractionDigits: 0, // Hilangkan desimal agar lebih bersih
    }).format(price);
  };

  // === RENDER UI ===

  if (loading) {
    return (
      <AuthGuard requireAuth requireVerification={true}>
        <div className="min-h-screen flex items-center justify-center">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </AuthGuard>
    );
  }

  if (!cart || cart.cartItems.length === 0) {
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

  // [UPDATE 1] Menghitung selisih antara harga asli (kotor) dengan harga yang harus dibayar
  const totalSavings = (cart.originalSubtotal || 0) - cart.subtotal;

  return (
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
                <div className="space-y-6">
                  {cart.cartItems.map((item) => {
                    // [UPDATE 2] Cek apakah item ini kena diskon
                    const hasDiscount = (item.discountAmount || 0) > 0;

                    return (
                      <div
                        key={item.id}
                        className="flex flex-col sm:flex-row items-center gap-4 border-b border-base-200 pb-6 last:border-0 last:pb-0"
                      >
                        {item.product.productImages?.[0]?.imageUrl && (
                          <div className="w-24 h-24 rounded-lg overflow-hidden bg-base-200 shrink-0 border border-base-200">
                            <img
                              src={item.product.productImages[0].imageUrl}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 w-full text-center sm:text-left">
                          <h3 className="font-bold text-lg">
                            {item.product.name}
                          </h3>
                          <p className="text-sm text-gray-500 mb-3">
                            {item.product.category?.name}
                          </p>

                          {/* [UPDATE 3] Tambahkan Badge Diskon disini */}
                          {hasDiscount && item.appliedDiscount && (
                            <div className="mb-3">
                              <span className="badge badge-secondary badge-sm gap-1 py-3 px-3">
                                {/* Ikon Tag Kecil */}
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.266 0 .52.105.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                {item.appliedDiscount.name}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center justify-center sm:justify-start gap-3">
                            <div className="join border border-base-300 rounded-lg">
                              <button
                                className="join-item btn btn-sm btn-ghost hover:bg-base-200"
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
                              <span className="join-item flex items-center px-4 bg-base-100 text-sm font-medium min-w-[3rem] justify-center">
                                {updatingItem === item.id ? (
                                  <span className="loading loading-spinner loading-xs"></span>
                                ) : (
                                  item.quantity
                                )}
                              </span>
                              <button
                                className="join-item btn btn-sm btn-ghost hover:bg-base-200"
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
                              className="btn btn-ghost btn-sm text-error hover:bg-error/10"
                              onClick={() => removeItem(item.id)}
                              disabled={updatingItem === item.id}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-4 h-4"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>

                        <div className="text-right min-w-[100px]">
                          {/* [UPDATE 4] Logika Tampilan Harga Coret vs Normal */}
                          {hasDiscount ? (
                            <div className="flex flex-col items-end">
                              {/* Harga Asli Dicoret (Abu-abu) */}
                              <span className="text-xs text-gray-400 line-through mb-1">
                                {formatPrice(
                                  (item.originalPrice ||
                                    item.product.defaultPrice) * item.quantity
                                )}
                              </span>
                              {/* Harga Akhir (Bold Primary) */}
                              <span className="font-bold text-lg text-primary">
                                {formatPrice(item.finalPrice || 0)}
                              </span>
                              {/* Info Hemat (Hijau) */}
                              <span className="text-xs text-success font-medium">
                                Hemat {formatPrice(item.discountAmount || 0)}
                              </span>
                            </div>
                          ) : (
                            /* Tampilan Normal jika tidak diskon */
                            <div className="flex flex-col items-end">
                              <span className="font-bold text-lg">
                                {formatPrice(
                                  item.product.defaultPrice * item.quantity
                                )}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatPrice(item.product.defaultPrice)} / pcs
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between items-center mt-6 pt-4 border-t border-base-200">
                  <button
                    className="btn btn-ghost btn-sm text-gray-500"
                    onClick={clearCart}
                  >
                    Clear Cart
                  </button>
                  <Link href="/" className="btn btn-outline btn-sm">
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card bg-base-100 shadow-xl sticky top-24">
              <div className="card-body bg-base-100/50">
                <h2 className="card-title text-lg mb-4">Order Summary</h2>

                <div className="space-y-3 text-sm">
                  {/* [UPDATE 5] Total Price menampilkan Harga Asli (Original Subtotal) */}
                  <div className="flex justify-between text-gray-600">
                    <span>Total Price ({cart.totalItems} items)</span>
                    <span>
                      {formatPrice(cart.originalSubtotal || cart.subtotal)}
                    </span>
                  </div>

                  {/* [UPDATE 6] Baris Total Savings (Hanya muncul jika hemat > 0) */}
                  {totalSavings > 0 && (
                    <div className="flex justify-between text-success font-medium">
                      <span>Total Savings</span>
                      <span>-{formatPrice(totalSavings)}</span>
                    </div>
                  )}

                  <div className="divider my-2"></div>

                  {/* [UPDATE 7] Total Amount dengan info hemat */}
                  <div className="flex justify-between items-end">
                    <span className="font-bold text-lg">Total Amount</span>
                    <div className="text-right">
                      <span className="font-bold text-2xl text-primary block">
                        {formatPrice(cart.subtotal)}
                      </span>
                      {totalSavings > 0 && (
                        <span className="text-xs text-success">
                          You saved {formatPrice(totalSavings)}!
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* INFO VOUCHER (UX Improvement) */}
                <div className="alert alert-success/10 text-xs mt-4 py-2 px-3 rounded-lg border border-success/20">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="stroke-success shrink-0 w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  <span>Have a voucher code? Apply it at checkout!</span>
                </div>

                <div className="mt-6">
                  <button
                    className="btn btn-primary btn-block shadow-lg shadow-primary/20"
                    onClick={proceedToCheckout}
                    disabled={cart.cartItems.some(
                      (i) => i.quantity > i.stockAvailable
                    )}
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
