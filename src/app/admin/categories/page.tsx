'use client';

import { useEffect, useState } from 'react';
import SearchBar from '@/components/common/SearchBar';
import Pagination from '@/components/common/Pagination';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import Modal from '@/components/common/Modal';
import CategoryList from '@/components/admin/CategoryList';
import { useAuth } from '@/contexts/AuthContext';
import { categoryService } from '@/services/categoryService';
import { toast } from 'sonner';

interface Category {
  id: number;
  name: string;
  createdAt: string;
  updatedAt?: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function CategoriesPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState<PaginationData>({
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

  // FETCH CATEGORIES DENGAN SERVICE 
  const fetchCategories = async (page: number = 1, search: string = '') => {
    try {
      setLoading(true);
      setError('');

      const response = await categoryService.getCategories({
        page,
        limit: pagination.limit,
        search: search.trim() || undefined,
      });

      let categoriesData: Category[] = [];
      let total = 0;
      let totalPages = 0;

      // CORRECT FIXED PARSING INGAT!
      // Format: { categories: [...], total: 11 }
      if (response?.categories && Array.isArray(response.categories)) {
        categoriesData = response.categories;
        total = response.total || response.categories.length;
        totalPages = Math.ceil(total / pagination.limit);
      }
      // Fallback: Direct array
      else if (Array.isArray(response)) {
        categoriesData = response;
        total = response.length;
        totalPages = 1;
      }
      // Fallback: { data: [...] }
      else if (response?.data && Array.isArray(response.data)) {
        categoriesData = response.data;
        total = response.total || response.data.length;
        totalPages = Math.ceil(total / pagination.limit);
      }

      setCategories(categoriesData);
      setPagination({
        page,
        limit: pagination.limit,
        total,
        totalPages,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load categories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchCategories();
  }, []);

  // SEARCH HANDLER 
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
    const forbiddenMsg = 'Forbidden Action Restricted to super-admin users only';
    if (!isSuperAdmin) {
      setFormError(forbiddenMsg);
      toast.error(forbiddenMsg);
      return;
    }
    if (!formData.name.trim()) {
      setFormError('Category name is required');
      return;
    }

    try {
      setFormLoading(true);
      setFormError('');

      if (formModal.mode === 'create') {
        await categoryService.createCategory({ name: formData.name });
        toast.success('Category created successfully');
      } else if (formModal.category) {
        await categoryService.updateCategory(formModal.category.id, { name: formData.name });
        toast.success('Category updated successfully');
      }

      setFormModal({ isOpen: false, mode: 'create' });
      // Refresh dengan search query yang sama
      fetchCategories(1, searchQuery);
    } catch (error: any) {
      setFormError(error.message || 'Failed to save category');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (categoryId: number) => {
    const forbiddenMsg = 'Forbidden Action Restricted to super-admin users only';
    if (!isSuperAdmin) {
      setError(forbiddenMsg);
      toast.error(forbiddenMsg);
      setDeleteConfirm({ isOpen: false });
      return;
    }
    try {
      setLoading(true);
      await categoryService.deleteCategory(categoryId);
      toast.success('Category deleted successfully');
      // Refresh dengan search query yang sama
      fetchCategories(pagination.page, searchQuery);
      setDeleteConfirm({ isOpen: false });
    } catch (error: any) {
      setError(error.message || 'Failed to delete category');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    fetchCategories(page, searchQuery);
  };

  return (
    <div className="space-y-6">
      {/* Header - ✅ RESPONSIVE */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600 mt-1">
            {isSuperAdmin ? 'Manage product categories' : 'View categories (Read Only)'}
          </p>
        </div>
        {isSuperAdmin && (
          <button onClick={handleCreate} className="btn btn-primary gap-2 w-full sm:w-auto">
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

      {/* Error Alert */}
      {error && (
        <div className="alert alert-error gap-3 rounded-lg border border-red-300 bg-red-50">
          <svg className="stroke-current shrink-0 h-6 w-6" xmlns="http://www.w3.org/2000/2000" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Search - ✅ RESPONSIVE */}
      <div className="bg-gray-100 p-2 sm:p-4 rounded-lg shadow-sm border border-gray-300">
        <SearchBar
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search categories..."
        />
      </div>

      {/* Table - ✅ RESPONSIVE */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {categories.length > 0 && (
          <div className="px-4 sm:px-6 py-3 bg-gray-50 border-b border-gray-200">
            <p className="text-sm text-gray-600 font-medium">
              Showing {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} categories
            </p>
          </div>
        )}

        <div className="overflow-x-auto">
          <CategoryList
            categories={categories}
            loading={loading}
            isSuperAdmin={isSuperAdmin}
            onEdit={handleEdit}
            onDelete={(id, name) =>
              setDeleteConfirm({ isOpen: true, categoryId: id, categoryName: name })
            }
          />
        </div>

        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
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
              className="btn btn-outline btn-md min-w-24 text-black hover:text-gray-500 bg-red-200"
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