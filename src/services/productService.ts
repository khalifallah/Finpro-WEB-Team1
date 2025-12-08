import { axiosInstance } from '@/libs/axios/axios.config';
import {
  ProductQuery,
  ProductResponse,
  CreateProductRequest,
  UpdateProductRequest,
  ProductListResponse,
} from '@/types/product.types';

export const productService = {
  /**
   * Get all products with pagination
   * Backend returns: { products: [...], pagination: {...} }
   */
  getProducts: async (query: ProductQuery): Promise<ProductListResponse> => {
    try {
      const response = await axiosInstance.get('/products', { params: query });

      return {
        data: {
          products: response.data.products || [],
          total: response.data.total || 0, // ✅ Tambahkan ini
        },
        pagination: {
          page: response.data.pagination?.page || query.page || 1,
          limit: response.data.pagination?.limit || query.limit || 10,
          total: response.data.total || 0,
          totalPages: Math.ceil((response.data.total || 0) / (query.limit || 10)),
        },
      };
    } catch (error) {
      console.error('Error fetching products:', error);
      return {
        data: {
          products: [],
          total: 0, // ✅ Tambahkan ini
        },
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      };
    }
  },

  getProductById: async (id: number): Promise<ProductResponse> => {
    try {
      const response = await axiosInstance.get(`/products/${id}`);
      // ✅ Adjust based on actual backend response
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },

  createProduct: async (
    data: CreateProductRequest,
    images: File[]
  ): Promise<ProductResponse> => {
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('price', String(data.price));
      formData.append('categoryId', String(data.categoryId));
      if (data.storeId) formData.append('storeId', String(data.storeId));

      images.forEach((image) => {
        formData.append('productImages', image);
      });

      const response = await axiosInstance.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  updateProduct: async (
    id: number,
    data: UpdateProductRequest,
    images?: File[]
  ): Promise<ProductResponse> => {
    try {
      const formData = new FormData();
      if (data.name) formData.append('name', data.name);
      if (data.description) formData.append('description', data.description);
      if (data.price !== undefined) formData.append('price', String(data.price));
      if (data.categoryId) formData.append('categoryId', String(data.categoryId));

      if (images && images.length > 0) {
        images.forEach((image) => {
          formData.append('productImages', image);
        });
      }

      const response = await axiosInstance.put(`/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  deleteProduct: async (id: number): Promise<void> => {
    try {
      await axiosInstance.delete(`/products/${id}`);
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  /**
   * Get all categories
   */
  getCategories: async (search?: string): Promise<{ data: any[] }> => {
    try {
      const response = await axiosInstance.get('/categories', {
        params: search ? { search } : undefined,
      });
      return {
        data: response.data.data || response.data || [],
      };
    } catch (error) {
      console.error('Error fetching categories:', error);
      return { data: [] };
    }
  },

  createCategory: async (data: any): Promise<any> => {
    try {
      const response = await axiosInstance.post('/categories', data);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  updateCategory: async (id: number, data: any): Promise<any> => {
    try {
      const response = await axiosInstance.put(`/categories/${id}`, data);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  },

  deleteCategory: async (id: number): Promise<void> => {
    try {
      await axiosInstance.delete(`/categories/${id}`);
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  },
};