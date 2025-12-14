"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import AuthGuard from "@/components/AuthGuard";
import { axiosInstance } from "@/libs/axios/axios.config";
import AddressList from "@/components/AddressList";
import AddressForm from "@/components/AddressForm";
import { UserAddress } from "@/types/address";
import {
  ShippingService,
  CheckoutPreview,
  CheckoutValidation,
} from "@/types/shipping";

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [checkoutPreview, setCheckoutPreview] =
    useState<CheckoutPreview | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<UserAddress | null>(
    null
  );
  const [selectedShipping, setSelectedShipping] =
    useState<ShippingService | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showAddressList, setShowAddressList] = useState(false);
  const [error, setError] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [validationResult, setValidationResult] =
    useState<CheckoutValidation | null>(null);
  

  const storeIdParam = searchParams.get("storeId");
  const itemsParam = searchParams.get("items");

  const storeId = storeIdParam ? Number(storeIdParam) : null;
  const cartItemIds = itemsParam ? JSON.parse(itemsParam) : [];

  useEffect(() => {
    if (user) {
      fetchCheckoutPreview();
    }
  }, [user]);

  const fetchCheckoutPreview = async () => {
    try {
      setLoading(true);
      setError("");

      // Get token from localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      // *** FIX: Pass storeId to checkout preview ***
      const response = await axiosInstance.get("/orders/checkout/preview", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          storeId: storeId, // Pass storeId from URL
        },
      });

      if (response.data.status === 200 || response.data.status === "success") {
        const previewData = response.data.data.preview;

        // Check if canCheckout is false
        if (!previewData.canCheckout) {
          setError(
            "Cannot proceed to checkout. Your cart may be empty or there are issues with your order."
          );
          // Don't set checkoutPreview if can't checkout
          return;
        }

        setCheckoutPreview(previewData);

        // Backend should provide numeric discount fields (`discountAmount` on items and `discountAmount` on preview).
        // No client-side fetch to admin endpoints is performed here.

        // Set selected address if available
        if (previewData.selectedAddress) {
          setSelectedAddress(previewData.selectedAddress);
        }

        // *** FIX: Auto-select shipping method if available ***
        if (previewData.shippingOptions?.length > 0) {
          setSelectedShipping(previewData.shippingOptions[0]);

          // Trigger validation if address exists
          if (previewData.selectedAddress) {
            handleAddressSelect(previewData.selectedAddress);
          }
        }
      } else {
        throw new Error(
          response.data.message || "Failed to load checkout preview"
        );
      }
    } catch (err: any) {
      console.error("Fetch checkout preview error:", err);

      // Handle specific errors
      if (err.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
        // Redirect to login after 2 seconds
        setTimeout(() => router.push("/login"), 2000);
      } else if (err.response?.status === 400) {
        setError(
          err.response?.data?.message ||
            "Cannot checkout. Please check your cart items."
        );
      } else {
        setError(err.message || "Failed to load checkout");
      }

      // Reset cart state on error
      setCheckoutPreview({
        canCheckout: false,
        addresses: [],
        cartSummary: [],
        subtotal: 0,
        totalWeight: 0,
        shippingOptions: [],
        requiresAddress: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 2;

  const fetchCheckoutPreviewWithRetry = async () => {
    try {
      await fetchCheckoutPreview();
      setRetryCount(0); // Reset retry count on success
    } catch (error) {
      if (retryCount < maxRetries) {
        setRetryCount((prev) => prev + 1);
        setTimeout(() => {
          fetchCheckoutPreviewWithRetry();
        }, 1000 * retryCount); // Exponential backoff
      }
    }
  };

  // Update useEffect to use the retry version
  useEffect(() => {
    if (user) {
      fetchCheckoutPreviewWithRetry();
    }
  }, [user]);

  const handleAddressSelect = async (address: UserAddress) => {
    setSelectedAddress(address);
    setShowAddressList(false);

    try {
      // First, get available shipping methods
      const shippingResponse = await axiosInstance.post(
        "/orders/shipping/calculate",
        {
          addressId: address.id,
          weight: checkoutPreview?.totalWeight || 1000,
          storeId: storeId,
        }
      );

      const shippingOptions = shippingResponse.data.data.shippingOptions;

      if (shippingOptions.length === 0) {
        setError(
          "No shipping methods available for this address. Please select a different address."
        );
        return;
      }

      // Auto-select the first available shipping method
      const firstShippingMethod = shippingOptions[0];
      setSelectedShipping(firstShippingMethod);

      // Then validate checkout with the actual shipping method
      const response = await axiosInstance.post("/orders/checkout/validate", {
        addressId: address.id,
        shippingMethod: firstShippingMethod.serviceCode, // Use actual service code
        storeId: storeId,
      });

      const validationData = response.data.data;
      setValidationResult(validationData);
    } catch (err: any) {
      console.error("Shipping validation error:", err);
      setError(err.message || "Failed to calculate shipping");
    }
  };
  const handlePlaceOrder = async () => {
    if (!selectedAddress || !selectedShipping) {
      setError("Please select address and shipping method");
      return;
    }

    if (!storeId || cartItemIds.length === 0) {
      setError("Invalid order data. Please return to cart.");
      return;
    }

    setIsPlacingOrder(true);
    setError("");

    try {
      // Check what shipping methods are available for this store
      const availableMethods = validationResult?.availableShippingMethods || [];
      const expressMethod = availableMethods.find(
        (method) =>
          method.serviceCode === "EXPRESS" ||
          method.serviceCode === "NEXT_DAY" ||
          method.serviceCode === "FAST_DELIVERY"
      );

      // If no express method, use the first available
      const selectedMethod = expressMethod || availableMethods[0];

      // Use the found method
      const response = await axiosInstance.post("/orders/create", {
        userAddressId: selectedAddress.id,
        shippingMethod: selectedMethod.serviceCode, // Use actual code from store
        storeId: storeId,
        cartItemIds: cartItemIds,
      });

      // Redirect to order confirmation page
      router.push(`/orders/${response.data.data.order.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to place order");
      setIsPlacingOrder(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Fallback: if backend didn't provide discountAmount, compute from cartSummary
  const previewDiscount = (() => {
    if (!checkoutPreview) return 0;
    if (typeof checkoutPreview.discountAmount === "number") return checkoutPreview.discountAmount || 0;
    // compute from cartSummary items
    try {
      return checkoutPreview.cartSummary.reduce((acc: number, item: any) => {
        // prefer server-provided numeric discount per item if present
        if (typeof item.discountAmount === "number") return acc + (item.discountAmount || 0);
        if (!item.discount) return acc;
        const rule = item.discount;
        let itemDiscount = 0;
        if (rule.type === "DIRECT_PERCENTAGE") {
          itemDiscount = (item.total || 0) * (rule.value / 100 || 0);
        } else if (rule.type === "DIRECT_NOMINAL") {
          itemDiscount = Math.min(rule.value || 0, item.total || 0);
        } else if (rule.type === "BOGO") {
          if ((item.quantity || 0) >= 2) itemDiscount = item.price || 0;
        }
        return acc + itemDiscount;
      }, 0);
    } catch (e) {
      return 0;
    }
  })();

  const effectivePreviewDiscount = previewDiscount;

  if (loading) {
    return (
      <AuthGuard requireAuth requireVerification={true}>
        <div className="min-h-screen flex items-center justify-center">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </AuthGuard>
    );
  }

  if (!checkoutPreview?.canCheckout) {
    return (
      <AuthGuard requireAuth requireVerification={true}>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Checkout</h1>
            <div className="alert alert-warning max-w-md mx-auto">
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
                  d="M12 9v2m0 4h.01m-6.938 4h13.856a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                />
              </svg>
              <div>
                <span>Cannot proceed to checkout</span>
                <p className="text-sm mt-1">
                  Your cart may be empty or there are issues with your order.
                </p>
              </div>
            </div>
            <div className="flex gap-4 justify-center mt-6">
              <button
                className="btn btn-primary"
                onClick={() => router.push("/cart")}
              >
                View Cart
              </button>
              <button
                className="btn btn-outline"
                onClick={() => {
                  // Force refresh cart
                  localStorage.removeItem("storeId");
                  router.push("/");
                }}
              >
                Start Over
              </button>
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  async function handleShippingSelect(
    shipping: ShippingService
  ): Promise<void> {
    try {
      setSelectedShipping(shipping);
      setError("");

      if (!selectedAddress) {
        setError("Please select a shipping address first.");
        return;
      }

      const response = await axiosInstance.post("/orders/checkout/validate", {
        addressId: selectedAddress.id,
        shippingMethod: shipping.serviceCode,
        storeId: storeId,
      });

      const validationData: CheckoutValidation = response.data.data;
      setValidationResult(validationData);
    } catch (err: any) {
      console.error("Shipping selection validation error:", err);
      setError(
        err.response?.data?.message || "Failed to validate shipping method"
      );
    }
  }

  const calculateShipping = async (): Promise<void> => {
    try {
      setError("");
      if (!selectedAddress) {
        setError("Please select a shipping address first.");
        setShowAddressList(true);
        return;
      }
      await handleAddressSelect(selectedAddress);
    } catch (err: any) {
      console.error("Calculate shipping error:", err);
      setError(err.response?.data?.message || "Failed to calculate shipping");
    }
  };

  return (
    <AuthGuard requireAuth requireVerification={true}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        {error && (
          <div className="alert alert-error mb-6">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Order Summary & Shipping */}
          <div className="lg:col-span-2 space-y-8">
            {/* Shipping Address Section */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title mb-4">Shipping Address</h2>

                {selectedAddress ? (
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          {selectedAddress.isMain && (
                            <span className="badge badge-primary badge-sm">
                              Primary
                            </span>
                          )}
                          {selectedAddress.label && (
                            <span className="font-medium">
                              {selectedAddress.label}
                            </span>
                          )}
                        </div>
                        <p className="font-medium">
                          {selectedAddress.recipientName}
                        </p>
                        {selectedAddress.recipientPhone && (
                          <p className="text-sm text-gray-600">
                            {selectedAddress.recipientPhone}
                          </p>
                        )}
                        <p className="mt-2">{selectedAddress.fullAddress}</p>
                      </div>
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => setShowAddressList(true)}
                      >
                        Change
                      </button>
                    </div>

                    {validationResult?.distance && (
                      <div className="mt-4 p-3 bg-base-200 rounded-lg">
                        <div className="flex items-center gap-2 text-sm">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-primary"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                            />
                          </svg>
                          <span>
                            Distance to store:{" "}
                            <strong>
                              {validationResult.distance.toFixed(1)} km
                            </strong>
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-16 w-16 mx-auto text-gray-400 mb-4"
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
                    <h3 className="text-lg font-semibold mb-2">
                      No shipping address selected
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Please select or add a shipping address to continue
                    </p>
                    <div className="flex gap-2 justify-center">
                      <button
                        className="btn btn-primary"
                        onClick={() => setShowAddressForm(true)}
                      >
                        Add New Address
                      </button>
                      {checkoutPreview.addresses.length > 0 && (
                        <button
                          className="btn btn-outline"
                          onClick={() => setShowAddressList(true)}
                        >
                          Choose Existing Address
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Shipping Method Section */}
            {selectedAddress && (
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title mb-4">Shipping Method</h2>

                  {validationResult?.availableShippingMethods &&
                  validationResult.availableShippingMethods.length > 0 ? (
                    <div className="space-y-3">
                      {validationResult.availableShippingMethods.map(
                        (shipping) => (
                          <div
                            key={shipping.serviceCode}
                            className={`border rounded-lg p-4 cursor-pointer hover:border-primary transition-colors ${
                              selectedShipping?.serviceCode ===
                              shipping.serviceCode
                                ? "border-primary border-2 bg-primary/5"
                                : "border-base-300"
                            }`}
                            onClick={() => handleShippingSelect(shipping)}
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <h3 className="font-medium">
                                  {shipping.serviceName}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {shipping.description}
                                </p>
                                {shipping.estimatedDays && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Estimated delivery: {shipping.estimatedDays}
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="font-bold">
                                  {formatPrice(shipping.cost)}
                                </p>
                                {selectedShipping?.serviceCode ===
                                  shipping.serviceCode && (
                                  <span className="badge badge-primary badge-sm mt-1">
                                    Selected
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-500">
                        No shipping methods available for this address. Please
                        select a different address.
                      </p>
                      <button
                        className="btn btn-sm btn-outline mt-2"
                        onClick={calculateShipping}
                      >
                        Try Calculate Shipping
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Order Items Section */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title mb-4">Order Items</h2>
                <div className="space-y-4">
                  {checkoutPreview.cartSummary.map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-center gap-4"
                    >
                      {item.imageUrl && (
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-base-200">
                          <img
                            src={item.imageUrl}
                            alt={item.productName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-medium">{item.productName}</h3>
                        <p className="text-sm text-gray-600">
                          Quantity: {item.quantity}
                        </p>
                        {item.discount && (
                          <div className="mt-1">
                            <span className="inline-block px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                              {item.discount.description}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatPrice(item.price)}</p>
                        <p className="text-sm text-gray-600">
                          Total: {formatPrice(item.total)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="card bg-base-100 shadow-xl sticky top-4">
              <div className="card-body">
                <h2 className="card-title mb-4">Order Summary</h2>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatPrice(checkoutPreview.subtotal)}</span>
                  </div>

                  {selectedShipping && (
                    <div className="flex justify-between">
                      <span>Shipping ({selectedShipping.serviceName})</span>
                      <span>{formatPrice(selectedShipping.cost)}</span>
                    </div>
                  )}

                  {effectivePreviewDiscount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span>-{formatPrice(effectivePreviewDiscount)}</span>
                    </div>
                  )}

                  <div className="divider"></div>

                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>
                      {formatPrice(
                        checkoutPreview.subtotal + (selectedShipping?.cost || 0) - (effectivePreviewDiscount || 0)
                      )}
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    className="btn btn-primary btn-block"
                    onClick={handlePlaceOrder}
                    disabled={
                      !selectedAddress || !selectedShipping || isPlacingOrder
                    }
                  >
                    {isPlacingOrder ? (
                      <>
                        <span className="loading loading-spinner"></span>
                        Processing Order...
                      </>
                    ) : (
                      "Place Order"
                    )}
                  </button>
                </div>

                <div className="mt-4 text-xs text-gray-500">
                  <p>
                    By placing your order, you agree to our Terms of Service and
                    Privacy Policy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Address Selection Modal */}
      {showAddressList && checkoutPreview.addresses.length > 0 && (
        <div className="modal modal-open">
          <div className="modal-box max-w-4xl">
            <h3 className="font-bold text-lg mb-4">Select Shipping Address</h3>

            <div className="max-h-96 overflow-y-auto pr-2">
              <AddressList
                addresses={checkoutPreview.addresses}
                onAddressUpdate={fetchCheckoutPreview}
                selectable={true}
                onSelect={handleAddressSelect}
                selectedAddressId={selectedAddress?.id}
              />
            </div>

            <div className="modal-action">
              <button
                className="btn btn-ghost"
                onClick={() => setShowAddressList(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-outline"
                onClick={() => {
                  setShowAddressList(false);
                  setShowAddressForm(true);
                }}
              >
                Add New Address
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Address Form Modal */}
      {showAddressForm && (
        <AddressForm
          onSuccess={() => {
            setShowAddressForm(false);
            fetchCheckoutPreview();
          }}
          onCancel={() => setShowAddressForm(false)}
        />
      )}
    </AuthGuard>
  );
}
