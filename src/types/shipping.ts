export interface ShippingService {
  service: string;
  serviceCode: string;
  serviceName: string;
  description: string;
  cost: number;
  etd: string;
  estimatedDays: string;
  maxDistance?: number;
}

export interface CheckoutPreview {
  canCheckout: boolean;
  addresses: any[];
  selectedAddress?: any;
  cartSummary: any[];
  subtotal: number;
  totalWeight: number;
  shippingOptions: ShippingService[];
  distance?: number;
  nearestStore?: any;
  discountAmount?: number;
  requiresAddress: boolean;
  totalDiscount?: number;
  voucherDeduction?: number;
  shippingDeduction?: number;
}

export interface CheckoutValidation {
  isValid: boolean;
  userAddress: any;
  nearestStore: any;
  shippingCost: number;
  distance: number;
  subtotal: number;
  availableShippingMethods: ShippingService[];
  totalDiscount?: number;
  voucherDeduction?: number;
  shippingDeduction?: number;
  finalTotal?: number;
}
