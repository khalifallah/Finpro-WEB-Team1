import { axiosInstance } from '@/libs/axios/axios.config';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const productService = {
  // ✅ Get all products - IMPROVED
  getProducts: async (params?: { page?: number; limit?: number; search?: string }) => {
    try {
      const response = await axiosInstance.get('/products', { params });
      
      console.log('Raw API response:', response.data); // Debug log
      
      // Handle berbagai struktur response dari backend
      if (response.data?.data) {
        // Struktur: { data: { products: [...], pagination: {...} } }
        return response.data.data;
      } else if (response.data?.products) {
        // Struktur: { products: [...], pagination: {...} }
        return response.data;
      } else if (Array.isArray(response.data)) {
        // Struktur: [...]
        return { products: response.data, pagination: { page: 1, limit: 10, total: response.data.length, totalPages: 1 } };
      } else {
        // Default fallback
        return response.data;
      }
    } catch (error: any) {
      console.error('getProducts error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch products');
    }
  },

  // ✅ Get product by ID
  getProductById: async (id: number) => {
    try {
      const response = await axiosInstance.get(`/products/${id}`);
      
      // Handle berbagai struktur
      if (response.data?.data) {
        return response.data.data;
      }
      return response.data;
    } catch (error: any) {
      console.error('getProductById error:', error);
      throw new Error(error.response?.data?.message || 'Product not found');
    }
  },

  // ✅ Update product
  updateProduct: async (id: number, data: {
    name?: string;
    description?: string;
    price?: number;
    categoryId?: number;
  }) => {
    try {
      const response = await axiosInstance.put(`/products/${id}`, data);
      return response.data?.data || response.data;
    } catch (error: any) {
      console.error('updateProduct error:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Product not found');
      }
      if (error.response?.status === 403) {
        throw new Error('You do not have permission to update this product');
      }
      
      throw new Error(error.response?.data?.message || 'Failed to update product');
    }
  },

  // ✅ Get categories
  getCategories: async () => {
    try {
      const response = await axiosInstance.get('/categories');
      const data = response.data;
      
      // Handle berbagai struktur response
      if (Array.isArray(data)) {
        return data;
      } else if (Array.isArray(data?.data)) {
        return data.data;
      } else if (Array.isArray(data?.categories)) {
        return data.categories;
      } else if (Array.isArray(data?.data?.categories)) {
        return data.data.categories;
      }
      
      console.warn('Unexpected categories response structure:', data);
      return [];
    } catch (error) {
      console.error('getCategories error:', error);
      return [];
    }
  },

  // Delete product
  deleteProduct: async (id: number) => {
    try {
      const response = await axiosInstance.delete(`/products/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete product');
    }
  },

  // Create product
  createProduct: async (data: FormData) => {
    try {
      const response = await axiosInstance.post('/products', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data?.data || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create product');
    }
  },
};