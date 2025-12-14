import { axiosInstance } from '@/libs/axios/axios.config';

const getApiUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
};

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

export const productService = {
  // Get all products
  getProducts: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: number;
  }) => {
    try {
      const apiUrl = getApiUrl();
      const searchParams = new URLSearchParams();

      if (params?.page) searchParams.append('page', String(params.page));
      if (params?.limit) searchParams.append('limit', String(params.limit));
      if (params?.search) searchParams.append('search', params.search);
      if (params?.categoryId) searchParams.append('categoryId', String(params.categoryId));

      const response = await fetch(`${apiUrl}/products?${searchParams}`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      return response.json();
    } catch (error: any) {
      console.error('Get products error:', error);
      throw new Error(error.message || 'Failed to fetch products');
    }
  },

  // Get product by ID
  getProductById: async (id: number) => {
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/products/${id}`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch product');
      }

      return response.json();
    } catch (error: any) {
      console.error('Get product error:', error);
      throw new Error(error.message || 'Failed to fetch product');
    }
  },

  // Get categories
  getCategories: async () => {
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/categories`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }

      return response.json();
    } catch (error: any) {
      console.error('Get categories error:', error);
      throw new Error(error.message || 'Failed to fetch categories');
    }
  },

  // Create product
  createProduct: async (formData: FormData) => {
    try {
      const apiUrl = getApiUrl();
      const token = localStorage.getItem('token');

      const response = await fetch(`${apiUrl}/products`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const err = new Error(errorData.message || 'Failed to create product');
        // attach status so callers can detect forbidden (403)
        (err as any).status = response.status;
        throw err;
      }

      return response.json();
    } catch (error: any) {
      console.warn('Create product warning:', error);
      // Rethrow the original error so callers can inspect attached properties like `status`
      throw error;
    }
  },

  // Update product
  updateProduct: async (id: number, data: FormData | Record<string, any>) => {
    try {
      const apiUrl = getApiUrl();
      const token = localStorage.getItem('token');

      // Check if data is FormData (has images) or plain object
      const isFormData = data instanceof FormData;

      const response = await fetch(`${apiUrl}/products/${id}`, {
        method: 'PUT',
        headers: isFormData
          ? { Authorization: `Bearer ${token}` }
          : {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
        body: isFormData ? data : JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update product');
      }

      return response.json();
    } catch (error: any) {
      console.error('Update product error:', error);
      throw new Error(error.message || 'Failed to update product');
    }
  },

  // Delete product
  deleteProduct: async (productId: number) => {
    try {
      const apiUrl = getApiUrl();
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${apiUrl}/products/${productId}?confirm=yes`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 204) {
        return { success: true };
      }

      if (!response.ok) {
        let errorMessage = 'Failed to delete product';
        try {
          const errorData = await response.json();
          errorMessage = errorData?.message || errorData?.error || errorMessage;
        } catch {
          errorMessage = `Error: ${response.status} ${response.statusText}`;
        }
        const err = new Error(errorMessage);
        (err as any).status = response.status;
        throw err;
      }

      const text = await response.text();
      if (text) {
        return JSON.parse(text);
      }
      return { success: true };
    } catch (error: any) {
      console.warn('Delete product warning:', error);
      throw error;
    }
  },
};