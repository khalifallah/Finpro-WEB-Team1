'use client';

import React from 'react';
import DataTable, { DataTableColumn } from '@/components/common/DataTable';

interface Category {
  id: number;
  name: string;
  createdAt: string;
  updatedAt?: string;
}

interface CategoryListProps {
  categories: Category[];
  loading?: boolean;
  isSuperAdmin?: boolean;
  onEdit?: (category: Category) => void;
  onDelete?: (id: number, name: string) => void;
}

export default function CategoryList({
  categories,
  loading = false,
  isSuperAdmin = false,
  onEdit,
  onDelete,
}: CategoryListProps) {
  const columns: DataTableColumn<Category>[] = [
    {
      key: 'id',
      header: 'ID',
      render: (value) => (
        <span className="font-mono text-xs font-semibold text-gray-700">
          #{value}
        </span>
      ),
      className: 'w-16',
    },
    {
      key: 'name',
      header: 'Category Name',
      render: (value) => (
        <span className="font-semibold text-gray-900">{value}</span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (value) => {
        if (!value) return '-';
        return new Date(value).toLocaleDateString('id-ID', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });
      },
      className: 'text-sm text-gray-600 w-32',
    },
    {
      key: 'id',
      header: 'Actions',
      render: (value, item) => (
        <div className="flex gap-2 justify-end">
          {isSuperAdmin ? (
            <>
              <button
                onClick={() => onEdit?.(item)}
                className="btn btn-sm btn-primary gap-1 text-white hover:bg-blue-700"
                title="Edit category"
              >
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
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
              <button
                onClick={() => onDelete?.(value, item.name)}
                className="btn btn-sm btn-error gap-1 text-white hover:bg-red-700"
                title="Delete category"
              >
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </>
          ) : (
            <span className="badge badge-ghost text-xs">Read Only</span>
          )}
        </div>
      ),
      className: 'text-right w-40',
    },
  ];

  return (
    <DataTable<Category>
      columns={columns}
      data={categories}
      loading={loading}
      striped={true}
      hoverEffect={true}
      emptyMessage="No categories found"
    />
  );
}