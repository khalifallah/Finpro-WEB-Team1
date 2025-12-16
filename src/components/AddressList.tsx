"use client";

import { useState } from "react";
import { axiosInstance } from "@/libs/axios/axios.config";
import { UserAddress } from "@/types/address";
import AddressForm from "./AddressForm";
import { useRouter } from "next/navigation";
import { useToast } from "@/contexts/ToastContext";

interface AddressListProps {
  addresses?: UserAddress[];
  onAddressUpdate: () => void;
  selectable?: boolean;
  onSelect?: (address: UserAddress) => void;
  selectedAddressId?: number;
}

export default function AddressList({
  addresses = [],
  onAddressUpdate,
  selectable = false,
  onSelect,
  selectedAddressId,
}: AddressListProps) {
  const { showToast } = useToast();
  // Safe check: ensure addresses is always an array
  const safeAddresses = Array.isArray(addresses) ? addresses : [];
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(
    null
  );
  const [showForm, setShowForm] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleEdit = (address: UserAddress) => {
    setEditingAddress(address);
    setShowForm(true);
  };

  const handleDelete = async (addressId: number) => {
    if (!confirm("Are you sure you want to delete this address?")) {
      return;
    }

    setIsDeleting(addressId);
    setError("");

    try {
      await axiosInstance.delete(`/auth/profile/addresses/${addressId}`);
      showToast("Address deleted successfully", "success");
      onAddressUpdate();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to delete address";
      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleSetMain = async (addressId: number) => {
    try {
      await axiosInstance.patch(
        `/auth/profile/addresses/${addressId}/set-main`
      );
      showToast("Primary address updated successfully", "success");
      onAddressUpdate();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to set main address";
      setError(errorMessage);
      showToast(errorMessage, "error");
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingAddress(null);
    showToast(
      editingAddress
        ? "Address updated successfully"
        : "Address added successfully",
      "success"
    );
    onAddressUpdate();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingAddress(null);
  };

  const formatCoordinate = (
    coord: string | number | null | undefined
  ): string => {
    if (coord === null || coord === undefined) return "0.0000";
    const num = typeof coord === "string" ? parseFloat(coord) : Number(coord);
    if (isNaN(num)) return "0.0000";
    return num.toFixed(4);
  };

  const renderContent = () => {
    if (safeAddresses.length === 0) {
      return (
        <div className="text-center py-8">
          <div className="mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">No addresses saved</h3>
          <p className="text-gray-500 mb-4">
            Add your first shipping address to get started
          </p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            Add New Address
          </button>
        </div>
      );
    }

    return (
      <>
        {error && (
          <div className="alert alert-error mb-4">
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {safeAddresses.map((address) => (
            <div
              key={address.id}
              className={`card border ${
                selectable && selectedAddressId === address.id
                  ? "border-primary border-2"
                  : "border-base-300"
              } hover:shadow-lg transition-shadow`}
            >
              <div className="card-body p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    {address.isMain && (
                      <span className="badge badge-primary badge-sm">
                        Primary
                      </span>
                    )}
                    {address.label && (
                      <span className="font-medium">{address.label}</span>
                    )}
                  </div>
                  {selectable && (
                    <button
                      className={`btn btn-xs ${
                        selectedAddressId === address.id
                          ? "btn-primary"
                          : "btn-outline"
                      }`}
                      onClick={() => onSelect?.(address)}
                    >
                      {selectedAddressId === address.id ? "Selected" : "Select"}
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  <div>
                    <p className="font-medium">{address.recipientName}</p>
                    {address.recipientPhone && (
                      <p className="text-sm text-gray-600">
                        {address.recipientPhone}
                      </p>
                    )}
                  </div>
                  <p className="text-sm">{address.fullAddress}</p>
                  {address.latitude != null && address.longitude != null && (
                    <div className="text-xs text-gray-500">
                      Coordinates: {formatCoordinate(address.latitude)},{" "}
                      {formatCoordinate(address.longitude)}
                    </div>
                  )}
                </div>

                {!selectable && (
                  <div className="card-actions justify-end mt-4">
                    {!address.isMain && (
                      <button
                        className="btn btn-xs btn-outline"
                        onClick={() => handleSetMain(address.id)}
                        disabled={isDeleting === address.id}
                      >
                        Set as Primary
                      </button>
                    )}
                    <button
                      className="btn btn-xs btn-outline"
                      onClick={() => handleEdit(address)}
                      disabled={isDeleting === address.id}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-xs btn-error"
                      onClick={() => handleDelete(address.id)}
                      disabled={isDeleting === address.id}
                    >
                      {isDeleting === address.id ? (
                        <span className="loading loading-spinner loading-xs"></span>
                      ) : (
                        "Delete"
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {!selectable && (
          <div className="mt-6">
            <button
              className="btn btn-primary"
              onClick={() => setShowForm(true)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              Add New Address
            </button>
          </div>
        )}
      </>
    );
  };

  return (
    <>
      {renderContent()}
      {showForm && (
        <AddressForm
          address={editingAddress || undefined}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}
    </>
  );
}
