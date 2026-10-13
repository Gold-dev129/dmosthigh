import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCart } from '../../context/CartContext.jsx';
import { formatNaira, SERVICE_FEE } from '../../utils/formatters.js';
import { EmptyState } from '../../components/common/EmptyState.jsx';

export const CartPage = () => {
  const { items, removeFromCart, updateQuantity, subtotal, totalItems } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#0A0A0A] p-4">
        <EmptyState
          icon={ShoppingBag}
          title="Your Shopping Bag is Empty"
          description="You have not added any pieces to your bag yet. Browse the current collection to find luxury streetwear pieces."
          actionText="Explore Storefront"
          actionLink="/"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white py-6 sm:py-12">
      <div className="max-w-7xl 2xl:max-w-[1700px] mx-auto px-3 sm:px-6 lg:px-8">
        {/* Page Title */}
        <div className="flex items-center justify-between border-b border-neutral-850 pb-5 sm:pb-6 mb-6 sm:mb-8">
          <div>
            <div className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#FFE600] mb-1">
              CURRENT ORDER
            </div>
            <h1 className="text-xl min-[380px]:text-2xl sm:text-4xl font-black uppercase tracking-tight text-white">
              SHOPPING BAG ({totalItems})
            </h1>
          </div>
          <Link
            to="/"
            className="hidden sm:inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-[#FFE600] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12">
          {/* Items Table / List */}
          <div className="lg:col-span-8 space-y-3 sm:space-y-4">
            {items.map((item) => (
              <div
                key={item.key}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 min-[380px]:p-4 bg-[#101010] border border-neutral-800 gap-3 sm:gap-4"
              >
                {/* Image + Description */}
                <div className="flex items-center gap-2.5 min-[380px]:gap-4 w-full sm:w-auto">
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200'}
                    alt={`${item.name} - ${item.color}`}
                    className="w-16 h-20 min-[380px]:w-20 min-[380px]:h-24 object-cover object-center bg-neutral-950 flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/product/${item.productId}`}
                      className="font-black text-sm uppercase text-white hover:text-[#FFE600] transition-colors line-clamp-1"
                    >
                      {item.name}
                    </Link>
                    <div className="flex flex-wrap gap-2 mt-1.5">
                      <span className="text-[10px] font-black uppercase tracking-widest bg-neutral-900 border border-neutral-800 text-neutral-300 px-2 py-0.5">
                        COLOR: {item.color}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-widest bg-neutral-900 border border-neutral-800 text-neutral-300 px-2 py-0.5">
                        SIZE: {item.size}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-neutral-400 mt-2">
                      Unit: {formatNaira(item.price)}
                    </p>
                  </div>
                </div>

                {/* Controls & Line Total */}
                <div className="flex items-center justify-between sm:justify-end gap-3 min-[380px]:gap-6 w-full sm:w-auto border-t sm:border-t-0 border-neutral-850 pt-3 sm:pt-0">
                  {/* Quantity */}
                  <div className="flex items-center border border-neutral-700 bg-neutral-950">
                    <button
                      onClick={() => updateQuantity(item.key, item.quantity - 1)}
                      className="p-1.5 text-neutral-400 hover:text-white"
                      title="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-black text-white min-w-[28px] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.key, item.quantity + 1)}
                      className="p-1.5 text-neutral-400 hover:text-white"
                      title="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Line Total */}
                  <span className="font-black text-base text-[#FFE600] min-w-[90px] text-right">
                    {formatNaira(item.price * item.quantity)}
                  </span>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.key)}
                    className="p-2 text-neutral-500 hover:text-red-400 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary Box */}
          <div className="lg:col-span-4">
            <div className="p-6 bg-[#101010] border border-neutral-800 space-y-5 sticky top-28">
              <h2 className="text-sm font-black uppercase tracking-widest text-[#FFE600] border-b border-neutral-800 pb-3">
                ORDER SUMMARY
              </h2>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-neutral-300">
                  <span>Subtotal ({totalItems} items)</span>
                  <span className="font-bold text-white">{formatNaira(subtotal)}</span>
                </div>
                <div className="flex justify-between text-neutral-300">
                  <span>Service Fee</span>
                  <span className="font-bold text-white">{formatNaira(SERVICE_FEE)}</span>
                </div>
                <div className="flex justify-between text-neutral-300 text-[11px]">
                  <span>Delivery Fee</span>
                  <span className="text-neutral-400">Calculated next step</span>
                </div>
              </div>

              <div className="border-t border-neutral-800 pt-4">
                <div className="flex justify-between items-baseline mb-4">
                  <span className="text-xs font-black uppercase tracking-widest text-neutral-300">
                    ESTIMATED TOTAL
                  </span>
                  <span className="text-xl font-black text-[#FFE600]">
                    {formatNaira(subtotal + SERVICE_FEE)}*
                  </span>
                </div>
                <p className="text-[10px] text-neutral-500 mb-3">
                  *Plus selected destination delivery fee (Ibadan: ₦6,000, Lagos: ₦7,000, Abuja: ₦8,500).
                </p>

                <div className="p-2.5 mb-4 bg-[#FFE600]/10 border border-[#FFE600]/30 text-[#FFE600] text-[11px] font-bold flex items-center gap-2">
                  <span>⚡ Nationwide Delivery: Within 1-2 weeks</span>
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full py-4 bg-[#FFE600] text-black font-black uppercase tracking-widest text-xs hover:bg-yellow-400 flex items-center justify-center gap-2 transition-all duration-200 shadow-xl"
                >
                  PROCEED TO CHECKOUT
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
