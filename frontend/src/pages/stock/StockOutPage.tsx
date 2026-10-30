import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productApi, stockApi } from '../../api';
import { Product, StockOutRequest } from '../../types';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import {
  ArrowUpFromLine,
  PackageMinus,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Boxes,
  FileText,
  ShieldAlert,
} from 'lucide-react';

export const StockOutPage: React.FC = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Form State
  const [selectedProductId, setSelectedProductId] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [transactionType, setTransactionType] = useState<string>('SALE');
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [remarks, setRemarks] = useState<string>('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const prodRes = await productApi.getAll({ size: 100 });
        setProducts(prodRes.content);
        if (prodRes.content.length > 0) {
          setSelectedProductId(prodRes.content[0].id);
        }
      } catch (err) {
        setError('Failed to load products for stock dispensing.');
      } finally {
        setLoadingInitial(false);
      }
    };
    loadProducts();
  }, []);

  const selectedProduct = products.find((p) => p.id === Number(selectedProductId));
  const currentStock = selectedProduct?.currentStock || 0;
  const isInsufficient = quantity > currentStock;
  const remainingStock = Math.max(0, currentStock - (quantity || 0));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || quantity <= 0 || !referenceNumber.trim()) {
      setError('Please select a product, enter a positive quantity, and provide a reference number.');
      return;
    }

    if (isInsufficient) {
      setError(`Cannot issue ${quantity} units: Only ${currentStock} units are currently available.`);
      return;
    }

    const payload: StockOutRequest = {
      productId: Number(selectedProductId),
      quantity,
      transactionType,
      referenceNumber: referenceNumber.trim(),
      remarks: remarks.trim() || undefined,
    };

    try {
      setSubmitting(true);
      setError(null);
      await stockApi.stockOut(payload);
      setSuccessMessage(`Successfully issued ${quantity} units of ${selectedProduct?.name}. Inventory decremented.`);
      setTimeout(() => {
        navigate('/history');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Stock-out transaction failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">Stock Dispensing (Stock-Out)</h2>
        <p className="text-xs text-slate-500">
          Issue inventory for customer sales, damaged quarantine, expired disposal, or internal consumption
        </p>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form Card */}
        <div className="md:col-span-2 p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Product Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Select Product to Issue *
              </label>
              <div className="relative">
                <Boxes className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(Number(e.target.value))}
                  className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-500"
                  required
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id} disabled={p.currentStock <= 0}>
                      {p.name} [{p.sku}] - Available: {p.currentStock} {p.unit} {p.currentStock <= 0 ? '(OUT OF STOCK)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Transaction Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Dispensing / Transaction Reason *
              </label>
              <select
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
              >
                <option value="SALE">SALE - Customer Order Fulfillment</option>
                <option value="DAMAGED">DAMAGED - Transit or Factory Defect Quarantine</option>
                <option value="EXPIRED">EXPIRED - Shelf Life Depleted</option>
                <option value="INTERNAL_USAGE">INTERNAL_USAGE - R&D or Factory Workstation</option>
                <option value="OTHER">OTHER - Miscellaneous Audit Adjustment</option>
              </select>
            </div>

            {/* Quantity */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-700">Quantity to Deduct *</label>
                <span className="text-[11px] text-slate-500">
                  Available in Bin: <strong className="text-slate-900 font-bold">{currentStock}</strong>
                </span>
              </div>
              <input
                type="number"
                min="1"
                max={currentStock > 0 ? currentStock : 1}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                className={`w-full px-3.5 py-2 text-xs bg-slate-50 border rounded-lg text-slate-900 font-bold focus:outline-none ${
                  isInsufficient ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200 focus:border-emerald-500'
                }`}
                required
              />
              {isInsufficient && (
                <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1 font-medium">
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                  Requested quantity ({quantity}) exceeds available inventory ({currentStock}).
                </p>
              )}
            </div>

            {/* Reference Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Sales Order / Work Order Reference *
              </label>
              <div className="relative">
                <Receipt className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. SO-2026-7841"
                  className="w-full pl-9 pr-3.5 py-2 text-xs font-mono uppercase bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            {/* Remarks */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Operational Remarks</label>
              <textarea
                rows={2}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Optional customer reference, inspection signoff, or dispatch details..."
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || isInsufficient || currentStock <= 0}
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-md transition disabled:opacity-40"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ArrowUpFromLine className="w-4 h-4" />
                  <span>Execute Stock-Out Transaction</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Live Balance Projection Card */}
        <div className="p-6 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-sm space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-rose-400">
              <PackageMinus className="w-5 h-5" />
              <h3 className="text-sm font-bold tracking-tight">Post-Deduction Balance</h3>
            </div>

            {selectedProduct ? (
              <div className="space-y-4 text-xs">
                <div className="pb-3 border-b border-slate-800">
                  <span className="text-slate-400 block">Product</span>
                  <span className="font-semibold text-white text-sm block">{selectedProduct.name}</span>
                  <span className="font-mono text-[11px] text-slate-400">{selectedProduct.sku}</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Current Stock</span>
                    <span className="font-semibold text-slate-200">{currentStock} {selectedProduct.unit}</span>
                  </div>
                  <div className="flex justify-between text-rose-400 font-semibold">
                    <span>Issue Quantity</span>
                    <span>-{quantity} {selectedProduct.unit}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-bold">
                    <span className="text-white">Remaining Balance</span>
                    <span className={`text-base ${remainingStock <= selectedProduct.reorderLevel ? 'text-amber-400' : 'text-white'}`}>
                      {remainingStock} {selectedProduct.unit}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 space-y-1 text-[11px] text-slate-400">
                  <div className="flex justify-between">
                    <span>Transaction Value</span>
                    <span className="text-white font-medium">{formatCurrency(quantity * selectedProduct.sellingPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Safety Threshold</span>
                    <span>Reorder at {selectedProduct.reorderLevel} units</span>
                  </div>
                </div>

                {remainingStock <= selectedProduct.reorderLevel && (
                  <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-300 text-[11px]">
                    ⚠️ Alert: Executing this stock-out will cause inventory to fall to or below the reorder threshold ({selectedProduct.reorderLevel}). An automated low-stock alert will be triggered.
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400">Select a product to view stock balance</p>
            )}
          </div>

          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 text-[11px] text-slate-400">
            🔒 Negative inventory is strictly blocked by both database constraints and backend business validation rules.
          </div>
        </div>
      </div>
    </div>
  );
};
