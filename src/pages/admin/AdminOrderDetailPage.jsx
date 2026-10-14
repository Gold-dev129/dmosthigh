import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminService } from '../../api/adminService.js';
import { formatNaira, formatDate } from '../../utils/formatters.js';
import { useToast } from '../../context/ToastContext.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import {
  ArrowLeft,
  Truck,
  Package,
  User,
  MapPin,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Clock,
  MessageCircle,
} from 'lucide-react';
import { getAdminCustomerWhatsAppUrl } from '../../utils/whatsapp.js';

export const AdminOrderDetailPage = () => {
  const { id } = useParams();
  const { success, error: toastError } = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAdminOrderById(id);
      if (!data) throw new Error('Order not found.');
      setOrder(data);
      setSelectedStatus(data.orderStatus);
    } catch (err) {
      toastError(err.message || 'Failed to fetch order details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleUpdateStatus = async (newStatus) => {
    const targetStatus = newStatus || selectedStatus;
    if (!targetStatus || targetStatus === order.orderStatus) return;

    if (!window.confirm(`Confirm changing order status to "${targetStatus.toUpperCase()}"?`)) {
      return;
    }

    setUpdating(true);
    try {
      const updated = await adminService.updateOrderStatus(id, targetStatus);
      setOrder(updated);
      setSelectedStatus(updated.orderStatus);
      success(`Order status updated to "${updated.orderStatus.toUpperCase()}".`);
    } catch (err) {
      toastError(err.message || 'Failed to update order status.');
    } finally {
      setUpdating(false);
    }
  };

  const handleConfirmPaidAndWhatsApp = async () => {
    const confirmMsg = `Have you confirmed payment for order "${order.orderNumber}"?\n\nThis will mark the order as PAID and open WhatsApp with an official confirmation receipt for ${order.customerName}.`;
    if (!window.confirm(confirmMsg)) return;

    setUpdating(true);
    try {
      const updated = await adminService.updateOrderStatus(id, 'paid');
      setOrder(updated);
      setSelectedStatus(updated.orderStatus);
      success(`Order "${order.orderNumber}" marked as PAID!`);

      const waUrl = getAdminCustomerWhatsAppUrl(updated || order);
      if (waUrl) {
        window.open(waUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      toastError(err.message || 'Failed to update order status.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner text="FETCHING CLIENT ORDER FILE..." size="lg" />
      </div>
    );
  }

  if (!order) {
    return (
      <EmptyState
        title="Order Not Found"
        description="Could not locate order with the specified record ID."
        actionText="Back to Orders"
        actionLink="/admin/orders"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="border-b border-neutral-850 pb-4 flex items-center justify-between">
        <Link
          to="/admin/orders"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-[#FFE600] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </Link>
        <span className="text-xs text-neutral-500 font-mono">
          ID: {order._id}
        </span>
      </div>

      {/* Main Order Details Card */}
      <div className="bg-[#101010] border border-neutral-800 p-3.5 min-[380px]:p-4 sm:p-8 space-y-6 sm:space-y-8">
        {/* Order Title & Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 border-b border-neutral-800 pb-5 sm:pb-6">
          <div>
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#FFE600] block mb-1">
              DISPATCH RECORD
            </span>
            <h1 className="text-xl sm:text-3xl font-black text-white">
              {order.orderNumber}
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              Received on {formatDate(order.createdAt)}
            </p>
          </div>

          {/* Quick status updater */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 bg-neutral-950 p-2.5 border border-neutral-800">
            <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">
              STATUS:
            </span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-neutral-900 border border-neutral-700 text-xs font-black uppercase tracking-wider text-[#FFE600] px-2 sm:px-3 py-1.5 focus:outline-none"
            >
              <option value="pending">PENDING</option>
              <option value="paid">PAID</option>
              <option value="processing">PROCESSING</option>
              <option value="shipped">SHIPPED</option>
              <option value="delivered">DELIVERED</option>
              <option value="cancelled">CANCELLED</option>
            </select>
            <button
              onClick={() => handleUpdateStatus()}
              disabled={updating || selectedStatus === order.orderStatus}
              className="px-3 py-1.5 bg-[#FFE600] text-black font-black uppercase text-[10px] tracking-wider hover:bg-yellow-400 transition-colors disabled:opacity-40"
            >
              {updating ? 'SAVING...' : 'UPDATE'}
            </button>
          </div>
        </div>

        {/* Quick Transition Shortcuts */}
        <div className="flex flex-wrap items-center gap-3 p-3 bg-neutral-950/60 border border-neutral-850">
          <span className="text-[11px] font-black uppercase tracking-wider text-neutral-400">
            QUICK ACTIONS:
          </span>
          {order.orderStatus === 'pending' || order.paymentStatus === 'pending' ? (
            <button
              onClick={() => handleConfirmPaidAndWhatsApp()}
              disabled={updating}
              className="px-4 py-2 bg-emerald-500 text-black font-black uppercase text-xs tracking-wider hover:bg-emerald-400 flex items-center gap-2 shadow-lg animate-pulse disabled:opacity-50"
            >
              <MessageCircle className="w-4 h-4" />
              CONFIRM PAID & NOTIFY ON WHATSAPP
            </button>
          ) : null}

          {getAdminCustomerWhatsAppUrl(order) && (
            <a
              href={getAdminCustomerWhatsAppUrl(order)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 bg-neutral-900 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-black font-black uppercase text-xs tracking-wider flex items-center gap-1.5 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              MESSAGE CUSTOMER ON WHATSAPP
            </a>
          )}

          {order.orderStatus === 'processing' || order.orderStatus === 'paid' ? (
            <button
              onClick={() => handleUpdateStatus('shipped')}
              disabled={updating}
              className="px-3 py-1 bg-[#FFE600] text-black font-black uppercase text-[10px] tracking-wider hover:bg-yellow-400 flex items-center gap-1.5 disabled:opacity-50"
            >
              <Truck className="w-3.5 h-3.5" />
              MARK SHIPPED (PROCESSING → SHIPPED)
            </button>
          ) : null}

          {order.orderStatus === 'shipped' ? (
            <button
              onClick={() => handleUpdateStatus('delivered')}
              disabled={updating}
              className="px-3 py-1 bg-cyan-400 text-black font-black uppercase text-[10px] tracking-wider hover:bg-cyan-300 flex items-center gap-1.5 disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              MARK DELIVERED (SHIPPED → DELIVERED)
            </button>
          ) : null}
        </div>

        {/* Customer & Shipping Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Profile */}
          <div className="p-5 bg-neutral-950 border border-neutral-850 space-y-2.5 text-xs">
            <h3 className="font-black uppercase tracking-widest text-[#FFE600] flex items-center gap-2 mb-3">
              <User className="w-4 h-4" />
              CUSTOMER PROFILE
            </h3>
            <p><strong className="text-neutral-400">Name:</strong> {order.customerName}</p>
            <p><strong className="text-neutral-400">Email:</strong> {order.customerEmail}</p>
            <p className="flex items-center flex-wrap gap-2">
              <strong className="text-neutral-400">Phone:</strong> {order.customerPhone}
              {getAdminCustomerWhatsAppUrl(order) && (
                <a
                  href={getAdminCustomerWhatsAppUrl(order)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-bold"
                >
                  <MessageCircle className="w-3.5 h-3.5" /> Chat on WhatsApp
                </a>
              )}
            </p>
            {order.user && (
              <p className="text-[10px] text-neutral-500 pt-1">
                Linked User ID: {order.user._id || order.user}
              </p>
            )}
          </div>

          {/* Shipping Address */}
          <div className="p-5 bg-neutral-950 border border-neutral-850 space-y-2.5 text-xs">
            <h3 className="font-black uppercase tracking-widest text-[#FFE600] flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4" />
              DELIVERY DESTINATION
            </h3>
            <p><strong className="text-neutral-400">Street:</strong> {order.shippingAddress?.address}</p>
            <p><strong className="text-neutral-400">City:</strong> {order.shippingAddress?.city}</p>
            <p><strong className="text-neutral-400">State:</strong> {order.shippingAddress?.state}</p>
            <p><strong className="text-neutral-400">Country:</strong> {order.shippingAddress?.country || 'Nigeria'}</p>
          </div>
        </div>

        {/* Order Items Breakdown */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
            <Package className="w-4 h-4 text-[#FFE600]" />
            ORDERED PIECES
          </h3>

          <div className="border border-neutral-800 divide-y divide-neutral-850">
            {order.items?.map((item, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-4">
                  {item.productImage && (
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-14 h-16 object-cover bg-neutral-950"
                    />
                  )}
                  <div>
                    <p className="font-black uppercase text-sm text-white">
                      {item.productName}
                    </p>
                    <div className="flex items-center gap-3 text-neutral-400 mt-1">
                      <span>Color: <strong className="text-[#FFE600]">{item.color}</strong></span>
                      <span>Size: <strong className="text-white">{item.size}</strong></span>
                      <span>Quantity: {item.quantity}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-black text-sm text-white block">
                    {formatNaira(item.subtotal || item.price * item.quantity)}
                  </span>
                  <span className="text-[10px] text-neutral-500">
                    Unit: {formatNaira(item.price)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Breakdown & Payment Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-neutral-800">
          {/* Payment Details */}
          <div className="p-4 bg-neutral-950 border border-neutral-850 text-xs space-y-2">
            <h4 className="font-black uppercase tracking-wider text-neutral-300 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#FFE600]" />
              PAYMENT VERIFICATION
            </h4>
            <p><strong className="text-neutral-400">Method:</strong> <span className="font-bold text-white uppercase">{order.paymentMethod === 'whatsapp_transfer' ? 'WhatsApp Bank Transfer' : 'Online Gateway'}</span></p>
            <p><strong className="text-neutral-400">Payment Status:</strong> <span className={`font-black uppercase ${order.paymentStatus === 'paid' ? 'text-emerald-400' : 'text-amber-400'}`}>{order.paymentStatus}</span></p>
            <p><strong className="text-neutral-400">Reference:</strong> {order.paymentReference || order.orderNumber}</p>
            {order.transactionId && (
              <p><strong className="text-neutral-400">Transaction ID:</strong> {order.transactionId}</p>
            )}
            {order.paidAt && (
              <p><strong className="text-neutral-400">Paid At:</strong> {formatDate(order.paidAt)}</p>
            )}

            {order.paymentStatus === 'pending' && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleUpdateStatus('paid')}
                  disabled={updating}
                  className="w-full py-2 bg-emerald-500 text-black font-black uppercase text-xs tracking-wider hover:bg-emerald-400 flex items-center justify-center gap-1.5 shadow"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  CONFIRM RECEIPT & MARK PAID
                </button>
              </div>
            )}
          </div>

          {/* Amount Totals */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-neutral-400">
              <span>Subtotal:</span>
              <span className="font-bold text-white">{formatNaira(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>Service Fee:</span>
              <span className="font-bold text-white">{formatNaira(order.serviceFee || 1000)}</span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>Delivery Fee ({order.shippingAddress?.city}):</span>
              <span className="font-bold text-white">{formatNaira(order.shippingFee)}</span>
            </div>
            <div className="flex justify-between font-black text-sm text-white pt-2 border-t border-neutral-800">
              <span>Final Total:</span>
              <span className="text-lg text-[#FFE600]">{formatNaira(order.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
