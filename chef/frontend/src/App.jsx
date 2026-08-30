import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import CustomerLayout from './layouts/CustomerLayout';
import ManagerLayout from './layouts/ManagerLayout';
import ChefLayout from './layouts/ChefLayout';

// Pages - Auth
import Login from './pages/Login';

// Pages - Customer
import Menu from './pages/customer/Menu';
import Cart from './pages/customer/Cart';
import Checkout from './pages/customer/Checkout';
import OrderTracking from './pages/customer/OrderTracking';
import ValidateTable from './pages/customer/ValidateTable';

// Pages - Chef
import ChefDashboard from './pages/chef/ChefDashboard';

// Pages - Manager
import ManagerDashboard from './pages/manager/ManagerDashboard';
import ManageMenu from './pages/manager/ManageMenu';
import ManageTables from './pages/manager/ManageTables';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    if (!user) return <Navigate to="/login" replace />;
    if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/login" replace />;
    return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth */}
        <Route path="/login" element={<Login />} />

        {/* Customer Routes */}
        <Route path="/" element={<CustomerLayout />}>
          <Route index element={
            <div style={{textAlign: 'center', padding: '2rem'}}>
                <h2>Welcome to Our Restaurant</h2>
                <p>Please scan the QR code on your table to view the menu.</p>
            </div>
          } />
          <Route path="table/:qrToken" element={<ValidateTable />} />
          <Route path="menu" element={<Menu />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="order/:id" element={<OrderTracking />} />
        </Route>

        {/* Chef Routes */}
        <Route path="/chef" element={
            <ProtectedRoute allowedRoles={['CHEF', 'MANAGER']}>
                <ChefLayout />
            </ProtectedRoute>
        }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<ChefDashboard />} />
        </Route>

        {/* Manager Routes */}
        <Route path="/manager" element={
            <ProtectedRoute allowedRoles={['MANAGER']}>
                <ManagerLayout />
            </ProtectedRoute>
        }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<ManagerDashboard />} />
            <Route path="menu" element={<ManageMenu />} />
            <Route path="tables" element={<ManageTables />} />
        </Route>

      </Routes>
    </Router>
  );
}

export default App;
