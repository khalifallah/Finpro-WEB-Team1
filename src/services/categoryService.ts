import { axiosInstance } from "@/libs/axios/axios.config";
import axiosError from "@/libs/axios/axios.error";
import {
  CategoryResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "@/types/product.types";

export interface GetCategoriesParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const categoryService = {
  // GET /categories (ADMIN) - DENGAN SUPPORT SEARCH
  getCategories: async (params?: GetCategoriesParams): Promise<any> => {
    try {
      const queryParams: any = {
        page: params?.page || 1,
        limit: params?.limit || 10,
      };

      // ADD SEARCH PARAM IF PROVIDED
      if (params?.search && params.search.trim() !== '') {
        queryParams.search = params.search.trim();
      }

      const response = await axiosInstance.get("/categories", {
        params: queryParams,
      });

      // FIX: Return correct data structure
      // API returns: { categories: [...], total: 11, ... }
      const responseData = response.data.data || response.data;
      return responseData;

    } catch (error) {
      axiosError(error, "Failed to fetch categories");
      throw error;
    }
  },

  // GET /categories/:id
  getCategoryById: async (id: number): Promise<CategoryResponse> => {
    try {
      const response = await axiosInstance.get(`/categories/${id}`);
      return response.data.data;
    } catch (error) {
      axiosError(error, "Failed to fetch category");
      throw error;
    }
  },

  // POST /categories (SUPER_ADMIN)
  createCategory: async (
    data: CreateCategoryRequest
  ): Promise<CategoryResponse> => {
    try {
      const response = await axiosInstance.post("/categories", data);
      return response.data.data;
    } catch (error) {
      axiosError(error, "Failed to create category");
      throw error;
    }
  },

  // PUT /categories/:id (SUPER_ADMIN)
  updateCategory: async (
    id: number,
    data: UpdateCategoryRequest
  ): Promise<CategoryResponse> => {
    try {
      const response = await axiosInstance.put(`/categories/${id}`, data);
      return response.data.data;
    } catch (error) {
      axiosError(error, "Failed to update category");
      throw error;
    }
  },

  // DELETE /categories/:id (SUPER_ADMIN)
  deleteCategory: async (id: number): Promise<void> => {
    try {
      await axiosInstance.delete(`/categories/${id}?confirm=yes`);
    } catch (error) {
      axiosError(error, "Failed to delete category");
      throw error;
    }
  },

  // GET /categories/deleted (SUPER_ADMIN)
  getDeletedCategories: async (page = 1, limit = 10): Promise<any> => {
    try {
      const response = await axiosInstance.get("/categories/deleted", {
        params: { page, limit },
      });
      return response.data.data;
    } catch (error) {
      axiosError(error, "Failed to fetch deleted categories");
      throw error;
    }
  },

  // PUT /categories/:id/restore (SUPER_ADMIN)
  restoreCategory: async (id: number): Promise<CategoryResponse> => {
    try {
      const response = await axiosInstance.put(`/categories/${id}/restore`, {});
      return response.data.data;
    } catch (error) {
      axiosError(error, "Failed to restore category");
      throw error;
    }
  },
};