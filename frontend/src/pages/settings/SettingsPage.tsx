import React, { useState } from 'react';
import { Settings, Server, Database, BrainCircuit, Shield, CheckCircle2 } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [defaultLeadTime, setDefaultLeadTime] = useState(7);
  const [serviceLevel, setServiceLevel] = useState(95);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">System Preferences & Architecture</h2>
        <p className="text-xs text-slate-500">
          Environment configuration, AI forecasting parameters, and microservice connectivity
        </p>
      </div>

      {saveSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Operational parameters saved successfully.</span>
        </div>
      )}

      {/* Microservice Topology Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Core REST Backend</span>
            <span className="px-2 py-0.5 text-[10px] rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
              Operational
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-slate-700" />
            <div>
              <p className="text-xs font-bold text-slate-900">Spring Boot 3.3.5 / Java 21</p>
              <p className="text-[11px] font-mono text-slate-400">Port 8080 • JWT Auth</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Transactional Database</span>
            <span className="px-2 py-0.5 text-[10px] rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
              Connected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-slate-700" />
            <div>
              <p className="text-xs font-bold text-slate-900">PostgreSQL 18</p>
              <p className="text-[11px] font-mono text-slate-400">Flyway Migrations V1-V2</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Forecasting Engine</span>
            <span className="px-2 py-0.5 text-[10px] rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
              Active
            </span>
          </div>
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-indigo-600" />
            <div>
              <p className="text-xs font-bold text-slate-900">Python 3.11 FastAPI</p>
              <p className="text-[11px] font-mono text-slate-400">Scikit-Learn • Port 8000</p>
            </div>
          </div>
        </div>
      </div>

      {/* Operational Defaults Form */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
        <h3 className="text-sm font-bold text-slate-900">Procurement & Forecasting Parameters</h3>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Default Supplier Lead Time (Days)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={defaultLeadTime}
                onChange={(e) => setDefaultLeadTime(parseInt(e.target.value) || 7)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Standard baseline used when vendor lead time is uncalibrated.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Safety Service Level (%)
              </label>
              <select
                value={serviceLevel}
                onChange={(e) => setServiceLevel(parseInt(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
              >
                <option value="90">90% Service Level (Z = 1.28)</option>
                <option value="95">95% Service Level (Z = 1.65 - Recommended)</option>
                <option value="99">99% Service Level (Z = 2.33 - Critical Spares)</option>
              </select>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Determines safety stock buffer exponent in the EOQ model.
              </span>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm transition"
            >
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

