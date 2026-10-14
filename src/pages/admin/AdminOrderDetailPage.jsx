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
import { productService } from '../../api/productService.js';

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

    const handleOrderStatusUpdate = (e) => {
      const { orderId, status } = e.detail || {};
      if (orderId && (orderId === id || orderId === order?._id || orderId === order?.orderNumber)) {
        setSelectedStatus(status);
        setOrder((prev) => (prev ? { ...prev, orderStatus: status } : prev));
      }
    };

    window.addEventListener('dmosthigh_order_status_updated', handleOrderStatusUpdate);
    return () => window.removeEventListener('dmosthigh_order_status_updated', handleOrderStatusUpdate);
  }, [id]);

  const handleUpdateStatus = async (newStatus) => {
    const targetStatus = (newStatus || selectedStatus || '').toLowerCase();
    if (!targetStatus || targetStatus === (order?.orderStatus || '').toLowerCase()) return;

    if (!window.confirm(`Confirm changing order status to "${targetStatus.toUpperCase()}"?`)) {
      return;
    }

    setUpdating(true);
    try {
      const updated = await adminService.updateOrderStatus(id, targetStatus);
      setOrder((prev) => {
        const merged = {
          ...prev,
          ...(updated || {}),
          customerName: updated?.customerName || prev?.customerName,
          customerEmail: updated?.customerEmail || prev?.customerEmail,
          customerPhone: updated?.customerPhone || prev?.customerPhone,
          user: updated?.user || prev?.user,
          shippingAddress: {
            address: updated?.shippingAddress?.address || prev?.shippingAddress?.address,
            city: updated?.shippingAddress?.city || prev?.shippingAddress?.city,
            state: updated?.shippingAddress?.state || prev?.shippingAddress?.state,
            country: updated?.shippingAddress?.country || prev?.shippingAddress?.country || 'Nigeria',
          },
          items: (updated?.items && updated.items.length > 0) ? updated.items : prev?.items,
          orderStatus: targetStatus,
          paymentStatus: targetStatus === 'paid' ? 'paid' : (updated?.paymentStatus || prev?.paymentStatus),
        };
        return merged;
      });
      setSelectedStatus(targetStatus);
      success(`Order status updated to "${targetStatus.toUpperCase()}".`);
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
      setOrder((prev) => {
        const merged = {
          ...prev,
          ...(updated || {}),
          customerName: updated?.customerName || prev?.customerName,
          customerEmail: updated?.customerEmail || prev?.customerEmail,
          customerPhone: updated?.customerPhone || prev?.customerPhone,
          user: updated?.user || prev?.user,
          shippingAddress: {
            address: updated?.shippingAddress?.address || prev?.shippingAddress?.address,
            city: updated?.shippingAddress?.city || prev?.shippingAddress?.city,
            state: updated?.shippingAddress?.state || prev?.shippingAddress?.state,
            country: updated?.shippingAddress?.country || prev?.shippingAddress?.country || 'Nigeria',
          },
          items: (updated?.items && updated.items.length > 0) ? updated.items : prev?.items,
          orderStatus: 'paid',
          paymentStatus: 'paid',
        };
        return merged;
      });
      setSelectedStatus('paid');
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
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#FFE600] block">
                DISPATCH RECORD
              </span>
              <span
                className={`inline-block px-2 py-0.5 text-[10px] font-black uppercase tracking-wider border ${
                  order.orderStatus === 'pending' || order.paymentStatus === 'pending'
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 animate-pulse'
                    : order.orderStatus === 'paid'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : order.orderStatus === 'processing'
                    ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                    : order.orderStatus === 'shipped'
                    ? 'bg-[#FFE600]/20 text-[#FFE600] border-[#FFE600]/40'
                    : order.orderStatus === 'delivered'
                    ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                    : 'bg-red-500/20 text-red-400 border-red-500/40'
                }`}
              >
                {order.orderStatus === 'pending' || order.paymentStatus === 'pending'
                  ? 'AWAITING PAYMENT'
                  : order.orderStatus}
              </span>
            </div>
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

          {order.orderStatus === 'paid' && (
            <button
              onClick={() => handleUpdateStatus('processing')}
              disabled={updating}
              className="px-3 py-1.5 bg-blue-500 text-white font-black uppercase text-[10px] tracking-wider hover:bg-blue-400 flex items-center gap-1.5 disabled:opacity-50"
            >
              <Clock className="w-3.5 h-3.5" />
              MARK PROCESSING (PAID → PROCESSING)
            </button>
          )}

          {(order.orderStatus === 'processing' || order.orderStatus === 'paid') && (
            <button
              onClick={() => handleUpdateStatus('shipped')}
              disabled={updating}
              className="px-3 py-1.5 bg-[#FFE600] text-black font-black uppercase text-[10px] tracking-wider hover:bg-yellow-400 flex items-center gap-1.5 disabled:opacity-50"
            >
              <Truck className="w-3.5 h-3.5" />
              MARK SHIPPED (→ SHIPPED)
            </button>
          )}

          {order.orderStatus === 'shipped' && (
            <button
              onClick={() => handleUpdateStatus('delivered')}
              disabled={updating}
              className="px-3 py-1.5 bg-cyan-400 text-black font-black uppercase text-[10px] tracking-wider hover:bg-cyan-300 flex items-center gap-1.5 disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              MARK DELIVERED (SHIPPED → DELIVERED)
            </button>
          )}

          {order.orderStatus !== 'cancelled' && order.orderStatus !== 'delivered' && (
            <button
              onClick={() => handleUpdateStatus('cancelled')}
              disabled={updating}
              className="px-3 py-1.5 bg-neutral-900 text-neutral-400 hover:text-red-400 border border-neutral-800 font-bold uppercase text-[10px] tracking-wider transition-colors ml-auto disabled:opacity-50"
            >
              CANCEL ORDER
            </button>
          )}
        </div>

        {/* Customer & Shipping Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Profile */}
          <div className="p-5 bg-neutral-950 border border-neutral-850 space-y-2.5 text-xs">
            <h3 className="font-black uppercase tracking-widest text-[#FFE600] flex items-center gap-2 mb-3">
              <User className="w-4 h-4" />
              CUSTOMER PROFILE
            </h3>
            <p><strong className="text-neutral-400">Name:</strong> {order.customerName || order.customer?.name || order.user?.name || 'Valued Customer'}</p>
            <p><strong className="text-neutral-400">Email:</strong> {order.customerEmail || order.customer?.email || order.user?.email || 'N/A'}</p>
            <p className="flex items-center flex-wrap gap-2">
              <strong className="text-neutral-400">Phone:</strong> {order.customerPhone || order.customer?.phone || order.user?.phone || 'N/A'}
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
            <p><strong className="text-neutral-400">Street:</strong> {order.shippingAddress?.address || order.customer?.address || order.address || 'Standard Delivery Destination'}</p>
            <p><strong className="text-neutral-400">City:</strong> {order.shippingAddress?.city || order.customer?.city || order.city || 'Ibadan'}</p>
            <p><strong className="text-neutral-400">State:</strong> {order.shippingAddress?.state || order.customer?.state || order.state || 'Oyo State'}</p>
            <p><strong className="text-neutral-400">Country:</strong> {order.shippingAddress?.country || order.customer?.country || order.country || 'Nigeria'}</p>
          </div>
        </div>

        {/* Order Items Breakdown */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
            <Package className="w-4 h-4 text-[#FFE600]" />
            ORDERED PIECES
          </h3>

          <div className="border border-neutral-800 divide-y divide-neutral-850">
            {order.items && order.items.length > 0 ? (
              order.items.map((item, idx) => {
                const catalogProducts = productService.getProductsSync().products || [];
                const foundProduct = catalogProducts.find(
                  (p) =>
                    String(p._id) === String(item.productId || item.product?._id || item.product || '') ||
                    p.slug === (item.productId || item.product?.slug || item.slug)
                );

                const prodName =
                  item.productName ||
                  item.name ||
                  item.title ||
                  (typeof item.product === 'object' && item.product?.name) ||
                  foundProduct?.name ||
                  'Streetwear Piece';

                const prodImg =
                  item.productImage ||
                  item.image ||
                  (typeof item.product === 'object' && item.product?.images?.[0]?.url) ||
                  foundProduct?.images?.[0]?.url ||
                  '';

                const prodColor = item.color || item.selectedColor || item.chosenColor || 'Standard';
                const prodSize = item.size || item.selectedSize || item.chosenSize || 'Standard';
                const quantity = item.quantity || 1;
                const price = Number(item.price) || (foundProduct ? (foundProduct.discountPrice || foundProduct.price) : 0);
                const subtotal = item.subtotal || price * quantity;

                return (
                  <div key={idx} className="p-4 flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-4">
                      {prodImg ? (
                        <img
                          src={prodImg}
                          alt={prodName}
                          className="w-14 h-16 object-contain p-1 bg-neutral-950 border border-neutral-800 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-16 bg-neutral-900 border border-neutral-800 flex items-center justify-center flex-shrink-0 text-neutral-600">
                          <Package className="w-6 h-6" />
                        </div>
                      )}
                      <div>
                        <p className="font-black uppercase text-sm sm:text-base text-white tracking-wide">
                          {prodName}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-neutral-400 mt-1">
                          <span>Color: <strong className="text-[#FFE600] uppercase">{prodColor}</strong></span>
                          <span>Size: <strong className="text-white uppercase">{prodSize}</strong></span>
                          <span>Quantity: <strong className="text-white">{quantity}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="font-black text-sm text-white block">
                        {formatNaira(subtotal)}
                      </span>
                      {price > 0 && (
                        <span className="text-[10px] text-neutral-500">
                          Unit: {formatNaira(price)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-4 text-neutral-400 text-xs italic">
                No pieces recorded in this order file.
              </div>
            )}
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
