import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext.jsx';
import { formatNaira } from '../../utils/formatters.js';

export const CartDrawer = () => {
  const { items, isDrawerOpen, setIsDrawerOpen, removeFromCart, updateQuantity, subtotal, totalItems } = useCart();
  const navigate = useNavigate();

  if (!isDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={() => setIsDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-[#0F0F0F] border-l border-neutral-800 flex flex-col shadow-2xl text-white">
          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-neutral-800 bg-[#0A0A0A]">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#FFE600]" />
              <h2 className="text-xs sm:text-sm font-black uppercase tracking-widest text-white">
                YOUR BAG ({totalItems})
              </h2>
            </div>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <ShoppingBag className="w-12 h-12 text-neutral-700 mb-3" />
                <p className="font-bold text-sm uppercase tracking-wider text-neutral-300">
                  Your bag is empty
                </p>
                <p className="text-xs text-neutral-500 mt-1 max-w-xs">
                  Discover our high-end contemporary streetwear collection.
                </p>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="mt-6 px-6 py-2.5 bg-[#FFE600] text-black font-black uppercase tracking-widest text-xs hover:bg-yellow-400"
                >
                  START SHOPPING
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.key}
                  className="flex gap-4 p-3 bg-neutral-900/60 border border-neutral-800 rounded-none relative group"
                >
                  {/* Thumbnail matching selected color */}
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200'}
                    alt={`${item.name} - ${item.color}`}
                    className="w-16 h-20 min-[380px]:w-20 min-[380px]:h-24 object-cover object-center bg-neutral-950 flex-shrink-0"
                  />

                  {/* Item info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <Link
                          to={`/product/${item.productId}`}
                          onClick={() => setIsDrawerOpen(false)}
                          className="font-bold text-xs uppercase text-white hover:text-[#FFE600] transition-colors line-clamp-1"
                        >
                          {item.name}
                        </Link>
                        <button
                          onClick={() => removeFromCart(item.key)}
                          className="text-neutral-500 hover:text-red-400 transition-colors p-0.5"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Variant tags */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-neutral-800 text-neutral-300 px-1.5 py-0.5">
                          COLOR: {item.color}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-neutral-800 text-neutral-300 px-1.5 py-0.5">
                          SIZE: {item.size}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity adjuster */}
                      <div className="flex items-center border border-neutral-700 bg-neutral-950">
                        <button
                          onClick={() => updateQuantity(item.key, item.quantity - 1)}
                          className="p-1 text-neutral-400 hover:text-white"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-white min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.key, item.quantity + 1)}
                          className="p-1 text-neutral-400 hover:text-white"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-bold text-xs sm:text-sm text-[#FFE600]">
                        {formatNaira(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Subtotal & Checkout */}
          {items.length > 0 && (
            <div className="p-4 sm:p-6 border-t border-neutral-800 bg-[#0A0A0A] space-y-4">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-neutral-400">
                  <span>Subtotal</span>
                  <span className="text-white font-bold">{formatNaira(subtotal)}</span>
                </div>
                <div className="flex justify-between text-neutral-400 text-[11px]">
                  <span>Delivery & Service Fee</span>
                  <span className="text-neutral-500">Calculated at checkout</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#FFE600] text-[10px] font-bold pt-1">
                  <span>⚡ Delivery within 1-2 weeks nationwide</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    navigate('/checkout');
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#FFE600] text-black font-black uppercase tracking-widest text-xs hover:bg-yellow-400 transition-all duration-200"
                >
                  PROCEED TO CHECKOUT
                  <ArrowRight className="w-4 h-4" />
                </button>

                <Link
                  to="/cart"
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-full text-center py-2.5 border border-neutral-800 text-neutral-300 font-bold uppercase tracking-widest text-[11px] hover:bg-neutral-800 hover:text-white transition-colors"
                >
                  VIEW FULL BAG
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
