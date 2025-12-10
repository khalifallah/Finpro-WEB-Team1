'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Table from '@/components/common/Table';
import SearchBar from '@/components/common/SearchBar';
import Pagination from '@/components/common/Pagination';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import Modal from '@/components/common/Modal';
import { useAuth } from '@/contexts/AuthContext';

interface User {
  id: number;
  email: string;
  fullName: string;
  role: 'USER' | 'STORE_ADMIN' | 'SUPER_ADMIN';
  storeId?: number;
  store?: { id: number; name: string };
  emailVerifiedAt?: string;
  createdAt: string;
}

interface Store {
  id: number;
  name: string;
}

export default function UsersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  // ✅ FIXED: Return FULL URL dengan http/https
  const getApiUrl = () => {
    if (typeof window !== 'undefined') {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      
      // Debug: log environment variable
      console.log('🔧 NEXT_PUBLIC_API_URL:', baseUrl);
      
      // Return full URL, remove trailing slash
      return baseUrl ? baseUrl.replace(/\/$/, '') : 'http://localhost:8000/api';
    }
    return 'http://localhost:8000/api';
  };

  // Redirect if not super admin
  useEffect(() => {
    if (user && !isSuperAdmin) {
      router.push('/admin/dashboard');
    }
  }, [user, isSuperAdmin, router]);

  const [users, setUsers] = useState<User[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    userId?: number;
    userName?: string;
  }>({ isOpen: false });

  const [formModal, setFormModal] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit';
    user?: User;
  }>({ isOpen: false, mode: 'create' });

  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    password: '',
    role: 'STORE_ADMIN' as 'STORE_ADMIN' | 'SUPER_ADMIN',
    storeId: '',
  });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // ✅ Update fetchStores with getApiUrl
  const fetchStores = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = `${getApiUrl()}/stores`;
      console.log('📡 Fetching stores from:', url);
      
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      console.log('📦 Raw Stores Response:', data);

      // ✅ Defensive parsing
      let storesList: Store[] = [];
      
      // Check response wrapper
      if (data.data && Array.isArray(data.data)) {
        storesList = data.data;
      } else if (Array.isArray(data.stores)) {
        storesList = data.stores;
      } else if (Array.isArray(data.data)) {
        storesList = data.data;
      } else if (Array.isArray(data)) {
        storesList = data;
      }

      console.log('✅ Stores parsed:', storesList.length);
      setStores(storesList);
    } catch (error) {
      console.error('❌ Failed to fetch stores:', error);
      setStores([]);
    }
  };

  // ✅ Update fetchUsers with getApiUrl
  const fetchUsers = async (page: number = 1, search: string = '') => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: String(page),
        limit: String(pagination.limit),
      });
      if (search) params.append('search', search);
      if (roleFilter) params.append('role', roleFilter);

      const url = `${getApiUrl()}/admin/users?${params}`;
      console.log('📡 Fetching users from:', url);
      
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('📦 Raw API Response:', data);

      // ✅ Handle response wrapper
      let usersList = [];
      let totalUsers = 0;
      let pageNum = page;
      let limitNum = pagination.limit;
      let totalPages = 0;

      // Check if response wrapped in data field
      if (data.data && typeof data.data === 'object') {
        const dataPayload = data.data;
        
        if (Array.isArray(dataPayload.users)) {
          usersList = dataPayload.users;
        } else if (Array.isArray(dataPayload)) {
          usersList = dataPayload;
        }
        
        totalUsers = dataPayload.total || 0;
        pageNum = dataPayload.page || page;
        limitNum = dataPayload.limit || pagination.limit;
        totalPages = dataPayload.totalPages || Math.ceil(totalUsers / limitNum);
      } 
      // Direct response (unwrapped)
      else if (Array.isArray(data.users)) {
        usersList = data.users;
        totalUsers = data.total || 0;
        pageNum = data.page || page;
        limitNum = data.limit || pagination.limit;
        totalPages = data.totalPages || Math.ceil(totalUsers / limitNum);
      } 
      // Fallback for other formats
      else if (Array.isArray(data.data)) {
        usersList = data.data;
        totalUsers = data.total || usersList.length;
        pageNum = data.page || page;
        limitNum = data.limit || pagination.limit;
        totalPages = data.totalPages || Math.ceil(totalUsers / limitNum);
      } 
      else if (Array.isArray(data)) {
        usersList = data;
        totalUsers = usersList.length;
      }

      console.log('✅ Users parsed:', { count: usersList.length, total: totalUsers, pages: totalPages });
      setUsers(usersList);
      setPagination({
        page: pageNum,
        limit: limitNum,
        total: totalUsers,
        totalPages: totalPages,
      });
    } catch (error) {
      console.error('❌ Failed to fetch users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin) {
      console.log('🚀 API Base URL:', getApiUrl());
      console.log('🚀 Full URL to fetch:', `${getApiUrl()}/admin/users`);
      fetchStores();
      fetchUsers(1, '');
    }
  }, [isSuperAdmin]);

  useEffect(() => {
    if (isSuperAdmin) {
      fetchUsers(1, searchQuery);
    }
  }, [roleFilter]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    fetchUsers(1, query);
  };

  const handleCreate = () => {
    setFormData({
      email: '',
      fullName: '',
      password: '',
      role: 'STORE_ADMIN',
      storeId: '',
    });
    setFormError('');
    setFormModal({ isOpen: true, mode: 'create' });
  };

  const handleEdit = (editUser: User) => {
    setFormData({
      email: editUser.email,
      fullName: editUser.fullName,
      password: '',
      role: editUser.role as 'STORE_ADMIN' | 'SUPER_ADMIN',
      storeId: editUser.storeId ? String(editUser.storeId) : '',
    });
    setFormError('');
    setFormModal({ isOpen: true, mode: 'edit', user: editUser });
  };

  const handleSubmit = async () => {
    if (!formData.email.trim()) {
      setFormError('Email is required');
      return;
    }
    if (!formData.fullName.trim()) {
      setFormError('Full name is required');
      return;
    }
    if (formModal.mode === 'create' && !formData.password) {
      setFormError('Password is required');
      return;
    }
    if (formData.role === 'STORE_ADMIN' && !formData.storeId) {
      setFormError('Store is required for Store Admin');
      return;
    }

    try {
      setFormLoading(true);
      const token = localStorage.getItem('token');

      // ✅ Update endpoints with getApiUrl
      const url = formModal.mode === 'create'
        ? `${getApiUrl()}/admin/store-admins`
        : `${getApiUrl()}/admin/users/${formModal.user?.id}`;

      const payload: any = {
        email: formData.email,
        fullName: formData.fullName,
        role: formData.role,
        storeId: formData.storeId ? parseInt(formData.storeId) : null,
      };

      if (formData.password) {
        payload.password = formData.password;
      }

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
        throw new Error(error.message || error.error || 'Failed to save user');
      }

      setFormModal({ isOpen: false, mode: 'create' });
      fetchUsers(pagination.page, searchQuery);
    } catch (error: any) {
      setFormError(error.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (userId: number) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${getApiUrl()}/admin/users/${userId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      setDeleteConfirm({ isOpen: false });
      fetchUsers(pagination.page, searchQuery);
    } catch (error: any) {
      console.error('Failed to delete user:', error);
    } finally {
      setLoading(false);
    }
  };

  // Show nothing while checking auth
  if (!user) {
    return null;
  }

  // Show forbidden message if not super admin
  if (!isSuperAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="mb-6">
            <svg className="w-24 h-24 mx-auto text-red-500 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4v2m-6-4a9 9 0 1118 0 9 9 0 01-18 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">403 - Access Denied</h1>
          <p className="text-gray-600 text-lg mb-6">
            🔐 User Management is restricted to <span className="font-bold text-red-600">Super Admin</span> only
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 inline-block">
            <p className="text-red-700 text-sm">
              Your role: <span className="font-semibold">{user.role?.replace('_', ' ')}</span>
            </p>
          </div>
          <Link href="/admin/dashboard" className="btn btn-primary">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-black">👥 User Management</h1>
          <p className="text-black mt-2 text-sm">Manage system users and store admin accounts</p>
        </div>
        <button
          onClick={handleCreate}
          className="btn btn-primary gap-2"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          New User
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 space-y-4">
        <div>
          <SearchBar
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search by email or name..."
          />
        </div>
        <div>
          <label className="label">
            <span className="label-text font-medium text-gray-700">Filter by Role</span>
          </label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="select select-bordered w-full"
          >
            <option value="">All Roles</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="STORE_ADMIN">Store Admin</option>
            <option value="USER">User</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 flex justify-center">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : users.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="table">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-gray-700">Email</th>
                    <th className="text-gray-700">Full Name</th>
                    <th className="text-gray-700">Role</th>
                    <th className="text-gray-700">Store</th>
                    <th className="text-gray-700">Status</th>
                    <th className="text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((usr) => (
                    <tr key={usr.id} className="hover:bg-gray-50 border-b border-gray-100">
                      <td className="text-gray-900 font-medium">{usr.email}</td>
                      <td className="text-gray-700">{usr.fullName}</td>
                      <td>
                        <span className={`badge ${usr.role === 'SUPER_ADMIN' ? 'badge-warning' : usr.role === 'STORE_ADMIN' ? 'badge-info' : 'badge-secondary'}`}>
                          {usr.role}
                        </span>
                      </td>
                      <td className="text-gray-700">{usr.store?.name || '-'}</td>
                      <td>
                        <span className={`badge ${usr.emailVerifiedAt ? 'badge-success' : 'badge-warning'}`}>
                          {usr.emailVerifiedAt ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                      <td className="flex gap-2">
                        <button
                          onClick={() => handleEdit(usr)}
                          className="btn btn-sm btn-ghost"
                          title="Edit user"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ isOpen: true, userId: usr.id, userName: usr.fullName })}
                          className="btn btn-sm btn-ghost text-error"
                          title="Delete user"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination.totalPages > 1 && (
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={(page) => fetchUsers(page, searchQuery)}
                />
              </div>
            )}
          </>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <p className="text-lg">No users found</p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={formModal.isOpen}
        onClose={() => setFormModal({ isOpen: false, mode: 'create' })}
        title={formModal.mode === 'create' ? 'Create New User' : 'Edit User'}
      >
        <div className="space-y-4">
          {formError && (
            <div className="alert alert-error">
              <svg className="stroke-current shrink-0 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="label">
              <span className="label-text font-medium">Email</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input input-bordered w-full"
              placeholder="user@example.com"
              disabled={formModal.mode === 'edit'}
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text font-medium">Full Name</span>
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="input input-bordered w-full"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text font-medium">
                Password {formModal.mode === 'edit' && '(Leave blank to keep current)'}
              </span>
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="input input-bordered w-full"
              placeholder={formModal.mode === 'create' ? 'Enter password' : 'Optional'}
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text font-medium">Role</span>
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as 'STORE_ADMIN' | 'SUPER_ADMIN' })}
              className="select select-bordered w-full"
            >
              <option value="STORE_ADMIN">Store Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
          </div>

          {formData.role === 'STORE_ADMIN' && (
            <div>
              <label className="label">
                <span className="label-text font-medium">Store</span>
              </label>
              <select
                value={formData.storeId}
                onChange={(e) => setFormData({ ...formData, storeId: e.target.value })}
                className="select select-bordered w-full"
              >
                <option value="">Select a store</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="modal-action">
            <button
              onClick={() => setFormModal({ isOpen: false, mode: 'create' })}
              className="btn"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={formLoading}
              className="btn btn-primary"
            >
              {formLoading ? <span className="loading loading-spinner loading-sm"></span> : 'Save'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false })}
        onConfirm={() => {
          if (deleteConfirm.userId) {
            handleDelete(deleteConfirm.userId);
          }
        }}
        title="Delete User"
        message={`Are you sure you want to delete "${deleteConfirm.userName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        loading={loading}
      />
    </div>
  );
}