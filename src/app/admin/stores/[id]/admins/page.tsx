'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import DataTable from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import { useAuth } from '@/contexts/AuthContext';

interface StoreAdmin {
  id: number;
  fullName: string;
  email: string;
  role: string;
  emailVerifiedAt?: string;
  createdAt: string;
}

interface AvailableAdmin {
  id: number;
  fullName: string;
  email: string;
  createdAt: string;
}

interface StoreInfo {
  id: number;
  name: string;
  address: string;
}

export default function StoreAdminsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const storeId = parseInt(params.id as string);
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const getApiUrl = () => {
    if (typeof window !== 'undefined') {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      return baseUrl ? baseUrl.replace(/\/$/, '') : 'http://localhost:8000/api';
    }
    return 'http://localhost:8000/api';
  };

  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [storeAdmins, setStoreAdmins] = useState<StoreAdmin[]>([]);
  const [availableAdmins, setAvailableAdmins] = useState<AvailableAdmin[]>([]);
  const [loading, setLoading] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedAdminId, setSelectedAdminId] = useState<number>(0);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchStoreInfo = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${getApiUrl()}/stores/${storeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setStoreInfo(data.data?.store || data.store || data);
      }
    } catch (err) {
      console.error('Failed to fetch store info:', err);
    }
  }, [storeId]);

  const fetchStoreAdmins = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${getApiUrl()}/stores/${storeId}/admins`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setStoreAdmins(data.storeAdmins || data.data?.storeAdmins || data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch store admins:', err);
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  const fetchAvailableAdmins = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${getApiUrl()}/stores/available-admins`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableAdmins(data.storeAdmins || data.data?.storeAdmins || data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch available admins:', err);
    }
  }, []);

  useEffect(() => {
    if (storeId && isSuperAdmin) {
      fetchStoreInfo();
      fetchStoreAdmins();
      fetchAvailableAdmins();
    }
  }, [storeId, isSuperAdmin, fetchStoreInfo, fetchStoreAdmins, fetchAvailableAdmins]);

  const handleAssignAdmin = async () => {
    if (!selectedAdminId) {
      setError('Please select an admin');
      return;
    }

    try {
      setActionLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${getApiUrl()}/stores/assign-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: selectedAdminId,
          storeId: storeId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to assign admin');
      }

      setAssignModalOpen(false);
      setSelectedAdminId(0);
      fetchStoreAdmins();
      fetchAvailableAdmins();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveAdmin = async (adminId: number) => {
    if (!confirm('Are you sure you want to remove this admin from the store?')) return;

    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${getApiUrl()}/stores/remove-admin/${adminId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to remove admin');
      }

      fetchStoreAdmins();
      fetchAvailableAdmins();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
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
      key: 'fullName',
      header: 'Admin Name',
      render: (value: string, item: StoreAdmin) => (
        <div>
          <p className="font-semibold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">{item.email}</p>
        </div>
      ),
    },
    {
      key: 'emailVerifiedAt',
      header: 'Status',
      render: (value?: string) => (
        <span className={`badge ${value ? 'badge-success' : 'badge-warning'}`}>
          {value ? 'Verified' : 'Pending'}
        </span>
      ),
      className: 'text-center',
    },
    {
      key: 'createdAt',
      header: 'Assigned',
      render: (value: string) => (
        <span className="text-sm text-gray-600">{formatDate(value)}</span>
      ),
      className: 'w-32',
    },
    {
      key: 'id',
      header: 'Actions',
      render: (value: number) => (
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => handleRemoveAdmin(value)}
            className="btn btn-sm btn-error"
            disabled={actionLoading}
            title="Remove from store"
          >
            Remove
          </button>
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
            🔐 Store Admin Management is restricted to <span className="font-bold text-red-600">Super Admin</span> only
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
          <button 
            onClick={() => router.push('/admin/stores')} 
            className="text-blue-600 hover:text-blue-800 mb-2 flex items-center gap-1"
          >
            ← Back to Stores
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            👥 Store Admin Management
          </h1>
          <p className="text-gray-600 mt-1">
            {storeInfo?.name || `Store #${storeId}`}
          </p>
          {storeInfo?.address && (
            <p className="text-sm text-gray-500 mt-1">{storeInfo.address}</p>
          )}
        </div>
        <button
          onClick={() => setAssignModalOpen(true)}
          className="btn btn-primary gap-2"
          disabled={availableAdmins.length === 0}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Assign Admin
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Store Admins</p>
              <p className="text-3xl font-bold mt-1">{storeAdmins.length}</p>
            </div>
            <div className="text-4xl opacity-80">👥</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Verified Admins</p>
              <p className="text-3xl font-bold mt-1">
                {storeAdmins.filter(a => a.emailVerifiedAt).length}
              </p>
            </div>
            <div className="text-4xl opacity-80">✅</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Available Admins</p>
              <p className="text-3xl font-bold mt-1">{availableAdmins.length}</p>
            </div>
            <div className="text-4xl opacity-80">👤</div>
          </div>
        </div>
      </div>

      {/* Store Admins Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <h3 className="font-semibold text-gray-900">Current Store Admins</h3>
          <p className="text-sm text-gray-500">Admins assigned to this store</p>
        </div>
        
        <DataTable 
          columns={columns} 
          data={storeAdmins} 
          loading={loading}
          emptyMessage="No store admins assigned yet. Assign your first admin!"
        />
      </div>

      {/* Assign Admin Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => {
          setAssignModalOpen(false);
          setSelectedAdminId(0);
          setError('');
        }}
        title="Assign Store Admin"
        size="md"
      >
        <div className="space-y-5">
          {error && (
            <div className="alert alert-error gap-3 rounded-lg">
              <svg className="stroke-current shrink-0 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4v2m0 0v2m0-6v-2m0 0V7a2 2 0 012-2h.5a.5.5 0 00-.5.5v.5H9.5a.5.5 0 00-.5.5v.5a2 2 0 014 0z" />
              </svg>
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          <div className="form-control">
            <label className="label pb-2">
              <span className="label-text font-semibold text-gray-900 text-base">
                Select Store Admin
              </span>
            </label>
            
            {availableAdmins.length === 0 ? (
              <div className="p-4 text-center border rounded-lg bg-gray-50">
                <p className="text-gray-600">No available store admins found.</p>
                <p className="text-sm text-gray-500 mt-1">
                  Create new store admins from the Users page first.
                </p>
                <Link 
                  href="/admin/users" 
                  className="btn btn-primary btn-sm mt-3"
                >
                  Go to Users
                </Link>
              </div>
            ) : (
              <select
                value={selectedAdminId}
                onChange={(e) => setSelectedAdminId(parseInt(e.target.value))}
                className="select select-bordered w-full text-gray-900 bg-white"
                disabled={actionLoading}
              >
                <option value={0}>-- Select an admin --</option>
                {availableAdmins.map((admin) => (
                  <option key={admin.id} value={admin.id}>
                    {admin.fullName} ({admin.email})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Store Info Preview */}
          {selectedAdminId > 0 && storeInfo && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">Assignment Preview</h4>
              <p className="text-sm text-blue-700">
                <strong>
                  {availableAdmins.find(a => a.id === selectedAdminId)?.fullName}
                </strong>{' '}
                will be assigned to <strong>{storeInfo.name}</strong>
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-6 border-t border-gray-200">
            <button
              onClick={() => {
                setAssignModalOpen(false);
                setSelectedAdminId(0);
                setError('');
              }}
              className="btn btn-ghost btn-md min-w-24"
              disabled={actionLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleAssignAdmin}
              className="btn btn-primary btn-md min-w-24 gap-2"
              disabled={actionLoading || selectedAdminId === 0}
            >
              {actionLoading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Assigning...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Assign Admin
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}