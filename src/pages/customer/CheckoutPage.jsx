import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { orderService } from '../../api/orderService.js';
import { formatNaira, DELIVERY_FEES, SERVICE_FEE } from '../../utils/formatters.js';
import { getWhatsAppOrderUrl, WHATSAPP_CONFIG } from '../../utils/whatsapp.js';
import { ShieldCheck, Truck, CreditCard, Lock, ArrowLeft, Loader2, MessageCircle, Copy, Check } from 'lucide-react';

export const CheckoutPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { items, subtotal, totalItems, clearCart } = useCart();
  const { error: toastError, success: toastSuccess } = useToast();
  const navigate = useNavigate();

  // Selected city defaults to Lagos
  const [selectedCity, setSelectedCity] = useState('Lagos');

  // Customer form details
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: 'Lagos',
    state: 'Lagos State',
    country: 'Nigeria',
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedAccount, setCopiedAccount] = useState(false);

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(WHATSAPP_CONFIG.ACCOUNT_NUMBER);
    setCopiedAccount(true);
    toastSuccess('Account number copied to clipboard!');
    setTimeout(() => setCopiedAccount(false), 3000);
  };

  // Pre-fill user data if logged in
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        address: user.address?.address || prev.address,
        city: user.address?.city || prev.city || 'Lagos',
        state: user.address?.state || prev.state || 'Lagos State',
        country: user.address?.country || 'Nigeria',
      }));
      if (user.address?.city && DELIVERY_FEES[user.address.city]) {
        setSelectedCity(user.address.city);
      }
    }
  }, [user]);

  // If cart is empty, redirect to cart page
  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items, navigate]);

  // Handle city selection change
  const handleCityChange = (city) => {
    setSelectedCity(city);
    let autoState = 'Lagos State';
    if (city === 'Ibadan') autoState = 'Oyo State';
    if (city === 'Abuja') autoState = 'FCT';

    setFormData((prev) => ({
      ...prev,
      city,
      state: autoState,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Authoritative calculations
  const deliveryFee = DELIVERY_FEES[selectedCity] || DELIVERY_FEES.Lagos;
  const serviceFee = SERVICE_FEE;
  const total = subtotal + serviceFee + deliveryFee;

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Validation
    if (!formData.name.trim()) return setErrorMessage('Please enter your full name.');
    if (!formData.email.trim() || !formData.email.includes('@'))
      return setErrorMessage('Please provide a valid email address.');
    if (!formData.phone.trim()) return setErrorMessage('Please enter your phone number.');
    if (!formData.address.trim()) return setErrorMessage('Please provide your delivery address.');
    if (!selectedCity) return setErrorMessage('Please select your delivery city.');

    setSubmitting(true);

    try {
      const payload = {
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          color: item.color,
          size: item.size,
        })),
        customer: {
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          city: selectedCity,
          state: formData.state.trim() || 'Nigeria',
          country: formData.country.trim() || 'Nigeria',
          paymentMethod: 'whatsapp_transfer',
        },
      };

      const result = await orderService.checkout(payload);

      if (!result?.order) {
        throw new Error('Order creation could not be verified by the server.');
      }

      // Order created successfully!
      const order = result.order;

      // Generate the WhatsApp click-to-chat URL with all order, product, and customer details
      const whatsappUrl = getWhatsAppOrderUrl({
        order,
        items,
        customer: formData,
        deliveryFee,
        serviceFee,
        total,
      });

      // Clear the user's cart
      clearCart();

      // Launch WhatsApp in new tab / window
      try {
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      } catch (err) {
        console.warn('Popup blocked:', err);
      }

      // Navigate to order confirmation page where customer can also review receipt instructions
      navigate(`/order-confirmed?reference=${order.orderNumber}&whatsapp=true`);
    } catch (err) {
      console.error('Checkout error:', err);
      const msg = err.message || 'Order could not be initialized. Please try again.';
      setErrorMessage(msg);
      toastError(msg);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white py-6 sm:py-12">
      <div className="max-w-7xl 2xl:max-w-[1700px] mx-auto px-3 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="border-b border-neutral-850 pb-4 mb-6 sm:mb-8 flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/cart"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-[#FFE600] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Bag
          </Link>
          <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold uppercase text-[#FFE600]">
            <Lock className="w-3.5 h-3.5" />
            256-BIT ENCRYPTED CHECKOUT
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12">
          {/* Left: Customer Information Form */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmitOrder} className="space-y-5 sm:space-y-6">
              <div className="bg-[#101010] border border-neutral-800 p-3 min-[380px]:p-4 sm:p-8 space-y-4 sm:space-y-5">
                <h2 className="text-xs sm:text-sm font-black uppercase tracking-widest text-[#FFE600] border-b border-neutral-800 pb-3 flex flex-wrap items-center justify-between gap-2">
                  <span>1. CUSTOMER & DELIVERY DETAILS</span>
                  {!isAuthenticated && (
                    <span className="text-[10px] text-neutral-400 normal-case font-normal">
                      Have an account? <Link to="/login" className="text-[#FFE600] underline font-bold">Log in</Link>
                    </span>
                  )}
                </h2>

                {errorMessage && (
                  <div className="p-3.5 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold leading-relaxed">
                    ⚠️ {errorMessage}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-black uppercase tracking-wider text-neutral-300 mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Adeleye Gold"
                      className="w-full bg-neutral-900 border border-neutral-800 px-4 py-3 text-base sm:text-sm text-white placeholder-neutral-600 focus:border-[#FFE600] focus:outline-none"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-neutral-300 mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="gold@example.com"
                      className="w-full bg-neutral-900 border border-neutral-800 px-4 py-3 text-base sm:text-sm text-white placeholder-neutral-600 focus:border-[#FFE600] focus:outline-none"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-neutral-300 mb-1.5">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="08012345678"
                      className="w-full bg-neutral-900 border border-neutral-800 px-4 py-3 text-base sm:text-sm text-white placeholder-neutral-600 focus:border-[#FFE600] focus:outline-none"
                    />
                  </div>

                  {/* Delivery Address */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-black uppercase tracking-wider text-neutral-300 mb-1.5">
                      Delivery Street Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      required
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Apartment, Studio, Street Address"
                      className="w-full bg-neutral-900 border border-neutral-800 px-4 py-3 text-base sm:text-sm text-white placeholder-neutral-600 focus:border-[#FFE600] focus:outline-none"
                    />
                  </div>

                  {/* City Selector */}
                  <div className="sm:col-span-2 bg-neutral-950 p-3 sm:p-4 border border-neutral-800">
                    <label className="block text-xs font-black uppercase tracking-widest text-[#FFE600] mb-2 flex flex-wrap items-center justify-between gap-1">
                      <span>SELECT DELIVERY CITY *</span>
                      <span className="text-[11px] text-neutral-400 font-normal">
                        Rates are strictly verified
                      </span>
                    </label>

                    <div className="grid grid-cols-1 min-[420px]:grid-cols-3 gap-2.5 sm:gap-3">
                      {Object.entries(DELIVERY_FEES).map(([city, fee]) => {
                        const isSelected = selectedCity.toLowerCase() === city.toLowerCase();

                        return (
                          <button
                            key={city}
                            type="button"
                            onClick={() => handleCityChange(city)}
                            className={`p-3 text-left border transition-all ${
                              isSelected
                                ? 'border-[#FFE600] bg-[#FFE600]/10 text-white'
                                : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-600'
                            }`}
                          >
                            <span className="block text-xs font-black uppercase tracking-wider">
                              {city}
                            </span>
                            <span className={`block text-xs font-bold mt-1 ${isSelected ? 'text-[#FFE600]' : 'text-neutral-300'}`}>
                              {formatNaira(fee)}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-3 p-2.5 bg-[#FFE600]/10 border border-[#FFE600]/30 text-[#FFE600] text-[11px] font-bold flex items-center gap-2">
                      <Truck className="w-4 h-4 flex-shrink-0" />
                      <span>⚡ Estimated Delivery: Within 1-2 weeks across all states upon payment confirmation.</span>
                    </div>
                  </div>

                  {/* State */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-neutral-300 mb-1.5">
                      State / Region *
                    </label>
                    <input
                      type="text"
                      name="state"
                      required
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full bg-neutral-900 border border-neutral-800 px-4 py-3 text-base sm:text-sm text-white focus:border-[#FFE600] focus:outline-none"
                    />
                  </div>

                  {/* Country */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-neutral-300 mb-1.5">
                      Country
                    </label>
                    <input
                      type="text"
                      name="country"
                      readOnly
                      value={formData.country}
                      className="w-full bg-neutral-950 border border-neutral-800 px-4 py-3 text-base sm:text-sm text-neutral-400 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method Notice & Instructions */}
              <div className="bg-[#101010] border border-[#FFE600]/30 p-4 sm:p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <h3 className="text-xs font-black uppercase tracking-widest text-[#FFE600] flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                    2. PAYMENT: DIRECT BANK TRANSFER & WHATSAPP
                  </h3>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 font-bold uppercase">
                    OFFICIAL
                  </span>
                </div>

                <div className="p-4 bg-neutral-950 border border-neutral-800 space-y-3">
                  <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                    Bank Account Details for Payment:
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-neutral-900 border border-neutral-800">
                    <div>
                      <span className="text-[10px] text-neutral-400 uppercase tracking-widest block font-bold">
                        ACCOUNT NUMBER
                      </span>
                      <span className="text-xl sm:text-2xl font-black text-[#FFE600] tracking-wider font-mono">
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 bg-neutral-900 border border-neutral-850">
                      <span className="text-[10px] text-neutral-400 uppercase block font-bold">
                        ACCOUNT NAME
                      </span>
                      <span className="font-bold text-white uppercase">
                        {WHATSAPP_CONFIG.ACCOUNT_NAME}
                      </span>
                    </div>
                    <div className="p-2.5 bg-neutral-900 border border-neutral-850">
                      <span className="text-[10px] text-neutral-400 uppercase block font-bold">
                        WHATSAPP VERIFICATION LINE
                      </span>
                      <span className="font-bold text-emerald-400 font-mono">
                        {WHATSAPP_CONFIG.DISPLAY_PHONE}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 text-[11px] text-emerald-300 space-y-1">
                  <p className="font-bold">⚡ How it works:</p>
                  <p className="text-neutral-300">
                    1. Click below to submit your order (it automatically saves in our system).
                  </p>
                  <p className="text-neutral-300">
                    2. Transfer <strong>{formatNaira(total)}</strong> to <strong>{WHATSAPP_CONFIG.ACCOUNT_NAME} ({WHATSAPP_CONFIG.ACCOUNT_NUMBER})</strong>.
                  </p>
                  <p className="text-neutral-300">
                    3. You will be redirected to WhatsApp to send your <strong>transfer receipt</strong> for instant confirmation and dispatch!
                  </p>
                </div>
              </div>

              {/* Submit Button (Mobile & Desktop) */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-emerald-500 text-black font-black uppercase tracking-widest text-xs min-[400px]:text-sm hover:bg-emerald-400 transition-all duration-200 shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    CREATING ORDER & CONNECTING TO WHATSAPP...
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-5 h-5" />
                    ORDER & PAY {formatNaira(total)} ON WHATSAPP
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right: Authoritative Order Summary */}
          <div className="lg:col-span-5">
            <div className="bg-[#101010] border border-neutral-800 p-4 sm:p-8 space-y-6 sticky top-28">
              <h2 className="text-sm font-black uppercase tracking-widest text-[#FFE600] border-b border-neutral-800 pb-3">
                ORDER SUMMARY ({totalItems})
              </h2>

              {/* Items List Preview */}
              <div className="max-h-64 overflow-y-auto space-y-3 pr-1">
                {items.map((item) => (
                  <div key={item.key} className="flex items-center gap-3 text-xs">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-14 object-cover bg-neutral-900 flex-shrink-0"
                    />
                    <div className="flex-1 truncate">
                      <p className="font-bold text-white uppercase truncate">{item.name}</p>
                      <p className="text-[10px] text-neutral-400">
                        {item.color} / {item.size} • Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="font-bold text-white">
                      {formatNaira(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Fee Breakdown */}
              <div className="border-t border-neutral-800 pt-4 space-y-2.5 text-xs">
                <div className="flex justify-between text-neutral-300">
                  <span>Subtotal</span>
                  <span className="font-bold text-white">{formatNaira(subtotal)}</span>
                </div>

                <div className="flex justify-between text-neutral-300">
                  <span>Service Fee</span>
                  <span className="font-bold text-white">{formatNaira(serviceFee)}</span>
                </div>

                <div className="flex justify-between text-neutral-300">
                  <span>Delivery to: <strong className="text-white uppercase">{selectedCity}</strong></span>
                  <span className="font-bold text-white">{formatNaira(deliveryFee)}</span>
                </div>
              </div>

              {/* Total Calculation */}
              <div className="border-t border-neutral-800 pt-4">
                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="text-xs font-black uppercase tracking-widest text-neutral-400 block">
                      TOTAL DUE
                    </span>
                    <span className="text-[10px] text-neutral-500">
                      Authoritative backend verified
                    </span>
                  </div>
                  <span className="text-2xl font-black text-[#FFE600]">
                    {formatNaira(total)}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-400 flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#FFE600] flex-shrink-0" />
                <span>Estimated Delivery: 24 - 48 Hours within Lagos & Ibadan. 48 - 72 Hours to Abuja.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
