import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../../api/orderService.js';
import { productService } from '../../api/productService.js';
import { formatNaira, formatDate } from '../../utils/formatters.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { Package, ArrowRight, Eye, Calendar, MapPin } from 'lucide-react';

export const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await orderService.getMyOrders();
        setOrders(data?.orders || []);
      } catch (err) {
        console.warn('Orders fetch note:', err.message);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
      case 'processing':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      case 'shipped':
        return 'bg-[#FFE600]/20 text-[#FFE600] border-[#FFE600]/40';
      case 'delivered':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/40';
      default:
        return 'bg-neutral-800 text-neutral-400 border-neutral-700';
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white py-6 sm:py-12">
      <div className="max-w-5xl 2xl:max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="border-b border-neutral-850 pb-5 sm:pb-6 mb-6 sm:mb-8">
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#FFE600] block mb-1">
            ORDER HISTORY
          </span>
          <h1 className="text-xl min-[380px]:text-2xl sm:text-4xl font-black uppercase tracking-tight text-white">
            MY ORDERS
          </h1>
          <p className="text-[11px] sm:text-xs text-neutral-400 mt-1 uppercase tracking-wider">
            All purchases retrieved directly from your account.
          </p>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner text="RETRIEVING ORDER RECORDS..." size="lg" />
          </div>
        ) : error ? (
          <EmptyState
            title="Failed to load orders"
            description={error}
            actionText="Try Again"
            onAction={() => window.location.reload()}
          />
        ) : orders.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No Orders Found"
            description="You have not placed any orders yet. Discover the storefront catalog to explore exclusive streetwear pieces."
            actionText="Browse Products"
            actionLink="/"
          />
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-[#101010] border border-neutral-800 hover:border-neutral-700 transition-all rounded-none overflow-hidden"
              >
                {/* Order Top Bar */}
                <div className="p-4 sm:p-5 bg-neutral-950 border-b border-neutral-850 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500 block">
                        ORDER NUMBER
                      </span>
                      <span className="font-black text-sm text-[#FFE600]">
                        {order.orderNumber}
                      </span>
                    </div>

                    <div className="hidden sm:block border-l border-neutral-800 pl-4">
                      <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500 block">
                        DATE PLACED
                      </span>
                      <span className="text-xs text-neutral-300">
                        {formatDate(order.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider border ${getStatusBadge(
                        order.orderStatus
                      )}`}
                    >
                      {order.orderStatus}
                    </span>

                    <Link
                      to={`/orders/${order._id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-900 border border-neutral-700 text-xs font-bold text-neutral-200 hover:text-white hover:border-[#FFE600] transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#FFE600]" />
                      Details
                    </Link>
                  </div>
                </div>

                {/* Items in Order */}
                <div className="p-4 sm:p-5 divide-y divide-neutral-900">
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
                        <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            {prodImg ? (
                              <img
                                src={prodImg}
                                alt={prodName}
                                className="w-12 h-14 object-cover bg-neutral-950 border border-neutral-800 flex-shrink-0"
                              />
                            ) : (
                              <div className="w-12 h-14 bg-neutral-900 border border-neutral-800 flex items-center justify-center flex-shrink-0 text-neutral-600">
                                <Package className="w-5 h-5" />
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-xs uppercase text-white">
                                {prodName}
                              </p>
                              <p className="text-[11px] text-neutral-400 mt-0.5">
                                Color: <strong className="text-neutral-200">{prodColor}</strong> • Size: <strong className="text-neutral-200">{prodSize}</strong> • Qty: {quantity}
                              </p>
                            </div>
                          </div>
                          <span className="font-bold text-xs text-white">
                            {formatNaira(subtotal)}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-2 text-neutral-500 text-xs italic">No items listed</div>
                  )}
                </div>

                {/* Order Footer & Fees Summary */}
                <div className="p-4 sm:p-5 bg-neutral-950/60 border-t border-neutral-850 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-neutral-400 text-[11px]">
                    <MapPin className="w-3.5 h-3.5 text-[#FFE600]" />
                    <span>
                      Delivery: {order.shippingAddress?.city}, {order.shippingAddress?.state} ({formatNaira(order.shippingFee)}) • Service: {formatNaira(order.serviceFee || 1000)}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-neutral-400 uppercase tracking-wider text-[11px]">
                      TOTAL:
                    </span>
                    <span className="font-black text-base text-[#FFE600]">
                      {formatNaira(order.total)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
