'use client';

import React from 'react';
import { FiImage } from 'react-icons/fi';
import Link from 'next/link';
import DataTable, { DataTableColumn } from '@/components/common/DataTable';
import { ProductResponse } from '@/types/product.types';

interface AdminProductListProps {
  products: ProductResponse[];
  loading?: boolean;
  onDelete?: (id: number, name: string) => void;
  onViewPhotos?: (images: string[]) => void;
}

export default function AdminProductList({
  products,
  loading = false,
  onDelete,
  onViewPhotos,
}: AdminProductListProps) {
  const columns: DataTableColumn<ProductResponse>[] = [
    {
      key: 'name',
      header: 'Product Name',
      render: (value, item) => (
        <div className="flex items-center gap-3">
          {((item.images?.[0]?.imageUrl) || (item as any).productImages?.[0]?.imageUrl) && (
            <div className="h-12 w-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
              <img
                src={item.images?.[0]?.imageUrl ?? (item as any).productImages[0].imageUrl}
                alt={value}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 truncate text-sm">
              {value}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {item.category?.name || 'Uncategorized'}
            </p>
          </div>
        </div>
      ),
      className: 'w-64',
    },
    {
      key: 'price',
      header: 'Price',
      render: (value) => (
        <span className="font-semibold text-primary text-sm">
          {new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
          }).format(value)}
        </span>
      ),
      className: 'text-right w-32',
    },
    {
      key: 'stock',
      header: 'Stock',
      render: (value) => {
        let badgeClass = 'badge-success';
        if (value <= 0) badgeClass = 'badge-error';
        else if (value <= 10) badgeClass = 'badge-warning';

        return (
          <div className="flex justify-center">
            <span className={`badge badge-sm font-semibold ${badgeClass}`}>
              {value} units
            </span>
          </div>
        );
      },
      className: 'text-center w-24',
    },
    {
      key: 'id',
      header: 'Actions',
      render: (value, item) => (
        <div className="flex gap-2 justify-end">
            {((item.images && item.images.length > 0) || (item as any).productImages?.length > 0) && (
            <button
              onClick={() => {
                const imgs = (item.images && item.images.length > 0)
                  ? item.images.map((i: any) => i.imageUrl)
                  : (item as any).productImages?.map((i: any) => i.imageUrl) || [];
                onViewPhotos?.(imgs);
              }}
              className="btn btn-sm btn-ghost hover:bg-blue-100"
              title="View photos"
            >
              <FiImage className="w-6 h-6 bg-blue-300" />
            </button>
          )}
          <Link
            href={`/admin/products/${value}`}
            className="btn btn-sm btn-primary text-white hover:bg-blue-700"
            title="Edit product"
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
            Edit
          </Link>
          <button
            onClick={() => onDelete?.(value, item.name)}
            className="btn btn-sm btn-error text-white hover:bg-red-700"
            title="Delete product"
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
            Delete
          </button>
        </div>
      ),
      className: 'text-right w-40',
    },
  ];

  return (
    <DataTable<ProductResponse>
      columns={columns}
      data={products}
      loading={loading}
      striped={true}
      hoverEffect={true}
      emptyMessage="No products available"
    />
  );
}