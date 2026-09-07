import React, { useState, useEffect } from 'react';
import { X, PackagePlus, Save, AlertCircle } from 'lucide-react';
import { Product, Category, UnitType } from '../../types';
import { useInventory } from '../../context/InventoryContext';

interface ProductFormModalProps {
  isOpen: boolean;
  productToEdit?: Product | null;
  onClose: () => void;
}

const CATEGORIES: Category[] = [
  'Vegetables',
  'Fruits',
  'Grains & Staples',
  'Dairy & Eggs',
  'Oils & Pantry',
];

const UNITS: UnitType[] = ['kg', 'g', 'liter', 'dozen', 'bag', 'bunch', 'box'];

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  productToEdit,
  onClose,
}) => {
  const { addProduct, updateProduct, products, settings } = useInventory();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState<Category>('Vegetables');
  const [price, setPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [currentStock, setCurrentStock] = useState('');
  const [minStockLevel, setMinStockLevel] = useState('');
  const [unit, setUnit] = useState<UnitType>('kg');
  const [supplier, setSupplier] = useState('');
  const [supplierPhone, setSupplierPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setCode(productToEdit.code);
      setCategory(productToEdit.category);
      setPrice(productToEdit.price.toString());
      setCostPrice(productToEdit.costPrice.toString());
      setCurrentStock(productToEdit.currentStock.toString());
      setMinStockLevel(productToEdit.minStockLevel.toString());
      setUnit(productToEdit.unit);
      setSupplier(productToEdit.supplier);
      setSupplierPhone(productToEdit.supplierPhone || '');
      setNotes(productToEdit.notes || '');
    } else {
      // Auto generate next code
      const nextNum = products.length + 101;
      setCode(`PRD-${nextNum}`);
      setName('');
      setCategory('Vegetables');
      setPrice('');
      setCostPrice('');
      setCurrentStock('10');
      setMinStockLevel('15');
      setUnit('kg');
      setSupplier('Green Valley Organic Farms');
      setSupplierPhone('');
      setNotes('');
    }
    setError('');
  }, [productToEdit, isOpen, products.length]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please provide a product name.');
      return;
    }

    const numPrice = parseFloat(price);
    const numCost = parseFloat(costPrice) || parseFloat(price) * 0.6;
    const numStock = parseFloat(currentStock);
    const numMinStock = parseFloat(minStockLevel);

    if (isNaN(numPrice) || numPrice < 0) {
      setError('Please provide a valid selling price.');
      return;
    }
    if (isNaN(numStock) || numStock < 0) {
      setError('Please enter a valid non-negative current stock.');
      return;
    }
    if (isNaN(numMinStock) || numMinStock < 0) {
      setError('Please enter a valid minimum stock level threshold.');
      return;
    }

    if (productToEdit) {
      updateProduct(productToEdit.id, {
        name: name.trim(),
        code: code.trim(),
        category,
        price: numPrice,
        costPrice: numCost,
        currentStock: numStock,
        minStockLevel: numMinStock,
        unit,
        supplier: supplier.trim() || 'General Market Farm',
        supplierPhone: supplierPhone.trim(),
        notes: notes.trim(),
      });
    } else {
      addProduct({
        code: code.trim() || `PRD-${Date.now().toString().slice(-3)}`,
        name: name.trim(),
        category,
        price: numPrice,
        costPrice: numCost,
        currentStock: numStock,
        minStockLevel: numMinStock,
        unit,
        supplier: supplier.trim() || 'General Market Farm',
        supplierPhone: supplierPhone.trim(),
        notes: notes.trim(),
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <PackagePlus className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {productToEdit ? 'Edit Product Details' : 'Add New Inventory Product'}
              </h3>
              <p className="text-xs text-slate-500">
                {productToEdit ? `Updating ${productToEdit.name}` : 'Catalog new grocery or produce item'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Product Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Roma Tomatoes, Whole Grain Wheat..."
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none text-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Product ID / SKU *
              </label>
              <input
                type="text"
                required
                placeholder="PRD-101"
                value={code}
                onChange={e => setCode(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none font-mono text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as Category)}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none font-medium"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Measurement Unit *
              </label>
              <select
                value={unit}
                onChange={e => setUnit(e.target.value as UnitType)}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none font-medium"
              >
                {UNITS.map(u => (
                  <option key={u} value={u}>
                    {u} (e.g. per {u})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50/70 border border-slate-200/70">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Selling Price ({settings.currency}) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                  {settings.currency}
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="3.49"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  className="w-full pl-8 pr-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none font-bold text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Cost Price ({settings.currency})
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                  {settings.currency}
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="1.80"
                  value={costPrice}
                  onChange={e => setCostPrice(e.target.value)}
                  className="w-full pl-8 pr-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Current Stock On-Hand ({unit}) *
              </label>
              <input
                type="number"
                step="any"
                min="0"
                required
                placeholder="25"
                value={currentStock}
                onChange={e => setCurrentStock(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none font-semibold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Minimum Stock Level (Alert Threshold) *
              </label>
              <input
                type="number"
                step="any"
                min="1"
                required
                placeholder="15"
                value={minStockLevel}
                onChange={e => setMinStockLevel(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none font-semibold text-slate-900"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Triggers Low Stock Alert when inventory falls below this amount.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Supplier Name
              </label>
              <input
                type="text"
                placeholder="e.g. Green Valley Organic Farms"
                value={supplier}
                onChange={e => setSupplier(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Supplier Contact / Phone
              </label>
              <input
                type="text"
                placeholder="e.g. +1 (555) 234-1101"
                value={supplierPhone}
                onChange={e => setSupplierPhone(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Description & Storage Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Keep refrigerated at 4°C, perishable within 5 days..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 transition-all"
            >
              <Save className="w-4 h-4 stroke-[2.5]" />
              {productToEdit ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
