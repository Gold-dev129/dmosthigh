import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../api/adminService.js';
import { productService } from '../../api/productService.js';
import { formatNaira, formatDate } from '../../utils/formatters.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import {
  ShoppingBag,
  Package,
  Users,
  CreditCard,
  Clock,
  CheckCircle2,
  Truck,
  CheckCheck,
  TrendingUp,
  ArrowUpRight,
  Eye,
} from 'lucide-react';

export const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await adminService.getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
        setError(err.message || 'Unable to load dashboard metrics.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();

    const handleOrderStatusUpdate = () => {
      adminService.getDashboardStats().then((data) => {
        if (data) setStats(data);
      }).catch(() => {});
    };

    window.addEventListener('dmosthigh_order_status_updated', handleOrderStatusUpdate);
    return () => window.removeEventListener('dmosthigh_order_status_updated', handleOrderStatusUpdate);
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner text="AGGREGATING STORE ANALYTICS..." size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-bold">
        ⚠️ {error}
      </div>
    );
  }

  const statCards = [
    {
      title: 'TOTAL ORDERS',
      value: stats?.totalOrders || 0,
      icon: ShoppingBag,
      color: 'text-white',
      bg: 'bg-neutral-800',
    },
    {
      title: 'TOTAL PRODUCTS',
      value: stats?.totalProducts || 0,
      icon: Package,
      color: 'text-white',
      bg: 'bg-neutral-800',
    },
  ];

  const statusMetrics = [
    { title: 'Awaiting Payment', count: stats?.pendingOrders || 0, icon: Clock, color: 'text-amber-400' },
    { title: 'Paid', count: stats?.paidOrders || 0, icon: CheckCircle2, color: 'text-emerald-400' },
    { title: 'Processing', count: stats?.processingOrders || 0, icon: Clock, color: 'text-blue-400' },
    { title: 'Shipped', count: stats?.shippedOrders || 0, icon: Truck, color: 'text-[#FFE600]' },
    { title: 'Delivered', count: stats?.deliveredOrders || 0, icon: CheckCheck, color: 'text-cyan-400' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-850 pb-6">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-[#FFE600] block mb-1">
            CONTROL CENTER
          </span>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
            ADMIN DASHBOARD
          </h1>
        </div>

        <div className="flex gap-3">
          <Link
            to="/admin/products/new"
            className="px-4 py-2 bg-[#FFE600] text-black font-black uppercase tracking-widest text-xs hover:bg-yellow-400 transition-colors shadow-md"
          >
            + Add Product
          </Link>
          <Link
            to="/admin/orders"
            className="px-4 py-2 border border-neutral-700 bg-neutral-900 text-white font-bold uppercase tracking-wider text-xs hover:border-[#FFE600] transition-colors"
          >
            Manage Orders
          </Link>
        </div>
      </div>

      {/* Main KPI Stat Cards (Revenue and Customers removed) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="p-4 sm:p-6 bg-[#101010] border border-neutral-800 rounded-none relative overflow-hidden group hover:border-neutral-700 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-black uppercase tracking-widest text-neutral-400">
                  {card.title}
                </span>
                <div className={`p-2 rounded ${card.bg} ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xl sm:text-3xl font-black tracking-tight text-white">
                {card.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Order Status Breakdown Grid */}
      <div className="bg-[#101010] border border-neutral-800 p-3.5 sm:p-6">
        <h2 className="text-xs font-black uppercase tracking-widest text-[#FFE600] mb-3 sm:mb-4">
          ORDERS BY FULFILLMENT STATUS
        </h2>
        <div className="grid grid-cols-2 min-[480px]:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
          {statusMetrics.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="p-2.5 sm:p-4 bg-neutral-950 border border-neutral-850 text-center"
              >
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1.5 sm:mb-2 ${item.color}`} />
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-neutral-400 block truncate">
                  {item.title}
                </span>
                <span className="text-base sm:text-xl font-black text-white mt-0.5 sm:mt-1 block">
                  {item.count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Orders Table (Includes Pending WhatsApp Orders) */}
      <div className="bg-[#101010] border border-neutral-800 p-3.5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black uppercase tracking-widest text-white">
            RECENT ORDERS
          </h2>
          <Link
            to="/admin/orders"
            className="text-[11px] sm:text-xs font-black uppercase tracking-widest text-[#FFE600] hover:underline flex items-center gap-1"
          >
            VIEW ALL <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {(() => {
          const recentOrders = stats?.recentOrders || [];

          return recentOrders.length > 0 ? (
            <div className="overflow-x-auto -mx-1 sm:mx-0">
              <table className="w-full min-w-[620px] text-left text-xs">
                <thead className="border-b border-neutral-800 text-neutral-400 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-3 px-3">Order Number</th>
                    <th className="py-3 px-3">Customer</th>
                    <th className="py-3 px-3 min-w-[170px]">Products Ordered</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Amount</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-850 text-neutral-200">
                  {recentOrders.map((ord) => {
                    const isPending = ord.orderStatus === 'pending' || ord.paymentStatus === 'pending';

                    return (
                      <tr key={ord._id} className="hover:bg-neutral-900/50">
                        <td className="py-3.5 px-3 font-bold text-[#FFE600]">
                          {ord.orderNumber}
                        </td>
                        <td className="py-3.5 px-3">
                          <div>
                            <p className="font-bold text-white">{ord.customerName}</p>
                            <p className="text-[10px] text-neutral-500">{ord.customerEmail}</p>
                          </div>
                        </td>
                        {/* Products Ordered Column */}
                        <td className="py-3.5 px-3 min-w-[170px]">
                          {ord.items && ord.items.length > 0 ? (
                            <div className="space-y-1">
                              {ord.items.map((it, idx) => {
                                const catalogProducts = productService.getProductsSync().products || [];
                                const found = catalogProducts.find(
                                  (p) =>
                                    String(p._id) === String(it.productId || it.product?._id || it.product || '') ||
                                    p.slug === (it.productId || it.product?.slug || it.slug)
                                );
                                const prodName =
                                  it.productName ||
                                  it.name ||
                                  it.title ||
                                  (typeof it.product === 'object' && it.product?.name) ||
                                  found?.name ||
                                  'Piece';
                                const variant = [it.selectedColor || it.color, it.selectedSize || it.size].filter(Boolean).join(' • ');
                                return (
                                  <div key={idx} className="leading-tight">
                                    <span className="font-bold text-white text-xs block truncate max-w-[200px]" title={prodName}>
                                      {it.quantity > 1 ? `${it.quantity}x ` : ''}{prodName}
                                    </span>
                                    {variant && (
                                      <span className="text-[10px] text-[#FFE600] font-mono block">
                                        {variant}
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <span className="text-neutral-500 text-[11px]">—</span>
                          )}
                        </td>
                        <td className="py-3.5 px-3 text-neutral-400">
                          {formatDate(ord.createdAt)}
                        </td>
                        <td className="py-3.5 px-3 font-bold text-white">
                          {formatNaira(ord.total)}
                        </td>
                        <td className="py-3.5 px-3">
                          <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider border ${
                            isPending
                              ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                              : ord.orderStatus === 'paid'
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                              : ord.orderStatus === 'processing'
                              ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                              : ord.orderStatus === 'shipped'
                              ? 'bg-[#FFE600]/20 text-[#FFE600] border-[#FFE600]/40'
                              : ord.orderStatus === 'delivered'
                              ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                              : 'bg-red-500/20 text-red-400 border-red-500/40'
                          }`}>
                            {isPending ? 'Awaiting Payment' : ord.orderStatus}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <Link
                            to={`/admin/orders/${ord._id}`}
                            className="p-1.5 inline-flex items-center text-neutral-400 hover:text-[#FFE600]"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-neutral-500 py-6 text-center">
              No orders recorded yet.
            </p>
          );
        })()}
      </div>
    </div>
  );
};
