"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import AuthGuard from "@/components/AuthGuard";
import { axiosInstance } from "@/libs/axios/axios.config";
import Link from "next/link";

// Import logic yang sudah dipisah
import { useOrderActions } from "@/hooks/useOrderActions";
import { OrderModals } from "@/components/orders/OrderModals";
import {
  formatPrice,
  formatDate,
  getStatusBadgeColor,
  formatInvoiceId,
} from "@/utils/format";

export default function OrderDetailPage() {
  const { id: orderId } = useParams();
  const { user } = useAuth();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal States
  const [modals, setModals] = useState({
    upload: false,
    cancel: false,
    confirm: false,
  });

  const { actionLoading, uploadPayment, cancelOrder, confirmOrder } =
    useOrderActions(orderId as string, () => {
      setModals({ upload: false, cancel: false, confirm: false });
      fetchOrder();
    });

  useEffect(() => {
    if (user) fetchOrder();
  }, [user, orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/orders/${orderId}`);
      setOrder(response.data.data.order);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AuthGuard requireAuth>
        <div className="min-h-screen flex items-center justify-center">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requireAuth>
      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="alert alert-error mb-6">
            <span>{error}</span>
          </div>
        )}

        {/* HEADER: STATUS & DEADLINE (Seperti Gambar 2) */}
        {order && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="font-bold text-2xl font-mono text-primary mb-1">
                      Order {formatInvoiceId(order.id, order.createdAt)}
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div
                    className={`badge ${getStatusBadgeColor(
                      order.status
                    )} badge-lg font-semibold h-auto whitespace-normal text-center py-2`}
                  >
                    {order.status.replace(/_/g, " ")}
                  </div>
                </div>

                {/* Deadline Alert */}
                {order.status === "PENDING_PAYMENT" &&
                  order.paymentDeadline && (
                    <div className="alert alert-warning mt-4 rounded-lg flex items-center gap-3">
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
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-sm font-medium">
                        Complete payment before{" "}
                        {new Date(order.paymentDeadline).toLocaleString()}
                      </span>
                    </div>
                  )}
              </div>
            </div>

            {/* CARD 2: ORDER ITEMS (Desain Gambar 1 - Tanpa Gambar, Layout Clean) */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body p-6">
                <h3 className="font-bold text-lg mb-4">Ordered Items</h3>
                <div className="space-y-6">
                  {order.orderItems.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-start border-b border-base-200 pb-4 last:border-0 last:pb-0"
                    >
                      <div>
                        <p className="font-bold text-base">
                          {item.productNameSnapshot}
                        </p>
                        <p className="text-gray-500 text-sm mt-1">
                          x {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-base">
                          {formatPrice(item.priceAtPurchase)}
                        </p>
                        {/* Jika mau menampilkan total per item seperti di gambar */}
                        {/* <p className="text-gray-500 text-sm mt-1">Total: {formatPrice(item.priceAtPurchase * item.quantity)}</p> */}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CARD 3: SHIPPING INFORMATION (Desain Gambar 1) */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body p-6">
                <h3 className="font-bold text-lg mb-4">Shipping Information</h3>
                <div className="space-y-6">
                  {/* Store Info */}
                  <div>
                    <p className="font-semibold text-sm text-gray-400 uppercase mb-1">
                      Store
                    </p>
                    <p className="font-medium text-base">{order.store?.name}</p>
                    <p className="text-gray-500 text-sm">
                      {order.store?.address}
                    </p>
                  </div>

                  {/* Address Info */}
                  <div>
                    <p className="font-semibold text-sm text-gray-400 uppercase mb-1">
                      Shipping Address
                    </p>
                    {order.userAddress ? (
                      <>
                        <p className="font-medium text-base">
                          {order.userAddress.recipientName}
                        </p>
                        <p className="text-gray-500 text-sm">
                          {order.userAddress.recipientPhone}
                        </p>
                        <p className="text-gray-500 text-sm mt-1">
                          {order.userAddress.fullAddress}
                        </p>
                      </>
                    ) : (
                      <p className="text-gray-500">
                        Address info not available
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 4: PAYMENT SUMMARY & ACTIONS (Desain Gambar 2) */}
            {/* Card 3: Summary & Action Buttons */}
            <div className="card bg-base-100 shadow-xl border-t-4 border-primary">
              <div className="card-body">
                <h2 className="card-title mb-4">Payment Summary</h2>
                <div className="space-y-2 text-sm mb-6">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatPrice(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{formatPrice(order.shippingCost)}</span>
                  </div>
                  {order.discountAmount > 0 && (
                    <div className="flex justify-between text-success">
                      <span>Discount</span>
                      <span>-{formatPrice(order.discountAmount)}</span>
                    </div>
                  )}
                  <div className="divider"></div>
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span className="text-primary">
                      {formatPrice(order.totalAmount)}
                    </span>
                  </div>
                </div>

                {/* ACTION BUTTONS (Only if needed) */}
                {(order.status === "PENDING_PAYMENT" ||
                  order.status === "SHIPPED") && (
                  <div className="flex flex-col sm:flex-row gap-3">
                    {order.status === "PENDING_PAYMENT" && (
                      <>
                        <button
                          className="btn btn-primary flex-1"
                          onClick={() =>
                            setModals((p) => ({ ...p, upload: true }))
                          }
                        >
                          Upload Payment Proof
                        </button>
                        <button
                          className="btn btn-outline btn-error flex-1 sm:flex-none"
                          onClick={() =>
                            setModals((p) => ({ ...p, cancel: true }))
                          }
                        >
                          Cancel Order
                        </button>
                      </>
                    )}
                    {order.status === "SHIPPED" && (
                      <button
                        className="btn btn-success text-white flex-1"
                        onClick={() =>
                          setModals((p) => ({ ...p, confirm: true }))
                        }
                      >
                        Confirm Received
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Nav Links */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2 pb-8">
              <Link href="/orders" className="btn btn-outline flex-1">
                ← Back to My Orders List
              </Link>
              <Link href="/" className="btn btn-soft flex-1">
                Continue Shopping
              </Link>
            </div>
          </div>
        )}

        {/* Komponen Modal (Popup) */}
        <OrderModals
          loading={actionLoading}
          showUpload={modals.upload}
          onCloseUpload={() => setModals((p) => ({ ...p, upload: false }))}
          onUpload={uploadPayment}
          showCancel={modals.cancel}
          onCloseCancel={() => setModals((p) => ({ ...p, cancel: false }))}
          onCancel={cancelOrder}
          showConfirm={modals.confirm}
          onCloseConfirm={() => setModals((p) => ({ ...p, confirm: false }))}
          onConfirm={confirmOrder}
        />
      </div>
    </AuthGuard>
  );
}
