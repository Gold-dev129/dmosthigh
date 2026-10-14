import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatNaira } from '../../utils/formatters.js';

export const ProductCard = ({ product }) => {
  const images =
    product.images && product.images.length > 0
      ? product.images
      : [
          {
            url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
            color: 'Standard',
          },
        ];

  // Derive uploaded colors directly from product images
  const uploadedImageColors = Array.from(
    new Set(images.map((img) => img.color?.trim()).filter(Boolean))
  );

  // If only one color is uploaded (or only 1 image uploaded), strictly allow only that 1 color!
  let colors = [];
  if (images.length === 1) {
    const singleColor = images[0].color?.trim() || product.colors?.[0] || 'Standard';
    colors = [singleColor];
  } else if (uploadedImageColors.length === 1) {
    colors = uploadedImageColors;
  } else if (uploadedImageColors.length > 1) {
    colors = uploadedImageColors;
  } else if (product.colors && product.colors.length > 0) {
    colors = product.colors;
  } else {
    colors = ['Standard'];
  }

  const [selectedColor, setSelectedColor] = useState(colors[0] || 'Standard');
  const [currentIndex, setCurrentIndex] = useState(0);

  // Sync selectedColor if product or colors update
  useEffect(() => {
    if (colors.length > 0) {
      if (!selectedColor || !colors.some((c) => c.toLowerCase() === selectedColor.toLowerCase())) {
        setSelectedColor(colors[0]);
      }
    }
  }, [colors, selectedColor]);

  const hasMultipleImages = images.length > 1;

  // Sync color selection to carousel image
  const handleColorSelect = (color) => {
    setSelectedColor(color);
    const matchedIdx = images.findIndex(
      (img) => img.color && img.color.toLowerCase() === color.toLowerCase()
    );
    if (matchedIdx !== -1) {
      setCurrentIndex(matchedIdx);
    }
  };

  // Sync carousel slide to color selection
  const handlePrev = () => {
    const nextIdx = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    setCurrentIndex(nextIdx);
    if (images[nextIdx]?.color) {
      setSelectedColor(images[nextIdx].color);
    }
  };

  const handleNext = () => {
    const nextIdx = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
    setCurrentIndex(nextIdx);
    if (images[nextIdx]?.color) {
      setSelectedColor(images[nextIdx].color);
    }
  };

  const handleDotClick = (idx) => {
    setCurrentIndex(idx);
    if (images[idx]?.color) {
      setSelectedColor(images[idx].color);
    }
  };

  const currentImage = images[currentIndex] || images[0];

  const hasDiscount =
    product.discountPrice !== null &&
    product.discountPrice !== undefined &&
    product.discountPrice > 0 &&
    product.discountPrice < product.price;

  const currentPrice = hasDiscount ? product.discountPrice : product.price;

  return (
    <div className="group flex flex-col bg-white border border-neutral-200 hover:border-yellow-400 hover:shadow-lg transition-all duration-300 rounded-lg overflow-hidden relative">
      {/* Badges Overlay */}
      <div className="absolute top-2.5 left-2.5 z-20 flex flex-col gap-1 pointer-events-none">
        {hasDiscount && (
          <span className="bg-[#FFE600] text-black font-black text-[10px] tracking-wider px-2 py-0.5 uppercase shadow-sm rounded-sm">
            {product.discountPercentage ? `-${product.discountPercentage}%` : 'SALE'}
          </span>
        )}
        {product.featured && (
          <span className="bg-neutral-900 text-white font-bold text-[9px] tracking-widest px-1.5 py-0.5 uppercase rounded-sm shadow-sm">
            FEATURED
          </span>
        )}
      </div>

      {/* Image Counter Badge if 2+ images */}
      {hasMultipleImages && (
        <div className="absolute top-2.5 right-2.5 z-20 bg-black/60 backdrop-blur-sm text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm pointer-events-none">
          {currentIndex + 1}/{images.length}
        </div>
      )}

      {/* Image Container with Responsive Height & Touch-Friendly Carousel Controls */}
      <div className="relative h-48 min-[360px]:h-52 sm:h-60 md:h-64 lg:h-72 w-full bg-[#f8f8f8] overflow-hidden flex items-center justify-center p-2">
        <Link
          to={`/product/${product._id}`}
          className="w-full h-full flex items-center justify-center"
        >
          <img
            src={currentImage.url}
            alt={`${product.name} - ${selectedColor}`}
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80';
            }}
            className="w-full h-full object-contain object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        </Link>

        {/* Carousel Navigation Arrows if 2+ images (touch-friendly on mobile, hover on desktop) */}
        {hasMultipleImages && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handlePrev();
              }}
              aria-label="Previous image"
              className="absolute left-1 sm:left-1.5 top-1/2 -translate-y-1/2 z-20 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/90 hover:bg-white text-neutral-800 hover:text-black shadow-md flex items-center justify-center transition-all opacity-85 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
            >
              <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleNext();
              }}
              aria-label="Next image"
              className="absolute right-1 sm:right-1.5 top-1/2 -translate-y-1/2 z-20 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/90 hover:bg-white text-neutral-800 hover:text-black shadow-md flex items-center justify-center transition-all opacity-85 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
            >
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Dot Indicators */}
            <div className="absolute bottom-1.5 sm:bottom-2 inset-x-0 z-20 flex justify-center items-center gap-1 sm:gap-1.5 pointer-events-auto">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDotClick(idx);
                  }}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`transition-all duration-200 ${
                    idx === currentIndex
                      ? 'w-3 sm:w-3.5 h-1 sm:h-1.5 rounded-full bg-[#FFE600] shadow'
                      : 'w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-black/30 hover:bg-black/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Card Details */}
      <div className="p-2.5 min-[380px]:p-3 sm:p-4 flex flex-col flex-1 justify-between gap-2">
        <div>
          {/* Color Selector Pills / Swatches */}
          {colors.length > 1 && (
            <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 mb-1.5 sm:mb-2">
              {colors.map((c) => {
                const isSelected = c.toLowerCase() === selectedColor.toLowerCase();
                const isYellow = c.toLowerCase().includes('yellow');
                const isBlack = c.toLowerCase().includes('black');
                const isWhite = c.toLowerCase().includes('white');

                return (
                  <button
                    key={c}
                    type="button"
                    title={`View in ${c}`}
                    onClick={() => handleColorSelect(c)}
                    className={`text-[9px] sm:text-[10px] uppercase font-bold px-1.5 sm:px-2 py-0.5 rounded border transition-all ${
                      isSelected
                        ? 'border-yellow-500 text-neutral-900 bg-yellow-50 ring-1 ring-yellow-400 font-extrabold'
                        : 'border-neutral-200 text-neutral-600 hover:border-neutral-400 bg-neutral-50'
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      <span
                        className={`w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full inline-block border border-neutral-300 ${
                          isYellow
                            ? 'bg-[#FFE600]'
                            : isBlack
                            ? 'bg-black'
                            : isWhite
                            ? 'bg-white'
                            : 'bg-neutral-400'
                        }`}
                      />
                      <span className="truncate max-w-[60px] sm:max-w-none">{c}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Product Name */}
          <Link
            to={`/product/${product._id}`}
            className="block font-black text-xs sm:text-sm uppercase tracking-tight text-neutral-900 group-hover:text-yellow-600 transition-colors line-clamp-1"
          >
            {product.name}
          </Link>

          {/* Category Tag */}
          <p className="text-[9px] sm:text-[10px] text-neutral-500 uppercase tracking-widest mt-0.5 truncate">
            {product.category || 'Apparel'}
          </p>
        </div>

        {/* Pricing & Action */}
        <div className="flex flex-wrap items-baseline justify-between gap-1 pt-1.5 sm:pt-2 border-t border-neutral-100">
          <div className="flex items-baseline gap-1 sm:gap-1.5">
            {hasDiscount ? (
              <>
                <span className="font-black text-xs min-[380px]:text-sm sm:text-base text-neutral-950">
                  {formatNaira(currentPrice)}
                </span>
                <span className="text-[9px] sm:text-xs text-neutral-400 line-through">
                  {formatNaira(product.price)}
                </span>
              </>
            ) : (
              <span className="font-black text-xs min-[380px]:text-sm sm:text-base text-neutral-950">
                {formatNaira(currentPrice)}
              </span>
            )}
          </div>

          <Link
            to={`/product/${product._id}`}
            className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-neutral-900 hover:text-yellow-600 transition-colors ml-auto"
          >
            <span>VIEW PIECE</span>
            <span className="text-[#FFE600] font-black">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
