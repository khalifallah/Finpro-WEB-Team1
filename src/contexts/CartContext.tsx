"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import { cartService } from "@/services/cart.services";
import { Cart } from "@/types/cart.types";

interface CartContextType {
  cart: Cart | null;
  cartCount: number;
  isLoading: boolean;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshCart = async () => {
    if (!user) {
      setCart(null);
      return;
    }

    try {
      setIsLoading(true);

      // Get token and check if valid
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("No token found, skipping cart refresh");
        return;
      }

      const storedStoreId = localStorage.getItem("storeId");
      const storeId = storedStoreId ? Number(storedStoreId) : undefined;

      const cartData = await cartService.getCart(storeId);

      // Ensure cart items exist
      if (
        cartData &&
        (!cartData.cartItems || cartData.cartItems.length === 0)
      ) {
        // Keep existing cart if new one is empty
        if (cart?.cartItems && cart.cartItems.length > 0) {
          console.log("Received empty cart but keeping existing cart data");
          return;
        }
      }

      setCart(cartData);
    } catch (error) {
      console.error("Failed to fetch cart:", error);
      // Don't reset cart on error, keep existing data
      if (!cart) {
        setCart(null);
      }
    } finally {
      setIsLoading(false);
    }
  };
  // Ambil data cart saat user login atau refresh halaman
  useEffect(() => {
    if (user) {
      refreshCart();
    } else {
      setCart(null);
    }
  }, [user]);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount: cart?.totalItems || 0, // Backend temanmu sudah hitung totalItems
        isLoading,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
