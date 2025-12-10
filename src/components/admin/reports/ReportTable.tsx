'use client';

import React, { ReactNode } from 'react';

export interface ReportTableColumn<T> {
  key: string;
  header: string;
  render?: (value: any, item: T, index: number) => ReactNode;
  className?: string;
  width?: string;
}

interface ReportTableProps<T> {
  columns: ReportTableColumn<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
}

function renderCellContent(content: unknown): ReactNode {
  if (content === null || content === undefined) return '-';
  if (React.isValidElement(content)) return content;
  if (typeof content === 'string' || typeof content === 'number' || typeof content === 'boolean') return String(content);
  if (typeof content === 'bigint') return content.toString();
  if (Array.isArray(content)) return content.join(', ');
  if (typeof content === 'object') return JSON.stringify(content);
  return '-';
}

export default function ReportTable<T>({
  columns,
  data,
  loading = false,
  emptyMessage = 'No data available',
}: ReportTableProps<T>) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="p-8 text-center">
        <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-gray-500 font-medium">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-blue-600">
            {columns.map((col, idx) => (
              <th
                key={idx}
                className={`px-4 py-3 text-left text-sm font-semibold text-white ${col.className || ''}`}
                style={{ width: col.width }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, rowIndex) => (
            <tr
              key={rowIndex}
              className={`border-b border-gray-200 ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}
            >
              {columns.map((col, colIndex) => {
                const value = (item as any)[col.key];
                const content = col.render ? col.render(value, item, rowIndex) : renderCellContent(value);

                return (
                  <td key={`${rowIndex}-${colIndex}`} className={`px-4 py-3 text-sm ${col.className || ''}`}>
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