"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { axiosInstance } from "@/libs/axios/axios.config";
import { useAuth } from "@/contexts/AuthContext";
import { formatInvoiceId } from "@/utils/format";

// --- Helper Functions Manual (Biar warna pas sama admin panel) ---
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
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case "PENDING_PAYMENT":
      return "bg-yellow-100 text-yellow-800 border border-yellow-200"; // Kuning Soft
    case "PENDING_CONFIRMATION":
      return "bg-blue-100 text-blue-800 border border-blue-200"; // Biru Soft
    case "PROCESSING":
      return "bg-purple-100 text-purple-800 border border-purple-200"; // Ungu (sesuai tema)
    case "SHIPPED":
      return "bg-indigo-100 text-indigo-800 border border-indigo-200";
    case "CONFIRMED":
      return "bg-green-100 text-green-800 border border-green-200"; // Hijau Sukses
    case "CANCELLED":
      return "bg-red-100 text-red-800 border border-red-200"; // Merah Error
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Interface Data
interface Order {
  id: number;
  createdAt: string;
  status: string;
  totalAmount: number;
  user: {
    fullName: string;
    email: string;
  };
  store: {
    name: string;
  };
}

export default function AdminOrdersPage() {
  const { user } = useAuth();

  // State
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const tabs = [
    { label: "All", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Processing", value: "PROCESSING" },
    { label: "Shipped", value: "SHIPPED" },
    { label: "Done", value: "CONFIRMED" },
    { label: "Cancelled", value: "CANCELLED" },
  ];

  // src/app/admin/orders/page.tsx

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/orders/admin/all", {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          status: statusFilter,
          search: search,
        },
      });

      const { orders, pagination: pagingData } = response.data.data;

      setOrders(orders);
      setPagination({
        page: pagingData.page,
        limit: pagingData.limit,
        total: pagingData.total,

        // [FIX] Gunakan 'pages' (dari API) bukan 'totalPages'
        totalPages: pagingData.pages,
      });
    } catch (error) {
      console.error("Failed to fetch admin orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders();
    }, 500);
    return () => clearTimeout(timer);
  }, [pagination.page, statusFilter, search]);

  const handleTabChange = (val: string) => {
    setStatusFilter(val);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Search (Sudah Responsive) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Order Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all store orders</p>
        </div>
        <div className="w-full sm:w-auto relative">
          <input
            type="text"
            placeholder="Search Order ID..."
            className="input input-bordered w-full sm:w-64 bg-gray-50 pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <svg
            className="h-5 w-5 text-gray-400 absolute left-3 top-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* 2. Tabs (Sudah Scrollable) */}
      <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <div className="flex space-x-2 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleTabChange(tab.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === tab.value
                  ? "bg-primary text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. CONTENT AREA */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* A. DESKTOP TABLE VIEW (Hidden on Mobile) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                  Order ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                  Customer
                </th>
                {user?.role === "SUPER_ADMIN" && (
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                    Store
                  </th>
                )}
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                  Total
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td
                      colSpan={7}
                      className="h-16 bg-gray-50 animate-pulse"
                    ></td>
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono font-bold text-primary">
                      {formatInvoiceId(order.id, order.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-600">
                      {order.user?.fullName}
                    </td>
                    {user?.role === "SUPER_ADMIN" && (
                      <td className="px-6 py-4">
                        <span className="badge badge-ghost badge-sm">
                          {order.store?.name}
                        </span>
                      </td>
                    )}
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">
                      {formatPrice(order.totalAmount)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold border ${getStatusBadgeClass(
                          order.status
                        )}`}
                      >
                        {order.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="btn btn-xs btn-outline btn-primary"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* B. MOBILE CARD VIEW (Visible on Mobile Only) */}
        <div className="md:hidden divide-y divide-gray-100">
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-32 bg-gray-50 animate-pulse m-4 rounded-lg"
              ></div>
            ))
          ) : orders.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No orders found
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono font-bold text-primary text-lg">
                      #{order.id}
                    </span>
                    <p className="text-xs text-gray-500">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-[10px] font-bold border ${getStatusBadgeClass(
                      order.status
                    )}`}
                  >
                    {order.status.replace(/_/g, " ")}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <div className="flex flex-col">
                    <span className="text-gray-500 text-xs">Customer</span>
                    <span className="font-medium text-gray-900">
                      {order.user?.fullName}
                    </span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-gray-500 text-xs">Total</span>
                    <span className="font-bold text-gray-900">
                      {formatPrice(order.totalAmount)}
                    </span>
                  </div>
                </div>

                {user?.role === "SUPER_ADMIN" && (
                  <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                    Store: {order.store?.name}
                  </div>
                )}

                <Link
                  href={`/admin/orders/${order.id}`}
                  className="btn btn-sm btn-primary w-full"
                >
                  Manage Order
                </Link>
              </div>
            ))
          )}
        </div>

        {/* 4. Pagination */}
        {!loading && orders.length > 0 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <span className="text-xs sm:text-sm text-gray-500">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <div className="flex gap-2">
              <button
                className="btn btn-xs sm:btn-sm btn-outline"
                disabled={pagination.page === 1}
                onClick={() =>
                  setPagination((p) => ({ ...p, page: p.page - 1 }))
                }
              >
                Prev
              </button>
              <button
                className="btn btn-xs sm:btn-sm btn-outline"
                disabled={pagination.page === pagination.totalPages}
                onClick={() =>
                  setPagination((p) => ({ ...p, page: p.page + 1 }))
                }
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
