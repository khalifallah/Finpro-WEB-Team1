'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import DataTable from '@/components/common/DataTable';
import Pagination from '@/components/common/Pagination';
import { useAuth } from '@/contexts/AuthContext';

interface DiscountUsage {
  id: number;
  discountRuleId: number;
  orderId: number;
  amount: number;
  createdAt: string;
  order?: {
    id: number;
    totalAmount: number;
    user?: {
      id: number;
      name: string;
      email: string;
    };
  };
}

interface DiscountInfo {
  id: number;
  description: string;
  type: string;
  value: number;
  storeId: number;
  product?: { id: number; name: string };
}

export default function DiscountUsagesPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const discountId = parseInt(params.id as string);

  const [usages, setUsages] = useState<DiscountUsage[]>([]);
  const [discountInfo, setDiscountInfo] = useState<DiscountInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [summary, setSummary] = useState({ totalUsages: 0, totalDiscountGiven: 0 });

  const getApiUrl = () => process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
  const getAuthHeaders = useCallback(() => ({ Authorization: `Bearer ${localStorage.getItem('token')}` }), []);

  // Fetch discount info
  const fetchDiscountInfo = useCallback(async () => {
    try {
      const res = await fetch(`${getApiUrl()}/discounts/${discountId}`, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setDiscountInfo(data.data || data);
      }
    } catch (e) {
      console.error('Failed to fetch discount info:', e);
    }
  }, [discountId, getAuthHeaders]);

  // Fetch usages
  const fetchUsages = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: String(page), limit: String(pagination.limit) });
      
      const res = await fetch(`${getApiUrl()}/discounts/${discountId}/usages?${params}`, { 
        headers: getAuthHeaders() 
      });
      
      if (res.ok) {
        const data = await res.json();
        const usagesData = data.usages || data.data?.usages || data.data || data || [];
        const usagesList = Array.isArray(usagesData) ? usagesData : [];
        const totalCount = data.total || data.data?.total || usagesList.length;

        setUsages(usagesList);
        setPagination({ 
          page, 
          limit: pagination.limit, 
          total: totalCount, 
          totalPages: Math.ceil(totalCount / pagination.limit) 
        });

        // Calculate summary
        const totalDiscountGiven = usagesList.reduce((sum: number, u: DiscountUsage) => sum + (u.amount || 0), 0);
        setSummary({ totalUsages: usagesList.length, totalDiscountGiven });
      } else {
        setUsages([]);
      }
    } catch (e) {
      console.error('Failed to fetch usages:', e);
      setUsages([]);
    } finally {
      setLoading(false);
    }
  }, [discountId, pagination.limit, getAuthHeaders]);

  useEffect(() => {
    if (discountId) {
      fetchDiscountInfo();
      fetchUsages(1);
    }
  }, [discountId, fetchDiscountInfo, fetchUsages]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR', 
      minimumFractionDigits: 0 
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDiscountTypeLabel = (type: string) => {
    switch (type) {
      case 'DIRECT_PERCENTAGE': return '📊 Percentage';
      case 'DIRECT_NOMINAL': return '💵 Fixed Amount';
      case 'BOGO': return '🎁 Buy 1 Get 1';
      default: return type;
    }
  };

  // Table columns
  const columns = [
    {
      key: 'id',
      header: 'Usage ID',
      render: (value: number) => <span className="font-mono text-sm font-bold text-gray-900">#{value}</span>,
      className: 'w-24',
    },
    {
      key: 'orderId',
      header: 'Order ID',
      render: (value: number) => (
        <Link href={`/admin/orders/${value}`} className="text-blue-600 hover:underline font-semibold">
          #{value}
        </Link>
      ),
    },
    {
      key: 'order',
      header: 'Customer',
      render: (value: DiscountUsage['order']) => (
        <div>
          <p className="font-semibold text-gray-900">{value?.user?.name || 'Unknown'}</p>
          <p className="text-sm text-gray-500">{value?.user?.email || '-'}</p>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Discount Amount',
      render: (value: number) => (
        <span className="font-bold text-green-600 text-lg">{formatCurrency(value)}</span>
      ),
    },
    {
      key: 'order',
      header: 'Order Total',
      render: (value: DiscountUsage['order']) => (
        <span className="font-medium text-gray-700">{formatCurrency(value?.totalAmount || 0)}</span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Used At',
      render: (value: string) => (
        <span className="text-gray-600">{formatDate(value)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Back Button & Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <button 
            onClick={() => router.back()} 
            className="text-blue-600 hover:text-blue-800 mb-2 flex items-center gap-1"
          >
            ← Back to Discounts
          </button>
          <h1 className="text-2xl font-bold text-gray-900">📈 Discount Usage Report</h1>
          <p className="text-gray-600 mt-1">
            Track how this discount has been used
          </p>
        </div>
      </div>

      {/* Discount Info Card */}
      {discountInfo && (
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{discountInfo.description}</h2>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold text-white ${
                  discountInfo.type === 'DIRECT_PERCENTAGE' ? 'bg-blue-600' :
                  discountInfo.type === 'DIRECT_NOMINAL' ? 'bg-green-600' :
                  'bg-orange-500'
                }`}>
                  {getDiscountTypeLabel(discountInfo.type)}
                </span>
                <span className="text-lg font-bold text-gray-800">
                  {discountInfo.type === 'DIRECT_PERCENTAGE' 
                    ? `${discountInfo.value}%` 
                    : discountInfo.type === 'DIRECT_NOMINAL'
                    ? formatCurrency(discountInfo.value)
                    : 'BOGO'}
                </span>
                {discountInfo.product && (
                  <span className="text-sm text-gray-600">
                    Product: <strong>{discountInfo.product.name}</strong>
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Discount ID</p>
              <p className="text-2xl font-bold text-gray-900">#{discountInfo.id}</p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Total Times Used</p>
              <p className="text-3xl font-bold mt-1">{summary.totalUsages}</p>
            </div>
            <div className="text-4xl opacity-80">🎫</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Discount Given</p>
              <p className="text-3xl font-bold mt-1">{formatCurrency(summary.totalDiscountGiven)}</p>
            </div>
            <div className="text-4xl opacity-80">💰</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Avg. Discount/Order</p>
              <p className="text-3xl font-bold mt-1">
                {summary.totalUsages > 0 
                  ? formatCurrency(summary.totalDiscountGiven / summary.totalUsages)
                  : formatCurrency(0)}
              </p>
            </div>
            <div className="text-4xl opacity-80">📊</div>
          </div>
        </div>
      </div>

      {/* Usage Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <h3 className="font-semibold text-gray-900">Usage History</h3>
          <p className="text-sm text-gray-500">All orders that used this discount</p>
        </div>
        
        <DataTable 
          columns={columns} 
          data={usages} 
          loading={loading} 
          emptyMessage="No usage records yet. This discount hasn't been used."
          striped={true}
          hoverEffect={true}
        />
        
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t bg-gray-50">
            <Pagination 
              currentPage={pagination.page} 
              totalPages={pagination.totalPages} 
              onPageChange={fetchUsages} 
            />
          </div>
        )}
      </div>

      {/* Export Button */}
      <div className="flex justify-end">
        <button 
          onClick={() => {
            // Simple CSV export
            const csvContent = [
              ['Usage ID', 'Order ID', 'Customer', 'Email', 'Discount Amount', 'Order Total', 'Used At'],
              ...usages.map(u => [
                u.id,
                u.orderId,
                u.order?.user?.name || 'Unknown',
                u.order?.user?.email || '-',
                u.amount,
                u.order?.totalAmount || 0,
                formatDate(u.createdAt),
              ])
            ].map(row => row.join(',')).join('\n');
            
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `discount-usage-${discountId}-${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
          }}
          className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 font-medium flex items-center gap-2"
        >
          📥 Export CSV
        </button>
      </div>
    </div>
  );
}