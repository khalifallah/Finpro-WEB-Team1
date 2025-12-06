export interface MonthlySalesReport {
  month: number;
  year: number;
  totalSales: number;
  totalTransactions: number;
  storeId?: number;
}

export interface SalesByCategoryReport {
  categoryId: number;
  categoryName: string;
  totalSales: number;
  quantity: number;
  month: number;
  year: number;
  storeId?: number;
}

export interface SalesByProductReport {
  productId: number;
  productName: string;
  totalSales: number;
  quantity: number;
  month: number;
  year: number;
  storeId?: number;
}

export interface StockSummaryReport {
  month: number;
  year: number;
  totalAddition: number;
  totalReduction: number;
  finalStock: number;
  storeId?: number;
}

export interface StockDetailReport {
  productId: number;
  productName: string;
  type: 'IN' | 'OUT';
  quantity: number;
  reason: string;
  date: Date;
  storeId?: number;
}

export interface MonthlySalesListResponse {
  data: MonthlySalesReport[];
  total: number;
}

export interface SalesByCategoryListResponse {
  data: SalesByCategoryReport[];
  total: number;
}

export interface SalesByProductListResponse {
  data: SalesByProductReport[];
  total: number;
}

export interface StockSummaryListResponse {
  data: StockSummaryReport[];
  total: number;
}

export interface StockDetailListResponse {
  data: StockDetailReport[];
  total: number;
}