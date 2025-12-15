'use client';

import { useEffect, useState } from 'react';
import { FiPackage, FiPlus } from 'react-icons/fi';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import SearchBar from '@/components/common/SearchBar';
import Pagination from '@/components/common/Pagination';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import AdminProductList from '@/components/admin/AdminProductList';
import ProductPhotosModal from '@/components/admin/ProductPhotosModal';
import { ProductResponse } from '@/types/product.types';
import { productService } from '@/services/productService';
import { toast } from 'sonner';

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

  const [photosModalOpen, setPhotosModalOpen] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);

  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const fetchProducts = async (page: number = 1, search: string = '') => {
    try {
      setLoading(true);
      const response = await productService.getProducts({
        page,
        limit: pagination.limit,
        search: search || undefined,
      });


      let productsData: ProductResponse[] = [];
      let total = 0;
      let totalPages = 0;

      // Handle response formats
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

      setProducts(productsData);
      setPagination({
        page,
        limit: pagination.limit,
        total,
        totalPages,
      });
    } catch (error) {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Read initial page and search from URL so refresh stays on same page
    const pageParam = searchParams?.get('page');
    const searchParam = searchParams?.get('search') || '';
    const pageNumber = pageParam ? Math.max(1, parseInt(pageParam, 10) || 1) : 1;
    setSearchQuery(searchParam);
    setPagination((prev) => ({ ...prev, page: pageNumber }));
    fetchProducts(pageNumber, searchParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // update url to include search and reset to page 1
    try {
      const params = new URLSearchParams();
      if (query) params.set('search', query);
      params.set('page', '1');
      router.push(`${pathname}?${params.toString()}`);
    } catch (e) {
      // ignore router errors
    }
    fetchProducts(1, query);
  };

  const handleDelete = async (productId: number) => {
    try {
      setLoading(true);
      await productService.deleteProduct(productId);
      toast.success('Product deleted successfully');
      await fetchProducts(pagination.page, searchQuery);
      setDeleteConfirm({ isOpen: false });
    } catch (error: any) {
      const msg = error?.message || 'Failed to delete product';
      const isForbidden = error?.status === 403 || error?.response?.status === 403 || /forbid|forbidden|super admin/i.test(msg);
      const forbiddenMsg = 'Forbidden Action Restricted to super-admin users only';
      setError(isForbidden ? forbiddenMsg : msg);
      // show toast as well
      try {
        // import toast lazily to avoid adding top-level dependency in this file
        const { toast } = await import('sonner');
        toast.error(isForbidden ? forbiddenMsg : msg);
      } catch (e) {
        // ignore if toast can't be imported at runtime
      }
      setTimeout(() => setDeleteConfirm({ isOpen: false }), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    // update url so refresh preserves page
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      params.set('page', String(page));
      router.push(`${pathname}?${params.toString()}`);
    } catch (e) {
      // ignore router errors
    }
    fetchProducts(page, searchQuery);
  };

  return (
    <div className="space-y-6">
      {/* Header - ✅ RESPONSIVE */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            <span className="inline-flex items-center gap-2"><FiPackage className="h-6 w-6 text-gray-700" />Products</span>
          </h1>
          <p className="text-gray-600 mt-2 text-sm">Manage all products ({pagination.total} total)</p>
        </div>
        <Link href="/admin/products/new" className="btn btn-primary gap-2 w-full sm:w-auto inline-flex items-center">
          <FiPlus className="h-4 w-4" />
          <span>New Product</span>
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

      {/* Search - ✅ RESPONSIVE */}
      <div className="bg-gray-100 p-3 sm:p-4 rounded-lg shadow-sm border border-gray-300 transition-shadow hover:shadow">
        <SearchBar value={searchQuery} onChange={handleSearch} placeholder="Search products..." />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-shadow hover:shadow-lg">
        {products.length > 0 && (
          <div className="px-4 py-2 sm:px-6 sm:py-3 bg-gray-50 border-b border-gray-200">
            <p className="text-sm text-gray-600 font-medium">
              Showing {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} products
            </p>
          </div>
        )}

        <AdminProductList
          products={products}
          loading={loading}
          showStock={false}
          onDelete={(id, name) =>
            setDeleteConfirm({ isOpen: true, productId: id, productName: name })
          }
          onViewPhotos={(images: string[]) => {
            setPhotos(images || []);
            setPhotosModalOpen(true);
          }}
        />

        {/* Pagination */}
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

      <ProductPhotosModal isOpen={photosModalOpen} images={photos} onClose={() => setPhotosModalOpen(false)} />
    </div>
  );
}