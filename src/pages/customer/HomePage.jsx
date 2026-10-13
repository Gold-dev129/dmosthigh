import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productService } from '../../api/productService.js';
import { ProductCard } from '../../components/common/ProductCard.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { SlidersHorizontal, X, Sparkles, Truck } from 'lucide-react';

export const HomePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentSearch = searchParams.get('search') || '';
  const currentSort = searchParams.get('sort') || 'newest';

  // Instant direct frontend initialization - zero network delay, no fetching spinner
  const [products, setProducts] = useState(() => {
    const initial = productService.getProductsSync({ search: currentSearch, sort: currentSort });
    return initial.products || [];
  });

  const sortOptions = [
    { label: 'LATEST ARRIVALS', value: 'newest' },
    { label: 'PRICE: LOW TO HIGH', value: 'price-low' },
    { label: 'PRICE: HIGH TO LOW', value: 'price-high' },
    { label: 'NAME: A-Z', value: 'name-asc' },
  ];

  useEffect(() => {
    const data = productService.getProductsSync({
      search: currentSearch,
      sort: currentSort,
    });
    setProducts(data.products || []);
  }, [currentSearch, currentSort]);

  const handleSortChange = (sortValue) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('sort', sortValue);
    setSearchParams(nextParams);
  };

  const clearSearch = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('search');
    setSearchParams(nextParams);
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      {/* Light Hero / Storefront Header */}
      <section className="bg-gradient-to-b from-yellow-50/60 via-white to-white border-b border-neutral-200">
        <div className="max-w-7xl 2xl:max-w-[1700px] mx-auto px-2.5 min-[380px]:px-4 sm:px-6 lg:px-8 py-5 sm:py-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 sm:gap-2 mb-2 px-2.5 sm:px-3 py-1 bg-[#FFE600]/25 border border-yellow-400/60 text-neutral-900 text-[10px] min-[380px]:text-[11px] sm:text-xs font-black uppercase tracking-wider rounded-full shadow-sm">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#FFE600] animate-ping" />
                <span>OFFICIAL STOREFRONT</span>
              </div>
              <h1 className="text-xl min-[360px]:text-2xl min-[480px]:text-3xl sm:text-4xl md:text-5xl 2xl:text-6xl font-black uppercase tracking-tight text-neutral-950 flex items-center gap-2">
                <span>D.MOST.HIGH</span>
              </h1>
              <p className="text-neutral-600 text-xs sm:text-sm mt-1 uppercase tracking-wider max-w-lg font-medium">
                High-end contemporary streetwear engineered with luxury textiles and bold silhouettes.
              </p>

              {/* Delivery Notice Banner */}
              <div className="mt-2.5 sm:mt-3 inline-flex flex-wrap items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 bg-[#FFE600] text-black text-[10px] min-[380px]:text-[11px] sm:text-xs font-black uppercase tracking-wider rounded shadow-sm">
                <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black flex-shrink-0" />
                <span>⚡ NATIONWIDE DELIVERY (1-2 WEEKS) • IBADAN (₦4,000) • OUTSIDE IBADAN (₦6,000)</span>
              </div>
            </div>

            {/* Collection Counter */}
            <div className="flex items-center gap-2.5 sm:gap-3 bg-neutral-50 border border-neutral-200 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg shadow-sm self-start md:self-auto">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 flex-shrink-0" />
              <div className="text-left md:text-right">
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-neutral-500 block">
                  COLLECTION
                </span>
                <p className="text-lg sm:text-2xl font-black text-neutral-950 leading-none">
                  {products.length} <span className="text-[10px] sm:text-xs text-yellow-600 font-bold">PIECES</span>
                </p>
              </div>
            </div>
          </div>

          {/* Active Search Filter Badge */}
          {currentSearch && (
            <div className="mt-3 sm:mt-4 flex items-center gap-2">
              <span className="text-xs font-medium text-neutral-500">Filtered by:</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFE600] text-black text-xs font-black uppercase tracking-wider rounded shadow-sm">
                "{currentSearch}"
                <button onClick={clearSearch} className="hover:opacity-75" title="Clear search">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Control Bar: Clean Sort & Status */}
      <section className="sticky top-14 min-[380px]:top-16 md:top-20 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200 py-2 sm:py-3.5">
        <div className="max-w-7xl 2xl:max-w-[1700px] mx-auto px-2.5 min-[380px]:px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-4">
            {/* Left Status Label */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="inline-flex items-center gap-1 sm:gap-1.5 text-[10px] min-[380px]:text-[11px] sm:text-xs font-black tracking-widest uppercase text-neutral-900 bg-yellow-100/70 border border-yellow-300 px-2 sm:px-3 py-1 sm:py-1.5 rounded">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFE600]" />
                ALL PRODUCTS
              </span>
              <span className="text-[10px] sm:text-xs text-neutral-500 hidden sm:inline">
                • Direct Instant Catalog
              </span>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
              <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-500 flex-shrink-0" />
              <select
                value={currentSort}
                onChange={(e) => handleSortChange(e.target.value)}
                className="bg-neutral-50 hover:bg-white border border-neutral-300 text-neutral-900 text-[10px] min-[380px]:text-[11px] sm:text-xs font-bold uppercase tracking-wider px-2 sm:px-3 py-1 sm:py-1.5 rounded shadow-sm focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-400 transition-colors"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Immediate Product Grid Section */}
      <section className="max-w-7xl 2xl:max-w-[1700px] mx-auto px-2.5 min-[380px]:px-4 sm:px-6 lg:px-8 py-5 sm:py-10 md:py-12">
        {products.length === 0 ? (
          <EmptyState
            title="No Products Found"
            description="There are currently no items matching your criteria."
            actionText="Reset Filters"
            onAction={() => setSearchParams({})}
          />
        ) : (
          <div className="grid grid-cols-1 min-[360px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-2.5 min-[380px]:gap-3 sm:gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

