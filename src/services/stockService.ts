import { axiosAuthInstance } from "@/libs/axios/axios.config";
import axiosError from "@/libs/axios/axios.error";
import {
  StockQuery,
  CreateStockRequest,
  UpdateStockRequest,
  StockResponse,
  StockListResponse,
  StockJournalListResponse,
} from "@/types/stock.types";

export const stockService = {
  // GET /stocks (ADMIN)
  getStocks: async (
    query: StockQuery,
    token: string
  ): Promise<StockListResponse> => {
    try {
      const instance = axiosAuthInstance(token);
      const response = await instance.get("/stocks", { params: query });
      return response.data.data;
    } catch (error) {
      axiosError(error, "Failed to fetch stocks");
      throw error;
    }
  },

  // GET /stocks/:id
  getStockById: async (id: number, token: string): Promise<StockResponse> => {
    try {
      const instance = axiosAuthInstance(token);
      const response = await instance.get(`/stocks/${id}`);
      return response.data.data;
    } catch (error) {
      axiosError(error, "Failed to fetch stock");
      throw error;
    }
  },

  // POST /stocks (SUPER_ADMIN)
  createStock: async (
    data: CreateStockRequest,
    token: string
  ): Promise<StockResponse> => {
    try {
      const instance = axiosAuthInstance(token);
      const response = await instance.post("/stocks", data);
      return response.data.data;
    } catch (error) {
      axiosError(error, "Failed to create stock");
      throw error;
    }
  },

  // PUT /stocks/:id (ADMIN)
  updateStock: async (
    id: number,
    data: UpdateStockRequest,
    token: string
  ): Promise<StockResponse> => {
    try {
      const instance = axiosAuthInstance(token);
      const response = await instance.put(`/stocks/${id}`, data);
      return response.data.data;
    } catch (error) {
      axiosError(error, "Failed to update stock");
      throw error;
    }
  },

  // DELETE /stocks/:id (ADMIN)
  deleteStock: async (id: number, token: string): Promise<void> => {
    try {
      const instance = axiosAuthInstance(token);
      await instance.delete(`/stocks/${id}?confirm=yes`);
    } catch (error) {
      axiosError(error, "Failed to delete stock");
      throw error;
    }
  },

  // GET /stocks/:id/journals
  getStockJournals: async (
    stockId: number,
    page = 1,
    limit = 10,
    token: string
  ): Promise<StockJournalListResponse> => {
    try {
      const instance = axiosAuthInstance(token);
      const response = await instance.get(`/stocks/${stockId}/journals`, {
        params: { page, limit },
      });
      return response.data.data;
    } catch (error) {
      axiosError(error, "Failed to fetch stock journals");
      throw error;
    }
  },

  // PATCH /stocks/:id/restore
  restoreStock: async (id: number, token: string): Promise<StockResponse> => {
    try {
      const instance = axiosAuthInstance(token);
      const response = await instance.patch(`/stocks/${id}/restore`, {});
      return response.data.data;
    } catch (error) {
      axiosError(error, "Failed to restore stock");
      throw error;
    }
  },
};