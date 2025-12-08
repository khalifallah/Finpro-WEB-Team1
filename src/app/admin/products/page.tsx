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
      await productService.deleteProduct(productId);
      fetchProducts(pagination.page, searchQuery);
      setDeleteConfirm({ isOpen: false });
    } catch (error) {
      console.error('Failed to delete product:', error);
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

      {/* Search */}
      <div className="bg-gray-100 p-4 rounded-lg shadow-sm border border-gray-300">
        <SearchBar value={searchQuery} onChange={handleSearch} placeholder="Search products..." />
      </div>

      {/* Table - Menggunakan AdminProductList Component */}
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
        onConfirm={() => deleteConfirm.productId && handleDelete(deleteConfirm.productId)}
        title="Delete Product"
        message={`Delete "${deleteConfirm.productName}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}