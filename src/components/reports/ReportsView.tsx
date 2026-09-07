import React, { useState, useMemo } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Printer, 
  Calendar, 
  Filter, 
  TrendingUp, 
  DollarSign, 
  AlertTriangle, 
  Package, 
  CheckCircle2,
  Boxes,
  FileText
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { exportToCSV } from '../../utils/calculations';

type ReportType = 
  | 'stock'
  | 'low_stock'
  | 'out_of_stock'
  | 'sales'
  | 'inventory_value'
  | 'demand_prediction';

export const ReportsView: React.FC = () => {
  const { products, transactions, demandPredictions, settings } = useInventory();

  const [activeReport, setActiveReport] = useState<ReportType>('stock');
  const [dateRange, setDateRange] = useState<'7Days' | '30Days' | '90Days' | 'All'>('30Days');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Filtered by category
  const filteredProducts = useMemo(() => {
    return products.filter(p => selectedCategory === 'All' || p.category === selectedCategory);
  }, [products, selectedCategory]);

  // Date range cutoff for transaction based reports
  const cutoffDate = useMemo(() => {
    const d = new Date();
    if (dateRange === '7Days') d.setDate(d.getDate() - 7);
    else if (dateRange === '30Days') d.setDate(d.getDate() - 30);
    else if (dateRange === '90Days') d.setDate(d.getDate() - 90);
    else return new Date(0);
    return d;
  }, [dateRange]);

  const filteredTxs = useMemo(() => {
    return transactions.filter(t => {
      const matchCat = selectedCategory === 'All' || t.category === selectedCategory;
      const matchDate = new Date(t.date) >= cutoffDate;
      return matchCat && matchDate;
    });
  }, [transactions, selectedCategory, cutoffDate]);

  // Report-specific data tables
  const reportData = useMemo(() => {
    if (activeReport === 'stock') {
      return {
        title: 'Comprehensive Stock Report',
        description: 'Complete audit of on-hand inventory, reorder thresholds, and current status.',
        headers: ['Product Code', 'Product Name', 'Category', 'Current Stock', 'Min Threshold', 'Unit', 'Status', 'Supplier'],
        rows: filteredProducts.map(p => [
          p.code,
          p.name,
          p.category,
          p.currentStock,
          p.minStockLevel,
          p.unit,
          p.status,
          p.supplier,
        ]),
      };
    }

    if (activeReport === 'low_stock') {
      const lowItems = filteredProducts.filter(p => p.status === 'Low Stock');
      return {
        title: 'Low-Stock Reorder Report',
        description: 'Products that have reached or fallen below minimum safety stock levels.',
        headers: ['Product Code', 'Product Name', 'Category', 'Current Stock', 'Min Threshold', 'Deficit / Shortfall', 'Supplier', 'Contact'],
        rows: lowItems.map(p => [
          p.code,
          p.name,
          p.category,
          p.currentStock,
          p.minStockLevel,
          Math.max(0, p.minStockLevel - p.currentStock),
          p.supplier,
          p.supplierPhone || '—',
        ]),
      };
    }

    if (activeReport === 'out_of_stock') {
      const outItems = filteredProducts.filter(p => p.status === 'Out of Stock');
      return {
        title: 'Out-of-Stock Emergency Report',
        description: 'Zero-inventory items requiring immediate supplier purchase orders.',
        headers: ['Product Code', 'Product Name', 'Category', 'Current Stock', 'Reorder Target', 'Supplier', 'Contact', 'Unit Cost'],
        rows: outItems.map(p => [
          p.code,
          p.name,
          p.category,
          0,
          Math.ceil(p.minStockLevel * 2),
          p.supplier,
          p.supplierPhone || '—',
          `${settings.currency}${p.costPrice.toFixed(2)}`,
        ]),
      };
    }

    if (activeReport === 'sales') {
      const salesTxs = filteredTxs.filter(t => t.type === 'Stock Sold');
      return {
        title: 'Sales & Inventory Velocity Report',
        description: 'Record of customer transactions, units sold, and stock depletion velocities.',
        headers: ['Date', 'Product Name', 'Category', 'Quantity Sold', 'Unit', 'Remaining Stock', 'Operator / POS', 'Memo'],
        rows: salesTxs.map(t => [
          new Date(t.date).toLocaleString(),
          t.productName,
          t.category,
          Math.abs(t.quantity),
          t.unit,
          t.updatedStock,
          t.user,
          t.notes || '—',
        ]),
      };
    }

    if (activeReport === 'inventory_value') {
      return {
        title: 'Inventory Valuation & Margin Report',
        description: 'Cost basis valuation, retail market value, and unrealized gross margins.',
        headers: ['Product Name', 'Category', 'Current Stock', 'Cost / Unit', 'Retail / Unit', 'Total Cost Basis', 'Total Retail Value', 'Unrealized Profit'],
        rows: filteredProducts.map(p => {
          const costBasis = p.currentStock * p.costPrice;
          const retailVal = p.currentStock * p.price;
          const profit = retailVal - costBasis;
          return [
            p.name,
            p.category,
            `${p.currentStock} ${p.unit}`,
            `${settings.currency}${p.costPrice.toFixed(2)}`,
            `${settings.currency}${p.price.toFixed(2)}`,
            `${settings.currency}${costBasis.toFixed(2)}`,
            `${settings.currency}${retailVal.toFixed(2)}`,
            `${settings.currency}${profit.toFixed(2)}`,
          ];
        }),
      };
    }

    // demand_prediction
    return {
      title: 'Demand Prediction & Purchase Order Forecast',
      description: 'Projected demand, expected stock-out risk, and recommended reorder quantities.',
      headers: ['Product Name', 'Category', 'Current Stock', 'Avg Daily Sales', 'Predicted Demand (7d)', 'Stock-out Risk', 'Expected Runout', 'Recommended Order'],
      rows: demandPredictions
        .filter(d => selectedCategory === 'All' || d.category === selectedCategory)
        .map(d => [
          d.productName,
          d.category,
          `${d.currentStock} ${d.unit}`,
          `${d.avgDailySales} ${d.unit}/day`,
          `${d.predictedDemand} ${d.unit}`,
          d.stockOutRisk,
          d.expectedStockOutDate || '—',
          d.recommendedOrder > 0 ? `+${d.recommendedOrder} ${d.unit}` : 'Optimal',
        ]),
    };
  }, [activeReport, filteredProducts, filteredTxs, demandPredictions, settings]);

  const handleExportCSV = () => {
    const filename = `green_market_${activeReport}_report_${new Date().toISOString().slice(0, 10)}`;
    exportToCSV(filename, reportData.headers, reportData.rows);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Reports & Business Analytics
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Audit stock performance, export official CSV manifests, or generate printable reports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl shadow-xs transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            Export CSV
          </button>
          <button
            onClick={handlePrintPDF}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print / PDF
          </button>
        </div>
      </div>

      {/* Report Type Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto p-1.5 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
        {[
          { id: 'stock', label: 'Stock Report' },
          { id: 'low_stock', label: 'Low-Stock Report' },
          { id: 'out_of_stock', label: 'Out-of-Stock Report' },
          { id: 'sales', label: 'Sales Velocity' },
          { id: 'inventory_value', label: 'Inventory Valuation' },
          { id: 'demand_prediction', label: 'Demand Forecast' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveReport(tab.id as ReportType)}
            className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
              activeReport === tab.id
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Date Range & Category Filter Controls */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-500">Date Range:</span>
            <select
              value={dateRange}
              onChange={e => setDateRange(e.target.value as any)}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none"
            >
              <option value="7Days">Last 7 Days</option>
              <option value="30Days">Last 30 Days</option>
              <option value="90Days">Last 90 Days</option>
              <option value="All">All Time Records</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-500">Category:</span>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none"
            >
              <option value="All">All Categories</option>
              <option value="Vegetables">Vegetables</option>
              <option value="Fruits">Fruits</option>
              <option value="Grains & Staples">Grains & Staples</option>
              <option value="Dairy & Eggs">Dairy & Eggs</option>
              <option value="Oils & Pantry">Oils & Pantry</option>
            </select>
          </div>
        </div>

        <span className="text-xs font-semibold text-slate-400">
          Generated: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      </div>

      {/* Printable Report Container */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4 print:border-none print:shadow-none print:p-0">
        <div className="border-b border-slate-100 pb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900">{reportData.title}</h2>
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/60">
              {settings.storeName}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{reportData.description}</p>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                {reportData.headers.map((h, i) => (
                  <th key={i} className="py-3 px-3.5">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reportData.rows.length > 0 ? (
                reportData.rows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-50/60 text-xs">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="py-2.5 px-3.5 font-medium text-slate-700">
                        {String(cell)}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={reportData.headers.length} className="p-8 text-center text-slate-400">
                    No data available for this report criteria.
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
