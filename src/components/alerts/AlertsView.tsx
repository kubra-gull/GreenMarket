import React, { useState, useMemo } from 'react';
import { 
  AlertTriangle, 
  AlertOctagon, 
  CheckCircle2, 
  PackagePlus, 
  Filter, 
  ArrowRight, 
  TrendingUp, 
  Info,
  Check,
  Building2
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { AlertSeverity } from '../../types';

interface AlertsViewProps {
  onOpenRestock: (productId: string) => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({ onOpenRestock }) => {
  const { products, alerts, restockProduct, setSelectedProductDetailId, settings } = useInventory();

  const [severityFilter, setSeverityFilter] = useState<'All' | 'critical' | 'low' | 'normal'>('All');
  const [restockedToast, setRestockedToast] = useState<string | null>(null);

  // Normal items (stock > minStockLevel)
  const normalProducts = useMemo(() => {
    return products.filter(p => p.currentStock > p.minStockLevel);
  }, [products]);

  // Filtered alert list
  const filteredAlerts = useMemo(() => {
    if (severityFilter === 'All') return alerts;
    if (severityFilter === 'normal') return [];
    return alerts.filter(a => a.severity === severityFilter);
  }, [alerts, severityFilter]);

  const criticalCount = alerts.filter(a => a.severity === 'critical').length;
  const lowCount = alerts.filter(a => a.severity === 'low').length;
  const normalCount = normalProducts.length;

  const handleQuickRestockRecommended = (productId: string, quantity: number, productName: string, unit: string) => {
    restockProduct(productId, quantity, `Urgent Restock to safety threshold (+${quantity} ${unit})`);
    setRestockedToast(`Successfully restocked ${productName} (+${quantity} ${unit})!`);
    setTimeout(() => setRestockedToast(null), 4000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Alert */}
      {restockedToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-emerald-800 text-white font-semibold text-sm rounded-xl shadow-2xl border border-emerald-600 animate-in fade-in slide-in-from-bottom-4">
          <Check className="w-5 h-5 text-emerald-300" />
          <span>{restockedToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Low Stock Alert System
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Automated monitoring detecting products at or below safety levels with smart restock orders.
          </p>
        </div>

        {/* Status badges summary */}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-100 text-rose-800 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            {criticalCount} Critical
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 text-amber-800 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            {lowCount} Low Stock
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            {normalCount} Healthy
          </span>
        </div>
      </div>

      {/* Severity Filter Tabs */}
      <div className="flex items-center p-1 bg-white border border-slate-200/80 rounded-2xl shadow-xs w-fit">
        <button
          onClick={() => setSeverityFilter('All')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            severityFilter === 'All'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All Active Alerts ({alerts.length})
        </button>
        <button
          onClick={() => setSeverityFilter('critical')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            severityFilter === 'critical'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-rose-700 hover:bg-rose-50'
          }`}
        >
          🔴 Critical Only ({criticalCount})
        </button>
        <button
          onClick={() => setSeverityFilter('low')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            severityFilter === 'low'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-amber-700 hover:bg-amber-50'
          }`}
        >
          🟠 Low Stock ({lowCount})
        </button>
        <button
          onClick={() => setSeverityFilter('normal')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            severityFilter === 'normal'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-emerald-700 hover:bg-emerald-50'
          }`}
        >
          🟢 Normal Inventory ({normalCount})
        </button>
      </div>

      {/* Active Alerts List */}
      {severityFilter !== 'normal' && (
        <div className="space-y-3">
          {filteredAlerts.length > 0 ? (
            filteredAlerts.map(alert => {
              const isCritical = alert.severity === 'critical';
              const stockRatio = Math.round((alert.currentStock / alert.minStockLevel) * 100);

              return (
                <div
                  key={alert.productId}
                  className={`p-5 rounded-2xl border shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isCritical
                      ? 'bg-rose-50/40 border-rose-200 hover:border-rose-300'
                      : 'bg-amber-50/40 border-amber-200 hover:border-amber-300'
                  }`}
                >
                  {/* Left info */}
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      isCritical ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                    }`}>
                      {isCritical ? (
                        <AlertOctagon className="w-6 h-6 stroke-[2.2]" />
                      ) : (
                        <AlertTriangle className="w-6 h-6 stroke-[2.2]" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedProductDetailId(alert.productId)}
                          className="text-base font-extrabold text-slate-900 hover:text-emerald-700 text-left"
                        >
                          {alert.productName}
                        </button>

                        <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                          isCritical
                            ? 'bg-rose-600 text-white'
                            : 'bg-amber-500 text-white'
                        }`}>
                          {isCritical ? '🔴 Critical' : '🟠 Low Stock'}
                        </span>

                        <span className="text-xs text-slate-500 font-medium">
                          • {alert.category}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                        <span>
                          Current Stock:{' '}
                          <strong className={`font-bold ${isCritical ? 'text-rose-700' : 'text-amber-800'}`}>
                            {alert.currentStock} {alert.unit}
                          </strong>
                        </span>
                        <span>
                          Minimum Safety Threshold:{' '}
                          <strong className="text-slate-800">
                            {alert.minStockLevel} {alert.unit}
                          </strong>
                        </span>
                        <span>
                          Supplier:{' '}
                          <strong className="text-slate-700">{alert.supplier}</strong>
                        </span>
                      </div>

                      {/* Stock safety bar */}
                      <div className="w-full sm:w-64 bg-slate-200/80 h-2 rounded-full overflow-hidden mt-1.5">
                        <div
                          className={`h-full rounded-full ${
                            isCritical ? 'bg-rose-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(8, stockRatio))}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right: Restock Recommendation & Action Button */}
                  <div className="flex items-center gap-3 sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                    <div className="text-left sm:text-right">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Recommended Restock
                      </span>
                      <span className="text-lg font-black text-emerald-800">
                        +{alert.recommendedRestock} {alert.unit}
                      </span>
                    </div>

                    <button
                      onClick={() =>
                        handleQuickRestockRecommended(
                          alert.productId,
                          alert.recommendedRestock,
                          alert.productName,
                          alert.unit
                        )
                      }
                      className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all"
                    >
                      <PackagePlus className="w-4 h-4 stroke-[2.5]" />
                      <span>Restock Now</span>
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center bg-white border border-slate-200/80 rounded-2xl">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900">
                No active alerts in this category!
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Your inventory levels are healthy and stocked above the minimum configured thresholds.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Normal Inventory Healthy Section */}
      {(severityFilter === 'All' || severityFilter === 'normal') && (
        <div className="mt-8 space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">
              🟢 Normal & Healthy Stock ({normalProducts.length} Products)
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Products with current on-hand quantity comfortably exceeding minimum stock limits.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {normalProducts.map(p => (
              <div
                key={p.id}
                onClick={() => setSelectedProductDetailId(p.id)}
                className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{p.name}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Min: {p.minStockLevel} {p.unit} • {p.category}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-emerald-700">
                    {p.currentStock} {p.unit}
                  </span>
                  <span className="block text-[10px] font-bold text-emerald-600 uppercase">
                    Normal
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
