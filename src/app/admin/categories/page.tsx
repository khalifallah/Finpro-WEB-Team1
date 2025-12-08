'use client';

import { useEffect, useState } from 'react';
import Table from '@/components/common/Table';
import SearchBar from '@/components/common/SearchBar';
import Pagination from '@/components/common/Pagination';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import Modal from '@/components/common/Modal';
import { useAuth } from '@/contexts/AuthContext';

interface Category {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export default function CategoriesPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const [categories, setCategories] = useState<Category[]>([]);
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
    categoryId?: number;
    categoryName?: string;
  }>({ isOpen: false });

  const [formModal, setFormModal] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit';
    category?: Category;
  }>({ isOpen: false, mode: 'create' });

  const [formData, setFormData] = useState({ name: '' });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Fetch categories
  const fetchCategories = async (page: number = 1, search: string = '') => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: String(page),
        limit: String(pagination.limit),
      });
      if (search) params.append('search', search);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/categories?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();

      setCategories(data.categories || []);
      setPagination({
        page: data.page || page,
        limit: data.limit || 10,
        total: data.total || 0,
        totalPages: Math.ceil((data.total || 0) / (data.limit || 10)),
      });
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories(1, '');
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    fetchCategories(1, query);
  };

  const handleCreate = () => {
    setFormData({ name: '' });
    setFormError('');
    setFormModal({ isOpen: true, mode: 'create' });
  };

  const handleEdit = (category: Category) => {
    setFormData({ name: category.name });
    setFormError('');
    setFormModal({ isOpen: true, mode: 'edit', category });
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setFormError('Category name is required');
      return;
    }

    try {
      setFormLoading(true);
      const token = localStorage.getItem('token');
      const url = formModal.mode === 'create'
        ? `${process.env.NEXT_PUBLIC_API_URL}/categories`
        : `${process.env.NEXT_PUBLIC_API_URL}/categories/${formModal.category?.id}`;

      const response = await fetch(url, {
        method: formModal.mode === 'create' ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || error.error || 'Failed to save category');
      }

      setFormModal({ isOpen: false, mode: 'create' });
      fetchCategories(pagination.page, searchQuery);
    } catch (error: any) {
      setFormError(error.message || 'Failed to save category');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (categoryId: number) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/categories/${categoryId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete category');
      }

      fetchCategories(pagination.page, searchQuery);
      setDeleteConfirm({ isOpen: false });
    } catch (error) {
      console.error('Failed to delete category:', error);
    } finally {
      setLoading(false);
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
      header: 'Category Name',
      render: (value: string) => <span className="font-semibold">{value}</span>,
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (value: string) => new Date(value).toLocaleDateString('id-ID'),
    },
    {
      key: 'id',
      header: 'Actions',
      render: (value: number, item: Category) => (
        <div className="flex gap-2 justify-end">
          {isSuperAdmin ? (
            <>
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
                    categoryId: value,
                    categoryName: item.name,
                  })
                }
                className="btn btn-sm btn-error"
                title="Delete"
              >
                🗑️
              </button>
            </>
          ) : (
            <span className="badge badge-ghost text-xs">Read Only</span>
          )}
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
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-gray-600 mt-1">
            {isSuperAdmin
              ? 'Manage product categories'
              : 'View product categories (Read Only)'}
          </p>
        </div>
        {isSuperAdmin && (
          <button onClick={handleCreate} className="btn btn-primary gap-2">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            New Category
          </button>
        )}
      </div>

      {/* Store Admin Notice */}
      {!isSuperAdmin && (
        <div className="alert alert-info">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Store Admin can only view categories. Contact Super Admin for changes.</span>
        </div>
      )}

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow">
        <SearchBar
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search categories..."
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table
          columns={columns}
          data={categories}
          loading={loading}
          emptyMessage="No categories found"
        />

        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-gray-200">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={(page) => fetchCategories(page, searchQuery)}
            />
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={formModal.isOpen}
        onClose={() => setFormModal({ isOpen: false, mode: 'create' })}
        title={formModal.mode === 'create' ? 'Create Category' : 'Edit Category'}
      >
        <div className="space-y-4">
          {formError && (
            <div className="alert alert-error">
              <span>{formError}</span>
            </div>
          )}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Category Name</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ name: e.target.value })}
              className="input input-bordered"
              placeholder="Enter category name"
            />
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
        onConfirm={() => deleteConfirm.categoryId && handleDelete(deleteConfirm.categoryId)}
        title="Delete Category"
        message={`Are you sure you want to delete "${deleteConfirm.categoryName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}