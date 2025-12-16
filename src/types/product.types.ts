// ============ REQUEST TYPES ============
export interface ProductQuery {
  search?: string;
  categoryId?: number;
  storeId?: number;
  page?: number;
  limit?: number;
  sortBy?: "name" | "price" | "createdAt";
  sortOrder?: "asc" | "desc";
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

// ============ RESPONSE TYPES ============

/**
 * Single Product Response
 */
export interface ProductResponse {
  id: number;
  name: string;
  description: string;
  price: number;
  category: { id: number; name: string };
  // Change from productImages to images
  images: Array<{ id: number; imageUrl: string }>;
  stock: number;
  canAddToCart: boolean;
}
/**
 * Pagination Info (sesuai backend)
 */
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

/**
 * Match backend response structure
 * Backend returns: { data: { products, total }, pagination: {...} }
 */
export interface ProductListResponse {
  data: {
    products: ProductResponse[];
    total: number; // ✅ Tambahkan ini
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Alternative: If backend wraps everything in response
 */
export interface ApiProductListResponse {
  success?: boolean;
  message?: string;
  data: {
    products: ProductResponse[];
    total: number;
  };
  pagination: PaginationInfo;
}

// ============ CATEGORY TYPES ============

export interface CategoryResponse {
  id: number;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateCategoryRequest {
  name: string;
}

export interface UpdateCategoryRequest {
  name?: string;
}
