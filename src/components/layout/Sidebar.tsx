import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ArrowLeftRight, 
  AlertTriangle, 
  TrendingUp, 
  FileSpreadsheet, 
  Settings, 
  Sprout, 
  X,
  Store,
  LogOut,
  Sparkles
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';

export type TabType = 'dashboard' | 'products' | 'inventory' | 'alerts' | 'prediction' | 'reports' | 'settings';

interface SidebarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { alerts, settings, resetToDemoData } = useInventory();
  const alertCount = alerts.length;

  const navItems = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products' as TabType, label: 'Products', icon: Package },
    { id: 'inventory' as TabType, label: 'Inventory Tracking', icon: ArrowLeftRight },
    { 
      id: 'alerts' as TabType, 
      label: 'Stock Alerts', 
      icon: AlertTriangle,
      badge: alertCount > 0 ? alertCount : undefined,
      badgeColor: 'bg-amber-500 text-white'
    },
    { id: 'prediction' as TabType, label: 'Demand Prediction', icon: TrendingUp },
    { id: 'reports' as TabType, label: 'Reports & Analytics', icon: FileSpreadsheet },
    { id: 'settings' as TabType, label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-72 bg-white border-r border-slate-200/80 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
              <Sprout className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-base leading-tight tracking-tight">
                Green Market
              </h1>
              <p className="text-xs text-emerald-700 font-medium">
                Inventory System
              </p>
            </div>
          </div>
          <button 
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Store Quick Status Banner */}
        <div className="px-5 py-3 mx-4 my-3 rounded-xl bg-emerald-50/70 border border-emerald-100/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-900 truncate max-w-[135px]">
              {settings.storeName}
            </span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wider">
            Live
          </span>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/25 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold shadow-xs ${
                    isActive ? 'bg-white text-emerald-700' : item.badgeColor
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User profile & quick actions at bottom */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between gap-3 p-2 rounded-xl bg-white border border-slate-200/60 shadow-xs">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm ring-2 ring-emerald-600/20 shrink-0">
                EV
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate">
                  Elena Vance
                </p>
                <p className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                  <Store className="w-3 h-3 text-slate-400 shrink-0" />
                  Shop Owner
                </p>
              </div>
            </div>
            <button
              id="sidebar-reset-demo"
              onClick={() => {
                if (window.confirm('Reset all demo products and records to standard market state?')) {
                  resetToDemoData();
                }
              }}
              title="Reset sample grocery data"
              className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-2 text-center">
            <span className="text-[11px] text-slate-400">
              Green Market OS v2.4 • Grocery Retail
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
