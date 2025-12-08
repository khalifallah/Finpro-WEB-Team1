export interface CartProductImage {
  imageUrl: string;
}

export interface CartProduct {
  id: number;
  name: string;
  defaultPrice: number;
  category?: {
    name: string;
  };
  productImages?: CartProductImage[];
}

export interface CartItem {
  id: number;
  cartId: number;
  productId: number;
  quantity: number;
  stockAvailable: number;
  product: CartProduct;
}

export interface Cart {
  id: number;
  userId: number;
  storeId: number;
  cartItems: CartItem[];
  totalItems: number;
  subtotal: number;
}
