import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  Product, 
  InventoryTransaction, 
  StoreSettings, 
  StockAlert, 
  TransactionType,
  DemandPrediction 
} from '../types';
import { initialProducts, initialTransactions, initialSettings } from '../data/initialData';
import { calculateStockStatus, generateAlerts, calculateDemandPredictions } from '../utils/calculations';

interface InventoryContextType {
  products: Product[];
  transactions: InventoryTransaction[];
  settings: StoreSettings;
  alerts: StockAlert[];
  demandPredictions: DemandPrediction[];
  predictionPeriodDays: number;
  setPredictionPeriodDays: (days: number) => void;
  selectedTimeframe: 'Today' | 'This Week' | 'This Month' | 'This Year';
  setSelectedTimeframe: (timeframe: 'Today' | 'This Week' | 'This Month' | 'This Year') => void;
  globalSearch: string;
  setGlobalSearch: (q: string) => void;
  selectedProductDetailId: string | null;
  setSelectedProductDetailId: (id: string | null) => void;
  
  // Actions
  addProduct: (product: Omit<Product, 'id' | 'lastUpdated' | 'status'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  recordTransaction: (params: {
    productId: string;
    type: TransactionType;
    quantity: number;
    user?: string;
    notes?: string;
    reference?: string;
  }) => void;
  restockProduct: (productId: string, quantity: number, notes?: string, reference?: string) => void;
  recordSale: (productId: string, quantity: number, notes?: string) => void;
  adjustStock: (productId: string, newTotalStock: number, reason: string) => void;
  updateSettings: (updates: Partial<StoreSettings>) => void;
  resetToDemoData: () => void;

  // Computed metrics
  metrics: {
    totalProducts: number;
    totalStockUnits: number;
    lowStockCount: number;
    outOfStockCount: number;
    totalInventoryValue: number;
    totalCostValue: number;
    predictedDemandTotal: number;
    activeAlertsCount: number;
  };
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

const STORAGE_KEY_PRODUCTS = 'green_market_products_v1';
const STORAGE_KEY_TRANSACTIONS = 'green_market_transactions_v1';
const STORAGE_KEY_SETTINGS = 'green_market_settings_v1';

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PRODUCTS);
      return saved ? JSON.parse(saved) : initialProducts;
    } catch {
      return initialProducts;
    }
  });

  const [transactions, setTransactions] = useState<InventoryTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
      return saved ? JSON.parse(saved) : initialTransactions;
    } catch {
      return initialTransactions;
    }
  });

  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      return saved ? JSON.parse(saved) : initialSettings;
    } catch {
      return initialSettings;
    }
  });

  const [selectedTimeframe, setSelectedTimeframe] = useState<'Today' | 'This Week' | 'This Month' | 'This Year'>('This Week');
  const [predictionPeriodDays, setPredictionPeriodDays] = useState<number>(7);
  const [globalSearch, setGlobalSearch] = useState<string>('');
  const [selectedProductDetailId, setSelectedProductDetailId] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.error('Failed to persist products', e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions));
    } catch (e) {
      console.error('Failed to persist transactions', e);
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to persist settings', e);
    }
  }, [settings]);

  // Dynamic alerts
  const alerts = useMemo(() => generateAlerts(products), [products]);

  // Dynamic demand predictions
  const demandPredictions = useMemo(
    () => calculateDemandPredictions(products, transactions, predictionPeriodDays),
    [products, transactions, predictionPeriodDays]
  );

  // Key summary metrics
  const metrics = useMemo(() => {
    const totalProducts = products.length;
    let totalStockUnits = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let totalInventoryValue = 0;
    let totalCostValue = 0;

    products.forEach(p => {
      totalStockUnits += p.currentStock;
      totalInventoryValue += p.currentStock * p.price;
      totalCostValue += p.currentStock * p.costPrice;

      if (p.currentStock <= 0) {
        outOfStockCount++;
      } else if (p.currentStock <= p.minStockLevel) {
        lowStockCount++;
      }
    });

    const predictedDemandTotal = demandPredictions.reduce((sum, d) => sum + d.predictedDemand, 0);

    return {
      totalProducts,
      totalStockUnits,
      lowStockCount,
      outOfStockCount,
      totalInventoryValue: Number(totalInventoryValue.toFixed(2)),
      totalCostValue: Number(totalCostValue.toFixed(2)),
      predictedDemandTotal: Math.round(predictedDemandTotal),
      activeAlertsCount: alerts.length,
    };
  }, [products, demandPredictions, alerts]);

  // Add Product
  const addProduct = (newProd: Omit<Product, 'id' | 'lastUpdated' | 'status'>) => {
    const id = `prod-${Date.now()}`;
    const status = calculateStockStatus(newProd.currentStock, newProd.minStockLevel);
    const now = new Date().toISOString();

    const createdProduct: Product = {
      ...newProd,
      id,
      lastUpdated: now,
      status,
    };

    setProducts(prev => [createdProduct, ...prev]);

    // Log initial stock creation transaction if currentStock > 0
    if (newProd.currentStock > 0) {
      const tx: InventoryTransaction = {
        id: `tx-${Date.now()}`,
        date: now,
        productId: id,
        productName: newProd.name,
        category: newProd.category,
        unit: newProd.unit,
        type: 'Stock Added',
        quantity: newProd.currentStock,
        previousStock: 0,
        updatedStock: newProd.currentStock,
        user: 'Elena (Manager)',
        notes: 'Initial product stock catalog entry',
      };
      setTransactions(prev => [tx, ...prev]);
    }
  };

  // Update Product metadata
  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev =>
      prev.map(prod => {
        if (prod.id !== id) return prod;
        const nextStock = updates.currentStock !== undefined ? updates.currentStock : prod.currentStock;
        const nextMin = updates.minStockLevel !== undefined ? updates.minStockLevel : prod.minStockLevel;
        const status = calculateStockStatus(nextStock, nextMin);

        return {
          ...prod,
          ...updates,
          status,
          lastUpdated: new Date().toISOString(),
        };
      })
    );
  };

  // Delete Product
  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    if (selectedProductDetailId === id) {
      setSelectedProductDetailId(null);
    }
  };

  // Generic record transaction
  const recordTransaction = ({
    productId,
    type,
    quantity,
    user = 'Elena (Manager)',
    notes = '',
    reference = '',
  }: {
    productId: string;
    type: TransactionType;
    quantity: number;
    user?: string;
    notes?: string;
    reference?: string;
  }) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const previousStock = product.currentStock;
    const updatedStock = Math.max(0, previousStock + quantity);
    const now = new Date().toISOString();
    const newStatus = calculateStockStatus(updatedStock, product.minStockLevel);

    // 1. Update product
    setProducts(prev =>
      prev.map(p =>
        p.id === productId
          ? {
              ...p,
              currentStock: updatedStock,
              status: newStatus,
              lastUpdated: now,
            }
          : p
      )
    );

    // 2. Add transaction record
    const newTx: InventoryTransaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      date: now,
      productId,
      productName: product.name,
      category: product.category,
      unit: product.unit,
      type,
      quantity,
      previousStock,
      updatedStock,
      user,
      reference,
      notes,
    };

    setTransactions(prev => [newTx, ...prev]);
  };

  // Restock shortcut
  const restockProduct = (productId: string, quantity: number, notes?: string, reference?: string) => {
    recordTransaction({
      productId,
      type: 'Restocked',
      quantity: Math.abs(quantity),
      notes: notes || 'Delivery inventory intake',
      reference,
    });
  };

  // Record Sale shortcut
  const recordSale = (productId: string, quantity: number, notes?: string) => {
    recordTransaction({
      productId,
      type: 'Stock Sold',
      quantity: -Math.abs(quantity),
      notes: notes || 'Customer retail checkout',
    });
  };

  // Audit / Adjust stock
  const adjustStock = (productId: string, newTotalStock: number, reason: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const diff = newTotalStock - product.currentStock;
    if (diff === 0) return;

    recordTransaction({
      productId,
      type: 'Stock Adjusted',
      quantity: diff,
      notes: `Manual audit adjustment: ${reason}`,
    });
  };

  const updateSettings = (updates: Partial<StoreSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const resetToDemoData = () => {
    setProducts(initialProducts);
    setTransactions(initialTransactions);
    setSettings(initialSettings);
    localStorage.removeItem(STORAGE_KEY_PRODUCTS);
    localStorage.removeItem(STORAGE_KEY_TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEY_SETTINGS);
  };

  return (
    <InventoryContext.Provider
      value={{
        products,
        transactions,
        settings,
        alerts,
        demandPredictions,
        predictionPeriodDays,
        setPredictionPeriodDays,
        selectedTimeframe,
        setSelectedTimeframe,
        globalSearch,
        setGlobalSearch,
        selectedProductDetailId,
        setSelectedProductDetailId,
        addProduct,
        updateProduct,
        deleteProduct,
        recordTransaction,
        restockProduct,
        recordSale,
        adjustStock,
        updateSettings,
        resetToDemoData,
        metrics,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
