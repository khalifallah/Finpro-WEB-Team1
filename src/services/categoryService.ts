import { axiosInstance, axiosAuthInstance } from "@/libs/axios/axios.config";
import axiosError from "@/libs/axios/axios.error";
import {
  CategoryResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "@/types/product.types";

export const categoryService = {
  // GET /categories (ADMIN)
  getCategories: async (
    page = 1,
    limit = 10,
    token?: string
  ): Promise<any> => {
    try {
      const instance = token ? axiosAuthInstance(token) : axiosInstance;
      const response = await instance.get("/categories", {
        params: { page, limit },
      });
      return response.data.data;
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
    data: CreateCategoryRequest,
    token: string
  ): Promise<CategoryResponse> => {
    try {
      const instance = axiosAuthInstance(token);
      const response = await instance.post("/categories", data);
      return response.data.data;
    } catch (error) {
      axiosError(error, "Failed to create category");
      throw error;
    }
  },

  // PUT /categories/:id (SUPER_ADMIN)
  updateCategory: async (
    id: number,
    data: UpdateCategoryRequest,
    token: string
  ): Promise<CategoryResponse> => {
    try {
      const instance = axiosAuthInstance(token);
      const response = await instance.put(`/categories/${id}`, data);
      return response.data.data;
    } catch (error) {
      axiosError(error, "Failed to update category");
      throw error;
    }
  },

  // DELETE /categories/:id (SUPER_ADMIN)
  deleteCategory: async (id: number, token: string): Promise<void> => {
    try {
      const instance = axiosAuthInstance(token);
      await instance.delete(`/categories/${id}?confirm=yes`);
    } catch (error) {
      axiosError(error, "Failed to delete category");
      throw error;
    }
  },

  // GET /categories/deleted (SUPER_ADMIN)
  getDeletedCategories: async (
    page = 1,
    limit = 10,
    token?: string
  ): Promise<any> => {
    try {
      const instance = token ? axiosAuthInstance(token) : axiosInstance;
      const response = await instance.get("/categories/deleted", {
        params: { page, limit },
      });
      return response.data.data;
    } catch (error) {
      axiosError(error, "Failed to fetch deleted categories");
      throw error;
    }
  },

  // PUT /categories/:id/restore (SUPER_ADMIN)
  restoreCategory: async (
    id: number,
    token: string
  ): Promise<CategoryResponse> => {
    try {
      const instance = axiosAuthInstance(token);
      const response = await instance.put(`/categories/${id}/restore`, {});
      return response.data.data;
    } catch (error) {
      axiosError(error, "Failed to restore category");
      throw error;
    }
  },
};