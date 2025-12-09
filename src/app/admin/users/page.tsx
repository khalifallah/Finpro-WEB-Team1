'use client';

import { useEffect, useState } from 'react';
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

  // Fetch users
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

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();

      setUsers(data.users || data.data || []);
      setPagination({
        page: data.page || page,
        limit: data.limit || 10,
        total: data.total || 0,
        totalPages: Math.ceil((data.total || 0) / (data.limit || 10)),
      });
    } catch (error) {
      console.error('Failed to fetch users:', error);
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
      const url = formModal.mode === 'create'
        ? `${process.env.NEXT_PUBLIC_API_URL}/users/admin`
        : `${process.env.NEXT_PUBLIC_API_URL}/users/${formModal.user?.id}`;

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
      fetchUsers(pagination.page,// filepath: d:\FINPRO-TEAM-ONE\Finpro-WEB-Team1\src\app\admin\users\page.tsx
'use client';

import { useEffect, useState } from 'react';
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

  // Fetch users
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

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();

      setUsers(data.users || data.data || []);
      setPagination({
        page: data.page || page,
        limit: data.limit || 10,
        total: data.total || 0,
        totalPages: Math.ceil((data.total || 0) / (data.limit || 10)),
      });
    } catch (error) {
      console.error('Failed to fetch users:', error);
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
      const url = formModal.mode === 'create'
        ? `${process.env.NEXT_PUBLIC_API_URL}/users/admin`
        : `${process.env.NEXT_PUBLIC_API_URL}/users/${formModal.user?.id}`;

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
      fetchUsers(pagination.page,