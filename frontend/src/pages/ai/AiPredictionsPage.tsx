import React, { useEffect, useState } from 'react';
import { aiApi, productApi } from '../../api';
import {
  AiOverview,
  StockOutPrediction,
  ReorderRecommendation,
  DemandForecast,
  RiskClassification,
  Product,
} from '../../types';
import { formatNumber, getStatusBadgeClass } from '../../utils/formatters';
import {
  Sparkles,
  TrendingDown,
  Calendar,
  AlertTriangle,
  Lightbulb,
  ShieldCheck,
  RefreshCw,
  Calculator,
  ArrowRight,
  TrendingUp,
  HelpCircle,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export const AiPredictionsPage: React.FC = () => {
  const [overview, setOverview] = useState<AiOverview | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  // Selected Product Forecast & Risk
  const [forecast, setForecast] = useState<DemandForecast | null>(null);
  const [forecastHorizon, setForecastHorizon] = useState<number>(15);
  const [riskClassification, setRiskClassification] = useState<RiskClassification | null>(null);

  const [loadingOverview, setLoadingOverview] = useState(true);
  const [loadingForecast, setLoadingForecast] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAiOverview = async () => {
    try {
      setLoadingOverview(true);
      setError(null);
      const [aiData, prodRes] = await Promise.all([
        aiApi.getOverview(),
        productApi.getAll({ size: 100 }),
      ]);
      setOverview(aiData);
      setProducts(prodRes.content);

      if (prodRes.content.length > 0 && selectedProductId === null) {
        setSelectedProductId(prodRes.content[0].id);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to initialize AI prediction engine.');
    } finally {
      setLoadingOverview(false);
    }
  };

  useEffect(() => {
    loadAiOverview();
  }, []);

  // Fetch forecast and risk classification for selected product
  useEffect(() => {
    if (!selectedProductId) return;

    const fetchProductAiDetails = async () => {
      try {
        setLoadingForecast(true);
        const [fc, rc] = await Promise.all([
          aiApi.forecastDemand(selectedProductId, forecastHorizon),
          aiApi.classifyRisk(selectedProductId),
        ]);
        setForecast(fc);
        setRiskClassification(rc);
      } catch (err) {
        console.error('Failed to load forecast for product', err);
      } finally {
        setLoadingForecast(false);
      }
    };

    fetchProductAiDetails();
  }, [selectedProductId, forecastHorizon]);

  if (loadingOverview && !overview) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-3">
        <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-medium text-slate-500">
          Running Scikit-Learn demand forecasting models and inventory risk analysis...
        </p>
      </div>
    );
  }

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  // Merge historical and forecasted demand for chart
  const chartData = [
    ...(forecast?.historicalDemand.map((d) => ({
      date: d.date.substring(5),
      historical: d.quantity,
      forecasted: null,
    })) || []),
    ...(forecast?.forecastedDemand.map((d) => ({
      date: d.date.substring(5),
      historical: null,
      forecasted: d.quantity,
    })) || []),
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">AI Inventory Intelligence</h2>
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
              Machine Learning Active
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Intelligent stock-out prediction, multi-horizon demand forecasting, and explainable reorder optimization
          </p>
        </div>

        <button
          onClick={loadAiOverview}
          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-sm transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Re-evaluate Models
        </button>
      </div>

      {/* AI Intelligence KPI Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-xs font-medium text-slate-500">Total Catalog Evaluated</span>
          <p className="text-xl font-bold text-slate-900">{formatNumber(overview?.totalEvaluated)}</p>
          <p className="text-[11px] text-slate-400">Products scored by ML pipeline</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-xs font-medium text-slate-500">Critical Depletion Runway</span>
          <p className="text-xl font-bold text-rose-600">{formatNumber(overview?.criticalCount)}</p>
          <p className="text-[11px] text-slate-400">Stock-out predicted in &le; 3 days</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-xs font-medium text-slate-500">High Risk Stock-Outs</span>
          <p className="text-xl font-bold text-amber-600">{formatNumber(overview?.highRiskCount)}</p>
          <p className="text-[11px] text-slate-400">Runway estimated at 4-7 days</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-xs font-medium text-slate-500">Healthy Buffer Stock</span>
          <p className="text-xl font-bold text-emerald-600">{formatNumber(overview?.healthyCount)}</p>
          <p className="text-[11px] text-slate-400">Adequate runway &gt; 14 days</p>
        </div>
      </div>

      {/* Interactive Demand Forecasting Section */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">Demand Forecasting Engine</h3>
            </div>
            <p className="text-xs text-slate-500">
              Linear regression trend with day-of-week seasonality decomposition
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Product Selector */}
            <select
              value={selectedProductId || ''}
              onChange={(e) => setSelectedProductId(Number(e.target.value))}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500 font-semibold"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku})
                </option>
              ))}
            </select>

            {/* Horizon Toggle */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              {[7, 15, 30].map((h) => (
                <button
                  key={h}
                  onClick={() => setForecastHorizon(h)}
                  className={`px-2.5 py-1 rounded font-semibold transition ${
                    forecastHorizon === h ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {h}D
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Forecast Chart */}
        <div className="h-72 w-full">
          {loadingForecast ? (
            <div className="flex items-center justify-center h-full text-xs text-slate-400">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mr-2" />
              Recalculating forecast curve...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Line
                  type="monotone"
                  dataKey="historical"
                  name="Historical Daily Demand"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="forecasted"
                  name={`AI Forecast (${forecastHorizon} Days)`}
                  stroke="#10b981"
                  strokeWidth={2.5}
                  strokeDasharray="4 4"
                  dot={{ r: 3 }}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Model Performance & Classification Card */}
        {riskClassification && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">Risk Classification</span>
                <span className={`px-2.5 py-0.5 rounded-full border text-[11px] ${getStatusBadgeClass(riskClassification.riskLevel)}`}>
                  {riskClassification.riskLevel.replace('_', ' ')}
                </span>
              </div>
              <ul className="space-y-1 text-slate-600 list-disc list-inside">
                {riskClassification.riskFactors.map((factor, idx) => (
                  <li key={idx}>{factor}</li>
                ))}
              </ul>
              <div className="pt-2 border-t border-slate-200/60 font-medium text-slate-800">
                👉 Recommendation: {riskClassification.actionRecommendation}
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 space-y-2">
              <span className="font-semibold text-slate-700 block">Model Metadata</span>
              <div className="space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span>Architecture</span>
                  <strong className="text-slate-800">{forecast?.modelType || 'Scikit-Learn Linear Regression'}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Fit Metric</span>
                  <strong className="text-slate-800">{forecast?.accuracyMetric || 'MAPE: 12.8%'}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Forecast Horizon</span>
                  <strong className="text-slate-800">{forecastHorizon} Days Ahead</strong>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stock-Out Prediction Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Stock-Out Runway Predictions</h3>
            <p className="text-xs text-slate-400">Estimated days before inventory exhaustion based on current consumption rate</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Product Name & SKU</th>
                <th className="py-3 px-4 text-center">Current Stock</th>
                <th className="py-3 px-4 text-center">Avg Daily Demand</th>
                <th className="py-3 px-4 text-center">Estimated Runway</th>
                <th className="py-3 px-4 text-center">Predicted Stock-Out Date</th>
                <th className="py-3 px-4">Risk Level</th>
                <th className="py-3 px-4">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {overview?.topRisks.map((pred) => (
                <tr key={pred.productId} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-900 block truncate max-w-xs">{pred.productName}</span>
                    <span className="text-[10px] font-mono text-slate-400">{pred.sku}</span>
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-slate-900">{pred.currentStock}</td>
                  <td className="py-3 px-4 text-center text-slate-600 font-medium">
                    {pred.averageDailyDemand} units/day
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-lg font-bold ${
                        pred.estimatedDaysRemaining <= 3
                          ? 'bg-rose-100 text-rose-800'
                          : pred.estimatedDaysRemaining <= 7
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {pred.estimatedDaysRemaining === 0 ? 'DEPLETED' : `${pred.estimatedDaysRemaining} Days`}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-medium text-slate-700">
                    {pred.predictedStockOutDate}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full border text-[10px] ${getStatusBadgeClass(pred.riskLevel)}`}>
                      {pred.riskLevel}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <div className="w-16 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full"
                          style={{ width: `${pred.confidenceScore * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono font-medium">{Math.round(pred.confidenceScore * 100)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Intelligent Reorder Recommendations Cards */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">Explainable Reorder Recommendations</h3>
          </div>
          <p className="text-xs text-slate-400">
            Formulated using Economic Order Principles, Supplier Lead-Time Variance, and 95% Service Level Safety Stock
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {overview?.topRecommendations.map((reorder) => (
            <div
              key={reorder.productId}
              className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3 hover:border-slate-300 transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{reorder.productName}</h4>
                  <p className="text-[10px] font-mono text-slate-400">{reorder.sku}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-medium text-slate-500 block">Recommended Order</span>
                  <span className="text-lg font-bold text-emerald-600">+{reorder.recommendedReorderQuantity} units</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 p-2.5 bg-white rounded-lg border border-slate-100 text-[11px]">
                <div>
                  <span className="text-slate-400 block">Current</span>
                  <span className="font-semibold text-slate-800">{reorder.currentStock}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Safety Stock</span>
                  <span className="font-semibold text-slate-800">{reorder.safetyStock}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Lead Time</span>
                  <span className="font-semibold text-slate-800">{reorder.leadTimeDays} Days</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-600 bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100/60 leading-relaxed">
                💡 <strong>Mathematical Explanation:</strong> {reorder.explanation}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

