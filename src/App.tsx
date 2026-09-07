import React, { useState } from 'react';
import { InventoryProvider, useInventory } from './context/InventoryContext';
import { Sidebar, TabType } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { ProductsView } from './components/products/ProductsView';
import { InventoryView } from './components/inventory/InventoryView';
import { AlertsView } from './components/alerts/AlertsView';
import { DemandPredictionView } from './components/prediction/DemandPredictionView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';
import { QuickTransactionModal } from './components/common/QuickTransactionModal';
import { ProductFormModal } from './components/products/ProductFormModal';
import { ProductDetailModal } from './components/products/ProductDetailModal';
import { Product } from './types';

function MainLayout() {
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Modals state
  const [isQuickTxOpen, setIsQuickTxOpen] = useState(false);
  const [quickTxType, setQuickTxType] = useState<'Restocked' | 'Stock Sold' | 'Stock Adjusted'>('Restocked');
  const [quickTxProductId, setQuickTxProductId] = useState<string | undefined>(undefined);

  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const { selectedProductDetailId, setSelectedProductDetailId } = useInventory();

  // Modal openers
  const handleOpenQuickSale = (productId?: string) => {
    setQuickTxType('Stock Sold');
    setQuickTxProductId(productId);
    setIsQuickTxOpen(true);
  };

  const handleOpenQuickRestock = (productId?: string) => {
    setQuickTxType('Restocked');
    setQuickTxProductId(productId);
    setIsQuickTxOpen(true);
  };

  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setIsProductFormOpen(true);
  };

  const handleOpenEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsProductFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Container Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72 transition-all">
        {/* Top Header */}
        <Header
          onOpenMobileMenu={() => setIsMobileOpen(true)}
          onNavigateTab={setCurrentTab}
          onOpenQuickSale={() => handleOpenQuickSale()}
          onOpenQuickRestock={() => handleOpenQuickRestock()}
          onOpenAddProduct={handleOpenAddProduct}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardView
              onNavigateTab={setCurrentTab}
              onOpenQuickSale={() => handleOpenQuickSale()}
              onOpenQuickRestock={() => handleOpenQuickRestock()}
              onOpenAddProduct={handleOpenAddProduct}
            />
          )}

          {currentTab === 'products' && (
            <ProductsView
              onOpenAddProduct={handleOpenAddProduct}
              onEditProduct={handleOpenEditProduct}
              onOpenRestock={id => handleOpenQuickRestock(id)}
              onOpenSale={id => handleOpenQuickSale(id)}
            />
          )}

          {currentTab === 'inventory' && (
            <InventoryView
              onOpenQuickSale={() => handleOpenQuickSale()}
              onOpenQuickRestock={() => handleOpenQuickRestock()}
            />
          )}

          {currentTab === 'alerts' && (
            <AlertsView
              onOpenRestock={id => handleOpenQuickRestock(id)}
            />
          )}

          {currentTab === 'prediction' && (
            <DemandPredictionView
              onOpenRestock={(id, _qty) => handleOpenQuickRestock(id)}
            />
          )}

          {currentTab === 'reports' && <ReportsView />}

          {currentTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Quick Transaction Modal */}
      <QuickTransactionModal
        isOpen={isQuickTxOpen}
        initialType={quickTxType}
        initialProductId={quickTxProductId}
        onClose={() => {
          setIsQuickTxOpen(false);
          setQuickTxProductId(undefined);
        }}
      />

      {/* Add / Edit Product Modal */}
      <ProductFormModal
        isOpen={isProductFormOpen}
        productToEdit={editingProduct}
        onClose={() => {
          setIsProductFormOpen(false);
          setEditingProduct(null);
        }}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        productId={selectedProductDetailId}
        onClose={() => setSelectedProductDetailId(null)}
        onEdit={handleOpenEditProduct}
        onOpenRestock={id => handleOpenQuickRestock(id)}
        onOpenSale={id => handleOpenQuickSale(id)}
      />
    </div>
  );
}

export default function App() {
  return (
    <InventoryProvider>
      <MainLayout />
    </InventoryProvider>
  );
}
