import React, { useEffect, useState } from 'react';
import { stockApi, productApi, reportApi } from '../../api';
import { StockTransaction, Product } from '../../types';
import { formatDateTime, formatCurrency } from '../../utils/formatters';
import {
  History,
  Download,
  Search,
  Filter,
  ArrowDownToLine,
  ArrowUpFromLine,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from 'lucide-react';

export const InventoryHistoryPage: React.FC = () => {
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(0);
  const [size] = useState(12);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [histRes, prodRes] = await Promise.all([
        stockApi.getHistory({
          search: search || undefined,
          productId: selectedProductId ? Number(selectedProductId) : undefined,
          transactionType: selectedType !== 'ALL' ? selectedType : undefined,
          page,
          size,
        }),
        productApi.getAll({ size: 100 }),
      ]);

      setTransactions(histRes.content);
      setTotalElements(histRes.totalElements);
      setTotalPages(histRes.totalPages || 1);
      setProducts(prodRes.content);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch inventory transaction ledger.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, search, selectedProductId, selectedType]);

  const handleExportCsv = () => {
    window.open(reportApi.exportTransactionsUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header & Export Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Inventory Transaction History</h2>
          <p className="text-xs text-slate-500">
            Immutable, cryptographically auditable log of all stock receipts, issues, and adjustments
          </p>
        </div>
        <button
          onClick={handleExportCsv}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-sm transition"
        >
          <Download className="w-4 h-4 text-slate-500" />
          Export Ledger (CSV)
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder="Search by reference, product name, SKU..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Product Filter */}
          <select
            value={selectedProductId}
            onChange={(e) => {
              setSelectedProductId(e.target.value);
              setPage(0);
            }}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-emerald-500 max-w-[180px]"
          >
            <option value="">All Products</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Transaction Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              setPage(0);
            }}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Movement Types</option>
            <option value="IN">IN (Stock Replenishment)</option>
            <option value="SALE">SALE (Sales Dispense)</option>
            <option value="DAMAGED">DAMAGED (Quarantine)</option>
            <option value="EXPIRED">EXPIRED (Disposal)</option>
            <option value="INTERNAL_USAGE">INTERNAL_USAGE</option>
            <option value="OTHER">OTHER</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">TX ID & Date</th>
                <th className="py-3 px-4">Reference No.</th>
                <th className="py-3 px-4">Product & SKU</th>
                <th className="py-3 px-4">Movement Type</th>
                <th className="py-3 px-4 text-right">Quantity</th>
                <th className="py-3 px-4 text-center">Stock Balance</th>
                <th className="py-3 px-4">Supplier / Vendor</th>
                <th className="py-3 px-4">Operator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Querying transaction history...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No transactions recorded matching the selected filter criteria.
                  </td>
                </tr>
              ) : (
                transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-mono text-slate-400 block text-[10px]">#TX-{t.id}</span>
                      <span className="text-slate-600">{formatDateTime(t.transactionDate)}</span>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-900 whitespace-nowrap">
                      {t.referenceNumber}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900 block truncate max-w-xs">{t.productName}</span>
                      <span className="text-[10px] font-mono text-slate-400">{t.sku}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                          t.transactionType === 'IN'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {t.transactionType}
                      </span>
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-bold text-sm ${
                        t.transactionType === 'IN' ? 'text-emerald-600' : 'text-slate-900'
                      }`}
                    >
                      {t.transactionType === 'IN' ? `+${t.quantity}` : `-${t.quantity}`}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span className="text-slate-400">{t.previousStock}</span>
                      <span className="text-slate-400 mx-1.5">→</span>
                      <strong className="text-slate-900 font-bold">{t.updatedStock}</strong>
                    </td>
                    <td className="py-3 px-4 text-slate-600 truncate max-w-[130px]">
                      {t.supplierName || '-'}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {t.performedBy}
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
            Showing page <strong>{page + 1}</strong> of <strong>{totalPages}</strong> ({totalElements} recorded transactions)
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
