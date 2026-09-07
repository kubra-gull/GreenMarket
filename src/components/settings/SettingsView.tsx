import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Store, 
  Database, 
  Save, 
  RotateCcw, 
  Download, 
  Upload, 
  Check, 
  ShieldCheck,
  Code2
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, resetToDemoData, products, transactions } = useInventory();

  const [storeName, setStoreName] = useState(settings.storeName);
  const [tagline, setTagline] = useState(settings.tagline);
  const [currency, setCurrency] = useState(settings.currency);
  const [multiplier, setMultiplier] = useState(settings.lowStockBufferMultiplier.toString());
  const [contactEmail, setContactEmail] = useState(settings.contactEmail);
  const [contactPhone, setContactPhone] = useState(settings.contactPhone);
  const [address, setAddress] = useState(settings.address);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      storeName: storeName.trim(),
      tagline: tagline.trim(),
      currency: currency.trim() || '$',
      lowStockBufferMultiplier: parseFloat(multiplier) || 2.0,
      contactEmail: contactEmail.trim(),
      contactPhone: contactPhone.trim(),
      address: address.trim(),
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleBackupJSON = () => {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      settings,
      products,
      transactions,
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `green_market_backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Store & System Settings
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Configure green market store profile, currency, reorder rules, and data backups.
        </p>
      </div>

      {savedSuccess && (
        <div className="flex items-center gap-2 p-3 text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 rounded-xl animate-in fade-in">
          <Check className="w-4 h-4" />
          <span>Store settings saved successfully!</span>
        </div>
      )}

      {/* Store Profile Form */}
      <form onSubmit={handleSave} className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Store className="w-5 h-5 text-emerald-600" />
          <h2 className="text-base font-bold text-slate-900">Green Market Profile</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Market / Store Name
            </label>
            <input
              type="text"
              required
              value={storeName}
              onChange={e => setStoreName(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none font-semibold text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Currency Symbol
            </label>
            <input
              type="text"
              required
              value={currency}
              onChange={e => setCurrency(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none font-bold text-slate-900"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Tagline / Subtitle
            </label>
            <input
              type="text"
              value={tagline}
              onChange={e => setTagline(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Store Contact Phone
            </label>
            <input
              type="text"
              value={contactPhone}
              onChange={e => setContactPhone(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Store Contact Email
            </label>
            <input
              type="email"
              value={contactEmail}
              onChange={e => setContactEmail(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Physical Store Address
            </label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end pt-3">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all"
          >
            <Save className="w-4 h-4 stroke-[2.5]" />
            Save Profile Settings
          </button>
        </div>
      </form>

      {/* Cloud & Database Readiness (Supabase Architecture) */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">Database & Cloud Integration</h2>
          </div>
          <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800">
            <ShieldCheck className="w-3.5 h-3.5" />
            Supabase Schema Ready
          </span>
        </div>

        <p className="text-xs text-slate-500">
          This system is built with modular relational tables (<code className="text-emerald-700 font-mono">products</code>, <code className="text-emerald-700 font-mono">inventory_transactions</code>, <code className="text-emerald-700 font-mono">store_settings</code>) matching PostgreSQL / Supabase specifications for instant production cloud synchronization.
        </p>

        <div className="p-3 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto">
          <pre>{`-- Supabase / PostgreSQL Tables Schema
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  price DECIMAL(10,2),
  cost_price DECIMAL(10,2),
  current_stock DECIMAL(10,2) DEFAULT 0,
  min_stock_level DECIMAL(10,2) DEFAULT 10,
  unit VARCHAR(20) NOT NULL,
  supplier VARCHAR(255),
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE inventory_transactions (
  id TEXT PRIMARY KEY,
  product_id TEXT REFERENCES products(id),
  type VARCHAR(50) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  previous_stock DECIMAL(10,2),
  updated_stock DECIMAL(10,2),
  authorized_user VARCHAR(100),
  date TIMESTAMPTZ DEFAULT NOW()
);`}</pre>
        </div>
      </div>

      {/* Data Management & Demo Reset */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900">Data Management & Persistence</h2>
        <p className="text-xs text-slate-500">
          Your inventory, transactions, and settings automatically persist in your local browser storage.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleBackupJSON}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl shadow-xs transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            Download JSON Backup
          </button>

          <button
            onClick={() => {
              if (window.confirm('Reset all demo inventory products and transactions to fresh state?')) {
                resetToDemoData();
              }
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Restore Sample Market Data
          </button>
        </div>
      </div>
    </div>
  );
};
