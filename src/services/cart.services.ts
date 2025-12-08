import { axiosInstance } from "@/libs/axios/axios.config";
import { Cart } from "@/types/cart.types";

export const cartService = {
  getCart: async (storeId?: number) => {
    const url = storeId ? `/cart?storeId=${storeId}` : "/cart";
    const response = await axiosInstance.get(url);
    return response.data.data.cart as Cart;
  },

  updateItemQty: async (cartItemId: number, quantity: number) => {
    const response = await axiosInstance.patch(`/cart/items/${cartItemId}`, {
      quantity,
    });
    return response.data;
  },

  removeItem: async (cartItemId: number) => {
    const response = await axiosInstance.delete(`/cart/items/${cartItemId}`);
    return response.data;
  },

  clearCart: async () => {
    const response = await axiosInstance.delete("/cart");
    return response.data;
  },

  getCheckoutPreview: async () => {
    const response = await axiosInstance.get("/orders/checkout/preview");
    return response.data;
  },
};
