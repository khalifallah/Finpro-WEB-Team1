import React from "react";
import AddressList from "@/components/AddressList";
import { UserAddress } from "@/types/address";

interface Props {
  addresses: UserAddress[];
  loading: boolean;
  error: string;
  onRefresh: () => void;
}

const AddressManager: React.FC<Props> = ({
  addresses,
  loading,
  error,
  onRefresh,
}) => {
  return (
    <div className="card bg-base-100 shadow-lg border border-base-200">
      <div className="card-body p-5 md:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h2 className="card-title text-xl">Shipping Addresses</h2>
            <p className="text-xs text-base-content/60 mt-1">
              Manage your delivery locations
            </p>
          </div>
          <button
            className="btn btn-sm btn-ghost gap-2"
            onClick={onRefresh}
            disabled={loading}
          >
            {loading ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              "Refresh List"
            )}
          </button>
        </div>

        {error && (
          <div className="alert alert-error text-sm py-2 mb-4">
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-base-content/50">
            <span className="loading loading-spinner loading-md mb-2"></span>
            <span className="text-sm">Loading addresses...</span>
          </div>
        ) : (
          <AddressList addresses={addresses} onAddressUpdate={onRefresh} />
        )}
      </div>
    </div>
  );
};
export default AddressManager;
