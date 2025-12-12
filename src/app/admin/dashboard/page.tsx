'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalUsers: number;
  totalStores: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalCategories: 0,
    totalUsers: 0,
    totalStores: 0,
  });
  const [loading, setLoading] = useState(true);

  // Fetch dashboard stats (optional - bisa di-implement nanti)
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // TODO: Implement API call to get dashboard stats - optional nice to have
        // const response = await dashboardService.getStats();
        // setStats(response);
        
        // Placeholder - remove when API ready
        setStats({
          totalProducts: 0,
          totalCategories: 0,
          totalUsers: 0,
          totalStores: 0,
        });
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-6 text-white">
        <h1 className="text-3xl font-bold">
          Welcome, {user?.fullName || 'Admin'}! 👋
        </h1>
        <p className="mt-2 opacity-90">
          {isSuperAdmin 
            ? 'You have super admin access.' 
            : `You are managing store operations. Some features are read-only.`}
        </p>
        <div className="mt-4 flex items-center gap-2">
          <span className={`badge ${isSuperAdmin ? 'badge-warning' : 'badge-info'} badge-lg`}>
            {user?.role === 'SUPER_ADMIN' ? '👑 Super Admin' : '🏪 Store Admin'}
          </span>
          {user?.store && (
            <span className="badge badge-outline badge-lg text-white border-white">
              📍 {user.store.name}
            </span>
          )}
        </div>
      </div>

      {/* Role-based Notice */}
      {!isSuperAdmin && (
        <div className="alert alert-info shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <div>
            <h3 className="font-bold">Store Admin Access</h3>
            <p className="text-sm">
              Product and Category management is read-only. Stock and Discount management is available for your store.
            </p>
          </div>
        </div>
      )}

      {/* Feature Overview */}
      <div>
        <h2 className="text-xl font-bold mb-4 text-black">Feature Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Management Card */}
          <div className="card bg-white shadow-md text-black">
            <div className="card-body">
              <h3 className="card-title">
                📦 Product Management
                {!isSuperAdmin && <span className="badge badge-ghost ml-2">Read Only</span>}
              </h3>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 mt-2">
                <li>View product catalog</li>
                <li>Search products</li>
                {isSuperAdmin && (
                  <>
                    <li>Create, update, delete products</li>
                    <li>Upload multiple product images</li>
                    <li>Manage product categories</li>
                  </>
                )}
              </ul>
              <div className="card-actions justify-end mt-4">
                <Link href="/admin/products" className="btn btn-primary btn-sm">
                  View Products
                </Link>
                <Link href="/admin/categories" className="btn btn-outline btn-sm text-blue-500">
                  View Categories
                </Link>
              </div>
            </div>
          </div>

          {/* Inventory Management Card */}
          <div className="card bg-white shadow-md text-black">
            <div className="card-body">
              <h3 className="card-title">📈 Inventory Management</h3>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 mt-2">
                <li>Manage stock per store</li>
                <li>Create stock journals (add/reduce)</li>
                <li>View stock history</li>
                {isSuperAdmin && <li>Manage stock across all stores</li>}
              </ul>
              <div className="card-actions justify-end mt-4">
                <Link href="/admin/stocks" className="btn btn-primary btn-sm">
                  Manage Stock
                </Link>
              </div>
            </div>
          </div>

          {/* ===================== Hide Discount Card for SUPER_ADMIN ===================== */}
          {/* Discount Management Card - STORE_ADMIN ONLY */}
          {!isSuperAdmin && (
            <div className="card bg-white shadow-md">
              <div className="card-body text-black">
                <h3 className="card-title">🎁 Discount Management</h3>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 mt-2">
                  <li>Create product discounts</li>
                  <li>Set minimum purchase discounts</li>
                  <li>Buy One Get One (BOGO) offers</li>
                  <li>Percentage or fixed amount discounts</li>
                </ul>
                <div className="card-actions justify-end mt-4">
                  <Link href="/admin/discounts" className="btn btn-primary btn-sm">
                    Manage Discounts
                  </Link>
                </div>
              </div>
            </div>
          )}
          {/* ================================================================================= */}

          {/* Reports Card */}
          <div className="card bg-white shadow-md">
            <div className="card-body">
              <h3 className="card-title text-black">📊 Reports & Analysis</h3>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 mt-2">
                <li>Monthly sales report</li>
                <li>Sales by category/product</li>
                <li>Stock movement history</li>
                {isSuperAdmin && <li>Filter by store</li>}
              </ul>
              <div className="card-actions justify-end mt-4">
                <Link href="/admin/reports" className="btn btn-primary btn-sm">
                  Reports
                </Link>
              </div>
            </div>
          </div>

          {/* User Management Card - Super Admin Only */}
          {isSuperAdmin && (
            <div className="card bg-white shadow-md md:col-span-2">
              <div className="card-body text-black">
                <h3 className="card-title">
                  👥 User Management
                  <span className="badge badge-warning ml-2">Super Admin Only</span>
                </h3>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 mt-2">
                  <li>View all registered users</li>
                  <li>Create, update, delete store admin accounts</li>
                  <li>Assign store admins to stores</li>
                </ul>
                <div className="card-actions justify-end mt-4">
                  <Link href="/admin/users" className="btn btn-primary btn-sm">
                    Manage Users
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Access Summary Table */}
      <div className="card bg-white shadow-md text-black">
        <div className="card-body">
          <h3 className="card-title mb-4">🔐 Your Access Permissions</h3>
          <div className="overflow-x-auto">
            <table className="table">
              {/* Header */}
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="text-white font-semibold">Feature</th>
                  <th className="text-white font-semibold text-center">View</th>
                  <th className="text-white font-semibold text-center">Create</th>
                  <th className="text-white font-semibold text-center">Update</th>
                  <th className="text-white font-semibold text-center">Delete</th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-gray-50">
                  <td className="font-medium">Products</td>
                  <td className="text-center text-green-500 text-lg">✅</td>
                  <td className="text-center text-lg">{isSuperAdmin ? <span className="text-green-500">✅</span> : <span className="text-red-500">❌</span>}</td>
                  <td className="text-center text-lg">{isSuperAdmin ? <span className="text-green-500">✅</span> : <span className="text-red-500">❌</span>}</td>
                  <td className="text-center text-lg">{isSuperAdmin ? <span className="text-green-500">✅</span> : <span className="text-red-500">❌</span>}</td>
                </tr>
                <tr className="hover:bg-gray-50 bg-gray-100">
                  <td className="font-medium">Categories</td>
                  <td className="text-center text-green-500 text-lg">✅</td>
                  <td className="text-center text-lg">{isSuperAdmin ? <span className="text-green-500">✅</span> : <span className="text-red-500">❌</span>}</td>
                  <td className="text-center text-lg">{isSuperAdmin ? <span className="text-green-500">✅</span> : <span className="text-red-500">❌</span>}</td>
                  <td className="text-center text-lg">{isSuperAdmin ? <span className="text-green-500">✅</span> : <span className="text-red-500">❌</span>}</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="font-medium">Stock</td>
                  <td className="text-center text-green-500 text-lg">✅</td>
                  <td className="text-center text-green-500 text-lg">✅</td>
                  <td className="text-center text-green-500 text-lg">✅</td>
                  <td className="text-center text-green-500 text-lg">✅</td>
                </tr>
                {/* ===================== Discount - SUPER_ADMIN = All ❌ ===================== */}
                <tr className="hover:bg-gray-50 bg-gray-100">
                  <td className="font-medium">Discounts</td>
                  <td className="text-center text-lg">{isSuperAdmin ? <span className="text-red-500">❌</span> : <span className="text-green-500">✅</span>}</td>
                  <td className="text-center text-lg">{isSuperAdmin ? <span className="text-red-500">❌</span> : <span className="text-green-500">✅</span>}</td>
                  <td className="text-center text-lg">{isSuperAdmin ? <span className="text-red-500">❌</span> : <span className="text-green-500">✅</span>}</td>
                  <td className="text-center text-lg">{isSuperAdmin ? <span className="text-red-500">❌</span> : <span className="text-green-500">✅</span>}</td>
                </tr>
                {/* ============================================================================ */}
                <tr className="hover:bg-gray-50">
                  <td className="font-medium">
                    Sales Report
                    {!isSuperAdmin && <span className="ml-2 text-xs text-gray-500">(Own Store)</span>}
                  </td>
                  <td className="text-center text-green-500 text-lg">✅</td>
                  <td className="text-center text-gray-400">-</td>
                  <td className="text-center text-gray-400">-</td>
                  <td className="text-center text-gray-400">-</td>
                </tr>
                <tr className="hover:bg-gray-50 bg-gray-100">
                  <td className="font-medium">
                    Stock Report
                    {!isSuperAdmin && <span className="ml-2 text-xs text-gray-500">(Own Store)</span>}
                  </td>
                  <td className="text-center text-green-500 text-lg">✅</td>
                  <td className="text-center text-gray-400">-</td>
                  <td className="text-center text-gray-400">-</td>
                  <td className="text-center text-gray-400">-</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="font-medium">User Management</td>
                  <td className="text-center text-lg">{isSuperAdmin ? <span className="text-green-500">✅</span> : <span className="text-red-500">❌</span>}</td>
                  <td className="text-center text-lg">{isSuperAdmin ? <span className="text-green-500">✅</span> : <span className="text-red-500">❌</span>}</td>
                  <td className="text-center text-lg">{isSuperAdmin ? <span className="text-green-500">✅</span> : <span className="text-red-500">❌</span>}</td>
                  <td className="text-center text-lg">{isSuperAdmin ? <span className="text-green-500">✅</span> : <span className="text-red-500">❌</span>}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}