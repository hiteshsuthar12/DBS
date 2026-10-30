import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productApi, supplierApi, stockApi } from '../../api';
import { Product, Supplier, StockInRequest } from '../../types';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import {
  ArrowDownToLine,
  PackageCheck,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Building2,
  Boxes,
  ArrowRight,
} from 'lucide-react';

export const StockInPage: React.FC = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Form State
  const [selectedProductId, setSelectedProductId] = useState<number | ''>('');
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<number>(10);
  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [remarks, setRemarks] = useState<string>('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadPrerequisites = async () => {
      try {
        const [prodRes, supRes] = await Promise.all([
          productApi.getAll({ size: 100 }),
          supplierApi.getAll({ size: 100 }),
        ]);
        setProducts(prodRes.content);
        setSuppliers(supRes.content);

        if (prodRes.content.length > 0) {
          const first = prodRes.content[0];
          setSelectedProductId(first.id);
          setPurchasePrice(first.purchasePrice);
          if (first.supplierId) {
            setSelectedSupplierId(first.supplierId);
          }
        }
      } catch (err: any) {
        setError('Failed to load products and suppliers for stock-in workflow.');
      } finally {
        setLoadingInitial(false);
      }
    };
    loadPrerequisites();
  }, []);

  const selectedProduct = products.find((p) => p.id === Number(selectedProductId));

  const handleProductChange = (prodId: number) => {
    setSelectedProductId(prodId);
    const prod = products.find((p) => p.id === prodId);
    if (prod) {
      setPurchasePrice(prod.purchasePrice);
      if (prod.supplierId) {
        setSelectedSupplierId(prod.supplierId);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || quantity <= 0 || !referenceNumber.trim()) {
      setError('Please select a product, enter a positive quantity, and provide an invoice/reference number.');
      return;
    }

    const payload: StockInRequest = {
      productId: Number(selectedProductId),
      supplierId: selectedSupplierId ? Number(selectedSupplierId) : undefined,
      quantity,
      purchasePrice,
      referenceNumber: referenceNumber.trim(),
      remarks: remarks.trim() || undefined,
    };

    try {
      setSubmitting(true);
      setError(null);
      await stockApi.stockIn(payload);
      setSuccessMessage(`Successfully received ${quantity} units of ${selectedProduct?.name}. Inventory ledger updated.`);
      setTimeout(() => {
        navigate('/history');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Stock-in transaction failed. Check parameters.');
    } finally {
      setSubmitting(false);
    }
  };

  const currentStock = selectedProduct?.currentStock || 0;
  const newStock = currentStock + (quantity || 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">Stock Receiving (Stock-In)</h2>
        <p className="text-xs text-slate-500">
          Record vendor delivery receipts, update physical inventory, and settle active low-stock alerts
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
                Target Product to Replenish *
              </label>
              <div className="relative">
                <Boxes className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={selectedProductId}
                  onChange={(e) => handleProductChange(Number(e.target.value))}
                  className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-500"
                  required
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} [{p.sku}] - Current: {p.currentStock} {p.unit}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Supplier Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Fulfilling Supplier / Vendor</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-500"
                >
                  <option value="">Vendor Not Specified / Direct</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.supplierName} ({s.companyName})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quantity and Purchase Price */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Quantity Received *</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Unit Purchase Price (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Invoice / Reference Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Invoice / Delivery Challan Number *
              </label>
              <div className="relative">
                <Receipt className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. INV-2026-90412"
                  className="w-full pl-9 pr-3.5 py-2 text-xs font-mono uppercase bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            {/* Remarks */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Batch / Quality Remarks</label>
              <textarea
                rows={2}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Optional delivery details, bay location, inspection result..."
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || quantity <= 0}
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md shadow-emerald-950/20 transition disabled:opacity-50"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ArrowDownToLine className="w-4 h-4" />
                  <span>Confirm & Commit Stock-In to Database</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Live Inventory Preview Card */}
        <div className="p-6 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-sm space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-400">
              <PackageCheck className="w-5 h-5" />
              <h3 className="text-sm font-bold tracking-tight">Real-Time Stock Projection</h3>
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
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>Incoming Receipt</span>
                    <span>+{quantity} {selectedProduct.unit}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-bold">
                    <span className="text-white">Projected Balance</span>
                    <span className="text-emerald-400 text-base">{newStock} {selectedProduct.unit}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 space-y-1 text-[11px] text-slate-400">
                  <div className="flex justify-between">
                    <span>Batch Valuation Increase</span>
                    <span className="text-white font-medium">{formatCurrency(quantity * purchasePrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Reorder Threshold</span>
                    <span>{selectedProduct.reorderLevel} units</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">Select a product to view stock projections</p>
            )}
          </div>

          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 text-[11px] text-slate-400">
            ℹ️ Submitting this form executes an atomic database transaction. Current stock is updated, an auditable transaction ledger entry is sealed, and active low-stock alerts are cleared if the new level meets safety criteria.
          </div>
        </div>
      </div>
    </div>
  );
};
