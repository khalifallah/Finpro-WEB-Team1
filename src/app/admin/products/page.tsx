'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import SearchBar from '@/components/common/SearchBar';
import Pagination from '@/components/common/Pagination';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import AdminProductList from '@/components/admin/AdminProductList'; // ← IMPORT COMPONENT BARU
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

      let productsData: ProductResponse[] = [];
      let paginationData = { page, limit: pagination.limit, total: 0, totalPages: 0 };

      if (response?.products && Array.isArray(response.products)) {
        productsData = response.products;
        paginationData = { page: response.pagination?.page || page, ...response.pagination };
      } else if (Array.isArray(response)) {
        productsData = response;
        paginationData = { page, limit: pagination.limit, total: response.length, totalPages: 1 };
      }

      setProducts(productsData);
      setPagination(paginationData);
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
      
      // Show loading state
      console.log(`Deleting product ${productId}...`);
      
      await productService.deleteProduct(productId);
      
      // Refresh list
      await fetchProducts(pagination.page, searchQuery);
      setDeleteConfirm({ isOpen: false });
      
      // Optional: Show success message
      console.log('Product deleted successfully');
    } catch (error: any) {
      console.error('Failed to delete product:', error);
      setError(error.message || 'Failed to delete product');
      
      // Don't close dialog on error, let user see the error
      setTimeout(() => {
        setDeleteConfirm({ isOpen: false });
      }, 2000);
    } finally {
      setLoading(false);
    }
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
              Showing {products.length} of {pagination.total} products
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

        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={(page) => fetchProducts(page, searchQuery)}
            />
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false })}
        onConfirm={() => {
          // ✅ FIX: Ensure it returns Promise<void> or void
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