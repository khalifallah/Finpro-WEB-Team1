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
import { useToast } from "@/contexts/ToastContext";
import { voucherService, Voucher } from "@/services/voucher.service";

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [checkoutPreview, setCheckoutPreview] =
    useState<CheckoutPreview | null>(null);

  // State Data
  const [selectedAddress, setSelectedAddress] = useState<UserAddress | null>(
    null
  );
  const [selectedShipping, setSelectedShipping] =
    useState<ShippingService | null>(null);
  const [validationResult, setValidationResult] =
    useState<CheckoutValidation | null>(null);

  // State UI
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showAddressList, setShowAddressList] = useState(false);
  const [error, setError] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);

  // State Voucher
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucherCode, setAppliedVoucherCode] = useState("");
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);
  const [myVouchers, setMyVouchers] = useState<Voucher[]>([]);
  const [showVoucherModal, setShowVoucherModal] = useState(false);

  const storeIdParam = searchParams.get("storeId");
  const itemsParam = searchParams.get("items");
  const storeId = storeIdParam ? Number(storeIdParam) : null;
  const cartItemIds = itemsParam ? JSON.parse(itemsParam) : [];

  useEffect(() => {
    if (user) {
      fetchCheckoutPreview();
      fetchMyVouchers();
    }
  }, [user]);

  const fetchMyVouchers = async () => {
    const vouchers = await voucherService.getMyVouchers();
    setMyVouchers(vouchers);
  };

  const fetchCheckoutPreview = async (codeToApply?: string) => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const code = codeToApply !== undefined ? codeToApply : appliedVoucherCode;

      const response = await axiosInstance.get("/orders/checkout/preview", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          storeId: storeId,
          voucherCode: code || undefined,
          addressId: selectedAddress?.id,
        },
      });

      if (response.data.status === 200 || response.data.status === "success") {
        const previewData = response.data.data.preview;
        if (!previewData.canCheckout) {
          setError("Cannot proceed to checkout. Your cart may be empty.");
          return;
        }
        setCheckoutPreview(previewData);

        if (previewData.selectedAddress && !selectedAddress) {
          setSelectedAddress(previewData.selectedAddress);
        }
      }
    } catch (err: any) {
      if (codeToApply) {
        showToast(
          err.response?.data?.message || "Invalid voucher code",
          "error"
        );
        setAppliedVoucherCode("");
        setVoucherCode("");
      }
      if (err.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
        setTimeout(() => router.push("/login"), 2000);
      } else {
        setError(err.message || "Failed to load checkout");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSelect = async (address: UserAddress) => {
    setSelectedAddress(address);
    setSelectedShipping(null);
    setValidationResult(null);
    setShowAddressList(false);
  };

  const handleCalculateShipping = async () => {
    if (!selectedAddress) {
      setError("Please select a shipping address first.");
      return;
    }

    try {
      setIsCalculatingShipping(true);
      setError("");

      const shippingResponse = await axiosInstance.post(
        "/orders/shipping/calculate",
        {
          addressId: selectedAddress.id,
          weight: checkoutPreview?.totalWeight || 1000,
          storeId: storeId,
        }
      );

      const shippingOptions = shippingResponse.data.data.shippingOptions;

      setValidationResult({
        ...validationResult,
        distance: shippingResponse.data.data.distance,
        availableShippingMethods: shippingOptions,
      } as any);

      if (shippingOptions.length === 0) {
        setError("No shipping methods available for this location.");
      }
    } catch (err: any) {
      console.error("Calculate shipping error:", err);
      setError(
        err.response?.data?.message || "Failed to calculate shipping costs"
      );
    } finally {
      setIsCalculatingShipping(false);
    }
  };

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
      await validateCheckoutStep(selectedAddress.id, shipping.serviceCode);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to validate shipping method"
      );
    }
  }

  // --- LOGIC VOUCHER ---

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) return;
    setIsApplyingVoucher(true);
    try {
      await fetchCheckoutPreview(voucherCode);
      if (selectedAddress && selectedShipping) {
        await validateCheckoutStep(
          selectedAddress.id,
          selectedShipping.serviceCode,
          voucherCode
        );
      }
      setAppliedVoucherCode(voucherCode);
      showToast("Voucher applied successfully!", "success");
    } catch (error) {
      setVoucherCode("");
    } finally {
      setIsApplyingVoucher(false);
    }
  };

  const handleSelectVoucherFromList = async (code: string) => {
    setVoucherCode(code);
    setShowVoucherModal(false);
    setIsApplyingVoucher(true);
    try {
      await fetchCheckoutPreview(code);
      if (selectedAddress && selectedShipping) {
        await validateCheckoutStep(
          selectedAddress.id,
          selectedShipping.serviceCode,
          code
        );
      }
      setAppliedVoucherCode(code);
      showToast("Voucher applied successfully!", "success");
    } finally {
      setIsApplyingVoucher(false);
    }
  };

  const handleRemoveVoucher = async () => {
    setVoucherCode("");
    setAppliedVoucherCode("");
    await fetchCheckoutPreview("");
    if (selectedAddress && selectedShipping) {
      await validateCheckoutStep(
        selectedAddress.id,
        selectedShipping.serviceCode,
        ""
      );
    } else {
      await fetchCheckoutPreview("");
    }
    showToast("Voucher removed", "info");
  };

  const validateCheckoutStep = async (
    addressId: number,
    serviceCode: string,
    voucherCodeOverride?: string
  ) => {
    const code =
      voucherCodeOverride !== undefined
        ? voucherCodeOverride
        : appliedVoucherCode;

    console.log("Validating checkout with voucher:", code);

    const response = await axiosInstance.post("/orders/checkout/validate", {
      addressId: addressId,
      shippingMethod: serviceCode,
      storeId: storeId,
      voucherCode: code || undefined,
    });

    console.log("Validation Response:", response.data.data); // DEBUG: Cek console browser!
    setValidationResult(response.data.data);
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress || !selectedShipping) {
      setError("Please select address and shipping method");
      return;
    }
    setIsPlacingOrder(true);
    try {
      const response = await axiosInstance.post("/orders/create", {
        userAddressId: selectedAddress.id,
        shippingMethod: selectedShipping.serviceCode,
        storeId: storeId,
        cartItemIds: cartItemIds,
        voucherCode: appliedVoucherCode || undefined,
      });
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
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading && !checkoutPreview) {
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
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
          <h2 className="text-xl font-bold">Cannot Checkout</h2>
          <button className="btn btn-primary" onClick={() => router.push("/")}>
            Back to Home
          </button>
        </div>
      </AuthGuard>
    );
  }

  // === VARIABLE DISPLAY (FLEXIBLE) ===
  const displaySubtotal =
    validationResult?.subtotal || checkoutPreview.subtotal;
  const displayShippingCost = selectedShipping?.cost || 0;

  const displayStoreDiscount =
    (validationResult as any)?.totalDiscount ||
    (checkoutPreview as any).totalDiscount ||
    0;

  const displayVoucherDeduction =
    (validationResult as any)?.voucherDeduction ||
    (validationResult as any)?.voucherAmount ||
    (checkoutPreview as any).voucherDeduction ||
    0;

  const displayShippingDeduction =
    (checkoutPreview as any)?.shippingDeduction ||
    (validationResult as any)?.shippingDeduction ||
    0;

  const productTotal = Math.max(
    0,
    displaySubtotal - displayStoreDiscount - displayVoucherDeduction
  );
  const shippingTotal = Math.max(
    0,
    displayShippingCost - displayShippingDeduction
  );

  const displayFinalTotal = productTotal + shippingTotal;

  return (
    <AuthGuard requireAuth requireVerification={true}>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        {error && (
          <div className="alert alert-error mb-6 shadow-sm">
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- LEFT COLUMN --- */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. SHIPPING ADDRESS */}
            <div className="card bg-base-100 shadow-sm border border-base-200">
              <div className="card-body p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="card-title text-lg flex items-center gap-2">
                    Shipping Address
                  </h2>
                  {selectedAddress && (
                    <button
                      className="btn btn-ghost btn-sm text-primary"
                      onClick={() => setShowAddressList(true)}
                    >
                      Change
                    </button>
                  )}
                </div>

                {selectedAddress ? (
                  <div className="bg-base-200/50 p-4 rounded-xl border border-base-200">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base">
                          {selectedAddress.recipientName}
                        </span>
                        {selectedAddress.isMain && (
                          <span className="badge badge-primary badge-xs">
                            Main
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {selectedAddress.recipientPhone}
                      </p>
                      <p className="text-sm mt-1 leading-relaxed">
                        {selectedAddress.fullAddress}
                      </p>
                    </div>
                    {validationResult?.distance && (
                      <div className="mt-3 pt-3 border-t border-base-200 text-xs text-gray-500 flex items-center gap-1">
                        Distance to store:{" "}
                        {validationResult.distance.toFixed(2)} km
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-base-200/30 rounded-xl border border-dashed border-base-300">
                    <p className="text-gray-500 mb-4">No address selected</p>
                    <div className="flex gap-2 justify-center">
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => setShowAddressForm(true)}
                      >
                        + Add New Address
                      </button>
                      {checkoutPreview.addresses.length > 0 && (
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => setShowAddressList(true)}
                        >
                          Select Existing
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 2. SHIPPING METHOD */}
            {selectedAddress && (
              <div className="card bg-base-100 shadow-sm border border-base-200">
                <div className="card-body p-6">
                  <h2 className="card-title text-lg mb-4 flex items-center gap-2">
                    Shipping Method
                  </h2>

                  {!validationResult?.availableShippingMethods ? (
                    <div className="text-center py-6 bg-base-200/30 rounded-xl border border-dashed border-base-300">
                      <p className="text-sm text-gray-500 mb-3">
                        Select address and click below to check delivery
                        options.
                      </p>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={handleCalculateShipping}
                        disabled={isCalculatingShipping}
                      >
                        {isCalculatingShipping ? (
                          <span className="loading loading-spinner loading-xs"></span>
                        ) : (
                          "Calculate Shipping"
                        )}
                      </button>
                    </div>
                  ) : validationResult.availableShippingMethods.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-in fade-in zoom-in duration-300">
                      {validationResult.availableShippingMethods.map(
                        (shipping) => (
                          <div
                            key={shipping.serviceCode}
                            className={`
                            relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md
                            ${
                              selectedShipping?.serviceCode ===
                              shipping.serviceCode
                                ? "border-primary bg-primary/5"
                                : "border-base-200 hover:border-base-300 bg-base-100"
                            }
                          `}
                            onClick={() => handleShippingSelect(shipping)}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div
                                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                  selectedShipping?.serviceCode ===
                                  shipping.serviceCode
                                    ? "border-primary"
                                    : "border-gray-400"
                                }`}
                              >
                                {selectedShipping?.serviceCode ===
                                  shipping.serviceCode && (
                                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                                )}
                              </div>
                              <span className="font-bold text-primary">
                                {formatPrice(shipping.cost)}
                              </span>
                            </div>
                            <h3 className="font-bold text-sm mb-1">
                              {shipping.serviceName}
                            </h3>
                            <p className="text-xs text-gray-500 line-clamp-2 mb-1">
                              {shipping.description}
                            </p>
                            <div className="badge badge-ghost badge-xs text-[10px]">
                              {shipping.estimatedDays}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-error bg-error/10 rounded-xl">
                      No shipping methods available for this location.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 3. ORDER ITEMS */}
            <div className="card bg-base-100 shadow-sm border border-base-200">
              <div className="card-body p-6">
                <h2 className="card-title text-lg mb-4">
                  Items ({checkoutPreview.cartSummary.length})
                </h2>
                <div className="divide-y divide-base-200">
                  {checkoutPreview.cartSummary.map((item: any) => (
                    <div
                      key={item.productId}
                      className="flex gap-4 py-4 first:pt-0 last:pb-0"
                    >
                      <div className="w-16 h-16 rounded-lg bg-base-200 shrink-0 overflow-hidden border border-base-200">
                        {item.imageUrl && (
                          <img
                            src={item.imageUrl}
                            alt={item.productName}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm truncate">
                          {item.productName}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          Qty: {item.quantity}
                        </p>
                        {item.discountAmount > 0 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-800 mt-1">
                            Saved {formatPrice(item.discountAmount)}
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-sm">
                          {formatPrice(item.total)}
                        </div>
                        {item.discountAmount > 0 && (
                          <div className="text-xs text-gray-400 line-through">
                            {formatPrice(item.total + item.discountAmount)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* --- RIGHT COLUMN (SUMMARY) --- */}
          <div className="lg:col-span-1">
            <div className="card bg-base-100 shadow-xl sticky top-4 border border-base-200">
              <div className="card-body p-6">
                <h2 className="card-title text-lg mb-6">Order Summary</h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatPrice(displaySubtotal)}</span>
                  </div>

                  {displayStoreDiscount > 0 && (
                    <div className="flex justify-between text-success">
                      <span>Store Discount</span>
                      <span>-{formatPrice(displayStoreDiscount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>
                      {displayShippingCost > 0
                        ? formatPrice(displayShippingCost)
                        : "-"}
                    </span>
                  </div>

                  {(displayVoucherDeduction > 0 ||
                    displayShippingDeduction > 0) && (
                    <div className="py-2 border-y border-dashed border-base-300 space-y-2 my-2">
                      {displayVoucherDeduction > 0 && (
                        <div className="flex justify-between text-primary font-medium">
                          <span>Voucher (Item)</span>
                          <span>-{formatPrice(displayVoucherDeduction)}</span>
                        </div>
                      )}
                      {displayShippingDeduction > 0 && (
                        <div className="flex justify-between text-primary font-medium">
                          <span>Voucher (Shipping)</span>
                          <span>-{formatPrice(displayShippingDeduction)}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="divider my-2"></div>

                  <div className="flex justify-between items-end">
                    <span className="font-bold text-lg">Total</span>
                    <span className="text-2xl font-bold text-primary">
                      {formatPrice(displayFinalTotal)}
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-base-200">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-semibold flex items-center gap-2">
                      Voucher Code
                    </label>
                    <button
                      className="text-xs text-primary hover:underline font-medium"
                      onClick={() => setShowVoucherModal(true)}
                    >
                      See Available Vouchers
                    </button>
                  </div>

                  <div className="join w-full">
                    <input
                      type="text"
                      className="input input-bordered input-sm join-item w-full focus:outline-none"
                      placeholder="Enter code"
                      value={voucherCode}
                      onChange={(e) =>
                        setVoucherCode(e.target.value.toUpperCase())
                      }
                      disabled={!!appliedVoucherCode}
                    />
                    {appliedVoucherCode ? (
                      <button
                        className="btn btn-sm btn-error join-item text-white"
                        onClick={handleRemoveVoucher}
                      >
                        X
                      </button>
                    ) : (
                      <button
                        className="btn btn-sm btn-neutral join-item"
                        onClick={handleApplyVoucher}
                        disabled={isApplyingVoucher || !voucherCode}
                      >
                        {isApplyingVoucher ? "..." : "Apply"}
                      </button>
                    )}
                  </div>

                  {appliedVoucherCode && (
                    <div className="text-xs text-success mt-2 flex items-center gap-1 font-medium bg-success/10 p-2 rounded-lg">
                      Voucher code applied!
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  <button
                    className="btn btn-primary btn-block shadow-lg shadow-primary/30 h-12 text-lg font-bold"
                    onClick={handlePlaceOrder}
                    disabled={
                      !selectedAddress || !selectedShipping || isPlacingOrder
                    }
                  >
                    {isPlacingOrder ? (
                      <span className="loading loading-spinner"></span>
                    ) : (
                      `Pay ${formatPrice(displayFinalTotal)}`
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Address Selection Modal */}
      {showAddressList && checkoutPreview?.addresses && (
        <div className="modal modal-open modal-bottom sm:modal-middle">
          <div
            className="modal-backdrop"
            onClick={() => setShowAddressList(false)}
          ></div>
          <div className="modal-box w-11/12 max-w-4xl p-0 flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center p-5 border-b border-base-200 bg-base-100 sticky top-0 z-20">
              <h3 className="font-bold text-xl flex items-center gap-2">
                Select Shipping Address
              </h3>
              <button
                className="btn btn-sm btn-circle btn-ghost"
                onClick={() => setShowAddressList(false)}
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 bg-base-100">
              {checkoutPreview.addresses.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  You don't have any saved addresses.
                </div>
              ) : (
                <AddressList
                  addresses={checkoutPreview.addresses}
                  onAddressUpdate={() => fetchCheckoutPreview()}
                  selectable={true}
                  onSelect={handleAddressSelect}
                  selectedAddressId={selectedAddress?.id}
                />
              )}
            </div>
            <div className="p-5 border-t border-base-200 bg-base-100 flex justify-end gap-3 sticky bottom-0 z-20">
              <button
                className="btn btn-ghost"
                onClick={() => setShowAddressList(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setShowAddressList(false);
                  setShowAddressForm(true);
                }}
              >
                + Add New Address
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Voucher Selection Modal */}
      {showVoucherModal && (
        <div className="modal modal-open modal-bottom sm:modal-middle">
          <div
            className="modal-backdrop"
            onClick={() => setShowVoucherModal(false)}
          ></div>
          <div className="modal-box">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">My Vouchers</h3>
              <button
                className="btn btn-sm btn-circle btn-ghost"
                onClick={() => setShowVoucherModal(false)}
              >
                ✕
              </button>
            </div>

            {myVouchers.length === 0 ? (
              <div className="py-10 text-center text-gray-500 bg-base-200/50 rounded-xl">
                <p>No vouchers available.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {myVouchers.map((v) => (
                  <div
                    key={v.id}
                    className="border border-base-300 rounded-xl p-4 hover:border-primary cursor-pointer transition-all hover:shadow-md bg-base-100 relative overflow-hidden group"
                    onClick={() => handleSelectVoucherFromList(v.code)}
                  >
                    <div className="absolute -right-4 -top-4 w-16 h-16 bg-primary/5 rounded-full group-hover:bg-primary/10 transition-colors"></div>

                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-primary text-lg tracking-wide">
                        {v.code}
                      </span>
                      <span className="badge badge-sm badge-outline">
                        {v.type}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-700">
                      {v.description}
                    </p>
                    <div className="mt-2 pt-2 border-t border-dashed border-base-200 flex justify-between text-xs text-gray-500">
                      <span>Min. spend: {formatPrice(v.minPurchase)}</span>
                      <span>
                        Exp: {new Date(v.expiresAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
