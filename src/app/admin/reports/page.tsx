'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface Store {
  id: number;
  name: string;
}

interface SalesReportData {
  month: string;
  totalSales: number;
  totalOrders: number;
  totalRevenue: number;
}

interface SalesByCategoryData {
  category: string;
  totalSales: number;
  totalRevenue: number;
}

interface SalesByProductData {
  productName: string;
  totalSales: number;
  totalRevenue: number;
}

interface StockSummaryData {
  productName: string;
  totalIn: number;
  totalOut: number;
  currentStock: number;
}

interface StockDetailData {
  date: string;
  productName: string;
  change: number;
  reason: string;
  type: 'IN' | 'OUT';
}

type ReportType = 'sales' | 'stock';
type SalesTab = 'monthly' | 'byCategory' | 'byProduct';
type StockTab = 'summary' | 'detail';

export default function ReportsPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const userStoreId = user?.storeId;

  const [reportType, setReportType] = useState<ReportType>('sales');
  const [salesTab, setSalesTab] = useState<SalesTab>('monthly');
  const [stockTab, setStockTab] = useState<StockTab>('summary');
  
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<number | null>(
    isSuperAdmin ? null : userStoreId || null
  );
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const [loading, setLoading] = useState(false);

  // Sales Report Data
  const [salesMonthly, setSalesMonthly] = useState<SalesReportData[]>([]);
  const [salesByCategory, setSalesByCategory] = useState<SalesByCategoryData[]>([]);
  const [salesByProduct, setSalesByProduct] = useState<SalesByProductData[]>([]);

  // Stock Report Data
  const [stockSummary, setStockSummary] = useState<StockSummaryData[]>([]);
  const [stockDetail, setStockDetail] = useState<StockDetailData[]>([]);

  // Fetch stores
  const fetchStores = async () => {
    if (!isSuperAdmin) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stores`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setStores(data.stores || data || []);
    } catch (error) {
      console.error('Failed to fetch stores:', error);
    }
  };

  // Fetch Sales Report - Monthly
  const fetchSalesMonthly = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      
      const storeIdToUse = selectedStore || userStoreId;
      if (storeIdToUse) params.append('storeId', String(storeIdToUse));
      params.append('year', selectedMonth.split('-')[0]);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/reports/sales/monthly?${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.ok) {
        const data = await response.json();
        setSalesMonthly(data.data || data || []);
      } else {
        // Mock data for demo
        setSalesMonthly([
          { month: 'January', totalSales: 150, totalOrders: 45, totalRevenue: 15000000 },
          { month: 'February', totalSales: 180, totalOrders: 52, totalRevenue: 18500000 },
          { month: 'March', totalSales: 200, totalOrders: 60, totalRevenue: 22000000 },
          { month: 'April', totalSales: 175, totalOrders: 48, totalRevenue: 17500000 },
          { month: 'May', totalSales: 220, totalOrders: 65, totalRevenue: 25000000 },
          { month: 'June', totalSales: 195, totalOrders: 55, totalRevenue: 20000000 },
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch sales monthly:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Sales Report - By Category
  const fetchSalesByCategory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      
      const storeIdToUse = selectedStore || userStoreId;
      if (storeIdToUse) params.append('storeId', String(storeIdToUse));
      params.append('month', selectedMonth);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/reports/sales/by-category?${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.ok) {
        const data = await response.json();
        setSalesByCategory(data.data || data || []);
      } else {
        // Mock data for demo
        setSalesByCategory([
          { category: 'Groceries', totalSales: 450, totalRevenue: 45000000 },
          { category: 'Beverages', totalSales: 320, totalRevenue: 28000000 },
          { category: 'Snacks', totalSales: 280, totalRevenue: 15000000 },
          { category: 'Dairy', totalSales: 200, totalRevenue: 22000000 },
          { category: 'Bakery', totalSales: 150, totalRevenue: 12000000 },
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch sales by category:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Sales Report - By Product
  const fetchSalesByProduct = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      
      const storeIdToUse = selectedStore || userStoreId;
      if (storeIdToUse) params.append('storeId', String(storeIdToUse));
      params.append('month', selectedMonth);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/reports/sales/by-product?${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.ok) {
        const data = await response.json();
        setSalesByProduct(data.data || data || []);
      } else {
        // Mock data for demo
        setSalesByProduct([
          { productName: 'Organic Eggs', totalSales: 120, totalRevenue: 3600000 },
          { productName: 'Fresh Milk', totalSales: 100, totalRevenue: 2500000 },
          { productName: 'Whole Wheat Bread', totalSales: 85, totalRevenue: 1700000 },
          { productName: 'Basmati Rice', totalSales: 75, totalRevenue: 3750000 },
          { productName: 'Orange Juice', totalSales: 60, totalRevenue: 1800000 },
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch sales by product:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Stock Report - Summary
  const fetchStockSummary = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      
      const storeIdToUse = selectedStore || userStoreId;
      if (storeIdToUse) params.append('storeId', String(storeIdToUse));
      params.append('month', selectedMonth);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/reports/stock/summary?${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.ok) {
        const data = await response.json();
        setStockSummary(data.data || data || []);
      } else {
        // Mock data for demo
        setStockSummary([
          { productName: 'Organic Eggs', totalIn: 500, totalOut: 380, currentStock: 120 },
          { productName: 'Fresh Milk', totalIn: 400, totalOut: 350, currentStock: 50 },
          { productName: 'Whole Wheat Bread', totalIn: 300, totalOut: 280, currentStock: 20 },
          { productName: 'Basmati Rice', totalIn: 200, totalOut: 150, currentStock: 50 },
          { productName: 'Orange Juice', totalIn: 250, totalOut: 200, currentStock: 50 },
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch stock summary:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Stock Report - Detail
  const fetchStockDetail = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      
      const storeIdToUse = selectedStore || userStoreId;
      if (storeIdToUse) params.append('storeId', String(storeIdToUse));
      params.append('month', selectedMonth);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/reports/stock/detail?${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.ok) {
        const data = await response.json();
        setStockDetail(data.data || data || []);
      } else {
        // Mock data for demo
        setStockDetail([
          { date: '2024-12-01', productName: 'Organic Eggs', change: 100, reason: 'Restocking', type: 'IN' },
          { date: '2024-12-02', productName: 'Organic Eggs', change: -20, reason: 'Sold', type: 'OUT' },
          { date: '2024-12-03', productName: 'Fresh Milk', change: 50, reason: 'Restocking', type: 'IN' },
          { date: '2024-12-04', productName: 'Fresh Milk', change: -15, reason: 'Sold', type: 'OUT' },
          { date: '2024-12-05', productName: 'Basmati Rice', change: 30, reason: 'Restocking', type: 'IN' },
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch stock detail:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [isSuperAdmin]);

  useEffect(() => {
    if (reportType === 'sales') {
      if (salesTab === 'monthly') fetchSalesMonthly();
      else if (salesTab === 'byCategory') fetchSalesByCategory();
      else if (salesTab === 'byProduct') fetchSalesByProduct();
    } else {
      if (stockTab === 'summary') fetchStockSummary();
      else if (stockTab === 'detail') fetchStockDetail();
    }
  }, [reportType, salesTab, stockTab, selectedStore, selectedMonth]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Reports & Analysis</h1>
        <p className="text-gray-600 mt-1">
          {isSuperAdmin
            ? 'View reports for all stores'
            : 'View reports for your store'}
        </p>
      </div>

      {/* Report Type Tabs */}
      <div className="tabs tabs-boxed bg-white p-1 w-fit">
        <button
          className={`tab tab-lg ${reportType === 'sales' ? 'tab-active' : ''}`}
          onClick={() => setReportType('sales')}
        >
          💰 Sales Report
        </button>
        <button
          className={`tab tab-lg ${reportType === 'stock' ? 'tab-active' : ''}`}
          onClick={() => setReportType('stock')}
        >
          📊 Stock Report
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow flex flex-wrap gap-4">
        {/* Store Filter (Super Admin only) */}
        {isSuperAdmin && (
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Store</span>
            </label>
            <select
              value={selectedStore || ''}
              onChange={(e) =>
                setSelectedStore(e.target.value ? parseInt(e.target.value) : null)
              }
              className="select select-bordered"
            >
              <option value="">All Stores</option>
              {stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Month Filter */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">Month</span>
          </label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="input input-bordered"
          />
        </div>
      </div>

      {/* Sales Report Content */}
      {reportType === 'sales' && (
        <div className="space-y-4">
          {/* Sales Tabs */}
          <div className="tabs tabs-bordered">
            <button
              className={`tab ${salesTab === 'monthly' ? 'tab-active' : ''}`}
              onClick={() => setSalesTab('monthly')}
            >
              📅 Monthly
            </button>
            <button
              className={`tab ${salesTab === 'byCategory' ? 'tab-active' : ''}`}
              onClick={() => setSalesTab('byCategory')}
            >
              🏷️ By Category
            </button>
            <button
              className={`tab ${salesTab === 'byProduct' ? 'tab-active' : ''}`}
              onClick={() => setSalesTab('byProduct')}
            >
              📦 By Product
            </button>
          </div>

          {/* Sales Tables */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                {salesTab === 'monthly' && (
                  <table className="table">
                    <thead className="bg-gray-800 text-white">
                      <tr>
                        <th>Month</th>
                        <th className="text-right">Total Orders</th>
                        <th className="text-right">Items Sold</th>
                        <th className="text-right">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesMonthly.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="text-center py-10 text-gray-500">
                            No data available
                          </td>
                        </tr>
                      ) : (
                        salesMonthly.map((row, index) => (
                          <tr key={index} className="hover">
                            <td className="font-semibold">{row.month}</td>
                            <td className="text-right">{row.totalOrders}</td>
                            <td className="text-right">{row.totalSales}</td>
                            <td className="text-right font-semibold text-primary">
                              {formatCurrency(row.totalRevenue)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    {salesMonthly.length > 0 && (
                      <tfoot className="bg-gray-100">
                        <tr>
                          <td className="font-bold">Total</td>
                          <td className="text-right font-bold">
                            {salesMonthly.reduce((sum, r) => sum + r.totalOrders, 0)}
                          </td>
                          <td className="text-right font-bold">
                            {salesMonthly.reduce((sum, r) => sum + r.totalSales, 0)}
                          </td>
                          <td className="text-right font-bold text-primary">
                            {formatCurrency(salesMonthly.reduce((sum, r) => sum + r.totalRevenue, 0))}
                          </td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                )}

                {salesTab === 'byCategory' && (
                  <table className="table">
                    <thead className="bg-gray-800 text-white">
                      <tr>
                        <th>Category</th>
                        <th className="text-right">Items Sold</th>
                        <th className="text-right">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesByCategory.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="text-center py-10 text-gray-500">
                            No data available
                          </td>
                        </tr>
                      ) : (
                        salesByCategory.map((row, index) => (
                          <tr key={index} className="hover">
                            <td className="font-semibold">{row.category}</td>
                            <td className="text-right">{row.totalSales}</td>
                            <td className="text-right font-semibold text-primary">
                              {formatCurrency(row.totalRevenue)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}

                {salesTab === 'byProduct' && (
                  <table className="table">
                    <thead className="bg-gray-800 text-white">
                      <tr>
                        <th>Product</th>
                        <th className="text-right">Items Sold</th>
                        <th className="text-right">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesByProduct.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="text-center py-10 text-gray-500">
                            No data available
                          </td>
                        </tr>
                      ) : (
                        salesByProduct.map((row, index) => (
                          <tr key={index} className="hover">
                            <td className="font-semibold">{row.productName}</td>
                            <td className="text-right">{row.totalSales}</td>
                            <td className="text-right font-semibold text-primary">
                              {formatCurrency(row.totalRevenue)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stock Report Content */}
      {reportType === 'stock' && (
        <div className="space-y-4">
          {/* Stock Tabs */}
          <div className="tabs tabs-bordered">
            <button
              className={`tab ${stockTab === 'summary' ? 'tab-active' : ''}`}
              onClick={() => setStockTab('summary')}
            >
              📋 Summary
            </button>
            <button
              className={`tab ${stockTab === 'detail' ? 'tab-active' : ''}`}
              onClick={() => setStockTab('detail')}
            >
              📝 Detail History
            </button>
          </div>

          {/* Stock Tables */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                {stockTab === 'summary' && (
                  <table className="table">
                    <thead className="bg-gray-800 text-white">
                      <tr>
                        <th>Product</th>
                        <th className="text-right">Total In (+)</th>
                        <th className="text-right">Total Out (-)</th>
                        <th className="text-right">Current Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stockSummary.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="text-center py-10 text-gray-500">
                            No data available
                          </td>
                        </tr>
                      ) : (
                        stockSummary.map((row, index) => (
                          <tr key={index} className="hover">
                            <td className="font-semibold">{row.productName}</td>
                            <td className="text-right text-success">+{row.totalIn}</td>
                            <td className="text-right text-error">-{row.totalOut}</td>
                            <td className="text-right">
                              <span className={`badge ${
                                row.currentStock > 20 ? 'badge-success' : 
                                row.currentStock > 0 ? 'badge-warning' : 'badge-error'
                              }`}>
                                {row.currentStock} units
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}

                {stockTab === 'detail' && (
                  <table className="table">
                    <thead className="bg-gray-800 text-white">
                      <tr>
                        <th>Date</th>
                        <th>Product</th>
                        <th className="text-right">Change</th>
                        <th>Reason</th>
                        <th className="text-center">Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stockDetail.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-10 text-gray-500">
                            No data available
                          </td>
                        </tr>
                      ) : (
                        stockDetail.map((row, index) => (
                          <tr key={index} className="hover">
                            <td>{new Date(row.date).toLocaleDateString('id-ID')}</td>
                            <td className="font-semibold">{row.productName}</td>
                            <td className={`text-right font-semibold ${
                              row.change > 0 ? 'text-success' : 'text-error'
                            }`}>
                              {row.change > 0 ? '+' : ''}{row.change}
                            </td>
                            <td>{row.reason}</td>
                            <td className="text-center">
                              <span className={`badge ${
                                row.type === 'IN' ? 'badge-success' : 'badge-error'
                              }`}>
                                {row.type}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}