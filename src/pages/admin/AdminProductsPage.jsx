import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../api/adminService.js';
import { productService } from '../../api/productService.js';
import { formatNaira } from '../../utils/formatters.js';
import { useToast } from '../../context/ToastContext.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Search,
  Package,
  CheckCircle,
  XCircle,
} from 'lucide-react';

export const AdminProductsPage = () => {
  const { success, error: toastError } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      const res = await adminService.getAdminProducts(params);
      setProducts(res.products || []);
    } catch (err) {
      toastError(err.message || 'Failed to retrieve products inventory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleToggleStatus = async (productId, currentActive) => {
    try {
      const updated = await productService.updateProductStatus(productId, !currentActive);
      setProducts((prev) =>
        prev.map((p) => (p._id === productId ? { ...p, active: updated.active } : p))
      );
      success(`Product marked as ${updated.active ? 'Active' : 'Inactive'}.`);
    } catch (err) {
      toastError(err.message || 'Failed to toggle product status.');
    }
  };

  const handleDeleteProduct = async (productId, productName) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${productName}"?`)) {
      return;
    }

    setDeletingId(productId);
    try {
      await productService.deleteProduct(productId);
      setProducts((prev) => prev.filter((p) => p._id !== productId));
      success(`"${productName}" was deleted successfully.`);
    } catch (err) {
      toastError(err.message || 'Failed to delete product.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-850 pb-6">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-[#FFE600] block mb-1">
            CATALOG MANAGEMENT
          </span>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
            PRODUCT INVENTORY ({products.length})
          </h1>
        </div>

        <Link
          to="/admin/products/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FFE600] text-black font-black uppercase tracking-widest text-xs hover:bg-yellow-400 transition-colors shadow-lg"
        >
          <Plus className="w-4 h-4" />
          ADD PRODUCT
        </Link>
      </div>

      {/* Search and Quick Filters */}
      <div className="p-3.5 sm:p-4 bg-[#101010] border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
        <form onSubmit={handleSearch} className="w-full sm:w-96 flex items-center gap-1.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search product name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 pl-9 pr-3 py-2 text-base sm:text-xs text-white placeholder-neutral-500 focus:border-[#FFE600] focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 bg-[#FFE600] text-black text-xs font-bold uppercase tracking-wider hover:bg-yellow-400 flex-shrink-0"
          >
            Search
          </button>
        </form>

        <button
          onClick={fetchProducts}
          className="w-full sm:w-auto px-3 py-2 border border-neutral-800 text-neutral-300 hover:text-white text-xs font-bold uppercase tracking-wider text-center"
        >
          Refresh
        </button>
      </div>

      {/* Inventory Table */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner text="LOADING PRODUCTS INVENTORY..." size="lg" />
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No Products in Inventory"
          description="You have not created any streetwear products yet. Create your first product with colors and images."
          actionText="Create First Product"
          actionLink="/admin/products/new"
        />
      ) : (
        <div className="bg-[#101010] border border-neutral-800 overflow-x-auto -mx-1 sm:mx-0">
          <table className="w-full min-w-[700px] text-left text-xs">
            <thead className="bg-neutral-950 border-b border-neutral-800 text-neutral-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Product</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Colors & Images</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-850 text-neutral-200">
              {products.map((p) => {
                const hasDiscount =
                  p.discountPrice !== null &&
                  p.discountPrice !== undefined &&
                  p.discountPrice > 0;

                const primaryImg = p.images?.[0]?.url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=100';

                return (
                  <tr key={p._id} className="hover:bg-neutral-900/50 transition-colors">
                    {/* Thumbnail & Title */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={primaryImg}
                          alt={p.name}
                          className="w-12 h-14 object-contain p-1 bg-neutral-950 flex-shrink-0"
                        />
                        <div>
                          <p className="font-bold text-white uppercase text-xs line-clamp-1">
                            {p.name}
                          </p>
                          {p.featured && (
                            <span className="inline-block mt-0.5 text-[9px] font-black uppercase text-[#FFE600] bg-[#FFE600]/10 px-1 py-0.5">
                              FEATURED
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 uppercase font-bold text-neutral-400">
                      {p.category}
                    </td>

                    {/* Pricing */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {hasDiscount ? (
                        <div>
                          <span className="font-black text-[#FFE600] block">
                            {formatNaira(p.discountPrice)}
                          </span>
                          <span className="text-[10px] text-neutral-500 line-through">
                            {formatNaira(p.price)} (-{p.discountPercentage}%)
                          </span>
                        </div>
                      ) : (
                        <span className="font-black text-white">{formatNaira(p.price)}</span>
                      )}
                    </td>

                    {/* Colors & Images */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {p.colors?.map((c, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-bold uppercase px-1.5 py-0.5 bg-neutral-900 border border-neutral-700 text-neutral-300"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                      <span className="text-[10px] text-neutral-500 block mt-1">
                        {p.images?.length || 0} images linked
                      </span>
                    </td>

                    {/* Active toggle */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleStatus(p._id, p.active)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded ${
                          p.active
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'bg-neutral-800 text-neutral-500 border border-neutral-700'
                        }`}
                      >
                        {p.active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {p.active ? 'ACTIVE' : 'HIDDEN'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/products/${p._id}/edit`}
                          className="p-1.5 bg-neutral-900 border border-neutral-700 text-neutral-200 hover:text-[#FFE600] hover:border-[#FFE600] rounded"
                          title="Edit Product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Link>

                        <button
                          onClick={() => handleDeleteProduct(p._id, p.name)}
                          disabled={deletingId === p._id}
                          className="p-1.5 bg-neutral-900 border border-neutral-700 text-neutral-400 hover:text-red-400 hover:border-red-500 rounded disabled:opacity-30"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
