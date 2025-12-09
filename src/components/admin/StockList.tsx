'use client';

import { FiEdit2, FiFileText } from 'react-icons/fi';

interface Stock {
  id: number;
  quantity: number;
  product: { id: number; name: string };
  store: { id: number; name: string };
}

interface StockListProps {
  stocks: Stock[];
  loading: boolean;
  onUpdate: (stock: Stock) => void;
  onViewHistory: (stockId: number, productName: string) => void;
}

export default function StockList({
  stocks,
  loading,
  onUpdate,
  onViewHistory,
}: StockListProps) {
  if (loading) {
    return (
      <div className="p-8 text-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="mt-2 text-gray-500">Loading stocks...</p>
      </div>
    );
  }

  if (stocks.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>No stocks found</p>
      </div>
    );
  }

  const getStockBadge = (quantity: number) => {
    if (quantity === 0) return 'badge-error';
    if (quantity <= 10) return 'badge-warning';
    return 'badge-success';
  };

  return (
    <div className="overflow-x-auto">
      <table className="table w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="w-16">ID</th>
            <th>Product</th>
            <th>Store</th>
            <th className="text-center">Stock</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((stock) => (
            <tr key={stock.id} className="hover:bg-gray-50">
              <td>
                <span className="font-mono text-xs text-gray-500">#{stock.id}</span>
              </td>
              <td>
                <span className="font-semibold text-gray-900">
                  {stock.product?.name || '-'}
                </span>
              </td>
              <td>
                <span className="text-gray-600">{stock.store?.name || '-'}</span>
              </td>
              <td className="text-center">
                <span className={`badge ${getStockBadge(stock.quantity)} gap-1`}>
                  {stock.quantity} units
                </span>
              </td>
              <td>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => onViewHistory(stock.id, stock.product?.name)}
                    className="btn btn-sm btn-ghost text-blue-600"
                    title="View History"
                  >
                    <FiFileText className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onUpdate(stock)}
                    className="btn btn-sm btn-primary"
                    title="Update Stock"
                  >
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}