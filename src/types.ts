export type Category = 
  | 'Vegetables'
  | 'Fruits'
  | 'Grains & Staples'
  | 'Dairy & Eggs'
  | 'Oils & Pantry';

export type UnitType = 'kg' | 'g' | 'liter' | 'dozen' | 'bag' | 'bunch' | 'box';

export type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';

export type AlertSeverity = 'critical' | 'low' | 'normal';

export type TransactionType = 'Stock Added' | 'Stock Sold' | 'Stock Adjusted' | 'Restocked';

export interface Product {
  id: string;
  code: string; // e.g. "PRD-101"
  name: string;
  category: Category;
  price: number; // Selling price per unit
  costPrice: number; // Cost price per unit
  currentStock: number;
  minStockLevel: number;
  unit: UnitType;
  supplier: string;
  supplierPhone?: string;
  lastUpdated: string;
  status: StockStatus;
  notes?: string;
  imageUrl?: string;
}

export interface InventoryTransaction {
  id: string;
  date: string; // ISO string
  productId: string;
  productName: string;
  category: Category;
  unit: UnitType;
  type: TransactionType;
  quantity: number; // positive or negative
  previousStock: number;
  updatedStock: number;
  user: string; // e.g. "Elena (Manager)", "POS Register #1"
  reference?: string; // invoice or order number
  notes?: string;
}

export interface StockAlert {
  productId: string;
  productName: string;
  category: Category;
  currentStock: number;
  minStockLevel: number;
  unit: UnitType;
  severity: AlertSeverity;
  recommendedRestock: number;
  supplier: string;
  lastUpdated: string;
}

export interface DemandPrediction {
  productId: string;
  productName: string;
  category: Category;
  unit: UnitType;
  currentStock: number;
  minStockLevel: number;
  totalHistoricalSold: number;
  historyDays: number;
  avgDailySales: number;
  predictedDemand: number; // for chosen future period
  daysUntilStockOut: number; // Infinity if sales = 0
  expectedStockOutDate: string | null;
  stockOutRisk: 'High' | 'Medium' | 'Low' | 'None';
  recommendedOrder: number;
  confidence: 'High' | 'Moderate' | 'Low' | 'Insufficient Data';
  reasoning: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  currency: string;
  lowStockBufferMultiplier: number;
  contactEmail: string;
  contactPhone: string;
  address: string;
  enableAutoAlerts: boolean;
}
