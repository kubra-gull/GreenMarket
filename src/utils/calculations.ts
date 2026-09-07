import { Product, InventoryTransaction, DemandPrediction, StockAlert, AlertSeverity, StockStatus } from '../types';

export function calculateStockStatus(currentStock: number, minStockLevel: number): StockStatus {
  if (currentStock <= 0) return 'Out of Stock';
  if (currentStock <= minStockLevel) return 'Low Stock';
  return 'In Stock';
}

export function generateAlerts(products: Product[]): StockAlert[] {
  return products
    .filter(p => p.currentStock <= p.minStockLevel)
    .map(p => {
      let severity: AlertSeverity = 'low';
      if (p.currentStock <= 0 || p.currentStock <= Math.max(1, p.minStockLevel * 0.3)) {
        severity = 'critical';
      }

      // Recommend restocking to roughly 2.5x minimum stock level to ensure healthy safety buffer
      const targetOptimum = Math.ceil(p.minStockLevel * 2.5);
      const recommendedRestock = Math.max(0, targetOptimum - p.currentStock);

      return {
        productId: p.id,
        productName: p.name,
        category: p.category,
        currentStock: p.currentStock,
        minStockLevel: p.minStockLevel,
        unit: p.unit,
        severity,
        recommendedRestock,
        supplier: p.supplier,
        lastUpdated: p.lastUpdated,
      };
    })
    .sort((a, b) => {
      // Sort critical first, then by currentStock / minStockLevel ratio ascending
      if (a.severity === 'critical' && b.severity !== 'critical') return -1;
      if (b.severity === 'critical' && a.severity !== 'critical') return 1;
      return (a.currentStock / a.minStockLevel) - (b.currentStock / b.minStockLevel);
    });
}

export function calculateDemandPredictions(
  products: Product[],
  transactions: InventoryTransaction[],
  futureDays: number = 7
): DemandPrediction[] {
  const now = new Date();

  return products.map(product => {
    // Filter sold transactions for this product
    const soldTxs = transactions.filter(
      t => t.productId === product.id && t.type === 'Stock Sold' && t.quantity < 0
    );

    const totalHistoricalSold = soldTxs.reduce((sum, t) => sum + Math.abs(t.quantity), 0);
    
    // Find transaction dates span
    let historyDays = 7; // default window
    if (soldTxs.length > 0) {
      const dates = soldTxs.map(t => new Date(t.date).getTime());
      const earliest = Math.min(...dates);
      const latest = Math.max(...dates, now.getTime());
      const diffDays = Math.max(1, Math.round((latest - earliest) / (1000 * 60 * 60 * 24)));
      historyDays = Math.max(diffDays, 7);
    }

    let avgDailySales = 0;
    if (historyDays > 0 && totalHistoricalSold > 0) {
      avgDailySales = Number((totalHistoricalSold / historyDays).toFixed(2));
    }

    const predictedDemand = Number((avgDailySales * futureDays).toFixed(1));

    let daysUntilStockOut = Infinity;
    let expectedStockOutDate: string | null = null;
    let stockOutRisk: 'High' | 'Medium' | 'Low' | 'None' = 'None';

    if (product.currentStock <= 0) {
      daysUntilStockOut = 0;
      expectedStockOutDate = 'Stock Out Currently';
      stockOutRisk = 'High';
    } else if (avgDailySales > 0) {
      daysUntilStockOut = Number((product.currentStock / avgDailySales).toFixed(1));
      
      const outDate = new Date(now.getTime() + daysUntilStockOut * 24 * 60 * 60 * 1000);
      expectedStockOutDate = outDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });

      if (daysUntilStockOut <= 3) {
        stockOutRisk = 'High';
      } else if (daysUntilStockOut <= 7) {
        stockOutRisk = 'Medium';
      } else {
        stockOutRisk = 'Low';
      }
    } else {
      stockOutRisk = 'Low';
      expectedStockOutDate = 'No imminent risk';
    }

    // Recommended order quantity: predicted demand + safety stock (0.5 * minStock) - currentStock
    const safetyStock = Math.ceil(product.minStockLevel * 0.5);
    const recommendedOrder = Math.max(
      0,
      Math.ceil(predictedDemand + safetyStock - product.currentStock)
    );

    let confidence: 'High' | 'Moderate' | 'Low' | 'Insufficient Data' = 'Moderate';
    let reasoning = '';

    if (soldTxs.length === 0) {
      confidence = 'Insufficient Data';
      reasoning = 'Not enough historical data for an accurate prediction.';
    } else if (soldTxs.length >= 4 && historyDays >= 7) {
      confidence = 'High';
      reasoning = `Based on ${soldTxs.length} verified sale events over ${historyDays} days. High velocity match.`;
    } else if (soldTxs.length >= 2) {
      confidence = 'Moderate';
      reasoning = `Based on ${soldTxs.length} historical transactions. Normal seasonal pattern.`;
    } else {
      confidence = 'Low';
      reasoning = `Limited sales records (${soldTxs.length}). Trend may fluctuate with customer foot traffic.`;
    }

    return {
      productId: product.id,
      productName: product.name,
      category: product.category,
      unit: product.unit,
      currentStock: product.currentStock,
      minStockLevel: product.minStockLevel,
      totalHistoricalSold,
      historyDays,
      avgDailySales,
      predictedDemand,
      daysUntilStockOut,
      expectedStockOutDate,
      stockOutRisk,
      recommendedOrder,
      confidence,
      reasoning,
    };
  });
}

// Export data to standard CSV
export function exportToCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const csvContent = [
    headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','),
    ...rows.map(row =>
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
