'use client';

import React, { ReactNode } from 'react';

export interface DataTableColumn<T> {
  key: keyof T | string;
  header: string;
  render?: (value: any, item: T, index: number) => ReactNode;
  className?: string;
  width?: string;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  striped?: boolean;
  hoverEffect?: boolean;
  onRowClick?: (item: T) => void;
}

// ✅ FIX: Helper function to safely render content
function renderCellContent(content: unknown): ReactNode {
  if (content === null || content === undefined) {
    return '-';
  }
  if (React.isValidElement(content)) {
    return content;
  }
  if (typeof content === 'string' || typeof content === 'number' || typeof content === 'boolean') {
    return String(content);
  }
  if (typeof content === 'bigint') {
    return content.toString();
  }
  if (Array.isArray(content)) {
    return content.join(', ');
  }
  if (typeof content === 'object') {
    return JSON.stringify(content);
  }
  return '-';
}

export default function DataTable<T extends { id?: number | string }>({
  columns,
  data,
  loading = false,
  emptyMessage = 'No data available',
  striped = true,
  hoverEffect = true,
  onRowClick,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <svg
          className="w-16 h-16 mx-auto mb-4 opacity-30"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
        <p className="text-gray-600 font-medium">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        {/* Table Header */}
        <thead>
          <tr className="bg-gray-100 border-b-2 border-gray-300">
            {columns.map((col, idx) => (
              <th
                key={idx}
                className={`px-4 py-3 text-left text-sm font-semibold text-gray-900 ${
                  col.className || ''
                }`}
                style={{ width: col.width }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        {/* Table Body */}
        <tbody>
          {data.map((item, rowIndex) => (
            <tr
              key={item.id ?? rowIndex}
              onClick={() => onRowClick?.(item)}
              className={`border-b border-gray-200 transition-colors ${
                hoverEffect ? 'hover:bg-blue-50' : ''
              } ${striped && rowIndex % 2 === 1 ? 'bg-gray-50' : 'bg-white'} ${
                onRowClick ? 'cursor-pointer' : ''
              }`}
            >
              {columns.map((col, colIndex) => {
                const value = item[col.key as keyof T];
                // Use render function if provided, otherwise safely render content
                const content = col.render
                  ? col.render(value, item, rowIndex)
                  : renderCellContent(value);

                return (
                  <td
                    key={`${rowIndex}-${colIndex}`}
                    className={`px-4 py-3 text-sm ${col.className || ''}`}
                  >
                    {content}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}