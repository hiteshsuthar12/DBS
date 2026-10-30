import React, { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { useAuth } from '../context/AuthContext';

export const DashboardLayout: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium text-slate-300">Loading Smart Inventory Platform...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const getPageTitle = (path: string): string => {
    if (path.includes('/dashboard')) return 'Inventory Dashboard';
    if (path.includes('/products')) return 'Product Catalog';
    if (path.includes('/suppliers')) return 'Supplier Directory';
    if (path.includes('/stock/in')) return 'Stock-In Receiving';
    if (path.includes('/stock/out')) return 'Stock-Out Dispensing';
    if (path.includes('/history')) return 'Inventory Transaction Audit';
    if (path.includes('/alerts')) return 'Low Stock Alerts & Monitoring';
    if (path.includes('/ai-predictions')) return 'AI Demand & Reorder Forecasting';
    if (path.includes('/reports')) return 'Reports & Valuation Analytics';
    if (path.includes('/users')) return 'User Access Management';
    if (path.includes('/settings')) return 'System Preferences';
    return 'Smart Inventory';
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Header onMenuToggle={() => setSidebarOpen(true)} title={getPageTitle(location.pathname)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
