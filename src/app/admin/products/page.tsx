'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import SearchBar from '@/components/common/SearchBar';
import Pagination from '@/components/common/Pagination';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import AdminProductList from '@/components/admin/AdminProductList';
import { ProductResponse } from '@/types/product.types';
import { productService } from '@/services/productService';

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function ProductPage() {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    productId?: number;
    productName?: string;
  }>({ isOpen: false });

  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async (page: number = 1, search: string = '') => {
    try {
      setLoading(true);
      const response = await productService.getProducts({
        page,
        limit: pagination.limit,
        search: search || undefined,
      });

      console.log('📦 Products API Response:', response); // Debug

      let productsData: ProductResponse[] = [];
      let total = 0;
      let totalPages = 0;

      // ✅ Handle response formats
      if (response?.products && Array.isArray(response.products)) {
        productsData = response.products;
        
        // Check pagination in different locations
        if (response.pagination) {
          total = response.pagination.total || productsData.length;
          totalPages = response.pagination.totalPages || 1;
        } else if (response.total !== undefined) {
          total = response.total;
          totalPages = response.totalPages || Math.ceil(total / pagination.limit);
        } else {
          total = productsData.length;
          totalPages = 1;
        }
      } else if (response?.data && Array.isArray(response.data)) {
        productsData = response.data;
        total = response.total || productsData.length;
        totalPages = response.totalPages || Math.ceil(total / pagination.limit);
      } else if (Array.isArray(response)) {
        productsData = response;
        total = response.length;
        totalPages = 1;
      }

      console.log('✅ Parsed:', { count: productsData.length, total, totalPages });

      setProducts(productsData);
      setPagination({
        page,
        limit: pagination.limit,
        total,
        totalPages,
      });
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    fetchProducts(1, query);
  };

  const handleDelete = async (productId: number) => {
    try {
      setLoading(true);
      await productService.deleteProduct(productId);
      await fetchProducts(pagination.page, searchQuery);
      setDeleteConfirm({ isOpen: false });
    } catch (error: any) {
      console.error('Failed to delete product:', error);
      setError(error.message || 'Failed to delete product');
      setTimeout(() => setDeleteConfirm({ isOpen: false }), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    fetchProducts(page, searchQuery);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-2 text-sm">Manage all products ({pagination.total} total)</p>
        </div>
        <Link href="/admin/products/new" className="btn btn-primary gap-2">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          New Product
        </Link>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-error gap-3 rounded-lg border border-red-300 bg-red-50">
          <svg className="stroke-current shrink-0 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Search */}
      <div className="bg-gray-100 p-4 rounded-lg shadow-sm border border-gray-300">
        <SearchBar value={searchQuery} onChange={handleSearch} placeholder="Search products..." />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {products.length > 0 && (
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
            <p className="text-sm text-gray-600 font-medium">
              Showing {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} products
            </p>
          </div>
        )}

        <AdminProductList
          products={products}
          loading={loading}
          onDelete={(id, name) =>
            setDeleteConfirm({ isOpen: true, productId: id, productName: name })
          }
        />

        {/* ✅ Pagination */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false })}
        onConfirm={() => {
          if (deleteConfirm.productId) {
            return handleDelete(deleteConfirm.productId);
          }
        }}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteConfirm.productName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        loading={loading}
      />
    </div>
  );
}