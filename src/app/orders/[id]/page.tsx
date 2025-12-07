"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import AuthGuard from "@/components/AuthGuard";
import { axiosInstance } from "@/libs/axios/axios.config";
import Link from "next/link";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const orderId = params.id;

  useEffect(() => {
    if (user) {
      fetchOrder();
    }
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <AuthGuard requireAuth requireVerification={true}>
        <div className="min-h-screen flex items-center justify-center">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requireAuth requireVerification={true}>
      <div className="container mx-auto px-4 py-8">
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

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Order Confirmation</h1>
          <p className="text-gray-600">Order #{order?.id}</p>
        </div>

        {order && (
          <div className="max-w-3xl mx-auto">
            {/* Order Status */}
            <div className="card bg-base-100 shadow-xl mb-6">
              <div className="card-body">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="card-title">Order Status</h2>
                    <p className="text-gray-600">
                      Placed on {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className={`badge badge-lg ${getStatusBadgeColor(order.status)}`}>
                    {order.status.replace("_", " ")}
                  </div>
                </div>

                {order.paymentDeadline && order.status === "PENDING_PAYMENT" && (
                  <div className="alert alert-warning mt-4">
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
                    <div>
                      <h3 className="font-bold">Payment Deadline</h3>
                      <p>
                        Please complete payment before{" "}
                        {new Date(order.paymentDeadline).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div className="card bg-base-100 shadow-xl mb-6">
              <div className="card-body">
                <h2 className="card-title mb-4">Order Items</h2>
                <div className="space-y-4">
                  {order.orderItems.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="flex-1">
                        <h3 className="font-medium">{item.productNameSnapshot}</h3>
                        <p className="text-sm text-gray-600">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatPrice(item.priceAtPurchase)}</p>
                        <p className="text-sm text-gray-600">
                          Total: {formatPrice(item.priceAtPurchase * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            <div className="card bg-base-100 shadow-xl mb-6">
              <div className="card-body">
                <h2 className="card-title mb-4">Shipping Information</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Store</h3>
                    <p>{order.store?.name}</p>
                    <p className="text-sm text-gray-600">{order.store?.address}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium">Shipping Address</h3>
                    {order.userAddress && (
                      <>
                        <p>{order.userAddress.recipientName}</p>
                        {order.userAddress.recipientPhone && (
                          <p className="text-sm text-gray-600">
                            {order.userAddress.recipientPhone}
                          </p>
                        )}
                        <p className="text-sm text-gray-600">
                          {order.userAddress.fullAddress}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title mb-4">Order Summary</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatPrice(order.subtotal)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Shipping Cost</span>
                    <span>{formatPrice(order.shippingCost)}</span>
                  </div>
                  
                  {order.discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-{formatPrice(order.discountAmount)}</span>
                    </div>
                  )}
                  
                  <div className="divider"></div>
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Amount</span>
                    <span>{formatPrice(order.totalAmount)}</span>
                  </div>
                </div>
                
                <div className="mt-6 flex gap-4">
                  <Link href="/orders" className="btn btn-outline flex-1">
                    View All Orders
                  </Link>
                  <Link href="/" className="btn btn-primary flex-1">
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}

function getStatusBadgeColor(status: string) {
  switch (status) {
    case "PENDING_PAYMENT":
      return "badge-warning";
    case "PENDING_CONFIRMATION":
      return "badge-info";
    case "PROCESSING":
      return "badge-info";
    case "SHIPPED":
      return "badge-primary";
    case "CONFIRMED":
      return "badge-success";
    case "CANCELLED":
      return "badge-error";
    default:
      return "badge-neutral";
  }
}