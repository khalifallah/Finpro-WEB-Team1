"use client";

import { useState, useEffect } from "react";
import { axiosInstance } from "@/libs/axios/axios.config";
import {
  CreateAddressData,
  UpdateAddressData,
  UserAddress,
} from "@/types/address";
import { useToast } from "@/contexts/ToastContext";

interface AddressFormProps {
  address?: UserAddress;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AddressForm({
  address,
  onSuccess,
  onCancel,
}: AddressFormProps) {
  const [formData, setFormData] = useState<CreateAddressData>({
    label: address?.label || "",
    fullAddress: address?.fullAddress || "",
    latitude: address?.latitude || 0,
    longitude: address?.longitude || 0,
    recipientName: address?.recipientName || "",
    recipientPhone: address?.recipientPhone || "",
    isMain: address?.isMain || false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const { showToast } = useToast();

  // Add useEffect to handle body scroll
  useEffect(() => {
    // Prevent background scrolling when modal is open
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      setFormData({
        ...formData,
        [name]: (e.target as HTMLInputElement).checked,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setIsGettingLocation(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // Use reverse geocoding API to get address from coordinates
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );

          if (response.ok) {
            const data = await response.json();
            const addressParts = [];

            if (data.address.road) addressParts.push(data.address.road);
            if (data.address.suburb) addressParts.push(data.address.suburb);
            if (data.address.city_district)
              addressParts.push(data.address.city_district);
            if (data.address.city) addressParts.push(data.address.city);
            if (data.address.state) addressParts.push(data.address.state);
            if (data.address.postcode) addressParts.push(data.address.postcode);
            if (data.address.country) addressParts.push(data.address.country);

            const fullAddress = addressParts.join(", ");

            setFormData((prev) => ({
              ...prev,
              latitude,
              longitude,
              fullAddress:
                fullAddress ||
                "Location detected, please enter full address details",
            }));
          } else {
            setFormData((prev) => ({
              ...prev,
              latitude,
              longitude,
            }));
            setError(
              "Location detected, but could not get address details. Please enter address manually."
            );
          }
        } catch (error) {
          setFormData((prev) => ({
            ...prev,
            latitude,
            longitude,
          }));
          console.error("Error getting address:", error);
          setError(
            "Location detected, but could not get address details. Please enter address manually."
          );
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        console.error("Error getting location:", error);
        setError("Failed to get your location. Please enter address manually.");
        setIsGettingLocation(false);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      if (address) {
        // Update existing address
        await axiosInstance.patch(
          `/auth/profile/addresses/${address.id}`,
          formData
        );
        showToast("Address updated successfully", "success");
      } else {
        // Create new address
        await axiosInstance.post("/auth/profile/address", formData);
        showToast("Address added successfully", "success");
      }

      onSuccess();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to save address";
      setError(errorMessage);
      showToast(
        err.response?.data?.message || "Failed to add address",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl max-h-[90vh] overflow-y-auto relative z-50">
        <h3 className="font-bold text-lg mb-4">
          {address ? "Edit Address" : "Add New Address"}
        </h3>

        {error && (
          <div className="alert alert-error mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Label */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Label (Optional)</span>
              </label>
              <input
                type="text"
                name="label"
                className="input input-bordered"
                value={formData.label}
                onChange={handleChange}
                placeholder="e.g., Home, Office"
              />
            </div>

            {/* Recipient Name */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Recipient Name *</span>
              </label>
              <input
                type="text"
                name="recipientName"
                className="input input-bordered"
                value={formData.recipientName}
                onChange={handleChange}
                required
                placeholder="Full name"
              />
            </div>
          </div>

          {/* Full Address */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Full Address *</span>
            </label>
            <textarea
              name="fullAddress"
              className="textarea textarea-bordered h-24"
              value={formData.fullAddress}
              onChange={handleChange}
              required
              placeholder="Street address, city, province, postal code"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Phone */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Phone Number (Optional)</span>
              </label>
              <input
                type="tel"
                name="recipientPhone"
                className="input input-bordered"
                value={formData.recipientPhone}
                onChange={handleChange}
                placeholder="+62 812-3456-7890"
              />
            </div>

            {/* Location Button */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Get Location</span>
              </label>
              <button
                type="button"
                className="btn btn-outline"
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
              >
                {isGettingLocation ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    Getting Location...
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Use Current Location
                  </>
                )}
              </button>
              {formData.latitude !== 0 && formData.longitude !== 0 && (
                <label className="label">
                  <span className="label-text-alt text-success">
                    ✓ Location coordinates saved
                  </span>
                </label>
              )}
            </div>
          </div>

          {/* Hidden coordinates (for debugging) */}
          {process.env.NODE_ENV === "development" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Latitude</span>
                </label>
                <input
                  type="number"
                  step="any"
                  name="latitude"
                  className="input input-bordered input-sm"
                  value={formData.latitude}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Longitude</span>
                </label>
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  className="input input-bordered input-sm"
                  value={formData.longitude}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          )}

          {/* Set as Main Address */}
          <div className="form-control">
            <label className="label cursor-pointer justify-start gap-2">
              <input
                type="checkbox"
                name="isMain"
                className="checkbox checkbox-primary"
                checked={formData.isMain}
                onChange={handleChange}
              />
              <span className="label-text">
                Set as primary shipping address
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="modal-action">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loading loading-spinner"></span>
                  Saving...
                </>
              ) : address ? (
                "Update Address"
              ) : (
                "Add Address"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Backdrop */}
      <div className="modal-backdrop" onClick={onCancel}></div>
    </div>
  );
}
