import React, { useEffect, useState } from 'react';
import { dashboardApi, reportApi } from '../../api';
import { DashboardOverview } from '../../types';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { BarChart3, Download, FileSpreadsheet, Layers, TrendingUp, CheckCircle } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await dashboardApi.getOverview();
        setData(res);
      } catch (err) {
        console.error('Failed to load reports', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">Reports & Analytics</h2>
        <p className="text-xs text-slate-500">
          Executive financial valuation, turnover velocity, and exportable regulatory audit sheets
        </p>
      </div>

      {/* Export Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Inventory Export */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex items-start justify-between">
          <div className="space-y-2 max-w-sm">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-sm">Full Inventory Master Ledger (CSV)</h3>
            </div>
            <p className="text-xs text-slate-500">
              Download comprehensive snapshot containing all active SKUs, current stock, valuations, thresholds, and assigned vendors.
            </p>
          </div>
          <a
            href={reportApi.exportInventoryUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-sm transition"
          >
            <Download className="w-4 h-4" />
            Download
          </a>
        </div>

        {/* Transactions Export */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex items-start justify-between">
          <div className="space-y-2 max-w-sm">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-sm">Stock Transaction Audit Ledger (CSV)</h3>
            </div>
            <p className="text-xs text-slate-500">
              Download complete auditable log of receipts, sales, adjustments, with timestamps and authorized operators.
            </p>
          </div>
          <a
            href={reportApi.exportTransactionsUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-sm transition"
          >
            <Download className="w-4 h-4" />
            Download
          </a>
        </div>
      </div>

      {/* Valuation Breakdown Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">Inventory Valuation by Category</h3>
          <p className="text-xs text-slate-400">Financial allocation of active warehouse capital</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Category Name</th>
                <th className="py-3 px-4 text-center">Product Count</th>
                <th className="py-3 px-4 text-right">Physical Units</th>
                <th className="py-3 px-4 text-right">Inventory Valuation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {data?.categoryDistribution.map((c, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 font-semibold text-slate-900">{c.categoryName}</td>
                  <td className="py-3 px-4 text-center text-slate-600 font-medium">{c.productCount} SKUs</td>
                  <td className="py-3 px-4 text-right font-medium text-slate-700">{formatNumber(c.stockQuantity)}</td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900">{formatCurrency(c.valuation)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

