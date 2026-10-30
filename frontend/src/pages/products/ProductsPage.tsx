import React, { useEffect, useState } from 'react';
import { productApi, categoryApi, supplierApi } from '../../api';
import { Product, Category, Supplier, ProductRequest } from '../../types';
import { formatCurrency, formatNumber, getStatusBadgeClass } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import {
  Boxes,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  AlertTriangle,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
} from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const { isManager, isAdmin } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);

  // Form State
  const [formData, setFormData] = useState<ProductRequest>({
    name: '',
    sku: '',
    description: '',
    categoryId: 1,
    unit: 'PCS',
    purchasePrice: 0,
    sellingPrice: 0,
    currentStock: 0,
    minimumStockLevel: 10,
    maximumStockLevel: 500,
    reorderLevel: 20,
    supplierId: undefined,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [prodPage, cats, sups] = await Promise.all([
        productApi.getAll({
          search: search || undefined,
          categoryId: selectedCategory ? Number(selectedCategory) : undefined,
          stockStatus: selectedStatus !== 'ALL' ? selectedStatus : undefined,
          page,
          size,
        }),
        categoryApi.getAll(),
        supplierApi.getAll({ size: 100 }).then((res) => res.content),
      ]);

      setProducts(prodPage.content);
      setTotalElements(prodPage.totalElements);
      setTotalPages(prodPage.totalPages || 1);
      setCategories(cats);
      setSuppliers(sups);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch product catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, search, selectedCategory, selectedStatus]);

  const handleOpenCreate = () => {
    setModalMode('create');
    setSelectedProduct(null);
    setFormData({
      name: '',
      sku: '',
      description: '',
      categoryId: categories[0]?.id || 1,
      unit: 'PCS',
      purchasePrice: 100,
      sellingPrice: 150,
      currentStock: 25,
      minimumStockLevel: 10,
      maximumStockLevel: 200,
      reorderLevel: 20,
      supplierId: suppliers[0]?.id || undefined,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setModalMode('edit');
    setSelectedProduct(p);
    setFormData({
      name: p.name,
      sku: p.sku,
      description: p.description || '',
      categoryId: p.categoryId,
      unit: p.unit,
      purchasePrice: p.purchasePrice,
      sellingPrice: p.sellingPrice,
      currentStock: p.currentStock,
      minimumStockLevel: p.minimumStockLevel,
      maximumStockLevel: p.maximumStockLevel,
      reorderLevel: p.reorderLevel,
      supplierId: p.supplierId,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (formData.minimumStockLevel > formData.maximumStockLevel) {
      setFormError('Minimum stock level cannot be greater than maximum stock level.');
      return;
    }

    try {
      setFormSubmitting(true);
      if (modalMode === 'create') {
        await productApi.create(formData);
      } else if (selectedProduct) {
        await productApi.update(selectedProduct.id, formData);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to save product details.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (p: Product) => {
    if (!window.confirm(`Are you sure you want to delete product '${p.name}' (SKU: ${p.sku})?`)) {
      return;
    }
    try {
      await productApi.delete(p.id);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Cannot delete product with existing transaction records.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Product Management</h2>
          <p className="text-xs text-slate-500">
            Maintain master SKU registry, safety boundaries, and pricing
          </p>
        </div>
        {isManager && (
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Add New Product
          </button>
        )}
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
            placeholder="Search by name, SKU, description..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(0);
            }}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(0);
            }}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Stock Statuses</option>
            <option value="HEALTHY">Healthy Stock</option>
            <option value="LOW">Low Stock</option>
            <option value="CRITICAL">Critical Stock</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Product Data Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">SKU / Product Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Available Stock</th>
                <th className="py-3 px-4 text-right">Purchase Price</th>
                <th className="py-3 px-4 text-right">Selling Price</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading product catalog...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No products found matching active filters.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900 block truncate max-w-xs">{p.name}</span>
                      <span className="text-[11px] font-mono text-slate-400">{p.sku}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{p.categoryName}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-bold text-slate-900">{formatNumber(p.currentStock)}</span>
                      <span className="text-[10px] text-slate-400 ml-1">{p.unit}</span>
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-slate-600">
                      {formatCurrency(p.purchasePrice)}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-slate-900">
                      {formatCurrency(p.sellingPrice)}
                    </td>
                    <td className="py-3 px-4 text-slate-600 truncate max-w-[140px]">
                      {p.supplierName || '-'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 text-[10px] rounded-full border ${getStatusBadgeClass(
                          p.stockStatus
                        )}`}
                      >
                        {p.stockStatus.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setDetailProduct(p)}
                          className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {isManager && (
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1 text-slate-400 hover:text-blue-600 rounded hover:bg-slate-100"
                            title="Edit Product"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {isAdmin && (
                          <button
                            onClick={() => handleDelete(p)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
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
            Showing page <strong>{page + 1}</strong> of <strong>{totalPages}</strong> ({totalElements} items)
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

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {modalMode === 'create' ? 'Add New Product' : `Edit Product: ${selectedProduct?.sku}`}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Product Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                    placeholder="e.g. Industrial Sensor 24V"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">SKU (Unique) *</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 uppercase"
                    placeholder="e.g. ELEC-SEN-001"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Supplier *</label>
                  <select
                    value={formData.supplierId || ''}
                    onChange={(e) => setFormData({ ...formData, supplierId: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">No Supplier Assigned</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.supplierName} ({s.companyName})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Unit</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                    placeholder="PCS, BOX, KG"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Purchase Price (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* Stock Thresholds */}
              <div className="grid grid-cols-4 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Current Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.currentStock}
                    onChange={(e) => setFormData({ ...formData, currentStock: parseInt(e.target.value) || 0 })}
                    className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded"
                    disabled={modalMode === 'edit'}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Min Level</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minimumStockLevel}
                    onChange={(e) => setFormData({ ...formData, minimumStockLevel: parseInt(e.target.value) || 0 })}
                    className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Reorder Level</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.reorderLevel}
                    onChange={(e) => setFormData({ ...formData, reorderLevel: parseInt(e.target.value) || 0 })}
                    className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Max Level</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.maximumStockLevel}
                    onChange={(e) => setFormData({ ...formData, maximumStockLevel: parseInt(e.target.value) || 0 })}
                    className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                  placeholder="Optional technical specifications or notes..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm disabled:opacity-50"
                >
                  {formSubmitting ? 'Saving...' : modalMode === 'create' ? 'Create Product' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {detailProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">{detailProduct.name}</h3>
                <p className="text-xs font-mono text-slate-400">SKU: {detailProduct.sku}</p>
              </div>
              <button onClick={() => setDetailProduct(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-slate-400">Category</p>
                <p className="font-semibold text-slate-800">{detailProduct.categoryName}</p>
              </div>
              <div>
                <p className="text-slate-400">Supplier</p>
                <p className="font-semibold text-slate-800">{detailProduct.supplierName || 'None'}</p>
              </div>
              <div>
                <p className="text-slate-400">Available Stock</p>
                <p className="font-bold text-base text-slate-900">
                  {detailProduct.currentStock} {detailProduct.unit}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Stock Status</p>
                <span
                  className={`inline-block mt-1 px-2.5 py-0.5 rounded-full border ${getStatusBadgeClass(
                    detailProduct.stockStatus
                  )}`}
                >
                  {detailProduct.stockStatus}
                </span>
              </div>
              <div>
                <p className="text-slate-400">Purchase Price</p>
                <p className="font-semibold text-slate-800">{formatCurrency(detailProduct.purchasePrice)}</p>
              </div>
              <div>
                <p className="text-slate-400">Selling Price</p>
                <p className="font-semibold text-slate-800">{formatCurrency(detailProduct.sellingPrice)}</p>
              </div>
              <div>
                <p className="text-slate-400">Reorder Threshold</p>
                <p className="font-semibold text-slate-800">{detailProduct.reorderLevel} units</p>
              </div>
              <div>
                <p className="text-slate-400">Safety Buffer Bounds</p>
                <p className="font-semibold text-slate-800">
                  Min: {detailProduct.minimumStockLevel} / Max: {detailProduct.maximumStockLevel}
                </p>
              </div>
            </div>

            {detailProduct.description && (
              <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600">
                <p className="font-semibold text-slate-800 mb-0.5">Description</p>
                <p>{detailProduct.description}</p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setDetailProduct(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
