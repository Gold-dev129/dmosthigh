import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productService } from '../../api/productService.js';
import { useCart } from '../../context/CartContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { formatNaira, DELIVERY_FEES, SERVICE_FEE } from '../../utils/formatters.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  Plus,
  Minus,
  ArrowLeft,
  Share2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { success, error: toastError } = useToast();

  const initialProduct = productService.getProductByIdSync(id);
  const [product, setProduct] = useState(initialProduct);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [selectedColor, setSelectedColor] = useState(() => {
    return initialProduct?.colors?.[0] || 'Black';
  });
  const [selectedSize, setSelectedSize] = useState(() => {
    return initialProduct?.sizes?.length === 1 ? initialProduct.sizes[0] : '';
  });
  const [quantity, setQuantity] = useState(1);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    const data = productService.getProductByIdSync(id);
    if (data) {
      setProduct(data);
      if (data.colors && data.colors.length > 0) {
        setSelectedColor(data.colors[0]);
      }
      if (data.sizes && data.sizes.length === 1) {
        setSelectedSize(data.sizes[0]);
      }
    } else {
      setError('Product not found.');
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#0A0A0A]">
        <LoadingSpinner text="LOADING PRODUCT DETAILS..." size="lg" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#0A0A0A] p-4">
        <EmptyState
          title="Product Unavailable"
          description={error || 'The requested product does not exist.'}
          actionText="Back to Storefront"
          actionLink="/"
        />
      </div>
    );
  }

  const colors = product.colors && product.colors.length > 0 ? product.colors : ['Black'];
  const sizes = product.sizes && product.sizes.length > 0 ? product.sizes : ['Standard'];

  const images =
    product.images && product.images.length > 0
      ? product.images
      : [
          {
            url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=1000&auto=format&fit=crop&q=80',
            color: 'Standard',
          },
        ];

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Sync color selection to carousel index
  const handleColorSelect = (color) => {
    setSelectedColor(color);
    setValidationError('');
    const matchedIdx = images.findIndex(
      (img) => img.color && img.color.toLowerCase() === color.toLowerCase()
    );
    if (matchedIdx !== -1) {
      setActiveImageIndex(matchedIdx);
    }
  };

  const handlePrevImage = () => {
    const nextIdx = activeImageIndex === 0 ? images.length - 1 : activeImageIndex - 1;
    setActiveImageIndex(nextIdx);
    if (images[nextIdx]?.color) {
      setSelectedColor(images[nextIdx].color);
    }
  };

  const handleNextImage = () => {
    const nextIdx = activeImageIndex === images.length - 1 ? 0 : activeImageIndex + 1;
    setActiveImageIndex(nextIdx);
    if (images[nextIdx]?.color) {
      setSelectedColor(images[nextIdx].color);
    }
  };

  const getActiveImage = () => {
    return images[activeImageIndex]?.url || images[0]?.url;
  };

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
    setValidationError('');
  };

  const handleAddToCart = () => {
    if (!selectedColor && colors.length > 0) {
      setValidationError('Please select an available color.');
      return;
    }
    if (!selectedSize && sizes.length > 0) {
      setValidationError('Please select a size to continue.');
      return;
    }

    const currentImg = getActiveImage();
    addToCart(product, selectedColor, selectedSize, quantity, currentImg);
    success(`Added "${product.name}" (${selectedColor} / ${selectedSize}) to your bag!`);
  };

  const hasDiscount =
    product.discountPrice !== null &&
    product.discountPrice !== undefined &&
    product.discountPrice > 0 &&
    product.discountPrice < product.price;

  const currentPrice = hasDiscount ? product.discountPrice : product.price;
  const hasMultipleImages = images.length > 1;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Breadcrumb Navigation */}
      <div className="border-b border-neutral-900 bg-[#0C0C0C]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-[#FFE600] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            BACK TO STOREFRONT
          </Link>
        </div>
      </div>

      {/* Main Product Container */}
      <div className="max-w-7xl 2xl:max-w-[1700px] mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12">
          {/* Left Column: Product Imagery with Carousel */}
          <div className="lg:col-span-7 flex flex-col gap-3 sm:gap-4">
            {/* Primary Hero Image with Carousel Controls */}
            <div className="relative h-[280px] min-[360px]:h-[320px] min-[420px]:h-[360px] sm:h-[420px] md:h-[480px] lg:h-[540px] 2xl:h-[620px] w-full bg-neutral-950 border border-neutral-800 rounded-lg overflow-hidden group flex items-center justify-center">
              <img
                src={getActiveImage()}
                alt={`${product.name} - ${selectedColor}`}
                className="w-full h-full object-cover object-center transition-all duration-300"
              />

              {/* Badges */}
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex flex-col gap-1.5 sm:gap-2 pointer-events-none z-10">
                {hasDiscount && (
                  <span className="bg-[#FFE600] text-black font-black text-[10px] sm:text-xs tracking-wider px-2 sm:px-2.5 py-0.5 sm:py-1 uppercase shadow-md rounded-sm">
                    {product.discountPercentage ? `-${product.discountPercentage}% OFF` : 'SALE'}
                  </span>
                )}
                <span className="bg-black/90 backdrop-blur-sm border border-neutral-700 text-white font-bold text-[9px] sm:text-[10px] tracking-widest px-1.5 sm:px-2 py-0.5 uppercase rounded-sm">
                  COLOR: {selectedColor}
                </span>
              </div>

              {/* Carousel Counter */}
              {hasMultipleImages && (
                <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 bg-black/75 backdrop-blur-sm text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-sm">
                  {activeImageIndex + 1}/{images.length}
                </div>
              )}

              {/* Carousel Arrows if 2+ images */}
              {hasMultipleImages && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevImage}
                    aria-label="Previous image"
                    className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/60 hover:bg-black/90 text-white hover:text-[#FFE600] border border-neutral-700 flex items-center justify-center transition-all"
                  >
                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextImage}
                    aria-label="Next image"
                    className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/60 hover:bg-black/90 text-white hover:text-[#FFE600] border border-neutral-700 flex items-center justify-center transition-all"
                  >
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>

                  {/* Carousel Dot Indicators */}
                  <div className="absolute bottom-2.5 sm:bottom-3 inset-x-0 z-20 flex justify-center items-center gap-1.5 sm:gap-2">
                    {images.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setActiveImageIndex(idx);
                          if (images[idx]?.color) setSelectedColor(images[idx].color);
                        }}
                        aria-label={`Go to slide ${idx + 1}`}
                        className={`transition-all ${
                          idx === activeImageIndex
                            ? 'w-4 sm:w-5 h-1 sm:h-1.5 rounded-full bg-[#FFE600]'
                            : 'w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-white/50 hover:bg-white'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail Gallery & Color association preview */}
            {hasMultipleImages && (
              <div className="flex sm:grid sm:grid-cols-4 overflow-x-auto gap-2 sm:gap-3 pb-1 sm:pb-0">
                {images.map((img, idx) => {
                  const isActive = activeImageIndex === idx;
                  const imgColor = img.color || colors[idx] || `Color ${idx + 1}`;

                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setActiveImageIndex(idx);
                        if (img.color) {
                          setSelectedColor(img.color);
                        } else if (colors[idx]) {
                          setSelectedColor(colors[idx]);
                        }
                      }}
                      className={`relative w-20 min-[380px]:w-24 sm:w-auto flex-shrink-0 sm:flex-shrink h-20 sm:h-24 border rounded-md overflow-hidden transition-all ${
                        isActive
                          ? 'border-[#FFE600] ring-2 ring-[#FFE600]/40'
                          : 'border-neutral-800 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={`Preview ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 inset-x-0 bg-black/80 py-0.5 text-[9px] font-bold uppercase text-center text-neutral-300 truncate px-1">
                        {imgColor}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Specifications & Checkout Action */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div className="space-y-6">
              {/* Category & Title */}
              <div>
                <span className="text-[11px] font-black uppercase tracking-widest text-[#FFE600]">
                  {product.category || 'CONTEMPORARY STREETWEAR'}
                </span>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight text-white mt-1">
                  {product.name}
                </h1>

                {/* Pricing Display */}
                <div className="mt-3 flex items-baseline gap-3">
                  <span className="text-2xl sm:text-3xl font-black text-[#FFE600]">
                    {formatNaira(currentPrice)}
                  </span>
                  {hasDiscount && (
                    <span className="text-sm sm:text-base text-neutral-500 line-through">
                      {formatNaira(product.price)}
                    </span>
                  )}
                </div>
              </div>

              {/* Color Selection (Switches Image Immediately) */}
              <div className="border-t border-neutral-850 pt-5">
                <div className="flex justify-between items-center mb-2.5">
                  <span className="text-xs font-black uppercase tracking-widest text-neutral-300">
                    SELECT COLOR: <span className="text-[#FFE600]">{selectedColor}</span>
                  </span>
                  <span className="text-[10px] text-neutral-500 uppercase">
                    Image updates with color
                  </span>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {colors.map((c) => {
                    const isSelected = selectedColor.toLowerCase() === c.toLowerCase();
                    const isYellow = c.toLowerCase().includes('yellow');
                    const isBlack = c.toLowerCase().includes('black');
                    const isWhite = c.toLowerCase().includes('white');

                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => handleColorSelect(c)}
                        className={`flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-wider border transition-all duration-200 ${
                          isSelected
                            ? 'border-[#FFE600] bg-[#FFE600] text-black shadow-lg scale-105'
                            : 'border-neutral-700 bg-neutral-900 text-neutral-300 hover:border-neutral-500'
                        }`}
                      >
                        <span
                          className={`w-3 h-3 rounded-full border border-black/30 ${
                            isYellow
                              ? 'bg-yellow-400'
                              : isBlack
                              ? 'bg-black'
                              : isWhite
                              ? 'bg-white'
                              : 'bg-neutral-400'
                          }`}
                        />
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Size Selection */}
              <div className="border-t border-neutral-850 pt-5">
                <div className="flex justify-between items-center mb-2.5">
                  <span className="text-xs font-black uppercase tracking-widest text-neutral-300">
                    SELECT SIZE: <span className="text-[#FFE600]">{selectedSize || 'Choose Size'}</span>
                  </span>
                  <span className="text-[10px] text-neutral-500 uppercase">
                    Streetwear Oversized Cut
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {sizes.map((s) => {
                    const isSelected = selectedSize.toUpperCase() === s.toUpperCase();
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleSizeSelect(s)}
                        className={`py-2.5 text-xs font-black uppercase tracking-wider border transition-all text-center ${
                          isSelected
                            ? 'border-[#FFE600] bg-[#FFE600] text-black'
                            : 'border-neutral-800 bg-neutral-900 text-neutral-300 hover:border-neutral-600'
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity Selector & Stock Status */}
              <div className="border-t border-neutral-850 pt-5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-black uppercase tracking-widest text-neutral-300 block mb-2">
                    QUANTITY
                  </span>
                  <div className="flex items-center border border-neutral-700 bg-neutral-900">
                    <button
                      type="button"
                      disabled={quantity <= 1}
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="p-2 text-neutral-400 hover:text-white disabled:opacity-30"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-4 text-xs font-black text-white min-w-[36px] text-center">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      className="p-2 text-neutral-400 hover:text-white"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Validation Error Message */}
              {validationError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider">
                  ⚠️ {validationError}
                </div>
              )}

              {/* Add to Bag Action Button */}
              <div className="pt-2 space-y-2.5">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="w-full py-4 text-xs font-black uppercase tracking-widest transition-all duration-200 shadow-xl bg-[#FFE600] text-black hover:bg-yellow-400 hover:shadow-[#FFE600]/20 active:scale-[0.99]"
                >
                  ADD TO SHOPPING BAG
                </button>

                {/* Prominent Delivery Guarantee Notice */}
                <div className="p-3 bg-[#FFE600]/10 border border-[#FFE600]/40 flex items-center justify-center gap-2 text-xs text-[#FFE600] font-black uppercase tracking-wider rounded-sm">
                  <Truck className="w-4 h-4 flex-shrink-0" />
                  <span>⚡ DELIVERY WITHIN 1-2 WEEKS NATIONWIDE</span>
                </div>
              </div>

              {/* Product Description */}
              <div className="border-t border-neutral-850 pt-5 space-y-2">
                <h3 className="text-xs font-black uppercase tracking-widest text-white">
                  PRODUCT SPECIFICATIONS
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>

              {/* Delivery Rates Breakdown Card */}
              <div className="p-4 bg-neutral-900/60 border border-neutral-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#FFE600]">
                    <Truck className="w-4 h-4" />
                    NATIONWIDE DELIVERY SCHEDULE
                  </div>
                  <span className="text-[10px] bg-[#FFE600] text-black font-black uppercase px-2 py-0.5 rounded-sm">
                    1-2 WEEKS
                  </span>
                </div>

                <div className="text-[11px] text-neutral-300 font-bold bg-black/40 p-2 border border-neutral-800 rounded-sm">
                  ⚡ Estimated nationwide delivery time: <span className="text-[#FFE600]">1-2 weeks</span> from payment verification.
                </div>

                <div className="grid grid-cols-3 gap-2 text-[11px] pt-1 border-t border-neutral-800">
                  <div>
                    <span className="text-neutral-400 block font-medium">IBADAN</span>
                    <span className="font-bold text-white">{formatNaira(DELIVERY_FEES.Ibadan)}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block font-medium">LAGOS</span>
                    <span className="font-bold text-white">{formatNaira(DELIVERY_FEES.Lagos)}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block font-medium">ABUJA</span>
                    <span className="font-bold text-white">{formatNaira(DELIVERY_FEES.Abuja)}</span>
                  </div>
                </div>
                <p className="text-[10px] text-neutral-500 pt-1">
                  Service processing fee: <strong className="text-neutral-300">₦{SERVICE_FEE.toLocaleString()}</strong> added at checkout.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
