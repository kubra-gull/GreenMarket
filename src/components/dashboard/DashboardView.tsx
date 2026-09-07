import React, { useMemo } from 'react';
import { 
  Package, 
  Boxes, 
  AlertTriangle, 
  AlertOctagon, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Calendar,
  Layers,
  Filter
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useInventory } from '../../context/InventoryContext';
import { TabType } from '../layout/Sidebar';

interface DashboardViewProps {
  onNavigateTab: (tab: TabType) => void;
  onOpenQuickSale: () => void;
  onOpenQuickRestock: () => void;
  onOpenAddProduct: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateTab,
  onOpenQuickSale,
  onOpenQuickRestock,
  onOpenAddProduct,
}) => {
  const { 
    products, 
    transactions, 
    metrics, 
    alerts, 
    settings, 
    selectedTimeframe, 
    setSelectedTimeframe,
    setSelectedProductDetailId 
  } = useInventory();

  // Compute time-period filtered data for the chart
  const timeframeData = useMemo(() => {
    // Determine cutoff date
    const now = new Date();
    let cutoff = new Date();

    if (selectedTimeframe === 'Today') {
      cutoff.setHours(0, 0, 0, 0);
    } else if (selectedTimeframe === 'This Week') {
      cutoff.setDate(now.getDate() - 7);
    } else if (selectedTimeframe === 'This Month') {
      cutoff.setDate(now.getDate() - 30);
    } else {
      cutoff.setMonth(0, 1);
    }

    const filteredTxs = transactions.filter(t => new Date(t.date) >= cutoff);

    // Group by category or top products
    const categories = ['Vegetables', 'Fruits', 'Grains & Staples', 'Dairy & Eggs', 'Oils & Pantry'] as const;

    return categories.map(cat => {
      const catProducts = products.filter(p => p.category === cat);
      const catCurrentStock = catProducts.reduce((sum, p) => sum + p.currentStock, 0);

      const catTxs = filteredTxs.filter(t => t.category === cat);
      const sold = catTxs
        .filter(t => t.type === 'Stock Sold')
        .reduce((sum, t) => sum + Math.abs(t.quantity), 0);
      const added = catTxs
        .filter(t => t.type === 'Restocked' || t.type === 'Stock Added')
        .reduce((sum, t) => sum + Math.abs(t.quantity), 0);

      return {
        category: cat.split(' ')[0], // short label
        fullName: cat,
        'Current Stock': catCurrentStock,
        'Products Sold': sold,
        'Products Added': added,
        'Stock Remaining': Math.max(0, catCurrentStock),
      };
    });
  }, [products, transactions, selectedTimeframe]);

  // Stock Status Pie breakdown
  const statusPieData = useMemo(() => {
    const inStock = products.filter(p => p.status === 'In Stock').length;
    const lowStock = products.filter(p => p.status === 'Low Stock').length;
    const outOfStock = products.filter(p => p.status === 'Out of Stock').length;

    return [
      { name: 'In Stock', value: inStock, color: '#10b981' },
      { name: 'Low Stock', value: lowStock, color: '#f59e0b' },
      { name: 'Out of Stock', value: outOfStock, color: '#f43f5e' },
    ];
  }, [products]);

  // Recent 6 transactions
  const recentActivities = useMemo(() => {
    return transactions.slice(0, 6);
  }, [transactions]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Inventory Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time grocery stock levels, demand predictions, and movement tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="dash-quick-sale"
            onClick={onOpenQuickSale}
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold rounded-xl border border-amber-200/80 transition-colors"
          >
            <TrendingDown className="w-3.5 h-3.5 text-amber-600" />
            Quick Sale
          </button>
          <button
            id="dash-quick-restock"
            onClick={onOpenQuickRestock}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold rounded-xl border border-emerald-200/80 transition-colors"
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
            Receive Stock
          </button>
          <button
            id="dash-add-product"
            onClick={onOpenAddProduct}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-emerald-600/25 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            New Product
          </button>
        </div>
      </div>

      {/* Summary Cards Grid (6 Main Metrics + Active Alerts Banner) */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Products */}
        <div 
          onClick={() => onNavigateTab('products')}
          className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Products
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center group-hover:bg-emerald-50 group-hover:text-emerald-700 transition-colors">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {metrics.totalProducts}
            </div>
            <span className="text-[11px] font-semibold text-slate-400">
              Active catalog SKUs
            </span>
          </div>
        </div>

        {/* Total Stock */}
        <div 
          onClick={() => onNavigateTab('inventory')}
          className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Stock
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {metrics.totalStockUnits.toLocaleString()}
            </div>
            <span className="text-[11px] font-semibold text-emerald-700">
              Units & kg on shelves
            </span>
          </div>
        </div>

        {/* Low Stock Items */}
        <div 
          onClick={() => onNavigateTab('alerts')}
          className={`p-4 rounded-2xl border shadow-xs transition-all cursor-pointer group ${
            metrics.lowStockCount > 0
              ? 'bg-amber-50/40 border-amber-200 hover:bg-amber-50/80 hover:shadow-md'
              : 'bg-white border-slate-200/80'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
              Low Stock
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-amber-900 tracking-tight">
              {metrics.lowStockCount}
            </div>
            <span className="text-[11px] font-bold text-amber-700">
              Needs reordering
            </span>
          </div>
        </div>

        {/* Out of Stock */}
        <div 
          onClick={() => onNavigateTab('alerts')}
          className={`p-4 rounded-2xl border shadow-xs transition-all cursor-pointer group ${
            metrics.outOfStockCount > 0
              ? 'bg-rose-50/40 border-rose-200 hover:bg-rose-50/80 hover:shadow-md'
              : 'bg-white border-slate-200/80'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-900 uppercase tracking-wider">
              Out of Stock
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-rose-900 tracking-tight">
              {metrics.outOfStockCount}
            </div>
            <span className="text-[11px] font-bold text-rose-700">
              Zero inventory
            </span>
          </div>
        </div>

        {/* Inventory Value */}
        <div 
          onClick={() => onNavigateTab('reports')}
          className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Inventory Value
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {settings.currency}{metrics.totalInventoryValue.toLocaleString()}
            </div>
            <span className="text-[11px] font-semibold text-slate-400">
              Retail evaluation
            </span>
          </div>
        </div>

        {/* Predicted Demand */}
        <div 
          onClick={() => onNavigateTab('prediction')}
          className="p-4 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-700/20 hover:shadow-lg transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-100 uppercase tracking-wider">
              Predicted Demand
            </span>
            <div className="w-8 h-8 rounded-xl bg-white/20 text-white flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black tracking-tight">
              ~{metrics.predictedDemandTotal.toLocaleString()}
            </div>
            <span className="text-[11px] font-semibold text-emerald-100">
              Est. Next 7 Days
            </span>
          </div>
        </div>
      </div>

      {/* Stock Alerts Notice Bar */}
      {alerts.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-950">
                {alerts.length} Products Require Immediate Restocking
              </h3>
              <p className="text-xs text-amber-800 mt-0.5">
                Critical items include{' '}
                {alerts.slice(0, 3).map(a => `${a.productName} (${a.currentStock} ${a.unit})`).join(', ')}
                {alerts.length > 3 ? ` and ${alerts.length - 3} more` : ''}.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('alerts')}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0"
          >
            Review Stock Alerts
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Section: Inventory Overview Chart + Stock Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Inventory Overview Chart */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Inventory Overview</h2>
              <p className="text-xs text-slate-500">
                Current stock, products sold, products added, and stock remaining by category
              </p>
            </div>

            {/* Time period switcher: Today, This Week, This Month, This Year */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/60 self-start sm:self-auto">
              {(['Today', 'This Week', 'This Month', 'This Year'] as const).map(period => (
                <button
                  key={period}
                  onClick={() => setSelectedTimeframe(period)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    selectedTimeframe === period
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          {/* Grouped Bar Chart */}
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeframeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                    border: 'none',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="Current Stock" fill="#059669" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Products Sold" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Products Added" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Stock Remaining" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Col: Stock Status Breakdown */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Stock Status</h2>
              <span className="text-xs text-slate-400 font-semibold">{products.length} items</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live inventory distribution across alert thresholds
            </p>
          </div>

          {/* Donut Chart */}
          <div className="h-48 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px',
                    border: 'none',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Inner text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-slate-900">
                {metrics.totalProducts}
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Products
              </span>
            </div>
          </div>

          {/* Breakdown Bars & Legend */}
          <div className="space-y-2.5 pt-2">
            {statusPieData.map(item => {
              const pct = metrics.totalProducts > 0
                ? Math.round((item.value / metrics.totalProducts) * 100)
                : 0;
              return (
                <div key={item.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="font-semibold text-slate-700">{item.name}</span>
                    </div>
                    <span className="font-bold text-slate-900">
                      {item.value} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${pct}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => onNavigateTab('products')}
            className="w-full py-2 px-3 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors border border-emerald-200/60 text-center"
          >
            Manage Products & Stock Levels →
          </button>
        </div>
      </div>

      {/* Recent Inventory Activity Ledger */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Inventory Activity</h2>
            <p className="text-xs text-slate-500">
              Live audit stream of incoming shipments, sales, and stock adjustments
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('inventory')}
            className="text-xs text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1"
          >
            View Full Tracking Ledger →
          </button>
        </div>

        <div className="divide-y divide-slate-100 border border-slate-200/70 rounded-xl overflow-hidden">
          {recentActivities.map(tx => (
            <div
              key={tx.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 hover:bg-slate-50/80 transition-colors gap-2"
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  tx.type === 'Stock Sold'
                    ? 'bg-amber-100 text-amber-700'
                    : tx.type === 'Restocked' || tx.type === 'Stock Added'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {tx.type === 'Stock Sold' ? (
                    <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{tx.productName}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      tx.type === 'Stock Sold'
                        ? 'bg-amber-100 text-amber-800'
                        : tx.type === 'Restocked' || tx.type === 'Stock Added'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {tx.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {tx.notes || 'Recorded stock movement'} • {tx.user}
                    {tx.reference && ` (Ref: ${tx.reference})`}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 text-xs">
                <div className="text-left sm:text-right">
                  <div className={`font-black text-sm ${
                    tx.quantity > 0 ? 'text-emerald-700' : 'text-amber-700'
                  }`}>
                    {tx.quantity > 0 ? `+${tx.quantity}` : tx.quantity} {tx.unit}
                  </div>
                  <span className="text-slate-400 text-[11px]">
                    Remaining: <strong className="text-slate-700">{tx.updatedStock} {tx.unit}</strong>
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 shrink-0 font-medium">
                  {new Date(tx.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
