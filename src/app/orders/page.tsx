"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import AuthGuard from "@/components/AuthGuard";
import { axiosInstance } from "@/libs/axios/axios.config";
import Link from "next/link";

export default function OrdersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user, pagination.page]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/orders", {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          status: "all"
        }
      });
      setOrders(response.data.data.orders);
      setPagination(response.data.data.pagination);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load orders");
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
      year: "numeric",
      month: "short",
      day: "numeric",
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
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>

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

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="w-24 h-24 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              ></path>
            </svg>
            <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
            <p className="text-gray-500 mb-6">
              Start shopping to see your orders here
            </p>
            <Link href="/" className="btn btn-primary">
              Start Shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="card bg-base-100 shadow-xl">
                  <div className="card-body">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-4 mb-2">
                          <h2 className="card-title">Order #{order.id}</h2>
                          <span className={`badge ${getStatusBadgeColor(order.status)}`}>
                            {order.status.replace("_", " ")}
                          </span>
                        </div>
                        <p className="text-gray-600">
                          {formatDate(order.createdAt)}
                        </p>
                        <p className="text-sm text-gray-500">
                          Store: {order.store?.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">
                          {formatPrice(order.totalAmount)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {order.orderItems.length} items
                        </p>
                      </div>
                    </div>

                    <div className="divider my-2"></div>

                    <div className="flex justify-between items-center">
                      <div>
                        {order.orderItems.slice(0, 2).map((item: any, index: number) => (
                          <div key={item.id} className="flex items-center gap-2 mb-1">
                            {item.product?.productImages?.[0]?.imageUrl && (
                              <div className="w-8 h-8 rounded overflow-hidden">
                                <img
                                  src={item.product.productImages[0].imageUrl}
                                  alt={item.productNameSnapshot}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <span className="text-sm">
                              {item.productNameSnapshot} × {item.quantity}
                            </span>
                          </div>
                        ))}
                        {order.orderItems.length > 2 && (
                          <p className="text-sm text-gray-500">
                            +{order.orderItems.length - 2} more items
                          </p>
                        )}
                      </div>

                      <Link
                        href={`/orders/${order.id}`}
                        className="btn btn-outline btn-sm"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="join">
                  <button
                    className="join-item btn"
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
                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                    let pageNum = i + 1;
                    if (pagination.pages > 5) {
                      if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page >= pagination.pages - 2) {
                        pageNum = pagination.pages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }
                    }
                    return (
                      <button
                        key={pageNum}
                        className={`join-item btn ${
                          pagination.page === pageNum ? "btn-active" : ""
                        }`}
                        onClick={() =>
                          setPagination((prev) => ({ ...prev, page: pageNum }))
                        }
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    className="join-item btn"
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
          </>
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