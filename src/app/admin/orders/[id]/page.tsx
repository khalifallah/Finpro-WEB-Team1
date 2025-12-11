"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { axiosInstance } from "@/libs/axios/axios.config";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";

// --- Format Helpers ---
const formatPrice = (price: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case "PENDING_PAYMENT":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "PENDING_CONFIRMATION":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "PROCESSING":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "SHIPPED":
      return "bg-indigo-100 text-indigo-800 border-indigo-200";
    case "CONFIRMED":
      return "bg-green-100 text-green-800 border-green-200";
    case "CANCELLED":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  const orderId = params.id;

  // Fetch Order Detail
  const fetchOrder = async () => {
    try {
      setLoading(true);
      // Panggil endpoint Admin Detail
      const response = await axiosInstance.get(`/orders/admin/${orderId}`);
      setOrder(response.data.data.order);
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to load order", "error");
      router.push("/admin/orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && orderId) fetchOrder();
  }, [orderId, user]);

  // --- ACTION HANDLERS ---

  const handleUpdateStatus = async (newStatus: string) => {
    if (!confirm(`Are you sure you want to update status to ${newStatus}?`))
      return;

    try {
      setActionLoading(true);
      // Endpoint update status admin
      await axiosInstance.patch(`/orders/admin/${orderId}/status`, {
        status: newStatus,
      });

      showToast(`Order status updated to ${newStatus}`, "success");
      fetchOrder(); // Refresh data
    } catch (err: any) {
      showToast(err.response?.data?.message || "Update failed", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    const reason = prompt("Enter cancellation reason:");
    if (!reason) return;

    try {
      setActionLoading(true);
      // Endpoint cancel admin
      await axiosInstance.post(`/orders/admin/${orderId}/cancel`, { reason });

      showToast("Order cancelled successfully", "success");
      fetchOrder();
    } catch (err: any) {
      showToast(err.response?.data?.message || "Cancellation failed", "error");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!order) return <div>Order not found</div>;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="text-sm breadcrumbs text-gray-500 mb-1">
            <ul>
              <li>
                <Link href="/admin/dashboard">Dashboard</Link>
              </li>
              <li>
                <Link href="/admin/orders">Orders</Link>
              </li>
              <li>#{order.id}</li>
            </ul>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            Order #{order.id}
            <span
              className={`text-sm px-3 py-1 rounded-full border ${getStatusBadgeClass(
                order.status
              )}`}
            >
              {order.status.replace(/_/g, " ")}
            </span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {formatDate(order.createdAt)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Items & Payment */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Ordered Items */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-100 font-semibold text-gray-700">
              Ordered Items
            </div>
            <div className="divide-y divide-gray-100">
              {order.orderItems.map((item: any) => (
                <div key={item.id} className="p-4 flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.product?.productImages?.[0]?.imageUrl ? (
                      <img
                        src={item.product.productImages[0].imageUrl}
                        alt="Product"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        No Img
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {item.productNameSnapshot}
                    </h4>
                    <p className="text-sm text-gray-500">
                      Qty: {item.quantity} x {formatPrice(item.priceAtPurchase)}
                    </p>
                  </div>
                  <div className="font-medium text-gray-900">
                    {formatPrice(item.priceAtPurchase * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
            {/* Total Summary */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Shipping Cost</span>
                <span>{formatPrice(order.shippingCost)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-{formatPrice(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg text-gray-900 pt-2 border-t border-gray-200 mt-2">
                <span>Total Amount</span>
                <span className="text-primary">
                  {formatPrice(order.totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Payment Proof Verification */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header Kotak - Selalu Muncul */}
            <div className="p-4 bg-gray-50 border-b border-gray-100 font-semibold text-gray-700 flex justify-between">
              <span>Payment Proof</span>
              <span className="text-xs font-normal text-gray-500">
                Method: {order.payment?.paymentMethod || "Unknown"}
              </span>
            </div>

            <div className="p-4">
              {/* LOGIKA PENGECEKAN FOTO ADA DI SINI */}
              {order.payment?.paymentProofUrl ? (
                // KONDISI A: ADA FOTO (Kode Lama)
                <div
                  className="relative h-64 w-full bg-gray-100 rounded-lg overflow-hidden cursor-pointer border-2 border-dashed border-gray-300 hover:border-primary transition-colors"
                  onClick={() => setShowImageModal(true)}
                >
                  <img
                    src={order.payment.paymentProofUrl}
                    alt="Payment Proof"
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/10 transition-colors">
                    <span className="bg-black/50 text-white px-3 py-1 rounded-full text-sm opacity-0 hover:opacity-100 transition-opacity">
                      Click to Zoom
                    </span>
                  </div>
                </div>
              ) : (
                // KONDISI B: TIDAK ADA FOTO (Fallback UI)
                <div className="h-64 w-full bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 mb-3 opacity-50"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="font-medium text-sm">
                    No Payment Proof Uploaded
                  </span>
                  <span className="text-xs text-gray-400 mt-1">
                    (Field is null or empty)
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Info & Actions */}
        <div className="space-y-6">
          {/* 1. ADMIN ACTIONS CARD (The Control Center) */}
          <div className="bg-white rounded-xl shadow-lg border border-primary/20 overflow-hidden">
            <div className="p-4 bg-primary/5 border-b border-primary/10 font-bold text-primary">
              Admin Actions
            </div>
            <div className="p-4 space-y-3">
              {/* STATUS: PENDING CONFIRMATION (Butuh Verifikasi Pembayaran) */}
              {order.status === "PENDING_CONFIRMATION" && (
                <>
                  <div className="alert alert-info text-xs py-2 mb-2 bg-blue-50 text-blue-700 border-blue-200">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="stroke-current shrink-0 h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    User has uploaded payment proof. Please verify.
                  </div>

                  {/* TOMBOL APPROVE (HIJAU) */}
                  <button
                    onClick={() => handleUpdateStatus("PROCESSING")}
                    disabled={actionLoading}
                    className="btn bg-green-600 hover:bg-green-700 text-white btn-block border-0 flex items-center gap-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Approve Payment
                  </button>

                  {/* TOMBOL REJECT (KUNING/AMBER) */}
                  <button
                    onClick={() => handleUpdateStatus("PENDING_PAYMENT")}
                    disabled={actionLoading}
                    className="btn bg-amber-500 hover:bg-amber-600 text-white btn-block border-0 flex items-center gap-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Reject (Ask Re-upload)
                  </button>
                </>
              )}

              {/* STATUS: PROCESSING (Siap Kirim) */}
              {order.status === "PROCESSING" && (
                <>
                  <div className="alert alert-success text-xs py-2 mb-2 bg-green-50 text-green-700 border-green-200">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="stroke-current shrink-0 h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Payment verified. Order is ready to ship.
                  </div>

                  {/* TOMBOL SHIP (BIRU PRIMARY) */}
                  <button
                    onClick={() => handleUpdateStatus("SHIPPED")}
                    disabled={actionLoading}
                    className="btn btn-primary btn-block flex items-center gap-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
                      />
                    </svg>
                    Ship Order
                  </button>
                </>
              )}

              {/* TOMBOL CANCEL PERMANEN (MERAH) */}
              {!["CONFIRMED", "CANCELLED", "SHIPPED"].includes(
                order.status
              ) && (
                <>
                  <div className="divider my-2 text-xs text-gray-400">Or</div>
                  <button
                    onClick={handleCancelOrder}
                    disabled={actionLoading}
                    className="btn btn-outline btn-error btn-block border-red-300 hover:border-red-500 text-red-500 hover:bg-red-50 flex items-center gap-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    Cancel Order
                  </button>
                </>
              )}

              {/* Read Only Message */}
              {["CONFIRMED", "CANCELLED"].includes(order.status) && (
                <p className="text-center text-gray-500 italic text-sm bg-gray-50 py-2 rounded">
                  This order is {order.status.toLowerCase()} and cannot be
                  modified.
                </p>
              )}

              {order.status === "SHIPPED" && (
                <div className="alert alert-info text-sm bg-indigo-50 text-indigo-700 border-indigo-200">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="stroke-current shrink-0 w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  Order has been shipped. Waiting for user confirmation.
                </div>
              )}
            </div>
          </div>

          {/* 2. Customer Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-4 border-b border-gray-100 font-semibold text-gray-700">
              Customer Info
            </div>
            <div className="p-4 text-sm space-y-2">
              <div className="flex items-center gap-3">
                <div className="avatar placeholder">
                  <div className="bg-neutral text-neutral-content rounded-full w-10">
                    <span>{order.user.fullName.charAt(0)}</span>
                  </div>
                </div>
                <div>
                  <p className="font-bold text-gray-900">
                    {order.user.fullName}
                  </p>
                  <p className="text-gray-500">{order.user.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Shipping Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-4 border-b border-gray-100 font-semibold text-gray-700">
              Shipping Details
            </div>
            <div className="p-4 text-sm space-y-3">
              <div>
                <p className="text-gray-500 text-xs uppercase mb-1">
                  Recipient
                </p>
                <p className="font-medium text-gray-900">
                  {order.userAddress?.recipientName}
                </p>
                <p className="text-gray-600">
                  {order.userAddress?.recipientPhone}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase mb-1">Address</p>
                <p className="text-gray-700">
                  {order.userAddress?.fullAddress}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase mb-1">
                  Store Origin
                </p>
                <p className="font-medium text-gray-900">{order.store?.name}</p>
                <p className="text-gray-600">{order.store?.address}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <button
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
              onClick={() => setShowImageModal(false)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <img
              src={order.payment.paymentProofUrl}
              alt="Payment Proof Full"
              className="w-full h-full object-contain rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
