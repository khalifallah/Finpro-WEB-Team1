'use client';

import { useState, useCallback } from 'react';

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
  const [quantity, setQuantity] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Safe array checks
  const storesList = Array.isArray(stores) ? stores : [];
  const productsList = Array.isArray(products) ? products : [];

  // Reset form when modal opens - only once
  const handleClose = useCallback(() => {
    setProductId(0);
    setStoreId(userStoreId || 0);
    setQuantity('');
    setError('');
    onClose();
  }, [onClose, userStoreId]);

  // Handle product change
  const handleProductChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const value = parseInt(e.target.value, 10);
    setProductId(value);
  }, []);

  // Handle store change
  const handleStoreChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const value = parseInt(e.target.value, 10);
    setStoreId(value);
  }, []);

  // Handle quantity change
  const handleQuantityChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const value = e.target.value;
    setQuantity(value);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setError('');

    const finalStoreId = storeId || userStoreId || 0;

    if (!productId || productId === 0) {
      setError('Please select a product');
      return;
    }
    if (!finalStoreId || finalStoreId === 0) {
      setError('Store is required');
      return;
    }

    const qty = parseInt(quantity, 10);
    if (!quantity || qty <= 0 || isNaN(qty)) {
      setError('Quantity must be a number greater than 0');
      return;
    }

    try {
      setLoading(true);
      await onSubmit(productId, finalStoreId, qty);
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create stock');
    } finally {
      setLoading(false);
    }
  };

  // Get selected store name
  const effectiveStoreId = storeId || userStoreId || 0;
  const selectedStoreName = storesList.find((s) => s.id === effectiveStoreId)?.name || 'No store assigned';

  // Validation
  const qtyNum = quantity ? parseInt(quantity, 10) : 0;
  const isFormValid = productId > 0 && effectiveStoreId > 0 && qtyNum > 0 && !isNaN(qtyNum);

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" />
      
      {/* Modal */}
      <div 
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Add Stock to Store</h2>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Product Select */}
          <div>
            <label htmlFor="product-select" className="block text-sm font-semibold text-gray-900 mb-2">
              Product <span className="text-red-500">*</span>
            </label>
            <select
              id="product-select"
              name="productId"
              value={productId}
              onChange={handleProductChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer"
            >
              <option value={0}>Select a product</option>
              {productsList.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          {/* Store */}
          <div>
            <label htmlFor="store-select" className="block text-sm font-semibold text-gray-900 mb-2">
              Store {isSuperAdmin && <span className="text-red-500">*</span>}
            </label>
            {isSuperAdmin ? (
              <select
                id="store-select"
                name="storeId"
                value={storeId}
                onChange={handleStoreChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer"
              >
                <option value={0}>Select a store</option>
                {storesList.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={selectedStoreName}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                disabled
                readOnly
              />
            )}
          </div>

          {/* Quantity */}
          <div>
            <label htmlFor="quantity-input" className="block text-sm font-semibold text-gray-900 mb-2">
              Initial Quantity <span className="text-red-500">*</span>
            </label>
            <input
              id="quantity-input"
              name="quantity"
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={handleQuantityChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter quantity (e.g., 100)"
              autoComplete="off"
            />
            {quantity && !isNaN(parseInt(quantity, 10)) && parseInt(quantity, 10) > 0 && (
              <p className="text-sm text-green-600 mt-1">✓ {parseInt(quantity, 10)} units</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!isFormValid || loading}
              className={`px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-all ${
                isFormValid && !loading
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Add Stock</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}