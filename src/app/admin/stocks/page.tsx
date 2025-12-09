'use client';

import { useEffect, useState } from 'react';
import Pagination from '@/components/common/Pagination';
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
  
  // Robust: Get store ID from multiple possible locations
  const userStoreId = user?.store?.id || user?.storeId || undefined;


  const [stocks, setStocks] = useState<Stock[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStore, setSelectedStore] = useState<number | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

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

  const getApiUrl = () => process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
  };

  // Fetch stores
  const fetchStores = async () => {
    try {
      const response = await fetch(`${getApiUrl()}/stores`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      const storesList = data.stores || data.data || data || [];
      console.log('🏪 Stores loaded:', storesList.length);
      setStores(storesList);
    } catch (error) {
      console.error('Failed to fetch stores:', error);
    }
  };

  // Fetch products (for create modal)
  const fetchProducts = async () => {
    try {
      const response = await fetch(`${getApiUrl()}/products?limit=100`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      const productsList = data.products || data.data || data || [];
      console.log('📦 Products loaded:', productsList.length);
      setProducts(productsList);
    } catch (error) {
      console.error('Failed to fetch products:', error);
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
      const storeIdToUse = isSuperAdmin ? selectedStore : userStoreId;
      if (storeIdToUse) params.append('storeId', String(storeIdToUse));

      const response = await fetch(`${getApiUrl()}/stocks?${params}`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();

      setStocks(data.stocks || data.data || []);
      setPagination({
        page: data.page || page,
        limit: data.limit || 10,
        total: data.total || 0,
        totalPages: Math.ceil((data.total || 0) / (data.limit || 10)),
      });
    } catch (error) {
      console.error('Failed to fetch stocks:', error);
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
        journals: data.journals || data.data || data || [],
      });
    } catch (error) {
      console.error('Failed to fetch journals:', error);
      setJournalModal({ isOpen: true, productName, journals: [] });
    }
  };

  // Create stock
  const handleCreateStock = async (
    productId: number,
    storeId: number,
    quantity: number
  ): Promise<void> => {
    console.log('📝 Creating stock...', { productId, storeId, quantity });

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
      console.error('❌ Create stock failed:', errorData);
      throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
    }

    console.log('✅ Stock created successfully');
    setCreateModal(false); // ✅ Close modal on success
    await fetchStocks(1);
  };

  // Update stock
  const handleUpdateStock = async (
    stockId: number,
    quantityChange: number,
    reason: string
  ): Promise<void> => {
    console.log('📝 Updating stock...', { stockId, quantityChange, reason });

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
      console.error('❌ Update stock failed:', errorData);
      throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
    }

    console.log('✅ Stock updated successfully');
    await fetchStocks(pagination.page);
  };

  useEffect(() => {
    fetchStores();
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchStocks(1);
  }, [selectedStore, userStoreId]);

  // Get effective store ID for create modal
  const effectiveStoreId = isSuperAdmin ? undefined : userStoreId;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
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
          className="btn btn-primary gap-2"
        >
          <FiPlus className="w-5 h-5" />
          Add Stock
        </button>
      </div>

      {/* Store Filter (Super Admin only) */}
      {isSuperAdmin && (
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="form-control w-full max-w-xs">
            <label className="label">
              <span className="label-text font-semibold">Filter by Store</span>
            </label>
            <select
              value={selectedStore || ''}
              onChange={(e) =>
                setSelectedStore(e.target.value ? parseInt(e.target.value) : null)
              }
              className="select select-bordered"
            >
              <option value="">All Stores</option>
              {stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
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

      {/* Stock List */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-3 bg-gray-50 border-b">
          <p className="text-sm text-gray-600">
            Showing {stocks.length} of {pagination.total} stocks
          </p>
        </div>

        <StockList
          stocks={stocks}
          loading={loading}
          onUpdate={(stock) => setUpdateModal({ isOpen: true, stock })}
          onViewHistory={fetchJournals}
        />

        {pagination.totalPages > 1 && (
          <div className="p-4 border-t">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={(page) => fetchStocks(page)}
            />
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