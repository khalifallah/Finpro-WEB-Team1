"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import AuthGuard from "@/components/AuthGuard";
import { axiosInstance } from "@/libs/axios/axios.config";
import Link from "next/link";
import {
  formatPrice,
  formatDate,
  getStatusBadgeColor,
  formatInvoiceId,
} from "@/utils/format";

export default function OrdersPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State untuk Tab Filter Status
  const [activeStatus, setActiveStatus] = useState("all");

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  // Mapping Status untuk Tab
  const statusTabs = [
    { label: "All", value: "all" },
    { label: "Pending Payment", value: "PENDING_PAYMENT" },
    { label: "Pending Confirmation", value: "PENDING_CONFIRMATION" },
    { label: "Processing", value: "PROCESSING" },
    { label: "Shipped", value: "SHIPPED" },
    { label: "Completed", value: "CONFIRMED" },
    { label: "Cancelled", value: "CANCELLED" },
  ];

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user, pagination.page, activeStatus]); // Fetch ulang saat tab/page ganti

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axiosInstance.get("/orders", {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          status: activeStatus, // Kirim status yang dipilih user
        },
      });

      setOrders(response.data.data.orders);
      setPagination(response.data.data.pagination);
    } catch (err: any) {
      // Jika error 404 (No orders found) saat filter, kosongkan list saja jangan error merah
      if (err.response?.status === 404) {
        setOrders([]);
        setPagination((prev) => ({ ...prev, total: 0, pages: 0 }));
      } else {
        setError(err.response?.data?.message || "Failed to load orders");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading && pagination.page === 1) {
    // Loading full screen hanya saat first load
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
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">My Orders</h1>

        {/* --- 1. STATUS TABS (Scrollable di Mobile) --- */}
        <div className="tabs tabs-boxed bg-base-200 mb-6 overflow-x-auto flex-nowrap whitespace-nowrap">
          {statusTabs.map((tab) => (
            <a
              key={tab.value}
              className={`tab px-4 ${
                activeStatus === tab.value ? "tab-active" : ""
              }`}
              onClick={() => {
                setActiveStatus(tab.value);
                setPagination((prev) => ({ ...prev, page: 1 })); // Reset ke page 1
              }}
            >
              {tab.label}
            </a>
          ))}
        </div>

        {error && (
          <div className="alert alert-error mb-6 rounded-lg">
            <span>{error}</span>
          </div>
        )}

        {/* --- 2. ORDER LIST --- */}
        {orders.length === 0 ? (
          <div className="text-center py-16 bg-base-100 rounded-xl border border-base-200 shadow-sm">
            <div className="w-20 h-20 bg-base-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold mb-1">No orders found</h3>
            <p className="text-gray-500 mb-6 text-sm">
              {activeStatus === "all"
                ? "Start shopping to create your first order!"
                : `No orders in ${activeStatus.toLowerCase()} status.`}
            </p>
            {activeStatus === "all" && (
              <Link href="/" className="btn btn-primary btn-wide">
                Start Shopping
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="card bg-base-100 shadow-sm border border-base-200 hover:shadow-md transition-shadow"
              >
                <div className="card-body p-5">
                  {/* Card Header: ID, Date, Status */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-base-200 pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg">
                        Order {formatInvoiceId(order.id, order.createdAt)}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </span>
                    </div>
                    <div
                      className={`badge ${getStatusBadgeColor(
                        order.status
                      )} font-medium`}
                    >
                      {order.status.replace(/_/g, " ")}
                    </div>
                  </div>

                  {/* Card Body: Items & Store */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Left: Product Preview */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="avatar placeholder">
                          <div className="bg-neutral text-neutral-content rounded w-12">
                            {order.orderItems?.[0]?.product?.productImages?.[0]
                              ?.imageUrl ? (
                              <img
                                src={
                                  order.orderItems[0].product.productImages[0]
                                    .imageUrl
                                }
                                alt="Product"
                              />
                            ) : (
                              <span className="text-xs">IMG</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="font-medium text-sm line-clamp-1">
                            {order.orderItems?.[0]?.productNameSnapshot}
                          </p>
                          {order.orderItems.length > 1 && (
                            <p className="text-xs text-gray-500">
                              +{order.orderItems.length - 1} other products
                            </p>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 001-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {order.store?.name}
                      </p>
                    </div>

                    {/* Right: Total & Action */}
                    <div className="flex flex-row sm:flex-col justify-between sm:items-end gap-2 sm:min-w-[120px]">
                      <div className="text-left sm:text-right">
                        <p className="text-xs text-gray-500">Total Amount</p>
                        <p className="font-bold text-primary">
                          {formatPrice(order.totalAmount)}
                        </p>
                      </div>
                      <Link
                        href={`/orders/${order.id}`}
                        className="btn btn-sm btn-outline"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- 3. PAGINATION --- */}
        {pagination.pages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="join">
              <button
                className="join-item btn btn-sm"
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    page: Math.max(1, prev.page - 1),
                  }))
                }
                disabled={pagination.page === 1}
              >
                «
              </button>
              <button className="join-item btn btn-sm btn-active">
                Page {pagination.page} of {pagination.pages}
              </button>
              <button
                className="join-item btn btn-sm"
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    page: Math.min(pagination.pages, prev.page + 1),
                  }))
                }
                disabled={pagination.page === pagination.pages}
              >
                »
              </button>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
