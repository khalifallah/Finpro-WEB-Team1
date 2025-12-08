export interface StockQuery {
  productId?: number;
  storeId?: number;
  page?: number;
  limit?: number;
  sortBy?: 'product' | 'quantity' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateStockRequest {
  productId: number;
  storeId: number;
  quantity: number;
  reason?: string;
}

export interface UpdateStockRequest {
  quantity: number;
  reason: string; // Alasan perubahan stok (IN/OUT)
}

export interface StockResponse {
  id: number;
  productId: number;
  storeId: number;
  quantity: number;
  product?: {
    id: number;
    name: string;
  };
  store?: {
    id: number;
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface StockJournalResponse {
  id: number;
  stockId: number;
  type: 'IN' | 'OUT';
  quantity: number;
  reason: string;
  adminId: number;
  createdAt: Date;
}

export interface StockListResponse {
  stocks: StockResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface StockJournalListResponse {
  journals: StockJournalResponse[];
  total: number;
  page: number;
  limit: number;
}