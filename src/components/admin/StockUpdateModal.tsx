'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/common/Modal';
import { FiMinus, FiPlus } from 'react-icons/fi';

interface Stock {
  id: number;
  quantity: number;
  product: { id: number; name: string };
  store: { id: number; name: string };
}

interface StockUpdateModalProps {
  isOpen: boolean;
  stock: Stock | null;
  onClose: () => void;
  onSubmit: (stockId: number, quantityChange: number, reason: string) => Promise<void>;
}

export default function StockUpdateModal({
  isOpen,
  stock,
  onClose,
  onSubmit,
}: StockUpdateModalProps) {
  const [quantityChange, setQuantityChange] = useState<string>(''); // ✅ FIX: Use string
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuantityChange('');
      setReason('');
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!stock) return;

    const qtyChange = quantityChange ? parseInt(quantityChange, 10) : 0;

    if (qtyChange === 0) {
      setError('Quantity change cannot be zero');
      return;
    }
    if (!reason.trim()) {
      setError('Reason is required');
      return;
    }

    const newQuantity = stock.quantity + qtyChange;
    if (newQuantity < 0) {
      setError('Stock cannot be negative');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await onSubmit(stock.id, qtyChange, reason);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update stock');
    } finally {
      setLoading(false);
    }
  };

  const qtyChange = quantityChange ? parseInt(quantityChange, 10) : 0;
  const newQuantity = stock ? Math.max(0, stock.quantity + qtyChange) : 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Update Stock" size="md">
      {stock && (
        <div className="space-y-6">
          {/* Error Alert */}
          {error && (
            <div className="alert alert-error">
              <svg className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Product & Store Info */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-100 rounded-lg border border-gray-200">
            <div>
              <p className="text-sm text-gray-500">Product</p>
              <p className="font-semibold text-gray-900">{stock.product?.name || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Store</p>
              <p className="font-semibold text-gray-900">{stock.store?.name || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Current Stock</p>
              <p className="font-bold text-lg text-gray-900">{stock.quantity} units</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">New Stock</p>
              <p
                className={`font-bold text-lg ${
                  newQuantity === 0
                    ? 'text-red-600'
                    : newQuantity <= 10
                      ? 'text-orange-500'
                      : 'text-green-600'
                }`}
              >
                {newQuantity} units
              </p>
            </div>
          </div>

          {/* Quantity Change */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Stock Change
            </label>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setQuantityChange(String((qtyChange || 0) - 10))}
                className="btn btn-sm btn-outline border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400"
              >
                -10
              </button>

              <button
                type="button"
                onClick={() => setQuantityChange(String((qtyChange || 0) - 1))}
                className="btn btn-circle btn-sm btn-outline border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400"
              >
                <FiMinus className="w-4 h-4" />
              </button>

              {/* ✅ FIX: Input displays number without leading zeros */}
              <input
                type="text"
                inputMode="numeric"
                value={quantityChange}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || val === '-') {
                    setQuantityChange('');
                  } else {
                    const num = parseInt(val, 10);
                    if (!isNaN(num)) {
                      setQuantityChange(String(num));
                    }
                  }
                }}
                className="input input-bordered w-24 text-center text-lg font-bold bg-white text-gray-900 border-gray-300"
                placeholder="0"
              />

              <button
                type="button"
                onClick={() => setQuantityChange(String((qtyChange || 0) + 1))}
                className="btn btn-circle btn-sm btn-outline border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400"
              >
                <FiPlus className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setQuantityChange(String((qtyChange || 0) + 10))}
                className="btn btn-sm btn-outline border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400"
              >
                +10
              </button>
            </div>

            <p className="text-center mt-3 text-sm font-medium">
              {qtyChange > 0 && <span className="text-green-600">+ Adding {qtyChange} units</span>}
              {qtyChange < 0 && <span className="text-red-600">- Removing {Math.abs(qtyChange)} units</span>}
              {qtyChange === 0 && <span className="text-gray-400">No change</span>}
            </p>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="textarea textarea-bordered w-full bg-white text-gray-900 border-gray-300 placeholder-gray-400"
              placeholder="e.g., Restocking from supplier, Damaged goods..."
              rows={3}
            />
          </div>

          {/* Quick Reason Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-500">Quick select:</span>
            {['Restocking', 'Sold', 'Damaged', 'Expired', 'Adjustment'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setReason(r)}
                className={`btn btn-xs ${
                  reason === r
                    ? 'btn-primary'
                    : 'btn-outline border-gray-300 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost text-gray-700 hover:bg-gray-100"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className={`btn ${qtyChange !== 0 && reason.trim() && !loading ? 'btn-primary' : 'btn-disabled'}`}
              disabled={qtyChange === 0 || !reason.trim() || loading}
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Updating...
                </>
              ) : (
                'Update Stock'
              )}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}