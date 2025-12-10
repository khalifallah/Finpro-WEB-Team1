'use client';

import { useEffect, useState, useCallback } from 'react';
import ReportTable, { ReportTableColumn } from '@/components/admin/reports/ReportTable'; // Import langsung dari file
import { useAuth } from '@/contexts/AuthContext';
import {
  MonthlySalesReport,
  SalesByCategoryReport,
  SalesByProductReport,
  StockSummaryReport,
  StockDetailReport,
} from '@/types/report.types';

interface Store { id: number; name: string; }

type ReportType = 'sales' | 'stock';
type SalesTab = 'monthly' | 'byCategory' | 'byProduct';
type StockTab = 'summary' | 'detail';

export default function ReportsPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const userStoreId = user?.store?.id;

  const [reportType, setReportType] = useState<ReportType>('sales');
  const [salesTab, setSalesTab] = useState<SalesTab>('monthly');
  const [stockTab, setStockTab] = useState<StockTab>('summary');
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<number | null>(isSuperAdmin ? null : userStoreId || null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [loading, setLoading] = useState(false);

  const [salesMonthly, setSalesMonthly] = useState<MonthlySalesReport[]>([]);
  const [salesByCategory, setSalesByCategory] = useState<SalesByCategoryReport[]>([]);
  const [salesByProduct, setSalesByProduct] = useState<SalesByProductReport[]>([]);
  const [stockSummary, setStockSummary] = useState<StockSummaryReport[]>([]);
  const [stockDetail, setStockDetail] = useState<StockDetailReport[]>([]);

  const getApiUrl = () => process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
  const getAuthHeaders = useCallback(() => ({ Authorization: `Bearer ${localStorage.getItem('token')}` }), []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  const formatMonthYear = (month: number, year: number) => {
    return new Date(year, month - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  };

  // Fetch stores
  const fetchStores = useCallback(async () => {
    if (!isSuperAdmin) return;
    try {
      const response = await fetch(`${getApiUrl()}/stores`, { headers: getAuthHeaders() });
      if (response.ok) {
        const data = await response.json();
        setStores(data.stores || data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch stores:', error);
    }
  }, [isSuperAdmin, getAuthHeaders]);

  // ADD: Parse month string to month & year
  const parseMonth = (monthString: string) => {
    const [year, month] = monthString.split('-');
    return { 
      year: parseInt(year), 
      month: parseInt(month) 
    };
  };

  // FIX: Fetch Sales Monthly
  const fetchSalesMonthly = useCallback(async () => {
    try {
      setLoading(true);
      const { year, month } = parseMonth(selectedMonth);  // FIX: Parse month string
      const params = new URLSearchParams();
      const storeIdToUse = selectedStore || userStoreId;
      if (storeIdToUse) params.append('storeId', String(storeIdToUse));
      params.append('month', String(month));              // FIX: Send as number
      params.append('year', String(year));                // FIX: Send as number

      const response = await fetch(`${getApiUrl()}/reports/sales/monthly?${params}`, { headers: getAuthHeaders() });
      if (response.ok) {
        const data = await response.json();
        console.log('Sales Monthly Response:', data);
        setSalesMonthly(Array.isArray(data.data) ? data.data : []);
      } else {
        setSalesMonthly([]);
      }
    } catch (error) {
      setSalesMonthly([]);
    } finally {
      setLoading(false);
    }
  }, [selectedStore, userStoreId, selectedMonth, getAuthHeaders]);

  // FIX: Fetch Sales By Category
  const fetchSalesByCategory = useCallback(async () => {
    try {
      setLoading(true);
      const { year, month } = parseMonth(selectedMonth);  // FIX: Parse month string
      const params = new URLSearchParams();
      const storeIdToUse = selectedStore || userStoreId;
      if (storeIdToUse) params.append('storeId', String(storeIdToUse));
      params.append('month', String(month));              // FIX: Send as number
      params.append('year', String(year));                // FIX: Send as number

      const response = await fetch(`${getApiUrl()}/reports/sales/by-category?${params}`, { headers: getAuthHeaders() });
      if (response.ok) {
        const data = await response.json();
        setSalesByCategory(Array.isArray(data.data) ? data.data : []);
      } else {
        setSalesByCategory([]);
      }
    } catch (error) {
      console.error('Failed to fetch sales by category:', error);
      setSalesByCategory([]);
    } finally {
      setLoading(false);
    }
  }, [selectedStore, userStoreId, selectedMonth, getAuthHeaders]);

  // FIX: Fetch Sales By Product
  const fetchSalesByProduct = useCallback(async () => {
    try {
      setLoading(true);
      const { year, month } = parseMonth(selectedMonth);  // FIX: Parse month string
      const params = new URLSearchParams();
      const storeIdToUse = selectedStore || userStoreId;
      if (storeIdToUse) params.append('storeId', String(storeIdToUse));
      params.append('month', String(month));              // FIX: Send as number
      params.append('year', String(year));                // FIX: Send as number

      const response = await fetch(`${getApiUrl()}/reports/sales/by-product?${params}`, { headers: getAuthHeaders() });
      if (response.ok) {
        const data = await response.json();
        setSalesByProduct(Array.isArray(data.data) ? data.data : []);
      } else {
        setSalesByProduct([]);
      }
    } catch (error) {
      console.error('Failed to fetch sales by product:', error);
      setSalesByProduct([]);
    } finally {
      setLoading(false);
    }
  }, [selectedStore, userStoreId, selectedMonth, getAuthHeaders]);

  // FIX: Fetch Stock Summary
  const fetchStockSummary = useCallback(async () => {
    try {
      setLoading(true);
      const { year, month } = parseMonth(selectedMonth);  // FIX: Parse month string
      const params = new URLSearchParams();
      const storeIdToUse = selectedStore || userStoreId;
      if (storeIdToUse) params.append('storeId', String(storeIdToUse));
      params.append('month', String(month));              // FIX: Send as number
      params.append('year', String(year));                // FIX: Send as number

      const response = await fetch(`${getApiUrl()}/reports/stock/summary?${params}`, { headers: getAuthHeaders() });
      if (response.ok) {
        const data = await response.json();
        setStockSummary(Array.isArray(data.data) ? data.data : []);
      } else {
        setStockSummary([]);
      }
    } catch (error) {
      console.error('Failed to fetch stock summary:', error);
      setStockSummary([]);
    } finally {
      setLoading(false);
    }
  }, [selectedStore, userStoreId, selectedMonth, getAuthHeaders]);

  // FIX: Fetch Stock Detail
  const fetchStockDetail = useCallback(async () => {
    try {
      setLoading(true);
      const { year, month } = parseMonth(selectedMonth);  // FIX: Parse month string
      const params = new URLSearchParams();
      const storeIdToUse = selectedStore || userStoreId;
      if (storeIdToUse) params.append('storeId', String(storeIdToUse));
      params.append('month', String(month));              // FIX: Send as number
      params.append('year', String(year));                // FIX: Send as number

      const response = await fetch(`${getApiUrl()}/reports/stock/detail?${params}`, { headers: getAuthHeaders() });
      if (response.ok) {
        const data = await response.json();
        setStockDetail(Array.isArray(data.data) ? data.data : []);
      } else {
        setStockDetail([]);
      }
    } catch (error) {
      setStockDetail([]);
    } finally {
      setLoading(false);
    }
  }, [selectedStore, userStoreId, selectedMonth, getAuthHeaders]);

  useEffect(() => { fetchStores(); }, [fetchStores]);

  useEffect(() => {
    if (reportType === 'sales') {
      if (salesTab === 'monthly') fetchSalesMonthly();
      else if (salesTab === 'byCategory') fetchSalesByCategory();
      else if (salesTab === 'byProduct') fetchSalesByProduct();
    } else {
      if (stockTab === 'summary') fetchStockSummary();
      else if (stockTab === 'detail') fetchStockDetail();
    }
  }, [reportType, salesTab, stockTab, selectedStore, selectedMonth, fetchSalesMonthly, fetchSalesByCategory, fetchSalesByProduct, fetchStockSummary, fetchStockDetail]);

  // Columns - Sales Monthly
  const salesMonthlyColumns: ReportTableColumn<MonthlySalesReport>[] = [
    {
      key: 'month',
      header: 'Month',
      render: (_, item) => <span className="font-semibold text-gray-900">{formatMonthYear(item.month, item.year)}</span>,
    },
    {
      key: 'totalTransactions',
      header: 'Total Orders',
      render: (value) => <span className="text-gray-900 font-medium">{value || 0}</span>,
    },
    {
      key: 'totalSales',
      header: 'Revenue',
      render: (value) => <span className="text-blue-700 font-bold">{formatCurrency(value || 0)}</span>,
    },
  ];

  // Columns - Sales By Category
  const salesCategoryColumns: ReportTableColumn<SalesByCategoryReport>[] = [
    {
      key: 'categoryName',
      header: 'Category',
      render: (value) => <span className="font-semibold text-gray-900">{value}</span>,
    },
    {
      key: 'quantity',
      header: 'Items Sold',
      render: (value) => <span className="text-gray-900 font-medium">{value || 0}</span>,
    },
    {
      key: 'totalSales',
      header: 'Revenue',
      render: (value) => <span className="text-blue-700 font-bold">{formatCurrency(value || 0)}</span>,
    },
  ];

  // Columns - Sales By Product
  const salesProductColumns: ReportTableColumn<SalesByProductReport>[] = [
    {
      key: 'productName',
      header: 'Product Name',
      render: (value) => <span className="font-semibold text-gray-900">{value}</span>,
    },
    {
      key: 'quantity',
      header: 'Items Sold',
      render: (value) => <span className="text-gray-900 font-medium">{value || 0}</span>,
    },
    {
      key: 'totalSales',
      header: 'Revenue',
      render: (value) => <span className="text-blue-700 font-bold">{formatCurrency(value || 0)}</span>,
    },
  ];

  // Columns - Stock Summary
  const stockSummaryColumns: ReportTableColumn<StockSummaryReport>[] = [
    {
      key: 'month',
      header: 'Period',
      render: (_, item) => <span className="font-semibold text-gray-900">{formatMonthYear(item.month, item.year)}</span>,
    },
    {
      key: 'totalAddition',
      header: 'Total In (+)',
      render: (value) => <span className="text-green-700 font-bold">+{value || 0}</span>,
    },
    {
      key: 'totalReduction',
      header: 'Total Out (-)',
      render: (value) => <span className="text-red-700 font-bold">-{value || 0}</span>,
    },
    {
      key: 'finalStock',
      header: 'Final Stock',
      render: (value) => (
        <span className={`px-3 py-1 rounded-full text-sm font-bold text-white ${value > 20 ? 'bg-green-600' : value > 0 ? 'bg-yellow-500' : 'bg-red-600'}`}>
          {value || 0} units
        </span>
      ),
    },
  ];

  // Columns - Stock Detail
  const stockDetailColumns: ReportTableColumn<StockDetailReport>[] = [
    {
      key: 'date',
      header: 'Date',
      render: (value) => <span className="text-gray-900 font-medium">{new Date(value).toLocaleDateString('id-ID')}</span>,
    },
    {
      key: 'productName',
      header: 'Product',
      render: (value) => <span className="font-semibold text-gray-900">{value}</span>,
    },
    {
      key: 'quantity',
      header: 'Quantity',
      render: (value, item) => (
        <span className={`font-bold ${item.type === 'IN' ? 'text-green-700' : 'text-red-700'}`}>
          {item.type === 'IN' ? '+' : '-'}{value || 0}
        </span>
      ),
    },
    {
      key: 'reason',
      header: 'Reason',
      render: (value) => <span className="text-gray-900">{value}</span>,
    },
    {
      key: 'type',
      header: 'Type',
      render: (value) => (
        <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${value === 'IN' ? 'bg-green-600' : 'bg-red-600'}`}>
          {value}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">📊 Reports & Analysis</h1>
        <p className="text-gray-600 mt-1">
          {isSuperAdmin ? 'View reports for all stores' : 'View reports for your store'}
        </p>
      </div>

      {/* Report Type */}
      <div className="flex gap-3">
        <button onClick={() => setReportType('sales')}
          className={`px-5 py-3 rounded-lg font-semibold transition-all ${reportType === 'sales' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white border border-gray-300 text-gray-900 hover:bg-gray-50'}`}>
          💰 Sales Report
        </button>
        <button onClick={() => setReportType('stock')}
          className={`px-5 py-3 rounded-lg font-semibold transition-all ${reportType === 'stock' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white border border-gray-300 text-gray-900 hover:bg-gray-50'}`}>
          📦 Stock Report
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border flex flex-col sm:flex-row gap-4">
        {isSuperAdmin && (
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Store</label>
            <select value={selectedStore || ''} onChange={(e) => setSelectedStore(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white">
              <option value="">All Stores</option>
              {stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        )}
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Month</label>
          <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white" />
        </div>
      </div>

      {/* Sales Report */}
      {reportType === 'sales' && (
        <div className="space-y-4">
          <div className="flex gap-3 border-b">
            <button onClick={() => setSalesTab('monthly')}
              className={`px-4 py-3 font-semibold border-b-2 transition-all ${salesTab === 'monthly' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'}`}>
              📅 Monthly
            </button>
            <button onClick={() => setSalesTab('byCategory')}
              className={`px-4 py-3 font-semibold border-b-2 transition-all ${salesTab === 'byCategory' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'}`}>
              🏷️ By Category
            </button>
            <button onClick={() => setSalesTab('byProduct')}
              className={`px-4 py-3 font-semibold border-b-2 transition-all ${salesTab === 'byProduct' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'}`}>
              📦 By Product
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            {salesTab === 'monthly' && <ReportTable columns={salesMonthlyColumns} data={salesMonthly} loading={loading} emptyMessage="No sales data available" />}
            {salesTab === 'byCategory' && <ReportTable columns={salesCategoryColumns} data={salesByCategory} loading={loading} emptyMessage="No category data available" />}
            {salesTab === 'byProduct' && <ReportTable columns={salesProductColumns} data={salesByProduct} loading={loading} emptyMessage="No product sales data available" />}
          </div>
        </div>
      )}

      {/* Stock Report */}
      {reportType === 'stock' && (
        <div className="space-y-4">
          <div className="flex gap-3 border-b">
            <button onClick={() => setStockTab('summary')}
              className={`px-4 py-3 font-semibold border-b-2 transition-all ${stockTab === 'summary' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'}`}>
              📋 Summary
            </button>
            <button onClick={() => setStockTab('detail')}
              className={`px-4 py-3 font-semibold border-b-2 transition-all ${stockTab === 'detail' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'}`}>
              📝 Detail History
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            {stockTab === 'summary' && <ReportTable columns={stockSummaryColumns} data={stockSummary} loading={loading} emptyMessage="No stock data available" />}
            {stockTab === 'detail' && <ReportTable columns={stockDetailColumns} data={stockDetail} loading={loading} emptyMessage="No stock history available" />}
          </div>
        </div>
      )}
    </div>
  );
}