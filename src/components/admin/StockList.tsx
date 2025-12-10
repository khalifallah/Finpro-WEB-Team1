'use client';

import { FiEdit2 } from 'react-icons/fi';

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
}

export default function StockList({
  stocks,
  loading,
  onUpdate,
}: StockListProps) {
  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <span className="loading loading-spinner loading-lg"></span>
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

  const getQuantityBadgeColor = (quantity: number) => {
    if (quantity <= 0) return 'badge-error';
    if (quantity <= 10) return 'badge-warning';
    return 'badge-success';
  };

  return (
    <div className="overflow-x-auto">
      <table className="table">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="text-gray-700">ID</th>
            <th className="text-gray-700">Product</th>
            <th className="text-gray-700">Store</th>
            <th className="text-gray-700">Quantity</th>
            <th className="text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((stock) => (
            <tr key={stock.id} className="hover:bg-gray-50 border-b">
              <td className="text-gray-500 font-mono">#{stock.id}</td>
              <td className="text-gray-900 font-medium">{stock.product.name}</td>
              <td className="text-gray-700">{stock.store.name}</td>
              <td>
                <span className={`badge badge-lg ${getQuantityBadgeColor(stock.quantity)}`}>
                  {stock.quantity} units
                </span>
              </td>
              <td>
                
                <button
                  onClick={() => onUpdate(stock)}
                  className="btn btn-sm btn-primary gap-1"
                  title="Edit stock"
                >
                  <FiEdit2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}