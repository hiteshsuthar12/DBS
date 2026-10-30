import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PackageCheck, Lock, User, AlertCircle, ArrowRight } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please provide both username and password.');
      return;
    }

    try {
      setError(null);
      setLoading(true);
      await login({ username, password });
      navigate(from, { replace: true });
    } catch (err: any) {
      const message = err.response?.data?.message || 'Invalid username or password';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError(null);
  };

  return (
    <div className="flex min-h-screen bg-slate-900 text-white">
      {/* Left Banner */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/40 border-r border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <PackageCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">SmartInventory</h1>
            <p className="text-xs text-emerald-400 font-medium">Enterprise AI Stock Optimization Platform</p>
          </div>
        </div>

        <div className="space-y-6 max-w-md">
          <div className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            Autonomous Inventory Optimization
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white leading-tight">
            Predict stock-outs. Prevent shortages. Automate reorders.
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Real-time PostgreSQL transactions powered by Spring Boot backend business logic and Python FastAPI demand forecasting models.
          </p>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800/80">
            <div>
              <p className="text-2xl font-bold text-white">99.8%</p>
              <p className="text-xs text-slate-400">Inventory Accuracy</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-400">0%</p>
              <p className="text-xs text-slate-400">Stock Discrepancies</p>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-500">
          Academic Project Evaluation Edition • Enterprise Stack v1.0
        </div>
      </div>

      {/* Right Login Card */}
      <div className="flex items-center justify-center flex-1 p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8 bg-slate-950/60 p-8 rounded-2xl border border-slate-800 shadow-2xl backdrop-blur-sm">
          <div className="space-y-2 text-center lg:text-left">
            <div className="flex lg:hidden items-center justify-center gap-2 mb-4">
              <PackageCheck className="w-7 h-7 text-emerald-400" />
              <span className="text-lg font-bold text-white">SmartInventory</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Welcome back</h2>
            <p className="text-xs text-slate-400">Enter your enterprise credentials to access your workspace</p>
          </div>

          {error && (
            <div className="flex items-start gap-3 p-3.5 text-xs text-rose-300 bg-rose-950/40 border border-rose-800/60 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1.5 text-xs font-medium text-slate-300">Username or Email</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin or manager"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block mb-1.5 text-xs font-medium text-slate-300">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 text-sm font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-lg shadow-emerald-950/20 transition disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Fill Buttons */}
          <div className="pt-4 border-t border-slate-800">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
              1-Click Demo Profiles (Evaluation):
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillCredentials('admin', 'Admin@123')}
                className="px-2 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('manager', 'Manager@123')}
                className="px-2 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition"
              >
                Manager
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('staff', 'Staff@123')}
                className="px-2 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition"
              >
                Staff
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-slate-400">
            Need an employee account?{' '}
            <Link to="/register" className="text-emerald-400 font-semibold hover:underline">
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

