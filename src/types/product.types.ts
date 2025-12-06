// Request types
export interface ProductQuery {
  search?: string;
  categoryId?: number;
  storeId?: number;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'price' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  categoryId: number;
  storeId?: number;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  price?: number;
  categoryId?: number;
}

// Response types (sesuai backend)
export interface ProductResponse {
  id: number;
  name: string;
  description: string;
  price: number;
  category: { id: number; name: string };
  productImages: Array<{ id: number; imageUrl: string }>;
  stock: number;
  canAddToCart: boolean;
}

// Pagination response
export interface ProductListResponse {
  products: ProductResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface CategoryResponse {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCategoryRequest {
  name: string;
}

export interface UpdateCategoryRequest {
  name?: string;
}