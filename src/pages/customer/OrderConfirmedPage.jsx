import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { paymentService } from '../../api/paymentService.js';
import { orderService } from '../../api/orderService.js';
import { formatNaira, formatDate } from '../../utils/formatters.js';
import { getWhatsAppOrderUrl, WHATSAPP_CONFIG } from '../../utils/whatsapp.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import {
  CheckCircle2,
  AlertCircle,
  Truck,
  Package,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  MessageCircle,
  Copy,
  Check,
  Clock,
} from 'lucide-react';

export const OrderConfirmedPage = () => {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get('reference') || searchParams.get('trxref');
  const isWhatsApp = searchParams.get('whatsapp') === 'true';

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [verified, setVerified] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedAccount, setCopiedAccount] = useState(false);

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(WHATSAPP_CONFIG.ACCOUNT_NUMBER);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 3000);
  };

  useEffect(() => {
    const verifyAndLoad = async () => {
      if (!reference) {
        setErrorMessage('No order reference found.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setErrorMessage('');

      try {
        // If from WhatsApp checkout flow, directly retrieve created order
        if (isWhatsApp) {
          const ord = await orderService.getOrderById(reference);
          if (ord) {
            setOrder(ord);
            setVerified(ord.paymentStatus === 'paid');
            setLoading(false);
            return;
          }
        }

        // Otherwise try Paystack verification
        try {
          const result = await paymentService.verifyPayment(reference);
          if (result?.order) {
            setOrder(result.order);
            setVerified(true);
            setLoading(false);
            return;
          }
        } catch (paystackErr) {
          // If Paystack fails, check if order exists in database (e.g. created via WhatsApp)
          const fallbackOrder = await orderService.getOrderById(reference);
          if (fallbackOrder) {
            setOrder(fallbackOrder);
            setVerified(fallbackOrder.paymentStatus === 'paid');
            setLoading(false);
            return;
          }
          throw paystackErr;
        }
      } catch (err) {
        console.error('Order verification error:', err);
        setErrorMessage(
          err.message || 'Could not verify order record.'
        );
      } finally {
        setLoading(false);
      }
    };

    verifyAndLoad();
  }, [reference, isWhatsApp]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#0A0A0A] p-4 text-center">
        <LoadingSpinner text="VERIFYING PAYMENT TRANSACTION WITH PAYSTACK..." size="lg" />
        <p className="text-xs text-neutral-500 mt-4 uppercase tracking-widest">
          Please do not refresh or close this window
        </p>
      </div>
    );
  }

  // Order Not Found or Error State
  if (!order || errorMessage) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#0A0A0A] p-4">
        <div className="max-w-md w-full p-8 bg-[#101010] border border-red-500/30 text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/40 flex items-center justify-center mx-auto text-red-500">
            <AlertCircle className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-black uppercase tracking-tight text-white">
            ORDER NOT LOCATED
          </h2>

          <p className="text-xs text-neutral-400 leading-relaxed">
            {errorMessage || 'Could not locate the requested order reference. Please check your order history or contact support.'}
          </p>

          <div className="pt-4 flex flex-col gap-2.5">
            <Link
              to="/orders"
              className="w-full py-3 bg-[#FFE600] text-black font-black uppercase tracking-widest text-xs hover:bg-yellow-400 text-center"
            >
              VIEW MY ORDERS
            </Link>
            <Link
              to="/"
              className="w-full py-3 border border-neutral-700 text-neutral-300 font-bold uppercase tracking-widest text-xs hover:bg-neutral-800 text-center"
            >
              RETURN TO HOME
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isPending = order.paymentStatus === 'pending';
  const whatsappUrl = getWhatsAppOrderUrl({
    order,
    items: order.items,
    customer: {
      name: order.customerName,
      phone: order.customerPhone,
      address: order.shippingAddress?.address,
      city: order.shippingAddress?.city,
      state: order.shippingAddress?.state,
      country: order.shippingAddress?.country,
    },
    deliveryFee: order.shippingFee,
    serviceFee: order.serviceFee || 1000,
    total: order.total,
  });

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white py-6 sm:py-16">
      <div className="max-w-3xl 2xl:max-w-4xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Success Card Header */}
        <div className="bg-[#101010] border border-neutral-800 p-4 min-[380px]:p-6 sm:p-10 space-y-5 sm:space-y-6 text-center relative overflow-hidden">
          <div className={`absolute top-0 inset-x-0 h-1 ${isPending ? 'bg-emerald-400' : 'bg-[#FFE600]'}`} />

          <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto ${
            isPending
              ? 'bg-emerald-500/10 border border-emerald-500 text-emerald-400'
              : 'bg-[#FFE600]/10 border border-[#FFE600] text-[#FFE600]'
          }`}>
            {isPending ? <Clock className="w-8 h-8 sm:w-9 sm:h-9" /> : <CheckCircle2 className="w-8 h-8 sm:w-9 sm:h-9" />}
          </div>

          <div>
            <span className={`text-[10px] sm:text-xs font-black uppercase tracking-widest block mb-1 ${
              isPending ? 'text-emerald-400' : 'text-[#FFE600]'
            }`}>
              {isPending ? 'ORDER RECORDED — AWAITING PAYMENT RECEIPT' : 'PAYMENT VERIFIED & RECORDED'}
            </span>
            <h1 className="text-xl min-[380px]:text-2xl sm:text-4xl font-black uppercase tracking-tight text-white">
              {isPending ? 'ORDER PLACED SUCCESSFULLY' : 'ORDER CONFIRMED'}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300 mt-2">
              Thank you for your order, <strong className="text-white">{order.customerName}</strong>!
            </p>
            <p className="text-xs text-neutral-400 mt-0.5">
              {isPending
                ? 'Your order is recorded on our dashboard. Please send your payment receipt on WhatsApp to finalize fulfillment.'
                : 'Your pieces have been allocated and queued for dispatch.'}
            </p>
          </div>

          {/* Pending WhatsApp Payment Box */}
          {isPending && (
            <div className="p-4 sm:p-6 bg-neutral-950 border border-emerald-500/40 text-left space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <span className="text-xs font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  PAYMENT INSTRUCTIONS & RECEIPT CONFIRMATION
                </span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 font-bold uppercase">
                  REQUIRED
                </span>
              </div>

              <div className="p-3.5 bg-neutral-900 border border-neutral-800 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-bold">
                    TRANSFER TOTAL AMOUNT:
                  </span>
                  <span className="text-xl font-black text-[#FFE600]">
                    {formatNaira(order.total)}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-bold">
                    ACCOUNT NUMBER
                  </span>
                  <span className="text-base font-black text-white font-mono">
                    {WHATSAPP_CONFIG.ACCOUNT_NUMBER}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCopyAccount}
                  className="px-3 py-1.5 bg-[#FFE600]/10 border border-[#FFE600]/40 text-[#FFE600] hover:bg-[#FFE600] hover:text-black transition-colors text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                >
                  {copiedAccount ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedAccount ? 'COPIED!' : 'COPY NUMBER'}
                </button>
              </div>

              <div className="text-xs text-neutral-400 space-y-1">
                <p>• <strong>Account Name:</strong> <span className="text-white">{WHATSAPP_CONFIG.ACCOUNT_NAME}</span></p>
                <p>• <strong>WhatsApp Line:</strong> <span className="text-emerald-400 font-mono">{WHATSAPP_CONFIG.DISPLAY_PHONE}</span></p>
              </div>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 bg-emerald-500 text-black font-black uppercase tracking-widest text-xs min-[400px]:text-sm hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2 shadow-xl"
              >
                <MessageCircle className="w-5 h-5" />
                CHAT ON WHATSAPP & SHARE RECEIPT
              </a>
            </div>
          )}

          {/* Key Reference Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-neutral-950 border border-neutral-800 text-left">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block">
                ORDER NUMBER
              </span>
              <span className="font-black text-sm text-[#FFE600]">{order.orderNumber}</span>
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block">
                ORDER TOTAL
              </span>
              <span className="font-black text-sm text-white">{formatNaira(order.total)}</span>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block">
                STATUS
              </span>
              <span className="inline-block mt-0.5 px-2 py-0.5 bg-[#FFE600] text-black text-[10px] font-black uppercase tracking-wider">
                {order.orderStatus}
              </span>
            </div>
          </div>

          {/* Delivery & Destination Details */}
          <div className="border-t border-neutral-800 pt-6 text-left space-y-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#FFE600] flex items-center gap-2">
              <Truck className="w-4 h-4" />
              DISPATCH DESTINATION
            </h3>
            <div className="text-xs text-neutral-300 space-y-1">
              <p><strong className="text-white">Recipient:</strong> {order.customerName} ({order.customerPhone})</p>
              <p><strong className="text-white">Address:</strong> {order.shippingAddress?.address}</p>
              <p><strong className="text-white">City & State:</strong> {order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
            </div>
          </div>

          {/* Items Summary */}
          <div className="border-t border-neutral-800 pt-6 text-left space-y-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#FFE600] flex items-center gap-2">
              <Package className="w-4 h-4" />
              ACQUIRED PIECES
            </h3>

            <div className="space-y-3">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-neutral-950 border border-neutral-800 text-xs">
                  <div className="flex items-center gap-3">
                    {item.productImage && (
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-10 h-12 object-cover bg-neutral-900"
                      />
                    )}
                    <div>
                      <p className="font-bold text-white uppercase">{item.productName}</p>
                      <p className="text-[10px] text-neutral-400">
                        Color: <span className="text-[#FFE600]">{item.color}</span> | Size: {item.size} | Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-white">
                    {formatNaira(item.subtotal || item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Fee summary */}
            <div className="pt-2 text-xs space-y-1 border-t border-neutral-850 text-neutral-400">
              <div className="flex justify-between">
                <span>Items Subtotal:</span>
                <span>{formatNaira(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Service Fee:</span>
                <span>{formatNaira(order.serviceFee || 1000)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee ({order.shippingAddress?.city}):</span>
                <span>{formatNaira(order.shippingFee)}</span>
              </div>
              <div className="flex justify-between font-black text-white pt-2 border-t border-neutral-800 text-sm">
                <span>Total Paid:</span>
                <span className="text-[#FFE600]">{formatNaira(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-neutral-800 pt-6 flex flex-col sm:flex-row gap-3">
            <Link
              to="/"
              className="flex-1 py-3.5 bg-[#FFE600] text-black font-black uppercase tracking-widest text-xs hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              CONTINUE SHOPPING
            </Link>

            <Link
              to="/orders"
              className="flex-1 py-3.5 border border-neutral-700 text-neutral-200 font-bold uppercase tracking-widest text-xs hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
            >
              VIEW ORDER HISTORY
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
