'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { toast } from 'sonner';
import Pagination from '@/components/common/Pagination';
import SearchBar from '@/components/common/SearchBar';
import StockList from '@/components/admin/StockList';
import StockUpdateModal from '@/components/admin/StockUpdateModal';
import StockJournalModal from '@/components/admin/StockJournalModal';
import StockCreateModal from '@/components/admin/StockCreateModal';
import { useAuth } from '@/contexts/AuthContext';
import { FiPlus } from 'react-icons/fi';

interface Stock {
  id: number;
  quantity: number;
  product: { id: number; name: string };
  store: { id: number; name: string };
}

interface Store {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
}

interface StockJournal {
  id: number;
  quantityChange: number;
  reason: string;
  createdAt: string;
}

export default function StocksPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  
  // INGAT! Only use user?.store?.id (not storeId)
  const userStoreId = user?.store?.id;

  const [stocks, setStocks] = useState<Stock[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedStore, setSelectedStore] = useState<number | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const initialLoadRef = useRef(true);

  // Modals
  const [updateModal, setUpdateModal] = useState<{
    isOpen: boolean;
    stock: Stock | null;
  }>({ isOpen: false, stock: null });

  const [journalModal, setJournalModal] = useState<{
    isOpen: boolean;
    productName: string;
    journals: StockJournal[];
  }>({ isOpen: false, productName: '', journals: [] });

  const [createModal, setCreateModal] = useState(false);
  const [storesError, setStoresError] = useState('');

  const getApiUrl = () => process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
  };

  // ===================== IMPROVED FETCH STORES =====================
  const fetchStores = async () => {
    try {
      setStoresError('');
      const url = `${getApiUrl()}/stores`;
      
      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch stores`);
      }

      const data = await response.json();
      
      let storesList = [];
      
      // FIXED PARSING - HANDLE API WRAPPER
      // Backend wraps response in { code, message, data: { stores, pagination } }
      if (data.data && data.data.stores && Array.isArray(data.data.stores)) {
        storesList = data.data.stores;
      }
      // Format 2: Direct array (if endpoint changed)
      else if (Array.isArray(data)) {
        storesList = data;
      }
      // Format 3: { stores: [...] } (legacy)
      else if (Array.isArray(data.stores)) {
        storesList = data.stores;
      }
      // Format 4: { data: [...] } (wrapped without stores key)
      else if (Array.isArray(data.data)) {
        storesList = data.data;
      }

      if (!storesList || storesList.length === 0) {
        setStoresError('No stores found. Please contact administrator.');
      }
      
      setStores(storesList);
    } catch (error: any) {
      console.error('❌ Error fetching stores:', error);
      setStoresError(error.message || 'Failed to load stores');
      setStores([]);
    }
  };
  // ==============================================================

  // Fetch products (for create modal)
  const fetchProducts = async () => {
    try {
      const response = await fetch(`${getApiUrl()}/products?limit=100`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      
      let productsList = [];
      if (Array.isArray(data)) {
        productsList = data;
      } else if (Array.isArray(data.products)) {
        productsList = data.products;
      } else if (Array.isArray(data.data)) {
        productsList = data.data;
      } else if (data.products && typeof data.products === 'object') {
        productsList = Object.values(data.products);
      }
      
      setProducts(productsList);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    }
  };

  // Fetch stocks
  const fetchStocks = async (page: number = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: String(pagination.limit),
      });

      // For Store Admin, always use their store
      // For Super Admin, only add storeId if selected
      const storeIdToUse = isSuperAdmin ? selectedStore : userStoreId;
      if (storeIdToUse) {
        params.append('storeId', String(storeIdToUse));
      }
      if (query) {
        // Backend stocks endpoint filters by productId, not text — resolve text -> productId
        try {
          const pRes = await fetch(`${getApiUrl()}/products?limit=5&search=${encodeURIComponent(query.trim())}`, { headers: getAuthHeaders() });
          if (pRes.ok) {
            const pData = await pRes.json();
            const productsList = pData.products || pData.data?.products || pData || [];
            const first = Array.isArray(productsList) && productsList.length > 0 ? productsList[0] : null;
            if (first && first.id) {
              params.append('productId', String(first.id));
            }
          }
        } catch (err) {
          // ignore product lookup errors and continue without product filter
          console.warn('Product lookup for stock search failed', err);
        }
      }

      const url = `${getApiUrl()}/stocks?${params}`;

      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        console.warn(`⚠️ Stock fetch warning: HTTP ${response.status}`);
        // Don't throw - just show empty stocks
        setStocks([]);
        setPagination({
          page: 1,
          limit: pagination.limit,
          total: 0,
          totalPages: 0,
        });
        return;
      }

      const data = await response.json();

      setStocks(data.stocks || data.data || []);
      setPagination({
        page: data.page || page,
        limit: data.limit || 10,
        total: data.total || 0,
        totalPages: Math.ceil((data.total || 0) / (data.limit || 10)),
      });
    } catch (error) {
      console.error('❌ Error fetching stocks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch journals
  const fetchJournals = async (stockId: number, productName: string) => {
    try {
      const response = await fetch(`${getApiUrl()}/stocks/${stockId}/journals`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      setJournalModal({
        isOpen: true,
        productName,
        journals: data.journals || data.data || [],
      });
    } catch (error) {
      setJournalModal({ isOpen: true, productName, journals: [] });
    }
  };

  // Create stock
  const handleCreateStock = async (
    productId: number,
    storeId: number,
    quantity: number
  ): Promise<void> => {
    try {
      if (!productId || !storeId || !quantity) {
        throw new Error('All fields are required');
      }

      if (quantity <= 0) {
        throw new Error('Quantity must be greater than 0');
      }

      const response = await fetch(`${getApiUrl()}/stocks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ productId, storeId, quantity }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const err = new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
        (err as any).status = response.status;
        throw err;
      }

      setCreateModal(false); // Close modal on success
      await fetchStocks(1);
      toast.success('Stock created successfully');
    } catch (err: any) {
      const msg = err?.message || 'Failed to create stock';
      const isForbidden = err?.status === 403 || /forbid|forbidden|super admin/i.test(msg);
      toast.error(isForbidden ? 'Forbidden Action Restricted to super-admin users only' : msg);
      throw err;
    }
  };

  // Update stock
  const handleUpdateStock = async (
    stockId: number,
    quantityChange: number,
    reason: string
  ): Promise<void> => {
    try {
      const response = await fetch(`${getApiUrl()}/stocks/${stockId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ quantityChange, reason }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const err = new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
        (err as any).status = response.status;
        throw err;
      }

      await fetchStocks(pagination.page);
      toast.success('Stock updated successfully');
    } catch (err: any) {
      const msg = err?.message || 'Failed to update stock';
      const isForbidden = err?.status === 403 || /forbid|forbidden|super admin/i.test(msg);
      toast.error(isForbidden ? 'Forbidden Action Restricted to super-admin users only' : msg);
      throw err;
    }
  };

  // ===================== HANDLER UNTUK TOMBOL UPDATE & HISTORY =====================
  const handleOpenUpdateModal = (stock: Stock) => {
    // SUPER_ADMIN: wajib pilih toko dulu
    if (isSuperAdmin && !selectedStore) {
      alert('❌ Please select a store first');
      return;
    }
    setUpdateModal({ isOpen: true, stock });
  };

  const handleOpenJournalModal = (stock: Stock) => {
    // SUPER_ADMIN: wajib pilih toko dulu
    if (isSuperAdmin && !selectedStore) {
      alert('❌ Please select a store first');
      return;
    }
    fetchJournals(stock.id, stock.product.name);
  };
  // ==============================================================================

  useEffect(() => {
    fetchStores();
    fetchProducts();
  }, []);

  // Read initial page from URL so refresh preserves current page
  useEffect(() => {
    const pageParam = searchParams?.get('page');
    const pageNumber = pageParam ? Math.max(1, parseInt(pageParam, 10) || 1) : 1;
    setPagination((prev) => ({ ...prev, page: pageNumber }));
    fetchStocks(pageNumber);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // when filters/search change, reset to page 1 and fetch
    // Skip on initial mount so we don't override URL-provided page
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      return;
    }

    const resetTo = 1;
    try {
      const params = new URLSearchParams();
      if (query) params.set('search', query);
      if (selectedStore) params.set('storeId', String(selectedStore));
      params.set('page', String(resetTo));
      router.replace(`${pathname}?${params.toString()}`);
    } catch (e) {
      // ignore router errors
    }
    fetchStocks(resetTo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStore, userStoreId, query]);

  const handlePageChange = (page: number) => {
    try {
      const params = new URLSearchParams();
      if (query) params.set('search', query);
      if (selectedStore) params.set('storeId', String(selectedStore));
      params.set('page', String(page));
      router.push(`${pathname}?${params.toString()}`);
    } catch (e) {
      // ignore router errors
    }
    fetchStocks(page);
  };

  // Get effective store ID for create modal
  const effectiveStoreId = isSuperAdmin ? undefined : userStoreId;

  // ===================== CHECK JIKA SUPER_ADMIN BELUM PILIH TOKO =====================
  const isSuperAdminWithoutStore = isSuperAdmin && !selectedStore;
  // ==================================================================================

  return (
    <div className="space-y-6">
      {/* Page Header - ✅ RESPONSIVE */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Stock Management</h1>
          <p className="text-gray-600 mt-1">
            {isSuperAdmin
              ? 'Manage inventory across all stores'
              : 'Manage inventory for your store'}
          </p>
        </div>
          <button
          onClick={() => setCreateModal(true)}
          disabled={isSuperAdminWithoutStore}
          className={`btn btn-primary gap-2 w-full sm:w-auto ${
            isSuperAdminWithoutStore ? 'btn-disabled opacity-50 cursor-not-allowed' : ''
          }`}
          title={
            isSuperAdminWithoutStore ? 'Please select a store first' : 'Add new stock'
          }
        >
          <FiPlus className="w-5 h-5" />
          Add Stock
        </button>
      </div>

      <div className="mt-4 max-w-md">
        <SearchBar value={query} onChange={setQuery} placeholder="Search stocks..." />
      </div>

      {/* Store Filter (Super Admin only) - ✅ RESPONSIVE */}
      {isSuperAdmin && (
        <div className="p-3 sm:p-4 rounded-lg shadow-sm border border-blue-200 bg-blue-50">
          {/* ===================== SHOW ERROR IF ANY ===================== */}
          {storesError && (
            <div className="alert alert-error mb-4">
              <svg className="stroke-current shrink-0 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{storesError}</span>
              <button 
                onClick={fetchStores}
                className="btn btn-sm btn-ghost"
              >
                Retry
              </button>
            </div>
          )}
          {/* ============================================================ */}

          <div className="form-control w-full max-w-xs">
            <label className="label">
              <span className="label-text font-semibold text-gray-900">
                🏪 Filter by Store <span className="text-red-500">*</span>
              </span>
            </label>
            
            {/* Loading State */}
            {stores.length === 0 && !storesError && (
              <div className="select select-bordered bg-gray-100 text-gray-600 font-medium">
                <span className="loading loading-spinner loading-sm inline"></span> Loading stores...
              </div>
            )}

            {/* Dropdown */}
            {stores.length > 0 && (
              <select
                value={selectedStore || ''}
                onChange={(e) => {
                  const value = e.target.value ? parseInt(e.target.value) : null;
                  setSelectedStore(value);
                }}
                className="select select-bordered bg-white text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">-- Select a store --</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            )}

            {!selectedStore && !storesError && stores.length > 0 && (
              <label className="label pt-2">
                <span className="label-text-alt text-red-600 font-medium">
                  ⚠️ You must select a store to manage stocks
                </span>
              </label>
            )}
          </div>
        </div>
      )}

      {/* Store Admin Notice */}
      {!isSuperAdmin && (
        <div className="alert alert-info">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>You are viewing stocks for your assigned store only.</span>
        </div>
      )}

      {/* Warning: Super Admin without store selected */}
      {isSuperAdminWithoutStore && (
        <div className="alert alert-warning border-2 border-yellow-500 bg-yellow-50">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4v2m0 0v2m0-6v-2m0 0V7a2 2 0 012-2h.5a.5.5 0 00-.5.5v.5H9.5a.5.5 0 00-.5.5v.5a2 2 0 014 0m0 0a2 2 0 11-4 0m0 0V7a2 2 0 012-2z" />
          </svg>
          <div>
            <h3 className="font-bold">Store Selection Required</h3>
            <div className="text-sm">
              Please select a store from the filter above to view and manage stocks.
            </div>
          </div>
        </div>
      )}

      {/* Stock List */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-4 py-2 sm:px-6 sm:py-3 bg-gray-50 border-b">
          <p className="text-sm text-gray-600">
            {isSuperAdminWithoutStore ? (
              <span className="text-yellow-700 font-medium">
                ⚠️ Select a store to see stocks
              </span>
            ) : (
              <>
                Showing {stocks.length} of {pagination.total} stocks
              </>
            )}
          </p>
        </div>

        {/* Only show table if store is selected (or if StoreAdmin) */}
        {!isSuperAdminWithoutStore ? (
          <>
            <StockList
              stocks={stocks}
              loading={loading}
              onUpdate={handleOpenUpdateModal}
            />

            {pagination.totalPages > 1 && (
              <div className="p-4 border-t">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 7-7V3m0 0v8m0-8h-8" />
              </svg>
              <p className="text-gray-500 font-medium">No store selected</p>
              <p className="text-sm text-gray-400">Select a store above to view stocks</p>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <StockUpdateModal
        isOpen={updateModal.isOpen}
        stock={updateModal.stock}
        onClose={() => setUpdateModal({ isOpen: false, stock: null })}
        onSubmit={handleUpdateStock}
      />

      <StockJournalModal
        isOpen={journalModal.isOpen}
        productName={journalModal.productName}
        journals={journalModal.journals}
        onClose={() => setJournalModal({ isOpen: false, productName: '', journals: [] })}
      />

      <StockCreateModal
        isOpen={createModal}
        products={products}
        stores={stores}
        userStoreId={effectiveStoreId}
        isSuperAdmin={isSuperAdmin}
        onClose={() => setCreateModal(false)}
        onSubmit={handleCreateStock}
      />
    </div>
  );
}