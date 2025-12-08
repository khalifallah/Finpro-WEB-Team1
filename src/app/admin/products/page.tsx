'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Table from '@/components/common/Table';
import SearchBar from '@/components/common/SearchBar';
import Pagination from '@/components/common/Pagination';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import Modal from '@/components/common/Modal';
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

  const [viewModal, setViewModal] = useState<{
    isOpen: boolean;
    product?: ProductResponse;
  }>({ isOpen: false });

  // Fetch products
  const fetchProducts = async (page: number = 1, search: string = '') => {
    try {
      setLoading(true);
      const response = await productService.getProducts({
        page,
        limit: pagination.limit,
        search: search || undefined,
      });

      console.log('Fetch response:', response); // Debug log

      // ✅ FIX: Handle berbagai struktur response
      let productsData: ProductResponse[] = [];
      let paginationData = {
        page,
        limit: pagination.limit,
        total: 0,
        totalPages: 0,
      };

      // Jika response adalah object dengan products array
      if (response?.products && Array.isArray(response.products)) {
        productsData = response.products;
        paginationData = {
          page: response.pagination?.page || page,
          limit: response.pagination?.limit || pagination.limit,
          total: response.pagination?.total || response.products.length,
          totalPages: response.pagination?.totalPages || 1,
        };
      } 
      // Jika response langsung adalah array
      else if (Array.isArray(response)) {
        productsData = response;
        paginationData.total = response.length;
        paginationData.totalPages = 1;
      }
      // Jika response adalah object tapi bukan products
      else if (typeof response === 'object' && response !== null) {
        productsData = response.data || [];
        paginationData = {
          page: response.pagination?.page || page,
          limit: response.pagination?.limit || pagination.limit,
          total: response.pagination?.total || productsData.length,
          totalPages: response.pagination?.totalPages || 1,
        };
      }

      setProducts(productsData);
      setPagination(paginationData);

      console.log('Parsed products:', productsData); // Debug log
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchProducts(1, '');
  }, []);

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    fetchProducts(1, query);
  };

  // Handle delete
  const handleDelete = async (productId: number) => {
    try {
      setLoading(true);
      await productService.deleteProduct(productId);

      // Refresh products
      fetchProducts(pagination.page, searchQuery);
      setDeleteConfirm({ isOpen: false });
    } catch (error) {
      console.error('Failed to delete product:', error);
    } finally {
      setLoading(false);
    }
  };

  // improved contrast
  const columns = [
    {
      key: 'id',
      header: 'ID',
      render: (value: number) => (
        <span className="font-mono text-sm font-semibold text-gray-700">
          #{value}
        </span>
      ),
      className: 'w-12',
    },
    {
      key: 'name',
      header: 'Product Name',
      render: (value: string, item: ProductResponse) => (
        <div className="flex items-center gap-3">
          {item.productImages?.[0]?.imageUrl && (
            <div className="h-12 w-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
              <img
                src={item.productImages[0].imageUrl}
                alt={value}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 truncate text-sm">
              {value}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {item.category?.name || 'Uncategorized'}
            </p>
          </div>
        </div>
      ),
      className: 'w-64',
    },
    {
      key: 'price',
      header: 'Price',
      render: (value: number) => (
        <span className="font-semibold text-primary text-sm">
          {new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
          }).format(value)}
        </span>
      ),
      className: 'text-right w-32',
    },
    {
      key: 'stock',
      header: 'Stock',
      render: (value: number) => {
        let badgeClass = 'badge-success';
        if (value <= 0) badgeClass = 'badge-error';
        else if (value <= 10) badgeClass = 'badge-warning';

        return (
          <div className="flex justify-center">
            <span className={`badge badge-sm font-semibold ${badgeClass}`}>
              {value} units
            </span>
          </div>
        );
      },
      className: 'text-center w-24',
    },
    {
      key: 'id',
      header: 'Actions',
      render: (value: number, item: ProductResponse) => (
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => setViewModal({ isOpen: true, product: item })}
            className="btn btn-sm btn-ghost text-blue-600 hover:bg-blue-50"
            title="View details"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <Link
            href={`/admin/products/${value}`}
            className="btn btn-sm btn-primary text-white hover:bg-blue-700"
            title="Edit product"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </Link>
          <button
            onClick={() =>
              setDeleteConfirm({
                isOpen: true,
                productId: value,
                productName: item.name,
              })
            }
            className="btn btn-sm btn-error text-white hover:bg-red-700"
            title="Delete product"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      ),
      className: 'text-right w-32',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-2 text-sm">
            Manage all products in the system ({pagination.total} total)
          </p>
        </div>
        <Link href="/admin/products/new" className="btn btn-primary gap-2">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          New Product
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="bg-gray-100 p-4 rounded-lg shadow-sm border border-gray-300">
        <SearchBar
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search products by name, category..."
        />
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Table Header Info */}
        {products.length > 0 && (
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
            <p className="text-sm text-gray-600 font-medium">
              Showing {products.length} of {pagination.total} products
            </p>
          </div>
        )}

        {/* PATCHED: Custom Table with Zebra Stripes */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          ) : products.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p>{searchQuery ? 'No products found matching your search' : 'No products available'}</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-gray-300">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Product Name</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Price</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">Stock</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => (
                  <tr
                    key={product.id}
                    className={`border-b border-gray-200 transition-colors hover:bg-blue-50 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    {/* ID Column */}
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm font-semibold text-gray-700">
                        #{product.id}
                      </span>
                    </td>

                    {/* Product Name Column */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {product.productImages?.[0]?.imageUrl && (
                          <div className="h-12 w-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-300">
                            <img
                              src={product.productImages[0].imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate text-sm">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {product.category?.name || 'Uncategorized'}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Price Column */}
                    <td className="px-4 py-3 text-right">
                      <span className="font-semibold text-primary text-sm">
                        {new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          minimumFractionDigits: 0,
                        }).format(product.price)}
                      </span>
                    </td>

                    {/* Stock Column */}
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`badge badge-sm font-semibold ${
                          product.stock <= 0
                            ? 'badge-error'
                            : product.stock <= 10
                            ? 'badge-warning'
                            : 'badge-success'
                        }`}
                      >
                        {product.stock} units
                      </span>
                    </td>

                    {/* Actions Column */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setViewModal({ isOpen: true, product })}
                          className="btn btn-sm btn-ghost text-blue-600 hover:bg-blue-100"
                          title="View details"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </button>
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="btn btn-sm btn-primary text-white hover:bg-blue-700"
                          title="Edit product"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </Link>
                        <button
                          onClick={() =>
                            setDeleteConfirm({
                              isOpen: true,
                              productId: product.id,
                              productName: product.name,
                            })
                          }
                          className="btn btn-sm btn-error text-white hover:bg-red-700"
                          title="Delete product"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={(page) => fetchProducts(page, searchQuery)}
              showInfo
            />
          </div>
        )}
      </div>

      {/* View Modal */}
      <Modal
        isOpen={viewModal.isOpen}
        onClose={() => setViewModal({ isOpen: false })}
        title="Product Details"
      >
        {viewModal.product && (
          <div className="space-y-6">
            {/* Product Images */}
            {viewModal.product.productImages && viewModal.product.productImages.length > 0 && (
              <div>
                <label className="label">
                  <span className="label-text font-semibold text-gray-900">Product Images</span>
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {viewModal.product.productImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-300 group cursor-pointer"
                    >
                      <img
                        src={img.imageUrl}
                        alt={`Product ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Product Info Grid - PATCHED: Better contrast */}
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <label className="label">
                  <span className="label-text font-semibold text-gray-900">Product Name</span>
                </label>
                <p className="text-gray-900 font-medium text-base">
                  {viewModal.product.name}
                </p>
              </div>
              <div>
                <label className="label">
                  <span className="label-text font-semibold text-gray-900">Category</span>
                </label>
                <p className="text-gray-900 font-medium text-base">
                  {viewModal.product.category?.name || 'Uncategorized'}
                </p>
              </div>
              <div>
                <label className="label">
                  <span className="label-text font-semibold text-gray-900">Price</span>
                </label>
                <p className="text-primary font-bold text-lg">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                  }).format(viewModal.product.price)}
                </p>
              </div>
              <div>
                <label className="label">
                  <span className="label-text font-semibold text-gray-900">Stock</span>
                </label>
                <div className="flex items-center gap-2">
                  <span
                    className={`badge badge-md font-semibold ${
                      viewModal.product.stock > 10
                        ? 'badge-success'
                        : viewModal.product.stock > 0
                        ? 'badge-warning'
                        : 'badge-error'
                    }`}
                  >
                    {viewModal.product.stock} units
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="label">
                <span className="label-text font-semibold text-gray-900">Description</span>
              </label>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap text-sm">
                  {viewModal.product.description || 'No description provided'}
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-2 justify-end pt-4 border-t border-gray-200">
              <button
                onClick={() => setViewModal({ isOpen: false })}
                className="btn btn-ghost"
              >
                Close
              </button>
              <Link
                href={`/admin/products/${viewModal.product.id}`}
                className="btn btn-primary"
              >
                Edit Product
              </Link>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false })}
        onConfirm={() =>
          deleteConfirm.productId && handleDelete(deleteConfirm.productId)
        }
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteConfirm.productName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}