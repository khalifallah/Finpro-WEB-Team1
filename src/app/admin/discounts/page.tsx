'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import DataTable from '@/components/common/DataTable';
import { FiBarChart2, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { toast } from 'sonner';
import Pagination from '@/components/common/Pagination';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import DiscountFormModal, { DiscountFormData } from '@/components/admin/DiscountFormModal';
import { useAuth } from '@/contexts/AuthContext';

interface Discount {
  id: number;
  description: string;
  type: 'DIRECT_PERCENTAGE' | 'DIRECT_NOMINAL' | 'BOGO';
  value: number;
  minPurchase?: number;
  maxDiscountAmount?: number;
  productId?: number;
  product?: { id: number; name: string };
  storeId: number;
  store?: { id: number; name: string };
  startDate: string;
  endDate: string;
  is_active: boolean;
}

interface Store { id: number; name: string; }
interface Product { id: number; name: string; }

export default function DiscountsPage() {
  const { user } = useAuth();
  const router = useRouter();  // ✅ ADD THIS
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const userStoreId = user?.store?.id;
  const userStoreName = user?.store?.name;

  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedStore, setSelectedStore] = useState<number | null>(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; discountId?: number; discountName?: string }>({ isOpen: false });
  const [formModal, setFormModal] = useState<{ isOpen: boolean; mode: 'create' | 'edit'; discount?: Discount | null }>({ isOpen: false, mode: 'create', discount: null });

  const getApiUrl = () => process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
  const getAuthHeaders = useCallback(() => ({ Authorization: `Bearer ${localStorage.getItem('token')}` }), []);

  const fetchStores = useCallback(async () => {
    if (!isSuperAdmin) {
      if (userStoreId && userStoreName) setStores([{ id: userStoreId, name: userStoreName }]);
      return;
    }
    try {
      const res = await fetch(`${getApiUrl()}/stores`, { headers: getAuthHeaders() });
      if (!res.ok) return;
      const data = await res.json();
      
      // Robust Defensive parsing - handle berbagai format response
      let storesList: Store[] = [];
      if (Array.isArray(data)) {
        storesList = data;
      } else if (Array.isArray(data.stores)) {
        storesList = data.stores;
      } else if (Array.isArray(data.data)) {
        storesList = data.data;
      } else if (data.stores && typeof data.stores === 'object') {
        // Jika object (bukan array), convert ke array
        storesList = Object.values(data.stores).filter(
          (item): item is Store => item !== null && typeof item === 'object'
        );
      }

      setStores(storesList);
    } catch (e) { 
      setStores([]); // Default ke empty array
    }
  }, [getAuthHeaders, isSuperAdmin, userStoreId, userStoreName]);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch(`${getApiUrl()}/products?limit=100`, { headers: getAuthHeaders() });
      const data = await res.json();
      setProducts(data.products || data.data?.products || []);
    } catch (e) { console.error('Failed to fetch products:', e); }
  }, [getAuthHeaders]);

  const fetchDiscounts = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: String(page), limit: String(pagination.limit) });
      const storeIdToUse = isSuperAdmin ? selectedStore : userStoreId;
      if (storeIdToUse) params.append('storeId', String(storeIdToUse));
      if (query) params.append('search', query.trim());

      const res = await fetch(`${getApiUrl()}/discounts?${params}`, { headers: getAuthHeaders() });
      const data = await res.json();
      const discountsData = data.rules || data.data?.rules || data.discounts || [];
      const totalCount = data.total || data.data?.total || 0;

      setDiscounts(Array.isArray(discountsData) ? discountsData : []);
      setPagination({ page, limit: pagination.limit, total: totalCount, totalPages: Math.ceil(totalCount / pagination.limit) });
    } catch (e) { console.error('Failed:', e); setDiscounts([]); }
    finally { setLoading(false); }
  }, [pagination.limit, isSuperAdmin, selectedStore, userStoreId, getAuthHeaders, query]);

  useEffect(() => { fetchStores(); fetchProducts(); }, [fetchStores, fetchProducts]);
  useEffect(() => { if (isSuperAdmin || userStoreId) fetchDiscounts(1); }, [selectedStore, userStoreId, isSuperAdmin, fetchDiscounts, query]);

  const handleCreate = () => {
    if (!isSuperAdmin && !userStoreId) { alert('Store not assigned.'); return; }
    setFormModal({ isOpen: true, mode: 'create', discount: null });
  };

  const handleEdit = (discount: Discount) => setFormModal({ isOpen: true, mode: 'edit', discount });

  // Refactor: Navigate to usage page
  const handleViewUsage = (discountId: number) => {
    router.push(`/admin/discounts/${discountId}/usages`);
  };

  const handleSubmit = async (data: DiscountFormData): Promise<void> => {
    try {
      const url = formModal.mode === 'create' ? `${getApiUrl()}/discounts` : `${getApiUrl()}/discounts/${formModal.discount?.id}`;
      const payload = {
        description: data.description, type: data.type,
        value: data.type === 'BOGO' ? undefined : data.value,
        minPurchase: data.minPurchase || undefined, maxDiscountAmount: data.maxDiscountAmount || undefined,
        productId: data.productId || undefined, storeId: data.storeId,
        startDate: new Date(data.startDate), endDate: new Date(data.endDate),
      };

      const res = await fetch(url, {
        method: formModal.mode === 'create' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(payload),
      });
      if (!res.ok) { const err = await res.json(); const e = new Error(err.message || 'Failed'); (e as any).status = res.status; throw e; }
      setFormModal({ isOpen: false, mode: 'create', discount: null });
      fetchDiscounts(pagination.page);
      toast.success(formModal.mode === 'create' ? 'Discount created successfully' : 'Discount updated successfully');
    } catch (err: any) {
      const msg = err?.message || 'Failed to save discount';
      const isForbidden = err?.status === 403 || /forbid|forbidden|super admin/i.test(msg);
      toast.error(isForbidden ? 'Forbidden Action Restricted to super-admin users only' : msg);
      throw err;
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (!deleteConfirm.discountId) return;
    try {
      setLoading(true);
      const res = await fetch(`${getApiUrl()}/discounts/${deleteConfirm.discountId}?confirm=yes`, { method: 'DELETE', headers: getAuthHeaders() });
      if (!res.ok) { const err = await res.json(); const e = new Error(err.message || 'Failed'); (e as any).status = res.status; throw e; }
      setDeleteConfirm({ isOpen: false });
      fetchDiscounts(pagination.page);
      toast.success('Discount deleted successfully');
    } catch (err: any) {
      const msg = err?.message || 'Failed to delete discount';
      const isForbidden = err?.status === 403 || /forbid|forbidden|super admin/i.test(msg);
      toast.error(isForbidden ? 'Forbidden Action Restricted to super-admin users only' : msg);
    } finally { setLoading(false); }
  };

  const getDiscountTypeLabel = (type: string) => {
    switch (type) {
      case 'DIRECT_PERCENTAGE': return '📊 Percentage';
      case 'DIRECT_NOMINAL': return '💵 Fixed Amount';
      case 'BOGO': return '🎁 Buy 1 Get 1';
      default: return type;
    }
  };

  const formatDiscountValue = (discount: Discount) => {
    if (discount.type === 'DIRECT_PERCENTAGE') return `${discount.value}%`;
    if (discount.type === 'DIRECT_NOMINAL') {
      return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(discount.value);
    }
    return 'BOGO';
  };

  // Refactor: Columns dengan "See Usage" button
  const columns = [
    {
      key: 'description',
      header: 'Discount Name',
      render: (value: string) => <span className="font-semibold text-gray-900">{value}</span>,
    },
    {
      key: 'type',
      header: 'Type',
      render: (value: string) => (
        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm ${
          value === 'DIRECT_PERCENTAGE' ? 'bg-blue-600' :
          value === 'DIRECT_NOMINAL' ? 'bg-green-600' :
          'bg-orange-500'
        }`}>
          {getDiscountTypeLabel(value)}
        </span>
      ),
    },
    {
      key: 'value',
      header: 'Value',
      render: (_: number, item: Discount) => (
        <span className={`font-bold text-lg ${
          item.type === 'DIRECT_PERCENTAGE' ? 'text-blue-700' :
          item.type === 'DIRECT_NOMINAL' ? 'text-green-700' :
          'text-orange-600'
        }`}>
          {formatDiscountValue(item)}
        </span>
      ),
    },
    {
      key: 'product',
      header: 'Product',
      render: (value: { name: string } | undefined) => (
        <span className="font-medium text-gray-700">{value?.name || 'All Products'}</span>
      ),
    },
    {
      key: 'endDate',
      header: 'Valid Until',
      render: (value: string) => {
        const date = new Date(value);
        const isExpired = date < new Date();
        return (
          <span className={`font-medium ${isExpired ? 'text-red-600 font-bold' : 'text-gray-700'}`}>
            {date.toLocaleDateString('id-ID')}{isExpired && ' ⚠️'}
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_value: any, item: Discount) => (
        <div className="flex gap-2 justify-end">
          {/* See Usage Button */}
          <button onClick={() => handleViewUsage(item.id)}
            className="px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium shadow-sm flex items-center justify-center"
            title="View Usage Report" aria-label="View Usage Report">
            <FiBarChart2 className="h-4 w-4" />
          </button>
          <button onClick={() => handleEdit(item)}
            className="px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm flex items-center justify-center"
            title="Edit Discount" aria-label="Edit Discount">
            <FiEdit2 className="h-4 w-4" />
          </button>
          <button onClick={() => setDeleteConfirm({ isOpen: true, discountId: item.id, discountName: item.description })}
            className="px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium shadow-sm flex items-center justify-center"
            title="Delete Discount" aria-label="Delete Discount">
            <FiTrash2 className="h-4 w-4" />
          </button>
        </div>
      ),
      className: 'text-right',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header - ✅ RESPONSIVE */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Discount Management</h1>
          <p className="text-gray-600 mt-1">
            {isSuperAdmin ? 'Manage discounts across all stores' : `Managing: ${userStoreName}`}
          </p>
        </div>
          <button onClick={handleCreate} disabled={!isSuperAdmin && !userStoreId}
          className="px-4 py-2 sm:px-5 sm:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2 disabled:opacity-50 w-full sm:w-auto">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          New Discount
        </button>
      </div>

      {/* Search removed */}

      {/* Store Filter (Super Admin) - ✅ RESPONSIVE */}
      {isSuperAdmin && (
        <div className="bg-white p-3 sm:p-4 rounded-lg border shadow-sm">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Store</label>
          <select value={selectedStore || ''} onChange={(e) => setSelectedStore(e.target.value ? parseInt(e.target.value) : null)}
            className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white">
            <option value="">All Stores</option>
            {stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      )}

      {/* Store Admin Info - ✅ RESPONSIVE */}
      {!isSuperAdmin && (
        <div className={`rounded-lg p-3 sm:p-4 flex items-center gap-3 border ${userStoreId ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
          <span className="text-2xl">{userStoreId ? '🏪' : '⚠️'}</span>
          <div>
            <p className={`font-semibold ${userStoreId ? 'text-green-800' : 'text-red-800'}`}>
              {userStoreId ? `Your Store: ${userStoreName}` : 'Store Not Assigned'}
            </p>
            <p className={`text-sm ${userStoreId ? 'text-green-600' : 'text-red-600'}`}>
              {userStoreId ? 'Manage discounts for this store' : 'Contact Super Admin'}
            </p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <DataTable 
          columns={columns} 
          data={discounts} 
          loading={loading} 
          emptyMessage="No discounts found. Create your first discount!"
          striped={true}
          hoverEffect={true}
        />
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t bg-gray-50">
            <Pagination currentPage={pagination.page} totalPages={pagination.totalPages} onPageChange={fetchDiscounts} />
          </div>
        )}
      </div>

      {/* Modal */}
      <DiscountFormModal
        isOpen={formModal.isOpen} mode={formModal.mode} discount={formModal.discount}
        products={products} stores={stores} userStoreId={userStoreId} isSuperAdmin={isSuperAdmin}
        onClose={() => setFormModal({ isOpen: false, mode: 'create', discount: null })}
        onSubmit={handleSubmit}
      />

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen} onClose={() => setDeleteConfirm({ isOpen: false })}
        onConfirm={handleDelete} title="Delete Discount"
        message={`Delete "${deleteConfirm.discountName}"?`}
        confirmText="Delete" cancelText="Cancel" type="danger"
      />
    </div>
  );
}