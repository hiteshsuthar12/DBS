import React, { useEffect, useState } from 'react';
import { userApi } from '../../api';
import { User } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Users, Shield, UserCheck, UserX, RefreshCw } from 'lucide-react';

export const UserManagementPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await userApi.getAll();
      setUsers(res);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load user registry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleStatus = async (user: User) => {
    if (user.id === currentUser?.id) {
      alert('You cannot deactivate your own administrative account.');
      return;
    }
    try {
      await userApi.updateStatus(user.id, !user.isActive);
      loadUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update user status.');
    }
  };

  const handleChangeRole = async (user: User, newRole: string) => {
    try {
      await userApi.updateRole(user.id, newRole);
      loadUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update role.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">User Access Management</h2>
          <p className="text-xs text-slate-500">
            Control Role-Based Access Permissions (RBAC) across inventory operational personnel
          </p>
        </div>
        <button
          onClick={loadUsers}
          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-sm transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Users
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Corporate Email</th>
                <th className="py-3 px-4">System Role</th>
                <th className="py-3 px-4">Access Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-900 block">{u.fullName}</span>
                    <span className="text-[11px] font-mono text-slate-400">@{u.username}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{u.email}</td>
                  <td className="py-3 px-4">
                    <select
                      value={u.role}
                      disabled={u.id === currentUser?.id}
                      onChange={(e) => handleChangeRole(u, e.target.value)}
                      className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800 disabled:opacity-50"
                    >
                      <option value="ROLE_ADMIN">ADMIN (Full Access)</option>
                      <option value="ROLE_INVENTORY_MANAGER">INVENTORY_MANAGER</option>
                      <option value="ROLE_STAFF">STAFF (Operations)</option>
                    </select>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 text-[10px] rounded-full border font-semibold ${
                        u.isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {u.isActive ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    {u.id !== currentUser?.id && (
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`px-3 py-1 text-xs font-semibold rounded-lg border transition ${
                          u.isActive
                            ? 'text-rose-600 bg-rose-50 border-rose-200 hover:bg-rose-100'
                            : 'text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

