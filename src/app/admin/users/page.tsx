'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SearchBar from '@/components/common/SearchBar';
import Pagination from '@/components/common/Pagination';
import UserFormModal from '@/components/forms/UserFormModal';
import UserDeleteDialog from '@/components/forms/UserDeleteDialog';
import { useAuth } from '@/contexts/AuthContext';
import { FiUsers, FiLock, FiChevronLeft, FiEdit2, FiTrash2 } from 'react-icons/fi';

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

  const fetchStores = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Use admin endpoint instead of /stores
      const url = `${getApiUrl()}/admin/stores`;
            
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!response.ok) {
        // Fallback to /stores endpoint
        return fetchStoresFallback();
      }
      
      const data = await response.json();

      let storesList: Store[] = [];
      
      // Handle response wrapper
      if (data.data && typeof data.data === 'object') {
        if (Array.isArray(data.data.stores)) {
          storesList = data.data.stores;
        } else if (Array.isArray(data.data)) {
          storesList = data.data;
        }
      } else if (Array.isArray(data.stores)) {
        storesList = data.stores;
      } else if (Array.isArray(data)) {
        storesList = data;
      }

      setStores(storesList);
    } catch (error) {
      fetchStoresFallback();
    }
  };

  // Fallback jika admin/stores tidak ada
  const fetchStoresFallback = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = `${getApiUrl()}/stores`;
            
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const data = await response.json();

      let storesList: Store[] = [];
      
      if (data.data && typeof data.data === 'object') {
        if (Array.isArray(data.data.stores)) {
          storesList = data.data.stores;
        } else if (Array.isArray(data.data)) {
          storesList = data.data;
        }
      } else if (Array.isArray(data.stores)) {
        storesList = data.stores;
      } else if (Array.isArray(data)) {
        storesList = data;
      }

      setStores(storesList);
    } catch (error) {
      setStores([]);
    }
  };

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
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();

      let usersList = [];
      let totalUsers = 0;
      let pageNum = page;
      let limitNum = pagination.limit;
      let totalPages = 0;

      if (data.data && typeof data.data === 'object') {
        const dataPayload = data.data;
        usersList = Array.isArray(dataPayload.users) ? dataPayload.users : [];
        totalUsers = dataPayload.total || 0;
        pageNum = dataPayload.page || page;
        limitNum = dataPayload.limit || pagination.limit;
        totalPages = dataPayload.totalPages || Math.ceil(totalUsers / limitNum);
      } else if (Array.isArray(data.users)) {
        usersList = data.users;
        totalUsers = data.total || 0;
        pageNum = data.page || page;
        limitNum = data.limit || pagination.limit;
        totalPages = data.totalPages || Math.ceil(totalUsers / limitNum);
      }

      setUsers(usersList);
      setPagination({ page: pageNum, limit: limitNum, total: totalUsers, totalPages });
    } catch (error) {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin) {
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
    setFormData({ email: '', fullName: '', password: '', role: 'STORE_ADMIN', storeId: '' });
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

  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formError) setFormError('');
  };

  const handleSubmit = async () => {
    if (!formData.email.trim()) return setFormError('Email is required');
    if (!formData.fullName.trim()) return setFormError('Full name is required');
    if (formModal.mode === 'create' && !formData.password) return setFormError('Password is required');
    if (formData.role === 'STORE_ADMIN' && !formData.storeId) return setFormError('Store is required for Store Admin');

    try {
      setFormLoading(true);
      const token = localStorage.getItem('token');
      const url = formModal.mode === 'create'
        ? `${getApiUrl()}/admin/store-admins`
        : `${getApiUrl()}/admin/users/${formModal.user?.id}`;

      const payload: any = {
        email: formData.email,
        fullName: formData.fullName,
        role: formData.role,
        storeId: formData.storeId ? parseInt(formData.storeId) : null,
      };
      if (formData.password) payload.password = formData.password;

      const response = await fetch(url, {
        method: formModal.mode === 'create' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save user');
      }

      setFormModal({ isOpen: false, mode: 'create' });
      fetchUsers(pagination.page, searchQuery);
    } catch (error: any) {
      setFormError(error.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.userId) return;
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${getApiUrl()}/admin/users/${deleteConfirm.userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to delete user');
      setDeleteConfirm({ isOpen: false });
      fetchUsers(pagination.page, searchQuery);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  if (!isSuperAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">403 - Access Denied</h1>
          <p className="text-gray-600 text-lg mb-6 inline-flex items-center justify-center gap-2">
            <FiLock className="h-5 w-5 text-gray-600" />
            <span>User Management is restricted to <span className="font-bold text-red-600">Super Admin</span> only</span>
          </p>
          <Link href="/admin/dashboard" className="btn btn-primary inline-flex items-center gap-2">
            <FiChevronLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - ✅ RESPONSIVE */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-black">
            <span className="inline-flex items-center gap-2"><FiUsers className="h-6 w-6 text-gray-700" />User Management</span>
          </h1>
          <p className="text-black mt-2 text-sm">Manage system users and store admin accounts</p>
        </div>
        <button onClick={handleCreate} className="btn btn-primary gap-2 w-full sm:w-auto">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          New User
        </button>
      </div>

      {/* Search & Filter - ✅ RESPONSIVE */}
      <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200 space-y-4">
        <SearchBar value={searchQuery} onChange={handleSearch} placeholder="Search by email or name..." />
        <div>
          <label className="label">
            <span className="label-text font-medium text-gray-700">Filter by Role</span>
          </label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="select select-bordered w-full bg-white text-gray-900"
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
                    <th className="px-4 py-2 sm:px-6 sm:py-3 text-gray-700">Email</th>
                    <th className="px-4 py-2 sm:px-6 sm:py-3 text-gray-700">Full Name</th>
                    <th className="px-4 py-2 sm:px-6 sm:py-3 text-gray-700">Role</th>
                    <th className="px-4 py-2 sm:px-6 sm:py-3 text-gray-700">Store</th>
                    <th className="px-4 py-2 sm:px-6 sm:py-3 text-gray-700">Status</th>
                    <th className="px-4 py-2 sm:px-6 sm:py-3 text-gray-700">Actions</th>
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
                        <button onClick={() => handleEdit(usr)} className="btn btn-sm btn-ghost" title="Edit">
                          <FiEdit2 className="h-4 w-4 text-blue-500" />
                        </button>
                        <button onClick={() => setDeleteConfirm({ isOpen: true, userId: usr.id, userName: usr.fullName })} className="btn btn-sm btn-ghost text-error" title="Delete">
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pagination.totalPages > 1 && (
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <Pagination currentPage={pagination.page} totalPages={pagination.totalPages} onPageChange={(page) => fetchUsers(page, searchQuery)} />
              </div>
            )}
          </>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <p className="text-lg">No users found</p>
          </div>
        )}
      </div>

      {/* Using Extracted Components */}
      <UserFormModal
        isOpen={formModal.isOpen}
        mode={formModal.mode}
        formData={formData}
        formError={formError}
        formLoading={formLoading}
        stores={stores}
        onClose={() => setFormModal({ isOpen: false, mode: 'create' })}
        onSubmit={handleSubmit}
        onChange={handleFormChange}
      />

      <UserDeleteDialog
        isOpen={deleteConfirm.isOpen}
        userName={deleteConfirm.userName}
        loading={loading}
        onClose={() => setDeleteConfirm({ isOpen: false })}
        onConfirm={handleDelete}
      />
    </div>
  );
}