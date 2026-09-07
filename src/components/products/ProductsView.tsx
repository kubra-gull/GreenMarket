import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowUpDown, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  Eye, 
  PackagePlus, 
  TrendingDown, 
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  LayoutGrid,
  List,
  ChevronDown,
  X,
  SlidersHorizontal,
  RefreshCw
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { Product, Category, StockStatus } from '../../types';

interface ProductsViewProps {
  onOpenAddProduct: () => void;
  onEditProduct: (product: Product) => void;
  onOpenRestock: (productId: string) => void;
  onOpenSale: (productId: string) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  onOpenAddProduct,
  onEditProduct,
  onOpenRestock,
  onOpenSale,
}) => {
  const { 
    products, 
    deleteProduct, 
    settings, 
    globalSearch, 
    setGlobalSearch,
    setSelectedProductDetailId 
  } = useInventory();

  // Local filter states
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('All');
  const [lowStockOnly, setLowStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'name' | 'stock' | 'price' | 'status'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [activeActionMenuId, setActiveActionMenuId] = useState<string | null>(null);

  // Derive unique categories and suppliers
  const categories = useMemo(() => {
    const set = new Set(products.map(p => p.category));
    return ['All', ...Array.from(set)];
  }, [products]);

  const suppliers = useMemo(() => {
    const set = new Set(products.map(p => p.supplier));
    return ['All', ...Array.from(set)];
  }, [products]);

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        // Global search
        if (globalSearch.trim()) {
          const q = globalSearch.toLowerCase();
          const matches =
            p.name.toLowerCase().includes(q) ||
            p.code.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.supplier.toLowerCase().includes(q);
          if (!matches) return false;
        }

        // Category filter
        if (selectedCategory !== 'All' && p.category !== selectedCategory) {
          return false;
        }

        // Stock status filter
        if (selectedStatus !== 'All' && p.status !== selectedStatus) {
          return false;
        }

        // Supplier filter
        if (selectedSupplier !== 'All' && p.supplier !== selectedSupplier) {
          return false;
        }

        // Low stock only switch
        if (lowStockOnly && p.status === 'In Stock') {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        let cmp = 0;
        if (sortBy === 'name') {
          cmp = a.name.localeCompare(b.name);
        } else if (sortBy === 'stock') {
          cmp = a.currentStock - b.currentStock;
        } else if (sortBy === 'price') {
          cmp = a.price - b.price;
        } else if (sortBy === 'status') {
          cmp = a.status.localeCompare(b.status);
        }
        return sortOrder === 'asc' ? cmp : -cmp;
      });
  }, [
    products, 
    globalSearch, 
    selectedCategory, 
    selectedStatus, 
    selectedSupplier, 
    lowStockOnly, 
    sortBy, 
    sortOrder
  ]);

  const toggleSort = (field: 'name' | 'stock' | 'price' | 'status') => {
    if (sortBy === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const clearAllFilters = () => {
    setSelectedCategory('All');
    setSelectedStatus('All');
    setSelectedSupplier('All');
    setLowStockOnly(false);
    setGlobalSearch('');
  };

  const hasActiveFilters = 
    selectedCategory !== 'All' || 
    selectedStatus !== 'All' || 
    selectedSupplier !== 'All' || 
    lowStockOnly || 
    globalSearch.trim().length > 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Product Management
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage catalog items, monitor live inventory counts, update stock, and set reorder thresholds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Grid / Table Toggle */}
          <div className="hidden sm:flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-700'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-700'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <button
            id="add-product-btn"
            onClick={onOpenAddProduct}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-sm shadow-emerald-600/20 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, ID, or supplier..."
              value={globalSearch}
              onChange={e => setGlobalSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-800 font-medium"
            />
            {globalSearch && (
              <button
                onClick={() => setGlobalSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-700 font-medium"
            >
              <option value="All">All Categories</option>
              {categories.filter(c => c !== 'All').map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-700 font-medium"
            >
              <option value="All">All Stock Statuses</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>

          {/* Supplier Filter */}
          <div>
            <select
              value={selectedSupplier}
              onChange={e => setSelectedSupplier(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-700 font-medium truncate"
            >
              <option value="All">All Suppliers</option>
              {suppliers.filter(s => s !== 'All').map(s => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Filter Badges & Reset */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLowStockOnly(prev => !prev)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                lowStockOnly
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Low Stock Only ({products.filter(p => p.status !== 'In Stock').length})
            </button>

            <span className="text-slate-400">
              Showing <strong className="text-slate-800">{filteredProducts.length}</strong> of{' '}
              {products.length} products
            </span>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Content: Table or Grid */}
      {viewMode === 'table' ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">
                    <button
                      onClick={() => toggleSort('name')}
                      className="flex items-center gap-1.5 hover:text-slate-800"
                    >
                      Product
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </button>
                  </th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => toggleSort('price')}
                      className="flex items-center justify-end gap-1.5 hover:text-slate-800 ml-auto"
                    >
                      Price
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </button>
                  </th>
                  <th className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => toggleSort('stock')}
                      className="flex items-center justify-end gap-1.5 hover:text-slate-800 ml-auto"
                    >
                      Current Stock
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </button>
                  </th>
                  <th className="py-3.5 px-4 text-right">Min Level</th>
                  <th className="py-3.5 px-4">
                    <button
                      onClick={() => toggleSort('status')}
                      className="flex items-center gap-1.5 hover:text-slate-800"
                    >
                      Status
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </button>
                  </th>
                  <th className="py-3.5 px-4">Supplier</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map(product => {
                    const isLow = product.status === 'Low Stock';
                    const isOut = product.status === 'Out of Stock';

                    return (
                      <tr
                        key={product.id}
                        className="hover:bg-slate-50/80 transition-colors group"
                      >
                        {/* Name & ID */}
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => setSelectedProductDetailId(product.id)}
                            className="text-left font-bold text-slate-900 hover:text-emerald-700 flex items-center gap-2"
                          >
                            <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                              {product.name.charAt(0)}
                            </span>
                            <div>
                              <div className="font-semibold text-slate-900">{product.name}</div>
                              <span className="font-mono text-[11px] text-slate-400">
                                {product.code}
                              </span>
                            </div>
                          </button>
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                          {product.category}
                        </td>

                        {/* Price */}
                        <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                          {settings.currency}{product.price.toFixed(2)}
                          <span className="text-[11px] font-normal text-slate-400 ml-0.5">
                            /{product.unit}
                          </span>
                        </td>

                        {/* Current Stock */}
                        <td className="py-3.5 px-4 text-right">
                          <span className={`font-black text-sm ${
                            isOut
                              ? 'text-rose-600'
                              : isLow
                              ? 'text-amber-600'
                              : 'text-emerald-700'
                          }`}>
                            {product.currentStock} {product.unit}
                          </span>
                        </td>

                        {/* Min Level */}
                        <td className="py-3.5 px-4 text-right text-slate-500 text-xs font-semibold">
                          {product.minStockLevel} {product.unit}
                        </td>

                        {/* Stock Status */}
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            product.status === 'In Stock'
                              ? 'bg-emerald-100 text-emerald-800'
                              : product.status === 'Low Stock'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              product.status === 'In Stock'
                                ? 'bg-emerald-500'
                                : product.status === 'Low Stock'
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`} />
                            {product.status}
                          </span>
                        </td>

                        {/* Supplier */}
                        <td className="py-3.5 px-4 text-slate-600 text-xs truncate max-w-[140px]">
                          {product.supplier}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedProductDetailId(product.id)}
                              title="View Details"
                              className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => onOpenRestock(product.id)}
                              title="Receive / Restock"
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            >
                              <PackagePlus className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => onOpenSale(product.id)}
                              title="Record Sale"
                              className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            >
                              <TrendingDown className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => onEditProduct(product)}
                              title="Edit"
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to delete ${product.name}?`)) {
                                  deleteProduct(product.id);
                                }
                              }}
                              title="Delete"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400 text-sm">
                      No products match your active search and filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid Card View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map(product => (
            <div
              key={product.id}
              className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-base">
                      {product.name.charAt(0)}
                    </div>
                    <div>
                      <h3 
                        onClick={() => setSelectedProductDetailId(product.id)}
                        className="font-bold text-slate-900 hover:text-emerald-700 cursor-pointer"
                      >
                        {product.name}
                      </h3>
                      <p className="font-mono text-xs text-slate-400">{product.code} • {product.category}</p>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    product.status === 'In Stock'
                      ? 'bg-emerald-100 text-emerald-800'
                      : product.status === 'Low Stock'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {product.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium">Selling Price</span>
                    <p className="font-bold text-slate-900 mt-0.5">
                      {settings.currency}{product.price.toFixed(2)} / {product.unit}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Current Stock</span>
                    <p className={`font-black mt-0.5 ${
                      product.currentStock <= 0 ? 'text-rose-600' : product.currentStock <= product.minStockLevel ? 'text-amber-600' : 'text-emerald-700'
                    }`}>
                      {product.currentStock} {product.unit}
                    </p>
                  </div>
                </div>

                <div className="mt-2 text-xs text-slate-500">
                  Supplier: <strong className="text-slate-700">{product.supplier}</strong>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  onClick={() => setSelectedProductDetailId(product.id)}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
                >
                  View Details →
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onOpenRestock(product.id)}
                    className="p-1.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-xs font-bold"
                    title="Restock"
                  >
                    + Stock
                  </button>
                  <button
                    onClick={() => onOpenSale(product.id)}
                    className="p-1.5 text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg text-xs font-bold"
                    title="Record Sale"
                  >
                    - Sell
                  </button>
                  <button
                    onClick={() => onEditProduct(product)}
                    className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg"
                    title="Edit"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
