import React, { useState, useEffect } from 'react';
import { X, PackagePlus, TrendingDown, ArrowLeftRight, Check, AlertCircle } from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { TransactionType } from '../../types';

interface QuickTransactionModalProps {
  isOpen: boolean;
  initialType: 'Restocked' | 'Stock Sold' | 'Stock Adjusted';
  initialProductId?: string;
  onClose: () => void;
}

export const QuickTransactionModal: React.FC<QuickTransactionModalProps> = ({
  isOpen,
  initialType,
  initialProductId,
  onClose,
}) => {
  const { products, recordTransaction, settings } = useInventory();

  const [txType, setTxType] = useState<TransactionType>(initialType);
  const [selectedProductId, setSelectedProductId] = useState<string>(initialProductId || '');
  const [quantity, setQuantity] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [reference, setReference] = useState<string>('');
  const [userAction, setUserAction] = useState<string>('Elena (Manager)');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (initialType) setTxType(initialType);
    if (initialProductId) {
      setSelectedProductId(initialProductId);
    } else if (products.length > 0 && !selectedProductId) {
      setSelectedProductId(products[0].id);
    }
  }, [initialType, initialProductId, products]);

  if (!isOpen) return null;

  const currentProduct = products.find(p => p.id === selectedProductId) || products[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const parsedQty = parseFloat(quantity);
    if (isNaN(parsedQty) || parsedQty <= 0) {
      setError('Please enter a valid positive quantity.');
      return;
    }

    if (!currentProduct) {
      setError('Please select a product.');
      return;
    }

    if (txType === 'Stock Sold' && parsedQty > currentProduct.currentStock) {
      setError(
        `Cannot sell ${parsedQty} ${currentProduct.unit}. Only ${currentProduct.currentStock} ${currentProduct.unit} in stock!`
      );
      return;
    }

    const effectiveQty = txType === 'Stock Sold' ? -parsedQty : parsedQty;

    recordTransaction({
      productId: currentProduct.id,
      type: txType,
      quantity: effectiveQty,
      user: userAction.trim() || 'Elena (Manager)',
      notes: notes.trim() || (txType === 'Stock Sold' ? 'Customer purchase' : 'Stock intake batch'),
      reference: reference.trim(),
    });

    onClose();
    setQuantity('');
    setNotes('');
    setReference('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              txType === 'Restocked' || txType === 'Stock Added'
                ? 'bg-emerald-100 text-emerald-700'
                : txType === 'Stock Sold'
                ? 'bg-amber-100 text-amber-700'
                : 'bg-blue-100 text-blue-700'
            }`}>
              {txType === 'Stock Sold' ? (
                <TrendingDown className="w-4 h-4 stroke-[2.5]" />
              ) : (
                <PackagePlus className="w-4 h-4 stroke-[2.5]" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {txType === 'Stock Sold' ? 'Record Customer Sale' : 'Receive / Restock Inventory'}
              </h3>
              <p className="text-xs text-slate-500">Live inventory ledger entry</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Transaction Type Segmented Switch */}
        <div className="p-4 bg-slate-50/50 border-b border-slate-100">
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-200/70 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setTxType('Restocked');
                setError('');
              }}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                txType === 'Restocked' || txType === 'Stock Added'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              + Receive Stock (Restock)
            </button>
            <button
              type="button"
              onClick={() => {
                setTxType('Stock Sold');
                setError('');
              }}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                txType === 'Stock Sold'
                  ? 'bg-white text-amber-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              - Record Sale (Checkout)
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Product Select */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Select Product
            </label>
            <select
              value={selectedProductId}
              onChange={e => setSelectedProductId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none text-slate-900 font-medium"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.code}) — Current: {p.currentStock} {p.unit}
                </option>
              ))}
            </select>
          </div>

          {/* Current Stock Preview Badge */}
          {currentProduct && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
              <span className="text-slate-500">Current On-Hand Stock:</span>
              <span className={`font-bold px-2 py-0.5 rounded-md ${
                currentProduct.currentStock <= 0
                  ? 'bg-rose-100 text-rose-800'
                  : currentProduct.currentStock <= currentProduct.minStockLevel
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}>
                {currentProduct.currentStock} {currentProduct.unit}
              </span>
            </div>
          )}

          {/* Quantity Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Quantity to {txType === 'Stock Sold' ? 'Deduct' : 'Add'}
              </label>
              {currentProduct && (
                <span className="text-xs text-slate-400">Unit: {currentProduct.unit}</span>
              )}
            </div>
            <div className="relative">
              <input
                type="number"
                step="any"
                min="0.1"
                required
                placeholder="e.g. 15"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none font-semibold text-slate-900"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 uppercase">
                {currentProduct?.unit}
              </span>
            </div>
          </div>

          {/* Reference code / PO (if restocking) */}
          {txType !== 'Stock Sold' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Purchase Order / Invoice Ref (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. PO-88240 or Delivery Slip"
                value={reference}
                onChange={e => setReference(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
              />
            </div>
          )}

          {/* Notes / Reason */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Notes / Transaction Memo
            </label>
            <input
              type="text"
              placeholder={txType === 'Stock Sold' ? 'e.g. Walk-in customer order' : 'e.g. Fresh farm morning delivery'}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
            />
          </div>

          {/* Action by */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Authorized By
            </label>
            <input
              type="text"
              value={userAction}
              onChange={e => setUserAction(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
            />
          </div>

          {/* Buttons */}
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
              className={`flex items-center gap-2 px-5 py-2 text-sm font-bold text-white rounded-xl shadow-md transition-all ${
                txType === 'Stock Sold'
                  ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
              }`}
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              Confirm & Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
