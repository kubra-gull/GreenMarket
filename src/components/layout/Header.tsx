import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, 
  Search, 
  Bell, 
  Plus, 
  TrendingDown, 
  PackagePlus, 
  AlertTriangle,
  ChevronDown,
  CheckCircle2,
  Calendar,
  X
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { TabType } from './Sidebar';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onNavigateTab: (tab: TabType) => void;
  onOpenQuickSale: () => void;
  onOpenQuickRestock: () => void;
  onOpenAddProduct: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileMenu,
  onNavigateTab,
  onOpenQuickSale,
  onOpenQuickRestock,
  onOpenAddProduct,
}) => {
  const { 
    products, 
    alerts, 
    globalSearch, 
    setGlobalSearch,
    setSelectedProductDetailId,
    settings 
  } = useInventory();

  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const alertsRef = useRef<HTMLDivElement>(null);
  const quickActionsRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (alertsRef.current && !alertsRef.current.contains(e.target as Node)) {
        setIsAlertsOpen(false);
      }
      if (quickActionsRef.current && !quickActionsRef.current.contains(e.target as Node)) {
        setIsQuickActionsOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered search results for quick dropdown jump
  const searchResults = globalSearch.trim()
    ? products.filter(p =>
        p.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
        p.code.toLowerCase().includes(globalSearch.toLowerCase()) ||
        p.category.toLowerCase().includes(globalSearch.toLowerCase()) ||
        p.supplier.toLowerCase().includes(globalSearch.toLowerCase())
      ).slice(0, 5)
    : [];

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-8 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      {/* Left section: mobile hamburger & search */}
      <div className="flex items-center gap-3 flex-1 max-w-2xl">
        <button
          id="mobile-menu-toggle"
          onClick={onOpenMobileMenu}
          className="p-2 -ml-2 text-slate-600 rounded-lg hover:bg-slate-100 lg:hidden focus:outline-none focus:ring-2 focus:ring-emerald-500"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <div ref={searchRef} className="relative w-full max-w-md">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="global-search-input"
              type="text"
              placeholder="Search products by name, ID, category, or supplier..."
              value={globalSearch}
              onChange={e => setGlobalSearch(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              className="w-full pl-10 pr-9 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all placeholder:text-slate-400"
            />
            {globalSearch && (
              <button
                onClick={() => setGlobalSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Search Results Dropdown */}
          {isSearchFocused && globalSearch.trim().length > 0 && (
            <div className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200/80 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="p-2 border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold uppercase text-slate-500 tracking-wider">
                Matching Products ({searchResults.length})
              </div>
              {searchResults.length > 0 ? (
                <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                  {searchResults.map(p => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedProductDetailId(p.id);
                        setIsSearchFocused(false);
                      }}
                      className="w-full flex items-center justify-between p-3 hover:bg-emerald-50/60 text-left transition-colors"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{p.name}</p>
                        <p className="text-xs text-slate-500">
                          {p.code} • {p.category} • {p.supplier}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          p.status === 'In Stock'
                            ? 'bg-emerald-100 text-emerald-800'
                            : p.status === 'Low Stock'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {p.currentStock} {p.unit}
                        </span>
                        <p className="text-xs font-semibold text-slate-700 mt-0.5">
                          {settings.currency}{p.price.toFixed(2)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-sm text-slate-500">
                  No products found matching "{globalSearch}"
                </div>
              )}
              <div className="p-2 bg-slate-50 border-t border-slate-100 text-center">
                <button
                  onClick={() => {
                    onNavigateTab('products');
                    setIsSearchFocused(false);
                  }}
                  className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold"
                >
                  View all in Products Page →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right section: live status, quick actions, notifications */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Date display on medium+ */}
        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100/70 text-slate-600 text-xs font-medium">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>{todayFormatted}</span>
        </div>

        {/* Quick Actions Dropdown */}
        <div ref={quickActionsRef} className="relative">
          <button
            id="header-quick-action-btn"
            onClick={() => setIsQuickActionsOpen(prev => !prev)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-sm font-semibold shadow-sm shadow-emerald-600/20 transition-colors"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Quick Action</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-70" />
          </button>

          {isQuickActionsOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200/80 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <button
                id="action-receive-stock"
                onClick={() => {
                  setIsQuickActionsOpen(false);
                  onOpenQuickRestock();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 rounded-lg text-left transition-colors"
              >
                <PackagePlus className="w-4 h-4 text-emerald-600" />
                <div>
                  <div className="font-semibold">Receive Stock</div>
                  <div className="text-[11px] text-slate-400">Add incoming inventory</div>
                </div>
              </button>

              <button
                id="action-record-sale"
                onClick={() => {
                  setIsQuickActionsOpen(false);
                  onOpenQuickSale();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-amber-50 hover:text-amber-900 rounded-lg text-left transition-colors"
              >
                <TrendingDown className="w-4 h-4 text-amber-600" />
                <div>
                  <div className="font-semibold">Record Sale</div>
                  <div className="text-[11px] text-slate-400">Deduct sold quantity</div>
                </div>
              </button>

              <div className="my-1 border-t border-slate-100" />

              <button
                id="action-add-product"
                onClick={() => {
                  setIsQuickActionsOpen(false);
                  onOpenAddProduct();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg text-left transition-colors"
              >
                <Plus className="w-4 h-4 text-slate-600" />
                <div className="font-medium">Create New Product</div>
              </button>
            </div>
          )}
        </div>

        {/* Notifications Bell with Low-stock Alert Preview */}
        <div ref={alertsRef} className="relative">
          <button
            id="header-notification-bell"
            onClick={() => setIsAlertsOpen(prev => !prev)}
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            {alerts.length > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center min-w-4 h-4 px-1 text-[10px] font-bold text-white bg-rose-500 rounded-full ring-2 ring-white">
                {alerts.length}
              </span>
            )}
          </button>

          {isAlertsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <h4 className="font-bold text-sm text-slate-900">
                    Active Stock Alerts ({alerts.length})
                  </h4>
                </div>
                <button
                  onClick={() => {
                    setIsAlertsOpen(false);
                    onNavigateTab('alerts');
                  }}
                  className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold"
                >
                  View All
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {alerts.length > 0 ? (
                  alerts.slice(0, 5).map(alert => (
                    <div
                      key={alert.productId}
                      className="p-3 hover:bg-slate-50 transition-colors flex items-start justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${
                            alert.severity === 'critical' ? 'bg-rose-500' : 'bg-amber-500'
                          }`} />
                          <p className="text-sm font-semibold text-slate-900 truncate">
                            {alert.productName}
                          </p>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Stock: <span className="font-semibold text-slate-800">{alert.currentStock} {alert.unit}</span> (Min: {alert.minStockLevel} {alert.unit})
                        </p>
                        <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
                          Rec. restock: +{alert.recommendedRestock} {alert.unit}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setIsAlertsOpen(false);
                          setSelectedProductDetailId(alert.productId);
                        }}
                        className="shrink-0 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60 transition-colors"
                      >
                        Inspect
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-slate-500">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-700">All Stock Levels Healthy</p>
                    <p className="text-xs text-slate-400 mt-0.5">No products currently below reorder thresholds.</p>
                  </div>
                )}
              </div>

              {alerts.length > 5 && (
                <div className="p-2.5 text-center bg-slate-50 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setIsAlertsOpen(false);
                      onNavigateTab('alerts');
                    }}
                    className="text-xs font-semibold text-slate-600 hover:text-emerald-700"
                  >
                    + {alerts.length - 5} more items requiring restock
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
