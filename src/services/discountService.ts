import { axiosAuthInstance } from "@/libs/axios/axios.config";
import axiosError from "@/libs/axios/axios.error";
import {
  DiscountQuery,
  CreateDiscountRuleRequest,
  UpdateDiscountRuleRequest,
  DiscountRuleResponse,
  DiscountListResponse,
  ApplyDiscountRequest,
  DiscountUsageListResponse,
} from "@/types/discount.types";

export const discountService = {
  // GET /discounts (ADMIN)
  getDiscountRules: async (
    query: DiscountQuery,
    token: string
  ): Promise<DiscountListResponse> => {
    try {
      const instance = axiosAuthInstance(token);
      const response = await instance.get("/discounts", { params: query });
      return response.data.data;
    } catch (error) {
      axiosError(error, "Failed to fetch discounts");
      throw error;
    }
  },

  // GET /discounts/:id
  getDiscountById: async (
    id: number,
    token: string
  ): Promise<DiscountRuleResponse> => {
    try {
      const instance = axiosAuthInstance(token);
      const response = await instance.get(`/discounts/${id}`);
      return response.data.data;
    } catch (error) {
      axiosError(error, "Failed to fetch discount");
      throw error;
    }
  },

  // POST /discounts (STORE_ADMIN)
  createDiscountRule: async (
    data: CreateDiscountRuleRequest,
    token: string
  ): Promise<DiscountRuleResponse> => {
    try {
      const instance = axiosAuthInstance(token);
      const response = await instance.post("/discounts", data);
      return response.data.data;
    } catch (error) {
      axiosError(error, "Failed to create discount");
      throw error;
    }
  },

  // PUT /discounts/:id (STORE_ADMIN)
  updateDiscountRule: async (
    id: number,
    data: UpdateDiscountRuleRequest,
    token: string
  ): Promise<DiscountRuleResponse> => {
    try {
      const instance = axiosAuthInstance(token);
      const response = await instance.put(`/discounts/${id}`, data);
      return response.data.data;
    } catch (error) {
      axiosError(error, "Failed to update discount");
      throw error;
    }
  },

  // DELETE /discounts/:id (STORE_ADMIN)
  deleteDiscountRule: async (id: number, token: string): Promise<void> => {
    try {
      const instance = axiosAuthInstance(token);
      await instance.delete(`/discounts/${id}?confirm=yes`);
    } catch (error) {
      axiosError(error, "Failed to delete discount");
      throw error;
    }
  },

  // GET /discounts/deleted (SUPER_ADMIN)
  getDeletedDiscountRules: async (
    query: DiscountQuery | undefined,
    token: string
  ): Promise<DiscountListResponse> => {
    try {
      const instance = axiosAuthInstance(token);
      const response = await instance.get("/discounts/deleted", { params: query });
      return response.data.data;
    } catch (error) {
      axiosError(error, "Failed to fetch deleted discounts");
      throw error;
    }
  },

  // PUT /discounts/:id/restore (SUPER_ADMIN)
  restoreDiscountRule: async (
    id: number,
    token: string
  ): Promise<DiscountRuleResponse> => {
    try {
      const instance = axiosAuthInstance(token);
      const response = await instance.put(`/discounts/${id}/restore`, {});
      return response.data.data;
    } catch (error) {
      axiosError(error, "Failed to restore discount");
      throw error;
    }
  },

  // POST /discounts/apply
  applyDiscount: async (
    data: ApplyDiscountRequest,
    token: string
  ): Promise<any> => {
    try {
      const instance = axiosAuthInstance(token);
      const response = await instance.post("/discounts/apply", data);
      return response.data.data;
    } catch (error) {
      axiosError(error, "Failed to apply discount");
      throw error;
    }
  },

  // GET /discounts/:id/usages
  getDiscountUsages: async (
    discountId: number,
    page = 1,
    limit = 10,
    token: string
  ): Promise<DiscountUsageListResponse> => {
    try {
      const instance = axiosAuthInstance(token);
      const response = await instance.get(`/discounts/${discountId}/usages`, {
        params: { page, limit },
      });
      return response.data.data;
    } catch (error) {
      axiosError(error, "Failed to fetch discount usages");
      throw error;
    }
  },
};