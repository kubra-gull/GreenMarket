import React, { useState, useMemo } from 'react';
import { 
  ArrowLeftRight, 
  ArrowUpRight, 
  ArrowDownRight, 
  Search, 
  Filter, 
  Calendar, 
  Download, 
  Plus, 
  TrendingDown, 
  PackagePlus, 
  History,
  FileSpreadsheet,
  X
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { TransactionType, Category } from '../../types';
import { exportToCSV } from '../../utils/calculations';

interface InventoryViewProps {
  onOpenQuickSale: () => void;
  onOpenQuickRestock: () => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  onOpenQuickSale,
  onOpenQuickRestock,
}) => {
  const { transactions, products, setSelectedProductDetailId } = useInventory();

  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [dateFilter, setDateFilter] = useState<'All' | 'Today' | '7Days' | '30Days'>('All');

  // Filtered transactions
  const filteredTxs = useMemo(() => {
    const now = new Date();

    return transactions.filter(t => {
      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matches =
          t.productName.toLowerCase().includes(q) ||
          t.user.toLowerCase().includes(q) ||
          (t.reference && t.reference.toLowerCase().includes(q)) ||
          (t.notes && t.notes.toLowerCase().includes(q));
        if (!matches) return false;
      }

      // Type
      if (selectedType !== 'All' && t.type !== selectedType) {
        return false;
      }

      // Category
      if (selectedCategory !== 'All' && t.category !== selectedCategory) {
        return false;
      }

      // Date filter
      if (dateFilter !== 'All') {
        const txDate = new Date(t.date);
        if (dateFilter === 'Today') {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (txDate < today) return false;
        } else if (dateFilter === '7Days') {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(now.getDate() - 7);
          if (txDate < sevenDaysAgo) return false;
        } else if (dateFilter === '30Days') {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(now.getDate() - 30);
          if (txDate < thirtyDaysAgo) return false;
        }
      }

      return true;
    });
  }, [transactions, search, selectedType, selectedCategory, dateFilter]);

  // Key ledger movement metrics
  const ledgerMetrics = useMemo(() => {
    let totalAdded = 0;
    let totalSold = 0;

    filteredTxs.forEach(t => {
      if (t.quantity > 0) {
        totalAdded += t.quantity;
      } else {
        totalSold += Math.abs(t.quantity);
      }
    });

    return {
      count: filteredTxs.length,
      totalAdded: Math.round(totalAdded),
      totalSold: Math.round(totalSold),
      netVelocity: Math.round(totalAdded - totalSold),
    };
  }, [filteredTxs]);

  const handleExportCSV = () => {
    const headers = ['Date', 'Product ID', 'Product Name', 'Category', 'Transaction Type', 'Quantity', 'Unit', 'Previous Stock', 'Updated Stock', 'Authorized User', 'Reference', 'Notes'];
    const rows = filteredTxs.map(t => [
      new Date(t.date).toISOString(),
      t.productId,
      t.productName,
      t.category,
      t.type,
      t.quantity,
      t.unit,
      t.previousStock,
      t.updatedStock,
      t.user,
      t.reference || '',
      t.notes || '',
    ]);

    exportToCSV(`green_market_inventory_movements_${new Date().toISOString().slice(0, 10)}`, headers, rows);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Inventory Tracking
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Full audit ledger recording every stock movement, delivery intake, and retail sale.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl shadow-xs transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Export Ledger CSV
          </button>
          <button
            onClick={onOpenQuickSale}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors"
          >
            <TrendingDown className="w-4 h-4 text-amber-600" />
            Record Sale
          </button>
          <button
            onClick={onOpenQuickRestock}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm shadow-emerald-600/20 transition-all"
          >
            <PackagePlus className="w-4 h-4" />
            Receive Stock
          </button>
        </div>
      </div>

      {/* Movement Ledger KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Total Movements
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {ledgerMetrics.count}
          </div>
          <span className="text-[11px] text-slate-500">Filtered transaction entries</span>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/60 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
            Stock Received
          </span>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            +{ledgerMetrics.totalAdded.toLocaleString()}
          </div>
          <span className="text-[11px] text-emerald-600">Restocked units / kg</span>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
            Stock Sold
          </span>
          <div className="text-2xl font-black text-amber-700 mt-1">
            -{ledgerMetrics.totalSold.toLocaleString()}
          </div>
          <span className="text-[11px] text-amber-600">Customer checkouts</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Net Inventory Flow
          </span>
          <div className={`text-2xl font-black mt-1 ${
            ledgerMetrics.netVelocity >= 0 ? 'text-emerald-700' : 'text-amber-700'
          }`}>
            {ledgerMetrics.netVelocity >= 0 ? `+${ledgerMetrics.netVelocity}` : ledgerMetrics.netVelocity}
          </div>
          <span className="text-[11px] text-slate-500">Net units balance</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search product, user, or PO..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Transaction Type */}
          <div>
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium"
            >
              <option value="All">All Transaction Types</option>
              <option value="Restocked">Restocked / Intake</option>
              <option value="Stock Added">Stock Added</option>
              <option value="Stock Sold">Stock Sold</option>
              <option value="Stock Adjusted">Stock Adjusted</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium"
            >
              <option value="All">All Categories</option>
              <option value="Vegetables">Vegetables</option>
              <option value="Fruits">Fruits</option>
              <option value="Grains & Staples">Grains & Staples</option>
              <option value="Dairy & Eggs">Dairy & Eggs</option>
              <option value="Oils & Pantry">Oils & Pantry</option>
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <select
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value as any)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium"
            >
              <option value="All">All Time Records</option>
              <option value="Today">Today Only</option>
              <option value="7Days">Last 7 Days</option>
              <option value="30Days">Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Product Name</th>
                <th className="py-3.5 px-4">Transaction Type</th>
                <th className="py-3.5 px-4 text-right">Quantity</th>
                <th className="py-3.5 px-4 text-right">Previous Stock</th>
                <th className="py-3.5 px-4 text-right">Updated Stock</th>
                <th className="py-3.5 px-4">User / Action</th>
                <th className="py-3.5 px-4">Notes & Ref</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredTxs.length > 0 ? (
                filteredTxs.map(tx => {
                  const isPositive = tx.quantity > 0;
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Date */}
                      <td className="py-3.5 px-4 text-xs font-semibold text-slate-600 whitespace-nowrap">
                        {new Date(tx.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}{' '}
                        <span className="text-slate-400 font-normal">
                          {new Date(tx.date).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </td>

                      {/* Product */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => setSelectedProductDetailId(tx.productId)}
                          className="text-left font-bold text-slate-900 hover:text-emerald-700"
                        >
                          {tx.productName}
                          <span className="block text-[11px] text-slate-400 font-normal">
                            {tx.category}
                          </span>
                        </button>
                      </td>

                      {/* Transaction Type */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          tx.type === 'Stock Sold'
                            ? 'bg-amber-100 text-amber-800'
                            : tx.type === 'Restocked' || tx.type === 'Stock Added'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {tx.type === 'Stock Sold' ? (
                            <ArrowDownRight className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          )}
                          {tx.type}
                        </span>
                      </td>

                      {/* Quantity */}
                      <td className="py-3.5 px-4 text-right">
                        <span className={`font-black text-sm ${
                          isPositive ? 'text-emerald-700' : 'text-amber-700'
                        }`}>
                          {isPositive ? `+${tx.quantity}` : tx.quantity} {tx.unit}
                        </span>
                      </td>

                      {/* Previous Stock */}
                      <td className="py-3.5 px-4 text-right text-xs font-semibold text-slate-500">
                        {tx.previousStock} {tx.unit}
                      </td>

                      {/* Updated Stock */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-bold text-slate-900 text-xs">
                          {tx.updatedStock} {tx.unit}
                        </span>
                      </td>

                      {/* User */}
                      <td className="py-3.5 px-4 text-xs font-semibold text-slate-700">
                        {tx.user}
                      </td>

                      {/* Notes / Ref */}
                      <td className="py-3.5 px-4 text-xs text-slate-500 max-w-[200px] truncate">
                        {tx.notes || '—'}
                        {tx.reference && (
                          <span className="block text-[11px] font-mono text-emerald-700 font-semibold">
                            Ref: {tx.reference}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 text-sm">
                    No transaction records match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
