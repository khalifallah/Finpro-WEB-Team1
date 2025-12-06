import { axiosInstance } from '@/libs/axios/axios.config';
import {
  ProductQuery,
  ProductResponse,
  CreateProductRequest,
  UpdateProductRequest,
  ProductListResponse,
} from '@/types/product.types';

export const productService = {
  // GET /products
  getProducts: async (query: ProductQuery): Promise<ProductListResponse> => {
    try {
      const response = await axiosInstance.get('/products', { params: query });
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // GET /products/:id
  getProductById: async (id: number): Promise<ProductResponse> => {
    try {
      const response = await axiosInstance.get(`/products/${id}`);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // POST /products (Super Admin only)
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
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // PUT /products/:id (Super Admin only)
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
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // DELETE /products/:id (Super Admin only)
  deleteProduct: async (id: number): Promise<void> => {
    try {
      await axiosInstance.delete(`/products/${id}?confirm=yes`);
    } catch (error) {
      throw error;
    }
  },

  // GET /products/deleted (Super Admin only)
  getDeletedProducts: async (query?: ProductQuery): Promise<ProductListResponse> => {
    try {
      const response = await axiosInstance.get('/products/deleted', { params: query });
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // PUT /products/:id/restore (Super Admin only)
  restoreProduct: async (id: number): Promise<ProductResponse> => {
    try {
      const response = await axiosInstance.put(`/products/${id}/restore`, {});
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },
};