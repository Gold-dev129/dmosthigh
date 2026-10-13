import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-[#050505] border-t border-neutral-900 text-neutral-400 text-xs py-10 sm:py-14">
      <div className="max-w-7xl 2xl:max-w-[1700px] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 md:gap-10">
          {/* Brand Col */}
          <div className="sm:col-span-2 space-y-3 sm:space-y-4">
            <Link to="/" className="flex items-center gap-1">
              <span className="font-black text-xl min-[380px]:text-2xl tracking-tighter text-white">
                D.MOST.HIGH
              </span>
              <span className="w-2 h-2 rounded-full bg-[#FFE600] inline-block mb-1" />
            </Link>
            <p className="text-neutral-500 max-w-md text-xs leading-relaxed uppercase tracking-wider">
              Limited streetwear collections crafted from high-gsm luxury fabrics. Engineered for the bold, the underground, and the elevated.
            </p>
            <div className="pt-1 text-[11px] text-neutral-400 leading-normal">
              <span className="text-[#FFE600] font-bold">NATIONWIDE DELIVERY (1-2 WEEKS):</span> Ibadan (₦6,000) • Lagos (₦7,000) • Abuja (₦8,500)
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-white font-black uppercase tracking-widest text-xs mb-4">
              COLLECTION
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/" className="hover:text-[#FFE600] transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-[#FFE600] transition-colors">
                  Latest Arrivals
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-[#FFE600] transition-colors">
                  Order Verification
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-[#FFE600] transition-colors">
                  Shopping Bag
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-white font-black uppercase tracking-widest text-xs mb-4">
              CLIENT SERVICES
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/orders" className="hover:text-[#FFE600] transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-[#FFE600] transition-colors">
                  Shopping Bag
                </Link>
              </li>
              <li>
                <Link to="/account" className="hover:text-[#FFE600] transition-colors">
                  Account Dashboard
                </Link>
              </li>
              <li>
                <a href="#delivery" className="hover:text-[#FFE600] transition-colors">
                  Shipping Rates
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-6 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between text-neutral-600 text-[11px]">
          <p>© {new Date().getFullYear()} D.MOST.HIGH STREETWEAR. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-4 mt-4 sm:mt-0">
            <span>SECURE CHECKOUT VIA PAYSTACK</span>
            <span>•</span>
            <span>NIGERIA</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
