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

      // Direct access to typed response
      setProducts(response.data.products);
      setPagination({
        page: response.pagination.page,
        limit: response.pagination.limit,
        total: response.pagination.total,
        totalPages: response.pagination.totalPages,
      });
    } catch (error) {
      console.error('Failed to fetch products:', error);
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

  // Table columns
  const columns = [
    {
      key: 'id',
      header: 'ID',
      render: (value: number) => <span className="font-mono text-xs">#{value}</span>,
      className: 'w-12',
    },
    {
      key: 'name',
      header: 'Product Name',
      render: (value: string, item: ProductResponse) => (
        <div className="flex items-center gap-2">
          {item.productImages?.[0]?.imageUrl && (
            <div className="h-10 w-10 rounded bg-gray-200 overflow-hidden">
              <img
                src={item.productImages[0].imageUrl}
                alt={value}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div>
            <p className="font-semibold">{value}</p>
            <p className="text-xs text-gray-500">{item.category?.name}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      render: (value: number) => (
        <span className="font-semibold text-primary">
          {new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
          }).format(value)}
        </span>
      ),
      className: 'text-right',
    },
    {
      key: 'stock',
      header: 'Stock',
      render: (value: number) => (
        <div
          className={`badge ${
            value > 10
              ? 'badge-success'
              : value > 0
              ? 'badge-warning'
              : 'badge-error'
          }`}
        >
          {value} units
        </div>
      ),
      className: 'text-center',
    },
    {
      key: 'id',
      header: 'Actions',
      render: (value: number, item: ProductResponse) => (
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => setViewModal({ isOpen: true, product: item })}
            className="btn btn-sm btn-ghost"
            title="View details"
          >
            👁️
          </button>
          <Link
            href={`/admin/products/${value}`}
            className="btn btn-sm btn-primary"
            title="Edit product"
          >
            ✏️
          </Link>
          <button
            onClick={() =>
              setDeleteConfirm({
                isOpen: true,
                productId: value,
                productName: item.name,
              })
            }
            className="btn btn-sm btn-error"
            title="Delete product"
          >
            🗑️
          </button>
        </div>
      ),
      className: 'text-right',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-gray-600 mt-1">Manage all products in the system</p>
        </div>
        <Link href="/admin/products/new" className="btn btn-primary gap-2">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          New Product
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <SearchBar
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search products by name, category..."
        />
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table
          columns={columns}
          data={products}
          loading={loading}
          emptyMessage={
            searchQuery ? 'No products found' : 'No products available'
          }
        />

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-gray-200">
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
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">
                  <span className="label-text font-semibold">Product Name</span>
                </label>
                <p>{viewModal.product.name}</p>
              </div>
              <div>
                <label className="label">
                  <span className="label-text font-semibold">Category</span>
                </label>
                <p>{viewModal.product.category?.name}</p>
              </div>
              <div>
                <label className="label">
                  <span className="label-text font-semibold">Price</span>
                </label>
                <p className="font-semibold text-primary">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                  }).format(viewModal.product.price)}
                </p>
              </div>
              <div>
                <label className="label">
                  <span className="label-text font-semibold">Stock</span>
                </label>
                <p>{viewModal.product.stock} units</p>
              </div>
            </div>

            <div>
              <label className="label">
                <span className="label-text font-semibold">Description</span>
              </label>
              <p className="text-sm text-gray-600">{viewModal.product.description}</p>
            </div>

            {viewModal.product.productImages && viewModal.product.productImages.length > 0 && (
              <div>
                <label className="label">
                  <span className="label-text font-semibold">Images</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {viewModal.product.productImages.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded overflow-hidden bg-gray-200">
                      <img src={img.imageUrl} alt={`Product ${idx}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false })}
        onConfirm={() => deleteConfirm.productId && handleDelete(deleteConfirm.productId)}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteConfirm.productName}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}