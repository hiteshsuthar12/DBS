import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Boxes,
  Truck,
  ArrowDownToLine,
  ArrowUpFromLine,
  History,
  AlertTriangle,
  Sparkles,
  BarChart3,
  Users,
  Settings,
  X,
  PackageCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeAlertCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, activeAlertCount = 0 }) => {
  const { user, isAdmin } = useAuth();

  const navigation = [
    { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { name: 'Products', to: '/products', icon: Boxes },
    { name: 'Suppliers', to: '/suppliers', icon: Truck },
    { name: 'Stock In', to: '/stock/in', icon: ArrowDownToLine },
    { name: 'Stock Out', to: '/stock/out', icon: ArrowUpFromLine },
    { name: 'Inventory History', to: '/history', icon: History },
    {
      name: 'Low Stock Alerts',
      to: '/alerts',
      icon: AlertTriangle,
      badge: activeAlertCount > 0 ? activeAlertCount : undefined,
    },
    { name: 'AI Predictions', to: '/ai-predictions', icon: Sparkles, highlight: true },
    { name: 'Reports & Analytics', to: '/reports', icon: BarChart3 },
    ...(isAdmin ? [{ name: 'User Management', to: '/users', icon: Users }] : []),
    { name: 'Settings', to: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-slate-900 text-slate-300 border-r border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-bold text-white tracking-tight">SmartInventory</span>
              <span className="block text-[10px] font-medium text-emerald-400 uppercase tracking-widest">
                AI Platform
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              onClick={() => onClose()}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-950/20 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </div>
              {item.badge !== undefined && (
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {item.badge}
                </span>
              )}
              {item.highlight && (
                <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  AI
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-sm font-semibold text-emerald-400 border border-slate-700">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.fullName}</p>
              <p className="text-xs text-slate-400 truncate">
                {user?.role?.replace('ROLE_', '')}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

