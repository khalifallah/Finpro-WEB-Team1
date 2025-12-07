"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import AuthGuard from "@/components/AuthGuard";
import { axiosInstance } from "@/libs/axios/axios.config";
import Link from "next/link";

export default function CartPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingItem, setUpdatingItem] = useState<number | null>(null);

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axiosInstance.get("/cart", {
        params: { storeId: 1 },
      });

      const filteredCartItems = 
        response.data.data.cart?.cartItems?.filter(
          (item: any) => item && item.product && item.quantity > 0
        ) || [];

      setCart({
        ...response.data.data.cart,
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

  useEffect(() => {
    if (user && !user.emailVerifiedAt) {
      router.push("/profile");
    }
  }, [user, router]);

  const updateQuantity = async (cartItemId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      setError("Quantity must be at least 1");
      return;
    }

    try {
      setUpdatingItem(cartItemId);
      setError("");
      
      await axiosInstance.patch(`/cart/items/${cartItemId}`, { 
        quantity: newQuantity 
      });
      
      // Update local state immediately
      interface Product {
        name: string;
        defaultPrice: number;
        category?: {
          name: string;
        };
        productImages?: Array<{
          imageUrl: string;
        }>;
      }

      interface CartItem {
        id: number;
        quantity: number;
        product: Product;
      }

      interface Cart {
        cartItems: CartItem[];
        totalItems: number;
        subtotal: number;
      }

      setCart((prevCart: Cart | null): Cart | null => {
        if (!prevCart) return prevCart;
        
        const updatedItems: CartItem[] = prevCart.cartItems.map((item: CartItem): CartItem => {
          if (item.id === cartItemId) {
            return { ...item, quantity: newQuantity };
          }
          return item;
        });
        
        const totalItems: number = updatedItems.reduce((sum: number, item: CartItem): number => 
          sum + item.quantity, 0);
        const subtotal: number = updatedItems.reduce((sum: number, item: CartItem): number => 
          sum + (item.product.defaultPrice * item.quantity), 0);
        
        return {
          ...prevCart,
          cartItems: updatedItems,
          totalItems,
          subtotal
        };
      });
      
    } catch (err: any) {
      console.error("Update quantity error:", err);
      
      if (err.response?.status === 404) {
        setError("Item was removed from cart. Refreshing...");
        setTimeout(() => fetchCart(), 1000);
      } else if (err.response?.status === 400) {
        setError(err.response?.data?.message || "Invalid quantity");
      } else {
        setError(err.message || "Failed to update quantity");
      }
      
      // Refresh to sync with server
      fetchCart();
    } finally {
      setUpdatingItem(null);
    }
  };

  const removeItem = async (cartItemId: number) => {
    try {
      await axiosInstance.delete(`/cart/items/${cartItemId}`);
      
      // Update local state immediately
      interface Product {
        name: string;
        defaultPrice: number;
        category?: {
          name: string;
        };
        productImages?: Array<{
          imageUrl: string;
        }>;
      }

      interface CartItem {
        id: number;
        quantity: number;
        product: Product;
      }

      interface Cart {
        cartItems: CartItem[];
        totalItems: number;
        subtotal: number;
      }

      setCart((prevCart: Cart | null): Cart | null => {
        if (!prevCart) return prevCart;
        
        const filteredItems: CartItem[] = prevCart.cartItems.filter(
          (item: CartItem): boolean => item.id !== cartItemId
        );
        
        const totalItems: number = filteredItems.reduce((sum: number, item: CartItem): number => 
          sum + item.quantity, 0);
        const subtotal: number = filteredItems.reduce((sum: number, item: CartItem): number => 
          sum + (item.product.defaultPrice * item.quantity), 0);
        
        return {
          ...prevCart,
          cartItems: filteredItems,
          totalItems,
          subtotal
        };
      });
      
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to remove item");
      fetchCart();
    }
  };

  const clearCart = async () => {
    if (!confirm("Are you sure you want to clear your cart?")) return;
    
    try {
      await axiosInstance.delete("/cart");
      setCart(null);
      setError("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to clear cart");
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const proceedToCheckout = async () => {
    try {
      const response = await axiosInstance.get("/orders/checkout/preview");
      
      if (response.data.data.preview.canCheckout) {
        router.push("/checkout");
      } else {
        setError("Cannot proceed to checkout. Your cart may be empty or items unavailable.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to proceed to checkout");
    }
  };

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
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Your Cart</h1>
            <div className="max-w-md mx-auto">
              <svg className="w-24 h-24 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
              <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
              <p className="text-gray-500 mb-6">Add some products to your cart to start shopping</p>
              <Link href="/" className="btn btn-primary">Continue Shopping</Link>
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requireAuth requireVerification={true}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

        {error && (
          <div className="alert alert-error mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                  {cart.cartItems.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-4 border-b pb-4 last:border-0">
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
                        <p className="text-sm text-gray-600">{item.product.category?.name}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="join">
                            <button
                              className="join-item btn btn-xs"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1 || updatingItem === item.id}
                            >
                              {updatingItem === item.id ? <span className="loading loading-spinner loading-xs"></span> : "-"}
                            </button>
                            <input
                              type="number"
                              className="join-item input input-xs w-12 text-center"
                              value={item.quantity}
                              readOnly
                            />
                            <button
                              className="join-item btn btn-xs"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={updatingItem === item.id}
                            >
                              {updatingItem === item.id ? <span className="loading loading-spinner loading-xs"></span> : "+"}
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
                        <p className="font-bold">{formatPrice(item.product.defaultPrice * item.quantity)}</p>
                        <p className="text-sm text-gray-600">{formatPrice(item.product.defaultPrice)} each</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center mt-6">
                  <button className="btn btn-error btn-sm" onClick={clearCart}>Clear Cart</button>
                  <Link href="/" className="btn btn-outline">Continue Shopping</Link>
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
                  <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(cart.subtotal)}</span></div>
                  <div className="flex justify-between"><span>Items</span><span>{cart.totalItems}</span></div>
                  <div className="divider"></div>
                  <div className="flex justify-between text-lg font-bold"><span>Total</span><span>{formatPrice(cart.subtotal)}</span></div>
                </div>
                <div className="mt-6">
                  <button className="btn btn-primary btn-block" onClick={proceedToCheckout}>Proceed to Checkout</button>
                </div>
                <div className="mt-4 text-xs text-gray-500">
                  <p>Shipping costs and taxes will be calculated during checkout.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}