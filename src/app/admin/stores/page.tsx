'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DataTable from '@/components/common/DataTable';
import Pagination from '@/components/common/Pagination';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import SearchBar from '@/components/common/SearchBar';
import Modal from '@/components/common/Modal';
import MapPicker from '@/components/admin/MapPicker';
import { useAuth } from '@/contexts/AuthContext';

interface Store {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  productCount: number;
  users: Array<{
    id: number;
    fullName: string;
    email: string;
    role: string;
  }>;
}

interface StoreFormData {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

export default function StoresPage() {
  const router = useRouter();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const getApiUrl = () => {
    if (typeof window !== 'undefined') {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      return baseUrl ? baseUrl.replace(/\/$/, '') : 'http://localhost:8000/api';
    }
    return 'http://localhost:8000/api';
  };

  useEffect(() => {
    if (user && !isSuperAdmin) {
      router.push('/admin/dashboard');
    }
  }, [user, isSuperAdmin, router]);

  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    storeId?: number;
    storeName?: string;
  }>({ isOpen: false });

  const [formModal, setFormModal] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit';
    store?: Store;
  }>({ isOpen: false, mode: 'create' });

  const [formData, setFormData] = useState<StoreFormData>({
    name: '',
    address: '',
    latitude: -6.2088, // Default Jakarta
    longitude: 106.8456,
  });

  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);

  const fetchStores = async (page: number = 1, search: string = '') => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: String(page),
        limit: String(pagination.limit),
      });
      if (search) params.append('search', search);

      // Choose endpoint based on showDeleted
      const endpoint = showDeleted ? '/stores/deleted' : '/stores';
      const url = `${getApiUrl()}${endpoint}?${params}`;
      
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();

      let storesList = [];
      let totalStores = 0;
      let pageNum = page;
      let limitNum = pagination.limit;
      let totalPages = 0;

      if (data.data && typeof data.data === 'object') {
        const dataPayload = data.data;
        storesList = Array.isArray(dataPayload.stores) ? dataPayload.stores : [];
        totalStores = dataPayload.total || 0;
        pageNum = dataPayload.page || page;
        limitNum = dataPayload.limit || pagination.limit;
        totalPages = dataPayload.totalPages || Math.ceil(totalStores / limitNum);
      } else if (Array.isArray(data.stores)) {
        storesList = data.stores;
        totalStores = data.total || 0;
        pageNum = data.page || page;
        limitNum = data.limit || pagination.limit;
        totalPages = data.totalPages || Math.ceil(totalStores / limitNum);
      } else if (Array.isArray(data)) {
        storesList = data;
        totalStores = data.length;
        pageNum = 1;
        limitNum = data.length;
        totalPages = 1;
      }

      setStores(storesList);
      setPagination({ page: pageNum, limit: limitNum, total: totalStores, totalPages });
    } catch (error) {
      console.error('Failed to fetch stores:', error);
      setStores([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin) {
      fetchStores(1, '');
    }
  }, [isSuperAdmin, showDeleted]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    fetchStores(1, query);
  };

  const handleCreate = () => {
    setFormData({ name: '', address: '', latitude: -6.2088, longitude: 106.8456 });
    setFormError('');
    setFormModal({ isOpen: true, mode: 'create' });
  };

  const handleEdit = (store: Store) => {
    setFormData({
      name: store.name,
      address: store.address,
      latitude: store.latitude,
      longitude: store.longitude,
    });
    setFormError('');
    setFormModal({ isOpen: true, mode: 'edit', store });
  };

  const handleFormChange = (field: keyof StoreFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formError) setFormError('');
  };

  const handleLocationSelect = (lat: number, lng: number, address?: string) => {
    handleFormChange('latitude', lat);
    handleFormChange('longitude', lng);
    if (address && !formData.address) {
      handleFormChange('address', address);
    }
    setShowMapPicker(false);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setFormError('Store name is required');
      return false;
    }
    if (!formData.address.trim()) {
      setFormError('Store address is required');
      return false;
    }
    if (!formData.latitude || !formData.longitude) {
      setFormError('Please select a location on the map');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setFormLoading(true);
      const token = localStorage.getItem('token');
      const url = formModal.mode === 'create'
        ? `${getApiUrl()}/stores`
        : `${getApiUrl()}/stores/${formModal.store?.id}`;

      const response = await fetch(url, {
        method: formModal.mode === 'create' ? 'POST' : 'PUT',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save store');
      }

      setFormModal({ isOpen: false, mode: 'create' });
      fetchStores(pagination.page, searchQuery);
    } catch (error: any) {
      setFormError(error.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.storeId) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${getApiUrl()}/stores/${deleteConfirm.storeId}?confirm=yes`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete store');
      }
      
      setDeleteConfirm({ isOpen: false });
      fetchStores(pagination.page, searchQuery);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (storeId: number) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${getApiUrl()}/stores/${storeId}/restore`,
        {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      if (!response.ok) throw new Error('Failed to restore store');
      
      fetchStores(pagination.page, searchQuery);
    } catch (error) {
      console.error('Failed to restore store:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const columns = [
    {
      key: 'id',
      header: 'ID',
      render: (value: number) => (
        <span className="font-mono text-sm font-bold text-gray-700">#{value}</span>
      ),
      className: 'w-16',
    },
    {
      key: 'name',
      header: 'Store Name',
      render: (value: string, item: Store) => (
        <div>
          <p className="font-semibold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500 truncate">{item.address}</p>
        </div>
      ),
    },
    {
      key: 'coordinates',
      header: 'Location',
      render: (_: any, item: Store) => (
        <div className="text-sm">
          <p className="text-gray-700">
            {item.latitude.toFixed(6)}, {item.longitude.toFixed(6)}
          </p>
          <button 
            onClick={() => window.open(`https://maps.google.com/?q=${item.latitude},${item.longitude}`, '_blank')}
            className="text-xs text-blue-600 hover:underline mt-1"
          >
            View on Map
          </button>
        </div>
      ),
    },
    {
      key: 'productCount',
      header: 'Products',
      render: (value: number) => (
        <span className="font-medium">{value} items</span>
      ),
      className: 'text-center',
    },
    {
      key: 'users',
      header: 'Admins',
      render: (value: Store['users']) => (
        <div>
          {value.length === 0 ? (
            <span className="text-gray-400">No admins</span>
          ) : (
            <div className="flex flex-col gap-1">
              {value.slice(0, 2).map((user) => (
                <span key={user.id} className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {user.fullName}
                </span>
              ))}
              {value.length > 2 && (
                <span className="text-xs text-gray-500">
                  +{value.length - 2} more
                </span>
              )}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (value: string) => (
        <span className="text-sm text-gray-600">{formatDate(value)}</span>
      ),
      className: 'w-32',
    },
    {
      key: 'id',
      header: 'Actions',
      render: (value: number, item: Store) => (
        <div className="flex gap-2 justify-end">
          {showDeleted ? (
            <>
              <button
                onClick={() => handleRestore(value)}
                className="btn btn-sm btn-success"
                title="Restore store"
              >
                Restore
              </button>
            </>
          ) : (
            <>
              <Link
                href={`/admin/stores/${value}/admins`}
                className="btn btn-sm btn-info"
                title="Manage store admins"
              >
                👥
              </Link>
              <button
                onClick={() => handleEdit(item)}
                className="btn btn-sm btn-primary"
                title="Edit store"
              >
                ✏️
              </button>
              <button
                onClick={() => setDeleteConfirm({ isOpen: true, storeId: value, storeName: item.name })}
                className="btn btn-sm btn-error"
                title="Delete store"
              >
                🗑️
              </button>
            </>
          )}
        </div>
      ),
      className: 'text-right',
    },
  ];

  if (!user) return null;

  if (!isSuperAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">403 - Access Denied</h1>
          <p className="text-gray-600 text-lg mb-6">
            🔐 Store Management is restricted to <span className="font-bold text-red-600">Super Admin</span> only
          </p>
          <Link href="/admin/dashboard" className="btn btn-primary">← Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🏪 Store Management</h1>
          <p className="text-gray-600 mt-1">
            Manage store locations, details, and store admin assignments
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowDeleted(!showDeleted)}
            className={`btn ${showDeleted ? 'btn-secondary' : 'btn-outline'}`}
          >
            {showDeleted ? '📂 View Active' : '🗑️ View Deleted'}
          </button>
          <button onClick={handleCreate} className="btn btn-primary gap-2">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            New Store
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <SearchBar value={searchQuery} onChange={handleSearch} placeholder="Search stores by name or address..." />
      </div>

      {/* Stores Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 flex justify-center">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : stores.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <DataTable 
                columns={columns} 
                data={stores} 
                loading={loading}
                emptyMessage={showDeleted ? "No deleted stores found" : "No stores found"}
              />
            </div>
            {pagination.totalPages > 1 && (
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <Pagination 
                  currentPage={pagination.page} 
                  totalPages={pagination.totalPages} 
                  onPageChange={(page) => fetchStores(page, searchQuery)} 
                />
              </div>
            )}
          </>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <p className="text-lg">{showDeleted ? 'No deleted stores' : 'No stores found'}</p>
            {!showDeleted && (
              <button onClick={handleCreate} className="btn btn-primary mt-4">
                Create Your First Store
              </button>
            )}
          </div>
        )}
      </div>

      {/* Store Form Modal */}
      <Modal
        isOpen={formModal.isOpen}
        onClose={() => setFormModal({ isOpen: false, mode: 'create' })}
        title={`${formModal.mode === 'create' ? '🏪 Create New Store' : '✏️ Edit Store'}`}
        size="lg"
      >
        <div className="space-y-5">
          {formError && (
            <div className="alert alert-error gap-3 rounded-lg">
              <svg className="stroke-current shrink-0 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4v2m0 0v2m0-6v-2m0 0V7a2 2 0 012-2h.5a.5.5 0 00-.5.5v.5H9.5a.5.5 0 00-.5.5v.5a2 2 0 014 0z" />
              </svg>
              <span className="text-sm font-medium">{formError}</span>
            </div>
          )}

          {/* Store Name */}
          <div className="form-control">
            <label className="label pb-2">
              <span className="label-text font-semibold text-gray-900 text-base">
                Store Name <span className="text-red-500">*</span>
              </span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleFormChange('name', e.target.value)}
              placeholder="Enter store name"
              className="input input-bordered input-lg text-gray-900 bg-white"
              autoFocus
              disabled={formLoading}
            />
          </div>

          {/* Address */}
          <div className="form-control">
            <label className="label pb-2">
              <span className="label-text font-semibold text-gray-900 text-base">
                Address <span className="text-red-500">*</span>
              </span>
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => handleFormChange('address', e.target.value)}
              placeholder="Enter full store address"
              className="textarea textarea-bordered text-gray-900 bg-white h-24"
              rows={3}
              disabled={formLoading}
            />
          </div>

          {/* Location Picker */}
          <div className="form-control">
            <label className="label pb-2">
              <span className="label-text font-semibold text-gray-900 text-base">
                Store Location <span className="text-red-500">*</span>
              </span>
            </label>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-sm text-gray-500">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => handleFormChange('latitude', parseFloat(e.target.value))}
                    className="input input-bordered w-full text-gray-900 bg-white"
                    disabled={formLoading}
                  />
                </div>
                <div className="flex-1">
                  <label className="text-sm text-gray-500">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => handleFormChange('longitude', parseFloat(e.target.value))}
                    className="input input-bordered w-full text-gray-900 bg-white"
                    disabled={formLoading}
                  />
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => setShowMapPicker(true)}
                className="btn btn-outline w-full gap-2"
                disabled={formLoading}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Pick Location on Map
              </button>
              
              {formData.latitude && formData.longitude && (
                <div className="text-center">
                  <a
                    href={`https://maps.google.com/?q=${formData.latitude},${formData.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm inline-flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    View on Google Maps
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 justify-end pt-6 border-t border-gray-200">
            <button
              onClick={() => setFormModal({ isOpen: false, mode: 'create' })}
              className="btn btn-ghost btn-md min-w-24"
              disabled={formLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="btn btn-primary btn-md min-w-24 gap-2"
              disabled={formLoading || !formData.name.trim() || !formData.address.trim()}
            >
              {formLoading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Save Store
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Map Picker Modal */}
      {showMapPicker && (
        <Modal
          isOpen={showMapPicker}
          onClose={() => setShowMapPicker(false)}
          title="📍 Pick Store Location"
          size="lg"
        >
          <MapPicker
            initialLat={formData.latitude}
            initialLng={formData.longitude}
            onLocationSelect={handleLocationSelect}
            onClose={() => setShowMapPicker(false)}
          />
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false })}
        onConfirm={handleDelete}
        title="Delete Store"
        message={`Are you sure you want to delete "${deleteConfirm.storeName}"? This will also remove all associated store admins.`}
        confirmText="Delete Store"
        cancelText="Cancel"
        type="danger"
        loading={loading}
      />
    </div>
  );
}