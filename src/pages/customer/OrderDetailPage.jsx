import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderService } from '../../api/orderService.js';
import { productService } from '../../api/productService.js';
import { formatNaira, formatDate } from '../../utils/formatters.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { ArrowLeft, Truck, Package, CheckCircle2, ShieldCheck, MapPin } from 'lucide-react';

export const OrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await orderService.getOrderById(id);
        if (!data) throw new Error('Order details not found.');
        setOrder(data);
      } catch (err) {
        console.error('Failed to load order:', err);
        setError(err.message || 'Unable to retrieve order details.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#0A0A0A]">
        <LoadingSpinner text="RETRIEVING ORDER INVOICE..." size="lg" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#0A0A0A] p-4">
        <EmptyState
          title="Order Not Found"
          description={error || 'The requested order does not exist or you do not have permission to view it.'}
          actionText="Back to Orders"
          actionLink="/orders"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white py-6 sm:py-12">
      <div className="max-w-4xl 2xl:max-w-5xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Top Back Link */}
        <div className="border-b border-neutral-850 pb-4 mb-5 sm:mb-6">
          <Link
            to="/orders"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-[#FFE600] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            BACK TO ORDER HISTORY
          </Link>
        </div>

        {/* Invoice Container */}
        <div className="bg-[#101010] border border-neutral-800 p-3.5 min-[380px]:p-4 sm:p-10 space-y-6 sm:space-y-8">
          {/* Invoice Header */}
          <div className="flex flex-wrap items-start justify-between gap-3 sm:gap-4 border-b border-neutral-800 pb-5 sm:pb-6">
            <div>
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#FFE600] block mb-1">
                ORDER INVOICE
              </span>
              <h1 className="text-xl min-[380px]:text-2xl sm:text-3xl font-black text-white">
                {order.orderNumber}
              </h1>
              <p className="text-[11px] sm:text-xs text-neutral-400 mt-1">
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>

            <div className="flex flex-col items-end gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                CURRENT STATUS
              </span>
              <span className="px-3 py-1 bg-[#FFE600] text-black text-xs font-black uppercase tracking-wider">
                {order.orderStatus}
              </span>
            </div>
          </div>

          {/* Delivery Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-neutral-950 border border-neutral-850 text-xs">
            <div className="space-y-1">
              <h3 className="font-black uppercase tracking-wider text-[#FFE600] flex items-center gap-1.5 mb-2">
                <Truck className="w-4 h-4" />
                DELIVERY INFORMATION
              </h3>
              <p><strong className="text-neutral-400">Recipient:</strong> {order.customerName}</p>
              <p><strong className="text-neutral-400">Phone:</strong> {order.customerPhone}</p>
              <p><strong className="text-neutral-400">Email:</strong> {order.customerEmail}</p>
            </div>

            <div className="space-y-1">
              <h3 className="font-black uppercase tracking-wider text-[#FFE600] flex items-center gap-1.5 mb-2">
                <MapPin className="w-4 h-4" />
                SHIPPING DESTINATION
              </h3>
              <p><strong className="text-neutral-400">Address:</strong> {order.shippingAddress?.address}</p>
              <p><strong className="text-neutral-400">City & State:</strong> {order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
              <p><strong className="text-neutral-400">Country:</strong> {order.shippingAddress?.country || 'Nigeria'}</p>
            </div>
          </div>

          {/* Order Items Table */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
              <Package className="w-4 h-4 text-[#FFE600]" />
              ORDER ITEMS
            </h3>

            <div className="border border-neutral-800 divide-y divide-neutral-850">
              {order.items && order.items.length > 0 ? (
                order.items.map((item, idx) => {
                  const catalogProducts = productService.getProductsSync().products || [];
                  const found = catalogProducts.find(
                    (p) =>
                      String(p._id) === String(item.productId || item.product?._id || item.product || '') ||
                      p.slug === (item.productId || item.product?.slug || item.slug)
                  );
                  const prodName =
                    item.productName ||
                    item.name ||
                    item.title ||
                    (typeof item.product === 'object' && item.product?.name) ||
                    found?.name ||
                    'Streetwear Piece';
                  const prodImg =
                    item.productImage ||
                    item.image ||
                    (typeof item.product === 'object' && item.product?.images?.[0]?.url) ||
                    found?.images?.[0]?.url ||
                    '';
                  const prodColor = item.color || item.selectedColor || 'Standard';
                  const prodSize = item.size || item.selectedSize || 'Standard';
                  const quantity = item.quantity || 1;
                  const price = Number(item.price) || (found ? (found.discountPrice || found.price) : 0);
                  const subtotal = item.subtotal || price * quantity;

                  return (
                    <div key={idx} className="p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 text-xs">
                      <div className="flex items-center gap-3 sm:gap-4">
                        {prodImg ? (
                          <img
                            src={prodImg}
                            alt={prodName}
                            className="w-12 h-14 sm:w-14 sm:h-16 object-cover bg-neutral-950 border border-neutral-800 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-14 sm:w-14 sm:h-16 bg-neutral-900 border border-neutral-800 flex items-center justify-center flex-shrink-0 text-neutral-600">
                            <Package className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <p className="font-black uppercase text-xs sm:text-sm text-white">
                            {prodName}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-neutral-400 mt-1">
                            <span>Color: <strong className="text-[#FFE600] uppercase">{prodColor}</strong></span>
                            <span>Size: <strong className="text-white uppercase">{prodSize}</strong></span>
                            <span>Qty: <strong className="text-white">{quantity}</strong></span>
                          </div>
                        </div>
                      </div>

                      <span className="font-black text-sm text-white sm:text-right">
                        {formatNaira(subtotal)}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="p-4 text-neutral-400 text-xs italic">
                  No items listed for this order.
                </div>
              )}
            </div>
          </div>

          {/* Fee Calculation Breakdown */}
          <div className="border-t border-neutral-800 pt-6 space-y-2.5 text-xs w-full sm:max-w-xs sm:ml-auto">
            <div className="flex justify-between text-neutral-400">
              <span>Items Subtotal:</span>
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

            <div className="flex justify-between font-black text-sm text-white pt-3 border-t border-neutral-800">
              <span>Total Paid:</span>
              <span className="text-lg text-[#FFE600]">{formatNaira(order.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
