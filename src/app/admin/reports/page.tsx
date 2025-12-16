'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import ReportTable, { ReportTableColumn } from '@/components/admin/reports/ReportTable';
import Pagination from '@/components/common/Pagination';
import { useAuth } from '@/contexts/AuthContext';
import { FiBarChart2, FiDollarSign, FiPackage, FiShoppingBag, FiAlertTriangle, FiCalendar, FiTag, FiClipboard, FiFileText, FiMapPin } from 'react-icons/fi';
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

const ITEMS_PER_PAGE = 10;

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

  // ✅ NEW: Separate month and year states for better UX
  const [selectedMonthNum, setSelectedMonthNum] = useState(() => {
    const now = new Date();
    return String(now.getMonth() + 1).padStart(2, '0');
  });

  const [selectedYear, setSelectedYear] = useState(() => {
    const now = new Date();
    return String(now.getFullYear());
  });

  // ✅ NEW: Generate year options (current year - 5 to current year + 1)
  const generateYearOptions = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const years = [];
    for (let i = currentYear - 5; i <= currentYear + 1; i++) {
      years.push(i);
    }
    return years.reverse();
  };

  const monthOptions = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  // ✅ NEW: Handle month/year change
  const handleMonthYearChange = (month: string, year: string) => {
    setSelectedMonthNum(month);
    setSelectedYear(year);
    setSelectedMonth(`${year}-${month}`);
  };

  const [loading, setLoading] = useState(false);

  // ✅ PAGINATION STATES
  const [currentPageSalesMonthly, setCurrentPageSalesMonthly] = useState(1);
  const [currentPageSalesByCategory, setCurrentPageSalesByCategory] = useState(1);
  const [currentPageSalesByProduct, setCurrentPageSalesByProduct] = useState(1);
  const [currentPageStockSummary, setCurrentPageStockSummary] = useState(1);
  const [currentPageStockDetail, setCurrentPageStockDetail] = useState(1);

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

  const authHeaders = useMemo<HeadersInit>(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
    return headers;
  }, []);
  // ============================================================

  // ✅ Initialize selectedStore for STORE_ADMIN
  useEffect(() => {
    if (!isSuperAdmin && userStoreId) {
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

    console.warn('Could not parse response:', data);
    return [];
  }, []);

  // ===================== FETCH STORES (SUPER_ADMIN ONLY) =====================
  const fetchStores = useCallback(async () => {
    if (!isSuperAdmin || storesFetchedRef.current) return;

    storesFetchedRef.current = true;

    try {
      setStoresError('');
      const response = await fetch(`${apiUrl}/stores`, { headers: authHeaders });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();

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

      setStores(storesList);
    } catch (error: any) {
      console.error('Error fetching stores:', error);
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

        const response = await fetch(url, { headers: authHeaders });

        if (!response.ok) {
          console.warn(`⚠️ HTTP ${response.status} on ${endpoint}`);
          setter([]);
          return;
        }

        const data = await response.json();

        const parsed = parseReportData(data);
        setter(parsed);
      } catch (error) {
        console.error(`Error on ${endpoint}:`, error);
        setter([]);
      } finally {
        setLoading(false);
      }
    },
    [apiUrl, authHeaders, parseMonth, parseReportData]
  );

  // ✅ Reset pagination when filters change
  useEffect(() => {
    setCurrentPageSalesMonthly(1);
    setCurrentPageSalesByCategory(1);
    setCurrentPageSalesByProduct(1);
    setCurrentPageStockSummary(1);
    setCurrentPageStockDetail(1);
  }, [storeIdToUse, selectedMonth]);

  // ===================== SALES MONTHLY =====================
  useEffect(() => {
    if (reportType === 'sales' && salesTab === 'monthly') {
      fetchReport('/reports/sales/monthly', setSalesMonthly, storeIdToUse ?? null, selectedMonth);
    }
  }, [reportType, salesTab, storeIdToUse, selectedMonth, fetchReport]);

  // ===================== SALES BY CATEGORY =====================
  useEffect(() => {
    if (reportType === 'sales' && salesTab === 'byCategory') {
      fetchReport('/reports/sales/by-category', setSalesByCategory, storeIdToUse ?? null, selectedMonth);
    }
  }, [reportType, salesTab, storeIdToUse, selectedMonth, fetchReport]);

  // ===================== SALES BY PRODUCT =====================
  useEffect(() => {
    if (reportType === 'sales' && salesTab === 'byProduct') {
      fetchReport('/reports/sales/by-product', setSalesByProduct, storeIdToUse ?? null, selectedMonth);
    }
  }, [reportType, salesTab, storeIdToUse, selectedMonth, fetchReport]);

  // ===================== STOCK SUMMARY =====================
  useEffect(() => {
    if (reportType === 'stock' && stockTab === 'summary') {
      fetchReport('/reports/stock/summary', setStockSummary, storeIdToUse ?? null, selectedMonth);
    }
  }, [reportType, stockTab, storeIdToUse, selectedMonth, fetchReport]);

  // ===================== STOCK DETAIL =====================
  useEffect(() => {
    if (reportType === 'stock' && stockTab === 'detail') {
      fetchReport('/reports/stock/detail', setStockDetail, storeIdToUse ?? null, selectedMonth);
    }
  }, [reportType, stockTab, storeIdToUse, selectedMonth, fetchReport]);

  // ===================== PAGINATION HELPERS =====================
  const getPaginatedData = useCallback((data: any[], currentPage: number) => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return data.slice(startIndex, endIndex);
  }, []);

  const getTotalPages = useCallback((dataLength: number) => {
    return Math.ceil(dataLength / ITEMS_PER_PAGE);
  }, []);

  // ✅ Memoize paginated data
  const paginatedSalesMonthly = useMemo(() => getPaginatedData(salesMonthly, currentPageSalesMonthly), [salesMonthly, currentPageSalesMonthly, getPaginatedData]);
  const paginatedSalesByCategory = useMemo(() => getPaginatedData(salesByCategory, currentPageSalesByCategory), [salesByCategory, currentPageSalesByCategory, getPaginatedData]);
  const paginatedSalesByProduct = useMemo(() => getPaginatedData(salesByProduct, currentPageSalesByProduct), [salesByProduct, currentPageSalesByProduct, getPaginatedData]);
  const paginatedStockSummary = useMemo(() => getPaginatedData(stockSummary, currentPageStockSummary), [stockSummary, currentPageStockSummary, getPaginatedData]);
  const paginatedStockDetail = useMemo(() => getPaginatedData(stockDetail, currentPageStockDetail), [stockDetail, currentPageStockDetail, getPaginatedData]);

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
      {/* Header - ✅ RESPONSIVE */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          <span className="inline-flex items-center gap-2"><FiBarChart2 className="h-6 w-6 text-gray-700" />Reports & Analysis</span>
        </h1>
        <p className="text-gray-600 mt-1">
          {isSuperAdmin ? 'View reports for all stores' : `View reports for ${user?.store?.name || 'your store'}`}
        </p>
      </div>

      {/* Report Type - ✅ RESPONSIVE */}
      <div className="flex flex-wrap gap-2 sm:gap-3">
        <button onClick={() => setReportType('sales')}
          className={`px-3 py-2 sm:px-5 sm:py-3 rounded-lg font-semibold transition-all ${reportType === 'sales' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white border border-gray-300 text-gray-900 hover:bg-gray-50'}`}>
          <span className="inline-flex items-center gap-2"><FiDollarSign className="h-4 w-4" />Sales Report</span>
        </button>
        <button onClick={() => setReportType('stock')}
          className={`px-3 py-2 sm:px-5 sm:py-3 rounded-lg font-semibold transition-all ${reportType === 'stock' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white border border-gray-300 text-gray-900 hover:bg-gray-50'}`}>
          <span className="inline-flex items-center gap-2"><FiPackage className="h-4 w-4" />Stock Report</span>
        </button>
      </div>

      {/* Filters - ✅ IMPROVED */}
      <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border space-y-4">
        {/* SUPER_ADMIN ONLY: Store Filter */}
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
                <span className="label-text font-semibold text-gray-900 bg-green-100 px-2 py-1 rounded-lg inline-flex items-center gap-2">
                  <FiShoppingBag className="h-4 w-4 text-gray-700" /> Filter by Store <span className="text-red-500">*</span>
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
                    setSelectedStore(storeId);
                  }}
                  className="select select-bordered text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-primary bg-gray-100 my-1.5 rounded-lg"
                >
                  <option value="">-- Select a store --</option>
                  {stores.map((store) => (
                    <option key={store.id} value={store.id}>{store.name}</option>
                  ))}
                </select>
              )}

              {!selectedStore && !storesError && stores.length > 0 && (
                <label className="label pt-2">
                  <span className="label-text-alt text-red-600 font-medium inline-flex items-center gap-2">
                    <FiAlertTriangle className="h-4 w-4 text-red-600" /> You must select a store to view reports
                  </span>
                </label>
              )}
            </div>
          </div>
        )}

        {/* STORE_ADMIN ONLY: Info Badge */}
        {!isSuperAdmin && (
          <div className="alert alert-info">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Viewing reports for <strong>{user?.store?.name}</strong></span>
          </div>
        )}

        {/* ✅ IMPROVED Month & Year Filter */}
        <div className="form-control w-full max-w-md">
          <label className="label">
            <span className="label-text font-semibold text-gray-900 inline-flex items-center gap-2"><FiCalendar className="h-4 w-4" /> Select Month & Year</span>
          </label>
          
          <div className="flex gap-2">
            {/* Month Dropdown */}
            <select
              value={selectedMonthNum}
              onChange={(e) => handleMonthYearChange(e.target.value, selectedYear)}
              className="select select-bordered flex-1 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-primary bg-gray-100"
            >
              {monthOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Year Dropdown */}
            <select
              value={selectedYear}
              onChange={(e) => handleMonthYearChange(selectedMonthNum, e.target.value)}
              className="select select-bordered w-24 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-primary bg-gray-100"
            >
              {generateYearOptions().map((year) => (
                <option key={year} value={String(year)}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Display Current Selection */}
          <label className="label pt-2">
            <span className="label-text-alt text-blue-600 font-medium inline-flex items-center gap-2">
              <FiMapPin className="h-4 w-4" /> Currently viewing: <strong>{monthOptions.find(m => m.value === selectedMonthNum)?.label} {selectedYear}</strong>
            </span>
          </label>
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
          <div className="flex flex-wrap gap-2 sm:gap-3 border-b">
            <button onClick={() => setSalesTab('monthly')}
              className={`px-3 py-2 sm:px-4 sm:py-3 font-semibold border-b-2 transition-all ${salesTab === 'monthly' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'}`}>
              <span className="inline-flex items-center gap-2"><FiCalendar className="h-4 w-4" />Monthly</span>
            </button>
            <button onClick={() => setSalesTab('byCategory')}
              className={`px-3 py-2 sm:px-4 sm:py-3 font-semibold border-b-2 transition-all ${salesTab === 'byCategory' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text_gray-900'}`}>
              <span className="inline-flex items-center gap-2"><FiTag className="h-4 w-4" />By Category</span>
            </button>
            <button onClick={() => setSalesTab('byProduct')}
              className={`px-3 py-2 sm:px-4 sm:py-3 font-semibold border-b-2 transition-all ${salesTab === 'byProduct' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'}`}>
              <span className="inline-flex items-center gap-2"><FiPackage className="h-4 w-4" />By Product</span>
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            {salesTab === 'monthly' && (
              <>
                <ReportTable columns={salesMonthlyColumns} data={paginatedSalesMonthly} loading={loading} emptyMessage="No sales data available" />
                <div className="p-4 border-t">
                  <Pagination 
                    currentPage={currentPageSalesMonthly}
                    totalPages={getTotalPages(salesMonthly.length)}
                    onPageChange={setCurrentPageSalesMonthly}
                    showInfo
                  />
                </div>
              </>
            )}
            {salesTab === 'byCategory' && (
              <>
                <ReportTable columns={salesCategoryColumns} data={paginatedSalesByCategory} loading={loading} emptyMessage="No category data available" />
                <div className="p-4 border-t">
                  <Pagination 
                    currentPage={currentPageSalesByCategory}
                    totalPages={getTotalPages(salesByCategory.length)}
                    onPageChange={setCurrentPageSalesByCategory}
                    showInfo
                  />
                </div>
              </>
            )}
            {salesTab === 'byProduct' && (
              <>
                <ReportTable columns={salesProductColumns} data={paginatedSalesByProduct} loading={loading} emptyMessage="No product sales data available" />
                <div className="p-4 border-t">
                  <Pagination 
                    currentPage={currentPageSalesByProduct}
                    totalPages={getTotalPages(salesByProduct.length)}
                    onPageChange={setCurrentPageSalesByProduct}
                    showInfo
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Stock Report */}
      {reportType === 'stock' && !isSuperAdminWithoutStore && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 sm:gap-3 border-b">
            <button onClick={() => setStockTab('summary')}
              className={`px-3 py-2 sm:px-4 sm:py-3 font-semibold border-b-2 transition-all ${stockTab === 'summary' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'}`}>
              <span className="inline-flex items-center gap-2"><FiClipboard className="h-4 w-4" />Summary</span>
            </button>
            <button onClick={() => setStockTab('detail')}
              className={`px-3 py-2 sm:px-4 sm:py-3 font-semibold border-b-2 transition-all ${stockTab === 'detail' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'}`}>
              <span className="inline-flex items-center gap-2"><FiFileText className="h-4 w-4" />Detail History</span>
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            {stockTab === 'summary' && (
              <>
                <ReportTable columns={stockSummaryColumns} data={paginatedStockSummary} loading={loading} emptyMessage="No stock data available" />
                <div className="p-4 border-t">
                  <Pagination 
                    currentPage={currentPageStockSummary}
                    totalPages={getTotalPages(stockSummary.length)}
                    onPageChange={setCurrentPageStockSummary}
                    showInfo
                  />
                </div>
              </>
            )}
            {stockTab === 'detail' && (
              <>
                <ReportTable columns={stockDetailColumns} data={paginatedStockDetail} loading={loading} emptyMessage="No stock history available" />
                <div className="p-4 border-t">
                  <Pagination 
                    currentPage={currentPageStockDetail}
                    totalPages={getTotalPages(stockDetail.length)}
                    onPageChange={setCurrentPageStockDetail}
                    showInfo
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}