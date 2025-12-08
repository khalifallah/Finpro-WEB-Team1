export interface DiscountQuery {
  productId?: number;
  type?: 'BOGO' | 'DIRECT_PERCENTAGE' | 'DIRECT_NOMINAL';
  page?: number;
  limit?: number;
  sortBy?: 'description' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateDiscountRuleRequest {
  productId?: number;
  description: string;
  type: 'BOGO' | 'DIRECT_PERCENTAGE' | 'DIRECT_NOMINAL';
  value?: number;
  minPurchase?: number;
  maxDiscountAmount?: number;
  startDate?: Date;
  endDate?: Date;
}

export interface UpdateDiscountRuleRequest {
  description?: string;
  value?: number;
  minPurchase?: number;
  maxDiscountAmount?: number;
}

export interface DiscountRuleResponse {
  id: number;
  productId?: number;
  product?: {
    id: number;
    name: string;
  };
  description: string;
  type: 'BOGO' | 'DIRECT_PERCENTAGE' | 'DIRECT_NOMINAL';
  value?: number;
  minPurchase?: number;
  maxDiscountAmount?: number;
  startDate?: Date;
  endDate?: Date;
  storeId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DiscountListResponse {
  discounts: DiscountRuleResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface ApplyDiscountRequest {
  discountId: number;
  orderId?: number;
}

export interface DiscountUsageResponse {
  id: number;
  discountId: number;
  userId: number;
  usedAt: Date;
}

export interface DiscountUsageListResponse {
  usages: DiscountUsageResponse[];
  total: number;
  page: number;
  limit: number;
}