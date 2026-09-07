import React from 'react';
import { 
  X, 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  Building2, 
  Phone, 
  DollarSign, 
  ArrowDownRight, 
  ArrowUpRight,
  PackagePlus,
  TrendingDown,
  Edit3,
  Calendar
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useInventory } from '../../context/InventoryContext';

interface ProductDetailModalProps {
  productId: string | null;
  onClose: () => void;
  onEdit: (product: any) => void;
  onOpenRestock: (productId: string) => void;
  onOpenSale: (productId: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  productId,
  onClose,
  onEdit,
  onOpenRestock,
  onOpenSale,
}) => {
  const { products, transactions, demandPredictions, settings } = useInventory();

  if (!productId) return null;

  const product = products.find(p => p.id === productId);
  if (!product) return null;

  const prediction = demandPredictions.find(d => d.productId === productId);

  // Filter transactions for this specific product
  const productTxs = transactions
    .filter(t => t.productId === productId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Prepare chronological data for movement chart
  const chronologicalTxs = [...productTxs].reverse();
  const chartData = chronologicalTxs.map((t, idx) => ({
    time: new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    stock: t.updatedStock,
    change: t.quantity,
    type: t.type,
  }));

  // If no transactions, add current stock point
  if (chartData.length === 0) {
    chartData.push({
      time: 'Now',
      stock: product.currentStock,
      change: 0,
      type: 'Initial Stock' as any,
    });
  }

  const stockPercentage = Math.min(100, Math.round((product.currentStock / (product.minStockLevel * 2)) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-emerald-600/20">
              {product.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">{product.name}</h2>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-200/70 text-slate-700 font-semibold">
                  {product.code}
                </span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                  product.status === 'In Stock'
                    ? 'bg-emerald-100 text-emerald-800'
                    : product.status === 'Low Stock'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}>
                  {product.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Category: <span className="font-semibold text-slate-700">{product.category}</span> • Supplier:{' '}
                <span className="font-semibold text-slate-700">{product.supplier}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(product)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors shadow-xs"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit Info
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Top Quick Actions & Stats Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Current Stock</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-black text-slate-900">{product.currentStock}</span>
                <span className="text-sm font-bold text-slate-500">{product.unit}</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full mt-2.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    product.currentStock <= 0
                      ? 'bg-rose-500'
                      : product.currentStock <= product.minStockLevel
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.max(5, stockPercentage)}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Min threshold: {product.minStockLevel} {product.unit}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pricing & Margin</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-emerald-800">
                  {settings.currency}{product.price.toFixed(2)}
                </span>
                <span className="text-xs text-slate-400 line-through">
                  {settings.currency}{product.costPrice.toFixed(2)}
                </span>
              </div>
              <span className="text-xs font-semibold text-emerald-700 mt-2 block">
                Profit Margin: {Math.round(((product.price - product.costPrice) / product.price) * 100)}%
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg Daily Sales</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-slate-900">
                  {prediction ? prediction.avgDailySales : 0}
                </span>
                <span className="text-xs font-bold text-slate-500">{product.unit}/day</span>
              </div>
              <span className="text-xs text-slate-500 mt-2 block">
                Estimated Runout: <span className="font-bold text-slate-800">{prediction?.daysUntilStockOut === Infinity ? 'N/A' : `${prediction?.daysUntilStockOut} days`}</span>
              </span>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/70 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Quick Actions</span>
                <p className="text-[11px] text-emerald-700 mt-0.5">Directly update stock</p>
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => onOpenRestock(product.id)}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                >
                  <PackagePlus className="w-3.5 h-3.5" />
                  Restock
                </button>
                <button
                  onClick={() => onOpenSale(product.id)}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                >
                  <TrendingDown className="w-3.5 h-3.5" />
                  Sell
                </button>
              </div>
            </div>
          </div>

          {/* Demand Prediction & Recommendation Card */}
          {prediction && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50/80 via-teal-50/50 to-white border border-emerald-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-700" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                    Demand Prediction & Reorder Advisory
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    prediction.stockOutRisk === 'High'
                      ? 'bg-rose-100 text-rose-800'
                      : prediction.stockOutRisk === 'Medium'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {prediction.stockOutRisk} Risk
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Expected stock-out date:{' '}
                  <span className="font-bold text-slate-800">{prediction.expectedStockOutDate || 'Stable'}</span>.
                  Predicted demand for the upcoming week is{' '}
                  <span className="font-bold text-slate-800">{prediction.predictedDemand} {product.unit}</span>.
                </p>
                <p className="text-[11px] text-slate-400 italic">
                  Confidence: {prediction.confidence} — {prediction.reasoning}
                </p>
              </div>

              <div className="text-left sm:text-right shrink-0 bg-white/80 p-3 rounded-lg border border-emerald-100 shadow-xs">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Recommended Order</span>
                <div className="text-xl font-black text-emerald-800">
                  {prediction.recommendedOrder > 0 ? `+${prediction.recommendedOrder} ${product.unit}` : 'Stock Optimal'}
                </div>
                {prediction.recommendedOrder > 0 && (
                  <button
                    onClick={() => onOpenRestock(product.id)}
                    className="mt-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 underline"
                  >
                    Order Now →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Stock Movement History Chart */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Stock Movement Over Time</h4>
                <p className="text-xs text-slate-500">Live trajectory showing intake deliveries and sales</p>
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-100 text-slate-600">
                Units: {product.unit}
              </span>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="stockTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '10px',
                      color: '#fff',
                      fontSize: '12px',
                      border: 'none',
                    }}
                    formatter={(val: any) => [`${val} ${product.unit}`, 'Stock Level']}
                  />
                  <Area
                    type="monotone"
                    dataKey="stock"
                    stroke="#059669"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#stockTrend)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Product Metadata Details & Supplier */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Supplier Information
              </h4>
              <div className="space-y-1.5 text-sm">
                <div className="flex items-center gap-2 text-slate-700">
                  <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-semibold">{product.supplier}</span>
                </div>
                {product.supplierPhone && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{product.supplierPhone}</span>
                  </div>
                )}
                {product.notes && (
                  <p className="text-xs text-slate-500 mt-2 italic bg-white p-2.5 rounded-lg border border-slate-200/60">
                    "{product.notes}"
                  </p>
                )}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Inventory Valuation
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Current Stock Value (Retail):</span>
                  <span className="font-bold text-slate-900">
                    {settings.currency}{(product.currentStock * product.price).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Current Cost Basis:</span>
                  <span className="font-bold text-slate-700">
                    {settings.currency}{(product.currentStock * product.costPrice).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Estimated Unrealized Margin:</span>
                  <span className="font-bold text-emerald-700">
                    {settings.currency}{(product.currentStock * (product.price - product.costPrice)).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Historical Transactions Ledger for this Product */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-900">
              Recent Transactions for {product.name} ({productTxs.length})
            </h4>

            {productTxs.length > 0 ? (
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                {productTxs.map(t => (
                  <div key={t.id} className="flex items-center justify-between p-3 hover:bg-slate-50 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-lg ${
                        t.type === 'Stock Sold'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {t.type === 'Stock Sold' ? (
                          <ArrowDownRight className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800">
                          {t.type}: {t.quantity > 0 ? `+${t.quantity}` : t.quantity} {t.unit}
                        </div>
                        <div className="text-slate-400 text-[11px]">
                          {new Date(t.date).toLocaleString()} • {t.user}
                          {t.reference ? ` • Ref: ${t.reference}` : ''}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-semibold text-slate-700">
                        {t.previousStock} → <span className="font-bold text-slate-900">{t.updatedStock} {t.unit}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[150px]">
                        {t.notes}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                No recorded transaction movements yet.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
