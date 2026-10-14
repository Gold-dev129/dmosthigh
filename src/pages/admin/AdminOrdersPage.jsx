import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../api/adminService.js';
import { formatNaira, formatDate } from '../../utils/formatters.js';
import { useToast } from '../../context/ToastContext.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import {
  Search,
  Filter,
  Eye,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  MessageCircle,
} from 'lucide-react';
import { getAdminCustomerWhatsAppUrl } from '../../utils/whatsapp.js';
import { productService } from '../../api/productService.js';

export const AdminOrdersPage = () => {
  const { success, error: toastError } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const res = await adminService.getAllOrders(params);
      const allOrders = res.orders || [];
      // Show ALL orders, including pending WhatsApp orders
      setOrders(allOrders);
    } catch (err) {
      toastError(err.message || 'Failed to fetch admin orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    const handleOrderStatusUpdate = (e) => {
      const { orderId, status } = e.detail || {};
      if (orderId && status) {
        setOrders((prev) =>
          prev.map((ord) =>
            ord._id === orderId || ord.orderNumber === orderId
              ? {
                  ...ord,
                  orderStatus: status,
                  ...(status === 'paid' ? { paymentStatus: 'paid' } : {}),
                }
              : ord
          )
        );
      }
    };

    window.addEventListener('dmosthigh_order_status_updated', handleOrderStatusUpdate);
    return () => window.removeEventListener('dmosthigh_order_status_updated', handleOrderStatusUpdate);
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  /**
   * Admin confirms customer bank transfer / WhatsApp payment
   */
  const handleMarkAsPaid = async (order) => {
    const confirmMsg = `Have you confirmed payment transfer for order "${order.orderNumber}"?\n\nThis will mark the order as PAID and open WhatsApp with an official payment confirmation for ${order.customerName}.`;
    if (!window.confirm(confirmMsg)) return;

    setUpdatingId(order._id);
    try {
      await adminService.updateOrderStatus(order._id, 'paid');
      success(`Order "${order.orderNumber}" successfully confirmed and marked as PAID!`);
      setOrders((prev) =>
        prev.map((ord) =>
          ord._id === order._id
            ? { ...ord, orderStatus: 'paid', paymentStatus: 'paid', paidAt: new Date().toISOString() }
            : ord
        )
      );

      // Open WhatsApp to notify the customer immediately!
      const waUrl = getAdminCustomerWhatsAppUrl(order);
      if (waUrl) {
        window.open(waUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      toastError(err.message || 'Failed to mark order as paid.');
    } finally {
      setUpdatingId(null);
    }
  };

  /**
   * Fast status change action (e.g. processing -> shipped, shipped -> delivered)
   */
  const handleQuickStatusChange = async (orderId, newStatus) => {
    const confirmMsg = `Are you sure you want to change order status to "${newStatus.toUpperCase()}"?`;
    if (!window.confirm(confirmMsg)) return;

    setUpdatingId(orderId);
    try {
      await adminService.updateOrderStatus(orderId, newStatus);
      success(`Order status successfully updated to "${newStatus.toUpperCase()}".`);
      setOrders((prev) =>
        prev.map((ord) => (ord._id === orderId ? { ...ord, orderStatus: newStatus } : ord))
      );
    } catch (err) {
      toastError(err.message || 'Failed to update order status.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Instant multi-field filter by customer name, phone number, email, or order #
  const filteredOrders = orders.filter((ord) => {
    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      const matchName = ord.customerName?.toLowerCase().includes(q);
      const matchPhone = ord.customerPhone?.toLowerCase().includes(q);
      const matchEmail = ord.customerEmail?.toLowerCase().includes(q);
      const matchOrderNum = ord.orderNumber?.toLowerCase().includes(q);
      return matchName || matchPhone || matchEmail || matchOrderNum;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-850 pb-6">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-[#FFE600] block mb-1">
            FULFILLMENT
          </span>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
            CUSTOMER ORDERS ({filteredOrders.length})
          </h1>
        </div>

        <button
          onClick={fetchOrders}
          className="p-2 border border-neutral-800 bg-neutral-900 text-neutral-300 hover:text-white rounded flex items-center gap-1.5 text-xs font-bold"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 p-3.5 sm:p-4 bg-[#101010] border border-neutral-800">
        {/* Search Input: Name, Number, Email */}
        <form onSubmit={handleSearchSubmit} className="w-full sm:w-96 flex items-center gap-1.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search customer name, phone, or email..."
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

        {/* Status Filter */}
        <div className="w-full sm:w-auto flex items-center gap-2">
          <Filter className="w-4 h-4 text-neutral-400 flex-shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto bg-neutral-900 border border-neutral-800 text-xs font-bold uppercase tracking-wider text-white px-3 py-2 focus:border-[#FFE600] focus:outline-none"
          >
            <option value="">ALL ORDERS</option>
            <option value="pending">PENDING (AWAITING PAYMENT)</option>
            <option value="paid">PAID (CONFIRMED)</option>
            <option value="processing">PROCESSING</option>
            <option value="shipped">SHIPPED</option>
            <option value="delivered">DELIVERED</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner text="LOADING ORDER LOGS..." size="lg" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          title="No Paid Orders Match Criteria"
          description="There are no paid customer orders matching your selected filter or search term."
          actionText="Clear Filters"
          onAction={() => {
            setStatusFilter('');
            setSearchTerm('');
            fetchOrders();
          }}
        />
      ) : (
        <div className="bg-[#101010] border border-neutral-800 overflow-x-auto -mx-1 sm:mx-0">
          <table className="w-full min-w-[900px] text-left text-xs">
            <thead className="bg-neutral-950 border-b border-neutral-800 text-neutral-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Order #</th>
                <th className="py-3.5 px-4">Customer Details</th>
                <th className="py-3.5 px-4 min-w-[220px]">Products Ordered</th>
                <th className="py-3.5 px-4">City / State</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Workflow Action</th>
                <th className="py-3.5 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-850 text-neutral-200">
              {filteredOrders.map((ord) => (
                <tr key={ord._id} className="hover:bg-neutral-900/50 transition-colors">
                  <td className="py-4 px-4 font-black text-[#FFE600] whitespace-nowrap">
                    {ord.orderNumber}
                    <span className="block text-[10px] font-normal text-neutral-500">
                      {formatDate(ord.createdAt)}
                    </span>
                  </td>

                  <td className="py-4 px-4">
                    <p className="font-bold text-white uppercase">{ord.customerName}</p>
                    <p className="text-[11px] text-neutral-400">{ord.customerPhone}</p>
                    <p className="text-[10px] text-neutral-500">{ord.customerEmail}</p>
                  </td>

                  {/* Products Ordered Column */}
                  <td className="py-4 px-4 min-w-[220px]">
                    {ord.items && ord.items.length > 0 ? (
                      <div className="space-y-1.5">
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
                            'Streetwear Piece';
                          const variant = [it.selectedColor || it.color, it.selectedSize || it.size].filter(Boolean).join(' • ');
                          const itImg =
                            it.productImage ||
                            it.image ||
                            (typeof it.product === 'object' && it.product?.images?.[0]?.url) ||
                            found?.images?.[0]?.url;

                          return (
                            <div key={idx} className="flex items-center gap-2">
                              {itImg && (
                                <img
                                  src={itImg}
                                  alt={prodName}
                                  className="w-8 h-9 object-contain p-0.5 bg-neutral-900 border border-neutral-800 flex-shrink-0"
                                />
                              )}
                              <div className="leading-tight">
                                <span className="font-bold text-white text-xs block truncate max-w-[200px]" title={prodName}>
                                  {it.quantity > 1 ? `${it.quantity}x ` : ''}{prodName}
                                </span>
                                {variant && (
                                  <span className="text-[10px] text-[#FFE600] font-mono block">
                                    {variant}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="text-neutral-500 text-[11px] italic">No items listed</span>
                    )}
                  </td>

                  <td className="py-4 px-4 whitespace-nowrap">
                    <span className="font-bold uppercase text-white">
                      {ord.shippingAddress?.city}
                    </span>
                    <span className="block text-[10px] text-neutral-400">
                      {ord.shippingAddress?.state}
                    </span>
                  </td>

                  <td className="py-4 px-4 font-black text-white whitespace-nowrap">
                    {formatNaira(ord.total)}
                    <span className="block text-[10px] font-normal text-neutral-400">
                      Fee: {formatNaira(ord.shippingFee)}
                    </span>
                  </td>

                  <td className="py-4 px-4 whitespace-nowrap">
                    <span
                      className={`inline-block px-2.5 py-1 text-[9px] font-black uppercase tracking-wider border ${
                        ord.orderStatus === 'pending' || ord.paymentStatus === 'pending'
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 animate-pulse'
                          : ord.orderStatus === 'paid'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          : ord.orderStatus === 'processing'
                          ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                          : ord.orderStatus === 'shipped'
                          ? 'bg-[#FFE600]/20 text-[#FFE600] border-[#FFE600]/40'
                          : ord.orderStatus === 'delivered'
                          ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                          : 'bg-neutral-900 text-neutral-400 border-neutral-800'
                      }`}
                    >
                      {ord.orderStatus === 'pending' || ord.paymentStatus === 'pending'
                        ? 'AWAITING PAYMENT'
                        : ord.orderStatus}
                    </span>
                  </td>

                  {/* Status Transition Action & Direct Selector */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <select
                        value={ord.orderStatus || 'pending'}
                        onChange={(e) => handleQuickStatusChange(ord._id, e.target.value)}
                        disabled={updatingId === ord._id}
                        className="bg-neutral-900 border border-neutral-700 text-[10px] font-black uppercase tracking-wider text-white px-2 py-1.5 focus:border-[#FFE600] focus:outline-none"
                      >
                        <option value="pending">PENDING</option>
                        <option value="paid">PAID</option>
                        <option value="processing">PROCESSING</option>
                        <option value="shipped">SHIPPED</option>
                        <option value="delivered">DELIVERED</option>
                        <option value="cancelled">CANCELLED</option>
                      </select>

                      {ord.orderStatus === 'pending' || ord.paymentStatus === 'pending' ? (
                        <button
                          onClick={() => handleMarkAsPaid(ord)}
                          disabled={updatingId === ord._id}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-500 text-black font-black uppercase text-[10px] tracking-wider hover:bg-emerald-400 transition-colors shadow-sm disabled:opacity-50"
                          title="Confirm receipt and notify on WhatsApp"
                        >
                          <MessageCircle className="w-3 h-3" />
                          CONFIRM
                        </button>
                      ) : ord.orderStatus === 'processing' || ord.orderStatus === 'paid' ? (
                        <button
                          onClick={() => handleQuickStatusChange(ord._id, 'shipped')}
                          disabled={updatingId === ord._id}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#FFE600] text-black font-black uppercase text-[10px] tracking-wider hover:bg-yellow-400 transition-colors shadow-sm disabled:opacity-50"
                          title="Quick transition to Shipped"
                        >
                          <Truck className="w-3 h-3" />
                          SHIP
                        </button>
                      ) : ord.orderStatus === 'shipped' ? (
                        <button
                          onClick={() => handleQuickStatusChange(ord._id, 'delivered')}
                          disabled={updatingId === ord._id}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-cyan-400 text-black font-black uppercase text-[10px] tracking-wider hover:bg-cyan-300 transition-colors shadow-sm disabled:opacity-50"
                          title="Quick transition to Delivered"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          DELIVER
                        </button>
                      ) : null}
                    </div>
                  </td>

                  <td className="py-4 px-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5">
                      {getAdminCustomerWhatsAppUrl(ord) && (
                        <a
                          href={getAdminCustomerWhatsAppUrl(ord)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-black transition-colors text-xs font-bold"
                          title="Message customer directly on WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span className="hidden min-[480px]:inline">WhatsApp</span>
                        </a>
                      )}
                      <Link
                        to={`/admin/orders/${ord._id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-neutral-900 border border-neutral-700 text-neutral-200 text-xs font-bold hover:text-[#FFE600] hover:border-[#FFE600] transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
