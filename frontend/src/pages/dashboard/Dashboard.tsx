import React, { useEffect, useState } from 'react';
import { dashboardApi } from '../../api';
import { DashboardOverview } from '../../types';
import { formatCurrency, formatNumber, formatDateTime, getStatusBadgeClass } from '../../utils/formatters';
import {
  Boxes,
  Truck,
  Layers,
  CircleDollarSign,
  AlertTriangle,
  Flame,
  ArrowDownToLine,
  ArrowUpFromLine,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Link } from 'react-router-dom';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#64748b'];

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const overview = await dashboardApi.getOverview();
      setData(overview);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load live dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-3">
        <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-medium text-slate-500">Querying real-time inventory ledger...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-white rounded-2xl border border-rose-200 shadow-sm text-center">
        <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
        <h3 className="text-base font-semibold text-slate-900">Failed to Connect to Inventory Service</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-500 transition"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const { summary, monthlyMovements, categoryDistribution, topSellingProducts, recentTransactions, lowStockAlerts } = data;

  const statCards = [
    {
      title: 'Total Products',
      value: formatNumber(summary.totalProducts),
      icon: Boxes,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      subtitle: 'Active catalog items',
    },
    {
      title: 'Total Suppliers',
      value: formatNumber(summary.totalSuppliers),
      icon: Truck,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
      subtitle: 'Verified vendor partners',
    },
    {
      title: 'Inventory Quantity',
      value: formatNumber(summary.totalInventoryQuantity),
      icon: Layers,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      subtitle: 'Units on hand',
    },
    {
      title: 'Total Inventory Valuation',
      value: formatCurrency(summary.totalInventoryValuation),
      icon: CircleDollarSign,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
      subtitle: 'At current purchase cost',
    },
    {
      title: 'Low Stock Products',
      value: formatNumber(summary.lowStockProducts),
      icon: AlertTriangle,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
      subtitle: 'At or below reorder level',
    },
    {
      title: 'Out of Stock Products',
      value: formatNumber(summary.outOfStockProducts),
      icon: Flame,
      color: 'text-rose-600 bg-rose-50 border-rose-200',
      subtitle: 'Immediate action needed',
    },
    {
      title: 'Stock-In Today',
      value: `+${formatNumber(summary.stockInToday)}`,
      icon: ArrowDownToLine,
      color: 'text-teal-600 bg-teal-50 border-teal-200',
      subtitle: 'Units received today',
    },
    {
      title: 'Stock-Out Today',
      value: `-${formatNumber(summary.stockOutToday)}`,
      icon: ArrowUpFromLine,
      color: 'text-orange-600 bg-orange-50 border-orange-200',
      subtitle: 'Units issued / sold today',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Executive Overview</h2>
          <p className="text-xs text-slate-500">Live operational ledger metrics and supply chain health</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link
            to="/stock/in"
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-500 shadow-sm shadow-emerald-950/20 transition"
          >
            <ArrowDownToLine className="w-3.5 h-3.5" />
            Receive Stock
          </Link>
          <Link
            to="/stock/out"
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg shadow-sm transition"
          >
            <ArrowUpFromLine className="w-3.5 h-3.5" />
            Issue Stock
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 truncate">{card.title}</span>
              <div className={`p-1.5 rounded-lg border ${card.color}`}>
                <card.icon className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">{card.value}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{card.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Visualizations Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly In vs Out Chart */}
        <div className="lg:col-span-2 p-5 bg-white rounded-xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Stock Movement Trends</h3>
              <p className="text-xs text-slate-400">Monthly units received (In) vs units issued (Out)</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Stock-In
              </span>
              <span className="flex items-center gap-1.5 text-rose-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Stock-Out
              </span>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyMovements} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="stockIn" fill="#10b981" radius={[4, 4, 0, 0]} name="Stock In" />
                <Bar dataKey="stockOut" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Stock Out" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Valuation Breakdown */}
        <div className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Inventory by Category</h3>
            <p className="text-xs text-slate-400">Valuation & volume distribution</p>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            {categoryDistribution.length === 0 ? (
              <p className="text-xs text-slate-400">No category stock data</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    dataKey="stockQuantity"
                    nameKey="categoryName"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={50}
                    paddingAngle={3}
                  >
                    {categoryDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any, name: any) => [`${val} units`, name]}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '8px',
                      color: '#fff',
                      border: 'none',
                      fontSize: '11px',
                    }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Tables Row: Recent Transactions & Active Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions Table */}
        <div className="lg:col-span-2 p-5 bg-white rounded-xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Inventory Activity</h3>
              <p className="text-xs text-slate-400">Latest receipts and issue transactions</p>
            </div>
            <Link to="/history" className="text-xs font-semibold text-emerald-600 hover:underline">
              View all history →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Product</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3 text-right">Qty</th>
                  <th className="py-2.5 px-3 text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {recentTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">
                      No stock transactions recorded yet.
                    </td>
                  </tr>
                ) : (
                  recentTransactions.slice(0, 6).map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">{formatDateTime(t.transactionDate)}</td>
                      <td className="py-2.5 px-3">
                        <span className="font-medium text-slate-800 block truncate max-w-xs">{t.productName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{t.sku}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                            t.transactionType === 'IN'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {t.transactionType}
                        </span>
                      </td>
                      <td className={`py-2.5 px-3 text-right font-semibold ${t.transactionType === 'IN' ? 'text-emerald-600' : 'text-slate-800'}`}>
                        {t.transactionType === 'IN' ? `+${t.quantity}` : `-${t.quantity}`}
                      </td>
                      <td className="py-2.5 px-3 text-right font-medium text-slate-600">{t.updatedStock}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Attention List */}
        <div className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Active Stock Warnings</h3>
              <p className="text-xs text-slate-400">Products requiring procurement</p>
            </div>
            <Link to="/alerts" className="text-xs font-semibold text-rose-600 hover:underline">
              Resolve →
            </Link>
          </div>

          <div className="space-y-3">
            {lowStockAlerts.length === 0 ? (
              <p className="text-xs text-center py-8 text-slate-400">
                All inventory levels meet safety thresholds.
              </p>
            ) : (
              lowStockAlerts.slice(0, 5).map((a) => (
                <div key={a.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-slate-900 truncate max-w-[180px]">{a.productName}</span>
                    <span className={`px-2 py-0.5 text-[10px] rounded-full border ${getStatusBadgeClass(a.alertType)}`}>
                      {a.alertType.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Stock: <strong className="text-slate-900 font-semibold">{a.currentStock}</strong></span>
                    <span>Reorder at: {a.thresholdStock}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

