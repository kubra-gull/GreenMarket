import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Sparkles, 
  Calendar, 
  AlertTriangle, 
  Info, 
  PackagePlus, 
  ShieldCheck, 
  Search, 
  Filter,
  ArrowRight,
  HelpCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { useInventory } from '../../context/InventoryContext';
import { DemandPrediction } from '../../types';

interface DemandPredictionViewProps {
  onOpenRestock: (productId: string, quantity?: number) => void;
}

export const DemandPredictionView: React.FC<DemandPredictionViewProps> = ({ onOpenRestock }) => {
  const { 
    demandPredictions, 
    predictionPeriodDays, 
    setPredictionPeriodDays,
    setSelectedProductDetailId,
    settings 
  } = useInventory();

  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');

  // Filtered prediction list
  const filteredPredictions = useMemo(() => {
    return demandPredictions.filter(d => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matches =
          d.productName.toLowerCase().includes(q) ||
          d.category.toLowerCase().includes(q);
        if (!matches) return false;
      }

      if (riskFilter !== 'All' && d.stockOutRisk !== riskFilter) {
        return false;
      }

      return true;
    });
  }, [demandPredictions, search, riskFilter]);

  // Chart data: Top 6 items comparing Historical Sales -> Current Stock -> Predicted Demand
  const chartData = useMemo(() => {
    return demandPredictions.slice(0, 6).map(d => ({
      name: d.productName.split(' ')[0], // short label
      fullName: d.productName,
      'Historical Sold': d.totalHistoricalSold,
      'Current Stock': d.currentStock,
      'Predicted Demand': d.predictedDemand,
    }));
  }, [demandPredictions]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Demand Prediction & Forecasting
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Velocity-based sales analytics to forecast customer demand and prevent stock-outs.
          </p>
        </div>

        {/* Prediction Window Selector */}
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-500 px-2 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            Forecast Horizon:
          </span>
          {[3, 7, 14, 30].map(days => (
            <button
              key={days}
              onClick={() => setPredictionPeriodDays(days)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                predictionPeriodDays === days
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Next {days} Days
            </button>
          ))}
        </div>
      </div>

      {/* Model Disclaimer Notice */}
      <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-start gap-3">
        <Info className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600 space-y-1">
          <p className="font-bold text-emerald-950">
            Algorithmic Forecasting Notice (Average Daily Velocity Model)
          </p>
          <p>
            Forecasts calculate <strong>Average Daily Demand = Total Units Sold ÷ Days Tracked</strong>, then project <strong>Predicted Demand = Avg Daily × {predictionPeriodDays} Days</strong>. Days Until Stock-Out calculates <strong>Current Stock ÷ Avg Daily Demand</strong>. Predictions are statistical estimates based on historical velocity to aid inventory planning, not guaranteed results.
          </p>
        </div>
      </div>

      {/* Visual Chart: Historical Sales → Current Stock → Predicted Future Demand */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Demand Comparison Overview
            </h2>
            <p className="text-xs text-slate-500">
              Historical Sales (Recorded) → Current Stock On-Hand → Predicted Future Demand (Next {predictionPeriodDays} Days)
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600">
            Top High-Velocity Products
          </span>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                  border: 'none',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
              <Bar dataKey="Historical Sold" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Current Stock" fill="#059669" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Predicted Demand" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search forecast by product name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Risk Level:</span>
          {(['All', 'High', 'Medium', 'Low'] as const).map(risk => (
            <button
              key={risk}
              onClick={() => setRiskFilter(risk)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                riskFilter === risk
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {risk}
            </button>
          ))}
        </div>
      </div>

      {/* Prediction Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Product</th>
                <th className="py-3.5 px-4 text-right">Current Stock</th>
                <th className="py-3.5 px-4 text-right">Avg Daily Demand</th>
                <th className="py-3.5 px-4 text-right">
                  Predicted Demand ({predictionPeriodDays}d)
                </th>
                <th className="py-3.5 px-4">Stock-out Risk</th>
                <th className="py-3.5 px-4">Expected Stock-out</th>
                <th className="py-3.5 px-4 text-right">Recommendation</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredPredictions.map(pred => {
                const isHighRisk = pred.stockOutRisk === 'High';
                const isMedRisk = pred.stockOutRisk === 'Medium';
                const hasNoData = pred.confidence === 'Insufficient Data';

                return (
                  <tr key={pred.productId} className="hover:bg-slate-50/80 transition-colors">
                    {/* Product */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => setSelectedProductDetailId(pred.productId)}
                        className="text-left font-bold text-slate-900 hover:text-emerald-700"
                      >
                        {pred.productName}
                        <span className="block text-[11px] text-slate-400 font-normal">
                          {pred.category}
                        </span>
                      </button>
                    </td>

                    {/* Current Stock */}
                    <td className="py-3.5 px-4 text-right font-black text-slate-900">
                      {pred.currentStock} {pred.unit}
                    </td>

                    {/* Avg Daily Sales */}
                    <td className="py-3.5 px-4 text-right text-slate-700 font-semibold text-xs">
                      {hasNoData ? (
                        <span className="text-slate-400 italic">No sales log</span>
                      ) : (
                        `${pred.avgDailySales} ${pred.unit}/day`
                      )}
                    </td>

                    {/* Predicted Demand */}
                    <td className="py-3.5 px-4 text-right font-black text-blue-700">
                      {hasNoData ? (
                        <span className="text-slate-400 italic">Pending data</span>
                      ) : (
                        `${pred.predictedDemand} ${pred.unit}`
                      )}
                    </td>

                    {/* Stock-out Risk */}
                    <td className="py-3.5 px-4">
                      {hasNoData ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600">
                          Insufficient Data
                        </span>
                      ) : (
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          isHighRisk
                            ? 'bg-rose-100 text-rose-800'
                            : isMedRisk
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            isHighRisk ? 'bg-rose-500' : isMedRisk ? 'bg-amber-500' : 'bg-emerald-500'
                          }`} />
                          {pred.stockOutRisk} Risk
                        </span>
                      )}
                    </td>

                    {/* Expected Stock-out */}
                    <td className="py-3.5 px-4 text-xs font-semibold text-slate-700">
                      {pred.expectedStockOutDate || '—'}
                    </td>

                    {/* Recommendation */}
                    <td className="py-3.5 px-4 text-right">
                      {pred.recommendedOrder > 0 ? (
                        <span className="font-black text-emerald-800 text-xs">
                          Order +{pred.recommendedOrder} {pred.unit}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs font-medium">
                          No action needed
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      {pred.recommendedOrder > 0 ? (
                        <button
                          onClick={() => onOpenRestock(pred.productId, pred.recommendedOrder)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                        >
                          Restock
                        </button>
                      ) : (
                        <button
                          onClick={() => setSelectedProductDetailId(pred.productId)}
                          className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 font-semibold text-xs rounded-xl transition-colors"
                        >
                          Inspect
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
