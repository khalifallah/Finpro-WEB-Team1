import { axiosAuthInstance } from "@/libs/axios/axios.config";
import axiosError from "@/libs/axios/axios.error";
import {
  UserResponse,
  CreateUserRequest,
  UpdateUserRequest,
  UserListResponse,
} from "@/types/user.types";

export const userService = {
  // GET /admin/users (SUPER_ADMIN)
  getAllUsers: async (
    page = 1,
    limit = 10,
    token: string
  ): Promise<UserListResponse> => {
    try {
      const instance = axiosAuthInstance(token);
      const response = await instance.get("/admin/users", {
        params: { page, limit },
      });
      return response.data.data;
    } catch (error) {
      axiosError(error, "Failed to fetch users");
      throw error;
    }
  },

  // GET /admin/store-admins (SUPER_ADMIN)
  getStoreAdmins: async (
    page = 1,
    limit = 10,
    token: string
  ): Promise<UserListResponse> => {
    try {
      const instance = axiosAuthInstance(token);
      const response = await instance.get("/admin/store-admins", {
        params: { page, limit },
      });
      return response.data.data;
    } catch (error) {
      axiosError(error, "Failed to fetch store admins");
      throw error;
    }
  },

  // POST /admin/store-admins (SUPER_ADMIN)
  createStoreAdmin: async (
    data: CreateUserRequest,
    token: string
  ): Promise<UserResponse> => {
    try {
      const instance = axiosAuthInstance(token);
      const response = await instance.post("/admin/store-admins", data);
      return response.data.data;
    } catch (error) {
      axiosError(error, "Failed to create store admin");
      throw error;
    }
  },

  // PUT /admin/users/:id (SUPER_ADMIN)
  updateUser: async (
    id: number,
    data: UpdateUserRequest,
    token: string
  ): Promise<UserResponse> => {
    try {
      const instance = axiosAuthInstance(token);
      const response = await instance.put(`/admin/users/${id}`, data);
      return response.data.data;
    } catch (error) {
      axiosError(error, "Failed to update user");
      throw error;
    }
  },

  // DELETE /admin/users/:id (SUPER_ADMIN)
  deleteUser: async (id: number, token: string): Promise<void> => {
    try {
      const instance = axiosAuthInstance(token);
      await instance.delete(`/admin/users/${id}`);
    } catch (error) {
      axiosError(error, "Failed to delete user");
      throw error;
    }
  },
};