'use client';

import { useEffect, useState } from 'react';
import Table from '@/components/common/Table';
import Pagination from '@/components/common/Pagination';
import Modal from '@/components/common/Modal';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { useAuth } from '@/contexts/AuthContext';

interface Discount {
  id: number;
  name: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'BUY_ONE_GET_ONE';
  value: number;
  minPurchase?: number;
  maxDiscount?: number;
  productId?: number;
  product?: { id: number; name: string };
  storeId: number;
  store?: { id: number; name: string };
  startDate: string;
  endDate: string;
  isActive: boolean;
}

interface Store {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
}

export default function DiscountsPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const userStoreId = user?.storeId;

  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
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

  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    discountId?: number;
    discountName?: string;
  }>({ isOpen: false });

  const [formModal, setFormModal] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit';
    discount?: Discount;
  }>({ isOpen: false, mode: 'create' });

  const [formData, setFormData] = useState({
    name: '',
    type: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED_AMOUNT' | 'BUY_ONE_GET_ONE',
    value: 0,
    minPurchase: 0,
    maxDiscount: 0,
    productId: '',
    storeId: '',
    startDate: '',
    endDate: '',
  });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Fetch stores
  const fetchStores = async () => {
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

  // Fetch products
  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setProducts(data.products || data.data?.products || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  // Fetch discounts
  const fetchDiscounts = async (page: number = 1) => {
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
        `${process.env.NEXT_PUBLIC_API_URL}/discounts?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();

      setDiscounts(data.discounts || data.data || []);
      setPagination({
        page: data.page || page,
        limit: data.limit || 10,
        total: data.total || 0,
        totalPages: Math.ceil((data.total || 0) / (data.limit || 10)),
      });
    } catch (error) {
      console.error('Failed to fetch discounts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchDiscounts(1);
  }, [selectedStore]);

  const handleCreate = () => {
    const today = new Date().toISOString().split('T')[0];
    const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    setFormData({
      name: '',
      type: 'PERCENTAGE',
      value: 0,
      minPurchase: 0,
      maxDiscount: 0,
      productId: '',
      storeId: isSuperAdmin ? '' : String(userStoreId || ''),
      startDate: today,
      endDate: nextMonth,
    });
    setFormError('');
    setFormModal({ isOpen: true, mode: 'create' });
  };

  const handleEdit = (discount: Discount) => {
    setFormData({
      name: discount.name,
      type: discount.type,
      value: discount.value,
      minPurchase: discount.minPurchase || 0,
      maxDiscount: discount.maxDiscount || 0,
      productId: discount.productId ? String(discount.productId) : '',
      storeId: String(discount.storeId),
      startDate: discount.startDate?.split('T')[0] || '',
      endDate: discount.endDate?.split('T')[0] || '',
    });
    setFormError('');
    setFormModal({ isOpen: true, mode: 'edit', discount });
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setFormError('Discount name is required');
      return;
    }
    if (formData.value <= 0) {
      setFormError('Discount value must be greater than 0');
      return;
    }
    if (!formData.storeId) {
      setFormError('Store is required');
      return;
    }

    try {
      setFormLoading(true);
      const token = localStorage.getItem('token');
      const url = formModal.mode === 'create'
        ? `${process.env.NEXT_PUBLIC_API_URL}/discounts`
        : `${process.env.NEXT_PUBLIC_API_URL}/discounts/${formModal.discount?.id}`;

      const payload = {
        name: formData.name,
        type: formData.type,
        value: formData.value,
        minPurchase: formData.minPurchase || null,
        maxDiscount: formData.maxDiscount || null,
        productId: formData.productId ? parseInt(formData.productId) : null,
        storeId: parseInt(formData.storeId),
        startDate: formData.startDate,
        endDate: formData.endDate,
      };

      const response = await fetch(url, {
        method: formModal.mode === 'create' ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || error.error || 'Failed to save discount');
      }

      setFormModal({ isOpen: false, mode: 'create' });
      fetchDiscounts(pagination.page);
    } catch (error: any) {
      setFormError(error.message || 'Failed to save discount');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (discountId: number) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/discounts/${discountId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchDiscounts(pagination.page);
      setDeleteConfirm({ isOpen: false });
    } catch (error) {
      console.error('Failed to delete discount:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDiscountTypeLabel = (type: string) => {
    switch (type) {
      case 'PERCENTAGE': return '% Percentage';
      case 'FIXED_AMOUNT': return '💵 Fixed Amount';
      case 'BUY_ONE_GET_ONE': return '🎁 Buy 1 Get 1';
      default: return type;
    }
  };

  const formatDiscountValue = (discount: Discount) => {
    if (discount.type === 'PERCENTAGE') {
      return `${discount.value}%`;
    } else if (discount.type === 'FIXED_AMOUNT') {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(discount.value);
    } else {
      return 'BOGO';
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
      key: 'name',
      header: 'Discount Name',
      render: (value: string) => <span className="font-semibold">{value}</span>,
    },
    {
      key: 'type',
      header: 'Type',
      render: (value: string) => (
        <span className="badge badge-ghost text-xs">{getDiscountTypeLabel(value)}</span>
      ),
    },
    {
      key: 'value',
      header: 'Value',
      render: (_: number, item: Discount) => (
        <span className="font-semibold text-primary">{formatDiscountValue(item)}</span>
      ),
    },
    {
      key: 'product',
      header: 'Product',
      render: (value: { name: string } | undefined) => value?.name || 'All Products',
    },
    {
      key: 'endDate',
      header: 'Valid Until',
      render: (value: string) => {
        const date = new Date(value);
        const isExpired = date < new Date();
        return (
          <span className={isExpired ? 'text-error' : ''}>
            {date.toLocaleDateString('id-ID')}
            {isExpired && ' (Expired)'}
          </span>
        );
      },
    },
    {
      key: 'id',
      header: 'Actions',
      render: (value: number, item: Discount) => (
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => handleEdit(item)}
            className="btn btn-sm btn-primary"
            title="Edit"
          >
            ✏️
          </button>
          <button
            onClick={() =>
              setDeleteConfirm({
                isOpen: true,
                discountId: value,
                discountName: item.name,
              })
            }
            className="btn btn-sm btn-error"
            title="Delete"
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Discount Management</h1>
          <p className="text-gray-600 mt-1">Create and manage product discounts</p>
        </div>
        <button onClick={handleCreate} className="btn btn-primary gap-2">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          New Discount
        </button>
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

      {/* Discount Types Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-blue-50 border border-blue-200">
          <div className="card-body p-4">
            <h3 className="font-semibold text-blue-800">% Percentage</h3>
            <p className="text-sm text-blue-600">Discount by percentage of price</p>
          </div>
        </div>
        <div className="card bg-green-50 border border-green-200">
          <div className="card-body p-4">
            <h3 className="font-semibold text-green-800">💵 Fixed Amount</h3>
            <p className="text-sm text-green-600">Fixed discount amount in IDR</p>
          </div>
        </div>
        <div className="card bg-orange-50 border border-orange-200">
          <div className="card-body p-4">
            <h3 className="font-semibold text-orange-800">🎁 Buy 1 Get 1</h3>
            <p className="text-sm text-orange-600">Buy one product, get one free</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table
          columns={columns}
          data={discounts}
          loading={loading}
          emptyMessage="No discounts found"
        />

        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-gray-200">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={(page) => fetchDiscounts(page)}
            />
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={formModal.isOpen}
        onClose={() => setFormModal({ isOpen: false, mode: 'create' })}
        title={formModal.mode === 'create' ? 'Create Discount' : 'Edit Discount'}
      >
        <div className="space-y-4">
          {formError && (
            <div className="alert alert-error">
              <span>{formError}</span>
            </div>
          )}

          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Discount Name *</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input input-bordered"
              placeholder="e.g., Weekend Sale 10%"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Type *</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="select select-bordered"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED_AMOUNT">Fixed Amount (IDR)</option>
                <option value="BUY_ONE_GET_ONE">Buy 1 Get 1</option>
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">
                  Value * {formData.type === 'PERCENTAGE' ? '(%)' : '(IDR)'}
                </span>
              </label>
              <input
                type="number"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: parseInt(e.target.value) || 0 })}
                className="input input-bordered"
                placeholder={formData.type === 'PERCENTAGE' ? 'e.g., 10' : 'e.g., 50000'}
                disabled={formData.type === 'BUY_ONE_GET_ONE'}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Min Purchase (Optional)</span>
              </label>
              <input
                type="number"
                value={formData.minPurchase}
                onChange={(e) => setFormData({ ...formData, minPurchase: parseInt(e.target.value) || 0 })}
                className="input input-bordered"
                placeholder="e.g., 100000"
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Max Discount (Optional)</span>
              </label>
              <input
                type="number"
                value={formData.maxDiscount}
                onChange={(e) => setFormData({ ...formData, maxDiscount: parseInt(e.target.value) || 0 })}
                className="input input-bordered"
                placeholder="e.g., 50000"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Store *</span>
              </label>
              <select
                value={formData.storeId}
                onChange={(e) => setFormData({ ...formData, storeId: e.target.value })}
                className="select select-bordered"
                disabled={!isSuperAdmin}
              >
                <option value="">Select Store</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Product (Optional)</span>
              </label>
              <select
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                className="select select-bordered"
              >
                <option value="">All Products</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Start Date *</span>
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="input input-bordered"
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">End Date *</span>
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="input input-bordered"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end mt-6">
            <button
              onClick={() => setFormModal({ isOpen: false, mode: 'create' })}
              className="btn btn-ghost"
            >
              Cancel
            </button>
            <button onClick={handleSubmit} className="btn btn-primary" disabled={formLoading}>
              {formLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false })}
        onConfirm={() => deleteConfirm.discountId && handleDelete(deleteConfirm.discountId)}
        title="Delete Discount"
        message={`Are you sure you want to delete "${deleteConfirm.discountName}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}