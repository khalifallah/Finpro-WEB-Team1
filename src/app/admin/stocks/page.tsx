'use client';

import { useEffect, useState } from 'react';
import Table from '@/components/common/Table';
import Pagination from '@/components/common/Pagination';
import Modal from '@/components/common/Modal';
import { useAuth } from '@/contexts/AuthContext';

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

interface StockJournal {
  id: number;
  quantityChange: number;
  reason: string;
  createdAt: string;
}

export default function StocksPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const userStoreId = user?.storeId;

  const [stocks, setStocks] = useState<Stock[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStore, setSelectedStore] = useState<number | null>(
    isSuperAdmin ? null : userStoreId || null
  );
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [updateModal, setUpdateModal] = useState<{
    isOpen: boolean;
    stock?: Stock;
  }>({ isOpen: false });

  const [stockChange, setStockChange] = useState({
    quantityChange: 0,
    reason: '',
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState('');

  const [journalModal, setJournalModal] = useState<{
    isOpen: boolean;
    stockId?: number;
    productName?: string;
    journals: StockJournal[];
  }>({ isOpen: false, journals: [] });

  // Fetch stores (Super Admin only)
  const fetchStores = async () => {
    if (!isSuperAdmin) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stores`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setStores(data.stores || data || []);
    } catch (error) {
      console.error('Failed to fetch stores:', error);
    }
  };

  // Fetch stocks
  const fetchStocks = async (page: number = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: String(page),
        limit: String(pagination.limit),
      });

      const storeIdToUse = selectedStore || userStoreId;
      if (storeIdToUse) params.append('storeId', String(storeIdToUse));

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/stocks?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
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

  // Fetch stock journals (history)
  const fetchJournals = async (stockId: number, productName: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/stocks/${stockId}/journals`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      setJournalModal({
        isOpen: true,
        stockId,
        productName,
        journals: data.journals || data || [],
      });
    } catch (error) {
      console.error('Failed to fetch journals:', error);
      setJournalModal({ isOpen: true, stockId, productName, journals: [] });
    }
  };

  useEffect(() => {
    fetchStores();
  }, [isSuperAdmin]);

  useEffect(() => {
    fetchStocks(1);
  }, [selectedStore]);

  const handleUpdateStock = async () => {
    if (!updateModal.stock) return;
    if (stockChange.quantityChange === 0) {
      setUpdateError('Quantity change cannot be zero');
      return;
    }
    if (!stockChange.reason.trim()) {
      setUpdateError('Reason is required');
      return;
    }

    try {
      setUpdateLoading(true);
      setUpdateError('');
      const token = localStorage.getItem('token');

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/stocks/${updateModal.stock.id}/journal`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            quantityChange: stockChange.quantityChange,
            reason: stockChange.reason,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update stock');
      }

      setUpdateModal({ isOpen: false });
      setStockChange({ quantityChange: 0, reason: '' });
      fetchStocks(pagination.page);
    } catch (error: any) {
      setUpdateError(error.message || 'Failed to update stock');
    } finally {
      setUpdateLoading(false);
    }
  };

  const columns = [
    {
      key: 'id',
      header: 'ID',
      render: (value: number) => <span className="font-mono text-xs">#{value}</span>,
      className: 'w-16',
    },
    {
      key: 'product',
      header: 'Product',
      render: (value: { name: string }) => (
        <span className="font-semibold">{value?.name || '-'}</span>
      ),
    },
    {
      key: 'store',
      header: 'Store',
      render: (value: { name: string }) => value?.name || '-',
    },
    {
      key: 'quantity',
      header: 'Stock',
      render: (value: number) => (
        <div
          className={`badge ${
            value > 10 ? 'badge-success' : value > 0 ? 'badge-warning' : 'badge-error'
          }`}
        >
          {value} units
        </div>
      ),
    },
    {
      key: 'id',
      header: 'Actions',
      render: (value: number, item: Stock) => (
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => fetchJournals(value, item.product?.name)}
            className="btn btn-sm btn-ghost"
            title="View History"
          >
            📋
          </button>
          <button
            onClick={() => {
              setUpdateModal({ isOpen: true, stock: item });
              setStockChange({ quantityChange: 0, reason: '' });
              setUpdateError('');
            }}
            className="btn btn-sm btn-primary"
            title="Update Stock"
          >
            ✏️
          </button>
        </div>
      ),
      className: 'text-right',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Stock Management</h1>
        <p className="text-gray-600 mt-1">
          {isSuperAdmin
            ? 'Manage inventory across all stores'
            : 'Manage inventory for your store'}
        </p>
      </div>

      {/* Store Filter (Super Admin only) */}
      {isSuperAdmin && (
        <div className="bg-white p-4 rounded-lg shadow">
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

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table
          columns={columns}
          data={stocks}
          loading={loading}
          emptyMessage="No stocks found"
        />

        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-gray-200">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={(page) => fetchStocks(page)}
            />
          </div>
        )}
      </div>

      {/* Update Stock Modal */}
      <Modal
        isOpen={updateModal.isOpen}
        onClose={() => setUpdateModal({ isOpen: false })}
        title="Update Stock"
      >
        {updateModal.stock && (
          <div className="space-y-4">
            {updateError && (
              <div className="alert alert-error">
                <span>{updateError}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Product</p>
                <p className="font-semibold">{updateModal.stock.product?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Current Stock</p>
                <p className="font-semibold">{updateModal.stock.quantity} units</p>
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Stock Change</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setStockChange((prev) => ({
                      ...prev,
                      quantityChange: prev.quantityChange - 1,
                    }))
                  }
                  className="btn btn-sm btn-outline"
                >
                  -
                </button>
                <input
                  type="number"
                  value={stockChange.quantityChange}
                  onChange={(e) =>
                    setStockChange((prev) => ({
                      ...prev,
                      quantityChange: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="input input-bordered w-24 text-center"
                />
                <button
                  onClick={() =>
                    setStockChange((prev) => ({
                      ...prev,
                      quantityChange: prev.quantityChange + 1,
                    }))
                  }
                  className="btn btn-sm btn-outline"
                >
                  +
                </button>
              </div>
              <p className="text-sm mt-2">
                New Stock:{' '}
                <span className={`font-bold ${
                  updateModal.stock.quantity + stockChange.quantityChange < 0 
                    ? 'text-error' 
                    : 'text-success'
                }`}>
                  {Math.max(0, updateModal.stock.quantity + stockChange.quantityChange)} units
                </span>
              </p>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Reason *</span>
              </label>
              <textarea
                value={stockChange.reason}
                onChange={(e) =>
                  setStockChange((prev) => ({ ...prev, reason: e.target.value }))
                }
                className="textarea textarea-bordered"
                placeholder="e.g., Restocking, Damaged goods, Sold..."
                rows={3}
              />
            </div>

            <div className="flex gap-2 justify-end mt-6">
              <button
                onClick={() => setUpdateModal({ isOpen: false })}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStock}
                className="btn btn-primary"
                disabled={updateLoading || stockChange.quantityChange === 0}
              >
                {updateLoading ? 'Saving...' : 'Update Stock'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Journal History Modal */}
      <Modal
        isOpen={journalModal.isOpen}
        onClose={() => setJournalModal({ isOpen: false, journals: [] })}
        title={`Stock History - ${journalModal.productName || 'Product'}`}
      >
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {journalModal.journals.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No history found</p>
          ) : (
            journalModal.journals.map((journal, index) => (
              <div
                key={journal.id || index}
                className="border rounded-lg p-3 flex justify-between items-center"
              >
                <div>
                  <p className={`font-semibold ${
                    journal.quantityChange > 0 ? 'text-success' : 'text-error'
                  }`}>
                    {journal.quantityChange > 0 ? '+' : ''}
                    {journal.quantityChange} units
                  </p>
                  <p className="text-sm text-gray-600">{journal.reason}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(journal.createdAt).toLocaleString('id-ID')}
                  </p>
                </div>
                <div
                  className={`badge ${
                    journal.quantityChange > 0 ? 'badge-success' : 'badge-error'
                  }`}
                >
                  {journal.quantityChange > 0 ? 'IN' : 'OUT'}
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>
    </div>
  );
}