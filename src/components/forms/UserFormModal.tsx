'use client';

import Modal from '@/components/common/Modal';

// ✅ Define interface lokal untuk Store (simple version)
interface Store {
  id: number;
  name: string;
}

interface UserFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  formData: {
    email: string;
    fullName: string;
    password: string;
    role: 'STORE_ADMIN' | 'SUPER_ADMIN';
    storeId: string;
  };
  formError: string;
  formLoading: boolean;
  stores: Store[];
  onClose: () => void;
  onSubmit: () => void;
  onChange: (field: string, value: string) => void;
}

export default function UserFormModal({
  isOpen,
  mode,
  formData,
  formError,
  formLoading,
  stores,
  onClose,
  onSubmit,
  onChange,
}: UserFormModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Create New User' : 'Edit User'}
    >
      <div className="space-y-4">
        {formError && (
          <div className="alert alert-error">
            <svg
              className="stroke-current shrink-0 h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{formError}</span>
          </div>
        )}

        {/* Email */}
        <div>
          <label className="label">
            <span className="label-text font-medium text-gray-900">Email</span>
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => onChange('email', e.target.value)}
            className="input input-bordered w-full text-gray-900 bg-white"
            placeholder="user@example.com"
            disabled={mode === 'edit'}
          />
        </div>

        {/* Full Name */}
        <div>
          <label className="label">
            <span className="label-text font-medium text-gray-900">Full Name</span>
          </label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => onChange('fullName', e.target.value)}
            className="input input-bordered w-full text-gray-900 bg-white"
            placeholder="John Doe"
          />
        </div>

        {/* Password */}
        <div>
          <label className="label">
            <span className="label-text font-medium text-gray-900">
              Password {mode === 'edit' && '(Leave blank to keep current)'}
            </span>
          </label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => onChange('password', e.target.value)}
            className="input input-bordered w-full text-gray-900 bg-white"
            placeholder={mode === 'create' ? 'Enter password' : 'Optional'}
          />
        </div>

        {/* Role */}
        <div>
          <label className="label">
            <span className="label-text font-medium text-gray-900">Role</span>
          </label>
          <select
            value={formData.role}
            onChange={(e) => onChange('role', e.target.value)}
            className="select select-bordered w-full text-gray-900 bg-white"
          >
            <option value="STORE_ADMIN">Store Admin</option>
            <option value="SUPER_ADMIN">Super Admin</option>
          </select>
        </div>

        {/* Store - Conditional */}
        {formData.role === 'STORE_ADMIN' && (
          <div>
            <label className="label">
              <span className="label-text font-medium text-gray-900">Store *</span>
            </label>
            <select
              value={formData.storeId}
              onChange={(e) => onChange('storeId', e.target.value)}
              className="select select-bordered w-full text-gray-900 bg-white"
            >
              <option value="">-- Select a store --</option>
              {stores.length > 0 ? (
                stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))
              ) : (
                <option disabled>No stores available</option>
              )}
            </select>
            {formData.storeId === '' && (
              <p className="text-error text-xs mt-1">Store is required for Store Admin</p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="modal-action">
          <button onClick={onClose} className="btn">
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={formLoading}
            className="btn btn-primary"
          >
            {formLoading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              'Save'
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}