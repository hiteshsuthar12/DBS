import React, { useEffect, useState } from 'react';
import { alertApi } from '../../api';
import { InventoryAlert } from '../../types';
import { formatDateTime, getStatusBadgeClass } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Flame,
  CheckCircle,
  Eye,
  RefreshCw,
  ArrowDownToLine,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Check,
} from 'lucide-react';

export const LowStockAlertsPage: React.FC = () => {
  const { isManager } = useAuth();

  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [statusFilter, setStatusFilter] = useState('ACTIVE');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await alertApi.getAlerts({
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        alertType: typeFilter !== 'ALL' ? typeFilter : undefined,
        page,
        size,
      });
      setAlerts(res.content);
      setTotalElements(res.totalElements);
      setTotalPages(res.totalPages || 1);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load stock alerts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, [page, statusFilter, typeFilter]);

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      await alertApi.updateStatus(id, newStatus);
      loadAlerts();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update alert status.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Stock Alerts & Monitoring</h2>
          <p className="text-xs text-slate-500">
            Intelligent threshold detection: Out of stock, critical depletion, and reorder triggers
          </p>
        </div>
        <button
          onClick={loadAlerts}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-sm transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Status
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-sm flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-2">
          {['ACTIVE', 'ACKNOWLEDGED', 'RESOLVED', 'ALL'].map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatusFilter(s);
                setPage(0);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                statusFilter === s
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setPage(0);
          }}
          className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-emerald-500"
        >
          <option value="ALL">All Alert Conditions</option>
          <option value="OUT_OF_STOCK">OUT OF STOCK (0 Units)</option>
          <option value="CRITICAL_STOCK">CRITICAL STOCK (Below Min)</option>
          <option value="LOW_STOCK">LOW STOCK (At Reorder Level)</option>
        </select>
      </div>

      {/* Alerts Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Severity & Condition</th>
                <th className="py-3 px-4">Product Name & SKU</th>
                <th className="py-3 px-4 text-center">Current Stock</th>
                <th className="py-3 px-4 text-center">Threshold</th>
                <th className="py-3 px-4">Message / Actionable Guidance</th>
                <th className="py-3 px-4">Lifecycle Status</th>
                <th className="py-3 px-4 text-right">Resolution Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Scanning inventory stock conditions...
                  </td>
                </tr>
              ) : alerts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    No alerts found for the selected status. All matching stock levels are compliant.
                  </td>
                </tr>
              ) : (
                alerts.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-full border ${getStatusBadgeClass(
                          a.alertType
                        )}`}
                      >
                        {a.alertType === 'OUT_OF_STOCK' ? (
                          <Flame className="w-3.5 h-3.5" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5" />
                        )}
                        {a.alertType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900 block truncate max-w-xs">{a.productName}</span>
                      <span className="text-[10px] font-mono text-slate-400">{a.sku}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-sm font-bold text-slate-900">{a.currentStock}</span>
                    </td>
                    <td className="py-3 px-4 text-center font-medium text-slate-500">
                      {a.thresholdStock} units
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-md">
                      <p className="line-clamp-2">{a.message}</p>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">{formatDateTime(a.createdAt)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] rounded border font-semibold ${getStatusBadgeClass(
                          a.status
                        )}`}
                      >
                        {a.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {isManager && a.status === 'ACTIVE' && (
                          <button
                            onClick={() => handleUpdateStatus(a.id, 'ACKNOWLEDGED')}
                            className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-lg transition"
                          >
                            Acknowledge
                          </button>
                        )}
                        {isManager && a.status !== 'RESOLVED' && (
                          <button
                            onClick={() => handleUpdateStatus(a.id, 'RESOLVED')}
                            className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-lg transition"
                          >
                            Resolve
                          </button>
                        )}
                        <Link
                          to="/stock/in"
                          className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm transition"
                        >
                          <ArrowDownToLine className="w-3 h-3" />
                          Reorder
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Page <strong>{page + 1}</strong> of <strong>{totalPages}</strong> ({totalElements} alerts)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((prev) => Math.max(0, prev - 1))}
              disabled={page === 0}
              className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((prev) => Math.min(totalPages - 1, prev + 1))}
              disabled={page >= totalPages - 1}
              className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

