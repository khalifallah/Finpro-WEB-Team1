'use client';

import { useEffect, useState } from 'react';
import SearchBar from '@/components/common/SearchBar';
import Pagination from '@/components/common/Pagination';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import Modal from '@/components/common/Modal';
import CategoryList from '@/components/admin/CategoryList'; // ← IMPORT COMPONENT BARU
import { useAuth } from '@/contexts/AuthContext';

interface Category {
  id: number;
  name: string;
  createdAt: string;
  updatedAt?: string;
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

  const getApiUrl = () => {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
  };

  const fetchCategories = async (page: number = 1, search: string = '') => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const apiUrl = getApiUrl();

      const params = new URLSearchParams({
        page: String(page),
        limit: String(pagination.limit),
      });
      if (search) params.append('search', search);

      const response = await fetch(`${apiUrl}/categories?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();

      let categoriesData: Category[] = [];
      let paginationData = { page, limit: pagination.limit, total: 0, totalPages: 0 };

      if (Array.isArray(data)) {
        categoriesData = data;
        paginationData = { page, limit: pagination.limit, total: data.length, totalPages: 1 };
      } else if (data?.data && Array.isArray(data.data)) {
        categoriesData = data.data;
        paginationData = {
          page: data.pagination?.page || page,
          limit: data.pagination?.limit || pagination.limit,
          total: data.pagination?.total || data.data.length,
          totalPages: data.pagination?.totalPages || 1,
        };
      } else if (data?.categories && Array.isArray(data.categories)) {
        categoriesData = data.categories;
        paginationData = {
          page,
          limit: pagination.limit,
          total: data.total || categoriesData.length,
          totalPages: Math.ceil((data.total || 0) / pagination.limit),
        };
      }

      setCategories(categoriesData);
      setPagination(paginationData);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
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
      const apiUrl = getApiUrl();

      const url = formModal.mode === 'create'
        ? `${apiUrl}/categories`
        : `${apiUrl}/categories/${formModal.category?.id}`;

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
      const apiUrl = getApiUrl();

      const response = await fetch(`${apiUrl}/categories/${categoryId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to delete category');

      fetchCategories(pagination.page, searchQuery);
      setDeleteConfirm({ isOpen: false });
    } catch (error) {
      console.error('Failed to delete category:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600 mt-1">
            {isSuperAdmin ? 'Manage product categories' : 'View categories (Read Only)'}
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

      {!isSuperAdmin && (
        <div className="alert alert-info">
          <span>Store Admin can only view. Contact Super Admin for changes.</span>
        </div>
      )}

      {/* Search */}
      <div className="bg-gray-100 p-4 rounded-lg shadow-sm border border-gray-300">
        <SearchBar
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search categories..."
        />
      </div>

      {/* Table - Menggunakan CategoryList Component */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <CategoryList
          categories={categories}
          loading={loading}
          isSuperAdmin={isSuperAdmin}
          onEdit={handleEdit}
          onDelete={(id, name) =>
            setDeleteConfirm({ isOpen: true, categoryId: id, categoryName: name })
          }
        />

        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={(page) => fetchCategories(page, searchQuery)}
            />
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={formModal.isOpen}
        onClose={() => setFormModal({ isOpen: false, mode: 'create' })}
        title={`${formModal.mode === 'create' ? '➕ Create' : '✏️ Edit'} Category`}
        size="md"
      >
        <div className="space-y-5">
          {/* Error Alert */}
          {formError && (
            <div className="alert alert-error gap-3 rounded-lg">
              <svg
                className="stroke-current shrink-0 h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4v2m0 0v2m0-6v-2m0 0V7a2 2 0 012-2h.5a.5.5 0 00-.5.5v.5H9.5a.5.5 0 00-.5.5v.5a2 2 0 014 0m0 0a2 2 0 11-4 0m0 0V7a2 2 0 012-2z"
                />
              </svg>
              <span className="text-sm font-medium">{formError}</span>
            </div>
          )}

          {/* Form Control */}
          <div className="form-control">
            <label className="label pb-2">
              <span className="label-text font-semibold text-gray-900 text-base">
                Category Name
              </span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ name: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="Enter category name (e.g., Groceries, Electronics)"
              className="input input-bordered input-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0"
              autoFocus
              disabled={formLoading}
            />
            {formData.name && (
              <label className="label pt-2">
                <span className="label-text-alt text-xs text-gray-500">
                  ✓ {formData.name.length} characters
                </span>
              </label>
            )}
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
              disabled={formLoading || !formData.name.trim()}
            >
              {formLoading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Saving...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Save
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false })}
        onConfirm={() => {
          // Ensure it returns Promise<void> or void
          if (!deleteConfirm.categoryId) return;
          handleDelete(deleteConfirm.categoryId);
        }}
        title="Delete Category"
        message={`Delete "${deleteConfirm.categoryName}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}