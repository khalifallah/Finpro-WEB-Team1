'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import ReportTable, { ReportTableColumn } from '@/components/admin/reports/ReportTable';
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

  // ===================== STATE =====================
  const [reportType, setReportType] = useState<ReportType>('sales');
  const [salesTab, setSalesTab] = useState<SalesTab>('monthly');
  const [stockTab, setStockTab] = useState<StockTab>('summary');
  
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<number | null>(null);
  const [storesError, setStoresError] = useState('');

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [loading, setLoading] = useState(false);

  // Data states
  const [salesMonthly, setSalesMonthly] = useState<MonthlySalesReport[]>([]);
  const [salesByCategory, setSalesByCategory] = useState<SalesByCategoryReport[]>([]);
  const [salesByProduct, setSalesByProduct] = useState<SalesByProductReport[]>([]);
  const [stockSummary, setStockSummary] = useState<StockSummaryReport[]>([]);
  const [stockDetail, setStockDetail] = useState<StockDetailReport[]>([]);

  // ===================== REFS =====================
  const storesFetchedRef = useRef(false);
  // ==========================================

  // ===================== MEMOIZED CONSTANTS =====================
  const apiUrl = useMemo(() => process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api', []);

  const authHeaders = useMemo(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);
  // ============================================================

  // ✅ Initialize selectedStore for STORE_ADMIN
  useEffect(() => {
    if (!isSuperAdmin && userStoreId) {
      console.log(`🏪 STORE_ADMIN detected, setting store to: ${userStoreId}`);
      setSelectedStore(userStoreId);
    }
  }, [isSuperAdmin, userStoreId]);

  // ✅ Determine which store to use
  const storeIdToUse = isSuperAdmin ? selectedStore : userStoreId;

  // ✅ Parse month string
  const parseMonth = useCallback((monthString: string) => {
    const [year, month] = monthString.split('-');
    return { 
      year: parseInt(year), 
      month: parseInt(month)
    };
  }, []);

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  }, []);

  const formatMonthYear = useCallback((month: number, year: number) => {
    return new Date(year, month - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  }, []);

  // ===================== ROBUST DEFENSIVE PARSING =====================
  const parseReportData = useCallback((data: any): any[] => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (data.data && Array.isArray(data.data)) return data.data;
    if (data.reports && Array.isArray(data.reports)) return data.reports;
    if (data.results && Array.isArray(data.results)) return data.results;
    if (data.items && Array.isArray(data.items)) return data.items;
    if (data.sales && Array.isArray(data.sales)) return data.sales;
    if (data.stock && Array.isArray(data.stock)) return data.stock;
    
    if (typeof data === 'object') {
      const values = Object.values(data).filter(
        (item): item is any[] => Array.isArray(item) && item.length > 0
      );
      if (values.length > 0) return values[0];
    }

    console.warn('⚠️ Could not parse response:', data);
    return [];
  }, []);

  // ===================== FETCH STORES (SUPER_ADMIN ONLY) =====================
  const fetchStores = useCallback(async () => {
    if (!isSuperAdmin || storesFetchedRef.current) return;

    storesFetchedRef.current = true;

    try {
      setStoresError('');
      console.log('📦 Fetching stores...');
      const response = await fetch(`${apiUrl}/stores`, { headers: authHeaders });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      console.log('✅ Stores response:', data);

      let storesList: Store[] = [];
      
      if (Array.isArray(data)) {
        storesList = data;
      } else if (data.data?.stores && Array.isArray(data.data.stores)) {
        storesList = data.data.stores;
      } else if (Array.isArray(data.stores)) {
        storesList = data.stores;
      } else if (Array.isArray(data.data)) {
        storesList = data.data;
      } else if (data.stores && typeof data.stores === 'object') {
        storesList = Object.values(data.stores).filter(
          (item): item is Store => item !== null && typeof item === 'object' && 'id' in item && 'name' in item
        );
      }

      console.log('📦 Parsed stores:', storesList);
      setStores(storesList);
    } catch (error: any) {
      console.error('❌ Error fetching stores:', error);
      setStoresError(error.message || 'Failed to load stores');
      setStores([]);
    }
  }, [isSuperAdmin, apiUrl, authHeaders]);

  // ✅ FETCH STORES ON MOUNT
  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  // ===================== GENERIC FETCH FUNCTION =====================
  const fetchReport = useCallback(
    async (endpoint: string, setter: any, storeId: number | null, month: string) => {
      // ✅ Guard: don't fetch without store
      if (!storeId) {
        console.log(`⏭️ Skipping fetch - no store for ${endpoint}`);
        setter([]);
        return;
      }

      try {
        setLoading(true);
        const { year, month: monthNum } = parseMonth(month);
        const params = new URLSearchParams();

        params.append('storeId', String(storeId));
        params.append('month', String(monthNum));
        params.append('year', String(year));

        const url = `${apiUrl}${endpoint}?${params}`;
        console.log(`📊 Fetching ${endpoint}:`, { storeId, month: monthNum, year });

        const response = await fetch(url, { headers: authHeaders });

        if (!response.ok) {
          console.warn(`⚠️ HTTP ${response.status} on ${endpoint}`);
          setter([]);
          return;
        }

        const data = await response.json();
        console.log(`✅ ${endpoint} response:`, data);

        const parsed = parseReportData(data);
        console.log(`📊 ${endpoint} parsed:`, parsed);
        setter(parsed);
      } catch (error) {
        console.error(`❌ Error on ${endpoint}:`, error);
        setter([]);
      } finally {
        setLoading(false);
      }
    },
    [apiUrl, authHeaders, parseMonth, parseReportData]
  );

  // ===================== SALES MONTHLY =====================
  useEffect(() => {
    if (reportType === 'sales' && salesTab === 'monthly') {
      fetchReport('/reports/sales/monthly', setSalesMonthly, storeIdToUse, selectedMonth);
    }
  }, [reportType, salesTab, storeIdToUse, selectedMonth, fetchReport]);

  // ===================== SALES BY CATEGORY =====================
  useEffect(() => {
    if (reportType === 'sales' && salesTab === 'byCategory') {
      fetchReport('/reports/sales/by-category', setSalesByCategory, storeIdToUse, selectedMonth);
    }
  }, [reportType, salesTab, storeIdToUse, selectedMonth, fetchReport]);

  // ===================== SALES BY PRODUCT =====================
  useEffect(() => {
    if (reportType === 'sales' && salesTab === 'byProduct') {
      fetchReport('/reports/sales/by-product', setSalesByProduct, storeIdToUse, selectedMonth);
    }
  }, [reportType, salesTab, storeIdToUse, selectedMonth, fetchReport]);

  // ===================== STOCK SUMMARY =====================
  useEffect(() => {
    if (reportType === 'stock' && stockTab === 'summary') {
      fetchReport('/reports/stock/summary', setStockSummary, storeIdToUse, selectedMonth);
    }
  }, [reportType, stockTab, storeIdToUse, selectedMonth, fetchReport]);

  // ===================== STOCK DETAIL =====================
  useEffect(() => {
    if (reportType === 'stock' && stockTab === 'detail') {
      fetchReport('/reports/stock/detail', setStockDetail, storeIdToUse, selectedMonth);
    }
  }, [reportType, stockTab, storeIdToUse, selectedMonth, fetchReport]);

  // ===================== COLUMNS =====================
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

  const salesCategoryColumns: ReportTableColumn<SalesByCategoryReport>[] = [
    {
      key: 'categoryName',
      header: 'Category',
      render: (value) => <span className="font-semibold text-gray-900">{value || '-'}</span>,
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

  const salesProductColumns: ReportTableColumn<SalesByProductReport>[] = [
    {
      key: 'productName',
      header: 'Product Name',
      render: (value) => <span className="font-semibold text-gray-900">{value || '-'}</span>,
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

  const stockSummaryColumns: ReportTableColumn<StockSummaryReport>[] = [
    {
      key: 'month',
      header: 'Period',
      render: (_, item) => <span className="font-semibold text-gray-900">{formatMonthYear(item?.month || 1, item?.year || 2025)}</span>,
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

  const stockDetailColumns: ReportTableColumn<StockDetailReport>[] = [
    {
      key: 'date',
      header: 'Date',
      render: (value) => <span className="text-gray-900 font-medium">{value ? new Date(value).toLocaleDateString('id-ID') : '-'}</span>,
    },
    {
      key: 'productName',
      header: 'Product',
      render: (value) => <span className="font-semibold text-gray-900">{value || '-'}</span>,
    },
    {
      key: 'quantity',
      header: 'Quantity',
      render: (value, item) => (
        <span className={`font-bold ${item?.type === 'IN' ? 'text-green-700' : 'text-red-700'}`}>
          {item?.type === 'IN' ? '+' : '-'}{value || 0}
        </span>
      ),
    },
    {
      key: 'reason',
      header: 'Reason',
      render: (value) => <span className="text-gray-900">{value || '-'}</span>,
    },
    {
      key: 'type',
      header: 'Type',
      render: (value) => (
        <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${value === 'IN' ? 'bg-green-600' : 'bg-red-600'}`}>
          {value || 'N/A'}
        </span>
      ),
    },
  ];

  const isSuperAdminWithoutStore = isSuperAdmin && !selectedStore;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">📊 Reports & Analysis</h1>
        <p className="text-gray-600 mt-1">
          {isSuperAdmin ? 'View reports for all stores' : `View reports for ${user?.store?.name || 'your store'}`}
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
      <div className="bg-white p-4 rounded-lg shadow-sm border space-y-4">
        {/* ✅ SUPER_ADMIN ONLY: Store Filter */}
        {isSuperAdmin && (
          <div className="border-b pb-4">
            {storesError && (
              <div className="alert alert-error mb-4">
                <span>{storesError}</span>
                <button onClick={() => { storesFetchedRef.current = false; fetchStores(); }}
                  className="btn btn-sm btn-ghost">Retry</button>
              </div>
            )}

            <div className="form-control w-full max-w-xs">
              <label className="label">
                <span className="label-text font-semibold text-gray-900">
                  🏪 Filter by Store <span className="text-red-500">*</span>
                </span>
              </label>
              
              {stores.length === 0 && !storesError && (
                <div className="select select-bordered bg-gray-100 text-gray-600 font-medium cursor-not-allowed">
                  <span className="loading loading-spinner loading-sm inline"></span> Loading stores...
                </div>
              )}

              {stores.length > 0 && (
                <select
                  value={selectedStore || ''}
                  onChange={(e) => {
                    const storeId = e.target.value ? parseInt(e.target.value) : null;
                    console.log(`🏪 SUPER_ADMIN selected store: ${storeId}`);
                    setSelectedStore(storeId);
                  }}
                  className="select select-bordered bg-white text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">-- Select a store --</option>
                  {stores.map((store) => (
                    <option key={store.id} value={store.id}>{store.name}</option>
                  ))}
                </select>
              )}

              {!selectedStore && !storesError && stores.length > 0 && (
                <label className="label pt-2">
                  <span className="label-text-alt text-red-600 font-medium">
                    ⚠️ You must select a store to view reports
                  </span>
                </label>
              )}
            </div>
          </div>
        )}

        {/* ✅ STORE_ADMIN ONLY: Info Badge */}
        {!isSuperAdmin && (
          <div className="alert alert-info">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Viewing reports for <strong>{user?.store?.name}</strong></span>
          </div>
        )}

        {/* Month Filter */}
        <div className="form-control w-full max-w-xs">
          <label className="label">
            <span className="label-text font-semibold text-gray-900">📅 Month</span>
          </label>
          <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}
            className="input input-bordered bg-white text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
      </div>

      {/* Warning */}
      {isSuperAdminWithoutStore && (
        <div className="alert alert-warning border-2 border-yellow-500 bg-yellow-50">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4v2m0 0v2m0-6v-2m0 0V7a2 2 0 012-2h.5a.5.5 0 00-.5.5v.5H9.5a.5.5 0 00-.5.5v.5a2 2 0 014 0m0 0a2 2 0 11-4 0m0 0V7a2 2 0 012-2z" />
          </svg>
          <div>
            <h3 className="font-bold">Store Selection Required</h3>
            <p className="text-sm">Select a store from the filter above to view reports.</p>
          </div>
        </div>
      )}

      {/* Sales Report */}
      {reportType === 'sales' && !isSuperAdminWithoutStore && (
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
      {reportType === 'stock' && !isSuperAdminWithoutStore && (
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