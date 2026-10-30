import React, { useEffect, useState } from 'react';
import { supplierApi } from '../../api';
import { Supplier, SupplierRequest, Product } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { formatDateTime } from '../../utils/formatters';
import {
  Truck,
  Plus,
  Search,
  Edit,
  Trash2,
  Boxes,
  Mail,
  Phone,
  MapPin,
  X,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  UserCheck,
} from 'lucide-react';

export const SuppliersPage: React.FC = () => {
  const { isManager, isAdmin } = useAuth();

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [supplierProducts, setSupplierProducts] = useState<Product[] | null>(null);
  const [viewingProductsFor, setViewingProductsFor] = useState<Supplier | null>(null);

  const [formData, setFormData] = useState<SupplierRequest>({
    supplierName: '',
    companyName: '',
    email: '',
    phone: '',
    address: '',
    contactPerson: '',
    gstNumber: '',
    status: 'ACTIVE',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await supplierApi.getAll({
        search: search || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        page,
        size,
      });
      setSuppliers(res.content);
      setTotalElements(res.totalElements);
      setTotalPages(res.totalPages || 1);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch suppliers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, [page, search, statusFilter]);

  const handleOpenCreate = () => {
    setModalMode('create');
    setSelectedSupplier(null);
    setFormData({
      supplierName: '',
      companyName: '',
      email: '',
      phone: '',
      address: '',
      contactPerson: '',
      gstNumber: '',
      status: 'ACTIVE',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: Supplier) => {
    setModalMode('edit');
    setSelectedSupplier(s);
    setFormData({
      supplierName: s.supplierName,
      companyName: s.companyName,
      email: s.email,
      phone: s.phone,
      address: s.address,
      contactPerson: s.contactPerson,
      gstNumber: s.gstNumber || '',
      status: s.status,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleViewProducts = async (s: Supplier) => {
    setViewingProductsFor(s);
    try {
      const prods = await supplierApi.getProducts(s.id);
      setSupplierProducts(prods);
    } catch (err) {
      setSupplierProducts([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      setSubmitting(true);
      if (modalMode === 'create') {
        await supplierApi.create(formData);
      } else if (selectedSupplier) {
        await supplierApi.update(selectedSupplier.id, formData);
      }
      setIsModalOpen(false);
      loadSuppliers();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to save supplier details.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (s: Supplier) => {
    if (s.totalProducts > 0) {
      alert(`Cannot delete supplier '${s.supplierName}': It has ${s.totalProducts} linked products in inventory.`);
      return;
    }
    if (!window.confirm(`Delete supplier vendor '${s.supplierName}'?`)) return;

    try {
      await supplierApi.delete(s.id);
      loadSuppliers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Deletion failed.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Supplier Directory</h2>
          <p className="text-xs text-slate-500">Manage procurement partnerships and vendor agreements</p>
        </div>
        {isManager && (
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Add New Supplier
          </button>
        )}
      </div>

      {/* Search and Filters */}
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
            placeholder="Search suppliers, contact person, email..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(0);
          }}
          className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-emerald-500"
        >
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">Active Suppliers</option>
          <option value="INACTIVE">Inactive Suppliers</option>
        </select>
      </div>

      {/* Supplier Cards/Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Supplier & Company</th>
                <th className="py-3 px-4">Contact Person</th>
                <th className="py-3 px-4">Email & Phone</th>
                <th className="py-3 px-4">GST Number</th>
                <th className="py-3 px-4 text-center">Catalog Items</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading suppliers...
                  </td>
                </tr>
              ) : suppliers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No suppliers match criteria.
                  </td>
                </tr>
              ) : (
                suppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900 block">{s.supplierName}</span>
                      <span className="text-[11px] text-slate-500">{s.companyName}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">{s.contactPerson}</td>
                    <td className="py-3 px-4">
                      <span className="block text-slate-700">{s.email}</span>
                      <span className="text-[11px] text-slate-400">{s.phone}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                      {s.gstNumber || 'Not provided'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleViewProducts(s)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition"
                      >
                        <Boxes className="w-3.5 h-3.5 text-slate-500" />
                        <span>{s.totalProducts}</span>
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 text-[10px] rounded-full border ${
                          s.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {isManager && (
                          <button
                            onClick={() => handleOpenEdit(s)}
                            className="p-1 text-slate-400 hover:text-blue-600 rounded hover:bg-slate-100"
                            title="Edit Supplier"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {isAdmin && (
                          <button
                            onClick={() => handleDelete(s)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100"
                            title="Delete Supplier"
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
            Page <strong>{page + 1}</strong> of <strong>{totalPages}</strong> ({totalElements} suppliers)
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

      {/* Supplier Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {modalMode === 'create' ? 'Register New Supplier' : `Edit: ${selectedSupplier?.supplierName}`}
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Supplier / Brand Name *</label>
                  <input
                    type="text"
                    value={formData.supplierName}
                    onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                    placeholder="e.g. Voltaic Systems"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Registered Legal Entity *</label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                    placeholder="e.g. Voltaic Technologies Pvt Ltd"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Person *</label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                    placeholder="e.g. Rajesh Sharma"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">GST Number (Optional)</label>
                  <input
                    type="text"
                    value={formData.gstNumber}
                    onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 uppercase"
                    placeholder="29AABCT1332L1Z5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                    placeholder="orders@supplier.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Address *</label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                  placeholder="Factory/Warehouse physical street address, city, state, pincode"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
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
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : modalMode === 'create' ? 'Register Supplier' : 'Update Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Supplier Linked Products Modal */}
      {viewingProductsFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Products Supplied by {viewingProductsFor.supplierName}
                </h3>
                <p className="text-xs text-slate-400">{viewingProductsFor.companyName}</p>
              </div>
              <button onClick={() => setViewingProductsFor(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
              {supplierProducts === null ? (
                <div className="py-8 text-center text-xs text-slate-400">Loading catalog...</div>
              ) : supplierProducts.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No products currently linked to this supplier.
                </div>
              ) : (
                supplierProducts.map((p) => (
                  <div key={p.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-slate-900">{p.name}</p>
                      <p className="text-[10px] font-mono text-slate-400">{p.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">{p.currentStock} {p.unit}</p>
                      <p className="text-[10px] text-slate-400">Reorder at {p.reorderLevel}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setViewingProductsFor(null)}
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

