import { axiosAuthInstance } from "@/libs/axios/axios.config";
import axiosError from "@/libs/axios/axios.error";
import {
  MonthlySalesListResponse,
  SalesByCategoryListResponse,
  SalesByProductListResponse,
  StockSummaryListResponse,
  StockDetailListResponse,
} from "@/types/report.types";

export const reportService = {
  // GET /reports/sales/monthly
  getMonthlySalesReport: async (
    month: number,
    year: number,
    token: string,
    storeId?: number
  ): Promise<MonthlySalesListResponse> => {
    try {
      const instance = axiosAuthInstance(token);
      const response = await instance.get("/reports/sales/monthly", {
        params: { month, year, storeId },
      });
      return response.data.data;
    } catch (error) {
      axiosError(error, "Failed to fetch monthly sales report");
      throw error;
    }
  },

  // GET /reports/sales/by-category
  getSalesByCategoryReport: async (
    month: number,
    year: number,
    token: string,
    storeId?: number
  ): Promise<SalesByCategoryListResponse> => {
    try {
      const instance = axiosAuthInstance(token);
      const response = await instance.get("/reports/sales/by-category", {
        params: { month, year, storeId },
      });
      return response.data.data;
    } catch (error) {
      axiosError(error, "Failed to fetch sales by category report");
      throw error;
    }
  },

  // GET /reports/sales/by-product
  getSalesByProductReport: async (
    month: number,
    year: number,
    token: string,
    storeId?: number
  ): Promise<SalesByProductListResponse> => {
    try {
      const instance = axiosAuthInstance(token);
      const response = await instance.get("/reports/sales/by-product", {
        params: { month, year, storeId },
      });
      return response.data.data;
    } catch (error) {
      axiosError(error, "Failed to fetch sales by product report");
      throw error;
    }
  },

  // GET /reports/stock/summary
  getStockSummaryReport: async (
    month: number,
    year: number,
    token: string,
    storeId?: number
  ): Promise<StockSummaryListResponse> => {
    try {
      const instance = axiosAuthInstance(token);
      const response = await instance.get("/reports/stock/summary", {
        params: { month, year, storeId },
      });
      return response.data.data;
    } catch (error) {
      axiosError(error, "Failed to fetch stock summary report");
      throw error;
    }
  },

  // GET /reports/stock/detail
  getStockDetailReport: async (
    month: number,
    year: number,
    token: string,
    storeId?: number,
    productId?: number
  ): Promise<StockDetailListResponse> => {
    try {
      const instance = axiosAuthInstance(token);
      const response = await instance.get("/reports/stock/detail", {
        params: { month, year, storeId, productId },
      });
      return response.data.data;
    } catch (error) {
      axiosError(error, "Failed to fetch stock detail report");
      throw error;
    }
  },
};