import React, { useState, useEffect } from 'react';
import { Menu, Bell, Search, LogOut, User as UserIcon, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { alertApi } from '../api';
import { InventoryAlert } from '../types';
import { Link } from 'react-router-dom';

interface HeaderProps {
  onMenuToggle: () => void;
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle, title }) => {
  const { user, logout } = useAuth();
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [showAlertMenu, setShowAlertMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const fetchActiveAlerts = async () => {
      try {
        const data = await alertApi.getActiveAlerts();
        setAlerts(data);
      } catch (err) {
        console.error('Failed to fetch alerts', err);
      }
    };
    fetchActiveAlerts();
    const interval = setInterval(fetchActiveAlerts, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-white border-b border-slate-200/80 sm:px-6">
      {/* Left: Mobile Toggle & Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold text-slate-900 tracking-tight sm:text-xl">
          {title || 'Smart Inventory Platform'}
        </h1>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Global Search Mock/Pill */}
        <div className="relative hidden md:block w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search products, SKUs..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-100 border border-transparent rounded-lg focus:outline-none focus:bg-white focus:border-emerald-500 text-slate-900 placeholder-slate-400 transition"
          />
        </div>

        {/* Alerts Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowAlertMenu(!showAlertMenu)}
            className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition"
            title="Stock Alerts"
          >
            <Bell className="w-5 h-5" />
            {alerts.length > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
            )}
          </button>

          {showAlertMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Active Stock Alerts ({alerts.length})
                </span>
                <Link
                  to="/alerts"
                  onClick={() => setShowAlertMenu(false)}
                  className="text-xs font-medium text-emerald-600 hover:underline"
                >
                  View all
                </Link>
              </div>

              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                {alerts.length === 0 ? (
                  <p className="px-4 py-6 text-center text-xs text-slate-500">
                    All inventory levels healthy. No active alerts.
                  </p>
                ) : (
                  alerts.slice(0, 5).map((a) => (
                    <div key={a.id} className="p-3 hover:bg-slate-50 transition">
                      <div className="flex items-start gap-2">
                        <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-slate-900">{a.productName}</p>
                          <p className="text-[11px] text-slate-500 line-clamp-2">{a.message}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 text-xs font-semibold text-white">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <span className="block text-xs font-semibold text-slate-800 leading-tight">
                {user?.fullName}
              </span>
              <span className="block text-[10px] text-emerald-600 font-medium leading-tight">
                {user?.role?.replace('ROLE_', '')}
              </span>
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-900 truncate">{user?.fullName}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 w-full px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

