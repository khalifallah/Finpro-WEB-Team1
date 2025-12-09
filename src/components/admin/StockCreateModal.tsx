'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/common/Modal';

interface Product {
  id: number;
  name: string;
}

interface Store {
  id: number;
  name: string;
}

interface StockCreateModalProps {
  isOpen: boolean;
  products: Product[];
  stores: Store[];
  userStoreId?: number;
  isSuperAdmin: boolean;
  onClose: () => void;
  onSubmit: (productId: number, storeId: number, quantity: number) => Promise<void>;
}

export default function StockCreateModal({
  isOpen,
  products = [],
  stores = [],
  userStoreId,
  isSuperAdmin,
  onClose,
  onSubmit,
}: StockCreateModalProps) {
  const [productId, setProductId] = useState<number>(0);
  const [storeId, setStoreId] = useState<number>(userStoreId || 0);
  const [quantity, setQuantity] = useState<string>(''); // ✅ FIX: Use string for input
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setProductId(0);
      setStoreId(userStoreId || 0);
      setQuantity('');
      setError('');
    }
  }, [isOpen, userStoreId]);

  const handleSubmit = async () => {
    if (!productId) {
      setError('Please select a product');
      return;
    }
    if (!storeId) {
      setError('Please select a store');
      return;
    }
    
    const qty = parseInt(quantity, 10);
    if (!quantity || qty <= 0) {
      setError('Quantity must be greater than 0');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await onSubmit(productId, storeId, qty);
      onClose();
    } catch (err: any) {
      console.error('Submit error:', err);
      setError(err.message || 'Failed to create stock');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Safe array checks
  const storesList = Array.isArray(stores) ? stores : [];
  const productsList = Array.isArray(products) ? products : [];
  const selectedStoreName = storesList.find((s) => s.id === storeId)?.name || 'Your Store';

  // ✅ Enable button only when all fields are valid
  const isFormValid = productId > 0 && storeId > 0 && quantity && parseInt(quantity, 10) > 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Stock to Store" size="md">
      <div className="space-y-6">
        {/* Error Alert */}
        {error && (
          <div className="alert alert-error">
            <svg className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Product Select */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold text-gray-900">
              Product <span className="text-red-500">*</span>
            </span>
          </label>
          <select
            value={productId}
            onChange={(e) => setProductId(Number(e.target.value))}
            className="select select-bordered w-full bg-white text-gray-900 border-gray-300"
          >
            <option value={0} disabled>
              Select a product
            </option>
            {productsList.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
        </div>

        {/* Store Select */}
        {isSuperAdmin ? (
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold text-gray-900">
                Store <span className="text-red-500">*</span>
              </span>
            </label>
            <select
              value={storeId}
              onChange={(e) => setStoreId(Number(e.target.value))}
              className="select select-bordered w-full bg-white text-gray-900 border-gray-300"
            >
              <option value={0} disabled>
                Select a store
              </option>
              {storesList.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold text-gray-900">Store</span>
            </label>
            <input
              type="text"
              value={selectedStoreName}
              className="input input-bordered w-full bg-gray-100 text-gray-700 border-gray-300"
              disabled
            />
          </div>
        )}

        {/* Quantity */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold text-gray-900">
              Initial Quantity <span className="text-red-500">*</span>
            </span>
          </label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="input input-bordered w-full bg-white text-gray-900 border-gray-300"
            placeholder="Enter quantity (e.g., 100)"
          />
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
            className={`btn ${isFormValid && !loading ? 'btn-primary' : 'btn-disabled'}`}
            disabled={!isFormValid || loading}
          >
            {loading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Creating...
              </>
            ) : (
              'Add Stock'
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}