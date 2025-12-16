'use client';

import { useState, useEffect, useMemo } from 'react';

interface Product {
  id: number;
  name: string;
}

interface Store {
  id: number;
  name: string;
}

interface Discount {
  id: number;
  description: string;
  type: 'DIRECT_PERCENTAGE' | 'DIRECT_NOMINAL' | 'BOGO';
  value: number;
  minPurchase?: number;
  maxDiscountAmount?: number;
  productId?: number;
  storeId: number;
  startDate: string;
  endDate: string;
}

interface DiscountFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  discount?: Discount | null;
  products: Product[];
  stores: Store[];
  userStoreId?: number;
  isSuperAdmin: boolean;
  onClose: () => void;
  onSubmit: (data: DiscountFormData) => Promise<void>;
}

// ✅ Export this interface
export interface DiscountFormData {
  description: string;
  type: 'DIRECT_PERCENTAGE' | 'DIRECT_NOMINAL' | 'BOGO';
  value: number;
  minPurchase?: number;
  maxDiscountAmount?: number;
  productId?: number;
  storeId: number;
  startDate: string;
  endDate: string;
}

export default function DiscountFormModal({
  isOpen,
  mode,
  discount,
  products,
  stores,
  userStoreId,
  isSuperAdmin,
  onClose,
  onSubmit,
}: DiscountFormModalProps) {
  const storesList = useMemo(() => (Array.isArray(stores) ? stores : []), [stores]);
  const productsList = useMemo(() => (Array.isArray(products) ? products : []), [products]);

  // Calculate effective store ID
  const effectiveStoreId = useMemo(() => {
    if (isSuperAdmin) return 0;
    if (userStoreId && userStoreId > 0) return userStoreId;
    if (storesList.length > 0) return storesList[0].id;
    return 0;
  }, [isSuperAdmin, userStoreId, storesList]);

  const [formData, setFormData] = useState<DiscountFormData>({
    description: '',
    type: 'DIRECT_PERCENTAGE',
    value: 0,
    minPurchase: undefined,
    maxDiscountAmount: undefined,
    productId: undefined,
    storeId: 0,
    startDate: '',
    endDate: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Initialize form when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const today = new Date().toISOString().split('T')[0];
    const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    if (mode === 'edit' && discount) {
      setFormData({
        description: discount.description || '',
        type: discount.type || 'DIRECT_PERCENTAGE',
        value: discount.value || 0,
        minPurchase: discount.minPurchase || undefined,
        maxDiscountAmount: discount.maxDiscountAmount || undefined,
        productId: discount.productId || undefined,
        storeId: discount.storeId || effectiveStoreId,
        startDate: discount.startDate?.split('T')[0] || today,
        endDate: discount.endDate?.split('T')[0] || nextMonth,
      });
    } else {
      setFormData({
        description: '',
        type: 'DIRECT_PERCENTAGE',
        value: 0,
        minPurchase: undefined,
        maxDiscountAmount: undefined,
        productId: undefined,
        storeId: effectiveStoreId,
        startDate: today,
        endDate: nextMonth,
      });
    }
    setError('');
  }, [isOpen, mode, discount, effectiveStoreId]);

  const handleClose = () => {
    setError('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const finalStoreId = formData.storeId || effectiveStoreId;

    // Validation
    if (!formData.description.trim()) {
      setError('Discount name is required');
      return;
    }
    if (formData.type !== 'BOGO' && formData.value <= 0) {
      setError('Discount value must be greater than 0');
      return;
    }
    if (formData.type === 'DIRECT_PERCENTAGE' && formData.value > 100) {
      setError('Percentage cannot exceed 100%');
      return;
    }
    if (!finalStoreId || finalStoreId === 0) {
      setError('Store is required');
      return;
    }
    // Max Discount required only when not BOGO
    if (formData.type !== 'BOGO' && (formData.maxDiscountAmount === undefined || formData.maxDiscountAmount === null)) {
      setError('Max discount ceiling is required for discounts');
      return;
    }
    // Product must be selected (no "All Products" option)
    if (formData.productId === undefined) {
      setError('Product is required');
      return;
    }
    if (!formData.startDate || !formData.endDate) {
      setError('Start and end dates are required');
      return;
    }
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      setError('End date must be after start date');
      return;
    }

    try {
      setLoading(true);
      await onSubmit({ ...formData, storeId: finalStoreId });
      handleClose();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save discount';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateField = <K extends keyof DiscountFormData>(field: K, value: DiscountFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Get store name
  const currentStoreId = formData.storeId || effectiveStoreId;
  const selectedStore = storesList.find((s) => s.id === currentStoreId);
  const selectedStoreName = selectedStore?.name || (currentStoreId > 0 ? `Store #${currentStoreId}` : 'No Store Assigned');

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="absolute inset-0 bg-black/50" />

      <div
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-xl font-bold text-gray-900">
            {mode === 'create' ? '✨ Create New Discount' : '✏️ Edit Discount'}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-5">
            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Discount Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Discount Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Weekend Sale 10%"
              />
            </div>

            {/* Type & Value */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Discount Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => updateField('type', e.target.value as DiscountFormData['type'])}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="DIRECT_PERCENTAGE">📊 Percentage (%)</option>
                  <option value="DIRECT_NOMINAL">💵 Fixed Amount (IDR)</option>
                  <option value="BOGO">🎁 Buy 1 Get 1</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Value {formData.type === 'DIRECT_PERCENTAGE' ? '(%)' : '(IDR)'}
                  {formData.type !== 'BOGO' && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="number"
                  value={formData.type === 'BOGO' ? '' : formData.value || ''}
                  onChange={(e) => updateField('value', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  placeholder={formData.type === 'DIRECT_PERCENTAGE' ? 'e.g., 10' : 'e.g., 50000'}
                  disabled={formData.type === 'BOGO'}
                />
              </div>
            </div>

            {/* Min Purchase & Max Discount */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Min Purchase <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="number"
                  value={formData.minPurchase || ''}
                  onChange={(e) => updateField('minPurchase', parseInt(e.target.value) || undefined)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 100000"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Max Discount <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.maxDiscountAmount || ''}
                  onChange={(e) => updateField('maxDiscountAmount', parseInt(e.target.value) || undefined)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 cursor-not-allowed"
                  placeholder={formData.type === 'BOGO' ? 'N/A for BOGO' : 'e.g., 50000'}
                  disabled={formData.type === 'BOGO'}
                />
              </div>
            </div>

            {/* Store & Product */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Store <span className="text-red-500">*</span>
                </label>
                {isSuperAdmin ? (
                  <select
                    value={formData.storeId || ''}
                    onChange={(e) => updateField('storeId', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Store</option>
                    {storesList.map((store) => (
                      <option key={store.id} value={store.id}>{store.name}</option>
                    ))}
                  </select>
                ) : (
                  <div className="relative">
                    <input
                      type="text"
                      value={selectedStoreName}
                      className={`w-full px-4 py-2.5 border rounded-lg cursor-not-allowed ${
                        currentStoreId > 0
                          ? 'border-green-300 bg-green-50 text-green-800'
                          : 'border-red-300 bg-red-50 text-red-800'
                      }`}
                      disabled
                    />
                    {currentStoreId > 0 && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600">✓</span>
                    )}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Product <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.productId || ''}
                    onChange={(e) => updateField('productId', parseInt(e.target.value) || undefined)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="" disabled>
                      Select product
                    </option>
                    {productsList.map((product) => (
                      <option key={product.id} value={product.id}>{product.name}</option>
                    ))}
                  </select>
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => updateField('startDate', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => updateField('endDate', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Preview */}
            {formData.description && (formData.value > 0 || formData.type === 'BOGO') && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">📋 Preview</h4>
                <p className="text-blue-700">
                  <strong>{formData.description}</strong>:{' '}
                  {formData.type === 'DIRECT_PERCENTAGE' && `${formData.value}% off`}
                  {formData.type === 'DIRECT_NOMINAL' && `Rp ${formData.value.toLocaleString('id-ID')} off`}
                  {formData.type === 'BOGO' && 'Buy 1 Get 1 Free'}
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-6 mt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{mode === 'create' ? 'Create Discount' : 'Save Changes'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}