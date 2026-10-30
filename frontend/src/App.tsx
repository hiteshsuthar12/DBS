import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DashboardLayout } from './layouts/DashboardLayout';

import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { Dashboard } from './pages/dashboard/Dashboard';
import { ProductsPage } from './pages/products/ProductsPage';
import { SuppliersPage } from './pages/suppliers/SuppliersPage';
import { StockInPage } from './pages/stock/StockInPage';
import { StockOutPage } from './pages/stock/StockOutPage';
import { InventoryHistoryPage } from './pages/history/InventoryHistoryPage';
import { LowStockAlertsPage } from './pages/alerts/LowStockAlertsPage';
import { AiPredictionsPage } from './pages/ai/AiPredictionsPage';
import { ReportsPage } from './pages/reports/ReportsPage';
import { UserManagementPage } from './pages/users/UserManagementPage';
import { SettingsPage } from './pages/settings/SettingsPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Application Routes */}
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/suppliers" element={<SuppliersPage />} />
            <Route path="/stock/in" element={<StockInPage />} />
            <Route path="/stock/out" element={<StockOutPage />} />
            <Route path="/history" element={<InventoryHistoryPage />} />
            <Route path="/alerts" element={<LowStockAlertsPage />} />
            <Route path="/ai-predictions" element={<AiPredictionsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/users" element={<UserManagementPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
